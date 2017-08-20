zebkit.package("io", function(pkg, Class) {
    /**
     * The module provides number of classes to help to communicate with remote services and servers by HTTP,
     * JSON-RPC, XML-RPC protocols.
     *
     *       // shortcut method to perform HTTP GET request
     *       zebkit.io.GET("http://test.com").then(function(req) {
     *           // handle request
     *           req.responseText
     *           ...
     *       }).catch(function(exception) {
     *           // handle error
     *       });
     *
     * @class zebkit.io
     * @access package
     */

    // TODO: Web dependencies:
    //    -- Uint8Array
    //    -- ArrayBuffer

    // !!!
    // b64 is supposed to be used with binary stuff, applying it to utf-8 encoded data can bring to error
    // !!!

    var HEX    = "0123456789ABCDEF",
        b64str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    /**
     * Generate UUID of the given length
     * @param {Integer} [size] the generated UUID length. The default size is 16 characters.
     * @return {String} an UUID
     * @method  UID
     * @for  zebkit.io
     */
    pkg.UID = function(size) {
        if (arguments.length === 0) {
            size = 16;
        }
        var id = "";
        for (var i = 0; i < size; i++) {
            id = id + HEX[~~(Math.random() * 16)];
        }
        return id;
    };

    /**
     * Encode the given string into base64
     * @param  {String} input a string to be encoded
     * @method  b64encode
     * @for zebkit.io
     */
    pkg.b64encode = function(input) {
        var out = [], i = 0, len = input.length, c1, c2, c3;
        if (typeof ArrayBuffer !== "undefined") {
            if (input instanceof ArrayBuffer) {
                input = new Uint8Array(input);
            }
            input.charCodeAt = function(i) { return this[i]; };
        }

        if (Array.isArray(input)) {
            input.charCodeAt = function(i) { return this[i]; };
        }

        while(i < len) {
            c1 = input.charCodeAt(i++) & 0xff;
            out.push(b64str.charAt(c1 >> 2));
            if (i === len) {
                out.push(b64str.charAt((c1 & 0x3) << 4), "==");
                break;
            }

            c2 = input.charCodeAt(i++);
            out.push(b64str.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)));
            if (i === len) {
                out.push(b64str.charAt((c2 & 0xF) << 2), "=");
                break;
            }

            c3 = input.charCodeAt(i++);
            out.push(b64str.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6)), b64str.charAt(c3 & 0x3F));
        }

        return out.join('');
    };

    /**
     * Decode the base64 encoded string
     * @param {String} input base64 encoded string
     * @return {String} a string
     * @for zebkit.io
     * @method b64decode
     */
    pkg.b64decode = function(input) {
        var output = [], chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while ((input.length % 4) !== 0) {
            input += "=";
        }

        for(var i=0; i < input.length;) {
            enc1 = b64str.indexOf(input.charAt(i++));
            enc2 = b64str.indexOf(input.charAt(i++));
            enc3 = b64str.indexOf(input.charAt(i++));
            enc4 = b64str.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output.push(String.fromCharCode(chr1));
            if (enc3 !== 64) {
                output.push(String.fromCharCode(chr2));
            }
            if (enc4 !== 64) {
                output.push(String.fromCharCode(chr3));
            }
        }
        return output.join('');
    };

    pkg.dateToISO8601 = function(d) {
        function pad(n) { return n < 10 ? '0'+ n : n; }
        return [ d.getUTCFullYear(), '-', pad(d.getUTCMonth()+1), '-', pad(d.getUTCDate()), 'T', pad(d.getUTCHours()), ':',
                 pad(d.getUTCMinutes()), ':', pad(d.getUTCSeconds()), 'Z'].join('');
    };

    // http://webcloud.se/log/JavaScript-and-ISO-8601/
    pkg.ISO8601toDate = function(v) {
        var regexp = ["([0-9]{4})(-([0-9]{2})(-([0-9]{2})", "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?",
                      "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?"].join(''), d = v.match(new RegExp(regexp)),
                      offset = 0, date = new Date(d[1], 0, 1);

        if (d[3]) {
            date.setMonth(d[3] - 1);
        }

        if (d[5]) {
            date.setDate(d[5]);
        }

        if (d[7])  {
            date.setHours(d[7]);
        }

        if (d[8])  {
            date.setMinutes(d[8]);
        }

        if (d[10]) {
            date.setSeconds(d[10]);
        }

        if (d[12]) {
            date.setMilliseconds(Number("0." + d[12]) * 1000);
        }

        if (d[14]) {
            offset = (Number(d[16]) * 60) + Number(d[17]);
            offset *= ((d[15] === '-') ? 1 : -1);
        }

        offset -= date.getTimezoneOffset();
        date.setTime(Number(date) + (offset * 60 * 1000));
        return date;
    };

    /**
     * HTTP request class. This class provides API to generate different
     * (GET, POST, etc) HTTP requests
     * @class zebkit.io.HTTP
     * @constructor
     * @param {String} url an URL to a HTTP resource
     */
    pkg.HTTP = Class([
        function(url) {
            this.url = url;
            this.header = {};
        },

        function $prototype() {
            /**
             * Perform HTTP GET request with the given query parameters.
             * @param {Object} [q] a dictionary of query parameters
             * @return {zebkit.DoIt} an object to get response
             * @example
             *
             *     // GET request with the number of query parameters
             *     var result = zebkit.io.HTTP("google.com").GET({
             *         param1: "var1",
             *         param3: "var2",
             *         param3: "var3"
             *     }).then(function(req) {
             *         // handle response
             *         req.responseText;
             *     }).catch(function(e)  {
             *         // handle error
             *         ...
             *     });
             *
             * @method GET
             */
            this.GET = function(q) {
                var u = this.url + ((arguments.length === 0 || q === null) ? ''
                                                                           : ((this.url.indexOf("?") > 0) ? '&'
                                                                                                          : '?') + zebkit.URI.toQS(q, true));
                return this.SEND("GET", u);
            };

            /**
             * Perform HTTP POST request with the give data to be sent.
             * @param {String|Object} d a data to be sent by HTTP POST request.  It can be
             * either a parameters set or a string.
             * @return {zebkit.DoIt} an object to get response
             * @example
             *
             *     // asynchronously send POST
             *     zebkit.io.HTTP("google.com").POST("Hello").then(function(req) {
             *         // handle HTTP GET response ...
             *     }).catch(function(e) {
             *         // handle error ...
             *     });
             *
             * Or you can pass a number of parameters to be sent:
             *
             *     // send parameters synchronously by HTTP POST request
             *     zebkit.io.HTTP("google.com").POST({
             *         param1: "val1",
             *         param2: "val3",
             *         param3: "val3"
             *     }).then(function(req) {
             *          // handle HTTP GET response ...
             *     }).catch(function(e) {
             *          // handle error ...
             *    });
             *
             * @method POST
             */
            this.POST = function(d) {
                // if the passed data is simple dictionary object encode it as POST
                // parameters
                //
                // TODO: think also about changing content type
                // "application/x-www-form-urlencoded; charset=UTF-8"
                if (d !== null && zebkit.isString(d) === false && d.constructor === Object) {
                    d = zebkit.URI.toQS(d, false);
                }

                return this.SEND("POST", this.url, d);
            };

            /**
             * Universal HTTP request method that can be used to generate a HTTP request with
             * any HTTP method to the given URL with the given data to be sent asynchronously.
             * @param {String}   method   an HTTP method (GET, POST, DELETE, PUT, etc)
             * @param {String}   url      an URL
             * @param {String}   [data]   a data to be sent to the given URL
             * @return {zebkit.DoIt} an object to handle result
             * @method SEND
             */
            this.SEND = function(method, url, data) {
                var req = zebkit.environment.getHttpRequest();

                req.open(method, url, true);
                for (var k in this.header) {
                    req.setRequestHeader(k, this.header[k]);
                }

                return new zebkit.DoIt(function() {
                    var jn    = this.join(),
                        $this = this;

                    req.onreadystatechange = function() {
                        if (req.readyState === 4) {
                            // evaluate http response
                            if (req.status >= 400 || req.status < 100) {
                                var e = new Error("HTTP error '" + req.statusText + "', code = " + req.status + " '" + url + "'");
                                e.status     = req.status;
                                e.statusText = req.statusText;
                                e.readyState = req.readyState;
                                $this.error(e);
                            } else {
                                jn(req);
                            }
                        }
                    };

                    try {
                        req.send(arguments.length > 2 ? data : null);
                    } catch(e) {
                        this.error(e);
                    }
                });
            };
        }
    ]);

    /**
     * Shortcut method to perform HTTP GET requests.

        zebkit.io.GET("http://test.com").then(function(request) {
            // handle result ...
        }).catch(function(e) {
            // handle error ...
        });

        var res = zebkit.io.GET("http://test.com", {
            param1 : "var1",
            param1 : "var2",
            param1 : "var3"
        }).then(function(req) {
            // handle result ...
        });

     * @param {String|Object} url an URL
     * @param {Object} [parameters] a dictionary of query parameters
     * @return  {zebkit.DoIt} an object to handle result
     * @method GET
     * @for zebkit.io
     */
    pkg.GET = function(url) {
        var http = new pkg.HTTP(url);
        return http.GET.apply(http, Array.prototype.slice.call(arguments, 1));
    };

    /**
     * Shortcut method to perform HTTP POST requests.

        zebkit.io.POST("http://test.com", null).then(function(request) {
            // handle result
            ...
        }).catch(function(e) {
            // handle error ...
        });

        var res = zebkit.io.POST("http://test.com", {
            param1 : "var1",
            param1 : "var2",
            param1 : "var3"
        }).then(function(request) {
            // handle result
            ...
        });

        zebkit.io.POST("http://test.com", "request").then(function(request) {
            // handle error
            ...
        });

     * @param {String} url an URL
     * @param {Object} [data] a data or form data parameters
     * @return  {zebkit.DoIt} an object to handle result
     * @method  POST
     * @for zebkit.io
     */
    pkg.POST = function(url) {
        var http = new pkg.HTTP(url);
        return http.POST.apply(http, Array.prototype.slice.call(arguments, 1));
    };

    /**
     * A remote service connector class. It is supposed the class has to be extended with
     * different protocols like RPC, JSON etc. The typical pattern of connecting to
     * a remote service is shown below:

        // create service connector that has two methods "a()" and "b(param1)"
        var service = new zebkit.io.Service("http://myservice.com", [
            "a", "b"
        ]);

        // call the methods of the remote service
        service.a();
        service.b(10);

     * Also the methods of a remote service can be called asynchronously. In this case
     * a callback method has to be passed as the last argument of called remote methods:

        // create service connector that has two methods "a()" and "b(param1)"
        var service = new zebkit.io.Service("http://myservice.com", [
            "a", "b"
        ]);

        // call "b" method from the remote service asynchronously
        service.b(10, function(res) {
            // handle a result of the remote method execution here
            ...
        });
     *
     * Ideally any specific remote service extension of "zebkit.io.Service"
     * class has to implement two methods:

        - **encode** to say how the given remote method with passed parameters have
        to be transformed into a concrete service side protocol (JSON, XML, etc)
        - **decode** to say how the specific service response has to be converted into
        JavaScript object

     * @class zebkit.io.Service
     * @constructor
     * @param {String} url an URL of remote service
     * @param {Array} methods a list of methods names the remote service provides
     */
    pkg.Service = Class([
        function(url, methods) {
            var $this = this;
            /**
             * Remote service url
             * @attribute url
             * @readOnly
             * @type {String}
             */
            this.url = url;

            /**
             * Remote service methods names
             * @attribute methods
             * @readOnly
             * @type {Array}
             */
            if (Array.isArray(methods) === false) {
                methods = [ methods ];
            }

            for(var i = 0; i < methods.length; i++) {
                (function() {
                    var name = methods[i];
                    $this[name] = function() {
                        var args = Array.prototype.slice.call(arguments);
                        return this.send(url, this.encode(name, args)).then(function(req) {
                            if (req.status === 200) {
                                return $this.decode(req.responseText);
                            } else {
                                this.error(new Error("Status: " + req.status + ", '" + req.statusText + "'"));
                            }
                        });
                    };
                })();
            }
        },

        function $prototype() {
            this.contentType = null;

             /**
              * Send the given data to the given url and return a response. Callback
              * function can be passed for asynchronous result handling.
              * @protected
              * @param  {String}   url an URL
              * @param  {String}   data  a data to be send
              * @return {zebkit.DoIt}  a result
              * @method  send
              */
            this.send = function(url, data) {
                var http = new pkg.HTTP(url);
                if (this.contentType !== null) {
                    http.header['Content-Type'] = this.contentType;
                }
                return http.POST(data);
            };
        }

        /**
         * Transforms the given remote method execution with the specified parameters
         * to service specific protocol.
         * @param {String} name a remote method name
         * @param {Array} args an passed to the remote method arguments
         * @return {String} a remote service specific encoded string
         * @protected
         * @method encode
         */

        /**
         * Transforms the given remote method response to a JavaScript
         * object.
         * @param {String} name a remote method name
         * @return {Object} a result of the remote method calling as a JavaScript
         * object
         * @protected
         * @method decode
         */
    ]);

    /**
     * Build invoke method that calls a service method.
     * @param  {zebkit.Class} clazz a class
     * @param  {String} url an URL
     * @param  {String} a service method name
     * @return {Function} a wrapped method to call RPC method with
     * @private
     * @method  invoke
     * @static
     */
    pkg.Service.invoke = function(clazz, url, method) {
        var rpc = new clazz(url, method);
        return function() {
            return rpc[method].apply(rpc, arguments);
        };
    };

    /**
     * The class is implementation of JSON-RPC remote service connector.

        // create JSON-RPC connector to a remote service that
        // has three remote methods
        var service = new zebkit.io.JRPC("json-rpc.com", [
            "method1", "method2", "method3"
        ]);

        // synchronously call remote method "method1"
        service.method1();

        // asynchronously call remote method "method1"
        service.method1(function(res) {
            ...
        });

     * @class zebkit.io.JRPC
     * @constructor
     * @param {String} url an URL of remote service
     * @param {Array} methods a list of methods names the remote service provides
     * @extends zebkit.io.Service
     */
    pkg.JRPC = Class(pkg.Service, [
        function $prototype() {
            this.version     = "2.0";
            this.contentType = "application/json; charset=ISO-8859-1;";

            this.encode = function(name, args) {
                return zebkit.environment.stringifyJSON({
                    jsonrpc : this.version,
                    method  : name,
                    params  : args,
                    id      : pkg.UID() });
            };

            this.decode = function(r) {
                if (r === null || r.length === 0) {
                    throw new Error("Empty JSON result string");
                }

                r = zebkit.environment.parseJSON(r);
                if (typeof(r.error) !== "undefined") {
                    throw new Error(r.error.message);
                }

                if (typeof r.result === "undefined" || typeof r.id === "undefined") {
                    throw new Error("Wrong JSON response format");
                }
                return r.result;
            };
        }
    ]);

    /**
     * Shortcut to call the specified method of a JSON-RPC service.
     * @param  {String} url an URL
     * @param  {String} method a method name
     * @for zebkit.io.JRPC
     * @static
     * @method invoke
     */
    pkg.JRPC.invoke = function(url, method) {
        return pkg.Service.invoke(pkg.JRPC, url, method);
    };

    pkg.Base64 = function(s) {
        if (arguments.length > 0) {
            this.encoded = pkg.b64encode(s);
        }
    };

    pkg.Base64.prototype.toString = function() { return this.encoded; };
    pkg.Base64.prototype.decode   = function() { return pkg.b64decode(this.encoded); };

    /**
     * The class is implementation of XML-RPC remote service connector.

        // create XML-RPC connector to a remote service that
        // has three remote methods
        var service = new zebkit.io.XRPC("xmlrpc.com", [
            "method1", "method2", "method3"
        ]);

        // synchronously call remote method "method1"
        service.method1();

        // asynchronously call remote method "method1"
        service.method1(function(res) {
            ...
        });

     * @class zebkit.io.XRPC
     * @constructor
     * @extends zebkit.io.Service
     * @param {String} url an URL of remote service
     * @param {Array} methods a list of methods names the remote service provides
     */
    pkg.XRPC = Class(pkg.Service, [
        function $prototype() {
            this.contentType = "text/xml";

            this.encode = function(name, args) {
                var p = ["<?xml version=\"1.0\"?>\n<methodCall><methodName>", name, "</methodName><params>"];
                for(var i=0; i < args.length;i++) {
                    p.push("<param>");
                    this.encodeValue(args[i], p);
                    p.push("</param>");
                }
                p.push("</params></methodCall>");
                return p.join('');
            };

            this.encodeValue = function(v, p)  {
                if (v === null) {
                    throw new Error("Null is not allowed");
                }

                if (zebkit.isString(v)) {
                    v = v.replace("<", "&lt;");
                    v = v.replace("&", "&amp;");
                    p.push("<string>", v, "</string>");
                } else {
                    if (zebkit.isNumber(v)) {
                        if (Math.round(v) === v) {
                            p.push("<i4>", v.toString(), "</i4>");
                        } else {
                            p.push("<double>", v.toString(), "</double>");
                        }
                    } else {
                        if (zebkit.isBoolean(v)) {
                            p.push("<boolean>", v?"1":"0", "</boolean>");
                        } else {
                            if (v instanceof Date)  {
                                p.push("<dateTime.iso8601>", pkg.dateToISO8601(v), "</dateTime.iso8601>");
                            } else {
                                if (Array.isArray(v))  {
                                    p.push("<array><data>");
                                    for(var i=0;i<v.length;i++) {
                                        p.push("<value>");
                                        this.encodeValue(v[i], p);
                                        p.push("</value>");
                                    }
                                    p.push("</data></array>");
                                } else {
                                    if (v instanceof pkg.Base64) {
                                        p.push("<base64>", v.toString(), "</base64>");
                                    } else {
                                        p.push("<struct>");
                                        for (var k in v) {
                                            if (v.hasOwnProperty(k)) {
                                                p.push("<member><name>", k, "</name><value>");
                                                this.encodeValue(v[k], p);
                                                p.push("</value></member>");
                                            }
                                        }
                                        p.push("</struct>");
                                    }
                                }
                            }
                        }
                    }
                }
            };

            this.decodeValue = function (node) {
                var tag = node.tagName.toLowerCase(), i = 0;

                if (tag === "struct") {
                     var p = {};
                     for(i = 0; i < node.childNodes.length; i++) {
                        var member = node.childNodes[i],  // <member>
                            key    = member.childNodes[0].childNodes[0].nodeValue.trim(); // <name>/text()
                        p[key] = this.decodeValue(member.childNodes[1].childNodes[0]);   // <value>/<xxx>
                    }
                    return p;
                }

                if (tag === "array") {
                    var a = [];
                    node = node.childNodes[0]; // <data>
                    for(i = 0; i < node.childNodes.length; i++) {
                        a[i] = this.decodeValue(node.childNodes[i].childNodes[0]); // <value>
                    }
                    return a;
                }

                var v = node.childNodes[0].nodeValue.trim();
                switch (tag) {
                    case "datetime.iso8601": return pkg.ISO8601toDate(v);
                    case "boolean": return v === "1";
                    case "int":
                    case "i4":     return parseInt(v, 10);
                    case "double": return Number(v);
                    case "base64":
                        var b64 = new pkg.Base64();
                        b64.encoded = v;
                        return b64;
                    case "string": return v;
                }
                throw new Error("Unknown tag " + tag);
            };

            this.decode = function(r) {
                var p = zebkit.environment.parseXML(r),
                    c = p.getElementsByTagName("fault");

                if (c.length > 0) {
                    var err = this.decodeValue(c[0].getElementsByTagName("struct")[0]);
                    throw new Error(err.faultString);
                }

                c = p.getElementsByTagName("methodResponse")[0];
                c = c.childNodes[0].childNodes[0]; // <params>/<param>
                if (c.tagName.toLowerCase() === "param") {
                    return this.decodeValue(c.childNodes[0].childNodes[0]); // <value>/<xxx>
                }
                throw new Error("Incorrect XML-RPC response");
            };
        }
    ]);

    /**
     * Shortcut to call the specified method of a XML-RPC service.
     * @param  {String} url an URL
     * @param  {String} method a method name
     * @for zebkit.io.XRPC
     * @method invoke
     * @static
     */
    pkg.XRPC.invoke = function(url, method) {
        return pkg.Service.invoke(pkg.XRPC, url, method);
    };
});

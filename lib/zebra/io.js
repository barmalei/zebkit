/**
 * The module provides number of classes to help to communicate 
 * with remote services and servers by HTTP, JSON-RPC, XML-RPC
 * protocols
 * @module io
 * @requires zebra, util
 */

(function(pkg, Class) {

var HEX = "0123456789ABCDEF";

/**
 * Generate UUID of the given length
 * @param {Ineteger} [size] the generated UUID length. The default size is 16 characters.
 * @return {String} an UUID
 * @method  ID
 * @api  zebra.io.ID()
 */
pkg.ID = function UUID(size) {
    if (typeof size === 'undefined') size = 16;
    var id = [];
    for (var i=0; i<36; i++)  id[i] = HEX[~~(Math.random() * 16)];
    return id.join('');
};

pkg.sleep = function() {
    var r = new XMLHttpRequest(), t = (new Date()).getTime().toString(), i = window.location.toString().lastIndexOf("?");
    r.open('GET', window.location + (i > 0 ? "&" : "?") + t, false);
    r.send(null);
};

// !!!
// b64 is supposed to be used with binary stuff, applying it to utf-8 encoded data can bring to error
// !!!
var b64str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

/**
 * Encode the given string into base64
 * @param  {String} input a string to be encoded
 * @method  b64encode
 * @api  zebra.io.b64encode()
 */
pkg.b64encode = function(input) {
    var out = [], i = 0, len = input.length, c1, c2, c3;
    if (typeof ArrayBuffer !== "undefined") {
        if (input instanceof ArrayBuffer) input = new Uint8Array(input);
        input.charCodeAt = function(i) { return this[i]; };
    }
    if (Array.isArray(input)) input.charCodeAt = function(i) { return this[i]; };

    while(i < len) {
        c1 = input.charCodeAt(i++) & 0xff;
        out.push(b64str.charAt(c1 >> 2));
        if (i == len) {
            out.push(b64str.charAt((c1 & 0x3) << 4), "==");
            break;
        }
        c2 = input.charCodeAt(i++);
        out.push(b64str.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)));
        if (i == len) {
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
 * @api zebra.io.b64decode()
 * @method b64decode
 */
pkg.b64decode = function(input) {
    var output = [], chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while ((input.length % 4) !== 0) input += "=";

    for(var i=0; i < input.length;) {
        enc1 = b64str.indexOf(input.charAt(i++));
        enc2 = b64str.indexOf(input.charAt(i++));
        enc3 = b64str.indexOf(input.charAt(i++));
        enc4 = b64str.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output.push(String.fromCharCode(chr1));
        if (enc3 != 64) output.push(String.fromCharCode(chr2));
        if (enc4 != 64) output.push(String.fromCharCode(chr3));
    }
    return output.join('');
};

pkg.dateToISO8601 = function(d) {
    function pad(n) { return n < 10 ? '0'+n : n; }
    return [ d.getUTCFullYear(), '-', pad(d.getUTCMonth()+1), '-', pad(d.getUTCDate()), 'T', pad(d.getUTCHours()), ':',
             pad(d.getUTCMinutes()), ':', pad(d.getUTCSeconds()), 'Z'].join('');
};

// http://webcloud.se/log/JavaScript-and-ISO-8601/
pkg.ISO8601toDate = function(v) {
    var regexp = ["([0-9]{4})(-([0-9]{2})(-([0-9]{2})", "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?",
                  "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?"].join(''), d = v.match(new RegExp(regexp)),
                  offset = 0, date = new Date(d[1], 0, 1);

    if (d[3])  date.setMonth(d[3] - 1);
    if (d[5])  date.setDate(d[5]);
    if (d[7])  date.setHours(d[7]);
    if (d[8])  date.setMinutes(d[8]);
    if (d[10]) date.setSeconds(d[10]);
    if (d[12]) date.setMilliseconds(Number("0." + d[12]) * 1000);
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    date.setTime(Number(date) + (offset * 60 * 1000));
    return date;
};

pkg.parseXML = function(s) {
    function rmws(node) {
        if (node.childNodes !== null) {
            for (var i = node.childNodes.length; i-->0;) {
                var child= node.childNodes[i];
                if (child.nodeType === 3 && child.data.match(/^\s*$/)) node.removeChild(child);
                if (child.nodeType === 1) rmws(child);
            }
        }
        return node;
    }

    if (typeof DOMParser !== "undefined") return rmws((new DOMParser()).parseFromString(s, "text/xml"));
    else {
        for (var n in { "Microsoft.XMLDOM":0, "MSXML2.DOMDocument":1, "MSXML.DOMDocument":2 }) {
            var p = null;
            try {
                p = new ActiveXObject(n);
                p.async = false;
            }  catch (e) { continue; }
            if (p === null) throw new Error("XML parser is not available");
            p.loadXML(s);
            return p;
        }
    }
    throw new Error("No XML parser is available");
};

/**
 * Query string parser class. The class provides number of 
 * useful static methods to manipulate with a query string 
 * of an URL 
 * @class zebra.io.QS
 * @static
 */
pkg.QS = Class([
    function $clazz() {
        /**
         * Append the given parameters to a query string of the specified URL 
         * @param  {String} url an URL
         * @param  {Object} obj a dictionary of parameters to be appended to 
         * the URL query string 
         * @return {String} a new URL
         * @static
         * @method append
         */
        this.append = function (url, obj) {
            return url + ((obj === null) ? '' : ((url.indexOf("?") > 0) ? '&' : '?') + pkg.QS.toQS(obj, true));
        };

        /**
         * Fetch and parse query string of the given URL
         * @param  {String} url an URL
         * @return {Object} a parsed query string as a dictionary of parameters
         * @method parse
         * @static
         */
        this.parse = function(url) {
            var m = window.location.search.match(/[?&][a-zA-Z0-9_.]+=[^?&=]+/g), r = {};
            for(var i=0; m && i < m.length; i++) {
                var l = m[i].split('=');
                r[l[0].substring(1)] = decodeURIComponent(l[1]);
            }
            return r;
        };

        /**
         * Convert the given dictionary of parameters to a query string.
         * @param  {Object} obj a dictionary of parameters
         * @param  {Boolean} encode say if the parameters values have to be 
         * encoded 
         * @return {String} a query string built from parameters list
         * @static
         * @method toQS
         */
        this.toQS = function(obj, encode) {
            if (typeof encode === "undefined") encode = true;
            if (zebra.isString(obj) || zebra.isBoolean(obj) || zebra.isNumber(obj)) return "" + obj;
            var p = [];
            for(var k in obj) {
                if (obj.hasOwnProperty(k)) p.push(k + '=' + (encode ? encodeURIComponent(obj[k].toString()) : obj[k].toString()));
            }
            return p.join("&");
        };
    }
]);

function $Request() {
    this.responseText = this.statusText = "";
    this.onreadystatechange = this.responseXml = null;
    this.readyState = this.status = 0;
}

$Request.prototype.open = function(method, url, async, user, password) {
    if (location.protocol.toLowerCase() == "file:" ||
        (new zebra.URL(url)).host.toLowerCase() == location.host.toLowerCase())
    {
        this._request = new XMLHttpRequest();
        this._xdomain = false;

        var $this = this;
        this._request.onreadystatechange = function() {
            $this.readyState = $this._request.readyState;
            if ($this._request.readyState == 4) {
                $this.responseText = $this._request.responseText;
                $this.responseXml  = $this._request.responseXml;
                $this.status     = $this._request.status;
                $this.statusText = $this._request.statusText;
            }
            
            if ($this.onreadystatechange) {
                $this.onreadystatechange();
            }
        };

        return this._request.open(method, url, (async !== false), user, password);
    }
    else {
        this._xdomain = true;
        this._async = (async === true);
        this._request = new XDomainRequest();
        return this._request.open(method, url);
    }
};

$Request.prototype.send = function(data) {
    if (this._xdomain) {
        var originalReq = this._request, $this = this;

        //!!!! handler has to be defined after 
        //!!!! open method has been called and all 
        //!!!! four handlers have to be defined 
        originalReq.ontimeout = originalReq.onprogress = function () {};

        originalReq.onerror = function() {
            $this.readyState = 4;
            $this.status = 404;
            if ($this._async && $this.onreadystatechange) {
                $this.onreadystatechange();
            }
        };

        originalReq.onload  = function() {
            $this.readyState = 4;
            $this.status = 200;

            if ($this._async && $this.onreadystatechange) {
                $this.onreadystatechange(originalReq.responseText, originalReq);
            }
        };

        //!!! set time out zero to prevent data lost 
        originalReq.timeout = 0;

        if (this._async === false) {
            originalReq.send(data);

            while (this.status === 0) {
                pkg.sleep();
            }

            this.readyState = 4;
            this.responseText = originalReq.responseText;
            return;
        }

        //!!! make short timeout to make sure bloody IE is ready 
        setTimeout(function () {
           originalReq.send(data);
        }, 10);
    }
    else  {
        return this._request.send(data);
    }
};

$Request.prototype.abort = function(data) {
    return this._request.abort();
};

$Request.prototype.setRequestHeader = function(name, value) {
    if (this._xdomain) {
        if (name == "Content-Type") {
            //!!! 
            // IE8 and IE9 anyway don't take in account the assignment
            // IE8 throws exception every time a value is assigned to
            // the property
            // !!!  
            //this._request.contentType = value;
            return;
        }
        else {
            throw new Error("Method 'setRequestHeader' is not supported for " + name);
        }
    }
    else {
        this._request.setRequestHeader(name, value);
    }
};

$Request.prototype.getResponseHeader = function(name) {
    if (this._xdomain) {
        throw new Error("Method is not supported");
    }
    return this._request.getResponseHeader(name);
};

$Request.prototype.getAllResponseHeaders = function() {
    if (this._xdomain) {
        throw new Error("Method is not supported");
    }
    return this._request.getAllResponseHeaders();
};

pkg.getRequest = function() {
    if (typeof XMLHttpRequest !== "undefined") {
        var r = new XMLHttpRequest();

        if (zebra.isFF) {
            r.__send = r.send;
            r.send = function(data) {
                // !!! FF can throw NS_ERROR_FAILURE exception instead of 
                // !!! returning 404 File Not Found HTTP error code
                // !!! No request status, statusText are defined in this case
                try { return this.__send(data); }
                catch(e) {
                    if (!e.message || e.message.toUpperCase().indexOf("NS_ERROR_FAILURE") < 0) {
                        // exception has to be re-instantiate to be Error class instance
                        var ee = new Error(e.toString());
                        throw ee;
                    }
                }
            };
        }

        // CORS is supported out of box
        if ("withCredentials" in r) {
            return r;
        }

        return new $Request(); // IE
    }

    throw new Error("Archaic browser detected");
};

/**
 * HTTP request class. This class provides API to generate different 
 * (GET, POST, etc) HTTP requests in sync and async modes
 * @class zebra.io.HTTP
 * @constructor
 * @param {String} url an URL to a HTTP resource
 */
pkg.HTTP = Class([
    function(url) {
        this.url = url;
        this.header = {};
    },

    /**
     * Perform HTTP GET request .
     * @return {String} a result of the HTTP GET request
     * @method GET  
     */
    function GET() {
        return this.GET(null, null);
    },

    /**
     * Perform HTTP GET request asynchronously.
     * @param {Function} f a callback function that is called when the HTTP GET 
     * request is done. The method gets a request as the only argument 
     * and is called in a context of HTTP class instance.
        
        zebra.io.HTTP("google.com").GET(function(request) {
            // handle HTTP GET response
            if (request.status == 200) {
                request.responseText
            }
            else {
                // handle error
                ...
            }
            ...
        });

     * @method GET  
     */
    function GET(f) {
        return (typeof f === 'function') ? this.GET(null, f) : this.GET(f, null);
    },
    
    /**
     * Perform HTTP GET request synchronously or asynchronously with the given 
     * query parameters.
     * @param {Object} d a dictionary of query parameters 
     * @param {Function} [f] a callback function that is called when the HTTP GET 
     * request is done. The method gets a request object as its only argument 
     * and is called in context of the HTTP class instance.
    
        // synchronous HTTP GET request with the number of
        // query parameters
        var result = zebra.io.HTTP("google.com").GET({
            param1: "var1",
            param3: "var2",
            param3: "var3"
        });

     * @method GET  
     */
    function GET(d, f) {
        return this.SEND("GET", pkg.QS.append(this.url, d), null, f);
    },


    /**
     * Perform synchronously HTTP POST request. No any data is sent with the POST request.
     * @return {String} a result of HTTP POST request
     * @method POST
     */
    function POST(){
        return this.POST(null, null);
    },
    
    /**
     * Perform HTTP POST request asynchronously with no parameters or synchronously 
     * with the given parameters list.
     * @param {Function|Object} d a callback function that is called when HTTP POST 
     * request is done. The method gets a request as its only argument 
     * and is called in context of HTTP class instance:
        
        // asynchronously send POST
        zebra.io.HTTP("google.com").POST(function(request) {
            // handle HTTP GET response
            if (request.status == 200) {
                request.responseText
            }
            else {
                // handle error
                ...
            }
        });

     * Or you can pass a number of parameters to be sent synchronously by 
     * HTTP POST request: 

        // send parameters synchronously by HTTP POST request
        zebra.io.HTTP("google.com").POST({
            param1: "val1",
            param2: "val3",
            param3: "val3" 
        });

     * @method POST
     */
    function POST(d) {
        return (typeof d === "function") ? this.POST(null, d)
                                         : this.POST(pkg.QS.toQS(d, false), null);
    },

    /**
     * Perform HTTP POST request synchronously or asynchronously with the given 
     * data to be sent.
     * @param {String} d a data to be sent by HTTP POST request
     * @param {Function} [f] a callback function that is called when HTTP POST 
     * request is done. The method gets a request as its only  argument 
     * and called in context of appropriate HTTP class instance. If the argument
     * is null the POST request will be done synchronously.
     * @method POST
     */
    function POST(d, f) {
        return this.SEND("POST", this.url, d, f);
    },

    /**
     * Universal HTTP request method that can be used to generate 
     * a HTTP request with any HTTP method to the given URL with 
     * the given data to be sent asynchronously or synchronously
     * @param {String}   method   an HTTP method (GET,POST,DELETE,PUT, etc)
     * @param {String}   url      an URL
     * @param {String}   data     a data to be sent to the given URL
     * @param {Function} [callback] a callback method to be defined 
     * if the HTTP request has to be sent asynchronously. 
     * @method SEND
     */
    function SEND(method, url, data, callback) {
        //!!! IE9 returns 404 if XDomainRequest is used for the same domain but for different paths.
        //!!! Using standard XMLHttpRequest has to be forced in this case
        var r = pkg.getRequest(), $this = this;

        if (callback !== null) {
            r.onreadystatechange = function() {
                if (r.readyState == 4) {
                    callback.call($this, r);
                }
            };
        }

        r.open(method, url, callback != null);
        for(var k in this.header) {
            r.setRequestHeader(k, this.header[k]);
        }

        try {
            r.send(data);
        }
        catch(e) {
            // exception has to be redefined since the type of exception 
            // can be browser dependent
            if (callback == null) {
                var ee = new Error(e.toString());
                ee.request = r;
                throw ee;
            }
            else {
                r.status = 500;
                r.statusText = e.toString();
                callback.call(this, r);
            }
        }

        if (callback == null) {
            if (r.status != 200) {

                // requesting local files can return 0 as a success result 
                if (r.status !== 0 || new zebra.URL(this.url).protocol != "file:") {
                    var e = new Error("HTTP error " + r.status + " response = '" + r.statusText + "' url = " + url);
                    e.request = r;
                    throw e;
                }
            }
            return r.responseText;
        }
    }
]);

/**
 * Shortcut method to perform asynchronous or synchronous HTTP GET requests.
 
        // synchronous HTTP GET call
        var res = zebra.io.GET("http://test.com");

        // asynchronous HTTP GET call
        zebra.io.GET("http://test.com", function(request) {
            // handle result
            if (request.status == 200) {
                request.responseText
            }
            else {
                // handle error
            }
            ...
        });

        // synchronous HTTP GET call with query parameters
        var res = zebra.io.GET("http://test.com", {
            param1 : "var1",
            param1 : "var2",
            param1 : "var3"
        });

 * @param {String} url an URL
 * @param {Object} [parameters] a dictionary of query parameters 
 * @param {Funcion} [callback] a callback function that is called 
 * when the GET request is completed. Pass it  to perform request
 * asynchronously 
 * @api  zebra.io.GET()
 * @method GET
 */
pkg.GET = function(url) {
    if (zebra.isString(url)) {
        var http = new pkg.HTTP(url);
        return http.GET.apply(http, Array.prototype.slice.call(arguments, 1));
    }
    else {
        var http = new pkg.HTTP(url.url);
        if (url.header) {
            http.header = url.header;
        }
        var args = [];
        if (url.parameters) args.push(url.parameters);
        if (url.calback) args.push(url.calback);
        return http.GET.apply(http, args);
    }
};

/**
 * Shortcut method to perform asynchronous or synchronous HTTP POST requests.
 
        // synchronous HTTP POST call
        var res = zebra.io.POST("http://test.com");

        // asynchronous HTTP POST call
        zebra.io.POST("http://test.com", function(request) {
            // handle result
            if (request.status == 200) {
            
            }
            else {
                // handle error
                ...
            }
            ...
        });

        // synchronous HTTP POST call with query parameters
        var res = zebra.io.POST("http://test.com", {
            param1 : "var1",
            param1 : "var2",
            param1 : "var3"
        });

        // synchronous HTTP POST call with data
        var res = zebra.io.POST("http://test.com", "data");

        // asynchronous HTTP POST call with data
        zebra.io.POST("http://test.com", "request", function(request) {
            // handle result
            if (request.status == 200) {
    
            }
            else {
                // handle error
                ...
            }
        });

 * @param {String} url an URL
 * @param {Object} [parameters] a dictionary of query parameters 
 * @param {Funcion} [callback] a callback function that is called 
 * when the GET request is completed. Pass it if to perform request
 * asynchronously 
 * @method  POST
 * @api  zebra.io.POST()
 */
pkg.POST = function(url) {
    var http = new pkg.HTTP(url);
    return http.POST.apply(http, Array.prototype.slice.call(arguments, 1));
};

var isBA = typeof(ArrayBuffer) !== 'undefined';
pkg.InputStream = Class([
    function(container) {
        if (isBA && container instanceof ArrayBuffer) this.data = new Uint8Array(container);
        else {
            if (zebra.isString(container)) {
                this.extend([
                    function read() {
                        return this.available() > 0 ? this.data.charCodeAt(this.pos++) & 0xFF : -1;
                    }
                ]);
            }
            else {
                if (Array.isArray(container) === false) {
                    throw new Error("Wrong type: " + typeof(container));
                }
            }
            this.data = container;
        }
        this.marked = -1;
        this.pos    = 0;
    },

    function mark() {
        if (this.available() <= 0) throw new Error();
        this.marked = this.pos;
    },

    function reset() {
        if (this.available() <= 0 || this.marked < 0) throw new Error();
        this.pos    = this.marked;
        this.marked = -1;
    },

    function close()   { this.pos = this.data.length; },
    function read()    { return this.available() > 0 ? this.data[this.pos++] : -1; },
    function read(buf) { return this.read(buf, 0, buf.length); },

    function read(buf, off, len) {
        for(var i = 0; i < len; i++) {
            var b = this.read();
            if (b < 0) return i === 0 ? -1 : i;
            buf[off + i] = b;
        }
        return len;
    },

    function readChar() {
        var c = this.read();
        if (c < 0) return -1;
        if (c < 128) return String.fromCharCode(c);

        var c2 = this.read();
        if (c2 < 0) throw new Error();

        if (c > 191 && c < 224) return String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        else {
            var c3 = this.read();
            if (c3 < 0) throw new Error();
            return String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        }
    },

    function readLine() {
        if (this.available() > 0)
        {
            var line = [], b;
            while ((b = this.readChar()) != -1 && b != "\n") line.push(b);
            var r = line.join('');
            line.length = 0;
            return r;
        }
        return null;
    },

    function available() { return this.data === null ? -1 : this.data.length - this.pos; },
    function toBase64() { return pkg.b64encode(this.data); }
]);

pkg.URLInputStream = Class(pkg.InputStream, [
    function(url) {
        this.$this(url, null);
    },

    function(url, f) {
        var r = pkg.getRequest(), $this = this;
        r.open("GET", url, f !== null);
        if (f === null || isBA === false) {
            if (!r.overrideMimeType) throw new Error("Binary mode is not supported");
            r.overrideMimeType("text/plain; charset=x-user-defined");
        }

        if (f !== null)  {
            if (isBA) r.responseType = "arraybuffer";
            r.onreadystatechange = function() {
                if (r.readyState == 4) {
                    if (r.status != 200)  throw new Error(url);
                    $this.$clazz.$parent.getMethod('', 1).call($this, isBA ? r.response : r.responseText); // $this.$super(res);
                    f($this.data, r);
                }
            };
            r.send(null);
        }
        else {
            r.send(null);
            if (r.status != 200) throw new Error(url);
            this.$super(r.responseText);
        }
    },

    function close() {
        this.$super();
        if (this.data) {
            this.data.length = 0;
            this.data = null;
        }
    }
]);

/**
 * A remote service connector class. It is supposed the class has to be extended with 
 * different protocols like RPC, JSON etc. The typical pattern of connecting to 
 * a remote service is shown below:
 
        // create service connector that has two methods "a()" and "b(param1)"
        var service = new zebra.io.Service("http://myservice.com", [
            "a", "b"
        ]);

        // call the methods of the remote service
        service.a();
        service.b(10);

 * Also the methods of a remote service can be called asynchronously. In this case
 * a callback method has to be passed as the last argument of called remote methods:

        // create service connector that has two methods "a()" and "b(param1)"
        var service = new zebra.io.Service("http://myservice.com", [
            "a", "b"
        ]);

        // call "b" method from the remote service asynchronously
        service.b(10, function(res) {
            // handle a result of the remote method execution here
            ...
        });
 *
 * Ideally any specific remote service extension of "zebra.io.Service"
 * class has to implement two methods:
 
    - **encode** to say how the given remote method with passed parameters have
    to be transformed into a concrete service side protocol (JSON, XML, etc)
    - **decode** to say how the specific service response has to be converted into 
    JavaScript object 

 * @class  zebra.io.Service 
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

        if (Array.isArray(methods) === false) methods = [ methods ];

        for(var i=0; i < methods.length; i++) {
            (function() {
                var name = methods[i];
                $this[name] = function() {
                    var args = Array.prototype.slice.call(arguments);
                    if (args.length > 0 && typeof args[args.length - 1] == "function") {
                        var callback = args.pop();
                        return this.send(url, this.encode(name, args), function(request) {
                                                                            var r = null;
                                                                            try {
                                                                                if (request.status == 200) {
                                                                                    r = $this.decode(request.responseText);
                                                                                }
                                                                                else {
                                                                                    r = new Error("Status: " + request.status +
                                                                                                   ", '" + request.statusText + "'");
                                                                                }
                                                                            }
                                                                            catch(e) {  r = e; }
                                                                            callback(r);
                                                                       });
                    }
                    return this.decode(this.send(url, this.encode(name, args), null));
                };
            })();
        }
    },

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

     /**
      * Send the given data to the given url and return a response. Callback 
      * function can be passed for asynchronous result handling.
      * @protected
      * @param  {String}   url an URL
      * @param  {String}   data  a data to be send
      * @param  {Function} [callback] a callback function  
      * @return {String}  a result
      * @method  send
      */
    function send(url, data, callback) {
        var http = new pkg.HTTP(url);
        if (this.contentType != null) {
            http.header['Content-Type'] = this.contentType;
        }
        return http.POST(data, callback);
    }
]);

pkg.Service.invoke = function(clazz, url, method) {
    var rpc = new clazz(url, method);
    return function() { return rpc[method].apply(rpc, arguments); };
};

/**
 * The class is implementation of JSON-RPC remote service connector.
 
        // create JSON-RPC connector to a remote service that 
        // has three remote methods
        var service = new zebra.io.JRPC("json-rpc.com", [
            "method1", "method2", "method3"
        ]);

        // synchronously call remote method "method1" 
        service.method1();
        
        // asynchronously call remote method "method1" 
        service.method1(function(res) {
            ...
        });

 * @class zebra.io.JRPC
 * @constructor
 * @param {String} url an URL of remote service
 * @param {Array} methods a list of methods names the remote service provides  
 * @extends {zebra.io.Service}
 */
pkg.JRPC = Class(pkg.Service, [
    function(url, methods) {
        this.$super(url, methods);
        this.version = "2.0";
        this.contentType = "application/json";
    },

    function encode(name, args) {
        return JSON.stringify({ jsonrpc: this.version, method: name, params: args, id: pkg.ID() });
    },

    function decode(r) {
        if (r === null || r.length === 0) {
            throw new Error("Empty JSON result string");
        }

        r = JSON.parse(r);
        if (typeof(r.error) !== "undefined") {
            throw new Error(r.error.message);
        }
        
        if (typeof r.result === "undefined" || typeof r.id === "undefined") {
            throw new Error("Wrong JSON response format");
        }
        return r.result;
    }
]);

pkg.Base64 = function(s) { if (arguments.length > 0) this.encoded = pkg.b64encode(s); };
pkg.Base64.prototype.toString = function() { return this.encoded; };
pkg.Base64.prototype.decode   = function() { return pkg.b64decode(this.encoded); };

/**
 * The class is implementation of XML-RPC remote service connector.

        // create XML-RPC connector to a remote service that 
        // has three remote methods
        var service = new zebra.io.XRPC("xmlrpc.com", [
            "method1", "method2", "method3"
        ]);

        // synchronously call remote method "method1" 
        service.method1();

        // asynchronously call remote method "method1" 
        service.method1(function(res) {
            ...
        });

 * @class zebra.io.XRPC
 * @constructor
 * @extends {zebra.io.Service}
 * @param {String} url an URL of remote service
 * @param {Array} methods a list of methods names the remote service provides  
 */
pkg.XRPC = Class(pkg.Service, [
    function(url, methods) {
        this.$super(url, methods);
        this.contentType = "text/xml";
    },

    function encode(name, args) {
        var p = ["<?xml version=\"1.0\"?>\n<methodCall><methodName>", name, "</methodName><params>"];
        for(var i=0; i < args.length;i++) {
            p.push("<param>");
            this.encodeValue(args[i], p);
            p.push("</param>");
        }
        p.push("</params></methodCall>");
        return p.join('');
    },

    function encodeValue(v, p)  {
        if (v === null) { 
            throw new Error("Null is not allowed");
        }

        if (zebra.isString(v)) {
            v = v.replace("<", "&lt;");
            v = v.replace("&", "&amp;");
            p.push("<string>", v, "</string>");
        }
        else {
            if (zebra.isNumber(v)) {
                if (Math.round(v) == v) p.push("<i4>", v.toString(), "</i4>");
                else                    p.push("<double>", v.toString(), "</double>");
            }
            else {
                if (zebra.isBoolean(v)) p.push("<boolean>", v?"1":"0", "</boolean>");
                else {
                    if (v instanceof Date)  p.push("<dateTime.iso8601>", pkg.dateToISO8601(v), "</dateTime.iso8601>");
                    else {
                        if (Array.isArray(v))  {
                            p.push("<array><data>");
                            for(var i=0;i<v.length;i++) {
                                p.push("<value>");
                                this.encodeValue(v[i], p);
                                p.push("</value>");
                            }
                            p.push("</data></array>");
                        }
                        else {
                            if (v instanceof pkg.Base64) p.push("<base64>", v.toString(), "</base64>");
                            else {
                                p.push("<struct>");
                                for(var k in v) {
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
    },

    function decodeValue(node) {
        var tag = node.tagName.toLowerCase();
        if (tag == "struct")
        {
             var p = {};
             for(var i=0; i < node.childNodes.length; i++) {
                var member = node.childNodes[i],  // <member>
                    key    = member.childNodes[0].childNodes[0].nodeValue.trim(); // <name>/text()
                p[key] = this.decodeValue(member.childNodes[1].childNodes[0]);   // <value>/<xxx>
            }
            return p;
        }
        if (tag == "array") {
            var a = [];
            node = node.childNodes[0]; // <data>
            for(var i=0; i < node.childNodes.length; i++) {
                a[i] = this.decodeValue(node.childNodes[i].childNodes[0]); // <value>
            }
            return a;
        }

        var v = node.childNodes[0].nodeValue.trim();
        switch (tag) {
            case "datetime.iso8601": return pkg.ISO8601toDate(v);
            case "boolean": return v == "1";
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
    },

    function decode(r) {
        var p = pkg.parseXML(r), c = p.getElementsByTagName("fault");
        if (c.length > 0) {
            var err = this.decodeValue(c[0].getElementsByTagName("struct")[0]);
            throw new Error(err.faultString);
        }
        c = p.getElementsByTagName("methodResponse")[0];
        c = c.childNodes[0].childNodes[0]; // <params>/<param>
        if (c.tagName.toLowerCase() === "param") {
            return this.decodeValue(c.childNodes[0].childNodes[0]); // <value>/<xxx>
        }
        throw new Error("incorrect XML-RPC response");
    }
]);

/**
 * Shortcut to call the specified method of a XML-RPC service.
 * @param  {String} url an URL
 * @param  {String} method a method name
 * @api zebra.io.XRPC.invoke()
 * @method invoke
 */
pkg.XRPC.invoke = function(url, method) {
    return pkg.Service.invoke(pkg.XRPC, url, method);
};

/**
 * Shortcut to call the specified method of a JSON-RPC service.
 * @param  {String} url an URL
 * @param  {String} method a method name
 * @api zebra.io.JRPC.invoke()
 * @method invoke
 */
pkg.JRPC.invoke = function(url, method) {
    return pkg.Service.invoke(pkg.JRPC, url, method);
};

/**
 * @for
 */

})(zebra("io"), zebra.Class);

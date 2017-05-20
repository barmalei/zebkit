pkg.getRequest = function() {
    if (typeof XMLHttpRequest !== "undefined") {
        var r = new XMLHttpRequest();

        if (zebkit.isFF) {
            r.__send = r.send;
            r.send = function(data) {
                // !!! FF can throw NS_ERROR_FAILURE exception instead of
                // !!! returning 404 File Not Found HTTP error code
                // !!! No request status, statusText are defined in this case
                try { return this.__send(data); }
                catch(e) {
                    if (!e.message || e.message.toUpperCase().indexOf("NS_ERROR_FAILURE") < 0) {
                        // exception has to be re-instantiate to be Error class instance
                        throw new Error(e.toString());
                    }
                }
            };
        }

        return ("withCredentials" in r) ? r  // CORS is supported out of box
                                        : new $Request(); // IE
    }

    throw new Error("Archaic browser detected");
};

/**
 * Shortcut method to perform asynchronous or synchronous HTTP GET requests.

        // synchronous HTTP GET call
        var res = zebkit.io.GET("http://test.com");

        // asynchronous HTTP GET call
        zebkit.io.GET("http://test.com", function(request) {
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
        var res = zebkit.io.GET("http://test.com", {
            param1 : "var1",
            param1 : "var2",
            param1 : "var3"
        });

 * @param {String} url an URL
 * @param {Object} [parameters] a dictionary of query parameters
 * @param {Funcion} [callback] a callback function that is called
 * when the GET request is completed. Pass it  to perform request
 * asynchronously
 * @api  zebkit.io.GET()
 * @method GET
 */
pkg.GET = function(url) {
    if (zebkit.isString(url)) {
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
        var res = zebkit.io.POST("http://test.com");

        // asynchronous HTTP POST call
        zebkit.io.POST("http://test.com", function(request) {
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
        var res = zebkit.io.POST("http://test.com", {
            param1 : "var1",
            param1 : "var2",
            param1 : "var3"
        });

        // synchronous HTTP POST call with data
        var res = zebkit.io.POST("http://test.com", "data");

        // asynchronous HTTP POST call with data
        zebkit.io.POST("http://test.com", "request", function(request) {
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
 * @param {Function} [callback] a callback function that is called
 * when the GET request is completed. Pass it if to perform request
 * asynchronously
 * @method  POST
 * @api  zebkit.io.POST()
 */
pkg.POST = function(url) {
    var http = new pkg.HTTP(url);
    return http.POST.apply(http, Array.prototype.slice.call(arguments, 1));
};


/**
 * HTTP request class. This class provides API to generate different
 * (GET, POST, etc) HTTP requests in sync and async modes
 * @class zebkit.io.HTTP
 * @constructor
 * @param {String} url an URL to a HTTP resource
 */
pkg.HTTP = Class([
    function(url) {
        this.url = url;
        this.header = {};
    },

    /**
     * Perform HTTP GET request synchronously or asynchronously with the given
     * query parameters.
     * @param {Object} [q] a dictionary of query parameters
     * @param {Function} [f] a callback function that is called when the HTTP GET
     * request is done. The method gets a request object as its only argument
     * and is called in context of the HTTP class instance.

        // synchronous HTTP GET request with the number of
        // query parameters
        var result = zebkit.io.HTTP("google.com").GET({
            param1: "var1",
            param3: "var2",
            param3: "var3"
        });

        // asynchronouse GET requests
        zebkit.io.HTTP("google.com").GET(function(request) {
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
    function GET(q, f) {
        if (typeof q == 'function') {
            f = q;
            q = null;
        }
        return this.SEND("GET", pkg.QS.append(this.url, q), null, f);
    },

    /**
     * Perform HTTP POST request synchronously or asynchronously with the given
     * data to be sent.
     * @param {String|Object} d a data to be sent by HTTP POST request.  It can be
     * either a parameters set or a string.
     * @param {Function} [f] a callback function that is called when HTTP POST
     * request is done. The method gets a request as its only  argument
     * and called in context of appropriate HTTP class instance. If the argument
     * is null the POST request will be done synchronously.

       // asynchronously send POST
       zebkit.io.HTTP("google.com").POST(function(request) {
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
       zebkit.io.HTTP("google.com").POST({
           param1: "val1",
           param2: "val3",
           param3: "val3"
       });

     * @method POST
     */
    function POST(d, f) {
        if (typeof d == 'function') {
            f = d;
            d = null;
        }

        // if the passed data is simple dictionary object encode it as POST
        // parameters
        //
        // TODO: think also about changing content type
        // "application/x-www-form-urlencoded; charset=UTF-8"
        if (d != null && zebkit.isString(d) === false && d.constructor === Object) {
            d = pkg.QS.toQS(d, false);
        }

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

        if (callback != null) {
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
                if (r.status !== 0 || new zebkit.URL(this.url).protocol != "file:") {
                    var e = new Error("HTTP error " + r.status + " response = '" + r.statusText + "' url = " + url);
                    e.request = r;
                    throw e;
                }
            }
            return r.responseText;
        }
    }
]);

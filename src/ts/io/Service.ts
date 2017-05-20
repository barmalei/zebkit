
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

 * @class  zebkit.io.Service
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

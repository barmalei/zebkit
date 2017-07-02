(function() {
/**
 * This is the core package that provides powerful easy OOP concept, packaging
 * and number of utility methods. The package doesn't have any dependencies
 * from others zebkit packages and can be used independently. Briefly the
 * package possibilities are listed below:

   - **easy OOP concept**. Use "zebkit.Class" and "zebkit.Interface" to declare
     classes and interfaces

    ```JavaScript
        // declare class A
        var ClassA = zebkit.Class([
            function() { // class constructor
                ...
            },
            // class method
            function a(p1, p2, p3) { ... }
        ]);

        var ClassB = zebkit.Class(ClassA, [
            function() {  // override constructor
                this.$super(); // call super constructor
            },

            function a(p1, p2, p3) { // override method "a"
                this.$super(p1, p2, p3);  // call super implementation of method "a"
            }
        ]);

        var b = new ClassB(); // instantiate classB
        b.a(1,2,3); // call "a"

        // instantiate anonymous class with new method "b" declared and
        // overridden method "a"
        var bb = new ClassB([
            function a(p1, p2, p3) { // override method "a"
                this.$super(p1, p2, p3);  // call super implementation of method "a"
            },

            function b() { ... } // declare method "b"
        ]);

        b.a();
        b.b();
    ```

   - **Packaging.** Zebkit uses Java-like packaging system where your code is bundled in
      the number of hierarchical packages.

    ```JavaScript
        // declare package "zebkit.test"
        zebkit.package("test", function(pkg) {
            // declare class "Test" in the package
            pkg.Test = zebkit.Class([ ... ]);
        });

        ...
        // Later on use class "Test" from package "zebkit.test"
        zebkit.require("test", function(test) {
            var test = new test.Test();
        });
    ```

    - **Resources loading.** Resources should be loaded with a special method to guarantee
      its proper loading in zebkit sequence and the loading completeness.

    ```JavaScript
        // declare package "zebkit.test"
        zebkit.resources("http://my.com/test.jpg", function(img) {
            // handle completely loaded image here
            ...
        });

        zebkit.package("test", function(pkg, Class) {
            // here we can be sure all resources are loaded and ready
        });
    ```

   - **Declaring number of core API method and classes**
      - **"zebkit.DoIt"** - improves Promise like alternative class
      - **"zebkit.URI"** - URI helper class
      - **"zebkit.Dummy"** - dummy class
      - **instanceOf(...)** method to evaluate zebkit classes and and interfaces inheritance.
        The method has to be used instead of JS "instanceof" operator to provide have valid
        result.
      - **zebkit.newInstance(...)** method
      - **zebkit.clone(...)**  method
      - etc

 * @class zebkit
 * @access package
 */

    // Environment specific stuff
    var zenv = {},
        isInBrowser = typeof navigator !== "undefined",
        $global     = (typeof window !== "undefined" && window !== null) ? window
                                                                         : (typeof global !== 'undefined' ? global
                                                                                                          : this);
    if (typeof zebkitEnvironment === 'function') {
        zenv = zebkitEnvironment();
    } else {
        if (typeof window !== 'undefined') {
            zenv = window;
        }
    }

    // ( (http) :// (host)? (:port)? (/)? )? (path)? (?query_string)?
    //
    //  [1] scheme://host/
    //  [2] scheme
    //  [3] host
    //  [4]  port
    //  [5] /
    //  [6] path
    //  [7] ?query_string
    //
    var $uriRE = /^(([a-zA-Z]+)\:\/\/([^\/:]+)?(\:[0-9]+)?(\/)?)?([^?]+)?(\?.+)?/;

    /**
     * URI class. Pass either a full uri (as a string or zebkit.URI) or number of an URI parts
     * (scheme, host, etc) to constructor it.
     * @param {String} [uri] an URI.
     * @param {String} [scheme] a scheme.
     * @param {String} [host] a host.
     * @param {String|Integer} [port] a port.
     * @param {String} [path] a path.
     * @param {String} [qs] a query string.
     * @constructor
     * @class zebkit.URI
     */
    function URI(uri) {
        if (arguments.length > 1) {
            if (arguments[0] !== null) {
                this.scheme = arguments[0].toLowerCase();
            }

            if (arguments[1] !== null) {
                this.host = arguments[1];
            }

            var ps = false;
            if (arguments.length > 2) {
                if (isNumber(arguments[2])) {
                    this.port = arguments[2];
                } else if (arguments[2] !== null) {
                    this.path = arguments[2];
                    ps = true;
                }
            }

            if (arguments.length > 3) {
                if (ps === true) {
                    this.qs = arguments[3];
                } else {
                    this.path = arguments[3];
                }
            }

            if (arguments.length > 4) {
                this.qs = arguments[4];
            }
        } else if (uri instanceof URI) {
            this.host   = uri.host;
            this.path   = uri.path;
            this.qs     = uri.qs;
            this.port   = uri.port;
            this.scheme = uri.scheme;
        } else {
            var m = uri.match($uriRE);
            if (m === null) {
                throw new Error("Invalid URI '" + uri + "'");
            }

            // fetch scheme
            if (typeof m[1] !== 'undefined') {
                this.scheme = m[2].toLowerCase();

                if (typeof m[3] === 'undefined') {
                    if (this.scheme !== "file") {
                        throw new Error("Invalid host name : '" + uri + "'");
                    }
                } else {
                    this.host = m[3];
                }

                if (typeof m[4] !== 'undefined') {
                    this.port = parseInt(m[4].substring(1), 10);
                }
            }

            // fetch path
            if (typeof m[6] !== 'undefined') {
                this.path = m[6];
            } else if (typeof m[1] !== 'undefined') {
                throw new Error("Invalid URL '" + uri + "'");
            }

            if (typeof m[7] !== 'undefined' && m[7].length > 1) {
                this.qs = m[7].substring(1).trim();
            }
        }

        if (this.path !== null) {
            this.path = this.path.replace(/\/\/*/g, '/');

            var l = this.path.length;
            if (l > 1 && this.path[l - 1] === '/') {
                this.path = this.path.substring(0, l - 1);
            }

            if ((this.host !== null || this.scheme !== null) && this.path[0] !== '/') {
                this.path = "/" + this.path;
            }
        }

        /**
         * URI path.
         * @attribute path
         * @type {String}
         * @readOnly
         */

        /**
         * URI host.
         * @attribute host
         * @type {String}
         * @readOnly
         */

        /**
         * URI port number.
         * @attribute port
         * @type {Integer}
         * @readOnly
         */

        /**
         * URI query string.
         * @attribute qs
         * @type {String}
         * @readOnly
         */

         /**
          * URI scheme (e.g. 'http', 'ftp', etc).
          * @attribute scheme
          * @type {String}
          * @readOnly
          */
    }

    URI.prototype = {
        scheme   : null,
        host     : null,
        port     : -1,
        path     : null,
        qs       : null,

        /**
         * Serialize URI to its string representation.
         * @method  toString
         * @return {String} an URI as a string.
         */
        toString : function() {
            return (this.scheme !== null ? this.scheme + "://" : '') +
                   (this.host !== null ? this.host : '' ) +
                   (this.port !== -1   ? ":" + this.port : '' ) +
                   (this.path !== null ? this.path : '' ) +
                   (this.qs   !== null ? "?" + this.qs : '' );
        },

        /**
         * Get a parent URI.
         * @method getParent
         * @return {zebkit.URI} a parent URI.
         */
        getParent : function() {
            if (this.path === null) {
                return null;
            } else {
                var i = this.path.lastIndexOf('/');
                return (i < 0 || this.path === '/') ? null
                                                    : new zebkit.URI(this.scheme,
                                                                     this.host,
                                                                     this.port,
                                                                     this.path.substring(0, i),
                                                                     this.qs);
            }
        },

        /**
         * Append the given parameters to a query string of the URI.
         * @param  {Object} obj a dictionary of parameters to be appended to
         * the URL query string
         * @method appendQS
         */
        appendQS : function(obj) {
            if (obj !== null) {
                if (this.qs === null) {
                    this.qs = '';
                }

                if (this.qs.length > 0) {
                    this.qs = this.qs + "&" + URI.toQS(obj);
                } else {
                    this.qs = URI.toQS(obj);
                }
            }
        }
    };

    /**
     * Test if the given string is absolute path or URI.
     * @param  {String|zebkit.URI}  u an URI
     * @return {Boolean} true if the string is absolute path or URI.
     * @method isAbsolute
     * @static
     */
    URI.isAbsolute = function(u) {
        return u[0] === '/' || /^[a-zA-Z]+\:\/\//i.test(u);
    };

    /**
     * Test if the given string is URL.
     * @param  {String}  u a string to be checked.
     * @return {Boolean} true if the string is URL
     * @method isURL
     * @static
     */
    URI.isURL = function(u) {
        return /^[a-zA-Z]+\:\/\//i.test(u);
    };

    /**
     * Parse the specified query string of the given URI.
     * @param  {String} url an URI
     * @param  {Boolean} [decode] pass true if query string has to be decoded.
     * @return {Object} a parsed query string as a dictionary of parameters
     * @method parseQS
     * @static
     */
    URI.parseQS = function(qs, decode) {
        var mqs      = qs.match(/[a-zA-Z0-9_.]+=[^?&=]+/g),
            parsedQS = {};

        if (mqs !== null) {
            for(var i = 0; i < mqs.length; i++) {
                var q = mqs[i].split('=');
                this.parsedQS[q[0].substring(1)] = (decode === true ? zebkit.environment.decodeURIComponent(q[1])
                                                                    : q[1]);
            }
        }

        return parsedQS;
    };

    /**
     * Convert the given dictionary of parameters to a query string.
     * @param  {Object} obj a dictionary of parameters
     * @param  {Boolean} [encode] pass true if the parameters values have to be
     * encoded
     * @return {String} a query string built from parameters list
     * @static
     * @method toQS
     */
    URI.toQS = function(obj, encode) {
        if (zebkit.isString(obj) || zebkit.isBoolean(obj) || zebkit.isNumber(obj)) {
            return "" + obj;
        }

        var p = [];
        for(var k in obj) {
            if (obj.hasOwnProperty(k)) {
                p.push(k + '=' + (encode === true ? zebkit.environment.encodeURIComponent(obj[k].toString())
                                                  : obj[k].toString()));
            }
        }
        return p.join("&");
    };


    /**
     * Join the given  paths
     * @param  {String} p* relative paths
     * @return {String} an absolute URI
     * @method join
     * @static
     */
    URI.join = function() {
        var pu = new URI(arguments[0]);

        for(var i = 1; i < arguments.length; i++) {
            var p = arguments[i].toString().trim();
            if (p.length === 0 || URI.isAbsolute(p)) {
                throw new Error("Absolute path '" + p + "' cannot be joined");
            }

            p = p.replace(/\/\/*/g, '/');
            if (p[p.length - 1] === '/' ) {
                p = p.substring(0, p.length - 1);
            }

            if (pu.path === null) {
                pu.path = p;
                if ((pu.host !== null || pu.scheme !== null) && pu.path[0] !== '/') {
                    pu.path = "/" + pu.path;
                }
            } else {
                pu.path = pu.path + "/" + p;
            }
        }

        return pu.toString();
    };

    /**
     * Sequential tasks runner (D-then). Allows developers to execute number of steps (async and sync) in the
     * exact order they have been called by runner. The ideas of the runner implementation is making the
     * code more readable and plain nevertheless it includes asynchronous parts:
     * @example

        var r = new zebkit.DoIt();

        // step 1
        r.then(function() {
            // call three asynchronous HTTP GET requests to read three files
            // pass join to every async. method to be notified when the async.
            // part is completed
            asyncHttpCall("http://test.com/a.txt", this.join());
            asyncHttpCall("http://test.com/b.txt", this.join());
            asyncHttpCall("http://test.com/c.txt", this.join());
        })
        .  // step 2
        then(function(r1, r2, r3) {
            // handle completely read on previous step files
            r1.responseText  // "a.txt" file content
            r2.responseText  // "b.txt" file content
            r3.responseText  // "c.txt" file content
        })
        . // handle error
        catch(function(e) {
            // called when an exception has occurred
            ...
        });


     * @class zebkit.DoIt
     * @param {Boolean} [ignore] flag to rule error ignorance
     * @constructor
     */
    function DoIt(body, ignore) {
        this.recover();

        if (arguments.length === 1) {
            if (zebkit.isBoolean(body)) {
                this.$ignoreError = body;
                body = null;
            } else {
                this.then(body);
            }
        } else if (arguments.length === 2) {
            this.$ignoreError = ignore;
            this.then(body);
        }
    }

    DoIt.prototype = {
        // TODO: not stable API
        recover : function(body) {
            if (this.$error !== null) {
                var err = this.$error;
                this.$error = null;
                this.$tasks   = [];
                this.$results = [];
                this.$taskCounter = this.$level = this.$busy = 0;

                if (arguments.length === 1) {
                    body.call(this, err);
                }
            }
        },

        /**
         * Restart the do it object to clear error that has happened and
         * continue tasks that has not been run yet because of the error.
         * @method  restart
         * @chainable
         */
        restart : function() {
            if (this.$error !== null) {
                this.$error = null;
            }
            this.$schedule();
            return this;
        },

        /**
         * Run the given method as one of the sequential step of the doit execution.
         * @method  then
         * @param  {Function} body a method to be executed. The method can get results
         * of previous step execution as its arguments. The method is called in context
         * of instance of a DoIt instance.
         * @chainable
         */
        then : function(body, completed) {
            var level = this.$level;  // store level then was executed for the given task
                                      // to be used to compute correct the level inside the
                                      // method below
            if (body instanceof DoIt) {
                if (body.$error !== null) {
                    this.error(body.$error);
                } else {
                    var $this = this;
                    this.then(function() {
                        var jn = $this.join();
                        body.then(function() {
                            if (arguments.length > 0) {
                                // also pass result to body DoIt
                                this.join.apply(this, arguments);
                            }
                        }, function() {
                            if ($this.$error === null) {
                                jn.apply($this, arguments);
                            }
                        }).catch(function(e) {
                            $this.error(e);
                        });
                    });
                }

                return this;
            } else {
                var task = function() {
                    // clean results of execution of a previous task

                    this.$busy = 0;
                    var pc = this.$taskCounter, args = null, r;

                    if (this.$error === null) {
                        if (typeof this.$results[level] !== 'undefined') {
                            args = this.$results[level];
                        }

                        this.$taskCounter    = 0;  // we have to count the tasks on this level
                        this.$level          = level + 1;
                        this.$results[level] = [];

                        // it is supposed the call is embedded with other call, no need to
                        // catch it one more time
                        if (level > 0) {
                            r = body.apply(this, args);
                        } else {
                            try {
                                r = body.apply(this, args);
                            } catch(e) {
                                this.error(e);
                            }
                        }

                        // this.$busy === 0 means we have called synchronous task
                        // and make sure the task has returned a result
                        if (this.$busy === 0 && this.$error === null && typeof r !== "undefined") {
                            this.$results[level] = [ r ];
                        }
                    }

                    if (level === 0) {
                        // zero level is responsible for handling exception
                        try {
                            this.$schedule();
                        } catch(e) {
                            this.error(e);
                        }
                    } else {
                        this.$schedule();
                    }

                    this.$level = level; // restore level
                    this.$taskCounter = pc;  // restore counter

                    // TODO: not a graceful solution. It has been done to let call "join" out
                    // outside of body. Sometimes it is required to provide proper level of
                    // execution since join calls schedule
                    if (typeof completed === 'function') {
                        if (level === 0) {
                            try {
                                if (args === null) {
                                    completed.call(this);
                                } else {
                                    completed.apply(this, args);
                                }
                            } catch(e) {
                                this.error(e);
                            }
                        } else {
                            if (args === null) {
                                completed.call(this);
                            } else {
                                completed.apply(this, args);
                            }
                        }
                    }
                    if (args !== null) {
                        args.length = 0;
                    }
                };

                if (this.$error === null) {
                    if (level === 0 && this.$busy === 0) {
                        if (this.$results[level] != null && this.$results[level].length > 0) {
                            task.apply(this, this.$results[level]);
                        } else {
                            task.call(this);
                        }
                    } else {
                        // put task in list
                        if (this.$level > 0) {
                            this.$tasks.splice(this.$taskCounter++, 0, task);
                        } else {
                            this.$tasks.push(task);
                        }
                    }
                }
            }

            if (this.$level === 0) {
                this.$schedule();
            }

            return this;
        },

        $ignored : function(e) {
            zebkit.dumpError(e);
        },

        /**
         * Force to fire error.
         * @param  {Error} e an error to be fired
         * @method error
         * @chainable
         */
        error : function(e, pr) {
            if (arguments.length === 0) {
                if (this.$error !== null) {
                    zebkit.dumpError(e);
                }
            } else {
                if (this.$error === null) {
                    if (this.$ignoreError) {
                        this.$ignored(e);
                    } else {
                        this.$taskCounter = this.$level = this.$busy = 0;
                        this.$error   = e;
                        this.$results = [];
                    }

                    this.$schedule();
                } else {
                    if (arguments.length < 2 || pr === true) {
                        zebkit.dumpError(e);
                    }
                }
            }

            return this;
        },

        /**
         * Wait before the given doit is ready to be called.
         * @param  {zebkit.DoIt} r a runner
         * @example
         *
         *      var async = new DoIt().then(function() {
         *          // imagine we do asynchronous ajax call
         *          ajaxCall("http://test.com/data", this.join());
         *      });
         *
         *      var doit = new DoIt().till(async).then(function(res) {
         *          // handle result that has been fetched
         *          // by "async" do it
         *          ...
         *      });
         *
         * @chainable
         * @method till
         */
        till : function(r) {
            // wait till the given DoIt is executed
            this.then(function() {
                var $this = this,
                    jn    = this.join(), // block execution of the runner
                    res   = arguments.length > 0 ? Array.prototype.slice.call(arguments) : []; // save arguments to restore it later

                // call "doit" we are waiting for
                r.then(function() {
                    if ($this.$error === null) {
                        // unblock the doit that waits for the runner we are in and
                        // restore its arguments
                        if (res.length > 0) {
                            jn.apply($this, res);
                        } else {
                            jn.call($this);
                        }

                        // preserve arguments for the next call
                        if (arguments.length > 0) {
                            this.join.apply(this, arguments);
                        }
                    }
                }).catch(function(e) {
                    // delegate error to a waiting runner
                    $this.error(e);
                });
            });

            return this;
        },

        /**
         * Returns join callback for asynchronous parts of the doit. The callback
         * has to be requested and called by an asynchronous method to inform the
         * doit the given method is completed.
         * @example
         *
         *      var d = new DoIt().then(function() {
         *          // imagine we call ajax HTTP requests
         *          ajaxCall("http://test.com/data1", this.join());
         *          ajaxCall("http://test.com/data2", this.join());
         *      }).then(function(res1, res2) {
         *          // handle results of ajax requests from previous step
         *          ...
         *      });
         *
         * @return {Function} a method to notify doit the given asynchronous part
         * has been completed. The passed to the method arguments will be passed
         * to the next step of the runner.         *
         * @method join
         */
        join : function() {
            // if join is called outside runner than level is set to 0
            var level = this.$level === 0 ? 0 : this.$level - 1;

            if (arguments.length > 0) {
                this.$results[level] = [];
                for(var i = 0; i < arguments.length; i++) {
                    this.$results[level][i] = arguments[i];
                }
            } else {
                // TODO: join uses busy flag to identify the result index the given join will supply
                // what triggers a potential result overwriting  problem (jn2 overwrite jn1  result):
                //    var jn1 = join(); jn1();
                //    var jn2 = join(); jn2();

                var $this = this,
                    index = this.$busy++;

                return function() {
                    if ($this.$results[level] == null) {
                        $this.$results[level] = [];
                    }

                    // since error can occur and times variable
                    // can be reset to 0 we have to check it
                    if ($this.$busy > 0) {
                        var i = 0;

                        if (arguments.length > 0) {
                            $this.$results[level][index] = [];
                            for(i = 0; i < arguments.length; i++) {
                                $this.$results[level][index][i] = arguments[i];
                            }
                        }

                        if (--$this.$busy === 0) {
                            // collect result
                            if ($this.$results[level].length > 0) {
                                var args = $this.$results[level],
                                    res  = [];

                                for(i = 0; i < args.length; i++) {
                                    Array.prototype.push.apply(res, args[i]);
                                }
                                $this.$results[level] = res;
                            }

                            // TODO: this code can bring to unexpected scheduling for a situation when
                            // doit is still in then:
                            //    then(function () {
                            //        var jn1 = join();
                            //        ...
                            //        jn1()  // unexpected scheduling of the next then since busy is zero
                            //        ...
                            //        var jn2 = join(); // not actual
                            //    })

                            $this.$schedule();
                        }
                    }
                };
            }
        },

        /**
         * Method to catch error that has occurred during the doit sequence execution.
         * @param  {Function} [body] a callback to handle the error. The method
         * gets an error that has happened as its argument. If there is no argument
         * the error will be printed in output. If body is null then no error output
         * is expected.
         * @chainable
         * @method catch
         */
        catch : function(body) {
            var level = this.$level;  // store level then was executed for the given task
                                      // to be used to compute correct the level inside the
                                      // method below

            var task = function() {
                // clean results of execution of a previous task

                this.$busy = 0;
                var pc = this.$taskCounter;
                if (this.$error !== null) {
                    this.$taskCounter = 0;  // we have to count the tasks on this level
                    this.$level       = level + 1;

                    try {
                        if (typeof body === 'function') {
                            body.call(this, this.$error);
                        } else if (body === null) {

                        } else {
                            zebkit.dumpError(this.$error);
                        }
                    } catch(e) {
                        this.$level       = level; // restore level
                        this.$taskCounter = pc;    // restore counter
                        throw e;
                    }
                }

                if (level === 0) {
                    try {
                        this.$schedule();
                    } catch(e) {
                        this.error(e);
                    }
                } else {
                    this.$schedule();
                }

                this.$level       = level; // restore level
                this.$taskCounter = pc;    // restore counter
            };

            if (this.$level > 0) {
                this.$tasks.splice(this.$taskCounter++, 0, task);
            } else {
                this.$tasks.push(task);
            }

            if (this.$level === 0) {
                this.$schedule();
            }

            return this;
        },

        /**
         * Throw an exception if an error has happened before the method call,
         * otherwise fo nothing.
         * @method  throw
         * @chainable
         */
        throw : function() {
            return this.catch(function(e) {
                throw e;
            });
        },

        $schedule : function() {
            if (this.$tasks.length > 0 && this.$busy === 0) {
                this.$tasks.shift().call(this);
            }
        },

        end : function() {
            this.recover();
        }
    };

    //  Faster match operation analogues:
    //  Math.floor(f)  =>  ~~(a)
    //  Math.round(f)  =>  (f + 0.5) | 0
    function isString(o)  {
        return typeof o !== "undefined" && o !== null &&
              (typeof o === "string" || o.constructor === String);
    }

    function isNumber(o)  {
        return typeof o !== "undefined" && o !== null &&
              (typeof o === "number" || o.constructor === Number);
    }

    function isBoolean(o) {
        return typeof o !== "undefined" && o !== null &&
              (typeof o === "boolean" || o.constructor === Boolean);
    }

    function lookupObjValue(obj, name) {
        if (arguments.length === 1) {
            name = obj;
            obj  = $global;
        }

        if (typeof name === 'undefined' || name.trim().length === 0) {
            throw new Error("Invalid field name: '" + name + "'");
        }

        var names = name.trim().split('.');
        for(var i = 0; i < names.length; i++) {
            obj = obj[names[i]];

            if (typeof obj === 'undefined' || ((i + 1) === names.length && obj === null)) {
                throw new Error("'" + name + "' value cannot be detected");
            }
        }
        return obj;
    }

    function $ls(callback, all) {
        for (var k in this) {
            var v = this[k];
            if (this.hasOwnProperty(k) && (v instanceof Package) === false)  {
                if ((k[0] !== '$' && k[0] !== '_') || all === true) {
                    if (callback.call(this, k, this[k]) === true) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function $lsall(fn) {
        return $ls.call(this, function(k, v) {
            if (typeof v === 'undefined') {
                throw new Error(fn + "," + k);
            }

            if (v !== null && v.clazz === zebkit.Class) {
                if (typeof v.$name === "undefined") {
                    v.$name = fn + k;
                    v.$pkg  = lookupObjValue($global, fn.substring(0, fn.length - 1));
                }
                return $lsall.call(v, v.$name + ".");
            }
        });
    }

    /**
     *  Package is a special class to declare zebkit packages. Global variable "zebkit" is
     *  root package for all other packages. To declare a new package use "zebkit" global
     *  variable:
     *
     *      // declare new "mypkg" package
     *      zebkit.package("mypkg", function(pkg, Class) {
     *          // put the package entities in
     *          pkg.packageVariable = 10;
     *          ...
     *      });
     *      ...
     *
     *      // now we can access package and its entities directly
     *      zebkit.mypkg.packageVariable
     *
     *      // or it is preferable to wrap a package access with "require"
     *      // method
     *      zebkit.require("mypkg", function(mypkg) {
     *          mypkg.packageVariable
     *      });
     *
     *  @class zebkit.Package
     *  @constructor
     */
    function Package(name, parent) {
        /**
         * URL the package has been loaded
         * @attribute $url
         * @readOnly
         * @type {String}
         */
        this.$url = null;

        /**
         * Name of the package
         * @attribute $name
         * @readOnly
         * @type {String}
         */
        this.$name = name;

        /**
         * Package configuration parameters.
         * @attribute config
         * @readOnly
         * @type {Object}
         */
        this.config = {};

        this.$ready = new DoIt();

        /**
         * Reference to a parent package
         * @attribute $parent
         * @private
         * @type {zebkit.Package}
         */
        this.$parent = arguments.length < 2 ? null : parent;
    }

    Package.prototype.$detectLocation = function() {
        if (typeof __dirname !== 'undefined') {
            this.$url = __dirname;
        } else if (typeof document !== "undefined") {
            //
            var s  = document.getElementsByTagName('script'),
                ss = s[s.length - 1].getAttribute('src'),
                i  = ss === null ? -1 : ss.lastIndexOf("/"),
                a  = document.createElement('a');

            a.href = (i > 0) ? ss.substring(0, i + 1)
                             : document.location.toString();

            this.$url = a.href.toString();
        }
    };

    /**
     * Get full name of the package. Full name includes not the only the given
     * package name, but also all parent packages separated with "." character.
     * @return {String} a full package name
     * @method fullname
     */
    Package.prototype.fullname = function() {
        var n = [ this.$name ], p = this;
        while (p.$parent !== null) {
            p = p.$parent;
            n.unshift(p.$name);
        }
        return n.join(".");
    };

    /**
     * Find a package with the given file like path relatively to the given package.
     * @param {String} path a file like path
     * @return {String} path a path
     * @example
     *
     *      // declare "zebkit.test" package
     *      zebkit.package("test", function(pkg, Class) {
     *          ...
     *      });
     *      ...
     *
     *      zebkit.require("test", function(test) {
     *          var parent = test.cd(".."); // parent points to zebkit package
     *          ...
     *      });
     *
     * @method cd
     */
    Package.prototype.cd = function(path) {
        if (path[0] === '/') {
            path = path.substring(1);
        }

        var paths = path.split('/'),
            pk    = this;

        for (var i = 0; i < paths.length; i++) {
            var pn = paths[i];
            if (pn === "..") {
                pk = pk.$parent;
            } else {
                pk = pk[pn];
            }

            if (typeof pk === 'undefined' || pk === null) {
                throw new Error("Package path '" + path + "' cannot be resolved");
            }
        }

        return pk;
    };

    /**
     * List the package sub-packages.
     * @param  {Function} callback    callback function that gets a sub-package name and the
     * sub-package itself as its arguments
     * @param  {boolean}  [recursively]  indicates if sub-packages have to be traversed recursively
     * @method packages
     */
    Package.prototype.packages = function(callback, recursively) {
        for (var k in this) {
            var v = this[k];
            if (k !== "$parent" && this.hasOwnProperty(k) && v instanceof Package) {

                if (callback.call(this, k, v) === true || (recursively === true && v.packages(callback, recursively) === true)) {
                    return true;
                }
            }
        }

        return false;
    };

    /**
     * List classes, variables and interfaces defined in the given package.
     * If second parameter "all" passed to the method is false, the method
     * will skip package entities whose name starts from "$" or "_" character.
     * These entities are considered as private ones. Pay attention sub-packages
     * are not listed.
     * @param  {Function} cb a callback method that get the package entity key
     * and the entity value as arguments.
     * @param  {Boolean}  [all] flag that specifies if private entities are
     * should be listed.
     * @method ls
     */
    Package.prototype.ls = function(cb, all) {
        return $ls.call(this, cb, all);
    };

    /**
     * Build import JS code string that can be evaluated in a local space to make visible
     * the given package or packages classes, variables and methods.
     * @example
     *
     *     (function() {
     *         // make visible variables, classes and methods declared in "zebkit.ui"
     *         // package in the method local space
     *         eval(zebkit.import("ui"));
     *
     *         // use imported from "zebkit.ui.Button" class without necessity to specify
     *         // full path to it
     *         var bt = new Button("Ok");
     *     })();
     *
     * @param {String} [pkgname]* names of packages to be imported
     * @return {String} an import string to be evaluated in a local JS space
     * @method  import
     */
    Package.prototype.import = function() {
        var code = [];
        if (arguments.length > 0) {
            for(var i = 0; i < arguments.length; i++) {
                var v = lookupObjValue(this, arguments[i]);
                if ((v instanceof Package) === false) {
                    throw new Error("Package '" + arguments[i] + " ' cannot be found");
                }
                code.push(v.import());
            }

            return code.length > 0 ?  code.join(";") : null;
        } else {
            var fn = this.fullname();
            this.ls(function(k, v) {
                code.push(k + '=' + fn + '.' + k);
            });

            return code.length > 0 ?  "var " + code.join(",") + ";" : null;
        }
    };

    /**
     * Method to request sub-package or sub-packages be ready and visible in
     * passed callback. The method guarantees the callbacks be called the time
     * all zebkit data is loaded and ready.
     * @param {String} [packages]* name or names of sub-packages to make visible
     * in callback method
     * @param {Function} [callback] a method to be called. The method is called
     * in context of the given package and gets requested packages passed as the
     * method arguments in order they have been requested.
     * @method  require
     * @example
     *
     *     zebkit.require("ui", function(ui) {
     *         var b = new ui.Button("Ok");
     *         ...
     *     });
     *
     */
    Package.prototype.require = function() {
        var pkgs  = [],
            $this = this,
            fn    = arguments[arguments.length - 1];

        if (typeof fn !== 'function') {
            throw new Error("Invalid callback function");
        }

        for(var i = 0; isString(arguments[i]) && i < arguments.length; i++) {
            var pkg = lookupObjValue(this, arguments[i]);
            if ((pkg instanceof Package) === false) {
                throw new Error("Package '" + arguments[i] + "' cannot be found");
            }
            pkgs.push(pkg);
        }

        return this.then(function() {
            fn.apply($this, pkgs);
        });
    };

    var $textualFileExtensions = [
        "txt", "json", "htm", "html", "md", "properties", "conf", "xml"
    ];

    /**
     * This method loads resources (images, textual files, etc) and call callback
     * method with completely loaded resources as input arguments.
     * @example
     *
     *     zebkit.resources(
     *         "http://test.com/image1.jpg",
     *         "http://test.com/text.txt",
     *         function(image, text) {
     *             // handle resources here
     *             ...
     *         }
     *     );
     *
     * @param  {String} paths*  paths to resources to be loaded
     * @param  {Function} cb callback method that is executed when all listed
     * resources are loaded and ready to be used.
     * @method resources
     */
    Package.prototype.resources = function() {
        var args  = Array.prototype.slice.call(arguments),
            $this = this,
            fn    = args.pop();

        if (typeof fn !== 'function') {
            throw new Error("Invalid callback function");
        }

        this.then(function() {
            for(var i = 0; i < args.length ; i++) {
                (function(path, jn) {
                    var m    = path.match(/^(\<[a-z]+\>\s*)?(.*)$/),
                        type = "img",
                        p    = m[2].trim();

                    if (typeof m[1] !== 'undefined') {
                        type = m[1].trim().substring(1, m[1].length - 1).trim();
                    } else {
                        var li = p.lastIndexOf('.');
                        if (li > 0) {
                            var ext = p.substring(li + 1).toLowerCase();
                            if ($textualFileExtensions.indexOf(ext) >= 0) {
                                type = "txt";
                            }
                        }
                    }

                    if (type === "img") {
                        zebkit.environment.loadImage(p, function(img) {
                            jn(img);
                        }, function(img, e) {
                            jn(img);
                        });
                    } else if (type === "txt") {
                        // TODO: this part has to be replaced with less low-level code
                        var req  = zebkit.environment.getHttpRequest();
                        req.open("GET", p, true);
                        req.onreadystatechange = function() {
                            if (req.readyState === 4) {
                                if (req.status >= 400 || req.status < 100) {
                                    console.log("HTTP error '" + req.statusText + "', code = " + req.status + " '" + path + "'");
                                    jn(null);
                                } else {
                                    jn(req.responseText);
                                }
                            }
                        };

                        try {
                            req.send(null);
                        } catch(e) {
                            jn(null);
                        }
                    } else {
                        console.log("Invalid path '" + path + "'");
                        jn(null);
                    }

                })(args[i], this.join());
            }
        }).then(function() {
            fn.apply($this, arguments);
        });
    };

    /**
     * This method helps to sync accessing to package entities with the
     * package internal state. For instance package declaration can initiate
     * loading resources that happens asynchronously. In this case to make sure
     * the package completed loading its configuration we should use package
     * "then" method.
     * @param  {Function} f a callback method where we can safely access the
     * package entities
     * @chainable
     * @private
     * @example
     *
     *     zebkit.then(function() {
     *         // here we can make sure all package declarations
     *         // are completed and we can start using it
     *     });
     *
     * @method  then
     */
    Package.prototype.then = function(f) {
        this.$ready.then(f).catch(function(e) {
            zebkit.dumpError(e);
            // re-start other waiting tasks
            this.restart();
        });
        return this;
    };

    Package.prototype.join = function() {
        return this.$ready.join.apply(this.$ready, arguments);
    };

    /**
     * Method that has to be used to declare packages.
     * @param  {String}   name     a name of the package
     * @param  {Function} [callback] a call back method that is called in package
     * context. The method has to be used to populate the given package classes,
     * interfaces and variables.
     * @example
     *     // declare package "zebkit.log"
     *     zebkit.package("log", function(pkg) {
     *         // declare the package class Log
     *         pkg.Log = zebkit.Class([
     *              function error() { ... },
     *              function warn()  { ... },
     *              function info()  { ... }
     *         ]);
     *     });
     *
     *     // later on you can use the declared package stuff as follow
     *     zebkit.require("log", function(log) {
     *         var myLog = new log.Log();
     *         ...
     *         myLog.warn("Warning");
     *     });
     *
     * @return {zebkit.Package} a package
     * @method package
     */
    Package.prototype.package = function(name, callback) {
        // no arguments than return the package itself
        if (arguments.length === 0) {
            return this;
        }

        var target = this;
        if (typeof arguments[0] !== 'function') {
            if (typeof name === 'undefined' || name === null) {
                throw new Error("Null package name");
            }

            name = name.trim();
            if (name.match(/^[a-zA-Z_][a-zA-Z0-9_]+(\.[a-zA-Z_][a-zA-Z0-9_]+)*$/) === null) {
                throw new Error("Invalid package name '" + name + "'");
            }

            var names = name.split('.');
            for(var i = 0, k = names[0]; i < names.length; i++, k = k + '.' + names[i]) {
                var n = names[i], p = target[n];
                if (typeof p === "undefined") {
                    p = new Package(n, target);
                    target[n] = p;
                } else if ((p instanceof Package) === false) {
                    throw new Error("Requested package '" + name +  "' conflicts with variable '" + n + "'");
                }
                target = p;
            }
        }

        // detect url later then sonner since
        if (target.$url === null) {
            target.$detectLocation();
        }

        if (typeof arguments[arguments.length - 1] === 'function') {
            var f = arguments[arguments.length - 1];

            this.then(function() {
                f.call(target, target, typeof zebkit !== 'undefined' ? zebkit.Class : null);
                $lsall.call(target, target.fullname() + "."); // resolve "clazz.$name" properties of the package classes
            });
        }

        return target;
    };

    // =================================================================================================
    //
    //   Zebkit root package declaration
    //
    // =================================================================================================
    var zebkit = new Package("zebkit");

    /**
     * Reference to zebkit environment. Environment is basic, minimal API
     * zebkit and its components require.
     * @for  zebkit
     * @attribute environment
     * @readOnly
     * @type {Object}
     */
    zebkit.environment = zenv;

    // declaring zebkit as a global variable has to be done before calling "package" method
    // otherwise the method cannot find zebkit to resolve class names
    //
    // nodejs
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = zebkit;

        // TODO: not a good pattern to touch global space, but zebkit has to be visible
        // globally
        if (typeof global !== 'undefined') {
            global.zebkit = zebkit;
        }
    } else {
        window.zebkit = zebkit;
    }

    zebkit.package(function(pkg) {
        var $$$     = 11,  // hash code counter
            $caller = null; // currently called method reference

        // single method proxy wrapper
        function ProxyMethod(name, f, clazz) {
            if (typeof f.methodBody !== "undefined") {
                throw new Error("Proxy method '" + name + "' cannot be wrapped");
            }

            var a = function() {
                var cm = $caller;
                $caller = a;
                // don't use finally section it is slower than try-catch
                try {
                    var r = f.apply(this, arguments);
                    $caller = cm;
                    return r;
                } catch(e) {
                    $caller = cm;
                    console.log(name + "(" + arguments.length + ") " + (e.stack ? e.stack : e));
                    throw e;
                }
            };

            a.methodBody = f;
            a.methodName = name;
            a.boundTo    = clazz;
            return a;
        }

        // copy methods from source to destination
        function cpMethods(src, dest, clazz) {
            var overriddenAbstractMethods = 0;
            for(var name in src) {
                if (name   !== pkg.CNAME     &&
                    name   !== "clazz"       &&
                    src.hasOwnProperty(name)   )
                {
                    var method = src[name];
                    if (typeof method === "function" && method !== $toString) {
                        if (name === "$prototype") {
                            method.call(dest, clazz);
                        } else {
                            // TODO analyze if we overwrite existent field
                            if (typeof dest[name] !== 'undefined') {
                                // abstract method is overridden, let's skip abstract method
                                // stub implementation
                                if (method.$isAbstract === true) {
                                    overriddenAbstractMethods++;
                                    continue;
                                }

                                if (dest[name].boundTo === clazz) {
                                    throw new Error("Method '" + name + "(...)'' bound to this class already exists");
                                }
                            }

                            if (typeof method.methodBody !== "undefined") {
                                dest[name] = ProxyMethod(name, method.methodBody, clazz);
                            } else {
                                dest[name] = ProxyMethod(name, method, clazz);
                            }

                            // save information about abstract method
                            if (method.$isAbstract === true) {
                                dest[name].$isAbstract = true;
                            }
                        }
                    }
                }
            }

            return overriddenAbstractMethods;
        }

        function $toString() {
            return this.$hash$;
        }

        // return function that is meta class
        //  instanceOf      - parent template function (can be null)
        //  templateConstructor - template function,
        //  inheritanceList     - parent class and interfaces
        function make_template(instanceOf, templateConstructor, inheritanceList) {
            // supply template with unique identifier that is returned with toString() method
            templateConstructor.$hash$   = "$zEk$" + ($$$++);
            templateConstructor.toString = $toString;
            templateConstructor.prototype.clazz = templateConstructor; // instances of the template has to point to the template as a class

            templateConstructor.clazz = templateConstructor.constructor = instanceOf;

            /**
             *  Unique string hash code. The property is not defined if the class was not
             *  maid hashable by calling "hashable()" method.
             *  @attribute $hash$
             *  @private
             *  @type {String}
             *  @for  zebkit.Class
             *  @readOnly
             */

            /**
             * Dictionary of all inherited interfaces where key is unique interface hash code and the value
             * is interface itself.
             * @private
             * @readOnly
             * @for zebkit.Class
             * @type {Object}
             * @attribute $parents
             * @type {Object}
             */
            templateConstructor.$parents = {};

            // instances of the constructor also has to be unique
            // so force toString method population
            templateConstructor.prototype.constructor = templateConstructor; // set constructor of instances to the template

            // setup parent entities
            if (arguments.length > 2 && inheritanceList.length > 0) {
                for(var i = 0; i < inheritanceList.length; i++) {
                    var toInherit = inheritanceList[i];
                    if (typeof toInherit === 'undefined'        ||
                        toInherit === null                      ||
                        typeof toInherit        !== "function"  ||
                        typeof toInherit.$hash$ === "undefined"   )
                    {
                        throw new ReferenceError("Invalid parent class or interface:" + toInherit);
                    }

                    if (typeof templateConstructor.$parents[toInherit.$hash$] !== "undefined") {
                        throw Error("Duplicate toInherit class or interface: " + toInherit);
                    }

                    templateConstructor.$parents[toInherit.$hash$] = toInherit;

                    // if parent has own parents copy the parents references
                    for(var k in toInherit.$parents) {
                        if (typeof templateConstructor.$parents[k] !== "undefined") {
                            throw Error("Duplicate inherited class or interface: " + k);
                        }

                        templateConstructor.$parents[k] = toInherit.$parents[k];
                    }
                }
            }
            return templateConstructor;
        }

        /**
         * Dump the given error to output.
         * @param  {Exception | Object} e an error.
         * @method dumpError
         * @for  zebkit
         */
        pkg.dumpError = function(e) {
            if (typeof console !== "undefined" && typeof console.log !== "undefined") {
                var msg = "zebkit.err [";
                if (typeof Date !== 'undefined') {
                    var date = new Date();
                    msg = msg + date.getDate()   + "/" +
                          (date.getMonth() + 1) + "/" +
                          date.getFullYear() + " " +
                          date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                }

                console.log(msg + "] : " + e);
                if (e === null || typeof e === 'undefined') {
                    console.log("Unknown error");
                } else {
                    console.log((e.stack ? e.stack : e));
                }
            }
        };

        pkg.URI = URI;

        pkg.CNAME = '$';
        pkg.CDNAME = '';

        pkg.$FN = (isString.name !== "isString") ? (function(f) {  // IE stuff
                                                        if (typeof f.$methodName === 'undefined') { // test if name has been earlier detected
                                                            var mt = f.toString().match(/^function\s+([^\s(]+)/);
                                                            f.$methodName = (mt === null) ? pkg.CDNAME
                                                                                          : (typeof mt[1] === "undefined" ? pkg.CDNAME
                                                                                                                          : mt[1]);
                                                        }
                                                        return f.$methodName;
                                                    })
                                                 : (function(f) { return f.name; });


        pkg.isIE    = isInBrowser && (Object.hasOwnProperty.call(window, "ActiveXObject") || !!window.ActiveXObject || window.navigator.userAgent.indexOf("Edge") > -1);
        pkg.isFF    = isInBrowser && window.mozInnerScreenX !== null;
        pkg.isMacOS = isInBrowser && navigator.platform.toUpperCase().indexOf('MAC') !== -1;

        /**
         * Check if the given value is string
         * @param {Object} v a value.
         * @return {Boolean} true if the given value is string
         * @method isString
         * @for zebkit
         */
        pkg.isString = isString;

        /**
         * Check if the given value is number
         * @param {Object} v a value.
         * @return {Boolean} true if the given value is number
         * @method isNumber
         * @for zebkit
         */
        pkg.isNumber = isNumber;

        /**
         * Check if the given value is boolean
         * @param {Object} v a value.
         * @return {Boolean} true if the given value is boolean
         * @method isBoolean
         * @for zebkit
         */
        pkg.isBoolean = isBoolean;

        /**
         * Reference to global space.
         * @attribute $global
         * @private
         * @readOnly
         * @type {Object}
         * @for zebkit
         */
        pkg.$global = $global;


        pkg.$Map = function() {
            var Map = function() {
                this.keys   = [];
                this.values = [];
                this.size   = 0 ;
            };

            Map.prototype = {
                set : function(key, value) {
                    var i = this.keys.indexOf(key);
                    if (i < 0) {
                        this.keys.push(key);
                        this.values.push(value);
                        this.size++;
                    } else {
                       this.values[i] = value;
                    }
                    return this;
                 },

                delete: function(key) {
                    var i = this.keys.indexOf(key);
                    if (i < 0) {
                       return false;
                    }

                    this.keys.splice(i, 1);
                    this.values.splice(i, 1);
                    this.size--;
                    return true;
                },

                get : function(key) {
                    var i = this.keys.indexOf(key);
                    return i < 0 ? undefined : this.values[i];
                },

                clear : function() {
                    this.keys = [];
                    this.keys.length = 0;
                    this.values = [];
                    this.values.length = 0;
                    this.size = 0;
                },

                has : function(key) {
                    return this.keys.indexOf(key) >= 0;
                },

                forEach: function(callback, context) {
                    var $this = arguments.length < 2 ? this : context;
                    for(var i = 0 ; i < this.size; i++) {
                        callback.call($this, this.values[i], this.keys[i], this);
                    }
                }
            };

            return Map;
        };

        // ES6 Map is class
        if (typeof Map === 'undefined' && (typeof pkg.$global !== 'undefined' || typeof pkg.$global.Map === "undefined")) {
            pkg.$global.Map = pkg.$Map();
        }

        /**
         * Clone the given object. The method tries to perform deep cloning by
         * traversing the given object structure recursively. Any part of an
         * object can be marked as not cloneable by adding  "$notCloneable"
         * field that equals to true. Also at any level of object structure
         * the cloning can be customized with adding "$clone" method. In this
         * case the method will be used to clone the part of object.
         * clonable
         * @param  {Object} obj an object to be cloned
         * @return {Object} a cloned object
         * @method  clone
         * @for  zebkit
         */
        pkg.clone = function (obj, map) {
            // clone atomic type
            // TODO: to speedup cloning we don't use isString, isNumber, isBoolean
            if (obj === null || typeof obj === 'undefined' || obj.$notCloneable === true ||
                                                              (typeof obj === "string"  || obj.constructor === String  ) ||
                                                              (typeof obj === "boolean" || obj.constructor === Boolean ) ||
                                                              (typeof obj === "number"  || obj.constructor === Number  )    )
            {
                return obj;
            }

            map = map || new Map();
            var t = map.get(obj);
            if (typeof t !== "undefined") {
                return t;
            }

            // clone with provided custom "clone" method
            if (typeof obj.$clone !== "undefined") {
                return obj.$clone(map);
            }

            // clone array
            if (Array.isArray(obj)) {
                var naobj = [];

                map.set(obj, naobj);
                map[obj] = naobj;

                for(var i = 0; i < obj.length; i++) {
                    naobj[i] = pkg.clone(obj[i], map);
                }
                return naobj;
            }

            // clone class
            if (obj.clazz === pkg.Class) {
                var clazz = pkg.Class(obj, []);
                clazz.inheritProperties = true;
                return clazz;
            }

            // function cannot be cloned
            if (typeof obj === 'function' || obj.constructor !==  Object) {
                return obj;
            }

            var nobj = {};
            map.set(obj, nobj);

            // clone object fields
            for(var k in obj) {
                if (obj.hasOwnProperty(k) === true) {
                    nobj[k] = pkg.clone(obj[k], map);
                }
            }

            return nobj;
        };

        /**
         * Instantiate a new class instance of the given class with the specified constructor
         * arguments.
         * @param  {Function} clazz a class
         * @param  {Array} [args] an arguments list
         * @return {Object}  a new instance of the given class initialized with the specified arguments
         * @method newInstance
         * @for  zebkit
         */
        pkg.newInstance = function(clazz, args) {
            if (arguments.length > 1 && args.length > 0) {
                var f = function () {};
                f.prototype = clazz.prototype;
                var o = new f();
                clazz.apply(o, args);
                return o;
            }
            return new clazz();
        };

        /**
         * Get a property setter method if it is declared with the class of the specified object for the
         * given property. Setter is a method whose name matches the following pattern: "set<PropertyName>"
         * where the first letter of the property name is in upper case. For instance setter method for
         * property "color" has to have name "setColor".
         * @param  {Object} obj an object instance
         * @param  {String} name a property name
         * @return {Function}  a method that can be used as a setter for the given property
         * @method  getPropertySetter
         * @protected
         * @for  zebkit
         */
        pkg.getPropertySetter = function(obj, name) {
            var pi = obj.constructor.$propertyInfo, m = null;
            if (typeof pi !== 'undefined') {
                if (typeof pi[name] === "undefined") {
                    m = obj[ "set" + name[0].toUpperCase() + name.substring(1) ];
                    pi[name] = (typeof m  === "function") ? m : null;
                }
                return pi[name];
            }

            m = obj[ "set" + name[0].toUpperCase() + name.substring(1) ];
            return (typeof m  === "function") ? m : null;
        };

        /**
         * Populate the given target object with the properties set. The properties set
         * is a dictionary that keeps properties names and its corresponding values.
         * The method detects if a property setter method exits and call it to apply
         * the property value. Otherwise property is initialized as a field. Setter
         * method is a method that matches "set<PropertyName>" pattern.
         * @param  {Object} target a target object
         * @param  {Object} p   a properties set
         * @return {Object} an object with the populated properties set.
         * @method  properties
         * @for  zebkit
         */
        pkg.properties = function(target, p) {
            for(var k in p) {
                // skip private properties( properties that start from "$")
                if (k !== "clazz" && k[0] !== '$' && p.hasOwnProperty(k) && typeof p[k] !== "undefined" && typeof p[k] !== 'function') {
                    if (k[0] === '-') {
                        delete target[k.substring(1)];
                    } else {
                        var v = p[k],
                            m = zebkit.getPropertySetter(target, k);

                        // value factory detected
                        if (v !== null && typeof v.$new !== 'undefined') {
                            v = v.$new();
                        }

                        if (m === null) {
                            target[k] = v;  // setter doesn't exist, setup it as a field
                        } else {
                            // property setter is detected, call setter to
                            // set the property value
                            if (Array.isArray(v)) {
                                m.apply(target, v);
                            } else {
                                m.call(target, v);
                            }
                        }
                    }
                }
            }
            return target;
        };

        function $make_proto(props, superProto) {
            if (superProto === null) {
                return function $prototype(clazz) {
                    for(var k in props) {
                        if (props.hasOwnProperty(k)) {
                            this[k] = props[k];
                        }
                    }
                };
            } else {
                return function $prototype(clazz) {
                    superProto.call(this, clazz);
                    for(var k in props) {
                        if (props.hasOwnProperty(k)) {
                            this[k] = props[k];
                        }
                    }
                };
            }
        }

        /**
         * Interface is way to share common functionality by avoiding multiple inheritance.
         * It allows developers to mix number of methods to different classes. For instance:

        // declare "I" interface that contains one method a
        var I = zebkit.Interface([
            function a() {

            }
        ]);

        // declare "A" class
        var A = zebkit.Class([]);

        // declare "B" class that inherits class A and mix interface "I"
        var B = zebkit.Class(A, I, []);

        // instantiate "B" class
        var b = new B();
        zebkit.instanceOf(b, I);  // true
        zebkit.instanceOf(b, A);  // true
        zebkit.instanceOf(b, B);  // true

        // call mixed method
        b.a();

         * @return {Function} an interface
         * @param {Array} [methods] list of methods declared in the interface
         * @constructor
         * @class  zebkit.Interface
         */
        pkg.Interface = make_template(null, function() {
            var $Interface = make_template(pkg.Interface, function() {
                // Clone interface  parametrized with the given properties set
                if (typeof this === 'undefined' || this.constructor !== $Interface) {  // means the method execution is not a result of "new" method
                    if (arguments.length !== 1) {
                        throw new Error("Invalid number of arguments. Properties set is expected");
                    }

                    if (arguments[0].constructor !== Object) {
                        throw new Error("Invalid argument type. Properties set is expected");
                    }

                    var clone = $Interface.$clone();
                    clone.prototype.$prototype = $make_proto(arguments[0],
                                                             $Interface.prototype.$prototype);
                    return clone;
                } else {
                    // Create a class that inherits the interface and instantiate it
                    if (arguments.length > 1) {
                        throw new Error("One or zero argument is expected");
                    }
                    return new (pkg.Class($Interface, arguments.length > 0 ? arguments[0] : []))();
                }
            });

            if (arguments.length > 1) {
                throw new Error("Invalid number of arguments. List of methods or properties is expected");
            }

            // abstract method counter, not used now, but can be used in the future
            // to understand if the given class override all abstract methods (should be
            // controlled in the places of "cpMethods" call)
            $Interface.$abstractMethods = 0;

            var arg = arguments.length === 0 ? [] : arguments[0];
            if (arg.constructor === Object) {
                arg = [ $make_proto(arg, null) ];
            } else if (Array.isArray(arg) === false) {
                throw new Error("Invalid argument type. List of methods pr properties is expected");
            }

            if (arg.length > 0) {
                var  proto      = $Interface.prototype,
                     isAbstract = false;

                for(var i = 0; i < arg.length; i++) {
                    var method = arg[i];

                    if (method === "abstract") {
                        isAbstract = true;
                    } else {
                        if (typeof method !== "function") {
                            throw new Error("Method is expected instead of " + method);
                        }

                        var name = pkg.$FN(method);
                        if (name === pkg.CDNAME) {
                            throw new Error("Constructor declaration is not allowed in interface");
                        }

                        if (typeof proto[name] !== 'undefined') {
                            throw new Error("Duplicated interface method '" + name + "(...)'");
                        }

                        if (name === "$clazz") {
                            method.call($Interface, $Interface);
                        } else if (isAbstract === true) {
                            (function(name) {
                                proto[name] = function() {
                                    throw new Error("Abstract method '" + name + "(...)' is not implemented");
                                };

                                // mark method as abstract
                                proto[name].$isAbstract = true;

                                // count abstract methods
                                $Interface.$abstractMethods++;
                            })(name);
                        } else {
                            proto[name] = method;
                        }
                    }
                }
            }

            /**
             * Private implementation of an interface cloning.
             * @return {zebkit.Interface} a clone of the interface
             * @method $clone
             * @private
             */
            $Interface.$clone = function() {
                var clone = pkg.Interface(), k = null; // create interface

                // clone interface level variables
                for(k in this) {
                    if (this.hasOwnProperty(k)) {
                        clone[k] = pkg.clone(this[k]);
                    }
                }

                // copy methods from proto
                var proto = this.prototype;
                for(k in proto) {
                    if (k !== "clazz" && proto.hasOwnProperty(k) === true) {
                        clone.prototype[k] = pkg.clone(proto[k]);
                    }
                }

                return clone;
            };

            $Interface.clazz.$name = "zebkit.Interface"; // assign name
            return $Interface;
        });

        /**
         * Core method method to declare a zebkit class following easy OOP approach. The easy OOP concept
         * supports the following OOP features:
         *
         *
         *  __Single class inheritance.__ Any class can extend an another zebkit class

        // declare class "A" that with one method "a"
        var A = zebkit.Class([
            function a() { ... }
        ]);

        // declare class "B" that inherits class "A"
        var B = zebkit.Class(A, []);

        // instantiate class "B" and call method "a"
        var b = new B();
        b.a();


        * __Class method overriding.__ Override a parent class method implementation

        // declare class "A" that with one method "a"
        var A = zebkit.Class([
            function a() { ... }
        ]);

        // declare class "B" that inherits class "A"
        // and overrides method a with an own implementation
        var B = zebkit.Class(A, [
            function a() { ... }
        ]);


        * __Constructors.__ Constructor is a method with empty name

        // declare class "A" that with one constructor
        var A = zebkit.Class([
            function () { this.variable = 100; }
        ]);

        // instantiate "A"
        var a = new A();
        a.variable // variable is 100

        * __Static methods and variables declaration.__ Static fields and methods can be defined
            by declaring special "$clazz" method whose context is set to declared class

        var A = zebkit.Class([
            // special method where static stuff has to be declared
            function $clazz() {
                // declare static field
                this.staticVar = 100;
                // declare static method
                this.staticMethod = function() {};
            }
        ]);

        // access static field an method
        A.staticVar      // 100
        A.staticMethod() // call static method

        * __Access to super class context.__ You can call method declared in a parent class

        // declare "A" class with one class method "a(p1,p2)"
        var A = zebkit.Class([
            function a(p1, p2) { ... }
        ]);

        // declare "B" class that inherits "A" class and overrides "a(p1,p2)" method
        var B = zebkit.Class(A, [
            function a(p1, p2) {
                // call "a(p1,p2)" method implemented with "A" class
                this.$super(p1,p2);
            }
        ]);

         *
         *  One of the powerful feature of zebkit easy OOP concept is possibility to instantiate
         *  anonymous classes and interfaces. Anonymous class is an instance of an existing
         *  class that can override the original class methods with own implementations, implements
         *  own list of interfaces and methods. In other words the class instance customizes class
         *  definition for the particular instance of the class;

        // declare "A" class
        var A = zebkit.Class([
            function a() { return 1; }
        ]);

        // instantiate anonymous class that add an own implementation of "a" method
        var a = new A([
            function a() { return 2; }
        ]);
        a.a() // return 2

         * @param {zebkit.Class} [inheritedClass] an optional parent class to be inherited
         * @param {zebkit.Interface} [inheritedInterfaces]* an optional list of interfaces for
         * the declared class to be mixed in the class
         * @param {Array} methods list of declared class methods. Can be empty array.
         * @return {Function} a class definition
         * @constructor
         * @class zebkit.Class
         */
        var mixing = pkg.$mixing = function(clazz, methods) {
            if (Array.isArray(methods) === false) {
                throw new Error("Methods array is expected (" + methods + ")");
            }

            var names = {};
            for(var i = 0; i < methods.length; i++) {
                var method     = methods[i],
                    methodName = pkg.$FN(method);

                // detect if the passed method is proxy method
                if (typeof method.methodBody !== 'undefined') {
                    throw new Error("Proxy method '" + methodName + "' cannot be mixed in a class");
                }

                // map user defined constructor to internal constructor name
                if (methodName === pkg.CDNAME) {
                    methodName = pkg.CNAME;
                } else if (methodName[0] === '$') {
                    // populate prototype fields if a special method has been defined
                    if (methodName === "$prototype") {
                        method.call(clazz.prototype, clazz);
                        if (clazz.prototype[pkg.CDNAME]) {
                            clazz.prototype[pkg.CNAME] = clazz.prototype[pkg.CDNAME];
                            delete clazz.prototype[pkg.CDNAME];
                        }
                        continue;
                    }

                    // populate class level fields if a special method has been defined
                    if (methodName === "$clazz") {
                        method.call(clazz);
                        continue;
                    }
                }

                if (names[methodName] === true) {
                    throw new Error("Duplicate declaration of '" + methodName+ "(...)' method");
                }

                var existentMethod = clazz.prototype[methodName];
                if (typeof existentMethod !== 'undefined' && typeof existentMethod !== 'function') {
                    throw new Error("'" + methodName + "(...)' method clash with a field");
                }

                // if constructor doesn't have super definition than let's avoid proxy method
                // overhead
                if (typeof existentMethod === 'undefined' && methodName === pkg.CNAME) {
                    clazz.prototype[methodName] = method;
                } else {
                    // Create and set proxy method that is bound to the given class
                    clazz.prototype[methodName] = ProxyMethod(methodName, method, clazz);
                }

                // save method we have already added to check double declaration error
                names[methodName] = true;
            }
        };

        // create Class template what means we define a function (meta class) that has to be used to define
        // Class. That means we define a function that returns another function that is a Class
        pkg.Class = make_template(null, function() {
            if (arguments.length === 0) {
                throw new Error("No class method list was found");
            }

            if (Array.isArray(arguments[arguments.length - 1]) === false) {
                throw new Error("No class methods have been passed");
            }

            if (arguments.length > 1 && typeof arguments[0] !== "function")  {
                throw new ReferenceError("Invalid parent class or interface '" + arguments[0] + "'");
            }

            var classMethods = arguments[arguments.length - 1],
                parentClass  = null,
                toInherit    = [];

            // detect parent class in inheritance list as the first argument that has "clazz" set to Class
            if (arguments.length > 0 && (arguments[0] === null || arguments[0].clazz === pkg.Class)) {
                parentClass = arguments[0];
            }

            // use instead of slice for performance reason
            for(var i = 0; i < arguments.length - 1; i++) {
                toInherit[i] = arguments[i];

                // let's make sure we inherit interface
                if (parentClass === null || i > 0) {
                    if (typeof toInherit[i] === 'undefined' || toInherit[i] === null) {
                        throw new ReferenceError("Undefined inherited interface [" + i + "] " );
                    } else if (toInherit[i].clazz !== pkg.Interface) {
                        throw new ReferenceError("Inherited interface is not an Interface ( [" + i + "] '" + toInherit[i] + "'')");
                    }
                }
            }

            // define Class (function) that has to be used to instantiate the class instance
            var classTemplate = make_template(pkg.Class, function() {
                if (classTemplate.$uniqueness === true) {
                    this.$hash$ = "$ZkIo" + ($$$++);
                }

                if (arguments.length > 0) {
                    var a = arguments[arguments.length - 1];

                    // anonymous is customized class instance if last arguments is array of functions
                    if (Array.isArray(a) === true && typeof a[0] === 'function') {
                        a = a[0];

                        // prepare arguments list to declare an anonymous class
                        var args = [ classTemplate ],      // first of all the class has to inherit the original class
                            k    = arguments.length - 2;

                        // collect interfaces the anonymous class has to implement
                        for(; k >= 0 && arguments[k].clazz === pkg.Interface; k--) {
                            args.push(arguments[k]);
                        }

                        // add methods list
                        args.push(arguments[arguments.length - 1]);

                        var cl = pkg.Class.apply(null, args),  // declare new anonymous class
                            // create a function to instantiate an object that will be made the
                            // anonymous class instance. The intermediate object is required to
                            // call constructor properly since we have arguments as an array
                            f  = function() {};

                        cl.$name = classTemplate.$name; // the same class name for anonymous
                        f.prototype = cl.prototype; // the same prototypes

                        var o = new f();

                        // call constructor
                        // use array copy instead of cloning with slice for performance reason
                        // (Array.prototype.slice.call(arguments, 0, k + 1))
                        args = [];
                        for (var i = 0; i < k + 1; i++) {
                            args[i] = arguments[i];
                        }
                        cl.apply(o, args);

                        // set constructor field for consistency
                        o.constructor = cl;
                        return o;
                    }
                }

                // call class constructor
                if (typeof this.$ !== 'undefined') { // TODO: hard-coded constructor name to speed up
                    return this.$.apply(this, arguments);
                }
            }, toInherit);


            /**
             *  Internal attribute that caches properties setter references.
             *  @attribute $propertyInfo
             *  @type {Object}
             *  @private
             *  @for zebkit.Class
             *  @readOnly
             */
            // prepare fields that caches the class properties. existence of the property
            // force getPropertySetter method to cache the method
            classTemplate.$propertyInfo = {};

            /**
             *  Reference to a parent class
             *  @attribute $parent
             *  @type {zebkit.Class}
             *  @protected
             *  @readOnly
             */

            // copy parents prototype methods and fields into
            // new class template
            classTemplate.$parent = parentClass;
            if (parentClass !== null) {
                for(var k in parentClass.prototype) {
                    if (parentClass.prototype.hasOwnProperty(k)) {
                        var f = parentClass.prototype[k];
                        classTemplate.prototype[k] = (typeof f !== 'undefined' &&
                                                      f !== null &&
                                                      f.hasOwnProperty("methodBody")) ? ProxyMethod(f.methodName, f.methodBody, f.boundTo)
                                                                                      : f;
                    }
                }
            }

            /**
             * Extend existent class instance with the given methods and interfaces
             * For example:

                var A = zebkit.Class([ // declare class A that defines one "a" method
                    function a() {
                        console.log("A:a()");
                    }
                ]);

                var a = new A();
                a.a();  // show "A:a()" message

                A.a.extend([
                    function b() {
                        console.log("EA:b()");
                    },

                    function a() {   // redefine "a" method
                        console.log("EA:a()");
                    }
                ]);

                a.b(); // show "EA:b()" message
                a.a(); // show "EA:a()" message

             * @param {zebkit.Interface} [interfaces]* interfaces to be implemented with the
             * class instance
             * @param {Array} methods list of methods the class instance has to be extended
             * with
             * @method extend
             * @for zebkit.Class.zObject
             */
            classTemplate.prototype.extend = function() {
                var clazz = this.clazz,
                    l = arguments.length,
                    f = arguments[l - 1],
                    hasArray = Array.isArray(f),
                    i = 0;

                // replace the instance class with a new intermediate class
                // that inherits the replaced class. it is done to support
                // $super method calls.
                if (this.$isExtended !== true) {
                    clazz = pkg.Class(clazz, []);
                    this.$isExtended = true;         // mark the instance as extended to avoid double extending.
                    clazz.$name = this.clazz.$name;
                    this.clazz = clazz;
                }

                if (hasArray) {
                    var init = null;
                    for(i = 0; i < f.length; i++) {
                        var n = pkg.$FN(f[i]);
                        if (n === pkg.CDNAME) {
                            init = f[i];  // postpone calling initializer before all methods will be defined
                        } else {
                            if (typeof this[n] !== 'undefined' && typeof this[n] !== 'function') {
                                throw new Error("Method '" + n + "' clash with a property");
                            }
                            this[n] = ProxyMethod(n, f[i], clazz);
                        }
                    }

                    if (init !== null) {
                        init.call(this);
                    }
                    l--;
                }

                // add new interfaces if they has been passed
                for (i = 0; i < arguments.length - (hasArray ? 1 : 0); i++) {
                    if (arguments[i].clazz !== pkg.Interface) {
                        throw new Error("Invalid argument " + arguments[i] + " Interface is expected.");
                    }

                    var I = arguments[i];
                    if (typeof clazz.$parents[I.$hash$] !== 'undefined') {
                        throw new Error("Interface has been already inherited");
                    }

                    cpMethods(I.prototype, this, clazz);
                    clazz.$parents[I.$hash$] = I;
                }
                return this;
            };

            /**
             * Call super method implementation.
             * @param {Function} [superMethod]? optional parameter that should be a method of the class instance
             * that has to be called
             * @param {Object} [args]* arguments list to pass the executed method
             * @return {Object} return what super method returns
             * @method $super
             * @example
             *
             *    var A = zebkit.Class([
             *        function a(p) { return 10 + p; }
             *    ]);
             *
             *    var B = zebkit.Class(A, [
             *        function a(p) {
             *            return this.$super(p) * 10;
             *        }
             *    ]);
             *
             *    var b = new B();
             *    b.a(10) // return 200
             *
             * @for zebkit.Class.zObject
             */
            classTemplate.prototype.$super = function() {
               if ($caller !== null) {
                    for (var $s = $caller.boundTo.$parent; $s !== null; $s = $s.$parent) {
                        var m = $s.prototype[$caller.methodName];
                        if (typeof m !== 'undefined') {
                            return m.apply(this, arguments);
                        }
                    }

                    // handle method not found error
                    var cln = this.clazz && this.clazz.$name ? this.clazz.$name + "." : "";
                    throw new ReferenceError("Method '" +
                                             cln +
                                             ($caller.methodName === pkg.CNAME ? "constructor"
                                                                               : $caller.methodName) + "(" + arguments.length + ")" + "' not found");
                } else {
                    throw new Error("$super is called outside of class context");
                }
            };

            // TODO: not stable API
            classTemplate.prototype.$supera = function(args) {
               if ($caller !== null) {
                    for (var $s = $caller.boundTo.$parent; $s !== null; $s = $s.$parent) {
                        var m = $s.prototype[$caller.methodName];
                        if (typeof m !== 'undefined') {
                            return m.apply(this, args);
                        }
                    }

                    // handle method not found error
                    var cln = this.clazz && this.clazz.$name ? this.clazz.$name + "." : "";
                    throw new ReferenceError("Method '" +
                                             cln +
                                             ($caller.methodName === pkg.CNAME ? "constructor"
                                                                               : $caller.methodName) + "(" + arguments.length + ")" + "' not found");
                } else {
                    throw new Error("$super is called outside of class context");
                }
            };

            // TODO: not stable API, $super that doesn't throw exception is there is no super implementation
            classTemplate.prototype.$$super = function() {
               if ($caller !== null) {
                    for(var $s = $caller.boundTo.$parent; $s !== null; $s = $s.$parent) {
                        var m = $s.prototype[$caller.methodName];
                        if (typeof m !== 'undefined') {
                            return m.apply(this, arguments);
                        }
                    }
                } else {
                    throw new Error("$super is called outside of class context");
                }
            };

            /**
             * Get a first super implementation of the given method in a parent classes hierarchy.
             * @param  {String} name a name of the method
             * @return {Function} a super method implementation
             * @method  $getSuper
             * @for  zebkit.Class.zObject
             */
            classTemplate.prototype.$getSuper = function(name) {
               if ($caller !== null) {
                    for(var $s = $caller.boundTo.$parent; $s !== null; $s = $s.$parent) {
                        var m = $s.prototype[name];
                        if (typeof m === 'function') {
                            return m;
                        }
                    }
                    return null;
                }
                throw new Error("$super is called outside of class context");
            };

            classTemplate.prototype.$genHash = function() {
                if (typeof this.$hash$ === 'undefined') {
                    this.$hash$ = "$ZeInGen" + ($$$++);
                }
                return this.$hash$;
            };

            classTemplate.prototype.$clone = function(map) {
                map = map || new Map();

                var f = function() {};
                f.prototype = this.constructor.prototype;
                var nobj = new f();
                map.set(this, nobj);

                for(var k in this) {
                    if (this.hasOwnProperty(k)) {
                        // obj's layout is obj itself
                        var t = map.get(this[k]);
                        if (t !== undefined) {
                            nobj[k] = t;
                        } else {
                            nobj[k] = zebkit.clone(this[k], map);
                        }
                    }
                }

                // speed up clearing resources
                map.clear();

                nobj.constructor = this.constructor;

                if (typeof nobj.$hash$ !== 'undefined') {
                    nobj.$hash$ = "$zObj_" + ($$$++);
                }

                nobj.clazz = this.clazz;
                return nobj;
            };

            /**
             * The instance class.
             * @attribute clazz
             * @type {zebkit.Class}
             */
            classTemplate.prototype.clazz = classTemplate;

            // check if the method has been already defined in the class
            if (typeof classTemplate.prototype.properties === 'undefined') {
                classTemplate.prototype.properties = function(p) {
                    return pkg.properties(this, p);
                };
            }

            // copy methods from interfaces before mixing class methods
            if (toInherit.length > 0) {
                for(var i = toInherit[0].clazz === pkg.Interface ? 0 : 1; i < toInherit.length; i++) {
                    var  ic = toInherit[i];
                    cpMethods(ic.prototype, classTemplate.prototype, classTemplate);

                    // copy static fields from interface to the class
                    for(var sk in ic) {
                        if (sk[0] !== '$' &&
                            ic.hasOwnProperty(sk) === true &&
                            classTemplate.hasOwnProperty(sk) === false)
                        {
                            classTemplate[sk] = pkg.clone(ic[sk]);
                        }
                    }
                }
            }

            // add class declared methods
            mixing(classTemplate, classMethods);

            // populate static fields
            // TODO: exclude the basic static methods and static constant
            // static inheritance

            classTemplate.$uniqueness = false;
            if (parentClass !== null) {
                for (var key in parentClass) {
                    if (key[0] !== '$' &&
                        parentClass.hasOwnProperty(key) &&
                        classTemplate.hasOwnProperty(key) === false)
                    {
                        classTemplate[key] = pkg.clone(parentClass[key]);
                    }
                }

                if (parentClass.$uniqueness === true) {
                    classTemplate.hashable();
                }
            }

            /**
             * Makes the class hashable. Hashable class instances are automatically
             * gets unique hash code that is returned with its overridden "toString()"
             * method. The hash code is stored in special "$hash$" field. The feature
             * can be useful when you want to store class instances in "{}" object
             * where key is the hash and the value is the instance itself.
             * @method hashable
             * @chainable
             * @for zebkit.Class
             */
            classTemplate.hashable = function() {
                if (this.$uniqueness !== true) {
                    this.$uniqueness = true;
                    this.prototype.toString = $toString;
                }
                return this;
            };

            /**
             * Makes the class hashless. Prevents generation of hash code for
             * instances of the class.
             * @method hashless
             * @chainable
             * @for zebkit.Class
             */
            classTemplate.hashless = function() {
                if (this.$uniqueness === true) {
                    this.$uniqueness = false;
                    this.prototype.toString = Object.prototype.toString;
                }
                return this;
            };

            /**
             * Extend the class with new method and implemented interfaces.
             * @param {zebkit.Interface} [interfaces]*  number of interfaces the class has to implement.
             * @param {Array} methods set of methods the given class has to be extended.
             * @method extend
             * @for  zebkit.Class
             */

            // add extend method later to avoid the method be inherited as a class static field
            classTemplate.extend = function() {
                var methods    = arguments[arguments.length - 1],
                    hasMethod  = Array.isArray(methods);

                // inject class
                if (hasMethod && this.$isExtended !== true) {
                    // create intermediate class
                    var A = this.$parent !== null ? pkg.Class(this.$parent, [])
                                                  : pkg.Class([]);

                    // copy this class prototypes methods to intermediate class A and re-define
                    // boundTo to the intermediate class A if they were bound to source class
                    // methods that have been  moved from source class to class have to be re-bound
                    // to A class
                    for(var name in this.prototype) {
                        if (name !== "clazz" && this.prototype.hasOwnProperty(name) ) {
                            var f = this.prototype[name];
                            if (typeof f === 'function') {
                                A.prototype[name] = typeof f.methodBody !== 'undefined' ? ProxyMethod(name, f.methodBody, f.boundTo)
                                                                                        : f;

                                if (A.prototype[name].boundTo === this) {
                                    A.prototype[name].boundTo = A;
                                    if (f.boundTo === this) {
                                        f.boundTo = A;
                                    }
                                }
                            }
                        }
                    }

                    this.$parent = A;
                    this.$isExtended = true;
                }

                if (hasMethod) {
                    mixing(this, methods);
                }

                // add passed interfaces
                for(var i = 0; i < arguments.length - (hasMethod ? 1 : 0); i++) {
                    var I = arguments[i];
                    if (I === null || typeof I === 'undefined' || I.clazz !== zebkit.Interface) {
                        throw new Error("Interface is expected");
                    }

                    if (typeof this.$parents[I.$hash$] !== 'undefined') {
                        throw new Error("Interface has been already inherited");
                    }

                    cpMethods(I.prototype, this.prototype, this);
                    this.$parents[I.$hash$] = I;
                }
            };

            /**
             * Tests if the given class inherits the given class or interface.
             * @param  {zebkit.Class | zebkit.Interface}  clazz a class or interface.
             * @return {Boolean} true if the class or interface is inherited with
             * the class.
             * @method  isInherit
             * @for  zebkit.Class
             */
            classTemplate.isInherit = function(clazz) {
                if (this !== clazz) {
                    // detect class
                    if (clazz.clazz === this.clazz) {
                        for (var p = this.$parent; p !== null; p = p.$parent) {
                            if (p === clazz) {
                                return true;
                            }
                        }
                    } else { // detect interface
                        if (this.$parents[clazz.$hash$] === clazz) {
                            return true;
                        }
                    }
                }
                return false;
            };

            // assign proper name to class
            classTemplate.clazz.$name = "zebkit.Class";

            // copy methods from interfaces
            if (toInherit.length > 0) {
                // notify inherited class and interfaces that they have been inherited with the given class
                for(var i = 0; i < toInherit.length; i++) {
                    if (typeof toInherit[i].inheritedWidth === 'function') {
                        toInherit[i].inheritedWidth(classTemplate);
                    }
                }
            }

            return classTemplate;
        });

        var $cachedO = pkg.$cachedO = {},
            $cachedE = pkg.$cachedE = [];

        /**
         * maximal cache size (cache is primary used to keep references to class).
         * @attribute $cacheSize
         * @private
         * @default 7777
         * @type {Number}
         * @for  zebkit
         */
        pkg.$cacheSize = 7777;

        /**
         * Get an object by the given key from cache (and cached it if necessary)
         * @param  {String} key a key to an object. The key is hierarchical reference starting with the global
         * name space as root. For instance "test.a" key will fetch $global.test.a object.
         * @return {Object}  an object
         * @for  zebkit
         * @private
         * @method  $cache
         */
        pkg.$cache = function(key) {
            // don't cache global objects
            if (pkg.$global.hasOwnProperty(key)) {
                return pkg.$global[key];
            }

            if ($cachedO.hasOwnProperty(key) === true) {
                // read cached entry
                var e = $cachedO[key];
                if (e.i < ($cachedE.length-1)) { // cached entry is not last one

                    // move accessed entry to the list tail to increase its access weight
                    var pn = $cachedE[e.i + 1];
                    $cachedE[e.i]   = pn;
                    $cachedE[++e.i] = key;
                    $cachedO[pn].i--;
                }
                return e.o;
            }

            var ctx = pkg.$global, i = 0, j = 0;
            for( ;ctx != null; ) {
                i = key.indexOf('.', j);

                if (i < 0) {
                    ctx = ctx[key.substring(j, key.length)];
                    break;
                }

                ctx = ctx[key.substring(j, i)];
                j = i + 1;
            }

            if (ctx != null) {
                if ($cachedE.length >= pkg.$cacheSize) {
                    // cache is full, replace first element with the new one
                    var n = $cachedE[0];
                    $cachedE[0]   = key;
                    $cachedO[key] = { o: ctx, i: 0 };
                    delete $cachedO[n];
                } else {
                    $cachedO[key] = { o: ctx, i: $cachedE.length };
                    $cachedE[$cachedE.length] = key;
                }
                return ctx;
            }

            throw new Error("Reference '" + key + "' not found");
        };

        /**
         * Get class by the given class name
         * @param  {String} name a class name
         * @return {Function} a class. Throws exception if the class cannot be
         * resolved by the given class name
         * @method forName
         * @throws Error
         * @for  zebkit.Class
         */
        pkg.Class.forName = function(name) {
            return pkg.$cache(name);
        };

        /**
         * Create an instance of the class
         * @param  {Object} [arguments]* arguments to be passed to the class constructor
         * @return {Object} an instance of the class.
         * @method newInstance
         * @for  zebkit.Class
         */
        pkg.Class.newInstance = function() {
            return pkg.newInstance(this, arguments);
        };

        /**
         * Test if the given object is instance of the specified class or interface. It is preferable
         * to use this method instead of JavaScript "instanceof" operator whenever you are dealing with
         * zebkit classes and interfaces.
         * @param  {Object} obj an object to be evaluated
         * @param  {Function} clazz a class or interface
         * @return {Boolean} true if a passed object is instance of the given class or interface
         * @method instanceOf
         * @for  zebkit
         */
        pkg.instanceOf = function(obj, clazz) {
            if (clazz !== null && typeof clazz !== 'undefined') {
                if (obj === null || typeof obj === 'undefined')  {
                    return false;
                } else if (typeof obj.clazz === 'undefined') {
                    return (obj instanceof clazz);
                } else {
                    return typeof obj.clazz !== 'undefined' && obj.clazz !== null &&
                           (obj.clazz === clazz ||
                            obj.clazz.$parents.hasOwnProperty(clazz.$hash$));
                }
            }

            throw new Error("instanceOf(): null class");
        };

        /**
         * Dummy class that implements nothing but can be useful to instantiate
         * anonymous classes with some on "the fly" functionality:
         *
         *     // instantiate and use zebkit class with method "a()" implemented
         *     var ac = new zebkit.Dummy([
         *          function a() {
         *             ...
         *          }
         *     ]);
         *
         *     // use it
         *     ac.a();
         *
         * @constructor
         * @class zebkit.Dummy
         */
        pkg.Dummy = pkg.Class([]);

        pkg.DoIt = DoIt;

        /**
         * Event producer interface. This interface provides number of methods
         * to register, un-register, fire events. It follows on/off notion like
         * JQuery does it. It is expected an event producer class implementation
         * has a special field  "_" that keeps listeners.
         *
         *     var MyClass = zebkit.Class(zebkit.EventProducer, [
         *         function() {
         *             // "fired" events listeners container
         *             this._ = new zebkit.util.Listeners();
         *         }
         *     ]);
         *
         *     var a = new MyClass();
         *     a.on("fired", function(arg) {
         *         // handle "fired" events
         *     });
         *
         *     a.fire(10);
         *
         * @class zebkit.EventProducer
         * @interface zebkit.EventProducer
         */
        pkg.EventProducer = pkg.Interface([
            function $prototype() {
                // on(event, path, cb)  handle the given event for all elements identified with the path
                // on(cb)               handle all events
                // on(path | event, cb) handle the given event or all events for elements matched with the path


                /**
                 * Register listener for the given events types or/and the given nodes in tree-like
                 * structure or listen all events types.
                 * @param {String} [eventName] an event type name to listen. If the event name is not passed
                 * then listen all events types.
                 * @param {String} [path] a xpath-like path to traversing elements in tree and register event
                 * handlers for the found elements. The parameter can be used if the interface is implemented
                 * with tree-like structure (for instance zebkit UI components).
                 * @param {Function|Object} cb a listener method or an object that contains number of methods
                 * to listen the specified events types.
                 * @example
                 *     var comp = new zebkit.ui.Panel();
                 *     comp.add(new zebkit.ui.Button("Test 1").setId("c1"));
                 *     comp.add(new zebkit.ui.Button("Test 2").setId("c2"));
                 *     ...
                 *     // register event handler for children components of "comp"
                 *     comp.on("/*", function() {
                 *         // handle button fired event
                 *         ...
                 *     });
                 *
                 *     // register event handler for button component with id equals "c1"
                 *     comp.on("#c1", function() {
                 *         // handle button fired event
                 *         ...
                 *     });
                 *
                 * @method on
                 */
                this.on = function() {
                    var cb = arguments[arguments.length - 1],  // callback or object
                        pt = null,                             // path
                        nm = null;                             // event name

                    if (cb === null || isString(cb)) {
                        throw new Error("Invalid event handler");
                    }

                    if (arguments.length === 1) {
                        return this._.add(cb);
                    } else if (arguments.length === 2) {
                        if (arguments[0] === null) {
                            throw new Error("Invalid event or path");
                        } else if (arguments[0][0] === '.' || arguments[0][0] === '/' || arguments[0][0] === '#') { // detect path
                            pt = arguments[0];
                        } else {
                            return this._.add(arguments[0], cb);
                        }
                    } else if (arguments.length === 3) {
                        pt = arguments[1];
                        nm = arguments[0];
                        if (pt === null) {
                            return this._.add(nm, cb);
                        }
                    }

                    this.byPath(pt, function(node) {
                        if (typeof node._ !== 'undefined') {
                            if (nm !== null) {
                                if (typeof node._[nm] !== 'undefined') {
                                    node._.add(nm, cb);
                                }
                            } else {
                                node._.add(cb);
                            }
                        }
                        return false;
                    });

                    return cb;
                };

                // off()            remove all events handler
                // off(event)       remove the event handler
                // off(event, path)  remove the event handler for all nodes detected with the path
                // off(path)
                // off(cb)
                // off(path, cb)
                //
                /**
                 * Stop listening the given event type.
                 * @param {String} [eventName] an event type name to stop listening. If the event name is not passed
                 * then stop listening all events types.
                 * @param {String} [path] a xpath-like path to traversing elements in tree and stop listening
                 * the event type for the found in the tree elements. The parameter can be used if the interface
                 * is implemented with tree-like structure (for instance zebkit UI components).
                 * @param [cb] remove the given event handler.
                 * @method off
                 */
                this.off = function() {
                    var pt = null,  // path
                        fn = null,  // handler
                        nm = null;  // event name or listener

                    if (arguments.length === 0) {
                        return this._.remove();
                    } else if (arguments.length === 1) {
                        if (isString(arguments[0]) && (arguments[0][0] === '.' || arguments[0][0] === '/' || arguments[0][0] === '#')) {
                            pt = arguments[0];
                        } else {
                            return this._.remove(arguments[0]);
                        }
                    } else if (arguments.length === 2) {
                        if (isString(arguments[1])) { // detect path
                            pt = arguments[1];
                            nm = arguments[0];
                        } else {
                            if (isString(arguments[1])) {
                                nm = arguments[1];
                            } else {
                                fn = arguments[1];
                            }

                            if (arguments[0][0] === '.' || arguments[0][0] === '/' || arguments[0][0] === '#') {
                                pt = arguments[0];
                            } else {
                                throw new Error("Path is expected");
                            }
                        }
                    }

                    this.byPath(pt, function(node) {
                        if (typeof node._ !== 'undefined') {
                            if (fn !== null) {
                                node._.remove(fn);
                            } else if (nm !== null) {
                                if (typeof node._[nm] !== 'undefined') {
                                    node._.remove(nm);
                                }
                            } else {
                                node._.remove();
                            }
                        }
                        return false;
                    });
                };

                // fire(event, [ a1, a2, ...])
                // fire(event, e)
                // fire(event, path, e)
                // fire(event, path, [a1, a2 ...])
                this.fire = function() {
                    var pt   = null,  // path
                        args = null,
                        nm   = arguments[0];  // event name or listener

                    if (arguments.length >= 0 && arguments.length < 3) {
                        if (arguments.length === 0) {
                            nm = "fired";
                        }

                        if (this._.hasEvent(nm) === false) {
                            throw new Error("Listener doesn't '" + nm + "' support the event");
                        }

                        var fn = this._[nm];
                        args = (arguments.length === 2 ? arguments[1] : this);

                        return arguments.length === 2 && Array.isArray(args) ? fn.apply(this._, args)
                                                                             : fn.call(this._, args);

                    } else if (arguments.length === 3) {
                        pt   = arguments[1];
                        args = arguments[2];
                    } else {
                        throw new Error("Invalid number of arguments");
                    }

                    this.byPath(pt, function(n) {
                        var ec = n._;
                        if (typeof ec !== 'undefined' && n._.hasEvent(nm)) {
                            if (args !== null && Array.isArray(args)) {
                                ec[nm].apply(ec, args);
                            } else {
                                ec[nm].call(ec, args);
                            }
                        }
                        return false;
                    });
                };
            }
        ]);
    });

    if (isInBrowser) {
        zebkit.then(function() {
            var jn        = this.join(),
                $interval = zenv.setInterval(function () {
                if (document.readyState === "complete") {
                    zenv.clearInterval($interval);
                    jn(zebkit);
                }
            }, 100);
        });
    }

    return zebkit;
})();

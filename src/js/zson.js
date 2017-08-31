/**
 * JSON object loader class is a handy way to load hierarchy of objects encoded with
 * JSON format. The class supports standard JSON types plus it extends JSON with a number of
 * features that helps to make object creation more flexible. Zson allows developers
 * to describe creation of any type of object. For instance if you have a class "ABC" with
 * properties "prop1", "prop2", "prop3" you can use instance of the class as a value of
 * a JSON property as follow:
 *
 *      { "instanceOfABC": {
 *              "@ABC"  : [],
 *              "prop1" : "property 1 value",
 *              "prop2" : true,
 *              "prop3" : 200
 *          }
 *      }
 *
 *  And than:
 *
 *       // load JSON mentioned above
 *       zebkit.Zson.then("abc.json", function(zson) {
 *           zson.get("instanceOfABC");
 *       });
 *
 *  Features the JSON zson supports are listed below:
 *
 *    - **Access to hierarchical properties** You can use dot notation to get a property value. For
 *    instance:
 *
 *     { "a" : {
 *            "b" : {
 *                "c" : 100
 *            }
 *         }
 *     }
 *
 *     zebkit.Zson.then("abc.json", function(zson) {
 *         zson.get("a.b.c"); // 100
 *     });
 *
 *
 *    - **Property reference** Every string JSON value that starts from "@" considers as reference to
 *    another property value in the given JSON.
 *
 *     {  "a" : 100,
 *        "b" : {
 *            "c" : "%{a.b}"
 *        }
 *     }
 *
 *    here property "b.c" equals to 100 since it refers to  property "a.b"
 *     *
 *    - **Class instantiation**  Property can be easily initialized with an instantiation of required class. JSON
 *    zson considers all properties whose name starts from "@" character as a class name that has to be instantiated:
 *
 *     {  "date": {
 *           { "@Date" : [] }
 *         }
 *     }
 *
 *   Here property "date" is set to instance of JS Date class.
 *
 *   - **Factory classes** JSON zson follows special pattern to describe special type of property whose value
 *   is re-instantiated every time the property is requested. Definition of the property value is the same
 *   to class instantiation, but the name of class has to prefixed with "*" character:
 *
 *
 *     {  "date" : {
 *           "@ *Date" : []
 *        }
 *     }
 *
 *
 *   Here, every time you call get("date") method a new instance of JS date object will be returned. So
 *   every time will have current time.
 *
 *   - **JS Object initialization** If you have an object in your code you can easily fulfill properties of the
 *   object with JSON zson. For instance you can create zebkit UI panel and adjust its background, border and so on
 *   with what is stored in JSON:
 *
 *
 *     {
 *       "background": "red",
 *       "layout"    : { "@zebkit.layout.BorderLayout": [] },
 *       "border"    : { "@zebkit.draw.RoundBorder": [ "black", 2 ] }
 *     }
 *
 *     var pan = new zebkit.ui.Panel();
 *     new zebkit.Zson(pan).then("pan.json", function(zson) {
 *         // loaded and fullil panel
 *         ...
 *     });
 *
 *
 *   - **Expression** You can evaluate expression as a property value:
 *
 *
 *     {
 *         "a": { ".expr":  "100*10" }
 *     }
 *
 *
 *   Here property "a" equals 1000
 *
 *
 *   - **Load external resources** You can combine Zson from another Zson:
 *
 *
 *     {
 *         "a": "%{<json> embedded.json}",
 *         "b": 100
 *     }
 *
 *
 *   Here property "a" is loaded with properties set with loading external "embedded.json" file
 *
 * @class zebkit.Zson
 * @constructor
 * @param {Object} [obj] a root object to be loaded with
 * the given JSON configuration
 */
var Zson = Class([
    function (root) {
        if (arguments.length > 0) {
            this.root = root;
        }

        /**
         * Map of aliases and appropriate classes
         * @attribute classAliases
         * @protected
         * @type {Object}
         * @default {}
         */
        this.classAliases = {};
    },

    function $clazz() {
        /**
         * Build zson from the given json file
         * @param  {String|Object}   json a JSON or path to JSOn file
         * @param  {Object}   [root] an object to be filled with the given JSON
         * @param  {Function} [cb]   a callback function to catch the JSON loading is
         * completed
         * @return {zebkit.DoIt} a promise to catch result
         * @method  then
         * @static
         */
        this.then = function(json, root, cb) {
            if (typeof root === 'function') {
                cb   = root;
                root = null;
            }

            var zson = arguments.length > 1 && root !== null ? new Zson(root)
                                                             : new Zson();

            if (typeof cb === 'function') {
                return zson.then(json, cb);
            } else {
                return zson.then(json);
            }
        };
    },

    function $prototype() {
        /**
         * URL the JSON has been loaded from
         * @attribute  url
         * @type {zebkit.URI}
         * @default null
         */
        this.url = null;

        /**
         * Object that keeps loaded and resolved content of a JSON
         * @readOnly
         * @attribute root
         * @type {Object}
         * @default {}
         */
        this.root = null;

        /**
         * Original JSON as a JS object
         * @attribute content
         * @protected
         * @type {Object}
         * @default null
         */
        this.content = null;

        /**
         * The property says if the object introspection is required to try find a setter
         * method for the given key. For instance if an object is loaded with the
         * following JSON:

         {
            "color": "red"
         }

         * the introspection will cause zson class to try finding "setColor(c)" method in
         * the loaded with the JSON object and call it to set "red" property value.
         * @attribute usePropertySetters
         * @default true
         * @type {Boolean}
         */
        this.usePropertySetters = true;

        /**
         * Internal variables set
         * @attribute $variables
         * @type {Object}
         */
        this.$variables = null;

        /**
         * Get a property value by the given key. The property name can point to embedded fields:
         *
         *      new zebkit.Zson().then("my.json", function(zson) {
         *          zson.get("a.b.c");
         *      });
         *
         *
         * @param  {String} key a property key.
         * @return {Object} a property value
         * @throws Error if property cannot be found and it  doesn't start with "?"
         * @method  get
         */
        this.get = function(key) {
            if (key === null || typeof key === 'undefined') {
                throw new Error("Null key");
            }

            var ignore = false;
            if (key[0] === '?') {
                key = key.substring(1).trim();
                ignore = true;
            }

            if (ignore) {
                try {
                    return getPropertyValue(this.root, key);
                } catch(e) {
                    if ((e instanceof ReferenceError) === false) {
                        throw e;
                    }
                }
            } else {
                return getPropertyValue(this.root, key);
            }
        };

        /**
         * Call method.
         * @param  {String} name a method name
         * @param  {Object} d arguments
         * @return {Object} a method execution result
         * @method callMethod
         */
        this.callMethod = function(name, d) {
            var m  = this[name.substring(1).trim()],
                ts = this.$runner.$tasks.length,
                bs = this.$runner.$busy;

            if (typeof m !== 'function') {
                throw new Error("Method '" + name + "' cannot be found");
            }

            var args = this.buildValue(Array.isArray(d) ? d
                                                        : [ d ]),
                $this = this;

            if (this.$runner.$tasks.length === ts &&
                this.$runner.$busy === bs           )
            {
                var res = m.apply(this, args);
                if (res instanceof DoIt) {
                    return new DoIt().till(this.$runner).then(function() {
                        var jn = this.join();
                        res.then(function(res) {
                            jn(res);
                            return res;
                        }).then(function(res) {
                            return res;
                        });
                    }).catch(function(e) {
                        $this.$runner.error(e);
                    });
                } else {
                    return res;
                }
            } else {
                return new DoIt().till(this.$runner).then(function() {
                    if (args instanceof DoIt) {
                        var jn = this.join();
                        args.then(function(res) {
                            jn(res);
                            return res;
                        });
                    } else {
                        return args;
                    }
                }).then(function(args) {
                    var res = m.apply($this, args);
                    if (res instanceof DoIt) {
                        var jn = this.join();
                        res.then(function(res) {
                            jn(res);
                            return res;
                        });
                    } else {
                        return res;
                    }
                }).then(function(res) {
                    return res;
                }).catch(function(e) {
                    $this.$runner.error(e);
                });
            }
        };

        this.$resolveRef = function(target, names) {
            var fn = function(ref, rn) {
                rn.then(function(target) {
                    if (target != null && target.hasOwnProperty(ref) === true) {
                        var v = target[ref];
                        if (v instanceof DoIt) {
                            var jn = this.join();
                            v.then(function(res) {
                                jn.call(rn, res);
                                return res;
                            });
                        } else {
                            return v;
                        }
                    } else {
                        return undefined;
                    }
                });
            };

            for (var j = 0; j < names.length; j++) {
                var ref = names[j];

                if (target.hasOwnProperty(ref)) {
                    var v = target[ref];

                    if (v instanceof DoIt) {
                        var rn      = new DoIt(),
                            trigger = rn.join();

                        for(var k = j; k < names.length; k++) {
                            fn(names[k], rn);
                        }

                        trigger.call(rn, target);
                        return rn;
                    } else {
                        target = target[ref];
                    }

                } else {
                    return undefined;
                }
            }

            return target;
        };

        this.$buildArray = function(d) {
            var hasAsync = false;
            for (var i = 0; i < d.length; i++) {
                var v = this.buildValue(d[i]);
                if (v instanceof DoIt) {
                    hasAsync = true;
                    this.$assignValue(d, i, v);
                } else {
                    d[i] = v;
                }
            }

            if (hasAsync) {
                return new DoIt().till(this.$runner).then(function() {
                    return d;
                });
            } else {
                return d;
            }
        };

        this.$buildClass = function(k, d) {
            var classname = k.substring(1).trim(),
                args      = d[k],
                clz       = null,
                busy      = this.$runner.$busy,
                tasks     = this.$runner.$tasks.length;

            delete d[k]; // delete class name

            // '?' means optional class instance.
            if (classname[0] === '?') {
                classname = classname.substring(1).trim();
                try {
                    clz = this.resolveClass(classname[0] === '*' ? classname.substring(1).trim()
                                                                 : classname);
                } catch (e) {
                    return null;
                }
            } else {
                clz = this.resolveClass(classname[0] === '*' ? classname.substring(1).trim()
                                                             : classname);
            }

            args = this.buildValue(Array.isArray(args) ? args
                                                       : [ args ]);

            if (classname[0] === '*') {
                return (function(clazz, args) {
                    return {
                        $new : function() {
                            return newInstance(clazz, args);
                        }
                    };
                })(clz, args);
            }

            var props = this.buildValue(d);

            // let's do optimization to avoid unnecessary overhead
            // equality means nor arguments neither properties has got async call
            if (this.$runner.$busy === busy && this.$runner.$tasks.length === tasks) {
                var inst = newInstance(clz, args);
                this.merge(inst, props, true);
                return inst;
            } else {
                var $this = this;
                return new DoIt().till(this.$runner).then(function() {
                    var jn1 = this.join(),  // create all join here to avoid result overwriting
                        jn2 = this.join();

                    if (args instanceof DoIt) {
                        args.then(function(res) {
                            jn1(res);
                            return res;
                        });
                    } else {
                        jn1(args);
                    }

                    if (props instanceof DoIt) {
                        props.then(function(res) {
                            jn2(res);
                            return res;
                        });
                    } else {
                        jn2(props);
                    }
                }).then(function(args, props) {
                    var inst = newInstance(clz, args);
                    $this.merge(inst, props, true);
                    return inst;
                });
            }
        };

        this.$qsToVars = function(uri) {
            var qs   = null,
                vars = null;

            if ((uri instanceof URI) === false) {
                qs = new URI(uri.toString()).qs;
            } else {
                qs = uri.qs;
            }

            if (qs !== null || typeof qs === 'undefined') {
                qs = URI.parseQS(qs);
                for(var k in qs) {
                    var qsv = qs[k];
                    if (qsv[0] === "'") {
                        qsv = qsv.substring(1, qsv.length - 1);
                    } else if (qsv === "true" || qsv === "false") {
                        qsv = (qsv === "true");
                    } else if (qsv === "false") {
                        qsv = false;
                    } else if (qsv === "null") {
                        qsv = null;
                    } else {
                        qsv = parseInt(qsv, 10);
                    }

                    if (vars === null) {
                        vars = {};
                    }
                    vars[k] = qsv;
                }
            }

            return vars;
        };

        this.$buildRef = function(d) {
            var idx = -1;

            if (d[2] === "<" || d[2] === '.' || d[2] === '/') { //TODO: not complete solution that cannot detect URLs
                var path  = null,
                    type  = null,
                    $this = this;

                if (d[2] === '<') {
                    // if the referenced path is not absolute path and the zson has been also
                    // loaded by an URL than build the full URL as a relative path from
                    // BAG URL
                    idx = d.indexOf('>');
                    if (idx <= 4) {
                        throw new Error("Invalid content type in URL '" + d + "'");
                    }

                    path = d.substring(idx + 1, d.length - 1).trim();
                    type = d.substring(3, idx).trim();
                } else {
                    path = d.substring(2, d.length - 1).trim();
                    type = "json";
                }

                if (type === 'js') {
                    return this.expr(path);
                }

                if (this.url !== null && URI.isAbsolute(path) === false) {
                    var pURL = new URI(this.url).getParent();
                    if (pURL !== null) {
                        path = URI.join(pURL, path);
                    }
                }

                if (type === "json") {
                    var bag = new this.clazz();
                    bag.usePropertySetters = this.usePropertySetters;
                    bag.$variables         = this.$qsToVars(path);

                    var bg = bag.then(path).catch();
                    this.$runner.then(bg.then(function(res) {
                        return res.root;
                    }));
                    return bg;
                } else if (type === 'img') {
                    if (this.url !== null && URI.isAbsolute(path) === false) {
                        path = URI.join(new URI(this.url).getParent(), path);
                    }
                    return image(path, false);
                } else if (type === 'txt') {
                    return new GET(path).then(function(r) {
                        return r.responseText;
                    }).catch(function(e) {
                        $this.$runner.error(e);
                    });
                } else {
                    throw new Error("Invalid content type " + type);
                }

            } else {
                // ? means don't throw exception if reference cannot be resolved
                idx = 2;
                if (d[2] === '?') {
                    idx++;
                }

                var name = d.substring(idx, d.length - 1).trim(),
                    names   = name.split('.'),
                    targets = [ this.$variables, this.content, this.root, $global];

                for(var i = 0; i < targets.length; i++) {
                    var target = targets[i];
                    if (target !== null) {
                        var value = this.$resolveRef(target, names);
                        if (typeof value !== 'undefined') {
                            return value;
                        }
                    }
                }

                if (idx === 2) {
                    throw new Error("Reference '" + name + "' cannot be resolved");
                } else {
                    return d;
                }
            }
        };

        /**
         * Build a value by the given JSON description
         * @param  {Object} d a JSON description
         * @return {Object} a value
         * @protected
         * @method buildValue
         */
        this.buildValue = function(d) {
            if (typeof d === 'undefined' || d === null || d instanceof DoIt ||
                (typeof d === "number"   || d.constructor === Number)       ||
                (typeof d === "boolean"  || d.constructor === Boolean)        )
            {
                return d;
            }

            if (Array.isArray(d)) {
                return this.$buildArray(d);
            }

            if (typeof d === "string" || d.constructor === String) {
                if (d[0] === '%' && d[1] === '{' && d[d.length - 1] === '}') {
                    return this.$buildRef(d);
                } else {
                    return d;
                }
            }

            var k = null;

            // test whether we have a class definition
            for (k in d) {
                // handle class definition
                if (k[0] === '@' && d.hasOwnProperty(k) === true) {
                    return this.$buildClass(k, d);
                }

                //!!!!  trust the name of class occurs first what in general
                //      cannot be guaranteed by JSON spec but we can trust
                //      since many other third party applications stands
                //      on it too :)
                break;
            }

            for (k in d) {
                if (d.hasOwnProperty(k)) {
                    var v = d[k];

                    // special field name that says to call method to create a
                    // value by the given description
                    if (k[0] === "." || k[0] === '#') {
                        delete d[k];
                        if (k[0] === '#') {
                            this.callMethod(k, v);
                        } else {
                            return this.callMethod(k, v);
                        }
                    } else if (k[0] === '%') {
                        delete d[k];
                        this.mixin(d, this.$buildRef(k));
                    } else {
                        this.$assignValue(d, k, this.buildValue(v));
                    }
                }
            }

            return d;
        };

        this.$assignValue = function(o, k, v) {
            o[k] = v;
            if (v instanceof DoIt) {
                this.$runner.then(v.then(function(res) {
                    o[k] = res;
                    return res;
                }));
            }
        };

        this.$assignProperty = function(o, m, v) {
            // setter has to be placed in queue to let
            // value resolves its DoIts
            this.$runner.then(function(res) {
                if (Array.isArray(v)) {
                    m.apply(o, v);
                } else {
                    m.call (o, v);
                }
                return res;
            });
        };

        this.merge = function(dest, src, recursively) {
            if (arguments.length < 3) {
                recursively = true;
            }

            for (var k in src) {
                if (src.hasOwnProperty(k)) {
                    var sv = src [k],
                        dv = dest[k];

                    if (this.usePropertySetters === true) {
                        var m = getPropertySetter(dest, k);
                        if (m !== null) {
                            this.$assignProperty(dest, m, sv);
                            continue;
                        }
                    }

                    if (isAtomic(dv) || Array.isArray(dv) ||
                        isAtomic(sv) || Array.isArray(sv) ||
                        typeof sv.clazz !== 'undefined'            )
                    {
                        this.$assignValue(dest, k, sv);
                    } else if (recursively === true) {
                        if (dv != null && typeof dv.clazz !== 'undefined' && dv.clazz.mergeable === false) {
                            this.$assignValue(dest, k, sv);
                        } else {
                            this.merge(dv, sv);
                        }
                    }
                }
            }
            return dest;
        };

        this.mixin = function(dest, src) {
            if (src instanceof DoIt) {
                var $this = this;
                this.$runner.then(src.then(function(src) {
                    for (var k in src) {
                        if (src.hasOwnProperty(k) && (typeof dest[k] === 'undefined' || dest[k] === null)) {
                            $this.$assignValue(dest, k, src[k]);
                        }
                    }
                }));
            } else {
                for (var k in src) {
                    if (src.hasOwnProperty(k) && (typeof dest[k] === 'undefined' || dest[k] === null)) {
                        this.$assignValue(dest, k, src[k]);
                    }
                }
            }
        };

        /**
         * Called every time the given class name has to be transformed into
         * the class object (constructor) reference. The method checks if the given class name
         * is alias that is mapped with the zson to a class.
         * @param  {String} className a class name
         * @return {Function} a class reference
         * @method resolveClass
         * @protected
         */
        this.resolveClass = function(className) {
            return this.classAliases.hasOwnProperty(className) ? this.classAliases[className]
                                                               : Class.forName(className);
        };

        /**
         * Adds class aliases
         * @param {Object} aliases dictionary where key is a class alias that can be referenced from
         * JSON and the value is class itself (constructor)
         * @method  addClassAliases
         */
        this.addClassAliases = function(aliases) {
            for(var k in aliases) {
                this.classAliases[k] = Class.forName(aliases[k].trim());
            }
        };

        this.expr = function(expr) {
            if (expr.length > 200) {
                throw new Error("Out of evaluated script limit");
            }

            return eval("'use strict';" + expr);
        };

        /**
         * Load and parse the given JSON content.
         * @param  {String|Object} json a JSON content. It can be:
         *    - **String**
         *       - JSON string
         *       - URL to a JSON
         *    - **Object** JavaScript object
         * @return {zebkit.DoIt} a reference to the runner
         * @method then
         * @example
         *
         *     // load JSON in zson from a remote site asynchronously
         *     new zebkit.Zson().then("http://test.com/test.json", function(zson) {
         *             // zson is loaded and ready for use
         *             zson.get("a.c");
         *         }
         *     ).catch(function(error) {
         *         // handle error
         *         ...
         *     });
         */
        this.then = function(json, fn) {
            if (json === null || typeof json === 'undefined' || (isString(json) && json.trim().length === 0)) {
                throw new Error("Null content");
            }

            this.$runner = new DoIt();

            var $this = this;
            this.$runner.then(function() {
                if (isString(json)) {
                    json = json.trim();

                    // detect if the passed string is not a JSON, but URL
                    if ((json[0] !== '[' || json[json.length - 1] !== ']') &&
                        (json[0] !== '{' || json[json.length - 1] !== '}')   )
                    {
                        $this.$variables = $this.$qsToVars(json);

                        $this.url = json + (json.lastIndexOf("?") > 0 ? "&" : "?") + (new Date()).getTime().toString();

                        var join = this.join();
                        GET($this.url).then(function(r) {
                            join.call($this, r.responseText);
                        }).catch(function(e) {
                            $this.$runner.error(e);
                        });
                    } else {
                        return json;
                    }
                } else {
                    return json;
                }
            }).then(function(json) { // populate JSON content
                if (isString(json)) {
                    try {
                        $this.content = $zenv.parseJSON(json);
                    } catch(e) {
                        throw new Error("JSON format error: " + e);
                    }
                } else {
                    $this.content = json;
                }

                $this.$assignValue($this, "content", $this.buildValue($this.content));
            }).then(function() {
                if ($this.root !== null) {
                    $this.merge($this.root, $this.content);
                } else {
                    $this.root = $this.content;
                }

                return $this;
            });

            if (typeof $this.completed === 'function') {
                this.$runner.then(function() {
                    $this.completed.call($this);
                    return $this;
                });
            }

            if (arguments.length > 1) {
                this.$runner.then(fn);
            }

            return this.$runner;
        };
    }
]);

$export({ "Zson" : Zson } );
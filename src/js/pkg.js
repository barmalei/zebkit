
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
        if (v === undefined) {
            throw new Error(fn + "," + k);
        }
        if (v !== null && v.clazz === Class) {
            // class is detected, set the class name and ref to the class package
            if (v.$name === undefined) {
                v.$name = fn + k;
                v.$pkg  = getPropertyValue($global, fn.substring(0, fn.length - 1));

                if (v.$pkg === undefined) {
                    throw new ReferenceError(fn);
                }
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
     * @attribute $config
     * @readOnly
     * @private
     * @type {Object}
     */
    this.$config = {};

    this.$ready = new DoIt();

    /**
     * Reference to a parent package
     * @attribute $parent
     * @private
     * @type {zebkit.Package}
     */
    this.$parent = arguments.length < 2 ? null : parent;
}

/**
 * Get or set configuration parameter.
 * @param {String} [name] a parameter name.
 * @param {Object} [value] a parameter value.
 * @param {Boolean} [overwrite] boolean flag that indicates if the
 * parameters value have to be overwritten if it exists
 * @method  config
 */
Package.prototype.config = function(name, value, overwrite) {
    if (arguments.length === 0) {
        return this.$config;
    } else if (arguments.length === 1 && isString(arguments[0])) {
        return this.$config[name];
    } else  {
        if (isString(arguments[0])) {
            var old = this.$config[name];
            if (value === undefined) {
                delete this.$config[name];
            } else if (arguments.length < 3 || overwrite === true) {
                this.$config[name] = value;
            } else if (this.$config.hasOwnProperty(name) === false) {
                this.$config[name] = value;
            }
            return old;
        } else {
            overwrite = arguments.length > 1 ? value : false;
            for (var k in arguments[0]) {
                this.config(k, arguments[0][k], overwrite);
            }
        }
    }
};

/**
 * Detect the package location and store the location into "$url"
 * package field
 * @private
 * @method $detectLocation
 */
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

        if (pk === undefined || pk === null) {
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
 * Get a package by the specified name.
 * @param  {String} name a package name
 * @return {zebkit.Package} a package
 * @method byName
 */
Package.prototype.byName = function(name) {
    if (this.fullname() === name) {
        return this;
    } else  {
        var i = name.indexOf('.');
        if (i > 0) {
            var vv = getPropertyValue(this, name.substring(i + 1), false);
            return vv === undefined ? null : vv;
        } else {
            return null;
        }
    }
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
 * @deprecated Usage of the method has to be avoided. Use zebkit.require(...) instead.
 */
Package.prototype.import = function() {
    var code = [];
    if (arguments.length > 0) {
        for(var i = 0; i < arguments.length; i++) {
            var v = getPropertyValue(this, arguments[i]);
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
 * This method has to be used to start building a zebkit application. It
 * expects a callback function where an application code has to be placed and
 * number of required for the application packages names.  The call back gets
 * the packages instances as its arguments. The method guarantees the callback
 * is called at the time zebkit and requested packages are loaded, initialized
 * and ready to be used.
 * @param {String} [packages]* name or names of packages to make visible
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
        var pkg = getPropertyValue(this, arguments[i]);
        if ((pkg instanceof Package) === false) {
            throw new Error("Package '" + arguments[i] + "' cannot be found");
        }
        pkgs.push(pkg);
    }

    return this.then(function() {
        fn.apply($this, pkgs);
    });
};

/**
 * Detect root package.
 * @return {zebkit.Package} a root package
 * @method getRootPackage
 */
Package.prototype.getRootPackage = function() {
    var rootPkg = this;
    while (rootPkg.$parent !== null) {
        rootPkg = rootPkg.$parent;
    }
    return rootPkg;
};

var $textualFileExtensions = [
        "txt", "json", "htm", "html", "md", "properties", "conf", "xml", "java", "js", "css", "scss", "log"
    ],
    $imageFileExtensions = [
        "jpg", "jpeg", "png", "tiff", "gif", "ico", "exif", "bmp"
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
                    type = "txt",
                    p    = m[2].trim();

                if (m[1] !== undefined) {
                    type = m[1].trim().substring(1, m[1].length - 1).trim();
                } else {
                    var li = p.lastIndexOf('.');
                    if (li > 0) {
                        var ext = p.substring(li + 1).toLowerCase();
                        if ($textualFileExtensions.indexOf(ext) >= 0) {
                            type = "txt";
                        } else if ($imageFileExtensions.indexOf(ext) >= 0) {
                            type = "img";
                        }
                    }
                }

                if (type === "img") {
                    $zenv.loadImage(p, function(img) {
                        jn(img);
                    }, function(img, e) {
                        jn(null);
                    });
                } else if (type === "txt") {
                    ZFS.GET(p).then(function(req) {
                        jn(req.responseText);
                    }).catch(function(e) {
                        jn(null);
                    });
                } else {
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
        dumpError(e);
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
 * @param  {String|Boolean} [config] a path to configuration JSON file or boolean flag that says
 * to perform configuration using package as configuration name
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
Package.prototype.package = function(name, callback, path) {
    // no arguments than return the package itself
    if (arguments.length === 0) {
        return this;
    } else {
        var target = this;

        if (typeof name !== 'function') {
            if (name === undefined || name === null) {
                throw new Error("Null package name");
            }

            name = name.trim();
            if (name.match(/^[a-zA-Z_][a-zA-Z0-9_]+(\.[a-zA-Z_][a-zA-Z0-9_]+)*$/) === null) {
                throw new Error("Invalid package name '" + name + "'");
            }

            var names = name.split('.');
            for(var i = 0, k = names[0]; i < names.length; i++, k = k + '.' + names[i]) {
                var n = names[i],
                    p = target[n];

                if (p === undefined) {
                    p = new Package(n, target);
                    target[n] = p;
                } else if ((p instanceof Package) === false) {
                    throw new Error("Requested package '" + name +  "' conflicts with variable '" + n + "'");
                }
                target = p;
            }
        } else {
            path    = callback;
            callback = name;
        }

        // detect url later then sooner since
        if (target.$url === null) {
            target.$detectLocation();
        }

        if (typeof callback === 'function') {
            this.then(function() {
                callback.call(target, target, typeof Class !== 'undefined' ? Class : null);
            }).then(function() {
                // initiate configuration loading if it has been requested
                if (path !== undefined && path !== null) {
                    var jn = this.join();
                    if (path === true) {
                        var fn = target.fullname();
                        path = fn.substring(fn.indexOf('.') + 1) + ".json";
                        target.configWithRs(path, jn);
                    } else {
                        target.configWith(path, jn);
                    }
                }
            }).then(function(r) {
                if (r instanceof Error) {
                    this.error(r);
                } else {
                    // initiate "clazz.$name" resolving
                    $lsall.call(target, target.fullname() + ".");
                }
            });
        }

        return target;
    }
};


function resolvePlaceholders(path, env) {
    // replace placeholders in dir path
    var ph = path.match(/\%\{[a-zA-Z$][a-zA-Z0-9_$.]*\}/g);
    if (ph !== null) {
        for (var i = 0; i < ph.length; i++) {
            var p = ph[i],
                v = env[p.substring(2, p.length - 1)];

            if (v !== null && v !== undefined) {
                path = path.replace(p, v);
            }
        }
    }
    return path;
}

/**
 * Configure the given package with the JSON.
 * @param  {String | Object} path a path to JSON or JSON object
 * @param  {Function} [cb] a callback method
 * @method configWith
 */
Package.prototype.configWith = function(path, cb) {
    // catch error to keep passed callback notified
    try {
        if ((path instanceof URI || isString(path)) && URI.isAbsolute(path) === false) {
            path = URI.join(this.$url, path);
        }
    } catch(e) {
        if (arguments.length > 1 && cb !== null) {
            cb.call(this, e);
            return;
        } else {
            throw e;
        }
    }

    var $this = this;
    if (arguments.length > 1 && cb !== null) {
        new Zson($this).then(path, function() {
            cb.call(this, path);
        }).catch(function(e) {
            cb.call(this, e);
        });
    } else {
        this.getRootPackage().then(function() { // calling the guarantees it will be called when previous actions are completed
            this.till(new Zson($this).then(path)); // now we can trigger other loading action
        });
    }
};

/**
 * Configure the given package with the JSON.
 * @param  {String | Object} path a path to JSON or JSON object
 * @param  {Function} [cb] a callback
 * @method configWithRs
 */
Package.prototype.configWithRs = function(path, cb) {
    if (URI.isAbsolute(path)) {
        throw new Error("Absulute path cannot be used");
    }

    var pkg = this;
    // detect root package (common sync point) and package that
    // defines path to resources
    while (pkg !== null && (pkg.$config.basedir === undefined || pkg.$config.basedir === null)) {
        pkg = pkg.$parent;
    }

    if (pkg === null) {
        path = URI.join(this.$url, "rs", path);
    } else {
        // TODO: where config placeholders have to be specified
        path = URI.join(resolvePlaceholders(pkg.$config.basedir, pkg.$config), path);
    }

    return arguments.length > 1 ? this.configWith(path, cb)
                                : this.configWith(path);
};


$export(Package);
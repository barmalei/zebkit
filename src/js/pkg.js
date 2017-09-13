
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
        if (v !== null && v.clazz === Class) {
            // class is detected, set the class name and ref to the class package
            if (typeof v.$name === "undefined") {
                v.$name = fn + k;
                v.$pkg  = getPropertyValue($global, fn.substring(0, fn.length - 1));
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
                    $zenv.loadImage(p, function(img) {
                        jn(img);
                    }, function(img, e) {
                        jn(img);
                    });
                } else if (type === "txt") {
                    GET(p).then(function(req) {
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
    }

    var target = this;

    if (typeof name !== 'function') {
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

            if (typeof path !== 'undefined' && path !== null) {
                if (path === true) {
                    target.configWith();
                } else {
                    target.configWith(path);
                }
            }

            $lsall.call(target, target.fullname() + "."); // resolve "clazz.$name" properties of the package classes
        });
    }

    return target;
};


function resolvePlaceholders(path, env) {
    // replace placeholders in dir path
    var ph = path.match(/\%\{[a-zA-Z$][a-zA-Z0-9_$.]*\}/g);
    if (ph !== null) {
        for (var i = 0; i < ph.length; i++) {
            var p = ph[i], v = env[p.substring(2, p.length - 1)];
            if (v !== null && typeof v !== 'undefined') {
                path = path.replace(p, v);
            }
        }
    }
    return path;
}

/**
 * Configure the given package with the JSON.
 * @param  {String | Object} [path] a path to JSON or JSON object
 * @method configWith
 */
Package.prototype.configWith = function(path) {
    // use full package name as configuration name
    if (arguments.length < 1) {
        var fn = this.fullname();
        path = fn.substring(fn.indexOf('.') + 1) + ".json";
    }

    var rootPkg   = this,
        rsPathPkg = this,
        $this     = this;

    // detect root package (common sync point) and package that
    // defines path to resources
    while (rootPkg.$parent !== null) {
        rootPkg = rootPkg.$parent;
        if (typeof rsPathPkg.$config.basedir === 'undefined') {
            rsPathPkg = rootPkg;
        }
    }

    if (URI.isAbsolute(path[0]) === false) {
        var rsPath = rsPathPkg.$config.basedir;
        if (typeof rsPath !== 'undefined') {
            rsPath = resolvePlaceholders(rsPath, rsPathPkg.$config);
            path = URI.join(rsPath, path);
        } else {
            path = URI.join(this.$url, path);
        }
    }

    rootPkg.then(function() { // calling the guarantees it will be called when previous actions are completed
        this.till(new Zson($this).then(path)); // now we can trigger other loading action
    });
};

$export(Package);
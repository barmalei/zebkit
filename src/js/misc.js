
// Environment specific stuff
var $exports     = {},
    $zenv        = {},
    $global      = (typeof window !== "undefined" && window !== null) ? window
                                                                     : (typeof global !== 'undefined' ? global
                                                                                                      : this),
    $isInBrowser = typeof navigator !== "undefined",
    isIE         = $isInBrowser && (Object.hasOwnProperty.call(window, "ActiveXObject") ||
                                  !!window.ActiveXObject ||
                                  window.navigator.userAgent.indexOf("Edge") > -1),
    isFF         = $isInBrowser && window.mozInnerScreenX !== null,
    isMacOS      = $isInBrowser && navigator.platform.toUpperCase().indexOf('MAC') !== -1,
    $FN          = null;

/**
 * Reference to global space.
 * @attribute $global
 * @private
 * @readOnly
 * @type {Object}
 * @for zebkit
 */

if (parseInt.name !== "parseInt") {
    $FN = function(f) {  // IE stuff
        if (f.$methodName === undefined) { // test if name has been earlier detected
            var mt = f.toString().match(/^function\s+([^\s(]+)/);
                f.$methodName = (mt === null) ? ''
                                              : (mt[1] === undefined ? ''
                                                                     : mt[1]);
        }
        return f.$methodName;
    };
} else {
    $FN = function(f) {
        return f.name;
    };
}

function $export() {
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (typeof arg === 'function') {
            $exports[$FN(arg)] = arg;
        } else {
            for (var k in arg) {
                if (arg.hasOwnProperty(k)) {
                    $exports[k] = arg[k];
                }
            }
        }
    }
}


if (typeof zebkitEnvironment === 'function') {
    $zenv = zebkitEnvironment();
} else if (typeof window !== 'undefined') {
    $zenv = window;
}

// Map class definition for old browsers
function $Map() {
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
}

// ES6 Map is class
if (typeof Map === 'undefined' && (typeof $global !== 'undefined' || typeof $global.Map === "undefined")) {
    $global.Map = $Map();
}

function GET(url) {
    var req = $zenv.getHttpRequest();
    req.open("GET", url, true);

    return new DoIt(function() {
        var jn    = this.join(),
            $this = this;

        req.onreadystatechange = function() {
            if (req.readyState === 4) {
                // evaluate HTTP response
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
            req.send(null);
        } catch(e) {
            this.error(e);
        }
    });
}

// Micro file system
var ZFS = {
    catalogs : {},

    load: function(pkg, files) {
        var catalog = this.catalogs[pkg];
        if (catalog === undefined) {
            catalog = {};
            this.catalogs[pkg] = catalog;
        }

        for(var file in files) {
            catalog[file] = files[file];
        }
    },

    read : function(uri) {
        var p = null;
        for(var catalog in this.catalogs) {
            var pkg   = zebkit.byName(catalog),
                files = this.catalogs[catalog];

            if (pkg === null) {
                throw new ReferenceError("'" + catalog + "'");
            }

            p = new URI(uri).relative(pkg.$url);
            if (p !== null && files[p] !== undefined && files[p] !== null) {
                return files[p];
            }
        }
        return null;
    },

    GET: function(uri) {
        var f = ZFS.read(uri);
        if (f !== null) {
            return new DoIt(function() {
                return {
                    status      : 200,
                    statusText  : "",
                    extension   : f.ext,
                    responseText: f.data
                };
            });
        } else {
            return GET(uri);
        }
    }
};

/**
 * Dump the given error to output.
 * @param  {Exception | Object} e an error.
 * @method dumpError
 * @for  zebkit
 */
function dumpError(e) {
    if (typeof console !== "undefined" && typeof console.log !== "undefined") {
        var msg = "zebkit.err [";
        if (typeof Date !== 'undefined') {
            var date = new Date();
            msg = msg + date.getDate()   + "/" +
                  (date.getMonth() + 1) + "/" +
                  date.getFullYear() + " " +
                  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        }
        if (e === null || e === undefined) {
            console.log("Unknown error");
        } else {
            console.log(msg + " : " + e);
            console.log((e.stack ? e.stack : e));
        }
    }
}


/**
 * Load image or complete the given image loading.
 * @param  {String|Image} ph path or image to complete loading.
 * @param  {Boolean} [fireErr] flag to force or preserve error firing.
 * @return {zebkit.DoIt}
 * @method image
 * @for  zebkit
 */
function image(ph, fireErr) {
    if (arguments.length < 2) {
        fireErr = false;
    }
    var doit   = new DoIt(),
        jn     = doit.join(),
        marker = "data:image";

    if (isString(ph) && ph.length > marker.length) {
        // use "for" instead of "indexOf === 0"
        var i = 0;
        for(; i < marker.length && marker[i] === ph[i]; i++) {}

        if (i < marker.length) {
            var file = ZFS.read(ph);
            if (file !== null) {
                ph = "data:image/" + file.ext +  ";base64," + file.data;
            }
        }
    }

    $zenv.loadImage(ph,
        function(img) {
            jn(img);
        },
        function(img, e) {
            if (fireErr === true) {
                doit.error(e);
            } else {
                jn(img);
            }
        }
    );
    return doit;
}

//  Faster match operation analogues:
//  Math.floor(f)  =>  ~~(a)
//  Math.round(f)  =>  (f + 0.5) | 0

/**
 * Check if the given value is string
 * @param {Object} v a value.
 * @return {Boolean} true if the given value is string
 * @method isString
 * @for zebkit
 */
function isString(o)  {
    return o !== undefined && o !== null &&
          (typeof o === "string" || o.constructor === String);
}

/**
 * Check if the given value is number
 * @param {Object} v a value.
 * @return {Boolean} true if the given value is number
 * @method isNumber
 * @for zebkit
 */
function isNumber(o)  {
    return o !== undefined && o !== null &&
          (typeof o === "number" || o.constructor === Number);
}

/**
 * Check if the given value is boolean
 * @param {Object} v a value.
 * @return {Boolean} true if the given value is boolean
 * @method isBoolean
 * @for zebkit
 */
function isBoolean(o) {
    return o !== undefined && o !== null &&
          (typeof o === "boolean" || o.constructor === Boolean);
}

/**
 * Test if the given value has atomic type (String, Number or Boolean).
 * @param  {Object}  v a value
 * @return {Boolean} true if the value has atomic type
 * @method  isAtomic
 * @for zebkit
 */
function isAtomic(v) {
    return v === null || v === undefined ||
           (typeof v === "string"  || v.constructor === String)  ||
           (typeof v === "number"  || v.constructor === Number)  ||
           (typeof v === "boolean" || v.constructor === Boolean)  ;
}


Number.isInteger = Number.isInteger || function(value) {
    return typeof value === "number" &&
           isFinite(value) &&
           Math.floor(value) === value;
};


/**
 * Get property value for the given object and the specified property path
 * @param  {Object} obj  a target object.
 * as the target object
 * @param  {String} path property path.
 * @param  {Boolean} [useGetter] says too try getter method when it exists.
 * By default the parameter is false
 * @return {Object} a property value, return undefined if property cannot
 * be found
 * @method  getPropertyValue
 * @for  zebkit
 */
function getPropertyValue(obj, path, useGetter) {
    // if (arguments.length < 3) {
    //     useGetter = false;
    // }

    path = path.trim();
    if (path === undefined || path.length === 0) {
        throw new Error("Invalid field path: '" + path + "'");
    }

    // if (obj === undefined || obj === null) {
    //     throw new Error("Undefined target object");
    // }

    var paths = null,
        m     = null,
        p     = null;

    if (path.indexOf('.') > 0) {
        paths = path.split('.');

        for(var i = 0; i < paths.length; i++) {
            p = paths[i];

            if (obj !== undefined && obj !== null &&
                ((useGetter === true && (m = getPropertyGetter(obj, p))) || obj.hasOwnProperty(p)))
            {
                if (useGetter === true && m !== null) {
                    obj = m.call(obj);
                } else {
                    obj = obj[p];
                }
            } else {
                return undefined;
            }
        }
    } else {
        if (useGetter === true) {
            m = getPropertyGetter(obj, path);
            if (m !== null) {
                return m.call(obj);
            }
        }

        if (obj.hasOwnProperty(path) === true) {
            obj = obj[path];
        } else {
            return undefined;
        }
    }

    // detect object value factory
    if (obj !== null && obj !== undefined && obj.$new !== undefined) {
        return obj.$new();
    } else {
        return obj;
    }
}

/**
 * Get a property setter method if it is declared with the class of the specified object for the
 * given property. Setter is a method whose name matches the following pattern: "set<PropertyName>"
 * where the first letter of the property name is in upper case. For instance setter method for
 * property "color" has to have name "setColor".
 * @param  {Object} obj an object instance
 * @param  {String} name a property name
 * @return {Function}  a method that can be used as a setter for the given property
 * @method  getPropertySetter
 * @for zebkit
 */
function getPropertySetter(obj, name) {
    var pi = obj.constructor.$propertySetterInfo,
        m  = null;

    if (pi !== undefined) {
        if (pi[name] === undefined) {
            m = obj[ "set" + name[0].toUpperCase() + name.substring(1) ];
            pi[name] = (typeof m  === "function") ? m : null;
        }
        return pi[name];
    } else {
        // if this is not a zebkit class
        m = obj[ "set" + name[0].toUpperCase() + name.substring(1) ];
        return (typeof m  === "function") ? m : null;
    }
}

/**
 * Get a property getter method if it is declared with the class of the specified object for the
 * given property. Getter is a method whose name matches the following patterns: "get<PropertyName>"
 * or "is<PropertyName>" where the first letter of the property name is in upper case. For instance
 * getter method for property "color" has to have name "getColor".
 * @param  {Object} obj an object instance
 * @param  {String} name a property name
 * @return {Function}  a method that can be used as a getter for the given property
 * @method  getPropertyGetter
 * @for zebkit
 */
function getPropertyGetter(obj, name) {
    var pi = obj.constructor.$propertyGetterInfo,
        m  = null,
        suffix = null;

    if (pi !== undefined) {
        if (pi[name] === undefined) {
            suffix = name[0].toUpperCase() + name.substring(1);
            m  = obj[ "get" + suffix];
            if (typeof m !== 'function') {
                m = obj[ "is" + suffix];
            }
            pi[name] = (typeof m  === "function") ? m : null;
        }
        return pi[name];
    } else {
        suffix = name[0].toUpperCase() + name.substring(1);
        m      = obj[ "get" + suffix];
        if (typeof m !== 'function') {
            m = obj[ "is" + suffix];
        }
        return (typeof m === 'function') ? m : null;
    }
}

/**
 * Populate the given target object with the properties set. The properties set
 * is a dictionary that keeps properties names and its corresponding values.
 * Applying of the properties to an object does the following:
 *
 *
 *   - Detects if a property setter method exits and call it to apply
 *     the property value. Otherwise property is initialized as a field.
 *     Setter method is a method that matches "set<PropertyName>" pattern.
 *
 *   - Ignores properties whose names start from "$" character, equals "clazz"
 *     and properties whose values are function.
 *
 *   - Remove properties from the target object for properties that start from "-"
 *     character.
 *
 *   - Uses factory "$new" method to create a property value if the method can be
 *     detected in the property value.
 *
 *   - Apply properties recursively for properties whose names end with '/'
 *     character.
 *
 *
 * @param  {Object} target a target object
 * @param  {Object} props  a properties set
 * @return {Object} an object with the populated properties set.
 * @method  properties
 * @for  zebkit
 */
function properties(target, props) {
    for(var k in props) {
        // skip private properties( properties that start from "$")
        if (k !== "clazz" && k[0] !== '$' && props.hasOwnProperty(k) && props[k] !== undefined && typeof props[k] !== 'function') {
            if (k[0] === '-') {
                delete target[k.substring(1)];
            } else {
                var pv        = props[k],
                    recursive = k[k.length - 1] === '/',
                    tv        = null;

                // value factory detected
                if (pv !== null && pv.$new !== undefined) {
                    pv = pv.$new();
                }

                if (recursive === true) {
                    k = k.substring(0, k.length - 1);
                    tv = target[k];

                    // it is expected target value can be traversed recursively
                    if (pv !== null && (tv === null || tv === undefined || !(tv instanceof Object))) {
                        throw new Error("Target value is null, undefined or not an object. '" +
                                         k + "' property cannot be applied as recursive");
                    }
                } else {
                    tv = target[k];
                }

                if (recursive === true) {
                    if (pv === null) { // null value can be used to flush target value
                        target[k] = pv;
                    } else if (tv.properties !== undefined) {
                        tv.properties(pv); // target value itself has properties method
                    } else {
                        properties(tv, pv);
                    }
                } else {
                    var m = getPropertySetter(target, k);
                    if (m === null) {
                        target[k] = pv;  // setter doesn't exist, setup it as a field
                    } else {
                        // property setter is detected, call setter to
                        // set the property value
                        if (Array.isArray(pv)) {
                            m.apply(target, pv);
                        } else {
                            m.call(target, pv);
                        }
                    }
                }
            }
        }
    }
    return target;
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
 * (scheme, host, etc) to construct it.
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
        if (uri === null || uri.trim().length === 0) {
            throw new Error("Invalid empty URI");
        }

        var m = uri.match($uriRE);
        if (m === null) {
            throw new Error("Invalid URI '" + uri + "'");
        }

        // fetch scheme
        if (m[1] !== undefined) {
            this.scheme = m[2].toLowerCase();

            if (m[3] === undefined) {
                if (this.scheme !== "file") {
                    throw new Error("Invalid host name : '" + uri + "'");
                }
            } else {
                this.host = m[3];
            }

            if (m[4] !== undefined) {
                this.port = parseInt(m[4].substring(1), 10);
            }
        }

        // fetch path
        if (m[6] !== undefined) {
            this.path = m[6];
        } else if (m[1] !== undefined) {
            this.path = "/";
        }

        if (m[7] !== undefined && m[7].length > 1) {
            this.qs = m[7].substring(1).trim();
        }
    }

    if (this.path !== null) {
        this.path = URI.normalizePath(this.path);

        if ((this.host !== null || this.scheme !== null) && this.path[0] !== '/') {
            this.path = "/" + this.path;
        }
    }

    if (this.scheme !== null) {
        this.scheme = this.scheme.toLowerCase();
    }

    if (this.host !== null) {
        this.host = this.host.toLowerCase();
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
                                                : new URI(this.scheme,
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
    },

    /**
     * Test if the URI is absolute.
     * @return {Boolean} true if the URI is absolute.
     * @method isAbsolute
     */
    isAbsolute : function() {
        return URI.isAbsolute(this.toString());
    },

    /**
     * Join URI with the specified path
     * @param  {String} p* relative paths
     * @return {String} an absolute URI
     * @method join
     */
    join : function() {
        var args = Array.prototype.slice.call(arguments);
        args.splice(0, 0, this.toString());
        return URI.join.apply(URI, args);
    },

    /**
     * Test if the given URL is file path.
     * @return {Boolean} true if the URL is file path
     * @method isFilePath
     */
    isFilePath : function() {
        return this.scheme === null || this.scheme === 'file';
    },

    /**
     * Get an URI relative to the given URI.
     * @param  {String|zebkit.URI} to an URI to that the relative URI has to be detected.
     * @return {String} a relative URI
     * @method relative
     */
    relative : function(to) {
        if ((to instanceof URI) === false) {
            to = new URI(to);
        }

        if (this.isAbsolute()                                                      &&
            to.isAbsolute()                                                        &&
            this.host === to.host                                                  &&
            this.port === to.port                                                  &&
            (this.scheme === to.scheme || (this.isFilePath() && to.isFilePath()) ) &&
            (this.path.indexOf(to.path) === 0 && (to.path.length === this.path.length ||
                                                  (to.path.length === 1 && to.path[0] === '/') ||
                                                  this.path[to.path.length] ===  '/'     )))
        {
            return (to.path.length === 1 && to.path[0] === '/') ? this.path.substring(to.path.length)
                                                                : this.path.substring(to.path.length + 1);
        } else {
            return null;
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
 * @param  {String|zebkit.URI}  u a string to be checked.
 * @return {Boolean} true if the string is URL
 * @method isURL
 * @static
 */
URI.isURL = function(u) {
    return /^[a-zA-Z]+\:\/\//i.test(u);
};

/**
 * Get a relative path.
 * @param  {String|zebkit.URI} base a base path
 * @param  {String|zebkit.URI} path a path
 * @return {String} a relative path
 * @method relative
 * @static
 */
URI.relative = function(base, path) {
    if ((path instanceof URI) === false) {
        path = new URI(path);
    }
    return path.relative(base);
};

/**
 * Parse the specified query string of the given URI.
 * @param  {String|zebkit.URI} url an URI
 * @param  {Boolean} [decode] pass true if query string has to be decoded.
 * @return {Object} a parsed query string as a dictionary of parameters
 * @method parseQS
 * @static
 */
URI.parseQS = function(qs, decode) {
    if (qs instanceof URI) {
        qs = qs.qs;
        if (qs === null) {
            return null;
        }
    } else if (qs[0] === '?') {
        qs = qs.substring(1);
    }

    var mqs      = qs.match(/[a-zA-Z0-9_.]+=[^?&=]+/g),
        parsedQS = {};

    if (mqs !== null) {
        for(var i = 0; i < mqs.length; i++) {
            var q = mqs[i].split('='),
                k = q[0].trim(),
                v = decode === true ? $zenv.decodeURIComponent(q[1])
                                    : q[1];

            if (parsedQS.hasOwnProperty(k)) {
                var p = parsedQS[k];
                if (Array.isArray(p) === false) {
                    parsedQS[k] = [ p ];
                }
                parsedQS[k].push(v);
            } else {
                parsedQS[k] = v;
            }
        }
    }
    return parsedQS;
};


URI.decodeQSValue = function(value) {
    if (Array.isArray(value)) {
        var r = [];
        for(var i = 0; i < value.length; i++) {
            r[i] = URI.decodeQSValue(value[i]);
        }
        return r;
    } else {
        value = value.trim();
        if (value[0] === "'") {
            value = value.substring(1, value.length - 1);
        } else if (value === "true" || value === "false") {
            value = (value === "true");
        } else if (value === "null") {
            value = null;
        } else if (value === "undefined") {
            value = undefined;
        } else {
            var num = (value.indexOf('.') >= 0) ? parseFloat(value)
                                                : parseInt(value, 10);
            if (isNaN(num) === false) {
                value = num;
            }
        }
        return value;
    }
};

URI.normalizePath = function(p) {
    if (p !== null && p.length > 0) {
        p = p.trim().replace(/[\\]+/g, '/');
        for (; ; ) {
            var len = p.length;
            p = p.replace(/[^./]+[/]+\.\.[/]+/g, '');
            p = p.replace(/[\/]+/g, '/');
            if (p.length == len) {
                break;
            }
        }

        var l = p.length;
        if (l > 1 && p[l - 1] === '/') {
            p = p.substring(0, l - 1);
        }
    }

    return p;
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
    if (isString(obj) || isBoolean(obj) || isNumber(obj)) {
        return "" + obj;
    }

    var p = [];
    for(var k in obj) {
        if (obj.hasOwnProperty(k)) {
            p.push(k + '=' + (encode === true ? $zenv.encodeURIComponent(obj[k].toString())
                                              : obj[k].toString()));
        }
    }
    return p.join("&");
};

/**
 * Join the given  paths
 * @param  {String|zebkit.URI} p* relative paths
 * @return {String} a joined path as string
 * @method join
 * @static
 */
URI.join = function() {
    if (arguments.length === 0) {
        throw new Error("No paths to join");
    }

    var uri = new URI(arguments[0]);
    for(var i = 1; i < arguments.length; i++) {
        var p = arguments[i];

        if (p === null || p.length === 0) {
            throw new Error("Empty sub-path is not allowed");
        }

        if (URI.isAbsolute(p)) {
            throw new Error("Absolute path '" + p + "' cannot be joined");
        }

        if (p instanceof URI) {
            p = arguments[i].path;
        } else {
            p = new URI(p).path;
        }

        if (p.length === 0) {
            throw new Error("Empty path cannot be joined");
        }

        uri.path = uri.path + (uri.path === '/' ? '' : "/") + p;
    }

    uri.path = URI.normalizePath(uri.path);
    return uri.toString();
};

$export(
    URI,        isNumber, isString, $Map, isAtomic,
    dumpError,  image,    getPropertySetter,
    getPropertyValue,     getPropertyGetter,
    properties, GET,      isBoolean, DoIt,
    { "$global"    : $global,
      "$FN"        : $FN,
      "ZFS"        : ZFS,
      "environment": $zenv,
      "isIE"       : isIE,
      "isFF"       : isFF,
      "isMacOS"    : isMacOS }
);


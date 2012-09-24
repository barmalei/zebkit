(function() {

//  Faster operation analogues:
//  Math.floor(f)  => ~~(a)
//  Math.round(f)  =>  (f + 0.5) | 0
//
function isString(o)  { return typeof o !== "undefined" && o !== null && (typeof o === "string" || o.constructor === String); }
function isNumber(o)  { return typeof o !== "undefined" && o !== null && (typeof o === "number" || o.constructor === Number); }
function isBoolean(o) { return typeof o !== "undefined" && o !== null && (typeof o === "boolean" || o.constructor === Boolean); }

if (!String.prototype.trim) { String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g,'');  }; }

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement) {
        if (this == null) throw new TypeError();
        var t = Object(this), len = t.length >>> 0;
        if (len === 0) return -1;

        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n != n) n = 0;
            else if (n !== 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * ~~Math.abs(n);
            }
        }
        if (n >= len) return -1;
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) if (k in t && t[k] === searchElement) return k;
        return -1;
    };
}

if (!Array.isArray) Array.isArray = function(a) { return Object.prototype.toString.call(a) == '[object Array]'; };

var $$$ = 0, namespaces = {}, namespace = function(nsname, dontCreate) {
    if (isString(nsname) === false) throw new Error("Wrong nsname argument");
    if (namespaces.hasOwnProperty(nsname)) return namespaces[nsname];
    if (dontCreate === true) throw new Error("Namespace '" + nsname + "' doesn't exist");

    function Package() {
        this.$url = null;
        if (zebra.isInBrowser) {
            var s = document.getElementsByTagName('script'), ss = s[s.length - 1].getAttribute('src');
            this.$url = new zebra.URL(ss.substring(0, ss.lastIndexOf("/") + 1));
        }
    }

    if (isString(nsname) === false) throw new Error('invalid namespace id');
    if (namespaces.hasOwnProperty(nsname)) throw new Error("Namespace '" + nsname + "' already exists");

    var f = function(name) {
        if (arguments.length === 0) return f.$env;

        if (typeof name === 'function') {
            for(var k in f) if (f[k] instanceof Package) name(k, f[k]);
            return null;
        }

        var b = Array.isArray(name);
        if (isString(name) === false && b === false) {
            for(var k in name) if (name.hasOwnProperty(k)) f.$env[k] = name[k];
            return;
        }

        if (b) {
           for(var i = 0; i < name.length; i++) f(name[i]);
           return null;
        }

        if (f[name] instanceof Package) return f[name];

        var names = name.split('.'), target = f;
        for(var i = 0, k = names[0]; i < names.length; i++, k = [k, '.', names[i]].join('')) {
            var n = names[i], p = target[n];
            if (typeof p === "undefined") {
                p = new Package();
                target[n] = p;
                f[k] = p;
            }
            else
            if ((p instanceof Package) === false) throw new Error("Package '" + name +  "' conflicts with variable '" + n + "'");
            target = p;
        }
        return target;
    };

    f.Import = function() {
        var ns = ["=", nsname, "."].join(''), code = [], packages = arguments.length === 0 ? null : Array.prototype.slice.call(arguments, 0);
        f(function(n, p) {
            if (packages == null || packages.indexOf(n) >= 0) {
                for (var k in p) {
                    if (k[0] != '$' && (p[k] instanceof Package) === false && p.hasOwnProperty(k)) {
                        code.push([k, ns, n, ".", k].join(''));
                    }
                }
                if (packages != null) packages.splice(packages.indexOf(n), 1);
            }
        });
        if (packages != null && packages.length !== 0) throw new Error("Unknown package(s): " + packages.join(","));
        return code.length > 0 ? [ "var ", code.join(","), ";"].join('') : null;
    };

    f.$env = {};
    namespaces[nsname] = f;
    return f;
};

var FN = (typeof namespace.name === "undefined") ? (function(f) { var mt = f.toString().match(/^function ([^(]+)/); return (mt == null) ? '' : mt[1]; })
                                                 : (function(f) { return f.name; });

zebra = namespace('zebra');
var pkg = zebra;
pkg.namespaces = namespaces;
pkg.namespace = namespace;
pkg.FN = FN;
pkg.$global = this;
pkg.isString  = isString;
pkg.isNumber  = isNumber;
pkg.isBoolean = isBoolean;
pkg.version = "1.2.0";
pkg.$caller = null;

function mnf(name, params) {
    throw new ReferenceError("Method '" + (name==='' ? "constructor":name) + "(" + params + ")" + "' not found");
}

function $toString() { return this._hash_; }
function $equals(o) { return this == o; }

function make_template(pt, tf, p)
{
    tf._hash_ = ["$zebra_", $$$++].join('');
    tf.toString = $toString;
    if (pt != null) tf.prototype.getClazz = function() { return tf; };
    tf.getClazz = function() { return pt; };
    tf.prototype.toString = $toString;
    tf.prototype.equals   = $equals;
    tf.prototype.constructor = tf;

    if (p && p.length > 0) {
        tf.parents = {};
        for(var i=0; i < p.length; i++) {
            var l = p[i];
            if (typeof l === 'undefined') throw new ReferenceError("Unknown " + i + " parent");
            tf.parents[l] = true;
            if (l.parents) {
                var pp = l.parents;
                for(var k in pp) if (pp.hasOwnProperty(k)) tf.parents[k] = true;
            }
        }
    }
    return tf;
}

pkg.Interface = make_template(null, function() {
    var $Interface = make_template(pkg.Interface, function() {
        if (arguments.length > 0) return new (pkg.Class($Interface, arguments[0]))();
    }, arguments);
    return $Interface;
});

function ProxyMethod(name, f) {
    if (isString(name) === false) throw new TypeError('Method name has not been defined');

    var a = null;
    if (arguments.length == 1) {
        a = function() {
            var nm = a.methods[arguments.length];
            if (nm) {
                var cm = pkg.$caller;
                pkg.$caller = nm;
                try { return nm.apply(this, arguments); }
                finally { pkg.$caller = cm; }
            }
            mnf(a.methodName, arguments.length);
        };
        a.methods = {};
    }
    else {
        a = function() {
            var cm = pkg.$caller;
            pkg.$caller = f;
            try { return f.apply(this, arguments); }
            finally { pkg.$caller = cm; }
        };
        a.f = f;
    }

    a.$clone$ = function() {
        if (a.methodName === '') return null;
        if (a.f) return ProxyMethod(a.methodName, a.f);
        var m = ProxyMethod(a.methodName);
        for(var k in a.methods) m.methods[k] = a.methods[k];
        return m;
    };

    a.methodName = name;
    return a;
}

pkg.Class = make_template(null, function() {
    if (arguments.length === 0) throw new Error("No class definition was found");

    var df = arguments[arguments.length - 1], $parent = null, args = Array.prototype.slice.call(arguments, 0, arguments.length-1);
    if (args.length > 0 && (args[0] == null || args[0].getClazz() == pkg.Class)) $parent = args[0];

    var $template = make_template(pkg.Class, function() {
        this._hash_ = ["$zObj_", $$$++].join('');

        if (arguments.length > 0) {
            var a = arguments[arguments.length - 1];

            // inner is customized class instance if last arguments is array of functions
            if (Array.isArray(a) === true && typeof a[0] === 'function') {
                a = a[0];
                var args = [ $template ], k = arguments.length - 2;
                for(; k >= 0 && pkg.instanceOf(arguments[k], pkg.Interface); k--) args.push(arguments[k]);
                args.push(arguments[arguments.length - 1]);
                var cl = pkg.Class.apply(null, args), f = function() {};
                f.prototype = cl.prototype;
                var o = new f();
                cl.apply(o, Array.prototype.slice.call(arguments, 0, k + 1));
                o.constructor = cl;
                return o;
            }
        }

        this[''] && this[''].apply(this, arguments);
    }, args);

    $template.$parent = $parent;
    if ($parent != null) {
        for (var k in $parent.prototype) {
            var f = $parent.prototype[k];
            if (f && f.$clone$) {
                f = f.$clone$();
                if (f == null) continue;
            }
            $template.prototype[k] = f;
        }
    }

    $template.prototype.Field = function(f) {
        var n = FN(f), pv = this[n];
        if (pv) { if (this.hasOwnProperty(n) === false) pv = pv.$clone$(); }
        else pv = ProxyMethod(n);
        pv.methods[f.length] = f;
        f.boundTo = this.getClazz();
        this[n] = pv;
    };

    $template.prototype.$super = function() {
        if (pkg.$caller) {
            var name = pkg.$caller.methodName, $s = pkg.$caller.boundTo.$parent, args = arguments;
            if (arguments.length > 0 && typeof arguments[0] === 'function') {
                name = arguments[0].methodName;
                args = Array.prototype.slice.call(arguments, 1);
            }

            var params = args.length;
            while($s != null) {
                var m = $s.prototype[name];
                if (m && (typeof m.methods === "undefined" || m.methods[params])) return m.apply(this, args);
                $s = $s.$parent;
            }
            mnf(name, params);
        }
        throw new Error("$super is called outside of class context");
    };

    $template.prototype.getClazz = function() { return $template; };
    $template.prototype.$this = function() {  return pkg.$caller.boundTo.prototype[''].apply(this, arguments);  };

    $template.constructor.prototype.getMethods = function(name)  {
         var m = [];
         for (var n in this.prototype) {
             var f = this.prototype[n];
             if (arguments.length > 0 && name != n) continue;
             if (typeof f === 'function') {
                if (f.$clone$) {
                    for (var mk in f.methods) m.push(f.methods[mk]);
                }
                else m.push(f);
             }
         }
         return m;
    };

    $template.constructor.prototype.getMethod = function(name, params) {
        var m = this.prototype[name];
        if (typeof m === 'function') {
            if (m.$clone$) {
                if (typeof params === "undefined")  {
                    if (m.methods[0]) return m.methods[0];
                    for(var k in m.methods) return m.methods[k];
                    return null;
                }
                m = m.methods[params];
            }
            if (m) return m;
        }
        return null;
    };

    $template.Field = function(f) {
        var n = null;
        if (arguments.length > 1) {
            n = arguments[0];
            f = arguments[1];
        }
        else n = FN(f);

        if (f.boundTo) throw new Error("Method '" + n + "' is bound to other class");
        var sw = null, arity = f.length, vv = this.prototype[n];

        if (typeof vv === 'undefined') {
            // this commented code allow to speed up proxy execution a  little bit for a single method
            // sw = ProxyMethod(n, f);
            // f.boundTo    = this;
            // f.methodName = n;
            // this.prototype[n] = sw;
            // return;
            sw = ProxyMethod(n);
        }
        else {
            if (typeof vv === 'function') {
                if (vv.$clone$) {
                    if (typeof vv.methods === "undefined") {
                        sw = ProxyMethod(n);
                        sw.methods[vv.f.length] = vv.f;
                    }
                    else sw = vv;
                }
                else {
                    sw = ProxyMethod(n);
                    if (vv.length != arity) {
                        vv.methodName = n;
                        vv.boundTo = this;
                    }
                    sw.methods[vv.length] = vv;
                }
            }
            else throw new Error("Method '" + n + "' conflicts to property");
        }

        var pv = sw.methods[arity];
        if (typeof pv !== 'undefined' && pv.boundTo == this) {
            throw new Error("Duplicated method '" + sw.methodName + "(" + arity +")'");
        }

        f.boundTo    = this;
        f.methodName = n;
        sw.methods[arity] = f;
        this.prototype[n] = sw;
    };

    if (typeof df === 'function') df.call($template, function(f) { $template.Field(f); } );
    else {
        if (Array.isArray(df) === false) throw new Error("Wrong class definition format");
        for(var i=0; i < df.length; i++) {
            var ff = df[i], nn = FN(ff);
            if (nn[0] == "$") {
                var ctx = nn == "$prototype" ?  $template.prototype : (nn == "$clazz" ? $template : null);
                if (nn) {
                    ff.call(ctx);
                    continue;
                }
            }
            $template.Field(nn, ff);
        }
    }

    // validate constructor
    if ($template.$parent && $template.$parent.prototype[''] && typeof $template.prototype[''] === "undefined") {
        $template.prototype[''] = $template.$parent.prototype[''];
    }

    return $template;
});

var Class = pkg.Class, $cached = {}, $busy = 1, $f = [];

function $cache(name, clazz) {
    if (($cached[name] && $cached[name] != clazz) || pkg.$global[name]) throw Error("Class name conflict: " + name);
    $cached[name] = clazz;
}

Class.forName = function(name) {
    if (pkg.$global[name]) return pkg.$global[name];
    //!!!!!! infinite cache !!!!
    if ($cached.hasOwnProperty(name) === false) $cache(name, eval(name));
    var cl = $cached[name];
    if (cl == null) throw new Error("Class " + name + " cannot be found");
    return cl;
};

pkg.instanceOf = function(obj, clazz) {
    if (clazz) {
        if (obj == null || typeof obj.getClazz === 'undefined')  return false;
        var c = obj.getClazz();
        return c != null && (c === clazz || (typeof c.parents !== 'undefined' && c.parents.hasOwnProperty(clazz)));
    }
    throw new Error("instanceOf(): unknown class");
};

pkg.ready = function() {
    if (arguments.length === 0) {
        if ($busy > 0) $busy--;
    }
    else {
        if (arguments.length == 1 && $busy === 0 && $f.length === 0) {
            arguments[0]();
            return;
        }
    }

    for(var i = 0; i < arguments.length; i++) $f.push(arguments[i]);
    while($busy === 0 && $f.length > 0) $f.shift()();
};

pkg.busy = function() { $busy++; };

pkg.Output = Class([
    function print(o) { this._p(0, o); },
    function error(o) { this._p(2, o); },
    function warn(o)  { this._p(1, o); },

    function _p(l, o) {
        o = this.format(o);
        if (pkg.isInBrowser) {
            if (pkg.isIE) alert(o);
            else {
                if (l === 0) console.log(o);
                else if (l == 1) console.warn(o);
                     else console.error(o);
            }
        }
        else pkg.$global.print(o);
    },

    function format(o) {
        if (o && o.stack) return [o.toString(), ":",  o.stack.toString()].join("\n");
        return o == null ? "$null" : (typeof o === "undefined" ? "$undefined" : o.toString());
    }
]);

pkg.HtmlOutput = Class(pkg.Output, [
    function() { this.$this(null); },

    function(element) {
        element = element || "zebra.out";
        if (pkg.isString(element)) {
            this.el = document.getElementById(element);
            if (this.el == null) {
                this.el = document.createElement('div');
                this.el.setAttribute("id", element);
                document.body.appendChild(this.el);
            }
        }
        else {
            if (element == null) throw new Error("Unknown HTML output element");
            this.el = element;
        }
    },

    function print(s) { this.out('black', s); },
    function error(s) { this.out('red', s); },
    function warn(s)  { this.out('orange', s); },

    function out(color, msg) {
        var t = ["<div class='zebra.out.print' style='color:", color, "'>", this.format(msg), "</div>" ];
        this.el.innerHTML += t.join('');
    }
]);

pkg.isInBrowser = typeof navigator !== "undefined";
pkg.isIE        = pkg.isInBrowser && /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent);
pkg.isOpera     = pkg.isInBrowser && !/opera/i.test(navigator.userAgent);
pkg.isChrome    = pkg.isInBrowser && typeof(window.chrome) !== "undefined";
pkg.isSafari    = pkg.isInBrowser && !pkg.isChrome && /Safari/i.test(navigator.userAgent);
pkg.isFF        = pkg.isInBrowser && window.mozInnerScreenX != null;
pkg.out         = new pkg.Output();

pkg.print = function(s) { pkg.out.print(s); };

function complete() {
    pkg(function(n, p) {
        for(var k in p) {
            var c = p[k];
            if (c && zebra.instanceOf(c, Class)) c.$name = k;
        }
    });
    pkg.ready();
}

if (pkg.isInBrowser) {
    var m = window.location.search.match(/[?&][a-zA-Z0-9_.]+=[^?&=]+/g), env = {};
    for(var i=0; m && i < m.length; i++) {
        var l = m[i].split('=');
        env[l[0].substring(1)] = l[1];
    }
    pkg(env);

    //               protocol[1]        host[2]  path[3]  querystr[4]
    var purl = /^([a-zA-Z_0-9]+\:)\/\/([^\/]*)(\/[^?]*)(\?[^?\/]*)?/;
    pkg.URL = function(url) {
        var a = document.createElement('a');
        a.href = url;
        var m = purl.exec(a.href);

        if (m == null) {
            m = purl.exec(window.location);
            if (m == null) throw Error("Cannot resolve '" + url + "' url");
            var p = m[3];
            a.href = m[1] + "//" + m[2] +  p.substring(0, p.lastIndexOf("/") + 1) + url;
            m = purl.exec(a.href);
        }

        this.path     = m[3];
        this.href     = a.href;
        this.protocol = m[1];
        this.host     = m[2];
        this.path     = this.path.replace(/[\/]+/g, "/");
        this.qs       = m[4];
    };

    pkg.URL.prototype.toString = function() { return this.href; };

    pkg.URL.prototype.getParentURL = function() {
        var i = this.path.lastIndexOf("/");
        if (i <= 0) throw new Error(this.toString() + " has no parent");
        var p = this.path.substring(0, i+1);
        return new pkg.URL([this.protocol, "//", this.host, p].join(''));
    };

    pkg.URL.isAbsolute = function(u) { return /^[a-zA-Z]+\:\/\//i.test(u);  };

    pkg.URL.prototype.join = function(p) {
        if (pkg.URL.isAbsolute(p)) throw new Error();
        return p[0] == '/' ? [ this.protocol, "//", this.host, p ].join('')
                           : [ this.protocol, "//", this.host, this.path, p ].join('');
    };

    if (window.addEventListener) window.addEventListener('DOMContentLoaded', complete, false);
    else window.attachEvent('onload', complete);
}
else complete();

})();



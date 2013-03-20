(function() {

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
            var s = document.getElementsByTagName('script'), ss = s[s.length - 1].getAttribute('src'),
                i = ss == null ? -1 : ss.lastIndexOf("/");
            this.$url = (i > 0) ? new zebra.URL(ss.substring(0, i + 1))
                                : new zebra.URL(document.location.toString()).getParentURL() ;
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
                    if (k[0] != '$' && k[0] != '_' && (p[k] instanceof Package) === false && p.hasOwnProperty(k)) {
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
pkg.$FN = FN;
pkg.$global = this;
pkg.isString  = isString;
pkg.isNumber  = isNumber;
pkg.isBoolean = isBoolean;
pkg.version = "1.2.0";
pkg.$caller = null;

function mnf(name, params) {
    var cln = this.getClazz && this.getClazz().$name ? this.getClazz().$name + "." : "";
    throw new ReferenceError("Method '" + cln + (name === '' ? "constructor" : name) + "(" + params + ")" + "' not found");
}

function $toString() { return this._hash_; }
function $equals(o)  { return this == o;   }

// return function that is meta class
//  pt - parent template function
//  tf - template function
function make_template(pt, tf, p) {
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
            if (typeof l === 'undefined') throw new ReferenceError("Unknown parent["+i+"]");
            tf.parents[l] = true;
            if (l.parents) {
                var pp = l.parents;
                for(var k in pp) {
                    if (pp.hasOwnProperty(k)) tf.parents[k] = true;
                }
            }
        }
    }
    return tf;
}

pkg.getPropertySetter = function(obj, name) {
    var pi = obj.constructor.$propertyInfo;
    if (pi != null) {
        if (typeof pi[name] === "undefined") {
            var m = obj[ ["set", name[0].toUpperCase(), name.substring(1)].join('') ];
            pi[name] = (typeof m  === "function") ? m : null;
        }
        return pi[name];
    }
   
    var m = obj[["set", name[0].toUpperCase(), name.substring(1)].join('')];
    return (typeof m  === "function") ? m : null;
};

pkg.Interface = make_template(null, function() {
    var $Interface = make_template(pkg.Interface, function() {
        if (arguments.length > 0) return new (pkg.Class($Interface, arguments[0]))();
    }, arguments);
    return $Interface;
});

pkg.$Extended = pkg.Interface();

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
                catch(e) { throw e; }
                finally { pkg.$caller = cm; }
            }
            mnf.call(this, a.methodName, arguments.length);
        };
        a.methods = {};
    }
    else {
        a = function() {
            var cm = pkg.$caller;
            pkg.$caller = f;
            try { return f.apply(this, arguments); }
            catch(e) { throw e; }
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

    var df = arguments[arguments.length - 1], 
        $parent = null,
        args = Array.prototype.slice.call(arguments, 0, arguments.length-1);

    if (args.length > 0 && (args[0] == null || args[0].getClazz() == pkg.Class)) {
        $parent = args[0];
    }

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

    $template.$propertyInfo = {};

    $template.prototype.extend = function() {
        var c = this.getClazz(), l = arguments.length, f = arguments[l-1];
        if (pkg.instanceOf(this, pkg.$Extended) === false) {
            var cn = c.$name;
            c = Class(c, pkg.$Extended, []);
            c.$name = cn;
            this.getClazz = function() { return c; };
        }

        if (Array.isArray(f)) {
            for(var i=0; i < f.length; i++) { 
                var ff = f[i], n = FN(ff);
                if (n == '') ff.call(this);
                else {
                    var pv = this[n];
                    if (pv) { 
                        if (this.hasOwnProperty(n) === false) { 
                            if (pv.$clone$) pv = pv.$clone$(); 
                            else {
                                var pvn = ProxyMethod(n);
                                pvn.methods[pv.length] = pv;
                                pv.boundTo = c;
                                pv.methodName = n;
                                pv = pvn;
                            }
                        }
                    }
                    else { 
                        pv = ProxyMethod(n);
                    }
                    pv.methods[ff.length] = ff;
                    ff.boundTo = c;
                    ff.methodName = n;
                    // !!!
                    // Since method has been added dynamically class bean info has to be
                    // up to date. Do it below, but how !?
                    // ???

                    this[n] = pv;
                }
            }
            l--;
        }

        // add new interfaces 
        for(var i=0; i < l; i++) {
            if (pkg.instanceOf(arguments[i], pkg.Interface) === false) {
                throw new Error();
            }
            c.parents[arguments[i]] = true;
        }
        return this;
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
                if (m && (typeof m.methods === "undefined" || m.methods[params])) {
                    return m.apply(this, args);
                }
                $s = $s.$parent;
            }
            mnf.call(this, name, params);
        }
        throw new Error("$super is called outside of class context");
    };

    $template.prototype.getClazz = function() { return $template; };
    $template.prototype.$this    = function() { return pkg.$caller.boundTo.prototype[''].apply(this, arguments);  };

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

    $template.extend = function(df) {
        if (Array.isArray(df) === false) throw new Error("Wrong class definition format " + df);
        for(var i=0; i < df.length; i++) {
            var f = df[i], n = FN(f);
            if (n[0] == "$") {
                var ctx = n == "$prototype" ?  $template.prototype : (n == "$clazz" ? $template : null);
                if (n) {
                    f.call(ctx);
                    continue;
                }
            }

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
        }
    };

    $template.extend(df);

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
            if (pkg.isIE) {
                console.log(o);
                // !!!! should check if IE9+ is used we can use  console.log
                // alert(o);
            }
            else {
                if (l === 0) console.log(o);
                else {
                    if (l == 1) console.warn(o);
                    else console.error(o);
                }
            }
        }
        else pkg.$global.print(o);
    },

    function format(o) {
        if (o && o.stack) return [o.toString(), ":",  o.stack.toString()].join("\n");
        if (o === null) return "<null>";
        if (typeof o === "undefined") return "<undefined>";
        if (isString(o) || isNumber(o) || isBoolean(o)) return o;
        var d = [o.toString() + " " + (o.getClazz?o.getClazz().$name:"") , "{"];
        for(var k in o) if (o.hasOwnProperty(k)) d.push("    " + k + " = " + o[k]);
        return d.join('\n') + "\n}";
    }
]);

pkg.Dummy = Class([]);

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

pkg.isMacOS = pkg.isInBrowser && navigator.platform.toUpperCase().indexOf('MAC') !== -1;

pkg.print = function(s) { pkg.out.print(s); };

function complete() {
    //!!! this code resolve names of classes  defined in a package
    //    should be re-worked to use more generic and trust-able mechanism

    pkg(function(n, p) {
        function collect(pp, p) {
            for(var k in p) {
                if (k[0] != "$" && p.hasOwnProperty(k) && zebra.instanceOf(p[k], Class)) {
                    p[k].$name = pp ? [pp, k].join('.') : k;
                    collect(k, p[k]);
                }
            }
        }
        collect(null, p);
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
else {
    complete();
}

})();




(function(pkg, Class) {    var HEX = "0123456789ABCDEF";    pkg.ID = function UUID(size) {        if (typeof size === 'undefined') size = 16;        var id = [];        for (var i=0; i<36; i++)  id[i] = HEX[~~(Math.random() * 16)];        return id.join('');    };    pkg.sleep = function() {        var r = new XMLHttpRequest(), t = (new Date()).getTime().toString(), i = window.location.toString().lastIndexOf("?");        r.open('GET', window.location + (i > 0 ? "&" : "?") + t, false);        r.send(null);    };    // !!!    // b64 is supposed to be used with binary stuff, applying it to utf-8 encoded data can bring to error    // !!!    var b64str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";    pkg.b64encode = function(input) {        var out = [], i = 0, len = input.length, c1, c2, c3;        if (typeof ArrayBuffer !== "undefined") {            if (input instanceof ArrayBuffer) input = new Uint8Array(input);            input.charCodeAt = function(i) { return this[i]; };        }        if (Array.isArray(input)) input.charCodeAt = function(i) { return this[i]; };        while(i < len) {            c1 = input.charCodeAt(i++) & 0xff;            out.push(b64str.charAt(c1 >> 2));            if (i == len) {                out.push(b64str.charAt((c1 & 0x3) << 4), "==");                break;            }            c2 = input.charCodeAt(i++);            out.push(b64str.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)));            if (i == len) {                out.push(b64str.charAt((c2 & 0xF) << 2), "=");                break;            }            c3 = input.charCodeAt(i++);            out.push(b64str.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6)), b64str.charAt(c3 & 0x3F));        }        return out.join('');    };    pkg.b64decode = function(input) {        var output = [], chr1, chr2, chr3, enc1, enc2, enc3, enc4;        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");        while ((input.length % 4) !== 0) input += "=";        for(var i=0; i < input.length;) {            enc1 = b64str.indexOf(input.charAt(i++));            enc2 = b64str.indexOf(input.charAt(i++));            enc3 = b64str.indexOf(input.charAt(i++));            enc4 = b64str.indexOf(input.charAt(i++));            chr1 = (enc1 << 2) | (enc2 >> 4);            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);            chr3 = ((enc3 & 3) << 6) | enc4;            output.push(String.fromCharCode(chr1));            if (enc3 != 64) output.push(String.fromCharCode(chr2));            if (enc4 != 64) output.push(String.fromCharCode(chr3));        }        return output.join('');    };    pkg.dateToISO8601 = function(d) {        function pad(n) { return n < 10 ? '0'+n : n; }        return [ d.getUTCFullYear(), '-', pad(d.getUTCMonth()+1), '-', pad(d.getUTCDate()), 'T', pad(d.getUTCHours()), ':',                 pad(d.getUTCMinutes()), ':', pad(d.getUTCSeconds()), 'Z'].join('');    };    // http://webcloud.se/log/JavaScript-and-ISO-8601/    pkg.ISO8601toDate = function(v) {        var regexp = ["([0-9]{4})(-([0-9]{2})(-([0-9]{2})", "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?",                      "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?"].join(''), d = v.match(new RegExp(regexp)),                      offset = 0, date = new Date(d[1], 0, 1);        if (d[3])  date.setMonth(d[3] - 1);        if (d[5])  date.setDate(d[5]);        if (d[7])  date.setHours(d[7]);        if (d[8])  date.setMinutes(d[8]);        if (d[10]) date.setSeconds(d[10]);        if (d[12]) date.setMilliseconds(Number("0." + d[12]) * 1000);        if (d[14]) {            offset = (Number(d[16]) * 60) + Number(d[17]);            offset *= ((d[15] == '-') ? 1 : -1);        }        offset -= date.getTimezoneOffset();        date.setTime(Number(date) + (offset * 60 * 1000));        return date;    };    pkg.parseXML = function(s) {        function rmws(node) {            if (node.childNodes !== null) {                for (var i = node.childNodes.length; i-->0;) {                    var child= node.childNodes[i];                    if (child.nodeType === 3 && child.data.match(/^\s*$/)) node.removeChild(child);                    if (child.nodeType === 1) rmws(child);                }            }            return node;        }        if (typeof DOMParser !== "undefined") return rmws((new DOMParser()).parseFromString(s, "text/xml"));        else {            for (var n in { "Microsoft.XMLDOM":0, "MSXML2.DOMDocument":1, "MSXML.DOMDocument":2 }) {                var p = null;                try {                    p = new ActiveXObject(n);                    p.async = false;                }  catch (e) { continue; }                if (p === null) throw new Error("XML parser is not available");                p.loadXML(s);                return p;            }        }        throw new Error("No XML parser is available");    };    pkg.QS = Class([        function $clazz() {            this.append = function (url, obj) {                return url + ((obj === null) ? '' : ((url.indexOf("?") > 0) ? '&' : '?') + pkg.QS.toQS(obj, true));            };            this.parse = function(url) {                var m = window.location.search.match(/[?&][a-zA-Z0-9_.]+=[^?&=]+/g), r = {};                for(var i=0; m && i < m.length; i++) {                    var l = m[i].split('=');                    r[l[0].substring(1)] = decodeURIComponent(l[1]);                }                return r;            };            this.toQS = function(obj, encode) {                if (typeof encode === "undefined") encode = true;                if (zebra.isString(obj) || zebra.isBoolean(obj) || zebra.isNumber(obj)) return "" + obj;                var p = [];                for(var k in obj) {                    if (obj.hasOwnProperty(k)) p.push(k + '=' + (encode ? encodeURIComponent(obj[k].toString()) : obj[k].toString()));                }                return p.join("&");            };        }    ]);    pkg.getRequest = function(type) {        if (zebra.isIE || type === 0 || type === 1) {            if ((location.protocol.toLowerCase() === "file:" && type != 1) || type === 0) {                return new (function() {                    var o = new ActiveXObject("MSXML2.XMLHTTP"), $this = this;                    this.responseText = this.statusText = "";                    this.onreadystatechange = this.responseXml = null;                    this.readyState = this.status = 0;                    this.__type = "aie";                    o.onreadystatechange = function() {                        $this.readyState = o.readyState;                        if (o.readyState == 4) {                            $this.responseText = o.responseText;                            $this.responseXml  = o.responseXml;                            $this.status     = o.status;                            $this.statusText = o.statusText;                        }                        if ($this.onreadystatechange) $this.onreadystatechange();                    };                    this.open  = function(method, url, async, user, password) { return o.open(method, url, (async !== false), user, password); };                    this.send  = function(data) { return o.send(data); };                    this.abort = function(data) { return o.abort(); };                    this.setRequestHeader = function(name, value) { o.setRequestHeader(name, value); };                    this.getResponseHeader = function(name) { return o.getResponseHeader(name); };                    this.getAllResponseHeaders = function() { return o.getAllResponseHeaders(); };                })();            }            var obj = new XDomainRequest();            obj._open  = obj.open;            obj._send  = obj.send;            obj._async = true;            obj.__type = "xie";            obj.statusText = "";            obj.status = obj.readyState = 0;            obj.open = function(method, url, async, user, password) {                this._async = (async === true);                return this._open(method, url);            };            obj.setRequestHeader = obj.getResponseHeader = obj.getAllResponseHeaders = function () {                throw new Error("Method is not supported");            };            obj.send = function(data) {                var req = this;                this.onerror =function() { req.status = 404; };                this.onload = function() { req.status = 200; };                if (this._async === false) {                    var result = this._send(data);                    while (this.status === 0) {                        pkg.sleep();                    }                    this.readyState = 4;                    if (this.onreadystatechange) this.onreadystatechange();                    return result;                }                return this._send(data);            };            return obj;        }        var r = new XMLHttpRequest();        if (zebra.isFF) {            r.__send = r.send;            r.send = function(data) {                // !!! FF can throw NS_ERROR_FAILURE exception instead of returning 404 File Not Found HTTP error code                // !!! No request status, statusText are defined in this case                try { return this.__send(data); }                catch(e) {                    if (!e.message || e.message.toUpperCase().indexOf("NS_ERROR_FAILURE") < 0) throw e;                }            };        }        return r;    };    pkg.HTTP = Class([        function(url) { this.url = url; },        function GET()     { return this.GET(null, null); },        function GET(f)    { return (typeof f === 'function') ? this.GET(null, f) : this.GET(f, null);  },        function GET(d, f) { return this.SEND("GET", pkg.QS.append(this.url, d), null, f); },        function POST()     { return this.POST(null, null); },        function POST(d)    { return (typeof d === "function") ? this.POST(null, d) : this.POST(pkg.QS.toQS(d, false), null); },        function POST(d, f) { return this.SEND("POST", this.url, d, f); },        function SEND(method, url, data, callback) {            var r = pkg.getRequest(), $this = this;            if (callback !== null) {                r.onreadystatechange = function() {                    if (r.readyState == 4) {                        $this.httpError(r);                        callback(r.responseText, r);                    }                };            }            r.open(method, url, callback !== null);            r.send(data);            if (callback === null) {                this.httpError(r);                return r.responseText;            }        },        function httpError(r) { if (r.status != 200) throw new Error("HTTP error:" + r.status + "'" + r.responseText + "'"); }    ]);    pkg.GET = function(url) {        var http = new pkg.HTTP(url);        return http.GET.apply(http, Array.prototype.slice.call(arguments, 1));    };    pkg.POST = function(url) {        var http = new pkg.HTTP(url);        return http.POST.apply(http, Array.prototype.slice.call(arguments, 1));    };    var isBA = typeof(ArrayBuffer) !== 'undefined';    pkg.InputStream = Class([        function(container) {            if (isBA && container instanceof ArrayBuffer) this.data = new Uint8Array(container);            else {                if (zebra.isString(container)) {                    this.Field(function read() { return this.available() > 0 ? this.data.charCodeAt(this.pos++) & 0xFF : -1; });                }                else {                    if (Array.isArray(container) === false) throw new Error("Wrong type: " + typeof(container));                }                this.data = container;            }            this.marked = -1;            this.pos    = 0;        },        function mark() {            if (this.available() <= 0) throw new Error();            this.marked = this.pos;        },        function reset() {            if (this.available() <= 0 || this.marked < 0) throw new Error();            this.pos    = this.marked;            this.marked = -1;        },        function close()   { this.pos = this.data.length; },        function read()    { return this.available() > 0 ? this.data[this.pos++] : -1; },        function read(buf) { return this.read(buf, 0, buf.length); },        function read(buf, off, len) {            for(var i = 0; i < len; i++) {                var b = this.read();                if (b < 0) return i === 0 ? -1 : i;                buf[off + i] = b;            }            return len;        },        function readChar() {            var c = this.read();            if (c < 0) return -1;            if (c < 128) return String.fromCharCode(c);            var c2 = this.read();            if (c2 < 0) throw new Error();            if (c > 191 && c < 224) return String.fromCharCode(((c & 31) << 6) | (c2 & 63));            else {                var c3 = this.read();                if (c3 < 0) throw new Error();                return String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));            }        },        function readLine() {            if (this.available() > 0)            {                var line = [], b;                while ((b = this.readChar()) != -1 && b != "\n") line.push(b);                var r = line.join('');                line.length = 0;                return r;            }            return null;        },        function available() { return this.data === null ? -1 : this.data.length - this.pos; },        function toBase64() { return pkg.b64encode(this.data); }    ]);    pkg.URLInputStream = Class(pkg.InputStream, [        function(url) {  this.$this(url, null); },        function(url, f) {            var r = pkg.getRequest(), $this = this;            r.open("GET", url, f !== null);            if (f === null || isBA === false) {                if (!r.overrideMimeType) throw new Error("Binary mode is not supported");                r.overrideMimeType("text/plain; charset=x-user-defined");            }            if (f !== null)  {                if (isBA) r.responseType = "arraybuffer";                r.onreadystatechange = function() {                    if (r.readyState == 4) {                        if (r.status != 200)  throw new Error(url);                        $this.getClazz().$parent.getMethod('', 1).call($this, isBA ? r.response : r.responseText); // $this.$super(res);                        f($this.data, r);                    }                };                r.send(null);            }            else {                r.send(null);                if (r.status != 200) throw new Error(url);                this.$super(r.responseText);            }        },        function close() {            this.$super();            if (this.data) {                this.data.length = 0;                this.data = null;            }        }    ]);    pkg.Service = Class([        function(url, methods) {            var $this = this;            this.url = url;            if (Array.isArray(methods) === false) methods = [ methods ];            for(var i=0; i < methods.length; i++) {                (function() {                    var name = methods[i];                    $this[name] = function() {                        var args = Array.prototype.slice.call(arguments);                        if (args.length > 0 && typeof args[args.length - 1] == "function") {                            var callback = args.pop();                            return this.send(url, this.encode(name, args), function(res) { callback($this.decode(res)); } );                        }                        return this.decode(this.send(url, this.encode(name, args), null));                    };                })();            }        },        function send(url, data, callback) { return pkg.POST(url, data, callback); }    ]);    pkg.Service.invoke = function(clazz, url, method) {        var rpc = new clazz(url, method);        return function() { return rpc[method].apply(rpc, arguments); };    };    pkg.JRPC = Class(pkg.Service, [        function(url, methods) {            this.$super(url, methods);            this.version = "2.0";        },        function encode(name, args) {            return JSON.stringify({ jsonrpc: this.version, method: name, params: args, id: pkg.ID() });        },        function decode(r) {            if (r === null || r.length === 0) throw new Error("Empty JSON result string");            r = JSON.parse(r);            if (typeof(r.error) !== "undefined") throw new Error(r.error.message);            if (typeof r.result === "undefined" || typeof r.id === "undefined") throw new Error("Wrong JSON response format");            return r.result;        }    ]);    pkg.Base64 = function(s) { if (arguments.length > 0) this.encoded = pkg.b64encode(s); };    pkg.Base64.prototype.toString = function() { return this.encoded; };    pkg.Base64.prototype.decode   = function() { return pkg.b64decode(this.encoded); };    pkg.XRPC = Class(pkg.Service, [        function(url, methods) { this.$super(url, methods); },        function encode(name, args) {            var p = ["<?xml version=\"1.0\"?>\n<methodCall><methodName>", name, "</methodName><params>"];            for(var i=0; i < args.length;i++) {                p.push("<param>");                this.encodeValue(args[i], p);                p.push("</param>");            }            p.push("</params></methodCall>");            return p.join('');        },        function encodeValue(v, p)  {            if (v === null) throw new Error("Null is not allowed");            if (zebra.isString(v)) {                v = v.replace("<", "&lt;");                v = v.replace("&", "&amp;");                p.push("<string>", v, "</string>");            }            else {                if (zebra.isNumber(v)) {                    if (Math.round(v) == v) p.push("<i4>", v.toString(), "</i4>");                    else                    p.push("<double>", v.toString(), "</double>");                }                else {                    if (zebra.isBoolean(v)) p.push("<boolean>", v?"1":"0", "</boolean>");                    else {                        if (v instanceof Date)  p.push("<dateTime.iso8601>", pkg.dateToISO8601(v), "</dateTime.iso8601>");                        else {                            if (Array.isArray(v))  {                                p.push("<array><data>");                                for(var i=0;i<v.length;i++) {                                    p.push("<value>");                                    this.encodeValue(v[i], p);                                    p.push("</value>");                                }                                p.push("</data></array>");                            }                            else {                                if (v instanceof pkg.Base64) p.push("<base64>", v.toString(), "</base64>");                                else {                                    p.push("<struct>");                                    for(var k in v) {                                        if (v.hasOwnProperty(k)) {                                            p.push("<member><name>", k, "</name><value>");                                            this.encodeValue(v[k], p);                                            p.push("</value></member>");                                        }                                    }                                    p.push("</struct>");                                }                            }                        }                    }                }            }        },        function decodeValue(node) {            var tag = node.tagName.toLowerCase();            if (tag == "struct")            {                 var p = {};                 for(var i=0; i < node.childNodes.length; i++) {                    var member = node.childNodes[i],  // <member>                        key    = member.childNodes[0].childNodes[0].nodeValue.trim(); // <name>/text()                    p[key] = this.decodeValue(member.childNodes[1].childNodes[0]);   // <value>/<xxx>                }                return p;            }            if (tag == "array") {                var a = [];                node = node.childNodes[0]; // <data>                for(var i=0; i < node.childNodes.length; i++) {                    a[i] = this.decodeValue(node.childNodes[i].childNodes[0]); // <value>                }                return a;            }            var v = node.childNodes[0].nodeValue.trim();            switch (tag) {                case "datetime.iso8601": return pkg.ISO8601toDate(v);                case "boolean": return v == "1";                case "int":                case "i4":     return parseInt(v, 10);                case "double": return Number(v);                case "base64":                    var b64 = new pkg.Base64();                    b64.encoded = v;                    return b64;                case "string": return v;            }            throw new Error("Unknown tag " + tag);        },        function decode(r) {            var p = pkg.parseXML(r), c = p.getElementsByTagName("fault");            if (c.length > 0) {                var err = this.decodeValue(c[0].getElementsByTagName("struct")[0]);                throw new Error(err.faultString);            }            c = p.getElementsByTagName("methodResponse")[0];            c = c.childNodes[0].childNodes[0]; // <params>/<param>            if (c.tagName.toLowerCase() === "param") return this.decodeValue(c.childNodes[0].childNodes[0]); // <value>/<xxx>            throw new Error("incorrect XML-RPC response");        }    ]);    pkg.XRPC.invoke = function(url, method) { return pkg.Service.invoke(pkg.XRPC, url, method); };    pkg.JRPC.invoke = function(url, method) { return pkg.Service.invoke(pkg.JRPC, url, method); };})(zebra("io"), zebra.Class);

(function(pkg, Class, Interface) {

pkg.newInstance = function(clazz, args) {
    if (args && args.length > 0) {
        var f = function() {};
        f.prototype = clazz.prototype;
        var o = new f();
        o.constructor = clazz;
        clazz.apply(o, args);
        return o;
    }
    return new clazz();
};

function hex(v) { return (v < 16) ? ["0", v.toString(16)].join('') :  v.toString(16); }

pkg.findInTree = function(root, path, eq, cb) {
    var findRE = /(\/\/|\/)?(\*|[a-zA-Z_][a-zA-Z0-9_\.]*)(\[\s*(\@[a-zA-Z_][a-zA-Z0-9_\.]*)\s*\=\s*([0-9]+|true|false|\'[^']*\')\s*\])?/g,
        m = null, res = [];

    if (typeof eq !== "function") {
        eq = function(kid, name) { return kid.value == name; };
    }

    function _find(root, ms, idx, cb) {
        function list_child(r, name, deep, cb) {
            for (var i=0; i < r.kids.length; i++) {
                var kid = r.kids[i];
                if (name == '*' || eq(kid, name)) {
                    if (cb(kid)) return true;
                }

                if (deep) {
                    if (list_child(kid, name, deep, cb)) return true;
                }
            }
            return false;
        }

        if (ms == null || idx >= ms.length) return cb(root);

        var m = ms[idx];
        return list_child(root, m[2], m[1] == "//", function(child) {
            if (m[3] && child[m[4].substring(1)] != m[5]) return false;
            return _find(child, ms, idx + 1, cb);
        });
    }

    while(m = findRE.exec(path)) {
        if (m[2] == null || m[2].trim().length == 0) throw new Error("Empty path name element");
        if (m[3] && m[5][0] == "'") m[5] = m[5].substring(1, m[5].length - 1);
        res.push(m);
    }
    _find(root, res, 0, cb);
};

pkg.rgb = function (r, g, b, a) {
    if (arguments.length == 1) {
        if (zebra.isString(r)) {
            this.s = r;
            if (r[0] === '#') {
                r = parseInt(r.substring(1), 16);
            }
            else {
                if (r[0] === 'r' && r[1] === 'g' && r[2] === 'b') {
                    var i = r.indexOf('(', 3), p = r.substring(i + 1, r.indexOf(')', i + 1)).split(",");
                    this.r = parseInt(p[0].trim(), 10);
                    this.g = parseInt(p[1].trim(), 10);
                    this.b = parseInt(p[2].trim(), 10);
                    if (p.length > 3) this.D = parseInt(p[2].trim(), 10);
                    return;
                }
            }
        }
        this.r = r >> 16;
        this.g = (r >> 8) & 0xFF;
        this.b = (r & 0xFF);
    }
    else {
        this.r = r;
        this.g = g;
        this.b = b;
        if (arguments.length > 3) this.a = a;
    }

    if (this.s == null) {
        this.s = (typeof this.a !== "undefined") ? ['rgba(', this.r, ",", this.g, ",",
                                                             this.b, ",", this.a, ")"].join('')
                                                 : ['#', hex(this.r), hex(this.g), hex(this.b)].join('');
    }
};

var rgb = pkg.rgb;
rgb.prototype.toString = function() { return this.s; };

// rgb.prototype.equals = function(c){
//     return c != null && (c === this || (this.r == c.r && this.b == c.b && this.g == c.g && this.a == c.a));
// };

rgb.black     = new rgb(0);
rgb.white     = new rgb(0xFFFFFF);
rgb.red       = new rgb(255,0,0);
rgb.blue      = new rgb(0,0,255);
rgb.green     = new rgb(0,255,0);
rgb.gray      = new rgb(128,128,128);
rgb.lightGray = new rgb(211,211,211);
rgb.darkGray  = new rgb(169,169,169);
rgb.orange    = new rgb(255,165,0);
rgb.yellow    = new rgb(255,255,0);
rgb.pink      = new rgb(255,192,203);
rgb.cyan      = new rgb(0,255,255);
rgb.magenta   = new rgb(255,0,255);
rgb.darkBlue  = new rgb(0, 0, 140);

pkg.Actionable = Interface();

pkg.index2point  = function(offset,cols) { return [~~(offset / cols), (offset % cols)]; };
pkg.indexByPoint = function(row,col,cols){ return (cols <= 0) ?  -1 : (row * cols) + col; };

pkg.intersection = function(x1,y1,w1,h1,x2,y2,w2,h2,r){
    r.x = x1 > x2 ? x1 : x2;
    r.width = Math.min(x1 + w1, x2 + w2) - r.x;
    r.y = y1 > y2 ? y1 : y2;
    r.height = Math.min(y1 + h1, y2 + h2) - r.y;
};

pkg.isIntersect = function(x1,y1,w1,h1,x2,y2,w2,h2){
    return (Math.min(x1 + w1, x2 + w2) - (x1 > x2 ? x1 : x2)) > 0 &&
           (Math.min(y1 + h1, y2 + h2) - (y1 > y2 ? y1 : y2)) > 0;
};

pkg.unite = function(x1,y1,w1,h1,x2,y2,w2,h2,r){
    r.x = x1 < x2 ? x1 : x2;
    r.y = y1 < y2 ? y1 : y2;
    r.width  = Math.max(x1 + w1, x2 + w2) - r.x;
    r.height = Math.max(y1 + h1, y2 + h2) - r.y;
};

pkg.arraycopy = function(src, spos, dest, dpos, dlen) {
    for(var i=0; i<dlen; i++) dest[i + dpos] = src[spos + i];
};

pkg.currentTimeMillis = function() { return (new Date()).getTime(); };

pkg.str2bytes = function(s) {
    var ar = [];
    for (var i = 0; i < s.length; i++) {
        var code = s.charCodeAt(i);
        ar.push((code >> 8) & 0xFF);
        ar.push(code & 0xFF);
    }
    return ar;
};

var digitRE = /[0-9]/;
pkg.isDigit = function(ch) {
    if (ch.length != 1) throw new Error("Incorrect character");
    return digitRE.test(ch);
};

var letterRE = /[A-Za-z]/;
pkg.isLetter = function (ch) {
    if (ch.length != 1) throw new Error("Incorrect character");
    return letterRE.test(ch);
};

pkg.Listeners = function(n) {
    this.n = n ? n : 'fired';
};

var L = pkg.Listeners.prototype;

L.add = function(l) {
    if (!this.v) this.v = [];
    this.v.push(l);
};

L.remove = function(l) {
    if (this.v) {
        var i = 0;
        while((i = this.v.indexOf(l)) >= 0) this.v.splice(i, 1);
    }
};

L.fire = function() {
    if(this.v) {
        var n = this.n;
        for(var i = 0;i < this.v.length; i++) {
            var v = this.v[i];
            if (typeof v === 'function') v.apply(this, arguments);
            else v[n].apply(v, arguments);
        }
    }
};

L.get = function(i) {
    return (this.v == null || this.v.length <= i) ? null : this.v[i];
};

L.removeAll = function(){ if (this.v) this.v.length = 0; };

pkg.MListeners = function() {
    if (arguments.length == 0) throw new Error();
    var $this = this;
    this.methods = {};
    for(var i=0; i<arguments.length; i++) {
        var c = [], m = arguments[i];
        this.methods[m] = c;
        (function(m, c) {
            $this[m] = function() {
                for(var i=0;i<c.length; i++) c[i][1].apply(c[i][0], arguments);
            };
        })(m, c);
    }
};

var ML = pkg.MListeners.prototype;

ML.add = function(l) {
    if (typeof l === 'function') {
        var n = zebra.$FN(l);
        if (n == '') {
            for(var k in this.methods) {
                if (this.methods.hasOwnProperty(k)) this.methods[k].push([this, l]);
            }
        }
        else {
            if (this.methods.hasOwnProperty(n) === false) throw new Error("Unknown listener " + n);
            this.methods[n].push([this, l]);
        }
    }
    else {
        var b = false;
        for(var k in this.methods) {
            if (this.methods.hasOwnProperty(k)) {
                if (typeof l[k] === "function") {
                    this.methods[k].push([l, l[k]]);
                    b = true;
                }
            }
        }
        if (b === false) throw new Error("No listener can be registered for " + l);
    }
};

ML.get = function(m, i) {
    var v = this.methods[k];
    return (this.v == null || this.v.length <= i) ? null : this.v[i];
};

ML.remove = function(l) {
    for(var k in this.methods) {
        var v = this.methods[k];
        for(var i = 0; i < v.length; i++) {
            var f = v[i];
            if (l != this && (f[1] == l || f[0] == l)) v.splice(i, 1);
        }
    }
};

ML.removeAll = function(l) {
    for(var k in this.methods) {
        if (thi.methods.hasOwnProperty(k)) this.methods[k].length = 0;
    }
};

var Position = pkg.Position = Class([
    function $clazz() {
        this.PositionMetric = Interface();
        this.DOWN = 1;
        this.UP   = 2;
        this.BEG  = 3;
        this.END  = 4;
    },

    function $prototype() {
        this.clearPos = function (){
            if(this.offset >= 0){
                var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol;
                this.offset  = this.currentLine = this.currentCol - 1;
                this._.fire(this, prevOffset, prevLine, prevCol);
            }
        };

        this.setOffset = function(o){
            if(o < 0) o = 0;
            else {
                var max = this.metrics.getMaxOffset();
                if(o >= max) o = max;
            }

            if(o != this.offset){
                var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol,  p = this.getPointByOffset(o);
                this.offset = o;
                if(p != null){
                    this.currentLine = p[0];
                    this.currentCol = p[1];
                }
                this.isValid = true;
                this._.fire(this, prevOffset, prevLine, prevCol);
            }
        };

        this.seek = function(off){ this.setOffset(this.offset + off); };

        this.setRowCol = function (r,c){
            if(r != this.currentLine || c != this.currentCol){
                var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol;
                this.offset = this.getOffsetByPoint(r, c);
                this.currentLine = r;
                this.currentCol = c;
                this._.fire(this, prevOffset, prevLine, prevCol);
            }
        };

        this.inserted = function (off,size){
            if(this.offset >= 0 && off <= this.offset){
                this.isValid = false;
                this.setOffset(this.offset + size);
            }
        };

        this.removed = function (off,size){
            if(this.offset >= 0 && this.offset >= off){
                this.isValid = false;
                if(this.offset >= (off + size)) this.setOffset(this.offset - size);
                else this.setOffset(off);
            }
        };

        this.getPointByOffset = function(off){
            if (off == -1) return [-1, -1];
            var m = this.metrics, max = m.getMaxOffset();
            if (off > max) throw new Error("Out of bounds:" + off);
            if (max === 0) return [(m.getLines() > 0 ? 0 : -1), 0];
            if (off === 0) return [0, 0];
            var d = 0, sl = 0, so = 0;
            if(this.isValid && this.offset !=  -1){
                sl = this.currentLine;
                so = this.offset - this.currentCol;
                if(off > this.offset) d = 1;
                else
                    if(off < this.offset) d =  -1;
                    else return [sl, this.currentCol];
            }
            else{
                d = (~~(max / off) === 0) ?  -1 : 1;
                if(d < 0){
                    sl = m.getLines() - 1;
                    so = max - m.getLineSize(sl);
                }
            }
            for(; sl < m.getLines() && sl >= 0; sl += d){
                var ls = m.getLineSize(sl);
                if(off >= so && off < so + ls) return [sl, off - so];
                so += d > 0 ? ls : -m.getLineSize(sl - 1);
            }
            return [-1, -1];
        };

        this.getOffsetByPoint = function (row,col){
            var startOffset = 0, startLine = 0, m = this.metrics;

            if(row >= m.getLines() || col >= m.getLineSize(row)) throw new Error();
            if(this.isValid && this.offset !=  -1) {
                startOffset = this.offset - this.currentCol;
                startLine = this.currentLine;
            }
            if (startLine <= row) for(var i = startLine;i < row; i++) startOffset += m.getLineSize(i);
            else for(var i = startLine - 1;i >= row; i--) startOffset -= m.getLineSize(i);
            return startOffset + col;
        };

        this.calcMaxOffset = function (){
            var max = 0, m = this.metrics;
            for(var i = 0;i < m.getLines(); i ++ ) max += m.getLineSize(i);
            return max - 1;
        };

        this.seekLineTo = function(t,num){
            if(this.offset < 0){
                this.setOffset(0);
                return;
            }
            
            if (arguments.length == 1) num = 1;

            var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol;
            switch(t)
            {
                case Position.BEG:
                    if(this.currentCol > 0){
                        this.offset -= this.currentCol;
                        this.currentCol = 0;
                        this._.fire(this, prevOffset, prevLine, prevCol);
                    } break;
                case Position.END:
                    var maxCol = this.metrics.getLineSize(this.currentLine);
                    if(this.currentCol < (maxCol - 1)){
                        this.offset += (maxCol - this.currentCol - 1);
                        this.currentCol = maxCol - 1;
                        this._.fire(this, prevOffset, prevLine, prevCol);
                    } break;
                case Position.UP:
                    if(this.currentLine > 0){
                        this.offset -= (this.currentCol + 1);
                        this.currentLine--;
                        for(var i = 0;this.currentLine > 0 && i < (num - 1); i++ , this.currentLine--){
                            this.offset -= this.metrics.getLineSize(this.currentLine);
                        }
                        var maxCol = this.metrics.getLineSize(this.currentLine);
                        if(this.currentCol < maxCol) this.offset -= (maxCol - this.currentCol - 1);
                        else this.currentCol = maxCol - 1;
                        this._.fire(this, prevOffset, prevLine, prevCol);
                    } break;
                case Position.DOWN:
                    if(this.currentLine < (this.metrics.getLines() - 1)){
                        this.offset += (this.metrics.getLineSize(this.currentLine) - this.currentCol);
                        this.currentLine++;
                        var size = this.metrics.getLines() - 1;
                        for(var i = 0;this.currentLine < size && i < (num - 1); i++ ,this.currentLine++ ){
                            this.offset += this.metrics.getLineSize(this.currentLine);
                        }
                        var maxCol = this.metrics.getLineSize(this.currentLine);
                        if(this.currentCol < maxCol) this.offset += this.currentCol;
                        else {
                            this.currentCol = maxCol - 1;
                            this.offset += this.currentCol;
                        }
                        this._.fire(this, prevOffset, prevLine, prevCol);
                    } break;
                default: throw new Error();
            }
        };
    },

    function (pi){
        this._ = new pkg.Listeners("posChanged");
        this.isValid = false;
        this.currentLine = this.currentCol = this.offset = 0;
        this.setPositionMetric(pi);
    },

    function setPositionMetric(p){
        if(p == null) throw new Error("Null metric");
        if(p != this.metrics){
            this.metrics = p;
            this.clearPos();
        }
    }
]);

pkg.timer = new (function() {
    var quantum = 40;

    this.runners =  Array(5);
    this.count   =  0;
    this.pid     = -1;
    for(var i = 0; i < this.runners.length; i++) this.runners[i] = { run:null };

    this.get = function(r) {
        if (this.count > 0) {
            for(var i=0; i < this.runners.length; i++) {
                var c = this.runners[i];
                if (c.run != null && c.run == r) return c;
            }
        }
        return null;
    };

    this.start = function(r, startIn, repeatIn){
        if (arguments.length < 3) repeatIn = 150;
        if (arguments.length < 2) startIn  = 150;

        var ps = this.runners.length;
        if (this.count == ps) throw new Error("Out of runners limit");

        var ci = this.get(r);
        if (ci == null) {
            var runners = this.runners, $this = this;
            for(var i=0; i < ps; i++) {
                var j = (i + this.count) % ps, c = runners[j];
                if (c.run == null) {
                    c.run = r;                      
                    c.si  = startIn;
                    c.ri  = repeatIn;
                    break;
                }
            }
            this.count++;

            if (this.count == 1) {
                this.pid = window.setInterval(function() {
                    for(var i = 0; i < ps; i++) {
                        var c = runners[i];
                        if (c.run != null) {
                            if (c.si <= 0) {
                                try      { c.run.run(); }
                                catch(e) { zebra.print(e); }
                                c.si += c.ri;
                            }
                            else c.si -= quantum;
                        }
                    }
                    if ($this.count === 0) { 
                        window.clearInterval($this.pid);
                        $this.pid = -1;
                    }
                }, quantum);
            }
        }
        else {
            ci.si = startIn;
            ci.ri = repeatIn;
        }

        return r;
    };

    this.stop = function(l) {
        this.get(l).run = null;
        this.count--;
        if (this.count == 0 && this.pid >= 0) {
            window.clearInterval(this.pid);
            this.pid = -1;
        }
    };

    this.clear = function(l){
        var c = this.get(l);
        c.si = c.ri;
    };
})();

pkg.Bag = zebra.Class([
    function $prototype() {
        this.usePropertySetters = true;
        this.ignoreNonExistentKeys = false;

        this.get = function(key) {
            if (key == null) throw new Error("Null key");
            var n = key.split('.'), v = this.objects;
            for(var i = 0; i < n.length; i++) {
                v = v[n[i]];
                if (typeof v === "undefined") { 
                    if (this.ignoreNonExistentKeys) return v;
                    throw new Error("Property '" + key + "' not found");
                }
            }
            return v != null && v.$new ? v.$new() : v;
        };

        this.mergeContent = function(o, v) {
            if (v === null || zebra.isNumber(v) || zebra.isBoolean(v) || zebra.isString(v)) return v;

            if (Array.isArray(v)) {
                if (o && !Array.isArray(o)) throw new Error("Array merging type inconsistency");
                return o ? o.concat(v) : v;
            }

            for (var k in v) {
                if (v.hasOwnProperty(k)) {
                    o[k] = o.hasOwnProperty(k) ? this.mergeContent(o[k], v[k]) : v[k];
                }
            }
            return o;
        };

        // create, merge to o and return a value by the given description d that is designed to be assigned to o
        // -- atomic types int string boolean number are returned as is
        // -- created by the given description array are append to o array
        // -- structure description (dictionary) are merged to o
        this.mergeObjWithDesc = function(o, d) {
            // atomic type should be returned as is
            if (d === null || zebra.isNumber(d) || zebra.isBoolean(d)) {
                return d;
            }

            // array should be merged (concatenated)
            if (Array.isArray(d)) {
                var v = [];
                for(var i=0; i< d.length; i++) v[i] = this.mergeObjWithDesc(null, d[i]);
                if (o && Array.isArray(o) === false) throw new Error("Destination has to be array");
                return (o != null) ? o.concat(v) : v;
            }

            // string is atomic, but  string can encode type other than string, decode string
            // (if necessary) by calling decodeStringValue method
            if (zebra.isString(d)) {
                return (d[0] == "@") ? this.get(d.substring(1)) 
                                     : (this.decodeStringValue ? this.decodeStringValue(d) : d);
            }

            // store and cleanup $inherit synthetic field from description.
            var inh = null;
            if (d.hasOwnProperty("$inherit")) {
                inh = d["$inherit"];
                delete d["$inherit"];
            }

            // test whether we have a class definition
            for (var k in d) {
                // handle class definition
                if (k[0] == '$' && d.hasOwnProperty(k)) {
                    var classname = k.substring(1).trim(), args = d[k];
                    args = this.mergeObjWithDesc(null, Array.isArray(args) ? args : [ args ]);
                    delete d[k];

                    if (classname[0] == "*") {
                        return (function(clazz, args) {
                            return {
                                $new : function() { return pkg.newInstance(clazz, args); }
                            };
                        })(this.resolveClass(classname.substring(1).trim()), args);
                    }
                    return this.mergeObjWithDesc(pkg.newInstance(this.resolveClass(classname), args), d);
                }

                //!!!! trust the name of class occurs first what in general cannot be guaranteed by JSON spec
                //     but we can trust since many other third party applications stands on it too :)
                break;
            }

            // the description is not atomic or array type. it can be either a number of fields that should be
            // merged with appropriate field of "o" object, or it can define how to instantiate an instance of a
            // class. There is one special case: ".name" property says that object is created by calling
            // "name" method
            var v = (o == null || zebra.isNumber(o) || zebra.isBoolean(o) || zebra.isString(o) || Array.isArray(o)) ? d : o;

            for (var k in d) {
                if (d.hasOwnProperty(k)) {
                    // special field name that says to call method to create a value by the given description
                    if (k[0] == ".") {
                        var vv = d[k];
                        if (Array.isArray(vv) === false) vv = [ vv ];
                        return this.objects[k.substring(1).trim()].apply(this.objects, this.mergeObjWithDesc(null, vv));
                    }

                    var po = o && o.hasOwnProperty(k) ? o[k] : null;
                   
                   // v[k] = d[k];

                    var nv = this.mergeObjWithDesc(po, d[k]);
                    if (this.usePropertySetters && k[0] != '.') {
                        m  = zebra.getPropertySetter(v, k);
                        if (m != null) {
                            if (m.length > 1) m.apply(v, nv);
                            else              m.call(v, nv);
                            continue;
                        }
                    }
                    v[k] = nv;
                }
            }

            if (inh !== null) this.inherit(v, inh);
            return v;
        };

        this.resolveClass = function (clazz) {
            return this.aliases.hasOwnProperty(clazz) ? this.aliases[clazz]
                                                      : zebra.Class.forName(clazz);
        };

        this.inherit = function(o, pp) {
            for(var i=0; i < pp.length; i++) {
                var op = this.objects, n = pp[i].trim(), nn = n.split("."), j = 0;
                while (j < nn.length) {
                    op = op[nn[j++]];
                    if (op == null) {
                        throw new Error("Wrong inherit path '" + n + "(" + nn[j-1] + ")'");
                    }
                }

                for(var k in op) {
                    if (op.hasOwnProperty(k) && o.hasOwnProperty(k) === false) o[k] = op[k];
                }
            }
        };
    },

    function () { this.$this({}); },

    function (container) {
        this.aliases = {};
        this.objects = container;
        this.content = {};
    },

    function load(s) { return this.load(s, true); },

    function load(s, b) {
        if (this.isloaded === true) throw new Error("Load is done");
        var content = null;
        try { content = JSON.parse(s); }
        catch(e) {
            throw new Error("JSON  loading error: " + e);
        }
        this.content = this.mergeContent(this.content, content);
        if (this.loaded) this.loaded(this.content);
        if (b === true) this.end();
        return this;
    },

    function end() {
        if (typeof this.isloaded === "undefined") {
            this.isloaded = true;
            if (this.content.hasOwnProperty("$aliases")) {
                var aliases = this.content["$aliases"];
                for(var k in aliases) {
                    this.aliases[k.trim()] = Class.forName(aliases[k].trim());
                }
                delete this.content["$aliases"];
            }
            this.objects = this.mergeObjWithDesc(this.objects, this.content);
        }
    }
]);

})(zebra("util"), zebra.Class, zebra.Interface);

(function(pkg, Class) {

var L = pkg.Layout = new zebra.Interface();
pkg.NONE        = 0;
pkg.LEFT        = 1;
pkg.RIGHT       = 2;
pkg.TOP         = 4;
pkg.BOTTOM      = 8;
pkg.CENTER      = 16;
pkg.HORIZONTAL  = 32;
pkg.VERTICAL    = 64;
pkg.TEMPORARY   = 128;

pkg.USE_PS_SIZE = 4;
pkg.STRETCH     = 256;

pkg.TLEFT  = pkg.LEFT  | pkg.TOP;
pkg.TRIGHT = pkg.RIGHT | pkg.TOP;
pkg.BLEFT  = pkg.LEFT  | pkg.BOTTOM;
pkg.BRIGHT = pkg.RIGHT | pkg.BOTTOM;

pkg.getDirectChild = function(parent,child){
    for(; child != null && child.parent != parent; child = child.parent) {}
    return child;
};

pkg.getDirectAt = function(x,y,p){
    for(var i = 0;i < p.kids.length; i++){
        var c = p.kids[i];
        if (c.isVisible && c.x <= x && c.y <= y && c.x + c.width > x && c.y + c.height > y) return i;
    }
    return -1;
};

pkg.getTopParent = function(c){
    for(; c != null && c.parent != null; c = c.parent);
    return c;
};

pkg.getAbsLocation = function(x,y,c){
    while (c.parent != null){
        x += c.x;
        y += c.y;
        c = c.parent;
    }
    return [x, y];
};

pkg.getRelLocation = function(x, y, p, c){
    while(c != p){
        x -= c.x;
        y -= c.y;
        c = c.parent;
    }
    return [x, y];
};

pkg.xAlignment = function(aow,alignX,aw){
    if (alignX == pkg.RIGHT)  return aw - aow;
    if (alignX == pkg.CENTER) return ~~((aw - aow) / 2);
    if (alignX == pkg.LEFT || alignX == pkg.NONE) return 0;
    throw new Error("Invalid alignment " + alignX);
};

pkg.yAlignment = function(aoh,alignY,ah){
    if (alignY == pkg.BOTTOM) return ah - aoh;
    if (alignY == pkg.CENTER) return ~~((ah - aoh) / 2);
    if (alignY == pkg.TOP || alignY == pkg.NONE) return 0;
    throw new Error("Invalid alignment " + alignY);
};

pkg.getMaxPreferredSize = function(target){
    var maxWidth = 0, maxHeight = 0;
    for(var i = 0;i < target.kids.length; i++){
        var l = target.kids[i];
        if(l.isVisible){
            var ps = l.getPreferredSize();
            if(ps.width > maxWidth) maxWidth = ps.width;
            if(ps.height > maxHeight) maxHeight = ps.height;
        }
    }
    return { width:maxWidth, height:maxHeight };
};

pkg.isAncestorOf = function(p,c){
    for(; c != null && c != p; c = c.parent);
    return c != null;
};

pkg.Layoutable = Class(L, [
    function $prototype() {
        this.x = this.y = this.height = this.width = this.cachedHeight= 0;
        this.psWidth = this.psHeight = this.cachedWidth = -1;
        this.isLayoutValid = this.isValid = false;
        this.constraints = this.parent = null;
        this.isVisible = true;

        this.find = function(path){
            var res = null;
            zebra.util.findInTree(this, path,
                                function(node, name) { return node.getClazz().$name == name; },
                                function(kid) {
                                   res = kid;
                                   return true;
                                });
            return res;
        };

        this.findAll = function(path, callback){
            var res = [];
            if (callback == null) {
                callback =  function(kid) {
                    res.push(kid);
                    return false;
                };
            } 
            zebra.util.findInTree(this, path,
                                  function(node, name) { return node.getClazz().$name == name; },
                                  callback);
            return res;
        };

        this.validateMetric = function(){
            if (this.isValid === false){
                if (this.recalc) this.recalc();
                this.isValid = true;
            }
        };

        this.invalidateLayout = function(){
            this.isLayoutValid = false;
            if(this.parent != null) this.parent.invalidateLayout();
        };

        this.invalidate = function(){
            this.isValid = this.isLayoutValid = false;
            this.cachedWidth =  -1;
            if(this.parent != null) this.parent.invalidate();
        };

        this.validate = function(){
            this.validateMetric();
            if(this.width > 0 && this.height > 0 && this.isLayoutValid === false && this.isVisible) {
                this.layout.doLayout(this);
                for(var i = 0;i < this.kids.length; i++) {
                    this.kids[i].validate();
                }
                this.isLayoutValid = true;
                if (this.laidout) this.laidout();
            }
        };

        this.getPreferredSize = function(){
            this.validateMetric();
            if(this.cachedWidth < 0){
                var ps = (this.psWidth < 0 || this.psHeight < 0) ? this.layout.calcPreferredSize(this)
                                                                 : { width:0, height:0 };

                ps.width  = this.psWidth  >= 0 ? this.psWidth  : ps.width  + this.getLeft() + this.getRight();
                ps.height = this.psHeight >= 0 ? this.psHeight : ps.height + this.getTop()  + this.getBottom();
                this.cachedWidth  = ps.width;
                this.cachedHeight = ps.height;
                return ps;
            }
            return { width:this.cachedWidth, height:this.cachedHeight };
        };

        this.getTop    = function ()  { return 0; };
        this.getLeft   = function ()  { return 0; };
        this.getBottom = function ()  { return 0; };
        this.getRight  = function ()  { return 0; };

        this.setParent = function (o){
            if(o != this.parent){
                this.parent = o;
                this.invalidate();
            }
        };

        this.setLayout = function (m){
            if (m == null) throw new Error("Null layout");

            if(this.layout != m){
                var pl = this.layout;
                this.layout = m;
                this.invalidate();
                if (this.layoutSet) this.layoutSet(pl);
            }
        };

        this.calcPreferredSize = function (target){ return { width:10, height:10 }; };
        this.doLayout = function (target) {};
        this.indexOf = function (c){ return this.kids.indexOf(c); };

        this.insert = function(i,constr,d){
            d.setParent(this);
            if (d.constraints) constr = d.constraints;
            else               d.constraints = constr;

            if (i == this.kids.length) this.kids.push(d);
            else this.kids.splice(i, 0, d);

            if (this.kidAdded) this.kidAdded(i, constr, d);
            this.invalidate();
            return d;
        };

        this.setLocation = function (xx,yy){
            if(xx != this.x || this.y != yy){
                var px = this.x, py = this.y;
                this.x = xx;
                this.y = yy;
                if (this.relocated) this.relocated(px, py);
            }
        };

        this.setBounds = function (x, y, w, h){
            this.setLocation(x, y);
            this.setSize(w, h);
        };

        this.setSize = function (w,h){
            if (w != this.width || h != this.height){
                var pw = this.width, ph = this.height;
                this.width = w;
                this.height = h;
                this.isLayoutValid = false;
                if (this.resized) this.resized(pw, ph);
            }
        };

        this.getByConstraints = function (c) {
            if(this.kids.length > 0){
                for(var i = 0;i < this.kids.length; i++ ){
                    var l = this.kids[i];
                    if (c == l.constraints) return l;
                }
            }
            return null;
        };

        this.remove = function(c) { this.removeAt(this.kids.indexOf(c)); };

        this.removeAt = function (i){
            var obj = this.kids[i];
            obj.setParent(null);
            if (obj.constraints) obj.constraints = null;
            this.kids.splice(i, 1);
            if (this.kidRemoved) this.kidRemoved(i, obj);
            this.invalidate();
            return obj;
        };

        this.setPreferredSize = function(w,h) {
            if (w != this.psWidth || h != this.psHeight){
                this.psWidth  = w;
                this.psHeight = h;
                this.invalidate();
            }
        };

        this.set = function(constr, d) {
            var pd = this.getByConstraints(constr);
            if (pd != null) this.remove(pd);
            if (d  != null) this.add(constr, d);
        };

        // speedup constructor execution
        this[''] = function() {
             this.kids = [];
             this.layout = this;
        };
    },

    function add(constr,d) {
        return this.insert(this.kids.length, constr, d);
    }
]);

pkg.StackLayout = Class(L, [
    function $prototype() {
        this.calcPreferredSize = function (target){
            return pkg.getMaxPreferredSize(target);
        };

        this.doLayout = function(t){
            var top = t.getTop()  , hh = t.height - t.getBottom() - top,
                left = t.getLeft(), ww = t.width - t.getRight() - left;

            for(var i = 0;i < t.kids.length; i++){
                var l = t.kids[i];
                if (l.isVisible) {
                    if (l.constraints == pkg.USE_PS_SIZE) {
                        var ps = l.getPreferredSize();
                        l.setSize(ps.width, ps.height);
                        l.setLocation(left + (ww - ps.width)/2, top + (hh - ps.height)/2);
                    }
                    else {
                        l.setSize(ww, hh);
                        l.setLocation(left, top);
                    }
                }
            }
        };
    }
]);

pkg.BorderLayout = Class(L, [
    function $prototype() {
        this.hgap = this.vgap = 0;

        this[''] = function(hgap,vgap){
            if (arguments.length > 0) {
                this.hgap = hgap;
                this.vgap = vgap;
            }
        };

        this.calcPreferredSize = function (target){
            var center = null, west = null,  east = null, north = null, south = null, d = null;
            for(var i = 0; i < target.kids.length; i++){
                var l = target.kids[i];
                if(l.isVisible){
                    switch(l.constraints) {
                       case pkg.CENTER : center = l;break;
                       case pkg.TOP    : north  = l;break;
                       case pkg.BOTTOM : south  = l;break;
                       case pkg.LEFT   : west   = l;break;
                       case pkg.RIGHT  : east   = l;break;
                       default: throw new Error("Undefined constraints: " + l.constraints); 
                    }
                }
            }

            var dim = { width:0, height:0 };
            if (east != null) {
                d = east.getPreferredSize();
                dim.width += d.width + this.hgap;
                dim.height = (d.height > dim.height ? d.height: dim.height );
            }

            if (west != null){
                d = west.getPreferredSize();
                dim.width += d.width + this.hgap;
                dim.height = d.height > dim.height ? d.height : dim.height;
            }

            if (center != null){
                d = center.getPreferredSize();
                dim.width += d.width;
                dim.height = d.height > dim.height ? d.height : dim.height;
            }

            if (north != null){
                d = north.getPreferredSize();
                dim.width = d.width > dim.width ? d.width : dim.width;
                dim.height += d.height + this.vgap;
            }

            if (south != null){
                d = south.getPreferredSize();
                dim.width = d.width > dim.width ? d.width : dim.width;
                dim.height += d.height + this.vgap;
            }
            return dim;
        };

        this.doLayout = function(t){
            var top = t.getTop(), bottom = t.height - t.getBottom(),
                left = t.getLeft(), right = t.width - t.getRight(),
                center = null, west = null,  east = null;

            for(var i = 0;i < t.kids.length; i++){
                var l = t.kids[i];
                if (l.isVisible) {
                    switch(l.constraints) {
                        case pkg.CENTER: center = l; break;
                        case pkg.TOP :
                            var ps = l.getPreferredSize();
                            l.setLocation(left, top);
                            l.setSize(right - left, ps.height);
                            top += ps.height + this.vgap;
                            break;
                        case pkg.BOTTOM:
                            var ps = l.getPreferredSize();
                            l.setLocation(left, bottom - ps.height);
                            l.setSize(right - left, ps.height);
                            bottom -= ps.height + this.vgap;
                            break;
                        case pkg.LEFT: west = l; break;
                        case pkg.RIGHT: east = l; break;
                        default: throw new Error("Invalid constraints: " + l.constraints);
                    }
                }
            }

            if (east != null){
                var d = east.getPreferredSize();
                east.setLocation(right - d.width, top);
                east.setSize(d.width, bottom - top);
                right -= d.width + this.hgap;
            }

            if (west != null){
                var d = west.getPreferredSize();
                west.setLocation(left, top);
                west.setSize(d.width, bottom - top);
                left += d.width + this.hgap;
            }

            if (center != null){
                center.setLocation(left, top);
                center.setSize(right - left, bottom - top);
            }
        };
    }
]);

pkg.RasterLayout = Class(L, [
    function () { this.$this(0); },
    function (f){ this.flag = f; },

    function $prototype() {
        this.calcPreferredSize = function(c){
            var m = { width:0, height:0 }, b = (this.flag & pkg.USE_PS_SIZE) > 0;
            for(var i = 0;i < c.kids.length; i++ ){
                var el = c.kids[i];
                if(el.isVisible){
                    var ps = b ? el.getPreferredSize() : { width:el.width, height:el.height },
                        px = el.x + ps.width, py = el.y + ps.height;
                    if (px > m.width) m.width = px;
                    if (py > m.height) m.height = py;
                }
            }
            return m;
        };

        this.doLayout = function(c){
            var r = c.width - c.getRight(), b = c.height - c.getBottom(),
                usePsSize = (this.flag & pkg.USE_PS_SIZE) > 0;
            for(var i = 0;i < c.kids.length; i++ ){
                var el = c.kids[i], ww = 0, hh = 0;
                if(el.isVisible){
                    if(usePsSize){
                        var ps = el.getPreferredSize();
                        ww = ps.width;
                        hh = ps.height;
                    }
                    else{
                        ww = el.width;
                        hh = el.height;
                    }
                    if ((this.flag & pkg.HORIZONTAL) > 0) ww = r - el.x;
                    if ((this.flag & pkg.VERTICAL  ) > 0) hh = b - el.y;
                    el.setSize(ww, hh);
                }
            }
        };
    }
]);

pkg.FlowLayout = Class(L, [
    function $prototype() {
        this.gap = 0;
        this.ax  = pkg.LEFT;
        this.ay  = pkg.TOP;
        this.direction = pkg.HORIZONTAL;

        this[''] =  function (ax,ay,dir,g){
            if (arguments.length == 1) this.gap = ax;
            else {
                if (arguments.length >= 2) {
                    this.ax = ax;
                    this.ay = ay;
                }

                if (arguments.length > 2)  {
                    if (dir != pkg.HORIZONTAL && dir != pkg.VERTICAL) throw new Error("Invalid direction " + dir);
                    this.direction = dir;
                }

                if (arguments.length > 3) this.gap = g;
            }
        };

        this.calcPreferredSize = function (c){
            var m = { width:0, height:0 }, cc = 0;
            for(var i = 0;i < c.kids.length; i++){
                var a = c.kids[i];
                if(a.isVisible){
                    var d = a.getPreferredSize();
                    if(this.direction == pkg.HORIZONTAL){
                        m.width += d.width;
                        m.height = d.height > m.height ? d.height : m.height;
                    }
                    else{
                        m.width = d.width > m.width ? d.width : m.width;
                        m.height += d.height;
                    }
                    cc++;
                }
            }
            var add = this.gap * (cc > 0 ? cc - 1 : 0);
            if (this.direction == pkg.HORIZONTAL) m.width += add;
            else m.height += add;
            return m;
        };

        this.doLayout = function(c){
            var psSize = this.calcPreferredSize(c), t = c.getTop(), l = c.getLeft(), lastOne = null,
                px = pkg.xAlignment(psSize.width,  this.ax, c.width  - l - c.getRight()) + l,
                py = pkg.yAlignment(psSize.height, this.ay, c.height - t - c.getBottom()) + t;

            for(var i = 0;i < c.kids.length; i++){
                var a = c.kids[i];
                if(a.isVisible){
                    var d = a.getPreferredSize();
                    if (this.direction == pkg.HORIZONTAL){
                        a.setLocation(px, ~~((psSize.height - d.height) / 2) + py);
                        px += (d.width + this.gap);
                    }
                    else {
                        a.setLocation(px + ~~((psSize.width - d.width) / 2), py);
                        py += d.height + this.gap;
                    }
                    a.setSize(d.width, d.height);
                    lastOne = a;
                }
            }

            if (lastOne !== null && pkg.STRETCH == lastOne.constraints){
                if (this.direction == pkg.HORIZONTAL) lastOne.setSize(c.width - lastOne.x - c.getRight(), lastOne.height);
                else lastOne.setSize(lastOne.width, c.height - lastOne.y - c.getBottom());
            }
        };
    }
]);

pkg.ListLayout = Class(L, [
    function (){ this.$this(0); },
    function (gap){ this.$this(pkg.STRETCH, gap); },

    function (ax, gap){
        if(ax !=  pkg.STRETCH && ax != pkg.LEFT && ax != pkg.RIGHT && ax != pkg.CENTER) {
            throw new Error("Invalid alignment");
        }
        this.ax = ax;
        this.gap = gap;
    },

    function $prototype() {
        this.calcPreferredSize = function (lw){
            var w = 0, h = 0, c = 0;
            for(var i = 0; i < lw.kids.length; i++){
                var kid = lw.kids[i];
                if(kid.isVisible){
                    var d = kid.getPreferredSize();
                    h += (d.height + (c > 0 ? this.gap : 0));
                    c++;
                    if (w < d.width) w = d.width;
                }
            }
            return { width:w, height:h };
        };

        this.doLayout = function (lw){
            var x = lw.getLeft(), y = lw.getTop(), psw = lw.width - x - lw.getRight();
            for(var i = 0;i < lw.kids.length; i++){
                var cc = lw.kids[i];
                if(cc.isVisible){
                    var d = cc.getPreferredSize(), constr = d.constraints;
                    if (constr == null) constr = this.ax;
                    cc.setSize    ((constr == pkg.STRETCH) ? psw : d.width, d.height);
                    cc.setLocation((constr == pkg.STRETCH) ? x   : x + pkg.xAlignment(cc.width, constr, psw), y);
                    y += (d.height + this.gap);
                }
            }
        };
    }
]);

pkg.PercentLayout = Class(L, [
    function (){ this.$this(pkg.HORIZONTAL, 2); },
    function (dir, gap) { this.$this(dir, gap, true); },

    function (dir, gap, stretch){
        if(dir != pkg.HORIZONTAL && dir != pkg.VERTICAL) throw new Error("Invalid direction");
        this.dir = dir;
        this.gap = gap;
        this.stretch = stretch;
    },

    function $prototype() {
        this.doLayout = function(target){
            var right = target.getRight(), top = target.getTop(), bottom = target.getBottom(), left = target.getLeft(),
                size = target.kids.length, rs = -this.gap * (size === 0 ? 0 : size - 1), loc = 0, ns = 0;

            if (this.dir == pkg.HORIZONTAL){
                rs += target.width - left - right;
                loc = left;
            }
            else{
                rs += target.height - top - bottom;
                loc = top;
            }

            for(var i = 0;i < size; i ++ ){
                var l = target.kids[i], c = l.constraints;
                if(this.dir == pkg.HORIZONTAL){
                    ns = ((size - 1) == i) ? target.width - right - loc : ~~((rs * c) / 100);
                    var yy = top, hh = target.height - top - bottom;
                    if (this.stretch === false) {
                        var ph = hh;
                        hh = l.getPreferredSize().height;
                        yy = top + ~~((ph - hh) / 2 );
                    }

                    l.setLocation(loc, yy);
                    l.setSize(ns, hh);
                }
                else{
                    ns = ((size - 1) == i) ? target.height - bottom - loc : ~~((rs * c) / 100);
                    var xx = left, ww = target.width - left - right;
                    if (this.stretch === false) {
                        var pw = ww;
                        ww = l.getPreferredSize().width;
                        xx = left + ~~((pw - ww) / 2 );
                    }

                    l.setLocation(xx, loc);
                    l.setSize(ww, ns);
                }
                loc += (ns + this.gap);
            }
        };

        this.calcPreferredSize = function (target){
            var max = 0, size = target.kids.length, as = this.gap * (size === 0 ? 0 : size - 1);
            for(var i = 0;i < size; i++){
                var d = target.kids[i].getPreferredSize();
                if(this.dir == pkg.HORIZONTAL){
                    if(d.height > max) max = d.height;
                    as += d.width;
                }
                else {
                    if(d.width > max) max = d.width;
                    as += d.height;
                }
            }
            return (this.dir == pkg.HORIZONTAL) ? { width:as, height:max }
                                                : { width:max, height:as };
        };
    }
]);

pkg.Constraints = Class([
    function $prototype() {
        this.top = this.bottom = this.left = this.right = 0;
        this.ay = this.ax = pkg.STRETCH;
        this.rowSpan = this.colSpan = 1;
    },

    function () {},

    function (ax, ay) {
        this.ax = ax;
        this.ay = ay;
    },

    function setPadding(p) {
        this.top = this.bottom = this.left = this.right = p;
    },

    function setPaddings(t,l,b,r) {
        this.top    = t;
        this.bottom = b;
        this.left   = l;
        this.right  = r;
    }
]);

pkg.GridLayout = Class(L, [
    function(r,c) { this.$this(r, c, 0); },

    function(r,c,m){
        this.rows = r;
        this.cols = c;
        this.mask = m;
        this.colSizes = Array(c + 1);
        this.rowSizes = Array(r + 1);
    },

    function $prototype() {
        var DEF_CONSTR = new pkg.Constraints();

        this.getSizes = function(c, isRow){
            var max = isRow ? this.rows : this.cols, res = isRow ? this.rowSizes : this.colSizes;
            res[max] = 0;
            for(var i = 0;i < max; i++){
                res[i] = isRow ? this.calcRowSize(i, c) : this.calcColSize(i, c);
                res[max] += res[i];
            }
            return res;
        };

        this.calcRowSize = function(row, c){
            var max = 0, s = zebra.util.indexByPoint(row, 0, this.cols);
            for(var i = s; i < c.kids.length && i < s + this.cols; i ++ ){
                var a = c.kids[i];
                if(a.isVisible){
                    var arg = a.constraints || DEF_CONSTR, d = a.getPreferredSize().height;
                    d += (arg.top + arg.bottom);
                    max = (d > max ? d : max);
                }
            }
            return max;
        };

        this.calcColSize = function(col, c){
            var max = 0, r = 0, i = 0;
            while((i = zebra.util.indexByPoint(r, col, this.cols)) < c.kids.length){
                var a = c.kids[i];
                if (a.isVisible) {
                    var arg = a.constraints || DEF_CONSTR, d = a.getPreferredSize().width;
                    d += (arg.left + arg.right);
                    max = (d > max ? d : max);
                }
                r++;
            }
            return max;
        };

        this.calcPreferredSize = function(c){
            return { width : this.getSizes(c, false)[this.cols],
                     height: this.getSizes(c, true) [this.rows] };
        };

        this.doLayout = function(c){
            var rows = this.rows, cols = this.cols,
                colSizes = this.getSizes(c, false), 
                rowSizes = this.getSizes(c, true),
                top = c.getTop(), left = c.getLeft();

            if ((this.mask & pkg.HORIZONTAL) > 0){
                var dw = c.width - left - c.getRight() - colSizes[cols];
                for(var i = 0;i < cols; i ++ ) {
                    colSizes[i] = colSizes[i] + (colSizes[i] !== 0 ? ~~((dw * colSizes[i]) / colSizes[cols]) : 0);
                }
            }

            if((this.mask & pkg.VERTICAL) > 0){
                var dh = c.height - top - c.getBottom() - rowSizes[rows];
                for(var i = 0;i < rows; i++ ){
                    rowSizes[i] = rowSizes[i] + (rowSizes[i] !== 0 ? ~~((dh * rowSizes[i]) / rowSizes[rows]) : 0);
                }
            }

            var cc = 0;
            for(var i = 0;i < rows && cc < c.kids.length; i++){
                var xx = left;
                for(var j = 0;j < cols && cc < c.kids.length; j++, cc++){
                    var l = c.kids[cc];
                    if(l.isVisible){
                        var arg = l.constraints || DEF_CONSTR, d = l.getPreferredSize(), cellW = colSizes[j], cellH = rowSizes[i];
                        cellW -= (arg.left + arg.right);
                        cellH -= (arg.top  + arg.bottom);

                        if (pkg.STRETCH == arg.ax) d.width  = cellW;
                        if (pkg.STRETCH == arg.ay) d.height = cellH;
                        l.setSize(d.width, d.height);
                        l.setLocation(xx  + arg.left + (pkg.STRETCH == arg.ax ? 0 : pkg.xAlignment(d.width,  arg.ax, cellW)),
                                      top + arg.top  + (pkg.STRETCH == arg.ay ? 0 : pkg.yAlignment(d.height, arg.ay, cellH)));
                        xx += colSizes[j];
                    }
                }
                top += rowSizes[i];
            }
        };
    }
]);

})(zebra("layout"), zebra.Class);

(function(pkg, Class, Interface) {

var instanceOf = zebra.instanceOf, L = zebra.layout, MB = zebra.util, $configurators = [],
    rgb = zebra.util.rgb, temporary = { x:0, y:0, width:0, height:0 }, MS = Math.sin, MC = Math.cos, 
    $fmCanvas = null, $fmText = null, $fmImage = null, $clipboard = null, $clipboardCanvas, $canvases = []; 

var $view = pkg.$view = function(v) {
    if (v == null) return null;

    if (v.paint) return v;

    if (zebra.isString(v)) return rgb.hasOwnProperty(v) ? rgb[v] : new rgb(v);

    if (Array.isArray(v)) { 
        return new pkg.CompositeView(v);
    }

    if (typeof v !== 'function') {
        return new pkg.ViewSet(v);
    }

    var v = new pkg.View();
    v.paint = f;
    return v;        
};

pkg.$detectZCanvas = function(canvas) {
    if (zebra.isString(canvas)) canvas = document.getElementById(canvas);
    for(var i=0; canvas != null && i < $canvases.length; i++) {
        if ($canvases[i].canvas == canvas) return $canvases[i];
    }
    return null;
};

pkg.View = Class([
    function $prototype() {
        this.gap = 2;
        function gap() { return this.gap; };
        this.getTop           = gap;
        this.getBottom        = gap;
        this.getLeft          = gap;
        this.getRight         = gap;
        this.getPreferredSize = function() { return { width:0, height:0 }; };
        this.paint = function() {};
    }
]);

pkg.Render = Class(pkg.View, [
    function $prototype() {
        this[''] = function(target) { this.setTarget(target); };  

        this.setTarget = function(o) {
            if (this.target != o) {
                var old = this.target;
                this.target = o;
                if (this.targetWasChanged) this.targetWasChanged(old, o);
            }
        };
    }
]);

pkg.Raised = Class(pkg.View, [
    function() { this.$this(pkg.lightBrColor, pkg.midBrColor); },

    function(brightest,middle) {
        this.brightest = brightest == null ? "white" : brightest;
        this.middle    = middle    == null ? "gray"  : middle;
    },

    function $prototype() {
        this.paint = function(g,x1,y1,w,h,d){ 
            var x2 = x1 + w - 1, y2 = y1 + h - 1;
            g.setColor(this.brightest);
            g.drawLine(x1, y1, x2, y1);
            g.drawLine(x1, y1, x1, y2);
            g.setColor(this.middle);
            g.drawLine(x2, y1, x2, y2 + 1);
            g.drawLine(x1, y2, x2, y2);
        };
    }
]);

pkg.Sunken = Class(pkg.View, [
    function () { this.$this(pkg.lightBrColor, pkg.midBrColor, pkg.darkBrColor); },

    function (brightest,middle,darkest) {
        this.brightest = brightest == null ? "white" : brightest;
        this.middle    = middle    == null ? "gray"  : middle;
        this.darkest   = darkest   == null ? "black" : darkest;
    },

    function $prototype() {
        this.paint = function(g,x1,y1,w,h,d){
            var x2 = x1 + w - 1, y2 = y1 + h - 1;
            g.setColor(this.middle);
            g.drawLine(x1, y1, x2 - 1, y1);
            g.drawLine(x1, y1, x1, y2 - 1);
            g.setColor(this.brightest);
            g.drawLine(x2, y1, x2, y2 + 1);
            g.drawLine(x1, y2, x2, y2);
            g.setColor(this.darkest);
            g.drawLine(x1 + 1, y1 + 1, x1 + 1, y2);
            g.drawLine(x1 + 1, y1 + 1, x2, y1 + 1);
        };
    }
]);

pkg.Etched = Class(pkg.View, [
    function () { this.$this(pkg.lightBrColor, pkg.midBrColor); },

    function (brightest,middle) {
        this.brightest = brightest == null ? "white" : brightest;
        this.middle    = middle    == null ? "gray" : middle;
    },

    function $prototype() {
        this.paint = function(g,x1,y1,w,h,d){
            var x2 = x1 + w - 1, y2 = y1 + h - 1;
            g.setColor(this.middle);
            g.drawLine(x1, y1, x1, y2 - 1);
            g.drawLine(x2 - 1, y1, x2 - 1, y2);
            g.drawLine(x1, y1, x2, y1);
            g.drawLine(x1, y2 - 1, x2 - 1, y2 - 1);

            g.setColor(this.brightest);
            g.drawLine(x2, y1, x2, y2);
            g.drawLine(x1 + 1, y1 + 1, x1 + 1, y2 - 1);
            g.drawLine(x1 + 1, y1 + 1, x2 - 1, y1 + 1);
            g.drawLine(x1, y2, x2 + 1, y2);
        };
    }
]);

pkg.Dotted = Class(pkg.View, [
    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            g.setColor(this.color);
            g.drawDottedRect(x, y, w, h);
        };

        this[''] = function (c){
            this.color  = (c == null) ? "black" : c;
        };
    }
]);

pkg.Border = Class(pkg.View, [
    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            if (this.color == null) return;

            var ps = g.lineWidth;
            g.lineWidth = this.width;
            if (this.radius > 0) this.outline(g,x,y,w,h, d);
            else {
                var dt = this.width / 2;
                g.beginPath();
                g.rect(x + dt, y + dt, w - this.width, h - this.width);
            }
            g.setColor(this.color);
            g.stroke();
            g.lineWidth = ps;
        };

        this.outline = function(g,x,y,w,h,d) {
            if (this.radius <= 0) return false;
            var r = this.radius, dt = this.width / 2, xx = x + w - dt, yy = y + h - dt;
            x += dt;
            y += dt;
            g.beginPath();
            g.moveTo(x - 1 + r, y);
            g.lineTo(xx - r, y);
            g.quadraticCurveTo(xx, y, xx, y + r);
            g.lineTo(xx, yy  - r);
            g.quadraticCurveTo(xx, yy, xx - r, yy);
            g.lineTo(x + r, yy);
            g.quadraticCurveTo(x, yy, x, yy - r);
            g.lineTo(x, y + r);
            g.quadraticCurveTo(x, y, x + r, y);
            return true;
        };

        this[''] = function (c,w,r){
            this.color  = (arguments.length == 0) ? "gray" : c;
            this.width  = (w == null) ? 1 : w ;
            this.radius = (r == null) ? 0 : r;
            this.gap = this.width + Math.round(this.radius / 4);
        };
    }
]);

pkg.RoundBorder = Class(pkg.View, [
    function $prototype() {
        this.paint =  function(g,x,y,w,h,d) {
            if (this.color != null && this.size > 0) {
                this.outline(g,x,y,w,h,d);
                g.setColor(this.color);
                g.stroke();
            }               
        };

        this.outline = function(g,x,y,w,h,d) {
            g.beginPath();
            g.lineWidth = this.size;
            g.arc(x + w/2, y + h/2, w/2, 0, 2*Math.PI, false);
            return true;
        };

        this[''] = function(col, size) {
            this.color = null;
            this.size  = 1;

            if (arguments.length > 0) {
                if (zebra.isNumber(col)) this.size = col;
                else {
                    this.color = col;
                    if (zebra.isNumber(size)) this.size = size;         
                }
            }
            this.gap = this.size;
        };
    }    
]);

pkg.Gradient = Class(pkg.View, [
    function $prototype() {
        this[''] =  function(){
            this.colors = Array.prototype.slice.call(arguments, 0);
            if (zebra.isNumber(arguments[arguments.length-1])) {
                this.orientation = arguments[arguments.length-1];
                this.colors.pop();
            }
            else {
                this.orientation = L.VERTICAL;
            }
        };

        this.paint = function(g,x,y,w,h,dd){
            var d = (this.orientation == L.HORIZONTAL? [0,1]: [1,0]),
                x1 = x*d[1], y1 = y * d[0], x2 = (x + w - 1) * d[1], y2 = (y + h - 1) * d[0];

            if (this.gradient == null || this.gx1 != x1 ||
                this.gx2 != x2 || this.gy1 != y1 || this.gy2 != y2)
            {
                this.gx1 = x1;
                this.gx2 = x2;
                this.gy1 = y1;
                this.gy2 = y2;
                this.gradient = g.createLinearGradient(x1, y1, x2, y2);
                for(var i=0;i<this.colors.length;i++) {
                    this.gradient.addColorStop(i, this.colors[i].toString());
                }
            }

            g.fillStyle = this.gradient;
            g.fillRect(x, y, w, h);
        };
    }
]);

pkg.Radial = Class(pkg.View, [
    function $prototype() {
        this[''] =  function(){
            this.colors = Array.prototype.slice.call(arguments, 0);
        };

        this.paint = function(g,x,y,w,h,d){
            var cx1 = w/2, cy1 = w/2, r1 = 10, r2 = Math.min(w, h);
            this.gradient = g.createRadialGradient(cx1, cy1, r1, cx1, cy1, r2);
            for(var i=0;i<this.colors.length;i++) {
                this.gradient.addColorStop(i, this.colors[i].toString());
            }
            g.fillStyle = this.gradient;
            g.fillRect(x, y, w, h);
        };
    }
]);

pkg.Picture = Class(pkg.Render, [
    function (img) { this.$this(img,0,0,0,0, false);  },
    function (img,x,y,w,h){ this.$this(img,x,y,w,h, false); },

    function (img,x,y,w,h, ub){
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        if (ub === true) {
            this.buffer = document.createElement("canvas");
            this.buffer.width = 0;
        }
        this.$super(img);
    },

    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            if(this.target != null && w > 0 && h > 0){
                var img = this.target;
                if (this.buffer) {
                    img = this.buffer;
                    if (img.width <= 0) {
                        var ctx = img.getContext("2d");
                        if (this.width > 0) {
                            img.width  = this.width;
                            img.height = this.height;
                            ctx.drawImage(this.target, this.x, this.y, this.width,
                                          this.height, 0, 0, this.width, this.height);
                        }
                        else {
                            img.width  = this.target.width;
                            img.height = this.target.height;
                            ctx.drawImage(this.target, 0, 0);
                        }
                    }
                }

                if(this.width > 0 && !this.buffer) {
                    g.drawImage(img, this.x, this.y,
                                this.width, this.height, x, y, w, h);
                }
                else {
                    g.drawImage(img, x, y, w, h);
                }
            }
        };

        this.targetWasChanged = function(o, n) {
            if (this.buffer) delete this.buffer;
        };

        this.getPreferredSize = function(){
            var img = this.target;
            return img == null ? { width:0, height:0 }
                               : (this.width > 0) ? { width:this.width, height:this.height }
                                                  : { width:img.width, height:img.height };
        };
    }
]);

pkg.Pattern = Class(pkg.Render, [
    function $prototype() {
        this.paint = function(g,x,y,w,h,d) {
            if (this.pattern == null) {
                this.pattern = g.createPattern(this.target, 'repeat');
            }
            g.rect(x, y, w, h);
            g.fillStyle = this.pattern;
            g.fill();
        }
    }
]);

pkg.CompositeView = Class(pkg.View, [
    function $prototype() {
        this.left = this.right = this.bottom = this.top = this.height = this.width = 0;

        this.getTop = function() { 
            return this.top; 
        };
        
        this.getLeft = function() { 
            return this.left; 
        };
        
        this.getBottom = function () { 
            return this.bottom; 
        };
        
        this.getRight = function () { 
            return this.right; 
        };

        this.getPreferredSize = function (){
            return { width:this.width, height:this.height};
        };

        this.$recalc = function(v) {
            var b = 0, ps = v.getPreferredSize();
            if (v.getLeft) {
                b = v.getLeft();
                if (b > this.left) this.left = b;
            }

            if (v.getRight) {
                b = v.getRight();
                if (b > this.right) this.right = b;
            }

            if (v.getTop) {
                b = v.getTop();
                if (b > this.top) this.top = b;
            }

            if (v.getBottom) {
                b = v.getBottom();
                if (b > this.bottom) this.bottom = b;
            }


            if (ps.width > this.width) this.width = ps.width;
            if (ps.height > this.height) this.height = ps.height;

            if (this.voutline == null && v.outline) {
                this.voutline = v;
            } 
        };

        this.paint = function(g,x,y,w,h,d) { 
            for(var i=0; i < this.views.length; i++) {
                var v = this.views[i]; 
                v.paint(g, x, y, w, h, d); 
            }
        };

        this.outline = function(g,x,y,w,h,d) {
            return this.voutline && this.voutline.outline(g,x,y,w,h,d);
        }

        this[''] = function() {
            this.views = [];
            var args = arguments.length == 1 ? arguments[0] : arguments;    
            for(var i = 0; i < args.length; i++) {
                this.views[i] = $view(args[i]);
                this.$recalc(this.views[i]);
            }
        };
    }
]);

pkg.Shadow = Class(pkg.Render, [
    function $prototype() {
        this.paint = function(g, x, y, w, h, d) {
            if (this.shadowColor) {
                try {
                    g.save();
                    g.shadowColor    = this.shadowColor;
                    g.shadowBlur     = this.shadowBlur;
                    g.shadowOffsetX  = this.shadowOffsetX;
                    g.shadowOffsetY  = this.shadowOffsetY;
                    if (this.outline(g, x, y, w, h, d)) g.clip();
                    this.target.paint(g,x,y,w,h,d);
                }
                finally {
                    g.restore();                    
                }
            }
            else {
                this.target.paint(g,x,y,w,h,d);
            }
        };

        this.outline = function(g, x, y, w, h, d) {
            return this.target && this.target.outline && this.target.outline(g,x,y,w,h,d);
        };
    },

    function (target, color, blur) {
        this.$super($view(target));
        this.shadowColor = color;
        this.shadowOffsetY = this.shadowOffsetX = 0;
        this.shadowBlur = blur;
        this.gap = blur;
        if (target.activate) {
            this.activate = function(id) {
                this.target.activate(id);
            };
        }
    }
]);

pkg.ViewSet = Class(pkg.CompositeView, [
    function $prototype() {
        this.paint = function(g,x,y,w,h,d) { 
            if (this.activeView != null) this.activeView.paint(g, x, y, w, h, d);
        };

        this.activate = function (id){
            var old = this.activeView;
            if (this.views.hasOwnProperty(id)) return (this.activeView = this.views[id]) != old;
            else {
                if (id.length > 1 && id[0] != '*' && id[id.length-1] != '*') {
                    var i = id.indexOf('.');
                    if (i > 0) {
                        var k = id.substring(0, i + 1).concat('*');
                        if (this.views.hasOwnProperty(k)) return (this.activeView = this.views[k]) != old;
                        else {
                            k = "*" + id.substring(i);
                            if (this.views.hasOwnProperty(k)) return (this.activeView = this.views[k]) != old;
                        }
                    }                     
                }
            }

            if (this.views.hasOwnProperty("*")) return (this.activeView = this.views["*"]) != old;
            return false;
        };
    
        this[''] = function(args) {
            if (args == null) throw new Error("Invalid view set");
            this.views = {};
            this.activeView = null;
            for(var k in args) {
                this.views[k] = $view(args[k]);
                if (this.views[k]) this.$recalc(this.views[k]);
            }
            this.activate("*");
        };
    }
]);

pkg.Bag = Class(zebra.util.Bag, [
    function $prototype() {
        this.usePropertySetters = false;
    },

    function loaded(v) {
        if (v == null || zebra.isNumber(v) || zebra.isBoolean(v)) return v;
        if (zebra.isString(v)) {
            if (this.root && v[0] == "%" && v[1] == "r") {
                var s = "%root%/", i = v.indexOf(s);
                if (i === 0) return this.root.join(v.substring(s.length));
            }
            return v;
        }

        if (Array.isArray(v)) {
            for (var i = 0; i < v.length; i++) v[i] = this.loaded(v[i]);
            return v;
        }

        for (var k in v) if (v.hasOwnProperty(k)) v[k] = this.loaded(v[k]);
        return v;
    },

    function loadByUrl(url) { return this.loadByUrl(url, null); },

    function loadByUrl(url, context) {
        this.root = null;
        if (zebra.URL.isAbsolute(url) || context == null) this.root = (new zebra.URL(url)).getParentURL();
        else {
            if (context != null) {
                url  = new zebra.URL(context.$url.join(url));
                this.root = url.getParentURL();
            }
        }
        return this.load(zebra.io.GET(url.toString()), false);
    }
]);

rgb.prototype.paint = function(g,x,y,w,h,d) {
    if (this.s != g.fillStyle) g.fillStyle = this.s;
    g.fillRect(x, y, w, h);
};

rgb.prototype.getPreferredSize = function() {
    return { width:0, height:0 };
};

pkg.getPreferredSize = function(l) {
    return l != null && l.isVisible ? l.getPreferredSize() : { width:0, height:0 };
};

var $cvp = pkg.$cvp = function(c, r) {
    if (c.width > 0 && c.height > 0 && c.isVisible){
        var p = c.parent, px = -c.x, py = -c.y;
        if (r == null) r = { x:0, y:0, width:0, height:0 };
        else r.x = r.y = 0;
        r.width  = c.width;
        r.height = c.height;

        while (p != null && r.width > 0 && r.height > 0) {
            var xx = r.x > px ? r.x : px, yy = r.y > py ? r.y : py;

            r.width  = Math.min(r.x + r.width, px + p.width) - xx,
            r.height = Math.min(r.y + r.height, py + p.height) - yy;
            r.x = xx;
            r.y = yy;

            px -= p.x;
            py -= p.y;
            p = p.parent;
        }
        return r.width > 0 && r.height > 0 ? r : null;
    }
    return null;
};

pkg.configure = function(c) { $configurators.push(c); };

//!!! Font should be able to parse CSS string
pkg.Font = function(name, style, size) {
    if (arguments.length == 1) {
        name = name.replace(/[ ]+/, ' ');
        this.s = name.trim();
    }
    else {
        this.s = [
                    (style & pkg.Font.ITALIC) > 0 ? 'italic ' : '',
                    (style & pkg.Font.BOLD)   > 0 ? 'bold '   : '',
                     size, 'px ', name
                 ].join('');
    }
    $fmText.style.font = this.s;
    this.height = $fmText.offsetHeight;
    this.ascent = $fmImage.offsetTop - $fmText.offsetTop + 1;
};

pkg.Font.PLAIN  = 0;
pkg.Font.BOLD   = 1;
pkg.Font.ITALIC = 2;

pkg.Font.prototype.stringWidth = function(s) {
    if (s.length === 0) return 0;
    if ($fmCanvas.font != this.s) $fmCanvas.font = this.s;
    return ($fmCanvas.measureText(s).width + 0.5) | 0;
};

pkg.Font.prototype.charsWidth = function(s, off, len) {
    if ($fmCanvas.font != this.s) $fmCanvas.font = this.s;
    return ($fmCanvas.measureText(len == 1 ? s[off] : s.substring(off, off + len)).width + 0.5) | 0;
};

pkg.Font.prototype.toString = function() { return this.s;  };

pkg.Cursor = {
    DEFAULT     : "default",
    MOVE        : "move",
    WAIT        : "wait",
    TEXT        : "text",
    HAND        : "pointer",
    NE_RESIZE   : "ne-resize",
    SW_RESIZE   : "sw-resize",
    SE_RESIZE   : "se-resize",
    NW_RESIZE   : "nw-resize",
    S_RESIZE    : "s-resize",
    W_RESIZE    : "w-resize",
    N_RESIZE    : "n-resize",
    E_RESIZE    : "e-resize",
    COL_RESIZE  : "col-resize",
    HELP        : "help"
};

var MouseListener       = pkg.MouseListener       = Interface(),
    MouseMotionListener = pkg.MouseMotionListener = Interface(),
    FocusListener       = pkg.FocusListener       = Interface(),
    KeyListener         = pkg.KeyListener         = Interface(),
    Cursorable          = pkg.Cursorable          = Interface(),
    Composite           = pkg.Composite           = Interface(),
    ChildrenListener    = pkg.ChildrenListener    = Interface(),
    CopyCutPaste        = pkg.CopyCutPaste        = Interface(),   
    CL                  = pkg.ComponentListener   = Interface(),
    CNL                 = pkg.ContainerListener   = Interface();

CL.COMP_ENABLED = 1;
CL.COMP_SHOWN   = 2;
CL.COMP_MOVED   = 3;
CL.COMP_SIZED   = 4;

CNL.COMP_ADDED   = 1;
CNL.COMP_REMOVED = 2;
CNL.LAYOUT_SET   = 3;

var IE = pkg.InputEvent = Class([
    function $clazz() {
        this.MOUSE_UID    = 1;
        this.KEY_UID      = 2;
        this.FOCUS_UID    = 3;
        this.FOCUS_LOST   = 1;
        this.FOCUS_GAINED = 2;
    },

    function (target, id, uid){
        this.source = target;
        this.ID = id;
        this.UID = uid;
    }
]);

var KE = pkg.KeyEvent = Class(IE, [
    function $clazz() {
        this.TYPED    = 3;
        this.RELEASED = 4;
        this.PRESSED  = 5;

        this.ENTER  = 13;
        this.ESCAPE = 27;
        this.SPACE  = 32;
        this.DELETE = 46;
        this.BSPACE = 8;
        this.TAB    = 9;
        this.INSERT = 45;
        this.DELETE = 46;

        this.M_CTRL  = 1;
        this.M_SHIFT = 2;
        this.M_ALT   = 4;
        this.M_CMD   = 8;
        
        this.LEFT = 37;
        this.RIGHT = 39;
        this.UP = 38;
        this.DOWN = 40;
        this.HOME = 36;
        this.END = 35;
        this.PAGEUP = 33;
        this.PAGEDOWN = 34;

        this.SHIFT = 16;
        this.CTRL  = 17;
        this.CMD   = zebra.isFF ? 224 : 91;
        this.ALT   =  18;

        this.CHAR_UNDEFINED = 0;
    },

    function $prototype() {
        this.reset = function(target,id,code,ch,mask){
            this.source = target;
            this.ID     = id;
            this.code   = code;
            this.mask   = mask;
            this.ch     = ch;
        };

        this.isControlPressed = function(){ return (this.mask & KE.M_CTRL) > 0; };
        this.isShiftPressed   = function(){ return (this.mask & KE.M_SHIFT) > 0; };
        this.isAltPressed     = function(){ return (this.mask & KE.M_ALT) > 0; };
        this.isCmdPressed     = function(){ return (this.mask & KE.M_CMD) > 0; };
    },

    function (target,id,code,ch,mask){
        this.$super(target, id, IE.KEY_UID);
        this.reset(target, id, code, ch, mask);
    }
]), $clipboardTriggerKey = pkg.$clipboardTriggerKey = zebra.isMacOS ? KE.CMD : KE.CTRL;

var ME = pkg.MouseEvent = Class(IE, [
    function $clazz() {
        this.CLICKED      = 6;
        this.PRESSED      = 7;
        this.RELEASED     = 8;
        this.ENTERED      = 9;
        this.EXITED       = 10;
        this.DRAGGED      = 11;
        this.STARTDRAGGED = 12;
        this.ENDDRAGGED   = 13;
        this.MOVED        = 14;

        this.LEFT_BUTTON  = 128;
        this.RIGHT_BUTTON = 512;
    },

    function $prototype() {
        this.reset = function(target,id,ax,ay,mask,clicks){
            this.source = target;
            this.ID = id;
            this.absX = ax;
            this.absY = ay;
            this.mask = mask;
            this.clicks = clicks;

            var p = L.getTopParent(target);
            while(target != p){
                ax -= target.x;
                ay -= target.y;
                target = target.parent;
            }
            this.x = ax;
            this.y = ay;
        };

        this.isActionMask = function(){
            return this.mask === 0 || ((this.mask & ME.LEFT_BUTTON) > 0 && 
                                       (this.mask & ME.RIGHT_BUTTON) === 0);
        };

        this.isControlPressed = function()  { return (this.mask & KE.M_CTRL) > 0; };
        this.isShiftPressed = function()    { return (this.mask & KE.M_SHIFT) > 0; };
    },

    function (target,id,ax,ay,mask,clicks){
        this.$super(target, id, IE.MOUSE_UID);
        this.reset(target, id, ax, ay, mask, clicks);
    }
]);

pkg.findCanvas = function(c){
    c = L.getTopParent(c);
    return instanceOf(c, pkg.zCanvas) ? c : null;
};

var MDRAGGED = ME.DRAGGED, EM = null, MMOVED = ME.MOVED, MEXITED = ME.EXITED, 
    KPRESSED = KE.PRESSED, BM1 = ME.LEFT_BUTTON, BM3 = ME.RIGHT_BUTTON, MENTERED = ME.ENTERED,
    context = Object.getPrototypeOf(document.createElement('canvas').getContext('2d')),
    $mousePressedEvent = null, $keyPressedCode = -1, $keyPressedOwner = null, $mousePressedX = 0,
    $keyPressedModifiers = 0, KE_STUB = new KE(null,  KPRESSED, 0, 'x', 0), $focusGainedCounter = 0,
    ME_STUB = new ME(null,  ME.PRESSED, 0, 0, 0, 1), meX, meY, $mousePressedY = 0, $mousePressedCanvas = null;

pkg.paintManager = pkg.events = pkg.$mousePressedOwner = pkg.$mouseDraggOwner = pkg.$mouseMoveOwner = null;

// !!!!
// the document mouse up happens when we drag outside a canvas
// in this case canvas doesn't get mouse up, so we do it by global mouseup handler
document.addEventListener("mouseup", function(e) {
    if (pkg.$mousePressedOwner) {
        var d = pkg.findCanvas(pkg.$mousePressedOwner);
        d.mouseReleased(e);
    }
},  false);

// !!!
// override alert to keep control on event sequence, it is very browser dependent
var $alert = (function(){ return this.alert; }());
window.alert = function() {
    if ($keyPressedCode > 0) {
        KE_STUB.reset($keyPressedOwner, KE.RELEASED, $keyPressedCode, '', $keyPressedModifiers);
        EM.performInput(KE_STUB);
        $keyPressedCode = -1;
    }
    $alert.apply(window, arguments);
    if ($mousePressedEvent) $mousePressedEvent.$zcanvas.mouseReleased($mousePressedEvent);
};

//!!!! debug var debugOff = true, setup = [];
// function debug(msg, d) {
//     if (debugOff) return ;
//     if (d == -1) shift.pop();
//     zebra.print(shift.join('') + msg);
//     if (d == 1) shift.push('    ');
// }
context.setFont = function(f) {
    f = (f.s ? f.s : f.toString()); 
    if (f != this.font) {
        this.font = f;
    }
};

context.setColor = function(c) {
    if (c == null) throw new Error("Null color");
    c = (c.s ? c.s : c.toString()); 
    if (c != this.fillStyle) this.fillStyle = c;
    if (c != this.strokeStyle) this.strokeStyle = c;
};

context.drawLine = function(x1, y1, x2, y2, w){
    if (arguments.length < 5) w = 1;
    var pw = this.lineWidth;
    this.beginPath();
    this.lineWidth = w;

    if (x1 == x2) {
        x1 += w / 2;
        x2 = x1;
    }
    else
    if (y1 == y2) {
        y1 += w / 2;
        y2 = y1;
    }

    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.stroke();
    this.lineWidth = pw;
};

context.ovalPath = function(x,y,w,h){
    this.beginPath();
    x += this.lineWidth;
    y += this.lineWidth;
    w -= 2 * this.lineWidth;
    h -= 2 * this.lineWidth;

    var kappa = 0.5522848, ox = (w / 2) * kappa, oy = (h / 2) * kappa,
        xe = x + w, ye = y + h, xm = x + w / 2, ym = y + h / 2;
    this.moveTo(x, ym);
    this.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    this.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    this.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    this.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
};

context.polylinePath = function(xPoints, yPoints, nPoints){
    this.beginPath();
    this.moveTo(xPoints[0], yPoints[0]);
    for(var i=1; i < nPoints; i++) this.lineTo(xPoints[i], yPoints[i]);
};

context.drawOval = function(x,y,w,h) {
    this.ovalPath(x, y, w, h);
    this.stroke();
};

context.drawPolygon = function(xPoints,yPoints,nPoints){
    this.polylinePath(xPoints, yPoints, nPoints);
    this.lineTo(xPoints[0], yPoints[0]);
    this.stroke();
};

context.drawPolyline = function(xPoints,yPoints,nPoints){
    this.polylinePath(xPoints, yPoints, nPoints);
    this.stroke();
};

context.fillPolygon = function(xPoints,yPoints,nPoints){
    this.polylinePath(xPoints, yPoints, nPoints);
    this.lineTo(xPoints[0], yPoints[0]);
    this.fill();
};

context.fillOval = function(x,y,width,height){
    this.beginPath();
    this.ovalPath(x, y, width, height);
    this.fill();
};

context.drawDottedRect = function(x,y,w,h) {
    var ctx = this, m = ["moveTo", "lineTo", "moveTo"];
    function dv(x, y, s) { for(var i=0; i < s; i++) ctx[m[i%3]](x + 0.5, y + i); }
    function dh(x, y, s) { for(var i=0; i < s; i++) ctx[m[i%3]](x + i, y + 0.5); }
    ctx.beginPath();
    dh(x, y, w);
    dh(x, y + h - 1, w);
    ctx.stroke();
    ctx.beginPath();
    dv(x, y, h);
    dv(w + x - 1, y, h);
    ctx.stroke();
};

context.drawDashLine = function(x,y,x2,y2) {
    var pattern=[1,2], count = pattern.length, ctx = this, compute = null,
        dx = (x2 - x), dy = (y2 - y), b = (Math.abs(dx) > Math.abs(dy)),
        slope = b ? dy / dx : dx / dy, sign = b ? (dx < 0 ?-1:1) : (dy < 0?-1:1);

    if (b) {
        compute = function(step) {
            x += step;
            y += slope * step;
        };
    }
    else {
        compute = function(step) {
            x += slope * step;
            y += step;
        };
    }

    ctx.moveTo(x, y);
    var dist = Math.sqrt(dx * dx + dy * dy), i = 0;
    while (dist >= 0.1) {
        var dl = Math.min(dist, pattern[i % count]), step = Math.sqrt(dl * dl / (1 + slope * slope)) * sign;
        compute(step);
        ctx[(i % 2 === 0) ? 'lineTo' : 'moveTo'](x + 0.5, y + 0.5);
        dist -= dl;
        i++;
    }
    ctx.stroke();
};

//!!! has to be made public in layout !!!
function measure(e, cssprop) {
    var value = window.getComputedStyle ? window.getComputedStyle(e, null).getPropertyValue(cssprop)
                                        : (e.style ? e.style[cssprop] 
                                                   : e.currentStyle[cssprop]);
    return (value == null || value == '') ? 0 
                                          : parseInt(/(^[0-9\.]+)([a-z]+)?/.exec(value)[1], 10);
}

pkg.makeFullyVisible = function(d,c){
    var right = d.getRight(), top = d.getTop(), bottom = d.getBottom(), 
        left = d.getLeft(), xx = c.x, yy = c.y, ww = c.width, hh = c.height;
    if (xx < left) xx = left;
    if (yy < top)  yy = top;
    if (xx + ww > d.width - right) xx = d.width + right - ww;
    if (yy + hh > d.height - bottom) yy = d.height + bottom - hh;
    c.setLocation(xx, yy);
};

pkg.calcOrigin = function(x,y,w,h,px,py,t,tt,ll,bb,rr){
    if (arguments.length < 8) {
        tt = t.getTop();
        ll = t.getLeft();
        bb = t.getBottom();
        rr = t.getRight();
    }

    var dw = t.width, dh = t.height;
    if(dw > 0 && dh > 0){
        if(dw - ll - rr > w){
            var xx = x + px;
            if(xx < ll) px += (ll - xx);
            else {
                xx += w;
                if (xx > dw - rr) px -= (xx - dw + rr);
            }
        }
        if(dh - tt - bb > h){
            var yy = y + py;
            if (yy < tt) py += (tt - yy);
            else {
                yy += h;
                if (yy > dh - bb) py -= (yy - dh + bb);
            }
        }
        return [px, py];
    }
    return [0, 0];
};

pkg.loadImage = function(path, ready) {
    var i = new Image();
    zebra.busy();
    if (arguments.length > 1)  {
        i.onerror = function() {  zebra.ready(); ready(path, false);  };
        i.onload  = function() {  zebra.ready(); ready(path, true);  };
    }
    else {
        i.onload  =  i.onerror = function() { zebra.ready(); };
    }
    i.src = path;
    return i;
};

pkg.get = function(key) { return pkg.$objects.get(key); };

pkg.Panel = Class(L.Layoutable, [
     function $prototype() {
        this.top = this.left = this.right = this.bottom = 0;
        this.isEnabled = true;

        this.notifyRender = function(o,n){
            if (o != null && o.ownerChanged) o.ownerChanged(null);
            if (n != null && n.ownerChanged) n.ownerChanged(this);
        };

        this.properties = function(p) {
            for(var k in p) {
                if (p.hasOwnProperty(k)) {
                    var v = p[k], m = zebra.getPropertySetter(this, k);
                    if (v && v.$new) v = v.$new();
                    if (m == null) this[k] = v;
                    else {
                        if (Array.isArray(v)) m.apply(this, v);
                        else  m.call(this, v); 
                    }
                }
            }
            return this;
        };

        this.load = function(jsonPath) {
            jsonPath = jsonPath + (jsonPath.lastIndexOf("?") > 0 ? "&" : "?") + (new Date()).getTime().toString();
            (new zebra.util.Bag(this)).load(zebra.io.GET(jsonPath));
            return this;
        };

        this.getComponentAt = function(x,y){
            var r = $cvp(this, temporary);
            if (r == null || (x < r.x || y < r.y || x >= r.x + r.width || y >= r.y + r.height)) {
                return null;
            }

            var k = this.kids;
            if (k.length > 0){
                for(var i = k.length; --i >= 0; ){
                    var d = k[i];
                    d = d.getComponentAt(x - d.x, y - d.y);
                    if (d != null) return d;
                }
            }
            return this.contains == null || this.contains(x, y) ? this : null;
        };

        this.vrp = function(){
            this.invalidate();
            if(this.parent != null) this.repaint();
        };

        this.getTop = function() {
            return this.border != null ? this.top + this.border.getTop() : this.top;
        };

        this.getLeft = function() {
            return this.border != null ? this.left + this.border.getLeft() : this.left;
        };

        this.getBottom = function() {
            return this.border != null ? this.bottom + this.border.getBottom() : this.bottom;
        };

        this.getRight  = function() {
            return this.border != null ? this.right  + this.border.getRight()  : this.right;
        };

        this.isInvalidatedByChild = function(c) { return true; };

        this.kidAdded = function (index,constr,l){
            pkg.events.performCont(CNL.COMP_ADDED, this, constr, l);
            if(l.width > 0 && l.height > 0) l.repaint();
            else this.repaint(l.x, l.y, 1, 1);
        };

        this.kidRemoved = function(i,l){
            pkg.events.performCont(CNL.COMP_REMOVED, this, null, l);
            if (l.isVisible) this.repaint(l.x, l.y, l.width, l.height);
        };

        this.layoutSet    = function (old){ pkg.events.performCont(CNL.LAYOUT_SET, this, old, null); };
        this.relocated    = function(px,py){ pkg.events.performComp(CL.COMP_MOVED, px, py, this); };
        this.resized      = function(pw,ph){ pkg.events.performComp(CL.COMP_SIZED, pw, ph, this); };
        this.hasFocus     = function(){ return pkg.focusManager.hasFocus(this); };
        this.requestFocus = function(){ pkg.focusManager.requestFocus(this); };

        this.setVisible = function (b){
            if (this.isVisible != b) {
                this.isVisible = b;
                this.invalidate();
                pkg.events.performComp(CL.COMP_SHOWN,  -1,  -1, this);
            }
        };

        this.getScrollManager = function () { return null; };

        this.setEnabled = function (b){
            if (this.isEnabled != b){
                this.isEnabled = b;
                pkg.events.performComp(CL.COMP_ENABLED,  -1,  -1, this);
                if (this.kids.length > 0) {
                    for(var i = 0;i < this.kids.length; i++) this.kids[i].setEnabled(b);
                }
            }
        };

        this.setPaddings = function (top,left,bottom,right){
            if (this.top != top || this.left != left || 
                this.bottom != bottom || this.right != right) 
            {
                this.top = top;
                this.left = left;
                this.bottom = bottom;
                this.right = right;
                this.vrp();
            }
        },

        this.setPadding = function(v) { this.setPaddings(v,v,v,v); };

        this.setBorder = function (v){
            var old = this.border;
            v = $view(v);
            if (v != old){
                this.border = v;
                this.notifyRender(old, v);

                if ( old == null || v == null         ||
                     old.getTop()    != v.getTop()    ||
                     old.getLeft()   != v.getLeft()   ||
                     old.getBottom() != v.getBottom() ||
                     old.getRight()  != v.getRight())
                {
                    this.invalidate();
                }

                if (v && v.activate) {
                    v.activate(this.hasFocus() ?  "function": "focusoff" );
                } 

                this.repaint();
            }
        };

        this.setBackground = function (v){
            var old = this.bg;
            v = $view(v);
            if (v != old) {
                this.bg = v;
                this.notifyRender(old, v);
                this.repaint();
            }
        };

        this.setKids = function() {
            if (arguments.length == 1 && Array.isArray(arguments[0])) {
                arguments = arguments[0];
            }

            if (instanceOf(arguments[0], pkg.Panel)) {
                for(var i=0; i<arguments.length; i++) {
                    var kid = arguments[i];
                    this.insert(i, kid.constraints, kid);
                }
            }
            else {
                var kids = arguments[0];
                for(var k in kids) {
                    if (kids.hasOwnProperty(k)) {
                        if (L[k] != null && zebra.isNumber(L[k])) {
                            this.add(L[k], kids[k]);
                        }
                        else this.add(k, kids[k]);
                    }
                }
            }
        };

        this.focused = function() {
            if (this.border && this.border.activate) {
                var id = this.hasFocus() ? "focuson" : "focusoff" ;
                if (this.border.views[id]) {
                    this.border.activate(id);
                    this.repaint();
                }
            }
        };

        this.repaint = function(x,y,w,h){
            if (arguments.length == 0) {
                x = y = 0;
                w = this.width;
                h = this.height;
            }
            if (this.parent != null && this.width > 0 && this.height > 0 && pkg.paintManager != null){
                pkg.paintManager.repaint(this, x, y, w, h);
            }
        };
    },

    function() {
        this.$super();
        var clazz = this.getClazz();
        while (clazz) {
            if (clazz.properties != null) {
                this.properties(clazz.properties);
                break;
            }
            clazz = clazz.$parent;
        }
    },

    function(l) {
        this.$this();
        if (instanceOf(l, L.Layout)) this.setLayout(l);
        else this.properties(l);
    },

    function add(c){ return this.insert(this.kids.length, null, c); },
    function insert(i,d) { return this.insert(i, null, d); },

    function removeAll(){
        if(this.kids.length > 0){
            var size = this.kids.length, mx1 = Number.MAX_VALUE, my1 = mx1, mx2 = 0, my2 = 0;
            for(; size > 0; size--){
                var child = this.kids[size - 1];
                if(child.isVisible){
                    var xx = child.x, yy = child.y;
                    mx1 = Math.min(mx1, xx);
                    my1 = Math.min(my1, yy);
                    mx2 = Math.max(mx2, xx + child.width);
                    my2 = Math.max(my2, yy + child.height);
                }
                this.removeAt(size - 1);
            }
            this.repaint(mx1, my1, mx2 - mx1, my2 - my1);
        }
    },

    function toFront(c){
        var i = this.indexOf(c);
        if(i < (this.kids.length - 1)){
            this.kids.splice(i, 1);
            this.kids.push(c);
            c.repaint();
        }
    },

    function toPreferredSize(){
        var ps = this.getPreferredSize();
        this.setSize(ps.width, ps.height);
    }
]);

pkg.BaseLayer = Class(pkg.Panel, [
    function $prototype() {

        this.layerMousePressed = function(x,y,m){};
        this.layerKeyPressed = function(code,m){};
        this.getFocusRoot = function() { return this; };

        this.activate = function(b){
            var fo = pkg.focusManager.focusOwner;
            if (L.isAncestorOf(this, fo) === false) fo = null;

            if (b) pkg.focusManager.requestFocus(fo != null ? fo : this.pfo);
            else {
                this.pfo = fo;
                pkg.focusManager.requestFocus(null);
            }
        };
    },

    function (id){
        if (id == null) throw new Error("Wrong ID");
        this.pfo = null;
        this.$super();
        this.id = id;
    }
]);

pkg.RootLayer = Class(pkg.BaseLayer, [
    function $prototype() {
        this.isLayerActive = function(x,y){ return true; };
    }
]);

pkg.ViewPan = Class(pkg.Panel, [
    function $prototype() {
        this.paint = function (g){
            var v = this.view;
            if(v != null){
                var l = this.getLeft(), t = this.getTop();
                v.paint(g, l, t, this.width  - l - this.getRight(),
                                 this.height - t - this.getBottom(), this);
            }
        };

        this.setView = function (v){
            var old = this.view;
            v = $view(v);
            
            if(v != old) {
                this.view = v;
                this.notifyRender(old, v);
                this.vrp();
            }
        };

        this.calcPreferredSize = function (t) {
            return this.view ? this.view.getPreferredSize() : { width:0, height:0 };
        };
    }
]);

pkg.ImagePan = Class(pkg.ViewPan, [
    function () { this.$this(null); },

    function (img){
        this.setImage(img);
        this.$super();
    },

    function setImage(img) {
        if (img && zebra.isString(img)) {
            var $this = this;
            img = pkg.loadImage(img, function(b) { if (b) $this.vrp(); });
        }
        this.setView(instanceOf(img, pkg.Picture) ? img : new pkg.Picture(img));
    }
]);

pkg.Manager = Class([
    function() {
        //!!! sometimes pkg.events is set to descriptor the descriptor
        //    is used ot instantiate new event manager. when we do it
        //    Manager constructor is called from new phase of event manager
        //    instantiation what means  event manager is not null (points to descriptor)
        //    but not assigned yet. So we need check extra condition pkg.events.addListener != null
        if (pkg.events != null && pkg.events.addListener != null) {
            pkg.events.addListener(this);
        }
    }
]);

pkg.PaintManager = Class(pkg.Manager, [
    function $prototype() {
        var $timers = {};

        this.repaint = function(c,x,y,w,h){
            if (arguments.length == 1) {
                x = y = 0;
                w = c.width;
                h = c.height;
            }

            if (w > 0 && h > 0 && c.isVisible === true){
                var r = $cvp(c, temporary);
                if (r == null) return;
                MB.intersection(r.x, r.y, r.width, r.height, x, y, w, h, r);
                if (r.width <= 0 || r.height <= 0) return;
                x = r.x;
                y = r.y;
                w = r.width;
                h = r.height;

                var canvas = pkg.findCanvas(c);
                if(canvas != null){
                    var p = L.getAbsLocation(x, y, c), x2 = canvas.width, y2 = canvas.height;

                    x = p[0];
                    y = p[1];
                    if(x < 0) {
                        w += x;
                        x = 0;
                    }
                    if(y < 0) {
                        h += y;
                        y = 0;
                    }

                    if (w + x > x2) w = x2 - x;
                    if (h + y > y2) h = y2 - y;

                    if (w > 0 && h > 0)
                    {
                        var da = canvas.da;
                        if(da.width > 0) {
                            if (x >= da.x && y >= da.y && x + w <= da.x + da.width && y + h <= da.y + da.height) { 
                                return;
                            }
                            MB.unite(da.x, da.y, da.width, da.height, x, y, w, h, da);
                        }
                        else MB.intersection(0, 0, canvas.width, canvas.height, x, y, w, h, da);

                        if (da.width > 0 && !$timers[canvas]) {
                            var $this = this;
                            $timers[canvas] = setTimeout(function() {
                                $timers[canvas] = null;
                                var context = canvas.graph;

                                try {
                                    canvas.validate();
                                    context.save();

                                    //!!!! debug
                                    //zebra.print(" ============== DA = " + canvas.da.y );
                                    // var dg = canvas.canvas.getContext("2d");
                                    // dg.strokeStyle = 'red';
                                    //dg.beginPath();
                                    //dg.rect(da.x, da.y, da.width, da.height);
                                    // dg.stroke();

                                    context.clipRect(canvas.da.x, canvas.da.y, canvas.da.width, canvas.da.height);
                                    $this.paint(context, canvas);
                                    context.restore();
                                    canvas.da.width = -1; //!!!
                                }
                                catch(e) { zebra.print(e); }
                            }, 50);
                        }
                        if (da.width > 0) canvas.repaint(da.x, da.y, da.width, da.height);
                    }
                }
            }
        };

        this.paint = function(g,c){
            var dw = c.width, dh = c.height, ts = g.getTopStack();
            if(dw !== 0 && dh !== 0 && ts.width > 0 && ts.height > 0 && c.isVisible){
                c.validate();

                g.save();
                g.translate(c.x, c.y);
                g.clipRect(0, 0, dw, dh);

                ts = g.getTopStack();
                var c_w = ts.width, c_h = ts.height;
                if (c_w > 0 && c_h > 0) {
                    this.paintComponent(g, c);
                    var count = c.kids.length, c_x = ts.x, c_y = ts.y;
                    for(var i = 0; i < count; i++) {
                        var kid = c.kids[i];
                        if (kid.isVisible) {
                            var kidX = kid.x, kidY = kid.y,
                                iw = Math.min(kidX + kid.width,  c_x + c_w) - (kidX > c_x ? kidX : c_x),
                                ih = Math.min(kidY + kid.height, c_y + c_h) - (kidY > c_y ? kidY : c_y);

                            if (iw > 0 && ih > 0) this.paint(g, kid);
                        }
                    }
                    if (c.paintOnTop) c.paintOnTop(g);
                }

                g.restore();
            }
        };
    }
]);

pkg.PaintManImpl = Class(pkg.PaintManager, CL, [
    function $prototype() {
        this.compEnabled = function(t) { this.repaint(t); };

        this.compShown = function(t){
            if (t.isVisible) this.repaint(t);
            else {
                if (t.parent != null) this.repaint(t.parent, t.x, t.y, t.width, t.height);
            }
        };

        this.compSized = function(pw,ph,t){
            if (t.parent != null) {
                var w = t.width, h = t.height;
                this.repaint(t.parent, t.x, t.y, (w > pw) ? w : pw, (h > ph) ? h : ph);
            }
        };

        this.compMoved = function(px,py,t){
            var p = t.parent, w = t.width, h = t.height;
            if(p != null && w > 0 && h > 0){
                var x = t.x, y = t.y, nx = Math.max(x < px ? x : px, 0), ny = Math.max(y < py ? y : py, 0);
                this.repaint(p, nx, ny, Math.min(p.width - nx, w + (x > px ? x - px : px - x)),
                                        Math.min(p.height - ny, h + (y > py ? y - py : py - y)));
            }
        };

        this.paintComponent = function(g,c){
            var b = c.bg != null && (c.parent == null || c.bg != c.parent.bg);

            if (c.border && c.border.outline && b && c.border.outline(g, 0, 0, c.width, c.height,c)) {
                g.save();
                g.clip();
                c.bg.paint(g, 0, 0, c.width, c.height, c);
                g.restore();
                b = false;
            }
         
            if (b) { 
                c.bg.paint(g, 0, 0, c.width, c.height, c);
            }

            if (c.border && c.border.paint) c.border.paint(g, 0, 0, c.width, c.height, c);

            if (c.update) c.update(g);

            if (c.paint) {
                var left = c.getLeft(), top = c.getTop(), bottom = c.getBottom(), right = c.getRight(), id = -1;
                if(left + right + top + bottom > 0){
                    var ts = g.getTopStack(), cw = ts.width, ch = ts.height;
                    if(cw <= 0 || ch <= 0) return;
                    var cx = ts.x, cy = ts.y, x1 = (cx > left ? cx : left), y1 = (cy > top ? cy : top);
                    id = g.save();
                    g.clipRect(x1, y1, Math.min(cx + cw, c.width - right) - x1,
                                       Math.min(cy + ch, c.height - bottom) - y1);
                }
                c.paint(g);
                if (id > 0) g.restore();
            }
        };
    }
]);

pkg.FocusManager = Class(pkg.Manager, MouseListener, CL, CNL, KeyListener, [
    function $prototype() {
        function freeFocus(ctx, t){ if(t == ctx.focusOwner) ctx.requestFocus(null);}

        this.prevFocusOwner = this.focusOwner = null;

        this.compEnabled = function(c)   { if (c.isEnabled === false) freeFocus(this, c); };
        this.compShown   = function(c)   { if (c.isVisible === false) freeFocus(this, c); };
        this.compRemoved = function(p,c) { freeFocus(this, c);};

        this.hasFocus = function(c) { return this.focusOwner == c; };

        this.keyPressed = function(e){
            if(KE.TAB == e.code){
                var cc = this.ff(e.source, e.isShiftPressed() ?  -1 : 1);
                if(cc != null) this.requestFocus(cc);
            }
        };

        this.findFocusable = function(c){ return (this.isFocusable(c) ? c : this.fd(c, 0, 1)); };

        this.isFocusable = function(c){
            var d = pkg.findCanvas(c);
            //!!!
            // also we should checks whether parents isFocusable !!!
            return d && c.isEnabled && c.isVisible && c.canHaveFocus && c.canHaveFocus();
        };

        this.fd = function(t,index,d){
            if(t.kids.length > 0){
                var isNComposite = (instanceOf(t, Composite) === false);
                for(var i = index;i >= 0 && i < t.kids.length; i += d) {
                    var cc = t.kids[i];
                    if (cc.isEnabled && cc.isVisible && cc.width > 0 &&
                        cc.height > 0 && (isNComposite || (t.catchInput && t.catchInput(cc) === false)) &&
                        ((cc.canHaveFocus && cc.canHaveFocus()) || (cc = this.fd(cc, d > 0 ? 0 : cc.kids.length - 1, d)) != null))
                    {
                        return cc;
                    }
                }
            }
            return null;
        };

        this.ff = function(c,d){
            var top = c;
            while (top && top.getFocusRoot == null) top = top.parent;
            top = top.getFocusRoot();
            for(var index = (d > 0) ? 0 : c.kids.length - 1;c != top.parent; ){
                var cc = this.fd(c, index, d);
                if(cc != null) return cc;
                cc = c;
                c = c.parent;
                if(c != null) index = d + c.indexOf(cc);
            }
            return this.fd(top, d > 0 ? 0 : top.kids.length - 1, d);
        };

        this.requestFocus = function (c){
            if (c != this.focusOwner && (c == null || this.isFocusable(c))){
                var oldFocusOwner = this.focusOwner;
                if(c != null) {
                    var nf = pkg.events.getEventDestination(c);
                    if(nf == null || oldFocusOwner == nf) return;
                    this.focusOwner = nf;
                }
                else {
                    this.focusOwner = c;
                }

                this.prevFocusOwner = oldFocusOwner;
                if (oldFocusOwner != null) pkg.events.performInput(new IE(oldFocusOwner, IE.FOCUS_LOST, IE.FOCUS_UID));
                if (this.focusOwner != null){ pkg.events.performInput(new IE(this.focusOwner, IE.FOCUS_GAINED, IE.FOCUS_UID)); }
            }
        };

        this.mousePressed = function(e){
            if (e.isActionMask()) {
                this.requestFocus(e.source);
            }
        };
    }
]);

pkg.CommandManager = Class(pkg.Manager, KeyListener, [
    function $prototype() {
        this.keyPressed = function(e) {
            var fo = pkg.focusManager.focusOwner; 
            if (fo != null && this.keyCommands[e.code]) {
                var c = this.keyCommands[e.code]; 
                if (c && c[e.mask] != null) {
                    c = c[e.mask];
                    this._.fire(c);
                    if (fo[c.command]) {
                         if (c.args && c.args.length > 0) fo[c.command].apply(fo, c.args);
                         else fo[c.command]();    
                    }
                }
            }
        };
    },

    function(){
        this.$super();

        this.keyCommands = {}; 
        this._ = new zebra.util.Listeners("commandFired");

        var commands = null;
        if (zebra.isMacOS) { 
            try { commands = zebra.io.GET(pkg.$url + "commands.osx.json"); }
            catch(e) {}
            if (commands != null) commands = JSON.parse(commands); 
        }

        if (commands == null) { 
            commands = JSON.parse(zebra.io.GET(pkg.$url +  "commands.json"));
        }

        for(var i=0; i < commands.length; i++) {
            var c = commands[i], p = this.parseKey(c.key), v = this.keyCommands[p[1]];            

            if (v && v[p[0]]) {
                throw Error("Duplicated command: " + c);
            }

            if (v == null) v = [];
            v[p[0]] = c;
            this.keyCommands[p[1]] = v;
        }   
    },

    function parseKey(k) {
        var m = 0, c = 0, r = k.split("+");
        for(var i = 0; i < r.length; i++) {
            var ch = r[i].trim().toUpperCase();
            if (KE.hasOwnProperty("M_" + ch)) { 
                m += KE["M_" + ch];
                continue;
            }

            if (KE.hasOwnProperty(ch)) { 
                c = KE[ch];
                continue;
            }

            if (zebra.isNumber(ch)) { 
                c = ch; 
                continue;
            }
        }
        return [m, c];
    }
]);

pkg.CursorManager = Class(pkg.Manager, MouseListener, MouseMotionListener, [
    function $prototype() {
        this.setCursorable = function(t,c){
            if(c == null) delete this.cursors[t];
            else this.cursors[t] = c;
        };

        this.mouseMoved   = function(e){ this.setCursorType1(e); };
        this.mouseEntered = function(e){ this.setCursorType1(e); };
        this.mouseExited  = function(e){ this.setCursorType2("default", e.source); };
        this.mouseDragged = function(e){ this.setCursorType1(e); };

        this.setCursorType1 = function(e){
            var t = e.source, c = this.cursors.hasOwnProperty(t) ? this.cursors[t] : null;
            if(c == null && instanceOf(t, Cursorable)) c = t;
            this.setCursorType2(((c != null) ? c.getCursorType(t, e.x, e.y) :  "default"), t);
        };

        this.setCursorType2 = function(type,t){
            if(this.cursorType != type){
                var d = pkg.findCanvas(t);
                if(d != null){
                    this.cursorType = type;
                    d.canvas.style.cursor = (this.cursorType < 0) ? "default" : this.cursorType;
                }
            }
        };
    },

    function(){
        this.$super();
        this.cursors = {};
        this.cursorType = "default";
    }
]);

pkg.EventManager = Class(pkg.Manager, [
    function $prototype() {
        var IEHM = [], MUID = IE.MOUSE_UID, KUID = IE.KEY_UID,
            CSIZED = CL.COMP_SIZED, CMOVED = CL.COMP_MOVED,
            CENABLED = CL.COMP_ENABLED, CSHOWN = CL.COMP_SHOWN;

        IEHM[KE.TYPED]          = 'keyTyped';
        IEHM[KE.RELEASED]       = 'keyReleased';
        IEHM[KE.PRESSED]        = 'keyPressed';
        IEHM[ME.DRAGGED]        = 'mouseDragged';
        IEHM[ME.STARTDRAGGED]   = 'startDragged';
        IEHM[ME.ENDDRAGGED]     = 'endDragged';
        IEHM[ME.MOVED]          = 'mouseMoved';
        IEHM[ME.CLICKED]        = 'mouseClicked';
        IEHM[ME.PRESSED]        = 'mousePressed';
        IEHM[ME.RELEASED]       = 'mouseReleased';
        IEHM[ME.ENTERED]        = 'mouseEntered';
        IEHM[ME.EXITED]         = 'mouseExited';
        IEHM[IE.FOCUS_LOST]     = 'focusLost';
        IEHM[IE.FOCUS_GAINED]   = 'focusGained';

        function findComposite(t,child){
            if(t == null || t.parent == null) return null;
            var p = t.parent, b = instanceOf(p, Composite), res = findComposite(p, b ? p : child);
            return (res != null) ? res : ((b && (!p.catchInput || p.catchInput(child))) ? p : null);
        }

        function handleCompEvent(l,id,a1,a2,c){
            switch(id) {
                case CSIZED:   if (l.compSized) l.compSized(a1, a2, c);break;
                case CMOVED:   if (l.compMoved) l.compMoved(a1, a2, c);break;
                case CENABLED: if (l.compEnabled) l.compEnabled(c);break;
                case CSHOWN:   if (l.compShown) l.compShown(c);break;
                default: throw new Error("Invalid component event id");
            }
        }

        function handleContEvent(l,id,a1,a2,c){
            switch(id) {
                case CNL.COMP_ADDED:   if (l.compAdded) l.compAdded(a1, a2, c); break;
                case CNL.LAYOUT_SET:   if (l.layoutSet) l.layoutSet(a1, a2); break;
                case CNL.COMP_REMOVED: if (l.compRemoved) l.compRemoved(a1, c); break;
                default: throw new Error("Invalid container event id");
            }
        }

        this.performCont = function(id,p,constr,c){
            if (instanceOf(p, CNL)) handleContEvent(p, id, p, constr, c);
            for(var i = 0;i < this.cc_l.length; i++) handleContEvent(this.cc_l[i], id, p, constr, c);

            for(var t = p.parent;t != null; t = t.parent){
                if(t.childContEvent && instanceOf(t, ChildrenListener)) t.childContEvent(id, p, constr, c);
            }
        };

        this.performComp = function(id,pxw,pxh,src){
            if (instanceOf(src, CL)) handleCompEvent(src, id, pxw, pxh, src);
            for(var i = 0;i < this.c_l.length; i++) handleCompEvent(this.c_l[i], id, pxw, pxh, src);
            for(var t = src.parent;t != null; t = t.parent){
                if(t.childCompEvent && instanceOf(t, ChildrenListener)) t.childCompEvent(id, src);
            }
        };

        this.getEventDestination = function(t){
            var composite = findComposite(t, t);
            return composite == null ? t : composite;
        };

        this.performInput = function(e){
            var t = e.source, id = e.ID, it = null, k = IEHM[id], b = false;
            switch(e.UID)
            {
                case MUID:
                    if(id > 10){
                        if (instanceOf(t, MouseMotionListener)) {
                            var m = t[k];
                            if (m) m.call(t, e);
                        }
                        it = this.mm_l;
                        for(var i = 0; i < it.length; i++) {
                            var tt = it[i], m = tt[k];
                            if (m) m.call(tt, e);
                        }
                        return;
                    }
                    else{
                        if(instanceOf(t, MouseListener)) {
                            if (t[k]) t[k].call(t, e);
                        }
                        it = this.m_l;
                    }
                    break;
                case KUID:
                    if(instanceOf(t, KeyListener)) {
                        var m = t[k];
                        if (m) b = m.call(t, e);
                    }
                    it = this.k_l;
                    break;
                case IE.FOCUS_UID:
                    if(instanceOf(t, FocusListener)) {
                        if (t[k]) t[k].call(t, e);
                    }
                    t.focused();
                    it = this.f_l;
                    break;
                default: throw new Error("Invalid input event uid");
            }

            // distribute event to globally registered listeners
            for(var i = 0;i < it.length; i++) {
                var tt = it[i], m = tt[k];
                if (m) b = m.call(tt, e) || b;
            }

            for (t = t.parent;t != null; t = t.parent){
                if (t.childInputEvent && instanceOf(t, ChildrenListener)) t.childInputEvent(e);
            }
            return b;
        };

        this.a_ = function(c, l){ (c.indexOf(l) >= 0) || c.push(l); };
        this.r_ = function(c, l){ (c.indexOf(l) < 0) || c.splice(i, 1); };
    },

    function(){
        this.m_l  = [];
        this.mm_l = [];
        this.k_l  = [];
        this.f_l  = [];
        this.c_l  = [];
        this.cc_l = [];
        this.$super();
    },

    function addListener(l){
        if(instanceOf(l,CL))   this.addComponentListener(l);
        if(instanceOf(l,CNL))   this.addContainerListener(l);
        if(instanceOf(l,MouseListener))       this.addMouseListener(l);
        if(instanceOf(l,MouseMotionListener)) this.addMouseMotionListener(l);
        if(instanceOf(l,KeyListener))         this.addKeyListener(l);
        if(instanceOf(l,FocusListener))       this.addFocusListener(l);
    },

    function removeListener(l) {
        if(instanceOf(l, CL))   this.removeComponentListener(l);
        if(instanceOf(l, CNL))   this.removeContainerListener(l);
        if(instanceOf(l, MouseListener))       this.removeMouseListener(l);
        if(instanceOf(l, MouseMotionListener)) this.removeMouseMotionListener(l);
        if(instanceOf(l, KeyListener))         this.removeKeyListener(l);
        if(instanceOf(l, FocusListener))       this.removeFocusListener(l);
    },

    function addComponentListener(l) { this.a_(this.c_l, l); },
    function removeComponentListener(l){ this.r_(this.c_l, l); },
    function addContainerListener(l){ this.a_(this.cc_l, l); },
    function removeContainerListener(l){ this.r_(this.cc_l, l); },
    function addMouseListener(l){ this.a_(this.m_l, l); },
    function removeMouseListener(l){ this.r_(this.m_l, l); },
    function addMouseMotionListener(l){ this.a_(this.mm_l, l); },
    function removeMouseMotionListener(l){ this.r_(this.mm_l, l); },
    function addFocusListener(l){ this.a_(this.f_l, l); },
    function removeFocusListener(l){ this.r_(this.f_l, l); },
    function addKeyListener(l){ this.a_(this.k_l, l); },
    function removeKeyListener(l){ this.r_(this.k_l, l); }
]);

function setupMeF() {
    if (zebra.isIE) {
        var de = document.documentElement, db = document.body;
        meX = function meX(e, d) { return d.graph.tX(e.clientX - d.offx + de.scrollLeft + db.scrollLeft,
                                                     e.clientY - d.offy + de.scrollTop  + db.scrollTop);  };
        meY = function meY(e, d) {
            return d.graph.tY(e.clientX - d.offx + de.scrollLeft + de.scrollLeft,
                              e.clientY - d.offy + de.scrollTop + db.scrollTop);  };
    }
    else {
        meX = function meX(e, d) {  return d.graph.tX(e.pageX - d.offx, e.pageY - d.offy); };
        meY = function meY(e, d) {  return d.graph.tY(e.pageX - d.offx, e.pageY - d.offy); };
    }
}

function createContext(ctx, w, h) {
    var $save = ctx.save, $restore = ctx.restore, $rotate = ctx.rotate, $scale = ctx.scale, $translate = ctx.translate;

    ctx.$scale = $scale;
    ctx.counter = 0;
    ctx.stack = Array(50);
    for(var i=0; i < ctx.stack.length; i++) {
        var s = {};
        s.srot = s.rotateVal = s.x = s.y = s.width = s.height = s.dx = s.dy = 0;
        s.crot = s.sx = s.sy = 1;
        ctx.stack[i] = s;
    }
    ctx.stack[0].width  = w;
    ctx.stack[0].height = h;
    ctx.setFont(pkg.font);
    ctx.setColor("white");

    ctx.getTopStack = function() { return this.stack[this.counter]; };

    ctx.tX = function(x, y) {
        var c = this.stack[this.counter], b = (c.sx != 1 || c.sy != 1 || c.rotateVal !== 0);
        return (b ?  (((c.crot * x + y * c.srot)/c.sx + 0.5) | 0) : x) - c.dx;
    };

    ctx.tY = function(x, y) {
        var c = this.stack[this.counter], b = (c.sx != 1 || c.sy != 1 || c.rotateVal !== 0);
        return (b ? (((y * c.crot - c.srot * x)/c.sy + 0.5) | 0) : y) - c.dy;
    };

    ctx.translate = function(dx, dy) {
        if (dx !== 0 || dy !== 0) {
            var c = this.stack[this.counter];
            c.x -= dx;
            c.y -= dy;
            c.dx += dx;
            c.dy += dy;
            $translate.call(this, dx, dy);
        }
    };

    ctx.rotate = function(v) {
        var c = this.stack[this.counter];
        c.rotateVal += v;
        c.srot = MS(c.rotateVal);
        c.crot = MC(c.rotateVal);
        $rotate.call(this, v);
    };

    ctx.scale = function(sx, sy) {
        var c = this.stack[this.counter];
        c.sx = c.sx * sx;
        c.sy = c.sy * sy;
        $scale.call(this, sx, sy);
    };


    ctx.save = function() {
        this.counter++;
        var c = this.stack[this.counter], cc = this.stack[this.counter - 1];
        c.x = cc.x;
        c.y = cc.y;
        c.width = cc.width;
        c.height = cc.height;

        c.dx = cc.dx;
        c.dy = cc.dy;
        c.sx = cc.sx;
        c.sy = cc.sy;
        c.srot = cc.srot;
        c.crot = cc.crot;
        c.rotateVal = cc.rotateVal;

        $save.call(this);
        return this.counter - 1;
    };

    ctx.restore = function() {
        if (this.counter === 0) throw new Error("Context restore history is empty");
        this.counter--;
        $restore.call(this);
        return this.counter;
    };

    ctx.clipRect = function(x,y,w,h){
        var c = this.stack[this.counter];
        if (c.x != x || y != c.y || w != c.width || h != c.height) {
            var xx = c.x, yy = c.y, ww = c.width, hh = c.height;
            c.x      = x > xx ? x : xx;
            c.width  = Math.min(x + w, xx + ww) - c.x;
            c.y      = y > yy ? y : yy;
            c.height = Math.min(y + h, yy + hh) - c.y;
            if (c.x != xx || yy != c.y || ww != c.width || hh != c.height) {
                //!!! begin path is very important to have proper clip area
                this.beginPath();
                this.rect(x, y, w, h);
                this.clip();
            }
        }
    };

    ctx.reset = function(w, h) {
        //!!!!!!!!!!!!
        this.counter = 0;
        this.stack[0].width = w;
        this.stack[0].height = h;
    };

    return ctx;
}

pkg.zCanvas = Class(pkg.Panel, [
    function $clazz() {
        this.Layout = Class(L.Layout, [
            function calcPreferredSize(c) {
                return { width:parseInt(c.canvas.width, 10), height:parseInt(c.canvas.height, 10) };
            },

            function doLayout(c){
                var x = c.getLeft(), y = c.getTop(), w = c.width - c.getRight() - x, 
                    h = c.height - c.getBottom() - y;
                for(var i = 0;i < c.kids.length; i++){
                    var l = c.kids[i];
                    if(l.isVisible){
                        l.setLocation(x, y);
                        l.setSize(w, h);
                    }
                }
            }
        ]);
    },

    function $prototype() {
        function km(e) {
            var c = 0;
            if (e.altKey)   c += KE.M_ALT;
            if (e.shiftKey) c += KE.M_SHIFT;
            if (e.ctrlKey)  c += KE.M_CTRL;
            if (e.metaKey)  c += KE.M_CMD;
            return c;
        }

        this.load = function(jsonPath){
            return this.root.load(jsonPath);
        };

        this.focusGained = function(e){
            if ($focusGainedCounter++ > 0) {
                e.preventDefault();
                return;
            }

            //debug("focusGained");

            if (pkg.focusManager.prevFocusOwner != null) {
                var d = pkg.findCanvas(pkg.focusManager.prevFocusOwner);
                if (d == this)  { 
                    pkg.focusManager.requestFocus(pkg.focusManager.prevFocusOwner);
                }
                else {
                    pkg.focusManager.prevFocusOwner = null;
                }
            }
        };

        this.focusLost = function(e){
            //!!! sometimes focus lost comes incorrectly
            if (document.activeElement == this.canvas) {
                e.preventDefault();
                return;
            }

            if ($focusGainedCounter === 0) return;
            $focusGainedCounter = 0;

            //debug("focusLost");
            if (pkg.focusManager.focusOwner != null || pkg.findCanvas(pkg.focusManager.focusOwner) == this) {
                pkg.focusManager.requestFocus(null);
            }
        };

        this.keyTyped = function(e){
            if (e.charCode == 0) {
                if ($keyPressedCode != e.keyCode) this.keyPressed(e);
                $keyPressedCode = -1;
                return;
            }

            if (e.charCode > 0) {
                var fo = pkg.focusManager.focusOwner;
                if(fo != null) {
                    //debug("keyTyped: " + e.keyCode + "," + e.charCode + " " + (e.charCode == 0));
                    KE_STUB.reset(fo, KE.TYPED, e.keyCode, String.fromCharCode(e.charCode), km(e));
                    if (EM.performInput(KE_STUB)) e.preventDefault();
                }
            }

            if (e.keyCode < 47) e.preventDefault();
        };

        this.keyPressed = function(e){
            $keyPressedCode  = e.keyCode;
            var code = e.keyCode, m = km(e), b = false;
            for(var i = this.kids.length - 1;i >= 0; i--){
                var l = this.kids[i];
                l.layerKeyPressed(code, m);
                if (l.isLayerActive && l.isLayerActive()) break;
            }

            var focusOwner = pkg.focusManager.focusOwner;
            if (pkg.useWebClipboard && e.keyCode == $clipboardTriggerKey && 
                focusOwner != null && instanceOf(focusOwner, CopyCutPaste)) 
            {
                $clipboardCanvas = this;  
                $clipboard.style.display = "block";
                this.canvas.onfocus = this.canvas.onblur = null;
                $clipboard.value="";
                $clipboard.select();
                $clipboard.focus();                
                return;        
            }

            $keyPressedOwner     = focusOwner;
            $keyPressedModifiers = m;

            if (focusOwner != null) {
                //debug("keyPressed : " + e.keyCode, 1);
                KE_STUB.reset(focusOwner, KPRESSED, code, code < 47 ? KE.CHAR_UNDEFINED : '?', m);
                b = EM.performInput(KE_STUB);

                if (code == KE.ENTER) {
                    //debug("keyTyped keyCode = " + code);
                    KE_STUB.reset(focusOwner, KE.TYPED, code, "\n", m);
                    b = EM.performInput(KE_STUB) || b;
                }
            }

            //!!!!
            if ((code < 47 && code != 32) || b) e.preventDefault();
        };

        this.keyReleased = function(e){
            $keyPressedCode = -1;

            var fo = pkg.focusManager.focusOwner;
            if(fo != null) {
                //debug("keyReleased : " + e.keyCode, -1);
                KE_STUB.reset(fo, KE.RELEASED, e.keyCode, KE.CHAR_UNDEFINED, km(e));
                if (EM.performInput(KE_STUB)) e.preventDefault();
            }
        };

        this.mouseEntered = function(e){
            if (pkg.$mouseDraggOwner == null){
                var x = meX(e, this), y = meY(e, this), d = this.getComponentAt(x, y);

                if (pkg.$mouseMoveOwner != null && d != pkg.$mouseMoveOwner) {
                    var prev = pkg.$mouseMoveOwner;
                    pkg.$mouseMoveOwner = null;

                    //debug("mouseExited << ", -1);
                    ME_STUB.reset(prev, MEXITED, x, y, -1, 0);
                    EM.performInput(ME_STUB);
                }

                if(d != null && d.isEnabled){
                    //debug("mouseEntered >> ", 1);
                    pkg.$mouseMoveOwner = d;
                    ME_STUB.reset(d, MENTERED, x, y, -1, 0);
                    EM.performInput(ME_STUB);
                }
            }
        };

        this.mouseExited = function (e){
            if(pkg.$mouseMoveOwner != null && pkg.$mouseDraggOwner == null){
                var p = pkg.$mouseMoveOwner;
                pkg.$mouseMoveOwner = null;

                ME_STUB.reset(p, MEXITED, meX(e, this), meY(e, this), -1, 0);
                EM.performInput(ME_STUB);
            }
        };

        this.mouseMoved = function(e){
            if (pkg.$mousePressedOwner != null) {
                if ($mousePressedCanvas == e.target) this.mouseDragged(e);
                return;
            }

            var x = meX(e, this), y = meY(e, this), d = this.getComponentAt(x, y);
            if (pkg.$mouseMoveOwner != null) {
                if (d != pkg.$mouseMoveOwner) {
                    var old = pkg.$mouseMoveOwner;

                    //debug("mouseExited << ", -1);
                    pkg.$mouseMoveOwner = null;
                    ME_STUB.reset(old, MEXITED, x, y, -1, 0);
                    EM.performInput(ME_STUB);

                    if (d != null && d.isEnabled === true) {
                        //debug("mouseEntered >> " , 1);
                        pkg.$mouseMoveOwner = d;
                        ME_STUB.reset(pkg.$mouseMoveOwner, MENTERED, x, y, -1, 0);
                        EM.performInput(ME_STUB);
                    }
                }
                else {
                    if (d != null && d.isEnabled) {
                        ME_STUB.reset(d, MMOVED, x, y, -1, 0);
                        EM.performInput(ME_STUB);
                    }
                }
            }
            else {
                if (d != null && d.isEnabled === true){
                    //debug("mouseEntered >> ", 1);
                    pkg.$mouseMoveOwner = d;
                    ME_STUB.reset(d, MENTERED, x, y, -1, 0);
                    EM.performInput(ME_STUB);
                }
            }
        };

        this.mouseReleased = function(e){
            if ($mousePressedEvent == null) return;
            $mousePressedEvent = null;

            var drag = pkg.$mouseDraggOwner, x = meX(e, this), y = meY(e, this), m = e.button === 0 ? BM1: (e.button == 2 ? BM3 : 0);
            if(drag != null){
                ME_STUB.reset(drag, ME.ENDDRAGGED, x, y, m, 0);
                EM.performInput(ME_STUB);
                pkg.$mouseDraggOwner = null;
            }

            var po = pkg.$mousePressedOwner;
            if (po != null){

                //debug("mouseReleased ", -1);
                ME_STUB.reset(po, ME.RELEASED, x, y, m, 0);
                EM.performInput(ME_STUB);

                if (drag == null) {
                    var when = (new Date()).getTime(), clicks = ((when - this.lastClickTime) < this.doubleClickDelta) ? 2 : 1;
                    ME_STUB.reset(po, ME.CLICKED, x, y, m, clicks);
                    EM.performInput(ME_STUB);
                    this.lastClickTime = clicks > 1 ? 0 : when;
                }
                $mousePressedCanvas = pkg.$mousePressedOwner = null;
            }

            var mo = pkg.$mouseMoveOwner;
            if (drag != null || (po != null && po != mo)) {
                var nd = this.getComponentAt(x, y);
                if (nd != mo) {
                    if (mo != null) {
                        //debug("mouseExited << ", -1);
                        ME_STUB.reset(mo, MEXITED, x, y, -1, 0);
                        EM.performInput(ME_STUB);
                    }

                    if (nd != null && nd.isEnabled === true){
                        pkg.$mouseMoveOwner = nd;

                        //debug("mouseEntered >> ", 1);

                        ME_STUB.reset(nd, MENTERED, x, y, -1, 0);
                        EM.performInput(ME_STUB);
                    }
                }
            }

            //e.preventDefault();
        };

        this.mousePressed = function(e) {
            var $mousePressedMask = e.button === 0 ? BM1: (e.button == 2 ? BM3 : 0);

            // !!! it is possible to have a problem with stored event object in IE
            // !!! store what we need in event-independent object
            $mousePressedEvent = {
                button  : e.button,
                clientX : e.clientX,
                clientY : e.clientY,
                pageX   : e.pageX,
                pageY   : e.pageY,
                $button : $mousePressedMask,
                $zcanvas: this
            };

            $mousePressedX = meX(e, this);
            $mousePressedY = meY(e, this);

            for(var i = this.kids.length - 1;i >= 0; i--){
                var l = this.kids[i];
                l.layerMousePressed($mousePressedX, $mousePressedY, $mousePressedMask);
                if (l.isLayerActive && l.isLayerActive($mousePressedX, $mousePressedY)) break;
            }

            var d = this.getComponentAt($mousePressedX, $mousePressedY);
            if (d != null && d.isEnabled === true){
                pkg.$mousePressedOwner = d;
                $mousePressedCanvas = e.target; 
                ME_STUB.reset(d, ME.PRESSED, $mousePressedX, $mousePressedY, $mousePressedMask, 0);
                EM.performInput(ME_STUB);
            }

            //!!! this prevent DOM elements selection on the page 
            //!!! this code should be still double checked
            //!!!! THIS CODE BRINGS SOME PROBLEM TO IE. IF CURSOR IN ADDRESS TAB PRESSING ON CANVAS
            //!!!! GIVES FOCUS TO CANVAS BUT KEY EVENT GOES TO ADDRESS BAR 
            //e.preventDefault();
            
            if (this.hasFocus() === false) this.canvas.focus();
        };

        this.mouseDragged = function(e){
            var x = meX(e, this), y = meY(e, this), m = $mousePressedEvent.$button;

            if (pkg.$mouseDraggOwner == null){
                var d = (pkg.$mouseMoveOwner == null) ? this.getComponentAt($mousePressedX, $mousePressedY)
                                                      : pkg.$mouseMoveOwner;
                if (d != null && d.isEnabled === true) {
                    pkg.$mouseDraggOwner = d;
                    ME_STUB.reset(d, ME.STARTDRAGGED, $mousePressedX, $mousePressedY, m, 0);
                    EM.performInput(ME_STUB);

                    if ($mousePressedX != x || $mousePressedY != y) {
                        ME_STUB.reset(d, MDRAGGED, x, y, m, 0);
                        EM.performInput(ME_STUB);
                    }
                }
            }
            else {
                ME_STUB.reset(pkg.$mouseDraggOwner, MDRAGGED, x, y, m, 0);
                EM.performInput(ME_STUB);
            }
        };

        this.getComponentAt = function(x,y){
            for(var i = this.kids.length; --i >= 0; ){
                var tl = this.kids[i];
                if (tl.isLayerActive && tl.isLayerActive(x, y)) {
                    return EM.getEventDestination(tl.getComponentAt(x, y));
                }
            }
            return null;
        };

        this.recalcOffset = function() {
            // calculate offset
            var ba = this.canvas.getBoundingClientRect();
            this.offx = ((ba.left + 0.5) | 0)  + measure(this.canvas, "padding-left") + window.pageXOffset;
            this.offy = ((ba.top + 0.5)  | 0)  + measure(this.canvas, "padding-top")  + window.pageYOffset;
        };

        this.getLayer = function(id) { return this[id]; };
    },

    function()       { this.$this(400, 400); },
    function(w, h)   { this.$this(this.toString(), w, h); },
    function(canvas) { this.$this(canvas, -1, -1); },

    function(canvas, w, h) {
        var pc = canvas, $this = this;
        if (zebra.isString(canvas)) { 
            canvas = document.getElementById(canvas);
            if (canvas != null && pkg.$detectZCanvas(canvas)) throw new Error("Canvas is already in use");
        }
        

        if (canvas == null) {
            canvas = document.createElement("canvas");
            canvas.setAttribute("class", "zebcanvas");
            canvas.setAttribute("width",  w <= 0 ? "400" : "" + w);
            canvas.setAttribute("height", h <= 0 ? "400" : "" + h);
            canvas.setAttribute("id", pc);

            // no focus border
            canvas.style["outline"] = "none";

            // disable annoying selection 
            canvas.style["-webkit-user-select"] = "none";
            canvas.style["-ms-user-select"] = "none";
            canvas.style["-moz-user-select"] = "-moz-none";
            canvas.style["user-select"] = "none";
            canvas.style["-khtml-user-select"] = "none";
            document.body.appendChild(canvas);
        }

        if (canvas.getAttribute("tabindex") === null) {
            canvas.setAttribute("tabindex", "0");
        }

        //!!! IE9 handles padding incorrectly 
        canvas.style.padding = "0px";

        //!!!! need for native element layouting
        //canvas.style.overflow = "auto";
        this.$super(new pkg.zCanvas.Layout());

        var density = typeof window.devicePixelRatio !== "undefined" ? window.devicePixelRatio : 1;
        this.da = { x:0, y:0, width:-1, height:0 };
        this.width  = parseInt(canvas.width, 10);
        this.height = parseInt(canvas.height, 10);

        // take in account that canvas can be visualized on Retina screen 
        canvas.style.width  = "" + this.width  + "px";
        canvas.style.height = "" + this.height + "px";
        canvas.width  = this.width  * density;
        canvas.height = this.height * density;

        this.canvas = canvas;
        this.graph  = createContext(canvas.getContext("2d"), this.width, this.height);
    
        // again something for Retina screen
        if (density != 1) {
            // call original method
            this.graph.$scale(density, density);
        }

        this.doubleClickDelta = pkg.doubleClickDelta;
        this.recalcOffset();

        //!!! Event manager EM variable cannot be initialized before zebra.ui initialization
        EM = pkg.events;
        for(var i=0; i < pkg.layers.length; i++) {
            var l = pkg.layers[i];
            this.add(l.$new ? l.$new() : l);
        }

        this.canvas.onmousemove   = function(e) { $this.mouseMoved(e);   };
        this.canvas.onmousedown   = function(e) { $this.mousePressed(e); };
        this.canvas.onmouseup     = function(e) { $this.mouseReleased(e);};
        this.canvas.onmouseover   = function(e) { $this.mouseEntered(e); };
        this.canvas.onmouseout    = function(e) { $this.mouseExited(e);  };
        this.canvas.onkeydown     = function(e) { $this.keyPressed(e);   };
        this.canvas.onkeyup       = function(e) { $this.keyReleased(e);  };
        this.canvas.onkeypress    = function(e) { $this.keyTyped(e);     };
        this.canvas.oncontextmenu = function(e) { e.preventDefault(); };
        this.canvas.onfocus       = function(e) { $this.focusGained(e); };
        this.canvas.onblur        = function(e) { $this.focusLost(e);  };
        if (zebra.isInBrowser) window.onresize = function() { setupMeF(); };

        var addons = pkg.zCanvas.addons;
        if (addons) {
            for (var i=0; i<addons.length; i++) (new (Class.forName(addons[i]))()).setup(this);
        }

        $canvases.push(this);

        this.validate();
        setupMeF(); 
    },

    function setSize(w, h) {
        if (this.canvas.width != w || h != this.canvas.height) {
            this.graph.reset(w, h);
            this.canvas.width  = w;
            this.canvas.height = h;
            this.$super(w, h);
        }
    },

    function kidAdded(i,constr,c){
        if (typeof this[c.id] !== "undefined") {
            throw new Error("Layer '" + c.id + "' already exist");
        } 
        this[c.id] = c;
        this.$super(i, constr, c);
    },

    function kidRemoved(i, c){
        delete this[c.id];
        this.$super(i, c);
    }
]);

zebra.ready(function() {
    if (zebra.isInBrowser) {
        $fmCanvas = document.createElement("canvas").getContext("2d");
        var e = document.getElementById("zebra.fm");
        if (e == null) {
            e = document.createElement("div");
            e.setAttribute("id", "zebra.fm");
            e.setAttribute("style", "visibility:hidden;line-height: 0; height:1px; vertical-align: baseline;");
            e.innerHTML = "<span id='zebra.fm.text'  style='display:inline;vertical-align:baseline;'>&nbsp;</span>" +
                          "<img  id='zebra.fm.image' style='width:1px;height:1px;display:inline;vertical-align:baseline;' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII%3D' width='1' height='1'/>";
            document.body.appendChild(e);
        }
        $fmText    = document.getElementById("zebra.fm.text");
        $fmImage   = document.getElementById("zebra.fm.image");
    }

    try {
        zebra.busy();
        pkg.$objects = new pkg.Bag(pkg);
        pkg.$objects.loadByUrl("canvas.json", pkg);
        var p = zebra()['canvas.json'];
        if (p) pkg.$objects.loadByUrl(p, pkg);
        while($configurators.length > 0) $configurators.shift()(pkg.$objects);
        pkg.$objects.end();

        if (zebra.isInBrowser && pkg.useWebClipboard) {
            // create hidden textarea to support clipboard
            $clipboard = document.createElement("textarea");
            $clipboard.setAttribute("style", "display:none; position: absolute; left: -99em; top:-99em;");

            $clipboard.onkeydown = function(ee) {
                $clipboardCanvas.keyPressed(ee);
                $clipboard.value="1";
                $clipboard.select();
            }
            
            $clipboard.onkeyup = function(ee) {
                //!!!debug  zebra.print("onkeyup : " + ee.keyCode);
                if (ee.keyCode == $clipboardTriggerKey) {
                    $clipboard.style.display = "none";
                    $clipboardCanvas.canvas.focus();
                    $clipboardCanvas.canvas.onblur  = $clipboardCanvas.focusLost;
                    $clipboardCanvas.canvas.onfocus = $clipboardCanvas.focusGained;
                }
                $clipboardCanvas.keyReleased(ee);
            }

            $clipboard.onblur = function() {  
                //!!!debug zebra.print("$clipboard.onblur()");
                this.value="";
                this.style.display="none";

                //!!! pass focus back to canvas
                //    it has to be done for the case when cmd+TAB (switch from browser to 
                //    another application)
                $clipboardCanvas.canvas.focus();
            }

            $clipboard.oncopy = function(ee) {
                //!!!debug zebra.print("::: oncopy");
                if (pkg.focusManager.focusOwner && pkg.focusManager.focusOwner.copy) {
                    var v = pkg.focusManager.focusOwner.copy();
                    $clipboard.value = v == null ? "" : v;
                    $clipboard.select();
                }
            }

            $clipboard.oncut = function(ee) {
                //!!!debug zebra.print("::: oncut")
                if (pkg.focusManager.focusOwner && pkg.focusManager.focusOwner.cut) {
                    $clipboard.value = pkg.focusManager.focusOwner.cut();
                    $clipboard.select();
                }
            }

            if (zebra.isFF) {
                $clipboard.addEventListener ("input", function(ee) {
                    if (pkg.focusManager.focusOwner && pkg.focusManager.focusOwner.paste) {
                        //!!!debug zebra.print("input " + $clipboard.value);
                        pkg.focusManager.focusOwner.paste($clipboard.value);
                    }
                }, false);
            }
            else {
                $clipboard.onpaste = function(ee) {
                    //!!!debug zebra.print("::: onpaste() " + $clipboard.value + "," + ee.clipboardData);
                    if (pkg.focusManager.focusOwner && pkg.focusManager.focusOwner.paste) {
                        var txt = zebra.isIE ? window.clipboardData.getData('Text') 
                                             : ee.clipboardData.getData('text/plain');
                        pkg.focusManager.focusOwner.paste(txt);
                    }
                    $clipboard.value="";
                }
            }
            document.body.appendChild($clipboard);
            
            // canvases location has to be corrected if document layout is invalid 
            function correctOffset(e) {
                var b = (e.type === "DOMNodeRemoved");
                for(var i = $canvases.length - 1; i >= 0; i--) {
                    var canvas = $canvases[i];
                    canvas.recalcOffset();
                    if (b && e.target == canvas.canvas) {
                        $canvases.splice(i, 1);
                    }
                }
            }

            document.addEventListener("DOMNodeInserted", correctOffset, false);
            document.addEventListener("DOMNodeRemoved", correctOffset, false);
            window.addEventListener("resize",correctOffset, false);
        }
    }
    catch(e) {
        ///!!!!! for some reason throwing exception doesn't appear in console.
        //       but it has side effect to the system, what cases other exception
        //       that is not relevant to initial one
        zebra.print(e)
        throw e;
    }
    finally { zebra.ready(); }
});

})(zebra("ui"), zebra.Class, zebra.Interface);



})();
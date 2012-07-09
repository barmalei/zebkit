(function() {

//  Faster operation analogues: 
//  Math.floor(f)  => ~~(a)
//  Math.round(f)  =>  (f + 0.5) | 0
//

function isString(o) { return o != null && (typeof o === "string" || o.constructor === String); }
function isNumber(o) { return o != null && (typeof o === "number" || o.constructor === Number); }

if (!String.prototype.trim) { String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g,'');  } }

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement) {
        if (this == null) throw new TypeError();
        var t = Object(this), len = t.length >>> 0;
        if (len === 0) return -1;

        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n != n) n = 0;
            else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * ~~Math.abs(n);
            }
        }
        if (n >= len) return -1;
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) if (k in t && t[k] === searchElement) return k;
        return -1;
    }
}

if (!Array.isArray) Array.isArray = function(a) { return Object.prototype.toString.call(a) == '[object Array]'; }

var ABSTRACT = 1, FINAL = 2, $$$ = 0, namespaces = {}, namespace = function(nsname, dontCreate) {
    if (isString(nsname) == false) throw new Error("Wrong nsname argument");
    if (namespaces.hasOwnProperty(nsname)) return namespaces[nsname];
    if (dontCreate == true) throw new Error("Namespace '" + nsname + "' doesn't exist");

    function Package() {
        this.url = null;
        if (zebra.isInBrowser) {
            var s = document.getElementsByTagName('script'), ss = s[s.length - 1].getAttribute('src');
            this.url = new zebra.URL(ss.substring(0, ss.lastIndexOf("/") + 1));
        }
    }
    
    if (isString(nsname) == false) throw new Error('invalid namespace id');
    if (namespaces.hasOwnProperty(nsname)) throw new Error("Namespace '" + nsname + "' already exists");
    
    var f = function(name) {
        if (arguments.length == 0) return f.$env;
        
        if (typeof name === 'function') {
            for(var k in f) if (f[k] instanceof Package) name(k, f[k]);
            return null;
        }

        var b = Array.isArray(name);
        if (isString(name) == false && b == false) {
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
            if ((p instanceof Package) == false) throw new Error("Package '" + name +  "' conflicts with variable '" + n + "'");
            target = p;
        }
        return target;
    }
    
    f.Import = function() {
        var ns = ["=", nsname, "."].join(''), code = [], packages = arguments.length == 0 ? null : Array.prototype.slice.call(arguments, 0); 
        f(function(n, p) {
            if (packages == null || packages.indexOf(n) >= 0) {
                for (var k in p) {
                    //!!! 
                    if (k != 'url' && (p[k] instanceof Package) == false && p.hasOwnProperty(k)) { 
                        code.push([k, ns, n, ".", k].join(''));
                    }
                }
                if (packages != null) packages.splice(packages.indexOf(n), 1);
            }
        });
        if (packages != null && packages.length != 0) throw new Error("Unknown package(s): " + packages.join(","));
        return code.length > 0 ? [ "var ", code.join(","), ";"].join('') : null;
    }
    
    f.$env = {};
    namespaces[nsname] = f;
    return f;
}

var FN = (typeof namespace.name === "undefined") ? (function(f) { var mt = f.toString().match(/^function ([^(]+)/); return (mt == null) ? '' : mt[1]; })
                                                 : (function(f) { return f.name; });

zebra = namespace('zebra');
var pkg = zebra;
pkg.namespaces = namespaces;
pkg.namespace = namespace;
pkg.FN = FN;
pkg.$global = this;
pkg.isString = isString;
pkg.isNumber = isNumber;
pkg.version = "1.0.1"

function mnf(name, params) {
    throw new ReferenceError("Method '" + (name=='' ? "constructor":name) + "(" + params + ")" + "' not found");
}

function wamm(name, params, accessor, parent) {
    var m = arguments[0];
    if (arguments.length > 1) {
        m = "Method '" + name + "(" + params + ")" + "' has wrong accessor = '" + accessor + "'";
        if (parent) m = m + " (parent: a=" + (parent.modifier==ABSTRACT) + ", f=" + (parent.modifier==FINAL) + ")";
    }
    throw new TypeError(m);
}

function $toString() { return this._hash_; }
function $equals(o) { return this == o; }

function make_template(pt, tf, p)
{
    tf._hash_ = ["$zebra_", $$$++].join('');
    tf.toString = $toString;
    if (pt != null) tf.prototype.getClazz = function() { return tf; }
    tf.getClazz = function() { return pt; }
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

function ProxyMethod(name) {
    if (isString(name) == false) throw new TypeError('Method name has not been defined');

    var a = function() {
        var nm = a.methods[arguments.length]
        if (nm) {
            var cm = this.$caller;
            this.$caller = nm;
            try { return nm.apply(this, arguments); }
            catch(e) { throw e; }
            finally { this.$caller = cm; }    
        }
        mnf(a.methodName, arguments.length);
    } 
    
    a.$clone$ = function() {
        if (this.methodName == '') return null;
        var m = ProxyMethod(this.methodName);
        for(var k in this.methods) m.methods[k] = this.methods[k];
        return m;
    } 
    
    a.methods = {};
    a.methodName = name;
    return a;
}

pkg.Class = make_template(null, function() {
    if (arguments.length == 0) throw new Error("Class definition has to be passed"); 

    var df = arguments[arguments.length - 1], $parent = null, args = Array.prototype.slice.call(arguments, 0, arguments.length-1);
    if (args.length > 0 && (args[0] == null || args[0].getClazz() == pkg.Class)) $parent = args[0];

    var $template = make_template(pkg.Class, function() {
        this.$super = function() {
            if (!this.$caller) throw new Error("$super is called outside of class context");

            var name = this.$caller.methodName, $s = this.$caller.boundTo.$parent, args = arguments;
            if (arguments.length > 0 && typeof arguments[0] === 'function') {
				name = arguments[0].methodName;
                args = Array.prototype.slice.call(arguments, 1);
            }

            var params = args.length;            
            while($s != null) {
                var m = $s.prototype[name];
                if (m && m.methods[params]) return m.apply(this, args);
                $s = $s.$parent;
            }            
            mnf(name, params);
        }
        
        this.getClazz = function() { return $template; }
        this.$this = function() {  return this.$caller.boundTo.prototype[''].apply(this, arguments);  }
                
        this._hash_ = ["$zObj_", $$$++].join('');
    
        if (arguments.length > 0) {
            var a = arguments[arguments.length - 1];
            if (Array.isArray(a) == true) a = a[0];
            if (typeof a === 'function') {
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
        
        if ($template.modifier == ABSTRACT) throw new Error("Abstract class cannot be instantiated");
        this[''] && this[''].apply(this, arguments);
    }, args);
    
    $template.$parent = $parent;
    if ($parent != null) {
        for (var k in $parent.prototype) {
            var f = $parent.prototype[k];
            if (f.$clone$) { 
                f = f.$clone$();
                if (f == null) continue;
            }
            $template.prototype[k] = f;
        }
    }
    $template.modifier = 0;
    
    $template.prototype.Field = function(f) {
        var n = FN(f), pv = this[n];
        if (pv) { if (this.hasOwnProperty(n) == false) pv = pv.$clone$(); }
        else pv = ProxyMethod(n);

        var old = pv.methods[f.length];
        if (typeof old !== 'undefined' && old.modifier == FINAL) wamm(n, f.length, 0, old);
    
        pv.methods[f.length] = f;
        f.boundTo = this.getClazz();
        this[n] = pv;
    }
    
    $template.getMethods = function()  {  
         var m = [];
         for (var n in this.prototype) {
             var f = this.prototype[n];
             if (typeof f === 'function') {
                if (f.$clone$) {
                    for (var mk in f.methods) m.push(f.methods[mk]);
                }
                else m.push(f);
             }
         }
         return m;
    }
    
    $template.Final    = function(f) { this.Field(f, FINAL); }
    $template.Abstract = function(f) { this.Field(f, ABSTRACT); }

    $template.getMethod = function(name, params) {
        var p = (params ? params : 0), m = this.prototype[name];
        if (typeof m === 'function') {
            if (m.$clone$) m = m.methods[p];
            if (m) return m;
        }
        mnf(name, p);
    }

    $template.Vars = function() { for(var i=0; i<arguments.length; i+=2) this.prototype[arguments[i]] = arguments[i+1]; }
    
    $template.Field = function(f, m) {
        var n = FN(f), sw = null, arity = f.length;

        if (typeof m  === 'undefined') m = 0;
        if (n == '' && m && (m == ABSTRACT || m == FINAL)) throw new Error("Constructor cannot be abstract or final");

        var vv = this.prototype[n];
        if (f.boundTo) throw new Error("Method '" + n + "' is bound to other class");

        if (typeof vv === 'undefined') sw = ProxyMethod(n);
        else {
            if (typeof vv === 'function') {
                if (vv.$clone$) sw = vv;
                else {
                    sw = ProxyMethod(n);
                    if (vv.length != arity) {
                        vv.methodName = n;
                        vv.modifier = m;
                        vv.boundTo = this;
                    }
                    sw.methods[vv.length] = vv;
                }
            }
            else throw new Error("Method '" + n + "' conflicts to property");
        }

        var pv = sw.methods[arity];
        if (typeof pv !== 'undefined') {
            if (m == ABSTRACT || pv.modifier == FINAL) wamm(n, arity, m, pv);
            if (pv.boundTo == this) throw new Error("Duplicated method '" + sw.methodName + "(" + arity +")'");
        }

        if (m == ABSTRACT) { 
            this.modifier = ABSTRACT;
            f = function() { throw new Error("Abstract '" + n + "(" + arity +")" + "' cannot be called"); }; 
        }

        f.modifier   = m;
        f.boundTo    = this;
        f.methodName = n;

        sw.methods[arity] = f;
        this.prototype[n] = sw;
    }

    if (typeof df === 'function') df.call($template, function(f) { $template.Field(f); } );
    else {
        if (Array.isArray(df) == false) throw new Error("Wrong class definition format");
        for(var i=0; i < df.length; i++) $template.Field(df[i]);
    }    

    // validate constructor
    if ($template.$parent && $template.$parent.prototype[''] && !$template.prototype['']) {
        throw new Error("At least one constructor has to be declared");
    }

    // setup abstract modifiers
    if ($template.modifier != ABSTRACT && $parent && $parent.modifier == ABSTRACT) {
        var m = $template.getMethods();
        for(var i = 0; i < m.length; i++) {
            if (m[i].modifier == ABSTRACT) {
                $template.modifier = ABSTRACT;
                break;
            }
        }
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
    if ($cached.hasOwnProperty(name) == false) $cache(name, eval(name));
    return $cached[name];
}

pkg.instanceOf = function(obj, clazz) {
    if (!clazz) throw new Error("instanceOf(): unknown class");
    if (obj == null || typeof obj.getClazz === 'undefined')  return false;
    var c = obj.getClazz();
    return c != null && (c == clazz || (typeof c.parents !== 'undefined' && c.parents.hasOwnProperty(clazz)));
}

pkg.ready = function() {
    if (arguments.length == 0) { 
        if ($busy > 0) $busy--;
    }
    else {
        if (arguments.length == 1 && $busy == 0 && $f.length == 0) {
            arguments[0]();
            return;
        }
    }
            
    for(var i = 0; i < arguments.length; i++) $f.push(arguments[i]);
    while($busy == 0 && $f.length > 0) $f.shift()();
}

pkg.busy = function() { $busy++; }

pkg.Output = Class([
    function print(o) { this.$p(0, o); },
    function error(o) { this.$p(2, o); },
    function warn(o)  { this.$p(1, o); },

    function $p(l, o) { 
        o = this.format(o);
        if (pkg.isInBrowser) {
            if (pkg.isIE) alert(o); 
            else {
                if (l == 0) console.log(o); 
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
        this.el = pkg.isString(element) ? document.getElementById(element) : element;
        if (this.el == null) throw new Error("Unknown HTML output element");
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
pkg.out = new pkg.Output();

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
    }

    pkg.URL.prototype.toString = function() { return this.href; };
    
    pkg.URL.prototype.getParentURL = function() { 
        var i = this.path.lastIndexOf("/");
        if (i <= 0) throw new Error(this.toString() + " has no parent");
        var p = this.path.substring(0, i+1);
        return new pkg.URL([this.protocol, "//", this.host, p].join('')); 
    }

    pkg.URL.isAbsolute = function(u) { return /^[a-zA-Z]+\:\/\//i.test(u);  }

    pkg.URL.prototype.join = function(p) {
        if (pkg.URL.isAbsolute(p)) throw new Error();
        return p[0] == '/' ? [ this.protocol, "//", this.host, p ].join('')
                           : [ this.protocol, "//", this.host, this.path, p ].join('');
    }    
    
    if (window.addEventListener) window.addEventListener('DOMContentLoaded', complete, false);
    else window.attachEvent('onload', complete);
}
else complete();

})();


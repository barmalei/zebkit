/**
 * This is the core module that provides powerful easy OOP concept, packaging and number of utility methods.
 * The module has no any dependency from others zebra modules and can be used independently.  
 * @module zebra
 */

(function() {

//  Faster operation analogues:
//  Math.floor(f)  => (a)
//  Math.round(f)  =>  (f + 0.5) | 0
//
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

if (!String.prototype.trim) { String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g,'');  }; }

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement) {
        if (this == null) {
            throw new TypeError();
        }

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
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) return k;
        }
        return -1;
    };
}

if (!Array.isArray) {
    Array.isArray = function(a) {
        return Object.prototype.toString.call(a) == '[object Array]';
    };
}

var $$$ = 0, namespaces = {}, namespace = function(nsname, dontCreate) {
    if (isString(nsname) === false) {
        throw new Error("Wrong nsname argument");
    }

    if (namespaces.hasOwnProperty(nsname)) {
        return namespaces[nsname];
    }

    if (dontCreate === true) {
        throw new Error("Namespace '" + nsname + "' doesn't exist");
    }

    function Package() {
        this.$url = null;
        if (zebra.isInBrowser) {
            var s  = document.getElementsByTagName('script'),
                ss = s[s.length - 1].getAttribute('src'),
                i  = ss == null ? -1 : ss.lastIndexOf("/");

            this.$url = (i > 0) ? new zebra.URL(ss.substring(0, i + 1))
                                : new zebra.URL(document.location.toString()).getParentURL() ;
        }
    }

    if (isString(nsname) === false) {
        throw new Error('invalid namespace id');
    }

    if (namespaces.hasOwnProperty(nsname)) {
        throw new Error("Namespace '" + nsname + "' already exists");
    }

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
            else {
                if ((p instanceof Package) === false) {
                    throw new Error("Package '" + name +  "' conflicts with variable '" + n + "'");
                }
            }

            target = p;
        }
        return target;
    };

    f.Import = function() {
        var ns = ["=", nsname, "."].join(''), code = [],
            packages = arguments.length === 0 ? null 
                                              : Array.prototype.slice.call(arguments, 0);
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

        if (packages != null && packages.length !== 0) {
            throw new Error("Unknown package(s): " + packages.join(","));
        }

        return code.length > 0 ? [ "var ", code.join(","), ";"].join('') : null;
    };

    f.$env = {};
    namespaces[nsname] = f;
    return f;
};


zebra = namespace('zebra');
var pkg = zebra,
    FN = pkg.$FN = (typeof namespace.name === "undefined") ? (function(f) { var mt = f.toString().match(/^function ([^(]+)/); return (mt == null) ? '' : mt[1]; })
                                                           : (function(f) { return f.name; });

pkg.namespaces = namespaces;
pkg.namespace  = namespace;
pkg.$global    = this;
pkg.isString   = isString;
pkg.isNumber   = isNumber;
pkg.isBoolean  = isBoolean;
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
            if (typeof l === 'undefined') {
                throw new ReferenceError("Unknown parent["+i+"]");
            }

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

/**
 * Interface is a special class that is used to "pitch" a class with a some marker.
 * It is not supposed an interface directly rules which method the class has to implement.
 
        // declare "I" interface
        var I = zebra.Interface();

        // declare "A" class that implements "I" interface
        var A = zebra.Class(I, [ function m() {} ]);
    
        // instantiate "A" class
        var a = new A();
        zebra.instanceOf(a, I);  // true 
        zebra.instanceOf(a, A);  // true 


 * @return {Function} an interface
 * @method Interface
 * @for  zebra.Interface()
 */
pkg.Interface = make_template(null, function() {
    var $Interface = make_template(pkg.Interface, function() {
        if (arguments.length > 0) return new (pkg.Class($Interface, arguments[0]))();
    }, arguments);
    return $Interface;
});

pkg.$Extended = pkg.Interface();

function ProxyMethod(name, f) {
    if (isString(name) === false) {
        throw new TypeError('Method name has not been defined');
    }

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

/**
 * Class declaration method. Zebra easy OOP concept supports:
 
    - **Single class inheritance.** Any class can extend an another zebra class

            // declare class "A" that with one method "a"   
            var A = zebra.Class([
                function a() { ... }
            ]);
        
            // declare class "B" that inherits class "A"
            var B = zebra.Class(A, []);

            // instantiate class "B" and call method "a"
            var b = new B();
            b.a();

    - **Class method overriding.** Override a parent class method implementation

            // declare class "A" that with one method "a"   
            var A = zebra.Class([
                function a() { ... }
            ]);
        
            // declare class "B" that inherits class "A"
            // and overrides method a with an own implementation
            var B = zebra.Class(A, [
                function a() { ... }
            ]);

    - **Class method overloading.** You can declare methods with the same names but 
    different parameter list. The methods are considered as different method

            // declare class "A" that with one method "a"   
            var A = zebra.Class([
                function a() { ... }
            ]);
        
            // declare class "B" that inherits class "A"
            // and overloads method "a" with another number of
            // parameters 
            var B = zebra.Class(A, [
                function a(param1) { ... }
            ]);

            // instantiate class B and call two different 
            // methods "a()" and "a(param1)"
            var b = new B();
            b.a();      // call method defined in "A" class 
            b.a(100);   // call overloaded method defined in "B" class


    - **Constructors.** Constructor is a method with empty name

            // declare class "A" that with one constructor
            var A = zebra.Class([
                function () { this.variable = 100; }
            ]);

            // instantiate "A"
            var a = new A();
            a.variable // variable is 100 

    - **Static methods and variables declaration.** Static fields and methods can be setup by declaring
      special "$clazz" method whose context is set to declared class

            var A = zebra.Class([
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

    - **Access to super class context.** You can call method declared in a parent class 

            // declare "A" class with one class method "a(p1,p2)"
            var A = zebra.Class([
                function a(p1, p2) { ... }  
            ]); 
        
            // declare "B" class that inherits "A" class and overrides "a(p1,p2)" method
            var B = zebra.Class(A, [
                function a(p1, p2) { 
                    // call "a(p1,p2)" method implemented with "A" class
                    this.$super(p1,p2); 
                }  
            ]); 

 *
 *  One of the powerful feature of zebra easy OOP concept is possibility to instantiate 
 *  anonymous classes and interfaces. Anonymous class is an instance of an existing 
 *  class that can override the original class methods with own implementations, implements
 *  own list of interfaces. In other words the class instance customizes class definition
 *  for a particular instance of the class;  

            // declare "A" class
            var A = zebra.Class([
                function a() { return 1; }
            ]);

            // instantiate anonymous class that add an own implementation of "a" method
            var a = new A([
                function a() { return 2; }
            ]);
            a.a() // return 2

 * @param {zebra.Class} [inheritedClass] an optional parent class to be inherited 
 * @param {zebra.Interface} [inheritedClass]* an optional interface to be extended
 * @param {Array} methods list of declared class methods. Can be empty.
 * @return {Function} a class definition
 * @for zebra.Class()
 * @method Class
 */
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

            // anonymous is customized class instance if last arguments is array of functions
            if (Array.isArray(a) === true && typeof a[0] === 'function') {
                a = a[0];
                var args = [ $template ], k = arguments.length - 2;
                for(; k >= 0 && pkg.instanceOf(arguments[k], pkg.Interface); k--) args.push(arguments[k]);
                args.push(arguments[arguments.length - 1]);
                var cl = pkg.Class.apply(null, args), f = function() {};
                cl.$name = $template.$name;
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
                if (n === '') ff.call(this);
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
            while ($s != null) {
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

    /**
     * Get declared by this class methods.
     * @param  {String} [name] a method name. The name can be used as a filter to exclude all methods
     * whose name doesn't match the passed name  
     * @return {Array} an array of declared by the class methods
     * @method  getMethods
     */
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
        if (Array.isArray(df) === false) {
            throw new Error("Wrong class definition format " + df + ", array is expected");
        }

        for(var i=0; i < df.length; i++) {
            var f = df[i], n = FN(f);
            if (n[0] == "$") {
                var ctx = n == "$prototype" ?  $template.prototype
                                            : (n == "$clazz" ? $template : null);
                if (n) {
                    f.call(ctx);
                    continue;
                }
            }

            if (f.boundTo) throw new Error("Method '" + n + "' is already bound to other class");
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
                else {
                    throw new Error("Method '" + n + "' conflicts to property");
                }
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
    if ($template.$parent && $template.$parent.prototype[''] &&
        typeof $template.prototype[''] === "undefined")
    {
        $template.prototype[''] = $template.$parent.prototype[''];
    }

    return $template;
});

var Class = pkg.Class, $cached = {}, $busy = 1, $f = [];

function $cache(name, clazz) {
    if (($cached[name] && $cached[name] != clazz) || pkg.$global[name]) {
        throw Error("Class name conflict: " + name);
    }
    $cached[name] = clazz;
}

/**
 * Get class by the given class name
 * @param  {String} name a class name
 * @return {Function} a class. Throws exception if the class cannot be 
 * resolved by the given class name
 * @method forName
 * @for  zebra.forName()
 */
Class.forName = function(name) {
    if (pkg.$global[name]) return pkg.$global[name];
    //!!!!!! infinite cache !!!!
    if ($cached.hasOwnProperty(name) === false) $cache(name, eval(name));
    var cl = $cached[name];
    if (cl == null) {
        throw new Error("Class " + name + " cannot be found");
    }
    return cl;
};

/**
 * Test if the given object is instance of the specified class or interface. It is preferable 
 * to use this method instead of JavaScript "instanceof" operator whenever you are dealing with 
 * zebra classes and interfaces. 
 * @param  {Object} obj an object to be evaluated 
 * @return {Function} clazz a class or interface 
 * @method instanceOf
 * @for  zebra.instanceOf()
 */
pkg.instanceOf = function(obj, clazz) {
    if (clazz) {
        if (obj == null || typeof obj.getClazz === 'undefined') {
            return false;
        }

        var c = obj.getClazz();
        return c != null && (c === clazz ||
               (typeof c.parents !== 'undefined' && c.parents.hasOwnProperty(clazz)));
    }
    throw new Error("instanceOf(): unknown class");
};

/**
 * The method makes sure all variables, structures, elements are loaded 
 * and ready to be used. The result of the method execution is calling 
 * passed callback functions when the environment is ready. The goal of 
 * the method to provide safe place to run your code safely in proper 
 * place and at proper time.
 
        zebra.ready(function() {
            // run code here safely
            ...
        });

 * @param {Fucntion|Array} [f] a function or array of functions to be called 
 * safely. If there no one callback method has been passed it causes busy
 * flag will be decremented.      
 * @method ready
 * @for  zebra.ready()
 */
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
    while($busy === 0 && $f.length > 0) {
        $f.shift()();
    }
};

pkg.busy = function() { $busy++; };

pkg.Output = Class([
    function $prototype() {
        this.print = function print(o) { this._p(0, o); };
        this.error = function error(o) { this._p(2, o); };
        this.warn  = function warn(o)  { this._p(1, o); };

        this._p = function(l, o) {
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
        };

        this.format = function (o) {
            if (o && o.stack) return [o.toString(), ":",  o.stack.toString()].join("\n");
            if (o === null) return "<null>";
            if (typeof o === "undefined") return "<undefined>";
            if (isString(o) || isNumber(o) || isBoolean(o)) return o;
            var d = [o.toString() + " " + (o.getClazz?o.getClazz().$name:"") , "{"];
            for(var k in o) if (o.hasOwnProperty(k)) d.push("    " + k + " = " + o[k]);
            return d.join('\n') + "\n}";
        };
    }
]);

/**
 * Dummy class that implements nothing but can be useful to instantiate 
 * anonymous classes with some on "the fly" functionality:
 
        // instantiate and use zebra class with method a implemented 
        var ac = new zebra.Dummy([
             function a() {
                ...
             }
        ]);

        // use it
        ac.a();
 * 
 * @class zebra.Dummy
 */
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
            if (element == null) {
                throw new Error("Unknown HTML output element");
            }

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

pkg.isIE      = pkg.isInBrowser && /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent);
pkg.isOpera   = pkg.isInBrowser && !/opera/i.test(navigator.userAgent);
pkg.isChrome  = pkg.isInBrowser && typeof(window.chrome) !== "undefined";
pkg.isSafari  = pkg.isInBrowser && !pkg.isChrome && /Safari/i.test(navigator.userAgent);
pkg.isFF      = pkg.isInBrowser && window.mozInnerScreenX != null;
pkg.isMobile  = pkg.isInBrowser && /Android|webOS|iPhone|iPad|iPod|BlackBerry|windows mobile|windows phone|IEMobile/i.test(navigator.userAgent);
pkg.isTouchable = pkg.isInBrowser && ((pkg.isIE === false && (!!('ontouchstart' in window ) || !!('onmsgesturechange' in window))) ||
                                      (!!window.navigator['msPointerEnabled'] && !!window.navigator["msMaxTouchPoints"] > 0)); // IE10   

pkg.out       = new pkg.Output();
pkg.isMacOS   = pkg.isInBrowser && navigator.platform.toUpperCase().indexOf('MAC') !== -1;

pkg.print = function() { pkg.out.print.apply(pkg.out, arguments); };
pkg.error = function() { pkg.out.error.apply(pkg.out, arguments); };
pkg.warn  = function() { pkg.out.warn.apply(pkg.out, arguments); };

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

    /**
     * URL class
     * @param {String} url an url
     * @constructor
     * @class zebra.URL
     */
    pkg.URL = function(url) {
        var a = document.createElement('a');
        a.href = url;
        var m = purl.exec(a.href);

        if (m == null) {
            m = purl.exec(window.location);
            if (m == null) {
                throw Error("Cannot resolve '" + url + "' url");
            }
            var p = m[3];
            a.href = m[1] + "//" + m[2] +  p.substring(0, p.lastIndexOf("/") + 1) + url;
            m = purl.exec(a.href);
        }

        /**
         * URL path
         * @attribute path
         * @type {String} 
         * @readOnly
         */
        this.path = m[3];
        this.href = a.href;

        /**
         * URL protocol
         * @attribute protocol
         * @type {String} 
         * @readOnly
         */
        this.protocol = m[1];

        /**
         * Host 
         * @attribute host
         * @type {String}
         * @readOnly
         */
        this.host = m[2];
        
        this.path = this.path.replace(/[\/]+/g, "/");
        
        /**
         * Query string
         * @attribute qs
         * @type {String}
         * @readOnly
         */
        this.qs = m[4];
    };

    pkg.URL.prototype.toString = function() {
        return this.href;
    };

    /**
     * Get a parent URL of the URL
     * @return  {zebra.URL} a parent URL 
     * @method getParentURL
     */
    pkg.URL.prototype.getParentURL = function() {
        var i = this.path.lastIndexOf("/");
        if (i < 0) return null;
        var p = this.path.substring(0, i+1);
        return new pkg.URL([this.protocol, "//", this.host, p].join(''));
    };

    pkg.URL.isAbsolute = function(u) {
        return /^[a-zA-Z]+\:\/\//i.test(u);
    };

    /**
     * Join the given relative path to the URL.
     * If the passed path starts from "/" character
     * it will be joined without taking in account 
     * the URL path
     * @param  {String} p a relative path
     * @return {String} an absolute URL
     * @method join
     */
    pkg.URL.prototype.join = function(p) {
        if (pkg.URL.isAbsolute(p)) throw new Error();
        return p[0] == '/' ? [ this.protocol, "//", this.host, p ].join('')
                           : [ this.protocol, "//", this.host, this.path, p ].join('');
    };

    if (window.addEventListener) {
        window.addEventListener('DOMContentLoaded', complete, false);
    }
    else {
        window.attachEvent('onload', complete);
    }
}
else {
    complete();
}

/**
 * @for
 */


})();



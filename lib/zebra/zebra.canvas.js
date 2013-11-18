(function() {

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

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g,'');
    };
}

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
        throw new Error('Invalid namespace id');
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
    FN = pkg.$FN = (typeof namespace.name === "undefined") ? (function(f) {
                                                                var mt = f.toString().match(/^function ([^(]+)/);
                                                                return (mt == null) ? '' : mt[1];
                                                             })
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
    throw new ReferenceError("Method '" + cln + (name === '' ? "constructor"
                                                             : name) + "(" + params + ")" + "' not found");
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
                throw new ReferenceError("Undefined parent class or interface ["+i+"]");
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
    if (arguments.length === 0) {
        throw new Error("No class definition was found");
    }

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

                // skip constructors
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
                if (n === '') {
                    ff.call(this);
                    continue;
                }
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

                    //!!! clone function if it has been already bounded to a class
                    if (ff.boundTo != null) {
                        eval("ff=" + ff.toString());
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
                throw new Error("Invalid argument: " + arguments[i]);
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
                if (n == "$prototype") {
                    var protoFields = {};
                    f.call(protoFields);
                    for(var k in protoFields) {
                        if (protoFields.hasOwnProperty(k)) {
                            var protoFieldVal = protoFields[k];
                            $template.prototype[k] = protoFields[k];
                            if (protoFieldVal && typeof protoFieldVal === "function") {
                                protoFieldVal.methodName = k;
                                protoFieldVal.boundTo = $template;
                            }
                        }
                    }
                    continue;
                }
                else {
                    if (n == "$clazz") {
                        f.call($template);
                        continue;
                    }
                }
            }

            if (f.boundTo) {
                throw new Error("Method '" + n + "' is already bound to other class");
            }

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
                        if (vv.length != arity && vv.boundTo == null) {
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

            f.boundTo         = this;
            f.methodName      = n;
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
        if (pkg.URL.isAbsolute(p)) {
            throw new Error("Absolute URL '" + p + "' cannot be joined");
        }

        return p[0] == '/' ? [ this.protocol, "//", this.host, p ].join('')
                           : [ this.protocol, "//", this.host, this.path, p ].join('');
    };

    var $interval = setInterval(function () {
        if (document.readyState == "complete") {
            clearInterval($interval);
            complete();
        }
    }, 100);
}
else {
    complete();
}

/**
 * @for
 */

})();


/**
 * The module provides number of classes to help to communicate 
 * with remote services and servers by HTTP, JSON-RPC, XML-RPC
 * protocols
 * @module io
 * @requires zebra, util
 */

(function(pkg, Class) {

var HEX = "0123456789ABCDEF";

/**
 * Generate UUID of the given length
 * @param {Ineteger} [size] the generated UUID length. The default size is 16 characters.
 * @return {String} an UUID
 * @method  ID
 * @for  zebra.io.ID()
 */
pkg.ID = function UUID(size) {
    if (typeof size === 'undefined') size = 16;
    var id = [];
    for (var i=0; i<36; i++)  id[i] = HEX[~~(Math.random() * 16)];
    return id.join('');
};

pkg.sleep = function() {
    var r = new XMLHttpRequest(), t = (new Date()).getTime().toString(), i = window.location.toString().lastIndexOf("?");
    r.open('GET', window.location + (i > 0 ? "&" : "?") + t, false);
    r.send(null);
};

// !!!
// b64 is supposed to be used with binary stuff, applying it to utf-8 encoded data can bring to error
// !!!
var b64str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

/**
 * Encode the given string into base64
 * @param  {String} input a string to be encoded
 * @method  b64encode
 * @for  zebra.io.b64encode()
 */
pkg.b64encode = function(input) {
    var out = [], i = 0, len = input.length, c1, c2, c3;
    if (typeof ArrayBuffer !== "undefined") {
        if (input instanceof ArrayBuffer) input = new Uint8Array(input);
        input.charCodeAt = function(i) { return this[i]; };
    }
    if (Array.isArray(input)) input.charCodeAt = function(i) { return this[i]; };

    while(i < len) {
        c1 = input.charCodeAt(i++) & 0xff;
        out.push(b64str.charAt(c1 >> 2));
        if (i == len) {
            out.push(b64str.charAt((c1 & 0x3) << 4), "==");
            break;
        }
        c2 = input.charCodeAt(i++);
        out.push(b64str.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)));
        if (i == len) {
            out.push(b64str.charAt((c2 & 0xF) << 2), "=");
            break;
        }
        c3 = input.charCodeAt(i++);
        out.push(b64str.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6)), b64str.charAt(c3 & 0x3F));
    }
    return out.join('');
};

/**
 * Decode the base64 encoded string
 * @param {String} input base64 encoded string
 * @return {String} a string
 * @for zebra.io.b64decode()
 * @method b64decode
 */
pkg.b64decode = function(input) {
    var output = [], chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while ((input.length % 4) !== 0) input += "=";

    for(var i=0; i < input.length;) {
        enc1 = b64str.indexOf(input.charAt(i++));
        enc2 = b64str.indexOf(input.charAt(i++));
        enc3 = b64str.indexOf(input.charAt(i++));
        enc4 = b64str.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output.push(String.fromCharCode(chr1));
        if (enc3 != 64) output.push(String.fromCharCode(chr2));
        if (enc4 != 64) output.push(String.fromCharCode(chr3));
    }
    return output.join('');
};

pkg.dateToISO8601 = function(d) {
    function pad(n) { return n < 10 ? '0'+n : n; }
    return [ d.getUTCFullYear(), '-', pad(d.getUTCMonth()+1), '-', pad(d.getUTCDate()), 'T', pad(d.getUTCHours()), ':',
             pad(d.getUTCMinutes()), ':', pad(d.getUTCSeconds()), 'Z'].join('');
};

// http://webcloud.se/log/JavaScript-and-ISO-8601/
pkg.ISO8601toDate = function(v) {
    var regexp = ["([0-9]{4})(-([0-9]{2})(-([0-9]{2})", "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?",
                  "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?"].join(''), d = v.match(new RegExp(regexp)),
                  offset = 0, date = new Date(d[1], 0, 1);

    if (d[3])  date.setMonth(d[3] - 1);
    if (d[5])  date.setDate(d[5]);
    if (d[7])  date.setHours(d[7]);
    if (d[8])  date.setMinutes(d[8]);
    if (d[10]) date.setSeconds(d[10]);
    if (d[12]) date.setMilliseconds(Number("0." + d[12]) * 1000);
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    date.setTime(Number(date) + (offset * 60 * 1000));
    return date;
};

pkg.parseXML = function(s) {
    function rmws(node) {
        if (node.childNodes !== null) {
            for (var i = node.childNodes.length; i-->0;) {
                var child= node.childNodes[i];
                if (child.nodeType === 3 && child.data.match(/^\s*$/)) node.removeChild(child);
                if (child.nodeType === 1) rmws(child);
            }
        }
        return node;
    }

    if (typeof DOMParser !== "undefined") return rmws((new DOMParser()).parseFromString(s, "text/xml"));
    else {
        for (var n in { "Microsoft.XMLDOM":0, "MSXML2.DOMDocument":1, "MSXML.DOMDocument":2 }) {
            var p = null;
            try {
                p = new ActiveXObject(n);
                p.async = false;
            }  catch (e) { continue; }
            if (p === null) throw new Error("XML parser is not available");
            p.loadXML(s);
            return p;
        }
    }
    throw new Error("No XML parser is available");
};

/**
 * Query string parser class. The class provides number of 
 * useful static methods to manipulate with a query string 
 * of an URL 
 * @class zebra.io.QS
 * @static
 */
pkg.QS = Class([
    function $clazz() {
        /**
         * Append the given parameters to a query string of the specified URL 
         * @param  {String} url an URL
         * @param  {Object} obj a dictionary of parameters to be appended to 
         * the URL query string 
         * @return {String} a new URL
         * @static
         * @method append
         */
        this.append = function (url, obj) {
            return url + ((obj === null) ? '' : ((url.indexOf("?") > 0) ? '&' : '?') + pkg.QS.toQS(obj, true));
        };

        /**
         * Fetch and parse query string of the given URL
         * @param  {String} url an URL
         * @return {Object} a parsed query string as a dictionary of parameters
         * @method parse
         * @static
         */
        this.parse = function(url) {
            var m = window.location.search.match(/[?&][a-zA-Z0-9_.]+=[^?&=]+/g), r = {};
            for(var i=0; m && i < m.length; i++) {
                var l = m[i].split('=');
                r[l[0].substring(1)] = decodeURIComponent(l[1]);
            }
            return r;
        };

        /**
         * Convert the given dictionary of parameters to a query string.
         * @param  {Object} obj a dictionary of parameters
         * @param  {Boolean} encode say if the parameters values have to be 
         * encoded 
         * @return {String} a query string built from parameters list
         * @static
         * @method toQS
         */
        this.toQS = function(obj, encode) {
            if (typeof encode === "undefined") encode = true;
            if (zebra.isString(obj) || zebra.isBoolean(obj) || zebra.isNumber(obj)) return "" + obj;
            var p = [];
            for(var k in obj) {
                if (obj.hasOwnProperty(k)) p.push(k + '=' + (encode ? encodeURIComponent(obj[k].toString()) : obj[k].toString()));
            }
            return p.join("&");
        };
    }
]);

function $Request() {
    this.responseText = this.statusText = "";
    this.onreadystatechange = this.responseXml = null;
    this.readyState = this.status = 0;
}

$Request.prototype.open = function(method, url, async, user, password) {
    if (location.protocol.toLowerCase() == "file:" ||
        (new zebra.URL(url)).host.toLowerCase() == location.host.toLowerCase())
    {
        this._request = new XMLHttpRequest();
        this._xdomain = false;

        var $this = this;
        this._request.onreadystatechange = function() {
            $this.readyState = $this._request.readyState;
            if ($this._request.readyState == 4) {
                $this.responseText = $this._request.responseText;
                $this.responseXml  = $this._request.responseXml;
                $this.status     = $this._request.status;
                $this.statusText = $this._request.statusText;
            }
            
            if ($this.onreadystatechange) {
                $this.onreadystatechange();
            }
        };

        return this._request.open(method, url, (async !== false), user, password);
    }
    else {
        this._xdomain = true;
        this._async = (async === true);
        this._request = new XDomainRequest();
        return this._request.open(method, url);
    }
};

$Request.prototype.send = function(data) {
    if (this._xdomain) {
        var originalReq = this._request, $this = this;

        //!!!! handler has to be defined after 
        //!!!! open method has been called and all 
        //!!!! four handlers have to be defined 
        originalReq.ontimeout = originalReq.onprogress = function () {};

        originalReq.onerror = function() {
            $this.readyState = 4;
            $this.status = 404;
            if ($this._async && $this.onreadystatechange) {
                $this.onreadystatechange();
            }
        };

        originalReq.onload  = function() {
            $this.readyState = 4;
            $this.status = 200;

            if ($this._async && $this.onreadystatechange) {
                $this.onreadystatechange(originalReq.responseText, originalReq);
            }
        };

        //!!! set time out zero to prevent data lost 
        originalReq.timeout = 0;

        if (this._async === false) {
            originalReq.send(data);

            while (this.status === 0) {
                pkg.sleep();
            }

            this.readyState = 4;
            this.responseText = originalReq.responseText;
            return;
        }

        //!!! make short timeout to make sure bloody IE is ready 
        setTimeout(function () {
           originalReq.send(data);
        }, 10);
    }
    else  {
        return this._request.send(data);
    }
};

$Request.prototype.abort = function(data) {
    return this._request.abort();
};

$Request.prototype.setRequestHeader = function(name, value) {
    if (this._xdomain) {
        if (name == "Content-Type") {
            //!!! 
            // IE8 and IE9 anyway don't take in account the assignment
            // IE8 throws exception every time a value is assigned to
            // the property
            // !!!  
            //this._request.contentType = value;
            return;
        }
        else {
            throw new Error("Method 'setRequestHeader' is not supported for " + name);
        }
    }
    else {
        this._request.setRequestHeader(name, value);
    }
};

$Request.prototype.getResponseHeader = function(name) {
    if (this._xdomain) {
        throw new Error("Method is not supported");
    }
    return this._request.getResponseHeader(name);
};

$Request.prototype.getAllResponseHeaders = function() {
    if (this._xdomain) {
        throw new Error("Method is not supported");
    }
    return this._request.getAllResponseHeaders();
};

pkg.getRequest = function() {
    if (typeof XMLHttpRequest !== "undefined") {
        var r = new XMLHttpRequest();

        if (zebra.isFF) {
            r.__send = r.send;
            r.send = function(data) {
                // !!! FF can throw NS_ERROR_FAILURE exception instead of 
                // !!! returning 404 File Not Found HTTP error code
                // !!! No request status, statusText are defined in this case
                try { return this.__send(data); }
                catch(e) {
                    if (!e.message || e.message.toUpperCase().indexOf("NS_ERROR_FAILURE") < 0) {
                        // exception has to be re-instantiate to be Error class instance
                        var ee = new Error(e.toString());
                        throw ee;
                    }
                }
            };
        }

        // CORS is supported out of box
        if ("withCredentials" in r) {
            return r;
        }

        if (zebra.isIE) {
            return new $Request();
        }
    }

    throw new Error("Archaic browser detected");
};

/**
 * HTTP request class. This class provides API to generate different 
 * (GET, POST, etc) HTTP requests in sync and async modes
 * @class zebra.io.HTTP
 * @constructor
 * @param {String} url an URL to a HTTP resource
 */
pkg.HTTP = Class([
    function(url) {
        this.url = url;
        this.header = {};
    },

    /**
     * Perform HTTP GET request .
     * @return {String} a result of the HTTP GET request
     * @method GET  
     */
    function GET() {
        return this.GET(null, null);
    },

    /**
     * Perform HTTP GET request asynchronously.
     * @param {Function} f a callback function that is called when the HTTP GET 
     * request is done. The method gets a request as the only argument 
     * and is called in a context of HTTP class instance.
        
        zebra.io.HTTP("google.com").GET(function(request) {
            // handle HTTP GET response
            if (request.status == 200) {
                request.responseText
            }
            else {
                // handle error
                ...
            }
            ...
        });

     * @method GET  
     */
    function GET(f) {
        return (typeof f === 'function') ? this.GET(null, f) : this.GET(f, null);
    },
    
    /**
     * Perform HTTP GET request synchronously or asynchronously with the given 
     * query parameters.
     * @param {Object} d a dictionary of query parameters 
     * @param {Function} [f] a callback function that is called when the HTTP GET 
     * request is done. The method gets a request object as its only argument 
     * and is called in context of the HTTP class instance.
    
        // synchronous HTTP GET request with the number of
        // query parameters
        var result = zebra.io.HTTP("google.com").GET({
            param1: "var1",
            param3: "var2",
            param3: "var3"
        });

     * @method GET  
     */
    function GET(d, f) {
        return this.SEND("GET", pkg.QS.append(this.url, d), null, f);
    },


    /**
     * Perform synchronously HTTP POST request. No any data is sent with the POST request.
     * @return {String} a result of HTTP POST request
     * @method POST
     */
    function POST(){
        return this.POST(null, null);
    },
    
    /**
     * Perform HTTP POST request asynchronously with no parameters or synchronously 
     * with the given parameters list.
     * @param {Function|Object} d a callback function that is called when HTTP POST 
     * request is done. The method gets a request as its only argument 
     * and is called in context of HTTP class instance:
        
        // asynchronously send POST
        zebra.io.HTTP("google.com").POST(function(request) {
            // handle HTTP GET response
            if (request.status == 200) {
                request.responseText
            }
            else {
                // handle error
                ...
            }
        });

     * Or you can pass a number of parameters to be sent synchronously by 
     * HTTP POST request: 

        // send parameters synchronously by HTTP POST request
        zebra.io.HTTP("google.com").POST({
            param1: "val1",
            param2: "val3",
            param3: "val3" 
        });

     * @method POST
     */
    function POST(d) {
        return (typeof d === "function") ? this.POST(null, d)
                                         : this.POST(pkg.QS.toQS(d, false), null);
    },

    /**
     * Perform HTTP POST request synchronously or asynchronously with the given 
     * data to be sent.
     * @param {String} d a data to be sent by HTTP POST request
     * @param {Function} [f] a callback function that is called when HTTP POST 
     * request is done. The method gets a request as its only  argument 
     * and called in context of appropriate HTTP class instance. If the argument
     * is null the POST request will be done synchronously.
     * @method POST
     */
    function POST(d, f) {
        return this.SEND("POST", this.url, d, f);
    },

    /**
     * Universal HTTP request method that can be used to generate 
     * a HTTP request with any HTTP method to the given URL with 
     * the given data to be sent asynchronously or synchronously
     * @param {String}   method   an HTTP method (GET,POST,DELETE,PUT, etc)
     * @param {String}   url      an URL
     * @param {String}   data     a data to be sent to the given URL
     * @param {Function} [callback] a callback method to be defined 
     * if the HTTP request has to be sent asynchronously. 
     * @method SEND
     */
    function SEND(method, url, data, callback) {
        //!!! IE9 returns 404 if XDomainRequest is used for the same domain but for different paths.
        //!!! Using standard XMLHttpRequest has to be forced in this case
        var r = pkg.getRequest(), $this = this;

        if (callback !== null) {
            r.onreadystatechange = function() {
                if (r.readyState == 4) {
                    callback.call($this, r);
                }
            };
        }

        r.open(method, url, callback != null);
        for(var k in this.header) {
            r.setRequestHeader(k, this.header[k]);
        }


        try {
            r.send(data);
        }
        catch(e) {
            // exception has to be redefined since the type of exception 
            // can be browser dependent
            if (callback == null) {
                var ee = new Error(e.toString());
                ee.request = r;
                throw ee;
            }
            else {
                r.status = 500;
                r.statusText = e.toString();
                callback.call(this, r);
            }
        }

        if (callback == null) {
            if (r.status != 200) {
                var e = new Error("HTTP error " + r.status + " response = '" + r.statusText + "' url = " + url);
                e.request = r;
                throw e;
            }
            return r.responseText;
        }
    }
]);

/**
 * Shortcut method to perform asynchronous or synchronous HTTP GET requests.
 
        // synchronous HTTP GET call
        var res = zebra.io.GET("http://test.com");

        // asynchronous HTTP GET call
        zebra.io.GET("http://test.com", function(request) {
            // handle result
            if (request.status == 200) {
                request.responseText
            }
            else {
                // handle error
            }
            ...
        });

        // synchronous HTTP GET call with query parameters
        var res = zebra.io.GET("http://test.com", {
            param1 : "var1",
            param1 : "var2",
            param1 : "var3"
        });

 * @param {String} url an URL
 * @param {Object} [parameters] a dictionary of query parameters 
 * @param {Funcion} [callback] a callback function that is called 
 * when the GET request is completed. Pass it  to perform request
 * asynchronously 
 * @for  zebra.io.GET()
 * @method GET
 */
pkg.GET = function(url) {
    if (zebra.isString(url)) {
        var http = new pkg.HTTP(url);
        return http.GET.apply(http, Array.prototype.slice.call(arguments, 1));
    }
    else {
        var http = new pkg.HTTP(url.url);
        if (url.header) {
            http.header = url.header;
        }
        var args = [];
        if (url.parameters) args.push(url.parameters);
        if (url.calback) args.push(url.calback);
        return http.GET.apply(http, args);
    }
};

/**
 * Shortcut method to perform asynchronous or synchronous HTTP POST requests.
 
        // synchronous HTTP POST call
        var res = zebra.io.POST("http://test.com");

        // asynchronous HTTP POST call
        zebra.io.POST("http://test.com", function(request) {
            // handle result
            if (request.status == 200) {
            
            }
            else {
                // handle error
                ...
            }
            ...
        });

        // synchronous HTTP POST call with query parameters
        var res = zebra.io.POST("http://test.com", {
            param1 : "var1",
            param1 : "var2",
            param1 : "var3"
        });

        // synchronous HTTP POST call with data
        var res = zebra.io.POST("http://test.com", "data");

        // asynchronous HTTP POST call with data
        zebra.io.POST("http://test.com", "request", function(request) {
            // handle result
            if (request.status == 200) {
    
            }
            else {
                // handle error
                ...
            }
        });

 * @param {String} url an URL
 * @param {Object} [parameters] a dictionary of query parameters 
 * @param {Funcion} [callback] a callback function that is called 
 * when the GET request is completed. Pass it if to perform request
 * asynchronously 
 * @method  POST
 * @for  zebra.io.POST()
 */
pkg.POST = function(url) {
    var http = new pkg.HTTP(url);
    return http.POST.apply(http, Array.prototype.slice.call(arguments, 1));
};

var isBA = typeof(ArrayBuffer) !== 'undefined';
pkg.InputStream = Class([
    function(container) {
        if (isBA && container instanceof ArrayBuffer) this.data = new Uint8Array(container);
        else {
            if (zebra.isString(container)) {
                this.extend([
                    function read() {
                        return this.available() > 0 ? this.data.charCodeAt(this.pos++) & 0xFF : -1;
                    }
                ]);
            }
            else {
                if (Array.isArray(container) === false) {
                    throw new Error("Wrong type: " + typeof(container));
                }
            }
            this.data = container;
        }
        this.marked = -1;
        this.pos    = 0;
    },

    function mark() {
        if (this.available() <= 0) throw new Error();
        this.marked = this.pos;
    },

    function reset() {
        if (this.available() <= 0 || this.marked < 0) throw new Error();
        this.pos    = this.marked;
        this.marked = -1;
    },

    function close()   { this.pos = this.data.length; },
    function read()    { return this.available() > 0 ? this.data[this.pos++] : -1; },
    function read(buf) { return this.read(buf, 0, buf.length); },

    function read(buf, off, len) {
        for(var i = 0; i < len; i++) {
            var b = this.read();
            if (b < 0) return i === 0 ? -1 : i;
            buf[off + i] = b;
        }
        return len;
    },

    function readChar() {
        var c = this.read();
        if (c < 0) return -1;
        if (c < 128) return String.fromCharCode(c);

        var c2 = this.read();
        if (c2 < 0) throw new Error();

        if (c > 191 && c < 224) return String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        else {
            var c3 = this.read();
            if (c3 < 0) throw new Error();
            return String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        }
    },

    function readLine() {
        if (this.available() > 0)
        {
            var line = [], b;
            while ((b = this.readChar()) != -1 && b != "\n") line.push(b);
            var r = line.join('');
            line.length = 0;
            return r;
        }
        return null;
    },

    function available() { return this.data === null ? -1 : this.data.length - this.pos; },
    function toBase64() { return pkg.b64encode(this.data); }
]);

pkg.URLInputStream = Class(pkg.InputStream, [
    function(url) {
        this.$this(url, null);
    },

    function(url, f) {
        var r = pkg.getRequest(), $this = this;
        r.open("GET", url, f !== null);
        if (f === null || isBA === false) {
            if (!r.overrideMimeType) throw new Error("Binary mode is not supported");
            r.overrideMimeType("text/plain; charset=x-user-defined");
        }

        if (f !== null)  {
            if (isBA) r.responseType = "arraybuffer";
            r.onreadystatechange = function() {
                if (r.readyState == 4) {
                    if (r.status != 200)  throw new Error(url);
                    $this.getClazz().$parent.getMethod('', 1).call($this, isBA ? r.response : r.responseText); // $this.$super(res);
                    f($this.data, r);
                }
            };
            r.send(null);
        }
        else {
            r.send(null);
            if (r.status != 200) throw new Error(url);
            this.$super(r.responseText);
        }
    },

    function close() {
        this.$super();
        if (this.data) {
            this.data.length = 0;
            this.data = null;
        }
    }
]);

/**
 * A remote service connector class. It is supposed the class has to be extended with 
 * different protocols like RPC, JSON etc. The typical pattern of connecting to 
 * a remote service is shown below:
 
        // create service connector that has two methods "a()" and "b(param1)"
        var service = new zebra.io.Service("http://myservice.com", [
            "a", "b"
        ]);

        // call the methods of the remote service
        service.a();
        service.b(10);

 * Also the methods of a remote service can be called asynchronously. In this case
 * a callback method has to be passed as the last argument of called remote methods:

        // create service connector that has two methods "a()" and "b(param1)"
        var service = new zebra.io.Service("http://myservice.com", [
            "a", "b"
        ]);

        // call "b" method from the remote service asynchronously
        service.b(10, function(res) {
            // handle a result of the remote method execution here
            ...
        });
 *
 * Ideally any specific remote service extension of "zebra.io.Service"
 * class has to implement two methods:
 
    - **encode** to say how the given remote method with passed parameters have
    to be transformed into a concrete service side protocol (JSON, XML, etc)
    - **decode** to say how the specific service response has to be converted into 
    JavaScript object 

 * @class  zebra.io.Service 
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

/**
 * The class is implementation of JSON-RPC remote service connector.
 
        // create JSON-RPC connector to a remote service that 
        // has three remote methods
        var service = new zebra.io.JRPC("json-rpc.com", [
            "method1", "method2", "method3"
        ]);

        // synchronously call remote method "method1" 
        service.method1();
        
        // asynchronously call remote method "method1" 
        service.method1(function(res) {
            ...
        });

 * @class zebra.io.JRPC
 * @constructor
 * @param {String} url an URL of remote service
 * @param {Array} methods a list of methods names the remote service provides  
 * @extends {zebra.io.Service}
 */
pkg.JRPC = Class(pkg.Service, [
    function(url, methods) {
        this.$super(url, methods);
        this.version = "2.0";
        this.contentType = "application/json";
    },

    function encode(name, args) {
        return JSON.stringify({ jsonrpc: this.version, method: name, params: args, id: pkg.ID() });
    },

    function decode(r) {
        if (r === null || r.length === 0) {
            throw new Error("Empty JSON result string");
        }

        r = JSON.parse(r);
        if (typeof(r.error) !== "undefined") {
            throw new Error(r.error.message);
        }
        
        if (typeof r.result === "undefined" || typeof r.id === "undefined") {
            throw new Error("Wrong JSON response format");
        }
        return r.result;
    }
]);

pkg.Base64 = function(s) { if (arguments.length > 0) this.encoded = pkg.b64encode(s); };
pkg.Base64.prototype.toString = function() { return this.encoded; };
pkg.Base64.prototype.decode   = function() { return pkg.b64decode(this.encoded); };

/**
 * The class is implementation of XML-RPC remote service connector.

        // create XML-RPC connector to a remote service that 
        // has three remote methods
        var service = new zebra.io.XRPC("xmlrpc.com", [
            "method1", "method2", "method3"
        ]);

        // synchronously call remote method "method1" 
        service.method1();

        // asynchronously call remote method "method1" 
        service.method1(function(res) {
            ...
        });

 * @class zebra.io.XRPC
 * @constructor
 * @extends {zebra.io.Service}
 * @param {String} url an URL of remote service
 * @param {Array} methods a list of methods names the remote service provides  
 */
pkg.XRPC = Class(pkg.Service, [
    function(url, methods) {
        this.$super(url, methods);
        this.contentType = "text/xml";
    },

    function encode(name, args) {
        var p = ["<?xml version=\"1.0\"?>\n<methodCall><methodName>", name, "</methodName><params>"];
        for(var i=0; i < args.length;i++) {
            p.push("<param>");
            this.encodeValue(args[i], p);
            p.push("</param>");
        }
        p.push("</params></methodCall>");
        return p.join('');
    },

    function encodeValue(v, p)  {
        if (v === null) { 
            throw new Error("Null is not allowed");
        }

        if (zebra.isString(v)) {
            v = v.replace("<", "&lt;");
            v = v.replace("&", "&amp;");
            p.push("<string>", v, "</string>");
        }
        else {
            if (zebra.isNumber(v)) {
                if (Math.round(v) == v) p.push("<i4>", v.toString(), "</i4>");
                else                    p.push("<double>", v.toString(), "</double>");
            }
            else {
                if (zebra.isBoolean(v)) p.push("<boolean>", v?"1":"0", "</boolean>");
                else {
                    if (v instanceof Date)  p.push("<dateTime.iso8601>", pkg.dateToISO8601(v), "</dateTime.iso8601>");
                    else {
                        if (Array.isArray(v))  {
                            p.push("<array><data>");
                            for(var i=0;i<v.length;i++) {
                                p.push("<value>");
                                this.encodeValue(v[i], p);
                                p.push("</value>");
                            }
                            p.push("</data></array>");
                        }
                        else {
                            if (v instanceof pkg.Base64) p.push("<base64>", v.toString(), "</base64>");
                            else {
                                p.push("<struct>");
                                for(var k in v) {
                                    if (v.hasOwnProperty(k)) {
                                        p.push("<member><name>", k, "</name><value>");
                                        this.encodeValue(v[k], p);
                                        p.push("</value></member>");
                                    }
                                }
                                p.push("</struct>");
                            }
                        }
                    }
                }
            }
        }
    },

    function decodeValue(node) {
        var tag = node.tagName.toLowerCase();
        if (tag == "struct")
        {
             var p = {};
             for(var i=0; i < node.childNodes.length; i++) {
                var member = node.childNodes[i],  // <member>
                    key    = member.childNodes[0].childNodes[0].nodeValue.trim(); // <name>/text()
                p[key] = this.decodeValue(member.childNodes[1].childNodes[0]);   // <value>/<xxx>
            }
            return p;
        }
        if (tag == "array") {
            var a = [];
            node = node.childNodes[0]; // <data>
            for(var i=0; i < node.childNodes.length; i++) {
                a[i] = this.decodeValue(node.childNodes[i].childNodes[0]); // <value>
            }
            return a;
        }

        var v = node.childNodes[0].nodeValue.trim();
        switch (tag) {
            case "datetime.iso8601": return pkg.ISO8601toDate(v);
            case "boolean": return v == "1";
            case "int":
            case "i4":     return parseInt(v, 10);
            case "double": return Number(v);
            case "base64":
                var b64 = new pkg.Base64();
                b64.encoded = v;
                return b64;
            case "string": return v;
        }
        throw new Error("Unknown tag " + tag);
    },

    function decode(r) {
        var p = pkg.parseXML(r), c = p.getElementsByTagName("fault");
        if (c.length > 0) {
            var err = this.decodeValue(c[0].getElementsByTagName("struct")[0]);
            throw new Error(err.faultString);
        }
        c = p.getElementsByTagName("methodResponse")[0];
        c = c.childNodes[0].childNodes[0]; // <params>/<param>
        if (c.tagName.toLowerCase() === "param") {
            return this.decodeValue(c.childNodes[0].childNodes[0]); // <value>/<xxx>
        }
        throw new Error("incorrect XML-RPC response");
    }
]);

/**
 * Shortcut to call the specified method of a XML-RPC service.
 * @param  {String} url an URL
 * @param  {String} method a method name
 * @for zebra.io.XRPC.invoke()
 * @method invoke
 */
pkg.XRPC.invoke = function(url, method) {
    return pkg.Service.invoke(pkg.XRPC, url, method);
};

/**
 * Shortcut to call the specified method of a JSON-RPC service.
 * @param  {String} url an URL
 * @param  {String} method a method name
 * @for zebra.io.JRPC.invoke()
 * @method invoke
 */
pkg.JRPC.invoke = function(url, method) {
    return pkg.Service.invoke(pkg.JRPC, url, method);
};

/**
 * @for
 */


})(zebra("io"), zebra.Class);


/**
 * Number of different utilities methods and classes
 * @module util
 * @requires zebra
 */

(function(pkg, Class, Interface) {
/**
 * Instantiate a new class instance by the given class name with the specified constructor 
 * arguments.
 * @param  {String} clazz a class name
 * @param  {Array} [args] an arguments list
 * @return {Object}  a new instance of the given class initialized with the specified arguments
 * @for  zebra.util.newInstance()
 * @method newInstance
 */
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


function hex(v) {
    return (v < 16) ? ["0", v.toString(16)].join('') :  v.toString(16);
}

/**
 * Find by xpath-like path an element in a tree-like structure. The method is flexible way to look up 
 * elements in tree structures. The only requirements the passed tree-like structure has to follow is
 * declaring a "kids" array field if the element has a children element. To understand if the given tree 
 * element matches the current path fragment a special equality function has to be passed.
 
        var treeLikeRoot = { 
            value : "Root", 
            kids : [
                { value: "Item 1" },
                { value: "Item 2" }
            ]
        };

        zebra.util.findInTree(treeLikeRoot, 
                              "/Root/item1", 
                              function(item, fragment) {
                                  return item.value == fragment;
                              },
                              function(foundElement) {
                                 ...
                                 // true means stop lookaup
                                 return true;   
                              });


 * @param  {Object} root a tree root element. If the element has a children element it has to 
 * declare "kids" field. This field is an array of all children elements
 * @param  {String}   path a xpath-like path. The path has to satisfy number of requirements 
 * and rules:
 
    - "/"" means lookup among all direct children elements 
    - "//"" means lookup among all children elements recursively
    - "*" means any path value 
    -[@attr=100] means number attribute
    -[@attr=true] means boolean attribute
    -[@attr='value'] means string attribute
    - Path has always starts from "/" or "//"
    - Path element always has to be defined: "*" or an symbolic name

 *
 * Path examples:
 
    - "//*" traverse all tree elements
    - "//*[@a=10]" traverse all tree elements that has an attribute "a" that equals 10
    - "/Root/Item" find an element by exact path 

 * @param  {Function}  eq  an equality function. The function gets current evaluated tree element  
 * and a path fragment against which the tree element has to be evaluated. It is expected the method 
 * returns boolean value to say if the given passed tree element matches the path fragment.  
 * @param  {Function} cb callback function that is called every time a new tree element
 * matches the given path fragment. The function has to return true if the tree look up
 * has to be stopped
 * @for  zebra.util.findInTree()
 * @method findInTree
 */
pkg.findInTree = function(root, path, eq, cb) {
    var findRE = /(\/\/|\/)?([^\[\/]+)(\[\s*(\@[a-zA-Z_][a-zA-Z0-9_\.]*)\s*\=\s*([0-9]+|true|false|\'[^']*\')\s*\])?/g,
        m = null, res = [];

    function _find(root, ms, idx, cb) {
        function list_child(r, name, deep, cb) {
            if (r.kids) {
                for (var i=0; i < r.kids.length; i++) {
                    var kid = r.kids[i];
                    if (name == '*' || eq(kid, name)) {
                        if (cb(kid)) return true;
                    }

                    if (deep && list_child(kid, name, deep, cb)) {
                        return true;
                    }
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

    var c = 0;
    while (m = findRE.exec(path)) {
        if (m[1] == null || m[2] == null || m[2].trim().length === 0) {
            break;
        }

        c += m[0].length;


        if (m[3] && m[5][0] == "'") m[5] = m[5].substring(1, m[5].length - 1);
        res.push(m);
    }

    if (res.length == 0 || c < path.length) {
        throw new Error("Invalid path: '" + path + "'," + c);
    }

    _find({ kids:[root] }, res, 0, cb);
};


/**
 * Rgb color class. This class represents rgb(a) color as JavaScript structure:
 
       // rgb color
       var rgb1 = new zebra.util.rgb(100,200,100);

       // rgb with transparency 
       var rgb2 = new zebra.util.rgb(100,200,100, 0.6);
       
       // encoded as a string rgb color
       var rgb3 = new zebra.util.rgb("rgb(100,100,200)");

       // hex rgb color
       var rgb3 = new zebra.util.rgb("#CCDDFF");

 * @param  {Integer|String} r  red color intensity or if this is the only constructor parameter it denotes 
 * encoded in string rgb color
 * @param  {Integer} [g]  green color intensity
 * @param  {Integer} [b] blue color intensity
 * @param  {Float}   [a] alpha color intensity
 * @constructor
 * @class zebra.util.rgb
 */
pkg.rgb = function (r, g, b, a) {

    /**
     * Red color intensity
     * @attribute r 
     * @type {Integer}
     * @readOnly
     */

    /**
     * Green color intensity
     * @attribute g
     * @type {Integer}
     * @readOnly
     */

    /**
     * Blue color intensity
     * @attribute b
     * @type {Integer}
     * @readOnly
     */

    /**
     * Alpha
     * @attribute a
     * @type {Float}
     * @readOnly
     */
    
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
                    if (p.length > 3) this.a = parseInt(p[3].trim(), 10);
                    return;
                }
            }
        }
        this.r =  r >> 16;
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

/**
 * Interface that has to be implemented by a component that fires a simple 
 * "fired" event.
 * @interface
 * @class zebra.util.Actionable
 */

/**
 * Fire a simple event.
 * 
 *      actionableComp._.add(function (src) {
 *          ....
 *      })
 *      
 * @event fired
 * @param {Object} src a component that triggers the event
 */
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

/**
 * This this META class is handy container to keep different types of listeners and
 * fire events to the listeners:
 
        // create listener container to keep three different events 
        // handlers
        var MyListenerContainerClass = zebra.util.Listeners.Class("event1", 
                                                                  "event2", 
                                                                  "event3"); 

        // instantiate listener class container
        var listeners = new MyListenerContainerClass();

        // add "event1" listener 
        listeners.add(function event1() {
            ...
        });

        // add "event2" listener 
        listeners.add(function event2() {
           ...
        });

        // and firing event1 to registered handlers
        listeners.event1(...); 

        // and firing event2 to registered handlers
        listeners.event2(...); 

 * @class zebra.util.Listeners
 * @constructor
 * @param {String} [events]* events types the container has to support 
 */
var $NewListener = function() {
    if (arguments.length === 0) {
       arguments = ["fired"];
    }

    var clazz = function() {};

    if (arguments.length == 1) {
        var name = arguments[0];

        clazz.prototype.add = function(l) {
            if (this.v == null) this.v = [];
            var ctx = this;
            if (typeof l !== 'function') {
                ctx = l;
                l   = l[name]; 
                if (l == null || typeof l !== "function") {
                    throw new Error("Instance doesn't declare '" + names + "' listener method");
                }
            }
            this.v.push(ctx, l);
            return l;
        };

        clazz.prototype.remove = function(l) {
            if (this.v != null) {
                var i = 0;
                while((i = this.v.indexOf(l)) >= 0) {
                    if (i%2 > 0) i--;
                    this.v.splice(i, 2);
                }
            }
        };

        clazz.prototype.removeAll = function() { if (this.v != null) this.v.length = 0; };

        clazz.prototype[name] = function() {
            if (this.v != null) {
                for(var i = 0;i < this.v.length; i+=2) {
                    this.v[i + 1].apply(this.v[i], arguments);
                }
            }
        };
    }
    else {
        var names = {};
        for(var i=0; i< arguments.length; i++) {
            names[arguments[i]] = true;
        }

        clazz.prototype.add = function(l) {
            if (this.methods == null) this.methods = {};

            if (typeof l === 'function') {
                var n = zebra.$FN(l);
                if (names[n] == null) {
                    throw new Error("Unknown listener " + n);
                }

                if (!this.methods[n]) this.methods[n] = [];
                this.methods[n].push(this, l);
            }
            else {
                var b = false;
                for(var k in names) {
                    if (typeof l[k] === "function") {
                        b = true;
                        if (this.methods[k] == null) this.methods[k] = [];
                        this.methods[k].push(l, l[k]);
                    }
                }
                if (b === false) throw new Error("No listener methods have been found");
            }
            return l;
        };

        for(var i=0; i<arguments.length; i++) {
            var m = arguments[i];
            (function(m) {
                clazz.prototype[m] = function() {
                    if (this.methods != null) {
                        var c = this.methods[m];
                        if (c != null) {
                            for(var i=0; i < c.length; i+=2) c[i+1].apply(c[i], arguments);
                        }
                    }
                };
            })(m);
        }

        clazz.prototype.remove = function(l) {
            if (this.methods != null) {
                for(var k in this.methods) {
                    var v = this.methods[k], i = 0;
                    while((i = v.indexOf(l)) >= 0) {
                        if (i%2 > 0) i--;
                        v.splice(i, 2);
                    }
                    if (v.length === 0) delete this.methods[k];
                }
            }
        };

        clazz.prototype.removeAll = function() {
            if (this.methods != null) {
                for(var k in this.methods) {
                    if (this.methods.hasOwnProperty(k)) this.methods[k].length = 0;
                }
                this.methods = {};
            }
        };
    }
    return clazz;
};

pkg.Listeners = $NewListener();
pkg.Listeners.Class = $NewListener;

/**
 * Useful class to track a virtual cursor position in a structure that has 
 * dedicated number of lines where every line has a number of elements. The 
 * structure metric has to be described by providing an instance of  
 * zebra.util.Position.Metric interface that discovers how many 
 * lines the structure has and how many elements every line includes.
 * @param {zebra.util.Position.Metric} m a position metric
 * @constructor
 * @class  zebra.util.Position
 */

/**
 * Fire when a virtual cursor position has been updated
 
        position._.add(function(src, prevOffset, prevLine, prevCol) {
            ...
        });

 * @event posChanged
 * @param {zebra.util.Position} src an object that triggers the event
 * @param {Integer} prevOffest a previous virtual cursor offset
 * @param {Integer} prevLine a previous virtual cursor line
 * @param {Integer} prevCol a previous virtual cursor column in the previous line
 */
var PosListeners = pkg.Listeners.Class("posChanged"), Position = pkg.Position = Class([
    function $clazz() {
        /**
         * Position metric interface. This interface is designed for describing 
         * a navigational structure that consists on number of lines where
         * every line consists of number of elements
         * @class zebra.util.Position.Metric
         */
        
        /**
         * Get number of lines to navigate through  
         * @return {Integer} a number of lines
         * @method  getLines
         */

         /**
          * Get a number of elements in the given line
          * @param {Integer} l a line index
          * @return {Integer} a number of elements in a line
          * @method  getLineSize
          */

         /**
          * Get a maximal element index (a last element of a last line)
          * @return {Integer} a maximal element index
          * @method  getMaxOffset
          */

        this.Metric = Interface();
        
        this.DOWN = 1;
        this.UP   = 2;
        this.BEG  = 3;
        this.END  = 4;
    },

    function $prototype() {
        /**
         * Clear virtual cursor position to undefined (-1) 
         * @for zebra.util.Position
         * @method clearPos
         */
        this.clearPos = function (){
            if (this.offset >= 0){
                var prevOffset = this.offset,
                    prevLine = this.currentLine,
                    prevCol = this.currentCol;

                this.offset  = this.currentLine = this.currentCol = -1;
                this._.posChanged(this, prevOffset, prevLine, prevCol);
            }
        };

        /**
         * Set the specified virtual cursor offsest
         * @param {Integer} o an offset
         * @method setOffset
         */
        this.setOffset = function(o){
            if(o < 0) o = 0;
            else {
                var max = this.metrics.getMaxOffset();
                if(o >= max) o = max;
            }

            if(o != this.offset){
                var prevOffset = this.offset,
                    prevLine = this.currentLine,
                    prevCol = this.currentCol,
                    p = this.getPointByOffset(o);

                this.offset = o;
                if(p != null){
                    this.currentLine = p[0];
                    this.currentCol = p[1];
                }
                this.isValid = true;
                this._.posChanged(this, prevOffset, prevLine, prevCol);
            }
        };

        /**
         * Seek virtual cursor offset with the given shift
         * @param {Integer} off a shift
         * @method seek
         */
        this.seek = function(off) {
            this.setOffset(this.offset + off);
        };

        /**
         * Set the vurtual cursor line and the given column in the line 
         * @param {Integer} r a line
         * @param {Integer} c a column in the line
         * @method setRowCol
         */
        this.setRowCol = function (r,c){
            if(r != this.currentLine || c != this.currentCol){
                var prevOffset = this.offset,
                    prevLine = this.currentLine,
                    prevCol = this.currentCol;

                this.offset = this.getOffsetByPoint(r, c);
                this.currentLine = r;
                this.currentCol = c;
                this._.posChanged(this, prevOffset, prevLine, prevCol);
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

        /**
         * Calculate a line and line column by the given offset. 
         * @param  {Integer} off an offset
         * @return {Array} an array that contains a line as the first 
         * element and a column in the line as the second element. 
         * @method getPointByOffset
         */
        this.getPointByOffset = function(off){
            if (off == -1) return [-1, -1];

            var m = this.metrics, max = m.getMaxOffset();
            if (off > max) {
                throw new Error("Out of bounds:" + off);
            }

            if (max === 0) return [(m.getLines() > 0 ? 0 : -1), 0];
            if (off === 0) return [0, 0];

            var d = 0, sl = 0, so = 0;
            if (this.isValid && this.offset !=  -1){
                sl = this.currentLine;
                so = this.offset - this.currentCol;
                if(off > this.offset) d = 1;
                else {
                    if(off < this.offset) d =  -1;
                    else return [sl, this.currentCol];
                }
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
                if (off >= so && off < so + ls) {
                    return [sl, off - so];
                }
                so += d > 0 ? ls : -m.getLineSize(sl - 1);
            }
            return [-1, -1];
        };

        /**
         * Calculate an offset by the given line and column in the line 
         * @param  {Integer} row a line 
         * @param  {Integer} col a column in the line
         * @return {Integer} an offset
         * @method getOffsetByPoint
         */
        this.getOffsetByPoint = function (row,col){
            var startOffset = 0, startLine = 0, m = this.metrics;

            if (row >= m.getLines() || col >= m.getLineSize(row)) {
                throw new Error();
            }

            if (this.isValid && this.offset !=  -1) {
                startOffset = this.offset - this.currentCol;
                startLine = this.currentLine;
            }
            if (startLine <= row) {
                for(var i = startLine;i < row; i++) {
                    startOffset += m.getLineSize(i);
                }
            }
            else {
                for(var i = startLine - 1;i >= row; i--) {
                    startOffset -= m.getLineSize(i);
                }
            }
            return startOffset + col;
        };

        /**
         * Calculate maximal possible offset
         * @protected
         * @method calcMaxOffset
         * @return {Integer} a maximal possible offset
         */
        this.calcMaxOffset = function (){
            var max = 0, m = this.metrics;
            for(var i = 0;i < m.getLines(); i ++ ) max += m.getLineSize(i);
            return max - 1;
        };

        /**
         * Seek virtual cursor to the next position. How the method has to seek to the next position
         * has to be denoted by one of the following constants:
    
    - **zebra.util.Position.BEG** seek cursor to the begin of the current line
    - **zebra.util.Position.END** seek cursor to the end of the current line
    - **zebra.util.Position.UP** seek cursor one line up
    - **zebra.util.Position.DOWN** seek cursor one line down 
    
         * If the current virtual position is not known (-1) the method always sets 
         * it to the first line, the first column in the line (offset is zero).
         * @param  {Integer} t   an action the seek has to be done
         * @param  {Integer} num number of seek actions 
         * @method seekLineTo
         */
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
                        this._.posChanged(this, prevOffset, prevLine, prevCol);
                    } break;
                case Position.END:
                    var maxCol = this.metrics.getLineSize(this.currentLine);
                    if (this.currentCol < (maxCol - 1)){
                        this.offset += (maxCol - this.currentCol - 1);
                        this.currentCol = maxCol - 1;
                        this._.posChanged(this, prevOffset, prevLine, prevCol);
                    } break;
                case Position.UP:
                    if (this.currentLine > 0){
                        this.offset -= (this.currentCol + 1);
                        this.currentLine--;
                        for(var i = 0;this.currentLine > 0 && i < (num - 1); i++ , this.currentLine--){
                            this.offset -= this.metrics.getLineSize(this.currentLine);
                        }
                        var maxCol = this.metrics.getLineSize(this.currentLine);
                        if (this.currentCol < maxCol) this.offset -= (maxCol - this.currentCol - 1);
                        else this.currentCol = maxCol - 1;
                        this._.posChanged(this, prevOffset, prevLine, prevCol);
                    } break;
                case Position.DOWN:
                    if (this.currentLine < (this.metrics.getLines() - 1)){
                        this.offset += (this.metrics.getLineSize(this.currentLine) - this.currentCol);
                        this.currentLine++;
                        var size = this.metrics.getLines() - 1;
                        for(var i = 0;this.currentLine < size && i < (num - 1); i++ ,this.currentLine++ ){
                            this.offset += this.metrics.getLineSize(this.currentLine);
                        }
                        var maxCol = this.metrics.getLineSize(this.currentLine);
                        if (this.currentCol < maxCol) this.offset += this.currentCol;
                        else {
                            this.currentCol = maxCol - 1;
                            this.offset += this.currentCol;
                        }
                        this._.posChanged(this, prevOffset, prevLine, prevCol);
                    } break;
                default: throw new Error();
            }
        };

        this[''] = function(pi){
            this._ = new PosListeners();
            this.isValid = false;

            /**
             * Current virtual cursor line position
             * @attribute currentLine
             * @type {Integer}
             * @readOnly
             */

            /**
             * Current virtual cursor column position
             * @attribute currentCol
             * @type {Integer}
             * @readOnly
             */
            
            /**
             * Current virtual cursor offset
             * @attribute offset
             * @type {Integer}
             * @readOnly
             */

            this.currentLine = this.currentCol = this.offset = 0;
            this.setMetric(pi);
        };

        /**
         * Set position metric. Metric describes how many lines  
         * and elements in these line the virtual cursor can be navigated
         * @param {zebra.util.Position.Metric} p a position metric
         * @method setMetric
         */
        this.setMetric = function (p){
            if (p == null) throw new Error("Null metric");
            if (p != this.metrics){
                this.metrics = p;
                this.clearPos();
            }
        };
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

/**
 * JSON configuration objects loader class. The class is 
 * handy way to keep and load configuration encoded in JSON 
 * format. Except standard JSON types the class uses number 
 * of JSON values and key interpretations such as:
  
    - **"@key_of_refernced_value"** String values that start from "@" character are considered 
      as a reference to other values 
    - **{ "$class_name":[ arg1, arg2, ...], "prop1": ...}** Key names that starts from "$" character 
      are considered as name of class that has to be instantiated as the value
    - **{"?isToucable": { "label": true } }** Key names that start from "?" are considered as
      conditional section.   

 * Also the class support section inheritance. That means 
 * you can say to include part of JSON to another part of JSON. 
 * For instance, imagine JSON describes properties for number 
 * of UI components where an UI component can inherits another 
 * one. 
 
        {
           // base component  
           "BaseComponent": {
               "background": "red",
               "border": "plain",
               "size": [300, 300]
           },

            // component that inherits properties from BaseComponent,
            // but override background property with own value
           "ExtenderComp": {
               "$inherit": "BaseComponent",
               "background": "green"
           }
        }
 
 * 
 * The loading of JSON can be multi steps procedure where 
 * you can load few JSON. That means you can compose the 
 * final configuration from number of JSON files:
 
        // prepare object that will keep loaded data
        var loadedData = {}; 

        // create bag
        var bag = zebra.util.Bag(loadedData);

        // load the bag with two JSON
        bag.load("{ ... }", false).load("{  ...  }");


 * @class zebra.util.Bag
 * @constructor
 * @param {Object} [obj] a root object to be loaded with 
 * the given JSON configuration  
 */
pkg.Bag = zebra.Class([
    function $prototype() {
        /**
         * The attribute rules how arrays have to be merged if the bag is loaded from few 
         * JSON sources. true means that if a two JSON have the same key that reference to
         * array values the final value will be a concatenation of the two arrays from the 
         * two JSON sources.
         * @attribute concatArrays
         * @type {Boolean}
         * @default false
         */
        this.concatArrays = false;

        /**
         * The property says if the object introspection is required to try find a setter 
         * method for the given key. For instance if an object is loaded with the 
         * following JSON:
         
         {
            "color": "red"
         }
        
         * the introspection will cause bag class to try finding "setColor(c)" method in 
         * the loaded with the JSON object and call it to set "red" property value.  
         * @attribute usePropertySetters
         * @default true
         * @type {Boolean}
         */
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
            if (v === null || zebra.isNumber(v) || zebra.isBoolean(v) || zebra.isString(v)) {
                return v;
            }

            if (Array.isArray(v)) {
                if (this.concatArrays === false) {
                    return v;
                }

                if (o && Array.isArray(o) === false) {
                    throw new Error("Array merging type inconsistency: " + o);
                }
                return o ? o.concat(v) : v;
            }

            for (var k in v) {
                if (v.hasOwnProperty(k)) {
                    if (k[0] == '?') {
                        eval("var ex=" + k.substring(1).trim());
                        if (ex) {
                            o = this.mergeContent(o, v[k]);
                        }
                        continue;
                    }

                    o[k] = o.hasOwnProperty(k) ? this.mergeContent(o[k], v[k]) : v[k];
                }
            }
            return o;
        };

        // create, merge to o and return a value by the given 
        // description d that is designed to be assigned to 
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
                if (this.concatArrays === false) {
                    return v;
                }

                if (o && Array.isArray(o) === false) {
                    throw new Error("Destination has to be array: " + o);
                }
                return (o != null) ? o.concat(v) : v;
            }

            // string is atomic, but  string can encode type other 
            // than string, decode string (if necessary) by calling 
            // decodeStringValue method
            if (zebra.isString(d)) {
                if (d[0] == "@") {
                    if (d[1] == "(" && d[d.length-1] == ")") {
                        var $this = this,
                            bag = new (this.getClazz())([
                                function resolveVar(name) {
                                    try { return this.$super(name); }
                                    catch(e) {}
                                    return $this.resolveVar(name);
                                },

                                function resolveClass(className) {
                                    var clazz = this.aliases.hasOwnProperty(className) ? this.$super(className) : null;
                                    return (clazz != null) ? clazz
                                                           : $this.resolveClass(className);
                                }
                            ]);
                        bag.loadByUrl(d.substring(2, d.length-1));
                        return bag.objects;
                    }
                    return this.resolveVar(d.substring(1).trim());
                }

                return this.decodeStringValue ? this.decodeStringValue(d) : d;
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
                                $new : function() {
                                    return pkg.newInstance(clazz, args);
                                }
                            };
                        })(this.resolveClass(classname.substring(1).trim()), args);
                    }
                    return this.mergeObjWithDesc(pkg.newInstance(this.resolveClass(classname), args), d);
                }

                //!!!!  trust the name of class occurs first what in general 
                //      cannot be guaranteed by JSON spec but we can trust 
                //      since many other third party applications stands 
                //      on it too :)
                break;
            }

            // the description is not atomic or array type. it can 
            // be either a number of fields that should be merged 
            // with appropriate field of "o" object, or it can define 
            // how to instantiate an instance of a class. There is 
            // one special case: ".name" property says that object 
            // is created by calling "name" method
            var v = (o == null         || zebra.isNumber(o) ||
                    zebra.isBoolean(o) || zebra.isString(o) ||
                    Array.isArray(o)) ? d : o;

            for (var k in d) {
                if (d.hasOwnProperty(k)) {
                    // special field name that says to call method to create a value by the given description
                    if (k[0] == ".") {
                        var vv = d[k];
                        if (Array.isArray(vv) === false) {
                            vv = [ vv ];
                        }
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

        /**
         * Called every time the given class name has to be transformed into 
         * the class object (constructor) reference. 
         * @param  {String} className a class name
         * @return {Function}   a class reference
         * @method resolveClass
         */
        this.resolveClass = function (className) {
            return this.aliases.hasOwnProperty(className) ? this.aliases[className]
                                                          : zebra.Class.forName(className);
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
                    if (op.hasOwnProperty(k) && o.hasOwnProperty(k) === false) {
                        o[k] = op[k];
                    }
                }
            }
        };

        /**
         * Load the given JSON content and parse if the given flag is true. The passed  
         * boolean flag controls parsing. The flag is used to load few JSON. Before 
         * parsing the JSONs are merged and than the final result is parsed.
         * @param  {String} s a JSON content to be loaded
         * @param  {Boolean} [b] true if the loading has to be completed
         * @return {zebra.util.Bag} a reference to the bag class instance
         * @method load
         */
        this.load = function (s, b) {
            if (this.isloaded === true) { 
                throw new Error("Load is done");
            }

            if (b == null) {
                b = true;
            }

            var content = null;
            try { content = JSON.parse(s); }
            catch(e) {
                throw new Error("JSON loading error: " + e);
            }

            this.content = this.mergeContent(this.content, content);
            if (this.contentLoaded) this.contentLoaded(this.content);
            if (b === true) this.end();
            return this;
        };

        /**
         * Callback method that can be implemented to be called when
         * the bag JSON has been completely loaded but not parsed. 
         * The method can be useful for custom bag implementation 
         * that need to perform extra handling over the parsed JSON 
         * content
         * @param {Object} content a parsed JSON content 
         * @method contentLoaded
         */

        /**
         * End loading JSONs and parse final result
         * @method end
         */
        this.end = function() {
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
        };

        this.resolveVar = function(name) {
            return this.get(name);
        };

        this[''] = function (container) {
            this.aliases = {};
            this.objects = container == null ? {} : container;
            this.content = {};
        };
    },

    function loadByUrl(url) {
        this.loadByUrl(url, true);
    },

    /**
     * Load JSON by the given URL
     * @param  {String} url an URL to a JSON
     * @param  {Boolean} [b] true if the loading has to be completed 
     * @return {zebra.util.Bag} a reference to the bag class instance
     * @method loadByUrl
     */
    function loadByUrl(url, b) {
        var p = url.toString();
        p = p + (p.lastIndexOf("?") > 0 ? "&" : "?") + (new Date()).getTime().toString();
        return this.load(zebra.io.GET(p), b);
    }
]);

/**
 * @for
 */

})(zebra("util"), zebra.Class, zebra.Interface);

(function(pkg, Class) {

pkg.NONE        = 0;
pkg.LEFT        = 1;
pkg.RIGHT       = 2;
pkg.TOP         = 4;
pkg.BOTTOM      = 8;
pkg.CENTER      = 16;
pkg.HORIZONTAL  = 32;
pkg.VERTICAL    = 64;
pkg.TEMPORARY   = 128;

pkg.USE_PS_SIZE = 512;
pkg.STRETCH     = 256;

pkg.TLEFT  = pkg.LEFT  | pkg.TOP;
pkg.TRIGHT = pkg.RIGHT | pkg.TOP;
pkg.BLEFT  = pkg.LEFT  | pkg.BOTTOM;
pkg.BRIGHT = pkg.RIGHT | pkg.BOTTOM;


// collect constraints into a separate dictionary
var $ctrs = {};
for(var k in pkg) {
    if (pkg.hasOwnProperty(k) && /^\d+$/.test(pkg[k])) {
        $ctrs[k.toUpperCase()] = pkg[k];
    }
}

var $c = pkg.$constraints = function(v) {
    return zebra.isString(v) ? $ctrs[v.toUpperCase()] : v;
};


/**
 * Layout package provides number of classes, interfaces, methods and 
 * variables that allows developer easily implement rules based layouting 
 * of hierarchy of rectangular elements. The package has no relation 
 * to any concrete UI, but it can be applied to a required UI framework
 *
 * The package declares the following constrains constants:
     
    - **NONE** no constraints 
    - **LEFT** left alignment constraint
    - **TOP** top alignment constraint
    - **RIGHT** right alignment constraint
    - **BOTTOM** bottom alignment constraint
    - **CENTER** center alignment constraint
    - **HORIZONTAL** horizontal elements alignment constraint
    - **VERTICAL** vertical elements alignment constraint
    - **TLEFT** top left alignment constraint
    - **TRIGHT** top right alignment constraint
    - **BLEFT** bottom left alignment constraint
    - **BRIGHT** bottom right alignment constraint
    - **STRETCH** stretch element
    - **USE_PS_SIZE** use preferred size for an element
        
 * 
 * @module layout
 * @main layout
 */

/**
 * Layout manager interface
 * @class zebra.layout.Layout
 * @interface
 */

/**
 * Calculate preferred size of the given component
 * @param {zebra.layout.Layoutable} t a target layoutable component
 * @method calcPreferredSize
 */

/**
 * Layout children components of the specified layoutable target component 
 * @param {zebra.layout.Layoutable} t a target layoutable component
 * @method doLayout
 */
var L = pkg.Layout = new zebra.Interface();

/**
 * Find a direct children element for the given children component 
 * and the specified parent component
 * @param  {zebra.layout.Layoutable} parent  a parent component 
 * @param  {zebra.layout.Layoutable} child  a children component
 * @return {zebra.layout.Layoutable}  a direct children component
 * @method getDirectChild
 * @for zebra.layout.getDirectChild()
 */
pkg.getDirectChild = function(parent,child){
    for(; child != null && child.parent != parent; child = child.parent) {}
    return child;
};

/**
 * Find a direct component located at the given location of the specified 
 * parent component and the specified parent component
 * @param  {Integer} x a x coordinate relatively to the parent component
 * @param  {Integer} y a y coordinate relatively to the parent component
 * @param  {zebra.layout.Layoutable} parent  a parent component 
 * @return {zebra.layout.Layoutable} an index of direct children component 
 * or -1 if no a children component can be found
 * @method getDirectAt
 * @for zebra.layout.getDirectAt()
 */
pkg.getDirectAt = function(x,y,p){
    for(var i = 0;i < p.kids.length; i++){
        var c = p.kids[i];
        if (c.isVisible && c.x <= x && c.y <= y && c.x + c.width > x && c.y + c.height > y) return i;
    }
    return -1;
};

/**
 * Get a top (the highest in component hierarchy) parent component 
 * of the given component 
 * @param  {zebra.layout.Layoutable} c a component
 * @return {zebra.layout.Layoutable}  a top parent component
 * @method getTopParent
 * @for zebra.layout.getTopParent()
 */
pkg.getTopParent = function(c){
    for(; c != null && c.parent != null; c = c.parent);
    return c;
};

/**
 * Translate the given relative to the specified component location 
 * in an absolute location. Absolute location is location relatively 
 * to the top parent component of the specified component.
 * @param  {Inetger} [x] a x coordinate relatively  to the given component
 * @param  {Inetger} [y] a y coordinate relatively  to the given component
 * @param  {zebra.layout.Layoutable} c a component
 * @return {Object} an absolute location of the given location of the specified 
 * UI component:
 
        { x:{Integer}, y:{Integer} } 

 * @method getAbsLocation
 * @for zebra.layout.getAbsLocation()
 */
pkg.getAbsLocation = function(x,y,c){
    if (arguments.length == 1) {
        c = x;
        x = y = 0;
    }

    while (c.parent != null) {
        x += c.x;
        y += c.y;
        c = c.parent;
    }
    return { x:x, y:y };
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

/**
 * Calculate maximal preferred width and height of 
 * children component of the given target component.
 * @param  {zebra.layout.Layoutable} target a target component  
 * @return {Object} a maximal preferred width and height 
 
        { width:{Integer}, height:{Integer} }

 * @method getMaxPreferredSize
 * @for zebra.layout.getMaxPreferredSize()
 */
pkg.getMaxPreferredSize = function(target) {
    var maxWidth = 0, maxHeight = 0;
    for(var i = 0;i < target.kids.length; i++){
        var l = target.kids[i];
        if (l.isVisible){
            var ps = l.getPreferredSize();
            if (ps.width > maxWidth) maxWidth = ps.width;
            if (ps.height > maxHeight) maxHeight = ps.height;
        }
    }
    return { width:maxWidth, height:maxHeight };
};

pkg.isAncestorOf = function(p,c){
    for(; c != null && c != p; c = c.parent);
    return c != null;
};

/**
 * Layoutable class defines rectangular component that 
 * has elementary metrical properties like width, height 
 * and location and can be a participant of layout management 
 * process. Layoutable component is container that can 
 * contains other layoutable component as its children. 
 * The children components are ordered by applying a layout 
 * manager of its parent component. 
 * @class zebra.layout.Layoutable
 * @constructor
 * @extends {zebra.layout.Layout}
 */
pkg.Layoutable = Class(L, [
    function $prototype() {
        /**
         * x coordinate 
         * @attribute x
         * @default 0
         * @readOnly
         * @type {Integer}
         */

        /**
        * y coordinate 
        * @attribute y
        * @default 0
        * @readOnly
        * @type {Integer}
        */

        /**
        * Width of rectangular area 
        * @attribute width
        * @default 0
        * @readOnly
        * @type {Integer}
        */

        /**
        * Height of rectangular area 
        * @attribute height
        * @default 0
        * @readOnly
        * @type {Integer}
        */

        /**
        * Indicate a layoutable component visibility
        * @attribute isVisible
        * @default true
        * @readOnly
        * @type {Boolean}
        */

        /**
        * Indicate a layoutable component validity 
        * @attribute isValid
        * @default false
        * @readOnly
        * @type {Boolean}
        */

        /**
        * Reference to a parent layoutable component
        * @attribute parent
        * @default null
        * @readOnly
        * @type {zebra.layout.Layoutable}
        */

        /**
        * Layout manager that is used to order children layoutable components 
        * @attribute layout
        * @default itself
        * @readOnly
        * @type {Layout}
        */

        this.x = this.y = this.height = this.width = this.cachedHeight= 0;

        this.psWidth = this.psHeight = this.cachedWidth = -1;
        this.isLayoutValid = this.isValid = false;

        /**
         * The component layout constraints. The constraints is specific to 
         * the parent component layout manager value that customizes the 
         * children component layouting on the parent component. 
         * @attribute constraints 
         * @default null
         * @type {Object}
         */
        this.constraints = this.parent = null;
        this.isVisible = true;

        /**
         * Find a first children component that satisfies the passed path expression. 
         * @param  {String} path path expression. Path expression is simplified form 
         * of XPath-like expression:
         
        "/Panel"  - find first children that is an instance of zebra.ui.Panel
        "/Panel[@id='top']" - find first children that is an instance of zebra.ui.Panel with "id" attribute that equals "top"
        "//Panel"  - find first children that is an instance of zebra.ui.Panel recursively 
    
         *
         * @method find
         * @return {zebra.layout.Layoutable} found children component or null if 
         * no children component can be found
         */
        this.find = function(path){
            var res = null;
            zebra.util.findInTree(  this, path,
                                    function(node, name) {
                                        return node.getClazz().$name == name;
                                    },
                                    function(kid) {
                                       res = kid;
                                       return true;
                                    });
            return res;
        };

        /**
         * Find children components that satisfy the passed path expression. 
         * @param  {String} path path expression. Path expression is 
         * simplified form of XPath-like expression:
         
         "/Panel"  - find first children that is an instance of zebra.ui.Panel
         "/Panel[@id='top']" - find first children that is an instance of zebra.ui.Panel with "id" attribute that equals "top"
         "//Panel"  - find first children that is an instance of zebra.ui.Panel recursively 
         
         * @param {Function} [callback] function that is called every time a 
         * new children component has been found.  
         * @method findAll
         * @return {Array}  return array of found children components if 
         * passed function has not been passed
         */
        this.findAll = function(path, callback){
            var res = [];
            if (callback == null) {
                callback =  function(kid) {
                    res.push(kid);
                    return false;
                };
            }
            zebra.util.findInTree(this, path,
                                  function(node, name) {
                                    return node.getClazz().$name == name;
                                  },
                                  callback);
            return res;
        };

        /**
         * Validate the component metrics. The method is called as 
         * a one step of the component validation procedure. The 
         * method causes "recalc" method execution if the method
         * has been implemented and the component is in invalid
         * state. It is supposed the "recalc" method has to be
         * implemented by a component as safe place where the 
         * component metrics can be calculated. Component 
         * metrics is individual for the given component 
         * properties that has influence to the component 
         * preferred size value. In many cases the properties
         * calculation has to be minimized what can be done
         * by moving the calculation in "recalc" method  
         * @method validateMetric
         * @protected
         */
        this.validateMetric = function(){
            if (this.isValid === false){
                if (this.recalc) this.recalc();
                this.isValid = true;
            }
        };

        /**
         * By default there is no any implementation of "recalc" method
         * in the layoutable component. In other words the method doesn't
         * exist. Developer should implement the method if the need a proper
         * and efficient place  to calculate component properties that 
         * have influence to the component preferred size. The "recalc"
         * method is called only when it is really necessary to compute
         * the component metrics.
         * @method recalc
         * @protected
         */

        /**
         * Invalidate the component layout. Layout invalidation means the 
         * component children components have to be placed with the component
         * layout manager. Layout invalidation causes a parent component 
         * layout is also invalidated.
         * @method invalidateLayout
         * @protected
         */
        this.invalidateLayout = function(){
            this.isLayoutValid = false;
            if (this.parent != null) this.parent.invalidateLayout();
        };

        /**
         * Invalidate component layout and metrics.
         * @method invalidate
         */
        this.invalidate = function(){
            this.isValid = this.isLayoutValid = false;
            this.cachedWidth =  -1;
            if (this.parent != null) this.parent.invalidate();
        };

        /**
         * Force validation of the component metrics and layout if it is not valid
         * @method validate
         */
        this.validate = function(){
            this.validateMetric();
            if (this.width > 0 && this.height > 0 &&
                this.isLayoutValid === false && this.isVisible)
            {
                this.layout.doLayout(this);
                for(var i = 0;i < this.kids.length; i++) {
                    this.kids[i].validate();
                }
                this.isLayoutValid = true;
                if (this.laidout) this.laidout();
            }
        };

        /**
         * The method can be implemented to be informed every time 
         * the component lay outs its children components
         * @method laidout
         */

        /**
         * Get preferred size. The preferred size includes  top, left, 
         * bottom and right paddings and 
         * the size the component wants to have 
         * @method getPreferredSize
         * @return {Object} return size object the component wants to 
         * have as the following structure:
                
         {width:{Integer}, height:{Integer}} object
         
         */
        this.getPreferredSize = function(){
            this.validateMetric();
            if (this.cachedWidth < 0){
                var ps = (this.psWidth < 0 || this.psHeight < 0) ? this.layout.calcPreferredSize(this)
                                                                 : { width:0, height:0 };

                ps.width  = this.psWidth  >= 0 ? this.psWidth
                                               : ps.width  + this.getLeft() + this.getRight();
                ps.height = this.psHeight >= 0 ? this.psHeight
                                               : ps.height + this.getTop()  + this.getBottom();
                this.cachedWidth  = ps.width;
                this.cachedHeight = ps.height;
                return ps;
            }
            return { width:this.cachedWidth,
                     height:this.cachedHeight };
        };

        /**
         * Get top padding.
         * @method getTop
         * @return {Integer} top padding in pixel
         */
        this.getTop    = function ()  { return 0; };

        /**
         * Get left padding.
         * @method getLeft
         * @return {Integer} left padding in pixel
         */
        this.getLeft   = function ()  { return 0; };

        /**
         * Get bottom padding.
         * @method getBottom
         * @return {Integer} bottom padding in pixel
         */
        this.getBottom = function ()  { return 0; };

        /**
         * Get right padding.
         * @method getRight
         * @return {Integer} right padding in pixel
         */
        this.getRight  = function ()  { return 0; };

        /**
         * Set the parent component.  
         * @protected
         * @param {zebra.layout.Layoutable} o a parent component 
         * @method setParent
         * @protected
         */
        this.setParent = function (o){
            if(o != this.parent){
                this.parent = o;
                this.invalidate();
            }
        };

        /**
         * Set the given layout manager that is used to place 
         * children component. Layout manager is simple class 
         * that defines number of rules concerning the way 
         * children components have to be ordered on its parent 
         * surface.  
         * @method setLayout
         * @param {zebra.ui.Layout} m a layout manager 
         */
        this.setLayout = function (m){
            if (m == null) throw new Error("Null layout");

            if(this.layout != m){
                var pl = this.layout;
                this.layout = m;
                this.invalidate();
            }
        };

        /**
         * Internal implementation of the component 
         * preferred size calculation.  
         * @param  {zebra.layout.Layoutable} target a component 
         * for that the metric has to be calculated
         * @return {Object} a preferred size. The method always 
         * returns { width:10, height:10 } as the component preferred 
         * size
         * @private
         * @method calcPreferredSize
         */
        this.calcPreferredSize = function (target){
            return { width:10, height:10 };
        };

        /**
         * By default layoutbable component itself implements 
         * layout manager to order its children components.
         * This method implementation does nothing, so children 
         * component will placed according locations and sizes they 
         * have set.  
         * @method doLayout
         * @private
         */
        this.doLayout = function (target) {};

        /**
         * Detect index of a children component.
         * @param  {zebra.ui.Layoutbale} c a children component
         * @method indexOf
         * @return {Integer}
         */
        this.indexOf = function (c){
            return this.kids.indexOf(c);
        };

        /**
         * Insert the new children component at the given index with the specified layout constraints. 
         * The passed constraints can be set via a layoutable component that is inserted. Just 
         * set "constraints" property of in inserted component.
         * @param  {Integer} i an index at that the new children component has to be inserted 
         * @param  {Object} constr layout constraints of the new children component
         * @param  {zebra.layout.Layoutbale} d a new children layoutable component to be added
         * @return {zebra.layout.Layoutable} an inserted children layoutable component
         * @method insert
         */
        this.insert = function(i,constr,d){
            if (d.constraints) constr = d.constraints;
            else               d.constraints = constr;

            if (i == this.kids.length) this.kids.push(d);
            else this.kids.splice(i, 0, d);

            d.setParent(this);

            if (this.kidAdded) this.kidAdded(i, constr, d);
            this.invalidate();
            return d;
        };

        /**
         * The method can be implemented to be informed every time a new component 
         * has been inserted into the component
         * @param  {Integer} i an index at that the new children component has been inserted 
         * @param  {Object} constr layout constraints of the new children component
         * @param  {zebra.layout.Layoutbale} d a new children layoutable component that has 
         * been added
         * @method kidAdded
         */

        /**
         * Set the layoutable component location. Location is x, y coordinates relatively to 
         * a parent component 
         * @param  {Integer} xx x coordinate relatively to the layoutable component parent
         * @param  {Integer} yy y coordinate relatively to the layoutable component parent
         * @method setLocation
         */
        this.setLocation = function (xx,yy){
            if(xx != this.x || this.y != yy){
                var px = this.x, py = this.y;
                this.x = xx;
                this.y = yy;
                if (this.relocated) this.relocated(px, py);
            }
        };

        /**
         * The method can be implemented to be informed every time the component
         * has been moved
         * @param  {Integer} px x previous coordinate of moved children component
         * @param  {Integer} py y previous coordinate of moved children component
         * @method relocated
         */


        /**
         * Set the layoutable component bounds. Bounds defines the component location and size.
         * @param  {Integer} x x coordinate relatively to the layoutable component parent
         * @param  {Integer} y y coordinate relatively to the layoutable component parent
         * @param  {Integer} w a width of the component
         * @param  {Integer} h a height of the component
         * @method setBounds
         */
        this.setBounds = function (x, y, w, h){
            this.setLocation(x, y);
            this.setSize(w, h);
        };

        /**
         * Set the layoutable component size. 
         * @param  {Integer} w a width of the component
         * @param  {Integer} h a height of the component
         * @method setSize
         */
        this.setSize = function (w,h){
            if (w != this.width || h != this.height){
                var pw = this.width, ph = this.height;
                this.width = w;
                this.height = h;
                this.isLayoutValid = false;
                if (this.resized) this.resized(pw, ph);
            }
        };

        /**
         * The method can be implemented to be informed every time the component
         * has been resized
         * @param  {Integer} w a previous width of the component
         * @param  {Integer} h a previous height of the component
         * @method resized
         */


        /**
         * Get a children layoutable component by the given constraints.  
         * @param  {zebra.layout.Layoutable} c a constraints
         * @return {zebra.layout.Layoutable} a children component
         * @method getByConstraints
         */
        this.getByConstraints = function (c) {
            if (this.kids.length > 0){
                for(var i = 0;i < this.kids.length; i++ ){
                    var l = this.kids[i];
                    if (c == l.constraints) return l;
                }
            }
            return null;
        };

        /**
         * Remove the given children component.
         * @param {zebra.layout.Layoutable} c a children component to be removed
         * @method remove
         * @return {zebra.layout.Layoutable} a removed children component 
         */
        this.remove = function(c) { 
            return this.removeAt(this.kids.indexOf(c)); 
        };

        /**
         * Remove a children component at the specified position.
         * @param {Integer} i a children component index at which it has to be removed 
         * @method removeAt
         * @return {zebra.layout.Layoutable} a removed children component 
         */
        this.removeAt = function (i){
            var obj = this.kids[i];
            obj.setParent(null);
            if (obj.constraints) obj.constraints = null;
            this.kids.splice(i, 1);
            if (this.kidRemoved) this.kidRemoved(i, obj);
            this.invalidate();
            return obj;
        };

        /**
         * The method can be implemented to be informed every time a children component
         * has been removed
         * @param {Integer} i a children component index at which it has been removed 
         * @param  {zebra.layout.Layoutable} c a children component that has been removed
         * @method kidRemoved
         */


        /**
         * Set the specified preferred size the component has to have. 
         * Component preferred size is important thing that is widely 
         * used to layout the component. Usually the preferred 
         * size is calculated by a concrete component basing on 
         * its metrics. For instance, label component calculates its
         * preferred size basing on text size. But if it is required  
         * the component preferred size can be fixed with the desired 
         * value.
         * @param  {Integer} w a preferred width. Pass "-1" as the 
         * argument value to not set preferred width
         * @param  {Integer} h a preferred height. Pass "-1" as the 
         * argument value to not set preferred height
         * @method setPreferredSize
         */
        this.setPreferredSize = function(w,h) {
            if (w != this.psWidth || h != this.psHeight){
                this.psWidth  = w;
                this.psHeight = h;
                this.invalidate();
            }
        };

        /**
         * Replace a children component with the specified constraints 
         * with the given new children component
         * @param  {Object} constr a constraints of a children 
         * component to be replaced with a new one
         * @param  {zebra.layout.Layoutable} d a new children 
         * component to be set
         * @method set
         */
        this.set = function(constr, d) {
            var pd = this.getByConstraints(constr);
            if (pd != null) this.remove(pd);
            if (d  != null) this.add(constr, d);
        };

        /**
         * Add the new children component with the given constraints 
         * @param  {Object} constr a constrains of a new children component
         * @param  {zebra.layout.Layoutable} d a new children component to be added
         * @method add
         * @return {zebra.layout.Layoutable} added layoutable component 
         */
        this.add = function(constr,d) {
            return (arguments.length == 1) ? this.insert(this.kids.length, null, constr) 
                                           : this.insert(this.kids.length, constr, d) ;
        };

        this.$kids = function(f) {
            for(var i=0; i<this.kids.length; i++) {
                f.call(this, this.kids[i], i);
            }
        };

        // speedup constructor execution
        this[''] = function() {
            this.kids = [];
            this.layout = this;
        };
    }
]);

/**
 *  Layout manager implementation that places layoutbale components 
 *  on top of each other stretching its to fill all available parent 
 *  component space 
 *  @class zebra.layout.StackLayout
 *  @constructor
 */
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

/**
 *  Layout manager implementation that logically splits component area into five areas: TOP, BOTTOM, LEFT, RIGHT and CENTER.
 *  TOP and BOTTOM components are stretched to fill all available space horizontally and are sized to have preferred height horizontally. 
 *  LEFT and RIGHT components are stretched to fill all available space vertically and are sized to have preferred width vertically.
 *  CENTER component is stretched to occupy all available space taking in account TOP, LEFT, RIGHT and BOTTOM components.
 
       // create panel with border layout
       var p = new zebra.ui.Panel(new zebra.layout.BorderLayout());
       
       // add children UI components with top, center and left constraints 
       p.add(zebra.layout.TOP,    new zebra.ui.Label("Top"));
       p.add(zebra.layout.CENTER, new zebra.ui.Label("Center"));
       p.add(zebra.layout.LEFT,   new zebra.ui.Label("Left"));
 
 * Construct the layout with the given vertical and horizontal gaps. 
 * @param  {Integer} [hgap] horizontal gap. The gap is a horizontal distance between laid out components  
 * @param  {Integer} [vgap] vertical gap. The gap is a vertical distance between laid out components  
 * @constructor 
 * @class zebra.layout.BorderLayout
 * @extends {zebra.layout.Layout}
 */
pkg.BorderLayout = Class(L, [
    function $prototype() {
        /**
         * Horizontal gap (space between components)
         * @attribute hgap
         * @default 0
         * @readOnly
         * @type {Integer}
         */

        /**
         * Vertical gap (space between components)
         * @attribute vgap
         * @default 0
         * @readOnly
         * @type {Integer}
         */

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
                       default: throw new Error("Invalid constraints: " + l.constraints);
                    }
                }
            }

            var dim = { width:0, height:0 };
            if (east != null) {
                d = east.getPreferredSize();
                dim.width += d.width + this.hgap;
                dim.height = (d.height > dim.height ? d.height: dim.height );
            }

            if (west != null) {
                d = west.getPreferredSize();
                dim.width += d.width + this.hgap;
                dim.height = d.height > dim.height ? d.height : dim.height;
            }

            if (center != null) {
                d = center.getPreferredSize();
                dim.width += d.width;
                dim.height = d.height > dim.height ? d.height : dim.height;
            }

            if (north != null) {
                d = north.getPreferredSize();
                dim.width = d.width > dim.width ? d.width : dim.width;
                dim.height += d.height + this.vgap;
            }

            if (south != null) {
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

/**
 * Rester layout manager can be used to use absolute position of 
 * layoutable components. That means all components will be laid 
 * out according coordinates and size they have. Raster layout manager 
 * provides extra possibilities to control children components placing. 
 * It is possible to align components by specifying layout constraints, 
 * size component to its preferred size and so on.  
 * @param {Integer} [m] flag to add extra rule to components layouting. 
 * For instance use zebra.layout.USE_PS_SIZE as the flag value to set 
 * components size to its preferred sizes.  
 * @class  zebra.layout.RasterLayout
 * @constructor
 * @extends {zebra.layout.Layout}
 */
pkg.RasterLayout = Class(L, [
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
            var r = c.width - c.getRight(), 
                b = c.height - c.getBottom(),
                usePsSize = (this.flag & pkg.USE_PS_SIZE) > 0;

            for(var i = 0;i < c.kids.length; i++){
                var el = c.kids[i], ww = 0, hh = 0;
                if (el.isVisible){
                    if (usePsSize){
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

                    if (el.constraints) {
                        var x = el.x, y = el.y;
                        if (el.constraints == pkg.CENTER) {
                            x = (c.width - ww)/2;
                            y = (c.height - hh)/2;
                        }
                        else {
                            if ((el.constraints & pkg.TOP) > 0)  y = 0;
                            else
                            if ((el.constraints & pkg.BOTTOM) > 0)  y = c.height - hh;

                            if ((el.constraints & pkg.LEFT) > 0)  x = 0;
                            else
                            if ((el.constraints & pkg.RIGHT) > 0)  x = c.width - ww;
                        }

                        el.setLocation(x, y);
                    }
                }
            }
        };

        //!!! speed up
        this[''] = function(f) {
            this.flag = f ? f : 0;
        };
    }
]);

/**
 * Flow layout manager group and places components aligned with 
 * different vertical and horizontal alignments
  
        // create panel and set flow layout for it
        // components added to the panel will be placed 
        // horizontally aligned at the center of the panel 
        var p = new zebra.ui.Panel();
        p.setLayout(new zebra.layout.FlowLayout(zebra.layout.CENTER, zebra.layout.CENTER));

        // add three buttons into the panel with flow layout 
        p.add(new zebra.ui.Button("Button 1"));
        p.add(new zebra.ui.Button("Button 2"));
        p.add(new zebra.ui.Button("Button 3"));
  
 * @param {Integer} [ax] (zebra.layout.LEFT by default) horizontal alignment:
  
     zebra.layout.LEFT - left alignment 
     zebra.layout.RIGHT - right alignment 
     zebra.layout.CENTER - center alignment 
 
 * @param {Integer} [ay] (zebra.layout.TOP by default) vertical alignment:
 
     zebra.layout.TOP - top alignment 
     zebra.layout.CENTER - center alignment 
     zebra.layout.BOTTOM - bottom alignment 

 * @param {Integer} [dir] (zebra.layout.HORIZONTAL by default) a direction 
 * the component has to be placed in the layout
 
     zebra.layout.VERTICAL - vertical placed components
     zebra.layout.HORIZONTAL - horizontal placed components 

 * @param {Integer} [gap] a space in pixels between laid out components
 * @class  zebra.layout.FlowLayout
 * @constructor
 * @extends {zebra.layout.Layout}
 */
pkg.FlowLayout = Class(L, [
    function $prototype() {
        this.gap = 0;
        this.ax  = pkg.LEFT;
        this.ay  = pkg.TOP;
        this.direction = pkg.HORIZONTAL;

        //!!! few millisec speedup dirty trick
        this[''] =  function (ax,ay,dir,g){
            if (arguments.length == 1) this.gap = ax;
            else {
                if (arguments.length >= 2) {
                    this.ax = ax;
                    this.ay = ay;
                }

                if (arguments.length > 2)  {
                    if (dir != pkg.HORIZONTAL && dir != pkg.VERTICAL) {
                        throw new Error("Invalid direction " + dir);
                    }
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

/**
 * List layout places components vertically one by one 
  
        // create panel and set list layout for it
        var p = new zebra.ui.Panel();
        p.setLayout(new zebra.layout.ListLayout());

        // add three buttons into the panel with list layout 
        p.add(new zebra.ui.Button("Item 1"));
        p.add(new zebra.ui.Button("Item 2"));
        p.add(new zebra.ui.Button("Item 3"));
  
 * @param {Integer} [ax] horizontal list item alignment:
  
     zebra.layout.LEFT - left alignment 
     zebra.layout.RIGHT - right alignment 
     zebra.layout.CENTER - center alignment 
     zebra.layout.STRETCH - stretching item to occupy the whole horizontal space

 * @param {Integer} [gap] a space in pixels between laid out components
 * @class  zebra.layout.ListLayout
 * @constructor
 * @extends {zebra.layout.Layout}
 */
pkg.ListLayout = Class(L,[
    function $prototype() {
        this[''] = function (ax, gap) {
            if (arguments.length == 1) {
                gap = ax;
            }

            if (arguments.length <= 1) {
                ax = pkg.STRETCH;
            }

            if (arguments.length === 0) {
                gap = 0;
            }

            if (ax != pkg.STRETCH && ax != pkg.LEFT && 
                ax != pkg.RIGHT && ax != pkg.CENTER) 
            {
                throw new Error("Invalid alignment");
            }

            /**
             * Horizontal list items alignment 
             * @attribute ax
             * @type {Integer}
             * @readOnly
             */
            this.ax = ax;

            /**
             * Pixel gap between list items
             * @attribute gap
             * @type {Integer}
             * @readOnly
             */
            this.gap = gap;
        };

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

/**
 * Percent layout places components vertically or horizontally and 
 * sizes its according to its percentage constraints.
  
        // create panel and set percent layout for it
        var p = new zebra.ui.Panel();
        p.setLayout(new zebra.layout.PercentLayout());

        // add three buttons to the panel that are laid out horizontally with
        // percent layout according to its constraints: 20, 30 and 50 percents
        p.add(20, new zebra.ui.Button("20%"));
        p.add(30, new zebra.ui.Button("30%"));
        p.add(50, new zebra.ui.Button("50%"));
  
 * @param {Integer} [dir] a direction of placing components. The 
 * value can be "zebra.layout.HORIZONTAL" or "zebra.layout.VERTICAL" 
 * @param {Integer} [gap] a space in pixels between laid out components
 * @param {Boolean} [stretch] true if the component should be stretched 
 * vertically or horizontally
 * @class  zebra.layout.PercentLayout
 * @constructor
 * @extends {zebra.layout.Layout}
 */
pkg.PercentLayout = Class(L, [
    function ()         { this.$this(pkg.HORIZONTAL, 2); },
    function (dir, gap) { this.$this(dir, gap, true); },

    function (dir, gap, stretch){
        if (dir != pkg.HORIZONTAL && dir != pkg.VERTICAL) {
            throw new Error("Invalid direction");
        }
        this.dir = dir;
        this.gap = gap;
        this.stretch = stretch;
    },

    function $prototype() {
        /**
         * Pixel gap between components
         * @attribute gap
         * @readOnly
         * @type {Ineteger}
         */

        /**
         * Direction the components have to be placed (vertically or horizontally)
         * @attribute dir
         * @readOnly
         * @type {Ineteger}
         */

        this.doLayout = function(target){
            var right  = target.getRight(),
                top    = target.getTop(),
                bottom = target.getBottom(),
                left   = target.getLeft(),
                size   = target.kids.length,
                rs     = -this.gap * (size === 0 ? 0 : size - 1),
                loc    = 0,
                ns     = 0;

            if (this.dir == pkg.HORIZONTAL){
                rs += target.width - left - right;
                loc = left;
            }
            else{
                rs += target.height - top - bottom;
                loc = top;
            }

            for(var i = 0;i < size; i ++ ){
                var l = target.kids[i], c = l.constraints, useps = (c == pkg.USE_PS_SIZE);
                if (this.dir == pkg.HORIZONTAL){
                    ns = ((size - 1) == i) ? target.width - right - loc
                                           : (useps ? l.getPreferredSize().width
                                                      : ~~((rs * c) / 100));
                    var yy = top, hh = target.height - top - bottom;
                    if (this.stretch === false) {
                        var ph = hh;
                        hh = l.getPreferredSize().height;
                        yy = top + ~~((ph - hh) / 2);
                    }

                    l.setLocation(loc, yy);
                    l.setSize(ns, hh);
                }
                else {
                    ns = ((size - 1) == i) ? target.height - bottom - loc
                                           : (useps ? l.getPreferredSize().height
                                                    : ~~((rs * c) / 100));
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
            var max  = 0,
                size = target.kids.length,
                as   = this.gap * (size === 0 ? 0 : size - 1);

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

/**
 * Grid layout manager constraints. Constraints says how a  component has to be placed in 
 * grid layout virtual cell. The constraints specifies vertical and horizontal alignments, 
 * a virtual cell paddings, etc.
 * @param {Integer} ax a horizontal alignment 
 * @param {Integer} ay a vertical alignment
 * @constructor 
 * @class zebra.layout.Constraints
 */
pkg.Constraints = Class([
    function $prototype() {
        /**
         * Top cell padding
         * @attribute top
         * @type {Integer}
         * @default 0
         */

        /**
         * Left cell padding
         * @attribute left
         * @type {Integer}
         * @default 0
         */

        /**
         * Right cell padding
         * @attribute right
         * @type {Integer}
         * @default 0
         */

        /**
         * Bottom cell padding
         * @attribute bottom
         * @type {Integer}
         * @default 0
         */

        /**
         * Horizontal alignment
         * @attribute ax
         * @type {Integer}
         * @default zebra.layout.STRETCH
         */

        /**
         * Vertical alignment
         * @attribute ay
         * @type {Integer}
         * @default zebra.layout.STRETCH
         */

        this.top = this.bottom = this.left = this.right = 0;
        this.ay = this.ax = pkg.STRETCH;
        this.rowSpan = this.colSpan = 1;

        this[""] = function(ax, ay) {
            if (arguments.length > 0) {
                this.ax = ax;
                if (arguments.length > 1) this.ay = ay;
            }
        };

        /**
         * Set all four paddings (top, left, bottom, right) to the given value 
         * @param  {Integer} p a padding
         * @method setPadding
         */
        this.setPadding = function(p) {
            this.top = this.bottom = this.left = this.right = p;
        };

        /**
         * Set top, left, bottom, right paddings 
         * @param  {Integer} t a top padding
         * @param  {Integer} l a left padding
         * @param  {Integer} b a bottom padding
         * @param  {Integer} r a right padding
         * @method setPaddings
         */
        this.setPaddings = function(t,l,b,r) {
            this.top    = t;
            this.bottom = b;
            this.left   = l;
            this.right  = r;
        };
    }
]);

/**
 * Grid layout manager. can be used to split a component area to 
 * number of virtual cells where children components can be placed. 
 * The way how the children components have to be laid out in the cells can 
 * be customized by using "zebra.layout.Constraints" class:
 
        // create constraints
        var ctr = new zebra.layout.Constraints();
        
        // specify cell top, left, right, bottom paddings 
        ctr.setPadding(8);
        // say the component has to be left aligned in a 
        // virtual cell of grid layout 
        ctr.ax = zebra.layout.LEFT;

        // create panel and set grid layout manager with two 
        // virtual rows and columns
        var p = new zebra.ui.Panel();
        p.setLayout(new zebra.layout.GridLayout(2,2));

        // add children component
        p.add(ctr, new zebra.ui.Label("Cell 1,1"));
        p.add(ctr, new zebra.ui.Label("Cell 1,2"));
        p.add(ctr, new zebra.ui.Label("Cell 2,1"));
        p.add(ctr, new zebra.ui.Label("Cell 2,2"));

 * @param {Integer} rows a number of virtual rows to layout 
 * children components
 * @param {Integer} cols a number of virtual columns to 
 * layout children components
 * @constructor 
 * @class  zebra.layout.GridLayout
 * @extends {zebra.layout.Layout}
 */
pkg.GridLayout = Class(L, [
    function(r,c) { this.$this(r, c, 0); },

    function(r,c,m){
        /**
         * Number of virtual rows to place children components 
         * @attribute rows
         * @readOnly
         * @type {Integer}
         */
        this.rows = r;

        /**
         * Number of virtual columns to place children components 
         * @attribute cols
         * @readOnly
         * @type {Integer}
         */
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

        /**
         * Calculate the given row height
         * @param  {Integer} row a row
         * @param  {Integer} c the target container
         * @return {Integer} a size of the row
         * @method calcRowSize
         * @protected
         */
        this.calcRowSize = function(row, c){
            var max = 0, s = zebra.util.indexByPoint(row, 0, this.cols);
            for(var i = s; i < c.kids.length && i < s + this.cols; i ++ ){
                var a = c.kids[i];
                if (a.isVisible){
                    var arg = a.constraints || DEF_CONSTR, d = a.getPreferredSize().height;
                    d += (arg.top + arg.bottom);
                    max = (d > max ? d : max);
                }
            }
            return max;
        };

        /**
         * Calculate the given column width
         * @param  {Integer} col a column
         * @param  {Integer} c the target container
         * @return {Integer} a size of the column
         * @method calcColSize
         * @protected
         */
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

            if ((this.mask & pkg.HORIZONTAL) > 0) {
                var dw = c.width - left - c.getRight() - colSizes[cols];
                for(var i = 0;i < cols; i ++ ) {
                    colSizes[i] = colSizes[i] + (colSizes[i] !== 0 ? ~~((dw * colSizes[i]) / colSizes[cols]) : 0);
                }
            }

            if ((this.mask & pkg.VERTICAL) > 0) {
                var dh = c.height - top - c.getBottom() - rowSizes[rows];
                for(var i = 0;i < rows; i++) {
                    rowSizes[i] = rowSizes[i] + (rowSizes[i] !== 0 ? ~~((dh * rowSizes[i]) / rowSizes[rows]) : 0);
                }
            }

            var cc = 0;
            for (var i = 0;i < rows && cc < c.kids.length; i++) {
                var xx = left;
                for(var j = 0;j < cols && cc < c.kids.length; j++, cc++){
                    var l = c.kids[cc];
                    if(l.isVisible){
                        var arg = l.constraints || DEF_CONSTR,
                            d   = l.getPreferredSize(),
                            cellW = colSizes[j], cellH = rowSizes[i];

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

/**
 * @for
 */


})(zebra("layout"), zebra.Class);

(function(pkg, Class) {

var PI4 = Math.PI/4, PI4_3 = PI4 * 3, $abs = Math.abs, $atan2 = Math.atan2, L = zebra.layout;

pkg.TouchHandler = Class([
    function $prototype() {
        this.touchCounter = 0;

        this.start = function(e) {
            // fix android bug: parasite event for multi touch 
            // or stop capturing new touches since it is already fixed
            if (this.touchCounter > e.touches.length) return;

            if (this.timer == null) {
                var $this = this;
                this.timer = setTimeout(function() {
                    $this.Q();
                    $this.timer = null;
                }, 25);
            }

            // collect touches
            var t = e.touches;
            for(var i = 0; i < t.length; i++) {
                var tt = t[i];
                if (this.touches[tt.identifier] == null) {
                    this.touchCounter++;
                    var nt = {
                        pageX      : tt.pageX,
                        pageY      : tt.pageY,
                        identifier : tt.identifier,
                        target     : tt.target,
                        direction  : L.NONE,
                        dx         : 0,
                        dy         : 0,
                        dc         : 0,
                        group      : null
                    };
                    this.touches[tt.identifier] = nt;
                    this.queue.push(nt);
                }
            }
        };

        this.end = function(e) {
            if (this.timer != null) {
                clearTimeout(this.timer);
                this.timer = null;
            }

            this.Q();

            // update touches
            var t = e.changedTouches;
            for (var i = 0; i < t.length; i++) {
                var tt = this.touches[t[i].identifier];
                if (tt != null) {
                    this.touchCounter--;
                    if (tt.group != null) tt.group.active = false;
                    this.ended(tt);
                    delete this.touches[t[i].identifier];
                }
            }
        };

        this.Q = function() {
            if (this.queue.length > 1) {
                for(var i = 0; i < this.queue.length; i++) {
                    var t = this.queue[i];
                    t.group = {
                       size  : this.queue.length,
                       index : i,
                       active: true
                    };
                }
            }

            if (this.queue.length > 0) {
                for(var i = 0; i < this.queue.length; i++) {
                    this.started(this.queue[i]);
                }
                this.queue.length = 0;
            }
        };

        this[''] = function(element) {
            this.touches = {};
            this.queue   = [];
            this.timer   = null;

            var $this = this;
            element.addEventListener("touchstart",  function(e) {
                $this.start(e);
            }, false);

            element.addEventListener("touchend", function(e) {
                $this.end(e);
                e.preventDefault();
            }, false);

            element.addEventListener("touchmove", function(e) {
                var mt = e.changedTouches;

                // clear dx, dy for not updated touches 
                for(var k in $this.touches) {
                    $this.touches[k].dx = $this.touches[k].dy = 0;
                }

                for(var i=0; i < mt.length; i++) {
                    var nmt = mt[i], t = $this.touches[nmt.identifier];
                    if (t != null) {
                        if (t.pageX != nmt.pageX || t.pageY != nmt.pageY) {
                            var dx = nmt.pageX - t.pageX, dy = nmt.pageY - t.pageY, d = t.direction, gamma = null,
                                dxs = (dx < 0 && t.dx < 0) || (dx > 0 && t.dx > 0),  // test if horizontal move direction has been changed
                                dys = (dy < 0 && t.dy < 0) || (dy > 0 && t.dy > 0);  // test if vertical move direction has been changed

                            // update stored touch coordinates with a new one 
                            t.pageX  = nmt.pageX;
                            t.pageY  = nmt.pageY;

                            // we can recognize direction only if move was not too short
                            if ($abs(dx) > 2 || $abs(dy) > 2) {
                                // compute gamma, this is corner in polar coordinate system
                                gamma = $atan2(dy, dx);

                                // using gamma we can figure out direction
                                if (gamma > -PI4) {
                                    d = (gamma < PI4) ? L.RIGHT : (gamma < PI4_3 ? L.BOTTOM : L.LEFT);
                                }
                                else {
                                    d = (gamma > -PI4_3) ? L.TOP : L.LEFT;
                                }

                                // to minimize wrong touch effect let's update direction only if move event sequence 
                                // with identical direction is less than 3
                                if (t.direction != d) {
                                    if (t.dc < 3) t.direction = d;
                                    t.dc = 0;
                                }
                                else {
                                    t.dc++;
                                }
                                t.gamma = gamma;
                            }

                            if ($this.timer == null) {
                                t.dx = dx;
                                t.dy = dy;
                                $this.moved(t);
                            }
                            else {
                                $this.dc = 0;
                            }
                        }
                    }
                }
                e.preventDefault();
            }, false);
        };
    }
]);

})(zebra("ui"), zebra.Class);

(function(pkg, Class, Interface) {

/**
 * Zebra UI. The UI is powerful way to create any imaginable 
 * user interface for WEB. The idea is based on developing 
 * hierarchy of UI components that sits and renders on HTML5 
 * Canvas element.
 *
 * Write zebra UI code in safe place where you can be sure all 
 * necessary structure, configurations, etc are ready. The safe 
 * place is "zebra.ready(...)" method. Development of zebra UI 
 * application begins from creation "zebra.ui.zCanvas" class, 
 * that is starting point and root element of your UI components 
 * hierarchy. "zCanvas" is actually wrapper around HTML5 Canvas 
 * element where zebra UI sits on. The typical zebra UI coding 
 * template is shown below: 
       
     // build UI in safe place  
     zebra.ready(function() {
        // create canvas element 
        var c = new zebra.ui.zCanvas(400, 400);
            
        // start placing UI component on c.root panel
        //set layout manager
        c.root.setLayout(new zebra.layout.BorderLayout());            
        //add label to top
        c.root.add(zebra.layout.TOP,new zebra.ui.Label("Top label")); 
        //add text area to center
        c.root.add(zebra.layout.CENTER,new zebra.ui.TextArea(""));    
        //add button area to bottom
        c.root.add(zebra.layout.BOTTOM,new zebra.ui.Button("Button"));
        ...
     });
 
 *  The latest version of zebra JavaScript is available in repository:

        <script src='http://repo.zebkit.org/latest/zebra.min.js' 
                type='text/javascript'></script>
       
 * @module ui
 * @main ui
 * @requires zebra, util, io, data
 */

var instanceOf = zebra.instanceOf, L = zebra.layout, MB = zebra.util,
    $configurators = [],rgb = zebra.util.rgb, temporary = { x:0, y:0, width:0, height:0 },
    MS = Math.sin, MC = Math.cos, $fmCanvas = null, $fmText = null,
    $fmImage = null, $clipboard = null, $clipboardCanvas, $canvases = [],
    $ratio = typeof window.devicePixelRatio !== "undefined" ? window.devicePixelRatio
                                                            : (zebra.isIE ? window.screen.deviceXDPI / window.screen.logicalXDPI : 1);

pkg.clipboardTriggerKey = 0;

function $meX(e, d) { return d.graph.tX(e.pageX - d.offx, e.pageY - d.offy); }
function $meY(e, d) { return d.graph.tY(e.pageX - d.offx, e.pageY - d.offy); }

// canvases location has to be corrected if document layout is invalid 
function elBoundsUpdated() {
    for(var i = $canvases.length - 1; i >= 0; i--) {
        var c = $canvases[i];
        if (c.isFullScreen) {
            c.setLocation(0, 0);
            c.setSize(window.innerWidth, window.innerHeight);
        }
        c.recalcOffset();
    }
}

pkg.$view = function(v) {
    if (v == null) return null;

    if (v.paint) return v;

    if (zebra.isString(v)) {
        return rgb.hasOwnProperty(v) ? rgb[v]
                                     : (pkg.borders && pkg.borders.hasOwnProperty(v) ? pkg.borders[v]
                                                                                     : new rgb(v));
    }

    if (Array.isArray(v)) {
        return new pkg.CompositeView(v);
    }

    if (typeof v !== 'function') {
        return new pkg.ViewSet(v);
    }

    v = new pkg.View();
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

/**
 * View class that is designed as a basis for various reusable decorative 
 * UI elements implementations   
 * @class zebra.ui.View
 */
pkg.View = Class([
    function $prototype() {
        this.gap = 2;

        /**
         * Get left gap. The method informs UI component that uses the view as
         * a border view how much space left side of the border occupies 
         * @return {Integer} a left gap
         * @method getLeft
         */

         /**
          * Get right gap. The method informs UI component that uses the view as
          * a border view how much space right side of the border occupies 
          * @return {Integer} a right gap
          * @method getRight
          */
         
         /**
          * Get top gap. The method informs UI component that uses the view as
          * a border view how much space top side of the border occupies 
          * @return {Integer} a top gap
          * @method getTop
          */

          /**
           * Get bottom gap. The method informs UI component that uses the view as
           * a border view how much space bottom side of the border occupies 
           * @return {Integer} a bottom gap
           * @method getBottom
           */
        this.getRight = this.getLeft = this.getBottom = this.getTop = function() {
            return this.gap;
        };

        /**
        * Return preferred size the view desires to have
        * @method getPreferredSize
        * @return {Object}
        */
        this.getPreferredSize = function() { return { width:0, height:0 }; };

        /**
        * The method is called to render the decorative element on the 
        * given surface of the specified UI component
        * @param {Canvas 2D context} g  graphical context
        * @param {Integer} x  x coordinate
        * @param {Integer} y  y coordinate
        * @param {Integer} w  required width  
        * @param {Integer} h  required height
        * @param {zebra.ui.Panel} c an UI component on which the view 
        * element has to be drawn 
        * @method paint
        */
        this.paint = function(g,x,y,w,h,c) {};
    }
]);

/**
 * Render class extends "zebra.ui.View" class with a notion 
 * of target object. Render stores reference  to a target that 
 * the render knows how to visualize. Basically Render is an 
 * object visualizer. For instance, developer can implement 
 * text, image and so other objects visualizers. 
 * @param {Object} target a target object to be visualized 
 * with the render
 * @constructor
 * @extends zebra.ui.View 
 * @class zebra.ui.Render
 */
pkg.Render = Class(pkg.View, [
    function $prototype() {
        /**
         * Target component to be visualized  
         * @attribute target
         * @default null
         * @readOnly
         * @type {Object}
         */

        this[''] = function(target) {
            this.setTarget(target);
        };

        /**
         * Set the given target object. The method triggers 
         * "targetWasChanged(oldTarget, newTarget)" execution if 
         * the method is declared. Implement the method if you need 
         * to track a target object updating. 
         * @method setTarget
         * @param  {Object} o a target object to be visualized 
         */
        this.setTarget = function(o) {
            if (this.target != o) {
                var old = this.target;
                this.target = o;
                if (this.targetWasChanged) this.targetWasChanged(old, o);
            }
        };
    }
]);

/**
* Raised border view
* @class zebra.ui.Raised
* @param {String} [brightest] a brightest border line color 
* @param {String} [middle] a middle border line color 
* @constructor
* @extends zebra.ui.View 
*/
pkg.Raised = Class(pkg.View, [
    /**
     * Brightest border line color
     * @attribute brightest
     * @readOnly
     * @type {String}
     * @default "white"
     */

    /**
     * Middle border line color
     * @attribute middle
     * @readOnly
     * @type {String}
     * @default "gray"
     */

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

/**
* Sunken border view
* @class zebra.ui.Sunken
* @constructor
* @param {String} [brightest] a brightest border line color 
* @param {String} [moddle] a middle border line color 
* @param {String} [darkest] a darkest border line color 
* @extends zebra.ui.View 
*/
pkg.Sunken = Class(pkg.View, [
    function () { this.$this(pkg.lightBrColor, pkg.midBrColor, pkg.darkBrColor); },

    function (brightest,middle,darkest) {
        /**
         * Brightest border line color
         * @attribute brightest
         * @readOnly
         * @type {String}
         * @default "white"
         */

        /**
         * Middle border line color
         * @attribute middle
         * @readOnly
         * @type {String}
         * @default "gray"
         */

        /**
         * Darkest border line color
         * @attribute darkest
         * @readOnly
         * @type {String}
         * @default "black"
         */

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

/**
* Etched border view
* @class zebra.ui.Etched
* @constructor
* @param {String} [brightest] a brightest border line color 
* @param {String} [moddle] a middle border line color 
* @extends zebra.ui.View 
*/
pkg.Etched = Class(pkg.View, [
    function () { this.$this(pkg.lightBrColor, pkg.midBrColor); },

    function (brightest,middle) {
        /**
         * Brightest border line color
         * @attribute brightest
         * @readOnly
         * @type {String}
         * @default "white"
         */

        /**
         * Middle border line color
         * @attribute middle
         * @readOnly
         * @type {String}
         * @default "gray"
         */

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

/**
* Dotted border view
* @class zebra.ui.Dotted
* @param {String} [c] the dotted border color
* @constructor
* @extends zebra.ui.View 
*/
pkg.Dotted = Class(pkg.View, [
    /**
     * @attribute color
     * @readOnly
     * @type {String}
     * @default "black"
     */

    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            g.setColor(this.color);
            g.drawDottedRect(x, y, w, h);
        };

        this[''] = function (c){
            this.color = (c == null) ? "black" : c;
        };
    }
]);

/**
 * Border view. Can be used to render CSS-like border.
 * @param  {String}  [c] border color 
 * @param  {Integer} [w] border width
 * @param  {Integer} [r] border corners radius
 * @constructor
 * @class zebra.ui.Border
 * @extends zebra.ui.View 
 */
pkg.Border = Class(pkg.View, [
    function $prototype() {
        /**
         * Border color
         * @attribute color
         * @readOnly
         * @type {String}
         * @default "gray"
         */

        /**
         * Border line width
         * @attribute width
         * @readOnly
         * @type {Integer}
         * @default 1
         */

        /**
         * Border radius
         * @attribute radius
         * @readOnly
         * @type {Integer}
         * @default 0
         */
        
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

        /**
         * Defines border outline for the given 2D Canvas context
         * @param  {2D Canvas context} g
         * @param  {Integer} x x coordinate
         * @param  {Integer} y y coordinate
         * @param  {Integer} w required width
         * @param  {Integer} h required height
         * @param  {Integer} d target UI component
         * @method outline
         * @return {Boolean} true if the outline has to be applied as an UI component shape 
         */
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
            this.color  = (arguments.length === 0) ? "gray" : c;
            this.width  = (w == null) ? 1 : w;
            this.radius = (r == null) ? 0 : r;
            this.gap = this.width + Math.round(this.radius / 4);
        };
    }
]);

/**
 * Round border view.
 * @param  {String}  [col] border color. Use null as the 
 * border color value to prevent painting of the border 
 * @param  {Integer} [width] border width
 * @constructor
 * @class zebra.ui.RoundBorder
 * @extends zebra.ui.View
 */
pkg.RoundBorder = Class(pkg.View, [
    function $prototype() {
        /**
         * Border color
         * @attribute color
         * @readOnly
         * @type {String}
         * @default null
         */

        /**
         * Border width
         * @attribute width
         * @readOnly
         * @type {Integer}
         * @default 1
         */

        this.paint =  function(g,x,y,w,h,d) {
            if (this.color != null && this.width > 0) {
                this.outline(g,x,y,w,h,d);
                g.setColor(this.color);
                g.stroke();
            }
        };

        this.outline = function(g,x,y,w,h,d) {
            g.beginPath();
            g.lineWidth = this.width;
            g.arc(x + w/2, y + h/2, w/2, 0, 2*Math.PI, false);
            return true;
        };

        this[''] = function(col, width) {
            this.color = null;
            this.width  = 1;

            if (arguments.length > 0) {
                if (zebra.isNumber(col)) this.width = col;
                else {
                    this.color = col;
                    if (zebra.isNumber(width)) this.width = width;
                }
            }
            this.gap = this.width;
        };
    }
]);

/**
* Vertical or horizontal linear gradient view
* @param {String} startColor start color
* @param {String} endColor end color
* @param {Integer} [type] type of gradient 
* "zebra.layout.VERTICAL" or "zebra.layout.HORIZONTAL"
* @constructor
* @class zebra.ui.Gradient
* @extends zebra.ui.View
*/
pkg.Gradient = Class(pkg.View, [
    /**
     * Gradient orientation: vertical or horizontal
     * @attribute orientation 
     * @readOnly
     * @default zebra.layout.VERTICAL
     * @type {Integer}
     */

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
                this.gx2 != x2        || this.gy1 != y1 || 
                this.gy2 != y2                             )
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

/**
* Radial gradient view
* @param {String} startColor a start color
* @param {String} stopColor a stop color
* @constructor
* @class zebra.ui.Radial
* @extends zebra.ui.View
*/
pkg.Radial = Class(pkg.View, [
    function $prototype() {
        this[''] =  function(){
            this.colors = Array.prototype.slice.call(arguments, 0);
        };

        this.paint = function(g,x,y,w,h,d){
            var cx1 = w/2, cy1 = w/2;
            this.gradient = g.createRadialGradient(cx1, cy1, 10, cx1, cy1, w < h ? w : h);
            for(var i=0;i<this.colors.length;i++) {
                this.gradient.addColorStop(i, this.colors[i].toString());
            }
            g.fillStyle = this.gradient;
            g.fillRect(x, y, w, h);
        };
    }
]);

/**
* Image render. Render an image target object or specified area of 
* the given target image object.
* @param {Image} img the image to be rendered
* @param {Integer} [x] a x coordinate of the rendered image part
* @param {Integer} [y] a y coordinate of the rendered image part
* @param {Integer} [w] a width of the rendered image part 
* @param {Integer} [h] a height of the rendered image part
* @param {Boolean} [ub] a boolean flag to say if the rendered 
* image has to be double buffered
* @constructor
* @class zebra.ui.Picture
* @extends zebra.ui.Render
*/
pkg.Picture = Class(pkg.Render, [
    function $prototype() {
        this[""] = function (img,x,y,w,h,ub) {
            /**
             * A x coordinate of the image part that has to be rendered
             * @attribute x
             * @readOnly
             * @type {Integer}
             * @default 0
             */

            /**
             * A y coordinate of the image part that has to be rendered
             * @attribute y
             * @readOnly
             * @type {Integer}
             * @default 0
             */

            /**
             * A width  of the image part that has to be rendered
             * @attribute width
             * @readOnly
             * @type {Integer}
             * @default 0
             */

            /**
             * A height  of the image part that has to be rendered
             * @attribute height
             * @readOnly
             * @type {Integer}
             * @default 0
             */

            this.setTarget(img);
            if (arguments.length > 4) {
                this.x = x;
                this.y = y;
                this.width  = w;
                this.height = h;
            }
            else {
                this.x = this.y = this.width = this.height = 0;
            }

            if (zebra.isBoolean(arguments[arguments.length-1]) === false) {
                ub = w > 0 && h > 0 && w < 64 && h < 64;
            }

            if (ub === true) {
                this.buffer = document.createElement("canvas");
                this.buffer.width = 0;
            }
        };

        this.paint = function(g,x,y,w,h,d){
            if (this.target != null && w > 0 && h > 0){
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

                if (this.width > 0 && !this.buffer) {
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

/**
* Pattern render. 
* @class zebra.ui.Pattern
* @param {Image} [img] an image to be used as the pattern
* @constructor
* @extends zebra.ui.Render
*/
pkg.Pattern = Class(pkg.Render, [
    function $prototype() {
        this.paint = function(g,x,y,w,h,d) {
            if (this.pattern == null) {
                this.pattern = g.createPattern(this.target, 'repeat');
            }
            g.rect(x, y, w, h);
            g.fillStyle = this.pattern;
            g.fill();
        };
    }
]);

/**
* Composite view. The view allows developers to combine number of 
* views and renders its together. 
* @class zebra.ui.CompositeView
* @param {Arrayt|Object} [views] array of dictionary of views 
* to be composed together 
* @constructor
* @extends zebra.ui.View
*/
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
        };

        this[''] = function() {
            this.views = [];
            var args = arguments.length == 1 ? arguments[0] : arguments;
            for(var i = 0; i < args.length; i++) {
                this.views[i] = pkg.$view(args[i]);
                this.$recalc(this.views[i]);
            }
        };
    }
]);

/**
* ViewSet view. The view set is a special view container that includes 
* number of views accessible by a key and allows only one view be active 
* in a particular time. Active is view that has to be rendered. The view 
* set can be used to store number of decorative elements where only one 
* can be rendered depending from an UI component state.
* @param {Object} args object that represents views instances that have 
* to be included in the ViewSet   
* @constructor
* @class zebra.ui.ViewSet
* @extends zebra.ui.CompositeView
*/
pkg.ViewSet = Class(pkg.CompositeView, [
    function $prototype() {
        this.paint = function(g,x,y,w,h,d) {
            if (this.activeView != null) {
                this.activeView.paint(g, x, y, w, h, d);
            }
        };

        /**
         * Activate the given view from the given set. 
         * @param  {String} id a key of a view from the set to be activated
         * @method activate
         */
        this.activate = function (id){
            var old = this.activeView;
            if (this.views.hasOwnProperty(id)) {
                return (this.activeView = this.views[id]) != old;
            }
            else {
                if (id.length > 1 && id[0] != '*' && id[id.length-1] != '*') {
                    var i = id.indexOf('.');
                    if (i > 0) {
                        var k = id.substring(0, i + 1).concat('*');
                        if (this.views.hasOwnProperty(k)) {
                            return (this.activeView = this.views[k]) != old;
                        }
                        else {
                            k = "*" + id.substring(i);
                            if (this.views.hasOwnProperty(k)) {
                                return (this.activeView = this.views[k]) != old;
                            }
                        }
                    }
                }
            }

            if (this.views.hasOwnProperty("*")) {
                return (this.activeView = this.views["*"]) != old;
            }
            return false;
        };

        this[''] = function(args) {
            if (args == null) {
                throw new Error("Invalid null view set");
            }

            /**
             * Views set
             * @attribute views
             * @type Object
             * @default {}
             * @readOnly
            */
            this.views = {};

            /**
             * Active in the set view 
             * @attribute activeView
             * @type View
             * @default null
             * @readOnly
            */
            this.activeView = null;

            for(var k in args) {
                this.views[k] = pkg.$view(args[k]);
                if (this.views[k]) this.$recalc(this.views[k]);
            }
            this.activate("*");
        };
    }
]);

pkg.Bag = Class(zebra.util.Bag, [
    function $prototype() {
        this.usePropertySetters =  true; //false;

        this.contentLoaded = function(v) {
            if (v == null || zebra.isNumber(v) || zebra.isBoolean(v)) return v;
            if (zebra.isString(v)) {
                if (this.root && v[0] == "%" && v[1] == "r") {
                    var s = "%root%/";
                    if (v.indexOf(s) === 0) {
                        return this.root.join(v.substring(s.length));
                    }
                }
                return v;
            }

            if (Array.isArray(v)) {
                for (var i = 0; i < v.length; i++) {
                    v[i] = this.contentLoaded(v[i]);
                }
                return v;
            }

            for (var k in v) {
                if (v.hasOwnProperty(k)) v[k] = this.contentLoaded(v[k]);
            }
            return v;
        };
    },

    function loadByUrl(url, b) {
        this.root = null;
        if (zebra.URL.isAbsolute(url)) {
            this.root = (new zebra.URL(url)).getParentURL();
        }
        this.$super(url, b);
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
    return l != null && l.isVisible ? l.getPreferredSize() 
                                    : { width:0, height:0 };
};

var $cvp = pkg.$cvp = function(c, r) {
    if (c.width > 0 && c.height > 0 && c.isVisible){
        var p = c.parent, px = -c.x, py = -c.y;
        if (r == null) r = { x:0, y:0, width:0, height:0 };
        else r.x = r.y = 0;
        r.width  = c.width;
        r.height = c.height;

        while (p != null && r.width > 0 && r.height > 0) {
            var xx = r.x > px ? r.x : px,
                yy = r.y > py ? r.y : py,
                w1 = r.x + r.width,
                w2 = px  + p.width,
                h1 = r.y + r.height,
                h2 = py + p.height;

            r.width  = (w1 < w2 ? w1 : w2) - xx,
            r.height = (h1 < h2 ? h1 : h2) - yy;
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

pkg.configure = function(c) {
    if (zebra.isString(c)) {
        var path = c;
        c = function(conf) {
            conf.loadByUrl(path, false);
        };
    }
    $configurators.push(c);
};

/**
 * This class represents a font and provides basic font metrics like 
 * height, ascent. Using the class developers can compute string width.
      
      // plain font 
      var f = new zebra.ui.Font("Arial", 14);

      // bold font
      var f = new zebra.ui.Font("Arial", "bold", 14);

      // defining font with CSS font name
      var f = new zebra.ui.Font("100px Futura, Helvetica, sans-serif");

 * @constructor
 * @param {String} name a name of the font. If size and style parameters 
 * has not been passed the name is considered as CSS font name that 
 * includes size and style
 * @param {String} [style] a style of the font: "bold", "italic", etc
 * @param {Integer} [size] a size of the font
 * @class zebra.ui.Font
 */
pkg.Font = function(name, style, size) {
    if (arguments.length == 1) {
        name = name.replace(/[ ]+/, ' ');
        this.s = name.trim();
    }
    else {
        if (arguments.length == 2) {
            size = style;
            style = '';
        }
        style = style.trim();

        this.s = [   style, (style !== '' ? ' ' : ''),
                     size, 'px ',
                     name
                 ].join('');
    }
    $fmText.style.font = this.s;

    /**
     * Height of the font
     * @attribute height 
     * @readOnly
     * @type {Integer}
     */
    this.height = $fmText.offsetHeight;

    //!!!
    // Something weird is going sometimes in IE10 !
    // Sometimes the property  offsetHeight is 0 but 
    // second attempt to access to the property gives
    // proper result
    if (this.height === 0) {
        this.height = $fmText.offsetHeight;
    }

    /**
     * Ascent of the font 
     * @attribute ascent 
     * @readOnly
     * @type {Integer}
     */
    this.ascent = $fmImage.offsetTop - $fmText.offsetTop + 1;
};

/**
 * Calculate the given string width in pixels 
 * @param  {String} s a string whose width has to be computed 
 * @return {Integer} a string size in pixels 
 * @method stringWidth
 * @for zebra.ui.Font 
 */
pkg.Font.prototype.stringWidth = function(s) {
    if (s.length === 0) return 0;
    if ($fmCanvas.font != this.s) $fmCanvas.font = this.s;
    return ($fmCanvas.measureText(s).width + 0.5) | 0;
};

/**
 * Calculate the specified substring width
 * @param  {String} s a string 
 * @param  {Integer} off fist character index
 * @param  {Integer} len length of substring
 * @return {Integer} a substring size in pixels 
 * @method charsWidth
 * @for zebra.ui.Font 
 */
pkg.Font.prototype.charsWidth = function(s, off, len) {
    if ($fmCanvas.font != this.s) $fmCanvas.font = this.s;
    return ($fmCanvas.measureText(len == 1 ? s[off] : s.substring(off, off + len)).width + 0.5) | 0;
};

/**
 * Returns CSS font representation
 * @return {String} a CSS representation of the given Font  
 * @method toString
 * @for zebra.ui.Font 
 */
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

/**
* Mouse and touch screen listener interface to express intention to 
* handle mouse or touch screen events
* @class zebra.ui.MouseListener 
* @interface
*/

/**
* The method is called when a mouse button has been pressed or 
* a finger has touched a touch screen
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mousePressed
*/

/**
* The method is called when a mouse button has been released or 
* a finger has untouched a touch screen
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mouseReleased
*/

/**
* The method is called when a mouse cursor has been moved with 
* no one mouse button has been pressed
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mouseMoved
*/

/**
* The method is called when a mouse cursor entered the given component
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mouseEntered
*/

/**
* The method is called when a mouse cursor exited the given component
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mouseExited
*/

/**
* The method is called when a mouse button has been clicked. Click events
* are generated only if no one mouse moved or drag events has been generated
* in between mouse pressed -> mouse released events sequence. 
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mouseClicked
*/

/**
* The method is called when a mouse cursor has been moved when a mouse button 
* has been pressed. Or when a finger has been moved over a touch screen.
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mouseDragged
*/

/**
* The method is called when a mouse cursor has been moved first time when a mouse button 
* has been pressed. Or when a finger has been moved first time over a touch screen.
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mouseDragStarted
*/

/**
* The method is called when a mouse cursor has been moved last time when a mouse button 
* has been pressed. Or when a finger has been moved last time over a touch screen.
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mouseDragEnded
*/
var MouseListener  = pkg.MouseListener = Interface(),

/**
 * Focus listener interface to express intention to handle focus events
 * @class zebra.ui.FocusListener 
 * @interface
 */

/**
 * The method is called when a component has gained focus 
 * @optional
 * @param {zebra.ui.InputEvent} e an input event
 * @method  focusGained
 */

/**
 * The method is called when a component has lost focus 
 * @optional
 * @param {zebra.ui.InputEvent} e an input event
 * @method  focusLost
 */
FocusListener = pkg.FocusListener = Interface(),

/**
 * Key listener interface to express intention to handle key events
 * @class zebra.ui.KeyListener
 * @interface
 */

/**
 * The method is called when a key has been pressed
 * @optional
 * @param {zebra.ui.KeyEvent} e a key event
 * @method  keyPressed
 */

/**
 * The method is called when a key has been typed
 * @optional
 * @param {zebra.ui.KeyEvent} e a key event
 * @method  keyTyped
 */

/**
 * The method is called when a key has been released 
 * @optional
 * @param {zebra.ui.KeyEvent} e a key event
 * @method  keyReleased
 */

/**
 * The method is called when a key has been pressed
 * @optional
 * @param {zebra.ui.KeyEvent} e a key event
 * @method  keyPressed
 */
KeyListener = pkg.KeyListener = Interface(),

/**
 * Interface to express intention to control children UI components event handling by 
 * making them events transparent
 * @class zebra.ui.Composite 
 * @interface
 */

/**
 * The method is called to ask if the given children UI component 
 * has to be events transparent
 * @optional
 * @param {zebra.ui.Panel} c a children UI component
 * @return {Boolean} true if the given children component has 
 * to be events transparent
 * @method catchInput
 */
Composite = pkg.Composite = Interface(),

/**
 * Interface to express intention to handle children UI components events
 * @class zebra.ui.ChildrenListener 
 * @interface
 */

/**
 * The method is called when an input event has occurred in the children component 
 * @optional
 * @param {zebra.ui.InputEvent} e an input event that has occurred in a children 
 * UI component
 * @method childInputEvent
 */
ChildrenListener = pkg.ChildrenListener = Interface(),

/**
 * Interface to express intention to participate in native clipboard copy-paste actions. 
 * A component that implements it and has focus can get / send data into / from clipboard
 * @class zebra.ui.CopyCutPaste
 * @interface
 */    

/**
 * The method is called to ask return a string that has to be put into clipboard 
 * @optional
 * @return {String} a string to copy in native clipboard 
 * @method copy
 */

/**
 * The method is called to pass string from clipboard to a component 
 * "CopyCutPaste" interface implements
 * @optional
 * @param {String} s a string from native clipboard
 * @method paste
 */
CopyCutPaste = pkg.CopyCutPaste = Interface(),

/**
 * Interface to express intention to catch component events
 * @class zebra.ui.ComponentListener
 * @interface
 */

/**
 * The method is called when a component has been re-sized
 * @optional
 * @param {zebra.ui.Panel} c a component that has been sized
 * @param {Integer} pw a previous width the sized component had
 * @param {Integer} ph a previous height the sized component had
 * @method compSized
 */

/**
 * The method is called when a component has been re-located
 * @optional
 * @param {zebra.ui.Panel} c a component that has been moved
 * @param {Integer} px a previous x coordinate the moved component had
 * @param {Integer} py a previous y coordinate the moved component had
 * @method compMoved
 */

/**
 * The method is called when a component enabled state has been updated
 * @optional
 * @param {zebra.ui.Panel} c a component whose enabled state has been updated
 * @method compEnabled
 */

/**
 * The method is called when a component visibility state has been updated
 * @optional
 * @param {zebra.ui.Panel} c a component whose visibility state has been updated
 * @method compShown
 */

/**
 * The method is called when a component has been inserted into another UI component
 * @optional
 * @param {zebra.ui.Panel} p a parent component of the component has been added
 * @param {Object} constr a layout constraints 
 * @param {zebra.ui.Panel} c a component that has been added
 * @method compAdded
 */

/**
 * The method is called when a component has been removed from its parent UI component
 * @optional
 * @param {zebra.ui.Panel} p a parent component of the component that has been removed
 * @param {zebra.ui.Panel} c a component that has been removed 
 * @method compRemoved
 */
CL = pkg.ComponentListener = Interface();

CL.ENABLED  = 1;
CL.SHOWN    = 2;
CL.MOVED    = 3;
CL.SIZED    = 4;
CL.ADDED    = 5;
CL.REMOVED  = 6;


/**
 * Input event class. Input event is everything what is bound to user 
 * inputing like keyboard, mouse, touch screen etc. This class often is 
 * used as basis for more specialized input event classes.  
 * @param {zebra.ui.Panel} target a source of the input event
 * @param {Integer} id an unique ID of the input event, for 
 * instance zebra.ui.KeyEvent.PRESSED
 * @param {Integer} uid an unique class id of the input event, 
 * for instance zebra.ui.InputEvent.MOUSE_UID
 * @class  zebra.ui.InputEvent
 * @constructor
 */
var IE = pkg.InputEvent = Class([
    function $clazz() {
        this.MOUSE_UID    = 1;
        this.KEY_UID      = 2;
        this.FOCUS_UID    = 3;
        this.FOCUS_LOST   = 10;
        this.FOCUS_GAINED = 11;
    },

    function (target, id, uid) {
        /**
         * Source of the input event
         * @attribute source
         * @readOnly
         * @type {zebra.ui.Panel}
         */
        this.source = target;

        /**
         * Unique id of the input event
         * @attribute ID
         * @readOnly
         * @type {Integer}
         */
        this.ID = id;

        /**
         * Class id of the input event. It helps to differentiates 
         * input events by a device it has been generated 
         * @attribute UID
         * @readOnly
         * @type {Integer}
         */
        this.UID = uid;
    }
]);

/**
 * Input key event class. The input event is triggered by a 
 * keyboard and has UID property set to zebra.ui.InputEvent.KEY_UID 
 * value 
 * @param {zebra.ui.Panel} target a source of the key input event
 * @param {Integer} id an unique ID of the key input event: zebra.ui.KeyEvent.PRESSED, 
 * zebra.ui.KeyEvent.TYPED, zebra.ui.KeyEvent.RELEASED
 * @param {Integer} code a code of pressed key
 * @param {String} ch a character of typed key
 * @param {Integer} mask a bits mask of pressed meta keys:  zebra.ui.KeyEvent.M_CTRL, 
 * zebra.ui.KeyEvent.M_SHIFT, zebra.ui.KeyEvent.M_ALT, zebra.ui.KeyEvent.M_CMD
 * @class  zebra.ui.KeyEvent
 * @extends zebra.ui.InputEvent
 * @constructor
 */
var KE = pkg.KeyEvent = Class(IE, [
    function $clazz() {
        this.TYPED    = 15;
        this.RELEASED = 16;
        this.PRESSED  = 17;

        this.M_CTRL  = 1;
        this.M_SHIFT = 2;
        this.M_ALT   = 4;
        this.M_CMD   = 8;
    },

    function $prototype() {
        this.reset = function(target,id,code,ch,mask){
            this.source = target;
            this.ID     = id;

            /**
             * A code of a pressed key
             * @attribute code
             * @readOnly
             * @type {Integer}
             */
            this.code = code;
            
            /**
             * A bits mask of pressed meta keys (CTRL, ALT, etc)
             * @attribute mask
             * @readOnly
             * @type {Integer}
             */
            this.mask = mask;

            /**
             * A character of a typed key
             * @attribute ch
             * @readOnly
             * @type {String}
             */
            this.ch = ch;
        };

        /**
         * Test if CTRL key is held
         * @return {Boolean} true if CTRL key is held
         * @method isControlPressed 
         */
        this.isControlPressed = function(){
            return (this.mask & KE.M_CTRL) > 0;
        };
        
        /**
         * Test if SHIFT key is held
         * @return {Boolean} true if SHIFT key is held
         * @method isShiftPressed 
         */
        this.isShiftPressed   = function() {
            return (this.mask & KE.M_SHIFT) > 0;
        };

        /**
         * Test if ALT key is held
         * @return {Boolean} true if ALT key is held
         * @method isAltPressed 
         */
        this.isAltPressed  = function(){
            return (this.mask & KE.M_ALT) > 0;
        };
        
        /**
         * Test if command (windows) key is held
         * @return {Boolean} true if command key is held
         * @method isCmdPressed 
         */
        this.isCmdPressed = function(){
            return (this.mask & KE.M_CMD) > 0;
        };
    },

    function (target,id,code,ch,mask){
        this.$super(target, id, IE.KEY_UID);
        this.reset(target, id, code, ch, mask);
    }
]);

/**
 * Mouse and touch screen input event class. The input event is 
 * triggered by a mouse or touch screen. It has UID property set 
 * to zebra.ui.InputEvent.MOUSE_UID value 
 * @param {zebra.ui.Panel} target a source of the mouse input event
 * @param {Integer} id an unique ID of the mouse input event: 
 
        zebra.ui.MouseEvent.CLICKED    
        zebra.ui.MouseEvent.PRESSED    
        zebra.ui.MouseEvent.RELEASED   
        zebra.ui.MouseEvent.ENTERED    
        zebra.ui.MouseEvent.EXITED     
        zebra.ui.MouseEvent.DRAGGED    
        zebra.ui.MouseEvent.DRAGSTARTED
        zebra.ui.MouseEvent.DRAGENDED  
        zebra.ui.MouseEvent.MOVED      
  
 * @param {Integer} ax an absolute (relatively to a canvas where the source 
 * UI component is hosted) mouse pointer x coordinate 
 * @param {Integer} ax an absolute (relatively to a canvas where the source 
 * UI component is hosted) mouse pointer y coordinate
 * @param {Integer} mask a bits mask of pressed mouse buttons:
 
         zebra.ui.MouseEvent.LEFT_BUTTON
         zebra.ui.MouseEvent.RIGHT_BUTTON
         
 * @param {Integer} clicks number of mouse button clicks 
 * @class  zebra.ui.MouseEvent
 * @extends zebra.ui.InputEvent
 * @constructor
 */
var ME = pkg.MouseEvent = Class(IE, [
    function $clazz() {
        this.CLICKED      = 21;
        this.PRESSED      = 22;
        this.RELEASED     = 23;
        this.ENTERED      = 24;
        this.EXITED       = 25;
        this.DRAGGED      = 26;
        this.DRAGSTARTED  = 27;
        this.DRAGENDED    = 28;
        this.MOVED        = 29;

        this.LEFT_BUTTON  = 128;
        this.RIGHT_BUTTON = 512;
    },

    function $prototype() {
        this.touchCounter = 1;

        /**
         * Absolute mouse pointer x coordinate
         * @attribute absX
         * @readOnly
         * @type {Integer}
         */

        /**
         * Absolute mouse pointer y coordinate
         * @attribute absY
         * @readOnly
         * @type {Integer}
         */

        /**
         * Mouse pointer x coordinate (relatively to source UI component)
         * @attribute x
         * @readOnly
         * @type {Integer}
         */

        /**
         * Mouse pointer y coordinate (relatively to source UI component)
         * @attribute y
         * @readOnly
         * @type {Integer}
         */

        /**
         * Number of times a mouse button has been pressed
         * @attribute clicks
         * @readOnly
         * @type {Integer}
         */

        /**
         * Number of fingers on a touch screen
         * @attribute touchCounter
         * @readOnly
         * @type {Integer}
         */
      
        /**
         * A bits mask of a pressed mouse button
         * @attribute mask
         * @readOnly
         * @type {Integer}
         */

        /**
         * Reset the event properties with new values 
         * @private
         * @param  {zebra.ui.Panel} target  a target component that triggers the event
         * @param  {Ineteger} id an unique id of the event
         * @param  {Ineteger} ax an absolute (relatively to a canvas where the target 
         * component is hosted) x mouse cursor coordinate
         * @param  {Ineteger} ay an absolute (relatively to a canvas where the target 
         * component is hosted) y mouse cursor coordinate
         * @param  {Ineteger} mask   a pressed mouse buttons mask 
         * @param  {Ineteger} clicks number of a button clicks
         * @method  reset
         */
        this.reset = function(target,id,ax,ay,mask,clicks){
            this.source = target;
            this.ID     = id;
            this.absX   = ax;
            this.absY   = ay;
            this.mask   = mask;
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
            return this.mask == ME.LEFT_BUTTON;
        };
    },

    function (target,id,ax,ay,mask,clicks){
        this.$super(target, id, IE.MOUSE_UID);
        this.reset(target, id, ax, ay, mask, clicks);
    }
]);

var MDRAGGED = ME.DRAGGED, EM = null, MMOVED = ME.MOVED, MEXITED = ME.EXITED,
    KPRESSED = KE.PRESSED, MENTERED = ME.ENTERED,
    context = Object.getPrototypeOf(document.createElement('canvas').getContext('2d')),
    $mousePressedEvents = {}, $keyPressedCode = -1, $keyPressedOwner = null,
    $keyPressedModifiers = 0, KE_STUB = new KE(null,  KPRESSED, 0, 'x', 0),
    ME_STUB = new ME(null, ME.PRESSED, 0, 0, 0, 1);

pkg.paintManager = pkg.events = pkg.$mouseMoveOwner = null;

// !!!!
// the document mouse up happens when we drag outside a canvas
// in this case canvas doesn't get mouse up, so we do it by global 
// mouseup handler
document.addEventListener("mouseup", function(e) {
    for(var k in $mousePressedEvents) {
        var mp = $mousePressedEvents[k];
        if (mp.canvas != null) {
            mp.canvas.mouseReleased(k, mp);
        }
    }
},  false);

// !!!
// override alert to keep control on event sequence, it is very 
// browser dependent
var $alert = (function(){ return this.alert; }());
window.alert = function() {
    if ($keyPressedCode > 0) {
        KE_STUB.reset($keyPressedOwner, KE.RELEASED, 
                      $keyPressedCode, '', $keyPressedModifiers);
        EM.performInput(KE_STUB);
        $keyPressedCode = -1;
    }
    $alert.apply(window, arguments);
    for(var k in $mousePressedEvents) {
        var mp = $mousePressedEvents[k];
        if (mp.canvas != null) {
            mp.canvas.mouseReleased(k, mp);
        }
    }
};

//!!!! debug 
// var debugOff = false, shift = [];
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
        var idx  = i % count;
            dl   = dist < pattern[idx] ? dist : pattern[idx],
            step = Math.sqrt(dl * dl / (1 + slope * slope)) * sign;
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
    if (dw > 0 && dh > 0){
        if (dw - ll - rr > w){
            var xx = x + px;
            if(xx < ll) px += (ll - xx);
            else {
                xx += w;
                if (xx > dw - rr) px -= (xx - dw + rr);
            }
        }
        if (dh - tt - bb > h){
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

/**
 * Load an image by the given URL. 
 * @param  {String} path an URL
 * @param  {Function} ready a call back method to be notified when the 
 * image has been completely loaded or failed. The method gets three parameters
    
    - an URL to the image
    - boolean loading result. true means success
    - an image that has been loaded 

            // load image
            zebra.ui.loadImage("test.png", function(path, result, image) {
                if (result === false) {
                    // handle error
                    ...
                }
            });

 * @return {Image}  an image
 * @for  zebra.ui.loadImage()
 * @method  loadImage
 */
pkg.loadImage = function(path, ready) {
    var i = new Image();
    i.crossOrigin = '';
    i.crossOrigin='anonymous';
    zebra.busy();
    if (arguments.length > 1)  {
        i.onerror = function() {  zebra.ready(); ready(path, false, i); };
        i.onload  = function() {  zebra.ready(); ready(path, true, i);  };
    }
    else {
        i.onload  =  i.onerror = function() { zebra.ready(); };
    }
    i.src = path;
    return i;
};

/**
 *  This the core UI component class. All other UI components 
 *  has to be successor of the UI class. 

        // instantiate panel with no arguments
        var p = new zebra.ui.Panel();

        // instantiate panel with border layout set as its layout manager
        var p = new zebra.ui.Panel(new zebra.layout.BorderLayout());

        // instantiate panel with the given properties (border 
        // layout manager, blue background and plain border)
        var p = new zebra.ui.Panel({
           layout: new zebra.ui.BorderLayout(),
           background : "blue",
           border     : "plain"
        });

 *  @class zebra.ui.Panel
 *  @param {Object|zebra.layout.Layout} [l] pass a layout manager or 
 *  number of properties that have to be applied to the instance of 
 *  the panel class.
 *  @constructor
 *  @extends zebra.layout.Layoutable
 */
pkg.Panel = Class(L.Layoutable, [
     function $prototype() {
        /**
         * UI component border view
         * @attribute border
         * @default null
         * @readOnly
         * @type {zebra.ui.View}
         */

        /**
         * UI component background view
         * @attribute bg
         * @default null
         * @readOnly
         * @type {zebra.ui.View}
        */

         /**
          * Implement the method to say if the UI component can hold focus
          * @return {Boolean} true if the component can have gain focus
          * @method canHaveFocus
          */

        this.top = this.left = this.right = this.bottom = 0;

        /**
         * UI component enabled state  
         * @attribute isEnabled
         * @default true
         * @readOnly
         * @type {Boolean}
         */
        this.isEnabled = true;

        /**
         * Find a zebra.ui.zCanvas where the given UI component is hosted
         * @return {zebra.ui.zCanvas} a zebra canvas
         * @method getCanvas
         */
        this.getCanvas = function() {
            var c = this;
            for(; c != null && c.parent != null; c = c.parent);
            return c != null && instanceOf(c, pkg.zCanvas) ? c : null;
        };

        this.notifyRender = function(o,n){
            if (o != null && o.ownerChanged) o.ownerChanged(null);
            if (n != null && n.ownerChanged) n.ownerChanged(this);
        };

        /**
         * Setup UI component properties 
         * @param  {Object} p collection of properties to be applied 
         * @method properties
         * @return {zebra.ui.Panel} the class instance itself
         */
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

        /**
         * Load content of the panel UI components from the specified JSON file.
         * @param  {String} jsonPath an URL to a JSON file that describes UI 
         * to be loaded into the panel
         * @chainable
         * @method load
         */
        this.load = function(jsonPath) {
            new pkg.Bag(this).loadByUrl(jsonPath);
            return this;
        };

        /**
         * Get a children UI component that embeds the given point.
         * @param  {Integer} x x coordinate
         * @param  {Integer} y y coordinate
         * @return {Panel} a children UI component
         * @method getComponentAt
         */
        this.getComponentAt = function(x,y){
            var r = $cvp(this, temporary);
            if (r == null || (x < r.x || y < r.y ||
                x >= r.x + r.width || y >= r.y + r.height))
            {
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

        /**
         * Shortcut method to invalidating the component 
         * and initiating the component repainting 
         * @method vrp
         */
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

        /**
         * The method is implemented to be aware about a children component
         * insertion.
         * @param  {Integer} index an index at that a new children component 
         * has been added
         * @param  {Object} constr a layout constraints of an inserted component
         * @param  {zebra.ui.Panel} l a children component that has been inserted
         * @method kidAdded
         */
        this.kidAdded = function (index,constr,l){
            pkg.events.performComp(CL.ADDED, this, constr, l);
            if (l.width > 0 && l.height > 0) l.repaint();
            else this.repaint(l.x, l.y, 1, 1);
        };

        /**
         * The method is implemented to be aware about a children component
         * removal.
         * @param  {Integer} i an index of a removed component 
         * @param  {zebra.ui.Panel} l a removed children component
         * @method kidRemoved
         */
        this.kidRemoved = function(i,l){
            pkg.events.performComp(CL.REMOVED, this, null, l);
            if (l.isVisible) this.repaint(l.x, l.y, l.width, l.height);
        };

        /**
         * The method is implemented to be aware the 
         * component location updating
         * @param  {Integer} px a previous x coordinate of the component
         * @param  {Integer} py a previous y coordinate of the component
         * @method relocated
         */
        this.relocated = function(px,py){ 
            pkg.events.performComp(CL.MOVED, this, px, py); 
        
            var p = this.parent, w = this.width, h = this.height;
            if (p != null && w > 0 && h > 0){
                var x = this.x, y = this.y, nx = x < px ? x : px, ny = y < py ? y : py;
                
                //!!! some mobile browser has bug: moving a component leaves 0.5 sized traces 
                //!!! to fix it 1 pixel extra has to be added to all sides of repainted rect area
                nx--;
                ny--;

                if (nx < 0) nx = 0;
                if (ny < 0) ny = 0;

                var w1 = p.width - nx, 
                    w2 = w + (x > px ? x - px : px - x),
                    h1 = p.height - ny,
                    h2 = h + (y > py ? y - py : py - y);

                pkg.paintManager.repaint(p, nx, ny, (w1 < w2 ? w1 : w2) + 2, //!!! add crappy 2 for mobile
                                            (h1 < h2 ? h1 : h2) + 2);
            }
        };
        
        /**
         * The method is implemented to be aware the 
         * component size updating
         * @param  {Integer} pw a previous width of the component
         * @param  {Integer} ph a previous height of the component
         * @method resized
         */
        this.resized = function(pw,ph) { 
            pkg.events.performComp(CL.SIZED, this, pw, ph); 

            if (this.parent != null) {
                pkg.paintManager.repaint(this.parent, this.x, this.y, 
                                        (this.width  > pw) ? this.width  : pw, 
                                        (this.height > ph) ? this.height : ph);
            }
        };

        /**
         * Checks if the component has a focus
         * @return {Boolean} true if the component has focus
         * @method hasFocus
         */
        this.hasFocus = function(){ 
            return pkg.focusManager.hasFocus(this); 
        };

        /**
         * Force the given component to catch focus if the component is focusable.
         * @method requestFocus
         */
        this.requestFocus = function(){ 
            pkg.focusManager.requestFocus(this); 
        };

        /**
         * Force the given component to catch focus in the given timeout.
         * @param {Integer} [timeout] a timeout. The default value is 50
         * @method requestFocusIn
         */
        this.requestFocusIn = function(timeout) { 
            if (arguments.length === 0) {
                timeout = 50;
            }
            var $this = this;
            setTimeout(function () {
                $this.requestFocus(); 
            }, timeout);
        };

        /**
         * Set the UI component visibility
         * @param  {Boolean} b a visibility state 
         * @method setVisible
         */
        this.setVisible = function (b){
            if (this.isVisible != b) {
                this.isVisible = b;
                this.invalidate();
                pkg.events.performComp(CL.SHOWN, this, -1,  -1);

                if (this.parent != null) {
                    if (b) this.repaint();
                    else {
                        this.parent.repaint(this.x, this.y, this.width, this.height);
                    }
                }
            }
        };

        /**
         *  Set the UI component enabled state. Using this property 
         *  an UI component can be excluded from getting input events 
         *  @param  {Boolean} b a enabled state
         *  @method setEnabled
         */
        this.setEnabled = function (b){
            if (this.isEnabled != b){
                this.isEnabled = b;
                pkg.events.performComp(CL.ENABLED, this, -1,  -1);
                if (this.kids.length > 0) {
                    for(var i = 0;i < this.kids.length; i++) {
                        this.kids[i].setEnabled(b);
                    }
                }
                this.repaint();
            }
        };

        /**
         * Set UI component top, left, bottom, right paddings. The paddings are 
         * gaps between component border and painted area. 
         * @param  {Integer} top a top padding
         * @param  {Integer} left a left padding
         * @param  {Integer} bottom a bottom padding
         * @param  {Integer} right a right padding
         * @method setPaddings
         */
        this.setPaddings = function (top,left,bottom,right){
            if (this.top != top       || this.left != left  ||
                this.bottom != bottom || this.right != right  )
            {
                this.top = top;
                this.left = left;
                this.bottom = bottom;
                this.right = right;
                this.vrp();
            }
        },

        /**
         * Set the UI component top, right, left, bottom paddings to the same given value
         * @param  {Integer} v the value that will be set as top, right, left, bottom UI 
         * component paddings
         * @method setPadding
         */
        this.setPadding = function(v) {
            this.setPaddings(v,v,v,v);
        };

        /**
         * Set the border view
         * @param  {zebra.ui.View} v a border view
         * @method setBorder
         */
        this.setBorder = function (v){
            var old = this.border;
            v = pkg.$view(v);
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
                    v.activate(this.hasFocus() ?  "function": "focusoff");
                } 

                this.repaint();
            }
        };

        /**
         * Set the background. Background can be a color string or a zebra.ui.View class 
         * instance, or a function(g,x,y,w,h,c) that paints the background:
        
            // set background color
            comp.setBackground("red");

            // set a picture as a component background
            comp.setBackground(new zebra.ui.Picture(...));

            // set a custom rendered background
            comp.setBackground(function (g,x,y,w,h,target) {
                // paint a component background here
                g.setColor("blue");
                g.fillRect(x,y,w,h);
                g.drawLine(...);
                ...
            }); 


         * @param  {String|zebra.ui.View|Function} v a background 
         * @method setBackground
         */
        this.setBackground = function (v){
            var old = this.bg;
            v = pkg.$view(v);
            if (v != old) {
                this.bg = v;
                this.notifyRender(old, v);
                this.repaint();
            }
        }; 

        /**
         * Add the given children component or number of components to the given panel.
         * @protected
         * @param {zebra.ui.Panel|Array|Object} a children component of number of 
         * components to be added. The parameter can be:

    - Component
    - Array of components
    - Dictionary object where every element is a component to be added and the key of 
    the component is stored in the dictionary is considered as the component constraints 

         * @method setKids
         */
        this.setKids = function(a) {
            if (arguments.length == 1 && instanceOf(a, pkg.Panel)) {
               this.add(a);
               return;
            }

            // if components list passed as number of arguments
            if (arguments.length > 1) {
                for(var i=0; i < arguments.length; i++) {
                    this.add(arguments[i]);
                }
                return;                
            }

            if (Array.isArray(a)) {
                for(var i=0; i < a.length; i++) {
                    this.add(a[i]);
                }
            }
            else {
                var kids = a;
                for(var k in kids) {
                    if (kids.hasOwnProperty(k)) {
                        var ctr = L.$constraints(k);
                        if (ctr != null) {
                            this.add(L[k], kids[k]);
                        }
                        else {
                            this.add(k, kids[k]);
                        }
                    }
                }
            }
        };

        /**
         * Called whenever the UI component gets or looses focus 
         * @method focused
         */
        this.focused = function() {
            // extents of activate method indicates it is  
            if (this.border && this.border.activate) {
                var id = this.hasFocus() ? "focuson" : "focusoff" ;
                if (this.border.views[id]) {
                    this.border.activate(id);
                    this.repaint();
                }
            }
        };

        /**
         * Request the whole UI component or part of the UI component to be repainted
         * @param  {Integer} [x] x coordinate of the component area to be repainted  
         * @param  {Integer} [y] y coordinate of the component area to be repainted
         * @param  {Integer} [w] width of the component area to be repainted
         * @param  {Integer} [h] height of the component area to be repainted
         * @method repaint
         */
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

        /**
         * Remove all children UI components
         * @method removeAll
         */
        this.removeAll = function (){
            if (this.kids.length > 0){
                var size = this.kids.length, mx1 = Number.MAX_VALUE, my1 = mx1, mx2 = 0, my2 = 0;
                for(; size > 0; size--){
                    var child = this.kids[size - 1];
                    if (child.isVisible){
                        var xx = child.x, yy = child.y;
                        mx1 = mx1 < xx ? mx1 : xx; 
                        my1 = my1 < yy ? my1 : yy; 
                        mx2 = Math.max(mx2, xx + child.width);
                        my2 = Math.max(my2, yy + child.height);
                    }
                    this.removeAt(size - 1);
                }
                this.repaint(mx1, my1, mx2 - mx1, my2 - my1);
            }
        };

        /**
         * Bring the UI component to front
         * @method toFront
         */
        this.toFront = function(){
            if (this.parent != null && this.parent.kids[this.parent.kids.length-1] != this){
                var p = this.parent;
                p.kids.splice(p.indexOf(this), 1);
                p.kids[p.kids.length] = this;
                p.vrp();    
            }
        };

        /**
         * Send the UI component to back
         * @method toBack
         */
        this.toBack = function(){
            if (this.parent != null && this.parent.kids[0] != this){
                var p = this.parent;
                p.kids.splice(p.indexOf(this), 1);
                p.kids.unshift(this);
                p.vrp();    
            }
        };

        /**
         * Set the UI component size to its preferred size 
         * @return {Object} a preferred size applied to the component. 
         * The structure of the returned object is the following:
        
            { width:{Integer}, height:{Integer} }

         * @method toPreferredSize
         */
        this.toPreferredSize = function (){
            var ps = this.getPreferredSize();
            this.setSize(ps.width, ps.height);
            return ps;
        };
    },

    function() {
        // !!! dirty trick to call super just to get few milliseconds back 
        //this.$super();
        L.Layoutable.prototype[''].call(this);

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
    }
]);

/**
 *  Base layer UI component. Layer is special type of UI 
 *  components that is used to decouple different logical  
 *  UI components types from each other. Zebra Canvas 
 *  consists from number of layers where only one can be 
 *  active at the given point in time. Layers are stretched 
 *  to fill full canvas size. Every time an input event 
 *  happens system detects an active layer by asking all 
 *  layers from top to bottom. First layer that wants to 
 *  catch input gets control. The typical layers examples 
 *  are window layer, popup menus layer and so on.
 *  @param {String} id an unique id to identify the layer
 *  @constructor  
 *  @class zebra.ui.BaseLayer
 *  @extends {zebra.ui.Panel}
 */
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

    function(id){
        if (id == null) {
            throw new Error("Invalid layer id: " + id);
        }

        this.pfo = null;
        this.$super();

        /**
         * Id of the layer 
         * @attribute id
         * @type {String}
         * @readOnly
         */
        this.id = id;
    }
]);

/**
 *  Root layer implementation. This is the simplest UI layer implementation 
 *  where the layer always try grabbing all input event 
 *  @class zebra.ui.RootLayer
 *  @constructor
 *  @extends {zebra.ui.BaseLayer}
 */
pkg.RootLayer = Class(pkg.BaseLayer, [
    function $prototype() {
        this.isLayerActive = function(x,y){
            return true;
        };
    }
]);

/**
 *  UI component to keep and render the given "zebra.ui.View" class 
 *  instance. The target view defines the component preferred size
 *  and the component view.
 *  @class zebra.ui.ViewPan
 *  @constructor
 *  @extends {zebra.ui.Panel}
 */
pkg.ViewPan = Class(pkg.Panel, [
    function $prototype() {
        this.paint = function (g){
            if (this.view != null){
                var l = this.getLeft(), t = this.getTop();
                this.view.paint(g, l, t, this.width  - l - this.getRight(),
                                         this.height - t - this.getBottom(), this);
            }
        };

        /**
         * Set the target view to be wrapped with the UI component
         * @param  {zebra.ui.View} v a view 
         * @method setView
         */
        this.setView = function (v){
            var old = this.view;
            v = pkg.$view(v);
            
            if (v != old) {
             
                /**
                 * Reference to a view that the component visualize 
                 * @attribute view
                 * @type {zebra.ui.View}
                 * @default undefined
                 * @readOnly
                 */
                this.view = v;
                this.notifyRender(old, v);
                this.vrp();
            }
        };

        /**
         * Override the parent method to calculate preferred size
         * basing on a target view. 
         * @param  {zebra.ui.Panel} t [description]
         * @return {Object} return a target view preferred size if it is defined.
         * The returned structure is the following:
              { width: {Integer}, height:{Integer} }
         * @method  calcPreferredSize
         */
        this.calcPreferredSize = function (t) {
            return this.view ? this.view.getPreferredSize() : { width:0, height:0 };
        };
    }
]);

/**
 *  Image panel UI component class. The component renders an image. 
 *  @param {String|Image} [img] a path or direct reference to an image object. 
 *  If the passed parameter is string it considered as path to an image. 
 *  In this case the image will be loaded using the passed path.
 *  @class zebra.ui.ImagePan
 *  @constructor
 *  @extends zebra.ui.ViewPan
 */
pkg.ImagePan = Class(pkg.ViewPan, [
    function () { this.$this(null); },

    function(img){
        this.setImage(img);
        this.$super();
    },

    /**
     * Set image to be rendered in the UI component
     * @method setImage
     * @param {String|Image} img a path or direct reference to an image. 
     * If the passed parameter is string it considered as path to an image. 
     * In this case the image will be loaded using the passed path
     */
    function setImage(img) {
        if (img && zebra.isString(img)) {
            var $this = this;
            pkg.loadImage(img, function(p, b, i) { if (b) $this.setView(new pkg.Picture(i)); });
            return;
        }
        this.setView(instanceOf(img, pkg.Picture) ? img : new pkg.Picture(img));
    }
]);

/**
 *  UI manager class. The class is widely used as base for building 
 *  various UI managers like paint, focus, event etc. Manager is 
 *  automatically registered as UI events listener for all implement 
 *  by the manager UI event listeners
 *  @class zebra.ui.Manager
 *  @constructor
 */
pkg.Manager = Class([
    function() {
        //!!! sometimes pkg.events is set to descriptor the descriptor
        //    is used to instantiate new event manager. when we do it
        //    Manager constructor is called from new phase of event manager
        //    instantiation what means  event manager is not null (points to descriptor)
        //    but not assigned yet. So we need check extra condition pkg.events.addListener != null
        if (pkg.events != null && pkg.events.addListener != null) {
            pkg.events.addListener(this);
        }
    }
]);

/**
 *  Paint UI manager abstract class. The class has to be used as 
 *  basis to introduce an own paint manager implementations. The 
 *  simplest implementation has to extend "zebra.ui.PaintManager" 
 *  with "paintComponent(g,c)" method. The method defines how the 
 *  given component "c" has to be rendered using 2D context "g". 
 *  @class zebra.ui.PaintManager
 *  @extends {zebra.ui.Manager}
 */
pkg.PaintManager = Class(pkg.Manager, [
    function $prototype() {
        var $timers = {};

        /**
         * Ask for repainting of the given rectangular area of the specified UI component. This method
         * doesn't do repainting immediately. It calculates the dirty area of the whole canvas and then 
         * schedule repainting. Real repainting happens when all repaint method executions are satisfied. 
         * @param  {zebra.ui.Panel} c an UI component that requests repainting 
         * @param  {Integer} [x] x coordinate of top-left corner of a rectangular area to be repainted
         * @param  {Integer} [y] y coordinate of top-left corner of a rectangular area to be repainted
         * @param  {Integer} [w] w width of top-left corner of a rectangular area to be repainted
         * @param  {Integer} [h] h height of top-left corner of a rectangular area to be repainted
         * @method repaint
         */
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

                var canvas = c.getCanvas();
                if(canvas != null){
                    var x2 = canvas.width, y2 = canvas.height;

                    // calculate abs location
                    var cc = c;
                    while (cc.parent != null) {
                        x += cc.x;
                        y += cc.y;
                        cc = cc.parent;
                    }

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
                        if (da.width > 0) 
                        {
                            if (x >= da.x                && 
                                y >= da.y                && 
                                x + w <= da.x + da.width && 
                                y + h <= da.y + da.height  )
                            { 
                                return;
                            }
                            MB.unite(da.x, da.y, da.width, da.height, x, y, w, h, da);
                        }
                        else {
                            MB.intersection(0, 0, canvas.width, canvas.height, x, y, w, h, da);
                        }

                        if (da.width > 0 && !$timers[canvas]) {
                            var $this = this;
                            $timers[canvas] = setTimeout(function() {
                                $timers[canvas] = null;

                                // prevent double painting, sometimes 
                                // width can be -1 what cause clearRect 
                                // clean incorrectly  
                                if (canvas.da.width <= 0) {
                                    return ;
                                }

                                var context = canvas.graph;

                                try {
                                    canvas.validate();
                                    context.save();

                                    //!!!! debug
                                    // zebra.print(" ============== DA = " + canvas.da.y );
                                    // var dg = canvas.canvas.getContext("2d");
                                    // dg.strokeStyle = 'red';
                                    // dg.beginPath();
                                    // dg.rect(da.x, da.y, da.width, da.height);
                                    // dg.stroke();                       

                                    context.clipRect(canvas.da.x, canvas.da.y, canvas.da.width, canvas.da.height);                                  
                                    if (canvas.bg == null) {
                                        context.clearRect(canvas.da.x, canvas.da.y, canvas.da.width, canvas.da.height);
                                    }

                                    $this.paint(context, canvas);

                                    context.restore();
                                    canvas.da.width = -1; //!!!
                                }
                                catch(e) { zebra.print(e); }
                            }, 50);
                        }
                        
                        if (da.width > 0) {
                            canvas.repaint(da.x, da.y, da.width, da.height);
                        }
                    }
                }
            }
        };

        this.paint = function(g,c){
            var dw = c.width, dh = c.height, ts = g.stack[g.counter]; //!!! replace getTopStack() to optimize;
            if (dw !== 0      && 
                dh !== 0      && 
                ts.width > 0  && 
                ts.height > 0 && 
                c.isVisible     )
            {
                c.validate();

                g.save();
                g.translate(c.x, c.y);
                g.clipRect(0, 0, dw, dh);

                ts = g.stack[g.counter]; // replace getTopStack() to optimize;

                var c_w = ts.width, c_h = ts.height;
                if (c_w > 0 && c_h > 0) {
                    this.paintComponent(g, c);
                    var count = c.kids.length, c_x = ts.x, c_y = ts.y;
                    for(var i = 0; i < count; i++) {
                        var kid = c.kids[i];
                        if (kid.isVisible) {
                            var kidX = kid.x, 
                                kidY = kid.y,
                                kidXW = kidX + kid.width,  
                                c_xw  = c_x + c_w,
                                kidYH = kidY + kid.height, 
                                c_yh  = c_y + c_h,
                                iw = (kidXW < c_xw ? kidXW : c_xw) - (kidX > c_x ? kidX : c_x),
                                ih = (kidYH < c_yh ? kidYH : c_yh) - (kidY > c_y ? kidY : c_y);

                            if (iw > 0 && ih > 0) {
                                this.paint(g, kid);
                            }
                        }
                    }
                    if (c.paintOnTop) c.paintOnTop(g);
                }

                g.restore();
            }
        };
    }
]);

/**
 * Zebra UI component paint manager implementation class. Zebra 
 * implementation expects an UI component can implements:
 
    - "paint(g)" method to paint its face   
    - "update(g)" method to fill its background
    - "paintOnTop(g)" method to paint some decorative elements after the 
    component background and face are rendered

 * Also the implementation expects an UI component can specify 
 * background and border view. Using border view can developers change the
 * component shape by defining "ouline(...)"" method  
 * @constructor
 * @class  zebra.ui.PaintManImpl
 * @extends zebra.ui.PaintManager
 */
pkg.PaintManImpl = Class(pkg.PaintManager, [
    function $prototype() {
        this.paintComponent = function(g,c){
            var b = c.bg != null && (c.parent == null || c.bg != c.parent.bg);

            // if component defines shape and has update, [paint?] or background that 
            // differs from parent background try to apply the shape and than build
            // clip from the appplied shape
            if ( (c.border && c.border.outline)                 && 
                 (b || c.update               )                 && 
                 c.border.outline(g, 0, 0, c.width, c.height, c)  ) 
            {
                g.save();
                g.clip();

                if (b) c.bg.paint(g, 0, 0, c.width, c.height, c);
                if (c.update) c.update(g);

                g.restore();
            }
            else {
                if (b) c.bg.paint(g, 0, 0, c.width, c.height, c);
                if (c.update) c.update(g);
            }
         
            if (c.border) {
                c.border.paint(g, 0, 0, c.width, c.height, c);
            }

            if (c.paint) {
                var left   = c.getLeft(), 
                    top    = c.getTop(), 
                    bottom = c.getBottom(), 
                    right  = c.getRight(), 
                    id     = -1;

                if (left + right + top + bottom > 0){
                    var ts = g.stack[g.counter]; // replace g.getTopStack() to optimize
                        cw = ts.width, 
                        ch = ts.height;
                   
                    if (cw <= 0 || ch <= 0) {
                        return;
                    }

                    var cx   = ts.x,
                        cy   = ts.y,
                        x1   = (cx > left ? cx : left),
                        y1   = (cy > top  ? cy : top),
                        cxcw = cx + cw,
                        cych = cy + ch,
                        cright = c.width - right,
                        cbottom = c.height - bottom;
                    
                    id = g.save();
                    g.clipRect(x1, y1, (cxcw < cright  ? cxcw : cright)  - x1,
                                       (cych < cbottom ? cych : cbottom) - y1);
                }
                c.paint(g);
                if (id > 0) g.restore();
            }
        };
    }
]);

/**
 * Focus manager class defines the strategy of focus traversing among 
 * hierarchy of UI components. It keeps current focus owner component 
 * and provides API to change current focus component
 * @class zebra.ui.FocusManager
 * @extends {zebra.ui.Manager}
 */
pkg.FocusManager = Class(pkg.Manager, MouseListener, CL, KeyListener, [
    function $prototype() {
        /**
         * Reference to the current focus owner component.
         * @attribute focusOwner
         * @readOnly
         * @type {zebra.ui.Panel}
         */
        
        function freeFocus(ctx, t){ 
            if (t == ctx.focusOwner) ctx.requestFocus(null);
        }

        this.prevFocusOwner = this.focusOwner = null;

        this.compEnabled = function(c)   { 
            if (c.isEnabled === false) freeFocus(this, c); 
        };
        
        this.compShown   = function(c)   { 
            if (c.isVisible === false) freeFocus(this, c); 
        };
        
        this.compRemoved = function(p,c) { 
            freeFocus(this, c); 
        };

        this.canvasFocusLost = function(canvas) {
            if (this.focusOwner != null && 
                this.focusOwner.getCanvas() == canvas) 
            {
                this.requestFocus(null);
            }
        };

        this.canvasFocusGained = function(canvas) {
            // !!! 
            //  previous focus owner for native HTML element should be ignored 
            // !!!
          
            if (this.prevFocusOwner != null && 
                zebra.instanceOf(this.prevFocusOwner, pkg.HtmlElement) === false) 
            {
                var d = this.prevFocusOwner.getCanvas();
                if (d == canvas)  { 
                    this.requestFocus(this.prevFocusOwner);
                }
                else {
                    this.prevFocusOwner = null;
                }
            }
        };

        /**
         * Test if the given component is a focus owner
         * @param  {zebra.ui.Panel} c an UI component to be tested 
         * @method hasFocus
         * @return {Boolean} true if the given component holds focus   
         */
        this.hasFocus = function(c) {
            return this.focusOwner == c;
        };

        this.keyPressed = function(e){
            if (KE.TAB == e.code){
                var cc = this.ff(e.source, e.isShiftPressed() ?  -1 : 1);
                if (cc != null) this.requestFocus(cc);
            }
        };

        this.findFocusable = function(c) {
            return (this.isFocusable(c) ? c : this.fd(c, 0, 1));
        };

        /**
         * Test if the given component can catch focus
         * @param  {zebra.ui.Panel} c an UI component to be tested 
         * @method isFocusable
         * @return {Boolean} true if the given component can catch a focus
         */
        this.isFocusable = function(c){
            var d = c.getCanvas();
            //!!!
            // also we should checks whether parents isFocusable !!!
            return d && c.isEnabled && c.isVisible && c.canHaveFocus && c.canHaveFocus();
        };

        this.fd = function(t,index,d){
            if(t.kids.length > 0){
                var isNComposite = (instanceOf(t, Composite) === false);
                for(var i = index; i >= 0 && i < t.kids.length; i += d) {
                    var cc = t.kids[i];
                    if (cc.isEnabled && cc.isVisible && cc.width > 0 && cc.height > 0   && 
                        (isNComposite || (t.catchInput && t.catchInput(cc) === false))  &&
                        ( (cc.canHaveFocus && cc.canHaveFocus()) || 
                          (cc = this.fd(cc, d > 0 ? 0 : cc.kids.length - 1, d)) != null)  )
                    {
                        return cc;
                    }
                }
            }
            return null;
        };

        this.ff = function(c,d){
            var top = c;
            while (top && top.getFocusRoot == null) {
                top = top.parent;
            }
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

        /**
         * Force to pass a focus to the given UI component 
         * @param  {zebra.ui.Panel} c an UI component to pass a focus
         * @method requestFocus
         */
        this.requestFocus = function (c){
            if (c != this.focusOwner && (c == null || this.isFocusable(c))) {
        
                // if canvas where a potential focus owner component sits 
                // doesn't  hold native focus than store the potential 
                // focus owner in prevFocusOwner field that will be used 
                // as soon as the canvas gets focus  
                if (c != null && c.getCanvas().$focusGainedCounter === 0) {
                    this.prevFocusOwner = c;
                    if (zebra.instanceOf(this.prevFocusOwner, pkg.HtmlElement) == false) {
                        c.getCanvas().requestFocus();
                        return;
                    }
                }


                var oldFocusOwner = this.focusOwner;
                if (c != null) {
                    var nf = EM.getEventDestination(c);
                    if (nf == null || oldFocusOwner == nf) return;
                    this.focusOwner = nf;
                }
                else {
                    this.focusOwner = c;
                }

                this.prevFocusOwner = oldFocusOwner;
                if (oldFocusOwner  != null) {
                    pkg.events.performInput(new IE(oldFocusOwner, IE.FOCUS_LOST, IE.FOCUS_UID));
                }

                if (this.focusOwner != null) {
                    pkg.events.performInput(new IE(this.focusOwner, IE.FOCUS_GAINED, IE.FOCUS_UID)); 
                }

                return this.focusOwner;
            }
            return null;
        };

        this.mousePressed = function(e){
            if (e.isActionMask()) {
                this.requestFocus(e.source);
            }
        };
    }
]);

/**
 *  Command manager supports short cut keys definition and listening. The shortcuts have to be defined in 
 *  json configuration files:
 
    - **commands.osx.json** for Mac OS X platform
    - **commands.json** for all other platforms 

 *  The JSON configuration has simple structure:
 
      [
         {
            "command"   : "undo_command",
            "args"      : [ true, "test"]
            "key"       : "Ctrl+z"
         },
         {
            "command" : "redo_command",
            "key"     : "Ctrl+Shift+z"
         },
         ...
      ]

 *  The configuration contains list of shortcuts. Every shortcut is bound to a key combination it is triggered. 
 *  Every shortcut has a name and an optional list of arguments that have to passed to a shortcut listener method.
 *  The optional arguments can be used to differentiate two shortcuts that are bound to the same command.
 *  @constructor
 *  @class zebra.ui.CommandManager
 *  @extends {zebra.ui.Manager}
 */

/**
 * Shortcut event is handled by registering a method handler with shortcut manager. The manager is accessed as 
 * "zebra.ui.commandManager" static variable:

        zebra.ui.commandManager._.add(function (e) {
            ...
        });

 * @event shortcut
 * @param {Object} e shortcut event
 *         @param {Array} e.args shortcut arguments list
 *         @param {String} e.command shortcut name
 */
pkg.CommandManager = Class(pkg.Manager, KeyListener, [
    function $prototype() {
        this.keyPressed = function(e) {
            var fo = pkg.focusManager.focusOwner; 
            if (fo != null && this.keyCommands[e.code]) {
                var c = this.keyCommands[e.code]; 
                if (c && c[e.mask] != null) {
                    c = c[e.mask];
                    this._.fired(c);
                    if (fo[c.command]) {
                         if (c.args && c.args.length > 0) fo[c.command].apply(fo, c.args);
                         else fo[c.command]();    
                    }
                }
            }
        };

        this.parseKey = function(k) {
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
                }
            }
            return [m, c];
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
                throw Error("Duplicated command: '" + c + "'");
            }

            if (v == null) v = [];
            v[p[0]] = c;
            this.keyCommands[p[1]] = v;
        }   
    }
]);

/**
 * Cursor manager class. Allows developers to control mouse cursor type by implementing an own 
 * getCursorType method or by specifying a cursor by cursorType field. Imagine an UI component 
 * needs to change cursor type. It 
 *  can be done by one of the following way:
        
    - **Implement getCursorType method by the component itself** 

          var p = new zebra.ui.Panel([
               // implement getCursorType method to set required 
               // mouse cursor type 
               function getCursorType(target, x, y) {
                   return zebra.ui.Cursor.WAIT;
               }
          ]);

    - **Simply set cursorType property of a component** 

          var myPanel = new zebra.ui.Panel();
          ...
          myPanel.cursorType = zebra.ui.Cursor.WAIT;

 *  @class zebra.ui.CursorManager
 *  @constructor
 *  @extends {zebra.ui.Manager}
 */
pkg.CursorManager = Class(pkg.Manager, MouseListener, [
    function $prototype() {

        this.mouseMoved = function(e){
            if (this.isFunc) {
                this.cursorType = this.target.getCursorType(this.target, e.x, e.y);
                this.target.getCanvas().canvas.style.cursor = (this.cursorType == null) ? "default"
                                                                                        : this.cursorType;
            }
        };
        
        this.mouseEntered = function(e){
            if (e.source.cursorType != null) {
                this.target = e.source;
                this.cursorType = this.target.cursorType;
                this.target.getCanvas().canvas.style.cursor = (this.cursorType == null) ? "default"
                                                                                        : this.cursorType;
            }
            else {
                if (e.source.getCursorType != null) {
                    this.isFunc = true; 
                    this.target = e.source;
                    this.cursorType = this.target.getCursorType(this.target, e.x, e.y);
                    this.target.getCanvas().canvas.style.cursor = (this.cursorType == null) ? "default"
                                                                                            : this.cursorType;
                }
            }
        };
        
        this.mouseExited  = function(e){
            if (this.target != null) {
                this.cursorType = "default";
                this.target.getCanvas().canvas.style.cursor = this.cursorType;
                this.target = null;
                this.isFunc = false;
            }
        };
        
        this.mouseDragged = function(e) {
            if (this.isFunc) {
                this.cursorType = this.target.getCursorType(this.target, e.x, e.y);
                this.target.getCanvas().canvas.style.cursor = (this.cursorType == null) ? "default"
                                                                                        : this.cursorType;
            }
        };
    },

    function(){
        this.$super();
   
        /**
         * Current cursor type
         * @attribute cursorType
         * @type {String}
         * @readOnly
         * @default "default"
         */
        this.cursorType = "default";

        this.target = null;
        this.isFunc = false;
    }
]);

/**
 * Event manager class. One of the key zebra manager that is responsible for
 * distributing various events in zebra UI. The manager provides number of 
 * methods to register global events listeners.   
 * @class zebra.ui.EventManager
 * @constructor
 * @extends {zebra.ui.Manager}
 */
pkg.EventManager = Class(pkg.Manager, [
    function $prototype() {
        var IEHM = [], MUID = IE.MOUSE_UID, KUID = IE.KEY_UID;

        IEHM[KE.TYPED]          = 'keyTyped';
        IEHM[KE.RELEASED]       = 'keyReleased';
        IEHM[KE.PRESSED]        = 'keyPressed';
        IEHM[ME.DRAGGED]        = 'mouseDragged';
        IEHM[ME.DRAGSTARTED]    = 'mouseDragStarted';
        IEHM[ME.DRAGENDED]      = 'mouseDragEnded';
        IEHM[ME.MOVED]          = 'mouseMoved';
        IEHM[ME.CLICKED]        = 'mouseClicked';
        IEHM[ME.PRESSED]        = 'mousePressed';
        IEHM[ME.RELEASED]       = 'mouseReleased';
        IEHM[ME.ENTERED]        = 'mouseEntered';
        IEHM[ME.EXITED]         = 'mouseExited';
        IEHM[IE.FOCUS_LOST]     = 'focusLost';
        IEHM[IE.FOCUS_GAINED]   = 'focusGained';

        IEHM[CL.SIZED]   = 'compSized';
        IEHM[CL.MOVED]   = 'compMoved';
        IEHM[CL.ENABLED] = 'compEnabled';
        IEHM[CL.SHOWN]   = 'compShown';
        IEHM[CL.ADDED]   = 'compAdded';
        IEHM[CL.REMOVED] = 'compRemoved';

        this.performComp = function(id, src, p1, p2){
            var n = IEHM[id];

            if (src[n] != null && instanceOf(src, CL)) {
                src[n].call(src, src, p1, p2);            
            }

            for(var i = 0;i < this.c_l.length; i++) {
                var t = this.c_l[i];
                if (t[n] != null) t[n].call(t, src, p1, p2);            
            } 
            
            for(var t = src.parent;t != null; t = t.parent){
                if (t.childCompEvent != null && instanceOf(t, ChildrenListener)) t.childCompEvent(id, src, p1, p2);
            }
        };

        // destination is component itself or one of his composite parent.
        // composite component is a component that grab control from his 
        // children component. to make a component composite
        // it has to implement Composite interface. If composite component 
        // has catchInput method it will be called
        // to clarify if the composite component takes control for the given kid.
        // composite components can be embedded (parent composite can take 
        // control on its child composite component) 
        this.getEventDestination = function(c) {
            if (c == null) return null;
            var cp = c, p = c;
            while((p = p.parent) != null) {
                if (instanceOf(p, Composite) && (p.catchInput == null || p.catchInput(cp))) {
                    cp = p;
                }
            }
            return cp;
        }

        this.performInput = function(e){
            var t = e.source, id = e.ID, it = null, k = IEHM[id], b = false;
            switch(e.UID)
            {
                case MUID:
                    if (t[k] != null && instanceOf(t, MouseListener)) {
                        t[k].call(t, e);
                    }

                    if (id > 25) {
                        for(var i = 0; i < this.m_l.length; i++) {
                            var tt = this.m_l[i];
                            if (tt[k] != null) tt[k].call(tt, e);
                        }
                        return b;
                    }
                    it = this.m_l;
                    break;
                case KUID:
                    if (t[k] != null && instanceOf(t, KeyListener)) {
                        b = t[k].call(t, e);
                    }
                    it = this.k_l;
                    break;
                case IE.FOCUS_UID:
                    if (t[k] != null && instanceOf(t, FocusListener)) {
                        t[k].call(t, e);
                    }
                    t.focused();
                    it = this.f_l;
                    break;
                default: {
                    throw new Error("Invalid input event UID: " + e.UID);
                }
            }

            // distribute event to globally registered listeners
            for(var i = 0;i < it.length; i++) {
                var tt = it[i], m = tt[k];
                if (m != null) b = m.call(tt, e) || b;
            }

            for (t = t.parent;t != null; t = t.parent){
                if (t.childInputEvent != null && instanceOf(t, ChildrenListener)) {
                    t.childInputEvent(e);
                }
            }
            return b;
        };

        /**
         * Register global event listener. The listener will 
         * get events according to event listeners interfaces 
         * it implements. For instance to listen key and 
         * mouse events the passed listener has to be an 
         * instance of "zebra.ui.KeyListener" and 
         * "zebra.ui.MouseListener" interfaces:
                

        // implement and register global key and mouse listener
        zebra.ui.events.addListener(new zebra.Dummy(zebra.ui.MouseListener, 
                                                    zebra.ui.KeyListener, [

            // implement necessary events handlers methods
            function keyPressed(e) {
                ...
            }
            ...
        ])); 

         * @param  {Object} l 
         * @method  addListener
         */
        this.addListener = function (l){
            if (instanceOf(l,CL))             this.addComponentListener(l);
            if (instanceOf(l,MouseListener))  this.addMouseListener(l);
            if (instanceOf(l,KeyListener))    this.addKeyListener(l);
            if (instanceOf(l,FocusListener))  this.addFocusListener(l);
        };

        /**
         * Un-register the global listener. The method detects which listener interfaces 
         * the passed listener implements and un-registers its.
         * @param  {Object} l a listener
         * @method removeListener
         */
        this.removeListener = function (l) {
            if (instanceOf(l, CL))             this.removeComponentListener(l);
            if (instanceOf(l, MouseListener))  this.removeMouseListener(l);
            if (instanceOf(l, KeyListener))    this.removeKeyListener(l);
            if (instanceOf(l, FocusListener))  this.removeFocusListener(l);
        };

        /**
         * Register global component listener
         * @param  {zebra.ui.ComponentListener} l a component listener
         * @method addComponentListener
         */
        this.addComponentListener = function (l) {
            this.a_(this.c_l, l);
        };
  
        /**
         * Un-register global component listener
         * @param  {zebra.ui.ComponentListener} l a component listener
         * @method removeFocusListener
         */
        this.removeComponentListener = function(l){
            this.r_(this.c_l, l);
        };

        /**
         * Register global mouse listener
         * @param  {zebra.ui.MouseListener} l a mouse listener
         * @method addMouseListener
         */
        this.addMouseListener = function(l){
            this.a_(this.m_l, l);
        };

        /**
         * Un-register global mouse listener
         * @param  {zebra.ui.MouseListener} l a mouse listener
         * @method removeMouseListener
         */
        this.removeMouseListener = function(l){
            this.r_(this.m_l, l);
        };

        /**
         * Register global focus listener
         * @param  {zebra.ui.FocusListener} l a focus listener
         * @method addFocusListener
         */
        this.addFocusListener = function (l){
            this.a_(this.f_l, l);
        };
       
       /**
        * Un-register global focus listener
        * @param  {zebra.ui.FocusListener} l a focus listener
        * @method removeFocusListener
        */
        this.removeFocusListener = function (l){ this.r_(this.f_l, l); };

        /**
         * Register global key listener
         * @param  {zebra.ui.KeyListener} l a key listener
         * @method addKeyListener
         */
        this.addKeyListener = function(l){
            this.a_(this.k_l, l);
        };
       
        /**
         * Un-register global key listener
         * @param  {zebra.ui.KeyListener} l a key listener
         * @method removeKeyListener
         */
        this.removeKeyListener  = function (l){
            this.r_(this.k_l, l);
        };

        this.a_ = function(c, l) {
            (c.indexOf(l) >= 0) || c.push(l); };
        
        this.r_ = function(c, l) {
            (c.indexOf(l) < 0) || c.splice(i, 1);
        };
    },

    function(){
        this.m_l  = [];
        this.k_l  = [];
        this.f_l  = [];
        this.c_l  = [];
        this.$super();
    }
]);

function createContext(canvas, w, h) {
    var ctx = canvas.getContext("2d");

    var $save = ctx.save, $restore = ctx.restore, $rotate = ctx.rotate, 
        $scale = ctx.$scale = ctx.scale, $translate = ctx.translate,
        $getImageData = ctx.getImageData;

    // backstage buffer can have different size with a real size
    // what causes the final picture can be zoomed in/out
    // we need to calculate it to make canvas more crisp
    // for HDPI screens
    ctx.$ratio =  $ratio / (ctx.webkitBackingStorePixelRatio ||
                            ctx.mozBackingStorePixelRatio    ||
                            ctx.msBackingStorePixelRatio     ||
                            ctx.backingStorePixelRatio       || 1);

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

    ctx.getTopStack = function() { 
        return this.stack[this.counter]; 
    };

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

    ctx.getImageData= function(x, y, w, h) {
        return $getImageData.call(this, x * this.$ratio, 
                                        y * this.$ratio, 
                                        w, h);
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
        if (this.counter === 0) { 
            throw new Error("Context restore history is empty");
        }
        this.counter--;
        $restore.call(this);
        return this.counter;
    };

    ctx.clipRect = function(x,y,w,h){
        var c = this.stack[this.counter];
        if (c.x != x || y != c.y || w != c.width || h != c.height) {
            var xx = c.x, yy = c.y, 
                ww = c.width, hh = c.height,
                xw = x + w, xxww = xx + ww,
                yh = y + h, yyhh = yy + hh;

            c.x      = x > xx ? x : xx;
            c.width  = (xw < xxww ? xw : xxww) - c.x;
            c.y      = y > yy ? y : yy;
            c.height = (yh < yyhh ? yh : yyhh) - c.y;

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
        // while(this.counter > 0) {
        //     this.restore();
        // }
        this.counter = 0;
        this.stack[0].width = w;
        this.stack[0].height = h;
    };

    return ctx;
}

/**
 *  Canvas zebra UI component class. This is one of the key 
 *  class everybody has to use to build an UI. The class is a wrapper  
 *  for HTML Canvas element. Internally it catches all native HTML Canvas 
 *  events and translates its into Zebra UI events. 
 *
 *  zCanvas instantiation triggers a new HTML Canvas will be created 
 *  and added to HTML DOM tree.  It happens if developer doesn't pass
 *  a Canvas element id or pass an id that doesn't reference to an 
 *  existent HTML canvas element. If developers need to re-use an 
 *  existent in DOM tree canvas element they have to pass id of 
 *  the canvas that has to be used as basis for zebra UI creation.
 
        // a new HTML canvas element is created into HTML DOM tree
        var canvas = zebra.ui.zCanvas();

        // a new HTML canvas element is created into HTML DOM tree
        var canvas = zebra.ui.zCanvas(400,500);  // pass canvas size 

        // stick to existent HTML canvas element 
        var canvas = zebra.ui.zCanvas("ExistentCanvasID");  

 *  The zCanvas has layered structure. Every layer is responsible for 
 *  showing and controlling a dedicated type of UI elements like windows
 *  pop-up menus, tool tips and so on. Developers have to build an own UI 
 *  hierarchy on the canvas root layer. The layer is standard UI panel 
 *  that is accessible as zCanvas component instance "root" field. 
        
        // create canvas
        var canvas = zebra.ui.zCanvas(400,500); 
        
        // save reference to canvas root layer where 
        // hierarchy of UI components have to be hosted 
        var root = canvas.root;

        // fill root with UI components
        var label = new zebra.ui.Label("Label");
        label.setBounds(10,10,100,50);
        root.add(label);

 *  @class zebra.ui.zCanvas
 *  @extends {zebra.ui.Panel}
 *  @constructor
 *  @param {String} [canvasID] an ID of a HTML canvas element. If 
 *  HTML DOM tree already has a HTML Canvas element with the given id
 *  the existent element will be used. Otherwise a new HTML canvas
 *  element will be inserted into HTML DOM tree.
 *  @param {Integer} [width] a width of an HTML canvas element
 *  @param {Integer} [height] a height of an HTML canvas element
 */
pkg.zCanvas = Class(pkg.Panel, [
    function $clazz() {
        this.Layout = Class(L.Layout, [
            function $prototype() {
                this.calcPreferredSize = function(c) {
                    return { width :parseInt(c.canvas.width, 10), 
                             height:parseInt(c.canvas.height, 10) };
                };

                this.doLayout = function(c){
                    var x = c.getLeft(), y = c.getTop(), 
                        w = c.width - c.getRight() - x, 
                        h = c.height - c.getBottom() - y;
                   
                    for(var i = 0;i < c.kids.length; i++){
                        var l = c.kids[i];
                        if (l.isVisible){
                            l.setLocation(x, y);
                            l.setSize(w, h);
                        }
                    }
                };
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

        this.keyTyped = function(e){
            if (e.charCode == 0) {
                if ($keyPressedCode != e.keyCode) this.keyPressed(e);
                $keyPressedCode = -1;
                return;
            }

            if (e.charCode > 0) {
                var fo = pkg.focusManager.focusOwner;
                if (fo != null) {
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
            if (pkg.clipboardTriggerKey > 0 && 
                e.keyCode == pkg.clipboardTriggerKey && 
                focusOwner != null && 
                instanceOf(focusOwner, CopyCutPaste)) 
            {
                $clipboardCanvas = this;  
                $clipboard.style.display = "block";
                this.canvas.onfocus = this.canvas.onblur = null;
                
                // value has to be set, otherwise some browsers (Safari) do not generate 
                // "copy" event
                $clipboard.value="1";

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
            if ((code < 47 && code != 32) || b) { 
                e.preventDefault();
            }
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

        this.mouseEntered = function(id, e) {
            var mp = $mousePressedEvents[id];

            // if a button has not been pressed handle mouse entered to detect
            // zebra component the mouse pointer entered and send appropriate
            // mouse entered event to it
            if (mp == null || mp.canvas == null) {
                var x = $meX(e, this), y = $meY(e, this), d = this.getComponentAt(x, y);

                // also correct current component on that mouse pointer is located
                if (pkg.$mouseMoveOwner != null && d != pkg.$mouseMoveOwner) {
                    var prev = pkg.$mouseMoveOwner;
                    pkg.$mouseMoveOwner = null;

                    //debug("mouseExited << ", -1);
                    ME_STUB.reset(prev, MEXITED, x, y, -1, 0);
                    EM.performInput(ME_STUB);
                }

                if (d != null && d.isEnabled){
                    //debug("mouseEntered >> ", 1);
                    pkg.$mouseMoveOwner = d;
                    ME_STUB.reset(d, MENTERED, x, y, -1, 0);
                    EM.performInput(ME_STUB);
                }
            }
        };

        this.mouseExited = function (id, e) {
            var mp = $mousePressedEvents[id];

            // if a mouse button has not been pressed and current mouse owner 
            // component is not null, flush current mouse owner and send 
            // mouse exited event to him 
            if ((mp == null || mp.canvas == null) && pkg.$mouseMoveOwner != null){
                var p = pkg.$mouseMoveOwner;
                pkg.$mouseMoveOwner = null;

                ME_STUB.reset(p, MEXITED, $meX(e, this), $meY(e, this), -1, 0);
                EM.performInput(ME_STUB);
            }
        };

        this.mouseMoved = function(id, e){
            // get appropriate mousePressed event by event id
            var mp = $mousePressedEvents[id];
        
            // mouse button has been pressed and pressed target zebra component exists  
            // emulate mouse dragging events if we mouse moved on the canvas where mouse 
            // pressed event occurred
            if (mp != null && mp.canvas != null) {
                // target component exits and mouse cursor moved on the same canvas where mouse pressed occurred
                if (mp.component != null && mp.canvas.canvas == e.target) {

                    // !!!!
                    // for the sake of performance $meX(e, this) and $meY(e, this)
                    // methods calls are replaced with direct code
                    var x = this.graph.tX(e.pageX - this.offx, e.pageY - this.offy),
                        y = this.graph.tY(e.pageX - this.offx, e.pageY - this.offy),
                        m = mp.button;

                    
                    // if dragg events has not been initiated yet generate mouse 
                    // start dragging event
                    if (mp.draggedComponent == null) {

                        // check if zebra mouse moved event has already occurred 
                        // if it is true set mouse dragged target component to the mouse moved target component
                        // otherwise compute the target component basing on mouse moved event location  

                        // !!!!
                        // for the sake of performance $meX(e, this) and $meY(e, this)
                        // methods calls are replaced with direct code

                        var xx = this.graph.tX(mp.pageX - this.offx, mp.pageY - this.offy), 
                            yy = this.graph.tY(mp.pageX - this.offx, mp.pageY - this.offy),
                            d  = (pkg.$mouseMoveOwner == null) ? this.getComponentAt(xx, yy)
                                                               : pkg.$mouseMoveOwner;
                       
                        // if target component can be detected fire mouse start sragging and 
                        // mouse dragged events to the component  
                        if (d != null && d.isEnabled === true) {
                            mp.draggedComponent = d;

                            ME_STUB.reset(d, ME.DRAGSTARTED, xx, yy, m, 0);
                            EM.performInput(ME_STUB);

                            // if mouse cursor has been moved mouse dragged event has to be generated
                            if (xx != x || yy != y) {
                                ME_STUB.reset(d, MDRAGGED, x, y, m, 0);
                                EM.performInput(ME_STUB);
                            }
                        }
                    }
                    else {
                        // the drag event has already occurred before, just send 
                        // next dragged event to target zebra component 
                        ME_STUB.reset(mp.draggedComponent, MDRAGGED, x, y, m, 0);
                        EM.performInput(ME_STUB);
                    }
                }
            }
            else {
                // if a mouse button has not been pressed handle the normal mouse moved event

                // !!!!
                // for the sake of performance $meX(e, this) and $meY(e, this)
                // methods calls are replaced with direct code

                var x = this.graph.tX(e.pageX - this.offx, e.pageY - this.offy),
                    y = this.graph.tY(e.pageX - this.offx, e.pageY - this.offy),
                    d = this.getComponentAt(x, y); 

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
                    if (d != null && d.isEnabled === true) {
                        //debug("mouseEntered >> ", 1);
                        pkg.$mouseMoveOwner = d;
                        ME_STUB.reset(d, MENTERED, x, y, -1, 0);
                        EM.performInput(ME_STUB);
                    }
                }
            }
        };

        this.mouseReleased = function(id, e){
            var mp = $mousePressedEvents[id];

            // handle it only if appropriate mouse pressed has occurred 
            if (mp != null && mp.canvas != null) {   
                var x = $meX(e, this), y = $meY(e, this), po = mp.component;
               
                // if a component has been dragged send end dragged event to him to 
                // complete dragging
                if (mp.draggedComponent != null){
                    ME_STUB.reset(mp.draggedComponent, ME.DRAGENDED, x, y, mp.button, 0);
                    EM.performInput(ME_STUB);
                }

                // mouse pressed has not null target zebra component 
                // send mouse released and mouse clicked (if necessary)
                // to him
                if (po != null) {
                    //debug("mouseReleased ", -1);

                  
                    // generate mouse click if no mouse drag event has been generated
                    if (mp.draggedComponent == null && (e.touch == null || e.touch.group == null)) {
                        ME_STUB.reset(po, ME.CLICKED, x, y, mp.button, mp.clicks);
                        EM.performInput(ME_STUB);
                    }
                    
                    // send mouse released to zebra target component
                    ME_STUB.reset(po, ME.RELEASED, x, y, mp.button, mp.clicks);
                    EM.performInput(ME_STUB);
                }

                // mouse released can happen at new location, so move owner has to be corrected
                // and mouse exited entered event has to be generated. 
                // the correction takes effect if we have just completed dragging or mouse pressed
                // event target doesn't match pkg.$mouseMoveOwner   
                if (zebra.isTouchable === false) {    //!!! mouse entered / exited event cannot be generated for touch screens 
                    var mo = pkg.$mouseMoveOwner;
                    if (mp.draggedComponent != null || (po != null && po != mo)) {
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
                }

                // release mouse pressed event without removal the event from object
                // keeping event in object is used to handle double click
                $mousePressedEvents[id].canvas = null;
            }
        };

        this.mousePressed = function(id, e, button) {
            // release mouse pressed if it has not happened before but was not released
            var mp = $mousePressedEvents[id];
            if (mp != null && mp.canvas != null) {
                this.mouseReleased(id, mp);
            }

            //debug("mousePressed ", 0);

            // store mouse pressed event 
            var clicks = mp != null && (new Date().getTime() - mp.time) <= pkg.doubleClickDelta ? 2 : 1 ;
            mp = $mousePressedEvents[id] = {
                pageX       : e.pageX,
                pageY       : e.pageY,
                identifier  : id,
                target      : e.target,
                canvas      : this,
                button      : button,
                component   : null,
                mouseDragged: null,
                time        : (new Date()).getTime(),
                clicks      : clicks
            };

            var x = $meX(e, this), y = $meY(e, this);
            mp.x = x;
            mp.y = y;

            // send mouse event to a layer and test if it has been activated
            for(var i = this.kids.length - 1; i >= 0; i--){
                var l = this.kids[i];
                l.layerMousePressed(x, y,button);
                if (l.isLayerActive && l.isLayerActive(x, y)) break;
            }

            var d = this.getComponentAt(x, y);
            if (d != null && d.isEnabled === true){
                mp.component = d;
                ME_STUB.reset(d, ME.PRESSED, x, y, button, clicks);
                EM.performInput(ME_STUB);
            }

            //!!! this prevent DOM elements selection on the page 
            //!!! this code should be still double checked
            //!!!! THIS CODE BRINGS SOME PROBLEM TO IE. IF CURSOR IN ADDRESS TAB PRESSING ON CANVAS
            //!!!! GIVES FOCUS TO CANVAS BUT KEY EVENT GOES TO ADDRESS BAR 
            //e.preventDefault();

            // on mobile devices this force to leave edit component by grabbing focus from 
            // the editor component (input text field)
            if (document.activeElement != this.canvas) {
                this.canvas.focus();  
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
            var poffx = this.offx,
                poffy = this.offy,
                ba    = this.canvas.getBoundingClientRect();

            this.offx = ((ba.left + 0.5) | 0) + measure(this.canvas, "padding-left") + window.pageXOffset;
            this.offy = ((ba.top  + 0.5) | 0) + measure(this.canvas, "padding-top" ) + window.pageYOffset;

            if (this.offx != poffx || this.offy != poffy) {
                this.relocated(this, poffx, poffy);
            }
        };

        this.getLayer = function(id) { 
            return this[id]; 
        };

        this.setStyles = function(styles) {
            for(var k in styles) {
                this.canvas.style[k] = styles[k];
            }
        };

        this.setAttribute = function(name, value) {
            this.canvas.setAttribute(name, value);
        };

        // override relocated and resized
        // to prevent unnecessary repainting 
        this.relocated = function(px,py) { 
            pkg.events.performComp(CL.MOVED, this, px, py); 
        };

        this.resized = function(pw,ph) { 
            pkg.events.performComp(CL.SIZED, this, pw, ph); 
        }    
    },

    function()       { this.$this(400, 400); },
    function(w, h)   { this.$this(this.toString(), w, h); },
    function(canvas) { this.$this(canvas, -1, -1); },

    function(canvas, w, h) {
        //!!! flag to block wrongly comming double onfocus
        //!!! events 
        this.$focusGainedCounter = 0;

        var pc = canvas, $this = this;

        //  todo ...
        //!!! touch event listeners have to be taking also 
        //    in account
        this.nativeListeners = {
            "onmousemove": null,
            "onmousedown": null,
            "onmouseup": null,
            "onmouseover": null,
            "onmouseout": null,
            "onkeydown": null,
            "onkeyup": null,
            "onkeypress": null
        };

        if (zebra.isString(canvas)) { 
            canvas = document.getElementById(canvas);
            if (canvas != null && pkg.$detectZCanvas(canvas)) {
                throw new Error("Canvas is already in use");
            }
        }
        
        if (canvas == null) {
            canvas = document.createElement("canvas");
            canvas.setAttribute("class", "zebcanvas");
            canvas.setAttribute("width",  w <= 0 ? "400" : "" + w);
            canvas.setAttribute("height", h <= 0 ? "400" : "" + h);
            canvas.setAttribute("id", pc);
            document.body.appendChild(canvas);
        }

        //!!! Pay attention IE9 handles padding incorrectly 
        //!!! the padding has to be set to 0px by appropriate 
        //!!! style sheet getPropertySetter

        if (canvas.getAttribute("tabindex") === null) {
            canvas.setAttribute("tabindex", "1");
        }

        // initialize internal canvas variable to host dirty area
        /**
         * Keeps rectangular "dirty" area of the canvas component
         * @private
         * @attribute da
         * @type {Object} 
                { x:Integer, y:Integer, width:Integer, height:Integer }
         */
        this.da = { x:0, y:0, width:-1, height:0 };

        // canvas has to be set before super 
        /**
         * Reference to HTML Canvas element  where the zebra canvas UI 
         * components are hosted 
         * @protected
         * @readOnly
         * @attribute canvas
         * @type {Canvas}
         */
        this.canvas = canvas;

        // specify canvas specific layout that stretches all kids to fill the whole canvas area
        this.$super(new pkg.zCanvas.Layout());
    
        for(var i=0; i < pkg.layers.length; i++) {
            var l = pkg.layers[i];
            this.add(l.$new ? l.$new() : l);
        }
    
        if (zebra.isTouchable) {
            new pkg.TouchHandler(canvas, [
                function $prototype() {
                    this.started = function(e) {
                        ME_STUB.touch          = e;
                        ME_STUB.touches        = this.touches;
                        ME_STUB.touchCounter   = this.touchCounter;
                        $this.mousePressed(e.identifier, e, 
                                           this.touchCounter == 1 ? ME.LEFT_BUTTON 
                                                                  : (e.group && e.group.size == 2 && e.group.index == 1 ? ME.RIGHT_BUTTON : 0)); 
                    };

                    this.ended = function(e) {
                        ME_STUB.touch          = e;
                        ME_STUB.touches        = this.touches;
                        ME_STUB.touchCounter   = this.touchCounter; 
                        $this.mouseReleased(e.identifier, e); 
                    };

                    this.moved = function(e) {
                        ME_STUB.touch          = e;
                        ME_STUB.touches        = this.touches;
                        ME_STUB.touchCounter   = this.touchCounter;
                        $this.mouseMoved(e.identifier, e);  
                    };                    
                }
            ]);  
        }
        else {
            this.canvas.onmousemove = function(e) { 
                $this.mouseMoved(1, e);   
            };
            
            this.canvas.onmousedown = function(e) { 
                $this.mousePressed(1, e, e.button === 0 ? ME.LEFT_BUTTON
                                                        : (e.button == 2 ? ME.RIGHT_BUTTON : 0)); 
            };
            
            this.canvas.onmouseup = function(e) { 
                $this.mouseReleased(1, e);
            };

            this.canvas.onmouseover = function(e) { 
                $this.mouseEntered(1, e); 
            };
            
            this.canvas.onmouseout = function(e) { 
                $this.mouseExited(1, e);  
            };
            
            this.canvas.oncontextmenu = function(e) {
                e.preventDefault();
            };

            this.canvas.onkeydown = function(e) {
                $this.keyPressed(e);
            };

            this.canvas.onkeyup = function(e) {
                $this.keyReleased(e); 
            };
            
            this.canvas.onkeypress = function(e) {
                $this.keyTyped(e);
            };
        }

        this.canvas.onfocus = function(e) {
            if ($this.$focusGainedCounter++ > 0) {
                e.preventDefault();
                return;
            }

            if (pkg.focusManager.canvasFocusGained) {
                pkg.focusManager.canvasFocusGained($this);
            }
        };
        
        this.canvas.onblur = function(e) {
            //!!! sometimes focus lost comes incorrectly
            //    ignore focus lost if canvas still holds focus
            if (document.activeElement == $this.canvas) {
                e.preventDefault();
                return;
            }

            if ($this.$focusGainedCounter !== 0) {
                $this.$focusGainedCounter = 0;

                if (pkg.focusManager.canvasFocusLost) {
                    pkg.focusManager.canvasFocusLost($this);
                }
            }
        };


        var addons = pkg.zCanvas.addons;
        if (addons) {
            for (var i=0; i<addons.length; i++) {
                (new (Class.forName(addons[i]))()).setup(this);
            }
        }
              
        // !!!
        // save canvas in list of created Zebra canvas
        // do it before setSize
        $canvases.push(this);

        this.setSize(parseInt(this.canvas.width, 10), 
                     parseInt(this.canvas.height, 10));

        if (this.loadAfterCreated) {
            this.loadAfterCreated();
        }
    },

    function setLocation(x, y) {
        this.canvas.style.top  = y + "px";
        this.canvas.style.left = x + "px";
        this.canvas.style.position = "fixed";  
        this.recalcOffset();
    },

    function setSize(w, h) {
        if (this.width != w || h != this.height) {
            var pw = this.width, ph = this.height;

            this.canvas.style.width  = "" + w  + "px";
            this.canvas.style.height = "" + h + "px";
  
            if (this.graph) {
                this.graph.reset(w, h)
            }
            else { 
                this.graph = createContext(this.canvas, w, h);
            }

            // take in account that canvas can be visualized on 
            // Retina screen where the size of canvas (backstage)
            // can be less than it is real screen size. Let's 
            // make it match each other
            this.canvas.width  = w * this.graph.$ratio;
            this.canvas.height = h * this.graph.$ratio;

            // again something for Retina screen
            if (this.graph.$ratio != 1) {
                // call original method
                this.graph.$scale(this.graph.$ratio, 
                                  this.graph.$ratio);
            }

            this.width = w;
            this.height = h;

            if (this.isTouchable) {
                // the strange fix for Android native browser
                // that can render text blurry before you click
                // it happens because the browser autofit option 
                var $this = this;
                setTimeout(function() {
                    $this.invalidate();
                    $this.validate();      
                    $this.repaint();
                }, 200);  
            }
            else {
                this.invalidate();
                this.validate();      
                this.repaint();
            }

            if (w != pw || h != ph) {
                this.resized(pw, ph);
            }

            // let know to other zebra canvases that 
            // the size of an element on the page has 
            // been updated and they have to correct 
            // its anchor. 
            elBoundsUpdated();

            // sometimes changing size can bring to changing canvas location 
            // it is required to recalculate offsets
//            this.recalcOffset(); 
        }
    },

    /**
     * Stretch Canvas to occupy full screen area
     * @method fullScreen
     */
    function fullScreen() {
        /**
         * Indicate if the canvas has to be stretched to 
         * fill the whole screen area. 
         * @type {Boolean}
         * @attribute isFullScreen
         * @readOnly
         */
        this.isFullScreen = true;        
        this.setLocation(0,0);
        this.setSize(window.innerWidth, window.innerHeight);
    },

    function setEnabled(b) {
        if (this.isEnabled != b) {

            // !!!
            // Since disabled state for Canvas element doesn't work
            // we have to emulate it via canvas listeners removal 
            // 
            for(var k in this.nativeListeners ) {
                if (b) {
                    this.canvas[k] = this.nativeListeners[k];  
                    this.nativeListeners[k] = null;
                }
                else {
                    this.nativeListeners[k] = this.canvas[k];  
                    this.canvas[k] = null;            
                }
            }

            // have to be decided if super has to be called
            //this.$super(b);
        
            this.isEnabled = b;
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
    },

    function requestFocus() {
        this.canvas.focus();
    }
]);

zebra.ready(
    // dynamic HTML DOM tree has to be placed to separated function
    // that has to be first in ready list. the function make 
    // the page loading busy before necessary dynamically 
    // inserted elements will be ready. 
    function() {
        zebra.busy();
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
        $fmText  = document.getElementById("zebra.fm.text");
        $fmImage = document.getElementById("zebra.fm.image");

        // the next function passed to ready will be blocked
        // till the picture completely loaded
        $fmImage.onload = function() {
           zebra.ready();    
        };
    },

    function() {
        try {
            zebra.busy();
            pkg.$configuration = new pkg.Bag(pkg);

            var p = zebra()['canvas.json'];
            pkg.$configuration.loadByUrl(p ? p 
                                           : pkg.$url.join("canvas.json"), false);

            while($configurators.length > 0) $configurators.shift()(pkg.$configuration);
            pkg.$configuration.end();

            // store ref to event manager 
            EM = pkg.events;

            if (pkg.clipboardTriggerKey > 0) {
                // create hidden text area to support clipboard
                $clipboard = document.createElement("textarea");
                $clipboard.setAttribute("style", "display:none; position: absolute; left: -99em; top:-99em;");

                $clipboard.onkeydown = function(ee) {
                    $clipboardCanvas.keyPressed(ee);
                    $clipboard.value="1";
                    $clipboard.select();
                }
                
                $clipboard.onkeyup = function(ee) {
                    //!!!debug  zebra.print("onkeyup : " + ee.keyCode);
                    if (ee.keyCode == pkg.clipboardTriggerKey) {
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
            }
        

            // bunch of handlers to track HTML page metrics update
            // it is necessary since to correct zebra canvases anchro
            
            document.addEventListener("DOMNodeInserted", function(e) { 
                elBoundsUpdated(); 
            }, false);
            
            document.addEventListener("DOMNodeRemoved", function(e) { 
                elBoundsUpdated();

                // remove canvas from list 
                for(var i = $canvases.length - 1; i >= 0; i--) {
                    var canvas = $canvases[i];
                    if (e.target == canvas.canvas) {
                        $canvases.splice(i, 1);

                        if (canvas.saveBeforeLeave) {
                            canvas.saveBeforeLeave();
                        }
                        
                        break;
                    }
                }            
            }, false);
            
            window.addEventListener("resize", function(e) { 
                elBoundsUpdated(); 
            }, false);


            window.onbeforeunload = function(e) {
                var msgs = [];
                for(var i = $canvases.length - 1; i >= 0; i--) {
                    if ($canvases[i].saveBeforeLeave) {
                        var m = $canvases[i].saveBeforeLeave();
                        if (m != null) {
                            msgs.push(m);
                        }
                    }
                }

                if (msgs.length > 0) {
                    var message = msgs.join("  ");
                    if (typeof e === 'undefined') {
                        e = window.event;
                    }   

                    if (e) e.returnValue = message;
                    return message;
                }
            };
        }
        catch(e) {
            ///!!!!! for some reason throwing exception doesn't appear in console.
            //       but it has side effect to the system, what causes other exception
            //       that is not relevant to initial one
            zebra.error(e.toString());
            throw e;
        }
        finally { zebra.ready(); }
    }
);

/**
 * @for
 */

})(zebra("ui"), zebra.Class, zebra.Interface);



})();
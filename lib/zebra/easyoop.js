/**
 * This is the core module that provides powerful easy OOP concept, packaging and number of utility methods.
 * The module has no any dependency from others zebra modules and can be used independently.  
 * @module zebra
 */
(function() {

//  Faster match operation analogues:
//  Math.floor(f)  =>  ~~(a)
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

/**
 *  Create a new or return existent name space by the given name. The names space 
 *  is structure to host various packages, classes, interfaces and so on. Usually
 *  developers should use "zebra" name space to access standard zebra classes, 
 *  interfaces, methods and packages and also to put own packages, classes etc 
 *  there. But in some cases it can be convenient to keep own stuff in a 
 *  dedicated project specific name space.   
 *  @param {String} nsname a name space name
 *  @return {Function} an existent or created name space. Name space is function 
 *  that can be called to:
 *
 *    * Get the bound to the given name space variables:
 * @example    
 *          // get all variables of "zebra" namespace 
 *          var variables = zebra();
 *          variables["myVariable"] = "myValue" // set variables in "zebra" name space
 * 
 *    * Get list of packages that are hosted under the given name space:
 * @example
 *         // get all packages that "zebra" name space contain
 *         zebra(function(packageName, package) {
 *               ...                
 *         });
 * 
 *    * Create or access a package by the given package name (can be hierarchical):   
 * @example
 *         var pkg = zebra("test.io") // create or get "test.io" package
 * 
 *  @method namespace
 *  @api zebra.namespace()
 */
var $$$ = 0, namespaces = {}, namespace = function(nsname, dontCreate) {
    if (isString(nsname) === false) {
        throw new Error("Invalid name space name : '" + nsname + "'");
    }

    if (namespaces.hasOwnProperty(nsname)) {
        return namespaces[nsname];
    }

    if (dontCreate === true) {
        throw new Error("Name space '" + nsname + "' doesn't exist");
    }

    function Package() {
        this.$url = null;
        if (typeof document !== "undefined") {
            var s  = document.getElementsByTagName('script'),
                ss = s[s.length - 1].getAttribute('src'),
                i  = ss == null ? -1 : ss.lastIndexOf("/");

            this.$url = (i > 0) ? new zebra.URL(ss.substring(0, i + 1))
                                : new zebra.URL(document.location.toString()).getParentURL() ;
        }
    }

    if (namespaces.hasOwnProperty(nsname)) {
        throw new Error("Name space '" + nsname + "' already exists");
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

        if (f[name] instanceof Package) {
            return f[name];
        }

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

var pkg = zebra = namespace('zebra'),
    CNAME = pkg.CNAME = '$', CDNAME = '',
    FN = pkg.$FN = (typeof namespace.name === "undefined") ? (function(f) {
                                                                var mt = f.toString().match(/^function\s+([^\s(]+)/);
                                                                return (mt == null) ? CNAME : mt[1];
                                                             })
                                                           : (function(f) { return f.name; });

pkg.namespaces = namespaces;
pkg.namespace  = namespace;
pkg.$global    = (typeof window !== "undefined" && window != null) ? window : this;
pkg.isString   = isString;
pkg.isNumber   = isNumber;
pkg.isBoolean  = isBoolean;
pkg.version    = "4.2014";
pkg.$caller    = null; // current method which is called

function mnf(name, params) {
    var cln = this.$clazz && this.$clazz.$name ? this.$clazz.$name + "." : "";
    throw new ReferenceError("Method '" + cln + (name === CNAME ? "constructor"
                                                                : name) + "(" + params + ")" + "' not found");
}

function $toString() { return this.$hash$; }

// return function that is meta class
//  pt - parent template function (can be null)
//  tf - template function
//  p  - parent interfaces
function make_template(pt, tf, p) {
    tf.$hash$ = "$ZBr$" + ($$$++);
    tf.toString = $toString;
    
    if (pt != null) { 
        tf.prototype.$clazz = tf;
    }

    tf.$clazz = pt;
    tf.prototype.toString = $toString;
    tf.prototype.constructor = tf;

    if (p && p.length > 0) {
        tf.$parents = {};
        for(var i=0; i < p.length; i++) {
            var l = p[i];
            if (l == null || typeof l !== "function") {
                throw new ReferenceError("Invalid parent class or interface:" + i);
            }

            tf.$parents[l] = true;
            if (l.$parents) {
                var pp = l.$parents;
                for(var k in pp) {
                    if (pp.hasOwnProperty(k)) tf.$parents[k] = true;
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

pkg.properties = function(target, p) {
    for(var k in p) {
        if (k[0] != '$' && p.hasOwnProperty(k) && typeof p[k] !== 'function') {
            var v = p[k], m = zebra.getPropertySetter(target, k);
            if (v && v.$new != null) v = v.$new();
            if (m == null) target[k] = v;
            else {
                if (Array.isArray(v)) m.apply(target, v);
                else                  m.call(target, v);
            }
        }
    }
    return target;
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
 * @api  zebra.Interface()
 */
pkg.Interface = make_template(null, function() {
    var $Interface = make_template(pkg.Interface, function() {
        if (arguments.length > 0) {
            return new (pkg.Class($Interface, arguments[0]))();
        }
    }, arguments);
    return $Interface;
});

pkg.$Extended = pkg.Interface();

function ProxyMethod(name, f) {
    if (isString(name) === false) {
        throw new TypeError('Invalid method name');
    }

    var a = null;
    if (arguments.length == 1) {
        a = function() {
            var nm = a.methods[arguments.length];
            if (nm != null) {
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
            pkg.$caller = a.f;
            try { return a.f.apply(this, arguments); }
            catch(e) { throw e; }
            finally { pkg.$caller = cm; }
        };
        a.f = f;
    }

    a.$clone$ = function() {
        if (a.methodName === CNAME) return null;
        if (a.f) return ProxyMethod(a.methodName, a.f);
        var m = ProxyMethod(a.methodName);
        for(var k in a.methods) {
            if (a.methods.hasOwnProperty(k)) {
                m.methods[k] = a.methods[k];
            }
        }
        return m;
    };

    a.methodName = name;
    return a;
}

/**
 * Class declaration method. Zebra easy OOP concept supports:
 *
 *
 *  __Single class inheritance.__ Any class can extend an another zebra class

        // declare class "A" that with one method "a"   
        var A = zebra.Class([
            function a() { ... }
        ]);
    
        // declare class "B" that inherits class "A"
        var B = zebra.Class(A, []);

        // instantiate class "B" and call method "a"
        var b = new B();
        b.a();

    __Class method overriding.__ Override a parent class method implementation

        // declare class "A" that with one method "a"   
        var A = zebra.Class([
            function a() { ... }
        ]);
    
        // declare class "B" that inherits class "A"
        // and overrides method a with an own implementation
        var B = zebra.Class(A, [
            function a() { ... }
        ]);

    __Class method overloading.__ You can declare methods with the same names but 
    different parameter list. The methods are considered as different methods

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


    __Constructors.__ Constructor is a method with empty name

        // declare class "A" that with one constructor
        var A = zebra.Class([
            function () { this.variable = 100; }
        ]);

        // instantiate "A"
        var a = new A();
        a.variable // variable is 100 

    __Static methods and variables declaration.__ Static fields and methods can be defined 
    by declaring special "$clazz" method whose context is set to declared class

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

    __Access to super class context.__ You can call method declared in a parent class 

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
 *  for the particular instance of the class;  

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
 * @param {zebra.Interface} [inheritedInterfaces*] an optional list of interfaces for 
 * the declared class to be extended
 * @param {Array} methods list of declared class methods. Can be empty array.
 * @return {Function} a class definition
 * @api zebra.Class()
 * @method Class
 */
pkg.Class = make_template(null, function() {
    if (arguments.length === 0) {
        throw new Error("No class definition was found");
    }

    if (Array.isArray(arguments[arguments.length - 1]) === false) {
        throw new Error("Invalid class definition");
    }

    if (arguments.length > 1 && typeof arguments[0] !== "function") {
        throw new ReferenceError("Invalid parent class '" + arguments[0] + "'");
    }

    var df = arguments[arguments.length - 1],
        $parent = null,
        args = Array.prototype.slice.call(arguments, 0, arguments.length-1);

    if (args.length > 0 && (args[0] == null || args[0].$clazz == pkg.Class)) {
        $parent = args[0];
    }

    var $template = make_template(pkg.Class, function() {
        this.$hash$ = "$zObj_" + ($$$++);

        if (arguments.length > 0) {
            var a = arguments[arguments.length - 1];

            // anonymous is customized class instance if last arguments is array of functions
            if (Array.isArray(a) === true && typeof a[0] === 'function') {
                a = a[0];

                // prepare arguments list to declare an anonymous class
                var args = [ $template ],      // first of all the class has to inherit the original class 
                    k = arguments.length - 2;

                // collect interfaces the anonymous class has to implement 
                for(; k >= 0 && pkg.instanceOf(arguments[k], pkg.Interface); k--) {
                    args.push(arguments[k]);
                }

                // add methods list
                args.push(arguments[arguments.length - 1]);

                var cl = pkg.Class.apply(null, args),  // declare new anonymous class

                    // create a function to instantiate an object that will be made the 
                    // anonymous class instance. The intermediate object is required to 
                    // call constructor properly since we have arguments as an array 
                    f  = function() {};

                cl.$name = $template.$name; // the same class name for anonymous 
                f.prototype = cl.prototype; // the same prototypes 

                var o = new f();

                // call constructor 
                cl.apply(o, Array.prototype.slice.call(arguments, 0, k + 1));
                
                // set constructor field for consistency 
                o.constructor = cl;
                return o;
            }
        }

        this[CNAME] && this[CNAME].apply(this, arguments);    
    }, args);


    $template.$propertyInfo = {};
    
    // copy parents prototype    
    $template.$parent = $parent;
    if ($parent != null) {
        for (var k in $parent.prototype) {
            if ($parent.prototype.hasOwnProperty(k)) {
                var f = $parent.prototype[k];
                if (f != null && f.$clone$ != null) {
                    f = f.$clone$();

                    // skip constructors
                    if (f == null) continue;
                }
                $template.prototype[k] = f;
            }
        }
    }

    // extend method cannot be overridden 
    $template.prototype.extend = function() {
        var c = this.$clazz, l = arguments.length, f = arguments[l-1];
        if (pkg.instanceOf(this, pkg.$Extended) === false) {
            c = Class(c, pkg.$Extended, []);
            c.$name = this.$clazz.$name;
            this.$clazz = c;
        }

        if (Array.isArray(f)) {
            for(var i=0; i < f.length; i++) {
                var n = FN(f[i]);
                
                // map user defined constructor to internal constructor name
                if (n == CDNAME) n = CNAME;

                if (n === CNAME) {
                    f[i].call(this);   // call constructor as an initializer 
                    continue;
                }
                else {
                    // clone method and put it in class instance 
                    // if the method is not directly defined in 
                    // the class instance
                    var pv = this[n]; 
                    if (pv != null && this.hasOwnProperty(n) === false)  {
                        this[n] = (pv.$clone$ != null ? pv.$clone$() : ProxyMethod(n, pv)); 
                    }
                    
                    this[n] = createMethod(n, f[i], this, c);
                }
            }
            l--;
        }

        // add new interfaces 
        for(var i=0; i < l; i++) {
            if (pkg.instanceOf(arguments[i], pkg.Interface) === false) {
                throw new Error("Invalid argument: " + arguments[i]);
            }
            c.$parents[arguments[i]] = true;
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

    $template.prototype.$clazz = $template;

    $template.prototype.$this = function() {
        return pkg.$caller.boundTo.prototype[CNAME].apply(this, arguments); 
    };

    // check if the method has been already defined in parent class
    if (typeof $template.prototype.properties === 'undefined') {
        $template.prototype.properties = function(p) {
            return pkg.properties(this, p);
        };
    }

    var lans = "Listeners are not supported";

    // check if the method has been already defined in parent class
    if (typeof $template.prototype.bind === 'undefined') {
        $template.prototype.bind = function() {
            if (this._ == null) {
                throw new Error(lans);
            }
            return this._.add.apply(this._, arguments);
        };
    }

    // check if the method has been already defined in parent class
    if (typeof $template.prototype.unbind === 'undefined') {
        $template.prototype.unbind = function() {
            if (this._ == null) {
                throw new Error(lans);
            }
            this._.remove.apply(this._, arguments); 
        };
    }

    function createMethod(n, f, obj, clazz) {
        var arity = f.length, vv = obj[n];

        // if passed method has been already bound to
        // create wrapper function as a clone function  
        if (f.boundTo != null) {
            // clone method if it is bound to a class
            f = (function(f) {
                return function() { return f.apply(this, arguments); }; 
            })(f, arity, n); 
        }

        f.boundTo    = clazz;
        f.methodName = n;

        if (typeof vv === 'undefined') {
            // declare new class method
            return ProxyMethod(n, f); // no parent or previously declared method exists, 
                                      // create new proxy method
        }

        if (typeof vv === 'function') {
            if (vv.$clone$ != null) {  // a proxy  method has been already defined 
                
                if (typeof vv.methods === "undefined") {  // single method proxy detected
                     
                    if (vv.f.boundTo != clazz || arity == vv.f.length) {  
                                    // single method has been defined in a parent class or the single   
                                    // method arity is the same to the new method arity than override 
                                    // the single method with a new one
                        
                        vv.f = f; // new single proxy method
                        return vv;
                    } 

                    // single method has been defined in this class and arity of
                    // the single method differs from arity of the new method 
                    // than overload the old method with new one method  
                             
                    var sw = ProxyMethod(n);
                    sw.methods[vv.f.length] = vv.f;
                    sw.methods[arity] = f;
                    return sw;
                }
                
                // multiple methods proxy detected 
                vv.methods[arity] = f;
                return vv;
            }

            // old method has been defined directly in class prototype field         
            if (arity == vv.length) {  // the new method arity is the same to old method
                                       // arity than override it with single method proxy 
                
                return ProxyMethod(n, f);  // new single proxy method 
            }

            // the new method arity is not the same to new one
            // than overload it with new one ()
            var sw = ProxyMethod(n);
            vv.methodName = n;
            vv.boundTo    = clazz;
            sw.methods[vv.length] = vv;
            sw.methods[arity] = f;
            return sw;
        }
        
        throw new Error("Method '" + n + "' clash with a property");
    }

    /**
     * Extend existent class with the given methods and interfaces 
     * Be  careful to use the method, pay attention the following facts: 
     
    - only the given class and the classes that inherit the class __after the extend method calling__ get the updates
    - if the class gets method that already defined the old method will be overridden 
    - **"$super"** cannot be called from the method the class is extended  

     *
     * For example:

        var A = zebra.Class([ // declare class A that defines one "a" method
            function a() {
                console.log("A:a()");
            }
        ]);

        var a = new A();
        a.a();  // show "A:a()" message

        A.extend([
            function b() {
                console.log("EA:b()");
            },

            function a() {   // redefine "a" method
                console.log("EA:a()");
            }
        ]);

        // can call b() method we just added to the instance class 
        a.b(); // show "EA:b()" message
        a.a(); // show "EA:a()" message

     * @param {zebra.Interface} [interfaces*] zero or N interfaces
     * @param {Array} methods array of the methods the class have to be 
     * extended with
     * @method extend
     */
    extend = function(df) {
        if (Array.isArray(df) === false) {
            throw new Error("Invalid class definition '" + df + "', array is expected");
        }

        for(var i=0; i < df.length; i++) {
            var f = df[i], n = FN(f), arity = f.length;

            // map user defined constructor to internal constructor name
            if (n == CDNAME) n = CNAME;

            if (n[0] === "$") {
                // populate prototype fields if a special method has been defined 
                if (n === "$prototype") {
                    var protoFields = {};
                    f.call(protoFields, $template);
                    for(var k in protoFields) {
                        if (protoFields.hasOwnProperty(k)) {
                            var protoFieldVal = protoFields[k];
                            // map user defined constructor to internal constructor name
                            if (k == CDNAME) k = CNAME;

                            $template.prototype[k] = protoFieldVal;
                            if (protoFieldVal && typeof protoFieldVal === "function") {
                                protoFieldVal.methodName = k;
                                protoFieldVal.boundTo = $template;
                            }
                        }
                    }
                    continue;
                }
                
                // populate class level fields if a special method has been defined 
                if (n === "$clazz") {
                    f.call($template);
                    continue;
                }
            }

            $template.prototype[n] = createMethod(n, f, $template.prototype, $template); 
        }
    };

    extend(df);

    // populate static fields 
    // TODO: exclude the basic static methods and static constant
    // static inheritance 
    if ($parent != null) {
        for (var k in $parent) {
            if (k[0] != '$' && $parent.hasOwnProperty(k) && $template.hasOwnProperty(k) === false) {
                $template[k] = $parent[k];
            }
        }
    }

    $template.extend = extend; // add extend later to avoid it duplication as a class static field 

    // !!!
    // the static method has to be placed later to be excluded from static inheritance  

    /**
     * Get declared by this class methods.
     * @param  {String} [name] a method name. The name can be used as a 
     * filter to exclude all methods whose name doesn't match the passed name  
     * @return {Array} an array of declared by the class methods
     * @method  getMethods
     */
    $template.getMethods = function(name)  {
         var m = [];

         // map user defined constructor to internal constructor name
         if (name == CDNAME) name = CNAME;
         for (var n in this.prototype) {
             var f = this.prototype[n];
             if (arguments.length > 0 && name != n) continue;
             if (typeof f === 'function') {
                if (f.$clone$ != null) {
                    if (f.methods != null) {
                        for (var mk in f.methods) m.push(f.methods[mk]);    
                    }
                    else {
                        m.push(f.f);
                    }
                }
                else m.push(f);
             }
         }
         return m;
    };

    $template.getMethod = function(name, params) {
        // map user defined constructor to internal constructor name
        if (name == CDNAME) name = CNAME;
        var m = this.prototype[name];
        if (typeof m === 'function') {
            if (m.$clone$ != null) {
                if (m.methods == null) {
                    return m.f;
                }

                if (typeof params === "undefined")  {
                    

                    if (m.methods[0]) return m.methods[0];
                    for(var k in m.methods) {
                        if (m.methods.hasOwnProperty(k)) {
                            return m.methods[k];
                        }
                    }
                    return null;
                }

                m = m.methods[params];
            }
            if (m) return m;
        }
        return null;
    };


    // add parent class constructor(s) if the class doesn't declare own 
    // constructors
    if ($template.$parent != null && 
        $template.$parent.prototype[CNAME] != null &&
        typeof $template.prototype[CNAME] === "undefined")
    {
        $template.prototype[CNAME] = $template.$parent.prototype[CNAME];
    }

    return $template;
});

var Class    = pkg.Class, 
    $busy    = 1, 
    $cachedO = pkg.$cachedO = {}, 
    $cachedE = pkg.$cachedE = [],
    $f       = []; // stores method that wait for redness

pkg.$cacheSize = 5000;

/**
 * Get an object by the given key from cache (and cached it if necessary)
 * @param  {String} key a key to an object. The key is hierarchical reference starting with the global 
 * name space as root. For instance "test.a" key will fetch $global.test.a object.  
 * @return {Object}  an object
 * @api  zebra.$cache
 */
pkg.$cache = function(key) {
    // don't cache global objects
    if (pkg.$global[key]) {
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
            $cachedO[key] = { o:ctx, i:0 };
            delete $cachedO[n];
        }
        else {
            $cachedO[key] = { o: ctx, i:$cachedE.length };
            $cachedE[$cachedE.length] = key;
        }
        return ctx;
    }

    throw new Error("Class '" + key + "' cannot be found");
};

/**
 * Get class by the given class name
 * @param  {String} name a class name
 * @return {Function} a class. Throws exception if the class cannot be 
 * resolved by the given class name
 * @method forName
 * @api  zebra.forName()
 */
Class.forName = function(name) {
    return pkg.$cache(name);
};

/**
 * Test if the given object is instance of the specified class or interface. It is preferable 
 * to use this method instead of JavaScript "instanceof" operator whenever you are dealing with 
 * zebra classes and interfaces. 
 * @param  {Object} obj an object to be evaluated 
 * @param  {Function} clazz a class or interface 
 * @return {Boolean} true if a passed object is instance of the given class or interface
 * @method instanceOf
 * @api  zebra.instanceOf()
 */
pkg.instanceOf = function(obj, clazz) {
    if (clazz != null) {
        if (obj == null || typeof obj.$clazz === 'undefined') {
            return false;
        }

        var c = obj.$clazz;
        return c != null && (c === clazz ||
               (typeof c.$parents !== 'undefined' && c.$parents.hasOwnProperty(clazz)));
    }
    
    throw new Error("instanceOf(): null class");
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
 * @api  zebra.ready()
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

/**
 * Dummy class that implements nothing but can be useful to instantiate 
 * anonymous classes with some on "the fly" functionality:
 
        // instantiate and use zebra class with method "a()" implemented 
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

pkg.isInBrowser = typeof navigator !== "undefined";

pkg.isIE        = pkg.isInBrowser && (Object.hasOwnProperty.call(window, "ActiveXObject") || !!window.ActiveXObject);
pkg.isFF        = pkg.isInBrowser && window.mozInnerScreenX != null;
pkg.isTouchable = pkg.isInBrowser && ( (pkg.isIE === false && (!!('ontouchstart' in window ) || !!('onmsgesturechange' in window))) ||
                                       (!!window.navigator['msPointerEnabled'] && !!window.navigator["msMaxTouchPoints"] > 0)); // IE10   

pkg.isMacOS = pkg.isInBrowser && navigator.platform.toUpperCase().indexOf('MAC') !== -1;

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
        this.path = m[3].replace(/[\/]+/g, "/");
        this.href = a.href;

        /**
         * URL protocol
         * @attribute protocol
         * @type {String} 
         * @readOnly
         */
        this.protocol = (m[1] != null ? m[1].toLowerCase() : null);

        /**
         * Host 
         * @attribute host
         * @type {String}
         * @readOnly
         */
        this.host = m[2];
        
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

    /**
     * Test if the given url is absolute 
     * @param  {u}  u an URL
     * @return {Boolean} true if the URL is absolute
     * @method isAbsolute
     */
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
                           : [ this.protocol, "//", this.host, this.path, this.path[this.path.length-1] == '/' ? '' : '/', p ].join('');
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

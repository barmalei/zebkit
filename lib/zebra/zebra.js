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

/**
 * Collection of variouse data models. 
 * @module data
 * @main 
 * @requires zebra, util
 */

(function(pkg, Class, Interface) {


pkg.descent = function descent(a, b) {
    if (a == null) return 1;
    return (zebra.isString(a)) ? a.localeCompare(b) : a - b;
};


pkg.ascent = function ascent(a, b) {
    if (b == null) return 1;
    return (zebra.isString(b)) ? b.localeCompare(a) : b - a;
};


/**
 * Text model interface
 * @class zebra.data.TextModel
 * @interface
*/

/**
 * Get the given string line stored in the model
 * @method getLine  
 * @param  {Integer} line a line number
 * @return {String}  a string line
 */

/**
 * Get wrapped by the text model original text string 
 * @method getValue
 * @return {String} an original text
 */

/**
 * Get number of lines stored in the text model
 * @method getLines
 * @return {Integer} a number of lines
 */

/**
 * Get number of characters stored in the model 
 * @method getTextLength
 * @return {Integer} a number of characters
 */

/**
 * Write the given string in the text model starting from the specified offset
 * @method write
 * @param  {String} s a string to be written into the text model 
 * @param  {Integer} offset an offset starting from that the passed string has to be written into the text model
 */

/**
 * Remove substring from the text model. 
 * @method remove
 * @param  {Integer} offset an offset starting from that a substring will be removed 
 * @param  {Integer} size a size of a substring to be removed 
 */

/**
 * Fill the text model with the given text  
 * @method  setValue
 * @param  {String} text a new text to be set for the text model
 */

/**
 * Fired when the text model has been updated: a string has been inserted or removed

        text._.add(function (src, b, off, len, startLine, lines) {
            ...
        });

 *
 * @event textUpdated 
 * @param {zebra.data.Text} src a text model that triggers the event
 * @param {Boolean}  b a flag that is true if a string has been written in the text model, false if the model substring has been removed
 * @param {Integer}  off an offset starting form that the text update took place
 * @param {Integer}  len a length of text that has been affected by the text model update
 * @param {Integer}  startLine a first line that has been affected by the text model update
 * @param {Integer}  lines a number of lines that has been affected by the text model update
 */
pkg.TextModel = Interface();


var MB = zebra.util, oobi = "Index is out of bounds: ";

function Line(s) {
    this.s = s;
    this.l = 0;
}

//  toString for array.join method
Line.prototype.toString = function() { return this.s; };

pkg.TextModelListeners = MB.Listeners.Class("textUpdated");

/**
 * Multi-lines text model implementation
 * @class zebra.data.Text
 * @param  {String}  [s] the specified text the model has to be filled
 * @constructor
 * @extends zebra.data.TextModel
 */
pkg.Text = Class(pkg.TextModel, [
    function $prototype() {
        this.textLength = 0;

        this.getLnInfo = function(lines, start, startOffset, o){
            for(; start < lines.length; start++){
                var line = lines[start].s;
                if (o >= startOffset && o <= startOffset + line.length) return [start, startOffset];
                startOffset += (line.length + 1);
            }
            return [];
        };

        this.setExtraChar = function(i,ch){ this.lines[i].l = ch; };
        
        this.getExtraChar = function (i) { return this.lines[i].l; };

        this.getLine = function(line) { return this.lines[line].s; };

        this.getValue = function(){ return this.lines.join("\n"); };

        this.getLines = function () { return this.lines.length; };
        
        this.getTextLength = function() { return this.textLength; };

        this.write = function (s, offset){
            var slen = s.length, info = this.getLnInfo(this.lines, 0, 0, offset), line = this.lines[info[0]].s, j = 0,
                lineOff = offset - info[1], tmp = [line.substring(0, lineOff), s, line.substring(lineOff)].join('');

            for(; j < slen && s[j] != '\n'; j++);

            if(j >= slen) {
                this.lines[info[0]].s = tmp;
                j = 1;
            }
            else {
                this.lines.splice(info[0], 1);
                j = this.parse(info[0], tmp, this.lines);
            }
            this.textLength += slen;
            this._.textUpdated(this, true, offset, slen, info[0], j);
        };

        this.remove = function (offset,size){
            var i1   = this.getLnInfo(this.lines, 0, 0, offset),
                i2   = this.getLnInfo(this.lines, i1[0], i1[1], offset + size),
                l2   = this.lines[i2[0]].s,
                l1   = this.lines[i1[0]].s,
                off1 = offset - i1[1], off2 = offset + size - i2[1],
                buf  = [l1.substring(0, off1), l2.substring(off2)].join('');

            if (i2[0] == i1[0]) this.lines.splice(i1[0], 1, new Line(buf));
            else {
                this.lines.splice(i1[0], i2[0] - i1[0] + 1);
                this.lines.splice(i1[0], 0, new Line(buf));
            }
            this.textLength -= size;
            this._.textUpdated(this, false, offset, size, i1[0], i2[0] - i1[0] + 1);
        };

        this.parse = function (startLine, text, lines){
            var size = text.length, prevIndex = 0, prevStartLine = startLine;
            for(var index = 0; index <= size; prevIndex = index, startLine++){
                var fi = text.indexOf("\n", index);
                index = (fi < 0 ? size : fi);
                this.lines.splice(startLine, 0, new Line(text.substring(prevIndex, index)));
                index++;
            }
            return startLine - prevStartLine;
        };

        this.setValue = function(text){
            if (text == null) {
                throw new Error("Invalid null string");
            }
            var old = this.getValue();
            if (old !== text) {
                if (old.length > 0) {
                    var numLines = this.getLines(), txtLen = this.getTextLength();
                    this.lines.length = 0;
                    this.lines = [ new Line("") ];
                    this._.textUpdated(this, false, 0, txtLen, 0, numLines);
                }

                this.lines = [];
                this.parse(0, text, this.lines);
                this.textLength = text.length;
                this._.textUpdated(this, true, 0, this.textLength, 0, this.getLines());
            }
        };

        this[''] = function(s){
            this.lines = [ new Line("") ];
            this._ = new pkg.TextModelListeners();
            this.setValue(s == null ? "" : s);
        };
    }
]);

/**
 * Single line text model implementation
 * @param  {String}  [s] the specified text the model has to be filled
 * @param  {Integer} [max] the specified maximal text length
 * @constructor
 * @class zebra.data.SingleLineTxt
 * @extends zebra.data.TextModel
 */
pkg.SingleLineTxt = Class(pkg.TextModel, [
    function $prototype() {
        /**
         * Maximal text length. -1 means the text is not restricted regarding its length. 
         * @attribute maxLen
         * @type {Integer}
         * @default -1
         * @readOnly
         */

        this.setExtraChar = function(i,ch) { this.extra = ch; };
        this.getExtraChar = function(i){ return this.extra; };

        this.getValue = function(){ return this.buf; };

        /**
         * Get number of lines stored in the text model. The model can have only one line
         * @method getLines
         * @return {Integer} a number of lines
         */
        this.getLines = function(){ return 1; };

        this.getTextLength = function(){ return this.buf.length; };

        this.getLine = function(line){ 
            if (line != 0) {
                throw new Error(oobi + line);
            }
            return this.buf;
        };

        this.write = function(s,offset){
            var buf = this.buf, j = s.indexOf("\n");
            if (j >= 0) s = s.substring(0, j);
            var l = (this.maxLen > 0 && (buf.length + s.length) >= this.maxLen) ? this.maxLen - buf.length : s.length;
            if (l!==0) {
                this.buf = [buf.substring(0, offset), s.substring(0, l), buf.substring(offset)].join('');
                if (l > 0) this._.textUpdated(this, true, offset, l, 0, 1);
            }
        };

        this.remove = function(offset,size){
            this.buf = [ this.buf.substring(0, offset), this.buf.substring(offset + size)].join('');
            this._.textUpdated(this, false, offset, size, 0, 1);
        };

        this.setValue = function(text){
            if (text == null) {
                throw new Error("Invalid null string");
            }

            var i = text.indexOf('\n');
            if (i >= 0) text = text.substring(0, i);
            if(this.buf == null || this.buf !== text) {
                if (this.buf != null && this.buf.length > 0) this._.textUpdated(this, false, 0, this.buf.length, 0, 1);
                if (this.maxLen > 0 && text.length > this.maxLen) text = text.substring(0, this.maxLen);
                this.buf = text;
                this._.textUpdated(this, true, 0, text.length, 0, 1);
            }
        };

        /**
         * Set the given maximal length the text can have
         * @method setMaxLength
         * @param  {Integer} max a maximal length of text
         */
        this.setMaxLength = function (max){
            if(max != this.maxLen){
                this.maxLen = max;
                this.setValue("");
            }
        };

        this[''] = function (s, max) {   
            this.maxLen = max == null ? -1 : max;
            this.buf = null;
            this.extra = 0;
            this._ = new pkg.TextModelListeners();
            this.setValue(s == null ? "" : s);
        };
    }
]);

pkg.ListModelListeners = MB.Listeners.Class("elementInserted", "elementRemoved", "elementSet");

/**
 * List model class
 * @param  {Array} [a] an array the list model has to be initialized with
 
      // create list model that contains three integer elements
      var l = new zebra.data.ListModel([1,2,3]);
 
 * @constructor 
 * @class zebra.data.ListModel
 */

 /**
  * Fired when a new element has been added to the list model 

     list._.add(function elementInserted(src, o, i) {
         ...
     });

  * @event elementInserted 
  * @param {zebra.data.ListModel} src a list model that triggers the event
  * @param {Object}  o an element that has been added
  * @param {Integer} i an index at that the new element has been added
  */

 /**
  * Fired when an element has been removed from the list model 

     list._.add(function elementRemoved(src, o, i) {
         ...
     });

  * @event elementRemoved
  * @param {zebra.data.ListModel} src a list model that triggers the event
  * @param {Object}  o an element that has been removed
  * @param {Integer} i an index at that the element has been removed
  */

 /**
  * Fired when an element has been re-set 

     list._.add(function elementSet(src, o, pe, i) {
         ...
     });

  * @event elementSet
  * @param {zebra.data.ListModel} src a list model that triggers the event
  * @param {Object}  o an element that has been set
  * @param {Object}  pe a previous element 
  * @param {Integer} i an index at that the element has been re-set
  */

pkg.ListModel = Class([
    function $prototype() {
        /**
         * Get an item stored at the given location in the list 
         * @method get
         * @param  {Integer} i an item location
         * @return {object}  a list item
         */
        this.get = function(i) {
            if (i < 0 || i >= this.d.length) {
                throw new Error(oobi + i);
            }
            return this.d[i];
        };

        /**
         * Add the given item into end of the list 
         * @method add
         * @param  {Object} o an item to be added
         */
        this.add = function(o) {
            this.d.push(o);
            this._.elementInserted(this, o, this.d.length - 1);
        };

        /**
         * Remove all elements from the list model
         * @method removeAll
         */
        this.removeAll = function() {
            var size = this.d.length;
            for(var i = size - 1; i >= 0; i--) this.removeAt(i);
        };

        /**
         * Remove an element at the given location of the list model
         * @method removeAt
         * @param {Integer} i a location of an element to be removed from the list
         */
        this.removeAt = function(i) {
            var re = this.d[i];
            this.d.splice(i, 1);
            this._.elementRemoved(this, re, i);
        };

        /**
         * Remove the given element from the list
         * @method remove
         * @param {Object} o an element to be removed from the list
         */
        this.remove = function(o) {
            for(var i = 0;i < this.d.length; i++ ) if (this.d[i] === o) this.removeAt(i);
        };

        /**
         * Insert the given element into the given position of the list
         * @method insert
         * @param {Object} o an element to be inserted into the list
         * @param {Integer} i a position at which the element has to be inserted into the list 
         */
        this.insert = function(o,i){
            if(i < 0 || i >= this.d.length) {
                throw new Error(oobi + i);
            }
            this.d.splice(i, 0, o);
            this._.elementInserted(this, o, i);
        };

        /**
         * Get number of elements stored in the list
         * @method count
         * @return {Integer} a number of element in the list
         */
        this.count = function () {
            return this.d.length;
        };

        /**
         * Set the new element at the given position
         * @method set
         * @param  {Object} o a new element to be set as the list element at the given position
         * @param  {Integer} i a position
         * @return {Object}  previous element that was stored at the given position
         */
        this.set = function (o,i){
            if (i < 0 || i >= this.d.length) {
                throw new Error(oobi + i);
            }
            var pe = this.d[i];
            this.d[i] = o;
            this._.elementSet(this, o, pe, i);
            return pe;
        };

        /**
         * Check if the element is in the list
         * @method contains
         * @param  {Object} o an element to be checked 
         * @return {Boolean} true if the element is in the list  
         */
        this.contains = function (o){ return this.indexOf(o) >= 0; };

        /**
         * Get position the given element is stored in the list
         * @method indexOf
         * @param  {Object} o an element 
         * @return {Integer} the element position. -1 if the element cannot be found in the list 
         */
        this.indexOf = function(o){ return this.d.indexOf(o); };

        this[''] = function() {
            this._ = new pkg.ListModelListeners();
            this.d = (arguments.length === 0) ? [] : arguments[0];
        };
    }
]);

/**
 * Tree model item class. The structure is used by tree model to store tree items values, parent and children item references.
 * @class zebra.data.Item
 * @param  {Object} [v] the item value
 * @constructor 
 */
var Item = pkg.Item = Class([
    function $prototype() {
        this[''] = function(v) {
            /**
             * Array of the element children items
             * @attribute kids
             * @type {Array}
             * @default []
             * @readOnly
             */
            this.kids = [];

            /**
             * Value stored with this item
             * @attribute value
             * @type {Object}
             * @default null
             * @readOnly
             */
            this.value = v;

            /**
             * Reference to parent item
             * @attribute parent
             * @type {zebra.data.Item}
             * @default undefined
             * @readOnly
             */
        };
    }
]);

pkg.TreeModelListeners = MB.Listeners.Class("itemModified", "itemRemoved", "itemInserted");


/**
 * Tree model class. The class is simple and handy way to keep hierarchical structure. 
 * @constructor
 * @param  {zebra.data.Item|Object} [r] a root item. As the argument you can pass "zebra.data.Item" or
 * a JavaType object. In the second case you can describe the tree as follow:

     // create tree model initialized with tree structure passed as 
     // special formated JavaScript object   
     var tree = new zebra.data.TreeModel({ value:"Root",
                                          kids: [
                                              "Root kid 1",
                                              { 
                                                value: "Root kid 2",
                                                kids:  [ "Kid of kid 2"] 
                                              }
                                          ]});

 * @class zebra.data.TreeModel
 */

/**
 * Fired when the tree model item value has been updated. 

    tree._.add(function itemModified(src, item) {
        ...
    });

 * @event itemModified 
 * @param {zebra.data.TreeModel} src a tree model that triggers the event
 * @param {zebra.data.Item}  item an item whose value has been updated
 */

/**
 * Fired when the tree model item has been removed

    tree._.add(function itemRemoved(src, item) {
       ...
    });

 * @event itemRemoved
 * @param {zebra.data.TreeModel} src a tree model that triggers the event
 * @param {zebra.data.Item}  item an item that has been removed from the tree model
 */

/**
 * Fired when the tree model item has been inserted into the model

    tree._.add(function itemInserted(src, item) {
       ...
    });

 * @event itemInserted
 * @param {zebra.data.TreeModel} src a tree model that triggers the event
 * @param {zebra.data.Item}  item an item that has been inserted into the tree model
 */

pkg.TreeModel = Class([
    function $clazz() {
        this.create = function(r, p) {
            var item = new Item(r.hasOwnProperty("value")? r.value : r);
            item.parent = p;
            if (r.hasOwnProperty("kids")) {
                for(var i = 0; i < r.kids.length; i++) {
                    item.kids[i] = pkg.TreeModel.create(r.kids[i], item);
                }
            }
            return item;
        };
    },

    function $prototype() {
        /**
         * Reference to teh tree model root item
         * @attribute root
         * @readOnly
         */

        /**
         * Update a value of the given tree model item with the new one
         * @method setValue
         * @param  {zebra.data.Item} item an item whose value has to be updated
         * @param  {[type]} v   a new item value
         */
        this.setValue = function(item, v){
            item.value = v;
            this._.itemModified(this, item);
        };

        /**
         * Add the new item to the tree model as a children element of the given parent item
         * @method add
         * @param  {zebra.data.Item} to a parent item to which the new item has to be added
         * @param  {Object|zebra.data.Item} an item or value of the item to be added to the parent item of the tree model 
         */
        this.add = function(to,item){
            this.insert(to, item, to.kids.length);
        };

        /**
         * Insert the new item to the tree model as a children element at the given position of the parent element
         * @method insert
         * @param  {zebra.data.Item} to a parent item to which the new item has to be inserted
         * @param  {Object|zebra.data.Item} an item or value of the item to be inserted to the parent item
         * @param  {Integer} i a position the new item has to be inserted into the parent item
         */
        this.insert = function(to,item,i){
            if (i < 0 || to.kids.length < i) throw new Error(oobi + i);
            if (zebra.isString(item)) {
                item = new Item(item);
            }
            to.kids.splice(i, 0, item);
            item.parent = to;
            this._.itemInserted(this, item);

            // !!!
            // it is necessary to analyze if the inserted item has kids and
            // generate inserted event for all kids recursively
        };

        /**
         * Remove the given item from the tree model
         * @method remove
         * @param  {zebra.data.Item} item an item to be removed from the tree model
         */
        this.remove = function(item){
            if (item == this.root) this.root = null;
            else {
                for(var i=0; i < item.kids.length; i++) this.remove(item.kids[i]);
                item.parent.kids.splice(item.parent.kids.indexOf(item), 1);
                item.parent = null;
            }
            this._.itemRemoved(this, item);
        };

        /**
         * Remove all children items from the given item of the tree model
         * @method removeKids
         * @param  {zebra.data.Item} item an item from that all children items have to be removed
         */
        this.removeKids = function(item){
            for(var i = 0; i < items.kids.length; i++) this.remove(items[i]);
        };

        this[''] = function(r) {
            if (arguments.length === 0) r = new Item();
            this.root = zebra.instanceOf(r, Item) ? r : pkg.TreeModel.create(r);
            this._ = new pkg.TreeModelListeners();
        };
    }
]);

pkg.MatrixListeners = MB.Listeners.Class("matrixResized", "cellModified", "matrixSorted");

/**
 *  Matrix model class. 
 *  @constructor
 *  @param  {Array of Array} [data] the given data 
 *  @param  {Integer} [rows] a number of rows
 *  @param  {Integer} [cols] a number of columns
 *  @class zebra.data.Matrix
 */
pkg.Matrix = Class([
    function $prototype() {
        /**
         * Number of rows in the matrix model
         * @attribute rows
         * @type {Integer}
         * @readOnly
         */

        /**
         * Number of columns in the matrix model
         * @attribute cols
         * @type {Integer}
         * @readOnly
         */
        
        /**
         * Fired when the matrix model size (number of rows or columns) is changed. 
          
         matrix._.add(function matrixResized(src, pr, pc) {
            ...
         });
          
         * @event matrixResized 
         * @param {zebra.data.Matrix} src a matrix that triggers the event
         * @param {Integer}  pr a previous number of rows 
         * @param {Integer}  pc a previous number of columns 
         */

         /**
          * Fired when the matrix model cell has been updated. 
          
          matrix._.add(function cellModified(src, row, col, old) {
             ...
          });

          * @event cellModified 
          * @param {zebra.data.Matrix} src a matrix that triggers the event
          * @param {Integer}  row an updated row 
          * @param {Integer}  col an updated column 
          * @param {Object}  old a previous cell value
          */


          /**
           * Fired when the matrix data has been re-ordered. 
           
           matrix._.add(function matrixSorted(src, sortInfo) {
              ...
           });

           * @event matrixSorted
           * @param {zebra.data.Matrix} src a matrix that triggers the event
           * @param {Object}  sortInfo a new data order info. The information 
           * contains:
           *
           *   { 
           *     func: sortFunction,
           *     name: sortFunctionName,
           *     col : sortColumn
           *   }   
           * 
           */
       

        /**
         * Get a matrix model cell value at the specified row and column
         * @method get
         * @param  {Integer} row a cell row
         * @param  {Integer} col a cell column
         * @return {Object}  matrix model cell value
         */
        this.get = function (row,col){
            if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
                throw new Error("Row of col is out of bounds: " + row + "," + col);
            }
            return this.objs[row][col];
        };

        /**
         * Set the specified by row and column cell value. If the specified row or column is greater than 
         * the matrix model has the model size will be adjusted to new one. 
         * @method put
         * @param  {Integer} row a cell row
         * @param  {Integer} col a cell column
         * @param  {Object} obj a new cell value
         */
        this.put = function(row,col,obj){
            var nr = this.rows, nc = this.cols;
            if(row >= nr) nr += (row - nr + 1);
            if(col >= nc) nc += (col - nc + 1);
            this.setRowsCols(nr, nc);
            var old = this.objs[row] ? this.objs[row][col] : undefined;
            if (obj != old) {
                this.objs[row][col] = obj;
                this._.cellModified(this, row, col, old);
            }
        };

        /**
         * Set the specified by index cell value. The index identifies cell starting from [0,0] cell till [rows,columns]. 
         * If the index is greater than size of model the model size will be adjusted to new one.   
         * @method puti
         * @param  {Integer} i a cell row
         * @param  {Object} obj a new cell value
         */
        this.puti = function(i, obj){
            var p = zebra.util.index2point(i, this.cols);
            this.put(p[0], p[1], obj);
        };

        /**
         * Set the given number of rows and columns the model has to have.
         * @method setRowsCols
         * @param  {Integer} rows a new number of rows
         * @param  {Integer} cols a new number of columns
         */
        this.setRowsCols = function(rows, cols){
            if(rows != this.rows || cols != this.cols){
                var pc = this.cols, pr = this.rows;
                this.rellocate(rows, cols);
                this.cols = cols;
                this.rows = rows;
                this._.matrixResized(this, pr, pc);
            }
        };

        /**
         * Reallocate the matrix model space with the new number of rows and columns 
         * @method rellocate
         * @private
         * @param  {Integer} r a new number of rows
         * @param  {Integer} c a new number of columns
         */
        this.rellocate = function(r, c) {
            if (r >= this.rows) {
                for(var i=this.rows; i < r; i++)  this.objs[i] = [];
            }
        };

         /**
         * Set the given number of rows the model has to have.
         * @method setRows
         * @param  {Integer} rows a new number of rows
         */
        this.setRows = function(rows) { this.setRowsCols(rows, this.cols); };

        /**
         * Set the given number of columns the model has to have.
         * @method setCols
         * @param  {Integer} cols a new number of columns
         */
        this.setCols = function(cols) { this.setRowsCols(this.rows, cols); };

        /**
         * Remove specified number of rows from the model starting from the given row.
         * @method removeRows
         * @param  {Integer}  begrow a start row 
         * @param  {Integer} count  a number of rows to be removed
         */
        this.removeRows = function(begrow,count){
            if (begrow < 0 || begrow + count > this.rows) {
                throw new Error();
            }

            for(var i = (begrow + count);i < this.rows; i++, begrow++){
                for(var j = 0;j < this.cols; j ++ ){
                    this.objs[begrow][j] = this.objs[i][j];
                    this.objs[i][j] = null;
                }
            }
            this.rows -= count;
            this._.matrixResized(this, this.rows + count, this.cols);
        };

        /**
         * Remove specified number of columns from the model starting from the given column.
         * @method removeCols
         * @param  {Integer}  begcol a start column
         * @param  {Integer} count  a number of columns to be removed
         */
        this.removeCols = function (begcol,count){
            if (begcol < 0 || begcol + count > this.cols) {
                throw new Error();
            }
            
            for(var i = (begcol + count);i < this.cols; i++, begcol++){
                for(var j = 0;j < this.rows; j++){
                    this.objs[j][begcol] = this.objs[j][i];
                    this.objs[j][i] = null;
                }
            }
            this.cols -= count;
            this._.matrixResized(this, this.rows, this.cols + count);
        };

        /**
         * Sort the given column of the matrix model
         * @param  {Integer} col a column to be re-ordered
         * @param  {Function} [f] an optional sort function. The name of the function 
         * is grabbed to indicate type of the sorting the method does. For instance:
         * "descent", "ascent".  
         * @method sortCol
         */
        this.sortCol = function(col, f) {
            if (f == null) {
                f = pkg.descent;
            }

            this.data.sort(function(a, b) {
                return f(a[col],b[col]);
            });

            this._.matrixSorted(this, { col : col,
                                        func: f,
                                        name: zebra.$FN(f).toLowerCase() });
        };

        this[''] = function() {
            this._ = new pkg.MatrixListeners();
            if (arguments.length == 1) {
                this.objs = arguments[0];
                this.cols = (this.objs.length > 0) ? this.objs[0].length : 0;
                this.rows = this.objs.length;
            }
            else {
                this.objs = [];
                this.rows = this.cols = 0;
                if (arguments.length > 1) {
                    this.setRowsCols(arguments[0], arguments[1]);
                }
            }
        };
    }
]);

/**
 * @for
 */

})(zebra("data"), zebra.Class, zebra.Interface);

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

            // !!!
            // quick and dirty fix
            // try to track a situation when the canvas has been moved 
            this.recalcOffset();

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
 * @module  ui
 */

pkg.ExternalEditor = Interface();

var MB = zebra.util,Composite = pkg.Composite, ME = pkg.MouseEvent, MouseListener = pkg.MouseListener,
    Cursor = pkg.Cursor, TextModel = zebra.data.TextModel, View = pkg.View, Listeners = zebra.util.Listeners,
    Actionable = zebra.util.Actionable, KE = pkg.KeyEvent, L = zebra.layout, instanceOf = zebra.instanceOf,
    timer = zebra.util.timer, KeyListener = pkg.KeyListener, ChildrenListener = pkg.ChildrenListener,
    $invalidA = "Invalid alignment",
    $invalidO = "Invalid orientation",
    $invalidC = "Invalid constraints";

pkg.$ViewsSetter = function (v){
    this.views = {};
    for(var k in v) {
        if (v.hasOwnProperty(k)) this.views[k] = pkg.$view(v[k]);
    }
    this.vrp();
};

/**
 *  Mouse wheel support class. Installs necessary mouse wheel
 *  listeners and handles mouse wheel events in zebra UI. The 
 *  mouse wheel support is plugging that is configured by a 
 *  JSON configuration. 
 *  @class zebra.ui.MouseWheelSupport
 *  @constructor
 */
pkg.MouseWheelSupport = Class([
    function $prototype() {
        /**
         * Mouse wheel handler 
         * @param  {MouseWheelEvent} e DOM mouse event object 
         * @method mouseWheelMoved
         */
        this.mouseWheelMoved = function(e){
            var owner = pkg.$mouseMoveOwner;
            while (owner != null && instanceOf(owner, pkg.ScrollPan) === false) {
                owner = owner.parent;
            }

            if (owner != null) {
                var d = [0, 0];
                d[0] = (e.detail? e.detail : e.wheelDelta/120);
                if (e.axis) {
                    if (e.axis === e.HORIZONTAL_AXIS) {
                        d[1] = d[0];
                        d[0] = 0;
                    }
                }

                if (d[0] > 1) d[0] = ~~(d[0]/3);
                if (zebra.isIE || zebra.isChrome || zebra.isSafari) d[0] = -d[0];

                for(var i=0; i < 2; i++) {
                    if (d[i] !== 0) {
                        var bar = i === 0 ? owner.vBar : owner.hBar;
                        if (bar && bar.isVisible) bar.position.setOffset(bar.position.offset + d[i]*bar.pageIncrement);
                    }
                }
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
            }
        };
    },

    /**
     * Setup mouse wheel support for the specified "zebra.ui.zCanvas" 
     * component
     * @param  {zebra.ui.zCanvas} canvas a zebra zCanvas UI component
     * @method setup
     */
    function setup(canvas) {
        if (canvas == null) {
            throw new Error("Null canvas");
        }

        var $this = this;
        canvas.canvas.addEventListener ("mousewheel",
                                        function(e) {
                                            $this.mouseWheelMoved(e);
                                        }, false);
        canvas.canvas.addEventListener ("DOMMouseScroll",
                                        function(e) {
                                            $this.mouseWheelMoved(e);
                                        }, false);
    }
]);

/**
 *  UI component render class. Renders the given target UI component
 *  on the given surface using the specified 2D context
 *  @param {zebra.ui.Panel} [target] an UI component to be rendered
 *  @class zebra.ui.CompRender
 *  @constructor
 *  @extends zebra.ui.Render
 */
pkg.CompRender = Class(pkg.Render, [
    function $prototype() {
        this.getPreferredSize = function(){
            return this.target == null ? { width:0, height:0 }
                                       : this.target.getPreferredSize();
        };

        this.paint = function(g,x,y,w,h,d){
            var c = this.target;
            if (c != null) {
                c.validate();
                var prevW =  -1, prevH = 0, cx = x - c.x, cy = y - c.y;
                if (c.getCanvas() == null){
                    prevW = c.width;
                    prevH = c.height;
                    c.setSize(w, h);
                }

                g.translate(cx, cy);
                pkg.paintManager.paint(g, c);
                g.translate(-cx,  -cy);
                if (prevW >= 0){
                    c.setSize(prevW, prevH);
                    c.validate();
                }
            }
        };
    }
]);

/**
 * Line UI component class
 * @constructor
 * @param {Integer} [orient] an orientation of the line. One of
 * the following value can be used:
 
        zebra.layout.VERTICAL
        zebra.layout.HORIZONTAL

 * @class zebra.ui.Line
 * @extends {zebra.ui.Panel}
 */
pkg.Line = Class(pkg.Panel, [
    function (){
        this.$this(L.VERTICAL);
    },

    function (orient){
        orient = L.$constraints(orient);
        if (orient != L.HORIZONTAL && orient != L.VERTICAL) {
            throw new Error($invalidO);
        }

        /**
         * Line orientation
         * @attribute orient
         * @type {Integer}
         * @readOnly
         * @default zebra.layout.VERTICAL
         */
        this.orient = orient;
        
        this.$super();
    },

    function $prototype() {
        /**
         * Line width 
         * @attribute lineWidth
         * @type {Integer}
         * @default 1
         */
        this.lineWidth = 1;

        /**
         * Line color 
         * @attribute lineWidth
         * @type {String}
         * @default black
         */
        this.lineColor = "black";

        this.paint = function(g) {
            g.setColor(this.lineColor);
            if (this.orient == L.HORIZONTAL) {
                var yy = this.top + ~~((this.height - this.top - this.bottom - 1) / 2);
                g.drawLine(this.left, yy, this.width - this.right - this.left, yy, this.lineWidth);
            }
            else {
                var xx = this.left + ~~((this.width - this.left - this.right - 1) / 2);
                g.drawLine(xx, this.top, xx, this.height - this.top - this.bottom, this.lineWidth);
            }
        };

        this.getPreferredSize = function() {
            return { width:this.lineWidth, height:this.lineWidth };
        };
    }
]);

/**
 * Text render that expects and draws a text model or a string as its target
 * @class zebra.ui.TextRender
 * @constructor 
 * @extends zebra.ui.Render
 * @param  {String|zebra.data.TextModel} text a text as string or text model object
 */
pkg.TextRender = Class(pkg.Render, zebra.util.Position.Metric, [
    function $prototype() {
        /**
         * UI component that holds the text render
         * @attribute owner
         * @default null
         * @readOnly
         * @protected
         * @type {zebra.ui.Panel}
         */
        this.owner = null;

        /**
         * Get a line indent 
         * @default 1
         * @return {Integer} line indent
         * @method getLineIndent
         */
        this.getLineIndent = function() {
            return 1;
        };

        /**
         * Get number of lines of target text
         * @return   {Integer} a number of line in the target text
         * @method getLines
         */
        this.getLines = function() {
            return this.target.getLines();
        };

        this.getLineSize   = function(l) {
            return this.target.getLine(l).length + 1;
        };

        /**
         * Get the given line height in pixels
         * @param {Integer} l a line number
         * @return {Integer} a line height in pixels
         * @method getLineHeight
         */
        this.getLineHeight = function(l) {
            return this.font.height;
        };

        this.getMaxOffset  = function() {
            return this.target.getTextLength();
        };
        
        /**
         * Called whenever an owner UI component has been changed
         * @param  {zebra.ui.Panel} v a new owner UI component
         * @method ownerChanged
         */
        this.ownerChanged  = function(v) {
            this.owner = v;
        };
        
        /**
         * Paint the specified text line
         * @param  {2DContext} g graphical 2D context
         * @param  {Integer} x x coordinate
         * @param  {Integer} y y coordinate
         * @param  {Integer} line a line number
         * @param  {zebra.ui.Panel} d an UI component on that the line has to be rendered
         * @method paintLine
         */
        this.paintLine = function(g,x,y,line,d) { 
            g.fillText(this.getLine(line), x, y + this.font.ascent);
        };
        
        /**
         * Get text line by the given line number
         * @param  {Integer} r a line number
         * @return {String} a text line
         * @method getLine
         */
        this.getLine = function(r) {
            return this.target.getLine(r);
        };

        this.targetWasChanged = function(o,n){
            if (o != null) o._.remove(this);
            if (n != null) {
                n._.add(this);
                this.invalidate(0, this.getLines());
            }
            else this.lines = 0;
        };

        /**
         * Get the rendered target text as string object
         * @return {String} rendered text
         * @method getValue
         */
        this.getValue = function(){
            var text = this.target;
            return text == null ? null : text.getValue();
        };

        /**
         * Get the given text line width in pixels
         * @param  {Integer} line a text line number
         * @return {Inetger} a text line width in pixels
         * @method lineWidth
         */
        this.lineWidth = function(line){
            this.recalc();
            return this.target.getExtraChar(line);
        };

        /**
         * Called every time the target text metrics has to be recalculated
         * @method recalc
         */
        this.recalc = function(){
            if (this.lines > 0 && this.target != null){
                var text = this.target;
                if (text != null) {
                    if (this.lines > 0) {
                        for(var i = this.startLine + this.lines - 1;i >= this.startLine; i-- ){
                            text.setExtraChar(i, this.font.stringWidth(this.getLine(i)));
                        }
                        this.startLine = this.lines = 0;
                    }
                    this.textWidth = 0;
                    var size = text.getLines();
                    for(var i = 0;i < size; i++){
                        var len = text.getExtraChar(i);
                        if (len > this.textWidth) this.textWidth = len;
                    }
                    this.textHeight = this.getLineHeight() * size + (size - 1) * this.getLineIndent();
                }
            }
        };

        /**
         * Text model update listener handler 
         * @param  {zebra.data.TextModel} src text model object
         * @param  {Boolean} b 
         * @param  {Integer} off an offset starting from that 
         * the text has been updated 
         * @param  {Integer} size a size (in character) of text part that 
         * has been updated 
         * @param  {Integer} ful a first affected by the given update line
         * @param  {Integer} updatedLines a number of text lines that have 
         * been affected by text updating 
         * @method textUpdated
         */
        this.textUpdated = function(src,b,off,size,ful,updatedLines){
            if (b === false) {
                if (this.lines > 0) {
                    var p1 = ful - this.startLine, 
                        p2 = this.startLine + this.lines - ful - updatedLines;
                    this.lines = ((p1 > 0) ? p1 : 0) + ((p2 > 0) ? p2 : 0) + 1;
                    this.startLine = this.startLine < ful ? this.startLine : ful;
                }
                else {
                    this.startLine = ful;
                    this.lines = 1;
                }
                if (this.owner != null) this.owner.invalidate();
            }
            else {
                if (this.lines > 0){
                    if (ful <= this.startLine) this.startLine += (updatedLines - 1);
                    else {
                        if (ful < (this.startLine + size)) size += (updatedLines - 1);
                    }
                }
                this.invalidate(ful, updatedLines);
            }
        };

        /**
         * Invalidate metrics for the specified range of lines. 
         * @param  {Integer} start first line to be invalidated
         * @param  {Integer} size  number of lines to be invalidated 
         * @method invalidate
         * @private
         */
        this.invalidate = function(start,size){
            if (size > 0 && (this.startLine != start || size != this.lines)) {
                if (this.lines === 0){
                    this.startLine = start;
                    this.lines = size;
                }
                else {
                    var e = this.startLine + this.lines;
                    this.startLine = start < this.startLine ? start : this.startLine;
                    this.lines     = Math.max(start + size, e) - this.startLine;
                }

                if (this.owner != null) {
                    this.owner.invalidate();
                }
            }
        };

        this.getPreferredSize = function(){
            this.recalc();
            return { width:this.textWidth, height:this.textHeight };
        };

        this.paint = function(g,x,y,w,h,d) {
            var ts = g.getTopStack();
            if (ts.width > 0 && ts.height > 0) {
                var lineIndent = this.getLineIndent(),
                    lineHeight = this.getLineHeight(),
                    lilh       = lineHeight + lineIndent,
                    startLine  = 0;

                w = ts.width  < w ? ts.width  : w;
                h = ts.height < h ? ts.height : h;

                if (y < ts.y) {
                    startLine = ~~((lineIndent + ts.y - y) / lilh);
                    h += (ts.y - startLine * lineHeight - startLine * lineIndent);
                }
                else {
                    if (y > (ts.y + ts.height)) return;
                }

                var size = this.target.getLines();
                if (startLine < size){
                    var lines =  ~~((h + lineIndent) / lilh) + (((h + lineIndent) % lilh > lineIndent) ? 1 : 0);
                    if (startLine + lines > size) {
                        lines = size - startLine;
                    }
                    y += startLine * lilh;

                    g.setFont(this.font);
                    if (d == null || d.isEnabled === true){
                        g.setColor(this.color);
                        for(var i = 0;i < lines; i++){
                            if (d && d.getStartSelection) {
                                var p1 = d.getStartSelection();
                                if (p1 != null){
                                    var p2 = d.getEndSelection(), line = i + startLine;
                                    if ((p1[0] != p2[0] || p1[1] != p2[1]) && line >= p1[0] && line <= p2[0]){
                                        var s = this.getLine(line), lw = this.lineWidth(line), xx = x;
                                        if (line == p1[0]) {
                                            var ww = this.font.charsWidth(s, 0, p1[1]);
                                            xx += ww;
                                            lw -= ww;
                                            if (p1[0] == p2[0]) {
                                                lw -= this.font.charsWidth(s, p2[1], s.length - p2[1]);
                                            }
                                        }
                                        else {
                                            if (line == p2[0]) lw = this.font.charsWidth(s, 0, p2[1]);
                                        }
                                        this.paintSelection(g, xx, y, lw === 0 ? 1 : lw, lilh, line, d);

                                        // restore foreground color after selection has been rendered
                                        g.setColor(this.color);
                                    }
                                }
                            }

                            this.paintLine(g, x, y, i + startLine, d);
                            y += lilh;
                        }
                    }
                    else {
                        for(var i = 0;i < lines; i++) {
                            if (pkg.disabledColor1 != null){
                                g.setColor(pkg.disabledColor1);
                                this.paintLine(g, x, y, i + startLine, d);
                            }
                            if (pkg.disabledColor2 != null){
                                g.setColor(pkg.disabledColor2);
                                this.paintLine(g, x + 1, y + 1, i + startLine, d);
                            }
                            y += lilh;
                        }
                    }
                }
            }
        };

        /**
         * Paint the specified text selection of the given line. The area 
         * where selection has to be rendered is denoted with the given
         * rectangular area.
         * @param  {2DContext} g a canvas graphical context
         * @param  {Integer} x a x coordinate of selection rectangular area  
         * @param  {Integer} y a y coordinate of selection rectangular area  
         * @param  {Integer} w a width of of selection rectangular area  
         * @param  {Integer} h a height of of selection rectangular area  
         * @param  {Integer} line [description]
         * @param  {zebra.ui.Panel} d a target UI component where the text 
         * is rendered
         * @protected
         * @method paintSelection
         */
        this.paintSelection = function(g, x, y, w, h, line, d){
            g.setColor(d.selectionColor);
            g.fillRect(x, y, w, h);
        };

        /**
         * Set the text model content 
         * @param  {String} s a text as string object
         * @method setValue
         */
        this.setValue = function (s) {
            this.target.setValue(s);
        };

        /**
         * Set the rendered text font.  
         * @param  {String|zebra.ui.Font} f a font as CSS string or zebra.ui.Font class instance 
         * @method setFont
         */
        this.setFont = function(f){
            var old = this.font;
            if (f && zebra.isString(f)) f = new pkg.Font(f);
            if (f != old && (f == null || f.s != old.s)){
                this.font = f;
                this.invalidate(0, this.getLines());
            }
        };

        /**
         * Set rendered text color 
         * @param  {String} c a text color
         * @method setColor
         */
        this.setColor = function(c){
            if (c != this.color) {
                this.color = c;
                return true;
            }
            return false;
        };

        // speed up constrcutor by abvoiding super execution since 
        // text render is one of the most used class
        this[''] = function(text) {
        /**
         * Text color
         * @attribute color
         * @type {String}
         * @default zebra.ui.fontColor
         * @readOnly
         */
        this.color = pkg.fontColor;

        /**
         * Text font
         * @attribute font
         * @type {String|zebra.ui.Font}
         * @default zebra.ui.font
         * @readOnly
         */
        this.font  = pkg.font;

        this.textWidth = this.textHeight = this.startLine = this.lines = 0;
        //!!!
        //!!! since text is widely used structure we do slight hack - don't call parent constructor
        //!!!
        this.setTarget(zebra.isString(text) ? new zebra.data.Text(text) : text);
        };
    }
]);

pkg.BoldTextRender = Class(pkg.TextRender, [
    function(t) {
        this.$super(t);
        this.setFont(pkg.boldFont);
    }
]);

/**
 * Password text render class. This class renders a secret text with hiding it with the given character. 
 * @param {String|zebra.data.TextModel} [text] a text as string or text model instance
 * @class zebra.ui.PasswordText
 * @constructor
 * @extends zebra.ui.TextRender
 */
pkg.PasswordText = Class(pkg.TextRender, [
    function() {  this.$this(new zebra.data.SingleLineTxt("")); },

    function(text){
        /**
         * Echo character that will replace characters of hidden text 
         * @attribute echo
         * @type {String}
         * @readOnly
         * @default "*"
         */
        this.echo = "*";

        /**
         * Indicates if the last entered character doesn't have to be replaced with echo character  
         * @type {Boolean}
         * @attribute showLast
         * @default true
         * @readOnly
         */
        this.showLast = true;
        this.$super(text);
    },

    /**
     * Set the specified echo character. The echo character is used to hide secret text.
     * @param {String} ch an echo character
     * @method setEchoChar
     */
    function setEchoChar(ch){
        if(this.echo != ch){
            this.echo = ch;
            if(this.target != null) this.invalidate(0, this.target.getLines());
        }
    },

    function getLine(r){
        var buf = [], ln = this.$super(r);
        for(var i = 0;i < ln.length; i++) buf[i] = this.echo;
        if (this.showLast && ln.length > 0) buf[ln.length-1] = ln[ln.length-1];
        return buf.join('');
    }
]);

pkg.TabBorder = Class(View, [
    function(t) {
        this.$this(t, 1);
    },

    function(t, w){
        this.type  = t;
        this.gap   = 4 + w;
        this.width = w;

        this.onColor1 = pkg.palette.black;
        this.onColor2 = pkg.palette.gray5;
        this.offColor = pkg.palette.gray1;

        this.fillColor1 = "#DCF0F7";
        this.fillColor2 =  pkg.palette.white;
        this.fillColor3 = pkg.palette.gray7;
    },

    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            var xx = x + w - 1, yy = y + h - 1, o = d.parent.orient, t = this.type, s = this.width,  dt = s / 2;

            if (d.isEnabled){
                g.setColor(t == 2 ? this.fillColor1 : this.fillColor2);
                g.fillRect(x + 1, y, w - 3, h);
                g.setColor(this.fillColor3);
                g.fillRect(x + 1, y + 2, w - 3, ~~((h - 6) / 2));
            }

            g.setColor((t === 0 || t == 2) ? this.onColor1 : this.offColor);
            switch(o) {
                case L.LEFT:
                    g.drawLine(x + 2, y, xx + 1, y);
                    g.drawLine(x, y + 2, x, yy - 2);
                    g.drawLine(x, y + 2, x + 2, y);
                    g.drawLine(x + 2, yy, xx + 1, yy);
                    g.drawLine(x, yy - 2, x + 2, yy);

                    if (t == 1) {
                        g.setColor(this.onColor2);
                        g.drawLine(x + 2, yy - 1, xx, yy - 1);
                        g.drawLine(x + 2, yy, xx, yy);
                    }
                    break;
                case L.RIGHT:
                    g.drawLine(x, y, xx - 2, y);
                    g.drawLine(xx - 2, y, xx, y + 2);
                    g.drawLine(xx, y + 2, xx, yy - 2);
                    g.drawLine(xx, yy - 2, xx - 2, yy);
                    g.drawLine(x, yy, xx - 2, yy);

                    if (t == 1) {
                        g.setColor(this.onColor2);
                        g.drawLine(xx - 2, yy - 1, x, yy - 1);
                        g.drawLine(xx - 2, yy, x, yy);
                    }
                    break;
                case L.TOP:
                    g.lineWidth = s;
                    g.beginPath();
                    g.moveTo(x + dt, yy + 1);
                    g.lineTo(x + dt, y + dt + 2);
                    g.lineTo(x + dt + 2, y + dt);
                    g.lineTo(xx - dt - 1, y + dt);
                    g.lineTo(xx - dt + 1, y + dt + 2);
                    g.lineTo(xx - dt + 1, yy + 1);
                    g.stroke();
                    if (t === 0) {
                        g.setColor(this.onColor2);
                        g.beginPath();
                        g.moveTo(xx - dt - 2, y + dt + 1);
                        g.lineTo(xx - dt, y + dt + 3);
                        g.lineTo(xx - dt, yy - dt + 1);
                        g.stroke();
                    }
                    g.lineWidth = 1;
                    break;
                case L.BOTTOM:
                    g.drawLine(x + 2, yy, xx - 2, yy);
                    g.drawLine(x, yy - 2, x, y - 2);
                    g.drawLine(xx, yy - 2, xx, y - 2);
                    g.drawLine(x, yy - 2, x + 2, yy);
                    g.drawLine(xx, yy - 2, xx - 2, yy);
                    if (t == 1) {
                        g.setColor(this.onColor2);
                        g.drawLine(xx - 1, yy - 2, xx - 1, y - 2);
                        g.drawLine(xx, yy - 2, xx, y - 2);
                    }
                    break;
                default: throw new Error("Invalid tab orientation");
            }
        };

        this.getTop    = function (){ return 3; };
        this.getBottom = function (){ return 2;};
    }
]);

pkg.TitledBorder = Class(pkg.Render, [
    function $prototype() {
        this.getTop    = function (){ return this.target.getTop(); };
        this.getLeft   = function (){ return this.target.getLeft(); };
        this.getRight  = function (){ return this.target.getRight(); };
        this.getBottom = function (){ return this.target.getBottom(); };

        this.outline = function (g,x,y,w,h,d) {
            var xx = x + w, yy = y + h;
            if (d.getTitleInfo) {
                var r = d.getTitleInfo();
                if (r != null) {
                    var o = r.orient, cx = x, cy = y;

                    if (o == L.BOTTOM || o == L.TOP) {
                        switch(this.lineAlignment) {
                            case L.CENTER : cy = r.y + ~~(r.height / 2); break;
                            case L.TOP    : cy = r.y + (o == L.BOTTOM ?1:0)* (r.height - 1); break;
                            case L.BOTTOM : cy = r.y + (o == L.BOTTOM ?0:1) *(r.height - 1); break;
                        }

                        if (o == L.BOTTOM)  yy = cy;
                        else                y  = cy;
                    }
                    else {
                        switch(this.lineAlignment) {
                            case L.CENTER : cx = r.x + ~~(r.width / 2); break;
                            case L.TOP    : cx = r.x + ((o == L.RIGHT)?1:0) *(r.width - 1); break;
                            case L.BOTTOM : cx = r.x + ((o == L.RIGHT)?0:1) *(r.width - 1); break;
                        }
                        if (o == L.RIGHT)  xx = cx;
                        else               x  = cx;
                    }
                }
            }

            if (this.target && this.target.outline) {
                return this.target.outline(g, x, y, xx - x, yy - y, d);
            }
            g.rect(x, y, xx - x, yy - y);
            return true;
        };

        this.paint = function(g,x,y,w,h,d){
            if (d.getTitleInfo){
                var r = d.getTitleInfo();
                if (r != null) {
                    var xx = x + w, yy = y + h, o = r.orient;
                    g.save();
                    g.beginPath();

                    var br = (o == L.RIGHT), bb = (o == L.BOTTOM),  dt = (bb || br) ? -1 : 1;
                    if (bb || o == L.TOP) {
                        var sy = y, syy = yy, cy = 0 ;
                        switch(this.lineAlignment) {
                            case L.CENTER : cy = r.y + ~~(r.height / 2); break;
                            case L.TOP    : cy = r.y + (bb?1:0) *(r.height - 1); break;
                            case L.BOTTOM : cy = r.y + (bb?0:1) *(r.height - 1); break;
                        }

                        if (bb) {
                            sy  = yy;
                            syy = y;
                        }

                        g.moveTo(r.x + 1, sy);
                        g.lineTo(r.x + 1, r.y + dt * (r.height));
                        g.lineTo(r.x + r.width - 1, r.y + dt * (r.height));
                        g.lineTo(r.x + r.width - 1, sy);
                        g.lineTo(xx, sy);
                        g.lineTo(xx, syy);
                        g.lineTo(x, syy);
                        g.lineTo(x, sy);
                        g.lineTo(r.x, sy);
                        if (bb)  yy = cy;
                        else     y  = cy;
                    }
                    else {
                        var sx = x, sxx = xx, cx = 0;
                        if (br) {
                            sx = xx;
                            sxx = x;
                        }
                        switch(this.lineAlignment) {
                            case L.CENTER : cx = r.x + ~~(r.width / 2); break;
                            case L.TOP    : cx = r.x + (br ? 1 : 0) * (r.width - 1); break;
                            case L.BOTTOM : cx = r.x + (br ? 0 : 1) * (r.width - 1); break;
                        }

                        g.moveTo(sx, r.y);
                        g.lineTo(r.x + dt * (r.width), r.y);
                        g.lineTo(r.x + dt * (r.width), r.y + r.height - 1);
                        g.lineTo(sx, r.y + r.height - 1);
                        g.lineTo(sx, yy);
                        g.lineTo(sxx, yy);
                        g.lineTo(sxx, y);
                        g.lineTo(sx, y);
                        g.lineTo(sx, r.y);
                        if (br)  xx = cx;
                        else     x  = cx;
                    }

                    g.clip();
                    this.target.paint(g, x, y, xx - x, yy - y, d);
                    g.restore();
                }
            }
            else {
                this.target.paint(g, x, y, w, h, d);
            }
        };
    },

    function (border){ this.$this(border, L.BOTTOM); },

    function (b, a){
        if (b == null && a != L.BOTTOM && a != L.TOP && a != L.CENTER) {
            throw new Error($invalidA);
        }
        this.$super(b);
        this.lineAlignment = a;
    }
]);

/**
 * Label UI component class. The label can be used to visualize simple string or multi lines text or 
 * the given text render implementation:
 
        // render simple string
        var l = new zebra.ui.Label("Simple string");

        // render multi lines text
        var l = new zebra.ui.Label(new zebra.data.Text("Multiline\ntext"));

        // render password text 
        var l = new zebra.ui.Label(new zebra.ui.PasswordText("password"));

 * @param  {String|zebra.data.TextModel|zebra.ui.TextRender} [r] a text to be shown with the label. 
 * You can pass a simple string or an instance of a text model or an instance of text render as the 
 * text value.   
 * @class zebra.ui.Label
 * @constructor
 * @extends zebra.ui.ViewPan
 */
pkg.Label = Class(pkg.ViewPan, [
    function $prototype() {
        /**
         * Get the label text
         * @return {String} a zebra label text
         * @method getValue
         */
        this.getValue = function() { return this.view.getValue(); };
        
        /**
         * Get the label text font
         * @return {zebra.ui.Font} a zebra label font
         * @method getFont
         */
        this.getColor = function (){ return this.view.color; };

        /**
         * Set the label text model 
         * @param  {zebra.data.TextModel} m a text model to be set
         * @method setModel
         */
        this.setModel = function(m) { this.setView(new pkg.TextRender(m)); };
        
        /**
         * Get the label text font
         * @return {zebra.ui.Font} a zebra label font
         * @method getFont
         */
        this.getFont = function (){ return this.view.font; };
        
        /**
         * Set the label text value
         * @param  {String|zebra.data.TextModel} s a new label text 
         * @method setText
         * @deprecated use setValue method instead
         */
        this.setText = function(s){ this.setValue(s); };
        
        /**
         * Get the label text
         * @return {String} a zebra label text
         * @method getText
         * @deprecated use getValue method instead
         */
        this.getText = function() { return this.getValue(); };

        /**
         * Set the label text value
         * @param  {String|zebra.data.TextModel} s a new label text 
         * @method setValue
         */
        this.setValue = function(s){
            this.view.setValue(s);
            this.repaint();
        };

        /**
         * Set the label text color
         * @param  {String} c a text color
         * @method setColor
         */
        this.setColor = function(c){
            if (this.view.setColor(c)) this.repaint();
            return this;
        };

        /**
         * Set the label text font
         * @param  {zebra.ui.Font} f a text font
         * @method setFont
         */
        this.setFont = function(f){
            if (f == null) throw new Error("Null font");
            if (this.view.font != f){
                this.view.setFont(f);
                this.repaint();
            }
            return this;
        };
    },

    function () { this.$this(""); },

    function (r){
        if (zebra.isString(r)) r = new zebra.data.SingleLineTxt(r);
        this.setView(instanceOf(r, TextModel) ? new pkg.TextRender(r) : r);
        this.$super();
    }
]);

/**
 * Shortcut class to render multi lines text without necessity to create multi line model
 * @param {String} [t] a text string
 * @constructor
 * @class zebra.ui.MLabel
 * @extends zebra.ui.Label
 */
pkg.MLabel = Class(pkg.Label, [
    function () { this.$this(""); },
    function(t){
        this.$super(new zebra.data.Text(t));
    }
]);

/**
 * Shortcut class to render bold text in Label
 * @param {String|zebra.ui.TextRender|zebra.ui.TextModel} [t] a text string, text model or text render instance 
 * @constructor
 * @class zebra.ui.BoldLabel
 * @extends zebra.ui.Label
 */
pkg.BoldLabel = Class(pkg.Label, []);

/**
 * Image label UI component. This is UI container that consists from an image component and an label component.
 * Image is located at the left size of text.
 * @param {Image|String} img an image or path to the image
 * @param {String|zebra.ui.TextRender|zebra.ui.TextModel} txt a text string, text model or text render instance 
 * @constructor
 * @class zebra.ui.ImageLabel
 * @extends {zebra.ui.Panel}
 */
pkg.ImageLabel = Class(pkg.Panel, [
    function(txt, img) {
        this.$super(new L.FlowLayout(L.LEFT, L.CENTER, L.HORIZONTAL, 6));
        this.add(new pkg.ImagePan(img));
        this.add(new pkg.Label(txt));
    }
]);

var OVER = 0, PRESSED_OVER = 1, OUT = 2, PRESSED_OUT = 3, DISABLED = 4;

/**
 * State panel class. The class implements UI component whose face, border and background view depends on its state. 
 * The component is good basis for creation dynamic view UI components.
 * The state the component can be is:
       
    - **zebra.ui.StatePan.OVER** the mouse cursor is inside the component 
    - **zebra.ui.StatePan.OUT** the mouse cursor is outside the component
    - **zebra.ui.StatePan.PRESSED_OVER** the mouse cursor is inside the component and an action mouse button or key is pressed
    - **zebra.ui.StatePan.PRESSED_OUT** the mouse cursor is outside the component and an action mouse button or key is pressed
    - **zebra.ui.StatePan.DISABLED** the component is disabled

 * The view border, background or face should be set as "zebra.ui.ViewSet" where an required 
 * for the given component state view is identified by an id. By default corresponding to component states views IDs are the following:
 * "over", "pressed.over", "out", "pressed.out", "disabled".  Imagine for example we have two colors and we need to change between 
 * the colors every time mouse cursor is over/out of the component:
  
     // create state panel
     var statePan = new zebra.ui.StatePan();

     // add dynamically updated background
     statePan.setBackground(new zebra.ui.ViewSet({
        "over": "red",
        "out": "blue"
     }));

 * Alone with background border view can be done also dynamic
 
     // add dynamically updated border
     statePan.setBorder(new zebra.ui.ViewSet({
        "over": new zebra.ui.Border("green", 4, 8),
        "out": null
     }));

 * Additionally the UI component allows developer to specify whether the component can hold input focus and which UI component 
 * has to be considered as the focus marker. The focus marker component is used as anchor to paint focus marker view. In simple
 * case the view can be just a border. So border will be rendered around the focus marker component:
 
     // create state panel that contains one label component
     var statePan = new zebra.ui.StatePan();
     var lab      = new zebra.ui.Label("Focus marker label");
     lab.setPadding(6);
     statePan.setPadding(6);
     statePan.setLayout(new zebra.layout.BorderLayout());
     statePan.add(zebra.layout.CENTER, lab);

     // set label as an anchor for focus border indicator 
     statePan.setFocusAnchorComponent(lab);
     statePan.setFocusMarkerView("plain");

 * One more advanced feature of the component is a possibility of listening by children components when the state of the 
 * component has been updated. A children component can be notified with its parent state updating by implementing 
 * "parentStateUpdated(o,n,id)" method. It gets old state, new state and a view id that is mapped to the new state.  
 * The feature is useful if we are developing a composite components whose children component also should 
 * react to a state changing.
 * @class zebra.ui.StatePan
 * @constructor
 * @extends {zebra.ui.Panel}
 */
pkg.StatePan = Class(pkg.ViewPan, Composite, MouseListener, KeyListener, [
    function $clazz() {
        this.OVER = OVER;
        this.PRESSED_OVER = PRESSED_OVER;
        this.OUT = OUT;
        this.PRESSED_OUT = PRESSED_OUT;
        this.DISABLED = DISABLED;
    },

    function $prototype() {
        var IDS = [ "over", "pressed.over", "out", "pressed.out", "disabled" ];

        /**
         * Current component state
         * @attribute state
         * @readOnly
         * @type {Integer}
         */
        this.state = OUT;

        /**
         * Indicates if the component can have focus
         * @attribute isCanHaveFocus
         * @readOnly
         * @type {Boolean}
         */
        this.isCanHaveFocus = false;
        

        this.focusComponent = null;
        
        /**
         * Reference to an anchor focus marker component 
         * @attribute focusMarkerView
         * @readOnly
         * @type {zebra.ui.Panel}
         */
        this.focusMarkerView = null;

        this.$isIn = false;

        /**
         * The method is designed to customize mapping between the component state 
         * and a string view id. It can be handy for classes that extend the component to have 
         * own view IDs set. 
         * @param  {Integer} s a state code
         * @return {String}  a view ID that corresponds to the given state
         * @method idByState
         */
        this.idByState = function(s) { return IDS[s]; };

        this.updateState = function(s) {
            if (s != this.state){
                var prev = this.state;
                this.state = s;
                this.stateUpdated(prev, s);
            }
        };

        /**
         * Called every time the component state has been updated
         * @param  {Integer} o a previous component state 
         * @param  {Integer} n a new component state 
         * @method stateUpdated
         */
        this.stateUpdated = function(o,n){
            var id = this.idByState(n), b = false;

            for(var i=0; i < this.kids.length; i++) {
                if (this.kids[i].parentStateUpdated) {
                    this.kids[i].parentStateUpdated(o, n, id);
                }
            }

            if (this.border && this.border.activate) b = this.border.activate(id) || b;
            if (this.view   && this.view.activate)  b = this.view.activate(id) || b;
            if (this.bg     && this.bg.activate)   b = this.bg.activate(id) || b;

            if (b) this.repaint();
        };

        this.sync = function() {
            this.stateUpdated(this.state, this.state);
        };

        this.keyPressed = function(e){
            if (this.state != PRESSED_OVER &&
                this.state != PRESSED_OUT  &&
                (e.code == KE.ENTER || e.code == KE.SPACE))
            {
                this.updateState(PRESSED_OVER );
            }
        };

        this.keyReleased = function(e){
            if (this.state == PRESSED_OVER || this.state == PRESSED_OUT){
                var prev = this.state;
                this.updateState(OVER);
                if (this.$isIn === false) this.updateState(OUT);
            }
        };

        this.mouseEntered = function (e){
            if (this.isEnabled) {
                this.updateState(this.state == PRESSED_OUT ? PRESSED_OVER : OVER);
                this.$isIn = true;
            }
        };

        this.mouseExited = function(e){
            if (this.isEnabled) {
                this.updateState(this.state == PRESSED_OVER ? PRESSED_OUT : OUT);
                this.$isIn = false;
            }
        };

        this.mousePressed = function(e){
            if (this.state != PRESSED_OVER && this.state != PRESSED_OUT && e.isActionMask()){
                this.updateState(PRESSED_OVER);
            }
        };

        this.mouseReleased = function(e){
            if ((this.state == PRESSED_OVER || this.state == PRESSED_OUT) && e.isActionMask()){
                this.updateState(e.x >= 0 && e.y >= 0 && e.x < this.width && e.y < this.height ? OVER : OUT);
            }
        };

        this.mouseDragged = function(e){
            if (e.isActionMask()) {
                var pressed = (this.state == PRESSED_OUT || this.state == PRESSED_OVER);
                if (e.x > 0 && e.y > 0 && e.x < this.width && e.y < this.height) {
                    this.updateState(pressed ? PRESSED_OVER : OVER);
                }
                else {
                    this.updateState(pressed ? PRESSED_OUT : OUT);
                }
            }
        };

        this.canHaveFocus = function() {
            return this.isCanHaveFocus;
        };

        this.paintOnTop = function(g){
            var fc = this.focusComponent;
            if (this.focusMarkerView != null && fc != null && this.hasFocus()) {
                this.focusMarkerView.paint(g, fc.x, fc.y, fc.width, fc.height, this);
            }
        };

        /**
         * Set the view that has to be rendered as focus marker when the component gains focus. 
         * @param  {String|zenra.ui.view|Fucntion} c a view. The view can be a color or border string 
         * code or view or an implementation of zebra.ui.View "paint(g,x,y,w,h,t)" method.   
         * @method setFocusMarkerView
         */
        this.setFocusMarkerView = function (c){
            if (c != this.focusMarkerView){
                this.focusMarkerView = pkg.$view(c);
                this.repaint();
            }
        };

        /**
         * Says if the component can hold focus or not
         * @param  {Boolean} b true if the component can gain focus
         * @method setCanHaveFocus
         */
        this.setCanHaveFocus = function(b){
            if (this.isCanHaveFocus != b){
                var fm = pkg.focusManager;
                if (b === false && fm.focusOwner == this) fm.requestFocus(null);
                this.isCanHaveFocus = b;
            }
        };

        /**
         * Set the specified children component to be used as focus marker view anchor component. 
         * Anchor component is a component over that the focus marker view is painted. 
         * @param  {zebra.ui.Panel} c  an anchor component
         * @method setFocusAnchorComponent
         */
        this.setFocusAnchorComponent = function(c) {
            if (this.focusComponent != c) {
                if (c != null && this.kids.indexOf(c) < 0) {
                    throw Error("Focus component doesn't exist");
                }
                this.focusComponent = c;
                this.isCanHaveFocus = (c != null);
                this.repaint();
            }
        };
    },

    function focused() {
        this.$super();
        this.repaint();
    },

    function setView(v){
        if (v != this.view){
            this.$super(v);
            this.stateUpdated(this.state, this.state);
        }
    },

    function setBorder(v){
        if(v != this.border){
            this.$super(v);
            this.stateUpdated(this.state, this.state);
        }
    },

    function setBackground(v){
        if(v != this.bg){
            this.$super(v);
            this.stateUpdated(this.state, this.state);
        }
    },

    function setEnabled(b){
        this.$super(b);
        this.updateState(b ? OUT : DISABLED);
    },

    function kidRemoved(i,l){
        if (l == this.focusComponent) this.focusComponent = null;
        this.$super(i, l);
    }
]);

/**
 *  Button UI component. 
 *  @class  zebra.ui.Button
 *  @constructor
 *  @param {String|zebra.ui.Panel} [t] a button label. 
 *  The label can be a simple text or an UI component.
 *  @extends zebra.ui.StatePan
 */
pkg.Button = Class(pkg.StatePan, Actionable, [
    function $clazz() {
        this.Label = Class(pkg.Label, []);
    },

    function $prototype() {
        this.isCanHaveFocus = true;

        /**
         * Indicate if the button should
         * fire event by pressed event
         * @attribute isFireByPress 
         * @type {Boolean}
         * @default false
         * @readOnly
         */
        this.isFireByPress = false;
        
        /**
         * Fire button event repeating period. -1 means
         * the button event repeating is disabled. 
         * @attribute firePeriod 
         * @type {Integer}
         * @default -1
         * @readOnly
         */
        this.firePeriod = -1;

        this.fire = function() {
            this._.fired(this);
            if (this.catchFired) this.catchFired();
        };

        this.run  = function() {
            if (this.state == PRESSED_OVER) this.fire();
        };

        /**
         * Set the mode the button has to fire events. 
         * Button can fire event after it has been unpressed 
         * or immediately when it has been pressed. Also button 
         * can start firing events periodically when it has been 
         * pressed and holden in the pressed state.
         * @param  {Boolean} b   true if the button has to fire 
         * event by pressed event
         * @param  {Integer} time the period of time the button 
         * has to repeat firing events if it has been pressed and 
         * holden in pressed state. -1 means event doesn't have 
         * repeated  
         * @method setFireParams
         */
        this.setFireParams = function (b,time){
            this.isFireByPress = b;
            this.firePeriod = time;
        };
    },

    function() {
        this.$this(null);
    },

    function (t){
        this._ = new Listeners();
        if (zebra.isString(t)) t = new pkg.Button.Label(t);
        this.$super();
        if (t != null) {
            this.add(t);
            this.setFocusAnchorComponent(t);
        }
    },

    function stateUpdated(o,n){
        this.$super(o, n);
        if(n == PRESSED_OVER){
            if(this.isFireByPress){
                this.fire();
                if (this.firePeriod > 0) {
                    timer.start(this, 400, this.firePeriod);
                }
            }
        }
        else {
            if (this.firePeriod > 0 && timer.get(this) != null) {
                timer.stop(this);
            }

            if (n == OVER && (o == PRESSED_OVER && this.isFireByPress === false)) {
                this.fire();
            }
        }
    }
]);

/**
 *  Border panel UI component. The component render titled 
 *  border around the given children content UI component.
 *  Border title can be placed on top or bottom border line 
 *  and aligned horizontally (left, center, right). Any 
 *  zebra UI component can be used as a border title element.
 *  @param {zebra.ui.Panel|String} [title] a border panel 
 *  title. Can be a string or any other UI component can be 
 *  used as the border panel title
 *  @param {zebra.ui.Panel} [content] a content UI component 
 *  of the border panel 
 *  @param {Integer} [constraints] a title constraints. 
 *  The constraints gives a possibility to place border 
 *  panel title in different places. Generally the title can 
 *  be placed on the top or bottom part of the border panel.
 *  Also the title can be aligned horizontally. 
        
         // create border panel with a title located at the 
         // top and aligned at the canter   
         var bp = new zebra.ui.BorderPan("Title", 
                                         new zebra.ui.Panel(),
                                         zebra.layout.TOP | zebra.layout.CENTER);

 
 *  @constructor
 *  @class zebra.ui.BorderPan
 *  @extends {zebra.ui.Panel}
 */
pkg.BorderPan = Class(pkg.Panel, [
    function $clazz() {
        this.Label = Class(pkg.Label, []);
    },

    function $prototype() {
        /**
         * Vertical gap. Define top and bottom paddings between
         * border panel border and the border panel content 
         * @attribute vGap 
         * @type {Ineteger}
         * @readOnly
         * @default 0
         */

         /**
          * Horizontal gap. Define left and right paddings between
          * border panel border and the border panel content 
          * @attribute hGap 
          * @type {Ineteger}
          * @readOnly
          * @default 0
          */
         this.vGap = this.hGap = 0;

         /**
          * Border panel label indent 
          * @type {Integer}
          * @attribute indent
          * @default 4
          */
         this.indent = 4;

         this.getTitleInfo = function() {
            return (this.label != null) ? { x:this.label.x, y:this.label.y,
                                            width:this.label.width, height:this.label.height,
                                            orient:this.label.constraints & (L.TOP | L.BOTTOM) }
                                        : null;
        };

        this.calcPreferredSize = function(target){
            var ps = this.center != null && this.center.isVisible ? this.center.getPreferredSize()
                                                                  : { width:0, height:0 };
            if (this.label != null && this.label.isVisible){
                var lps = this.label.getPreferredSize();
                ps.height += lps.height;
                ps.width = Math.max(ps.width, lps.width + this.indent);
            }
            ps.width  += (this.hGap * 2);
            ps.height += (this.vGap * 2);
            return ps;
        };

        this.doLayout = function (target){
            var h = 0, right = this.getRight(),
                top = this.getTop(),
                bottom = this.getBottom(), left = this.getLeft(),
                xa = this.label ? this.label.constraints & (L.LEFT | L.CENTER | L.RIGHT): 0,
                ya = this.label ? this.label.constraints & (L.BOTTOM | L.TOP) : 0;

            if (this.label != null && this.label.isVisible){
                var ps = this.label.getPreferredSize();
                h = ps.height;
                this.label.setSize(ps.width, h);
                this.label.setLocation((xa == L.LEFT) ? left + this.indent
                                                      : ((xa == L.RIGHT) ? this.width - right - ps.width - this.indent
                                                                         : ~~((this.width - ps.width) / 2)),
                                        (ya == L.BOTTOM) ? (this.height - bottom - ps.height) : top);
            }

            if (this.center != null && this.center.isVisible){
                this.center.setLocation(left + this.hGap, 
                                        (ya == L.BOTTOM ? top : top + h) + this.vGap);
                this.center.setSize(this.width - right - left - 2 * this.hGap,
                                    this.height - top - bottom - h - 2 * this.vGap);
            }
        };

        /**
         * Set vertical and horizontal paddings between the
         * border panel border and the content of the border 
         * panel  
         * @param {Integer} vg a top and bottom paddings 
         * @param {Integer} hg a left and right paddings
         * @method setGaps 
         */
        this.setGaps = function(vg,hg){
            if(this.vGap != vg || hg != this.hGap){
                this.vGap = vg;
                this.hGap = hg;
                this.vrp();
            }
        };
    },

    function(title) {
        this.$this(title, null);
    },
    
    function() {
        this.$this(null);
    },
    
    function(title, center) {
        this.$this(title, center, L.TOP | L.LEFT);
    },

    function(title, center, ctr){
        if (zebra.isString(title)) title = new pkg.BorderPan.Label(title);
        this.label = this.center = null;
        this.$super();
        if (title  != null) this.add(L.$constraints(ctr), title);
        if (center != null) this.add(L.CENTER, center);
    },

    function kidAdded(index,id,lw){
        this.$super(index, id, lw);
        if(L.CENTER == id) this.center = lw;
        else this.label = lw;
    },

    function kidRemoved(index,lw){
        this.$super(index, lw);
        if(lw == this.label) this.label = null;
        else this.center = null;
    }
]);

/**
 * The standard UI checkbox component switch manager implementation. The manager holds
 * boolean state of a checkbox UI component. There are few ways how a checkbox can 
 * switch its state: standard checkbox or radio group. In general we have a deal with 
 * one switchable UI component that can work in different modes. Thus we can re-use 
 * one UI, but customize it with appropriate switch manager. That is the main idea of 
 * having the class.
 * @constructor
 * @class  zebra.ui.SwitchManager
 */

/**
 * Fired when a state has been updated
        
        var ch = new zebra.ui.Checkbox("Test");
        ch.manager._.add(function (src, ui) {
            ...
        });

 * @event stateUpdated
 * @param {zebra.ui.SwitchManager} src a switch manager that controls and tracks the event 
 * @param {zebra.ui.Checkbox} ui  an UI component that triggers the event
 */
pkg.SwitchManager = Class([
    function $prototype() {
        /**
         * Get current state of the given UI component 
         * @param  {zebra.ui.Checkbox} o an ui component
         * @return {Boolean}  a boolean state
         * @method getState
         */
        this.getState = function(o) { return this.state; };

        /**
         * Set the state for the given UI component
         * @param  {zebra.ui.Checkbox} o an ui component
         * @param  {Boolean} b  a boolean state
         * @method setState
         */
        this.setState = function(o,b) {
            if (this.getState(o) != b){
                this.state = b;
                this.updated(o, b);
            }
        };

        /**
         * Called every time a state has been updated.
         * @param  {zebra.ui.Checkbox} o an ui component for which the state has been updated
         * @param  {Boolean} b  a new boolean state of the UI component 
         * @method stateUpdated
         */
        this.updated = function(o, b){
            if (o != null) o.switched(b);
            this._.fired(this, o);
        };

        /**
         * Call when the manager has been installed for the given UI component
         * @protected
         * @param  {zebra.ui.Checkbox} o an UI component the switch manager is designated  
         * @method install
         */
        this.install = function(o) { 
            o.switched(this.getState(o)); 
        };
        
        /**
         * Call when the manager has been uninstalled for the given UI component
         * @protected
         * @param  {zebra.ui.Checkbox} o an UI component the switch manager is not anymore used
         * @method uninstall
         */
        this.uninstall = function(o) {};

        this[''] = function() {
            this.state = false;
            this._ = new Listeners();
        };
    }
]);

/**
 * Radio group switch manager implementation. This is an extension of "zebra.ui.SwicthManager" to 
 * support radio group switching behavior. You can use it event with normal checkbox:
 
       // create group of check boxes that will work as a radio group
       var gr = new zebra.ui.Group();
       var ch1 = new zebra.ui.Checkbox("Test 1", gr);
       var ch2 = new zebra.ui.Checkbox("Test 2", gr);
       var ch3 = new zebra.ui.Checkbox("Test 3", gr);
 
 * @class  zebra.ui.Group
 * @constructor
 * @extends zebra.ui.SwitchManager
 */
pkg.Group = Class(pkg.SwitchManager, [
    function (){
        this.$super();
        this.state = null;
    },

    function $prototype() {
        this.getState = function(o) {
            return o == this.state;
        };

        this.setState = function(o,b){
            if (this.getState(o) != b){
                this.clearSelected();
                this.state = o;
                this.updated(o, true);
            }
        };

        this.clearSelected = function() {
            if (this.state != null){
                var old = this.state;
                this.state = null;
                this.updated(old, false);
            }
        };
    }
]);

/**
 * Check-box UI component. The component is a container that 
 * consists from two other UI components: 
    
    - Box component to keep checker indicator
    - Label component to paint label 

 * Developers are free to customize the component as they want. 
 * There is no limitation regarding how the box and label components 
 * have to be laid out, which UI components have to be used as 
 * the box or label components, etc. The check box extends state 
 * panel component and re-map states  to own views IDs:
    
    - "on.out" - checked and mouse cursor is out 
    - "off.out" - un-checked and mouse cursor is out 
    - "don" - disabled and checked, 
    - "doff" - disabled and un-checked , 
    - "on.over" - checked and mouse cursor is over 
    - "off.over" - un-checked and mouse cursor is out

 *
 * Customize is quite similar to what explained for zebra.ui.StatePan:
 *
 
        // create checkbox component 
        var ch = new zebra.ui.Checkbox("Checkbox");

        // change border when the component checked to green
        // otherwise set it to red
        ch.setBorder(new zebra.ui.ViewSet({
            "off.*": new zebra.ui.Border("red"),
            "on.*": new zebra.ui.Border("green")
        }));

        // customize checker box children UI component to show
        // green for checked and red for un-cheked states 
        ch.kids[0].setView(new zebra.ui.ViewSet({
            "off.*": "red",
            "on.*": "green"
        }));
        // sync current state with new look and feel
        ch.sync();
  
 * Listening checked event should be done by registering a 
 * listener in the check box switch manager as follow:
 
        // create checkbox component 
        var ch = new zebra.ui.Checkbox("Checkbox");

        // register a checkbox listener
        ch.manager._.add(function(sm) {
            var s = sm.getState();
            ...
        });

 * @class  zebra.ui.Checkbox
 * @extends zebra.ui.StatePan
 * @constructor 
 * @param {String|zebra.ui.Panel} [label] a label 
 * @param {zebra.ui.SwitchManager} [m] a switch manager 
 */
pkg.Checkbox = Class(pkg.StatePan, [
    function $clazz() {
        var IDS = ["on.out", "off.out", "don", "doff", "on.over", "off.over"];

        /**
         * The box UI component class that is used by default with 
         * the check box component.
         * @constructor
         * @class zebra.ui.Checkbox.Box
         * @extends zebra.ui.ViewPan
         */
        this.Box = Class(pkg.ViewPan, [
            function parentStateUpdated(o, n, id) {
                this.view.activate(id);
                this.repaint();
            }
        ]);

        /**
         * @for zebra.ui.Checkbox
         */
        this.Label = Class(pkg.Label, []);
    },

    function $prototype() {
        /**
         * Set the check box state 
         * @param  {Boolean} b a state
         * @method setValue
         */
        this.setValue = function(b) {
            return this.setState(b);
        };

        /**
         * Get the check box state 
         * @return {Boolean} a check box state
         * @method getValue
         */
        this.getValue = function() {
            return this.getState();
        };

        /**
         * Set the check box state 
         * @param  {Boolean} b a state
         * @method setState
         * @deprecated use setValue method instead 
         */
        this.setState = function(b){ 
            this.manager.setState(this, b);
            return this;
        };

        /**
         * Get the check box state 
         * @return {Boolean} a check box state
         * @method getState
         * @deprecated use getValue method
         */
        this.getState = function() {
            return this.manager ? this.manager.getState(this) : false;
        };
      
        this.switched = function(b){
            this.stateUpdated(this.state, this.state);
        };

        this.idByState = function(state){
            if (this.isEnabled) {
                if (this.getState()) { 
                    return (this.state == OVER) ? "on.over" : "on.out";
                }
                return (this.state == OVER) ? "off.over" : "off.out";
            }
            return this.getState() ? "don" : "doff";
        };
    },

    function () { this.$this(null); },

    function (c){
        this.$this(c, new pkg.SwitchManager());
    },

    function (c, m) {
        var clazz = this.getClazz();
        if (zebra.isString(c)) {
            c = clazz.Label ? new clazz.Label(c) : new pkg.Checkbox.Label(c);
        }
        
        this.$super();
        
        this.box = clazz.Box ? new clazz.Box() : new pkg.Checkbox.Box();
        this.add(this.box);
        
        if (c != null) {
            this.add(c);
            this.setFocusAnchorComponent(c);
        }
        this.setSwitchManager(m);
    },

    function keyPressed(e){
        if(instanceOf(this.manager, pkg.Group) && this.getState()){
            var code = e.code, d = 0;
            if (code == KE.LEFT || code == KE.UP) d = -1;
            else {
                if (code == KE.RIGHT || code == KE.DOWN) d = 1;
            }

            if(d !== 0) {
                var p = this.parent, idx = p.indexOf(this);
                for(var i = idx + d;i < p.kids.length && i >= 0; i += d){
                    var l = p.kids[i];
                    if (l.isVisible &&
                        l.isEnabled &&
                        instanceOf(l, pkg.Checkbox) &&
                        l.manager == this.manager      )
                    {
                        l.requestFocus();
                        l.setState(true);
                        break;
                    }
                }
                return ;
            }
        }
        this.$super(e);
    },

    /**
     * Set the specified switch manager 
     * @param {zebra.ui.SwicthManager} m a switch manager
     * @method setSwicthManager
     */
    function setSwitchManager(m){
        /**
         * A switch manager
         * @attribute manager
         * @readOnly
         * @type {zebra.ui.SwitchManager}
         */

        if (m == null) { 
            throw new Error("Null switch manager");
        }

        if (this.manager != m) {
            if (this.manager != null) this.manager.uninstall(this);
            this.manager = m;
            this.manager.install(this);
        }
    },

    function stateUpdated(o, n) {
        if (o == PRESSED_OVER && n == OVER) this.setState(!this.getState());
        this.$super(o, n);
    },

    function kidRemoved(index,c) {
        if (this.box == c) {
            this.box = null;
        }
        this.$super(index,c);
    }
]);

/**
 * Radio-box UI component class. This class is extension of "zebra.ui.Checkbox" class that sets group 
 * as a default switch manager. The other functionality id identical to checkbox component. Generally 
 * speaking this class is a shortcut for radio box creation.  
 * @class  zebra.ui.Radiobox
 * @constructor 
 * @param {String|zebra.ui.Panel} [label] a label 
 * @param {zebra.ui.Group} [m] a switch manager 
 */
pkg.Radiobox = Class(pkg.Checkbox, [
    function $clazz() {
        this.Box   = Class(pkg.Checkbox.Box, []);
        this.Label = Class(pkg.Checkbox.Label, []);
    },

    function(c) {
        this.$this(c, new pkg.Group());
    },

    function(c, group) {
        this.$super(c, group);
    }
]);

/**
 * Splitter panel UI component class. The component splits its area horizontally or vertically into two areas. 
 * Every area hosts an UI component. A size of the parts can be controlled by mouse cursor dragging. Gripper 
 * element is children UI component that can be customized. For instance:
 
      // create split panel
      var sp = new zebra.ui.SplitPan(new zebra.ui.Label("Left panel"), 
                                    new zebra.ui.Label("Right panel")); 
      
      // customize gripper background color depending on its state
      sp.gripper.setBackground(new zebra.ui.ViewSet({
           "over" : "yellow"
           "out" : null,
           "pressed.over" : "red"
      }));


 * @param {zebra.ui.Panel} [first] a first UI component in splitter panel 
 * @param {zebra.ui.Panel} [second] a second UI component in splitter panel
 * @param {Integer} [o] an orientation of splitter element: zebra.layout.VERTICAL or zebra.layout.HORIZONTAL 
 * @class zebra.ui.SplitPan
 * @constructor
 * @extends {zebra.ui.Panel}
 */
pkg.SplitPan = Class(pkg.Panel, [
    function $clazz() {
        this.Bar = Class(pkg.StatePan, MouseListener, [
            function $prototype() {
                this.mouseDragged = function(e){
                    var x = this.x + e.x, y = this.y + e.y;
                    if (this.target.orientation == L.VERTICAL){
                        if (this.prevLoc != x){
                            x = this.target.normalizeBarLoc(x);
                            if (x > 0){
                                this.prevLoc = x;
                                this.target.setGripperLoc(x);
                            }
                        }
                    }
                    else {
                        if (this.prevLoc != y){
                            y = this.target.normalizeBarLoc(y);
                            if (y > 0){
                                this.prevLoc = y;
                                this.target.setGripperLoc(y);
                            }
                        }
                    }
                };

                this.mouseDragStarted = function (e){
                    var x = this.x + e.x, y = this.y + e.y;
                    if (e.isActionMask()) {
                        if (this.target.orientation == L.VERTICAL){
                            x = this.target.normalizeBarLoc(x);
                            if (x > 0) this.prevLoc = x;
                        }
                        else {
                            y = this.target.normalizeBarLoc(y);
                            if (y > 0) this.prevLoc = y;
                        }
                    }
                };

                this.mouseDragEnded = function(e){
                    var xy = this.target.normalizeBarLoc(this.target.orientation == L.VERTICAL ? this.x + e.x : this.y + e.y);
                    if (xy > 0) this.target.setGripperLoc(xy);
                };

                this.getCursorType = function(t,x,y){
                    return this.target.orientation == L.VERTICAL ? Cursor.W_RESIZE
                                                                 : Cursor.N_RESIZE;
                };
            },

            function(target) {
                this.prevLoc = 0;
                this.target = target;
                this.$super();
            }
        ]);
    },

    function $prototype() {
        /**
         * A minimal size of the left (or top) sizable panel 
         * @attribute leftMinSize
         * @type {Integer}
         * @readOnly
         * @default 50
         */

        /**
         * A minimal size of right (or bottom) sizable panel
         * @attribute rightMinSize
         * @type {Integer}
         * @readOnly
         * @default 50
         */

        /**
         * Indicates if the splitter bar can be moved
         * @attribute isMoveable
         * @type {Boolean}
         * @readOnly
         * @default true
         */

        /**
         * A gap between gripper element and first and second UI components 
         * @attribute gap
         * @type {Integer}
         * @readOnly
         * @default 1
         */
        
        /**
         * A reference to gripper UI component
         * @attribute gripper
         * @type {zebra.ui.Panel}
         * @readOnly
         */

        /**
         * A reference to left (top) sizable UI component
         * @attribute leftComp
         * @type {zebra.ui.Panel}
         * @readOnly
         */

        /**
         * A reference to right (bottom) sizable UI component
         * @attribute rightComp
         * @type {zebra.ui.Panel}
         * @readOnly
         */

        this.leftMinSize = this.rightMinSize = 50;
        this.isMoveable = true;
        this.gap = 1;

        this.normalizeBarLoc = function(xy){

            if (xy < this.minXY) xy = this.minXY;
            else {
                if (xy > this.maxXY) xy = this.maxXY;
            }

            return (xy > this.maxXY || xy < this.minXY) ?  -1 : xy;
        };

        /**
         * Set gripper element location
         * @param  {Integer} l a location of the gripper element
         * @method setGripperLoc
         */
        this.setGripperLoc = function(l){
            if (l != this.barLocation){
                this.barLocation = l;
                this.vrp();
            }
        };

        this.calcPreferredSize = function(c){
            var fSize = pkg.getPreferredSize(this.leftComp),
                sSize = pkg.getPreferredSize(this.rightComp),
                bSize = pkg.getPreferredSize(this.gripper);

            if(this.orientation == L.HORIZONTAL){
                bSize.width = Math.max(((fSize.width > sSize.width) ? fSize.width : sSize.width), bSize.width);
                bSize.height = fSize.height + sSize.height + bSize.height + 2 * this.gap;
            }
            else{
                bSize.width = fSize.width + sSize.width + bSize.width + 2 * this.gap;
                bSize.height = Math.max(((fSize.height > sSize.height) ? fSize.height : sSize.height), bSize.height);
            }
            return bSize;
        };

        this.doLayout = function(target){
            var right  = this.getRight(),
                top    = this.getTop(),
                bottom = this.getBottom(),
                left   = this.getLeft(),
                bSize  = pkg.getPreferredSize(this.gripper);

            if (this.orientation == L.HORIZONTAL){
                var w = this.width - left - right;
                if (this.barLocation < top) this.barLocation = top;
                else {
                    if (this.barLocation > this.height - bottom - bSize.height) {
                        this.barLocation = this.height - bottom - bSize.height;
                    }
                }

                if (this.gripper != null){
                    if(this.isMoveable){
                        this.gripper.setLocation(left, this.barLocation);
                        this.gripper.setSize(w, bSize.height);
                    }
                    else{
                        this.gripper.setSize(bSize.width, bSize.height);
                        this.gripper.toPreferredSize();
                        this.gripper.setLocation(~~((w - bSize.width) / 2), this.barLocation);
                    }
                }
                if(this.leftComp != null){
                    this.leftComp.setLocation(left, top);
                    this.leftComp.setSize(w, this.barLocation - this.gap - top);
                }
                if(this.rightComp != null){
                    this.rightComp.setLocation(left, this.barLocation + bSize.height + this.gap);
                    this.rightComp.setSize(w, this.height - this.rightComp.y - bottom);
                }
            }
            else {
                var h = this.height - top - bottom;
                if(this.barLocation < left) this.barLocation = left;
                else {
                    if (this.barLocation > this.width - right - bSize.width) {
                        this.barLocation = this.width - right - bSize.width;
                    }
                }

                if (this.gripper != null){
                    if(this.isMoveable){
                        this.gripper.setLocation(this.barLocation, top);
                        this.gripper.setSize(bSize.width, h);
                    }
                    else{
                        this.gripper.setSize(bSize.width, bSize.height);
                        this.gripper.setLocation(this.barLocation, ~~((h - bSize.height) / 2));
                    }
                }

                if (this.leftComp != null){
                    this.leftComp.setLocation(left, top);
                    this.leftComp.setSize(this.barLocation - left - this.gap, h);
                }

                if(this.rightComp != null){
                    this.rightComp.setLocation(this.barLocation + bSize.width + this.gap, top);
                    this.rightComp.setSize(this.width - this.rightComp.x - right, h);
                }
            }
        };

        /**
         * Set gap between gripper element and sizable panels 
         * @param  {Integer} g a gap
         * @method setGap
         */
        this.setGap = function (g){
            if(this.gap != g){
                this.gap = g;
                this.vrp();
            }
        };

        /**
         * Set the minimal size of the left (or top) sizeable panel
         * @param  {Integer} m  a minimal possible size
         * @method setLeftMinSize
         */
        this.setLeftMinSize = function (m){
            if(this.leftMinSize != m){
                this.leftMinSize = m;
                this.vrp();
            }
        };

        /**
         * Set the minimal size of the right (or bottom) sizeable panel
         * @param  {Integer} m  a minimal possible size
         * @method setRightMinSize
         */
        this.setRightMinSize = function(m){
            if(this.rightMinSize != m){
                this.rightMinSize = m;
                this.vrp();
            }
        };

        /**
         * Set the given gripper movable state
         * @param  {Boolean} b the gripper movable state. 
         * @method setGripperMovable
         */
        this.setGripperMovable = function (b){
            if(b != this.isMoveable){
                this.isMoveable = b;
                this.vrp();
            }
        };
    },

    function ()   {
        this.$this(null, null, L.VERTICAL);
    },

    function (f,s) {
        this.$this(f, s, L.VERTICAL);
    },

    function (f,s,o){
        this.minXY = this.maxXY = 0;
        this.barLocation = 70;
        this.leftComp = this.rightComp = this.gripper = null;
        this.orientation = L.$constraints(o);
        
        this.$super();

        if (f != null) this.add(L.LEFT, f);
        if (s != null) this.add(L.RIGHT, s);
        this.add(L.CENTER, new pkg.SplitPan.Bar(this));
    },

    function kidAdded(index,id,c){
        this.$super(index, id, c);
        if (L.LEFT == id) this.leftComp = c;
        else {
            if (L.RIGHT == id) this.rightComp = c;
            else {
                if (L.CENTER == id) this.gripper = c;
                else throw new Error($invalidC);
            }
        }
    },

    function kidRemoved(index,c){
        this.$super(index, c);
        if (c == this.leftComp) this.leftComp = null;
        else {
            if (c == this.rightComp) {
                this.rightComp = null;
            }
            else {
                if (c == this.gripper) this.gripper = null;
            }
        }
    },

    function resized(pw,ph) {
        var ps = this.gripper.getPreferredSize();
        if (this.orientation == L.VERTICAL){
            this.minXY = this.getLeft() + this.gap + this.leftMinSize;
            this.maxXY = this.width - this.gap - this.rightMinSize - ps.width - this.getRight();
        }
        else {
            this.minXY = this.getTop() + this.gap + this.leftMinSize;
            this.maxXY = this.height - this.gap - this.rightMinSize - ps.height - this.getBottom();
        }
        this.$super(pw, ph);
    }
]);

/**
 * Progress bar UI component class.                                                                                                                                                                                                                           y -= (bundleSize + this.gap   [description]
 * @class zebra.ui.Progress
 * @constructor
 * @extends {zebra.ui.Panel}
 */

/**
 * Fired when a progress bar value has been updated

        progress._.add(function(src, oldValue) {
            ...
        });

 *  @event valueUpdated 
 *  @param {zebra.ui.Progress} src a progress bar that triggers 
 *  the event 
 *  @param {Integer} oldValue a progress bar previous value
 */

pkg.Progress = Class(pkg.Panel, Actionable, [
    function $prototype() {
        /**
         * Gap between bundle elements
         * @default 2
         * @attribute gap
         * @type {Integer}
         * @readOnly
         */
        this.gap = 2;

        /**
         * Progress bar orientation
         * @default zebra.layout.HORIZONTAL
         * @attribute orientation
         * @type {Integer}
         * @readOnly
         */
        this.orientation = L.HORIZONTAL;

        this.paint = function(g){
            var left = this.getLeft(), right = this.getRight(),
                top = this.getTop(), bottom = this.getBottom(),
                rs = (this.orientation == L.HORIZONTAL) ? this.width - left - right
                                                        : this.height - top - bottom,
                bundleSize = (this.orientation == L.HORIZONTAL) ? this.bundleWidth
                                                                : this.bundleHeight;

            if (rs >= bundleSize){
                var vLoc = ~~((rs * this.value) / this.maxValue),
                    x = left, y = this.height - bottom, bundle = this.bundleView,
                    wh = this.orientation == L.HORIZONTAL ? this.height - top - bottom
                                                          : this.width - left - right;

                while(x < (vLoc + left) && this.height - vLoc - bottom < y){
                    if(this.orientation == L.HORIZONTAL){
                        bundle.paint(g, x, top, bundleSize, wh, this);
                        x += (bundleSize + this.gap);
                    }
                    else{
                        bundle.paint(g, left, y - bundleSize, wh, bundleSize, this);
                        y -= (bundleSize + this.gap);
                    }
                }

                if (this.titleView != null){
                    var ps = this.bundleView.getPreferredSize();
                    this.titleView.paint(g, L.xAlignment(ps.width, L.CENTER, this.width),
                                            L.yAlignment(ps.height, L.CENTER, this.height),
                                            ps.width, ps.height, this);
                }
            }
        };

        this.calcPreferredSize = function(l){
            var bundleSize = (this.orientation == L.HORIZONTAL) ? this.bundleWidth
                                                                : this.bundleHeight,
                v1 = (this.maxValue * bundleSize) + (this.maxValue - 1) * this.gap,
                ps = this.bundleView.getPreferredSize();

            ps = (this.orientation == L.HORIZONTAL) ? { 
                                                        width :v1,
                                                        height:(this.bundleHeight >= 0 ? this.bundleHeight
                                                                                       : ps.height)
                                                      }
                                                    : {
                                                        width:(this.bundleWidth >= 0 ? this.bundleWidth
                                                                                     : ps.width),
                                                        height: v1
                                                      };
            if (this.titleView != null) {
                var tp = this.titleView.getPreferredSize();
                ps.width  = Math.max(ps.width, tp.width);
                ps.height = Math.max(ps.height, tp.height);
            }
            return ps;
        };
    },

    function (){
        /**
         * Progress bar value
         * @attribute value
         * @type {Integer}
         * @readOnly
         */
        this.value = 0;
        this.setBundleView("darkBlue");

        /**
         * Progress bar bundle width
         * @attribute bundleWidth
         * @type {Integer}
         * @readOnly
         * @default 6
         */

        /**
         * Progress bar bundle height
         * @attribute bundleHeight
         * @type {Integer}
         * @readOnly
         * @default 6
         */

        this.bundleWidth = this.bundleHeight = 6;

        /**
         * Progress bar maximal value
         * @attribute maxValue
         * @type {Integer}
         * @readOnly
         * @default 20
         */
        this.maxValue = 20;
        this._ = new Listeners();
        this.$super();
    },

    /**
     * Set the progress bar orientation
     * @param {Integer} o an orientation: zebra.layout.VERTICAL or zebra.layout.HORIZONTAL
     * @method setOrientation
     */
    function setOrientation(o){
        o = L.$constraints(o);
        if (o != L.HORIZONTAL && o != L.VERTICAL) {
            throw new Error($invalidO);
        }
        if (o != this.orientation){
            this.orientation = o;
            this.vrp();
        }
    },

    /**
     * Set maximal integer value the progress bar value can rich
     * @param {Integer} m a maximal value the progress bar value can rich
     * @method setMaxValue
     */
    function setMaxValue(m){
        if(m != this.maxValue){
            this.maxValue = m;
            this.setValue(this.value);
            this.vrp();
        }
    },

    /**
     * Set the current progress bar value
     * @param {Integer} p a progress bar
     * @method setValue
     */
    function setValue(p){
        p = p % (this.maxValue + 1);
        if (this.value != p){
            var old = this.value;
            this.value = p;
            this._.fired(this, old);
            this.repaint();
        }
    },

    /**
     * Set the given gap between progress bar bundle elements 
     * @param {Integer} g a gap
     * @method setGap
     */
    function setGap(g){
        if (this.gap != g){
            this.gap = g;
            this.vrp();
        }
    },

    /**
     * Set the progress bar bundle element view
     * @param {zebra.ui.View} v a progress bar bundle view
     * @method setBundleView   
     */
    function setBundleView(v){
        if (this.bundleView != v){
            this.bundleView = pkg.$view(v);
            this.vrp();
        }
    },

    /**
     * Set the progress bar bundle element size
     * @param {Integer} w a bundle element width
     * @param {Integer} h a bundle element height
     * @method setBundleSize
     */
    function setBundleSize(w, h){
        if (w != this.bundleWidth && h != this.bundleHeight){
            this.bundleWidth  = w;
            this.bundleHeight = h;
            this.vrp();
        }
    }
]);

/**
 * UI link component class.
 * @class zebra.ui.Link
 * @param {String} s a link text
 * @constructor
 * @extends {zebra.ui.Button}
 */
pkg.Link = Class(pkg.Button, [
    function $prototype() {
        this.cursorType = Cursor.HAND; 
    },

    function(s){
        this.$super(null);
        var font = this.getClazz()["font"];
        if (font == null) font = pkg.Link.font;

        this.setView(new pkg.TextRender(s));
        this.view.setFont(font);
        this.stateUpdated(this.state, this.state);


    },

    /**
     * Set the link text color for the specified link state
     * @param {Integer} state a link state 
     * @param {String} c a link text color
     * @method  setColor
     */
    function setColor(state,c){
        if (this.colors[state] != c){
            this.colors[state] = c;
            this.stateUpdated(state, state);
        }
    },

    function stateUpdated(o,n){
        this.$super(o, n);
        var r = this.view;
        if (r && r.color != this.colors[n]){
            r.setColor(this.colors[n]);
            this.repaint();
        }
    }
]);

/**
 * Extender UI component class
 * @constructor
 * @class zebra.ui.Extender
 * @extends {zebra.ui.Panel}
 * @param {zebra.ui.Panel} c a content of the extender panel
 * @param {zebra.ui.Panel|String} l a title label text or 
 * component
 */

 /**
  * Fired when extender is collapsed or extended 
         
         var ex = new zebra.ui.Extender(pan, "Title");
         ex._.add(function (src, isCollapsed) {
             ...
         });

  * @event fired
  * @param {zebra.ui.Extender} src an extender UI component that generates the event
  * @param {Boolean} isCollapsed a state of the extender UI component 
  */

pkg.Extender = Class(pkg.Panel, [
    function $prototype() {
        /**
         * Toogle on toogle off the extender panel
         * @method toggle
         */
        this.toggle = function(){
            this.isCollapsed = this.isCollapsed ? false : true;
            this.contentPan.setVisible(!this.isCollapsed);
            this.togglePan.view.activate(this.isCollapsed ? "off" : "on");
            this.repaint();

            if (this._) {
                this._.fired(this, this.isCollapsed);
            }
        };
    },

    function $clazz() {
        this.Label = Class(pkg.Label,[]);
        this.TitlePan = Class(pkg.Panel, []);
        
        this.TogglePan = Class(pkg.ViewPan, MouseListener, [
            function $prototype() {
                this.mousePressed = function(e){
                    if (e.isActionMask()) {
                        this.parent.parent.toggle();
                    }
                };

                this.setViews = function(v) {
                    this.setView(new pkg.ViewSet(v));
                };

                this.cursorType = Cursor.HAND;
            }
        ]);
    },

    function (content, lab){
        /**
         * Indicate if the extender panel is collapsed
         * @type {Boolean}
         * @attribute isCollapsed
         * @readOnly
         * @default false
         */
        this.isCollapsed = true;
        this.$super();
        if (zebra.isString(lab)) {
            lab = new pkg.Extender.Label(lab);
        }

        /**
         * Label component 
         * @attribute label
         * @type {zebra.ui.Panel}
         * @readOnly
         */
        this.label = lab;


        this.titlePan = new pkg.Extender.TitlePan();
        this.add(L.TOP, this.titlePan);

        this.togglePan = new pkg.Extender.TogglePan();
        this.titlePan.add(this.togglePan);
        this.titlePan.add(this.label);

        /**
         * Content panel 
         * @type {zebra.ui.Panel}
         * @readOnly
         * @attribute contentPan
         */
        this.contentPan = content;
        this.contentPan.setVisible(!this.isCollapsed);
        this.add(L.CENTER, this.contentPan);

        this.toggle();

        this._ = new Listeners();
    }
]);

var ScrollManagerListeners = Listeners.Class("scrolled");

/**
 * Scroll manager class. 
 * @param {zebra.ui.Panel} t a target component to be scrolled
 * @constructor
 * @class zebra.ui.ScrollManager
 */

 /**
  * Fired when a target component has been scrolled

        scrollManager._.add(function(px, py) {
            ...
        });

  * @event scrolled
  * @param  {Integer} px a previous x location target component scroll location
  * @param  {Integer} py a previous y location target component scroll location
  */

pkg.ScrollManager = Class([
    function $prototype() {
        /**
         * Get current target component x scroll location
         * @return {Integer} a x scroll location
         * @method getSX
         */
        this.getSX = function (){ return this.sx; };

        /**
         * Get current target component y scroll location
         * @return {Integer} a y scroll location
         * @method getSY
         */
        this.getSY = function (){ return this.sy; };

        this.scrollXTo = function(v){ this.scrollTo(v, this.getSY()); };
        this.scrollYTo = function(v){ this.scrollTo(this.getSX(), v); };

        
        /**
         * Scroll the target component into the specified location
         * @param  {Integer} x a x location
         * @param  {Integer} y a y location
         * @method scrollTo
         */
        this.scrollTo = function(x, y){
            var psx = this.getSX(), psy = this.getSY();
            if (psx != x || psy != y){
                this.sx = x;
                this.sy = y;
                if (this.updated) this.updated(x, y, psx, psy);
                if (this.target.catchScrolled) this.target.catchScrolled(psx, psy);
                this._.scrolled(psx, psy);
            }
        };

        /**
         * Make visible the given rectangular area of the 
         * scrolled target component
         * @param  {Integer} x a x coordinate of top left corner 
         * of the rectangular area
         * @param  {Integer} y a y coordinate of top left corner 
         * of the rectangular area
         * @param  {Integer} w a width of the rectangular area
         * @param  {Integer} h a height of the rectangular area
         * @method makeVisible
         */
        this.makeVisible = function(x,y,w,h){
            var p = pkg.calcOrigin(x, y, w, h, this.getSX(), this.getSY(), this.target);
            this.scrollTo(p[0], p[1]);
        };
    },

    function (c){
        this.sx = this.sy = 0;
        this._ = new ScrollManagerListeners();
        this.target = c;
    }
]);

/**
 * Scroll bar UI component
 * @param {Integer} t type of the scroll bar components:
 
        zebra.layout.VERTICAL - vertical scroll bar
        zebra.layout.HORIZONTAL - horizontal scroll bar

 * @class zebra.ui.Scroll
 * @constructor
 * @extends {zebra.ui.Panel}
 */
pkg.Scroll = Class(pkg.Panel, MouseListener, zebra.util.Position.Metric, Composite, [
    function $clazz() {
        var SB = Class(pkg.Button, [
            function $prototype() {
                this.isDragable  = this.isFireByPress  = true;
                this.firePeriod  = 20;
            }
        ]);

        this.VIncButton = Class(SB, []);
        this.VDecButton = Class(SB, []);
        this.HIncButton = Class(SB, []);
        this.HDecButton = Class(SB, []);

        this.VBundle = Class(pkg.Panel, []);
        this.HBundle = Class(pkg.Panel, []);

        this.MIN_BUNDLE_SIZE = 16;
    },

    function $prototype() {
        /**
         * Maximal possible value 
         * @attribute max
         * @type {Integer}
         * @readOnly
         * @default 100
         */
        this.extra = this.max  = 100;

        /**
         * Page increment value
         * @attribute pageIncrement 
         * @type {Integer}
         * @readOnly
         * @default 20
         */
        this.pageIncrement = 20;

        /**
         * Unit increment value
         * @attribute unitIncrement 
         * @type {Integer}
         * @readOnly
         * @default 5
         */
        this.unitIncrement = 5;

        this.isInBundle = function(x,y){
            var bn = this.bundle;
            return (bn != null && 
                    bn.isVisible && 
                    bn.x <= x && bn.y <= y && 
                    bn.x + bn.width > x && 
                    bn.y + bn.height > y);
        };

        this.amount = function(){
            var db = this.decBt, ib = this.incBt;
            return (this.type == L.VERTICAL) ? ib.y - db.y - db.height 
                                             : ib.x - db.x - db.width;
        };

        this.pixel2value = function(p) {
            var db = this.decBt;
            return (this.type == L.VERTICAL) ? ~~((this.max * (p - db.y - db.height)) / (this.amount() - this.bundle.height))
                                             : ~~((this.max * (p - db.x - db.width )) / (this.amount() - this.bundle.width));
        };

        this.value2pixel = function(){
            var db = this.decBt, bn = this.bundle, off = this.position.offset;
            return (this.type == L.VERTICAL) ? db.y + db.height +  ~~(((this.amount() - bn.height) * off) / this.max)
                                             : db.x + db.width  +  ~~(((this.amount() - bn.width) * off) / this.max);
        };


        this.catchInput = function (child){
            return child == this.bundle || (this.bundle.kids.length > 0 &&
                                            L.isAncestorOf(this.bundle, child));
        };

        this.posChanged = function(target,po,pl,pc){
            if (this.bundle != null) {
                if (this.type == L.HORIZONTAL) this.bundle.setLocation(this.value2pixel(), this.getTop());
                else this.bundle.setLocation(this.getLeft(), this.value2pixel());
            }
        };

        this.getLines     = function (){ return this.max; };
        this.getLineSize  = function (line){ return 1; };
        this.getMaxOffset = function (){ return this.max; };

        this.fired = function(src){
            this.position.setOffset(this.position.offset + ((src == this.incBt) ? this.unitIncrement
                                                                                : -this.unitIncrement));
        };

        this.mouseDragged = function(e){
            if (Number.MAX_VALUE != this.startDragLoc) {
                this.position.setOffset(this.pixel2value(this.bundleLoc -
                                                         this.startDragLoc +
                                                         ((this.type == L.HORIZONTAL) ? e.x : e.y)));
            }
        };

        this.mouseDragStarted = function (e){
           //!!! It is more convenient to  if (this.isDragable || this.isInBundle(e.x, e.y)){
                this.startDragLoc = this.type == L.HORIZONTAL ? e.x : e.y;
                this.bundleLoc = this.type == L.HORIZONTAL ? this.bundle.x : this.bundle.y;
            //}
        };

        this.mouseDragEnded = function (e){ this.startDragLoc = Number.MAX_VALUE; };

        this.mouseClicked = function (e){
            if (this.isInBundle(e.x, e.y) === false && e.isActionMask()){
                var d = this.pageIncrement;
                if (this.type == L.VERTICAL){
                    if(e.y < (this.bundle != null ? this.bundle.y : ~~(this.height / 2))) d =  -d;
                }
                else {
                    if(e.x < (this.bundle != null ? this.bundle.x : ~~(this.width / 2))) d =  -d;
                }
                this.position.setOffset(this.position.offset + d);
            }
        };

        this.calcPreferredSize = function (target){
            var ps1 = pkg.getPreferredSize(this.incBt), 
                ps2 = pkg.getPreferredSize(this.decBt),
                ps3 = pkg.getPreferredSize(this.bundle);

            if (this.type == L.HORIZONTAL){
                ps1.width += (ps2.width + ps3.width);
                ps1.height = Math.max((ps1.height > ps2.height ? ps1.height : ps2.height), ps3.height);
            }
            else {
                ps1.height += (ps2.height + ps3.height);
                ps1.width = Math.max((ps1.width > ps2.width ? ps1.width : ps2.width), ps3.width);
            }
            return ps1;
        };

        this.doLayout = function(target){
            var right  = this.getRight(), 
                top    = this.getTop(), 
                bottom = this.getBottom(),
                left   = this.getLeft(), 
                ew     = this.width - left - right, 
                eh     = this.height - top - bottom,
                b      = (this.type == L.HORIZONTAL), 
                ps1    = pkg.getPreferredSize(this.decBt),
                ps2    = pkg.getPreferredSize(this.incBt),
                minbs  = pkg.Scroll.MIN_BUNDLE_SIZE;

            this.decBt.setSize(b ? ps1.width : ew, b ? eh : ps1.height);
            this.decBt.setLocation(left, top);

            this.incBt.setSize(b ? ps2.width : ew, b ? eh : ps2.height);
            this.incBt.setLocation(b ? this.width - right - ps2.width 
                                     : left, b ? top : this.height - bottom - ps2.height);

            if (this.bundle != null && this.bundle.isVisible){
                var am = this.amount();
                if (am > minbs) {
                    var bsize = Math.max(Math.min(~~((this.extra * am) / this.max), am - minbs), minbs);
                    this.bundle.setSize(b ? bsize : ew, b ? eh : bsize);
                    this.bundle.setLocation(b ? this.value2pixel() : left, b ? top : this.value2pixel());
                }
                else this.bundle.setSize(0, 0);
            }
        };

        /**
         * Set the specified maximum value of the scroll component 
         * @param {Inetger} m a maximum value
         * @method setMaximum
         */
        this.setMaximum = function (m){
            if(m != this.max){
                this.max = m;
                if (this.position.offset > this.max) this.position.setOffset(this.max);
                this.vrp();
            }
        };

        this.setPosition = function(p){
            if(p != this.position){
                if (this.position != null) this.position._.remove(this);
                this.position = p;
                if(this.position != null){
                    this.position._.add(this);
                    this.position.setMetric(this);
                    this.position.setOffset(0);
                }
            }
        };

        this.setExtraSize = function(e){
            if(e != this.extra){
                this.extra = e;
                this.vrp();
            }
        };
    },

    function(t) {
        if (t != L.VERTICAL && t != L.HORIZONTAL) {
            throw new Error($invalidA);
        }
        this.incBt = this.decBt = this.bundle = this.position = null;
        this.bundleLoc = this.type = 0;
        this.startDragLoc = Number.MAX_VALUE;
        this.$super(this);

        this.add(L.CENTER, t == L.VERTICAL ? new pkg.Scroll.VBundle()    : new pkg.Scroll.HBundle());
        this.add(L.TOP   , t == L.VERTICAL ? new pkg.Scroll.VDecButton() : new pkg.Scroll.HDecButton());
        this.add(L.BOTTOM, t == L.VERTICAL ? new pkg.Scroll.VIncButton() : new pkg.Scroll.HIncButton());

        this.type = t;
        this.setPosition(new zebra.util.Position(this));
    },

    function kidAdded(index,id,lw){
        this.$super(index, id, lw);
        if(L.CENTER == id) this.bundle = lw;
        else {
            if(L.BOTTOM == id){
                this.incBt = lw;
                this.incBt._.add(this);
            }
            else {
                if(L.TOP == id){
                    this.decBt = lw;
                    this.decBt._.add(this);
                }
                else throw new Error($invalidC);
            }
        }
    },

    function kidRemoved(index,lw){
        this.$super(index, lw);
        if(lw == this.bundle) this.bundle = null;
        else {
            if(lw == this.incBt){
                this.incBt._.remove(this);
                this.incBt = null;
            }
            else {
                if(lw == this.decBt){
                    this.decBt._.remove(this);
                    this.decBt = null;
                }
            }
        }
    }
]);

/**
 * Scroll UI panel. The component is used to manage scrolling 
 * for a children UI component that occupies more space than 
 * it is available.
 * @param {zebra.ui.Panel} [c] an UI component that has to 
 * be placed into scroll panel  
 * @param {Integer} [barMask] a scroll bars mask that allows 
 * developers to control vertical and 
 * horizontal scroll bars visibility.  
 * @constructor
 * @class zebra.ui.ScrollPan
 * @extends {zebra.ui.Panel}
 */
pkg.ScrollPan = Class(pkg.Panel, [
    function $clazz() {
        this.ContentPan = Class(pkg.Panel, [
            function(c){
                this.$super(new L.RasterLayout(L.USE_PS_SIZE));
                this.scrollManager = new pkg.ScrollManager(c, [
                    function $prototype() {
                        this.getSX   = function() { return this.target.x; };
                        this.getSY   = function() { return this.target.y; };
                        this.updated = function(sx,sy,psx,psy) { this.target.setLocation(sx, sy); };
                    }
                ]);
                this.add(c);
            }
        ]);
    },

    function $prototype() {
        /**
         * Indicate if the scroll bars should be hidden 
         * when they are not active
         * @attribute autoHide
         * @type {Boolean}
         * @readOnly
         */
        this.autoHide  = false;
        this.$interval = 0;

        /**
         * Set the given auto hide state. 
         * @param  {Boolean} b an auto hide state.  
         * @method setAutoHide
         */
        this.setAutoHide = function(b) {
            if (this.autoHide != b) {
                this.autoHide = b;
                if (this.hBar != null) {
                    if (this.hBar.incBt != null) this.hBar.incBt.setVisible(!b);
                    if (this.hBar.decBt != null) this.hBar.decBt.setVisible(!b);
                } 

                if (this.vBar != null) {
                    if (this.vBar.incBt != null) this.vBar.incBt.setVisible(!b);
                    if (this.vBar.decBt != null) this.vBar.decBt.setVisible(!b);
                } 

                if (this.$interval != 0) {
                    clearInterval(this.$interval);
                    $this.$interval = 0;
                }

                this.vrp();
            }
        };

        this.scrolled = function (psx,psy){
            try {
                this.validate();
                this.isPosChangedLocked = true;
                
                if (this.hBar != null) {
                    this.hBar.position.setOffset( -this.scrollObj.scrollManager.getSX());
                }
                
                if (this.vBar != null) {
                    this.vBar.position.setOffset( -this.scrollObj.scrollManager.getSY());
                }
                
                if (this.scrollObj.scrollManager == null) this.invalidate();
            }
            catch(e) { throw e; }
            finally  { this.isPosChangedLocked = false; }
        };

        this.calcPreferredSize = function (target){ 
            return pkg.getPreferredSize(this.scrollObj); 
        };

        this.doLayout = function (target){
            var sman   = (this.scrollObj == null) ? null : this.scrollObj.scrollManager,
                right  = this.getRight(), 
                top    = this.getTop(), 
                bottom = this.getBottom(), 
                left   = this.getLeft(),
                ww     = this.width  - left - right,  maxH = ww, 
                hh     = this.height - top  - bottom, maxV = hh,
                so     = this.scrollObj.getPreferredSize(),
                vps    = this.vBar == null ? { width:0, height:0 } : this.vBar.getPreferredSize(),
                hps    = this.hBar == null ? { width:0, height:0 } : this.hBar.getPreferredSize();

            // compensate scrolled vertical size by reduction of horizontal bar height if necessary
            // autoHidded scrollbars don't have an influence to layout
            if (this.hBar != null && this.autoHide === false &&
                  (so.width  > ww ||
                  (so.height > hh && so.width > (ww - vps.width))))
            {
                maxV -= hps.height;
            }
            maxV = so.height > maxV ? (so.height - maxV) :  -1;
            
            // compensate scrolled horizontal size by reduction of vertical bar width if necessary
            // autoHidded scrollbars don't have an influence to layout
            if (this.vBar != null && this.autoHide === false &&
                  (so.height > hh ||
                  (so.width > ww && so.height > (hh - hps.height))))
            {
                maxH -= vps.width;
            }
            maxH = so.width > maxH ? (so.width - maxH) :  -1;
           
            var sy = sman.getSY(), sx = sman.getSX();
            if (this.vBar != null) {
                if (maxV < 0) {
                    if (this.vBar.isVisible){
                        this.vBar.setVisible(false);
                        sman.scrollTo(sx, 0);
                        this.vBar.position.setOffset(0);
                    }
                    sy = 0;
                }
                else this.vBar.setVisible(true);
            }

            if (this.hBar != null){
                if (maxH < 0){
                    if (this.hBar.isVisible){
                        this.hBar.setVisible(false);
                        sman.scrollTo(0, sy);
                        this.hBar.position.setOffset(0);
                    }
                }
                else this.hBar.setVisible(true);
            }

            if (this.scrollObj.isVisible){
                this.scrollObj.setLocation(left, top);
                this.scrollObj.setSize(ww - (this.autoHide === false && this.vBar != null && this.vBar.isVisible ? vps.width  : 0), 
                                       hh - (this.autoHide === false && this.hBar != null && this.hBar.isVisible ? hps.height : 0));
            }

            if (this.$interval === 0 && this.autoHide) {
                hps.height = vps.width = 1;
            }

            if (this.hBar != null && this.hBar.isVisible){
                this.hBar.setLocation(left, this.height - bottom - hps.height);
                this.hBar.setSize(ww - (this.vBar != null && this.vBar.isVisible ? vps.width : 0), hps.height);
                this.hBar.setMaximum(maxH);
            }

            if (this.vBar != null && this.vBar.isVisible){
                this.vBar.setLocation(this.width - right - vps.width, top);
                this.vBar.setSize(vps.width, hh -  (this.hBar != null && this.hBar.isVisible ? hps.height : 0));
                this.vBar.setMaximum(maxV);
            }
        };

        this.posChanged = function (target,prevOffset,prevLine,prevCol){
            if (this.isPosChangedLocked === false){

                //!!! review the code below
                if (this.autoHide) { 
                    this.$dontHide = true;
                    if (this.$interval === 0 && ((this.vBar != null && this.vBar.isVisible) || 
                                                 (this.hBar != null && this.hBar.isVisible)    )) 
                    {
                        var $this = this;
                        if (this.vBar) this.vBar.toFront();
                        if (this.hBar) this.hBar.toFront();
                        this.vrp();
                        this.$interval = setInterval(function() { 
                            if ($this.$dontHide || ($this.vBar != null && pkg.$mouseMoveOwner == $this.vBar)|| 
                                                   ($this.hBar != null && pkg.$mouseMoveOwner == $this.hBar)  ) 
                            {
                                $this.$dontHide = false;
                            }
                            else {
                                clearInterval($this.$interval);
                                $this.$interval = 0;
                                $this.doLayout();
                            }
                        }, 500); 
                    }
                }

                if (this.vBar != null && this.vBar.position == target) { 
                    this.scrollObj.scrollManager.scrollYTo(-this.vBar.position.offset);
                }
                else {
                    if (this.hBar != null) {
                        this.scrollObj.scrollManager.scrollXTo(-this.hBar.position.offset);
                    }
                }
            }
        };
    },

    function () { this.$this(null, L.HORIZONTAL | L.VERTICAL); },
    function (c){ this.$this(c, L.HORIZONTAL | L.VERTICAL); },

    function (c, barMask){
        /**
         * Vertical scroll bar component
         * @attribute vBar
         * @type {zebra.ui.Scroll}
         * @readOnly
         */

        /**
         * Horizontal scroll bar component
         * @attribute hBar
         * @type {zebra.ui.Scroll}
         * @readOnly
         */


        this.hBar = this.vBar = this.scrollObj = null;
        this.isPosChangedLocked = false;
        this.$super();

        if ((L.HORIZONTAL & barMask) > 0) {
            this.add(L.BOTTOM, new pkg.Scroll(L.HORIZONTAL));
        }

        if ((L.VERTICAL & barMask) > 0) {
            this.add(L.RIGHT, new pkg.Scroll(L.VERTICAL));
        }
        
        if (c != null) this.add(L.CENTER, c);
    },

    function setIncrements(hUnit,hPage,vUnit,vPage){
        if (this.hBar != null){
            if (hUnit !=  -1) this.hBar.unitIncrement = hUnit;
            if (hPage !=  -1) this.hBar.pageIncrement = hPage;
        }

        if (this.vBar != null){
            if (vUnit !=  -1) this.vBar.unitIncrement = vUnit;
            if (vPage !=  -1) this.vBar.pageIncrement = vPage;
        }
    },

    function insert(i,ctr,c){
        if (L.CENTER == ctr && c.scrollManager == null) { 
            c = new pkg.ScrollPan.ContentPan(c);
        }
        return this.$super(i, ctr, c);
    },

    function kidAdded(index,id,comp){
        this.$super(index, id, comp);
        if (L.CENTER == id){
            this.scrollObj = comp;
            this.scrollObj.scrollManager._.add(this);
        }

        if (L.BOTTOM  == id || L.TOP == id){
            this.hBar = comp;
            this.hBar.position._.add(this);
        }
        else {
            if (L.LEFT == id || L.RIGHT == id){
                this.vBar = comp;
                this.vBar.position._.add(this);
            }
        }
    },

    function kidRemoved(index,comp){
        this.$super(index, comp);
        if (comp == this.scrollObj){
            this.scrollObj.scrollManager._.remove(this);
            this.scrollObj = null;
        }
        else {
            if (comp == this.hBar){
                this.hBar.position._.remove(this);
                this.hBar = null;
            }
            else {
                if (comp == this.vBar){
                    this.vBar.position._.remove(this);
                    this.vBar = null;
                }
            }
        }
    }
]);

/**
 * Tabs UI panel. The component is used to organize switching 
 * between number of pages where every page is an UI component.
 * @param {Integer} [o] the tab panel orientation:
 
      zebra.layout.TOP
      zebra.layout.BOTTOM
      zebra.layout.LEFT
      zebra.layout.RIGHT

 * @class zebra.ui.Tabs
 * @constructor
 * @extends {zebra.ui.Panel}
 */

/**
 * Fired when a new tab page has been selected 

      tabs._.add(function (src, selectedIndex) {
         ...
      });

 * @event selected
 * @param {zebra.ui.Tabs} src a tabs component that triggers the event
 * @param {Integer} selectedIndex a tab page index that has been selected
 */
pkg.Tabs = Class(pkg.Panel, MouseListener, KeyListener, [
    function $prototype() {
        this.mouseMoved = function(e) {
            var i = this.getTabAt(e.x, e.y);
            if (this.overTab != i) {
                //!!! var tr1 = (this.overTab >= 0) ? this.getTabBounds(this.overTab) : null;
                //!!!var tr2 = (i >= 0) ? this.getTabBounds(i) : null;
                //!!!if (tr1 && tr2) zebra.util.unite();
                this.overTab = i;
                if (this.views["tabover"] != null) {
                    this.repaint(this.tabAreaX, this.tabAreaY, this.tabAreaWidth, this.tabAreaHeight);
                }
            }
        };

        this.mouseDragEnded = function(e) {
            var i = this.getTabAt(e.x, e.y);
            if (this.overTab != i) {
                this.overTab = i;
                if (this.views["tabover"] != null) {
                    this.repaint(this.tabAreaX, this.tabAreaY, this.tabAreaWidth, this.tabAreaHeight);
                }
            }
        };

        this.mouseExited = function(e) {
            if (this.overTab >= 0) {
                this.overTab = -1;
                if (this.views["tabover"] != null) {
                    this.repaint(this.tabAreaX, this.tabAreaY, this.tabAreaWidth, this.tabAreaHeight);
                }
            }
        };

        /**
         * Navigate to a next tab page following the given direction starting from the given page
         * @param  {Integer} page a starting page index
         * @param  {Integer} d    a navigation direction. 1 means forward and -1 mens backward 
         * @return {Integer}      a new tab page index 
         * @method next 
         */
        this.next =  function (page, d){
            for(; page >= 0 && page < ~~(this.pages.length / 2); page += d) {
                if (this.isTabEnabled(page)) return page;
            }
            return -1;
        };

        this.getTitleInfo = function(){
            var b = (this.orient == L.LEFT || this.orient == L.RIGHT),
                res = b ? { x:this.tabAreaX, y:0, width:this.tabAreaWidth, height:0, orient:this.orient }
                        : { x:0, y:this.tabAreaY, width:0, height:this.tabAreaHeight, orient:this.orient };
            if(this.selectedIndex >= 0){
                var r = this.getTabBounds(this.selectedIndex);
                if(b){
                    res[1] = r.y;
                    res[3] = r.height;
                }
                else{
                    res[0] = r.x;
                    res[2] = r.width;
                }
            }
            return res;
        };

        this.canHaveFocus = function(){
            return true;
        };

        this.getTabView = function (index){
            var data = this.pages[2 * index];
            if (data.paint) return data;
            this.render.target.setValue(data.toString());
            return this.render;
        };

        /**
         * Test if the given tab page is in enabled state
         * @param  {Integer} index a tab page index
         * @return {Boolean} a tab page state
         * @method isTabEnabled  
         */
        this.isTabEnabled = function (index){
            return this.kids[index].isEnabled;
        };

        this.paint = function(g){
            //!!!var ts = g.getTopStack(), cx = ts.x, cy = ts.y, cw = ts.width, ch = ts.height;

            if(this.selectedIndex > 0){
                var r = this.getTabBounds(this.selectedIndex);
                //!!!! if(this.orient == L.LEFT || this.orient == L.RIGHT)
                //     g.clipRect(r.x, this.tabAreaY, r.width, r.y - this.tabAreaY);
                // else
                //     g.clipRect(this.tabAreaX, r.y, r.x - this.tabAreaX, r.height);
            }

            for(var i = 0;i < this.selectedIndex; i++) this.paintTab(g, i);

            if (this.selectedIndex >= 0){
                //!!!g.setClip(cx, cy, cw, ch);
                var r = this.getTabBounds(this.selectedIndex);
                //!!!! if(this.orient == L.LEFT || this.orient == L.RIGHT)
                //     g.clipRect(r.x, r.y + r.height, r.width, this.height - r.y - r.height);
                // else
                //     g.clipRect(r.x + r.width, r.y, this.width - r.x - r.width, r.height);
            }

            for(var i = this.selectedIndex + 1;i < ~~(this.pages.length / 2); i++) this.paintTab(g, i);

            //!!!!if (cw > 0 && ch > 0) g.setClip(cx, cy, cw, ch);

            if (this.selectedIndex >= 0){
                this.paintTab(g, this.selectedIndex);
                if (this.hasFocus()) this.drawMarker(g, this.getTabBounds(this.selectedIndex));
            }
        };

        this.drawMarker = function(g,r){
            var marker = this.views["marker"];
            if(marker != null){
                var bv = this.views["tab"];
                marker.paint(g, r.x + bv.getLeft(), r.y + bv.getTop(),
                                r.width - bv.getLeft() - bv.getRight(),
                                r.height - bv.getTop() - bv.getBottom(), this);
            }
        };

        this.paintTab = function (g, pageIndex){
            var b = this.getTabBounds(pageIndex), page = this.kids[pageIndex], vs = this.views,
                tab = vs["tab"], tabover = vs["tabover"], tabon = vs["tabon"];

            if(this.selectedIndex == pageIndex && tabon != null) {
                tabon.paint(g, b.x, b.y, b.width, b.height, page);
            }
            else {
                tab.paint(g, b.x, b.y, b.width, b.height, page);
            }

            if (this.overTab >= 0 && this.overTab == pageIndex && tabover != null) {
                tabover.paint(g, b.x, b.y, b.width, b.height, page);
            }

            var v = this.getTabView(pageIndex),
                ps = v.getPreferredSize(), px = b.x + L.xAlignment(ps.width, L.CENTER, b.width),
                py = b.y + L.yAlignment(ps.height, L.CENTER, b.height);

            v.paint(g, px, py, ps.width, ps.height, page);
            if (this.selectedIndex == pageIndex) {
                v.paint(g, px + 1, py, ps.width, ps.height, page);
            }
        };

        this.getTabBounds = function(i){
            return this.pages[2 * i + 1];
        };

        this.calcPreferredSize = function(target){
            var max = L.getMaxPreferredSize(target);
            if(this.orient == L.BOTTOM || this.orient == L.TOP){
                max.width = Math.max(2 * this.sideSpace + max.width, this.tabAreaWidth);
                max.height += this.tabAreaHeight;
            }
            else{
                max.width += this.tabAreaWidth;
                max.height = Math.max(2 * this.sideSpace + max.height, this.tabAreaHeight);
            }
            max.width  += (this.hgap * 2);
            max.height += (this.vgap * 2);
            return max;
        };

        this.doLayout = function(target){
            var right = this.getRight(), top = this.getTop(), 
                bottom = this.getBottom(), left = this.getLeft(),
                b = (this.orient == L.TOP || this.orient == L.BOTTOM);
          
            if (b) {
                this.tabAreaX = left;
                this.tabAreaY = (this.orient == L.TOP) ? top : this.height - bottom - this.tabAreaHeight;
            }
            else {
                this.tabAreaX = (this.orient == L.LEFT) ? left : this.width - right - this.tabAreaWidth;
                this.tabAreaY = top;
            }
            var count = ~~(this.pages.length / 2), sp = 2*this.sideSpace,
                xx = b ? (this.tabAreaX + this.sideSpace)
                       : ((this.orient == L.LEFT) ? (this.tabAreaX + this.upperSpace) : this.tabAreaX + 1),
                yy = b ? (this.orient == L.TOP ? this.tabAreaY + this.upperSpace : this.tabAreaY + 1)
                       : (this.tabAreaY + this.sideSpace);

            for(var i = 0;i < count; i++ ){
                var r = this.getTabBounds(i);
                if(b){
                    r.x = xx;
                    r.y = yy;
                    xx += r.width;
                    if(i == this.selectedIndex) xx -= sp;
                }
                else{
                    r.x = xx;
                    r.y = yy;
                    yy += r.height;
                    if(i == this.selectedIndex) yy -= sp;
                }
            }

            for(var i = 0;i < count; i++){
                var l = this.kids[i];
                if(i == this.selectedIndex){
                    if(b) {
                        l.setSize(this.width - left - right - 2 * this.hgap,
                                  this.height - this.tabAreaHeight - top - bottom - 2 * this.vgap);
                        l.setLocation(left + this.hgap,
                                     ((this.orient == L.TOP) ? top + this.tabAreaHeight : top) + this.vgap);
                    }
                    else {
                        l.setSize(this.width - this.tabAreaWidth - left - right - 2 * this.hgap,
                                  this.height - top - bottom - 2 * this.vgap);
                        l.setLocation(((this.orient == L.LEFT) ? left + this.tabAreaWidth : left) + this.hgap,
                                      top + this.vgap);
                    }
                }
                else { 
                    l.setSize(0, 0);
                }
            }

            if (this.selectedIndex >= 0){
                var r = this.getTabBounds(this.selectedIndex), dt = 0;
                if(b){
                    r.x -= this.sideSpace;
                    r.y -= (this.orient == L.TOP) ? this.upperSpace : this.brSpace;
                    dt = (r.x < left) ? left - r.x
                                      : (r.x + r.width > this.width - right) ? this.width - right - r.x - r.width : 0;
                }
                else{
                    r.x -= (this.orient == L.LEFT) ? this.upperSpace : this.brSpace;
                    r.y -= this.sideSpace;
                    dt = (r.y < top) ? top - r.y
                                     : (r.y + r.height > this.height - bottom) ? this.height - bottom - r.y - r.height : 0;
                }
                for(var i = 0;i < count; i ++ ){
                    var br = this.getTabBounds(i);
                    if(b) br.x += dt;
                    else br.y += dt;
                }
            }
        };

        this.recalc = function(){
            var count = ~~(this.pages.length / 2);
            if (count > 0){
                this.tabAreaHeight = this.tabAreaWidth = 0;
                var bv = this.views["tab"], b = (this.orient == L.LEFT || this.orient == L.RIGHT), max = 0,
                    hadd = 2 * this.hTabGap + bv.getLeft() + bv.getRight(),
                    vadd = 2 * this.vTabGap + bv.getTop() + bv.getBottom();

                for(var i = 0;i < count; i++){
                    var ps = this.getTabView(i).getPreferredSize(), r = this.getTabBounds(i);
                    if(b){
                        r.height = ps.height + vadd;
                        if(ps.width + hadd > max) max = ps.width + hadd;
                        this.tabAreaHeight += r.height;
                    }
                    else{
                        r.width = ps.width + hadd;
                        if(ps.height + vadd > max) max = ps.height + vadd;
                        this.tabAreaWidth += r.width;
                    }
                }
                for(var i = 0; i < count; i++ ){
                    var r = this.getTabBounds(i);
                    if(b) r.width  = max;
                    else  r.height = max;
                }
                if (b) {
                    this.tabAreaWidth = max + this.upperSpace + 1;
                    this.tabAreaHeight += (2 * this.sideSpace);
                }
                else {
                    this.tabAreaWidth += (2 * this.sideSpace);
                    this.tabAreaHeight = this.upperSpace + max + 1;
                }

                if (this.selectedIndex >= 0) {
                    var r = this.getTabBounds(this.selectedIndex);
                    if (b) {
                        r.height += 2 * this.sideSpace;
                        r.width += (this.brSpace + this.upperSpace);
                    }
                    else {
                        r.height += (this.brSpace + this.upperSpace);
                        r.width += 2 * this.sideSpace;
                    }
                }
            }
        };

        /**
         * Get tab index located at the given location
         * @param  {Integer} x a x coordinate
         * @param  {Integer} y a y coordinate
         * @return {Integer} an index of the tab that is 
         * detected at the given location. -1 if no any 
         * tab can be found
         * @method getTabAt
         */
        this.getTabAt = function(x,y){
            this.validate();
            if(x >= this.tabAreaX && y >= this.tabAreaY &&
                x < this.tabAreaX + this.tabAreaWidth &&
                y < this.tabAreaY + this.tabAreaHeight)
            {
                for(var i = 0; i < ~~(this.pages.length / 2); i++ ) {
                    var tb = this.getTabBounds(i);
                    if (x >= tb.x && y >= tb.y && x < tb.x + tb.width && y < tb.y + tb.height) return i;
                }
            }
            return -1;
        };

        this.keyPressed = function(e){
            if(this.selectedIndex != -1 && this.pages.length > 0){
                switch(e.code) {
                    case KE.UP:
                    case KE.LEFT:
                        var nxt = this.next(this.selectedIndex - 1,  -1);
                        if(nxt >= 0) this.select(nxt);
                        break;
                    case KE.DOWN:
                    case KE.RIGHT:
                        var nxt = this.next(this.selectedIndex + 1, 1);
                        if(nxt >= 0) this.select(nxt);
                        break;
                }
            }
        };

        this.mouseClicked = function(e){
            if (e.isActionMask()){
                var index = this.getTabAt(e.x, e.y);
                if (index >= 0 && this.isTabEnabled(index)) this.select(index);
            }
        };

        /**
         * Switch to the given tab page 
         * @param  {Integer} index a tab page index to be navigated 
         * @method select
         */
        this.select = function(index){
            if (this.selectedIndex != index){
                this.selectedIndex = index;
                this._.fired(this, this.selectedIndex);
                this.vrp();
            }
        };

        this.setTitle =  function(pageIndex,data){
            if (this.pages[2 * pageIndex] != data){
                this.pages[pageIndex * 2] = data;
                this.vrp();
            }
        };

        this.setTabSpaces = function(vg,hg,sideSpace,upperSpace,brSpace){
            if (this.vTabGap != vg              || 
                this.hTabGap != hg              || 
                sideSpace    != this.sideSpace  ||
                upperSpace   != this.upperSpace || 
                brSpace      != this.brSpace      )
            {
                this.vTabGap = vg;
                this.hTabGap = hg;
                this.sideSpace = sideSpace;
                this.upperSpace = upperSpace;
                this.brSpace = brSpace;
                this.vrp();
            }
        };

        this.setGaps = function (vg,hg){
            if(this.vgap != vg || hg != this.hgap){
                this.vgap = vg;
                this.hgap = hg;
                this.vrp();
            }
        };

        this.setTitleAlignment = function(o){
            o = L.$constraints(o);

            if (o != L.TOP && o != L.BOTTOM && o != L.LEFT && o != L.RIGHT) {
                throw new Error($invalidA);
            }

            if (this.orient != o){
                this.orient = o;
                this.vrp();
            }
        };

        /**
         * Set enabled state for the given tab page
         * @param  {Integer} i a tab page index
         * @param  {boolean} b a tab page enabled state
         * @method enableTab
         */
        this.enableTab = function(i,b){
            var c = this.kids[i];
            if(c.isEnabled != b){
                c.setEnabled(b);
                if (b === false && this.selectedIndex == i) {
                    this.select(-1);
                }
                this.repaint();
            }
        };
    },

    function () {
        this.$this(L.TOP);
    },

    function (o){
        /**
         * Selected tab page index
         * @attribute selectedIndex
         * @type {Integer}
         * @readOnly
         */


        /**
         * Tab orientation 
         * @attribute orient
         * @type {Integer}
         * @readOnly
         */

        this.brSpace = this.upperSpace = this.vgap = this.hgap = this.tabAreaX = 0;
        this.hTabGap = this.vTabGap = this.sideSpace = 1;

        this.tabAreaY = this.tabAreaWidth = this.tabAreaHeight = 0;
        this.overTab = this.selectedIndex = -1;
        this.orient = L.$constraints(o);
        this._ = new Listeners();
        this.pages = [];
        this.views = {};
        this.render = new pkg.TextRender(new zebra.data.SingleLineTxt(""));

        if (pkg.Tabs.font != null) this.render.setFont(pkg.Tabs.font);
        if (pkg.Tabs.fontColor != null) this.render.setColor(pkg.Tabs.fontColor);

        this.$super();

        // since alignment pass as the constructor argument the setter has to be called after $super
        // because $super can re-set title alignment
        this.setTitleAlignment(o);
    },

    function focused(){
        this.$super();
        if (this.selectedIndex >= 0){
            var r = this.getTabBounds(this.selectedIndex);
            this.repaint(r.x, r.y, r.width, r.height);
        }
        else {
            if (!this.hasFocus()) {
                this.select(this.next(0, 1));
            }
        }
    },

    function insert(index,constr,c){
        this.pages.splice(index * 2, 0, constr == null ? "Page " + index
                                                       : constr, { x:0, y:0, width:0, height:0 });
        var r = this.$super(index, constr, c);
        if (this.selectedIndex < 0) this.select(this.next(0, 1));
        return r;
    },

    function removeAt(i){
        if (this.selectedIndex == i) this.select( -1);
        this.pages.splice(i * 2, 2);
        this.$super(i);
    },

    function removeAll(){
        if (this.selectedIndex >= 0) this.select( -1);
        this.pages.splice(0, this.pages.length);
        this.pages.length = 0;
        this.$super();
    },

    function setSize(w,h){
        if (this.width != w || this.height != h){
            if (this.orient == L.RIGHT || this.orient == L.BOTTOM) this.tabAreaX =  -1;
            this.$super(w, h);
        }
    }
]);
pkg.Tabs.prototype.setViews = pkg.$ViewsSetter;

/**
 * Slider UI component class.
 * @class  zebra.ui.Slider
 * @extends {zebra.ui.Panel}
 */
pkg.Slider = Class(pkg.Panel, KeyListener, MouseListener, Actionable, [
    function $prototype() {
        this.max = this.min = this.value = this.roughStep = this.exactStep = 0;
        this.netSize = this.gap = 3;
        this.correctDt = this.scaleStep = this.psW = this.psH = 0;
        this.intervals = this.pl = null;

        this.paintNums = function(g,loc){
            if(this.isShowTitle)
                for(var i = 0;i < this.pl.length; i++ ){
                    var render = this.provider.getView(this, this.getPointValue(i)),
                        d = render.getPreferredSize();

                    if (this.orient == L.HORIZONTAL) {
                        render.paint(g, this.pl[i] - ~~(d.width / 2), loc, d.width, d.height, this);
                    }
                    else {
                        render.paint(g, loc, this.pl[i] - ~~(d.height / 2),  d.width, d.height, this);
                    }
                }
        };

        this.getScaleSize = function(){
            var bs = this.views["bundle"].getPreferredSize();
            return (this.orient == L.HORIZONTAL ? this.width - this.getLeft() -
                                                  this.getRight() - bs.width
                                                : this.height - this.getTop() -
                                                  this.getBottom() - bs.height) - 2;
        };

        this.getScaleLocation = function(){
            var bs = this.views["bundle"].getPreferredSize();
            return (this.orient == L.HORIZONTAL ? this.getLeft() + ~~(bs.width / 2)
                                                : this.getTop()  + ~~(bs.height/ 2)) + 1;
        };

        this.mouseDragged = function(e){
            if(this.dragged) {
                this.setValue(this.findNearest(e.x + (this.orient == L.HORIZONTAL ? this.correctDt : 0),
                                               e.y + (this.orient == L.HORIZONTAL ? 0 : this.correctDt)));
            }
        };

        this.paint = function(g){
            if (this.pl == null){
                this.pl = Array(this.intervals.length);
                for(var i = 0, l = this.min;i < this.pl.length; i ++ ){
                    l += this.intervals[i];
                    this.pl[i] = this.value2loc(l);
                }
            }

            var left = this.getLeft(), top = this.getTop(), 
                right = this.getRight(), bottom = this.getBottom(),
                bnv = this.views["bundle"], gauge = this.views["gauge"],
                bs = bnv.getPreferredSize(), gs = gauge.getPreferredSize(),
                w = this.width - left - right - 2, h = this.height - top - bottom - 2;

            if (this.orient == L.HORIZONTAL){
                var topY = top + ~~((h - this.psH) / 2) + 1, by = topY;
                if(this.isEnabled) {
                    gauge.paint(g, left + 1, 
                                   topY + ~~((bs.height - gs.height) / 2), 
                                   w, gs.height, this);
                }
                else{
                    g.setColor("gray");
                    g.strokeRect(left + 1, topY + ~~((bs.height - gs.height) / 2), w, gs.height);
                }
                topY += bs.height;
                if (this.isShowScale){
                    topY += this.gap;
                    g.setColor(this.isEnabled ? this.scaleColor : "gray");
                    g.beginPath();
                    for(var i = this.min;i <= this.max; i += this.scaleStep){
                        var xx = this.value2loc(i) + 0.5;
                        g.moveTo(xx, topY);
                        g.lineTo(xx, topY + this.netSize);
                    }

                    for(var i = 0;i < this.pl.length; i ++ ) {
                        g.moveTo(this.pl[i] + 0.5, topY);
                        g.lineTo(this.pl[i] + 0.5, topY + 2 * this.netSize);
                    }
                    g.stroke();
                    topY += (2 * this.netSize);
                }
                this.paintNums(g, topY);
                bnv.paint(g, this.getBundleLoc(this.value), by, bs.width, bs.height, this);
            }
            else {
                var leftX = left + ~~((w - this.psW) / 2) + 1, bx = leftX;
                if (this.isEnabled) {
                    gauge.paint(g, leftX + ~~((bs.width - gs.width) / 2), 
                                   top + 1, gs.width, h, this);
                }
                else {
                    g.setColor("gray");
                    g.strokeRect(leftX + ~~((bs.width - gs.width) / 2),
                                 top + 1, gs.width, h);
                }

                leftX += bs.width;
                if (this.isShowScale) {
                    leftX += this.gap;
                    g.setColor(this.scaleColor);
                    g.beginPath();
                    for(var i = this.min;i <= this.max; i += this.scaleStep){
                        var yy = this.value2loc(i) + 0.5;
                        g.moveTo(leftX, yy);
                        g.lineTo(leftX + this.netSize, yy);
                    }
                    for(var i = 0;i < this.pl.length; i ++ ) {
                        g.moveTo(leftX, this.pl[i] + 0.5);
                        g.lineTo(leftX + 2 * this.netSize, this.pl[i] + 0.5);
                    }
                    g.stroke();
                    leftX += (2 * this.netSize);
                }
                this.paintNums(g, leftX);
                bnv.paint(g, bx, this.getBundleLoc(this.value), bs.width, bs.height, this);
            }

            if (this.hasFocus() && this.views["marker"]) {
                this.views["marker"].paint(g, left, top, w + 2, h + 2, this);
            }
        };

        this.findNearest = function(x,y){
            var v = this.loc2value(this.orient == L.HORIZONTAL ? x : y);
            if (this.isIntervalMode){
                var nearest = Number.MAX_VALUE, res = 0;
                for(var i = 0;i < this.intervals.length; i ++ ){
                    var pv = this.getPointValue(i), dt = Math.abs(pv - v);
                    if(dt < nearest){
                        nearest = dt;
                        res = pv;
                    }
                }
                return res;
            }
            v = this.exactStep * ~~((v + v % this.exactStep) / this.exactStep);
            if (v > this.max) v = this.max;
            else {
                if(v < this.min) v = this.min;
            }
            return v;
        };

        this.value2loc = function (v){
            return ~~((this.getScaleSize() * (v - this.min)) / (this.max - this.min)) +
                   this.getScaleLocation();
        };

        this.loc2value = function(xy){
            var sl = this.getScaleLocation(), ss = this.getScaleSize();
            if(xy < sl) xy = sl;
            else if(xy > sl + ss) xy = sl + ss;
            return this.min + ~~(((this.max - this.min) * (xy - sl)) / ss);
        };

        this.nextValue = function(value,s,d){
            if (this.isIntervalMode) {
                return this.getNeighborPoint(value, d);
            }

            var v = value + (d * s);
            if(v > this.max) v = this.max;
            else if(v < this.min) v = this.min;
            return v;
        };

        this.getBundleLoc = function(v){
            var bs = this.views["bundle"].getPreferredSize();
            return this.value2loc(v) - (this.orient == L.HORIZONTAL ? ~~(bs.width / 2)
                                                                    : ~~(bs.height / 2));
        };

        this.getBundleBounds = function (v){
            var bs = this.views["bundle"].getPreferredSize();
            return this.orient == L.HORIZONTAL ? { x:this.getBundleLoc(v),
                                                   y:this.getTop() + ~~((this.height - this.getTop() - this.getBottom() - this.psH) / 2) + 1,
                                                   width:bs.width, height:bs.height }
                                               : { x:this.getLeft() + ~~((this.width - this.getLeft() - this.getRight() - this.psW) / 2) + 1,
                                                   y:this.getBundleLoc(v), width:bs.width, height:bs.height };
        };

        this.getNeighborPoint = function (v,d){
            var left = this.min + this.intervals[0], right = this.getPointValue(this.intervals.length - 1);
            if (v < left) return left;
            else {
                if (v > right) return right;
            }

            if (d > 0) {
                var start = this.min;
                for(var i = 0;i < this.intervals.length; i ++ ){
                    start += this.intervals[i];
                    if(start > v) return start;
                }
                return right;
            }
            else {
                var start = right;
                for(var i = this.intervals.length - 1;i >= 0; i--) {
                    if (start < v) return start;
                    start -= this.intervals[i];
                }
                return left;
            }
        };

        this.calcPreferredSize = function(l) {
            return { width:this.psW + 2, height: this.psH + 2 };
        };

        this.recalc = function(){
            var ps = this.views["bundle"].getPreferredSize(),
                ns = this.isShowScale ? (this.gap + 2 * this.netSize) : 0,
                dt = this.max - this.min, hMax = 0, wMax = 0;

            if(this.isShowTitle && this.intervals.length > 0){
                for(var i = 0;i < this.intervals.length; i ++ ){
                    var d = this.provider.getView(this, this.getPointValue(i)).getPreferredSize();
                    if (d.height > hMax) hMax = d.height;
                    if (d.width  > wMax) wMax = d.width;
                }
            }
            if(this.orient == L.HORIZONTAL){
                this.psW = dt * 2 + ps.width;
                this.psH = ps.height + ns + hMax;
            }
            else{
                this.psW = ps.width + ns + wMax;
                this.psH = dt * 2 + ps.height;
            }
        };

        this.setValue = function(v){
            if (v < this.min || v > this.max) {
                throw new Error("Value is out of bounds: " + v);
            }

            var prev = this.value;
            if(this.value != v){
                this.value = v;
                this._.fired(this, prev);
                this.repaint();
            }
        };

        this.getPointValue = function (i){
            var v = this.min + this.intervals[0];
            for(var j = 0; j < i; j++, v += this.intervals[j]);
            return v;
        };

        this.keyPressed = function(e){
            var b = this.isIntervalMode;
            switch(e.code)
            {
                case KE.UP:
                case KE.LEFT:
                    var v = this.nextValue(this.value, this.exactStep,-1);
                    if (v >= this.min) this.setValue(v);
                    break;
                case KE.DOWN:
                case KE.RIGHT:
                    var v = this.nextValue(this.value, this.exactStep, 1);
                    if (v <= this.max) this.setValue(v);
                    break;
                case KE.HOME: this.setValue(b ? this.getPointValue(0) : this.min);break;
                case KE.END:  this.setValue(b ? this.getPointValue(this.intervals.length - 1) 
                                            : this.max);
                              break;
            }
        };

        this.mousePressed = function (e){
            if(e.isActionMask()){
                var x = e.x, y = e.y, bb = this.getBundleBounds(this.value);
                if (x < bb.x || y < bb.y || x >= bb.x + bb.width || y >= bb.y + bb.height) {
                    var l = ((this.orient == L.HORIZONTAL) ? x : y), v = this.loc2value(l);
                    if (this.value != v) {
                        this.setValue(this.isJumpOnPress ? v
                                                         : this.nextValue(this.value, 
                                                                          this.roughStep, 
                                                                          v < this.value ? -1:1));
                    }
                }
            }
        };

        this.mouseDragStarted = function(e){
            var r = this.getBundleBounds(this.value);

            if (e.x >= r.x && e.y >= r.y && 
                e.x < r.x + r.width && 
                e.y < r.y + r.height)
            {
                this.dragged = true;
                this.correctDt = this.orient == L.HORIZONTAL ? r.x + ~~(r.width  / 2) - e.x
                                                             : r.y + ~~(r.height / 2) - e.y;
            }
        };

        this.mouseDragEnded = function(e){ this.dragged = false; };

        this.canHaveFocus = function() { return true; };

        this.getView = function(d,o){
            this.render.target.setValue(o != null ? o.toString() : "");
            return this.render;
        };
    },

    function() { this.$this(L.HORIZONTAL); },

    function (o){
        this._ = new Listeners();
        this.views = {};
        this.isShowScale = this.isShowTitle = true;
        this.dragged = this.isIntervalMode = false;
        this.render = new pkg.BoldTextRender("");
        this.render.setColor("gray");
        this.orient = L.$constraints(o);
        this.setValues(0, 20, [0, 5, 10], 2, 1);
        this.setScaleStep(1);

        this.$super();
        this.views["bundle"] = (o == L.HORIZONTAL ? this.views["hbundle"] : this.views["vbundle"]);

        this.provider = this;
    },

    function focused() { 
        this.$super();
        this.repaint(); 
    },
    
    function setScaleGap(g){
        if (g != this.gap){
            this.gap = g;
            this.vrp();
        }
    },

    function setScaleColor(c){
        if (c != this.scaleColor) {
            this.scaleColor = c;
            if (this.provider == this) this.render.setColor(c);
            this.repaint();
        }
        return this;
    },

    function setScaleStep(s){
        if (s != this.scaleStep){
            this.scaleStep = s;
            this.repaint();
        }
    },

    function setShowScale(b){
        if (this.isShowScale != b){
            this.isShowScale = b;
            this.vrp();
        }
    },

    function setShowTitle(b){
        if (this.isShowTitle != b){
            this.isShowTitle = b;
            this.vrp();
        }
    },

    function setViewProvider(p){
        if (p != this.provider){
            this.provider = p;
            this.vrp();
        }
    },

    function setValues(min,max,intervals,roughStep,exactStep){
        if(roughStep <= 0 || exactStep < 0 || min >= max || 
           min + roughStep > max || min + exactStep > max  ) 
        { 
            throw new Error("Invalid values");
        }

        for(var i = 0, start = min;i < intervals.length; i ++ ){
            start += intervals[i];
            if(start > max || intervals[i] < 0) throw new Error();
        }

        this.min = min;
        this.max = max;
        this.roughStep = roughStep;
        this.exactStep = exactStep;
        this.intervals = Array(intervals.length);

        for(var i=0; i<intervals.length; i++){
            this.intervals[i] = intervals[i];
        }
        
        if(this.value < min || this.value > max) {
            this.setValue(this.isIntervalMode ? min + intervals[0] : min);
        }
        this.vrp();
    },

    function invalidate(){
        this.pl = null;
        this.$super();
    }
]);
pkg.Slider.prototype.setViews = pkg.$ViewsSetter;


pkg.StatusBar = Class(pkg.Panel, [
    function () { this.$this(2); },

    function (gap){
        this.setPaddings(gap, 0, 0, 0);
        this.$super(new L.PercentLayout(Layout.HORIZONTAL, gap));
    },

    function setBorderView(v){
        if(v != this.borderView){
            this.borderView = v;
            for(var i = 0;i < this.kids.length; i++) this.kids[i].setBorder(this.borderView);
            this.repaint();
        }
    },

    function insert(i,s,d){
        d.setBorder(this.borderView);
        this.$super(i, s, d);
    }
]);

/**
 * Toolbar UI component
 * @class zebra.ui.Toolbar
 * @extends {zebra.ui.Panel}
 */
pkg.Toolbar = Class(pkg.Panel, pkg.ChildrenListener, [
    function $clazz() {
        this.Constraints = function(isDec, str) {
            this.isDecorative = arguments.length > 0 ? isDec : false;
            this.stretched = arguments.length > 1 ? str : false;
        };
    },

    function $prototype() {
        var OVER = "over", OUT = "out", PRESSED = "pressed";

        this.isDecorative = function(c){ return c.constraints.isDecorative; };

        this.childInputEvent = function(e){
            if (e.UID == pkg.InputEvent.MOUSE_UID){
                var dc = L.getDirectChild(this, e.source);
                if (this.isDecorative(dc) === false){
                    switch(e.ID) {
                        case ME.ENTERED : this.select(dc, true); break;
                        case ME.EXITED  : if (this.selected != null && L.isAncestorOf(this.selected, e.source)) this.select(null, true); break;
                        case ME.PRESSED : this.select(this.selected, false);break;
                        case ME.RELEASED: this.select(this.selected, true); break;
                    }
                }
            }
        };

        this.recalc = function(){
            var v = this.views, vover = v[OVER], vpressed = v[PRESSED];
            this.leftShift   = Math.max(vover     != null && vover.getLeft      ? vover.getLeft()     : 0,
                                        vpressed  != null && vpressed.getLeft   ? vpressed.getLeft()  : 0);
            this.rightShift  = Math.max(vover     != null && vover.getRight     ? vover.getRight()    : 0 ,
                                        vpressed  != null && vpressed.getRight  ? vpressed.getRight() : 0 );
            this.topShift    = Math.max(vover     != null && vover.getTop       ? vover.getTop()      : 0 ,
                                        vpressed  != null && vpressed.getTop    ? vpressed.getTop()   : 0 );
            this.bottomShift = Math.max(vover     != null && vover.getBottom    ? vover.getBottom()   : 0 ,
                                        vpressed  != null && vpressed.getBottom ? vpressed.getBottom(): 0 );
        };

        this.paint = function(g) {
            for(var i = 0;i < this.kids.length; i++){
                var c = this.kids[i];
                if (c.isVisible && this.isDecorative(c) === false){
                    var v = this.views[(this.selected == c) ? (this.isOver ? OVER : PRESSED) : OUT];
                    if (v != null) {
                        v.paint(g, c.x, this.getTop(),
                                   c.width, this.height - this.getTop() - this.getBottom(), this);
                    }
                }
            }
        };

        this.calcPreferredSize = function(target){
            var w = 0, h = 0, c = 0, b = (this.orient == L.HORIZONTAL);
            for(var i = 0;i < target.kids.length; i++ ){
                var l = target.kids[i];
                if(l.isVisible){
                    var ps = l.getPreferredSize();
                    if (b) {
                        w += (ps.width + (c > 0 ? this.gap : 0));
                        h = ps.height > h ? ps.height : h;
                    }
                    else {
                        w = ps.width > w ? ps.width : w;
                        h += (ps.height + (c > 0 ? this.gap : 0));
                    }
                    c++;
                }
            }
            return { width:  (b ? w + c * (this.leftShift + this.rightShift)
                                : w + this.topShift + this.bottomShift),
                     height: (b ? h + this.leftShift + this.rightShift
                                : h + c * (this.topShift + this.bottomShift)) };
        };

        this.doLayout = function(t){
            var b = (this.orient == L.HORIZONTAL), x = t.getLeft(), y = t.getTop(),
                av = this.topShift + this.bottomShift, ah = this.leftShift + this.rightShift,
                hw = b ? t.height - y - t.getBottom() : t.width - x - t.getRight();

            for (var i = 0;i < t.kids.length; i++){
                var l = t.kids[i];
                if (l.isVisible){
                    var ps = l.getPreferredSize(), str = l.constraints.stretched;
                    if (b) {
                        if (str) ps.height = hw;
                        l.setLocation(x + this.leftShift, y + ((hw - ps.height) / 2  + 0.5) | 0);
                        x += (this.gap + ps.width + ah);
                    }
                    else {
                        if (str) ps.width = hw;
                        l.setLocation(x + (hw - ps.width) / 2, y + this.topShift);
                        y += (this.gap + ps.height + av);
                    }
                    l.setSize(ps.width, ps.height);
                }
            }
        };

        this.select = function (c, state){
            if (c != this.selected || (this.selected != null && state != this.isOver)) {
                this.selected = c;
                this.isOver = state;
                this.repaint();
                if (state === false && c != null) this._.fired(this, c);
            }
        };
    },

    function () { this.$this(L.HORIZONTAL, 4); },

    function (orient,gap){
        orient = L.$constraints(orient);

        if (orient != L.HORIZONTAL && orient != L.VERTICAL) {
            throw new Error("Invalid orientation: " + orient);
        }

        this.selected = null;
        this.isOver = false;
        this._ = new Listeners();
        this.leftShift = this.topShift = this.bottomShift = this.rightShift = 0;

        this.views = {};
        this.orient = L.$constraints(orient);
        this.gap = gap;
        this.$super();
    },

    function addDecorative(c){ this.add(new pkg.Toolbar.Constraints(true), c); },

    function addRadio(g,c){
        var cbox = new pkg.Radiobox(c, g);
        cbox.setCanHaveFocus(false);
        this.add(cbox);
        return cbox;
    },

    function addSwitcher(c){
        var cbox = new pkg.Checkbox(c);
        cbox.setCanHaveFocus(false);
        this.add(cbox);
        return cbox;
    },

    function addImage(img){
        this.validateMetric();
        var pan = new pkg.ImagePan(img);
        pan.setPaddings(this.topShift, this.leftShift + 2, this.bottomShift, this.rightShift+2);
        this.add(pan);
        return pan;
    },

    function addCombo(list){
        var combo = new pkg.Combo(list);
        this.add(new pkg.Toolbar.Constraints(false), combo);
        combo.setPaddings(1, 4, 1, 1);
        return combo;
    },

    function addLine(){
        var line = new pkg.Line(L.VERTICAL);
        this.add(new pkg.Toolbar.Constraints(true, true), line);
        return line;
    },

    function insert(i,id,d){
        if (id == null) id = new pkg.Toolbar.Constraints();
        return this.$super(i, id, d);
    }
]);
pkg.Toolbar.prototype.setViews = pkg.$ViewsSetter;

pkg.VideoPan = Class(pkg.Panel,  [
    function $prototype() {
        this.paint = function(g) {
            g.drawImage(this.video, 0, 0);
        };

        this.run = function() {
            this.repaint();
        };
    },

    function(src) {
        var $this = this;
        this.video = document.createElement("video");
        this.video.setAttribute("src", src);
        this.volume = 0.5;
        this.video.addEventListener("canplaythrough", function() { zebra.util.timer.start($this, 500, 40); }, false);
        this.video.addEventListener("ended", function() { zebra.util.timer.stop($this); $this.ended(); }, false);
        this.$super();
    },

    function ended() {}
]);

pkg.ArrowView = Class(View, [
    function $prototype() {
        this[''] = function (d, col, w) {
            this.direction = d == null ? L.BOTTOM : L.$constraints(d);
            this.color = col == null ? "black" : col;
            this.width = this.height = (w == null ? 6 : w);
        };

        this.paint = function(g, x, y, w, h, d) {
            var s = Math.min(w, h);

            x = x + (w-s)/2;
            y = y + (h-s)/2;

            g.setColor(this.color);
            g.beginPath();
            if (L.BOTTOM == this.direction) {
                g.moveTo(x, y);
                g.lineTo(x + s, y);
                g.lineTo(x + s/2, y + s);
                g.lineTo(x, y);
            }
            else {
                if (L.TOP == this.direction) {
                    g.moveTo(x, y + s);
                    g.lineTo(x + s, y + s);
                    g.lineTo(x + s/2, y);
                    g.lineTo(x, y + s);
                }
                else {
                    if (L.LEFT == this.direction) {
                        g.moveTo(x + s, y);
                        g.lineTo(x + s, y + s);
                        g.lineTo(x, y + s/2);
                        g.lineTo(x + s, y);
                    }
                    else {
                        g.moveTo(x, y);
                        g.lineTo(x, y + s);
                        g.lineTo(x + s, y + s/2);
                        g.lineTo(x, y);
                    }
                }
            }
            g.fill();
        };

        this.getPreferredSize = function () {
            return { width:this.width, height:this.height };
        };
    }
]);

pkg.CheckboxView = Class(View, [
    function() { this.$this("rgb(65, 131, 255)"); },

    function(color) {
        this.color = color;
    },
    
    function $prototype() {
        this.paint = function(g,x,y,w,h,d){        
            g.beginPath();
            g.strokeStyle = this.color;
            g.lineWidth = 2;
            g.moveTo(x + 1, y + 2);
            g.lineTo(x + w - 3, y + h - 3);
            g.stroke();
            g.beginPath();
            g.moveTo(x + w - 2, y + 2);
            g.lineTo(x + 2, y + h - 2);
            g.stroke();
            g.lineWidth = 1;
        };
    }
]);

pkg.BunldeView = Class(View, [
    function() { this.$this(L.VERTICAL); },

    function(dir) {
        this.$this("#AAAAAA", dir);
    },

    function(color, dir) {
        this.color = color;
        this.direction = dir;
    },

    function $prototype() {
        this.paint =  function(g,x,y,w,h,d) {
            if (this.direction == L.VERTICAL) {
                var r = w/2;    
                g.beginPath();
                g.arc(x + r, y + r, r, Math.PI, 0, false);
                g.lineTo(x + w, y + h - r);
                g.arc(x + r, y + h - r, r, 0, Math.PI, false);
                g.lineTo(x, y + r);
            }
            else {
                var r = h/2;    
                g.beginPath();
                g.arc(x + r, y + r, r, 0.5 * Math.PI, 1.5 * Math.PI, false);
                g.lineTo(x + w - r, y);
                g.arc(x + w - r, y + h - r, r, 1.5*Math.PI, 0.5*Math.PI, false);
                g.lineTo(x + r, y + h);
            }
            g.setColor(this.color);
            g.fill();
        };
    }
]);

pkg.TooltipBorder = Class(View, [
    function() {
        this.$this("black", 2);
    },

    function(col, size) {
        this.color = col;
        this.size  = size;
        this.gap   = this.size; 
    },

    function $prototype() {
        this.paint = function (g,x,y,w,h,d) {
            if (this.color != null) {
                var old = g.lineWidth;
                this.outline(g,x,y,w,h,d);
                g.setColor(this.color);
                g.lineWidth = this.size;
                g.stroke();
                g.lineWidth = old;
            }
        };

        this.outline = function(g,x,y,w,h,d) {
            g.beginPath();
            h-=2;
            w-=2;
            x++;
            y++;
            g.moveTo(x + w/2, y);
            g.quadraticCurveTo(x, y, x, y + h * 1/3);
            g.quadraticCurveTo(x, y + (2/3)*h, x + w/4,  y + (2/3)*h);
            g.quadraticCurveTo(x + w/4, y + h, x, y + h);
            g.quadraticCurveTo(x + 3*w/8, y + h, x + w/2, y + (2/3)*h);
            g.quadraticCurveTo(x + w, y + (2/3)*h, x + w, y + h * 1/3);
            g.quadraticCurveTo(x + w, y, x + w/2, y);
            return true;
        };
    }
]);

/**
 * The radio button ticker view.
 * @class  zebra.ui.RadioView
 * @extends zebra.ui.View
 * @constructor 
 * @param {String} [col1] color one to render the outer cycle
 * @param {String} [col2] color tow to render the inner cycle
 */
pkg.RadioView = Class(View, [
    function() {
        this.$this("rgb(15, 81, 205)", "rgb(65, 131, 255)");
    },

    function(col1, col2) {
        this.color1 = col1;
        this.color2 = col2;
    },
    
    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            g.beginPath();            

            g.fillStyle = this.color1;
            g.arc(x + w/2, y + h/2 , w/3 , 0, 2* Math.PI, 1, false);
            g.fill();

            g.beginPath();
            g.fillStyle = this.color2;
            g.arc(x + w/2, y + h/2 , w/4 , 0, 2* Math.PI, 1, false);
            g.fill();
        };
    }
]);

pkg.MobileScrollMan = Class(pkg.Manager, pkg.MouseListener, [
    function $prototype() {
        this.sx = this.sy = 0;
        this.target = null;
        this.identifier = -1; 

        this.mouseDragStarted = function(e) {
            if (e.touchCounter == 1 && e.touches)  {
                this.identifier = e.touch.identifier;
                var owner = e.source; 

                while(owner != null && instanceOf(owner, pkg.ScrollPan) === false) {
                    owner = owner.parent;
                }

                if (owner && !owner.mouseDragged) {
                    this.target = owner;
                    this.sx = e.x;
                    this.sy = e.y;
                }
            }
        };

        this.mouseDragged = function(e) {
            if (e.touchCounter == 1 && e.touches && this.target && this.identifier == e.touch.identifier) {
                var d = e.touch.direction;
                if (d == L.BOTTOM || d == L.TOP) {
                    if (this.target.vBar && this.target.vBar.isVisible) {
                        var bar = this.target.vBar;
                        bar.position.setOffset(bar.position.offset - e.y + this.sy);
                    }
                } 
                else {
                    if (d == L.LEFT || d == L.RIGHT) {
                        if (this.target.hBar && this.target.hBar.isVisible) {
                            var bar = this.target.hBar;
                            bar.position.setOffset(bar.position.offset - e.x + this.sx);
                        }
                    }
                }

                this.sx = e.x;
                this.sy = e.y;
            }
        };

        this.mouseDragEnded = function(e) {
            if (this.target != null && 
                this.timer  == null && 
                this.identifier == e.touch.identifier &&
                (e.touch.direction == L.BOTTOM || e.touch.direction == L.TOP) &&
                this.target.vBar != null && 
                this.target.vBar.isVisible && 
                e.touch.dy != 0) 
            {
                this.$dt = 2*e.touch.dy;                     
                var $this = this, bar = this.target.vBar, k = 0;
                this.timer = setInterval(function() {
                    var o = bar.position.offset;
                    bar.position.setOffset(o - $this.$dt);
                    if (++k%5 === 0) { 
                        $this.$dt = Math.floor($this.$dt/2);
                    }

                    if (o == bar.position.offset || ($this.$dt >= -1  &&  $this.$dt <= 1)) {
                        clearInterval($this.timer);
                        $this.timer = $this.target = null; 
                    }
                }, 40);
            }            
        };

        this.mousePressed = function(e) {
            if (this.timer != null) {
                clearInterval(this.timer);
                this.timer = null;
            }
            this.target = null;
        }
    }
]);


pkg.configure(function(conf) {
    var p = zebra()["ui.json"];
    conf.loadByUrl(p ? p : pkg.$url.join("ui.json"), false);
});

/**
 * @for
 */

})(zebra("ui"), zebra.Class, zebra.Interface);

(function(pkg, Class) {


/**
 * @module ui
 */

var ME = pkg.MouseEvent, KE = pkg.KeyEvent, PO = zebra.util.Position;

/**
 * Text field UI component. The component is designed to enter single line, multi lines or password text.
 * The component implement text field functionality from the scratch. It supports the following features
 
    - Text selection
    - Redu/Undo actions
    - Native WEB clipboard 
    - Basic text navigation
    - Read-only mode

 * @constructor
 * @param {String|zebra.data.TextModel|zebra.ui.TextRender} [txt] a text the text field component 
 * has to be filled. The parameter can be a simple string, text model or text render class instance.
 * @param {Integer} [maxCol] a maximal size of entered text. -1 means the size of the edited text
 * has no length limit.  
 * @class zebra.ui.TextField
 * @extends zebra.ui.Label
 */
pkg.TextField = Class(pkg.Label, pkg.KeyListener, pkg.MouseListener,
                      pkg.FocusListener, pkg.CopyCutPaste, [

    function $clazz() {
        this.TextPosition = Class(PO, [
            function (render){
                  this.$super(render);
                  render.target._.add(this);
            },

            function $prototype() {
                this.textUpdated = function(src, b, off, size, startLine, lines){
                      if (b === true) this.inserted(off, size);
                      else this.removed(off, size);
                };
            },

            function destroy() { this.metrics.target._.remove(this); }
        ]);
    },

    function $prototype() {
        /**
         * Selection color
         * @attribute  selectionColor
         * @type {String}
         * @readOnly
         */
        this.selectionColor = this.curView = this.position = null;


        this.blinkingPeriod = -1;
        this.blinkMe = true;
        this.blinkMeCounter = 0;

        this.cursorType = pkg.Cursor.TEXT;

        /**
         * Cursor view
         * @attribute curView
         * @type {zebra.ui.View}
         * @readOnly
         */
        
        /**
         * Indicate if the text field is editable
         * @attribute  isEditable
         * @type {Boolean}
         * @default true
         * @readOnly
         */
        this.isEditable = true;

        this.setBlinking = function(period) {
            if (period != this.blinkingPeriod) {
                this.blinkingPeriod = period;
                this.repaintCursor();
            }
        };

        this.getTextRowColAt = function(render,x,y){
            var size = render.target.getLines();
            if (size === 0) return null;

            var lh = render.getLineHeight(), li = render.getLineIndent(),
                ln = (y < 0) ? 0 : ~~((y + li) / (lh + li)) + ((y + li) % (lh + li) > li ? 1 : 0) -1;

            if(ln >= size) return [size - 1, render.getLine(size - 1).length];
            else if (ln < 0) return [0,0];

            if(x < 0) return [ln, 0];

            var x1 = 0, x2 = 0, s = render.getLine(ln);
            for(var c = 0; c < s.length; c++){
                x1 = x2;
                x2 = render.font.charsWidth(s, 0, c + 1);
                if(x >= x1 && x < x2) return [ln, c];
            }
            return [ln, s.length];
        };

        this.findNextWord = function(t,line,col,d){
            if (line < 0 || line >= t.getLines()) return null;
            var ln = t.getLine(line);
            col += d;
            if (col < 0 && line > 0) return [line - 1, t.getLine(line - 1).length];
            else {
                if (col > ln.length && line < t.getLines() - 1) return [line + 1, 0];
            }

            var b = false;
            for(; col >= 0 && col < ln.length; col += d){
                if (b) {
                    if (d > 0) { if(zebra.util.isLetter(ln[col])) return [line, col]; }
                    else {
                        if (!zebra.util.isLetter(ln[col])) return [line, col + 1];
                    }
                }
                else  {
                    b = d > 0 ? !zebra.util.isLetter(ln[col]) : zebra.util.isLetter(ln[col]);
                }
            }
            return (d > 0 ? [line, ln.length ]: [line, 0]);
        };

        this.getSubString = function(r,start,end){
            var res = [], sr = start[0], er = end[0], sc = start[1], ec = end[1];
            for(var i = sr; i < er + 1; i++){
                var ln = r.getLine(i);
                if (i != sr) res.push('\n');
                else ln = ln.substring(sc);
                if(i == er) ln = ln.substring(0, ec - ((sr == er) ? sc : 0));
                res.push(ln);
            }
            return res.join('');
        };

        /**
         * Remove selected text
         * @method removeSelected
         */
        this.removeSelected = function(){
            if (this.hasSelection()){
                var start = this.startOff < this.endOff ? this.startOff : this.endOff;
                this.remove(start, (this.startOff > this.endOff ? this.startOff : this.endOff) - start);
                this.clearSelection();
            }
        };

        this.startSelection = function(){
            if (this.startOff < 0){
                var pos = this.position;
                this.endLine = this.startLine = pos.currentLine;
                this.endCol = this.startCol = pos.currentCol;
                this.endOff = this.startOff = pos.offset;
            }
        };

        this.keyTyped = function(e){
            if (e.isControlPressed() || e.isCmdPressed() || this.isEditable === false ||
                (e.ch == '\n' && zebra.instanceOf(this.view.target, zebra.data.SingleLineTxt)))
            {
                return;
            }

            this.removeSelected();
            this.write(this.position.offset, e.ch);
        };

        this.selectAll_command = function() {
            this.select(0, this.position.metrics.getMaxOffset());
        };

        this.nextWord_command = function(b, d) {
            if (b) this.startSelection();
            var p = this.findNextWord(this.view.target, this.position.currentLine, 
                                                        this.position.currentCol, d);
            if(p != null) this.position.setRowCol(p[0], p[1]);
        };

        this.nextPage_command = function(b, d) {
            if (b) this.startSelection();
            this.position.seekLineTo(d == 1 ? PO.DOWN : PO.UP, this.pageSize());
        };

        this.keyPressed = function(e) {
            if (this.isFiltered(e)) return;

            var position    = this.position,
                col         = position.currentCol,
                isShiftDown = e.isShiftPressed(),
                line        = position.currentLine,
                foff        = 1;

            if (isShiftDown && e.ch == KE.CHAR_UNDEFINED) {
                this.startSelection();
            }

            switch(e.code)
            {
                case KE.DOWN: position.seekLineTo(PO.DOWN);break;
                case KE.UP: position.seekLineTo(PO.UP);break;
                case KE.LEFT : foff = -1;
                case KE.RIGHT:
                    if (e.isControlPressed() === false && e.isCmdPressed() === false) {
                        position.seek(foff);
                    }
                    break;
                case KE.END:
                    if (e.isControlPressed()) {
                        position.seekLineTo(PO.DOWN, position.metrics.getLines() - line - 1);
                    }
                    else position.seekLineTo(PO.END);
                    break;
                case KE.HOME:
                    if (e.isControlPressed()) position.seekLineTo(PO.UP, line);
                    else position.seekLineTo(PO.BEG);
                    break;
                case KE.DELETE:
                    if (this.hasSelection() && this.isEditable) {
                        this.removeSelected();
                    }
                    else {
                        if (this.isEditable) this.remove(position.offset, 1);
                    } break;
                case KE.BSPACE:
                    if (this.isEditable) {
                        if (this.hasSelection()) this.removeSelected();
                        else {
                            if (this.isEditable && position.offset > 0){
                                position.seek(-1);
                                this.remove(position.offset, 1);
                            }
                        }
                    } break;
                default: return ;
            }

            if (isShiftDown === false) {
                this.clearSelection();
            }
        };

        /**
         * Test if the given key pressed event has to be processed
         * @protected
         * @param  {zebra.ui.KeyEvent} e a key event
         * @return {Boolean} true if the given key pressed event doesn't 
         * have be processed
         * @method isFiltered  
         */
        this.isFiltered = function(e){
            var code = e.code;
            return code == KE.SHIFT || code == KE.CTRL || code == KE.TAB || code == KE.ALT || (e.mask & KE.M_ALT) > 0;
        };

        /**
         * Remove the specified part of edited text 
         * @param  {Integer} pos  a start position of a removed text
         * @param  {Integer} size a size of removed text
         * @method remove
         */
        this.remove = function (pos,size){
            if (this.isEditable) {
                var position = this.position;
                if (pos >= 0 && (pos + size) <= position.metrics.getMaxOffset()) {
                    if (size < 10000) {
                        this.historyPos = (this.historyPos + 1) % this.history.length;
                        this.history[this.historyPos] = [-1, pos, this.getValue().substring(pos, pos+size)];
                        if (this.undoCounter < this.history.length) this.undoCounter++;
                    }

                    var pl = position.metrics.getLines(), old = position.offset;
                    this.view.target.remove(pos, size);
                    if (position.metrics.getLines() != pl || old == pos) {
                        this.repaint();
                    }
                }
            }
        };

        /**
         * Insert the specified text into the edited text at the given position
         * @param  {Integer} pos  a start position of a removed text
         * @param  {String} s a text to be inserted
         * @method write
         */
        this.write = function (pos,s){
            if (this.isEditable) {
                if (s.length < 10000) {
                    this.historyPos = (this.historyPos + 1) % this.history.length;
                    this.history[this.historyPos] = [1, pos, s.length];
                    if (this.undoCounter < this.history.length) this.undoCounter++;
                }

                var old = this.position.offset, m = this.view.target, pl = m.getLines();
                m.write(s, pos);
                if (m.getLines() != pl || this.position.offset == old) {
                    this.repaint();
                }
            }
        };

        this.recalc = function() {
            var r = this.view, p = this.position;
            if (p.offset >= 0){
                var cl = p.currentLine;
                this.curX = r.font.charsWidth(r.getLine(cl), 0, p.currentCol) + this.getLeft();
                this.curY = cl * (r.getLineHeight() + r.getLineIndent()) + this.getTop();
            }
            this.curH = r.getLineHeight() - 1;
        };

        this.catchScrolled = function(psx,psy){
            this.repaint();
        };

        this.canHaveFocus = function(){
            return true;
        };

        /**
         * Draw the text field cursor
         * @protected
         * @param  {2DContext} g  a 2D contextnn
         * @method drawCursor
         */
        this.drawCursor = function (g){
            if (
                this.position.offset >= 0 &&
                this.curView != null      &&
                this.blinkMe              &&
                this.hasFocus()             )
            {
                this.curView.paint(g, this.curX, this.curY,
                                      this.curW, this.curH, this);
            }
        };

        this.mouseDragStarted = function (e){
            if (e.mask == ME.LEFT_BUTTON && this.position.metrics.getMaxOffset() > 0) {
                this.startSelection();
            }
        };

        this.mouseDragEnded =function (e){
            if (e.mask == ME.LEFT_BUTTON && this.hasSelection() === false) {
                this.clearSelection();
            }
        };

        this.mouseDragged = function (e){
            if (e.mask == ME.LEFT_BUTTON){
                var p = this.getTextRowColAt(this.view, e.x - this.scrollManager.getSX(),
                                                        e.y - this.scrollManager.getSY());
                if (p != null) this.position.setRowCol(p[0], p[1]);
            }
        };

        /**
         * Select the specified part of the edited text
         * @param  {Integer} startOffset a start position of a selected text
         * @param  {Integer} endOffset  an end position of a selected text
         * @method select
         */
        this.select = function (startOffset,endOffset){
            if (endOffset < startOffset ||
                startOffset < 0 ||
                endOffset > this.position.metrics.getMaxOffset())
            {
                throw new Error("Invalid selection offsets");
            }

            if (this.startOff != startOffset || endOffset != this.endOff){
                if (startOffset == endOffset) this.clearSelection();
                else {
                    this.startOff = startOffset;
                    var p = this.position.getPointByOffset(startOffset);
                    this.startLine = p[0];
                    this.startCol = p[1];
                    this.endOff = endOffset;
                    p = this.position.getPointByOffset(endOffset);
                    this.endLine = p[0];
                    this.endCol = p[1];
                    this.repaint();
                }
            }
        };

        /**
         * Test if the text field has a selected text
         * @return {Boolean} true if the text field has a selected text
         * @method hasSelection
         */
        this.hasSelection = function () {
            return this.startOff != this.endOff;
        };

        this.posChanged = function (target,po,pl,pc){
            this.recalc();
            var position = this.position;
            if (position.offset >= 0) {

                this.blinkMeCounter = 0;
                this.blinkMe = true;

                var lineHeight = this.view.getLineHeight(), top = this.getTop();
                this.scrollManager.makeVisible(this.curX, this.curY, this.curW, lineHeight);
                if (pl >= 0){
                    if (this.startOff >= 0){
                        this.endLine = position.currentLine;
                        this.endCol = position.currentCol;
                        this.endOff = position.offset;
                    }

                    var minUpdatedLine = pl < position.currentLine ? pl : position.currentLine,
                        li             = this.view.getLineIndent(),
                        bottom         = this.getBottom(),
                        left           = this.getLeft(),
                        y1             = lineHeight * minUpdatedLine + minUpdatedLine * li +
                                         top + this.scrollManager.getSY();

                    if (y1 < top) y1 = top;

                    if (y1 < this.height - bottom){
                        var h = (((pl > position.currentLine) ? pl : position.currentLine) - minUpdatedLine + 1) * (lineHeight + li);
                        if (y1 + h > this.height - bottom) {
                            h = this.height - bottom - y1;
                        }
                        this.repaint(left, y1, this.width - left - this.getRight(), h);
                    }
                }
                else {
                    this.repaint();
                }
            }
        };

        this.paintOnTop = function(g) {
            if (this.hint && this.hasFocus() === false && this.getValue() == '') {
                this.hint.paint(g, this.getLeft(), this.height - this.getBottom() - this.hint.getLineHeight(),
                                this.width, this.height, this);
            }
        };

        /**
         * Set the specified hint text to be drawn with the given font and color.
         * The hint is not-editable text that is shown in empty text field to help 
         * a user to understand which input the text field expects. 
         * @param {String} hint a hint text
         * @param {String|zebra.ui.Font} font a font 
         * @param {String} color a hint color
         * @method setHint
         */
        this.setHint = function(hint, font, color) {
            this.hint = hint;
            if (hint != null && zebra.instanceOf(hint, pkg.View) === false) {
                this.hint = new pkg.TextRender(hint);
                font  = font  ? font  : pkg.TextField.hintFont;
                color = color ? color : pkg.TextField.hintColor;
                this.hint.setColor(color);
                this.hint.setFont(font);
            }
            this.repaint();
            return this.hint;
        };

        this.undo_command = function() {
            if (this.undoCounter > 0) {
                var h = this.history[this.historyPos];

                this.historyPos--;
                if (h[0] == 1) this.remove(h[1], h[2]);
                else           this.write (h[1], h[2]);

                this.undoCounter -= 2;
                this.redoCounter++;

                this.historyPos--;
                if (this.historyPos < 0) this.historyPos = this.history.length - 1;

                this.repaint();
            }
        };

        this.redo_command = function() {
            if (this.redoCounter > 0) {
                var h = this.history[(this.historyPos + 1) % this.history.length];
                if (h[0] == 1) this.remove(h[1], h[2]);
                else           this.write (h[1], h[2]);
                this.redoCounter--;
                this.repaint();
            }
        };

        /**
         * Get a starting position (row and column) of a selected text
         * @return {Array} a position of a selected text. First element 
         * of is a row and second column of selected text. null if 
         * there is no any selected text
         * @method getStartSelection
         */
        this.getStartSelection = function(){
            return this.startOff != this.endOff ? ((this.startOff < this.endOff) ? [this.startLine, this.startCol]
                                                                                 : [this.endLine, this.endCol]) : null;
        };

        /**
         * Get an ending position (row and column) of a selected text
         * @return {Array} a position of a selected text. First element 
         * of is a row and second column of selected text. null if 
         * there is no any selected text
         * @method getEndSelection
         */
        this.getEndSelection = function(){
            return this.startOff != this.endOff ? ((this.startOff < this.endOff) ? [this.endLine, this.endCol]
                                                                                 : [this.startLine, this.startCol]) : null;
        };

        /**
         * Get a selected text
         * @return {String} a selected text
         * @method getSelectedText
         */
        this.getSelectedText = function(){
            return this.startOff != this.endOff ? this.getSubString(this.view, this.getStartSelection(), this.getEndSelection())
                                                : null;
        };

        this.focusGained = function (e){
            if (this.position.offset < 0) {
                this.position.setOffset(0);
            }
            else {
                if (this.hint != null) this.repaint();
                else {
                    if (this.isEditable) {
                        this.repaintCursor();
                    }
                }
            }

            if (this.isEditable && this.blinkingPeriod > 0) {
                this.blinkMeCounter = 0;
                this.blinkMe = true;
                zebra.util.timer.start(this, Math.floor(this.blinkingPeriod/3),
                                             Math.floor(this.blinkingPeriod/3));
            }
        };

        this.focusLost = function(e){
            if (this.isEditable) {
                if (this.hint) this.repaint();
                else {
                    this.repaintCursor();
                }

                if (this.blinkingPeriod > 0) {
                    zebra.util.timer.stop(this);
                    this.blinkMe = true;
                }
            }
        };

        this.repaintCursor = function() {
            if (this.curX > 0 && this.curW > 0 && this.curH > 0) {
                this.repaint(this.curX + this.scrollManager.getSX(),
                             this.curY + this.scrollManager.getSY(),
                             this.curW, this.curH);
            }
        };

        this.run = function() {
            this.blinkMeCounter = (this.blinkMeCounter + 1) % 3;

            if (this.blinkMeCounter === 0) {
                this.blinkMe = !this.blinkMe;
                this.repaintCursor();
            }
        };

        /**
         * Clear a text selection. 
         * @method clearSelection
         */
        this.clearSelection = function (){
            if (this.startOff >= 0){
                var b = this.hasSelection();
                this.endOff = this.startOff =  -1;
                if (b) this.repaint();
            }
        };

        this.pageSize = function (){
            var height = this.height - this.getTop() - this.getBottom(),
                indent = this.view.getLineIndent(),
                textHeight = this.view.getLineHeight();
            return (((height + indent) / (textHeight + indent) + 0.5) | 0) +
                   (((height + indent) % (textHeight + indent) > indent) ? 1 : 0);
        };

        this.createPosition = function (r){
            return new pkg.TextField.TextPosition(r);
        };

        this.paste = function(txt){
            if (txt != null){
                this.removeSelected();
                this.write(this.position.offset, txt);
            }
        };

        this.copy = function() {
            return this.getSelectedText();
        };

        this.cut = function() {
            var t = this.getSelectedText();
            if (this.isEditable) this.removeSelected();
            return t;
        };

        /**
         * Set the specified cursor position controller 
         * @param {zebra.util.Position} p a position controller
         * @method setPosition
         */
        this.setPosition = function (p){
            if (this.position != p){
                if (this.position != null){
                    this.position._.remove(this);
                    if (this.position.destroy) this.position.destroy();
                }
                this.position = p;
                this.position._.add(this);
                this.invalidate();
            }
        };

        /**
         * Set the cursor view. The view defines rendering of the text field 
         * cursor.
         * @param {zebra.ui.View} v a cursor view
         * @method setCursorView
         */
        this.setCursorView = function (v){
            // !!!
            // cursor size should be set by property
            this.curW = 1;
            this.curView = pkg.$view(v);
            //this.curW = this.curView != null ? this.curView.getPreferredSize().width : 1;
            this.vrp();
        };

        /**
         * Adjust the size of the text field component to be enough to place the given
         * number of rows and columns.
         * @param {Integer} r a row of the text the height of the text field has to be adjusted
         * @param {Integer} c a column of the text the width of the text field has to be adjusted
         * @method setPSByRowsCols
         */
        this.setPSByRowsCols = function (r,c){
            var tr = this.view, 
                w  = (c > 0) ? (tr.font.stringWidth("W") * c)
                             : this.psWidth,
                h  = (r > 0) ? (r * tr.getLineHeight() + (r - 1) * tr.getLineIndent())
                             : this.psHeight;
            this.setPreferredSize(w, h);
        };

        /**
         * Control the text field editable state
         * @param {Boolean} b true to make the text field editable
         * @method setEditable
         */
        this.setEditable = function (b){
            if (b != this.isEditable){
                this.isEditable = b;
                if (b && this.blinkingPeriod > 0 && this.hasFocus()) {
                    zebra.util.timer.stop(this);
                    this.blinkMe = true;
                }  
                this.vrp();
            }
        };

        this.mousePressed = function(e){
            if (e.isActionMask()) {
                if (e.clicks > 1) {
                    this.select(0, this.position.metrics.getMaxOffset());
                }
                else {
                    if ((e.mask & KE.M_SHIFT) > 0) this.startSelection();
                    else this.clearSelection();
                    var p = this.getTextRowColAt(this.view, e.x - this.scrollManager.getSX() - this.getLeft(),
                                                            e.y - this.scrollManager.getSY() - this.getTop());
                    if (p != null) this.position.setRowCol(p[0], p[1]);
                }
            }
        };

        /**
         * Set selection color
         * @param {String} c a selection color
         * @method setSelectionColor
         */
        this.setSelectionColor = function (c){
            if (c != this.selectionColor){
                this.selectionColor = c;
                if (this.hasSelection()) this.repaint();
            }
        };

        this.calcPreferredSize = function (t) {
            return this.view.getPreferredSize();
        };

        //!!! to maixinmal optimize performance the method duplicates part of ViewPan.paint() code
        this.paint = function(g){
            var sx = this.scrollManager.getSX(), sy = this.scrollManager.getSY();
            try{
                g.translate(sx, sy);

                //!!! this code can be found in ViewPan.paint()
                var l = this.getLeft(), t = this.getTop();
                this.view.paint(g, l, t, this.width  - l - this.getRight(),
                                         this.height - t - this.getBottom(), this);
                this.drawCursor(g);
            }
            catch(e) { throw e; }
            finally { g.translate( -sx,  -sy); }
        };
    },

    function () {
        this.$this("");
    },

    function(s, maxCol){
        var b = zebra.isNumber(maxCol);
        this.$this(b ? new zebra.data.SingleLineTxt(s, maxCol)
                     : (maxCol ? new zebra.data.Text(s) : s));
        if (b && maxCol > 0) this.setPSByRowsCols(-1, maxCol);
    },

    function (render){
        if (zebra.isString(render)) {
            render = new pkg.TextRender(new zebra.data.SingleLineTxt(render));
        }
        else {
            if (zebra.instanceOf(render, zebra.data.TextModel)) {
                render = new pkg.TextRender(render);
            }
        }
        this.startLine = this.startCol = this.endLine = this.endCol = this.curX = 0;
        this.startOff = this.endOff = -1;
        this.history = Array(100);
        this.historyPos = -1;
        this.redoCounter = this.undoCounter = this.curY = this.curW = this.curH = 0;

        this.$super(render);
        this.scrollManager = new pkg.ScrollManager(this);
    },

    function setView(v){
        if (v != this.view) {
            this.$super(v);
            this.setPosition(this.createPosition(this.view));
        }
    },

    /**
     * Set the text content of the text field component
     * @param {String} s a text the text field component has to be filled
     * @method setValue
     */
    function setValue(s){
        var txt = this.getValue();
        if (txt != s){
            this.position.setOffset(0);
            this.scrollManager.scrollTo(0, 0);
            this.$super(s);
        }
    },

    function setEnabled(b){
        this.clearSelection();
        this.$super(b);
    }
]);

/**
 * Text area UI component. The UI component to render multi-lines text.
 * @class zebra.ui.TextArea
 * @constructor
 * @param {String} [txt] a text 
 * @extends zebra.ui.TextField
 */
pkg.TextArea = Class(pkg.TextField, [
    function() {
        this.$this("");
    },

    function(txt) {
        this.$super(new zebra.data.Text(txt));
    }
]);

/**
 * Password text filed.
 * @class zebra.PassTextField
 * @param {String} txt password text
 * @param {Integer} [maxSize] maximal size
 * @param {Boolean} [showLast] indicates if last typed character should 
 * not be disguised with a star character 
 * @extends zebra.ui.TextField
 * visible
 */
pkg.PassTextField = Class(pkg.TextField, [
    function(txt) {
        this.$this(txt, -1);
    },

    function(txt, size) {
        this.$this(txt, size, false);
    },

    function(txt, size, showLast) {
        var pt = new pkg.PasswordText(new zebra.data.SingleLineTxt(txt, size));
        pt.showLast = showLast;
        this.$super(pt);
    }
]);


/**
 * @for
 */

})(zebra("ui"), zebra.Class);

(function(pkg, Class) {

/**
 * @module ui
*/

var L = zebra.layout, Position = zebra.util.Position, KE = pkg.KeyEvent, Listeners = zebra.util.Listeners;

/**
 * Base UI list component class that has to be extended with a 
 * concrete list component implementation. The list component 
 * visualizes list model.
 * @class  zebra.ui.BaseList
 * @extends {zebra.ui.Panel}
 */

/**
 * Fire when a list item has been selected:
        
        list._.add(function(src, prev) {
            ...
        });

 * @event selected
 * @param {zebra.ui.BaseList} src a list that triggers the event
 * @param {Ineteger} prev a previous selected index
 */
pkg.BaseList = Class(pkg.Panel, pkg.MouseListener, pkg.KeyListener, Position.Metric, [
    function $prototype() {
        this.gap = 2;

        /**
         * Selected list item index
         * @type {Integer}
         * @readOnly
         * @attribute selectedIndex
         */
        
        /**
         * List model the component visualizes
         * @attribute model
         * @type {zebra.data.ListModel}
         * @readOnly
         */

        /**
         * Select the specified list item. 
         * @param {Object} v a list item to be selected. Use null as 
         * the parameter value to clean an item selection
         * @method setValue 
         */
        this.setValue = function(v) {
            if (v == null) {
                this.select(-1);
                return;
            }

            for(var i=0; i<this.model.count(); i++) {
                if (this.model.get(i) == v) {
                    this.select(i);
                    return;
                }
            }

            throw new Error("Invalid value : " + v);
        };

        /**
         * Get the list component selected item
         * @return {Object} a selected item
         * @method getValue 
         */
        this.getValue = function() {
            return this.getSelected();
        };
        
        /**
         * Get a value that defines left, right, top and bottom list item gaps.  
         * @return {Integer} an item gap
         * @method getItemGap
         */
        this.getItemGap = function() {
            return this.gap;
        };

        /**
         * Get selected list item
         * @return {Object} an item 
         * @method getSelected
         */
        this.getSelected = function(){
            return this.selectedIndex < 0 ? null
                                          : this.model.get(this.selectedIndex);
        };

        this.lookupItem = function(ch){
            var count = this.model == null ? 0 : this.model.count();
            if (zebra.util.isLetter(ch) && count > 0){
                var index = this.selectedIndex < 0 ? 0 : this.selectedIndex + 1;
                ch = ch.toLowerCase();
                for(var i = 0;i < count - 1; i++){
                    var idx = (index + i) % count, item = this.model.get(idx).toString();
                    if (item.length > 0 && item[0].toLowerCase() == ch) return idx;
                }
            }
            return -1;
        };

        /**
         * Test if the given list item is selected
         * @param  {Integer}  i an item index
         * @return {Boolean}  true if the item with the given index is selected
         * @method isSelected
         */
        this.isSelected = function(i) { 
            return i == this.selectedIndex; 
        };

        this.correctPM = function(x,y){
            if (this.isComboMode){
                var index = this.getItemIdxAt(x, y);
                if (index >= 0 && index != this.position.offset) {
                    this.position.setOffset(index);
                    this.notifyScrollMan(index);
                }
            }
        };

        /**
         * Return the given list item location. 
         * @param  {Integer} i a list item index
         * @return {Object}  a location of the list item. The result is object that 
         * has the following structure:
                { x:Integer, y:Integer}
         * @method getItemLocation
         */
        this.getItemLocation = function(i) {
            this.validate();
            var gap = this.getItemGap(), y = this.getTop() + this.scrollManager.getSY() + gap;
            for(var i = 0;i < index; i++) y += (this.getItemSize(i).height + 2 * gap);
            return { x:this.getLeft(), y:y };
        };

        /**
         * Return the given list item size. 
         * @param  {Integer} i a list item index
         * @return {Object}  a size of the list item. The result is object that 
         * has the following structure:
                { width:Integer, height:Integer}
         * @method getItemLocation
         */
        this.getItemSize = function (i){
            return this.provider.getView(this, this.model.get(i), i).getPreferredSize();
        };

        this.mouseMoved   = function(e){ this.correctPM(e.x, e.y); };

        this.getLines     = function() { return this.model.count();};
        this.getLineSize  = function(l){ return 1; };
        this.getMaxOffset = function (){ return this.getLines() - 1; };
        this.canHaveFocus = function (){ return true; };

        this.catchScrolled = function(psx,psy){ this.repaint();};
       
        /**
         * Detect an item by the specified location
         * @param  {Integer} x a x coordinate
         * @param  {Integer} y a y coordinate
         * @return {Integer} a list item that is located at the given position. -1 if no any list item can be 
         * found.
         * @method getItemIdxAt   
         */
        this.getItemIdxAt  = function(x,y){ return -1;};

        /**
         * Calculate maximal width and maximal height the items in the list have
         * @protected
         * @return {Integer} a max items size
         * @method calcMaxItemSize
         */
        this.calcMaxItemSize = function (){
            var maxH = 0, maxW = 0;
            this.validate();
            if (this.model != null) {
                for(var i = 0;i < this.model.count(); i ++ ){
                    var is = this.getItemSize(i);
                    if(is.height > maxH) maxH = is.height;
                    if(is.width  > maxW) maxW = is.width;
                }
            }
            return { width:maxW, height:maxH };
        };

        /**
         * Force repainting of the given list items 
         * @protected
         * @param  {Integer} p an index of the first list item to be repainted
         * @param  {Integer} n an index of the second list item to be repainted
         * @method  repaintByOffsets
         */
        this.repaintByOffsets = function(p,n){
            this.validate();
            var xx = this.width - this.getRight(),
                gap = this.getItemGap(),
                count = this.model == null ? 0 : this.model.count();

            if (p >= 0 && p < count){
                var l = this.getItemLocation(p), x = l.x - gap;
                this.repaint(x, l.y - gap, xx - x, this.getItemSize(p).height + 2 * gap);
            }

            if (n >= 0 && n < count){
                var l = this.getItemLocation(n), x = l.x - gap;
                this.repaint(x, l.y - gap, xx - x, this.getItemSize(n).height + 2 * gap);
            }
        };

        this.update = function(g) {
            if (this.selectedIndex >= 0 && this.views["select"] != null){
                var gap = this.getItemGap(),
                    is  = this.getItemSize(this.selectedIndex),
                    l   = this.getItemLocation(this.selectedIndex);

                this.drawSelMarker(g, l.x - gap, l.y - gap,
                                   is.width + 2 * gap,
                                   is.height + 2 * gap);
            }
        };

        this.paintOnTop = function(g) {
            if (this.views["marker"] != null && (this.isComboMode || this.hasFocus())){
                var offset = this.position.offset;
                if (offset >= 0){
                    var gap = this.getItemGap(),
                        is  = this.getItemSize(offset),
                        l   = this.getItemLocation(offset);

                    this.drawPosMarker(g, l.x - gap, l.y - gap,
                                          is.width  + 2 * gap, is.height + 2 * gap);
                }
            }
        };

        /**
         * Select the given list item
         * @param  {Integer} index an item index to be selected
         * @method select
         */
        this.select = function(index){
            if (this.model != null && index >= this.model.count()){
                throw new Error("index=" + index + ",max=" + this.model.count());
            }

            if (this.selectedIndex != index){
                var prev = this.selectedIndex;
                this.selectedIndex = index;
                this.notifyScrollMan(index);
                this.repaintByOffsets(prev, this.selectedIndex);
                this._.fired(this, prev);
            }
            else {
                this._.fired(this, null);
            }
        };

        this.mouseClicked = function(e) {
            if (this.model != null && e.isActionMask() && this.model.count() > 0) {
                this.select(this.position.offset < 0 ? 0 : this.position.offset);
            }
        };

        this.mouseReleased = function(e){
            if (this.model != null     &&
                this.model.count() > 0 &&
                e.isActionMask()       &&
                this.position.offset != this.selectedIndex)
            {
                this.position.setOffset(this.selectedIndex);
            }
        };

        this.mousePressed = function(e){
            if (e.isActionMask() && this.model != null && this.model.count() > 0) { //&& this.isComboMode === false) {
                var index = this.getItemIdxAt(e.x, e.y);
                if (index >= 0 && this.position.offset != index) {
                    this.position.setOffset(index);
                }
            }
        };

        this.mouseEntered  = function(e){
            this.correctPM(e.x, e.y);
        };

        this.keyPressed = function(e){
            if (this.model != null && this.model.count() > 0){
                var po = this.position.offset;
                switch(e.code) {
                    case KE.END:
                        if (e.isControlPressed()) {
                            this.position.setOffset(this.position.metrics.getMaxOffset());
                        }
                        else {
                            this.position.seekLineTo(Position.END);
                        }
                        break;
                    case KE.HOME:
                        if (e.isControlPressed()) this.position.setOffset(0);
                        else this.position.seekLineTo(Position.BEG);
                        break;
                    case KE.RIGHT    : this.position.seek(1); break;
                    case KE.DOWN     : this.position.seekLineTo(Position.DOWN); break;
                    case KE.LEFT     : this.position.seek(-1);break;
                    case KE.UP       : this.position.seekLineTo(Position.UP);break;
                    case KE.PAGEUP   : this.position.seek(this.pageSize(-1));break;
                    case KE.PAGEDOWN : this.position.seek(this.pageSize(1));break;
                    case KE.SPACE    :
                    case KE.ENTER    : this.select(this.position.offset);break;
                }

                if (po != this.position.offset) {
                    if (this.isComboMode) {
                        this.notifyScrollMan(this.position.offset);
                    }
                    else {
                        this.select(this.position.offset);
                    }
                }
            }
        };

        this.keyTyped = function (e){
            var i = this.lookupItem(e.ch);
            if (i >= 0) this.select(i);
        };

        this.elementInserted = function(target, e,index){
            this.invalidate();
            if (this.selectedIndex >= 0 && this.selectedIndex >= index) {
                this.selectedIndex++;
            }
            this.position.inserted(index, 1);
            this.repaint();
        };

        this.elementRemoved = function(target, e,index){
            this.invalidate();
            if (this.selectedIndex == index || this.model.count() === 0) {
                this.select(-1);
            }
            else {
                if (this.selectedIndex > index) {
                    this.selectedIndex--;
                }
            }
            this.position.removed(index, 1);
            this.repaint();
        };

        this.elementSet = function (target, e, pe,index){
            this.invalidate();
            this.repaint();
        };

        this.posChanged = function (target,prevOffset,prevLine,prevCol){
            var off = this.position.offset;
          //  this.notifyScrollMan(off);
            this.repaintByOffsets(prevOffset, off);
        };

        this.drawSelMarker = function (g,x,y,w,h) {
            if (this.views["select"]) this.views["select"].paint(g, x, y, w, h, this);
        };

        this.drawPosMarker = function (g,x,y,w,h) {
            if (this.views["marker"]) this.views["marker"].paint(g, x, y, w, h, this);
        };

        /**
         * Set the left, right, top and bottom a list item paddings
         * @param {Integer} g a left, right, top and bottom a list item paddings
         * @method setItemGap
         */
        this.setItemGap = function(g){
            if (this.gap != g){
                this.gap = g;
                this.vrp();
            }
        };

        /**
         * Set the list model to be rendered with the list component
         * @param {zebra.data.ListModel} m a list model
         * @method setModel
         */
        this.setModel = function (m){
            if (m != this.model){
                if (m != null && Array.isArray(m)) {
                    m = new zebra.data.ListModel(m);
                }

                if (this.model != null && this.model._) this.model._.remove(this);
                this.model = m;
                if (this.model != null && this.model._) this.model._.add(this);
                this.vrp();
            }
        };

        /**
         * Set the given position controller. List component uses position to 
         * track virtual cursor.
         * @param {zebra.util.Position} c a position 
         * @method setPosition
         */
        this.setPosition = function(c){
            if (c != this.position) {
                if (this.position != null) this.position._.remove(this);
                this.position = c;
                this.position._.add(this);
                this.position.setMetric(this);
                this.repaint();
            }
        };

        /**
         * Set the list items view provider. Defining a view provider allows developers
         * to customize list item rendering.  
         * @param {Object} v a view provider
         * @method setViewProvider
         */
        this.setViewProvider = function (v){
            if(this.provider != v){
                this.provider = v;
                this.vrp();
            }
        };

        this.notifyScrollMan = function (index){
            if (index >= 0 && this.scrollManager != null) {
                this.validate();
                var gap = this.getItemGap(),
                    dx = this.scrollManager.getSX(), dy = this.scrollManager.getSY(),
                    is = this.getItemSize(index), l = this.getItemLocation(index);

                this.scrollManager.makeVisible(l.x - dx - gap, l.y - dy - gap,
                                               is.width + 2 * gap, is.height + 2 * gap);
            }
        };

        this.pageSize = function(d){
            var offset = this.position.offset;
            if (offset >= 0) {
                var vp = pkg.$cvp(this, {});
                if (vp != null) {
                    var sum = 0, i = offset, gap = 2 * this.getItemGap();
                    for(;i >= 0 && i <= this.position.metrics.getMaxOffset() && sum < vp.height; i += d){
                        sum += (this.getItemSize(i).height + gap);
                    }
                    return i - offset - d;
                }
            }
            return 0;
        };
    },

    function (m, b){
        /**
         * Currently selected list item index 
         * @type {Integer}
         * @attribute selectedIndex
         * @default -1
         * @readOnly
         */
        this.selectedIndex = -1;
        
        this._ = new Listeners();
        this.isComboMode = b;

        /**
         * Scroll manager
         * @attribute scrollManager
         * @readOnly
         * @type {zebra.ui.ScrollManager}
         */
        this.scrollManager = new pkg.ScrollManager(this);
        this.$super();

        // position manager should be set before model initialization
        this.setPosition(new Position(this));

        /**
         * List model
         * @readOnly
         * @attribute model
         */
        this.setModel(m);
    },

    function focused(){
        this.$super();
        this.repaint();
    }
]);
pkg.BaseList.prototype.setViews = pkg.$ViewsSetter;

/**
 * The class is list component implementation that visualizes zebra.data.ListModel. 
 * It is supposed the model can have any type of items. Visualization of the items 
 * is customized by defining a view provider. 
 * @class  zebra.ui.List
 * @extends zebra.ui.BaseList
 * @constructor
 * @param {zebra.data.ListModel|Array} [model] a list model that should be passed as an instance
 * of zebra.data.ListModel or as an array.
 * @param {Boolean} [isComboMode] true if the list navigation has to be triggered by 
 * mouse cursor moving
 */
pkg.List = Class(pkg.BaseList, [
    function $clazz() {
        /**
         * List view provider class. This implementation renders list item using string 
         * render. If a list item is an instance of "zebra.ui.View" class than it will 
         * be rendered as the view.
         * @class zebra.ui.List.ViewProvider
         * @constructor
         * @param {String|zebra.ui.Font} [f] a font to render list item text
         * @param {String} [c] a color to render list item text
         */
        this.ViewProvider = Class([
            function $prototype() {
                this[''] = function(f, c) {
                    /**
                     * Reference to text render that is used to paint a list items
                     * @type {zebra.ui.TextRender}
                     * @attribute text
                     * @readOnly
                     */

                    this.text = new pkg.TextRender("");
                    if (f != null) this.text.setFont(f);
                    if (c != null) this.text.setColor(c);
                };

                /**
                 * Get a view for the given model data element of the
                 * specified list component 
                 * @param  {zebra.ui.List} target a list component
                 * @param  {Object} value  a data model value
                 * @return {zebra.ui.View}  a view to be used to render 
                 * the given list component item
                 * @method getView
                 */
                this.getView = function(target, value, i) {
                    if (value && value.paint) return value;
                    this.text.target.setValue(value == null ? "<null>" : value.toString());
                    return this.text;
                };
            }
        ]);

        /**
         * @for zebra.ui.List
         */
    },

    function $prototype() {
        this.paint = function(g){
            this.vVisibility();
            if (this.firstVisible >= 0){
                var sx = this.scrollManager.getSX(), sy = this.scrollManager.getSY();
                try {
                    g.translate(sx, sy);
                    var gap      = this.getItemGap(),
                        y        = this.firstVisibleY,
                        x        = this.getLeft() + gap,
                        yy       = this.vArea.y + this.vArea.height - sy,
                        count    = this.model.count(),
                        provider = this.provider;

                    for(var i = this.firstVisible; i < count; i++){
                        if (i != this.selectedIndex && provider.getCellColor) {
                            var bc = provider.getCellColor(this, i);
                            if (bc != null) {
                                g.setColor(bc);
                                g.fillRect(x - gap,
                                           y - gap, 
                                           this.width,
                                           this.heights[i] + 2*gap);
                            }
                        }
                        provider.getView(this, this.model.get(i), i).paint(g, x, y, this.widths[i], this.heights[i], this);
                        y += (this.heights[i] + 2 * gap);
                        if (y > yy) break;
                    }
                }
                catch(e) {
                    throw e;
                }
                finally {
                    g.translate(-sx,  -sy);
                }
            }
        };

        this.recalc = function(){
            this.psWidth_ = this.psHeight_ = 0;
            if (this.model != null) {
                var count = this.model.count();
                if (this.heights == null || this.heights.length != count) {
                    this.heights = Array(count);
                }

                if (this.widths  == null || this.widths.length  != count) {
                    this.widths  = Array(count);
                }

                var provider = this.provider;
                if (provider != null) {
                    for(var i = 0;i < count; i++){
                        var ps = provider.getView(this, this.model.get(i), i).getPreferredSize();
                        this.heights[i] = ps.height;
                        this.widths [i] = ps.width;
                        if (this.widths[i] > this.psWidth_) {
                            this.psWidth_ = this.widths[i];
                        }
                        this.psHeight_ += this.heights[i];
                    }
                }
            }
        };

        this.calcPreferredSize = function(l){
            var gap = 2 * this.getItemGap();
            return { width:gap + this.psWidth_,
                     height: this.model == null ? 0 : gap * this.model.count() + this.psHeight_ };
        };

        this.vVisibility = function(){
            this.validate();
            var prev = this.vArea;
            this.vArea = pkg.$cvp(this, {});

            if (this.vArea == null) {
                this.firstVisible = -1;
                return;
            }

            if (this.visValid === false ||
                (prev == null || prev.x != this.vArea.x ||
                 prev.y != this.vArea.y || prev.width != this.vArea.width ||
                 prev.height != this.vArea.height))
            {
                var top = this.getTop(), gap = this.getItemGap();
                if (this.firstVisible >= 0){
                    var dy = this.scrollManager.getSY();
                    while (this.firstVisibleY + dy >= top && this.firstVisible > 0){
                        this.firstVisible--;
                        this.firstVisibleY -= (this.heights[this.firstVisible] + 2 * gap);
                    }
                }
                else {
                    this.firstVisible = 0;
                    this.firstVisibleY = top + gap;
                }

                if (this.firstVisible >= 0){
                    var count = this.model == null ? 0 : this.model.count(), hh = this.height - this.getBottom();

                    for(; this.firstVisible < count; this.firstVisible++)
                    {
                        var y1 = this.firstVisibleY + this.scrollManager.getSY(),
                            y2 = y1 + this.heights[this.firstVisible] - 1;

                        if ((y1 >= top && y1 < hh) || (y2 >= top && y2 < hh) || (y1 < top && y2 >= hh)) {
                            break;
                        }

                        this.firstVisibleY += (this.heights[this.firstVisible] + 2 * gap);
                    }

                    if (this.firstVisible >= count) this.firstVisible =  -1;
                }
                this.visValid = true;
            }
        };

        this.getItemLocation = function(index){
            this.validate();
            var gap = this.getItemGap(), y = this.getTop() + this.scrollManager.getSY() + gap;
            for(var i = 0;i < index; i++) {
                y += (this.heights[i] + 2 * gap);
            }
            return { x:this.getLeft() + this.getItemGap(), y:y };
        };

        this.getItemSize = function(i){
            this.validate();
            return { width:this.widths[i], height:this.heights[i] };
        };

        this.getItemIdxAt = function(x,y){
            this.vVisibility();
            if (this.vArea != null && this.firstVisible >= 0) {
                var yy    = this.firstVisibleY + this.scrollManager.getSY(),
                    hh    = this.height - this.getBottom(),
                    count = this.model.count(),
                    gap   = this.getItemGap(),
                    dgap  = gap * 2;

                for(var i = this.firstVisible; i < count; i++) {
                    if (y >= yy - gap && y < yy + this.heights[i] + dgap) {
                        return i;
                    }
                    yy += (this.heights[i] + dgap);
                    if (yy > hh) break;
                }
            }
            return  -1;
        };
    },

    function() {
        this.$this(false);
    },

    function (m) {
        if (zebra.isBoolean(m)) this.$this([], m);
        else this.$this(m, false);
    },

    function (m, b){
        /**
         * Index of the first visible list item
         * @readOnly
         * @attribute firstVisible
         * @type {Integer}
         * @private
         */
        this.firstVisible = -1;

        /**
         * Y coordinate of the first visible list item
         * @readOnly
         * @attribute firstVisibleY
         * @type {Integer}
         * @private
         */
        this.firstVisibleY = this.psWidth_ = this.psHeight_ = 0;
        this.heights = this.widths = this.vArea = null;
        
        /**
         * Internal flag to track list items visibility status. It is set 
         * to false to trigger list items metrics and visibility recalculation 
         * @attribute visValid 
         * @type {Boolean}
         * @private
         */
        this.visValid = false;
        this.setViewProvider(new pkg.List.ViewProvider());
        this.$super(m, b);
    },

    function invalidate(){
        this.visValid = false;
        this.firstVisible = -1;
        this.$super();
    },

    function drawSelMarker(g,x,y,w,h){
        this.$super(g, x, y, this.width - this.getRight() - x, h);
    },

    function drawPosMarker(g,x,y,w,h){
        this.$super(g, x, y, this.width - this.getRight() - x, h);
    },

    function catchScrolled(psx,psy){
        this.firstVisible = -1;
        this.visValid = false;
        this.$super(psx, psy);
    }
]);

/**
 * List component consider its children UI components as a list model items. Every added to the component 
 * UI children component becomes a list model element. The implementation allows developers to use 
 * other UI components as its elements what makes list item view customization very easy and powerful.
 * @class zebra.ui.CompList
 * @extends zebra.ui.BaseList
 * @param {zebra.data.ListModel|Array} [model] a list model that should be passed as an instance
 * of zebra.data.ListModel or as an array.
 * @param {Boolean} [isComboMode] true if the list navigation has to be triggered by 
 * mouse cursor moving 
 */
pkg.CompList = Class(pkg.BaseList, pkg.Composite, [
    function $clazz() {
        this.Label      = Class(pkg.Label, []);
        this.ImageLabel = Class(pkg.ImageLabel, []);
        var CompListModelListeners = Listeners.Class("elementInserted", "elementRemoved");

        this.CompListModel = Class([
            function $prototype() {
                this.get = function (i) { return this.src.kids[i]; };

                this.set = function(item,i){
                    this.src.removeAt(i);
                    this.src.insert(i, null, item);
                };

                this.add = function(o){ this.src.add(o); };
                this.removeAt = function (i){ this.src.removeAt(i);};
                this.insert = function (item,i){ this.src.insert(i, null, item); };
                this.count = function (){ return this.src.kids.length; };
                this.removeAll = function () { this.src.removeAll(); };
            },

            function(src) {
                this.src = src;
                this._ = new CompListModelListeners();
            }
        ]);
    },

    function $prototype() {
        this.catchScrolled = function(px,py) {};

        this.getItemLocation = function(i) {
            var gap = this.getItemGap();
            return { x:this.kids[i].x + gap, y:this.kids[i].y + gap };
        };

        this.getItemSize = function (i) {
            var gap = this.getItemGap();
            return { width:this.kids[i].width - 2 * gap, height:this.kids[i].height -  2 * gap };
        };

        this.recalc = function (){
            var gap = this.getItemGap();
            this.max = L.getMaxPreferredSize(this);
            this.max.width  -= 2 * gap;
            this.max.height -= 2 * gap;
        };

        this.calcMaxItemSize = function (){
            this.validate();
            return { width:this.max.width, height:this.max.height };
        };

        this.getItemIdxAt = function(x,y){
            return L.getDirectAt(x, y, this);
        };

        this.catchInput = function (child){
            if (this.isComboMode) {
                return true;
            }

            var b = this.input != null && L.isAncestorOf(this.input, child);

            if (b && this.input != null &&
                L.isAncestorOf(this.input, pkg.focusManager.focusOwner) &&
                this.hasFocus() === false)
            {
                this.input = null;
            }
            return (this.input == null || b === false);
        };
    },

    function () {
        this.$this([], false);
    },

    function (b){
        if (zebra.isBoolean(b)) {
            this.$this([], b);
        }
        else {
            this.$this(b, false);
        }
    },

    function (d, b){
        this.input = this.max = null;
        this.setViewProvider(new zebra.Dummy([
            function getView(target,obj,i) {
                return new pkg.CompRender(obj);
            }
        ]));
        this.$super(d, b);
    },

    function setModel(m){
        var a =[];
        if (Array.isArray(m)) {
            a = m;
            m = new pkg.CompList.CompListModel(this);
        }

        if (zebra.instanceOf(m, pkg.CompList.CompListModel) === false) {
            throw new Error("Invalid model");
        }

        this.$super(m);
        for(var i=0; i < a.length; i++) this.add(a[i]);
    },

    function setPosition(c){
        if (c != this.position){
            if (zebra.instanceOf(this.layout, Position.Metric)) {
                c.setMetric(this.layout);
            }
            this.$super(c);
        }
    },

    function setLayout(layout){
        if (layout != this.layout){
            this.scrollManager = new pkg.ScrollManager(this, [
                function $prototype() {
                    this.calcPreferredSize = function(t) {
                        return layout.calcPreferredSize(t);
                    };

                    this.doLayout = function(t){
                        layout.doLayout(t);
                        for(var i = 0; i < t.kids.length; i++){
                            var kid = t.kids[i];
                            kid.setLocation(kid.x + this.getSX(),
                                            kid.y + this.getSY());
                        }
                    };

                    this.updated = function(sx,sy,px,py){
                        this.target.vrp();
                    };
                }
            ]);

            this.$super(this.scrollManager);
            if (this.position != null) {
                this.position.setMetric(zebra.instanceOf(layout, Position.Metric) ? layout : this);
            }
        }
    },

    function focused(){
        var o = this.position.offset;
        this.input = (o >= 0 && o == this.selectedIndex) ? this.model.get(this.position.offset) : null;
        this.$super();
    },

    function drawSelMarker(g,x,y,w,h){
        if (this.input == null || L.isAncestorOf(this.input, pkg.focusManager.focusOwner) === false) {
            this.$super(g, x, y, w, h);
        }
    },

    function posChanged(target,prevOffset,prevLine,prevCol){
        this.$super(target, prevOffset, prevLine, prevCol);
        if (this.isComboMode === false) {
            this.input = (this.position.offset >= 0) ? this.model.get(this.position.offset)
                                                     : null;
        }
    },

    function insert(index,constr,e) {
        var c = zebra.isString(e) ? new pkg.CompList.Label(e) : e,
            g = this.getItemGap();
        c.setPaddings(c.top + g, c.left + g, c.bottom + g, c.right + g);
        return this.$super(index, constr, c);
    },

    function kidAdded(index,constr,e){
        this.$super(index,constr,e);
        this.model._.elementInserted(this, e, index);
    },

    function kidRemoved(index,e) {
        var g = this.getItemGap();
        e.setPaddings(c.top - g, c.left - g, c.bottom - g, c.right - g);
        this.model._.elementRemoved(this, e, index);
    }
]);

var ContentListeners = Listeners.Class("contentUpdated");

/**
 * Combo box UI component class 
 * @class zebra.ui.Combo
 * @extends {zebra.ui.Panel}
 */

/**
 * Fired when a new value in a combo box component has been selected
  
     combo._.add(function(combo, value) {
         ...
     });

 * @event selected
 * @param {zebra.ui.Combo} combo a combo box component where a new value
 * has been selected
 * @param {Object} value a new value that has been selected
 */
pkg.Combo = Class(pkg.Panel, pkg.MouseListener, pkg.KeyListener, pkg.Composite, [
    function $clazz() {
        /**
         * UI panel class that is used to implement combo box content area  
         * @class  zebra.ui.Combo.ContentPan
         * @extends {zebra.ui.Panel}
         */
        this.ContentPan = Class(pkg.Panel, [
            function $prototype() {
                /**
                 * Called whenever the given combo box value has been updated with the specified 
                 * value. Implement the method to synchronize content panel with updated combo 
                 * box value
                 * @method updateValue
                 * @param {zebra.ui.Combo} combo a combo box component that has been updated
                 * @param {Object} value a value with which the combo box has been updated
                 */
                this.updateValue = function(combo, value) {

                };
                
                /**
                 * Indicates if the content panel is editable. Set the property to true 
                 * to indicate the content panel implementation is editable. Editable
                 * means the combo box content can be editable by a user
                 * @attribute isEditable
                 * @type {Boolean}
                 * @readOnly
                 * @default undefined
                 */

                /**
                 * Get a combo box the content panel belongs
                 * @method getCombo
                 * @return {zebra.ui.Combo} a combo the content panel belongs
                 */
                this.getCombo = function() {
                    var p = this;
                    while((p = p.parent) && zebra.instanceOf(p, pkg.Combo) == false);
                    return p;
                };
            }
        ]);
        
        this.ComboPadPan = Class(pkg.ScrollPan, [
            function $prototype() {
                this.closeTime = 0;
            },

            function setParent(l){
                this.$super(l);
                if (l == null && this.owner) {
                    this.owner.requestFocus();
                }

                this.closeTime = l == null ? new Date().getTime() : 0;
            }
        ]);

        /**
         * Read-only content area combo box component panel class
         * @extends zebra.ui.Combo.ContentPan
         * @class  zebra.ui.Combo.ReadonlyContentPan
         */
        this.ReadonlyContentPan = Class(this.ContentPan, [
            function $prototype() {
                this.calcPreferredSize = function(l){
                    var p = this.getCombo();
                    return p ? p.list.calcMaxItemSize() : { width:0, height:0 };
                };

                this.paintOnTop = function(g){
                    var list = this.getCombo().list, 
                        selected = list.getSelected(),
                        v = selected != null ? list.provider.getView(list, selected, list.selectedIndex) : null;

                    if (v != null) {
                        var ps = v.getPreferredSize();
                        v.paint(g, this.getLeft(), this.getTop() + ~~((this.height - this.getTop() - this.getBottom() - ps.height) / 2),
                                   this.width, ps.height, this);
                    }
                };
            }
        ]);

        /**
         * Editable content area combo box component panel class
         * @class zebra.ui.Combo.EditableContentPan
         * @extends zebra.ui.Combo.ContentPan
         */
        
        /**
         * Fired when a content value has been updated. 
         
        content._.add(function(contentPan, newValue) {
            ...
        });
        
         * @param {zebra.ui.Combo.ContentPan} contentPan a content panel that 
         * updated its value
         * @param {Object} newValue a new value the content panel has been set
         * with
         * @event  contentUpdated
         */
        this.EditableContentPan = Class(this.ContentPan, [
            function $clazz() {
                this.TextField = Class(pkg.TextField, []);
            },

            function (){
                this.$super(new L.BorderLayout());
                this._ = new ContentListeners();

                this.isEditable = true;

                this.dontGenerateUpdateEvent = false;

                /**
                 * A reference to a text field component the content panel uses as a 
                 * value editor
                 * @attribute textField
                 * @readOnly
                 * @private
                 * @type {zebra.ui.TextField}
                 */
                this.textField = new pkg.Combo.EditableContentPan.TextField("",  -1);
                this.textField.view.target._.add(this);
                this.add(L.CENTER, this.textField);
            },

            function focused(){
                this.$super();
                this.textField.requestFocus();
            },

            function $prototype() {
                this.textUpdated = function(src,b,off,size,startLine,lines){
                    if (this.dontGenerateUpdateEvent === false) {
                        this._.contentUpdated(this, this.textField.getValue());
                    }
                };

                this.canHaveFocus = function() { return true; };

                /**
                 * Called when the combo box content has been updated
                 * @param {zebra.ui.Combo} combo a combo where the new value has been set
                 * @param {Object} v a new combo box value 
                 * @method updateValue
                 */
                this.updateValue = function(combo, v){
                    this.dontGenerateUpdateEvent = true;
                    try {
                        var txt = (v == null ? "" : v.toString());
                        this.textField.setValue(txt);
                        this.textField.select(0, txt.length);
                    }
                    finally {
                        this.dontGenerateUpdateEvent = false;
                    }
                };
            }
        ]);

        this.Button = Class(pkg.Button, [
            function() {
                this.setFireParams(true,  -1);
                this.setCanHaveFocus(false);
                this.$super();
            }
        ]);

        this.List = Class(pkg.List, []);
    },

    /**
     * @for zebra.ui.Combo
     */
    function $prototype() {
        this.paint = function(g){
            if (this.content != null &&
                this.selectionView != null &&
                this.hasFocus())
            {
                this.selectionView.paint(g, this.content.x, this.content.y,
                                            this.content.width, this.content.height,
                                            this);
            }
        };

        this.catchInput = function (child) {
            return child != this.button && (this.content == null || !this.content.isEditable);
        };

        this.canHaveFocus = function() {
            return this.winpad.parent == null && (this.content != null || !this.content.isEditable);
        };

        this.contentUpdated = function(src, text){
            if (src == this.content){
                try {
                    this.lockListSelEvent = true;
                    if (text == null) this.list.select(-1);
                    else {
                        var m = this.list.model;
                        for(var i = 0;i < m.count(); i++){
                            var mv = m.get(i);
                            if (mv != text){
                                this.list.select(i);
                                break;
                            }
                        }
                    }
                }
                finally { this.lockListSelEvent = false; }
                this._.fired(this, text);
            }
        };

        /**
         * Select the given value from the list as the combo box value
         * @param  {Integer} i an index of a list element to be selected 
         * as the combo box value 
         * @method select
         */
        this.select = function(i) {
            this.list.select(i);
        };

        this.setSelectedIndex = function(i) {
            this.select(i);
        };

        /**
         * Set combo box value.
         * @param {Object} v a value 
         * @method  setValue
         */
        this.setValue = function(v) {
            this.list.setValue(v);
        };

        /**
         * Get the current combo box value
         * @return {Object} a value
         * @method getValue
         */
        this.getValue = function() {
            return this.list.getValue();
        };

        this.mousePressed = function (e) {
            if (e.isActionMask() && this.content != null             &&
                (new Date().getTime() - this.winpad.closeTime) > 100 &&
                e.x > this.content.x && e.y > this.content.y         &&
                e.x < this.content.x + this.content.width            &&
                e.y < this.content.y + this.content.height              )
            {
                this.showPad();
            }
        };

        /**
         * Hide combo drop down list
         * @method hidePad 
         */
        this.hidePad = function (){
            var d = this.getCanvas();
            if (d != null && this.winpad.parent != null){
                d.getLayer(pkg.PopupLayer.ID).remove(this.winpad);
                this.requestFocus();
            }
        };

        /**
         * Show combo drop down list
         * @method showPad 
         */
        this.showPad = function(){
            var canvas = this.getCanvas();
            if (canvas != null) {
                var winlayer = canvas.getLayer(pkg.PopupLayer.ID),
                    ps       = this.winpad.getPreferredSize(),
                    p        = L.getAbsLocation(0, 0, this),
                    px       = p.x,
                    py       = p.y;

                if (this.winpad.hbar && ps.width > this.width) {
                    ps.height += this.winpad.hbar.getPreferredSize().height;
                }

                if (this.maxPadHeight > 0 && ps.height > this.maxPadHeight) {
                    ps.height = this.maxPadHeight;
                }

                if (py + this.height + ps.height > canvas.height) {
                    if (py - ps.height >= 0) py -= (ps.height + this.height);
                    else {
                        var hAbove = canvas.height - py - this.height;
                        if(py > hAbove) {
                            ps.height = py;
                            py -= (ps.height + this.height);
                        }
                        else ps.height = hAbove;
                    }
                }

                this.winpad.setSize(this.width, ps.height);
                this.winpad.setLocation(px, py + this.height);
                this.list.notifyScrollMan(this.list.selectedIndex);
                winlayer.add(this, this.winpad);
                this.list.requestFocus();
            }
        };

        /**
         * Bind the given list component to the combo box component. 
         * @param {zebra.ui.BaseList} l a list component
         * @method setList
         */
        this.setList = function(l){
            if (this.list != l){
                this.hidePad();

                if (this.list != null) this.list._.remove(this);
                this.list = l;
                if (this.list._) this.list._.add(this);
                this.winpad = new pkg.Combo.ComboPadPan(this.list);
                this.winpad.owner = this;
                if (this.content != null) {
                    this.content.updateValue(this, this.list.getSelected());
                }
                this.vrp();
            }
        };

        this.keyPressed = function (e){
            if (this.list.model != null) {
                var index = this.list.selectedIndex;
                switch(e.code) {
                    case KE.LEFT :
                    case KE.UP   : if (index > 0) this.list.select(index - 1); break;
                    case KE.DOWN :
                    case KE.RIGHT: if (this.list.model.count() - 1 > index) this.list.select(index + 1); break;
                }
            }    
        };

        this.keyTyped = function(e) { this.list.keyTyped(e); };

        /**
         * Set the given combo box selection view
         * @param {zebra.ui.View} c a view
         * @method setSelectionView
         */
        this.setSelectionView = function (c){
            if (c != this.selectionView){
                this.selectionView = pkg.$view(c);
                this.repaint();
            }
        };

        /**
         * Set the maximal height of the combo box pad element. 
         * @param {Integer} h a maximal combo box pad size
         * @method setMaxPadHeight
         */
        this.setMaxPadHeight = function(h){
            if(this.maxPadHeight != h){
                this.hidePad();
                this.maxPadHeight = h;
            }
        };
    },

    function() {
        this.$this(new pkg.Combo.List(true));
    },

    function(list){
        if (zebra.isBoolean(list)) this.$this(new pkg.Combo.List(true), list);
        else this.$this(list, false);
    },

    function(list, editable){
        /**
         * Reference to combo box list component
         * @attribute list
         * @readOnly
         * @type {zebra.ui.BaseList}
         */
        if (zebra.instanceOf(list, pkg.BaseList) === false) {
            list = new pkg.Combo.List(list, true);
        }

        /**
         * Reference to combo box button component
         * @attribute button
         * @readOnly
         * @type {zebra.ui.Panel}
         */

        /**
         * Reference to combo box content component
         * @attribute content
         * @readOnly
         * @type {zebra.ui.Panel}
         */

        /**
         * Reference to combo box pad component
         * @attribute winpad
         * @readOnly
         * @type {zebra.ui.Panel}
         */
        
        /**
         * Reference to selection view
         * @attribute selectionView
         * @readOnly
         * @type {zebra.ui.View}
         */

        this.button = this.content = this.winpad = null;
        
        /**
         * Maximal size the combo box height can have
         * @attribute maxPadHeight
         * @readOnly
         * @type {Integer}
         */
        this.maxPadHeight = 0;
        
        this.lockListSelEvent = false;
        this._ = new Listeners();
        this.setList(list);
        this.$super();

        this.add(L.CENTER, editable ? new pkg.Combo.EditableContentPan()
                                    : new pkg.Combo.ReadonlyContentPan());
        this.add(L.RIGHT, new pkg.Combo.Button());
    },

    function focused(){
        this.$super();
        this.repaint();
    },

    function kidAdded(index,s,c){
        if (zebra.instanceOf(c, pkg.Combo.ContentPan)) {
            if (this.content != null) throw new Error("Content panel is set");
            if (c._) c._.add(this);
            this.content = c;
            if (this.list != null) c.updateValue(this, this.list.getSelected());
        }

        this.$super(index, s, c);
        if (this.button == null && zebra.instanceOf(c, zebra.util.Actionable)){
            this.button = c;
            this.button._.add(this);
        }
    },

    function kidRemoved(index,l){
        if (this.content == l){
            if (l._) l._.remove(this);
            this.content = null;
        }

        this.$super(index, l);
        if(this.button == l){
            this.button._.remove(this);
            this.button = null;
        }
    },

    /**
     * Combo box button listener method. The method triggers showing 
     * combo box pad window when the combo button has been pressed
     * @param  {zebra.ui.Button} src a button that has been pressed
     * @method fired
     */
    function fired(src) {
        if ((new Date().getTime() - this.winpad.closeTime) > 100) {
            this.showPad();
        }
    },

    function fired(src, data) {
        if (this.lockListSelEvent === false){
            this.hidePad();
            if (this.content != null) {
                this.content.updateValue(this, this.list.getSelected());
                if (this.content.isEditable) {
                    pkg.focusManager.requestFocus(this.content);
                }
                this.repaint();
            }
        }
    }
]);

/**
 * Combo box arrow view. The view is used to render combo box arrow element
 * in pressed  and unpressed state.  
 * @class zebra.ui.ComboArrowView
 * @constructor
 * @param {String} [col] a color of arrow element 
 * @param {Boolean} [state] a state of arrow element. true means pressed state.
 * @extends zebra.ui.View 
 */
pkg.ComboArrowView = Class(pkg.View, [
    function $prototype() {
        this[''] = function(col, state) {
            /**
             * Arrow color 
             * @type {String}
             * @readOnly
             * @default "black"
             * @attribute color
             */

            /**
             * Arrow state to be rendered 
             * @type {Boolean}
             * @readOnly
             * @default false
             * @attribute state
             */

            /**
             * Top, left, right and bottom gap value 
             * @type {Integer}
             * @readOnly
             * @default 4
             * @attribute gap
             */

            this.color = col == null ? "black" : col;
            this.state = state == null ? false : state;
            this.gap   = 4;
        };

        this.paint = function(g, x, y, w, h, d) {
            if (this.state) {
                g.setColor("#CCCCCC");
                g.drawLine(x, y, x, y + h);
                g.setColor("gray");
                g.drawLine(x + 1, y, x + 1, y + h);
            }
            else {
                g.setColor("#CCCCCC");
                g.drawLine(x, y, x, y + h);
                g.setColor("#EEEEEE");
                g.drawLine(x + 1, y, x + 1, y + h);
            }

            x += this.gap + 1;
            y += this.gap + 1;
            w -= this.gap * 2;
            h -= this.gap * 2;

            var s = Math.min(w, h);
            x = x + (w - s)/2 + 1;
            y = y + (h - s)/2;

            g.setColor(this.color);
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x + s, y);
            g.lineTo(x + s/2, y + s);
            g.lineTo(x, y);
            g.fill();
        };

        this.getPreferredSize = function() {
            return { width: 2 * this.gap + 6, height:2 * this.gap + 6 };
        };
    }
]);

/**
 * @for
 */

})(zebra("ui"), zebra.Class);

(function(pkg, Class, Interface) {

/**
 * @module ui
 */

/**
 * Window listener interface
 * @class zebra.ui.WinListener
 * @interface
 */
pkg.WinListener = Interface();
/**
 * Fire when an UI component has been opened or closed on the given window layer 
 * @param {zebra.ui.BaseLayer} winLayer a win layer where the window component is hosted
 * @param {zebra.ui.Panel} win an UI component that is used as the window
 * @param {Boolean} status a status of the window component. true means the window component 
 * has been opened, false means the window component has been closed
 * @method winOpened
 */

/**
 * Fire when an UI component has been activated or deactivate on the given window layer 
 * @param {zebra.ui.BaseLayer} winLayer a win layer where the window component is hosted
 * @param {zebra.ui.Panel} win an UI component that is used as the window
 * @param {Boolean} status a status of the window component. true means the window component 
 * has been activated, false means the window component has been deactivated
 * @method winActivated
 */

var KE = pkg.KeyEvent, timer = zebra.util.timer, L = zebra.layout, MouseEvent = pkg.MouseEvent,
    WIN_OPENED = 1, WIN_CLOSED = 2, WIN_ACTIVATED = 3, WIN_DEACTIVATED = 4, VIS_PART_SIZE = 30,
    WinListeners = zebra.util.Listeners.Class("winOpened", "winActivated");

pkg.showModalWindow = function(context, win, listener) {
    pkg.showWindow(context, "modal", win, listener);
};

/**
 * Show the given UI component as a window 
 * @param  {zebra.ui.Panel} context  an UI component of zebra hierarchy  
 * @param  {String} type a type of the window: "modal", "mdi", "info"
 * @param  {zebra.ui.Panel} win a component to be shown as the window
 * @param  {zebra.ui.WinListener} [listener] a window listener 
 * @for  zebra.ui.showWindow()
 * @method showWindow
 */
pkg.showWindow = function(context, type, win, listener) {
    if (arguments.length < 3) {
        win = type;
        type = "info";
    }
    return context.getCanvas().getLayer("win").addWin(type, win, listener);
};

pkg.hideWindow = function(win) {
    if (win.parent && win.parent.indexOf(win) >=0) {
        win.parent.remove(win);
    }
};

/**
 * Window layer class. Window layer is supposed to be used for showing
 * modal and none modal internal window. There are special ready to use 
 * "zebra.ui.Window" UI component that can be shown as internal window, but
 * zebra allows developers to show any UI component as modal or none modal 
 * window. Add an UI component to window layer to show it as modal o none 
 * modal window:
 
        // create canvas
        var canvas   = new zebra.ui.zCanvas();
       
        // get windows layer 
        var winLayer = canvas.getLayer(zebra.ui.WinLayer.ID);

        // create standard UI window component 
        var win = new zebra.ui.Window();
        win.setBounds(10,10,200,200);

        // show the created window as modal window
        winLayer.addWin("modal", win);

 * Also shortcut method can be used
 
        // create canvas
        var canvas   = new zebra.ui.zCanvas();

        // create standard UI window component 
        var win = new zebra.ui.Window();
        win.setBounds(10,10,200,200);

        // show the created window as modal window
        zebra.ui.showModalWindow(canvas, win);

 * Window layer supports three types of windows:
 
    - **"modal"** a modal window catches all input till it will be closed 
    - **"mdi"** a MDI window can get focus, but it doesn't block switching 
    focus to other UI elements
    - **"info"** an INFO window cannot get focus. It is supposed to show 
    some information like tooltip.

 * @class zebra.ui.WinLayer
 * @constructor
 * @extends {zebra.ui.BaseLayer}
 */
pkg.WinLayer = Class(pkg.BaseLayer, pkg.ChildrenListener, [
    function $clazz() {
        this.ID = "win";
   
        this.activate = function(c) {
            c.getCanvas().getLayer("win").activate(c);
        };
    },

    function $prototype() {
        this.isLayerActive  = function() {
            return this.activeWin != null;
        };

        this.layerMousePressed = function(x,y,mask){
            var cnt = this.kids.length;
            if (cnt > 0) {
                if (this.activeWin != null && this.indexOf(this.activeWin) == cnt - 1) {
                    var x1 = this.activeWin.x,
                        y1 = this.activeWin.y,
                        x2 = x1 + this.activeWin.width,
                        y2 = y1 + this.activeWin.height;

                    if (x >= x1 && y >= y1 && x < x2 && y < y2) {
                        return;
                    }
                }

                for(var i = cnt - 1; i >= 0 && i >= this.topModalIndex; i--){
                    var d = this.kids[i];
                    if (d.isVisible && d.isEnabled && this.winType(d) != "info" &&
                        x >= d.x && y >= d.y && x < d.x + d.width && y < d.y + d.height)
                    {
                        this.activate(d);
                        return;
                    }
                }

                if (this.topModalIndex < 0 && this.activeWin != null) {
                    this.activate(null);
                }
            }
        };

        this.layerKeyPressed = function(keyCode,mask){
            if (this.kids.length > 0    &&
                keyCode == KE.TAB       &&
                (mask & KE.M_SHIFT) > 0   )
            {
                if (this.activeWin == null) {
                    this.activate(this.kids[this.kids.length - 1]);
                }
                else {
                    var winIndex = this.winsStack.indexOf(this.activeWin) - 1;
                    if (winIndex < this.topModalIndex || winIndex < 0) {
                        winIndex = this.winsStack.length - 1;
                    }
                    this.activate(this.winsStack[winIndex]);
                }
            }
        };

        this.childInputEvent = function (e) {
            if (e.ID == pkg.InputEvent.FOCUS_GAINED) {
                this.activate(L.getDirectChild(this, e.source));           
            }
        };

        this.getComponentAt = function(x,y){
            return (this.activeWin == null) ? null
                                            : this.activeWin.getComponentAt(x - this.activeWin.x,
                                                                            y - this.activeWin.y);
        };

        this.getFocusRoot = function() {
            return this.activeWin;
        };

        this.winType = function(w) {
            return this.winsInfo[w][1];
        };

        /**
         * Activate the given win layer children component window. 
         * @param  {zebra.ui.Panel} c a component to be activated as window
         * @method activate
         */
        this.activate = function(c){
            if (c != null && (this.winsInfo.hasOwnProperty(c) === false ||
                              this.winType(c) == "info"))
            {
                throw new Error();
            }

            if (c != this.activeWin) {
                var old = this.activeWin;
                if (c == null) {
                    if (this.winType(this.activeWin) == "modal") {
                        throw new Error();
                    }

                    this.activeWin = null;
                    this.fire(WIN_DEACTIVATED, old);
                    pkg.focusManager.requestFocus(null);
                }
                else {
                    if (this.winsStack.indexOf(c) < this.topModalIndex) {
                        throw new Error();
                    }

                    this.activeWin = c;
                    this.activeWin.toFront();

                    if (old != null) {
                        this.fire(WIN_DEACTIVATED, old);
                    }

                    this.fire(WIN_ACTIVATED, this.activeWin);
                    this.activeWin.validate();
                    pkg.focusManager.requestFocus(pkg.focusManager.findFocusable(this.activeWin));
                }
            }
        };

        this.fire = function(id, win, l) {
            if (arguments.length < 3) {
                l = this.winsInfo[win][2];
            }

            var b = (id == WIN_OPENED || id == WIN_ACTIVATED),
                n = (id == WIN_OPENED || id == WIN_CLOSED) ? "winOpened"
                                                           : "winActivated";

            this._[n](this, win, b);
            if (zebra.instanceOf(win, pkg.WinListener) && win[n] != null) {
                win[n].apply(win, [this, win, b]);
            }

            if (l != null && l[n] != null) {
                l[n].apply(l, [this, win, b]);
            }
        };

        /**
         * Add the given window with the given type and the listener to the layer.  
         * @param {String} type   a type of the window: "modal", 
         * "mdi" or "info"
         * @param {zebra.ui.Panel} win an UI component to be shown as window
         * @param {zebra.ui.WinListener} [listener] an optional the window listener 
         * @method addWin 
         */
        this.addWin = function(type, win, listener) {
            this.winsInfo[win] = [ this.activeWin, type, listener ];
            this.add(win);
        };
    },

    function () {
        /**
         * Currently activated as a window children component
         * @attribute activeWin
         * @type {zebra.ui.Panel}
         * @readOnly
         * @protected
         */
        this.activeWin = null;
        this.topModalIndex = -1;
        this.winsInfo  = {};
        this.winsStack = [];
        this._ = new WinListeners();
        this.$super(pkg.WinLayer.ID);
    },

    function insert(index, constr, lw) {
        var info = this.winsInfo[lw];
        if (typeof info === 'undefined') {
            info = [this.activeWin, "mdi", null];
            this.winsInfo[lw] = info;
        }
        if (info[1] != "mdi" && info[1] != "modal" && info[1] != "info") {
            throw new Error("Invalid window type: " + info[1]);
        }
        return this.$super(index, constr, lw);
    },

    function kidAdded(index,constr,lw){
        this.$super(index, constr, lw);
        var info = this.winsInfo[lw];
        this.winsStack.push(lw);
        if (info[1] == "modal") {
            this.topModalIndex = this.winsStack.length - 1;
        }
        this.fire(WIN_OPENED, lw);
        if (info[1] == "modal") this.activate(lw);
    },

    function kidRemoved(index,lw){
        this.$super(this.kidRemoved,index, lw);
        if (this.activeWin == lw){
            this.activeWin = null;
            pkg.focusManager.requestFocus(null);
        }
        var ci = this.winsStack.indexOf(lw), l = this.winsInfo[lw][2];
        delete this.winsInfo[lw];
        this.winsStack.splice(this.winsStack.indexOf(lw), 1);
        if (ci < this.topModalIndex) this.topModalIndex--;
        else {
            if (this.topModalIndex == ci){
                for(this.topModalIndex = this.kids.length - 1;this.topModalIndex >= 0; this.topModalIndex--){
                    if (this.winType(this.winsStack[this.topModalIndex]) == "modal") break;
                }
            }
        }

        this.fire(WIN_CLOSED, lw, l);
        if(this.topModalIndex >= 0){
            var aindex = this.winsStack.length - 1;
            while(this.winType(this.winsStack[aindex]) == "info") aindex--;
            this.activate(this.winsStack[aindex]);
        }
    }
]);

// !!!!!
// this code can be generalized to other cases and UI components
// !!!!!
var $StatePan = Class(pkg.Panel, [
    function $prototype() {
        this.setState = function(s) {
            if (this.state != s) {
                var old = this.state;
                this.state = s;
                this.updateState(old, s);
            }
        };

        this.updateState = function(olds, news) {
            var b = false;
            if (this.bg && this.bg.activate)  b = this.bg.activate(news);
            if (this.border && this.border.activate) b = this.border.activate(news) || b;
            if (b) this.repaint();
        };
    },

    function() {
        this.state = "inactive";
        this.$super();
    },

    function setBorder(v) {
        this.$super(v);
        this.updateState(this.state, this.state);
    },

    function setBackground(v) {
        this.$super(v);
        this.updateState(this.state, this.state);
    }
]);

/**
 * Window UI component class. Implements window like UI component.
 * The window component has a header, status bar and content areas. The header component  
 * is usually placed at the top of window, the status bar component is placed at the bottom and
 * the content component at places the central part of the window. Also the window defines 
 * corner UI component that is supposed to be used to resize the window. The window implementation 
 * provides the following possibilities: 
 
    - Move window by dragging the window on its header 
    - Resize window by dragging the window corner element
    - Place buttons in the header to maximize, minimize, close, etc the window
    - Indicates state of window (active or inactive) by changing 
    the widow header style 
    - Define a window icon component
    - Define a window status bar component

 * @class zebra.ui.Window
 * @extends {zebra.ui.Panel}
 */
pkg.Window = Class($StatePan, pkg.WinListener, pkg.MouseListener,
                   pkg.Composite, pkg.ExternalEditor, [

    function $prototype() {
        var MOVE_ACTION = 1, SIZE_ACTION = 2;

        /**
         * Minimal possible size of the window
         * @default 40
         * @attribute minSize
         * @type {Integer}
         */
        this.minSize = 40;

        /**
         * Indicate if the window can be resized by dragging its by corner 
         * @attribute isSizeable
         * @type {Boolean}
         * @default true
         * @readOnly
         */
        this.isSizeable = true;

        this.mouseDragStarted = function(e){
            this.px = e.x;
            this.py = e.y;
            this.psw = this.width;
            this.psh = this.height;
            this.action = this.insideCorner(this.px, this.py) ? (this.isSizeable ? SIZE_ACTION : -1)
                                                              : MOVE_ACTION;
            if (this.action > 0) this.dy = this.dx = 0;
        };

        this.mouseDragged = function(e){
            if (this.action > 0){
                if (this.action != MOVE_ACTION){
                    var nw = this.psw + this.dx, nh = this.psh + this.dy;
                    if (nw > this.minSize && nh > this.minSize) {
                        this.setSize(nw, nh);
                    }
                }
                this.dx = (e.x - this.px);
                this.dy = (e.y - this.py);
                if (this.action == MOVE_ACTION){
                    this.invalidate();
                    this.setLocation(this.x + this.dx, this.y + this.dy);
                }
            }
        };

        this.mouseDragEnded = function(e){
            if (this.action > 0){
                if (this.action == MOVE_ACTION){
                    this.invalidate();
                    this.setLocation(this.x + this.dx, this.y + this.dy);
                }
                this.action = -1;
            }
        };

        /**
         * Test if the mouse cursor is inside the window corner component
         * @protected 
         * @param  {Integer} px a x coordinate of the mouse cursor 
         * @param  {Integer} py a y coordinate of the mouse cursor 
         * @return {[type]}  true if the mouse cursor is inside window 
         * corner component
         * @method insideCorner
         */
        this.insideCorner = function(px,py){
            return this.getComponentAt(px, py) == this.sizer;
        };

        this.getCursorType = function(target,x,y){
            return (this.isSizeable && this.insideCorner(x, y)) ? pkg.Cursor.SE_RESIZE : -1;
        };

        this.catchInput = function(c){
            var tp = this.caption;
            return c == tp || (L.isAncestorOf(tp, c)          &&
                   zebra.instanceOf(c, pkg.Button) === false) ||
                   this.sizer == c;
        };

        this.winOpened = function(winLayer,target,b) {
            var state = b?"active":"inactive";
            if (this.caption != null && this.caption.setState) {
                this.caption.setState(state);
            }
            this.setState(state);
        };

        this.winActivated = function(winLayer, target,b){
            this.winOpened(winLayer, target,b);
        };

        this.mouseClicked= function (e){
            var x = e.x, y = e.y, cc = this.caption;
            if (e.clicks == 2 && this.isSizeable && x > cc.x &&
                x < cc.y + cc.width && y > cc.y && y < cc.y + cc.height)
            {
                if (this.prevW < 0) this.maximize();
                else this.restore();
            }
        };

        this.isMaximized = function() {
            return this.prevW != -1;
        };

        this.createCaptionPan = function() {
            var clazz = this.getClazz();
            clazz = clazz.CaptionPan ? clazz.CaptionPan : pkg.Window.CaptionPan;
            return new clazz();
        };

        this.createContentPan = function() {
            var clazz = this.getClazz();
            clazz = clazz.ContentPan ? clazz.ContentPan : pkg.Window.ContentPan;
            return new clazz();
        };

        this.createTitle = function() {
            var clazz = this.getClazz();
            clazz = clazz.TitleLab ? clazz.TitleLab : pkg.Window.TitleLab;
            return new clazz();
        };

        this.setIcon = function(i, icon) {
            if (zebra.isString(icon) || zebra.instanceOf(icon, pkg.Picture)) {
                icon = new pkg.ImagePan(icon);
            }

            this.icons.set(i, icon);
        };
    },

    function $clazz() {
        this.CaptionPan = Class($StatePan, []);
        this.TitleLab   = Class(pkg.Label, []);
        this.StatusPan  = Class(pkg.Panel, []);
        this.ContentPan = Class(pkg.Panel, []);
        this.SizerIcon  = Class(pkg.ImagePan, []);
        this.Icon       = Class(pkg.ImagePan, []);
        this.Button     = Class(pkg.Button, []);
    },

    function () {
        this.$this("");
    },

    function (s){
        //!!! for some reason state has to be set beforehand
        this.state = "inactive";

        this.prevH = this.prevX = this.prevY = this.psw = 0;
        this.psh = this.px = this.py = this.dx = this.dy = 0;
        this.prevW = this.action = -1;

        /**
         * Root window panel. The root panel has to be used to 
         * add any UI components
         * @attribute root
         * @type {zebra.ui.Panel}
         * @readOnly
         */
        this.root = this.createContentPan();

        /**
         * Window caption panel. The panel contains window 
         * icons, button and title label
         * @attribute caption
         * @type {zebra.ui.Panel}
         * @readOnly
         */
        this.caption = this.createCaptionPan();
        
        /**
         * Window title component 
         * @type {zebra.ui.Panel}
         * @attribute title
         * @readOnly
         */
        this.title = this.createTitle();
        this.title.setValue(s);

        /**
         * Icons panel. The panel can contain number of icons. 
         * @type {zebra.ui.Panel}
         * @attribute icons
         * @readOnly
         */
        this.icons = new pkg.Panel(new L.FlowLayout(L.LEFT, L.CENTER, L.HORIZONTAL, 2));
        this.icons.add(new pkg.Window.Icon());

        /**
         * Window buttons panel. The panel can contain number of window buttons 
         * @type {zebra.ui.Panel}
         * @attribute buttons
         * @readOnly
         */
        this.buttons = new pkg.Panel(new L.FlowLayout(L.CENTER, L.CENTER));

        this.caption.add(L.CENTER, this.title);
        this.caption.add(L.LEFT, this.icons);
        this.caption.add(L.RIGHT, this.buttons);

        /**
         * Window status panel. 
         * @attribute status
         * @readOnly
         * @type {zebra.ui.Panel}
         */
        this.status = new pkg.Window.StatusPan();
        this.sizer  = new pkg.Window.SizerIcon();
        this.status.add(this.sizer);

        this.setSizeable(true);

        this.$super(new L.BorderLayout(2,2));

        this.add(L.CENTER, this.root);
        this.add(L.TOP, this.caption);
        this.add(L.BOTTOM, this.status);
    },

    function fired(src) {
        this.parent.remove(this);
    },

    function focused(){
        this.$super();
        if (this.caption != null) {
            this.caption.repaint();
        }
    },

    /**
     * Make the window sizeable or not sizeable
     * @param {Boolean} b a sizeable state of the window
     * @method setSizeable
     */
    function setSizeable(b){
        if (this.isSizeable != b){
            this.isSizeable = b;
            if (this.sizer != null) {
                this.sizer.setVisible(b);
            }
        }
    },

    /**
     * Maximize the window
     * @method maximize 
     */
    function maximize(){
        if(this.prevW < 0){
            var d    = this.getCanvas(),
                left = d.getLeft(),
                top  = d.getTop();

            this.prevX = this.x;
            this.prevY = this.y;
            this.prevW = this.width;
            this.prevH = this.height;
            this.setLocation(left, top);
            this.setSize(d.width - left - d.getRight(),
                         d.height - top - d.getBottom());
        }
    },

    /**
     * Restore the window size
     * @method restore
     */
    function restore(){
        if (this.prevW >= 0){
            this.setLocation(this.prevX, this.prevY);
            this.setSize(this.prevW, this.prevH);
            this.prevW = -1;
        }
    },

    /**
     * Close the window
     * @method close
     */
    function close() {
        if (this.parent) this.parent.remove(this);
    },

    /**
     * Set the window buttons set.
     * @param {Object} buttons dictionary of buttons icons for window buttons. 
     * The dictionary key defines a method of the window component to be called 
     * when the given button has been pressed. So the method has to be defined
     * in the window component.
     * @method setButtons
     */
    function setButtons(buttons) {
        // remove previously added buttons
        for(var i=0; i< this.buttons.length; i++) {
            var kid = this.buttons.kids[i];
            if (kid._) kid._.removeAll();
        }
        this.buttons.removeAll();

        // add new buttons set
        for(var k in buttons) {
            if (buttons.hasOwnProperty(k)) {
                var b = new pkg.Window.Button(), bv = buttons[k];
                b.setView(bv);
                this.buttons.add(b);
                (function(t, f) {
                    b._.add(function() { f.call(t); });
                })(this, this[k]);
            }
        }
    }
]);

/**
 * Menu UI component class. The class implements popup menu UI component. 
 * 
 * @class zebra.ui.Menu
 * @constructor
 * @param {Object} [list] use special notation to define a menu
 
        {
            'Menu Item 1': null,   // menu item 1 without a sub menu
            'Menu Item 2': null,   // menu item 2 without a sub menu
            '-':null,              // decorative line element 
            'Menu Item 3': {       // menu item 3 with a sub menu defined
                "[x] Checkable menu item":null, // checkable menu item
                "Sub item 1":null
            }
        }


 * @extends {zebra.ui.CompList}
 */
pkg.Menu = Class(pkg.CompList, pkg.ChildrenListener, [
    function $prototype() {
        /**
         * Test if the given menu item is a decorative (not selectable) menu item 
         * @param  {Integer}  index a menu item index
         * @return {Boolean}  true if the given menu item is decorative 
         * @method isDecorative
         */
        this.isDecorative = function(index){
            return zebra.instanceOf(this.kids[index], pkg.Menu.ItemPan) === false;
        };

        this.canHaveFocus = function() {
            return true;
        };

        this.childCompEvent = function(id, src, p1, p2){
            if (id == pkg.ComponentListener.SHOWN ||
                id == pkg.ComponentListener.ENABLED)
            {
                for(var i = 0;i < this.kids.length; i++){
                    if (this.kids[i].content == src) {
                        var ccc = this.kids[i];
                        ccc.setVisible(src.isVisible);
                        ccc.setEnabled(src.isEnabled);
                        if (i > 0 && this.isDecorative(i - 1)) {
                            this.kids[i - 1].setVisible(src.isVisible);
                        }
                        break;
                    }
                }
            }
        };

        this.hasVisibleItems = function(){
            for(var i = 0;i < this.kids.length; i++) {
                if (this.kids[i].isVisible) return true;
            }
            return false;
        };

        this.update = function (g){
            if (this.views["marker"] != null && this.hasFocus()){
                var gap = this.getItemGap(), offset = this.position.offset;
                if (offset >= 0 && !this.isDecorative(offset)){
                    var is = this.getItemSize(offset), l = this.getItemLocation(offset);
                    this.views["marker"].paint(g, l.x - gap,
                                                  l.y - gap,
                                                  is.width  + 2 * gap,
                                                  is.height + 2 * gap, this);
                }
            }
        };

        this.mouseExited = function(e){
            var offset = this.position.offset;
            if (offset >= 0 && this.getMenuAt(offset) == null) {
                this.position.clearPos();
            }
        };

        this.drawPosMarker = function(g,x,y,w,h){};

        this.keyPressed = function(e){
            var position = this.position;

            if (position.metrics.getMaxOffset() >= 0){
                var code = e.code, offset = position.offset;
                if (code == KE.DOWN) {
                    var ccc = this.kids.length;
                    do { offset = (offset + 1) % ccc; }
                    while(this.isDecorative(offset));
                    position.setOffset(offset);
                }
                else {
                    if (code == KE.UP) {
                        var ccc = this.kids.length;
                        do { offset = (ccc + offset - 1) % ccc; }
                        while(this.isDecorative(offset));
                        position.setOffset(offset);
                    }
                    else {
                        if (e.code == KE.ENTER || e.code == KE.SPACE) {
                            this.select(offset);
                        }
                    }
                }
            }
        };

        /**
         * Get a sub menu for the given menu item 
         * @param  {Integer} index a menu item index
         * @return {zebra.ui.Menu} a sub menu or null if no sub menu 
         * is defined for the given menu item 
         * @method getMenuAt
         */
        this.getMenuAt = function(index){
            return this.menus[this.kids[index]];
        };

        /**
         * Set the given menu as a sub-menu for the specified menu item
         * @param {Inetger} i an index of a menu item for that a sub menu 
         * has to be attached
         * @param {zebra.ui.Menu} m a sub menu to be attached
         * @method setMenuAt
         */
        this.setMenuAt = function (i, m){
            if (m == this || this.isDecorative(i)) {
                throw new Error();
            }

            var p = this.kids[i], sub = this.menus[p];
            this.menus[p] = m;

            if (m != null) {
                if (sub == null) {
                    p.set(L.RIGHT, new pkg.Menu.SubImage());
                }
            }
            else {
                if (sub != null) p.set(L.RIGHT, null);
            }
        };
    },

    function $clazz() {
        this.Label = Class(pkg.Label, []);
        this.CheckStatePan = Class(pkg.ViewPan, []);

        this.ItemPan = Class(pkg.Panel, [
            function $prototype() {
                this.gap = 8;

                this.selected = function() {
                    if (this.content.setState) {
                        this.content.setState(!this.content.getState());
                    }
                };

                this.calcPreferredSize = function (target){
                    var cc = 0, pw = 0, ph = 0;

                    for(var i=0; i < target.kids.length; i++) {
                        var k = target.kids[i];
                        if (k.isVisible) {
                            var ps = k.getPreferredSize();
                            pw += ps.width + (cc > 0 ? this.gap : 0);
                            if (ps.height > ph) ph = ps.height;
                            cc ++;
                        }
                    }

                    return { width:pw, height:ph };
                };

                this.doLayout = function(target){
                    var mw = -1;

                    // calculate icons area maximal width
                    for(var i=0; i < target.parent.kids.length; i++) {
                        var k = target.parent.kids[i];
                        if (k.isVisible && zebra.instanceOf(k, pkg.Menu.ItemPan)) {
                            var l = k.getByConstraints(L.LEFT);
                            if (l && l.isVisible) {
                                var ps = l.getPreferredSize();
                                if (ps.width > mw) mw = ps.width;
                            }
                        }
                    }

                    var left    = target.getByConstraints(L.LEFT),
                        right   = target.getByConstraints(L.RIGHT),
                        content = target.getByConstraints(L.CENTER),
                        t       = target.getTop(),
                        eh      = target.height - t - target.getBottom();

                    if (left && left.isVisible) {
                        left.toPreferredSize();
                        left.setLocation(this.getLeft(), t + (eh - left.height)/2);
                    }

                    if (content && content.isVisible) {
                        content.toPreferredSize();
                        content.setLocation(target.getLeft() + (mw >= 0 ? mw + this.gap : 0),
                                            t + (eh - content.height)/2);
                    }

                    if (right && right.isVisible) {
                        right.toPreferredSize();
                        right.setLocation(target.width - target.getLeft() - right.width,
                                          t + (eh - right.height)/2);
                    }
                };
            },

            function (c) {
                this.$super();
                this.content = c;
                this.add(L.CENTER, c);
                this.setEnabled(c.isEnabled);
                this.setVisible(c.isVisible);
            }
        ]);

        this.ChItemPan = Class(this.ItemPan, [
            function (c, state) {
                this.$super(c);
                this.add(L.LEFT, new pkg.Menu.CheckStatePan());
                this.state = state;
            },

            function selected() {
                this.$super();
                this.state = !this.state;
                this.getByConstraints(L.LEFT).view.activate(this.state ? "on" : "off");
            }
        ]);

        this.Line     = Class(pkg.Line,     []);
        this.SubImage = Class(pkg.ImagePan, []);
    },

    function (){
        this.menus = {};
        this.$super(true);
    },

    function (d){
        this.$this();
        for(var k in d) {
            if (d.hasOwnProperty(k)) {
                this.add(k);
                if (d[k]) {
                    this.setMenuAt(this.kids.length-1, new pkg.Menu(d[k]));
                }
            }
        }
    },

    function insert(i, ctr, c) {
        if (zebra.isString(c)) {
            if (c == '-') {
                return this.$super(i, ctr, new pkg.Menu.Line());
            }
            else {
                var m = c.match(/(\[\s*\]|\[x\]|\(x\)|\(\s*\))?\s*(.*)/);
                if (m != null && m[1] != null) {
                    return this.$super(i, ctr,
                                       new pkg.Menu.ChItemPan(new pkg.Menu.Label(m[2]),
                                                              m[1].indexOf('x') > 0));
                }
                c = new pkg.Menu.Label(c);
            }
        }
        return this.$super(i, ctr, new pkg.Menu.ItemPan(c));
    },

    /**
     * Add the specified component as a decorative item of the menu
     * @param {zebra.ui.Panel} c an UI component 
     * @method addDecorative
     */
    function addDecorative(c) {
        this.$super(this.insert, this.kids.length, null, c);
    },

    function kidRemoved(i,c){
        this.setMenuAt(i, null);
        this.$super(i, c);
    },

    function posChanged(target,prevOffset,prevLine,prevCol){
        var off = this.position.offset;
        if (off < 0 || (this.kids.length > 0 && this.kids[off].isVisible)){
            this.$super(target, prevOffset, prevLine, prevCol);
        }
        else {
            var d = (prevOffset < off) ? 1 : -1, cc = this.kids.length, ccc = cc;
            for(; cc > 0 && (this.kids[off].isVisible === false || this.isDecorative(off)); cc--){
                off += d;
                if (off < 0) off = ccc - 1;
                if (off >= ccc) off = 0;
            }

            if (cc > 0){
                this.position.setOffset(off);
                this.repaint();
            }
        }
    },

    function select(i) {
        if (i < 0 || this.isDecorative(i) === false) {
            if (i >= 0) {
                if (this.kids[i].content.isEnabled === false) {
                    return;
                }
                this.kids[i].selected();
            }
            this.$super(i);
        }
    }
]);

/**
 * Menu bar UI component class. Menu bar can be build in any part of UI application.
 * There is no restriction regarding the placement of the component. 

        var canvas = new zebra.ui.zCanvas(300,200);
        canvas.setLayout(new zebra.layout.BorderLayout());

        var mbar = new zebra.ui.Menubar({
            "Item 1": {
                "Subitem 1.1":null,
                "Subitem 1.2":null,
                "Subitem 1.3":null
            },
            "Item 2": {
                "Subitem 2.1":null,
                "Subitem 2.2":null,
                "Subitem 2.3":null
            },
            "Item 3": null
        });

        canvas.root.add(zebra.layout.BOTTOM, mbar);

 * @class zebra.ui.Menubar
 * @constructor
 * @extends {zebra.ui.Panel}
 */
pkg.Menubar = Class(pkg.Panel, pkg.ChildrenListener, pkg.KeyListener, [
    function $prototype() {
        this.childInputEvent = function(e){
            var target = L.getDirectChild(this, e.source);
            switch(e.ID)
            {
                case MouseEvent.ENTERED:
                    if (this.over != target){
                        var prev = this.over;
                        this.over = target;
                        if (this.selected != null) this.$select(this.over);
                        else this.repaint2(prev, this.over);
                    }
                    break;
                case MouseEvent.EXITED:
                    var p = L.getRelLocation(e.absX, e.absY,
                                             this.getCanvas(), this.over);
                    if (p[0] < 0 || p[1] < 0 ||
                        p[0] >= this.over.width || p[1] >= this.over.height)
                    {
                        var prev = this.over;
                        this.over = null;
                        if (this.selected == null) this.repaint2(prev, this.over);
                    }
                    break;
                case MouseEvent.CLICKED:
                    this.over = target;
                    this.$select(this.selected == target ? null : target);
                    break;
            }
        };

        this.activated = function(b) {
            if (b === false) this.$select(null);
        };

        this.$select = function(b){
            if(this.selected != b){
                var prev = this.selected, d = this.getCanvas();
                this.selected = b;
                if (d != null) {
                    var pop = d.getLayer(pkg.PopupLayer.ID);
                    pop.removeAll();
                    if (this.selected != null) {
                        pop.setMenubar(this);
                        var menu = this.getMenu(this.selected);
                        if (menu != null && menu.hasVisibleItems()) {
                            var abs = L.getAbsLocation(0,0,this.selected);
                            menu.setLocation(abs.x, abs.y + this.selected.height + 1);
                            pop.add(menu);
                        }
                    }
                    else pop.setMenubar(null);
                }
                this.repaint2(prev, this.selected);
            }
        };

        this.repaint2 = function(i1,i2){
            if (i1 != null) i1.repaint();
            if (i2 != null) i2.repaint();
        };

        this.paint = function(g){
            if (this.views) {
                var target = (this.selected != null) ? this.selected 
                                                     : this.over;
                if (target != null) {
                    var v = (this.selected != null) ? this.views["on"] 
                                                    : this.views["off"];
                    if (v != null) {
                        v.paint(g, target.x, target.y,
                                   target.width, target.height,
                                   this);
                    }
                }
            }
        };

        this.keyPressed = function(e){
            if (this.selected != null) {
                var idx = this.indexOf(this.selected), pidx = idx, c = null;
                if (e.code == KE.LEFT){
                    var ccc = this.kids.length;
                    do {
                        idx = (ccc + idx - 1) % ccc;
                        c = this.kids[idx];
                    }
                    while (c.isEnabled === false || c.isVisible === false);
                }
                else {
                    if (e.code == KE.RIGHT){
                        var ccc = this.kids.length;
                        do {
                            idx = (idx + 1) % ccc;
                            c = this.kids[idx];
                        }
                        while (c.isEnabled === false || c.isVisible === false);
                    }
                }
                if (idx != pidx) this.$select(this.kids[idx]);
            }
        };

        /**
         * Add a new item to the menu bar component and binds the given menu 
         * to it.
         * @param {zebra.ui.Panel|String} c an item title that can be passed as 
         * an UI component or a string.
         * @param {zebra.ui.Menu} m a menu
         * @method addMenu
         */
        this.addMenu = function(c, m){
            this.add(c);
            this.setMenuAt(this.kids.length - 1, m);
        };

        /**
         * Bind the specified menu to the given item of the menu bar
         * @param {Integer} i an index of a menu bar item
         * @param {zebra.ui.Menu} m a menu. Pass null as the parameter value
         * to unbind the given a menu from the given menu bar item
         * @method setMenuAt
         */
        this.setMenuAt = function(i, m){
            if (i >= this.kids.length) {
                throw new Error("Invalid kid index:" + i);
            }

            var c = this.kids[i];

            if(m == null) {
                var pm = this.menus.hasOwnProperty(c) ? this.menus[c] : null;
                if (pm != null) {
                    delete this.menus[c];
                }
            }
            else {
                this.menus[c] = m;
            }
        };

        /**
         * Get a menu component that is bound to the given menu bar item
         * @param {Integer} i an index of a menu bar item
         * @return {zebra.ui.Menu}  an UI menu component
         * @method getMenuAt 
         */
        this.getMenuAt = function(i) {
            return this.getMenu(this.kids[i]);
        };

        /**
         * Get a menu component that is bound to the given menu bar item
         * @param {zebra.ui.Panel} c a menu bar item UI component 
         * @return {zebra.ui.Menu}  an UI menu component
         * @method getMenu
         */
        this.getMenu = function(c) {
            return this.menus.hasOwnProperty(c) ? this.menus[c] : null;
        };
    },

    function $clazz() {
        this.Label = Class(pkg.Label, []);
    },

    function (){
        this.menus = {};
        this.over = this.selected = null;
        this.$super();
    },

    function (d){
        this.$this();
        for(var k in d) {
            if (d.hasOwnProperty(k)) {
                if (d[k]) this.addMenu(k, new pkg.Menu(d[k]));
                else this.add(k);
            }
        }
    },

    function insert(i, constr, c) {
        if (zebra.isString(c)) c = new pkg.Menubar.Label(c);
        this.$super(i, constr, c);
    },

    function kidRemoved(i, c){
        this.setMenuAt(i, null);
        this.$super(i);
    },

    function removeAll(){
        this.$super();
        this.menus = {};
    }
]);
pkg.Menubar.prototype.setViews = pkg.$ViewsSetter;

/**
 * UI popup layer class. Special layer implementation to show 
 * context menu. Normally the layer is not used directly.   
 * @class zebra.ui.PopupLayer
 * @constructor
 * @extends {zebra.ui.BaseLayer}
 */
pkg.PopupLayer = Class(pkg.BaseLayer, pkg.ChildrenListener, [
    function $clazz() {
        this.ID = "pop";
    },

    function $prototype() {
        this.mTop = this.mLeft = this.mBottom = this.mRight = 0;

        this.layerMousePressed = function(x,y,mask){
            if (this.isLayerActive(x, y) && this.getComponentAt(x, y) == this){
                this.removeAll();
                this.setMenubar(null);
            }
        };

        this.isLayerActive = function(x,y) {
            return this.kids.length > 0 &&
                   (   arguments.length === 0 ||
                       this.mbar == null      ||
                       y > this.mBottom       ||
                       y < this.mTop          ||
                       x < this.mLeft         ||
                       x > this.mRight        ||
                       this.getComponentAt(x, y) != this );
        };

        this.childInputEvent = function(e){
            if(e.UID == pkg.InputEvent.KEY_UID){
                if (e.ID == KE.PRESSED && e.code == KE.ESCAPE){
                    this.remove(L.getDirectChild(this, e.source));
                    if (this.kids === 0) this.setMenubar(null);
                }

                if (zebra.instanceOf(this.mbar, pkg.KeyListener)) {
                    pkg.events.performInput(new KE(this.mbar, e.ID, e.code, e.ch, e.mask));
                }
            }
        };

        this.calcPreferredSize = function (target){
            return { width:0, height:0 };
        };

        this.setMenubar = function(mb){
            if(this.mbar != mb){
                this.removeAll();
                if (this.mbar && this.mbar.activated) this.mbar.activated(false);
                this.mbar = mb;
                if (this.mbar != null){
                    var abs = L.getAbsLocation(0, 0, this.mbar);
                    this.mLeft = abs.x;
                    this.mRight = this.mLeft + this.mbar.width - 1;
                    this.mTop = abs.y;
                    this.mBottom = this.mTop + this.mbar.height - 1;
                }
                if (this.mbar && this.mbar.activated) this.mbar.activated(true);
            }
        };

        this.posChanged = function (target, prevOffset, prevLine, prevCol){
            if (timer.get(this)) {
                timer.stop(this);
            }

            var selectedIndex = target.offset;
            if (selectedIndex >= 0) {
                var index = this.pcMap.indexOf(target), 
                    sub = this.kids[index].getMenuAt(selectedIndex);

                if (index + 1 < this.kids.length && sub != this.kids[index + 1]) {
                    this.removeAt(index + 1);
                }

                if (index + 1 == this.kids.length && sub != null) {
                    timer.start(this, this.showIn, this.showIn*4);
                }
            }
        };

        this.fired  = function(src,data){
            var index = (data != null) ? src.selectedIndex :  -1;
            if (index >= 0) {
                var sub = src.getMenuAt(index);
                if (sub != null) {
                    if (sub.parent == null){
                        sub.setLocation(src.x + src.width - 10, src.y + src.kids[index].y);
                        this.add(sub);
                    }
                    else {
                        pkg.focusManager.requestFocus(this.kids[this.kids.length - 1]);
                    }
                }
                else {
                    this.removeAll();
                    this.setMenubar(null);
                }
            }
            else {
                if (src.selectedIndex >= 0) {
                    var sub = src.getMenuAt(src.selectedIndex);
                    if (sub != null) {
                        this.remove(sub);
                    }
                }
            }
        };

        this.run = function(){
            timer.stop(this);
            if (this.kids.length > 0) {
                var menu = this.kids[this.kids.length - 1];
                menu.select(menu.position.offset);
            }
        };

        this.doLayout = function (target){
            var cnt = this.kids.length;
            for(var i = 0; i < cnt; i++){
                var m = this.kids[i];
                if (zebra.instanceOf(m, pkg.Menu)){
                    var ps = m.getPreferredSize(),
                        xx = (m.x + ps.width > this.width) ? this.width - ps.width : m.x,
                        yy = (m.y + ps.height > this.height) ? this.height - ps.height : m.y;
                    m.setSize(ps.width, ps.height);
                    if (xx < 0) xx = 0;
                    if (yy < 0) yy = 0;
                    m.setLocation(xx, yy);
                }
            }
        };
    },

    function (){
        this.mbar  = null;
        this.pcMap = [];
        this.showIn = 250;
        this.$super(pkg.PopupLayer.ID);
    },

    function removeAt(index){
        for(var i = this.kids.length - 1;i >= index; i--) {
            this.$super(index);
        }
    },

    function kidAdded(index,id,lw){
        this.$super(index, id, lw);
        if (zebra.instanceOf(lw, pkg.Menu)){
            lw.position.clearPos();
            lw.select(-1);
            this.pcMap.splice(index, 0, lw.position);
            lw._.add(this);
            lw.position._.add(this);
            lw.requestFocus();
        }
    },

    function kidRemoved(index,lw){
        this.$super(index, lw);
        if (zebra.instanceOf(lw, pkg.Menu)) {
            lw._.remove(this);
            lw.position._.remove(this);
            this.pcMap.splice(index, 1);
            if (this.kids.length > 0) {
                this.kids[this.kids.length - 1].select(-1);
                this.kids[this.kids.length - 1].requestFocus();
            }
        }
    }
]);

/**
 * Popup window manager class. The manager registering and triggers showing context popup menu 
 * and tooltips. Menu appearing is triggered by right mouse click or double fingers touch event.
 * To bind a popup menu to an UI component you can either set "tooltip" property of the component 
 * with a popup menu instance:
 
        // create canvas
        var canvas = new zebra.ui.zCanvas();

        // create menu with three items
        var m = new zebra.ui.Menu();
        m.add("Menu Item 1");
        m.add("Menu Item 2");
        m.add("Menu Item 3");
    
        // bind the menu to root panel
        canvas.root.popup = m;
 
 * Or implement "getPopup(target,x,y)" method that can rule showing popup menu depending on 
 * the current cursor location:

        // create canvas
        var canvas = new zebra.ui.zCanvas();

        // visualize 50x50 pixels hot spot of toot component  
        // to which the context menu is bound 
        canvas.root.paint = function(g) {
            g.setColor("red");
            g.fillRect(50,50,50,50);
        }

        // create menu with three items
        var m = new zebra.ui.Menu();
        m.add("Menu Item 1");
        m.add("Menu Item 2");
        m.add("Menu Item 3");
    
        // implement "getPopup" method that shows popup menu only 
        // if mouse cursor located at red rectangular area of the 
        // component
        canvas.getPopup = function(target, x, y) {
            // test if mouse cursor position is in red spot area
            // and return context menu if it is true 
            if (x > 50 && y > 50 && x < 100 && y <  100)  {
                return m;
            }
            return null;
        }
 
 *  Defining a tooltip for an UI component follows the same approach. Other you
 *  define set "tooltip" property of your component with a component that has to 
 *  be shown as the tooltip:
 
         // create canvas
         var canvas = new zebra.ui.zCanvas();

         // create tooltip 
         var t = new zebra.ui.Label("Tooltip");
         t.setBorder("plain");
         t.setBackground("yellow");
         t.setPadding(6);
         
         // bind the tooltip to root panel
         canvas.root.popup = t;

*  Or you can implement "getTooltip(target,x,y)" method if the tooltip showing depends on
*  the mouse cursor location:


        // create canvas
        var canvas = new zebra.ui.zCanvas();

        // create tooltip 
        var t = new zebra.ui.Label("Tooltip");
        t.setBorder("plain");
        t.setBackground("yellow");
        t.setPadding(6);

        // bind the tooltip to root panel
        canvas.root.getPopup = function(target, x, y) {
            return x < 10 && y < 10 ? t : null;
        };

 * @class zebra.ui.PopupManager
 * @extends zebra.ui.Manager
 * @constructor 
 */
pkg.PopupManager = Class(pkg.Manager, pkg.MouseListener, [
    function $clazz() {
        this.Label = Class(pkg.Label, []);

        this.createTooltip = function(text){
            var lab = new pkg.PopupManager.Label(new zebra.data.Text(text));
            lab.toPreferredSize();
            return lab;
        };
    },

    function $prototype() {
        this.mouseClicked = function (e){
            this.popupMenuX = e.absX;
            this.popupManuY = e.absY;

            if ((e.mask & MouseEvent.RIGHT_BUTTON) > 0) {
                var popup = null;

                if (e.source.popup != null) {
                    popup = e.source.popup;
                }
                else {
                    if (e.source.getPopup != null) {
                        popup = e.source.getPopup(e.source, e.x, e.y);
                    }
                }

                if (popup != null) {
                    popup.setLocation(this.popupMenuX, this.popupManuY);
                    e.source.getCanvas().getLayer(pkg.PopupLayer.ID).add(popup);
                    popup.requestFocus();
                }
            }
        };
 
        /**
         * Indicates if a shown tooltip has to disappear by mouse pressed event 
         * @attribute hideTooltipByPress
         * @type {Boolean}
         * @default true
         */
        this.hideTooltipByPress = true;

        this.mouseEntered = function(e){
            var c = e.source;
            if (c.getTooltip != null || c.tooltip != null){
                this.target = c;
                this.targetTooltipLayer = c.getCanvas().getLayer(pkg.WinLayer.ID);
                this.tooltipX = e.x;
                this.tooltipY = e.y;
                timer.start(this, this.showTooltipIn, this.showTooltipIn);
            }
        };

        this.mouseExited = function(e){
            if (this.target != null){
                timer.stop(this);
                this.target = null;
                this.hideTooltip();
            }
        };

        this.mouseMoved = function(e){
            if (this.target != null){
                timer.clear(this);
                this.tooltipX = e.x;
                this.tooltipY = e.y;
                this.hideTooltip();
            }
        };

        this.run = function(){
            if (this.tooltip == null){
                this.tooltip = this.target.tooltip != null ? this.target.tooltip
                                                           : this.target.getTooltip(this.target, this.x, this.y);

                if (this.tooltip != null) {
                    var p = L.getAbsLocation(this.tooltipX, this.tooltipY, this.target);
                    this.tooltip.toPreferredSize();
                    var tx = p.x,
                        ty = p.y - this.tooltip.height,
                        dw = this.targetTooltipLayer.width;
                    
                    if (tx + this.tooltip.width > dw) {
                        tx = dw - this.tooltip.width - 1;
                    }
                    this.tooltip.setLocation(tx < 0 ? 0 : tx, ty < 0 ? 0 : ty);
                    this.targetTooltipLayer.addWin("info", this.tooltip, null);
                }
            }
        };

        /**
         * Hide tooltip if it has been shown
         * @method hideTooltip
         */
        this.hideTooltip = function(){
            if (this.tooltip != null) {
                this.targetTooltipLayer.remove(this.tooltip);
                this.tooltip = null;
            }
        };

        this.mousePressed = function(e){
            if (this.hideTooltipByPress && this.target != null){
                timer.stop(this);
                this.target = null;
                this.hideTooltip();
            }
        };

        this.mouseReleased = function(e){
            if (this.hideTooltipByPress && this.target != null){
                this.x = e.x;
                this.y = e.y;
                timer.start(this, this.showTooltipIn, this.showTooltipIn);
            }
        };
    },

    function () {
        this.$super();
        this.popupMenuX = this.popupManuY = 0;
        this.tooltipX = this.tooltipY = 0;

        this.targetTooltipLayer = this.tooltip = this.target = null;

        /**
         * Define interval (in milliseconds) between entering a component and showing 
         * a tooltip for the entered component 
         * @attribute showTooltipIn
         * @type {Integer}
         */
        this.showTooltipIn = 400;
    }
]);

pkg.WindowTitleView = Class(pkg.View, [
    function $prototype() {
        this[''] = function(bg) {
            this.radius = 6;
            this.gap = this.radius;
            this.bg = bg ? bg : "#66CCFF";
        };

        this.paint = function(g,x,y,w,h,d) {
            this.outline(g,x,y,w,h,d);
            g.setColor(this.bg);
            g.fill();
        };

        this.outline = function (g,x,y,w,h,d) {
            g.beginPath();
            g.moveTo(x + this.radius, y);
            g.lineTo(x + w - this.radius*2, y);
            g.quadraticCurveTo(x + w, y, x + w, y + this.radius);
            g.lineTo(x + w, y + h);
            g.lineTo(x, y + h);
            g.lineTo(x, y + this.radius);
            g.quadraticCurveTo(x, y, x + this.radius, y);
            return true;
        };
    }
]);  

/**
 * @for
 */

})(zebra("ui"), zebra.Class, zebra.Interface);

(function(pkg, Class, ui) {

/**
 * The package contains number of UI components that can be helful to 
 * make visiual control of an UI component size and location
 * @module  ui.designer
 * @main 
 */

var L = zebra.layout, Cursor = ui.Cursor, KeyEvent = ui.KeyEvent, CURSORS = [];

CURSORS[L.LEFT  ] = Cursor.W_RESIZE;
CURSORS[L.RIGHT ] = Cursor.E_RESIZE;
CURSORS[L.TOP   ] = Cursor.N_RESIZE;
CURSORS[L.BOTTOM] = Cursor.S_RESIZE;
CURSORS[L.TLEFT ] = Cursor.NW_RESIZE;
CURSORS[L.TRIGHT] = Cursor.NE_RESIZE;
CURSORS[L.BLEFT ] = Cursor.SW_RESIZE;
CURSORS[L.BRIGHT] = Cursor.SE_RESIZE;
CURSORS[L.CENTER] = Cursor.MOVE;
CURSORS[L.NONE  ] = Cursor.DEFAULT;

pkg.ShaperBorder = Class(ui.View, [
    function $prototype() {
        this.color = "blue";
        this.gap = 7;

        function contains(x, y, gx, gy, ww, hh) {
            return gx <= x && (gx + ww) > x && gy <= y && (gy + hh) > y;
        }

        this.paint = function(g,x,y,w,h,d){
            var cx = ~~((w - this.gap)/2), cy = ~~((h - this.gap)/2);
            g.setColor(this.color);
            g.beginPath();
            g.rect(x, y, this.gap, this.gap);
            g.rect(x + cx, y, this.gap, this.gap);
            g.rect(x, y + cy, this.gap, this.gap);
            g.rect(x + w - this.gap, y, this.gap, this.gap);
            g.rect(x, y + h - this.gap, this.gap, this.gap);
            g.rect(x + cx, y + h - this.gap, this.gap, this.gap);
            g.rect(x + w - this.gap, y + cy, this.gap, this.gap);
            g.rect(x + w - this.gap, y + h - this.gap, this.gap, this.gap);
            g.fill();
            g.beginPath();
            g.rect(x + ~~(this.gap / 2), y + ~~(this.gap / 2), w - this.gap, h - this.gap);
            g.stroke();
        };

        this.detectAt = function(target,x,y){
            var gap = this.gap, gap2 = gap*2, w = target.width, h = target.height;

            if (contains(x, y, gap, gap, w - gap2, h - gap2)) return L.CENTER;
            if (contains(x, y, 0, 0, gap, gap))               return L.TLEFT;
            if (contains(x, y, 0, h - gap, gap, gap))         return L.BLEFT;
            if (contains(x, y, w - gap, 0, gap, gap))         return L.TRIGHT;
            if (contains(x, y, w - gap, h - gap, gap, gap))   return L.BRIGHT;

            var mx = ~~((w-gap)/2);
            if (contains(x, y, mx, 0, gap, gap))        return L.TOP;
            if (contains(x, y, mx, h - gap, gap, gap))  return L.BOTTOM;

            var my = ~~((h-gap)/2);
            if (contains(x, y, 0, my, gap, gap)) return L.LEFT;
            return contains(x, y, w - gap, my, gap, gap) ? L.RIGHT : L.NONE;
        };
    }
]);

pkg.InsetsArea = Class([
    function $prototype() {
        this.top = this.right = this.left = this.bottom = 6;

        this.detectAt = function (c,x,y){
            var t = 0, b1 = false, b2 = false;
            if (x < this.left) t += L.LEFT;
            else {
                if (x > (c.width - this.right)) t += L.RIGHT;
                else b1 = true;
            }

            if (y < this.top) t += L.TOP;
            else {
                if (y > (c.height - this.bottom)) t += L.BOTTOM;
                else b2 = true;
            }
            return b1 && b2 ? L.CENTER : t;
        };
    }
]);

/**
 * This is UI component class that implements possibility to embeds another
 * UI components to control the component size and location visually.
 
        // create canvas 
        var canvas = new zebra.ui.zCanvas(300,300);

        // create two UI components
        var lab = new zebra.ui.Label("Label");
        var but = new zebra.ui.Button("Button");

        // add created before label component as target of the shaper
        // component and than add the shaper component into root panel 
        canvas.root.add(new zebra.ui.designer.ShaperPan(lab).properties({
            bounds: [ 30,30,100,40]
        }));

        // add created before button component as target of the shaper
        // component and than add the shaper component into root panel 
        canvas.root.add(new zebra.ui.designer.ShaperPan(but).properties({
            bounds: [ 130,130,100,50]
        }));

 * @class  zebra.ui.designer.ShaperPan
 * @constructor
 * @extends {zebra.ui.Panel}
 * @param {zebra.ui.Panel} target a target UI component whose size and location
 * has to be controlled
 */
pkg.ShaperPan = Class(ui.Panel, ui.Composite, ui.KeyListener, ui.MouseListener, [
    function $prototype() {
        this.minHeight = this.minWidth = 12;
        this.isResizeEnabled = this.isMoveEnabled = true;
        this.state = null;

        this.getCursorType = function (t, x ,y) {
            return this.kids.length > 0 ? CURSORS[this.shaperBr.detectAt(t, x, y)] : -1;
        };

        this.canHaveFocus = function() { return true; };

        this.keyPressed = function(e) {
            if (this.kids.length > 0){
                var b = (e.mask & KeyEvent.M_SHIFT) > 0, c = e.code,
                    dx = (c == KeyEvent.LEFT ?  -1 : (c == KeyEvent.RIGHT ? 1 : 0)),
                    dy = (c == KeyEvent.UP   ?  -1 : (c == KeyEvent.DOWN  ? 1 : 0)),
                    w = this.width + dx, h = this.height + dy,
                    x = this.x + dx, y = this.y + dy;

                if (b) {
                    if (this.isResizeEnabled && w > this.shaperBr.gap * 2 && h > this.shaperBr.gap * 2) {
                        this.setSize(w, h);
                    }
                }
                else {
                    if (this.isMoveEnabled) {
                        var ww = this.width, hh = this.height, p = this.parent;
                        if (x + ww/2 > 0 && y + hh/2 > 0 && x < p.width - ww/2 && y < p.height - hh/2) this.setLocation(x, y);
                    }
                }
            }
        };

        this.mouseDragStarted = function(e){
            this.state = null;
            if (this.isResizeEnabled || this.isMoveEnabled) {
                var t = this.shaperBr.detectAt(this, e.x, e.y);
                if ((this.isMoveEnabled   === false && t == L.CENTER)||
                    (this.isResizeEnabled === false && t != L.CENTER)  )
                {
                    return;
                }

                this.state = { top    : ((t & L.TOP   ) > 0 ? 1 : 0),
                               left   : ((t & L.LEFT  ) > 0 ? 1 : 0),
                               right  : ((t & L.RIGHT ) > 0 ? 1 : 0),
                               bottom : ((t & L.BOTTOM) > 0 ? 1 : 0) };

                if (this.state != null) {
                    this.px = e.absX;
                    this.py = e.absY;
                }
            }
        };

        this.mouseDragged = function(e){
            if (this.state != null) {
                var dy = (e.absY - this.py), dx = (e.absX - this.px), s = this.state,
                    nw = this.width  - dx * s.left + dx * s.right,
                    nh = this.height - dy * s.top  + dy * s.bottom;

                if (nw >= this.minWidth && nh >= this.minHeight) {
                    this.px = e.absX;
                    this.py = e.absY;
                    if ((s.top + s.right + s.bottom + s.left) === 0) {
                        this.setLocation(this.x + dx, this.y + dy);
                    }
                    else {                    
                        this.setSize(nw, nh);
                        this.setLocation(this.x + dx * s.left, this.y + dy * s.top);
                    }
                }
            }
        };

        this.setColor = function (b, color) {
            this.colors[b?1:0] = color;
            this.shaperBr.color = this.colors[this.hasFocus()? 1 : 0];
            this.repaint();
        };
    },

    function (t){
        this.$super(new L.BorderLayout());
        this.px = this.py = 0;
        this.shaperBr = new pkg.ShaperBorder();
        this.colors   = [ "lightGray", "blue" ];
        this.shaperBr.color = this.colors[0];
        this.setBorder(this.shaperBr);
        if (t != null) this.add(t);
    },

    function insert(i, constr, d) {
        if (this.kids.length > 0) {
            this.removeAll();
        }

        var top = this.getTop(), left = this.getLeft();
        if (d.width === 0 || d.height === 0) d.toPreferredSize();
        this.setLocation(d.x - left, d.y - top);
        this.setSize(d.width + left + this.getRight(), d.height + top + this.getBottom());
        this.$super(i, L.CENTER, d);
    },

    function focused(){
        this.$super();
        this.shaperBr.color = this.colors[this.hasFocus()? 1 : 0];
        this.repaint();
    }
]);

pkg.FormTreeModel = Class(zebra.data.TreeModel, [
    function $prototype() {
        this.buildModel = function(comp, root){
            var b = this.exclude && this.exclude(comp), item = b ? root : this.createItem(comp);
            for(var i = 0; i < comp.kids.length; i++) {
                var r = this.buildModel(comp.kids[i], item);
                if (r) {
                    r.parent = item;
                    item.kids.push(r);
                }
            }
            return b ? null : item;
        };

        this.itemByComponent = function (c, r){
            if (r == null) r = this.root;
            if (r.comp == c) return c;
            for(var i = 0;i < r.kids.length; i++) {
                var item = this.itemByComponent(c, r.kids[i]);
                if (item != null) return item;
            }
            return null;
        };

        this.createItem = function(comp){
            var name = comp.getClazz().$name;
            if (name == null) name = comp.toString();
            var index = name.lastIndexOf('.'),
                item = new zebra.data.Item(index > 0 ? name.substring(index + 1) : name);
            item.comp = comp;
            return item;
        };
    },

    function (target){
        this.$super(this.buildModel(target, null));
    }
]);

/**
 * @for
 */


})(zebra("ui.designer"), zebra.Class, zebra("ui"));

(function(pkg, Class) {

/**
 * @module  ui
 */

/**
 * HTML element UI component wrapper class. The class represents 
 * an HTML element as if it is standard UI component. It helps to use
 * some standard HTML element as zebra UI components and embeds it 
 * in zebra UI application layout.
 * @class zebra.ui.HtmlElement
 * @constructor 
 * @param {String|HTMLElement} [element] an HTML element to be represented
 * as a standard zebra UI component. If the passed parameter is string 
 * it denotes a name of an HTML element. In this case a new HTML element 
 * will be created.  
 * @extends {zebra.ui.Panel}
 */
pkg.HtmlElement = Class(pkg.Panel, pkg.FocusListener, [
    function $prototype() {
        this.isLocAdjusted = false;
        this.canvas = null;
        this.ePsW = this.ePsH = 0;

        /**
         * Set the CSS font of the wrapped HTML element 
         * @param {String|zebra.ui.Font} f a font
         * @method setFont
         */
        this.setFont = function(f) {
            this.element.style.font = f.toString();
            this.vrp();
        };

        /**
         * Set the CSS color of the wrapped HTML element 
         * @param {String} c a color
         * @method setColor
         */
        this.setColor = function(c) {
            this.element.style.color = c.toString();
        };

        this.adjustLocation = function() {
            if (this.isLocAdjusted === false && this.canvas != null) {
                
                // hidden DOM component before move 
                // makes moving more smooth
                var visibility = this.element.style.visibility;
                this.element.style.visibility = "hidden";

                if (zebra.instanceOf( this.parent, pkg.HtmlElement)) {
                    this.element.style.top  = "" + this.y + "px";
                    this.element.style.left = "" + this.x + "px";
                }
                else {
                    var a = zebra.layout.getAbsLocation(0,0,this);
                    this.element.style.top  = "" + (this.canvas.offy + a.y) + "px";
                    this.element.style.left = "" + (this.canvas.offx + a.x) + "px";
                }
                this.isLocAdjusted = true;
                this.element.style.visibility = visibility;
            }
        };

        this.calcPreferredSize = function(target) {
            return { width: this.ePsW, height: this.ePsH };
        };

        var $store = [
            "visibility",
            "paddingTop","paddingLeft","paddingBottom","paddingRight",
            "border","borderStyle","borderWidth",
            "borderTopStyle","borderTopWidth",
            "borderBottomStyle","borderBottomWidth",
            "borderLeftStyle","borderLeftWidth",
            "borderRightStyle","borderRightWidth",
            "width", "height"
        ];

        this.recalc = function() {
            // save element metrics
            var e    = this.element,
                vars = {};
            
            for(var i=0; i<$store.length; i++) {
                var k = $store[i];
                vars[k] = e.style[k];
            }

            // force metrics to be calculated automatically 
            e.style.visibility = "hidden";
            e.style.padding = "0px";
            e.style.border  = "none";
            e.style.width   = "auto";
            e.style.height  = "auto";

            // fetch preferred size
            this.ePsW = e.offsetWidth;
            this.ePsH = e.offsetHeight;

            for(var k in vars) {
                var v = vars[k];
                if (v != null) e.style[k] = v;
            }

            this.setSize(this.width, this.height);
        };

        /**
         * Set the inner content of the wrapped HTML element 
         * @param {String} an inner content
         * @method setContent
         */
        this.setContent = function(content) {
            this.element.innerHTML = content;
            this.vrp();
        };

        /**
         * Apply the given set of CSS styles to the wrapped HTML element 
         * @param {Object} styles a dictionary of CSS styles
         * @method setStyles
         */
        this.setStyles = function(styles) {
            for(var k in styles) {
                this.setStyle(k, styles[k]);
            }
        };

        /**
         * Apply the given CSS style to the wrapped HTML element
         * @param {String} a name of the CSS style
         * @param {String} a value the CSS style has to be set
         * @method setStyle
         */
        this.setStyle = function(name, value) {
            name = name.trim();
            var i = name.indexOf(':');
            if (i > 0) {
                if (zebra[name.substring(0, i)] == null) {
                    return;
                }
                name = name.substring(i + 1);
            }
   
            this.element.style[name] = value;
            this.vrp();
        };

        /**
         * Set the specified attribute of the wrapped HTML element
         * @param {String} name  a name of attribute
         * @param {String} value a value of the attribute
         * @method setAttribute
         */
        this.setAttribute = function(name, value) {
            this.element.setAttribute(name, value);
        };


        this.isInInvisibleState = function() {
            if (this.width <= 0 || this.height <= 0 || this.getCanvas() == null) {
                return true;
            }

            var p = this.parent;
            while (p != null && p.isVisible && p.width > 0 && p.height > 0) {
                p = p.parent;
            }
            return p != null; // canvas means the component is not 
                              // in hierarchy yet, that means it 
                              // has to be hidden 
        };

        this.paint = function(g) {
            // this method is used as an indication that the component 
            // is visible and no one of his parent is invisible
            if (this.element.style.visibility == "hidden") {
                this.element.style.visibility = "visible";
            }
        };
    },

    function(e) {
        /**
         * Reference to HTML element the UI component wraps
         * @attribute element 
         * @readOnly
         * @type {HTMLElement}
         */
        e = this.element = zebra.isString(e) ? document.createElement(e) : e;
        e.setAttribute("id", this.toString());
        e.style.visibility = "hidden";  // before the component will be attached 
                                        // to parent hierarchy of components that is 
                                        // attached to a canvas the component has to be hidden  

        this.$super();

        var $this = this;

        //!!!
        // todo:
        // It is not a very good idea to register global component listener per 
        // HTML component. Has to be re-designed, but at this moment this is the 
        // only way to understand when the HTML component parent hierarchy has got 
        // visibility updates
        this.globalCompListener = new pkg.ComponentListener([
            function $prototype() {
                this.compShown = function(c) {
                    if (c != $this && c.isVisible === false && zebra.layout.isAncestorOf(c, $this)) {
                        $this.element.style.visibility = "hidden";
                    }
                };

                this.compMoved = function(c, px, py) {
                    if ($this.canvas == c) {
                        // force location adjustment when the component 
                        // parent HTML canvas has been moved 
                        $this.isLocAdjusted = false;
                        $this.adjustLocation();
                    }
                };

                this.compRemoved = function(p, c) {
                    // if an ancestor parent has been removed the HTML element 
                    // has to be hidden
                    if (c != $this && zebra.layout.isAncestorOf(c, $this)) {
                        $this.element.style.visibility = "hidden";
                    }
                };

                this.compSized = function(c, pw, ph) {
                    if (c != $this && zebra.layout.isAncestorOf(c, $this) && $this.isInInvisibleState()) {
                        $this.element.style.visibility = "hidden";
                    }
                };
            }
        ]);

        // it is important to avoid mouse event since for some html element 
        // it can cause unexpected event generation. for instance text input 
        // element can generate mouse moved on mobile devices whenever it gets 
        // focus
        if (zebra.isTouchable === false) {
            e.onmousemove = function(ee) {
                if ($this.canvas != null) {
                    $this.canvas.mouseMoved(1, {
                        target: $this.canvas.canvas,
                        pageX : ee.pageX,
                        pageY : ee.pageY
                    });
                }
            };

            e.onmousedown = function(ee) {
                if ($this.canvas != null) {
                    $this.canvas.mousePressed(1, {
                        target: $this.canvas.canvas,
                        pageX : ee.pageX,
                        pageY : ee.pageY
                    });
                }
            };

            e.onmouseup = function(ee) {
                if ($this.canvas != null) {
                    $this.canvas.mouseReleased(1, {
                        target: $this.canvas.canvas,
                        pageX : ee.pageX,
                        pageY : ee.pageY
                    },

                    ee.button === 0 ? pkg.MouseEvent.LEFT_BUTTON 
                                    : (ee.button == 2 ? pkg.MouseEvent.RIGHT_BUTTON : 0));
                }
            };
        }

        e.addEventListener("focus", function(ee) {
            // mark the element  has focus on the given canvas
            $this.element.canvas = $this.canvas;

            // notify focus manager the given component has got focus
            zebra.ui.focusManager.requestFocus($this);
        }, false);

        e.addEventListener("blur", function(ee) {
            // flush the native element canvas field to say the component doesn't 
            // have focus anymore
            $this.element.canvas = null;

            if ($this.canvas != null) {
                // run timer that checks if the native web component has lost focus because of
                // leaving the canvas where it hosts:
                //  -- the focus doesn't belong to the canvas where the native component sits 
                //    AND 
                //  -- the focus doesn't belong to another native component that sits on the 
                //     canvas  
                setTimeout(function() {
                    var fo = zebra.ui.focusManager.focusOwner;
                    if ((document.activeElement != $this.canvas.canvas) &&                    
                        (document.activeElement != null && $this.canvas != document.activeElement.canvas))
                    {
                       zebra.ui.focusManager.requestFocus(null);
                    }
                }, 100);
            }
        }, false);

        e.onkeydown = function(ee) {
            if ($this.canvas != null) {
                // store current focus owner to analyze if the event triggered focus owner changing 
                var pfo = zebra.ui.focusManager.focusOwner;

                // re-define key event since preventDefault has to be disabled, 
                // otherwise navigation key will not work 
                $this.canvas.keyPressed({
                    keyCode       : ee.keyCode,
                    target        : ee.target,
                    altKey        : ee.altKey,
                    shiftKey      : ee.shiftKey,
                    ctrlKey       : ee.ctrlKey,
                    metaKey       : ee.metaKey,
                    preventDefault: function() {}
                });

                var nfo = zebra.ui.focusManager.focusOwner;

                // if focus owner has been updated
                if (nfo != pfo) {
                    ee.preventDefault();
                    // if focus owner has been moved to another HTML component we have to pass focus to it
                    if (nfo != null && zebra.instanceOf(nfo, pkg.HtmlElement) && document.activeElement != nfo.element) {
                        nfo.element.focus();
                    }
                    else {
                        // otherwise return focus back to canvas
                        $this.canvas.canvas.focus();
                    }
                }
            }
        };

        e.onkeyup  = function(ee) {
            if ($this.canvas != null) {
                $this.canvas.keyReleased(ee);
            }
        };

        e.onkeypress = function(ee) {
            if ($this.canvas != null) {
                $this.canvas.keyTyped({
                    keyCode       : ee.keyCode,
                    target        : ee.target,
                    altKey        : ee.altKey,
                    shiftKey      : ee.shiftKey,
                    ctrlKey       : ee.ctrlKey,
                    metaKey       : ee.metaKey,
                    preventDefault: function() {}
                });
            }
        };
    },

    function focused() {
        if (this.hasFocus()) {
            // if the component has focus that has came from Zebra component we should 
            // set focus to native component that hosted by Zebra component
            var pfo = zebra.ui.focusManager.prevFocusOwner;
            if (pfo == null || zebra.instanceOf(pfo, pkg.HtmlElement) === false) {
                this.element.focus();
            }
        }

        this.$super();
    },

    function setBorder(b) {
        if (b == null) {
            this.element.style.border = "none";
        }
        else {
            var e = this.element;

            //!!!! Bloody FF fix, the border can be made transparent 
            //!!!! only via "border" style 
            e.style.border = "0px solid transparent";

            //!!! FF understands only decoupled border settings
            e.style.borderTopStyle = "solid";
            e.style.borderTopColor = "transparent";
            e.style.borderTopWidth = "" + b.getTop() + "px";
        
            e.style.borderLeftStyle = "solid";
            e.style.borderLeftColor = "transparent";
            e.style.borderLeftWidth = "" + b.getLeft() + "px";

            e.style.borderBottomStyle = "solid";
            e.style.borderBottomColor = "transparent";
            e.style.borderBottomWidth = "" + b.getBottom() + "px";


            e.style.borderRightStyle = "solid";
            e.style.borderRightColor = "transparent";
            e.style.borderRightWidth = "" + b.getRight() + "px";
        }
        this.$super(b);
    },

    function setPaddings(t,l,b,r) {
        var e = this.element;
        e.style.paddingTop    = '' + t + "px";
        e.style.paddingLeft   = '' + l + "px";
        e.style.paddingRight  = '' + r + "px";
        e.style.paddingBottom = '' + b + "px";
        this.$super(t,l,b,r);
    },

    function setVisible(b) {
        if (this.isInInvisibleState()) {
            this.element.style.visibility = "hidden";
        }
        else {
            this.element.style.visibility = b ? "visible" : "hidden";
        }
        this.$super(b);
    },

    function setEnabled(b) {
        this.$super(b);
        this.element.disabled = !b;
    },

    function setSize(w, h) {
        this.$super(w, h);
        var visibility = this.element.style.visibility;
        this.element.style.visibility = "hidden"; // could make sizing smooth

        // HTML element size is calculated as sum of "width"/"height", paddings, border
        // So the passed width and height has to be corrected (before it will be applied to 
        // an HTML element) by reduction of extra HTML gaps. For this we firstly set the 
        // width and size
        this.element.style.width  = "" + w + "px";
        this.element.style.height = "" + h + "px";

        // than we know the component metrics and can compute necessary reductions
        var dx = this.element.offsetWidth  - w,
            dy = this.element.offsetHeight - h;
        this.element.style.width   = "" + (w - dx) + "px";
        this.element.style.height  = "" + (h - dy) + "px";

        if (this.isInInvisibleState()) {
            this.element.style.visibility = "hidden";
        }
        else {
            this.element.style.visibility = visibility;
        }
    },

    function setLocation(x, y) {
        this.$super(x, y);
        this.isLocAdjusted = false;
    },

    function validate() {
        if (this.canvas == null && this.parent != null) {
            this.canvas = this.getCanvas();
        }

        if (this.canvas != null && this.isLocAdjusted === false) {
            this.adjustLocation();
        }

        this.$super();
    },
    
    function setParent(p) {
        this.$super(p);

        if (p == null) {
            if (this.element.parentNode != null) {
                this.element.parentNode.removeChild(this.element);
            }

            this.element.style.visibility = "hidden";
            pkg.events.removeComponentListener(this.globalCompListener);
        }
        else {
            if (zebra.instanceOf(p, pkg.HtmlElement)) {
                p.element.appendChild(this.element);
            }
            else {
                document.body.appendChild(this.element);
            }

            if (this.isInInvisibleState()) {
                this.element.style.visibility = "hidden";
            }
            else {
                this.element.style.visibility = this.isVisible ? "visible" : "hidden";
            }

            pkg.events.addComponentListener(this.globalCompListener);
        }

        this.isLocAdjusted = false;
        
        this.canvas = p != null ? this.getCanvas() : null;
    }
]);

/**
 * HTML input element wrapper class. The class can be used as basis class
 * to wrap HTML elements that can be used to enter a textual information.
 * @constructor
 * @param {String} text a text the text input component has to be filled with
 * @param {String} element an input element name 
 * @class zebra.ui.HtmlTextInput
 * @extends zebra.ui.HtmlElement
 */
pkg.HtmlTextInput = Class(pkg.HtmlElement, [
    function $prototype() {
        this.canHaveFocus = function() {
            return true;
        };

        /**
         * Get a text of the text input element
         * @return {String} a text of the  text input element 
         * @method getText
         */
        this.getText = function() {
            return this.element.value.toString();
        };

        /**
         * Set the text 
         * @param {String} t a text 
         * @method setText
         */
        this.setText = function(t) {
            if (this.element.value != t) {
                this.element.value = t;
                this.vrp();
            }
        };
    },

    function(text, elementName) {
        this.$super(elementName);
        this.element.setAttribute("tabindex", 0);
        this.setText(text);
    }
]);


pkg.HtmlContent = Class(pkg.HtmlElement, [
    function() {
        this.$super("div");
        this.setStyle("overflow", "hidden");
    },

    function loadContent(url) {
        var c = zebra.io.GET(url);
        this.setContent(c);
        this.vrp();
    }
]);


/**
 * HTML input text element wrapper class. The class wraps standard HTML text field  
 * and represents it as zebra UI component.
 * @constructor
 * @class zebra.ui.HtmlTextField
 * @param {String} [text] a text the text field component has to be filled with
 * @extends zebra.ui.HtmlTextInput
 */
pkg.HtmlTextField = Class(pkg.HtmlTextInput, [
    function() {
        this.$this("");
    },

    function(text) {
        this.$super(text, "input");
        this.element.setAttribute("type",  "text");
    }
]);

/**
 * HTML input textarea element wrapper class. The class wraps standard HTML textarea 
 * element and represents it as zebra UI component.
 * @constructor
 * @param {String} [text] a text the text area component has to be filled with
 * @class zebra.ui.HtmlTextArea
 * @extends zebra.ui.HtmlTextInput
 */
pkg.HtmlTextArea = Class(pkg.HtmlTextInput, [
    function() {
        this.$this("");
    },

    function(text) {
        this.$super(text, "textarea");
        this.element.setAttribute("rows", 10);
    }
]);

/**
 * @for
 */

})(zebra("ui"), zebra.Class);

(function(pkg, Class, ui)  {

/**
 * Tree UI component and all related to the component classes and interfaces. 
 * The component is graphical representation of a tree model that allows a user 
 * to navigate over the model item, customize the items rendering and 
 * organize customizable editing of the items.
 
        // create tree component instance to visualize the given tree model
        var tree = new zebra.ui.tree.Tree({ 
            value: "Root"
            kids : [
                "Item 1",
                "Item 2",
                "Item 3"
            ]
        });

        // make all tree items editable with text field component 
        tree.setEditorProvider(new zebra.ui.tree.DefEditors());

 * @module ui.tree
 * @main
 */

var KE = ui.KeyEvent,
    IM = function(b) {
        this.width = this.height = this.x = this.y = this.viewHeight = 0;
        this.viewWidth = -1;
        this.isOpen = b;
    },
    TreeListeners = zebra.util.Listeners.Class("toggled", "selected");

/**
 * Default tree editor provider
 * @class zebra.ui.tree.DefEditors
 */
pkg.DefEditors = Class([
    function (){
        /**
         * Internal component that are designed as default editor component
         * @private
         * @readOnly
         * @attribute tf
         * @type {zebra.ui.TextField}
         */
        this.tf = new ui.TextField(new zebra.data.SingleLineTxt(""));
        this.tf.setBackground("white");
        this.tf.setBorder(null);
        this.tf.setPadding(0);
    },

    function $prototype() {
        /**
         * Get an UI component to edit the given tree model element 
         * @param  {zebra.ui.tree.Tree} src a tree component
         * @param  {zebra.data.Item} item an data model item
         * @return {zebra.ui.Panel} an editor UI component
         * @method getEditor
         */
        this.getEditor = function(src,item){
            var o = item.value;
            this.tf.setValue((o == null) ? "" : o.toString());
            return this.tf;
        };

        /**
         * Fetch a model item from the given UI editor component
         * @param  {zebra.ui.tree.Tree} src a tree UI component
         * @param  {zebra.ui.Panel} editor an editor that has been used to edit the tree model element
         * @return {Object} an new tree model element value fetched from the given UI editor component
         * @method fetchEditedValue
         */
        this.fetchEditedValue = function(src,editor){ 
            return editor.view.target.getValue();
        };

        /**
         * The method is called to ask if the given input event should trigger an tree component item
         * @param  {zebra.ui.tree.Tree} src a tree UI component
         * @param  {zebra.ui.MouseEvent|zebra/ui.KeyEvent} e   an input event: mouse or key event
         * @return {Boolean} true if the event should trigger edition of a tree component item 
         * @method @shouldStartEdit
         */
        this.shouldStartEdit = function(src,e){
            return (e.ID == ui.MouseEvent.CLICKED && e.clicks > 1) ||
                   (e.ID == KE.PRESSED && e.code == KE.ENTER);
        };
    }
]);

/**
 * Default tree editor view provider
 * @class zebra.ui.tree.DefViews
 * @constructor
 * @param {String} [color] the tree item text color
 * @param {String} [font] the tree item text font
 */
pkg.DefViews = Class([
    function $prototype() {
        /**
         * Get a view for the given model item of the UI tree component   
         * @param  {zebra.ui.tree.Tree} d  a tree component
         * @param  {zebra.data.Item} obj a tree model element
         * @return {zebra.ui.View}  a view to visualize the given tree data model element 
         * @method  getView
         */
        this.getView = function (d, obj){
            if (obj.value && obj.value.paint) {
                return obj.value;
            }
            this.render.target.setValue(obj.value == null ? "<null>" : obj.value);
            return this.render;
        };

        this[''] = function(color, font) {
            if (color == null) color = pkg.Tree.fontColor;
            if (font  == null) font  = pkg.Tree.font;

            /**
             * Default tree item render
             * @attribute render
             * @readOnly
             * @type {zebra.ui.TextRender}
             */
            this.render = new ui.TextRender("");
            this.render.setFont(font);
            this.render.setColor(color);
        };
    }
]);

/**
 * Tree UI component that visualizes a tree data model. The model itself can be passed as JavaScript 
 * structure or as a instance of zebra.data.TreeModel. Internally tree component keeps the model always
 * as zebra.data.TreeModel class instance:
 
     var tree = new zebra.ui.tree.Tree({
          value: "Root",
          kids : [  "Item 1", "Item 2"]
     });

 * or
  
     var model = new zebra.data.TreeModel("Root");
     model.add(model.root, "Item 1");
     model.add(model.root, "Item 2");
   
     var tree = new zebra.ui.tree.Tree(model);


 * @class  zebra.ui.tree.Tree
 * @constructor
 * @extends {zebra.ui.Panel}
 * @param {Object|zebra.data.TreeModel} [model] a tree data model passed as JavaScript 
 * structure or as an instance
 * @param {Boolean} [b] the tree component items toggle state. true to have all items 
 * in opened state.
 * of zebra.data.TreeModel class
 */

/**
 * Fired when a tree item has been toggled
 
       tree._.add(function toggled(src, item) {
          ...    
       });

 * @event toggled
 * @param  {zebra.ui.tree.Tree} src an tree component that triggers the event
 * @param  {zebra.data.Item} item an tree item that has been toggled
 */

/**
 * Fired when a tree item has been selected

     tree._.add(function selected(src, item) {
        ...
     });

 * @event selected
 * @param  {zebra.ui.tree.Tree} src an tree component that triggers the event
 * @param  {zebra.data.Item} item an tree item that has been toggled
 */
pkg.Tree = Class(ui.Panel, ui.MouseListener, ui.KeyListener, ui.ChildrenListener, [
    function $prototype() {
        this.itemGapY = this.gapx = this.gapy = 2;
        this.itemGapX = 4;

        /**
         * Selected tree item
         * @attribute selected
         * @readOnly
         * @type {zebra.data.Item}
         */

         /**
          * Tree data model the UI component visualizes  
          * @attribute model
          * @readOnly
          * @type {zebra.data.TreeModel}
          */

        this.canHaveFocus = function() { return true; };

        this.childInputEvent = function(e){
            if(e.ID == KE.PRESSED){
                var kc = e.code;
                if(kc == KE.ESCAPE) this.stopEditing(false);
                else {
                    if(kc == KE.ENTER){
                        if(!(zebra.instanceOf(e.source, ui.TextField)) ||
                            (zebra.instanceOf(e.source.view.target, zebra.data.SingleLineTxt))){
                            this.stopEditing(true);
                        }
                    }
                }
            }
        };

        this.isInvalidatedByChild = function (c){ return false; };

        this.catchScrolled = function (psx,psy){
            this.stopEditing(true);
            if(this.firstVisible == null) this.firstVisible = this.model.root;
            this.firstVisible = (this.y < psy) ? this.nextVisible(this.firstVisible)
                                               : this.prevVisible(this.firstVisible);
            this.repaint();
        };


        /**
         * Test if the given tree component item is opened
         * @param  {zebra.data.Item}  i a tree model item
         * @return {Boolean} true if the given tree component item is opened
         * @method isOpen
         */
        this.isOpen = function(i){
            this.validate();
            return this.isOpen_(i);
        };

        this.getItemMetrics = function(i){
            this.validate();
            return this.getIM(i);
        };

        this.laidout = function() { this.vVisibility(); };

        this.vVisibility = function (){
            if (this.model == null) this.firstVisible = null;
            else {
                var nva = ui.$cvp(this, {});
                if (nva == null) this.firstVisible = null;
                else
                {
                    if (this._isVal === false ||
                        (this.visibleArea == null || this.visibleArea.x != nva.x ||
                         this.visibleArea.y != nva.y || this.visibleArea.width != nva.width ||
                         this.visibleArea.height != nva.height))
                    {
                        this.visibleArea = nva;
                        if(this.firstVisible != null){
                            this.firstVisible = this.findOpened(this.firstVisible);
                            this.firstVisible = this.isAbove(this.firstVisible) ? this.nextVisible(this.firstVisible)
                                                                                : this.prevVisible(this.firstVisible);
                        }
                        else
                            this.firstVisible = (-this.scrollManager.getSY() > ~~(this.maxh / 2)) ? this.prevVisible(this.findLast(this.model.root))
                                                                                         : this.nextVisible(this.model.root);
                    }
                }
            }
            this._isVal = true;
        };

        this.recalc = function (){
            this.maxh = this.maxw = 0;
            if(this.model != null && this.model.root != null){
                this.recalc_(this.getLeft(), this.getTop(), null, this.model.root, true);
                this.maxw -= this.getLeft();
                this.maxh -= this.gapy;
            }
        };

        this.getViewBounds = function(root){
            var metrics = this.getIM(root), toggle = this.getToggleBounds(root), image = this.getImageBounds(root);
            toggle.x = image.x + image.width + (image.width > 0 || toggle.width > 0 ? this.gapx : 0);
            toggle.y = metrics.y + ~~((metrics.height - metrics.viewHeight) / 2);
            toggle.width = metrics.viewWidth;
            toggle.height = metrics.viewHeight;
            return toggle;
        };

        this.getToggleBounds = function(root){
            var node = this.getIM(root), d = this.getToggleSize(root);
            return { x:node.x, y:node.y + ~~((node.height - d.height) / 2), width:d.width, height:d.height };
        };

        /**
         * Get current toggle element view. The view depends on the state of tree item.
         * @param  {zebra.data.Item} i a tree model item
         * @protected
         * @return {zebra.ui.View}  a toggle element view
         * @method getToogleView
         */
        this.getToggleView = function(i){
            return i.kids.length > 0 ? (this.getIM(i).isOpen ? this.views["on"]
                                                             : this.views["off"]) : null;
        };

        /**
         * Get a tree item that is located at the given location.
         * @param  {Integer} x a x coordinate
         * @param  {Integer} y a y coordinate
         * @return {zebra.data.Item} a tree model item 
         * @method getItemAt
         */
        this.getItemAt = function(x,y){
            this.validate();
            return this.firstVisible == null ? null : this.getItemAt_(this.firstVisible, x, y);
        };

        this.recalc_ = function (x,y,parent,root,isVis){
            var node = this.getIM(root);
            if(isVis === true){
                if(node.viewWidth < 0){
                    var viewSize = this.provider.getView(this, root).getPreferredSize();
                    node.viewWidth = viewSize.width === 0 ? 5 : viewSize.width + this.itemGapX * 2;
                    node.viewHeight = viewSize.height + this.itemGapY * 2;
                }
                var imageSize = this.getImageSize(root), toggleSize = this.getToggleSize(root);
                if(parent != null){
                    var pImg = this.getImageBounds(parent);
                    x = pImg.x + ~~((pImg.width - toggleSize.width) / 2);
                }

                node.x = x;
                node.y = y;
                node.width = toggleSize.width + imageSize.width +
                             node.viewWidth + (toggleSize.width > 0 ? this.gapx : 0) +
                                              (imageSize.width > 0 ? this.gapx : 0);

                node.height = Math.max(((toggleSize.height > imageSize.height) ? toggleSize.height
                                                                               : imageSize.height),
                                        node.viewHeight);
                
                if (node.x + node.width > this.maxw) {
                    this.maxw = node.x + node.width;
                }

                this.maxh += (node.height + this.gapy);
                x = node.x + toggleSize.width + (toggleSize.width > 0 ? this.gapx : 0);
                y += (node.height + this.gapy);
            }
            var b = node.isOpen && isVis;
            if(b){
                var count = root.kids.length;
                for(var i = 0; i < count; i++) {
                    y = this.recalc_(x, y, root, root.kids[i], b);
                }
            }
            return y;
        };

        this.isOpen_ = function (i){
            return i == null || (i.kids.length > 0 && this.getIM(i).isOpen && this.isOpen_(i.parent));
        };

        this.getIM = function (i){
            var node = this.nodes[i];
            if(typeof node === 'undefined'){
                node = new IM(this.isOpenVal);
                this.nodes[i] = node;
            }
            return node;
        };

        this.getItemAt = function(root, x, y){
            if(y >= this.visibleArea.y && y < this.visibleArea.y + this.visibleArea.height){
                var dx    = this.scrollManager.getSX(),
                    dy    = this.scrollManager.getSY(),
                    found = this.getItemAtInBranch(root, x - dx, y - dy);

                if (found != null) return found;

                var parent = root.parent;
                while(parent != null){
                    var count = parent.kids.length;
                    for(var i = parent.kids.indexOf(root) + 1;i < count; i ++ ){
                        found = this.getItemAtInBranch(parent.kids[i], x - dx, y - dy);
                        if (found != null) return found;
                    }
                    root = parent;
                    parent = root.parent;
                }
            }
            return null;
        };

        this.getItemAtInBranch = function(root,x,y){
            if(root != null){
                var node = this.getIM(root);
                if (x >= node.x && y >= node.y && x < node.x + node.width && y < node.y + node.height + this.gapy) return root;
                if (this.isOpen_(root)){
                    for(var i = 0;i < root.kids.length; i++) {
                        var res = this.getItemAtInBranch(root.kids[i], x, y);
                        if(res != null) return res;
                    }
                }
            }
            return null;
        };

        this.getImageView = function (i){
            return i.kids.length > 0 ? (this.getIM(i).isOpen ? this.views["open"]
                                                             : this.views["close"])
                                     : this.views["leaf"];
        };

        this.getImageSize = function (i) {
            var v =  i.kids.length > 0 ? (this.getIM(i).isOpen ? this.viewSizes["open"]
                                                               : this.viewSizes["close"])
                                       : this.viewSizes["leaf"];
            return v ? v : { width:0, height:0 }; 
        };

        this.getImageBounds = function (root){
            var node = this.getIM(root),
                id   = this.getImageSize(root),
                td   = this.getToggleSize(root);
            return { x:node.x + td.width + (td.width > 0 ? this.gapx : 0),
                     y:node.y + ~~((node.height - id.height) / 2),
                     width:id.width, height:id.height };
        };

        this.getImageY = function (root){
            var node = this.getIM(root);
            return node.y + ~~((node.height - this.getImageSize(root).height) / 2);
        };

        this.getToggleY = function (root){
            var node = this.getIM(root);
            return node.y + ~~((node.height - this.getToggleSize(root).height) / 2);
        };

        this.getToggleSize = function (i){
            return this.isOpen_(i) ? this.viewSizes["on"] : this.viewSizes["off"];
        };

        this.isAbove = function (i){
            var node = this.getIM(i);
            return node.y + node.height + this.scrollManager.getSY() < this.visibleArea.y;
        };

        this.findOpened = function (item){
            var parent = item.parent;
            return (parent == null || this.isOpen_(parent)) ? item : this.findOpened(parent);
        };

        this.findNext = function (item){
            if(item != null){
                if(item.kids.length > 0 && this.isOpen_(item)){
                    return item.kids[0];
                }
                var parent = null;
                while ((parent = item.parent) != null){
                    var index = parent.kids.indexOf(item);
                    if (index + 1 < parent.kids.length) return parent.kids[index + 1];
                    item = parent;
                }
            }
            return null;
        };

        this.findPrev = function (item){
            if (item != null) {
                var parent = item.parent;
                if (parent != null) {
                    var index = parent.kids.indexOf(item);
                    return (index - 1 >= 0) ? this.findLast(parent.kids[index - 1]) : parent;
                }
            }
            return null;
        };

        this.findLast = function (item){
            return this.isOpen_(item) && item.kids.length > 0 ? this.findLast(item.kids[item.kids.length - 1])
                                                              : item;
        };

        this.prevVisible = function (item){
            if(item == null || this.isAbove(item)) return this.nextVisible(item);
            var parent = null;
            while((parent = item.parent) != null){
                for(var i = parent.kids.indexOf(item) - 1;i >= 0; i-- ){
                    var child = parent.kids[i];
                    if (this.isAbove(child)) return this.nextVisible(child);
                }
                item = parent;
            }
            return item;
        };

        this.isVerVisible = function (item){
            if(this.visibleArea == null) return false;
            var node = this.getIM(item), yy1 = node.y + this.scrollManager.getSY(), yy2 = yy1 + node.height - 1,
                by = this.visibleArea.y + this.visibleArea.height;

            return ((this.visibleArea.y <= yy1 && yy1 < by) ||
                    (this.visibleArea.y <= yy2 && yy2 < by) ||
                    (this.visibleArea.y > yy1 && yy2 >= by)    );
        };

        this.nextVisible = function(item){
            if (item == null || this.isVerVisible(item)) return item;
            var res = this.nextVisibleInBranch(item), parent = null;
            if (res != null) return res;
            while((parent = item.parent) != null){
                var count = parent.kids.length;
                for(var i = parent.kids.indexOf(item) + 1;i < count; i++){
                    res = this.nextVisibleInBranch(parent.kids[i]);
                    if (res != null) return res;
                }
                item = parent;
            }
            return null;
        };

        this.nextVisibleInBranch = function (item){
            if (this.isVerVisible(item)) return item;
            if (this.isOpen_(item)){
                for(var i = 0;i < item.kids.length; i++){
                    var res = this.nextVisibleInBranch(item.kids[i]);
                    if (res != null) return res;
                }
            }
            return null;
        };

        this.paintTree = function (g,item){
            this.paintBranch(g, item);
            var parent = null;
            while((parent = item.parent) != null){
                this.paintChild(g, parent, parent.kids.indexOf(item) + 1);
                item = parent;
            }
        };

        this.paintBranch = function (g, root){
            if(root == null) return false;
            var node = this.getIM(root), dx = this.scrollManager.getSX(),
                dy = this.scrollManager.getSY(), va = this.visibleArea;
            
            if (zebra.util.isIntersect(node.x + dx, node.y + dy,
                                       node.width, node.height,
                                       va.x, va.y, va.width, va.height))
            {
                var toggle = this.getToggleBounds(root), toggleView = this.getToggleView(root);
                if(toggleView != null) {
                    toggleView.paint(g, toggle.x, toggle.y, toggle.width, toggle.height, this);
                }

                var image = this.getImageBounds(root);
                if (image.width > 0) {
                    this.getImageView(root).paint(g, image.x, image.y, 
                                                  image.width, image.height, this);
                }

                var vx = image.x + image.width + (image.width > 0 || toggle.width > 0 ? this.gapx : 0),
                    vy = node.y + ~~((node.height - node.viewHeight) / 2);

                if(this.selected == root && root != this.editedItem){
                    var selectView = this.views[this.hasFocus()?"aselect":"iselect"];
                    if (selectView != null) {
                        selectView.paint(g, vx, vy, node.viewWidth, node.viewHeight, this);
                    }
                }

                if(root != this.editedItem){
                    var vvv = this.provider.getView(this, root), vvvps = vvv.getPreferredSize();
                    vvv.paint(g, vx + this.itemGapX, vy + this.itemGapY,
                                 vvvps.width, vvvps.height, this);
                }

                if(this.lnColor != null){
                    g.setColor(this.lnColor);
                    var x1 = toggle.x + (toggleView == null ? ~~(toggle.width / 2) + 1 : toggle.width),
                        yy = toggle.y + ~~(toggle.height / 2) + 0.5;

                    g.beginPath();
                    g.moveTo(x1-1, yy);
                    g.lineTo(image.x, yy);
                    g.stroke();
                }
            }
            else{
                if(node.y + dy > this.visibleArea.y + this.visibleArea.height ||
                   node.x + dx > this.visibleArea.x + this.visibleArea.width)
                {
                    return false;
                }
            }
            return this.paintChild(g, root, 0);
        };

        this.y_ = function (item,isStart){
            var ty = this.getToggleY(item), th = this.getToggleSize(item).height, dy = this.scrollManager.getSY(),
                y = (item.kids.length > 0) ? (isStart ? ty + th : ty - 1) : ty + ~~(th / 2);
            if (y + dy < 0) y = -dy - 1;
            else {
                if (y + dy > this.height) y = this.height - dy;
            }
            return y;
        };

        this.paintChild = function (g,root,index){
            var b = this.isOpen_(root), vs = this.viewSizes;
            if (root == this.firstVisible && this.lnColor != null){
                g.setColor(this.lnColor);
                var y1 = this.getTop(), y2 = this.y_(root, false),
                    xx = this.getIM(root).x + ~~((b ? vs["on"].width
                                                    : vs["off"].width) / 2);
                g.beginPath();
                g.moveTo(xx + 0.5, y1);
                g.lineTo(xx + 0.5, y2);
                g.stroke();
            }
            if (b && root.kids.length > 0){
                var firstChild = root.kids[0];
                if (firstChild == null) return true;
                var x = this.getIM(firstChild).x + ~~((this.isOpen_(firstChild) ? vs["on"].width
                                                                                : vs["off"].width) / 2);
                var count = root.kids.length;
                if(index < count){
                    var y = (index > 0) ? this.y_(root.kids[index - 1], true)
                                        : this.getImageY(root) + this.getImageSize(root).height;
                    for(var i = index;i < count; i ++ ){
                        var child = root.kids[i];
                        if (this.lnColor != null){
                            g.setColor(this.lnColor);
                            g.beginPath();
                            g.moveTo(x + 0.5, y);
                            g.lineTo(x + 0.5, this.y_(child, false));
                            g.stroke();
                            y = this.y_(child, true);
                        }
                        if (this.paintBranch(g, child) === false){
                            if (this.lnColor != null && i + 1 != count){
                                g.setColor(this.lnColor);
                                g.beginPath();
                                g.moveTo(x + 0.5, y);
                                g.lineTo(x + 0.5, this.height - this.scrollManager.getSY());
                                g.stroke();
                            }
                            return false;
                        }
                    }
                }
            }
            return true;
        };

        this.nextPage = function (item,dir){
            var sum = 0, prev = item;
            while(item != null && sum < this.visibleArea.height){
                sum += (this.getIM(item).height + this.gapy);
                prev = item;
                item = dir < 0 ? this.findPrev(item) : this.findNext(item);
            }
            return prev;
        };

        this.se = function (item,e){
            if (item != null){
                this.stopEditing(true);
                if(this.editors != null && this.editors.shouldStartEdit(item, e)){
                    this.startEditing(item);
                    return true;
                }
            }
            return false;
        };

        this.paint = function(g){
            if (this.model != null){
                this.vVisibility();
                if (this.firstVisible != null){
                    var sx = this.scrollManager.getSX(), sy = this.scrollManager.getSY();
                    try{
                        g.translate(sx, sy);
                        this.paintTree(g, this.firstVisible);
                    }
                    finally{
                        g.translate(-sx,  -sy);
                    }
                }
            }
        };

        /**
         * Select the given item. 
         * @param  {zebra.data.Item} an item to be selected. Use null value to clear any selection  
         * @method  select
         */
        this.select = function(item){
            if (this.isSelectable && item != this.selected){
                var old = this.selected, m = null;
                this.selected = item;
                if (this.selected != null) { 
                    this.makeVisible(this.selected);
                }

                this._.selected(this, this.selected);

                if(old != null && this.isVerVisible(old)){
                    m = this.getItemMetrics(old);
                    this.repaint(m.x + this.scrollManager.getSX(),
                                 m.y + this.scrollManager.getSY(),
                                 m.width, m.height);
                }

                if(this.selected != null && this.isVerVisible(this.selected)){
                    m = this.getItemMetrics(this.selected);
                    this.repaint(m.x + this.scrollManager.getSX(),
                                 m.y + this.scrollManager.getSY(),
                                 m.width, m.height);
                }
            }
        };

        /**
         * Make the given tree item visible. Tree component rendered content can takes more space than 
         * the UI component size is. In this case the content can be scrolled to make visible required 
         * tree item.
         * @param  {zebra.data.Item} item an item to be visible
         * @method makeVisible
         */
        this.makeVisible = function(item){
            this.validate();
            var r = this.getViewBounds(item);
            this.scrollManager.makeVisible(r.x, r.y, r.width, r.height);
        };

        this.mouseClicked = function(e){
            if (this.se(this.pressedItem, e)) {
                this.pressedItem = null;
            }
            else {
                if (this.selected != null && 
                    e.clicks > 1 && e.isActionMask() &&
                   this.getItemAt(this.firstVisible, e.x, e.y) == this.selected)
                {
                    this.toggle(this.selected);
                }
            }
        };

        this.mouseReleased = function(e){ if (this.se(this.pressedItem, e)) this.pressedItem = null; };

        this.keyTyped = function(e){
            if (this.selected != null){
                switch(e.ch) {
                    case '+': if (this.isOpen(this.selected) === false) this.toggle(this.selected);break;
                    case '-': if (this.isOpen(this.selected)) this.toggle(this.selected);break;
                }
            }
        };

        this.keyPressed = function(e){
            var newSelection = null;
            switch(e.code) {
                case KE.DOWN    :
                case KE.RIGHT   : newSelection = this.findNext(this.selected);break;
                case KE.UP      :
                case KE.LEFT    : newSelection = this.findPrev(this.selected);break;
                case KE.HOME    : if (e.isControlPressed()) this.select(this.model.root);break;
                case KE.END     : if (e.isControlPressed()) this.select(this.findLast(this.model.root));break;
                case KE.PAGEDOWN: if (this.selected != null) this.select(this.nextPage(this.selected, 1));break;
                case KE.PAGEUP  : if (this.selected != null) this.select(this.nextPage(this.selected,  - 1));break;
                //!!!!case KE.ENTER: if(this.selected != null) this.toggle(this.selected);break;
            }
            if (newSelection != null) this.select(newSelection);
            this.se(this.selected, e);
        };

        this.mousePressed = function(e){            
            this.pressedItem = null;
            this.stopEditing(true);
        
            if (this.firstVisible != null && e.isActionMask()){
                var x = e.x, y = e.y, root = this.getItemAt(this.firstVisible, x, y);
                if (root != null){
                    x -= this.scrollManager.getSX();
                    y -= this.scrollManager.getSY();
                    var r = this.getToggleBounds(root);

                    if (x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height){
                        if (root.kids.length > 0) this.toggle(root);
                    }
                    else {
                        if (x > r.x + r.width) this.select(root);
                        if (this.se(root, e) === false) this.pressedItem = root;
                    }
                }
            }
        };

        /**
         * Toggle off or on recursively all items of the given item  
         * @param  {zebra.data.Item} root a starting item to toggle
         * @param  {Boolean} b  true if all items have to be in opened 
         * state and false otherwise
         * @method toggleAll
         */
        this.toggleAll = function (root,b){
            var model = this.model;
            if (root.kids.length > 0){
                if(this.getItemMetrics(root).isOpen != b) this.toggle(root);
                for(var i = 0;i < root.kids.length; i++ ){
                    this.toggleAll(root.kids[i], b);
                }
            }
        };

        /**
         * Toggle the given tree item
         * @param  {zebra.data.Item} item an item to be toggled
         * @method toggle
         */
        this.toggle = function(item){
            if (item.kids.length > 0){
                this.stopEditing(true);
                this.validate();
                var node = this.getIM(item);
                node.isOpen = (node.isOpen ? false : true);
                this.invalidate();
                this._.toggled(this, item);
                if( !node.isOpen && this.selected != null){
                    var parent = this.selected;
                    do {
                        parent = parent.parent;
                    }
                    while(parent != item && parent != null);
                    if(parent == item) this.select(item);
                }
                this.repaint();
            }
        };

        this.itemInserted = function (target,item){
            this.stopEditing(false);
            this.vrp();
        };

        this.itemRemoved = function (target,item){
            if (item == this.firstVisible) this.firstVisible = null;
            this.stopEditing(false);
            if (item == this.selected) this.select(null);
            delete this.nodes[item];
            this.vrp();
        };

        this.itemModified = function (target,item){
            var node = this.getIM(item);
            if (node != null) node.viewWidth = -1;
            this.vrp();
        };

        /**
         * Start editing the given if an editor for the item has been defined. 
         * @param  {zebra.data.Item} item an item whose content has to be edited
         * @method startEditing
         * @protected
         */
        this.startEditing = function (item){
            this.stopEditing(true);
            if(this.editors != null){
                var editor = this.editors.getEditor(this, item);
                if(editor != null){
                    this.editedItem = item;
                    var b = this.getViewBounds(this.editedItem), ps = editor.getPreferredSize();
                    editor.setLocation(b.x + this.scrollManager.getSX(),
                                       b.y - ~~((ps.height - b.height) / 2)+ this.scrollManager.getSY());
                    editor.setSize(ps.width, ps.height);
                    this.add(editor);
                    ui.focusManager.requestFocus(editor);
                }
            }
        };

        /**
         * Stop editing currently edited tree item and apply or discard the result of the
         * editing to tree data model.
         * @param  {Boolean} true if the editing result has to be applied to tree data model
         * @method stopEditing
         * @protected
         */
        this.stopEditing = function(applyData){
            if (this.editors != null && this.editedItem != null){
                try{
                    if(applyData)  {
                        this.model.setValue(this.editedItem, this.editors.fetchEditedValue(this.editedItem, this.kids[0]));
                    }
                }
                finally{
                    this.editedItem = null;
                    this.removeAt(0);
                    this.requestFocus();
                }
            }
        };

        this.calcPreferredSize = function (target){
            return this.model == null ? { width:0, height:0 }
                                      : { width:this.maxw, height:this.maxh };
        };
    },

    function () { this.$this(null); },
    function (d){ this.$this(d, true);},

    function (d,b){
        this.provider = this.selected = this.firstVisible = this.editedItem = this.pressedItem = null;
        this.maxw = this.maxh = 0;
        
        /**
         * A tree model items view provider
         * @readOnly
         * @attribute provider
         * @type {zebra.ui.tree.DefsViews}
         */

        /**
         * A tree model editor provider
         * @readOnly
         * @attribute editors
         * @type {zebra.ui.tree.DefEditors}
         */

         /**
          * Tree component line color
          * @attribute lnColor
          * @type {String}
          * @readOnly
          */

        this.visibleArea = this.lnColor = this.editors = null;

        this.views     = {};
        this.viewSizes = {};

        this._isVal = false;
        this.nodes = {};
        this._ = new TreeListeners(); 
        this.setLineColor("gray");

        this.isOpenVal = b;
        this.setModel(d);

        this.setViewProvider(new pkg.DefViews());

        this.setSelectable(true);
        this.$super();
        this.scrollManager = new ui.ScrollManager(this);
    },

    function focused(){ 
        this.$super();
        if (this.selected != null) {
            var m = this.getItemMetrics(this.selected);
            this.repaint(m.x + this.scrollManager.getSX(), m.y + this.scrollManager.getSY(), m.width, m.height);
        }
    },

    /**
     * Set the given editor provider. The editor provider is a class that is used to decide which UI
     * component has to be used as an item editor, how the editing should be triggered and how the 
     * edited value has to be fetched from an UI editor.
     * @param {zebra.ui.tree.DefEditors} p an editor provider
     * @method setEditorProvider 
     */
    function setEditorProvider(p){
        if(p != this.editors){
            this.stopEditing(false);
            this.editors = p;
        }
    },

    /**
     * Say if items of the tree component should be selectable
     * @param {Boolean} b true is tree component items can be selected 
     * @method setSelectable
     */
    function setSelectable(b){
        if (this.isSelectable != b){
            if (b === false && this.selected != null) this.select(null);
            this.isSelectable = b;
            this.repaint();
        }
    },

    /**
     * Set tree component connector lines color
     * @param {String} c a color
     * @method setLineColor
     */
    function setLineColor(c){
        this.lnColor = c;
        this.repaint();
    },

    function setGaps(gx,gy){
        if (gx != this.gapx || gy != this.gapy){
            this.gapx = gx;
            this.gapy = gy;
            this.vrp();
        }
    },

    /**
     * Set tree component items view provider. Provider says how tree model items 
     * have to be visualized. 
     * @param {zebra.ui.tree.DefViews} p a view provider
     * @method setViewProvider
     */
    function setViewProvider(p){
        if(p == null) p = this;
        if(this.provider != p){
            this.stopEditing(false);
            this.provider = p;
            delete this.nodes;
            this.nodes = {};
            this.vrp();
        }
    },

    /**
     * Set the number of views to customize rendering of different visual elements of the tree 
     * UI component. The following decorative elements can be customized:
 
    - **"close" ** - closed tree item icon view 
    - **"open" **  - opened tree item icon view
    - **"leaf" **  - leaf tree item icon view
    - **"on" **    - toggle on view 
    - **"off" **   - toggle off view
    - **"iselect" **   - a view to express an item selection when tree component doesn't hold focus
    - **"aselect" **   - a view to express an item selection when tree component holds focus

     * For instance:
     
        // build tree UI component
        var tree = new zebra.ui.tree.Tree({
            value: "Root",
            kids: [
                "Item 1",
                "Item 2"
            ]
        });

        // set " [x] " text render for toggle on and 
        // " [o] " text render for toggle off tree elements
        tree.setViews({
            "on": new zebra.ui.TextRender(" [x] "),
            "off": new zebra.ui.TextRender(" [o] ")
        });
    
     * @param {Object} v dictionary of tree component decorative elements views 
     * @method setViews
     */
    function setViews(v){
        for(var k in v) {
            if (v.hasOwnProperty(k)) {
                var vv = ui.$view(v[k]);
                this.views[k] = vv;
                if (k != "aselect" && k != "iselect"){
                    this.stopEditing(false);
                    this.viewSizes[k] = vv ? vv.getPreferredSize() : null;
                    this.vrp();
                }
            }
        }
    },

    /**
     * Set the given tree model to be visualized with the UI component.
     * @param {zebra.data.TreeModel|Object} d a tree model
     * @method setModel
     */
    function setModel(d){
        if (this.model != d) {
            if (zebra.instanceOf(d, zebra.data.TreeModel) === false) {
                d = new zebra.data.TreeModel(d);
            }

            this.stopEditing(false);
            this.select(null);
            if(this.model != null && this.model._) this.model._.remove(this);
            this.model = d;
            if(this.model != null && this.model._) this.model._.add(this);
            this.firstVisible = null;
            delete this.nodes;
            this.nodes = {};
            this.vrp();
        }
    },

    function invalidate(){
        if (this.isValid){
            this._isVal = false;
            this.$super();
        }
    }
]);

pkg.TreeSignView = Class(ui.View, [
    function $prototype() {
        this[''] = function(plus, color, bg) {
            this.color = color == null ? "white" : color;
            this.bg    = bg   == null ? "lightGray" : bg ;
            this.plus  = plus == null ? false : plus;
            this.br = new ui.Border("rgb(65, 131, 215)", 1, 3);
            this.width = this.height = 12;
        };

        this.paint = function(g, x, y, w, h, d) {
            this.br.outline(g, x, y, w, h, d);

            g.setColor(this.bg);
            g.fill();
            this.br.paint(g, x, y, w, h, d);

            g.setColor(this.color);
            g.lineWidth = 2;
            x+=2;
            w-=4;
            h-=4;
            y+=2;
            g.beginPath();
            g.moveTo(x, y + h/2);
            g.lineTo(x + w, y + h/2);
            if (this.plus) {
                g.moveTo(x + w/2, y);
                g.lineTo(x + w/2, y + h);
            }

            g.stroke();
            g.lineWidth = 1;
        };

        this.getPreferredSize = function() {
            return { width:this.width, height:this.height};
        };
    }
]);

/**
 * @for
 */

})(zebra("ui.tree"), zebra.Class, zebra.ui);

(function(pkg, Class, ui) {

/**
 * The package contains number of classes and interfaces to implement
 * UI Grid component. The grid allows developers to visualize matrix 
 * model, customize the model data editing and rendering. 
 * @module ui.grid
 * @main
 */

var Matrix = zebra.data.Matrix, L = zebra.layout, WinLayer = ui.WinLayer, MB = zebra.util, 
    Cursor = ui.Cursor, Position = zebra.util.Position, KE = ui.KeyEvent, 
    Listeners = zebra.util.Listeners;

//!!! crappy function
function arr(l, v) {
    var a = Array(l);
    for(var i=0; i<l; i++) a[i] = v;
    return a;
}

pkg.START_EDITING  = 1;
pkg.FINISH_EDITING = 2;
pkg.CANCEL_EDITING = 3;

function CellsVisibility() {
    this.hasVisibleCells = function(){
        return this.fr != null && this.fc != null &&
               this.lr != null && this.lc != null   ;
    };

    // first visible row (row and y), first visible 
    // col, last visible col and row
    this.fr = this.fc = this.lr = this.lc = null;
}

/**
 *  Interface that describes a grid component metrics 
 *  @class zebra.ui.grid.Metrics
 */
pkg.Metrics = zebra.Interface();

/**
 * Get the given column width of a grid component 
 * @param {Integer} col a column index 
 * @method getColWidth
 * @return {Integer} a column width 
 */

/**
 * Get the given row height of a grid component 
 * @param {Integer} row a row index 
 * @method getRowHeight
 * @return {Integer} a row height
 */

/**
 * Get the given row preferred height of a grid component 
 * @param {Integer} row a row index 
 * @method getPSRowHeight
 * @return {Integer} a row preferred height 
 */

/**
 * Get the given column preferred width of a grid component 
 * @param {Integer} col a column index 
 * @method getPSColWidth
 * @return {Integer} a column preferred width
 */

 /**
  * Get a x origin of a grid component. Origin indicates how 
  * the grid component content has been scrolled
  * @method getXOrigin
  * @return {Integer} a x origin
  */

/**
  * Get a y origin of a grid component. Origin indicates how 
  * the grid component content has been scrolled
  * @method getYOrigin
  * @return {Integer} a y origin
  */

  /**
   * Set the given column width of a grid component 
   * @param {Integer} col a column index 
   * @param {Integer} w a column width 
   * @method setColWidth
   */

  /**
   * Set the given row height of a grid component 
   * @param {Integer} row a row index 
   * @param {Integer} h a row height
   * @method setRowHeight
   */

  /**
   * Get number of columns in a grid component 
   * @return {Integer} a number of columns 
   * @method getGridCols
   */

  /**
   * Get number of rows in a grid component 
   * @return {Integer} a number of rows 
   * @method getGridRows
   */

   /**
    * Get a structure that describes a grid component 
    * columns and rows visibility  
    * @return {zebra.ui.grid.CellsVisibility} a grid cells visibility
    * @method getCellsVisibility 
    */
  
  /**
   * Grid line size
   * @attribute lineSize
   * @type {Integer}
   * @readOnly
   */

  /**
   * Indicate if a grid sizes its rows and cols basing on its preferred sizes
   * @attribute isUsePsMetric
   * @type {Boolean}
   * @readOnly
   */

/**
 * Default grid cell views provider. The class rules how a grid cell content,
 * background has to be rendered and aligned. Developers can implement an own
 * views providers and than setup it for a grid by calling "setViewProvider(...)"
 * method.
 * @class zebra.ui.grid.DefViews
 * @constructor
 */
pkg.DefViews = Class([
    function $prototype() {
        this[''] = function(){
            /**
             * Default render that is used to paint grid content. 
             * @type {zebra.ui.TextRender}
             * @attribute render
             * @readOnly
             * @protected
             */
            this.render = new ui.TextRender(new zebra.data.SingleLineTxt(""));
        };
        
        /**
         * Get the given grid cell color
         * @param  {zebra.ui.grid.Grid} target a target grid component
         * @param  {Integer} row   a grid cell row
         * @param  {Integer} col   a grid cell column
         * @return {String}  a cell color to be applied to the given grid cell
         * @method  getCellColor
         */
        this.getCellColor = function(target, row,col) {
            return pkg.DefViews.cellBackground;
        };

        /**
         * Get a renderer to draw the specified grid model value.  
         * @param  {zebra.ui.grid.Grid} target a target Grid component
         * @param  {Ineteger} row    a grid cell row
         * @param  {Ineteger} col    a grid cell column
         * @param  {Object} obj    a model value for the given grid cell
         * @return {zebra.ui.View}  an instance of zebra view to be used to 
         * paint the given cell model value
         * @method  getView
         */
        this.getView = function(target, row,col,obj){
            if (obj != null){
                if (obj && obj.paint) return obj;
                this.render.target.setValue(obj.toString());
                return this.render;
            }
            return null;
        };

        /**
         * Get an horizontal alignment a content in the given grid cell
         * has to be adjusted. The method is optional. 
         * @param  {zebra.ui.grid.Grid} target a target grid component
         * @param  {Integer} row   a grid cell row
         * @param  {Integer} col   a grid cell column
         * @return {Integer}  a horizontal alignment (zebra.layout.LEFT, zebra.layout.CENTER, zebra.layout.RIGHT)
         * @method  getXAlignment
         */

         /**
          * Get a vertical alignment a content in the given grid cell
          * has to be adjusted. The method is optional. 
          * @param  {zebra.ui.grid.Grid} target a target grid component
          * @param  {Integer} row   a grid cell row
          * @param  {Integer} col   a grid cell column
          * @return {Integer}  a vertical alignment (zebra.layout.TOP, zebra.layout.CENTER, zebra.layout.BOTTOM)
          * @method  getYAlignment
          */
    }
]);

/**
 * Simple grid cells editors provider implementation. The editors provider
 * always use a text field component to edit a cell content.   
 * @constructor
 * @class zebra.ui.grid.DefEditors
 */
pkg.DefEditors = Class([
    function $prototype() {
        this[''] = function() {
            this.editors = {};
            this.editors[''] = new ui.TextField("", 150);
        };

        /**
         * Fetch an edited value from the given UI editor component. 
         * @param  {Integer} row a grid cell row that has been edited
         * @param  {Integer} col a grid cell column that has been edited
         * @param  {Object} data an original cell content
         * @param  {zebra.ui.Panel} editor an editor that has been used to 
         * edit the given cell
         * @return {Object} a value that has to be applied as a new content of 
         * the edited cell content
         * @method  fetchEditedValue 
         */
        this.fetchEditedValue = function(row,col,data,editor) {
            return editor.getValue();
        };

        /**
         * Fetch an edited value from the given UI editor component. 
         * @param  {Integer} row a grid cell row that has been edited
         * @param  {Integer} col a grid cell column that has been edited
         * @param  {Object} data an original cell content
         * @param  {zebra.ui.Panel} editor an editor that has been used to 
         * edit the given cell
         * @return {Object} a value that has to be applied as a new content of 
         * the edited cell content
         * @method  fetchEditedValue 
         */
        this.getEditor = function(t, row, col, v){
            var editor = this.editors[col] ? this.editors[col] : this.editors['']; 
            if (editor == null) return null;

            editor.setBorder(null);
            editor.setPadding(0);
            editor.setValue((v == null ? "" : v.toString()));

            var ah = (t.getRowHeight(row) - editor.getPreferredSize().height)/2;
            editor.setPaddings(ah, t.cellInsetsLeft, ah, t.cellInsetsRight);
            return editor;
        };

        this.shouldDo = function(a,row,col,e){
            //!!! if (action == pkg.START_EDITING) return e.ID == MouseEvent.CLICKED && e.clicks == 1;
            // !!!else return (action == pkg.CANCEL_EDITING) ? e.ID == KE.PRESSED && KE.ESCAPE == e.code: false;
            var b = (a == pkg.START_EDITING  && e.ID == ui.MouseEvent.CLICKED && e.clicks == 1) ||
                    (a == pkg.CANCEL_EDITING && e.ID == KE.PRESSED && KE.ESCAPE == e.code) ||
                    (a == pkg.FINISH_EDITING && e.ID == KE.PRESSED && KE.ENTER  == e.code);
            return b;
        };

        this.editingCanceled = function(row,col,data,editor) {};
    }
]);

pkg.CaptionListeners = new Listeners.Class("captionResized");

/**
 * Grid caption base UI component class. This class has to be used 
 * as base to implement grid caption components
 * @class  zebra.ui.grid.BaseCaption
 * @extends {zebra.ui.Panel}
 * @constructor 
 * @param {Array} [titles] a caption component titles 
 */
pkg.BaseCaption = Class(ui.Panel, ui.MouseListener, [
    function $prototype() {
        /**
         * Minimal possible grid cell size
         * @type {Number}
         * @default 10
         * @attribute minSize
         */
        this.minSize = 10;

        /**
         * Size of the active area where cells size can be changed by mouse dragging event 
         * @attribute activeAreaSize
         * @type {Number}
         * @default 5
         */
        this.activeAreaSize = 5;

        /**
         * Indicate if the grid cell size has to be adjusted according 
         * to the cell preferred size by mouse double click event.
         * @attribute isAutoFit
         * @default true
         * @type {Boolean}
         */
        
        /**
         * Indicate if the grid cells are resize-able. 
         * to the cell preferred size by mouse double click event.
         * @attribute isResizable
         * @default true
         * @type {Boolean}
         */
        this.isAutoFit = this.isResizable = true;

        this.getCursorType = function (target,x,y){
            return this.metrics != null     &&
                   this.selectedColRow >= 0 &&
                   this.isResizable         &&
                   this.metrics.isUsePsMetric === false ? ((this.orient == L.HORIZONTAL) ? Cursor.W_RESIZE
                                                                                         : Cursor.S_RESIZE)
                                                        : -1;
        };

        this.mouseDragged = function(e){
            if (this.pxy != null){
                var b  = (this.orient == L.HORIZONTAL),
                    rc = this.selectedColRow,
                    ns = (b ? this.metrics.getColWidth(rc) + e.x
                            : this.metrics.getRowHeight(rc) + e.y) - this.pxy;
                
                this.captionResized(rc, ns);

                if (ns > this.minSize) {
                    this.pxy = b ? e.x : e.y;
                }
            }
        };

        this.mouseDragStarted = function(e){
            if (this.metrics != null &&
                this.isResizable &&
                this.metrics.isUsePsMetric === false   )
            {
                this.calcRowColAt(e.x, e.y);
                if (this.selectedColRow >= 0) {
                    this.pxy = (this.orient == L.HORIZONTAL) ? e.x
                                                             : e.y;
                }
            }
        };

        this.mouseDragEnded = function (e){
            if (this.pxy != null) {
                this.pxy = null;
            }
            if (this.metrics != null) this.calcRowColAt(e.x, e.y);
        };

        this.mouseMoved = function(e) {
            if (this.metrics != null) {
                this.calcRowColAt(e.x, e.y);
            }
        };

        this.mouseClicked = function (e){
            if (this.pxy     == null     &&
                this.metrics != null     &&
                e.clicks > 1             &&
                this.selectedColRow >= 0 &&
                this.isAutoFit              )
            {
                var size = this.getCaptionPS(this.selectedColRow);
                if (this.orient == L.HORIZONTAL) {
                    this.metrics.setColWidth (this.selectedColRow, size);
                }
                else {
                    this.metrics.setRowHeight(this.selectedColRow, size);
                }
                this.captionResized(this.selectedColRow, size);
            }
        };

        this.getCaptionPS = function(rowcol) {
            return (this.orient == L.HORIZONTAL) ? this.metrics.getColPSWidth(this.selectedColRow)
                                                 : this.metrics.getRowPSHeight(this.selectedColRow);
        };

        this.captionResized = function(rowcol, ns) {
            if (ns > this.minSize) {
                if (this.orient == L.HORIZONTAL) {
                    var pw = this.metrics.getColWidth(rowcol);
                    this.metrics.setColWidth(rowcol, ns);
                    this._.captionResized(this, rowcol, pw);
                }
                else  {
                    var ph = this.metrics.getRowHeight(rowcol);
                    this.metrics.setRowHeight(rowcol, ns);
                    this._.captionResized(this, rowcol, ph);
                }
            }
        };

        this.calcRowColAt = function(x, y){
            var isHor = (this.orient == L.HORIZONTAL), cv = this.metrics.getCellsVisibility();

            if ((isHor && cv.fc != null) || (!isHor && cv.fr != null)){
                var m    = this.metrics,
                    xy   = isHor ? x : y,
                    xxyy = isHor ? cv.fc[1] - this.x + m.getXOrigin() - m.lineSize
                                 : cv.fr[1] - this.y + m.getYOrigin() - m.lineSize;

                for(var i = (isHor ? cv.fc[0] : cv.fr[0]);i <= (isHor ? cv.lc[0] : cv.lr[0]); i ++ )
                {
                    var wh = isHor ? m.getColWidth(i) : m.getRowHeight(i);
                    xxyy += (wh + m.lineSize);
                    if (xy < xxyy + this.activeAreaSize &&
                        xy > xxyy - this.activeAreaSize   )
                    {
                        this.selectedColRow = i;
                        this.selectedXY = xy - wh;
                        return ;
                    }
                }
            }
            this.selectedColRow = -1;
        };

        /**
         * Compute a column (for horizontal caption component) or row (for 
         * vertically aligned caption component) at the given location
         * @param  {Integer} x a x coordinate
         * @param  {Integer} y an y coordinate 
         * @return {Integer}  a row or column 
         * @method calcRowColAt
         */
        this.getCaptionAt = function (x,y){
            if (this.metrics != null &&
                x >= 0               &&
                y >= 0               &&
                x < this.width       &&
                y < this.height        )
            {
                var m = this.metrics,
                    cv = m.getCellsVisibility(),
                    isHor = (this.orient == L.HORIZONTAL);

                if ((isHor && cv.fc != null) || (isHor === false && cv.fr != null)){
                    var gap = m.lineSize, xy = isHor ? x : y,
                        xxyy = isHor ? cv.fc[1] - this.x - gap + m.getXOrigin()
                                     : cv.fr[1] - this.y - gap + m.getYOrigin();

                    for(var i = (isHor ? cv.fc[0] : cv.fr[0]);i <= (isHor ? cv.lc[0] : cv.lr[0]); i ++ ){
                        var wh = isHor ? m.getColWidth(i) : m.getRowHeight(i);
                        if (xy > xxyy && xy < xxyy + wh) return i;
                        xxyy += wh + gap;
                    }
                }
            }
            return -1;
        };


        /**
         * Implement the method to be aware when number of rows or columns in 
         * a grid model has been updated
         * @param  {zebra.ui.grid.Grid} target a target grid
         * @param  {Integer} prevRows a previous number of rows
         * @param  {Integer} prevCols a previous number of columns
         * @method matrixResized
         */


        /**
         * Implement the method to be aware when a grid model data has been 
         * re-ordered.
         * @param  {zebra.ui.grid.Grid} target a target grid
         * @param  {Object} sortInfo an order information
         * @method matrixSorted
         */
    },

    function(titles) {
        this._ = new pkg.CaptionListeners();
        this.orient = this.metrics = this.pxy = null;
        this.selectedXY = 0;
        this.selectedColRow = -1;
        this.$super();
        if (titles != null) {
            for(var i=0; i < titles.length; i++) {
                this.putTitle(i, titles[i]);
            }
        }
    },

    function setParent(p) {
        this.$super(p);

        this.metrics = this.orient = null;
        if (p == null || zebra.instanceOf(p, pkg.Metrics)) {
            this.metrics = p;
            if (this.constraints != null) {
                this.orient = (this.constraints == L.TOP    ||
                               this.constraints == L.BOTTOM   ) ? L.HORIZONTAL
                                                                                          : L.VERTICAL;
            }
        }
    }
]);

/**
 * Grid caption class that implements rendered caption. 
 * Rendered means all caption titles, border are painted 
 * as a number of views. 
 * @param  {Array} a caption titles. Title can be a string or 
 * a zebra.ui.View class instance
 * @constructor
 * @class zebra.ui.grid.GridCaption
 * @extends zebra.ui.grid.BaseCaption
 */
pkg.GridCaption = Class(pkg.BaseCaption, [
    function $prototype() {
        this.getTitleProps = function(i){
            return this.titles != null && i < this.titles.length / 2 ? this.titles[i * 2 + 1]
                                                                     : null;
        };

        /**
         * Get a grid caption column or row title view
         * @param  {Integer} i a row (if the caption is vertical) or 
         * column (if the caption is horizontal) index
         * @return {zebra.ui.View} a view to be used as the given 
         * row or column title view 
         * @method getTitleView
         */
        this.getTitleView = function(i){
            var data = this.getTitle(i);
            if (data == null || data.paint) return data;
            this.render.target.setValue(data.toString());
            return this.render;
        };

        this.calcPreferredSize = function (l) {
            return { width:this.psW, height:this.psH };
        };

        this.recalc = function(){
            this.psW = this.psH = 0;
            if (this.metrics != null){
                var m = this.metrics,
                    isHor = (this.orient == L.HORIZONTAL),
                    size = isHor ? m.getGridCols() : m.getGridRows();
                
                for(var i = 0;i < size; i++){
                    var v = this.getTitleView(i);
                    if (v != null){
                        var ps = v.getPreferredSize();
                        if (isHor){
                            if(ps.height > this.psH) this.psH = ps.height;
                            this.psW += ps.width;
                        }
                        else {
                            if(ps.width > this.psW) this.psW = ps.width;
                            this.psH += ps.height;
                        }
                    }
                }
               
                if (this.psH === 0) this.psH = pkg.Grid.DEF_ROWHEIGHT;
                if (this.psW === 0) this.psW = pkg.Grid.DEF_COLWIDTH;
               
                if (this.borderView != null){
                    this.psW += (this.borderView.getLeft() +
                                 this.borderView.getRight()) * (isHor ? size : 1);
                    this.psH += (this.borderView.getTop() +
                                 this.borderView.getBottom()) * (isHor ? 1 : size);
                }
            }
        };

        this.paint = function(g){
            if(this.metrics != null){
                var cv = this.metrics.getCellsVisibility();
                if (cv.hasVisibleCells() === false) return;

                var m = this.metrics, 
                    isHor = (this.orient == L.HORIZONTAL), gap = m.lineSize,
                    top = 0, left = 0, bottom = 0, right = 0;
                
                if (this.borderView != null){
                    top    += this.borderView.getTop();
                    left   += this.borderView.getLeft();
                    bottom += this.borderView.getBottom();
                    right  += this.borderView.getRight();
                }

                var x = isHor ? cv.fc[1] - this.x + m.getXOrigin() - gap : this.getLeft(),
                    y = isHor ? this.getTop() : cv.fr[1] - this.y + m.getYOrigin() - gap,
                    size = isHor ? m.getGridCols() : m.getGridRows();

                for(var i = (isHor ? cv.fc[0] : cv.fr[0]);i <= (isHor ? cv.lc[0] : cv.lr[0]); i ++ )
                {
                    var wh1 = isHor ? m.getColWidth(i) + gap + (((size - 1) == i) ? gap : 0) : this.psW,
                        wh2 = isHor ? this.psH : m.getRowHeight(i) + gap + (((size - 1) == i) ? gap : 0),
                        v = this.getTitleView(i);

                    if (this.borderView != null) {
                        this.borderView.paint(g, x, y, wh1, wh2, this);
                    }

                    if (v != null) {
                        var props = this.getTitleProps(i), ps = v.getPreferredSize();
                        if(props != null && props[2] != 0){
                            g.setColor(props[2]);
                            g.fillRect(x, y, wh1 - 1, wh2 - 1);
                        }

                        g.save();
                        if (this.borderView &&
                            this.borderView.outline &&
                            this.borderView.outline(g, x, y, wh1, wh2, this))
                        {
                            g.clip();
                        }
                        else {
                            g.clipRect(x, y, wh1, wh2);
                        }

                        var vx = x + L.xAlignment(ps.width, props != null ? props[0] 
                                                                          : L.CENTER, wh1 - left - right) + left,
                            vy = y + L.yAlignment(ps.height, props != null ? props[1] 
                                                                           : L.CENTER, wh2 - top - bottom) + top;

                        v.paint(g, vx, vy, ps.width, ps.height, this);
                        g.restore();
                    }

                    if (isHor) x += wh1;
                    else       y += wh2;
                }
            }
        };

        this.getTitle = function(rowcol){
            return this.titles == null || this.titles.length / 2 <= rowcol ? null
                                                                           : this.titles[rowcol*2];
        };
    },

    function() {
        this.$this(null);
    },

    function(titles) {
        this.psW = this.psH = 0;
        this.render = new ui.TextRender("");
        this.render.setFont(pkg.GridCaption.font);
        this.render.setColor(pkg.GridCaption.fontColor);
        this.$super(titles);
    },

    /**
     * Set grid caption border view. The border view is used to render every cell 
     * of the grid caption. 
     * @param {zebra.ui.View} v a view
     * @method setBorderView
     */
    function setBorderView(v){
        if (v != this.borderView){
            this.borderView = ui.$view(v);
            this.vrp();
        }
    },

    /**
     * Put the given title for the given caption cell. 
     * @param  {Integer} rowcol a grid caption cell index
     * @param  {String|zebra.ui.View} title a title of the given grid caption cell.
     * Can be a string or zebra.ui.View class instance
     * @method putTitle
     */
    function putTitle(rowcol,title){
        var old = this.getTitle(rowcol);
        if (old != title)
        {
            if (this.titles == null) {
                this.titles = arr((rowcol + 1) * 2, null);
            }
            else {
                if (Math.floor(this.titles.length / 2) <= rowcol){
                    var nt = arr((rowcol + 1) * 2, null);
                    zebra.util.arraycopy(this.titles, 0, nt, 0, this.titles.length);
                    this.titles = nt;
                }
            }
            var index = rowcol * 2;
            this.titles[index] = title;
            if (title == null && index + 2 == this.titles.length) {
                var nt = arr(this.titles.length - 2, null);
                zebra.util.arraycopy(this.titles, 0, nt, 0, index);
                this.titles = nt;
            }
            this.vrp();
        }
    },

    /**
     * Set the given grid caption cell title properties such as: vertical and 
     * horizontal alignment, background color. 
     * @param {Integer} rowcol a grid caption cell index
     * @param {Integer} ax     a horizontal alignment of the given cell title. Can
     * be: zebra.layout.LEFT, zebra.layout.CENTER, zebra.layout.RIGHT
     * @param {Integer} ay     a vertical alignment of the given cell title. Can
     * be: zebra.layout.TOP, zebra.layout.CENTER, zebra.layout.BOTTOM
     * @param {String} bg a background color
     * @method  setTitleProps
     */
    function setTitleProps(rowcol,ax,ay,bg){
        var p = this.getTitleProps(rowcol);
        if (p == null) p = [];
        p[0] = ax;
        p[1] = ay;
        p[2] = bg == null ? 0 : bg.getRGB();
        this.titles[rowcol*2 + 1] = p;
        this.repaint();
    },

    function getCaptionPS(rowcol) {
        var size = this.$super(rowcol),
            v    = this.getTitleView(this.selectedColRow),
            bv   = this.borderView;

        if (bv != null) {
            size = size + ((this.orient == L.HORIZONTAL) ? bv.getLeft() + bv.getRight() 
                                                         : bv.getTop()  + bv.getBottom());
        }

        if (v != null) {
            size = Math.max(size, (this.orient == L.HORIZONTAL) ? v.getPreferredSize().width
                                                                : v.getPreferredSize().height);
        }

        return size;
    }
]);

/**
 * Grid caption class that implements component based caption. 
 * Component based caption uses other UI component as the 
 * caption titles. 
 * @param  {Array} a caption titles. Title can be a string or 
 * a zebra.ui.Panel class instance
 * @constructor
 * @class zebra.ui.grid.CompGridCaption
 * @extends zebra.ui.grid.BaseCaption
 */
pkg.CompGridCaption = Class(pkg.BaseCaption, ui.Composite, [
    function $clazz() {
        this.Layout = Class(L.Layout, [
            function $prototype() {
                this.doLayout = function (target) {
                    var ps   = L.getMaxPreferredSize(target),
                        m    = target.metrics,
                        b    = target.orient == L.HORIZONTAL,
                        top  = target.getTop(),
                        left = target.getLeft(),
                        xy   = b ? left + m.getXOrigin() : top + m.getYOrigin();
                    
                    for(var i=0; i < target.kids.length; i++) {
                        var kid = target.kids[i], 
                            cwh = (b ? m.getColWidth(i) : m.getRowHeight(i)) + m.lineSize;
                       
                        if (i === 0) cwh += m.lineSize;
                       
                        if (kid.isVisible) {
                            if (b) { 
                                kid.setLocation(xy, top);
                                kid.setSize(cwh, ps.height);
                            }
                            else {
                                kid.setLocation(left, xy);
                                kid.setSize(ps.width, cwh);
                            }
                        }
                        xy += cwh;
                    }
                };

                this.calcPreferredSize = function (target) {
                    return L.getMaxPreferredSize(target);
                };
            }
        ]);

        this.Link = Class(ui.Link, []);

        this.StatePan = Class(ui.ViewPan, []);

        /**
         * Title panel that is designed to be used as 
         * CompGridCaption UI component title element. 
         * The panel keeps a grid column or row title, 
         * a column or row sort indicator. Using the 
         * component you can have sortable grid columns.
         * @constructor
         * @param {String} a grid column or row title
         * @class zebra.ui.grid.CompGridCaption.TitlePan
         */
        this.TitlePan = Class(ui.Panel, [
            function(title) {
                this.$super(new L.FlowLayout(L.CENTER, L.CENTER, L.HORIZONTAL, 8));

                this.sortState  = 0;

                /**
                 * Indicates if the title panel has to initiate a column sorting
                 * @default false
                 * @attribute isSortable
                 * @type {Boolean}
                 */
                this.isSortable = false;
                
                this.link = new pkg.CompGridCaption.Link(title);

                this.statePan = new pkg.CompGridCaption.StatePan();
                this.statePan.setVisible(this.isSortable);
                // this.statePan.setView(new ui.ViewSet({
                //     "ascent" : new ui.ArrowView(L.TOP),
                //     "descent": new ui.ArrowView(L.BOTTOM),
                //     "*"      : new ui.ArrowView(L.LEFT)
                // }));

                this.add(this.link);
                this.add(this.statePan);
            },

            function getGridCaption() {
                var c = this.parent;
                while(c != null && zebra.instanceOf(c, pkg.BaseCaption) === false) {
                    c = c.parent;
                }
                return c;
            },

            function matrixSorted(target, info) {
                if (this.isSortable) {
                    var col = this.parent.indexOf(this);
                    if (info.col == col) {
                        this.sortState = info.name == 'descent' ? 1 : -1; 
                        this.statePan.view.activate(info.name);
                    }
                    else {
                        this.sortState = 0;
                        this.statePan.view.activate("*");
                    }
                }
            },

            function matrixResized(target,prevRows,prevCols){
                if (this.isSortable) {
                    this.sortState = 0;
                    this.statePan.view.activate("*");
                }
            },

            function fired(target) {
                if (this.isSortable) {
                    var f = this.sortState == 1 ? zebra.data.ascent 
                                                 : zebra.data.descent,
                        model = this.getGridCaption().metrics.model, 
                        col   = this.parent.indexOf(this);

                    model.sortCol(col, f);
                }
            },

            function kidRemoved(index, kid) {
                if (zebra.instanceOf(kid, zebra.util.Actionable)) {
                    kid._.remove(this);
                }                
                this.$super(index, kid);
            },

            function kidAdded(index, constr, kid) {
                if (zebra.instanceOf(kid, zebra.util.Actionable)) {
                    kid._.add(this);
                }
                this.$super(index, constr, kid);
            }
        ]);
    },

    /**
     * @for zebra.ui.grid.CompGridCaption
     */

    function $prototype() {
        this.catchInput = function(t) {
            return zebra.instanceOf(t, zebra.util.Actionable) === false;
        };        

        this.scrolled = function() {
            this.vrp();
        };

        /**
         * Put the given title component for the given caption cell. 
         * @param  {Integer} rowcol a grid caption cell index
         * @param  {String|zebra.ui.Panel} title a title of the given grid caption cell.
         * Can be a string or zebra.ui.Panel class instance
         * @method putTitle
         */
        this.putTitle = function(rowcol, t) {
            for(var i = this.kids.length-1; i < rowcol; i++) {
                this.add(t);
            }

            if (rowcol < this.kids.length) {
                this.removeAt(rowcol);
            }

            this.insert(rowcol, null, t);
        };

        this.setSortable = function(col, b) {
            var c = this.kids[col];
            if (c.isSortable != b) {
                c.isSortable = b;
                c.statePan.setVisible(b);
            }
        };

        this.matrixSorted = function(target, info) {
            for(var i=0; i < this.kids.length; i++) {
                if (this.kids[i].matrixSorted) {
                    this.kids[i].matrixSorted(target, info);
                }
            }
        };

        this.matrixResized = function(target,prevRows,prevCols){
            for(var i=0; i < this.kids.length; i++) {
                if (this.kids[i].matrixResized) {
                    this.kids[i].matrixResized(target,prevRows,prevCols);
                }
            }
        };
    },

    function() {
        this.$this(null);
    },

    function(titles) {
        this.$super(titles);
        this.setLayout(new pkg.CompGridCaption.Layout());
    },

    function captionResized(rowcol, ns) {
        this.$super(rowcol, ns);
        this.vrp();
    },

    function setParent(p) {
        if (this.parent != null && this.parent.scrollManager != null) {
            this.parent.scrollManager._.remove(this);
        }

        if (p != null && p.scrollManager != null) {
            p.scrollManager._.add(this);
        }

        this.$super(p);
    },

    function insert(i,constr, c) {
        if (zebra.isString(c)) {
            c = new pkg.CompGridCaption.TitlePan(c);
        }
        this.$super(i,constr, c);
    }
]);


/**
 * Grid UI component class. The grid component visualizes "zebra.data.Matrix" data model.
 * Grid cell visualization can be customized by defining and setting an own view provider.
 * Grid component supports cell editing. Every existent UI component can be configured 
 * as a cell editor by defining an own editor provider. 
 *
 * Grid can have top and left captions.
 * @class  zebra.ui.grid.Grid
 * @constructor
 * @param {zebra.data.Matrix|Array} [model] a matrix model to be visualized with the grid 
 * component. It can be an instance of zebra.data.Matrix class or an array that contains 
 * embedded arrays. Every embedded array is a grid row. 
 * @param {Integer} [rows]  a number of rows 
 * @param {Integer} [columns] a number of columns
 * @extends {zebra.ui.Panel} 
 * @uses zebra.ui.grid.Metrics
 */

/**
 * Fire when a grid row selection state has been changed
 
        grid._.add(function(grid, row, count, status) {
            ... 
        });

 * @event rowSelected
 * @param  {zebra.ui.grid.Grid} grid a grid that triggers the event
 * @param  {Integer} row a first row whose selection state has been updated. The row is 
 * -1 if all selected rows have been unselected
 * @param  {Integer} count a number of rows whose selection state has been updated
 * @param {Boolean} status a status. true means rows have been selected 
 */
pkg.Grid = Class(ui.Panel, ui.MouseListener, ui.KeyListener,
                 Position.Metric, ui.ChildrenListener,
                 ui.WinListener, pkg.Metrics, [
      
        function $clazz() {
            this.DEF_COLWIDTH  = 80;
            this.DEF_ROWHEIGHT = 25;
            this.CornerPan = Class(ui.Panel, []);
        },

        function $prototype() {
            /**
             * Grid line size
             * @attribute lineSize
             * @default 1
             * @type {Integer}
             */

            /**
             * Grid cell top padding
             * @attribute cellInsetsTop
             * @default 1
             * @type {Integer}
             * @readOnly
             */

            /**
             * Grid cell left padding
             * @attribute cellInsetsLeft
             * @default 2
             * @type {Integer}
             * @readOnly
             */

            /**
             * Grid cell bottom padding
             * @attribute cellInsetsBottom
             * @default 1
             * @type {Integer}
             * @readOnly
             */

            /**
             * Grid cell right padding
             * @attribute cellInsetsRight
             * @default 2
             * @type {Integer}
             * @readOnly
             */
            this.lineSize = this.cellInsetsTop = this.cellInsetsBottom = 1;
            this.cellInsetsLeft = this.cellInsetsRight = 2;

            /**
             * Indicate if vertical lines have to be rendered
             * @attribute drawVerLines
             * @type {Boolean}
             * @readOnly
             * @default true
             */
            
            /**
             * Indicate if horizontal lines have to be rendered
             * @attribute drawHorLines
             * @type {Boolean}
             * @readOnly
             * @default true
             */
            this.drawVerLines = this.drawHorLines = true;

            /**
             * Line color
             * @attribute lineColor
             * @type {String}
             * @default gray
             * @readOnly
             */
            this.lineColor = "gray";

            /**
             * Indicate if size of grid cells have to be calculated 
             * automatically basing on its preferred heights and widths
             * @attribute isUsePsMetric
             * @type {Boolean}
             * @default false
             * @readOnly
             */
            this.isUsePsMetric = false;

            this.getColX_ = function (col){
                var start = 0, d = 1, x = this.getLeft() + this.getLeftCaptionWidth() + this.lineSize, v = this.visibility;
                if (v.hasVisibleCells()){
                    start = v.fc[0];
                    x = v.fc[1];
                    d = (col > v.fc[0]) ? 1 :  - 1;
                }
                for(var i = start;i != col; x += ((this.colWidths[i] + this.lineSize) * d),i += d);
                return x;
            };

            this.getRowY_ = function (row){
                var start = 0, d = 1, y = this.getTop() + this.getTopCaptionHeight() + this.lineSize, v = this.visibility;
                if (v.hasVisibleCells()){
                    start = v.fr[0];
                    y = v.fr[1];
                    d = (row > v.fr[0]) ? 1 :  - 1;
                }
                for(var i = start;i != row; y += ((this.rowHeights[i] + this.lineSize) * d),i += d);
                return y;
            };

            this.rPs = function(){
                var cols = this.getGridCols(), rows = this.getGridRows();
                this.psWidth_ = this.lineSize * (cols + 1);
                this.psHeight_ = this.lineSize * (rows + 1);
                for(var i = 0;i < cols; i ++ ) this.psWidth_ += this.colWidths[i];
                for(var i = 0;i < rows; i ++ ) this.psHeight_ += this.rowHeights[i];
            };

            this.colVisibility = function(col,x,d,b){
                var cols = this.getGridCols();
                if(cols === 0) return null;
                var left = this.getLeft(), dx = this.scrollManager.getSX(),
                    xx1 = Math.min(this.visibleArea.x + this.visibleArea.width, this.width - this.getRight()),
                    xx2 = Math.max(left, this.visibleArea.x + this.getLeftCaptionWidth());

                for(; col < cols && col >= 0; col += d){
                    if(x + dx < xx1 && (x + this.colWidths[col] + dx) > xx2){
                        if (b) return [col, x];
                    }
                    else {
                        if (b === false) return this.colVisibility(col, x, (d > 0 ?  -1 : 1), true);
                    }
                    if (d < 0){
                        if (col > 0) x -= (this.colWidths[col - 1] + this.lineSize);
                    }
                    else {
                        if (col < cols - 1) x += (this.colWidths[col] + this.lineSize);
                    }
                }
                return b ? null : ((d > 0) ? [col -1, x] : [0, left + this.getLeftCaptionWidth() + this.lineSize]);
            };

            this.rowVisibility = function(row,y,d,b){
                var rows = this.getGridRows();

                if (rows === 0) return null;
                var top = this.getTop(), dy = this.scrollManager.getSY(),
                    yy1 = Math.min(this.visibleArea.y + this.visibleArea.height, this.height - this.getBottom()),
                    yy2 = Math.max(this.visibleArea.y, top + this.getTopCaptionHeight());

                for(; row < rows && row >= 0; row += d){
                    if(y + dy < yy1 && (y + this.rowHeights[row] + dy) > yy2){
                        if(b) return [row, y];
                    }
                    else{
                        if(b === false) return this.rowVisibility(row, y, (d > 0 ?  -1 : 1), true);
                    }
                    if(d < 0){
                        if(row > 0) y -= (this.rowHeights[row - 1] + this.lineSize);
                    }
                    else{
                        if(row < rows - 1) y += (this.rowHeights[row] + this.lineSize);
                    }
                }
                return b ? null : ((d > 0) ? [row - 1, y]
                                           : [0, top + this.getTopCaptionHeight() + this.lineSize]);
            };

            this.vVisibility = function(){
                var va = ui.$cvp(this, {});
                if (va == null) {
                    this.visibleArea = null;
                    this.visibility.cancelVisibleCells();
                    return;
                }
                else {
                    if (this.visibleArea == null            ||
                        va.x != this.visibleArea.x          ||
                        va.y != this.visibleArea.y          ||
                        va.width  != this.visibleArea.width ||
                        va.height != this.visibleArea.height  )
                    {
                        this.iColVisibility(0);
                        this.iRowVisibility(0);
                        this.visibleArea = va;
                    }
                }

                var v = this.visibility, b = v.hasVisibleCells();
                if (this.colOffset != 100) {
                    if (this.colOffset > 0 && b){
                        v.lc = this.colVisibility(v.lc[0], v.lc[1],  -1, true);
                        v.fc = this.colVisibility(v.lc[0], v.lc[1],  -1, false);
                    }
                    else {
                        if (this.colOffset < 0 && b){
                            v.fc = this.colVisibility(v.fc[0], v.fc[1], 1, true);
                            v.lc = this.colVisibility(v.fc[0], v.fc[1], 1, false);
                        }
                        else {
                            v.fc = this.colVisibility(0, this.getLeft() + this.lineSize +
                                                         this.getLeftCaptionWidth(), 1, true);
                            v.lc = (v.fc != null) ? this.colVisibility(v.fc[0], v.fc[1], 1, false) 
                                                  : null;
                        }
                    }
                    this.colOffset = 100;
                }

                if (this.rowOffset != 100)
                {
                    if (this.rowOffset > 0 && b) {
                        v.lr = this.rowVisibility(v.lr[0], v.lr[1],  -1, true);
                        v.fr = this.rowVisibility(v.lr[0], v.lr[1],  -1, false);
                    }
                    else {
                        if(this.rowOffset < 0 && b){
                            v.fr = this.rowVisibility(v.fr[0], v.fr[1], 1, true);
                            v.lr = (v.fr != null) ? this.rowVisibility(v.fr[0], v.fr[1], 1, false) : null;
                        }
                        else {
                            v.fr = this.rowVisibility(0, this.getTop() + this.getTopCaptionHeight() + this.lineSize, 1, true);
                            v.lr = (v.fr != null) ? this.rowVisibility(v.fr[0], v.fr[1], 1, false) : null;
                        }
                    }
                    this.rowOffset = 100;
                }
            };

            this.calcOrigin = function(off,y){
                var top  = this.getTop()  + this.getTopCaptionHeight(), 
                    left = this.getLeft() + this.getLeftCaptionWidth(),
                    o    = ui.calcOrigin(this.getColX(0) - this.lineSize, 
                                         y - this.lineSize,
                                         this.psWidth_,
                                         this.rowHeights[off] + 2*this.lineSize, 
                                         this.scrollManager.getSX(),
                                         this.scrollManager.getSY(),
                                         this, top, left,
                                         this.getBottom(), 
                                         this.getRight());
                this.scrollManager.scrollTo(o[0], o[1]);
            };

            this.$se = function(row,col,e) {
                if (row >= 0) {
                    this.stopEditing(true);
                    if (this.editors != null && 
                        this.editors.shouldDo(pkg.START_EDITING, row, col, e)) 
                    {
                        return this.startEditing(row, col);
                    }
                }
                return false;
            };

            this.getXOrigin = function() {
                return this.scrollManager.getSX();
            };
            
            this.getYOrigin = function () {
                return this.scrollManager.getSY();
            };
            
            /**
             * Get a preferred width the given column wants to have
             * @param  {Integer} col a column 
             * @return {Integer} a preferred width of the given column
             * @method getColPSWidth 
             */
            this.getColPSWidth = function(col){
                return this.getPSSize(col, false);
            };
            
            /**
             * Get a preferred height the given row wants to have
             * @param  {Integer} col a row 
             * @return {Integer} a preferred height of the given row
             * @method getRowPSHeight 
             */
            this.getRowPSHeight = function(row) {
                return this.getPSSize(row, true);
            };

            this.recalc = function(){
                if (this.isUsePsMetric) {
                    this.rPsMetric();
                }
                else {
                    this.rCustomMetric();
                }
                this.rPs();
            };

            /**
             * Get number of rows in the given grid
             * @return {Integer} a number of rows
             * @method getGridRows
             */
            this.getGridRows = function() {
                return this.model != null ? this.model.rows : 0;
            };

            /**
             * Get number of columns in the given grid
             * @return {Integer} a number of columns
             * @method getGridColumns
             */
            this.getGridCols = function(){
                return this.model != null ? this.model.cols : 0;
            };

            /**
             * Get the  given grid row height
             * @param  {Integer} row a grid row
             * @return {Integer} a height of the given row
             * @method getRowHeight
             */
            this.getRowHeight = function(row){
                this.validateMetric();
                return this.rowHeights[row];
            };

            /**
             * Get the given grid column width
             * @param  {Integer} col a grid column
             * @return {Integer} a width of the given column
             * @method getColWidth
             */
            this.getColWidth = function(col){
                this.validateMetric();
                return this.colWidths[col];
            };

            this.getCellsVisibility = function(){
                this.validateMetric();
                return this.visibility;
            };

            /**
             * Get the given column top-left corner x coordinate
             * @param  {Integer} col a column
             * @return {Integer} a top-left corner x coordinate of the given column
             * @method getColX
             */
            this.getColX = function (col){
                this.validateMetric();
                return this.getColX_(col);
            };

            /**
             * Get the given row top-left corner y coordinate
             * @param  {Integer} row a row
             * @return {Integer} a top-left corner y coordinate 
             * of the given column
             * @method getColX
             */
            this.getRowY = function (row){
                this.validateMetric();
                return this.getRowY_(row);
            };

            this.childInputEvent = function(e){
                if (this.editingRow >= 0) {
                    if (this.editors.shouldDo(pkg.CANCEL_EDITING, 
                                              this.editingRow, 
                                              this.editingCol, e)) 
                    {
                        this.stopEditing(false);
                    }
                    else 
                    {
                        if (this.editors.shouldDo(pkg.FINISH_EDITING, 
                                                  this.editingRow, 
                                                  this.editingCol, e)) 
                        {
                            this.stopEditing(true);
                        }
                    }
                }
            };

            this.dataToPaint = function(row,col) {
                return this.model.get(row, col);
            };

            this.iColVisibility = function(off) {
                this.colOffset = (this.colOffset == 100) ? this.colOffset = off 
                                                         : ((off != this.colOffset) ? 0 : this.colOffset);
            };

            this.iRowVisibility = function(off) {
                this.rowOffset = (this.rowOffset == 100) ? off 
                                                         : (((off + this.rowOffset) === 0) ? 0 : this.rowOffset);
            };

            /**
             * Get top grid caption height. Return zero if no top caption element has been defined
             * @return {Integer} a top caption height
             * @protected
             * @method  getTopCaptionHeight
             */
            this.getTopCaptionHeight = function(){
                return (this.topCaption != null && this.topCaption.isVisible) ? this.topCaption.height : 0;
            };

            /**
             * Get left grid caption width. Return zero if no left caption element has been defined
             * @return {Integer} a left caption width
             * @protected
             * @method  getLeftCaptionWidth
             */
            this.getLeftCaptionWidth = function(){
                return (this.leftCaption != null && this.leftCaption.isVisible) ? this.leftCaption.width : 0;
            };

            this.paint = function(g){
                this.vVisibility();
                if (this.visibility.hasVisibleCells()) {
                    var dx = this.scrollManager.getSX(), 
                        dy = this.scrollManager.getSY(), 
                        th = this.getTopCaptionHeight(),
                        tw = this.getLeftCaptionWidth();

                    try {
                        g.save();
                        g.translate(dx, dy);
                        
                        if (th > 0 || tw > 0) {
                            g.clipRect(tw - dx, th - dy, this.width  - tw, this.height - th);
                        }

                        this.paintSelection(g);
                        this.paintData(g);
                        if (this.drawHorLines || this.drawVerLines) this.paintNet(g);
                        this.paintMarker(g);
                    }
                    finally {
                        g.restore();
                    }
                }
            };

            this.catchScrolled = function (psx, psy){
                var offx = this.scrollManager.getSX() - psx, 
                    offy = this.scrollManager.getSY() - psy;
                
                if (offx !== 0) {
                    this.iColVisibility(offx > 0 ? 1 :  - 1);
                }
                if (offy !== 0) {
                    this.iRowVisibility(offy > 0 ? 1 :  - 1);
                }
                this.stopEditing(false);
                this.repaint();
            };

            this.isInvalidatedByChild = function (c){
                return c != this.editor || this.isUsePsMetric; 
            };

            /**
             * Stop editing a grid cell.
             * @param  {Boolean} applyData true if the edited data has to be applied as a new 
             * grid cell content
             * @protected
             * @method stopEditing
             */
            this.stopEditing = function(applyData){
                if (this.editors != null && 
                    this.editingRow >= 0 && 
                    this.editingCol >= 0   )
                {
                    try {
                        if (zebra.instanceOf(this.editor, pkg.Grid)) { 
                            this.editor.stopEditing(applyData);
                        }

                        var data = this.getDataToEdit(this.editingRow, this.editingCol);
                        if (applyData){
                            this.setEditedData(this.editingRow, 
                                               this.editingCol, 
                                               this.editors.fetchEditedValue(this.editingRow, 
                                                                             this.editingCol, 
                                                                             data, this.editor));
                        }
                        else { 
                            this.editors.editingCanceled(this.editingRow, this.editingCol, data, this.editor);
                        }
                        this.repaintRows(this.editingRow, this.editingRow);
                    }
                    finally {
                        this.editingCol = this.editingRow = -1;
                        if (this.indexOf(this.editor) >= 0) {
                            this.remove(this.editor);
                        }
                        this.editor = null;
                        this.requestFocus();
                    }
                }
            };

            /**
             * Set if horizontal and vertical lines have to be painted
             * @param {Boolean} hor true if horizontal lines have to be painted
             * @param {Boolean} ver true if vertical lines have to be painted
             * @method setDrawLines
             */
            this.setDrawLines = function(hor, ver){
                if (this.drawVerLines != hor || this.drawHorLines != ver) {
                    this.drawHorLines = hor;
                    this.drawVerLines = ver;
                    this.repaint();
                }
            };

            this.getLines = function (){ return this.getGridRows(); };
            this.getLineSize = function (line){ return 1; };
            this.getMaxOffset = function (){ return this.getGridRows() - 1; };

            this.posChanged = function (target,prevOffset,prevLine,prevCol){
                var off = this.position.currentLine;
                if (off >= 0) {
                    this.calcOrigin(off, this.getRowY(off));
                    this.select(off, true);
                    this.repaintRows(prevOffset, off);
                }
            };

            this.makeRowVisible = function(row) {
                this.calcOrigin(row, this.getRowY(row));
                this.repaint();
            };

            this.keyPressed = function(e){
                if (this.position != null){
                    var cl = this.position.currentLine;
                    switch(e.code) {
                        case KE.LEFT    : this.position.seek( - 1);break;
                        case KE.UP      : this.position.seekLineTo(Position.UP);break;
                        case KE.RIGHT   : this.position.seek(1);break;
                        case KE.DOWN    : this.position.seekLineTo(Position.DOWN);break;
                        case KE.PAGEUP  : this.position.seekLineTo(Position.UP, this.pageSize(-1));break;
                        case KE.PAGEDOWN: this.position.seekLineTo(Position.DOWN, this.pageSize(1));break;
                        case KE.END     : if (e.isControlPressed()) this.position.setOffset(this.getLines() - 1);break;
                        case KE.HOME    : if (e.isControlPressed()) this.position.setOffset(0);break;
                    }
                    this.$se(this.position.currentLine, this.position.currentCol, e);
                    if (cl != this.position.currentLine && cl >= 0){
                        for(var i = 0;i < this.getGridRows(); i++){
                            if(i != this.position.currentLine) this.select(i, false);
                        }
                    }
                }
            };

            /**
             * Checks if the given grid row is selected
             * @param  {Inetger}  row a grid row
             * @return {Boolean}  true if the given row is selected
             * @method isSelected
             */
            this.isSelected = function(row){ 
                return (this.selected == null) ? row == this.selectedIndex 
                                               : this.selected[row] > 0; 
            };

            /**
             * Repaint range of grid rows
             * @param  {Integer} r1 the first row to be repainted
             * @param  {Integer} r2 the last row to be repainted
             * @method repaintRows
             */
            this.repaintRows = function (r1,r2){
                if (r1 < 0) r1 = r2;
                if (r2 < 0) r2 = r1;
                if (r1 > r2){
                    var i = r2;
                    r2 = r1;
                    r1 = i;
                }
                var rows = this.getGridRows();
                if (r1 < rows){
                    if (r2 >= rows) r2 = rows - 1;
                    var y1 = this.getRowY(r1), y2 = ((r1 == r2) ? y1 : this.getRowY(r2)) + this.rowHeights[r2];
                    this.repaint(0, y1 + this.scrollManager.getSY(), this.width, y2 - y1);
                }
            };

            /**
             * Detect a cell by the given location
             * @param  {Integer} x a x coordinate relatively the grid component
             * @param  {Integer} y a y coordinate relatively the grid component
             * @return {Array} an array that contains detected grid cell row as 
             * the first element and a grid column as the second element. The 
             * row and column values are set to -1 if no grid cell can be found 
             * at the given location
             * @method cellByLocation
             */
            this.cellByLocation = function(x,y){
                this.validate();
                var dx  = this.scrollManager.getSX(), 
                    dy  = this.scrollManager.getSY(), 
                    v   = this.visibility,
                    ry1 = v.fr[1] + dy, 
                    rx1 = v.fc[1] + dx, 
                    row = -1, 
                    col = -1,
                    ry2 = v.lr[1] + this.rowHeights[v.lr[0]] + dy,
                    rx2 = v.lc[1] + this.colWidths[v.lc[0]] + dx;

                if (y > ry1 && y < ry2) {
                    for(var i = v.fr[0];i <= v.lr[0]; ry1 += this.rowHeights[i] + this.lineSize,i ++ ){
                        if (y > ry1 && y < ry1 + this.rowHeights[i]) {
                            row = i;
                            break;
                        }
                    }
                }
                if (x > rx1 && x < rx2){
                    for(var i = v.fc[0];i <= v.lc[0]; rx1 += this.colWidths[i] + this.lineSize, i++ ){
                        if (x > rx1 && x < rx1 + this.colWidths[i]) {
                            col = i;
                            break;
                        }
                    }
                }
                return (col >= 0 && row >= 0) ? [row, col] : null;
            };

            this.doLayout = function(target) {
                var topHeight = (this.topCaption != null && 
                                 this.topCaption.isVisible) ? this.topCaption.getPreferredSize().height : 0,
                    leftWidth = (this.leftCaption != null && 
                                 this.leftCaption.isVisible) ? this.leftCaption.getPreferredSize().width : 0;

                if (this.topCaption != null){
                    this.topCaption.setLocation(this.getLeft() + leftWidth, this.getTop());
                    this.topCaption.setSize(Math.min(target.width - this.getLeft() - this.getRight() - leftWidth,
                                                     this.psWidth_),
                                            topHeight);
                }

                if(this.leftCaption != null){
                    this.leftCaption.setLocation(this.getLeft(), this.getTop() + topHeight);
                    this.leftCaption.setSize(leftWidth,
                                             Math.min(target.height - this.getTop() - this.getBottom() - topHeight,
                                                      this.psHeight_));
                }

                if (this.stub != null && this.stub.isVisible)
                {
                    if (this.topCaption  != null && this.topCaption.isVisible && 
                        this.leftCaption != null && this.leftCaption.isVisible   ) 
                    {
                        this.stub.setLocation(this.getLeft(), this.getTop());
                        this.stub.setSize(this.topCaption.x - this.stub.x, 
                                          this.leftCaption.y - this.stub.y);
                    }
                    else {
                        this.stub.setSize(0, 0);   
                    }
                }

                if (this.editors != null && 
                    this.editor != null && 
                    this.editor.parent == this && 
                    this.editor.isVisible)
                {
                    var w = this.colWidths[this.editingCol], 
                        h = this.rowHeights[this.editingRow],
                        x = this.getColX_(this.editingCol), 
                        y = this.getRowY_(this.editingRow);

                    if (this.isUsePsMetric){
                        x += this.cellInsetsLeft;
                        y += this.cellInsetsTop;
                        w -= (this.cellInsetsLeft + this.cellInsetsRight);
                        h -= (this.cellInsetsTop + this.cellInsetsBottom);
                    }
                    this.editor.setLocation(x + this.scrollManager.getSX(), 
                                            y + this.scrollManager.getSY());
                    this.editor.setSize(w, h);
                }
            };

            this.canHaveFocus = function (){ 
                return this.editor == null; 
            };

            /**
             * Clear grid row or rows selection
             * @method clearSelect
             */
            this.clearSelect = function (){
                if(this.selectedIndex >= 0){
                    var prev = this.selectedIndex;
                    this.selectedIndex =  - 1;
                    this._.fired(this, -1, 0, false);
                    this.repaintRows(-1, prev);
                }
            };

            /**
             * Mark as selected or unselected the given grid row.
             * @param  {Integer} row a grid row
             * @param  {boolean} [b] a selection status. true if the parameter 
             * has not been specified 
             * @method select
             */
            this.select = function (row, b){
                if (b == null) b = true;

                if(this.isSelected(row) != b){
                    if(this.selectedIndex >= 0) this.clearSelect();
                    if (b) {
                        this.selectedIndex = row;
                        this._.fired(this, row, 1, b);
                    }
                }
            };

            this.laidout = function () { 
                this.vVisibility(); 
            };

            this.mouseClicked  = function(e) { 
                this.pressedRow =  -1;
                if (this.visibility.hasVisibleCells()){
                    this.stopEditing(true);

                    if (e.isActionMask()){
                        var p = this.cellByLocation(e.x, e.y);
                        if (p != null){
                            if(this.position != null){
                                var off = this.position.currentLine;
                                if (off == p[0]) {
                                    this.calcOrigin(off, this.getRowY(off));
                                }
                                else {
                                    this.clearSelect();
                                    this.position.setOffset(p[0]);
                                }
                            }

                            if (this.$se(p[0], p[1], e) === false){
                                this.pressedRow = p[0];
                                this.pressedCol = p[1];
                            }
                        }
                    }
                }

                // !!! most likely it is buggy !
                // if (this.$se(this.pressedRow, this.pressedCol, e)) {
                //     this.pressedRow =  -1; 
                // }
            };
            
            this.calcPreferredSize = function (target){
                return { 
                    width : this.psWidth_  + 
                           ((this.leftCaption != null  && 
                             this.leftCaption.isVisible  ) ? this.leftCaption.getPreferredSize().width : 0),
                    height: this.psHeight_ + 
                           ((this.topCaption != null  && 
                             this.topCaption.isVisible  ) ? this.topCaption.getPreferredSize().height : 0) 
                };
            };

            /**
             * Paint vertical and horizontal grid component lines
             * @param  {2DContext} g a HTML5 canvas 2d context 
             * @method paintNet
             * @protected
             */
            this.paintNet = function(g){
                var v = this.visibility, 
                    topX = v.fc[1] - this.lineSize,
                    topY = v.fr[1] - this.lineSize,
                    botX = v.lc[1] + this.colWidths[v.lc[0]], 
                    botY = v.lr[1] + this.rowHeights[v.lr[0]],
                    prevWidth = g.lineWidth;

                g.setColor(this.lineColor);
                g.lineWidth = this.lineSize;
                g.beginPath();

                if (this.drawHorLines) {
                    var y = topY + this.lineSize/2;
                    for(var i = v.fr[0];i <= v.lr[0]; i ++ ){
                        g.moveTo(topX, y)
                        g.lineTo(botX, y);
                        y += this.rowHeights[i] + this.lineSize;
                    }
                    g.moveTo(topX, y);
                    g.lineTo(botX, y);
                }

                if (this.drawVerLines) {
                    topX += this.lineSize/2;
                    for(var i = v.fc[0];i <= v.lc[0]; i ++ ){
                        g.moveTo(topX, topY);
                        g.lineTo(topX, botY);
                        topX += this.colWidths[i] + this.lineSize;
                    }
                    g.moveTo(topX, topY);
                    g.lineTo(topX, botY);
                }
                g.stroke();
                g.lineWidth = prevWidth;
            };

            /**
             * Paint grid data
             * @param  {2DContext} g a HTML5 canvas 2d context 
             * @method paintData
             * @protected
             */
            this.paintData = function(g){
                var y    = this.visibility.fr[1] + this.cellInsetsTop, 
                    addW = this.cellInsetsLeft + this.cellInsetsRight,
                    addH = this.cellInsetsTop + this.cellInsetsBottom, 
                    ts   = g.getTopStack(), cx = ts.x, cy = ts.y,
                    cw = ts.width, ch = ts.height, res = {};

                //!!!!
                //var desk = this.getCanvas();
                // var can  = document.createElement("canvas")
                // var gg   = can.getContext("2d"), ggg = g, g = gg;
                // gg.init();
                // can.width  = this.visibility.lc[1] - this.visibility.fc[1];
                // can.height = this.visibility.lr[1] - y;
                // gg.fillStyle = "red";
                // gg.fillRect(0, 0, can.width, can.height);

                for(var i = this.visibility.fr[0];i <= this.visibility.lr[0] && y < cy + ch; i++){
                    if(y + this.rowHeights[i] > cy){
                        var x = this.visibility.fc[1] + this.cellInsetsLeft, 
                            notSelectedRow = this.isSelected(i) === false;

                        for(var j = this.visibility.fc[0];j <= this.visibility.lc[0]; j ++ ){
                            if (notSelectedRow){
                                var bg = this.provider.getCellColor ? this.provider.getCellColor(this, i, j)
                                                                    : null;
                                if (bg != null){
                                    g.setColor(bg);
                                    g.fillRect(x - this.cellInsetsLeft,
                                               y - this.cellInsetsTop,
                                               this.colWidths[j], this.rowHeights[i]);
                                }
                            }

                            var v = (i == this.editingRow && 
                                     j == this.editingCol    ) ? null
                                                              : this.provider.getView(this, i, j, 
                                                                                       this.model.get(i, j)); //!!! tree grid dataToPaint has to be called 
                            if (v != null){
                                var w = this.colWidths[j] - addW,
                                    h = this.rowHeights[i] - addH;
                                
                                //MB.intersection(x, y, w, h, cx, cy, cw, ch, res);
                                res.x = x > cx ? x : cx;
                                res.width = Math.min(x + w, cx + cw) - res.x;
                                res.y = y > cy ? y : cy;
                                res.height = Math.min(y + h, cy + ch) - res.y;

                                if (res.width > 0 && res.height > 0) {
                                    if (this.isUsePsMetric) {
                                        v.paint(g, x, y, w, h, this);
                                    }
                                    else 
                                    {
                                        var ax = this.provider.getXAlignment ? this.provider.getXAlignment(this, i, j)
                                                                             : L.LEFT, 
                                            ay = this.provider.getYAlignment ? this.provider.getYAlignment(this, i, j)
                                                                             : L.CENTER,
                                            vw = w, vh = h, xx = x, yy = y, id = -1,
                                            ps = (ax != L.NONE || ay != L.NONE) ? v.getPreferredSize()
                                                                                : null;

                                        if (ax != L.NONE){
                                            xx = x + ((ax == L.CENTER) ? ~~((w - ps.width) / 2) 
                                                                       : ((ax == L.RIGHT) ? w - ps.width : 0));
                                            vw = ps.width;
                                        }

                                        if (ay != L.NONE){
                                            yy = y + ((ay == L.CENTER) ? ~~((h - ps.height) / 2) 
                                                                       : ((ay == L.BOTTOM) ? h - ps.height : 0));

                                            vh = ps.height;
                                        }

                                        if (xx < res.x || yy < res.y || (xx + vw) > (x + w) ||  (yy + vh) > (y + h)) {
                                            id = g.save();
                                            g.clipRect(res.x, res.y, res.width, res.height);
                                        }

                                        v.paint(g, xx, yy, vw, vh, this);

                                        if (id >= 0) {
                                           g.restore();
                                        }
                                     }
                                }
                            }
                            x += (this.colWidths[j] + this.lineSize);
                        }
                    }
                    y += (this.rowHeights[i] + this.lineSize);
                }
            };

            this.paintMarker = function(g){
                var markerView = this.views["marker"];
                if (markerView != null        &&
                    this.position != null     &&
                    this.position.offset >= 0 &&
                    this.hasFocus()             )
                {
                    var offset = this.position.offset, v = this.visibility;
                    if (offset >= v.fr[0] && offset <= v.lr[0]){
                        g.clipRect(this.getLeftCaptionWidth() - this.scrollManager.getSX(),
                                   this.getTopCaptionHeight() - this.scrollManager.getSY(), this.width, this.height);

                        markerView.paint(g, v.fc[1], this.getRowY(offset),
                                        v.lc[1] - v.fc[1] + this.getColWidth(v.lc[0]),
                                        this.rowHeights[offset], this);
                    }
                }
            };

            this.paintSelection = function(g){
                if (this.editingRow >= 0) return;
                var v = this.views[this.hasFocus()?"onselection":"offselection"];
                if (v == null) return;

                for(var j = this.visibility.fr[0];j <= this.visibility.lr[0]; j ++ ){
                    if (this.isSelected(j)) {
                        var x = this.visibility.fc[1], y = this.getRowY(j), h = this.rowHeights[j];
                        //!!! this code below can be used to implement cell oriented selection
                        for(var i = this.visibility.fc[0];i <= this.visibility.lc[0]; i ++ ){
                            v.paint(g, x, y, this.colWidths[i], h, this);
                            x += this.colWidths[i] + this.lineSize;
                        }
                    }
                }
            };

            this.rPsMetric = function(){
                var cols = this.getGridCols(), rows = this.getGridRows();
                
                if (this.colWidths == null || this.colWidths.length != cols) {
                    this.colWidths = arr(cols, 0);
                }

                if (this.rowHeights == null || this.rowHeights.length != rows) {
                    this.rowHeights = arr(rows, 0);
                }

                var addW = this.cellInsetsLeft + this.cellInsetsRight,
                    addH = this.cellInsetsTop + this.cellInsetsBottom;

                for(var i = 0;i < cols; i++ ) this.colWidths [i] = 0;
                for(var i = 0;i < rows; i++ ) this.rowHeights[i] = 0;
                for(var i = 0;i < cols; i++ ){
                    for(var j = 0;j < rows; j ++ ){
                        var v = this.provider.getView(this, j, i, this.model.get(j, i));
                        if(v != null){
                            var ps = v.getPreferredSize();
                            ps.width += addW;
                            ps.height += addH;
                            if(ps.width > this.colWidths[i]) this.colWidths [i] = ps.width;
                            if(ps.height > this.rowHeights[j]) this.rowHeights[j] = ps.height;
                        }
                        else {
                            if (pkg.Grid.DEF_COLWIDTH > this.colWidths [i]) {
                                this.colWidths [i] = pkg.Grid.DEF_COLWIDTH;
                            }
                            if (pkg.Grid.DEF_ROWHEIGHT > this.rowHeights[j]) {
                                this.rowHeights[j] = pkg.Grid.DEF_ROWHEIGHT;
                            }
                        }
                    }
                }
            };

            this.getPSSize = function (rowcol,b){
                if (this.isUsePsMetric) {
                    return b ? this.getRowHeight(rowcol) : this.getColWidth(rowcol);
                }
                else {
                    var max = 0, count = b ? this.getGridCols() : this.getGridRows();
                    for(var j = 0;j < count; j ++ ){
                        var r = b ? rowcol : j, c = b ? j : rowcol,
                            v = this.provider.getView(this, r, c, this.model.get(r, c));

                        if(v != null){
                            var ps = v.getPreferredSize();
                            if(b){
                                if(ps.height > max) max = ps.height;
                            }
                            else {
                                if(ps.width > max) max = ps.width;
                            }
                        }
                    }
                    return max + this.lineSize * 2 + 
                           (b ? this.cellInsetsTop + this.cellInsetsBottom 
                              : this.cellInsetsLeft + this.cellInsetsRight);
                }
            };

            this.rCustomMetric = function(){
                var start = 0;
                if(this.colWidths != null){
                    start = this.colWidths.length;
                    if(this.colWidths.length != this.getGridCols()){
                        var na = arr(this.getGridCols(), 0);
                        zebra.util.arraycopy(this.colWidths, 0, na, 0, 
                                             Math.min(this.colWidths.length, na.length));
                        this.colWidths = na;
                    }
                }
                else {
                    this.colWidths = arr(this.getGridCols(), 0);
                }

                for(; start < this.colWidths.length; start ++ ) {
                    this.colWidths[start] = pkg.Grid.DEF_COLWIDTH;
                }

                start = 0;
                if(this.rowHeights != null){
                    start = this.rowHeights.length;
                    if(this.rowHeights.length != this.getGridRows()){
                        var na = arr(this.getGridRows(), 0);
                        zebra.util.arraycopy(this.rowHeights, 0, na, 0, 
                                             Math.min(this.rowHeights.length, na.length));
                        this.rowHeights = na;
                    }
                }
                else {
                    this.rowHeights = arr(this.getGridRows(), 0);
                }

                for(; start < this.rowHeights.length; start++) {
                    this.rowHeights[start] = pkg.Grid.DEF_ROWHEIGHT;
                }
            };

            this.pageSize = function(d){
                this.validate();
                if (this.visibility.hasVisibleCells()){
                    var off = this.position.offset;
                    if(off >= 0){
                        var hh = this.visibleArea.height - this.getTopCaptionHeight(), sum = 0, poff = off;
                        for(; off >= 0 && off < this.getGridRows() && sum < hh; sum += this.rowHeights[off] + this.lineSize,off += d);
                        return Math.abs(poff - off);
                    }
                }
                return 0;
            };

            /**
             * Set the given height for the specified grid row. The method has no effect
             * if the grid component is forced to use preferred size metric. 
             * @param {Integer} row a grid row
             * @param {Integer} h   a height of the grid row
             * @method setRowHeight
             */
            this.setRowHeight = function(row,h){
                if(h < 0) throw new Error("Invalid row height: " + h);

                if (this.isUsePsMetric === false){
                    this.validateMetric();
                    if(this.rowHeights[row] != h){
                        this.stopEditing(false);
                        this.psHeight_ += (h - this.rowHeights[row]);
                        this.rowHeights[row] = h;
                        this.cachedHeight = this.getTop() + this.getBottom() + this.psHeight_ +
                                            ((this.topCaption != null && this.topCaption.isVisible) ? this.topCaption.getPreferredSize().height : 0);
                        if(this.parent != null) this.parent.invalidate();
                        this.iRowVisibility(0);
                        this.invalidateLayout();
                        this.repaint();
                    }
                }
            };

            /**
             * Set the given width for the specified grid column. The method has no effect
             * if the grid component is forced to use preferred size metric. 
             * @param {Integer} column a grid column
             * @param {Integer} w   a width of the grid column
             * @method setColWidth
             */
            this.setColWidth = function (col,w){
                if (w < 0) throw new Error("Invalid col width: " + w);

                if (this.isUsePsMetric === false){
                    this.validateMetric();
                    if(this.colWidths[col] != w){
                        this.stopEditing(false);
                        this.psWidth_ += (w - this.colWidths[col]);
                        this.colWidths[col] = w;
                        this.cachedWidth = this.getRight() + this.getLeft() +
                                           this.psWidth_ + ((this.leftCaption != null && this.leftCaption.isVisible) ? this.leftCaption.getPreferredSize().width : 0);
                        if(this.parent != null) this.parent.invalidate();
                        this.iColVisibility(0);
                        this.invalidateLayout();
                        this.repaint();
                    }
                }
            };
        },

        function (rows, cols){ 
            this.$this(new Matrix(rows, cols)); 
        },
        
        function (){ 
            this.$this(new Matrix(5, 5)); 
        },

        function (model){
            this.psWidth_ = this.psHeight_ = this.colOffset = 0;
            this.rowOffset = this.pressedCol = this.selectedIndex = 0;
            this.visibleArea = this.selected = null;
            this._ = new Listeners();
            this.views = {};

            this.editingRow = this.editingCol = this.pressedRow = -1;
            this.editors = this.leftCaption = this.topCaption = this.colWidths = null;
            this.rowHeights = this.position = this.stub = null;
            this.visibility = new CellsVisibility();

            this.$super();

            this.add(L.NONE, new pkg.Grid.CornerPan());
            this.setModel(model);
            this.setViewProvider(new pkg.DefViews());
            this.setPosition(new Position(this));
            this.scrollManager = new ui.ScrollManager(this);
        },

        function focused(){ 
            this.$super();
            this.repaint(); 
        },

        /**
         * Set the given editor provider. Editor provider is a way to customize 
         * cell editing.  
         * @param {Object} p an editor provider
         * @method setEditorProvider
         */
        function setEditorProvider(p){
            if(p != this.editors){
                this.stopEditing(true);
                this.editors = p;
            }
        },

        function setUsePsMetric(b){
            if (this.isUsePsMetric != b){
                this.isUsePsMetric = b;
                this.vrp();
            }
        },

        function setPosition(p){
            if(this.position != p){
                if (this.position != null) {
                    this.position._.remove(this);
                }

                /**
                 * Virtual cursor position controller
                 * @readOnly
                 * @attribute position 
                 * @type {zebra.util.Position}
                 */
                this.position = p;
                if(this.position != null){
                    this.position._.add(this);
                    this.position.setMetric(this);
                }
                this.repaint();
            }
        },

        /**
         * Set the given cell view provider. Provider is a special
         * class that says how grid cells content has to be rendered,
         * aligned, colored
         * @param {Object} p a view provider
         * @method setViewProvider
         */
        function setViewProvider(p){
            if(this.provider != p){
                this.provider = p;
                this.vrp();
            }
        },

        /**
         * Set the given matrix model to be visualized and controlled 
         * with the grid component 
         * @param {zebra.data.Matrix|Array} d a model passed as an 
         * instance of zebra matrix model or an array that contains 
         * model rows as embedded arrays.
         * @method setModel 
         */
        function setModel(d){
            if (d != this.model) {
                this.clearSelect();
                if (Array.isArray(d)) d = new Matrix(d);
                
                if (this.model != null && this.model._) {
                    this.model._.remove(this);
                }

                this.model = d;
                if (this.model != null && this.model._) {
                    this.model._.add(this);
                }

                if (this.position != null) this.position.clearPos();
                
                if (this.model != null && this.selected != null) {
                    this.selected = arr(this.model.rows, false);
                }
                
                this.vrp();
            }
        },

        /**
         * Set the given top, left, right, bottom cell paddings
         * @param {Integer} p a top, left, right and bottom cell paddings
         * @method setCellPadding
         */
        function setCellPadding(p){
            this.setCellPaddings(p,p,p,p);
        },

        /**
         * Set the given top, left, right, bottom cell paddings
         * @param {Integer} t a top cell padding
         * @param {Integer} l a left cell padding
         * @param {Integer} b a bottom cell padding
         * @param {Integer} r a rightcell padding
         * @method setCellPaddings
         */
        function setCellPaddings(t,l,b,r){
            if (t != this.cellInsetsTop    || l != this.cellInsetsLeft ||
                b != this.cellInsetsBottom || r != this.cellInsetsRight)
            {
                this.cellInsetsTop = t;
                this.cellInsetsLeft = l;
                this.cellInsetsBottom = b;
                this.cellInsetsRight = r;
                this.vrp();
            }
        },

        function matrixResized(target,prevRows,prevCols){
            this.clearSelect();
            if (this.selected != null) {
                this.selected = arr(this.model.rows, false);
            }
            this.vrp();
            if (this.position != null) { 
                this.position.clearPos();
            }

            for(var i=0; i < this.kids.length; i++) {
                if (this.kids[i].matrixResized) {
                    this.kids[i].matrixResized(target,prevRows,prevCols);
                }
            }
        },

        function cellModified(target,row,col,prevValue) {
            if (this.isUsePsMetric){
                this.invalidate();
            }

            for(var i=0; i < this.kids.length; i++) {
                if (this.kids[i].cellModified) {
                    this.kids[i].cellModified(target,row,col, prevValue);
                }
            }
        },

        function matrixSorted(target, info) {
            this.clearSelect();
            this.vrp();

            for(var i=0; i < this.kids.length; i++) {
                if (this.kids[i].matrixSorted) {
                    this.kids[i].matrixSorted(target, info);
                }
            }
        },

        function invalidate(){
            this.$super();
            this.iColVisibility(0);
            this.iRowVisibility(0);
        },

        /**
         * Set the given color to render the grid vertical and horizontal lines
         * @param {String} c a color
         * @method setLineColor
         */
        function setLineColor(c){
            if (c != this.lineColor){
                this.lineColor = c;
                if (this.drawVerLines || this.drawHorLines) {
                    this.repaint();
                }
            }
        },

        function kidAdded(index,id,c){
            this.$super(index, id, c);
            if (L.TOP == id){
                this.topCaption = c;
            }
            else {
                if (L.TEMPORARY == id) this.editor = c;
                else {
                    if (L.LEFT == id){
                        this.leftCaption = c;
                    }
                    else {
                        if (L.NONE === id) this.stub = c;
                    }
                }
            }
        },

        function kidRemoved(index,c){
            this.$super(index, c);
            if(c == this.editor) this.editor = null;
            else {
                if(c == this.topCaption){
                    this.topCaption = null;
                }
                else {
                    if(c == this.leftCaption){
                        this.leftCaption = null;
                    }
                    else {
                        if (c == this.stub) this.stub = null;
                    }
                }
            }
        },

        /**
         * Set the given grid lines size
         * @param {Integer} s a size
         * @method setLineSize
         */
        function setLineSize(s){
            if (s != this.lineSize){
                this.lineSize = s;
                this.vrp();
            }
        },

        /**
         * Start editing the given grid cell. Editing is initiated only if an editor 
         * provider has been set and the editor provider defines not-null UI component
         * as an editor for the given cell. 
         * @param  {Integer} row a grid cell row
         * @param  {Integer} col a grid cell column
         * @method startEditing
         */
        function startEditing(row,col){
            this.stopEditing(true);
            if(this.editors != null){
                var editor = this.editors.getEditor(this, row, col, this.getDataToEdit(row, col));
                if (editor != null){
                    this.editingRow = row;
                    this.editingCol = col;
                    if (zebra.instanceOf(editor, ui.ExternalEditor)) {
                        var p = L.getAbsLocation(this.getColX(col) + this.scrollManager.getSX(), 
                                                 this.getRowY(row) + this.scrollManager.getSY(), 
                                                 this);

                        editor.setLocation(p.x, p.y);
                        ui.makeFullyVisible(this.getCanvas(), editor);
                        this.editor = editor;
                        this.getCanvas().getLayer(WinLayer.ID).addWin("modal", editor, this);
                    }
                    else{
                        this.add(L.TEMPORARY, editor);
                        this.repaintRows(this.editingRow, this.editingRow);
                    }
                    ui.focusManager.requestFocus(editor);
                    return true;
                }
            }
            return false;
        },

        /**
         * Get currently editing grid cell 
         * @return {Array} am editing grid cell row and column as the first 
         * and the second array elements correspondingly. null if there is no 
         * any editing grid cell
         * @method getEditingCell
         */
        function getEditingCell(){
            return (this.editingRow >= 0 && this.editingCol >= 0) ? [this.editingRow, this.editingCol] : null;
        },

        function winOpened(winLayer,target,b){
            if (this.editor == target &&  b === false){
                this.stopEditing(this.editor.isAccepted());
            }
        },

        function getDataToEdit(row,col){ return this.model.get(row, col); },
        function setEditedData(row,col,value){ this.model.put(row, col, value); }
]);
pkg.Grid.prototype.setViews = ui.$ViewsSetter;


/**
 * Special UI panel that manages to stretch grid columns to occupy the whole panel space. 
 *         
  
        ...
        
        var canvas = new zebra.ui.zCanvas();
        var grid = new zebra.ui.grid.Grid(100,10);
        var pan  = new zebra.ui.grid.GridStretchPan(grid);
    
        canvas.root.setLayout(new zebra.layout.BorderLayout());
        canvas.root.add(zebra.layout.CENTER, pan);

        ...

 * @constructor
 * @param {zebra.ui.grid.Grid} grid a grid component that has to be added in the panel
 * @class zebra.ui.grid.GridStretchPan
 * @extends {zebra.ui.Panel}
 */
pkg.GridStretchPan = Class(ui.Panel, L.Layout, [
    function $prototype() {
        this.calcPreferredSize = function (target){
            this.recalcPS();
            return (target.kids.length === 0 || !target.grid.isVisible) ? { width:0, height:0 }
                                                                        : { width:this.strPs.width, 
                                                                            height:this.strPs.height };
        };

        this.doLayout = function(target){
            this.recalcPS();
            if (target.kids.length > 0){
                var grid = this.grid;
                if (grid.isVisible){
                    var left = target.getLeft(), top = target.getTop();
                    grid.setLocation(left, top);
                    grid.setSize(target.width  - left - target.getRight(),
                                 target.height - top  - target.getBottom());

                    for(var i = 0; i < this.widths.length; i++) {
                        grid.setColWidth(i, this.widths[i]);
                    }

                    if (this.heights != null){
                        for(var i = 0;i < this.heights.length; i++) {
                            grid.setRowHeight(i, this.heights[i]);
                        }
                    }
                }
            }
        };

        this.captionResized = function(src, col, pw){
            var grid = this.grid;
            if (col < this.widths.length - 1){
                var w = grid.getColWidth(col), dt = w - pw;
                if (dt < 0) grid.setColWidth(col + 1, grid.getColWidth(col + 1) - dt);
                else {
                    var ww = grid.getColWidth(col + 1) - dt, mw = this.getMinWidth();
                    if (ww < mw) {
                        grid.setColWidth(col, w - (mw - ww));
                        grid.setColWidth(col + 1, mw);
                    }
                    else grid.setColWidth(col + 1, ww);
                }
                this.proportions = null;
            }
        };

        this.calcColProportions = function (targetAreaW,targetAreaH){
            var g = this.grid, cols = g.getGridCols(), sw = 0;
            for(var i = 0;i < cols; i++){
                var w = g.getColWidth(i);
                if (w === 0) w = g.getColPSWidth(i);
                sw += w;
            }

            var props = Array(cols);
            for(var i = 0;i < cols; i++){
                var w = g.getColWidth(i);
                if (w === 0) w = g.getColPSWidth(i);
                props[i] = w / sw;
            }
            return props;
        };

        this.calcRowHeights = function(targetAreaW,targetAreaH,widths) { 
            return null;
        };

        this.getMinWidth = function (){
            return zebra.instanceOf(this.grid.topCaption, pkg.BaseCaption) ? this.grid.topCaption.minSize
                                                                           : 10;
        };

        this.calcColWidths = function (targetAreaW,targetAreaH){
            var grid = this.grid, w = Array(grid.getGridCols()),
                ew = targetAreaW - (this.proportions.length + 1) * grid.lineSize, sw = 0;

            for(var i = 0; i < this.proportions.length; i++){
                if (this.proportions.length - 1 == i) w[i] = ew - sw;
                else {
                    var cw = (ew * this.proportions[i]);
                    w[i] = cw;
                    sw += cw;
                }
            }
            return w;
        };

        this.recalcPS = function (){
            var grid = this.grid;
            if (grid == null || grid.isVisible === false) return;

            var p = this.parent, isScr = zebra.instanceOf(p, ui.ScrollPan),
                taWidth   = (isScr ? p.width - p.getLeft() - p.getRight() - this.getRight() - this.getLeft()
                                   : this.width - this.getRight() - this.getLeft()),
                taHeight = (isScr  ? p.height - p.getTop() - p.getBottom() - this.getBottom() - this.getTop()
                                   : this.height - this.getBottom() - this.getTop());

            if (this.strPs != null && this.prevTargetAreaSize.width == taWidth &&
                                      this.prevTargetAreaSize.height == taHeight  ) {
                return;
            }

            if (this.proportions == null || this.proportions.length != grid.getGridCols()) {
                this.proportions = this.calcColProportions(taWidth, taHeight);
            }

            this.prevTargetAreaSize.width = taWidth;
            this.prevTargetAreaSize.height = taHeight;
            this.widths  = this.calcColWidths (taWidth, taHeight);
            this.heights = this.calcRowHeights(taWidth, taHeight, this.widths);
            this.strPs = this.summarizePS(taWidth, taHeight, this.widths, this.heights);

            if (isScr === true && p.height > 0 && p.vBar && p.autoHide === false && taHeight < this.strPs.height){
                taWidth -= p.vBar.getPreferredSize().width;
                this.widths  = this.calcColWidths(taWidth, taHeight);
                this.heights = this.calcRowHeights(taWidth, taHeight, this.widths);
                this.strPs   = this.summarizePS(taWidth, taHeight, this.widths, this.heights);
            }
        };

        this.summarizePS = function (targetAreaW,targetAreaH,widths,heights){
            var ps = { width: targetAreaW, height:0 }, grid = this.grid;
            if (heights != null){
                for(var i = 0;i < heights.length; i++) ps.height += heights[i];
                if (grid.topCaption != null && grid.topCaption.isVisible) {
                    ps.height += grid.topCaption.getPreferredSize().height;
                }
                ps.height += (grid.getTop() + grid.getBottom());
            }
            else ps.height = grid.getPreferredSize().height;
            return ps;
        };
    },

    function (grid){
        this.$super(this);
        this.heights = [];
        this.widths  = [];
        this.grid = grid;
        this.proportions = this.strPs = null;
        this.prevTargetAreaSize = { width:0, height:0 };
        this.add(grid);
    },

    function kidAdded(index,constr,l){
        this.proportions = null;
        if (l.topCaption != null) {
            l.topCaption._.add(this);
        }
        this.scrollManager = l.scrollManager;
        this.$super(index, constr, l);
    },

    function kidRemoved(i,l){
        this.proportions = null;
        if (l.topCaption != null) {
            l.topCaption._.remove(this);
        }
        this.scrollManager = null;
        this.$super(i, l);
    },

    function invalidate(){
        this.strPs = null;
        this.$super();
    }
]);

pkg.GridCapView = Class(ui.View, [
    function $prototype() {
        this.paint = function(g,x,y,w,h,d) {
            if (d.orient == L.HORIZONTAL) {
                if (this.hgradient == null) {
                    this.hgradient = new ui.Gradient(this.color1, this.color2,  L.VERTICAL);       
                }
                this.hgradient.paint(g,x,y,w,h,d);
                g.setColor(this.lineColor1);
                g.drawLine(x + w, y, x + w, y + h);
                g.setColor(this.lineColor2);
                g.drawLine(x, y, x + w, y);
            }
            else {
                if (this.vgradient == null) {
                    this.vgradient = new ui.Gradient(this.color1, this.color2,  L.HORIZONTAL);       
                }
                this.vgradient.paint(g,x,y,w,h,d);
                g.setColor(this.lineColor1);
                g.drawLine(x, y + h, x + w, y + h);
                g.setColor(this.lineColor2);
                g.drawLine(x, y, x, y + h);
            }
        };
    },

    function() {
        this.$this("rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.0)");
    },

    function(col1, col2) {
        this.gap = 6;
        this.color1 = col1;
        this.color2 = col2;
        this.lineColor1 = "black";
        this.lineColor2 = "#CCCCCC";
    }
]);

/**
 * @for
 */

})(zebra("ui.grid"), zebra.Class, zebra("ui"));




})();
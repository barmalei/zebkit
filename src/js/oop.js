
var $$$        = 11,   // hash code counter
    $caller    = null, // currently called method reference
    $cachedO   = {},   // class cache
    $cachedE   = [],
    $cacheSize = 7777,
    CNAME      = '$',
    CDNAME     = '';

function $toString() {
    return this.$hash$;
}

function $ProxyMethod(name, f, clazz) {
    if (typeof f.methodBody !== "undefined") {
        throw new Error("Proxy method '" + name + "' cannot be wrapped");
    }

    var a = function() {
        var cm = $caller;
        $caller = a;
        // don't use finally section it is slower than try-catch
        try {
            var r = f.apply(this, arguments);
            $caller = cm;
            return r;
        } catch(e) {
            $caller = cm;
            console.log(name + "(" + arguments.length + ") " + (e.stack ? e.stack : e));
            throw e;
        }
    };

    a.methodBody = f;
    a.methodName = name;
    a.boundTo    = clazz;
    return a;
}

/**
 * Get an object by the given key from cache (and cached it if necessary)
 * @param  {String} key a key to an object. The key is hierarchical reference starting with the global
 * name space as root. For instance "test.a" key will fetch $global.test.a object.
 * @return {Object}  an object
 * @for  zebkit
 * @private
 * @method  $cache
 */
function $cache(key) {
    // don't cache global objects
    if ($global.hasOwnProperty(key)) {
        return $global[key];
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

    var ctx = $global, i = 0, j = 0;
    for( ;ctx !== null && typeof ctx !== 'undefined'; ) {
        i = key.indexOf('.', j);

        if (i < 0) {
            ctx = ctx[key.substring(j, key.length)];
            break;
        }

        ctx = ctx[key.substring(j, i)];
        j = i + 1;
    }

    if (ctx !== null && typeof ctx !== 'undefined') {
        if ($cachedE.length >= $cacheSize) {
            // cache is full, replace first element with the new one
            var n = $cachedE[0];
            $cachedE[0]   = key;
            $cachedO[key] = { o: ctx, i: 0 };
            delete $cachedO[n];
        } else {
            $cachedO[key] = { o: ctx, i: $cachedE.length };
            $cachedE[$cachedE.length] = key;
        }
        return ctx;
    }

    throw new Error("Reference '" + key + "' not found");
}

// copy methods from source to destination
function $cpMethods(src, dest, clazz) {
    var overriddenAbstractMethods = 0;
    for(var name in src) {
        if (name   !==  CNAME        &&
            name   !== "clazz"       &&
            src.hasOwnProperty(name)   )
        {
            var method = src[name];
            if (typeof method === "function" && method !== $toString) {
                if (name === "$prototype") {
                    method.call(dest, clazz);
                } else {
                    // TODO analyze if we overwrite existent field
                    if (typeof dest[name] !== 'undefined') {
                        // abstract method is overridden, let's skip abstract method
                        // stub implementation
                        if (method.$isAbstract === true) {
                            overriddenAbstractMethods++;
                            continue;
                        }

                        if (dest[name].boundTo === clazz) {
                            throw new Error("Method '" + name + "(...)'' bound to this class already exists");
                        }
                    }

                    if (typeof method.methodBody !== "undefined") {
                        dest[name] = $ProxyMethod(name, method.methodBody, clazz);
                    } else {
                        dest[name] = $ProxyMethod(name, method, clazz);
                    }

                    // save information about abstract method
                    if (method.$isAbstract === true) {
                        dest[name].$isAbstract = true;
                    }
                }
            }
        }
    }
    return overriddenAbstractMethods;
}

// return function that is meta class
//  instanceOf      - parent template function (can be null)
//  templateConstructor - template function,
//  inheritanceList     - parent class and interfaces
function $make_template(instanceOf, templateConstructor, inheritanceList) {
    // supply template with unique identifier that is returned with toString() method
    templateConstructor.$hash$   = "$zEk$" + ($$$++);
    templateConstructor.toString = $toString;
    templateConstructor.prototype.clazz = templateConstructor; // instances of the template has to point to the template as a class

    templateConstructor.clazz = templateConstructor.constructor = instanceOf;

    /**
     *  Unique string hash code. The property is not defined if the class was not
     *  maid hashable by calling "hashable()" method.
     *  @attribute $hash$
     *  @private
     *  @type {String}
     *  @for  zebkit.Class
     *  @readOnly
     */

    /**
     * Dictionary of all inherited interfaces where key is unique interface hash code and the value
     * is interface itself.
     * @private
     * @readOnly
     * @for zebkit.Class
     * @type {Object}
     * @attribute $parents
     * @type {Object}
     */
    templateConstructor.$parents = {};

    // instances of the constructor also has to be unique
    // so force toString method population
    templateConstructor.prototype.constructor = templateConstructor; // set constructor of instances to the template

    // setup parent entities
    if (arguments.length > 2 && inheritanceList.length > 0) {
        for(var i = 0; i < inheritanceList.length; i++) {
            var toInherit = inheritanceList[i];
            if (typeof toInherit === 'undefined'        ||
                toInherit === null                      ||
                typeof toInherit        !== "function"  ||
                typeof toInherit.$hash$ === "undefined"   )
            {
                throw new ReferenceError("Invalid parent class or interface:" + toInherit);
            }

            if (typeof templateConstructor.$parents[toInherit.$hash$] !== "undefined") {
                throw Error("Duplicate toInherit class or interface: " + toInherit);
            }

            templateConstructor.$parents[toInherit.$hash$] = toInherit;

            // if parent has own parents copy the parents references
            for(var k in toInherit.$parents) {
                if (typeof templateConstructor.$parents[k] !== "undefined") {
                    throw Error("Duplicate inherited class or interface: " + k);
                }

                templateConstructor.$parents[k] = toInherit.$parents[k];
            }
        }
    }
    return templateConstructor;
}

/**
 * Clone the given object. The method tries to perform deep cloning by
 * traversing the given object structure recursively. Any part of an
 * object can be marked as not cloneable by adding  "$notCloneable"
 * field that equals to true. Also at any level of object structure
 * the cloning can be customized with adding "$clone" method. In this
 * case the method will be used to clone the part of object.
 * clonable
 * @param  {Object} obj an object to be cloned
 * @return {Object} a cloned object
 * @method  clone
 * @for  zebkit
 */
function clone(obj, map) {
    // clone atomic type
    // TODO: to speedup cloning we don't use isString, isNumber, isBoolean
    if (obj === null || typeof obj === 'undefined' || obj.$notCloneable === true ||
                                                      (typeof obj === "string"  || obj.constructor === String  ) ||
                                                      (typeof obj === "boolean" || obj.constructor === Boolean ) ||
                                                      (typeof obj === "number"  || obj.constructor === Number  )    )
    {
        return obj;
    }

    map = map || new Map();
    var t = map.get(obj);
    if (typeof t !== "undefined") {
        return t;
    }

    // clone with provided custom "clone" method
    if (typeof obj.$clone !== "undefined") {
        return obj.$clone(map);
    }

    // clone array
    if (Array.isArray(obj)) {
        var naobj = [];

        map.set(obj, naobj);
        map[obj] = naobj;

        for(var i = 0; i < obj.length; i++) {
            naobj[i] = clone(obj[i], map);
        }
        return naobj;
    }

    // clone class
    if (obj.clazz === Class) {
        var clazz = Class(obj, []);
        clazz.inheritProperties = true;
        return clazz;
    }

    // function cannot be cloned
    if (typeof obj === 'function' || obj.constructor !==  Object) {
        return obj;
    }

    var nobj = {};
    map.set(obj, nobj); // keep one instance of cloned for the same object

    // clone object fields
    for(var k in obj) {
        if (obj.hasOwnProperty(k) === true) {
            nobj[k] = clone(obj[k], map);
        }
    }

    return nobj;
}

/**
 * Instantiate a new class instance of the given class with the specified constructor
 * arguments.
 * @param  {Function} clazz a class
 * @param  {Array} [args] an arguments list
 * @return {Object}  a new instance of the given class initialized with the specified arguments
 * @method newInstance
 * @for  zebkit
 */
function newInstance(clazz, args) {
    if (arguments.length > 1 && args.length > 0) {
        var f = function () {};
        f.prototype = clazz.prototype;
        var o = new f();
        clazz.apply(o, args);
        return o;
    }

    return new clazz();
}

function $make_proto(props, superProto) {
    if (superProto === null) {
        return function $prototype(clazz) {
            for(var k in props) {
                if (props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        };
    } else {
        return function $prototype(clazz) {
            superProto.call(this, clazz);
            for(var k in props) {
                if (props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        };
    }
}

/**
 * Interface is way to share common functionality by avoiding multiple inheritance.
 * It allows developers to mix number of methods to different classes. For instance:

      // declare "I" interface that contains one method a
      var I = zebkit.Interface([
          function a() {

          }
      ]);

      // declare "A" class
      var A = zebkit.Class([]);

      // declare "B" class that inherits class A and mix interface "I"
      var B = zebkit.Class(A, I, []);

      // instantiate "B" class
      var b = new B();
      zebkit.instanceOf(b, I);  // true
      zebkit.instanceOf(b, A);  // true
      zebkit.instanceOf(b, B);  // true

      // call mixed method
      b.a();

 * @return {Function} an interface
 * @param {Array} [methods] list of methods declared in the interface
 * @constructor
 * @class  zebkit.Interface
 */
var Interface = $make_template(null, function() {
    var $Interface = $make_template(Interface, function() {
        // Clone interface  parametrized with the given properties set
        if (typeof this === 'undefined' || this.constructor !== $Interface) {  // means the method execution is not a result of "new" method
            if (arguments.length !== 1) {
                throw new Error("Invalid number of arguments. Properties set is expected");
            }

            if (arguments[0].constructor !== Object) {
                throw new Error("Invalid argument type. Properties set is expected");
            }

            var iclone = $Interface.$clone();
            iclone.prototype.$prototype = $make_proto(arguments[0],
                                                     $Interface.prototype.$prototype);
            return iclone;
        } else {
            // Create a class that inherits the interface and instantiate it
            if (arguments.length > 1) {
                throw new Error("One or zero argument is expected");
            }
            return new (Class($Interface, arguments.length > 0 ? arguments[0] : []))();
        }
    });

    if (arguments.length > 1) {
        throw new Error("Invalid number of arguments. List of methods or properties is expected");
    }

    // abstract method counter, not used now, but can be used in the future
    // to understand if the given class override all abstract methods (should be
    // controlled in the places of "$cpMethods" call)
    $Interface.$abstractMethods = 0;

    var arg = arguments.length === 0 ? [] : arguments[0];
    if (arg.constructor === Object) {
        arg = [ $make_proto(arg, null) ];
    } else if (Array.isArray(arg) === false) {
        throw new Error("Invalid argument type. List of methods pr properties is expected");
    }

    if (arg.length > 0) {
        var  proto      = $Interface.prototype,
             isAbstract = false;

        for(var i = 0; i < arg.length; i++) {
            var method = arg[i];

            if (method === "abstract") {
                isAbstract = true;
            } else {
                if (typeof method !== "function") {
                    throw new Error("Method is expected instead of " + method);
                }

                var name = $FN(method);
                if (name === CDNAME) {
                    throw new Error("Constructor declaration is not allowed in interface");
                }

                if (typeof proto[name] !== 'undefined') {
                    throw new Error("Duplicated interface method '" + name + "(...)'");
                }

                if (name === "$clazz") {
                    method.call($Interface, $Interface);
                } else if (isAbstract === true) {
                    (function(name) {
                        proto[name] = function() {
                            throw new Error("Abstract method '" + name + "(...)' is not implemented");
                        };

                        // mark method as abstract
                        proto[name].$isAbstract = true;

                        // count abstract methods
                        $Interface.$abstractMethods++;
                    })(name);
                } else {
                    proto[name] = method;
                }
            }
        }
    }

    /**
     * Private implementation of an interface cloning.
     * @return {zebkit.Interface} a clone of the interface
     * @method $clone
     * @private
     */
    $Interface.$clone = function() {
        var iclone = Interface(), k = null; // create interface

        // clone interface level variables
        for(k in this) {
            if (this.hasOwnProperty(k)) {
                iclone[k] = clone(this[k]);
            }
        }

        // copy methods from proto
        var proto = this.prototype;
        for(k in proto) {
            if (k !== "clazz" && proto.hasOwnProperty(k) === true) {
                iclone.prototype[k] = clone(proto[k]);
            }
        }

        return iclone;
    };

    $Interface.clazz.$name = "zebkit.Interface"; // assign name
    return $Interface;
});

/**
 * Core method method to declare a zebkit class following easy OOP approach. The easy OOP concept
 * supports the following OOP features:
 *
 *
 *  __Single class inheritance.__ Any class can extend an another zebkit class

        // declare class "A" that with one method "a"
        var A = zebkit.Class([
            function a() { ... }
        ]);

        // declare class "B" that inherits class "A"
        var B = zebkit.Class(A, []);

        // instantiate class "B" and call method "a"
        var b = new B();
        b.a();


* __Class method overriding.__ Override a parent class method implementation

        // declare class "A" that with one method "a"
        var A = zebkit.Class([
            function a() { ... }
        ]);

        // declare class "B" that inherits class "A"
        // and overrides method a with an own implementation
        var B = zebkit.Class(A, [
            function a() { ... }
        ]);

* __Constructors.__ Constructor is a method with empty name

        // declare class "A" that with one constructor
        var A = zebkit.Class([
            function () { this.variable = 100; }
        ]);

        // instantiate "A"
        var a = new A();
        a.variable // variable is 100

* __Static methods and variables declaration.__ Static fields and methods can be defined
    by declaring special "$clazz" method whose context is set to declared class

        var A = zebkit.Class([
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

* __Access to super class context.__ You can call method declared in a parent class

        // declare "A" class with one class method "a(p1,p2)"
        var A = zebkit.Class([
            function a(p1, p2) { ... }
        ]);

        // declare "B" class that inherits "A" class and overrides "a(p1,p2)" method
        var B = zebkit.Class(A, [
            function a(p1, p2) {
                // call "a(p1,p2)" method implemented with "A" class
                this.$super(p1,p2);
            }
        ]);

 *
 *  One of the powerful feature of zebkit easy OOP concept is possibility to instantiate
 *  anonymous classes and interfaces. Anonymous class is an instance of an existing
 *  class that can override the original class methods with own implementations, implements
 *  own list of interfaces and methods. In other words the class instance customizes class
 *  definition for the particular instance of the class;

        // declare "A" class
        var A = zebkit.Class([
            function a() { return 1; }
        ]);

        // instantiate anonymous class that add an own implementation of "a" method
        var a = new A([
            function a() { return 2; }
        ]);
        a.a() // return 2

 * @param {zebkit.Class} [inheritedClass] an optional parent class to be inherited
 * @param {zebkit.Interface} [inheritedInterfaces]* an optional list of interfaces for
 * the declared class to be mixed in the class
 * @param {Array} methods list of declared class methods. Can be empty array.
 * @return {Function} a class definition
 * @constructor
 * @class zebkit.Class
 */
function $mixing(clazz, methods) {
    if (Array.isArray(methods) === false) {
        throw new Error("Methods array is expected (" + methods + ")");
    }

    var names = {};
    for(var i = 0; i < methods.length; i++) {
        var method     = methods[i],
            methodName = $FN(method);

        // detect if the passed method is proxy method
        if (typeof method.methodBody !== 'undefined') {
            throw new Error("Proxy method '" + methodName + "' cannot be mixed in a class");
        }

        // map user defined constructor to internal constructor name
        if (methodName === CDNAME) {
            methodName = CNAME;
        } else if (methodName[0] === '$') {
            // populate prototype fields if a special method has been defined
            if (methodName === "$prototype") {
                method.call(clazz.prototype, clazz);
                if (clazz.prototype[CDNAME]) {
                    clazz.prototype[CNAME] = clazz.prototype[CDNAME];
                    delete clazz.prototype[CDNAME];
                }
                continue;
            }

            // populate class level fields if a special method has been defined
            if (methodName === "$clazz") {
                method.call(clazz);
                continue;
            }
        }

        if (names[methodName] === true) {
            throw new Error("Duplicate declaration of '" + methodName+ "(...)' method");
        }

        var existentMethod = clazz.prototype[methodName];
        if (typeof existentMethod !== 'undefined' && typeof existentMethod !== 'function') {
            throw new Error("'" + methodName + "(...)' method clash with a field");
        }

        // if constructor doesn't have super definition than let's avoid proxy method
        // overhead
        if (typeof existentMethod === 'undefined' && methodName === CNAME) {
            clazz.prototype[methodName] = method;
        } else {
            // Create and set proxy method that is bound to the given class
            clazz.prototype[methodName] = $ProxyMethod(methodName, method, clazz);
        }

        // save method we have already added to check double declaration error
        names[methodName] = true;
    }
}


var classTemplateFields = {
    /**
     * Makes the class hashable. Hashable class instances are automatically
     * gets unique hash code that is returned with its overridden "toString()"
     * method. The hash code is stored in special "$hash$" field. The feature
     * can be useful when you want to store class instances in "{}" object
     * where key is the hash and the value is the instance itself.
     * @method hashable
     * @chainable
     * @for zebkit.Class
     */
    hashable : function() {
        if (this.$uniqueness !== true) {
            this.$uniqueness = true;
            this.prototype.toString = $toString;
        }
        return this;
    },

    /**
     * Makes the class hashless. Prevents generation of hash code for
     * instances of the class.
     * @method hashless
     * @chainable
     * @for zebkit.Class
     */
    hashless : function() {
        if (this.$uniqueness === true) {
            this.$uniqueness = false;
            this.prototype.toString = Object.prototype.toString;
        }
        return this;
    },

    /**
     * Extend the class with new method and implemented interfaces.
     * @param {zebkit.Interface} [interfaces]*  number of interfaces the class has to implement.
     * @param {Array} methods set of methods the given class has to be extended.
     * @method extend
     * @for  zebkit.Class
     */
    // add extend method later to avoid the method be inherited as a class static field
    extend : function() {
        var methods    = arguments[arguments.length - 1],
            hasMethod  = Array.isArray(methods);

        // inject class
        if (hasMethod && this.$isExtended !== true) {
            // create intermediate class
            var A = this.$parent !== null ? Class(this.$parent, [])
                                          : Class([]);

            // copy this class prototypes methods to intermediate class A and re-define
            // boundTo to the intermediate class A if they were bound to source class
            // methods that have been  moved from source class to class have to be re-bound
            // to A class
            for(var name in this.prototype) {
                if (name !== "clazz" && this.prototype.hasOwnProperty(name) ) {
                    var f = this.prototype[name];
                    if (typeof f === 'function') {
                        A.prototype[name] = typeof f.methodBody !== 'undefined' ? $ProxyMethod(name, f.methodBody, f.boundTo)
                                                                                : f;

                        if (A.prototype[name].boundTo === this) {
                            A.prototype[name].boundTo = A;
                            if (f.boundTo === this) {
                                f.boundTo = A;
                            }
                        }
                    }
                }
            }

            this.$parent = A;
            this.$isExtended = true;
        }

        if (hasMethod) {
            $mixing(this, methods);
        }

        // add passed interfaces
        for(var i = 0; i < arguments.length - (hasMethod ? 1 : 0); i++) {
            var I = arguments[i];
            if (I === null || typeof I === 'undefined' || I.clazz !== Interface) {
                throw new Error("Interface is expected");
            }

            if (typeof this.$parents[I.$hash$] !== 'undefined') {
                throw new Error("Interface has been already inherited");
            }

            $cpMethods(I.prototype, this.prototype, this);
            this.$parents[I.$hash$] = I;
        }
    },

    /**
     * Tests if the class inherits the given class or interface.
     * @param  {zebkit.Class | zebkit.Interface}  clazz a class or interface.
     * @return {Boolean} true if the class or interface is inherited with
     * the class.
     * @method  isInherit
     * @for  zebkit.Class
     */
    isInherit : function(clazz) {
        if (this !== clazz) {
            // detect class
            if (clazz.clazz === this.clazz) {
                for (var p = this.$parent; p !== null; p = p.$parent) {
                    if (p === clazz) {
                        return true;
                    }
                }
            } else { // detect interface
                if (this.$parents[clazz.$hash$] === clazz) {
                    return true;
                }
            }
        }
        return false;
    }
};


var classTemplateProto = {
    /**
     * Extend existent class instance with the given methods and interfaces
     * For example:

        var A = zebkit.Class([ // declare class A that defines one "a" method
            function a() {
                console.log("A:a()");
            }
        ]);

        var a = new A();
        a.a();  // show "A:a()" message

        A.a.extend([
            function b() {
                console.log("EA:b()");
            },

            function a() {   // redefine "a" method
                console.log("EA:a()");
            }
        ]);

        a.b(); // show "EA:b()" message
        a.a(); // show "EA:a()" message

     * @param {zebkit.Interface} [interfaces]* interfaces to be implemented with the
     * class instance
     * @param {Array} methods list of methods the class instance has to be extended
     * with
     * @method extend
     * @for zebkit.Class.zObject
     */
    extend : function() {
        var clazz = this.clazz,
            l = arguments.length,
            f = arguments[l - 1],
            hasArray = Array.isArray(f),
            i = 0;

        // replace the instance class with a new intermediate class
        // that inherits the replaced class. it is done to support
        // $super method calls.
        if (this.$isExtended !== true) {
            clazz = Class(clazz, []);
            this.$isExtended = true;         // mark the instance as extended to avoid double extending.
            clazz.$name = this.clazz.$name;
            this.clazz = clazz;
        }

        if (hasArray) {
            var init = null;
            for(i = 0; i < f.length; i++) {
                var n = $FN(f[i]);
                if (n === CDNAME) {
                    init = f[i];  // postpone calling initializer before all methods will be defined
                } else {
                    if (typeof this[n] !== 'undefined' && typeof this[n] !== 'function') {
                        throw new Error("Method '" + n + "' clash with a property");
                    }
                    this[n] = $ProxyMethod(n, f[i], clazz);
                }
            }

            if (init !== null) {
                init.call(this);
            }
            l--;
        }

        // add new interfaces if they has been passed
        for (i = 0; i < arguments.length - (hasArray ? 1 : 0); i++) {
            if (arguments[i].clazz !== Interface) {
                throw new Error("Invalid argument " + arguments[i] + " Interface is expected.");
            }

            var I = arguments[i];
            if (typeof clazz.$parents[I.$hash$] !== 'undefined') {
                throw new Error("Interface has been already inherited");
            }

            $cpMethods(I.prototype, this, clazz);
            clazz.$parents[I.$hash$] = I;
        }
        return this;
    },

    /**
     * Call super method implementation.
     * @param {Function} [superMethod]? optional parameter that should be a method of the class instance
     * that has to be called
     * @param {Object} [args]* arguments list to pass the executed method
     * @return {Object} return what super method returns
     * @method $super
     * @example
     *
     *    var A = zebkit.Class([
     *        function a(p) { return 10 + p; }
     *    ]);
     *
     *    var B = zebkit.Class(A, [
     *        function a(p) {
     *            return this.$super(p) * 10;
     *        }
     *    ]);
     *
     *    var b = new B();
     *    b.a(10) // return 200
     *
     * @for zebkit.Class.zObject
     */
    $super : function() {
       if ($caller !== null) {
            for (var $s = $caller.boundTo.$parent; $s !== null; $s = $s.$parent) {
                var m = $s.prototype[$caller.methodName];
                if (typeof m !== 'undefined') {
                    return m.apply(this, arguments);
                }
            }

            // handle method not found error
            var cln = this.clazz && this.clazz.$name ? this.clazz.$name + "." : "";
            throw new ReferenceError("Method '" +
                                     cln +
                                     ($caller.methodName === CNAME ? "constructor"
                                                                   : $caller.methodName) + "(" + arguments.length + ")" + "' not found");
        } else {
            throw new Error("$super is called outside of class context");
        }
    },

    // TODO: not stable API
    $supera : function(args) {
       if ($caller !== null) {
            for (var $s = $caller.boundTo.$parent; $s !== null; $s = $s.$parent) {
                var m = $s.prototype[$caller.methodName];
                if (typeof m !== 'undefined') {
                    return m.apply(this, args);
                }
            }

            // handle method not found error
            var cln = this.clazz && this.clazz.$name ? this.clazz.$name + "." : "";
            throw new ReferenceError("Method '" +
                                     cln +
                                     ($caller.methodName === CNAME ? "constructor"
                                                                   : $caller.methodName) + "(" + arguments.length + ")" + "' not found");
        } else {
            throw new Error("$super is called outside of class context");
        }
    },

    // TODO: not stable API, $super that doesn't throw exception is there is no super implementation
    $$super : function() {
       if ($caller !== null) {
            for(var $s = $caller.boundTo.$parent; $s !== null; $s = $s.$parent) {
                var m = $s.prototype[$caller.methodName];
                if (typeof m !== 'undefined') {
                    return m.apply(this, arguments);
                }
            }
        } else {
            throw new Error("$super is called outside of class context");
        }
    },

    /**
     * Get a first super implementation of the given method in a parent classes hierarchy.
     * @param  {String} name a name of the method
     * @return {Function} a super method implementation
     * @method  $getSuper
     * @for  zebkit.Class.zObject
     */
    $getSuper : function(name) {
       if ($caller !== null) {
            for(var $s = $caller.boundTo.$parent; $s !== null; $s = $s.$parent) {
                var m = $s.prototype[name];
                if (typeof m === 'function') {
                    return m;
                }
            }
            return null;
        }
        throw new Error("$super is called outside of class context");
    },

    $genHash : function() {
        if (typeof this.$hash$ === 'undefined') {
            this.$hash$ = "$ZeInGen" + ($$$++);
        }
        return this.$hash$;
    },

    $clone : function(map) {
        map = map || new Map();

        var f = function() {};
        f.prototype = this.constructor.prototype;
        var nobj = new f();
        map.set(this, nobj);

        for(var k in this) {
            if (this.hasOwnProperty(k)) {
                // obj's layout is obj itself
                var t = map.get(this[k]);
                if (t !== undefined) {
                    nobj[k] = t;
                } else {
                    nobj[k] = clone(this[k], map);
                }
            }
        }

        // speed up clearing resources
        map.clear();

        nobj.constructor = this.constructor;

        if (typeof nobj.$hash$ !== 'undefined') {
            nobj.$hash$ = "$zObj_" + ($$$++);
        }

        nobj.clazz = this.clazz;
        return nobj;
    }
};

// create Class template what means we define a function (meta class) that has to be used to define
// Class. That means we define a function that returns another function that is a Class
var Class = $make_template(null, function() {
    if (arguments.length === 0) {
        throw new Error("No class method list was found");
    }

    if (Array.isArray(arguments[arguments.length - 1]) === false) {
        throw new Error("No class methods have been passed");
    }

    if (arguments.length > 1 && typeof arguments[0] !== "function")  {
        throw new ReferenceError("Invalid parent class or interface '" + arguments[0] + "'");
    }

    var classMethods = arguments[arguments.length - 1],
        parentClass  = null,
        toInherit    = [];

    // detect parent class in inheritance list as the first argument that has "clazz" set to Class
    if (arguments.length > 0 && (arguments[0] === null || arguments[0].clazz === Class)) {
        parentClass = arguments[0];
    }

    // use instead of slice for performance reason
    for(var i = 0; i < arguments.length - 1; i++) {
        toInherit[i] = arguments[i];

        // let's make sure we inherit interface
        if (parentClass === null || i > 0) {
            if (typeof toInherit[i] === 'undefined' || toInherit[i] === null) {
                throw new ReferenceError("Undefined inherited interface [" + i + "] " );
            } else if (toInherit[i].clazz !== Interface) {
                throw new ReferenceError("Inherited interface is not an Interface ( [" + i + "] '" + toInherit[i] + "'')");
            }
        }
    }

    // define Class (function) that has to be used to instantiate the class instance
    var classTemplate = $make_template(Class, function() {
        if (classTemplate.$uniqueness === true) {
            this.$hash$ = "$ZkIo" + ($$$++);
        }

        if (arguments.length > 0) {
            var a = arguments[arguments.length - 1];

            // anonymous is customized class instance if last arguments is array of functions
            if (Array.isArray(a) === true && typeof a[0] === 'function') {
                a = a[0];

                // prepare arguments list to declare an anonymous class
                var args = [ classTemplate ],      // first of all the class has to inherit the original class
                    k    = arguments.length - 2;

                // collect interfaces the anonymous class has to implement
                for(; k >= 0 && arguments[k].clazz === Interface; k--) {
                    args.push(arguments[k]);
                }

                // add methods list
                args.push(arguments[arguments.length - 1]);

                var cl = Class.apply(null, args),  // declare new anonymous class
                    // create a function to instantiate an object that will be made the
                    // anonymous class instance. The intermediate object is required to
                    // call constructor properly since we have arguments as an array
                    f  = function() {};

                cl.$name = classTemplate.$name; // the same class name for anonymous
                f.prototype = cl.prototype; // the same prototypes

                var o = new f();

                // call constructor
                // use array copy instead of cloning with slice for performance reason
                // (Array.prototype.slice.call(arguments, 0, k + 1))
                args = [];
                for (var i = 0; i < k + 1; i++) {
                    args[i] = arguments[i];
                }
                cl.apply(o, args);

                // set constructor field for consistency
                o.constructor = cl;
                return o;
            }
        }

        // call class constructor
        if (typeof this.$ !== 'undefined') { // TODO: hard-coded constructor name to speed up
            return this.$.apply(this, arguments);
        }
    }, toInherit);

    /**
     *  Internal attribute that caches properties setter references.
     *  @attribute $propertyInfo
     *  @type {Object}
     *  @private
     *  @for zebkit.Class
     *  @readOnly
     */

    // prepare fields that caches the class properties. existence of the property
    // force getPropertySetter method to cache the method
    classTemplate.$propertyInfo = {};

    /**
     *  Reference to a parent class
     *  @attribute $parent
     *  @type {zebkit.Class}
     *  @protected
     *  @readOnly
     */

    // copy parents prototype methods and fields into
    // new class template
    classTemplate.$parent = parentClass;
    if (parentClass !== null) {
        for(var k in parentClass.prototype) {
            if (parentClass.prototype.hasOwnProperty(k)) {
                var f = parentClass.prototype[k];
                classTemplate.prototype[k] = (typeof f !== 'undefined' &&
                                              f !== null &&
                                              f.hasOwnProperty("methodBody")) ? $ProxyMethod(f.methodName, f.methodBody, f.boundTo)
                                                                              : f;
            }
        }
    }

    /**
     * The instance class.
     * @attribute clazz
     * @type {zebkit.Class}
     */
    classTemplate.prototype.clazz = classTemplate;

    // check if the method has been already defined in the class
    if (typeof classTemplate.prototype.properties === 'undefined') {
        classTemplate.prototype.properties = function(p) {
            return properties(this, p);
        };
    }

    // populate class template prototype methods and fields
    for(var ptf in classTemplateProto) {
        classTemplate.prototype[ptf] = classTemplateProto[ptf];
    }

    // copy methods from interfaces before mixing class methods
    if (toInherit.length > 0) {
        for(var idx = toInherit[0].clazz === Interface ? 0 : 1; idx < toInherit.length; idx++) {
            var ic = toInherit[idx];
            $cpMethods(ic.prototype, classTemplate.prototype, classTemplate);

            // copy static fields from interface to the class
            for(var sk in ic) {
                if (sk[0] !== '$' &&
                    ic.hasOwnProperty(sk) === true &&
                    classTemplate.hasOwnProperty(sk) === false)
                {
                    classTemplate[sk] = clone(ic[sk]);
                }
            }
        }
    }

    // add class declared methods
    $mixing(classTemplate, classMethods);

    // populate static fields
    // TODO: exclude the basic static methods and static constant
    // static inheritance
    classTemplate.$uniqueness = false;


    if (parentClass !== null) {
        for (var key in parentClass) {
            if (key[0] !== '$' &&
                parentClass.hasOwnProperty(key) &&
                classTemplate.hasOwnProperty(key) === false)
            {
                classTemplate[key] = clone(parentClass[key]);
            }
        }

        if (parentClass.$uniqueness === true) {
            classTemplate.hashable();
        }
    }

    // populate class level methods and fields into class template
    for (var tf in classTemplateFields) {
        classTemplate[tf] = classTemplateFields[tf];
    }

    // assign proper name to class
    classTemplate.clazz.$name = "zebkit.Class";

    // copy methods from interfaces
    if (toInherit.length > 0) {
        // notify inherited class and interfaces that they have been inherited with the given class
        for(var j = 0; j < toInherit.length; j++) {
            if (typeof toInherit[j].inheritedWidth === 'function') {
                toInherit[j].inheritedWidth(classTemplate);
            }
        }
    }

    return classTemplate;
});

/**
 * Get class by the given class name
 * @param  {String} name a class name
 * @return {Function} a class. Throws exception if the class cannot be
 * resolved by the given class name
 * @method forName
 * @throws Error
 * @for  zebkit.Class
 */
Class.forName = function(name) {
    return $cache(name);
};

/**
 * Create an instance of the class
 * @param  {Object} [arguments]* arguments to be passed to the class constructor
 * @return {Object} an instance of the class.
 * @method newInstance
 * @for  zebkit.Class
 */
Class.newInstance = function() {
    return newInstance(this, arguments);
};

/**
 * Test if the given object is instance of the specified class or interface. It is preferable
 * to use this method instead of JavaScript "instanceof" operator whenever you are dealing with
 * zebkit classes and interfaces.
 * @param  {Object} obj an object to be evaluated
 * @param  {Function} clazz a class or interface
 * @return {Boolean} true if a passed object is instance of the given class or interface
 * @method instanceOf
 * @for  zebkit
 */
function instanceOf(obj, clazz) {
    if (clazz !== null && typeof clazz !== 'undefined') {
        if (obj === null || typeof obj === 'undefined')  {
            return false;
        } else if (typeof obj.clazz === 'undefined') {
            return (obj instanceof clazz);
        } else {
            return typeof obj.clazz !== 'undefined' && obj.clazz !== null &&
                   (obj.clazz === clazz ||
                    obj.clazz.$parents.hasOwnProperty(clazz.$hash$));
        }
    }

    throw new Error("instanceOf(): null class");
}

/**
 * Dummy class that implements nothing but can be useful to instantiate
 * anonymous classes with some on "the fly" functionality:
 *
 *     // instantiate and use zebkit class with method "a()" implemented
 *     var ac = new zebkit.Dummy([
 *          function a() {
 *             ...
 *          }
 *     ]);
 *
 *     // use it
 *     ac.a();
 *
 * @constructor
 * @class zebkit.Dummy
 */
var Dummy = Class([]);


$export(clone, instanceOf, newInstance,
        { "Class": Class, "Interface" : Interface, "Dummy": Dummy, "CDNAME": CDNAME, "CNAME" : CNAME });

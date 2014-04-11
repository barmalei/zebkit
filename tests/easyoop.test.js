
if (typeof(zebra) === "undefined") {
    if (typeof arguments[0] === "undefined") p = "";
    else p = arguments[0] + "/";
    load(p + 'lib/zebra/easyoop.js');
    load(p + 'lib/zebra/tools.js');
}

(function () {
    var assertException = zebra.assertException, assert = zebra.assert, assume = zebra.assume,
        Class = zebra.Class, Interface = zebra.Interface;

    zebra.runTests("Zebra easy OOP",

        function test_cache() {
            zebra.$cacheSize = 3;

            zebra.A = "1";
            zebra.B = "2";
            zebra.C = "3";
            zebra.D = "4";
            zebra.E = "5";

            assert(zebra.$cachedE.length, 0);

            // add first entry A
            assert(zebra.$cache("zebra.A"), "1");
            assert(zebra.$cachedO["zebra.A"].i, 0);
            assert(zebra.$cachedO["zebra.A"].o, "1");
            assert(zebra.$cachedE.indexOf("zebra.A"), 0);
            assert(zebra.$cachedE.length, 1);
            assert(zebra.$cache("zebra.A"), "1");
            assert(zebra.$cachedO["zebra.A"].i, 0);
            assert(zebra.$cachedO["zebra.A"].o, "1");
            assert(zebra.$cachedE.indexOf("zebra.A"), 0);
            assert(zebra.$cachedE.length, 1);
            assert(zebra.$cache("zebra.A"), "1");
            assert(zebra.$cachedO["zebra.A"].i, 0);
            assert(zebra.$cachedO["zebra.A"].o, "1");
            assert(zebra.$cachedE.indexOf("zebra.A"), 0);
            assert(zebra.$cachedE.length, 1);

            // add second entry [A, B]
            assert(zebra.$cache("zebra.B"), "2");
            assert(zebra.$cachedO["zebra.B"].i, 1);
            assert(zebra.$cachedO["zebra.B"].o, "2");
            assert(zebra.$cachedO["zebra.A"].i, 0);
            assert(zebra.$cachedO["zebra.A"].o, "1");
            assert(zebra.$cachedE.indexOf("zebra.A"), 0);
            assert(zebra.$cachedE.indexOf("zebra.B"), 1);
            assert(zebra.$cachedE.length, 2);

            // access second entry (change nothing) [A, B]
            assert(zebra.$cache("zebra.B"), "2");
            assert(zebra.$cachedO["zebra.B"].i, 1);
            assert(zebra.$cachedO["zebra.B"].o, "2");
            assert(zebra.$cachedO["zebra.A"].i, 0);
            assert(zebra.$cachedO["zebra.A"].o, "1");
            assert(zebra.$cachedE.indexOf("zebra.A"), 0);
            assert(zebra.$cachedE.indexOf("zebra.B"), 1);
            assert(zebra.$cachedE.length, 2);            


            // access first entry (change order) [B, A]
            assert(zebra.$cache("zebra.A"), "1");
            assert(zebra.$cachedO["zebra.B"].i, 0);
            assert(zebra.$cachedO["zebra.B"].o, "2");
            assert(zebra.$cachedO["zebra.A"].i, 1);
            assert(zebra.$cachedO["zebra.A"].o, "1");
            assert(zebra.$cachedE.indexOf("zebra.A"), 1);
            assert(zebra.$cachedE.indexOf("zebra.B"), 0);
            assert(zebra.$cachedE.length, 2);

            // access first entry (change nothing) [B, A]
            assert(zebra.$cache("zebra.A"), "1");
            assert(zebra.$cachedO["zebra.B"].i, 0);
            assert(zebra.$cachedO["zebra.B"].o, "2");
            assert(zebra.$cachedO["zebra.A"].i, 1);
            assert(zebra.$cachedO["zebra.A"].o, "1");
            assert(zebra.$cachedE.indexOf("zebra.A"), 1);
            assert(zebra.$cachedE.indexOf("zebra.B"), 0);
            assert(zebra.$cachedE.length, 2);

            // access second entry (change order) [A, B]
            assert(zebra.$cache("zebra.B"), "2");
            assert(zebra.$cachedO["zebra.B"].i, 1);
            assert(zebra.$cachedO["zebra.B"].o, "2");
            assert(zebra.$cachedO["zebra.A"].i, 0);
            assert(zebra.$cachedO["zebra.A"].o, "1");
            assert(zebra.$cachedE.indexOf("zebra.A"), 0);
            assert(zebra.$cachedE.indexOf("zebra.B"), 1);
            assert(zebra.$cachedE.length, 2);

            // add third entry [A, B, C]
            assert(zebra.$cache("zebra.C"), "3");
            assert(zebra.$cachedO["zebra.C"].i, 2);
            assert(zebra.$cachedO["zebra.C"].o, "3");
            assert(zebra.$cachedO["zebra.B"].i, 1);
            assert(zebra.$cachedO["zebra.B"].o, "2");
            assert(zebra.$cachedO["zebra.A"].i, 0);
            assert(zebra.$cachedO["zebra.A"].o, "1");
            assert(zebra.$cachedE.indexOf("zebra.A"), 0);
            assert(zebra.$cachedE.indexOf("zebra.B"), 1);
            assert(zebra.$cachedE.indexOf("zebra.C"), 2);
            assert(zebra.$cachedE.length, 3);

            // access third entry (change nothing) [ A, B, C]
            assert(zebra.$cache("zebra.C"), "3");
            assert(zebra.$cachedO["zebra.C"].i, 2);
            assert(zebra.$cachedO["zebra.C"].o, "3");
            assert(zebra.$cachedO["zebra.B"].i, 1);
            assert(zebra.$cachedO["zebra.B"].o, "2");
            assert(zebra.$cachedO["zebra.A"].i, 0);
            assert(zebra.$cachedO["zebra.A"].o, "1");
            assert(zebra.$cachedE.indexOf("zebra.A"), 0);
            assert(zebra.$cachedE.indexOf("zebra.B"), 1);
            assert(zebra.$cachedE.indexOf("zebra.C"), 2);
            assert(zebra.$cachedE.length, 3);

            // access A entry (change order)   [ B, A, C ]
            assert(zebra.$cache("zebra.A"), "1");
            assert(zebra.$cachedO["zebra.C"].i, 2);
            assert(zebra.$cachedO["zebra.C"].o, "3");
            assert(zebra.$cachedO["zebra.B"].i, 0);
            assert(zebra.$cachedO["zebra.B"].o, "2");
            assert(zebra.$cachedO["zebra.A"].i, 1);
            assert(zebra.$cachedO["zebra.A"].o, "1");
            assert(zebra.$cachedE.indexOf("zebra.A"), 1);
            assert(zebra.$cachedE.indexOf("zebra.B"), 0);
            assert(zebra.$cachedE.indexOf("zebra.C"), 2);            
            assert(zebra.$cachedE.length, 3);

            // access A entry (change order)  [ B, C, A ]
            assert(zebra.$cache("zebra.A"), "1");
            assert(zebra.$cachedO["zebra.C"].i, 1);
            assert(zebra.$cachedO["zebra.C"].o, "3");
            assert(zebra.$cachedO["zebra.B"].i, 0);
            assert(zebra.$cachedO["zebra.B"].o, "2");
            assert(zebra.$cachedO["zebra.A"].i, 2);
            assert(zebra.$cachedO["zebra.A"].o, "1");
            assert(zebra.$cachedE.indexOf("zebra.A"), 2);
            assert(zebra.$cachedE.indexOf("zebra.B"), 0);
            assert(zebra.$cachedE.indexOf("zebra.C"), 1);   
            assert(zebra.$cachedE.length, 3);         

            // access A entry  [ B, C, A ]
            assert(zebra.$cache("zebra.A"), "1");
            assert(zebra.$cachedO["zebra.C"].i, 1);
            assert(zebra.$cachedO["zebra.C"].o, "3");
            assert(zebra.$cachedO["zebra.B"].i, 0);
            assert(zebra.$cachedO["zebra.B"].o, "2");
            assert(zebra.$cachedO["zebra.A"].i, 2);
            assert(zebra.$cachedO["zebra.A"].o, "1");
            assert(zebra.$cachedE.indexOf("zebra.A"), 2);
            assert(zebra.$cachedE.indexOf("zebra.B"), 0);
            assert(zebra.$cachedE.indexOf("zebra.C"), 1);
            assert(zebra.$cachedE.length, 3);

            // add D entry  [D, C, A]      
            assert(zebra.$cache("zebra.D"), "4");
            assert(zebra.$cachedO["zebra.C"].i, 1);
            assert(zebra.$cachedO["zebra.C"].o, "3");
            assert(zebra.$cachedO["zebra.A"].i, 2);
            assert(zebra.$cachedO["zebra.A"].o, "1");
            assert(zebra.$cachedO["zebra.D"].i, 0);
            assert(zebra.$cachedO["zebra.D"].o, "4");
            assert(zebra.$cachedO["zebra.B"], undefined);
            assert(zebra.$cachedE.indexOf("zebra.A"), 2);
            assert(zebra.$cachedE.indexOf("zebra.B"), -1);
            assert(zebra.$cachedE.indexOf("zebra.C"), 1);
            assert(zebra.$cachedE.indexOf("zebra.D"), 0);
            assert(zebra.$cachedE.length, 3);

            // access entry D [C, D, A]      
            assert(zebra.$cache("zebra.D"), "4");
            assert(zebra.$cachedO["zebra.C"].i, 0);
            assert(zebra.$cachedO["zebra.C"].o, "3");
            assert(zebra.$cachedO["zebra.B"], undefined);
            assert(zebra.$cachedO["zebra.A"].i, 2);
            assert(zebra.$cachedO["zebra.A"].o, "1");
            assert(zebra.$cachedO["zebra.D"].i, 1);
            assert(zebra.$cachedO["zebra.D"].o, "4");
            assert(zebra.$cachedE.indexOf("zebra.A"), 2);
            assert(zebra.$cachedE.indexOf("zebra.C"), 0);
            assert(zebra.$cachedE.indexOf("zebra.D"), 1);
            assert(zebra.$cachedE.length, 3);


            // add entry E [E, D, A]      
            assert(zebra.$cache("zebra.E"), "5");
            assert(zebra.$cachedO["zebra.C"], undefined);
            assert(zebra.$cachedO["zebra.B"], undefined);
            assert(zebra.$cachedO["zebra.A"].i, 2);
            assert(zebra.$cachedO["zebra.A"].o, "1");
            assert(zebra.$cachedO["zebra.D"].i, 1);
            assert(zebra.$cachedO["zebra.D"].o, "4");
            assert(zebra.$cachedO["zebra.E"].i, 0);
            assert(zebra.$cachedO["zebra.E"].o, "5");
            assert(zebra.$cachedE.indexOf("zebra.A"), 2);
            assert(zebra.$cachedE.indexOf("zebra.C"), -1);
            assert(zebra.$cachedE.indexOf("zebra.B"), -1);
            assert(zebra.$cachedE.indexOf("zebra.D"), 1);
            assert(zebra.$cachedE.indexOf("zebra.E"), 0);
            assert(zebra.$cachedE.length, 3);
        },

        function test_function_name_detection() {
            var f = [
                function a() {},
                function   a  () {},
                function   a() {},
                function a  () {},
                function a(p1) {

                },
                function a (p2) {},
                function  a(p2) {},
                function   a (p2) {},
                function a( p2 ) {},
                function a  ( p2, p3) {},
                function   a  
                ( 
                    p2, 

                    p3) 


                {}
            ]
        
            for(var i=0; i < f.length; i++) {
                assert(zebra.$FN(f[i]), "a");
            }
        },

        function test_context() {
            function A() {
                this.toString = function() {
                    return "!";
                };
            }

            var a = new A();
            assert(a.toString(), "!", "toString method overriding in object constructor");
            assert(a.hasOwnProperty("toString"), true, "toString is in");
            var t = false;
            for(var k in a) { if (k == 'toString') t = true; }
            assume(t, true, "toString is in enumeration 1");

            function aaa() {
                var r = [];
                for(var k in arguments) {
                    if (arguments.hasOwnProperty(k)) r.push(arguments[k]);
                }
                return r;
            }

            var r = aaa();
            assume(r.length, 0, 'arguments treated as object with for-in construction 1');

            var r = aaa(1,2,3);
            assume(r.length, 3, 'arguments treated as object with for-in construction 2');
            assume(r[0], 1);
            assume(r[1], 2);
            assume(r[2], 3);

            // test Google error where using empty name can bring to real weird results!
            function GA() {
                var f = function() {
                    this[""].call(this);
                };
                f.prototype[""] = function() {};
                return f;
            }
            var GB = GA(), error = 0, success = 0;        
            
            for(var i=0; i < 1000; i++) {
                var l = new GB();
                if (l.abscdef != null) error++;
                else success++;
            }
            assume(success, 1000, "Google developers were heavily dragged");

            var test = function () {};
            test.constructor = "TEST";

            assert(test.constructor, "TEST", "Function constructor is assignable");
        },

        function test_isString() {
            assert(zebra.isString("string literal"), true, "literal");
            assert(zebra.isString("String object"), true, "String object");
            assert(zebra.isString(1), false, "number literal");
            assert(zebra.isString(true), false, "boolean literal");
            assert(zebra.isString({}), false, "object");
            assert(zebra.isString(zebra.kkkkkkkk), false, "undefined");
            assert(zebra.isString(null), false, "null");
            assert(zebra.isString(1), false, "number");
        },

        function test_isNumber() {
            assert(zebra.isNumber("string literal"), false, "literal as number");
            assert(zebra.isNumber("String object"), false, "String as number");
            assert(zebra.isNumber(1), true, "number");
            assert(zebra.isNumber("1"), false, "number as string");
            assert(zebra.isNumber(true), false, "boolean literal");
            assert(zebra.isNumber({}), false, "object");
            assert(zebra.isNumber(zebra.kkkkkkkk), false, "undefined");
            assert(zebra.isNumber(null), false, "null");
        },

        function test_isBoolean() {
            assert(zebra.isBoolean("string literal"), false, "literal as bool");
            assert(zebra.isBoolean("true"), false, "true literal as bool");
            assert(zebra.isBoolean("false"), false, "false literal as bool");
            assert(zebra.isBoolean("String object"), false, "String as bool");
            assert(zebra.isBoolean(1), false, "number as bool");
            assert(zebra.isBoolean(0), false, "number as bool");
            assert(zebra.isBoolean({}), false, "obj as bool");
            assert(zebra.isBoolean(undefined), false, "undefined as bool");
            assert(zebra.isBoolean(null), false, "null as bool");
            assert(zebra.isBoolean(test_isBoolean), false, "function as bool");
            assert(zebra.isBoolean(true), true, "boolean as bool");
            assert(zebra.isBoolean(false), true, "boolean as bool");
            assert(zebra.isBoolean(new Boolean()), true, "boolean instance as bool");
        },

        function test_zebra() {
            assert(typeof zebra.version !== 'undefined', true);
            assert(typeof zebra.$FN === 'function', true);
        },

        function test_methods() {
            var A = new Class([
                function(p1, p2) {},
                function a() { return "1"; },
                function toString() {
                    return "*";
                }
            ]);

            assert((new A(2,2)).toString(), '*',  "Test toString overriding possibility");


            // test method proxy
            var A = Class([
                function toString(a) { return a; }
            ]);
            // assert(typeof A.getMethod("toString", 1).modifier !== "undefined", true, "Proxy method correct wrap existent method");
            assert(typeof A.getMethod("toString", 1).methodName !== "undefined", true, "Proxy method correct wrap existent method 1");
            assert(typeof A.getMethod("toString", 1).boundTo !== "undefined", true, "Proxy method correct wrap existent method 2");
            // assert(A.getMethod("toString", 1).modifier === 0, true, "Proxy method correct wrap existent method");
            assert(A.getMethod("toString", 1).methodName === "toString", true, "Proxy method correct wrap existent method 3");
            assert(A.getMethod("toString", 1).boundTo == A, true, "Proxy method correct wrap existent method 4");

            // assert(typeof A.getMethod("toString", 0).modifier !== "undefined", true, "Proxy method correct wrap existent method");
            assert(typeof A.getMethod("toString", 0).methodName !== "undefined", true, "Proxy method correct wrap existent method 5");
            assert(typeof A.getMethod("toString", 0).boundTo !== "undefined", true, "Proxy method correct wrap existent method 6");
            // assert(A.getMethod("toString", 0).modifier === 0, true, "Proxy method correct wrap existent method");
            assert(A.getMethod("toString", 0).methodName == "toString", true, "Proxy method correct wrap existent method 7");
            assert(A.getMethod("toString", 0).boundTo == A, true, "Proxy method correct wrap existent method 8");

            var a = new A();
            assert(a.toString("11") == "11", true);
            assert(a.toString() != a.toString("11"), true);
        },

        function test_class() {
            assert(typeof zebra.Interface.$clazz != 'undefined', true, "test_class 2");
            assertException(function() {  zebra.instanceOf(Class, null); }, Error, "test_class 1");

            assert(zebra.instanceOf(Class, Class), false, "test_class 2");
            assert(typeof Class.$clazz != 'undefined', true, "test_class 2");
            assert(Class.$clazz, null, "test_class 2");
            assertException(function() { new Class();  }, Error, "test_class 3");
            var A = new Class([]);

            assert(typeof A.$clazz !== 'undefined', true, "test_class 5");
            assert(A.$clazz, Class, "test_class 6");
            assert(A.$parent, null, "test_class 8");

            assert(A.getMethod('', 1), null, "test_class 9");
            assert(A.getMethod('blablabla'), null, "test_class 10");

            // this should be not a class instance methods
            assert(A.getMethod('getMethod', 2), null, "test_class 11");
            assert(A.getMethod('getMethods', 0), null, "test_class 12");

            var B = new Class([
                function a() {},
                function a(p) {}
            ]);

            assert(B.getMethod('a', 0) !== null, true, "test_class 14");
            assert(B.getMethod('a', 1) !== null, true, "test_class 15");
            assert(B.getMethod('a', 2), null, "test_class 16");

            assertException(function() { Class("", []); }, ReferenceError, "test_class 17");
            assertException(function() { Class(null, []); }, ReferenceError, "test_class 17");
            assertException(function() { Class(1, []); }, ReferenceError, "test_class 17");
            assertException(function() { Class({}, []); }, ReferenceError, "test_class 17");
            assertException(function() { Class([], []); }, ReferenceError, "test_class 17");
            assertException(function() { Class("1", []); }, ReferenceError, "test_class 17");
            assertException(function() { Class(0, []); }, ReferenceError, "test_class 17");
            assertException(function() { Class(B.ccccc, []); }, ReferenceError, "test_class 17");

            assertException(function() { Class(B, null, []); }, ReferenceError, "test_class 17");
            assertException(function() { Class(B, "", []); }, ReferenceError, "test_class 17");
            assertException(function() { Class(B, 1, []); }, ReferenceError, "test_class 17");
            assertException(function() { Class(B, B.cccc, []); }, ReferenceError, "test_class 17");

            var A = new Class([
                function(p1, p2) {},
                function(p1) {}
            ]);

            assert(A.getMethod('', 0), null, "test_class 20");
            assert(A.getMethod('', 3), null, "test_class 21");
            assert(A.$clazz == Class, true, "test_class 22");
            assert(A.getMethod('', 1) !== null, true, "test_class 22");
            assert(A.getMethod('', 2) !== null, true, "test_class 23");

            var B = new Class(A, [
                function(p1, p2) {},
                function() {}
            ]);

            assert(B.getMethod('', 1), null, "test_class 24");
            assert(B.getMethod('', 3), null, "test_class 25");

            assert(B.$clazz == Class, true, "test_class 26");
            assert(B.getMethod('', 0) !== null, true, "test_class 26");
            assert(B.getMethod('', 2) !== null, true, "test_class 27");

            assert(B.$parent == A, true, "test_class 33");
            assert(A.$parent === null, true, "test_class 34");

            assert(B.getMethod('', 2).boundTo == B, true, "test_class 35");
            assert(B.getMethod('', 0).boundTo == B, true, "test_class 36");
            assert(A.getMethod('', 2).boundTo == A, true, "test_class 37");
            assert(A.getMethod('', 1).boundTo == A, true, "test_class 38");

            if (!zebra.isIE) {
                assertException(function() { Class(DHJ); }, ReferenceError, "test_class 20");
                assertException(function() { Class(DHJ, MMM); }, ReferenceError, "test_class 20");
            }

            var a = new A(1), b = new B();
            assert(a.$clazz == A, true, "test_class 38");
            assert(b.$clazz == B, true, "test_class 38");
            assert(b.$clazz != a.$clazz, true, "test_class 38");

            var I = new Interface(), I2 = new Interface(I);
            assert(I.$clazz == Interface, true, "test_class 38");
            assert(I2.$clazz == Interface, true, "test_class 38");
            var i = new I(), i2 = new I2();
            assert(i.$clazz == I, true, "test_class 38");
            assert(i2.$clazz == I2, true, "test_class 38");
            assert(i2.$clazz != i.$clazz, true, "test_class 38");

            assert(typeof a.toString == 'function' && typeof a.toString.$clone$ == 'undefined', true, 'toString in class instance');
            assert(typeof a.$this == 'function' && typeof a.$this.$clone$ == 'undefined', true, 'toString in class instance');
            assert(typeof a.$super == 'function'  && typeof a.$super.$clone$ == 'undefined', true, 'equals in class instance');
            assert(typeof i.toString == 'function' && typeof i.toString.$clone$ == 'undefined', true, 'toString in interface instance');
          
            var a = new A(1), b = new B();
            assert(A, a.constructor, "test_class 38");
            assert(B, b.constructor, "test_class 38");
            assert(a.$clazz, A, "test_class 38");
            assert(a.$clazz, a.constructor, "test_class 38");
            assert(b.$clazz, B, "test_class 38");
            assert(b.$clazz, b.constructor, "test_class 38");
            assert(A != B, true, "test_class 38");
        },

        function test_array_classdef() {
            var A = new Class([
                function a() {
                    return 1;
                },

                function a(b) {
                    b = this.a() + b;
                    return b;
                }
            ]);

            var a = new A();
            assert(A.getMethod("a", 0) !== null, true);
            assert(A.getMethod("a", 1) !== null, true);
            assert(a.a(), 1);
            assert(a.a(1), 2);
        },

        function test_unique() {
            function count(o) {
                var c = 0;
                for(var k in o) c++;
                return c;
            }

            var h = {};
            var A = new Class([]);
            var B = new Class(A, [
                function a() { return 10; } 
            ]);

            h[A] = true;
            var C = new Class([]);
            h[C] = true;
            h[A] = true;
            h[B] = true;
            assert(count(h), 3);
            assert(h[A] !== null , true, "Different classes are unique");

            var h = {};
            h[new A()] = true;
            h[new A()] = true;
            h[new B()] = true;
            assert(count(h), 3, "Instances (even the same classes) of classes are unique");

            var h = {};
            var c = new A([
                function b() {}
            ]);

            h[c] = true;
            h[new A()] = true;
            h[new A()] = true;
            h[new B()] = true;
            h[c] = true;
            assert(count(h), 4);

            var h = {};
            var a = new A();
            h[a] = true;
            h[new A()] = true;
            h[a] = true;
            assert(count(h), 2);
        },

        function test_instance() {
            var A = new Class([]);
            var a = new A();
            assert(zebra.instanceOf(a,Class), false, "Instance of a class is not instance of Class");
            assert(zebra.instanceOf(a,A), true, "Instance of class is instance of the class");
            assert(zebra.instanceOf(a,Object), false, "Class should not be an instance of standard JS Object class");
            assert(zebra.instanceOf(a,String), false, "Class should not be an instance of standard JS String class");
            assert(a.$clazz, A, "getClazz has to point to a class an object has been instantiated");
        },

        function test_constructor() {
            var A = new Class([
                function(a) { this.v = a; },
                function(a, b) { this.v = a + b; },
                function(a, b, c) { this.v = a + b + c; },
                function(a, b, c, d, e) { this.v = a + b + c + d + e; }
            ]);

            var B = new Class(A, [
                function(a) { this.v = 2*a; },
              
                function(a, b) {
                    this.$this(1);
                    this.k = 2*(a + b);
                },

                function(a, b, c) {
                    this.$super(a, b, c);
                    this.k = this.v * 2;
                }
            ]);

            var C = new Class(B, [
                function(a) {
                    this.c = 2*a;
                    this.$super(a, 1, 2, 3, 4);
                }
            ]);

            var a;

            assertException(function() { new A();}, ReferenceError, "test_constructor 1");
            assertException(function() { new A(1,2,3,4);}, ReferenceError, "test_constructor 2");

            a = new A(10);
            assert(a.v, 10, "test_constructor 3");
            a = new A(10, 10);
            assert(a.v, 20, "test_constructor 4");
            a = new A(10, 10, 10);
            assert(a.v, 30, "test_constructor 5");
            a = new A(10, 10, 10, 10, 10);
            assert(a.v, 50, "test_constructor 6");


            var b;
            assertException(function() { new B(); }, ReferenceError, "test_constructor 7");
            assertException(function() { new B(1,2,3,4); }, ReferenceError,  "test_constructor 8");
            assertException(function() { new B(1,2,3,4, 5); }, ReferenceError, "test_constructor 9");

            b = new B(10);
            assert(b.v, 20, "test_constructor 10");

            b = new B(10, 10);
            assert(b.k, 40, "test_constructor 11");
            assert(b.v, 2, "test_constructor 12");

            b = new B(10, 10, 10);
            assert(b.k, 60, "test_constructor 13");
            assert(b.v, 30, "test_constructor 14");

            var c = new C(12);
            assert(c.c, 24, "test_constructor 15");
            assert(c.v, 22, "test_constructor 16");

            assertException(function() { new C(); }, ReferenceError, "test_constructor 17");
            assertException(function() { new C(1,2,3,4); }, ReferenceError, "test_constructor 18");
            assertException(function() { new C(1,2); }, ReferenceError, "test_constructor 19");
            assertException(function() { new C(1,2,2,2,2); }, ReferenceError, "test_constructor 20");

            var D = new Class([
                function() { this.d = 134; }
            ]);

//            assertException(function() { new Class(D, []); }, Error, "test_constructor 21");

            var E = new Class(D, [
                function(a) { this.e = a; }
            ]);

            assertException(function() { new D(1); }, ReferenceError, "test_constructor 22");
            assertException(function() { new E(); }, ReferenceError, "test_constructor 23");

            var d = new D();
            assert(d.d, 134, "test_constructor 24");
            var e = new E(133);
            assert(e.e, 133, "test_constructor 25");

            var A = new Class([
                function() { this.$this(1); },
                function(a) { this.a = a; }
            ]);

            var B = new Class(A, [
                function() {
                    this.a = 11;
                    this.$super();
                },

                function(a) {
                    this.$super();
                    this.a = a;
                }
            ]);

            var a = new A(), aa = new A(100);

            assert(a.a, 1, "test_constructor 26");
            assert(aa.a, 100, "test_constructor 27");
            var b = new B(), bb = new B(100);
            assert(b.a, 1, "test_constructor 271");
            assert(bb.a, 100, "test_constructor 272");

            var AA = Class([ function() { this.aa = 999; } ]); 

            var A = Class(AA, [
                function() {
                    this.$this(1);
                },

                function(a) {
                    this.$this(a, 2);
                },

                function(a, b) {
                    this.$super();
                    this.a = a;
                    this.b = b;
                }
            ]);

            var B = Class(A, []);
            var C = Class(A, [ function() { this.$super(10, 200); } ]);
            var D = Class(B, [ function() { this.$super(100, 2000); } ]);

            assert(AA.getMethods('').length, 1, "test_constructor 28"); 
            assert(A.getMethods('').length, 3, "test_constructor 29"); 
            assert(B.getMethods('').length, 3, "test_constructor 30"); 
            assert(C.getMethods('').length, 1, "test_constructor 31"); 
            assert(D.getMethods('').length, 1, "test_constructor 32"); 
       
            var a1 = new A(), a2 = new A(22), a3 = new A(33, 44); 
            var b1 = new B(), b2 = new B(222), b3 = new B(333, 444);  
            var c1 = new C(), d1 = new D(); 

            assert(a1.a, 1, "test_constructor 33");
            assert(a1.b, 2, "test_constructor 34");
            assert(a1.aa, 999, "test_constructor 35");
            assert(a2.a, 22, "test_constructor 36");
            assert(a2.b, 2, "test_constructor 37");
            assert(a2.aa, 999, "test_constructor 38");
            assert(a3.a, 33, "test_constructor 39");
            assert(a3.b, 44, "test_constructor 40");
            assert(a2.aa, 999, "test_constructor 41");

            assert(b1.a, 1, "test_constructor 42");
            assert(b1.b, 2, "test_constructor 43");
            assert(b1.aa, 999, "test_constructor 44");

            assert(b2.a, 222, "test_constructor 45");
            assert(b2.b, 2, "test_constructor 46");
            assert(b2.aa, 999, "test_constructor 47");            
            
            assert(b3.a, 333, "test_constructor 48");
            assert(b3.b, 444, "test_constructor 49");
            assert(b3.aa, 999, "test_constructor 50");

            assert(c1.a, 10, "test_constructor 51");
            assert(c1.b, 200, "test_constructor 52");
            assert(c1.aa, 999, "test_constructor 53");

            assert(d1.a, 100, "test_constructor 54");
            assert(d1.b, 2000, "test_constructor 55");
            assert(d1.aa, 999, "test_constructor 56");


            var A = Class([
                function $prototype() {

                    this[''] = function(test) {
                        this.a = 100;
                        this.test = test;
                    };  

                }
            ]);

            var a1 = new A(), a2 = new A(100);

            assert(a1.a, 100, "test_constructor 57");
            assert(a1.test, undefined, "test_constructor 58");
            assert(a2.test, 100, "test_constructor 59");
            assert(a2.a, 100, "test_constructor 60");
            

            var B =  Class(A, [
                function() {
                    this.$super(200);
                }
            ]), b = new B();

            assert(b.a, 100, "test_constructor 61");
            assert(b.test, 200, "test_constructor 62");


            var C =  Class(A, []), D = Class(C, [
                function() {
                    this.$super(300);
                },

                function(a) {
                    this.$super(a);
                }
            ]), c = new C(), d = new D(), dd = new D(11);

            assert(c.a, 100, "test_constructor 63");
            assert(c.test, undefined, "test_constructor 64");
            assert(d.a, 100, "test_constructor 65");
            assert(d.test, 300, "test_constructor 66");
            assert(dd.test, 11, "test_constructor 67");
            assert(dd.a, 100, "test_constructor 68");


            // var B = Class(A, [
            //     function $prototype() {
            //         this[''] = function() {
            //             this.$super(this[''], 100);
            //         };
            //     }
            // ]), b  = new B();

        },

        function test_proto_methods() {
            var A = Class([function $prototype() {
                this.a = 10;

                this.b = function() {
                    return 10;
                };
            }]);
            var a = new A();

            assert(A.getMethod("b") != null, true);
            assert(a.a, 10);
            assert(a.b(), 10);

            var B = Class(A, [function $prototype() {
                this.b = function() {
                    return 100;
                };
            }]);
            var b = new B();

            assert(B.getMethod("b") != null, true);
            assert(b.a, 10);
            assert(b.b(), 100);

            var C = Class(A, [
                function b() {
                    return 100 + this.$super();
                },

                function b(p1) {
                    return this.b() + p1 + this.$super();
                }
            ]);
            var c = new C();


            assert(C.getMethod("b") != null, true);
            assert(c.a, 10);
            assert(c.b(), 110);
            assert(c.b(1), 121);

            var B = Class(A, []);
            var C = Class(B, [
                function b() {
                    return 100 + this.$super();
                },

                function b(p1) {
                    return this.b() + p1 + this.$super();
                }
            ]);
            var c = new C();

            assert(C.getMethod("b") != null, true);
            assert(c.a, 10);
            assert(c.b(), 110);
            assert(c.b(1), 121);


            // test if a standard method defined in Class.prototype can be overridden 
            var C = Class([
                function $prototype() {
                    this.properties = function() {
                        return 10;
                    }
                }
            ]), c = new C();

            assert(c.properties(), 10);


            var CC = Class(C, [
            ]), cc = new CC();
        

            assert(cc.properties(), 10);
        },


        function test_public_methods() {
            var A = new Class([
                function a() {  return 1;  },
                function a(p1) { return p1; },
                function a(p1, p2) { return p1 + p2; },
                function aa(p1, p2, p3) { return p1 + p2 + p3; }
            ]);

            var a = new A();
            assert(a.a(), 1);
            assert(a.a(2), 2);
            assert(a.a(3), 3);
            assert(a.a(3, 3), 6);
            assert(a.a(3, 4), 7);
            assert(a.aa(0, 0, 0), 0);

            assertException(function() { a.b(); }, TypeError);
            assertException(function() { a.a(1,2,3,4); }, ReferenceError);
            assertException(function() { a.aa(1,2,3, 4); }, ReferenceError);
        },

        function test_inteface() {
            assert(((zebra.Interface()) instanceof zebra.Interface), false, "test_interface1");
            assert(((new zebra.Interface()) instanceof zebra.Interface), false, "test_interface1");
            assert(zebra.instanceOf(zebra.Interface(), zebra.Interface), true, "test_interface2");

            var I1 = new zebra.Interface(), I2 = new zebra.Interface();
            assert(I1 == I2, false, "test_interface3");
            var m = {};
            m[I1] = 1;
            m[I2] = 2;
            assert(m[I1], 1, "test_interface4");
            assert(m[I2], 2, "test_interface5");

            var I1 = new zebra.Interface(), I2 = new zebra.Interface(), I3 = new zebra.Interface(), I4 = new zebra.Interface();
            assert(I1 == I2, false, "test_interface6");
            assert(I1 == I3, false, "test_interface7");
            assert(I3 == I2, false, "test_interface8");
            assert(zebra.instanceOf(I1, I2), false, "test_interface9");
            assert(zebra.instanceOf(I1, I3), false, "test_interface9");
            assert(zebra.instanceOf(I1, I1), false, "test_interface9");
            assert(zebra.instanceOf(I2, I1), false, "test_interface9");
            assert(zebra.instanceOf(I2, I2), false, "test_interface9");
            assert(zebra.instanceOf(I2, I3), false, "test_interface9");
            assert(zebra.instanceOf(I3, I1), false, "test_interface9");
            assert(zebra.instanceOf(I3, I3), false, "test_interface9");
            assert(zebra.instanceOf(I3, I2), false, "test_interface9");

            var II   = new zebra.Interface(I1, I2);
            var III  = new zebra.Interface(I1, I2, I3);
            var IIII = new zebra.Interface(II, III);
            var C1 = new Class(II,   []);
            var C2 = new Class(III,  []);
            var C3 = new Class(IIII, []);
            var C4 = new Class(I4, II, I3, []);

            var o = new C1();
            assert(zebra.instanceOf(o,C1), true, "test_interface9");
            assert(zebra.instanceOf(o,II), true, "test_interface10");
            assert(zebra.instanceOf(o,I1), true, "test_interface11");
            assert(zebra.instanceOf(o,I2), true, "test_interface12");
            assert(zebra.instanceOf(o,I3), false, "test_interface13");
            assert(zebra.instanceOf(o,III), false, "test_interface14");
            assert(zebra.instanceOf(o,IIII), false, "test_interface15");
            assert(zebra.instanceOf(o,I4), false, "test_interface16");

            var o = new C2();
            assert(zebra.instanceOf(o,C2), true, "test_interface17");
            assert(zebra.instanceOf(o,C1), false, "test_interface18");
            assert(zebra.instanceOf(o,II), false, "test_interface19");
            assert(zebra.instanceOf(o,III), true, "test_interface20");
            assert(zebra.instanceOf(o,I1), true, "test_interface21");
            assert(zebra.instanceOf(o,I2), true, "test_interface22");
            assert(zebra.instanceOf(o,I3), true, "test_interface23");
            assert(zebra.instanceOf(o,IIII), false, "test_interface24");
            assert(zebra.instanceOf(o,I4), false, "test_interface25");

            var o = new C3();
            assert(zebra.instanceOf(o,C1), false, "test_interface27");
            assert(zebra.instanceOf(o,C2), false, "test_interface28");
            assert(zebra.instanceOf(o,C3), true, "test_interface29");
            assert(zebra.instanceOf(o,II), true, "test_interface30");
            assert(zebra.instanceOf(o,III), true, "test_interface31");
            assert(zebra.instanceOf(o,IIII), true, "test_interface32");

            assert(zebra.instanceOf(o,I1), true, "test_interface33");
            assert(zebra.instanceOf(o,I2), true, "test_interface34");
            assert(zebra.instanceOf(o,I3), true, "test_interface35");
            assert(zebra.instanceOf(o,I4), false, "test_interface36");

            var o = new C4();
            assert(zebra.instanceOf(o,C1), false);
            assert(zebra.instanceOf(o,C2), false);
            assert(zebra.instanceOf(o,C3), false);
            assert(zebra.instanceOf(o,C4), true);
            assert(zebra.instanceOf(o,I4), true);
            assert(zebra.instanceOf(o,II), true);
            assert(zebra.instanceOf(o,I1), true);
            assert(zebra.instanceOf(o,I2), true);
            assert(zebra.instanceOf(o,I3), true);
            assert(zebra.instanceOf(o,III), false);
            assert(zebra.instanceOf(o,IIII), false);

            var C1 = Class([]), c1 = new C1();
            var C2 = Class(C1, []), c2 = new C2();
            var C3 = Class(C2, []), c3 = new C3();

            assert(zebra.instanceOf(c1, C1), true);
            assert(zebra.instanceOf(c1, C2), false);
            assert(zebra.instanceOf(c1, C3), false);

            assert(zebra.instanceOf(c2, C1), true);
            assert(zebra.instanceOf(c2, C2), true);
            assert(zebra.instanceOf(c2, C3), false);

            assert(zebra.instanceOf(c3, C1), true);
            assert(zebra.instanceOf(c3, C2), true);
            assert(zebra.instanceOf(c3, C3), true);
        },

        function test_static_methods() {
            var A = new Class([
                function $clazz() {
                    this.a  = function() {  return 1;  };
                    this.aa = function(p1, p2, p3) { return p1 + p2 + p3; };
                }
            ]);

            function t1() {
                assert(A.a(), 1, "test_static_methods_1");
                assert(A.aa(0, 0, 2), 2, "test_static_methods_6");
                assertException(function() { A.b(); }, TypeError);
            }
            t1();

            var B = new Class(A, [
                function $clazz(){
                    this.a  = function(p1, p2) { return p1 * p2; };
                    this.aa = function(p1, p2, p3) { return p1 * p2 * p3; };
                }
            ]);

            function t2() {
                assert(B.a(3, 3), 9, "test_static_methods_4");
                assert(B.a(3, 4), 12, "test_static_methods_5");
                assert(B.aa(2, 2, 2), 8, "test_static_methods_6");
            }
            t2();


            var C = new Class([ 
                function $clazz() {
                    this.a = function(p1, p2) { return p1 * p2; };
                }
            ]);
            var c = new C();
            assert(C.a(3, 3), 9, "test_static_methods_4");
            assert(C.a(3, 4), 12, "test_static_methods_5");

            // test side effect
            t2();
            t1();
        },

        function test_static_fields() {
            var A = new Class([ 
                function $clazz() {
                    this.a = 100;
                    this.b = 200;
                    this.c = 300;
                }
            ]);


            function t1() {
                assert(A.a, 100, "test_static_fields 1");
                assert(A.b, 200, "test_static_fields 2");
                assert(A.c, 300, "test_static_fields 3");
                assertException(function() { A.b(); }, TypeError);
                assertException(function() { A.a(); }, TypeError);
                assertException(function() { A.c(); }, TypeError);
            }
            t1();

            var B = new Class(A, [ 
                function $clazz() {
                    this.a = 1000;
                    this.b = 2000;
                }
            ]);


            function t2() {
                assert(B.a, 1000, "test_static_fields 1");
                assert(B.b, 2000, "test_static_fields 2");
                assert(B.c, undefined, "test_static_fields 3");
                assertException(function() { B.b(); }, TypeError);
                assertException(function() { B.a(); }, TypeError);
                assertException(function() { B.c(); }, TypeError);
            }
            t2();


            var C = new Class(B, []);
            assert(C.a, undefined, "test_static_fields 1");
            assert(C.b, undefined, "test_static_fields 2");
            assert(C.c, undefined, "test_static_fields 3");

            assertException(function() { C.b(); }, TypeError);
            assertException(function() { C.a(); }, TypeError);
            assertException(function() { C.c(); }, TypeError);

            // side effect
            t1();
            t2();
        },

        function test_fields() {
            var A = new Class([
                function $prototype() {
                    this.a = 100;
                    this.b = 200;
                    this.c = 300;
                    this.d = 0;
                    this.e = false;
                }
            ]);

            var a = new A();
            assert(a.a, 100);
            assert(a.b, 200);
            assert(a.c, 300);
            assert(a.d, 0);
            assert(a.e, false);
            assert(a.f, undefined);

            var B = Class(A, []);
            var b = new B();
            assert(b.a, 100);
            assert(b.b, 200);
            assert(b.c, 300);
            assert(b.d, 0);
            assert(b.e, false);
            assert(b.f, undefined);

            var c = new B([
                function $prototype() {
                    this.cc = 100000;
                    this.a = 11111;
                }
            ]);

            assert(c.a, 11111);
            assert(c.cc, 100000);
            assert(c.b, 200);
            assert(c.c, 300);
            assert(c.d, 0);
            assert(c.e, false);
            assert(c.f, undefined);

            assertException(function() { a.b(); }, TypeError);
            assertException(function() { a.a(); }, TypeError);
            assertException(function() { a.c(); }, TypeError);
            assertException(function() { a.d(); }, TypeError);
            assertException(function() { a.e(); }, TypeError);
            assertException(function() { a.f(); }, TypeError);

            assertException(function() { b.b(); }, TypeError);
            assertException(function() { b.a(); }, TypeError);
            assertException(function() { b.c(); }, TypeError);
            assertException(function() { b.d(); }, TypeError);
            assertException(function() { b.e(); }, TypeError);
            assertException(function() { b.f(); }, TypeError);
        },

        function test_mixed_fields_and_methods() {
            var A = new Class([
                function $prototype() {
                    this.a = 100;
                    this.b = 200;
                    this.c = 300;
                },

                function $clazz() {
                    this.a = 1000;
                    this.b = 2000;
                    this.c = 3000;

                    this.ma = function() {  return 1;  };
                    this.maa = function(p1, p2, p3) { return p1 + p2 + p3; };
                    this.ms = function() { return 100; };
                },

                function ma() {  return 2;  },
                function ma(p1) { return 2*p1; },
                function ma(p1, p2) { return 2*(p1 + p2); },
                function maa(p1, p2, p3) { return 2*(p1 + p2 + p3); }
            ]);

            var a = new A();
            assert(a.a, 100);
            assert(a.b, 200);
            assert(a.c, 300);

            assert(A.a, 1000);
            assert(A.b, 2000);
            assert(A.c, 3000);

            assert(A.ma(), 1);
            assert(A.maa(0, 0, 0), 0);

            assert(a.ma(), 2);
            assert(a.maa(1, 1, 2), 8);
            assertException(function () {a.ms();}, TypeError);
        },

        function test_inheritance() {
            var I1 = new zebra.Interface();
            var I2 = new zebra.Interface();
            var A = new Class(I1, []), B = new Class(A, []), C = new Class(B, I2, []), D = new Class(I1, I2, []);
            var a = new A(), b = new B(), c = new C(), d = new D();
            assert(zebra.instanceOf(a,A), true);
            assert(zebra.instanceOf(a,B), false);
            assert(zebra.instanceOf(a,C), false);
            assert(zebra.instanceOf(a,I1), true);
            assert(zebra.instanceOf(a,I2), false);
            assert(a.$clazz, A);
            assert(a.$clazz.$parent, null);


            assert(zebra.instanceOf(b,A), true);


            assert(zebra.instanceOf(b,B), true);

            assert(zebra.instanceOf(b,C), false);
            assert(zebra.instanceOf(b,I1), true);
            assert(zebra.instanceOf(b,I2), false);
            assert(b.$clazz, B);
            assert(b.$clazz.$parent, A);

            assert(zebra.instanceOf(c,A), true);
            assert(zebra.instanceOf(c,B), true);
            assert(zebra.instanceOf(c,C), true);
            assert(zebra.instanceOf(c,I1), true);
            assert(zebra.instanceOf(c,I2), true);
            assert(c.$clazz, C);
            assert(c.$clazz.$parent, B);

            assert(zebra.instanceOf(d,A), false);
            assert(zebra.instanceOf(d,B), false);
            assert(zebra.instanceOf(d,C), false);
            assert(zebra.instanceOf(d,D), true);
            assert(zebra.instanceOf(d,I1), true);
            assert(zebra.instanceOf(d,I2), true);

            assert(zebra.instanceOf(d,String), false);
            assert(zebra.instanceOf(d,Function), false);
            assert(zebra.instanceOf(D, String), false);
            assert(zebra.instanceOf(D, Function), false);

            assert(d.$clazz, D);
            assert(d.$clazz.$parent,  null);
        },

        function test_overriding() {
            var A = new Class([
                function a() { return 22; },
                function a(p) { return p; },
                function a(p1, p2) { return p1 + p2; },
                function $clazz() {
                   this.a = function() { return 1; };
                }
            ]);

            var B = new Class(A, [
                function a() { return 111; },
                function b() {
                    return this.$super(this.a);
                }
            ]);

            var C = new Class(B, [
                function a() {
                    return 222;
                },

                function a(p1, p2) {
                     var d = this.$super(p1, p2);
                     return d + 10;
                },

                function c(p1, p2) {
                     return this.$super(this.a, p1, p2) + 1;
                }
            ]);

            var a = new A(), b = new B(), c = new C();


            assert(a.a(), 22);
            assert(a.a(12), 12);
            assert(a.a(12, 12), 24);



            assert(b.a(), 111);

            assert(b.a(33), 33);
            assert(b.a(2, 1), 3);
            assert(b.b(), 22);


            assert(c.c(6, 6), 13);
            assert(c.a(), 222);
            assert(c.a(18), 18);
            

            assert(c.b(), 22);
            assert(c.a(3,3), 16);

            assert(A.a(), 1);

            // check the subsequent class definition and instantiation has no influence to parent class
            var a = new A(), b = new B();
            assert(a.a(), 22);
            assert(a.a(12), 12);
            assert(a.a(12, 12), 24);

            assert(b.a(), 111);
            assert(b.a(33), 33);
            assert(b.a(2, 1), 3);
            assert(b.b(), 22);

            // test double super
            var A = new zebra.Class([
                function b() { return 1000; }
            ]);

            var B = new zebra.Class(A, [
                function b() { return this.$super() + 1; } 
            ]);

            var C = new zebra.Class(B, [
                function b() { return this.$super() + 2; } 
            ]);

            assert((new C()).b(), 1003);
            assert((new B()).b(), 1001);
            assert((new A()).b(), 1000);

            function t()  {
                var A = new zebra.Class([
                    function b() { return 1000; }, 
                    function b() { return 2000; } 
                ]);
            }
            assertException(t, Error);
        },

        function test_dynamic() {
            var A = new Class([
                function a() { return 100; },
                function a(p) { return p; },
                function a(p1, p2) { return p1 + p2; },
                function $prototype() { this.m = 33; }
            ]);

            var a = new A();

            assert(a.a(), 100);
            assert(a.a(1), 1);
            assert(a.a(1, 2), 3);
            assert(a.m, 33);

            a.extend([ 
                function a() {
                    return 200;
                },

                function a(p) {
                    return 10;
                }
            ]);

            assert(a.a(), 200);
            assert(a.a(1), 10);
            assert(a.a(3,3), 6);

            a.m = 150;
            assert(a.m, 150);

            var a = new A();

            assert(a.a(), 100);
            assert(a.a(1), 1);
            assert(a.a(1, 2), 3);

            assert(a.m, 33);

            // should not be in global space
            assert(this['a'], undefined);
            assert(zebra.$global['a'], undefined);

            var A = new Class([
                function $prototype() {
                    this.a = function () { return 100; };
                },

                function m1() {

                }
            ]);

            var a = new A();
            assert(a.a(), 100);

            a.extend([ 
                function a() {
                    return this.$super() + 100;
                }
            ]);
            assert(a.a(), 200);


            var M = [
                function a()  { return 502; },
                function m1() { return 500; },
                function m2() { return 501; }
            ];

            A.extend(M);

            a = new A();
            assert(A.getMethod("m1") != null, true);
            assert(a.m1 != null, true);
            assert(a.m1(), 500);
            assert(A.getMethod("m2") != null, true);
            assert(a.m2 != null, true);
            assert(a.m2(), 501);
            assert(a.a(), 502);

            var B = Class([]); 
            B.extend(M);

            a = new B();
            assert(B.getMethod("m1") != null, true);
            assert(a.m1 != null, true);
            assert(a.m1(), 500);
            assert(B.getMethod("m2") != null, true);
            assert(a.m2 != null, true);
            assert(a.m2(), 501);
            assert(a.a(), 502);
        },

        function test_anonymous() {
            var A = new Class([
                function a() { return 1; },
                function a(p) { return p; }
            ]);

            var a = new A();
            assert(a.a(), 1, "Class defined method a()");
            assert(a.a(11), 11, "Class defined method a(1)");

            a = new A([
                function a() { return 2; },
                function a(p1, p2) { return p1 + p2; },
                function b () {
                    return 777;
                }
            ]);

            assert(a.b() != null, true, "new anonymous  method b()");
            assert(a.b(), 777, "new anonymous  method b()");

            assert(a.a(), 2, "anonymous overridden method a()");
            assert(a.a(22), 22, "anonymous didn't touch method a(1)");
            assert(a.a(22, 1), 23, "anonymous declared new method a(2)");
            assert(zebra.instanceOf(a,A), true, "anonymous is instance of initial class");
            assert(a.$clazz != (new A()).$clazz, true, "anonymous class doesn't equal initial class");
            assert(a.$clazz.$parent == A, true, "anonymous has proper parent class");


            a = new A();
            assert(a.a(), 1, "anonymous didn't touch method a() of initial class");
            assert(a.a(12), 12, "anonymous didn't touch method a(1) of initial class");
            assertException(function() { a.a(12, 12); }, ReferenceError, "anonymous didn't add method a(2) to initial class");
            assert(this['a'], undefined, "anonymous didn't update current scope");
            assert(zebra.$global['a'], undefined, "anonymous didn't update global scope");

            var A = new Class([
                function(m) { this.m = m; }
            ]);

            a = new A(100, [
                function(m) {
                    this.$super(m);
                }
            ]);

            assert(a.m, 100, "anonymous properly called super method");

            var I = new zebra.Interface();
            var i = new I([
                function a() {
                    return 10;
                }
            ]);

            assert(zebra.instanceOf(i, I), true);
            assert(i.a(), 10);

            var A = new Class([
                function() { this.m = 100; }
            ]);

            assertException(function() {
                new A([]);
            }, Error);

            var a = new A([
                 function() { this.$super(); }
            ]);
            assert(a.m, 100);

            var I = new zebra.Interface();
            var aa = new A(I, [
                 function() { this.m = 200; }
            ]);
            assert(zebra.instanceOf(aa, I), true);
            assert(zebra.instanceOf(a, I), false);
            assert(zebra.instanceOf(aa, A), true);
            assert(zebra.instanceOf(a, A), true);
            assert(aa.m, 200);
            assert(a.m, 100);

            var I2 = new zebra.Interface();
            var aaa = new A(300, I, I2, [
                 function(p) { this.m = p; }
            ]);
            assert(zebra.instanceOf(aaa, A), true);
            assert(zebra.instanceOf(aaa, I), true);
            assert(zebra.instanceOf(aaa, I2), true);
            assert(aaa.m, 300);

            assert(zebra.instanceOf(aa, A), true);
            assert(zebra.instanceOf(aa, I), true);
            assert(zebra.instanceOf(aa, I2), false);
            assert(aa.m, 200);

            assert(zebra.instanceOf(a, A), true);
            assert(zebra.instanceOf(a, I), false);
            assert(zebra.instanceOf(a, I2), false);
            assert(a.m, 100);

            assert(a != aa, true);
            assert(a != aaa, true);
            assert(aa != aaa, true);

            assertException(function() {
                var aaa = new A(300, 200, I, I2, [
                     function(p) { this.m = p; }
                ]);
            }, Error);


            var A = Class([
                function a() {
                    return 10;
                }

            ]);
            A.$name = "Test";

            var a1 = new A(), a2 = new A([
                function a() {
                    return 20;
                }
            ]);

            assert(a1.$clazz,  A);
            assert(a1.$clazz.$name,  "Test");
            assert(a2.$clazz != A,  true);
            assert(a2.$clazz.$name ,  "Test");
        },

        function test_packaging() {

            function isPackage(v) {
               return v && zebra.$FN(v.constructor) === "Package";
            }

            var np = zebra("newpackage");
            assert(isPackage(np), true);

            var NS = zebra.namespace('NS');

            NS('ui').var1 = 1;
            NS('ui').var2 = 2;
            NS('ui').var3 = 3;
            NS('ui.grid').var1 = 4;
            NS('ui.grid').var4 = 5;


            assert(NS.ui.var1, 1, "test_packaging1");
            assert(NS.ui.var2, 2, "test_packaging2");
            assert(NS.ui.var3, 3, "test_packaging3");
            assert(NS.ui.grid.var1, 4, "test_packaging4");
            assert(NS.ui.grid.var4, 5, "test_packaging4s1");

            assert(isPackage(NS.ui.grid), true, "test_packaging41");
            assert(isPackage(NS.ui), true, "test_packaging42");
            assert(isPackage(NS["ui.grid"]), true, "test_packaging43");
            assert(isPackage(NS["ui"]), true, "test_packaging44");
            assert(NS["ui.var1"], undefined, "test_packaging45");
            assert(NS["ui.grid.var1"], undefined, "test_packaging46");

            assert(NS('ui').var1, 1, "test_packaging5");
            assert(NS('ui').var2, 2, "test_packaging6");
            assert(NS('ui').var3, 3, "test_packaging7");
            assert(NS('ui.grid').var1, 4, "test_packaging8");
            assert(NS('ui.grid').var4, 5, "test_packaging8");
            assert(isPackage(NS('ui.grid')), true, "test_packaging81");
            assert(isPackage(NS('ui')), true, "test_packaging42");

            assert(NS() == NS(),  true);
            assert(NS() !== null && typeof NS() !== "undefined", true);
            NS({a:100, b:200});
            assert(NS().a, 100);
            assert(NS().b, 200);
            NS()['m'] = 88;
            assert(NS().m, 88);
            assert(NS().a, 100);
            assert(NS().b, 200);


            assertException(function () { NS("ui.var1", 1); }, Error, "test_packaging10" );
            assertException(function () { NS("ui.grid.var1", 1); }, Error, "test_packaging11" );

            var MyScope = zebra.namespace('MyScope');
            assert(MyScope.ui === undefined, true);
            MyScope('ui').var1 = 11;
            MyScope('ui').var11 = 111;
            MyScope('ui.grid').var1 = 24;
            assert(MyScope.ui !== undefined, true);
            assert(MyScope.ui.var11, 111);
            assert(MyScope.ui.var1, 11);
            assert(MyScope.ui.var2, undefined);
            assert(MyScope.ui.grid.var1, 24);
            assert(isPackage(MyScope.ui.grid), true, "test_packaging41");
            assert(isPackage(MyScope.ui), true, "test_packaging42");

            var MyScope2 = zebra.namespace('MyScope2');
            MyScope2(["a", "b", "c.d"]);
            MyScope2('c.d.e');
            MyScope2('a').mm = 200;
            MyScope2('c.d.e').y = 100;

            assert(isPackage(MyScope2.a), true);
            assert(isPackage(MyScope2.b), true);
            assert(isPackage(MyScope2.c), true);
            assert(isPackage(MyScope2.c.d), true);
            assert(isPackage(MyScope2.c.d.e), true);
            assert(MyScope2.c.d.e.y, 100);
            assert(MyScope2.a.mm, 200);

            var r = [];
            MyScope2(function(n, p) {
               r.push(n);
            });
            assert(r.length, 5);

            eval(MyScope2.Import());
            assert(y, 100);
            assert(mm, 200);

            zebra.namespace('GLOBAL');
            zebra.namespace('GLOBAL')("a").a = 1213;
            assert(zebra.namespace('GLOBAL').a.a, 1213);

            assertException(function () { zebra.namespace('Fictive Namespace', true); }, Error, "test_packaging12" );
            assert(zebra.namespace('MyScope2'), MyScope2);

            var NNN = zebra.namespace("NNN");
            NNN("a").b = 100;
            NNN("a").c = 200;
            NNN("a.d").k = 300;
            NNN("a.d.l");

            assert(NNN.Import('a').split(",").length, 2);
            assert(NNN.Import('a.d').split(",").length, 1);
            assert(NNN.Import().split(",").length, 3);
            assert(NNN.Import('a.d.l'), null);

            assertException(function() { NNN.Import('a.d.l', "this"); }, Error);
            assertException(function() { NNN.Import("this", 'a.d.l'); }, Error);
            assertException(function() { NNN.Import("this"); }, Error);

            var N = zebra.namespace("d");
            N(['a', 'b', 'c.d']);
            N.c.d.k = 10;
            assert(N.c.d.k, 10);
            N(['a', 'b', 'c.d']);
            assert(N.c.d.k, 10);
        },

        function test_prototype() {
            var A = Class([ 
                function $prototype() {
                    this.a = 10;
                    this.b = [1, 2, 3];
                    this.c = 300;

                    this.f = function() { return 333; };
                },

                function () {
                    this.a = 20;
                }
            ]);

            var a = new A();

            assert(a.a, 20);
            assert(a.b[0], 1);
            assert(a.b[1], 2);
            assert(a.b[2], 3);
            assert(a.b.length, 3);
            assert(a.a, 20);
            assert(typeof a.f === "function" , true);
            assert(a.f(), 333);

            var B = Class(A, [ 
                function f() {
                    return 444;
                }
            ]);

            var b = new B();
            assert(b.a, 20);
            assert(b.b[0], 1);
            assert(b.b[1], 2);
            assert(b.b[2], 3);
            assert(b.b, a.b);
            assert(b.b.length, 3);
            assert(b.a, 20);
            assert(typeof b.f === "function" , true);
            assert(b.f(), 444);


            var BB = Class(A, [
                function $prototype() {
                    this.f = function() { return 12345; };
                }
            ]);
            var bb = new BB(); 
            assert(bb.a, 20);
            assert(bb.b[0], 1);
            assert(bb.b[1], 2);
            assert(bb.b[2], 3);
            assert(bb.b, a.b);
            assert(bb.b.length, 3);
            assert(bb.a, 20);
            assert(typeof bb.f === "function" , true);
            assert(bb.f(), 12345);



            var C = Class(A, [ 
                function f(a) {
                    return 555;
                }
            ]);

            assert(C.getMethods("f").length, 2);

            var c = new C();
            assert(c.a, 20);
            assert(c.b[0], 1);
            assert(c.b[1], 2);
            assert(c.b[2], 3);
            assert(c.b, a.b);
            assert(c.b.length, 3);
            assert(c.a, 20);
            assert(typeof c.f === "function" , true);
            assert(c.f(), 333);
            assert(c.f(1), 555);

            var D = Class(A, [
                function f() {
                    return 1 + this.$super();
                },

                function f(a) {
                   return a + this.$super();  
                }
            ]);

            var d = new D();
            assert(d.f(), 334);
            assert(d.f(2), 335);

        },

        function test_caller() {
            var A = new zebra.Class([
                function() {
                    assert(zebra.$caller == A.getMethod('', 0), true, "test_caller 1");
                    this.toM();
                    assert(zebra.$caller == A.getMethod('', 0), true, "test_caller 2");
                },

                function toM() {
                    assert(zebra.$caller.toString() == toM.toString(), true, "test_caller 3");
                    return "M";
                }
            ]);
            new A();
        },

        function test_mixing() {
            var A = Class([
                function a() {
                    return 10;
                },

                function a(p1) {
                    return p1;
                }
            ]), I = Interface();


            var a = new A(), clz = a.$clazz;
            assert(a.a(), 10);
            assert(a.a(111), 111);
            assert(zebra.instanceOf(a, zebra.$Extended), false);

            a.extend([
                function() {
                    this.ff = 333;
                },

                function a() {
                    return 200;
                },

                function a(p1) {
                    return this.$super(p1 + 10);
                }
            ]);

            var mclz = a.$clazz;
            assert(a.a(), 200);
            assert(a.a(123), 133);
            assert(a.ff, 333);
            assert(mclz != clz, true);
            assert(zebra.instanceOf(a, zebra.$Extended), true);

            // one more extension on the same instance
            a.extend([
                function() {
                    this.fff = 333;
                },

                function a() {
                    return this.a(111, 200);
                },

                function a(p1) {
                    return this.$super(p1 + 20);
                },

                function a(p1, p2) {
                    return p1 + p2;
                }
            ]);
            assert(a.a(), 311);
            assert(a.a(123), 143);
            assert(a.ff, 333);
            assert(a.fff, 333);
            assert(a.a(100,11), 111);
            assert(mclz == a.$clazz, true);
            assert(zebra.instanceOf(a, zebra.$Extended), true)

            // no side effect to parent class
            var a = new A(), clz = a.$clazz;
            assert(a.a(), 10);
            assert(a.a(111), 111);
            assert(zebra.instanceOf(a, zebra.$Extended), false);

            // more deep super calling
            var B = Class(A, [
                function b() {
                    return this.$super(this.a);
                }
            ]), b = new B();

            assert(b.a(), 10);
            assert(b.b(), 10);
            assert(b.a(111), 111);
            assert(zebra.instanceOf(b, zebra.$Extended), false);
            assert(zebra.instanceOf(b, I), false);

            b.extend(I, [
                function b() {
                    return this.$super(this.a, 121);                   
                }
            ])

            assert(b.a(), 10);
            assert(b.b(), 121);
            assert(b.a(112), 112);
            assert(zebra.instanceOf(b, zebra.$Extended), true);
            assert(zebra.instanceOf(b, I), true);

            // no side effect to parent class
            var b = new B(), clz = a.$clazz;
            assert(b.a(), 10);
            assert(b.b(), 10);
            assert(b.a(111), 111);
            assert(zebra.instanceOf(b, zebra.$Extended), false);
            assert(zebra.instanceOf(b, I), false);

            var A = Class([
                function $prototype() {
                    this.a = function() {
                        return 101;
                    };
                }
            ]), a = new A();
            assert(a.a(), 101);
            
            a.extend([
                function a() {
                    return this.$super() + 100;                   
                }
            ]);
            assert(a.a(), 201);

        }
    );
})();

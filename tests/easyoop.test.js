
if (typeof(zebra) === "undefined") {
    if (typeof arguments[0] === "undefined") p = "";
    else p = arguments[0] + "/";
    load(p + 'src/easyoop.js');
    load(p + 'src/extras.js');
    load(p + 'src/util.js');
    load(p + 'src/tools.js');
}

(function () {
    var assertException = zebra.assertException, assert = zebra.assert, assume = zebra.assume,
        Class = zebra.Class, Interface = zebra.Interface, assertObjEqual = zebra.assertObjEqual;

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
            // assert(typeof zebra.getMethod(A, "toString", 1).modifier !== "undefined", true, "Proxy method correct wrap existent method");
            assert(typeof zebra.getMethod(A, "toString").methodName !== "undefined", true, "Proxy method correct wrap existent method 1");
            assert(typeof zebra.getMethod(A, "toString").boundTo !== "undefined ", true, "Proxy method correct wrap existent method 2");


            // assert(zebra.getMethod(A, "toString", 1).modifier === 0, true, "Proxy method correct wrap existent method");
            assert(zebra.getMethod(A, "toString").methodName === "toString", true, "Proxy method correct wrap existent method 3");
            assert(zebra.getMethod(A, "toString").boundTo == A, true, "Proxy method correct wrap existent method 4");

            // assert(typeof zebra.getMethod(A, "toString", 0).modifier !== "undefined", true, "Proxy method correct wrap existent method");
            assert(typeof zebra.getMethod(A, "toString").methodName !== "undefined", true, "Proxy method correct wrap existent method 5");
            assert(typeof zebra.getMethod(A, "toString").boundTo !== "undefined", true, "Proxy method correct wrap existent method 6");
            // assert(zebra.getMethod(A, "toString").modifier === 0, true, "Proxy method correct wrap existent method");
            assert(zebra.getMethod(A, "toString").methodName == "toString", true, "Proxy method correct wrap existent method 7");
            assert(zebra.getMethod(A, "toString").boundTo == A, true, "Proxy method correct wrap existent method 8");

            var a = new A();
            assert(a.toString("11") === "11", true);
            assert(a.toString() != a.toString("11"), true);

            assertException(function() {
                var A = new Class([
                    function a() { return "1"; },
                    function a(b) {
                        return "*";
                    }
                ]);
            }, Error);

            assertException(function() {
                var A = new Class([
                    function () { },
                    function (b) {
                    }
                ]);
            }, Error);
        },

        function test_class() {
            assert(typeof zebra.Interface.clazz != 'undefined', true, "test_class 2");
            assertException(function() {  zebra.instanceOf(Class, null); }, Error, "test_class 1");

            assert(zebra.instanceOf(Class, Class), false, "test_class 2");
            assert(typeof Class.clazz != 'undefined', true, "test_class 2");
            assert(Class.clazz, null, "test_class 2");
            assertException(function() { new Class();  }, Error, "test_class 3");
            var A = new Class([]);

            assert(typeof A.clazz !== 'undefined', true, "test_class 5");
            assert(A.clazz, Class, "test_class 6");
            assert(A.$parent, null, "test_class 8");

            assert(zebra.getMethod(A, '', 1), null, "test_class 9");
            assert(zebra.getMethod(A, 'blablabla'), null, "test_class 10");

            // this should be not a class instance methods
            assert(zebra.getMethod(A, 'getMethod'), null, "test_class 11");
            assert(zebra.getMethod(A, 'getMethods'), null, "test_class 12");

            var B = new Class([
                function a() {},
                function b(p) {}
            ]);

            assert(zebra.getMethod(B, 'a') !== null, true, "test_class 14");
            assert(zebra.getMethod(B, 'b') !== null, true, "test_class 15");

            assertException(function() { Class("", []); }, ReferenceError, "test_class 171");
            assertException(function() { Class(null, []); }, ReferenceError, "test_class 172");
            assertException(function() { Class(1, []); }, ReferenceError, "test_class 173");
            assertException(function() { Class({}, []); }, ReferenceError, "test_class 174");
            assertException(function() { Class([], []); }, ReferenceError, "test_class 175");
            assertException(function() { Class("1", []); }, ReferenceError, "test_class 176");
            assertException(function() { Class(0, []); }, ReferenceError, "test_class 177");
            assertException(function() { Class(B.ccccc, []); }, ReferenceError, "test_class 178");

            assertException(function() { Class(B, null, []); }, ReferenceError, "test_class 179");
            assertException(function() { Class(B, "", []); }, ReferenceError, "test_class 180");
            assertException(function() { Class(B, 1, []); }, ReferenceError, "test_class 181");
            assertException(function() { Class(B, B.cccc, []); }, ReferenceError, "test_class 182");

            var A = new Class([
                function(p1, p2) {},
            ]);

            assert(A.clazz == Class, true, "test_class 22");
            assert(zebra.getMethod(A, '') !== null, true, "test_class 222");

            var B = new Class(A, [
                function(p1, p2) {},
            ]);

            assert(B.clazz == Class, true, "test_class 26");
            assert(zebra.getMethod(B, '') !== null, true, "test_class 26");

            assert(B.$parent == A, true, "test_class 33");
            assert(A.$parent === null, true, "test_class 34");

            assert(zebra.getMethod(B, '').boundTo == B, true, "test_class 35");
            assert(zebra.getMethod(A, '').boundTo == A, true, "test_class 37");

            if (!zebra.isIE) {
                assertException(function() { Class(DHJ); }, ReferenceError, "test_class 20");
                assertException(function() { Class(DHJ, MMM); }, ReferenceError, "test_class 20");
            }

            var a = new A(1), b = new B();
            assert(a.clazz == A, true, "test_class 38");
            assert(b.clazz == B, true, "test_class 381");
            assert(b.clazz != a.clazz, true, "test_class 382");

            var I = new Interface(), I2 = new Interface(I);
            assert(I.clazz == Interface, true, "test_class 383");
            assert(I2.clazz == Interface, true, "test_class 384");
            var i = new I(), i2 = new I2();
            assert(i.clazz == I, true, "test_class 385");
            assert(i2.clazz == I2, true, "test_class 386");
            assert(i2.clazz != i.clazz, true, "test_class 387");


            assert(typeof a.toString == 'function' && typeof a.toString.methofBody == 'undefined', true, 'toString in class instance1');
            assert(typeof a.$super == 'function'  && typeof a.$super.methofBody == 'undefined', true, 'equals in class instance3');
            assert(typeof i.toString == 'function' && typeof i.toString.methofBody == 'undefined', true, 'toString in interface instance4');

            var a = new A(1), b = new B();
            assert(A, a.constructor, "test_class 389");
            assert(B, b.constructor, "test_class 340");
            assert(a.clazz, A, "test_class 341");
            assert(a.clazz, a.constructor, "test_class 342");
            assert(b.clazz, B, "test_class 343");
            assert(b.clazz, b.constructor, "test_class 344");
            assert(A != B, true, "test_class 345");
        },

        function test_array_classdef() {
            var A = new Class([
                function a() {
                    return 1;
                },

                function b(b) {
                    b = this.a() + b;
                    return b;
                }
            ]);

            var a = new A();
            assert(zebra.getMethod(A, "a") !== null, true);
            assert(zebra.getMethod(A, "b") !== null, true);
            assert(a.a(), 1);
            assert(a.b(1), 2);
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
            assert(a.clazz, A, "getClazz has to point to a class an object has been instantiated");
        },

        function test_constructor() {
            var K = Class([ function c() { return 10; } ]);
            var k = new K();    // no exception;
            assert(k.c(), 10);

            var A = Class([
                function(a, b, c, d, e) {
                    this.v = a + (b==null?0:b) + (c==null?0:c) + (d==null?0:d) + (e==null?0:e);
                }
            ]);

            var B = Class(A, [
                function(a, b, c, d, e) {
                    if (arguments.length == 1)  {
                        this.v = 2 * a;
                        return;
                    }
                    else {
                        if (arguments.length === 2) {
                            this.v = 2 * a;
                            this.k = 2*(a + b);
                            return;
                        }
                        else {
                            if (arguments.length === 5) {
                                this.$super(a, b, c, d, e);
                                return;
                            }
                        }
                    }

                    this.$super(a, b, c);
                    this.k = this.v * 2;
                }
            ]);

            var C = Class(B, [
                function(a) {
                    this.c = 2*a;
                    this.$super(a, 1, 2, 3, 4);

                    this.l = 0;
                    for(var i=0; i<arguments.length; i++)  this.l += arguments[i];
                    this.ll = arguments.length;
                }
            ]);

            var a = new A(10);
            assert(a.v, 10, "test_constructor 3");
            a = new A(10, 10);
            assert(a.v, 20, "test_constructor 4");
            a = new A(10, 10, 10);
            assert(a.v, 30, "test_constructor 5");
            a = new A(10, 10, 10, 10, 10);
            assert(a.v, 50, "test_constructor 6");

            var b = new B(10);
            assert(b.v, 20, "test_constructor 10");

            b = new B(10, 10);
            assert(b.k, 40, "test_constructor 11");
            assert(b.v, 20, "test_constructor 12");

            b = new B(10, 10, 10);
            assert(b.k, 60, "test_constructor 13");
            assert(b.v, 30, "test_constructor 14");

            var c = new C(12);
            assert(c.c, 24, "test_constructor 15");
            assert(c.v, 22, "test_constructor 16");
            assert(c.l, 12, "test_constructor 151");
            assert(c.ll, 1, "test_constructor 161");

            c = new C();
            assert(c.l, 0, "test_constructor 151");
            assert(c.ll, 0, "test_constructor 161");

            c = new C(1,2,3,4);
            assert(c.l, 10, "test_constructor 151");
            assert(c.ll, 4, "test_constructor 161");

            var D = new Class([
                function() { this.d = 134; }
            ]);

            var E = new Class(D, [
                function(a) { this.e = a; }
            ]);


            zebra.assertNoException(function() { new D(1); }, ReferenceError, "test_constructor 22");
            zebra.assertNoException(function() { new E(); }, ReferenceError, "test_constructor 23");
            var e = new E();
            assert(e.a, undefined, "test_constructor 24");


            var d = new D();
            assert(d.d, 134, "test_constructor 24");
            var e = new E(133);
            assert(e.e, 133, "test_constructor 25");

            var A = new Class([
                function(a) {
                    this.a = (a == null ? 1 : a);
                }
            ]);

            var B = new Class(A, [
                function(a) {
                    this.$super(a == null ? 11 : a);
                }
            ]);

            var a = new A(), aa = new A(100);

            assert(a.a, 1, "test_constructor 26");
            assert(aa.a, 100, "test_constructor 27");
            var b = new B(), bb = new B(100);
            assert(b.a, 11, "test_constructor 271");
            assert(bb.a, 100, "test_constructor 272");

            var AA = Class([ function() { this.aa = 999; } ]);

            var A = Class(AA, [
                function(a, b) {
                    this.$super();
                    this.a = a == null ? 1 : a;
                    this.b = b == null ? 2 : b;
                }
            ]);

            var B = Class(A, []);
            var C = Class(A, [ function() { this.$super(10, 200); } ]);
            var D = Class(B, [ function() { this.$super(100, 2000); } ]);

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
                function(a) {
                    this.$super(a == null ? 300 : a);
                }
            ]), c = new C(), d = new D(), dd = new D(11);

            assert(c.a, 100, "test_constructor 63");
            assert(c.test, undefined, "test_constructor 64");
            assert(d.a, 100, "test_constructor 65");
            assert(d.test, 300, "test_constructor 66");
            assert(dd.test, 11, "test_constructor 67");
            assert(dd.a, 100, "test_constructor 68");


            var A = Class([
                function(a, b) {
                    this.test = 100;
                }
            ]), a = new A(), aa= new A(1), aaa = new A(1, 2);

            assert(a.test, 100);
            assert(aa.test, 100);
            assert(aaa.test, 100);

            var B = Class(A, [
                function() {
                    this.$super();
                    this.test2 = 200;
                    this.args = arguments.length;
                }
            ]), b = new B(), bb= new B(1), bbb = new B(1, 2);


            assert(b.test, 100);
            assert(b.test2, 200);
            assert(b.args, 0);
            assert(bb.test, 100);
            assert(bb.test2, 200);
            assert(bb.args, 1);
            assert(bbb.test, 100);
            assert(bbb.test2, 200);
            assert(bbb.args, 2);


            var A = Class([
                function $prototype() {
                    this[''] = function() {
                        this.test = 234;
                    }
                }
            ]), a = new A(), aa = new A(1,2), aaa = new A(2,3,4);

            assert(a.test, 234);
            assert(aa.test, 234);
            assert(aaa.test, 234);


            var B = Class(A, [
                function() {
                    this.$super();
                    this.test2 = 223;
                    this.args = arguments.length;
                }
            ]), b = new B(), bb= new B(1), bbb = new B(1, 2);


            assert(b.test, 234);
            assert(b.test2, 223);
            assert(b.args, 0);
            assert(bb.test, 234);
            assert(bb.test2, 223);
            assert(bb.args, 1);
            assert(bbb.test, 234);
            assert(bbb.test2, 223);
            assert(bbb.args, 2);

            var C = Class(B, [
                function() {
                    this.$super();
                    this.test3 = 111;
                }
            ]), c = new C(), cc= new C(1), ccc = new C(1, 2);


            assert(c.test, 234);
            assert(c.test2, 223);
            assert(c.test3, 111);
            assert(c.args, 0);

            assert(cc.test, 234);
            assert(cc.test2, 223);
            assert(cc.test3, 111);
            assert(cc.args, 0);

            assert(ccc.test, 234);
            assert(ccc.test2, 223);
            assert(ccc.test3, 111);
            assert(ccc.args, 0);
        },

        function test_proto_methods() {
            var A = Class([function $prototype() {
                this.a = 10;

                this.b = function() {
                    return 10;
                };
            }]);
            var a = new A();

            assert(zebra.getMethod(A, "b") != null, true, "test proto  method 1");
            assert(a.a, 10), "test proto  method 2";
            assert(a.b.boundTo == null, true, "test proto  method 3");
            assert(a.b.methodName == null, true, "test proto  method 4");
            assert(a.b(), 10), "test proto  method 5";

            var B = Class(A, [function $prototype() {
                this.b = function() {
                    return 100;
                };
            }]);
            var b = new B();

            assert(zebra.getMethod(B, "b") != null, true, "test proto  method 6");
            assert(b.a, 10), "test proto  method 7";
            assert(b.b(), 100, "test proto  method 8");

            var C = Class(A, [
                function b(p1) {
                    return (p1 == null ? 100 : p1) + this.$super();
                }
            ]);
            var c = new C();

            assert(zebra.getMethod(C, "b") != null, true);
            assert(c.a, 10);
            assert(c.b(), 110);
            assert(c.b(1), 11);

            var B = Class(A, []);
            var C = Class(B, [
                function b(p1) {
                    return (p1==null?100:p1) + this.$super();
                }
            ]);
            var c = new C();

            assert(zebra.getMethod(C, "b") != null, true);
            assert(c.a, 10);
            assert(c.b(), 110);
            assert(c.b(1), 11);

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
                function a(p1, p2) {
                    return (p1 == null ? 1 : p1) + (p2 == null ? 0 : p2);
                },

                function aa(p1, p2, p3) { return p1 + p2 + p3; }
            ]);

            var a = new A();
            assert(a.a(), 1, "test_public_methods 1");
            assert(a.a(2), 2, "test_public_methods 2");
            assert(a.a(3), 3, "test_public_methods 3");

            assert(a.a(3, 3), 6, "test_public_methods 4");
            assert(a.a(3, 4), 7, "test_public_methods 5");
            assert(a.aa(0, 0, 0), 0, "test_public_methods 6");

            assertException(function() { a.b(); }, TypeError, "test_public_methods 7");
            zebra.assertNoException(function() { a.a(1,2,3,4); }, ReferenceError, "test_public_methods 8");
            zebra.assertNoException(function() { a.aa(1,2,3, 4); }, ReferenceError, "test_public_methods 9");
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
                    this.bb = function(p1, p2, p3) { return p1 * p2 * p3; };
                }
            ]);

            assert(B.aa != undefined, true);
            assert(B.aa === A.aa, true);


            function t2() {
                assert(B.a(3, 3), 9, "test_static_methods_4");
                assert(B.a(3, 4), 12, "test_static_methods_5");
                assert(B.bb(2, 2, 2), 8, "test_static_methods_6");
                assert(A.aa(0, 0, 2), 2, "test_static_methods_7");
                assert(B.aa(0, 0, 2), 2, "test_static_methods_7");
            }
            t2();

            // side effect test

            var C = new Class([
                function $clazz() {
                    this.a = function(p1, p2) { return p1 * p2; };
                }
            ]);

            assert(C.bb == undefined, true);
            assert(C.aa == undefined, true);


            var c = new C();
            assert(C.a(3, 3), 9, "test_static_methods_8");
            assert(C.a(3, 4), 12, "test_static_methods_9");

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
                assert(B.a, 1000, "test_static_fields 11");
                assert(B.b, 2000, "test_static_fields 22");
                assert(B.c, 300, "test_static_fields 33");
                assertException(function() { B.b(); }, TypeError);
                assertException(function() { B.a(); }, TypeError);
                assertException(function() { B.c(); }, TypeError);
            }
            t2();


            var C = new Class(B, []);
            assert(C.a, 1000, "test_static_fields 111");
            assert(C.b, 2000, "test_static_fields 222");
            assert(C.c, 300, "test_static_fields 3333");

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

                function ma(p1, p2) {
                    if (arguments.length == 0) return 2;
                    if (arguments.length == 1) return 2*p1;
                    return 2* (p1 + p2);
                },

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
            assert(a.clazz, A);
            assert(a.clazz.$parent, null);


            assert(zebra.instanceOf(b,A), true);


            assert(zebra.instanceOf(b,B), true);

            assert(zebra.instanceOf(b,C), false);
            assert(zebra.instanceOf(b,I1), true);
            assert(zebra.instanceOf(b,I2), false);
            assert(b.clazz, B);
            assert(b.clazz.$parent, A);

            assert(zebra.instanceOf(c,A), true);
            assert(zebra.instanceOf(c,B), true);
            assert(zebra.instanceOf(c,C), true);
            assert(zebra.instanceOf(c,I1), true);
            assert(zebra.instanceOf(c,I2), true);
            assert(c.clazz, C);
            assert(c.clazz.$parent, B);

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

            assert(d.clazz, D);
            assert(d.clazz.$parent,  null);
        },

        function test_overriding() {
            var A = new Class([
                function a(p1, p2) {
                    if (arguments.length == 0) return 22;
                    if (arguments.length == 1) return p1;
                    return p1 + p2;
                },

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
                function a(p1, p2) {
                    if (arguments.length === 0) return 222;
                    var d = this.$super(p1, p2);
                    return d + 10;
                },

                function c(p1, p2) {
                    return this.$super(this.a, p1, p2) + 1;
                }
            ]);

            var a = new A(), b = new B(), c = new C();

            assert(a.a(), 22, "test overriding 1");
            assert(a.a(12), 12, "test overriding 2");
            assert(a.a(12, 12), 24, "test overriding 3");

            assert(b.a(), 111, "test overriding 4");


            assert(b.a(33), 111, "test overriding 5");
            assert(b.a(2, 1), 111, "test overriding 6");
            assert(b.b(), 22, "test overriding 7");


            assert(c.c(6, 6), 112, "test overriding 8");
            assert(c.a(), 222, "test overriding 9");
            assert(c.a(18), 121, "test overriding 10");

            assert(c.b(), 22, "test overriding 11");
            assert(c.a(3,3), 121, "test overriding 12");

            assert(A.a(), 1, "test overriding 13");

            // check the subsequent class definition and instantiation has no influence to parent class
            var a = new A(), b = new B();
            assert(a.a(), 22, "test overriding 14");
            assert(a.a(12), 12, "test overriding 15");
            assert(a.a(12, 12), 24, "test overriding 16");

            assert(b.a(), 111, "test overriding 17");
            assert(b.a(33), 111, "test overriding 18");
            assert(b.a(2, 1), 111, "test overriding 19");
            assert(b.b(), 22, "test overriding 20");

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

            assert((new C()).b(), 1003, "test overriding 21");
            assert((new B()).b(), 1001, "test overriding 22");
            assert((new A()).b(), 1000, "test overriding 23");

            // one method with the given name means it will be always called
            // nevertheless number of parameters it gets
            var A = Class([
                function a(b1, b2) {
                    return 10;
                }
            ]), a = new A();
            assert(a.a(), 10, "test overriding 24");
            assert(a.a(1), 10, "test overriding 25");
            assert(a.a(1, 2), 10, "test overriding 26");
            assert(typeof a.a.methodBody == 'function', true, "test overriding 27");

            var B = Class(A,[]), b = new B();
            assert(b.a(), 10, "test overriding 28");
            assert(b.a(1), 10, "test overriding 29");
            assert(b.a(1, 2), 10, "test overriding 30");
            assert(typeof b.a.methodBody == 'function', true, "test overriding 31");


            var C = Class(B,[
                function a(b1, b2, b3) {
                    return 22;
                }
            ]), c = new C();
            assert(c.a(), 22, "test overriding 32");
            assert(c.a(1), 22, "test overriding 33");
            assert(c.a(1, 2), 22, "test overriding 34");
            assert(typeof c.a.methodBody == 'function', true, "test overriding 35");

            c.extend([
                function a() {
                    return 100;
                }
            ]);

            assert(c.a(), 100, "test overriding 36");
            assert(c.a(1), 100, "test overriding 37");
            assert(c.a(1, 2), 100, "test overriding 38");
            assert(typeof c.a.methodBody == 'function', true, "test overriding 39");

            var D = Class(C, [
                function a(a1, a2) {
                    if (arguments.length === 0) return 200 + this.$super();
                    if (arguments.length === 1) return 1000 + this.$super(a1);
                    return 1000 + this.$super(a1, a2);

                }
            ]), d = new D();

            assert(d.a(), 222, "test overriding 40");
            assert(d.a(1, 2), 1022, "test overriding 41");
            zebra.assertNoException(function() {
                d.a(1);
            }, Error, "test overriding 42");

            zebra.assertException(function() {
                var A = Class([
                    function $prototype() {
                        this.a = 100;
                    },

                    function a () {
                    }
                ]);
            }, Error, "test overriding 43");
        },

        function test_class_extending() {
            var A = Class([
                function a() {
                    return 1;
                },

                function aa() {
                    return 2;
                },

                function $prototype() {
                    this.aaa = function() {
                        return 22;
                    };
                }
            ]);

            var B = Class(A, [
                function b() {
                    return 4;
                },

                function aa() {
                    return 3;
                },

                function $prototype() {
                    this.bb = function() {
                        return 222;
                    };
                }
            ]);

            var C = Class(B, [
                function c() {
                    return 123;
                },

                function aa() {
                    return this.$super() + 11;
                }
            ]);

            var ob = new B(), oc = new C();

            assert(ob.a(), 1);
            assert(ob.b(), 4);
            assert(ob.aa(), 3);
            assert(ob.bb(), 222);
            assert(ob.aaa(), 22);

            assert(oc.a(), 1);
            assert(oc.b(), 4);
            assert(oc.aa(), 14);
            assert(oc.c(), 123);
            assert(oc.bb(), 222);
            assert(oc.aaa(), 22);

            assert(B.$parent, A);
            assert(B.prototype.b.boundTo, B);
            assert(B.prototype.aa.boundTo, B);
            assert(B.prototype.aaa.boundTo, undefined);
            assert(B.prototype.bb.boundTo, undefined);
            assert(B.prototype.a.boundTo, A);
            assert(A.prototype.a.boundTo, A);
            assert(A.prototype.aa.boundTo, A);
            assert(A.prototype.aaa.boundTo, undefined);

            assert(C.prototype.a.boundTo, A);
            assert(C.prototype.aa.boundTo, C);
            assert(C.prototype.aaa.boundTo, undefined);
            assert(C.prototype.b.boundTo, B);
            assert(C.prototype.bb.boundTo, undefined);
            assert(C.prototype.c.boundTo, C);

            assert(A.prototype.aa != B.prototype.aa, true);
            assert(A.prototype.a != B.prototype.a, true);

            var Mix = [
                function aa() {
                    return 10 + this.$super();
                }
            ];

            B.extend(Mix);
            assert(B.$isInjected, true);
            assert(B.$parent != A, true);
            assert(A.$parent, null);
            assert(B.$parent.$parent, A);

            assert(B.$parent.prototype.a.boundTo, A);
            assert(B.$parent.prototype.aa.boundTo, B.$parent);
            assert(B.$parent.prototype.b.boundTo, B.$parent);

            assert(B.prototype.a.boundTo, A);
            assert(B.prototype.aa.boundTo, B);
            assert(B.prototype.b.boundTo, B.$parent);
            assert(B.prototype.bb.boundTo, undefined);
            assert(B.prototype.aaa.boundTo, undefined);

            assert(C.prototype.a.boundTo, A);
            assert(C.prototype.aa.boundTo, C);
            assert(C.prototype.aaa.boundTo, undefined);
            assert(C.prototype.b.boundTo, B);
            assert(C.prototype.bb.boundTo, undefined);
            assert(C.prototype.c.boundTo, C);

            assert(A.prototype.a.boundTo, A);
            assert(A.prototype.aa.boundTo, A);
            assert(A.prototype.aaa.boundTo, undefined);

            var b = new B(), c = new C();
            assert(b.a(), 1);
            assert(b.b(), 4);
            assert(b.aa(), 13);
            assert(b.bb(), 222);
            assert(b.aaa(), 22);

            assert(c.a(), 1);
            assert(c.b(), 4);
            assert(c.aa(), 24);
            assert(c.c(), 123);
            assert(c.bb(), 222);
            assert(c.aaa(), 22);

            assert(ob.a(), 1);
            assert(ob.b(), 4);
            assert(ob.aa(), 13);
            assert(ob.bb(), 222);
            assert(ob.aaa(), 22);

            assert(oc.a(), 1);
            assert(oc.b(), 4);
            assert(oc.aa(), 24);
            assert(oc.c(), 123);
            assert(oc.bb(), 222);
            assert(oc.aaa(), 22);

            var Mix = [
                function aa() {
                    return 12 + this.$super();
                }
            ];

            var B_parent = B.$parent;
            assert(B_parent != null, true);
            B.extend(Mix);

            assert(B_parent, B.$parent);
            assert(b.a(), 1);
            assert(b.b(), 4);
            assert(b.aa(), 15);
            assert(b.bb(), 222);
            assert(b.aaa(), 22);

            assert(c.a(), 1);
            assert(c.b(), 4);
            assert(c.aa(), 26);
            assert(c.c(), 123);
            assert(c.bb(), 222);
            assert(c.aaa(), 22);


            C.extend([
                function c() {
                    return 89;
                }
            ], false);

            assert(C.isInjected, undefined);
            assert(C.prototype.c.boundTo, C);
            assert(C.$parent, B);
            assert(c.a(), 1);
            assert(c.b(), 4);
            assert(c.aa(), 26);
            assert(c.c(), 89);
            assert(c.bb(), 222);
            assert(c.aaa(), 22);
        },

        function test_mixing_definition () {
            var Mix = [
                function a() {
                    return 10 + this.$super();
                },

                function aa() {
                    return 123;
                },

                function $prototype() {
                    this.af = 330;
                    this.aaa = function() {
                        return 890;
                    }
                }
            ]

            var A = Class([
                function   a() {
                    return 10;
                }
            ]);

            var B = Class(A, [
                function  b() {
                    return 11;
                },

                function $mixing() {
                    return Mix;
                }
            ]);

            var a = new A(), b = new B();

            assert(a.a(), 10);
            assert(b.b(), 11);
            assert(b.aa(), 123);
            assert(b.a(), 20);
            assert(b.aaa(), 890);
            assert(B.prototype.aaa.boundTo == null, true);
            assert(b.af, 330);


        },

        function test_dynamic() {
            var A = new Class([
                function a(p1, p2) {
                    if (arguments.length === 0) return 100;
                    if (arguments.length === 1) return p1;
                    return p1 + p2;
                },

                function $prototype() { this.m = 33; }
            ]);

            var a = new A();

            assert(a.a(), 100);
            assert(a.a(1), 1);
            assert(a.a(1, 2), 3);
            assert(a.m, 33);

            a.extend([
                function a(p) {
                    if (arguments.length === 0) return 200;
                    return 10;
                }
            ]);

            assert(a.a(), 200);
            assert(a.a(1), 10);
            assert(a.a(3,3), 10);

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
                    return 11;
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

                function m1() {
                    return 500;
                },

                function m2() { return 501; }
            ];


            A.extend(M);

            a = new A();
            assert(zebra.getMethod(A, "m1") != null, true);
            assert(a.m1 != null, true);
            assert(a.m1.methodName, "m1");
            assert(a.m2.methodName, "m2");
            assert(a.m1 != null, true);


            assert(a.m1(), 500);
            assert(zebra.getMethod(A, "m2") != null, true);
            assert(a.m2 != null, true);
            assert(a.m2(), 501);
            assert(a.a(), 502);


            var B = Class([
                function m1 () {
                    return 12;
                }
            ]);

            B.extend(M);
            a = new B();

            assert(zebra.getMethod(B, "m1") != null, true);
            assert(a.m1 != null, true);
            assert(a.m1.methodName, "m1");
            assert(a.m1(), 500);
            assert(zebra.getMethod(B, "m2") != null, true);
            assert(a.m2 != null, true);
            assert(a.m2(), 501);
            assert(a.a(), 502);
        },

        function test_anonymous() {
            var A = new Class([
                function a(p) {
                    if (arguments.length === 0) return 1;
                    return p;
                }
            ]);

            var a = new A();
            assert(a.a(), 1, "Class defined method a()");
            assert(a.a(11), 11, "Class defined method a(1)");

            a = new A([
                function a(p1, p2) {
                    if (arguments.length === 0) return 2;
                    if (arguments.length === 1) return this.$super(p1);
                    return p1 + p2;
                },

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
            assert(a.clazz != (new A()).clazz, true, "anonymous class doesn't equal initial class");
            assert(a.clazz.$parent == A, true, "anonymous has proper parent class");


            a = new A();
            assert(a.a(), 1, "anonymous didn't touch method a() of initial class");
            assert(a.a(12), 12, "anonymous didn't touch method a(1) of initial class");
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

            zebra.assertNoException(function() {
                new A([]);
            }, Error);
            var a = new A([]);
            assert(a.m, 100);

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

            zebra.assertNoException(function() {
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

            assert(a1.clazz,  A);
            assert(a1.clazz.$name,  "Test");
            assert(a2.clazz != A,  true);
            assert(a2.clazz.$name ,  "Test");
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

            var c = new C();
            assert(c.a, 20);
            assert(c.b[0], 1);
            assert(c.b[1], 2);
            assert(c.b[2], 3);
            assert(c.b, a.b);
            assert(c.b.length, 3);
            assert(c.a, 20);
            assert(typeof c.f === "function" , true);
            assert(c.f(), 555);
            assert(c.f(1), 555);

            var D = Class(A, [
                function f(a) {
                    if (arguments.length === 0) {
                        return 1 + this.$super();
                    }
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
                    assert(zebra.$caller == zebra.getMethod(A, ''), true, "test_caller 1");
                    this.toM();
                    assert(zebra.$caller == zebra.getMethod(A, ''), true, "test_caller 2");
                },

                function toM() {
                    assert(zebra.$caller.methodBody.toString() == toM.toString(), true, "test_caller 3");
                    return "M";
                }
            ]);
            new A();
        },

        function test_mixing() {
            var A = Class([
                function a(p1) {
                    if (arguments.length === 0) return 10;
                    return p1;
                }
            ]), I = Interface();


            var a = new A(), clz = a.clazz;
            assert(a.a(), 10);
            assert(a.a(111), 111);
            assert(a.$extended, undefined);

            a.extend([
                function() {
                    this.ff = 333;
                    this.dd = this.a();
                },

                function a(p1) {
                    if (arguments.length === 0) return 200;
                    return this.$super(p1 + 10);
                }
            ]);

            var mclz = a.clazz;
            assert(a.a(), 200);
            assert(a.a(123), 133);
            assert(a.ff, 333);
            assert(a.dd, 200);
            assert(mclz != clz, true);
            assert(a.$extended, true, "Anonymous is extended ");

            // one more extension on the same instance
            a.extend([
                function() {
                    this.fff = 333;
                },

                function a(p1, p2) {
                    if (arguments.length === 0) {
                        return 311;
                    }

                    if (arguments.length === 1) {
                        return this.$super(p1 + 20);
                    }

                    return p1 + p2;
                }
            ]);
            assert(a.a(), 311);
            assert(a.a(123), 143);
            assert(a.ff, 333);
            assert(a.fff, 333);
            assert(a.a(100,11), 111);
            assert(mclz == a.clazz, true);
            assert(a.$extended, true)

            // no side effect to parent class
            var a = new A(), clz = a.clazz;
            assert(a.a(), 10);
            assert(a.a(111), 111);
            assert(a.$extended, undefined);

            // more deep super calling
            var B = Class(A, [
                function b() {
                    return this.$super(this.a);
                }
            ]), b = new B();

            assert(b.a(), 10);
            assert(b.b(), 10);
            assert(b.a(111), 111);
            assert(b.$extended,  undefined);
            assert(zebra.instanceOf(b, I), false);

            b.extend(I, [
                function b() {
                    return this.$super(this.a, 121);
                }
            ])

            assert(b.a(), 10);
            assert(b.b(), 121);
            assert(b.a(112), 112);
            assert(b.$extended, true);
            assert(zebra.instanceOf(b, I), true);


            // no side effect to parent class
            var b = new B(), clz = a.clazz;
            assert(b.a(), 10);
            assert(b.b(), 10);
            assert(b.a(111), 111);
            assert(b.$extended, undefined);
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

            var mix = [
                function  aa() {
                    this.ssValue = this.$super();
                    this.aaValue = 123;
                },

                function  bb() {
                    this.bbValue = 223;
                }
            ];
            var A = Class([
                function aa () {
                    this.aaValue = 321;
                    return 77;
                },

                function cc () {
                    this.ccValue = 11321;
                }
            ]);

            var a1 = new A(), a2 = new A();
            a1.aa();
            a2.aa();
            assert(a1.aaValue, 321);
            assert(a2.aaValue, 321);
            assert(a2.aa, a1.aa);
            assert(a2.clazz, a1.clazz);
            assert(a2.clazz, A);

            a1.extend(mix);
            a1.aa();
            a2.aa();
            assert(a1.aaValue, 123);
            assert(a2.aaValue, 321);
            assert(a1.bb != null, true);
            assert(a2.bb  == null, true);
            assert(a2.aa != a1.aa, true);
            assert(a1.clazz != a2.clazz, true);
            assert(a2.clazz, A);
            assert(a1.clazz.$parent, A);
            assert(mix[0].boundTo == null, true);
            assert(mix[0].methodName == null, true);
            assert(mix[1].boundTo == null, true);
            assert(mix[1].methodName == null, true);

            a2.extend(mix);
            a1.aa();
            a2.aa();
            assert(a1.aaValue, 123);
            assert(a2.aaValue, 123);
            assert(a1.clazz != a2.clazz, true);
            assert(a1.clazz.$parent, A);
            assert(a2.clazz.$parent, A);
            assert(a1.bb != null, true);
            assert(a2.bb != null, true);
            assert(a2.bb != a1.bb, true);
            assert(a2.aa != a1.aa, true);

            assert(a1.bb.boundTo, a1.clazz);
            assert(a1.aa.boundTo, a1.clazz);
            assert(a2.bb.boundTo, a2.clazz);
            assert(a2.aa.boundTo, a2.clazz);
            assert(a1.cc.boundTo, A);
            assert(a2.cc.boundTo, A);

            assert(mix[0].boundTo == null, true);
            assert(mix[0].methodName == null, true);
            assert(mix[1].boundTo == null, true);
            assert(mix[1].methodName == null, true);

            var clazz = a1.clazz, aa = a1.aa, bb = a1.bb;
            a1.extend(mix);
            assert(a1.clazz, clazz);
            assert(a1.clazz.$parent, A);
            assert(a1.aa != aa, true);
            assert(a1.bb != bb, true);
            assert(a1.aa.boundTo, a1.clazz);
            assert(a1.bb.boundTo, a1.clazz);
            assert(a1.cc.boundTo, A);

            a1.aa();
            assert(a1.ssValue, 77);
        },

        function test_singletone() {
            var A = Class([
                function() {
                    this.a = 100;
                },

                function m() {
                    return 1;
                }
            ]);

            assert(A.$instance == null, true);

            var AA = zebra.Singleton(A);
            assert(AA.$isSingleton, true);
            assert(A.$isSingleton !== true, true);

            var a1 = new AA(), a2 = new AA();

            assert(a1 === a2, true);
            assert(a1.isSingleton, true);
            assert(a2.isSingleton, true);

            assert(a1.a, 100);
            assert(a2.a, 100);
            assert(a2.a, a1.a);
            assert(a2.m, a1.m);
            assert(a2.m(), a1.m());

            a2.a = 200;
            assert(a1.a, 200);
            assert(a2.a, 200);
            assert(a2.a, a1.a);

            var a3 = new AA();

            assert(a1 === a2, true);
            assert(a2 === a3, true);
            assert(a3.a, 200);
            assert(a2.a, 200);
            assert(a1.a, 200);
            assert(a2.m, a1.m);
            assert(a2.m, a3.m);
            assert(a2.m(), a1.m());
            assert(a2.m(), a3.m());

            assertException(function() {
                zebra.Singleton(AA);
            }, Error);

            var B = new Class(A, [
                function() {
                    this.$super();
                },

                function m() {
                    return 2;
                }
            ]);


            assert(B.$isSingleton !== true, true);

            var b1 = new B(), b2 = new B();
            assert(b1 !== b2, true);
            assert(b1.a, 100);
            assert(b2.a, 100);
            assert(b1.m(), 2);
            assert(b2.m(), 2);

            var B = new Class(AA, [
                function() {
                    this.$super();
                },

                function m() {
                    return 2;
                }
            ]);


            assert(B.$isSingleton !== true, true);

            var b1 = new B(), b2 = new B();

            assert(b1 !== b2, true);
            assert(b1.a, 100);
            assert(b2.a, 100);
            assert(b1.m(), 2);
            assert(b2.m(), 2);
        },

        function test_class_names() {
            zebra.package("test", function(pkg) {
                pkg.A = Class([
                    function $clazz() {
                        this.B = Class([
                            function $clazz() {
                                this.A = Class([]);
                            }
                        ]);

                        this.a = 100;
                    }
                ]);

                pkg.AA = Class(pkg.A, [
                    function $clazz() {
                        this.BB = Class([
                            function $clazz() {
                                this.A = Class([]);
                            }
                        ]);
                    }
                ]);

                zebra.$resolveClassNames();

                assert(zebra.test != null, true);
                assert(zebra.test.A != null, true);
                assert(zebra.test.AA != null, true);
                assert(zebra.test.A.B != null, true);
                assert(zebra.test.AA.BB != null, true);

                assert(zebra.test.A.$name, "A");
                assert(zebra.test.A.B.$name, "A.B");
                assert(zebra.test.A.B.A.$name, "A.B.A");
                assert(zebra.test.A.a, 100);

                assert(zebra.test.AA.$name, "AA");
                assert(zebra.test.AA.a, 100);
                assert(zebra.test.AA.BB.$name, "AA.BB");
                assert(zebra.test.AA.BB.A.$name, "AA.BB.A");
                assert(zebra.test.AA.B.$name, "A.B");
                assert(zebra.test.AA.B.A.$name, "A.B.A");
            });
        },

        function test_clone() {
            assert(zebra.clone(null), null);
            assert(zebra.clone(undefined), undefined);
            assert(zebra.clone(true), true);
            assert(zebra.clone(1), 1);
            assert(zebra.clone("abc"), "abc");

            var arr = [1,2,3, ["A", "B" ] ], carr = zebra.clone(arr);
            assert(arr != carr, true);
            assert(arr.length, carr.length);
            assert(arr[arr.length-1] != carr[carr.length-1], true);
            assertObjEqual(arr, carr);
            assertObjEqual(arr[arr.length-1], carr[carr.length-1]);
            assertObjEqual(arr[arr.length-1].length, carr[carr.length-1].length);

            var o = { a: "1", b: true, c : [ 3,4,5] }, co = zebra.clone(o);
            assert(o != co, true);
            assert(o.c != co.c, true);
            assertObjEqual(o, co);
            assertObjEqual(o.c, co.c);

            var A = Class([
                function $clazz() {
                    this.AA = "300";
                },

                function $prototype() {
                    this.aa = 300;
                },

                function() {
                    this.a = 100;
                    this.b = [1, 2, 3];
                    this.c = {
                        c1 : 1,
                        c2 : [
                            9,9,9
                        ]
                    }
                },

                function test1(a) {
                    return a;
                },

                function test2(a) {
                    if (arguments.length === 0) {
                        return 1;
                    }

                    return a;
                }
            ]), a = new A(), aa = zebra.clone(a);

            assert(a != aa, true);
            assert(a.$hash$ != null, true);
            assert(aa.$hash$ != null, true);
            assert(a.$hash$ != aa.$hash$, true);
            a.$hash$ = aa.$hash$
            assertObjEqual(a, aa);


            assert(a.b != aa.b, true);
            assert(a.c != aa.c, true);
            assert(a.test1, aa.test1);
            assert(a.test2, aa.test2);
            assert(a.test1(10), aa.test1(10));
            assert(a.test2(), aa.test2());
            assert(a.test2(), 1);
            assert(a.test2(10), 10);
            assert(a.test2(10), aa.test2(10));

            var B = Class(A, [
                function $prototype() {
                    this.bb = 321;
                },

                function() {
                    this.$super();
                    this.kk = 12;
                },

                function test2() {
                    return this.$super() + 2;
                }
            ]), b = new B(), bb = zebra.clone(b);

            assert(b != bb, true);
            assert(b.$hash$ != null, true);
            assert(bb.$hash$ != null, true);
            assert(b.$hash$ != bb.$hash$, true);

            assert(b.b != bb.b, true);
            assert(b.c != bb.c, true);

            b.$hash$ = bb.$hash$;
            assertObjEqual(b, bb);

            assert(b.test2, bb.test2);
            assert(b.test2(), bb.test2());
            assert(b.test2(12), bb.test2(12));
            assert(b.test1, bb.test1);
            assert(b.test1(11), bb.test1(11));

            var f1 = function() {}, f2 = zebra.clone(f1);
            assert(f1, f2);
        }
    );
})();

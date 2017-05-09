if (typeof(zebkit) === "undefined") {
    var path = require("path"),
        base = path.resolve(__dirname, "..", "src", "js");

    require(path.join(base, 'easyoop.js'));
    require(path.join(base, 'misc', 'extras.js'));
    require(path.join(base, 'util.js'));
    require(path.join(base, 'misc', 'tools.js'));
}

(function() {
    var assertException = zebkit.assertException, assert = zebkit.assert, assume = zebkit.assume,
        Class = zebkit.Class, Interface = zebkit.Interface, assertObjEqual = zebkit.assertObjEqual,
        Path = zebkit.Path;

    function test_a_map(Map, b) {
        var m = new Map();

        assert(m.size, 0);
        assert(m.get("dsds"), undefined);
        assert(m.has("dsds"), false);
        assert(m.delete("dsds"), false);

        var i = 0;
        m.forEach(function(e, k, m) {
            i++;
        });
        assert(i, 0);

        assert(m.set("k1", 0), m, "test 1");
        assert(m.size, 1, "test 2");
        if (b == null) assert(m.keys.length, 1, "test 21");
        if (b == null) assert(m.values.length, 1, "test 22");
        assert(m.get("k1"), 0, "test 3");
        assert(m.has("k1"), true, "test 4");
        assert(m.delete("k1"), true, "test 5");
        assert(m.size, 0, "test 6");
        if (b == null) assert(m.keys.length, 0, "test 221");
        if (b == null) assert(m.values.length, 0, "test 222");
        assert(m.get("k1"), undefined, "test 7");
        assert(m.has("k1"), false, "test 8");

        var k1 = { a: 1 }, k2 = { a: 1 };

        assert(m.set(k1, 1), m, "test 9");
        assert(m.set(k2, 2), m, "test 10");
        assert(m.size, 2, "test 11");
        if (b == null) assert(m.keys.length, 2, "test 12");
        if (b == null) assert(m.values.length, 2, "test 13");
        assert(m.get(k1), 1, "test 14");
        assert(m.get(k2), 2, "test 15");
        assert(m.has(k1), true, "test 16");
        assert(m.has(k2), true, "test 17");

        var i = 0;
        m.forEach(function(e, k, mm) {
            assert(m, mm);

            if (i == 0) {
                assert(k, k1);
                assert(e, 1);
            }
            if (i == 1) {
                assert(k, k2);
                assert(e, 2);
            }
            i++;
        });
        assert(i, 2, "test 18");

        assert(m.delete(k1), true, "test 19");
        assert(m.size, 1, "test 20");
        if (b == null) assert(m.keys.length, 1, "test 21");
        if (b == null) assert(m.values.length, 1, "test 22");
        assert(m.get(k1), undefined, "test 23");
        assert(m.get(k2), 2, "test 24");
        assert(m.has(k1), false, "test 25");
        assert(m.has(k2), true, "test 26");

        m.clear();
        assert(m.size, 0, "test 27");
        if (b == null) assert(m.keys.length, 0, "test 28");
        if (b == null) assert(m.values.length, 0, "test 29");
        assert(m.get(k1), undefined, "test 30");
        assert(m.get(k2), undefined, "test 31");
        assert(m.has(k1), false, "test 32");
        assert(m.has(k2), false, "test 33");
        assert(m.delete(k1), false, "test 34");
        assert(m.delete(k2), false, "test 35");
        m.clear();

        m.set(k1, 2);
        assert(m.size, 1, "test 36");
        if (b == null) assert(m.keys.length, 1, "test 37");
        if (b == null) assert(m.values.length, 1, "test 38");
        assert(m.get(k1), 2, "test 39");
        assert(m.has(k1), true, "test 40");
        m.set(k1, 12);
        assert(m.size, 1, "test 41");
        if (b == null) assert(m.keys.length, 1, "test 42");
        if (b == null) assert(m.values.length, 1, "test 43");
        assert(m.get(k1), 12, "test 44");
        assert(m.has(k1), true, "test 45");


        m.clear();
        m.set(k1, 2);
        m.set(k1, 2);
        assert(m.size, 1, "test 46");
        if (b == null) assert(m.keys.length, 1, "test 47");
        if (b == null) assert(m.values.length, 1, "test 48");

    }

    zebkit.runTests("Easy OOP",
        function test_custom_map(b) {
            test_a_map(zebkit.$Map());
        },

        function test_standard_map() {
            if (typeof Map === "undefined") {
                console.warn("Standard Map class is not provided by the environment");
            }
            else {
                test_a_map(Map, true);
            }
        },

        function test_cache() {
            zebkit.$cacheSize = 3;

            zebkit.A = "1";
            zebkit.B = "2";
            zebkit.C = "3";
            zebkit.D = "4";
            zebkit.E = "5";

            assert(zebkit.$cachedE.length, 0);

            // add first entry A
            assert(zebkit.$cache("zebkit.A"), "1");
            assert(zebkit.$cachedO["zebkit.A"].i, 0);
            assert(zebkit.$cachedO["zebkit.A"].o, "1");
            assert(zebkit.$cachedE.indexOf("zebkit.A"), 0);
            assert(zebkit.$cachedE.length, 1);
            assert(zebkit.$cache("zebkit.A"), "1");
            assert(zebkit.$cachedO["zebkit.A"].i, 0);
            assert(zebkit.$cachedO["zebkit.A"].o, "1");
            assert(zebkit.$cachedE.indexOf("zebkit.A"), 0);
            assert(zebkit.$cachedE.length, 1);
            assert(zebkit.$cache("zebkit.A"), "1");
            assert(zebkit.$cachedO["zebkit.A"].i, 0);
            assert(zebkit.$cachedO["zebkit.A"].o, "1");
            assert(zebkit.$cachedE.indexOf("zebkit.A"), 0);
            assert(zebkit.$cachedE.length, 1);

            // add second entry [A, B]
            assert(zebkit.$cache("zebkit.B"), "2");
            assert(zebkit.$cachedO["zebkit.B"].i, 1);
            assert(zebkit.$cachedO["zebkit.B"].o, "2");
            assert(zebkit.$cachedO["zebkit.A"].i, 0);
            assert(zebkit.$cachedO["zebkit.A"].o, "1");
            assert(zebkit.$cachedE.indexOf("zebkit.A"), 0);
            assert(zebkit.$cachedE.indexOf("zebkit.B"), 1);
            assert(zebkit.$cachedE.length, 2);

            // access second entry (change nothing) [A, B]
            assert(zebkit.$cache("zebkit.B"), "2");
            assert(zebkit.$cachedO["zebkit.B"].i, 1);
            assert(zebkit.$cachedO["zebkit.B"].o, "2");
            assert(zebkit.$cachedO["zebkit.A"].i, 0);
            assert(zebkit.$cachedO["zebkit.A"].o, "1");
            assert(zebkit.$cachedE.indexOf("zebkit.A"), 0);
            assert(zebkit.$cachedE.indexOf("zebkit.B"), 1);
            assert(zebkit.$cachedE.length, 2);


            // access first entry (change order) [B, A]
            assert(zebkit.$cache("zebkit.A"), "1");
            assert(zebkit.$cachedO["zebkit.B"].i, 0);
            assert(zebkit.$cachedO["zebkit.B"].o, "2");
            assert(zebkit.$cachedO["zebkit.A"].i, 1);
            assert(zebkit.$cachedO["zebkit.A"].o, "1");
            assert(zebkit.$cachedE.indexOf("zebkit.A"), 1);
            assert(zebkit.$cachedE.indexOf("zebkit.B"), 0);
            assert(zebkit.$cachedE.length, 2);

            // access first entry (change nothing) [B, A]
            assert(zebkit.$cache("zebkit.A"), "1");
            assert(zebkit.$cachedO["zebkit.B"].i, 0);
            assert(zebkit.$cachedO["zebkit.B"].o, "2");
            assert(zebkit.$cachedO["zebkit.A"].i, 1);
            assert(zebkit.$cachedO["zebkit.A"].o, "1");
            assert(zebkit.$cachedE.indexOf("zebkit.A"), 1);
            assert(zebkit.$cachedE.indexOf("zebkit.B"), 0);
            assert(zebkit.$cachedE.length, 2);

            // access second entry (change order) [A, B]
            assert(zebkit.$cache("zebkit.B"), "2");
            assert(zebkit.$cachedO["zebkit.B"].i, 1);
            assert(zebkit.$cachedO["zebkit.B"].o, "2");
            assert(zebkit.$cachedO["zebkit.A"].i, 0);
            assert(zebkit.$cachedO["zebkit.A"].o, "1");
            assert(zebkit.$cachedE.indexOf("zebkit.A"), 0);
            assert(zebkit.$cachedE.indexOf("zebkit.B"), 1);
            assert(zebkit.$cachedE.length, 2);

            // add third entry [A, B, C]
            assert(zebkit.$cache("zebkit.C"), "3");
            assert(zebkit.$cachedO["zebkit.C"].i, 2);
            assert(zebkit.$cachedO["zebkit.C"].o, "3");
            assert(zebkit.$cachedO["zebkit.B"].i, 1);
            assert(zebkit.$cachedO["zebkit.B"].o, "2");
            assert(zebkit.$cachedO["zebkit.A"].i, 0);
            assert(zebkit.$cachedO["zebkit.A"].o, "1");
            assert(zebkit.$cachedE.indexOf("zebkit.A"), 0);
            assert(zebkit.$cachedE.indexOf("zebkit.B"), 1);
            assert(zebkit.$cachedE.indexOf("zebkit.C"), 2);
            assert(zebkit.$cachedE.length, 3);

            // access third entry (change nothing) [ A, B, C]
            assert(zebkit.$cache("zebkit.C"), "3");
            assert(zebkit.$cachedO["zebkit.C"].i, 2);
            assert(zebkit.$cachedO["zebkit.C"].o, "3");
            assert(zebkit.$cachedO["zebkit.B"].i, 1);
            assert(zebkit.$cachedO["zebkit.B"].o, "2");
            assert(zebkit.$cachedO["zebkit.A"].i, 0);
            assert(zebkit.$cachedO["zebkit.A"].o, "1");
            assert(zebkit.$cachedE.indexOf("zebkit.A"), 0);
            assert(zebkit.$cachedE.indexOf("zebkit.B"), 1);
            assert(zebkit.$cachedE.indexOf("zebkit.C"), 2);
            assert(zebkit.$cachedE.length, 3);

            // access A entry (change order)   [ B, A, C ]
            assert(zebkit.$cache("zebkit.A"), "1");
            assert(zebkit.$cachedO["zebkit.C"].i, 2);
            assert(zebkit.$cachedO["zebkit.C"].o, "3");
            assert(zebkit.$cachedO["zebkit.B"].i, 0);
            assert(zebkit.$cachedO["zebkit.B"].o, "2");
            assert(zebkit.$cachedO["zebkit.A"].i, 1);
            assert(zebkit.$cachedO["zebkit.A"].o, "1");
            assert(zebkit.$cachedE.indexOf("zebkit.A"), 1);
            assert(zebkit.$cachedE.indexOf("zebkit.B"), 0);
            assert(zebkit.$cachedE.indexOf("zebkit.C"), 2);
            assert(zebkit.$cachedE.length, 3);

            // access A entry (change order)  [ B, C, A ]
            assert(zebkit.$cache("zebkit.A"), "1");
            assert(zebkit.$cachedO["zebkit.C"].i, 1);
            assert(zebkit.$cachedO["zebkit.C"].o, "3");
            assert(zebkit.$cachedO["zebkit.B"].i, 0);
            assert(zebkit.$cachedO["zebkit.B"].o, "2");
            assert(zebkit.$cachedO["zebkit.A"].i, 2);
            assert(zebkit.$cachedO["zebkit.A"].o, "1");
            assert(zebkit.$cachedE.indexOf("zebkit.A"), 2);
            assert(zebkit.$cachedE.indexOf("zebkit.B"), 0);
            assert(zebkit.$cachedE.indexOf("zebkit.C"), 1);
            assert(zebkit.$cachedE.length, 3);

            // access A entry  [ B, C, A ]
            assert(zebkit.$cache("zebkit.A"), "1");
            assert(zebkit.$cachedO["zebkit.C"].i, 1);
            assert(zebkit.$cachedO["zebkit.C"].o, "3");
            assert(zebkit.$cachedO["zebkit.B"].i, 0);
            assert(zebkit.$cachedO["zebkit.B"].o, "2");
            assert(zebkit.$cachedO["zebkit.A"].i, 2);
            assert(zebkit.$cachedO["zebkit.A"].o, "1");
            assert(zebkit.$cachedE.indexOf("zebkit.A"), 2);
            assert(zebkit.$cachedE.indexOf("zebkit.B"), 0);
            assert(zebkit.$cachedE.indexOf("zebkit.C"), 1);
            assert(zebkit.$cachedE.length, 3);

            // add D entry  [D, C, A]
            assert(zebkit.$cache("zebkit.D"), "4");
            assert(zebkit.$cachedO["zebkit.C"].i, 1);
            assert(zebkit.$cachedO["zebkit.C"].o, "3");
            assert(zebkit.$cachedO["zebkit.A"].i, 2);
            assert(zebkit.$cachedO["zebkit.A"].o, "1");
            assert(zebkit.$cachedO["zebkit.D"].i, 0);
            assert(zebkit.$cachedO["zebkit.D"].o, "4");
            assert(zebkit.$cachedO["zebkit.B"], undefined);
            assert(zebkit.$cachedE.indexOf("zebkit.A"), 2);
            assert(zebkit.$cachedE.indexOf("zebkit.B"), -1);
            assert(zebkit.$cachedE.indexOf("zebkit.C"), 1);
            assert(zebkit.$cachedE.indexOf("zebkit.D"), 0);
            assert(zebkit.$cachedE.length, 3);

            // access entry D [C, D, A]
            assert(zebkit.$cache("zebkit.D"), "4");
            assert(zebkit.$cachedO["zebkit.C"].i, 0);
            assert(zebkit.$cachedO["zebkit.C"].o, "3");
            assert(zebkit.$cachedO["zebkit.B"], undefined);
            assert(zebkit.$cachedO["zebkit.A"].i, 2);
            assert(zebkit.$cachedO["zebkit.A"].o, "1");
            assert(zebkit.$cachedO["zebkit.D"].i, 1);
            assert(zebkit.$cachedO["zebkit.D"].o, "4");
            assert(zebkit.$cachedE.indexOf("zebkit.A"), 2);
            assert(zebkit.$cachedE.indexOf("zebkit.C"), 0);
            assert(zebkit.$cachedE.indexOf("zebkit.D"), 1);
            assert(zebkit.$cachedE.length, 3);


            // add entry E [E, D, A]
            assert(zebkit.$cache("zebkit.E"), "5");
            assert(zebkit.$cachedO["zebkit.C"], undefined);
            assert(zebkit.$cachedO["zebkit.B"], undefined);
            assert(zebkit.$cachedO["zebkit.A"].i, 2);
            assert(zebkit.$cachedO["zebkit.A"].o, "1");
            assert(zebkit.$cachedO["zebkit.D"].i, 1);
            assert(zebkit.$cachedO["zebkit.D"].o, "4");
            assert(zebkit.$cachedO["zebkit.E"].i, 0);
            assert(zebkit.$cachedO["zebkit.E"].o, "5");
            assert(zebkit.$cachedE.indexOf("zebkit.A"), 2);
            assert(zebkit.$cachedE.indexOf("zebkit.C"), -1);
            assert(zebkit.$cachedE.indexOf("zebkit.B"), -1);
            assert(zebkit.$cachedE.indexOf("zebkit.D"), 1);
            assert(zebkit.$cachedE.indexOf("zebkit.E"), 0);
            assert(zebkit.$cachedE.length, 3);
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
                assert(zebkit.$FN(f[i]), "a");
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
            assert(zebkit.isString("string literal"), true, "literal");
            assert(zebkit.isString("String object"), true, "String object");
            assert(zebkit.isString(1), false, "number literal");
            assert(zebkit.isString(true), false, "boolean literal");
            assert(zebkit.isString({}), false, "object");
            assert(zebkit.isString(zebkit.kkkkkkkk), false, "undefined");
            assert(zebkit.isString(null), false, "null");
            assert(zebkit.isString(1), false, "number");
        },

        function test_isNumber() {
            assert(zebkit.isNumber("string literal"), false, "literal as number");
            assert(zebkit.isNumber("String object"), false, "String as number");
            assert(zebkit.isNumber(1), true, "number");
            assert(zebkit.isNumber("1"), false, "number as string");
            assert(zebkit.isNumber(true), false, "boolean literal");
            assert(zebkit.isNumber({}), false, "object");
            assert(zebkit.isNumber(zebkit.kkkkkkkk), false, "undefined");
            assert(zebkit.isNumber(null), false, "null");
        },

        function test_isBoolean() {
            assert(zebkit.isBoolean("string literal"), false, "literal as bool");
            assert(zebkit.isBoolean("true"), false, "true literal as bool");
            assert(zebkit.isBoolean("false"), false, "false literal as bool");
            assert(zebkit.isBoolean("String object"), false, "String as bool");
            assert(zebkit.isBoolean(1), false, "number as bool");
            assert(zebkit.isBoolean(0), false, "number as bool");
            assert(zebkit.isBoolean({}), false, "obj as bool");
            assert(zebkit.isBoolean(undefined), false, "undefined as bool");
            assert(zebkit.isBoolean(null), false, "null as bool");
            assert(zebkit.isBoolean(test_isBoolean), false, "function as bool");
            assert(zebkit.isBoolean(true), true, "boolean as bool");
            assert(zebkit.isBoolean(false), true, "boolean as bool");
            assert(zebkit.isBoolean(new Boolean()), true, "boolean instance as bool");
        },

        function test_zebkit() {
            assert(typeof zebkit.$FN === 'function', true);
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
            // assert(typeof zebkit.getMethod(A, "toString", 1).modifier !== "undefined", true, "Proxy method correct wrap existent method");
            assert(typeof zebkit.getMethod(A, "toString").methodName !== "undefined", true, "Proxy method correct wrap existent method 1");
            assert(typeof zebkit.getMethod(A, "toString").boundTo !== "undefined ", true, "Proxy method correct wrap existent method 2");


            // assert(zebkit.getMethod(A, "toString", 1).modifier === 0, true, "Proxy method correct wrap existent method");
            assert(zebkit.getMethod(A, "toString").methodName === "toString", true, "Proxy method correct wrap existent method 3");
            assert(zebkit.getMethod(A, "toString").boundTo == A, true, "Proxy method correct wrap existent method 4");

            // assert(typeof zebkit.getMethod(A, "toString", 0).modifier !== "undefined", true, "Proxy method correct wrap existent method");
            assert(typeof zebkit.getMethod(A, "toString").methodName !== "undefined", true, "Proxy method correct wrap existent method 5");
            assert(typeof zebkit.getMethod(A, "toString").boundTo !== "undefined", true, "Proxy method correct wrap existent method 6");
            // assert(zebkit.getMethod(A, "toString").modifier === 0, true, "Proxy method correct wrap existent method");
            assert(zebkit.getMethod(A, "toString").methodName == "toString", true, "Proxy method correct wrap existent method 7");
            assert(zebkit.getMethod(A, "toString").boundTo == A, true, "Proxy method correct wrap existent method 8");

            var a = new A();
            assert(a.toString("11") === "11", true, "toString overriding 1");
            assert(a.toString() != a.toString("11"), true, "toString overriding 2");

            assertException(function() {
                var A = Class([
                    function a() { return "1"; },
                    function a(b) {
                        return "*";
                    }
                ]);
            }, Error, "Double method definition ");

            assertException(function() {
                var A = Class([
                    function () { },
                    function (b) {
                    }
                ]);
            }, Error);
        },

        function test_class() {
            assert(typeof Interface.clazz != 'undefined', true, "test_class 2");
            assertException(function() {  zebkit.instanceOf(Class, null); }, Error, "test_class 1");

            assert(zebkit.instanceOf(Class, Class), false, "test_class 21");
            assert(typeof Class.clazz != 'undefined', true, "test_class 22");
            assert(Class.clazz, null, "test_class 23");
            assert(Class.$hash$ != null, true, "test_class 233");
            assertException(function() { new Class();  }, Error, "test_class 33");
            var A = new Class([]);

            assert(typeof A.clazz !== 'undefined', true, "test_class 51");
            assert(A.clazz, Class, "test_class 6");
            assert(A.$parent, null, "test_class 8");

            assert(zebkit.getMethod(A, '', 1), null, "test_class 9");
            assert(zebkit.getMethod(A, 'blablabla'), null, "test_class 10");

            // this should be not a class instance methods
            assert(zebkit.getMethod(A, 'getMethod'), null, "test_class 11");
            assert(zebkit.getMethod(A, 'getMethods'), null, "test_class 12");

            var B = new Class([
                function a() {},
                function b(p) {}
            ]);

            assert(zebkit.getMethod(B, 'a') !== null, true, "test_class 14");
            assert(zebkit.getMethod(B, 'b') !== null, true, "test_class 15");

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
            assertException(function() { Class([ function a() {}, function a() {}  ]); }, Error, "test_class 183");
            assertException(function() { Class([ function () {}, function () {}  ]); }, Error, "test_class 184");

            var A = new Class([
                function(p1, p2) {},
            ]);

            assert(A.clazz == Class, true, "test_class 22");
            assert(zebkit.getMethod(A, '') !== null, true, "test_class 222");

            var B = new Class(A, [
                function(p1, p2) {},
            ]);

            assert(B.clazz == Class, true, "test_class 26");
            assert(zebkit.getMethod(B, '') !== null, true, "test_class 26");

            assert(B.$parent == A, true, "test_class 33");
            assert(A.$parent === null, true, "test_class 34");

            assert(zebkit.getMethod(B, '').boundTo == B, true, "test_class 35");

            assert(typeof zebkit.getMethod(A, '').boundTo === 'undefined', true, "test_class 37");

            if (!zebkit.isIE) {
                assertException(function() { Class(DHJ); }, ReferenceError, "test_class 20");
                assertException(function() { Class(DHJ, MMM); }, ReferenceError, "test_class 20");
            }

            var a = new A(1), b = new B();
            assert(a.clazz == A, true, "test_class 38");
            assert(b.clazz == B, true, "test_class 381");
            assert(b.clazz != a.clazz, true, "test_class 382");

            var I = Interface();
            assert(I.clazz === Interface, true, "test_class 383");
        //    assertException(function() { new I(); }, Error, "test_class 3833");
            assertException(function() { Interface(I); }, Error, "test_class 3834");
            assertException(function() { Interface("a"); }, Error, "test_class 383");

            var I = Interface([ function a() {} ]);


            assert(typeof I.prototype.a !== "undefined", true, "test_class 38334");
            assert(typeof a.toString == 'function' && typeof a.toString.methofBody == 'undefined', true, 'toString in class instance1');
            assert(typeof a.$super == 'function'  && typeof a.$super.methofBody == 'undefined', true, 'equals in class instance3');

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
            assert(zebkit.getMethod(A, "a") !== null, true);
            assert(zebkit.getMethod(A, "b") !== null, true);
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
            var A = new Class([]).hashable();
            var B = new Class(A, [
                function a() { return 10; }
            ]);

            assert(A.$uniqueness, true, "test_unique 1");
            assert(B.$uniqueness, true, "test_unique 2");
            assert(B.prototype.toString.toString().indexOf("$hash$") > 0, true, "test_unique 3");
            assert(A.prototype.toString.toString().indexOf("$hash$") > 0, true, "test_unique 4");

            var C = new Class(B, [
                function a() { return 10; }
            ]).hashless();
            assert(C.$uniqueness, false, "test_unique 5");
            assert(C.prototype.toString.toString().indexOf("$hash$") < 0, true, "test_unique 6");

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
            assert(zebkit.instanceOf(a,Class), false, "Instance of a class is not instance of Class");
            assert(zebkit.instanceOf(a,A), true, "Instance of class is instance of the class");
            assert(zebkit.instanceOf(a,Object), false, "Class should not be an instance of standard JS Object class");
            assert(zebkit.instanceOf(a,String), false, "Class should not be an instance of standard JS String class");
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


            zebkit.assertNoException(function() { new D(1); }, ReferenceError, "test_constructor 22");
            zebkit.assertNoException(function() { new E(); }, ReferenceError, "test_constructor 23");
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

            assert(zebkit.getMethod(A, "b") != null, true, "test proto  method 1");
            assert(a.a, 10, "test proto  method 2");
            assert(a.b.boundTo == null, true, "test proto  method 3");
            assert(a.b.methodName == null, true, "test proto  method 4");
            assert(a.b(), 10, "test proto  method 5");

            var B = Class(A, [function $prototype() {
                this.b = function() {
                    return 100;
                };
            }]);
            var b = new B();

            assert(zebkit.getMethod(B, "b") != null, true, "test proto  method 6");
            assert(b.a, 10, "test proto  method 7");
            assert(b.b(), 100, "test proto  method 8");

            var C = Class(A, [
                function b(p1) {
                    return (p1 == null ? 100 : p1) + this.$super();
                }
            ]);
            var c = new C();

            assert(zebkit.getMethod(C, "b") != null, true);
            assert(c.a, 10, "test proto method 9");
            assert(c.b(), 110, "test proto method 10");
            assert(c.b(1), 11, "test proto method 11");

            var B = Class(A, []);
            var C = Class(B, [
                function b(p1) {
                    return (p1==null?100:p1) + this.$super();
                }
            ]);
            var c = new C();

            assert(zebkit.getMethod(C, "b") != null, true, "test proto method 12");
            assert(c.a, 10, "test proto method 13");
            assert(c.b(), 110, "test proto method 14");
            assert(c.b(1), 11,  "test proto method 15");

            // test if a standard method defined in Class.prototype can be overridden
            var C = Class([
                function $prototype() {
                    this.properties = function() {
                        return 10;
                    }
                }
            ]), c = new C();

            assert(c.properties(), 10, "test proto method 16");


            var CC = Class(C, [
            ]), cc = new CC();

            assert(cc.properties(), 10, "test proto method 17");
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
            zebkit.assertNoException(function() { a.a(1,2,3,4); }, ReferenceError, "test_public_methods 8");
            zebkit.assertNoException(function() { a.aa(1,2,3, 4); }, ReferenceError, "test_public_methods 9");
        },

        function test_interface() {
            assert(((Interface()) instanceof Interface), false, "test_interface1");
            assert(((new Interface()) instanceof Interface), false, "test_interface1");
            assert(zebkit.instanceOf(Interface(), Interface), true, "test_interface2");

            var I1 = new Interface(), I2 = new Interface();
            assert(I1 == I2, false, "test_interface3");

            var m = {};
            m[I1] = 1;
            m[I2] = 2;
            assert(m[I1], 1, "test_interface4");
            assert(m[I2], 2, "test_interface5");

            var I1 = new Interface(), I2 = new Interface(), I3 = new Interface(), I4 = new Interface();
            assert(I1 == I2, false, "test_interface6");
            assert(I1 == I3, false, "test_interface7");
            assert(I3 == I2, false, "test_interface8");
            assert(zebkit.instanceOf(I1, I2), false, "test_interface9");
            assert(zebkit.instanceOf(I1, I3), false, "test_interface10");
            assert(zebkit.instanceOf(I1, I1), false, "test_interface11");
            assert(zebkit.instanceOf(I2, I1), false, "test_interface12");
            assert(zebkit.instanceOf(I2, I2), false, "test_interface13");
            assert(zebkit.instanceOf(I2, I3), false, "test_interface14");
            assert(zebkit.instanceOf(I3, I1), false, "test_interface15");
            assert(zebkit.instanceOf(I3, I3), false, "test_interface16");
            assert(zebkit.instanceOf(I3, I2), false, "test_interface17");

            var II   = new Interface([ function a() {} ])
            var III  = new Interface([ function b() {} ]);
            var IIII = new Interface([ function c() {} ]);
            var C1 = new Class(II,   []);
            var C2 = new Class(III, II, []);
            var C3 = new Class(IIII, II, III, []);
            var C4 = new Class(C3, []);

            assertException(function() {
                Class(C1, II);
            }, Error);

            assertException(function() {
                Class(C3, II);
            }, Error);

            assertException(function() {
                Class(C4, II);
            }, Error);

            assertException(function() {
                Class(C4, III);
            }, Error);

            var o = new C1();
            assert(zebkit.instanceOf(o,C1), true, "test_interface18");
            assert(zebkit.instanceOf(o,II), true, "test_interface19");
            assert(zebkit.instanceOf(o,I1), false, "test_interface20");
            assert(zebkit.instanceOf(o,I2), false, "test_interface21");
            assert(zebkit.instanceOf(o,I3), false, "test_interface22");
            assert(zebkit.instanceOf(o,III), false, "test_interface23");
            assert(zebkit.instanceOf(o,IIII), false, "test_interface24");
            assert(zebkit.instanceOf(o,I4), false, "test_interface25");
            assert(typeof o.a  === "function", true, "test_interface126");
            assert(typeof o.b  === "undefined", true, "test_interface127");
            assert(typeof o.c  === "undefined", true, "test_interface128");

            var o = new C2();
            assert(zebkit.instanceOf(o,C2), true, "test_interface29");
            assert(zebkit.instanceOf(o,C1), false, "test_interface30");
            assert(zebkit.instanceOf(o,II), true, "test_interface31");
            assert(zebkit.instanceOf(o,III), true, "test_interface32");
            assert(zebkit.instanceOf(o,I1), false, "test_interface33");
            assert(zebkit.instanceOf(o,I2), false, "test_interface34");
            assert(zebkit.instanceOf(o,I3), false, "test_interface35");
            assert(zebkit.instanceOf(o,IIII), false, "test_interface36");
            assert(zebkit.instanceOf(o,I4), false, "test_interface37");
            assert(typeof o.a  === "function", true, "test_interface38");
            assert(typeof o.b  === "function", true, "test_interface39");
            assert(typeof o.c  === "undefined", true, "test_interface40");

            var o = new C3();
            assert(zebkit.instanceOf(o,C1), false, "test_interface41");
            assert(zebkit.instanceOf(o,C2), false, "test_interface42");
            assert(zebkit.instanceOf(o,C3), true, "test_interface43");
            assert(zebkit.instanceOf(o,II), true, "test_interface44");
            assert(zebkit.instanceOf(o,III), true, "test_interface45");
            assert(zebkit.instanceOf(o,IIII), true, "test_interface46");
            assert(zebkit.instanceOf(o,I1), false, "test_interface47");
            assert(zebkit.instanceOf(o,I2), false, "test_interface48");
            assert(zebkit.instanceOf(o,I3), false, "test_interface49");
            assert(zebkit.instanceOf(o,I4), false, "test_interface50");
            assert(typeof o.a  === "function", true, "test_interface51");
            assert(typeof o.b  === "function", true, "test_interface52");
            assert(typeof o.c  === "function", true, "test_interface53");

            var o = new C4();
            assert(zebkit.instanceOf(o,C1), false, "test_interface54");
            assert(zebkit.instanceOf(o,C2), false, "test_interface55");
            assert(zebkit.instanceOf(o,C3), true, "test_interface56");
            assert(zebkit.instanceOf(o,C4), true, "test_interface57");
            assert(zebkit.instanceOf(o,I4), false, "test_interface58");
            assert(zebkit.instanceOf(o,II), true, "test_interface59");
            assert(zebkit.instanceOf(o,I1), false, "test_interface60");
            assert(zebkit.instanceOf(o,I2), false, "test_interface61");
            assert(zebkit.instanceOf(o,I3), false, "test_interface62");
            assert(zebkit.instanceOf(o,III), true, "test_interface63");
            assert(zebkit.instanceOf(o,IIII), true, "test_interfac64");
            assert(typeof o.a  === "function", true, "test_interface65");
            assert(typeof o.b  === "function", true, "test_interface66");
            assert(typeof o.c  === "function", true, "test_interface67");

            assertException(function () {
                var IA = Interface([
                    function a() {},
                    function a() {}
                ]);

                Class(IA);
            }, Error);

            var IA = Interface([
                function $prototype() {
                    this.test = 88;
                },

                function a() { return "0"; },
                function b() { return 999  }
            ]);


            var ia = new IA();
            assert(ia.a(), "0", "test_interface69");
            assert(ia.b(), 999, "test_interface70");
            assert(ia.test, 88, "test_interface71");
            assert(zebkit.instanceOf(ia, IA), true);

            var IB = Interface([
                function c() {},
                function b() {},
            ]);

            assertException(function () {
                Class(IA, IB);
            }, Error);

            var A = Class(IA, [
                function $prototype() {
                    this.test2 = 99;
                }
            ]), a = new A();
            assert(a.a(), "0", "test_interface72");
            assert(a.b(), 999, "test_interface73");
            assert(a.test, 88, "test_interface74");
            assert(a.test2, 99, "test_interface75");
            assert(zebkit.instanceOf(a, A), true, "test_interface76");
            assert(zebkit.instanceOf(a, IA), true, "test_interface77");


            var A = Class(IA, [
                function $prototype() {
                    this.test = 888;
                },

                function a() { return "1"; }
            ]), a = new A();

            assert(a.a(), "1", "test_interface78");
            assert(a.b(), 999, "test_interface79");
            assert(a.test, 888, "test_interface80");

            var A = Class([
                function a() { return 10; }
            ]), I = Interface([ function a() { return 11; } ]), B = Class(A, I, []);

            var a = new A(), b = new B(), c = new I();
            assert(a.a(), 10, "test_interface81")
            assert(zebkit.instanceOf(a, A), true, "test_interface82");
            assert(zebkit.instanceOf(a, I), false, "test_interface83");
            assert(zebkit.instanceOf(a, B), false, "test_interface84");
            assert(b.a(), 11, "test_interface85");
            assert(zebkit.instanceOf(b, B), true, "test_interface86");
            assert(zebkit.instanceOf(b, I), true, "test_interface87");

            var I = Interface([
                function a() { return this.$super() + 1; }
            ]);

            var A = Class([
                function a() { return 996; }
            ]);

            var B = Class(A, I, []), b = new B();
            assert(b.a(), 997, "test_interface88");

            var C = Class(A,[]), c = new C();
            c.extend(I);
            assert(zebkit.instanceOf(c, I), true, "test_interface89");
            assert(zebkit.instanceOf(c, A), true, "test_interface90");
            assert(zebkit.instanceOf(c, C), true, "test_interface91");
            assert(zebkit.instanceOf(c, B), false, "test_interface92");
            assert(c.a(), 997, "test_interface93");
            assertException(function() {
                c.extend(I);
            }, Error);

            // check side effect
            c = new C();
            assert(zebkit.instanceOf(c, I), false, "test_interface94");
            assert(zebkit.instanceOf(c, A), true, "test_interface95");
            assert(zebkit.instanceOf(c, C), true, "test_interface96");
            assert(zebkit.instanceOf(c, B), false, "test_interface97");
            assert(c.a(), 996, "test_interface98");

            C.extend(I);
            c = new C();
            assert(zebkit.instanceOf(c, I), true, "test_interface99");
            assert(zebkit.instanceOf(c, A), true, "test_interface100");
            assert(zebkit.instanceOf(c, C), true, "test_interface101");
            assert(zebkit.instanceOf(c, B), false, "test_interface102");
            assert(c.a(), 997, "test_interface103");

            var C = Class(A,[]);
            assertException(function() {
                C.extend(I, [
                    function a() {}
                ]);
            }, Error);


            var c = new C();
            assert(zebkit.instanceOf(c, I), false, "test_interface104");
            assert(zebkit.instanceOf(c, A), true, "test_interface105");
            assert(zebkit.instanceOf(c, C), true, "test_interface106");
            assert(zebkit.instanceOf(c, B), false, "test_interface107");
            assertException(function() {
                c.extend(I, [
                    function a() {}
                ]);
            }, Error);


            // not stable abstract API
            var I = zebkit.Interface([
                function $prototype() {
                    this.b = 10;
                },

                function a() { return "10"; },

                "abstract",
                    function aa() {},
                    function bb() {}
            ]);

            assert(I.$abstractMethods, 2, "test_interface108");
            assert(I.prototype.aa.$isAbstract, true, "test_interface109");
            assert(I.prototype.bb.$isAbstract, true, "test_interface110");
            assert(I.prototype.a.$isAbstract, undefined, "test_interface11");

            var i = new I();
            assert(i.b, 10, "test_interface112");
            assert(i.a(), "10", "test_interface113");

            assertException(function() {
                i.aa();
            }, Error);

            i = new I([
                function aa() { return 99; }
            ]);

            assert(i.b, 10, "test_interface114");
            assert(i.a(), "10", "test_interface115");
            assert(i.aa(), 99, "test_interface116");


            var A = Class(I, [
                function aa() {
                    return "111";
                }
            ]);

            assert(A.prototype.aa.$isAbstract, undefined, "test_interface117");
            assert(A.prototype.bb.$isAbstract, true, "test_interface118");
            assert(A.prototype.a.$isAbstract, undefined, "test_interface119");

            var I = Interface([
                function $prototype() {
                    this.aa = 100;
                }
            ]), A = Class(I, [
                function $prototype() {
                    this.aa = 200;
                }
            ]), a = new A();


            assert(a.aa, 200, "test_interface120");
        },

        function test_class_toString_overwriting() {
            var A = Class([]);
            var I = Interface();
            var B = Class(A, I, []), b = new B();

            assert(zebkit.instanceOf(b, A), true);
            assert(zebkit.instanceOf(b, B), true);
            assert(zebkit.instanceOf(b, I), true);
            assert(B.toString(), B.$hash$);
            assert(A.toString(), A.$hash$);
            assert(I.toString(), I.$hash$);

            I.toString = B.toString = A.toString = function() { return "1"; };
            assert(B.toString() != B.$hash$, true);
            assert(A.toString() != A.$hash$, true);
            assert(I.toString() != I.$hash$, true);
            assert(zebkit.instanceOf(b, A), true);
            assert(zebkit.instanceOf(b, B), true);
            assert(zebkit.instanceOf(b, I), true);
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
            var I1 = new Interface();
            var I2 = new Interface();
            var A = new Class(I1, []), B = new Class(A, []), C = new Class(B, I2, []), D = new Class(I1, I2, []);
            var a = new A(), b = new B(), c = new C(), d = new D();
            assert(zebkit.instanceOf(a,A), true);
            assert(zebkit.instanceOf(a,B), false);
            assert(zebkit.instanceOf(a,C), false);
            assert(zebkit.instanceOf(a,I1), true);
            assert(zebkit.instanceOf(a,I2), false);
            assert(a.clazz, A);
            assert(a.clazz.$parent, null);
            assert(zebkit.instanceOf(b,A), true);
            assert(zebkit.instanceOf(b,B), true);

            assert(zebkit.instanceOf(b,C), false);
            assert(zebkit.instanceOf(b,I1), true);
            assert(zebkit.instanceOf(b,I2), false);
            assert(b.clazz, B);
            assert(b.clazz.$parent, A);

            assert(zebkit.instanceOf(c,A), true);
            assert(zebkit.instanceOf(c,B), true);
            assert(zebkit.instanceOf(c,C), true);
            assert(zebkit.instanceOf(c,I1), true);
            assert(zebkit.instanceOf(c,I2), true);
            assert(c.clazz, C);
            assert(c.clazz.$parent, B);

            assert(zebkit.instanceOf(d,A), false);
            assert(zebkit.instanceOf(d,B), false);
            assert(zebkit.instanceOf(d,C), false);
            assert(zebkit.instanceOf(d,D), true);
            assert(zebkit.instanceOf(d,I1), true);
            assert(zebkit.instanceOf(d,I2), true);

            assert(zebkit.instanceOf(d,String), false);
            assert(zebkit.instanceOf(d,Function), false);
            assert(zebkit.instanceOf(D, String), false);
            assert(zebkit.instanceOf(D, Function), false);

            assert(d.clazz, D);
            assert(d.clazz.$parent,  null);

            assertException(function() {
                Class(A, B, []);
            }, Error);
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
                    return this.$getSuper("a").call(this);
                }
            ]);

            var C = new Class(B, [
                function a(p1, p2) {
                    if (arguments.length === 0) return 222;
                    var d = this.$super(p1, p2);
                    return d + 10;
                },

                function c(p1, p2) {
                    return this.$getSuper("a").call(this, p1, p2) + 1;
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
            var A = new zebkit.Class([
                function b() { return 1000; }
            ]);

            var B = new zebkit.Class(A, [
                function b() { return this.$super() + 1; }
            ]);

            var C = new zebkit.Class(B, [
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
            zebkit.assertNoException(function() {
                d.a(1);
            }, Error, "test overriding 42");

            zebkit.assertException(function() {
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

            assert(ob.a(), 1, "test class extending 1");
            assert(ob.b(), 4, "test class extending 2");
            assert(ob.aa(), 3, "test class extending 3");
            assert(ob.bb(), 222, "test class extending 4");
            assert(ob.aaa(), 22, "test class extending 5");

            assert(oc.a(), 1, "test class extending 6");
            assert(oc.b(), 4, "test class extending 7");
            assert(oc.aa(), 14, "test class extending 8");
            assert(oc.c(), 123, "test class extending 9");
            assert(oc.bb(), 222, "test class extending 10");
            assert(oc.aaa(), 22, "test class extending 11");

            assert(B.$parent, A, "test class extending 12");
            assert(B.prototype.b.boundTo, B, "test class extending 13");
            assert(B.prototype.aa.boundTo, B, "test class extending 14");
            assert(B.prototype.aaa.boundTo, undefined, "test class extending 15");
            assert(B.prototype.bb.boundTo, undefined, "test class extending 16");
            assert(B.prototype.a.boundTo, A, "test class extending 17");
            assert(A.prototype.a.boundTo, A, "test class extending 18");
            assert(A.prototype.aa.boundTo, A, "test class extending 19");
            assert(A.prototype.aaa.boundTo, undefined, "test class extending 20");

            assert(C.prototype.a.boundTo, A, "test class extending 21");
            assert(C.prototype.aa.boundTo, C, "test class extending 22");
            assert(C.prototype.aaa.boundTo, undefined, "test class extending 23");
            assert(C.prototype.b.boundTo, B,"test class extending 24");
            assert(C.prototype.bb.boundTo, undefined, "test class extending 25");
            assert(C.prototype.c.boundTo, C, "test class extending 26");

            assert(A.prototype.aa != B.prototype.aa, true, "test class extending 27");
            assert(A.prototype.a != B.prototype.a, true, "test class extending 28");

            var Mix = [
                function aa() {
                    return 10 + this.$super();
                }
            ];

            B.extend(Mix);
            assert(B.$isExtended, true, "test class extending 29");
            assert(B.$parent != A, true, "test class extending 30");
            assert(A.$parent, null, "test class extending 31");
            assert(B.$parent.$parent, A, "test class extending 32");

            assert(B.$parent.prototype.a.boundTo, A, "test class extending 33");
            assert(B.$parent.prototype.aa.boundTo, B.$parent, "test class extending 34");
            assert(B.$parent.prototype.b.boundTo, B.$parent, "test class extending 35");

            assert(B.prototype.a.boundTo, A, "test class extending 36");
            assert(B.prototype.aa.boundTo, B, "test class extending 37");
            assert(B.prototype.b.boundTo, B.$parent, "test class extending 38");
            assert(B.prototype.bb.boundTo, undefined, "test class extending 39");
            assert(B.prototype.aaa.boundTo, undefined, "test class extending 40");

            assert(C.prototype.a.boundTo, A, "test class extending 41");
            assert(C.prototype.aa.boundTo, C, "test class extending 42");
            assert(C.prototype.aaa.boundTo, undefined, "test class extending 43");
            assert(C.prototype.b.boundTo, B, "test class extending 44");
            assert(C.prototype.bb.boundTo, undefined, "test class extending 45");
            assert(C.prototype.c.boundTo, C, "test class extending 46");

            assert(A.prototype.a.boundTo, A, "test class extending 47");
            assert(A.prototype.aa.boundTo, A, "test class extending 48");
            assert(A.prototype.aaa.boundTo, undefined, "test class extending 49");

            var b = new B(), c = new C();
            assert(b.a(), 1, "test class extending 50");
            assert(b.b(), 4, "test class extending 51");
            assert(b.aa(), 13, "test class extending 52");
            assert(b.bb(), 222, "test class extending 53");
            assert(b.aaa(), 22, "test class extending 54");

            assert(c.a(), 1, "test class extending 55");
            assert(c.b(), 4, "test class extending 56");
            assert(c.aa(), 24, "test class extending 57");
            assert(c.c(), 123, "test class extending 58");
            assert(c.bb(), 222, "test class extending 59");
            assert(c.aaa(), 22, "test class extending 60");

            assert(ob.a(), 1, "test class extending 61");
            assert(ob.b(), 4, "test class extending 62");
            assert(ob.aa(), 13, "test class extending 63");
            assert(ob.bb(), 222, "test class extending 64");
            assert(ob.aaa(), 22, "test class extending 65");

            assert(oc.a(), 1, "test class extending 66");
            assert(oc.b(), 4, "test class extending 67");
            assert(oc.aa(), 24, "test class extending 68");
            assert(oc.c(), 123, "test class extending 69");
            assert(oc.bb(), 222, "test class extending 70");
            assert(oc.aaa(), 22, "test class extending 71");

            var Mix = [
                function aa() {
                    return 12 + this.$super();
                }
            ];

            var B_parent = B.$parent;
            assert(B_parent != null, true);
            B.extend(Mix);

            assert(B_parent, B.$parent, "test class extending 72");
            assert(b.a(), 1, "test class extending 73");
            assert(b.b(), 4, "test class extending 74");
            assert(b.aa(), 15, "test class extending 75");
            assert(b.bb(), 222, "test class extending 77");
            assert(b.aaa(), 22, "test class extending 78");

            assert(c.a(), 1, "test class extending 79");
            assert(c.b(), 4, "test class extending 80");
            assert(c.aa(), 26, "test class extending 90");
            assert(c.c(), 123, "test class extending 91");
            assert(c.bb(), 222, "test class extending 92");
            assert(c.aaa(), 22, "test class extending 93");


            var A = Class([ function a() { return 10; }, function c() {} ]), p = A.$parent, I = Interface([
                function ai() { return 11; }
            ]);

            assert(A.$parent, null, "test class extending 94");
            assert(A.prototype.a.boundTo, A, "test class extending 95");
            assert(A.prototype.c.boundTo, A, "test class extending 96");

            A.extend(I, [
                function b() {
                    return 1;
                },

                function a() {
                    return this.$super() + 1;
                }
            ]);

            assert(A.$parent != null, true, "test class extending 97");
            assert(A.prototype.b.boundTo, A, "test class extending 98");
            assert(A.prototype.a.boundTo, A, "test class extending 99");
            assert(A.prototype.c.boundTo, A.$parent, "test class extending 100");
            assert(p != A.$parent, true);

            var a = new A();

            assert(a.a(), 11, "test class extending 101");
            assert(a.ai(), 11, "test class extending 102");
            assert(a.b(), 1, "test class extending 103");
            assert(zebkit.instanceOf(a, I), true, "test class extending 104");
            assert(zebkit.instanceOf(a, A), true, "test class extending 105");

            var I2 = Interface([ function ai2() { return 5; } ]);
            A.extend(I2, [ function d() { return "a"; } ]);

            assert(typeof a.d, "function", "test class extending 106");
            assert(typeof a.ai2, "function", "test class extending 107");
            assert(a.d(), "a", "test class extending 108");
            assert(a.ai2(), 5, "test class extending 109");
            assert(zebkit.instanceOf(a, I), true, "test class extending 110");
            assert(zebkit.instanceOf(a, A), true, "test class extending 111");
            assert(zebkit.instanceOf(a, I2), true, "test class extending 112");
        },

        function test_mixing_definition() {
            var Mix = Interface([
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
            ]);

            var A = Class([
                function   a() {
                    return 10;
                }
            ]);

            var B = Class(A, Mix, [
                function  b() {
                    return 11;
                }
            ]);

            var a = new A(), b = new B();

            assert(a.a(), 10, "test_mixing_definition 1");
            assert(b.b(), 11, "test_mixing_definition 2");
            assert(b.aa(), 123, "test_mixing_definition 3" );
            assert(b.a(), 20, "test_mixing_definition 4");
            assert(b.aaa(), 890, "test_mixing_definition 5");
            assert(B.prototype.aaa.boundTo == null, true, "test_mixing_definition 6");
            assert(b.af, 330, "test_mixing_definition 7");
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
            assert(zebkit.$global['a'], undefined);

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
            assert(zebkit.getMethod(A, "m1") != null, true);
            assert(a.m1 != null, true);
            assert(a.m1.methodName, "m1");
            assert(a.m2.methodName, "m2");
            assert(a.m1 != null, true);


            assert(a.m1(), 500);
            assert(zebkit.getMethod(A, "m2") != null, true);
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

            assert(zebkit.getMethod(B, "m1") != null, true);
            assert(a.m1 != null, true);
            assert(a.m1.methodName, "m1");
            assert(a.m1(), 500);
            assert(zebkit.getMethod(B, "m2") != null, true);
            assert(a.m2 != null, true);
            assert(a.m2(), 501);
            assert(a.a(), 502);


            var I = Interface([
                function i() { return 90; }
            ]);

            var A = Class([
                function a() { return 77; }
            ]), a = new A();

            a.extend(I, [
                function a() {
                    return this.$super() + 33;
                }
            ]);

            assert(a.a(), 110);

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
            assert(zebkit.instanceOf(a,A), true, "anonymous is instance of initial class");
            assert(a.clazz != (new A()).clazz, true, "anonymous class doesn't equal initial class");
            assert(a.clazz.$parent == A, true, "anonymous has proper parent class");


            a = new A();
            assert(a.a(), 1, "anonymous didn't touch method a() of initial class");
            assert(a.a(12), 12, "anonymous didn't touch method a(1) of initial class");
            assert(this['a'], undefined, "anonymous didn't update current scope");
            assert(zebkit.$global['a'], undefined, "anonymous didn't update global scope");

            var A = new Class([
                function(m) { this.m = m; }
            ]);

            a = new A(100, [
                function(m) {
                    this.$super(m);
                }
            ]);

            assert(a.m, 100, "anonymous properly called super method");

            var I = new Interface([ function a() { return 10; } ]);
            zebkit.assertNoException(function() {
                new I();
            },Error);

            var A = new Class([
                function() { this.m = 100; }
            ]);

            zebkit.assertNoException(function() {
                new A([]);
            }, Error);
            var a = new A([]);
            assert(a.m, 100);

            var a = new A([
                 function() { this.$super(); }
            ]);
            assert(a.m, 100);

            var I = new Interface();
            var aa = new A(I, [
                 function() { this.m = 200; }
            ]);
            assert(zebkit.instanceOf(aa, I), true);
            assert(zebkit.instanceOf(a, I), false);
            assert(zebkit.instanceOf(aa, A), true);
            assert(zebkit.instanceOf(a, A), true);
            assert(aa.m, 200);
            assert(a.m, 100);

            var I2 = new Interface();
            var aaa = new A(300, I, I2, [
                 function(p) { this.m = p; }
            ]);
            assert(zebkit.instanceOf(aaa, A), true);
            assert(zebkit.instanceOf(aaa, I), true);
            assert(zebkit.instanceOf(aaa, I2), true);
            assert(aaa.m, 300);

            assert(zebkit.instanceOf(aa, A), true);
            assert(zebkit.instanceOf(aa, I), true);
            assert(zebkit.instanceOf(aa, I2), false);
            assert(aa.m, 200);

            assert(zebkit.instanceOf(a, A), true);
            assert(zebkit.instanceOf(a, I), false);
            assert(zebkit.instanceOf(a, I2), false);
            assert(a.m, 100);

            assert(a != aa, true);
            assert(a != aaa, true);
            assert(aa != aaa, true);

            zebkit.assertNoException(function() {
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

        function test_mixing() {
            var A = Class([
                function a(p1) {
                    if (arguments.length === 0) return 10;
                    return p1;
                }
            ]), I = Interface([ function i() { } ]);


            var a = new A(), clz = a.clazz;
            assert(a.a(), 10);
            assert(a.a(111), 111);
            assert(a.$isExtended, undefined);

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
            assert(a.$isExtended, true, "Anonymous is extended ");

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
            assert(a.$isExtended, true)

            // no side effect to parent class
            var a = new A(), clz = a.clazz;
            assert(a.a(), 10);
            assert(a.a(111), 111);
            assert(a.$isExtended, undefined);

            // more deep super calling
            var B = Class(A, [
                function b() {
                    return this.$getSuper("a").call(this);
                }
            ]), b = new B();

            assert(b.a(), 10);
            assert(b.b(), 10);
            assert(b.a(111), 111);
            assert(b.$isExtended,  undefined);
            assert(zebkit.instanceOf(b, I), false);


            b.extend(I, [
                function b() {
                    return this.$getSuper("a").call(this, 121);
                }
            ]);

            assert(b.a(), 10);
            assert(b.b(), 121);
            assert(b.a(112), 112);
            assert(b.$isExtended, true);
            assert(zebkit.instanceOf(b, I), true);


            // no side effect to parent class
            var b = new B(), clz = a.clazz;
            assert(b.a(), 10);
            assert(b.b(), 10);
            assert(b.a(111), 111);
            assert(b.$isExtended, undefined);
            assert(zebkit.instanceOf(b, I), false);

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
            a2.aa();
            assert(a2.ssValue, 77);
        },

        function test_package() {
            var b = false;
            zebkit.package("testp", function(pkg, clz) {
                b = true;
                assert(clz, Class);
                assert(pkg, zebkit.testp);
                assert("testp", zebkit.testp.$name);
            });

            assert(b, true);
            assert(zebkit.testp != null, true);
            assert(zebkit.testp.fullname(), "zebkit.testp");
            assert(zebkit.testp.$parent, zebkit);

            var b = false;
            zebkit.package("testp.aa.bb", function(pkg, clz) {
                b = true;
                assert(clz, Class);
                assert(pkg, zebkit.testp.aa.bb);
                assert("bb", zebkit.testp.aa.bb.$name);
            });

            assert(b, true);
            assert(zebkit.testp.aa.bb != null, true);
            assert(zebkit.testp.$parent, zebkit);
            assert(zebkit.testp.aa.$parent, zebkit.testp);
            assert(zebkit.testp.aa.bb.$parent, zebkit.testp.aa);
            assert(zebkit.testp.aa.fullname(), "zebkit.testp.aa");
            assert(zebkit.testp.aa.bb.fullname(), "zebkit.testp.aa.bb");

            assertException(function() {
                zebkit.package("t", function(pkg, clz) {
                });
            }, Error);

            assertException(function() {
                zebkit.package("3t", function(pkg, clz) {
                });
            }, Error);

            assertException(function() {
                zebkit.package("ds.3d", function(pkg, clz) {
                });
            }, Error);


            zebkit.testp.aa.testf = function() {
                return 123;
            };

            (function() {
                eval(zebkit.testp.aa.import());
                assert(testf(), 123);
            })();


            zebkit.package("xx", function(ui) {
                this.Test = zebkit.Class([]);
                this.Test.Inner = zebkit.Class([]);
            });

            var Test  = zebkit.xx.Test;
            var Inner = zebkit.xx.Test.Inner;
            assert(zebkit.xx.Test.$name, "zebkit.xx.Test");
            assert(zebkit.xx.Test.Inner.$name, "zebkit.xx.Test.Inner");

            zebkit.package("xx", function(ui) {
                this.Test.Test = zebkit.Class([]);
                this.Test2 = zebkit.Class([]);
            });

            assert(zebkit.xx.Test, Test);
            assert(zebkit.xx.Test.Inner, Inner);
            assert(zebkit.xx.Test.$name, "zebkit.xx.Test");
            assert(zebkit.xx.Test.Test.$name, "zebkit.xx.Test.Test");
            assert(zebkit.xx.Test2.$name, "zebkit.xx.Test2");
        },

        function test_class_names() {
            var pkg2 = zebkit.package("test", function(pkg) {
                assert(pkg, zebkit.test);

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


                assert(zebkit.test != null, true, "test class package 1");
                assert(zebkit.test.A != null, true, "test class package 2");
                assert(zebkit.test.AA != null, true, "test class package 3");
                assert(zebkit.test.A.B != null, true, "test class package 4");
                assert(zebkit.test.AA.BB != null, true, "test class package 5");
            });


            assert(pkg2, zebkit.test);

            assert(pkg2.A.a, 100, "test class package 9");
            assert(pkg2.A.$name, "zebkit.test.A", "test class package 6");
            assert(pkg2.A.B.$name, "zebkit.test.A.B", "test class package 7");
            assert(pkg2.A.B.A.$name, "zebkit.test.A.B.A", "test class package 8");


            assert(pkg2.AA.$name, "zebkit.test.AA", "test class package 10");
            assert(pkg2.AA.a, 100, "test class package 11");
            assert(pkg2.AA.BB.$name, "zebkit.test.AA.BB", "test class package 12");
            assert(pkg2.AA.BB.A.$name, "zebkit.test.AA.BB.A", "test class package 13");
            assert(pkg2.AA.B.$name, "zebkit.test.AA.B", "test class package 14");
            assert(pkg2.AA.B.A.$name, "zebkit.test.AA.B.A", "test class package 15");
        },

        function test_parametrized_interface() {
            assertException(function() { Interface([ function() {} ]); }, Error);

            var I = Interface([
                function a() {
                    return 9;
                },

                function $prototype() {
                    this.v1 = 100;
                    this.v2 = 299;
                }
            ]);
            assertException(function() { I(); }, Error, "test_parametrized_interface1");
            assertException(function() { I([]); }, Error, "test_parametrized_interface2");
            assertException(function() { I(1); }, Error, "test_parametrized_interface3");
            assertException(function() { I("1"); }, Error, "test_parametrized_interface4");


            var i = new I();
            assert(zebkit.instanceOf(i, I), true);
            assert(i.a(), 9, "test_parametrized_interface5");
            assert(i.v1, 100, "test_parametrized_interface6");
            assert(i.v2, 299, "test_parametrized_interface7");


            var II = I({ v1: 345 }), ii = new II();

            assert(II.$abstractMethods, 0, "test_parametrized_interface8");
            assert(I.$abstractMethods, 0, "test_parametrized_interface9");
            assert(II.$lostMe, I.$lostMe, "test_parametrized_interface10");


            assert(zebkit.instanceOf(ii, I), true, "test_parametrized_interface11");
            assert(zebkit.instanceOf(ii, II), true, "test_parametrized_interface12");
            assert(ii.a(), 9, "test_parametrized_interface13" );
            assert(ii.v1, 345, "test_parametrized_interface14" );
            assert(ii.v2, 299, "test_parametrized_interface15" );
            assert(i.a(), 9, "test_parametrized_interface16.1");
            assert(i.v1, 100, "test_parametrized_interface16.2");
            assert(i.v2, 299, "test_parametrized_interface17");

            var i = new I();
            assert(zebkit.instanceOf(i, I), true, "test_parametrized_interface18");
            assert(i.a(), 9, "test_parametrized_interface19");
            assert(i.v1, 100, "test_parametrized_interface20");
            assert(i.v2, 299, "test_parametrized_interface21");


            var A = Class(I({ v2: 300 }), []), a = new A();
            assert(zebkit.instanceOf(a, A), true, "test_parametrized_interface22");
            assert(zebkit.instanceOf(a, I), true, "test_parametrized_interface23");
            assert(a.v1, 100, "test_parametrized_interface24");
            assert(a.v2, 300, "test_parametrized_interface25");
            assert(a.a(), 9, "test_parametrized_interface26");

            var I = Interface([
                function $prototype() {
                    this.v1 = 100;
                    this.v2 = [ 1, 2, 3];
                    this.v3 = {
                        a: 1, d: true
                    };
                },

                function aa() {},

                "abstract",
                    function a() {},
                    function b() {},
            ]), II = I({});

            assert(I.$abstractMethods, 2, "test_parametrized_interface27");
            assert(II.$abstractMethods, 2, "test_parametrized_interface28");
            assert(I.prototype.aa != null, true, "test_parametrized_interface29");
            assert(I.prototype.aa, II.prototype.aa, "test_parametrized_interface30");

            assert(I.prototype.a != null, true, "test_parametrized_interface31");
            assert(I.prototype.a, II.prototype.a, "test_parametrized_interface32");
            assert(I.prototype.b != null, true, "test_parametrized_interface33");
            assert(I.prototype.b, II.prototype.b, "test_parametrized_interface34");

            var i = new I(), ii = new II();

            assert(i.v1, 100);
            assert(i.v2 != null, true);
            assertObjEqual(i.v2, [1,2,3]);
            assert(ii.v1, i.v1);
            assert(i.v2 != ii.v2, true);
            assert(i.v3 != ii.v3, true);
            assertObjEqual(ii.v2, i.v2);
            assertObjEqual(ii.v3, i.v3);
        },

        function test_clone() {
            assert(zebkit.clone(null), null, "test_clone 1");
            assert(zebkit.clone(undefined), undefined, "test_clone 2");
            assert(zebkit.clone(true), true, "test_clone 3");
            assert(zebkit.clone(1), 1, "test_clone 4");
            assert(zebkit.clone("abc"), "abc", "test_clone 5");

            var arr = [1,2,3, ["A", "B" ] ], carr = zebkit.clone(arr);
            assert(arr != carr, true, "test_clone 6");
            assert(arr.length, carr.length, "test_clone 7");
            assert(arr[arr.length-1] != carr[carr.length-1], true, "test_clone 8");
            assertObjEqual(arr, carr, "test_clone 9");
            assertObjEqual(arr[arr.length-1], carr[carr.length-1], "test_clone 10");
            assertObjEqual(arr[arr.length-1].length, carr[carr.length-1].length, "test_clone 11");

            var o = { a: "1", b: true, c : [ 3,4,5] }, co = zebkit.clone(o);
            assert(o != co, true, "test_clone 12");
            assert(o.c != co.c, true, "test_clone 13");
            assertObjEqual(o, co, "test_clone 14");
            assertObjEqual(o.c, co.c, "test_clone 15");

            var A = Class([
                function $clazz() {
                    this.AA = "300";
                    this.SS = { a: "300", b: ["a", 1, 2], c: { d: 100 } } ;
                    this.MM = function(a) {
                        return a;
                    };

                    this.$TT = 100;
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
            ]).hashable(), a = new A(), aa = zebkit.clone(a);

            assert(a != aa, true, "test_clone 16");
            assert(a.$hash$ != null, true, "test_clone 17");
            assert(aa.$hash$ != null, true, "test_clone 18");
            assert(a.$hash$ != aa.$hash$, true, "test_clone 19");
            a.$hash$ = aa.$hash$
            assertObjEqual(a, aa, "test_clone 20");


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
            ]), b = new B(), bb = zebkit.clone(b);

            // static field cloning
            assert(B.AA, A.AA);
            assert(B.SS != A.SS, true);
            assertObjEqual(B.SS, A.SS);
            assert(B.MM === A.MM, true);
            assert(A.$TT, 100);
            assert(B.$TT, undefined);

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

            var f1 = function() {}, f2 = zebkit.clone(f1);
            assert(f1, f2);

            // recursive references and the same references
            var dr = { a: 10, b:"test", c: { a: 12 }  },
                d1 = { a:dr, b: { a: dr, c: 12 }  },
                d2 = zebkit.clone(d1);

            assert(d2.a, d2.b.a);
            assert(d2.a != d1.a, true);
            assert(d2.a != dr, true);
            assertObjEqual(d2.a, dr);
            assertObjEqual(d1.a, dr);
            assertObjEqual(d1, d2);
        },

        function test_isInherit() {
            var I1 = Interface();
            var I2 = Interface();
            var A = Class(I1, I2, []);
            var B = Class(A, []);
            var C = Class(B, []);
            var D = Class(I2, []);

            assert(A.isInherit(I1), true);
            assert(A.isInherit(I2), true);
            assert(A.isInherit(B), false);
            assert(A.isInherit(C), false);
            assert(A.isInherit(D), false);
            assert(A.isInherit(A), false);

            assert(B.isInherit(A), true);
            assert(B.isInherit(I1), true);
            assert(B.isInherit(I2), true);
            assert(B.isInherit(B), false);
            assert(B.isInherit(C), false);
            assert(B.isInherit(D), false);

            assert(C.isInherit(A), true);
            assert(C.isInherit(I1), true);
            assert(C.isInherit(I2), true);
            assert(C.isInherit(B), true);
            assert(C.isInherit(C), false);
            assert(C.isInherit(D), false);

            assert(D.isInherit(A), false);
            assert(D.isInherit(I1), false);
            assert(D.isInherit(I2), true);
            assert(D.isInherit(B), false);
            assert(D.isInherit(C), false);
            assert(D.isInherit(D), false);

            assert(zebkit.instanceOf(null, A), false);
            assert(zebkit.instanceOf(undefined, A), false);
            assert(zebkit.instanceOf('', A), false);
            assert(zebkit.instanceOf(1, A), false);
            assert(zebkit.instanceOf("sdsd", A), false);

            assertException(function() {
                zebkit.instanceOf(a, "sdqweqwewqe");
            }, Error);

            assertException(function() {
                zebkit.instanceOf(a, null);
            }, Error);

            assertException(function() {
                zebkit.instanceOf(a, undefined);
            }, Error);

            var NAA = function() {};
            var naa = new NAA();

            assert(zebkit.instanceOf(naa, NAA), true);
            assert(zebkit.instanceOf(naa, A), false);
            assert(zebkit.instanceOf(naa, I1), false);
        },

        function test_Path() {
            var paths = {
                "" : {
                    host: null,
                    port: -1,
                    path: null,
                    scheme: null,
                    qs    : null,
                    parent: null
                },

                "abcd": {
                    host: null,
                    port: -1,
                    path: "abcd",
                    scheme: null,
                    qs    : null,
                    parent: null
                },

                "ftp://com.net/test": {
                    host: "com.net",
                    port: -1,
                    path: "/test",
                    scheme: "ftp",
                    qs    : null,
                    parent: "ftp://com.net/"
                },

                "http://com.net:9089/test/aaa/": {
                    host: "com.net",
                    port: 9089,
                    path: "/test/aaa",
                    scheme: "http",
                    qs    : null,
                    parent: "http://com.net:9089/test"
                },

                "/com/test1": {
                    host: null,
                    port: -1,
                    path: "/com/test1",
                    scheme: null,
                    qs    : null,
                    parent: "/com"
                },

                "com/test1": {
                    host: null,
                    port: -1,
                    path: "com/test1",
                    scheme: null,
                    qs    : null,
                    parent: "com"
                },

                "file:///com/test1": {
                    host: null,
                    port: -1,
                    path: "/com/test1",
                    scheme: "file",
                    qs    : null,
                    parent: "file:///com"
                },
                "file:///com/test1?a=10": {
                    host: null,
                    port: -1,
                    path: "/com/test1",
                    scheme: "file",
                    qs    : "a=10",
                    parent: "file:///com?a=10"
                },

                "file:///com/test1?aaa": {
                    host: null,
                    port: -1,
                    path: "/com/test1",
                    scheme: "file",
                    qs    : "aaa",
                    parent: "file:///com?aaa"
                },

                "http://test.com/test1?aaa=3": {
                    host: "test.com",
                    port: -1,
                    path: "/test1",
                    scheme: "http",
                    qs    : "aaa=3",
                    parent: "http://test.com/?aaa=3"
                }
            };

            for(var k in paths) {
                var r = paths[k],
                    u = new zebkit.URI(k);
                assert(r.host, u.host, "URI assert 1 '" + k + "'");
                assert(r.scheme, u.scheme, "URI assert 2 '" + k + "'");
                assert(r.port, u.port, "URI assert 3 '" + k + "'");
                assert(r.qs, u.qs, "URI assert 4 '" + k + "'");
                assert(r.path, u.path, "URI assert 5 '" + k + "'");
                assert(r.parent, u.getParent() === null ? null : u.getParent().toString(), "URI assert 6 '" + k + "'");
            }

        },

        function test_perf() {
            var NA = function(argument) {
            }

            zebkit.A33 = Class([
            ]);

            zebkit.A22 = Class([
                function() {}
            ]);

            var B22 = Class(zebkit.A22, [  ]);


            var d = new Date().getTime();
            for (var i = 0; i < 5000000; i++) {
                new zebkit.A33();
            }
            console.log("No constr inst :  " + (new Date().getTime() - d));


            var d = new Date().getTime();
            for (var i = 0; i < 5000000; i++) {
                var n = new NA();
            }
            console.log("Native inst result :  " + (new Date().getTime() - d));


            var d = new Date().getTime();
            for (var i = 0; i < 5000000; i++) {
                new zebkit.A22();
            }
            console.log("Constr inst result :  " + (new Date().getTime() - d));

            var d = new Date().getTime();
            for (var i = 0; i < 5000000; i++) {
                new B22();
            }
            console.log("Inherited constr inst result :  " + (new Date().getTime() - d));


            return

            var a = new zebkit.A22();
            var b = new zebkit.B22();
            var d = new Date().getTime();
            for (var i = 0; i < 2000000; i++) {
                //new zebkit.A22();/        zebkit.instanceOf(a, A22);
                //new NA();
                zebkit.instanceOf(b, zebkit.A22);
            }
            console.log("InstanceOf Result :  " + (new Date().getTime() - d));

            var C = zebkit.Class(zebkit.B22, [
                function a() {}
            ]);
            var c = new C();
            var d = new Date().getTime();
            for (var i = 0; i < 8000000; i++) {
                //new zebkit.A22();/        zebkit.instanceOf(a, A22);
                //new NA();
                c.a();
            }
            console.log("Call proxy method Result :  " + (new Date().getTime() - d));

            var I = zebkit.Interface();

            I.mergeable = false;




            var D = zebkit.Class(C, I, [
                function a() { this.$super(); }
            ]);

            var DD = zebkit.Class(D, [
                //function a() { this.$super(); }
            ]);


            var dd = new D([ function setAbc(a) {} ]);

            var d = new Date().getTime();
            for (var i = 0; i < 8000000; i++) {
                //new zebkit.A22();/        zebkit.instanceOf(a, A22);
                //new NA();
                dd.a();
            }
            console.log("Call super method Result :  " + (new Date().getTime() - d));


            var d = new Date().getTime();
            for (var i = 0; i < 8000000; i++) {
                //new zebkit.A22();/        zebkit.instanceOf(a, A22);
                //new NA();
                zebkit.getPropertySetter(dd, "abc");
            }
            console.log("Property setter result :  " + (new Date().getTime() - d));
        }
    );
})();

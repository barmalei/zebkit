
if (typeof(XMLHttpRequest) === 'undefined') {
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
}

if (typeof(zebkit) === "undefined") {
    require('../build/easyoop.js');
    require('../src/js/misc/tools.js');

    yaml = require('../yaml.js');
}

zebkit.package("test", function() {

var assert = zebkit.assert,
    Class = zebkit.Class,
    Zson = zebkit.Zson,
    assertException = zebkit.assertException,
    assertNoException = zebkit.assertNoException,
    assertObjEqual = zebkit.assertObjEqual;


zebkit.runTests("util objects bag",
    function test_variables() {
        //console.dir(yaml);
        console.log("::: " + yaml.load("a : 10").a);


        var bag = new Zson();

        A = zebkit.Class([
            function(a) {
                this.a = a;
                this.d =100;
            }
        ]);

        var json = `
            { "a" : 1,
              "b" : 2,
              "c" : { "d": true },
              "aa": "%{a}",
              "bb": "%{b}",
              "cc": "%{c.d}" ,
              "dd": { "@A": 22 },
              "k" : "%{aa}",
              "l" : "%{bb}",
              "m" : "%{cc}",
              "mm": "%{dd}" }
        `;

        bag.then(json, function(bag) {
            var r = bag.root;
            assert(r.aa, 1, "test_variables 1");
            assert(r.bb, 2, "test_variables 2");
            assert(r.cc, true, "test_variables 3");

            assert(r.dd instanceof A, true, "test_variables 4");

            assert(r.dd.a, 22, "test_variables 5");
            assert(r.dd.d, 100, "test_variables 6");
            assert(r.variables, undefined, "test_variables 7");

            assert(r.k, 1, "test_variables 8");
            assert(r.l, 2, "test_variables 9");
            assert(r.m, true, "test_variables 10");
            assert(r.mm instanceof A, true, "test_variables 11");
        }).throw();
    },

    function test_emptybag() {
        var b = new Zson();
        b.then("{}").throw();
        var b = new Zson();
        b.then("[]").throw();
        assert(Array.isArray(b.root), true);

        assertNoException(function() { b.get("?ds"); }, "exception 11");
        assertException(function() { b.then("").throw(); }, "exception 2");
        assertException(function() { b.get(null); }, "exception 3");
        assertException(function() { b.get(undefined); }, "exception 4");
    },

    function test_simple_load() {
        var b = new Zson();
        b.then('{ "a":1, "b":{ "b1":"abc" }, "c": [1,2,3], "d":null }').throw();
        assert(b.get("a") === 1, true);
        assert(b.get("d") === null, true);
        zebkit.assertObjEqual(b.get("b"), {b1:"abc"});
        zebkit.assertObjEqual(b.get("c"), [1,2,3]);
        zebkit.assert(b.get("b.b1") === "abc", true);
    },

    function test_obj_merge() {
        var o = { a:2, b: { b2:100 }, c:[-2,-1, 0], x:{ ll:100 }, k: { k: 100 }, dd : null, ddd:[1,2,3], pp: { pp: { } } },
            b = new Zson(o);

        var json = `
            {
               "a" : 1,
               "b" : { "b1":"abc" },
               "c" : [1,2,3],
               "d" : null,
               "x" : null,
               "k" : { "k": { "k":100 }, "kk":99 },
               "dd": [1,2,3],
               "ddd" : null,
               "pp": { "pp": { "pp": [1,2]} }
           }
        `;

        b.then(json).throw();

        assert(b.get("a") === 1, true, "1", "test merge 1");
        assert(b.get("d") === null, true, "2", "test merge 2");

        zebkit.assertObjEqual(b.get("b"), { b1: "abc", b2 : 100 }, "3", "test merge 3");
        zebkit.assertObjEqual(b.get("c"), [1, 2, 3], "4", "test merge 4");


        //assertException(function() { b.get("cc"); }, "test merge 5");


        zebkit.assert(b.get("b.b1"), "abc", "6", "test merge 6");
        zebkit.assert(b.get("b.b2") , 100, "7", "test merge 7");

        zebkit.assert(b.get("x"), null, "8", "test merge 8");
        zebkit.assert(b.get("k.k.k"), 100, "9", "test merge 9");
        zebkit.assert(b.get("k.kk"), 99, "10", "test merge 10");
        zebkit.assert(b.get("ddd"), null, "11", "test merge 11");

        zebkit.assertObjEqual(b.get("dd"), [1,2,3], "12", "test merge 12");


        // empty bag merge
        var b = new Zson({});
        b.then('{ "test": 100, "a": { "b": true, "c": null } }').throw();

        assert(b.get("test"), 100, "test merge 14");
        assert(b.root.test, 100), "test merge 15";
        assert(b.root.a.b, true, "test merge 16");
        assert(b.root.a.c, null, "test merge 17");

        // test obj merge
        var b = new Zson({
            a: {
                b: {
                    c: 222
                }
            }
        });
        b.then('{ "a": 100 }').throw();
        assert(b.root.a, 100, "test merge 18");
        assert(b.get("a"), 100, "test merge 20");

        // test obj merge
        var b = new Zson({
            a: {
                b: {
                    c: 222
                }
            }
        });
        b.then('{ "a": { "d": 300 }  }').throw();
        assert(b.root.a.d, 300, "test merge 21");
        assert(b.root.a.b.c, 222, "test merge 22");

        // test obj merge
        var b = new Zson({
            a: {
                b: {
                    c: 222
                }
            }
        });
        b.then('{ "a": { "b": 300 }  }').throw();
        assert(b.root.a.b, 300, "test merge 23");

    },

    function test_class_instantiation() {
        var o = {},
            bag = new Zson(o),
            l = '{ "a": { "@A":[], "c": { "@A":[] } }, "b":{ "@A":["abc"] }, "c":{ "@A":true }, "d": {"@ *A": "xxx" } }';

        A = Class([
            function(c) {
                if (arguments.length === 0) c = "test";
                this.c = c;
                this.$mmm = 22;
            }
        ]);
        bag.then(l).throw();
        var a = bag.get("a");
        var b = bag.get("b");
        var c = bag.get("c");
        var d = bag.get("d");

        assert(zebkit.instanceOf(a, A), true, "a is ok");
        assert(zebkit.instanceOf(b, A), true, "b is ok");
        assert(zebkit.instanceOf(c, A), true, "c is ok");

        assert(zebkit.instanceOf(a.c, A), true, "a.c is ok");

        //console.log("d = " + d.$new);

        assert(zebkit.instanceOf(d, A), true, "d is ok");

        assert(bag.get("a") === bag.get("a"), true, "get(a) === get(a)");
        assert(bag.get("b") === bag.get("b"), true, "get(b) === get(b)");
        assert(bag.get("c") === bag.get("c"), true, "get(c) === get(c)");
        assert(bag.get("b") !== bag.get("a"), true, "get(b) !== get(a)");
        assert(bag.get("c") !== bag.get("a"), true, "get(c) !== get(a)");
        assert(bag.get("a.c") !== bag.get("a"), true, "get(a.c) !== get(a)");
        assert(bag.get("d") !== bag.get("d"), true, "get(d) !== get(d)");

        assert(a.c.c, "test", "a.c.c is valid");
        assert(b.c, "abc", "b.c is valid");
        assert(c.c, true,  "c.c is valid");
        assert(d.c, "xxx",  "d.c is valid");
        assert(a.$mmm, 22,  "a.$mmm is valid");
        assert(a.c.$mmm, 22, "a.c.$mmm is valid");
        assert(b.$mmm, 22, "b.$mmm is valid");
        assert(c.$mmm, 22, "c.$mmm is valid");
        assert(d.$mmm, 22, "d.$mmm is valid");

        var o   = {},
            bag = new Zson(o),
            l = '{ "a": { "@A":[], "c": { "@A":[] } }, "b":{ "@A":["abc"], "dd":"%{a}", "mm":"%{a.c}" }, "d":"%{a.c}" }';
        bag.then(l).throw();
        var r = bag.root;

        assert(zebkit.instanceOf(r.a, A), true, "zebkit.instanceOf(r.a, A)");
        assert(zebkit.instanceOf(r.b, A), true, "zebkit.instanceOf(r.b, A)");
        assert(zebkit.instanceOf(r.a.c, A), true, "zebkit.instanceOf(r.a.c, A)");
        assert(zebkit.instanceOf(r.d, A), true, "zebkit.instanceOf(r.d, A)");

        assert(zebkit.instanceOf(r.b.dd, A), true, "zebkit.instanceOf(r.b.dd, A)");
        assert(zebkit.instanceOf(r.b.mm, A), true, "zebkit.instanceOf(r.b.mm, A)");

        assert(r.b.dd, r.a, "test_class_instantiation 1");
        assert(r.a !== r.a.c, true, "test_class_instantiation 2");
        assert(r.b.mm, r.a.c, "test_class_instantiation 3");
        assert(r.d, r.a.c, "test_class_instantiation 4");

        assert(r.b.c, "abc");

        // root class
        var bag = new Zson();
        var json = '{ "@A":[] }';
        bag.then(json).throw();


        assert(zebkit.instanceOf(bag.root, A), true, "test_class_instantiation 5");
        assert(bag.root.c, "test", "test_class_instantiation 6");
        assert(bag.root.$mmm, 22, "test_class_instantiation 7");

        var bag = new Zson();
        var json = '{ "@A":[] }';
        bag.then(json).throw();

        assert(zebkit.instanceOf(bag.root, A), true, "test_class_instantiation 8");
        assert(bag.root.c, "test", "test_class_instantiation 9");
        assert(bag.root.$mmm, 22, "test_class_instantiation 10");
    },

    function test_classprops() {
        A = Class([
            function setName(n) {
                this.nameProp = n;
            },

            function $prototype() {
                this.setName2 = function(n) {
                    this.nameProp2 = n;
                };

                this.setProp3 = function(n) {
                    this.prop3 = n + 10;
                };

                this.setObj = function(o) {
                    this.obj = o;
                };
            }
        ]);

        var t = {},
            b = new Zson(t),
            json = `{ "a": { "@A"    :[],
                              "name" : 100,
                              "name2": 101,
                              "prop3": 11,
                              "obj"  : { "@A":[], "prop3":200 },
                              "b"    : { "@A":[], "name":200, "name2":201, "k":1 },
                              "c"    : 400
                            }
                    }`;

        b.then(json).throw();

        assert(t.a.nameProp, 100);
        assert(t.a.nameProp2, 101);
        assert(t.a.prop3, 21);
        assert(t.a.c, 400);
        assert(zebkit.instanceOf(t.a.obj, A), true);
        assert(t.a.obj.prop3, 210);
        assert(t.a.name, undefined);
        assert(t.a.b.name, undefined);
        assert(t.a.b.nameProp, 200);
        assert(t.a.b.nameProp2, 201);
        assert(t.a.b.k, 1);

        var t = new A(), b = new Zson(t);
        b.then('{  "prop3": 400,  "obj" : {  "@A":[], "prop3": 500   } }').throw();

        assert(t.prop3, 410);
        assert(zebkit.instanceOf(t.obj, A), true);
        assert(t.obj.prop3,  510);
    },

    function test_refs() {
        var o = { p1: { "p222":333  } }, bag = new Zson(o);

        var l = `{ "p1": {
                       "p11": { "p111" :  100,
                                "p12"  : "%{p1.p11.p111}",
                                "p13"  : { "p133" : "%{p1.p11.p111}" }
                              },
                              "p33" : "%{p1.p11.p111}"
                        },
                        "p2"  : { "p11": { "p22":"%{p1.p11.p111}" } },
                        "kf"  : "%{p1.p222}"
                }
                `;
        bag.then(l).throw();

        assert(bag.get("p1.p11.p111"), 100, "test_refs 1");
        assert(bag.get("p1.p11.p13.p133"), 100, "test_refs 2");
        assert(bag.get("p1.p33"), 100, "test_refs 3");
        assert(bag.get("p1.p11.p12"), 100, "test_refs 4");
        assert(bag.get("kf"), 333, "test_refs 5");

        var l = {
            a : 100,
            b : "%{a}"
        }
        var b = new Zson();
        b.then(l).throw();
        assert(b.root.a, 100, "test_refs 6");
        assert(b.root.b, 100, "test_refs 7");

        var l = {
            k: {
                a : 100,
                b : "%{k.a}"
            }
        }
        var b = new Zson();
        b.then(l).throw();
        assert(b.root.k.a, 100, "test_refs 8");
        assert(b.root.k.b, 100, "test_refs 9");
    },

    function test_class_field_initialization() {
        zebkit.A = zebkit.Class([]);

        var o = {},
            bag = new Zson(o), l = '{ "a": { "@zebkit.A":[], "id":100 }  }';
        bag.then(l).throw();

        assert(o.a.id, 100);
    },

    function test_obj_class_field_initialization() {
        zebkit.A = zebkit.Class([]);

        var o = {},
            bag = new Zson(o), l = { a: { "@zebkit.A":[], id:100 }  };
        bag.then(l).throw();

        assert(o.a.id, 100);
    },

    function test_expr() {
        zebkit.$c = 100;

        var o = {},
            bag = new Zson(o), l = '{ "v": "%{<js> zebkit.$c + 10}"  }';
        bag.then(l).throw();
        assert(bag.get("v"), 110);

        zebkit.$c = 100;
        var o = {},
            bag = new Zson(o), l = '{ "v": { ".expr" : "zebkit.$c + 12" } }';
        bag.then(l).throw();
        assert(bag.get("v"), 112);

        var json = `{
            "js": "%{<txt> http://localhost:8090/tests/zson.expr.json}",
            "eval": {
                ".expr": "%{js}"
            }
        }`;

        new Zson().then(json, function(bg) {
            assert(bg.root.eval, 82);
            assert(eval(bg.root.js), 82);
        }).catch();
    },

    function test_class_alias() {
        A = zebkit.Class([
            function(a) {
                this.a = a;
                this.d =100;
            }
        ]);

        var bag = new Zson();
        bag.then('{ "#addClassAliases" : {  "DD": "A" }, "c": { "@DD": 121 } } ' ).throw();
        var r = bag.root;

        assert(r.classAliases, undefined);
        assert(zebkit.instanceOf(bag.classAliases.DD, zebkit.Class), true, "1");
        assert(r.c instanceof A, true, "2");
        assert(r.c.a, 121);
        assert(r.c.d, 100);
    },

    function test_method_call() {
        var r = {
            cc : 2000
        };

        var bag = new Zson(r, [
            function b (p) {
                assert(bag, this);
                return p;
            }
        ]);

        A = zebkit.Class([
            function(a) {
                this.a = a;
                this.d = 100;
            }
        ]);

        bag.then({
            a : {
                "@A": 123,
                "b": { ".b": 133 },
                "d": 222
            }
        }).throw();

        assert(bag.root.a instanceof A, true);
        assert(bag.root.a.b, 133);
        assert(bag.root.a.d, 222);
        assert(bag.root.cc, 2000);
    },

    function test_instance_overwriting() {
        A = Class([
            function(t) {
                this.t = t;
            }
        ]);

        var bag = new Zson({
            a : 10,
            b : true,
            c : "String",
            d : null,
            e : [ 1, 2, 3],
            f : {
                aa : 1
            },
            k : new A("test")
        });

        var json = '{"a":11,"b":false,"c":"String 2","d":"undefined","e":[3,4,5],"f":{"bb":2},"k":{"@A":"test2"}}';
        bag.then(json).throw();

        assert(bag.root.a, 11, "test_instance_overwriting 1");
        assert(bag.root.b, false, "test_instance_overwriting 2");
        assert(bag.root.c, "String 2", "test_instance_overwriting 3");
        assert(bag.root.d, "undefined", "test_instance_overwriting 4");
        zebkit.assertObjEqual(bag.root.e, [3,4,5], "test_instance_overwriting 5");
        zebkit.assertObjEqual(bag.root.f, { bb: 2, aa : 1 }, "test_instance_overwriting 6");

        assert(bag.root.k.t, "test2" );
    },

    function test_complex_refs() {
        var bag = new Zson();
        bag.then("http://localhost:8090/tests/zson.test.json")
           .then(function(r) {
                assert(arguments.length, 1, "assert complex refs 0");
                assert(r === bag, true, "assert complex refs 00");

                r = r.root;
                assert(r.test1.a.test, 100, "assert complex refs 1");
                assert(r.test1.a.test2, "Hello", "assert complex refs 2");
                assert(r.test1.b.test, 200, "assert complex refs 3");
                assert(r.test1.b.a.test, 300, "assert complex refs 4");
                assert(r.test1.b.a.a, "???", "assert complex refs 5");
                assert(r.test1.b.clz instanceof Date, true, "assert complex refs 6");
                assert(r.test1.c.test, 800, "assert complex refs 7");
                assert(r.test1.c.a.test, 300, "assert complex refs 8");
                assert(r.test1.c.a.a, "???", "assert complex refs 9");
                assert(r.test1.d, 200, "assert complex refs 10");

                assert(r.test2.a, 100, "assert complex refs 11");
                assert(r.test2.b.test, 800, "assert complex refs 12");
                assert(r.test2.b.a.test, 300, "assert complex refs 13");

                assert(r.test2.c, 200, "assert complex refs 1");

                zebkit.assertObjEqual(r.test3, {
                    "test" : 999,
                    "test2": "Hello",
                    "a": {
                        "test": 300,
                        "a": "???"
                    },
                    "clz": r.test1.b.clz
                }, "assert complex refs 14");

                zebkit.assertObjEqual(r.test4, {
                    "test" : 100,
                    "test2": "hello2"
                }, "assert complex refs 15");

            }).catch(function(e) {
                zebkit.dumpError(e);
            });


        var bag2 = new Zson(), json = {
            "test1" : {
                "a"  : "%{<json> http://localhost:8090/tests/zson.test.1.1.json}",
                "b"  : "%{<json> http://localhost:8090/tests/zson.test.1.2.json}",
                "c"  : "%{<json> http://localhost:8090/tests/zson.test.1.3.json}",
                "d"  : "%{test1.b.test}"
            },

            "test2" : {
                "a": "%{test1.a.test}",
                "b": {
                    "test": "%{test1.c.test}",
                    "a"   : {
                        "test": "%{test1.c.a.test}"
                    }
                },
                "c" : "%{test1.d}",
                "e" : "%{test1.a}"
            },

            "test3" : {
                "a"    : "%{<json> http://localhost:8090/tests/zson.test.1.2.1.json}",
                "clz"   : "%{test1.b.clz}",
                "test2" : "Hello",
                "test"  : 999
            },

            "test4" : {
                "test" : "%{test1.a.test}",
                "test2" : "hello2"
            }
        };

        bag2.then(json)
           .then(function(r) {
                assert(arguments.length, 1, "assert complex refs 0");
                assert(r === bag2, true, "assert complex refs 00");

                r = r.root;
                assert(r.test1.a.test, 100, "assert complex refs 1");
                assert(r.test1.a.test2, "Hello", "assert complex refs 2");
                assert(r.test1.b.test, 200, "assert complex refs 3");
                assert(r.test1.b.a.test, 300, "assert complex refs 4");
                assert(r.test1.b.a.a, "???", "assert complex refs 5");
                assert(r.test1.b.clz instanceof Date, true, "assert complex refs 6");
                assert(r.test1.c.test, 800, "assert complex refs 7");
                assert(r.test1.c.a.test, 300, "assert complex refs 8");
                assert(r.test1.c.a.a, "???", "assert complex refs 9");
                assert(r.test1.d, 200, "assert complex refs 10");

                assert(r.test2.a, 100, "assert complex refs 11");
                assert(r.test2.b.test, 800, "assert complex refs 12");
                assert(r.test2.b.a.test, 300, "assert complex refs 13");

                assert(r.test2.c, 200, "assert complex refs 1");

                zebkit.assertObjEqual(r.test3, {
                    "test" : 999,
                    "test2": "Hello",
                    "a": {
                        "test": 300,
                        "a": "???"
                    },
                    "clz": r.test1.b.clz
                }, "assert complex refs 14");

                zebkit.assertObjEqual(r.test4, {
                    "test" : 100,
                    "test2": "hello2"
                }, "assert complex refs 15");

            }).catch(function(e) {
                zebkit.dumpError(e);
            });


            json = {
                "test1" : {
                    "a"  : "%{<json> zson.test.1.1.json}",
                    "b"  : "%{<json> zson.test.1.2.json}",
                    "c"  : "%{<json> zson.test.1.3.json}",
                    "d"  : "%{test1.b.test}"
                },

                "test2" : {
                    "a": "%{test1.a.test}",
                    "b": {
                        "test": "%{test1.c.test}",
                        "a"   : {
                            "test": "%{test1.c.a.test}"
                        }
                    },
                    "c" : "%{test1.d}",
                    "e" : "%{test1.a}"
                },

                "test3" : {
                    "a"    : "%{<json> zson.test.1.2.1.json}",
                    "clz"   : "%{test1.b.clz}",
                    "test2" : "Hello",
                    "test"  : 999
                },

                "test4" : {
                    "test" : "%{test1.a.test}",
                    "test2" : "hello2"
                }
            };

            var bag3 = new Zson();
            bag3.baseUri = "http://localhost:8090/tests";
            bag3.then(json)
               .then(function(r) {
                    assert(arguments.length, 1, "assert complex refs 0");
                    assert(r === bag3, true, "assert complex refs 00");

                    r = r.root;
                    assert(r.test1.a.test, 100, "assert complex refs 1");
                    assert(r.test1.a.test2, "Hello", "assert complex refs 2");
                    assert(r.test1.b.test, 200, "assert complex refs 3");
                    assert(r.test1.b.a.test, 300, "assert complex refs 4");
                    assert(r.test1.b.a.a, "???", "assert complex refs 5");
                    assert(r.test1.b.clz instanceof Date, true, "assert complex refs 6");
                    assert(r.test1.c.test, 800, "assert complex refs 7");
                    assert(r.test1.c.a.test, 300, "assert complex refs 8");
                    assert(r.test1.c.a.a, "???", "assert complex refs 9");
                    assert(r.test1.d, 200, "assert complex refs 10");

                    assert(r.test2.a, 100, "assert complex refs 11");
                    assert(r.test2.b.test, 800, "assert complex refs 12");
                    assert(r.test2.b.a.test, 300, "assert complex refs 13");

                    assert(r.test2.c, 200, "assert complex refs 1");

                    zebkit.assertObjEqual(r.test3, {
                        "test" : 999,
                        "test2": "Hello",
                        "a": {
                            "test": 300,
                            "a": "???"
                        },
                        "clz": r.test1.b.clz
                    }, "assert complex refs 14");

                    zebkit.assertObjEqual(r.test4, {
                        "test" : 100,
                        "test2": "hello2"
                    }, "assert complex refs 15");

                }).catch(function(e) {
                    zebkit.dumpError(e);
                });

    },

    function test_load_image() {
        if (typeof Image !== "undefined") {
            var bag = new Zson();
            bag.then('{"img" : "%{<img>http://localhost:8090/samples/images/home.png}" }', function(r) {
                assert(r.root.img instanceof Image, true, "test_load_image 2");
            }).catch();

            var bag = new Zson();
            bag.then('{"txt" : "%{<txt> http://localhost:8090/tests/t1.txt}" }', function(r) {
                assert(zebkit.isString(r.root.txt), true, "test_load_txt 1");
                assert(r.root.txt, "hello", "test_load_txt 2");
            }).catch();
        }
    },

    function test_async_class() {
        var aaac = false;

        AAA = zebkit.Class([
            function setTest(t) {
                aaac = true;
                this.test = t;
                zebkit.assertObjEqual(t, {"a":{"test":100,"test2":"Hello"}}, "test_async_class 1");
            }
        ]);

        var json = `
            { "a" :
                {   "@AAA" : [],
                    "test" : {
                        "a" : "%{<json> http://localhost:8090/tests/zson.test.1.1.json}"
                    }
                }
            }`;

        var bag = new Zson();
        bag.usePropertySetters = true;

        bag.then(json, function(res) {
            var r = res.root;
            assert(res, bag, "test_async_class 2");

            assert(res.root.a instanceof AAA, true, "test_async_class 3");
            zebkit.assertObjEqual(res.root.a.test, {"a":{"test":100,"test2":"Hello"}}, "test_async_class 4");
            assert(aaac, true, "test_async_class 5");
        }).catch();
    },

    function test_async_obj_load() {
        var cnt = 0;
        var A = zebkit.Class([
            function setA(v) {
                this.a = v;
                cnt++;
            },

            function setB(v) {
                cnt++;
                this.b = v;
            },

            function setC(v) {
                cnt++;
                this.c = v;
            }
        ]);

        var json = `
            { "a" : 100,
              "b" : "%{<json>http://localhost:8090/tests/zson.test.1.1.json}",
              "c" : "%{<json>http://localhost:8090/tests/zson.test.1.2.json}"}`;

        var a = new A(), bag = new Zson(a);
        bag.usePropertySetters = true;

        bag.then(json, function(r) {
            assert(r, bag, "test_async_obj_load 0");
            assert(cnt, 3, "test_async_obj_load 1");
            assert(r, bag, "test_async_obj_load 2");
            assert(r.root, a, "test_async_obj_load 3");
            zebkit.assertObjEqual(a.a, 100, "test_async_obj_load 4");
            zebkit.assertObjEqual(a.b, { "test":100,"test2":"Hello" }, "test_async_obj_load 5");
            assert(a.c.clz != null, true, "test_async_obj_load 6");
            zebkit.assertObjEqual(a.c, {"test":200,"a":{"test":300,"a":"???"},"clz": a.c.clz }, "test_async_obj_load 7");
        }).catch(function(e) {
            zebkit.dumpError(e);
        });


        var bbc = false, aac = false, ttc = false;
        BB = zebkit.Class([
            function(b) {
                bbc = true;
                this.b = b;
                assertObjEqual(b, {"test":200,"a":{"test":300,"a":"???"},"clz":b.clz}, "test_async_obj_load 9");
                assert(b.clz != null, true, "test_async_obj_load 8");
            },

            function setA(a) {
                aac = true;
                zebkit.assertObjEqual(a, { "test":100,"test2":"Hello" }, "test_async_obj_load 10");
                this.a = a;
            }
        ]);
        var json = `
            {   "kids" : {
                    "top" : {
                        "@BB" : [ "%{<json>http://localhost:8090/tests/zson.test.1.2.json}" ],
                        "a"   : [ "%{<json>http://localhost:8090/tests/zson.test.1.1.json}" ]
                    }
                }
            }`;

        var TT = zebkit.Class([
            function setKids(kids) {
                ttc = true;
                for(var k in kids) {
                    assert(k, "top", "test_async_obj_load 11");
                    assert(kids[k] instanceof BB, true, "test_async_obj_load 12");
                    zebkit.assertObjEqual(kids[k].a, { "test":100,"test2":"Hello" }, "test_async_obj_load 13");
                    zebkit.assertObjEqual(kids[k].b, {"test":200,"a":{"test":300,"a":"???"},"clz": kids[k].b.clz }, "test_async_obj_load 14");
                }

                this.kids = kids;
            }
        ]);

        var t    = new TT();
        var bag2 = new Zson(t);
        bag2.usePropertySetters = true;

        bag2.then(json, function(r) {
            assert(bbc, true, "test_async_obj_load 15");
            assert(aac, true, "test_async_obj_load 16");
            assert(ttc, true, "test_async_obj_load 17");

            assert(r.root.kids != null, true, "test_async_obj_load 18");
            assert(r.root.kids.top instanceof BB, true, "test_async_obj_load 19");
        }).throw();
    },

    function test_mixin() {
        var bag  = new Zson();
        var json = `{
            "a": "%{<json>http://localhost:8090/tests/zson.test.1.2.json}",
            "b": {
                "#mixin" : [ "%{b}", "%{a}" ],
                "a" : 300
            }
        }
        `;

        bag.then(json, function(bag) {
            assertObjEqual(bag.root.a.a, {"test":300,"a":"???"}, "test_mixin 1" );
            assert(bag.root.b.a, 300, "test_mixin 2");
            assert(bag.root.b.test, 200, "test_mixin 3");
        }).catch();


        var bag  = new Zson();
        var json = `{
            "%{<json> http://localhost:8090/tests/zson.test.1.2.json}":null,
            "test": {
                "a" : 300
            }
        }
        `;

        bag.then(json, function(bag) {
            //console.log("" + JSON.stringify(bag.root));
            // assertObjEqual(bag.root.a.a, {"test":300,"a":"???"}, "test_mixin 1" );
            // assert(bag.root.b.a, 300, "test_mixin 2");
            // assert(bag.root.b.test, 200, "test_mixin 3");
        }).catch();
    },

    function test_class_asyncprops_and_constructor() {
        var constr_seq = [];

        BBB = Class([
            function() {
                assert(arguments.length > 0, true, "test_class_asyncprops_and_constructor 1");
                assert(zebkit.isString(arguments[0]), true, "test_class_asyncprops_and_constructor 2");
                constr_seq.push(arguments[0]);

                this.constr = arguments[1];
                this.constr2 = arguments[2];
            },

            function setM(a) {
                console.log(a);
            },

            function setKids(kid) {
                constr_seq.push(arguments[0]);
                assert(kid instanceof zebkit.DoIt, false, "test_class_asyncprops_and_constructor 3");
                this.kids = arguments[1];
            }
        ]);

        var json = `
            {
                "@BBB" :  [
                    "1",
                    { "a": "%{<json>http://localhost:8090/tests/zson.test.1.1.json}" }
                ],
                "kids" :  [
                    "2",
                    {
                        "a": "%{<json>http://localhost:8090/tests/zson.test.1.1.json}",
                        "clazz" : {
                            "@BBB": [ "2.1", "%{<json>http://localhost:8090/tests/zson.test.1.1.json}"  ],
                            "kids" : [ "2.2", "%{<json>http://localhost:8090/tests/zson.test.class.json}" ]
                        }
                    }
                ],
                "c": {
                    "@BBB" : [
                        "3.1",
                        {
                            "a": "%{<json>http://localhost:8090/tests/zson.test.1.1.json}"
                        },
                        {
                            "@BBB" : [ "3.1.1",
                                       "%{<json>http://localhost:8090/tests/zson.test.1.2.json}",
                                       "%{<json>http://localhost:8090/tests/zson.test.class.json}" ]

                        }
                    ],
                    "kids" : [ "3.2", "%{<json>http://localhost:8090/tests/zson.test.1.2.json}" ]
                }
            }
        `;

        var bag = new Zson();
        var rn  = bag.then(json, function(bag) {

            assert(bag instanceof Zson, true, "test_class_asyncprops_and_constructor 4");
            assert(bag.root != null, true, "test_class_asyncprops_and_constructor 5");


            zebkit.assertObjEqual(constr_seq, [ "4", "2.1", "2.2", "4", "3.1.1", "3.1", "3.2", "1", "2" ], "test_class_asyncprops_and_constructor 6");

            var r = bag.root;

            assert(r instanceof BBB, true, "test_class_asyncprops_and_constructor 7");


            assert(r.c instanceof BBB, true, "test_class_asyncprops_and_constructor 8");


            zebkit.assertObjEqual(r.constr.a,   {
                                                    "test"  : 100,
                                                    "test2" : "Hello"
                                                }, "test_class_asyncprops_and_constructor 9");


            zebkit.assertObjEqual(r.kids.a,   {
                                                    "test"  : 100,
                                                    "test2" : "Hello"
                                                }, "test_class_asyncprops_and_constructor 10");

            assert(r.kids.clazz instanceof BBB , true, "test_class_asyncprops_and_constructor 11");


            zebkit.assertObjEqual(r.kids.clazz.constr , {
                                                    "test"  : 100,
                                                    "test2" : "Hello"
                                                }, "test_class_asyncprops_and_constructor 12");

            zebkit.assertObjEqual(r.c.constr.a,   {
                                                    "test"  : 100,
                                                    "test2" : "Hello"
                                                }, "test_class_asyncprops_and_constructor 13");


            assert(r.c.constr2 instanceof BBB, true, "test_class_asyncprops_and_constructor 14");
            assert(r.c.constr2.constr2 instanceof BBB, true, "test_class_asyncprops_and_constructor 15");
            assertObjEqual(r.c.constr2.constr.a, {
                                                    "test":300,
                                                    "a" : "???"
                                                }, "test_class_asyncprops_and_constructor 16");
            assert(r.c.constr2.constr.test, 200, "test_class_asyncprops_and_constructor 17");


            assert(r.c.kids.test, 200, "test_class_asyncprops_and_constructor 18");
            assertObjEqual(r.c.kids.a, { test: 300, a: '???' }, "test_class_asyncprops_and_constructor 19");
            assert(r.c.kids.clz instanceof Date, true, "test_class_asyncprops_and_constructor 20");

        }).catch();
    },


    function test_prom() {
        var rr = null, p = new Promise(function(resolve, reject) {
            rr = resolve;
            resolve(1);
        });

        p.then(function(r) {
            p.then(function() {
            })
            rr(11);
        }).then(function(r) {
            console.log("3 " + r);
        }).catch(function(e) {
            console.log("" + e);
        }).catch(function(e) {
            console.log("" + e);
        });
    }
);

});
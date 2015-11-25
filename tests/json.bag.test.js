
if (typeof(zebra) === "undefined") {
    load(arguments[0] + '/src/easyoop.js');
    load(arguments[0] + '/src/tools.js');
    load(arguments[0] + '/src/util.js');
}

var assert = zebra.assert, Class = zebra.Class, Bag = zebra.util.Bag, assertException = zebra.assertException;

zebra.runTests("util objects bag",
    function test_variables() {
        var bag = new Bag();

        A = zebra.Class([
            function(a) {
                this.a = a;
                this.d =100;
            }
        ]);

        bag.load('{ "a":1,"b":2, "c": { "d": true}, ".addVariables": { "aa": "@a", "bb": "@b", "cc": "@c.d" , "dd": { "$A": 22 }}, "k":"@aa", "l": "@bb", "m": "@cc" }' );
        var r = bag.root;

        assert(bag.variables.aa, 1);
        assert(bag.variables.bb, 2);
        assert(bag.variables.cc, true);

        assert(bag.variables.dd instanceof A, true);

        assert(bag.variables.dd.a, 22);
        assert(bag.variables.dd.d, 100);
        assert(r.variables, undefined);

        assert(r.k, 1);
        assert(r.l, 2);
        assert(r.m, true);
    },

    function test_emptybag() {
        var b = new Bag();
        b.load("{}");
        var b = new Bag();
        b.load("[]");
        assert(Array.isArray(b.root), true);

        assertException(function() { b.get("ds"); });
        assertException(function() { b.load(""); });
        assertException(function() { b.get(null); });
        assertException(function() { b.get(undefined); });
    },

    function test_simple_load() {
        var b = new Bag();
        b.load('{ "a":1, "b":{ "b1":"abc" }, "c": [1,2,3], "d":null }');
        assert(b.get("a") === 1, true);
        assert(b.get("d") === null, true);
        zebra.assertObjEqual(b.get("b"), {b1:"abc"});
        zebra.assertObjEqual(b.get("c"), [1,2,3]);
        assertException(function() { b.get("cc"); });
        zebra.assert(b.get("b.b1") === "abc", true);
    },

    function test_obj_merge() {
        var o = {a:2, b: {b2:100}, c:[-2,-1, 0], x:{ ll:100 }, k: { k: 100 }, dd:null, ddd:[1,2,3], pp: { pp: { } } }, b = new Bag(o);

        b.load('{ "a":1, "b":{ "b1":"abc" }, "c": [1,2,3], "d":null, "x":null, "k": { "k": { "k":100 }, "kk":99 }, "dd":[1,2,3] , "ddd":null, "pp": { "pp": { "pp": [1,2]} } }');
        assert(b.get("a") === 1, true, "1");
        assert(b.get("d") === null, true, "2");
        zebra.assertObjEqual(b.get("b"), {b1:"abc", b2:100}, "3");
        zebra.assertObjEqual(b.get("c"), [1, 2, 3], "4");

        assertException(function() { b.get("cc"); });
        zebra.assert(b.get("b.b1"), "abc", "6");
        zebra.assert(b.get("b.b2") , 100, "7");

        zebra.assert(b.get("x"), null, "8");
        zebra.assert(b.get("k.k.k"), 100, "9");
        zebra.assert(b.get("k.kk"), 99, "10");
        zebra.assert(b.get("ddd"), null, "11");

        zebra.assertObjEqual(b.get("dd"), [1,2,3], "12");

        // empty bag merge
        var b = new Bag({});
        b.load('{ "test": 100, "a": { "b": true, "c": null } }');

        assert(b.get("test"), 100);
        assert(b.root.test, 100);
        assert(b.root.a.b, true);
        assert(b.root.a.c, null);


        // test obj merge
        var b = new Bag({
            a: {
                b: {
                    c: 222
                }
            }
        });
        b.load('{ "a": 100 }');
        assert(b.root.a, 100);
        assert(b.get("a"), 100);

        // test obj merge
        var b = new Bag({
            a: {
                b: {
                    c: 222
                }
            }
        });
        b.load('{ "a": { "d": 300 }  }');
        assert(b.root.a.d, 300);
        assert(b.root.a.b.c, 222);

        // test obj merge
        var b = new Bag({
            a: {
                b: {
                    c: 222
                }
            }
        });
        b.load('{ "a": { "b": 300 }  }');
        assert(b.root.a.b, 300);


        // test merging on the fly
        // KeyEvent class has to be pre-filled when class A is instantiated
        var pkg = zebra("test");
        var KeyEvent = pkg.KeyEvent = Class([]);

        A = Class([
            function() {
                this.done = 333;
                assert(pkg.KeyEvent, KeyEvent);
                assert(pkg.KeyEvent.A , "a");
                assert(pkg.KeyEvent.B , "b");
                assert(pkg.KeyEvent.C , "c");
            }
        ]);

        var b = new Bag(pkg).load({
            KeyEvent: {
                A : "a",
                B : "b",
                C:  "c"
            },

            A: {
                $A : []
            }
        });

        assert(pkg.KeyEvent, KeyEvent);
        assert(pkg.KeyEvent.A , "a");
        assert(pkg.KeyEvent.B , "b");
        assert(pkg.KeyEvent.C , "c");
        assert(zebra.instanceOf(pkg.A, A) , true);
        assert(pkg.A.done, 333);
    },

    function test_class_instantiation() {
        var o = {},
            bag = new Bag(o),
            l = '{ "a": { "$A":[], "c": { "$A":[] } }, "b":{ "$A":["abc"] }, "c":{ "$A":true }, "d": {"$ *A": "xxx" } }';

        A = Class([
            function(c) {
                if (arguments.length === 0) c = "test";
                this.c = c;
                this.$mmm = 22;
            }
        ]);
        bag.load(l);
        var a = bag.get("a");
        var b = bag.get("b");
        var c = bag.get("c");
        var d = bag.get("d");

        assert(zebra.instanceOf(a, A), true, "a is ok");
        assert(zebra.instanceOf(b, A), true, "b is ok");
        assert(zebra.instanceOf(c, A), true, "c is ok");

        assert(zebra.instanceOf(a.c, A), true, "a.c is ok");
        assert(zebra.instanceOf(d, A), true, "d is ok");

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
            bag = new Bag(o),
            l = '{ "a": { "$A":[], "c": { "$A":[] } }, "b":{ "$A":["abc"], "dd":"@a", "mm":"@a.c" }, "d":"@a.c" }';
        bag.load(l);
        var r = bag.root;

        assert(zebra.instanceOf(r.a, A), true, "zebra.instanceOf(r.a, A)");
        assert(zebra.instanceOf(r.b, A), true, "zebra.instanceOf(r.b, A)");
        assert(zebra.instanceOf(r.a.c, A), true, "zebra.instanceOf(r.a.c, A)");
        assert(zebra.instanceOf(r.d, A), true, "zebra.instanceOf(r.d, A)");

        assert(zebra.instanceOf(r.b.dd, A), true, "zebra.instanceOf(r.b.dd, A)");
        assert(zebra.instanceOf(r.b.mm, A), true, "zebra.instanceOf(r.b.mm, A)");

        assert(r.b.dd, r.a);
        assert(r.a !== r.a.c, true);
        assert(r.b.mm, r.a.c);
        assert(r.d, r.a.c);

        assert(r.b.c, "abc");

        // root class
        var bag = new Bag();
        var json = '{ "$A":[] }';
        bag.load(json);

        assert(zebra.instanceOf(bag.root, A), true);
        assert(bag.root.c, "test");
        assert(bag.root.$mmm, 22);

        var bag = new Bag();
        var json = '{ "$A":[] }';
        bag.load(json);

        assert(zebra.instanceOf(bag.root, A), true);
        assert(bag.root.c, "test");
        assert(bag.root.$mmm, 22);
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

        var t = {}, b = new Bag(t);
        b.load('{ "a": { "$A":[], "name":100, "name2":101, "prop3": 11,  "obj": { "$A":[], "prop3":200 }, "b": { "$A":[], "name":200, "name2":201, "k":1 }, "c":400  } }');

        assert(t.a.nameProp, 100);
        assert(t.a.nameProp2, 101);
        assert(t.a.prop3, 21);
        assert(t.a.c, 400);
        assert(zebra.instanceOf(t.a.obj, A), true);
        assert(t.a.obj.prop3, 210);
        assert(t.a.name, undefined);
        assert(t.a.b.name, undefined);
        assert(t.a.b.nameProp, 200);
        assert(t.a.b.nameProp2, 201);
        assert(t.a.b.k, 1);

        var t = new A(), b = new Bag(t);
        b.load('{  "prop3": 400,  "obj" : {  "$A":[], "prop3": 500   } }');

        assert(t.prop3, 410);
        assert(zebra.instanceOf(t.obj, A), true);
        assert(t.obj.prop3,  510);
    },

    function test_refs() {
        var o = {p1: { "p222":333  }}, bag = new Bag(o);
        bag.ignoreNonExistentKeys = true;

        var l = '{ "p1": { "p11": { "p111": 100, "p12":"@p1.p11.p111", "p13": { "p133":"@p1.p11.p111" } }, "p33":"@p1.p11.p111" }, "p2": { "p11": { "p22":"@p1.p11.p111" } }, "kf": "@p1.p222"  }';
        bag.load(l);

        assert(bag.get("p1.p11.p111"), 100, "1");
        assert(bag.get("p1.p11.p13.p133"), 100, "2");
        assert(bag.get("p1.p33"), 100, "3");
        assert(bag.get("p1.p11.p12"), 100, "4");
        assert(bag.get("kf"), 333, "5");

        var l = {
            a : 100,
            b : "@a"
        }
        var b = new Bag();
        b.load(l);
        assert(b.root.a, 100);
        assert(b.root.b, 100);

        var l = {
            k: {
                a : 100,
                b : "@k.a"
            }
        }
        var b = new Bag();
        b.load(l);
        assert(b.root.k.a, 100);
        assert(b.root.k.b, 100);
    },

    function test_inherit() {
        var o = {},
            bag = new Bag(o),
            l = '{ "p": { "p1": 100, "p2": 200  }, "b": { "b1": { "inherit":["p"], "p2":300 } }  }';

        bag.load(l);

        var r = bag.root;
        assert(r.b.b1.p2, 300);
        assert(r.b.b1.p1, 100);

        var o = { d: { k: "str", d:{ d1 : 1, d2 : 2, d3: { s: [1,2] } } } },
            bag = new Bag(o),
            l = '{ "p": { "p1": 100, "p2": 200  }, "b": { "b1": { "inherit":["p", "d.d"], "p2":300 } }  }';

        bag.load(l);
        var r = bag.root;

        assert(r.b.b1.p2, 300);
        assert(r.b.b1.p1, 100);
        zebra.assertObjEqual(r.b.b1, { d1: 1, d2: 2, d3: { s: [1,2]  }, p2: 300, p1:100 } );

        // one level inheritance
        var o = { d: {
            a : {
                m: 100,
                mm: 300
            },

            b: {
                m: 200,
                mmm: 400,
                "inherit" : [ "d.a"]
            }
        }};
        var b = new Bag().load(o);

        assert(b.root.d.a.m, 100);
        assert(b.root.d.a.mm, 300);
        assert(b.root.d.b.m, 200);
        assert(b.root.d.b.mm, 300);
        assert(b.root.d.b.mmm, 400);
        assert(b.root.d.b["inherit"], undefined);

        var pkg = zebra("test2.tree");
        pkg.BaseTree = Class([]);
        pkg.Tree     = Class([]);
        var bag = new Bag(zebra("test2"));

        bag.load('{ "tree": { "BaseTree":  { "views":  { "a": 1, "b": 2 } } , "Tree": { "inherit": [ "tree.BaseTree" ], "c": "@tree.BaseTree.views.a" } } }');


        var r = bag.root;
        assert(r.tree.BaseTree.views.a, 1);
        assert(r.tree.BaseTree.views.b, 2);
        assert(r.tree.Tree.inherit, undefined);
        assert(r.tree.Tree.views != undefined, true);
        assert(r.tree.Tree.views.a, 1);
        assert(r.tree.Tree.views.b, 2);
        assert(r.tree.Tree.views.b, 2);
        assert(r.tree.Tree.c, 1);
    },

    function test_obj_inherit() {
        var o = {},
            bag = new Bag(o),
            l = { p: { p1: 100, p2: 200  }, b: { b1: { inherit:["p"], p2:300 } }  };

        bag.load(l);

        var r = bag.root;
        assert(r.b.b1.p2, 300);
        assert(r.b.b1.p1, 100);

        var o = { d: { k: "str", d:{ d1 : 1, d2 : 2, d3: { s: [1,2] } } } },
            bag = new Bag(o),
            l = { p: { p1: 100, p2: 200  }, b: { b1: { inherit:["p", "d.d"], p2:300 } }  };

        bag.load(l);
        var r = bag.root;

        assert(r.b.b1.p2, 300);
        assert(r.b.b1.p1, 100);
        zebra.assertObjEqual(r.b.b1, { d1: 1, d2: 2, d3: { s: [1,2]  }, p2: 300, p1:100 } );
    },

    function test_class_field_initialization() {
        zebra.A = zebra.Class([]);

        var o = {}, bag = new Bag(o), l = '{ "a": { "$zebra.A":[], "id":100 }  }';
        bag.load(l);

        assert(o.a.id, 100);
    },

    function test_obj_class_field_initialization() {
        zebra.A = zebra.Class([]);

        var o = {}, bag = new Bag(o), l = { a: { "$zebra.A":[], id:100 }  };
        bag.load(l);

        assert(o.a.id, 100);
    },

    function _test_optional_fields() {
        zebra.$a = 100;

        var o = {}, bag = new Bag(o), l = '{ "? zebra.$a == 100": { "p1": 100, "p2": 200, "p4":"abc"  }, "? zebra.$a == 200": { "p1": 300, "p2":400, "p3":500 } }';
        bag.load(l, false);
        bag.load('{"? zebra.$a > 10" : { "p1":999, "?zebra.$a > 5": {  "p4":"ggg" }, "? zebra.$a > 0": {"p7": 7 }  } }');

        var r = bag.root;
        assert(r.p1, 999);
        assert(r.p2, 200);
        assert(r.p4, "ggg");
        assert(r.p7, 7);
        assert(typeof r.p3, "undefined");

        var bag = new Bag(o), l = '{ "a":100, "? zebra.$a == 100": { "a": 200 } }';
        bag.load(l);
        var r = bag.root;
        assert(r.a, 200);

        var bag = new Bag(), l = '{ "a":{  "b": { "c": 100, "m":777 }, "k":444 },  "? zebra.$a == 100": { "a": { "b" : { "c": "ABC" } }  } }';
        bag.load(l);
        var r = bag.root;
        assert(r.a.b.c, "ABC");
        assert(r.a.k, 444);
        assert(r.a.b.m, 777);
    },

    function testExpr() {
        zebra.$c = 100;

        var o = {}, bag = new Bag(o), l = '{ "v": { ".expr": "zebra.$c > 0"  } }';
        bag.load(l);

        assert(bag.get("v"), true);
    },

    function testClassAlias() {
        var bag = new Bag();

        A = zebra.Class([
            function(a) {
                this.a = a;
                this.d =100;
            }
        ]);

        bag.load('{ ".addClassAliases" : {  "DD": "A" }, "c": { "$DD": 121 } } ' );
        var r = bag.root;

        assert(r.classAliases, undefined);
        assert(zebra.instanceOf(bag.classAliases.DD, zebra.Class), true, "1");
        assert(r.c instanceof A, true, "2");
        assert(r.c.a, 121);
        assert(r.c.d, 100);
    },

    function testMethodCall() {

        var r = {
            c : function(p) {
                assert(r, this);
                return p;
            }
            ,
            cc : 2000
        };

        var bag = new Bag(r, [
            function b(p) {
                assert(bag, this);
                return p;
            }
        ]);

        A = zebra.Class([
            function(a) {
                this.a = a;
                this.d = 100;
            }
        ]);

        bag.load({
            a : {
                "$A": 123,
                "b": { ".b": 133 },
                "c": { ".c": 233 },
                "d": 222
            }
        })

        assert(bag.root.a instanceof A, true);
        assert(bag.root.a.b, 133);
        assert(bag.root.a.c, 233);
        assert(bag.root.a.d, 222);
        assert(bag.root.cc, 2000);
        assert(typeof bag.root.c  == 'function', true);
    },

    function test_instance_overwriting() {
        A = Class([
            function(t) {
                this.t = t;
            }
        ]);

        var bag = new Bag({
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

        var json = '{"a":11,"b":false,"c":"String 2","d":"undefined","e":[3,4,5],"f":{"bb":2},"k":{"$A":"test2"}}';
        bag.load(json);

        assert(bag.root.a, 11);
        assert(bag.root.b, false);
        assert(bag.root.c, "String 2");
        assert(bag.root.d, "undefined");
        zebra.assertObjEqual(bag.root.e, [3,4,5]);
        zebra.assertObjEqual(bag.root.f, { bb: 2, aa : 1 });

        assert(bag.root.k.t, "test2" );
    },

    function test_fileload() {
        if (zebra.isInBrowser) {
            var bag = new Bag({});
            assertException(function() {
                bag.load("test2.json");
            });

            var bag = new Bag({});
            bag.load("json.bag.test.json");
            assert(bag.root.test, 100);
        }
        else {
            zebra.warn("Test case is ignored, since browser context cannot be detected");
        }
    },

    function test_fileasyncload() {
        if (zebra.isInBrowser) {
            var bag = new Bag();
            bag.load("test2.json", this.assertCallback(function(e) {
                assert(e instanceof Error, true);
            }));

            var bag = new Bag({});
            bag.load("json.bag.test.json", this.assertCallback(function() {
                assert(bag.root.test, 100);
            }));
        }
        else {
            zebra.warn("Test case is ignored, since browser context cannot be detected");
        }
    }
);




if (typeof(zebkit) === "undefined") {
    require('../src/js/easyoop.js');
    require('../src/js/misc/tools.js');
    require('../src/js/util.js');
    require('../src/js/layout.js');
}

var assert = zebkit.assert, Class = zebkit.Class, assertException = zebkit.assertException,
    assertNoException = zebkit.assertNoException, Listeners = zebkit.util.Listeners,
    ListenersClass = zebkit.util.ListenersClass;

zebkit.runTests("Util Listeners",
    function test_single_listener() {
        var clazz = ListenersClass(), aaa = 10, bbb = null;
        assert(clazz.prototype.fired != null, true);

        var l = new clazz();
        assert(l.hasHandler("fired"), false);
        assert(l.v == null, true);
        assertNoException(function () { l.fired() });
        assertException(function () { l.add("dsdsd", function() {}); });
        assert(l.v, null);

        assert(aaa, 10);
        var ll = l.add(function(param) {
            aaa = 20;
            bbb = param;
        });
        assert(aaa, 10);
        assert(bbb, null);
        assert(l.v != null, true);
        assert(l.v.length, 2);

        l.fired();
        assert(typeof bbb, "undefined");
        assert(l.v != null, true);
        assert(l.v.length, 2);
        assert(aaa, 20);

        l.fired(111);
        assert(bbb, 111);
        assert(l.v != null, true);
        assert(l.v.length, 2);
        assert(aaa, 20);

        var A = new Class([
            function fired() {
                aaa = 888;
            }
        ]), a = new A();


        assert(l.add({}), null);
        assert(l.add({ fired: 100 }), null);


        l.add(a);
        assert(l.v != null, true);
        assert(l.v.length, 4);
        l.fired();
        assert(typeof bbb, "undefined");
        assert(l.v != null, true);
        assert(l.v.length, 4);
        assert(aaa, 888);

        l.remove(a);
        assert(l.v != null, true);
        assert(l.v.length, 2);
        l.fired();
        assert(typeof bbb, "undefined");
        assert(l.v != null, true);
        assert(l.v.length, 2);
        assert(aaa, 20);

        l.remove(ll);
        assert(l.v != null, true);
        assert(l.v.length, 0);
        aaa = 100;
        l.fired();
        assert(typeof bbb, "undefined");
        assert(l.v != null, true);
        assert(l.v.length, 0);
        assert(aaa, 100);

        l.remove();
        assert(l.v != null, true);
        assert(l.v.length, 0);
        assert(aaa, 100);
        l.fired();
        assert(typeof bbb, "undefined");
        assert(l.v != null, true);
        assert(l.v.length, 0);
        assert(aaa, 100);

        // side effect
        var clazz2 = ListenersClass("tested"), l2 = new clazz2(), aaa2 = 100;
        assert(clazz.prototype.tested == null, true);
        assert(clazz2.prototype.tested != null, true);
        assert(l.tested == null, true);
        assert(l2.tested != null, true);
        assert(l2.fired == null, true);
        assert(l2.v == null, true);

        l2.add(function ttt() {
            aaa2 = 200;
        });
        assert(aaa2, 100);
        assert(l2.v != null, true);
        assert(l2.v.length, 2);
        l.fired(3000);
        assert(aaa2, 100);
        assert(typeof bbb, "undefined");

        l2.tested();
        assert(aaa2, 200);
        assert(typeof bbb, "undefined");

        l.remove();
        assert(l2.v != null, true);
        assert(l2.v.length, 2);

        aaa2 = 100;
        l2.remove();
        assert(l2.v.length, 0);
        l2.tested();
        assert(aaa2, 100);


        var clazz2 = ListenersClass("tested"), l2 = new clazz2(), r;
        l2.add("tested", function() {
            r = 333;
        });
        assert(l2.v.length, 2);
        l2.tested();
        assert(r, 333);
        l2.remove("tested");
        assert(l2.v.length, 0);
        r = 0;
        l2.tested();
        assert(r, 0);
    },

    function test_bind() {
        var A  = zebkit.Class(zebkit.EventProducer, [
            function() {
                this._ = new (new ListenersClass("ff"));
            }
        ]);

        var a = new A(), t1 = 0, t2 = 0, t3 = 0;

        var B = zebkit.Class([
            function ff() {
                t3 ++;
            }
        ]);

        var l1 = a.on(function() {
            t1++;
        });

        var l2 = a.on({
           ff: function() {
               t2++;
           }
        });

        var l3 = a.on(new B());

        a._.ff();
        assert(t1, 1);
        assert(t2, 1);
        assert(t3, 1);

        a.off(l1);
        a._.ff();
        assert(t1, 1);
        assert(t2, 2);
        assert(t3, 2);

        a.off(l1);
        a._.ff();
        assert(t1, 1);
        assert(t2, 3);
        assert(t3, 3);

        a.off(l2);
        a._.ff();
        assert(t1, 1);
        assert(t2, 3);
        assert(t3, 4);

        a.off();
        a._.ff();
        assert(t1, 1);
        assert(t2, 3);
        assert(t3, 4);

        assertException(function() {
            a.on("tt", function() {});
        }, Error);

        assert(a.on({ dd: function() {} }), null);

        assert(a.on(new A()), null);

        var l1 = a.on("ff", function() {
            t1++;
        });

        var l2 = a.on({
           ff: function() {
               t2++;
           }
        });

        var l3 = a.on(new B());

        a._.ff();
        assert(t1, 2);
        assert(t2, 4);
        assert(t3, 5);

        a.off();
        a._.ff();
        assert(t1, 2);
        assert(t2, 4);
        assert(t3, 5);


        var L = ListenersClass("tt", "dd");
        var A = zebkit.Class(zebkit.EventProducer, [
            function() {
                this._ = new L();
            }
        ]), a = new A(), t1 = 0, t2 = 0;


        var l1 = a.on("tt", function() {
            t1 ++;
        });


        var l2 = a.on("dd", function() {
            t2 ++;
        });

        var l3 = a.on({
            dd: function() { t2++; },
            tt: function() { t1++; }
        });


        a._.tt();
        assert(t1, 2);
        assert(t2, 0);

        a._.dd();
        assert(t1, 2);
        assert(t2, 2);

        a.off(l1);
        a._.dd();
        assert(t1, 2);
        assert(t2, 4);
        a._.tt();
        assert(t1, 3);
        assert(t2, 4);

        a.off(l3);
        a._.dd();
        assert(t1, 3);
        assert(t2, 5);
        a._.tt();
        assert(t1, 3);
        assert(t2, 5);

        a.off();
        a._.dd();
        assert(t1, 3);
        assert(t2, 5);
        a._.tt();
        assert(t1, 3);
        assert(t2, 5);

        assertException(function() {
            a.on("mm", function() {});
        }, Error);

        assert(a.on({}), null);
    },

    function test_multiple_listener() {
        var clazz = ListenersClass("test1", "test2"), aaa = 100, bbb = 111, ccc = 1, l = new clazz();

        assert(clazz.prototype.test1 != null, true, "test_multiple_listener 1");
        assert(clazz.prototype.test2 != null, true, "test_multiple_listener 2");
        assert(l.test1 != null, true, "test_multiple_listener 3");
        assert(l.test2 != null, true, "test_multiple_listener 4");
        assert(l.test2 != l.test1, true, "test_multiple_listener 5");
        assert(l.$methods, null, "test_multiple_listener 6");

        var ll = l.add("test1", function() {
            aaa = 200;
            ccc = 111;
        })

        assert(l.$methods["test1"] != null, true, "test_multiple_listener 7");
        assert(l.$methods["test1"].length, 2, "test_multiple_listener 8");
        assert(typeof l.$methods["test2"], "undefined", "test_multiple_listener 9");


        l.test1();
        assert(aaa, 200, "test_multiple_listener 10");
        assert(ccc, 111, "test_multiple_listener 11");
        assert(l.$methods["test1"] != null, true, "test_multiple_listener 12");
        assert(l.$methods["test1"].length, 2, "test_multiple_listener 13");
        assert(typeof l.$methods["test2"], "undefined", "test_multiple_listener 14");


        assertException(function() { l.add("t", function() {} )}, Error, "test_multiple_listener 15");

        assertNoException(function() {
            l.test2();
        }, "test_multiple_listener 16")

        var A = Class([
            function test1() {
                aaa = 300;
            },

            function test2() {
                bbb = 777;
            }
        ]), a = new A();

        l.add(a);
        ccc = 0;
        aaa = 0;
        bbb = 0;
        assert(l.$methods["test1"] != null, true, "test_multiple_listener 17");
        assert(l.$methods["test1"].length, 4, "test_multiple_listener 18");
        assert(l.$methods["test2"] != null, true, "test_multiple_listener 19");
        assert(l.$methods["test2"].length, 2, "test_multiple_listener 20");

        l.test1();
        l.test2();
        assert(aaa, 300, "test_multiple_listener 21");
        assert(bbb, 777, "test_multiple_listener 22");
        assert(ccc, 111, "test_multiple_listener 23");

        l.remove(a);
        ccc = 0;
        aaa = 0;
        bbb = 0;
        assert(l.$methods["test1"] != null, true, "test_multiple_listener 24");
        assert(l.$methods["test1"].length, 2, "test_multiple_listener 25");
        assert(l.$methods["test2"], undefined, "test_multiple_listener 26");

        l.test1();
        assert(aaa, 200, "test_multiple_listener 27");
        assert(ccc, 111, "test_multiple_listener 28");
        assert(l.$methods["test1"] != null, true, "test_multiple_listener 29");
        assert(l.$methods["test1"].length, 2, "test_multiple_listener 30");

        assertNoException(function() {
            l.test2();
        }, "test_multiple_listener 31")
        assert(aaa, 200, "test_multiple_listener 32");
        assert(bbb, 0, "test_multiple_listener 33");
        assert(ccc, 111, "test_multiple_listener 34");

        l.remove(ll);
        ccc = 0;
        aaa = 0;
        bbb = 0;
        assert(l.$methods["test1"], undefined, "test_multiple_listener 35");
        assert(l.$methods["test2"], undefined, "test_multiple_listener 36");

        assertNoException(function() {
            l.test1();
            l.test2();
            l.remove();
        }, "test_multiple_listener 37")
        assert(aaa, 0, "test_multiple_listener 38");
        assert(bbb, 0, "test_multiple_listener 39");
        assert(ccc, 0, "test_multiple_listener 40");

        // side effect
        var clazz2 = ListenersClass("a1", "a2", "a3"), l2 = new clazz2();

        assert(clazz.prototype.test1 != null, true, "test_multiple_listener 41");
        assert(clazz.prototype.test2 != null, true, "test_multiple_listener 42");
        assert(clazz.prototype.a1, undefined, "test_multiple_listener 43");
        assert(clazz.prototype.a2, undefined, "test_multiple_listener 44");
        assert(clazz.prototype.a3, undefined, "test_multiple_listener 45");

        assert(clazz2.prototype.a1 != null, true, "test_multiple_listener 46");
        assert(clazz2.prototype.a2 != null, true, "test_multiple_listener 47");
        assert(clazz2.prototype.a3 != null, true, "test_multiple_listener 48");
        assert(clazz2.prototype.test1, undefined, "test_multiple_listener 49");
        assert(clazz2.prototype.test2, undefined, "test_multiple_listener 50");


        assert(l2.test1, undefined, "test_multiple_listener 51");
        assert(l2.test2, undefined, "test_multiple_listener 52");
        assert(l2.a1 != null, true, "test_multiple_listener 53");
        assert(l2.a2 != null, true, "test_multiple_listener 54");
        assert(l2.a3 != null, true, "test_multiple_listener 55");

        assert(l.test1 != null, true, "test_multiple_listener 56");
        assert(l.test2 != null, true, "test_multiple_listener 57");
        assert(l.a1, undefined, "test_multiple_listener 58");
        assert(l.a2, undefined, "test_multiple_listener 59");
        assert(l.a3, undefined, "test_multiple_listener 60");

        assert(l2.$methods, null, "test_multiple_listener 61");

        var ddd = 100;
        l2.add( {
            a1: function() {
                aaa = 91;
            },

            a2: function() {
                bbb = 92;
            },

            a3: function() {
                ccc = 93;
            }
        });

        var defListener = l2.add(function() {
            ddd++;
        });

        assert(l2.$methods["a1"].length, 4, "test_multiple_listener 62");
        assert(l2.$methods["a2"].length, 4, "test_multiple_listener 63");
        assert(l2.$methods["a3"].length, 4, "test_multiple_listener 64");
        assert(l2.$methods["test1"], undefined, "test_multiple_listener 65");
        assert(l2.$methods["test2"], undefined, "test_multiple_listener 66");

        assert(ddd, 100, "test_multiple_listener 67");
        l2.a1();
        assert(ddd, 101, "test_multiple_listener 68");
        l2.a2();
        assert(ddd, 102, "test_multiple_listener 70");
        l2.a3();
        assert(ddd, 103);

        assert(aaa, 91);
        assert(bbb, 92);
        assert(ccc, 93);

        l2.remove(defListener);
        assert(l2.$methods[""], undefined);
        assert(l2.$methods["a1"].length, 2);
        assert(l2.$methods["a2"].length, 2);
        assert(l2.$methods["a3"].length, 2);

        aaa = bbb = ccc = 0;
        l2.remove();
        assert(l2.$methods["a1"], undefined);
        assert(l2.$methods["a2"], undefined);
        assert(l2.$methods["a3"], undefined);

        assertNoException(function() {
            l2.a1();
            l2.a2();
            l2.a3();
            l2.remove();
        });

        assert(aaa, 0);
        assert(bbb, 0);
        assert(ccc, 0);

        var lc = ListenersClass("a1", "a2");
        var  l = new lc();
        var  i = 0;

        assert(typeof l["a1"] === "function", true )
        assert(typeof l["a2"] === "function", true )

        var a1 = l.add("a1", function() {
            i++;
        });

        var a2 = l.add("a2", function() {
            i--;
        });

        assert(i, 0);
        l.a1();
        assert(i, 1);
        l.a2();
        assert(i, 0);
        l.remove(a1);
        l.a1();
        assert(i, 0);
        l.a2();
        assert(i, -1);
        l.remove(a2);
        l.a2();
        l.a1();
        assert(i, -1);

        var clazz = ListenersClass("test1", "test2"), aaa = 100, bbb = 111, ccc = 1, l = new clazz();

        assert(l.hasHandler("test1"), false);
        assert(l.hasHandler("test2"), false);


        l.add("test1", function() {
            aaa = 234;
        });

        l.add("test1", function() {
            bbb = 234;
        });

        l.add("test2", function() {
            ccc = 235;
        });

        assert(l.$methods["test1"].length, 4);
        assert(l.$methods["test2"].length, 2);


        assert(aaa, 100);
        assert(bbb, 111);
        l.test1();
        assert(aaa, 234);
        assert(bbb, 234);
        assert(ccc, 1);
        l.test2();
        assert(aaa, 234);
        assert(bbb, 234);
        assert(ccc, 235);
        l.remove("test1");
        ccc = aaa = bbb = 111;
        l.test1();
        assert(aaa, 111);
        assert(bbb, 111);
        assert(ccc, 111);
        l.test2();
        assert(ccc, 235);

        assert(l.$methods["test1"], undefined);
        assert(l.$methods["test2"].length, 2);

        assert(l.hasHandler("test1"), false);
        assert(l.hasHandler("test2"), true);

        var clazz = ListenersClass("test1", "test2"), aaa = 100, l = new clazz();
        l.add(function() {
            aaa++;
        });

        l.test1();
        assert(aaa, 101);
        l.test2();
        assert(aaa, 102);

        l.remove("test1");
        l.test1();
        assert(aaa, 102);
    },

    function _test_dynamicContext() {
        var clazz = ListenersClass();
        var l     = new clazz();
        var A     = Class([
            function fired(obj) {
                this.t = obj;
            }
        ]);

        var a = new A();
        l.add(a);

        l.fired("test");
        assert(a.t, "test");

        a.extend([
            function fired(obj) {
                this.t = 100;
            }
        ]);

        l.fired("test2");
        assert(a.t, 100);
    },

    function test_extending() {
        var L = ListenersClass("test");
        assert(L.eventNames[0], "test");
        assert(L.eventNames.length, 1);

        var A = Class(zebkit.EventProducer, [
            function() {
                this._ = new L();
            },

            function trigger() {
                this._.test(this, 100);
            }
        ]);

        var B = Class([function test(src, num) {
            assert(src != null, true);
            assert(num, 100);
            assert(zebkit.instanceOf(src, A), true);
        }]);

        var a = new A(), b = new B();
        a.on(b);
        a.trigger();

        var L = L.ListenersClass("test2");
        assert(L.eventNames[0], "test");
        assert(L.eventNames[1], "test2");
        assert(L.eventNames.length, 2);

        var A = Class(zebkit.EventProducer, [
            function() {
                this._ = new L();
            },

            function trigger1() {
                this._.test(this, 100);
            },

            function trigger2() {
                this._.test2(this, 101);
            }
        ]);

        var B = Class([
            function test(src, num) {
                assert(src != null, true);
                assert(num, 100);
                assert(zebkit.instanceOf(src, A), true);
            },

            function test2(src, num) {
                assert(src != null, true);
                assert(num, 101);
                assert(zebkit.instanceOf(src, A), true);
            }
        ]);

        var a = new A(), b = new B();
        a.on(b);
        a.trigger2();
        a.trigger1();


        var L = ListenersClass("test2", "test3" ),
            l = new L();

        assert(typeof l.test2 === 'function', true);
        assert(typeof l.test3 === 'function', true);
        assert(typeof l.test4 === 'undefined', true);

        l.addEvents("test4");
        assert(typeof l.test4 === 'function', true);

        var cnt = 0;
        l.add("test4", function() {
            cnt++;
        });
        l.test4(1);
        assert(cnt, 1);

        var cnt = 0;
        l.add(function() {
            cnt++;
        });
        l.test4(1);
        l.test2(1);
        assert(cnt, 3);

        l = new L();
        assert(typeof l.test2 === 'function', true);
        assert(typeof l.test3 === 'function', true);
        assert(typeof l.test4 === 'undefined', true);
    },

    function hasEventTest() {
        var L1 = ListenersClass("test1", "test2", "fired"), l = new L1();

        assert(l.hasEvent("test1"), true);
        assert(l.hasEvent("test2"), true);
        assert(l.hasEvent("fired"), true);
        assert(l.hasEvent("fired2"), false);
        assert(L1.eventNames.length, 3);


        l.addEvents("fired2");
        assert(l.hasEvent("fired2"), true);

        l = new Listeners();
        assert(l.hasEvent("fired"), true);
        assert(l.hasEvent("fired2"), false);
    },

    function hierarchyOnTest() {
        var L1 = ListenersClass("test1", "test2", "fired");


        var A = Class(zebkit.layout.Layoutable, [
            function() {
                this.$super();
                this._ = new L1();


                var i = 0;
                if (arguments.length > 0 && zebkit.isString(arguments[0])) {
                    this.setId(arguments[0]);
                    i++;
                }

                for(i; i < arguments.length; i++) {
                    this.kids.push(arguments[i]);
                }
            }
        ]),

        B = Class(A, [
            function() {
                this.$supera(arguments);
                this._ = new Listeners();
            }
        ]),

        C = Class(zebkit.layout.Layoutable, [
            function(id) {
                this.$super();
                this.setId(id);
            }
        ]);

        A.$name = "A";
        B.$name = "B";

        var r = new A("A1", new A("A2", new B("B1"), new C("C1")),
                      new A("A3", new A("A4", new B("B2",new A("A5"), new A("A6")))),
                      new A("A7", new B("B3")));

        //   A1
        //   +-- A2
        //   |   +-- B1
        //   |   +-- C1
        //   +-- A3
        //   |   +-- A4
        //   |       +-- B2
        //   |           +-- A5
        //   |           +-- A6
        //   +-- A7
        //       +-- B3

        var cnt = 0;
        r.on(".//*", function(a) {
            cnt++;
        });

        r.fire("fired", ".//*", "sdsd");
        assert(cnt, 10);
        cnt = 0;
        r.fire("test1", ".//*", "sdsd");
        assert(cnt, 7);
        cnt = 0;
        r.fire("test1", "/*", "sdsd");
        assert(cnt, 3);
        cnt = 0;
        r.fire("test1", "./*/*", "sdsd");
        assert(cnt, 3);
        cnt = 0;
        r.fire("test2", "./*/*", "sdsd");
        assert(cnt, 3);
        cnt = 0;
        r.fire("test3", "./*/*", "sdsd");
        assert(cnt, 0);

        r.off("test1", ".//*");
        r._.remove("test1");
        cnt = 0;
        r.fire("test1", ".//*", "sdsd");
        assert(cnt, 0);
        r.fire("test2", ".//*", "sdsd");
        assert(cnt, 7);
        r.off("test2", ".//*");
        r.fire("test2", ".//*", "sdsd");
        assert(cnt, 7);

        r.off("/*/*");
        cnt = 0;
        r.fire("fired", ".//*", "sdsd");
        assert(cnt, 7);

        r.off("//*");
        cnt = 0;
        r.fire("fired", ".//*", "sdsd");
        assert(cnt, 1);


        r.off("fired", ".");
        cnt = 0;
        r.fire("fired", ".//*", "sdsd");
        assert(cnt, 0);

        cnt = 0;
        r.fire("test1", ".//*", "sdsd");
        assert(cnt, 0);

        cnt = 0;
        r.fire("test2", ".//*", "sdsd");
        assert(cnt, 0);

        var fn = function() {
            cnt++;
        };
        r.on("fired", "/*", fn);
        cnt = 0;
        r.fire("fired", "sdsd");
        assert(cnt, 0);

        r.kids[0].fire("fired", "sdsd");
        assert(cnt, 1);

        cnt = 0;
        r.fire("fired", "/*", [ "sdsd" ]);
        assert(cnt, 3);

        cnt = 0;
        r.off("/*", fn);
        r.fire("fired", "/*", [ "sdsd" ]);
        assert(cnt, 0);

        r.byPath(".//*", function(n) {
            if (n.clazz.$name === "A") {
                var c = 0;
                for(var k in n._.$methods) {
                    c++;
                }
                assert(c, 0);
            } else if (n.clazz.$name === "B") {
                assert(n._.v.length, 0);
            }
        });

        var fn = function(a) {
            cnt++;
            assert(zebkit.isString(a), true);
        };

        r.on("test1", "//*", fn);
        r.fire("test1", "/*", [ "sdsd" ]);
        assert(cnt, 3);
        r.fire("test1", "/*",  "sdsd" );
        assert(cnt, 6);
        r.off(".//*");

        r.byPath(".//*", function(n) {
            if (n.clazz.$name === "A") {
                var c = 0;
                for(var k in n._.$methods) {
                    c++;
                }
                assert(c, 0);
            } else if (n.clazz.$name === "B") {
                assert(n._.v.length, 0);
            }
        });

        var obj = {
            test2: function() {
                cnt++;
            },

            fired: function() {
                cnt+=2;
                assert(arguments.length, 2);
            }
        };

        r.on(obj);
        cnt = 0;
        r.fire("test2",  "sdsd");
        assert(cnt, 1);
        r.fire("fired",  [ 1, 2 ]);
        assert(cnt, 3);

        assertException(function() {
            r.fire("fired2",  [ 1, 2 ]);
        }, Error);


        assert(cnt, 3);
        r.off(obj);
        cnt = 0;
        r.fire("test2",  "sdsd");
        assert(cnt, 0);
        r.fire("fired",  [ 1, 2 ]);
        assert(cnt, 0);

        r.on(obj);
        r.off("fired");
        r.fire("test2",  "sdsd");
        assert(cnt, 1);
        r.fire("fired",  [ 1, 2 ]);
        assert(cnt, 1);

        cnt = 0;
        r.on("fired", function() { cnt+=5; });
        r.fire();
        assert(cnt, 5);
        r.off("fired");
        r.fire();
        assert(cnt, 5);
    }
);




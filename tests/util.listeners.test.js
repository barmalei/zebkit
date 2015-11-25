
if (typeof(zebra) === "undefined") {
    load(arguments[0] + '/src/easyoop.js');
    load(arguments[0] + '/src/tools.js');
    load(arguments[0] + '/src/util.js');
}

var assert = zebra.assert, Class = zebra.Class, assertException = zebra.assertException,
    assertNoException = zebra.assertNoException, Listeners = zebra.util.Listeners,
    ListenersClass = zebra.util.ListenersClass;

zebra.runTests("Util Listeners",
    function test_single_listener() {
        var clazz = ListenersClass(), aaa = 10, bbb = null;
        assert(clazz.prototype.fired != null, true);

        var l = new clazz();
        assert(l.v == null, true);
        assertNoException(function () { l.fired() });
        assert(l.v == null, true);

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
    },

    function test_bind() {
        var A  = zebra.Class([
            function() {
                this._ = new (new ListenersClass("ff"));
            }
        ]);

        var a = new A(), t1 = 0, t2 = 0, t3 = 0;

        var B = zebra.Class([
            function ff() {
                t3 ++;
            }
        ]);

        var l1 = a.bind(function() {
            t1++;
        });

        var l2 = a.bind({
           ff: function() {
               t2++;
           }
        });

        var l3 = a.bind(new B());

        a._.ff();
        assert(t1, 1);
        assert(t2, 1);
        assert(t3, 1);

        a.unbind(l1);
        a._.ff();
        assert(t1, 1);
        assert(t2, 2);
        assert(t3, 2);

        a.unbind(l1);
        a._.ff();
        assert(t1, 1);
        assert(t2, 3);
        assert(t3, 3);

        a.unbind(l2);
        a._.ff();
        assert(t1, 1);
        assert(t2, 3);
        assert(t3, 4);

        a.unbind();
        a._.ff();
        assert(t1, 1);
        assert(t2, 3);
        assert(t3, 4);

        assertException(function() {
            a.bind("tt", function() {});
        }, Error);

        assert(a.bind({ dd: function() {} }), null);

        assert(a.bind(new A()), null);

        var l1 = a.bind("ff", function() {
            t1++;
        });

        var l2 = a.bind({
           ff: function() {
               t2++;
           }
        });

        var l3 = a.bind(new B());

        a._.ff();
        assert(t1, 2);
        assert(t2, 4);
        assert(t3, 5);

        a.unbind();
        a._.ff();
        assert(t1, 2);
        assert(t2, 4);
        assert(t3, 5);


        var L = ListenersClass("tt", "dd");
        var A = zebra.Class([
            function() {
                this._ = new L();
            }
        ]), a = new A(), t1 = 0, t2 = 0;


        var l1 = a.bind(function tt() {
            t1 ++;
        });


        var l2 = a.bind("dd", function() {
            t2 ++;
        });

        var l3 = a.bind({
            dd: function() { t2++; },
            tt: function() { t1++; }
        });


        a._.tt();
        assert(t1, 2);
        assert(t2, 0);

        a._.dd();
        assert(t1, 2);
        assert(t2, 2);

        a.unbind(l1);
        a._.dd();
        assert(t1, 2);
        assert(t2, 4);
        a._.tt();
        assert(t1, 3);
        assert(t2, 4);

        a.unbind(l3);
        a._.dd();
        assert(t1, 3);
        assert(t2, 5);
        a._.tt();
        assert(t1, 3);
        assert(t2, 5);

        a.unbind();
        a._.dd();
        assert(t1, 3);
        assert(t2, 5);
        a._.tt();
        assert(t1, 3);
        assert(t2, 5);

        assertException(function() {
            a.bind(function mm() {});
        }, Error);

        assertException(function() {
            a.bind("mm", function() {});
        }, Error);

        assert(a.bind({}), null);
    },

    function test_multiple_listener() {
        var clazz = ListenersClass("test1", "test2"), aaa = 100, bbb = 111, ccc = 1, l = new clazz();

        assert(clazz.prototype.test1 != null, true);
        assert(clazz.prototype.test2 != null, true);
        assert(l.test1 != null, true);
        assert(l.test2 != null, true);
        assert(l.test2 != l.test1, true);
        assert(typeof l.methods, "undefined");

        var ll = l.add(function test1() {
            aaa = 200;
            ccc = 111;
        })

        assert(l.methods["test1"] != null, true);
        assert(l.methods["test1"].length, 2);
        assert(typeof l.methods["test2"], "undefined");


        l.test1();
        assert(aaa, 200);
        assert(ccc, 111);
        assert(l.methods["test1"] != null, true);
        assert(l.methods["test1"].length, 2);
        assert(typeof l.methods["test2"], "undefined");


        assertException(function() { l.add(function t() {} )}, Error);

        assertNoException(function() {
            l.test2();
        })

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
        assert(l.methods["test1"] != null, true);
        assert(l.methods["test1"].length, 4);
        assert(l.methods["test2"] != null, true);
        assert(l.methods["test2"].length, 2);

        l.test1();
        l.test2();
        assert(aaa, 300);
        assert(bbb, 777);
        assert(ccc, 111);

        l.remove(a);
        ccc = 0;
        aaa = 0;
        bbb = 0;
        assert(l.methods["test1"] != null, true);
        assert(l.methods["test1"].length, 2);
        assert(l.methods["test2"], undefined);

        l.test1();
        assert(aaa, 200);
        assert(ccc, 111);
        assert(l.methods["test1"] != null, true);
        assert(l.methods["test1"].length, 2);

        assertNoException(function() {
            l.test2();
        })
        assert(aaa, 200);
        assert(bbb, 0);
        assert(ccc, 111);

        l.remove(ll);
        ccc = 0;
        aaa = 0;
        bbb = 0;
        assert(l.methods["test1"], undefined);
        assert(l.methods["test2"], undefined);

        assertNoException(function() {
            l.test1();
            l.test2();
            l.remove();
        })
        assert(aaa, 0);
        assert(bbb, 0);
        assert(ccc, 0);

        // side effect
        var clazz2 = ListenersClass("a1", "a2", "a3"), l2 = new clazz2();

        assert(clazz.prototype.test1 != null, true);
        assert(clazz.prototype.test2 != null, true);
        assert(clazz.prototype.a1, undefined);
        assert(clazz.prototype.a2, undefined);
        assert(clazz.prototype.a3, undefined);

        assert(clazz2.prototype.a1 != null, true);
        assert(clazz2.prototype.a2 != null, true);
        assert(clazz2.prototype.a3 != null, true);
        assert(clazz2.prototype.test1, undefined);
        assert(clazz2.prototype.test2, undefined);


        assert(l2.test1, undefined);
        assert(l2.test2, undefined);
        assert(l2.a1 != null, true);
        assert(l2.a2 != null, true);
        assert(l2.a3 != null, true);

        assert(l.test1 != null, true);
        assert(l.test2 != null, true);
        assert(l.a1, undefined);
        assert(l.a2, undefined);
        assert(l.a3, undefined);

        assert(typeof l2.methods, "undefined");
        assert(l.methods != null, true);

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

        assert(l2.methods["a1"].length, 2);
        assert(l2.methods["a2"].length, 2);
        assert(l2.methods["a3"].length, 2);
        assert(l2.methods[""].length, 2);
        assert(l2.methods["test1"], undefined);
        assert(l2.methods["test2"], undefined);

        assert(ddd, 100);
        l2.a1();
        assert(ddd, 101);
        l2.a2();
        assert(ddd, 102);
        l2.a3();
        assert(ddd, 103);

        assert(aaa, 91);
        assert(bbb, 92);
        assert(ccc, 93);

        l2.remove(defListener);
        assert(l2.methods[""], undefined);
        assert(l2.methods["a1"].length, 2);
        assert(l2.methods["a2"].length, 2);
        assert(l2.methods["a3"].length, 2);

        aaa = bbb = ccc = 0;
        l2.remove();
        assert(l2.methods["a1"], undefined);
        assert(l2.methods["a2"], undefined);
        assert(l2.methods["a3"], undefined);

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

        var A = Class([
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
            assert(zebra.instanceOf(src, A), true);
        }]);

        var a = new A(), b = new B();
        a.bind(b);
        a.trigger();

        var L = L.ListenersClass("test2");
        assert(L.eventNames[0], "test");
        assert(L.eventNames[1], "test2");
        assert(L.eventNames.length, 2);

        var A = Class([
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
                assert(zebra.instanceOf(src, A), true);
            },

            function test2(src, num) {
                assert(src != null, true);
                assert(num, 101);
                assert(zebra.instanceOf(src, A), true);
            }
        ]);

        var a = new A(), b = new B();
        a.bind(b);
        a.trigger2();
        a.trigger1();
    }
);









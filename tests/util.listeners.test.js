
if (typeof(zebra) === "undefined") {
    load(arguments[0] + '/lib/zebra/easyoop.js');
    load(arguments[0] + '/lib/zebra/assert.js');
    load(arguments[0] + '/lib/zebra/util.js');
}

var assert = zebra.assert, Class = zebra.Class, assertException = zebra.assertException, 
    assertNoException = zebra.assertNoException, Listeners = zebra.util.Listeners;

zebra.runTests("Zebra util",
    function test_single() {
        var clazz = Listeners.Class(), aaa = 10, bbb = null;
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

        assertException(function() {
           l.add({}); 
        }, Error);

        assertException(function() {
           l.add({ fired: 100 }); 
        }, Error);

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

        l.removeAll();        
        assert(l.v != null, true);
        assert(l.v.length, 0);
        assert(aaa, 100);
        l.fired();
        assert(typeof bbb, "undefined");
        assert(l.v != null, true);
        assert(l.v.length, 0);
        assert(aaa, 100);
        

        // side effect
        var clazz2 = Listeners.Class("tested"), l2 = new clazz2(), aaa2 = 100;
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

        l.removeAll();
        assert(l2.v != null, true);
        assert(l2.v.length, 2);

        aaa2 = 100;
        l2.removeAll();
        assert(l2.v.length, 0);
        l2.tested();
        assert(aaa2, 100);
    },

    function test_multiple() {
        var clazz = Listeners.Class("test1", "test2"), aaa = 100, bbb = 111, ccc = 1, l = new clazz();

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
            l.removeAll();
        })
        assert(aaa, 0);
        assert(bbb, 0);
        assert(ccc, 0);

        // side effect
        var clazz2 = Listeners.Class("a1", "a2", "a3"), l2 = new clazz2();
        
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


        assert(l2.methods["a1"].length, 2);
        assert(l2.methods["a2"].length, 2);
        assert(l2.methods["a3"].length, 2);
        assert(l2.methods["test1"], undefined);
        assert(l2.methods["test2"], undefined);        


        l2.a1();
        l2.a2();
        l2.a3();

        assert(aaa, 91);
        assert(bbb, 92);
        assert(ccc, 93);

        aaa = bbb = ccc = 0;
        l2.removeAll();
        assert(l2.methods["a1"], undefined);
        assert(l2.methods["a2"], undefined);
        assert(l2.methods["a3"], undefined);

        assertNoException(function() {
            l2.a1();
            l2.a2();
            l2.a3();
            l2.removeAll();
        });

        assert(aaa, 0);
        assert(bbb, 0);
        assert(ccc, 0);

    }
);









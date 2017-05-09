
if (typeof(zebkit) === "undefined") {
    require("../src/js/easyoop.js");
    require("../src/js/misc/tools.js");
    require("../src/js/util.js");
    require("../src/js/layout.js");
}

var assert = zebkit.assert, Class = zebkit.Class, assertException = zebkit.assertException,
    assertNoException = zebkit.assertNoException, Listeners = zebkit.util.Listeners;

zebkit.runTests("Util",
    function test_format() {
        var s = " -- ${a} ${b}.",
            o = { a:  100, b: "abcdef", d:"b", getM: function() { return 0 }  };

        var r = zebkit.util.format(s, o);
        assert(r, " -- 100 abcdef." );

        var r = zebkit.util.format(" ${${d}} ${m} ${m}", o);
        assert(r, " abcdef 0 0");

        var r = zebkit.util.format(" ${4,0,a} ${m}", o);
        assert(r, " 0100 0");

        var r = zebkit.util.format(" ${4,a} ${2,+,m}", o, '-');
        assert(r, " -100 +0");

        var o = new Date(1999, 9, 11);
        var r = zebkit.util.format("-- ${2,month} , ${3,+,date} k ${fullYear}. ${2,kk}", o, 'x');
        assert(r, "-- x9 , +11 k 1999. xx");

        var r = zebkit.util.format(" ${4,a} ${2,+,m} ${d}", {}, '-');
        assert(r, " ---- -- -");
    },

    function _test_invalidpath() {
        var treeLikeRoot = { value:"test" };

        assertException(function() {
            zebkit.util.findInTree(treeLikeRoot, "", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebkit.util.findInTree(treeLikeRoot, "/", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebkit.util.findInTree(treeLikeRoot, "//", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebkit.util.findInTree(treeLikeRoot, "/*//", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebkit.util.findInTree(treeLikeRoot, "/*/", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebkit.util.findInTree(treeLikeRoot, "/Root/", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebkit.util.findInTree(treeLikeRoot, "/*/", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebkit.util.findInTree(treeLikeRoot, "//Root//", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebkit.util.findInTree(treeLikeRoot, "Root//a", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebkit.util.findInTree(treeLikeRoot, "//Root/a/", function() {}, function() {});
        }, Error);

        zebkit.util.findInTree(treeLikeRoot, "//Root/a/*", function() {}, function() {});

        zebkit.util.findInTree(treeLikeRoot, "//*[@id='dsds/sds']", function() {}, function() {});
    },

    function test_treelookup() {
        var treeLikeRoot = {
            value : "Root",
            kids : [
                { value: "Item 1", a:12 },
                { value: "Item 1", a:11, kids: null },
                {
                    value: "Item 2",
                    kids: [
                        { value: "Item 2.1", a:"aa" },
                        { value: "Item 1",   a:11 },
                        { value: "Item 2.1", c:"mm" }
                    ]
                }
            ]
        };

        var res = [],
            collect = function(e) {
                res.push(e);
                return false;
            };


        res = [];
        zebkit.util.findInTree(treeLikeRoot, ".//*", collect);
        assert(res.length, 7, "-100");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "./Root", collect);
        assert(res.length, 1, "-99");
        assert(res[0].value, "Root", "-98");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "./*/*", collect);
        assert(res.length, 3, "-999");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "./Root/*", collect);
        assert(res.length, 3, "-97");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "./Root/*[@a]", collect);
        assert(res.length, 2, "-96");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "//*[@a]", collect);
        assert(res.length, 4, "-95");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "//*[@b]", collect);
        assert(res.length, 0, "-94");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/*/*[@a]", collect);
        assert(res.length, 2, "-93");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "//*[@c]", collect);
        assert(res.length, 1, "-92");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "//*[ @c]", collect);
        assert(res.length, 1, "-91");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "//*[  @c ]", collect);
        assert(res.length, 1, "-90");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "//*[  @c = 'mm' ]", collect);
        assert(res.length, 1, "-89");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "//*", collect);
        assert(res.length, 6, "Find all children");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/*", collect);
        assert(res.length, 3, "Find all direct children of the root");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/*/*", collect);
        assert(res.length, 3, "Find all children second");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/*//*", collect);
        assert(res.length, 3, "5");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/*/*/*", collect);
        assert(res.length, 0, "6");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, ".", collect);
        assert(res.length, 1, "8");
        assert(res[0].value, "Root", "9");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/*/Item 1", collect);
        assert(res.length, 1, "10");
        assert(res[0].value, "Item 1", "11");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/Item 1", collect);
        assert(res.length, 2, "12");
        assert(res[0].value, "Item 1", "13");
        assert(res[1].value, "Item 1", "14");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "//Item 1", collect);
        assert(res.length, 3, "15");
        assert(res[0].value, "Item 1", "16");
        assert(res[1].value, "Item 1", "17");
        assert(res[2].value, "Item 1", "18");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/Item 1/Item 1", collect);
        assert(res.length, 0, "19");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/Item 2/Item 1", collect);
        assert(res.length, 1, "20");
        assert(res[0].value, "Item 1", "21");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/Item 1[@a=12]", collect);
        assert(res.length, 1, "22");
        assert(res[0].value, "Item 1", "23");
        assert(res[0].a, 12, "24");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/Item 1[@a=11]", collect);
        assert(res.length, 1, "26");
        assert(res[0].value, "Item 1", "27");
        assert(res[0].a, 11, "28");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "//*[@a=11]", collect);
        assert(res.length, 2, "29");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/*[@a=11]", collect);
        assert(res.length, 1, "30");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "//Item 1[@a=11]", collect);
        assert(res.length, 2, "31");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "//Item 2/*[@a=11]", collect);
        assert(res.length, 1, "32");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "//Item 2//*[@a=11]", collect);
        assert(res.length, 1, "33");
    },

    function test_layouttree() {
        zebkit.package("test.ui", function(pkg) {
            pkg.A = zebkit.Class(zebkit.layout.Layoutable, []);
            pkg.B = zebkit.Class(pkg.A, []);
            pkg.C = zebkit.Class(zebkit.layout.Layoutable, []);
            pkg.D = zebkit.Class(pkg.C, []);
            pkg.AA = zebkit.Class(pkg.D, []);
        });

        zebkit.require("test.ui", function(pkg) {
            var r = new zebkit.layout.Layoutable().setId("r");
            var a1 = new pkg.A()
            var a2 = new pkg.A().setId("a2");
            var a3 = new pkg.A().setId("a3");
            var b   = new pkg.B().setId("b");
            var c1  = new pkg.C().setId("c1");
            var c2  = new pkg.C().setId("c2");
            var c3  = new pkg.C().setId("c3");
            var d   = new pkg.D().setId("d");
            var aa  = new pkg.AA().setId("aa");


            r.value = "r";
            a1.value = "a1";
            a2.value = "a2";
            a3.value = "a3";
            b.value = "b";
            c1.value = "c1";
            c2.value = "c2";
            c3.value = "c3";
            d.value = "d";
            aa.value = "aa";


            a1.setId("a1_id");
            b.b_bool = true;
            aa.aa_int = 123;

            //   r
            //   \
            //   +--- b  { b_bool : true }
            //   |    +--- aa  { aa_int: 123}
            //   +--- a1 { id : 'a1_id' }
            //   +--- a2
            //   +--- c1
            //   |    +--- c2
            //   |    +--- d
            //   |    |    +--- c3
            //   |    +--- a3


            r.add(b);
            r.add(a1);
            r.add(a2);
            r.add(c1);
            c1.add(c2);
            c1.add(d);
            c1.add(a3);
            d.add(c3);
            b.add(aa);

            assert(r.byPath("."), r, "test_layouttree 0");

            assert(r.byPath("//zebkit.test.ui.A"), a1, "test_layouttree 1");
            assert(r.byPath("//zebkit.test.ui.B"), b, "test_layouttree 2");
            assert(r.byPath("//zebkit.test.ui.C"), c1, "test_layouttree 3");
            assert(r.byPath("//zebkit.test.ui.D"), d, "test_layouttree 4");
            assert(r.byPath("//zebkit.test.ui.AA"), aa, "test_layouttree 5");
            assert(r.byPath("//!zebkit.test.ui.A"), b, "test_layouttree 1");


            assert(r.byPath("/zebkit.test.ui.A"), a1, "test_layouttree 6");
            assert(r.byPath("/zebkit.test.ui.B"), b, "test_layouttree 7");
            assert(r.byPath("/zebkit.test.ui.C"), c1, "test_layouttree 8");
            assert(r.byPath("/zebkit.test.ui.D"), null, "test_layouttree 9");
            assert(r.byPath("/zebkit.test.ui.AA"), null, "test_layouttree 10");


            assert(r.byPath("//~zebkit.test.ui.A"), b, "test_layouttree 16");
            assert(r.byPath("//~zebkit.test.ui.B"), b, "test_layouttree 17");
            assert(r.byPath("//~zebkit.test.ui.C"), aa, "test_layouttree 18");
            assert(r.byPath("//~zebkit.test.ui.D"), aa, "test_layouttree 19");
            assert(r.byPath("//~zebkit.test.ui.AA"), aa, "test_layouttree 20");



            assert(r.byPath("/~zebkit.test.ui.A"), b, "test_layouttree 26");
            assert(r.byPath("/~zebkit.test.ui.B"), b, "test_layouttree 27");
            assert(r.byPath("/~zebkit.test.ui.C"), c1, "test_layouttree 28");
            assert(r.byPath("/~zebkit.test.ui.D"), null, "test_layouttree 29");
            assert(r.byPath("/~zebkit.test.ui.AA"), null, "test_layouttree 30");

            assert(r.byPath("/*//*"), aa, "test_layouttree 31");
            assert(r.byPath("/*/*"), aa, "test_layouttree 32");


            assert(r.byPath("/*/*/*"), c3, "test_layouttree 33");


            assert(r.byPath("/*/*//*"), c3, "test_layouttree 34");


            assert(r.byPath("/*//*/*"), c3, "test_layouttree 35");



            assert(r.byPath("#a1_id"), a1, "test_layouttree 36");
            assert(r.byPath("#a2_id"), null, "test_layouttree 37");
            assert(r.byPath("/*/*[@id='a1_id']"), null, "test_layouttree 38");
            assert(r.byPath("/*[@id='a1_id']"), a1, "test_layouttree 39");
            assert(r.byPath("//*[@id='a1_id']"), a1, "test_layouttree 40");
            assert(r.byPath("//zebkit.test.ui.C[@id='a1_id']"), null, "test_layouttree 41");
            assert(r.byPath("/zebkit.test.ui.C[@id='a1_id']"), null, "test_layouttree 42");
            assert(r.byPath("//zebkit.test.ui.A[@id='a1_id']"), a1, "test_layouttree 43");
            assert(r.byPath("/zebkit.test.ui.A[@id='a1_id']"), a1, "test_layouttree 44");
            assert(r.byPath("/~zebkit.test.ui.A[@id='a1_id']"), a1, "test_layouttree 45");
            assert(r.byPath("//~zebkit.test.ui.A[@id='a1_id']"), a1, "test_layouttree 46");

            assert(r.byPath("/*/zebkit.test.ui.A"), a3, "test_layouttree 47");
            assert(r.byPath("//*/zebkit.test.ui.A"), a3, "test_layouttree 48");
            assert(r.byPath("/*/~zebkit.test.ui.A"), a3, "test_layouttree 49");
            assert(r.byPath("//*/~zebkit.test.ui.A"), a3, "test_layouttree 50");

            assert(r.byPath("/*[@b_bool=false]"), null, "test_layouttree 51");
            assert(r.byPath("/*[@b_bool=true]"), b, "test_layouttree 52");
            assert(r.byPath("/zebkit.test.ui.B[@b_bool=true]"), b, "test_layouttree 53");
            assert(r.byPath("/~zebkit.test.ui.B[@b_bool=true]"), b, "test_layouttree 54");
            assert(r.byPath("/zebkit.test.ui.A[@b_bool=true]"), null, "test_layouttree 55");
            assert(r.byPath("/~zebkit.test.ui.A[@b_bool=true]"), b, "test_layouttree 56");
            assert(r.byPath("//*[@b_bool=true]"), b, "test_layouttree 57");
            assert(r.byPath("/*[@b_bool='true']"), null, "test_layouttree 58");


            assert(r.byPath("/*[@aa_int=123]"), null, "test_layouttree 59");
            assert(r.byPath("/*/*[@aa_int=123]"), aa, "test_layouttree 60");
            assert(r.byPath("/*/*[@aa_int='123']"), null, "test_layouttree 61");
            assert(r.byPath("/zebkit.test.ui.B/*[@aa_int=123]"), aa, "test_layouttree 62");
            assert(r.byPath("/zebkit.test.ui.B/zebkit.test.ui.AA[@aa_int=123]"), aa, "test_layouttree 63");
            assert(r.byPath("/zebkit.test.ui.B/zebkit.test.ui.A[@aa_int=123]"), null, "test_layouttree 64");
            assert(r.byPath("/zebkit.test.ui.A/zebkit.test.ui.AA[@aa_int=123]"), null, "test_layouttree 65");
            assert(r.byPath("/~zebkit.test.ui.A/zebkit.test.ui.AA[@aa_int=123]"), aa, "test_layouttree 66");
            assert(r.byPath("/~zebkit.test.ui.A/*[@aa_int=123]"), aa, "test_layouttree 67");
            assert(r.byPath("/~zebkit.test.ui.A/zebkit.test.ui.AA[@aa_int=1232]"), null, "test_layouttree 68");
            assert(r.byPath("/~zebkit.test.ui.A/~zebkit.test.ui.C[@aa_int=123]"), aa, "test_layouttree 69");
            assert(r.byPath("/~zebkit.test.ui.A/~zebkit.test.ui.D[@aa_int=123]"), aa, "test_layouttree 70");
            assert(r.byPath("/~zebkit.test.ui.B/~zebkit.test.ui.D[@aa_int=123]"), aa, "test_layouttree 71");
            assert(r.byPath("/~zebkit.test.ui.C/~zebkit.test.ui.D[@aa_int=123]"), null, "test_layouttree 72");
            assert(r.byPath("/zebkit.test.ui.B/~zebkit.test.ui.D[@aa_int=123]"), aa, "test_layouttree 73");
            assert(r.byPath("//*[@aa_int=123]"), aa, "test_layouttree 74");


            var res = r.byPath("//*", null);
            assert(res.length, 9, "test_layouttree 75");

            var res = r.byPath("/*", null);
            assert(res.length, 4, "test_layouttree 76");

            var res = r.byPath("/*/*", null);
            assert(res.length, 4, "test_layouttree 77");

            var res = r.byPath("/*/*/*", null);
            assert(res.length, 1, "test_layouttree 78");

            var res = r.byPath("/*//*", null);
            assert(res.length, 5, "test_layouttree 79");

            var res = r.byPath("/zebkit.test.ui.A", null);
            assert(res.length, 2, "test_layouttree 80");

            var res = r.byPath("//zebkit.test.ui.A", null);
            assert(res.length, 3, "test_layouttree 81");

            var res = r.byPath("/~zebkit.test.ui.A", null);
            assert(res.length, 3, "test_layouttree 82");

            var res = r.byPath("//~zebkit.test.ui.A", null);
            assert(res.length, 4, "test_layouttree 83");

            var res = r.byPath("/zebkit.test.ui.C/*", null);
            assert(res.length, 3, "test_layouttree 84");

            var res = r.byPath("/zebkit.test.ui.C//*", null);
            assert(res.length, 4, "test_layouttree 85");

            var res = r.byPath("/~zebkit.test.ui.C//*", null);
            assert(res.length, 4, "test_layouttree 86");

            var res = r.byPath("/~zebkit.test.ui.C", null);
            assert(res.length, 1, "test_layouttree 87");

            var res = r.byPath("//~zebkit.test.ui.C", null);
            assert(res.length, 5, "test_layouttree 88");

            var res = r.byPath("/*/*/~zebkit.test.ui.C", null);
            assert(res.length, 1, "test_layouttree 89");

            var res = r.byPath("/*/*/~zebkit.test.ui.A", null);
            assert(res.length, 0, "test_layouttree 90");
        });
    }
);







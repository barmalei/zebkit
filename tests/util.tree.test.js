
if (typeof(zebra) === "undefined") {
    load(arguments[0] + '/src/easyoop.js');
    load(arguments[0] + '/src/tools.js');
    load(arguments[0] + '/src/util.js');
    load(arguments[0] + '/src/layout.js');
}

var assert = zebra.assert, Class = zebra.Class, assertException = zebra.assertException,
    assertNoException = zebra.assertNoException, Listeners = zebra.util.Listeners;

zebra.runTests("Zebra util",
    function test_format() {
        var s = " -- ${a} ${b}.",
            o = { a:  100, b: "abcdef", d:"b", getM: function() { return 0 }  };

        var r = zebra.util.format(s, o);
        assert(r, " -- 100 abcdef." );

        var r = zebra.util.format(" ${${d}} ${m} ${m}", o);
        assert(r, " abcdef 0 0");

        var r = zebra.util.format(" ${4,0,a} ${m}", o);
        assert(r, " 0100 0");

        var r = zebra.util.format(" ${4,a} ${2,+,m}", o, '-');
        assert(r, " -100 +0");

        var o = new Date(1999, 9, 11);
        var r = zebra.util.format("-- ${2,month} , ${3,+,date} k ${fullYear}. ${2,kk}", o, 'x');
        assert(r, "-- x9 , +11 k 1999. xx");

        var r = zebra.util.format(" ${4,a} ${2,+,m} ${d}", {}, '-');
        assert(r, " ---- -- -");
    },

    function test_invalidpath() {
        var treeLikeRoot = { value:"test" };

        assertException(function() {
            zebra.util.findInTree(treeLikeRoot, "", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebra.util.findInTree(treeLikeRoot, "/", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebra.util.findInTree(treeLikeRoot, "//", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebra.util.findInTree(treeLikeRoot, "/*//", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebra.util.findInTree(treeLikeRoot, "/*/", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebra.util.findInTree(treeLikeRoot, "/Root/", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebra.util.findInTree(treeLikeRoot, "/*/", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebra.util.findInTree(treeLikeRoot, "//Root//", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebra.util.findInTree(treeLikeRoot, "Root//a", function() {}, function() {});
        }, Error);

        assertException(function() {
            zebra.util.findInTree(treeLikeRoot, "//Root/a/", function() {}, function() {});
        }, Error);

        zebra.util.findInTree(treeLikeRoot, "//Root/a/*", function() {}, function() {});

        zebra.util.findInTree(treeLikeRoot, "//*[@id='dsds/sds']", function() {}, function() {});
    },


    function test_treelookup() {

        var treeLikeRoot = {
            value : "Root",
            kids : [
                { value: "Item 1", a:12 },
                { value: "Item 1", a:11 },
                {
                    value: "Item 2",
                    kids: [
                        { value: "Item 2.1", a:"aa" },
                        { value: "Item 1", a:11 },
                        { value: "Item 2.1", c:"mm" }
                    ]
                }
            ]
        };

        var res = [],
            cmp = function(item, fragment) {
                return item.value == fragment;
            },
            collect = function(e) {
                res.push(e);
                return false;
            };

        res = [];
        zebra.util.findInTree(treeLikeRoot, "//*", cmp, collect);
        assert(res.length, 7);

        res = [];
        zebra.util.findInTree(treeLikeRoot, "/*", cmp, collect);
        assert(res.length, 1);

        res = [];
        zebra.util.findInTree(treeLikeRoot, "/*/*", cmp, collect);
        assert(res.length, 3);

        res = [];
        zebra.util.findInTree(treeLikeRoot, "/*//*", cmp, collect);
        assert(res.length, 6);

        res = [];
        zebra.util.findInTree(treeLikeRoot, "/*/*/*", cmp, collect);
        assert(res.length, 3);

        res = [];
        zebra.util.findInTree(treeLikeRoot, "/*/*//*", cmp, collect);
        assert(res.length, 3);


        res = [];
        zebra.util.findInTree(treeLikeRoot, "/Root", cmp, collect);
        assert(res.length, 1);
        assert(res[0].value, "Root");

        res = [];
        zebra.util.findInTree(treeLikeRoot, "/*/Item 1", cmp, collect);
        assert(res.length, 2);
        assert(res[0].value, "Item 1");
        assert(res[1].value, "Item 1");

        res = [];
        zebra.util.findInTree(treeLikeRoot, "/*//Item 1", cmp, collect);
        assert(res.length, 3);
        assert(res[0].value, "Item 1");
        assert(res[1].value, "Item 1");
        assert(res[2].value, "Item 1");

        res = [];
        zebra.util.findInTree(treeLikeRoot, "/Root//Item 1", cmp, collect);
        assert(res.length, 3);
        assert(res[0].value, "Item 1");
        assert(res[1].value, "Item 1");
        assert(res[2].value, "Item 1");

        res = [];
        zebra.util.findInTree(treeLikeRoot, "/Root/Item 1", cmp, collect);
        assert(res.length, 2);
        assert(res[0].value, "Item 1");
        assert(res[1].value, "Item 1");


        res = [];
        zebra.util.findInTree(treeLikeRoot, "/Root/Item 1/Item 1", cmp, collect);
        assert(res.length, 0);

        res = [];
        zebra.util.findInTree(treeLikeRoot, "/Root/Item 2/Item 1", cmp, collect);
        assert(res.length, 1);
        assert(res[0].value, "Item 1");

        res = [];
        zebra.util.findInTree(treeLikeRoot, "/Root/Item 1[@a=12]", cmp, collect);
        assert(res.length, 1);
        assert(res[0].value, "Item 1");
        assert(res[0].a, 12);

        res = [];
        zebra.util.findInTree(treeLikeRoot, "/Root/Item 1[@a=11]", cmp, collect);
        assert(res.length, 1);
        assert(res[0].value, "Item 1");
        assert(res[0].a, 11);

        res = [];
        zebra.util.findInTree(treeLikeRoot, "//*[@a=11]", cmp, collect);
        assert(res.length, 2);

        res = [];
        zebra.util.findInTree(treeLikeRoot, "/Root//*[@a=11]", cmp, collect);
        assert(res.length, 2);

        res = [];
        zebra.util.findInTree(treeLikeRoot, "//Item 1[@a=11]", cmp, collect);
        assert(res.length, 2);

        res = [];
        zebra.util.findInTree(treeLikeRoot, "//Item 2/*[@a=11]", cmp, collect);
        assert(res.length, 1);

        res = [];
        zebra.util.findInTree(treeLikeRoot, "//Item 2//*[@a=11]", cmp, collect);
        assert(res.length, 1);
    }

    // function test_layouttree() {

    // }
);









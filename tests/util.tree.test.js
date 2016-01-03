
if (typeof(zebkit) === "undefined") {
    load(arguments[0] + '/src/easyoop.js');
    load(arguments[0] + '/src/tools.js');
    load(arguments[0] + '/src/util.js');
    load(arguments[0] + '/src/layout.js');
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

    function test_invalidpath() {
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
        zebkit.util.findInTree(treeLikeRoot, "//*", cmp, collect);
        assert(res.length, 7);

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/*", cmp, collect);
        assert(res.length, 1);

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/*/*", cmp, collect);
        assert(res.length, 3);

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/*//*", cmp, collect);
        assert(res.length, 6);

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/*/*/*", cmp, collect);
        assert(res.length, 3);

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/*/*//*", cmp, collect);
        assert(res.length, 3);


        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/Root", cmp, collect);
        assert(res.length, 1);
        assert(res[0].value, "Root");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/*/Item 1", cmp, collect);
        assert(res.length, 2);
        assert(res[0].value, "Item 1");
        assert(res[1].value, "Item 1");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/*//Item 1", cmp, collect);
        assert(res.length, 3);
        assert(res[0].value, "Item 1");
        assert(res[1].value, "Item 1");
        assert(res[2].value, "Item 1");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/Root//Item 1", cmp, collect);
        assert(res.length, 3);
        assert(res[0].value, "Item 1");
        assert(res[1].value, "Item 1");
        assert(res[2].value, "Item 1");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/Root/Item 1", cmp, collect);
        assert(res.length, 2);
        assert(res[0].value, "Item 1");
        assert(res[1].value, "Item 1");


        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/Root/Item 1/Item 1", cmp, collect);
        assert(res.length, 0);

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/Root/Item 2/Item 1", cmp, collect);
        assert(res.length, 1);
        assert(res[0].value, "Item 1");

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/Root/Item 1[@a=12]", cmp, collect);
        assert(res.length, 1);
        assert(res[0].value, "Item 1");
        assert(res[0].a, 12);

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/Root/Item 1[@a=11]", cmp, collect);
        assert(res.length, 1);
        assert(res[0].value, "Item 1");
        assert(res[0].a, 11);

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "//*[@a=11]", cmp, collect);
        assert(res.length, 2);

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "/Root//*[@a=11]", cmp, collect);
        assert(res.length, 2);

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "//Item 1[@a=11]", cmp, collect);
        assert(res.length, 2);

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "//Item 2/*[@a=11]", cmp, collect);
        assert(res.length, 1);

        res = [];
        zebkit.util.findInTree(treeLikeRoot, "//Item 2//*[@a=11]", cmp, collect);
        assert(res.length, 1);
    }

    // function test_layouttree() {

    // }
);









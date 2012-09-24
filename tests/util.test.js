
if (typeof(zebra) === "undefined") {
    load(arguments[0] + '/lib/gravity/zebra/easyoop.js');
	load(arguments[0] + '/lib/gravity/zebra/assert.js');
	load(arguments[0] + '/lib/gravity/zebra/util.js');
	load(arguments[0] + '/lib/gravity/zebra/io.js');
}

var assert = zebra.assert;

zebra.runTests("Zebra UTIL",
    function _test_Properties() {
        var s = "a = 100\na.b = 1200\n# comment \n#\n\n\nm = abcd # dsdsds";
        var p = new zebra.util.Properties();
        p.load(s);
    
        assert(p.size(), 3, "11");
        assert(p.get('a'), "100", "11");
        assert(p.get('a.b'), "1200", "11");
        assert(p.get('m'), "abcd", "11");
        assert(p.getProperty('a'), "100", "11");
        assert(p.getProperty('a.b'), "1200", "11");
        assert(p.getProperty('m'), "abcd", "11");
        assert(p.isEmpty(), false, "11");

        return

        var keys = ['a', 'a.b', 'm' ];
        for(var e = p.keys(); e.hasMoreElements();) {
            var ee = e.nextElement();
            assert(keys.indexOf(ee) >= 0, true, "11");
            assert(p.containsKey(ee), true, "11");
        }

        var values = ['100', '1200', 'abcd' ];
        for(var e = p.elements(); e.hasMoreElements();) {
            var ee = e.nextElement();
            assert(values.indexOf(ee) >= 0, true, "11");
            assert(p.containsValue(ee), true, "11");
        }

        p.setProperty("t", "abc");
        assert(p.containsValue("abc"), true, "11");
        assert(p.containsKey("t"), true, "11");
        assert(p.size(), 4, "11");
        p.put("t", "abc");
        assert(p.containsValue("abc"), true, "11");
        assert(p.containsKey("t"), true, "11");
        assert(p.get("t") == "abc", true, "11");
        assert(p.size(), 4, "11");

        p.remove("a");
        assert(p.size(), 3, "11");
        assert(p.containsKey("a"), false, "11");

        p.clear();
        assert(p.size(), 0, "11");
        assert(p.isEmpty(), true, "11");
    },

    function testBag () {
        var p = new zebra.util.JSONBag(), aaa = 1;
1
        zebra.$global.A = zebra.Class([
            function(a) {
                this.a = a;
            },

            function toString (argument) {
                return "" + this.a;
            }

        ]);

        p.loadFromString('{ "a": 10, "b": { "NEW": { "$class": "A", "$args":1 } } }' );

        print(p.get("a"));
        print(p.get("b"));
        print(p.get("b"));
    }
    
);









if (typeof(zebra) === "undefined") {
    load(arguments[0] + '/lib/zebra/easyoop.js');
    load(arguments[0] + '/lib/zebra/tools.js');
    load(arguments[0] + '/lib/zebra/util.js');
    load(arguments[0] + '/lib/zebra/data.js');
}

var assert = zebra.assert, Class = zebra.Class, TreeModel = zebra.data.TreeModel, 
    assertException = zebra.assertException, Matrix = zebra.data.Matrix,
    ListModel = zebra.data.ListModel, Text = zebra.data.Text, SingleLineTxt = zebra.data.SingleLineTxt;

zebra.runTests("Zebra util objects bag",
    function test_treemodel() {
        function test (t) {
            assert(t.root.value, "Root");
            assert(t.root.parent == null, true);
            assert(t.root.kids.length, 2);
            assert(t.root.kids[0].value, "Item 1");
            assert(t.root.kids[1].value, "Item 2");
            assert(t.root.kids[0].parent, t.root);
            assert(t.root.kids[0].kids.length, 0);
            assert(t.root.kids[1].parent, t.root);
            assert(t.root.kids[1].kids.length, 0);
        }

        test(new TreeModel({
            value: "Root", 
            kids: [
                "Item 1",
                "Item 2"
            ]
        }));

        test(new TreeModel({
            value: "Root", 
            kids: [
                { value: "Item 1" },
                { value: "Item 2" }
            ]
        }));

        var t = new TreeModel("Root");
        t.add(t.root, "Item 1");
        t.add(t.root, "Item 2");
        test(t);

        var t = new TreeModel(new zebra.data.Item("Root"));
        t.add(t.root, new zebra.data.Item("Item 1"));
        t.add(t.root, new zebra.data.Item("Item 2"));
        test(t);

        t.add(t.root.kids[0], "Item 1.1");
        assert(t.root.kids[0].kids[0].value, "Item 1.1");
        assert(t.root.kids[0].kids.length, 1);
        assert(t.root.kids[0].kids[0].parent, t.root.kids[0]);

        var k = t.root.kids[1];
        t.remove(t.root.kids[1]);
        assert(t.root.kids.length, 1);
        assert(t.root.kids[0].kids[0].value, "Item 1.1");
        assert(t.root.kids[0].kids.length, 1);
        assert(t.root.kids[0].kids[0].parent, t.root.kids[0]);
        assert(k.parent == null, true);

        var k1 = t.root.kids[0], k2 = t.root.kids[0].kids[0];
        t.remove(t.root.kids[0]);
        assert(t.root.kids.length, 0);
        assert(k1.parent == null, true);
        assert(k1.kids.length, 0);
        assert(k2.parent == null, true);
        assert(k2.kids.length, 0);


        var t = new TreeModel({
            value: "Root",
            kids : [ "Item 1", "Item 1" ]
        });


        assert(t.root.kids[0] != t.root.kids[1], true);

        function indexOf(item) {
            if (item.parent != null) {
                for(var i=0; i < item.parent.kids.length; i++) {
                    if (item.parent.kids[i] == item) {
                        return i;
                    }
                }
            }
            return -1;
        }

        assert(indexOf(t.root.kids[1]), 1);
        assert(indexOf(t.root.kids[0]), 0);
        assert(indexOf(t.root), -1);

    },


    function test_matrix() {
        var m = new Matrix([ [1,2,3] ]);
        assert(m.rows, 1);
        assert(m.cols, 3);
        assert(m.get(0,0), 1);
        assert(m.get(0,1), 2);
        assert(m.get(0,2), 3);
        assertException(function () { m.get(1,0) }, Error);
        assertException(function () { m.get(0,-1) }, Error);

        m.put(1,0, 10);
        assert(m.rows, 2);
        assert(m.cols, 3);
        assert(m.get(0,0), 1);
        assert(m.get(0,1), 2);
        assert(m.get(0,2), 3);
        assert(m.get(1,0), 10);
        assert(m.get(1,1), undefined);
        assert(m.get(1,2), undefined);
        assertException(function () { m.get(1,3) }, Error);
        assertException(function () { m.get(-1,2) }, Error);
        
    },

    function test_listmodel() {
        var l = new ListModel([1,2,3]);

        assert(l.count(), 3);
        assert(l.get(0), 1);
        assert(l.get(1), 2);
        assert(l.get(2), 3);
        assertException(function () { l.get(4) }, Error);
        assertException(function () { l.get(-1) }, Error);

        l.add(4);
        assert(l.count(), 4);
        assert(l.get(0), 1);
        assert(l.get(1), 2);
        assert(l.get(2), 3);
        assert(l.get(3), 4);

        l.remove(3);
        assert(l.count(), 3);
        assert(l.get(0), 1);
        assert(l.get(1), 2);
        assert(l.get(2), 4);

        l.removeAt(1);
        assert(l.count(), 2);
        assert(l.get(0), 1);
        assert(l.get(1), 4);

        l.removeAll();
        assert(l.count(), 0);
        assertException(function () { l.insert(100, 1) }, Error);
    },

    function test_text() {
        var t = new Text("");
        assert(t.getLines(), 1);
        assert(t.getLine(0), "");
        assertException(function() { t.getLine(1); }, Error);
        assert(t.getTextLength(), 0);

        t.write("One\nTwo", 0);
        assert(t.getLines(), 2);
        assert(t.getLine(0), "One");
        assert(t.getLine(1), "Two");
        assertException(function() { t.getLine(2); }, Error);
        assert(t.getTextLength(), 7);

        t.remove(3,1);
        assert(t.getLines(), 1);
        assert(t.getLine(0), "OneTwo");
        assertException(function() { t.getLine(1); }, Error);
        assert(t.getTextLength(), 6);
    },

    function test_singlelinetxt() {
        var t = new SingleLineTxt("");
        assert(t.getLines(), 1);
        assert(t.getLine(0), "");
        assertException(function() { t.getLine(1); }, Error);
        assert(t.getTextLength(), 0);

        t.write("One\nTwo", 0);
        assert(t.getLines(), 1);
        assert(t.getLine(0), "One");
        assertException(function() { t.getLine(1); }, Error);
        assert(t.getTextLength(), 3);

        t.remove(1,2);
        assert(t.getLines(), 1);
        assert(t.getLine(0), "O");
        assertException(function() { t.getLine(1); }, Error);
        assert(t.getTextLength(), 1);
    }
);

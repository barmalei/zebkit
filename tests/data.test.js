
if (typeof(zebra) === "undefined") {
    load(arguments[0] + '/src/easyoop.js');
    load(arguments[0] + '/src/tools.js');
    load(arguments[0] + '/src/util.js');
    load(arguments[0] + '/src/data.js');
}

var assert = zebra.assert, Class = zebra.Class, TreeModel = zebra.data.TreeModel,
    assertException = zebra.assertException, Matrix = zebra.data.Matrix,
    ListModel = zebra.data.ListModel, Text = zebra.data.Text, SingleLineTxt = zebra.data.SingleLineTxt;

zebra.runTests("Util objects bag",
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

        var t = new TreeModel({
            value: "Root",
            kids : [
                {
                    value: "Item 1",
                    kids : [
                        "Item 1.1",
                        "Item 1.2"
                    ]
                },

                "Item 2"
            ]
        });

        assert(t.root.kids.length, 2);
        assert(TreeModel.find(t.root, "Item 1").length, 1);
        assert(TreeModel.find(t.root, "Item 1.1").length, 1);
        assert(TreeModel.find(t.root, "Item 1.2").length, 1);
        assert(TreeModel.findOne(t.root, "Item 1").kids.length, 2);

        var check = null, counter = 0;
        t.bind(function itemRemoved(tree, item) {
            counter++;
            assert(tree, t);
            assert(item == check || item.parent == check, true);
            assert(item.parent != null, true);
            assert(item.kids == null || item.kids.length == 0, true)
        });

        check = TreeModel.findOne(t.root, "Item 1.1");
        t.remove(check);

        assert(counter, 1);
        assert(check.parent, null);
        assert(TreeModel.findOne(t.root, "Item 1").kids.length, 1);
        assert(TreeModel.findOne(t.root, "Item 1.1") == null, true);


        check = TreeModel.findOne(t.root, "Item 1");
        t.remove(check);

        assert(counter, 3);
        assert(check.parent, null);
        assert(t.root.parent, null);
        assert(t.root.kids.length == 1, true);
        assert(t.root.kids[0].value, "Item 2");
        assert(t.root.kids[0].parent, t.root);
        assert(TreeModel.findOne(t.root, "Item 1") == null, true);
        assert(TreeModel.findOne(t.root, "Item 1.1") == null, true);

        var t = new TreeModel({
            value: "Root",
            kids : [
                {
                    value: "Item 1",
                    kids : [
                        "Item 1.1",
                        "Item 1.2"
                    ]
                },

                "Item 2"
            ]
        });

        assert(t.root.parent, null);
        assert(t.root.kids.length, 2);
        assert(TreeModel.find(t.root, "Item 1").length, 1);
        assert(TreeModel.find(t.root, "Item 1.1").length, 1);
        assert(TreeModel.find(t.root, "Item 1.2").length, 1);
        assert(TreeModel.findOne(t.root, "Item 1").kids.length, 2);

        t.removeKids(TreeModel.findOne(t.root, "Item 1"));
        assert(t.root.kids.length == 2, true);
        assert(t.root.kids[0].value, "Item 1");
        assert(t.root.kids[1].value, "Item 2");
        assert(t.root.kids[0].parent, t.root);
        assert(t.root.kids[1].parent, t.root);
        assert(TreeModel.findOne(t.root, "Item 1.1") == null, true);
        assert(TreeModel.findOne(t.root, "Item 1.2") == null, true);
    },

    function test_matrix() {
        var m = new Matrix([ [1,2,3] ]);
        assert(m.rows, 1);
        assert(m.cols, 3);
        assert(m.get(0,0), 1);
        assert(m.get(0,1), 2);
        assert(m.get(0,2), 3);


        assertException(function () { m.get(1, 0) }, RangeError);
        assertException(function () { m.get(0,-1) }, RangeError);

        m.put(1,0, 10);
        assert(m.rows, 2);
        assert(m.cols, 3);
        assert(m.get(0,0), 1);
        assert(m.get(0,1), 2);
        assert(m.get(0,2), 3);
        assert(m.get(1,0), 10);
        assert(m.get(1,1), undefined);
        assert(m.get(1,2), undefined);

        var m = new Matrix(3,2);
        assert(m.rows, 3);
        assert(m.cols, 2);
        for(var i = 0; i < m.rows ; i++) {
            assert(m.objs[i], undefined);
            for(var j = 0; j < m.cols ; j++) {
                assert(m.get(i,j), undefined);
            }
        }

        m.put(2, 1, 1);
        for(var i = 0; i < m.rows ; i++) {
            if (i != 2) assert(m.objs[i], undefined);
            for(var j = 0; j < m.cols ; j++) {
                if (i != 2 && j != 1) assert(m.get(i,j), undefined);
            }
        }
        assert(m.get(2,1), 1);
    },

    function test_matrix_removeRows() {
        var m = new Matrix(3,2);
        assert(m.rows, 3);
        assert(m.cols, 2);
        assert(m.objs.length, 0);

        m.removeRows(1, 1);
        assert(m.rows, 2);
        assert(m.cols, 2);
        assert(m.objs.length, 0);
        for(var i = 0; i < m.rows ; i++) {
            assert(m.objs[i], undefined);
            for(var j = 0; j < m.cols ; j++) {
                assert(m.get(i,j), undefined);
            }
        }

        m.put(0, 1, 10);
        assert(m.get(0, 1), 10);
        for(var i = 0; i < m.rows ; i++) {
            if (i != 0) assert(m.objs[i], undefined);
        }

        m.removeRows(0, 2);
        assert(m.rows, 0);
        assert(m.cols, 2);
        assert(m.objs.length, 0);

        m.setRowsCols(3, 4);
        assert(m.rows, 3);
        assert(m.cols, 4);
        assert(m.objs.length, 0); // no real data no space to be allocated
        for(var i = 0; i < m.rows ; i++) {
            assert(m.objs[i], undefined);
        }

        m.removeRows(1, 1);
        assert(m.rows, 2);
        assert(m.cols, 4);
        assert(m.objs.length, 0);


        var m = new Matrix([[0, 1, 2],[3, 4, 5]]);
        assert(m.rows, 2);
        assert(m.cols, 3);
        assert(m.objs.length, m.rows);

        var c = 0;
        for(var i = 0; i < m.rows ; i++) {
            assert(m.objs[i].length, m.cols);
            for(var j = 0; j < m.cols ; j++) {
                assert(m.objs[i][j], c);
                assert(m.get(i, j), c++);
            }
        }

        m.removeRows(0, 1);
        assert(m.rows, 1);
        assert(m.cols, 3);
        assert(m.objs.length, m.rows);
        var c = 3;
        for(var i = 0; i < m.rows ; i++) {
            assert(m.objs[i].length, m.cols);
            for(var j = 0; j < m.cols ; j++) {
                assert(m.objs[i][j], c);
                assert(m.get(i, j), c++);
            }
        }


        m.put(10, 2, 101);
        assert(m.rows, 11);
        assert(m.cols, 3);
        assert(m.objs.length, m.rows);
        var c = 3;
        for(var i = 0; i < 1 ; i++) {
            assert(m.objs[i].length, m.cols);
            for(var j = 0; j < m.cols ; j++) {
                assert(m.objs[i][j], c);
                assert(m.get(i, j), c++);
            }
        }

        for(var i = 1; i < 9 ; i++) {
            assert(m.objs[i], undefined);
            for(var j = 0; j < m.cols ; j++) {
                assert(m.get(i, j), undefined);
            }
        }

        assert(m.get(10, 2), 101);
        assert(m.objs[10].length, 3);
        for(var j = 0; j < m.cols ; j++) {
            if (j != 2) assert(m.get(10, j), undefined);
        }

        m.removeRows(0, m.rows);
        assert(m.rows, 0);
        assert(m.cols, 3);
        assert(m.objs.length, 0);

        m.put(1, 1, 99);
        assert(m.rows, 2);
        assert(m.cols, 3);
        assert(m.objs.length, 2);
        assert(m.get(1,1), 99);

        for(var i = 0; i < m.rows ; i++) {
            if (i != 1) assert(m.objs[i], undefined);
            else        assert(m.objs[i].length, 2);
            for(var j = 0; j < m.cols ; j++) {
                if (i != 1 || j != 1) assert(m.get(i, j), undefined);
                else                  assert(m.get(i, j), 99);
            }
        }

    },


    function test_matrix_removeCols() {
        var m = new Matrix(3, 4);
        assert(m.rows, 3);
        assert(m.cols, 4);
        assert(m.objs.length, 0);
        for(var i = 0; i < m.rows ; i++) {
            assert(m.objs[i], undefined);
            for(var j = 0; j < m.cols ; j++) {
                assert(m.get(i,j), undefined);
            }
        }

        m.removeCols(1, 2);
        assert(m.rows, 3);
        assert(m.cols, 2);
        assert(m.objs.length, 0);
        for(var i = 0; i < m.rows ; i++) {
            assert(m.objs[i], undefined);
            for(var j = 0; j < m.cols ; j++) {
                assert(m.get(i,j), undefined);
            }
        }

        m.put(2, 1, 150);
        assert(m.objs.length, 3);
        assert(m.get(2, 1), 150);
        assert(m.get(2, 0), undefined);

        m.removeCols(0, 1);
        assert(m.rows, 3);
        assert(m.cols, 1);
        assert(m.objs.length, 3);
        assert(m.get(2, 0), 150);

        m.removeCols(0, 1);
        assert(m.rows, 3);
        assert(m.cols, 0);
        assert(m.objs.length, 3);
    },

    function test_matrix_insertRows() {
        var m = new Matrix(10, 4);
        assert(m.rows, 10);
        assert(m.cols, 4);
        assert(m.objs.length, 0);

        m.insertRows(1, 3);
        assert(m.rows, 13);
        assert(m.cols, 4);
        assert(m.objs.length, 0);

        m.put(10, 0, 88);
        m.insertRows(10, 2);
        assert(m.rows, 15);
        assert(m.cols, 4);
        assert(m.objs.length, 13);
        assert(m.get(12, 0), 88);

        for(var i = 0; i < 12 ; i++) {
            assert(m.objs[i], undefined);
        }
    },

    function test_matrix_insertCols() {
        var m = new Matrix(10, 4);
        assert(m.rows, 10);
        assert(m.cols, 4);
        assert(m.objs.length, 0);

        m.insertCols(1, 3);
        assert(m.rows, 10);
        assert(m.cols, 7);
        assert(m.objs.length, 0);

        m.put(5, 3, 881);
        m.insertCols(2, 2);

        assert(m.rows, 10);
        assert(m.cols, 9);
        assert(m.objs.length, 6);
        assert(m.get(5, 5), 881);

        for(var i = 0; i < m.rows ; i++) {
            if (i == 5) assert(m.objs[i].length, 6);
            else        assert(m.objs[i], undefined);
            for(var j = 0; j < m.cols ; j++) {
                if (i != 5 && j != 5) assert(m.get(i,j), undefined);
            }
        }
    },

    function test_listmodel() {
        var l = new ListModel([1,2,3]);

        assert(l.count(), 3);
        assert(l.get(0), 1);
        assert(l.get(1), 2);
        assert(l.get(2), 3);
        assertException(function () { l.get(4) }, RangeError);
        assertException(function () { l.get(-1) }, RangeError);
        assertException(function () { l.setAt(-1, "") }, RangeError);
        assertException(function () { l.setAt(3, "") }, RangeError);

        l.add(4);
        assert(l.count(), 4);
        assert(l.get(0), 1);
        assert(l.get(1), 2);
        assert(l.get(2), 3);
        assert(l.get(3), 4);
        assert(l.indexOf(2), 1);
        assert(l.indexOf("2"), -1);
        assert(l.indexOf(20), -1);
        assert(l.contains(2), true);
        assert(l.contains("2"), false);
        assert(l.contains(10), false);

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
        assert(l.indexOf(1), -1);
        assert(l.contains(), false);
        assertException(function () { l.insert(100, 1) }, RangeError);

        l.insert(0, 101);
        assert(l.count(), 1);
        assert(l.indexOf(101), 0);

        l.insert(1, 102);
        assert(l.count(), 2);
        assert(l.indexOf(101), 0);
        assert(l.indexOf(102), 1);

        l.insert(0, 103);
        assert(l.count(), 3);
        assert(l.indexOf(101), 1);
        assert(l.indexOf(102), 2);
        assert(l.indexOf(103), 0);


        l = new ListModel([1,2,3,4,5]);
        assert(l.count(), 5);

        var lastRemoved = null,
            lastRemovedIndex = -1,
            removedCounter = 0,
            lastAdded = null,
            addedCounter = 0,
            lastAddedIndex = -1,
            lastSet = null,
            lastSetPrev = null,
            lastSetIndex = -1,
            setCounter = 0,
            ccc = 0;

        l.bind({
            elementRemoved: function(src, e, i) {
                assert(src, l);
                lastRemoved = e;
                lastRemovedIndex = i;
                removedCounter++;
            },

            elementInserted: function(src, e, i) {
                assert(src, l);
                lastAdded = e;
                lastAddedIndex = i;
                addedCounter++;
            },

            elementSet: function(src, e, p, i) {
                assert(src, l);
                lastSet = e;
                lastSetPrev  = p;
                lastSetIndex = i;
                setCounter++;
            }
        });


        l.bind(function(src) {
            ccc++;
            assert(src, l);
        });

        l.add(6);
        assert(l.count(), 6);
        assert(lastAdded, 6);
        assert(lastAddedIndex, 5);
        assert(addedCounter, 1);
        assert(removedCounter, 0);
        assert(setCounter, 0);
        assert(l.get(5), 6);

        l.setAt(5, 77);
        assert(addedCounter, 1);
        assert(removedCounter, 0);
        assert(setCounter, 1);
        assert(lastAdded, 6);
        assert(lastAddedIndex, 5);
        assert(l.count(), 6);
        assert(lastSet, 77);
        assert(lastSetPrev, 6);
        assert(lastSetIndex, 5);
        assert(l.get(5), 77);

        l.removeAt(0);

        assert(lastAdded, 6);
        assert(lastAddedIndex, 5);
        assert(lastSet, 77);
        assert(lastSetPrev, 6);
        assert(lastSetIndex, 5);
        assert(lastRemoved, 1);
        assert(lastRemovedIndex, 0);
        assert(l.count(), 5);
        assert(removedCounter, 1);
        assert(addedCounter, 1);
        assert(setCounter, 1);
        assert(ccc, 3);

        ccc = 0;
        removedCounter = 0;
        l.removeAll();
        assert(lastAdded, 6);
        assert(lastAddedIndex, 5);
        assert(lastSet, 77);
        assert(lastSetPrev, 6);
        assert(lastSetIndex, 5);
        assert(lastRemoved, 2);
        assert(lastRemovedIndex, 0);
        assert(removedCounter, 5);
        assert(addedCounter, 1);
        assert(setCounter, 1);

        assert(l.count(), 0);
        assert(ccc, 5);
    },

    function test_text() {
        var t = new Text("");
        assert(t.getLines(), 1);
        assert(t.getLine(0), "");
        assertException(function() { t.getLine(1); }, RangeError);
        assert(t.getTextLength(), 0);

        t.write("One\nTwo", 0);
        assert(t.getLines(), 2);
        assert(t.getLine(0), "One");
        assert(t.getLine(1), "Two");
        assertException(function() { t.getLine(2); }, RangeError);
        assert(t.getTextLength(), 7);

        t.remove(3,1);
        assert(t.getLines(), 1);
        assert(t.getLine(0), "OneTwo");
        assertException(function() { t.getLine(1); }, RangeError);
        assert(t.getTextLength(), 6);
    },

    function test_singlelinetxt() {
        var t = new SingleLineTxt("");
        assert(t.getLines(), 1);
        assert(t.getLine(0), "");
        assertException(function() { t.getLine(1); }, RangeError);
        assert(t.getTextLength(), 0);

        t.write("One\nTwo", 0);
        assert(t.getLines(), 1);
        assert(t.getLine(0), "One");
        assertException(function() { t.getLine(1); }, RangeError);
        assert(t.getTextLength(), 3);

        t.remove(1,2);
        assert(t.getLines(), 1);
        assert(t.getLine(0), "O");
        assertException(function() { t.getLine(1); }, RangeError);
        assert(t.getTextLength(), 1);
    },

    function test_com_listmodel() {
        if (typeof zebra.ui !== "undefined" && typeof zebra.ui.CompList !== "undefined") {

            var cb = this.assertCallback(function() {
                var l = new zebra.ui.CompList(["1","2","3"]);

                assert(l.count(), 3);
                assert(l.get(0).getValue(), "1");
                assert(l.get(1).getValue(), "2");
                assert(l.get(2).getValue(), "3");

                assertException(function () { l.get(4) }, RangeError);
                assertException(function () { l.get(-1) }, RangeError);
                assertException(function () { l.setAt( -1, "") }, RangeError);
                assertException(function () { l.setAt(3, "") }, RangeError);


                assert(l.indexOf(l.get(1)), 1);
                assert(l.indexOf("2"), -1);
                assert(l.indexOf(20), -1);
                assert(l.contains(l.get(1)), true);
                assert(l.contains("2"), false);
                assert(l.contains(10), false);


                l.add("4");
                assert(l.count(), 4);
                assert(l.get(0).getValue(), "1");
                assert(l.get(1).getValue(), "2");
                assert(l.get(2).getValue(), "3");
                assert(l.get(3).getValue(), "4");

                l.remove(l.get(2));
                assert(l.count(), 3);
                assert(l.get(0).getValue(), "1");
                assert(l.get(1).getValue(), "2");
                assert(l.get(2).getValue(), "4");

                l.removeAt(1);
                assert(l.count(), 2);
                assert(l.get(0).getValue(), "1");
                assert(l.get(1).getValue(), "4");
                l.removeAll();

                assert(l.count(), 0);
                assertException(function () {
                    l.insert(1, "2");
                }, Error);


                l = new zebra.ui.CompList(["1","2","3","4","5"]);
                assert(l.count(), 5);
                var lastRemoved = null,
                    lastRemovedIndex = -1,
                    removedCounter = 0,
                    lastAdded = null,
                    addedCounter = 0,
                    lastAddedIndex = -1,
                    lastSet = null,
                    lastSetPrev = null,
                    lastSetIndex = -1,
                    setCounter = 0,
                    ccc = 0;

                l.bind({
                    elementRemoved: function(src, e, i) {
                        assert(src, l);
                        lastRemoved = e;
                        lastRemovedIndex = i;
                        removedCounter++;
                    },

                    elementInserted: function(src, e, i) {
                        assert(src, l);
                        lastAdded = e;
                        lastAddedIndex = i;
                        addedCounter++;
                    },

                    elementSet: function(src, e, p, i) {
                        assert(src, l);
                        lastSet = e;
                        lastSetPrev  = p;
                        lastSetIndex = i;
                        setCounter++;
                    }
                });


                l.bind(function(src) {
                    ccc++;
                    assert(src, l);
                });

                l.add(6);
                assert(l.count(), 6);
                assert(lastAdded.getValue(), "6");
                assert(lastAddedIndex, 5);
                assert(addedCounter, 1);
                assert(removedCounter, 0);
                assert(setCounter, 0);
                assert(l.get(5).getValue(), "6");

                l.removeAt(0);
                assert(lastAdded.getValue(), "6");
                assert(lastAddedIndex, 5);
                assert(lastSet, null);
                assert(lastSetPrev, null);
                assert(lastSetIndex, -1);
                assert(lastRemoved.getValue(), "1");
                assert(lastRemovedIndex, 0);
                assert(l.count(), 5);
                assert(removedCounter, 1);
                assert(addedCounter, 1);
                assert(setCounter, 0);
                assert(ccc, 2);


                ccc = 0;
                removedCounter = 0;
                l.removeAll();
                assert(lastAdded.getValue(), "6");
                assert(lastAddedIndex, 5);
                assert(lastSet, null);
                assert(lastSetPrev, null);
                assert(lastSetIndex, -1);
                assert(lastRemoved.getValue(), "2");
                assert(lastRemovedIndex, 0);
                assert(removedCounter, 5);
                assert(addedCounter, 1);
                assert(setCounter, 0);

                assert(l.count(), 0);
                assert(ccc, 5);

                // test set that is done as remove/insert combination
                l.add("1");
                addedCounter = 0;
                removedCounter = 0;
                ccc = 0;
                l.setAt(0, "5");
                assert(l.count(), 1);
                assert(l.get(0).getValue(), "5");
                assert(lastAdded.getValue(), "5");
                assert(lastRemoved.getValue(), "1");
                assert(lastRemovedIndex, 0);
                assert(lastAddedIndex, 0);
                assert(addedCounter, 1);
                assert(removedCounter, 1);
                assert(setCounter, 0);
                assert(ccc, 2);
            });

            zebra.ready(function() {
                cb();
            });
        }
        else {
            console.log("Skip UI test ");
        }
    }
);

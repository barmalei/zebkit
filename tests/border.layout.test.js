
if (typeof(zebkit) === "undefined") {
    require('../build/easyoop.js');
    require('../src/js/util/util.js');
    require('../src/js/misc/tools.js');
    require('../src/js/layout/layout.js');
}

eval(zebkit.import("layout"));

var assert = zebkit.assert;


var MIX = [
    function () {
        this.top = this.bottom = this.left = this.right = 0;
    },

    function getTop() {
        return this.top;
    },

    function  getBottom() {
        return this.bottom;
    },

    function  getLeft() {
        return this.left;
    },

    function  getRight() {
        return this.right;
    },

    function setPadding(p) {
        this.top = this.bottom = this.left = this.right = p;
        this.invalidate();
    }
];

function assertMetrics(c,x,y,w,h) {
    assert(c.x, x);
    assert(c.y, y);
    assert(c.width, w);
    assert(c.height, h);
}

zebkit.runTests("BorderLayout test",

    function test_layoutable() {
        var l = new Layoutable();

        assert(l.getTop(), 0);
        assert(l.getLeft(), 0);
        assert(l.getBottom(), 0);
        assert(l.getRight(), 0);
        assertMetrics(l,0,0,0,0);
        assert(l.layout, l);
        assert(l.parent, null);
        assert(l.isVisible, true);
        assert(l.isValid, false);
        assert(l.isLayoutValid, false);
        assert(l.getPreferredSize().width, 10);
        assert(l.getPreferredSize().height, 10);

        assert(l.isValid, true);
        assert(l.isLayoutValid, false);

        l.setSize(10,10);
        l.validate();
        assert(l.isLayoutValid, true);

        l.invalidate()
        assert(l.isValid, false);
        assert(l.isLayoutValid, false);

        l.isVisible = false;
        l.validate();
        assert(l.isValid, true);
        assert(l.isLayoutValid, false);
    },

    function test_borderlayout() {
        var bl = new BorderLayout();
        assert(bl.hgap, 0);
        assert(bl.vgap, 0);

        var bl = new BorderLayout(2,3);
        assert(bl.hgap, 2);
        assert(bl.vgap, 3);

        var bl = new BorderLayout(10);
        assert(bl.hgap, 10);
        assert(bl.vgap, 10);

        function tbl(w, h, hg, vg) {

            var t = new Layoutable();
            t.setLayout(new BorderLayout(hg,vg));
            t.extend(MIX);

            var c = new Layoutable();
            t.add("center", c);

            t.setSize(w, h);

            t.validate();
            assertMetrics(c, 0, 0, w, h);
            t.setPadding(4);
            t.validate();
            assertMetrics(c,t.getLeft(),t.getTop(),w-t.getLeft() - t.getRight(),h-8);

            var l = new Layoutable();
            t.add("left", l);
            t.validate();
            assertMetrics(l,4,4,10,192);
            assertMetrics(c,14,4,182, 192);

            var tp = new Layoutable();
            t.add("top", tp);

            t.validate();
            assertMetrics(l,4,14,10,182);
            assertMetrics(c,14,14,182,182);
            assertMetrics(tp, 4, 4, 192, 10);

            var r = new Layoutable();
            t.add("right", r);

            t.validate();
            assertMetrics(l, 4, 14, 10,182);
            assertMetrics(c, 14, 14, 172, 182);
            assertMetrics(tp, 4,4,192,10);
            assertMetrics(r, 186,14,10,182);

            var bt = new Layoutable();
            t.add("bottom", bt);

            t.validate();
            assertMetrics(l, 4, 14, 10,172);
            assertMetrics(c, 14, 14, 172, 172);
            assertMetrics(tp, 4,4,192,10);
            assertMetrics(r, 186,14,10,172);
            assertMetrics(bt, 4,186,192,10);
        }

        tbl(200,200,0,0);

    }
);

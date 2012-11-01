
(function(pkg, Class, ui) {

var Panel = zebra.ui.Panel;
var rgb = zebra.util.rgb;
var Label = zebra.ui.Label;
var TextField = zebra.ui.TextField;
var FlowLayout = zebra.layout.FlowLayout;
var GridLayout = zebra.layout.GridLayout;
var BorderPan = zebra.ui.BorderPan;
var BorderLayout = zebra.layout.BorderLayout;
var ScrollPan = zebra.ui.ScrollPan;
var Border = zebra.ui.view.Border;
var L = zebra.layout;
var Tree = zebra.ui.tree.Tree;
var Constraints = zebra.layout.Constraints;

function makeTreeModel() {
    var tm = new zebra.data.TreeModel(new zebra.data.Item("Root"));
    tm.add(tm.root, new zebra.data.Item("Item 1"));
    tm.add(tm.root, new zebra.data.Item("Item 2"));
    var ch = new zebra.data.Item("Item 3");
    tm.add(tm.root, ch);
    tm.add(ch, new zebra.data.Item("Item 3.1"));
    tm.add(ch, new zebra.data.Item("Item 3.2"));
    return tm;
}

function makeTreeModel2(items, deepness) {
    function makeBranch(tm, r, items) {
        for(var i=0; i < deepness; i++) {
            var kid = new zebra.data.Item("Long tree item : " + items);
            tm.add(r, kid);
            if (i%2 > 0) r = kid;
            items--;
            if (items <= 0) break;
        }
        return items;
    }

    var tm = new zebra.data.TreeModel(new zebra.data.Item("Root")), r = tm.root;
    while((items = makeBranch(tm, r, items)) > 0);
    return tm;
}

pkg.TreeDemo = new Class(pkg.DemoPan, [
    function() {
        this.$super();

        var p = new Panel(new FlowLayout(L.CENTER, L.TOP, L.HORIZONTAL, 8));
        this.setLayout(new BorderLayout(4,4));

        var t1 = new Tree(makeTreeModel()), p1 = new BorderPan("Standard tree", t1);
        p1.setGaps(6,6);
        p1.setPreferredSize(180, 140);
        t1.select(t1.model.root);

        var t2 = new Tree(makeTreeModel()), p2 = new BorderPan("Custom view tree", t2);
        var fn = new zebra.ui.Font("Arial", 1, 14);
        t2.setViewProvider(new zebra.Dummy([
              function getView(c, i) {
                    var tr = new zebra.ui.TextRender(i.value);
                    if (i.value.indexOf("1") > 0) {
                        tr.setForeground(rgb.red);
                    }

                    if (i.value.indexOf("2") > 0) {
                        tr.setDefBoldFont();
                       // tr.setFont(zebra.ui.Font.);
                    }

                    if (i.value.indexOf("Root") === 0) {
                        return new zebra.ui.CompRender(new zebra.ui.ImageLabel("Root", ui.get("butterfly")));
                    }
                    return tr;
              }
        ]));
        t2.select(t2.model.root);
        p2.setGaps(6,6);
        p2.setPreferredSize(180, 140);

        var t3 = new Tree(makeTreeModel()), p3 = new BorderPan("Editable tree(use enter)", new ScrollPan(t3));
        t3.select(t3.model.root);
        t3.setEditorProvider(new zebra.ui.tree.DefEditors());
        p3.setGaps(6,6);
        p3.setPreferredSize(180, 140);


        var t4 = new Tree(makeTreeModel2(1000, 30)), p4 = new BorderPan("Long tree", new ScrollPan(t4));
        t4.select(t4.model.root);
        p4.setPreferredSize(-1, 210);
        this.add(L.BOTTOM, p4);

        // var t4v = new Class(zebra.ui.TextRender, [
        //     function (s) { this.$super(s); },
        //
        //     function paint(g, x, y, w, h, d) {
        //        // g.setColor(rgb.red);
        //        // g.fillRect(x, y, d.width, h);
        //        // this.$super(g, x, y, w, h, d);
        //     }
        // ]);

        // t4.setViewProvider(new zebra.Dummy([
        //    function getView(c, i) {
        //          return new t4v(i.value);
        //    }
        // ]));

        var ctr = new Constraints();
        this.padding(8);
        p.add(ctr, p1);
        p.add(ctr, p2);
        p.add(ctr, p3);
        this.add(L.CENTER, p);
    }
]);

})(zebra.ui.demo, zebra.Class, zebra.ui);
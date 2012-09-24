
(function(pkg, Class, ui) {

var Panel = zebra.ui.Panel;
var rgb = zebra.util.rgb;
var Label = zebra.ui.Label;
var TextField = zebra.ui.TextField;
var FlowLayout = zebra.layout.FlowLayout;
var GridLayout = zebra.layout.GridLayout;
var BorderPan = zebra.ui.BorderPan;
var ScrollPan = zebra.ui.ScrollPan;
var Border = zebra.ui.view.Border;
var L = zebra.layout;
var Tree = zebra.ui.tree.Tree;
var Constraints = zebra.layout.Constraints;

pkg.DesignerDemo = new Class(pkg.DemoPan, function($) {
    $(function() {
        this.$super();
        this.setLayout(new L.BorderLayout(4,4));
        this.padding(4);

        var pp = new Panel(new zebra.layout.RasterLayout()), lab = new Label("Label");
        lab.setSize(100, 20);
        lab.setLocation(50, 50);
        lab.setBorder(ui.get("br.etched"));
        pp.add(lab);
        new zebra.ui.editors.ShaperPan(lab);

        var b = new zebra.ui.Button("Button");
        b.toPreferredSize();
        b.setLocation(200, 120);
        pp.add(b);
        new zebra.ui.editors.ShaperPan(b);

        var b = new zebra.ui.Checkbox("Checkbox");
        b.toPreferredSize();
        b.setLocation(180, 170);
        pp.add(b);
        new zebra.ui.editors.ShaperPan(b);

        var b = new zebra.ui.ImagePan(ui.get("bmw"));
        b.toPreferredSize();
        b.setLocation(20, 120);
        pp.add(b);
        new zebra.ui.editors.ShaperPan(b);

        var c = new zebra.ui.Panel(new zebra.layout.ListLayout(4));
        var g = new zebra.ui.Group();
        for (var i=0; i<3; i++) c.add(new zebra.ui.Checkbox("Radio " + i, zebra.ui.Checkbox.RADIO));
        var b = new zebra.ui.BorderPan("Border Pan", c);
        b.toPreferredSize();
        b.setLocation(140, 230);
        pp.add(b);
        new zebra.ui.editors.ShaperPan(b);

        var t = new zebra.ui.tree.Tree(new zebra.ui.editors.FormTreeModel(pp, [
            function exclude(c) { return zebra.instanceOf(c, zebra.ui.editors.ShaperPan); }
        ]));

        //!!!!
        var ppp = new Panel();
        ppp.setLocation(220,220);
        ppp.setSize(150,150);
        ppp.setBackground(new zebra.ui.view.View([
              function paint(g, x, y, w, h, target) {
                  var s = 8;
                  g.setColor(rgb.gray);
                  for(var i=0; i < 2*w/s; i++) g.drawLine(x + s*i, y, x, y + s*i);
              }
        ]));
//        pp.add(ppp);

        var s = new zebra.ui.SplitPan(new zebra.ui.ScrollPan(t), pp);
        s.setGripperLoc(220);

        function lookup(p, c) {
            if (p == null) return null;
            var i = p.indexOf(c);
            if (i >= 0) {
                while (p != null && typeof(p) != "undefined") {
                    if (zebra.instanceOf(p, zebra.ui.editors.ShaperPan)) return p;
                    p = p.parent;
                }
            }
            else {
                for(var i=0; i< p.count(); i++) {
                    var r = lookup(p.get(i), c);
                    if (r) return r;
                }
            }
            return null;
        }

        var prev = null, prevCol = null;
        t._.add(function actionPerformed(src, id, data) {
                var c = lookup(pp, data.getComponent());
                if (prev != null) {
                    prev.shaperBr.borderColor = prevCol;
                    prev.repaint();
                }

                prev = c;
                if (c != null) {
                    prevCol = prev.shaperBr.borderColor;
                    prev.shaperBr.borderColor = rgb.red;
                    prev.repaint();
                }
            });

        var l = new Label(new zebra.data.Text("This page represents number of Zebra components to control UI components size and location"));
        l.padding(6);
        l.setFont(ui.get("def.bfn"));
        l.setForeground(ui.get("designer.title.fg"));
        l.setBackground(new zebra.ui.view.Fill(ui.get("designer.title.bg")));

//      s.setBorder(ui.get("br.plain"));
//      l.setForeground(rgb.white);

        this.add(L.TOP, l);
        this.add(L.CENTER, s);
    });
});

})(zebra.ui.demo, zebra.Class, zebra.ui);
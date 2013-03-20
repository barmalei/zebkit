
(function(pkg, Class, ui) {

eval(zebra.Import("ui", "ui.designer", "layout"));

pkg.DesignerDemo = new Class(pkg.DemoPan, [
    function() {
        this.$super();
        this.setLayout(new BorderLayout(4,4));
        this.setPadding(4);

        var pp = new Panel(new RasterLayout()), lab = new Label("Label");
        lab.setSize(100, 20);
        lab.setLocation(50, 50);
        lab.setBorder(ui.borders.etched);
        pp.add(new ShaperPan(lab));

        var b = new Button("Button");
        b.toPreferredSize();
        b.setLocation(200, 120);
        pp.add(new ShaperPan(b));

        var b = new Checkbox("Checkbox");
        b.toPreferredSize();
        b.setLocation(180, 170);
        pp.add(new ShaperPan(b));

        var b = new ImagePan(ui.get("bmw"));
        b.toPreferredSize();
        b.setLocation(20, 120);
        pp.add(new ShaperPan(b));
        
        var b = new ImagePan(ui.get("alpha"));
        b.toPreferredSize();
        b.setLocation(310, 80);
        pp.add(new ShaperPan(b));
        
        var b = new ImagePan(ui.get("saab"));
        b.toPreferredSize();
        b.setLocation(290, 270);
        b.setSize(100, 100);
        pp.add(new ShaperPan(b));

        var b = new Combo(["Item number 1", "Item number 2", "Item number 3"]);
        b.toPreferredSize();
        b.setLocation(290, 270);
        b.select(0);
        pp.add(new ShaperPan(b));

        var c = new Panel(new ListLayout(4));
        var g = new Group();
        for (var i=0; i<3; i++) c.add(new Radiobox("Radio " + i, g));
        var b = new BorderPan("Border Pan", c);
        b.toPreferredSize();
        b.setLocation(140, 230);
        pp.add(new ShaperPan(b));
        

        var t = new zebra.ui.tree.Tree(new FormTreeModel(pp, [
            function exclude(c) { return zebra.instanceOf(c, ShaperPan); }
        ]));

        var s = new SplitPan(new ScrollPan(t), pp);
        s.setGripperLoc(220);

        function lookup(p, c) {
            if (p == null) return null;
            var i = p.indexOf(c);
            if (i >= 0) {
                while (p != null && typeof(p) != "undefined") {
                    if (zebra.instanceOf(p, ShaperPan)) return p;
                    p = p.parent;
                }
            }
            else {
                for(var i=0; i< p.kids.length; i++) {
                    var r = lookup(p.kids[i], c);
                    if (r) return r;
                }
            }
            return null;
        }

        var prev = null, prevCol = null;
        t._.add(function selected(src, data) {
                var c = lookup(pp, data.comp);
                if (prev != null) {
                    prev.setBackground(null);
                }

                prev = c;
                if (c != null) {
                    c.setBackground(new Gradient("#F0F0F0", "#E0E0E0"));
                }
            });

        var l = new Label(new zebra.data.Text("This page represents number of Zebra components to control UI components size and location"));
        l.setPadding(6);
        l.setFont(ui.boldFont);
        this.add(TOP, l);
        this.add(CENTER, s);
    }
]);

})(zebra.ui.demo, zebra.Class, zebra.ui);
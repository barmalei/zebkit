
(function(pkg, Class, ui) {

eval(zebra.Import("ui", "layout"));

pkg.PanelsDemo = new Class(pkg.DemoPan, [
    function() {
        this.$super();
        this.setLayout(new BorderLayout());
        var n = new Tabs(LEFT);
        n.add("Split Panel",  this.createSplitPan());
        n.add("Border Panel", this.createTitledPan());
        n.add("Scroll Panel", this.createScrollPan());
        this.add(CENTER, n);
    },

    function createTitledPan() {
        var r = new Panel(new FlowLayout(CENTER, CENTER)),
            p = new Panel(new GridLayout(4, 3)),
            p1 = new BorderPan("Default title", new Label(""));
        p1.setPreferredSize(130, 130);

        var ll = new Label(""),
            p2 = new BorderPan("Center aligned title", ll, CENTER | TOP);
        p2.setPreferredSize(170, 130);

        var p3 = new BorderPan("Right aligned title", new Label(""), TOP | RIGHT);
        p3.setPreferredSize(170, 130);
        var p4 = new BorderPan("Bottom title", new Label(""), BOTTOM | LEFT);
        p4.setPreferredSize(170, 130);
        var p5 = new BorderPan("Bottom centered title", new Label(""), CENTER | BOTTOM);
        p5.setPreferredSize(170, 130);
        var p6 = new BorderPan("Bottom right title", new Label(""), RIGHT | BOTTOM);
        p6.setPreferredSize(170, 130);
        var p7 = new BorderPan(new ImageLabel("image title", ui.get("butterfly")), new Label(""));
        p7.setPreferredSize(170, 130);
        var p8_1 = new BorderPan("Border pan as title", new Label(""));
        p8_1.setPreferredSize(130, -1);
        var p8 = new BorderPan(p8_1, new Label(""));
        p8.setPreferredSize(170, 130);
        var p9 = new BorderPan(new Checkbox("Checkbox title"), new Label(""));
        p9.setPreferredSize(170, 130);
        var ctr = new Constraints();
        ctr.left = ctr.right = ctr.top = ctr.bottom = 6;
        p.add(ctr, p1);
        p.add(ctr, p2);
        p.add(ctr, p3);
        p.add(ctr, p4);
        p.add(ctr, p5);
        p.add(ctr, p6);
        p.add(ctr, p7);
        p.add(ctr, p8);
        p.add(ctr, p9);
        r.add(p);
        return r;
    },

    function createSplitPan() {
        var p = new Panel(new BorderLayout());
        var s1_1 = new SplitPan(new ImagePan(ui.get("cosmo1")), new ImagePan(ui.get("cosmo2")));
        var s1 = new SplitPan(new ImagePan(ui.get("cosmo3")), s1_1, HORIZONTAL);
        p.setPadding(4);
        s1.setGripperLoc(180);
        s1_1.setGripperLoc(220);
        p.add(CENTER, s1);
        return p;
    },

    function createScrollPan() {
        var rt = new Panel(new FlowLayout(CENTER, CENTER)),
            p = new Panel(new GridLayout(2,2)),
            img = new ImagePan(ui.get("cosmo1")),
            p1 = new ScrollPan(img);

        p1.setPreferredSize(270, 240);
        p1.setBorder(zebra.ui.borders.plain);
        var p2 = new ScrollPan(new ImagePan(ui.get("cosmo1")), VERTICAL);
        p2.setPreferredSize(270, 240);
        p2.setBorder(zebra.ui.borders.plain);

        var p3_1 = new Panel(new zebra.layout.ListLayout(2));
        for(var i=0; i<20; i++) {
            var ch = new Checkbox("Checkbox " + i);
            ch.setLayout(new FlowLayout(LEFT, CENTER, HORIZONTAL, 4));
            p3_1.add(ch);
        }
        p3 = new ScrollPan(p3_1);
        p3.setPreferredSize(270, 190);
        p3.setBorder(zebra.ui.borders.plain);

        var p4_1 = new TextField(new zebra.data.Text(zebra.io.GET("demo/test.txt")));
        p4_1.setBorder(null);
        p4 = new ScrollPan(p4_1);
        p4.setPreferredSize(270, 190);
        p4.setBorder(zebra.ui.borders.plain);

        var ctr = new Constraints();
        ctr.setPadding(6);
        p.add(ctr, p1);
        p.add(ctr, p2);
        p.add(ctr, p3);
        p.add(ctr, p4);
        rt.add(p);
        return rt;
    }
]);

})(zebra.ui.demo, zebra.Class, zebra.ui);
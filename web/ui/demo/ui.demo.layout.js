
(function(pkg, Class) {

eval(zebra.Import("ui", "layout"))

pkg.LayoutDemo = new Class(pkg.DemoPan, [
    function() {
        this.$super();
        this.setLayout(new BorderLayout());
        var n = new Tabs(BOTTOM);
        n.add("Border layout", this.borderLayoutPage());
        n.add("Flow layout", this.flowLayoutPage());
        n.add("List layout", this.listLayoutPage());
        n.add("Percent layout", this.percentLayoutPage());
        n.add("Grid layout", this.gridLayoutPage());
        this.add(CENTER, n);
    },

    function borderLayoutPage() {
        var bl_p = new Panel(new BorderLayout(2,2));
        bl_p.setPadding(4);
        bl_p.add(TOP, new Button("TOP"));
        bl_p.add(BOTTOM, new Button("BOTTOM"));
        bl_p.add(RIGHT, new Button("RIGHT"));
        bl_p.add(LEFT, new Button("LEFT"));
        bl_p.add(CENTER, new Button("CENTER"));
        return bl_p;
    },

    function flowLayoutPage() {
        var fl = new Panel(new ListLayout(4));
        fl.setPadding(4);
        var fl_1 = new Panel(new FlowLayout(LEFT, CENTER, HORIZONTAL, 4));
        var fl_2 = new Panel(new FlowLayout(CENTER, CENTER, HORIZONTAL, 4));
        var fl_3 = new Panel(new FlowLayout(RIGHT, CENTER, HORIZONTAL, 4));
        var fl_4 = new Panel(new FlowLayout(CENTER, CENTER, VERTICAL, 4));
        var fl_5 = new Panel(new FlowLayout(RIGHT, BOTTOM, VERTICAL, 4));
        fl.add(pkg.createBorderPan("Left aligned, horizontal", fl_1));
        fl.add(pkg.createBorderPan("Centered aligned, horizontal", fl_2));
        fl.add(pkg.createBorderPan("Right aligned, horizontal", fl_3));
        fl_1.add(pkg.createLabel("Component 1"));
        fl_2.add(pkg.createLabel("Component 1"));
        fl_3.add(pkg.createLabel("Component 1"));
        fl_4.add(pkg.createLabel("Component 1"));
        fl_5.add(pkg.createLabel("Component 1"));
        fl_1.add(pkg.createLabel("Component 2"));
        fl_2.add(pkg.createLabel("Component 2"));
        fl_3.add(pkg.createLabel("Component 2"));
        fl_4.add(pkg.createLabel("Component 2"));
        fl_5.add(pkg.createLabel("Component 2"));
        fl_1.add(pkg.createLabel("Component 3"));
        fl_2.add(pkg.createLabel("Component 3"));
        fl_3.add(pkg.createLabel("Component 3"));
        fl_4.add(pkg.createLabel("Component 3"));
        fl_5.add(pkg.createLabel("Component 3"));

        var p2 = new Panel(new PercentLayout());
        var ps = fl_5.getPreferredSize();
        fl_4.setPreferredSize(-1, ps.height + 40);
        fl_5.setPreferredSize(-1, ps.height + 40);

        p2.add(50, pkg.createBorderPan("Centered aligned, vertical", fl_4));
        p2.add(50, pkg.createBorderPan("Right-bottom aligned, vertical", fl_5));

        fl.add(p2);
        return fl;
    },

    function listLayoutPage() {
        var ll = new Panel(new ListLayout(4));
        ll.setPadding(4);
        var ll_1 = new Panel(new ListLayout(4));
        ll_1.add(pkg.createLabel("Item 1"));
        ll_1.add(pkg.createLabel("Item 2"));
        ll_1.add(pkg.createLabel("Item 3"));
        var ll_2 = new Panel(new ListLayout(CENTER,4));
        ll_2.add(pkg.createLabel("Item 1"));
        ll_2.add(pkg.createLabel("Item 2"));
        ll_2.add(pkg.createLabel("Item 3"));
        var ll_3 = new Panel(new ListLayout(RIGHT,4));
        ll_3.add(pkg.createLabel("Item 1"));
        ll_3.add(pkg.createLabel("Item 2"));
        ll_3.add(pkg.createLabel("Item 3"));
        ll.add(pkg.createBorderPan("Stretched list items", ll_1));
        ll.add(pkg.createBorderPan("Centered list items", ll_2));
        ll.add(pkg.createBorderPan("Right aligned list items", ll_3));
        return ll;
    },

    function percentLayoutPage() {
        var pl = new Panel(new ListLayout(4));
        pl.setPadding(4);
        var pl_1 = new Panel(new PercentLayout(HORIZONTAL, 4));
        pl_1.add(30, pkg.createLabel("Takes 30%"));
        pl_1.add(50, pkg.createLabel("Takes 50%"));
        pl_1.add(20, pkg.createLabel("Takes 20%"));
        var pl_2 = new Panel(new PercentLayout(VERTICAL, 4));
        pl_2.setPreferredSize(-1, 220);
        pl_2.add(30, pkg.createLabel("Takes 30%"));
        pl_2.add(50, pkg.createLabel("Takes 50%"));
        pl_2.add(20, pkg.createLabel("Takes 20%"));
        pl.add(pkg.createBorderPan("Horizontal percentage", pl_1));
        pl.add(pkg.createBorderPan("Vertical percentage", pl_2));
        return pl;
    },

    function gridLayoutPage() {
        function createLabel(lab, sx, sy) {
            var l = pkg.createLabel(lab);
            var p = l.getPreferredSize();
            l.setPreferredSize(p.width + Math.floor((p.width*sx)/100),
                        p.height + Math.floor((p.height*sy)/100));
            return l;
        }

        var p = new Panel(new FlowLayout(CENTER, CENTER));
        p.setPadding(4);
        p.setPreferredSize(200,200);

        var p1 = new Panel(new GridLayout(2, 2));

        var c = new Constraints();
        c.setPadding(4);
        c.fill = 0;
        c.ax = LEFT;
        c.ay = TOP;
        p1.add(c, createLabel("Left-top aligned", 0, 200));

        c = new Constraints();
        c.setPadding(4);
        c.fill = HORIZONTAL;
        c.ay = BOTTOM;
        p1.add(c, createLabel("Aligned bottom,\nstretched horizontally", 0, 40));

        c = new Constraints();
        c.setPadding(4);
        p1.add(c, createLabel("Stretched both\nvertical and\nhorizontal\ndirections", 30, 180));

        c = new Constraints();
        c.setPadding(4);
        c.fill = 0;
        c.ax = CENTER;
        c.ay = CENTER;
        p1.add(c, createLabel("Centered", 120, 50));

        p.add(pkg.createBorderPan("2x2 grid layout", p1));
        return p;
    }
]);

})(zebra.ui.demo, zebra.Class);
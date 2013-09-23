
(function(pkg, Class, ui) {

eval(zebra.Import("ui", "layout", "ui.grid"));

var CardLayout = new Class(Layout, [
    function doLayout(target){
        var w = target.width, h = target.height;
        for(var i=0; i<target.kids.length; i++) {
            var c = target.kids[i];
            if (c.isVisible) {
                c.toPreferredSize();
                c.setLocation(Math.floor((w - c.width)/2), Math.floor((h - c.height)/2));
            }
        }
    },
    function calcPreferredSize(target){ return getMaxPreferredSize(target); }
]);


function createTooltipDemo() {
    var  p = new Panel(new FlowLayout(CENTER, CENTER, VERTICAL, 16));
    var ccc = "black";
    var f = new Font("Helvetica", "bold", 16);
    var l1 = pkg.createLabel("HONDA\nShow textual\ntooltip", ccc, f);
    var l2 = pkg.createLabel("BMW\nShow fancy tooltip", ccc, f);
    var l3 = pkg.createLabel("SAAB\nShow whatever\nyou want as a tooltip", ccc, f);
    p.add(l1);
    p.add(l2);
    p.add(l3);
    l1.setPreferredSize(180, 120);
    l2.setPreferredSize(180, 120);
    l3.setPreferredSize(180, 120);
    ui.tooltip.setTooltip(l1, new TooltipInfo([
         function getTooltip(target, x, y) {
            var l = pkg.createLabel(" THIS IS just HONDA ", "blue");
            l.setPadding(6);
            l.setBackground("#E0F4FF");
            return l;
         }
    ]));

    ui.tooltip.setTooltip(l2, new TooltipInfo([
         function getTooltip(target, x, y) {
            var b = new Panel({ layout: new FlowLayout(CENTER, TOP) });
            b.setBorder(new TooltipBorder("#3366CC", 2));
            b.setBackground("#E0F4FF");
            b.setPadding(6);
            var pp = new Panel(new FlowLayout(CENTER, CENTER, HORIZONTAL, 2));
            var img = new ImagePan(ui.demo.bmw);
            var l = new Label(new zebra.data.Text("BMW is the best.\nAudi looks similar.\nBeware of imitation :)"));
            l.setColor("#3366CC");
            l.setFont(new Font("Helvetica", 14));
            pp.setPaddings(4, 16, 42, 16);
            pp.add(img);
            pp.add(l)
            b.add(pp);
            return b;
         }
    ]));

    var grid = new Grid([
        [ "Saab", "saab93", "250 km/h" ],
        [ "Saab Jaas 39\nGripen", "gripen", "1400 km/h" ]
    ]);
    grid.setBackground("rgba(224, 244, 255, 0.7)");
    grid.setUsePsMetric(true);
    grid.setHeader(TOP, ["Product", "Picture", "Max speed"]);
    grid.setViewProvider(new DefViews([
        function getView(row, col, data) {
            if (col == 0 || col == 2) {
                var r = new BoldTextRender(new zebra.data.Text(data));
                r.setFont(new Font("Helvetica", "bold", 16));
                if (col==2) r.setColor("red");
                return r;
            }

            if (col == 1) {
                return new Picture(ui.demo[data]);
            }
        }
    ]));

    ui.tooltip.setTooltip(l3, new TooltipInfo([
         function getTooltip(target, x, y) {
            return grid;
         }
    ]));

    return p;
}

function createWindowComp(target) {
    var w = new Window("Demo window"); 
    //w._.add(function actionPerformed(src, id, data) { target.hideWin(); });

    w.setSize(350, 300);
    w.root.setLayout(new BorderLayout());

    var tf = new TextField(new zebra.data.Text(""));
    tf.setFont(new Font("Arial","bold", 18));
    tf.setEditable(false);
    tf.setValue("Drag and drop window\nby its title.\n\nResize window by\ndrag its right-bottom corner");
    w.root.add(CENTER, tf);
    w.root.setPadding(8);

    var p = new Panel(new FlowLayout(CENTER, CENTER));
    var b = new Button("Close");
    b.setPaddings(4,16,4,16);
    p.setPadding(8);
    p.add(b);

    w.root.add(BOTTOM, p);

    b._.add(function(src, id, data) { target.hideWin(); });

    return w;
}

pkg.WinDemo = new Class(pkg.DemoPan,  [
    function() {
        this.$super();
        this.shown = false;
        this.setLayout(new BorderLayout(8,8));
        this.setPadding(8);
        this.add(LEFT, pkg.createBorderPan("Tooltips", createTooltipDemo()));

        var cp = new Panel(new FlowLayout(CENTER, CENTER, VERTICAL, 8));
        this.wp = new Panel(new CardLayout());

        this.ab = new Button("PRESS TO ACTIVATE WINDOW");
        this.w = createWindowComp(this);
        this.ab.setPreferredSize(-1, 50);
        this.w.setEnabled(false);
        this.w.setPreferredSize(350, 300);
        this.wp.add(this.w);
        this.wp.add(this.ab);
        cp.add(this.wp);
        this.add(CENTER, new BorderPan("Window", cp));

        var $t = this;
        this.ab._.add(function actionPerformed(src, id, data) { $t.showWin(); });
    },

    function showWin() {
        if (this.shown) return;
        this.shown = true;
        this.wp.remove(this.w);
        this.wp.remove(this.ab);
        this.w.setLocation(50, 50);
        this.w.setEnabled(true);
        findCanvas(this).getLayer("win").add(this.w);
        findCanvas(this).getLayer("win").activate(this.w);
    },

    function hideWin() {
        if (this.shown)  {
            this.shown = false;
            findCanvas(this).getLayer("win").removeAll();
            this.wp.add(this.w);
            this.wp.add(this.ab);
            this.w.setEnabled(false);
        }
    },

    function activated(b) {
        if (b == false) this.hideWin();
    }
]);

})(zebra.ui.demo, zebra.Class, zebra.ui);
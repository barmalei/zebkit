
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

    var t1 = pkg.createLabel(" THIS IS just HONDA ", "blue");
    t1.setPadding(6);
    t1.setBackground("#E0F4FF");
    l1.tooltip = t1;

    var pp = new Panel(new FlowLayout(CENTER, CENTER, HORIZONTAL, 2));
    var img = new ImagePan(ui.demo.bmw);
    var ll = new Label(new zebra.data.Text("BMW is the best.\nAudi looks similar.\nBeware of imitation :)"));
    ll.setColor("#3366CC");
    ll.setFont(new Font("Helvetica", 14));
    pp.add(img);
    pp.add(ll);
    l2.tooltip = new zebra.ui.Tooltip(pp); 
    l2.tooltip.setBackground("#E0F4FF");

    var grid = new Grid([
        [ "Saab", "saab93", "250 km/h" ],
        [ "Saab Jaas 39\nGripen", "gripen", "1400 km/h" ]
    ]);
    grid.setBackground("rgba(224, 244, 255, 0.7)");
    grid.setUsePsMetric(true);
    grid.add(TOP, new GridCaption(["Product", "Picture", "Max speed"]));
    grid.setViewProvider(new DefViews([
        function getView(target, row, col, data) {
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

    l3.tooltip = grid;

    return p;
}

function createWindowComp(target) {
    var w = new Window("Demo window"); 
    //w.bind(function actionPerformed(src, id, data) { target.hideWin(); });

    w.setSize(350, 300);
    w.root.setLayout(new BorderLayout(4,4));

    var tf = new TextField(new zebra.data.Text(""));
    tf.setFont(new Font("Arial","bold", 18));
    tf.setEditable(false);
    tf.setValue("Drag and drop window\nby its title.\n\nResize window by\ndrag its right-bottom corner");
    
    var center = new Panel(new BorderLayout(4));
    center.add(CENTER, tf);
    center.add(TOP, new Combo(["Combo item 1", "Combo item 2", "Combo item 3"]));
    center.setPadding(8);

    w.root.add(CENTER, center);
    w.root.setPadding(0);

    var p = new Panel(new FlowLayout(CENTER, CENTER));
    var b = new Button("Close");
    b.setPaddings(4,16,4,16);

    b.tooltip = new zebra.ui.Tooltip("Button");


    // b.tooltip = new Label("Button");
    // b.tooltip.setBackground("yellow");
    // b.tooltip.setPadding(6);
    // b.tooltip.setBorder("plain");
    // p.setPadding(8);
    p.add(b);

    w.root.add(BOTTOM, p);

    b.bind(function(src, id, data) { target.hideWin(); });


    w.root.add(TOP, new Menubar({ 
        "MenuItem 1": [ 
            "Item 1.1", "-", "[x]Item 1.2", "[]Item 1.3" 
        ],  
        "MenuItem 2": { 
            "Item 2.1":null, 
            "Item 2.2": [ "Item 2.2.1", "Item 2.2.2" ], 
            "Item 2.3": null  
        },
        "Ok": null 
    }).properties({ border:null }) );

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
        this.ab.bind(function actionPerformed(src, id, data) { $t.showWin(); });
    },

    function showWin() {
        if (this.shown) return;
        this.shown = true;
        this.wp.remove(this.w);
        this.wp.remove(this.ab);
        this.w.setLocation(50, 50);
        this.w.setEnabled(true);
        this.getCanvas().getLayer("win").add(this.w);
        this.getCanvas().getLayer("win").activate(this.w);
    },

    function hideWin() {
        if (this.shown)  {
            this.shown = false;
            this.getCanvas().getLayer("win").removeAll();
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
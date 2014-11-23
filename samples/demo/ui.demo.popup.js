zebra.package("ui.demo", function(pkg, Class) {

eval(zebra.Import("ui", "layout"));
var rgb = zebra.util.rgb, ui = zebra.ui;

function createColorPicker() {
    var m = new Menu(), i = 0;
    m.setLayout(new GridLayout(4, 4));

    for(var k in rgb) {
        if (!(rgb[k] instanceof rgb)) continue;
        if (i > 15) break;
        var p = new Panel();
        p.setPreferredSize(24, 24);
        p.setBorder(ui.borders.plain);
        m.add(new MenuItem(p)).hideSub();
        p.setBackground(rgb[k]);
        i++;
    }
    return m;
}

function formMenuArray() {
    var mbar = {"@(zebra.ui.demo.butterfly) Cars":
                    {
                     "@(zebra.ui.demo.ind1) I prefer bike": null,
                     "@(zebra.ui.demo.ind2) Car options":
                        ["[x]Climate control", "[]Start and stop", "-", "[x]Winter tyre"]
                    },
                "Car color": createColorPicker(),
                "Car brand":
                    [ new ImagePan(zebra.ui.demo.bmw).properties({ padding: 8}),
                      new ImagePan(zebra.ui.demo.saab).properties({ padding: 8}),
                      new ImagePan(zebra.ui.demo.alpha).properties({ padding: 8}) ]
                };
    return mbar;
}

function $get(i, o) {
    for(var k in o) {
        if (o.hasOwnProperty(k)) {
            if (i-- === 0) return o[k];
        }
    }
    return null;
}


function createToolbar() {
    var t = new zebra.ui.Toolbar();

    var img = ui.demo.home;
    var imgPan1 = t.addImage(img);
    t.addImage(ui.demo.mail);
    t.addImage(ui.demo.attachment);

    t.addLine();
    var s = t.addSwitcher("ON/OFF");
    t.addLine();

    var g = new zebra.ui.Group();
    var c1 = t.addRadio(g,"Radio 1");
    var c2 = t.addRadio(g,"Radio 2");
    var c3 = t.addRadio(g,"Radio 3");


    t.bind(function(src) {
        console.log("::: " + src.$clazz.$name + ", src = " + (imgPan1 == src));
    });


    // var m = new zebra.data.ListModel();
    // m.addElement("Item 1");
    // m.addElement("Item 2");
    // m.addElement("Item 3");
    // t.addComboElement(new zebra.ui.List(m));

    return t;
}

pkg.PopupDemo = new Class(pkg.DemoPan, [
    function() {
        this.$super();
        this.setLayout(new BorderLayout(8,8));
        this.setPadding(8);

        var mbar = new Panel(new FlowLayout(CENTER, TOP, HORIZONTAL, 8));
        var c    = new Panel(new BorderLayout());
        var ctr  = new Constraints();

        ctr.setPadding(8);
        c.setPreferredSize(290, 160);
        var mb = new Menubar(formMenuArray());
        mb.setBorder(new Border("lightGray"));
        c.add(TOP, mb);


        var bp = new BorderPan("Top menu bar", c);
        bp.setGaps(8,8);
        mbar.add(ctr, bp);


        var c = new Panel(new BorderLayout());
        c.setPreferredSize(290, 160);

        mb = new Menubar(formMenuArray());
        mb.setBorder(new Border("lightGray"));

        c.add(BOTTOM, mb);

        c = new BorderPan("Bottom menu bar", c);
        c.setGaps(8,8);
        mbar.add(ctr, c);
        this.add(CENTER, mbar);


        var t = createToolbar();
        t = new BorderPan("Horizontal toolbar", t);
        t.setGaps(8,8);
        this.add(TOP, t);

        var p  = new Panel(new FlowLayout(CENTER, CENTER, HORIZONTAL, 8));
        var l1 = pkg.createLabel("Press right mouse\nbutton to see\ncontext menu Cars", rgb.black);
        var l2 = pkg.createLabel("Press right mouse\nbutton to see\ncontext menu Colors", "003366");
        var l3 = pkg.createLabel("Press right mouse\nbutton to see\ncontext menu Brands", "99CC99");
        l1.setFont(new Font("Arial", "bold", 16));
        l2.setFont(new Font("Arial", "bold", 16));
        l3.setFont(new Font("Arial", "bold", 16));
        l1.setPreferredSize(200, 110);
        l2.setPreferredSize(200, 110);
        l3.setPreferredSize(200, 110);
        l1.setBorder(new Border("C3C3E5",2, 3));
        l2.setBorder(new Border("003366",2, 3));
        l3.setBorder(new Border("99CC99",2, 3));
        p.setPreferredSize(-1, 140);
        p.add(l1);
        p.add(l2);
        p.add(l3);

        var m1 = new Menu($get(0, formMenuArray()));
        var m2 = createColorPicker();
        var m3 = new Menu($get(2, formMenuArray()));
        this.add(BOTTOM, new BorderPan("Context menu", p));

        l1.popup = m1;
        l2.popup = m2;
        l3.popup = m3;
    }
]);

});
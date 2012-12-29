
(function(pkg, Class, ui) {

var Panel = zebra.ui.Panel;
var rgb = zebra.util.rgb;
var Label = zebra.ui.Label;
var ImagePan = zebra.ui.ImagePan;
var BorderLayout = zebra.layout.BorderLayout;
var FlowLayout = zebra.layout.FlowLayout;
var GridLayout = zebra.layout.GridLayout;
var BorderPan = zebra.ui.BorderPan;
var Line = zebra.ui.Line;
var Border = zebra.ui.Border;
var L = zebra.layout;
var Checkbox = zebra.ui.Checkbox;
var Menubar = zebra.ui.Menubar;
var Menu = zebra.ui.Menu;
var Constraints = zebra.layout.Constraints;

function createItem(s) {
    if (s[0]=='&') {
        var p = new ImagePan(ui.get(s.substring(1)));
        p.setPadding(4);
        return p;
    }

    if (s == '--') return new Line();
    var j = s.indexOf("|"), i = s.indexOf("+"), k = s.indexOf("-");
    if (i >= 0 || k >=0) {
        var l = new Checkbox(s.substring(i >= 0 ? i+1 : k+1));
        l.setState(i >= 0);
        return l;
    }

    var l = (j > 0) ? new zebra.ui.ImageLabel(s.substring(j+1), ui.get(s.substring(0, j))) : new Label(s);
    l.setPaddings(2,4,2,4);
    if (zebra.instanceOf(l, Label)) l.setFont(ui.boldFont);
    else l.kids[1].setFont(ui.boldFont);
    return l;
}

function createMenubar(items) {
    var MBarBorder =  new Class(zebra.ui.View, [
        function paint(g,x,y,w,h,d){
            g.setColor(zebra.ui.palette.white);
            g.fillRect(x + 2, y, w - 3, h - 1);
            g.setColor(zebra.ui.palette.gray3);
            g.fillRect(x + 2, y + 2, w - 3, Math.floor((h - 6) / 2));
            g.setColor(zebra.ui.palette.gray5);
            g.drawLine(x, y+h-1, x+w, y+h-1);
        }
    ]);

    var mb = new Menubar();
    mb.setBorder(new MBarBorder());

    for(var i=0; i < items.length; i++) {
        if (zebra.instanceOf(items[i], Menu)) mb.setMenuAt(mb.kids.length - 1, items[i]);
        else {
            if (items[i].constructor == Array) {
                mb.setMenuAt(mb.kids.length - 1, createMenu(items[i]));
            }
            else mb.add(createItem(items[i]));
        }
    }
    return mb;
}

function createMenu(items, m) {
    if (typeof(m) === "undefined") {
        m = new Menu();
        var r = createMenu(items, m);
        return r;
    }

    for(var i=0; i < items.length; i++) {
        var item = items[i];
        if (item.constructor == Array) {
            m.setSubmenuAt(m.kids.length - 1, createMenu(item));
        }
        else {
            var it = createItem(item);
            if (zebra.instanceOf(it, Line)) m.addDecorative(it);
            else m.add(it);
        }
    }
    return m;
}

function createColorPicker() {
    var m = new Menu(), i = 0, c = new Constraints();
    c.setPaddings(2,0,2,0);
    m.setLayout(new GridLayout(4, 4));
    for(var k in rgb) {
        if (!(rgb[k] instanceof rgb)) continue;
        if (i > 15) break;
        var p = new Panel();
        p.setPreferredSize(16, 16);
        p.setBorder(ui.borders.plain);
        m.add(c, p);
        p.setBackground(rgb[k]);
        i++;
    }
    return m;
}

function formMenuArray() {
    var mbar = ["butterfly|Cars",
                    ["ind1|I prefer bike",
                     "ind2|Car options",
                        ["+Climate control", "-Start and stop", "--", "+Winter tyre"],
                    ],
                "Car color",
                    createColorPicker(),
                "Car brand",
                    ["&bmw", "&honda", "&peugeot" ]
                ];
    return mbar;
}


function createToolbar() {
    var t = new zebra.ui.Toolbar();
    t.setPadding(6);
    t.setBackground(rgb.lighGray);

   // t.setBorder(null);
    var img = ui.get("home");
    t.addImage(img);
    t.addImage(ui.get("mail"));
    t.addImage(ui.get("attachment"));

    t.addLine();
    var s = t.addSwitcher("ON/OFF");
   // t.setView(s, zebra.ui.Toolbar.PRESSED, ui.borders.plain);
    t.addLine();

    var g = new zebra.ui.Group();
    var c1 = t.addRadio(g,"Radio 1");
    var c2 = t.addRadio(g,"Radio 2");
    var c3 = t.addRadio(g,"Radio 3");
//    t.setView(c1, zebra.ui.Toolbar.PRESSED, ui.get("page"));


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

        var mbar = new Panel(new FlowLayout(L.CENTER, L.TOP, L.HORIZONTAL, 8));
        var c    = new Panel(new BorderLayout());
        var ctr  = new Constraints();

        ctr.setPadding(8);
        c.setBorder(ui.borders.sunken);
        c.setPreferredSize(240, 145);
        var mb = createMenubar(formMenuArray());
        c.add(L.TOP, mb);

        var bp = new BorderPan("Top menu bar", c);
        bp.setGaps(8,8);
        mbar.add(ctr, bp);


        var c = new Panel(new BorderLayout());
        c.setBorder(ui.borders.sunken);
        c.setPreferredSize(240, 145);

        c.add(L.BOTTOM, createMenubar(formMenuArray()));

        c = new BorderPan("Bottom menu bar", c);
        c.setGaps(8,8);
        mbar.add(ctr, c);
        this.add(L.CENTER, mbar);


        var t = createToolbar();
        t = new BorderPan("Horizontal toolbar", t);
        t.setGaps(8,8);
        this.add(L.TOP, t);

        var p  = new Panel(new FlowLayout(L.CENTER, L.CENTER, L.HORIZONTAL, 8));
        var l1 = pkg.createLabel("Press right mouse button\nto see context menu Cars", rgb.red);
        var l2 = pkg.createLabel("Press right mouse button\nto see context menu Colors", rgb.red);
        var l3 = pkg.createLabel("Press right mouse button\nto see context menu Brands", rgb.red);
        l1.setBorder(new Border(1, rgb.red,2));
        l2.setBorder(new Border(1, rgb.blue,2));
        l3.setBorder(new Border(1, rgb.green,2));
        p.setPreferredSize(-1, 60);
        p.add(l1);
        p.add(l2);
        p.add(l3);
        l1.setPreferredSize(-1, 40);
        l2.setPreferredSize(-1, 40);
        l3.setPreferredSize(-1, 40);

        var m1 = createMenu(formMenuArray()[1]);
        var m2 = createColorPicker();
        var m3 = createMenu(formMenuArray()[5]);
        this.add(L.BOTTOM, new BorderPan("Context menu", p));
        zebra.ui.popup.setPopup(l1, new zebra.ui.PopupInfo([
            function getPopup(c, x, y) {
                return m1;
            }
        ]));
        zebra.ui.popup.setPopup(l2, new zebra.ui.PopupInfo([
            function getPopup(c, x, y) { return m2; }
        ]));
        zebra.ui.popup.setPopup(l3, new zebra.ui.PopupInfo([
            function getPopup(c, x, y) { return m3; }
        ]));
    }
]);

})(zebra.ui.demo, zebra.Class, zebra.ui);
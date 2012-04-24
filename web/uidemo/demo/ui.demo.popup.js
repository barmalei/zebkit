
(function(pkg, Class, ui) {

var Panel = zebra.ui.Panel; 
var Color = JAVA.awt.Color;
var Label = zebra.ui.Label; 
var ImagePan = zebra.ui.ImagePan; 
var BorderLayout = zebra.layout.BorderLayout;
var FlowLayout = zebra.layout.FlowLayout; 
var GridLayout = zebra.layout.GridLayout; 
var BorderPan = zebra.ui.BorderPan; 
var Line = zebra.ui.Line; 
var Fill = zebra.ui.view.Fill;
var SimpleBorder = zebra.ui.view.SimpleBorder; 
var Border = zebra.ui.view.Border; 
var L = zebra.layout; 
var Checkbox = zebra.ui.Checkbox;
var MenuBar = zebra.ui.MenuBar;
var Menu = zebra.ui.Menu;
var Constraints = zebra.layout.Constraints;

function createItem(s) {
    if (s[0]=='&') {
        var p = new ImagePan(ui.get(s.substring(1)));
        p.padding(4);
        return p;
    }
    
    if (s == '--') return new Line("br.plain");
    var j = s.indexOf("|"), i = s.indexOf("+"), k = s.indexOf("-");
    if (i >= 0 || k >=0) {
        var l = new Checkbox(s.substring(i >= 0 ? i+1 : k+1));
        l.setState(i >= 0);
        return l;
    }
    
    var l = (j > 0) ? zebra.ui.createImageLabel(s.substring(j+1), ui.get(s.substring(0, j))) : new Label(s);
    l.padding(2,4,2,4);
    if (zebra.instanceOf(l, Label)) l.setFont(ui.get("def.bfn"));
    else l.get(1).setFont(ui.get("def.bfn"));
    return l;
}

function createMenubar(items) {
    var MBarBorder =  new Class(zebra.ui.view.View, [
        function paint(g,x,y,w,h,d){
            g.setColor(zebra.ui.get("col.white"));
            g.fillRect(x + 2, y, w - 3, h - 1);
            g.setColor(zebra.ui.get("col.gray3"));
            g.fillRect(x + 2, y + 2, w - 3, Math.floor((h - 6) / 2));
            g.setColor(zebra.ui.get("col.gray5"));
            g.drawLine(x, y+h-1, x+w, y+h-1);
        }
    ]);
    
    var mb = new MenuBar();
    mb.setBorder(new MBarBorder());
    
    for(var i=0; i < items.length; i++) {
        if (zebra.instanceOf(items[i], Menu)) mb.setMenu(mb.count() - 1, items[i]);
        else {
            if (items[i].constructor == Array) {
                mb.setMenu(mb.count() - 1, createMenu(items[i]));
            }
            else mb.add(createItem(items[i]));
        }
    }
    return mb;
}

function createMenu(items, m) {
    if (typeof(m) === "undefined") { 
        m = new Menu(1); 
        var r = createMenu(items, m);
        return r;
    }
    
    for(var i=0; i < items.length; i++) {
        var item = items[i];
        if (item.constructor == Array) {
            m.setSubMenu(m.count() - 1, createMenu(item));
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
    var m = new Menu(true), i = 0, c = new Constraints();
    c.padding(2,0,2,0);
    m.setLayout(new GridLayout(4, 4));
    for(var k in Fill) {
        if (!zebra.instanceOf(Fill[k], Fill)) continue;
        if (i > 15) break;
        var p = new Panel();
        p.setPSSize(16, 16);
        p.setBorder(ui.get("br.plain"));
        m.add(c, p);
        p.setBackground(Fill[k]);
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
    t.padding(6);
    t.setBackground(Fill.lighGray);

   // t.setBorder(null);
    var img = ui.get("home");
    t.addImage(img);
    t.addImage(ui.get("mail"));
    t.addImage(ui.get("attachment"));
    
    t.addLine();
    var s = t.addSwitcher("ON/OFF");
    t.setView(s, zebra.ui.Toolbar.PRESSED, ui.get("combo.br")); 
    t.addLine();
    
    var g = new zebra.ui.Group();
    var c1 = t.addRadio(g,"Radio 1");
    var c2 = t.addRadio(g,"Radio 2");
    var c3 = t.addRadio(g,"Radio 3");
//    t.setView(c1, zebra.ui.Toolbar.PRESSED, ui.get("page")); 
    
    
    // var m = new zebra.data.List();
    // m.addElement("Item 1");
    // m.addElement("Item 2");
    // m.addElement("Item 3");
    // t.addComboElement(new zebra.ui.List(m));
    return t;
}

pkg.PopupDemo = new Class(pkg.DemoPan, function($) {
    $(function() {
        this.$super();
        this.setLayout(new BorderLayout(8,8));
		this.padding(8);
		
		var mbar = new Panel(new FlowLayout(L.CENTER, L.TOP, L.HORIZONTAL, 8));
		
		var c = new Panel(new BorderLayout()), ctr = new Constraints();
		ctr.padding(8);
		c.setBorder(ui.get("br.sunken"));
		c.setPSSize(240, 145);
		c.add(L.TOP, createMenubar(formMenuArray()));
		c = new BorderPan("Top menu bar", c);
		c.setGaps(8,8);
		mbar.add(ctr, c);

		var c = new Panel(new BorderLayout());
		c.setBorder(ui.get("br.sunken"));
		c.setPSSize(240, 145);
		c.add(L.BOTTOM, createMenubar(formMenuArray()));
		c = new BorderPan("Bottom menu bar", c);
		c.setGaps(8,8);
		mbar.add(ctr, c);
		this.add(L.CENTER, mbar);
		
		var t = createToolbar();
		t = new BorderPan("Horizontal toobar", t);
		t.setGaps(8,8);
		this.add(L.TOP, t);

		
        var p  = new Panel(new FlowLayout(L.CENTER, L.CENTER, L.HORIZONTAL, 8));
		var l1 = pkg.createLabel("Press right mouse button\nto see context menu Cars", Color.red);
		var l2 = pkg.createLabel("Press right mouse button\nto see context menu Colors", Color.red);
		var l3 = pkg.createLabel("Press right mouse button\nto see context menu Brands", Color.red);
		l1.setBorder(new SimpleBorder(1, Color.red,2));
		l2.setBorder(new SimpleBorder(1, Color.blue,2));
		l3.setBorder(new SimpleBorder(1, Color.green,2));
        p.setPSSize(-1, 60);
		p.add(l1);
		p.add(l2);
		p.add(l3);
        l1.setPSSize(-1, 40);
        l2.setPSSize(-1, 40);
        l3.setPSSize(-1, 40);
		
        var m1 = createMenu(formMenuArray()[1]);
        var m2 = createColorPicker();
        var m3 = createMenu(formMenuArray()[5]);
		this.add(L.BOTTOM, new BorderPan("Context menu", p));
		zebra.ui.popup.setPopup(l1, new zebra.ui.PopupInfo([
		    function getPopup(c, x, y) { return m1; }
		]));
		zebra.ui.popup.setPopup(l2, new zebra.ui.PopupInfo([
		    function getPopup(c, x, y) { return m2; }
		]));
		zebra.ui.popup.setPopup(l3, new zebra.ui.PopupInfo([
		    function getPopup(c, x, y) { return m3; }
		]));
    });    
});

})(zebra.ui.demo, zebra.Class, zebra.ui);
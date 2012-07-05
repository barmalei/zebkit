(function() {


(function(pkg, Class) {

var Panel = zebra.ui.Panel; 
var Label = zebra.ui.Label; 
var SimpleBorder = zebra.ui.view.SimpleBorder; 
var BorderPan = zebra.ui.BorderPan; 
var L = zebra.layout; 

pkg.createLabel = function (txt, color) {
    color = color || zebra.ui.get("demo.createLabel.col") || zebra.ui.get("col.gray7");
    var l = new Label(txt.indexOf("\n") >= 0 ? new zebra.data.Text(txt) : txt);
    l.setForeground(color);
    l.setFont(zebra.ui.Font.defaultBold);
    l.setBorder(new SimpleBorder(1, zebra.util.rgb.gray));
    l.padding(4);
    return l;
}

pkg.createBorderPan = function (txt, content, w, h) {
    content = content || new Panel();
    var bp = new BorderPan(txt, content);
    content.padding(4);
    w = w || -1; 
    h = h || -1; 
    bp.setPSSize(w, h);
    return bp;
}

pkg.createLabedComponent = function(title, comp) {
    var content = new Panel(new L.BorderLayout());
    content.setBackground(null);
    var lab = new Label(title);
    lab.setFont(zebra.ui.Font.defaultBold);
    content.add(L.LEFT, lab)
    content.add(L.RIGHT, comp);
    return content;
}

pkg.DemoPan = new Class(Panel, function($) {
    $(function() { 
        this.$super(); 
        this.padding(6);
    });    
    
    $(function activated(b) {});    
});

zebra.ready(function() {
    zebra.ui.$objects.load("demo/demo.properties");
});

})(zebra("ui.demo"), zebra.Class);


(function(pkg, Class) {

var Panel = zebra.ui.Panel; 
var Label = zebra.ui.Label; 
var Button = zebra.ui.Button; 
var BorderLayout = zebra.layout.BorderLayout;
var FlowLayout = zebra.layout.FlowLayout; 
var GridLayout = zebra.layout.GridLayout; 
var ListLayout = zebra.layout.ListLayout; 
var SimpleBorder = zebra.ui.view.SimpleBorder; 
var L = zebra.layout; 
var PercentLayout = zebra.layout.PercentLayout; 
var Tabs = zebra.ui.Tabs;
var Constraints = zebra.layout.Constraints;

pkg.LayoutDemo = new Class(pkg.DemoPan, function($) {
    $(function() {
        this.$super();
        this.setLayout(new BorderLayout());
        var n = new Tabs(L.BOTTOM);
        n.add("Border layout", borderLayoutPage());
        n.add("Flow layout", flowLayoutPage());
        n.add("List layout", listLayoutPage());
        n.add("Percent layout", percentLayoutPage());
        n.add("Grid layout", gridLayoutPage());
        this.add(L.CENTER, n);
    });    
    
    function borderLayoutPage() {
        var bl_p = new Panel(new BorderLayout(2,2));
        bl_p.padding(4);
        bl_p.add(L.TOP, new Button("TOP"));
        bl_p.add(L.BOTTOM, new Button("BOTTOM"));
        bl_p.add(L.RIGHT, new Button("RIGHT"));
        bl_p.add(L.LEFT, new Button("LEFT"));
        bl_p.add(L.CENTER, new Button("CENTER"));
        return bl_p;
    }
    
    function flowLayoutPage() {
        var fl = new Panel(new ListLayout(4));
        fl.padding(4);
        var fl_1 = new Panel(new FlowLayout(L.LEFT, L.CENTER, L.HORIZONTAL, 4)); 
        var fl_2 = new Panel(new FlowLayout(L.CENTER, L.CENTER, L.HORIZONTAL, 4)); 
        var fl_3 = new Panel(new FlowLayout(L.RIGHT, L.CENTER, L.HORIZONTAL, 4)); 
        var fl_4 = new Panel(new FlowLayout(L.CENTER, L.CENTER, L.VERTICAL, 4)); 
        var fl_5 = new Panel(new FlowLayout(L.RIGHT, L.BOTTOM, L.VERTICAL, 4)); 
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
        fl_4.setPSSize(-1, ps.height + 40);
        fl_5.setPSSize(-1, ps.height + 40);
        
        p2.add(50, pkg.createBorderPan("Centered aligned, vertical", fl_4));
        p2.add(50, pkg.createBorderPan("Right-bottom aligned, vertical", fl_5));

        fl.add(p2);
        return fl;
    }
    
    function listLayoutPage() {
        var ll = new Panel(new ListLayout(4));
        ll.padding(4);
        var ll_1 = new Panel(new ListLayout(4));
        ll_1.add(pkg.createLabel("Item 1"));
        ll_1.add(pkg.createLabel("Item 2"));
        ll_1.add(pkg.createLabel("Item 3"));
        var ll_2 = new Panel(new ListLayout(L.CENTER,4));
        ll_2.add(pkg.createLabel("Item 1"));
        ll_2.add(pkg.createLabel("Item 2"));
        ll_2.add(pkg.createLabel("Item 3"));
        var ll_3 = new Panel(new ListLayout(L.RIGHT,4));
        ll_3.add(pkg.createLabel("Item 1"));
        ll_3.add(pkg.createLabel("Item 2"));
        ll_3.add(pkg.createLabel("Item 3"));
        ll.add(pkg.createBorderPan("Stretched list items", ll_1));
        ll.add(pkg.createBorderPan("Centered list items", ll_2));
        ll.add(pkg.createBorderPan("Right aligned list items", ll_3));
        return ll;
    }
    
    function percentLayoutPage() {
        var pl = new Panel(new ListLayout(4));
        pl.padding(4);
        var pl_1 = new Panel(new PercentLayout(L.HORIZONTAL, 4));
        pl_1.add(30, pkg.createLabel("Takes 30%"));
        pl_1.add(50, pkg.createLabel("Takes 50%"));
        pl_1.add(20, pkg.createLabel("Takes 20%"));
        var pl_2 = new Panel(new PercentLayout(L.VERTICAL, 4));
        pl_2.setPSSize(-1, 220);
        pl_2.add(30, pkg.createLabel("Takes 30%"));
        pl_2.add(50, pkg.createLabel("Takes 50%"));
        pl_2.add(20, pkg.createLabel("Takes 20%"));
        pl.add(pkg.createBorderPan("Horizontal percentage", pl_1));
        pl.add(pkg.createBorderPan("Vertical percentage", pl_2));
        return pl;
    }
    
    function gridLayoutPage() {
        function createLabel(lab, sx, sy) {
            var l = pkg.createLabel(lab);
            var p = l.getPreferredSize();
            l.setPSSize(p.width + Math.floor((p.width*sx)/100), 
                        p.height + Math.floor((p.height*sy)/100));
            return l;
        }

        var p = new Panel(new FlowLayout(L.CENTER, L.CENTER));
        p.padding(4);
        p.setPSSize(200,200);

        var p1 = new Panel(new GridLayout(2, 2));
        
        var c = new Constraints();
        c.padding(4);
        c.fill = 0;
        c.ax = L.LEFT;
        c.ay = L.TOP;
        p1.add(c, createLabel("Left-top aligned", 0, 200));

        c = new Constraints();
        c.padding(4);
        c.fill = L.HORIZONTAL;
        c.ay = L.BOTTOM;
        p1.add(c, createLabel("Aligned bottom,\nstretched horizontally", 0, 40));

        c = new Constraints();
        c.padding(4);
        p1.add(c, createLabel("Stretched both\nvertical and\nhorizontal\ndirections", 30, 180));

        c = new Constraints();
        c.padding(4);
        c.fill = 0;
        c.ax = L.CENTER;
        c.ay = L.CENTER;
        p1.add(c, createLabel("Centered", 120, 50));
        
        p.add(pkg.createBorderPan("2x2 grid layout", p1));
        return p;
    }
});

})(zebra.ui.demo, zebra.Class);


(function(pkg, Class, ui) {

var Panel = zebra.ui.Panel; 
var BorderPan = zebra.ui.BorderPan; 
var Label = zebra.ui.Label; 
var Button = zebra.ui.Button; 
var FlowLayout = zebra.layout.FlowLayout; 
var GridLayout = zebra.layout.GridLayout; 
var ListLayout = zebra.layout.ListLayout; 
var SimpleBorder = zebra.ui.view.SimpleBorder; 
var Gradient = zebra.ui.view.Gradient; 
var L = zebra.layout; 
var PercentLayout = zebra.layout.PercentLayout; 
var Tabs = zebra.ui.Tabs;
var Checkbox = zebra.ui.Checkbox;
var ImagePan = zebra.ui.ImagePan;
var Link = zebra.ui.Link;
var rgb = zebra.util.rgb;
var List = zebra.ui.List;
var CompList = zebra.ui.CompList;
var Slider = zebra.ui.Slider;
var Progress = zebra.ui.Progress;
var TextField = zebra.ui.TextField;
var Constraints = zebra.layout.Constraints;

pkg.BasicUIDemo = new Class(pkg.DemoPan, function($) {
    $(function() {
        this.$super();
        this.setLayout(new FlowLayout(L.CENTER, L.CENTER));
        var r = new Panel(new L.BorderLayout(8,4));
        
        var p = new Panel(new GridLayout(3, 2)), ctr = new Constraints(); 
        ctr.padding(6);
        ctr.fill   = L.HORIZONTAL | L.VERTICAL;
        p.add(ctr, createCheckboxPan(3, true));
        p.add(ctr, createCheckboxPan(3, false));
        p.add(ctr, createTextFieldPan());
        p.add(ctr, createMTextFieldPan());
        p.add(ctr, createProgressPan());
        p.add(ctr, createSliderPan());
        
        var p_c = new Panel(new L.BorderLayout(4, 4));
        p_c.add(L.CENTER, p);
        p_c.add(L.BOTTOM, createButtonPan());
        
        var p_w = new Panel(new ListLayout(8));
        p_w.add(createComboPan());
        p_w.add(createListPan());

        r.add(L.LEFT, p_w);
        r.add(L.CENTER, p_c);
        
        this.add(r);
    });    
    
    function createTextFieldPan() {
        var p = new Panel(new ListLayout(6));
        p.setBackground(null);
        var tf = new TextField();
        tf.setPSSize(100, -1);
        p.add(pkg.createLabedComponent("Text field:", tf));
        tf = new TextField(new zebra.data.SingleLineTxt("dsd", 5));
        tf.setPSSize(100, -1);
        p.add(pkg.createLabedComponent("Fixed size(5):", tf));
        tf = new TextField(new zebra.ui.view.PasswordText());
        tf.setPSSize(100, -1);
        p.add(pkg.createLabedComponent("Password field:", tf));
        return pkg.createBorderPan("Text fields", p);
    }
    
    function createMTextFieldPan() {
        var p = new Panel(new L.BorderLayout());
        p.setBackground(null);
        var tf = new TextField(new zebra.data.Text("Multiline\ntext field\ncomponents"));
        tf.setPSSize(150, 70);
        p.add(L.CENTER, tf);
        return pkg.createBorderPan("Multilines text field", p);
    }

    function createSliderPan() {
        var p = new Panel(new L.BorderLayout());
        p.setBackground(null);
        var sl = new Slider();
        sl.setPSSize(90, -1);
        p.add(L.CENTER, sl);
        return pkg.createBorderPan("Slider", p);
    }

    function createProgressPan() {
        var p = new Panel(new FlowLayout(L.CENTER, L.CENTER, L.VERTICAL, 16));
        p.setBackground(null);
        var pr1 = new Progress();
        pr1.setPSSize(130, -1);
        pr1.setMaxValue(10);
        pr1.setValue(3);
        var pr2 = new Progress();
        pr2.setMaxValue(4);
        pr2.setValue(1);
        pr2.setView(Progress.BUNDLE_VIEW, new Gradient(rgb.lightGray, rgb.darkGray, L.HORIZONTAL));
        pr2.setPSSize(130, 12);
        pr2.setBundleWidth(70);
        p.add(pr1);
        p.add(pr2);
        return pkg.createBorderPan("Progress", p);
    }

    function createButtonPan() {
        var p = new Panel(new FlowLayout(L.CENTER, L.CENTER, L.HORIZONTAL, 8));
        p.setBackground(null);
        p.add(new Button("Button"));
		var bt = new Button(new ImagePan(ui.get("butterfly")));
		bt.setFocusMarkerView(null);
        p.add(bt);
        p.add(new Button(zebra.ui.createImageLabel("Image button", ui.get("butterfly"))));
        bt = new Button("Disabled button");
        bt.setEnabled(false); 
        p.add(bt);
        p.add(new Link("Link"));
        return pkg.createBorderPan("Buttons", p);
    }

    function createListPan() {
        var p = new Panel(new ListLayout(8));
        p.setBackground(null);
        var m = new zebra.data.ListModel();
        m.addElement("Item 1");
        m.addElement("Item 2");
        m.addElement("Item 3");
        var l = new zebra.ui.List();
        l.setModel(m);
        l.select(0);
        var lbp = new BorderPan("Simple list", l);
        lbp.setGaps(6,6);
        p.add(lbp);
        var l = new zebra.ui.CompList();
        l.add(new Label("Label Item"));
        l.add(new Checkbox("Checkbox Item"));
        l.add(new zebra.ui.createImageLabel("Image Label Item", ui.get("butterfly")));
        var lbp = new BorderPan("Components list", l);
        lbp.setGaps(6,6);
        p.add(lbp);
        l.select(0);
        
        var bp = pkg.createBorderPan("List", p)
        bp.setGaps(4,4);
        return bp;
    }
    
    function createCheckboxPan(n, t) {
        var p = new Panel(new FlowLayout(L.CENTER, L.CENTER, L.VERTICAL, 4));
	    var s = t ? "Radio button " : "Checkbox button ", g = t ? new zebra.ui.Group() : null;
	    p.setBackground(null);
	    
	    for(var i=0; i < n;  i++) {
	        var ch = new Checkbox(s + (i+1), t?Checkbox.RADIO:Checkbox.CHECK); 
            p.add(ch);
	        if (g !=null) ch.setSwitchManager(g);
	    }
        return pkg.createBorderPan(s, p);
    }
    
    function createComboPan() {
        var p = new Panel(new ListLayout(8));
        p.setBackground(null);
        var cb = new zebra.ui.Combo();
        cb.list.model.addElement("Item 1");
        cb.list.model.addElement("Item 2");
        cb.list.model.addElement("Item 3");
        cb.list.select(0);
        p.add(cb);
        
        var cb2 = new zebra.ui.Combo();
        cb2.setContentPan(new zebra.ui.Combo.EditableContentPan());
        cb2.list.model.addElement("Item 1");
        cb2.list.model.addElement("Item 2");
        cb2.list.model.addElement("Item 3");
        var ps= cb2.getPreferredSize();
        cb2.setPSSize(ps.width, -1);
        p.add(cb2);

        var l = new CompList(true);
        l.add(zebra.ui.createImageLabel("Item 1", ui.get("ind1")));
        l.add(zebra.ui.createImageLabel("Item 2", ui.get("ind1")));
        l.add(zebra.ui.createImageLabel("Item 3", ui.get("ind2")));
        var cb3 = new zebra.ui.Combo(l);
        cb3.list.select(0);
        p.add(cb3);

        var bp = pkg.createBorderPan("Drop down list", p);
        bp.setGaps(4,8);
        return bp;
    }
});

})(zebra.ui.demo, zebra.Class, zebra.ui);


(function(pkg, Class, ui) {

var Panel = zebra.ui.Panel; 
var Label = zebra.ui.Label; 
var TextField = zebra.ui.TextField; 
var BorderLayout = zebra.layout.BorderLayout;
var FlowLayout = zebra.layout.FlowLayout; 
var GridLayout = zebra.layout.GridLayout; 
var BorderPan = zebra.ui.BorderPan; 
var SplitPan = zebra.ui.SplitPan; 
var ScrollPan = zebra.ui.ScrollPan; 
var SimpleBorder = zebra.ui.view.SimpleBorder; 
var Border = zebra.ui.view.Border; 
var L = zebra.layout; 
var Tabs = zebra.ui.Tabs;
var ImagePan = zebra.ui.ImagePan;
var Checkbox = zebra.ui.Checkbox;
var Constraints = zebra.layout.Constraints;

pkg.PanelsDemo = new Class(pkg.DemoPan, function($) {
    $(function() {
        this.$super();
        this.setLayout(new BorderLayout());
        var n = new Tabs(L.LEFT);
		n.add("Split Panel", createSplitPan());
        n.add("Border Panel", createTitledPan());
        n.add("Scroll Panel", createScrollPan());
        this.add(L.CENTER, n);
    });    

    function createTitledPan() {
        var r = new Panel(new FlowLayout(L.CENTER, L.CENTER));
		var p = new Panel(new GridLayout(4, 3));
		var p1 = new BorderPan("Default title", new Label(""));
		p1.setPSSize(130, 100);
		
		var ll = new Label("");
		var p2 = new BorderPan("Center aligned title", ll);
		p2.setXAlignment(L.CENTER);
		p2.setPSSize(150, 100);
		
		var p3 = new BorderPan("Right aligned title", new Label(""));
		p3.setXAlignment(L.RIGHT);
		p3.setPSSize(130, 100);
		var p4 = new BorderPan("Bottom title", new Label(""));
		p4.setTitleAlignment(L.BOTTOM);
		p4.setPSSize(130, 100);
		var p5 = new BorderPan("Bottom centered title", new Label(""));
		p5.setXAlignment(L.CENTER);
		p5.setTitleAlignment(L.BOTTOM);
		p5.setPSSize(150, 100);
		var p6 = new BorderPan("Bottom right title", new Label(""));
		p6.setXAlignment(L.RIGHT);
		p6.setTitleAlignment(L.BOTTOM);
		p6.setPSSize(130, 100);
		var p7 = new BorderPan(zebra.ui.createImageLabel("image title", ui.get("butterfly")), new Label(""));
		p7.setPSSize(130, 100);
		var p8_1 = new BorderPan("Border pan as title", new Label(""));
		p8_1.setPSSize(120, -1);
		var p8 = new BorderPan(p8_1, new Label(""));
		p8.setPSSize(150, 100);
		var p9 = new BorderPan(new Checkbox("Checkbox title"), new Label(""));
		p9.setPSSize(130, 100);
		var ctr = new Constraints(); 
		ctr.padding(6);
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
	}
    
    function createSplitPan() {
		var p = new Panel(new BorderLayout());
        var s1_1 = new SplitPan(new ImagePan(ui.get("cosmo1")), new ImagePan(ui.get("cosmo2")));
        var s1 = new SplitPan(new ImagePan(ui.get("cosmo3")), s1_1, L.HORIZONTAL);
		p.padding(4);
		s1.setGripperLoc(150);
		s1_1.setGripperLoc(150);
		p.add(L.CENTER, s1);
		return p;
    }
    
    function createScrollPan() {
        var rt = new Panel(new FlowLayout(L.CENTER, L.CENTER));
        var p = new Panel(new GridLayout(2,2));
		var img = new ImagePan(ui.get("cosmo1"));
		var p1 = new ScrollPan(img);
		p1.setPSSize(220, 180);
		p1.setBorder(new Border(3));
		var p2 = new ScrollPan(new ImagePan(ui.get("cosmo1")), L.VERTICAL);
		p2.setPSSize(220, 180);
		p2.setBorder(new Border(3));

		var p3_1 = new Panel(new zebra.layout.ListLayout(2));
		p3_1.setBackground(null);
		for(var i=0; i<20; i++) { 
		    var ch = new Checkbox("Checkbox " + i);
		    ch.setLayout(new FlowLayout(L.LEFT, L.CENTER, L.HORIZONTAL, 4));
		    p3_1.add(ch);
		}
		p3 = new ScrollPan(p3_1);
		p3.setPSSize(220, 145);
		p3.setBorder(new Border(3));
		
		var p4_1 = new TextField(new zebra.data.Text(zebra.io.readTextFile("demo/test.txt")));
		p4 = new ScrollPan(p4_1);
		p4.setPSSize(220, 145);
		p4.setBorder(new Border(3));

		var ctr = new Constraints(); 
		ctr.padding(6);
		p.add(ctr, p1);
		p.add(ctr, p2);
		p.add(ctr, p3);
		p.add(ctr, p4);
		rt.add(p);
		return rt;
    }
});

})(zebra.ui.demo, zebra.Class, zebra.ui);


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
var SimpleBorder = zebra.ui.view.SimpleBorder; 
var Border = zebra.ui.view.Border; 
var L = zebra.layout; 
var Tree = zebra.ui.tree.Tree;
var Constraints = zebra.layout.Constraints;

function makeTreeModel() {
    var tm = new zebra.data.TreeModel(new zebra.data.Item("Root"));
    tm.add(tm.root, new zebra.data.Item("Item 1"));
    tm.add(tm.root, new zebra.data.Item("Item 2"));
    var ch = new zebra.data.Item("Item 3")
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

pkg.TreeDemo = new Class(pkg.DemoPan, function($) {
    $(function() {
        this.$super();
        
        var p = new Panel(new FlowLayout(L.CENTER, L.TOP, L.HORIZONTAL, 8));
        this.setLayout(new BorderLayout(4,4));

        var t1 = new Tree(makeTreeModel()), p1 = new BorderPan("Standard tree", t1);
		p1.setGaps(6,6);
		p1.setPSSize(180, 140);
		t1.select(t1.model.root);
      	
      	var t2 = new Tree(makeTreeModel()), p2 = new BorderPan("Custom view tree", t2);
		t2.setViewProvider(new zebra.ui.view.ViewProvider([
			  function getView(c, i) {
					var tr = new zebra.ui.view.TextRender(i.value);
					if (i.value.indexOf("1") > 0) {
						tr.setForeground(rgb.red);
					}
					if (i.value.indexOf("2") > 0) {
						tr.setDefBoldFont();
					}
					if (i.value.indexOf("Root") == 0) {
						return new zebra.ui.view.CompRender(zebra.ui.createImageLabel("Root", ui.get("butterfly")));
					}
					return tr;
			  }
		]));
		t2.select(t2.model.root);
		p2.setGaps(6,6);
		p2.setPSSize(180, 140);

      	var t3 = new Tree(makeTreeModel()), p3 = new BorderPan("Editable tree(use enter)", new ScrollPan(t3));
        t3.select(t3.model.root);
		t3.setEditorProvider(new zebra.ui.tree.DefEditors());
		p3.setGaps(6,6);
		p3.setPSSize(180, 140);


      	var t4 = new Tree(makeTreeModel2(1000, 30)), p4 = new BorderPan("Long tree", new ScrollPan(t4));
        t4.select(t4.model.root);
        p4.setPSSize(-1, 210);
	    this.add(L.BOTTOM, p4);
        
        // var t4v = new Class(zebra.ui.view.TextRender, [
        //     function (s) { this.$super(s); }, 
        //     
        //     function paint(g, x, y, w, h, d) {
        //        // g.setColor(rgb.red);
        //        // g.fillRect(x, y, d.width, h);
        //        // this.$super(g, x, y, w, h, d);
        //     }
        // ]); 

        // t4.setViewProvider(new zebra.ui.view.ViewProvider([
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
    });    
});

})(zebra.ui.demo, zebra.Class, zebra.ui);


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
    
    
    // var m = new zebra.data.ListModel();
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
		var l1 = pkg.createLabel("Press right mouse button\nto see context menu Cars", rgb.red);
		var l2 = pkg.createLabel("Press right mouse button\nto see context menu Colors", rgb.red);
		var l3 = pkg.createLabel("Press right mouse button\nto see context menu Brands", rgb.red);
		l1.setBorder(new SimpleBorder(1, rgb.red,2));
		l2.setBorder(new SimpleBorder(1, rgb.blue,2));
		l3.setBorder(new SimpleBorder(1, rgb.green,2));
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


(function(pkg, Class, ui) {

var Panel = zebra.ui.Panel; 
var rgb = zebra.util.rgb;
var Label = zebra.ui.Label; 
var TextField = zebra.ui.TextField; 
var BorderLayout = zebra.layout.BorderLayout;
var FlowLayout = zebra.layout.FlowLayout; 
var GridLayout = zebra.layout.GridLayout; 
var BorderPan = zebra.ui.BorderPan; 
var ScrollPan = zebra.ui.ScrollPan; 
var SimpleBorder = zebra.ui.view.SimpleBorder; 
var Border = zebra.ui.view.Border; 
var L = zebra.layout; 
var Tree = zebra.ui.tree.Tree;
var Constraints = zebra.layout.Constraints;

var CardLayout = new Class(L.Layout, function($) {
    $(function doLayout(target){
        var w = target.width, h = target.height;
        for(var i=0; i<target.count(); i++) {
            var c = target.get(i);
            if (c.isVisible) {
                c.toPreferredSize();
                c.setLocation(Math.floor((w - c.width)/2), Math.floor((h - c.height)/2));
            }
        }
    });

    $(function calcPreferredSize(target){ return zebra.layout.getMaxPreferredSize(target); });
});


var FL = Class(zebra.ui.BaseLayer, [
    function() {
        this.$super("TEST");
        this.isActive = false;
        this.setBackground(null);
    },
    
    function layerKeyPressed(code, mask) {
        var rm = zebra.ui.KeyEvent.CTRL + zebra.ui.KeyEvent.SHIFT + zebra.ui.KeyEvent.ALT;
        if ((rm & mask) == rm) {
             if (this.isActive) this.setBackground(null);
             else  this.setBackground(new zebra.ui.view.Fill(new rgb(255,255,255, 0.7)));
             this.isActive = ! this.isActive;
        }
    },
          
   function isLayerActive(){ return this.isActive;},
   function isLayerActiveAt(x,y){return this.isActive; }
]);


function createTooltipDemo() {
    var  p = new Panel(new FlowLayout(L.CENTER, L.CENTER, L.VERTICAL, 16));
    var ccc = zebra.ui.get("tooltiparea.fg");
    var l1 = pkg.createLabel("HONDA\nShow textual\ntooltip", ccc);
    var l2 = pkg.createLabel("BMW\nShow image\ntooltip", ccc);
    var l3 = pkg.createLabel("PEUGEOT\nShow combined\ntooltip", ccc);
    p.add(l1);
    p.add(l2);
    p.add(l3);
    l1.setPSSize(120, 90);
    l2.setPSSize(120, 90);
    l3.setPSSize(120, 90);
	ui.tooltip.setTooltip(l1, new zebra.ui.TooltipInfo(function($) {
		 $(function getTooltip(target, x, y) {
		    var l = pkg.createLabel(" THIS IS HONDA ", rgb.blue);  
		    l.setBackground(new zebra.ui.view.Fill(ui.get("col.gray7")));
			return l;
	 	 });
	}));

	ui.tooltip.setTooltip(l2, new zebra.ui.TooltipInfo(function($) {
		 $(function getTooltip(target, x, y) {
		    var b = new zebra.ui.ImagePan(ui.get("bmw"));
		    b.setBorder(new SimpleBorder(1));
			return b;
	 	 });
	}));


	ui.tooltip.setTooltip(l3, new zebra.ui.TooltipInfo(function($) {
		 $(function getTooltip(target, x, y) {
 		    var l = zebra.ui.createImageLabel("Peugeot", ui.get("peugeot"));
 		    l.setBackground(zebra.ui.view.Fill.white, true);
            l.padding(4);
            l.setBorder(new SimpleBorder(1));
			return l
	 	 });
	}));
	
    return p;
}

function createWindowComp(target) {
    var w = new zebra.ui.Window("Demo window", function($) {
        $(function (t) {
           this.$super(t);
        });
        
        $(function actionPerformed(src, id, data) {
            target.hideWin();
        });
    });
    
    w.setSize(350, 300);
    w.root.setLayout(new BorderLayout());
    
    var tf = new zebra.ui.TextField(new zebra.data.Text(""));
    tf.setFont(new zebra.ui.Font("Arial","bold", 18));
    tf.setEditable(false);
    tf.setText("Drag and drop window\nby its title.\n\nResize window by\ndrag its right-bottom corner");
    w.root.add(L.CENTER, tf);
    w.root.padding(8);
    
    var p = new Panel(new FlowLayout(L.CENTER, L.CENTER));
    var b = new zebra.ui.Button("Close");
    b.padding(4,16,4,16);
    p.padding(8);
    p.add(b);
    
    w.root.add(L.BOTTOM, p);

	b._.add(function actionPerformed(src, id, data) { target.hideWin(); });
    
    return w;
}

pkg.WinDemo = new Class(pkg.DemoPan, function($) {
    $(function() {
        this.$super();
        this.shown = false;
        this.setLayout(new BorderLayout(8,8));
		this.padding(8);
		this.add(L.LEFT, pkg.createBorderPan("Tooltips", createTooltipDemo()));

        var cp = new Panel(new FlowLayout(L.CENTER, L.CENTER, L.VERTICAL, 8));
        this.wp = new Panel(new CardLayout());
        
        this.ab = new zebra.ui.Button("PRESS TO ACTIVATE WINDOW");
        this.w = createWindowComp(this);
        this.ab.setPSSize(-1, 50);
        this.w.setEnabled(false);
        this.w.setPSSize(350, 300);
        this.wp.add(this.w);
        this.wp.add(this.ab);
        cp.add(this.wp);
		this.add(L.CENTER, new BorderPan("Window", cp));
		
		
		
		var $t = this;
		this.ab._.add(function actionPerformed(src, id, data) { $t.showWin(); });
    });    
    
    $(function showWin() {
//        !!!
      //  var v = zebra.ui.getDesktop(this);
        //v.add(new FL());

        if (this.shown) return;
        this.shown = true;
        this.wp.remove(this.w);
        this.wp.remove(this.ab);
        this.w.setLocation(50, 50);
        this.w.setEnabled(true);
        zebra.ui.getDesktop(this).getLayer("win").add(this.w);
        zebra.ui.getDesktop(this).getLayer("win").activate(this.w);
    });

    $(function hideWin() {
        if (!this.shown) return;
        this.shown = false;
        zebra.ui.getDesktop(this).getLayer("win").removeAll();
        this.wp.add(this.w);
        this.wp.add(this.ab);
        this.w.setEnabled(false);
    });
    
    $(function activated(b) {
        if (b == false) this.hideWin();
    });
});

})(zebra.ui.demo, zebra.Class, zebra.ui);


(function(pkg, Class, ui) {


var Matrix = zebra.data.Matrix;
var Panel = zebra.ui.Panel;
var Label = zebra.ui.Label;
var L = zebra.layout;
var FlowLayout = zebra.layout.FlowLayout;
var Grid  = zebra.ui.grid.Grid;
var Checkbox  = zebra.ui.Checkbox;
var Combo  = zebra.ui.Combo;
var DefViews = zebra.ui.grid.DefViews;
var DefEditors = zebra.ui.grid.DefEditors;
var GridCaption = zebra.ui.grid.GridCaption;
var BorderPan = zebra.ui.BorderPan;
var RasterLayout = zebra.layout.RasterLayout;
var TextRender = zebra.ui.view.TextRender;
var Fill = zebra.ui.view.Fill;
var rgb = zebra.util.rgb;
var TreeModel = zebra.data.TreeModel;
var Tree = zebra.ui.tree.Tree;
var Item = zebra.data.Item;
var Tabs = zebra.ui.Tabs;
var CompRender = zebra.ui.view.CompRender;
var CompList = zebra.ui.CompList;
var ImagePan = zebra.ui.ImagePan;
var GridLayout = zebra.layout.GridLayout;
var BorderLayout = zebra.layout.BorderLayout;
var Link = zebra.ui.Link;

function wrapWithPan() {
    var p = new Panel(new FlowLayout(L.CENTER, L.TOP, L.VERTICAL, 16));
    p.padding(8);
    for(var i=0; i< arguments.length; i++) p.add(arguments[i]);
    return p;
}

pkg.GridBooleanEditor = new Class([
        function getEditor(t, r,c,o){
            if(c != 2) return null;
            var state = o != null && o == "Yes", box = new Checkbox();
            box.setState(state);
            return box;
        },
        function fetchEditedValue(row,col,data,c){ return c.getState() ? "Yes" : "No"; },
        function shouldDo(action,row,col,e){ return a == grid.START_EDITING; },
        function editingCanceled(row,col,data,editor){}
]);

var colors = [ [rgb.white, rgb.lightGray, rgb.white],  
               [rgb.orange, rgb.black, rgb.orange], 
               [rgb.white, rgb.lightGray, rgb.white] ];

var ColumnsAlignmentProvider = new Class(DefViews, [    
    function (){ this.$super(); },
    
    function getView(row,col,data){ 
        var tf = new TextRender(data);
        if (row == 1 && col == 1) {
            tf.setDefBoldFont();
            tf.setForeground(rgb.white);
        }
        return tf;
    },

    function getXAlignment(row,col){
        if(col == 0) return L.LEFT;
        else
            if(col == 1) return L.CENTER;
            else if(col == 2) return L.RIGHT;
        return this.$super(this.getXAlignment,row, col);
    },

    function getYAlignment(row,col){
        if(row == 0) return L.TOP;
        else
            if(row == 1) return L.CENTER;
            else if(row == 2) return L.BOTTOM;
        return this.$super(this.getYAlignment,row, col);
    },
    
    function getCellColor(row,col) { 
        return colors[row][col];
    }
]);

var IMAGES = [ "android", "google", "yelp", "gmail" ];
var CustomGridEditor = new Class(DefEditors, [
        function() {
            var ExtEditor = new Class(Panel, zebra.ui.ExternalEditor, [
                function() {
                    this.$super(new BorderLayout());
                    
                    var $this = this;

                    this.accepted = false;
                    this.list = new CompList(true);
                    this.list.setLayout(new GridLayout(2, 2));
                    this.list.padding(6);
                    this.list.views[0] = null;
                    this.add(L.CENTER, this.list);
                    
                    var controls = new Panel(new FlowLayout(L.CENTER, L.CENTER, L.HORIZONTAL, 8));
                    controls.setBackground(null);
                    var cancelLink = new Link("<cancel>");
                    controls.add(cancelLink);
                    controls.padding(0, 0, 4, 0);
                    cancelLink._.add(function() {
                        $this.accepted = false;
                        $this.parent.remove($this);
                    });
            
                    this.list._.add(function() {
                        $this.accepted = true;
                        $this.parent.remove($this);
                    });
                    
                    this.setBorder(new zebra.ui.view.SimpleBorder(1, rgb.white, 2));
                    this.setBackground(new Fill(zebra.ui.get("col.gray6")));
                    
                    
                    this.add(L.BOTTOM, controls);
                },
                
                function fire(t, prev) {
                    this.$super(t, prev);
                    this.parent.remove(this);
                },
                
                function isAccepted() { return this.accepted; }
            ]);
            
            this.extWin = new ExtEditor();
            for(var i = 0; i < IMAGES.length; i++) {
                var im = new ImagePan(zebra.ui.get(IMAGES[i]));
                im.padding(2);
                this.extWin.list.add(im); 
            }
            this.extWin.toPreferredSize();
        },
    
        function getEditor(t, row,col,o){
            if(col == 0){
                var cbox = new Checkbox(null);
                cbox.setState(o == "on");
                return cbox;
            }
            else
                if(col == 1){
                    var combo = new Combo(), list = combo.list;
                    list.model.addElement("Item 1");
                    list.model.addElement("Item 2");
                    list.model.addElement("Item 3");
                    for(var i = 0;i < list.model.elementsCount(); i ++ ){
                        if (list.model.elementAt(i) == o) { 
                            list.select(i);
                            break;
                        }
                    }
                    return combo;
                }
                else { 
                    if (col == 3) return this.extWin;
                }
                return this.$super(t, row, col, o);
            },

        function fetchEditedValue(row,col,data,editor){
            if(col == 0) return editor.getState() ? "on" : "off";
            else
                if(col == 1) return editor.list.model.elementAt(editor.list.selectedIndex);
                else 
                    if (col == 3) return editor.list.selectedIndex;
            return this.$super(this.fetchEditedValue,row, col, data, editor);
        }
]);

var CompViewProvider = new Class(DefViews,[
    function (){ this.$super(); },
    function getView(row,col,o){
        return row == 2 ? new CompRender(o) : this.$super(row, col, o);
    }
]);

var CompEditorProvider = new Class(DefEditors, [
    function getEditor(t, r,c,o){
        if(r == 2) return o;
        else {
            var ce = this.$super(t, r, c, o);
            ce.setBorder(null);
            ce.padding(0);
            return ce;
        }
    },

    function fetchEditedValue(row,col,data,c){
        return (row == 2) ? c : this.$super(this.fetchEditedValue,row, col, data, c);
    },

    function shouldDo(t, action,row,col,e){
        return action == START_EDITING;
    }
]);
        

function longGrid() {
   // var m = new zebra.data.Matrix(10000,20);
    var m = new zebra.data.Matrix(100,10);
	for(var i=0; i<m.rows*m.cols; i++) { m.put(i, "Cell [" + i +"]");  }
	
	var g = new Grid(m);
    g.setViewProvider(new DefViews([
        function() { this.$super(); },
        function getCellColor(row,col) { 
            return (row % 2 == 0) ? ui.get("cell.bg1") : ui.get("cell.bg2") ;
        }
    ]));
	
	var gp1 = new GridCaption(g);
	for(var i=0; i < 10; i++) gp1.putTitle(i, "Title " + i);
    g.add(Grid.TOP_CAPTION_EL, gp1);
	
	var gp2 = new GridCaption(g);
	for(var i=0; i < 100; i++) gp2.putTitle(i, " " + i + " ");
    g.add(Grid.LEFT_CAPTION_EL, gp2);
	
	var corner = new Panel();
	corner.setBorder(ui.get("gcap.brv"));
	corner.setBackground(ui.get("gcap.bg"));
	g.add(Grid.STUB_EL, corner);
	var p = new zebra.ui.ScrollPan(g); 
	p.padding(4);
	return p;
} 

function editableGrid() {
    function makeSubgrid(){
        var data = new Matrix(4, 2);
        for(var i = 0;i < data.rows; i ++ ){
            for(var j = 0;j < data.cols; j ++ ) data.put(i, j, "Cell [" + i + "," + j + "]");
        }
        var grid = new Grid(data);
        grid.position.setOffset(0);
        var cap = new GridCaption(grid);
        cap.putTitle(0, "Title 1");
        cap.putTitle(1, "Title 2");
        cap.isResizable = false;
        grid.add(Grid.TOP_CAPTION_EL, cap);
        return grid;
    }

    function makeTree(){
        var root = new Item("root"), data = new TreeModel(root);
        for(var i = 0;i < 2; i ++ ){
            var item = new Item("Item " + i);
            data.add(root, item);
            for(var j = 0;j < 2; j ++ ) data.add(item, new Item("Item " + i + "." + j));
        }
        var tree = new Tree(data);
        tree.select(root);
        return tree;
    }

    function makeTabs(){
        var book = new Tabs();
        book.add("Page 1", new Panel());
        book.add("Page 2", new Panel());
//        book.add("Page 3", new Panel());
        var ps = book.getPreferredSize();
        book.setPSSize(ps.width, 130);
        return book;
    }
    
    function compGrid(){
        var data = new Matrix(1, 3);
        for(var i = 0;i < 3; i++){
            for(var j = 0;j < 2; j ++ ) data.put(j, i, "Cell[" + i + "][" + j + "]");
        }
        data.put(2, 0, makeSubgrid());
        data.put(2, 1, makeTree());
        data.put(2, 2, makeTabs());
        var grid = new Grid(data), cap = new GridCaption(grid);
        cap.isResizable = false;
        cap.putTitle(0, "Grid Inside");
        cap.putTitle(1, "Tree Inside");
        cap.putTitle(2, "Tabs Inside");
        grid.add(Grid.TOP_CAPTION_EL, cap);
        grid.setEditorProvider(new CompEditorProvider());
        grid.setViewProvider(new CompViewProvider());
        grid.setPosition(null);
        grid.usePsMetric(true);
        return grid;
    }
    
    var onView = zebra.ui.get("on"), offView = zebra.ui.get("off"),  m = new Matrix(4,4);
    var d = [ "on", "Item 1", "text 1", "0", 
              "off", "Item 1", "text 2", "0", 
              "off", "Item 2", "text 3", "1",
              "on", "Item 3", "text 4", "2",
              "on", "Item 1", "text 5",  "1" ];
    var t = ["Checkbox\nas editor", "Drop down\nas editor", "Text field\nas editor", "External Window\nas editor"];
    
	for(var i=0; i < (m.rows * m.cols); i++) { m.put(i, d[i]);  }
	
	var g = new Grid(m);
    g.setViewProvider(new DefViews(function($) {
        $(function() { this.$super(); });
        $(function getView(row, col, data) { 
            if (col == 0) return (data == "on") ? onView : offView;
            else {
                if (col == 3) return zebra.ui.get("s" + IMAGES[data]);
            }
            return this.$super(row, col, data);
        });
    }));
    
	g.setEditorProvider(new CustomGridEditor());
	
	var gp1 = new GridCaption(g);
	gp1.isResizable = false;
	for(var i=0; i < m.cols; i++) gp1.putTitle(i, t[i]);
	g.add(Grid.TOP_CAPTION_EL, gp1);
	
    // for(var i = 0;i < m.rows; i ++ ) g.setRowHeight(i, 40);
    for(var i = 0;i < m.cols; i ++ ) g.setColWidth(i, 110);
	
	return wrapWithPan(g, compGrid());
} 

function customCellAlignmentGrid() {
    var d = [ "Top-Left\nAlignment", "Top-Center\nAlignment", "Top-Right\nAlignment",
              "Center-Left\nAlignment", "Center-Center\nAlignment", "Center-Right\nAlignment", 
              "Bottom-Left\nAlignment", "Bottom-Center\nAlignment", "Bottom-Right\nAlignment"];
    var titles = [ "Left Aligned", new CompRender(zebra.ui.createImageLabel("Center", zebra.ui.get("ringtone"))), "Right Aligned"];
    
    var root = new Panel(new RasterLayout(L.USE_PS_SIZE)), data = new Matrix(3, 3);
    for(var i = 0;i < data.rows*data.cols; i ++ ){
        data.put(i, d[i]);
    }
    var grid = new Grid(data), caption = new GridCaption(grid);
    for(var i = 0;i < data.cols; i ++ ) caption.putTitle(i, titles[i]);
    caption.setTitleProps(0, L.LEFT, L.CENTER, null);
    caption.setTitleProps(2, L.RIGHT, L.CENTER, null);
    caption.isResizable = false;
    
    grid.add(Grid.TOP_CAPTION_EL, caption);
    grid.setViewProvider(new ColumnsAlignmentProvider());
    grid.setLocation(20, 20);
    for(var i = 0;i < data.rows; i ++ ) grid.setRowHeight(i, 90);
    for(var i = 0;i < data.cols; i ++ ) grid.setColWidth(i, 140);
    grid.toPreferredSize();
    
    root.add(grid);
    return wrapWithPan(root);
} 

pkg.GridDemo = new Class(pkg.DemoPan, function($) {
    $(function() { 
        this.$super(); 
        this.setLayout(new L.BorderLayout());
        this.padding(6);
        
        var n = new Tabs(L.LEFT);
        n.add("1000 cells", longGrid());
        n.add("Grid", customCellAlignmentGrid());
        n.add("Editable grid", editableGrid());
        
		this.add(L.CENTER, n);
    });    
});

})(zebra.ui.demo, zebra.Class, zebra.ui);


(function(pkg, Class, ui) {

var Panel = zebra.ui.Panel; 
var rgb = zebra.util.rgb;
var Label = zebra.ui.Label; 
var TextField = zebra.ui.TextField; 
var FlowLayout = zebra.layout.FlowLayout; 
var GridLayout = zebra.layout.GridLayout; 
var BorderPan = zebra.ui.BorderPan; 
var ScrollPan = zebra.ui.ScrollPan; 
var SimpleBorder = zebra.ui.view.SimpleBorder; 
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
		
		var t = new zebra.ui.tree.Tree(new zebra.ui.editors.FormTreeModel(pp, function($) {
	        $(function (target){this.$super(target); });
			$(function exclude(c) { return zebra.instanceOf(c, zebra.ui.editors.ShaperPan); });
		}));
		
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

//		s.setBorder(ui.get("br.plain"));
//		l.setForeground(rgb.white);
		
		this.add(L.TOP, l);
		this.add(L.CENTER, s);
    });    
});

})(zebra.ui.demo, zebra.Class, zebra.ui);



})();
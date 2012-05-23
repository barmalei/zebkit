
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
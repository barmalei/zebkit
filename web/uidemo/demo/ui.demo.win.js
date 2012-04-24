
(function(pkg, Class, ui) {

var Panel = zebra.ui.Panel; 
var Color = JAVA.awt.Color;
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
    $(function layout(target){
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
             else  this.setBackground(new zebra.ui.view.Fill(new Color(255,255,255, 0.7)));
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
		    var l = pkg.createLabel(" THIS IS HONDA ", Color.blue);  
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
    w.getRoot().setLayout(new BorderLayout());
    
    var tf = new zebra.ui.TextField(new zebra.data.Text(""));
    tf.setFont(new JAVA.awt.Font("Arial","bold", 18));
    tf.setEditable(false);
    tf.setText("Drag and drop window\nby its title.\n\nResize window by\ndraggin its right-bottom corner");
    w.getRoot().add(L.CENTER, tf);
    w.getRoot().padding(8);
    
    var p = new Panel(new FlowLayout(L.CENTER, L.CENTER));
    var b = new zebra.ui.Button("Close");
    b.padding(4,16,4,16);
    p.padding(8);
    p.add(b);
    
    w.getRoot().add(L.BOTTOM, p);

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
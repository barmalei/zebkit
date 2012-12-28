
(function(pkg, Class) {

eval(zebra.Import("ui", "layout", "util"));

pkg.SamplePan = Class(Panel, [
]); 

pkg.Layout = Class(pkg.SamplePan, KeyListener, [
	function () {
		this.$super();
	}
]);

pkg.BorderOutline = Class(pkg.SamplePan, KeyListener, FocusListener, [
	function $clazz() {
		this.Shape = Class(View, [
			function(c){
				this.color = c;
				this.lineWidth = 4;
			},

			function paint(g,x,y,w,h,d){
				this.outline(g,x,y,w,h,d);
		        g.lineWidth = this.lineWidth;
		        g.setColor(this.color);
	            g.stroke();
			}
		]);

		this.Triangle =  Class(this.Shape, [
			function outline(g,x,y,w,h,d) {
			    g.beginPath();
			    x += this.lineWidth;
			    y += this.lineWidth;
			    w -= 2*this.lineWidth;
			    h -= 2*this.lineWidth;

			    g.moveTo(x + w/2, y);
			    g.lineTo(x + w - 1, y + h - 1);
			    g.lineTo(x, y + h - 1);
			    g.lineTo(x + w/2, y);
			    return true;
			}
		]); 

		this.Oval =  Class(this.Shape, [
			function outline(g,x,y,w,h,d) {
			    g.beginPath();
			    g.lineWidth = this.lineWidth;
			    g.ovalPath(0, 0, w, h);
			    return true;
			}
		]); 

		this.Pentahedron =  Class(this.Shape, [
			function outline(g,x,y,w,h,d) {
			    g.beginPath();
			    x += this.lineWidth;
			    y += this.lineWidth;
			    w -= 2*this.lineWidth;
			    h -= 2*this.lineWidth;
			    g.moveTo(x + w/2, y);
			    g.lineTo(x + w - 1, y + h/3);
			    g.lineTo(x + w - 1 - w/3, y + h - 1);
			    g.lineTo(x + w/3, y + h - 1);
			    g.lineTo(x, y + h/3);
			    g.lineTo(x + w/2, y);
			    return true;
			}
		]); 
	},

	function () {
		this.$super();
		this.showCursor = false;
		this.ch = '';
		this.font = new Font("Arial", 1, 38);
	},

	function paint(g) {
		var l = this.ch != '' ? this.font.stringWidth(this.ch) : 0;
		if (this.hasFocus() && this.showCursor) {
			g.setColor("red");
			g.fillRect(this.width/2 + l/2, (this.height-this.font.height)/2, 4, this.font.height);
		}

		g.setFont(this.font);
		g.setColor(rgb.lightGray);
		g.fillText(this.ch, this.width/2 - l/2, (this.height-this.font.height)/2 + this.font.ascent);
	},

	function keyTyped(e) {
		this.ch = e.ch;
		this.repaint();
	},

	function focusGained(e) {
		this.border.color = "green";
		timer.start(this, 50, 500);
		this.repaint();
	},

	function focusLost(e) {
		this.border.color = "red";
		timer.stop(this);
		this.repaint();
	},

	function run() {
		this.showCursor = !this.showCursor;
		this.repaint();
	},

	function canHaveFocus() {
		return true;
	}
]);


pkg.MouseEventHandler = Class(pkg.SamplePan, MouseMotionListener, MouseListener, [
	function() {
		this.$super();
		this.gx = this.gy = 0;
		this.font = new Font("Helvetica", 1, 12);
		this.color1 = '#C7D3FC';
		this.color2 = '#316F92';
	},

	function mouseMoved(e) {
		this.gx = e.x;
		this.gy = e.y;
		this.repaint();
	},

	function mousePressed(e) {
		this.color1 = '#D7F3FC';
		this.color2 = '#417F92';
		this.repaint();
	},

	function mouseReleased(e) {
		this.color1 = '#C7D3FC';
		this.color2 = '#316F92';
		this.repaint();
	},

	function paint(g) {
		if (this.gx == 0) this.gx = this.width/2;
		if (this.gy == 0) this.gy = this.height/2;
		var rg = g.createRadialGradient(this.width/2, this.height/2, 0, 
										this.gx, this.gy, this.width/1.5);
 	   	rg.addColorStop(0, this.color1);
 	   	rg.addColorStop(1, this.color2);
		g.fillStyle = rg;
    	g.fillRect(0, 0, this.width, this.height);

    	g.setColor(zebra.util.rgb.white);
    	g.setFont(this.font);
    	g.fillText("(" + this.gx + "," + this.gy + ")", this.gx + 10, this.gy + this.font.ascent);
	}
]);

	
pkg.Components = Class(pkg.SamplePan, MouseListener, ChildrenListener, [
	function () {
		function makePanel(brColor, txt) {
			return (new Panel([ 
						function paint(g) {
							var font = new Font("Arial", 1, 15);
							g.setColor(rgb.black);
							g.setFont(font);
							var x = (this.width - font.stringWidth(txt))/2,
								y = (this.height - font.height)/2  + font.ascent;
							g.fillText(txt, x, y);							
						}
				    ])).properties({
							border : new Border(Border.SOLID, brColor, 2, 6),
							preferredSize: [35, 35]
						});
		}

		this.$super();
		this.properties({
			layout: new BorderLayout(6,6),
			kids  : {
				TOP   : makePanel(rgb.red, "TOP"),
				CENTER: makePanel(rgb.red, "").properties({
					layout : new ListLayout(STRETCH, 2),
					padding: 4,
					kids   : [
						makePanel(rgb.orange, "Item 1"),
						makePanel(rgb.orange, "Item 2"),
						makePanel(rgb.orange, "Item 3"),
						makePanel(rgb.orange, "Item 4"),
						makePanel(rgb.orange, "Item 5")
					] 
				}),
				LEFT  :  makePanel(rgb.red, "L"),
				RIGHT :  makePanel(rgb.red, "R"),
				BOTTOM:  makePanel(rgb.red, "BOTTOM")
			}
		}); 
	},

	function childInputEvent(e){
		if (e.ID == MouseEvent.ENTERED) {
			this.counter = 0;
			this.target = e.source;
			timer.start(this, 50, 90);
		}
		else {
			if (e.ID == MouseEvent.EXITED) {
				if (timer.get(this)) timer.stop(this);
				e.source.setBackground(null);
			}
		}
	},

	function run() {
		this.counter++;
		if (this.counter > 3) timer.stop(this);
		this.target.setBackground(new rgb(250, 170, 77, 0.3*this.counter));
	}
]);


})(zebra("samples"), zebra.Class);
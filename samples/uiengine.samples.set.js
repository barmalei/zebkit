
(function(pkg, Class) {

eval(zebra.Import("ui", "layout", "util"));

zebra()["canvas.json"] = pkg.$url + "samples.json";


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
			function(){
				this.$this(pkg.borderColor);
			},

			function(c){
				this.color = c;

				zebra.print("pkg.borderSize = " + pkg.borderSize);

				this.lineWidth = pkg.borderSize;
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
		this.showCursor = false;
		this.ch = '';
		this.font = new Font("Arial", 1, 32);
		this.$super();
	},

	function paint(g) {
		var l = this.ch != '' ? this.font.stringWidth(this.ch) : 0;
		if (this.hasFocus() && this.showCursor) {
			g.setColor("red");
			g.fillRect(this.width/2 + l/2, (this.height-this.font.height)/2, 4, this.font.height);
		}

		g.setFont(this.font);
		g.setColor(rgb.white);
		g.fillText(this.ch, this.width/2 - l/2, (this.height-this.font.height)/2 + this.font.ascent);
	},

	function keyTyped(e) {
		this.ch = e.ch;
		this.repaint();
	},

	function focusGained(e) {
		this.border.color = "red";
		timer.start(this, 50, 500);
		this.repaint();
	},

	function focusLost(e) {
		this.border.color = "white";
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
		this.gx = this.gy = 0;
		this.font = new Font("Helvetica", 1, 12);
		this.color1 = '#C7D3FC';
		this.color2 = '#316F92';
		this.$super();
	},

	function mouseDragged(e) {
		this.tox = e.x;
		this.toy = e.y;
		zebra.print("!!");
		this.repaint();
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

    	if (zebra.ui.$mouseDraggOwner == this) {
    		var xx = this.width/2 -this.tox,
    			yy = this.height/2 -this.toy,
    			d  = Math.sqrt(xx*xx + yy*yy);
    		g.beginPath();
    		g.setColor("red");
    		g.lineWidth = 4;
    		g.ovalPath(this.width/2 - d, this.height/2 - d, 2 * d, 2 * d);
    		g.stroke();
    	}

    	g.setColor(zebra.util.rgb.white);
    	g.setFont(this.font);
    	g.fillText("(" + this.gx + "," + this.gy + ")", this.gx + 10, this.gy + this.font.ascent);
	}
]);

	
pkg.Components = Class(pkg.SamplePan, MouseListener, ChildrenListener, [
	function () {
		function makePanel(brColor, txtCol, txt, constr) {
			if (zebra.isString(txtCol)) {
				constr = txt;
				txt = txtCol;
				txtCol = brColor;
			}

			return (new Panel([ 
						function paint(g) {
							var font = new Font("Arial", 1, 16);
							
							g.setColor(txtCol);
							g.setFont(font);

							var x = (this.width - font.stringWidth(txt))/2,
								y = (this.height - font.height)/2  + font.ascent;

							g.fillText(txt, x, y);							
						}
				    ])).properties({
							border       : new Border(Border.SOLID, brColor, 4, 6),
							preferredSize: [35, 35],
							constraints  : constr
						});
		}

		this.$super();

		var constr = new Constraints(), col = "#DDEEEE", constr2 = new Constraints();
		constr.setPadding(4);
		constr2.setPadding(4);
		constr2.ax = LEFT ;
		constr2.ay = TOP;

		this.properties({
			layout: new BorderLayout(6,6),
			kids  : {
				TOP   : makePanel(rgb.gray, rgb.white, "TOP"),
				CENTER: makePanel(rgb.gray, rgb.white, "").properties({
					layout : new FlowLayout(CENTER, CENTER),
					kids: [ new Panel().properties({
						layout : new ListLayout(STRETCH, 2),
						padding: 4,
						kids   : [
							makePanel(rgb.black, rgb.black, "Item 1"),
							makePanel(rgb.black, rgb.black, "Item 2"),
							makePanel(rgb.black, rgb.black, "").properties({
								layout: new GridLayout(2, 3),
								preferredSize:[-1,-1],
								padding:4,
								kids  : [
									makePanel(col, "1", constr2),
									makePanel(col, "2", constr).properties({ preferredSize: [100, 40] }),
									makePanel(col, "3", constr).properties({ preferredSize: [20, 100] }),
									makePanel(col, "4", constr2),
									makePanel(col, "5", constr),
									makePanel(col, "6", constr2)
								]
							}),
							makePanel(rgb.black, rgb.black, "Item 4")
						] 
					})]
				}),
				LEFT  :  makePanel(rgb.gray, rgb.white, "L"),
				RIGHT :  makePanel(rgb.gray, rgb.white, "R"),
				BOTTOM:  makePanel(rgb.gray, rgb.white, "BOTTOM")
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
		this.target.setBackground(new rgb(200, 20, 80, 0.3*this.counter));
	}
]);

pkg.CirclePan = Class(pkg.SamplePan, MouseListener, Cursorable, [
	function(r) {
		this.$super();
		this.setPreferredSize(2*r, 2*r);
		this.setBorder(new pkg.BorderOutline.Oval("red"));
	},

	function contains(x, y) {
		var rx = this.width/2, ry = this.height/2;
		return (ry - y) * (ry - y) + (rx - x) * (rx - x) < rx * rx;
	},

	function mouseEntered(e) {
		this.setBackground("blue");
	},

	function mouseExited(e) {
		this.setBackground(null);
	},

	function getCursorType(t, x, y) {
		return Cursor.HAND;
	}
]);

pkg.CursorPan = Class(pkg.SamplePan, Cursorable, [
	function(c) {
		this.$super();
		this.cursor = c;
	},

	function getCursorType(t, x, y) {
		return this.cursor;
	}
]);


pkg.SimpleChart = Class(pkg.SamplePan, [
	function(f, x1, x2, dx) {
		this.$super();
		this.f = f;
		this.x1 = x1;
		this.x2 = x2;
		this.dx = dx;
		this.setBackground("black");
		this.setPadding(8);
	},

	function recalc() {

		zebra.print("recalc");

		var maxy = -1000000, miny = 1000000, y = []; 
		for(var x = this.x1, i = 0; x < this.x2; x += this.dx, i++) {
			y[i] = this.f(x);
			if (y[i] > maxy) maxy = y[i]; 
			if (y[i] < miny) miny = y[i]; 
		}
		y.push(miny);
		y.push(maxy);
		this.fy = y;

		zebra.print(this.fy.length);
	},

	function paint(g) {
		var ww = this.width - this.getLeft() - this.getRight(), 
			hh = this.height - this.getTop() - this.getBottom(),
			min = this.fy[this.fy.length-2], max = this.fy[this.fy.length-1], deltay = max - min,
			deltax = this.x2 - this.x1,
			sx  = this.getLeft() + (ww/deltax) * (this.x1 - this.x1), 
			sy = this.getTop() + (hh/deltay) * (this.fy[0] - min);
				
		g.beginPath();
		g.setColor("red");
		g.lineWidth = 3;
		g.moveTo(sx, sy);
		for(var x = this.x1 + this.dx, i = 1; i < this.fy.length-2; x += this.dx, i++) {
			g.lineTo(this.getLeft() + (ww/deltax) * (x - this.x1) , this.getTop() + (hh/deltay) * (this.fy[i] - min));
			
		}
		g.stroke();
	}
]);


pkg.SpriteView = Class(zebra.ui.View, [	
	function paint(g, x, y, w, h, d) {
		for (var i = 0; i < w; i++) {
			for (var j = 0; j < h; j++) {
				var xx = x + i, yy = y + j,
					m1 = Math.abs(yy - 10)*10,
					m2 = (-xx + w)/w;
				g.setColor(new rgb((255.0-m1)*m2,(100-m1)*m2,0));
				
				g.beginPath();
				g.moveTo(xx, yy);
				g.lineTo(xx+1, yy+1);
				g.stroke();
			}			
		}
	}
]);

})(zebra("ui.samples"), zebra.Class);
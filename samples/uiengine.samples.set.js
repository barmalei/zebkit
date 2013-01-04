
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

			    g.moveTo(x + w/2 - 1, y);
			    g.lineTo(x + w - 1, y + h - 1);
			    g.lineTo(x, y + h - 1);
			    g.lineTo(x + w/2 + 1, y);
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

pkg.CursorPan = Class(pkg.SamplePan, Cursorable, [
	function(cursor, bg, picture) {
		this.$super();
		this.setPreferredSize(50,50);
		this.cursor = cursor;
		this.setBackground(bg);
		this.picture = picture;
	},

	function getCursorType(t, x, y) { 
		return this.cursor; 
	},

	function paint(g) {
		var ps = this.picture.getPreferredSize();
		this.picture.paint(g, (this.width - ps.width)/2, (this.height - ps.height)/2, ps.width, ps.height, this);
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
							border       : new Border(brColor, 4, 6),
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
							})
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

pkg.CirclePan = Class(pkg.SamplePan, MouseListener, [
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
		this.setBackground("rgba(100,222,80,0.4)");
	},

	function mouseExited(e) {
		this.setBackground(null);
	}
]);

pkg.TrianglePan = Class(pkg.SamplePan, MouseListener, [
	function() {
		this.$super();
		this.setBorder(new pkg.BorderOutline.Triangle("orange"));
		this.setPreferredSize(200, 200);
	},

	function contains(x, y) {
		var ax = this.width/2, ay = 0, 
			bx = this.width - 1, by = this.height - 1,
			cx = 0, cy = this.height - 1,
			ab = (ax - x)*(by- y)-(bx-x)*(ay-y);
			bc = (bx-x)*(cy-y)-(cx - x)*(by-y);
			ca = (cx-x)*(ay-y)-(ax - x)*(cy-y);
		return ab > 0 && bc > 0 && ca > 0
	},

	function mouseEntered(e) {
		this.setBackground("rgba(220,80,80, 0.4)");
	},

	function mouseExited(e) {
		this.setBackground(null);
	}
]);

pkg.SimpleChart = Class(pkg.SamplePan, [
	function(f, x1, x2, dx, col) {
		this.f = f;
		this.x1 = x1;
		this.x2 = x2;
		this.dx = dx;
		this.color = col;
		this.lineWidth = 4; 
		this.$super();
		this.setPadding(8);
	},

	function recalc() {
		var maxy = -1000000, miny = 1000000, fy = []; 
		for(var x = this.x1, i = 0; x < this.x2; x += this.dx, i++) {
			fy[i] = this.f(x);
			if (fy[i] > maxy) maxy = fy[i]; 
			if (fy[i] < miny) miny = fy[i]; 
		}

		var left = this.getLeft() + this.lineWidth, top = this.getTop() + this.lineWidth,
			ww = this.width  - left - this.getRight()  - this.lineWidth*2, 
			hh = this.height - top  - this.getBottom() - this.lineWidth*2,
			cx  = ww/(this.x2 - this.x1), cy = hh/ (maxy - miny);

		var t = function (xy, ct) { 
			return ct * xy; 
		};

		this.gx = [ left ];
		this.gy = [ top + t(fy[0] - miny, cy) ];
		for(var x = this.x1 + this.dx, i = 1; i < fy.length; x += this.dx, i++) {
			this.gx[i] = left + t(x - this.x1, cx);
			this.gy[i] = top  + t(fy[i] - miny, cy);
		}
	},

	function isInside(x, y) {
		for(var i = 0; i < this.gx.length; i++) { 
			var rx = this.gx[i], ry = this.gy[i];
			if ((ry - y) * (ry - y) + (rx - x) * (rx - x) < 4 * this.lineWidth * this.lineWidth) {
				return i;
			}
		}
		return -1;
	},

	function setHighlight(b) {
		this.highlight = b;
		this.repaint();
	},

	function paint(g) {
		g.beginPath();
		g.setColor(this.color);
		g.lineWidth = this.lineWidth;
		g.moveTo(this.gx[0], this.gy[0]);
		for(var i = 1; i < this.gx.length; i++) { 
			g.lineTo(this.gx[i], this.gy[i]);
		}
		g.stroke();

		if (this.highlight) {
			g.lineWidth = this.lineWidth*3;
			g.setColor("rgba(255,10,10, 0.3)");
			g.moveTo(this.gx[0], this.gy[0]);
			for(var i = 1; i < this.gx.length; i++) { 
				g.lineTo(this.gx[i], this.gy[i]);
			}
			g.stroke();
		}
	}
]);

pkg.CustomLayer = Class(BaseLayer, [
	function() {
		this.$super("CUSTOM");
		this.setLayout(new StackLayout());
		this.setPadding(8);
		this.add(new Panel(FocusListener, [
			function canHaveFocus() {
				return true;
			},

			function focusGained(e) {
				this.setBorder(new Border("red", 4, 6));
			},

			function focusLost(e) {
				this.setBorder(null);
			},

			function paint(g) {
				//g.fillText();
			}
		]));
	},

	function isLayerActive() {
		return this.bg != null;
	},

	function isLayerActiveAt(x,y){ 
		return this.bg != null;
	},

	function layerKeyPressed(code, m){
		if (code == 68 && (m & KeyEvent.ALT) > 0) {
			if (this.bg == null ) this.setBackground("rgba(200, 200, 200, 0.7)");
			else				  this.setBackground(null);
			this.activate(this.bg != null);
			this.kids[0].requestFocus();
		}		
	}
]);

})(zebra("ui.samples"), zebra.Class);
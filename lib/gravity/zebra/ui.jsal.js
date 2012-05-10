(function(pkg, Class) { 

var MouseEvent = pkg.MouseEvent, KeyEvent = pkg.KeyEvent, Dimension = zebra.util.Dimension;

var MDRAGGED = MouseEvent.DRAGGED, EM = null;
var MMOVED   = MouseEvent.MOVED, MEXITED = MouseEvent.EXITED, MENTERED = MouseEvent.ENTERED;
var KPRESSED = KeyEvent.PRESSED, BM1 = MouseEvent.LEFT_BUTTON, BM3 = MouseEvent.RIGHT_BUTTON;

var MS = Math.sin, MC = Math.cos, context = Object.getPrototypeOf(document.createElement('canvas').getContext('2d'));

context.setFont = function(f) {  if (f.s != this.font) this.font = f.s; }

context.setColor = function(c) {
    if (c.s != this.fillStyle) this.fillStyle = c.s;
    if (c.s != this.strokeStyle) this.strokeStyle = c.s;
}

context.drawLine = function(x1, y1, x2, y2, w){
    if (arguments.length < 5) w = 1;
    var pw = this.lineWidth;
    this.beginPath();
    this.lineWidth = w;
    
    if (x1 == x2) x1 += w / 2;
    else
    if (y1 == y2) y1 += w / 2;

    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.stroke();
    this.lineWidth = pw;
}

context.drawArc = function(cx,cy,r, sa, ea, d){
    this.beginPath();
    this.arc(cx, cy, r, sa, ea, d);
    this.stroke();
}

context.fillArc = function(cx,cy,r, sa, ea, d){
    this.beginPath();
    this.arc(cx, cy, r, sa, ea, d);
    this.fill();
}

context.ovalPath = function(x,y,w,h){
    this.beginPath();  
    var kappa = .5522848, ox = (w / 2) * kappa, oy = (h / 2) * kappa, xe = x + w, ye = y + h, xm = x + w / 2, ym = y + h / 2;
    this.moveTo(x, ym);
    this.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    this.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    this.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    this.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
}

context.polylinePath = function(xPoints, yPoints, nPoints){
    this.beginPath();  
    this.moveTo(xPoints[0], yPoints[0]);
    for(var i=1; i < nPoints; i++) this.lineTo(xPoints[i], yPoints[i]);
}

context.drawOval = function(x,y,w,h) {
    this.ovalPath(x, y, w, h);
    this.stroke();
}

context.drawPolygon = function(xPoints,yPoints,nPoints){
    this.polylinePath(xPoints, yPoints, nPoints);
    this.lineTo(xPoints[0], yPoints[0]);
    this.stroke();
}

context.drawPolyline = function(xPoints,yPoints,nPoints){
    this.polylinePath(xPoints, yPoints, nPoints);
    this.stroke();
}

context.fillPolygon = function(xPoints,yPoints,nPoints){
    this.polylinePath(xPoints, yPoints, nPoints);
    this.lineTo(xPoints[0], yPoints[0]);
    this.fill();
}

context.fillOval = function(x,y,width,height){
    this.beginPath();
    this.ovalPath(x, y, width, height);
    this.fill();
}

context.drawDottedRect = function(x,y,w,h) {
    var ctx = this, m = ["moveTo", "lineTo", "moveTo"];
    function dv(x, y, s) { for(var i=0; i < s; i++) ctx[m[i%3]](x + 0.5, y + i); }
    function dh(x, y, s) { for(var i=0; i < s; i++) ctx[m[i%3]](x + i, y + 0.5); }
    ctx.beginPath();
    dh(x, y, w);
    dh(x, y + h - 1, w);
    ctx.stroke();
    ctx.beginPath();
    dv(x, y, h);
    dv(w + x - 1, y, h);
    ctx.stroke();
}

this.drawDashLine = function(x,y,x2,y2) {
    var pattern=[1,2], count = pattern.length, ctx = this, compute = null;
    var dx = (x2 - x), dy = (y2 - y), b = (Math.abs(dx) > Math.abs(dy));
    var slope = b ? dy / dx : dx / dy, sign = b ? (dx < 0 ?-1:1) : (dy < 0?-1:1);

    if (b) {
        compute = function(step) {
            x += step
            y += slope * step;
        }
    }
    else {
        compute = function(step) {
            x += slope * step;
            y += step;
        }
    }

    ctx.moveTo(x, y);
    var dist = Math.sqrt(dx * dx + dy * dy), i = 0;
    while (dist >= 0.1) {
        var dl = Math.min(dist, pattern[i % count]), step = Math.sqrt(dl * dl / (1 + slope * slope)) * sign;
        compute(step);
        ctx[(i % 2 == 0) ? 'lineTo' : 'moveTo'](x + 0.5, y + 0.5);
        dist -= dl;
        i++;
    }
    ctx.stroke();
}

pkg.MWheelSupport = Class(function($) {
    var bars = [2, 1];
    
    $(function(desktop) {
        if (desktop== null) throw new Error();
        this.desktop = desktop;
        var elem = desktop.canvas, $this = this;
        elem.addEventListener ("mousewheel", function() { mouseWheelMoved.apply($this, arguments); }, false);
        elem.addEventListener ("DOMMouseScroll", function() { mouseWheelMoved.apply($this, arguments); }, false);
    });

    function mouseWheelMoved(e){
        var owner = lookup(this.desktop.moveOwner);
        if (owner == null) return;
        
        if (!e) e = window.event;
        var d = [0, 0]; 
        d[0] = (e.detail? e.detail : e.wheelDelta/120);
        if (e.axis) {
            if (e.axis === e.HORIZONTAL_AXIS) { 
                d[1] = d[0];
                d[0] = 0;
            }
        } 

        if (d[0] > 1) d[0] = d[0]/3; 
        
        if (zebra.isIE || zebra.isChrome || zebra.isSafari) d[0] = -d[0];

        for(var i=0; i < bars.length; i++) {
            if (d[i] != 0) {
                var bar = owner.getByConstraints(bars[i]);
                if (bar != null && bar.isVisible) bar.position.setOffset(bar.position.offset + d[i]*bar.pageIncrement);
            }
        }
        
        e.preventDefault ? e.preventDefault() : e.returnValue = false;
    }

    function lookup(c) {
        while(c != null && !zebra.instanceOf(c, pkg.ScrollPan)) c = c.parent;
        return c;
    }
});

pkg.zCanvas = Class(pkg.Panel, pkg.Desktop, function($) {
	KE_STUB  = new pkg.KeyEvent  (null,  KPRESSED, 0, 'x', 0);
  	ME_STUB  = new pkg.MouseEvent(null,  MouseEvent.PRESSED, 0, 0, 0, 1);
   	function isEventable(c) { return c != null && c.isEnabled; }
   	function mem(e) { return e.button == 0 ? BM1: (e.button == 2 ? BM3 : 0 ); }

    function createContext(ctx, w, h) {
        var $save = ctx.save, $restore = ctx.restore, $rotate = ctx.rotate, $scale = ctx.scale, $translate = ctx.translate;

        ctx.counter = 0;
        ctx.stack = Array(33);
        for(var i=0; i < ctx.stack.length; i++) { 
            var s = new Object();
            s.srot = s.rotateVal = s.x = s.y = s.width = s.height = s.dx = s.dy = 0;
            s.crot = s.sx = s.sy = 1;
            ctx.stack[i] = s;
        }
        ctx.stack[0].width  = w;
        ctx.stack[0].height = h;
        ctx.setFont(JAVA.awt.Font.defaultNormal);
        ctx.setColor(zebra.util.Color.white);

        ctx.getTopStack = function() { return this.stack[this.counter]; }

        ctx.tX = function(x, y) { 
            var c = this.stack[this.counter], b = (c.sx != 1 || c.sy != 1 || c.rotateVal != 0);
            return (b ? Math.round((c.crot * x + y * c.srot)/c.sx) : x) - c.dx; 
        }
        
        ctx.tY = function(x, y) { 
            var c = this.stack[this.counter], b = (c.sx != 1 || c.sy != 1 || c.rotateVal != 0);
            return (b ? Math.round((y * c.crot - c.srot * x)/c.sy) : y) - c.dy; 
        }

        ctx.translate = function(dx, dy) { 
            if (dx != 0 || dy != 0) {
                var c = this.stack[this.counter];
                c.x -= dx;
                c.y -= dy;
                c.dx += dx;
                c.dy += dy;
                $translate.call(this, dx, dy); 
            }
        }

        ctx.rotate = function(v) {
            var c = this.stack[this.counter];
            c.rotateVal += v;
            c.srot = MS(c.rotateVal);
            c.crot = MC(c.rotateVal);
            $rotate.call(this, v);
        }

        ctx.scale = function(sx, sy) {
            var c = this.stack[this.counter];
            c.sx = c.sx * sx;
            c.sy = c.sy * sy; 
            $scale.call(this, sx, sy);
        }

        ctx.save = function() {
            this.counter++;
            var c = this.stack[this.counter], cc = this.stack[this.counter - 1];
            c.x = cc.x;
            c.y = cc.y;
            c.width = cc.width;
            c.height = cc.height;

            c.dx = cc.dx;
            c.dy = cc.dy;
            c.sx = cc.sx;
            c.sy = cc.sy;
            c.srot = cc.srot;
            c.crot = cc.crot;
            c.rotateVal = cc.rotateVal;

            $save.call(this);
            return this.counter - 1;
        }

        ctx.restore = function() {
            if (this.counter == 0) throw new Error();
            this.counter--;
            $restore.call(this);
            return this.counter;
        }
        
        //!!!!!
        ctx.setClip = function(x,y,w,h) {}

        ctx.clipRect = function(x,y,w,h){
            var c = this.stack[this.counter];
            if (c.x != x || y != c.y || w != c.width || h != c.height) {
                var xx = c.x, yy = c.y, ww = c.width, hh = c.height;
                c.x      = Math.max(x, xx);
                c.width  = Math.min(x + w, xx + ww) - c.x;
                c.y      = Math.max(y, yy);
                c.height = Math.min(y + h, yy + hh) - c.y;
                if (c.x != xx || yy != c.y || ww != c.width || hh != c.height) {
                    this.beginPath();
                    this.rect(x, y, w, h);
                    this.clip();
                }
            } 
        }
        return ctx;
    }

    $(function(canvas) { 
        var pc = canvas;
        if (zebra.isString(canvas)) canvas = document.getElementById(canvas);
        
        if (canvas == null || typeof canvas === "undefined") {
            canvas = document.createElement("canvas");
            canvas.setAttribute("tabindex", "0");
            canvas.setAttribute("class", "zebracanvas");
            canvas.setAttribute("width", "400");
            canvas.setAttribute("height", "400");
            canvas.setAttribute("id", pc);
            document.body.appendChild(canvas); 
        }
    
        this.getComponentAt = function(x,y){
            for(var i = this.kids.length; --i >= 0; ){
                var tl = this.kids[i];            
                if(tl.isLayerActiveAt(x, y)) return EM.getEventDestination(tl.getComponentAt(x, y));
            }
            return null;
        }
        
        this.$super();

        this.da = new zebra.util.Rectangle(0, 0, -1, 0);
        this.width  = parseInt(canvas.width);
        this.height = parseInt(canvas.height);
        this.offx = this.offy = 0;
        this.graph = createContext(canvas.getContext("2d"), this.width, this.height);

        var e = canvas;
        if (e.offsetParent) {
        	do {
    			this.offx += parseInt(e.offsetLeft);
    			this.offy += parseInt(e.offsetTop);
    		} while (e = e.offsetParent);
        }
        
		this.timer = this.keyPressed = this.moveOwner = this.pressOwner = this.draggOwner = null;
		this.pressX = this.pressY = this.mousePressedMask = 0;
        this.canvas = canvas;
        this.doubleClickDelta = 100;

        //!!!
    	EM = pkg.events;
        this.setBackground(null);
        
        var layers = pkg.get("layers"); 
        for(var i=0; i < layers.length; i++) this.add(pkg.get(layers[i]));   

        var $this = this;
        this.canvas.onmousemove = function() { mouseMoved.apply($this, arguments);   }
        this.canvas.onmousedown = function() { mousePressed.apply($this, arguments); }
        this.canvas.onmouseup   = function() { mouseReleased.apply($this, arguments);}
        this.canvas.onmouseover = function() { mouseEntered.apply($this, arguments); }
        this.canvas.onmouseout  = function() { mouseExited.apply($this, arguments);  }
        this.canvas.onkeydown   = function() { keyPressed.apply($this, arguments);  }
        this.canvas.onkeyup     = function() { keyReleased.apply($this, arguments);  }
        this.canvas.onkeypress  = function() { keyTyped.apply($this, arguments);  }
        this.canvas.oncontextmenu = function(e) { if (!e) e = window.event; e.preventDefault(); }

        this.setLayout(new zebra.layout.Layout([
            function calcPreferredSize(c) { return new Dimension(parseInt(c.canvas.width), parseInt(c.canvas.height)); },
            function doLayout(c){
                var x = c.getLeft(), y = c.getTop(), w = c.width - c.getRight() - x, h = c.height - c.getBottom() - y;
                for(var i = 0;i < c.kids.length; i++){
                    var l = c.kids[i];
                    if(l.isVisible){
                        l.setLocation(x, y);
                        l.setSize(w, h);
                    }
                }
            }
        ]));

        //!!!
        new pkg.MWheelSupport(this);
        this.validate();
    });

    $(function setSize(w, h) { 
        if (this.canvas.width != w || h != this.canvas.height) {
            this.canvas.width  = w;
            this.canvas.height = h;
            this.$super(w, h);
        }
    });

    function keyTyped(e){
        if (!e) e = window.event; 
        var ch = e.charCode;
        if (ch > 0) {
            var fo = pkg.focusManager.focusOwner;
            if(fo != null) fke(fo, KeyEvent.TYPED, e.keyCode, String.fromCharCode(e.charCode), km(e));
        }
    }

    function keyPressed(e){
        if (!e) e = window.event; 
        var code = e.keyCode, m = km(e);
        for(var i = this.kids.length - 1;i >= 0; i--){
            var l = this.kids[i];
            l.layerKeyPressed(code, m);
            if (l.isLayerActive()) break;
        }
        
        var focusOwner = pkg.focusManager.focusOwner;
        if(focusOwner != null) {
            fke(focusOwner, KPRESSED, code, code < 47 ? KeyEvent.CHAR_UNDEFINED : '?', m);
            if (code == KeyEvent.VK_ENTER) fke(focusOwner, KeyEvent.TYPED, code, "\n", m);
        }
        
        //!!!!
        if (code < 47 && code != 32) e.preventDefault();
    }

    function keyReleased(e){
        if (!e) e = window.event; 
        var fo = pkg.focusManager.focusOwner;
        if(fo != null) fke(fo, KeyEvent.RELEASED, e.keyCode, KeyEvent.CHAR_UNDEFINED, km(e));
    }

    function mouseEntered(e){
        if (!e) e = window.event;
        if(this.draggOwner == null){
            var x = meX(e, this), y = meY(e, this), d = this.getComponentAt(x, y);
            if(d != null && d.isEnabled){
                this.moveOwner = d;
                fme3(d, MENTERED, e, x, y);
            }
        }
    }

    function mouseExited(e){
        if (!e) e = window.event;
        if(this.moveOwner != null && this.draggOwner == null){
            var p = this.moveOwner;
            this.moveOwner = null;
            fme3(p, MEXITED, e, meX(e, this), meY(e, this));
        }
    }

    function mouseMoved(e){
        if (this.pressOwner != null) {
            mouseDragged.call(this, e);
            return;
        }
        
        if (!e) e = window.event;

        var x = meX(e, this), y = meY(e, this), d = this.getComponentAt(x, y);
        if(this.moveOwner != null){
            if (d != this.moveOwner) {
                var old = this.moveOwner;
                this.moveOwner = null;
                fme3(old, MEXITED, e, x, y);
                if(isEventable(d)) {
                    this.moveOwner = d;
                    fme3(this.moveOwner, MENTERED, e, x, y);
                }
            }
            else {
                if (d != null && d.isEnabled) {
                    ME_STUB.reset(d, MMOVED, x, y, mem(e), 0);
                    EM.performInput(ME_STUB);
                }
            }
        }
        else {
            if(isEventable(d)){
                this.moveOwner = d;
                fme3(d, MENTERED, e, x, y);
            }
        }
    }

    function mouseReleased(e){
	    if (!e) e = window.event;
    
	    var drag = (this.draggOwner != null), x = meX(e, this), y = meY(e, this);
	    if(drag){
	        fme3(this.draggOwner, MouseEvent.ENDDRAGGED, e, x, y);
	        this.draggOwner = null;
	    }
	    var po = this.pressOwner;
	    if(this.pressOwner != null){
	        fme3(this.pressOwner, MouseEvent.RELEASED, e, x, y);
	        if(drag == false) {
				var when = (new Date()).getTime(), clicks = ((when - this.lastClickTime) < this.doubleClickDelta) ? 2 : 1;
	            fme6(this.pressOwner, MouseEvent.CLICKED, x, y, mem(e), clicks);
	            this.lastClickTime = clicks > 1 ? 0 : when;
	        }
	        this.pressOwner = null;
	    }
	    if(drag || (po != null && po != this.moveOwner)){
	        var nd = this.getComponentAt(x, y);
	        if(nd != this.moveOwner){
	            if(this.moveOwner != null) fme3(this.moveOwner, MEXITED, e, x, y);
	            if(isEventable(nd)){
	                this.moveOwner = nd;
	                fme3(nd, MENTERED, e, x, y);
	            }
	        }
	    }
	}

    function mousePressed(e) { 
        if (!e) e = window.event;

        this.mousePressedMask = mem(e);
        this.pressX = meX(e, this);
        this.pressY = meY(e, this);

        for(var i = this.kids.length - 1;i >= 0; i--){
            var l = this.kids[i];
            l.layerMousePressed(this.pressX, this.pressY, this.mousePressedMask);
            if (l.isLayerActiveAt(this.pressX, this.pressY)) break;
        }

        var d = this.getComponentAt(this.pressX, this.pressY);
        if(isEventable(d)){
            this.pressOwner = d;
            fme3(d, MouseEvent.PRESSED, e, this.pressX, this.pressY);
        }
    }

    function mouseDragged(e){
        if (!e) e = window.event;
        var m = mem(e), x = meX(e, this), y = meY(e, this);
        if(this.draggOwner == null){
            var d = (this.moveOwner == null) ? this.getComponentAt(this.pressX, this.pressY) : this.moveOwner;
            if(isEventable(d)){
                this.draggOwner = d;
                fme6(this.draggOwner, MouseEvent.STARTDRAGGED, this.pressX, this.pressY, m, 0);
                if(this.pressX != x || this.pressY != y) fme6(this.draggOwner, MDRAGGED, x, y, m, 0);
            }
        }
        else fme6(this.draggOwner, MDRAGGED, x, y, m, 0);
    }

    $(function repaint() { this.repaint(0, 0, this.width, this.height); });
    
    //!!!!
    $(function repaint(x,y,w,h) { 
        if (this.timer == null) {
            var $this = this;
            this.timer = setTimeout(function() { 
                try {
                    $this.timer = null;
                    pkg.paintManager.startPaint($this.graph, $this);
                    $this.da.width = -1; //!!!
                }
                catch(e) { zebra.out.print(e); }
            },50);
        }
    });
   
    $(function kidAdded(i,constr,c){
        if (typeof this[c.id] !== "undefined") throw new Error();
        this[c.id] = c;
        this.$super(i, constr, c);
    });

    $(function getLayer(id){ return this[id]; });

    $(function kidRemoved(i, c){ 
        delete this[c.id];
        this.$super(i, c);
    });
    
    var meX, meY;  
    if (zebra.isIE) {
        var de = document.documentElement, db = document.body;
        meX = function meX(e, d) { return d.graph.tX(e.clientX - d.offx + de.scrollLeft + db.scrollLeft, 
                                                     e.clientY - d.offy + de.scrollTop  + db.scrollTop);  }
        meY = function meY(e, d) { 
            return d.graph.tY(e.clientX - d.offx + de.scrollLeft + de.scrollLeft,
                              e.clientY - d.offy + de.scrollTop + db.scrollTop);  }
    }
    else {
        meX = function meX(e, d) {  return d.graph.tX(e.pageX - d.offx, e.pageY - d.offy); }
        meY = function meY(e, d) {  return d.graph.tY(e.pageX - d.offx, e.pageY - d.offy); }
    }

    function km(e) { 
        var c = 0;
        if (e.altKey)   c += KeyEvent.ALT;
        if (e.shiftKey) c += KeyEvent.SHIFT;
        if (e.ctrlKey)  c += KeyEvent.CTRL;
        if (e.metaKey)  c += KeyEvent.CMD;
        return c; 
    }
    
    function fke(target, id, code, ch, m) {
        KE_STUB.reset(target, id, code, ch, m);
        EM.performInput(KE_STUB);
    }

    function fme3(target,id, e, x, y)  { 
        ME_STUB.reset(target, id, x, y, mem(e), 0);
        EM.performInput(ME_STUB);
    }

    function fme6(target,id,x,y,m,c){
        ME_STUB.reset(target, id, x, y, m, c);
        EM.performInput(ME_STUB);
    }
});

})(zebra("ui"), zebra.Class);
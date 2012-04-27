(function(pkg, Class) { 

var MouseEvent = pkg.MouseEvent, KeyEvent = pkg.KeyEvent, Dimension = JAVA.awt.Dimension;

var MDRAGGED = MouseEvent.DRAGGED, EM = null;
var MMOVED   = MouseEvent.MOVED, MEXITED = MouseEvent.EXITED, MENTERED = MouseEvent.ENTERED;
var KPRESSED = KeyEvent.PRESSED, BM1 = MouseEvent.LEFT_BUTTON, BM3 = MouseEvent.RIGHT_BUTTON;

pkg.MWheelSupport = Class(function($) {
    var bars = [2, 1];
    
    $(function (desktop) {
        if (desktop== null) throw new IllegalArgumentException();
        this.desktop = desktop;
        var elem = desktop.canvas, $this = this;
        if (elem.addEventListener) {    // all browsers except IE before version 9
                           // Internet Explorer, Opera, Google Chrome and Safari
                       elem.addEventListener ("mousewheel", function() { mouseWheelMoved.apply($this, arguments); }, false);
                           // Firefox
                       elem.addEventListener ("DOMMouseScroll", function() { mouseWheelMoved.apply($this, arguments); }, false);
                   }
                   else {
                       if (elem.attachEvent) { // IE before version 9
                           elem.attachEvent ("onmousewheel", function() { mouseWheelMoved.apply($this, arguments); });
                       }
                   }
        // var n = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel", $this = this;
        // if (desktop.canvas.attachEvent) desktop.canvas.attachEvent("on"+n, function() { mouseWheelMoved.apply($this, arguments); } );
        // else 
        // if (desktop.canvas.addEventListener) {
        //     
        //     desktop.canvas.addEventListener(n, function() { mouseWheelMoved.apply($this, arguments); }, false);
        // }
    });

    function mouseWheelMoved(e){
        var owner = lookup(this.desktop.moveOwner);
        if (owner == null) return;
        
        if (!e) e = window.event;
        var d = [0, 0]; 
        // if (e.wheelDeltaX) {
        //    d[1] = e.wheelDeltaX;
        //    d[0] = e.wheelDeltaY;
        // }
        // else {
            d[0] = (e.detail? e.detail : e.wheelDelta/120);
            if (e.axis) {
                if (e.axis === e.HORIZONTAL_AXIS) { 
                    d[1] = d[0];
                    d[0] = 0;
                }
            } 
        // }

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

    $('da', new JAVA.awt.Rectangle(0, 0,  -1, 0));

    $(function(canvas) { 
        if (zebra.isString(canvas) && typeof document !== "undefined") canvas = document.getElementById(canvas);
        if (canvas == null || typeof canvas === "undefined") throw new IllegalArgumentException("");
    
        this.getComponentAt = function(x,y){
            for(var i = this.kids.length; --i >= 0; ){
                var tl = this.kids[i];            
                if(tl.isLayerActiveAt(x, y)) return EM.getEventDestination(tl.getComponentAt(x, y));
            }
            return null;
        }
   
        this.getGraphics = function (x, y, w, h) { 
            if (arguments.length == 0) this.graph.setClip(0, 0, this.width, this.height);
            else this.graph.setClip(x, y, w, h);
            return this.graph;
        }
        
        this.painting = false;
        this.graph = new JAVA.awt.Graphics(canvas);
        this.$super();

        this.width  = parseInt(canvas.width);
        this.height = parseInt(canvas.height);
        this.offx = this.offy = 0;
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
        pkg.events = new pkg.EventManager();
        pkg.paintManager = new pkg.PaintManImpl();
        pkg.events.addComponentListener(pkg.paintManager);
        pkg.focusManager = new pkg.FocusManager();
        pkg.events.addListener(pkg.focusManager);
        pkg.cursorManager = new pkg.CursorManager();
        pkg.events.addListener(pkg.cursorManager);
        pkg.tooltip = new pkg.TooltipManager();
        pkg.events.addListener(pkg.tooltip);
        pkg.popup = new pkg.PopupManager();
        pkg.events.addListener(pkg.popup);
        EM = pkg.events;

		var ClipboardMan = function() {
		    this.data = null; 
		    this.get = function() { return this.data; },
		    this.put = function(d) { this.data = d; },
		    this.isEmpty = function() { this.get() != null; }
		}
		pkg.clipboard = new ClipboardMan();

        this.setBackground(null);
        //!!!!
        this.layers = { "win":new pkg.WinLayer(),  "root":new pkg.BaseLayer("root"), "pop": new pkg.PopupLayer()};
		this.root   = this.layers["root"];
		this.add(this.root);
		this.add(this.layers[pkg.WinLayer.ID]);
		this.add(this.layers[pkg.PopupLayer.ID]);

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

            function layout(c){
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

        this.validate();
    });

    $(function setSize(w, h) { 
        if (this.canvas.width != w || h != this.canvas.height) {
            this.canvas.width  = w;
            this.canvas.height = h;
            this.vrp();
        }
    });

    $(function getLayer(id){ return this.layers[id]; });
    $(function getGraphics(){ return null; });

    //!!!! temporary methods
    $(function rotate(v) { this.getGraphics(0,0, this.width, this.height).rotate(v); });
    $(function scale(sx, sy){  this.getGraphics(0,0, this.width, this.height).scale(sx, sy); });
    $(function ri(){  this.getGraphics(0,0, this.width, this.height).reinit(); });

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
        if (this.painting) return;
        this.painting = true;
        try {
            if (this.timer == null) {
                var $this = this;
                this.timer = setTimeout(function() { $this.paint(); }, 50);
            }
        }
        finally { this.painting = false; }
    });
   
    $(function paint() {  
        try {
            this.timer = null;
            var x = this.da.x, y = this.da.y, w = this.da.width, h = this.da.height;
            pkg.paintManager.startPaint(this.getGraphics(x, y, w, h), this);
            this.da.width = -1; //!!!
        }
        catch(e) { zebra.out.print(e); }
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
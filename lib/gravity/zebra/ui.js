(function(pkg, Class, Interface) {

var defFontName = "Arial", $fmCanvas = null, $fmText = null, $fmImage = null,
    instanceOf = zebra.instanceOf, L = zebra.layout;

pkg.getPreferredSize = function(l) { return l != null && l.isVisible ? l.getPreferredSize() : { width:0, height:0 }; };

//!!! Font should be able to parse CSS string
pkg.Font = function(name, style, size) {
    this.name   = name;
    this.style  = style;
    this.size   = size;
    this.s      = [
                    (this.style & pkg.Font.ITALIC) > 0 ? 'italic ' : '',
                    (style & pkg.Font.BOLD) > 0        ? 'bold ':'',
                    this.size, 'px ', this.name
                  ].join('');

    $fmText.style.font = this.s;
    this.height = $fmText.offsetHeight;
    this.ascent = $fmImage.offsetTop - $fmText.offsetTop + 1;
};

pkg.Font.PLAIN  = 0;
pkg.Font.BOLD   = 1;
pkg.Font.ITALIC = 2;

pkg.Font.prototype.stringWidth = function(s) {
    if (s.length === 0) return 0;
    if ($fmCanvas.font != this.s) $fmCanvas.font = this.s;
    return ($fmCanvas.measureText(s).width + 0.5) | 0;
};

pkg.Font.prototype.charsWidth = function(s, off, len) {
    if ($fmCanvas.font != this.s) $fmCanvas.font = this.s;
    return ($fmCanvas.measureText(len == 1 ? s[off] : s.substring(off, off + len)).width + 0.5) | 0;
};

pkg.Font.prototype.toString = function() { return this.s;  };
pkg.Font.prototype.equals = function(f)  { return f === this || (f != null && this.s === f.s); };

var cvp = pkg.cvp = function(c, r) {
    if(c.width > 0 && c.height > 0 && c.isVisible){
        var p = c.parent, px = -c.x, py = -c.y;
        if (r == null) r = { x:0, y:0, width:0, height:0 };
        else r.x = r.y = 0;
        r.width  = c.width;
        r.height = c.height;

        while (p != null && r.width > 0 && r.height > 0){
            MB.intersection(r.x, r.y, r.width, r.height, px, py, p.width, p.height, r);
            px -= p.x;
            py -= p.y;
            p = p.parent;
        }
        return r.width > 0 && r.height > 0 ? r : null;
    }
    return null;
};

pkg.Cursor = Class([
    function $clazz() {
        this.DEFAULT = "default";
        this.MOVE = "move";
        this.WAIT = "wait";
        this.TEXT = "text";
        this.HAND = "pointer";
        this.NE_RESIZE = "ne-resize";
        this.SW_RESIZE = "sw-resize";
        this.SE_RESIZE = "se-resize";
        this.NW_RESIZE = "nw-resize";
        this.S_RESIZE = "s-resize";
        this.W_RESIZE = "w-resize";
        this.N_RESIZE ="n-resize";
        this.E_RESIZE = "e-resize";
    }
]);

pkg.MouseListener       = Interface();
pkg.MouseMotionListener = Interface();
pkg.FocusListener       = Interface();
pkg.KeyListener         = Interface();
pkg.ChildrenListener    = Interface();
pkg.WinListener         = Interface();
pkg.ScrollListener      = Interface();
pkg.ExternalEditor      = Interface();

pkg.ComponentListener = Interface();
var CL = pkg.ComponentListener;
CL.COMP_ENABLED = 1;
CL.COMP_SHOWN   = 2;
CL.COMP_MOVED   = 3;
CL.COMP_SIZED   = 4;

pkg.ContainerListener = Interface();
var CNL = pkg.ContainerListener;
CNL.COMP_ADDED = 1;
CNL.COMP_REMOVED = 2;
CNL.LAYOUT_SET = 3;

var InputEvent = pkg.InputEvent = Class([
    function $clazz() {
        this.MOUSE_UID    = 1;
        this.KEY_UID      = 2;
        this.FOCUS_UID    = 3;
        this.FOCUS_LOST   = 1;
        this.FOCUS_GAINED = 2;
    },

    function (target, id){
        this.source = target;
        if (id != InputEvent.FOCUS_GAINED && id != InputEvent.FOCUS_LOST) throw new Error();
        this.UID = InputEvent.FOCUS_UID;
        this.ID = id;
    },

    function (target, id, uid){
        this.source = target;
        this.ID = id;
        this.UID = uid;
    }
]);

var KE = pkg.KeyEvent = Class(InputEvent, [
    function $clazz() {
        this.TYPED    = 3;
        this.RELEASED = 4;
        this.PRESSED  = 5;

        this.CTRL  = 1;
        this.SHIFT = 2;
        this.ALT   = 4;
        this.CMD   = 8;

        this.VK_ENTER = 13;
        this.VK_ESCAPE = 27;
        this.VK_LEFT = 37;
        this.VK_RIGHT = 39;
        this.VK_UP = 38;
        this.VK_DOWN = 40;
        this.VK_SPACE = 32;
        this.VK_TAB = 9;
        this.VK_SHIFT = 16;
        this.VK_CONTROL = 17;
        this.VK_ALT = 18;

        this.VK_HOME = 36;
        this.VK_END = 35;
        this.VK_PAGE_UP = 33;
        this.VK_PAGE_DOWN = 34;

        this.VK_INSERT = 45;
        this.VK_DELETE = 46;
        this.VK_BACK_SPACE = 8;

        this.VK_C = 67;
        this.VK_A = 65;
        this.VK_V = 86;

        this.CHAR_UNDEFINED = 0;
    },

    function $prototype() {
        this.reset = function(target,id,code,ch,mask){
            this.source = target;
            this.ID = id;
            this.code = code;
            this.mask = mask;
            this.ch = ch;
        };

        this.isControlPressed = function(){ return (this.mask & KE.CTRL) > 0; };
        this.isShiftPressed = function(){ return (this.mask & KE.SHIFT) > 0; };
        this.isAltPressed = function(){ return (this.mask & KE.ALT) > 0; };
        this.isCmdPressed = function(){ return (this.mask & KE.CMD) > 0; };
    },

    function (target,id,code,ch,mask){
        this.$super(target, id, InputEvent.KEY_UID);
        this.reset(target, id, code, ch, mask);
    }
]);

var ME = pkg.MouseEvent = Class(InputEvent, [
    function $clazz() {
        this.CLICKED      = 6;
        this.PRESSED      = 7;
        this.RELEASED     = 8;
        this.ENTERED      = 9;
        this.EXITED       = 10;
        this.DRAGGED      = 11;
        this.STARTDRAGGED = 12;
        this.ENDDRAGGED   = 13;
        this.MOVED        = 14;
        this.LEFT_BUTTON  = 1;
        this.RIGHT_BUTTON = 4;
    },

    function $prototype() {
        this.reset = function(target,id,ax,ay,mask,clicks){
            this.source = target;
            this.ID = id;
            this.absX = ax;
            this.absY = ay;
            this.mask = mask;
            this.clicks = clicks;

            var p = L.getTopParent(target);
            while(target != p){
                ax -= target.x;
                ay -= target.y;
                target = target.parent;
            }
            this.x = ax;
            this.y = ay;
        };

        this.isActionMask = function(){
            return this.mask === 0 || ((this.mask & ME.LEFT_BUTTON) > 0 && (this.mask & ME.RIGHT_BUTTON) === 0);
        };

        this.isControlPressed = function(){ return (this.mask & KE.CTRL) > 0; };
        this.isShiftPressed = function(){ return (this.mask & KE.SHIFT) > 0; };
    },

    function (target,id,ax,ay,mask,clicks){
        this.$super(target, id, pkg.InputEvent.MOUSE_UID);
        this.reset(target, id, ax, ay, mask, clicks);
    }
]);

pkg.Cursorable = Interface();
pkg.Composite  = Interface();
pkg.Desktop    = Interface();
pkg.Layer      = Interface();
pkg.PopupInfo  = Interface();

var MB = zebra.util,Composite = pkg.Composite, rgb = zebra.util.rgb, Layer = pkg.Layer, ViewSet = pkg.view.ViewSet,
    TextRender = pkg.view.TextRender, MouseListener = pkg.MouseListener, Cursor = pkg.Cursor, TextModel = zebra.data.TextModel,
    Render = pkg.view.Render, temporary = { x:0, y:0, width:0, height:0 }, Actionable = zebra.util.Actionable,
    timer = zebra.util.timer, KeyListener = pkg.KeyListener, Cursorable = pkg.Cursorable, FocusListener = pkg.FocusListener,
    ChildrenListener = pkg.ChildrenListener, MouseMotionListener = pkg.MouseMotionListener, Listeners = zebra.util.Listeners;

pkg.getDesktop = function(c){
    c = L.getTopParent(c);
    return instanceOf(c, pkg.Desktop) ? c : null;
};

pkg.makeFullyVisible = function(d,c){
    var right = d.getRight(), top = d.getTop(), bottom = d.getBottom(), left = d.getLeft(),
        xx = c.x, yy = c.y, ww = c.width, hh = c.height;
    if (xx < left) xx = left;
    if (yy < top) yy = top;
    if (xx + ww > d.width - right) xx = d.width + right - ww;
    if (yy + hh > d.height - bottom) yy = d.height + bottom - hh;
    c.setLocation(xx, yy);
};

pkg.calcOrigin = function(x,y,w,h,px,py,t,tt,ll,bb,rr){
    if (arguments.length < 8) {
        tt = t.getTop();
        ll = t.getLeft();
        bb = t.getBottom();
        rr = t.getRight();
    }

    var dw = t.width, dh = t.height;
    if(dw > 0 && dh > 0){
        if(dw - ll - rr > w){
            var xx = x + px;
            if(xx < ll) px += (ll - xx);
            else {
                xx += w;
                if(xx > dw - rr) px -= (xx - dw + rr);
            }
        }
        if(dh - tt - bb > h){
            var yy = y + py;
            if (yy < tt) py += (tt - yy);
            else {
                yy += h;
                if (yy > dh - bb) py -= (yy - dh + bb);
            }
        }
        return [px, py];
    }
    return [0, 0];
};

pkg.loadImage = function(path, ready) {
    var i = new Image();
    zebra.busy();
    if (arguments.length > 1)  {
        i.onerror = function() {  zebra.ready(); ready(path, false);  };
        i.onload  = function() {  zebra.ready(); ready(path, true);  };
    }
    else {
        i.onload  =  i.onerror = function() { zebra.ready(); };
    }
    i.src = path;
    return i;
};

pkg.Bag = Class(zebra.util.Bag,[
    function() {
        this.$super();

        var pkgs = [ pkg.view, zebra.layout ];
        for (var i = 0; i < pkgs.length; i++) {
            for(var k in pkgs[i]) {
                var v = pkgs[i][k];
                if (v && instanceOf(v, Class)) this.aliases[k] = v;
            }
        }
        this.aliases["Font"] = pkg.Font;
        this.put("ui", pkg);
        for(var k in rgb) if (rgb[k] instanceof rgb) this.put(k, rgb[k]);
    },

    function path(p) { return this.root ? this.root.join(p) : p;  },

    function load(path) { this.load(path, null); },

    function load(path, context) {
        try {
            zebra.busy();
            this.root = null;

            if (zebra.URL.isAbsolute(path) || context == null) this.root = (new zebra.URL(path)).getParentURL();
            else {
                if (context != null) {
                    path = new zebra.URL(context.$url.join(path));
                    this.root = path.getParentURL();
                }
            }
            this.$super(zebra.io.GET(path.toString()));
        }
        catch(e) { throw e; }
        finally { zebra.ready(); }
    }
]);

pkg.paintManager = pkg.events = null;
pkg.$objects = new pkg.Bag();
pkg.get = function(key) { return pkg.$objects.get(key); }

pkg.Panel = Class(L.Layoutable, [
     function $prototype() {
        this.top = this.left = this.right = this.bottom = 0;
        this.isEnabled = true;

        this.notifyRender = function(o,n){
            if (o != null && o.ownerChanged) o.ownerChanged(null);
            if (n != null && n.ownerChanged) n.ownerChanged(this);
        };

        this.getComponentAt = function(xx,yy){
            var r = cvp(this, temporary);
            if (r == null || (xx < r.x || yy < r.y || xx >= r.x + r.width || yy >= r.y + r.height)) return null;

            var k = this.kids;
            if(k.length > 0){
                for(var i = k.length; --i >= 0; ){
                    var d = k[i];
                    d = d.getComponentAt(xx - d.x, yy - d.y);
                    if(d != null) return d;
                }
            }
            return this.contains(xx, yy) ? this : null;
        };

        this.contains = function(x,y) { return true; };

        this.vrp = function(){
            this.invalidate();
            if(this.parent != null) this.repaint();
        };

        this.customize = function(id) { pkg.wizard.customize(id, this);  };

        this.getTop    = function() { return this.border != null ? this.top    + this.border.getTop()    : this.top;    };
        this.getLeft   = function() { return this.border != null ? this.left   + this.border.getLeft()   : this.left;   };
        this.getBottom = function() { return this.border != null ? this.bottom + this.border.getBottom() : this.bottom; };
        this.getRight  = function() { return this.border != null ? this.right  + this.border.getRight()  : this.right;  };

        this.isInvalidatedByChild = function(c) { return true; };

        this.kidAdded = function (index,constr,l){
            pkg.events.performCont(CNL.COMP_ADDED, this, constr, l);
            if(l.width > 0 && l.height > 0) l.repaint();
            else this.repaint(l.x, l.y, 1, 1);
        };

        this.kidRemoved = function(i,l){
            pkg.events.performCont(CNL.COMP_REMOVED, this, null, l);
            if (l.isVisible) this.repaint(l.x, l.y, l.width, l.height);
        };

        this.layoutSet = function (old){ pkg.events.performCont(CNL.LAYOUT_SET, this, old, null); };
        this.relocated = function(px,py){ pkg.events.performComp(CL.COMP_MOVED, px, py, this); };
        this.resized   = function(pw,ph){ pkg.events.performComp(CL.COMP_SIZED, pw, ph, this); };
        this.hasFocus = function(){ return pkg.focusManager.hasFocus(this); };
        this.requestFocus = function(){ pkg.focusManager.requestFocus(this); };

        this.setVisible = function (b){
            if (this.isVisible != b) {
                this.isVisible = b;
                this.invalidate();
                pkg.events.performComp(CL.COMP_SHOWN,  -1,  -1, this);
            }
        };

        this.getScrollManager = function () { return null; };

        this.setEnabled = function (b){
            if(this.isEnabled != b){
                this.isEnabled = b;
                pkg.events.performComp(CL.COMP_ENABLED,  -1,  -1, this);
                if(this.kids.length > 0) for(var i = 0;i < this.kids.length; i++) this.kids[i].setEnabled(b);
            }
        };

        this.paddings = function (top,left,bottom,right){
            if(this.top != top || this.left != left || this.bottom != bottom || this.right != right) {
                this.top = top;
                this.left = left;
                this.bottom = bottom;
                this.right = right;
                this.vrp();
            }
        },

        this.padding = function(v) { this.paddings(v,v,v,v); };

        this.setBorder = function (v){
            var old = this.border;
            if (v != old){
                this.border = v;
                this.notifyRender(old, v);

                if ( old == null || v == null         ||
                     old.getTop()    != v.getTop()    ||
                     old.getLeft()   != v.getLeft()   ||
                     old.getBottom() != v.getBottom() ||
                     old.getRight()  != v.getRight())
                {
                    this.invalidate();
                }
                this.repaint();
            }
        };
    },

    function() { this.$super(); },

    function(l) {
        this.$this();
        this.setLayout(l);
    },

    function setBackground(v){ this.setBackground(v, false); },

    function setBackground(v, applyToKids){
        var old = this.bg;

        if (zebra.isString(v)) {
            v = pkg.view.Fill.hasOwnProperty(v) ? pkg.view.Fill[v]
                                                : new pkg.view.Fill(v);
        }
        else {
            if (v instanceof rgb) v = new pkg.view.Fill(v);
        }

        if(v != old){
            this.bg = v;
            this.notifyRender(old, v);
            this.repaint();
        }

        if(applyToKids && this.kids.length > 0){
            for(var i = 0;i < this.kids.length; i++) this.kids[i].setBackground(v, applyToKids);
        }
    },

    function add(c){ return this.insert(this.kids.length, null, c); },
    function insert(i,d) { return this.insert(i, null, d); },

    function removeAll(){
        if(this.kids.length > 0){
            var size = this.kids.length, mx1 = Number.MAX_VALUE, my1 = mx1, mx2 = 0, my2 = 0;
            for(; size > 0; size--){
                var child = this.kids[size - 1];
                if(child.isVisible){
                    var xx = child.x, yy = child.y;
                    mx1 = Math.min(mx1, xx);
                    my1 = Math.min(my1, yy);
                    mx2 = Math.max(mx2, xx + child.width);
                    my2 = Math.max(my2, yy + child.height);
                }
                this.removeAt(size - 1);
            }
            this.repaint(mx1, my1, mx2 - mx1, my2 - my1);
        }
    },

    function toFront(c){
        var i = this.indexOf(c);
        if(i < (this.kids.length - 1)){
            this.kids.splice(i, 1);
            this.kids.push(c);
            c.repaint();
        }
    },

    function repaint() { this.repaint(0, 0, this.width, this.height); },

    function repaint(x,y,w,h){
        if (this.parent != null && this.width > 0 && this.height > 0 && pkg.paintManager != null){
            pkg.paintManager.repaint(this, x, y, w, h);
        }
    },

    function toPreferredSize(){
        var ps = this.getPreferredSize();
        this.setSize(ps.width, ps.height);
    }
]);

pkg.Wizard = Class([
    function $clazz() {
        this.TFIELD = 0;
        this.LIST = 1;
        this.COMBO = 2;
        this.BUTTON = 3;
        this.CHECKBOX = 4;
        this.SCROLL = 5;
        this.WIN = 6;
        this.SPIN = 7;
        this.SLIDER = 8;
        this.GRID = 9;
        this.GRIDCAP = 10;
        this.MENU = 11;
        this.MENUBAR = 12;
        this.SPLITTER = 13;
        this.TREE = 14;
        this.NOTE = 15;
        this.PROGRESS = 16;
        this.SBAR = 17;
        this.SCROLLPAN = 18;
        this.BRPAN = 19;
        this.TOOLBAR = 20;
    },

    function $prototype() {
        this.customize = function(id,comp) {};
    }
]);

pkg.BaseLayer = Class(pkg.Panel, Layer, [
    function $prototype() {
        this.isLayerActive = function(){ return true;};
        this.isLayerActiveAt = function(x,y){return true;};

        this.layerMousePressed = function(x,y,m){};
        this.layerKeyPressed = function(code,m){};
        this.getFocusRoot = function() { return this; };
    },

    function (id){
        if (id == null) throw new Error("Wrong ID");
        this.pfo = null;
        this.$super();
        this.id = id;
    },

    function activate(b){
        var fo = pkg.focusManager.focusOwner;
        if (L.isAncestorOf(this, fo) === false) fo = null;
        if (b) pkg.focusManager.requestFocus(fo != null ? fo : pfo);
        else {
            this.pfo = fo;
            pkg.focusManager.requestFocus(null);
        }
    }
]);

pkg.ViewPan = Class(pkg.Panel, [
    function $prototype() {
        this.paint = function (g){
            var v = this.view;
            if(v != null){
                var l = this.getLeft(), r = this.getRight(), t = this.getTop(), b = this.getBottom();
                v.paint(g, l, t, this.width - l - r, this.height - t - b, this);
            }
        };

        this.setView = function (v){
            var old = this.view;
            if(v != old) {
                this.view = v;
                this.notifyRender(old, v);
                this.vrp();
            }
        };

        this.calcPreferredSize = function (t) {
            return this.view ? this.view.getPreferredSize() : { width:0, height:0 };
        };
    }
]);

pkg.Label = Class(pkg.ViewPan, [
    function () { this.$this(""); },

    function (r){
        this.$super();
        if (zebra.isString(r)) r = new zebra.data.SingleLineTxt(r);
        this.setView(instanceOf(r, TextModel) ? new TextRender(r) : r);
        this.padding(1);
    },

    function getText(){ return this.view.getText(); },
    function getModel(){ return this.view.target; },
    function wrapText(){ this.setView(new zebra.view.WrappedText(this.view.target)); },
    function getFont(){ return this.view.font; },
    function getForeground(){ return this.view.foreground; },

    function setText(s){
        this.view.setText(s);
        this.repaint();
    },

    function setForeground(c){
        if (!this.getForeground().equals(c)){
            this.view.setForeground(c);
            this.repaint();
        }
    },

    function setFont(f){
        if (!this.getFont().equals(f)){
            this.view.setFont(f);
            this.repaint();
        }
    }
]);

pkg.ImagePan = Class(pkg.ViewPan, [
    function () { this.$this(null); },

    function (img){
        this.setImage(img);
        this.$super();
    },

    function setImage(img) {
        if (img && zebra.isString(img)) {
            var $this = this;
            img = pkg.loadImage(img, function(b) { if (b) $this.vrp(); });
        }
        this.setView(instanceOf(img, pkg.view.Picture) ? img : new pkg.view.Picture(img));
    }
]);

pkg.ImageLabel = Class(pkg.Panel, [
    function(txt, img) {
        this.$super(new L.FlowLayout(L.LEFT, L.CENTER, L.HORIZONTAL, 6));
        this.add(new pkg.ImagePan(img));
        this.add(new pkg.Label(txt));
    }
]);

var OVER = 0, PRESSED_OVER = 1, OUT = 2, PRESSED_OUT = 3, DISABLED = 4;
pkg.StatePan = Class(pkg.ViewPan, FocusListener, Composite, MouseListener, MouseMotionListener, KeyListener, [
    function $clazz() {
        this.OVER = OVER;
        this.PRESSED_OVER = PRESSED_OVER;
        this.OUT = OUT;
        this.PRESSED_OUT = PRESSED_OUT;
        this.DISABLED = DISABLED;
    },

    function $prototype() {
        var IDS = [ "over", "pressed", "out", "out", "disabled" ];

        this.state = OUT;
        this.isCanHaveFocus = false;
        this.focusComponent = this.focusMarkerView = null;

        this.idByState = function(s) { return IDS[s]; };

        this.updateState = function(s) {
            if(s != this.state){
                var prev = this.state;
                this.state = s;
                this.stateUpdated(prev, s);
            }
        };

        this.stateUpdated = function(o,n){
            var id = this.idByState(n), b = false;

            for(var i=0; i < this.kids.length; i++) {
                if (this.kids[i].parentStateUpdated) {
                    this.kids[i].parentStateUpdated(o, n, id);
                }
            }

            if (this.border && this.border.activate) b = this.border.activate(id) || b;
            if (this.view   && this.view.activate)  b = this.view.activate(id) || b;
            if (this.bg     && this.bg.activate)   b = this.bg.activate() || b;

            if (b) this.repaint();
        };

        this.keyPressed = function(e){
            if(this.state != PRESSED_OVER && this.state != PRESSED_OUT &&
                (e.code == KE.VK_ENTER || e.code == KE.VK_SPACE))
            {
                this.updateState(PRESSED_OVER);
            }
        };

        this.keyReleased = function(e){
            if(this.state == PRESSED_OVER || this.state == PRESSED_OUT){
                this.updateState(OVER);
                if (pkg.$mouseMoveOwner != this) this.updateState(OUT);
            }
        };

        this.mouseEntered = function (e){
            if (this.isEnabled) this.updateState(this.state == PRESSED_OUT ? PRESSED_OVER : OVER);
        };

        this.mouseExited = function(e){
            if (this.isEnabled) this.updateState(this.state == PRESSED_OVER ? PRESSED_OUT : OUT);
        };

        this.mousePressed = function(e){
            if(this.state != PRESSED_OVER && this.state != PRESSED_OUT && e.isActionMask()){
                this.updateState(pkg.$mouseMoveOwner == this ? PRESSED_OVER : PRESSED_OUT);
            }
        };

        this.mouseReleased = function(e){
            if((this.state == PRESSED_OVER || this.state == PRESSED_OUT) && e.isActionMask()){
                this.updateState(pkg.$mouseMoveOwner == this ? OVER : OUT);
            }
        };

        this.mouseDragged = function(e){
            if(e.isActionMask()){
                var pressed = (this.state == PRESSED_OUT || this.state == PRESSED_OVER);
                if (e.x > 0 && e.y > 0 && e.x < this.width && e.y < this.height) {
                    this.updateState(pressed ? PRESSED_OVER : OVER);
                }
                else this.updateState(pressed ? PRESSED_OUT : OUT);
            }
        };

        this.canHaveFocus = function (){ return this.isCanHaveFocus; };
        this.focusGained = function (e){ this.repaint(); };
        this.focusLost = function (e){ this.repaint(); };

        this.paintOnTop = function(g){
            var fc = this.focusComponent;
            if (this.focusMarkerView != null &&  fc != null && this.hasFocus()) {
                this.focusMarkerView.paint(g, fc.x, fc.y, fc.width, fc.height, this);
            }
        };
    },

    function() {
        this.$super();
        this.focusMarker = pkg.get("br.dot");
    },

    function setCanHaveFocus(b){
        if(this.isCanHaveFocus != b){
            var fm = pkg.focusManager;
            if (!b && fm.focusOwner == this) fm.requestFocus(null);
            this.isCanHaveFocus = b;
        }
    },

    function setView(v){
        if (v != this.view){
            v = this.createViewSet(v);
            this.$super(v);
            this.stateUpdated(this.state, this.state);
        }
    },

    function setBorder(v){
        if(v != this.border){
            v = this.createViewSet(v);
            this.$super(v);
            this.stateUpdated(this.state, this.state);
        }
    },

    function setBackground(v){
        if(v != this.bg){
            v = this.createViewSet(v);
            this.$super(v);
            this.stateUpdated(this.state, this.state);
        }
    },

    function createViewSet(v) {
        if (instanceOf(v, pkg.view.View)) return v;
        var s = new ViewSet();
        for (var k in v) if (v.hasOwnProperty(k)) s.put(k, v[k]);
        return s;
    },

    function setEnabled(b){
        this.$super(b);
        this.updateState(b ? OUT : DISABLED);
    },

    function addFocusComponent(c) {
        if (this.focusComponent != c) {
            if (c != null && this.kids.indexOf(c) >= 0) throw Error();
            this.focusComponent = c;
            this.isCanHaveFocus = (c != null);
            if (c != null) this.add(c);
        }
    },

    function setFocusMarkerView(c){
        if(c != this.focusMarkerView){
            this.focusMarkerView = c;
            this.repaint();
        }
    },

    function kidRemoved(i,l){
        if(l == this.focusComponent) this.focusComponent = null;
        this.$super(i, l);
    }
]);

pkg.Button = Class(pkg.StatePan, Actionable, [
    function $clazz() {  
        this.Label = Class(pkg.Label, []); 

        //!!! should be identified automatically
        this.Label.$name = "Label";
    },

    function $prototype() {
        this.isFireByPress = true;
        this.firePeriod    = 20;
        this.isCanHaveFocus = true;

        this.fire = function() { this._.fire(this); };
        this.run = function(){ if (this.state == PRESSED_OVER) this.fire(); };
    },

    function() { this.$this(null); },

    function (t){
        this.$super();
        this._ = new Listeners();

        if (zebra.isString(t)) {
            t = new pkg.Button.Label(t)
            var c = pkg.get("bt.lab.fg"), f = pkg.get("bt.lab.fn");
            if (c != null) t.setForeground(c);
            if (f != null) t.setFont(f);
        }

        if (t != null){
            this.setLayout(pkg.get("ac.lay"));
            this.addFocusComponent(t);
            this.setBorder(pkg.get("bt.br"));
            if (pkg.get("bt.marker") != null) this.setFocusMarkerView(pkg.get("bt.marker"));
            this.padding(4);
        }
        this.customize(pkg.Wizard.BUTTON);
    },

    function stateUpdated(o,n){
        this.$super(o, n);
        if(n == PRESSED_OVER){
            if(this.isFireByPress){
                this.fire();
                if (this.firePeriod > 0) timer.run(this, 400, this.firePeriod);
            }
        }
        else {
            if (this.firePeriod > 0 && timer.get(this) != null)  timer.remove(this);
            if(n == OVER && (o == PRESSED_OVER && this.isFireByPress === false)) this.fire();
        }
    },

    function setFireParams(b,time){
        this.isFireByPress = b;
        this.firePeriod = time;
    }
]);

pkg.BorderPan = Class(pkg.Panel, pkg.view.TitleInfo, [
    function $clazz() { 
        this.Label = Class(pkg.Label, []);

        //!!! should be identified automatically
        this.Label.$name = "Label";
    },

    function $prototype() {
         this.getTitleInfo = function() {
            return (this.label != null) ? { x:this.label.x, y:this.label.y,
                                            width:this.label.width, height:this.label.height,
                                            orient:this.label.constraints & (L.TOP | L.BOTTOM) }
                                        : null;
        };
    },

    function(title) { this.$this(title, null); },
    function() { this.$this(null); },
    function(title, center) { this.$this(title, center, L.TOP | L.LEFT); },

    function(title, center, ctr){
        if (zebra.isString(title)) {
            title = new pkg.BorderPan.Label(title);
            title.setFont(pkg.get("bp.title.fn"));
            title.setForeground(pkg.get("bp.title.fg"));
        }

        this.vGap = this.hGap = 0;
        this.label = this.center= null;
        this.indent = 4;
        this.$super();
        this.setBorder(pkg.get("bp.br"));
        this.setBackground(pkg.get("bp.bg"));

        if(title != null) this.add(ctr, title);
        if(center != null) this.add(L.CENTER, center);
        this.customize(pkg.Wizard.BRPAN);
    },

    function setGaps(vg,hg){
        if(this.vGap != vg || hg != this.hGap){
            this.vGap = vg;
            this.hGap = hg;
            this.vrp();
        }
    },

    function kidAdded(index,id,lw){
        this.$super(index, id, lw);
        if(L.CENTER == id) this.center = lw;
        else this.label = lw;
    },

    function kidRemoved(index,lw){
        this.$super(index, lw);
        if(lw == this.label) this.label = null;
        else this.center = null;
    },

    function calcPreferredSize(target){
        var ps = this.center != null && this.center.isVisible ? this.center.getPreferredSize()
                                                              : { width:0, height:0 };
        if(this.label != null && this.label.isVisible){
            var lps = this.label.getPreferredSize();
            ps.height += lps.height;
            ps.width = Math.max(ps.width, lps.width + this.indent);
        }
        ps.width += (this.hGap * 2);
        ps.height += (this.vGap * 2);
        return ps;
    },

    function doLayout(target){
        var h = 0, right = this.getRight(), top = this.getTop(), bottom = this.getBottom(), left = this.getLeft(),
            xa = this.label ? this.label.constraints & (L.LEFT | L.CENTER | L.RIGHT): 0,
            ya = this.label ? this.label.constraints & (L.BOTTOM | L.TOP) : 0;

        if(this.label != null && this.label.isVisible){
            var ps = this.label.getPreferredSize();
            h = ps.height;
            this.label.setSize(ps.width, h);
            this.label.setLocation((xa == L.LEFT) ? left + this.indent
                                                  : ((xa == L.RIGHT) ? this.width - right - ps.width - this.indent
                                                                                               :  ~~((this.width - ps.width) / 2)),
                                    (ya == L.BOTTOM) ? (this.height - bottom - ps.height) : top);
        }

        if(this.center != null && this.center.isVisible){
            this.center.setLocation(left + this.hGap, (ya == L.BOTTOM ? top : top + h) + this.vGap);
            this.center.setSize(this.width - right - left - 2 * this.hGap, this.height - top - bottom - h - 2 * this.vGap);
        }
    },

    function set(ctr,c){
        var rc = (CENTER == ctr) ? this.center : this.label;
        if(rc != null) this.remove(rc);
        this.add(ctr, c);
    }
]);

pkg.SwitchManager = Class([
    function $prototype() {
        this.getState = function(o) { return this.state; };

        this.setState = function(o,b) {
            if(this.getState(o) != b){
                this.state = b;
                this.updated(o, b);
            }
        };

        this.updated = function(o, b){
            if (o != null) o.switched(b);
            this._.fire(this, o);
        };
    },

    function () {
        this.state = false;
        this._ = new Listeners();
    },

    function install(o) { o.switched(this.getState(o)); },
    function uninstall(o){}
]);

pkg.Group = Class(pkg.SwitchManager, [
    function (){
        this.$super();
        this.state = null;
    },

    function getState(o) { return o == this.state; },

    function setState(o,b){
        if(this.getState(o) != b){
            this.clearSelected();
            this.state = o;
            this.updated(o, true);
        }
    },

    function clearSelected(){
        if(this.state != null){
            var old = this.state;
            this.state = null;
            this.updated(old, false);
        }
    }
]);

pkg.Checkbox = Class(pkg.StatePan, Actionable, [
    function $clazz() {
        var IDS = ["on", "off", "don", "doff", "onover", "offover"];

        this.RADIO = 1;
        this.CHECK = 2;

        this.BoxPan = Class(pkg.ViewPan, [
            function(pr) {
                this.$super();
                var set = new ViewSet();
                for(var i = 0;i < IDS.length; i++) set.put(IDS[i], pkg.get(pr + "." + IDS[i]));
                this.setView(set);
            },

            function parentStateUpdated(o, n, id) {
                this.view.activate(id);
                this.repaint();
            }
        ]);

        this.CBox  = Class(this.BoxPan, [ function() { this.$super("ch"); } ]);
        this.RBox  = Class(this.BoxPan, [ function() { this.$super("rd"); } ]);
        this.Label = Class(pkg.Label, []);

        //!!! should be identified automatically
        this.Label.$name = "Label";
        this.CBox.$name = "CBox";
        this.RBox.$name = "RBox";
    },

    function $prototype() {
       this.setState = function(b){ this.manager.setState(this, b); };
       this.getState = function() { return this.manager.getState(this); };
       this.switched = function(b){ this.stateUpdated(this.state, this.state); };

       this.idByState = function(state){
           if(this.isEnabled) {
               var id = this.getState() ? "on" : "off";
               return (this.state == OVER) ? id.concat("over") : id;
           }
           return this.getState() ? "don" : "doff";
       };
    },

    function () { this.$this(null); },
    function (lab){ this.$this(lab, pkg.Checkbox.CHECK); },

    function (c,type){
        if (zebra.isString(c)) c = new pkg.Checkbox.Label(c);
        this.$super();

        this.setLayout(pkg.get("ch.lay"));
        this.add((type == pkg.Checkbox.CHECK ? new pkg.Checkbox.CBox()
                                             : new pkg.Checkbox.RBox()));

        this.setFocusMarkerView(pkg.get("bt.marker"));
        if (c != null) {
            this.addFocusComponent(c);
        }

        this.manager = null;
        this.type = type;
        this.setSwitchManager(new pkg.SwitchManager());
        this.padding(2);
    },

    function keyPressed(e){
        if(instanceOf(this.manager, pkg.Group) && this.getState()){
            var code = e.code, d = 0;
            if(code == KE.VK_LEFT || code == KE.VK_UP) d = -1;
            else if (code == KE.VK_RIGHT || code == KE.VK_DOWN) d = 1;

            if(d !== 0) {
                var p = this.parent, idx = p.indexOf(this);
                for(var i = idx + d;i < p.kids.length && i >= 0; i += d){
                    var l = p.kids[i];
                    if(l.isVisible && l.isEnabled && instanceOf(l, pkg.Checkbox) && l.manager == this.manager){
                        l.requestFocus();
                        l.setState(true);
                        break;
                    }
                }
                return ;
            }
        }
        this.$super(e);
    },

    function setSwitchManager(m){
        if(m == null) throw new Error();
        if(this.manager != m){
            if(this.manager != null) this.manager.uninstall(this);
            this.manager = m;
            this.manager.install(this);
        }
    },

    function stateUpdated(o, n) {
        if (o == PRESSED_OVER && n == OVER) this.setState(!this.getState());
        this.$super(o, n);
    }

    //function recalc(){ this.sync();}
]);

pkg.SplitPan = Class(pkg.Panel, MouseMotionListener, Composite, Cursorable, [
    function $clazz() {
        this.Bar = Class(pkg.Panel, [
            function() {
                this.$super();
                this.setBorder(pkg.get("split.bar.br"));
                this.setBackground(pkg.get("split.bar.bg"));
                var bps = pkg.get("split.bar.ps");
                if(bps != null) this.setPreferredSize(bps.width, bps.height);
            }
        ]);
    },

    function $prototype() {
        this.leftMinSize = this.rightMaxSize = 50;
        this.isMoveable = true;

        this.getCursorType = function(t,x,y){
            return this.isInGripper(this.gripper, x, y) ? this.orientation == L.VERTICAL ? Cursor.W_RESIZE
                                                                                         : Cursor.N_RESIZE : -1;
        };

        this.catchInput = function(c) { return c == this.gripper; };

        this.mouseDragged = function(e){
            if(this.isDragged === true){
                var x = e.x, y = e.y;
                if(this.orientation == L.VERTICAL){
                    if(this.prevLoc != x){
                        x = this.normalizeBarLoc(x);
                        if(x > 0){
                            this.prevLoc = x;
                            this.setGripperLoc(x);
                        }
                    }
                }
                else{
                    if(this.prevLoc != y){
                        y = this.normalizeBarLoc(y);
                        if(y > 0){
                            this.prevLoc = y;
                            this.setGripperLoc(y);
                        }
                    }
                }
            }
        };

        this.normalizeBarLoc = function(xy){
            if(xy < this.minXY) xy = this.minXY;
            else if(xy > this.maxXY) xy = this.maxXY;
            return (xy > this.maxXY || xy < this.minXY) ?  -1 : xy;
        };

        this.isInGripper = function(g, x, y){ return g != null && x >= g.x && y >= g.y && x < g.x + g.width && y < g.y + g.height; };

        this.setGripperLoc = function(l){
            if(l != this.barLocation){
                this.barLocation = l;
                this.vrp();
            }
        };

        this.calcPreferredSize = function(c){
            var fSize = pkg.getPreferredSize(this.leftComp),
                sSize = pkg.getPreferredSize(this.rightComp),
                bSize = pkg.getPreferredSize(this.gripper);

            if(this.orientation == L.HORIZONTAL){
                bSize.width = Math.max(Math.max(fSize.width, sSize.width), bSize.width);
                bSize.height = fSize.height + sSize.height + bSize.height + 2 * this.gap;
            }
            else{
                bSize.width = fSize.width + sSize.width + bSize.width + 2 * this.gap;
                bSize.height = Math.max(Math.max(fSize.height, sSize.height), bSize.height);
            }
            return bSize;
        };

        this.doLayout = function(target){
            var right = this.getRight(), top = this.getTop(), bottom = this.getBottom(),
                left = this.getLeft(), gap = this.gap, bSize = pkg.getPreferredSize(this.gripper);

            if (this.orientation == L.HORIZONTAL){
                var w = this.width - left - right;
                if(this.barLocation < top) this.barLocation = top;
                else {
                    if(this.barLocation > this.height - bottom - bSize.height) {
                        this.barLocation = this.height - bottom - bSize.height;
                    }
                }

                if(this.gripper != null){
                    if(this.isMoveable){
                        this.gripper.setLocation(left, this.barLocation);
                        this.gripper.setSize(w, bSize.height);
                    }
                    else{
                        this.gripper.setSize(bSize.width, bSize.height);
                        this.gripper.toPreferredSize();
                        this.gripper.setLocation(~~((w - bSize.width) / 2), this.barLocation);
                    }
                }
                if(this.leftComp != null){
                    this.leftComp.setLocation(left, top);
                    this.leftComp.setSize(w, this.barLocation - gap - top);
                }
                if(this.rightComp != null){
                    this.rightComp.setLocation(left, this.barLocation + bSize.height + gap);
                    this.rightComp.setSize(w, this.height - this.rightComp.y - bottom);
                }
            }
            else{
                var h = this.height - top - bottom;
                if(this.barLocation < left) this.barLocation = left;
                else {
                    if (this.barLocation > this.width - right - bSize.width) {
                        this.barLocation = this.width - right - bSize.width;
                    }
                }

                if (this.gripper != null){
                    if(this.isMoveable){
                        this.gripper.setLocation(this.barLocation, top);
                        this.gripper.setSize(bSize.width, h);
                    }
                    else{
                        this.gripper.setSize(bSize.width, bSize.height);
                        this.gripper.setLocation(this.barLocation, ~~((h - bSize.height) / 2));
                    }
                }

                if (this.leftComp != null){
                    this.leftComp.setLocation(left, top);
                    this.leftComp.setSize(this.barLocation - left - gap, h);
                }

                if(this.rightComp != null){
                    this.rightComp.setLocation(this.barLocation + bSize.width + gap, top);
                    this.rightComp.setSize(this.width - this.rightComp.x - right, h);
                }
            }
        };
    },

    function (){ this.$this(null, null, L.VERTICAL); },
    function (f,s){ this.$this(f, s, L.VERTICAL); },

    function (f,s,o){
        this.$super();

        this.isDragged = false;
        this.prevLoc = this.orientation = this.gap = this.minXY = this.maxXY = 0;
        this.barLocation = 70;
        this.leftComp = this.rightComp = this.gripper = null;
        this.setBorder(pkg.get("split.br"));
        this.setOrientation(o);
        this.setGap(1);
        if(f != null) this.add(L.LEFT, f);
        if(s != null) this.add(L.RIGHT, s);
        this.add(L.CENTER, new pkg.SplitPan.Bar());
        this.padding(2);
        this.customize(pkg.Wizard.SPLITTER);
    },

    function setGap(g){
        if(this.gap != g){
            this.gap = g;
            this.vrp();
        }
    },

    function setLeftMinSize(m){
        if(this.leftMinSize != m){
            this.leftMinSize = m;
            this.vrp();
        }
    },

    function setRightMaxSize(m){
        if(this.rightMaxSize != m){
            this.rightMaxSize = m;
            this.vrp();
        }
    },

    function setOrientation(o){
        if(o != L.VERTICAL && o != L.HORIZONTAL) throw new Error();
        if(this.orientation != o){
            this.orientation = o;
            this.vrp();
        }
    },

    function startDragged(e){
        var x = e.x, y = e.y;
        if(e.isActionMask() && this.isInGripper(this.gripper, x, y)){
            this.isDragged = true;
            if(this.orientation == L.VERTICAL){
                x = this.normalizeBarLoc(x);
                if(x > 0) this.prevLoc = x;
            }
            else{
                y = this.normalizeBarLoc(y);
                if(y > 0) this.prevLoc = y;
            }
        }
    },

    function endDragged(e){
        if(this.isDragged === true){
            this.isDragged = false;
            var xy = this.normalizeBarLoc(this.orientation == L.VERTICAL ? e.x : e.y);
            if(xy > 0) this.setGripperLoc(xy);
        }
    },

    function setGripperMovable(b){
        if(b != this.isMoveable){
            this.isMoveable = b;
            this.vrp();
        }
    },

    function kidAdded(index,id,c){
        this.$super(index, id, c);
        if(L.LEFT == id) this.leftComp = c;
        else
            if(L.RIGHT == id) this.rightComp = c;
            else
                if(L.CENTER == id) this.gripper = c;
                else throw new Error();
    },

    function kidRemoved(index,c){
        this.$super(index, c);
        if(c == this.leftComp) this.leftComp = null;
        else
            if(c == this.rightComp) this.rightComp = null;
            else
                if(c == this.gripper) this.gripper = null;
    },

    function resized(pw,ph) {
        var ps = this.gripper.getPreferredSize();
        if(this.orientation == L.VERTICAL){
            this.minXY = this.getLeft() + this.gap + this.leftMinSize;
            this.maxXY = this.width - this.gap - this.rightMaxSize - ps.width - this.getRight();
        }
        else{
            this.minXY = this.getTop() + this.gap + this.leftMinSize;
            this.maxXY = this.height - this.gap - this.rightMaxSize - ps.height - this.getBottom();
        }
        this.$super(pw, ph);
    }
]);

pkg.Progress = Class(pkg.Panel, Actionable, [
    function (){
        this.$super();

        this.value = 0;
        this.gap = 2;
        this.bundleView = pkg.view.Fill.darkBlue;
        this.bundleWidth = this.bundleHeight = 6;
        this.orientation = L.HORIZONTAL;
        this.maxValue = 20;

        this._ = new Listeners();
        this.setBorder(pkg.get("pr.br"));
        if(pkg.get("pr.bv") != null) this.bundleView = pkg.get("pr.bv");
        if(pkg.get("pr.bw") != null) this.bundleWidth = pkg.get("pr.bw");
        if(pkg.get("pr.bh") != null) this.bundleHeight = pkg.get("pr.bh");
        this.customize(pkg.Wizard.PROGRESS);
    },

    function setOrientation(o){
        if(o != L.HORIZONTAL && o != L.VERTICAL) throw new Error();
        if(o != this.orientation){
            this.orientation = o;
            this.vrp();
        }
    },

    function setMaxValue(m){
        if(m != this.maxValue){
            this.maxValue = m;
            this.setValue(this.value);
            this.vrp();
        }
    },

    function setValue(p){
        p = p % (this.maxValue + 1);
        if(this.value != p){
            var old = this.value;
            this.value = p;
            this._.fire(this, old);
            this.repaint();
        }
    },

    function setGap(g){
        if(this.gap != g){
            this.gap = g;
            this.vrp();
        }
    },

    function setBundleView(v){
        if(this.bundleView != v){
            this.bundleView = v;
            this.vrp();
        }
    },

    function setBundleWidth(size){
        if(size != this.bundleWidth){
            this.bundleWidth = size;
            this.vrp();
        }
    },

    function setBundleHeight(size){
        if(size != this.bundleHeight){
            this.bundleHeight = size;
            this.vrp();
        }
    },

    function paint(g){
        var left = this.getLeft(), right = this.getRight(), top = this.getTop(), bottom = this.getBottom(),
            rs = (this.orientation == L.HORIZONTAL) ? this.width - left - right : this.height - top - bottom,
            bundleSize = (this.orientation == L.HORIZONTAL) ? this.bundleWidth : this.bundleHeight;

        if(rs >= bundleSize){
            var vLoc = ~~((rs * this.value) / this.maxValue),
                x = left, y = this.height - bottom, bundle = this.bundleView,
                wh = this.orientation == L.HORIZONTAL ? this.height - top - bottom
                                                      : this.width - left - right;

            while(x < (vLoc + left) && this.height - vLoc - bottom < y){
                if(this.orientation == L.HORIZONTAL){
                    bundle.paint(g, x, top, bundleSize, wh, this);
                    x += (bundleSize + this.gap);
                }
                else{
                    bundle.paint(g, left, y - bundleSize, wh, bundleSize, this);
                    y -= (bundleSize + this.gap);
                }
            }

            if (this.titleView != null){
                var ps = this.bundleView.getPreferredSize();
                this.titleView.paint(g, L.getXLoc(ps.width, L.CENTER, this.width),
                                           L.getYLoc(ps.height, L.CENTER, this.height),
                                           ps.width, ps.height, this);
            }
        }
    },

    function calcPreferredSize(l){
        var bundleSize = (this.orientation == L.HORIZONTAL) ? this.bundleWidth : this.bundleHeight,
            v1 = (this.maxValue * bundleSize) + (this.maxValue - 1) * this.gap,
            ps = this.bundleView.getPreferredSize();

        ps = (this.orientation == L.HORIZONTAL) ? { width:v1,
                                                    height:(this.bundleHeight >= 0 ? this.bundleHeight
                                                                                   : ps.height) }
                                                : { width:(this.bundleWidth >= 0 ? this.bundleWidth
                                                                                 : ps.width),
                                                    height: v1 };
        if (this.titleView != null) {
            var tp = this.titleView.getPreferredSize();
            ps.width  = Math.max(ps.width, tp.width);
            ps.height = Math.max(ps.height, tp.height);
        }
        return ps;
    }
]);

pkg.Link = Class(pkg.Button, Cursorable, [
    function(s){
        //!!!
        this.colors = pkg.get("ln.colors");
        this.colors = (this.colors == null) ? [ rgb.blue, rgb.darkBlue, rgb.black, rgb.blue, rgb.gray]
                                            : this.colors.slice(0);

        this.$super(null);
        var tr = new TextRender(s);
        tr.setFont(pkg.get("ln.fn"));
        this.setView(tr);
        this.stateUpdated(this.state, this.state);
        this.getCursorType = function(target,x,y){ return Cursor.HAND; };
    },

    function setColor(state,c){
        if (!this.colors[state].equals(c)){
            this.colors[state] = c;
            this.stateUpdated(state, state);
        }
    },

    function getColor(state){ return this.colors[this.state]; },

    function stateUpdated(o,n){
        this.$super(this.stateUpdated,o, n);
        var r = this.view;
        if (!r.foreground.equals(this.colors[n])){
            r.setForeground(this.colors[n]);
            this.repaint();
        }
    }
]);

pkg.Extender = Class(pkg.Panel, MouseListener, Composite, [
    function $prototype() {
        this.catchInput = function(child){ return child != this.contentPan && !L.isAncestorOf(this.contentPan, child); };
    },

    function (content, lab){
        this.isCollapsed = false;
        this.$super(new L.BorderLayout(8,8));
        if (zebra.isString(lab)) {
            lab = new pkg.Label(lab);
            lab.setFont(pkg.get("ext.lab.fn"));
            lab.setForeground(pkg.get("ext.lab.fg"));
        }
        this.labelPan = lab;
        this.titlePan = new pkg.Panel(new L.FlowLayout(L.LEFT, L.CENTER, L.HORIZONTAL, 8));
        this.titlePan.padding(2);
        this.titlePan.setBackground(pkg.get("ext.title.bg"));
        this.titlePan.setBorder(pkg.get("ext.title.br"));
        this.add(L.TOP, this.titlePan);
        this.togglePan = new pkg.ViewPan();
        var set = new ViewSet(["off", pkg.get("ext.off"), "on", pkg.get("ext.on")]);
        set.activate(this.isCollapsed ? "off" : "on");
        this.togglePan.setView(set);
        this.titlePan.add(this.togglePan);
        this.titlePan.add(this.labelPan);
        this.contentPan = content;
        this.contentPan.setVisible( !this.isCollapsed);
        this.add(L.CENTER, this.contentPan);
    },

    function toggle(){
        this.isCollapsed = this.isCollapsed ? false : true;
        this.contentPan.setVisible(!this.isCollapsed);
        this.togglePan.view.activate(this.isCollapsed ? "off" : "on");
        this.repaint();
    },

    function mousePressed(e){ if (e.isActionMask() && this.getComponentAt(e.x, e.y) == this.togglePan) this.toggle(); }
]);

pkg.Toolbar = Class(pkg.Panel, ChildrenListener, [
    function $clazz() {
        this.Constraints = function(isDec, str) {
            this.views = [null, null, null];
            this.isDecorative = arguments.length > 0 ? isDec : false;
            this.stretched = arguments.length > 1 ? str : false;
        }

        this.OVER    = 0;
        this.OUT     = 1;
        this.PRESSED = 2;
    },

    function $prototype() {
        var OVER = 0, OUT = 1, PRESSED = 2;

        this.isDecorative = function(c){ return c.constraints.isDecorative; };

        this.childInputEvent = function(e){
            if(e.UID == InputEvent.MOUSE_UID){
                var dc = L.getDirectChild(this, e.source);
                if (!this.isDecorative(dc)){
                    switch(e.ID)
                    {
                        case ME.ENTERED:this.select(dc, true); break;
                        case ME.EXITED: if(this.selected != null && L.isAncestorOf(this.selected, e.source)) this.select(null, true); break;
                        case ME.PRESSED:this.select(this.selected, false);break;
                        case ME.RELEASED: this.select(this.selected, true); break;
                        case ME.DRAGGED: this.popupToolbar(); break;
                    }
                }
            }
        };

        this.recalc = function(){
            var v = this.views;
            this.leftShift   = Math.max(v[OVER]     == null ? 0 : v[OVER].getLeft(),
                                        v[PRESSED]  == null ? 0 : v[PRESSED].getLeft());
            this.rightShift  = Math.max(v[OVER]     == null ? 0 : v[OVER].getRight(),
                                        v[PRESSED]  == null ? 0 : v[PRESSED].getRight());
            this.topShift    = Math.max(v[OVER]     == null ? 0 : v[OVER].getTop(),
                                        v[PRESSED]  == null ? 0 : v[PRESSED].getTop());
            this.bottomShift = Math.max(v[OVER]     == null ? 0 : v[OVER].getBottom(),
                                        v[PRESSED]  == null ? 0 : v[PRESSED].getBottom());
        };

        this.paint = function(g) {
            for(var i = 0;i < this.kids.length; i++){
                var c = this.kids[i];
                if(c.isVisible && !this.isDecorative(c)){
                    var index = (this.selected == c) ? (this.isOver ? OVER : PRESSED) : OUT;
                    if (instanceOf(c, pkg.Checkbox) && c.getState()) index = PRESSED;
                    var v = this.getView(c, index);
                    if(v != null) v.paint(g, c.x, this.getTop(), c.width, this.height - this.getTop() - this.getBottom(), this);
                }
            }
        };
    },

    function () { this.$this(L.HORIZONTAL, 4); },

    function (orient,gap){
        this.$super();
        this.selected = null;
        this.isOver = false;
        this._ = new Listeners();
        this.leftShift = this.topShift = this.bottomShift = this.rightShift = 0;
        if(orient != L.HORIZONTAL && orient != L.VERTICAL) throw new Error();
        this.views = [pkg.get("tb.over"), pkg.get("tb.out"), pkg.get("tb.pressed")];
        this.orient = orient;
        this.gap = gap;
        this.padding(2);
        this.setBorder(pkg.get("tb.br"));
        this.setBackground(pkg.get("tb.bg"));
        this.customize(pkg.Wizard.TOOLBAR);
    },

    function setView(type,v){ this.setView(null, type, v); },

    function setView(c,id,v){
        if(c != null){
            if (this.indexOf(c) < 0) throw new Error();
            c.constraints.views[id] = v;
        }
        else this.views[id] = v;
        this.vrp();
    },

    function getView(id){ return this.getView(null, id); },

    function getView(c,id){
        if(c != null){
            var constr = c.constraints;
            if(constr.views[id] != null) return constr.views[id];
        }
        return this.views[id];
    },

    function addDecorative(c){ this.add(new pkg.Toolbar.Constraints(true), c); },

    function addRadio(gr,c){
        var box = this.addSwitcher(c);
        box.setSwitchManager(gr);
        return box;
    },

    function addSwitcher(c){
        var cbox = new pkg.Checkbox(c, pkg.Checkbox.CHECK);
        cbox.setFocusMarkerView(null);
        cbox.setCanHaveFocus(false);
        this.add(cbox);
        return cbox;
    },

    function addImage(img){
        this.validateMetric();
        var pan = new pkg.ImagePan(img);
        pan.paddings(this.topShift, this.leftShift + 2, this.bottomShift, this.rightShift+2);
        this.add(pan);
        return pan;
    },

    function addCombo(list){
        var combo = new pkg.Combo(list);
        combo.setBorder(pkg.get("tb.combo.br"));
        combo.setBackground(pkg.get("tb.combo.bg"), true);
        combo.setSelectionView(null);
        this.add(new pkg.Toolbar.Constraints(false), combo);
        this.setView(combo, OVER, pkg.get("tb.combo.obr"));
        combo.paddings(1, 4, 1, 1);
        return combo;
    },

    function addLine(){
        var line = new pkg.Line(pkg.get("tb.line.view"), (this.orient == L.HORIZONTAL) ? L.VERTICAL : L.HORIZONTAL);
        this.add(new pkg.Toolbar.Constraints(true, true), line);
        return line;
    },

    function popupToolbar(){
        var d = pkg.getDesktop(this);
        this.remove(this);
        this.setBorder(pkg.get("br.etched"));
        this.toPreferredSize();
        d.getLayer(pkg.WinLayer.ID).add(this);
    },

    function insert(i,id,d){
        if(id == null) id = new pkg.Toolbar.Constraints();
        return this.$super(i, id, d);
    },

    function calcPreferredSize(target){
        var w = 0, h = 0, c = 0, b = (this.orient == L.HORIZONTAL);
        for(var i = 0;i < target.kids.length; i++ ){
            var l = target.kids[i];
            if(l.isVisible){
                var ps = l.getPreferredSize();
                if(b) {
                    w += (ps.width + (c > 0 ? this.gap : 0));
                    h = Math.max(ps.height, h);
                }
                else{
                    w = Math.max(ps.width, w);
                    h += (ps.height + (c > 0 ? this.gap : 0));
                }
                c++;
            }
        }

        return { width:  (b ? w + c * (this.leftShift + this.rightShift)
                            : w + this.topShift + this.bottomShift), 
                 height: (b ? h + this.leftShift + this.rightShift
                            : h + c * (this.topShift + this.bottomShift)) };
    },

    function doLayout(t){
        var b = (this.orient == L.HORIZONTAL), x = t.getLeft(), y = t.getTop(),
            av = this.topShift + this.bottomShift, ah = this.leftShift + this.rightShift,
            hw = b ? t.height - y - t.getBottom() : t.width - x - t.getRight();
        for(var i = 0;i < t.kids.length; i++){
            var l = t.kids[i];
            if(l.isVisible){
                var ps = l.getPreferredSize(), str = l.constraints.stretched;
                if(b){
                    if (str) ps.height = hw;
                    l.setLocation(x + this.leftShift, y + ((hw - ps.height) / 2  + 0.5) | 0);
                    x += (this.gap + ps.width + ah);
                }
                else{
                    if (str) ps.width = hw;
                    l.setLocation(x + (hw - ps.width) / 2, y + this.topShift);
                    y += (this.gap + ps.height + av);
                }
                l.setSize(ps.width, ps.height);
            }
        }
    },

    function select(c,state){
        if(c != this.selected || (this.selected != null && state != this.isOver)){
            var prev = this.selected, addW = this.leftShift + this.rightShift, addH = this.topShift + this.bottomShift;
            this.selected = c;
            this.isOver = state;
            var top = this.getTop(), mb = this.height - this.getBottom() + top;
            //!!! if(prev != null) this.repaint(prev.x - this.leftShift, top, prev.width + addW, mb);
            //!!! if(c != null) this.repaint(c.x - this.leftShift, top, c.width + addW, mb);
            this.repaint();
            if(!state && c != null) this._.fire(this, c);
        }
    }
]);

pkg.Manager = Class([ function() { if (pkg.events != null) pkg.events.addListener(this); }  ]);

pkg.PaintManager = Class(pkg.Manager, [
    function $prototype() {
        var $timers = {};

        this.repaint = function(c,x,y,w,h){
            if (arguments.length == 1) {
                x = y = 0;
                w = c.width;
                h = c.height;
            }

            if(w > 0 && h > 0 && c.isVisible === true){
                var r = cvp(c, temporary);
                if (r == null) return;
                MB.intersection(r.x, r.y, r.width, r.height, x, y, w, h, r);
                if (r.width <= 0 || r.height <= 0) return;
                x = r.x;
                y = r.y;
                w = r.width;
                h = r.height;

                var desktop = pkg.getDesktop(c);
                if(desktop != null){
                    var p = L.getAbsLocation(x, y, c), x2 = desktop.width, y2 = desktop.height;
                    x = p[0];
                    y = p[1];
                    if(x < 0) {
                        w += x;
                        x = 0;
                    }
                    if(y < 0) {
                        h += y;
                        y = 0;
                    }

                    if (w + x > x2) w = x2 - x;
                    if (h + y > y2) h = y2 - y;

                    if(w > 0 && h > 0)
                    {
                        var da = desktop.da;
                        if(da.width > 0) {
                            if (x >= da.x && y >= da.y && x + w <= da.x + da.width && y + h <= da.y + da.height) return;
                            MB.unite(da.x, da.y, da.width, da.height, x, y, w, h, da);
                        }
                        else MB.intersection(0, 0, desktop.width, desktop.height, x, y, w, h, da);

                        if (da.width > 0 && !$timers[desktop]) {
                            var $this = this;
                            $timers[desktop] = setTimeout(function() {
                                try {
                                    $timers[desktop] = null;
                                    var context = desktop.graph;
                                    desktop.validate();
                                    context.save();

                                    //!!!! debug
                                    // zebra.print(" ============== DA = " + desktop.da );
                                    // var dg = desktop.canvas.getContext("2d");
                                    // dg.strokeStyle = 'red';
                                    // dg.beginPath();
                                    // dg.rect(da.x, da.y, da.width, da.height);
                                    // dg.stroke();


                                    context.clipRect(desktop.da.x, desktop.da.y, desktop.da.width, desktop.da.height);
                                    $this.paint(context, desktop);
                                    context.restore();
                                    desktop.da.width = -1; //!!!
                                }
                                catch(e) { zebra.print(e); }
                            }, 50);
                        }

                        if (da.width > 0) desktop.repaint(da.x, da.y, da.width, da.height);
                    }
                }
            }
        };

        this.paint = function(g,c){
            var dw = c.width, dh = c.height, ts = g.getTopStack();
            if(dw !== 0 && dh !== 0 && ts.width > 0 && ts.height > 0 && c.isVisible){
                c.validate();

                g.save();
                g.translate(c.x, c.y);
                g.clipRect(0, 0, dw, dh);

                ts = g.getTopStack();
                var c_w = ts.width, c_h = ts.height;
                if(c_w > 0 && c_h > 0) {
                    this.paintComponent(g, c);
                    var count = c.kids.length, c_x = ts.x, c_y = ts.y;
                    for(var i = 0; i < count; i++) {
                        var kid = c.kids[i];
                        if(kid.isVisible) {
                            var kidX = kid.x, kidY = kid.y,
                                ix = Math.max(kidX, c_x), iw = Math.min(kidX + kid.width,  c_x + c_w) - ix,
                                iy = Math.max(kidY, c_y), ih = Math.min(kidY + kid.height, c_y + c_h) - iy;

                            if (iw > 0 && ih > 0) this.paint(g, kid);
                        }
                    }
                    if (c.paintOnTop) c.paintOnTop(g);
                }

                g.restore();
            }
        };
    }
]);

pkg.PaintManImpl = Class(pkg.PaintManager, CL, [
    function $prototype() {
        this.compEnabled = function(t) { this.repaint(t); };

        this.compShown = function(t){
            if(t.isVisible) this.repaint(t);
            else {
                var p = t.parent;
                if(p != null) this.repaint(p, t.x, t.y, t.width, t.height);
            }
        };

        this.compSized = function(pw,ph,t){
            if(t.parent != null) {
                var w = t.width, h = t.height;
                this.repaint(t.parent, t.x, t.y, (w > pw) ? w : pw, (h > ph) ? h : ph);
            }
        };

        this.compMoved = function(px,py,t){
            var p = t.parent, w = t.width, h = t.height;
            if(p != null && w > 0 && h > 0){
                var x = t.x, y = t.y, nx = Math.max(x < px ? x : px, 0), ny = Math.max(y < py ? y : py, 0);
                this.repaint(p, nx, ny, Math.min(p.width - nx, w + (x > px ? x - px : px - x)),
                                        Math.min(p.height - ny, h + (y > py ? y - py : py - y)));
            }
        };

        this.paintComponent = function(g,c){
            var b = c.bg != null && (c.parent == null || !c.bg.equals(c.parent.bg));
            if (c.border && c.border.outline && b && c.border.outline(g, 0, 0, c.width, c.height,c)) {
                g.save();
                g.clip();
                c.bg.paint(g, 0, 0, c.width, c.height, c);
                g.restore();
                b = false;
            }
            if (b) c.bg.paint(g, 0, 0, c.width, c.height, c);
            if (c.border && c.border.paint) c.border.paint(g, 0, 0, c.width, c.height, c);

            if (c.update) c.update(g);

            if (c.paint) {
                var left = c.getLeft(), top = c.getTop(), bottom = c.getBottom(), right = c.getRight(), id = -1;
                if(left + right + top + bottom > 0){
                    var ts = g.getTopStack(), cw = ts.width, ch = ts.height;
                    if(cw <= 0 || ch <= 0) return;
                    var cx = ts.x, cy = ts.y, x1 = Math.max(cx, left), y1 = Math.max(cy, top);
                    id = g.save();
                    g.clipRect(x1, y1, Math.min(cx + cw, c.width - right) - x1,
                                       Math.min(cy + ch, c.height - bottom) - y1);

                }
                c.paint(g);
                if (id > 0) g.restore();
            }
        };
    }
]);

pkg.FocusManager = Class(pkg.Manager, MouseListener, CL, CNL, KeyListener, [
    function $prototype() {
        function freeFocus(ctx, t){ if(t == ctx.focusOwner) ctx.requestFocus(null);}

        this.prevFocusOwner = this.focusOwner = null;

        this.compEnabled = function(c){ if( !c.isEnabled) freeFocus(this, c); };
        this.compShown   = function(c){ if( !c.isVisible) freeFocus(this, c); };
        this.compRemoved = function(p,c){ freeFocus(this, c);};

        this.hasFocus = function(c){ return this.focusOwner == c; };

        this.keyPressed = function(e){
            if(KE.VK_TAB == e.code){
                var cc = this.ff(e.source, e.isShiftPressed() ?  -1 : 1);
                if(cc != null) this.requestFocus(cc);
            }
        };

        this.findFocusable = function(c){ return (this.isFocusable(c) ? c : this.fd(c, 0, 1)); };

        this.isFocusable = function(c){ return c.isEnabled && c.canHaveFocus && c.canHaveFocus(); };

        this.fd = function(t,index,d){
            if(t.kids.length > 0){
                var isNComposite = (instanceOf(t, Composite) === false);
                for(var i = index;i >= 0 && i < t.kids.length; i += d) {
                    var cc = t.kids[i];
                    if (cc.isEnabled && cc.isVisible && cc.width > 0 &&
                        cc.height > 0 && (isNComposite || (t.catchInput && t.catchInput(cc) === false)) &&
                        ((cc.canHaveFocus && cc.canHaveFocus()) || (cc = this.fd(cc, d > 0 ? 0 : cc.kids.length - 1, d)) != null))
                    {
                        return cc;
                    }
                }
            }
            return null;
        };

        this.ff = function(c,d){
            var top = c;
            while (instanceOf(top, Layer) === false) top = top.parent;
            top = top.getFocusRoot();
            for(var index = (d > 0) ? 0 : c.kids.length - 1;c != top.parent; ){
                var cc = this.fd(c, index, d);
                if(cc != null) return cc;
                cc = c;
                c = c.parent;
                if(c != null) index = d + c.indexOf(cc);
            }
            return this.fd(top, d > 0 ? 0 : top.kids.length - 1, d);
        };

        this.requestFocus = function (c){
            if(c != this.focusOwner && (c == null || this.isFocusable(c))){
                var oldFocusOwner = this.focusOwner;
                if(c != null){
                    var nf = pkg.events.getEventDestination(c);
                    if(nf == null || oldFocusOwner == nf) return;
                    this.focusOwner = nf;
                }
                else {
                    this.focusOwner = c;
                }

                this.prevFocusOwner = oldFocusOwner;
                if (oldFocusOwner != null) pkg.events.performInput(new InputEvent(oldFocusOwner, InputEvent.FOCUS_LOST));
                if (this.focusOwner != null){ pkg.events.performInput(new InputEvent(this.focusOwner, InputEvent.FOCUS_GAINED)); }
            }
        };

        this.mousePressed = function(e){ if(e.isActionMask()) this.requestFocus(e.source); };
    }
]);

pkg.CursorManager = Class(pkg.Manager, MouseListener, MouseMotionListener, [
    function $prototype() {
        this.setCursorable = function(t,c){
            if(c == null) delete this.cursors[t];
            else this.cursors[t] = c;
        };

        this.mouseMoved   = function(e){ this.setCursorType1(e); };
        this.mouseEntered = function(e){ this.setCursorType1(e); };
        this.mouseExited  = function(e){ this.setCursorType2("default", e.source); };
        this.mouseDragged = function(e){ this.setCursorType1(e); };

        this.setCursorType1 = function(e){
            var t = e.source, c = this.cursors.hasOwnProperty(t) ? this.cursors[t] : null;
            if(c == null && instanceOf(t, pkg.Cursorable)) c = t;
            this.setCursorType2(((c != null) ? c.getCursorType(t, e.x, e.y) :  "default"), t);
        };

        this.setCursorType2 = function(type,t){
            if(this.cursorType != type){
                var d = pkg.getDesktop(t);
                if(d != null){
                    this.cursorType = type;
                    d.canvas.style.cursor = (this.cursorType < 0) ? "default" : this.cursorType;
                }
            }
        };
    },

    function(){
        this.$super();
        this.cursors = {};
        this.cursorType = "default";
    }
]);

pkg.EventManager = Class(pkg.Manager, [
    function $prototype() {
        var IEHM = [], MUID = InputEvent.MOUSE_UID, KUID = InputEvent.KEY_UID,
            CSIZED = CL.COMP_SIZED, CMOVED = CL.COMP_MOVED,
            CENABLED = CL.COMP_ENABLED, CSHOWN = CL.COMP_SHOWN;

        IEHM[KE.TYPED]                = 'keyTyped';
        IEHM[KE.RELEASED]             = 'keyReleased';
        IEHM[KE.PRESSED]              = 'keyPressed';
        IEHM[ME.DRAGGED]              = 'mouseDragged';
        IEHM[ME.STARTDRAGGED]         = 'startDragged';
        IEHM[ME.ENDDRAGGED]           = 'endDragged';
        IEHM[ME.MOVED]                = 'mouseMoved';
        IEHM[ME.CLICKED]              = 'mouseClicked';
        IEHM[ME.PRESSED]              = 'mousePressed';
        IEHM[ME.RELEASED]             = 'mouseReleased';
        IEHM[ME.ENTERED]              = 'mouseEntered';
        IEHM[ME.EXITED]               = 'mouseExited';
        IEHM[InputEvent.FOCUS_LOST]   = 'focusLost';
        IEHM[InputEvent.FOCUS_GAINED] = 'focusGained';

        function findComposite(t,child){
            if(t == null || t.parent == null) return null;
            var p = t.parent, b = instanceOf(p, Composite), res = findComposite(p, b ? p : child);
            return (res != null) ? res : ((b && (!p.catchInput || p.catchInput(child))) ? p : null);
        }

        function handleCompEvent(l,id,a1,a2,c){
            switch(id) {
                case CSIZED:   if (l.compSized) l.compSized(a1, a2, c);break;
                case CMOVED:   if (l.compMoved) l.compMoved(a1, a2, c);break;
                case CENABLED: if (l.compEnabled) l.compEnabled(c);break;
                case CSHOWN:   if (l.compShown) l.compShown(c);break;
                default: throw new Error();
            }
        }

        function handleContEvent(l,id,a1,a2,c){
            switch(id) {
                case CNL.COMP_ADDED:   if (l.compAdded) l.compAdded(a1, a2, c); break;
                case CNL.LAYOUT_SET:   if (l.layoutSet) l.layoutSet(a1, a2); break;
                case CNL.COMP_REMOVED: if (l.compRemoved) l.compRemoved(a1, c); break;
                default: throw new Error();
            }
        }
        this.performCont = function(id,p,constr,c){
            if (instanceOf(p, CNL)) handleContEvent(p, id, p, constr, c);
            for(var i = 0;i < this.cc_l.length; i++) handleContEvent(this.cc_l[i], id, p, constr, c);

            for(var t = p.parent;t != null; t = t.parent){
                if(t.childContEvent && instanceOf(t, ChildrenListener)) t.childContEvent(id, p, constr, c);
            }
        };

        this.performComp = function(id,pxw,pxh,src){
            if(instanceOf(src, CL)) handleCompEvent(src, id, pxw, pxh, src);
            for(var i = 0;i < this.c_l.length; i++) handleCompEvent(this.c_l[i], id, pxw, pxh, src);
            for(var t = src.parent;t != null; t = t.parent){
                if(t.childCompEvent && instanceOf(t, ChildrenListener)) t.childCompEvent(id, src);
            }
        };

        this.getEventDestination = function(t){
            var composite = findComposite(t, t);
            return composite == null ? t : composite;
        };

        this.performInput = function(e){
            var t = e.source, id = e.ID, it = null, k = IEHM[id];
            switch(e.UID)
            {
                case MUID:
                    if(id > 10){
                        if (instanceOf(t, MouseMotionListener)) {
                            var m = t[k];
                            if (m) m.call(t, e);
                        }
                        it = this.mm_l;
                        for(var i = 0; i < it.length; i++) {
                            var tt = it[i], m = tt[k];
                            if (m) m.call(tt, e);
                        }
                        return;
                    }
                    else{
                        if(instanceOf(t, MouseListener)) {
                            if (t[k]) t[k].call(t, e);
                        }
                        it = this.m_l;
                    }
                    break;
                case KUID:
                    if(instanceOf(t, KeyListener)) {
                        var m = t[k];
                        if (m) m.call(t, e);
                    }
                    it = this.k_l;
                    break;
                case InputEvent.FOCUS_UID:
                    if(instanceOf(t, FocusListener)) {
                        if (t[k]) t[k].call(t, e);
                    }
                    it = this.f_l;
                    break;
                default: throw new Error();
            }

            for(var i = 0;i < it.length; i++) {
                var tt = it[i], m = tt[k];
                if (m) m.call(tt, e);
            }

            for (t = t.parent;t != null; t = t.parent){
                if (t.childInputEvent && instanceOf(t, ChildrenListener)) t.childInputEvent(e);
            }
        };

        this.a_ = function(c, l){ (c.indexOf(l) >= 0) || c.push(l); };
        this.r_ = function(c, l){ (c.indexOf(l) < 0) || c.splice(i, 1); };
    },

    function(){
        this.$super();
        this.m_l  = [];
        this.mm_l = [];
        this.k_l  = [];
        this.f_l  = [];
        this.c_l  = [];
        this.cc_l = [];
    },

    function addListener(l){
        if(instanceOf(l,CL))   this.addComponentListener(l);
        if(instanceOf(l,CNL))   this.addContainerListener(l);
        if(instanceOf(l,MouseListener))       this.addMouseListener(l);
        if(instanceOf(l,MouseMotionListener)) this.addMouseMotionListener(l);
        if(instanceOf(l,KeyListener))         this.addKeyListener(l);
        if(instanceOf(l,FocusListener))       this.addFocusListener(l);
    },

    function removeListener(l) {
        if(instanceOf(l, CL))   this.removeComponentListener(l);
        if(instanceOf(l, CNL))   this.removeContainerListener(l);
        if(instanceOf(l, MouseListener))       this.removeMouseListener(l);
        if(instanceOf(l, MouseMotionListener)) this.removeMouseMotionListener(l);
        if(instanceOf(l, KeyListener))         this.removeKeyListener(l);
        if(instanceOf(l, FocusListener))       this.removeFocusListener(l);
    },

    function addComponentListener(l) { this.a_(this.c_l, l); },
    function removeComponentListener(l){ this.r_(this.c_l, l); },
    function addContainerListener(l){ this.a_(this.cc_l, l); },
    function removeContainerListener(l){ this.r_(this.cc_l, l); },
    function addMouseListener(l){ this.a_(this.m_l, l); },
    function removeMouseListener(l){ this.r_(this.m_l, l); },
    function addMouseMotionListener(l){ this.a_(this.mm_l, l); },
    function removeMouseMotionListener(l){ this.r_(this.mm_l, l); },
    function addFocusListener(l){ this.a_(this.f_l, l); },
    function removeFocusListener(l){ this.r_(this.f_l, l); },
    function addKeyListener(l){ this.a_(this.k_l, l); },
    function removeKeyListener(l){ this.r_(this.k_l, l); },

    function destroy() {
        this.m_l.length = this.mm_l.length = this.k_l.length = this.f_l.length = this.c_l.length = this.cc_l.length = 0;
    }
]);

pkg.ClipboardMan = Class(pkg.Manager, KeyListener, [
    function() {
        this.$super();
        this.data = null;
    },

    function get() { return this.data; },
    function put(d) { this.data = d; },
    function isEmpty() { return this.get() != null; }
]);

pkg.ScrollManager = Class([
    function (c){
        this.sx = this.sy = 0;
        this._ = new Listeners('scrolled');
        this.target = c;
        this.targetIsListener = instanceOf(c, pkg.ScrollListener);
    },

    function getSX(){ return this.sx; },
    function getSY(){ return this.sy; },

    function scrolled(sx,sy,psx,psy){
        this.sx = sx;
        this.sy = sy;
    },

    function scrollXTo(v){ this.scrollTo(v, this.getSY());},
    function scrollYTo(v){ this.scrollTo(this.getSX(), v); },

    function scrollTo(x, y){
        var psx = this.getSX(), psy = this.getSY();
        if(psx != x || psy != y){
            this.scrolled(x, y, psx, psy);
            if (this.targetIsListener === true) this.target.scrolled(psx, psy);
            this._.fire(psx, psy);
        }
    },

    function makeVisible(x,y,w,h){
        var p = pkg.calcOrigin(x, y, w, h, this.getSX(), this.getSY(), this.target);
        this.scrollTo(p[0], p[1]);
    }
]);


//!!! not sure the class is useful
pkg.CompScrollManager = Class(pkg.ScrollManager, L.Layout, [
    function (c){
        this.$super(c);
        this.tl = c.layout;
        c.setLayout(this);
    },

    function calcPreferredSize(l) { return this.tl.calcPreferredSize(l); },

    function doLayout(t){
        this.tl.doLayout(t);
        for(var i = 0;i < t.kids.length; i ++ ){
            var l = t.kids[i];
            l.setLocation(l.x + this.getSX(), l.y + this.getSY());
        }
    },

    function scrolled(sx,sy,px,py){
        this.$super(sx, sy, px, py);
        this.target.invalidate();
    }
]);

pkg.Scroll = Class(pkg.Panel, MouseListener, MouseMotionListener,
                   zebra.util.Position.PositionMetric, Composite, [

    function $clazz() {
        var SB = Class(pkg.Button, [
            function(v, c) {
                this.$super();
                this.setFireParams(true, 20);
                this.setCanHaveFocus(false);
                var set = new ViewSet();
                set.put("out",      pkg.get(v + "sb." +  c +  "b.out"));
                set.put("over",     pkg.get(v + "sb." +  c +  "b.over"));
                set.put("pressed",  pkg.get(v + "sb." +  c +  "b.pressed"));
                set.put("disabled", pkg.get(v + "sb." +  c +  "b.disabled"));
                this.setView(set);
            }
        ]);

        this.VIncButton = Class(SB, [ function() { this.$super("v", "i"); } ]);
        this.VDecButton = Class(SB, [ function() { this.$super("v", "d"); } ]);
        this.HIncButton = Class(SB, [ function() { this.$super("h", "i"); } ]);
        this.HDecButton = Class(SB, [ function() { this.$super("h", "d"); } ]);

        this.VBundle = Class(pkg.Panel, [
            function() {
                this.$super();
                this.setBorder    (pkg.get("vsb.bn.br"));
                this.setBackground(pkg.get("vsb.bn.bg"));
            }
        ]);

        this.HBundle = Class(pkg.Panel, [
            function() {
                this.$super();
                this.setBorder    (pkg.get("hsb.bn.br"));
                this.setBackground(pkg.get("hsb.bn.bg"));
            }
        ]);

        this.MIN_BUNDLE_SIZE = 16;
    },

    function $prototype() {
        this.isInBundle = function(x,y){
            var bn = this.bundle;
            return (bn != null && bn.isVisible && bn.x <= x && bn.y <= y && bn.x + bn.width > x && bn.y + bn.height > y);
        };

        this.amount = function(){
            var db = this.decBt, ib = this.incBt;
            return (this.type == L.VERTICAL) ? ib.y - db.y - db.height : ib.x - db.x - db.width;
        };

        this.pixel2value = function(p) {
            var db = this.decBt, bn = this.bundle;
            return (this.type == L.VERTICAL) ? ~~((this.max * (p - db.y - db.height)) / (this.amount() - bn.height))
                                             : ~~((this.max * (p - db.x - db.width )) / (this.amount() - bn.width));
        };

        this.value2pixel = function(){
            var db = this.decBt, bn = this.bundle, off = this.position.offset;
            return (this.type == L.VERTICAL) ? db.y + db.height +  ~~(((this.amount() - bn.height) * off) / this.max)
                                             : db.x + db.width  +  ~~(((this.amount() - bn.width) * off) / this.max);
        };


        this.catchInput = function (child){
            return child == this.bundle || (this.bundle.kids.length > 0 &&
                                            L.isAncestorOf(this.bundle, child));
        };

        this.posChanged = function(target,po,pl,pc){
            if(this.bundle != null){
                if(this.type == L.HORIZONTAL) this.bundle.setLocation(this.value2pixel(), this.getTop());
                else this.bundle.setLocation(this.getLeft(), this.value2pixel());
            }
        };

        this.getLines     = function (){ return this.max; };
        this.getLineSize  = function (line){ return 1; };
        this.getMaxOffset = function (){ return this.max; };

        this.fired = function (src){
            this.position.setOffset(this.position.offset + ((src == this.incBt) ? this.unitIncrement :  - this.unitIncrement));
        };

        this.mouseDragged = function (e){
            if(Number.MAX_VALUE != this.startDragLoc)
                this.position.setOffset(this.pixel2value(this.bundleLoc - this.startDragLoc + ((this.type == L.HORIZONTAL) ? e.x : e.y)));
        };
    },

    function (t) {
        if (t != L.VERTICAL && t != L.HORIZONTAL) throw new Error();
        this.incBt = this.decBt = this.bundle = this.position = null;
        this.bundleLoc = this.type = 0;
        this.extra = this.max  = 100;
        this.pageIncrement = 20;
        this.unitIncrement = 5;
        this.startDragLoc = Number.MAX_VALUE;
        this.$super(this);

        this.add(L.CENTER, t == L.VERTICAL ? new pkg.Scroll.VBundle()    : new pkg.Scroll.HBundle());
        this.add(L.TOP   , t == L.VERTICAL ? new pkg.Scroll.VDecButton() : new pkg.Scroll.HDecButton());
        this.add(L.BOTTOM, t == L.VERTICAL ? new pkg.Scroll.VIncButton() : new pkg.Scroll.HIncButton());

        var pr = (t == L.HORIZONTAL) ? "h" : "v";
        this.setBackground(pkg.get(pr + "sb.bg"));
        this.setBorder(pkg.get(pr + "sb.br"));

        this.type = t;
        this.setPosition(new zebra.util.Position(this));
        this.customize(pkg.Wizard.SCROLL);
    },

    function setMaximum(m){
        if(m != this.max){
            this.max = m;
            if(this.position.offset > this.max) this.position.setOffset(this.max);
            this.vrp();
        }
    },

    function setPosition(p){
        if(p != this.position){
            if(this.position != null) this.position._.remove(this);
            this.position = p;
            if(this.position != null){
                this.position._.add(this);
                this.position.setPositionMetric(this);
                this.position.setOffset(0);
            }
        }
    },

    function startDragged(e){
        if (this.isInBundle(e.x, e.y)){
            this.startDragLoc = this.type == L.HORIZONTAL ? e.x : e.y;
            this.bundleLoc = this.type == L.HORIZONTAL ? this.bundle.x : this.bundle.y;
        }
    },

    function endDragged(e){ this.startDragLoc = Number.MAX_VALUE; },

    function mousePressed(e){
        if( !this.isInBundle(e.x, e.y) && e.isActionMask()){
            var d = this.pageIncrement;
            if(this.type == L.VERTICAL){
                if(e.y < (this.bundle != null ? this.bundle.y : ~~(this.height / 2))) d =  -d;
            }
            else {
                if(e.x < (this.bundle != null ? this.bundle.x : ~~(this.width / 2))) d =  -d;
            }
            this.position.setOffset(this.position.offset + d);
        }
    },

    function setExtraSize(e){
        if(e != this.extra){
            this.extra = e;
            this.vrp();
        }
    },

    function kidAdded(index,id,lw){
        this.$super(index, id, lw);
        if(L.CENTER == id) this.bundle = lw;
        else
            if(L.BOTTOM == id){
                this.incBt = lw;
                this.incBt._.add(this);
            }
            else
                if(L.TOP == id){
                    this.decBt = lw;
                    this.decBt._.add(this);
                }
                else throw new Error();
    },

    function kidRemoved(index,lw){
        this.$super(index, lw);
        if(lw == this.bundle) this.bundle = null;
        else
            if(lw == this.incBt){
                this.incBt._.remove(this);
                this.incBt = null;
            }
            else
                if(lw == this.decBt){
                    this.decBt._.remove(this);
                    this.decBt = null;
                }
    },

    function calcPreferredSize(target){
        var ps1 = pkg.getPreferredSize(this.incBt), ps2 = pkg.getPreferredSize(this.decBt), ps3 = pkg.getPreferredSize(this.bundle);
        if(this.type == L.HORIZONTAL){
            ps1.width += (ps2.width + ps3.width);
            ps1.height = Math.max(Math.max(ps1.height, ps2.height), ps3.height);
        }
        else{
            ps1.height += (ps2.height + ps3.height);
            ps1.width = Math.max(Math.max(ps1.width, ps2.width), ps3.width);
        }
        return ps1;
    },

    function doLayout(target){
        var right = this.getRight(), top = this.getTop(), bottom = this.getBottom(),
            left = this.getLeft(), ew = this.width - left - right, eh = this.height - top - bottom,
            b = (this.type == L.HORIZONTAL), ps1 = pkg.getPreferredSize(this.decBt),
            ps2 = pkg.getPreferredSize(this.incBt),
            minbs = pkg.Scroll.MIN_BUNDLE_SIZE;

        if(ps1.width > 0){
            this.decBt.setSize(b ? ps1.width : ew, b ? eh : ps1.height);
            this.decBt.setLocation(left, top);
        }

        if(ps2.width > 0){
            this.incBt.setSize(b ? ps2.width : ew, b ? eh : ps2.height);
            this.incBt.setLocation(b ? this.width - right - ps2.width : left, b ? top : this.height - bottom - ps2.height);
        }
        if(this.bundle != null && this.bundle.isVisible){
            var am = this.amount();
            if(am > minbs){
                var bsize = Math.max(Math.min(~~((this.extra * am) / this.max), am - minbs), minbs);
                this.bundle.setSize(b ? bsize : ew, b ? eh : bsize);
                this.bundle.setLocation(b ? this.value2pixel() : left, b ? top : this.value2pixel());
            }
            else this.bundle.setSize(0, 0);
        }
    }
]);

pkg.ScrollPan = Class(pkg.Panel, pkg.ScrollListener, [
    function $clazz() {
        this.ContentPan = Class(pkg.Panel, [
            function (c){
                this.$super(new L.RasterLayout(L.USE_PS_SIZE));
                this.sman = new pkg.ScrollManager(c, [
                    function getSX() {  return this.target.x; },
                    function getSY() { return this.target.y;  },
                    function scrolled(sx,sy,psx,psy){ this.target.setLocation(sx, sy); }
                ]);
                this.addScrolledComponent(c);
            },

            function getScrollManager(){ return this.sman; },
            function addScrolledComponent(c){ this.add(c);}
        ]);
    },

    function (){ this.$this(null, L.HORIZONTAL | L.VERTICAL); },
    function (c){ this.$this(c, L.HORIZONTAL | L.VERTICAL); },

    function (c, barMask){
        this.hBar = this.vBar = this.scrollObj = null;
        this.isPosChangedLocked = false;
        this.$super();
        if ((L.HORIZONTAL & barMask) > 0) this.add(L.BOTTOM, new pkg.Scroll(L.HORIZONTAL));
        if ((L.VERTICAL & barMask) > 0) this.add(L.RIGHT, new pkg.Scroll(L.VERTICAL));
        if (c != null) this.add(L.CENTER, c);
        this.customize(pkg.Wizard.SCROLLPAN);
    },

    function scrolled(psx,psy){
        try{
            this.validate();
            this.isPosChangedLocked = true;
            if(this.hBar != null) this.hBar.position.setOffset( -this.scrollObj.getScrollManager().getSX());
            if(this.vBar != null) this.vBar.position.setOffset( -this.scrollObj.getScrollManager().getSY());
            if(this.scrollObj.getScrollManager() == null) this.invalidate();
        }
        finally { this.isPosChangedLocked = false; }
    },

    function setIncrements(hUnit,hPage,vUnit,vPage){
        if(this.hBar != null){
            if(hUnit !=  -1) this.hBar.unitIncrement = hUnit;
            if(hPage !=  -1) this.hBar.pageIncrement = hPage;
        }
        if(this.vBar != null){
            if(vUnit !=  -1) this.vBar.unitIncrement = vUnit;
            if(vPage !=  -1) this.vBar.pageIncrement = vPage;
        }
    },

    function posChanged(target,prevOffset,prevLine,prevCol){
        if (this.isPosChangedLocked === false){
            if(this.hBar != null && this.hBar.position == target) {
                this.scrollObj.getScrollManager().scrollXTo(-this.hBar.position.offset);
            }
            else {
                if(this.vBar != null) this.scrollObj.getScrollManager().scrollYTo(-this.vBar.position.offset);
            }
        }
    },

    function insert(i,ctr,c){
        if (L.CENTER == ctr && c.getScrollManager() == null) c = new pkg.ScrollPan.ContentPan(c);
        return this.$super(i, ctr, c);
    },

    function kidAdded(index,id,comp){
        this.$super(index, id, comp);
        if(L.CENTER == id){
            this.scrollObj = comp;
            this.scrollObj.getScrollManager()._.add(this);
        }
        if(L.BOTTOM  == id || L.TOP == id){
            this.hBar = comp;
            this.hBar.position._.add(this);
        }
        else
            if(L.LEFT == id || L.RIGHT == id){
                this.vBar = comp;
                this.vBar.position._.add(this);
            }
    },

    function kidRemoved(index,comp){
        this.$super(index, comp);
        if(comp == this.scrollObj){
            this.scrollObj.getScrollManager()._.remove(this);
            this.scrollObj = null;
        }
        else
            if(comp == this.hBar){
                this.hBar.position._.remove(this);
                this.hBar = null;
            }
            else
                if(comp == this.vBar){
                    this.vBar.position._.remove(this);
                    this.vBar = null;
                }
    },

    function calcPreferredSize(target){ return pkg.getPreferredSize(this.scrollObj); },

    function doLayout(target){
        var sman = (this.scrollObj == null) ? null : this.scrollObj.getScrollManager(),
            right = this.getRight(), top = this.getTop(), bottom = this.getBottom(), left = this.getLeft(),
            ww = this.width - left - right, maxH = ww, hh = this.height - top - bottom, maxV = hh,
            so = this.scrollObj.getPreferredSize();

        if(this.hBar != null && (so.width > ww || (so.height > hh && so.width > (ww - (this.vBar == null ? 0 : this.vBar.getPreferredSize().width)))))
            maxV -= this.hBar.getPreferredSize().height;

        maxV = so.height > maxV ? (so.height - maxV) :  -1;
        if(this.vBar != null &&
            (so.height > hh ||
                (so.width > ww && so.height > (hh - (this.hBar == null ? 0 : this.hBar.getPreferredSize().height)))))
            maxH -= this.vBar.getPreferredSize().width;

        maxH = so.width > maxH ? (so.width - maxH) :  -1;
        var sy = sman.getSY(), sx = sman.getSX();
        if(this.vBar != null){
            if(maxV < 0){
                if(this.vBar.isVisible){
                    this.vBar.setVisible(false);
                    sman.scrollTo(sx, 0);
                    this.vBar.position.setOffset(0);
                }
                sy = 0;
            }
            else{
                this.vBar.setVisible(true);
                sy = sman.getSY();
            }
        }
        if(this.hBar != null){
            if(maxH < 0){
                if(this.hBar.isVisible){
                    this.hBar.setVisible(false);
                    sman.scrollTo(0, sy);
                    this.hBar.position.setOffset(0);
                }
            }
            else this.hBar.setVisible(true);
        }
        var vs = pkg.getPreferredSize(this.vBar), hs = pkg.getPreferredSize(this.hBar);
        if(this.scrollObj.isVisible){
            this.scrollObj.setLocation(left, top);
            this.scrollObj.setSize(ww - vs.width, hh - hs.height);
        }

        if(this.hBar != null && hs.height > 0){
            this.hBar.setLocation(left, this.height - bottom - hs.height);
            this.hBar.setSize(ww - vs.width, hs.height);
            this.hBar.setMaximum(maxH);
        }

        if(this.vBar != null && vs.width > 0){
            this.vBar.setLocation(this.width - right - vs.width, top);
            this.vBar.setSize(vs.width, hh - hs.height);
            this.vBar.setMaximum(maxV);
        }
    }
]);

pkg.Tabs = Class(pkg.Panel, MouseListener, KeyListener, pkg.view.TitleInfo, FocusListener,
                 MouseMotionListener, [
    function $prototype() {
        this.brSpace = this.upperSpace = this.orient = this.vgap = this.hgap = this.tabAreaX = 0;
        this.tabAreaY = this.tabAreaWidth = this.tabAreaHeight = 0;
        this.overTab = this.selectedIndex = -1;
        this.hTabGap = this.vTabGap = this.sideSpace = 1;

        this.mouseMoved = function(e) {
            var i = this.getTabAt(e.x, e.y);
            if (this.overTab != i) {
                //!!! var tr1 = (this.overTab >= 0) ? this.getTabBounds(this.overTab) : null;
                //!!!var tr2 = (i >= 0) ? this.getTabBounds(i) : null;
                //!!!if (tr1 && tr2) zebra.util.unite();
                this.overTab = i;
                if (this.views["tabover"] != null) this.repaint(this.tabAreaX, this.tabAreaY, this.tabAreaWidth, this.tabAreaHeight);
            }
        };

        this.endDragged = function(e) {
            var i = this.getTabAt(e.x, e.y);
            if (this.overTab != i) {
                this.overTab = i;
                if (this.views["tabover"] != null) this.repaint(this.tabAreaX, this.tabAreaY, this.tabAreaWidth, this.tabAreaHeight);
            }
        };

        this.mouseExited = function(e) {
            if (this.overTab >= 0) {
                this.overTab = -1;
                if (this.views["tabover"] != null) this.repaint(this.tabAreaX, this.tabAreaY, this.tabAreaWidth, this.tabAreaHeight);
            }
        };

        this.next =  function (page, d){
            for(; page >= 0 && page < ~~(this.pages.length / 2); page += d) if (this.isTabEnabled(page)) return page;
            return -1;
        };

        this.getTitleInfo = function(){
            var b = (this.orient == L.LEFT || this.orient == L.RIGHT),
                res = b ? { x:this.tabAreaX, y:0, width:this.tabAreaWidth, height:0, orient:this.orient }
                        : { x:0, y:this.tabAreaY, width:0, height:this.tabAreaHeight, orient:this.orient };
            if(this.selectedIndex >= 0){
                var r = this.getTabBounds(this.selectedIndex);
                if(b){
                    res[1] = r.y;
                    res[3] = r.height;
                }
                else{
                    res[0] = r.x;
                    res[2] = r.width;
                }
            }
            return res;
        };

        this.canHaveFocus = function(){ return true; };

        this.getTabView = function (index){
            var data = this.pages[2 * index];
            if(instanceOf(data, pkg.view.View)) return data;
            this.textRender.target.setText(data.toString());
            return this.textRender;
        };

        this.isTabEnabled = function (index){ return this.kids[index].isEnabled; };
    },

    function (){ this.$this(L.TOP); },

    function (o){
        this.$super();
        this._ = new Listeners();
        this.pages = [];
        this.views = {};
        this.textRender = new pkg.view.TextRender(new zebra.data.SingleLineTxt(""));

        var tfg = pkg.get("note.tab.fg");
        if (tfg != null) this.textRender.setForeground(tfg);

        this.views["tab"] = pkg.get("note.tab.off");
        this.views["tabon"] = pkg.get("note.tab.on");
        this.views["marker"] = pkg.get("note.tab.marker");
        this.views["tabover"] = pkg.get("note.tab.over");
        this.setBorder(pkg.get("note.br"));
        this.setTitleAlignment(o);

        this.customize(pkg.Wizard.NOTE);
    },

    function setViews(v){
        for(var k in v) if (v.hasOwnProperty(k)) this.views[k] = v[k];
        this.vrp();
    },

    function setTabSpaces(vg,hg,sideSpace,upperSpace,brSpace){
        if(this.vTabGap != vg || this.hTabGap != hg || sideSpace != this.sideSpace ||
           upperSpace != this.upperSpace || brSpace != this.brSpace)
        {
            this.vTabGap = vg;
            this.hTabGap = hg;
            this.sideSpace = sideSpace;
            this.upperSpace = upperSpace;
            this.brSpace = brSpace;
            this.vrp();
        }
    },

    function setGaps(vg,hg){
        if(this.vgap != vg || hg != this.hgap){
            this.vgap = vg;
            this.hgap = hg;
            this.vrp();
        }
    },

    function setTitleAlignment(o){
        if(o != L.TOP && o != L.BOTTOM && o != L.LEFT && o != L.RIGHT) throw new Error();
        if(this.orient != o){
            this.orient = o;
            this.vrp();
        }
    },

    function enableTab(i,b){
        var c = this.kids[i];
        if(c.isEnabled != b){
            c.setEnabled(b);
            if( !b && this.selectedIndex == i) this.select(-1);
            this.repaint();
        }
    },

    function insert(index,constr,c){
        this.pages.splice(index * 2, 0, constr == null ? "Page " + index : constr, { x:0, y:0, width:0, height:0 });
        var r = this.$super(index, constr, c);
        if(this.selectedIndex < 0) this.select(this.next(0, 1));
        return r;
    },

    function setTitle(pageIndex,data){
        if( !this.pages[2 * pageIndex].equals(data)){
            this.pages[pageIndex * 2] = data;
            this.vrp();
        }
    },

    function removeAt(i){
        if(this.selectedIndex == i) this.select( -1);
        this.pages.splice(i * 2, 2);
        this.$super(i);
    },

    function removeAll(){
        if(this.selectedIndex >= 0) this.select( -1);
        this.pages.splice(0, this.pages.length);
        this.pages.length = 0;
        this.$super();
    },

    function recalc(){
        var count = ~~(this.pages.length / 2);
        if(count > 0){
            this.tabAreaHeight = this.tabAreaWidth = 0;
            var bv = this.views["tab"], b = (this.orient == L.LEFT || this.orient == L.RIGHT), max = 0,
                hadd = 2 * this.hTabGap + bv.getLeft() + bv.getRight(),
                vadd = 2 * this.vTabGap + bv.getTop() + bv.getBottom();
            for(var i = 0;i < count; i++){
                var ps = this.getTabView(i).getPreferredSize(), r = this.getTabBounds(i);
                if(b){
                    r.height = ps.height + vadd;
                    if(ps.width + hadd > max) max = ps.width + hadd;
                    this.tabAreaHeight += r.height;
                }
                else{
                    r.width = ps.width + hadd;
                    if(ps.height + vadd > max) max = ps.height + vadd;
                    this.tabAreaWidth += r.width;
                }
            }
            for(var i = 0; i < count; i++ ){
                var r = this.getTabBounds(i);
                if(b) r.width = max;
                else r.height = max;
            }
            if(b) {
                this.tabAreaWidth = max + this.upperSpace + 1;
                this.tabAreaHeight += (2 * this.sideSpace);
            }
            else {
                this.tabAreaWidth += (2 * this.sideSpace);
                this.tabAreaHeight = this.upperSpace + max + 1;
            }
            if(this.selectedIndex >= 0) {
                var r = this.getTabBounds(this.selectedIndex);
                if(b){
                    r.height += 2 * this.sideSpace;
                    r.width += (this.brSpace + this.upperSpace);
                }
                else{
                    r.height += (this.brSpace + this.upperSpace);
                    r.width += 2 * this.sideSpace;
                }
            }
        }
    },

    function paint(g){
        var ts = g.getTopStack(), cx = ts.x, cy = ts.y, cw = ts.width, ch = ts.height;

        if(this.selectedIndex > 0){
            var r = this.getTabBounds(this.selectedIndex);
            //!!!! if(this.orient == L.LEFT || this.orient == L.RIGHT)
            //     g.clipRect(r.x, this.tabAreaY, r.width, r.y - this.tabAreaY);
            // else
            //     g.clipRect(this.tabAreaX, r.y, r.x - this.tabAreaX, r.height);
        }

        for(var i = 0;i < this.selectedIndex; i++) this.paintTab(g, i);

        if(this.selectedIndex >= 0){
            //!!!g.setClip(cx, cy, cw, ch);
            var r = this.getTabBounds(this.selectedIndex);
            //!!!! if(this.orient == L.LEFT || this.orient == L.RIGHT)
            //     g.clipRect(r.x, r.y + r.height, r.width, this.height - r.y - r.height);
            // else
            //     g.clipRect(r.x + r.width, r.y, this.width - r.x - r.width, r.height);
        }

        for(var i = this.selectedIndex + 1;i < ~~(this.pages.length / 2); i++) this.paintTab(g, i);

        //!!!!if (cw > 0 && ch > 0) g.setClip(cx, cy, cw, ch);

        if(this.selectedIndex >= 0){
            this.paintTab(g, this.selectedIndex);
            if (this.hasFocus()) this.drawMarker(g, this.getTabBounds(this.selectedIndex));
        }
    },

    function keyPressed(e){
        if(this.selectedIndex != -1 && this.pages.length > 0){
            switch(e.code)
            {
                case KE.VK_UP:
                case KE.VK_LEFT:
                    var nxt = this.next(this.selectedIndex - 1,  -1);
                    if(nxt >= 0) this.select(nxt);
                    break;
                case KE.VK_DOWN:
                case KE.VK_RIGHT:
                    var nxt = this.next(this.selectedIndex + 1, 1);
                    if(nxt >= 0) this.select(nxt);
                    break;
            }
        }
    },

    function mousePressed(e){
        if(e.isActionMask()){
            var index = this.getTabAt(e.x, e.y);
            if(index >= 0 && this.isTabEnabled(index)) this.select(index);
        }
    },

    function calcPreferredSize(target){
        var max = L.getMaxPreferredSize(target);
        if(this.orient == L.BOTTOM || this.orient == L.TOP){
            max.width = Math.max(2 * this.sideSpace + max.width, this.tabAreaWidth);
            max.height += this.tabAreaHeight;
        }
        else{
            max.width += this.tabAreaWidth;
            max.height = Math.max(2 * this.sideSpace + max.height, this.tabAreaHeight);
        }
        max.width  += (this.hgap * 2);
        max.height += (this.vgap * 2);
        return max;
    },

    function doLayout(target){
        var right = this.getRight(), top = this.getTop(), bottom = this.getBottom(), left = this.getLeft();
        var b = (this.orient == L.TOP || this.orient == L.BOTTOM);
        if(b){
            this.tabAreaX = left;
            this.tabAreaY = (this.orient == L.TOP) ? top : this.height - bottom - this.tabAreaHeight;
        }
        else{
            this.tabAreaX = (this.orient == L.LEFT) ? left : this.width - right - this.tabAreaWidth;
            this.tabAreaY = top;
        }
        var count = ~~(this.pages.length / 2), sp = 2*this.sideSpace,
            xx = b ? (this.tabAreaX + this.sideSpace)
                   : ((this.orient == L.LEFT) ? (this.tabAreaX + this.upperSpace) : this.tabAreaX + 1),
            yy = b ? (this.orient == L.TOP ? this.tabAreaY + this.upperSpace : this.tabAreaY + 1)
                   : (this.tabAreaY + this.sideSpace);

        for(var i = 0;i < count; i++ ){
            var r = this.getTabBounds(i);
            if(b){
                r.x = xx;
                r.y = yy;
                xx += r.width;
                if(i == this.selectedIndex) xx -= sp;
            }
            else{
                r.x = xx;
                r.y = yy;
                yy += r.height;
                if(i == this.selectedIndex) yy -= sp;
            }
        }

        for(var i = 0;i < count; i++){
            var l = this.kids[i];
            if(i == this.selectedIndex){
                if(b) {
                    l.setSize(this.width - left - right - 2 * this.hgap,
                              this.height - this.tabAreaHeight - top - bottom - 2 * this.vgap);
                    l.setLocation(left + this.hgap,
                                 ((this.orient == L.TOP) ? top + this.tabAreaHeight : top) + this.vgap);
                }
                else {
                    l.setSize(this.width - this.tabAreaWidth - left - right - 2 * this.hgap,
                              this.height - top - bottom - 2 * this.vgap);
                    l.setLocation(((this.orient == L.LEFT) ? left + this.tabAreaWidth : left) + this.hgap,
                                  top + this.vgap);
                }
            }
            else l.setSize(0, 0);
        }

        if(this.selectedIndex >= 0){
            var r = this.getTabBounds(this.selectedIndex), dt = 0;
            if(b){
                r.x -= this.sideSpace;
                r.y -= (this.orient == L.TOP) ? this.upperSpace : this.brSpace;
                dt = (r.x < left) ? left - r.x : (r.x + r.width > this.width - right) ? this.width - right - r.x - r.width : 0;
            }
            else{
                r.x -= (this.orient == L.LEFT) ? this.upperSpace : this.brSpace;
                r.y -= this.sideSpace;
                dt = (r.y < top) ? top - r.y : (r.y + r.height > this.height - bottom) ? this.height - bottom - r.y - r.height : 0;
            }
            for(var i = 0;i < count; i ++ ){
                var br = this.getTabBounds(i);
                if(b) br.x += dt;
                else br.y += dt;
            }
        }
    },

    function select(index){
        if(this.selectedIndex != index){
            this.selectedIndex = index;
            this._.fire(this, this.selectedIndex);
            this.vrp();
        }
    },

    function focusGained(e){
        if(this.selectedIndex < 0) this.select(this.next(0, 1));
        else {
            if(this.selectedIndex >= 0){
                var r = this.getTabBounds(this.selectedIndex);
                this.repaint(r.x, r.y, r.width, r.height);
            }
        }
    },

    function focusLost(e){
        if(this.selectedIndex >= 0){
            var r = this.getTabBounds(this.selectedIndex);
            this.repaint(r.x, r.y, r.width, r.height);
        }
    },

    function getTabAt(x,y){
        this.validate();
        if(x >= this.tabAreaX && y >= this.tabAreaY &&
            x < this.tabAreaX + this.tabAreaWidth &&
            y < this.tabAreaY + this.tabAreaHeight)
        {
            for(var i = 0; i < ~~(this.pages.length / 2); i++ ) {
                var tb = this.getTabBounds(i);
                if (x >= tb.x && y >= tb.y && x < tb.x + tb.width && y < tb.y + tb.height) return i;
            }
        }
        return -1;
    },

    function setSize(w,h){
        if(this.width != w || this.height != h){
            if(this.orient == L.RIGHT || this.orient == L.BOTTOM) this.tabAreaX =  -1;
            this.$super(w, h);
        }
    },

    function drawMarker(g,r){
        var marker = this.views["marker"];
        if(marker != null){
            var bv = this.views["tab"];
            marker.paint(g, r.x + bv.getLeft(), r.y + bv.getTop(),
                                        r.width - bv.getLeft() - bv.getRight(),
                                        r.height - bv.getTop() - bv.getBottom(), this);
        }
    },

    function paintTab(g, pageIndex){
        var b = this.getTabBounds(pageIndex), page = this.kids[pageIndex], vs = this.views,
            tab = vs["tab"], tabover = vs["tabover"], tabon = vs["tabon"];
        if(this.selectedIndex == pageIndex && tabon != null) tabon.paint(g, b.x, b.y, b.width, b.height, page);
        else tab.paint(g, b.x, b.y, b.width, b.height, page);

        if (this.overTab >= 0 && this.overTab == pageIndex && tabover != null)
            tabover.paint(g, b.x, b.y, b.width, b.height, page);

        var v = this.getTabView(pageIndex),
            ps = v.getPreferredSize(), px = b.x + L.getXLoc(ps.width, L.CENTER, b.width),
            py = b.y + L.getYLoc(ps.height, L.CENTER, b.height);
        v.paint(g, px, py, ps.width, ps.height, page);
        if (this.selectedIndex == pageIndex) v.paint(g, px + 1, py, ps.width, ps.height, page);
    },

    function getTabBounds(i){ return this.pages[2 * i + 1]; }
]);

pkg.Slider = Class(pkg.Panel, KeyListener, MouseListener, FocusListener,MouseMotionListener,
                   Actionable, [
    function $prototype() {
        this.max = this.min = this.value = this.roughStep = this.exactStep = 0;
        this.netSize = this.gap = 3;
        this.correctDt = this.orient = this.scaleStep = this.psW = this.psH = 0;
        this.intervals = this.pl = this.scaleColor = null;

        this.paintNums = function(g,loc){
            if(this.isShowTitle)
                for(var i = 0;i < this.pl.length; i ++ ){
                    var render = this.provider.getView(this, this.getPointValue(i)), d = render.getPreferredSize();
                    if(this.orient == L.HORIZONTAL) render.paint(g, this.pl[i] - ~~(d.width / 2), loc, this);
                    else render.paint(g, loc, this.pl[i] - ~~(d.height / 2), this);
                }
        };

        this.getScaleSize = function(){
            var bs = this.views["bundle"].getPreferredSize();
            return (this.orient == L.HORIZONTAL ? this.width - this.getLeft() - this.getRight() - bs.width
                                                : this.height - this.getTop() - this.getBottom() - bs.height) - 2;
        };

        this.getScaleLocation = function(){
            var bs = this.views["bundle"].getPreferredSize();
            return (this.orient == L.HORIZONTAL ? this.getLeft() + ~~(bs.width / 2)
                                                : this.getTop()  + ~~(bs.height/ 2)) + 1;
        };
    },

    function() { this.$this(L.HORIZONTAL); },

    function (o){
        this._ = new Listeners();
        this.views = {};
        this.views["gauge"]  = pkg.get("sl.gauge");
        this.views["marker"] = pkg.get("sl.marker");
        this.views["bundle"] = pkg.get(o == L.HORIZONTAL ? "sl.hbundle" : "sl.vbundle");
        this.$super();

        this.provider = this;
        this.isShowScale = this.isShowTitle = true;
        this.dragged = this.isIntervalMode = false;
        this.render = new pkg.view.TextRender("");
        this.render.setDefBoldFont();
        this.render.setForeground(this.scaleColor);
        this.setScaleColor(pkg.get("sl.scc"));
        this.orient = o;
        this.setValues(0, 20, [0, 5, 10], 2, 1);
        this.setScaleStep(1);
        this.customize(pkg.Wizard.SLIDER);
    },

    function focusGained(e){ this.repaint(); },
    function focusLost(e){ this.repaint(); },
    function canHaveFocus(){ return true; },

    function setScaleGap(g){
        if(g != this.gap){
            this.gap = g;
            this.vrp();
        }
    },

    function setScaleColor(c){
        if(!c.equals(this.scaleColor)){
            this.scaleColor = c;
            if (this.provider == this) this.render.setForeground(c);
            this.repaint();
        }
    },

    function setScaleStep(s){
        if(s != this.scaleStep){
            this.scaleStep = s;
            this.repaint();
        }
    },

    function showScale(b){
        if(isShowScale != b){
            this.isShowScale = b;
            this.vrp();
        }
    },

    function showTitle(b){
        if(this.isShowTitle != b){
            this.isShowTitle = b;
            this.vrp();
        }
    },

    function setViewProvider(p){
        if(p != this.provider){
            this.provider = p;
            this.vrp();
        }
    },

    function getView(d,o){
        this.render.target.setText(o != null ? o.toString() : "");
        return this.render;
    },

    function setViews(v){
        for(var k in v) this.views[k] = v[k];
        this.vrp();
    },

    function setValue(v){
        if(v < this.min || v > this.max) throw new Error();
        var prev = this.value;
        if(this.value != v){
            this.value = v;
            this._.fire(this, prev);
            this.repaint();
        }
    },

    function setValues(min,max,intervals,roughStep,exactStep){
        if(roughStep <= 0 || exactStep < 0 || min >= max || min + roughStep > max || min + exactStep > max)
            throw new Error();

        for(var i = 0, start = min;i < intervals.length; i ++ ){
            start += intervals[i];
            if(start > max || intervals[i] < 0) throw new Error();
        }
        this.min = min;
        this.max = max;
        this.roughStep = roughStep;
        this.exactStep = exactStep;
        this.intervals = Array(intervals.length);
        for(var i=0; i<intervals.length; i++) this.intervals[i] = intervals[i];
        if(this.value < min || this.value > max) this.setValue(this.isIntervalMode ? min + intervals[0] : min);
        this.vrp();
    },

    function getPointValue(i){
        var v = this.min + this.intervals[0];
        for(var j = 0; j < i; j++, v += this.intervals[j]);
        return v;
    },

    function keyPressed(e){
        var b = this.isIntervalMode;
        switch(e.code)
        {
            case KE.VK_UP:
            case KE.VK_LEFT:
                var v = this.nextValue(this.value, this.exactStep,-1);
                if(v >= this.min) this.setValue(v);
                break;
            case KE.VK_DOWN:
            case KE.VK_RIGHT:
                var v = this.nextValue(this.value, this.exactStep, 1);
                if(v <= this.max) this.setValue(v);
                break;
            case KE.VK_HOME: this.setValue(b ? this.getPointValue(0) : this.min);break;
            case KE.VK_END: this.setValue(b ? this.getPointValue(this.intervals.length - 1) : this.max);break;
        }
    },

    function mousePressed(e){
        if(e.isActionMask()){
            var x = e.x, y = e.y, bb = this.getBundleBounds(this.value);
            if (x < bb.x || y < bb.y || x >= bb.x + bb.width || y >= bb.y + bb.height) {
                var l = ((this.orient == L.HORIZONTAL) ? x : y), v = this.loc2value(l);
                if(this.value != v)
                    this.setValue(this.isJumpOnPress ? v
                                                     : this.nextValue(this.value, this.roughStep, v < this.value ? -1:1));
            }
        }
    },

    function startDragged(e){
        var r = this.getBundleBounds(this.value);
        if(e.x >= r.x && e.y >= r.y && e.x < r.x + r.width && e.y < r.y + e.height){
            this.dragged = true;
            this.correctDt = this.orient == L.HORIZONTAL ? r.x + ~~(r.width  / 2) - e.x
                                                         : r.y + ~~(r.height / 2) - e.y;
        }
    },

    function endDragged(e){ this.dragged = false; },

    function mouseDragged(e){
        if(this.dragged)
            this.setValue(this.findNearest(e.x + (this.orient == L.HORIZONTAL ? this.correctDt : 0),
                                           e.y + (this.orient == L.HORIZONTAL ? 0 : this.correctDt)));
    },

    function paint(g){
        if(this.pl == null){
            this.pl = Array(this.intervals.length);
            for(var i = 0, l = this.min;i < this.pl.length; i ++ ){
                l += this.intervals[i];
                this.pl[i] = this.value2loc(l);
            }
        }
        var left = this.getLeft(), top = this.getTop(), right = this.getRight(), bottom = this.getBottom(),
            bnv = this.views["bundle"], gauge = this.views["gauge"],
            bs = bnv.getPreferredSize(), gs = gauge.getPreferredSize(),
            w = this.width - left - right - 2, h = this.height - top - bottom - 2;

        if(this.orient == L.HORIZONTAL){
            var topY = top + ~~((h - this.psH) / 2) + 1, by = topY;
            if(this.isEnabled)
                gauge.paint(g, left + 1, topY + ~~((bs.height - gs.height) / 2), w, gs.height, this);
            else{
                g.setColor(rgb.gray);
                g.strokeRect(left + 1, topY + ~~((bs.height - gs.height) / 2), w, gs.height);
            }
            topY += bs.height;
            if(this.isShowScale){
                topY += this.gap;
                g.setColor(this.isEnabled ? this.scaleColor : rgb.gray);
                for(var i = this.min;i <= this.max; i += this.scaleStep){
                    var xx = this.value2loc(i);
                    g.drawLine(xx, topY, xx, topY + this.netSize);
                }
                for(var i = 0;i < this.pl.length; i ++ )
                    g.drawLine(this.pl[i], topY, this.pl[i], topY + 2 * this.netSize);
                topY += (2 * this.netSize);
            }
            this.paintNums(g, topY);
            bnv.paint(g, this.getBundleLoc(this.value), by, bs.width, bs.height, this);
        }
        else{
            var leftX = left + ~~((w - this.psW) / 2) + 1, bx = leftX;
            if(this.isEnabled)
                gauge.paint(g, leftX + ~~((bs.width - gs.width) / 2), top + 1, gs.width, h, this);
            else{
                g.setColor(rgb.gray);
                g.strokeRect(leftX + ~~((bs.width - gs.width) / 2), top + 1, gs.width, h);
            }
            leftX += bs.width;
            if(this.isShowScale){
                leftX += this.gap;
                g.setColor(this.scaleColor);
                for(var i = this.min;i <= this.max; i += this.scaleStep){
                    var yy = this.value2loc(i);
                    g.drawLine(leftX, yy, leftX + this.netSize, yy);
                }
                for(var i = 0;i < this.pl.length; i ++ )
                    g.drawLine(leftX, this.pl[i], leftX + 2 * this.netSize, this.pl[i]);
                leftX += (2 * this.netSize);
            }
            this.paintNums(g, leftX);
            bnv.paint(g, bx, this.getBundleLoc(this.value), bs.width, bs.height, this);
        }
        if(this.hasFocus()) this.views["marker"].paint(g, left, top, w + 2, h + 2, this);
    },

    function findNearest(x,y){
        var v = this.loc2value(this.orient == L.HORIZONTAL ? x : y);
        if(this.isIntervalMode){
            var nearest = Number.MAX_VALUE, res = 0;
            for(var i = 0;i < this.intervals.length; i ++ ){
                var pv = this.getPointValue(i), dt = Math.abs(pv - v);
                if(dt < nearest){
                    nearest = dt;
                    res = pv;
                }
            }
            return res;
        }
        v = this.exactStep * ~~((v + v % this.exactStep) / this.exactStep);
        if(v > this.max) v = this.max;
        else if(v < this.min) v = this.min;
        return v;
    },

    function value2loc(v){
        return ~~((this.getScaleSize() * (v - this.min)) / (this.max - this.min)) +
               this.getScaleLocation();
    },

    function loc2value(xy){
        var sl = this.getScaleLocation(), ss = this.getScaleSize();
        if(xy < sl) xy = sl;
        else if(xy > sl + ss) xy = sl + ss;
        return this.min + ~~(((this.max - this.min) * (xy - sl)) / ss);
    },

    function invalidate(){
        this.pl = null;
        this.$super();
    },

    function calcPreferredSize(l){ return { width:this.psW + 2, height: this.psH + 2 }; },

    function recalc(){
        var ps = this.views["bundle"].getPreferredSize(),
            ns = this.isShowScale ? (this.gap + 2 * this.netSize) : 0,
            dt = this.max - this.min, hMax = 0, wMax = 0;

        if(this.isShowTitle && this.intervals.length > 0){
            for(var i = 0;i < this.intervals.length; i ++ ){
                var v = this.provider.getView(this, this.getPointValue(i)), d = v.getPreferredSize();
                if(d.height > hMax) hMax = d.height;
                if(d.width  > wMax) wMax = d.width;
            }
        }
        if(this.orient == L.HORIZONTAL){
            this.psW = dt * 2 + ps.width;
            this.psH = ps.height + ns + hMax;
        }
        else{
            this.psW = ps.width + ns + wMax;
            this.psH = dt * 2 + ps.height;
        }
    },

    function nextValue(value,s,d){
        if(this.isIntervalMode) return this.getNeighborPoint(value, d);
        else{
            var v = value + (d * s);
            if(v > this.max) v = this.max;
            else if(v < this.min) v = this.min;
            return v;
        }
    },

    function getBundleLoc(v){
        var bs = this.views["bundle"].getPreferredSize();
        return this.value2loc(v) - (this.orient == L.HORIZONTAL ? ~~(bs.width / 2)
                                                                : ~~(bs.height / 2));
    },

    function getBundleBounds(v){
        var bs = this.views["bundle"].getPreferredSize();
        return this.orient == L.HORIZONTAL ? { x:this.getBundleLoc(v),
                                               y:this.getTop() + ~~((this.height - this.getTop() - this.getBottom() - this.psH) / 2) + 1,
                                               width:bs.width, height:bs.height }
                                           : { x:this.getLeft() + ~~((this.width - this.getLeft() - this.getRight() - this.psW) / 2) + 1,
                                               y:this.getBundleLoc(v), width:bs.width, height:bs.height };
    },

    function getNeighborPoint(v,d){
        var left = this.min + this.intervals[0], right = this.getPointValue(this.intervals.length - 1);
        if (v < left) return left;
        else if (v > right) return right;
        if (d > 0) {
            var start = this.min;
            for(var i = 0;i < this.intervals.length; i ++ ){
                start += this.intervals[i];
                if(start > v) return start;
            }
            return right;
        }
        else {
            var start = right;
            for(var i = this.intervals.length - 1;i >= 0; i--) {
                if (start < v) return start;
                start -= this.intervals[i];
            }
            return left;
        }
    }
]);

pkg.StatusBar = new Class(pkg.Panel, [
    function () { this.$this(2); },

    function (gap){
        this.$super(new L.PercentLayout(Layout.HORIZONTAL, gap));
        this.setBorderView(pkg.get("sbar.br"));
        this.paddings(gap, 0, 0, 0);
        this.customize(pkg.Wizard.SBAR);
    },

    function setBorderView(v){
        if(v != this.borderView){
            this.borderView = v;
            for(var i = 0;i < this.count(); i++) this.get(i).setBorder(this.borderView);
            this.repaint();
        }
    },

    function insert(i,s,d){
        d.setBorder(this.borderView);
        this.$super(i, s, d);
    }
]);

zebra.ready(function() {
    if (zebra.isInBrowser) {
        $fmCanvas = document.createElement("canvas").getContext("2d");
        var e = document.getElementById("zebra.fm");
        if (e == null) {
            e = document.createElement("div");
            e.setAttribute("id", "zebra.fm");
            e.setAttribute("style", "visibility:hidden;line-height: 0; height:1px;");
            e.innerHTML = "<span id='zebra.fm.text'  style='display:inline;'>&nbsp;</span>" +
                          "<img  id='zebra.fm.image' style='display:inline;' src='1x1.png' width='1' height='1'/>";
            document.body.appendChild(e);
        }
        $fmText  = document.getElementById("zebra.fm.text");
        $fmImage = document.getElementById("zebra.fm.image");

        pkg.Font.defaultNormal = new pkg.Font(defFontName, 0, 12);
        pkg.Font.defaultSmall  = new pkg.Font(defFontName, 0, 10);
        pkg.Font.defaultBold   = new pkg.Font(defFontName, pkg.Font.BOLD, 12);
    }


    var p = zebra()['theme.path'], pl = zebra()['theme.palette'];
    if (typeof pl === "undefined") pl = "default";
    if (typeof p === "undefined") p = "theme/p3d/" + pl + ".properties";
    pkg.$objects.load(p, pkg);
});

})(zebra("ui"), zebra.Class, zebra.Interface);
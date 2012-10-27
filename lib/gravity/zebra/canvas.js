(function(pkg, Class, Interface) {

var instanceOf = zebra.instanceOf, L = zebra.layout, $configurators = [],
    rgb = zebra.util.rgb, temporary = { x:0, y:0, width:0, height:0 },
    $fmCanvas = null, $fmText = null, $fmImage = null, defFontName = "Arial";

pkg.getPreferredSize = function(l) {
    return l != null && l.isVisible ? l.getPreferredSize() : { width:0, height:0 };
};

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

pkg.configurator = function(c) { $configurators.push(c); };

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

var MouseListener       = pkg.MouseListener       = Interface(),
    MouseMotionListener = pkg.MouseMotionListener = Interface(),
    FocusListener       = pkg.FocusListener       = Interface(),
    KeyListener         = pkg.KeyListener         = Interface(),
    Cursorable          = pkg.Cursorable          = Interface();
    Composite           = pkg.Composite           = Interface();
    ChildrenListener    = pkg.ChildrenListener    = Interface();

pkg.ComponentListener   = Interface(),
pkg.ContainerListener   = Interface();
pkg.Layer               = Interface();

var CL = pkg.ComponentListener;
CL.COMP_ENABLED = 1;
CL.COMP_SHOWN   = 2;
CL.COMP_MOVED   = 3;
CL.COMP_SIZED   = 4;

var CNL = pkg.ContainerListener;
CNL.COMP_ADDED = 1;
CNL.COMP_REMOVED = 2;
CNL.LAYOUT_SET = 3;

var IE = pkg.InputEvent = Class([
    function $clazz() {
        this.MOUSE_UID    = 1;
        this.KEY_UID      = 2;
        this.FOCUS_UID    = 3;
        this.FOCUS_LOST   = 1;
        this.FOCUS_GAINED = 2;
    },

    function (target, id){
        this.source = target;
        if (id != IE.FOCUS_GAINED && id != IE.FOCUS_LOST) throw new Error();
        this.UID = IE.FOCUS_UID;
        this.ID = id;
    },

    function (target, id, uid){
        this.source = target;
        this.ID = id;
        this.UID = uid;
    }
]);

var KE = pkg.KeyEvent = Class(IE, [
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
        this.$super(target, id, IE.KEY_UID);
        this.reset(target, id, code, ch, mask);
    }
]);

var ME = pkg.MouseEvent = Class(IE, [
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
        this.$super(target, id, IE.MOUSE_UID);
        this.reset(target, id, ax, ay, mask, clicks);
    }
]);

pkg.getDesktop = function(c){
    c = L.getTopParent(c);
    return instanceOf(c, pkg.zCanvas) ? c : null;
};

var MDRAGGED = ME.DRAGGED, EM = null, MMOVED = ME.MOVED, MEXITED = ME.EXITED, MENTERED = ME.ENTERED,
    KPRESSED = KE.PRESSED, BM1 = ME.LEFT_BUTTON, BM3 = ME.RIGHT_BUTTON, MS = Math.sin, MC = Math.cos,
    context = Object.getPrototypeOf(document.createElement('canvas').getContext('2d')),
    $mousePressedEvent = null, $keyPressedCode = -1, $keyPressedOwner = null, $mousePressedX = 0, $mousePressedY = 0,
    $keyPressedModifiers = 0, KE_STUB = new KE(null,  KPRESSED, 0, 'x', 0), $focusGainedCounter = 0,
    ME_STUB = new ME(null,  ME.PRESSED, 0, 0, 0, 1), meX, meY, MB = zebra.util;

pkg.paintManager = pkg.events = pkg.$mousePressedOwner = pkg.$mouseDraggOwner = pkg.$mouseMoveOwner = null;

// !!!!
// the document mouse up happens whan we drag outside a canvas
// in this case canvas soen't get mouse up, so we do it by global mouseup handler
document.addEventListener("mouseup", function(e) {
    if (pkg.$mousePressedOwner) {
        var d = pkg.getDesktop(pkg.$mousePressedOwner);
        d.mouseReleased(e);
    }
},  false);

var $alert = (function(){ return this.alert; }());
window.alert = function() {
    if ($keyPressedCode > 0) {
        KE_STUB.reset($keyPressedOwner, KE.RELEASED, $keyPressedCode, '', $keyPressedModifiers);
        EM.performInput(KE_STUB);
        $keyPressedCode = -1;
    }
    $alert.apply(window, arguments);
    if ($mousePressedEvent) $mousePressedEvent.$zcanvas.mouseReleased($mousePressedEvent);
};

//!!!! debug var debugOff = true, setup = [];
// function debug(msg, d) {
//     if (debugOff) return ;
//     if (d == -1) shift.pop();
//     zebra.print(shift.join('') + msg);
//     if (d == 1) shift.push('    ');
// }

context.setFont = function(f) {
    if (f.s != this.font) {
        this.font = f.s;
    }
};

context.setColor = function(c) {
    if (c == null) throw new Error("Null color");
    if (c.s != this.fillStyle) this.fillStyle = c.s;
    if (c.s != this.strokeStyle) this.strokeStyle = c.s;
};

context.drawLine = function(x1, y1, x2, y2, w){
    if (arguments.length < 5) w = 1;
    var pw = this.lineWidth;
    this.beginPath();
    this.lineWidth = w;

    if (x1 == x2) {
        x1 += w / 2;
        x2 = x1;
    }
    else
    if (y1 == y2) {
        y1 += w / 2;
        y2 = y1;
    }

    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.stroke();
    this.lineWidth = pw;
};

context.drawArc = function(cx,cy,r, sa, ea, d){
    this.beginPath();
    this.arc(cx, cy, r, sa, ea, d);
    this.stroke();
};

context.fillArc = function(cx,cy,r, sa, ea, d){
    this.beginPath();
    this.arc(cx, cy, r, sa, ea, d);
    this.fill();
};

context.ovalPath = function(x,y,w,h){
    this.beginPath();
    var kappa = 0.5522848, ox = (w / 2) * kappa, oy = (h / 2) * kappa,
        xe = x + w, ye = y + h, xm = x + w / 2, ym = y + h / 2;
    this.moveTo(x, ym);
    this.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    this.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    this.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    this.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
};

context.polylinePath = function(xPoints, yPoints, nPoints){
    this.beginPath();
    this.moveTo(xPoints[0], yPoints[0]);
    for(var i=1; i < nPoints; i++) this.lineTo(xPoints[i], yPoints[i]);
};

context.drawOval = function(x,y,w,h) {
    this.ovalPath(x, y, w, h);
    this.stroke();
};

context.drawPolygon = function(xPoints,yPoints,nPoints){
    this.polylinePath(xPoints, yPoints, nPoints);
    this.lineTo(xPoints[0], yPoints[0]);
    this.stroke();
};

context.drawPolyline = function(xPoints,yPoints,nPoints){
    this.polylinePath(xPoints, yPoints, nPoints);
    this.stroke();
};

context.fillPolygon = function(xPoints,yPoints,nPoints){
    this.polylinePath(xPoints, yPoints, nPoints);
    this.lineTo(xPoints[0], yPoints[0]);
    this.fill();
};

context.fillOval = function(x,y,width,height){
    this.beginPath();
    this.ovalPath(x, y, width, height);
    this.fill();
};

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
};

context.drawDashLine = function(x,y,x2,y2) {
    var pattern=[1,2], count = pattern.length, ctx = this, compute = null,
        dx = (x2 - x), dy = (y2 - y), b = (Math.abs(dx) > Math.abs(dy)),
        slope = b ? dy / dx : dx / dy, sign = b ? (dx < 0 ?-1:1) : (dy < 0?-1:1);

    if (b) {
        compute = function(step) {
            x += step;
            y += slope * step;
        };
    }
    else {
        compute = function(step) {
            x += slope * step;
            y += step;
        };
    }

    ctx.moveTo(x, y);
    var dist = Math.sqrt(dx * dx + dy * dy), i = 0;
    while (dist >= 0.1) {
        var dl = Math.min(dist, pattern[i % count]), step = Math.sqrt(dl * dl / (1 + slope * slope)) * sign;
        compute(step);
        ctx[(i % 2 === 0) ? 'lineTo' : 'moveTo'](x + 0.5, y + 0.5);
        dist -= dl;
        i++;
    }
    ctx.stroke();
};

//!!! has to be made public in layout !!!
function measure(e, cssprop) {
    var value = window.getComputedStyle ? window.getComputedStyle(e, null).getPropertyValue(cssprop)
                                        : (e.style ? e.style[cssprop] : e.currentStyle[cssprop]);

    if (value == null || value == '') return 0;
    var m = /(^[0-9\.]+)([a-z]+)?/.exec(value);
    return parseInt(m[1], 10);
}

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

pkg.get = function(key) { return pkg.$objects.get(key); };

pkg.Panel = Class(L.Layoutable, [
     function $prototype() {
        this.top = this.left = this.right = this.bottom = 0;
        this.isEnabled = true;

        this.notifyRender = function(o,n){
            if (o != null && o.ownerChanged) o.ownerChanged(null);
            if (n != null && n.ownerChanged) n.ownerChanged(this);
        };

        this.properties = function(p) {
            var clazz = this.getClazz();
            for(var k in p) {
                if (p.hasOwnProperty(k)) {
                    zebra.util.getPropertySetter(clazz, k)(this, p[k]);
                }
            }
        };

        this.getComponentAt = function(xx,yy){
            var r = cvp(this, temporary);
            if (r == null || (xx < r.x || yy < r.y || xx >= r.x + r.width || yy >= r.y + r.height)) {
                return null;
            }

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

        this.getTop = function() {
            return this.border != null ? this.top + this.border.getTop() : this.top;
        };

        this.getLeft = function() {
            return this.border != null ? this.left + this.border.getLeft() : this.left;
        };

        this.getBottom = function() {
            return this.border != null ? this.bottom + this.border.getBottom() : this.bottom;
        };

        this.getRight  = function() {
            return this.border != null ? this.right  + this.border.getRight()  : this.right;
        };

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

    function() {
        this.$super();
        var clazz = this.getClazz();
        while (clazz) {
            if (clazz.properties != null) {
                this.properties(clazz.properties);
                break;
            }
            clazz = clazz.$parent;
        }
    },

    function(l) {
        this.$this();
        this.setLayout(l);
    },

    function setBackground(v){
        var old = this.bg;

        if (zebra.isString(v)) {
            v = rgb.hasOwnProperty(v) ? rgb[v] : new rgb(v);
        }

        if (typeof v === "function") {
            v = pkg.view.createView(v);
        }

        if(v != old){
            this.bg = v;
            this.notifyRender(old, v);
            this.repaint();
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

pkg.BaseLayer = Class(pkg.Panel, pkg.Layer, [
    function $prototype() {
        this.isLayerActive = function(){ return true;};
        this.isLayerActiveAt = function(x,y){return true;};

        this.layerMousePressed = function(x,y,m){};
        this.layerKeyPressed = function(code,m){};
        this.getFocusRoot = function() { return this; };

        activate = function(b){
            var fo = pkg.focusManager.focusOwner;
            if (L.isAncestorOf(this, fo) === false) fo = null;
            if (b) pkg.focusManager.requestFocus(fo != null ? fo : pfo);
            else {
                this.pfo = fo;
                pkg.focusManager.requestFocus(null);
            }
        };
    },

    function (id){
        if (id == null) throw new Error("Wrong ID");
        this.pfo = null;
        this.$super();
        this.id = id;
    }
]);

pkg.ViewPan = Class(pkg.Panel, [
    function $prototype() {
        this.paint = function (g){
            var v = this.view;
            if(v != null){
                var l = this.getLeft(), t = this.getTop();
                v.paint(g, l, t, this.width  - l - this.getRight(),
                                 this.height - t - this.getBottom(), this);
            }
        };

        this.setView = function (v){
            var old = this.view;

            if (typeof v === "function") {
                v = pkg.view.createView(v);
            }

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

pkg.Manager = Class([
    function() {
        //!!! sometimes pkg.events is set to descriptor the descriptor
        //    is used ot instantiate new event manager. when we do it
        //    Manager constructor is called from new phase of event manager
        //    instantiation what means  event manager is not null (points to descriptor)
        //    but not assigned yet. So we need check extra condition pkg.events.addListener != null
        if (pkg.events != null && pkg.events.addListener != null) {
            pkg.events.addListener(this);
        }
    }
]);

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
            var b = c.bg != null && (c.parent == null || c.bg.equals(c.parent.bg) === false);
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
            while (instanceOf(top, pkg.Layer) === false) top = top.parent;
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
                if (oldFocusOwner != null) pkg.events.performInput(new IE(oldFocusOwner, IE.FOCUS_LOST));
                if (this.focusOwner != null){ pkg.events.performInput(new IE(this.focusOwner, IE.FOCUS_GAINED)); }
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
            if(c == null && instanceOf(t, Cursorable)) c = t;
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
        var IEHM = [], MUID = IE.MOUSE_UID, KUID = IE.KEY_UID,
            CSIZED = CL.COMP_SIZED, CMOVED = CL.COMP_MOVED,
            CENABLED = CL.COMP_ENABLED, CSHOWN = CL.COMP_SHOWN;

        IEHM[KE.TYPED]          = 'keyTyped';
        IEHM[KE.RELEASED]       = 'keyReleased';
        IEHM[KE.PRESSED]        = 'keyPressed';
        IEHM[ME.DRAGGED]        = 'mouseDragged';
        IEHM[ME.STARTDRAGGED]   = 'startDragged';
        IEHM[ME.ENDDRAGGED]     = 'endDragged';
        IEHM[ME.MOVED]          = 'mouseMoved';
        IEHM[ME.CLICKED]        = 'mouseClicked';
        IEHM[ME.PRESSED]        = 'mousePressed';
        IEHM[ME.RELEASED]       = 'mouseReleased';
        IEHM[ME.ENTERED]        = 'mouseEntered';
        IEHM[ME.EXITED]         = 'mouseExited';
        IEHM[IE.FOCUS_LOST]     = 'focusLost';
        IEHM[IE.FOCUS_GAINED]   = 'focusGained';

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
                case IE.FOCUS_UID:
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
        this.m_l  = [];
        this.mm_l = [];
        this.k_l  = [];
        this.f_l  = [];
        this.c_l  = [];
        this.cc_l = [];
        this.$super();
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

function setupMeF() {
    if (zebra.isIE) {
        var de = document.documentElement, db = document.body;
        meX = function meX(e, d) { return d.graph.tX(e.clientX - d.offx + de.scrollLeft + db.scrollLeft,
                                                     e.clientY - d.offy + de.scrollTop  + db.scrollTop);  };
        meY = function meY(e, d) {
            return d.graph.tY(e.clientX - d.offx + de.scrollLeft + de.scrollLeft,
                              e.clientY - d.offy + de.scrollTop + db.scrollTop);  };
    }
    else {
        meX = function meX(e, d) {  return d.graph.tX(e.pageX - d.offx, e.pageY - d.offy); };
        meY = function meY(e, d) {  return d.graph.tY(e.pageX - d.offx, e.pageY - d.offy); };
    }
}

function createContext(ctx, w, h) {
    var $save = ctx.save, $restore = ctx.restore, $rotate = ctx.rotate, $scale = ctx.scale, $translate = ctx.translate;

    ctx.counter = 0;
    ctx.stack = Array(33);
    for(var i=0; i < ctx.stack.length; i++) {
        var s = {};
        s.srot = s.rotateVal = s.x = s.y = s.width = s.height = s.dx = s.dy = 0;
        s.crot = s.sx = s.sy = 1;
        ctx.stack[i] = s;
    }
    ctx.stack[0].width  = w;
    ctx.stack[0].height = h;
    ctx.setFont(pkg.view.font);
    ctx.setColor(zebra.util.rgb.white);

    ctx.getTopStack = function() { return this.stack[this.counter]; };

    ctx.tX = function(x, y) {
        var c = this.stack[this.counter], b = (c.sx != 1 || c.sy != 1 || c.rotateVal !== 0);
        return (b ?  ((c.crot * x + y * c.srot)/c.sx + 0.5) | 0 : x) - c.dx;
    };

    ctx.tY = function(x, y) {
        var c = this.stack[this.counter], b = (c.sx != 1 || c.sy != 1 || c.rotateVal !== 0);
        return (b ? ((y * c.crot - c.srot * x)/c.sy + 0.5) | 0 : y) - c.dy;
    };

    ctx.translate = function(dx, dy) {
        if (dx !== 0 || dy !== 0) {
            var c = this.stack[this.counter];
            c.x -= dx;
            c.y -= dy;
            c.dx += dx;
            c.dy += dy;
            $translate.call(this, dx, dy);
        }
    };

    ctx.rotate = function(v) {
        var c = this.stack[this.counter];
        c.rotateVal += v;
        c.srot = MS(c.rotateVal);
        c.crot = MC(c.rotateVal);
        $rotate.call(this, v);
    };

    ctx.scale = function(sx, sy) {
        var c = this.stack[this.counter];
        c.sx = c.sx * sx;
        c.sy = c.sy * sy;
        $scale.call(this, sx, sy);
    };

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
    };

    ctx.restore = function() {
        if (this.counter === 0) throw new Error();
        this.counter--;
        $restore.call(this);
        return this.counter;
    };

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
    };

    ctx.reset = function(w, h) {
        //!!!!!!!!!!!!
        this.counter = 0;
        this.stack[0].width = w;
        this.stack[0].height = h;
    };

    return ctx;
}

pkg.zCanvas = Class(pkg.Panel, [
    function $clazz() {
        this.Layout = Class(L.Layout, [
            function calcPreferredSize(c) {
                return  { width:parseInt(c.canvas.width, 10), height:parseInt(c.canvas.height, 10) };
            },

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
        ]);
    },

    function $prototype() {
        function km(e) {
            var c = 0;
            if (e.altKey)   c += KE.ALT;
            if (e.shiftKey) c += KE.SHIFT;
            if (e.ctrlKey)  c += KE.CTRL;
            if (e.metaKey)  c += KE.CMD;
            return c;
        }

        this.focusGained = function(e){
            if ($focusGainedCounter++ > 0) {
                e.preventDefault();
                return;
            }

            //debug("focusGained");

            if (pkg.focusManager.prevFocusOwner != null) {
                pkg.focusManager.requestFocus(pkg.focusManager.prevFocusOwner);
            }
        };

        this.focusLost = function(e){
            //!!! sometimes focus lost comes incorrectly
            if (document.activeElement == this.canvas) {
                e.preventDefault();
                return;
            }

            if ($focusGainedCounter === 0) return;
            $focusGainedCounter = 0;

            //debug("focusLost");

            if (pkg.focusManager.focusOwner != null || pkg.getDesktop(pkg.focusManager.focusOwner) == this) {
                pkg.focusManager.requestFocus(null);
            }
        };

        this.keyTyped = function(e){
            if (e.charCode == 0) {
                if ($keyPressedCode != e.keyCode) this.keyPressed(e);
                $keyPressedCode = -1;
                return;
            }

            var ch = e.charCode;
            if (ch > 0) {
                var fo = pkg.focusManager.focusOwner;
                if(fo != null) {
                    //debug("keyTyped: " + e.keyCode + "," + e.charCode + " " + (e.charCode == 0));
                    KE_STUB.reset(fo, KE.TYPED, e.keyCode, String.fromCharCode(e.charCode), km(e));
                    EM.performInput(KE_STUB);
                }
            }

            if (e.keyCode < 47) e.preventDefault();
        };

        this.keyPressed = function(e){
            $keyPressedCode  = e.keyCode;

            var code = e.keyCode, m = km(e);
            for(var i = this.kids.length - 1;i >= 0; i--){
                var l = this.kids[i];
                l.layerKeyPressed(code, m);
                if (l.isLayerActive()) break;
            }

            var focusOwner = pkg.focusManager.focusOwner;
            $keyPressedOwner     = focusOwner;
            $keyPressedModifiers = m;

            if (focusOwner != null) {
                //debug("keyPressed : " + e.keyCode, 1);
                KE_STUB.reset(focusOwner, KPRESSED, code, code < 47 ? KE.CHAR_UNDEFINED : '?', m);
                EM.performInput(KE_STUB);

                if (code == KE.VK_ENTER) {
                    //debug("keyTyped keyCode = " + code);
                    KE_STUB.reset(focusOwner, KE.TYPED, code, "\n", m);
                    EM.performInput(KE_STUB);
                }
            }

            //!!!!
            if (code < 47 && code != 32) e.preventDefault();
        };

        this.keyReleased = function(e){
            $keyPressedCode = -1;

            var fo = pkg.focusManager.focusOwner;
            if(fo != null) {
                //debug("keyReleased : " + e.keyCode, -1);
                KE_STUB.reset(fo, KE.RELEASED, e.keyCode, KE.CHAR_UNDEFINED, km(e));
                EM.performInput(KE_STUB);
            }
        };

        this.mouseEntered = function(e){
            if (pkg.$mouseDraggOwner == null){
                var x = meX(e, this), y = meY(e, this), d = this.getComponentAt(x, y);

                if (pkg.$mouseMoveOwner != null && d != pkg.$mouseMoveOwner) {
                    var prev = pkg.$mouseMoveOwner;
                    pkg.$mouseMoveOwner = null;

                    //debug("mouseExited << ", -1);
                    ME_STUB.reset(prev, MEXITED, x, y, -1, 0);
                    EM.performInput(ME_STUB);
                }

                if(d != null && d.isEnabled){
                    //debug("mouseEntered >> ", 1);
                    pkg.$mouseMoveOwner = d;
                    ME_STUB.reset(d, MENTERED, x, y, -1, 0);
                    EM.performInput(ME_STUB);
                }
            }
        };

        this.mouseExited = function (e){
            if(pkg.$mouseMoveOwner != null && pkg.$mouseDraggOwner == null){
                var p = pkg.$mouseMoveOwner;
                pkg.$mouseMoveOwner = null;

                ME_STUB.reset(p, MEXITED, meX(e, this), meY(e, this), -1, 0);
                EM.performInput(ME_STUB);
            }
        };

        this.mouseMoved = function(e){
            if (pkg.$mousePressedOwner != null) {
                this.mouseDragged(e);
                return;
            }

            var x = meX(e, this), y = meY(e, this), d = this.getComponentAt(x, y);
            if (pkg.$mouseMoveOwner != null) {
                if (d != pkg.$mouseMoveOwner) {
                    var old = pkg.$mouseMoveOwner;

                    //debug("mouseExited << ", -1);

                    pkg.$mouseMoveOwner = null;
                    ME_STUB.reset(old, MEXITED, x, y, -1, 0);
                    EM.performInput(ME_STUB);

                    if (d != null && d.isEnabled === true) {

                        //debug("mouseEntered >> " , 1);

                        pkg.$mouseMoveOwner = d;
                        ME_STUB.reset(pkg.$mouseMoveOwner, MENTERED, x, y, -1, 0);
                        EM.performInput(ME_STUB);
                    }
                }
                else {
                    if (d != null && d.isEnabled) {
                        ME_STUB.reset(d, MMOVED, x, y, -1, 0);
                        EM.performInput(ME_STUB);
                    }
                }
            }
            else {
                if (d != null && d.isEnabled === true){
                    //debug("mouseEntered >> ", 1);
                    pkg.$mouseMoveOwner = d;
                    ME_STUB.reset(d, MENTERED, x, y, -1, 0);
                    EM.performInput(ME_STUB);
                }
            }
        };

        this.mouseReleased = function(e){
            if ($mousePressedEvent == null) return;
            $mousePressedEvent = null;

            var drag = pkg.$mouseDraggOwner, x = meX(e, this), y = meY(e, this), m = e.button === 0 ? BM1: (e.button == 2 ? BM3 : 0);
            if(drag != null){
                ME_STUB.reset(drag, ME.ENDDRAGGED, x, y, m, 0);
                EM.performInput(ME_STUB);
                pkg.$mouseDraggOwner = null;
            }

            var po = pkg.$mousePressedOwner;
            if (po != null){

                //debug("mouseReleased ", -1);
                ME_STUB.reset(po, ME.RELEASED, x, y, m, 0);
                EM.performInput(ME_STUB);

                if (drag == null) {
                    var when = (new Date()).getTime(), clicks = ((when - this.lastClickTime) < this.doubleClickDelta) ? 2 : 1;
                    ME_STUB.reset(po, ME.CLICKED, x, y, m, clicks);
                    EM.performInput(ME_STUB);
                    this.lastClickTime = clicks > 1 ? 0 : when;
                }
                pkg.$mousePressedOwner = null;
            }

            var mo = pkg.$mouseMoveOwner;
            if (drag != null || (po != null && po != mo)) {
                var nd = this.getComponentAt(x, y);
                if (nd != mo) {
                    if (mo != null) {
                        //debug("mouseExited << ", -1);
                        ME_STUB.reset(mo, MEXITED, x, y, -1, 0);
                        EM.performInput(ME_STUB);
                    }

                    if (nd != null && nd.isEnabled === true){
                        pkg.$mouseMoveOwner = nd;

                        //debug("mouseEntered >> ", 1);

                        ME_STUB.reset(nd, MENTERED, x, y, -1, 0);
                        EM.performInput(ME_STUB);
                    }
                }
            }
        };

        this.mousePressed = function(e) {
            var $mousePressedMask = e.button === 0 ? BM1: (e.button == 2 ? BM3 : 0);

            // !!! it is possible to have a problem with stored event object in IE
            // !!! store what we need in event-independent object
            $mousePressedEvent = {
                button  : e.button,
                clientX : e.clientX,
                clientY : e.clientY,
                pageX   : e.pageX,
                pageY   : e.pageY,
                $button : $mousePressedMask,
                $zcanvas: this
            };

            $mousePressedX = meX(e, this);
            $mousePressedY = meY(e, this);

            for(var i = this.kids.length - 1;i >= 0; i--){
                var l = this.kids[i];
                l.layerMousePressed($mousePressedX, $mousePressedY, $mousePressedMask);
                if (l.isLayerActiveAt($mousePressedX, $mousePressedY)) break;
            }

            var d = this.getComponentAt($mousePressedX, $mousePressedY);
            if (d != null && d.isEnabled === true){
                pkg.$mousePressedOwner = d;
                ME_STUB.reset(d, ME.PRESSED, $mousePressedX, $mousePressedY, $mousePressedMask, 0);
                EM.performInput(ME_STUB);
            }
        };

        this.mouseDragged = function(e){
            var x = meX(e, this), y = meY(e, this), m = $mousePressedEvent.$button;

            if (pkg.$mouseDraggOwner == null){
                var d = (pkg.$mouseMoveOwner == null) ? this.getComponentAt($mousePressedX, $mousePressedY)
                                                      : pkg.$mouseMoveOwner;
                if (d != null && d.isEnabled === true) {
                    pkg.$mouseDraggOwner = d;
                    ME_STUB.reset(d, ME.STARTDRAGGED, $mousePressedX, $mousePressedY, m, 0);
                    EM.performInput(ME_STUB);

                    if ($mousePressedX != x || $mousePressedY != y) {
                        ME_STUB.reset(d, MDRAGGED, x, y, m, 0);
                        EM.performInput(ME_STUB);
                    }
                }
            }
            else {
                ME_STUB.reset(pkg.$mouseDraggOwner, MDRAGGED, x, y, m, 0);
                EM.performInput(ME_STUB);
            }
        };

        this.getComponentAt = function(x,y){
            for(var i = this.kids.length; --i >= 0; ){
                var tl = this.kids[i];
                if (tl.isLayerActiveAt(x, y)) return EM.getEventDestination(tl.getComponentAt(x, y));
            }
            return null;
        };
    },

    function(w, h) { this.$this(this.toString(), w, h); },

    function(canvas) { this.$this(canvas, -1, -1); },

    function(canvas, w, h) {
        var pc = canvas;
        if (zebra.isString(canvas)) canvas = document.getElementById(canvas);

        if (canvas == null) {
            canvas = document.createElement("canvas");
            canvas.setAttribute("class", "zebracanvas");
            canvas.setAttribute("width",  w <= 0 ? "400px" : "" + w + "px");
            canvas.setAttribute("height", h <= 0 ? "400px" : "" + h + "px");
            canvas.setAttribute("id", pc);
            document.body.appendChild(canvas);
        }

        if (canvas.getAttribute("tabindex") === null) {
            canvas.setAttribute("tabindex", "0");
        }

        //!!!! need for native element layouting
        //canvas.style.overflow = "auto";

        this.$super(new pkg.zCanvas.Layout());

        this.da = { x:0, y:0, width:-1, height:0 };
        this.width  = parseInt(canvas.width, 10);
        this.height = parseInt(canvas.height, 10);
        this.offx = this.offy = 0;
        this.graph = createContext(canvas.getContext("2d"), this.width, this.height);

        var e = canvas;
        if (e.offsetParent) {
            do {
                this.offx += parseInt(e.offsetLeft, 10) + measure(e, 'border-left-width');
                this.offy += parseInt(e.offsetTop, 10)  + measure(e, 'border-top-width');
            } while (e = e.offsetParent);
        }
        this.offx += measure(canvas, "padding-left");
        this.offy += measure(canvas, "padding-top");

        this.canvas = canvas;
        this.doubleClickDelta = 180;

        //!!! Event manager EM variable cannot be initialized before zebra.ui initialization
        EM = pkg.events;
        for(var i=0; i < pkg.layers.length; i++) {
            var l = pkg.layers[i];
            this.add(l.$new ? l.$new() : l);
        }

        var $this = this;
        this.canvas.onmousemove   = function(e) { $this.mouseMoved(e);   };
        this.canvas.onmousedown   = function(e) { $this.mousePressed(e); };
        this.canvas.onmouseup     = function(e) { $this.mouseReleased(e);};
        this.canvas.onmouseover   = function(e) { $this.mouseEntered(e); };
        this.canvas.onmouseout    = function(e) { $this.mouseExited(e);  };
        this.canvas.onkeydown     = function(e) { $this.keyPressed(e);   };
        this.canvas.onkeyup       = function(e) { $this.keyReleased(e);  };
        this.canvas.onkeypress    = function(e) { $this.keyTyped(e);     };
        this.canvas.oncontextmenu = function(e) { e.preventDefault(); };
        this.canvas.onmove        = function(e) { setupMeF(); };
        this.canvas.onfocus       = function(e) { $this.focusGained(e); };
        this.canvas.onblur        = function(e) {  $this.focusLost(e);  };
        if (zebra.isInBrowser) window.onresize = function() { setupMeF(); };

        var addons = pkg.zCanvas.addons;
        if (addons){
            for (var i=0; i<addons.length; i++) (new (Class.forName(addons[i]))()).setup(this);
        }

        this.validate();

        //!!!
        setupMeF();
    },

    function setSize(w, h) {
        if (this.canvas.width != w || h != this.canvas.height) {
            this.graph.reset(w, h);
            this.canvas.width  = w;
            this.canvas.height = h;
            this.$super(w, h);
        }
    },

    function kidAdded(i,constr,c){
        if (typeof this[c.id] !== "undefined") throw new Error();
        this[c.id] = c;
        this.$super(i, constr, c);
    },

    function getLayer(id){ return this[id]; },

    function kidRemoved(i, c){
        delete this[c.id];
        this.$super(i, c);
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
    }

    try {
        zebra.busy();

        pkg.$objects = new zebra.util.Bag(pkg, [
            function loaded(v) {
                if (v == null || zebra.isNumber(v) || zebra.isBoolean(v)) return v;
                if (zebra.isString(v)) {
                    if (this.root && v[0] == "%" && v[1] == "r") {
                        var s = "%root%/", i = v.indexOf(s);
                        if (i === 0) return this.root.join(v.substring(s.length));
                    }
                    return v;
                }

                if (Array.isArray(v)) {
                    for (var i = 0; i < v.length; i++) v[i] = this.loaded(v[i]);
                    return v;
                }

                for (var k in v) if (v.hasOwnProperty(k)) v[k] = this.loaded(v[k]);
                return v;
            },

            function loadByUrl(url) { return this.loadByUrl(url, null); },

            function loadByUrl(url, context) {
                this.root = null;
                if (zebra.URL.isAbsolute(url) || context == null) this.root = (new zebra.URL(url)).getParentURL();
                else {
                    if (context != null) {
                        url  = new zebra.URL(context.$url.join(url));
                        this.root = url.getParentURL();
                    }
                }
                return this.load(zebra.io.GET(url.toString()), false);
            }
        ]);

        pkg.$objects.loadByUrl("canvas.json", pkg);
        var p = zebra()['canvas.json'];
        if (p) pkg.$objects.loadByUrl(p, pkg);
        while($configurators.length > 0) $configurators.shift()(pkg.$objects);
        pkg.$objects.end();
    }
    catch(e) {
        ///!!!!! for some reason throwing exception doesn't appear in console.
        //       but it has side effect to the system, what cases other exception
        //       that is not relevant to initial one
        zebra.print(e)
        throw e;
    }
    finally { zebra.ready(); }

});

})(zebra("ui"), zebra.Class, zebra.Interface);
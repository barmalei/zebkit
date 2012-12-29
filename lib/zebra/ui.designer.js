(function(pkg, Class, ui) {

var L = zebra.layout, RasterLayout = L.RasterLayout, Cursor = ui.Cursor, KeyListener = ui.KeyListener,
    MouseMotionListener = ui.MouseMotionListener, FocusListener = ui.FocusListener, MouseListener = ui.MouseListener, 
    Composite = ui.Composite, KeyEvent = ui.KeyEvent, Cursorable = ui.Cursorable, rgb = zebra.util.rgb;

pkg.ShaperBorder = Class(zebra.ui.View, Cursorable, [
    function(){
        this.borderColor = rgb.blue;
        this.gap = 7;
    },

    function paint(g,x,y,w,h,d){
        var cx = ~~((w - this.gap)/2), cy = ~~((h - this.gap)/2);
        g.setColor(this.borderColor);
        g.fillRect(x, y, this.gap, this.gap);
        g.fillRect(x + cx, y, this.gap, this.gap);
        g.fillRect(x, y + cy, this.gap, this.gap);
        g.fillRect(x + w - this.gap, y, this.gap, this.gap);
        g.fillRect(x, y + h - this.gap, this.gap, this.gap);
        g.fillRect(x + cx, y + h - this.gap, this.gap, this.gap);
        g.fillRect(x + w - this.gap, y + cy, this.gap, this.gap);
        g.fillRect(x + w - this.gap, y + h - this.gap, this.gap, this.gap);
        g.strokeRect(x + ~~(this.gap / 2), y + ~~(this.gap / 2), w - this.gap, h - this.gap);
    },

    function getCursorType(target,x,y){
        var gap = this.gap, gap2 = gap*2, w = target.width, h = target.height;
        function contains(x, y, gx, gy, ww, hh) {
            return gx <= x && (gx + ww) > x && gy <= y && (gy + hh) > y;
        }

        if(contains(x, y, gap, gap, w - gap2, h - gap2)) return Cursor.MOVE;
        if(contains(x, y, 0, 0, gap, gap)) return Cursor.NW_RESIZE;
        if(contains(x, y, 0, h - gap, gap, gap)) return Cursor.SW_RESIZE;
        if(contains(x, y, w - gap, 0, gap, gap)) return Cursor.NE_RESIZE;
        if(contains(x, y, w - gap, h - gap, gap, gap)) return Cursor.SE_RESIZE;
        var mx = ~~((w-gap)/2);
        if(contains(x, y, mx, 0, gap, gap)) return Cursor.N_RESIZE;
        if(contains(x, y, mx, h - gap, gap, gap)) return Cursor.S_RESIZE;
        var my = ~~((h-gap)/2);
        if(contains(x, y, 0, my, gap, gap)) return Cursor.W_RESIZE;
        return contains(x, y, w - gap, my, gap, gap) ? Cursor.E_RESIZE : -1 ;
    }
]);

pkg.InsetsCursorArea = Class(Cursorable, [
    function $prototype() {
        this.getCursorType = function (target,x,y){
            var areaType = this.getAreaType(target, x, y);
            return (areaType >= 0) ? this.getCursorForArea(areaType) :  -1;
        };

        this.getCursorForArea = function(t){ return this.cursors[t-1]; };

        this.getAreaType = function (c,x,y){
            var t = 0, b1 = false, b2 = false;
            if(x < this.left) t += L.LEFT;
            else
                if(x > (c.width - this.right)) t += L.RIGHT;
                else b1 = true;

            if(y < this.top) t += L.TOP;
            else
                if(y > (c.height - this.bottom)) t += L.BOTTOM;
                else b2 = true;
            return b1 && b2 ? L.CENTER : t;
        };
    },

    function (){
        this.cursors = [];
        this.top = this.right = this.left = this.bottom = 6;
        this.setCursorForArea(L.LEFT, Cursor.W_RESIZE);
        this.setCursorForArea(L.RIGHT, Cursor.E_RESIZE);
        this.setCursorForArea(L.TOP, Cursor.N_RESIZE);
        this.setCursorForArea(L.BOTTOM, Cursor.S_RESIZE);
        this.setCursorForArea(L.TLEFT, Cursor.NW_RESIZE);
        this.setCursorForArea(L.TRIGHT, Cursor.NE_RESIZE);
        this.setCursorForArea(L.BLEFT, Cursor.SW_RESIZE);
        this.setCursorForArea(L.BRIGHT, Cursor.SE_RESIZE);
        this.setCursorForArea(L.CENTER, Cursor.MOVE);
    },

    function setCursorForArea(t,c){ this.cursors[t-1] = c; }
]);

pkg.Shaper = Class(MouseMotionListener, [
    function (){ this.$this(null); },

    function (target){
        this.minHeight = this.minWidth = 12;
        this.state = null;
        this.px = this.py = 0;
        this.setTarget(target);
    },

    function setTarget(c){
        if(this.target != c){
            var prev = this.target;
            this.target = c;
            this.targetWasChanged(this.target, prev);
        }
    },

    function startDragged(e){
        if(this.target == e.source){
            this.state = this.getBoundsMask();
            if(this.state != null){
                this.px = e.absX;
                this.py = e.absY;
            }
        }
    },

    function mouseDragged(e){
        if(this.target == e.source && this.state !== null) {
            var dy = (e.absY - this.py), dx = (e.absX - this.px), t = this.target, s = this.state,
                nw = t.width  - dx * s.left + dx * s.right, nh = t.height - dy * s.top  + dy * s.bottom;
            if(nw >= this.minWidth && nh >= this.minHeight){
                this.px = e.absX;
                this.py = e.absY;
                if ((s.top + s.right + s.bottom + s.left) === 0) t.setLocation(t.x + dx, t.y + dy);
                else {
                    t.setSize(nw, nh);
                    t.setLocation(t.x + dx * s.left, t.y + dy * s.top);
                }
            }
        }
    },

    function getBoundsMask(){
        var type = ui.cursorManager.cursorType;
        if (type < 0) return null;
        var r = {};
        r.top = r.left = r.right = r.bottom = 0;
        switch(type)
        {
            case Cursor.W_RESIZE : r.left = 1;break;
            case Cursor.E_RESIZE : r.right = 1;break;
            case Cursor.N_RESIZE : r.top = 1;break;
            case Cursor.S_RESIZE : r.bottom = 1;break;
            case Cursor.NW_RESIZE: r.top = r.left  = 1; break;
            case Cursor.NE_RESIZE: r.right = r.top = 1; break;
            case Cursor.SW_RESIZE: r.left = r.bottom = 1; break;
            case Cursor.SE_RESIZE: r.bottom = r.right = 1; break;
            case Cursor.MOVE: r.top = r.left = r.right = r.bottom = 0; break;
            default: return null;
        }
        return r;
    },

    function targetWasChanged(n,o){
        if(o != null){
            ui.events.removeMouseMotionListener(null);
            ui.cursorManager.setCursorable(o, null);
        }
        if(n != null){
            ui.cursorManager.setCursorable(n, zebra.instanceOf(n, Cursorable) ? n : new pkg.InsetsCursorArea());
            ui.events.addMouseMotionListener(this);
        }
    }
]);

pkg.ShaperPan = Class(ui.Panel, Cursorable, Composite, FocusListener, KeyListener, [
    function $prototype() {
        this.getCursorType = function (t, x ,y) { return this.hasTarget ? this.shaperBr.getCursorType(t, x, y) : -1; };
    },

    function () {  this.$this(null); },

    function (t){
        this.$super(new L.BorderLayout());
        this.shaperBr = new pkg.ShaperBorder();
        this.shaper = new pkg.Shaper();
        this.hasTarget = false;
        this.colors = [ rgb.lightGray, rgb.blue ];
        this.shaperBr.borderColor = this.colors[0];
        this.setBorder(this.shaperBr);
        if (t != null) this.setTarget(t);
    },

    function setTarget(t){
        if (t != null && this.kids.length > 0) this.setTarget(null);

        var tt = (t == null) ? this.kids[0]: t,
            p  = tt.parent, tx = tt.x, ty = tt.y, tw = tt.width, th = t.height,
            right = this.getRight(), top = this.getTop(), bottom = this.getBottom(), left = this.getLeft();

        this.setEnabled(false);
        if (t == null) {
            var tx = this.x, ty = this.y;
            if (tp != null)  tp.remove(this);
            this.removeAll();
            if (tp != null) tp.add(tt);

            tt.setLocation(tx + left, ty + top);
            this.shaper.setTarget(null);
            this.hasTarget = false;
            this.setEnabled(true);
        }
        else {
            p.remove(tt);
            this.add(L.CENTER, tt);
            p.add(this);
            this.setLocation(tx - left, ty - top);
            this.setSize(tw + left + right, th + top + bottom);
            this.setEnabled(true);
            this.shaper.setTarget(this);
            this.hasTarget = true;
            ui.focusManager.requestFocus(this);
        }
    },

    function focusGained(e){
        this.shaperBr.borderColor = this.colors[1];
        this.repaint();
    },

    function focusLost(e){
        this.shaperBr.borderColor = this.colors[0];
        this.repaint();
    },

    function canHaveFocus() { return true; },

    function keyPressed(e){
        if(this.hasTarget){
            var b = (e.mask & KeyEvent.SHIFT) > 0, c = e.code,
                dx = (c == KeyEvent.VK_LEFT ? -1 : (c == KeyEvent.VK_RIGHT ? 1 : 0)),
                dy = (c == KeyEvent.VK_UP ? -1 : (c == KeyEvent.VK_DOWN ? 1 : 0)),
                w = this.width + dx, h = this.height + dy, x = this.x + dx, y = this.y + dy;

            if (b) {
                if (w > this.shaperBr.gap*2 && h > this.shaperBr.gap*2) this.setSize(w, h);
            }
            else {
                var ww = this.width, hh = this.height, p = this.parent;
                if (x + ww/2 > 0 && y + hh/2 > 0 && x < p.width - ww/2 && y < p.height - hh/2) this.setLocation(x, y);
            }
        }
    }
]);

pkg.FormTreeModel = Class(zebra.data.TreeModel, [
    function $prototype() {
        this.buildModel = function(comp, root){
            var b = this.exclude(comp), item = b ? root : this.createItem(comp);
            for(var i = 0; i < comp.kids.length; i++) {
                var r = this.buildModel(comp.kids[i], item);
                if (r) {
                    r.parent = item;
                    item.kids.push(r);
                }
            }
            return b ? null : item;
        };

        this.itemByComponent = function (c, r){
            if (r == null) r = this.root;
            if (r.comp == c) return c;
            for(var i = 0;i < r.kids.length; i++) {
                var item = this.itemByComponent(c, r.kids[i]);
                if (item != null) return item;
            }
            return null;
        };
    },

    function (target){
        this.$super(this.buildModel(target, null));
    },

    function createItem(comp){
        var name = comp.getClazz().$name;
        if (name == null) name = comp.toString();
        var index = name.lastIndexOf('.'),
            item = new zebra.data.Item(index > 0 ? name.substring(index + 1) : name);
        item.comp = comp;
        return item;
    },

    function exclude(comp){ return false; }
]);

})(zebra("ui.designer"), zebra.Class, zebra("ui"));
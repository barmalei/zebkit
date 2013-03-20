(function(pkg, Class, ui) {

var L = zebra.layout, Cursor = ui.Cursor, KeyListener = ui.KeyListener,
    MouseMotionListener = ui.MouseMotionListener, MouseListener = ui.MouseListener, 
    Composite = ui.Composite, KeyEvent = ui.KeyEvent, Cursorable = ui.Cursorable;

pkg.ShaperBorder = Class(ui.View, Cursorable, [
    function $prototype() {
        function contains(x, y, gx, gy, ww, hh) {
            return gx <= x && (gx + ww) > x && gy <= y && (gy + hh) > y;
        }

        this.paint = function(g,x,y,w,h,d){
            var cx = ~~((w - this.gap)/2), cy = ~~((h - this.gap)/2);
            g.setColor(this.color);
            g.fillRect(x, y, this.gap, this.gap);
            g.fillRect(x + cx, y, this.gap, this.gap);
            g.fillRect(x, y + cy, this.gap, this.gap);
            g.fillRect(x + w - this.gap, y, this.gap, this.gap);
            g.fillRect(x, y + h - this.gap, this.gap, this.gap);
            g.fillRect(x + cx, y + h - this.gap, this.gap, this.gap);
            g.fillRect(x + w - this.gap, y + cy, this.gap, this.gap);
            g.fillRect(x + w - this.gap, y + h - this.gap, this.gap, this.gap);
            g.strokeRect(x + ~~(this.gap / 2), y + ~~(this.gap / 2), w - this.gap, h - this.gap);
        };

        this.getCursorType = function (target,x,y){
            var gap = this.gap, gap2 = gap*2, w = target.width, h = target.height;

            if (contains(x, y, gap, gap, w - gap2, h - gap2)) return Cursor.MOVE;
            if (contains(x, y, 0, 0, gap, gap)) return Cursor.NW_RESIZE;
            if (contains(x, y, 0, h - gap, gap, gap)) return Cursor.SW_RESIZE;
            if (contains(x, y, w - gap, 0, gap, gap)) return Cursor.NE_RESIZE;
            if (contains(x, y, w - gap, h - gap, gap, gap)) return Cursor.SE_RESIZE;
            var mx = ~~((w-gap)/2);
            if (contains(x, y, mx, 0, gap, gap)) return Cursor.N_RESIZE;
            if (contains(x, y, mx, h - gap, gap, gap)) return Cursor.S_RESIZE;
            var my = ~~((h-gap)/2);
            if (contains(x, y, 0, my, gap, gap)) return Cursor.W_RESIZE;
            return contains(x, y, w - gap, my, gap, gap) ? Cursor.E_RESIZE : -1 ;
        };
    },

    function(){
        this.color = "blue";
        this.gap = 7;
    }
]);

pkg.InsetsCursorArea = Class(Cursorable, [
    function $prototype() {
        this.getCursorType = function(target,x,y) {
            var areaType = this.getAreaType(target, x, y);
            return (areaType >= 0) ? this.cursors[t] :  -1;
        };

        this.getAreaType = function (c,x,y){
            var t = 0, b1 = false, b2 = false;
            if (x < this.left) t += L.LEFT;
            else {
                if (x > (c.width - this.right)) t += L.RIGHT;
                else b1 = true;
            }
            
            if (y < this.top) t += L.TOP;
            else {
                if (y > (c.height - this.bottom)) t += L.BOTTOM;
                else b2 = true;
            }
            return b1 && b2 ? L.CENTER : t;
        };
    },

    function () {
        this.cursors = [];
        this.top = this.right = this.left = this.bottom = 6;
        this.cursors[L.LEFT]   = Cursor.W_RESIZE;
        this.cursors[L.RIGHT]  = Cursor.E_RESIZE;
        this.cursors[L.TOP]    = Cursor.N_RESIZE;
        this.cursors[L.BOTTOM] = Cursor.S_RESIZE;
        this.cursors[L.TLEFT]  = Cursor.NW_RESIZE;
        this.cursors[L.TRIGHT] = Cursor.NE_RESIZE;
        this.cursors[L.BLEFT]  = Cursor.SW_RESIZE;
        this.cursors[L.BRIGHT] = Cursor.SE_RESIZE;
        this.cursors[L.CENTER] = Cursor.MOVE;
    }
]);

pkg.ShaperPan = Class(ui.Panel, Cursorable, Composite, KeyListener, MouseMotionListener, [
    function $prototype() {
        this.getCursorType = function (t, x ,y) { 
            return this.kids.length > 0 ? this.shaperBr.getCursorType(t, x, y) : -1; 
        };

        this.canHaveFocus = function() { return true; };

        this.keyPressed = function(e) {
            if (this.kids.length > 0){
                var b = (e.mask & KeyEvent.M_SHIFT) > 0, c = e.code,
                    dx = (c == KeyEvent.LEFT ?  -1 : (c == KeyEvent.RIGHT ? 1 : 0)),
                    dy = (c == KeyEvent.UP   ?  -1 : (c == KeyEvent.DOWN  ? 1 : 0)),
                    w = this.width + dx, h = this.height + dy, x = this.x + dx, y = this.y + dy;

                if (b) {
                    if (w > this.shaperBr.gap * 2 && h > this.shaperBr.gap * 2) this.setSize(w, h);
                }
                else {
                    var ww = this.width, hh = this.height, p = this.parent;
                    if (x + ww/2 > 0 && y + hh/2 > 0 && x < p.width - ww/2 && y < p.height - hh/2) this.setLocation(x, y);
                }
            }
        };

        this.getBoundsMask = function () {
            var type = ui.cursorManager.cursorType;
            if (type < 0) {
                return null;
            }
            
            var r = {};
            r.top = r.left = r.right = r.bottom = 0;
            switch(type) {
                case Cursor.W_RESIZE  : r.left   = 1; break;
                case Cursor.E_RESIZE  : r.right  = 1; break;
                case Cursor.N_RESIZE  : r.top    = 1; break;
                case Cursor.S_RESIZE  : r.bottom = 1; break;
                case Cursor.NW_RESIZE : r.top    = r.left   = 1; break;
                case Cursor.NE_RESIZE : r.right  = r.top    = 1; break;
                case Cursor.SW_RESIZE : r.left   = r.bottom = 1; break;
                case Cursor.SE_RESIZE : r.bottom = r.right  = 1; break;
                case Cursor.MOVE      : r.top = r.left = r.right = r.bottom = 0; break;
                default               : return null;
            }
            return r;
        };

        this.startDragged = function(e){
            this.state = this.getBoundsMask();
            if (this.state != null) {
                this.px = e.absX;
                this.py = e.absY;
            }
        };

        this.mouseDragged = function(e){
            if (this.state !== null) {
                var dy = (e.absY - this.py), dx = (e.absX - this.px), s = this.state,
                    nw = this.width  - dx * s.left + dx * s.right,
                    nh = this.height - dy * s.top  + dy * s.bottom;
                
                if (nw >= this.minWidth && nh >= this.minHeight) {
                    this.px = e.absX;
                    this.py = e.absY;
                    if ((s.top + s.right + s.bottom + s.left) === 0) {
                        this.setLocation(this.x + dx, this.y + dy);
                    }
                    else {
                        this.setSize(nw, nh);
                        this.setLocation(this.x + dx * s.left, this.y + dy * s.top);
                    }
                }
            }
        };
    },

    function () {  this.$this(null); },

    function (t){
        this.$super(new L.BorderLayout());
        this.minHeight = this.minWidth = 12;
        this.state = null;
        this.px = this.py = 0;
        this.shaperBr = new pkg.ShaperBorder();
        this.colors   = [ "lightGray", "blue" ];
        this.shaperBr.color = this.colors[0];
        this.setBorder(this.shaperBr);
        if (t != null) this.add(t);
    },

    function insert(i, constr, d) {
        if (this.kids.length > 0) {
            this.removeAll();
        }

        var top = this.getTop(), left = this.getLeft();
        if (d.width == 0 || d.height == 0) d.toPreferredSize();
        this.setLocation(d.x - left, d.y - top);
        this.setSize(d.width + left + this.getRight(), d.height + top + this.getBottom());
        this.$super(i, L.CENTER, d);
    },

    function setColor(b, color) {
        this.colors[b?1:0] = color;
        this.shaperBr.color = this.colors[this.hasFocus()? 1 : 0];
        this.repaint();
    },

    function focused(){
        this.$super();
        this.shaperBr.color = this.colors[this.hasFocus()? 1 : 0];
        this.repaint();
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
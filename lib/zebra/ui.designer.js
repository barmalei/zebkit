(function(pkg, Class, ui) {

/**
 * The package contains number of UI components that can be helful to 
 * make visiual control of an UI component size and location
 * @module  ui.designer
 * @main 
 */

var L = zebra.layout, Cursor = ui.Cursor, KeyEvent = ui.KeyEvent, CURSORS = [];

CURSORS[L.LEFT  ] = Cursor.W_RESIZE;
CURSORS[L.RIGHT ] = Cursor.E_RESIZE;
CURSORS[L.TOP   ] = Cursor.N_RESIZE;
CURSORS[L.BOTTOM] = Cursor.S_RESIZE;
CURSORS[L.TLEFT ] = Cursor.NW_RESIZE;
CURSORS[L.TRIGHT] = Cursor.NE_RESIZE;
CURSORS[L.BLEFT ] = Cursor.SW_RESIZE;
CURSORS[L.BRIGHT] = Cursor.SE_RESIZE;
CURSORS[L.CENTER] = Cursor.MOVE;
CURSORS[L.NONE  ] = Cursor.DEFAULT;

pkg.ShaperBorder = Class(ui.View, [
    function $prototype() {
        this.color = "blue";
        this.gap = 7;

        function contains(x, y, gx, gy, ww, hh) {
            return gx <= x && (gx + ww) > x && gy <= y && (gy + hh) > y;
        }

        this.paint = function(g,x,y,w,h,d){
            var cx = ~~((w - this.gap)/2), cy = ~~((h - this.gap)/2);
            g.setColor(this.color);
            g.beginPath();
            g.rect(x, y, this.gap, this.gap);
            g.rect(x + cx, y, this.gap, this.gap);
            g.rect(x, y + cy, this.gap, this.gap);
            g.rect(x + w - this.gap, y, this.gap, this.gap);
            g.rect(x, y + h - this.gap, this.gap, this.gap);
            g.rect(x + cx, y + h - this.gap, this.gap, this.gap);
            g.rect(x + w - this.gap, y + cy, this.gap, this.gap);
            g.rect(x + w - this.gap, y + h - this.gap, this.gap, this.gap);
            g.fill();
            g.beginPath();
            g.rect(x + ~~(this.gap / 2), y + ~~(this.gap / 2), w - this.gap, h - this.gap);
            g.stroke();
        };

        this.detectAt = function(target,x,y){
            var gap = this.gap, gap2 = gap*2, w = target.width, h = target.height;

            if (contains(x, y, gap, gap, w - gap2, h - gap2)) return L.CENTER;
            if (contains(x, y, 0, 0, gap, gap))               return L.TLEFT;
            if (contains(x, y, 0, h - gap, gap, gap))         return L.BLEFT;
            if (contains(x, y, w - gap, 0, gap, gap))         return L.TRIGHT;
            if (contains(x, y, w - gap, h - gap, gap, gap))   return L.BRIGHT;

            var mx = ~~((w-gap)/2);
            if (contains(x, y, mx, 0, gap, gap))        return L.TOP;
            if (contains(x, y, mx, h - gap, gap, gap))  return L.BOTTOM;

            var my = ~~((h-gap)/2);
            if (contains(x, y, 0, my, gap, gap)) return L.LEFT;
            return contains(x, y, w - gap, my, gap, gap) ? L.RIGHT : L.NONE;
        };
    }
]);

pkg.InsetsArea = Class([
    function $prototype() {
        this.top = this.right = this.left = this.bottom = 6;

        this.detectAt = function (c,x,y){
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
    }
]);

/**
 * This is UI component class that implements possibility to embeds another
 * UI components to control the component size and location visually.
 
        // create canvas 
        var canvas = new zebra.ui.zCanvas(300,300);

        // create two UI components
        var lab = new zebra.ui.Label("Label");
        var but = new zebra.ui.Button("Button");

        // add created before label component as target of the shaper
        // component and than add the shaper component into root panel 
        canvas.root.add(new zebra.ui.designer.ShaperPan(lab).properties({
            bounds: [ 30,30,100,40]
        }));

        // add created before button component as target of the shaper
        // component and than add the shaper component into root panel 
        canvas.root.add(new zebra.ui.designer.ShaperPan(but).properties({
            bounds: [ 130,130,100,50]
        }));

 * @class  zebra.ui.designer.ShaperPan
 * @constructor
 * @uses zebra.ui.Composite
 * @extends {zebra.ui.Panel}
 * @param {zebra.ui.Panel} target a target UI component whose size and location
 * has to be controlled
 */
pkg.ShaperPan = Class(ui.Panel, ui.Composite, [
    function $prototype() {
       /**
        * Indicates if controlled component can be moved
        * @attribute isMoveEnabled
        * @type {Boolean}
        * @default true
        */

       /**
        * Indicates if controlled component can be sized
        * @attribute isResizeEnabled
        * @type {Boolean}
        * @default true
        */

        /**
         * Minimal possible height or controlled component 
         * @attribute minHeight
         * @type {Integer}
         * @default 12
         */

        /**
         * Minimal possible width or controlled component 
         * @attribute minWidth
         * @type {Integer}
         * @default 12
         */
        this.minHeight = this.minWidth = 12;
        this.canHaveFocus = this.isResizeEnabled = this.isMoveEnabled = true;
        this.state = null;

        this.getCursorType = function (t, x ,y) {
            return this.kids.length > 0 ? CURSORS[this.shaperBr.detectAt(t, x, y)] : null;
        };

        /**
         * Define key pressed events handler
         * @param  {zebra.ui.KeyEvent} e a key event
         * @method keyPressed
         */
        this.keyPressed = function(e) {
            if (this.kids.length > 0){
                var b = (e.mask & KeyEvent.M_SHIFT) > 0, c = e.code,
                    dx = (c == KeyEvent.LEFT ?  -1 : (c == KeyEvent.RIGHT ? 1 : 0)),
                    dy = (c == KeyEvent.UP   ?  -1 : (c == KeyEvent.DOWN  ? 1 : 0)),
                    w = this.width + dx, h = this.height + dy,
                    x = this.x + dx, y = this.y + dy;

                if (b) {
                    if (this.isResizeEnabled && w > this.shaperBr.gap * 2 && h > this.shaperBr.gap * 2) {
                        this.setSize(w, h);
                    }
                }
                else {
                    if (this.isMoveEnabled) {
                        var ww = this.width, hh = this.height, p = this.parent;
                        if (x + ww/2 > 0 && y + hh/2 > 0 && x < p.width - ww/2 && y < p.height - hh/2) this.setLocation(x, y);
                    }
                }
            }
        };

        /**
         * Define mouse drag started events handler
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseDragStarted
         */
        this.mouseDragStarted = function(e){
            this.state = null;
            if (this.isResizeEnabled || this.isMoveEnabled) {
                var t = this.shaperBr.detectAt(this, e.x, e.y);
                if ((this.isMoveEnabled   === false && t == L.CENTER)||
                    (this.isResizeEnabled === false && t != L.CENTER)  )
                {
                    return;
                }

                this.state = { top    : ((t & L.TOP   ) > 0 ? 1 : 0),
                               left   : ((t & L.LEFT  ) > 0 ? 1 : 0),
                               right  : ((t & L.RIGHT ) > 0 ? 1 : 0),
                               bottom : ((t & L.BOTTOM) > 0 ? 1 : 0) };

                if (this.state != null) {
                    this.px = e.absX;
                    this.py = e.absY;
                }
            }
        };

        /**
         * Define mouse dragged events handler
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseDragged
         */
        this.mouseDragged = function(e){
            if (this.state != null) {
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

        this.setColor = function (b, color) {
            this.colors[b?1:0] = color;
            this.shaperBr.color = this.colors[this.hasFocus()? 1 : 0];
            this.repaint();
        };
    },

    function (t){
        this.$super(new L.BorderLayout());
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
        if (d.width === 0 || d.height === 0) d.toPreferredSize();
        this.setLocation(d.x - left, d.y - top);
        this.setSize(d.width + left + this.getRight(), d.height + top + this.getBottom());
        this.$super(i, L.CENTER, d);
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
            var b = this.exclude && this.exclude(comp), item = b ? root : this.createItem(comp);
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

        this.createItem = function(comp){
            var name = comp.$clazz.$name;
            if (name == null) name = comp.toString();
            var index = name.lastIndexOf('.'),
                item = new zebra.data.Item(index > 0 ? name.substring(index + 1) : name);
            item.comp = comp;
            return item;
        };
    },

    function (target){
        this.$super(this.buildModel(target, null));
    }
]);

/**
 * @for
 */


})(zebra("ui.designer"), zebra.Class, zebra("ui"));
(function(pkg, Class, ui) {

var RasterLayout = zebra.layout.RasterLayout, L = zebra.layout
    Cursor = ui.Cursor, Panel = zebra.ui.Panel,KeyListener = zebra.ui.KeyListener,
    MouseMotionListener = zebra.ui.MouseMotionListener, FocusListener = zebra.ui.FocusListener,
    MouseListener = zebra.ui.MouseListener, ChildrenListener = zebra.ui.ChildrenListener,
    ComponentListener = zebra.ui.ComponentListener, ContainerListener = zebra.ui.ContainerListener,
    Composite = zebra.ui.Composite, KeyEvent = zebra.ui.KeyEvent, Cursorable = zebra.ui.Cursorable, rgb = zebra.util.rgb;

pkg.DgnComponent = zebra.Interface();

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

pkg.ShaperPan = Class(Panel, Cursorable, Composite, FocusListener, KeyListener, [
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

        var tt = (t == null) ? this.get(0): t,
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

    function getCursorType(t, x ,y) { return this.hasTarget ? this.shaperBr.getCursorType(t, x, y) : -1; },
    function canHaveFocus() { return true; },

    function keyPressed(e){
        if(this.hasTarget){
            var b = (e.mask & KeyEvent.SHIFT) > 0, c = e.code;
            var dx = (c == KeyEvent.VK_LEFT ? -1 : (c == KeyEvent.VK_RIGHT ? 1 : 0));
            var dy = (c == KeyEvent.VK_UP ? -1 : (c == KeyEvent.VK_DOWN ? 1 : 0));
            var w = this.width + dx, h = this.height + dy, x = this.x + dx, y = this.y + dy;

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

pkg.DesignPan = Class(Panel, Composite, MouseListener,
                      KeyListener, ChildrenListener, FocusListener, [

    function $clazz() {
        this.COMPONENT_SELECTED = 1;
        this.COMPONENT_MOVED = 2;
        this.COMPONENT_SIZED = 3;
    },

    function $prototype() {
        this.childCompEvent = function(id,c){
            if(!this.freezeCEvHVal){
                if(this.selected != null){
                    if(id == ComponentListener.COMP_MOVED || id == ComponentListener.COMP_SIZED || (id == ComponentListener.COMP_SHOWN && c.isVisible)){
                        this.calcMetric();
                    }
                    else {
                        if(c == this.selectedComp && id == ComponentListener.COMP_SHOWN && !c.isVisible){
                            this.select(null);
                        }
                    }
                }
            }
        };
    },

    function () {
        this.selected = null;
        this.canBeMoved = this.freezeCEvHVal = this.canBeResized = false;
        this.$super(new RasterLayout());
        this.shaper = new pkg.ShaperPan();
        this.colors = [ rgb.black, rgb.gray ];
    },

    function select(c){
        if(this.selected != c){
            this.shaper.setTarget(c);
            this.selected = c;
        }
    },

    function focusGained(e){
//            if (this.selected != null) this.repaint(this.brX, this.brY, this.brW, this.brH);
    },

    function focusLost(e){
//          if(this.selected != null) this.repaint(this.brX, this.brY, this.brW, this.brH);
    },

    function setRectColor(hasFocus,c){
        var i = this.hasFocus() ? 0 : 1;
        if( !this.colors[i].equals(c)){
            this.colors[i] = c;
//            if(this.selectedComp != null) this.repaint(this.brX, this.brY, this.brW, this.brH);
        }
    },


    function childContEvent(id,p,constr,c){
        if (!this.freezeCEvHVal){
            switch(id)
            {
                case ContainerListener.COMP_REMOVED: if(c == this.selected) this.setSelectedComponent(null);break;
                case ContainerListener.LAYOUT_SET:
                    try{
                        this.freezeCEvH();
                    }
                    finally {
                        this.freezeCEvH();
                    }
                    break;
            }
        }
    },

    function paintOnTop(g){
        if(this.selectedComp != null){
            g.setColor(this.colors[this.hasFocus()?0:1]);
            if(this.selectedComp != this) this.borderView.paint(g, this.brX, this.brY, this.brW, this.brH, this);
            else {
                var right = this.getRight(), top = this.getTop(), bottom = this.getBottom(), left = this.getLeft(),
                    ew = width - left - right, eh = height - top - bottom;
                g.strokeRect(left, top, ew - 1, eh - 1);
                g.strokeRect(left + 1, top + 1, ew - 3, eh - 3);
            }
        }
    },

    function mousePressed(e){
        if(e.isActionMask()){
            var xx = e.x, yy = e.y, b = this.contains(xx, yy, 0);
            if (!b || this.hasFocus()) {
                b = (this.selected != this && b);
                var c = this.getComponentAt(xx, yy);
                if (!b || (c != this.selected && L.isAncestorOf(this.selected, c))){
                    this.select(c);
                }
            }
        }
    },

    function canHaveFocus(){ return true; },

    function contains(x,y,gap){
        return this.selectedComp != null && x >= this.brX + gap && x < this.brX + this.brW - gap &&
               y >= this.brY + gap && y < this.brY + this.brH - gap;
    },

    // private class methods
    //!!!!this.Private()
    function moveComponent(){
        try{
            this.freezeCEvH();
            var prevParent = this.selectedComp.parent;
            if(prevParent != null){
                var isVisible = this.selectedComp.isVisible;
                this.selectedComp.setVisible(false);
                var newParent = this.getComponentAt(this.absX, this.absY);
                newParent = (newParent == null) ? this : newParent.parent;
                this.selectedComp.setVisible(isVisible);
                var p = [this.absX, this.absY];
                if (newParent != this) p = L.getRelLocation(this.absX, this.absY, newParent, this);
                if(prevParent != newParent){
                    var constraints = null, newParentLI = null;  //!!!Editors.getLayoutHelper(newParent.layout);
                    if(newParentLI != null){
                        if(newParentLI.canBeAdded(newParent, newParent.layout, this.selectedComp)){
                            constraints = newParentLI.getDefaultConstraints(newParent, newParent.layout);
                        }
                        else return ;
                    }
                    prevParent.remove(this.selectedComp);
                    newParent.add(constraints, this.selectedComp);
                }
                this.selectedComp.setLocation(p[0], p[1]);
                newParent.validate();
                this.calcMetric();
                if(prevParent != newParent) this.updateLayoutHelper();
                this.support.perform(this, pkg.DesignPan.COMPONENT_MOVED, this.selectedComp);
            }
        }
        finally{
            this.freezeCEvH();
        }
    },

    function resizeComponent(){
        var p = L.getRelLocation(this.absX, this.absY, this.selectedComp.parent, this),
            px = this.selectedComp.x, py = this.selectedComp.y, pw = this.selectedComp.width, ph = this.selectedComp.height;
        this.selectedComp.setLocation(p[0], p[1]);
        this.selectedComp.setSize(this.absW, this.absH);
        this.selectedComp.invalidate();
        this.validate();
        this.calcMetric();
        if(px != p[0] || py != p[1]) this.support.perform(this, pkg.DesignPan.COMPONENT_MOVED, this.selectedComp);
        if(pw != this.absW || ph != this.absH) this.support.perform(this, pkg.DesignPan.COMPONENT_SIZED, this.selectedComp);
    },

    function freezeCEvH(){ this.freezeCEvHVal =  this.freezeCEvHVal ^ true; },

    function calcMetric()
    {
          if (this.selectedComp != null)
          {
                var pbrX = brX, pbrY = brY, pbrW = brW, pbrH = brH, p = L.getAbsLocation(this.selectedComp);
                p = L.getRelLocation(p[0], p[1], this);
                this.locX = p[0];
                this.locY = p[1];
                this.brX  = this.locX - this.gap;
                this.brY  = this.locY - this.gap;
                brW  = this.selectedComp.getWidth () + 2*this.gap;
                brH  = this.selectedComp.getHeight() + 2*this.gap;
                if (this.brW > 0)
                {
                  var xx = Math.min(this.brX, pbrX), yy = Math.min(this.brY, pbrY);
                  this.repaint (xx, yy,
                           Math.max(this.brX + this.brW, pbrX + pbrW) - xx,
                           Math.max(this.brY + this.brH, pbrY + pbrH) - yy);
                }
                else this.repaint (this.brX, this.brY, this.brW, this.brH);
          }
          else {
                if (this.brW > 0) this.repaint (this.brX, this.brY, this.brW, this.brH);
                this.brW = 0;
          }
    }
]);

})(zebra("ui.editors"), zebra.Class, zebra("ui"));
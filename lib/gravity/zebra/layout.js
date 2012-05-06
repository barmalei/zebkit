(function(pkg, Class) {
    
var Dimension = JAVA.awt.Dimension, Point = JAVA.awt.Point;

pkg.Layout = new zebra.Interface(); 
var L = pkg.Layout;
pkg.HORIZONTAL = 1;
pkg.VERTICAL = 2;
pkg.NONE = 0;
pkg.LEFT   = 1;
pkg.RIGHT = 2;
pkg.TOP = 4;
pkg.BOTTOM = 8;
pkg.CENTER = 16;
pkg.HOR_STRETCH = 32;
pkg.VER_STRETCH = 64;
pkg.USE_PS_SIZE = 4;
pkg.STRETCH = -1;

pkg.getDirectChild = function(parent,child){
    for(; child != null && child.parent != parent; child = child.parent) {}
    return child;
}

pkg.getDirectAt = function(x,y,p){
    for(var i = 0;i < p.kids.length; i++){
        var c = p.kids[i];
        if(c.isVisible && c.x <= x && c.y <= y && c.x + c.width > x && c.y + c.height > y) return i;
    }
    return -1;
}

pkg.getTop = function(c){
    for(; c != null && c.parent != null; c = c.parent);
    return c;
}

pkg.getAbsLocation = function(x,y,c){
    while(c.parent != null){
        x += c.x;
        y += c.y;
        c = c.parent;
    }
    return new Point(x, y);
}

pkg.getRelLocation = function(x, y, p, c, d){
    while(c != p){
        x -= c.x;
        y -= c.y;
        c = c.parent;
    }
    d.x = x;
    d.y = y;
}

pkg.getXLoc = function(aow,alignX,aw){
    if(alignX == pkg.RIGHT)  return aw - aow;
    if(alignX == pkg.CENTER) return  Math.floor((aw - aow) / 2);
    if(alignX == pkg.LEFT || alignX == pkg.NONE) return 0;
    throw new Error();
}

pkg.getYLoc = function(aoh,alignY,ah){
    if(alignY == pkg.BOTTOM) return ah - aoh;
    if(alignY == pkg.CENTER) return Math.floor((ah - aoh) / 2);
    if(alignY == pkg.TOP || alignY == pkg.NONE) return 0;
    throw new Error();
}

pkg.getMaxPreferredSize = function(target){
    var maxWidth = 0, maxHeight = 0;
    for(var i = 0;i < target.kids.length; i++){
        var l = target.kids[i];
        if(l.isVisible){
            var ps = l.getPreferredSize();
            if(ps.width > maxWidth) maxWidth = ps.width;
            if(ps.height > maxHeight) maxHeight = ps.height;
        }
    }
    return new Dimension(maxWidth, maxHeight);
}

pkg.isAncestorOf  = function(p,c){
    for(; c != null && c != p; c = c.parent);
    return c != null;
}

pkg.Layoutable = Class(L, [
    function() { 
        this.x = this.y = this.height = this.width = this.cachedHeight= 0;
        this.psWidth = this.psHeight = this.cachedWidth = -1;
        this.isLayoutValid = this.isValid = false;
        this.constraints = this.parent = null;
        this.kids = [];
        this.layout = this.getDefaultLayout(); 
        this.isVisible = true;
    },
    
    function setX(x){ this.setLocation(x, this.y); },
    function setY(y){ this.setLocation(this.x, y); },
    function setWidth(w){ this.setSize(w, this.height); },
    function setHeight(h){ this.setSize(this.width, h);},
    
    function getByConstraints(c){ 
        if(this.kids.length > 0){
            for(var i = 0;i < this.kids.length; i++ ){
                var l = this.kids[i], lc = l.constraints;
                if (c == lc || (c != null && c.equals && c.equals(lc))) return l;
            }
        }
        return null;
    },

    function get(i){  
        if (i < 0 || i >= this.kids.length) throw new Error();
        return this.kids[i]; 
    },
    
    function count(){ return this.kids.length },
    function add(constr,d){ this.insert(this.kids.length, constr, d); },
    
    function insert(i,constr,d){
        d.setParent(this);
        d.constraints = constr;
        this.kids.splice(i, 0, d);
        this.kidAdded(i, constr, d);
        this.invalidate();
    },

    function indexOf(c){ return this.kids.indexOf(c); },
    function remove(c){ this.removeAt(this.kids.indexOf(c)); },

    function removeAt(i){
        var obj = this.kids[i];
        obj.setParent(null);
        this.kids.splice(i, 1);
        this.kidRemoved(i, obj);
        this.invalidate();
    },

    function setLayout(m){
        if(!m) throw new Error(); 
        
        if(this.layout != m){
            var pl = this.layout;
            this.layout = m;
            this.invalidate();
            this.layoutSet(pl);
        }
    },

    function setPSSize(w,h){
        if(w != this.psWidth || h != this.psHeight){
            this.psWidth = w;
            this.psHeight = h;
            this.invalidate();
        }
    },

    function invalidate(){
        this.isValid = this.isLayoutValid = false;
        this.cachedWidth =  -1;
        if(this.parent != null) this.parent.invalidate();
    },

    function validate(){
        this.validateMetric();
        if(this.width > 0 && this.height > 0 && !this.isLayoutValid && this.isVisible) {
            this.layout.doLayout(this);
            for(var i = 0;i < this.kids.length; i++) this.kids[i].validate();
            this.isLayoutValid = true;
            this.laidout();
        }
    },

    function setLocation(xx,yy){
        if(xx != this.x || this.y != yy){
            var px = this.x, py = this.y;
            this.x = xx;
            this.y = yy;
            this.relocated(px, py);
        }
    },

    function setSize(w,h){
        if(w != this.width || h != this.height){
            var pw = this.width, ph = this.height;
            this.width = w;
            this.height = h;
            this.isLayoutValid = false;
            this.resized(pw, ph);
        }
    },

    function getPreferredSize(){
        this.validateMetric();
        if(this.cachedWidth < 0){
            var ps = (this.psWidth < 0 || this.psHeight < 0) ? this.layout.calcPreferredSize(this) : new Dimension(0,0);
            if(this.psWidth >= 0) ps.width = this.psWidth;
            else                  ps.width += this.getLeft() + this.getRight();
            if(this.psHeight >= 0) ps.height = this.psHeight;
            else                   ps.height += (this.getTop() + this.getBottom());
            this.cachedWidth  = ps.width;
            this.cachedHeight = ps.height;
            return ps;
        }
        return new Dimension(this.cachedWidth, this.cachedHeight);
    },

    function getTop() { return 0; },
    function getLeft(){ return 0; },
    function getBottom(){ return 0; },
    function getRight(){ return 0; },

    function validateMetric(){
        if( !this.isValid){
            this.recalc();
            this.isValid = true;
        }
    },

    function invalidateLayout(){
        this.isLayoutValid = false;
        if(this.parent != null) this.parent.invalidateLayout();
    },

    function laidout(){},
    function resized(pw,ph){},
    function relocated(px,py){},
    function kidAdded(index,constr,l){},
    function kidRemoved(index,l){},
    function layoutSet(old){},
    function recalc(){},
    function getDefaultLayout() { return this; },

    function setParent(o){
        if(o != this.parent){
            this.parent = o;
            this.invalidate();
        }
    },

    function calcPreferredSize(target){ return new Dimension(0, 0); },
    function doLayout(target){}
]);

pkg.BorderLayout = Class(L, [
    function() { this.$this(0, 0); },

    function (hgap,vgap){
        this.hgap = hgap;
        this.vgap = vgap;
    },

    function calcPreferredSize(target){
        var center = null, west = null,  east = null, north = null, south = null;
        for(var i = 0; i < target.kids.length; i++){
            var l = target.kids[i];
            if(l.isVisible){
                switch(l.constraints) {
                   case pkg.CENTER: center= l;break;
                   case pkg.TOP : north = l;break;
                   case pkg.BOTTOM : south = l;break;
                   case pkg.LEFT  : west  = l;break;
                   case pkg.RIGHT  : east  = l;break;
                }
            }
        }
        var dim = new Dimension(0,0);
        if(east != null){
            var d = east.getPreferredSize();
            dim.width += d.width + this.hgap;
            dim.height = Math.max(d.height, dim.height);
        }
        if(west != null){
            var d = west.getPreferredSize();
            dim.width += d.width + this.hgap;
            dim.height = Math.max(d.height, dim.height);
        }
        if(center != null){
            var d = center.getPreferredSize();
            dim.width += d.width;
            dim.height = Math.max(d.height, dim.height);
        }
        if(north != null){
            var d = north.getPreferredSize();
            dim.width = Math.max(d.width, dim.width);
            dim.height += d.height + this.vgap;
        }
        if(south != null){
            var d = south.getPreferredSize();
            dim.width = Math.max(d.width, dim.width);
            dim.height += d.height + this.vgap;
        }
        return dim;
    },

    function doLayout(t){
        var top = t.getTop(), bottom = t.height - t.getBottom();
        var left = t.getLeft(), right = t.width - t.getRight();
        var center = null, west = null,  east = null;
        for(var i = 0;i < t.kids.length; i++){
            var l = t.kids[i];
            if(l.isVisible) {
                switch(l.constraints) {
                    case pkg.CENTER: center = l; break;
                    case pkg.TOP : {
                        var ps = l.getPreferredSize();
                        l.setLocation(left, top);
                        l.setSize(right - left, ps.height);
                        top += ps.height + this.vgap;
                    } break;
                    case pkg.BOTTOM:{
                        var ps = l.getPreferredSize();
                        l.setLocation(left, bottom - ps.height);
                        l.setSize(right - left, ps.height);
                        bottom -= ps.height + this.vgap;
                    } break;
                    case pkg.LEFT: west = l; break;
                    case pkg.RIGHT: east = l; break;
                    default: throw new Error();
                }
            }
        }
        if(east != null){
            var d = east.getPreferredSize();
            east.setLocation(right - d.width, top);
            east.setSize(d.width, bottom - top);
            right -= d.width + this.hgap;
        }
        
        if(west != null){
            var d = west.getPreferredSize();
            west.setLocation(left, top);
            west.setSize(d.width, bottom - top);
            left += d.width + this.hgap;
        }
        if(center != null){
            center.setLocation(left, top);
            center.setSize(right - left, bottom - top);
        }
    }
]);

pkg.RasterLayout = Class(L, [
    function () { this.$this(0); },
    function (f){ this.flag = f; },

    function calcPreferredSize(c){
        var m = new Dimension(0,0), b = (this.flag & pkg.USE_PS_SIZE) > 0;
        for(var i = 0;i < c.kids.length; i++ ){
            var el = c.kids[i];
            if(el.isVisible){
                var ps = b ? el.getPreferredSize() : new Dimension(el.width, el.height);
                var px = el.x + ps.width, py = el.y + ps.height;
                if(px > m.width) m.width = px;
                if(py > m.height) m.height = py;
            }
        }
        return m;
    },

    function doLayout(c){
        var r = c.width - c.getRight(), b = c.height - c.getBottom();
        var usePsSize = (this.flag & pkg.USE_PS_SIZE) > 0;
        for(var i = 0;i < c.kids.length; i++ ){
            var el = c.kids[i];
            if(el.isVisible){
                var ww = 0, hh = 0;
                if(usePsSize){
                    var ps = el.getPreferredSize();
                    ww = ps.width;
                    hh = ps.height;
                }
                else{
                    ww = el.width;
                    hh = el.height;
                }
                if ((this.flag & pkg.HOR_STRETCH) > 0) ww = r - el.x;
                if ((this.flag & pkg.VER_STRETCH) > 0) hh = b - el.y;
                el.setSize(ww, hh);
            }
        }
    }
]);

pkg.FlowLayout = Class(L, [
    function (){ this.$this(pkg.LEFT, pkg.TOP, pkg.HORIZONTAL); },
    function (ax,ay){ this.$this(ax, ay, pkg.HORIZONTAL); },
    function (ax,ay,dir){ this.$this(ax, ay, dir, 0); },

    function (gap){
        this.$this();
        this.gap = gap;
    },

    function (ax,ay,dir,g){
        if(dir != pkg.HORIZONTAL && dir != pkg.VERTICAL) throw new Error();
        this.ax = ax;
        this.ay = ay;
        this.direction = dir;
        this.gap = g;
    },

    function calcPreferredSize(c){
        var m = new Dimension(0, 0), cc = 0;
        for(var i = 0;i < c.kids.length; i++){
            var a = c.kids[i];
            if(a.isVisible){
                var d = a.getPreferredSize();
                if(this.direction == pkg.HORIZONTAL){
                    m.width += d.width;
                    m.height = Math.max(d.height, m.height);
                }
                else{
                    m.width = Math.max(d.width, m.width);
                    m.height += d.height;
                }
                cc++;
            }
        }
        var add = this.gap * (cc - 1);
        if(this.direction == pkg.HORIZONTAL) m.width += add;
        else m.height += add;
        return m;
    },

    function doLayout(c){
        var psSize = this.calcPreferredSize(c), t = c.getTop(), l = c.getLeft(), lastOne = null;
        var px = pkg.getXLoc(psSize.width,  this.ax, c.width  - l - c.getRight()) + l;
        var py = pkg.getYLoc(psSize.height, this.ay, c.height - t - c.getBottom()) + t;
        for(var i = 0;i < c.kids.length; i++){
            var a = c.kids[i];
            if(a.isVisible){
                var d = a.getPreferredSize();
                if(this.direction == pkg.HORIZONTAL){
                    a.setLocation(px, Math.floor((psSize.height - d.height) / 2) + py);
                    px += (d.width + this.gap);
                }
                else{
                    a.setLocation(px + Math.floor((psSize.width - d.width) / 2), py);
                    py += d.height + this.gap;
                }
                a.setSize(d.width, d.height);
                lastOne = a;
            }
        }
        if(lastOne != null && pkg.STRETCH == lastOne.constraints){
            if(this.direction == pkg.HORIZONTAL) lastOne.setSize(c.width - lastOne.x - c.getRight(), lastOne.height);
            else lastOne.setSize(lastOne.width, c.height - lastOne.y - c.getBottom());
        }
    }
]);

pkg.ListLayout = Class(L, [
    function (){ this.$this(0); },
    function (gap){ this.$this( -1, gap); },

    function (ax,gap){
        if(ax !=  -1 && ax != pkg.LEFT && ax != pkg.RIGHT && ax != pkg.CENTER) throw new Error();
        this.ax = ax;
        this.gap = gap;
    },

    function calcPreferredSize(lw){
        var w = 0, h = 0;
        for(var i = 0;i < lw.kids.length; i++){
            var cc = lw.kids[i];
            if(cc.isVisible){
                var d = cc.getPreferredSize();
                h += (d.height + this.gap);
                if(w < d.width) w = d.width;
            }
        }
        return new Dimension(w, h);
    },

    function doLayout(lw){
        var x = lw.getLeft(), y = lw.getTop(), psw = lw.width - x - lw.getRight();
        for(var i = 0;i < lw.kids.length; i++){
            var cc = lw.kids[i];
            if(cc.isVisible){
                var d = cc.getPreferredSize();
                cc.setSize((this.ax ==  -1) ? psw : d.width, d.height);
                cc.setLocation((this.ax ==  -1) ? x : x + pkg.getXLoc(cc.width, this.ax, psw), y);
                y += (d.height + this.gap);
            }
        }
    }
]);

pkg.PercentLayout = Class(L, [
    function (){ this.$this(pkg.HORIZONTAL, 2); },

    function (dir, gap){
        if(dir != pkg.HORIZONTAL && dir != pkg.VERTICAL) throw new Error("4005");
        this.dir = dir;
        this.gap = gap;
    },

    function doLayout(target){
        var right = target.getRight(), top = target.getTop(), bottom = target.getBottom(), left = target.getLeft();
        var size = target.kids.length, rs = -this.gap * (size == 0 ? 0 : size - 1), loc = 0, ns = 0;
        if(this.dir == pkg.HORIZONTAL){
            rs += target.width - left - right;
            loc = left;
        }
        else{
            rs += target.height - top - bottom;
            loc = top;
        }
        
        for(var i = 0;i < size; i++){
            var l = target.kids[i];
            if(l.constraints == pkg.USE_PS_SIZE){
                var ps = l.getPreferredSize();
                if(this.dir == pkg.HORIZONTAL){
                    rs -= ps.width;
                    l.setSize(ps.width, target.height - top - bottom);
                }
                else{
                    rs -= ps.height;
                    l.setSize(target.width - left - right, ps.height);
                }
            }
        }
        for(var i = 0;i < size; i ++ ){
            var l = target.kids[i], c = l.constraints;
            if(c == pkg.USE_PS_SIZE){
                if(this.dir == pkg.HORIZONTAL){
                    l.setLocation(loc, top);
                    ns = l.width;
                }
                else{
                    l.setLocation(left, loc);
                    ns = l.height;
                }
            }
            else {
                if(this.dir == pkg.HORIZONTAL){
                    ns = ((size - 1) == i) ? target.width - right - loc : Math.floor((rs * c) / 100);
                    l.setLocation(loc, top);
                    l.setSize(ns, target.height - top - bottom);
                }
                else{
                    ns = ((size - 1) == i) ? target.height - bottom - loc : Math.floor((rs * c) / 100);
                    l.setLocation(left, loc);
                    l.setSize(target.width - left - right, ns);
                }
            }
            loc += (ns + this.gap);
        }
    },

    function calcPreferredSize(target){
        var max = 0, size = target.kids.length, as = this.gap * (size == 0 ? 0 : size - 1);
        for(var i = 0;i < size; i++){
            var d = target.kids[i].getPreferredSize();
            if(this.dir == pkg.HORIZONTAL){
                if(d.height > max) max = d.height;
                as += d.width;
            }
            else {
                if(d.width > max) max = d.width;
                as += d.height;
            }
        }
        return (this.dir == pkg.HORIZONTAL) ? new Dimension(as, max) : new Dimension(max, as);
    }
]);

pkg.Constraints = Class([
    function () { 
        this.fill = pkg.HORIZONTAL + pkg.VERTICAL;
        this.padding(0);
        this.alignments(pkg.CENTER);
        this.spans(1);
    },

    function alignments(ax,ay){
        if(ax >= 0) this.ax = ax;
        if(ay >= 0) this.ay = ay;
    },

    function alignments(v) { this.alignments(v, v); },
    function spans(v){ this.spans(v, v); },
    function padding(v) { this.padding(v,v,v,v); },

    function padding(t, l, b, r) { 
        this.top = t ;
        this.bottom = b;
        this.left = l;
        this.right = r; 
    },

    function spans(rs,cs){
        this.rowSpan = rs;
        this.colSpan = cs;
    },

    function equals(o){
        if(zebra.instanceOf(o, pkg.Constraints)){
            return (this.ax == o.ax && this.ay == o.ay && this.fill == o.fill && 
                    this.top == o.top && this.left == o.left && this.right == o.right && this.bottom == o.bottom);
        }
        return false;
    }
]);

pkg.GridLayout = Class(L, function($) {
    var DEF_CONSTR = new pkg.Constraints();

    $(function (r,c){ this.$this(r, c, 0); });

    $(function (r,c,m){
        this.rows = r;
        this.cols = c;
        this.mask = m;
    });

    $(function calcPreferredSize(c){
        return new Dimension(getSizes(this.rows, this.cols, c, false)[this.cols], 
                             getSizes(this.rows, this.cols, c, true)[this.rows]);
    });

    $(function doLayout(c){
        var rows = this.rows, cols = this.cols;
        var colSizes = getSizes(rows, cols, c, false), rowSizes = getSizes(rows, cols, c, true);
        var right = c.getRight(), top = c.getTop(), bottom = c.getBottom(), left = c.getLeft();
        if((this.mask & pkg.HORIZONTAL) > 0){
            var dw = c.width - left - right - colSizes[cols];
            for(var i = 0;i < this.cols; i ++ ){
                colSizes[i] = colSizes[i] + (colSizes[i] != 0 ? Math.floor((dw * colSizes[i]) / colSizes[cols]) : 0);
            }
        }
        if((this.mask & pkg.VERTICAL) > 0){
            var dh = c.height - top - bottom - rowSizes[rows];
            for(var i = 0;i < this.rows; i ++ ){
                rowSizes[i] = rowSizes[i] + (rowSizes[i] != 0 ? Math.floor((dh * rowSizes[i]) / rowSizes[rows]) : 0);
            }
        }
        var yy = top, cc = 0;
        for(var i = 0;i < this.rows && cc < c.kids.length; i++){
            var xx = left;
            for(var j = 0;j < this.cols && cc < c.kids.length; j++, cc++){
                var l = c.kids[cc];
                if(l.isVisible){
                    var arg = fetchConstraints(l), d = l.getPreferredSize(), cellW = colSizes[j], cellH = rowSizes[i];
                    cellW -= (arg.left + arg.right);
                    cellH -= (arg.top + arg.bottom);
                    if((pkg.HORIZONTAL & arg.fill) > 0) d.width = cellW;
                    if((pkg.VERTICAL & arg.fill) > 0) d.height = cellH;
                    l.setSize(d.width, d.height);
                    l.setLocation(xx + arg.left + pkg.getXLoc(d.width, arg.ax, cellW), 
                                  yy + arg.top  + pkg.getYLoc(d.height, arg.ay, cellH));
                    xx += colSizes[j];
                }
            }
            yy += rowSizes[i];
        }
    });

    function getSizes(rows, cols, c, isRow){
        var max = isRow ? rows : cols, res = Array(max + 1);
        res[max] = 0;
        for(var i = 0;i < max; i++){
            res[i] = isRow ? getRowSize(i, cols, c) : getColSize(i, cols, c);
            res[max] += res[i];
        }
        return res;
    }

    function getRowSize(row, cols, c){
        var max = 0, s = zebra.util.indexByPoint(row, 0, cols);
        for(var i = s;i < c.kids.length && i < s + cols; i ++ ){
            var a = c.kids[i];
            if(a.isVisible){
                var arg = fetchConstraints(a), d = a.getPreferredSize().height;
                d += (arg.top + arg.bottom);
                max = Math.max(d, max);
            }
        }
        return max;
    }

    function getColSize(col, cols, c){
        var max = 0, r = 0, i;
        while((i = zebra.util.indexByPoint(r, col, cols)) < c.kids.length){
            var a = c.kids[i];
            if(a.isVisible){
                var arg = fetchConstraints(a), d = a.getPreferredSize().width;
                d += (arg.left + arg.right);
                max = Math.max(d, max);
            }
            r++;
        }
        return max;
    }

    function fetchConstraints(l){ return l.constraints || DEF_CONSTR; }
});

})(zebra("layout"), zebra.Class);
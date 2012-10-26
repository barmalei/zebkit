(function(pkg, Class) {

var L = pkg.Layout = new zebra.Interface();
pkg.NONE        = 0;
pkg.LEFT        = 1;
pkg.RIGHT       = 2;
pkg.TOP         = 4;
pkg.BOTTOM      = 8;
pkg.CENTER      = 16;
pkg.HORIZONTAL  = 32;
pkg.VERTICAL    = 64;
pkg.TEMPORARY   = 128;

pkg.USE_PS_SIZE = 4;
pkg.STRETCH     = 256;

pkg.TLEFT  = pkg.LEFT  | pkg.TOP;
pkg.TRIGHT = pkg.RIGHT | pkg.TOP;
pkg.BLEFT  = pkg.LEFT  | pkg.BOTTOM;
pkg.BRIGHT = pkg.RIGHT | pkg.BOTTOM;

pkg.getDirectChild = function(parent,child){
    for(; child != null && child.parent != parent; child = child.parent) {}
    return child;
};

pkg.getDirectAt = function(x,y,p){
    for(var i = 0;i < p.kids.length; i++){
        var c = p.kids[i];
        if(c.isVisible && c.x <= x && c.y <= y && c.x + c.width > x && c.y + c.height > y) return i;
    }
    return -1;
};

pkg.getTopParent = function(c){
    for(; c != null && c.parent != null; c = c.parent);
    return c;
};

pkg.getAbsLocation = function(x,y,c){
    while (c.parent != null){
        x += c.x;
        y += c.y;
        c = c.parent;
    }
    return [x, y];
};

pkg.getRelLocation = function(x, y, p, c){
    while(c != p){
        x -= c.x;
        y -= c.y;
        c = c.parent;
    }
    return [x, y];
};

pkg.getXLoc = function(aow,alignX,aw){
    if (alignX == pkg.RIGHT)  return aw - aow;
    if (alignX == pkg.CENTER) return ~~((aw - aow) / 2);
    if (alignX == pkg.LEFT || alignX == pkg.NONE) return 0;
    throw new Error();
};

pkg.getYLoc = function(aoh,alignY,ah){
    if(alignY == pkg.BOTTOM) return ah - aoh;
    if(alignY == pkg.CENTER) return ~~((ah - aoh) / 2);
    if(alignY == pkg.TOP || alignY == pkg.NONE) return 0;
    throw new Error();
};

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
    return { width:maxWidth, height:maxHeight };
};

pkg.isAncestorOf = function(p,c){
    for(; c != null && c != p; c = c.parent);
    return c != null;
};

pkg.Layoutable = Class(L, [
    function $prototype() {
        this.x = this.y = this.height = this.width = this.cachedHeight= 0;
        this.psWidth = this.psHeight = this.cachedWidth = -1;
        this.isLayoutValid = this.isValid = false;
        this.constraints = this.parent = null;
        this.isVisible = true;

        this.validateMetric = function(){
            if (this.isValid === false){
                this.recalc();
                this.isValid = true;
            }
        };

        this.invalidateLayout = function(){
            this.isLayoutValid = false;
            if(this.parent != null) this.parent.invalidateLayout();
        };

        this.invalidate = function(){
            this.isValid = this.isLayoutValid = false;
            this.cachedWidth =  -1;
            if(this.parent != null) this.parent.invalidate();
        };

        this.validate = function(){
            this.validateMetric();
            if(this.width > 0 && this.height > 0 && this.isLayoutValid === false && this.isVisible) {
                this.layout.doLayout(this);
                for(var i = 0;i < this.kids.length; i++) this.kids[i].validate();
                this.isLayoutValid = true;
                this.laidout();
            }
        };

        this.getPreferredSize = function(){
            this.validateMetric();
            if(this.cachedWidth < 0){
                var ps = (this.psWidth < 0 || this.psHeight < 0) ? this.layout.calcPreferredSize(this) 
                                                                 : { width:0, height:0 };
                if(this.psWidth >= 0) ps.width = this.psWidth;
                else                  ps.width += this.getLeft() + this.getRight();
                if(this.psHeight >= 0) ps.height = this.psHeight;
                else                   ps.height += (this.getTop() + this.getBottom());
                this.cachedWidth  = ps.width;
                this.cachedHeight = ps.height;
                return ps;
            }
            return { width:this.cachedWidth, height:this.cachedHeight };
        };

        this.getTop    = function ()  { return 0; };
        this.getLeft   = function ()  { return 0; };
        this.getBottom = function ()  { return 0; };
        this.getRight  = function ()  { return 0; };

        this.laidout    = function (){};
        this.resized    = function (pw,ph){};
        this.relocated  = function (px,py){};
        this.kidAdded   = function (index,constr,l){};
        this.kidRemoved = function (index,l){};
        this.layoutSet  = function (old){};
        this.recalc     = function (){};

        this.setParent = function (o){
            if(o != this.parent){
                this.parent = o;
                this.invalidate();
            }
        };

        this.setLayout = function (m){
            if (m == null) throw new Error("Undefined layout");

            if(this.layout != m){
                var pl = this.layout;
                this.layout = m;
                this.invalidate();
                this.layoutSet(pl);
            }
        };

        this.calcPreferredSize = function (target){ return { width:0, height:0 }; };
        this.doLayout = function (target) {};

        this.get = function(i){
            if (i < 0 || i >= this.kids.length) throw new Error();
            return this.kids[i];
        };

        this.count = function (){ return this.kids.length; };

        this.indexOf = function (c){ return this.kids.indexOf(c); };

        this.insert = function(i,constr,d){
            d.setParent(this);
            if (d.constraints) constr = d.constraints;
            else               d.constraints = constr;
            this.kids.splice(i, 0, d);
            this.kidAdded(i, constr, d);
            this.invalidate();
            return d;
        };

        this.setLocation = function (xx,yy){
            if(xx != this.x || this.y != yy){
                var px = this.x, py = this.y;
                this.x = xx;
                this.y = yy;
                this.relocated(px, py);
            }
        };

        this.setSize = function (w,h){
            if (w != this.width || h != this.height){
                var pw = this.width, ph = this.height;
                this.width = w;
                this.height = h;
                this.isLayoutValid = false;
                this.resized(pw, ph);
            }
        };

        this.getByConstraints = function (c) {
            if(this.kids.length > 0){
                for(var i = 0;i < this.kids.length; i++ ){
                    var l = this.kids[i];
                    if (c == l.constraints) return l;
                }
            }
            return null;
        };

        this.shape = function(x, y, w, h){
            this.setLocation(x, y);
            this.setSize(w, h);
        };

        this.remove = function(c) { this.removeAt(this.kids.indexOf(c)); };

        this.removeAt = function (i){
            var obj = this.kids[i];
            obj.setParent(null);
            if (obj.constraints) obj.constraints = null;
            this.kids.splice(i, 1);
            this.kidRemoved(i, obj);
            this.invalidate();
            return obj;
        };
    },

    function() {
        this.kids = [];
        this.layout = this;
    },

    function add(constr,d) { return this.insert(this.kids.length, constr, d); },

    function setPreferredSize(w,h){
        if(w != this.psWidth || h != this.psHeight){
            this.psWidth = w;
            this.psHeight = h;
            this.invalidate();
        }
    }
]);

pkg.BorderLayout = Class(L, [
    function() { this.$this(0, 0); },

    function (hgap,vgap){
        this.hgap = hgap;
        this.vgap = vgap;
    },

    function $prototype() {
        this.calcPreferredSize = function (target){
            var center = null, west = null,  east = null, north = null, south = null, d = null;
            for(var i = 0; i < target.kids.length; i++){
                var l = target.kids[i];
                if(l.isVisible){
                    switch(l.constraints) {
                       case pkg.CENTER : center = l;break;
                       case pkg.TOP    : north  = l;break;
                       case pkg.BOTTOM : south  = l;break;
                       case pkg.LEFT   : west   = l;break;
                       case pkg.RIGHT  : east   = l;break;
                    }
                }
            }
            var dim = { width:0, height:0 };
            if(east != null){
                d = east.getPreferredSize();
                dim.width += d.width + this.hgap;
                dim.height = Math.max(d.height, dim.height);
            }
            if(west != null){
                d = west.getPreferredSize();
                dim.width += d.width + this.hgap;
                dim.height = Math.max(d.height, dim.height);
            }
            if(center != null){
                d = center.getPreferredSize();
                dim.width += d.width;
                dim.height = Math.max(d.height, dim.height);
            }
            if(north != null){
                d = north.getPreferredSize();
                dim.width = Math.max(d.width, dim.width);
                dim.height += d.height + this.vgap;
            }
            if(south != null){
                d = south.getPreferredSize();
                dim.width = Math.max(d.width, dim.width);
                dim.height += d.height + this.vgap;
            }
            return dim;
        };

        this.doLayout = function(t){
            var top = t.getTop(), bottom = t.height - t.getBottom(),
                left = t.getLeft(), right = t.width - t.getRight(),
                center = null, west = null,  east = null;
            for(var i = 0;i < t.kids.length; i++){
                var l = t.kids[i];
                if(l.isVisible) {
                    switch(l.constraints) {
                        case pkg.CENTER: center = l; break;
                        case pkg.TOP :
                            var ps = l.getPreferredSize();
                            l.setLocation(left, top);
                            l.setSize(right - left, ps.height);
                            top += ps.height + this.vgap;
                            break;
                        case pkg.BOTTOM:
                            var ps = l.getPreferredSize();
                            l.setLocation(left, bottom - ps.height);
                            l.setSize(right - left, ps.height);
                            bottom -= ps.height + this.vgap;
                            break;
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
        };
    }
]);

pkg.RasterLayout = Class(L, [
    function () { this.$this(0); },
    function (f){ this.flag = f; },

    function $prototype() {
        this.calcPreferredSize = function(c){
            var m = { width:0, height:0 }, b = (this.flag & pkg.USE_PS_SIZE) > 0;
            for(var i = 0;i < c.kids.length; i++ ){
                var el = c.kids[i];
                if(el.isVisible){
                    var ps = b ? el.getPreferredSize() : { width:el.width, height:el.height },
                        px = el.x + ps.width, py = el.y + ps.height;
                    if(px > m.width) m.width = px;
                    if(py > m.height) m.height = py;
                }
            }
            return m;
        };

        this.doLayout = function(c){
            var r = c.width - c.getRight(), b = c.height - c.getBottom(),
                usePsSize = (this.flag & pkg.USE_PS_SIZE) > 0;
            for(var i = 0;i < c.kids.length; i++ ){
                var el = c.kids[i], ww = 0, hh = 0;
                if(el.isVisible){
                    if(usePsSize){
                        var ps = el.getPreferredSize();
                        ww = ps.width;
                        hh = ps.height;
                    }
                    else{
                        ww = el.width;
                        hh = el.height;
                    }
                    if ((this.flag & pkg.HORIZONTAL) > 0) ww = r - el.x;
                    if ((this.flag & pkg.VERTICAL  ) > 0) hh = b - el.y;
                    el.setSize(ww, hh);
                }
            }
        };
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

    function $prototype() {
        this.calcPreferredSize = function (c){
            var m = { width:0, height:0 }, cc = 0;
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
        };

        this.doLayout = function(c){
            var psSize = this.calcPreferredSize(c), t = c.getTop(), l = c.getLeft(), lastOne = null,
                px = pkg.getXLoc(psSize.width,  this.ax, c.width  - l - c.getRight()) + l,
                py = pkg.getYLoc(psSize.height, this.ay, c.height - t - c.getBottom()) + t;

            for(var i = 0;i < c.kids.length; i++){
                var a = c.kids[i];
                if(a.isVisible){
                    var d = a.getPreferredSize();
                    if(this.direction == pkg.HORIZONTAL){
                        a.setLocation(px, ~~((psSize.height - d.height) / 2) + py);
                        px += (d.width + this.gap);
                    }
                    else{
                        a.setLocation(px + ~~((psSize.width - d.width) / 2), py);
                        py += d.height + this.gap;
                    }
                    a.setSize(d.width, d.height);
                    lastOne = a;
                }
            }
            if(lastOne !== null && pkg.STRETCH == lastOne.constraints){
                if(this.direction == pkg.HORIZONTAL) lastOne.setSize(c.width - lastOne.x - c.getRight(), lastOne.height);
                else lastOne.setSize(lastOne.width, c.height - lastOne.y - c.getBottom());
            }
        };
    }
]);

pkg.ListLayout = Class(L, [
    function (){ this.$this(0); },
    function (gap){ this.$this( -1, gap); },

    function (ax, gap){
        if(ax !=  -1 && ax != pkg.LEFT && ax != pkg.RIGHT && ax != pkg.CENTER) throw new Error();
        this.ax = ax;
        this.gap = gap;
    },

    function $prototype() {
        this.calcPreferredSize = function (lw){
            var w = 0, h = 0;
            for(var i = 0;i < lw.kids.length; i++){
                var cc = lw.kids[i];
                if(cc.isVisible){
                    var d = cc.getPreferredSize();
                    h += (d.height + this.gap);
                    if(w < d.width) w = d.width;
                }
            }
            return { width:w, height:h };
        };

        this.doLayout = function (lw){
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
        };
    }
]);

pkg.PercentLayout = Class(L, [
    function (){ this.$this(pkg.HORIZONTAL, 2); },
    function (dir, gap) { this.$this(dir, gap, true); },

    function (dir, gap, stretch){
        if(dir != pkg.HORIZONTAL && dir != pkg.VERTICAL) throw new Error("4005");
        this.dir = dir;
        this.gap = gap;
        this.stretch = stretch;
    },

    function $prototype() {
        this.doLayout = function(target){
            var right = target.getRight(), top = target.getTop(), bottom = target.getBottom(), left = target.getLeft(),
                size = target.kids.length, rs = -this.gap * (size === 0 ? 0 : size - 1), loc = 0, ns = 0;

            if (this.dir == pkg.HORIZONTAL){
                rs += target.width - left - right;
                loc = left;
            }
            else{
                rs += target.height - top - bottom;
                loc = top;
            }

            for(var i = 0;i < size; i ++ ){
                var l = target.kids[i], c = l.constraints;
                if(this.dir == pkg.HORIZONTAL){
                    ns = ((size - 1) == i) ? target.width - right - loc : ~~((rs * c) / 100);
                    var yy = top, hh = target.height - top - bottom;
                    if (this.stretch === false) {
                        var ph = hh;
                        hh = l.getPreferredSize().height;
                        yy = top + ~~((ph - hh) / 2 );
                    }

                    l.setLocation(loc, yy);
                    l.setSize(ns, hh);
                }
                else{
                    ns = ((size - 1) == i) ? target.height - bottom - loc : ~~((rs * c) / 100);
                    var xx = left, ww = target.width - left - right;
                    if (this.stretch === false) {
                        var pw = ww;
                        ww = l.getPreferredSize().width;
                        xx = left + ~~((pw - ww) / 2 );
                    }

                    l.setLocation(xx, loc);
                    l.setSize(ww, ns);
                }
                loc += (ns + this.gap);
            }
        };

        this.calcPreferredSize = function (target){
            var max = 0, size = target.kids.length, as = this.gap * (size === 0 ? 0 : size - 1);
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
            return (this.dir == pkg.HORIZONTAL) ? { width:as, height:max }
                                                : { width:max, height:as };
        };
    }
]);

pkg.Constraints = Class([
    function $prototype() {
        this.top = this.bottom = this.left = this.right = 0;
        this.ay = this.ax = pkg.STRETCH;
        this.rowSpan = this.colSpan = 1;

        this.equals = function(o) {
            return  this == o  ||  (o           != null    &&
                                    this.ax     == o.ax    &&
                                    this.ay     == o.ay    &&
                                    this.top    == o.top   &&
                                    this.left   == o.left  &&
                                    this.right  == o.right &&
                                    this.bottom == o.bottom   );
        };
    },

    function () {},

    function (ax, ay) {
        this.ax = ax;
        this.ay = ay;
    },

    function padding(p) {
        this.top = this.bottom = this.left = this.right = p;
    },

    function paddings(t,l,b,r) {
        this.top = t;
        this.bottom = b;
        this.left = l;
        this.right = r;
    }
]);

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

var DEF_CONSTR = new pkg.Constraints();
pkg.GridLayout = Class(L, [
    function (r,c){ this.$this(r, c, 0); },

    function (r,c,m){
        this.rows = r;
        this.cols = c;
        this.mask = m;
    },

    function $prototype() {
        this.calcPreferredSize = function(c){
            return { width :getSizes(this.rows, this.cols, c, false)[this.cols],
                     height:getSizes(this.rows, this.cols, c, true) [this.rows] };
        };

        this.doLayout = function(c){
            var rows = this.rows, cols = this.cols,
                colSizes = getSizes(rows, cols, c, false), rowSizes = getSizes(rows, cols, c, true),
                right = c.getRight(), top = c.getTop(), bottom = c.getBottom(), left = c.getLeft();

            if ((this.mask & pkg.HORIZONTAL) > 0){
                var dw = c.width - left - right - colSizes[cols];
                for(var i = 0;i < this.cols; i ++ ){
                    colSizes[i] = colSizes[i] + (colSizes[i] !== 0 ? ~~((dw * colSizes[i]) / colSizes[cols]) : 0);
                }
            }

            if((this.mask & pkg.VERTICAL) > 0){
                var dh = c.height - top - bottom - rowSizes[rows];
                for(var i = 0;i < this.rows; i++ ){
                    rowSizes[i] = rowSizes[i] + (rowSizes[i] !== 0 ? ~~((dh * rowSizes[i]) / rowSizes[rows]) : 0);
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

                        if (pkg.STRETCH == arg.ax) d.width  = cellW;
                        if (pkg.STRETCH == arg.ay) d.height = cellH;
                        l.setSize(d.width, d.height);
                        l.setLocation(xx + arg.left + (pkg.STRETCH == arg.ax ? 0 : pkg.getXLoc(d.width,  arg.ax, cellW)),
                                      yy + arg.top  + (pkg.STRETCH == arg.ay ? 0 : pkg.getYLoc(d.height, arg.ay, cellH)));
                        xx += colSizes[j];
                    }
                }
                yy += rowSizes[i];
            }
        };
    }
]);

})(zebra("layout"), zebra.Class);
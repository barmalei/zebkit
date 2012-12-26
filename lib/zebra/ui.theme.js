(function(pkg, Class) {

var L = zebra.layout, View = pkg.view.View, rgb = zebra.util.rgb;

pkg.TitleInfo = zebra.Interface();

pkg.ButtonBorder = Class(View,[
    function (s){
        this.$this(s, [ pkg.palette.white, pkg.palette.gray2, pkg.palette.gray5,
                        s ? pkg.palette.black : pkg.palette.gray7]);
    },

    function (s, cs){
        this.state  = s;
        this.colors = cs.slice(0);
    },

    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            var xx = x + w - 1, yy = y + h - 1;
            g.setColor(this.colors[0]);
            g.fillRect(x, y, w, h);
            g.setColor(this.colors[1]);
            g.strokeRect(x, y, w - 1, h - 1);
            if(this.state){
                g.setColor(this.colors[2]);
                g.drawLine(x + 1, y + 1, xx - 1, y + 1);
                g.drawLine(x + 1, y + 2, xx - 1, y + 2);
                g.setColor(this.colors[3]);
                g.strokeRect(x, y, w - 1, h - 1);
                return;
            }
            g.setColor(this.colors[2]);
            g.drawLine(x + 1, yy - 1, xx - 1, yy - 1);
            g.drawLine(x + 1, yy - 2, xx - 1, yy - 2);
            g.setColor(this.colors[3]);
            g.fillRect(x + 2, y + 2, w - 6, ~~((h - 4) / 2));
        };

        this.getBottom = function() { return 4; };
    }
]);

pkg.SoftBorder = Class(View, [
    function (){ this.$this(pkg.palette.gray1, pkg.palette.gray6); },

    function (dc, lc){
        this.gap   = 2;
        this.dark  = dc;
        this.light = lc;
    },

    function $prototype() {
        this.paint = function(g, x, y, w, h, d) {
            var xx = x + w , yy = y + h ;
            g.setColor(this.dark);
            g.drawLine(x, y, x, yy - 1);
            g.drawLine(xx - 1, y, xx - 1, yy - 1);
            g.drawLine(x, y, xx - 1, y);
            g.drawLine(x, yy - 1, xx - 1, yy - 1);

            g.setColor(this.light);
            g.drawLine(x + 1, y + 1, x + 1, yy);
            g.drawLine(xx, y + 1, xx, yy);
            g.drawLine(x + 1, y + 1, xx, y + 1);
            g.drawLine(x + 1, yy, xx, yy);
        };
    }
]);

pkg.ListBorder = Class(View, [
    function() { this.$this(pkg.palette.black, pkg.palette.gray1, pkg.palette.gray5); },

    function (dc, mc, lc){
        this.dark   = dc;
        this.medium = mc;
        this.light  = lc;
    },

    function $prototype() {
        this.paint = function(g, x, y, w, h, d) {
            var xx = x + w - 1, yy = y + h - 1;
            g.setColor(this.dark);
            g.drawLine(x, y, x, yy);
            g.drawLine(x+1, y, xx, y);
            g.setColor(this.medium);
            g.drawLine(xx, y, xx, yy);
            g.drawLine(x, yy, xx, yy);
            g.setColor(this.light);
            g.drawLine(xx - 1, y + 1, xx - 1, yy - 1);
            g.drawLine(x + 1, y + 1, xx - 1, y + 1);
            g.drawLine(x + 1, yy - 1, xx - 1, yy - 1);
        };
    }
]);

pkg.TFieldBorder = Class(View, [
    function (){ this.$this(pkg.palette.gray2, pkg.palette.gray4); },

    function (dc, lc){
        this.gap   = 3;
        this.dark  = dc;
        this.light = lc;
    },

    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            var xx = x + w - 1, yy = y + h - 1;
            g.setColor(this.dark);
            g.strokeRect(x + 0.5, y+0.5, w - 1, h - 1);
            g.setColor(this.light);
            g.drawLine(x + 1, yy - 1, xx, yy - 1);
            g.drawLine(x + 1, yy - 2, xx, yy - 2);
        };
    }
]);

pkg.SBundleBorder = Class(View, [
    function (t){
        if (t != L.HORIZONTAL && t != L.VERTICAL) throw new Error();
        this.style = t;
    },

    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            var xx = x + w - 1, yy = y + h - 1;
            g.setColor(pkg.palette.gray6);
            g.fillRect(x, y, w, h);
            g.setColor(pkg.palette.white);
            g.drawLine(x, y, xx, y);
            g.drawLine(x, y, x, yy);
            g.setColor(pkg.palette.black);
            g.drawLine(x, yy, xx, yy);
            g.drawLine(xx, y, xx, yy);
            if(this.style == L.VERTICAL){
                g.setColor(pkg.palette.gray7);
                g.fillRect(x + ~~(w / 2), y + 1, 3, h - 2);
                g.setColor(pkg.palette.white);
                g.drawLine(x + ~~(w / 2) + 4, y + 1, x + ~~(w / 2) + 4, yy - 1);
                g.drawLine(x + ~~(w / 2) + 5, y + 1, x + ~~(w / 2) + 5, yy - 1);
                return;
            }
            g.setColor(pkg.palette.gray7);
            g.fillRect(x + 1, y + ~~(h / 2), w - 2, 3);
            g.setColor(pkg.palette.white);
            g.drawLine(x + 1, y + ~~(h / 2) + 4, xx - 1, ~~(y + h / 2) + 4);
            g.drawLine(x + 1, y + ~~(h / 2) + 5, xx - 1, ~~(y + h / 2) + 5);
        };
    }
]);

pkg.P3DBorder = Class(View, [
    function (){ this.$this(pkg.palette.black, pkg.palette.gray2, pkg.palette.gray3); },

    function (dc, mc, lc){
        this.dark   = dc;
        this.medium = mc;
        this.light  = lc;
    },

    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            var xx = x + w - 1, yy = y + h - 1;
            g.setColor(this.medium);
            g.drawLine(x, y, x, yy - 1);
            g.drawLine(x, y, xx, y);
            g.setColor(this.dark);
            g.drawLine(xx, y, xx, yy);
            g.drawLine(xx - 1, y, xx - 1, yy);
            g.drawLine(x, yy - 1, xx, yy - 1);
            g.drawLine(x, yy, xx, yy);
            g.setColor(this.light);
            g.drawLine(x + 1, yy - 2, xx - 2, yy - 2);
            g.drawLine(x + 1, yy - 3, xx - 2, yy - 3);
            g.drawLine(x + 1, y + 1, xx - 2, y + 1);
            g.drawLine(x + 1, y, x + 1, yy - 1);
        };

        this.getBottom = function(){ return 4;};
    }
]);

pkg.TabBorder = Class(View, [
    function(t){  this.$this(t, 1); },

    function(t, w){
        this.type = t;  
        this.gap = 4 + w;
        this.width = w;

        this.onColor1 = pkg.palette.black;
        this.onColor2 = pkg.palette.gray5;
        this.offColor = pkg.palette.gray1;

        this.fillColor1 = pkg.palette.gray5;
        this.fillColor2 = pkg.palette.white;
        this.fillColor3 = pkg.palette.gray7;
    },

    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            var xx = x + w - 1, yy = y + h - 1, o = d.parent.orient, t = this.type, s = this.width,  dt = s / 2;

            if(d.isEnabled){
                g.setColor(t == 2 ? this.fillColor1 : this.fillColor2);
                g.fillRect(x + 1, y, w - 3, h);
                g.setColor(this.fillColor3);
                g.fillRect(x + 1, y + 2, w - 3, ~~((h - 6) / 2));
            }

            g.setColor((t === 0 || t == 2) ? this.onColor1 : this.offColor);
            switch(o) {
                case L.LEFT:
                    g.drawLine(x + 2, y, xx + 1, y);
                    g.drawLine(x, y + 2, x, yy - 2);
                    g.drawLine(x, y + 2, x + 2, y);
                    g.drawLine(x + 2, yy, xx + 1, yy);
                    g.drawLine(x, yy - 2, x + 2, yy);

                    if (t == 1) {
                        g.setColor(this.onColor2);
                        g.drawLine(x + 2, yy - 1, xx, yy - 1);
                        g.drawLine(x + 2, yy, xx, yy);
                    }
                    break;
                case L.RIGHT:
                    g.drawLine(x, y, xx - 2, y);
                    g.drawLine(xx - 2, y, xx, y + 2);
                    g.drawLine(xx, y + 2, xx, yy - 2);
                    g.drawLine(xx, yy - 2, xx - 2, yy);
                    g.drawLine(x, yy, xx - 2, yy);

                    if (t == 1) {
                        g.setColor(this.onColor2);
                        g.drawLine(xx - 2, yy - 1, x, yy - 1);
                        g.drawLine(xx - 2, yy, x, yy);
                    }
                    break;
                case L.TOP:
                    g.lineWidth = s;
                    g.beginPath();
                    g.moveTo(x + dt, yy + 1);
                    g.lineTo(x + dt, y + dt + 2);
                    g.lineTo(x + dt + 2, y + dt);
                    g.lineTo(xx - dt - 1, y + dt);
                    g.lineTo(xx - dt + 1, y + dt + 2);
                    g.lineTo(xx - dt + 1, yy + 1);
                    g.stroke();
                    if (t === 0) {
                        g.setColor(this.onColor2);
                        g.beginPath();
                        g.moveTo(xx - dt - 2, y + dt + 1);
                        g.lineTo(xx - dt, y + dt + 3);
                        g.lineTo(xx - dt, yy - dt + 1);
                        g.stroke();
                    }
                    g.lineWidth = 1;
                    break;
                case L.BOTTOM:
                    g.drawLine(x + 2, yy, xx - 2, yy);
                    g.drawLine(x, yy - 2, x, y - 2);
                    g.drawLine(xx, yy - 2, xx, y - 2);
                    g.drawLine(x, yy - 2, x + 2, yy);
                    g.drawLine(xx, yy - 2, xx - 2, yy);
                    if (t == 1) {
                        g.setColor(this.onColor2);
                        g.drawLine(xx - 1, yy - 2, xx - 1, y - 2);
                        g.drawLine(xx, yy - 2, xx, y - 2);
                    }
                    break;
            }
        };

        this.getTop = function (){ return 3; };
        this.getBottom = function (){ return 2;};
    }
]);

pkg.TitledBorder = Class(pkg.view.Render, [
    function $prototype() {
        this.getTop    = function (){ return this.target.getTop(); };
        this.getLeft   = function (){ return this.target.getLeft(); };
        this.getRight  = function (){ return this.target.getRight(); };
        this.getBottom = function (){ return this.target.getBottom(); };

        this.outline = function (g,x,y,w,h,d) {
            var xx = x + w, yy = y + h;
            if (zebra.instanceOf(d, pkg.TitleInfo)){
                var r = d.getTitleInfo();
                if (r != null) {
                    var o = r.orient, cx = x, cy = y;

                    if (o == L.BOTTOM || o == L.TOP)
                    {
                        switch(this.lineAlignment) {
                            case L.CENTER : cy = r.y + ~~(r.height / 2); break;
                            case L.TOP    : cy = r.y + (o == L.BOTTOM ?1:0)* (r.height - 1); break;
                            case L.BOTTOM : cy = r.y + (o == L.BOTTOM ?0:1) *(r.height - 1); break;
                        }

                        if (o == L.BOTTOM)  yy = cy;
                        else                y  = cy;
                    }
                    else {

                        switch(this.lineAlignment) {
                            case L.CENTER : cx = r.x + ~~(r.width / 2); break;
                            case L.TOP    : cx = r.x + ((o == L.RIGHT)?1:0) *(r.width - 1); break;
                            case L.BOTTOM : cx = r.x + ((o == L.RIGHT)?0:1) *(r.width - 1); break;
                        }
                        if (o == L.RIGHT)  xx = cx;
                        else               x  = cx;
                    }
                }
            }

            if (this.target && this.target.outline) return this.target.outline(g, x, y, xx - x, yy - y, d);
            g.rect(x, y, xx - x, yy - y);
            return true;
        };

        this.paint = function(g,x,y,w,h,d){
            if(zebra.instanceOf(d, pkg.TitleInfo)){
                var r = d.getTitleInfo();
                if(r != null) {
                    var xx = x + w, yy = y + h, o = r.orient;
                    g.save();
                    g.beginPath();

                    var br = (o == L.RIGHT), bb = (o == L.BOTTOM),  dt = (bb || br) ? -1 : 1;
                    if (bb || o == L.TOP) {
                        var sy = y, syy = yy, cy = 0 ;
                        switch(this.lineAlignment) {
                            case L.CENTER : cy = r.y + ~~(r.height / 2); break;
                            case L.TOP    : cy = r.y + (bb?1:0) *(r.height - 1); break;
                            case L.BOTTOM : cy = r.y + (bb?0:1) *(r.height - 1); break;
                        }

                        if (bb) {
                            sy  = yy;
                            syy = y;
                        }

                        g.moveTo(r.x + 1, sy);
                        g.lineTo(r.x + 1, r.y + dt * (r.height));
                        g.lineTo(r.x + r.width - 1, r.y + dt * (r.height));
                        g.lineTo(r.x + r.width - 1, sy);
                        g.lineTo(xx, sy);
                        g.lineTo(xx, syy);
                        g.lineTo(x, syy);
                        g.lineTo(x, sy);
                        g.lineTo(r.x, sy);
                        if (bb)  yy = cy;
                        else     y  = cy;
                    }
                    else {
                        var sx = x, sxx = xx, cx = 0;
                        if (br) {
                            sx = xx;
                            sxx = x;
                        }
                        switch(this.lineAlignment) {
                            case L.CENTER : cx = r.x + ~~(r.width / 2); break;
                            case L.TOP    : cx = r.x + (br?1:0) *(r.width - 1); break;
                            case L.BOTTOM : cx = r.x + (br?0:1) *(r.width - 1); break;
                        }

                        g.moveTo(sx, r.y);
                        g.lineTo(r.x + dt * (r.width), r.y);
                        g.lineTo(r.x + dt * (r.width), r.y + r.height - 1);
                        g.lineTo(sx, r.y + r.height - 1);
                        g.lineTo(sx, yy);
                        g.lineTo(sxx, yy);
                        g.lineTo(sxx, y);
                        g.lineTo(sx, y);
                        g.lineTo(sx, r.y);
                        if (br)  xx = cx;
                        else     x  = cx;
                    }

                    g.clip();
                    this.target.paint(g, x, y, xx - x, yy - y, d);
                    g.restore();
                }
            }
            else {
                this.target.paint(g, x, y, w, h, d);
            }
        };
    },

    function (border){ this.$this(border, L.BOTTOM); },

    function (b, a){
        if (b == null && a != L.BOTTOM && a != L.TOP && a != L.CENTER) {
            throw new Error("Wrong border text alignment");
        }
        this.$super(b);
        this.lineAlignment = a;
    }
]);


})(zebra("ui"), zebra.Class);
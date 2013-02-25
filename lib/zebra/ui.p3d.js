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
    
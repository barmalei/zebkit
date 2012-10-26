(function(pkg, Class, ui) {

var L = zebra.layout, View = ui.view.View, rgb = zebra.util.rgb;

pkg.ButtonBorder = Class(View,[
    function (s){
        this.$this(s, [ ui.palette.white, ui.palette.gray2, ui.palette.gray5,
                        s ? ui.palette.black : ui.palette.gray7]);
    },

    function (s, cs){
        this.state  = s;
        this.colors = cs.slice(0);
    },

    function paint(g,x,y,w,h,d){
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
    },

    function getBottom(){ return 4;}
]);

pkg.SoftBorder = Class(View, [
    function (){ this.$this(ui.palette.gray2, ui.palette.gray5); },

    function (dc, lc){
        this.gap   = 4;
        this.dark  = dc;
        this.light = lc;
    },

    function paint(g, x, y, w, h, d) {
        var xx = x + w - 1, yy = y + h - 1;
        g.setColor(this.dark);
        g.drawLine(x, y, x, yy - 1);
        g.drawLine(xx - 1, y, xx - 1, yy - 1);
        g.drawLine(x, y, xx - 1, y1);
        g.drawLine(x, yy - 1, xx - 1, yy - 1);

        g.setColor(this.light);
        g.drawLine(x + 1, y + 1, x + 1, yy);
        g.drawLine(xx, y + 1, xx, yy);
        g.drawLine(x + 1, y + 1, xx, y + 1);
        g.drawLine(x + 1, yy, xx, yy);
    }
]);

pkg.ListBorder = Class(View, [
    function() {  this.$this(ui.palette.black, ui.palette.gray1, ui.palette.gray5); },

    function (dc, mc, lc){
        this.dark   = dc;
        this.medium = mc;
        this.light  = lc;
    },

    function paint(g, x, y, w, h, d) {
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
    }
]);

pkg.TFieldBorder = Class(View, [
    function (){ this.$this(ui.palette.gray2, ui.palette.gray4); },

    function (dc, lc){
        this.gap   = 3;
        this.dark  = dc;
        this.light = lc;
    },

    function paint(g,x,y,w,h,d){
        var xx = x + w - 1, yy = y + h - 1;
        g.setColor(this.dark);
        g.strokeRect(x + 0.5, y+0.5, w - 1, h - 1);
        g.setColor(this.light);
        g.drawLine(x + 1, yy - 1, xx, yy - 1);
        g.drawLine(x + 1, yy - 2, xx, yy - 2);
    }
]);

pkg.SBundleBorder = Class(View, [
    function (t){
        if (t != L.HORIZONTAL && t != L.VERTICAL) throw new Error();
        this.style = t;
    },

    function paint(g,x,y,w,h,d){
        var xx = x + w - 1, yy = y + h - 1;
        g.setColor(ui.palette.gray6);
        g.fillRect(x, y, w, h);
        g.setColor(ui.palette.white);
        g.drawLine(x, y, xx, y);
        g.drawLine(x, y, x, yy);
        g.setColor(ui.palette.black);
        g.drawLine(x, yy, xx, yy);
        g.drawLine(xx, y, xx, yy);
        if(this.style == L.VERTICAL){
            g.setColor(ui.palette.gray7);
            g.fillRect(x + ~~(w / 2), y + 1, 3, h - 2);
            g.setColor(ui.palette.white);
            g.drawLine(x + ~~(w / 2) + 4, y + 1, x + ~~(w / 2) + 4, yy - 1);
            g.drawLine(x + ~~(w / 2) + 5, y + 1, x + ~~(w / 2) + 5, yy - 1);
            return;
        }
        g.setColor(ui.palette.gray7);
        g.fillRect(x + 1, y + ~~(h / 2), w - 2, 3);
        g.setColor(ui.palette.white);
        g.drawLine(x + 1, y + ~~(h / 2) + 4, xx - 1, ~~(y + h / 2) + 4);
        g.drawLine(x + 1, y + ~~(h / 2) + 5, xx - 1, ~~(y + h / 2) + 5);
    }
]);

pkg.P3DBorder = Class(View, [
    function (){ this.$this(ui.palette.black, ui.palette.gray2, ui.palette.gray3); },

    function (dc, mc, lc){
        this.dark   = dc;
        this.medium = mc;
        this.light  = lc;
    },

    function paint(g,x,y,w,h,d){
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
    },

    function getBottom(){ return 4;}
]);

pkg.TabBorder = Class(View, [
    function(t){  this.$this(t, 1); },

    function(t, w){
        this.type = t;
        this.gap = 4 + w;
        this.width = w;

        this.onColor1 = ui.palette.black;
        this.onColor2 = ui.palette.gray5;
        this.offColor = ui.palette.gray1;

        this.fillColor1 = ui.palette.gray5;
        this.fillColor2 = ui.palette.white;
        this.fillColor3 = ui.palette.gray7;
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
                    g.drawLine(x, yy - 2, x, y-2);
                    g.drawLine(xx, yy - 2, xx, y-2);
                    g.drawLine(x, yy - 2, x + 2, yy);
                    g.drawLine(xx, yy - 2, xx - 2, yy);
                    if (t == 1) {
                        g.setColor(this.onColor2);
                        g.drawLine(xx - 1, yy - 2, xx - 1, y-2);
                        g.drawLine(xx, yy - 2, xx, y-2);
                    }
                    break;
            }
        };

        this.getTop = function (){ return 3; };
        this.getBottom = function (){ return 2;};
    }
]);

pkg.CheckboxView = Class(View, [
    function(state) { this.$this(state, new rgb(220,0,0)); },

    function(state, bg) {
        this.state = state;
        this.bg = bg;
    },

    function paint(g,x,y,w,h,d){
        g.fillStyle = this.bg.s;
        g.rect(x, y, w, h);
        g.fill();

        g.strokeStyle ="gray";
        g.beginPath();
        g.moveTo(x + w - 0.5, y + 1);
        g.lineTo(x + w - 0.5, y + h - 1);
        g.lineTo(x+1, y + h - 0.5);
        g.stroke();

        if (this.state) {
            g.beginPath();
            g.strokeStyle = "white";
            g.lineWidth = 2;
            g.moveTo(x + 1, y + 2);
            g.lineTo(x + w - 3, y + h - 3);
            g.stroke();
            g.beginPath();
            g.moveTo(x + w - 2, y + 2);
            g.lineTo(x + 2, y + h - 2);
            g.stroke();
            g.lineWidth = 1;
        }
    }
]);

pkg.RadioboxView = Class(View, [
    function(state) { this.$this(state, new rgb(220,0,0)); },

    function(state, bg) {
        this.state = state;
        this.bg = bg;
    },

    function paint(g,x,y,w,h,d){
        g.beginPath();
        g.fillStyle = this.bg.s;
        g.arc(x + w/2, y + h/2, w/2, 0, 2*Math.PI, 1);
        g.fill();

        if (this.state) {
            g.beginPath();
            g.fillStyle = "white";
            g.arc(x + w/2, y + h/2, w/5 , 0, 2* Math.PI, 1);
            g.fill();
        }
    },

    function getPreferredSize() { return { width:12, height:12 }; }
]);

pkg.ScrollButton = Class(View, [
    function(o) { this.o = o; },

    function paint(g,x,y,w,h,d){
        g.beginPath();
        g.fillStyle = rgb.red.s;
        if (this.o == L.TOP) {
            g.moveTo(x + ~~(w/2), y);
            g.lineTo(x, y + h - 1);
            g.lineTo(x + w - 1, y + h - 1);
        }
        else
        if (this.o == L.BOTTOM) {
            g.moveTo(x + ~~(w/2), y + h - 1);
            g.lineTo(x, y);
            g.lineTo(x + w - 1, y);
        }
        else
        if (this.o == L.LEFT) {
            g.moveTo(x, y + ~~(h/2));
            g.lineTo(x + w - 1, y);
            g.lineTo(x + w - 1, y + h - 1);
        }
        else
        if (this.o == L.RIGHT) {
            g.moveTo(x + w - 1, y + ~~(h/2));
            g.lineTo(x, y);
            g.lineTo(x, y + h - 1);
        }
        g.fill();
    },

    function getPreferredSize() { return { width:12, height:12 }; }
]);

})(zebra("ui.p3d"), zebra.Class, zebra("ui"));
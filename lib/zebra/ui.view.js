(function(pkg, Class, Interface) {

var rgb = zebra.util.rgb, L = zebra.layout;

pkg.View = Class([
    function $clazz() {
        this.createView = function(f) {
            var v = new pkg.View();
            v.paint = f;
            return v;
        };
    },

    function $prototype() {
        this.gap = 2;
        this.getTop    = function() { return this.gap; };
        this.getBottom = function() { return this.gap; };
        this.getLeft   = function() { return this.gap; };
        this.getRight  = function() { return this.gap; };
        this.getPreferredSize = function() { return { width:0, height:0 }; };
    }
]);

pkg.Render = Class(pkg.View, [
    function (target) { this.setTarget(target); },

    function setTarget(o){
        if(this.target != o) {
            var old = this.target;
            this.target = o;
            if (this.targetWasChanged) this.targetWasChanged(old, o);
        }
    }
]);

pkg.Raised = Class(pkg.View, [
    function () { this.$this(pkg.lightBrColor, pkg.midBrColor); },

    function (brightest,middle) {
        this.brightest = brightest == null ? rgb.white : brightest;
        this.middle    = middle    == null ? rgb.gray  : middle;
    },

    function paint(g,x1,y1,w,h,d){
        var x2 = x1 + w - 1, y2 = y1 + h - 1;
        g.setColor(this.brightest);
        g.drawLine(x1 + 1, y1 + 1, x2 - 2, y1 + 1);
        g.drawLine(x1 + 1, y1, x1 + 1, y2 - 1);
        g.setColor(this.middle);
        g.drawLine(x2, y1, x2, y2);
        g.drawLine(x1, y2, x2, y2);
    }
]);

pkg.LightSunken = Class(pkg.View, [
    function () { this.$this(pkg.lightBrColor, pkg.midBrColor); },

    function (brightest,middle) {
        this.brightest = brightest == null ? rgb.white : brightest;
        this.middle    = middle    == null ? rgb.gray  : middle;
    },

    function paint(g,x1,y1,w,h,d){
        var x2 = x1 + w - 1, y2 = y1 + h - 1;
        g.setColor(this.middle);
        g.drawLine(x1, y1, x2 - 1, y1);
        g.drawLine(x1, y1, x1, y2 - 1);
        g.setColor(this.brightest);
        g.drawLine(x2, y1, x2, y2);
        g.drawLine(x1, y2, x2, y2);
    }
]);

pkg.Sunken = Class(pkg.View, [
    function () { this.$this(pkg.lightBrColor, pkg.midBrColor, pkg.darkBrColor); },

    function (brightest,middle,darkest) {
        this.brightest = brightest == null ? rgb.white : brightest;
        this.middle    = middle    == null ? rgb.gray  : middle;
        this.darkest   = darkest   == null ? rgb.black : darkest;
    },

    function paint(g,x1,y1,w,h,d){
        var x2 = x1 + w - 1, y2 = y1 + h - 1;
        g.setColor(this.middle);
        g.drawLine(x1, y1, x2 - 1, y1);
        g.drawLine(x1, y1, x1, y2 - 1);
        g.setColor(this.brightest);
        g.drawLine(x2, y1, x2, y2);
        g.drawLine(x1, y2, x2, y2);
        g.setColor(this.darkest);
        g.drawLine(x1 + 1, y1 + 1, x1 + 1, y2 - 1);
        g.drawLine(x1 + 1, y1 + 1, x2 - 1, y1 + 1);
    }
]);

pkg.Etched = Class(pkg.View, [
    function () { this.$this(pkg.lightBrColor, pkg.midBrColor); },

    function (brightest,middle) {
        this.brightest = brightest == null ? rgb.white : brightest;
        this.middle    = middle    == null ? rgb.gray  : middle;
    },

    function paint(g,x1,y1,w,h,d){
        var x2 = x1 + w - 1, y2 = y1 + h - 1;
        g.setColor(this.middle);
        g.drawLine(x1, y1, x1, y2 - 1);
        g.drawLine(x2 - 1, y1, x2 - 1, y2 - 1);
        g.drawLine(x1, y1, x2 - 1, y1);
        g.drawLine(x1, y2 - 1, x2 - 1, y2 - 1);

        g.setColor(this.brightest);
        g.drawLine(x2, y1 + 1, x2, y2);
        g.drawLine(x1 + 1, y1 + 1, x1 + 1, y2 - 2);
        g.drawLine(x1 + 1, y1 + 1, x2 - 2, y1 + 1);
        g.drawLine(x1 + 1, y2, x2, y2);
    }
]);

pkg.Border = Class(pkg.View, [
    function $clazz() {
        this.SOLID  = 1;
        this.DOTTED = 2;
        this.SPACE  = 4;
    },

    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            if (this.style != pkg.Border.SPACE) {
                var ps = g.lineWidth;
                g.lineWidth = this.width;
                g.setColor(this.color);
                if (this.style == pkg.Border.SOLID) {
                    if (this.radius > 0) this.outline(g,x,y,w,h, d);
                    else {
                        var dt = this.width / 2;
                        g.beginPath();
                        g.rect(x + dt, y + dt, w - this.width, h - this.width);
                    }
                    g.setColor(this.color);
                    g.stroke();
                }
                else
                if (this.style == pkg.Border.DOTTED) g.drawDottedRect(x, y, w, h);
                g.lineWidth = ps;
            }
        };

        this.outline = function(g,x,y,w,h,d) {
            if (this.style != pkg.Border.SOLID || this.radius <= 0) return false;
            var r = this.radius, dt = this.width / 2, xx = x + w - dt, yy = y + h - dt;
            x += dt;
            y += dt;
            g.beginPath();
            g.moveTo(x - 1 + r, y);
            g.lineTo(xx - r, y);
            g.quadraticCurveTo(xx, y, xx, y + r);
            g.lineTo(xx, yy  - r);
            g.quadraticCurveTo(xx, yy, xx - r, yy);
            g.lineTo(x + r, yy);
            g.quadraticCurveTo(x, yy, x, yy - r);
            g.lineTo(x, y + r);
            g.quadraticCurveTo(x, y, x + r, y);
            return true;
        };
    },

    function() { this.$this(pkg.Border.SOLID); },

    function(c){
        if (zebra.isString(c)) {
            var r = /([0-9]+px)[ ]+([0-9]+px)?[ ]+(\w+)[ ]+(.*)/.match(c);
            if (r == null) throw new Error();

            var t = (e.length == 4) ? r[2].toLowerCase() : r[1].toLowerCase();
            t = "solid" ? pkg.Border.SOLID : ( t == "dotted" ? pkg.Border.DOTTED : -1);

            if (e.length == 4) {
                this.$this(t, r[3], parseInt(r[0].substring(0, r[0].length-1), 10), 
                                    parseInt(r[1].substring(0, r[1].length-1), 10));
            }
            else  {
                this.$this(t, r[2], parseInt(r[0].substring(0, r[0].length-1), 10));
            }
        }
        else this.$this(c, pkg.borderColor);
    },

    function (t,c)   { this.$this(t, c, 1, 0); },
    function (t,c,w) { this.$this(t, c, w, 0); },

    function (t,c,w,r){
        if (c == null) throw new Error();
        if (t != pkg.Border.DOTTED && t != pkg.Border.SOLID && t != pkg.Border.SPACE) throw new Error();
        this.style  = t;
        this.color  = (zebra.isString(c) ? new rgb(c) : c);
        this.width  = w;
        this.radius = r;
        this.gap = this.width + Math.round(this.radius / 4);
    }
]);

pkg.Gradient = Class(pkg.View, [
    function (c1,c2) { this.$this(c1, c2, L.VERTICAL); },

    function (c1,c2, orientation){
        this.orientation = orientation;
        this.startColor = zebra.isString(c1) ? new rgb(c1) : c1;
        this.endColor   = zebra.isString(c2) ? new rgb(c2) : c2;
    },

    function $prototype() {
        this.paint = function(g,x,y,w,h,dd){
            var p = g.fillStyle, d = (this.orientation == L.HORIZONTAL? [0,1]: [1,0]),
                x1 = x*d[1], y1 = y * d[0], x2 = (x + w - 1) * d[1], y2 = (y + h - 1) * d[0];

            if (this.gradient == null || this.gx1 != x1 ||
                this.gx2 != x2 || this.gy1 != y1 || this.gy2 != y2)
            {
                this.gx1 = x1;
                this.gx2 = x2;
                this.gy1 = y1;
                this.gy2 = y2;
                this.gradient = g.createLinearGradient(x1, y1, x2, y2);
                this.gradient.addColorStop(0, this.startColor.toString());
                this.gradient.addColorStop(1, this.endColor.toString());
            }

            g.fillStyle = this.gradient;
            g.fillRect(x, y, w, h);
            g.fillStyle = p;
        };
    }
]);

pkg.Picture = Class(pkg.Render, [
    function (img) { this.$this(img,0,0,0,0, false);  },
    function (img,x,y,w,h){ this.$this(img,x,y,w,h, false); },

    function (img,x,y,w,h, ub){
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        if (ub === true) {
            this.buffer = document.createElement("canvas");
            this.buffer.width = 0;
        }
        this.$super(img);
    },

    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            if(this.target != null && w > 0 && h > 0){
                var img = this.target;
                if (this.buffer) {
                    img = this.buffer;
                    if (img.width <= 0) {
                        var ctx = img.getContext("2d");
                        if (this.width > 0) {
                            img.width  = this.width;
                            img.height = this.height;
                            ctx.drawImage(this.target, this.x, this.y, this.width,
                                          this.height, 0, 0, this.width, this.height);
                        }
                        else {
                            img.width  = this.target.width;
                            img.height = this.target.height;
                            ctx.drawImage(this.target, 0, 0);
                        }
                    }
                }

                if(this.width > 0 && !this.buffer) {
                    g.drawImage(img, this.x, this.y,
                                this.width, this.height, x, y, w, h);
                }
                else g.drawImage(img, x, y, w, h);
            }
        };

        this.targetWasChanged = function(o, n) {
            if (this.buffer) delete this.buffer;
        };

        this.getPreferredSize = function(){
            var img = this.target;
            return img == null ? { width:0, height:0 }
                               : (this.width > 0) ? { width:this.width, height:this.height }
                                                  : { width:img.width, height:img.height };
        };
    },

    function equals(o){
        return this.$super(o) && o.width  == this.width &&
                                 o.height == this.height &&
                                 o.x      == this.x &&
                                 o.y      == this.y;
    }
]);

pkg.CompositeView = Class(pkg.View, [
    function $prototype() {
        this.left = this.right = this.bottom = this.top = this.height = 0;

        this.getTop = function(){
            this.validate();
            return this.top;
        };

        this.getLeft = function(){
            this.validate();
            return this.left;
        };

        this.getBottom = function (){
            this.validate();
            return this.bottom;
        };

        this.getRight = function (){
            this.validate();
            return this.right;
        };

        this.getPreferredSize = function (){
            this.validate();
            return { width:this.width + this.left + this.right,
                     height:this.height + this.top + this.bottom };
        };

        this.validate = function (){
            if(this.width < 0){
                this.top = this.bottom = this.left = this.right = this.width = this.height = 0;
                for(var i = 0;i < this.views.length; i ++ ){
                    var s = this.views[i], ps = s.getPreferredSize();
                    if (ps.width > this.width) this.width = ps.width;
                    if (ps.height > this.height) this.height = ps.height;
                    this.top = Math.max(this.top, s.getTop());
                    this.left = Math.max(this.left, s.getLeft());
                    this.bottom = Math.max(this.bottom, s.getBottom());
                    this.right = Math.max(this.right, s.getRight());
                }
            }
        };

        this.paint = function(g,x,y,w,h,d) { 
            for(var i = 0;i < this.views.length; i++) this.views[i].paint(g, x, y, w, h, d); 
        };
    },

    function (){ this.$this([]);  },
    function (v1,v2){ this.$this([v1, v2]); },
    function (args) {
        this.views = [];
        this.width = -1;
        for(var i = 0;i < args.length; i ++) this.views[i] = args[i];
    }
]);

pkg.ViewSet = Class(pkg.View, [
    function $prototype() {
        this.paint     = function(g,x,y,w,h,d) { if (this.activeView != null) this.activeView.paint(g, x, y, w, h, d); };
        this.getTop    = function()  { return this.activeView == null ? 0 : this.activeView.getTop(); };
        this.getLeft   = function()  { return this.activeView == null ? 0 : this.activeView.getLeft(); };
        this.getBottom = function()  { return this.activeView == null ? 0 : this.activeView.getBottom(); };
        this.getRight  = function()  { return this.activeView == null ? 0 : this.activeView.getRight(); };

        this.getPreferredSize = function(){
            if(this.width < 0){
                this.width = this.height = 0;
                for(var k in this.views){
                    var v = this.views[k];
                    if(v != null){
                        var ps = v.getPreferredSize();
                        if (ps.width > this.width)   this.width  = ps.width;
                        if (ps.height > this.height) this.height = ps.height;
                    }
                }
            }
            return { width:this.width, height:this.height };
        };

        this.activate = function (id){
            var old = this.activeView;
            this.activeView = this.views[id];
            return this.activeView != old;
        };
    },

    function () {
        this.views = {};
        this.height = -1;
        this.activeView = null;
    },

    function (args){
        this.$this();
        if (Array.isArray(args)) {
            for(var i=0; i< args.length; i+=2) this.put(args[i], args[i+1]);
        }
        else for(var k in args) this.put(k, args[k]);
    },

    function put(id, v){
        if(v == null){
            if (this.views.hasOwnProperty(id)) {
               delete this.views[id];
               return true;
            }
            return false;
        }
        else this.views[id] = v;
        this.width =  -1;
        return true;
    }
]);

})(zebra("ui.view"), zebra.Class, zebra.Interface);
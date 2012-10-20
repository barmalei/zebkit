(function(pkg, Class, Interface) {

var rgb = zebra.util.rgb, T = zebra.ui, L = zebra.layout, PositionMetric = zebra.util.Position.PositionMetric;

pkg.TxtSelectionInfo = Interface();
pkg.TitleInfo        = Interface();
pkg.ViewProvider     = Interface();

pkg.View = Class([
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

    function equals(o){
        var target = this.target;
        return o != null && (o == this || (target == o.target || (target != null && target.equals && target.equals(o.target))));
    },

    function setTarget(o){
        if(this.target != o) {
            var old = this.target;
            this.target = o;
            if (this.targetWasChanged) this.targetWasChanged(old, o);
        }
    }
]);

pkg.CompRender = Class(pkg.Render, [
    function $prototype() {
        this.getPreferredSize = function(){
            return this.target == null ? this.$super() : this.target.getPreferredSize();
        };

        this.recalc = function() { if (this.target != null) this.target.validate(); };

        this.paint = function(g,x,y,w,h,d){
            var c = this.target;
            if(c != null) {
                c.validate();
                var prevW =  -1, prevH = 0;
                if(zebra.ui.getDesktop(c) == null){
                    prevW = c.width;
                    prevH = c.height;
                    c.setSize(w, h);
                }
                var cx = x - c.x, cy = y - c.y;
                g.translate(cx, cy);
                T.paintManager.paint(g, c);
                g.translate(-cx,  -cy);
                if(prevW >= 0){
                    c.setSize(prevW, prevH);
                    c.validate();
                }
            }
        };
    }
]);

pkg.Raised = Class(pkg.View, [
    function () { this.$this(T.get("br.c1"), T.get("br.c2")); },

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
    function () { this.$this(T.get("br.c1"), T.get("br.c2")); },

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
    function () { this.$this(T.get("br.c1"), T.get("br.c2"), T.get("br.c3")); },

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
    function () { this.$this(T.get("br.c1"), T.get("br.c2")); },

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
            var r = this.radius, wd = this.width, dt = wd / 2, xx = x + w - dt, yy = y + h - dt;
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
        if (c instanceof rgb) this.$this(pkg.Border.SOLID, c);
        else this.$this(c, T.get("def.brcol"));
    },

    function (t,c)   { this.$this(t, c, 1, 0); },
    function (t,c,w) { this.$this(t, c, w, 0); },

    function (t,c,w,r){
        if (t != pkg.Border.DOTTED && t != pkg.Border.SOLID && t != pkg.Border.SPACE) throw new Error();
        this.style  = t;
        this.color  = (c == null ? rgb.gray : c);
        this.width  = w;
        this.radius = r;
        this.gap = this.width + Math.round(this.radius / 4);
    }
]);

pkg.Fill = Class(pkg.Render, [
    function (r,g,b) { this.$super(new rgb(r, g, b)); },

    function (c){
        if ((c instanceof rgb) === false) c = new rgb(c);
	this.$super(c);
    },

    function $prototype() {
    	this.paint = function(g,x,y,w,h,d) {
            g.setColor(this.target);
            g.fillRect(x, y, w, h);
        };
    }
]);

for(var k in rgb) {
    var c = rgb[k];
    if (c instanceof rgb) pkg.Fill[k] = new pkg.Fill(c);
}

pkg.Gradient = Class(pkg.Fill, [
    function (c1,c2) { this.$this(c1, c2, L.VERTICAL); },

    function (c1,c2,orientation){
        this.$super(c1);
        this.orientation = orientation;
        this.endColor = c2;
        this.gradient = null;
    },

    function paint(g,x,y,w,h,dd){
        var p = g.fillStyle, d = (this.orientation == L.HORIZONTAL? [0,1]: [1,0]),
            x1 = x*d[1], y1 = y * d[0], x2 = (x + w - 1) * d[1], y2 = (y + h - 1) * d[0];
        if (this.gradient == null || this.gx1 != x1 ||  this.gx2 != x2 || this.gy1 != y1 || this.gy2 != y2) {
            this.gx1 = x1;
            this.gx2 = x2;
            this.gy1 = y1;
            this.gy2 = y2;
            this.gradient = g.createLinearGradient(x1, y1, x2, y2);
            this.gradient.addColorStop(0, this.target.toString());
            this.gradient.addColorStop(1, this.endColor.toString());
        }

        g.fillStyle = this.gradient;
        g.fillRect(x, y, w, h);
        g.fillStyle = p;
    }
]);

pkg.Picture = Class(pkg.Render, [
    function (img) { this.$this(img,0,0,0,0, false);  },
    function (img,x,y,w,h){ this.$this(img,x,y,w,h, false); },

    function (img,x,y,w,h, ub){
        this.$super(zebra.isString(img) ? zebra.ui.loadImage(img) : img);
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        if (ub === true) {
            this.buffer = document.createElement("canvas");
            this.buffer.width = 0;
        }
    },

    function paint(g,x,y,w,h,d){
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
    },

    function targetWasChanged(o, n) {
        if (this.buffer) delete this.buffer;
    },

    function getPreferredSize(){
        var img = this.target;
        return img == null ? this.$super(this.getPreferredSize)
                           : (this.width > 0) ? { width:this.width, height:this.height }
                                              : { width:img.width, height:img.height };
    },

    function equals(o){
        return this.$super(o) && o.width  == this.width &&
                                 o.height == this.height &&
                                 o.x      == this.x &&
                                 o.y      == this.y;
    }
]);

pkg.TextRender = Class(pkg.Render, PositionMetric, [
    function $prototype() {
        this.textWidth = this.textHeight = this.startLine = this.lines = 0;
        this.owner = null;

        this.getLineIndent = function() { return 1; };
        this.getLines = function() { return this.target.getLines(); };
        this.getLineSize = function(l) { return this.target.getLine(l).length + 1; };
        this.getMaxOffset = function() { return this.target.getTextLength(); };
        this.ownerChanged = function(v) { this.owner = v; };
        this.paintLine = function (g,x,y,line,d) { g.fillText(this.getLine(line), x, y + this.font.ascent); };
        this.getLine = function(r){ return this.target.getLine(r); };

        this.targetWasChanged = function(o,n){
            if (o != null) o._.remove(this);
            if (n != null) {
                n._.add(this);
                this.invalidate(0, this.getLines());
            }
            else this.lines = 0;
        };

        this.getText = function(){
            var text = this.target;
            return text == null ? null : text.getText();
        };

        this.lineWidth = function (line){
            this.recalc();
            return this.target.getExtraChar(line);
        };

        this.recalc = function(){
            if(this.lines > 0 && this.target != null){
                var text = this.target;
                if(text != null){
                    if(this.lines > 0){
                        for(var i = this.startLine + this.lines - 1;i >= this.startLine; i-- ){
                            text.setExtraChar(i, this.font.stringWidth(this.getLine(i)));
                        }
                        this.startLine = this.lines = 0;
                    }
                    this.textWidth = 0;
                    var size = text.getLines();
                    for(var i = 0;i < size; i++){
                        var len = text.getExtraChar(i);
                        if (len > this.textWidth) this.textWidth = len;
                    }
                    this.textHeight = this.font.height * size + (size - 1) * this.getLineIndent();
                }
            }
        };

        this.textUpdated = function(src,b,off,size,ful,updatedLines){
            if (b === false) {
                if(this.lines > 0){
                    var p1 = ful - this.startLine, p2 = this.startLine + this.lines - ful - updatedLines;
                    this.lines = ((p1 > 0) ? p1 : 0) + ((p2 > 0) ? p2 : 0) + 1;
                    this.startLine = Math.min(this.startLine, ful);
                }
                else{
                    this.startLine = ful;
                    this.lines = 1;
                }
                if(this.owner != null) this.owner.invalidate();
            }
            else{
                if(this.lines > 0){
                    if(ful <= this.startLine) this.startLine += (updatedLines - 1);
                    else
                        if(ful < (this.startLine + size)) size += (updatedLines - 1);
                }
                this.invalidate(ful, updatedLines);
            }
        };

        this.invalidate = function(start,size){
            if(size > 0 && (this.startLine != start || size != this.lines)){
                if(this.lines === 0){
                    this.startLine = start;
                    this.lines = size;
                }
                else{
                    var e = this.startLine + this.lines;
                    this.startLine = Math.min(start, this.startLine);
                    this.lines = Math.max(start + size, e) - this.startLine;
                }
                if(this.owner != null) this.owner.invalidate();
            }
        };

        this.getPreferredSize = function(){
            this.recalc();
            return { width:this.textWidth, height:this.textHeight };
        };

        this.paint = function(g,x,y,w,h,d) {
            var ts = g.getTopStack();
            if(ts.width > 0 && ts.height > 0){
                var lineIndent = this.getLineIndent(), lineHeight = this.font.height, lilh = lineHeight + lineIndent;
                w = Math.min(ts.width, w);
                h = Math.min(ts.height, h);
                var startLine = 0;
                if(y < ts.y) {
                    startLine = ~~((lineIndent + ts.y - y) / lilh);
                    h += (ts.y - startLine * lineHeight - startLine * lineIndent);
                }
                else if (y > (ts.y + ts.height)) return;
                var size = this.target.getLines();

                if(startLine < size){
                    var lines =  ~~((h + lineIndent) / lilh) + (((h + lineIndent) % lilh > lineIndent) ? 1 : 0);
                    if(startLine + lines > size) lines = size - startLine;
                    y += startLine * lilh;

                    g.setFont(this.font);
                    if (d == null || d.isEnabled === true){
                        var fg = this.foreground;
                        for(var i = 0;i < lines; i ++ ){
                            this.paintSelection(g, x, y, i + startLine, d);
                            g.setColor(fg);
                            this.paintLine(g, x, y, i + startLine, d);
                            y += lilh;
                        }
                    }
                    else {
                        var c1 = T.get("txt.dc1"), c2 = T.get("txt.dc2");
                        for(var i = 0;i < lines; i++){
                            if(c1 != null){
                                g.setColor(c1);
                                this.paintLine(g, x, y, i + startLine, d);
                            }
                            if(c2 != null){
                                g.setColor(c2);
                                this.paintLine(g, x + 1, y + 1, i + startLine, d);
                            }
                            y += lilh;
                        }
                    }
                }
            }
        };

        this.paintSelection = function(g,x,y,line,d){
            if(zebra.instanceOf(d, pkg.TxtSelectionInfo)){
                var p1 = d.getStartSelection();
                if(p1 != null){
                    var p2 = d.getEndSelection();
                    if ((p1[0] != p2[0] || p1[1] != p2[1]) && line >= p1[0] && line <= p2[0]){
                        var s = this.getLine(line), w = this.lineWidth(line);
                        if(line == p1[0]){
                            var ww = this.font.charsWidth(s, 0, p1[1]);
                            x += ww;
                            w -= ww;
                            if(p1[0] == p2[0]) w -= this.font.charsWidth(s, p2[1], s.length - p2[1]);
                        }
                        else if (line == p2[0]) w = this.font.charsWidth(s, 0, p2[1]);
                        g.setColor(d.selectionColor);
                        g.fillRect(x, y, w === 0 ? 1 : w, this.font.height + this.getLineIndent());
                    }
                }
            }
        };
    },

    function (text) {
        this.foreground = T.get("def.fgcol");
        this.font = zebra.ui.Font.defaultNormal;
        this.$super(zebra.isString(text) ? new zebra.data.Text(text) : text);
    },

    function setText(s) { this.target.setText(s); },
    function setDefBoldFont() { this.setFont(T.get("def.bfn")); },

    function setFont(f){
        var old = this.font;
        if(f != old && (f == null || f.s != old.s)){
            this.font = f;
            this.invalidate(0, this.getLines());
        }
    },

    function setForeground(c){
        if (c != this.foreground && (c == null || !c.equals(this.foreground))) this.foreground = c;
    },

    function equals(o){
        return this.$super(o) && o.getLineIndent() == this.getLineIndent() &&
                                 o.foreground.equals(this.foreground) &&
                                 o.font.equals(this.font);
    }
]);

pkg.PasswordText = Class(pkg.TextRender, [
    function() {  this.$this(new zebra.data.SingleLineTxt("")); },

    function(text){
        this.echo = "*";
        this.$super(text);
    },

    function setEchoChar(ch){
        if(this.echo != ch){
            this.echo = ch;
            if(this.target != null) this.invalidate(0, this.target.getLines());
        }
    },

    function getLine(r){
        var buf = [], ln = this.$super(r);
        for(var i = 0;i < ln.length; i++) buf[i] = this.echo;
        return buf.join('');
    }
]);

pkg.CompositeView = Class(pkg.View, [
    function $prototype() {
        this.left = this.right = this.bottom = this.top = this.height = 0;
    },

    function (){ this.$this([]);  },
    function (v1,v2){ this.$this([v1, v2]); },
    function (args) {
        this.views = [];
        this.width = -1;
        for(var i = 0;i < args.length; i ++) this.add(args[i]);
    },

    function add(v){
        if (v == null) throw new Error("" + v);
        this.views.push(v);
        this.width =  -1;
    },

    function paint(g,x,y,w,h,d) { for(var i = 0;i < this.views.length; i++) this.views[i].paint(g, x, y, w, h, d); },

    function getTop(){
        this.validate();
        return this.top;
    },

    function getLeft(){
        this.validate();
        return this.left;
    },

    function getBottom(){
        this.validate();
        return this.bottom;
    },

    function getRight(){
        this.validate();
        return this.right;
    },

    function getPreferredSize(){
        this.validate();
        return { width:this.width + this.left + this.right,
                 height:this.height + this.top + this.bottom };
    },

    function validate(){
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

pkg.TitledBorder = Class(pkg.Render, [
    function $prototype() {
        this.getTop    = function (){ return this.target.getTop(); };
        this.getLeft   = function (){ return this.target.getLeft(); };
        this.getRight  = function (){ return this.target.getRight(); };
        this.getBottom = function (){ return this.target.getBottom(); };
    },

    function (border){ this.$this(border, L.BOTTOM); },

    function (b, a){
        if(b == null && a != L.BOTTOM && a != L.TOP && a != L.CENTER) throw new Error();
        this.$super(b);
        this.lineAlignment = a;
    },

    function outline(g,x,y,w,h,d) {
        var xx = x + w, yy = y + h;
        if(zebra.instanceOf(d, pkg.TitleInfo)){
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
    },

    function paint(g,x,y,w,h,d){
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
    }
]);

pkg.TileViewRender = Class(pkg.Render, [
    function (v){ this.$super(v); },

    function paint(g,x,y,w,h,d){
        var v = this.target;
        if(v != null){
            var ps = v.getPreferredSize();
            if(ps.width > 0 && ps.height > 0){
                var dx = ~~(w / ps.width) + (w % ps.width > 0 ? 1 : 0),
                    dy = ~~(h / ps.height) + (h % ps.height > 0 ? 1 : 0), xx = 0;
                for(var i = 0;i < dx; i++){
                    var yy = 0;
                    for(var j = 0;j < dy; j++ ){
                        v.paint(g, xx, yy, ps.width, ps.height, d);
                        yy += ps.height;
                    }
                    xx += ps.width;
                }
            }
        }
    },

    function getPreferredSize(){
        var v = this.target;
        return (v != null) ? v.getPreferredSize() : this.$super(this.getPreferredSize);
    }
]);

})(zebra("ui.view"), zebra.Class, zebra.Interface);
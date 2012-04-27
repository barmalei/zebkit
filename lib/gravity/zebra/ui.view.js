(function(pkg, Class, Interface) {

var Dimension = JAVA.awt.Dimension, Color = JAVA.awt.Color, T = zebra.ui, L = zebra.layout;

pkg.TxtSelectionInfo = new Interface();
pkg.TitleInfo        = new Interface();
pkg.ViewProvider     = new Interface();

pkg.View = Class(function($) {       
    $('gap', 2);
     
    $(function paint(g,x,y,d){
        var size = this.getPreferredSize();
        this.paint(g, x, y, size.width, size.height, d);
    });

    $(function getTop()  { return this.gap; });
    $(function getBottom(){ return this.gap; });
    $(function getLeft()  { return this.gap; });
    $(function getRight() { return this.gap; });

    $(function getPreferredSize() { return new Dimension(0,0);});

    this.Abstract(function paint(g,x,y,w,h,d){ });
});

pkg.Render = Class(pkg.View, [
    function (target) { this.setTarget(target); },

    function equals(o){
        var target = this.target;
        return o != null && (o == this || (target == o.target || (target != null && target.equals && target.equals(o.target))));
    },

    function ownerChanged(v) {},
    function targetWasChanged(o,n) {},
    
    function setTarget(o){
        if(this.target != o) {
            var old = this.target;
            this.target = o;
            this.targetWasChanged(old, o);
        }
    }
]);

pkg.CompRender = Class(pkg.Render, [
    function (c){ this.$super(c); },

    function getPreferredSize(){
        var target = this.target;
        return target == null ? this.$super(this.getPreferredSize) : target.getPreferredSize();
    },

    function recalc(){ if (this.target != null) this.target.validate(); },

    function paint(g,x,y,w,h,d){
        var c = this.target;
        if(c != null){
            c.validate();
            var prevW =  -1, prevH = 0;
            if(zebra.ui.getDesktop(c) == null){
                prevW = c.width;
                prevH = c.height;
                c.setSize(w, h);
            }
            var cx = g.clip.x, cy = g.clip.y, cw = g.clip.width, ch = g.clip.height;
            g.translate(x, y);
            T.paintManager.paint(g, c, null);
            g.translate(-x,  -y);
            if(cw > 0 && ch > 0) g.setClip(cx, cy, cw, ch);
            if(prevW >= 0){
                c.setSize(prevW, prevH);
                c.validate();
            }
        }
    }
]);

pkg.Border = Class(pkg.View, function($) {
    var Border = this;
    
    this.RAISED = 1;
    this.SUNKEN = 2;
    this.ETCHED = 3;
    this.SUNKEN2 = 4;
    this.RAISED2 = 5;
    
    $(function (t){ this.$this(t, T.get("br.c1"), T.get("br.c2"), T.get("br.c3")); });

    $(function (t,brightest,middle,darkest) {
        if (t < Border.RAISED && t > Border.RAISED2) throw new IllegalArgumentException();
        this.style = t;
        this.brightest = brightest == null ? Color.white : brightest;
        this.middle = middle == null ? Color.gray : middle;
        this.darkest = darkest == null ? Color.black : darkest;
    });
    
    $(function leftLine(g,x1,y1,x2,y2){
        g.setColor(this.middle);
        switch(this.style)
        {
            case Border.ETCHED:{
                g.drawLine(x1, y1, x1, y2 - 1);
                g.setColor(this.brightest);
                g.drawLine(x1 + 1, y1 + 1, x1 + 1, y2 - 2);
            } break;
            case Border.RAISED2:{
                g.drawLine(x1, y1, x1, y2 - 1);
                x1++;
            }
            case Border.RAISED:{
                g.setColor(this.brightest);
                g.drawLine(x1, y1, x1, y2 - 1);
            } break;
            case Border.SUNKEN2:
            case Border.SUNKEN: {
                g.drawLine(x1, y1, x1, y2 - 1);
                if(this.style == Border.SUNKEN){
                    g.setColor(this.darkest);
                    g.drawLine(x1 + 1, y1 + 1, x1 + 1, y2 - 1);
                }
            } break;
        }
    });

    $(function rightLine(g,x1,y1,x2,y2){
        g.setColor(this.middle);
        switch(this.style)
        {
            case Border.ETCHED:{
                g.drawLine(x2 - 1, y1, x2 - 1, y2 - 1);
                g.setColor(this.brightest);
                g.drawLine(x2, y1 + 1, x2, y2);
            }break;
            case Border.RAISED2:{
                g.drawLine(x2 - 1, y1 + 1, x2 - 1, y2 - 1);
                g.setColor(this.darkest);
                g.drawLine(x2, y1, x2, y2);
            }break;
            case Border.RAISED:{
                g.drawLine(x2, y1, x2, y2);
            }break;
            case Border.SUNKEN2:
            case Border.SUNKEN:{
                g.setColor(this.brightest);
                g.drawLine(x2, y1, x2, y2);
            }break;
        }
    });

    $(function topLine(g,x1,y1,x2,y2){
        g.setColor(this.middle);
        switch(this.style)
        {
            case Border.ETCHED:{
                g.drawLine(x1, y1, x2 - 1, y1);
                g.setColor(this.brightest);
                g.drawLine(x1 + 1, y1 + 1, x2 - 2, y1 + 1);
            }break;
            case Border.RAISED2:{
                g.drawLine(x1, y1, x2 - 1, y1);
                y1 ++ ;
                x1 ++ ;
                x2 -- ;
            }
            case Border.RAISED:{
                g.setColor(this.brightest);
                g.drawLine(x1, y1, x2 - 1, y1);
            }break;
            case Border.SUNKEN2:
            case Border.SUNKEN:{
                g.drawLine(x1, y1, x2 - 1, y1);
                if(this.style == Border.SUNKEN){
                    g.setColor(this.darkest);
                    g.drawLine(x1 + 1, y1 + 1, x2 - 1, y1 + 1);
                }
            }break;
        }
    });

    $(function bottomLine(g,x1,y1,x2,y2){
        g.setColor(this.middle);
        switch(this.style)
        {
            case Border.ETCHED:{
                g.drawLine(x1, y2 - 1, x2 - 1, y2 - 1);
                g.setColor(this.brightest);
                g.drawLine(x1 + 1, y2, x2, y2);
            }break;
            case Border.RAISED2:{
                g.drawLine(x1 + 1, y2 - 1, x2 - 1, y2 - 1);
                g.setColor(this.darkest);
                g.drawLine(x1, y2, x2, y2);
            }break;
            case Border.RAISED:{
                g.drawLine(x1, y2, x2, y2);
            }break;
            case Border.SUNKEN2:
            case Border.SUNKEN:{
                g.setColor(this.brightest);
                g.drawLine(x1, y2, x2, y2);
            } break;
        }
    });
    
    $(function paint(g,x,y,w,h,d){
        var xx = x + w - 1, yy = y + h - 1;
        this.leftLine(g, x, y, xx, yy);
        this.rightLine(g, x, y, xx, yy);
        this.topLine(g, x, y, xx, yy);
        this.bottomLine(g, x, y, xx, yy);
    });
});

pkg.SimpleBorder = Class(pkg.View, function($) {
    var SB = this;
    
    this.SOLID  = 1;
    this.DOTTED = 2;
    this.SPACE  = 4;
    
    $(function() { this.$this(SB.SOLID); });

    $(function(c){ 
        if (c instanceof Color) this.$this(SB.SOLID, c); 
        else this.$this(c, T.get("def.brcol"));
    });

    $(function (t,c) { this.$this(t, c, 1, 0); });
    $(function (t,c,w){ this.$this(t, c, w, 0); });

    $(function (t,c,w,r){
        if (t != SB.DOTTED && t != SB.SOLID && t != SB.SPACE) throw new IllegalArgumentException();
        this.style  = t;
        this.color  = (c == null ? Color.gray : c);
        this.width  = w;
        this.radius = r;
        this.gap = this.width + Math.round(this.radius/4);
    });

    $(function paint(g,x,y,w,h,d){
        if (this.style == SB.SPACE) return;
        
        var ps = g.target.lineWidth, r = this.radius, wd = this.width;
        g.target.lineWidth = wd;
        g.setColor(this.color);
        if (this.style == SB.SOLID) {
            var ctx = g.target, dt = wd / 2, xx = x + w - dt, yy = y + h - dt;
            x += dt;
            y += dt;
            ctx.beginPath();
            ctx.moveTo(x - 1 + r, y);
            ctx.lineTo(xx - r, y);
            if (r > 0) ctx.quadraticCurveTo(xx, y, xx, y + r);
            ctx.lineTo(xx, yy  - r);
            if (r > 0) ctx.quadraticCurveTo(xx, yy, xx - r, yy);
            ctx.lineTo(x + r, yy);
            if (r > 0) ctx.quadraticCurveTo(x, yy, x, yy - r);
            ctx.lineTo(x, y + r);
            if (r > 0) ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.stroke();
        }
        else
        if (this.style == SB.DOTTED) g.drawDottedRect(x, y, w, h);
        g.target.lineWidth = ps;
    });
});

pkg.Fill = Class(pkg.Render, [
    function (r,g,b) { this.$super(new Color(r, g, b)); },

    function (c){ 
		if(c == null) throw new IllegalArgumentException("" + c);
		this.$super(c);
    },

	function paint(g,x,y,w,h,d) {
        g.setColor(this.target);
        g.fillRect(x, y, w, h);
    }
]);

for(var k in Color) {
    var c = Color[k];
    if (c instanceof Color) pkg.Fill[k] = new pkg.Fill(c);
}

pkg.Gradient = Class(pkg.Fill, [
    function (c1,c2) { this.$this(c1, c2, L.VERTICAL); },

    function (c1,c2,orientation){
        this.$super(c1);
        this.orientation = orientation;
        this.endColor = c2;
        this.gradient = null;
    },

    function paint(gr,x,y,w,h,d){
        var ctx = gr.target, p = ctx.fillStyle, d = (this.orientation == L.HORIZONTAL? [0,1]: [1,0]);
        var x1 = x*d[1], y1 = y * d[0], x2 = (x + w - 1) * d[1], y2 = (y + h - 1) * d[0];
        if (this.gradient == null || this.gx1 != x1 ||  this.gx2 != x2 || this.gy1 != y1 || this.gy2 != y2) {
            this.gx1 = x1;
            this.gx2 = x2;
            this.gy1 = y1;
            this.gy2 = y2;
            this.gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            this.gradient.addColorStop(0, this.target.s);  
            this.gradient.addColorStop(1, this.endColor.s);
        }
        
        ctx.fillStyle = this.gradient;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = p;
    }
]);

pkg.ImgRender = Class(pkg.Render, [
    function (img) { this.$this(img,0,0,0,0);  },

    function (img,x,y,w,h){
        this.$super(zebra.isString(img) ? zebra.ui.getImage(img) : img);
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    },

    function paint(g,x,y,w,h,d){
        if(this.target != null){
            if(this.width > 0) 
                g.drawImage(this.target, x, y, x + w, y + h, this.x, this.y, this.x + this.width, this.y + this.height);
            else 
                g.drawImage(this.target, x, y, w, h);
        }
    },

    function getPreferredSize(){
        var img = this.target;
        return img == null ? this.$super(this.getPreferredSize) 
                           : (this.width > 0) ? new Dimension(this.width, this.height) : new Dimension(img.width, img.height);
    },

    function equals(o){
        return this.$super(this.equals,o) && o.width  == this.width && 
                                             o.height == this.height && 
                                             o.x      == this.x && 
                                             o.y      == this.y;
    }
]);

var PositionMetric = zebra.util.Position.PositionMetric, TextModelListener = zebra.data.TextModelListener;
pkg.TextRender = Class(pkg.Render, PositionMetric, TextModelListener, [
    function (text) { 
        this.textWidth = this.textHeight = this.startLine = this.lines = 0;
        this.foreground = T.get("def.fgcol"); 
        this.font = JAVA.awt.Font.defaultNormal;
        this.owner = null;
        this.$super(zebra.isString(text) ? new zebra.data.Text(text) : text); 
    },
    
    function setText(s) { this.target.setText(s); },
    function getLineHeight()  { return this.font.getHeight(); },
    function setDefBoldFont() { this.setFont(T.get("def.bfn")); },

    function setFont(f){
        var old = this.font;
        if(f != old && (f == null || !f.equals(old))){
            this.font = f;
            this.invalidate(0, this.getLines());
        }
    },

    function getOwner(){ return this.owner; },
    function setForeground(c){ if (c != this.foreground && (c == null || !c.equals(this.foreground))) this.foreground = c; },
    function getLineIndent(){ return 1; },
    function getLines() { return this.target.getLines(); },
    function getLineSize(l){ return this.target.getLine(l).length + 1; },
    function getMaxOffset(){ return this.target.getTextLength();},
    function ownerChanged(v) { this.owner = v; },
    function paintLine(g,x,y,line,d){ g.drawString(this.getLine(line), x, y + this.font.getAscent()); },

    function targetWasChanged(o,n){
        if(o != null) o.removeTextModelListener(this);
        if(n != null){
            n.addTextModelListener(this);
            this.invalidate(0, this.getLines());
        }
        else this.lines = 0;
    },

    function getPreferredSize(){
        this.recalc();
        return new Dimension(this.textWidth, this.textHeight);
    },

    function getText(){
        var text = this.target;
        return text == null ? null : text.getText();
    },

    function recalc(){
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
                    if(len > this.textWidth) this.textWidth = len;
                }
                this.textHeight = this.getLineHeight() * size + (size - 1) * this.getLineIndent();
            }
        }
    },

    function textUpdated(src,id,off,size,ful,updatedLines){
        if(id == TextModelListener.REMOVED){
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
    },

    function invalidate(start,size){
        if(size > 0 && (this.startLine != start || size != this.lines)){
            if(this.lines == 0){
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
    },

    function paint(g,x,y,w,h,d){
        var clip = g.clip; //!!!!????g.getClipBounds();
        if(clip != null){
            var lineIndent = this.getLineIndent(), lineHeight = this.getLineHeight(), lilh = lineHeight + lineIndent;
            w = Math.min(clip.width, w);
            h = Math.min(clip.height, h);
            var startLine = 0;
            if(y < clip.y){
                startLine =  Math.floor((lineIndent + clip.y - y) / lilh);
                h += (clip.y - startLine * lineHeight - startLine * lineIndent);
            }
            else if(y > (clip.y + clip.height)) return ;
            var size = this.target.getLines();                
            
            if(startLine < size){
                var lines =  Math.floor((h + lineIndent) / lilh) + (((h + lineIndent) % lilh > lineIndent) ? 1 : 0);
                if(startLine + lines > size) lines = size - startLine;
                y += startLine * lilh;                    
                
                g.setFont(this.font);
                if(this.isEnabledMode(d)){
                    var fg = this.foreground;
                    for(var i = 0;i < lines; i ++ ){
                        this.paintSelection(g, x, y, i + startLine, d);
                        g.setColor(fg);
                        this.paintLine(g, x, y, i + startLine, d);
                        y += lilh;
                    }
                }
                else{
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
    },

    function isEnabledMode(target){return target == null || target.isEnabled;},
    function getLine(r){ return this.target.getLine(r); },

    function lineWidth(line){
        this.recalc();
        return this.target.getExtraChar(line);
    },

    function equals(o){
        return this.$super(this.equals,o) && o.getLineIndent() == this.getLineIndent() && 
                                             o.foreground.equals(this.foreground) && 
                                             o.font.equals(this.font);
    },

    function paintSelection(g,x,y,line,d){
        if(zebra.instanceOf(d, pkg.TxtSelectionInfo)){
            var p1 = d.getStartSelection();
            if(p1 != null){
                var p2 = d.getEndSelection();
                if( !p1.equals(p2) && line >= p1.x && line <= p2.x){
                    var s = this.getLine(line), w = this.lineWidth(line);
                    if(line == p1.x){
                        var ww = this.font.charsWidth(s, 0, p1.y);
                        x += ww;
                        w -= ww;
                        if(p1.x == p2.x) w -= this.font.charsWidth(s, p2.y, s.length - p2.y);
                    }
                    else if(line == p2.x) w = this.font.charsWidth(s, 0, p2.y);
                    g.setColor(d.selectionColor);
                    g.fillRect(x, y, w == 0 ? 1 : w, this.getLineHeight() + this.getLineIndent());
                }
            }
        }
    }
]);


pkg.ZebraTextRender = Class(pkg.TextRender, [
    
    function (text) { this.$super(text); },
    
    function paintLine(g,x,y,line,d)  { 
        var ctx = g.target;
        
        // inspired by - http://www.webdesignerwall.com/demo/css-gradient-text/
//        var text = "Sleek Zebra...";
  //      var font = "100px Futura, Helvetica, sans-serif";

        // save state
        ctx.save();
        ctx.font = this.font.s;
        ctx.fillStyle = "red";

        // getMetrics calculates:
        // width + height of text-block
        // top + middle + bottom baseline
        //var metrics = getMetrics(text, font);
        var offsetRefectionY = -20;

        // throwing a linear-gradient in to shine up the text
        var gradient = ctx.createLinearGradient(0, y, 0, y + this.lineWidth(line));
        gradient.addColorStop(0.1, '#000');
        gradient.addColorStop(0.35, '#fff');
        gradient.addColorStop(0.65, '#fff');
        gradient.addColorStop(1.0, '#000');
//        ctx.fillStyle = gradient
        ctx.fillText(this.getLine(line), x, y + this.font.getAscent());

        // draw reflected text
        // ctx.save();
        // ctx.globalCompositeOperation = "source-over";
        // ctx.translate(0, this.font.height + offsetRefectionY)
        // ctx.scale(1, -1);
        // ctx.font = font;
        // ctx.fillStyle = "#fff";
        // ctx.fillText(line, x, -this.font.height - y + metrics.top);
        // ctx.scale(1, -1);

        //cut the gradient out of the reflected text 
        // ctx.globalCompositeOperation = "destination-out";
        // var gradient = ctx.createLinearGradient(0, y, 0, this.font.height + y);
        // gradient.addColorStop(0.0, 'rgba(0,0,0,0.65)');
        // gradient.addColorStop(1.0, '#000');
        // ctx.fillStyle = gradient;
        // ctx.fillRect(offsetX, offsetY, metrics.width, this.font.height);

        // restore back to original transform state
        ctx.restore();

        // using source-atop to allow the transparent .png to show through to the gradient
    //    ctx.globalCompositeOperation = "source-atop";

        // creating pattern from <image> sourced.
      //  ctx.fillStyle = ctx.createPattern(image, 'repeat');

        // fill the height of two em-boxes, to encompass both normal and reflected state
    //    ctx.fillRect(x, y, metrics.width, metrics.height * 2);
       // ctx.restore();
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
        var buf = [], ln = this.$super(this.getLine,r);
        for(var i = 0;i < ln.length; i ++ ) buf[i] = this.echo;
        return buf.join('');
    }
]);

pkg.CompositeView = Class(pkg.View, [
    function (){ this.$this([]);  },
    function (v1,v2){ this.$this([v1, v2]); },
    function (args) { 
        this.left = this.right = this.bottom = this.top = this.height = 0;
        this.views = [];
        this.width = -1;
        for(var i = 0;i < args.length; i ++ ) this.add(args[i]); 
    },

    function add(v){
        if (zebra.isString(v)) v = T.get(v);
        if (v == null) throw new IllegalArgumentException("" + v);
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
        return new Dimension(this.width + this.left + this.right, this.height + this.top + this.bottom);
    },

    function validate(){
        if(this.width < 0){
            this.top = this.bottom = this.left = this.right = this.width = this.height = 0;
            for(var i = 0;i < this.views.length; i ++ ){
                var s = this.views[i], ps = s.getPreferredSize();
                this.width  = Math.max(this.width, ps.width);
                this.height = Math.max(this.height, ps.height);
                this.top = Math.max(this.top, s.getTop());
                this.left = Math.max(this.left, s.getLeft());
                this.bottom = Math.max(this.bottom, s.getBottom());
                this.right = Math.max(this.right, s.getRight());
            }
        }
    }
]);

pkg.ViewSet = Class(pkg.View, [
    function () { 
        this.views = [];
        this.height = -1;
        this.activeView = null;
    },

    function (args){
        this.$this();
        for(var i = 0;i < args.length; i += 2) this.put(args[i], args[i+1]);
    },

    function put(id){ return this.put(id, id); },

    function put(id, v){
        if (zebra.isString(v)) {
            v = T.get(v);
            if (v == null) return false;
        }

        var i = this.indexOf(id);
        if(i < 0){
            if(v == null) throw new IllegalArgumentException("id = " + id + ", value = " + v);
            this.views.push(id);
            this.views.push(v);
        }
        else{
            if(v == null) this.views.splice(i-1, 2);
            else this.views[i] = v;
        }
        this.width =  -1;
        return true;
    },

    function getView(id){
        if (zebra.isNumber(id)) return this.views[id * 2 + 1]; 
        var i = this.indexOf(id);
        return i < 0 ? null : this.views[i];
    },

    function paint(g,x,y,w,h,d){ if(this.activeView != null) this.activeView.paint(g, x, y, w, h, d); },
    function getTop() { return this.activeView.getTop(); },
    function getLeft(){ return this.activeView.getLeft(); },
    function getBottom(){ return this.activeView.getBottom(); },
    function getRight(){ return this.activeView.getRight(); },

    function getPreferredSize(){
        if(this.width < 0){
            this.width = this.height = 0;
            if(this.views.length > 0){
                for(var i = 0;i < Math.round(this.views.length / 2); i ++ ){
                    var s = this.getView(i);
                    if(s != null){
                        var ps = s.getPreferredSize();
                        this.width = Math.max(this.width, ps.width);
                        this.height = Math.max(this.height, ps.height);
                    }
                }
            }
        }
        return new Dimension(this.width, this.height);
    },

    function indexOf(id){
        if(id == null) throw new IllegalArgumentException("3001");
        for(var i = 0;i < this.views.length; i += 2) if (id === this.views[i]) return i + 1;
        return -1;
    },

    function activate(id){
        var old = this.activeView;
        this.activeView = this.getView(id);
        return this.activeView != old;
    }
]);

pkg.TitledBorder = Class(pkg.View, [
    function (border){ this.$this(border, L.BOTTOM); },

    function (b, a){
        if(b == null && a != L.BOTTOM && a != L.TOP && a != L.CENTER) throw new IllegalArgumentException("3002");
        this.lineAlignment = a;
        this.render = b;
    },

    function paint(g,x,y,w,h,d){
        if(zebra.instanceOf(d, pkg.TitleInfo)){
            var r = d.getTitleBounds();
            if(r != null) {
                var xx = x + w, yy = y + h, o = d.orient, ctx = g.target;
                ctx.save();
                ctx.beginPath();

                var br = (o == L.RIGHT), bb = (o == L.BOTTOM),  dt = (bb || br) ? -1 : 1;
                if (bb || o == L.TOP) {
                    var sy = y, syy = yy, cy = 0 ;
                    switch(this.lineAlignment) {
                        case L.CENTER : cy = r.y + Math.floor(r.height / 2); break;
                        case L.TOP    : cy = r.y + (bb?1:1) *(r.height - 1); break;
                        case L.BOTTOM : cy = r.y + (bb?0:1) *(r.height - 1); break;
                    }
              
                    if (bb) { 
                        sy  = yy;
                        syy = y;
                    }
                
                    ctx.moveTo(r.x + 1, sy);
                    ctx.lineTo(r.x + 1, r.y + dt * (r.height + 10));
                    ctx.lineTo(r.x + r.width - 1, r.y + dt * (r.height + 10));
                    ctx.lineTo(r.x + r.width - 1, sy);
                    ctx.lineTo(xx, sy);
                    ctx.lineTo(xx, syy);
                    ctx.lineTo(x, syy);        
                    ctx.lineTo(x, sy);
                    ctx.lineTo(r.x, sy);
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
                        case L.CENTER : cx = r.x + Math.floor(r.width / 2); break;
                        case L.TOP    : cx = r.x + (br?1:0) *(r.width - 1); break;
                        case L.BOTTOM : cx = r.x + (br?0:1) *(r.width - 1); break;
                    }

                    ctx.moveTo(sx, r.y);
                    ctx.lineTo(r.x + dt * (r.width + 10), r.y);
                    ctx.lineTo(r.x + dt * (r.width + 10), r.y + r.height - 1);
                    ctx.lineTo(sx, r.y + r.height - 1);
                    ctx.lineTo(sx, yy);
                    ctx.lineTo(sxx, yy);
                    ctx.lineTo(sxx, y);
                    ctx.lineTo(sx, y);
                    ctx.lineTo(sx, r.y);
                    if (br)  xx = cx;
                    else     x  = cx;
                }
                ctx.clip();
                this.render.paint(g, x, y, xx - x, yy - y, d);
                ctx.restore();
            }
        }
        else this.render.paint(g, x, y, w, h, d);
    },

    function getTop(){ return this.render.getTop(); },
    function getLeft(){ return this.render.getLeft(); },
    function getRight(){ return this.render.getRight(); },
    function getBottom(){ return this.render.getBottom(); }
]);

pkg.TileViewRender = Class(pkg.Render, [
    function (v){ this.$super(v); },

    function paint(g,x,y,w,h,d){
        var v = this.target;
        if(v != null){
            var ps = v.getPreferredSize();
            if(ps.width > 0 && ps.height > 0){
                var dx = Math.floor(w / ps.width) + (w % ps.width > 0 ? 1 : 0); 
                var dy = Math.floor(h / ps.height) + (h % ps.height > 0 ? 1 : 0), xx = 0;
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
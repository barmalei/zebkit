(function(pkg, Class, Interface) {

/**
 * @module  ui
 */

pkg.ExternalEditor = Interface();

var MB = zebra.util,Composite = pkg.Composite, ME = pkg.MouseEvent, MouseListener = pkg.MouseListener,
    Cursor = pkg.Cursor, TextModel = zebra.data.TextModel, View = pkg.View, Listeners = zebra.util.Listeners,
    Actionable = zebra.util.Actionable, KE = pkg.KeyEvent, L = zebra.layout, instanceOf = zebra.instanceOf,
    timer = zebra.util.timer, KeyListener = pkg.KeyListener, ChildrenListener = pkg.ChildrenListener,
    $invalidA = "Invalid alignment",
    $invalidO = "Invalid orientation",
    $invalidC = "Invalid constraints";

pkg.$ViewsSetter = function (v){
    this.views = {};
    for(var k in v) {
        if (v.hasOwnProperty(k)) this.views[k] = pkg.$view(v[k]);
    }
    this.vrp();
};

/**
 *  Mouse wheel support class. Installs necessary mouse wheel
 *  listeners and handles mouse wheel events in zebra UI. The 
 *  mouse wheel support is plugging that is configured by a 
 *  JSON configuration. 
 *  @class zebra.ui.MouseWheelSupport
 *  @constructor
 */
pkg.MouseWheelSupport = Class([
    function $prototype() {
        /**
         * Mouse wheel handler 
         * @param  {MouseWheelEvent} e DOM mouse event object 
         * @method mouseWheelMoved
         */
        this.mouseWheelMoved = function(e){
            var owner = pkg.$mouseMoveOwner;
            while (owner != null && instanceOf(owner, pkg.ScrollPan) === false) {
                owner = owner.parent;
            }

            if (owner != null) {
                var d = [0, 0];
                d[0] = (e.detail? e.detail : e.wheelDelta/120);
                if (e.axis) {
                    if (e.axis === e.HORIZONTAL_AXIS) {
                        d[1] = d[0];
                        d[0] = 0;
                    }
                }

                if (d[0] > 1) d[0] = ~~(d[0]/3);
                if (zebra.isIE || zebra.isChrome || zebra.isSafari) d[0] = -d[0];

                for(var i=0; i < 2; i++) {
                    if (d[i] !== 0) {
                        var bar = i === 0 ? owner.vBar : owner.hBar;
                        if (bar && bar.isVisible) bar.position.setOffset(bar.position.offset + d[i]*bar.pageIncrement);
                    }
                }
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
            }
        };
    },

    /**
     * Setup mouse wheel support for the specified "zebra.ui.zCanvas" 
     * component
     * @param  {zebra.ui.zCanvas} canvas a zebra zCanvas UI component
     * @method setup
     */
    function setup(canvas) {
        if (canvas == null) {
            throw new Error("Null canvas");
        }

        var $this = this;
        canvas.canvas.addEventListener ("mousewheel",
                                        function(e) {
                                            $this.mouseWheelMoved(e);
                                        }, false);
        canvas.canvas.addEventListener ("DOMMouseScroll",
                                        function(e) {
                                            $this.mouseWheelMoved(e);
                                        }, false);
    }
]);

/**
 *  UI component render class. Renders the given target UI component
 *  on the given surface using the specified 2D context
 *  @param {zebra.ui.Panel} [target] an UI component to be rendered
 *  @class zebra.ui.CompRender
 *  @constructor
 *  @extends zebra.ui.Render
 */
pkg.CompRender = Class(pkg.Render, [
    function $prototype() {
        this.getPreferredSize = function(){
            return this.target == null ? { width:0, height:0 }
                                       : this.target.getPreferredSize();
        };

        this.paint = function(g,x,y,w,h,d){
            var c = this.target;
            if (c != null) {
                c.validate();
                var prevW =  -1, prevH = 0, cx = x - c.x, cy = y - c.y;
                if (c.getCanvas() == null){
                    prevW = c.width;
                    prevH = c.height;
                    c.setSize(w, h);
                }

                g.translate(cx, cy);
                pkg.paintManager.paint(g, c);
                g.translate(-cx,  -cy);
                if (prevW >= 0){
                    c.setSize(prevW, prevH);
                    c.validate();
                }
            }
        };
    }
]);

/**
 * Line UI component class
 * @constructor
 * @param {Integer} [orient] an orientation of the line. One of
 * the following value can be used:
 
        zebra.layout.VERTICAL
        zebra.layout.HORIZONTAL

 * @class zebra.ui.Line
 * @extends {zebra.ui.Panel}
 */
pkg.Line = Class(pkg.Panel, [
    function (){
        this.$this(L.VERTICAL);
    },

    function (orient){
        orient = L.$constraints(orient);
        if (orient != L.HORIZONTAL && orient != L.VERTICAL) {
            throw new Error($invalidO);
        }

        /**
         * Line orientation
         * @attribute orient
         * @type {Integer}
         * @readOnly
         * @default zebra.layout.VERTICAL
         */
        this.orient = orient;
        
        this.$super();
    },

    function $prototype() {
        /**
         * Line width 
         * @attribute lineWidth
         * @type {Integer}
         * @default 1
         */
        this.lineWidth = 1;

        /**
         * Line color 
         * @attribute lineWidth
         * @type {String}
         * @default black
         */
        this.lineColor = "black";

        this.paint = function(g) {
            g.setColor(this.lineColor);
            if (this.orient == L.HORIZONTAL) {
                var yy = this.top + ~~((this.height - this.top - this.bottom - 1) / 2);
                g.drawLine(this.left, yy, this.width - this.right - this.left, yy, this.lineWidth);
            }
            else {
                var xx = this.left + ~~((this.width - this.left - this.right - 1) / 2);
                g.drawLine(xx, this.top, xx, this.height - this.top - this.bottom, this.lineWidth);
            }
        };

        this.getPreferredSize = function() {
            return { width:this.lineWidth, height:this.lineWidth };
        };
    }
]);

/**
 * Text render that expects and draws a text model or a string as its target
 * @class zebra.ui.TextRender
 * @constructor 
 * @extends zebra.ui.Render
 * @param  {String|zebra.data.TextModel} text a text as string or text model object
 */
pkg.TextRender = Class(pkg.Render, zebra.util.Position.Metric, [
    function $prototype() {
        /**
         * UI component that holds the text render
         * @attribute owner
         * @default null
         * @readOnly
         * @protected
         * @type {zebra.ui.Panel}
         */
        this.owner = null;

        /**
         * Get a line indent 
         * @default 1
         * @return {Integer} line indent
         * @method getLineIndent
         */
        this.getLineIndent = function() {
            return 1;
        };

        /**
         * Get number of lines of target text
         * @return   {Integer} a number of line in the target text
         * @method getLines
         */
        this.getLines = function() {
            return this.target.getLines();
        };

        this.getLineSize   = function(l) {
            return this.target.getLine(l).length + 1;
        };

        /**
         * Get the given line height in pixels
         * @param {Integer} l a line number
         * @return {Integer} a line height in pixels
         * @method getLineHeight
         */
        this.getLineHeight = function(l) {
            return this.font.height;
        };

        this.getMaxOffset  = function() {
            return this.target.getTextLength();
        };
        
        /**
         * Called whenever an owner UI component has been changed
         * @param  {zebra.ui.Panel} v a new owner UI component
         * @method ownerChanged
         */
        this.ownerChanged  = function(v) {
            this.owner = v;
        };
        
        /**
         * Paint the specified text line
         * @param  {2DContext} g graphical 2D context
         * @param  {Integer} x x coordinate
         * @param  {Integer} y y coordinate
         * @param  {Integer} line a line number
         * @param  {zebra.ui.Panel} d an UI component on that the line has to be rendered
         * @method paintLine
         */
        this.paintLine = function(g,x,y,line,d) { 
            g.fillText(this.getLine(line), x, y + this.font.ascent);
        };
        
        /**
         * Get text line by the given line number
         * @param  {Integer} r a line number
         * @return {String} a text line
         * @method getLine
         */
        this.getLine = function(r) {
            return this.target.getLine(r);
        };

        this.targetWasChanged = function(o,n){
            if (o != null) o._.remove(this);
            if (n != null) {
                n._.add(this);
                this.invalidate(0, this.getLines());
            }
            else this.lines = 0;
        };

        /**
         * Get the rendered target text as string object
         * @return {String} rendered text
         * @method getValue
         */
        this.getValue = function(){
            var text = this.target;
            return text == null ? null : text.getValue();
        };

        /**
         * Get the given text line width in pixels
         * @param  {Integer} line a text line number
         * @return {Inetger} a text line width in pixels
         * @method lineWidth
         */
        this.lineWidth = function(line){
            this.recalc();
            return this.target.getExtraChar(line);
        };

        /**
         * Called every time the target text metrics has to be recalculated
         * @method recalc
         */
        this.recalc = function(){
            if (this.lines > 0 && this.target != null){
                var text = this.target;
                if (text != null) {
                    if (this.lines > 0) {
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
                    this.textHeight = this.getLineHeight() * size + (size - 1) * this.getLineIndent();
                }
            }
        };

        /**
         * Text model update listener handler 
         * @param  {zebra.data.TextModel} src text model object
         * @param  {Boolean} b 
         * @param  {Integer} off an offset starting from that 
         * the text has been updated 
         * @param  {Integer} size a size (in character) of text part that 
         * has been updated 
         * @param  {Integer} ful a first affected by the given update line
         * @param  {Integer} updatedLines a number of text lines that have 
         * been affected by text updating 
         * @method textUpdated
         */
        this.textUpdated = function(src,b,off,size,ful,updatedLines){
            if (b === false) {
                if (this.lines > 0) {
                    var p1 = ful - this.startLine, 
                        p2 = this.startLine + this.lines - ful - updatedLines;
                    this.lines = ((p1 > 0) ? p1 : 0) + ((p2 > 0) ? p2 : 0) + 1;
                    this.startLine = this.startLine < ful ? this.startLine : ful;
                }
                else {
                    this.startLine = ful;
                    this.lines = 1;
                }
                if (this.owner != null) this.owner.invalidate();
            }
            else {
                if (this.lines > 0){
                    if (ful <= this.startLine) this.startLine += (updatedLines - 1);
                    else {
                        if (ful < (this.startLine + size)) size += (updatedLines - 1);
                    }
                }
                this.invalidate(ful, updatedLines);
            }
        };

        /**
         * Invalidate metrics for the specified range of lines. 
         * @param  {Integer} start first line to be invalidated
         * @param  {Integer} size  number of lines to be invalidated 
         * @method invalidate
         * @private
         */
        this.invalidate = function(start,size){
            if (size > 0 && (this.startLine != start || size != this.lines)) {
                if (this.lines === 0){
                    this.startLine = start;
                    this.lines = size;
                }
                else {
                    var e = this.startLine + this.lines;
                    this.startLine = start < this.startLine ? start : this.startLine;
                    this.lines     = Math.max(start + size, e) - this.startLine;
                }

                if (this.owner != null) {
                    this.owner.invalidate();
                }
            }
        };

        this.getPreferredSize = function(){
            this.recalc();
            return { width:this.textWidth, height:this.textHeight };
        };

        this.paint = function(g,x,y,w,h,d) {
            var ts = g.getTopStack();
            if (ts.width > 0 && ts.height > 0) {
                var lineIndent = this.getLineIndent(),
                    lineHeight = this.getLineHeight(),
                    lilh       = lineHeight + lineIndent,
                    startLine  = 0;

                w = ts.width  < w ? ts.width  : w;
                h = ts.height < h ? ts.height : h;

                if (y < ts.y) {
                    startLine = ~~((lineIndent + ts.y - y) / lilh);
                    h += (ts.y - startLine * lineHeight - startLine * lineIndent);
                }
                else {
                    if (y > (ts.y + ts.height)) return;
                }

                var size = this.target.getLines();
                if (startLine < size){
                    var lines =  ~~((h + lineIndent) / lilh) + (((h + lineIndent) % lilh > lineIndent) ? 1 : 0);
                    if (startLine + lines > size) {
                        lines = size - startLine;
                    }
                    y += startLine * lilh;

                    g.setFont(this.font);
                    if (d == null || d.isEnabled === true){
                        g.setColor(this.color);
                        for(var i = 0;i < lines; i++){
                            if (d && d.getStartSelection) {
                                var p1 = d.getStartSelection();
                                if (p1 != null){
                                    var p2 = d.getEndSelection(), line = i + startLine;
                                    if ((p1[0] != p2[0] || p1[1] != p2[1]) && line >= p1[0] && line <= p2[0]){
                                        var s = this.getLine(line), lw = this.lineWidth(line), xx = x;
                                        if (line == p1[0]) {
                                            var ww = this.font.charsWidth(s, 0, p1[1]);
                                            xx += ww;
                                            lw -= ww;
                                            if (p1[0] == p2[0]) {
                                                lw -= this.font.charsWidth(s, p2[1], s.length - p2[1]);
                                            }
                                        }
                                        else {
                                            if (line == p2[0]) lw = this.font.charsWidth(s, 0, p2[1]);
                                        }
                                        this.paintSelection(g, xx, y, lw === 0 ? 1 : lw, lilh, line, d);

                                        // restore foreground color after selection has been rendered
                                        g.setColor(this.color);
                                    }
                                }
                            }

                            this.paintLine(g, x, y, i + startLine, d);
                            y += lilh;
                        }
                    }
                    else {
                        for(var i = 0;i < lines; i++) {
                            if (pkg.disabledColor1 != null){
                                g.setColor(pkg.disabledColor1);
                                this.paintLine(g, x, y, i + startLine, d);
                            }
                            if (pkg.disabledColor2 != null){
                                g.setColor(pkg.disabledColor2);
                                this.paintLine(g, x + 1, y + 1, i + startLine, d);
                            }
                            y += lilh;
                        }
                    }
                }
            }
        };

        /**
         * Paint the specified text selection of the given line. The area 
         * where selection has to be rendered is denoted with the given
         * rectangular area.
         * @param  {2DContext} g a canvas graphical context
         * @param  {Integer} x a x coordinate of selection rectangular area  
         * @param  {Integer} y a y coordinate of selection rectangular area  
         * @param  {Integer} w a width of of selection rectangular area  
         * @param  {Integer} h a height of of selection rectangular area  
         * @param  {Integer} line [description]
         * @param  {zebra.ui.Panel} d a target UI component where the text 
         * is rendered
         * @protected
         * @method paintSelection
         */
        this.paintSelection = function(g, x, y, w, h, line, d){
            g.setColor(d.selectionColor);
            g.fillRect(x, y, w, h);
        };

        /**
         * Set the text model content 
         * @param  {String} s a text as string object
         * @method setValue
         */
        this.setValue = function (s) {
            this.target.setValue(s);
        };

        /**
         * Set the rendered text font.  
         * @param  {String|zebra.ui.Font} f a font as CSS string or zebra.ui.Font class instance 
         * @method setFont
         */
        this.setFont = function(f){
            var old = this.font;
            if (f && zebra.isString(f)) f = new pkg.Font(f);
            if (f != old && (f == null || f.s != old.s)){
                this.font = f;
                this.invalidate(0, this.getLines());
            }
        };

        /**
         * Set rendered text color 
         * @param  {String} c a text color
         * @method setColor
         */
        this.setColor = function(c){
            if (c != this.color) {
                this.color = c;
                return true;
            }
            return false;
        };

        // speed up constrcutor by abvoiding super execution since 
        // text render is one of the most used class
        this[''] = function(text) {
        /**
         * Text color
         * @attribute color
         * @type {String}
         * @default zebra.ui.fontColor
         * @readOnly
         */
        this.color = pkg.fontColor;

        /**
         * Text font
         * @attribute font
         * @type {String|zebra.ui.Font}
         * @default zebra.ui.font
         * @readOnly
         */
        this.font  = pkg.font;

        this.textWidth = this.textHeight = this.startLine = this.lines = 0;
        //!!!
        //!!! since text is widely used structure we do slight hack - don't call parent constructor
        //!!!
        this.setTarget(zebra.isString(text) ? new zebra.data.Text(text) : text);
        };
    }
]);

pkg.BoldTextRender = Class(pkg.TextRender, [
    function(t) {
        this.$super(t);
        this.setFont(pkg.boldFont);
    }
]);

/**
 * Password text render class. This class renders a secret text with hiding it with the given character. 
 * @param {String|zebra.data.TextModel} [text] a text as string or text model instance
 * @class zebra.ui.PasswordText
 * @constructor
 * @extends zebra.ui.TextRender
 */
pkg.PasswordText = Class(pkg.TextRender, [
    function() {  this.$this(new zebra.data.SingleLineTxt("")); },

    function(text){
        /**
         * Echo character that will replace characters of hidden text 
         * @attribute echo
         * @type {String}
         * @readOnly
         * @default "*"
         */
        this.echo = "*";

        /**
         * Indicates if the last entered character doesn't have to be replaced with echo character  
         * @type {Boolean}
         * @attribute showLast
         * @default true
         * @readOnly
         */
        this.showLast = true;
        this.$super(text);
    },

    /**
     * Set the specified echo character. The echo character is used to hide secret text.
     * @param {String} ch an echo character
     * @method setEchoChar
     */
    function setEchoChar(ch){
        if(this.echo != ch){
            this.echo = ch;
            if(this.target != null) this.invalidate(0, this.target.getLines());
        }
    },

    function getLine(r){
        var buf = [], ln = this.$super(r);
        for(var i = 0;i < ln.length; i++) buf[i] = this.echo;
        if (this.showLast && ln.length > 0) buf[ln.length-1] = ln[ln.length-1];
        return buf.join('');
    }
]);

pkg.TabBorder = Class(View, [
    function(t) {
        this.$this(t, 1);
    },

    function(t, w){
        this.type  = t;
        this.gap   = 4 + w;
        this.width = w;

        this.onColor1 = pkg.palette.black;
        this.onColor2 = pkg.palette.gray5;
        this.offColor = pkg.palette.gray1;

        this.fillColor1 = "#DCF0F7";
        this.fillColor2 =  pkg.palette.white;
        this.fillColor3 = pkg.palette.gray7;
    },

    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            var xx = x + w - 1, yy = y + h - 1, o = d.parent.orient, t = this.type, s = this.width,  dt = s / 2;

            if (d.isEnabled){
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
                default: throw new Error("Invalid tab orientation");
            }
        };

        this.getTop    = function (){ return 3; };
        this.getBottom = function (){ return 2;};
    }
]);

pkg.TitledBorder = Class(pkg.Render, [
    function $prototype() {
        this.getTop    = function (){ return this.target.getTop(); };
        this.getLeft   = function (){ return this.target.getLeft(); };
        this.getRight  = function (){ return this.target.getRight(); };
        this.getBottom = function (){ return this.target.getBottom(); };

        this.outline = function (g,x,y,w,h,d) {
            var xx = x + w, yy = y + h;
            if (d.getTitleInfo) {
                var r = d.getTitleInfo();
                if (r != null) {
                    var o = r.orient, cx = x, cy = y;

                    if (o == L.BOTTOM || o == L.TOP) {
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

            if (this.target && this.target.outline) {
                return this.target.outline(g, x, y, xx - x, yy - y, d);
            }
            g.rect(x, y, xx - x, yy - y);
            return true;
        };

        this.paint = function(g,x,y,w,h,d){
            if (d.getTitleInfo){
                var r = d.getTitleInfo();
                if (r != null) {
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
                            case L.TOP    : cx = r.x + (br ? 1 : 0) * (r.width - 1); break;
                            case L.BOTTOM : cx = r.x + (br ? 0 : 1) * (r.width - 1); break;
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
            throw new Error($invalidA);
        }
        this.$super(b);
        this.lineAlignment = a;
    }
]);

/**
 * Label UI component class. The label can be used to visualize simple string or multi lines text or 
 * the given text render implementation:
 
        // render simple string
        var l = new zebra.ui.Label("Simple string");

        // render multi lines text
        var l = new zebra.ui.Label(new zebra.data.Text("Multiline\ntext"));

        // render password text 
        var l = new zebra.ui.Label(new zebra.ui.PasswordText("password"));

 * @param  {String|zebra.data.TextModel|zebra.ui.TextRender} [r] a text to be shown with the label. 
 * You can pass a simple string or an instance of a text model or an instance of text render as the 
 * text value.   
 * @class zebra.ui.Label
 * @constructor
 * @extends zebra.ui.ViewPan
 */
pkg.Label = Class(pkg.ViewPan, [
    function $prototype() {
        /**
         * Get the label text
         * @return {String} a zebra label text
         * @method getValue
         */
        this.getValue = function() { return this.view.getValue(); };
        
        /**
         * Get the label text font
         * @return {zebra.ui.Font} a zebra label font
         * @method getFont
         */
        this.getColor = function (){ return this.view.color; };

        /**
         * Set the label text model 
         * @param  {zebra.data.TextModel} m a text model to be set
         * @method setModel
         */
        this.setModel = function(m) { this.setView(new pkg.TextRender(m)); };
        
        /**
         * Get the label text font
         * @return {zebra.ui.Font} a zebra label font
         * @method getFont
         */
        this.getFont = function (){ return this.view.font; };
        
        /**
         * Set the label text value
         * @param  {String|zebra.data.TextModel} s a new label text 
         * @method setText
         * @deprecated use setValue method instead
         */
        this.setText = function(s){ this.setValue(s); };
        
        /**
         * Get the label text
         * @return {String} a zebra label text
         * @method getText
         * @deprecated use getValue method instead
         */
        this.getText = function() { return this.getValue(); };

        /**
         * Set the label text value
         * @param  {String|zebra.data.TextModel} s a new label text 
         * @method setValue
         */
        this.setValue = function(s){
            this.view.setValue(s);
            this.repaint();
        };

        /**
         * Set the label text color
         * @param  {String} c a text color
         * @method setColor
         */
        this.setColor = function(c){
            if (this.view.setColor(c)) this.repaint();
            return this;
        };

        /**
         * Set the label text font
         * @param  {zebra.ui.Font} f a text font
         * @method setFont
         */
        this.setFont = function(f){
            if (f == null) throw new Error("Null font");
            if (this.view.font != f){
                this.view.setFont(f);
                this.repaint();
            }
            return this;
        };
    },

    function () { this.$this(""); },

    function (r){
        if (zebra.isString(r)) r = new zebra.data.SingleLineTxt(r);
        this.setView(instanceOf(r, TextModel) ? new pkg.TextRender(r) : r);
        this.$super();
    }
]);

/**
 * Shortcut class to render multi lines text without necessity to create multi line model
 * @param {String} [t] a text string
 * @constructor
 * @class zebra.ui.MLabel
 * @extends zebra.ui.Label
 */
pkg.MLabel = Class(pkg.Label, [
    function () { this.$this(""); },
    function(t){
        this.$super(new zebra.data.Text(t));
    }
]);

/**
 * Shortcut class to render bold text in Label
 * @param {String|zebra.ui.TextRender|zebra.ui.TextModel} [t] a text string, text model or text render instance 
 * @constructor
 * @class zebra.ui.BoldLabel
 * @extends zebra.ui.Label
 */
pkg.BoldLabel = Class(pkg.Label, []);

/**
 * Image label UI component. This is UI container that consists from an image component and an label component.
 * Image is located at the left size of text.
 * @param {Image|String} img an image or path to the image
 * @param {String|zebra.ui.TextRender|zebra.ui.TextModel} txt a text string, text model or text render instance 
 * @constructor
 * @class zebra.ui.ImageLabel
 * @extends {zebra.ui.Panel}
 */
pkg.ImageLabel = Class(pkg.Panel, [
    function(txt, img) {
        this.$super(new L.FlowLayout(L.LEFT, L.CENTER, L.HORIZONTAL, 6));
        this.add(new pkg.ImagePan(img));
        this.add(new pkg.Label(txt));
    }
]);

var OVER = 0, PRESSED_OVER = 1, OUT = 2, PRESSED_OUT = 3, DISABLED = 4;

/**
 * State panel class. The class implements UI component whose face, border and background view depends on its state. 
 * The component is good basis for creation dynamic view UI components.
 * The state the component can be is:
       
    - **zebra.ui.StatePan.OVER** the mouse cursor is inside the component 
    - **zebra.ui.StatePan.OUT** the mouse cursor is outside the component
    - **zebra.ui.StatePan.PRESSED_OVER** the mouse cursor is inside the component and an action mouse button or key is pressed
    - **zebra.ui.StatePan.PRESSED_OUT** the mouse cursor is outside the component and an action mouse button or key is pressed
    - **zebra.ui.StatePan.DISABLED** the component is disabled

 * The view border, background or face should be set as "zebra.ui.ViewSet" where an required 
 * for the given component state view is identified by an id. By default corresponding to component states views IDs are the following:
 * "over", "pressed.over", "out", "pressed.out", "disabled".  Imagine for example we have two colors and we need to change between 
 * the colors every time mouse cursor is over/out of the component:
  
     // create state panel
     var statePan = new zebra.ui.StatePan();

     // add dynamically updated background
     statePan.setBackground(new zebra.ui.ViewSet({
        "over": "red",
        "out": "blue"
     }));

 * Alone with background border view can be done also dynamic
 
     // add dynamically updated border
     statePan.setBorder(new zebra.ui.ViewSet({
        "over": new zebra.ui.Border("green", 4, 8),
        "out": null
     }));

 * Additionally the UI component allows developer to specify whether the component can hold input focus and which UI component 
 * has to be considered as the focus marker. The focus marker component is used as anchor to paint focus marker view. In simple
 * case the view can be just a border. So border will be rendered around the focus marker component:
 
     // create state panel that contains one label component
     var statePan = new zebra.ui.StatePan();
     var lab      = new zebra.ui.Label("Focus marker label");
     lab.setPadding(6);
     statePan.setPadding(6);
     statePan.setLayout(new zebra.layout.BorderLayout());
     statePan.add(zebra.layout.CENTER, lab);

     // set label as an anchor for focus border indicator 
     statePan.setFocusAnchorComponent(lab);
     statePan.setFocusMarkerView("plain");

 * One more advanced feature of the component is a possibility of listening by children components when the state of the 
 * component has been updated. A children component can be notified with its parent state updating by implementing 
 * "parentStateUpdated(o,n,id)" method. It gets old state, new state and a view id that is mapped to the new state.  
 * The feature is useful if we are developing a composite components whose children component also should 
 * react to a state changing.
 * @class zebra.ui.StatePan
 * @constructor
 * @extends {zebra.ui.Panel}
 */
pkg.StatePan = Class(pkg.ViewPan, Composite, MouseListener, KeyListener, [
    function $clazz() {
        this.OVER = OVER;
        this.PRESSED_OVER = PRESSED_OVER;
        this.OUT = OUT;
        this.PRESSED_OUT = PRESSED_OUT;
        this.DISABLED = DISABLED;
    },

    function $prototype() {
        var IDS = [ "over", "pressed.over", "out", "pressed.out", "disabled" ];

        /**
         * Current component state
         * @attribute state
         * @readOnly
         * @type {Integer}
         */
        this.state = OUT;

        /**
         * Indicates if the component can have focus
         * @attribute isCanHaveFocus
         * @readOnly
         * @type {Boolean}
         */
        this.isCanHaveFocus = false;
        

        this.focusComponent = null;
        
        /**
         * Reference to an anchor focus marker component 
         * @attribute focusMarkerView
         * @readOnly
         * @type {zebra.ui.Panel}
         */
        this.focusMarkerView = null;

        this.$isIn = false;

        /**
         * The method is designed to customize mapping between the component state 
         * and a string view id. It can be handy for classes that extend the component to have 
         * own view IDs set. 
         * @param  {Integer} s a state code
         * @return {String}  a view ID that corresponds to the given state
         * @method idByState
         */
        this.idByState = function(s) { return IDS[s]; };

        this.updateState = function(s) {
            if (s != this.state){
                var prev = this.state;
                this.state = s;
                this.stateUpdated(prev, s);
            }
        };

        /**
         * Called every time the component state has been updated
         * @param  {Integer} o a previous component state 
         * @param  {Integer} n a new component state 
         * @method stateUpdated
         */
        this.stateUpdated = function(o,n){
            var id = this.idByState(n), b = false;

            for(var i=0; i < this.kids.length; i++) {
                if (this.kids[i].parentStateUpdated) {
                    this.kids[i].parentStateUpdated(o, n, id);
                }
            }

            if (this.border && this.border.activate) b = this.border.activate(id) || b;
            if (this.view   && this.view.activate)  b = this.view.activate(id) || b;
            if (this.bg     && this.bg.activate)   b = this.bg.activate(id) || b;

            if (b) this.repaint();
        };

        this.sync = function() {
            this.stateUpdated(this.state, this.state);
        };

        this.keyPressed = function(e){
            if (this.state != PRESSED_OVER &&
                this.state != PRESSED_OUT  &&
                (e.code == KE.ENTER || e.code == KE.SPACE))
            {
                this.updateState(PRESSED_OVER );
            }
        };

        this.keyReleased = function(e){
            if (this.state == PRESSED_OVER || this.state == PRESSED_OUT){
                var prev = this.state;
                this.updateState(OVER);
                if (this.$isIn === false) this.updateState(OUT);
            }
        };

        this.mouseEntered = function (e){
            if (this.isEnabled) {
                this.updateState(this.state == PRESSED_OUT ? PRESSED_OVER : OVER);
                this.$isIn = true;
            }
        };

        this.mouseExited = function(e){
            if (this.isEnabled) {
                this.updateState(this.state == PRESSED_OVER ? PRESSED_OUT : OUT);
                this.$isIn = false;
            }
        };

        this.mousePressed = function(e){
            if (this.state != PRESSED_OVER && this.state != PRESSED_OUT && e.isActionMask()){
                this.updateState(PRESSED_OVER);
            }
        };

        this.mouseReleased = function(e){
            if ((this.state == PRESSED_OVER || this.state == PRESSED_OUT) && e.isActionMask()){
                this.updateState(e.x >= 0 && e.y >= 0 && e.x < this.width && e.y < this.height ? OVER : OUT);
            }
        };

        this.mouseDragged = function(e){
            if (e.isActionMask()) {
                var pressed = (this.state == PRESSED_OUT || this.state == PRESSED_OVER);
                if (e.x > 0 && e.y > 0 && e.x < this.width && e.y < this.height) {
                    this.updateState(pressed ? PRESSED_OVER : OVER);
                }
                else {
                    this.updateState(pressed ? PRESSED_OUT : OUT);
                }
            }
        };

        this.canHaveFocus = function() {
            return this.isCanHaveFocus;
        };

        this.paintOnTop = function(g){
            var fc = this.focusComponent;
            if (this.focusMarkerView != null && fc != null && this.hasFocus()) {
                this.focusMarkerView.paint(g, fc.x, fc.y, fc.width, fc.height, this);
            }
        };

        /**
         * Set the view that has to be rendered as focus marker when the component gains focus. 
         * @param  {String|zenra.ui.view|Fucntion} c a view. The view can be a color or border string 
         * code or view or an implementation of zebra.ui.View "paint(g,x,y,w,h,t)" method.   
         * @method setFocusMarkerView
         */
        this.setFocusMarkerView = function (c){
            if (c != this.focusMarkerView){
                this.focusMarkerView = pkg.$view(c);
                this.repaint();
            }
        };

        /**
         * Says if the component can hold focus or not
         * @param  {Boolean} b true if the component can gain focus
         * @method setCanHaveFocus
         */
        this.setCanHaveFocus = function(b){
            if (this.isCanHaveFocus != b){
                var fm = pkg.focusManager;
                if (b === false && fm.focusOwner == this) fm.requestFocus(null);
                this.isCanHaveFocus = b;
            }
        };

        /**
         * Set the specified children component to be used as focus marker view anchor component. 
         * Anchor component is a component over that the focus marker view is painted. 
         * @param  {zebra.ui.Panel} c  an anchor component
         * @method setFocusAnchorComponent
         */
        this.setFocusAnchorComponent = function(c) {
            if (this.focusComponent != c) {
                if (c != null && this.kids.indexOf(c) < 0) {
                    throw Error("Focus component doesn't exist");
                }
                this.focusComponent = c;
                this.isCanHaveFocus = (c != null);
                this.repaint();
            }
        };
    },

    function focused() {
        this.$super();
        this.repaint();
    },

    function setView(v){
        if (v != this.view){
            this.$super(v);
            this.stateUpdated(this.state, this.state);
        }
    },

    function setBorder(v){
        if(v != this.border){
            this.$super(v);
            this.stateUpdated(this.state, this.state);
        }
    },

    function setBackground(v){
        if(v != this.bg){
            this.$super(v);
            this.stateUpdated(this.state, this.state);
        }
    },

    function setEnabled(b){
        this.$super(b);
        this.updateState(b ? OUT : DISABLED);
    },

    function kidRemoved(i,l){
        if (l == this.focusComponent) this.focusComponent = null;
        this.$super(i, l);
    }
]);

/**
 *  Button UI component. 
 *  @class  zebra.ui.Button
 *  @constructor
 *  @param {String|zebra.ui.Panel} [t] a button label. 
 *  The label can be a simple text or an UI component.
 *  @extends zebra.ui.StatePan
 */
pkg.Button = Class(pkg.StatePan, Actionable, [
    function $clazz() {
        this.Label = Class(pkg.Label, []);
    },

    function $prototype() {
        this.isCanHaveFocus = true;

        /**
         * Indicate if the button should
         * fire event by pressed event
         * @attribute isFireByPress 
         * @type {Boolean}
         * @default false
         * @readOnly
         */
        this.isFireByPress = false;
        
        /**
         * Fire button event repeating period. -1 means
         * the button event repeating is disabled. 
         * @attribute firePeriod 
         * @type {Integer}
         * @default -1
         * @readOnly
         */
        this.firePeriod = -1;

        this.fire = function() {
            this._.fired(this);
            if (this.catchFired) this.catchFired();
        };

        this.run  = function() {
            if (this.state == PRESSED_OVER) this.fire();
        };

        /**
         * Set the mode the button has to fire events. 
         * Button can fire event after it has been unpressed 
         * or immediately when it has been pressed. Also button 
         * can start firing events periodically when it has been 
         * pressed and holden in the pressed state.
         * @param  {Boolean} b   true if the button has to fire 
         * event by pressed event
         * @param  {Integer} time the period of time the button 
         * has to repeat firing events if it has been pressed and 
         * holden in pressed state. -1 means event doesn't have 
         * repeated  
         * @method setFireParams
         */
        this.setFireParams = function (b,time){
            this.isFireByPress = b;
            this.firePeriod = time;
        };
    },

    function() {
        this.$this(null);
    },

    function (t){
        this._ = new Listeners();
        if (zebra.isString(t)) t = new pkg.Button.Label(t);
        this.$super();
        if (t != null) {
            this.add(t);
            this.setFocusAnchorComponent(t);
        }
    },

    function stateUpdated(o,n){
        this.$super(o, n);
        if(n == PRESSED_OVER){
            if(this.isFireByPress){
                this.fire();
                if (this.firePeriod > 0) {
                    timer.start(this, 400, this.firePeriod);
                }
            }
        }
        else {
            if (this.firePeriod > 0 && timer.get(this) != null) {
                timer.stop(this);
            }

            if (n == OVER && (o == PRESSED_OVER && this.isFireByPress === false)) {
                this.fire();
            }
        }
    }
]);

/**
 *  Border panel UI component. The component render titled 
 *  border around the given children content UI component.
 *  Border title can be placed on top or bottom border line 
 *  and aligned horizontally (left, center, right). Any 
 *  zebra UI component can be used as a border title element.
 *  @param {zebra.ui.Panel|String} [title] a border panel 
 *  title. Can be a string or any other UI component can be 
 *  used as the border panel title
 *  @param {zebra.ui.Panel} [content] a content UI component 
 *  of the border panel 
 *  @param {Integer} [constraints] a title constraints. 
 *  The constraints gives a possibility to place border 
 *  panel title in different places. Generally the title can 
 *  be placed on the top or bottom part of the border panel.
 *  Also the title can be aligned horizontally. 
        
         // create border panel with a title located at the 
         // top and aligned at the canter   
         var bp = new zebra.ui.BorderPan("Title", 
                                         new zebra.ui.Panel(),
                                         zebra.layout.TOP | zebra.layout.CENTER);

 
 *  @constructor
 *  @class zebra.ui.BorderPan
 *  @extends {zebra.ui.Panel}
 */
pkg.BorderPan = Class(pkg.Panel, [
    function $clazz() {
        this.Label = Class(pkg.Label, []);
    },

    function $prototype() {
        /**
         * Vertical gap. Define top and bottom paddings between
         * border panel border and the border panel content 
         * @attribute vGap 
         * @type {Ineteger}
         * @readOnly
         * @default 0
         */

         /**
          * Horizontal gap. Define left and right paddings between
          * border panel border and the border panel content 
          * @attribute hGap 
          * @type {Ineteger}
          * @readOnly
          * @default 0
          */
         this.vGap = this.hGap = 0;

         /**
          * Border panel label indent 
          * @type {Integer}
          * @attribute indent
          * @default 4
          */
         this.indent = 4;

         this.getTitleInfo = function() {
            return (this.label != null) ? { x:this.label.x, y:this.label.y,
                                            width:this.label.width, height:this.label.height,
                                            orient:this.label.constraints & (L.TOP | L.BOTTOM) }
                                        : null;
        };

        this.calcPreferredSize = function(target){
            var ps = this.center != null && this.center.isVisible ? this.center.getPreferredSize()
                                                                  : { width:0, height:0 };
            if (this.label != null && this.label.isVisible){
                var lps = this.label.getPreferredSize();
                ps.height += lps.height;
                ps.width = Math.max(ps.width, lps.width + this.indent);
            }
            ps.width  += (this.hGap * 2);
            ps.height += (this.vGap * 2);
            return ps;
        };

        this.doLayout = function (target){
            var h = 0, right = this.getRight(),
                top = this.getTop(),
                bottom = this.getBottom(), left = this.getLeft(),
                xa = this.label ? this.label.constraints & (L.LEFT | L.CENTER | L.RIGHT): 0,
                ya = this.label ? this.label.constraints & (L.BOTTOM | L.TOP) : 0;

            if (this.label != null && this.label.isVisible){
                var ps = this.label.getPreferredSize();
                h = ps.height;
                this.label.setSize(ps.width, h);
                this.label.setLocation((xa == L.LEFT) ? left + this.indent
                                                      : ((xa == L.RIGHT) ? this.width - right - ps.width - this.indent
                                                                         : ~~((this.width - ps.width) / 2)),
                                        (ya == L.BOTTOM) ? (this.height - bottom - ps.height) : top);
            }

            if (this.center != null && this.center.isVisible){
                this.center.setLocation(left + this.hGap, 
                                        (ya == L.BOTTOM ? top : top + h) + this.vGap);
                this.center.setSize(this.width - right - left - 2 * this.hGap,
                                    this.height - top - bottom - h - 2 * this.vGap);
            }
        };

        /**
         * Set vertical and horizontal paddings between the
         * border panel border and the content of the border 
         * panel  
         * @param {Integer} vg a top and bottom paddings 
         * @param {Integer} hg a left and right paddings
         * @method setGaps 
         */
        this.setGaps = function(vg,hg){
            if(this.vGap != vg || hg != this.hGap){
                this.vGap = vg;
                this.hGap = hg;
                this.vrp();
            }
        };
    },

    function(title) {
        this.$this(title, null);
    },
    
    function() {
        this.$this(null);
    },
    
    function(title, center) {
        this.$this(title, center, L.TOP | L.LEFT);
    },

    function(title, center, ctr){
        if (zebra.isString(title)) title = new pkg.BorderPan.Label(title);
        this.label = this.center = null;
        this.$super();
        if (title  != null) this.add(L.$constraints(ctr), title);
        if (center != null) this.add(L.CENTER, center);
    },

    function kidAdded(index,id,lw){
        this.$super(index, id, lw);
        if(L.CENTER == id) this.center = lw;
        else this.label = lw;
    },

    function kidRemoved(index,lw){
        this.$super(index, lw);
        if(lw == this.label) this.label = null;
        else this.center = null;
    }
]);

/**
 * The standard UI checkbox component switch manager implementation. The manager holds
 * boolean state of a checkbox UI component. There are few ways how a checkbox can 
 * switch its state: standard checkbox or radio group. In general we have a deal with 
 * one switchable UI component that can work in different modes. Thus we can re-use 
 * one UI, but customize it with appropriate switch manager. That is the main idea of 
 * having the class.
 * @constructor
 * @class  zebra.ui.SwitchManager
 */

/**
 * Fired when a state has been updated
        
        var ch = new zebra.ui.Checkbox("Test");
        ch.manager._.add(function (src, ui) {
            ...
        });

 * @event stateUpdated
 * @param {zebra.ui.SwitchManager} src a switch manager that controls and tracks the event 
 * @param {zebra.ui.Checkbox} ui  an UI component that triggers the event
 */
pkg.SwitchManager = Class([
    function $prototype() {
        /**
         * Get current state of the given UI component 
         * @param  {zebra.ui.Checkbox} o an ui component
         * @return {Boolean}  a boolean state
         * @method getState
         */
        this.getState = function(o) { return this.state; };

        /**
         * Set the state for the given UI component
         * @param  {zebra.ui.Checkbox} o an ui component
         * @param  {Boolean} b  a boolean state
         * @method setState
         */
        this.setState = function(o,b) {
            if (this.getState(o) != b){
                this.state = b;
                this.updated(o, b);
            }
        };

        /**
         * Called every time a state has been updated.
         * @param  {zebra.ui.Checkbox} o an ui component for which the state has been updated
         * @param  {Boolean} b  a new boolean state of the UI component 
         * @method stateUpdated
         */
        this.updated = function(o, b){
            if (o != null) o.switched(b);
            this._.fired(this, o);
        };

        /**
         * Call when the manager has been installed for the given UI component
         * @protected
         * @param  {zebra.ui.Checkbox} o an UI component the switch manager is designated  
         * @method install
         */
        this.install = function(o) { 
            o.switched(this.getState(o)); 
        };
        
        /**
         * Call when the manager has been uninstalled for the given UI component
         * @protected
         * @param  {zebra.ui.Checkbox} o an UI component the switch manager is not anymore used
         * @method uninstall
         */
        this.uninstall = function(o) {};

        this[''] = function() {
            this.state = false;
            this._ = new Listeners();
        };
    }
]);

/**
 * Radio group switch manager implementation. This is an extension of "zebra.ui.SwicthManager" to 
 * support radio group switching behavior. You can use it event with normal checkbox:
 
       // create group of check boxes that will work as a radio group
       var gr = new zebra.ui.Group();
       var ch1 = new zebra.ui.Checkbox("Test 1", gr);
       var ch2 = new zebra.ui.Checkbox("Test 2", gr);
       var ch3 = new zebra.ui.Checkbox("Test 3", gr);
 
 * @class  zebra.ui.Group
 * @constructor
 * @extends zebra.ui.SwitchManager
 */
pkg.Group = Class(pkg.SwitchManager, [
    function (){
        this.$super();
        this.state = null;
    },

    function $prototype() {
        this.getState = function(o) {
            return o == this.state;
        };

        this.setState = function(o,b){
            if (this.getState(o) != b){
                this.clearSelected();
                this.state = o;
                this.updated(o, true);
            }
        };

        this.clearSelected = function() {
            if (this.state != null){
                var old = this.state;
                this.state = null;
                this.updated(old, false);
            }
        };
    }
]);

/**
 * Check-box UI component. The component is a container that 
 * consists from two other UI components: 
    
    - Box component to keep checker indicator
    - Label component to paint label 

 * Developers are free to customize the component as they want. 
 * There is no limitation regarding how the box and label components 
 * have to be laid out, which UI components have to be used as 
 * the box or label components, etc. The check box extends state 
 * panel component and re-map states  to own views IDs:
    
    - "on.out" - checked and mouse cursor is out 
    - "off.out" - un-checked and mouse cursor is out 
    - "don" - disabled and checked, 
    - "doff" - disabled and un-checked , 
    - "on.over" - checked and mouse cursor is over 
    - "off.over" - un-checked and mouse cursor is out

 *
 * Customize is quite similar to what explained for zebra.ui.StatePan:
 *
 
        // create checkbox component 
        var ch = new zebra.ui.Checkbox("Checkbox");

        // change border when the component checked to green
        // otherwise set it to red
        ch.setBorder(new zebra.ui.ViewSet({
            "off.*": new zebra.ui.Border("red"),
            "on.*": new zebra.ui.Border("green")
        }));

        // customize checker box children UI component to show
        // green for checked and red for un-cheked states 
        ch.kids[0].setView(new zebra.ui.ViewSet({
            "off.*": "red",
            "on.*": "green"
        }));
        // sync current state with new look and feel
        ch.sync();
  
 * Listening checked event should be done by registering a 
 * listener in the check box switch manager as follow:
 
        // create checkbox component 
        var ch = new zebra.ui.Checkbox("Checkbox");

        // register a checkbox listener
        ch.manager._.add(function(sm) {
            var s = sm.getState();
            ...
        });

 * @class  zebra.ui.Checkbox
 * @extends zebra.ui.StatePan
 * @constructor 
 * @param {String|zebra.ui.Panel} [label] a label 
 * @param {zebra.ui.SwitchManager} [m] a switch manager 
 */
pkg.Checkbox = Class(pkg.StatePan, [
    function $clazz() {
        var IDS = ["on.out", "off.out", "don", "doff", "on.over", "off.over"];

        /**
         * The box UI component class that is used by default with 
         * the check box component.
         * @constructor
         * @class zebra.ui.Checkbox.Box
         * @extends zebra.ui.ViewPan
         */
        this.Box = Class(pkg.ViewPan, [
            function parentStateUpdated(o, n, id) {
                this.view.activate(id);
                this.repaint();
            }
        ]);

        /**
         * @for zebra.ui.Checkbox
         */
        this.Label = Class(pkg.Label, []);
    },

    function $prototype() {
        /**
         * Set the check box state 
         * @param  {Boolean} b a state
         * @method setValue
         */
        this.setValue = function(b) {
            return this.setState(b);
        };

        /**
         * Get the check box state 
         * @return {Boolean} a check box state
         * @method getValue
         */
        this.getValue = function() {
            return this.getState();
        };

        /**
         * Set the check box state 
         * @param  {Boolean} b a state
         * @method setState
         * @deprecated use setValue method instead 
         */
        this.setState = function(b){ 
            this.manager.setState(this, b);
            return this;
        };

        /**
         * Get the check box state 
         * @return {Boolean} a check box state
         * @method getState
         * @deprecated use getValue method
         */
        this.getState = function() {
            return this.manager ? this.manager.getState(this) : false;
        };
      
        this.switched = function(b){
            this.stateUpdated(this.state, this.state);
        };

        this.idByState = function(state){
            if (this.isEnabled) {
                if (this.getState()) { 
                    return (this.state == OVER) ? "on.over" : "on.out";
                }
                return (this.state == OVER) ? "off.over" : "off.out";
            }
            return this.getState() ? "don" : "doff";
        };
    },

    function () { this.$this(null); },

    function (c){
        this.$this(c, new pkg.SwitchManager());
    },

    function (c, m) {
        var clazz = this.getClazz();
        if (zebra.isString(c)) {
            c = clazz.Label ? new clazz.Label(c) : new pkg.Checkbox.Label(c);
        }
        
        this.$super();
        
        this.box = clazz.Box ? new clazz.Box() : new pkg.Checkbox.Box();
        this.add(this.box);
        
        if (c != null) {
            this.add(c);
            this.setFocusAnchorComponent(c);
        }
        this.setSwitchManager(m);
    },

    function keyPressed(e){
        if(instanceOf(this.manager, pkg.Group) && this.getState()){
            var code = e.code, d = 0;
            if (code == KE.LEFT || code == KE.UP) d = -1;
            else {
                if (code == KE.RIGHT || code == KE.DOWN) d = 1;
            }

            if(d !== 0) {
                var p = this.parent, idx = p.indexOf(this);
                for(var i = idx + d;i < p.kids.length && i >= 0; i += d){
                    var l = p.kids[i];
                    if (l.isVisible &&
                        l.isEnabled &&
                        instanceOf(l, pkg.Checkbox) &&
                        l.manager == this.manager      )
                    {
                        l.requestFocus();
                        l.setState(true);
                        break;
                    }
                }
                return ;
            }
        }
        this.$super(e);
    },

    /**
     * Set the specified switch manager 
     * @param {zebra.ui.SwicthManager} m a switch manager
     * @method setSwicthManager
     */
    function setSwitchManager(m){
        /**
         * A switch manager
         * @attribute manager
         * @readOnly
         * @type {zebra.ui.SwitchManager}
         */

        if (m == null) { 
            throw new Error("Null switch manager");
        }

        if (this.manager != m) {
            if (this.manager != null) this.manager.uninstall(this);
            this.manager = m;
            this.manager.install(this);
        }
    },

    function stateUpdated(o, n) {
        if (o == PRESSED_OVER && n == OVER) this.setState(!this.getState());
        this.$super(o, n);
    },

    function kidRemoved(index,c) {
        if (this.box == c) {
            this.box = null;
        }
        this.$super(index,c);
    }
]);

/**
 * Radio-box UI component class. This class is extension of "zebra.ui.Checkbox" class that sets group 
 * as a default switch manager. The other functionality id identical to checkbox component. Generally 
 * speaking this class is a shortcut for radio box creation.  
 * @class  zebra.ui.Radiobox
 * @constructor 
 * @param {String|zebra.ui.Panel} [label] a label 
 * @param {zebra.ui.Group} [m] a switch manager 
 */
pkg.Radiobox = Class(pkg.Checkbox, [
    function $clazz() {
        this.Box   = Class(pkg.Checkbox.Box, []);
        this.Label = Class(pkg.Checkbox.Label, []);
    },

    function(c) {
        this.$this(c, new pkg.Group());
    },

    function(c, group) {
        this.$super(c, group);
    }
]);

/**
 * Splitter panel UI component class. The component splits its area horizontally or vertically into two areas. 
 * Every area hosts an UI component. A size of the parts can be controlled by mouse cursor dragging. Gripper 
 * element is children UI component that can be customized. For instance:
 
      // create split panel
      var sp = new zebra.ui.SplitPan(new zebra.ui.Label("Left panel"), 
                                    new zebra.ui.Label("Right panel")); 
      
      // customize gripper background color depending on its state
      sp.gripper.setBackground(new zebra.ui.ViewSet({
           "over" : "yellow"
           "out" : null,
           "pressed.over" : "red"
      }));


 * @param {zebra.ui.Panel} [first] a first UI component in splitter panel 
 * @param {zebra.ui.Panel} [second] a second UI component in splitter panel
 * @param {Integer} [o] an orientation of splitter element: zebra.layout.VERTICAL or zebra.layout.HORIZONTAL 
 * @class zebra.ui.SplitPan
 * @constructor
 * @extends {zebra.ui.Panel}
 */
pkg.SplitPan = Class(pkg.Panel, [
    function $clazz() {
        this.Bar = Class(pkg.StatePan, MouseListener, [
            function $prototype() {
                this.mouseDragged = function(e){
                    var x = this.x + e.x, y = this.y + e.y;
                    if (this.target.orientation == L.VERTICAL){
                        if (this.prevLoc != x){
                            x = this.target.normalizeBarLoc(x);
                            if (x > 0){
                                this.prevLoc = x;
                                this.target.setGripperLoc(x);
                            }
                        }
                    }
                    else {
                        if (this.prevLoc != y){
                            y = this.target.normalizeBarLoc(y);
                            if (y > 0){
                                this.prevLoc = y;
                                this.target.setGripperLoc(y);
                            }
                        }
                    }
                };

                this.mouseDragStarted = function (e){
                    var x = this.x + e.x, y = this.y + e.y;
                    if (e.isActionMask()) {
                        if (this.target.orientation == L.VERTICAL){
                            x = this.target.normalizeBarLoc(x);
                            if (x > 0) this.prevLoc = x;
                        }
                        else {
                            y = this.target.normalizeBarLoc(y);
                            if (y > 0) this.prevLoc = y;
                        }
                    }
                };

                this.mouseDragEnded = function(e){
                    var xy = this.target.normalizeBarLoc(this.target.orientation == L.VERTICAL ? this.x + e.x : this.y + e.y);
                    if (xy > 0) this.target.setGripperLoc(xy);
                };

                this.getCursorType = function(t,x,y){
                    return this.target.orientation == L.VERTICAL ? Cursor.W_RESIZE
                                                                 : Cursor.N_RESIZE;
                };
            },

            function(target) {
                this.prevLoc = 0;
                this.target = target;
                this.$super();
            }
        ]);
    },

    function $prototype() {
        /**
         * A minimal size of the left (or top) sizable panel 
         * @attribute leftMinSize
         * @type {Integer}
         * @readOnly
         * @default 50
         */

        /**
         * A minimal size of right (or bottom) sizable panel
         * @attribute rightMinSize
         * @type {Integer}
         * @readOnly
         * @default 50
         */

        /**
         * Indicates if the splitter bar can be moved
         * @attribute isMoveable
         * @type {Boolean}
         * @readOnly
         * @default true
         */

        /**
         * A gap between gripper element and first and second UI components 
         * @attribute gap
         * @type {Integer}
         * @readOnly
         * @default 1
         */
        
        /**
         * A reference to gripper UI component
         * @attribute gripper
         * @type {zebra.ui.Panel}
         * @readOnly
         */

        /**
         * A reference to left (top) sizable UI component
         * @attribute leftComp
         * @type {zebra.ui.Panel}
         * @readOnly
         */

        /**
         * A reference to right (bottom) sizable UI component
         * @attribute rightComp
         * @type {zebra.ui.Panel}
         * @readOnly
         */

        this.leftMinSize = this.rightMinSize = 50;
        this.isMoveable = true;
        this.gap = 1;

        this.normalizeBarLoc = function(xy){

            if (xy < this.minXY) xy = this.minXY;
            else {
                if (xy > this.maxXY) xy = this.maxXY;
            }

            return (xy > this.maxXY || xy < this.minXY) ?  -1 : xy;
        };

        /**
         * Set gripper element location
         * @param  {Integer} l a location of the gripper element
         * @method setGripperLoc
         */
        this.setGripperLoc = function(l){
            if (l != this.barLocation){
                this.barLocation = l;
                this.vrp();
            }
        };

        this.calcPreferredSize = function(c){
            var fSize = pkg.getPreferredSize(this.leftComp),
                sSize = pkg.getPreferredSize(this.rightComp),
                bSize = pkg.getPreferredSize(this.gripper);

            if(this.orientation == L.HORIZONTAL){
                bSize.width = Math.max(((fSize.width > sSize.width) ? fSize.width : sSize.width), bSize.width);
                bSize.height = fSize.height + sSize.height + bSize.height + 2 * this.gap;
            }
            else{
                bSize.width = fSize.width + sSize.width + bSize.width + 2 * this.gap;
                bSize.height = Math.max(((fSize.height > sSize.height) ? fSize.height : sSize.height), bSize.height);
            }
            return bSize;
        };

        this.doLayout = function(target){
            var right  = this.getRight(),
                top    = this.getTop(),
                bottom = this.getBottom(),
                left   = this.getLeft(),
                bSize  = pkg.getPreferredSize(this.gripper);

            if (this.orientation == L.HORIZONTAL){
                var w = this.width - left - right;
                if (this.barLocation < top) this.barLocation = top;
                else {
                    if (this.barLocation > this.height - bottom - bSize.height) {
                        this.barLocation = this.height - bottom - bSize.height;
                    }
                }

                if (this.gripper != null){
                    if(this.isMoveable){
                        this.gripper.setLocation(left, this.barLocation);
                        this.gripper.setSize(w, bSize.height);
                    }
                    else{
                        this.gripper.setSize(bSize.width, bSize.height);
                        this.gripper.toPreferredSize();
                        this.gripper.setLocation(~~((w - bSize.width) / 2), this.barLocation);
                    }
                }
                if(this.leftComp != null){
                    this.leftComp.setLocation(left, top);
                    this.leftComp.setSize(w, this.barLocation - this.gap - top);
                }
                if(this.rightComp != null){
                    this.rightComp.setLocation(left, this.barLocation + bSize.height + this.gap);
                    this.rightComp.setSize(w, this.height - this.rightComp.y - bottom);
                }
            }
            else {
                var h = this.height - top - bottom;
                if(this.barLocation < left) this.barLocation = left;
                else {
                    if (this.barLocation > this.width - right - bSize.width) {
                        this.barLocation = this.width - right - bSize.width;
                    }
                }

                if (this.gripper != null){
                    if(this.isMoveable){
                        this.gripper.setLocation(this.barLocation, top);
                        this.gripper.setSize(bSize.width, h);
                    }
                    else{
                        this.gripper.setSize(bSize.width, bSize.height);
                        this.gripper.setLocation(this.barLocation, ~~((h - bSize.height) / 2));
                    }
                }

                if (this.leftComp != null){
                    this.leftComp.setLocation(left, top);
                    this.leftComp.setSize(this.barLocation - left - this.gap, h);
                }

                if(this.rightComp != null){
                    this.rightComp.setLocation(this.barLocation + bSize.width + this.gap, top);
                    this.rightComp.setSize(this.width - this.rightComp.x - right, h);
                }
            }
        };

        /**
         * Set gap between gripper element and sizable panels 
         * @param  {Integer} g a gap
         * @method setGap
         */
        this.setGap = function (g){
            if(this.gap != g){
                this.gap = g;
                this.vrp();
            }
        };

        /**
         * Set the minimal size of the left (or top) sizeable panel
         * @param  {Integer} m  a minimal possible size
         * @method setLeftMinSize
         */
        this.setLeftMinSize = function (m){
            if(this.leftMinSize != m){
                this.leftMinSize = m;
                this.vrp();
            }
        };

        /**
         * Set the minimal size of the right (or bottom) sizeable panel
         * @param  {Integer} m  a minimal possible size
         * @method setRightMinSize
         */
        this.setRightMinSize = function(m){
            if(this.rightMinSize != m){
                this.rightMinSize = m;
                this.vrp();
            }
        };

        /**
         * Set the given gripper movable state
         * @param  {Boolean} b the gripper movable state. 
         * @method setGripperMovable
         */
        this.setGripperMovable = function (b){
            if(b != this.isMoveable){
                this.isMoveable = b;
                this.vrp();
            }
        };
    },

    function ()   {
        this.$this(null, null, L.VERTICAL);
    },

    function (f,s) {
        this.$this(f, s, L.VERTICAL);
    },

    function (f,s,o){
        this.minXY = this.maxXY = 0;
        this.barLocation = 70;
        this.leftComp = this.rightComp = this.gripper = null;
        this.orientation = L.$constraints(o);
        
        this.$super();

        if (f != null) this.add(L.LEFT, f);
        if (s != null) this.add(L.RIGHT, s);
        this.add(L.CENTER, new pkg.SplitPan.Bar(this));
    },

    function kidAdded(index,id,c){
        this.$super(index, id, c);
        if (L.LEFT == id) this.leftComp = c;
        else {
            if (L.RIGHT == id) this.rightComp = c;
            else {
                if (L.CENTER == id) this.gripper = c;
                else throw new Error($invalidC);
            }
        }
    },

    function kidRemoved(index,c){
        this.$super(index, c);
        if (c == this.leftComp) this.leftComp = null;
        else {
            if (c == this.rightComp) {
                this.rightComp = null;
            }
            else {
                if (c == this.gripper) this.gripper = null;
            }
        }
    },

    function resized(pw,ph) {
        var ps = this.gripper.getPreferredSize();
        if (this.orientation == L.VERTICAL){
            this.minXY = this.getLeft() + this.gap + this.leftMinSize;
            this.maxXY = this.width - this.gap - this.rightMinSize - ps.width - this.getRight();
        }
        else {
            this.minXY = this.getTop() + this.gap + this.leftMinSize;
            this.maxXY = this.height - this.gap - this.rightMinSize - ps.height - this.getBottom();
        }
        this.$super(pw, ph);
    }
]);

/**
 * Progress bar UI component class.                                                                                                                                                                                                                           y -= (bundleSize + this.gap   [description]
 * @class zebra.ui.Progress
 * @constructor
 * @extends {zebra.ui.Panel}
 */

/**
 * Fired when a progress bar value has been updated

        progress._.add(function(src, oldValue) {
            ...
        });

 *  @event valueUpdated 
 *  @param {zebra.ui.Progress} src a progress bar that triggers 
 *  the event 
 *  @param {Integer} oldValue a progress bar previous value
 */

pkg.Progress = Class(pkg.Panel, Actionable, [
    function $prototype() {
        /**
         * Gap between bundle elements
         * @default 2
         * @attribute gap
         * @type {Integer}
         * @readOnly
         */
        this.gap = 2;

        /**
         * Progress bar orientation
         * @default zebra.layout.HORIZONTAL
         * @attribute orientation
         * @type {Integer}
         * @readOnly
         */
        this.orientation = L.HORIZONTAL;

        this.paint = function(g){
            var left = this.getLeft(), right = this.getRight(),
                top = this.getTop(), bottom = this.getBottom(),
                rs = (this.orientation == L.HORIZONTAL) ? this.width - left - right
                                                        : this.height - top - bottom,
                bundleSize = (this.orientation == L.HORIZONTAL) ? this.bundleWidth
                                                                : this.bundleHeight;

            if (rs >= bundleSize){
                var vLoc = ~~((rs * this.value) / this.maxValue),
                    x = left, y = this.height - bottom, bundle = this.bundleView,
                    wh = this.orientation == L.HORIZONTAL ? this.height - top - bottom
                                                          : this.width - left - right;

                while(x < (vLoc + left) && this.height - vLoc - bottom < y){
                    if(this.orientation == L.HORIZONTAL){
                        bundle.paint(g, x, top, bundleSize, wh, this);
                        x += (bundleSize + this.gap);
                    }
                    else{
                        bundle.paint(g, left, y - bundleSize, wh, bundleSize, this);
                        y -= (bundleSize + this.gap);
                    }
                }

                if (this.titleView != null){
                    var ps = this.bundleView.getPreferredSize();
                    this.titleView.paint(g, L.xAlignment(ps.width, L.CENTER, this.width),
                                            L.yAlignment(ps.height, L.CENTER, this.height),
                                            ps.width, ps.height, this);
                }
            }
        };

        this.calcPreferredSize = function(l){
            var bundleSize = (this.orientation == L.HORIZONTAL) ? this.bundleWidth
                                                                : this.bundleHeight,
                v1 = (this.maxValue * bundleSize) + (this.maxValue - 1) * this.gap,
                ps = this.bundleView.getPreferredSize();

            ps = (this.orientation == L.HORIZONTAL) ? { 
                                                        width :v1,
                                                        height:(this.bundleHeight >= 0 ? this.bundleHeight
                                                                                       : ps.height)
                                                      }
                                                    : {
                                                        width:(this.bundleWidth >= 0 ? this.bundleWidth
                                                                                     : ps.width),
                                                        height: v1
                                                      };
            if (this.titleView != null) {
                var tp = this.titleView.getPreferredSize();
                ps.width  = Math.max(ps.width, tp.width);
                ps.height = Math.max(ps.height, tp.height);
            }
            return ps;
        };
    },

    function (){
        /**
         * Progress bar value
         * @attribute value
         * @type {Integer}
         * @readOnly
         */
        this.value = 0;
        this.setBundleView("darkBlue");

        /**
         * Progress bar bundle width
         * @attribute bundleWidth
         * @type {Integer}
         * @readOnly
         * @default 6
         */

        /**
         * Progress bar bundle height
         * @attribute bundleHeight
         * @type {Integer}
         * @readOnly
         * @default 6
         */

        this.bundleWidth = this.bundleHeight = 6;

        /**
         * Progress bar maximal value
         * @attribute maxValue
         * @type {Integer}
         * @readOnly
         * @default 20
         */
        this.maxValue = 20;
        this._ = new Listeners();
        this.$super();
    },

    /**
     * Set the progress bar orientation
     * @param {Integer} o an orientation: zebra.layout.VERTICAL or zebra.layout.HORIZONTAL
     * @method setOrientation
     */
    function setOrientation(o){
        o = L.$constraints(o);
        if (o != L.HORIZONTAL && o != L.VERTICAL) {
            throw new Error($invalidO);
        }
        if (o != this.orientation){
            this.orientation = o;
            this.vrp();
        }
    },

    /**
     * Set maximal integer value the progress bar value can rich
     * @param {Integer} m a maximal value the progress bar value can rich
     * @method setMaxValue
     */
    function setMaxValue(m){
        if(m != this.maxValue){
            this.maxValue = m;
            this.setValue(this.value);
            this.vrp();
        }
    },

    /**
     * Set the current progress bar value
     * @param {Integer} p a progress bar
     * @method setValue
     */
    function setValue(p){
        p = p % (this.maxValue + 1);
        if (this.value != p){
            var old = this.value;
            this.value = p;
            this._.fired(this, old);
            this.repaint();
        }
    },

    /**
     * Set the given gap between progress bar bundle elements 
     * @param {Integer} g a gap
     * @method setGap
     */
    function setGap(g){
        if (this.gap != g){
            this.gap = g;
            this.vrp();
        }
    },

    /**
     * Set the progress bar bundle element view
     * @param {zebra.ui.View} v a progress bar bundle view
     * @method setBundleView   
     */
    function setBundleView(v){
        if (this.bundleView != v){
            this.bundleView = pkg.$view(v);
            this.vrp();
        }
    },

    /**
     * Set the progress bar bundle element size
     * @param {Integer} w a bundle element width
     * @param {Integer} h a bundle element height
     * @method setBundleSize
     */
    function setBundleSize(w, h){
        if (w != this.bundleWidth && h != this.bundleHeight){
            this.bundleWidth  = w;
            this.bundleHeight = h;
            this.vrp();
        }
    }
]);

/**
 * UI link component class.
 * @class zebra.ui.Link
 * @param {String} s a link text
 * @constructor
 * @extends {zebra.ui.Button}
 */
pkg.Link = Class(pkg.Button, [
    function $prototype() {
        this.cursorType = Cursor.HAND; 
    },

    function(s){
        this.$super(null);
        var font = this.getClazz()["font"];
        if (font == null) font = pkg.Link.font;

        this.setView(new pkg.TextRender(s));
        this.view.setFont(font);
        this.stateUpdated(this.state, this.state);


    },

    /**
     * Set the link text color for the specified link state
     * @param {Integer} state a link state 
     * @param {String} c a link text color
     * @method  setColor
     */
    function setColor(state,c){
        if (this.colors[state] != c){
            this.colors[state] = c;
            this.stateUpdated(state, state);
        }
    },

    function stateUpdated(o,n){
        this.$super(o, n);
        var r = this.view;
        if (r && r.color != this.colors[n]){
            r.setColor(this.colors[n]);
            this.repaint();
        }
    }
]);

/**
 * Extender UI component class
 * @constructor
 * @class zebra.ui.Extender
 * @extends {zebra.ui.Panel}
 * @param {zebra.ui.Panel} c a content of the extender panel
 * @param {zebra.ui.Panel|String} l a title label text or 
 * component
 */

 /**
  * Fired when extender is collapsed or extended 
         
         var ex = new zebra.ui.Extender(pan, "Title");
         ex._.add(function (src, isCollapsed) {
             ...
         });

  * @event fired
  * @param {zebra.ui.Extender} src an extender UI component that generates the event
  * @param {Boolean} isCollapsed a state of the extender UI component 
  */

pkg.Extender = Class(pkg.Panel, [
    function $prototype() {
        /**
         * Toogle on toogle off the extender panel
         * @method toggle
         */
        this.toggle = function(){
            this.isCollapsed = this.isCollapsed ? false : true;
            this.contentPan.setVisible(!this.isCollapsed);
            this.togglePan.view.activate(this.isCollapsed ? "off" : "on");
            this.repaint();

            if (this._) {
                this._.fired(this, this.isCollapsed);
            }
        };
    },

    function $clazz() {
        this.Label = Class(pkg.Label,[]);
        this.TitlePan = Class(pkg.Panel, []);
        
        this.TogglePan = Class(pkg.ViewPan, MouseListener, [
            function $prototype() {
                this.mousePressed = function(e){
                    if (e.isActionMask()) {
                        this.parent.parent.toggle();
                    }
                };

                this.setViews = function(v) {
                    this.setView(new pkg.ViewSet(v));
                };

                this.cursorType = Cursor.HAND;
            }
        ]);
    },

    function (content, lab){
        /**
         * Indicate if the extender panel is collapsed
         * @type {Boolean}
         * @attribute isCollapsed
         * @readOnly
         * @default false
         */
        this.isCollapsed = true;
        this.$super();
        if (zebra.isString(lab)) {
            lab = new pkg.Extender.Label(lab);
        }

        /**
         * Label component 
         * @attribute label
         * @type {zebra.ui.Panel}
         * @readOnly
         */
        this.label = lab;


        this.titlePan = new pkg.Extender.TitlePan();
        this.add(L.TOP, this.titlePan);

        this.togglePan = new pkg.Extender.TogglePan();
        this.titlePan.add(this.togglePan);
        this.titlePan.add(this.label);

        /**
         * Content panel 
         * @type {zebra.ui.Panel}
         * @readOnly
         * @attribute contentPan
         */
        this.contentPan = content;
        this.contentPan.setVisible(!this.isCollapsed);
        this.add(L.CENTER, this.contentPan);

        this.toggle();

        this._ = new Listeners();
    }
]);

var ScrollManagerListeners = Listeners.Class("scrolled");

/**
 * Scroll manager class. 
 * @param {zebra.ui.Panel} t a target component to be scrolled
 * @constructor
 * @class zebra.ui.ScrollManager
 */

 /**
  * Fired when a target component has been scrolled

        scrollManager._.add(function(px, py) {
            ...
        });

  * @event scrolled
  * @param  {Integer} px a previous x location target component scroll location
  * @param  {Integer} py a previous y location target component scroll location
  */

pkg.ScrollManager = Class([
    function $prototype() {
        /**
         * Get current target component x scroll location
         * @return {Integer} a x scroll location
         * @method getSX
         */
        this.getSX = function (){ return this.sx; };

        /**
         * Get current target component y scroll location
         * @return {Integer} a y scroll location
         * @method getSY
         */
        this.getSY = function (){ return this.sy; };

        this.scrollXTo = function(v){ this.scrollTo(v, this.getSY()); };
        this.scrollYTo = function(v){ this.scrollTo(this.getSX(), v); };

        
        /**
         * Scroll the target component into the specified location
         * @param  {Integer} x a x location
         * @param  {Integer} y a y location
         * @method scrollTo
         */
        this.scrollTo = function(x, y){
            var psx = this.getSX(), psy = this.getSY();
            if (psx != x || psy != y){
                this.sx = x;
                this.sy = y;
                if (this.updated) this.updated(x, y, psx, psy);
                if (this.target.catchScrolled) this.target.catchScrolled(psx, psy);
                this._.scrolled(psx, psy);
            }
        };

        /**
         * Make visible the given rectangular area of the 
         * scrolled target component
         * @param  {Integer} x a x coordinate of top left corner 
         * of the rectangular area
         * @param  {Integer} y a y coordinate of top left corner 
         * of the rectangular area
         * @param  {Integer} w a width of the rectangular area
         * @param  {Integer} h a height of the rectangular area
         * @method makeVisible
         */
        this.makeVisible = function(x,y,w,h){
            var p = pkg.calcOrigin(x, y, w, h, this.getSX(), this.getSY(), this.target);
            this.scrollTo(p[0], p[1]);
        };
    },

    function (c){
        this.sx = this.sy = 0;
        this._ = new ScrollManagerListeners();
        this.target = c;
    }
]);

/**
 * Scroll bar UI component
 * @param {Integer} t type of the scroll bar components:
 
        zebra.layout.VERTICAL - vertical scroll bar
        zebra.layout.HORIZONTAL - horizontal scroll bar

 * @class zebra.ui.Scroll
 * @constructor
 * @extends {zebra.ui.Panel}
 */
pkg.Scroll = Class(pkg.Panel, MouseListener, zebra.util.Position.Metric, Composite, [
    function $clazz() {
        var SB = Class(pkg.Button, [
            function $prototype() {
                this.isDragable  = this.isFireByPress  = true;
                this.firePeriod  = 20;
            }
        ]);

        this.VIncButton = Class(SB, []);
        this.VDecButton = Class(SB, []);
        this.HIncButton = Class(SB, []);
        this.HDecButton = Class(SB, []);

        this.VBundle = Class(pkg.Panel, []);
        this.HBundle = Class(pkg.Panel, []);

        this.MIN_BUNDLE_SIZE = 16;
    },

    function $prototype() {
        /**
         * Maximal possible value 
         * @attribute max
         * @type {Integer}
         * @readOnly
         * @default 100
         */
        this.extra = this.max  = 100;

        /**
         * Page increment value
         * @attribute pageIncrement 
         * @type {Integer}
         * @readOnly
         * @default 20
         */
        this.pageIncrement = 20;

        /**
         * Unit increment value
         * @attribute unitIncrement 
         * @type {Integer}
         * @readOnly
         * @default 5
         */
        this.unitIncrement = 5;

        this.isInBundle = function(x,y){
            var bn = this.bundle;
            return (bn != null && 
                    bn.isVisible && 
                    bn.x <= x && bn.y <= y && 
                    bn.x + bn.width > x && 
                    bn.y + bn.height > y);
        };

        this.amount = function(){
            var db = this.decBt, ib = this.incBt;
            return (this.type == L.VERTICAL) ? ib.y - db.y - db.height 
                                             : ib.x - db.x - db.width;
        };

        this.pixel2value = function(p) {
            var db = this.decBt;
            return (this.type == L.VERTICAL) ? ~~((this.max * (p - db.y - db.height)) / (this.amount() - this.bundle.height))
                                             : ~~((this.max * (p - db.x - db.width )) / (this.amount() - this.bundle.width));
        };

        this.value2pixel = function(){
            var db = this.decBt, bn = this.bundle, off = this.position.offset;
            return (this.type == L.VERTICAL) ? db.y + db.height +  ~~(((this.amount() - bn.height) * off) / this.max)
                                             : db.x + db.width  +  ~~(((this.amount() - bn.width) * off) / this.max);
        };


        this.catchInput = function (child){
            return child == this.bundle || (this.bundle.kids.length > 0 &&
                                            L.isAncestorOf(this.bundle, child));
        };

        this.posChanged = function(target,po,pl,pc){
            if (this.bundle != null) {
                if (this.type == L.HORIZONTAL) this.bundle.setLocation(this.value2pixel(), this.getTop());
                else this.bundle.setLocation(this.getLeft(), this.value2pixel());
            }
        };

        this.getLines     = function (){ return this.max; };
        this.getLineSize  = function (line){ return 1; };
        this.getMaxOffset = function (){ return this.max; };

        this.fired = function(src){
            this.position.setOffset(this.position.offset + ((src == this.incBt) ? this.unitIncrement
                                                                                : -this.unitIncrement));
        };

        this.mouseDragged = function(e){
            if (Number.MAX_VALUE != this.startDragLoc) {
                this.position.setOffset(this.pixel2value(this.bundleLoc -
                                                         this.startDragLoc +
                                                         ((this.type == L.HORIZONTAL) ? e.x : e.y)));
            }
        };

        this.mouseDragStarted = function (e){
           //!!! It is more convenient to  if (this.isDragable || this.isInBundle(e.x, e.y)){
                this.startDragLoc = this.type == L.HORIZONTAL ? e.x : e.y;
                this.bundleLoc = this.type == L.HORIZONTAL ? this.bundle.x : this.bundle.y;
            //}
        };

        this.mouseDragEnded = function (e){ this.startDragLoc = Number.MAX_VALUE; };

        this.mouseClicked = function (e){
            if (this.isInBundle(e.x, e.y) === false && e.isActionMask()){
                var d = this.pageIncrement;
                if (this.type == L.VERTICAL){
                    if(e.y < (this.bundle != null ? this.bundle.y : ~~(this.height / 2))) d =  -d;
                }
                else {
                    if(e.x < (this.bundle != null ? this.bundle.x : ~~(this.width / 2))) d =  -d;
                }
                this.position.setOffset(this.position.offset + d);
            }
        };

        this.calcPreferredSize = function (target){
            var ps1 = pkg.getPreferredSize(this.incBt), 
                ps2 = pkg.getPreferredSize(this.decBt),
                ps3 = pkg.getPreferredSize(this.bundle);

            if (this.type == L.HORIZONTAL){
                ps1.width += (ps2.width + ps3.width);
                ps1.height = Math.max((ps1.height > ps2.height ? ps1.height : ps2.height), ps3.height);
            }
            else {
                ps1.height += (ps2.height + ps3.height);
                ps1.width = Math.max((ps1.width > ps2.width ? ps1.width : ps2.width), ps3.width);
            }
            return ps1;
        };

        this.doLayout = function(target){
            var right  = this.getRight(), 
                top    = this.getTop(), 
                bottom = this.getBottom(),
                left   = this.getLeft(), 
                ew     = this.width - left - right, 
                eh     = this.height - top - bottom,
                b      = (this.type == L.HORIZONTAL), 
                ps1    = pkg.getPreferredSize(this.decBt),
                ps2    = pkg.getPreferredSize(this.incBt),
                minbs  = pkg.Scroll.MIN_BUNDLE_SIZE;

            this.decBt.setSize(b ? ps1.width : ew, b ? eh : ps1.height);
            this.decBt.setLocation(left, top);

            this.incBt.setSize(b ? ps2.width : ew, b ? eh : ps2.height);
            this.incBt.setLocation(b ? this.width - right - ps2.width 
                                     : left, b ? top : this.height - bottom - ps2.height);

            if (this.bundle != null && this.bundle.isVisible){
                var am = this.amount();
                if (am > minbs) {
                    var bsize = Math.max(Math.min(~~((this.extra * am) / this.max), am - minbs), minbs);
                    this.bundle.setSize(b ? bsize : ew, b ? eh : bsize);
                    this.bundle.setLocation(b ? this.value2pixel() : left, b ? top : this.value2pixel());
                }
                else this.bundle.setSize(0, 0);
            }
        };

        /**
         * Set the specified maximum value of the scroll component 
         * @param {Inetger} m a maximum value
         * @method setMaximum
         */
        this.setMaximum = function (m){
            if(m != this.max){
                this.max = m;
                if (this.position.offset > this.max) this.position.setOffset(this.max);
                this.vrp();
            }
        };

        this.setPosition = function(p){
            if(p != this.position){
                if (this.position != null) this.position._.remove(this);
                this.position = p;
                if(this.position != null){
                    this.position._.add(this);
                    this.position.setMetric(this);
                    this.position.setOffset(0);
                }
            }
        };

        this.setExtraSize = function(e){
            if(e != this.extra){
                this.extra = e;
                this.vrp();
            }
        };
    },

    function(t) {
        if (t != L.VERTICAL && t != L.HORIZONTAL) {
            throw new Error($invalidA);
        }
        this.incBt = this.decBt = this.bundle = this.position = null;
        this.bundleLoc = this.type = 0;
        this.startDragLoc = Number.MAX_VALUE;
        this.$super(this);

        this.add(L.CENTER, t == L.VERTICAL ? new pkg.Scroll.VBundle()    : new pkg.Scroll.HBundle());
        this.add(L.TOP   , t == L.VERTICAL ? new pkg.Scroll.VDecButton() : new pkg.Scroll.HDecButton());
        this.add(L.BOTTOM, t == L.VERTICAL ? new pkg.Scroll.VIncButton() : new pkg.Scroll.HIncButton());

        this.type = t;
        this.setPosition(new zebra.util.Position(this));
    },

    function kidAdded(index,id,lw){
        this.$super(index, id, lw);
        if(L.CENTER == id) this.bundle = lw;
        else {
            if(L.BOTTOM == id){
                this.incBt = lw;
                this.incBt._.add(this);
            }
            else {
                if(L.TOP == id){
                    this.decBt = lw;
                    this.decBt._.add(this);
                }
                else throw new Error($invalidC);
            }
        }
    },

    function kidRemoved(index,lw){
        this.$super(index, lw);
        if(lw == this.bundle) this.bundle = null;
        else {
            if(lw == this.incBt){
                this.incBt._.remove(this);
                this.incBt = null;
            }
            else {
                if(lw == this.decBt){
                    this.decBt._.remove(this);
                    this.decBt = null;
                }
            }
        }
    }
]);

/**
 * Scroll UI panel. The component is used to manage scrolling 
 * for a children UI component that occupies more space than 
 * it is available.
 * @param {zebra.ui.Panel} [c] an UI component that has to 
 * be placed into scroll panel  
 * @param {Integer} [barMask] a scroll bars mask that allows 
 * developers to control vertical and 
 * horizontal scroll bars visibility.  
 * @constructor
 * @class zebra.ui.ScrollPan
 * @extends {zebra.ui.Panel}
 */
pkg.ScrollPan = Class(pkg.Panel, [
    function $clazz() {
        this.ContentPan = Class(pkg.Panel, [
            function(c){
                this.$super(new L.RasterLayout(L.USE_PS_SIZE));
                this.scrollManager = new pkg.ScrollManager(c, [
                    function $prototype() {
                        this.getSX   = function() { return this.target.x; };
                        this.getSY   = function() { return this.target.y; };
                        this.updated = function(sx,sy,psx,psy) { this.target.setLocation(sx, sy); };
                    }
                ]);
                this.add(c);
            }
        ]);
    },

    function $prototype() {
        /**
         * Indicate if the scroll bars should be hidden 
         * when they are not active
         * @attribute autoHide
         * @type {Boolean}
         * @readOnly
         */
        this.autoHide  = false;
        this.$interval = 0;

        /**
         * Set the given auto hide state. 
         * @param  {Boolean} b an auto hide state.  
         * @method setAutoHide
         */
        this.setAutoHide = function(b) {
            if (this.autoHide != b) {
                this.autoHide = b;
                if (this.hBar != null) {
                    if (this.hBar.incBt != null) this.hBar.incBt.setVisible(!b);
                    if (this.hBar.decBt != null) this.hBar.decBt.setVisible(!b);
                } 

                if (this.vBar != null) {
                    if (this.vBar.incBt != null) this.vBar.incBt.setVisible(!b);
                    if (this.vBar.decBt != null) this.vBar.decBt.setVisible(!b);
                } 

                if (this.$interval != 0) {
                    clearInterval(this.$interval);
                    $this.$interval = 0;
                }

                this.vrp();
            }
        };

        this.scrolled = function (psx,psy){
            try {
                this.validate();
                this.isPosChangedLocked = true;
                
                if (this.hBar != null) {
                    this.hBar.position.setOffset( -this.scrollObj.scrollManager.getSX());
                }
                
                if (this.vBar != null) {
                    this.vBar.position.setOffset( -this.scrollObj.scrollManager.getSY());
                }
                
                if (this.scrollObj.scrollManager == null) this.invalidate();
            }
            catch(e) { throw e; }
            finally  { this.isPosChangedLocked = false; }
        };

        this.calcPreferredSize = function (target){ 
            return pkg.getPreferredSize(this.scrollObj); 
        };

        this.doLayout = function (target){
            var sman   = (this.scrollObj == null) ? null : this.scrollObj.scrollManager,
                right  = this.getRight(), 
                top    = this.getTop(), 
                bottom = this.getBottom(), 
                left   = this.getLeft(),
                ww     = this.width  - left - right,  maxH = ww, 
                hh     = this.height - top  - bottom, maxV = hh,
                so     = this.scrollObj.getPreferredSize(),
                vps    = this.vBar == null ? { width:0, height:0 } : this.vBar.getPreferredSize(),
                hps    = this.hBar == null ? { width:0, height:0 } : this.hBar.getPreferredSize();

            // compensate scrolled vertical size by reduction of horizontal bar height if necessary
            // autoHidded scrollbars don't have an influence to layout
            if (this.hBar != null && this.autoHide === false &&
                  (so.width  > ww ||
                  (so.height > hh && so.width > (ww - vps.width))))
            {
                maxV -= hps.height;
            }
            maxV = so.height > maxV ? (so.height - maxV) :  -1;
            
            // compensate scrolled horizontal size by reduction of vertical bar width if necessary
            // autoHidded scrollbars don't have an influence to layout
            if (this.vBar != null && this.autoHide === false &&
                  (so.height > hh ||
                  (so.width > ww && so.height > (hh - hps.height))))
            {
                maxH -= vps.width;
            }
            maxH = so.width > maxH ? (so.width - maxH) :  -1;
           
            var sy = sman.getSY(), sx = sman.getSX();
            if (this.vBar != null) {
                if (maxV < 0) {
                    if (this.vBar.isVisible){
                        this.vBar.setVisible(false);
                        sman.scrollTo(sx, 0);
                        this.vBar.position.setOffset(0);
                    }
                    sy = 0;
                }
                else this.vBar.setVisible(true);
            }

            if (this.hBar != null){
                if (maxH < 0){
                    if (this.hBar.isVisible){
                        this.hBar.setVisible(false);
                        sman.scrollTo(0, sy);
                        this.hBar.position.setOffset(0);
                    }
                }
                else this.hBar.setVisible(true);
            }

            if (this.scrollObj.isVisible){
                this.scrollObj.setLocation(left, top);
                this.scrollObj.setSize(ww - (this.autoHide === false && this.vBar != null && this.vBar.isVisible ? vps.width  : 0), 
                                       hh - (this.autoHide === false && this.hBar != null && this.hBar.isVisible ? hps.height : 0));
            }

            if (this.$interval === 0 && this.autoHide) {
                hps.height = vps.width = 1;
            }

            if (this.hBar != null && this.hBar.isVisible){
                this.hBar.setLocation(left, this.height - bottom - hps.height);
                this.hBar.setSize(ww - (this.vBar != null && this.vBar.isVisible ? vps.width : 0), hps.height);
                this.hBar.setMaximum(maxH);
            }

            if (this.vBar != null && this.vBar.isVisible){
                this.vBar.setLocation(this.width - right - vps.width, top);
                this.vBar.setSize(vps.width, hh -  (this.hBar != null && this.hBar.isVisible ? hps.height : 0));
                this.vBar.setMaximum(maxV);
            }
        };

        this.posChanged = function (target,prevOffset,prevLine,prevCol){
            if (this.isPosChangedLocked === false){

                //!!! review the code below
                if (this.autoHide) { 
                    this.$dontHide = true;
                    if (this.$interval === 0 && ((this.vBar != null && this.vBar.isVisible) || 
                                                 (this.hBar != null && this.hBar.isVisible)    )) 
                    {
                        var $this = this;
                        if (this.vBar) this.vBar.toFront();
                        if (this.hBar) this.hBar.toFront();
                        this.vrp();
                        this.$interval = setInterval(function() { 
                            if ($this.$dontHide || ($this.vBar != null && pkg.$mouseMoveOwner == $this.vBar)|| 
                                                   ($this.hBar != null && pkg.$mouseMoveOwner == $this.hBar)  ) 
                            {
                                $this.$dontHide = false;
                            }
                            else {
                                clearInterval($this.$interval);
                                $this.$interval = 0;
                                $this.doLayout();
                            }
                        }, 500); 
                    }
                }

                if (this.vBar != null && this.vBar.position == target) { 
                    this.scrollObj.scrollManager.scrollYTo(-this.vBar.position.offset);
                }
                else {
                    if (this.hBar != null) {
                        this.scrollObj.scrollManager.scrollXTo(-this.hBar.position.offset);
                    }
                }
            }
        };
    },

    function () { this.$this(null, L.HORIZONTAL | L.VERTICAL); },
    function (c){ this.$this(c, L.HORIZONTAL | L.VERTICAL); },

    function (c, barMask){
        /**
         * Vertical scroll bar component
         * @attribute vBar
         * @type {zebra.ui.Scroll}
         * @readOnly
         */

        /**
         * Horizontal scroll bar component
         * @attribute hBar
         * @type {zebra.ui.Scroll}
         * @readOnly
         */


        this.hBar = this.vBar = this.scrollObj = null;
        this.isPosChangedLocked = false;
        this.$super();

        if ((L.HORIZONTAL & barMask) > 0) {
            this.add(L.BOTTOM, new pkg.Scroll(L.HORIZONTAL));
        }

        if ((L.VERTICAL & barMask) > 0) {
            this.add(L.RIGHT, new pkg.Scroll(L.VERTICAL));
        }
        
        if (c != null) this.add(L.CENTER, c);
    },

    function setIncrements(hUnit,hPage,vUnit,vPage){
        if (this.hBar != null){
            if (hUnit !=  -1) this.hBar.unitIncrement = hUnit;
            if (hPage !=  -1) this.hBar.pageIncrement = hPage;
        }

        if (this.vBar != null){
            if (vUnit !=  -1) this.vBar.unitIncrement = vUnit;
            if (vPage !=  -1) this.vBar.pageIncrement = vPage;
        }
    },

    function insert(i,ctr,c){
        if (L.CENTER == ctr && c.scrollManager == null) { 
            c = new pkg.ScrollPan.ContentPan(c);
        }
        return this.$super(i, ctr, c);
    },

    function kidAdded(index,id,comp){
        this.$super(index, id, comp);
        if (L.CENTER == id){
            this.scrollObj = comp;
            this.scrollObj.scrollManager._.add(this);
        }

        if (L.BOTTOM  == id || L.TOP == id){
            this.hBar = comp;
            this.hBar.position._.add(this);
        }
        else {
            if (L.LEFT == id || L.RIGHT == id){
                this.vBar = comp;
                this.vBar.position._.add(this);
            }
        }
    },

    function kidRemoved(index,comp){
        this.$super(index, comp);
        if (comp == this.scrollObj){
            this.scrollObj.scrollManager._.remove(this);
            this.scrollObj = null;
        }
        else {
            if (comp == this.hBar){
                this.hBar.position._.remove(this);
                this.hBar = null;
            }
            else {
                if (comp == this.vBar){
                    this.vBar.position._.remove(this);
                    this.vBar = null;
                }
            }
        }
    }
]);

/**
 * Tabs UI panel. The component is used to organize switching 
 * between number of pages where every page is an UI component.
 * @param {Integer} [o] the tab panel orientation:
 
      zebra.layout.TOP
      zebra.layout.BOTTOM
      zebra.layout.LEFT
      zebra.layout.RIGHT

 * @class zebra.ui.Tabs
 * @constructor
 * @extends {zebra.ui.Panel}
 */

/**
 * Fired when a new tab page has been selected 

      tabs._.add(function (src, selectedIndex) {
         ...
      });

 * @event selected
 * @param {zebra.ui.Tabs} src a tabs component that triggers the event
 * @param {Integer} selectedIndex a tab page index that has been selected
 */
pkg.Tabs = Class(pkg.Panel, MouseListener, KeyListener, [
    function $prototype() {
        this.mouseMoved = function(e) {
            var i = this.getTabAt(e.x, e.y);
            if (this.overTab != i) {
                //!!! var tr1 = (this.overTab >= 0) ? this.getTabBounds(this.overTab) : null;
                //!!!var tr2 = (i >= 0) ? this.getTabBounds(i) : null;
                //!!!if (tr1 && tr2) zebra.util.unite();
                this.overTab = i;
                if (this.views["tabover"] != null) {
                    this.repaint(this.tabAreaX, this.tabAreaY, this.tabAreaWidth, this.tabAreaHeight);
                }
            }
        };

        this.mouseDragEnded = function(e) {
            var i = this.getTabAt(e.x, e.y);
            if (this.overTab != i) {
                this.overTab = i;
                if (this.views["tabover"] != null) {
                    this.repaint(this.tabAreaX, this.tabAreaY, this.tabAreaWidth, this.tabAreaHeight);
                }
            }
        };

        this.mouseExited = function(e) {
            if (this.overTab >= 0) {
                this.overTab = -1;
                if (this.views["tabover"] != null) {
                    this.repaint(this.tabAreaX, this.tabAreaY, this.tabAreaWidth, this.tabAreaHeight);
                }
            }
        };

        /**
         * Navigate to a next tab page following the given direction starting from the given page
         * @param  {Integer} page a starting page index
         * @param  {Integer} d    a navigation direction. 1 means forward and -1 mens backward 
         * @return {Integer}      a new tab page index 
         * @method next 
         */
        this.next =  function (page, d){
            for(; page >= 0 && page < ~~(this.pages.length / 2); page += d) {
                if (this.isTabEnabled(page)) return page;
            }
            return -1;
        };

        this.getTitleInfo = function(){
            var b = (this.orient == L.LEFT || this.orient == L.RIGHT),
                res = b ? { x:this.tabAreaX, y:0, width:this.tabAreaWidth, height:0, orient:this.orient }
                        : { x:0, y:this.tabAreaY, width:0, height:this.tabAreaHeight, orient:this.orient };
            if(this.selectedIndex >= 0){
                var r = this.getTabBounds(this.selectedIndex);
                if(b){
                    res[1] = r.y;
                    res[3] = r.height;
                }
                else{
                    res[0] = r.x;
                    res[2] = r.width;
                }
            }
            return res;
        };

        this.canHaveFocus = function(){
            return true;
        };

        this.getTabView = function (index){
            var data = this.pages[2 * index];
            if (data.paint) return data;
            this.render.target.setValue(data.toString());
            return this.render;
        };

        /**
         * Test if the given tab page is in enabled state
         * @param  {Integer} index a tab page index
         * @return {Boolean} a tab page state
         * @method isTabEnabled  
         */
        this.isTabEnabled = function (index){
            return this.kids[index].isEnabled;
        };

        this.paint = function(g){
            //!!!var ts = g.getTopStack(), cx = ts.x, cy = ts.y, cw = ts.width, ch = ts.height;

            if(this.selectedIndex > 0){
                var r = this.getTabBounds(this.selectedIndex);
                //!!!! if(this.orient == L.LEFT || this.orient == L.RIGHT)
                //     g.clipRect(r.x, this.tabAreaY, r.width, r.y - this.tabAreaY);
                // else
                //     g.clipRect(this.tabAreaX, r.y, r.x - this.tabAreaX, r.height);
            }

            for(var i = 0;i < this.selectedIndex; i++) this.paintTab(g, i);

            if (this.selectedIndex >= 0){
                //!!!g.setClip(cx, cy, cw, ch);
                var r = this.getTabBounds(this.selectedIndex);
                //!!!! if(this.orient == L.LEFT || this.orient == L.RIGHT)
                //     g.clipRect(r.x, r.y + r.height, r.width, this.height - r.y - r.height);
                // else
                //     g.clipRect(r.x + r.width, r.y, this.width - r.x - r.width, r.height);
            }

            for(var i = this.selectedIndex + 1;i < ~~(this.pages.length / 2); i++) this.paintTab(g, i);

            //!!!!if (cw > 0 && ch > 0) g.setClip(cx, cy, cw, ch);

            if (this.selectedIndex >= 0){
                this.paintTab(g, this.selectedIndex);
                if (this.hasFocus()) this.drawMarker(g, this.getTabBounds(this.selectedIndex));
            }
        };

        this.drawMarker = function(g,r){
            var marker = this.views["marker"];
            if(marker != null){
                var bv = this.views["tab"];
                marker.paint(g, r.x + bv.getLeft(), r.y + bv.getTop(),
                                r.width - bv.getLeft() - bv.getRight(),
                                r.height - bv.getTop() - bv.getBottom(), this);
            }
        };

        this.paintTab = function (g, pageIndex){
            var b = this.getTabBounds(pageIndex), page = this.kids[pageIndex], vs = this.views,
                tab = vs["tab"], tabover = vs["tabover"], tabon = vs["tabon"];

            if(this.selectedIndex == pageIndex && tabon != null) {
                tabon.paint(g, b.x, b.y, b.width, b.height, page);
            }
            else {
                tab.paint(g, b.x, b.y, b.width, b.height, page);
            }

            if (this.overTab >= 0 && this.overTab == pageIndex && tabover != null) {
                tabover.paint(g, b.x, b.y, b.width, b.height, page);
            }

            var v = this.getTabView(pageIndex),
                ps = v.getPreferredSize(), px = b.x + L.xAlignment(ps.width, L.CENTER, b.width),
                py = b.y + L.yAlignment(ps.height, L.CENTER, b.height);

            v.paint(g, px, py, ps.width, ps.height, page);
            if (this.selectedIndex == pageIndex) {
                v.paint(g, px + 1, py, ps.width, ps.height, page);
            }
        };

        this.getTabBounds = function(i){
            return this.pages[2 * i + 1];
        };

        this.calcPreferredSize = function(target){
            var max = L.getMaxPreferredSize(target);
            if(this.orient == L.BOTTOM || this.orient == L.TOP){
                max.width = Math.max(2 * this.sideSpace + max.width, this.tabAreaWidth);
                max.height += this.tabAreaHeight;
            }
            else{
                max.width += this.tabAreaWidth;
                max.height = Math.max(2 * this.sideSpace + max.height, this.tabAreaHeight);
            }
            max.width  += (this.hgap * 2);
            max.height += (this.vgap * 2);
            return max;
        };

        this.doLayout = function(target){
            var right = this.getRight(), top = this.getTop(), 
                bottom = this.getBottom(), left = this.getLeft(),
                b = (this.orient == L.TOP || this.orient == L.BOTTOM);
          
            if (b) {
                this.tabAreaX = left;
                this.tabAreaY = (this.orient == L.TOP) ? top : this.height - bottom - this.tabAreaHeight;
            }
            else {
                this.tabAreaX = (this.orient == L.LEFT) ? left : this.width - right - this.tabAreaWidth;
                this.tabAreaY = top;
            }
            var count = ~~(this.pages.length / 2), sp = 2*this.sideSpace,
                xx = b ? (this.tabAreaX + this.sideSpace)
                       : ((this.orient == L.LEFT) ? (this.tabAreaX + this.upperSpace) : this.tabAreaX + 1),
                yy = b ? (this.orient == L.TOP ? this.tabAreaY + this.upperSpace : this.tabAreaY + 1)
                       : (this.tabAreaY + this.sideSpace);

            for(var i = 0;i < count; i++ ){
                var r = this.getTabBounds(i);
                if(b){
                    r.x = xx;
                    r.y = yy;
                    xx += r.width;
                    if(i == this.selectedIndex) xx -= sp;
                }
                else{
                    r.x = xx;
                    r.y = yy;
                    yy += r.height;
                    if(i == this.selectedIndex) yy -= sp;
                }
            }

            for(var i = 0;i < count; i++){
                var l = this.kids[i];
                if(i == this.selectedIndex){
                    if(b) {
                        l.setSize(this.width - left - right - 2 * this.hgap,
                                  this.height - this.tabAreaHeight - top - bottom - 2 * this.vgap);
                        l.setLocation(left + this.hgap,
                                     ((this.orient == L.TOP) ? top + this.tabAreaHeight : top) + this.vgap);
                    }
                    else {
                        l.setSize(this.width - this.tabAreaWidth - left - right - 2 * this.hgap,
                                  this.height - top - bottom - 2 * this.vgap);
                        l.setLocation(((this.orient == L.LEFT) ? left + this.tabAreaWidth : left) + this.hgap,
                                      top + this.vgap);
                    }
                }
                else { 
                    l.setSize(0, 0);
                }
            }

            if (this.selectedIndex >= 0){
                var r = this.getTabBounds(this.selectedIndex), dt = 0;
                if(b){
                    r.x -= this.sideSpace;
                    r.y -= (this.orient == L.TOP) ? this.upperSpace : this.brSpace;
                    dt = (r.x < left) ? left - r.x
                                      : (r.x + r.width > this.width - right) ? this.width - right - r.x - r.width : 0;
                }
                else{
                    r.x -= (this.orient == L.LEFT) ? this.upperSpace : this.brSpace;
                    r.y -= this.sideSpace;
                    dt = (r.y < top) ? top - r.y
                                     : (r.y + r.height > this.height - bottom) ? this.height - bottom - r.y - r.height : 0;
                }
                for(var i = 0;i < count; i ++ ){
                    var br = this.getTabBounds(i);
                    if(b) br.x += dt;
                    else br.y += dt;
                }
            }
        };

        this.recalc = function(){
            var count = ~~(this.pages.length / 2);
            if (count > 0){
                this.tabAreaHeight = this.tabAreaWidth = 0;
                var bv = this.views["tab"], b = (this.orient == L.LEFT || this.orient == L.RIGHT), max = 0,
                    hadd = 2 * this.hTabGap + bv.getLeft() + bv.getRight(),
                    vadd = 2 * this.vTabGap + bv.getTop() + bv.getBottom();

                for(var i = 0;i < count; i++){
                    var ps = this.getTabView(i).getPreferredSize(), r = this.getTabBounds(i);
                    if(b){
                        r.height = ps.height + vadd;
                        if(ps.width + hadd > max) max = ps.width + hadd;
                        this.tabAreaHeight += r.height;
                    }
                    else{
                        r.width = ps.width + hadd;
                        if(ps.height + vadd > max) max = ps.height + vadd;
                        this.tabAreaWidth += r.width;
                    }
                }
                for(var i = 0; i < count; i++ ){
                    var r = this.getTabBounds(i);
                    if(b) r.width  = max;
                    else  r.height = max;
                }
                if (b) {
                    this.tabAreaWidth = max + this.upperSpace + 1;
                    this.tabAreaHeight += (2 * this.sideSpace);
                }
                else {
                    this.tabAreaWidth += (2 * this.sideSpace);
                    this.tabAreaHeight = this.upperSpace + max + 1;
                }

                if (this.selectedIndex >= 0) {
                    var r = this.getTabBounds(this.selectedIndex);
                    if (b) {
                        r.height += 2 * this.sideSpace;
                        r.width += (this.brSpace + this.upperSpace);
                    }
                    else {
                        r.height += (this.brSpace + this.upperSpace);
                        r.width += 2 * this.sideSpace;
                    }
                }
            }
        };

        /**
         * Get tab index located at the given location
         * @param  {Integer} x a x coordinate
         * @param  {Integer} y a y coordinate
         * @return {Integer} an index of the tab that is 
         * detected at the given location. -1 if no any 
         * tab can be found
         * @method getTabAt
         */
        this.getTabAt = function(x,y){
            this.validate();
            if(x >= this.tabAreaX && y >= this.tabAreaY &&
                x < this.tabAreaX + this.tabAreaWidth &&
                y < this.tabAreaY + this.tabAreaHeight)
            {
                for(var i = 0; i < ~~(this.pages.length / 2); i++ ) {
                    var tb = this.getTabBounds(i);
                    if (x >= tb.x && y >= tb.y && x < tb.x + tb.width && y < tb.y + tb.height) return i;
                }
            }
            return -1;
        };

        this.keyPressed = function(e){
            if(this.selectedIndex != -1 && this.pages.length > 0){
                switch(e.code) {
                    case KE.UP:
                    case KE.LEFT:
                        var nxt = this.next(this.selectedIndex - 1,  -1);
                        if(nxt >= 0) this.select(nxt);
                        break;
                    case KE.DOWN:
                    case KE.RIGHT:
                        var nxt = this.next(this.selectedIndex + 1, 1);
                        if(nxt >= 0) this.select(nxt);
                        break;
                }
            }
        };

        this.mouseClicked = function(e){
            if (e.isActionMask()){
                var index = this.getTabAt(e.x, e.y);
                if (index >= 0 && this.isTabEnabled(index)) this.select(index);
            }
        };

        /**
         * Switch to the given tab page 
         * @param  {Integer} index a tab page index to be navigated 
         * @method select
         */
        this.select = function(index){
            if (this.selectedIndex != index){
                this.selectedIndex = index;
                this._.fired(this, this.selectedIndex);
                this.vrp();
            }
        };

        this.setTitle =  function(pageIndex,data){
            if (this.pages[2 * pageIndex] != data){
                this.pages[pageIndex * 2] = data;
                this.vrp();
            }
        };

        this.setTabSpaces = function(vg,hg,sideSpace,upperSpace,brSpace){
            if (this.vTabGap != vg              || 
                this.hTabGap != hg              || 
                sideSpace    != this.sideSpace  ||
                upperSpace   != this.upperSpace || 
                brSpace      != this.brSpace      )
            {
                this.vTabGap = vg;
                this.hTabGap = hg;
                this.sideSpace = sideSpace;
                this.upperSpace = upperSpace;
                this.brSpace = brSpace;
                this.vrp();
            }
        };

        this.setGaps = function (vg,hg){
            if(this.vgap != vg || hg != this.hgap){
                this.vgap = vg;
                this.hgap = hg;
                this.vrp();
            }
        };

        this.setTitleAlignment = function(o){
            o = L.$constraints(o);

            if (o != L.TOP && o != L.BOTTOM && o != L.LEFT && o != L.RIGHT) {
                throw new Error($invalidA);
            }

            if (this.orient != o){
                this.orient = o;
                this.vrp();
            }
        };

        /**
         * Set enabled state for the given tab page
         * @param  {Integer} i a tab page index
         * @param  {boolean} b a tab page enabled state
         * @method enableTab
         */
        this.enableTab = function(i,b){
            var c = this.kids[i];
            if(c.isEnabled != b){
                c.setEnabled(b);
                if (b === false && this.selectedIndex == i) {
                    this.select(-1);
                }
                this.repaint();
            }
        };
    },

    function () {
        this.$this(L.TOP);
    },

    function (o){
        /**
         * Selected tab page index
         * @attribute selectedIndex
         * @type {Integer}
         * @readOnly
         */


        /**
         * Tab orientation 
         * @attribute orient
         * @type {Integer}
         * @readOnly
         */

        this.brSpace = this.upperSpace = this.vgap = this.hgap = this.tabAreaX = 0;
        this.hTabGap = this.vTabGap = this.sideSpace = 1;

        this.tabAreaY = this.tabAreaWidth = this.tabAreaHeight = 0;
        this.overTab = this.selectedIndex = -1;
        this.orient = L.$constraints(o);
        this._ = new Listeners();
        this.pages = [];
        this.views = {};
        this.render = new pkg.TextRender(new zebra.data.SingleLineTxt(""));

        if (pkg.Tabs.font != null) this.render.setFont(pkg.Tabs.font);
        if (pkg.Tabs.fontColor != null) this.render.setColor(pkg.Tabs.fontColor);

        this.$super();

        // since alignment pass as the constructor argument the setter has to be called after $super
        // because $super can re-set title alignment
        this.setTitleAlignment(o);
    },

    function focused(){
        this.$super();
        if (this.selectedIndex >= 0){
            var r = this.getTabBounds(this.selectedIndex);
            this.repaint(r.x, r.y, r.width, r.height);
        }
        else {
            if (!this.hasFocus()) {
                this.select(this.next(0, 1));
            }
        }
    },

    function insert(index,constr,c){
        this.pages.splice(index * 2, 0, constr == null ? "Page " + index
                                                       : constr, { x:0, y:0, width:0, height:0 });
        var r = this.$super(index, constr, c);
        if (this.selectedIndex < 0) this.select(this.next(0, 1));
        return r;
    },

    function removeAt(i){
        if (this.selectedIndex == i) this.select( -1);
        this.pages.splice(i * 2, 2);
        this.$super(i);
    },

    function removeAll(){
        if (this.selectedIndex >= 0) this.select( -1);
        this.pages.splice(0, this.pages.length);
        this.pages.length = 0;
        this.$super();
    },

    function setSize(w,h){
        if (this.width != w || this.height != h){
            if (this.orient == L.RIGHT || this.orient == L.BOTTOM) this.tabAreaX =  -1;
            this.$super(w, h);
        }
    }
]);
pkg.Tabs.prototype.setViews = pkg.$ViewsSetter;

/**
 * Slider UI component class.
 * @class  zebra.ui.Slider
 * @extends {zebra.ui.Panel}
 */
pkg.Slider = Class(pkg.Panel, KeyListener, MouseListener, Actionable, [
    function $prototype() {
        this.max = this.min = this.value = this.roughStep = this.exactStep = 0;
        this.netSize = this.gap = 3;
        this.correctDt = this.scaleStep = this.psW = this.psH = 0;
        this.intervals = this.pl = null;

        this.paintNums = function(g,loc){
            if(this.isShowTitle)
                for(var i = 0;i < this.pl.length; i++ ){
                    var render = this.provider.getView(this, this.getPointValue(i)),
                        d = render.getPreferredSize();

                    if (this.orient == L.HORIZONTAL) {
                        render.paint(g, this.pl[i] - ~~(d.width / 2), loc, d.width, d.height, this);
                    }
                    else {
                        render.paint(g, loc, this.pl[i] - ~~(d.height / 2),  d.width, d.height, this);
                    }
                }
        };

        this.getScaleSize = function(){
            var bs = this.views["bundle"].getPreferredSize();
            return (this.orient == L.HORIZONTAL ? this.width - this.getLeft() -
                                                  this.getRight() - bs.width
                                                : this.height - this.getTop() -
                                                  this.getBottom() - bs.height) - 2;
        };

        this.getScaleLocation = function(){
            var bs = this.views["bundle"].getPreferredSize();
            return (this.orient == L.HORIZONTAL ? this.getLeft() + ~~(bs.width / 2)
                                                : this.getTop()  + ~~(bs.height/ 2)) + 1;
        };

        this.mouseDragged = function(e){
            if(this.dragged) {
                this.setValue(this.findNearest(e.x + (this.orient == L.HORIZONTAL ? this.correctDt : 0),
                                               e.y + (this.orient == L.HORIZONTAL ? 0 : this.correctDt)));
            }
        };

        this.paint = function(g){
            if (this.pl == null){
                this.pl = Array(this.intervals.length);
                for(var i = 0, l = this.min;i < this.pl.length; i ++ ){
                    l += this.intervals[i];
                    this.pl[i] = this.value2loc(l);
                }
            }

            var left = this.getLeft(), top = this.getTop(), 
                right = this.getRight(), bottom = this.getBottom(),
                bnv = this.views["bundle"], gauge = this.views["gauge"],
                bs = bnv.getPreferredSize(), gs = gauge.getPreferredSize(),
                w = this.width - left - right - 2, h = this.height - top - bottom - 2;

            if (this.orient == L.HORIZONTAL){
                var topY = top + ~~((h - this.psH) / 2) + 1, by = topY;
                if(this.isEnabled) {
                    gauge.paint(g, left + 1, 
                                   topY + ~~((bs.height - gs.height) / 2), 
                                   w, gs.height, this);
                }
                else{
                    g.setColor("gray");
                    g.strokeRect(left + 1, topY + ~~((bs.height - gs.height) / 2), w, gs.height);
                }
                topY += bs.height;
                if (this.isShowScale){
                    topY += this.gap;
                    g.setColor(this.isEnabled ? this.scaleColor : "gray");
                    g.beginPath();
                    for(var i = this.min;i <= this.max; i += this.scaleStep){
                        var xx = this.value2loc(i) + 0.5;
                        g.moveTo(xx, topY);
                        g.lineTo(xx, topY + this.netSize);
                    }

                    for(var i = 0;i < this.pl.length; i ++ ) {
                        g.moveTo(this.pl[i] + 0.5, topY);
                        g.lineTo(this.pl[i] + 0.5, topY + 2 * this.netSize);
                    }
                    g.stroke();
                    topY += (2 * this.netSize);
                }
                this.paintNums(g, topY);
                bnv.paint(g, this.getBundleLoc(this.value), by, bs.width, bs.height, this);
            }
            else {
                var leftX = left + ~~((w - this.psW) / 2) + 1, bx = leftX;
                if (this.isEnabled) {
                    gauge.paint(g, leftX + ~~((bs.width - gs.width) / 2), 
                                   top + 1, gs.width, h, this);
                }
                else {
                    g.setColor("gray");
                    g.strokeRect(leftX + ~~((bs.width - gs.width) / 2),
                                 top + 1, gs.width, h);
                }

                leftX += bs.width;
                if (this.isShowScale) {
                    leftX += this.gap;
                    g.setColor(this.scaleColor);
                    g.beginPath();
                    for(var i = this.min;i <= this.max; i += this.scaleStep){
                        var yy = this.value2loc(i) + 0.5;
                        g.moveTo(leftX, yy);
                        g.lineTo(leftX + this.netSize, yy);
                    }
                    for(var i = 0;i < this.pl.length; i ++ ) {
                        g.moveTo(leftX, this.pl[i] + 0.5);
                        g.lineTo(leftX + 2 * this.netSize, this.pl[i] + 0.5);
                    }
                    g.stroke();
                    leftX += (2 * this.netSize);
                }
                this.paintNums(g, leftX);
                bnv.paint(g, bx, this.getBundleLoc(this.value), bs.width, bs.height, this);
            }

            if (this.hasFocus() && this.views["marker"]) {
                this.views["marker"].paint(g, left, top, w + 2, h + 2, this);
            }
        };

        this.findNearest = function(x,y){
            var v = this.loc2value(this.orient == L.HORIZONTAL ? x : y);
            if (this.isIntervalMode){
                var nearest = Number.MAX_VALUE, res = 0;
                for(var i = 0;i < this.intervals.length; i ++ ){
                    var pv = this.getPointValue(i), dt = Math.abs(pv - v);
                    if(dt < nearest){
                        nearest = dt;
                        res = pv;
                    }
                }
                return res;
            }
            v = this.exactStep * ~~((v + v % this.exactStep) / this.exactStep);
            if (v > this.max) v = this.max;
            else {
                if(v < this.min) v = this.min;
            }
            return v;
        };

        this.value2loc = function (v){
            return ~~((this.getScaleSize() * (v - this.min)) / (this.max - this.min)) +
                   this.getScaleLocation();
        };

        this.loc2value = function(xy){
            var sl = this.getScaleLocation(), ss = this.getScaleSize();
            if(xy < sl) xy = sl;
            else if(xy > sl + ss) xy = sl + ss;
            return this.min + ~~(((this.max - this.min) * (xy - sl)) / ss);
        };

        this.nextValue = function(value,s,d){
            if (this.isIntervalMode) {
                return this.getNeighborPoint(value, d);
            }

            var v = value + (d * s);
            if(v > this.max) v = this.max;
            else if(v < this.min) v = this.min;
            return v;
        };

        this.getBundleLoc = function(v){
            var bs = this.views["bundle"].getPreferredSize();
            return this.value2loc(v) - (this.orient == L.HORIZONTAL ? ~~(bs.width / 2)
                                                                    : ~~(bs.height / 2));
        };

        this.getBundleBounds = function (v){
            var bs = this.views["bundle"].getPreferredSize();
            return this.orient == L.HORIZONTAL ? { x:this.getBundleLoc(v),
                                                   y:this.getTop() + ~~((this.height - this.getTop() - this.getBottom() - this.psH) / 2) + 1,
                                                   width:bs.width, height:bs.height }
                                               : { x:this.getLeft() + ~~((this.width - this.getLeft() - this.getRight() - this.psW) / 2) + 1,
                                                   y:this.getBundleLoc(v), width:bs.width, height:bs.height };
        };

        this.getNeighborPoint = function (v,d){
            var left = this.min + this.intervals[0], right = this.getPointValue(this.intervals.length - 1);
            if (v < left) return left;
            else {
                if (v > right) return right;
            }

            if (d > 0) {
                var start = this.min;
                for(var i = 0;i < this.intervals.length; i ++ ){
                    start += this.intervals[i];
                    if(start > v) return start;
                }
                return right;
            }
            else {
                var start = right;
                for(var i = this.intervals.length - 1;i >= 0; i--) {
                    if (start < v) return start;
                    start -= this.intervals[i];
                }
                return left;
            }
        };

        this.calcPreferredSize = function(l) {
            return { width:this.psW + 2, height: this.psH + 2 };
        };

        this.recalc = function(){
            var ps = this.views["bundle"].getPreferredSize(),
                ns = this.isShowScale ? (this.gap + 2 * this.netSize) : 0,
                dt = this.max - this.min, hMax = 0, wMax = 0;

            if(this.isShowTitle && this.intervals.length > 0){
                for(var i = 0;i < this.intervals.length; i ++ ){
                    var d = this.provider.getView(this, this.getPointValue(i)).getPreferredSize();
                    if (d.height > hMax) hMax = d.height;
                    if (d.width  > wMax) wMax = d.width;
                }
            }
            if(this.orient == L.HORIZONTAL){
                this.psW = dt * 2 + ps.width;
                this.psH = ps.height + ns + hMax;
            }
            else{
                this.psW = ps.width + ns + wMax;
                this.psH = dt * 2 + ps.height;
            }
        };

        this.setValue = function(v){
            if (v < this.min || v > this.max) {
                throw new Error("Value is out of bounds: " + v);
            }

            var prev = this.value;
            if(this.value != v){
                this.value = v;
                this._.fired(this, prev);
                this.repaint();
            }
        };

        this.getPointValue = function (i){
            var v = this.min + this.intervals[0];
            for(var j = 0; j < i; j++, v += this.intervals[j]);
            return v;
        };

        this.keyPressed = function(e){
            var b = this.isIntervalMode;
            switch(e.code)
            {
                case KE.UP:
                case KE.LEFT:
                    var v = this.nextValue(this.value, this.exactStep,-1);
                    if (v >= this.min) this.setValue(v);
                    break;
                case KE.DOWN:
                case KE.RIGHT:
                    var v = this.nextValue(this.value, this.exactStep, 1);
                    if (v <= this.max) this.setValue(v);
                    break;
                case KE.HOME: this.setValue(b ? this.getPointValue(0) : this.min);break;
                case KE.END:  this.setValue(b ? this.getPointValue(this.intervals.length - 1) 
                                            : this.max);
                              break;
            }
        };

        this.mousePressed = function (e){
            if(e.isActionMask()){
                var x = e.x, y = e.y, bb = this.getBundleBounds(this.value);
                if (x < bb.x || y < bb.y || x >= bb.x + bb.width || y >= bb.y + bb.height) {
                    var l = ((this.orient == L.HORIZONTAL) ? x : y), v = this.loc2value(l);
                    if (this.value != v) {
                        this.setValue(this.isJumpOnPress ? v
                                                         : this.nextValue(this.value, 
                                                                          this.roughStep, 
                                                                          v < this.value ? -1:1));
                    }
                }
            }
        };

        this.mouseDragStarted = function(e){
            var r = this.getBundleBounds(this.value);

            if (e.x >= r.x && e.y >= r.y && 
                e.x < r.x + r.width && 
                e.y < r.y + r.height)
            {
                this.dragged = true;
                this.correctDt = this.orient == L.HORIZONTAL ? r.x + ~~(r.width  / 2) - e.x
                                                             : r.y + ~~(r.height / 2) - e.y;
            }
        };

        this.mouseDragEnded = function(e){ this.dragged = false; };

        this.canHaveFocus = function() { return true; };

        this.getView = function(d,o){
            this.render.target.setValue(o != null ? o.toString() : "");
            return this.render;
        };
    },

    function() { this.$this(L.HORIZONTAL); },

    function (o){
        this._ = new Listeners();
        this.views = {};
        this.isShowScale = this.isShowTitle = true;
        this.dragged = this.isIntervalMode = false;
        this.render = new pkg.BoldTextRender("");
        this.render.setColor("gray");
        this.orient = L.$constraints(o);
        this.setValues(0, 20, [0, 5, 10], 2, 1);
        this.setScaleStep(1);

        this.$super();
        this.views["bundle"] = (o == L.HORIZONTAL ? this.views["hbundle"] : this.views["vbundle"]);

        this.provider = this;
    },

    function focused() { 
        this.$super();
        this.repaint(); 
    },
    
    function setScaleGap(g){
        if (g != this.gap){
            this.gap = g;
            this.vrp();
        }
    },

    function setScaleColor(c){
        if (c != this.scaleColor) {
            this.scaleColor = c;
            if (this.provider == this) this.render.setColor(c);
            this.repaint();
        }
        return this;
    },

    function setScaleStep(s){
        if (s != this.scaleStep){
            this.scaleStep = s;
            this.repaint();
        }
    },

    function setShowScale(b){
        if (this.isShowScale != b){
            this.isShowScale = b;
            this.vrp();
        }
    },

    function setShowTitle(b){
        if (this.isShowTitle != b){
            this.isShowTitle = b;
            this.vrp();
        }
    },

    function setViewProvider(p){
        if (p != this.provider){
            this.provider = p;
            this.vrp();
        }
    },

    function setValues(min,max,intervals,roughStep,exactStep){
        if(roughStep <= 0 || exactStep < 0 || min >= max || 
           min + roughStep > max || min + exactStep > max  ) 
        { 
            throw new Error("Invalid values");
        }

        for(var i = 0, start = min;i < intervals.length; i ++ ){
            start += intervals[i];
            if(start > max || intervals[i] < 0) throw new Error();
        }

        this.min = min;
        this.max = max;
        this.roughStep = roughStep;
        this.exactStep = exactStep;
        this.intervals = Array(intervals.length);

        for(var i=0; i<intervals.length; i++){
            this.intervals[i] = intervals[i];
        }
        
        if(this.value < min || this.value > max) {
            this.setValue(this.isIntervalMode ? min + intervals[0] : min);
        }
        this.vrp();
    },

    function invalidate(){
        this.pl = null;
        this.$super();
    }
]);
pkg.Slider.prototype.setViews = pkg.$ViewsSetter;


pkg.StatusBar = Class(pkg.Panel, [
    function () { this.$this(2); },

    function (gap){
        this.setPaddings(gap, 0, 0, 0);
        this.$super(new L.PercentLayout(Layout.HORIZONTAL, gap));
    },

    function setBorderView(v){
        if(v != this.borderView){
            this.borderView = v;
            for(var i = 0;i < this.kids.length; i++) this.kids[i].setBorder(this.borderView);
            this.repaint();
        }
    },

    function insert(i,s,d){
        d.setBorder(this.borderView);
        this.$super(i, s, d);
    }
]);

/**
 * Toolbar UI component
 * @class zebra.ui.Toolbar
 * @extends {zebra.ui.Panel}
 */
pkg.Toolbar = Class(pkg.Panel, pkg.ChildrenListener, [
    function $clazz() {
        this.Constraints = function(isDec, str) {
            this.isDecorative = arguments.length > 0 ? isDec : false;
            this.stretched = arguments.length > 1 ? str : false;
        };
    },

    function $prototype() {
        var OVER = "over", OUT = "out", PRESSED = "pressed";

        this.isDecorative = function(c){ return c.constraints.isDecorative; };

        this.childInputEvent = function(e){
            if (e.UID == pkg.InputEvent.MOUSE_UID){
                var dc = L.getDirectChild(this, e.source);
                if (this.isDecorative(dc) === false){
                    switch(e.ID) {
                        case ME.ENTERED : this.select(dc, true); break;
                        case ME.EXITED  : if (this.selected != null && L.isAncestorOf(this.selected, e.source)) this.select(null, true); break;
                        case ME.PRESSED : this.select(this.selected, false);break;
                        case ME.RELEASED: this.select(this.selected, true); break;
                    }
                }
            }
        };

        this.recalc = function(){
            var v = this.views, vover = v[OVER], vpressed = v[PRESSED];
            this.leftShift   = Math.max(vover     != null && vover.getLeft      ? vover.getLeft()     : 0,
                                        vpressed  != null && vpressed.getLeft   ? vpressed.getLeft()  : 0);
            this.rightShift  = Math.max(vover     != null && vover.getRight     ? vover.getRight()    : 0 ,
                                        vpressed  != null && vpressed.getRight  ? vpressed.getRight() : 0 );
            this.topShift    = Math.max(vover     != null && vover.getTop       ? vover.getTop()      : 0 ,
                                        vpressed  != null && vpressed.getTop    ? vpressed.getTop()   : 0 );
            this.bottomShift = Math.max(vover     != null && vover.getBottom    ? vover.getBottom()   : 0 ,
                                        vpressed  != null && vpressed.getBottom ? vpressed.getBottom(): 0 );
        };

        this.paint = function(g) {
            for(var i = 0;i < this.kids.length; i++){
                var c = this.kids[i];
                if (c.isVisible && this.isDecorative(c) === false){
                    var v = this.views[(this.selected == c) ? (this.isOver ? OVER : PRESSED) : OUT];
                    if (v != null) {
                        v.paint(g, c.x, this.getTop(),
                                   c.width, this.height - this.getTop() - this.getBottom(), this);
                    }
                }
            }
        };

        this.calcPreferredSize = function(target){
            var w = 0, h = 0, c = 0, b = (this.orient == L.HORIZONTAL);
            for(var i = 0;i < target.kids.length; i++ ){
                var l = target.kids[i];
                if(l.isVisible){
                    var ps = l.getPreferredSize();
                    if (b) {
                        w += (ps.width + (c > 0 ? this.gap : 0));
                        h = ps.height > h ? ps.height : h;
                    }
                    else {
                        w = ps.width > w ? ps.width : w;
                        h += (ps.height + (c > 0 ? this.gap : 0));
                    }
                    c++;
                }
            }
            return { width:  (b ? w + c * (this.leftShift + this.rightShift)
                                : w + this.topShift + this.bottomShift),
                     height: (b ? h + this.leftShift + this.rightShift
                                : h + c * (this.topShift + this.bottomShift)) };
        };

        this.doLayout = function(t){
            var b = (this.orient == L.HORIZONTAL), x = t.getLeft(), y = t.getTop(),
                av = this.topShift + this.bottomShift, ah = this.leftShift + this.rightShift,
                hw = b ? t.height - y - t.getBottom() : t.width - x - t.getRight();

            for (var i = 0;i < t.kids.length; i++){
                var l = t.kids[i];
                if (l.isVisible){
                    var ps = l.getPreferredSize(), str = l.constraints.stretched;
                    if (b) {
                        if (str) ps.height = hw;
                        l.setLocation(x + this.leftShift, y + ((hw - ps.height) / 2  + 0.5) | 0);
                        x += (this.gap + ps.width + ah);
                    }
                    else {
                        if (str) ps.width = hw;
                        l.setLocation(x + (hw - ps.width) / 2, y + this.topShift);
                        y += (this.gap + ps.height + av);
                    }
                    l.setSize(ps.width, ps.height);
                }
            }
        };

        this.select = function (c, state){
            if (c != this.selected || (this.selected != null && state != this.isOver)) {
                this.selected = c;
                this.isOver = state;
                this.repaint();
                if (state === false && c != null) this._.fired(this, c);
            }
        };
    },

    function () { this.$this(L.HORIZONTAL, 4); },

    function (orient,gap){
        orient = L.$constraints(orient);

        if (orient != L.HORIZONTAL && orient != L.VERTICAL) {
            throw new Error("Invalid orientation: " + orient);
        }

        this.selected = null;
        this.isOver = false;
        this._ = new Listeners();
        this.leftShift = this.topShift = this.bottomShift = this.rightShift = 0;

        this.views = {};
        this.orient = L.$constraints(orient);
        this.gap = gap;
        this.$super();
    },

    function addDecorative(c){ this.add(new pkg.Toolbar.Constraints(true), c); },

    function addRadio(g,c){
        var cbox = new pkg.Radiobox(c, g);
        cbox.setCanHaveFocus(false);
        this.add(cbox);
        return cbox;
    },

    function addSwitcher(c){
        var cbox = new pkg.Checkbox(c);
        cbox.setCanHaveFocus(false);
        this.add(cbox);
        return cbox;
    },

    function addImage(img){
        this.validateMetric();
        var pan = new pkg.ImagePan(img);
        pan.setPaddings(this.topShift, this.leftShift + 2, this.bottomShift, this.rightShift+2);
        this.add(pan);
        return pan;
    },

    function addCombo(list){
        var combo = new pkg.Combo(list);
        this.add(new pkg.Toolbar.Constraints(false), combo);
        combo.setPaddings(1, 4, 1, 1);
        return combo;
    },

    function addLine(){
        var line = new pkg.Line(L.VERTICAL);
        this.add(new pkg.Toolbar.Constraints(true, true), line);
        return line;
    },

    function insert(i,id,d){
        if (id == null) id = new pkg.Toolbar.Constraints();
        return this.$super(i, id, d);
    }
]);
pkg.Toolbar.prototype.setViews = pkg.$ViewsSetter;

pkg.VideoPan = Class(pkg.Panel,  [
    function $prototype() {
        this.paint = function(g) {
            g.drawImage(this.video, 0, 0);
        };

        this.run = function() {
            this.repaint();
        };
    },

    function(src) {
        var $this = this;
        this.video = document.createElement("video");
        this.video.setAttribute("src", src);
        this.volume = 0.5;
        this.video.addEventListener("canplaythrough", function() { zebra.util.timer.start($this, 500, 40); }, false);
        this.video.addEventListener("ended", function() { zebra.util.timer.stop($this); $this.ended(); }, false);
        this.$super();
    },

    function ended() {}
]);

pkg.ArrowView = Class(View, [
    function $prototype() {
        this[''] = function (d, col, w) {
            this.direction = d == null ? L.BOTTOM : L.$constraints(d);
            this.color = col == null ? "black" : col;
            this.width = this.height = (w == null ? 6 : w);
        };

        this.paint = function(g, x, y, w, h, d) {
            var s = Math.min(w, h);

            x = x + (w-s)/2;
            y = y + (h-s)/2;

            g.setColor(this.color);
            g.beginPath();
            if (L.BOTTOM == this.direction) {
                g.moveTo(x, y);
                g.lineTo(x + s, y);
                g.lineTo(x + s/2, y + s);
                g.lineTo(x, y);
            }
            else {
                if (L.TOP == this.direction) {
                    g.moveTo(x, y + s);
                    g.lineTo(x + s, y + s);
                    g.lineTo(x + s/2, y);
                    g.lineTo(x, y + s);
                }
                else {
                    if (L.LEFT == this.direction) {
                        g.moveTo(x + s, y);
                        g.lineTo(x + s, y + s);
                        g.lineTo(x, y + s/2);
                        g.lineTo(x + s, y);
                    }
                    else {
                        g.moveTo(x, y);
                        g.lineTo(x, y + s);
                        g.lineTo(x + s, y + s/2);
                        g.lineTo(x, y);
                    }
                }
            }
            g.fill();
        };

        this.getPreferredSize = function () {
            return { width:this.width, height:this.height };
        };
    }
]);

pkg.CheckboxView = Class(View, [
    function() { this.$this("rgb(65, 131, 255)"); },

    function(color) {
        this.color = color;
    },
    
    function $prototype() {
        this.paint = function(g,x,y,w,h,d){        
            g.beginPath();
            g.strokeStyle = this.color;
            g.lineWidth = 2;
            g.moveTo(x + 1, y + 2);
            g.lineTo(x + w - 3, y + h - 3);
            g.stroke();
            g.beginPath();
            g.moveTo(x + w - 2, y + 2);
            g.lineTo(x + 2, y + h - 2);
            g.stroke();
            g.lineWidth = 1;
        };
    }
]);

pkg.BunldeView = Class(View, [
    function() { this.$this(L.VERTICAL); },

    function(dir) {
        this.$this("#AAAAAA", dir);
    },

    function(color, dir) {
        this.color = color;
        this.direction = dir;
    },

    function $prototype() {
        this.paint =  function(g,x,y,w,h,d) {
            if (this.direction == L.VERTICAL) {
                var r = w/2;    
                g.beginPath();
                g.arc(x + r, y + r, r, Math.PI, 0, false);
                g.lineTo(x + w, y + h - r);
                g.arc(x + r, y + h - r, r, 0, Math.PI, false);
                g.lineTo(x, y + r);
            }
            else {
                var r = h/2;    
                g.beginPath();
                g.arc(x + r, y + r, r, 0.5 * Math.PI, 1.5 * Math.PI, false);
                g.lineTo(x + w - r, y);
                g.arc(x + w - r, y + h - r, r, 1.5*Math.PI, 0.5*Math.PI, false);
                g.lineTo(x + r, y + h);
            }
            g.setColor(this.color);
            g.fill();
        };
    }
]);

pkg.TooltipBorder = Class(View, [
    function() {
        this.$this("black", 2);
    },

    function(col, size) {
        this.color = col;
        this.size  = size;
        this.gap   = this.size; 
    },

    function $prototype() {
        this.paint = function (g,x,y,w,h,d) {
            if (this.color != null) {
                var old = g.lineWidth;
                this.outline(g,x,y,w,h,d);
                g.setColor(this.color);
                g.lineWidth = this.size;
                g.stroke();
                g.lineWidth = old;
            }
        };

        this.outline = function(g,x,y,w,h,d) {
            g.beginPath();
            h-=2;
            w-=2;
            x++;
            y++;
            g.moveTo(x + w/2, y);
            g.quadraticCurveTo(x, y, x, y + h * 1/3);
            g.quadraticCurveTo(x, y + (2/3)*h, x + w/4,  y + (2/3)*h);
            g.quadraticCurveTo(x + w/4, y + h, x, y + h);
            g.quadraticCurveTo(x + 3*w/8, y + h, x + w/2, y + (2/3)*h);
            g.quadraticCurveTo(x + w, y + (2/3)*h, x + w, y + h * 1/3);
            g.quadraticCurveTo(x + w, y, x + w/2, y);
            return true;
        };
    }
]);

/**
 * The radio button ticker view.
 * @class  zebra.ui.RadioView
 * @extends zebra.ui.View
 * @constructor 
 * @param {String} [col1] color one to render the outer cycle
 * @param {String} [col2] color tow to render the inner cycle
 */
pkg.RadioView = Class(View, [
    function() {
        this.$this("rgb(15, 81, 205)", "rgb(65, 131, 255)");
    },

    function(col1, col2) {
        this.color1 = col1;
        this.color2 = col2;
    },
    
    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            g.beginPath();            

            g.fillStyle = this.color1;
            g.arc(x + w/2, y + h/2 , w/3 , 0, 2* Math.PI, 1, false);
            g.fill();

            g.beginPath();
            g.fillStyle = this.color2;
            g.arc(x + w/2, y + h/2 , w/4 , 0, 2* Math.PI, 1, false);
            g.fill();
        };
    }
]);

pkg.MobileScrollMan = Class(pkg.Manager, pkg.MouseListener, [
    function $prototype() {
        this.sx = this.sy = 0;
        this.target = null;
        this.identifier = -1; 

        this.mouseDragStarted = function(e) {
            if (e.touchCounter == 1 && e.touches)  {
                this.identifier = e.touch.identifier;
                var owner = e.source; 

                while(owner != null && instanceOf(owner, pkg.ScrollPan) === false) {
                    owner = owner.parent;
                }

                if (owner && !owner.mouseDragged) {
                    this.target = owner;
                    this.sx = e.x;
                    this.sy = e.y;
                }
            }
        };

        this.mouseDragged = function(e) {
            if (e.touchCounter == 1 && e.touches && this.target && this.identifier == e.touch.identifier) {
                var d = e.touch.direction;
                if (d == L.BOTTOM || d == L.TOP) {
                    if (this.target.vBar && this.target.vBar.isVisible) {
                        var bar = this.target.vBar;
                        bar.position.setOffset(bar.position.offset - e.y + this.sy);
                    }
                } 
                else {
                    if (d == L.LEFT || d == L.RIGHT) {
                        if (this.target.hBar && this.target.hBar.isVisible) {
                            var bar = this.target.hBar;
                            bar.position.setOffset(bar.position.offset - e.x + this.sx);
                        }
                    }
                }

                this.sx = e.x;
                this.sy = e.y;
            }
        };

        this.mouseDragEnded = function(e) {
            if (this.target != null && 
                this.timer  == null && 
                this.identifier == e.touch.identifier &&
                (e.touch.direction == L.BOTTOM || e.touch.direction == L.TOP) &&
                this.target.vBar != null && 
                this.target.vBar.isVisible && 
                e.touch.dy != 0) 
            {
                this.$dt = 2*e.touch.dy;                     
                var $this = this, bar = this.target.vBar, k = 0;
                this.timer = setInterval(function() {
                    var o = bar.position.offset;
                    bar.position.setOffset(o - $this.$dt);
                    if (++k%5 === 0) { 
                        $this.$dt = Math.floor($this.$dt/2);
                    }

                    if (o == bar.position.offset || ($this.$dt >= -1  &&  $this.$dt <= 1)) {
                        clearInterval($this.timer);
                        $this.timer = $this.target = null; 
                    }
                }, 40);
            }            
        };

        this.mousePressed = function(e) {
            if (this.timer != null) {
                clearInterval(this.timer);
                this.timer = null;
            }
            this.target = null;
        }
    }
]);


pkg.configure(function(conf) {
    var p = zebra()["ui.json"];
    conf.loadByUrl(p ? p : pkg.$url.join("ui.json"), false);
});

/**
 * @for
 */

})(zebra("ui"), zebra.Class, zebra.Interface);
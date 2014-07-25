(function(pkg, Class) {

// redefine configuration
zebra()["zebra.json"] = pkg.$url.join("zebra.json");

/**
 * @module  ui
 */

var MB = zebra.util, ME = pkg.MouseEvent, Cursor = pkg.Cursor, View = pkg.View,
    Listeners = zebra.util.Listeners, KE = pkg.KeyEvent, L = zebra.layout,
    task = zebra.util.task, instanceOf = zebra.instanceOf,
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
 *  UI component render class. Renders the given target UI component
 *  on the given surface using the specified 2D context
 *  @param {zebra.ui.Panel} [target] an UI component to be rendered
 *  @class zebra.ui.CompRender
 *  @constructor
 *  @extends zebra.ui.Render
 */
pkg.CompRender = Class(pkg.Render, [
    function $prototype() {
        /**
         * Get preferred size of the render. The method doesn't calculates
         * preferred size it simply calls the target component "getPreferredSize"
         * method.
         * @method getPreferredSize
         * @return {Object} a preferred size
         *
         *      {width:<Integer>, height: <Integer>}
         */
        this.getPreferredSize = function(){
            return this.target == null || this.target.isVisible === false ? { width:0, height:0 }
                                                                          : this.target.getPreferredSize();
        };

        this.paint = function(g,x,y,w,h,d){
            var c = this.target;
            if (c != null && c.isVisible === true) {
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
 * Line UI component class. Draw series of vertical or horizontal lines of using
 * the given line width and color. Vertical or horizontal line rendering s selected
 * depending on the line component size: if height is greater than width than vertical
 * line will be rendered.
 * @constructor
 * @class zebra.ui.Line
 * @extends {zebra.ui.Panel}
 */
pkg.Line = Class(pkg.Panel, [
    function() {
        /**
         * Line colors
         * @attribute lineColors
         * @type {Array}
         * @readOnly
         * @default [ "gray" ]
         */
        this.lineColors = ["gray"];
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
         * Set set of colors to be used to paint the line. Number of colors defines the number of
         * lines to be painted.
         * @param {String} colors* colors
         * @method setLineColors
         */
        this.setLineColors = function() {
            this.lineColors = (arguments.length === 1) ? (Array.isArray(arguments[0]) ? arguments[0].slice(0)
                                                                                      : [ arguments[0] ] )
                                                       : Array.prototype.slice.call(arguments);
            this.repaint();
        };

        this.paint = function(g) {
            var isHor  = this.width > this.height,
                left   = this.getLeft(),
                right  = this.getRight(),
                top    = this.getTop(),
                bottom = this.getBottom(),
                xy     = isHor ? top : left;

            for(var i=0; i < this.lineColors.length; i++) {
                if (this.lineColors[i] != null) {
                    g.setColor(this.lineColors[i]);
                    if (isHor === true) {
                        g.drawLine(this.left, xy, this.width - right - left, xy, this.lineWidth);
                    }
                    else {
                        g.drawLine(xy, top, xy, this.height - top - bottom, this.lineWidth);
                    }
                }
                xy += this.lineWidth;
            }
        };

        this.calcPreferredSize = function(target) {
            var s = this.lineColors.length * this.lineWidth;
            return { width: s, height:s};
        };
    }
]);

/**
 * Lightweight implementation of single line string render. The render requires
 * a simple string as a target object.
 * @param {String} str a string to be rendered
 * @param {zebra.ui.Font} [font] a text font
 * @param {String} [color] a text color
 * @constructor
 * @extends {zebra.ui.Render}
 * @class zebra.ui.StringRender
 */
pkg.StringRender = Class(pkg.Render, [
    function $prototype() {
        this.stringWidth = -1;
        this.owner = null;

        this[''] = function(txt, font, color) {
            this.setTarget(txt);

            /**
             * Font to be used to render the target string
             * @attribute font
             * @readOnly
             * @type {zebra.ui.Font}
             */
            this.font = font != null ? font : pkg.StringRender.font ;

            /**
             * Color to be used to render the target string
             * @readOnly
             * @attribute color
             * @type {String}
             */
            this.color = color != null ? color : pkg.StringRender.color;
        };

        this.ownerChanged  = function(v) {
            this.owner = v;
        };

        /**
         * Set the rendered text font.
         * @param  {String|zebra.ui.Font} f a font as CSS string or
         * zebra.ui.Font class instance
         * @return {Boolean} return true if a text font has been updated
         * @method setFont
         */
        this.setFont = function(f){
            var old = this.font;
            if (f != null && zebra.isString(f)) f = new pkg.Font(f);
            if (f != old && (f == null || f.s != old.s)){
                this.font = f;
                if (this.owner != null && this.owner.isValid === false) {
                    this.owner.invalidate();
                }
                this.stringWidth = -1;
                return true;
            }
            return false;
        };

        this.paint = function(g,x,y,w,h,d) {
            if (this.font.s != g.font) g.setFont(this.font);
            if (this.color != g.fillStyle) g.fillStyle = this.color;

            if (d != null && d.isEnabled === false) {
                g.fillStyle = d != null && d.disabledColor != null ? d.disabledColor
                                                                   : pkg.StringRender.disabledColor;
            }

            g.fillText(this.target, x, y );
        };

        this.getPreferredSize = function() {
            if (this.stringWidth < 0) {
                this.stringWidth = this.font.stringWidth(this.target);
            }
            return { width: this.stringWidth, height: this.font.height };
        };

        /**
         * Return a string that is rendered by this class
         * @return  {String} a string
         * @method getValue
         */
        this.getValue = function(){
            return this.target;
        };

        /**
         * Set rendered text color
         * @param  {String} c a text color
         * @return {Boolean} return true if a text color has been updated
         * @method setColor
         */
        this.setColor = function(c){
            if (c != this.color) {
                this.color = c;
                return true;
            }
            return false;
        };

        /**
         * Set the string to be rendered
         * @param  {String} s a string
         * @method setValue
         */
        this.setValue = function(s) {
            this.setTarget(s);
        };

        this.targetWasChanged = function(o, n) {
            this.stringWidth = -1;
            if (this.owner != null) this.owner.invalidate();
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

        this.getLineSize = function(l) {
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

        this.getMaxOffset = function() {
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
            g.fillText(this.getLine(line), x, y);
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
            if (o != null) o.unbind(this);
            if (n != null) {
                n.bind(this);
                this.invalidate(0, this.getLines());
            }
            else {
                this.lines = 0;
            }
        };

        /**
         * Get the rendered target text as string object
         * @return {String} rendered text
         * @method getValue
         */
        this.getValue = function(){
            return this.target == null ? null : this.target.getValue();
        };

        /**
         * Get the given text line width in pixels
         * @param  {Integer} line a text line number
         * @return {Integer} a text line width in pixels
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
            if (this.lines > 0 && this.target != null) this.recalc();
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
                            if (d && d.getStartSelection != null) {
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
                        var dcol = d != null && d.disabledColor != null ? d.disabledColor : pkg.TextRender.disabledColor;
                        for(var i = 0;i < lines; i++) {
                            g.setColor(dcol);
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
         * has to be rendered
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
         * @param  {String|zebra.ui.Font} f a font as CSS string or
         * zebra.ui.Font class instance
         * @return {Boolean} return true if a text font has been updated
         * @method setFont
         */
        this.setFont = function(f){
            var old = this.font;
            if (f && zebra.isString(f)) f = new pkg.Font(f);
            if (f != old && (f == null || f.s != old.s)){
                this.font = f;
                this.invalidate(0, this.getLines());
                return true;
            }
            return false;
        };

        /**
         * Set rendered text color
         * @param  {String} c a text color
         * @return {Boolean} return true if a text color has been updated
         * @method setColor
         */
        this.setColor = function(c){
            if (c != this.color) {
                this.color = c;
                return true;
            }
            return false;
        };

        // speed up constructor by avoiding super execution since
        // text render is one of the most used class
        this[''] = function(text) {
            /**
             * Text color
             * @attribute color
             * @type {String}
             * @default zebra.ui.TextRender.color
             * @readOnly
             */
            this.color = pkg.TextRender.color;

            /**
             * Text font
             * @attribute font
             * @type {String|zebra.ui.Font}
             * @default zebra.ui.TextRender.font
             * @readOnly
             */
            this.font = pkg.TextRender.font;

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
    function() {
        this.$this(new zebra.data.SingleLineTxt(""));
    },

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
        if (this.echo != ch){
            this.echo = ch;
            if (this.target != null) this.invalidate(0, this.target.getLines());
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
        this.left = this.top = this.bottom = this.right = 6 + w;
        this.width = w;

        this.onColor1 = pkg.palette.black;
        this.onColor2 = pkg.palette.gray5;
        this.offColor = pkg.palette.gray1;

        this.fillColor1 = "#DCF0F7";
        this.fillColor2 = pkg.palette.white;
        this.fillColor3 = pkg.palette.gray7;
    },

    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            var xx = x + w - 1,
                yy = y + h - 1,
                o  = d.parent.orient,
                t  = this.type,
                s  = this.width,
                dt = s / 2;

            g.beginPath();
            g.lineWidth = s;
            switch(o) {
                case L.LEFT:
                    g.moveTo(xx + 1, y + dt);
                    g.lineTo(x + s*2, y + dt);
                    g.lineTo(x + dt , y + s*2);
                    g.lineTo(x + dt, yy - s*2 + dt);
                    g.lineTo(x + s*2, yy + dt);
                    g.lineTo(xx + 1, yy + dt);

                    if (d.isEnabled === true){
                        g.setColor(t == 2 ? this.fillColor1 : this.fillColor2);
                        g.fill();
                    }

                    g.setColor((t === 0 || t == 2) ? this.onColor1 : this.offColor);
                    g.stroke();

                    if (d.isEnabled === true) {
                        var ww = ~~((w - 6) / 2);
                        g.setColor(this.fillColor3);
                        g.fillRect(xx - ww + 1, y + s, ww, h - s - 1);
                    }

                    if (t == 1) {
                        g.setColor(this.onColor2);
                        g.drawLine(x + 2*s + 1, yy - s, xx + 1, yy - s, s);
                    }
                    break;
                case L.RIGHT:
                    xx -= dt; // thick line grows left side and right side proportionally
                              // correct it

                    g.moveTo(x, y + dt);
                    g.lineTo(xx - 2*s, y + dt);

                    g.lineTo(xx   , y + 2*s);
                    g.lineTo(xx   , yy - 2*s);
                    g.lineTo(xx - 2*s, yy + dt);
                    g.lineTo(x, yy + dt);

                    if (d.isEnabled === true){
                        g.setColor(t == 2 ? this.fillColor1 : this.fillColor2);
                        g.fill();
                    }

                    g.setColor((t === 0 || t == 2) ? this.onColor1 : this.offColor);
                    g.stroke();

                    if (d.isEnabled === true) {
                        var ww = ~~((w - 6) / 2);
                        g.setColor(this.fillColor3);
                        g.fillRect(x, y + s, ww, h - s - 1);
                    }

                    if (t == 1) {
                        g.setColor(this.onColor2);
                        g.drawLine(x, yy - s, xx - s - 1, yy - s, s);
                    }
                    break;
                case L.TOP:
                    g.moveTo(x + dt, yy + 1 );
                    g.lineTo(x + dt, y + s*2);
                    g.lineTo(x + s*2, y + dt);
                    g.lineTo(xx - s*2 + s, y + dt);
                    g.lineTo(xx + dt, y + s*2);
                    g.lineTo(xx + dt, yy + 1);

                    if (d.isEnabled === true){
                        g.setColor(t == 2 ? this.fillColor1 : this.fillColor2);
                        g.fill();
                    }

                    g.setColor((t === 0 || t == 2) ? this.onColor1 : this.offColor);
                    g.stroke();

                    if (d.isEnabled === true){
                        g.setColor(this.fillColor3);
                        var hh = ~~((h - 6) / 2);
                        g.fillRect(x + s, yy - hh + 1 , w - s - 1, hh);
                    }

                    if (t === 0) {
                        g.setColor(this.onColor2);
                        g.beginPath();
                        g.moveTo(xx + dt - s, yy + 1);
                        g.lineTo(xx + dt - s, y + s*2);
                        g.stroke();
                    }

                    break;
                case L.BOTTOM:
                    yy -= dt;

                    g.moveTo(x + dt, y);
                    g.lineTo(x + dt, yy - 2*s);
                    g.lineTo(x + 2*s + dt, yy);
                    g.lineTo(xx - 2*s, yy);
                    g.lineTo(xx + dt, yy - 2*s);
                    g.lineTo(xx + dt, y);

                    if (d.isEnabled === true){
                        g.setColor(t == 2 ? this.fillColor1 : this.fillColor2);
                        g.fill();
                    }

                    g.setColor((t === 0 || t == 2) ? this.onColor1 : this.offColor);
                    g.stroke();

                    if (d.isEnabled === true){
                        g.setColor(this.fillColor3);
                        var hh = ~~((h - 6) / 2);
                        g.fillRect(x + s, y, w - s - 1, hh);
                    }

                    if (t === 0) {
                        g.setColor(this.onColor2);
                        g.beginPath();
                        g.moveTo(xx + dt - s, y);
                        g.lineTo(xx + dt - s, yy - s - 1);
                        g.stroke();
                    }
                    break;
                default: throw new Error("Invalid tab alignment");
            }
        };

        this.getTop    = function () { return this.top;   };
        this.getBottom = function () { return this.bottom;};
        this.getLeft   = function () { return this.left;  };
        this.getRight  = function () { return this.right; };
    }
]);

/**
 * Render class that allows developers to render a border with a title area.
 * The title area has to be specified by an UI component that uses the border
 * by defining "getTitleInfo()"" method. The method has to return object that
 * describes title size, location and alignment:
 *
 *
 *      {
 *        x: {Integer}, y: {Integer},
 *        width: {Integer}, height: {Integer},
 *        orient: {Integer}
 *      }
 *
 *
 * @class zebra.ui.TitledBorder
 * @extends zebra.ui.Render
 * @constructor
 * @param {zebra.ui.View} border  a border to be rendered with a title area
 * @param {Integer|String} [lineAlignment] a line alignment. Specifies how
 * a title area has to be aligned relatively border line:
 *
 *      BOTTOM or "bottom"  - title area will be placed on top of border line:
 *                    ___| Title area |___
 *
 *
 *      CENTER or "center"  - title area will be centered relatively to border line:
 *                    ---| Title area |-----
 *
 *
 *      TOP or "top"  - title area will be placed underneath of border line:
 *                     ____              ________
 *                         |  Title area |
 *
 *
 */
pkg.TitledBorder = Class(pkg.Render, [
    function $prototype() {
        this.getTop  = function (){
            return this.target.getTop();
        };

        this.getLeft = function (){
            return this.target.getLeft();
        };

        this.getRight = function (){
            return this.target.getRight();
        };

        this.getBottom = function (){
            return this.target.getBottom();
        };

        this.outline = function (g,x,y,w,h,d) {
            var xx = x + w, yy = y + h;
            if (d.getTitleInfo != null) {
                var r = d.getTitleInfo();
                if (r != null) {
                    switch(r.orient) {
                        case L.BOTTOM:
                            var bottom = this.target.getBottom();
                            switch (this.lineAlignment) {
                                case L.CENTER : yy = r.y + ~~((r.height - bottom)/ 2) + bottom; break;
                                case L.TOP    : yy = r.y + r.height + bottom; break;
                                case L.BOTTOM : yy = r.y; break;
                            }
                            break;
                        case L.TOP:
                            var top = this.target.getTop();
                            switch (this.lineAlignment) {
                                case L.CENTER : y = r.y + ~~((r.height - top)/2);   break; // y = r.y + ~~(r.height/ 2) ; break;
                                case L.TOP    : y = r.y - top; break;
                                case L.BOTTOM : y = r.y + r.height; break;
                            }
                            break;
                        case L.LEFT:
                            var left = this.target.getLeft();
                            switch (this.lineAlignment) {
                                case L.CENTER : x = r.x + ~~((r.width - left) / 2); break;
                                case L.TOP    : x = r.x - left; break;
                                case L.BOTTOM : x = r.x + r.width; break;
                            }
                            break;
                        case L.RIGHT:
                            var right = this.target.getRight();
                            switch (this.lineAlignment) {
                                case L.CENTER : xx = r.x + ~~((r.width - right) / 2) + right; break;
                                case L.TOP    : xx = r.x + r.width + right; break;
                                case L.BOTTOM : xx = r.x; break;
                            }
                            break;
                    }
                }
            }

            if (this.target != null && this.target.outline != null) {
               b = this.target.outline(g, x, y, xx - x, yy - y, d);
               if (b === true) return b;
            }

            g.beginPath();
            g.rect(x, y, xx - x, yy - y);
            g.closePath();
            return true;
        };

        this.$isIn = function(clip, x, y, w, h) {
            var rx = clip.x > x ? clip.x : x,
                ry = clip.y > y ? clip.y : y,
                rw = Math.min(clip.x + clip.width, x + w) - rx,
                rh = Math.min(clip.y + clip.height, y + h) - ry;
            return (clip.x == rx && clip.y == ry && clip.width == rw && clip.height == rh);
        };

        this.paint = function(g,x,y,w,h,d){
            if (d.getTitleInfo != null){

                var r = d.getTitleInfo();
                if (r != null) {
                    var xx = x + w, yy = y + h, t = g.getTopStack();
                    switch (r.orient) {
                        case L.TOP:
                            var top = this.target.getTop();
                            // compute border y
                            switch (this.lineAlignment) {
                                case L.CENTER : y = r.y + ~~((r.height - top) / 2) ; break;
                                case L.TOP    : y = r.y - top; break;
                                case L.BOTTOM : y = r.y + r.height; break;
                            }


                            // skip rendering border if the border is not in clip rectangle
                            // This is workaround because of IE10/IE11 have bug what causes
                            // handling rectangular clip + none-rectangular clip side effect
                            // to "fill()" subsequent in proper working (fill without respect of
                            // clipping  area)
                            if (this.$isIn(t, x + this.target.getLeft(), y,
                                           w - this.target.getRight() - this.target.getLeft(),
                                           yy - y - this.target.getBottom()))
                            {
                                return;
                            }

                            g.save();
                            g.beginPath();

                            g.moveTo(x, y);
                            g.lineTo(r.x, y);
                            g.lineTo(r.x, y + top);
                            g.lineTo(r.x + r.width, y + top);
                            g.lineTo(r.x + r.width, y);
                            g.lineTo(xx, y);
                            g.lineTo(xx, yy);
                            g.lineTo(x, yy);
                            g.lineTo(x, y);

                            break;
                        case L.BOTTOM:
                            var bottom = this.target.getBottom();
                            switch (this.lineAlignment) {
                                case L.CENTER : yy = r.y + ~~((r.height - bottom) / 2) + bottom; break;
                                case L.TOP    : yy = r.y + r.height + bottom; break;
                                case L.BOTTOM : yy = r.y ; break;
                            }

                            if (this.$isIn(t, x + this.target.getLeft(), y + this.target.getTop(),
                                              w - this.target.getRight() - this.target.getLeft(),
                                              yy - y - this.target.getTop()))
                            {
                                return;
                            }

                            g.save();
                            g.beginPath();

                            g.moveTo(x, y);
                            g.lineTo(xx, y);
                            g.lineTo(xx, yy);
                            g.lineTo(r.x + r.width, yy);
                            g.lineTo(r.x + r.width, yy - bottom);
                            g.lineTo(r.x, yy - bottom);
                            g.lineTo(r.x, yy);
                            g.lineTo(x, yy);
                            g.lineTo(x, y);

                            break;
                        case L.LEFT:
                            var left = this.target.getLeft();
                            switch (this.lineAlignment) {
                                case L.CENTER : x = r.x + ~~((r.width - left) / 2); break;
                                case L.TOP    : x = r.x  - left; break;
                                case L.BOTTOM : x = r.x + r.width; break;
                            }

                            if (this.$isIn(t, x, y + this.target.getTop(),
                                           xx - x - this.target.getRight(),
                                           h - this.target.getTop() - this.target.getBottom()))
                            {
                                return;
                            }

                            g.save();
                            g.beginPath();

                            g.moveTo(x, y);
                            g.lineTo(xx, y);
                            g.lineTo(xx, yy);
                            g.lineTo(x, yy);
                            g.lineTo(x, r.y + r.height);
                            g.lineTo(x + left, r.y + r.height);
                            g.lineTo(x + left, r.y);
                            g.lineTo(x, r.y);
                            g.lineTo(x, y);

                            break;
                        case L.RIGHT:
                            var right = this.target.getRight();
                            switch (this.lineAlignment) {
                                case L.CENTER : xx = r.x + ~~((r.width - right) / 2) + right; break;
                                case L.TOP    : xx = r.x  + r.width + right; break;
                                case L.BOTTOM : xx = r.x; break;
                            }

                            if (this.$isIn(t, x + this.target.getLeft(),
                                              y + this.target.getTop(),
                                              xx - x - this.target.getLeft(),
                                              h - this.target.getTop() - this.target.getBottom()))
                            {
                                return;
                            }

                            g.save();
                            g.beginPath();

                            g.moveTo(x, y);
                            g.lineTo(xx, y);
                            g.lineTo(xx, r.y);
                            g.lineTo(xx - right, r.y);
                            g.lineTo(xx - right, r.y + r.height);
                            g.lineTo(xx, r.y + r.height);
                            g.lineTo(xx, yy);
                            g.lineTo(x, yy);
                            g.lineTo(x, y);
                            break;
                    }

                    g.closePath();
                    g.clip();
                    this.target.paint(g, x, y, xx - x, yy - y, d);
                    g.restore();
                }
            }
            else {
                this.target.paint(g, x, y, w, h, d);
            }
        };

        this[''] = function (b, a){
            this.lineAlignment = (a == null ? L.BOTTOM : L.$constraints(a));

            if (b == null && this.lineAlignment != L.BOTTOM &&
                             this.lineAlignment != L.TOP &&
                             this.lineAlignment != L.CENTER)
            {
                throw new Error($invalidA);
            }
            this.setTarget(b);
        };
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
        this.getValue = function() {
            return this.view.getValue();
        };

        /**
         * Get the label text color
         * @return {String} a zebra label color
         * @method getColor
         */
        this.getColor = function (){
            return this.view.color;
        };

        /**
         * Get the label text font
         * @return {zebra.ui.Font} a zebra label font
         * @method getFont
         */
        this.getFont = function (){
            return this.view.font;
        };

        /**
         * Set the label text value
         * @param  {String} s a new label text
         * @method setValue
         * @chainable
         */
        this.setValue = function(s){
            this.view.setValue(s);
            this.repaint();
            return this;
        };

        /**
         * Set the label text color
         * @param  {String} c a text color
         * @method setColor
         * @chainable
         */
        this.setColor = function(c){
            if (this.view.setColor(c)) this.repaint();
            return this;
        };

        /**
         * Set the label text font
         * @param  {zebra.ui.Font} f a text font
         * @method setFont
         * @chainable
         */
        this.setFont = function(f){
            if (this.view.setFont(f)){
                this.repaint();
            }
            return this;
        };
    },

    function () {
        this.$this("");
    },

    function (r){
        if (zebra.isString(r)) {
            this.setView(new pkg.StringRender(r));
        }
        else {
            this.setView(instanceOf(r, zebra.data.TextModel) ? new pkg.TextRender(r) : r);
        }
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
 * @param {String|zebra.ui.TextRender|zebra.data.TextModel} [t] a text string,
 * text model or text render instance
 * @constructor
 * @class zebra.ui.BoldLabel
 * @extends zebra.ui.Label
 */
pkg.BoldLabel = Class(pkg.Label, []);

/**
 * Image label UI component. This is UI container that consists from an image
 * component and an label component.Image is located at the left size of text.
 * @param {Image|String} img an image or path to the image
 * @param {String|zebra.ui.TextRender|zebra.data.TextModel} txt a text string,
 * text model or text render instance
 * @constructor
 * @class zebra.ui.ImageLabel
 * @extends {zebra.ui.Panel}
 */
pkg.ImageLabel = Class(pkg.Panel, [
    function(txt, img) {
        this.$super(new L.FlowLayout(L.LEFT, L.CENTER, L.HORIZONTAL, 6));
        this.add(new pkg.ImagePan(null));
        this.add(instanceOf(txt, pkg.Panel) ? txt : new pkg.Label(txt));
        this.kids[1].setVisible(txt != null);
        this.setImage(img);
    },

    /**
     * Set the specified caption
     * @param {String} c an image label caption text
     * @method setCaption
     */
    function setCaption(c) {
        this.kids[1].setValue(c);
        this.kids[1].setVisible(c != null);
    },

    /**
     * Set the specified label image
     * @param {String|Image} p a path to an image of image object
     * @method setImage
     */
    function setImage(p) {
        this.kids[0].setImage(p);
        this.kids[0].setVisible(p != null);
    }
]);

/**
 * State panel class. The class is UI component that allows to customize
 * the component  face, background and border depending on the component
 * state. Number and names of states the component can have is defined
 * by developers. To bind a view to the specified state use zebra.ui.ViewSet
 * class. For instance if a component has to support two states : "state1" and
 * "state2" you can do it as following:

        // create state component
        var p = new zebra.ui.StatePan();

        // define border view that contains views for "state1" and "state2"
        p.setBorder({
            "state1": new zebra.ui.Border("red", 1),
            "state1": new zebra.ui.Border("blue", 2)

        });

        // define background view that contains views for "state1" and "state2"
        p.setBorder({
            "state1": "yellow",
            "state1": "green"
        });

        // set component state
        p.setState("state1");

 * State component children components can listening when the state of the component
 * has been updated by implementing "parentStateUpdated(o,n,id)" method. It gets old
 * state, new state and a view id that is mapped to the new state.  The feature is
 * useful if we are developing a composite components whose children component also
 * should react to a state changing.
 * @class  zebra.ui.StatePan
 * @constructor
 * @extends {zebra.ui.ViewPan}
 */
pkg.StatePan = Class(pkg.ViewPan, [
    function $prototype() {
        /**
         * Current component state
         * @attribute state
         * @readOnly
         * @type {Object}
         */
        this.state = null;

        /**
         * Set the component state
         * @param {Object} s a state
         * @method  setState
         */
        this.setState = function(s) {
            if (s !== this.state){
                var prev = this.state;
                this.state = s;
                this.stateUpdated(prev, s);
            }
        };

        /**
         * Define the method if the state value has to be
         * somehow converted to a view id. By default the state value
         * itself is used as a view id.
         * @param {Object} s a state to be converted
         * @return {String} a view ID
         * @method toViewId
         */

        /**
         * Called every time the component state has been updated
         * @param  {Integer} o a previous component state
         * @param  {Integer} n a new component state
         * @method stateUpdated
         */
        this.stateUpdated = function(o,n){
            var b = false, id = (this.toViewId != null ? this.toViewId(n) : n);

            if (id == null) {
                return;
            }

            for(var i=0; i < this.kids.length; i++) {
                if (this.kids[i].parentStateUpdated != null) {
                    this.kids[i].parentStateUpdated(o, n, id);
                }
            }

            if (this.border != null && this.border.activate != null) {
                b = this.border.activate(id) || b;
            }

            if (this.view != null && this.view.activate != null) {
                b = this.view.activate(id) || b;
            }

            if (this.bg != null && this.bg.activate != null) {
                b = this.bg.activate(id) || b;
            }

            if (b) this.repaint();
        };

        /**
         * Refresh state
         * @protected
         * @method syncState
         */
        this.syncState = function() {
            this.stateUpdated(this.state, this.state);
        };
    },

    function setView(v){
        if (v != this.view){
            this.$super(v);
            this.syncState(this.state, this.state);
        }
        return this;
    },

    function setBorder(v){
        if (v != this.border){
            this.$super(v);
            this.syncState(this.state, this.state);
        }
        return this;
    },

    function setBackground(v){
        if (v != this.bg){
            this.$super(v);
            this.syncState(this.state, this.state);
        }
        return this;
    }
]);

/**
 * Event state panel class. The class implements UI component whose face, border and
 * background view depends on its input events state. The component is good basis
 * for creation  dynamic view UI components.The state the component can be is:

    - **over** the mouse cursor is inside the component
    - **out** the mouse cursor is outside the component
    - **pressed over** the mouse cursor is inside the component and an action mouse
      button or key is pressed
    - **pressed out** the mouse cursor is outside the component and an action mouse
      button or key is pressed
    - **disabled** the component is disabled

 * The view border, background or face should be set as "zebra.ui.ViewSet" where an required
 * for the given component state view is identified by an id. By default corresponding to
 * component states views IDs are the following: "over", "pressed.over", "out", "pressed.out",
 * "disabled".  Imagine for example we have two colors and we need to change between the colors
 * every time mouse cursor is over/out of the component:

     // create state panel
     var statePan = new zebra.ui.EvStatePan();

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

 * Additionally the UI component allows developer to specify whether the component can hold
 * input focus and which UI component has to be considered as the focus marker. The focus marker
 * component is used as anchor to paint focus marker view. In simple case the view can be just
 * a border. So border will be rendered around the focus marker component:

     // create state panel that contains one label component
     var statePan = new zebra.ui.EvStatePan();
     var lab      = new zebra.ui.Label("Focus marker label");
     lab.setPadding(6);
     statePan.setPadding(6);
     statePan.setLayout(new zebra.layout.BorderLayout());
     statePan.add(zebra.layout.CENTER, lab);

     // set label as an anchor for focus border indicator
     statePan.setFocusAnchorComponent(lab);
     statePan.setFocusMarkerView("plain");

 * @class zebra.ui.EvStatePan
 * @constructor
 * @extends zebra.ui.StatePan
 */
var OVER = 0, PRESSED_OVER = 1, OUT = 2, PRESSED_OUT = 3, DISABLED = 4;


pkg.EvStatePan = Class(pkg.StatePan,  [
    function $prototype() {
        this.state = OUT;

        this.$isIn = false;

        var IDS = ["over", "pressed.over", "out", "pressed.out", "disabled"];
        this.toViewId = function(state) {
            return IDS[state];
        };

        this._keyPressed = function(e) {
            if (this.state !== PRESSED_OVER &&
                this.state !== PRESSED_OUT  &&
                (e.code == KE.ENTER || e.code == KE.SPACE))
            {
                this.setState(PRESSED_OVER);
            }
        };

        this._keyReleased = function(e) {
            if (this.state == PRESSED_OVER || this.state == PRESSED_OUT){
                var prev = this.state;
                this.setState(OVER);
                if (this.$isIn === false) this.setState(OUT);
            }
        };

        this._mouseEntered = function(e) {
            if (this.isEnabled === true) {
                this.setState(this.state == PRESSED_OUT ? PRESSED_OVER : OVER);
                this.$isIn = true;
            }
        };

        this._mousePressed = function(e) {
            if (this.state != PRESSED_OVER && this.state != PRESSED_OUT && e.isActionMask()){
                this.setState(PRESSED_OVER);
            }
        };

        this._mouseReleased = function(e) {
            if ((this.state === PRESSED_OVER || this.state === PRESSED_OUT) && e.isActionMask()){
                if (e.source == this) {
                    this.setState(e.x >= 0 && e.y >= 0 && e.x < this.width && e.y < this.height ? OVER : OUT);
                }
                else {
                    var p = L.toParentOrigin(e.x, e.y, e.source, this);
                    this.$isIn = p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height;
                    this.setState(this.$isIn ? OVER : OUT);
                }
            }
        };

        /**
         * Define children components events handler
         * @param  {zebra.ui.InputEvent|zebra.ui.MouseEvent|zebra.ui.KeyEvent} e an input event
         * @method childInputEvent
         */
        this.childInputEvent = function(e){
            if (e.UID == pkg.InputEvent.MOUSE_UID) {
                switch(e.ID) {
                    case ME.ENTERED : this._mouseEntered(e); break;
                    case ME.PRESSED : this._mousePressed(e); break;
                    case ME.RELEASED: this._mouseReleased(e);break;
                    case ME.EXITED:
                        // check if the mouse cursor is in of the source component
                        // that means another layer has grabbed control
                        if (e.x >= 0 && e.y >= 0 && e.x < e.source.width && e.y < e.source.height) {
                            this.$isIn = false;
                        }
                        else {
                            var p = L.toParentOrigin(e.x, e.y, e.source, this);
                            this.$isIn = p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height;
                        }

                        if (this.$isIn === false) {
                            this.setState(this.state === PRESSED_OVER ? PRESSED_OUT : OUT);
                        }
                        break;
                }
            }
            else {
                if (e.UID == pkg.InputEvent.KEY_UID) {
                    if (e.ID == KE.PRESSED) this._keyPressed(e);
                    else {
                        if (e.ID == KE.RELEASED) this._keyReleased(e);
                    }

                }
            }
        };

        /**
         * Define key pressed events handler
         * @param  {zebra.ui.KeyEvent} e a key event
         * @method keyPressed
         */
        this.keyPressed = function(e){
            this._keyPressed(e);
        };

        /**
         * Define key released events handler
         * @param  {zebra.ui.KeyEvent} e a key event
         * @method keyReleased
         */
        this.keyReleased = function(e){
            this._keyReleased(e);
        };

        /**
         * Define mouse entered events handler
         * @param  {zebra.ui.MouseEvent} e a key event
         * @method mouseEntered
         */
        this.mouseEntered = function (e){
            this._mouseEntered();
        };

        /**
         * Define mouse exited events handler
         * @param  {zebra.ui.MouseEvent} e a key event
         * @method mouseExited
         */
        this.mouseExited = function(e){
            if (this.isEnabled === true) {
                this.setState(this.state == PRESSED_OVER ? PRESSED_OUT : OUT);
                this.$isIn = false;
            }
        };

        /**
         * Define mouse pressed events handler
         * @param  {zebra.ui.MouseEvent} e a key event
         * @method mousePressed
         */
        this.mousePressed = function(e){
            this._mousePressed(e);
        };

        /**
         * Define mouse released events handler
         * @param  {zebra.ui.MouseEvent} e a key event
         * @method mouseReleased
         */
        this.mouseReleased = function(e){
            this._mouseReleased(e);
        };

        /**
         * Define mouse dragged events handler
         * @param  {zebra.ui.MouseEvent} e a key event
         * @method mouseDragged
         */
        this.mouseDragged = function(e){
            if (e.isActionMask()) {
                var pressed = (this.state == PRESSED_OUT || this.state == PRESSED_OVER);
                if (e.x > 0 && e.y > 0 && e.x < this.width && e.y < this.height) {
                    this.setState(pressed ? PRESSED_OVER : OVER);
                }
                else {
                    this.setState(pressed ? PRESSED_OUT : OUT);
                }
            }
        };
    },

    function setEnabled(b){
        this.$super(b);
        this.setState(b ? OUT : DISABLED);
    }
]);

/**
 * Composite event state panel
 * @constructor
 * @extends {zebra.ui.EvStatePan}
 * @uses zebra.ui.Composite
 * @class  zebra.ui.CompositeEvStatePan
 */
pkg.CompositeEvStatePan = Class(pkg.EvStatePan, pkg.Composite, [
    function $prototype() {
        /**
         * Indicates if the component can have focus
         * @attribute canHaveFocus
         * @readOnly
         * @type {Boolean}
         */
        this.canHaveFocus = true;


        this.focusComponent = null;

        /**
         * Reference to an anchor focus marker component
         * @attribute focusMarkerView
         * @readOnly
         * @type {zebra.ui.Panel}
         */
        this.focusMarkerView = null;

        this.paintOnTop = function(g){
            var fc = this.focusComponent;
            if (this.focusMarkerView != null && fc != null && this.hasFocus()) {
                this.focusMarkerView.paint(g, fc.x, fc.y, fc.width, fc.height, this);
            }
        };

        /**
         * Set the view that has to be rendered as focus marker
         * when the component gains focus.
         * @param  {String|zebra.ui.View|Function} c a view.
         * The view can be a color or border string code or view
         * or an implementation of zebra.ui.View "paint(g,x,y,w,h,t)"
         * method.
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
            if (this.canHaveFocus != b){
                var fm = pkg.focusManager;
                if (b === false && fm.focusOwner == this) {
                    fm.requestFocus(null);
                }
                this.canHaveFocus = b;
            }
        };

        /**
         * Set the specified children component to be used as
         * focus marker view anchor component. Anchor component
         * is a component over that the focus marker view is
         * painted.
         * @param  {zebra.ui.Panel} c  an anchor component
         * @method setFocusAnchorComponent
         */
        this.setFocusAnchorComponent = function(c) {
            if (this.focusComponent != c) {
                if (c != null && this.kids.indexOf(c) < 0) {
                    throw Error("Focus component doesn't exist");
                }
                this.focusComponent = c;
                this.repaint();
            }
        };
    },

    function focused() {
        this.$super();
        this.repaint();
    },

    function kidRemoved(i,l){
        if (l == this.focusComponent) this.focusComponent = null;
        this.$super(i, l);
    }
]);

/**
 *  Button UI component. Button is composite component whose look and feel can
 *  be easily customized:

        // create image button
        var button = new zebra.ui.Button(new zebra.ui.ImagePan("icon1.gif"));

        // create image + caption button
        var button = new zebra.ui.Button(new zebra.ui.ImageLabel("Caption", "icon1.gif"));

        // create multilines caption button
        var button = new zebra.ui.Button(new zebra.ui.MLabel("Line1\nLine2"));


 *  @class  zebra.ui.Button
 *  @constructor
 *  @param {String|zebra.ui.Panel} [t] a button label.
 *  The label can be a simple text or an UI component.
 *  @extends zebra.ui.CompositeEvStatePan
 */

/**
 * Fired when a button has been pressed

        var b = new zebra.ui.Button("Test");
        b.bind(function (src) {
            ...
        });

 * Button can be adjusted in respect how it generates the pressed event. Event can be
 * triggered by pressed or clicked even. Also event can be generated periodically if
 * the button is kept in pressed state.
 * @event buttonPressed
 * @param {zebra.ui.Button} src a button that has been pressed
 */
pkg.Button = Class(pkg.CompositeEvStatePan, [
    function $clazz() {
        this.Label = Class(pkg.Label, []);
    },

    function $prototype() {
        this.canHaveFocus = true;

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
            if (this.catchFired != null) this.catchFired();
        };

        /**
         * The method is executed for a button that is configured
         * to repeat fire events.
         * @method run
         * @protected
         */
        this.run  = function() {
            if (this.state === PRESSED_OVER) this.fire();
        };

        /**
         * Set the mode the button has to fire events.
         * Button can fire event after it has been unpressed
         * or immediately when it has been pressed. Also button
         * can start firing events periodically when it has been
         * pressed and held in the pressed state.
         * @param  {Boolean} b   true if the button has to fire
         * event by pressed event
         * @param  {Integer} time the period of time the button
         * has to repeat firing events if it has been pressed and
         * held in pressed state. -1 means event doesn't have
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
        if (zebra.isString(t)) t = new this.$clazz.Label(t);
        this.$super();
        if (t != null) {
            this.add(t);
            this.setFocusAnchorComponent(t);
        }
    },

    function stateUpdated(o,n){
        this.$super(o, n);
        if (n === PRESSED_OVER){
            if(this.isFireByPress){
                this.fire();
                if (this.firePeriod > 0) {
                    this.repeatTask = task(this.run, this).run(400, this.firePeriod);
                }
            }
        }
        else {
            if (this.firePeriod > 0 && this.repeatTask != null) {
                this.repeatTask.shutdown();
            }

            if (n === OVER && (o === PRESSED_OVER && this.isFireByPress === false)) {
                this.fire();
            }
        }
    }
]);

/**
 *  Border panel UI component class. The component renders titled border around the
 *  given  content UI component. Border title can be placed on top or
 *  bottom border line and aligned horizontally (left, center, right). Every
 *  zebra UI component can be used as a border title element.
 *  @param {zebra.ui.Panel|String} [title] a border panel title. Can be a
 *  string or any other UI component can be used as the border panel title
 *  @param {zebra.ui.Panel} [content] a content UI component of the border
 *  panel
 *  @param {Integer} [constraints] a title constraints. The constraints gives
 *  a possibility to place border panel title in different places. Generally
 *  the title can be placed on the top or bottom part of the border panel.
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
         * @type {Integer}
         * @readOnly
         * @default 0
         */

         /**
          * Horizontal gap. Define left and right paddings between
          * border panel border and the border panel content
          * @attribute hGap
          * @type {Integer}
          * @readOnly
          * @default 0
          */
         this.vGap = this.hGap = 2;

         /**
          * Border panel label indent
          * @type {Integer}
          * @attribute indent
          * @default 4
          */
         this.indent = 4;

         /**
          * Get the border panel title info. The information
          * describes a rectangular area the title occupies, the
          * title location and alignment
          * @return {Object} a title info
          *
          *  {
          *      x: {Integer}, y: {Integer},
          *      width: {Integer}, height: {Integer},
          *      orient: {Integer}
          *  }
          *
          * @method getTitleInfo
          * @protected
          */
         this.getTitleInfo = function() {
            return (this.label != null) ? { x      : this.label.x,
                                            y      : this.label.y,
                                            width  : this.label.width,
                                            height : this.label.height,
                                            orient : this.label.constraints & (L.TOP | L.BOTTOM) }
                                        : null;
        };

        this.calcPreferredSize = function(target){
            var ps = this.content != null && this.content.isVisible === true ? this.content.getPreferredSize()
                                                                           : { width:0, height:0 };
            if (this.label != null && this.label.isVisible === true){
                var lps = this.label.getPreferredSize();
                ps.height += lps.height;
                ps.width = Math.max(ps.width, lps.width + this.indent);
            }
            ps.width  += (this.hGap * 2);
            ps.height += (this.vGap * 2);
            return ps;
        };

        this.doLayout = function (target){
            var h = 0,
                right  = this.getRight(),
                left   = this.getLeft(),
                xa     = this.label != null ? this.label.constraints & (L.LEFT | L.CENTER | L.RIGHT): 0,
                ya     = this.label != null ? this.label.constraints & (L.BOTTOM | L.TOP) : 0,
                top    = ya == L.TOP ? this.top : this.getTop(),
                bottom = ya == L.BOTTOM ? this.bottom : this.getBottom();

            if (this.label != null && this.label.isVisible === true){
                var ps = this.label.getPreferredSize();
                h = ps.height;
                this.label.setSize(ps.width, h);
                this.label.setLocation((xa == L.LEFT) ? left + this.indent
                                                      : ((xa == L.RIGHT) ? this.width - right - ps.width - this.indent
                                                                         : ~~((this.width - ps.width) / 2)),
                                        (ya == L.BOTTOM) ? (this.height - bottom - ps.height) : top);
            }

            if (this.content != null && this.content.isVisible === true){
                this.content.setLocation(left + this.hGap,
                                         (ya == L.BOTTOM ? top : top + h) + this.vGap);
                this.content.setSize(this.width - right - left - 2 * this.hGap,
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
         * @chainable
         */
        this.setGaps = function(vg,hg){
            if (this.vGap != vg || hg != this.hGap){
                this.vGap = vg;
                this.hGap = hg;
                this.vrp();
            }
            return this;
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
        if (zebra.isString(title)) title = new this.$clazz.Label(title);

        /**
         * Border panel label component
         * @attribute label
         * @type {zebra.ui.Panel}
         * @readOnly
         */

        /**
         * Border panel label content component
         * @attribute content
         * @type {zebra.ui.Panel}
         * @readOnly
         */
        this.label = this.content = null;

        this.$super();
        if (title  != null) this.add(L.$constraints(ctr), title);
        if (center != null) this.add(L.CENTER, center);
    },

    function setBorder(br) {
        br = pkg.$view(br);
        if (instanceOf(br, pkg.TitledBorder) === false) {
            br = new pkg.TitledBorder(br, L.CENTER);
        }
        return this.$super(br);
    },

    function kidAdded(index,id,lw){
        this.$super(index, id, lw);
        if (L.CENTER == id) this.content = lw;
        else this.label = lw;
    },

    function kidRemoved(index,lw){
        this.$super(index, lw);
        if (lw == this.label) this.label = null;
        else this.content = null;
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
        ch.manager.bind(function (src, ui) {
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
         * @method getValue
         */
        this.getValue = function(o) { return this.state; };

        /**
         * Set the state for the given UI component
         * @param  {zebra.ui.Checkbox} o an ui component
         * @param  {Boolean} b  a boolean state
         * @method setValue
         */
        this.setValue = function(o,b) {
            if (this.getValue(o) != b){
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
            o.switched(this.getValue(o));
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
        this.getValue = function(o) {
            return o == this.state;
        };

        this.setValue = function(o,b){
            if (this.getValue(o) != b){
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
 * Customize is quite similar to what explained for zebra.ui.EvStatePan:
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
        ch.syncState();

 * Listening checked event should be done by registering a
 * listener in the check box switch manager as follow:

        // create checkbox component
        var ch = new zebra.ui.Checkbox("Checkbox");

        // register a checkbox listener
        ch.manager.bind(function(sm) {
            var s = sm.getValue();
            ...
        });

 * @class  zebra.ui.Checkbox
 * @extends zebra.ui.CompositeEvStatePan
 * @constructor
 * @param {String|zebra.ui.Panel} [label] a label
 * @param {zebra.ui.SwitchManager} [m] a switch manager
 */
pkg.Checkbox = Class(pkg.CompositeEvStatePan, [
    function $clazz() {
        /**
         * The box UI component class that is used by default with
         * the check box component.
         * @constructor
         * @class zebra.ui.Checkbox.Box
         * @extends zebra.ui.ViewPan
         */
        this.Box = Class(pkg.StatePan, [
            function $prototype() {
                this.parentStateUpdated = function (o, n, id) {
                    this.setState(id);
                };
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
         * @chainable
         * @method setValue
         */
        this.setValue = function(b) {
            this.manager.setValue(this, b);
            return this;
        };

        /**
         * Get the check box state
         * @return {Boolean} a check box state
         * @method getValue
         */
        this.getValue = function() {
            return this.manager ? this.manager.getValue(this) : false;
        };

        /**
         * Callback method that is called whenever a state of switch
         * manager has been updated.
         * @param  {Boolean} b a new state
         * @method switched
         */
        this.switched = function(b){
            this.stateUpdated(this.state, this.state);
        };

        /**
         * Map the specified state into its symbolic name.
         * @protected
         * @param  {Integer} state a state
         * @return {String} a symbolic name of the state
         * @method toViewId
         */
        this.toViewId = function(state){
            if (this.isEnabled === true) {
                if (this.getValue()) {
                    return (this.state == OVER) ? "on.over" : "on.out";
                }
                return (this.state == OVER) ? "off.over" : "off.out";
            }
            return this.getValue() ? "don" : "doff";
        };
    },

    function () {
        this.$this(null);
    },

    function (c){
        this.$this(c, new pkg.SwitchManager());
    },

    function (c, m) {
        if (zebra.isString(c)) {
            c = new this.$clazz.Label(c);
        }

        this.$super();

        /**
         * Reference to box component
         * @attribute box
         * @type {zebra.ui.Panel}
         * @readOnly
         */
        this.box = new this.$clazz.Box();
        this.add(this.box);

        if (c != null) {
            this.add(c);
            this.setFocusAnchorComponent(c);
        }

        this.setSwitchManager(m);
    },

    function keyPressed(e){
        if (instanceOf(this.manager, pkg.Group) && this.getValue()){
            var code = e.code, d = 0;
            if (code == KE.LEFT || code == KE.UP) d = -1;
            else {
                if (code == KE.RIGHT || code == KE.DOWN) d = 1;
            }

            if (d !== 0) {
                var p = this.parent, idx = p.indexOf(this);
                for(var i = idx + d;i < p.kids.length && i >= 0; i += d){
                    var l = p.kids[i];
                    if (l.isVisible === true &&
                        l.isEnabled === true &&
                        instanceOf(l, pkg.Checkbox) &&
                        l.manager == this.manager      )
                    {
                        l.requestFocus();
                        l.setValue(true);
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
        if (o == PRESSED_OVER && n == OVER) {
            this.setValue(!this.getValue());
        }
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
        this.Bar = Class(pkg.EvStatePan, [
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
                    var xy = this.target.normalizeBarLoc(this.target.orientation == L.VERTICAL ? this.x + e.x
                                                                                               : this.y + e.y);
                    if (xy > 0) this.target.setGripperLoc(xy);
                };
            },

            function(target) {
                this.prevLoc = 0;
                this.target = target;
                this.cursorType = (target.orientation == L.VERTICAL ? Cursor.W_RESIZE
                                                                    : Cursor.N_RESIZE);
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
                    if (this.isMoveable){
                        this.gripper.setLocation(left, this.barLocation);
                        this.gripper.setSize(w, bSize.height);
                    }
                    else {
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
            if (this.gap != g){
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
            if (this.leftMinSize != m){
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
            if (this.rightMinSize != m){
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
            if (b != this.isMoveable){
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
        this.add(L.CENTER, new this.$clazz.Bar(this));
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

        progress.bind(function(src, oldValue) {
            ...
        });

 *  @event fired
 *  @param {zebra.ui.Progress} src a progress bar that triggers
 *  the event
 *  @param {Integer} oldValue a progress bar previous value
 */

pkg.Progress = Class(pkg.Panel, [
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

    function () {
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
     * @param {Integer | String} o an orientation: zebra.layout.VERTICAL or zebra.layout.HORIZONTAL
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
        if(m != this.maxValue) {
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
 * @extends zebra.ui.Button
 */
pkg.Link = Class(pkg.Button, [
    function $prototype() {
        this.cursorType = Cursor.HAND;
    },

    function(s){
        // do it before super
        this.view = new pkg.TextRender(s);
        this.$super(null);
        this.stateUpdated(this.state, this.state);
    },

    /**
     * Set link font
     * @param {zebra.ui.Font} f a font
     * @method setFont
     */
    function setFont(f) {
        this.view.setFont(f);
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
 * Extendable  UI panel class. Implement collapsible panel where
 * a user can hide of show content by pressing special control
 * element:

        // create extendable panel that contains list as its content
        var ext = zebra.ui.ExtendablePan(new zebra.ui.List([
            "Item 1",
            "Item 2",
            "Item 3"
        ]), "Title");


 * @constructor
 * @class zebra.ui.ExtendablePan
 * @extends {zebra.ui.Panel}
 * @param {zebra.ui.Panel} c a content of the extender panel
 * @param {zebra.ui.Panel|String} l a title label text or
 * component
 */

 /**
  * Fired when extender is collapsed or extended

         var ex = new zebra.ui.ExtendablePan(pan, "Title");
         ex.bind(function (src, isCollapsed) {
             ...
         });

  * @event fired
  * @param {zebra.ui.ExtendablePan} src an extender UI component that generates the event
  * @param {Boolean} isCollapsed a state of the extender UI component
  */

pkg.ExtendablePan = Class(pkg.Panel, [
    function $prototype() {
        /**
         * Toogle on or off the extender panel
         * @method toggle
         */
        this.toggle = function(){
            this.isCollapsed = this.isCollapsed ? false : true;
            this.contentPan.setVisible(!this.isCollapsed);
            this.togglePan.setState(this.isCollapsed ? "off" : "on");
            this.repaint();

            if (this._) {
                this._.fired(this, this.isCollapsed);
            }
        };
    },

    function $clazz() {
        this.Label = Class(pkg.Label,[]);
        this.TitlePan = Class(pkg.Panel, []);

        this.TogglePan = Class(pkg.StatePan, [
            function $prototype() {
                this.mousePressed = function(e){
                    if (e.isActionMask()) {
                        this.parent.parent.toggle();
                    }
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
            lab = new this.$clazz.Label(lab);
        }

        /**
         * Label component
         * @attribute label
         * @type {zebra.ui.Panel}
         * @readOnly
         */
        this.label = lab;

        /**
         * Title panel
         * @type {zebra.ui.Panel}
         * @attribute titlePan
         * @readOnly
         */
        this.titlePan = new this.$clazz.TitlePan();
        this.add(L.TOP, this.titlePan);

        /**
         * Toggle panel
         * @type {zebra.ui.Panel}
         * @attribute togglePan
         * @readOnly
         */
        this.togglePan = new this.$clazz.TogglePan();
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

var ScrollManagerListeners = zebra.util.ListenersClass("scrolled");

/**
 * Scroll manager class.
 * @param {zebra.ui.Panel} t a target component to be scrolled
 * @constructor
 * @class zebra.ui.ScrollManager
 */

 /**
  * Fired when a target component has been scrolled

        scrollManager.bind(function(px, py) {
            ...
        });

  * @event scrolled
  * @param  {Integer} px a previous x location target component scroll location
  * @param  {Integer} py a previous y location target component scroll location
  */


 /**
  * Fired when a scroll state has been updated

        scrollManager.scrollStateUpdated = function(x, y, px, py) {
            ...
        };

  * @event scrollStateUpdated
  * @param  {Integer} x a new x location target component scroll location
  * @param  {Integer} y a new y location target component scroll location
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

        /**
         * Set a target component scroll x location to the
         * specified value
         * @param  {Integer} v a x scroll location
         * @method scrollXTo
         */
        this.scrollXTo = function(v){
            this.scrollTo(v, this.getSY());
        };

        /**
         * Set a target component scroll y location to the
         * specified value
         * @param  {Integer} v a y scroll location
         * @method scrollYTo
         */
        this.scrollYTo = function(v){
            this.scrollTo(this.getSX(), v);
        };

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
                if (this.scrollStateUpdated != null) this.scrollStateUpdated(x, y, psx, psy);
                if (this.target.catchScrolled != null) this.target.catchScrolled(psx, psy);
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

        /**
         * Target UI component for that the scroll manager has been instantiated
         * @attribute target
         * @type {zebra.ui.Panel}
         * @readOnly
         */
        this.target = c;
    }
]);

/**
 * Scroll bar UI component
 * @param {Integer|String} t type of the scroll bar components:

        zebra.layout.VERTICAL or "vertical" - vertical scroll bar
        zebra.layout.HORIZONTAL or "horizontal"- horizontal scroll bar

 * @class zebra.ui.Scroll
 * @constructor
 * @uses zebra.ui.Composite
 * @extends {zebra.ui.Panel}
 */
pkg.Scroll = Class(pkg.Panel, zebra.util.Position.Metric, pkg.Composite, [
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

        /**
         * Evaluate if the given point is in scroll bar bundle element
         * @param  {Integer}  x a x location
         * @param  {Integer}  y a y location
         * @return {Boolean}   true if the point is located inside the
         * scroll bar bundle element
         * @method isInBundle
         */
        this.isInBundle = function(x,y){
            var bn = this.bundle;
            return (bn != null &&
                    bn.isVisible === true &&
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


        /**
         * Define composite component catch input method
         * @param  {zebra.ui.Panel} child a children component
         * @return {Boolean} true if the given children component has to be input events transparent
         * @method catchInput
         */
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

        /**
         * Define mouse dragged events handler
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseDragged
         */
        this.mouseDragged = function(e){
            if (Number.MAX_VALUE != this.startDragLoc) {
                this.position.setOffset(this.pixel2value(this.bundleLoc -
                                                         this.startDragLoc +
                                                         ((this.type == L.HORIZONTAL) ? e.x : e.y)));
            }
        };

        /**
         * Define mouse drag started  events handler
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseDragStarted
         */
        this.mouseDragStarted = function (e){
           //!!! It is more convenient to  if (this.isDragable || this.isInBundle(e.x, e.y)){
                this.startDragLoc = this.type == L.HORIZONTAL ? e.x : e.y;
                this.bundleLoc = this.type == L.HORIZONTAL ? this.bundle.x : this.bundle.y;
            //}
        };

        /**
         * Define mouse drag ended events handler
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseDragEnded
         */
        this.mouseDragEnded = function (e){ this.startDragLoc = Number.MAX_VALUE; };

        /**
         * Define mouse clicked events handler
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseClicked
         */
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

            if (this.bundle != null && this.bundle.isVisible === true){
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
         * Set the specified maximum value of the scroll bar component
         * @param {Integer} m a maximum value
         * @method setMaximum
         */
        this.setMaximum = function (m){
            if (m != this.max) {
                this.max = m;
                if (this.position.offset > this.max) this.position.setOffset(this.max);
                this.vrp();
            }
        };

        this.setPosition = function(p){
            if (p != this.position){
                if (this.position != null) this.position.unbind(this);
                this.position = p;
                if(this.position != null){
                    this.position.bind(this);
                    this.position.setMetric(this);
                    this.position.setOffset(0);
                }
            }
        };

        this.setExtraSize = function(e){
            if (e != this.extra){
                this.extra = e;
                this.vrp();
            }
        };
    },

    function(t) {
        t = L.$constraints(t);
        if (t != L.VERTICAL && t != L.HORIZONTAL) {
            throw new Error($invalidA);
        }

        /**
         * Increment button
         * @attribute incBt
         * @type {zebra.ui.Button}
         * @readOnly
         */

        /**
         * Decrement button
         * @attribute decBt
         * @type {zebra.ui.Button}
         * @readOnly
         */

        /**
         * Scroll bar bundle component
         * @attribute bundle
         * @type {zebra.ui.Panel}
         * @readOnly
         */

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
        if (L.CENTER == id) this.bundle = lw;
        else {
            if(L.BOTTOM == id){
                this.incBt = lw;
                this.incBt.bind(this);
            }
            else {
                if(L.TOP == id){
                    this.decBt = lw;
                    this.decBt.bind(this);
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
                this.incBt.unbind(this);
                this.incBt = null;
            }
            else {
                if(lw == this.decBt){
                    this.decBt.unbind(this);
                    this.decBt = null;
                }
            }
        }
    }
]);

/**
 * Scroll UI panel. The component is used to manage scrolling
 * for a children UI component that occupies more space than
 * it is available. The usage is very simple, just put an component
 * you want to scroll horizontally or/and vertically in the scroll
 * panel:

        // scroll vertically and horizontally a large picture
        var scrollPan = new zebra.ui.ScrollPan(new zebra.ui.ImagePan("largePicture.jpg"));

        // scroll vertically  a large picture
        var scrollPan = new zebra.ui.ScrollPan(new zebra.ui.ImagePan("largePicture.jpg"),
                                               zebra.layout.VERTICAL);

        // scroll horizontally a large picture
        var scrollPan = new zebra.ui.ScrollPan(new zebra.ui.ImagePan("largePicture.jpg"),
                                               zebra.layout.HORIZONTAL);



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
                        this.scrollStateUpdated = function(sx,sy,psx,psy) { this.target.setLocation(sx, sy); };
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

        /**
         * Scroll manager listener method that is called every time
         * a target component has been scrolled
         * @param  {Integer} psx previous scroll x location
         * @param  {Integer} psy previous scroll y location
         * @method  scrolled
         */
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
                    if (this.vBar.isVisible === true){
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
                    if (this.hBar.isVisible === true){
                        this.hBar.setVisible(false);
                        sman.scrollTo(0, sy);
                        this.hBar.position.setOffset(0);
                    }
                }
                else this.hBar.setVisible(true);
            }

            if (this.scrollObj.isVisible === true){
                this.scrollObj.setLocation(left, top);
                this.scrollObj.setSize(ww - (this.autoHide === false && this.vBar != null && this.vBar.isVisible === true ? vps.width  : 0),
                                       hh - (this.autoHide === false && this.hBar != null && this.hBar.isVisible === true ? hps.height : 0));
            }

            if (this.$interval === 0 && this.autoHide) {
                hps.height = vps.width = 0;
            }

            if (this.hBar != null && this.hBar.isVisible === true){
                this.hBar.setLocation(left, this.height - bottom - hps.height);
                this.hBar.setSize(ww - (this.vBar != null && this.vBar.isVisible === true ? vps.width : 0), hps.height);
                this.hBar.setMaximum(maxH);
            }

            if (this.vBar != null && this.vBar.isVisible === true){
                this.vBar.setLocation(this.width - right - vps.width, top);
                this.vBar.setSize(vps.width, hh -  (this.hBar != null && this.hBar.isVisible === true ? hps.height : 0));
                this.vBar.setMaximum(maxV);
            }
        };

        this.posChanged = function (target,prevOffset,prevLine,prevCol){
            if (this.isPosChangedLocked === false){

                //!!! review the code below
                if (this.autoHide) {
                    this.$dontHide = true;
                    if (this.$interval === 0 && ((this.vBar != null && this.vBar.isVisible === true) ||
                                                 (this.hBar != null && this.hBar.isVisible === true)    ))
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

        this.setIncrements = function (hUnit,hPage,vUnit,vPage) {
            if (this.hBar != null){
                if (hUnit !=  -1) this.hBar.unitIncrement = hUnit;
                if (hPage !=  -1) this.hBar.pageIncrement = hPage;
            }

            if (this.vBar != null){
                if (vUnit !=  -1) this.vBar.unitIncrement = vUnit;
                if (vPage !=  -1) this.vBar.pageIncrement = vPage;
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

        /**
         * Scrollable target component
         * @attribute scrollObj
         * @type {zebra.ui.Panel}
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

    function insert(i,ctr,c){
        if (L.CENTER == ctr && c.scrollManager == null) {
            c = new this.$clazz.ContentPan(c);
        }
        return this.$super(i, ctr, c);
    },

    function kidAdded(index,id,comp){
        this.$super(index, id, comp);
        if (L.CENTER == id){
            this.scrollObj = comp;
            this.scrollObj.scrollManager.bind(this);
            return
        }

        if (L.BOTTOM  == id || L.TOP == id){
            this.hBar = comp;
        }
        else {
            if (L.LEFT == id || L.RIGHT == id) this.vBar = comp;
            else return;
        }

        // valid for scroll bar only
        if (comp.incBt != null) comp.incBt.setVisible(!this.autoHide);
        if (comp.decBt != null) comp.decBt.setVisible(!this.autoHide);
        comp.position.bind(this);
    },

    function kidRemoved(index,comp){
        this.$super(index, comp);
        if (comp == this.scrollObj){
            this.scrollObj.scrollManager.unbind(this);
            this.scrollObj = null;
        }
        else {
            if (comp == this.hBar){
                this.hBar.position.unbind(this);
                this.hBar = null;
            }
            else {
                if (comp == this.vBar){
                    this.vBar.position.unbind(this);
                    this.vBar = null;
                }
            }
        }
    }
]);

/**
 * Tabs UI panel. The component is used to organize switching
 * between number of pages where every page is an UI component.
 *
 *  Filling tabs component with pages is the same to how you add
 *  an UI component to a panel. For instance in the example below
 *  three pages with "Titl1", "Title2", "Title3" are added:

      var tabs = zebra.ui.Tabs();
      tabs.add("Title1", new zebra.ui.Label("Label as a page"));
      tabs.add("Title2", new zebra.ui.Button("Button as a page"));
      tabs.add("Title3", new zebra.ui.TextArea("Text area as a page"));

 *  You can access tabs pages UI component the same way like you
 *  access a panel children components

     ...
     tabs.kids[0] // access the first page

 *  And you can remove it with standard panel inherited API:

     ...
     tabs.removeAt(0); // remove first tab page


 *  To customize tab page caption and icon you should access tab object and
 *  do it with API it provides:


        // update a tab caption
        tabs.getTab(0).setCaption("Test");

        // update a tab icon
        tabs.getTab(0).setIcon("my.gif");

        // set a particular font and color for the tab in selected state
        tabs.getTab(0).setColor(true, "blue");
        tabs.getTab(0).setFont(true, new zebra.ui.Font("Arial", "bold", 16));

        // set other caption for the tab in not selected state
        tabs.getTab(0).setCaption(false, "Test");

 * @param {Integer|String} [o] the tab panel orientation:

      zebra.layout.TOP   or "top"
      zebra.layout.BOTTOM or "bottom"
      zebra.layout.LEFT or "left"
      zebra.layout.RIGHT or "right"

 * @class zebra.ui.Tabs
 * @constructor
 * @extends {zebra.ui.Panel}
 */

/**
 * Fired when a new tab page has been selected

      tabs.bind(function (src, selectedIndex) {
         ...
      });

 * @event selected
 * @param {zebra.ui.Tabs} src a tabs component that triggers the event
 * @param {Integer} selectedIndex a tab page index that has been selected
 */
pkg.Tabs = Class(pkg.Panel, [
    function $clazz() {
        /**
         * Tab view class that defines the tab page title and icon
         * @param {String|Image} [icon]  an path to an image or image object
         * @param {String} [caption] a tab caption
         * @class zebra.ui.Tabs.TabView
         * @extends {zebra.ui.CompRender}
         * @constructor
         */
        this.TabView = Class(pkg.CompRender, [
            function $clazz() {
                this.TabPan = Class(pkg.Panel, [
                    function() {
                        this.$super();
                        this.add(new pkg.ImagePan(null));
                        this.add(new pkg.ViewPan());
                    },

                    function getImagePan() {
                        return this.kids[0];
                    },

                    function getViewPan() {
                        return this.kids[1];
                    }
                ]);
            },

            function() {
                this.$this("");
            },

            function(caption) {
                this.$this(null, caption);
            },

            function(icon, caption) {
                var tp = new this.$clazz.TabPan();
                this.$super(tp);
                this.owner = null;

                var $this = this;
                tp.getImagePan().imageLoaded = function(p, b, i) {
                    $this.vrp();

                    // if the icon has zero width and height the repaint
                    // doesn't trigger validation. So let's do it on
                    // parent level
                    if ($this.owner != null && $this.owner.parent != null) {
                        $this.owner.repaint();
                    }
                };

                var r1 = new this.$clazz.captionRender(caption),
                    r2 = new this.$clazz.captionRender(caption);

                r2.setColor(this.$clazz.fontColor);
                r1.setColor(this.$clazz.selectedFontColor);
                r2.setFont (this.$clazz.font);
                r1.setFont (this.$clazz.selectedFont);

                this.getCaptionPan().setView(
                    new pkg.ViewSet(
                        {
                            "selected": r1,
                            "*"       : r2
                        },
                        [
                            function setFont(id, f) {
                                var v = this.views[id];
                                if (v != null) {
                                    v.setFont(s);
                                    this.recalc();
                                }
                            },

                            function setCaption(id, s) {
                                var v = this.views[id];
                                if (v != null) {
                                    v.setValue(s);
                                    this.recalc();
                                }
                            },

                            function getCaption(id) {
                                var v = this.views[id];
                                return v == null ? null : v.getValue();
                            }
                        ]
                    )
                );
            },

            function ownerChanged(v) {
                this.owner = v;
            },

            function vrp() {
                if (this.owner != null) this.owner.vrp();
            },

            /**
             * Set the given tab caption. The caption is set for both
             * tab states: selected and not selected
             * @param {String} s the tab caption
             * @method setCaption
             */
            function setCaption(s) {
                this.setCaption(true, s);
                this.setCaption(false, s);
            },

            /**
             * Set the given tab caption for the specified tab state.
             * @param {Boolean} b the tab state. true means selected state.
             * @param {String} s the tab caption
             * @method setCaption
             */
            function setCaption(b, s) {
                this.getCaptionPan().view.setCaption(this.$toId(b), s);
                this.vrp();
            },

            /**
             * Get the tab caption for the specified tab state
             * @param {Boolean} b the tab state. true means selected state.
             * @return {String} the tab caption
             * @method getCaption
             */
            function getCaption(b) {
                return this.getCaptionPan().view.getCaption(this.$toId(b));
            },

            /**
             * Set the caption text color for both selected and not selected states.
             * @param {String} c the tab caption
             * @method setColor
             */
            function setColor(c) {
                setColor(true, c);
                setColor(false, c);
            },

            /**
             * Set the given tab caption text color for the specified tab state.
             * @param {Boolean} b the tab state. true means selected state.
             * @param {String} c the tab caption
             * @method setColor
             */
            function setColor(b, c) {
                var v = this.getCaptionPan().view.views[this.$toId(b)];
                if (v != null) {
                    v.setColor(c);
                    this.vrp();
                }
            },

            /**
             * Set the given tab caption text font for both selected and not selected states
             * @param {zebra.ui.Font} f the tab text font
             * @method setFont
             */
            function setFont(f) {
                setFont(true, f);
                setFont(false, f);
            },

            /**
             * Set the given tab caption text font for the specified state.
             * @param {Boolean} b the tab state. true means selected state.
             * @param {zebra.ui.Font} f the tab text font
             * @method setFont
             */
            function setFont(b, f) {
                this.getCaptionPan().view.setFont(this.$toId(b), f);
                this.vrp();
            },

            function getCaptionPan() {
                return this.target.getViewPan();
            },

            /**
             * Set the tab icon.
             * @param {String|Image} c an icon path or image object
             * @method setIcon
             */
            function setIcon(c) {
                this.target.getImagePan().setImage(c);
            },

            /**
             * The method is invoked every time the tab selection state has been updated
             * @param {zebra.ui.Tabs} tabs the tabs component the tab belongs
             * @param {Integer} i an index of the tab
             * @param {Boolean} b a new state of the tab
             * @method selected
             */
            function selected(tabs, i, b) {
                this.getCaptionPan().view.activate(this.$toId(b));
            },

            function $toId(b) {
                return b ? "selected" : "*";
            }
        ]);
    },

    /**
     * @for zebra.ui.Tabs
     */
    function $prototype() {
        /**
         * Declare can have focus attribute to make the component focusable
         * @type {Boolean}
         * @attribute canHaveFocus
         * @readOnly
         */
        this.canHaveFocus = true;

        /**
         * Side gaps
         * @type {Integer}
         * @attribute sideOffset
         * @default 0
         */
        this.sideOffset = 0;

        /**
         * Define mouse moved event handler
         * @param  {zebra.ui.MouseEvent} e a key event
         * @method mouseMoved
         */
        this.mouseMoved = function(e) {
            var i = this.getTabAt(e.x, e.y);
            if (this.overTab != i) {
                this.overTab = i;
                if (this.views["tabover"] != null) {
                    this.repaint(this.repaintX, this.repaintY,
                                 this.repaintWidth, this.repaintHeight);
                }
            }
        };

        /**
         * Define mouse drag ended event handler
         * @param  {zebra.ui.MouseEvent} e a key event
         * @method mouseDragEnded
         */
        this.mouseDragEnded = function(e) {
            var i = this.getTabAt(e.x, e.y);
            if (this.overTab != i) {
                this.overTab = i;
                if (this.views["tabover"] != null) {
                    this.repaint(this.repaintX, this.repaintY,
                                 this.repaintWidth, this.repaintHeight);
                }
            }
        };

        /**
         * Define mouse exited event handler
         * @param  {zebra.ui.MouseEvent} e a key event
         * @method mouseExited
         */
        this.mouseExited = function(e) {
            if (this.overTab >= 0) {
                this.overTab = -1;
                if (this.views["tabover"] != null) {
                    this.repaint(this.repaintX, this.repaintY,
                                 this.repaintWidth, this.repaintHeight);
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
                if (this.isTabEnabled(page) === true) return page;
            }
            return -1;
        };

        this.getTitleInfo = function(){
            var b   = (this.orient == L.LEFT || this.orient == L.RIGHT),
                res = b ? { x      : this.tabAreaX,
                            y      : 0,
                            width  : this.tabAreaWidth,
                            height : 0,
                            orient : this.orient }
                        : { x      : 0,
                            y      : this.tabAreaY,
                            width  : 0,
                            height : this.tabAreaHeight,
                            orient : this.orient };

            if (this.selectedIndex >= 0){
                var r = this.getTabBounds(this.selectedIndex);
                if (b){
                    res.y = r.y;
                    res.height = r.height;
                }
                else{
                    res.x = r.x;
                    res.width = r.width;
                }
            }
            return res;
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

        this.paintOnTop = function(g){
            var ts = g.stack[g.counter];
            // stop painting if the tab area is outside of clip area
            if (zebra.util.isIntersect(this.repaintX, this.repaintY,
                                       this.repaintWidth, this.repaintHeight,
                                       ts.x, ts.y, ts.width, ts.height))
            {
                if (this.selectedIndex > 0){
                    var r = this.getTabBounds(this.selectedIndex);
                }

                for(var i = 0;i < this.selectedIndex; i++) this.paintTab(g, i);

                for(var i = this.selectedIndex + 1;i < ~~(this.pages.length / 2); i++) {
                    this.paintTab(g, i);
                }

                if (this.selectedIndex >= 0){
                    this.paintTab(g, this.selectedIndex);
                    if (this.hasFocus()) {
                        this.drawMarker(g, this.getTabBounds(this.selectedIndex));
                    }
                }
            }
        };

        /**
         * Draw currently activate tab page marker.
         * @param  {2DContext} g a graphical context
         * @param  {Object} r a tab page title rectangular area
         * @method drawMarker
         */
        this.drawMarker = function(g,r){
            var marker = this.views["marker"];
            if (marker != null){
                //TODO: why only "tab" is checked ?
                var bv = this.views["tab"];
                marker.paint(g, r.x + bv.getLeft(), r.y + bv.getTop(),
                                r.width - bv.getLeft() - bv.getRight(),
                                r.height - bv.getTop() - bv.getBottom(), this);
            }
        };

        /**
         * Paint the given tab page title
         * @param  {2DContext} g a graphical context
         * @param  {Integer} pageIndex a tab page index
         * @method paintTab
         */
        this.paintTab = function (g, pageIndex){
            var b       = this.getTabBounds(pageIndex),
                page    = this.kids[pageIndex],
                tab     = this.views["tab"],
                tabover = this.views["tabover"],
                tabon   = this.views["tabon"];

            if (this.selectedIndex == pageIndex && tabon != null) {
                tabon.paint(g, b.x, b.y, b.width, b.height, page);
            }
            else {
                tab.paint(g, b.x, b.y, b.width, b.height, page);
            }

            if (this.overTab >= 0 && this.overTab == pageIndex && tabover != null) {
                tabover.paint(g, b.x, b.y, b.width, b.height, page);
            }

            var v  = this.pages[pageIndex * 2],
                ps = v.getPreferredSize(),
                px = b.x + L.xAlignment(ps.width, L.CENTER, b.width),
                py = b.y + L.yAlignment(ps.height, L.CENTER, b.height);

            v.paint(g, px, py, ps.width, ps.height, page);
        };

        /**
         * Get the given tab page title rectangular bounds
         * @param  {Integer} i a tab page index
         * @return {Object} a tab page rectangular bounds
         *
         *    {x:{Integer}, y:{Integer}, width:{Integer}, height:{Integer}}
         *
         * @protected
         * @method getTabBounds
         */
        this.getTabBounds = function(i){
            return this.pages[2 * i + 1];
        };

        this.calcPreferredSize = function(target){
            var max = L.getMaxPreferredSize(target);
            if (this.orient == L.BOTTOM || this.orient == L.TOP){
                max.width = Math.max(max.width, 2 * this.sideSpace + this.tabAreaWidth);
                max.height += this.tabAreaHeight + this.sideSpace;
            }
            else {
                max.width += this.tabAreaWidth + this.sideSpace;
                max.height = Math.max(max.height, 2 * this.sideSpace + this.tabAreaHeight);
            }
            return max;
        };

        this.doLayout = function(target){
            var right  = this.orient == L.RIGHT  ? this.right  : this.getRight(),
                top    = this.orient == L.TOP    ? this.top    : this.getTop(),
                bottom = this.orient == L.BOTTOM ? this.bottom : this.getBottom(),
                left   = this.orient == L.LEFT   ? this.left   : this.getLeft(),
                b      = (this.orient == L.TOP || this.orient == L.BOTTOM);

            if (b) {
                this.repaintX = this.tabAreaX = left + this.sideOffset;
                this.repaintY = this.tabAreaY = (this.orient == L.TOP) ? top : this.height - bottom - this.tabAreaHeight;
                if (this.orient == L.BOTTOM) this.repaintY -= this.border.getBottom();
            }
            else {
                this.repaintX = this.tabAreaX = (this.orient == L.LEFT ? left : this.width - right - this.tabAreaWidth);
                this.repaintY = this.tabAreaY = top + this.sideOffset;
                if (this.orient == L.RIGHT) this.repaintX -= this.border.getRight();
            }

            var count = ~~(this.pages.length / 2),
                sp    = 2 * this.sideSpace,
                xx    = (this.orient == L.RIGHT  ? this.tabAreaX : this.tabAreaX + this.sideSpace),
                yy    = (this.orient == L.BOTTOM ? this.tabAreaY : this.tabAreaY + this.sideSpace);

            for(var i = 0;i < count; i++ ){
                var r = this.getTabBounds(i);

                r.x = xx;
                r.y = yy;

                if (b) {
                    xx += r.width;
                    if (i == this.selectedIndex) {
                        xx -= sp;
                        if (this.orient == L.BOTTOM) r.y -= this.border.getBottom();
                    }
                }
                else {
                    yy += r.height;
                    if (i == this.selectedIndex) {
                        yy -= sp;
                        if (this.orient == L.RIGHT) r.x -= this.border.getRight();
                    }
                }
            }

            // make visible tab title
            if (this.selectedIndex >= 0){
                var r = this.getTabBounds(this.selectedIndex), dt = 0;
                if (b) {
                    r.x -= this.sideSpace;
                    r.y -= ((this.orient == L.TOP) ? this.sideSpace : 0);
                    dt = (r.x < left) ? left - r.x
                                      : (r.x + r.width > this.width - right) ? this.width - right - r.x - r.width : 0;
                }
                else {
                    r.x -= (this.orient == L.LEFT) ? this.sideSpace : 0;
                    r.y -= this.sideSpace;
                    dt = (r.y < top) ? top - r.y
                                     : (r.y + r.height > this.height - bottom) ? this.height - bottom - r.y - r.height : 0;
                }
                for(var i = 0;i < count; i ++ ){
                    var br = this.getTabBounds(i);
                    if (b) br.x += dt;
                    else   br.y += dt;
                }
            }

            for(var i = 0;i < count; i++){
                var l = this.kids[i];
                if (i === this.selectedIndex){
                    if (b) {
                        l.setSize(this.width - left - right - 2 * this.hgap,
                                  this.height - this.repaintHeight - top - bottom - 2 * this.vgap);
                        l.setLocation(left + this.hgap,
                                     ((this.orient == L.TOP) ? top + this.repaintHeight : top) + this.vgap);
                    }
                    else {
                        l.setSize(this.width - this.repaintWidth - left - right - 2 * this.hgap,
                                  this.height - top - bottom - 2 * this.vgap);
                        l.setLocation(((this.orient == L.LEFT) ? left + this.repaintWidth : left) + this.hgap,
                                      top + this.vgap);
                    }
                }
                else {
                    l.setSize(0, 0);
                }
            }
        };

        /**
         * Define recalc method to compute the component metrical characteristics
         * @method recalc
         */
        this.recalc = function(){
            var count = ~~(this.pages.length / 2);
            if (count > 0) {
                this.tabAreaHeight = this.tabAreaWidth = 0;

                var bv   = this.views["tab"],
                    b    = (this.orient == L.LEFT || this.orient == L.RIGHT),
                    max  = 0,
                    hadd = bv.getLeft() + bv.getRight(),
                    vadd = bv.getTop()  + bv.getBottom();

                for(var i = 0;i < count; i++){
                    var ps =  this.pages[i * 2] != null ? this.pages[i * 2].getPreferredSize()
                                                        : { width:0, height:0},
                        r = this.getTabBounds(i);

                    if (b) {
                        r.height = ps.height + vadd;
                        if (ps.width + hadd > max) max = ps.width + hadd;
                        this.tabAreaHeight += r.height;
                    }
                    else {
                        r.width = ps.width + hadd;
                        if (ps.height + vadd > max) max = ps.height + vadd;
                        this.tabAreaWidth += r.width;
                    }
                }

                // align tabs widths or heights to have the same size
                for(var i = 0; i < count; i++ ){
                    var r = this.getTabBounds(i);
                    if (b) r.width  = max;
                    else   r.height = max;
                }

                if (b) {
                    this.tabAreaWidth   = max + this.sideSpace;
                    this.tabAreaHeight += (2 * this.sideSpace);
                    this.repaintHeight  = this.tabAreaHeight;
                    this.repaintWidth   = this.tabAreaWidth + (b  == L.LEFT ? this.border.getLeft() : this.border.getRight());
                }
                else {
                    this.tabAreaWidth += (2 * this.sideSpace);
                    this.tabAreaHeight = this.sideSpace + max;
                    this.repaintWidth  = this.tabAreaWidth;
                    this.repaintHeight = this.tabAreaHeight + (b  == L.TOP ? this.border.getTop() : this.border.getBottom());
                }

                // make selected bigger
                if (this.selectedIndex >= 0) {
                    var r = this.getTabBounds(this.selectedIndex);
                    if (b) {
                        r.height += 2 * this.sideSpace;
                        r.width += this.sideSpace  + (b == L.LEFT ? this.border.getLeft() : this.border.getRight());
                    }
                    else {
                        r.height += this.sideSpace + (b == L.TOP ? this.border.getTop() : this.border.getBottom());
                        r.width  += 2 * this.sideSpace;
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
            if (x >= this.tabAreaX && y >= this.tabAreaY &&
                x < this.tabAreaX + this.tabAreaWidth &&
                y < this.tabAreaY + this.tabAreaHeight)
            {
                // handle selected as a special case since it can overlap neighborhood titles
                if (this.selectedIndex >= 0) {
                    var tb = this.getTabBounds(this.selectedIndex);
                    if (x >= tb.x && y >= tb.y && x < tb.x + tb.width && y < tb.y + tb.height) {
                        return i;
                    }
                }

                for(var i = 0; i < ~~(this.pages.length / 2); i++ ) {
                    if (this.selectedIndex != i) {
                        var tb = this.getTabBounds(i);
                        if (x >= tb.x && y >= tb.y && x < tb.x + tb.width && y < tb.y + tb.height) {
                            return i;
                        }
                    }
                }
            }
            return -1;
        };

        /**
         * Define key pressed event handler
         * @param  {zebra.ui.KeyEvent} e a key event
         * @method keyPressed
         */
        this.keyPressed = function(e){
            if (this.selectedIndex != -1 && this.pages.length > 0){
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

        /**
         * Define mouse clicked  event handler
         * @param  {zebra.ui.MouseEvent} e a key event
         * @method mouseClicked
         */
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
                var prev = this.selectedIndex;
                this.selectedIndex = index;

                if (prev >= 0) {
                    this.pages[prev * 2].selected(this, prev, false);
                }

                if (index >= 0) {
                    this.pages[index * 2].selected(this, index, true);
                }

                this._.fired(this, this.selectedIndex);
                this.vrp();
            }
        };

        /**
         * Get the given tab. Using the tab you can control tab caption,
         * icon.
         * @param {Integer} pageIndex a tab page index
         * @return  {zebra.ui.Tabs.TabView}
         * @method getTab
         */
        this.getTab = function(pageIndex){
            return this.pages[pageIndex * 2];
        };

        /**
         * Set tab side spaces.
         * @param {Integer} sideSpace  [description]
         * @method setSideSpace
         */
        this.setSideSpace = function(sideSpace){
            if (sideSpace != this.sideSpace) {
                this.sideSpace = sideSpace;
                this.vrp();
            }
        };

        this.setPageGaps = function (vg,hg){
            if (this.vgap != vg || hg != this.hgap){
                this.vgap = vg;
                this.hgap = hg;
                this.vrp();
            }
        };

        /**
         * Set the tab page element alignments
         * @param {Integer|String} o an alignment. The valid value is one of the following:
         * zebra.layout.LEFT, zebra.layout.RIGHT, zebra.layout.TOP, zebra.layout.BOTTOM or
         * "left", "right", "top", bottom
         * @method  setAlignment
         */
        this.setAlignment = function(o){
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
         * @param  {Boolean} b a tab page enabled state
         * @method enableTab
         */
        this.enableTab = function(i,b){
            var c = this.kids[i];
            if (c.isEnabled != b){
                c.setEnabled(b);
                if (b === false && this.selectedIndex == i) {
                    this.select(-1);
                }
                this.repaint();
            }
        };

        /**
         *  Set number of views to render different Tab component elements
         *  @param {Object} a set of views as dictionary where key is a view
         *  name and the value is a view instance, string(for color), or render
         *  function. The following view elements can be passed:
         *
         *
         *      {
         *         "tab"    : <view to render not selected tab page>,
         *         "tabover": <view to render a tab page when mouse is over>
         *         "tabon"  : <a view to render selected tab page>
         *         "marker" : <a marker view to be rendered around tab page title>
         *      }
         *
         *
         *  @method  setViews
         */
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

        /**
         * Sides gap
         * @attribute sideSpace
         * @type {Integer}
         * @readOnly
         * @default 1
         */

        this.vgap = this.hgap = this.tabAreaX = 0;
        this.repaintWidth = this.repaintHeight = this.repaintX = this.repaintY = 0;
        this.sideSpace = 1;

        this.tabAreaY = this.tabAreaWidth = this.tabAreaHeight = 0;
        this.overTab = this.selectedIndex = -1;
        this.orient = L.$constraints(o);
        this._ = new Listeners();
        this.pages = [];
        this.views = {};

        if (pkg.Tabs.font != null) this.render.setFont(pkg.Tabs.font);
        if (pkg.Tabs.fontColor != null) this.render.setColor(pkg.Tabs.fontColor);

        this.$super();

        // since alignment pass as the constructor argument the setter has to be called after $super
        // because $super can re-set title alignment
        this.setAlignment(o);
    },

    function focused(){
        this.$super();
        if (this.selectedIndex >= 0){
            var r = this.getTabBounds(this.selectedIndex);
            this.repaint(r.x, r.y, r.width, r.height);
        }
        else {
            if (this.hasFocus() === false) {
                this.select(this.next(0, 1));
            }
        }
    },

    function insert(index,constr,c) {
        var render = null
        if (instanceOf(constr, this.$clazz.TabView)) {
            render = constr;
        }
        else {
            render = new this.$clazz.TabView((constr == null ? "Page " + index : constr ));
            render.ownerChanged(this); // TODO: a little bit ugly but settin an owner is required to
                                       // keep tabs comppnent infprmed when an icon has been updated
        }

        this.pages.splice(index * 2, 0, render, { x:0, y:0, width:0, height:0 });

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
pkg.Slider = Class(pkg.Panel, [
    function $prototype() {
        this.max = this.min = this.value = this.roughStep = this.exactStep = 0;
        this.netSize = this.gap = 3;
        this.correctDt = this.scaleStep = this.psW = this.psH = 0;
        this.intervals = this.pl = null;
        this.canHaveFocus = true;

        /**
         * Get a value
         * @return {Integer} a value
         * @method getValue
         */
        this.getValue = function() {
            return this.value;
        };

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
                if(this.isEnabled === true) {
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
                    g.setColor(this.isEnabled === true ? this.scaleColor : "gray");
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
                if (this.isEnabled === true) {
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

        this.setValue = function(v) {
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

        this.getView = function(d,o){
            this.render.setValue(o != null ? o.toString() : "");
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

/**
 * Status bar UI component class
 * @class zebra.ui.StatusBar
 * @param {Integer} [gap] a gap between status bar children elements
 * @extends {zebra.ui.Panel}
 */
pkg.StatusBar = Class(pkg.Panel, [
    function () { this.$this(2); },

    function (gap){
        this.setPadding(gap, 0, 0, 0);
        this.$super(new L.PercentLayout(Layout.HORIZONTAL, gap));
    },

    /**
     * Set the specified border to be applied for status bar children components
     * @param {zebra.ui.View} v a border
     * @method setBorderView
     */
    function setBorderView(v){
        if (v != this.borderView){
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
 * Toolbar UI component. Handy way to place number of click able elements
 * @class zebra.ui.Toolbar
 * @extends {zebra.ui.Panel}
 */

/**
 * Fired when a toolbar element has been pressed

        var t = new zebra.ui.Toolbar();

        // add three pressable icons
        t.addImage("icon1.jpg");
        t.addImage("icon2.jpg");
        t.addLine();
        t.addImage("ico3.jpg");

        // catch a toolbar icon has been pressed
        t.bind(function (src) {
            ...
        });

 * @event pressed
 * @param {zebra.ui.Panel} src a toolbar element that has been pressed
 */
pkg.Toolbar = Class(pkg.Panel, [
    function $clazz() {
        this.ToolPan = Class(pkg.EvStatePan, [
            function(c) {
                this.$super(new L.BorderLayout());
                this.add(L.CENTER, c);
            },

            function stateUpdated(o, n) {
                this.$super(o, n);
                if (o == PRESSED_OVER && n == OVER) {
                    this.parent._.fired(this.kids[0]);
                }
            }
        ]);

        this.ImagePan = Class(pkg.ImagePan, []);
        this.Line     = Class(pkg.Line, []);
        this.Checkbox = Class(pkg.Checkbox, []);
        this.Radiobox = Class(pkg.Radiobox, []);
    },

    function $prototype() {
        /**
         * Test if the given component is a decorative element
         * in the toolbar
         * @param  {zebra.ui.Panel}  c a component
         * @return {Boolean} return true if the component is
         * decorative element of the toolbar
         * @method isDecorative
         * @protected
         */
        this.isDecorative = function(c){
            return instanceOf(c, pkg.EvStatePan) === false;
        };
    },

    function () {
        this._ = new Listeners();
        this.$super();
    },

    /**
     * Add a radio box as the toolbar element that belongs to the
     * given group and has the specified content component
     * @param {zebra.ui.Group} g a radio group the radio box belongs
     * @param {zebra.ui.Panel} c a content
     * @return {zebra.ui.Panel} a component that has been added
     * @method addRadio
     */
    function addRadio(g,c) {
        var cbox = new this.$clazz.Radiobox(c, g);
        cbox.setCanHaveFocus(false);
        return this.add(cbox);
    },

    /**
     * Add a check box as the toolbar element with the specified content
     * component
     * @param {zebra.ui.Panel} c a content
     * @return {zebra.ui.Panel} a component that has been added
     * @method addSwitcher
     */
    function addSwitcher(c){
        return this.add(new this.$clazz.Checkbox(c));
    },

    /**
     * Add an image as the toolbar element
     * @param {String|Image} img an image or a path to the image
     * @return {zebra.ui.Panel} a component that has been added
     * @method addImage
     */
    function addImage(img) {
        this.validateMetric();
        return this.add(new this.$clazz.ImagePan(img));
    },

    /**
     * Add line to the toolbar component. Line is a decorative ]
     * element that logically splits toolbar elements. Line as any
     * other decorative element doesn't fire event
     * @return {zebra.ui.Panel} a component that has been added
     * @method addLine
     */
    function addLine(){
        var line = new this.$clazz.Line();
        line.constraints = L.STRETCH;
        return this.addDecorative(line);
    },

    /**
     * Add the given component as decorative element of the toolbar.
     * Decorative elements don't fire event and cannot be pressed
     * @param {zebra.ui.Panel} c a component
     * @return {zebra.ui.Panel} a component that has been added
     * @method addDecorative
     */
    function addDecorative(c){
        return this.$super(this.insert, this.kids.length, null, c);
    },

    function insert(i,id,d){
        return this.$super(i, id, new this.$clazz.ToolPan(d));
    }
]);

/**
 * Simple video panel that can be used to play a video:
 *

        // create canvas, add video panel to the center and
        // play video
        var canvas = zebra.ui.zCanvas(500,500).root.properties({
            layout: new zebra.layout.BorderLayout(),
            zebra.layout.CENTER: new zebra.ui.VideoPan("trailer.mpg")
        });

 *
 * @param {String} url an URL to a video
 * @class zebra.ui.VideoPan
 * @extends {zebra.ui.Panel}
 * @constructor
 */
pkg.VideoPan = Class(pkg.Panel,  [
    function $prototype() {
        this.paint = function(g) {
            g.drawImage(this.video, 0, 0, this.width, this.height);
        };

        /**
         * Pause video
         * @method pause
         */
        this.pause = function() {
            if (this.isPlaying === true) {
                this.isPlaying = false;
                this.video.pause();
            }
        };

        /**
         * Start or continue playing video
         * @method play
         */
        this.play = function() {
            if (this.isPlaying === false) {
                this.isPlaying = true;
                this.video.play();

                var $this = this;
                window.requestAFrame(function anim() {
                    if ($this.isReady === true) $this.repaint();
                    if ($this.isPlaying === true) window.requestAFrame(anim);
                })

            }
        };

        /**
         * Called whenever a video playing has been finished
         * @method finished
         */
    },

    function(src) {
        this.isPlaying = false;
        this.isReady = false;

        var $this = this;

        /**
         * Original video DOM element that is created
         * to play video
         * @type {Video}
         * @readOnly
         * @attribute video
         */
        this.video = document.createElement("video");
        this.video.setAttribute("src", src);

        this.video.addEventListener("canplaythrough", function() {
            $this.isReady = true;
        }, false);

        this.video.addEventListener("ended", function() {
            $this.isPlaying = false;
            if ($this.finished != null) $this.finished();
        }, false);

        this.$super();
    }
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
    function $prototype() {
        this[''] = function(color) {
            this.color = (color != null ? color : "rgb(65, 131, 255)");
        };

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
    function $prototype() {
        this[''] = function(dir, color) {
            this.color     = (color != null ? color : "#AAAAAA");
            this.direction = (dir   != null ? L.$constraints(dir) : L.VERTICAL);
        };

        this.paint =  function(g,x,y,w,h,d) {
            g.beginPath();
            if (this.direction == L.VERTICAL) {
                var r = w/2;
                g.arc(x + r, y + r, r, Math.PI, 0, false);
                g.lineTo(x + w, y + h - r);
                g.arc(x + r, y + h - r, r, 0, Math.PI, false);
                g.lineTo(x, y + r);
            }
            else {
                var r = h/2;
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
            g.arc(~~(x + w/2), ~~(y + h/2) , ~~(w/3 - 0.5), 0, 2* Math.PI, 1, false);
            g.fill();

            g.beginPath();
            g.fillStyle = this.color2;
            g.arc(~~(x + w/2), ~~(y + h/2) , ~~(w/4 - 0.5), 0, 2* Math.PI, 1, false);
            g.fill();
        };
    }
]);

/**
 * Mobile scroll manager class. Implements inertial scrolling in zebra mobile application.
 * @class zebra.ui.MobileScrollMan
 * @extends zebra.ui.Manager
 * @constructor
 */
pkg.MobileScrollMan = Class(pkg.Manager, [
    function $prototype() {
        this.sx = this.sy = 0;
        this.target = null;
        this.identifier = -1;

        /**
         * Define mouse drag started events handler.
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseDragStarted
         */
        this.mouseDragStarted = function(e) {
            if (e.touchCounter == 1)  {
                this.identifier = e.touch.identifier;  // finger
                var owner = e.source;

                while(owner != null && instanceOf(owner, pkg.ScrollPan) === false) {
                    owner = owner.parent;
                }

                if (owner != null && owner.mouseDragged == null) {
                    this.target = owner;
                    this.sx = e.x;
                    this.sy = e.y;
                }
            }
        };

        /**
         * Define mouse dragged events handler.
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseDragged
         */
        this.mouseDragged = function(e) {
            if (e.touchCounter   == 1 &&
                this.target      != null &&
                this.identifier  == e.touch.identifier)
            {
                var d = e.touch.direction;
                if (d == L.BOTTOM || d == L.TOP) {
                    if (this.target.vBar != null && this.target.vBar.isVisible === true) {
                        var bar = this.target.vBar;
                        bar.position.setOffset(bar.position.offset - e.y + this.sy);
                    }
                }
                else {
                    if (d == L.LEFT || d == L.RIGHT) {
                        if (this.target.hBar != null && this.target.hBar.isVisible === true) {
                            var bar = this.target.hBar;
                            bar.position.setOffset(bar.position.offset - e.x + this.sx);
                        }
                    }
                }

                this.sx = e.x;
                this.sy = e.y;
            }
        };

        /**
         * Define mouse drag ended events handler.
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseDragEnded
         */
        this.mouseDragEnded = function(e) {
            if (this.target != null &&
                this.timer  == null &&
                this.identifier == e.touch.identifier &&
                (e.touch.direction == L.BOTTOM || e.touch.direction == L.TOP) &&
                this.target.vBar != null &&
                this.target.vBar.isVisible === true &&
                e.touch.dy != 0)
            {
                this.$dt = 2*e.touch.dy;
                var $this = this, bar = this.target.vBar, k = 0;

                this.timer = setInterval(function() {
                    var o = bar.position.offset;

                    bar.position.setOffset(o - $this.$dt);
                    if (++k%5 === 0) {
                        $this.$dt = ~~($this.$dt/2);
                    }
                    if (o == bar.position.offset || ($this.$dt >= -1  &&  $this.$dt <= 1)) {
                        clearInterval($this.timer);
                        $this.timer = $this.target = null;
                    }
                }, 10);
            }
        };

        /**
         * Define mouse pressed events handler.
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mousePressed
         */
        this.mousePressed = function(e) {
            if (this.timer != null) {
                clearInterval(this.timer);
                this.timer = null;
            }
            this.target = null;
        }
    }
]);

/**
 * @for
 */

})(zebra("ui"), zebra.Class);

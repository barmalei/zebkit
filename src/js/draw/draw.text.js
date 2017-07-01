zebkit.package("draw", function(pkg, Class) {
    /**
     * Default normal font
     * @attribute font
     * @type {zebkit.Font}
     * @for  zebkit.draw
     */
    pkg.font = new zebkit.Font("Arial", 14);

    /**
     * Default small font
     * @attribute smallFont
     * @type {zebkit.Font}
     * @for  zebkit.draw
     */
    pkg.smallFont = new zebkit.Font("Arial", 10);

    /**
     * Default bold font
     * @attribute boldFont
     * @type {zebkit.Font}
     * @for  zebkit.draw
     */
    pkg.boldFont = new zebkit.Font("Arial", "bold", 12);

    /**
     * Base class to build text render implementations.
     * @class  zebkit.draw.BaseTextRender
     * @constructor
     * @param  {Object} [target]  target component to be rendered
     * @extends zebkit.draw.Render
     */
    pkg.BaseTextRender = Class(pkg.Render, [
        function $clazz() {
            this.font          =  pkg.font;
            this.color         = "gray";
            this.disabledColor = "white";
        },

        function $prototype(clazz) {
            /**
             * UI component that holds the text render
             * @attribute owner
             * @default null
             * @readOnly
             * @protected
             * @type {zebkit.layout.Layoutable}
             */
            this.owner = null;

            /**
             * Line indention
             * @attribute lineIndent
             * @type {Integer}
             * @default 1
             */
            this.lineIndent = 1;

            // implement position metric methods
            this.getMaxOffset = this.getLineSize = this.getLines = function() {
                return 0;
            };

            /**
             * Set the rendered text font.
             * @param  {String|zebkit.Font} f a font as CSS string or
             * zebkit.Font class instance
            *  @chainable
             * @method setFont
             */
            this.setFont = function(f) {
                if (zebkit.instanceOf(f, zebkit.Font) === false && f !== null) {
                    f = zebkit.newInstance(zebkit.Font, arguments);
                }

                if (f != this.font) {
                    this.font = f;

                    if (this.owner !== null && this.owner.isValid === true) {
                        this.owner.invalidate();
                    }

                    if (typeof this.invalidate !== 'undefined') {
                        this.invalidate();
                    }
                }
                return this;
            };

            /**
             * Resize font
             * @param  {String|Integer} size a new size of the font
             * @chainable
             * @method resizeFont
             */
            this.resizeFont = function(size) {
                return this.setFont(this.font.resize(size));
            };

            this.restyleFont = function(style) {
                return this.setFont(this.font.restyle(style));
            };

            /**
             * Get line height
             * @return {[type]} [description]
             */
            this.getLineHeight = function() {
                return this.font.height;
            };

            /**
             * Set rendered text color
             * @param  {String} c a text color
             * @method setColor
             * @chainable
             */
            this.setColor = function(c) {
                if (c != this.color) {
                    this.color = c.toString();
                }
                return this;
            };

            /**
             * Called whenever an owner UI component has been changed
             * @param  {zebkit.layout.Layoutable} v a new owner UI component
             * @method ownerChanged
             */
            this.ownerChanged = function(v) {
                this.owner = v;
            };

            this.valueWasChanged = function(o, n) {
                if (this.owner !== null && this.owner.isValid) {
                    this.owner.invalidate();
                }

                if (typeof this.invalidate !== 'undefined') {
                    this.invalidate();
                }
            };

            this.toString = function() {
                return this.target === null ? null
                                            : this.target;
            };
        }
    ]);

    /**
     * Lightweight implementation of single line string render. The render requires
     * a simple string as a target object.
     * @param {String} str a string to be rendered
     * @param {zebkit.Font} [font] a text font
     * @param {String} [color] a text color
     * @constructor
     * @extends zebkit.draw.BaseTextRender
     * @class zebkit.draw.StringRender
     */
    pkg.StringRender = Class(pkg.BaseTextRender, [
        function $prototype() {
            this.stringWidth = -1;

            // for the sake of speed up construction of the widely used render
            // declare it none standard way.
            this[''] = function(txt, font, color) {
                this.setValue(txt);

                /**
                 * Font to be used to render the target string
                 * @attribute font
                 * @readOnly
                 * @type {zebkit.Font}
                 */
                this.font = arguments.length > 1 ? font : this.clazz.font;

                /**
                 * Color to be used to render the target string
                 * @readOnly
                 * @attribute color
                 * @type {String}
                 */
                this.color = arguments.length > 2 ? color : this.clazz.color;
            };

            // implement position metric methods
            this.getMaxOffset = function() {
                return this.target.length;
            };

            this.getLineSize = function(l) {
                return this.target.length + 1;
            };

            this.getLines = function() {
                return 1;
            };

            this.calcLineWidth = function() {
                if (this.stringWidth < 0) {
                    this.stringWidth = this.font.stringWidth(this.target);
                }
                return this.stringWidth;
            };

            this.invalidate = function() {
                this.stringWidth = -1;
            };

            this.paint = function(g,x,y,w,h,d) {
                // save a few milliseconds
                if (this.font.s !== g.font) {
                    g.setFont(this.font);
                }

                if (d !== null && typeof d.getStartSelection !== 'undefined') {
                    var startSel = d.getStartSelection(),
                        endSel   = d.getEndSelection();

                    if (startSel     !== null       &&
                        endSel       !== null       &&
                        startSel.col !== endSel.col &&
                        d.selectView !== null          )
                    {
                        d.selectView.paint(g, x + this.font.charsWidth(this.target, 0, startSel.col),
                                              y,
                                              this.font.charsWidth(this.target,
                                                                   startSel.col,
                                                                   endSel.col - startSel.col),
                                              this.getLineHeight(), d);
                    }
                }

                // save a few milliseconds
                if (this.color !== g.fillStyle) {
                    g.fillStyle = this.color;
                }

                if (d !== null && d.isEnabled === false) {
                    g.fillStyle = d !== null &&
                                  d.disabledColor !== null &&
                                  typeof d.disabledColor !== 'undefined'  ? d.disabledColor
                                                                          : this.clazz.disabledColor;
                }

                g.fillText(this.target, x, y);
            };

            this.getLine = function(l) {
                if (l < 0 || l > 1) {
                    throw new RangeError();
                }
                return this.target;
            };

            this.getPreferredSize = function() {
                if (this.stringWidth < 0) {
                    this.stringWidth = this.font.stringWidth(this.target);
                }

                return {
                    width: this.stringWidth,
                    height: this.font.height
                };
            };
        }
    ]);

    /**
     * Text render that expects and draws a text model or a string as its target
     * @class zebkit.draw.TextRender
     * @constructor
     * @extends zebkit.draw.BaseTextRender
     * @uses zebkit.util.Position.Metric
     * @param  {String|zebkit.data.TextModel} text a text as string or text model object
     */
    pkg.TextRender = Class(pkg.BaseTextRender, zebkit.util.Position.Metric, [
        function $prototype() {
            this.textWidth = this.textHeight = this.startInvLine = this.invLines = 0;

            // speed up constructor by avoiding super execution since
            // text render is one of the most used class
            this[''] = function(text) {
                /**
                 * Text color
                 * @attribute color
                 * @type {String}
                 * @default zebkit.draw.TextRender.color
                 * @readOnly
                 */
                this.color = this.clazz.color;

                /**
                 * Text font
                 * @attribute font
                 * @type {String|zebkit.Font}
                 * @default zebkit.draw.TextRender.font
                 * @readOnly
                 */
                this.font = this.clazz.font;

                this.setValue(text);
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

            this.getMaxOffset = function() {
                return this.target.getTextLength();
            };

            /**
             * Paint the specified text line
             * @param  {CanvasRenderingContext2D} g graphical 2D context
             * @param  {Integer} x x coordinate
             * @param  {Integer} y y coordinate
             * @param  {Integer} line a line number
             * @param  {zebkit.layout.Layoutable} d an UI component on that the line has to be rendered
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

            /**
             * Set the text model content
             * @param  {String|zebkit.data.TextModel} s a text as string object
             * @method setValue
             * @chainable
             */
            this.setValue = function(s) {
                if (typeof s === "string" || s.constructor === String) {
                    if (this.target !== null) {
                        this.target.setValue(s);
                        return this;
                    } else {
                        s = new zebkit.data.Text(s);
                    }
                }

                //TODO: copy paste from Render to speed up
                if (this.target !== s) {
                    var old = this.target;
                    this.target = s;
                    if (typeof this.valueWasChanged !== 'undefined') {
                        this.valueWasChanged(old, s);
                    }
                }

                return this;
            };

            /**
             * Get the given text line width in pixels
             * @param  {Integer} line a text line number
             * @return {Integer} a text line width in pixels
             * @method lineWidth
             */
            this.calcLineWidth = function(line){
                if (this.invLines > 0) {
                    this.recalc();
                }

                return this.target.$lineTags(line).$lineWidth;
            };

            /**
             * Called every time the target text metrics has to be recalculated
             * @method recalc
             */
            this.recalc = function() {
                if (this.invLines > 0 && this.target !== null){
                    var model = this.target, i = 0;
                    if (this.invLines > 0) {
                        for(i = this.startInvLine + this.invLines - 1; i >= this.startInvLine; i--) {
                            model.$lineTags(i).$lineWidth = this.font.stringWidth(this.getLine(i));
                        }
                        this.startInvLine = this.invLines = 0;
                    }

                    this.textWidth = 0;
                    var size = model.getLines();
                    for(i = 0; i < size; i++){
                        var len = model.$lineTags(i).$lineWidth;
                        if (len > this.textWidth) {
                            this.textWidth = len;
                        }
                    }
                    this.textHeight = this.getLineHeight() * size + (size - 1) * this.lineIndent;
                }
            };

            /**
             * Text model update listener handler
             * @param  {zebkit.data.TextModel} src text model object
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
                    if (this.invLines > 0) {
                        var p1 = ful - this.startInvLine,
                            p2 = this.startInvLine + this.invLines - ful - updatedLines;
                        this.invLines = ((p1 > 0) ? p1 : 0) + ((p2 > 0) ? p2 : 0) + 1;
                        this.startInvLine = this.startInvLine < ful ? this.startInvLine : ful;
                    } else {
                        this.startInvLine = ful;
                        this.invLines = 1;
                    }

                    if (this.owner !== null && this.owner.isValid !== true) {
                        this.owner.invalidate();
                    }
                } else {
                    if (this.invLines > 0) {
                        if (ful <= this.startInvLine) {
                            this.startInvLine += (updatedLines - 1);
                        } else if (ful < (this.startInvLine + size)) {
                            size += (updatedLines - 1);
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
            this.invalidate = function(start,size) {
                if (arguments.length === 0) {
                    start = 0;
                    size  = this.getLines();
                    if (size === 0) {
                        this.invLines = 0;
                        return;
                    }
                }

                if (size > 0 && (this.startInvLine !== start || size !== this.invLines)) {
                    if (this.invLines === 0){
                        this.startInvLine = start;
                        this.invLines = size;
                    } else {
                        var e = this.startInvLine + this.invLines;
                        this.startInvLine = start < this.startInvLine ? start : this.startInvLine;
                        this.invLines     = Math.max(start + size, e) - this.startInvLine;
                    }

                    if (this.owner !== null) {
                        this.owner.invalidate();
                    }
                }
            };

            this.getPreferredSize = function(){
                if (this.invLines > 0 && this.target !== null) {
                    this.recalc();
                }
                return { width:this.textWidth, height:this.textHeight };
            };

            this.paint = function(g,x,y,w,h,d) {
                var ts = g.$states[g.$curState];
                if (ts.width > 0 && ts.height > 0) {
                    var lineIndent   = this.lineIndent,
                        lineHeight   = this.getLineHeight(),
                        lilh         = lineHeight + lineIndent,
                        startInvLine = 0;

                    w = ts.width  < w ? ts.width  : w;
                    h = ts.height < h ? ts.height : h;

                    if (y < ts.y) {
                        startInvLine = Math.floor((lineIndent + ts.y - y) / lilh);
                        h += (ts.y - startInvLine * lineHeight - startInvLine * lineIndent);
                    } else if (y > (ts.y + ts.height)) {
                        return;
                    }

                    var size = this.getLines();
                    if (startInvLine < size){
                        var lines = Math.floor((h + lineIndent) / lilh) + (((h + lineIndent) % lilh > lineIndent) ? 1 : 0), i = 0;
                        if (startInvLine + lines > size) {
                            lines = size - startInvLine;
                        }
                        y += startInvLine * lilh;

                        // save few milliseconds
                        if (this.font.s !== g.font) {
                            g.setFont(this.font);
                        }

                        if (d === null || d.isEnabled === true){
                            // save few milliseconds
                            if (this.color != g.fillStyle) {
                                g.fillStyle = this.color;
                            }

                            var p1 = null, p2 = null, bsel = false;
                            if (lines > 0 && d !== null && typeof d.getStartSelection !== 'undefined') {
                                p1   = d.getStartSelection();
                                p2   = d.getEndSelection();
                                bsel = p1 !== null && (p1.row !== p2.row || p1.col !== p2.col);
                            }

                            for(i = 0; i < lines; i++){
                                if (bsel === true) {
                                    var line = i + startInvLine;
                                    if (line >= p1.row && line <= p2.row){
                                        var s  = this.getLine(line),
                                            lw = this.calcLineWidth(line),
                                            xx = x;

                                        if (line === p1.row) {
                                            var ww = this.font.charsWidth(s, 0, p1.col);
                                            xx += ww;
                                            lw -= ww;
                                            if (p1.row === p2.row) {
                                                lw -= this.font.charsWidth(s, p2.col, s.length - p2.col);
                                            }
                                        } else if (line === p2.row) {
                                            lw = this.font.charsWidth(s, 0, p2.col);
                                        }
                                        this.paintSelection(g, xx, y, lw === 0 ? 1 : lw, lilh, line, d);

                                        // restore color to paint text since it can be
                                        // res-set with paintSelection method
                                        if (this.color !== g.fillStyle) {
                                            g.fillStyle = this.color;
                                        }
                                    }
                                }

                                this.paintLine(g, x, y, i + startInvLine, d);
                                y += lilh;
                            }
                        } else {
                            var dcol = d !== null &&
                                       d.disabledColor !== null &&
                                       typeof d.disabledColor !== 'undefined' ? d.disabledColor
                                                                              : pkg.TextRender.disabledColor;

                            for(i = 0; i < lines; i++) {
                                g.setColor(dcol);
                                this.paintLine(g, x, y, i + startInvLine, d);
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
             * @param  {CanvasRenderingContext2D} g a canvas graphical context
             * @param  {Integer} x a x coordinate of selection rectangular area
             * @param  {Integer} y a y coordinate of selection rectangular area
             * @param  {Integer} w a width of of selection rectangular area
             * @param  {Integer} h a height of of selection rectangular area
             * @param  {Integer} line [description]
             * @param  {zebkit.layout.Layoutable} d a target UI component where the text
             * has to be rendered
             * @protected
             * @method paintSelection
             */
            this.paintSelection = function(g, x, y, w, h, line, d) {
                if (d.selectView !== null) {
                    d.selectView.paint(g, x, y, w, h, d);
                }
            };

            this.toString = function() {
                return this.target === null ? null
                                            : this.target.getValue();
            };
        },

        function valueWasChanged(o,n){
            if (o !== null) {
                o.off(this);
            }

            if (n !== null) {
                n.on(this);
            }
            this.$super(o, n);
        }
    ]);

    pkg.WrappedTextRender = new Class(pkg.TextRender, [
        function $prototype() {
            this.brokenLines = null;
            this.lastWidth = -1;

            this.breakLine = function (w, startIndex, line, lines) {
                if (line === "") {
                    lines.push(line);
                } else {
                    var breakIndex = startIndex < line.length ? startIndex
                                                              : line.length - 1,
                        direction  = 0;

                    for(; breakIndex >= 0 && breakIndex < line.length ;) {
                        var substrLen = this.font.charsWidth(line, 0, breakIndex + 1);
                        if (substrLen < w) {
                            if (direction < 0) {
                                break;
                            } else {
                                direction = 1;
                            }
                            breakIndex ++;
                        } else if (substrLen > w) {
                            breakIndex--;
                            if (direction > 0) {
                                break;
                            } else {
                                direction = -1;
                            }
                        } else {
                            break;
                        }
                    }

                    if (breakIndex >= 0) {
                        lines.push(line.substring(0, breakIndex + 1));
                        if (breakIndex < line.length - 1) {
                            this.breakLine(w, startIndex, line.substring(breakIndex + 1), lines);
                        }
                    }
                }
            };

            this.breakToLines = function (w) {
                var m = this.target, startIndex = 0, res = [];
                for(var i = 0; i < m.getLines(); i++) {
                    var line = m.getLine(i);
                    this.breakLine(w, startIndex, line, res);
                }
                return res;
            };

            this.getLines = function() {
                return this.brokenLines.length;
            };

            this.getLine = function(i) {
                return this.brokenLines[i];
            };
        },

        function invalidate(sl, len){
            this.$super(sl, len);
            if (this.brokenLines !== null) {
                this.brokenLines.length = 0;
            }
            this.lastWidth = -1;
        },

        function getPreferredSize(pw, ph) {
            if (arguments.length === 2) {
                if (this.lastWidth < 0 || this.lastWidth !== pw) {
                    this.lastWidth = pw;
                    this.brokenLines = this.breakToLines(pw);
                }
                return {
                    width  : pw,
                    height : this.brokenLines.length * this.getLineHeight() + (this.brokenLines.length - 1) * this.lineIndent
                };
            } else {
                return this.$super();
            }
        },

        function paint(g,x,y,w,h,d) {
            if (this.lastWidth < 0 || this.lastWidth !== w) {
                this.lastWidth = w;
                this.brokenLines = this.breakToLines(w);
            }
            this.$super(g,x,y,w,h,d);
        }
    ]);

    pkg.DecoratedTextRender = zebkit.Class(pkg.TextRender, [
        function(text) {
            this.decorations = {
                underline : null,
                strike    : null
            };
            this.$super(text);
        },

        function $prototype() {
            this.lineWidth = 1;

            this.setDecoration = function(id, color) {
                if (id === null || typeof id === 'undefined') {
                    throw new Error();
                }
                this.decorations[id] = color;
                return this;
            };

            this.setDecorations = function(d) {
                this.decorations = zebkit.clone(d);
                // TODO: the method has to be replaced with addDecoration/clearDecoration
                if (typeof this.decorations.underline === 'undefined') {
                    this.decorations.underline = null;
                }

                if (typeof this.decorations.strike === 'undefined') {
                    this.decorations.strike = null;
                }

                return this;
            };
        },

        function paintLine(g,x,y,line,d) {
            this.$super(g,x,y,line,d);
            var lw = this.calcLineWidth(line),
                lh = this.getLineHeight(line);

            if (this.decorations.underline !== null) {
                g.lineWidth = this.lineWidth;
                g.setColor(this.decorations.underline);
                g.drawLine(x, y + lh - 1, x + lw, y  + lh - 1);
            }

            if (this.decorations.strike !== null) {
                var yy = y + Math.round(lh / 2) - 1;
                g.setColor(this.decorations.strike);
                g.lineWidth = this.lineWidth;
                g.drawLine(x, yy, x + lw, yy);
            }
        }
    ]);

    pkg.BoldTextRender = Class(pkg.TextRender, [
        function $clazz() {
            this.font = pkg.boldFont;
        }
    ]);

    /**
     * Password text render class. This class renders a secret text with hiding it with the given character.
     * @param {String|zebkit.data.TextModel} [text] a text as string or text model instance
     * @class zebkit.draw.PasswordText
     * @constructor
     * @extends zebkit.draw.TextRender
     */
    pkg.PasswordText = Class(pkg.TextRender, [
        function(text){
            if (arguments.length === 0) {
                text = new zebkit.data.SingleLineTxt("");
            }

            this.$super(text);
        },

        function $prototype() {
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

            /**
             * Set the specified echo character. The echo character is used to hide secret text.
             * @param {String} ch an echo character
             * @method setEchoChar
             * @chainable
             */
            this.setEchoChar = function(ch){
                if (this.echo !== ch){
                    this.echo = ch;
                    if (this.target !== null) {
                        this.invalidate(0, this.target.getLines());
                    }
                }
                return this;
            };
        },

        function getLine(r){
            var buf = [], ln = this.$super(r);

            for(var i = 0;i < ln.length; i++) {
                buf[i] = this.echo;
            }

            if (this.showLast && ln.length > 0) {
                buf[ln.length - 1] = ln[ln.length - 1];
            }

            return buf.join('');
        }
    ]);

    pkg.TabBorder = Class(pkg.View, [
        function(t, w) {
            if (arguments.length > 1) {
                this.width  = w;
            }

            if (arguments.length > 0) {
                this.state = t;
            }

            this.left = this.top = this.bottom = this.right = 6 + this.width;
        },

        function $prototype() {
            this.state  = "out";
            this.width  = 1;

            this.fillColor1 = "#DCF0F7";
            this.fillColor2 = "white";
            this.fillColor3 = "#F3F3F3";

            this.onColor1 = "black";
            this.onColor2 = "#D9D9D9";
            this.offColor = "#A1A1A1";


            this.paint = function(g,x,y,w,h,d){
                var xx = x + w - 1,
                    yy = y + h - 1,
                    o  = d.parent.orient,
                    t  = this.state,
                    s  = this.width,
                    ww = 0,
                    hh = 0,
                    dt = s / 2;

                g.beginPath();
                g.lineWidth = s;
                switch(o) {
                    case "left":
                        g.moveTo(xx + 1, y + dt);
                        g.lineTo(x + s * 2, y + dt);
                        g.lineTo(x + dt , y + s * 2);
                        g.lineTo(x + dt, yy - s * 2 + dt);
                        g.lineTo(x + s * 2, yy + dt);
                        g.lineTo(xx + 1, yy + dt);

                        if (d.isEnabled === true){
                            g.setColor(t === "over" ? this.fillColor1 : this.fillColor2);
                            g.fill();
                        }

                        g.setColor((t === "selected" || t === "over") ? this.onColor1 : this.offColor);
                        g.stroke();

                        if (d.isEnabled === true) {
                            ww = Math.floor((w - 6) / 2);
                            g.setColor(this.fillColor3);
                            g.fillRect(xx - ww + 1, y + s, ww, h - s - 1);
                        }

                        if (t === "out") {
                            g.setColor(this.onColor2);
                            g.drawLine(x + 2*s + 1, yy - s, xx + 1, yy - s, s);
                        }
                        break;
                    case "right":
                        xx -= dt; // thick line grows left side and right side proportionally
                                  // correct it

                        g.moveTo(x, y + dt);
                        g.lineTo(xx - 2 * s, y + dt);

                        g.lineTo(xx, y + 2 * s);
                        g.lineTo(xx, yy - 2 * s);
                        g.lineTo(xx - 2 * s, yy + dt);
                        g.lineTo(x, yy + dt);

                        if (d.isEnabled === true){
                            g.setColor(t === "over" ? this.fillColor1 : this.fillColor2);
                            g.fill();
                        }

                        g.setColor((t === "selected" || t === "over") ? this.onColor1 : this.offColor);
                        g.stroke();

                        if (d.isEnabled === true) {
                            ww = Math.floor((w - 6) / 2);
                            g.setColor(this.fillColor3);
                            g.fillRect(x, y + s, ww, h - s - 1);
                        }

                        if (t === "out") {
                            g.setColor(this.onColor2);
                            g.drawLine(x, yy - s, xx - s - 1, yy - s, s);
                        }
                        break;
                    case "top":
                        g.moveTo(x + dt, yy + 1 );
                        g.lineTo(x + dt, y + s*2);
                        g.lineTo(x + s * 2, y + dt);
                        g.lineTo(xx - s * 2 + s, y + dt);
                        g.lineTo(xx + dt, y + s * 2);
                        g.lineTo(xx + dt, yy + 1);

                        if (d.isEnabled === true){
                            g.setColor(t === "over" ? this.fillColor1 : this.fillColor2);
                            g.fill();
                        }

                        g.setColor((t === "selected" || t === "over") ? this.onColor1 : this.offColor);
                        g.stroke();

                        if (d.isEnabled === true){
                            g.setColor(this.fillColor3);
                            hh = Math.floor((h - 6) / 2);
                            g.fillRect(x + s, yy - hh + 1 , w - s - 1, hh);
                        }

                        if (t === "selected") {
                            g.setColor(this.onColor2);
                            g.beginPath();
                            g.moveTo(xx + dt - s, yy + 1);
                            g.lineTo(xx + dt - s, y + s * 2);
                            g.stroke();
                        }

                        break;
                    case "bottom":
                        yy -= dt;

                        g.moveTo(x + dt, y);
                        g.lineTo(x + dt, yy - 2 * s);
                        g.lineTo(x + 2 * s + dt, yy);
                        g.lineTo(xx - 2 * s, yy);
                        g.lineTo(xx + dt, yy - 2 * s);
                        g.lineTo(xx + dt, y);

                        if (d.isEnabled === true){
                            g.setColor(t === "over" ? this.fillColor1 : this.fillColor2);
                            g.fill();
                        }

                        g.setColor((t === "selected" || t === "over") ? this.onColor1 : this.offColor);
                        g.stroke();

                        if (d.isEnabled === true){
                            g.setColor(this.fillColor3);
                            hh = Math.floor((h - 6) / 2);
                            g.fillRect(x + s, y, w - s - 1, hh);
                        }

                        if (t === "selected") {
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
});
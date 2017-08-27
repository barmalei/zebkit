zebkit.package("draw", function(pkg, Class) {

    /**
     * Break the given line to parts that can be placed in the area with
     * the specified width.
     * @param  {zebkit.Font} font a font to compute text metrics
     * @param  {Integer} maxWidth a maximal area with
     * @param  {String} line   a line
     * @param  {Array} result a result array to accumulate wrapped lines
     * @method  wrapToLines
     * @for zebkit.draw
     */
    pkg.wrapToLines = function(font, maxWidth, line, result) {
        // The method goes through number of tokens the line is split. Token
        // is a word or delimiter. Delimiter is specified with the regexp
        // (in this implementation delimiter is one or more space). Delimiters
        // are also considered as tokens. On every iteration accumulated tokens
        // width is compared with maximal possible and if the width is greater
        // then maximal we sift to previous tokens set and put it as line to
        // result. Then start iterating again  from the last token we could
        // not accommodate.
        if (line === "") {
            result.push(line);
        } else {
            var len = font.stringWidth(line);
            if (len <= maxWidth) {
                result.push(line);
            } else {
                var m   = "not null",
                    b   = true,
                    i   = 0,
                    al  = 0,
                    pos = 0,
                    skip = false,
                    tokenEnd = 0,
                    searchRE = /\s+/g,
                    tokenStart = -1;

                for(; pos !== line.length; ) {
                    if (skip !== true && m !== null) {
                        if (b) {
                            m = searchRE.exec(line);
                            if (m === null) {
                                tokenStart = tokenEnd;
                                tokenEnd   = line.length;
                            }
                        }

                        if (m !== null) {
                            if (m.index > tokenEnd) {
                                // word token detected
                                tokenStart = tokenEnd;
                                tokenEnd   = m.index;
                                b = false;
                            } else {
                                // space token detected
                                tokenStart = m.index;
                                tokenEnd   = m.index + m[0].length;
                                b = true;
                            }
                        }
                    }
                    skip = false;
                    al = font.stringWidth(line.substring(pos, tokenEnd));
                    if (al > maxWidth) {
                        if (i === 0) {
                            result.push(line.substring(pos, tokenEnd));
                            pos = tokenEnd;
                        } else {
                            result.push(line.substring(pos, tokenStart));
                            pos = tokenStart;
                            skip = true;
                            i = 0;
                        }
                    } else {
                        if (tokenEnd === line.length) {
                            result.push(line.substring(pos, tokenEnd));
                            break;
                        } else {
                            i++;
                        }
                    }
                }
            }
        }
    };


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

            /**
             * Re-style font.
             * @param {String} style a new font style
             * @method restyleFont
             * @chainable
             */
            this.restyleFont = function(style) {
                return this.setFont(this.font.restyle(style));
            };

            /**
             * Get line height
             * @method getLineHeight
             * @return {Integer} a line height
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

            this.getLine = function(i) {
                throw new Error("Not implemented");
            };

            /**
             * Overridden method to catch target value changing events.
             * @param  {Object} o an old target value
             * @param  {Object} n a new target value
             * @method valueWasChanged
             */
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
     * @use zebkit.util.Position.Metric
     * @class zebkit.draw.StringRender
     */
    pkg.StringRender = Class(pkg.BaseTextRender, zebkit.util.Position.Metric, [
        function $prototype() {
            /**
             * Calculated string width (in pixels). If string width has not been calculated
             * the value is set to -1.
             * @attribute stringWidth
             * @protected
             * @default -1
             * @type {Integer}
             */
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

            // TODO: the methods below simulate text model methods. it is done for the future
            // usage of the string render for text field. The render can be convenient for masked
            // input implementation.
            this.write = function(s, off) {
                if (off === 0) {
                    this.target = s + this.target;
                } else if (off === s.length) {
                    this.target = this.target + s;
                } else {
                    this.target = this.target.substring(0, off) + s + this.target.substring(off);
                }

                return true;
            };

            this.remove = function(off, len) {
                this.target = this.target.substring(0, off) +
                              this.target.substring(off + len);
                return true;
            };

            this.replace = function(s, off, size) {
                if (s.length === 0) {
                    return this.remove(off, size);
                } else if (size === 0) {
                    return this.write(s, off);
                } else {
                    var b = this.remove(off, size, false);
                    return this.write(s, off) && b;
                }
            };

            /**
             * Implementation of position metric interface. Returns maximal
             * possible offset within the given string.
             * @method getMaxOffset
             * @return {Integer} a maximal possible offset.
             */
            this.getMaxOffset = function() {
                return this.target.length;
            };

            /**
             * Implementation of position metric interface. Returns the given
             * line size (in characters).
             * @param {Integer}  line a line number. This render supports only
             * single line.
             * @method getLineSize
             * @return {Integer} a line size
             */
            this.getLineSize = function(line) {
                if (line > 0) {
                    throw new RangeError("Line number " + line + " is out of the range");
                }
                return this.target.length + 1;
            };

            /**
             * Implementation of position metric interface. Returns number
             * of lines.
             * @method getLines
             * @return {Integer} a number of lines.
             */
            this.getLines = function() {
                return 1;
            };

            /**
             * Calculates string width if it has not been done yet.
             * @method calcLineWidth
             * @protected
             * @return {Integer} a string width
             */
            this.calcLineWidth = function() {
                if (this.stringWidth < 0) {
                    this.stringWidth = this.font.stringWidth(this.target);
                }
                return this.stringWidth;
            };

            /**
             * Invalidate the render state. Invalidation flushes string metrics
             * to be re-calculated again.
             * @protected
             * @method invalidate
             */
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

            /**
             * Get the given line.
             * @param  {Integer} l a line number
             * @return {String} a line
             * @method getLine
             */
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

            this.write = function() {
                return this.target.write.apply(this.target, arguments);
            };

            this.remove = function() {
                return this.target.remove.apply(this.target, arguments);
            };

            this.replace = function() {
                return this.target.replace.apply(this.target, arguments);
            };

            this.on = function() {
                return this.target.on.apply(this.target, arguments);
            };

            this.off = function() {
                return this.target.off.apply(this.target, arguments);
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
             * @param  {zebkit.data.TextEvent} e text event
             * @method textUpdated
             */
            this.textUpdated = function(e) {

                if (e.id === "remove") {
                    if (this.invLines > 0) {
                        var p1 = e.line - this.startInvLine,
                            p2 = this.startInvLine + this.invLines - e.line - e.lines;
                        this.invLines = ((p1 > 0) ? p1 : 0) + ((p2 > 0) ? p2 : 0) + 1;
                        this.startInvLine = this.startInvLine < e.line ? this.startInvLine : e.line;
                    } else {
                        this.startInvLine = e.line;
                        this.invLines = 1;
                    }

                    if (this.owner !== null && this.owner.isValid !== true) {
                        this.owner.invalidate();
                    }
                } else {  // insert
                    // TODO:  check the code
                    if (this.invLines > 0) {
                        if (e.line <= this.startInvLine) {
                            this.startInvLine += (e.lines - 1);
                        } else if (e.line < (this.startInvLine + this.invLines)) {
                            this.invLines += (e.lines - 1);
                        }
                    }
                    this.invalidate(e.line, e.lines);
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

    /**
     * Render to visualize string whose width is greater than available or specified width.
     * @class zebkit.draw.CutStringRender
     * @extends {zebkit.draw.StringRender}
     * @constructor
     * @param  {String} [txt] a string to be rendered
     */
    pkg.CutStringRender = Class(pkg.StringRender, [
        function $prototype() {
            /**
             * Maximal width of the string in pixels. By default the attribute
             * is set to -1.
             * @attribute maxWidth
             * @type {Integer}
             * @default -1
             */
            this.maxWidth = -1;

            /**
             * String to be rendered at the end of cut string
             * @attribute dots
             * @type {String}
             * @default "..."
             */
            this.dots  = "...";
        },

        function paint(g,x,y,w,h,d) {
            var maxw = -1;

            if (this.maxWidth > 0 && this.stringWidth > this.maxWidth) {
                maxw = this.maxWidth;
            } else if (this.stringWidth > w) {
                maxw = w;
            } else if (typeof g.$states !== 'undefined') {
                var ts = g.$states[g.$curState];
                if (ts.x > x || (ts.x + ts.width) < (x + w)) {
                    maxw = ts.width;
                }
            }

            if (maxw <= 0) {
                this.$super(g,x,y,w,h,d);
            } else {
                var dotsLen = this.font.stringWidth(this.dots);
                try {
                    g.save();
                    g.clipRect(x, y, maxw - dotsLen, h);
                    this.$super(g,x,y,w,h,d);
                } catch(e) {
                    g.restore();
                    throw e;
                }
                g.restore();
                g.setColor(this.color);
                g.setFont(this.font);
                g.fillText(this.dots, x + maxw - dotsLen, y);
            }
         }
    ]);

    /**
     * Wrapped text render.
     * @constructor
     * @param  {String|zebkit.data.TextModel} text a text as string or text model object
     * @class zebkit.draw.WrappedTextRender
     * @extends {zebkit.draw.TextRender}
     */
    pkg.WrappedTextRender = Class(pkg.TextRender, [
        function $prototype() {
            this.$brokenLines = [];
            this.$lastWidth    = -1;

            /**
             * Break text model to number of lines taking in account the maximal width.
             * @param  {Integer} w a maximal width
             * @return {Array}  an array of lines
             * @method $breakToLines
             * @private
             */
            this.$breakToLines = function(w) {
                var res = [];
                for (var i = 0; i < this.target.getLines(); i++) {
                    pkg.wrapToLines(this.font, w, this.target.getLine(i), res);
                }
                return res;
            };
        },

        function getLines() {
            return this.$lastWidth < 0 ? this.$super()
                                       : this.$brokenLines.length;
        },

        function getLine(i) {
            return this.$lastWidth < 0 ? this.$super(i)
                                       : this.$brokenLines[i];
        },

        function invalidate(sl, len){
            this.$super(sl, len);
            this.$brokenLines.length = 0;
            this.$lastWidth = -1;
        },

        /**
         * Get preferred size of the text render
         * @param  {Integer} [pw] a width the wrapped text has to be computed
         * @return {Object}  a preferred size
         *
         *     { width: {Integer}, height:{Integer} }
         *
         * @method calcPreferredSize
         */
        function calcPreferredSize(pw) {
            if (arguments.length > 0) {
                var bl = [];
                if (this.$lastWidth < 0 || this.$lastWidth !== pw) {
                    bl = this.$breakToLines(pw);
                } else {
                    bl = this.$brokenLines;
                }

                return {
                    width  : pw,
                    height : bl.length * this.getLineHeight() +
                            (bl.length - 1) * this.lineIndent
                };
            } else {
                return this.$super();
            }
        },

        function paint(g,x,y,w,h,d) {
            if (this.$lastWidth < 0 || this.$lastWidth !== w) {
                this.$lastWidth = w;
                this.$brokenLines = this.$breakToLines(this.$lastWidth);
            }
            this.$super(g,x,y,w,h,d);
        }
    ]);

    /**
     * Decorated text render. This decorator allows developer to draw under, over or strike
     * lines over the rendered text.
     * @class  zebkit.draw.DecoratedTextRender
     * @extends {zebkit.draw.TextRender}
     * @constructor
     * @param  {String|zebkit.data.TextModel} text a text as string or text model object
     */
    pkg.DecoratedTextRender = zebkit.Class(pkg.TextRender, [
        function(text) {
            this.decorations = {
                underline : false,
                strike    : false,
                overline  : false
            };
            this.$super(text);
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
             * Decoration line color
             * @attribute lineColor
             * @type {String}
             * @default  null
             */
            this.lineColor = null;

            /**
             * Set set of decorations.
             * @param {String} [decoration]* set of decorations.
             * @method setDecorations
             * @chainable
             */
            this.setDecorations = function(d) {
                for(var k in this.decorations) {
                    this.decorations[k] = false;
                }
                this.addDecorations.apply(this, arguments);
                return this;
            };

            /**
             * Clear the given decorations.
             * @param {String} [decorations]* decorations IDs.
             * @chainable
             * @method clearDecorations
             */
            this.clearDecorations = function() {
                for (var i = 0; i < arguments.length; i++) {
                    zebkit.util.validateValue(arguments[i], "underline", "overline", "strike");
                    this.decorations[arguments[i]] = false;
                }
                return this;
            };

            /**
             * Add the given decorations.
             * @param {String} [decorations]* decorations IDs.
             * @chainable
             * @method addDecorations
             */
            this.addDecorations = function() {
                for (var i = 0; i < arguments.length; i++) {
                    zebkit.util.validateValue(arguments[i], "underline", "overline", "strike");
                    this.decorations[arguments[i]] = true;
                }
                return this;
            };

            this.hasDecoration = function(dec) {
                return this.decorations[dec] === true;
            };
        },

        function paintLine(g,x,y,line,d) {
            this.$super(g,x,y,line,d);

            var lw = this.calcLineWidth(line),
                lh = this.getLineHeight(line);

            if (this.lineColor !== null) {
                g.setColor(this.lineColor);
            } else {
                g.setColor(this.color);
            }

            if (this.decorations.overline) {
                g.lineWidth = this.lineWidth;
                g.drawLine(x, y + this.lineWidth, x + lw, y + this.lineWidth);
            }

            if (this.decorations.underline) {
                g.lineWidth = this.lineWidth;
                g.drawLine(x, y + lh - 1, x + lw, y  + lh - 1);
            }

            if (this.decorations.strike) {
                var yy = y + Math.round(lh / 2) - 1;
                g.lineWidth = this.lineWidth;
                g.drawLine(x, yy, x + lw, yy);
            }

            // restore text color
            if (this.lineColor !== null) {
                g.setColor(this.color);
            }
        }
    ]);

    pkg.BoldTextRender = Class(pkg.TextRender, [
        function $clazz() {
            this.font = pkg.boldFont;
        }
    ]);

    /**
     * Password text render class. This class renders a secret text with hiding
     * it with the given character.
     * @param {String|zebkit.data.TextModel} [text] a text as string or text
     * model instance
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
             * Indicates if the last entered character doesn't have to be replaced
             * with echo character
             * @type {Boolean}
             * @attribute showLast
             * @default true
             * @readOnly
             */
            this.showLast = true;

            /**
             * Set the specified echo character. The echo character is used to
             * hide secret text.
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
});
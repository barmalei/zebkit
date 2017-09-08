zebkit.package("ui", function(pkg, Class) {
    /**
     * Text field UI component. The component is designed to enter single line, multi lines or password text.
     * The component implement text field functionality from the scratch. It supports the following features
     *
     *   - Text selection
     *   - Redu/Undo actions
     *   - Native WEB clipboard
     *   - Basic text navigation
     *   - Read-only mode
     *   - Left or right text alignment
     *
     * @constructor
     * @param {String|zebkit.data.TextModel|zebkit.draw.TextRender} [txt] a text the text field component
     * has to be filled. The parameter can be a simple string, text model or text render class instance.
     * @param {Integer} [maxCol] a maximal size of entered text. -1 means the size of the edited text
     * has no length limit.
     * @class zebkit.ui.TextField
     * @extends zebkit.ui.Label
     */
    pkg.TextField = Class(pkg.Label, [
        function (render, maxCol){
            this.$history = Array(100);

            this.scrollManager = new pkg.ScrollManager(this);

            var renderDefined = false;
            if (arguments.length === 0) {
                maxCol = -1;
                render = new zebkit.draw.TextRender(new zebkit.data.SingleLineTxt());
                renderDefined = true;
            } else if (arguments.length === 1){
                if (zebkit.isNumber(render)) {
                    maxCol = render;
                    render = new zebkit.draw.TextRender(new zebkit.data.SingleLineTxt());
                    renderDefined = true;
                } else {
                    maxCol = -1;
                }
            }

            if (renderDefined === false) {
                if (zebkit.isString(render)) {
                    render = new zebkit.draw.TextRender(new zebkit.data.SingleLineTxt(render));
                } else if (zebkit.instanceOf(render, zebkit.data.TextModel)) {
                    render = new zebkit.draw.TextRender(render);
                }
            }

            this.$super(render);
            if (maxCol > 0) {
                this.setPSByRowsCols(-1, maxCol);
            }
        },

        function $clazz() {
            this.Listeners = zebkit.ListenersClass("updated", "selected", "posChanged");

            /**
             * Text field hint text render
             * @constructor
             * @class zebkit.ui.TextField.HintRender
             * @extends zebkit.draw.StringRender
             */
            this.HintRender = Class(zebkit.draw.StringRender, []);
        },

        /**
         * @for zebkit.ui.TextField
         */
        function $prototype() {
            this.$historyPos  = -1;
            this.$lineHeight  = 0;
            this.$redoCounter = 0;
            this.$undoCounter = 0;
            this.$blinkTask   = null;

            /**
             * Cursor x loacation
             * @attribute cursorX
             * @type {Integer}
             * @readOnly
             */
            this.cursorX = 0;

            /**
             * Cursor y loacation
             * @attribute cursorY
             * @type {Integer}
             * @readOnly
             */
            this.cursorY = 0;

            /**
             * Cursor width
             * @attribute cursorWidth
             * @type {Integer}
             * @readOnly
             */
            this.cursorWidth = 0;

            /**
             * Cursor height
             * @attribute cursorHeight
             * @type {Integer}
             * @readOnly
             */
            this.cursorHeight = 0;

            /**
             * Selection view.
             * @attribute selectView
             * @type {zebkit.draw.View|String}
             * @readOnly
             */
            this.selectView = null;

            /**
             * Hint view
             * @attribute hint
             * @type {zebkit.draw.View}
             * @readOnly
             */
            this.hint = null;


            // TODO: check the place the property is required
            this.vkMode = "indirect";

            this.startLine = this.startCol = this.endLine = this.endCol = 0;
            this.startOff  = this.endOff = -1;

            /**
             * Cursor position manager
             * @attribute  position
             * @type {zebkit.util.Position}
             * @readOnly
             */
            this.position = null;

            /**
             * Specify the text field cursor blinking period in milliseconds.
             * -1 means no blinkable cursor
             * @type {Number}
             * @default -1
             * @readOnly
             * @attribute blinkigPeriod
             */
            this.blinkingPeriod = -1;
            this.$blinkMe        = true;
            this.$blinkMeCounter = 0;

            /**
             * Cursor type
             * @attribute cursorType
             * @type {String}
             * @default zebkit.ui.Cursor.TEXT;
             */
            this.cursorType = pkg.Cursor.TEXT;

            /**
             * Text alignment
             * @attribute textAlign
             * @type {String}
             * @default "left"
             * @readOnly
             */
            this.textAlign = "left";

            /**
             * Cursor view
             * @attribute cursorView
             * @type {zebkit.draw.View}
             * @readOnly
             */
            this.cursorView = null;

            /**
             * Indicate if the text field is editable
             * @attribute  isEditable
             * @type {Boolean}
             * @default true
             * @readOnly
             */
            this.canHaveFocus = this.isEditable = true;

            /**
             * Set the specified blinking period of the text field cursor
             * @param {Integer} [period] a text field cursor blinking period (in milliseconds),
             * use -1 to disable cursor blinking. If the argument is not passed the default (500ms)
             * blinking period will be applied.
             * @method setBlinking
             * @chainable
             */
            this.setBlinking = function(period) {
                if (arguments.length === 0) {
                    period = 500;
                }

                if (period !== this.blinkingPeriod) {
                    this.blinkingPeriod = period;
                    this.repaintCursor();
                }
                return this;
            };

            /**
             * Set the text algnment.
             * @method setTextAlignment
             * @param {String} a a text alignment. Use "left" or "right" as the parameter value
             * @chainable
             */
            this.setTextAlignment = function(a) {
                if (this.textAlign !== a) {
                    this.textAlign = a;
                    this.vrp();
                }
                return this;
            };

            this.textUpdated = function(e) {
                if (this.position !== null) {
                    if (this.endOff !== this.startOff) {
                        this.endOff = this.startOff = -1; // clear selection
                        this.fire("selected");
                    }

                    if (e.id === "insert") {
                        this.position.inserted(e.offset, e.size);
                    } else {
                        this.position.removed(e.offset, e.size);
                    }
                }

                if (e.isLastStep) {
                    this.fire("updated");
                }
            };

            /**
             * Compute a text column and row by the given location.
             * @param  {Integer} x  a x coordinate
             * @param  {Integer} y  a y coordinate
             * @return {Object} a text row and column as an object { row:, col }.
             * @method  getTextRowColAt
             */
            this.getTextRowColAt = function(x, y) {
                var lines = this.getLines();

                // normalize text location to virtual (zero, zero)
                y -= (this.scrollManager.getSY() + this.getTop());
                x -= this.scrollManager.getSX();
                if (this.textAlign === "left") {
                    x -= this.getLeft();
                } else {
                    x -= (this.width - this.view.getPreferredSize().width - this.getRight());
                }

                if (x >= 0 && y >= 0 && lines > 0) {
                    var lh = this.view.getLineHeight(),
                        li = this.view.lineIndent,
                        row = (y < 0) ? 0 : Math.floor((y + li) / (lh + li)) + ((y + li) % (lh + li) > li ? 1 : 0) -1;

                    if (row < lines && row >= 0) {
                        var s    = this.view.getLine(row),
                            pdt  = 1000000,
                            pcol = -1;

                        for(var col = Math.floor((x / this.view.calcLineWidth(row)) * s.length); col >= 0 && col <= s.length;) {
                            var l  = this.view.font.charsWidth(s, 0, col),
                                dt = Math.abs(l - x);

                            if (dt >= pdt) {
                                return { row : row, col : pcol };
                            }

                            pdt  = dt;
                            pcol = col;
                            col += (l > x ? -1: 1);
                        }

                        return { row : row, col : s.length };
                    }
                }
                return null;
            };

            /**
             * Find the next or previous word in the given text model starting from the given
             * line and column.
             * @param  {zebkit.data.TextModel | zebkit.draw.BaseTextRender} t a text model
             * @param  {Integer} line a starting line
             * @param  {Integer} col a starting column
             * @param  {Integer} d   a direction. 1 means looking for a next word and -1 means
             * search for a previous word.
             * @return {Object} a structure with the next or previous word location:
             *
             *        { row: {Integer}, col: {Integer} }
             *
             *
             * The method returns null if the next or previous word cannot be found.
             * @method  findNextWord
             * @protected
             */
            this.findNextWord = function(t, line, col, d){
                if (line < 0 || line >= t.getLines()) {
                    return null;
                }

                var ln = t.getLine(line);
                col += d;
                if (col < 0 && line > 0) {
                    return { row: line - 1, col : t.getLine(line - 1).length };
                } else if (col > ln.length && line < t.getLines() - 1) {
                    return { row : line + 1, col : 0 };
                }

                var b = false;
                for(; col >= 0 && col < ln.length; col += d){
                    if (b) {
                        if (d > 0) {
                            if (zebkit.util.isLetter(ln[col])) {
                                return { row:line, col:col };
                            }
                        } else {
                            if (!zebkit.util.isLetter(ln[col])) {
                                return { row : line, col: col + 1 };
                            }
                        }
                    } else  {
                        b = d > 0 ? !zebkit.util.isLetter(ln[col]) : zebkit.util.isLetter(ln[col]);
                    }
                }
                return (d > 0 ? { row: line, col : ln.length }: { row : line, col : 0 } );
            };

            // collect text model lines into string by the given start and end offsets
            // r     - text view
            // start - start offset
            // end   - end offset
            this.getSubString = function(r, start, end){
                var res = [],
                    sr = start.row,
                    er = end.row;

                for(var i = sr; i < er + 1; i++){
                    var ln = r.getLine(i);
                    if (i !== sr) {
                        res.push('\n');
                    } else {
                        ln = ln.substring(start.col);
                    }

                    if (i === er) {
                        ln = ln.substring(0, end.col - ((sr === er) ? start.col : 0));
                    }
                    res.push(ln);
                }
                return res.join('');
            };

            /**
             * Remove selected text
             * @method removeSelected
             * @chainable
             */
            this.removeSelected = function(){
                if (this.hasSelection()){
                    var start = this.startOff < this.endOff ? this.startOff : this.endOff;
                    this.remove(start, (this.startOff > this.endOff ? this.startOff : this.endOff) - start);
                    this.clearSelection();
                }
                return this;
            };

            /**
             * Start selection.
             * @protected
             * @method  startSelection
             * @chainable
             */
            this.startSelection = function() {
                if (this.startOff < 0 && this.position !== null){
                    var pos = this.position;
                    this.endLine = this.startLine = pos.currentLine;
                    this.endCol = this.startCol = pos.currentCol;
                    this.endOff = this.startOff = pos.offset;
                }
                return this;
            };

            this.keyTyped = function(e) {
                // Test if selection has been initiated (but nothing has been selected yet)
                // Typing a character changes position so if selection is active then
                // typed character will be unexpectedly selected.
                if (e.shiftKey && this.startOff >= 0 && this.endOff === this.startOff) {
                    this.clearSelection();
                }

                if (this.isEditable === true &&
                    e.ctrlKey === false &&
                    e.metaKey === false &&
                    e.key !== '\t')
                {
                    this.write(this.position.offset, e.key);
                }
            };

            /**
             * Select all text.
             * @method  selectAll
             * @chainable
             */
            this.selectAll = function() {
                this.select(0, this.getMaxOffset());
                return this;
            };

            /**
             * Shortcut event handler
             * @param  {java.ui.event.ShortcutEvent} e a shortcut event
             * @method shortcutFired
             */
            this.shortcutFired = function(e) {
                if (e.shortcut === "SELECTALL") {
                    this.selectAll();
                } else {
                    var d  = (e.shortcut === "PREVWORDSELECT" || e.shortcut === "PREVWORD") ? -1 : 1;

                    if (e.shortcut === "PREVWORDSELECT" ||
                        e.shortcut === "NEXTWORDSELECT" ||
                        e.shortcut === "NEXTPAGESELECT" ||
                        e.shortcut === "PREVPAGESELECT"   )
                    {
                        this.startSelection();
                    }

                    switch (e.shortcut) {
                        case "UNDO"          : this.undo(); break;
                        case "REDO"          : this.redo(); break;
                        case "NEXTPAGESELECT":
                        case "NEXTPAGE"      :  this.position.seekLineTo("down", this.pageSize()); break;
                        case "PREVPAGESELECT":
                        case "PREVPAGE"      :  this.position.seekLineTo("up", this.pageSize()); break;
                        case "NEXTWORDSELECT":
                        case "PREVWORDSELECT":
                        case "PREVWORD":
                        case "NEXTWORD" : {
                            var p = this.findNextWord(this.view, this.position.currentLine,
                                                                 this.position.currentCol, d);
                            if (p !== null) {
                                this.position.setRowCol(p.row, p.col);
                            }
                        } break;
                    }
                }
            };

            this.keyPressed = function(e) {
                if (this.isFiltered(e) === false)  {
                    var position = this.position;
                    if (e.shiftKey) {
                        this.startSelection();
                    }

                    switch(e.code) {
                        case "ArrowDown" : position.seekLineTo("down"); break;
                        case "ArrowUp"   : position.seekLineTo("up"); break;
                        case "ArrowLeft" :
                            if (e.ctrlKey === false && e.metaKey === false) {
                                position.seek(-1);
                            }
                            break;
                        case "ArrowRight":
                            if (e.ctrlKey === false && e.metaKey === false) {
                                position.seek(1);
                            }
                            break;
                        case "End":
                            if (e.ctrlKey) {
                                position.seekLineTo("down", this.getLines() - position.currentLine - 1);
                            } else {
                                position.seekLineTo("end");
                            }
                            break;
                        case "Home":
                            if (e.ctrlKey) {
                                position.seekLineTo("up", position.currentLine);
                            } else {
                                position.seekLineTo("begin");
                            }
                            break;
                        case "PageDown" :
                            position.seekLineTo("down", this.pageSize());
                            break;
                        case "PageUp" :
                            position.seekLineTo("up", this.pageSize());
                            break;
                        case "Delete":
                            if (this.hasSelection() && this.isEditable === true) {
                                this.removeSelected();
                            } else if (this.isEditable === true) {
                                this.remove(position.offset, 1);
                            } break;
                        case "Backspace":
                            if (this.isEditable === true) {
                                if (this.hasSelection()) {
                                    this.removeSelected();
                                } else if (this.isEditable === true && position.offset > 0) {
                                    position.seek(-1);
                                    this.remove(position.offset, 1);
                                }
                            } break;
                        default: return ;
                    }

                    if (e.shiftKey === false) {
                        this.clearSelection();
                    }
                }
            };

            /**
             * Test if the given key pressed event has to be processed
             * @protected
             * @param  {zebkit.ui.event.KeyEvent} e a key event
             * @return {Boolean} true if the given key pressed event doesn't
             * have be processed
             * @method isFiltered
             */
            this.isFiltered = function(e){
                var code = e.code;
                return code === "Shift" || code === "Control" ||
                       code === "Tab"   || code === "Alt"     ||
                       e.altKey;
            };

            /**
             * Remove the specified part of edited text
             * @param  {Integer} pos a start position of a removed text
             * @param  {Integer} size a size of removed text
             * @method remove
             */
            this.remove = function(pos, size){
                if (this.isEditable === true) {
                    if (pos >= 0 && (pos + size) <= this.getMaxOffset()) {
                        if (size < 10000) {
                            this.$historyPos = (this.$historyPos + 1) % this.$history.length;
                            this.$history[this.$historyPos] = [-1, pos, this.getValue().substring(pos, pos+size)];
                            if (this.$undoCounter < this.$history.length) {
                                this.$undoCounter++;
                            }
                        }

                        if (this.view.remove(pos, size)) {
                            this.repaint();
                            return true;
                        }
                    }
                }
                return false;
            };

            /**
             * Insert the specified text into the edited text at the given position
             * @param  {Integer} pos a start position of a removed text
             * @param  {String} s a text to be inserted
             * @return {Boolean} true if repaint has been requested
             * @method write
             */
            this.write = function (pos,s) {
                if (this.isEditable === true) {
                    // TODO: remove hard coded undo/redo deepness value
                    if (s.length < 10000) {
                        this.$historyPos = (this.$historyPos + 1) % this.$history.length;
                        this.$history[this.$historyPos] = [1, pos, s.length];
                        if (this.$undoCounter < this.$history.length) {
                            this.$undoCounter++;
                        }
                    }

                    // has selection then replace the selection with the given text nevertheless
                    // the requested pos
                    if (this.startOff !== this.endOff) {
                        var start = this.startOff < this.endOff ? this.startOff : this.endOff,
                            end   = this.startOff > this.endOff ? this.startOff : this.endOff;

                        if (this.view.replace(s, start, end - start)) {
                            this.repaint();
                            return true;
                        }
                    } else {
                        if (this.view.write(s, pos)) {
                            this.repaint();
                            return true;
                        }
                    }
                }
                return false;
            };

            this.recalc = function() {
                var r = this.view;
                if (this.position.offset >= 0) {
                    var l = r.getLine(this.position.currentLine);
                    if (this.textAlign === "left") {
                        this.curX = r.font.charsWidth(l, 0, this.position.currentCol) + this.getLeft();
                    } else {
                        this.curX = this.width - this.getRight() - this.view.getPreferredSize().width +
                                    r.font.charsWidth(l, 0, this.position.currentCol);
                    }

                    this.curY = this.position.currentLine * (r.getLineHeight() + r.lineIndent) +
                                this.getTop();
                }

                this.$lineHeight = r.getLineHeight() - 1;
            };

            this.catchScrolled = function(psx, psy) {
                this.repaint();
            };

            /**
             * Draw the text field cursor.
             * @protected
             * @param  {CanvasRenderingContext2D} g a 2D context
             * @method drawCursor
             */
            this.drawCursor = function (g) {
                if (this.position.offset >= 0 &&
                    this.cursorView !== null  &&
                    this.$blinkMe             &&
                    this.hasFocus()              )
                {
                    if (this.textAlign === "left") {
                        this.cursorView.paint(g, this.curX, this.curY,
                                              this.cursorWidth,
                                              (this.cursorHeight === 0 ? this.$lineHeight : this.cursorHeight),
                                              this);
                    } else {
                        this.cursorView.paint(g, this.curX - this.cursorWidth, this.curY,
                                              this.cursorWidth,
                                              (this.cursorHeight === 0 ? this.$lineHeight : this.cursorHeight),
                                              this);
                    }
                }
            };

            this.pointerDragStarted = function (e){
                if (e.isAction() && this.getMaxOffset() > 0) {
                    this.startSelection();
                }
            };

            this.pointerDragEnded =function (e){
                if (e.isAction() && this.hasSelection() === false) {
                    this.clearSelection();
                }
            };

            this.pointerDragged = function (e){
                if (e.isAction()){
                    var p = this.getTextRowColAt(e.x, e.y);
                    if (p !== null) {
                        this.position.setRowCol(p.row, p.col);
                    }
                }
            };

            /**
             * Select the specified part of the edited text
             * @param  {Integer} startOffset a start position of a selected text
             * @param  {Integer} endOffset  an end position of a selected text
             * @method select
             * @chainable
             */
            this.select = function (startOffset, endOffset){
                if (endOffset < startOffset ||
                    startOffset < 0 ||
                    endOffset > this.getMaxOffset())
                {
                    throw new Error("Invalid selection offsets");
                }

                if (this.startOff !== startOffset || endOffset !== this.endOff) {
                    if (startOffset === endOffset) {
                        this.clearSelection();
                    } else {
                        this.startOff = startOffset;
                        var p = this.position.getPointByOffset(startOffset);
                        this.startLine = p[0];
                        this.startCol  = p[1];
                        this.endOff    = endOffset;
                        p = this.position.getPointByOffset(endOffset);
                        this.endLine = p[0];
                        this.endCol  = p[1];

                        this.fire("selected");
                        this.repaint();
                    }
                }

                return this;
            };

            /**
             * Tests if the text field has a selected text
             * @return {Boolean} true if the text field has a selected text
             * @method hasSelection
             */
            this.hasSelection = function () {
                return this.startOff !== this.endOff;
            };

            this.posChanged = function (target, po, pl, pc){
                this.recalc();

                var position = this.position;
                if (position.offset >= 0) {

                    this.$blinkMeCounter = 0;
                    this.$blinkMe = true;

                    var lineHeight = this.view.getLineHeight(),
                        top        = this.getTop();

                    this.scrollManager.makeVisible(this.textAlign === "left" ? this.curX
                                                                             : this.curX - this.cursorWidth,
                                                    this.curY, this.cursorWidth, lineHeight);

                    if (pl >= 0) {
                        // means selected text exists, than we have to correct selection
                        // according to the new position
                        if (this.startOff >= 0) {
                            this.endLine = position.currentLine;
                            this.endCol  = position.currentCol;
                            this.endOff  = position.offset;

                            this.fire("selected");
                        }

                        var minUpdatedLine = pl < position.currentLine ? pl : position.currentLine,
                            li             = this.view.lineIndent,
                            bottom         = this.getBottom(),
                            left           = this.getLeft(),
                            y1             = lineHeight * minUpdatedLine + minUpdatedLine * li +
                                             top + this.scrollManager.getSY();

                        if (y1 < top) {
                            y1 = top;
                        }

                        if (y1 < this.height - bottom){
                            var h = ((pl > position.currentLine ? pl
                                                                : position.currentLine) - minUpdatedLine + 1) * (lineHeight + li);
                            if (y1 + h > this.height - bottom) {
                                h = this.height - bottom - y1;
                            }
                            this.repaint(left, y1, this.width - left - this.getRight(), h);
                        }
                    } else {
                        this.repaint();
                    }
                }

                this.fire("posChanged", this);
            };

            this.paintOnTop = function(g) {
                if (this.hint !== null && this.getMaxOffset() === 0) {
                    var ps = this.hint.getPreferredSize(),
                        yy = Math.floor((this.height - ps.height)/2),
                        xx = ("left" === this.textAlign) ? this.getLeft() + this.cursorWidth
                                                         : this.width - ps.width - this.getRight() - this.cursorWidth;

                    this.hint.paint(g, xx, yy, this.width, this.height, this);
                }
            };

            /**
             * Set the specified hint text to be drawn with the given font and color.
             * The hint is not-editable text that is shown in empty text field to help
             * a user to understand which input the text field expects.
             * @param {String|zebkit.draw.View|Function} hint a hint text, view or view render method
             * @method setHint
             * @chainable
             */
            this.setHint = function(hint) {
                if (this.hint !== hint) {
                    this.hint = zebkit.isString(hint) ? new this.clazz.HintRender(hint)
                                                      : zebkit.draw.$view(hint);
                    this.repaint();
                }
                return this;
            };

            /**
             * Performs undo operation
             * @method undo
             * @chainable
             */
            this.undo = function() {
                if (this.$undoCounter > 0) {
                    var h = this.$history[this.$historyPos];

                    this.$historyPos--;
                    if (h[0] === 1) {
                        this.remove(h[1], h[2]);
                    }
                    else {
                        this.write (h[1], h[2]);
                    }

                    this.$undoCounter -= 2;
                    this.$redoCounter++;

                    this.$historyPos--;
                    if (this.$historyPos < 0) {
                        this.$historyPos = this.$history.length - 1;
                    }

                    this.repaint();
                }
                return this;
            };

            /**
             * Performs redo operation
             * @method redo
             * @chainable
             */
            this.redo = function() {
                if (this.$redoCounter > 0) {
                    var h = this.$history[(this.$historyPos + 1) % this.$history.length];
                    if (h[0] === 1) {
                        this.remove(h[1], h[2]);
                    } else {
                        this.write (h[1], h[2]);
                    }
                    this.$redoCounter--;
                    this.repaint();
                }
                return this;
            };

            /**
             * Get a starting position (row and column) of a selected text
             * @return {Array} a position of a selected text. First element
             * of is a row and second column of selected text. null if
             * there is no any selected text
             * @method getStartSelection
             */
            this.getStartSelection = function(){
                return this.startOff !== this.endOff ? ((this.startOff < this.endOff) ? { row: this.startLine, col: this.startCol }
                                                                                      : { row: this.endLine, col: this.endCol } )
                                                     : null;
            };

            /**
             * Get an ending position (row and column) of a selected text
             * @return {Array} a position of a selected text. First element
             * of is a row and second column of selected text. null if
             * there is no any selected text
             * @method getEndSelection
             */
            this.getEndSelection = function(){
                return this.startOff !== this.endOff ? ((this.startOff < this.endOff) ? { row : this.endLine,   col : this.endCol   }
                                                                                      : { row : this.startLine, col : this.startCol })
                                                     : null;
            };

            /**
             * Get a selected text
             * @return {String} a selected text
             * @method getSelectedText
             */
            this.getSelectedText = function(){
                return this.startOff !== this.endOff ? this.getSubString(this.view,
                                                                         this.getStartSelection(),
                                                                         this.getEndSelection())
                                                     : null;
            };

            this.getLines = function() {
                return this.position === null ? -1 : this.position.metrics.getLines();
            };

            this.getMaxOffset = function() {
                return this.position === null ? -1 : this.position.metrics.getMaxOffset();
            };

            this.focusGained = function (e){
                if (this.position.offset < 0) {
                    this.position.setOffset(this.textAlign === "left" || this.getLines() > 1 ? 0
                                                                                             : this.getMaxOffset());
                } else if (this.hint !== null) {
                    this.repaint();
                } else {
                    this.repaintCursor();
                }

                if (this.isEditable === true && this.blinkingPeriod > 0) {
                    this.$blinkMeCounter = 0;
                    this.$blinkMe = true;

                    var $this = this;
                    this.$blinkTask = zebkit.util.tasksSet.run(function() {
                            $this.$blinkMeCounter = ($this.$blinkMeCounter + 1) % 3;
                            if ($this.$blinkMeCounter === 0) {
                                $this.$blinkMe = !$this.$blinkMe;
                                $this.repaintCursor();
                            }
                        },
                        Math.floor(this.blinkingPeriod / 3),
                        Math.floor(this.blinkingPeriod / 3)
                    );
                }
            };

            this.focusLost = function(e) {
                this.repaintCursor();
                if (this.isEditable === true) {
                    if (this.hint !== null) {
                        this.repaint();
                    }

                    if (this.blinkingPeriod > 0) {
                        if (this.$blinkTask !== null) {
                            this.$blinkTask.shutdown();
                            this.$blinkTask = null;
                        }
                        this.$blinkMe = true;
                    }
                }
            };

            /**
             * Force text field cursor repainting.
             * @method repaintCursor
             * @protected
             */
            this.repaintCursor = function() {
                if (this.curX > 0 && this.cursorWidth > 0 && (this.cursorHeight > 0 || this.$lineHeight > 0)) {
                    this.repaint(this.curX + this.scrollManager.getSX(),
                                 this.curY + this.scrollManager.getSY(),
                                 this.cursorWidth,
                                 (this.cursorHeight === 0 ? this.$lineHeight : this.cursorHeight));
                }
            };

            /**
             * Clear a text selection.
             * @method clearSelection
             * @chainable
             */
            this.clearSelection = function() {
                if (this.startOff >= 0){
                    var b = this.hasSelection();
                    this.endOff = this.startOff = -1;
                    this.startLine = this.startCol = -1;
                    this.endLine = this.endCol = -1;

                    if (b) {
                        this.repaint();
                        this.fire("selected");
                    }
                }
                return this;
            };

            this.pageSize = function (){
                var height = this.height - this.getTop() - this.getBottom(),
                    indent = this.view.lineIndent,
                    textHeight = this.view.getLineHeight();

                return Math.round((height + indent) / (textHeight + indent)) +
                       (((height + indent) % (textHeight + indent) > indent) ? 1 : 0);
            };

            this.clipPaste = function(txt){
                if (txt !== null) {
                    this.removeSelected();
                    this.write(this.position.offset, txt);
                }
            };

            this.clipCopy = function() {
                return this.getSelectedText();
            };

            /**
             * Cut selected text
             * @return {String} a text that has been selected and cut
             * @method  cut
             */
            this.cut = function() {
                var t = this.getSelectedText();
                if (this.isEditable === true) {
                    this.removeSelected();
                }
                return t;
            };

            /**
             * Set the specified cursor position controller
             * @param {zebkit.util.Position} p a position controller
             * @method setPosition
             * @chainable
             */
            this.setPosition = function (p){
                if (this.position !== p) {
                    if (this.position !== null) {
                        this.position.off(this);
                    }
                    this.position = p;
                    if (this.position !== null) {
                        this.position.on(this);
                    }
                    this.invalidate();
                }

                return this;
            };

            /**
             * Set the cursor view. The view defines rendering of the text field
             * cursor.
             * @param {zebkit.draw.View} v a cursor view
             * @method setCursorView
             * @chainable
             */
            this.setCursorView = function (v){
                if (v !== this.cursorView) {
                    this.cursorWidth = 1;
                    this.cursorView = zebkit.draw.$view(v);
                    if (this.cursorView !== null && this.cursorWidth === 0) {
                        this.cursorWidth = this.cursorView.getPreferredSize().width;
                    }
                    this.vrp();
                }

                return this;
            };

            /**
             * Set cursor width.
             * @param {Integer} w a cursor width
             * @method setCursorWidth
             * @chainable
             */
            this.setCursorWidth = function(w) {
                if (w !== this.cursorWidth) {
                    this.cursorWidth = w;
                    this.vrp();
                }
                return this;
            };

            /**
             * Set cursor size.
             * @param {Integer} w a cursor width
             * @param {Integer} h a cursor height
             * @method setCursorSize
             * @chainable
             */
            this.setCursorSize = function(w, h) {
                if (w !== this.cursorWidth || h !== this.cursorHeight) {
                    this.cursorWidth  = w;
                    this.cursorHeight = h;
                    this.vrp();
                }
                return this;
            };

            /**
             * Adjust the size of the text field component to be enough to place the given
             * number of rows and columns.
             * @param {Integer} r a row of the text the height of the text field has to be adjusted
             * @param {Integer} c a column of the text the width of the text field has to be adjusted
             * @method setPSByRowsCols
             * @chainable
             */
            this.setPSByRowsCols = function (r,c){
                var tr = this.view,
                    w  = (c > 0) ? (tr.font.stringWidth("W") * c)
                                 : this.psWidth,
                    h  = (r > 0) ? (r * tr.getLineHeight() + (r - 1) * tr.lineIndent)
                                 : this.psHeight;
                this.setPreferredSize(w, h);
                return this;
            };

            /**
             * Control the text field editable state
             * @param {Boolean} b true to make the text field editable
             * @method setEditable
             * @chainable
             */
            this.setEditable = function (b){
                if (b !== this.isEditable){
                    this.isEditable = b;
                    if (b && this.blinkingPeriod > 0 && this.hasFocus()) {
                        if (this.$blinkTask !== null) {
                            this.$blinkTask.shutdown();
                        }
                        this.$blinkMe = true;
                    }
                    this.vrp();
                }
                return this;
            };

            this.pointerDoubleClicked = function(e){
                if (e.isAction()) {
                    this.select(0, this.getMaxOffset());
                }
            };

            this.pointerPressed = function(e){
                if (e.isAction()) {
                    if (e.shiftKey) {
                        this.startSelection();
                    } else {
                        this.clearSelection();
                    }

                    var p = this.getTextRowColAt(e.x, e.y);
                    if (p !== null) {
                        this.position.setRowCol(p.row, p.col);
                    }
                }
            };

            /**
             * Set selection color or view
             * @param {String|zebkit.draw.View} c a selection color or view
             * @method setSelectView
             * @chainable
             */
            this.setSelectView = function(c) {
                if (c != this.selectView) {
                    this.selectView = zebkit.draw.$view(c);

                    if (this.hasSelection()) {
                        this.repaint();
                    }
                }
                return this;
            };

            this.calcPreferredSize = function (t) {
                var ps = this.view.getPreferredSize();
                ps.width += this.cursorWidth;
                return ps;
            };

            //!!! to maximize optimize performance the method duplicates part of ViewPan.paint() code
            this.paint = function(g){
                var sx = this.scrollManager.getSX(),
                    sy = this.scrollManager.getSY(),
                    l  = this.getLeft(),
                    t  = this.getTop(),
                    r  = this.getRight();

                try {
                    g.translate(sx, sy);

                    if (this.textAlign === "left") {
                        this.view.paint(g, l, t,
                                        this.width  - l - r,
                                        this.height - t - this.getBottom(), this);
                    } else {
                        this.view.paint(g, this.width - r - this.view.getPreferredSize().width, t,
                                           this.width  - l - r,
                                           this.height - t - this.getBottom(), this);
                    }

                    this.drawCursor(g);
                } catch(e) {
                    g.translate(-sx, -sy);
                    throw e;
                }
                g.translate(-sx, -sy);
            };
        },

        function setView(v){
            if (v != this.view) {
                if (this.view !== null && typeof this.view.off !== 'undefined') {
                    this.view.off(this);
                }

                this.$super(v);
                if (this.position === null) {
                    this.setPosition(new zebkit.util.Position(this.view));
                } else {
                    this.position.setMetric(this.view);
                }

                if (this.view !== null && typeof this.view.on !== 'undefined') {
                    this.view.on(this);
                }
            }
            return this;
        },

        /**
         * Set the text content of the text field component
         * @param {String} s a text the text field component has to be filled
         * @method setValue
         * @chainable
         */
        function setValue(s) {
            var txt = this.getValue();
            if (txt !== s){
                if (this.position !== null) {
                    this.position.setOffset(0);
                }
                this.scrollManager.scrollTo(0, 0);
                this.$super(s);
            }
            return this;
        },

        function setEnabled(b){
            this.clearSelection();
            this.$super(b);
            return this;
        }
    ]);

    /**
     * Text area UI component. The UI component to render multi-lines text.
     * @class zebkit.ui.TextArea
     * @constructor
     * @param {String} [txt] a text
     * @extends zebkit.ui.TextField
     */
    pkg.TextArea = Class(pkg.TextField, [
        function(txt) {
            if (arguments.length === 0) {
                txt = "";
            }
            this.$super(new zebkit.data.Text(txt));
        }
    ]);

    /**
     * Password text field.
     * @class zebkit.ui.PassTextField
     * @constructor
     * @param {String} txt password text
     * @param {Integer} [maxSize] maximal size
     * @param {Boolean} [showLast] indicates if last typed character should
     * not be disguised with a star character
     * @extends zebkit.ui.TextField
     */
    pkg.PassTextField = Class(pkg.TextField, [
        function(txt, size, showLast) {
            if (arguments.length === 1) {
                showLast = false;
                size     = -1;

                if (zebkit.isBoolean(txt)) {
                    showLast = txt;
                    txt      = "";
                } else if (zebkit.isNumber(txt)) {
                    size = txt;
                    txt = "";
                }
            } else if (arguments.length === 0) {
                showLast = false;
                size     = -1;
                txt      = "";
            } else if (arguments.length === 2) {
                showLast = false;
            }

            var pt = new zebkit.draw.PasswordText(new zebkit.data.SingleLineTxt(txt, size));
            pt.showLast = showLast;
            this.$super(pt);
            if (size > 0) {
                this.setPSByRowsCols(-1, size);
            }
        },

        function $prototype() {
            /**
             * Set flag that indicates if the last password character has to be visible.
             * @param {Boolean} b a boolean flag that says if last password character has
             * to be visible.
             * @method setShowLast
             * @chainable
             */
            this.setShowLast = function(b) {
                if (this.showLast !== b) {
                    this.view.showLast = b;
                    this.repaint();
                }
                return this;
            };
        }
    ]);
});
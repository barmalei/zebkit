(function(pkg, Class) {

var ME = pkg.MouseEvent, KE = pkg.KeyEvent, PO = zebra.util.Position;

pkg.TextField = Class(pkg.Label, pkg.KeyListener, pkg.MouseListener, pkg.MouseMotionListener,
                      pkg.FocusListener, pkg.Cursorable, pkg.ScrollListener, pkg.CopyCutPaste, [

    function $clazz() {
        this.TextPosition = Class(PO, [
            function (render){
                  this.$super(render);
                  render.target._.add(this);
            },

            function $prototype() {
                this.textUpdated = function(src,b,off,size,startLine,lines){
                      if(b === true) this.inserted(off, size);
                      else this.removed(off, size);
                };
            },

            function destroy() { this.metrics.target._.remove(this); }
        ]);
    },

    function $prototype() {
        this.selectionColor = this.curView = this.position = null;
        this.isEditable = true;

        this.getTextRowColAt = function(render,x,y){
            var size = render.target.getLines();
            if(size === 0) return null;

            var lh = render.font.height, li = render.getLineIndent(),
                ln = (y < 0) ? 0 : ~~((y + li) / (lh + li)) + ((y + li) % (lh + li) > li ? 1 : 0) -1;

            if(ln >= size) return [size - 1, render.getLine(size - 1).length];
            else if (ln < 0) return [0,0];

            if(x < 0) return [ln, 0];

            var x1 = 0, x2 = 0, s = render.getLine(ln);
            for(var c = 0; c < s.length; c++){
                x1 = x2;
                x2 = render.font.charsWidth(s, 0, c + 1);
                if(x >= x1 && x < x2) return [ln, c];
            }
            return [ln, s.length];
        };

        this.findNextWord = function(t,line,col,d){
            if(line < 0 || line >= t.getLines()) return null;
            var ln = t.getLine(line);
            col += d;
            if(col < 0 && line > 0) return [line - 1, t.getLine(line - 1).length];
            else
                if(col > ln.length && line < t.getLines() - 1) return [line + 1, 0];

            var b = false;
            for(; col >= 0 && col < ln.length; col += d){
                if(b){
                    if(d > 0){ if(zebra.util.isLetter(ln[col])) return [line, col]; }
                    else if (!zebra.util.isLetter(ln[col])) return [line, col + 1];
                }
                else  b = d > 0 ? !zebra.util.isLetter(ln[col]) : zebra.util.isLetter(ln[col]);
            }
            return (d > 0 ? [line, ln.length ]: [line, 0]);
        };

        this.getSubString = function(r,start,end){
            var res = [], sr = start[0], er = end[0], sc = start[1], ec = end[1];
            for(var i = sr; i < er + 1; i++){
                var ln = r.getLine(i);
                if (i != sr) res.push('\n');
                else ln = ln.substring(sc);
                if(i == er) ln = ln.substring(0, ec - ((sr == er) ? sc : 0));
                res.push(ln);
            }
            return res.join('');
        };

        this.removeSelected = function(){
            if(this.hasSelection()){
                var start = Math.min(this.startOff, this.endOff);
                this.remove(start, Math.max(this.startOff, this.endOff) - start);
                this.clearSelection();
            }
        };

        this.startSelection = function(){
            if(this.startOff < 0){
                var pos = this.position;
                this.endLine = this.startLine = pos.currentLine;
                this.endCol = this.startCol = pos.currentCol;
                this.endOff = this.startOff = pos.offset;
            }
        };

        this.keyTyped = function(e){
            if (!e.isControlPressed() && !e.isCmdPressed() && this.isEditable){
                if(e.ch == '\n' && zebra.instanceOf(this.view.target, zebra.data.SingleLineTxt)) { 
                    return;
                }
                this.removeSelected();
                this.write(this.position.offset, e.ch);
            }
        };

        this.keyPressed = function(e) {
            if (this.isFiltered(e)) return;

            var position = this.position, 
                col = position.currentCol, 
                isShiftDown = e.isShiftPressed(),
                line = position.currentLine, 
                lines = position.metrics.getLines();
            
            if (isShiftDown && e.ch == KE.CHAR_UNDEFINED) this.startSelection();

            switch(e.code)
            {
                case KE.VK_DOWN: position.seekLineTo(PO.DOWN);break;
                case KE.VK_UP: position.seekLineTo(PO.UP);break;
                case KE.VK_RIGHT:
                    if(e.isControlPressed()){
                        var p = this.findNextWord(this.view.target, line, col, 1);
                        if(p != null) position.setRowCol(p[0], p[1]);
                    }
                    else position.seek(1);
                    break;
                case KE.VK_LEFT:
                    if(e.isControlPressed()){
                        var p = this.findNextWord(this.view.target, line, col,  - 1);
                        if(p != null) position.setRowCol(p[0], p[1]);
                    }
                    else this.position.seek(-1);
                    break;
                case KE.VK_END:
                    if(e.isControlPressed()) position.seekLineTo(PO.DOWN, lines - line - 1);
                    else position.seekLineTo(PO.END);
                    break;
                case KE.VK_HOME:
                    if(e.isControlPressed()) position.seekLineTo(PO.UP, line);
                    else position.seekLineTo(PO.BEG);
                    break;
                case KE.VK_PAGE_DOWN: position.seekLineTo(PO.DOWN, this.pageSize());break;
                case KE.VK_PAGE_UP: position.seekLineTo(PO.UP, this.pageSize());break;
                case KE.VK_DELETE:
                    if(this.hasSelection() && this.isEditable) {
                        this.removeSelected();
                    }
                    else {
                        if (this.isEditable) this.remove(position.offset, 1);
                    } break;
                case KE.VK_BACK_SPACE:
                    if(this.isEditable) {
                        if(this.hasSelection()) this.removeSelected();
                        else {
                            if(this.isEditable && position.offset > 0){
                                position.seek(-1);
                                this.remove(position.offset, 1);
                            }
                        }
                    } break;
                case KE.VK_A:
                    if(e.isControlPressed() || e.isCmdPressed()) this.select(0, position.metrics.getMaxOffset());
                    return;
                default: return ;
            }
            if (!isShiftDown && this.isEditable) this.clearSelection();
        };

        this.isFiltered = function (e){
            var code = e.code;
            return code == KE.VK_SHIFT || code == KE.VK_CTRL || code == KE.VK_TAB || code == KE.VK_ALT || (e.mask & KE.ALT) > 0;
        };

        this.remove = function (pos,size){
            var position = this.position;
            if(pos >= 0 && (pos + size) <= position.metrics.getMaxOffset()){
                var pl = position.metrics.getLines(), old = position.offset;
                this.view.target.remove(pos, size);
                if (position.metrics.getLines() != pl || old == pos) this.repaint();
            }
        };

        this.write = function (pos,s){
            var old = this.position.offset, m = this.view.target,  pl = m.getLines();
            m.write(s, pos);
            if(m.getLines() != pl || this.position.offset == old) this.repaint();
        };

        this.recalc = function() { this.validateCursorMetrics(); };

        this.validateCursorMetrics = function() {
            var r = this.view, p = this.position;
            if(p.offset >= 0){
                var cl = p.currentLine;
                this.curX = r.font.charsWidth(r.getLine(cl), 0, p.currentCol) + this.getLeft();
                this.curY = cl * (r.font.height + r.getLineIndent()) + this.getTop();
            }
            this.curH = r.font.height - 1;
        };

        this.getCursorType = function(target,x,y){ return pkg.Cursor.TEXT; };

        this.getScrollManager = function (){ return this.sman;};
        this.scrolled = function (psx,psy){ this.repaint(); };
        this.canHaveFocus = function (){ return true;};

        this.drawCursor = function (g){
            if(this.isEditable && this.hasFocus() && this.position.offset >= 0){
                if (this.curView != null) this.curView.paint(g, this.curX, this.curY, this.curW, this.curH, this);
            }
        };

        this.startDragged = function (e){
            if((e.mask & ME.LEFT_BUTTON) > 0 && this.position.metrics.getMaxOffset() > 0) this.startSelection();
        };

        this.endDragged =function (e){
            if((e.mask & ME.LEFT_BUTTON) > 0 &&  !this.hasSelection()) this.clearSelection();
        };

        this.mouseDragged = function (e){
            if((e.mask & ME.LEFT_BUTTON) > 0){
                var p = this.getTextRowColAt(this.view, e.x - this.sman.getSX(), e.y - this.sman.getSY());
                if(p != null) this.position.setRowCol(p[0], p[1]);
            }
        };

        this.select = function (startOffset,endOffset){
            if(endOffset < startOffset || startOffset < 0 || endOffset > this.position.metrics.getMaxOffset()){
                throw new Error();
            }
            if(this.startOff != startOffset || endOffset != this.endOff){
                if(startOffset == endOffset) this.clearSelection();
                else {
                    this.startOff = startOffset;
                    var p = this.position.getPointByOffset(startOffset);
                    this.startLine = p[0];
                    this.startCol = p[1];
                    this.endOff = endOffset;
                    p = this.position.getPointByOffset(endOffset);
                    this.endLine = p[0];
                    this.endCol = p[1];
                    this.repaint();
                }
            }
        };

        this.hasSelection = function (){ return this.startOff != this.endOff; };
    },

    function () { this.$this(""); },

    function(s, maxCol){
        var b = zebra.isNumber(maxCol);
        this.$this(b ? new zebra.data.SingleLineTxt(s, maxCol) : (maxCol ? new zebra.data.Text(s) : s));
        if (b && maxCol > 0) this.setPSByRowsCols(-1, maxCol);
    },

    function (render){
        if (zebra.isString(render)) render = new pkg.TextRender(new zebra.data.SingleLineTxt(render));
        else {
            if (zebra.instanceOf(render, zebra.data.TextModel)) render = new pkg.TextRender(render);
        }
        this.startLine = this.startCol = this.endLine = this.endCol = this.curX = this.curY = this.curH = this.curH = 0;
        this.startOff = this.endOff = -1;
        this.$super(render);
        this.sman = new pkg.ScrollManager(this);
    },

    function setView(v){
        if(v != this.view){
            this.$super(v);
            this.setPosition(this.createPosition(this.view));
        }
    },

    function setPosition(p){
        if(this.position != p){
            if(this.position != null){
                this.position._.remove(this);
                if (this.position.destroy) this.position.destroy();
            }
            this.position = p;
            this.position._.add(this);
            this.invalidate();
        }
    },

    function setCursorView(v){
        // !!!
        // cursor size should be set by property
        this.curW = 1;
        if(v != this.curView){
            this.curView = v;
            //!!!this.curW = this.curView != null ? this.curView.getPreferredSize().width : 1;
            this.validateCursorMetrics();
            this.repaint();
        }
    },

    function setPSByRowsCols(r,c){
        var tr = this.view, w = (c > 0) ? (tr.font.stringWidth("W") * c) : this.psWidth,
            h = (r > 0) ? (r * tr.font.height + (r - 1) * tr.getLineIndent()) : this.psHeight;
        this.setPreferredSize(w, h);
    },

    function setEditable(b){
        if(b != this.isEditable){
            this.isEditable = b;
            this.vrp();
        }
    },

    function focusGained(e){
        if(this.position.offset < 0) this.position.setOffset(0);
        else {
            if (this.isEditable) {
                this.repaint(this.curX + this.sman.getSX(), this.curY + this.sman.getSY(),
                             this.curW, this.curH);
            }
        }
    },

    function focusLost(e){
        if(this.isEditable) {
            this.repaint(this.curX + this.sman.getSX(), this.curY + this.sman.getSY(),
                         this.curW, this.curH);
        }
    },

    function mouseClicked(e){
        if ((e.mask & ME.LEFT_BUTTON) > 0 && e.clicks > 1) this.select(0, this.position.metrics.getMaxOffset());
    },

    function mousePressed(e){
        if(e.isActionMask()){
            if ((e.mask & KE.SHIFT) > 0) this.startSelection();
            else this.clearSelection();
            var p = this.getTextRowColAt(this.view, e.x - this.sman.getSX() - this.getLeft(),
                                                    e.y - this.sman.getSY() - this.getTop());
            if(p != null) this.position.setRowCol(p[0], p[1]);
        }
    },

    function setText(s){
        var txt = this.getText();
        if(txt != s){
            this.position.setOffset(0);
            this.sman.scrollTo(0, 0);
            this.$super(s);
        }
    },

    function posChanged(target,po,pl,pc){
        this.validateCursorMetrics();
        var position = this.position;
        if(position.offset >= 0){
            var lineHeight = this.view.font.height, top = this.getTop();
            this.sman.makeVisible(this.curX, this.curY, this.curW, lineHeight);
            if(pl >= 0){
                if(this.startOff >= 0){
                    this.endLine = position.currentLine;
                    this.endCol = position.currentCol;
                    this.endOff = position.offset;
                }
                var minUpdatedLine = Math.min(pl, position.currentLine), maxUpdatedLine = Math.max(pl, position.currentLine),
                    li = this.view.getLineIndent(), bottom = this.getBottom(), left = this.getLeft(), right = this.getRight(),
                    y1 = lineHeight * minUpdatedLine + minUpdatedLine * li + top + this.sman.getSY();
                if(y1 < top) y1 = top;
                if(y1 < this.height - bottom){
                    var h = (maxUpdatedLine - minUpdatedLine + 1) * (lineHeight + li);
                    if( y1 + h > this.height - bottom) h = this.height - bottom - y1;
                    this.repaint(left, y1, this.width - left - right, h);
                }
            }
            else this.repaint();
        }
    },

    function paint(g){
        var sx = this.sman.getSX(), sy = this.sman.getSY();
        try{
            g.translate(sx, sy);
            this.$super(g);
            this.drawCursor(g);
        }
        finally{ g.translate( -sx,  -sy); }
    },

    function getPreferredSize(){
        var d = this.$super();
        if (this.psWidth < 0) d.width += this.curW;
        return d;
    },

    function getStartSelection(){
        return this.hasSelection() ? ((this.startOff < this.endOff) ? [this.startLine, this.startCol]
                                                                    : [this.endLine, this.endCol]) : null;
    },

    function getEndSelection(){
        return this.hasSelection() ? ((this.startOff < this.endOff) ? [this.endLine, this.endCol]
                                                                    : [this.startLine, this.startCol]) : null;
    },

    function getSelectionOffsets(){
        return this.hasSelection() ? ((this.startOff < this.endOff) ? [this.startOff, this.endOff]
                                                                    : [this.endOff, this.startOff]) : null;
    },

    function getSelectedText(){
        return this.hasSelection() ? this.getSubString(this.view, this.getStartSelection(), this.getEndSelection())
                                   : null;
    },

    function setSelectionColor(c){
        if (!c.equals(this.selectionColor)){
            this.selectionColor = c;
            if (this.hasSelection()) this.repaint();
        }
    },

    function setEnabled(b){
        this.clearSelection();
        this.$super(b);
    },

    function paste(txt){
        if(txt != null){
            this.removeSelected();
            this.write(this.position.offset, txt);
        }
    },

    function copy() {
        return this.getSelectedText();
    },

    function cut() {
        var t = this.getSelectedText();
        this.removeSelected();
        return t;
    },

    function pageSize(){
        var height = this.height - this.getTop() - this.getBottom(),
            render = this.view, indent = render.getLineIndent(), textHeight = render.font.height;
        return (((height + indent) / (textHeight + indent) + 0.5) | 0) + (((height + indent) % (textHeight + indent) > indent) ? 1 : 0);
    },

    function createPosition(r){ return new pkg.TextField.TextPosition(r); },

    function clearSelection(){
        if(this.startOff >= 0){
            var b = this.hasSelection();
            this.endOff = this.startOff =  -1;
            if (b) this.repaint();
        }
    }
]);

})(zebra("ui"), zebra.Class);
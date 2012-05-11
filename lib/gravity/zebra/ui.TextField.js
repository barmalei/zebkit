(function(pkg, Class) {

var ME = pkg.MouseEvent, KE = pkg.KeyEvent, PO = zebra.util.Position, P = zebra.util.Point, rgb = zebra.util.rgb;

pkg.TextPosition = Class(PO, zebra.data.TextModelListener, [
    function (render){
        this.$super(render);
        render.target._.add(this);
    },
    
    function textUpdated(src,id,off,size,startLine,lines){
        if(id == zebra.data.TextModelListener.REMOVED) this.removed(off, size);
        else this.inserted(off, size);
    },

    function destroy(){ this.metrics.target._.remove(this); }
]);    

pkg.TextField = Class(pkg.Label, pkg.KeyListener, pkg.MouseListener, 
                          pkg.MouseMotionListener, pkg.FocusListener, 
                          pkg.Cursorable, pkg.view.TxtSelectionInfo,
                          pkg.ScrollListener, pkg.PopupInfo, function($) {

    var Menu = Class(pkg.Menu, [
        function (){
            this.target = null;
            this.$super();
            this.setIndents(8, 8);
            this.addElement(pkg.get("tf.cmenu.cut"));
            this.addElement(pkg.get("tf.cmenu.copy"));
            this.addElement(pkg.get("tf.cmenu.paste"));
            this.addElement(pkg.get("tf.cmenu.del"));
            this.addLine();
            this.addElement(pkg.get("tf.cmenu.selall"));
            this.addSelectionListener(this);
        },

        function setTarget(tf){
            this.target = tf;
            if(this.target != null){
                var b = this.target.hasSelection(), bb = this.target.isEditable;
                this.get(0).setEnabled(b && bb);
                this.get(1).setEnabled(b);
                this.get(3).setEnabled(b && bb);
                if(this.target.getText() == null || this.target.getText().length == 0) get(5).setEnabled(false);
                else get(5).setEnabled(true);
                this.get(2).setEnabled(bb && CM() != null && !CM().isEmpty());
            }
        },

        function menuItemSelected(src,id,data){
            switch(this.selectedIndex) {
                case 0: {
                    this.target.copy();
                    var p = this.target.getSelectionOffsets();
                    this.target.remove(p.x, p.y - p.x);
                } break;
                case 1: this.target.copy(); break;
                case 2: this.target.paste(); break;
                case 3: {
                    var p = this.target.getSelectionOffsets();
                    this.target.remove(p.x, p.y - p.x);
                } break;
                default: this.target.select(0, target.position.metrics.getMaxOffset());
            }
        },

        function setParent(c){
            this.$super(this.setParent,c);
            if(c == null && this.target != null) this.target.requestFocus();
        }
    ]);
    this.Menu = Menu;

    $(function () { this.$this(""); });

    $(function(s, maxCol){
        this.$this(new zebra.data.SingleLineTxt(s, maxCol));
        if(maxCol > 0) this.setPSByRowsCols(-1, maxCol);
    });

    $(function (render){
        if (zebra.isString(render)) render = new pkg.view.TextRender(new zebra.data.SingleLineTxt(render));
        if (zebra.instanceOf(render, zebra.data.TextModel))  render = new pkg.view.TextRender(render);
        this.startLine = this.startCol = this.endLine = this.endCol = this.curX = this.curY = this.curH = this.curH = 0;
        this.selectionColor = this.curView = this.position = null;
        this.startOff = this.endOff = -1;
        this.isEditable = true;
        this.isPopupEnabled = false;
        this.$super(render);
        this.setCursorView(pkg.get("tf.curv"));
        this.setBorder(pkg.get("tf.br"));
        this.setBackground(pkg.get("tf.bg"));
        this.setSelectionColor(pkg.get("tf.sel"));
        
        // !!!! should be removed and replaced with view
        this.curColor = pkg.get("tf.cur.col");
        if (this.curColor == null) this.curColor = rgb.black;
        
        this.sman = new pkg.SimpleScrollManager(this);
        this.customize(pkg.Wizard.TFIELD);
    });

    $(function setView(v){
        if(v != this.getView()){
            this.$super(this.setView,v);
            this.setPosition(this.createPosition(this.getView()));
        }
    });

    $(function getScrollManager(){ return this.sman;});
    $(function scrolled(psx,psy){ this.repaint(); });
    $(function canHaveFocus(){ return true;});

    $(function setPosition(p){
        if(this.position != p){
            if(this.position != null){
                this.position._.remove(this);
                if (this.position.destroy) this.position.destroy();
            }
            this.position = p;
            this.position._.add(this);
            this.invalidate();
        }
    });

    $(function setPopupEnabled(b){ this.isPopupEnabled = b; });

    $(function getPopup(target,x,y){
        if(this.isPopupEnabled){
            var contextMenu = pkg.get("tf.cmenu");
            if(contextMenu != null){
                contextMenu.setTarget(this);
                return contextMenu;
            }
        }
        return null;
    });

    $(function setCursorView(v){
        this.curW = 1;
        if(v != this.curView){
            this.curView = v;
            this.curW = this.curView != null ? this.curView.getPreferredSize().width : 1;
            this.validateCursorMetrics();
            this.repaint();
        }
    });

    $(function setPSByRowsCols(r,c){
        var tr = this.getView(), w = (c > 0) ? (tr.font.stringWidth("W") * c) : this.psWidth;
        var h = (r > 0) ? (r * tr.font.height + (r - 1) * tr.getLineIndent()) : this.psHeight;
        this.setPSSize(w, h);
    });

    $(function setEditable(b){
        if(b != this.isEditable){
            this.isEditable = b;
            this.vrp();
        }
    });

    $(function keyPressed(e){ if(!this.isFiltered(e)) this.handleKey(e); });

    $(function keyTyped(e){
        if( !e.isControlPressed() && !e.isCmdPressed() && this.isEditable){
            if(e.ch == '\n' && zebra.instanceOf(this.getModel(), zebra.data.SingleLineTxt)) return;
            removeSelected(this);
            this.write(this.position.offset, e.ch);
        }
    });

    $(function focusGained(e){
        if(this.position.offset < 0) this.position.setOffset(0);
        else {
            if (this.isEditable) this.repaint(this.curX + this.sman.getSX(), this.curY + this.sman.getSY(), this.curW, this.curH);
        }
    });

    $(function focusLost(e){
        if(this.isEditable) this.repaint(this.curX + this.sman.getSX(), this.curY + this.sman.getSY(), this.curW, this.curH);
    });

    $(function mouseClicked(e){
        if ((e.mask & ME.LEFT_BUTTON) > 0 && e.clicks > 1) this.select(0, this.position.metrics.getMaxOffset());
    });

    $(function startDragged(e){
        if((e.mask & ME.LEFT_BUTTON) > 0 && this.position.metrics.getMaxOffset() > 0) startSelection(this);
    });

    $(function endDragged(e){
        if((e.mask & ME.LEFT_BUTTON) > 0 &&  !this.hasSelection()) this.clearSelection();
    });

    $(function mouseDragged(e){
        if((e.mask & ME.LEFT_BUTTON) > 0){
            var p = getTextRowColAt(this.getView(), e.x - this.sman.getSX(), e.y - this.sman.getSY());
            if(p != null) this.position.setRowCol(p.x, p.y);
        }
    });

    $(function mousePressed(e){
        if(e.isActionMask()){
            if ((e.mask & KE.SHIFT) > 0) startSelection(this);
            else this.clearSelection();
            var p = getTextRowColAt(this.getView(), e.x - this.sman.getSX() - this.getLeft(), 
                                                    e.y - this.sman.getSY() - this.getTop());
            if(p != null) this.position.setRowCol(p.x, p.y);
        }
    });

    $(function getCursorType(target,x,y){ return pkg.Cursor.TEXT; });

    $(function setText(s){
        var txt = this.getText();
        if(txt != s){
            this.position.setOffset(0);
            this.sman.scrollTo(0, 0);
            this.$super(this.setText,s);
        }
    });

    $(function posChanged(target,po,pl,pc){
        this.validateCursorMetrics();
        var position = this.position;
        if(position.offset >= 0){
            var lineHeight = this.getView().font.height, top = this.getTop();
            this.sman.makeVisible(this.curX, this.curY, this.curW, lineHeight);
            if(pl >= 0){
                if(this.startOff >= 0){
                    this.endLine = position.currentLine;
                    this.endCol = position.currentCol;
                    this.endOff = position.offset;
                }
                var minUpdatedLine = Math.min(pl, position.currentLine), maxUpdatedLine = Math.max(pl, position.currentLine);
                var li = this.getView().getLineIndent(), bottom = this.getBottom(), left = this.getLeft(), right = this.getRight();
                var y1 = lineHeight * minUpdatedLine + minUpdatedLine * li + top + this.sman.getSY();
                if(y1 < top) y1 = top;
                if(y1 < this.height - bottom){
                    var h = (maxUpdatedLine - minUpdatedLine + 1) * (lineHeight + li);
                    if( y1 + h > this.height - bottom) h = this.height - bottom - y1;
                    this.repaint(left, y1, this.width - left - right, h);
                }
            }
            else this.repaint();
        }
    });

    $(function paint(g){
        var sx = this.sman.getSX(), sy = this.sman.getSY();
        try{
            g.translate(sx, sy);
            this.$super(this.paint,g);
            this.drawCursor(g);
        }
        finally{ g.translate( -sx,  -sy); }
    });

    $(function getPreferredSize(){
        var d = this.$super(this.getPreferredSize);
        if(this.psWidth < 0) d.width += this.curW;
        return d;
    });

    $(function getStartSelection(){
        return this.hasSelection() ? ((this.startOff < this.endOff) ? new P(this.startLine, this.startCol) 
                                                                    : new P(this.endLine, this.endCol)) : null;
    });

    $(function getEndSelection(){
        return this.hasSelection() ? ((this.startOff < this.endOff) ? new P(this.endLine, this.endCol) 
                                                                    : new P(this.startLine, this.startCol)) : null;
    });

    $(function getSelectionOffsets(){
        return this.hasSelection() ? ((this.startOff < this.endOff) ? new P(this.startOff, this.endOff) 
                                                                    : new P(this.endOff, this.startOff)) : null;
    });

    $(function getSelectedText(){
        return this.hasSelection() ? getSubString(this.getView(), this.getStartSelection(), this.getEndSelection()) : null;
    });

    $(function hasSelection(){ return this.startOff != this.endOff; });

    $(function setSelectionColor(c){
        if(c && !c.equals(this.selectionColor)){
            this.selectionColor = c;
            if (this.hasSelection()) this.repaint();
        }
    });

    $(function setEnabled(b){
        this.clearSelection();
        this.$super(this.setEnabled,b);
    });

    $(function select(startOffset,endOffset){
        if(endOffset < startOffset || startOffset < 0 || endOffset > this.position.metrics.getMaxOffset()){
            throw new Error();
        }
        if(this.startOff != startOffset || endOffset != this.endOff){
            if(startOffset == endOffset) this.clearSelection();
            else {
                this.startOff = startOffset;
                var p = this.position.getPointByOffset(startOffset);
                this.startLine = p.x;
                this.startCol = p.y;
                this.endOff = endOffset;
                p = this.position.getPointByOffset(endOffset);
                this.endLine = p.x;
                this.endCol = p.y;
                this.repaint();
            }
        }
    });

    $(function drawCursor(g){
        if(this.isEditable && this.hasFocus() && this.position.offset >= 0){
            if(this.curView != null) this.curView.paint(g, this.curX, this.curY, this.curW, this.curH, this);
            else {
                g.setColor(this.curColor);
                g.fillRect(this.curX, this.curY, this.curW, this.curH);
            }
        }
    });

    $(function recalc() { this.validateCursorMetrics(); });

    $(function handleKey(e){
        var position = this.position, col = position.currentCol, isShiftDown = e.isShiftPressed();
        var line = position.currentLine, lines = position.metrics.getLines();
        if (isShiftDown && e.ch == KE.CHAR_UNDEFINED) startSelection(this);

        switch(e.code)
        {
            case KE.VK_DOWN: position.seekLineTo(PO.DOWN);break;
            case KE.VK_UP: position.seekLineTo(PO.UP);break;
            case KE.VK_RIGHT:{
                if(e.isControlPressed()){
                    var p = findNextWord(this.getModel(), line, col, 1);
                    if(p != null) position.setRowCol(p.x, p.y);
                }
                else position.seek(1);
            }break;
            case KE.VK_LEFT:{
                if(e.isControlPressed()){
                    var p = findNextWord(this.getModel(), line, col,  - 1);
                    if(p != null) position.setRowCol(p.x, p.y);
                }
                else this.position.seek(-1);
            }break;
            case KE.VK_END:{
                if(e.isControlPressed()) position.seekLineTo(PO.DOWN, lines - line - 1);
                else position.seekLineTo(PO.END);
            }break;
            case KE.VK_HOME:{
                if(e.isControlPressed()) position.seekLineTo(PO.UP, line);
                else position.seekLineTo(PO.BEG);
            }break;
            case KE.VK_PAGE_DOWN: position.seekLineTo(PO.DOWN, this.pageSize());break;
            case KE.VK_PAGE_UP: position.seekLineTo(PO.UP, this.pageSize());break;
            case KE.VK_DELETE:{
                if(this.hasSelection()){
                    if(isShiftDown){
                        var cm = CM();
                        if(cm != null) cm.put(this.getSelectedText());
                    }
                    if(this.isEditable) removeSelected(this);
                }
                else{
                    if(this.isEditable) this.remove(position.offset, 1);
                }
            }break;
            case KE.VK_BACK_SPACE:{
                if(this.isEditable){
                    if(this.hasSelection()) removeSelected(this);
                    else{
                        if(this.isEditable && position.offset > 0){
                            position.seek(-1);
                            this.remove(position.offset, 1);
                        }
                    }
                }
            }break;
            case KE.VK_V:{
                if(e.isControlPressed() || e.isCmdPressed()) this.paste();
                return;
            }
            case KE.VK_C:{
                if(e.isControlPressed() || e.isCmdPressed()) this.copy();
                return;
            }
            case KE.VK_INSERT:{
                if(this.isEditable){
                    if(this.hasSelection() && e.isControlPressed()){
                        this.copy();
                        return;
                    }
                    else if(isShiftDown) this.paste();
                }
            }break;
            case KE.VK_A:{
                if(e.isControlPressed() || e.isCmdPressed()) this.select(0, position.metrics.getMaxOffset());
                return;
            }
            default: return ;
        }
        if(!isShiftDown && this.isEditable) this.clearSelection();
    });

    $(function paste(){
        var cm = CM(), s = (cm == null ? null : cm.get());
        if(s != null){
            removeSelected(this);
            this.write(this.position.offset, s);
        }
    });

    $(function copy(){
        var cm = CM();
        if(cm != null) cm.put(this.getSelectedText());
    });

    $(function isFiltered(e){
        var code = e.code;
        return code == KE.VK_SHIFT || code == KE.VK_CONTROL || code == KE.VK_TAB || code == KE.VK_ALT || (e.mask & KE.ALT) > 0;
    });

    $(function remove(pos,size){
        var position = this.position;
        if(pos >= 0 && (pos + size) <= position.metrics.getMaxOffset()){
            var pl = position.metrics.getLines(), old = position.offset;
            this.getModel().remove(pos, size);
            if(position.metrics.getLines() != pl || old == pos) this.repaint();
        }
    });

    $(function write(pos,s){
        var old = this.position.offset, m = this.getModel(),  pl = m.getLines();
        m.write(s, pos);
        if(m.getLines() != pl || this.position.offset == old) this.repaint();
    });

    $(function pageSize(){
        var height = this.height - this.getTop() - this.getBottom();
        var render = this.getView(), indent = render.getLineIndent(), textHeight = render.font.height;
        return Math.round((height + indent) / (textHeight + indent)) + (((height + indent) % (textHeight + indent) > indent) ? 1 : 0);
    });

    $(function createPosition(r){ return new pkg.TextPosition(r); });

    $(function validateCursorMetrics(){
        var r = this.getView(), p = this.position;
        if(p.offset >= 0){
            var cl = p.currentLine;
            this.curX = r.font.charsWidth(r.getLine(cl), 0, p.currentCol) + this.getLeft();
            this.curY = cl * (r.font.height + r.getLineIndent()) + this.getTop();
        }
        this.curH = r.font.height - 1;
    });

    $(function clearSelection(){
        if(this.startOff >= 0){
            var b = this.hasSelection();
            this.endOff = this.startOff =  -1;
            if (b) this.repaint();
        }
    });

    function getTextRowColAt(render,x,y){
        var size = render.target.getLines();
        if(size == 0) return null;
        var lh = render.font.height, li = render.getLineIndent();
        var ln = (y < 0) ? 0 : Math.floor((y + li) / (lh + li)) + ((y + li) % (lh + li) > li ? 1 : 0) -1;
        if(ln >= size) return new P(size - 1, render.getLine(size - 1).length);
        else if (ln < 0) return new P(0,0);
        if(x < 0) return new P(ln, 0);
        var x1 = 0, x2 = 0, s = render.getLine(ln);
        for(var c = 0; c < s.length; c++){
            x1 = x2;
            x2 = render.font.charsWidth(s, 0, c + 1);
            if(x >= x1 && x < x2) return new P(ln, c);
        }
        return new P(ln, s.length);
    }

    function findNextWord(t,line,col,d){
        if(line < 0 || line >= t.getLines()) return null;
        var ln = t.getLine(line);
        col += d;
        if(col < 0 && line > 0) return new P(line - 1, t.getLine(line - 1).length);
        else
            if(col > ln.length && line < t.getLines() - 1) return new P(line + 1, 0);

        var b = false;
        for(; col >= 0 && col < ln.length; col += d){
            if(b){
                if(d > 0){ if(zebra.util.isLetter(ln[col])) return new P(line, col); }
                else if (!zebra.util.isLetter(ln[col])) return new P(line, col + 1);
            }
            else  b = d > 0 ? !zebra.util.isLetter(ln[col]) : zebra.util.isLetter(ln[col]);
        }
        return (d > 0 ? new P(line, ln.length) : new P(line, 0));
    }

    function getSubString(r,start,end){
        var res = [];
        for(var i = start.x;i < end.x + 1; i++){
            var ln = r.getLine(i);
            if (i != start.x) res.push('\n');
            else ln = ln.substring(start.y);
            if(i == end.x) ln = ln.substring(0, end.y - ((start.x == end.x) ? start.y : 0));
            res.push(ln);
        }
        return res.join('');
    }

    function CM() { return pkg.clipboard; }

    function removeSelected(t){
        if(t.hasSelection()){
            var start = Math.min(t.startOff, t.endOff);
            t.remove(start, Math.max(t.startOff, t.endOff) - start);
            t.clearSelection();
        }
    }

    function startSelection(t){
        if(t.startOff < 0){
            var pos = t.position;
            t.endLine = t.startLine = pos.currentLine;
            t.endCol = t.startCol = pos.currentCol;
            t.endOff = t.startOff = pos.offset;
        }
    }
});

zebra.setupNames(pkg);

})(zebra("ui"), zebra.Class);
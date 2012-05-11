(function(pkg, Class, ui) {
        
var ScrollListener = ui.ScrollListener, TextRender = ui.view.TextRender, View = ui.view.View;
var FocusListener = ui.FocusListener, Matrix = zebra.data.Matrix, L = zebra.layout, MouseEvent = ui.MouseEvent;
var ExternalEditor = ui.ExternalEditor, WinLayer = ui.WinLayer, MB = zebra.util, Cursor = ui.Cursor;
var Position = zebra.util.Position, Rectangle = zebra.util.Rectangle, Point = zebra.util.Point;
var KE = ui.KeyEvent, rgb = zebra.util.rgb, Dimension = zebra.util.Dimension;

function arr(l, v) {
    var a = Array(l);
    for(var i=0; i<l; i++) a[i] = v;
    return a;
}

pkg.GridMetrics = new zebra.Interface();

pkg.START_EDITING  = 1;
pkg.FINISH_EDITING = 2;
pkg.CANCEL_EDITING = 3;

function CellsVisibility() { 
    this.hasVisibleCells = function(){
        return (this.fr != null && this.fc != null && this.lr != null && this.lc != null);
    }
    // first visible row (row and y), first visible col, last visible col and row
    this.fr = this.fc = this.lr = this.lc = null; 
}

pkg.DefViews = Class([
    function (){
        this.defView = new TextRender(new zebra.data.SingleLineTxt(""));
        this.defBgColor = ui.get("grid.cell.bg");
    },
    
    function getXAlignment(row,col){ return L.CENTER; },
    function getYAlignment(row,col){ return L.CENTER; },
    function getCellColor(row,col){ return this.defBgColor;},

    function getView(row,col,obj){
        if(obj != null){
            if (zebra.instanceOf(obj, View)) return obj;
            this.defView.target.setText(obj.toString());
            return this.defView;
        }
        return null;
    },
]);

pkg.DefEditors = Class([
    function getEditor(t, row, col, o){
        var tf = new ui.TextField((o == null ? "" : o.toString()), 150);
        tf.setBorder(null);
        tf.padding(t.cellInsetsTop + t.lineSize, t.cellInsetsLeft, t.cellInsetsBottom + t.lineSize, t.cellInsetsRight);
        return tf;
    },

    function fetchEditedValue(row,col,data,editor){ return editor.getModel().getText(); },

    function shouldDo(a,row,col,e){
        //!!! if (action == pkg.START_EDITING) return e.ID == MouseEvent.CLICKED && e.clicks == 1;
        // !!!else return (action == pkg.CANCEL_EDITING) ? e.ID == KE.PRESSED && KE.CANCEL_KEY == e.getKeyType(): false;
        var b = (a == pkg.START_EDITING && e.ID == MouseEvent.CLICKED && e.clicks == 1) ||
                (a == pkg.CANCEL_EDITING && e.ID == KE.PRESSED && KE.CANCEL_KEY == e.getKeyType()) ||
                (a == pkg.FINISH_EDITING && e.ID == KE.PRESSED && KE.VK_ENTER == e.code);
        return b;
    },

    function editingCanceled(row,col,data,editor) {}
]);

pkg.GridCaption = Class(ui.Panel, ui.MouseMotionListener, ui.MouseListener, ui.Cursorable, function($) {
        var GridCaption = this, DEF_ROWHEIGHT = 20, DEF_COLWIDTH = 20;
        
        this.INPUT_EVENT = 1;
        this.RESIZE_EVENT = 2;
        
        $(function (){ this.$this(null, L.HORIZONTAL); });
        $(function (m){ this.$this(m, L.HORIZONTAL); });

        $(function (m,o){
            this.$super();
            this._ = new zebra.util.Listeners();
            
            this.pxy = this.borderView = this.titles = this.borderView = this.metrics = this.render = null;
            this.isAutoFit = this.isResizable = true;
            this.psW = this.psH = this.orient = this.selectedXY = 0;
            this.selectedColRow = -1;
            this.minSize = 10;
            this.activeAreaWidth = 4;
            
            this.setup(m, o);
            this.render = new TextRender("");
            this.render.setFont(ui.get("gcap.fn"));
            this.render.setForeground(ui.get("gcap.fgcol"));
            this.setBorderView(ui.get("gcap.brv"));
            this.setBackground(ui.get("gcap.bg"));
            
            this.getCursorType = function (target,x,y){
                return this.metrics != null && this.selectedColRow >= 0 && this.isResizable &&  !this.metrics.isUsePsMetric ? ((this.orient == L.HORIZONTAL) ? Cursor.W_RESIZE : Cursor.S_RESIZE) : -1;
            }
    
            this.mouseDragged = function(e){
                if(this.pxy != null){
                    var b  = (this.orient == L.HORIZONTAL), m = this.metrics, rc = this.selectedColRow;
                    var ns = (b ? m.getColWidth(rc) + e.x : m.getRowHeight(rc) + e.y) - this.pxy;

                    if (ns > this.minSize) {
                        if (b) m.setColWidth (rc, ns);
                        else   m.setRowHeight(rc, ns);
                        this.pxy = b ? e.x : e.y;
                    }
                }
            }

            this.mouseMoved = function(e){ if (this.metrics != null) calcRowColAt(this, e.x, e.y); }
            this.customize(ui.Wizard.GRIDCAP);
        });

        $(function setup(m,o){
            if(this.metrics != m || o != this.orient){
                if(o != L.HORIZONTAL && o != L.VERTICAL) throw new Error();
                this.metrics = m;
                this.orient = o;
                this.vrp();
            }
        });

        $(function setBorderView(v){
            if(v != this.borderView){
                this.borderView = v;
                this.vrp();
            }
        });

        $(function getTitle(rowcol){
            return this.titles == null || this.titles.length / 2 <= rowcol ? null : this.titles[rowcol*2];
        });

        $(function putTitle(rowcol,title){
            var old = this.getTitle(rowcol);
            if(old != title || (title != null &&  ! title.equals(old))){
                if(this.titles == null) this.titles = arr((rowcol + 1) * 2, null);
                else{
                    if(Math.floor(this.titles.length / 2) <= rowcol){
                        var nt = arr((rowcol + 1) * 2, null);
                        zebra.util.arraycopy(this.titles, 0, nt, 0, this.titles.length);
                        this.titles = nt;
                    }
                }
                var index = rowcol * 2;
                this.titles[index] = title;
                if(title == null && index + 2 == this.titles.length){
                    var nt = arr(this.titles.length - 2, null);
                    zebra.util.arraycopy(this.titles, 0, nt, 0, index);
                    this.titles = nt;
                }
                this.vrp();
            }
        });

        $(function setTitleProps(rowcol,ax,ay,bg){
            var p = getTitleProps(this.titles, rowcol);
            if(p == null) p = [];
            p[0] = ax;
            p[1] = ay;
            p[2] = bg == null ? 0 : bg.getRGB();
            this.titles[rowcol*2 + 1] = p;
            this.repaint();
        });

        $(function startDragged(e){
            if(this.metrics != null && this.isResizable && !this.metrics.isUsePsMetric){
                calcRowColAt(this, e.x, e.y);
                if(this.selectedColRow >= 0) this.pxy = (this.orient == L.HORIZONTAL) ? e.x : e.y;
            }
        });

        $(function endDragged(e){
            if (this.pxy != null) { 
                this.pxy = null;
                //!!!! this._.fire(this, GridCaption.RESIZE_EVENT, this.selectedColRow);
            }
            if (this.metrics != null) calcRowColAt(this, e.x, e.y);
        });

        $(function mousePressed(e){ this._.fire(this, GridCaption.INPUT_EVENT, e); });

        $(function mouseClicked(e){
            if (this.pxy == null && this.metrics != null){
                if (this.selectedColRow < 0) this._.fire(this, GridCaption.INPUT_EVENT, e);

                if(e.clicks > 1 && this.selectedColRow >= 0 && this.isAutoFit){
                    var b = (this.orient == L.HORIZONTAL), add = 0, m = this.metrics, bv = this.borderView;
                    var size = b ? m.getColPSWidth(this.selectedColRow) : m.getRowPSHeight(this.selectedColRow);
                    if(bv != null) add = (b ? (bv.getLeft() + bv.getRight()) : (bv.getTop() + bv.getBottom()));
                    var v = this.getTitleView(this.selectedColRow);
                    if (v != null) size = Math.max(size, add + (b ? v.getPreferredSize().width : v.getPreferredSize().height));
                    if (b) m.setColWidth(this.selectedColRow, size);
                    else  m.setRowHeight(this.selectedColRow, size);
                }
            }
        });

        $(function paint(g){
            if(this.metrics != null){
                var m = this.metrics, cv = m.getCellsVisibility();
                if(cv.hasVisibleCells() == false) return;
                var isHor = (this.orient == L.HORIZONTAL), gap = m.lineSize, top = 0, left = 0, bottom = 0, right = 0;
                if(this.borderView != null){
                    top = this.borderView.getTop();
                    left = this.borderView.getLeft();
                    bottom = this.borderView.getBottom();
                    right = this.borderView.getRight();
                }
                
                var x = isHor ? cv.fc.y - this.x + m.getXOrigin() - gap : this.getLeft();
                var y = isHor ? this.getTop() : cv.fr.y - this.y + m.getYOrigin() - gap;
                var size = isHor ? m.getGridCols() : m.getGridRows();
                var ts = g.getTopStack(), cx = ts.x, cy = ts.y, cw = ts.width, ch = ts.height;
                for(var i = (isHor ? cv.fc.x : cv.fr.x);i <= (isHor ? cv.lc.x : cv.lr.x); i ++ ){
                    var wh1 = isHor ? m.getColWidth(i) + gap + (((size - 1) == i) ? gap : 0) : this.psW;
                    var wh2 = isHor ? this.psH : m.getRowHeight(i) + gap + (((size - 1) == i) ? gap : 0);
                    var v = this.getTitleView(i);
                    if(v != null){
                        var props = getTitleProps(this.titles, i);
                        if(props != null && props[2] != 0){
                            g.setColor(new rgb(props[2]));
                            g.fillRect(x, y, wh1 - 1, wh2 - 1);
                        }
                        var ps = v.getPreferredSize();
                    
                    
                        g.save();
                        g.clipRect(x, y, wh1, wh2);
                    
                    
                        var vx = x + L.getXLoc(ps.width, props != null ? props[0] : L.CENTER, wh1 - left - right) + left;
                        var vy = y + L.getYLoc(ps.height, props != null ? props[1] : L.CENTER, wh2 - top - bottom) + top;
                        v.paint(g, vx, vy, ps.width, ps.height, this);


                        g.restore();
                    }
                    if(this.borderView != null) this.borderView.paint(g, x, y, wh1, wh2, this);
                    if(isHor) x += wh1;
                    else y += wh2;
                }
            }
        });

        $(function getCaptionAt(x,y){
            if(this.metrics != null && x >= 0 && y >= 0 && x < this.width && y < this.height){
                var m = this.metrics, cv = m.getCellsVisibility(), isHor = (this.orient == L.HORIZONTAL);
                if((isHor && cv.fc != null) || ( ! isHor && cv.fr != null)){
                    var gap = m.lineSize, xy = isHor ? x : y;
                    var xxyy = isHor ? cv.fc.y - this.x - gap + m.getXOrigin() : cv.fr.y - this.y - gap + m.getYOrigin();
                    for(var i = (isHor ? cv.fc.x : cv.fr.x);i <= (isHor ? cv.lc.x : cv.lr.x); i ++ ){
                        var wh = isHor ? m.getColWidth(i) : m.getRowHeight(i);
                        if(xy > xxyy && xy < xxyy + wh) return i;
                        xxyy += wh + gap;
                    }
                }
            }
            return -1;
        });

        $(function getTitleView(i){
            var data = this.getTitle(i);
            if(data != null){
                if (zebra.instanceOf(data, View)) return data;
                this.render.target.setText(data.toString());
                return this.render;
            }
            return null;
        });

        $(function recalc(){
            this.psW = this.psH = 0;
            if(this.metrics != null){
                var m = this.metrics, isHor = (this.orient == L.HORIZONTAL), size = isHor ? m.getGridCols() : m.getGridRows();
                for(var i = 0;i < size; i++){
                    var v = this.getTitleView(i);
                    if(v != null){
                        var ps = v.getPreferredSize();
                        if(isHor){
                            if(ps.height > this.psH) this.psH = ps.height;
                            this.psW += ps.width;
                        }
                        else{
                            if(ps.width > this.psW) this.psW = ps.width;
                            this.psH += ps.height;
                        }
                    }
                }
                if(this.psH == 0) this.psH = DEF_ROWHEIGHT;
                if(this.psW == 0) this.psW = DEF_COLWIDTH;
                if(this.borderView != null){
                    this.psW += (this.borderView.getLeft() + this.borderView.getRight()) * (isHor ? size : 1);
                    this.psH += (this.borderView.getTop() + this.borderView.getBottom()) * (isHor ? 1 : size);
                }
            }
        });

        $(function calcPreferredSize(l) { return new Dimension(this.psW, this.psH); });

        function calcRowColAt(t, x,y){
            var isHor = (t.orient == L.HORIZONTAL), cv = t.metrics.getCellsVisibility();
            if((isHor && cv.fc != null) || (!isHor && cv.fr != null)){
                var m = t.metrics, g = m.lineSize, xy = isHor ? x : y;
                var xxyy = isHor ? cv.fc.y - t.x + m.getXOrigin() - g : cv.fr.y - t.y + m.getYOrigin() - g;
                for(var i = (isHor ? cv.fc.x : cv.fr.x);i <= (isHor ? cv.lc.x : cv.lr.x); i ++ ){
                    var wh = isHor ? m.getColWidth(i) : m.getRowHeight(i);
                    xxyy += (wh + g);
                    if(xy < xxyy + t.activeAreaWidth && xy > xxyy - t.activeAreaWidth){
                        t.selectedColRow = i;
                        t.selectedXY = xy - wh;
                        return ;
                    }
                }
            }
            t.selectedColRow = -1;
        }

        function getTitleProps(titles, i){ return titles != null && i < titles.length / 2 ? titles[i*2 + 1] : null; }
});

pkg.Grid = Class(ui.Panel, zebra.data.MatrixModelListener, ui.MouseListener, ui.KeyListener, Position.PositionMetric,
                     pkg.GridMetrics, ui.ChildrenListener, ui.WinListener,ScrollListener,FocusListener, function($) {
        var Grid = this, DEF_COLWIDTH = 80, DEF_ROWHEIGHT = 20;
        
        this.TOP_CAPTION_EL = 1;
        this.EDITOR_EL = 2;
        this.LEFT_CAPTION_EL = 3;
        this.STUB_EL = 4;
        this.ACTIVE_SEL_VIEW = 0;
        this.INACTIVE_SEL_VIEW = 1;
        this.MARKER_VIEW = 2;
                
        $(function (){ this.$this(new Matrix(5, 5)); });

        $(function (data){
            this.psWidth_ = this.psHeight_ = this.colOffset = this.rowOffset = this.pressedCol = this.selectedIndex = 0;
            this.lineSize = this.cellInsetsTop = this.cellInsetsBottom = 1;
            this.cellInsetsLeft = this.cellInsetsRight = 2;
            this.visibleArea = this.selected = null;
            this.evStartRow = this.evLen = 0;
            
            this._ = new zebra.util.Listeners();
            this.views = [ null, null, null]
            this.drawVerLines = this.drawHorLines = true;
            this.editingRow = this.editingCol = this.pressedRow = -1;
            this.editors = this.leftCaption = this.topCaption = this.colWidths = this.rowHeights = null;
            this.model = this.provider = this.sman = this.position = this.editors = this.stub = null;
            this.visibility = new CellsVisibility();
            this.evState = this.isUsePsMetric = false;

            this.$super();
            this.setView(Grid.ACTIVE_SEL_VIEW, ui.get("grid.asv"));
            this.setView(Grid.INACTIVE_SEL_VIEW, ui.get("grid.isv"));
            this.setView(Grid.MARKER_VIEW, ui.get("grid.mv"));
            this.lineColor = rgb.gray;
            this.setModel(data);
            this.setViewProvider(new pkg.DefViews());
            this.setPosition(new Position(this));
            this.sman = new ui.SimpleScrollManager(this);
            this.setBackground(ui.get("grid.bg"));
            this.customize(ui.Wizard.GRID);
        });

        $(function focusGained(e){ this.repaint(); });
        $(function focusLost(e){ this.repaint(); });
        $(function getScrollManager(){ return this.sman; });

        $(function enableMultiSelect(b){
            if(b != this.isMultiSelectEnabled()){
                this.selected = b ? arr(this.getGridRows(), false) : null;
                this.repaint();
            }
        });

        $(function isMultiSelectEnabled(){ return this.selected != null; });

        $(function clearSelect(){
            if(this.isMultiSelectEnabled()){
                for(var i = 0;i < this.selected.length; i++) this.selected[i] = 0;
                this._.fire(this, -1, 0, false);
                this.repaint();
            }
            else
                if(this.selectedIndex >= 0){
                    var prev = this.selectedIndex;
                    this.selectedIndex =  - 1;
                    this._.fire(this, -1, 0, false);
                    this.repaintRows(-1, prev);
                }
        });

        $(function select(row,b){
            if(this.isSelected(row) != b){
                if(this.isMultiSelectEnabled()){
                    this.selected[row] = b ? 1 : 0;
                    this._.fire(this, row, 1, b);
                    this.repaintRows(row, row);
                }
                else{
                    if(this.selectedIndex >= 0) this.clearSelect();
                    if (b) {
                        this.selectedIndex = row;
                        this._.fire(this, row, 1, b);
                    }
                }
            }
        });

        $(function isSelected(row){ return (this.selected == null) ? row == this.selectedIndex : this.selected[row] > 0; });
        $(function canHaveFocus(){ return this.editor == null; });

        $(function setEditorProvider(p){
            if(p != this.editors){
                this.stopEditing(true);
                this.editors = p;
            }
        });

        $(function drawLines(hor, ver){
            if (this.drawVerLines != hor || this.drawHorLines != ver) {
                this.drawHorLines = hor;
                this.drawVerLines = ver;
                this.repaint();
            }
        });

        $(function usePsMetric(b){
            if(this.isUsePsMetric != b){
                this.isUsePsMetric = b;
                this.vrp();
            }
        });

        $(function setPosition(p){
            if(this.position != p){
                if(this.position != null)this.position._.remove(this);
                this.position = p;
                if(this.position != null){
                    this.position._.add(this);
                    this.position.setPositionMetric(this);
                }
                this.repaint();
            }
        });

        $(function setViewProvider(p){
            if(this.provider != p){
                this.provider = p;
                this.vrp();
            }
        });

        $(function setModel(d){
            if(d != this.model){
                this.clearSelect();
                if(this.model != null) this.model.removeMatrixModelListener(this);
                this.model = d;
                if(this.model != null) this.model.addMatrixModelListener(this);
                if(this.position != null) this.position.clearPos();
                if(this.model != null && this.selected != null) this.selected = arr(this.model.rows, false);
                this.vrp();
            }
        });

        $(function setView(type,c){
            this.views[type] = c;
            this.repaint();
        });

        $(function getView(type){ return this.views[type]; });

        $(function setCellInsets(t,l,b,r){
            var nt = (t < 0) ? this.cellInsetsTop : t, nl = (l < 0) ? this.cellInsetsLeft : l;
            var nb = (b < 0) ? this.cellInsetsBottom : b, nr = (r < 0) ? this.cellInsetsRight : r;
            if(nt != this.cellInsetsTop || nl != this.cellInsetsLeft || nb != this.cellInsetsBottom || nr != this.cellInsetsRight){
                this.cellInsetsTop = nt;
                this.cellInsetsLeft = nl;
                this.cellInsetsBottom = nb;
                this.cellInsetsRight = nr;
                this.vrp();
            }
        });

        $(function matrixResized(target,prevRows,prevCols){
            this.clearSelect();
            if(this.selected != null) this.selected = arr(this.model.rows, false);
            this.vrp();
            if(this.position != null) this.position.clearPos();
        });

        $(function cellModified(target,row,col,prevValue){ if(this.isUsePsMetric) this.invalidate(); });

        $(function paint(g){
            vVisibility(this);
            if(this.visibility.hasVisibleCells()){
                var sx = this.sman.getSX(), sy = this.sman.getSY(), cw = 0, ts = g.getTopStack();
                try{
                    g.save();
                    g.translate(sx, sy);
                    this.paintSelection(g);
                    if(this.leftCaption != null || this.topCaption != null){
                        cw = ts.width;
                        var cx = ts.x, cy = ts.y, ch = ts.height, dx = this.sman.getSX(), dy = this.sman.getSY();
                        g.clipRect(this.leftCaption != null && this.leftCaption.isVisible ? this.leftCaption.x + this.leftCaption.width - dx : cx, this.topCaption != null && this.topCaption.isVisible ? this.topCaption.y + this.topCaption.height - dy : cy, this.width, this.height);
                    }
                    this.paintData(g);
                    this.paintNet(g);
                    this.paintMarker(g);
                }
                finally{
                    g.restore();
                }
            }
        });

        $(function laidout(){ vVisibility(this); });

        $(function recalc(){
            if(this.isUsePsMetric) this.rPsMetric();
            else this.rCustomMetric();
            rPs(this);
        });

        $(function invalidate(){
            this.$super(this.invalidate);
            this.iColVisibility(0);
            this.iRowVisibility(0);
        });

        $(function setRowHeight(row,h){
            if(h < 0) throw new Error("" + h);

            if( !this.isUsePsMetric){
                this.validateMetric();
                if(this.rowHeights[row] != h){
                    this.stopEditing(false);
                    this.psHeight_ += (h - this.rowHeights[row]);
                    this.rowHeights[row] = h;
                    this.cachedHeight = this.getTop() + this.getBottom() + this.psHeight_ + ((this.topCaption != null && this.topCaption.isVisible) ? this.topCaption.getPreferredSize().height : 0);
                    if(this.parent != null) this.parent.invalidate();
                    this.iRowVisibility(0);
                    this.invalidateLayout();
                    this.repaint();
                }
            }
        });

        $(function isInvalidatedByChild(c){ return c != this.editor || this.isUsePsMetric; });

        $(function setColWidth(col,w){
            if(w < 0) throw new Error("" + w);

            if( !this.isUsePsMetric){
                this.validateMetric();
                if(this.colWidths[col] != w){
                    this.stopEditing(false);
                    this.psWidth_ += (w - this.colWidths[col]);
                    this.colWidths[col] = w;
                    this.cachedWidth = this.getRight() + this.getLeft() + this.psWidth_ + ((this.leftCaption != null && this.leftCaption.isVisible) ? this.leftCaption.getPreferredSize().width : 0);
                    if(this.parent != null) this.parent.invalidate();
                    this.iColVisibility(0);
                    this.invalidateLayout();
                    this.repaint();
                }
            }
        });

        $(function scrolled(psx,psy){
            var x = this.sman.getSX(), y = this.sman.getSY();
            var offx = x - psx, offy = y - psy;
            if(offx != 0) this.iColVisibility(offx > 0 ? 1 :  - 1);
            if(offy != 0) this.iRowVisibility(offy > 0 ? 1 :  - 1);
            this.stopEditing(false);
            this.repaint();
        });

        $(function mouseClicked(e) { if(se(this, this.pressedRow, this.pressedCol, e)) this.pressedRow =  -1; });
        $(function mouseReleased(e){ if(se(this, this.pressedRow, this.pressedCol, e)) this.pressedRow =  -1; });

        $(function setLineColor(c){
            if(c == null) throw new Error();

            if( !c.equals(this.lineColor)){
                this.lineColor = c;
                if(this.drawVerLines || this.drawHorLines) this.repaint();
            }
        });

        $(function mousePressed(e){
            this.pressedRow =  -1;
            if(this.visibility.hasVisibleCells()){
                this.stopEditing(true);
                if(e.isActionMask()){
                    var p = this.cellByLocation(e.x, e.y);
                    if(p != null){
                        if(this.position != null){
                            var off = this.position.currentLine;
                            if(off == p.x) calcOrigin(this, off, this.getRowY(off));
                            else{
                                if(!e.isControlPressed()) this.clearSelect();
                                this.position.setOffset(p.x);
                            }
                        }
                        
                        if(!se(this, p.x, p.y, e)){
                            this.pressedRow = p.x;
                            this.pressedCol = p.y;
                        }
                    }
                }
            }
        });

        $(function getLines(){ return this.getGridRows(); });
        $(function getLineSize(line){ return 1; });
        $(function getMaxOffset(){ return this.getGridRows() - 1; });

        $(function posChanged(target,prevOffset,prevLine,prevCol){
            var off = this.position.currentLine;
            if(off >= 0){
                calcOrigin(this, off, this.getRowY(off));
                this.select(off, true);
                this.repaintRows(prevOffset, off);
            }
        });

        $(function keyPressed(e){
            if(this.position != null){
                var cl = this.position.currentLine;
                switch(e.code)
                {
                    case KE.VK_LEFT: this.position.seek( - 1);break;
                    case KE.VK_UP: this.position.seekLineTo(Position.UP);break;
                    case KE.VK_RIGHT: this.position.seek(1);break;
                    case KE.VK_DOWN: this.position.seekLineTo(Position.DOWN);break;
                    case KE.VK_PAGE_UP: this.position.seekLineTo(Position.UP, this.pageSize(-1));break;
                    case KE.VK_PAGE_DOWN: this.position.seekLineTo(Position.DOWN, this.pageSize(1));break;
                    case KE.VK_END: if(e.isControlPressed()) this.position.setOffset(this.getLines() - 1);break;
                    case KE.VK_HOME: if(e.isControlPressed()) this.position.setOffset(0);break;
                }
                se(this, this.position.currentLine, this.position.currentCol, e);
                if(cl != this.position.currentLine && cl >= 0){
                    for(var i = 0;i < this.getGridRows(); i++){
                        if(i != this.position.currentLine) this.select(i, false);
                    }
                }
            }
        });

        $(function doLayout(target){
            var topHeight = (this.topCaption != null && this.topCaption.isVisible) ? this.topCaption.getPreferredSize().height : 0;
            var leftWidth = (this.leftCaption != null && this.leftCaption.isVisible) ? this.leftCaption.getPreferredSize().width : 0;
            if(this.stub != null && this.stub.isVisible){
                var stubPs = this.stub.getPreferredSize();
                leftWidth = Math.max(leftWidth, stubPs.width);
                topHeight = Math.max(topHeight, stubPs.height);
                this.stub.setSize(leftWidth, topHeight);
                this.stub.setLocation(this.getLeft(), this.getTop());
            }
            if(this.topCaption != null){
                this.topCaption.setLocation(this.getLeft() + leftWidth, this.getTop());
                this.topCaption.setSize(Math.min(target.width - this.getLeft() - this.getRight() - leftWidth, this.psWidth_), topHeight);
            }
            if(this.leftCaption != null){
                this.leftCaption.setLocation(this.getLeft(), this.getTop() + topHeight);
                this.leftCaption.setSize(leftWidth, Math.min(target.height - this.getTop() - this.getBottom() - topHeight, this.psHeight_));
            }
            if(this.editors != null && this.editor != null && this.editor.parent == this && this.editor.isVisible){
                var w = this.colWidths[this.editingCol], h = this.rowHeights[this.editingRow];
                var x = getColX_(this, this.editingCol), y = getRowY_(this, this.editingRow);
                if(this.isUsePsMetric){
                    x += this.cellInsetsLeft;
                    y += this.cellInsetsTop;
                    w -= (this.cellInsetsLeft + this.cellInsetsRight);
                    h -= (this.cellInsetsTop + this.cellInsetsBottom);
                }
                this.editor.setLocation(x + this.sman.getSX(), y + this.sman.getSY());
                this.editor.setSize(w, h);
            }
        });

        $(function kidAdded(index,id,lw){
            this.$super(this.kidAdded,index, id, lw);
            if(Grid.TOP_CAPTION_EL == id){
                this.topCaption = lw;
                if(zebra.instanceOf(lw, pkg.GridCaption)) lw.setup(this, L.HORIZONTAL);
            }
            else
                if(Grid.EDITOR_EL == id) this.editor = lw;
                else
                    if(Grid.LEFT_CAPTION_EL == id){
                        this.leftCaption = lw;
                        if(zebra.instanceOf(lw, pkg.GridCaption)) lw.setup(this, L.VERTICAL);
                    }
                    else if(Grid.STUB_EL == id) this.stub = lw;
        });

        $(function kidRemoved(index,lw){
            this.$super(this.kidRemoved,index, lw);
            if(lw == this.editor) this.editor = null;
            else
                if(lw == this.topCaption){
                    if(zebra.instanceOf(lw, pkg.GridCaption)) lw.setup(null, L.HORIZONTAL);
                    this.topCaption = null;
                }
                else
                    if(lw == this.leftCaption){
                        if(zebra.instanceOf(lw, pkg.GridCaption)) lw.setup(null, L.VERTICAL);
                        this.leftCaption = null;
                    }
                    else if(lw == this.stub) this.stub = null;
        });

        $(function calcPreferredSize(target){
            return new Dimension(this.psWidth_  + ((this.leftCaption != null && this.leftCaption.isVisible) ? this.leftCaption.getPreferredSize().width : 0), 
                                 this.psHeight_ + ((this.topCaption != null && this.topCaption.isVisible) ? this.topCaption.getPreferredSize().height : 0));
        });

        $(function getGridRows(){ return this.model != null ? this.model.rows : 0; });
        $(function getGridCols(){ return this.model != null ? this.model.cols : 0; });

        $(function getRowHeight(row){
            this.validate();
            return this.rowHeights[row];
        });

        $(function getColWidth(col){
            this.validate();
            return this.colWidths[col];
        });

        $(function getCellsVisibility(){
            this.validate();
            return this.visibility;
        });

        $(function setLineSize(s){
            if(ns != this.lineSize){
                this.lineSize = s;
                this.vrp();
            }
        });

        $(function getColX(col){
            this.validate();
            return getColX_(this, col);
        });

        $(function getRowY(row){
            this.validate();
            return getRowY_(this, row);
        });

        $(function childInputEvent(e){
            if (this.editingRow >= 0){
                if(this.editors.shouldDo(pkg.CANCEL_EDITING, this.editingRow, this.editingCol, e)) this.stopEditing(false);
                else
                    if(this.editors.shouldDo(pkg.FINISH_EDITING, this.editingRow, this.editingCol, e)) this.stopEditing(true);
            }
        });

        $(function startEditing(row,col){
            this.stopEditing(true);
            if(this.editors != null){
                var editor = this.editors.getEditor(this, row, col, this.getDataToEdit(row, col));
                if(editor != null){
                    this.editingRow = row;
                    this.editingCol = col;
                    if(this.isExternatEditor(row, col, editor)){
                        var p = L.getAbsLocation(this.getColX(col) + this.sman.getSX(), this.getRowY(row) + this.sman.getSY(), this);
                        editor.setLocation(p.x, p.y);
                        ui.makeFullyVisible(ui.getDesktop(this), editor);
                        this.editor = editor;
                        ui.getDesktop(this).getLayer(WinLayer.ID).add([WinLayer.MODAL, this], editor);
                    }
                    else{
                        this.add(Grid.EDITOR_EL, editor);
                        this.repaintRows(this.editingRow, this.editingRow);
                    }
                    ui.focusManager.requestFocus(editor);
                    return true;
                }
            }
            return false;
        });

        $(function stopEditing(applyData){
            if(this.editors != null && this.editingRow >= 0 && this.editingCol >= 0){
                try{
                    if(zebra.instanceOf(this.editor, Grid)) this.editor.stopEditing(applyData);
                    var data = this.getDataToEdit(this.editingRow, this.editingCol);
                    if(applyData){
                        this.setEditedData(this.editingRow, this.editingCol, this.editors.fetchEditedValue(this.editingRow, this.editingCol, data, this.editor));
                    }
                    else this.editors.editingCanceled(this.editingRow, this.editingCol, data, this.editor);
                    this.repaintRows(this.editingRow, this.editingRow);
                }
                finally{
                    this.editingCol = this.editingRow =  -1;
                    if(this.indexOf(this.editor) >= 0) this.remove(this.editor);
                    this.editor = null;
                    this.requestFocus();
                }
            }
        });

        $(function getXOrigin(){ return this.sman.getSX(); });
        $(function getYOrigin(){ return this.sman.getSY(); });
        $(function getColPSWidth(col){ return this.getPSSize(col, false); });
        $(function getRowPSHeight(row){ return this.getPSSize(row, true); });

        $(function getEditingCell(){
            return (this.editingRow >= 0 && this.editingCol >= 0) ? new Point(this.editingRow, this.editingCol) : null;
        });

        $(function winOpened(winLayer,target,b){
            if(this.editor == target &&  !b) this.stopEditing(this.editor.isAccepted());
        });

        $(function winActivated(winLayer,target,b){});

        $(function getDataToEdit(row,col){ return this.model.get(row, col); });
        $(function setEditedData(row,col,value){ this.model.put(row, col, value); });
        $(function dataToPaint(row,col){ return this.model.get(row, col);});

        $(function paintNet(g){
            var v = this.visibility, topX = v.fc.y - this.lineSize, topY = v.fr.y - this.lineSize;
            var botX = v.lc.y + this.colWidths[v.lc.x], botY = v.lr.y + this.rowHeights[v.lr.x];
            g.setColor(this.lineColor);
            if(this.drawHorLines){
                var y = topY;
                for(var i = v.fr.x;i <= v.lr.x; i ++ ){
                    g.drawLine(topX, y, botX, y);
                    y += this.rowHeights[i] + this.lineSize;
                }
                g.drawLine(topX, y, botX, y);
            }
            if(this.drawVerLines){
                for(var i = v.fc.x;i <= v.lc.x; i ++ ){
                    g.drawLine(topX, topY, topX, botY);
                    topX += this.colWidths[i] + this.lineSize;
                }
                g.drawLine(topX, topY, topX, botY);
            }
        });

        $(function paintData(g){
            var y = this.visibility.fr.y + this.cellInsetsTop;
            var addW = this.cellInsetsLeft + this.cellInsetsRight, addH = this.cellInsetsTop + this.cellInsetsBottom;
            var ts = g.getTopStack(), cx = ts.x, cy = ts.y, cw = ts.width, ch = ts.height, res = new Rectangle();

            //!!!!
            //var desk = zebra.ui.getDesktop(this);
            // var can  = document.createElement("canvas")
            // var gg   = can.getContext("2d"), ggg = g, g = gg;
            // gg.init();
            // can.width  = this.visibility.lc.y - this.visibility.fc.y;
            // can.height = this.visibility.lr.y - y;
            // gg.fillStyle = "red";
            // gg.fillRect(0, 0, can.width, can.height);
            
            for(var i = this.visibility.fr.x;i <= this.visibility.lr.x && y < cy + ch; i++){
                if(y + this.rowHeights[i] > cy){
                    var x = this.visibility.fc.y + this.cellInsetsLeft, notSelectedRow = !this.isSelected(i);
                    for(var j = this.visibility.fc.x;j <= this.visibility.lc.x; j ++ ){
                        if(notSelectedRow){
                            var bg = this.provider.getCellColor(i, j);
                            if(bg != null){
                                g.setColor(bg);
                                g.fillRect(x - this.cellInsetsLeft, y - this.cellInsetsTop, this.colWidths[j], this.rowHeights[i]);
                            }
                        }
                        var v = (i == this.editingRow && j == this.editingCol) ? null : this.provider.getView(i, j, this.dataToPaint(i, j));
                        if(v != null){
                            var w = this.colWidths[j] - addW, h = this.rowHeights[i] - addH;
                            MB.intersection(x, y, w, h, cx, cy, cw, ch, res);
                            if(res.width > 0 && res.height > 0) {
                                if(this.isUsePsMetric) v.paint(g, x, y, w, h, this);
                                else{
                                    var ax = this.provider.getXAlignment(i, j), ay = this.provider.getYAlignment(i, j), vw = w, vh = h;
                                    var xx = x, yy = y, ps = (ax != L.NONE || ay != L.NONE) ? v.getPreferredSize() : null;
                                    if(ax != L.NONE){
                                        xx = x + L.getXLoc(ps.width, ax, w);
                                        vw = ps.width;
                                    }
                                    if(ay != L.NONE){
                                        yy = y + L.getYLoc(ps.height, ay, h);
                                        vh = ps.height;
                                    }

                                    var id = -1;
                                    if (xx < res.x || yy < res.y || (xx + vw) > (x + w) ||  (yy + vh) > (y + h)) {
                                        id = g.save();
                                        g.clipRect(res.x, res.y, res.width, res.height);
                                    }
                                                                       
                                   v.paint(g, xx, yy, vw, vh, this);
                                   
                                    if (id >= 0) { 
                                       g.restore();
                                    }
                                 }
                            }
                        }
                        x += (this.colWidths[j] + this.lineSize);
                    }
                }
                y += (this.rowHeights[i] + this.lineSize);
            }
        });

        $(function paintMarker(g){
            if(this.views[Grid.MARKER_VIEW] != null && this.position != null && this.position.offset >= 0 && this.hasFocus()){
                var offset = this.position.offset, v = this.visibility;
                if(offset >= v.fr.x && offset <= v.lr.x){
                    g.clipRect(this.getLeftCaptionWidth() - this.sman.getSX(), 
                               this.getTopCaptionHeight() - this.sman.getSY(), this.width, this.height);
                    this.views[Grid.MARKER_VIEW].paint(g, v.fc.y, this.getRowY(offset), 
                                                          v.lc.y - v.fc.y + this.getColWidth(v.lc.x),
                                                          this.rowHeights[offset], this);
                }
            }
        });

        $(function paintSelection(g){
            var ts = g.getTopStack(), cx = ts.x, cy = ts.y, cw = ts.width, ch = ts.height;
            try{
                g.clipRect(this.getLeftCaptionWidth() - this.sman.getSX(), 
                           this.getTopCaptionHeight() - this.sman.getSY(), this.width, this.height);
                var v = this.views[this.hasFocus()?Grid.ACTIVE_SEL_VIEW:Grid.INACTIVE_SEL_VIEW];
                for(var j = this.visibility.fr.x;j <= this.visibility.lr.x; j ++ ){
                    if(this.isSelected(j)){
                        var x = this.visibility.fc.y, y = this.getRowY(j), h = this.rowHeights[j];
                        for(var i = this.visibility.fc.x;i <= this.visibility.lc.x; i ++ ){
                            if(i != this.editingCol || this.editingRow != j) v.paint(g, x, y, this.colWidths[i], h, this);
                            x += this.colWidths[i] + this.lineSize;
                        }
                    }
                }
            }
            finally { if (cw > 0 && ch > 0) g.setClip(cx, cy, cw, ch); }
        });

        $(function repaintRows(r1,r2){
            if(r1 < 0) r1 = r2;
            if(r2 < 0) r2 = r1;
            if(r1 > r2){
                var i = r2;
                r2 = r1;
                r1 = i;
            }
            var rows = this.getGridRows();
            if(r1 < rows){
                if(r2 >= rows) r2 = rows - 1;
                var y1 = this.getRowY(r1), y2 = ((r1 == r2) ? y1 : this.getRowY(r2)) + this.rowHeights[r2];
                this.repaint(0, y1 + this.sman.getSY(), this.width, y2 - y1);
            }
        });

        $(function cellByLocation(x,y){
            this.validate();
            var dx = this.sman.getSX(), dy = this.sman.getSY(), v = this.visibility;
            var ry1 = v.fr.y + dy, rx1 = v.fc.y + dx, row =  -1, col =  -1;
            var ry2 = v.lr.y + this.rowHeights[v.lr.x] + dy;
            var rx2 = v.lc.y + this.colWidths[v.lc.x] + dx;
            if(y > ry1 && y < ry2){
                for(var i = v.fr.x;i <= v.lr.x; ry1 += this.rowHeights[i] + this.lineSize,i ++ ){
                    if(y > ry1 && y < ry1 + this.rowHeights[i]) { 
                        row = i; 
                        break;
                    }
                }
            }
            if(x > rx1 && x < rx2){
                for(var i = v.fc.x;i <= v.lc.x; rx1 += this.colWidths[i] + this.lineSize, i++ ){
                    if(x > rx1 && x < rx1 + this.colWidths[i]) { 
                        col = i; 
                        break;
                    }
                }
            }
            return (col >= 0 && row >= 0) ? new Point(row, col) : null;
        });

        $(function rPsMetric(){
            var cols = this.getGridCols(), rows = this.getGridRows();
            if(this.colWidths == null || this.colWidths.length != cols) this.colWidths = arr(cols, 0);
            if(this.rowHeights == null || this.rowHeights.length != rows) this.rowHeights = arr(rows, 0);
            var addW = this.cellInsetsLeft + this.cellInsetsRight;
            var addH = this.cellInsetsTop + this.cellInsetsBottom;
            for(var i = 0;i < cols; i++ ) this.colWidths [i] = 0;
            for(var i = 0;i < rows; i++ ) this.rowHeights[i] = 0;
            for(var i = 0;i < cols; i++ ){
                for(var j = 0;j < rows; j ++ ){
                    var v = this.provider.getView(j, i, this.model.get(j, i));
                    if(v != null){
                        var ps = v.getPreferredSize();
                        ps.width += addW;
                        ps.height += addH;
                        if(ps.width > this.colWidths[i]) this.colWidths [i] = ps.width;
                        if(ps.height > this.rowHeights[j]) this.rowHeights[j] = ps.height;
                    }
                    else{
                        if(DEF_COLWIDTH > this.colWidths [i]) this.colWidths [i] = DEF_COLWIDTH;
                        if(DEF_ROWHEIGHT > this.rowHeights[j]) this.rowHeights[j] = DEF_ROWHEIGHT;
                    }
                }
            }
        });

        $(function getPSSize(rowcol,b){
            if(this.isUsePsMetric) return b ? this.getRowHeight(rowcol) : this.getColWidth(rowcol);
            else {
                var max = 0, count = b ? this.getGridCols() : this.getGridRows();
                for(var j = 0;j < count; j ++ ){
                    var r = b ? rowcol : j, c = b ? j : rowcol;
                    var v = this.provider.getView(r, c, this.model.get(r, c));
                    if(v != null){
                        var ps = v.getPreferredSize();
                        if(b){
                            if(ps.height > max) max = ps.height;
                        }
                        else if(ps.width > max) max = ps.width;
                    }
                }
                return max + this.lineSize * 2 + (b ? this.cellInsetsTop + this.cellInsetsBottom : this.cellInsetsLeft + this.cellInsetsRight);
            }
        });

        $(function rCustomMetric(){
            var start = 0;
            if(this.colWidths != null){
                start = this.colWidths.length;
                if(this.colWidths.length != this.getGridCols()){
                    var na = arr(this.getGridCols(), 0);
                    zebra.util.arraycopy(this.colWidths, 0, na, 0, Math.min(this.colWidths.length, na.length));
                    this.colWidths = na;
                }
            }
            else this.colWidths = arr(this.getGridCols(), 0);
            for(; start < this.colWidths.length; start ++ ) this.colWidths[start] = DEF_COLWIDTH;
            start = 0;
            if(this.rowHeights != null){
                start = this.rowHeights.length;
                if(this.rowHeights.length != this.getGridRows()){
                    var na = arr(this.getGridRows(), 0);
                    zebra.util.arraycopy(this.rowHeights, 0, na, 0, Math.min(this.rowHeights.length, na.length));
                    this.rowHeights = na;
                }
            }
            else this.rowHeights = arr(this.getGridRows(), 0);
            for(; start < this.rowHeights.length; start ++ ) this.rowHeights[start] = DEF_ROWHEIGHT;
        });

        $(function pageSize(d){
            this.validate();
            if(this.visibility.hasVisibleCells()){
                var off = this.position.offset;
                if(off >= 0){
                    var hh = this.visibleArea.height - this.getTopCaptionHeight(), sum = 0, poff = off;
                    for(; off >= 0 && off < this.getGridRows() && sum < hh; sum += this.rowHeights[off] + this.lineSize,off += d);
                    return Math.abs(poff - off);
                }
            }
            return 0;
        });

        $(function iColVisibility(off){
            this.colOffset = (this.colOffset == 100) ? this.colOffset = off : ((off != this.colOffset) ? 0 : this.colOffset);
        });

        $(function iRowVisibility(off){
            this.rowOffset = (this.rowOffset == 100) ? off : (((off + this.rowOffset) == 0) ? 0 : this.rowOffset);
        });

        $(function getTopCaptionHeight(){
            return (this.topCaption != null && this.topCaption.isVisible) ? this.topCaption.height : 0;
        });

        $(function getLeftCaptionWidth(){
            return (this.leftCaption != null && this.leftCaption.isVisible) ? this.leftCaption.width : 0;
        });

        $(function isExternatEditor(row, col, editor){ return zebra.instanceOf(editor, ExternalEditor); });

        function getColX_(t, col){
            var start = 0, d = 1, x = t.getLeft() + t.getLeftCaptionWidth() + t.lineSize, v = t.visibility;
            if(v.hasVisibleCells()){
                start = v.fc.x;
                x = v.fc.y;
                d = (col > v.fc.x) ? 1 :  - 1;
            }
            for(var i = start;i != col; x += ((t.colWidths[i] + t.lineSize) * d),i += d);
            return x;
        }

        function getRowY_(t, row){
            var start = 0, d = 1, y = t.getTop() + t.getTopCaptionHeight() + t.lineSize, v = t.visibility;
            if(v.hasVisibleCells()){
                start = v.fr.x;
                y = v.fr.y;
                d = (row > v.fr.x) ? 1 :  - 1;
            }
            for(var i = start;i != row; y += ((t.rowHeights[i] + t.lineSize) * d),i += d);
            return y;
        }

        function rPs(t){
            var cols = t.getGridCols(), rows = t.getGridRows();
            t.psWidth_ = t.lineSize * (cols + 1);
            t.psHeight_ = t.lineSize * (rows + 1);
            for(var i = 0;i < cols; i ++ ) t.psWidth_ += t.colWidths[i];
            for(var i = 0;i < rows; i ++ ) t.psHeight_ += t.rowHeights[i];
        }

        function colVisibility(t, col,x,d,b){
            var cols = t.getGridCols();
            if(cols == 0) return null;
            var left = t.getLeft(), right = t.getRight(), dx = t.sman.getSX();
            var xx1 = Math.min(t.visibleArea.x + t.visibleArea.width, t.width - right);
            var xx2 = Math.max(left, t.visibleArea.x + t.getLeftCaptionWidth());
            for(; col < cols && col >= 0; col += d){
                if(x + dx < xx1 && (x + t.colWidths[col] + dx) > xx2){
                    if(b) return new Point(col, x);
                }
                else{
                    if(!b) return colVisibility(t, col, x, (d > 0 ?  -1 : 1), true);
                }
                if(d < 0){
                    if(col > 0) x -= (t.colWidths[col - 1] + t.lineSize);
                }
                else{
                    if(col < cols - 1) x += (t.colWidths[col] + t.lineSize);
                }
            }
            return b ? null : ((d > 0) ? new Point(col -1, x) : new Point(0, left + t.getLeftCaptionWidth() + t.lineSize));
        }

        function rowVisibility(t, row,y,d,b){
            var rows = t.getGridRows();
            if(rows == 0) return null;
            var top = t.getTop(), bottom = t.getBottom(), dy = t.sman.getSY();
            var yy1 = Math.min(t.visibleArea.y + t.visibleArea.height, t.height - bottom);
            var yy2 = Math.max(t.visibleArea.y, top + t.getTopCaptionHeight());
            for(; row < rows && row >= 0; row += d){
                if(y + dy < yy1 && (y + t.rowHeights[row] + dy) > yy2){
                    if(b) return new Point(row, y);
                }
                else{
                    if(!b) return rowVisibility(t, row, y, (d > 0 ?  -1 : 1), true);
                }
                if(d < 0){
                    if(row > 0) y -= (t.rowHeights[row - 1] + t.lineSize);
                }
                else{
                    if(row < rows - 1) y += (t.rowHeights[row] + t.lineSize);
                }
            }
            return b ? null : ((d > 0) ? new Point(row - 1, y) : new Point(0, top + t.getTopCaptionHeight() + t.lineSize));
        }

        function vVisibility(t){
            var va = t.cvp(new Rectangle());
            if(va == null){
                t.visibleArea = null;
                t.visibility.cancelVisibleCells();
                return ;
            }
            else{
                if (!va.equals(t.visibleArea)){
                    t.iColVisibility(0);
                    t.iRowVisibility(0);
                    t.visibleArea = va;
                }
            }

            var v = t.visibility, b = v.hasVisibleCells();
            if(t.colOffset != 100){
                if(t.colOffset > 0 && b){
                    v.lc = colVisibility(t, v.lc.x, v.lc.y,  -1, true);
                    v.fc = colVisibility(t, v.lc.x, v.lc.y,  -1, false);
                }
                else
                    if(t.colOffset < 0 && b){
                        v.fc = colVisibility(t, v.fc.x, v.fc.y, 1, true);
                        v.lc = colVisibility(t, v.fc.x, v.fc.y, 1, false);
                    }
                    else{
                        v.fc = colVisibility(t, 0, t.getLeft() + t.lineSize + t.getLeftCaptionWidth(), 1, true);
                        v.lc = (v.fc != null) ? colVisibility(t, v.fc.x, v.fc.y, 1, false) : null;
                    }
                t.colOffset = 100;
            }
            
            if(t.rowOffset != 100){
                if(t.rowOffset > 0 && b){
                    v.lr = rowVisibility(t, v.lr.x, v.lr.y,  -1, true);
                    v.fr = rowVisibility(t, v.lr.x, v.lr.y,  -1, false);
                }
                else
                    if(t.rowOffset < 0 && b){
                        v.fr = rowVisibility(t, v.fr.x, v.fr.y, 1, true);
                        v.lr = (v.fr != null) ? rowVisibility(t, v.fr.x, v.fr.y, 1, false) : null;
                    }
                    else{
                        v.fr = rowVisibility(t, 0, t.getTop() + t.getTopCaptionHeight() + t.lineSize, 1, true);
                        v.lr = (v.fr != null) ? rowVisibility(t, v.fr.x, v.fr.y, 1, false) : null;
                    }
                t.rowOffset = 100;
            }
        }

        function calcOrigin(t,off,y){
            var top = t.getTop() + t.getTopCaptionHeight(), left = t.getLeft() + t.getLeftCaptionWidth();
            var o = ui.calcOrigin(t.getColX(0) - t.lineSize, y - t.lineSize, t.psWidth_, 
                                  t.rowHeights[off] + 2 * t.lineSize, t.sman.getSX(), t.sman.getSY(), 
                                  t, top, left, t.getBottom(), t.getRight());
            t.sman.scrollTo(o.x, o.y);
        }

        function se(t, row,col,e){
            if(row >= 0){
                t.stopEditing(true);
                if(t.editors != null && t.editors.shouldDo(pkg.START_EDITING, row, col, e)) return t.startEditing(row, col);
            }
            return false;
        }
});

zebra.setupNames(pkg);

})(zebra("ui.grid"), zebra.Class, zebra("ui"));
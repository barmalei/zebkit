(function(pkg, Class, ui) {

var MouseEvent = ui.MouseEvent, FocusListener = ui.FocusListener, Matrix = zebra.data.Matrix, L = zebra.layout,
    ExternalEditor = ui.ExternalEditor, WinLayer = ui.WinLayer, MB = zebra.util, Cursor = ui.Cursor,
    Position = zebra.util.Position, KE = ui.KeyEvent, Listeners = zebra.util.Listeners;

//!!! crappy function
function arr(l, v) {
    var a = Array(l);
    for(var i=0; i<l; i++) a[i] = v;
    return a;
}

pkg.START_EDITING  = 1;
pkg.FINISH_EDITING = 2;
pkg.CANCEL_EDITING = 3;

function CellsVisibility() {
    this.hasVisibleCells = function(){
        return this.fr != null && this.fc != null && this.lr != null && this.lc != null;
    };
    // first visible row (row and y), first visible col, last visible col and row
    this.fr = this.fc = this.lr = this.lc = null;
}

pkg.DefViews = Class([
    function (){
        this.render = new ui.TextRender(new zebra.data.SingleLineTxt(""));
    },

    function $prototype() {
        this.getXAlignment = function(row,col){ return L.CENTER; },
        this.getYAlignment = function(row,col){ return L.CENTER; },
        this.getCellColor  = function(row,col){ return pkg.DefViews.cellBackground;},

        this.getView = function(row,col,obj){
            if (obj != null){
                if (obj && obj.paint) return obj;
                this.render.target.setValue(obj.toString());
                return this.render;
            }
            return null;
        };
    }
]);

pkg.DefEditors = Class([
    function() {
        this.editors = {};
        this.editors[''] = new ui.TextField("", 150);
    },

    function $prototype() {
        this.fetchEditedValue = function (row,col,data,editor) { return editor.getValue(); };

        this.getEditor = function(t, row, col, v){
            var editor = this.editors[col] ? this.editors[col] : this.editors['']; 
            if (editor == null) return;

            editor.setBorder(null);
            editor.setPadding(0);
            editor.setValue((v == null ? "" : v.toString()));

            var ah = (t.getRowHeight(row) - editor.getPreferredSize().height)/2;
            editor.setPaddings(ah, t.cellInsetsLeft, ah, t.cellInsetsRight);
            return editor;
        };

        this.shouldDo = function(a,row,col,e){
            //!!! if (action == pkg.START_EDITING) return e.ID == MouseEvent.CLICKED && e.clicks == 1;
            // !!!else return (action == pkg.CANCEL_EDITING) ? e.ID == KE.PRESSED && KE.ESCAPE == e.code: false;
            var b = (a == pkg.START_EDITING  && e.ID == MouseEvent.CLICKED && e.clicks == 1) ||
                    (a == pkg.CANCEL_EDITING && e.ID == KE.PRESSED && KE.ESCAPE == e.code) ||
                    (a == pkg.FINISH_EDITING && e.ID == KE.PRESSED && KE.ENTER  == e.code);
            return b;
        };

        this.editingCanceled = function(row,col,data,editor) {};
    }
]);

var GridCaptionListeners = new Listeners.Class("captionResized");
pkg.GridCaption = Class(ui.Panel, ui.MouseMotionListener, ui.MouseListener, ui.Cursorable, [
    function $clazz() {
        this.Label = Class(ui.BoldLabel, []);
    },

    function $prototype() {
        this.minSize = 10;
        this.activeAreaWidth = 4;
        this.isAutoFit = this.isResizable = true;

        this.getCursorType = function (target,x,y){
            return this.metrics != null && this.selectedColRow >= 0 && this.isResizable &&
                  !this.metrics.isUsePsMetric ? ((this.orient == L.HORIZONTAL) ? Cursor.W_RESIZE
                                                                               : Cursor.S_RESIZE)
                                              : -1;
        };

        this.mouseDragged = function(e){
            if(this.pxy != null){
                var b  = (this.orient == L.HORIZONTAL), m = this.metrics, rc = this.selectedColRow,
                    ns = (b ? m.getColWidth(rc) + e.x : m.getRowHeight(rc) + e.y) - this.pxy;

                if (ns > this.minSize) {
                    if (b) {
                        var pw = m.getColWidth(rc);
                        m.setColWidth (rc, ns);
                        this._.captionResized(this, rc, pw);
                    }
                    else  {
                        var ph = m.getRowHeight(rc);
                        m.setRowHeight(rc, ns);
                        this._.captionResized(this, rc, ph);
                    }
                    this.pxy = b ? e.x : e.y;
                }
            }
        };

        this.startDragged = function(e){
            if(this.metrics != null && this.isResizable && !this.metrics.isUsePsMetric){
                this.calcRowColAt(e.x, e.y);
                if(this.selectedColRow >= 0) this.pxy = (this.orient == L.HORIZONTAL) ? e.x : e.y;
            }
        };

        this.endDragged = function (e){
            if (this.pxy != null) {
                this.pxy = null;
            }
            if (this.metrics != null) this.calcRowColAt(e.x, e.y);
        };

        this.mouseMoved = function(e) { 
            if (this.metrics != null) {
                this.calcRowColAt(e.x, e.y); 

            }
        };

        this.mouseClicked = function (e){
            if (this.pxy == null && this.metrics != null){
                if(e.clicks > 1 && this.selectedColRow >= 0 && this.isAutoFit){
                    var b = (this.orient == L.HORIZONTAL), add = 0, m = this.metrics, bv = this.borderView,
                        size = b ? m.getColPSWidth(this.selectedColRow) : m.getRowPSHeight(this.selectedColRow);

                    if (bv != null) add = (b ? (bv.getLeft() + bv.getRight()) : (bv.getTop() + bv.getBottom()));

                    var v = this.getTitleView(this.selectedColRow);
                    if (v != null) size = Math.max(size, add + (b ? v.getPreferredSize().width : v.getPreferredSize().height));

                    if (b) m.setColWidth (this.selectedColRow, size);
                    else   m.setRowHeight(this.selectedColRow, size);
                }
            }
        };

        this.calcRowColAt = function(x, y){
            var isHor = (this.orient == L.HORIZONTAL), cv = this.metrics.getCellsVisibility();

            if ((isHor && cv.fc != null) || (!isHor && cv.fr != null)){
                var m = this.metrics, g = m.lineSize, xy = isHor ? x : y,
                    xxyy = isHor ? cv.fc[1] - this.x + m.getXOrigin() - g
                                 : cv.fr[1] - this.y + m.getYOrigin() - g;

                for(var i = (isHor ? cv.fc[0] : cv.fr[0]);i <= (isHor ? cv.lc[0] : cv.lr[0]); i ++ )
                {
                    var wh = isHor ? m.getColWidth(i) : m.getRowHeight(i);
                    xxyy += (wh + g);
                    if (xy < xxyy + this.activeAreaWidth && xy > xxyy - this.activeAreaWidth){
                        this.selectedColRow = i;
                        this.selectedXY = xy - wh;
                        return ;
                    }
                }
            }
            this.selectedColRow = -1;
        };

        this.getTitleProps = function(i){
            return this.titles != null && i < this.titles.length / 2 ? this.titles[i*2 + 1] : null;
        };

        this.getTitleView = function(i){
            var data = this.getTitle(i);
            if (data == null || data.paint) return data;
            this.render.target.setValue(data.toString());
            return this.render;
        };

        this.calcPreferredSize = function (l) { 
            return { width:this.psW, height:this.psH }; 
        };

        this.recalc = function(){
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
               
                if(this.psH === 0) this.psH = pkg.Grid.DEF_ROWHEIGHT;
                if(this.psW === 0) this.psW = pkg.Grid.DEF_COLWIDTH;
               
                if(this.borderView != null){
                    this.psW += (this.borderView.getLeft() + this.borderView.getRight()) * (isHor ? size : 1);
                    this.psH += (this.borderView.getTop() + this.borderView.getBottom()) * (isHor ? 1 : size);
                }
            }
        };

        this.paint = function(g){
            if(this.metrics != null){
                var cv = this.metrics.getCellsVisibility();
                if (cv.hasVisibleCells() === false) return;

                var m = this.metrics, isHor = (this.orient == L.HORIZONTAL), gap = m.lineSize, 
                    top = 0, left = 0, bottom = 0, right = 0;
                
                if (this.borderView != null){
                    top    += this.borderView.getTop();
                    left   += this.borderView.getLeft();
                    bottom += this.borderView.getBottom();
                    right  += this.borderView.getRight();
                }

                var x = isHor ? cv.fc[1] - this.x + m.getXOrigin() - gap : this.getLeft(),
                    y = isHor ? this.getTop() : cv.fr[1] - this.y + m.getYOrigin() - gap,
                    size = isHor ? m.getGridCols() : m.getGridRows();

                for(var i = (isHor ? cv.fc[0] : cv.fr[0]);i <= (isHor ? cv.lc[0] : cv.lr[0]); i ++ )
                {
                    var wh1 = isHor ? m.getColWidth(i) + gap + (((size - 1) == i) ? gap : 0) : this.psW,
                        wh2 = isHor ? this.psH : m.getRowHeight(i) + gap + (((size - 1) == i) ? gap : 0),
                        v = this.getTitleView(i);

                    if (this.borderView != null) this.borderView.paint(g, x, y, wh1, wh2, this);

                    if (v != null) {
                        var props = this.getTitleProps(i), ps = v.getPreferredSize();
                        if(props != null && props[2] != 0){
                            g.setColor(props[2]);
                            g.fillRect(x, y, wh1 - 1, wh2 - 1);
                        }

                        g.save();
                        if (this.borderView && this.borderView.outline && this.borderView.outline(g, x, y, wh1, wh2, this)) {
                            g.clip();
                        }
                        else {
                            g.clipRect(x, y, wh1, wh2);
                        }

                        var vx = x + L.xAlignment(ps.width, props != null ? props[0] : L.CENTER, wh1 - left - right) + left,
                            vy = y + L.yAlignment(ps.height, props != null ? props[1] : L.CENTER, wh2 - top - bottom) + top;

                        v.paint(g, vx, vy, ps.width, ps.height, this);
                        g.restore();
                    }

                    if (isHor) x += wh1;
                    else       y += wh2;
                }
            }
        };

        this.getCaptionAt = function (x,y){
            if(this.metrics != null && x >= 0 && y >= 0 && x < this.width && y < this.height){
                var m = this.metrics, cv = m.getCellsVisibility(), isHor = (this.orient == L.HORIZONTAL);
                if((isHor && cv.fc != null) || ( !isHor && cv.fr != null)){
                    var gap = m.lineSize, xy = isHor ? x : y,
                        xxyy = isHor ? cv.fc[1] - this.x - gap + m.getXOrigin() : cv.fr[1] - this.y - gap + m.getYOrigin();

                    for(var i = (isHor ? cv.fc[0] : cv.fr[0]);i <= (isHor ? cv.lc[0] : cv.lr[0]); i ++ ){
                        var wh = isHor ? m.getColWidth(i) : m.getRowHeight(i);
                        if(xy > xxyy && xy < xxyy + wh) return i;
                        xxyy += wh + gap;
                    }
                }
            }
            return -1;
        };

        this.getTitle = function (rowcol){
            return this.titles == null || this.titles.length / 2 <= rowcol ? null
                                                                           : this.titles[rowcol*2];
        };
    },

    function (){ this.$this(null, L.HORIZONTAL); },
    function (m){ this.$this(m, L.HORIZONTAL); },

    function (m,o){
        this._ = new GridCaptionListeners(); 

        this.pxy = this.titles = this.metrics = this.render = null;
        this.psW = this.psH = this.orient = this.selectedXY = 0;
        this.selectedColRow = -1;

        this.setup(m, o);
        this.render = new ui.TextRender("");
        this.render.setFont(pkg.GridCaption.font);
        this.render.setColor(pkg.GridCaption.fontColor);
        this.$super();
    },

    function setup(m,o){
        if(this.metrics != m || o != this.orient){
            if (o != L.HORIZONTAL && o != L.VERTICAL) throw new Error("Invalid args");
            this.metrics = m;
            this.orient = o;
            this.vrp();
        }
    },

    function setBorderView(v){
        if (v != this.borderView){
            this.borderView = ui.$view(v);
            this.vrp();
        }
    },

    function putTitle(rowcol,title){
        var old = this.getTitle(rowcol);
        if (old != title)
        {
            if (this.titles == null) this.titles = arr((rowcol + 1) * 2, null);
            else {
                if(Math.floor(this.titles.length / 2) <= rowcol){
                    var nt = arr((rowcol + 1) * 2, null);
                    zebra.util.arraycopy(this.titles, 0, nt, 0, this.titles.length);
                    this.titles = nt;
                }
            }
            var index = rowcol * 2;
            this.titles[index] = title;
            if (title == null && index + 2 == this.titles.length) {
                var nt = arr(this.titles.length - 2, null);
                zebra.util.arraycopy(this.titles, 0, nt, 0, index);
                this.titles = nt;
            }
            this.vrp();
        }
    },

    function setTitleProps(rowcol,ax,ay,bg){
        var p = this.getTitleProps(rowcol);
        if(p == null) p = [];
        p[0] = ax;
        p[1] = ay;
        p[2] = bg == null ? 0 : bg.getRGB();
        this.titles[rowcol*2 + 1] = p;
        this.repaint();
    }
]);

pkg.Grid = Class(ui.Panel, ui.MouseListener, ui.KeyListener, Position.PositionMetric,
                 ui.ChildrenListener, ui.WinListener, [
        function $clazz() {
            this.DEF_COLWIDTH  = 80;
            this.DEF_ROWHEIGHT = 25;
            this.CornerPan = Class(ui.Panel, []);
        },

        function $prototype() {
            this.lineSize = this.cellInsetsTop = this.cellInsetsBottom = 1;
            this.cellInsetsLeft = this.cellInsetsRight = 2;
            this.drawVerLines = this.drawHorLines = true;
            this.lineColor = "gray";
            this.isUsePsMetric = false;

            this.getColX_ = function (col){
                var start = 0, d = 1, x = this.getLeft() + this.getLeftCaptionWidth() + this.lineSize, v = this.visibility;
                if (v.hasVisibleCells()){
                    start = v.fc[0];
                    x = v.fc[1];
                    d = (col > v.fc[0]) ? 1 :  - 1;
                }
                for(var i = start;i != col; x += ((this.colWidths[i] + this.lineSize) * d),i += d);
                return x;
            };

            this.getRowY_ = function (row){
                var start = 0, d = 1, y = this.getTop() + this.getTopCaptionHeight() + this.lineSize, v = this.visibility;
                if (v.hasVisibleCells()){
                    start = v.fr[0];
                    y = v.fr[1];
                    d = (row > v.fr[0]) ? 1 :  - 1;
                }
                for(var i = start;i != row; y += ((this.rowHeights[i] + this.lineSize) * d),i += d);
                return y;
            };

            this.rPs = function(){
                var cols = this.getGridCols(), rows = this.getGridRows();
                this.psWidth_ = this.lineSize * (cols + 1);
                this.psHeight_ = this.lineSize * (rows + 1);
                for(var i = 0;i < cols; i ++ ) this.psWidth_ += this.colWidths[i];
                for(var i = 0;i < rows; i ++ ) this.psHeight_ += this.rowHeights[i];
            };

            this.colVisibility = function(col,x,d,b){
                var cols = this.getGridCols();
                if(cols === 0) return null;
                var left = this.getLeft(), dx = this.scrollManager.getSX(),
                    xx1 = Math.min(this.visibleArea.x + this.visibleArea.width, this.width - this.getRight()),
                    xx2 = Math.max(left, this.visibleArea.x + this.getLeftCaptionWidth());

                for(; col < cols && col >= 0; col += d){
                    if(x + dx < xx1 && (x + this.colWidths[col] + dx) > xx2){
                        if (b) return [col, x];
                    }
                    else {
                        if (b === false) return this.colVisibility(col, x, (d > 0 ?  -1 : 1), true);
                    }
                    if (d < 0){
                        if (col > 0) x -= (this.colWidths[col - 1] + this.lineSize);
                    }
                    else {
                        if (col < cols - 1) x += (this.colWidths[col] + this.lineSize);
                    }
                }
                return b ? null : ((d > 0) ? [col -1, x] : [0, left + this.getLeftCaptionWidth() + this.lineSize]);
            };

            this.rowVisibility = function(row,y,d,b){
                var rows = this.getGridRows();

                if (rows === 0) return null;
                var top = this.getTop(), dy = this.scrollManager.getSY(),
                    yy1 = Math.min(this.visibleArea.y + this.visibleArea.height, this.height - this.getBottom()),
                    yy2 = Math.max(this.visibleArea.y, top + this.getTopCaptionHeight());

                for(; row < rows && row >= 0; row += d){
                    if(y + dy < yy1 && (y + this.rowHeights[row] + dy) > yy2){
                        if(b) return [row, y];
                    }
                    else{
                        if(b === false) return this.rowVisibility(row, y, (d > 0 ?  -1 : 1), true);
                    }
                    if(d < 0){
                        if(row > 0) y -= (this.rowHeights[row - 1] + this.lineSize);
                    }
                    else{
                        if(row < rows - 1) y += (this.rowHeights[row] + this.lineSize);
                    }
                }
                return b ? null : ((d > 0) ? [row - 1, y] : [0, top + this.getTopCaptionHeight() + this.lineSize]);
            };

            this.vVisibility = function(){
                var va = ui.$cvp(this, {});
                if(va == null){
                    this.visibleArea = null;
                    this.visibility.cancelVisibleCells();
                    return ;
                }
                else{
                    if (this.visibleArea == null           ||
                        va.x != this.visibleArea.x         ||
                        va.y != this.visibleArea.y         ||
                        va.width != this.visibleArea.width ||
                        va.height != this.visibleArea.height  )
                    {
                        this.iColVisibility(0);
                        this.iRowVisibility(0);
                        this.visibleArea = va;
                    }
                }

                var v = this.visibility, b = v.hasVisibleCells();
                if(this.colOffset != 100){
                    if(this.colOffset > 0 && b){
                        v.lc = this.colVisibility(v.lc[0], v.lc[1],  -1, true);
                        v.fc = this.colVisibility(v.lc[0], v.lc[1],  -1, false);
                    }
                    else
                        if(this.colOffset < 0 && b){
                            v.fc = this.colVisibility(v.fc[0], v.fc[1], 1, true);
                            v.lc = this.colVisibility(v.fc[0], v.fc[1], 1, false);
                        }
                        else{
                            v.fc = this.colVisibility(0, this.getLeft() + this.lineSize + this.getLeftCaptionWidth(), 1, true);
                            v.lc = (v.fc != null) ? this.colVisibility(v.fc[0], v.fc[1], 1, false) : null;
                        }
                    this.colOffset = 100;
                }

                if(this.rowOffset != 100){
                    if(this.rowOffset > 0 && b){
                        v.lr = this.rowVisibility(v.lr[0], v.lr[1],  -1, true);
                        v.fr = this.rowVisibility(v.lr[0], v.lr[1],  -1, false);
                    }
                    else {
                        if(this.rowOffset < 0 && b){
                            v.fr = this.rowVisibility(v.fr[0], v.fr[1], 1, true);
                            v.lr = (v.fr != null) ? this.rowVisibility(v.fr[0], v.fr[1], 1, false) : null;
                        }
                        else {
                            v.fr = this.rowVisibility(0, this.getTop() + this.getTopCaptionHeight() + this.lineSize, 1, true);
                            v.lr = (v.fr != null) ? this.rowVisibility(v.fr[0], v.fr[1], 1, false) : null;
                        }
                    }
                    this.rowOffset = 100;
                }
            };

            this.calcOrigin = function(off,y){
                var top = this.getTop() + this.getTopCaptionHeight(), left = this.getLeft() + this.getLeftCaptionWidth(),
                    o = ui.calcOrigin(this.getColX(0) - this.lineSize, y - this.lineSize, this.psWidth_,
                                      this.rowHeights[off] + 2 * this.lineSize, this.scrollManager.getSX(), this.scrollManager.getSY(),
                                      this, top, left, this.getBottom(), this.getRight());
                this.scrollManager.scrollTo(o[0], o[1]);
            };

            this.$se = function(row,col,e){
                if(row >= 0){
                    this.stopEditing(true);
                    if (this.editors != null && this.editors.shouldDo(pkg.START_EDITING, row, col, e)) {
                        return this.startEditing(row, col);
                    }
                }
                return false;
            };

            this.getXOrigin =     function () { return this.scrollManager.getSX(); };
            this.getYOrigin =     function () { return this.scrollManager.getSY(); };
            this.getColPSWidth =  function (col){ return this.getPSSize(col, false); };
            this.getRowPSHeight = function (row){ return this.getPSSize(row, true); };

            this.recalc = function(){
                if(this.isUsePsMetric) this.rPsMetric();
                else this.rCustomMetric();
                this.rPs();
            };

            this.getGridRows = function (){ return this.model != null ? this.model.rows : 0; };
            this.getGridCols = function (){ return this.model != null ? this.model.cols : 0; };

            this.getRowHeight = function(row){
                this.validate();
                return this.rowHeights[row];
            };

            this.getColWidth = function(col){
                this.validate();
                return this.colWidths[col];
            };

            this.getCellsVisibility = function(){
                this.validate();
                return this.visibility;
            };

            this.getColX = function (col){
                this.validate();
                return this.getColX_(col);
            };

            this.getRowY = function (row){
                this.validate();
                return this.getRowY_(row);
            };

            this.childInputEvent = function(e){
                if (this.editingRow >= 0) {
                    if (this.editors.shouldDo(pkg.CANCEL_EDITING, this.editingRow, this.editingCol, e)) {
                        this.stopEditing(false);
                    }
                    else {
                        if (this.editors.shouldDo(pkg.FINISH_EDITING, this.editingRow, this.editingCol, e)) {
                            this.stopEditing(true);
                        }
                    }
                }
            };

            this.dataToPaint = function(row,col){ return this.model.get(row, col); };

            this.iColVisibility = function(off){
                this.colOffset = (this.colOffset == 100) ? this.colOffset = off 
                                                         : ((off != this.colOffset) ? 0 : this.colOffset);
            };

            this.iRowVisibility = function(off){
                this.rowOffset = (this.rowOffset == 100) ? off 
                                                         : (((off + this.rowOffset) === 0) ? 0 : this.rowOffset);
            };

            this.getTopCaptionHeight = function(){
                return (this.topCaption != null && this.topCaption.isVisible) ? this.topCaption.height : 0;
            };

            this.getLeftCaptionWidth = function(){
                return (this.leftCaption != null && this.leftCaption.isVisible) ? this.leftCaption.width : 0;
            };

            this.paint = function(g){
                this.vVisibility();
                if (this.visibility.hasVisibleCells()) {
                    var dx = this.scrollManager.getSX(), dy = this.scrollManager.getSY(), 
                        th = this.getTopCaptionHeight(),
                        tw = this.getLeftCaptionWidth();

                    try {
                        g.save();
                        g.translate(dx, dy);
                        
                        if (th > 0 || tw > 0) {
                            g.clipRect(tw - dx, th - dy, this.width  - tw, this.height - th);
                        }

                        this.paintSelection(g);
                        this.paintData(g);
                        if (this.drawHorLines || this.drawVerLines) this.paintNet(g);
                        this.paintMarker(g);
                    }
                    finally {
                        g.restore();
                    }
                }
            };

            this.catchScrolled = function (psx, psy){
                var offx = this.scrollManager.getSX() - psx, offy = this.scrollManager.getSY() - psy;
                if (offx !== 0) this.iColVisibility(offx > 0 ? 1 :  - 1);
                if (offy !== 0) this.iRowVisibility(offy > 0 ? 1 :  - 1);
                this.stopEditing(false);
                this.repaint();
            };

            this.isInvalidatedByChild = function (c){ return c != this.editor || this.isUsePsMetric; };

            this.stopEditing = function(applyData){
                if (this.editors != null && this.editingRow >= 0 && this.editingCol >= 0){
                    try {
                        if (zebra.instanceOf(this.editor, pkg.Grid)) this.editor.stopEditing(applyData);
                        var data = this.getDataToEdit(this.editingRow, this.editingCol);
                        if(applyData){
                            this.setEditedData(this.editingRow, this.editingCol, 
                                               this.editors.fetchEditedValue(this.editingRow, 
                                                                             this.editingCol, 
                                                                             data, this.editor));
                        }
                        else { 
                            this.editors.editingCanceled(this.editingRow, this.editingCol, data, this.editor);
                        }
                        this.repaintRows(this.editingRow, this.editingRow);
                    }
                    finally {
                        this.editingCol = this.editingRow =  -1;
                        if (this.indexOf(this.editor) >= 0) this.remove(this.editor);
                        this.editor = null;
                        this.requestFocus();
                    }
                }
            };

            this.setDrawLines = function(hor, ver){
                if (this.drawVerLines != hor || this.drawHorLines != ver) {
                    this.drawHorLines = hor;
                    this.drawVerLines = ver;
                    this.repaint();
                }
            };

            this.getLines = function (){ return this.getGridRows(); };
            this.getLineSize = function (line){ return 1; };
            this.getMaxOffset = function (){ return this.getGridRows() - 1; };

            this.posChanged = function (target,prevOffset,prevLine,prevCol){
                var off = this.position.currentLine;
                if(off >= 0) {
                    this.calcOrigin(off, this.getRowY(off));
                    this.select(off, true);
                    this.repaintRows(prevOffset, off);
                }
            };

            this.keyPressed = function(e){
                if (this.position != null){
                    var cl = this.position.currentLine;
                    switch(e.code)
                    {
                        case KE.LEFT: this.position.seek( - 1);break;
                        case KE.UP: this.position.seekLineTo(Position.UP);break;
                        case KE.RIGHT: this.position.seek(1);break;
                        case KE.DOWN: this.position.seekLineTo(Position.DOWN);break;
                        case KE.PAGEUP: this.position.seekLineTo(Position.UP, this.pageSize(-1));break;
                        case KE.PAGEDOWN: this.position.seekLineTo(Position.DOWN, this.pageSize(1));break;
                        case KE.END: if(e.isControlPressed()) this.position.setOffset(this.getLines() - 1);break;
                        case KE.HOME: if(e.isControlPressed()) this.position.setOffset(0);break;
                    }
                    this.$se(this.position.currentLine, this.position.currentCol, e);
                    if (cl != this.position.currentLine && cl >= 0){
                        for(var i = 0;i < this.getGridRows(); i++){
                            if(i != this.position.currentLine) this.select(i, false);
                        }
                    }
                }
            };

            this.isSelected = function(row){ 
                return (this.selected == null) ? row == this.selectedIndex : this.selected[row] > 0; 
            };

            this.repaintRows = function (r1,r2){
                if (r1 < 0) r1 = r2;
                if (r2 < 0) r2 = r1;
                if (r1 > r2){
                    var i = r2;
                    r2 = r1;
                    r1 = i;
                }
                var rows = this.getGridRows();
                if (r1 < rows){
                    if (r2 >= rows) r2 = rows - 1;
                    var y1 = this.getRowY(r1), y2 = ((r1 == r2) ? y1 : this.getRowY(r2)) + this.rowHeights[r2];
                    this.repaint(0, y1 + this.scrollManager.getSY(), this.width, y2 - y1);
                }
            };

            this.cellByLocation = function(x,y){
                this.validate();
                var dx = this.scrollManager.getSX(), dy = this.scrollManager.getSY(), v = this.visibility,
                    ry1 = v.fr[1] + dy, rx1 = v.fc[1] + dx, row =  -1, col =  -1,
                    ry2 = v.lr[1] + this.rowHeights[v.lr[0]] + dy,
                    rx2 = v.lc[1] + this.colWidths[v.lc[0]] + dx;

                if(y > ry1 && y < ry2) {
                    for(var i = v.fr[0];i <= v.lr[0]; ry1 += this.rowHeights[i] + this.lineSize,i ++ ){
                        if(y > ry1 && y < ry1 + this.rowHeights[i]) {
                            row = i;
                            break;
                        }
                    }
                }
                if(x > rx1 && x < rx2){
                    for(var i = v.fc[0];i <= v.lc[0]; rx1 += this.colWidths[i] + this.lineSize, i++ ){
                        if(x > rx1 && x < rx1 + this.colWidths[i]) {
                            col = i;
                            break;
                        }
                    }
                }
                return (col >= 0 && row >= 0) ? [row, col] : null;
            };

            this.doLayout = function(target){
                var topHeight = (this.topCaption != null && this.topCaption.isVisible) ? this.topCaption.getPreferredSize().height : 0,
                    leftWidth = (this.leftCaption != null && this.leftCaption.isVisible) ? this.leftCaption.getPreferredSize().width : 0;

                if (this.topCaption != null){
                    this.topCaption.setLocation(this.getLeft() + leftWidth, this.getTop());
                    this.topCaption.setSize(Math.min(target.width - this.getLeft() - this.getRight() - leftWidth, this.psWidth_), topHeight);
                }

                if(this.leftCaption != null){
                    this.leftCaption.setLocation(this.getLeft(), this.getTop() + topHeight);
                    this.leftCaption.setSize(leftWidth, Math.min(target.height - this.getTop() - this.getBottom() - topHeight, this.psHeight_));
                }

                if (this.stub != null && this.stub.isVisible)
                {
                    if (this.topCaption  != null && this.topCaption.isVisible && 
                        this.leftCaption != null && this.leftCaption.isVisible   ) 
                    {
                        this.stub.setLocation(this.getLeft(), this.getTop());
                        this.stub.setSize(this.topCaption.x - this.stub.x, this.leftCaption.y - this.stub.y);
                    }
                    else {
                        this.stub.setSize(0, 0);   
                    }
                }

                if(this.editors != null && this.editor != null && this.editor.parent == this && this.editor.isVisible){
                    var w = this.colWidths[this.editingCol], h = this.rowHeights[this.editingRow],
                        x = this.getColX_(this.editingCol), y = this.getRowY_(this.editingRow);

                    if (this.isUsePsMetric){
                        x += this.cellInsetsLeft;
                        y += this.cellInsetsTop;
                        w -= (this.cellInsetsLeft + this.cellInsetsRight);
                        h -= (this.cellInsetsTop + this.cellInsetsBottom);
                    }
                    this.editor.setLocation(x + this.scrollManager.getSX(), y + this.scrollManager.getSY());
                    this.editor.setSize(w, h);
                }
            };

            this.canHaveFocus = function (){ return this.editor == null; };

            this.isMultiSelectEnabled = function (){ 
                return this.selected != null; 
            };

            this.clearSelect = function (){
                if(this.isMultiSelectEnabled()){
                    for(var i = 0;i < this.selected.length; i++) this.selected[i] = 0;
                    this._.fired(this, -1, 0, false);
                    this.repaint();
                }
                else
                    if(this.selectedIndex >= 0){
                        var prev = this.selectedIndex;
                        this.selectedIndex =  - 1;
                        this._.fired(this, -1, 0, false);
                        this.repaintRows(-1, prev);
                    }
            };

            this.select = function (row,b){
                if(this.isSelected(row) != b){
                    if(this.isMultiSelectEnabled()){
                        this.selected[row] = b ? 1 : 0;
                        this._.fired(this, row, 1, b);
                        this.repaintRows(row, row);
                    }
                    else{
                        if(this.selectedIndex >= 0) this.clearSelect();
                        if (b) {
                            this.selectedIndex = row;
                            this._.fired(this, row, 1, b);
                        }
                    }
                }
            };

            this.laidout = function () { this.vVisibility(); };

            this.mouseClicked  = function(e) { 
                if (this.$se(this.pressedRow, this.pressedCol, e)) this.pressedRow =  -1; 
            };
            
            this.mouseReleased = function(e) { 
                if (this.$se(this.pressedRow, this.pressedCol, e)) this.pressedRow =  -1; 
            };

            this.mousePressed = function(e){
                this.pressedRow =  -1;
                if(this.visibility.hasVisibleCells()){
                    this.stopEditing(true);
                    if(e.isActionMask()){
                        var p = this.cellByLocation(e.x, e.y);
                        if(p != null){
                            if(this.position != null){
                                var off = this.position.currentLine;
                                if(off == p[0]) this.calcOrigin(off, this.getRowY(off));
                                else{
                                    if(!e.isControlPressed()) this.clearSelect();
                                    this.position.setOffset(p[0]);
                                }
                            }

                            if(!this.$se(p[0], p[1], e)){
                                this.pressedRow = p[0];
                                this.pressedCol = p[1];
                            }
                        }
                    }
                }
            };

            this.calcPreferredSize = function (target){
                return { width : this.psWidth_  + ((this.leftCaption != null && this.leftCaption.isVisible) ? this.leftCaption.getPreferredSize().width : 0),
                         height: this.psHeight_ + ((this.topCaption != null && this.topCaption.isVisible) ? this.topCaption.getPreferredSize().height : 0) };
            };

            this.paintNet = function(g){
                var v = this.visibility, topX = v.fc[1] - this.lineSize, topY = v.fr[1] - this.lineSize,
                    botX = v.lc[1] + this.colWidths[v.lc[0]], botY = v.lr[1] + this.rowHeights[v.lr[0]],
                    prevWidth = g.lineWidth;

                g.setColor(this.lineColor);
                g.lineWidth = this.lineSize;
                g.beginPath();

                if (this.drawHorLines) {
                    var y = topY + this.lineSize/2;
                    for(var i = v.fr[0];i <= v.lr[0]; i ++ ){
                        g.moveTo(topX, y)
                        g.lineTo(botX, y);
                        y += this.rowHeights[i] + this.lineSize;
                    }
                    g.moveTo(topX, y);
                    g.lineTo(botX, y);
                }

                if (this.drawVerLines) {
                    topX += this.lineSize/2;
                    for(var i = v.fc[0];i <= v.lc[0]; i ++ ){
                        g.moveTo(topX, topY);
                        g.lineTo(topX, botY);
                        topX += this.colWidths[i] + this.lineSize;
                    }
                    g.moveTo(topX, topY);
                    g.lineTo(topX, botY);
                }
                g.stroke();
                g.lineWidth = prevWidth;
            };

            this.paintData = function(g){
                var y = this.visibility.fr[1] + this.cellInsetsTop, addW = this.cellInsetsLeft + this.cellInsetsRight,
                    addH = this.cellInsetsTop + this.cellInsetsBottom, ts = g.getTopStack(), cx = ts.x, cy = ts.y,
                    cw = ts.width, ch = ts.height, res = {};

                //!!!!
                //var desk = zebra.ui.findCanvas(this);
                // var can  = document.createElement("canvas")
                // var gg   = can.getContext("2d"), ggg = g, g = gg;
                // gg.init();
                // can.width  = this.visibility.lc[1] - this.visibility.fc[1];
                // can.height = this.visibility.lr[1] - y;
                // gg.fillStyle = "red";
                // gg.fillRect(0, 0, can.width, can.height);

                for(var i = this.visibility.fr[0];i <= this.visibility.lr[0] && y < cy + ch; i++){
                    if(y + this.rowHeights[i] > cy){
                        var x = this.visibility.fc[1] + this.cellInsetsLeft, notSelectedRow = this.isSelected(i) === false;

                        for(var j = this.visibility.fc[0];j <= this.visibility.lc[0]; j ++ ){
                            if (notSelectedRow){
                                var bg = this.provider.getCellColor(i, j);
                                if (bg != null){
                                    g.setColor(bg);
                                    g.fillRect(x - this.cellInsetsLeft, y - this.cellInsetsTop, this.colWidths[j], this.rowHeights[i]);
                                }
                            }

                            var v = (i == this.editingRow && j == this.editingCol) ? null
                                                                                   : this.provider.getView(i, j, this.dataToPaint(i, j));
                            if (v != null){
                                var w = this.colWidths[j] - addW, h = this.rowHeights[i] - addH;
                                MB.intersection(x, y, w, h, cx, cy, cw, ch, res);
                                if (res.width > 0 && res.height > 0) {
                                    if (this.isUsePsMetric) v.paint(g, x, y, w, h, this);
                                    else 
                                    {
                                        var ax = this.provider.getXAlignment(i, j), 
                                            ay = this.provider.getYAlignment(i, j),
                                            vw = w, vh = h, xx = x, yy = y, id = -1,
                                            ps = (ax != L.NONE || ay != L.NONE) ? v.getPreferredSize()
                                                                                : null;
                                        if (ax != L.NONE){
                                            xx = x + L.xAlignment(ps.width, ax, w);
                                            vw = ps.width;
                                        }

                                        if (ay != L.NONE){
                                            yy = y + L.yAlignment(ps.height, ay, h);
                                            vh = ps.height;
                                        }

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
            };

            this.paintMarker = function(g){
                var markerView = this.views["marker"];
                if (markerView != null && this.position != null && this.position.offset >= 0 && this.hasFocus()){
                    var offset = this.position.offset, v = this.visibility;
                    if (offset >= v.fr[0] && offset <= v.lr[0]){
                        g.clipRect(this.getLeftCaptionWidth() - this.scrollManager.getSX(),
                                   this.getTopCaptionHeight() - this.scrollManager.getSY(), this.width, this.height);

                        markerView.paint(g, v.fc[1], this.getRowY(offset),
                                        v.lc[1] - v.fc[1] + this.getColWidth(v.lc[0]),
                                        this.rowHeights[offset], this);
                    }
                }
            };

            this.paintSelection = function(g){
                if (this.editingRow >= 0) return;
                var v = this.views[this.hasFocus()?"onselection":"offselection"];
                if (v == null) return;

                for(var j = this.visibility.fr[0];j <= this.visibility.lr[0]; j ++ ){
                    if (this.isSelected(j)) {
                        var x = this.visibility.fc[1], y = this.getRowY(j), h = this.rowHeights[j];
                        //!!! this code below can be used to implement cell oriented selection
                        for(var i = this.visibility.fc[0];i <= this.visibility.lc[0]; i ++ ){
                            v.paint(g, x, y, this.colWidths[i], h, this);
                            x += this.colWidths[i] + this.lineSize;
                        }
                    }
                }
            };

            this.rPsMetric = function(){
                var cols = this.getGridCols(), rows = this.getGridRows();
                if (this.colWidths == null || this.colWidths.length != cols) this.colWidths = arr(cols, 0);
                if (this.rowHeights == null || this.rowHeights.length != rows) this.rowHeights = arr(rows, 0);
                var addW = this.cellInsetsLeft + this.cellInsetsRight,
                    addH = this.cellInsetsTop + this.cellInsetsBottom;

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
                        else {
                            if ( pkg.Grid.DEF_COLWIDTH > this.colWidths [i]) this.colWidths [i] = pkg.Grid.DEF_COLWIDTH;
                            if ( pkg.Grid.DEF_ROWHEIGHT > this.rowHeights[j]) this.rowHeights[j] = pkg.Grid.DEF_ROWHEIGHT;
                        }
                    }
                }
            };

            this.getPSSize = function (rowcol,b){
                if (this.isUsePsMetric) return b ? this.getRowHeight(rowcol) : this.getColWidth(rowcol);
                else {
                    var max = 0, count = b ? this.getGridCols() : this.getGridRows();
                    for(var j = 0;j < count; j ++ ){
                        var r = b ? rowcol : j, c = b ? j : rowcol,
                            v = this.provider.getView(r, c, this.model.get(r, c));

                        if(v != null){
                            var ps = v.getPreferredSize();
                            if(b){
                                if(ps.height > max) max = ps.height;
                            }
                            else {
                                if(ps.width > max) max = ps.width;
                            }
                        }
                    }
                    return max + this.lineSize * 2 + (b ? this.cellInsetsTop + this.cellInsetsBottom : this.cellInsetsLeft + this.cellInsetsRight);
                }
            };

            this.rCustomMetric = function(){
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

                for(; start < this.colWidths.length; start ++ ) {
                    this.colWidths[start] = pkg.Grid.DEF_COLWIDTH;
                }

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
                for(; start < this.rowHeights.length; start ++ ) this.rowHeights[start] = pkg.Grid.DEF_ROWHEIGHT;
            };

            this.pageSize = function(d){
                this.validate();
                if (this.visibility.hasVisibleCells()){
                    var off = this.position.offset;
                    if(off >= 0){
                        var hh = this.visibleArea.height - this.getTopCaptionHeight(), sum = 0, poff = off;
                        for(; off >= 0 && off < this.getGridRows() && sum < hh; sum += this.rowHeights[off] + this.lineSize,off += d);
                        return Math.abs(poff - off);
                    }
                }
                return 0;
            };

            this.setRowHeight = function(row,h){
                if(h < 0) throw new Error("Invalid row height: " + h);

                if (this.isUsePsMetric === false){
                    this.validateMetric();
                    if(this.rowHeights[row] != h){
                        this.stopEditing(false);
                        this.psHeight_ += (h - this.rowHeights[row]);
                        this.rowHeights[row] = h;
                        this.cachedHeight = this.getTop() + this.getBottom() + this.psHeight_ +
                                            ((this.topCaption != null && this.topCaption.isVisible) ? this.topCaption.getPreferredSize().height : 0);
                        if(this.parent != null) this.parent.invalidate();
                        this.iRowVisibility(0);
                        this.invalidateLayout();
                        this.repaint();
                    }
                }
            };

            this.setColWidth = function (col,w){
                if (w < 0) throw new Error("Invalid col width: " + w);

                if( !this.isUsePsMetric){
                    this.validateMetric();
                    if(this.colWidths[col] != w){
                        this.stopEditing(false);
                        this.psWidth_ += (w - this.colWidths[col]);
                        this.colWidths[col] = w;
                        this.cachedWidth = this.getRight() + this.getLeft() +
                                           this.psWidth_ + ((this.leftCaption != null && this.leftCaption.isVisible) ? this.leftCaption.getPreferredSize().width : 0);
                        if(this.parent != null) this.parent.invalidate();
                        this.iColVisibility(0);
                        this.invalidateLayout();
                        this.repaint();
                    }
                }
            };
        },

        function (rows, cols){ this.$this(new Matrix(rows, cols)); },
        function (){ this.$this(new Matrix(5, 5)); },

        function (model){
            this.psWidth_ = this.psHeight_ = this.colOffset = this.rowOffset = this.pressedCol = this.selectedIndex = 0;
            this.visibleArea = this.selected = null;
            this._ = new Listeners();
            this.views = {};

            this.editingRow = this.editingCol = this.pressedRow = -1;
            this.editors = this.leftCaption = this.topCaption = this.colWidths = this.rowHeights = null;
            this.position = this.stub = null;
            this.visibility = new CellsVisibility();

            this.$super();

            this.add(L.NONE, new pkg.Grid.CornerPan());
            this.setModel(model);
            this.setViewProvider(new pkg.DefViews());
            this.setPosition(new Position(this));
            this.scrollManager = new ui.ScrollManager(this);
        },

        function setHeader(constr, titles) {
            var cap = new pkg.GridCaption(this);
            this.add(constr, cap);
            if (titles != null) {
                for (var i = 0; i < titles.length; i++) cap.putTitle(i, titles[i]);
            }
            return cap;
        },

        function focused(){ 
            this.$super();
            this.repaint(); 
        },

        function enableMultiSelect(b){
            if(b != this.isMultiSelectEnabled()){
                this.selected = b ? arr(this.getGridRows(), false) : null;
                this.repaint();
            }
        },

        function setEditorProvider(p){
            if(p != this.editors){
                this.stopEditing(true);
                this.editors = p;
            }
        },

        function setUsePsMetric(b){
            if (this.isUsePsMetric != b){
                this.isUsePsMetric = b;
                this.vrp();
            }
        },

        function setPosition(p){
            if(this.position != p){
                if (this.position != null)this.position._.remove(this);
                this.position = p;
                if(this.position != null){
                    this.position._.add(this);
                    this.position.setPositionMetric(this);
                }
                this.repaint();
            }
        },

        function setViewProvider(p){
            if(this.provider != p){
                this.provider = p;
                this.vrp();
            }
        },

        function setModel(d){
            if (d != this.model){
                this.clearSelect();
                if (Array.isArray(d)) d = new Matrix(d);
                if(this.model != null && this.model._) this.model._.remove(this);
                this.model = d;
                if (this.model != null && this.model._) this.model._.add(this);
                if (this.position != null) this.position.clearPos();
                if (this.model != null && this.selected != null) this.selected = arr(this.model.rows, false);
                this.vrp();
            }
        },

        function setCellInsets(t,l,b,r){
            var nt = (t < 0) ? this.cellInsetsTop : t, nl = (l < 0) ? this.cellInsetsLeft : l,
                nb = (b < 0) ? this.cellInsetsBottom : b, nr = (r < 0) ? this.cellInsetsRight : r;

            if (nt != this.cellInsetsTop || nl != this.cellInsetsLeft ||
                nb != this.cellInsetsBottom || nr != this.cellInsetsRight)
            {
                this.cellInsetsTop = nt;
                this.cellInsetsLeft = nl;
                this.cellInsetsBottom = nb;
                this.cellInsetsRight = nr;
                this.vrp();
            }
        },

        function matrixResized(target,prevRows,prevCols){
            this.clearSelect();
            if (this.selected != null) this.selected = arr(this.model.rows, false);
            this.vrp();
            if (this.position != null) this.position.clearPos();
        },

        function cellModified(target,row,col,prevValue) {
            if (this.isUsePsMetric) this.invalidate();
        },

        function invalidate(){
            this.$super();
            this.iColVisibility(0);
            this.iRowVisibility(0);
        },

        function setLineColor(c){
            if (c != this.lineColor){
                this.lineColor = c;
                if (this.drawVerLines || this.drawHorLines) this.repaint();
            }
        },

        function kidAdded(index,id,c){
            this.$super(index, id, c);
            if (L.TOP == id){
                this.topCaption = c;
                if (zebra.instanceOf(c, pkg.GridCaption)) c.setup(this, L.HORIZONTAL);
            }
            else {
                if (L.TEMPORARY == id) this.editor = c;
                else {
                    if (L.LEFT == id){
                        this.leftCaption = c;
                        if (zebra.instanceOf(c, pkg.GridCaption)) c.setup(this, L.VERTICAL);
                    }
                    else if (L.NONE === id) this.stub = c;
                }
            }
        },

        function kidRemoved(index,c){
            this.$super(index, c);
            if(c == this.editor) this.editor = null;
            else {
                if(c == this.topCaption){
                    if(zebra.instanceOf(c, pkg.GridCaption)) c.setup(null, L.HORIZONTAL);
                    this.topCaption = null;
                }
                else {
                    if(c == this.leftCaption){
                        if(zebra.instanceOf(c, pkg.GridCaption)) c.setup(null, L.VERTICAL);
                        this.leftCaption = null;
                    }
                    else if(c == this.stub) this.stub = null;
                }
            }
        },

        function setLineSize(s){
            if (s != this.lineSize){
                this.lineSize = s;
                this.vrp();
            }
        },

        function startEditing(row,col){
            this.stopEditing(true);
            if(this.editors != null){
                var editor = this.editors.getEditor(this, row, col, this.getDataToEdit(row, col));
                if (editor != null){
                    this.editingRow = row;
                    this.editingCol = col;
                    if (zebra.instanceOf(editor, ExternalEditor)) {
                        var p = L.getAbsLocation(this.getColX(col) + this.scrollManager.getSX(), this.getRowY(row) + this.scrollManager.getSY(), this);
                        editor.setLocation(p[0], p[1]);
                        ui.makeFullyVisible(ui.findCanvas(this), editor);
                        this.editor = editor;
                        ui.findCanvas(this).getLayer(WinLayer.ID).addWin(WinLayer.MODAL, editor, this);
                    }
                    else{
                        this.add(L.TEMPORARY, editor);
                        this.repaintRows(this.editingRow, this.editingRow);
                    }
                    ui.focusManager.requestFocus(editor);
                    return true;
                }
            }
            return false;
        },

        function getEditingCell(){
            return (this.editingRow >= 0 && this.editingCol >= 0) ? [this.editingRow, this.editingCol] : null;
        },

        function winOpened(winLayer,target,b){
            if (this.editor == target &&  b === false) this.stopEditing(this.editor.isAccepted());
        },

        function winActivated(winLayer,target,b){},
        function getDataToEdit(row,col){ return this.model.get(row, col); },
        function setEditedData(row,col,value){ this.model.put(row, col, value); }
]);
pkg.Grid.prototype.setViews = ui.$ViewsSetter;

pkg.GridStretchPan = Class(ui.Panel, zebra.layout.Layout, [
    function $prototype() {
        this.calcPreferredSize = function (target){
            this.recalcPS();
            return (target.kids.length === 0 || !target.grid.isVisible) ? { width:0, height:0 }
                                                                        : { width:this.strPs.width, 
                                                                            height:this.strPs.height };
        };

        this.doLayout = function(target){
            this.recalcPS();
            if (target.kids.length > 0){
                var grid = this.grid;
                if (grid.isVisible){
                    var left = target.getLeft(), top = target.getTop();
                    grid.setLocation(left, top);
                    grid.setSize(target.width  - left - target.getRight(),
                                 target.height - top  - target.getBottom());

                    for(var i = 0; i < this.widths.length; i++) {
                        grid.setColWidth(i, this.widths[i]);
                    }

                    if (this.heights != null){
                        for(var i = 0;i < this.heights.length; i++) {
                            grid.setRowHeight(i, this.heights[i]);
                        }
                    }
                }
            }
        };

        this.captionResized = function(src, col, pw){
            var grid = this.grid;
            if (col < this.widths.length - 1){
                var w = grid.getColWidth(col), dt = w - pw;
                if (dt < 0) grid.setColWidth(col + 1, grid.getColWidth(col + 1) - dt);
                else {
                    var ww = grid.getColWidth(col + 1) - dt, mw = this.getMinWidth();
                    if (ww < mw) {
                        grid.setColWidth(col, w - (mw - ww));
                        grid.setColWidth(col + 1, mw);
                    }
                    else grid.setColWidth(col + 1, ww);
                }
                this.proportions = null;
            }
        };

        this.calcColProportions = function (targetAreaW,targetAreaH){
            var g = this.grid, cols = g.getGridCols(), sw = 0;
            for(var i = 0;i < cols; i++){
                var w = g.getColWidth(i);
                if (w === 0) w = g.getColPSWidth(i);
                sw += w;
            }

            var props = Array(cols);
            for(var i = 0;i < cols; i++){
                var w = g.getColWidth(i);
                if (w === 0) w = g.getColPSWidth(i);
                props[i] = w / sw;
            }
            return props;
        };

        this.calcRowHeights = function(targetAreaW,targetAreaH,widths) { 
            return null;
        };

        this.getMinWidth = function (){
            return zebra.instanceOf(this.grid.topCaption, pkg.GridCaption) ? this.grid.topCaption.minSize
                                                                           : 10;
        };

        this.calcColWidths = function (targetAreaW,targetAreaH){
            var grid = this.grid, w = Array(grid.getGridCols()),
                ew = targetAreaW - (this.proportions.length + 1) * grid.lineSize, sw = 0;

            for(var i = 0; i < this.proportions.length; i++){
                if (this.proportions.length - 1 == i) w[i] = ew - sw;
                else {
                    var cw = (ew * this.proportions[i]);
                    w[i] = cw;
                    sw += cw;
                }
            }
            return w;
        };

        this.recalcPS = function (){
            var grid = this.grid;
            if (grid == null || grid.isVisible === false) return;

            var p = this.parent, isScr = zebra.instanceOf(p, ui.ScrollPan),
                taWidth   = (isScr ? p.width - p.getLeft() - p.getRight() - this.getRight() - this.getLeft()
                                   : this.width - this.getRight() - this.getLeft()),
                taHeight = (isScr  ? p.height - p.getTop() - p.getBottom() - this.getBottom() - this.getTop()
                                   : this.height - this.getBottom() - this.getTop());

            if (this.strPs != null && this.prevTargetAreaSize.width == taWidth &&
                                      this.prevTargetAreaSize.height == taHeight  ) {
                return;
            }

            if (this.proportions == null || this.proportions.length != grid.getGridCols()) {
                this.proportions = this.calcColProportions(taWidth, taHeight);
            }

            this.prevTargetAreaSize.width = taWidth;
            this.prevTargetAreaSize.height = taHeight;
            this.widths  = this.calcColWidths (taWidth, taHeight);
            this.heights = this.calcRowHeights(taWidth, taHeight, this.widths);
            this.strPs = this.summarizePS(taWidth, taHeight, this.widths, this.heights);

            if (isScr === true && p.height > 0 && p.vBar && taHeight < this.strPs.height){
                taWidth -= p.vBar.getPreferredSize().width;
                this.widths  = this.calcColWidths(taWidth, taHeight);
                this.heights = this.calcRowHeights(taWidth, taHeight, this.widths);
                this.strPs   = this.summarizePS(taWidth, taHeight, this.widths, this.heights);
            }
        };

        this.summarizePS = function (targetAreaW,targetAreaH,widths,heights){
            var ps = { width: targetAreaW, height:0 }, grid = this.grid;
            if (heights != null){
                for(var i = 0;i < heights.length; i++) ps.height += heights[i];
                if (grid.topCaption != null && grid.topCaption.isVisible) {
                    ps.height += grid.topCaption.getPreferredSize().height;
                }
                ps.height += (grid.getTop() + grid.getBottom());
            }
            else ps.height = grid.getPreferredSize().height;
            return ps;
        };
    },

    function (grid){
        this.$super(this);
        this.heights = [];
        this.widths  = [];
        this.grid = grid;
        this.proportions = this.strPs = null;
        this.prevTargetAreaSize = { width:0, height:0 };
        this.add(grid);
    },

    function kidAdded(index,constr,l){
        this.proportions = null;
        if (l.topCaption != null) l.topCaption._.add(this);
        this.scrollManager = l.scrollManager;
        this.$super(index, constr, l);
    },

    function kidRemoved(i,l){
        this.proportions = null;
        if(l.topCaption != null) l.topCaption._.remove(this);
        this.scrollManager = null;
        this.$super(i, l);
    },

    function invalidate(){
        this.strPs = null;
        this.$super();
    }
]);

pkg.GridCapView = Class(ui.View, [
    function $prototype() {
        this.paint = function(g,x,y,w,h,d) {
            if (d.orient == L.HORIZONTAL) {
                if (this.hgradient == null) {
                    this.hgradient = new ui.Gradient(this.color1, this.color2,  L.VERTICAL);       
                }
                this.hgradient.paint(g,x,y,w,h,d);
                g.setColor(this.lineColor1);
                g.drawLine(x + w, y, x + w, y + h);
                g.setColor(this.lineColor2);
                g.drawLine(x, y, x + w, y);
            }
            else {
                if (this.vgradient == null) {
                    this.vgradient = new ui.Gradient(this.color1, this.color2,  L.HORIZONTAL);       
                }
                this.vgradient.paint(g,x,y,w,h,d);
                g.setColor(this.lineColor1);
                g.drawLine(x, y + h, x + w, y + h);
                g.setColor(this.lineColor2);
                g.drawLine(x, y, x, y + h);
            }
        };
    },

    function() {
        this.$this("rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.0)");
    },

    function(col1, col2) {
        this.gap = 6;
        this.color1 = col1;
        this.color2 = col2;
        this.lineColor1 = "black";
        this.lineColor2 = "#CCCCCC";
    }
]);

})(zebra("ui.grid"), zebra.Class, zebra("ui"));

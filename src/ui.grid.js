(function(pkg, Class, ui) {


//      ---------------------------------------------------
//      | x |    col0 width     | x |   col2 width    | x |
//      .   .
//    Line width
//   -->.   .<--

/**
 * The package contains number of classes and interfaces to implement
 * UI Grid component. The grid allows developers to visualize matrix
 * model, customize the model data editing and rendering.
 * @module ui.grid
 * @main
 */

var Matrix = zebra.data.Matrix, L = zebra.layout, MB = zebra.util,
    Cursor = ui.Cursor, Position = zebra.util.Position, KE = ui.KeyEvent,
    Listeners = zebra.util.Listeners;

//!!! crappy function
//TODO: think how to remove/replace it
function arr(l, v) {
    var a = Array(l);
    for(var i=0; i<l; i++) a[i] = v;
    return a;
}

function CellsVisibility() {
    this.hasVisibleCells = function(){
        return this.fr != null && this.fc != null &&
               this.lr != null && this.lc != null   ;
    };

    // first visible row (row and y), first visible
    // col, last visible col and row
    this.fr = this.fc = this.lr = this.lc = null;
}

/**
 *  Interface that describes a grid component metrics
 *  @class zebra.ui.grid.Metrics
 */
pkg.Metrics = zebra.Interface();

/**
 * Get the given column width of a grid component
 * @param {Integer} col a column index
 * @method getColWidth
 * @return {Integer} a column width
 */

/**
 * Get the given row height of a grid component
 * @param {Integer} row a row index
 * @method getRowHeight
 * @return {Integer} a row height
 */

/**
 * Get the given row preferred height of a grid component
 * @param {Integer} row a row index
 * @method getPSRowHeight
 * @return {Integer} a row preferred height
 */

/**
 * Get the given column preferred width of a grid component
 * @param {Integer} col a column index
 * @method getPSColWidth
 * @return {Integer} a column preferred width
 */

 /**
  * Get a x origin of a grid component. Origin indicates how
  * the grid component content has been scrolled
  * @method getXOrigin
  * @return {Integer} a x origin
  */

/**
  * Get a y origin of a grid component. Origin indicates how
  * the grid component content has been scrolled
  * @method getYOrigin
  * @return {Integer} a y origin
  */

  /**
   * Set the given column width of a grid component
   * @param {Integer} col a column index
   * @param {Integer} w a column width
   * @method setColWidth
   */

  /**
   * Set the given row height of a grid component
   * @param {Integer} row a row index
   * @param {Integer} h a row height
   * @method setRowHeight
   */

  /**
   * Get number of columns in a grid component
   * @return {Integer} a number of columns
   * @method getGridCols
   */

  /**
   * Get number of rows in a grid component
   * @return {Integer} a number of rows
   * @method getGridRows
   */

   /**
    * Get a structure that describes a grid component
    * columns and rows visibility
    * @return {zebra.ui.grid.CellsVisibility} a grid cells visibility
    * @method getCellsVisibility
    */

  /**
   * Grid line size
   * @attribute lineSize
   * @type {Integer}
   * @readOnly
   */

  /**
   * Indicate if a grid sizes its rows and cols basing on its preferred sizes
   * @attribute isUsePsMetric
   * @type {Boolean}
   * @readOnly
   */

/**
 * Default grid cell views provider. The class rules how a grid cell content,
 * background has to be rendered and aligned. Developers can implement an own
 * views providers and than setup it for a grid by calling "setViewProvider(...)"
 * method.
 * @param {zebra.ui.TextRender|zebra.ui.StringText} [render] a string render
 * @class zebra.ui.grid.DefViews
 * @constructor
 */
pkg.DefViews = Class([
    function $prototype() {
        this[''] = function(render){
            /**
             * Default render that is used to paint grid content.
             * @type {zebra.ui.StringRender}
             * @attribute render
             * @readOnly
             * @protected
             */
            this.render = (render == null ? new ui.StringRender("") : render);
            zebra.properties(this, this.$clazz);
        };

        /**
         * Set the default view provider text render font
         * @param {zebra.ui.Font} f a font
         * @method setFont
         */
        this.setFont = function(f) {
            this.render.setFont(f);
        };

        /**
         * Set the default view provider text render color
         * @param {String} c a color
         * @method setColor
         */
        this.setColor = function(c) {
            this.render.setColor(c);
        };

        /**
         * Get a renderer to draw the specified grid model value.
         * @param  {zebra.ui.grid.Grid} target a target Grid component
         * @param  {Integer} row  a grid cell row
         * @param  {Integer} col  a grid cell column
         * @param  {Object} obj   a model value for the given grid cell
         * @return {zebra.ui.View}  an instance of zebra view to be used to
         * paint the given cell model value
         * @method  getView
         */
        this.getView = function(target, row,col,obj){
            if (obj != null){
                if (obj && obj.paint) return obj;
                this.render.setValue(obj.toString());
                return this.render;
            }
            return null;
        };

        /**
         * Get an horizontal alignment a content in the given grid cell
         * has to be adjusted. The method is optional.
         * @param  {zebra.ui.grid.Grid} target a target grid component
         * @param  {Integer} row   a grid cell row
         * @param  {Integer} col   a grid cell column
         * @return {Integer}  a horizontal alignment (zebra.layout.LEFT, zebra.layout.CENTER, zebra.layout.RIGHT)
         * @method  getXAlignment
         */

         /**
          * Get a vertical alignment a content in the given grid cell
          * has to be adjusted. The method is optional.
          * @param  {zebra.ui.grid.Grid} target a target grid component
          * @param  {Integer} row   a grid cell row
          * @param  {Integer} col   a grid cell column
          * @return {Integer}  a vertical alignment (zebra.layout.TOP, zebra.layout.CENTER, zebra.layout.BOTTOM)
          * @method  getYAlignment
          */

         /**
          * Get the given grid cell color
          * @param  {zebra.ui.grid.Grid} target a target grid component
          * @param  {Integer} row   a grid cell row
          * @param  {Integer} col   a grid cell column
          * @return {String}  a cell color to be applied to the given grid cell
          * @method  getCellColor
          */
    }
]);

/**
 * Simple grid cells editors provider implementation. By default the editors provider
 * uses a text field component or check box component as a cell content editor. Check
 * box component is used if a cell data type is boolean, otherwise text filed is applied
 * as the cell editor.

        // grid with tree columns and three rows
        // first and last column will be editable with text field component
        // second column will be editable with check box component
        var grid = new zebra.ui.grid.Grid([
            ["Text Cell", true, "Text cell"],
            ["Text Cell", false, "Text cell"],
            ["Text Cell", true, "Text cell"]
        ]);

        // make grid cell editable
        grid.setEditorProvider(new zebra.ui.grid.DefEditors());


 * It is possible to customize a grid column editor by specifying setting "editors[col]" property
 * value. You can define an UI component that has to be applied as an editor for the given column
 * Also you can disable editing by setting appropriate column editor class to null:

        // grid with tree columns and three rows
        // first and last column will be editable with text field component
        // second column will be editable with check box component
        var grid = new zebra.ui.grid.Grid([
            ["Text Cell", true, "Text cell"],
            ["Text Cell", false, "Text cell"],
            ["Text Cell", true, "Text cell"]
        ]);

        // grid cell editors provider
        var editorsProvider = new zebra.ui.grid.DefEditors();

        // disable the first column editing
        editorsProvider.editors[0] = null;

        // make grid cell editable
        grid.setEditorProvider(editorsProvider);

 * @constructor
 * @class zebra.ui.grid.DefEditors
 */
pkg.DefEditors = Class([
    function $clazz() {
        this.TextField = Class(ui.TextField, []);
        this.Checkbox  = Class(ui.Checkbox,  []);
        this.Combo     = Class(ui.Combo,     []);
    },

    function $prototype() {
        this[''] = function() {
            this.textEditor = new this.$clazz.TextField("", 150);
            this.boolEditor = new this.$clazz.Checkbox(null);
            this.selectorEditor = new this.$clazz.Combo();
            this.editors    = {};
        };

        /**
         * Fetch an edited value from the given UI editor component.
         * @param  {zebra.ui.grid.Grid} grid a target grid component
         * @param  {Integer} row a grid cell row that has been edited
         * @param  {Integer} col a grid cell column that has been edited
         * @param  {Object} data an original cell content
         * @param  {zebra.ui.Panel} editor an editor that has been used to
         * edit the given cell
         * @return {Object} a value that can be applied as a new content of
         * the edited cell content
         * @method  fetchEditedValue
         */
        this.fetchEditedValue = function(grid,row,col,data,editor) {
            return editor.getValue();
        };

        /**
         * Get an editor UI component to be used for the given cell of the specified grid
         * @param  {zebra.ui.grid.Grid} grid a grid whose cell is going to be edited
         * @param  {Integer} row  a grid cell row
         * @param  {Integer} col  a grid cell column
         * @param  {Object}  v    a grid cell model data
         * @return {zebra.ui.Panel} an editor UI component to be used to edit the given cell
         * @method  getEditor
         */
        this.getEditor = function(grid, row, col, v) {
            var editor = null;
            if (this.editors[col] === null) return;

            if (this.editors[col] != null) {
                editor = this.editors[col];
            }
            else {
                editor = zebra.isBoolean(v) ? this.boolEditor : this.textEditor;
            }

            editor.setValue(v);
            editor.setPadding(0);
            var ah = ~~((grid.getRowHeight(row) - editor.getPreferredSize().height)/2);
            editor.setPadding(ah, grid.cellInsetsLeft, ah, grid.cellInsetsRight);
            return editor;
        };

        /**
         * Test if the specified input event has to trigger the given grid cell editing
         * @param  {zebra.ui.grid.Grid} grid a grid
         * @param  {Integer} row  a grid cell row
         * @param  {Integer} col  a grid cell column
         * @param  {zebra.ui.InputEvent} e  an event to be evaluated
         * @return {Boolean} true if the given input event triggers the given cell editing
         * @method shouldStart
         */
        this.shouldStart = function(grid,row,col,e){
            return e.ID == ui.MouseEvent.CLICKED && e.clicks == 1;
        };

        /**
         * Test if the specified input event has to canceling the given grid cell editing
         * @param  {zebra.ui.grid.Grid} grid a grid
         * @param  {Integer} row  a grid cell row
         * @param  {Integer} col  a grid cell column
         * @param  {zebra.ui.InputEvent} e  an event to be evaluated
         * @return {Boolean} true if the given input event triggers the given cell editing
         * cancellation
         * @method shouldCancel
         */
        this.shouldCancel = function(grid,row,col,e){
            return e.ID == KE.PRESSED && KE.ESCAPE == e.code;
        };

        /**
         * Test if the specified input event has to trigger finishing the given grid cell editing
         * @param  {zebra.ui.grid.Grid} grid [description]
         * @param  {Integer} row  a grid cell row
         * @param  {Integer} col  a grid cell column
         * @param  {zebra.ui.InputEvent} e  an event to be evaluated
         * @return {Boolean} true if the given input event triggers finishing the given cell editing
         * @method shouldFinish
         */
        this.shouldFinish = function(grid,row,col,e){
            return e.ID == KE.PRESSED && KE.ENTER  == e.code;
        };
    }
]);

pkg.CaptionListeners = new zebra.util.ListenersClass("captionResized");

/**
 * Grid caption base UI component class. This class has to be used
 * as base to implement grid caption components
 * @class  zebra.ui.grid.BaseCaption
 * @extends {zebra.ui.Panel}
 * @constructor
 * @param {Array} [titles] a caption component titles
 */

/**
 * Fire when a grid row selection state has been changed

        caption.bind(function captionResized(caption, rowcol, phw) {
            ...
        });

 * @event captionResized
 * @param  {zebra.ui.grid.BaseCaption} caption a caption
 * @param  {Integer} rowcol a row or column that has been resized
 * @param  {Integer} pwh a a previous row or column size
 */

pkg.BaseCaption = Class(ui.Panel, [
    function $prototype() {
        /**
         * Minimal possible grid cell size
         * @type {Number}
         * @default 10
         * @attribute minSize
         */
        this.minSize = 10;

        /**
         * Size of the active area where cells size can be changed by mouse dragging event
         * @attribute activeAreaSize
         * @type {Number}
         * @default 5
         */
        this.activeAreaSize = 5;

        /**
         * Caption line color
         * @attribute lineColor
         * @type {String}
         * @default "gray"
         */
        this.lineColor = "gray";

        /**
         * Indicate if the grid cell size has to be adjusted according
         * to the cell preferred size by mouse double click event.
         * @attribute isAutoFit
         * @default true
         * @type {Boolean}
         */

        /**
         * Indicate if the grid cells are resize-able.
         * to the cell preferred size by mouse double click event.
         * @attribute isResizable
         * @default true
         * @type {Boolean}
         */
        this.isAutoFit = this.isResizable = true;

        this.getCursorType = function (target,x,y){
            return this.metrics != null     &&
                   this.selectedColRow >= 0 &&
                   this.isResizable         &&
                   this.metrics.isUsePsMetric === false ? ((this.orient == L.HORIZONTAL) ? Cursor.W_RESIZE
                                                                                         : Cursor.S_RESIZE)
                                                        : null;
        };

        /**
         * Define mouse dragged events handler.
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseDragged
         */
        this.mouseDragged = function(e){
            if (this.pxy != null) {
                var b  = (this.orient == L.HORIZONTAL),
                    rc = this.selectedColRow,
                    ns = (b ? this.metrics.getColWidth(rc) + e.x
                            : this.metrics.getRowHeight(rc) + e.y) - this.pxy;

                this.captionResized(rc, ns);

                if (ns > this.minSize) {
                    this.pxy = b ? e.x : e.y;
                }
            }
        };

        /**
         * Define mouse drag started events handler.
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseDragStarted
         */
        this.mouseDragStarted = function(e){
            if (this.metrics != null &&
                this.isResizable     &&
                this.metrics.isUsePsMetric === false)
            {
                this.calcRowColAt(e.x, e.y);

                if (this.selectedColRow >= 0) {
                    this.pxy = (this.orient == L.HORIZONTAL) ? e.x
                                                             : e.y;
                }
            }
        };

        /**
         * Define mouse drag ended events handler.
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseDragEnded
         */
        this.mouseDragEnded = function (e){
            if (this.pxy != null) {
                this.pxy = null;
            }

            if (this.metrics != null) {
                this.calcRowColAt(e.x, e.y);
            }
        };

        /**
         * Define mouse moved events handler.
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseMoved
         */
        this.mouseMoved = function(e) {
            if (this.metrics != null) {
                this.calcRowColAt(e.x, e.y);
            }
        };

        /**
         * Define mouse clicked events handler.
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseClicked
         */
        this.mouseClicked = function (e){
            if (this.pxy     == null     &&
                this.metrics != null     &&
                e.clicks > 1             &&
                this.selectedColRow >= 0 &&
                this.isAutoFit === true     )
            {
                var size = this.getCaptionPS(this.selectedColRow);
                if (this.orient == L.HORIZONTAL) {
                    this.metrics.setColWidth (this.selectedColRow, size);
                }
                else {
                    this.metrics.setRowHeight(this.selectedColRow, size);
                }
                this.captionResized(this.selectedColRow, size);
            }
        };

        /**
         * Get the given row or column caption preferred size
         * @param  {Integer} rowcol a row or column of a caption
         * @return {Integer}  a size of row or column caption
         * @method getCaptionPS
         */
        this.getCaptionPS = function(rowcol) {
            return (this.orient == L.HORIZONTAL) ? this.metrics.getColPSWidth(this.selectedColRow)
                                                 : this.metrics.getRowPSHeight(this.selectedColRow);
        };

        this.captionResized = function(rowcol, ns) {
            if (ns > this.minSize) {
                if (this.orient == L.HORIZONTAL) {
                    var pw = this.metrics.getColWidth(rowcol);
                    this.metrics.setColWidth(rowcol, ns);
                    this._.captionResized(this, rowcol, pw);
                }
                else  {
                    var ph = this.metrics.getRowHeight(rowcol);
                    this.metrics.setRowHeight(rowcol, ns);
                    this._.captionResized(this, rowcol, ph);
                }
            }
        };

        this.calcRowColAt = function(x, y){
            var $this = this;
            this.selectedColRow = this.getCaptionAt(x, y, function(m, xy, xxyy, wh, i) {
                xxyy += (wh + m.lineSize);
                return (xy < xxyy + $this.activeAreaSize &&
                        xy > xxyy - $this.activeAreaSize   );

            });
        };

        /**
         * Compute a column (for horizontal caption component) or row (for
         * vertically aligned caption component) at the given location
         * @param  {Integer} x a x coordinate
         * @param  {Integer} y an y coordinate
         * @param  {Function} [f] an optional match function. The method can be passed
         * if you need to detect a particular area of row or column. The method gets
         * a grid metrics as the first argument, a x or y location to be detected,
         * a row or column y or x coordinate, a row or column height or width and
         * row or column index. The method has to return true if the given location
         * is in.
         * @return {Integer}  a row or column
         * @method calcRowColAt
         */
        this.getCaptionAt = function (x,y,f){
            if (this.metrics != null &&
                x >= 0               &&
                y >= 0               &&
                x < this.width       &&
                y < this.height        )
            {
                var m     = this.metrics,
                    cv    = m.getCellsVisibility(),
                    isHor = (this.orient == L.HORIZONTAL);

                if ((isHor && cv.fc != null) || (isHor === false && cv.fr != null)) {
                    var gap  = m.lineSize,
                        xy   = isHor ? x : y,
                        xxyy = isHor ? cv.fc[1] - this.x - gap + m.getXOrigin()
                                     : cv.fr[1] - this.y - gap + m.getYOrigin();

                    for(var i = (isHor ? cv.fc[0] : cv.fr[0]);i <= (isHor ? cv.lc[0] : cv.lr[0]); i ++ ){
                        var wh = isHor ? m.getColWidth(i) : m.getRowHeight(i);
                        if ((f != null && f(m, xy, xxyy, wh, i)) || (f == null && xy > xxyy && xy < xxyy + wh)) {
                            return i;
                        }
                        xxyy += wh + gap;
                    }
                }
            }
            return -1;
        };

        this.paintOnTop = function(g) {
            if (this.lineColor != null && this.metrics != null) {
                var v = this.metrics.getCellsVisibility();
                if (v != null) {
                    var m       = this.metrics,
                        b       = this.orient == L.HORIZONTAL,
                        startRC = b ? v.fc[0] : v.fr[0],
                        endRC   = b ? v.lc[0] : v.lr[0],
                        xy      = b ? v.fc[1] - this.x - m.lineSize + m.getXOrigin()
                                    : v.fr[1] - this.y - m.lineSize + m.getYOrigin();

                    g.setColor(this.lineColor);
                    for(var i = startRC; i <= endRC; i++) {
                        if (i !== 0) {
                            if (b) g.drawLine(xy, 0, xy, this.height, m.lineSize);
                            else   g.drawLine(0, xy, this.width, xy, m.lineSize);
                        }
                        xy += (b ? m.getColWidth(i): m.getRowHeight(i)) + m.lineSize;
                    }
                }
            }
        };

        /**
         * Implement the method to be aware when number of rows or columns in
         * a grid model has been updated
         * @param  {zebra.ui.grid.Grid} target a target grid
         * @param  {Integer} prevRows a previous number of rows
         * @param  {Integer} prevCols a previous number of columns
         * @method matrixResized
         */

        /**
         * Implement the method to be aware when a grid model data has been
         * re-ordered.
         * @param  {zebra.ui.grid.Grid} target a target grid
         * @param  {Object} sortInfo an order information
         * @method matrixSorted
         */
    },

    function(titles) {
        this._ = new pkg.CaptionListeners();
        this.orient = this.metrics = this.pxy = null;
        this.selectedColRow = -1;
        this.$super();
        if (titles != null) {
            for(var i=0; i < titles.length; i++) {
                this.putTitle(i, titles[i]);
            }
        }
    },

    function setParent(p) {
        this.$super(p);

        this.metrics = this.orient = null;
        if (p == null || zebra.instanceOf(p, pkg.Metrics)) {
            this.metrics = p;
            if (this.constraints != null) {
                this.orient = (this.constraints == L.TOP    ||
                               this.constraints == L.BOTTOM   ) ? L.HORIZONTAL
                                                                : L.VERTICAL;
            }
        }
    }
]);

/**
 * Grid caption class that implements rendered caption.
 * Rendered means all caption titles, border are painted
 * as a number of views.
 * @param  {Array} [titles] a caption titles. Title can be a string or
 * a zebra.ui.View class instance
 * @param  {zebra.ui.StringRender|zebra.ui.TextRender} [render] a text render to be used
 * to paint grid titles
 * @constructor
 * @class zebra.ui.grid.GridCaption
 * @extends zebra.ui.grid.BaseCaption
 */
pkg.GridCaption = Class(pkg.BaseCaption, [
    function $prototype() {

        this.defYAlignment = this.defXAlignment = L.CENTER;

        /**
         * Get a grid caption column or row title view
         * @param  {Integer} i a row (if the caption is vertical) or
         * column (if the caption is horizontal) index
         * @return {zebra.ui.View} a view to be used as the given
         * row or column title view
         * @method getTitleView
         */
        this.getTitleView = function(i){
            var value = this.getTitle(i);
            if (value == null || value.paint != null) return value;
            this.render.setValue(value.toString());
            return this.render;
        };

        this.calcPreferredSize = function (l) {
            return { width:this.psW, height:this.psH };
        };

        this.recalc = function(){
            this.psW = this.psH = 0;
            if (this.metrics != null){
                var m     = this.metrics,
                    isHor = (this.orient == L.HORIZONTAL),
                    size  = isHor ? m.getGridCols() : m.getGridRows();

                for(var i = 0;i < size; i++){
                    var v = this.getTitleView(i);
                    if (v != null) {
                        var ps = v.getPreferredSize();
                        if (isHor) {
                            if (ps.height > this.psH) this.psH = ps.height;
                            this.psW += ps.width;
                        }
                        else {
                            if (ps.width > this.psW) this.psW = ps.width;
                            this.psH += ps.height;
                        }
                    }
                }

                if (this.psH === 0) this.psH = pkg.Grid.DEF_ROWHEIGHT;
                if (this.psW === 0) this.psW = pkg.Grid.DEF_COLWIDTH;
            }
        };

        this.getTitle = function(rowcol) {
            return this.titles[rowcol] == null ? null
                                               : this.titles[rowcol].title;
        };

        /**
         * Put the given title for the given caption cell.
         * @param  {Integer} rowcol a grid caption cell index
         * @param  {String|zebra.ui.View} title a title of the given grid caption cell.
         * Can be a string or zebra.ui.View class instance
         * @method putTitle
         */
        this.putTitle = function(rowcol, title){
            var prev = this.titles[rowcol] != null ? this.titles[rowcol] : {};
            if (prev.title != title) {
                prev.title = title;
                this.titles[rowcol] = prev;
                this.vrp;
            }
        };

        this.setTitleAlignments = function(rowcol, xa, ya){
            xa = L.$constraints(xa);
            ya = L.$constraints(ya);
            var t = this.titles[rowcol];
            if (t == null || t.xa != xa || t.ya != ya) {
                if (t == null) t = {};
                t.xa = xa;
                t.ya = ya;
                this.titles[rowcol] = t;
                this.repaint();
            }
        };

        this.setTitleBackground = function(i, v) {
            v = ui.$view(v);
            var t = this.titles[i];
            if (t == null) t = {};
            t.bg = v;
            this.titles[i] = t;
            this.repaint();
        };
    },

    function getCaptionPS(rowcol) {
        var size = this.$super(rowcol),
            v    = this.getTitleView(this.selectedColRow);

        if (v != null) {
            size = Math.max(size, (this.orient == L.HORIZONTAL) ? v.getPreferredSize().width
                                                                : v.getPreferredSize().height);
        }

        return size;
    },

    function paintOnTop(g) {
        if (this.metrics != null){
            var cv = this.metrics.getCellsVisibility();

            if ((cv.fc != null && cv.lc != null && this.orient == L.HORIZONTAL)||
                (cv.fr != null && cv.lr != null && this.orient == L.VERTICAL  )   )
            {
                var m      = this.metrics,
                    isHor  = (this.orient == L.HORIZONTAL),
                    gap    = m.lineSize,
                    top    = this.getTop(),
                    left   = this.getLeft(),
                    bottom = this.getBottom(),
                    right  = this.getRight();

                var x = isHor ? cv.fc[1] - this.x + m.getXOrigin() - gap
                              : left,
                    y = isHor ? top
                              : cv.fr[1] - this.y + m.getYOrigin() - gap,
                    size = isHor ? m.getGridCols()
                                 : m.getGridRows();

                //           top
                //           >|<
                //  +=========|===========================
                //  ||        |
                //  ||   +====|============+     +========
                //  ||   ||   |            ||   ||
                //  ||--------> left       ||   ||
                //  ||   ||<-------------->||   ||
                //  ||   ||       ww       ||   ||
                //  ||   ||                ||   ||
                // >-------< lineSize      ||   ||
                //  ||   ||                ||   ||
                //  x   first
                //      visible

                for(var i = (isHor ? cv.fc[0] : cv.fr[0]); i <= (isHor ? cv.lc[0] : cv.lr[0]); i++)
                {
                    var ww = isHor ? m.getColWidth(i)
                                   : this.width - left - right,
                        hh = isHor ? this.height - top - bottom
                                   : m.getRowHeight(i),
                        v = this.getTitleView(i);

                    if (v != null) {
                        var t  = this.titles[i],
                            xa = t != null && t.xa != null ? t.xa : this.defXAlignment,
                            ya = t != null && t.ya != null ? t.ya : this.defYAlignment,
                            bg = t == null ? null : t.bg,
                            ps = v.getPreferredSize(),
                            vx = xa == L.CENTER ? ~~((ww - ps.width)/2)
                                                : (xa == L.RIGHT ? ww - ps.width - ((i==size-1) ? right : 0)
                                                                 : (i === 0 ? left: 0)),
                            vy = ya == L.CENTER ? ~~((hh - ps.height)/2)
                                                : (ya == L.BOTTOM ? hh - ps.height - ((i==size-1) ? bottom : 0)
                                                                  :  (i === 0 ? top: 0));
                        if (bg != null) {
                            if (isHor) bg.paint(g, x, 0, ww + gap , this.height, this);
                            else       bg.paint(g, 0, y, this.width, hh + gap, this);
                        }

                        g.save();
                        g.clipRect(x + gap, y + gap, ww, hh);
                        v.paint(g, x + vx + gap, y + vy + gap, ps.width, ps.height, this);
                        g.restore();
                    }

                    if (isHor) x += ww + gap;
                    else       y += hh + gap;
                }
            }

            this.$super(g);
        }
    },

    function() {
        this.$this(null);
    },

    function(titles) {
        this.$this(titles, new ui.StringRender(""));
    },

    function(titles, render) {
        this.psW = this.psH = 0;
        this.titles = [];
        this.render = render;
        this.render.setFont(pkg.GridCaption.font);
        this.render.setColor(pkg.GridCaption.fontColor);
        this.$super(titles);
    }
]);

/**
 * Grid caption class that implements component based caption.
 * Component based caption uses other UI component as the
 * caption titles.
 * @param  {Array} a caption titles. Title can be a string or
 * a zebra.ui.Panel class instance
 * @constructor
 * @class zebra.ui.grid.CompGridCaption
 * @extends zebra.ui.grid.BaseCaption
 */
pkg.CompGridCaption = Class(pkg.BaseCaption, [
    function $clazz() {
        this.Layout = Class(L.Layout, [
            function $prototype() {
                this.doLayout = function (target) {
                    var m    = target.metrics,
                        b    = target.orient == L.HORIZONTAL,
                        top  = target.getTop(),
                        left = target.getLeft(),
                        wh   = (b ? target.height - top  - target.getBottom()
                                  : target.width  - left - target.getRight());
                        xy   = (b ? left + m.getXOrigin()
                                  : top  + m.getYOrigin());

                    for(var i=0; i < target.kids.length; i++) {
                        var kid = target.kids[i],
                            cwh = (b ? m.getColWidth(i) : m.getRowHeight(i));// + m.lineSize;

                        if (i === 0) {
                            cwh -= (b ? (left - m.lineSize) : top);
                        }

                        if (kid.isVisible === true) {
                            if (b) {
                                kid.setLocation(xy, top);
                                kid.setSize(cwh, wh);
                            }
                            else {
                                kid.setLocation(left, xy);
                                kid.setSize(wh, cwh);
                            }
                        }

                        xy += ( cwh + m.lineSize );
                    }
                };

                this.calcPreferredSize = function (target) {
                    return L.getMaxPreferredSize(target);
                };
            }
        ]);

        this.Link = Class(ui.Link, []);

        this.StatusPan = Class(ui.StatePan, []);

        /**
         * Title panel that is designed to be used as
         * CompGridCaption UI component title element.
         * The panel keeps a grid column or row title,
         * a column or row sort indicator. Using the
         * component you can have sortable grid columns.
         * @constructor
         * @param {String} a grid column or row title
         * @class zebra.ui.grid.CompGridCaption.TitlePan
         */
        this.TitlePan = Class(ui.Panel, [
            function(title) {
                this.$super(new L.FlowLayout(L.CENTER, L.CENTER, L.HORIZONTAL, 8));

                this.sortState = 0;

                /**
                 * Indicates if the title panel has to initiate a column sorting
                 * @default false
                 * @attribute isSortable
                 * @readOnly
                 * @type {Boolean}
                 */
                this.isSortable = false;

                /**
                 * Image panel to keep grtid caption title
                 * @attribute iconPan
                 * @type {zebra.ui.ImagePan}
                 * @readOnly
                 */
                this.iconPan = new ui.ImagePan(null);

                /**
                 * Title link
                 * @attribute link
                 * @type {zebra.ui.Link}
                 * @readOnly
                 */
                this.link = new pkg.CompGridCaption.Link(title);

                this.statusPan = new pkg.CompGridCaption.StatusPan();
                this.statusPan.setVisible(this.isSortable);

                this.add(this.iconPan);
                this.add(this.link);
                this.add(this.statusPan);
            },

            function getGridCaption() {
                var c = this.parent;
                while(c != null && zebra.instanceOf(c, pkg.BaseCaption) === false) {
                    c = c.parent;
                }
                return c;
            },

            function matrixSorted(target, info) {
                if (this.isSortable) {
                    var col = this.parent.indexOf(this);
                    if (info.col == col) {
                        this.sortState = info.name == 'descent' ? 1 : -1;
                        this.statusPan.setState(info.name);
                    }
                    else {
                        this.sortState = 0;
                        this.statusPan.setState("*");
                    }
                }
            },

            /**
             * Set the caption icon
             * @param {String|Image} path a path to an image or image object
             * @method setIcon
             */
            function setIcon(path) {
                this.iconPan.setImage(path);
            },

            function matrixResized(target,prevRows,prevCols){
                if (this.isSortable) {
                    this.sortState = 0;
                    this.statusPan.setState("*");
                }
            },

            function fired(target) {
                if (this.isSortable) {
                    var f = this.sortState == 1 ? zebra.data.ascent
                                                : zebra.data.descent,
                        model = this.getGridCaption().metrics.model,
                        col   = this.parent.indexOf(this);

                    model.sortCol(col, f);
                }
            },

            function kidRemoved(index, kid) {
                // TODO: not very prefect check
                if (kid._ != null && kid._.fired != null) {
                    kid.unbind(this);
                }
                this.$super(index, kid);
            },

            function kidAdded(index, constr, kid) {
                // TODO: not very prefect check
                if (kid._ != null && kid._.fired != null) {
                    kid.bind(this);
                }
                this.$super(index, constr, kid);
            }
        ]);
    },

    /**
     * @for zebra.ui.grid.CompGridCaption
     */
    function $prototype() {
        this.catchInput = function(t) {
            // TODO: not very prefect check
            return t._ == null || t._.fired == null;
        };

        this.scrolled = function() {
            this.vrp();
        };

        /**
         * Put the given title component for the given caption cell.
         * @param  {Integer} rowcol a grid caption cell index
         * @param  {String|zebra.ui.Panel} title a title of the given grid caption cell.
         * Can be a string or zebra.ui.Panel class instance
         * @method putTitle
         */
        this.putTitle = function(rowcol, t) {
            for(var i = this.kids.length-1; i < rowcol; i++) {
                this.add(t);
            }

            if (rowcol < this.kids.length) {
                this.removeAt(rowcol);
            }

            this.insert(rowcol, null, t);
        };

        /**
         * Set the given column sortable state
         * @param {Integer} col a column
         * @param {Boolean} b true if the column has to be sortable
         * @method setSortable
         */
        this.setSortable = function(col, b) {
            var c = this.kids[col];
            if (c.isSortable != b) {
                c.isSortable = b;
                c.statusPan.setVisible(b);
            }
        };

        this.matrixSorted = function(target, info) {
            for(var i=0; i < this.kids.length; i++) {
                if (this.kids[i].matrixSorted) {
                    this.kids[i].matrixSorted(target, info);
                }
            }
        };

        this.matrixResized = function(target,prevRows,prevCols){
            for(var i=0; i < this.kids.length; i++) {
                if (this.kids[i].matrixResized) {
                    this.kids[i].matrixResized(target,prevRows,prevCols);
                }
            }
        };
    },

    function() {
        this.$this(null);
    },

    function(titles) {
        this.$super(titles);
        this.setLayout(new this.$clazz.Layout());
    },

    function captionResized(rowcol, ns) {
        this.$super(rowcol, ns);
        this.vrp();
    },

    function setParent(p) {
        if (this.parent != null && this.parent.scrollManager != null) {
            this.parent.scrollManager.unbind(this);
        }

        if (p != null && p.scrollManager != null) {
            p.scrollManager.bind(this);
        }

        this.$super(p);
    },

    function insert(i,constr, c) {
        if (zebra.isString(c)) {
            c = new this.$clazz.TitlePan(c);
        }
        this.$super(i,constr, c);
    }
]);


/**
 * Grid UI component class. The grid component visualizes "zebra.data.Matrix" data model.
 * Grid cell visualization can be customized by defining and setting an own view provider.
 * Grid component supports cell editing. Every existent UI component can be configured
 * as a cell editor by defining an own editor provider.
 *

        // create a grid that contains three rows and tree columns
        var grid  = new zebra.ui.grid.Grid([
            [ "Cell 1.1", "Cell 1.2", "Cell 1.3"],
            [ "Cell 2.1", "Cell 2.2", "Cell 2.3"],
            [ "Cell 3.1", "Cell 3.2", "Cell 3.3"]
        ]);

        // add the top caption
        grid.add(zebra.layout.TOP, new zebra.ui.grid.GridCaption([
            "Caption title 1", "Caption title 2", "Caption title 3"
        ]));

        // set rows size
        grid.setRowsHeight(45);

 *
 * Grid can have top and left captions.
 * @class  zebra.ui.grid.Grid
 * @constructor
 * @param {zebra.data.Matrix|Array} [model] a matrix model to be visualized with the grid
 * component. It can be an instance of zebra.data.Matrix class or an array that contains
 * embedded arrays. Every embedded array is a grid row.
 * @param {Integer} [rows]  a number of rows
 * @param {Integer} [columns] a number of columns
 * @extends {zebra.ui.Panel}
 * @uses zebra.ui.grid.Metrics
 */

/**
 * Fire when a grid row selection state has been changed

        grid.bind(function(grid, row, count, status) {
            ...
        });

 * @event rowSelected
 * @param  {zebra.ui.grid.Grid} grid a grid that triggers the event
 * @param  {Integer} row a first row whose selection state has been updated. The row is
 * -1 if all selected rows have been unselected
 * @param  {Integer} count a number of rows whose selection state has been updated
 * @param {Boolean} status a status. true means rows have been selected
 */
pkg.Grid = Class(ui.Panel, Position.Metric, pkg.Metrics, [
        function $clazz() {
            this.DEF_COLWIDTH  = 80;
            this.DEF_ROWHEIGHT = 25;
            this.CornerPan = Class(ui.Panel, []);
        },

        function $prototype() {
            /**
             * Grid line size
             * @attribute lineSize
             * @default 1
             * @type {Integer}
             */

            /**
             * Grid cell top padding
             * @attribute cellInsetsTop
             * @default 1
             * @type {Integer}
             * @readOnly
             */

            /**
             * Grid cell left padding
             * @attribute cellInsetsLeft
             * @default 2
             * @type {Integer}
             * @readOnly
             */

            /**
             * Grid cell bottom padding
             * @attribute cellInsetsBottom
             * @default 1
             * @type {Integer}
             * @readOnly
             */

            /**
             * Grid cell right padding
             * @attribute cellInsetsRight
             * @default 2
             * @type {Integer}
             * @readOnly
             */
            this.lineSize = this.cellInsetsTop = this.cellInsetsBottom = 1;
            this.cellInsetsLeft = this.cellInsetsRight = 2;

            /**
             * Default cell content horizontal alignment
             * @type {Integer}
             * @attribute defXAlignment
             * @default zebra.layout.LEFT
             */
            this.defXAlignment = L.LEFT;

            /**
             * Default cell content vertical alignment
             * @type {Integer}
             * @attribute defYAlignment
             * @default zebra.layout.CENTER
             */
            this.defYAlignment = L.CENTER;

            /**
             * Indicate if vertical lines have to be rendered
             * @attribute drawVerLines
             * @type {Boolean}
             * @readOnly
             * @default true
             */

            /**
             * Indicate if horizontal lines have to be rendered
             * @attribute drawHorLines
             * @type {Boolean}
             * @readOnly
             * @default true
             */
            this.drawVerLines = this.drawHorLines = true;

            /**
             * Line color
             * @attribute lineColor
             * @type {String}
             * @default gray
             * @readOnly
             */
            this.lineColor = "gray";

            /**
             * Indicate if size of grid cells have to be calculated
             * automatically basing on its preferred heights and widths
             * @attribute isUsePsMetric
             * @type {Boolean}
             * @default false
             * @readOnly
             */
            this.isUsePsMetric = false;

            this.$topY = function() {
                // grid without top caption renders line at the top, so we have to take in account
                // the place for the line
                return this.getTop() +
                      (this.topCaption == null || this.topCaption.isVisible == false ? this.lineSize
                                                                                     : this.getTopCaptionHeight());
            };

            this.$leftX = function() {
                // grid without left caption renders line at the left, so we have to take in account
                // the place for the line
                return this.getLeft() +
                      (this.leftCaption == null || this.leftCaption.isVisible == false ? this.lineSize
                                                                                       : this.getLeftCaptionWidth());
            };

            this.colVisibility = function(col,x,d,b){
                var cols = this.getGridCols();
                if (cols === 0) return null;

                var left = this.getLeft(),
                    dx   = this.scrollManager.getSX(),
                    xx1  = Math.min(this.visibleArea.x + this.visibleArea.width,
                                    this.width - this.getRight()),
                    xx2  = Math.max(left, this.visibleArea.x +
                                    this.getLeftCaptionWidth());

                for(; col < cols && col >= 0; col += d) {
                    if (x + dx < xx1 && (x + this.colWidths[col] + dx) > xx2){
                        if (b) return [col, x];
                    }
                    else {
                        if (b === false) return this.colVisibility(col, x, (d > 0 ?  -1 : 1), true);
                    }
                    if (d < 0) {
                        if (col > 0) x -= (this.colWidths[col - 1] + this.lineSize);
                    }
                    else {
                        if (col < cols - 1) x += (this.colWidths[col] + this.lineSize);
                    }
                }
                return b ? null : ((d > 0) ? [col -1, x]
                                           : [0, this.$leftX() ]);
            };

            this.rowVisibility = function(row,y,d,b) {
                var rows = this.getGridRows();
                if (rows === 0) return null;

                var top = this.getTop(),
                    dy  = this.scrollManager.getSY(),
                    yy1 = Math.min(this.visibleArea.y + this.visibleArea.height,
                                   this.height - this.getBottom()),
                    yy2 = Math.max(this.visibleArea.y,
                                   top + this.getTopCaptionHeight());

                for(; row < rows && row >= 0; row += d){
                    if (y + dy < yy1 && (y + this.rowHeights[row] + dy) > yy2){
                        if (b) return [row, y];
                    }
                    else {
                        if (b === false) return this.rowVisibility(row, y, (d > 0 ?  -1 : 1), true);
                    }
                    if (d < 0){
                        if (row > 0) y -= (this.rowHeights[row - 1] + this.lineSize);
                    }
                    else {
                        if (row < rows - 1) y += (this.rowHeights[row] + this.lineSize);
                    }
                }
                return b ? null : ((d > 0) ? [row - 1, y]
                                           : [0, this.$topY()]);
            };

            this.vVisibility = function(){
                var va = ui.$cvp(this, {});
                if (va == null) {
                    this.visibleArea = null;
                    this.visibility.fr = null; // say no visible cells are available
                    return;
                }
                else {
                    // visible area has not been calculated or
                    // visible area has been changed
                    if (this.visibleArea == null            ||
                        va.x != this.visibleArea.x          ||
                        va.y != this.visibleArea.y          ||
                        va.width  != this.visibleArea.width ||
                        va.height != this.visibleArea.height  )
                    {
                        this.iColVisibility(0);
                        this.iRowVisibility(0);
                        this.visibleArea = va;
                    }
                }

                var v = this.visibility,
                    b = v.hasVisibleCells();

                if (this.colOffset != 100) {
                    if (this.colOffset > 0 && b){
                        v.lc = this.colVisibility(v.lc[0], v.lc[1],  -1, true);
                        v.fc = this.colVisibility(v.lc[0], v.lc[1],  -1, false);
                    }
                    else {
                        if (this.colOffset < 0 && b) {
                            v.fc = this.colVisibility(v.fc[0], v.fc[1], 1, true);
                            v.lc = this.colVisibility(v.fc[0], v.fc[1], 1, false);
                        }
                        else {
                            v.fc = this.colVisibility(0, this.$leftX(), 1, true);
                            v.lc = (v.fc != null) ? this.colVisibility(v.fc[0], v.fc[1], 1, false)
                                                  : null;
                        }
                    }
                    this.colOffset = 100;
                }

                if (this.rowOffset != 100) {
                    if (this.rowOffset > 0 && b) {
                        v.lr = this.rowVisibility(v.lr[0], v.lr[1],  -1, true);
                        v.fr = this.rowVisibility(v.lr[0], v.lr[1],  -1, false);
                    }
                    else {
                        if(this.rowOffset < 0 && b){
                            v.fr = this.rowVisibility(v.fr[0], v.fr[1], 1, true);
                            v.lr = (v.fr != null) ? this.rowVisibility(v.fr[0], v.fr[1], 1, false) : null;
                        }
                        else {
                            v.fr = this.rowVisibility(0, this.$topY(), 1, true);
                            v.lr = (v.fr != null) ? this.rowVisibility(v.fr[0], v.fr[1], 1, false) : null;
                        }
                    }
                    this.rowOffset = 100;
                }
            };

            this.makeVisible = function(row, col) {
                var top  = this.getTop()  + this.getTopCaptionHeight(),
                    left = this.getLeft() + this.getLeftCaptionWidth(),
                    o    = ui.calcOrigin(this.getColX(col) ,
                                         this.getRowY(row) ,

                                         // width depends on marker mode: cell or row
                                         this.getLineSize(row) > 1 ? this.colWidths[col] + this.lineSize
                                                                 : this.psWidth_,
                                         this.rowHeights[row] + this.lineSize,
                                         this.scrollManager.getSX(),
                                         this.scrollManager.getSY(),
                                         this, top, left,
                                         this.getBottom(),
                                         this.getRight());

                this.scrollManager.scrollTo(o[0], o[1]);
            };

            this.$se = function(row, col, e) {
                if (row >= 0) {
                    this.stopEditing(true);

                    if (this.editors != null &&
                        this.editors.shouldStart(this, row, col, e))
                    {
                        return this.startEditing(row, col);
                    }
                }
                return false;
            };

            this.getXOrigin = function() {
                return this.scrollManager.getSX();
            };

            this.getYOrigin = function () {
                return this.scrollManager.getSY();
            };

            /**
             * Get a preferred width the given column wants to have
             * @param  {Integer} col a column
             * @return {Integer} a preferred width of the given column
             * @method getColPSWidth
             */
            this.getColPSWidth = function(col){
                return this.getPSSize(col, false);
            };

            /**
             * Get a preferred height the given row wants to have
             * @param  {Integer} col a row
             * @return {Integer} a preferred height of the given row
             * @method getRowPSHeight
             */
            this.getRowPSHeight = function(row) {
                return this.getPSSize(row, true);
            };

            this.recalc = function(){
                if (this.isUsePsMetric) {
                    this.rPsMetric();
                }
                else {
                    this.rCustomMetric();
                }

                var cols = this.getGridCols(),
                    rows = this.getGridRows();

                this.psWidth_  = this.lineSize * (cols + ((this.leftCaption == null || this.leftCaption.isVisible == false) ? 1 : 0));
                this.psHeight_ = this.lineSize * (rows + ((this.topCaption == null || this.topCaption.isVisible == false) ? 1 : 0));


                for(var i = 0;i < cols; i++) this.psWidth_  += this.colWidths[i];
                for(var i = 0;i < rows; i++) this.psHeight_ += this.rowHeights[i];
            };

            /**
             * Get number of rows in the given grid
             * @return {Integer} a number of rows
             * @method getGridRows
             */
            this.getGridRows = function() {
                return this.model != null ? this.model.rows : 0;
            };

            /**
             * Get number of columns in the given grid
             * @return {Integer} a number of columns
             * @method getGridColumns
             */
            this.getGridCols = function(){
                return this.model != null ? this.model.cols : 0;
            };

            /**
             * Get the  given grid row height
             * @param  {Integer} row a grid row
             * @return {Integer} a height of the given row
             * @method getRowHeight
             */
            this.getRowHeight = function(row){
                this.validateMetric();
                return this.rowHeights[row];
            };

            /**
             * Get the given grid column width
             * @param  {Integer} col a grid column
             * @return {Integer} a width of the given column
             * @method getColWidth
             */
            this.getColWidth = function(col){
                this.validateMetric();
                return this.colWidths[col];
            };

            this.getCellsVisibility = function(){
                this.validateMetric();
                return this.visibility;
            };

            /**
             * Get the given column top-left corner x coordinate
             * @param  {Integer} col a column
             * @return {Integer} a top-left corner x coordinate of the given column
             * @method getColX
             */
            this.getColX = function (col){
                // speed up a little bit by avoiding calling validateMetric method
                if (this.isValid === false) this.validateMetric();

                var start = 0,
                    d     = 1,
                    x     = this.getLeft() +
                            (this.leftCaption == null || this.leftCaption.isVisible == false ? this.lineSize : 0) +
                            this.getLeftCaptionWidth();

                if (this.visibility.hasVisibleCells()) {
                    start = this.visibility.fc[0];
                    x     = this.visibility.fc[1];
                    d     = (col > this.visibility.fc[0]) ? 1 : -1;
                }

                for(var i = start;i != col; x += ((this.colWidths[i] + this.lineSize) * d),i += d);
                return x;
            };

            /**
             * Get the given row top-left corner y coordinate
             * @param  {Integer} row a row
             * @return {Integer} a top-left corner y coordinate
             * of the given column
             * @method getColX
             */
            this.getRowY = function (row){
                // speed up a little bit by avoiding calling validateMetric method
                if (this.isValid === false) {
                    this.validateMetric();
                }

                var start = 0,
                    d     = 1,
                    y     = this.getTop() +
                            (this.topCaption == null || this.topCaption.isVisible == false ? this.lineSize : 0) +
                            this.getTopCaptionHeight();

                if (this.visibility.hasVisibleCells()){
                    start = this.visibility.fr[0];
                    y     = this.visibility.fr[1];
                    d     = (row > this.visibility.fr[0]) ? 1 : -1;
                }

                for(var i = start;i != row; y += ((this.rowHeights[i] + this.lineSize) * d),i += d);
                return y;
            };

            this.childInputEvent = function(e){
                if (this.editingRow >= 0) {
                    if (this.editors.shouldCancel(this,
                                                  this.editingRow,
                                                  this.editingCol, e))
                    {
                        this.stopEditing(false);
                    }
                    else {
                        if (this.editors.shouldFinish(this,
                                                      this.editingRow,
                                                      this.editingCol, e))
                        {
                            this.stopEditing(true);
                        }
                    }
                }
            };

            this.iColVisibility = function(off) {
                this.colOffset = (this.colOffset == 100) ? this.colOffset = off
                                                         : ((off != this.colOffset) ? 0 : this.colOffset);
            };

            this.iRowVisibility = function(off) {
                this.rowOffset = (this.rowOffset == 100) ? off
                                                         : (((off + this.rowOffset) === 0) ? 0 : this.rowOffset);
            };

            /**
             * Get top grid caption height. Return zero if no top caption element has been defined
             * @return {Integer} a top caption height
             * @protected
             * @method  getTopCaptionHeight
             */
            this.getTopCaptionHeight = function(){
                return (this.topCaption != null && this.topCaption.isVisible === true) ? this.topCaption.height : 0;
            };

            /**
             * Get left grid caption width. Return zero if no left caption element has been defined
             * @return {Integer} a left caption width
             * @protected
             * @method  getLeftCaptionWidth
             */
            this.getLeftCaptionWidth = function(){
                return (this.leftCaption != null && this.leftCaption.isVisible === true) ? this.leftCaption.width : 0;
            };

            this.paint = function(g){
                this.vVisibility();

                if (this.visibility.hasVisibleCells()) {
                    var dx = this.scrollManager.getSX(),
                        dy = this.scrollManager.getSY(),
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

                        if (this.drawHorLines || this.drawVerLines) {
                            this.paintNet(g);
                        }

                        this.paintPosMarker(g);
                        g.restore();
                    }
                    catch(e) {
                        g.restore();
                        throw e;
                    }
                }
            };

            this.catchScrolled = function (psx, psy){
                var offx = this.scrollManager.getSX() - psx,
                    offy = this.scrollManager.getSY() - psy;

                if (offx !== 0) {
                    this.iColVisibility(offx > 0 ? 1 :  - 1);
                }

                if (offy !== 0) {
                    this.iRowVisibility(offy > 0 ? 1 :  - 1);
                }

                this.stopEditing(false);
                this.repaint();
            };

            //TODO: zebra doesn't support yet the method
            this.isInvalidatedByChild = function (c){
                return c != this.editor || this.isUsePsMetric;
            };

            /**
             * Stop editing a grid cell.
             * @param  {Boolean} applyData true if the edited data has to be applied as a new
             * grid cell content
             * @protected
             * @method stopEditing
             */
            this.stopEditing = function(applyData){
                if (this.editors != null &&
                    this.editingRow >= 0 &&
                    this.editingCol >= 0   )
                {
                    try {
                        if (zebra.instanceOf(this.editor, pkg.Grid)) {
                            this.editor.stopEditing(applyData);
                        }

                        var data = this.getDataToEdit(this.editingRow, this.editingCol);
                        if (applyData){
                            this.setEditedData(this.editingRow,
                                               this.editingCol,
                                               this.editors.fetchEditedValue( this,
                                                                              this.editingRow,
                                                                              this.editingCol,
                                                                              data, this.editor));
                        }
                        this.repaintRows(this.editingRow, this.editingRow);
                    }
                    finally {
                        this.editingCol = this.editingRow = -1;
                        if (this.indexOf(this.editor) >= 0) {
                            this.remove(this.editor);
                        }
                        this.editor = null;
                        this.requestFocus();
                    }
                }
            };

            /**
             * Set if horizontal and vertical lines have to be painted
             * @param {Boolean} hor true if horizontal lines have to be painted
             * @param {Boolean} ver true if vertical lines have to be painted
             * @method setDrawLines
             */
            this.setDrawLines = function(hor, ver){
                if (this.drawVerLines != hor || this.drawHorLines != ver) {
                    this.drawHorLines = hor;
                    this.drawVerLines = ver;
                    this.repaint();
                }
            };

            this.setPosMarkerMode = function(mode) {
                if (mode == "row") {
                    this.getLineSize = function(row) {
                        return 1;
                    };

                    this.getMaxOffset = function() {
                        return this.getGridRows()-1;
                    };
                }
                else {
                    if (mode == "cell") {
                        this.getLineSize = function(row) {
                            return this.getGridCols();
                        };

                        this.getMaxOffset = function() {
                            return this.getGridRows()* this.getGridCols() - 1;
                        };
                    }
                    else {
                        throw new Error("Unsupported position marker mode");
                    }
                }
            };

            this.getLines = function() {
                return this.getGridRows();
            };

            this.getLineSize = function(line) {
                return 1;
            };

            this.getMaxOffset = function() {
                return this.getGridRows() - 1;
            };

            this.posChanged = function(target, prevOffset, prevLine, prevCol) {
                var row = this.position.currentLine;
                if (row >= 0) {
                    this.makeVisible(row, this.position.currentCol);
                    this.select(row, true);
                    this.repaintRows(prevOffset, row);
                }
            };

            this.keyReleased = function(e) {
                if (this.position != null) {
                    this.$se(this.position.currentLine,
                             this.position.currentCol, e);
                }
            };

            this.keyTyped = function(e){
                if (this.position != null) {
                    this.$se(this.position.currentLine, this.position.currentCol, e);
                }
            };

            this.keyPressed = function(e){
                if (this.position != null){
                    switch(e.code) {
                        case KE.LEFT    : this.position.seek(-1); break;
                        case KE.UP      : this.position.seekLineTo(Position.UP); break;
                        case KE.RIGHT   : this.position.seek(1); break;
                        case KE.DOWN    : this.position.seekLineTo(Position.DOWN);break;
                        case KE.PAGEUP  : this.position.seekLineTo(Position.UP, this.pageSize(-1));break;
                        case KE.PAGEDOWN: this.position.seekLineTo(Position.DOWN, this.pageSize(1));break;
                        case KE.END     : if (e.isControlPressed()) this.position.setOffset(this.getLines() - 1);break;
                        case KE.HOME    : if (e.isControlPressed()) this.position.setOffset(0);break;
                    }

                    this.$se(this.position.currentLine, this.position.currentCol, e);
                }
            };

            /**
             * Checks if the given grid row is selected
             * @param  {Integer}  row a grid row
             * @return {Boolean}  true if the given row is selected
             * @method isSelected
             */
            this.isSelected = function(row){
                return (this.selected == null) ? row == this.selectedIndex
                                               : this.selected[row] > 0;
            };

            /**
             * Repaint range of grid rows
             * @param  {Integer} r1 the first row to be repainted
             * @param  {Integer} r2 the last row to be repainted
             * @method repaintRows
             */
            this.repaintRows = function (r1,r2){
                if (r1 < 0) r1 = r2;
                if (r2 < 0) r2 = r1;
                if (r1 > r2) {
                    var i = r2;
                    r2 = r1;
                    r1 = i;
                }

                var rows = this.getGridRows();
                if (r1 < rows) {
                    if (r2 >= rows) r2 = rows - 1;
                    var y1 = this.getRowY(r1),
                        y2 = ((r1 == r2) ? y1 : this.getRowY(r2)) + this.rowHeights[r2];

                    this.repaint(0, y1 + this.scrollManager.getSY(), this.width, y2 - y1);
                }
            };

            /**
             * Detect a cell by the given location
             * @param  {Integer} x a x coordinate relatively the grid component
             * @param  {Integer} y a y coordinate relatively the grid component
             * @return {Array} an array that contains detected grid cell row as
             * the first element and a grid column as the second element. The
             * row and column values are set to -1 if no grid cell can be found
             * at the given location
             * @method cellByLocation
             */
            this.cellByLocation = function(x,y){
                this.validate();
                var dx  = this.scrollManager.getSX(),
                    dy  = this.scrollManager.getSY(),
                    v   = this.visibility,
                    ry1 = v.fr[1] + dy,
                    rx1 = v.fc[1] + dx,
                    row = -1,
                    col = -1,
                    ry2 = v.lr[1] + this.rowHeights[v.lr[0]] + dy,
                    rx2 = v.lc[1] + this.colWidths[v.lc[0]] + dx;

                if (y > ry1 && y < ry2) {
                    for(var i = v.fr[0];i <= v.lr[0]; ry1 += this.rowHeights[i] + this.lineSize, i++) {
                        if (y > ry1 && y < ry1 + this.rowHeights[i]) {
                            row = i;
                            break;
                        }
                    }
                }
                if (x > rx1 && x < rx2) {
                    for(var i = v.fc[0];i <= v.lc[0]; rx1 += this.colWidths[i] + this.lineSize, i++ ) {
                        if (x > rx1 && x < rx1 + this.colWidths[i]) {
                            col = i;
                            break;
                        }
                    }
                }
                return (col >= 0 && row >= 0) ? [row, col] : null;
            };

            this.doLayout = function(target) {
                var topHeight = (this.topCaption != null &&
                                 this.topCaption.isVisible === true) ? this.topCaption.getPreferredSize().height : 0,
                    leftWidth = (this.leftCaption != null &&
                                 this.leftCaption.isVisible === true) ? this.leftCaption.getPreferredSize().width : 0;

                if (this.topCaption != null){
                    this.topCaption.setLocation(this.getLeft() + leftWidth, this.getTop());
                    this.topCaption.setSize(Math.min(target.width - this.getLeft() - this.getRight() - leftWidth,
                                                     this.psWidth_),
                                            topHeight);
                }

                if (this.leftCaption != null){
                    this.leftCaption.setLocation(this.getLeft(), this.getTop() + topHeight);
                    this.leftCaption.setSize(leftWidth,
                                             Math.min(target.height - this.getTop() - this.getBottom() - topHeight,
                                                      this.psHeight_));
                }

                if (this.stub != null && this.stub.isVisible === true)
                {
                    if (this.topCaption  != null && this.topCaption.isVisible === true &&
                        this.leftCaption != null && this.leftCaption.isVisible === true  )
                    {
                        this.stub.setLocation(this.getLeft(), this.getTop());
                        this.stub.setSize(this.topCaption.x - this.stub.x,
                                          this.leftCaption.y - this.stub.y);
                    }
                    else {
                        this.stub.setSize(0, 0);
                    }
                }

                if (this.editors != null &&
                    this.editor  != null &&
                    this.editor.parent == this &&
                    this.editor.isVisible === true)
                {
                    var w = this.colWidths[this.editingCol],
                        h = this.rowHeights[this.editingRow],
                        x = this.getColX(this.editingCol),
                        y = this.getRowY(this.editingRow);

                    if (this.isUsePsMetric){
                        x += this.cellInsetsLeft;
                        y += this.cellInsetsTop;
                        w -= (this.cellInsetsLeft + this.cellInsetsRight);
                        h -= (this.cellInsetsTop + this.cellInsetsBottom);
                    }

                    this.editor.setLocation(x + this.scrollManager.getSX(),
                                            y + this.scrollManager.getSY());
                    this.editor.setSize(w, h);
                }
            };

            this.canHaveFocus = function (){
                return this.editor == null;
            };

            /**
             * Clear grid row or rows selection
             * @method clearSelect
             */
            this.clearSelect = function (){
                if (this.selectedIndex >= 0) {
                    var prev = this.selectedIndex;
                    this.selectedIndex = -1;
                    this._.fired(this, -1, 0, false);
                    this.repaintRows(-1, prev);
                }
            };

            /**
             * Mark as selected or unselected the given grid row.
             * @param  {Integer} row a grid row
             * @param  {boolean} [b] a selection status. true if the parameter
             * has not been specified
             * @method select
             */
            this.select = function (row, b){
                if (b == null) b = true;

                if (this.isSelected(row) != b){
                    if (this.selectedIndex >= 0) this.clearSelect();
                    if (b) {
                        this.selectedIndex = row;
                        this._.fired(this, row, 1, b);
                    }
                }
            };

            this.laidout = function () {
                this.vVisibility();
            };

            this.mouseClicked  = function(e) {
                if (this.visibility.hasVisibleCells()){
                    this.stopEditing(true);

                    if (e.isActionMask()){
                        var p = this.cellByLocation(e.x, e.y);
                        if (p != null) {
                            if (this.position != null){
                                var row = this.position.currentLine,
                                    col = this.position.currentCol,
                                    ls  =  this.getLineSize(p[0]);

                                // normalize column depending on marker mode: row or cell
                                // in row mode marker can select only the whole row, so
                                // column can be only 1  (this.getLineSize returns 1)
                                if (row == p[0] && col == p[1] % ls) {
                                    this.makeVisible(row, col);
                                }
                                else {
                                    this.clearSelect();
                                    this.position.setRowCol(p[0], p[1] % ls);
                                }
                            }

                            if (this.$se(p[0], p[1], e)) {
                                // TODO: initiated editor has get mouse clicked event
                            }
                        }
                    }
                }
            };

            this.calcPreferredSize = function (target){
                return {
                    width : this.psWidth_  +
                           ((this.leftCaption != null  &&
                             this.leftCaption.isVisible === true ) ? this.leftCaption.getPreferredSize().width : 0),
                    height: this.psHeight_ +
                           ((this.topCaption != null  &&
                             this.topCaption.isVisible === true) ? this.topCaption.getPreferredSize().height : 0)
                };
            };

            /**
             * Paint vertical and horizontal grid component lines
             * @param  {2DContext} g a HTML5 canvas 2d context
             * @method paintNet
             * @protected
             */
            this.paintNet = function(g){
                var v = this.visibility,
                    topX = v.fc[1] - this.lineSize,
                    topY = v.fr[1] - this.lineSize,
                    botX = v.lc[1] + this.colWidths[v.lc[0]],
                    botY = v.lr[1] + this.rowHeights[v.lr[0]],
                    prevWidth = g.lineWidth;

                g.setColor(this.lineColor);
                g.lineWidth = this.lineSize;
                g.beginPath();

                if (this.drawHorLines) {
                    var y = topY + this.lineSize/2, i = v.fr[0];

                    for(;i <= v.lr[0]; i++){
                        g.moveTo(topX, y);
                        g.lineTo(botX, y);
                        y += this.rowHeights[i] + this.lineSize;
                    }
                    g.moveTo(topX, y);
                    g.lineTo(botX, y);
                }

                if (this.drawVerLines) {
                    var x = topX + this.lineSize/2, i = v.fc[0];

                    for(;i <= v.lc[0]; i++ ){
                        g.moveTo(x , topY);
                        g.lineTo(x, botY);
                        x += this.colWidths[i] + this.lineSize;
                    }
                    g.moveTo(x, topY);
                    g.lineTo(x, botY);
                }
                g.stroke();
                g.lineWidth = prevWidth;
            };

            /**
             * Paint grid data
             * @param  {2DContext} g a HTML5 canvas 2d context
             * @method paintData
             * @protected
             */
            this.paintData = function(g) {
                var y    = this.visibility.fr[1] + this.cellInsetsTop,
                    addW = this.cellInsetsLeft   + this.cellInsetsRight,
                    addH = this.cellInsetsTop    + this.cellInsetsBottom,
                    ts   = g.stack[g.counter],
                    cx   = ts.x,
                    cy   = ts.y,
                    cw   = ts.width,
                    ch   = ts.height,
                    res  = {};

                for(var i = this.visibility.fr[0];i <= this.visibility.lr[0] && y < cy + ch; i++){
                    if (y + this.rowHeights[i] > cy) {
                        var x = this.visibility.fc[1] + this.cellInsetsLeft,
                            notSelectedRow = this.isSelected(i) === false;

                        for(var j = this.visibility.fc[0];j <= this.visibility.lc[0]; j++ ){
                            if (notSelectedRow){
                                var bg = this.provider.getCellColor != null ? this.provider.getCellColor(this, i, j)
                                                                            : this.defCellColor;
                                if (bg != null){
                                    g.setColor(bg);
                                    g.fillRect(x - this.cellInsetsLeft,
                                               y - this.cellInsetsTop,
                                               this.colWidths[j], this.rowHeights[i]);
                                }
                            }

                            var v = (i == this.editingRow &&
                                     j == this.editingCol   ) ? null
                                                              : this.provider.getView(this, i, j,
                                                                                      this.model.get(i, j));
                            if (v != null) {
                                var w = this.colWidths[j]  - addW,
                                    h = this.rowHeights[i] - addH;

                                //MB.intersection(x, y, w, h, cx, cy, cw, ch, res);
                                res.x = x > cx ? x : cx;
                                res.width = Math.min(x + w, cx + cw) - res.x;
                                res.y = y > cy ? y : cy;
                                res.height = Math.min(y + h, cy + ch) - res.y;

                                if (res.width > 0 && res.height > 0) {
                                    if (this.isUsePsMetric) {
                                        v.paint(g, x, y, w, h, this);
                                    }
                                    else
                                    {
                                        var ax = this.provider.getXAlignment != null ? this.provider.getXAlignment(this, i, j)
                                                                                     : this.defXAlignment,
                                            ay = this.provider.getYAlignment != null ? this.provider.getYAlignment(this, i, j)
                                                                                     : this.defYAlignment,
                                            vw = w, // cell width
                                            vh = h, // cell height
                                            xx = x,
                                            yy = y,
                                            id = -1,
                                            ps = (ax != L.NONE || ay != L.NONE) ? v.getPreferredSize()
                                                                                : null;

                                        if (ax != L.NONE){
                                            xx = x + ((ax == L.CENTER) ? ~~((w - ps.width) / 2)
                                                                       : ((ax == L.RIGHT) ? w - ps.width : 0));
                                            vw = ps.width;
                                        }

                                        if (ay != L.NONE){
                                            yy = y + ((ay == L.CENTER) ? ~~((h - ps.height) / 2)
                                                                       : ((ay == L.BOTTOM) ? h - ps.height : 0));
                                            vh = ps.height;
                                        }

                                        if (xx < res.x || yy < res.y || (xx + vw) > (x + w) || (yy + vh) > (y + h)) {
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

            this.paintPosMarker = function(g){
                var markerView = this.hasFocus() ? this.views.marker : this.views.offmarker;

                if (markerView          != null &&
                    this.position       != null &&
                    this.position.offset >= 0     )
                {
                    var row        = this.position.currentLine,
                        col        = this.position.currentCol,
                        rowPosMode = this.position.metrics.getLineSize(row) == 1,
                        v          = this.visibility;

                    // depending om position changing mode (cell or row) analyze
                    // whether the current position is in visible area
                    if (row >= v.fr[0] && row <= v.lr[0] &&
                        (rowPosMode || (col >= v.fc[0] && col <= v.lc[0])))
                    {
                        // TODO: remove the clip, think it is redundant code
                        // g.clipRect(this.getLeftCaptionWidth() - this.scrollManager.getSX(),
                        //            this.getTopCaptionHeight() - this.scrollManager.getSY(),
                        //            this.width, this.height);

                        // detect if grid marker position works in row selection mode
                        if (rowPosMode) {
                            // row selection mode
                            markerView.paint(g, v.fc[1],
                                                this.getRowY(row),
                                                v.lc[1] - v.fc[1] + this.colWidths[v.lc[0]],
                                                this.rowHeights[row], this);
                        }
                        else {
                            // cell selection mode
                            markerView.paint(g, this.getColX(col),
                                                this.getRowY(row),
                                                this.colWidths[col],
                                                this.rowHeights[row], this);
                        }
                    }
                }
            };

            this.paintSelection = function(g) {
                if (this.editingRow < 0) {
                    var v = this.views[this.hasFocus() ? "onselection" : "offselection"];
                    if (v != null)  {
                        for(var j = this.visibility.fr[0]; j <= this.visibility.lr[0]; j++) {
                            if (this.isSelected(j)) {
                                var x = this.visibility.fc[1], y = this.getRowY(j), h = this.rowHeights[j];
                                //!!! this code below can be used to implement cell oriented selection
                                for(var i = this.visibility.fc[0]; i <= this.visibility.lc[0]; i ++ ){
                                    v.paint(g, x, y, this.colWidths[i], h, this);
                                    x += (this.colWidths[i] + this.lineSize);
                                }
                            }
                        }
                    }
                }
            };

            this.rPsMetric = function(){
                var cols = this.getGridCols(),
                    rows = this.getGridRows();

                if (this.colWidths == null || this.colWidths.length != cols) {
                    this.colWidths = arr(cols, 0);
                }
                else {
                    for(var i = 0;i < cols; i++ ) this.colWidths [i] = 0;
                }

                if (this.rowHeights == null || this.rowHeights.length != rows) {
                    this.rowHeights = arr(rows, 0);
                }
                else {
                    for(var i = 0;i < rows; i++ ) this.rowHeights[i] = 0;
                }

                var addW = this.cellInsetsLeft + this.cellInsetsRight,
                    addH = this.cellInsetsTop  + this.cellInsetsBottom;

                for(var i = 0;i < cols; i++ ){
                    for(var j = 0;j < rows; j++ ){
                        var v = this.provider.getView(this, j, i, this.model.get(j, i));
                        if (v != null){
                            var ps = v.getPreferredSize();
                            ps.width  += addW;
                            ps.height += addH;
                            if (ps.width  > this.colWidths[i] ) this.colWidths [i] = ps.width;
                            if (ps.height > this.rowHeights[j]) this.rowHeights[j] = ps.height;
                        }
                        else {
                            if (pkg.Grid.DEF_COLWIDTH > this.colWidths [i]) {
                                this.colWidths [i] = pkg.Grid.DEF_COLWIDTH;
                            }

                            if (pkg.Grid.DEF_ROWHEIGHT > this.rowHeights[j]) {
                                this.rowHeights[j] = pkg.Grid.DEF_ROWHEIGHT;
                            }
                        }
                    }
                }
            };

            this.getPSSize = function (rowcol,b){
                if (this.isUsePsMetric === true) {
                    return b ? this.getRowHeight(rowcol) : this.getColWidth(rowcol);
                }
                else {
                    var max = 0, count = b ? this.getGridCols() : this.getGridRows();
                    for(var j = 0;j < count; j ++ ){
                        var r = b ? rowcol : j, c = b ? j : rowcol,
                            v = this.provider.getView(this, r, c, this.model.get(r, c));

                        if (v != null){
                            var ps = v.getPreferredSize();
                            if (b) {
                                if (ps.height > max) max = ps.height;
                            }
                            else {
                                if (ps.width > max) max = ps.width;
                            }
                        }
                    }
                    return max + this.lineSize * 2 +
                           (b ? this.cellInsetsTop + this.cellInsetsBottom
                              : this.cellInsetsLeft + this.cellInsetsRight);
                }
            };

            this.rCustomMetric = function(){
                var start = 0;
                if (this.colWidths != null) {
                    start = this.colWidths.length;
                    if (this.colWidths.length != this.getGridCols()) {
                        this.colWidths.length = this.getGridCols();
                    }
                }
                else {
                    this.colWidths = Array(this.getGridCols());
                }

                for(; start < this.colWidths.length; start ++ ) {
                    this.colWidths[start] = pkg.Grid.DEF_COLWIDTH;
                }

                start = 0;
                if (this.rowHeights != null) {
                    start = this.rowHeights.length;
                    if (this.rowHeights.length != this.getGridRows()) {
                        this.rowHeights.length = this.getGridRows();
                    }
                }
                else {
                    this.rowHeights = Array(this.getGridRows());
                }

                for(; start < this.rowHeights.length; start++) {
                    this.rowHeights[start] = pkg.Grid.DEF_ROWHEIGHT;
                }
            };

            /**
             * Calculate number of rows to be scrolled up or down to scroll one page
             * @param  {Integer} d a direction. 1 for scroll down and -1 for scroll up
             * @return {Integer}  a page size in rows to be scrolled up or down
             * @method pageSize
             * @protected
             */
            this.pageSize = function(d){
                this.validate();
                if (this.visibility.hasVisibleCells() && this.position != null) {
                    var off = this.position.offset;
                    if (off >= 0){
                        var hh  = this.visibleArea.height - this.getTopCaptionHeight(),
                            sum = 0,
                            poff = off;

                        for(; off >= 0 && off < this.getGridRows() && sum < hh; sum += this.rowHeights[off] + this.lineSize,off += d);
                        return Math.abs(poff - off);
                    }
                }
                return 0;
            };

            /**
             * Set the given height for the specified grid row. The method has no effect
             * if the grid component is forced to use preferred size metric.
             * @param {Integer} row a grid row
             * @param {Integer} h   a height of the grid row
             * @method setRowHeight
             */
            this.setRowHeight = function(row,h){
                this.setRowsHeight(row, 1, h);
            };

            /**
             * Set the given height for all or the specified range of rows
             * @param {Integer} [row] start row
             * @param {Integer} [len] number of rows whose height has to be set
             * @param {Integer} h  a height
             * @method setRowsHeight
             */
            this.setRowsHeight = function(row, len, h) {
                if (this.isUsePsMetric === false){
                    if (arguments.length === 1) {
                        h   = arguments[0];
                        row = 0;
                        len = this.getGridRows();
                    }

                    if (len ===0) return;

                    this.validateMetric();
                    var b = false;
                    for(var i=row; i < row + len; i++) {
                        if (this.rowHeights[i] != h) {
                            this.psHeight_ += (h - this.rowHeights[i]);
                            this.rowHeights[i] = h;
                            b = true;
                        }
                    }

                    if (b === true) {
                        this.stopEditing(false);
                        this.cachedHeight = this.getTop() + this.getBottom() + this.psHeight_ +
                                            ((this.topCaption != null && this.topCaption.isVisible === true) ? this.topCaption.getPreferredSize().height : 0);

                        if (this.parent != null) this.parent.invalidate();
                        this.iRowVisibility(0);
                        this.invalidateLayout();
                        this.repaint();
                    }
                }
            };

            /**
             * Set the given width for the specified grid column. The method has no effect
             * if the grid component is forced to use preferred size metric.
             * @param {Integer} column a grid column
             * @param {Integer} w   a width of the grid column
             * @method setColWidth
             */
            this.setColWidth = function (col,w){
                this.setColsWidth(col,1,w);
            };

            /**
             * Set the given width for all or the specified range of columns
             * @param {Integer} [col] start column
             * @param {Integer} [len] number of columns whose height has to be set
             * @param {Integer} w  a width
             * @method setColsHeight
             */
            this.setColsWidth = function (col,len, w){
                if (this.isUsePsMetric === false){
                    if (arguments.length === 1) {
                        h   = arguments[0];
                        col = 0;
                        len = this.getGridCols();
                    }

                    if (len === 0) return;

                    this.validateMetric();
                    var b = false;
                    for(var i=col; i < col + len; i++) {
                        if (this.colWidths[i] != w){
                            this.psWidth_ += (w - this.colWidths[i]);
                            this.colWidths[i] = w;
                            b = true;
                        }
                    }

                    if (b === true) {
                        this.stopEditing(false);
                        this.cachedWidth = this.getRight() + this.getLeft() +
                                           this.psWidth_ + ((this.leftCaption != null && this.leftCaption.isVisible === true) ? this.leftCaption.getPreferredSize().width : 0);
                        if(this.parent != null) this.parent.invalidate();
                        this.iColVisibility(0);
                        this.invalidateLayout();
                        this.repaint();
                    }
                }
            };

            this.matrixResized = function(target, prevRows, prevCols){
                this.clearSelect();
                if (this.selected != null) {
                    this.selected = arr(this.model.rows, false);
                }
                this.vrp();
                if (this.position != null) {
                    this.position.setOffset(null);
                }

                for(var i=0; i < this.kids.length; i++) {
                    if (this.kids[i].matrixResized) {
                        this.kids[i].matrixResized(target,prevRows,prevCols);
                    }
                }
            };

            this.cellModified = function(target,row,col,prevValue) {
                if (this.isUsePsMetric){
                    this.invalidate();
                }

                for(var i=0; i < this.kids.length; i++) {
                    if (this.kids[i].cellModified) {
                        this.kids[i].cellModified(target,row,col, prevValue);
                    }
                }
            };

            this.matrixSorted = function(target, info) {
                this.clearSelect();
                this.vrp();

                for(var i=0; i < this.kids.length; i++) {
                    if (this.kids[i].matrixSorted) {
                        this.kids[i].matrixSorted(target, info);
                    }
                }
            };

            /**
             * Set the given editor provider. Editor provider is a way to customize
             * cell editing.
             * @param {Object} p an editor provider
             * @method setEditorProvider
             */
            this.setEditorProvider = function(p){
                if (p != this.editors){
                    this.stopEditing(true);
                    this.editors = p;
                }
            };

            /**
             * Force to size grid columns and rows according to its preferred size
             * @param {Boolean} b use true to use preferred size
             * @method setUsePsMetric
             */
            this.setUsePsMetric = function(b){
                if (this.isUsePsMetric != b){
                    this.isUsePsMetric = b;
                    this.vrp();
                }
            };

            this.setPosition = function(p){
                if (this.position != p){
                    if (this.position != null) {
                        this.position.unbind(this);
                    }

                    /**
                     * Virtual cursor position controller
                     * @readOnly
                     * @attribute position
                     * @type {zebra.util.Position}
                     */
                    this.position = p;
                    if(this.position != null){
                        this.position.bind(this);
                        this.position.setMetric(this);
                    }
                    this.repaint();
                }
            };

            /**
             * Set the given cell view provider. Provider is a special
             * class that says how grid cells content has to be rendered,
             * aligned, colored
             * @param {Object} p a view provider
             * @method setViewProvider
             */
            this.setViewProvider = function(p){
                if (this.provider != p){
                    this.provider = p;
                    this.vrp();
                }
            };

            /**
             * Set the given matrix model to be visualized and controlled
             * with the grid component
             * @param {zebra.data.Matrix|Array} d a model passed as an
             * instance of zebra matrix model or an array that contains
             * model rows as embedded arrays.
             * @method setModel
             */
            this.setModel = function(d){
                if (d != this.model) {
                    this.clearSelect();
                    if (Array.isArray(d)) d = new Matrix(d);

                    if (this.model != null && this.model._) {
                        this.model.unbind(this);
                    }

                    this.model = d;
                    if (this.model != null && this.model._) {
                        this.model.bind(this);
                    }

                    if (this.position != null) {
                        this.position.setOffset(null);
                    }

                    if (this.model != null && this.selected != null) {
                        this.selected = arr(this.model.rows, false);
                    }

                    this.vrp();
                }
            };

            /**
             * Set the given top, left, right, bottom cell paddings
             * @param {Integer} p a top, left, right and bottom cell paddings
             * @method setCellPadding
             */
            this.setCellPadding = function (p){
                this.setCellPaddings(p,p,p,p);
            };

            /**
             * Set the given top, left, right, bottom cell paddings
             * @param {Integer} t a top cell padding
             * @param {Integer} l a left cell padding
             * @param {Integer} b a bottom cell padding
             * @param {Integer} r a rightcell padding
             * @method setCellPaddings
             */
            this.setCellPaddings = function (t,l,b,r){
                if (t != this.cellInsetsTop    || l != this.cellInsetsLeft ||
                    b != this.cellInsetsBottom || r != this.cellInsetsRight)
                {
                    this.cellInsetsTop = t;
                    this.cellInsetsLeft = l;
                    this.cellInsetsBottom = b;
                    this.cellInsetsRight = r;
                    this.vrp();
                }
            };

            /**
             * Set the given color to render the grid vertical and horizontal lines
             * @param {String} c a color
             * @method setLineColor
             */
            this.setLineColor = function (c){
                if (c != this.lineColor){
                    this.lineColor = c;
                    if (this.drawVerLines || this.drawHorLines) {
                        this.repaint();
                    }
                }
            };

            /**
             * Set the given grid lines size
             * @param {Integer} s a size
             * @method setLineSize
             */
            this.setLineSize = function (s){
                if (s != this.lineSize){
                    this.lineSize = s;
                    this.vrp();
                }
            };

            /**
             * Start editing the given grid cell. Editing is initiated only if an editor
             * provider has been set and the editor provider defines not-null UI component
             * as an editor for the given cell.
             * @param  {Integer} row a grid cell row
             * @param  {Integer} col a grid cell column
             * @method startEditing
             */
            this.startEditing = function(row, col){
                this.stopEditing(true);
                if (this.editors != null){
                    var editor = this.editors.getEditor(this, row, col,
                                                        this.getDataToEdit(row, col));

                    if (editor != null){
                        this.editingRow = row;
                        this.editingCol = col;
                        if (editor.isPopupEditor === true) {
                            var p = L.toParentOrigin(this.getColX(col) + this.scrollManager.getSX(),
                                                     this.getRowY(row) + this.scrollManager.getSY(),
                                                     this);

                            editor.setLocation(p.x, p.y);
                            ui.makeFullyVisible(this.getCanvas(), editor);
                            this.editor = editor;
                            ui.showModalWindow(this, editor, this);
                        }
                        else {
                            this.add(L.TEMPORARY, editor);
                            this.repaintRows(this.editingRow, this.editingRow);
                        }
                        ui.focusManager.requestFocus(editor);

                        return true;
                    }
                }
                return false;
            };

            this.winOpened = function(winLayer,target,b){
                if (this.editor == target &&  b === false){
                    this.stopEditing(this.editor.isAccepted());
                }
            };

            /**
             * Fetch a data from matrix model that has to be edited
             * @param  {Integer} row a row
             * @param  {Integer} col a column
             * @return {Object} a matrix model data to be edited
             * @method getDataToEdit
             * @protected
             */
            this.getDataToEdit = function (row,col){
                return this.model.get(row, col);
            };

            /**
             * Apply the given edited data to grid matrix model
             * @param  {Integer} row a row
             * @param  {Integer} col a column
             * @param  {Object}  an edited matrix model data to be applied
             * @method setEditedData
             * @protected
             */
            this.setEditedData = function (row,col,value){
                this.model.put(row, col, value);
            };
        },

        function (rows, cols){
            this.$this(new Matrix(rows, cols));
        },

        function (){
            this.$this(new Matrix(5, 5));
        },

        function (model){
            /**
             * Default cell background color
             * @type {String}
             * @attribute defCellColor
             * @default pkg.DefViews.cellBackground
             */
            this.defCellColor = pkg.DefViews.cellBackground;

            this.psWidth_ = this.psHeight_ = this.colOffset = 0;
            this.rowOffset = this.pressedCol = this.selectedIndex = 0;
            this.visibleArea = this.selected = null;
            this._ = new Listeners();
            this.views = {};

            /**
             * Currently editing row. -1 if no row is editing
             * @attribute editingRow
             * @type {Integer}
             * @default -1
             * @readOnly
             */

            /**
             * Currently editing column. -1 if no column is editing
             * @attribute editingCol
             * @type {Integer}
             * @default -1
             * @readOnly
             */

            this.editingRow = this.editingCol = this.pressedRow = -1;

            /**
             * Reference to top caption component
             * @attribute topCaption
             * @type {zebra.ui.grid.GridCaption|zebra.ui.grid.CompGridCaption}
             * @default null
             * @readOnly
             */

            /**
             * Reference to left caption component
             * @attribute leftCaption
             * @type {zebra.ui.grid.GridCaption|zebra.ui.grid.CompGridCaption}
             * @default null
             * @readOnly
             */

            this.editors = this.leftCaption = this.topCaption = this.colWidths = null;
            this.rowHeights = this.position = this.stub = null;
            this.visibility = new CellsVisibility();

            this.$super();

            this.add(L.NONE, new this.$clazz.CornerPan());
            this.setModel(model);
            this.setViewProvider(new pkg.DefViews());
            this.setPosition(new Position(this));
            this.scrollManager = new ui.ScrollManager(this);
        },

        function focused(){
            this.$super();
            this.repaint();
        },

        function invalidate(){
            this.$super();
            this.iColVisibility(0);
            this.iRowVisibility(0);
        },

        function kidAdded(index,id,c){
            this.$super(index, id, c);
            if (L.TOP == id){
                this.topCaption = c;
            }
            else {
                if (L.TEMPORARY == id) this.editor = c;
                else {
                    if (L.LEFT == id){
                        this.leftCaption = c;
                    }
                    else {
                        if (L.NONE === id) this.stub = c;
                    }
                }
            }
        },

        function kidRemoved(index,c){
            this.$super(index, c);
            if(c == this.editor) this.editor = null;
            else {
                if (c == this.topCaption){
                    this.topCaption = null;
                }
                else {
                    if (c == this.leftCaption){
                        this.leftCaption = null;
                    }
                    else {
                        if (c == this.stub) this.stub = null;
                    }
                }
            }
        }

        /**
         *  Set number of views to render different grid component elements
         *  @param {Object} a set of views as dictionary where key is a view
         *  name and the value is a view instance, string (for color, border),
         *  or render function. The following view elements can be passed:
         *
         *
         *      {
         *         "onselection" : <view to render selected row for the grid that holds focus>,
         *         "offselection": <view to render selected row for the grid that doesn't hold focus>
         *      }
         *
         *
         *  @method  setViews
         */
]);
pkg.Grid.prototype.setViews = ui.$ViewsSetter;


/**
 * Special UI panel that manages to stretch grid columns to occupy the whole panel space.
 *

        ...

        var canvas = new zebra.ui.zCanvas();
        var grid = new zebra.ui.grid.Grid(100,10);
        var pan  = new zebra.ui.grid.GridStretchPan(grid);

        canvas.root.setLayout(new zebra.layout.BorderLayout());
        canvas.root.add(zebra.layout.CENTER, pan);

        ...

 * @constructor
 * @param {zebra.ui.grid.Grid} grid a grid component that has to be added in the panel
 * @class zebra.ui.grid.GridStretchPan
 * @extends {zebra.ui.Panel}
 */
pkg.GridStretchPan = Class(ui.Panel, L.Layout, [
    function $prototype() {
        this.calcPreferredSize = function(target){
            this.recalcPS();
            return (target.kids.length === 0 || target.grid.isVisible === false) ? { width:0, height:0 }
                                                                                 : { width:this.strPs.width,
                                                                                     height:this.strPs.height };
        };

        this.doLayout = function(target){
            this.recalcPS();
            if (target.kids.length > 0){
                var grid = this.grid;
                if (grid.isVisible === true){
                    var left = target.getLeft(), top = target.getTop(), i = 0;
                    grid.setLocation(left, top);
                    grid.setSize(target.width  - left - target.getRight(),
                                 target.height - top  - target.getBottom());

                    for(i = 0; i < this.widths.length; i++) {
                        grid.setColWidth(i, this.widths[i]);
                    }

                    if (this.heights != null){
                        for(i = 0; i < this.heights.length; i++) {
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

        this.calcColProportions = function (targetAreaW, targetAreaH){
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
            return zebra.instanceOf(this.grid.topCaption, pkg.BaseCaption) ? this.grid.topCaption.minSize
                                                                           : 10;
        };

        this.calcColWidths = function (targetAreaW,targetAreaH){
            var grid = this.grid,
                w    = Array(grid.getGridCols()),
                ew   = targetAreaW - (this.proportions.length + 1) * grid.lineSize, sw = 0;

            for(var i = 0; i < this.proportions.length; i++){
                if (this.proportions.length - 1 == i) w[i] = ew - sw;
                else {
                    var cw = ~~(ew * this.proportions[i]);
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


            if (this.grid.leftCaption != null && this.grid.leftCaption.isVisible === true) {
                taWidth -= this.grid.leftCaption.getPreferredSize().width;
            }

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
            this.strPs   = this.summarizePS(taWidth, taHeight, this.widths, this.heights);

            if (isScr === true && p.height > 0 && p.vBar && p.autoHide === false && taHeight < this.strPs.height){
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
                if (grid.topCaption != null && grid.topCaption.isVisible === true) {
                    ps.height += grid.topCaption.getPreferredSize().height;
                }
                ps.height += (grid.getTop() + grid.getBottom());
            }
            else {
                ps.height = grid.getPreferredSize().height;
            }
            return ps;
        };
    },

    function (grid){
        this.$super(this);
        this.heights = [];
        this.widths  = [];

        /**
         * Target grid component
         * @type {zebra.ui.Grid}
         * @readOnly
         * @attribute grid
         */
        this.grid = grid;

        this.proportions = this.strPs = null;
        this.prevTargetAreaSize = { width:0, height:0 };
        this.add(grid);
    },

    function kidAdded(index,constr,l){
        this.proportions = null;
        if (l.topCaption != null) {
            l.topCaption.bind(this);
        }
        this.scrollManager = l.scrollManager;
        this.$super(index, constr, l);
    },

    function kidRemoved(i,l){
        this.proportions = null;
        if (l.topCaption != null) {
            l.topCaption.unbind(this);
        }
        this.scrollManager = null;
        this.$super(i, l);
    },

    function invalidate(){
        this.strPs = null;
        this.$super();
    }
]);

/**
 * @for
 */

})(zebra("ui.grid"), zebra.Class, zebra("ui"));

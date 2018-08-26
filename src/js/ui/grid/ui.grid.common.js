zebkit.package("ui.grid", function(pkg, Class) {
    var ui = pkg.cd("..");

    //      ---------------------------------------------------
    //      | x |    col0 width     | x |   col2 width    | x |
    //      .   .
    //    Line width
    //   -->.   .<--

    /**
     * The package contains number of classes and interfaces to implement
     * UI Grid component. The grid allows developers to visualize matrix
     * model, customize the model data editing and rendering.
     *
     *     // create grid that contains 3 rows and four columns
     *     var grid = new zebkit.ui.grid.Grid([
     *         [ "Item 1", "Item 2", "Item 3", "Item 4", "Item 5" ],
     *         [ "Item 1", "Item 2", "Item 3", "Item 4", "Item 5" ],
     *         [ "Item 1", "Item 2", "Item 3", "Item 4", "Item 5" ].
     *     ]);
     *
     *     // add grid top caption
     *     grid.add("top", new zebkit.ui.grid.GridCaption([
     *         "Title 1",
     *         "Title 2",
     *         "Title 3",
     *         "Title 5",
     *         "Title 6"
     *     ]));
     *
     * @class zebkit.ui.grid
     * @access package
     */


    /**
     * Structure to keep grid cells visibility.
     * @constructor
     * @class zebkit.ui.grid.CellsVisibility
     */
    pkg.CellsVisibility = function() {
        this.hasVisibleCells = function(){
            return this.fr !== null && this.fc !== null &&
                   this.lr !== null && this.lc !== null   ;
        };

        /**
         * First visible row.
         * @attribute fr
         * @type {Integer}
         * @default null
         */

        /**
         * First visible column.
         * @attribute fc
         * @type {Integer}
         * @default null
         */

        /**
         * Last visible row.
         * @attribute lr
         * @type {Integer}
         * @default null
         */

        /**
         * Last visible column.
         * @attribute lc
         * @type {Integer}
         * @default null
         */

        // first visible row (row and y), first visible
        // col, last visible col and row
        this.fr = this.fc = this.lr = this.lc = null;

        // TODO: replace array with human readable variables
        // this.firstCol = -1
        // this.firstRow = -1
        // this.lastCol = -1
        // this.lastRow = -1

        // this.firstColX = 0
        // this.firstRowY = 0
        // this.lastColX = 0
        // this.lastRowY = 0
    };

    /**
     *  Interface that describes a grid component metrics
     *  @class zebkit.ui.grid.Metrics
     *  @interface zebkit.ui.grid.Metrics
     */
    pkg.Metrics = zebkit.Interface([
        "abstract",

            /**
             * Get a structure that describes a grid component
             * columns and rows visibility
             * @return {zebkit.ui.grid.CellsVisibility} a grid cells visibility
             * @method getCellsVisibility
             */
            function getCellsVisibility() {},

            /**
             * Get the given column width of a grid component
             * @param {Integer} col a column index
             * @method getColWidth
             * @return {Integer} a column width
             */
            function getColWidth(col) {},

            /**
             * Get the given row height of a grid component
             * @param {Integer} row a row index
             * @method getRowHeight
             * @return {Integer} a row height
             */
            function getRowHeight(row) {},

            /**
             * Get the given column preferred width of a grid component
             * @param {Integer} col a column index
             * @method getPSColWidth
             * @return {Integer} a column preferred width
             */
            function getPSColWidth(col) {},

            /**
             * Get the given row preferred height of a grid component
             * @param {Integer} row a row index
             * @method getPSRowHeight
             * @return {Integer} a row preferred height
             */
            function getPSRowHeight(row) {},

            /**
             * Set the given row height of a grid component
             * @param {Integer} row a row index
             * @param {Integer} height a row height
             * @method setRowHeight
             */
            function setRowHeight(row, height) {},

            /**
             * Set the given column width of a grid component
             * @param {Integer} col a column index
             * @param {Integer} width a column width
             * @method setColWidth
             */
            function setColWidth(col, width) {},

            /**
             * Get number of rows in a grid component
             * @return {Integer} a number of rows
             * @method getGridRows
             */
            function getGridRows() {},

            /**
             * Get number of columns in a grid component
             * @return {Integer} a number of columns
             * @method getGridCols
             */
            function getGridCols() {}
    ]);

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
     * @param {zebkit.draw.Render} [render] a string render
     * @class zebkit.ui.grid.DefViews
     * @extends zebkit.draw.BaseViewProvider
     * @constructor
     */
    pkg.DefViews = Class(zebkit.draw.BaseViewProvider, [
        function $prototype() {
            /**
             * Default cell background
             * @attribute background
             * @type {String|zebkit.draw.View}
             * @default null
             */
            this.background = null;

            /**
             * Get a renderer to draw the specified grid model value.
             * @param  {zebkit.ui.grid.Grid} target a target Grid component
             * @param  {Integer} row  a grid cell row
             * @param  {Integer} col  a grid cell column
             * @param  {Object} obj   a model value for the given grid cell
             * @return {zebkit.draw.View}  an instance of  view to be used to
             * paint the given cell model value
             * @method  getView
             */

            /**
             * Get an horizontal alignment a content in the given grid cell
             * has to be adjusted. The method is optional.
             * @param  {zebkit.ui.grid.Grid} target a target grid component
             * @param  {Integer} row   a grid cell row
             * @param  {Integer} col   a grid cell column
             * @return {String}  a horizontal alignment ("left", "center", "right")
             * @method  getXAlignment
             */

             /**
              * Get a vertical alignment a content in the given grid cell
              * has to be adjusted. The method is optional.
              * @param  {zebkit.ui.grid.Grid} target a target grid component
              * @param  {Integer} row   a grid cell row
              * @param  {Integer} col   a grid cell column
              * @return {String}  a vertical alignment ("top", "center", "bottom")
              * @method  getYAlignment
              */

             /**
              * Get the given grid cell color
              * @param  {zebkit.ui.grid.Grid} target a target grid component
              * @param  {Integer} row   a grid cell row
              * @param  {Integer} col   a grid cell column
              * @return {String}  a cell color to be applied to the given grid cell
              * @method  getCellColor
              */
        }
    ]);

    /**
     * Stripped rows interface to extend a grid view provider.
     *
     *      var grid = new zebkit.ui.grid.Grid([ ... ]);
     *
     *      // Make grid rows stripped with blue and green colors
     *      grid.provider.extend(zebkit.ui.grid.StrippedRows({
     *          oddView : "blue",
     *          evenView: "green"
     *      }));
     *
     *
     * @class zebkit.ui.grid.StrippedRows
     * @interface zebkit.ui.grid.StrippedRows
     */
    pkg.StrippedRows = zebkit.Interface([
        function $prototype() {
            /**
             * Odd rows view or color
             * @attribute oddView
             * @type {String|zebkit.draw.View}
             */
            this.oddView  = null;

            /**
             * Even rows view or color
             * @attribute evenView
             * @type {String|zebkit.draw.View}
             */
            this.evenView = null;

            /**
             * Get a cell view.
             * @param  {zebkit.ui.grid.Grid} grid [description]
             * @param  {Integer} row  a cell row
             * @param  {Integer} col  a cell column
             * @return {String|zebkit.draw.View}  a color or view
             * @method getCellColor
             */
            this.getCellColor = function(grid, row, col) {
                return row % 2  === 0 ? this.evenView
                                      : this.oddView;
            };
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
            var grid = new zebkit.ui.grid.Grid([
                ["Text Cell", true, "Text cell"],
                ["Text Cell", false, "Text cell"],
                ["Text Cell", true, "Text cell"]
            ]);

            // make grid cell editable
            grid.setEditorProvider(new zebkit.ui.grid.DefEditors());


     * It is possible to customize a grid column editor by specifying setting "editors[col]" property
     * value. You can define an UI component that has to be applied as an editor for the given column
     * Also you can disable editing by setting appropriate column editor class to null:

            // grid with tree columns and three rows
            // first and last column will be editable with text field component
            // second column will be editable with check box component
            var grid = new zebkit.ui.grid.Grid([
                ["Text Cell", true, "Text cell"],
                ["Text Cell", false, "Text cell"],
                ["Text Cell", true, "Text cell"]
            ]);

            // grid cell editors provider
            var editorsProvider = new zebkit.ui.grid.DefEditors();

            // disable the first column editing
            editorsProvider.editors[0] = null;

            // make grid cell editable
            grid.setEditorProvider(editorsProvider);

     * @constructor
     * @class zebkit.ui.grid.DefEditors
     */
    pkg.DefEditors = Class([
        function() {
            this.textEditor     = new this.clazz.TextField("", 150);
            this.boolEditor     = new this.clazz.Checkbox(null);
            this.selectorEditor = new this.clazz.Combo();

            this.editors = {};
        },

        function $clazz() {
            this.TextField = Class(ui.TextField, []);
            this.Checkbox  = Class(ui.Checkbox,  []);
            this.Combo     = Class(ui.Combo, [
                function padShown(src, b) {
                    if (b === false) {
                        this.parent.stopEditing(true);
                        this.setSize(0,0);
                    }
                },

                function resized(pw, ph) {
                    this.$super(pw, ph);
                    if (this.width > 0 && this.height > 0 && this.hasFocus()) {
                        this.showPad();
                    }
                }
            ]);
        },

        function $prototype() {
            /**
             * Fetch an edited value from the given UI editor component.
             * @param  {zebkit.ui.grid.Grid} grid a target grid component
             * @param  {Integer} row a grid cell row that has been edited
             * @param  {Integer} col a grid cell column that has been edited
             * @param  {Object} data an original cell content
             * @param  {zebkit.ui.Panel} editor an editor that has been used to
             * edit the given cell
             * @return {Object} a value that can be applied as a new content of
             * the edited cell content
             * @method  fetchEditedValue
             */
            this.fetchEditedValue = function(grid, row, col, data, editor) {
                return editor.getValue();
            };

            /**
             * Get an editor UI component to be used for the given cell of the specified grid
             * @param  {zebkit.ui.grid.Grid} grid a grid whose cell is going to be edited
             * @param  {Integer} row  a grid cell row
             * @param  {Integer} col  a grid cell column
             * @param  {Object}  v    a grid cell model data
             * @return {zebkit.ui.Panel} an editor UI component to be used to edit the given cell
             * @method  getEditor
             */
            this.getEditor = function(grid, row, col, v) {
                var editor = null;
                if (this.editors.hasOwnProperty(col)) {
                    editor = this.editors[col];
                    if (editor !== null) {
                        editor.setValue(v);
                    }
                    return editor;
                } else {
                    editor = zebkit.isBoolean(v) ? this.boolEditor
                                                 : this.textEditor;

                    editor.setValue(v);
                    editor.setPadding(0);
                    var ah = Math.floor((grid.getRowHeight(row) - editor.getPreferredSize().height)/2);
                    editor.setPadding(ah, grid.cellInsetsLeft, ah, grid.cellInsetsRight);
                    return editor;
                }
            };

            /**
             * Test if the specified input event has to trigger the given grid cell editing
             * @param  {zebkit.ui.grid.Grid} grid a grid
             * @param  {Integer} row  a grid cell row
             * @param  {Integer} col  a grid cell column
             * @param  {zebkit.Event} e  an event to be evaluated
             * @return {Boolean} true if the given input event triggers the given cell editing
             * @method shouldStart
             */
            this.shouldStart = function(grid, row, col, e){
                return e.id === "pointerClicked";
            };

            /**
             * Test if the specified input event has to canceling the given grid cell editing
             * @param  {zebkit.ui.grid.Grid} grid a grid
             * @param  {Integer} row  a grid cell row
             * @param  {Integer} col  a grid cell column
             * @param  {zebkit.Event} e  an event to be evaluated
             * @return {Boolean} true if the given input event triggers the given cell editing
             * cancellation
             * @method shouldCancel
             */
            this.shouldCancel = function(grid,row,col,e){
                return e.id === "keyPressed" && "Escape" === e.code;
            };

            /**
             * Test if the specified input event has to trigger finishing the given grid cell editing
             * @param  {zebkit.ui.grid.Grid} grid [description]
             * @param  {Integer} row  a grid cell row
             * @param  {Integer} col  a grid cell column
             * @param  {zebkit.Event} e  an event to be evaluated
             * @return {Boolean} true if the given input event triggers finishing the given cell editing
             * @method shouldFinish
             */
            this.shouldFinish = function(grid,row,col,e){
                return e.id === "keyPressed" && "Enter" === e.code;
            };
        }
    ]);

    /**
     * Grid caption base UI component class. This class has to be used
     * as base to implement grid caption components
     * @class  zebkit.ui.grid.BaseCaption
     * @extends zebkit.ui.Panel
     * @uses zebkit.EventProducer
     * @constructor
     * @param {Array} [titles] a caption component titles
     */

    /**
     * Fire when a grid row selection state has been changed
     *
     *     caption.on("captionResized", function(caption, rowcol, phw) {
     *         ...
     *     });
     *
     * @event captionResized
     * @param  {zebkit.ui.grid.BaseCaption} caption a caption
     * @param  {Integer} rowcol a row or column that has been resized
     * @param  {Integer} pwh a previous row or column size
     */
    pkg.BaseCaption = Class(ui.Panel, [
        function(titles) {
            this.$super();

            if (arguments.length > 0) {
                for(var i = 0; i < titles.length; i++) {
                    this.setLabel(i, titles[i]);
                }
            }
        },

        function $prototype() {
            this.selectedColRow = -1;

            this.orient = this.metrics = this.pxy = null;

            /**
             * Minimal possible grid cell size
             * @type {Integer}
             * @default 10
             * @attribute minSize
             */
            this.minSize = 10;

            /**
             * Size of the active area where cells size can be changed by pointer dragging event
             * @attribute activeAreaSize
             * @type {Integer}
             * @default 5
             */
            this.activeAreaSize = 5;

            /**
             * Indicate if the grid cell size has to be adjusted according
             * to the cell preferred size by pointer double click event.
             * @attribute isAutoFit
             * @default true
             * @type {Boolean}
             */

            /**
             * Indicate if the grid cells are resize-able.
             * to the cell preferred size by pointer double click event.
             * @attribute isResizable
             * @default true
             * @type {Boolean}
             */
            this.isAutoFit = this.isResizable = true;

            this.getCursorType = function (target, x, y) {
                return this.metrics !== null    &&
                       this.selectedColRow >= 0 &&
                       this.isResizable         &&
                       this.metrics.isUsePsMetric === false ? ((this.orient === "horizontal") ? ui.Cursor.W_RESIZE
                                                                                              : ui.Cursor.S_RESIZE)
                                                            : null;
            };

            /**
             * Define pointer dragged events handler.
             * @param  {zebkit.ui.event.PointerEvent} e a pointer event
             * @method pointerDragged
             */
            this.pointerDragged = function(e){
                if (this.pxy !== null) {
                    var b  = (this.orient === "horizontal"),
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
             * Define pointer drag started events handler.
             * @param  {zebkit.ui.event.PointerEvent} e a pointer event
             * @method pointerDragStarted
             */
            this.pointerDragStarted = function(e) {
                if (this.metrics !== null &&
                    this.isResizable      &&
                    this.metrics.isUsePsMetric === false)
                {
                    this.calcRowColAt(e.x, e.y);

                    if (this.selectedColRow >= 0) {
                        this.pxy = (this.orient === "horizontal") ? e.x
                                                                  : e.y;
                    }
                }
            };

            /**
             * Define pointer drag ended events handler.
             * @param  {zebkit.ui.event.PointerEvent} e a pointer event
             * @method pointerDragEnded
             */
            this.pointerDragEnded = function (e){
                if (this.pxy !== null) {
                    this.pxy = null;
                }

                if (this.metrics !== null) {
                    this.calcRowColAt(e.x, e.y);
                }
            };

            /**
             * Define pointer moved events handler.
             * @param  {zebkit.ui.event.PointerEvent} e a pointer event
             * @method pointerMoved
             */
            this.pointerMoved = function(e) {
                if (this.metrics !== null) {
                    this.calcRowColAt(e.x, e.y);
                }
            };

            this.pointerExited = function(e) {
                if (this.selectedColRow !== -1) {
                    this.selectedColRow = -1;
                    this.fire("captionResizeSelected", [this, this.selectedColRow] );
                }
            };

            /**
             * Define pointer clicked events handler.
             * @param  {zebkit.ui.event.PointerEvent} e a pointer event
             * @method pointerClicked
             */
            this.pointerDoubleClicked = function(e) {
                if (this.pxy     === null    &&
                    this.metrics !== null    &&
                    this.selectedColRow >= 0 &&
                    this.isAutoFit === true     )
                {
                    var size = this.getCaptionPS(this.selectedColRow);
                    if (this.orient === "horizontal") {
                        this.metrics.setColWidth (this.selectedColRow, size);
                    } else {
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
                return 0;
            };

            this.captionResized = function(rowcol, ns) {
                if (ns > this.minSize) {
                    if (this.orient === "horizontal") {
                        var pw = this.metrics.getColWidth(rowcol);
                        this.metrics.setColWidth(rowcol, ns);
                        this.fire("captionResized", [this, rowcol, pw]);
                    } else  {
                        var ph = this.metrics.getRowHeight(rowcol);
                        this.metrics.setRowHeight(rowcol, ns);
                        this.fire("captionResized", [this, rowcol, ph]);
                    }
                }
            };

            this.calcRowColAt = function(x, y) {
                var $this = this,
                    newSelected = this.getCaptionAt(x, y, function(m, xy, xxyy, wh, i) {
                        xxyy += (wh + Math.floor(m.lineSize / 2));
                        return (xy < xxyy + $this.activeAreaSize &&
                                xy > xxyy - $this.activeAreaSize   );

                    });

                if (newSelected !== this.selectedColRow) {
                    this.selectedColRow = newSelected;
                    this.fire("captionResizeSelected", [this, this.selectedColRow]);
                }
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
            this.getCaptionAt = function(x,y,f) {
                if (this.metrics !== null &&
                    x >= 0                &&
                    y >= 0                &&
                    x < this.width        &&
                    y < this.height         )
                {
                    var m     = this.metrics,
                        cv    = m.getCellsVisibility(),
                        isHor = (this.orient === "horizontal");

                    if ((isHor && cv.fc !== null) ||
                        (isHor === false && cv.fr !== null))
                    {
                        var gap  = m.lineSize,
                            xy   = isHor ? x : y,
                            xxyy = isHor ? cv.fc[1] - this.x + m.getXOrigin()
                                         : cv.fr[1] - this.y + m.getYOrigin();

                        for (var i = (isHor ? cv.fc[0] : cv.fr[0]);i <= (isHor ? cv.lc[0] : cv.lr[0]); i++) {
                            var wh = isHor ? m.getColWidth(i)
                                           : m.getRowHeight(i);

                            if ((arguments.length > 2 && f(m, xy, xxyy, wh, i)) ||
                                (arguments.length < 3 && xy > xxyy && xy < xxyy + wh))
                            {
                                return i;

                            }
                            xxyy += wh + gap;
                        }
                    }
                }
                return -1;
            };

            /**
             * Set the grid caption labels
             * @param {Object} [labels]* labels
             * @method setLabels
             * @chainable
             */
            this.setLabels = function() {
                for (var i = 0; i < arguments.length; i++) {
                    this.setLabel(i, arguments[i]);
                }
                return this;
            };

            this.setLabel = function(i, lab) {
                return this;
            };

            /**
             * Implement the method to be aware when number of rows or columns in
             * a grid model has been updated
             * @param  {zebkit.ui.grid.Grid} target a target grid
             * @param  {Integer} prevRows a previous number of rows
             * @param  {Integer} prevCols a previous number of columns
             * @method matrixResized
             */

            /**
             * Implement the method to be aware when a grid model data has been
             * re-ordered.
             * @param  {zebkit.ui.grid.Grid} target a target grid
             * @param  {Object} sortInfo an order information
             * @method matrixSorted
             */
        },

        function setParent(p) {
            this.$super(p);

            this.metrics = this.orient = null;
            if (p === null || zebkit.instanceOf(p, pkg.Metrics)) {
                this.metrics = p;
                if (this.constraints !== null) {
                    this.orient = (this.constraints === "top"   ||
                                   this.constraints === "bottom"  ) ? "horizontal"
                                                                    : "vertical";
                }
            }
        }
    ]).events("captionResized", "captionResizeSelected");
});
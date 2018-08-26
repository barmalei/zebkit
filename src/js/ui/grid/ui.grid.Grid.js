zebkit.package("ui.grid", function(pkg, Class) {
    var ui = pkg.cd("..");


    //
    //  -- Grid should be responsible for rendering caption lines
    //  -- Grid layouts horizontal caption taking in account:
    //     -- Top gap
    //     -- Line size
    //  -- The same with vertical caption
    //
    //
    // ......................................... Grid .........................
    // .                     grid.getTop()                                    .
    // .    +------------------------------------------------------------+    .
    // .    |                 grid.lineSize                              |    .
    // .    ....+-------------------------+...+----------------------+...GridCaption
    // .    .   |                         |   |                      |   .    .
    // .    .   |     Caption Title 1     |   |    Caption Title 2   |   .    .
    // .    .   |                         |   |                      |   .    .
    // .    ....+-------------------------+...+----------------------+....    .
    // .    |                  grid.lineSize                             |    .
    // .    +   +-------------------------+   +----------------------+   |    .
    // .    |   |\__ (fc.x, fc.y)         |   |                      |   |    .
    // .    |   |   ...................   |   |                      |   |    .
    // .    |   |   .    cell view    .   |   |                      |   |    .
    // .    |   |   .                 .   |   |                      |   |    .
    // .    |   |   ...................   |   |                      |   |    .
    // .    |   |       cell insets       |   |                      |   |    .
    // .    |   +-------------------------+   +----------------------+   |    .
    // .    |                                                            |    .
    // .<---| grid.getLeft()                            grid.getRight()  |--->.
    //
    //


    /**
     * Class to that defines grid cell selection mode. This implementation
     * allows users single grid cell selection.
     * @constructor
     * @param  {zebkit.ui.grid.Grid} target a target grid the selection mode
     * instance class belongs
     * @class zebkit.ui.grid.CellSelectMode
     */
    pkg.CellSelectMode = Class([
        function(target) {
            this.target = target;
        },

        function $prototype() {
            /**
             * Target grid cell selection mode belongs
             * @attribute target
             * @type {zebkit.ui.grid.Grid}
             */
            this.target = null;

            this.selectedRow = -1;
            this.selectedCol = -1;
            this.prevSelectedRow = -1;
            this.prevSelectedCol = -1;

            /**
             *  Callback method that is called every time the select mode is
             *  attached to the given target grid component
             *  @param  {zebkit.ui.grid.Grid} target a target grid component
             *  @method  install
             */

            /**
             *  Callback method that is called every time the select mode is
             *  detached from the given target grid component
             *  @param  {zebkit.ui.grid.Grid} target a target grid component
             *  @method  uninstall
             */

            /**
             * Evaluates if the given cell is selected.
             * @param  {Integer}  row a cell row
             * @param  {Integer}  col a cell column
             * @return {Boolean} true if the given cell is selected
             * @method isSelected
             */
            this.isSelected = function(row, col) {
                return row >= 0 && row === this.selectedRow &&
                       col >= 0 && col === this.selectedCol;
            };

            /**
             * Callback method that is called every time a grid position
             * marker has been updated.
             * @param  {zebkit.util.Position} pos a position manager
             * @param  {Integer} prevOffset a previous position offset
             * @param  {Integer} prevLine  a previous position line
             * @param  {Integer} prevCol  a previous position column
             * @method posChanged
             */
            this.posChanged = function(pos, prevOffset, prevLine, prevCol) {
                this.prevSelectedRow = prevLine;
                this.prevSelectedCol = prevCol;
                this.target.select(pos.currentLine, pos.currentCol, true);
            };

            /**
             * Clear all selected cells
             * @chainable
             * @method clearSelect
             */
            this.clearSelect = function() {
                if (this.selectedRow >= 0 || this.selectedCol >= 0) {
                    var prevRow = this.selectedRow,
                        prevCol = this.selectedCol;
                    this.selectedCol = this.selectedRow = -1;
                    this.fireSelected(prevRow, prevCol, false);
                }
                return this;
            };

            /**
             * Select or de-select the given grid cell
             * @param  {Integer} row a row of selected or de-selected cell
             * @param  {Integer} col a column of selected or de-selected cell
             * @param  {Boolean} b a selection status
             * @chainable
             * @method select
             */
            this.select = function(row, col, b) {
                if (arguments.length === 2) {
                    b = true;
                }

                if (this.isSelected(row, col) !== b) {
                    this.clearSelect();

                    if (b) {
                        this.selectedRow = row;
                        this.selectedCol = col;
                        this.fireSelected(row, col, b);
                    }
                }
                return this;
            };

            /**
             * Fire selected or de-selected event.
             * @param  {Integer} row a selected or de-selected row
             * @param  {Integer} col a selected or de-selected column
             * @param  {Boolean} b   a state of selected cell
             * @method fireSelected
             * @protected
             */
            this.fireSelected = function(row, col, b) {
                this.target.fire("selected", [ this.target, row, col, b]);
                this.repaintTarget(row, col);
            };

            /**
             * Force cells repainting.
             * @param  {Integer} row a cell row
             * @param  {Integer} col a cell column
             * @method  repaintTarget
             * @protected
             */
            this.repaintTarget = function(row, col) {
                this.target.repaintCells(row, col);
            };
        }
    ]);

    /**
     * Row selection mode class. In this mode it is possible to select single
     * grid row.
     * @param  {zebkit.ui.grid.Grid} target a target grid the selection mode
     * instance class belongs
     * @extends zebkit.ui.grid.CellSelectMode
     * @class zebkit.ui.grid.RowSelectMode
     */
    pkg.RowSelectMode = Class(pkg.CellSelectMode, [
        function $prototype() {
            this.isSelected = function(row, col) {
                return row >= 0 && this.selectedRow === row;
            };

            this.repaintTarget = function(row, col) {
                this.target.repaintRows(row, row + 1);
            };
        }
    ]);

    /**
     * Column selection mode class. In this mode it is possible to select single
     * grid column.
     * @param  {zebkit.ui.grid.Grid} target a target grid the selection mode
     * instance class belongs
     * @extends zebkit.ui.grid.CellSelectMode
     * @class zebkit.ui.grid.ColSelectMode
     */
    pkg.ColSelectMode = Class(pkg.CellSelectMode, [
        function $prototype() {
            this.isSelected = function(row, col) {
                return col >= 0 && this.selectedCol === col;
            };

            this.repaintTarget = function(row, col) {
                this.target.repaintCols(col, col + 1);
            };
        }
    ]);


    /**
     * Grid UI component class. The grid component visualizes "zebkit.data.Matrix" data model.
     * Grid cell visualization can be customized by defining and setting an own view provider.
     * Grid component supports cell editing. Every existent UI component can be configured
     * as a cell editor by defining an own editor provider.
     *
     *
     *       // create a grid that contains three rows and tree columns
     *       var grid  = new zebkit.ui.grid.Grid([
     *           [ "Cell 1.1", "Cell 1.2", "Cell 1.3"],
     *           [ "Cell 2.1", "Cell 2.2", "Cell 2.3"],
     *           [ "Cell 3.1", "Cell 3.2", "Cell 3.3"]
     *       ]);
     *
     *       // add the top caption
     *       grid.add("top", new zebkit.ui.grid.GridCaption([
     *           "Caption title 1", "Caption title 2", "Caption title 3"
     *       ]));
     *
     *       // set rows size
     *       grid.setRowsHeight(45);
     *
     *
     * Grid can have top and left captions.
     * @class  zebkit.ui.grid.Grid
     * @constructor
     * @param {zebkit.data.Matrix|Array} [model] a matrix model to be visualized with the grid
     * component. It can be an instance of zebkit.data.Matrix class or an array that contains
     * embedded arrays. Every embedded array is a grid row.
     * @param {Integer} [rows]  a number of rows
     * @param {Integer} [columns] a number of columns
     * @extends zebkit.ui.Panel
     * @uses zebkit.ui.grid.Metrics
     * @uses zebkit.ui.HostDecorativeViews
     */

    /**
     * Fire when a grid row selection state has been changed
     *
     *       grid.on("selected", function(grid, row, col, status) {
     *           ...
     *       });
     *
     * @event selected
     * @param  {zebkit.ui.grid.Grid} grid a grid that triggers the event
     * @param  {Integer} row a selected row
     * @param  {Integer} col a selected column
     * @param {Boolean} status a selection status. true means rows have been selected
     */
    pkg.Grid = Class(ui.Panel, zebkit.util.Position.Metric, pkg.Metrics, ui.HostDecorativeViews, [
        function(model) {
            if (arguments.length === 0) {
                model = new this.clazz.Matrix(5, 5);
            } else if (arguments.length === 2) {
                model = new this.clazz.Matrix(arguments[0], arguments[1]);
            }

            this.setSelectMode("row");

            this.views = {};
            this.visibility = new pkg.CellsVisibility();
            this.$super();

            this.add("corner", new this.clazz.CornerPan());
            this.setModel(model);
            this.setViewProvider(new this.clazz.DefViews());
            this.setPosition(new zebkit.util.Position(this));
            this.scrollManager = new ui.ScrollManager(this);
        },

        function $clazz() {
            this.Matrix    = Class(zebkit.data.Matrix, []);
            this.DEF_COLWIDTH  = 80;
            this.DEF_ROWHEIGHT = 25;
            this.CornerPan = Class(ui.Panel, []);
            this.DefViews = Class(pkg.DefViews, []);
        },

        function $prototype() {
            this.psWidth_    = this.psHeight_  = this.colOffset = 0;
            this.rowOffset   = this.pressedCol = 0;
            this.visibleArea = null;

            /**
             * Scroll manager
             * @attribute scrollManager
             * @type {zebkit.ui.ScrollManager}
             * @protected
             * @readOnly
             */
            this.scrollManager = null;

            /**
             * Reference to top caption component
             * @attribute topCaption
             * @type {zebkit.ui.grid.GridCaption|zebkit.ui.grid.CompGridCaption}
             * @default null
             * @readOnly
             */
            this.topCaption = null;

            /**
             * Reference to left caption component
             * @attribute leftCaption
             * @type {zebkit.ui.grid.GridCaption|zebkit.ui.grid.CompGridCaption}
             * @default null
             * @readOnly
             */
             this.leftCaption = null;

            /**
             * Cell editors provider
             * @type {zebkit.ui.grid.DefEditors}
             * @attribute editors
             * @readOnly
             * @default null
             */
            this.editors = null;

            /**
             * Currently activated cell editor.
             * @type {zebkit.ui.Panel}
             * @attribute editor
             * @readOnly
             * @default null
             */
            this.editor = null;

            /**
             * Grid cell select mode
             * @attribute selectMode
             * @type {zebkit.ui.grid.SelectMode}
             * @readOnly
             * @default row
             */
            this.selectMode = null;

            /**
             * Calculated grid columns widths
             * @attribute colWidths
             * @type {Array}
             * @protected
             * @readOnly
             */
            this.colWidths = null;

            /**
             * Calculated grid columns heights
             * @attribute rowHeights
             * @type {Array}
             * @protected
             * @readOnly
             */
            this.rowHeights = null;


            this.position = this.stub = null;

            /**
             *  Grid model.
             *  @type {zebkit.data.Matrix}
             *  @attribute model
             */
            this.model = null;

            /**
             * Currently editing row. -1 if no row is editing
             * @attribute editingRow
             * @type {Integer}
             * @default -1
             * @readOnly
             */
             this.editingRow = -1;

            /**
             * Currently editing column. -1 if no column is editing
             * @attribute editingCol
             * @type {Integer}
             * @default -1
             * @readOnly
             */
            this.editingCol = this.pressedRow = -1;

            /**
             * Grid navigation mode
             * @attribute navigationMode
             * @default "row"
             * @type {String}
             */
            this.navigationMode = "row";

            /**
             * Grid line size
             * @attribute lineSize
             * @default 1
             * @type {Integer}
             */
             this.lineSize = 1;

            /**
             * Grid cell top padding
             * @attribute cellInsetsTop
             * @default 1
             * @type {Integer}
             * @readOnly
             */
            this.cellInsetsTop = 1;

            /**
             * Grid cell left padding
             * @attribute cellInsetsLeft
             * @default 2
             * @type {Integer}
             * @readOnly
             */
            this.cellInsetsLeft = 2;

            /**
             * Grid cell bottom padding
             * @attribute cellInsetsBottom
             * @default 1
             * @type {Integer}
             * @readOnly
             */
             this.cellInsetsBottom = 1;

            /**
             * Grid cell right padding
             * @attribute cellInsetsRight
             * @default 2
             * @type {Integer}
             * @readOnly
             */
            this.cellInsetsRight = 2;

            /**
             * Default cell content horizontal alignment
             * @type {String}
             * @attribute defXAlignment
             * @default "left"
             */
            this.defXAlignment = "left";

            /**
             * Default cell content vertical alignment
             * @type {String}
             * @attribute defYAlignment
             * @default "center"
             */
            this.defYAlignment = "center";

            /**
             * Indicate if horizontal lines have to be rendered
             * @attribute drawHorLines
             * @type {Boolean}
             * @readOnly
             * @default true
             */
            this.drawHorLines = true;

            /**
             * Indicate if vertical lines have to be rendered
             * @attribute drawVerLines
             * @type {Boolean}
             * @readOnly
             * @default true
             */
            this.drawVerLines = true;

            /**
             * Line color
             * @attribute lineColor
             * @type {String}
             * @default gray
             * @readOnly
             */
            this.lineColor = "gray";

            /**
             * Indicate if caption lines have to be rendered
             * @type {Boolean}
             * @attribute  drawCaptionLines
             * @default true
             */
            this.drawCaptionLines = true;

            /**
             * Indicate if size of grid cells have to be calculated
             * automatically basing on its preferred heights and widths
             * @attribute isUsePsMetric
             * @type {Boolean}
             * @default false
             * @readOnly
             */
            this.isUsePsMetric = false;

            /**
             * Defines if the pos marker has to be renederd over rendered data
             * @attribute paintPosMarkerOver
             * @type {Boolean}
             * @default true
             */
            this.paintPosMarkerOver = true;

            /**
             * Initial (not scrolled) y coordinate of first cell
             * @method $initialCellY
             * @return {Integer} initial y coordinate
             * @private
             */
            this.$initialCellY = function() {
                var ly = 0;
                if (this.topCaption !== null && this.topCaption.isVisible) {
                    ly = this.topCaption.y + this.topCaption.height;
                } else {
                    ly = this.getTop();
                }

                ly += this.lineSize;
                return ly;
            };

            /**
             * Initial (not scrolled) x coordinate of first cell
             * @method $initialCellX
             * @return {Integer} initial x coordinate
             * @private
             */
            this.$initialCellX = function() {
                var lx = 0;
                if (this.leftCaption !== null && this.leftCaption.isVisible) {
                    lx += this.leftCaption.x + this.leftCaption.width;
                } else {
                    lx = this.getLeft();
                }

                lx += this.lineSize;
                return lx;
            };

            /**
             * Set the grid cell content default horizontal alignment.
             * @param {String} ax a horizontal alignment. Use "left", "right" or "center"
             * as the alignment value.
             * @method setDefCellXAlignment
             * @chainable
             */
            this.setDefCellXAlignment = function(ax) {
                this.setDefCellAlignments(ax, this.defYAlignment);
                return this;
            };

            /**
             * Set the grid cell default vertical alignment.
             * @param {String} ay a vertical alignment. Use "top", "bottom" or "center"
             * as the alignment value.
             * @method setDefCellYAlignment
             * @chainable
             */
            this.setDefCellYAlignment = function(ay) {
                this.setDefCellAlignments(this.defXAlignment, ay);
                return this;
            };

            /**
             * Set the grid cell default horizontal and vertical alignments.
             * @param {String} ax a horizontal alignment. Use "left", "right" or "center"
             * @param {String} ay a horizontal alignment. Use "top", "bottom" or "center"
             * as the alignment value.
             * @method setDefCellAlignments
             * @chainable
             */
            this.setDefCellAlignments = function(ax, ay) {
                if (this.defXAlignment !== ax || this.defYAlignment !== ay) {
                    this.defXAlignment = ax;
                    this.defYAlignment = ay;
                    this.repaint();
                }
                return this;
            };

            /**
             * Return a view that is used to render the given grid cell.
             * @param  {Integer} row a grid cell row
             * @param  {Integer} col a grid cell column
             * @return {zebkit.draw.View} a cell view
             * @method getCellView
             */
            this.getCellView = function(row, col) {
                return this.provider.getView(this, row, col, this.model.get(row, col));
            };

            this.colVisibility = function(col, x, d, b){
                var cols = this.getGridCols();
                if (cols === 0) {
                    return null;
                } else {
                    var left = this.getLeft(),
                        dx   = this.scrollManager.getSX(),
                        xx1  = Math.min(this.visibleArea.x + this.visibleArea.width,
                                        this.width - this.getRight()),
                        xx2  = Math.max(left, this.visibleArea.x +
                                        this.getLeftCaptionWidth());

                    for(; col < cols && col >= 0; col += d) {
                        if (x + dx < xx1 && (x + this.colWidths[col] + dx) > xx2) {
                            if (b) {
                                return [col, x];
                            }
                        } else if (b === false)  {
                            return this.colVisibility(col, x, (d > 0 ?  -1 : 1), true);
                        }

                        if (d < 0) {
                            if (col > 0) {
                                x -= (this.colWidths[col - 1] + this.lineSize);
                            }
                        } else {
                            if (col < cols - 1) {
                                x += (this.colWidths[col] + this.lineSize);
                            }
                        }
                    }
                    return b ? null : ((d > 0) ? [col -1, x]
                                               : [0, this.$initialCellX() ]);
                }
            };

            this.rowVisibility = function(row,y,d,b) {
                var rows = this.getGridRows();
                if (rows === 0) {
                    return null;
                } else {
                    var top = this.getTop(),
                        dy  = this.scrollManager.getSY(),
                        yy1 = Math.min(this.visibleArea.y + this.visibleArea.height,
                                       this.height - this.getBottom()),
                        yy2 = Math.max(this.visibleArea.y,
                                       top + this.getTopCaptionHeight());

                    for(; row < rows && row >= 0; row += d){
                        if (y + dy < yy1 && (y + this.rowHeights[row] + dy) > yy2){
                            if (b) {
                                return [row, y];
                            }
                        } else {
                            if (b === false) {
                                return this.rowVisibility(row, y, (d > 0 ?  -1 : 1), true);
                            }
                        }

                        if (d < 0){
                            if (row > 0) {
                                y -= (this.rowHeights[row - 1] + this.lineSize);
                            }
                        } else {
                            if (row < rows - 1) {
                                y += (this.rowHeights[row] + this.lineSize);
                            }
                        }
                    }
                    return b ? null : ((d > 0) ? [row - 1, y]
                                               : [0, this.$initialCellY()]);
                }
            };

            this.vVisibility = function(){
                var va = ui.$cvp(this, {});
                if (va === null) {
                    this.visibleArea = null;
                    this.visibility.fr = null; // say no visible cells are available
                } else {
                    // visible area has not been calculated or
                    // visible area has been changed
                    if (this.visibleArea === null            ||
                        va.x !== this.visibleArea.x          ||
                        va.y !== this.visibleArea.y          ||
                        va.width  !== this.visibleArea.width ||
                        va.height !== this.visibleArea.height  )
                    {
                        this.iColVisibility(0);
                        this.iRowVisibility(0);
                        this.visibleArea = va;
                    }

                    var v = this.visibility,
                        b = v.hasVisibleCells();

                    if (this.colOffset !== 100) {
                        if (this.colOffset > 0 && b){
                            v.lc = this.colVisibility(v.lc[0], v.lc[1],  -1, true);
                            v.fc = this.colVisibility(v.lc[0], v.lc[1],  -1, false);
                        } else {
                            if (this.colOffset < 0 && b) {
                                v.fc = this.colVisibility(v.fc[0], v.fc[1], 1, true);
                                v.lc = this.colVisibility(v.fc[0], v.fc[1], 1, false);
                            } else {
                                v.fc = this.colVisibility(0, this.$initialCellX(), 1, true);
                                v.lc = (v.fc !== null) ? this.colVisibility(v.fc[0], v.fc[1], 1, false)
                                                       : null;
                            }
                        }
                        this.colOffset = 100;
                    }

                    if (this.rowOffset !== 100) {
                        if (this.rowOffset > 0 && b) {
                            v.lr = this.rowVisibility(v.lr[0], v.lr[1],  -1, true);
                            v.fr = this.rowVisibility(v.lr[0], v.lr[1],  -1, false);
                        } else {
                            if(this.rowOffset < 0 && b){
                                v.fr = this.rowVisibility(v.fr[0], v.fr[1], 1, true);
                                v.lr = (v.fr !== null) ? this.rowVisibility(v.fr[0], v.fr[1], 1, false) : null;
                            } else {
                                v.fr = this.rowVisibility(0, this.$initialCellY(), 1, true);
                                v.lr = (v.fr !== null) ? this.rowVisibility(v.fr[0], v.fr[1], 1, false) : null;
                            }
                        }
                        this.rowOffset = 100;
                    }
                }
            };

            /**
             * Make the given cell visible.
             * @param  {Integer} row a cell row
             * @param  {Integer} col a cell column
             * @method makeVisible
             * @chainable
             */
            this.makeVisible = function(row, col) {
                var top  = this.getTop()  + this.getTopCaptionHeight(),
                    left = this.getLeft() + this.getLeftCaptionWidth(),
                    o    = ui.calcOrigin(this.getColX(col),
                                         this.getRowY(row),

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
                return this;
            };

            this.$se = function(row, col, e) {
                if (row >= 0) {
                    this.stopEditing(true);

                    if (this.editors !== null &&
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
                } else {
                    this.rCustomMetric();
                }

                this.psHeight_ = this.psWidth_ = 0;

                var cols = this.getGridCols(),
                    rows = this.getGridRows();

                if (cols > 0) {
                    this.psWidth_ += ((cols + 1) * this.lineSize);
                }

                // if left caption is visible add extra line size since vertical line has to
                // be rendered at the left side of left caption
                if (this.leftCaption !== null && this.leftCaption.isVisible) {
                    this.psWidth_ += this.lineSize;
                }

                if (rows > 0) {
                    this.psHeight_ += ((rows + 1) * this.lineSize);
                }

                // if top caption is visible add extra line size since horizontal line has to
                // be rendered at the top side of top caption
                if (this.topCaption !== null && this.topCaption.isVisible) {
                    this.psHeight_ += this.lineSize;
                }

                // accumulate column widths
                var i = 0;
                for (;i < cols; i++) {
                    this.psWidth_ += this.colWidths[i];
                }

                // accumulate row heights
                for (i = 0; i < rows; i++) {
                    this.psHeight_ += this.rowHeights[i];
                }
            };

            /**
             * Get number of rows in the given grid
             * @return {Integer} a number of rows
             * @method getGridRows
             */
            this.getGridRows = function() {
                return this.model !== null ? this.model.rows : 0;
            };

            /**
             * Get number of columns in the given grid
             * @return {Integer} a number of columns
             * @method getGridColumns
             */
            this.getGridCols = function(){
                return this.model !== null ? this.model.cols : 0;
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
                if (this.isValid === false) {
                    this.validateMetric();
                }

                var start = 0,
                    d     = 1,
                    x     = 0;

                if (this.visibility.hasVisibleCells()) {
                    start = this.visibility.fc[0];
                    x     = this.visibility.fc[1];
                    d     = (col > this.visibility.fc[0]) ? 1 : -1;
                } else {
                    if (this.leftCaption !== null && this.leftCaption.isVisible) {
                        x = this.leftCaption.x + this.leftCaption.width + this.lineSize;
                    } else {
                        x = this.getLeft() + this.lineSize;
                    }
                }

                for(var i = start;i !== col; x += ((this.colWidths[i] + this.lineSize) * d),i += d) {}
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
                    y     = 0;

                if (this.visibility.hasVisibleCells()){
                    start = this.visibility.fr[0];
                    y     = this.visibility.fr[1];
                    d     = (row > this.visibility.fr[0]) ? 1 : -1;
                } else {
                    if (this.topCaption !== null && this.topCaption.isVisible) {
                        y = this.topCaption.y + this.topCaption.height + this.lineSize;
                    } else {
                        y = this.getTop() + this.lineSize;
                    }
                }

                for(var i = start;i !== row; y += ((this.rowHeights[i] + this.lineSize) * d),i += d) {}
                return y;
            };

            this.childPointerEntered  =
            this.childPointerExited   =
            this.childPointerReleased =
            this.childPointerReleased =
            this.childPointerPressed  =
            this.childKeyReleased     =
            this.childKeyTyped        =
            this.childKeyPressed      = function(e){
                if (this.editingRow >= 0) {
                    if (this.editors.shouldCancel(this,
                                                  this.editingRow,
                                                  this.editingCol, e))
                    {
                        this.stopEditing(false);
                    } else {
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
                this.colOffset = (this.colOffset === 100) ? this.colOffset = off
                                                          : ((off !== this.colOffset) ? 0 : this.colOffset);
            };

            this.iRowVisibility = function(off) {
                this.rowOffset = (this.rowOffset === 100) ? off
                                                          : (((off + this.rowOffset) === 0) ? 0 : this.rowOffset);
            };

            /**
             * Get top grid caption height. Return zero if no top caption element has been defined
             * @return {Integer} a top caption height
             * @protected
             * @method  getTopCaptionHeight
             */
            this.getTopCaptionHeight = function(){
                return (this.topCaption !== null && this.topCaption.isVisible === true) ? this.topCaption.height : 0;
            };

            /**
             * Get left grid caption width. Return zero if no left caption element has been defined
             * @return {Integer} a left caption width
             * @protected
             * @method  getLeftCaptionWidth
             */
            this.getLeftCaptionWidth = function(){
                return (this.leftCaption !== null && this.leftCaption.isVisible === true) ? this.leftCaption.width : 0;
            };

            this.paint = function(g){
                this.vVisibility();

                if (this.visibility.hasVisibleCells()) {
                    var dx = this.scrollManager.getSX(),
                        dy = this.scrollManager.getSY(),
                        th = this.getTopCaptionHeight(),
                        tw = this.getLeftCaptionWidth();

                    g.save();
                    try {
                        g.translate(dx, dy);

                        if (th > 0 || tw > 0) {
                            g.clipRect(tw - dx, th - dy, this.width  - tw, this.height - th);
                        }

                        if (this.paintPosMarkerOver !== true) {
                            this.paintPosMarker(g);
                        }

                        this.paintData(g);
                        if (this.lineSize > 0 && (this.drawHorLines === true || this.drawVerLines === true)) {
                            this.paintNet(g);
                        }

                        if (this.paintPosMarkerOver === true) {
                            this.paintPosMarker(g);
                        }
                    } catch(e) {
                        g.restore();
                        throw e;
                    }

                    g.restore();
                }
            };

            this.paintOnTop = function(g) {
                // paint lines over captions
                if (this.drawCaptionLines && (this.drawHorLines === true || this.drawVerLines === true)) {
                    var v  = this.visibility,
                        i  = 0;

                    if (this.leftCaption !== null && this.leftCaption.isVisible) {
                        g.setColor(this.lineColor);
                        g.beginPath();
                        if (g.lineWidth !== this.lineSize) {
                            g.lineWidth = this.lineSize;
                        }

                        var sx   = this.leftCaption.x - this.lineSize,
                            y    = v.fr[1] - this.lineSize / 2 + this.scrollManager.getSY(),
                            minY = (this.topCaption !== null &&  this.topCaption.isVisible ? this.topCaption.y + this.topCaption.height
                                                                                           : this.getTop());

                        g.moveTo(this.leftCaption.x - this.lineSize / 2, this.getTop());
                        g.lineTo(this.leftCaption.x - this.lineSize / 2,
                                 Math.min(this.leftCaption.y + this.leftCaption.height,
                                          this.height - this.getBottom()));

                        sx = this.leftCaption.x;
                        for(;i <= v.lr[0] + 1; i++) {
                            if (y >= minY) {
                                g.moveTo(sx, y);
                                g.lineTo(sx + this.leftCaption.width + this.lineSize, y);
                            }
                            y += this.rowHeights[i] + this.lineSize;
                        }

                        g.stroke();
                    }

                    if (this.topCaption !== null && this.topCaption.isVisible) {

                        g.setColor(this.lineColor);
                        g.beginPath();
                        if (g.lineWidth !== this.lineSize) {
                            g.lineWidth = this.lineSize;
                        }

                        var sy   = this.topCaption.y - this.lineSize,
                            minX = this.leftCaption !== null && this.leftCaption.isVisible ? this.leftCaption.x + this.leftCaption.width
                                                                                           : this.getLeft(),
                            x    = v.fc[1] - this.lineSize / 2 + this.scrollManager.getSX();

                        g.moveTo(this.topCaption.x - this.getLeftCaptionWidth(), sy + this.lineSize / 2);
                        g.lineTo(Math.min(this.topCaption.x + this.topCaption.width,
                                          this.width - this.getRight()),
                                 sy + this.lineSize / 2);

                        sy = this.topCaption.y;
                        for (i = v.fc[0]; i <= v.lc[0] + 1; i++) {
                            if (x >= minX) {
                                g.moveTo(x, sy);
                                g.lineTo(x, sy + this.topCaption.height + this.lineSize);
                            }
                            x += this.colWidths[i] + this.lineSize;
                        }
                        g.stroke();
                    }
                }
            };

            /**
             * Scroll action handler
             * @param  {Integer} psx a previous horizontal scroll offset
             * @param  {Integer} psy a previous vertical scroll offset
             * @method catchScrolled
             */
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

            //TODO: zebkit doesn't support yet the method
            this.isInvalidatedByChild = function (c){
                return c !== this.editor || this.isUsePsMetric;
            };

            /**
             * Stop editing a grid cell.
             * @param  {Boolean} applyData true if the edited data has to be applied as a new
             * grid cell content
             * @protected
             * @method stopEditing
             */
            this.stopEditing = function(applyData){
                if (this.editors !== null &&
                    this.editingRow >= 0  &&
                    this.editingCol >= 0    )
                {
                    try {
                        if (zebkit.instanceOf(this.editor, pkg.Grid)) {
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
                    } finally {
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
             * @chainable
             */
            this.setDrawLines = function(hor, ver){
                if (this.drawVerLines !== hor || this.drawHorLines !== ver) {
                    this.drawHorLines = hor;
                    this.drawVerLines = ver;
                    this.repaint();
                }
                return this;
            };

            /**
             * Set the given grid cell select mode.
             * @param {zebki.ui.grid.SelectMode|String} mode a select mode. It is possible
             * to specify the mode with one of the following string constant:
             *
             *    - "row" - single row select mode
             *    - "col" - single column select mode
             *    - "cell" - single cell select mode
             *
             *
             * @method setSelectMode
             * @chainable
             */
            this.setSelectMode = function(mode) {
                this.clearSelect();

                var prevSelMode = this.selectMode;
                if (mode !== this.selectMode) {
                    if (prevSelMode !== null && typeof prevSelMode.uninstall === 'function') {
                        prevSelMode.uninstall(this);
                    }

                    if (zebkit.isString(mode)) {
                        if (mode.toLowerCase() === "row") {
                            this.selectMode = new pkg.RowSelectMode(this);
                            this.setNavigationMode(mode);
                        } else if (mode.toLowerCase() === "col") {
                            this.selectMode = new pkg.ColSelectMode(this);
                            this.setNavigationMode(mode);
                        } else if (mode.toLowerCase() === "cell") {
                            this.selectMode = new pkg.CellSelectMode(this);
                            this.setNavigationMode(mode);
                        } else {
                            throw new Error("Invalid select mode '" + mode + "'");
                        }
                    } else if (mode === null) {
                        this.selectMode = null;
                    } else {
                        this.selectMode = mode;
                    }

                    if (this.selectMode !== null && typeof this.selectMode.install === 'function') {
                        this.selectMode.install(this);
                    }
                }
                return this;
            };

            /**
             * Set navigation mode. It is possible to use "row" or "cell" or "col" navigation mode.
             * In first case navigation happens over row, in the second
             * case navigation happens over cell.
             * @param {String} mode a navigation mode ("row" or "cell" or "col")
             * @method setNavigationMode
             * @chainable
             */
            this.setNavigationMode = function(mode) {
                if (this.position !== null) {
                    this.position.setOffset(null);
                }

                if (mode.toLowerCase() === "row") {
                    this.navigationMode = "row";

                    this.getLineSize = function(row) {
                        return 1;
                    };

                    this.getMaxOffset = function() {
                        return this.getGridRows() - 1;
                    };

                    this.getLines = function() {
                        return this.getGridRows();
                    };

                } else if (mode.toLowerCase() === "cell") {
                    this.navigationMode = "cell";

                    this.getLines = function() {
                        return this.getGridRows();
                    };

                    this.getLineSize = function(row) {
                        return this.getGridCols();
                    };

                    this.getMaxOffset = function() {
                        return this.getGridRows() * this.getGridCols() - 1;
                    };
                } else if (mode.toLowerCase() === "col") {
                    this.navigationMode = "col";

                    this.getLineSize = function(row) {
                        return this.getGridCols();
                    };

                    this.getMaxOffset = function() {
                        return this.getGridCols() - 1;
                    };

                    this.getLines = function() {
                        return 1;
                    };
                } else if (mode === null) {
                    this.navigationMode = null;
                } else {
                    throw new Error("Invalid navigation mode value : '" + mode + "'");
                }

                return this;
            };

            /**
             * Position changed event handler.
             * @param  {zebkit.util.Position} target a position manager
             * @param  {Integer} prevOffset a previous position offset
             * @param  {Integer} prevLine a previous position line
             * @param  {Integer} prevCol a previous position column
             * @method posChanged
             */
            this.posChanged = function(target, prevOffset, prevLine, prevCol) {
                var row = this.position.currentLine,
                    col = this.position.currentCol;

                if (row >= 0) {
                    this.makeVisible(row, col);

                    if (this.selectMode !== null) {
                        this.selectMode.posChanged(target, prevOffset, prevLine, prevCol);
                    }

                    if (this.navigationMode === "row") {
                        this.repaintRows(prevLine, row);
                    } else if (this.navigationMode === "col") {
                        this.repaintCols(prevCol, col);
                    } else if (this.navigationMode === "cell") {
                        this.repaintCells(row, col, prevLine, prevCol);
                    }
                } else {
                    this.repaintRows(prevLine, prevLine);
                }
            };

            /**
             * Implement key released handler.
             * @param  {zebkit.ui.event.KeyEvent} e a key event
             * @method keyReleased
             */
            this.keyReleased = function(e) {
                if (this.position !== null) {
                    this.$se(this.position.currentLine,
                             this.position.currentCol, e);
                }
            };

            /**
             * Implement key type handler.
             * @param  {zebkit.ui.event.KeyEvent} e a key event
             * @method keyTyped
             */
            this.keyTyped = function(e){
                if (this.position !== null) {
                    this.$se(this.position.currentLine, this.position.currentCol, e);
                }
            };

            /**
             * Implement key pressed handler.
             * @param  {zebkit.ui.event.KeyEvent} e a key event
             * @method keyPressed
             */
            this.keyPressed = function(e){
                if (this.position !== null) {
                    switch(e.code) {
                        case "ArrowLeft"   : this.position.seek(-1); break;
                        case "ArrowUp"     : this.position.seekLineTo("up"); break;
                        case "ArrowRight"  : this.position.seek(1); break;
                        case "ArrowDown"   : this.position.seekLineTo("down");break;
                        case "PageUp"      : this.position.seekLineTo("up", this.pageSize(-1));break;
                        case "PageDown"    : this.position.seekLineTo("down", this.pageSize(1));break;
                        case "End"         :
                            if (e.ctrlKey) {
                                this.position.setOffset(this.getLines() - 1);
                            } break;
                        case "Home"        :
                            if (e.ctrlKey) {
                                this.position.setOffset(0);
                            } break;
                    }

                    this.$se(this.position.currentLine, this.position.currentCol, e);
                }
            };

            /**
             * Checks if the given grid cell is selected
             * @param  {Integer}  row a grid row
             * @param  {Integer}  col a grid col
             * @return {Boolean}  true if the given row is selected
             * @method isSelected
             */
            this.isSelected = function(row, col) {
                return this.selectMode === null ? false
                                                    : this.selectMode.isSelected(row, col);
            };

            /**
             * Repaint range of grid rows
             * @param  {Integer} r1 the first row to be repainted
             * @param  {Integer} r2 the last row to be repainted
             * @method repaintRows
             * @chainable
             */
            this.repaintRows = function(r1, r2){
                if (r1 < 0) {
                    r1 = r2;
                }

                if (r2 < 0) {
                    r2 = r1;
                }

                if (r1 > r2) {
                    var i = r2;
                    r2 = r1;
                    r1 = i;
                }

                var rows = this.getGridRows();
                if (r1 >= 0 && r1 < rows) {
                    if (r2 >= rows) {
                        r2 = rows - 1;
                    }

                    var y1 = this.getRowY(r1),
                        y2 = ((r1 === r2) ? y1 + 1 : this.getRowY(r2)) + this.rowHeights[r2];

                    this.repaint(0, y1 + this.scrollManager.getSY(), this.width, y2 - y1);
                }

                return this;
            };

            /**
             * Repaint range of grid columns
             * @param  {Integer} c1 the first column to be repainted
             * @param  {Integer} c2 the last column to be repainted
             * @method repaintCols
             * @chainable
             */
            this.repaintCols = function(c1, c2){
                if (c1 < 0) {
                    c1 = c2;
                }

                if (c2 < 0) {
                    c2 = c1;
                }

                if (c1 > c2) {
                    var i = c2;
                    c2 = c1;
                    c1 = i;
                }

                var cols = this.getGridCols();
                if (c1 >= 0 && c1 < cols) {
                    if (c2 >= cols) {
                        c2 = cols - 1;
                    }

                    var x1 = this.getColX(c1),
                        x2 = ((c1 === c2) ? x1 + 1 : this.getColX(c2)) + this.colWidths[c2];

                    this.repaint(x1 + this.scrollManager.getSX(), 0, x2 - x1, this.height);
                }

                return this;
            };

            /**
             * Repaint cells.
             * @param  {Integer} r1 first row
             * @param  {Integer} c1 first column
             * @param  {Integer} [r2] second row
             * @param  {Integer} [c2] second column
             * @method repaintCells
             * @chainable
             */
            this.repaintCells = function(r1, c1, r2, c2) {
                var cols = this.getGridCols(),
                    rows = this.getGridRows(),
                    i    = 0;

                if (arguments.length === 2) {
                    c2 = c1;
                    r2 = r1;
                }

                if (r1 < 0) {
                    r1 = r2;
                } else if (r2 < 0) {
                    r2 = r1;
                }

                if (c1 < 0) {
                    c1 = c2;
                } else if (c2 < 0) {
                    c2 = c1;
                }

                if (c1 > c2) {
                    i = c2;
                    c2 = c1;
                    c1 = i;
                }

                if (r1 > r2) {
                    i = r2;
                    r2 = r1;
                    r1 = i;
                }

                if (r1 >= 0 && c1 >= 0 && r1 < rows && c1 < cols) {
                    if (c2 > cols) {
                        c2 = cols - 1;
                    }

                    if (r2 > rows) {
                        r2 = rows - 1;
                    }

                    var x1 = this.getColX(c1),
                        x2 = ((c1 === c2) ? x1 + 1 : this.getColX(c2)) + this.colWidths[c2],
                        y1 = this.getRowY(r1),
                        y2 = ((r1 === r2) ? y1 + 1 : this.getRowY(r2)) + this.rowHeights[r2];

                    this.repaint(x1 + this.scrollManager.getSX(),
                                 y1 + this.scrollManager.getSY(),
                                 x2 - x1, y2 - y1);
                }

                return this;
            };

            /**
             * Detect a cell by the given location
             * @param  {Integer} x a x coordinate relatively the grid component
             * @param  {Integer} y a y coordinate relatively the grid component
             * @return {Object} an object that contains detected grid cell row as
             * "row" field and a grid column as "col" field. null is returned if
             * no cell can be detected.
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
                    i   = 0,
                    ry2 = v.lr[1] + this.rowHeights[v.lr[0]] + dy,
                    rx2 = v.lc[1] + this.colWidths[v.lc[0]] + dx;

                if (y > ry1 && y < ry2) {
                    for(i = v.fr[0];i <= v.lr[0]; ry1 += this.rowHeights[i] + this.lineSize, i++) {
                        if (y > ry1 && y < ry1 + this.rowHeights[i]) {
                            row = i;
                            break;
                        }
                    }
                }
                if (x > rx1 && x < rx2) {
                    for (i = v.fc[0];i <= v.lc[0]; rx1 += this.colWidths[i] + this.lineSize, i++ ) {
                        if (x > rx1 && x < rx1 + this.colWidths[i]) {
                            col = i;
                            break;
                        }
                    }
                }
                return (col >= 0 && row >= 0) ? { row: row, col: col } : null;
            };

            this.doLayout = function(target) {
                var topHeight = (this.topCaption !== null &&
                                 this.topCaption.isVisible === true) ? this.topCaption.getPreferredSize().height
                                                                     : 0,
                    leftWidth = (this.leftCaption !== null &&
                                 this.leftCaption.isVisible === true) ? this.leftCaption.getPreferredSize().width : 0,
                    topY      = this.getTop(),
                    leftX     = this.getLeft();

                if (topHeight > 0) {
                //    topHeight += this.lineSize;
                    topY      += this.lineSize;
                }

                if (leftWidth > 0) {
                  //  leftWidth += this.lineSize;
                    leftX     += this.lineSize;
                }

                if (this.topCaption !== null){
                    this.topCaption.setBounds(leftX + leftWidth,
                                              topY,
                                              Math.min(target.width - this.getLeft() - this.getRight() - leftWidth,
                                                       this.psWidth_),
                                              topHeight);
                }

                if (this.leftCaption !== null){
                    this.leftCaption.setBounds(leftX,
                                               topY + topHeight,
                                               leftWidth,
                                               Math.min(target.height - this.getTop() - this.getBottom() - topHeight,
                                                        this.psHeight_));
                }

                if (this.stub !== null && this.stub.isVisible === true)
                {
                    if (leftWidth > 0 && topHeight > 0) {
                        this.stub.setBounds(leftX, topY,
                                            leftWidth,
                                            topHeight);
                    } else {
                        this.stub.setSize(0, 0);
                    }
                }

                if (this.editors !== null &&
                    this.editor  !== null &&
                    this.editor.parent === this &&
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

                    this.editor.setBounds(x + this.scrollManager.getSX(),
                                          y + this.scrollManager.getSY(), w, h);
                }
            };

            this.canHaveFocus = function (){
                return this.editor === null;
            };

            /**
             * Clear grid row or rows selection
             * @method clearSelect
             * @chainable
             */
            this.clearSelect = function() {
                if (this.selectMode !== null) {
                    this.selectMode.clearSelect();
                }
                return this;
            };

            /**
             * Mark as selected or unselected the given grid cell
             * @param  {Integer} row a grid row
             * @param  {Integer} [col] a grid row,
             * @param  {boolean} [b] a selection status. true if the parameter
             * has not been specified
             * @method select
             * @chainable
             */
            this.select = function(row, col, b) {
                if (this.selectMode !== null) {
                    if (arguments.length === 1) {
                        col = -1;
                        b   = false;
                    } else if (arguments.length === 2) {
                        if (zebkit.isInteger(col)) {
                            b = false;
                        } else {
                            b = col;
                            col = -1;
                        }
                    }

                    this.selectMode.select(row, col, b);
                }

                return this;
            };

            this.laidout = function () {
                this.vVisibility();
            };

            this.pointerClicked = function(e) {
                if (e.isAction() && this.visibility.hasVisibleCells()){
                    this.stopEditing(true);

                    if (e.isAction()){
                        var p = this.cellByLocation(e.x, e.y);
                        if (p !== null) {
                            if (this.position !== null){
                                var row = this.position.currentLine,
                                    col = this.position.currentCol,
                                    ls  = this.getLineSize(p.row),
                                    lns = this.getLines();

                                // normalize column depending on marker mode: row or cell
                                // in row mode marker can select only the whole row, so
                                // column can be only 1  (this.getLineSize returns 1)
                                if (row === p.row % lns && col === p.col % ls) {
                                    this.makeVisible(row, col);
                                } else {
                                    this.position.setRowCol(p.row % lns, p.col % ls);
                                }
                            }

                            if (this.$se(p.row, p.col, e)) {
                                // TODO: initiated editor has to get pointer clicked event
                            }
                        }
                    }
                }
            };

            this.calcPreferredSize = function(target) {
                return {
                    width : this.psWidth_  +
                           ((this.leftCaption !== null  &&
                             this.leftCaption.isVisible === true) ? this.leftCaption.getPreferredSize().width : 0),
                    height: this.psHeight_ +
                           ((this.topCaption !== null  &&
                             this.topCaption.isVisible === true) ? this.topCaption.getPreferredSize().height : 0)
                };
            };

            /**
             * Paint vertical and horizontal grid component lines
             * @param  {CanvasRenderingContext2D} g a HTML5 canvas 2D context
             * @method paintNet
             * @protected
             */
            this.paintNet = function(g) {
                var v    = this.visibility,
                    i    = 0,
                    prevWidth = g.lineWidth;

                g.setColor(this.lineColor);
                g.lineWidth = this.lineSize;
                g.beginPath();

                if (this.drawHorLines === true) {
                    var y  = v.fr[1] - this.lineSize / 2,
                        x1 = v.fc[1] - this.lineSize,
                        x2 = v.lc[1] + this.colWidths[v.lc[0]] + this.lineSize;

                    for (i = v.fr[0]; i <= v.lr[0] + 1; i++) {
                        g.moveTo(x1, y);
                        g.lineTo(x2, y);
                        y += this.rowHeights[i] + this.lineSize;
                    }
                }

                if (this.drawVerLines === true) {
                    var x   = v.fc[1] - this.lineSize / 2,
                        y1  = v.fr[1] - this.lineSize,
                        y2  = v.lr[1] + this.rowHeights[v.lr[0]];

                    for (i = v.fc[0]; i <= v.lc[0] + 1; i++) {
                        g.moveTo(x, y1);
                        g.lineTo(x, y2);
                        x += this.colWidths[i] + this.lineSize;
                    }
                }
                g.stroke();
                g.lineWidth = prevWidth;
            };

            /**
             * Paint grid data
             * @param  {CanvasRenderingContext2D} g a HTML5 canvas 2d context
             * @method paintData
             * @protected
             */
            this.paintData = function(g) {
                var y    = this.visibility.fr[1],
                    addW = this.cellInsetsLeft + this.cellInsetsRight,
                    addH = this.cellInsetsTop  + this.cellInsetsBottom,
                    ts   = g.$states[g.$curState],
                    cx   = ts.x,
                    cy   = ts.y,
                    cw   = ts.width,
                    ch   = ts.height,
                    res  = {};

                for(var i = this.visibility.fr[0];i <= this.visibility.lr[0] && y < cy + ch; i++) {
                    if (y + this.rowHeights[i] > cy) {
                        var x  = this.visibility.fc[1],
                            yv = y + this.cellInsetsTop;

                        for (var j = this.visibility.fc[0];j <= this.visibility.lc[0]; j++) {
                            if (this.isSelected(i, j) === true) {
                                this.paintCellSelection(g, i, j, x, y);
                            } else {
                                var bg = this.provider.getCellColor !== undefined ? this.provider.getCellColor(this, i, j)
                                                                                  : this.provider.background;
                                if (bg !== null) {
                                    if (bg.paint !== undefined) {
                                        bg.paint(g, x, y, this.colWidths[j], this.rowHeights[i], this);
                                    } else {
                                        g.setColor(bg);
                                        g.fillRect(x, y, this.colWidths[j], this.rowHeights[i]);
                                    }
                                }
                            }

                            var v = (i === this.editingRow &&
                                     j === this.editingCol   ) ? null
                                                               : this.provider.getView(this, i, j,
                                                                                       this.model.get(i, j));

                            if (v !== null) {
                                var xv = x + this.cellInsetsLeft,
                                    w  = this.colWidths[j]  - addW,
                                    h  = this.rowHeights[i] - addH;

                                res.x = xv > cx ? xv : cx;
                                res.width = Math.min(xv + w, cx + cw) - res.x;
                                res.y = yv > cy ? yv : cy;
                                res.height = Math.min(yv + h, cy + ch) - res.y;

                                if (res.width > 0 && res.height > 0) {
                                    // TODO: most likely the commented section should be removed
                                    // if (this.isUsePsMetric !== true) {
                                    //     v.paint(g, x, y, w, h, this);
                                    // }
                                    //else {
                                        var ax = this.provider.getXAlignment !== undefined ? this.provider.getXAlignment(this, i, j)
                                                                                           : this.defXAlignment,
                                            ay = this.provider.getYAlignment !== undefined ? this.provider.getYAlignment(this, i, j)
                                                                                           : this.defYAlignment,
                                            vw = w, // cell width
                                            vh = h, // cell height
                                            xx = xv,
                                            yy = yv,
                                            id = -1,
                                            ps = (ax !== null || ay !== null) ? v.getPreferredSize(vw, vh)
                                                                              : null;

                                        if (ax !== null) {
                                            xx = xv + ((ax === "center") ? Math.floor((w - ps.width) / 2)
                                                                         : ((ax === "right") ? w - ps.width : 0));
                                            vw = ps.width;
                                        }

                                        if (ay !== null) {
                                            yy = yv + ((ay === "center") ? Math.floor((h - ps.height) / 2)
                                                                         : ((ay === "bottom") ? h - ps.height : 0));
                                            vh = ps.height;
                                        }

                                        if (xx < res.x || yy < res.y || (xx + vw) > (xv + w) || (yy + vh) > (yv + h)) {
                                            id = g.save();
                                            g.clipRect(res.x, res.y, res.width, res.height);
                                        }

                                        v.paint(g, xx, yy, vw, vh, this);
                                        if (id >= 0) {
                                           g.restore();
                                        }
                                   // }
                                }
                            }
                            x += (this.colWidths[j] + this.lineSize);
                        }
                    }
                    y += (this.rowHeights[i] + this.lineSize);
                }
            };

            /**
             * Get position marker view taking in account focus state.
             * @return {zebkit.draw.View} a position marker view
             * @private
             * @method  $getPosMarker
             */
            this.$getPosMarker = function() {
                return this.hasFocus() ? (this.views.marker    === undefined ? null : this.views.marker)
                                       : (this.views.offmarker === undefined ? null : this.views.offmarker);
            };

            /**
             * Paint position marker.
             * @param  {CanvasRenderingContext2D} g a graphical 2D context
             * @protected
             * @method paintPosMarker
             */
            this.paintPosMarker = function(g) {
                if (this.position       !== null &&
                    this.position.offset >= 0       )
                {
                    var view = this.$getPosMarker(),
                        row  = this.position.currentLine,
                        col  = this.position.currentCol,
                        v    = this.visibility;

                    // depending on position changing mode (cell or row) analyze
                    // whether the current position is in visible area
                    if (view !== null) {
                        if (this.navigationMode === "row") {
                            if (row >= v.fr[0] && row <= v.lr[0]) {
                                view.paint(g,   v.fc[1],
                                                this.getRowY(row),
                                                v.lc[1] - v.fc[1] + this.colWidths[v.lc[0]],
                                                this.rowHeights[row], this);
                            }
                        } else if (this.navigationMode === "cell") {
                            if (col >= v.fc[0] && col <= v.lc[0] && row >= v.fr[0] && row <= v.lr[0]) {
                                view.paint(g,   this.getColX(col),
                                                this.getRowY(row),
                                                this.colWidths[col],
                                                this.rowHeights[row], this);
                            }
                        } else if (this.navigationMode === "col") {
                            if (col >= v.fc[0] && col <= v.lc[0]) {
                                view.paint(g,   this.getColX(col),
                                                v.fr[1],
                                                this.colWidths[col],
                                                v.lr[1] - v.fr[1] + this.rowHeights[v.lr[0]], this);
                            }
                        }
                    }
                }
            };

            /**
             * Paint a selection for the given grid cell
             * @param  {CanvasRenderingContext2D} g a graphical 2D context
             * @param  {Integer} row a cell row.
             * @param  {Integer} col a cell column.
             * @param  {Integer} x a cell x location.
             * @param  {Integer} y a cell y location.
             * @protected
             * @method paintCellSelection
             */
            this.paintCellSelection = function(g, row, col, x, y) {
                if (this.editingRow < 0) {
                    var v = ui.focusManager.focusOwner === this ? this.views.focusOnSelect
                                                                : this.views.focusOffSelect;
                    if (v !== null && v !== undefined)  {
                        v.paint(g, x, y, this.colWidths[col], this.rowHeights[row], this);
                    }
                }
            };

            this.rPsMetric = function(){
                var cols  = this.getGridCols(),
                    rows  = this.getGridRows(),
                    addW  = this.cellInsetsLeft + this.cellInsetsRight,
                    addH  = this.cellInsetsTop  + this.cellInsetsBottom,
                    capPS = null,
                    i     = 0;

                if (this.colWidths === null || this.colWidths.length !== cols) {
                    this.colWidths = Array(cols);
                    for (;i < cols; i++) {
                        this.colWidths[i] = 0;
                    }
                } else {
                    for (;i < cols; i++) {
                        this.colWidths[i] = 0;
                    }
                }

                if (this.rowHeights === null || this.rowHeights.length !== rows) {
                    this.rowHeights = Array(rows);
                    for (i = 0; i < rows; i++) {
                        this.rowHeights[i] = 0;
                    }
                } else {
                    for (i = 0;i < rows; i++) {
                        this.rowHeights[i] = 0;
                    }
                }

                for(i = 0; i < cols; i++ ){
                    for(var j = 0; j < rows; j++ ){
                        var v = this.provider.getView(this, j, i, this.model.get(j, i));
                        if (v !== null){
                            var ps = v.getPreferredSize();
                            ps.width  += addW;
                            ps.height += addH;
                            if (ps.width  > this.colWidths[i] ) {
                                this.colWidths [i] = ps.width;
                            }

                            if (ps.height > this.rowHeights[j]) {
                                this.rowHeights[j] = ps.height;
                            }
                        } else {
                            if (pkg.Grid.DEF_COLWIDTH > this.colWidths [i]) {
                                this.colWidths [i] = pkg.Grid.DEF_COLWIDTH;
                            }

                            if (pkg.Grid.DEF_ROWHEIGHT > this.rowHeights[j]) {
                                this.rowHeights[j] = pkg.Grid.DEF_ROWHEIGHT;
                            }
                        }
                    }
                }

                if (this.topCaption !== null && this.topCaption.isVisible === true) {
                    for(i = 0;i < cols; i++ ) {
                        capPS = this.topCaption.getCaptionPS(i);
                        if (capPS  > this.colWidths[i]) {
                            this.colWidths[i] = capPS;
                        }
                    }
                }

                if (this.leftCaption !== null && this.leftCaption.isVisible === true) {
                    for(i = 0;i < rows; i++ ) {
                        capPS = this.leftCaption.getCaptionPS(i);
                        if (capPS  > this.rowHeights[i]) {
                            this.rowHeights[i] = capPS;
                        }
                    }
                }
            };

            this.getPSSize = function (rowcol, b) {
                if (this.isUsePsMetric === true) {
                    return b ? this.getRowHeight(rowcol) : this.getColWidth(rowcol);
                } else {
                    var max   = 0,
                        count = b ? this.getGridCols()
                                  : this.getGridRows();

                    for(var j = 0;j < count; j ++ ){
                        var r = b ? rowcol : j,
                            c = b ? j : rowcol,
                            v = this.provider.getView(this, r, c, this.model.get(r, c));

                        if (v !== null){
                            var ps = v.getPreferredSize();
                            if (b) {
                                if (ps.height > max) {
                                    max = ps.height;
                                }
                            } else {
                                if (ps.width > max) {
                                    max = ps.width;
                                }
                            }
                        }
                    }

                    return max +
                           (b ? this.cellInsetsTop + this.cellInsetsBottom
                              : this.cellInsetsLeft + this.cellInsetsRight);
                }
            };

            this.rCustomMetric = function(){
                var start = 0;
                if (this.colWidths !== null) {
                    start = this.colWidths.length;
                    if (this.colWidths.length !== this.getGridCols()) {
                        this.colWidths.length = this.getGridCols();
                    }
                } else {
                    this.colWidths = Array(this.getGridCols());
                }

                for(; start < this.colWidths.length; start ++ ) {
                    this.colWidths[start] = pkg.Grid.DEF_COLWIDTH;
                }

                start = 0;
                if (this.rowHeights !== null) {
                    start = this.rowHeights.length;
                    if (this.rowHeights.length !== this.getGridRows()) {
                        this.rowHeights.length = this.getGridRows();
                    }
                } else {
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
            this.pageSize = function(d) {
                this.validate();
                if (this.visibility.hasVisibleCells() && this.position !== null) {
                    var off = this.position.offset;
                    if (off >= 0) {
                        var hh  = this.visibleArea.height - this.getTopCaptionHeight(),
                            sum = 0,
                            poff = off;

                        for (; off >= 0 && off < this.getGridRows() && sum < hh; off += d) {
                            sum += this.rowHeights[off] + this.lineSize;
                        }

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
             * @chainable
             */
            this.setRowHeight = function(row, h) {
                this.setRowsHeight(row, 1, h);
                return this;
            };

            /**
             * Set the given height for all or the specified range of rows
             * @param {Integer} [row] start row
             * @param {Integer} [len] number of rows whose height has to be set
             * @param {Integer} h  a height
             * @method setRowsHeight
             * @chainable
             */
            this.setRowsHeight = function(row, len, h) {
                if (this.isUsePsMetric === false){
                    if (arguments.length === 1) {
                        h   = arguments[0];
                        row = 0;
                        len = this.getGridRows();
                    }

                    if (len !== 0) {
                        this.validateMetric();
                        var b = false;
                        for(var i=row; i < row + len; i++) {
                            if (this.rowHeights[i] !== h) {
                                this.psHeight_ += (h - this.rowHeights[i]);
                                this.rowHeights[i] = h;
                                b = true;
                            }
                        }

                        if (b === true) {
                            this.stopEditing(false);

                            this.cachedHeight = this.getTop() + this.getBottom() + this.psHeight_;
                            if (this.topCaption !== null && this.topCaption.isVisible === true) {
                                this.cachedHeight += this.topCaption.getPreferredSize().height;
                            }

                            if (this.parent !== null) {
                                this.parent.invalidate();
                            }

                            this.iRowVisibility(0);
                            this.invalidateLayout();
                            this.repaint();
                        }
                    }

                    return this;
                }
            };

            /**
             * Set the given width for the specified grid column. The method has no effect
             * if the grid component is forced to use preferred size metric.
             * @param {Integer} column a grid column
             * @param {Integer} w   a width of the grid column
             * @method setColWidth
             * @chainable
             */
            this.setColWidth = function (col,w){
                this.setColsWidth(col, 1, w);
                return this;
            };

            /**
             * Set the given width for all or the specified range of columns
             * @param {Integer} [col] start column
             * @param {Integer} [len] number of columns whose height has to be set
             * @param {Integer} w  a width
             * @method setColsWidth
             * @chainable
             */
            this.setColsWidth = function(col, len, w){
                if (this.isUsePsMetric === false){
                    if (arguments.length === 1) {
                        w   = arguments[0];
                        col = 0;
                        len = this.getGridCols();
                    }

                    if (len !== 0)  {
                        this.validateMetric();
                        var b = false;
                        for(var i = col; i < col + len; i++) {
                            if (this.colWidths[i] !== w){
                                this.psWidth_ += (w - this.colWidths[i]);
                                this.colWidths[i] = w;
                                b = true;
                            }
                        }

                        if (b === true) {
                            this.stopEditing(false);

                            this.cachedWidth = this.getRight() + this.getLeft() + this.psWidth_;
                            if (this.leftCaption !== null && this.leftCaption.isVisible === true) {
                                this.cachedWidth += this.leftCaption.getPreferredSize().width;
                            }

                            if (this.parent !== null) {
                                this.parent.invalidate();
                            }

                            this.iColVisibility(0);
                            this.invalidateLayout();
                            this.repaint();
                        }
                    }

                    return this;
                }
            };

            this.matrixResized = function(target, prevRows, prevCols) {
                this.clearSelect();

                this.vrp();
                if (this.position !== null) {
                    this.position.setOffset(null);
                }

                for(var i = 0; i < this.kids.length; i++) {
                    if (this.kids[i].matrixResized !== undefined) {
                        this.kids[i].matrixResized(target,prevRows,prevCols);
                    }
                }
            };

            this.cellModified = function(target,row,col,prevValue) {
                if (this.isUsePsMetric){
                    this.invalidate();
                }

                for(var i=0; i < this.kids.length; i++) {
                    if (this.kids[i].cellModified !== undefined) {
                        this.kids[i].cellModified(target,row,col, prevValue);
                    }
                }
            };

            this.matrixSorted = function(target, info) {
                this.clearSelect();
                this.vrp();

                for(var i=0; i < this.kids.length; i++) {
                    if (this.kids[i].matrixSorted !== undefined) {
                        this.kids[i].matrixSorted(target, info);
                    }
                }
            };

            /**
             * Set the given editor provider. Editor provider is a way to customize
             * cell editing.
             * @param {Object} p an editor provider
             * @method setEditorProvider
             * @chainable
             */
            this.setEditorProvider = function(p){
                if (p !== this.editors){
                    this.stopEditing(true);
                    this.editors = p;
                }
                return this;
            };

            /**
             * Force to size grid columns and rows according to its preferred size
             * @param {Boolean} b use true to use preferred size
             * @method setUsePsMetric
             * @chainable
             */
            this.setUsePsMetric = function(b){
                if (this.isUsePsMetric !== b){
                    this.isUsePsMetric = b;
                    this.vrp();
                }
                return this;
            };

            /**
             * Set the position controller.
             * @param {zebkit.util.Position} p a position controller
             * @method setPosition
             * @chainable
             */
            this.setPosition = function(p){
                if (this.position !== p){
                    if (this.position !== null) {
                        this.position.off(this);
                    }

                    /**
                     * Virtual cursor position controller
                     * @readOnly
                     * @attribute position
                     * @type {zebkit.util.Position}
                     */
                    this.position = p;
                    if (this.position !== null) {
                        this.position.on(this);
                        this.position.setMetric(this);
                    }
                    this.repaint();
                }

                return this;
            };

            /**
             * Set the given cell view provider. Provider is a special
             * class that says how grid cells content has to be rendered,
             * aligned, colored
             * @param {Object} p a view provider
             * @method setViewProvider
             * @chainable
             */
            this.setViewProvider = function(p){
                if (this.provider !== p){
                    this.provider = p;
                    this.vrp();
                }
                return this;
            };

            /**
             * Set the given matrix model to be visualized and controlled
             * with the grid component
             * @param {zebkit.data.Matrix|Array} d a model passed as an
             * instance of  matrix model or an array that contains
             * model rows as embedded arrays.
             * @method setModel
             * @chainable
             */
            this.setModel = function(d){
                if (d !== this.model) {
                    this.clearSelect();
                    if (Array.isArray(d)) {
                        d = new this.clazz.Matrix(d);
                    }

                    if (this.model !== null) {
                        this.model.off(this);
                    }

                    this.model = d;
                    if (this.model !== null) {
                        this.model.on(this);
                    }

                    if (this.position !== null) {
                        this.position.setOffset(null);
                    }

                    this.vrp();
                }

                return this;
            };

            /**
             * Set the given top, left, right, bottom cell paddings
             * @param {Integer} p a top, left, right and bottom cell paddings
             * @method setCellPadding
             * @chainable
             */
            this.setCellPadding = function (p){
                return this.setCellPaddings(p,p,p,p);
            };

            /**
             * Set the given top, left, right, bottom cell paddings
             * @param {Integer} t a top cell padding
             * @param {Integer} l a left cell padding
             * @param {Integer} b a bottom cell padding
             * @param {Integer} r a right cell padding
             * @method setCellPaddings
             * @chainable
             */
            this.setCellPaddings = function (t,l,b,r){
                if (t !== this.cellInsetsTop    || l !== this.cellInsetsLeft ||
                    b !== this.cellInsetsBottom || r !== this.cellInsetsRight)
                {
                    this.cellInsetsTop = t;
                    this.cellInsetsLeft = l;
                    this.cellInsetsBottom = b;
                    this.cellInsetsRight = r;
                    this.vrp();
                }

                return this;
            };

            /**
             * Set the given color to render the grid vertical and horizontal lines
             * @param {String} c a color
             * @method setLineColor
             * @chainable
             */
            this.setLineColor = function (c){
                if (c !== this.lineColor){
                    this.lineColor = c;
                    if (this.drawVerLines || this.drawHorLines) {
                        this.repaint();
                    }
                }
                return this;
            };

            /**
             * Control rendering of grid lines on grid caption.
             * @param {Boolean} b a flag to control lines rendering on caption
             * @method setDrawCaptionLines
             * @chainable
             */
            this.setDrawCaptionLines = function (b){
                if (b !== this.drawCaptionLines){
                    this.drawCaptionLines = b;
                    this.vrp();
                }
                return this;
            };

            /**
             * Set the given grid lines size
             * @param {Integer} s a size
             * @method setLineSize
             * @chainable
             */
            this.setLineSize = function (s){
                if (s !== this.lineSize){
                    this.lineSize = s;
                    this.vrp();
                }
                return this;
            };

            /**
             * Start editing the given grid cell. Editing is initiated only if an editor
             * provider has been set and the editor provider defines not-null UI component
             * as an editor for the given cell.
             * @param  {Integer} row a grid cell row
             * @param  {Integer} col a grid cell column
             * @return {Boolean}  true if a cell editor has been initiated, otherwise
             * returns false.
             * @method startEditing
             */
            this.startEditing = function(row, col){
                this.stopEditing(true);
                if (this.editors !== null) {
                    var editor = this.editors.getEditor(this, row, col,
                                                        this.getDataToEdit(row, col));

                    if (editor !== null){
                        this.editingRow = row;
                        this.editingCol = col;
                        if (editor.isPopupEditor === true) {
                            var p = zebkit.layout.toParentOrigin(this.getColX(col) + this.scrollManager.getSX(),
                                                                 this.getRowY(row) + this.scrollManager.getSY(),
                                                                 this);

                            editor.setLocation(p.x, p.y);
                            ui.makeFullyVisible(this.getCanvas(), editor);
                            this.editor = editor;

                            var $this = this;
                            this.editor.winOpened = function(e) {
                                if (e.isShown === false){
                                    $this.stopEditing(e.source.isAccepted !== undefined ? e.source.isAccepted() : false);
                                }
                            };
                            ui.showModalWindow(this, editor, this);
                        } else {
                            this.add("editor", editor);
                            this.repaintRows(this.editingRow, this.editingRow);
                        }
                        ui.focusManager.requestFocus(editor);

                        return true;
                    }
                }
                return false;
            };

            /**
             * Fetch a data from matrix model that has to be edited
             * @param  {Integer} row a row
             * @param  {Integer} col a column
             * @return {Object} a matrix model data to be edited
             * @method getDataToEdit
             * @protected
             */
            this.getDataToEdit = function (row, col){
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

            /**
             * Set the grid left caption titles
             * @param title* number of titles
             * @method setLeftCaption
             * @chainable
             */
            this.setLeftCaption = function() {
                if (this.leftCaption !== null) {
                    this.leftCaption.removeMe();
                }

                var a = Array.prototype.slice.call(arguments);
                this.add("left", this.$hasPanelIn(a) ? new pkg.CompGridCaption(a)
                                                     : new pkg.GridCaption(a));
                return this;
            };

            /**
             * Set the grid top caption titles
             * @param title* number of titles
             * @method setTopCaption
             * @chainable
             */
            this.setTopCaption = function() {
                if (this.topCaption !== null) {
                    this.topCaption.removeMe();
                }

                var a = Array.prototype.slice.call(arguments);
                this.add("top", this.$hasPanelIn(a) ? new pkg.CompGridCaption(a)
                                                    : new pkg.GridCaption(a));
                return this;
            };

            this.$hasPanelIn = function(a) {
                for(var i = 0; i < a.length; i++) {
                    if (zebkit.instanceOf(a[i], zebkit.ui.Panel)) {
                        return true;
                    }
                }

                return false;
            };
        },

        function focused() {
            this.$super();
            this.repaint();
        },

        function invalidate(){
            this.$super();
            this.iColVisibility(0);
            this.iRowVisibility(0);
        },

        function kidAdded(index, ctr, c){
            this.$super(index, ctr, c);

            if ((ctr === null && this.topCaption === null) || "top" === ctr){
                this.topCaption = c;
            } else if ("editor" === ctr) {
                this.editor = c;
            } else if ((ctr === null && this.leftCaption === null) || "left" === ctr) {
                this.leftCaption = c;
            } else if ((ctr === null && this.stub === null) || "corner" === ctr){
                this.stub = c;
            }
        },

        function kidRemoved(index, c, ctr) {
            this.$super(index, c, ctr);
            if (c === this.editor) {
                this.editor = null;
            } else if (c === this.topCaption) {
                this.topCaption = null;
            } else if (c === this.leftCaption){
                this.leftCaption = null;
            } else if (c === this.stub) {
                this.stub = null;
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
         *         "focusOnSelect" : <view to render selected row for the grid that holds focus>,
         *         "focusOffSelect": <view to render selected row for the grid that doesn't hold focus>
         *      }
         *
         *
         *  @method  setViews
         */
    ]).events("selected");
});
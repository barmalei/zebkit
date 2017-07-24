zebkit.package("ui.grid", function(pkg, Class) {
    var ui = pkg.cd("..");

    /**
     * Special UI panel that manages to stretch grid columns to occupy the whole panel space.
     *
     *     ...
     *
     *     var canvas = new zebkit.ui.zCanvas(),
     *         grid = new zebkit.ui.grid.Grid(100,10),
     *         pan  = new zebkit.ui.grid.GridStretchPan(grid);
     *
     *     canvas.root.setLayout(new zebkit.layout.BorderLayout());
     *     canvas.root.add("center", pan);
     *
     *     ...
     *
     * @constructor
     * @param {zebkit.ui.grid.Grid} grid a grid component that has to be added in the panel
     * @class zebkit.ui.grid.GridStretchPan
     * @extends zebkit.ui.Panel
     */
    pkg.GridStretchPan = Class(ui.Panel, [
        function (grid){
            this.$super(this);

            this.grid = grid;

            this.$widths = [];
            this.$prevWidth = 0;
            this.$propW = -1;
            this.add(grid);
        },

        function $prototype() {
            this.$props = this.$strPs = null;

            /**
             * Target grid component
             * @type {zebkit.ui.Grid}
             * @readOnly
             * @attribute grid
             */
            this.grid = null;

            this.calcPreferredSize = function(target) {
                this.recalcPS();
                return (target.kids.length === 0 ||
                        target.grid.isVisible === false) ? { width:0, height:0 }
                                                         : { width:this.$strPs.width,
                                                             height:this.$strPs.height };
            };

            this.doLayout = function(target){
                this.recalcPS();
                if (target.kids.length > 0){
                    var grid = this.grid,
                        left = target.getLeft(),
                        top  = target.getTop();

                    if (grid.isVisible === true) {
                        grid.setBounds(left, top,
                                       target.width  - left - target.getRight(),
                                       target.height - top  - target.getBottom());

                        for(var i = 0; i < this.$widths.length; i++) {
                            grid.setColWidth(i, this.$widths[i]);
                        }
                    }
                }
            };

            this.captionResized = function(src, col, pw){
                if (col < this.$widths.length - 1) {
                    var grid = this.grid,
                        w    = grid.getColWidth(col),
                        dt   = w - pw;

                    if (dt < 0) {
                        grid.setColWidth(col + 1, grid.getColWidth(col + 1) - dt);
                    } else {
                        var ww = grid.getColWidth(col + 1) - dt,
                            mw = this.getMinWidth();

                        if (ww < mw) {
                            grid.setColWidth(col, w - (mw - ww));
                            grid.setColWidth(col + 1, mw);
                        } else {
                            grid.setColWidth(col + 1, ww);
                        }
                    }

                    this.$propW = -1;
                }
            };

            this.getMinWidth = function () {
                return zebkit.instanceOf(this.grid.topCaption, pkg.BaseCaption) ? this.grid.topCaption.minSize
                                                                                : 10;
            };

            this.calcColWidths = function(targetAreaW){
                var grid = this.grid,
                    cols = grid.getGridCols(),
                    ew   = targetAreaW - (cols + 1) * grid.lineSize,
                    sw   = 0;

                if (this.$widths.length !== cols) {
                    this.$widths = Array(cols);
                }

                for(var i = 0; i < cols; i++){
                    if (this.$props.length - 1 === i) {
                        this.$widths[i] = ew - sw;
                    } else {
                        this.$widths[i] = Math.round(ew * this.$props[i]);
                        sw += this.$widths[i];
                    }
                }
            };

            this.recalcPS = function (){
                var grid = this.grid;
                if (grid !== null && grid.isVisible === true) {
                    // calculate size excluding padding where
                    // the target grid columns have to be stretched
                    var p        = this.parent,
                        isScr    = zebkit.instanceOf(p, ui.ScrollPan),
                        taWidth  = (isScr ? p.width - p.getLeft() - p.getRight() - this.getRight() - this.getLeft()
                                          : this.width - this.getRight() - this.getLeft()),
                        taHeight = (isScr ? p.height - p.getTop() - p.getBottom() - this.getBottom() - this.getTop()
                                          : this.height - this.getBottom() - this.getTop());

                    // exclude left caption
                    if (this.grid.leftCaption !== null &&
                        this.grid.leftCaption.isVisible === true)
                    {
                        taWidth -= (this.grid.leftCaption.getPreferredSize().width + this.grid.lineSize);
                    }

                    taWidth -= (this.grid.getLeft() + this.grid.getRight());

                    if (this.$strPs === null || this.$prevWidth !== taWidth) {
                        var cols = grid.getGridCols();
                        if (this.$propW < 0 || this.$props === null || this.$props.length !== cols) {
                            // calculate col proportions
                            if (this.$props === null || this.$props.length !== cols) {
                                this.$props = Array(cols);
                            }
                            this.$propW = 0;

                            var i = 0, w = 0;

                            for(i = 0; i < cols; i++){
                                w = grid.getColWidth(i);
                                if (w === 0) {
                                    w = grid.getColPSWidth(i);
                                }
                                this.$propW += w;
                            }

                            for(i = 0; i < cols; i++){
                                w = grid.getColWidth(i);
                                if (w === 0) {
                                    w = grid.getColPSWidth(i);
                                }
                                this.$props[i] = w / this.$propW;
                            }
                        }

                        this.$prevWidth  = taWidth;
                        this.calcColWidths(taWidth);
                        this.$strPs  = {
                            width : taWidth,
                            height: grid.getPreferredSize().height
                        };

                        // check if the calculated height is greater than
                        // height of the parent component and re-calculate
                        // the metrics if vertical scroll bar is required
                        // taking in account horizontal reduction because of
                        // the scroll bar visibility
                        if (isScr === true &&
                            p.height > 0 &&
                            (typeof p.vBar !== 'undefined' || p.vBar === null) &&
                            p.autoHide === false &&
                            taHeight < this.$strPs.height)
                        {
                            taWidth -= p.vBar.getPreferredSize().width;
                            this.calcColWidths(taWidth);
                            this.$strPs.width = taWidth;
                        }
                    }
                }
            };
        },

        function kidAdded(index,constr,l){
            this.$propsW = -1;
            if (l.topCaption !== null) {
                l.topCaption.on(this);
            }
            this.scrollManager = l.scrollManager;
            this.$super(index, constr, l);
        },

        function kidRemoved(i,l){
            this.$propsW = -1;
            if (l.topCaption !== null) {
                l.topCaption.off(this);
            }
            this.scrollManager = null;
            this.$super(i, l);
        },

        function invalidate(){
            this.$strPs = null;
            this.$super();
        }
    ]);
});
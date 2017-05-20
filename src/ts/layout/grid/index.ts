import Layout from '..';
import Constraints from './Constraints';

/**
 * Grid layout manager. can be used to split a component area to
 * number of virtual cells where children components can be placed.
 * The way how the children components have to be laid out in the cells can
 * be customized by using "zebkit.layout.Constraints" class:

        // create constraints
        var ctr = new zebkit.layout.Constraints();

        // specify cell top, left, right, bottom paddings
        ctr.setPadding(8);
        // say the component has to be left aligned in a
        // virtual cell of grid layout
        ctr.ax = "left";

        // create panel and set grid layout manager with two
        // virtual rows and columns
        var p = new zebkit.ui.Panel();
        p.setLayout(new zebkit.layout.GridLayout(2,2));

        // add children component
        p.add(ctr, new zebkit.ui.Label("Cell 1,1"));
        p.add(ctr, new zebkit.ui.Label("Cell 1,2"));
        p.add(ctr, new zebkit.ui.Label("Cell 2,1"));
        p.add(ctr, new zebkit.ui.Label("Cell 2,2"));

 * @param {Integer} rows a number of virtual rows to layout
 * children components
 * @param {Integer} cols a number of virtual columns to
 * layout children components
 * @param {String} [ax] horizontal alignment
 * @param {String} [ay] vertical alignment
 * layout children components
 * @constructor
 * @class  zebkit.layout.GridLayout
 * @extends {zebkit.layout.Layout}
 */
class GridLayout extends Layout {
    constructor(r, c, stretchRows, stretchCols) {
        this.stretchCols = this.stretchRows = false;
        /**
         * Number of virtual rows to place children components
         * @attribute rows
         * @readOnly
         * @type {Integer}
         */
        this.rows = r;

        /**
         * Number of virtual columns to place children components
         * @attribute cols
         * @readOnly
         * @type {Integer}
         */
        this.cols = c;

        this.colSizes = Array(c + 1);
        this.rowSizes = Array(r + 1);

        /**
         * Default constraints that is applied for children components
         * that doesn't define own constraints
         * @type {zebkit.layout.Constraints}
         * @attribute constraints
         */
        this.constraints = new pkg.Constraints();

        if (arguments.length > 2) this.stretchRows = stretchRows === true;
        if (arguments.length > 3) this.stretchCols = stretchCols === true;
    }

    setPadding() {
        this.constraints.setPadding.apply(this.constraints, arguments);
        return this;
    }

    setDefaultConstraints(c) {
        this.constraints = c;
        return this;
    }

    /**
     * Calculate columns metrics
     * @param  {zebkit.layout.Layoutable} c the target container
     * @return {Array} a columns widths
     * @method calcCols
     * @protected
     */
    calcCols(c){
        this.colSizes[this.cols] = 0;
        for(var i = 0;i < this.cols; i++) {
            this.colSizes[i] = this.calcCol(i, c);
            this.colSizes[this.cols] += this.colSizes[i];
        }
        return this.colSizes;
    };

    /**
     * Calculate rows metrics
     * @param  {zebkit.layout.Layoutable} c the target container
     * @return {Array} a rows heights
     * @method calcRows
     * @protected
     */
    calcRows(c){
        this.rowSizes[this.rows] = 0;
        for(var i = 0;i < this.rows; i++) {
            this.rowSizes[i] = this.calcRow(i, c);
            this.rowSizes[this.rows] += this.rowSizes[i];
        }
        return this.rowSizes;
    }

    /**
     * Calculate the given row height
     * @param  {Integer} row a row
     * @param  {zebkit.layout.Layoutable} c the target container
     * @return {Integer} a size of the row
     * @method calcRow
     * @protected
     */
    calcRow(row, c){
        var max = 0, s = row * this.cols;
        for (var i = s; i < c.kids.length && i < s + this.cols; i++) {
            var a = c.kids[i];
            if (a.isVisible === true) {
                var arg = a.constraints || this.constraints,
                    d   = a.getPreferredSize().height;

                d += (arg.top + arg.bottom);
                if (d > max) max = d;
            }
        }
        return max;
    }

    /**
     * Calculate the given column width
     * @param  {Integer} col a column
     * @param  {zebkit.layout.Layoutable} c the target container
     * @return {Integer} a size of the column
     * @method calcCol
     * @protected
     */
    calcCol(col, c){
        var max = 0;

        for(var i = col; i < c.kids.length; i += this.cols) {
            var a = c.kids[i];
            if (a.isVisible === true) {
                var arg = a.constraints || this.constraints,
                    d   = a.getPreferredSize().width + arg.left + arg.right;

                if (d > max) max = d;
            }
        }
        return max;
    }

    calcPreferredSize(c){
        return { width : this.calcCols(c)[this.cols],
                  height: this.calcRows(c)[this.rows] };
    };

    doLayout(c){
        var rows     = this.rows,
            cols     = this.cols,
            colSizes = this.calcCols(c),
            rowSizes = this.calcRows(c),
            top      = c.getTop(),
            left     = c.getLeft();

        if (this.stretchCols) {
            var dw = c.width - left - c.getRight() - colSizes[cols];
            for(var i = 0;i < cols; i ++ ) {
                colSizes[i] = colSizes[i] + (colSizes[i] !== 0 ? Math.floor((dw * colSizes[i]) / colSizes[cols]) : 0);
            }
        }

        if (this.stretchRows) {
            var dh = c.height - top - c.getBottom() - rowSizes[rows];
            for(var i = 0;i < rows; i++) {
                rowSizes[i] = rowSizes[i] + (rowSizes[i] !== 0 ? Math.floor((dh * rowSizes[i]) / rowSizes[rows]) : 0);
            }
        }

        var cc = 0;
        for (var i = 0; i < rows && cc < c.kids.length; i++) {
            var xx = left;
            for(var j = 0;j < cols && cc < c.kids.length; j++, cc++){
                var l = c.kids[cc];
                if (l.isVisible === true){
                    var arg   = l.constraints || this.constraints,
                        d     = l.getPreferredSize(),
                        cellW = colSizes[j],
                        cellH = rowSizes[i];

                    cellW -= (arg.left + arg.right);
                    cellH -= (arg.top  + arg.bottom);

                    if ("stretch" === arg.ax) d.width  = cellW;
                    if ("stretch" === arg.ay) d.height = cellH;

                    l.setSize(d.width, d.height);
                    l.setLocation(
                        xx  + arg.left + ("stretch" === arg.ax ? 0
                                                                : ((arg.ax === "right") ? cellW - d.width
                                                                                        : ((arg.ax === "center") ? Math.floor((cellW - d.width) / 2)
                                                                                                                : 0))),
                        top + arg.top  + ("stretch" === arg.ay ? 0
                                                                : ((arg.ay === "bottom" ) ? cellH - d.height
                                                                                          : ((arg.ay === "center") ? Math.floor((cellH - d.height) / 2)
                                                                                                                  : 0)))
                    );

                    xx += colSizes[j];
                }
            }
            top += rowSizes[i];
        }
    }
}

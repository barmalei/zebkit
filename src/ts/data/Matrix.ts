/**
 *  Matrix model class.
 *  @constructor
 *  @param  {Array of Array} [data] the given data
 *  @param  {Integer} [rows] a number of rows
 *  @param  {Integer} [cols] a number of columns
 *  @class zebkit.data.Matrix
 */

/**
 * Fired when the matrix model size (number of rows or columns) is changed.

    matrix.bind(function matrixResized(src, pr, pc) {
    ...
    });

    * @event matrixResized
    * @param {zebkit.data.Matrix} src a matrix that triggers the event
    * @param {Integer}  pr a previous number of rows
    * @param {Integer}  pc a previous number of columns
    */

    /**
     * Fired when the matrix model cell has been updated.

    matrix.bind(function cellModified(src, row, col, old) {
        ...
    });

    * @event cellModified
    * @param {zebkit.data.Matrix} src a matrix that triggers the event
    * @param {Integer}  row an updated row
    * @param {Integer}  col an updated column
    * @param {Object}  old a previous cell value
    */

    /**
     * Fired when the matrix data has been re-ordered.

    matrix.bind(function matrixSorted(src, sortInfo) {
        ...
    });

    * @event matrixSorted
    * @param {zebkit.data.Matrix} src a matrix that triggers the event
    * @param {Object}  sortInfo a new data order info. The information
    * contains:
    *
    *      {
    *         func: sortFunction,
    *         name: sortFunctionName,
    *         col : sortColumn
    *      }
    *
*/

class Matrix {
    $clazz = () {
        this.Listeners = zebkit.util.ListenersClass("matrixResized", "cellModified",
                                                   "matrixSorted", "matrixRowInserted",
                                                   "matrixColInserted");
    }

    constructor() {
        /**
         * Number of rows in the matrix model
         * @attribute rows
         * @type {Integer}
         * @readOnly
         */

        /**
         * Number of columns in the matrix model
         * @attribute cols
         * @type {Integer}
         * @readOnly
         */

        this._ = new this.clazz.Listeners();
        if (arguments.length === 1) {
            this.objs = arguments[0];
            this.cols = (this.objs.length > 0) ? this.objs[0].length : 0;
            this.rows = this.objs.length;
        } else {
            this.objs = [];
            this.rows = this.cols = 0;
            if (arguments.length > 1) {
                this.setRowsCols(arguments[0], arguments[1]);
            }
        }
    }

    /**
     * Get a matrix model cell value at the specified row and column
     * @method at
     * @param  {Integer} row a cell row
     * @param  {Integer} col a cell column
     * @return {Object}  matrix model cell value
     */
    at(row,col){
        if (row < 0 || row >= this.rows) {
            throw new RangeError(row);
        }

        if (col < 0 || col >= this.cols) {
            throw new RangeError(col);
        }

        return this.objs[row] == null ? undefined : this.objs[row][col];
    }

    /**
     * Get a matrix model cell value by the specified index
     * @method atIndex
     * @param  {Integer} index a cell index
     * @return {Object}  matrix model cell value
     */
    atIndex(i) {
        return this.get(~~(i / this.cols), i % this.cols);
    };

    /**
     * Set the specified by row and column cell value. If the specified row or column
     * is greater than the matrix model has the model size will be adjusted to new one.
     * @method put
     * @param  {Integer} row a cell row
     * @param  {Integer} col a cell column
     * @param  {Object} obj a new cell value
     */
    put(row,col,obj) {
        var nr = this.rows,
            nc = this.cols;

        if (row >= nr) nr += (row - nr + 1);
        if (col >= nc) nc += (col - nc + 1);

        this.setRowsCols(nr, nc);
        var old = this.objs[row] != null ? this.objs[row][col] : undefined;
        if (obj != old) {

            // allocate array if no data for the given row exists
            if (this.objs[row] == null) this.objs[row] = [];
            this.objs[row][col] = obj;
            this._.cellModified(this, row, col, old);
        }
    }

    /**
     * Set the specified by index cell value. The index identifies cell starting from [0,0]
     * cell till [rows,columns]. If the index is greater than size of model the model size
     * will be adjusted to new one.
     * @method putAt
     * @param  {Integer} i a cell row
     * @param  {Object} obj a new cell value
     */
    putAt(i, obj){
        this.put( ~~(i / this.cols),
                        i % this.cols, obj);
    }

    /**
     * Set the given number of rows and columns the model has to have.
     * @method setRowsCols
     * @param  {Integer} rows a new number of rows
     * @param  {Integer} cols a new number of columns
     */
    setRowsCols(rows, cols){
        if (rows != this.rows || cols != this.cols){
            var pc = this.cols,
                pr = this.rows;

            this.cols = cols;
            this.rows = rows;

            // re-locate matrix space
            if (this.objs.length > rows) {
                this.objs.length = rows;   // shrink number of rows
            }

            // shrink columns
            if (pc > cols) {
                for(var i = 0; i < this.objs.length; i++) {
                    // check if data for columns has been allocated and the size
                    // is greater than set number of columns
                    if (this.objs[i] != null && this.objs[i].length > cols) {
                        this.objs[i].length = cols;
                    }
                }
            }

            this._.matrixResized(this, pr, pc);
        }
    }

        /**
     * Set the given number of rows the model has to have.
     * @method setRows
     * @param  {Integer} rows a new number of rows
     */
    setRows(rows) {
        this.setRowsCols(rows, this.cols);
    }

    /**
     * Set the given number of columns the model has to have.
     * @method setCols
     * @param  {Integer} cols a new number of columns
     */
    setCols(cols) {
        this.setRowsCols(this.rows, cols);
    }

    /**
     * Remove specified number of rows from the model starting
     * from the given row.
     * @method removeRows
     * @param  {Integer} begrow a start row
     * @param  {Integer} count  a number of rows to be removed
     */
    removeRows(begrow,count) {
        if (arguments.length === 1) {
            count = 1;
        }

        if (begrow < 0 || begrow + count > this.rows) {
            throw new RangeError(begrow);
        }

        this.objs.splice(begrow, count);
        this.rows -= count;
        this._.matrixResized(this, this.rows + count, this.cols);
    }

    /**
     * Remove specified number of columns from the model starting
     * from the given column.
     * @method removeCols
     * @param  {Integer}  begcol a start column
     * @param  {Integer} count  a number of columns to be removed
     */
    removeCols(begcol,count){
        if (arguments.length === 1) {
            count = 1;
        }

        if (begcol < 0 || begcol + count > this.cols) {
            throw new RangeError(begcol);
        }

        for(var i = 0; i < this.objs.length; i++) {
            if (this.objs[i] != null && this.objs[i].length > 0) {
                this.objs[i].splice(begcol, count);
            }
        }

        this.cols -= count;
        this._.matrixResized(this, this.rows, this.cols + count);
    }

    /**
     * Insert the given number of rows at the specified row
     * @param  {Integer} row   a starting row to insert
     * @param  {Integer} count a number of rows to be added
     * @method insertRows
     */
    insertRows(row, count) {
        if (arguments.length === 1) {
            count = 1;
        }

        if (row <= this.objs.length - 1) {
            for(var i = 0; i < count; i++) {
                this.objs.splice(row, 0, undefined);
                this._.matrixRowInserted(this, row + i);
            }
        }
        else {
            for(var i = 0; i < count; i++) {
                this._.matrixRowInserted(this, row + i);
            }
        }

        this.rows += count;
        this._.matrixResized(this, this.rows - count, this.cols);
    }

    /**
     * Insert the given number of columns at the specified column
     * @param  {Integer} col   a starting column to insert
     * @param  {Integer} count a number of columns to be added
     * @method insertCols
     */
    insertCols(col, count) {
        if (arguments.length === 1) {
            count = 1;
        }

        if (this.objs.length  > 0) {
            for(var j = 0; j < count; j++) {
                for(var i = 0; i < this.rows; i++) {
                    if (this.objs[i] != null && j <= this.objs[i].length) {
                        this.objs[i].splice(col, 0, undefined);
                    }
                }
                this._.matrixColInserted(this, col + j);
            }
        }

        this.cols += count;
        this._.matrixResized(this, this.rows, this.cols - count);
    }

    /**
     * Sort the given column of the matrix model.
     * @param  {Integer} col a column to be re-ordered
     * @param  {Function} [f] an optional sort function. The name of the function
     * is grabbed to indicate type of the sorting the method does. For instance:
     * "descent", "ascent".
     * @method sortCol
     */
    sortCol(col, f) {
        if (f == null) {
            f = pkg.descent;
        }

        this.objs.sort(function(a, b) {
            return f(a[col], b[col]);
        });

        this._.matrixSorted(this, { col : col,
                                    func: f,
                                    name: zebkit.$FN(f).toLowerCase() });
    }

}
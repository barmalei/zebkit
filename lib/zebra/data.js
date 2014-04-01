/**
 * Collection of variouse data models. 
 * @module data
 * @main 
 * @requires zebra, util
 */

(function(pkg, Class, Interface) {

pkg.descent = function descent(a, b) {
    if (a == null) return 1;
    return (zebra.isString(a)) ? a.localeCompare(b) : a - b;
};

pkg.ascent = function ascent(a, b) {
    if (b == null) return 1;
    return (zebra.isString(b)) ? b.localeCompare(a) : b - a;
};


/**
 * Text model interface
 * @class zebra.data.TextModel
 * @interface
*/

/**
 * Get the given string line stored in the model
 * @method getLine  
 * @param  {Integer} line a line number
 * @return {String}  a string line
 */

/**
 * Get wrapped by the text model original text string 
 * @method getValue
 * @return {String} an original text
 */

/**
 * Get number of lines stored in the text model
 * @method getLines
 * @return {Integer} a number of lines
 */

/**
 * Get number of characters stored in the model 
 * @method getTextLength
 * @return {Integer} a number of characters
 */

/**
 * Write the given string in the text model starting from the
 * specified offset
 * @method write
 * @param  {String} s a string to be written into the text model 
 * @param  {Integer} offset an offset starting from that the passed
 * string has to be written into the text model
 */

/**
 * Remove substring from the text model. 
 * @method remove
 * @param  {Integer} offset an offset starting from that a substring 
 * will be removed 
 * @param  {Integer} size a size of a substring to be removed 
 */

/**
 * Fill the text model with the given text  
 * @method  setValue
 * @param  {String} text a new text to be set for the text model
 */

/**
 * Fired when the text model has been updated: a string has been 
 * inserted or removed

        text.bind(function (src, b, off, len, startLine, lines) {
            ...
        });

 *
 * @event textUpdated 
 * @param {zebra.data.Text} src a text model that triggers the event
 * @param {Boolean}  b a flag that is true if a string has been written 
 * in the text model, false if the model substring has been removed
 * @param {Integer}  off an offset starting form that the text update 
 * took place
 * @param {Integer}  len a length of text that has been affected by 
 * the text model update
 * @param {Integer}  startLine a first line that has been affected 
 * by the text model update
 * @param {Integer}  lines a number of lines that has been affected 
 * by the text model update
 */
pkg.TextModel = Interface();


var MB = zebra.util, oobi = "Index is out of bounds: ";

function Line(s) {
    this.s = s;
    this.l = 0;
}

//  toString for array.join method
Line.prototype.toString = function() { return this.s; };

pkg.TextModelListeners = MB.ListenersClass("textUpdated");

/**
 * Multi-lines text model implementation
 * @class zebra.data.Text
 * @param  {String}  [s] the specified text the model has to be filled
 * @constructor
 * @extends zebra.data.TextModel
 */
pkg.Text = Class(pkg.TextModel, [
    function $prototype() {
        this.textLength = 0;

        this.getLnInfo = function(lines, start, startOffset, o){
            for(; start < lines.length; start++){
                var line = lines[start].s;
                if (o >= startOffset && o <= startOffset + line.length){
                    return [start, startOffset];
                }
                startOffset += (line.length + 1);
            }
            return [];
        };

        this.setExtraChar = function(i,ch){ this.lines[i].l = ch; };
        
        this.getExtraChar = function (i) { return this.lines[i].l; };

        this.getLine = function(line) { return this.lines[line].s; };

        this.getValue = function(){ return this.lines.join("\n"); };

        this.getLines = function () { return this.lines.length; };
        
        this.getTextLength = function() { return this.textLength; };

        this.write = function (s, offset){
            var slen = s.length,
                info = this.getLnInfo(this.lines, 0, 0, offset),
                line = this.lines[info[0]].s, j = 0,
                lineOff = offset - info[1],
                tmp = [line.substring(0, lineOff), s, line.substring(lineOff)].join('');

            for(; j < slen && s[j] != '\n'; j++);

            if(j >= slen) {
                this.lines[info[0]].s = tmp;
                j = 1;
            }
            else {
                this.lines.splice(info[0], 1);
                j = this.parse(info[0], tmp, this.lines);
            }
            this.textLength += slen;
            this._.textUpdated(this, true, offset, slen, info[0], j);
        };

        this.remove = function (offset,size){
            var i1   = this.getLnInfo(this.lines, 0, 0, offset),
                i2   = this.getLnInfo(this.lines, i1[0], i1[1], offset + size),
                l2   = this.lines[i2[0]].s,
                l1   = this.lines[i1[0]].s,
                off1 = offset - i1[1], off2 = offset + size - i2[1],
                buf  = [l1.substring(0, off1), l2.substring(off2)].join('');

            if (i2[0] == i1[0]) this.lines.splice(i1[0], 1, new Line(buf));
            else {
                this.lines.splice(i1[0], i2[0] - i1[0] + 1);
                this.lines.splice(i1[0], 0, new Line(buf));
            }
            this.textLength -= size;
            this._.textUpdated(this, false, offset, size, i1[0], i2[0] - i1[0] + 1);
        };

        this.parse = function (startLine, text, lines){
            var size = text.length, prevIndex = 0, prevStartLine = startLine;
            for(var index = 0; index <= size; prevIndex = index, startLine++){
                var fi = text.indexOf("\n", index);
                index = (fi < 0 ? size : fi);
                this.lines.splice(startLine, 0, new Line(text.substring(prevIndex, index)));
                index++;
            }
            return startLine - prevStartLine;
        };

        this.setValue = function(text){
            if (text == null) {
                throw new Error("Invalid null string");
            }
            var old = this.getValue();
            if (old !== text) {
                if (old.length > 0) {
                    var numLines = this.getLines(), txtLen = this.getTextLength();
                    this.lines.length = 0;
                    this.lines = [ new Line("") ];
                    this._.textUpdated(this, false, 0, txtLen, 0, numLines);
                }

                this.lines = [];
                this.parse(0, text, this.lines);
                this.textLength = text.length;
                this._.textUpdated(this, true, 0, this.textLength, 0, this.getLines());
            }
        };

        this[''] = function(s){
            this.lines = [ new Line("") ];
            this._ = new pkg.TextModelListeners();
            this.setValue(s == null ? "" : s);
        };
    }
]);

/**
 * Single line text model implementation
 * @param  {String}  [s] the specified text the model has to be filled
 * @param  {Integer} [max] the specified maximal text length
 * @constructor
 * @class zebra.data.SingleLineTxt
 * @extends zebra.data.TextModel
 */
pkg.SingleLineTxt = Class(pkg.TextModel, [
    function $prototype() {
        /**
         * Maximal text length. -1 means the text is not restricted 
         * regarding its length. 
         * @attribute maxLen
         * @type {Integer}
         * @default -1
         * @readOnly
         */

        this.setExtraChar = function(i,ch) {
            this.extra = ch;
        };
        
        this.getExtraChar = function(i){
            return this.extra;
        };

        this.getValue = function(){
            return this.buf;
        };

        /**
         * Get number of lines stored in the text model. The model 
         * can have only one line
         * @method getLines
         * @return {Integer} a number of lines
         */
        this.getLines = function(){
            return 1;
        };

        this.getTextLength = function(){
            return this.buf.length;
        };

        this.getLine = function(line){ 
            if (line != 0) {
                throw new Error(oobi + line);
            }
            return this.buf;
        };

        this.write = function(s,offset){
            var buf = this.buf, j = s.indexOf("\n");
            if (j >= 0) s = s.substring(0, j);
            var l = (this.maxLen > 0 && (buf.length + s.length) >= this.maxLen) ? this.maxLen - buf.length
                                                                                : s.length;
            if (l!==0) {
                this.buf = [buf.substring(0, offset), s.substring(0, l), buf.substring(offset)].join('');
                if (l > 0) this._.textUpdated(this, true, offset, l, 0, 1);
            }
        };

        this.remove = function(offset,size){
            this.buf = [ this.buf.substring(0, offset), this.buf.substring(offset + size)].join('');
            this._.textUpdated(this, false, offset, size, 0, 1);
        };

        this.setValue = function(text){
            if (text == null) {
                throw new Error("Invalid null string");
            }

            var i = text.indexOf('\n');
            if (i >= 0) text = text.substring(0, i);
            if(this.buf == null || this.buf !== text) {
                if (this.buf != null && this.buf.length > 0) this._.textUpdated(this, false, 0, this.buf.length, 0, 1);
                if (this.maxLen > 0 && text.length > this.maxLen) text = text.substring(0, this.maxLen);
                this.buf = text;
                this._.textUpdated(this, true, 0, text.length, 0, 1);
            }
        };

        /**
         * Set the given maximal length the text can have
         * @method setMaxLength
         * @param  {Integer} max a maximal length of text
         */
        this.setMaxLength = function (max){
            if(max != this.maxLen){
                this.maxLen = max;
                this.setValue("");
            }
        };

        this[''] = function (s, max) {   
            this.maxLen = max == null ? -1 : max;
            this.buf = null;
            this.extra = 0;
            this._ = new pkg.TextModelListeners();
            this.setValue(s == null ? "" : s);
        };
    }
]);

pkg.ListModelListeners = MB.ListenersClass("elementInserted", "elementRemoved", "elementSet");

/**
 * List model class
 * @param  {Array} [a] an array the list model has to be initialized with
 * @example
 
      // create list model that contains three integer elements
      var l = new zebra.data.ListModel([1,2,3]);
 
 * @constructor 
 * @class zebra.data.ListModel
 */

 /**
  * Fired when a new element has been added to the list model 

     list.bind(function elementInserted(src, o, i) {
         ...
     });

  * @event elementInserted 
  * @param {zebra.data.ListModel} src a list model that triggers the event
  * @param {Object}  o an element that has been added
  * @param {Integer} i an index at that the new element has been added
  */

 /**
  * Fired when an element has been removed from the list model 

     list.bind(function elementRemoved(src, o, i) {
         ...
     });

  * @event elementRemoved
  * @param {zebra.data.ListModel} src a list model that triggers the event
  * @param {Object}  o an element that has been removed
  * @param {Integer} i an index at that the element has been removed
  */

 /**
  * Fired when an element has been re-set 

     list.bind(function elementSet(src, o, pe, i) {
         ...
     });

  * @event elementSet
  * @param {zebra.data.ListModel} src a list model that triggers the event
  * @param {Object}  o an element that has been set
  * @param {Object}  pe a previous element 
  * @param {Integer} i an index at that the element has been re-set
  */

pkg.ListModel = Class([
    function $prototype() {
        /**
         * Get an item stored at the given location in the list 
         * @method get
         * @param  {Integer} i an item location
         * @return {object}  a list item
         */
        this.get = function(i) {
            if (i < 0 || i >= this.d.length) {
                throw new Error(oobi + i);
            }
            return this.d[i];
        };

        /**
         * Add the given item to the end of the list 
         * @method add
         * @param  {Object} o an item to be added
         */
        this.add = function(o) {
            this.d.push(o);
            this._.elementInserted(this, o, this.d.length - 1);
        };

        /**
         * Remove all elements from the list model
         * @method removeAll
         */
        this.removeAll = function() {
            var size = this.d.length;
            for(var i = size - 1; i >= 0; i--) this.removeAt(i);
        };

        /**
         * Remove an element at the given location of the list model
         * @method removeAt
         * @param {Integer} i a location of an element to be removed from the list
         */
        this.removeAt = function(i) {
            var re = this.d[i];
            this.d.splice(i, 1);
            this._.elementRemoved(this, re, i);
        };

        /**
         * Remove the given element from the list
         * @method remove
         * @param {Object} o an element to be removed from the list
         */
        this.remove = function(o) {
            for(var i = 0;i < this.d.length; i++ ){
                if (this.d[i] === o) this.removeAt(i);
            }
        };

        /**
         * Insert the given element into the given position of the list
         * @method insert
         * @param {Object} o an element to be inserted into the list
         * @param {Integer} i a position at which the element has to be inserted into the list 
         */
        this.insert = function(o,i){
            if(i < 0 || i >= this.d.length) {
                throw new Error(oobi + i);
            }
            this.d.splice(i, 0, o);
            this._.elementInserted(this, o, i);
        };

        /**
         * Get number of elements stored in the list
         * @method count
         * @return {Integer} a number of element in the list
         */
        this.count = function () {
            return this.d.length;
        };

        /**
         * Set the new element at the given position
         * @method set
         * @param  {Object} o a new element to be set as the list element at the given position
         * @param  {Integer} i a position
         * @return {Object}  previous element that was stored at the given position
         */
        this.set = function (o,i){
            if (i < 0 || i >= this.d.length) {
                throw new Error(oobi + i);
            }
            var pe = this.d[i];
            this.d[i] = o;
            this._.elementSet(this, o, pe, i);
            return pe;
        };

        /**
         * Check if the element is in the list
         * @method contains
         * @param  {Object} o an element to be checked 
         * @return {Boolean} true if the element is in the list  
         */
        this.contains = function (o){
            return this.indexOf(o) >= 0;
        };

        /**
         * Get position the given element is stored in the list
         * @method indexOf
         * @param  {Object} o an element 
         * @return {Integer} the element position. -1 if the element cannot be found in the list 
         */
        this.indexOf = function(o){
            return this.d.indexOf(o);
        };

        this[''] = function() {
            this._ = new pkg.ListModelListeners();
            this.d = (arguments.length === 0) ? [] : arguments[0];
        };
    }
]);

/**
 * Tree model item class. The structure is used by tree model to store 
 * tree items values, parent and children item references.
 * @class zebra.data.Item
 * @param  {Object} [v] the item value
 * @constructor 
 */
var Item = pkg.Item = Class([
    function $prototype() {
        this[''] = function(v) {
            /**
             * Array of children items of the item element
             * @attribute kids
             * @type {Array}
             * @default []
             * @readOnly
             */
            this.kids = [];

            /**
             * Value stored with this item
             * @attribute value
             * @type {Object}
             * @default null
             * @readOnly
             */
            this.value = v;

            /**
             * Reference to a parent item
             * @attribute parent
             * @type {zebra.data.Item}
             * @default undefined
             * @readOnly
             */
        };
    }
]);

pkg.TreeModelListeners = MB.ListenersClass("itemModified", "itemRemoved", "itemInserted");


/**
 * Tree model class. The class is simple and handy way to keep hierarchical structure. 
 * @constructor
 * @param  {zebra.data.Item|Object} [r] a root item. As the argument you can pass "zebra.data.Item" or
 * a JavaType object. In the second case you can describe the tree as follow:

     // create tree model initialized with tree structure passed as 
     // special formated JavaScript object   
     var tree = new zebra.data.TreeModel({ value:"Root",
                                          kids: [
                                              "Root kid 1",
                                              { 
                                                value: "Root kid 2",
                                                kids:  [ "Kid of kid 2"] 
                                              }
                                          ]});

 * @class zebra.data.TreeModel
 */

/**
 * Fired when the tree model item value has been updated. 

    tree.bind(function itemModified(src, item) {
        ...
    });

 * @event itemModified 
 * @param {zebra.data.TreeModel} src a tree model that triggers the event
 * @param {zebra.data.Item}  item an item whose value has been updated
 */

/**
 * Fired when the tree model item has been removed

    tree.bind(function itemRemoved(src, item) {
       ...
    });

 * @event itemRemoved
 * @param {zebra.data.TreeModel} src a tree model that triggers the event
 * @param {zebra.data.Item}  item an item that has been removed from the tree model
 */

/**
 * Fired when the tree model item has been inserted into the model

    tree.bind(function itemInserted(src, item) {
       ...
    });

 * @event itemInserted
 * @param {zebra.data.TreeModel} src a tree model that triggers the event
 * @param {zebra.data.Item}  item an item that has been inserted into the tree model
 */

pkg.TreeModel = Class([
    function $clazz() {
        this.create = function(r, p) {
            var item = new Item(r.hasOwnProperty("value")? r.value : r);
            item.parent = p;
            if (r.hasOwnProperty("kids")) {
                for(var i = 0; i < r.kids.length; i++) {
                    item.kids[i] = pkg.TreeModel.create(r.kids[i], item);
                }
            }
            return item;
        };
    },

    function $prototype() {
        /**
         * Update a value of the given tree model item with the new one
         * @method setValue
         * @param  {zebra.data.Item} item an item whose value has to be updated
         * @param  {[type]} v   a new item value
         */
        this.setValue = function(item, v){
            item.value = v;
            this._.itemModified(this, item);
        };

        /**
         * Add the new item to the tree model as a children element of the given parent item
         * @method add
         * @param  {zebra.data.Item} to a parent item to which the new item has to be added
         * @param  {Object|zebra.data.Item} an item or value of the item to be
         * added to the parent item of the tree model 
         */
        this.add = function(to,item){
            this.insert(to, item, to.kids.length);
        };

        /**
         * Insert the new item to the tree model as a children element at the 
         * given position of the parent element
         * @method insert
         * @param  {zebra.data.Item} to a parent item to which the new item 
         * has to be inserted
         * @param  {Object|zebra.data.Item} an item or value of the item to be
         * inserted to the parent item
         * @param  {Integer} i a position the new item has to be inserted into
         * the parent item
         */
        this.insert = function(to,item,i){
            if (i < 0 || to.kids.length < i) throw new Error(oobi + i);
            if (zebra.isString(item)) {
                item = new Item(item);
            }
            to.kids.splice(i, 0, item);
            item.parent = to;
            this._.itemInserted(this, item);

            // !!!
            // it is necessary to analyze if the inserted item has kids and
            // generate inserted event for all kids recursively
        };

        /**
         * Remove the given item from the tree model
         * @method remove
         * @param  {zebra.data.Item} item an item to be removed from the tree model
         */
        this.remove = function(item){
            if (item == this.root) {
                this.root = null;
            }
            else {
                for(var i=0; i < item.kids.length; i++) {
                    this.remove(item.kids[i]);
                }
                item.parent.kids.splice(item.parent.kids.indexOf(item), 1);
                item.parent = null;
            }
            this._.itemRemoved(this, item);
        };

        /**
         * Remove all children items from the given item of the tree model
         * @method removeKids
         * @param  {zebra.data.Item} item an item from that all children items have to be removed
         */
        this.removeKids = function(item){
            for(var i = 0; i < items.kids.length; i++) this.remove(items[i]);
        };

        this[''] = function(r) {
            if (arguments.length === 0) r = new Item();

            /**
             * Reference to the tree model root item
             * @attribute root
             * @type {zebra.data.Item}
             * @readOnly
             */
            this.root = zebra.instanceOf(r, Item) ? r : pkg.TreeModel.create(r);
            this._ = new pkg.TreeModelListeners();
        };
    }
]);

pkg.MatrixListeners = MB.ListenersClass("matrixResized", "cellModified", "matrixSorted");

/**
 *  Matrix model class. 
 *  @constructor
 *  @param  {Array of Array} [data] the given data 
 *  @param  {Integer} [rows] a number of rows
 *  @param  {Integer} [cols] a number of columns
 *  @class zebra.data.Matrix
 */
pkg.Matrix = Class([
    function $prototype() {        
        /**
         * Fired when the matrix model size (number of rows or columns) is changed. 
          
         matrix.bind(function matrixResized(src, pr, pc) {
            ...
         });
          
         * @event matrixResized 
         * @param {zebra.data.Matrix} src a matrix that triggers the event
         * @param {Integer}  pr a previous number of rows 
         * @param {Integer}  pc a previous number of columns 
         */

         /**
          * Fired when the matrix model cell has been updated. 
          
          matrix.bind(function cellModified(src, row, col, old) {
             ...
          });

          * @event cellModified 
          * @param {zebra.data.Matrix} src a matrix that triggers the event
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
           * @param {zebra.data.Matrix} src a matrix that triggers the event
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
       

        /**
         * Get a matrix model cell value at the specified row and column
         * @method get
         * @param  {Integer} row a cell row
         * @param  {Integer} col a cell column
         * @return {Object}  matrix model cell value
         */
        this.get = function (row,col){
            if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
                throw new Error("Row of col is out of bounds: " + row + "," + col);
            }
            return this.objs[row][col];
        };

        /**
         * Set the specified by row and column cell value. If the specified row or column is greater than 
         * the matrix model has the model size will be adjusted to new one. 
         * @method put
         * @param  {Integer} row a cell row
         * @param  {Integer} col a cell column
         * @param  {Object} obj a new cell value
         */
        this.put = function(row,col,obj){
            var nr = this.rows, nc = this.cols;
            if (row >= nr) nr += (row - nr + 1);
            if (col >= nc) nc += (col - nc + 1);
            this.setRowsCols(nr, nc);
            var old = this.objs[row] ? this.objs[row][col] : undefined;
            if (obj != old) {
                this.objs[row][col] = obj;
                this._.cellModified(this, row, col, old);
            }
        };

        /**
         * Set the specified by index cell value. The index identifies cell starting from [0,0] cell till [rows,columns]. 
         * If the index is greater than size of model the model size will be adjusted to new one.   
         * @method puti
         * @param  {Integer} i a cell row
         * @param  {Object} obj a new cell value
         */
        this.puti = function(i, obj){
            var p = zebra.util.index2point(i, this.cols);
            this.put(p[0], p[1], obj);
        };

        /**
         * Set the given number of rows and columns the model has to have.
         * @method setRowsCols
         * @param  {Integer} rows a new number of rows
         * @param  {Integer} cols a new number of columns
         */
        this.setRowsCols = function(rows, cols){
            if (rows != this.rows || cols != this.cols){
                var pc = this.cols, pr = this.rows;
                this.rellocate(rows, cols);
                this.cols = cols;
                this.rows = rows;
                this._.matrixResized(this, pr, pc);
            }
        };

        /**
         * Reallocate the matrix model space with the new number of rows and columns 
         * @method rellocate
         * @private
         * @param  {Integer} r a new number of rows
         * @param  {Integer} c a new number of columns
         */
        this.rellocate = function(r, c) {
            if (r >= this.rows) {
                for(var i=this.rows; i < r; i++)  this.objs[i] = [];
            }
        };

         /**
         * Set the given number of rows the model has to have.
         * @method setRows
         * @param  {Integer} rows a new number of rows
         */
        this.setRows = function(rows) { this.setRowsCols(rows, this.cols); };

        /**
         * Set the given number of columns the model has to have.
         * @method setCols
         * @param  {Integer} cols a new number of columns
         */
        this.setCols = function(cols) { this.setRowsCols(this.rows, cols); };

        /**
         * Remove specified number of rows from the model starting from the given row.
         * @method removeRows
         * @param  {Integer}  begrow a start row 
         * @param  {Integer} count  a number of rows to be removed
         */
        this.removeRows = function(begrow,count){
            if (begrow < 0 || begrow + count > this.rows) {
                throw new Error();
            }

            for(var i = (begrow + count);i < this.rows; i++, begrow++){
                for(var j = 0;j < this.cols; j ++ ){
                    this.objs[begrow][j] = this.objs[i][j];
                    this.objs[i][j] = null;
                }
            }
            this.rows -= count;
            this._.matrixResized(this, this.rows + count, this.cols);
        };

        /**
         * Remove specified number of columns from the model starting from the given column.
         * @method removeCols
         * @param  {Integer}  begcol a start column
         * @param  {Integer} count  a number of columns to be removed
         */
        this.removeCols = function (begcol,count){
            if (begcol < 0 || begcol + count > this.cols) {
                throw new Error();
            }
            
            for(var i = (begcol + count);i < this.cols; i++, begcol++){
                for(var j = 0;j < this.rows; j++){
                    this.objs[j][begcol] = this.objs[j][i];
                    this.objs[j][i] = null;
                }
            }
            this.cols -= count;
            this._.matrixResized(this, this.rows, this.cols + count);
        };

        /**
         * Sort the given column of the matrix model
         * @param  {Integer} col a column to be re-ordered
         * @param  {Function} [f] an optional sort function. The name of the function 
         * is grabbed to indicate type of the sorting the method does. For instance:
         * "descent", "ascent".  
         * @method sortCol
         */
        this.sortCol = function(col, f) {
            if (f == null) {
                f = pkg.descent;
            }

            this.objs.sort(function(a, b) {
                return f(a[col],b[col]);
            });

            this._.matrixSorted(this, { col : col,
                                        func: f,
                                        name: zebra.$FN(f).toLowerCase() });
        };

        this[''] = function() {
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

            this._ = new pkg.MatrixListeners();
            if (arguments.length == 1) {
                this.objs = arguments[0];
                this.cols = (this.objs.length > 0) ? this.objs[0].length : 0;
                this.rows = this.objs.length;
            }
            else {
                this.objs = [];
                this.rows = this.cols = 0;
                if (arguments.length > 1) {
                    this.setRowsCols(arguments[0], arguments[1]);
                }
            }
        };
    }
]);

/**
 * @for
 */

})(zebra("data"), zebra.Class, zebra.Interface);
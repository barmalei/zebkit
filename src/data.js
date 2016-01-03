/**
 * Collection of variouse data models.
 * @module data
 * @main
 * @requires zebkit, util
 */

(function(pkg, Class) {

pkg.descent = function descent(a, b) {
    if (a == null) return 1;
    return (zebkit.isString(a)) ? a.localeCompare(b) : a - b;
};

pkg.ascent = function ascent(a, b) {
    if (b == null) return 1;
    return (zebkit.isString(b)) ? b.localeCompare(a) : b - a;
};

/**
 * Text model class
 * @class zebkit.data.TextModel
 * @abstract
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
 * @param {zebkit.data.Text} src a text model that triggers the event
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
pkg.TextModel = Class([
    function $clazz() {
        this.Listeners = zebkit.util.ListenersClass("textUpdated");
    }
]);

function Line(s) {
    this.s = s;
}

//  toString for array.join method
Line.prototype.toString = function() { return this.s; };

/**
 * Multi-lines text model implementation
 * @class zebkit.data.Text
 * @param  {String}  [s] the specified text the model has to be filled
 * @constructor
 * @extends zebkit.data.TextModel
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

        this.$lineTags = function(i, value) {
            return this.lines[i];
        };

        this.getLine = function(line) {
            if (line < 0 || line >= this.lines.length) throw RangeError(line);
            return this.lines[line].s;
        };

        this.getValue = function() {
            return this.lines.join("\n");
        };

        this.getLines = function () {
            return this.lines.length;
        };

        this.getTextLength = function() {
            return this.textLength;
        };

        this.write = function (s, offset) {
            if (s.length > 0) {
                var slen    = s.length,
                    info    = this.getLnInfo(this.lines, 0, 0, offset),
                    line    = this.lines[info[0]].s,
                    j       = 0,
                    lineOff = offset - info[1],
                    tmp     = line.substring(0, lineOff) + s + line.substring(lineOff);

                for(; j < slen && s[j] != '\n'; j++);

                if (j >= slen) {
                    this.lines[info[0]].s = tmp;
                    j = 1;
                }
                else {
                    this.lines.splice(info[0], 1);
                    j = this.parse(info[0], tmp, this.lines);
                }

                if (slen > 0) {
                    this.textLength += slen;
                    this._.textUpdated(this, true, offset, slen, info[0], j);
                    return true;
                }
            }
            return false;
        };

        this.remove = function(offset, size) {
            if (size > 0) {
                var i1   = this.getLnInfo(this.lines, 0, 0, offset),
                    i2   = this.getLnInfo(this.lines, i1[0], i1[1], offset + size),
                    l2   = this.lines[i2[0]].s,
                    l1   = this.lines[i1[0]].s,
                    off1 = offset - i1[1], off2 = offset + size - i2[1],
                    buf  = l1.substring(0, off1) + l2.substring(off2);

                if (i2[0] == i1[0]) {
                    this.lines.splice(i1[0], 1, new Line(buf));
                }
                else {
                    this.lines.splice(i1[0], i2[0] - i1[0] + 1);
                    this.lines.splice(i1[0], 0, new Line(buf));
                }

                if (size > 0) {
                    this.textLength -= size;
                    this._.textUpdated(this, false, offset, size, i1[0], i2[0] - i1[0] + 1);
                    return true;
                }
            }
            return false;
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
                return true;
            }
            return false;
        };

        this[''] = function(s){
            this.lines = [ new Line("") ];
            this._ = new this.clazz.Listeners();
            this.setValue(s == null ? "" : s);
        };
    }
]);

/**
 * Single line text model implementation
 * @param  {String}  [s] the specified text the model has to be filled
 * @param  {Integer} [max] the specified maximal text length
 * @constructor
 * @class zebkit.data.SingleLineTxt
 * @extends zebkit.data.TextModel
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

        this.$lineTags = function(i) {
            return this;
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
            if (line !== 0) {
                throw new RangeError(line);
            }
            return this.buf;
        };

        this.write = function(s,offset) {
            // cut to the first new line character
            var j = s.indexOf("\n");
            if (j >= 0) {
                s = s.substring(0, j);
            }

            var l = (this.maxLen > 0 && (this.buf.length + s.length) >= this.maxLen) ? this.maxLen - this.buf.length
                                                                                     : s.length;
            if (l !== 0) {
                var nl = this.buf.substring(0, offset) + s.substring(0, l) + this.buf.substring(offset);
                if (this.validate == null || this.validate(nl)) {
                    this.buf = nl;
                    if (l > 0) {
                        this._.textUpdated(this, true, offset, l, 0, 1);
                        return true;
                    }
                }
            }
            return false;
        };

        this.remove = function(offset,size){
            if (size > 0) {
                var nl = this.buf.substring(0, offset) +
                         this.buf.substring(offset + size);

                if (nl.length != this.buf.length && (this.validate == null || this.validate(nl))) {
                    this.buf = nl;
                    this._.textUpdated(this, false, offset, size, 0, 1);
                    return true;
                }
            }
            return false;
        };

        this.setValue = function(text){
            if (text == null) {
                throw new Error("Invalid null string");
            }

            if (this.validate != null && this.validate(text) == false) {
                return false;
            }

            // cut to next line
            var i = text.indexOf('\n');
            if (i >= 0) {
                text = text.substring(0, i);
            }

            if ((this.buf == null || this.buf !== text) && (this.validate == null || this.validate(text))) {
                if (this.buf != null && this.buf.length > 0) {
                    this._.textUpdated(this, false, 0, this.buf.length, 0, 1);
                }

                if (this.maxLen > 0 && text.length > this.maxLen) {
                    text = text.substring(0, this.maxLen);
                }

                this.buf = text;
                this._.textUpdated(this, true, 0, text.length, 0, 1);
                return true;
            }

            return false;
        };

        /**
         * Set the given maximal length the text can have
         * @method setMaxLength
         * @param  {Integer} max a maximal length of text
         */
        this.setMaxLength = function (max){
            if (max != this.maxLen){
                this.maxLen = max;
                this.setValue("");
            }
        };

        /**
         *  Validate the given text. This method can be implemented to prevent
         *  inserting text in text model that doesn't satisfy the given condition.
         *  For instance text can allow only numeric.
         *  @method validate
         *  @param {String} text a text
         *  @return {Boolean} return true if the text is valid otherwise return false
         */


        this[''] = function (s, max) {
            this.maxLen = max == null ? -1 : max;
            this.buf = "";
            this.extra = 0;
            this._ = new this.clazz.Listeners();
            this.setValue(s == null ? "" : s);
        };
    }
]);

/**
 * List model class
 * @param  {Array} [a] an array the list model has to be initialized with
 * @example

      // create list model that contains three integer elements
      var l = new zebkit.data.ListModel([1,2,3]);

 * @constructor
 * @class zebkit.data.ListModel
 */

 /**
  * Fired when a new element has been added to the list model

     list.bind(function elementInserted(src, o, i) {
         ...
     });

  * @event elementInserted
  * @param {zebkit.data.ListModel} src a list model that triggers the event
  * @param {Object}  o an element that has been added
  * @param {Integer} i an index at that the new element has been added
  */

 /**
  * Fired when an element has been removed from the list model

     list.bind(function elementRemoved(src, o, i) {
         ...
     });

  * @event elementRemoved
  * @param {zebkit.data.ListModel} src a list model that triggers the event
  * @param {Object}  o an element that has been removed
  * @param {Integer} i an index at that the element has been removed
  */

 /**
  * Fired when an element has been re-set

     list.bind(function elementSet(src, o, p, i) {
         ...
     });

  * @event elementSet
  * @param {zebkit.data.ListModel} src a list model that triggers the event
  * @param {Object}  o an element that has been set
  * @param {Object}  p a previous element
  * @param {Integer} i an index at that the element has been re-set
  */

pkg.ListModel = Class([
    function $clazz () {
        this.Listeners = zebkit.util.ListenersClass("elementInserted", "elementRemoved", "elementSet");
    },

    function $prototype() {
        /**
         * Get an item stored at the given location in the list
         * @method get
         * @param  {Integer} i an item location
         * @return {object}  a list item
         */
        this.get = function(i) {
            if (i < 0 || i >= this.d.length) {
                throw new RangeError(i);
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
         * @param {Integer} i a position at which the element has to be inserted into the list
         * @param {Object} o an element to be inserted into the list
         */
        this.insert = function(i, o){
            if (i < 0 || i > this.d.length) {
                throw new RangeError(i);
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
         * @method setAt
         * @param  {Integer} i a position
         * @param  {Object} o a new element to be set as the list element at the given position
         * @return {Object}  previous element that was stored at the given position
         */
        this.setAt = function(i, o) {
            if (i < 0 || i >= this.d.length) {
                throw new RangeError(i);
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
            this._ = new this.clazz.Listeners();
            this.d = (arguments.length === 0) ? [] : arguments[0];
        };
    }
]);

/**
 * Tree model item class. The structure is used by tree model to store
 * tree items values, parent and children item references.
 * @class zebkit.data.Item
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
             * @type {zebkit.data.Item}
             * @default undefined
             * @readOnly
             */
        };
    }
]);

/**
 * Tree model class. The class is simple and handy way to keep hierarchical structure.
 * @constructor
 * @param  {zebkit.data.Item|Object} [r] a root item. As the argument you can pass "zebkit.data.Item" or
 * a JavaType object. In the second case you can describe the tree as follow:

     // create tree model initialized with tree structure passed as
     // special formated JavaScript object
     var tree = new zebkit.data.TreeModel({ value:"Root",
                                          kids: [
                                              "Root kid 1",
                                              {
                                                value: "Root kid 2",
                                                kids:  [ "Kid of kid 2"]
                                              }
                                          ]});

 * @class zebkit.data.TreeModel
 */

/**
 * Fired when the tree model item value has been updated.

    tree.bind(function itemModified(src, item) {
        ...
    });

 * @event itemModified
 * @param {zebkit.data.TreeModel} src a tree model that triggers the event
 * @param {zebkit.data.Item}  item an item whose value has been updated
 */

/**
 * Fired when the tree model item has been removed

    tree.bind(function itemRemoved(src, item) {
       ...
    });

 * @event itemRemoved
 * @param {zebkit.data.TreeModel} src a tree model that triggers the event
 * @param {zebkit.data.Item}  item an item that has been removed from the tree model
 */

/**
 * Fired when the tree model item has been inserted into the model) {
       ...
    });

 * @event itemInserted
 * @param {zebkit.data.TreeModel} src a tree model that triggers the event
 * @param {zebkit.data.Item}  item an item that has been inserted into the tree model
 */

pkg.TreeModel = Class([
    function $clazz() {
        this.Listeners = zebkit.util.ListenersClass("itemModified", "itemRemoved", "itemInserted");

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

        this.findOne = function(root, value) {
            var res = null;
            pkg.TreeModel.find(root, value, function(item) {
                res = item;
                return true;
            });
            return res;
        };

        this.find = function(root, value, cb) {
            if (cb == null) {
                var res = [];
                pkg.TreeModel.find(root, value, function(item) {
                    res.push(item);
                    return false;
                });
                return res;
            }

            if (root.value === value) {
                if (cb.call(this, root) === true) return true;
            }

            if (root.kids != null) {
                for (var i = 0; i < root.kids.length; i++) {
                    if (pkg.TreeModel.find(root.kids[i], value, cb)) {
                        return true;
                    }
                }
            }
            return false;
        };
    },

    function $prototype() {
        this.iterate = function(r, f) {
            var res = f.call(this, r);
            if (res === 1 || res === 2) return r;

            for (var i = 0; i < r.kids.length; i++) {
                res = this.iterate(r.kids[i], f);
                if (res === 2) return res;
            }
        };

        /**
         * Update a value of the given tree model item with the new one
         * @method setValue
         * @param  {zebkit.data.Item} item an item whose value has to be updated
         * @param  {[type]} v   a new item value
         */
        this.setValue = function(item, v){
            item.value = v;
            this._.itemModified(this, item);
        };

        /**
         * Add the new item to the tree model as a children element of the given parent item
         * @method add
         * @param  {zebkit.data.Item} to a parent item to which the new item has to be added
         * @param  {Object|zebkit.data.Item} an item or value of the item to be
         * added to the parent item of the tree model
         */
        this.add = function(to,item){
            this.insert(to, item, to.kids.length);
        };

        /**
         * Insert the new item to the tree model as a children element at the
         * given position of the parent element
         * @method insert
         * @param  {zebkit.data.Item} to a parent item to which the new item
         * has to be inserted
         * @param  {Object|zebkit.data.Item} an item or value of the item to be
         * inserted to the parent item
         * @param  {Integer} i a position the new item has to be inserted into
         * the parent item
         */
        this.insert = function(to,item,i){
            if (i < 0 || to.kids.length < i) throw new RangeError(i);
            if (zebkit.isString(item)) {
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
         * @param  {zebkit.data.Item} item an item to be removed from the tree model
         */
        this.remove = function(item){
            if (item == this.root) {
                this.root = null;
            }
            else {
                if (item.kids != null) {
                    for(var i = item.kids.length - 1; i >= 0; i--) {
                        this.remove(item.kids[i]);
                    }
                }

                item.parent.kids.splice(item.parent.kids.indexOf(item), 1);
            }

            // preserve refernce to parent when we call a listener
            try {
                this._.itemRemoved(this, item);
            }
            catch(e) {
                item.parent = null;
                throw e;
            }
            item.parent = null;
        };

        /**
         * Remove all children items from the given item of the tree model
         * @method removeKids
         * @param  {zebkit.data.Item} item an item from that all children items have to be removed
         */
        this.removeKids = function(item) {
            for(var i = item.kids.length - 1; i >= 0; i--) {
                this.remove(item.kids[i]);
            }
        };

        this[''] = function(r) {
            if (arguments.length === 0) r = new Item();

            /**
             * Reference to the tree model root item
             * @attribute root
             * @type {zebkit.data.Item}
             * @readOnly
             */
            this.root = zebkit.instanceOf(r, Item) ? r : pkg.TreeModel.create(r);
            this.root.parent = null;
            this._ = new this.clazz.Listeners();
        };
    }
]);

/**
 *  Matrix model class.
 *  @constructor
 *  @param  {Array of Array} [data] the given data
 *  @param  {Integer} [rows] a number of rows
 *  @param  {Integer} [cols] a number of columns
 *  @class zebkit.data.Matrix
 */
pkg.Matrix = Class([
    function $clazz() {
        this.Listeners = zebkit.util.ListenersClass("matrixResized", "cellModified",
                                                   "matrixSorted", "matrixRowInserted",
                                                   "matrixColInserted");
    },

    function $prototype() {
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

        /**
         * Get a matrix model cell value at the specified row and column
         * @method get
         * @param  {Integer} row a cell row
         * @param  {Integer} col a cell column
         * @return {Object}  matrix model cell value
         */
        this.get = function (row,col){
            if (row < 0 || row >= this.rows) {
                throw new RangeError(row);
            }

            if (col < 0 || col >= this.cols) {
                throw new RangeError(col);
            }

            return this.objs[row] == null ? undefined : this.objs[row][col];
        };

        /**
         * Get a matrix model cell value by the specified index
         * @method geti
         * @param  {Integer} index a cell index
         * @return {Object}  matrix model cell value
         */
        this.geti = function(i) {
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
        this.put = function(row,col,obj){
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
        };

        /**
         * Set the specified by index cell value. The index identifies cell starting from [0,0]
         * cell till [rows,columns]. If the index is greater than size of model the model size
         * will be adjusted to new one.
         * @method puti
         * @param  {Integer} i a cell row
         * @param  {Object} obj a new cell value
         */
        this.puti = function(i, obj){
            this.put( ~~(i / this.cols),
                         i % this.cols, obj);
        };

        /**
         * Set the given number of rows and columns the model has to have.
         * @method setRowsCols
         * @param  {Integer} rows a new number of rows
         * @param  {Integer} cols a new number of columns
         */
        this.setRowsCols = function(rows, cols){
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
        };

         /**
         * Set the given number of rows the model has to have.
         * @method setRows
         * @param  {Integer} rows a new number of rows
         */
        this.setRows = function(rows) {
            this.setRowsCols(rows, this.cols);
        };

        /**
         * Set the given number of columns the model has to have.
         * @method setCols
         * @param  {Integer} cols a new number of columns
         */
        this.setCols = function(cols) {
            this.setRowsCols(this.rows, cols);
        };

        /**
         * Remove specified number of rows from the model starting
         * from the given row.
         * @method removeRows
         * @param  {Integer} begrow a start row
         * @param  {Integer} count  a number of rows to be removed
         */
        this.removeRows = function(begrow,count) {
            if (arguments.length === 1) {
                count = 1;
            }

            if (begrow < 0 || begrow + count > this.rows) {
                throw new RangeError(begrow);
            }

            this.objs.splice(begrow, count);
            this.rows -= count;
            this._.matrixResized(this, this.rows + count, this.cols);
        };

        /**
         * Remove specified number of columns from the model starting
         * from the given column.
         * @method removeCols
         * @param  {Integer}  begcol a start column
         * @param  {Integer} count  a number of columns to be removed
         */
        this.removeCols = function (begcol,count){
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
        };

        /**
         * Insert the given number of rows at the specified row
         * @param  {Integer} row   a starting row to insert
         * @param  {Integer} count a number of rows to be added
         * @method insertRows
         */
        this.insertRows = function(row, count) {
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
        };

        /**
         * Insert the given number of columns at the specified column
         * @param  {Integer} col   a starting column to insert
         * @param  {Integer} count a number of columns to be added
         * @method insertCols
         */
        this.insertCols = function(col, count) {
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
        };

        /**
         * Sort the given column of the matrix model.
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
                return f(a[col], b[col]);
            });

            this._.matrixSorted(this, { col : col,
                                        func: f,
                                        name: zebkit.$FN(f).toLowerCase() });
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

            this._ = new this.clazz.Listeners();
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

})(zebkit("data"), zebkit.Class);
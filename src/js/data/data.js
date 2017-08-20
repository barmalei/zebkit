zebkit.package("data", function(pkg, Class) {
    /**
     * Collection of various data models. The models are widely used by zebkit UI
     * components as part of model-view-controller approach, but the package doesn't depend on
     * zebkit UI and can be used independently.
     *
     *      var model = new zebkit.data.TreeModel();
     *      model.on("itemInserted", function(model, item) {
     *          // handle item inserted tree model event
     *          ...
     *      });
     *
     *      model.add(model.root, new zebkit.data.Item("Child 1"));
     *      model.add(model.root, new zebkit.data.Item("Child 2"));
     *
     * @class zebkit.data
     * @access package
     */

    pkg.descent = function descent(a, b) {
        if (typeof a === 'undefined' || a === null) {
            return 1;
        } else {
            return zebkit.isString(a) ? a.localeCompare(b) : a - b;
        }
    };

    pkg.ascent = function ascent(a, b) {
        if (b === null || typeof b === 'undefined') {
            return 1;
        } else {
            return zebkit.isString(b) ? b.localeCompare(a) : b - a;
        }
    };

    /**
     * Data model is marker interface. It has no methods implemented, but the interface
     * is supposed to be inherited with data models implementations
     * @class zebkit.data.DataModel
     * @interface zebkit.data.DataModel
     */
    pkg.DataModel = zebkit.Interface();

    /**
     * Abstract text model class
     * @class zebkit.data.TextModel
     * @uses zebkit.data.DataModel
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
     * Write the given string in the text model starting from the specified offset
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

        text.on(function(e) {
            ...
        });

     *
     * @event textUpdated
     * @param {zebkit.data.TextEvent} e a text model event
     */
    pkg.TextModel = Class(pkg.DataModel, [
        function $clazz() {
            this.Listeners = zebkit.ListenersClass("textUpdated");
        },

        function $prototype() {
            this.replace = function(s, off, size) {
                if (s.length === 0) {
                    return this.remove(off, size);
                } else if (size === 0) {
                    return this.write(s, off);
                } else {
                    var b = this.remove(off, size, false);
                    return this.write(s, off) && b;
                }
            };
        }
    ]);

    /**
     * Text model event class.
     * @constructor
     * @class zebkit.data.TextEvent
     * @extends {zebkit.Event}
     */
    pkg.TextEvent = Class(zebkit.Event, [
        function $prototype() {
            /**
             * Event id.
             * @attribute id
             * @type {String}
             */
            this.id = null;

            /**
             * First line number that has participated in the event action.
             * @attribute line
             * @type {Integer}
             */
            this.line = 0;

            /**
             * Number of lines that have participated in the event action.
             * @attribute lines
             * @type {Integer}
             */
            this.lines = 0;

            /**
             * Offset in a text.
             * @attribute offset
             * @type {Integer}
             */
            this.offset = 0;

            /**
             * Number of characters.
             * @attribute size
             * @type {Integer}
             */
            this.size = 0;

            this.isLastStep = true;

            /**
             * Fill the event with the give parameters
             * @param  {zebkit.data.TextModel} src  a source of the event
             * @param  {String} id an id of the event ("remove", "insert")
             * @param  {Integer} line a first line
             * @param  {Integer} lines  a number of lines
             * @param  {Integer} offset an offset
             * @param  {Integer} size   a number of characters
             * @method $fillWith
             * @chainable
             * @protected
             */
            this.$fillWith = function(src, id, line, lines, offset, size) {
                this.isLastStep   = true;
                this.source       = src;
                this.id           = id;
                this.line         = line;
                this.lines        = lines;
                this.offset       = offset;
                this.size         = size;
                return this;
            };
        }
    ]);

    var TE_STUB = new pkg.TextEvent();

    /**
     * Multi-lines text model implementation
     * @class zebkit.data.Text
     * @param  {String}  [s] the specified text the model has to be filled
     * @constructor
     * @extends zebkit.data.TextModel
     * @uses zebkit.EventProducer
     */
    pkg.Text = Class(pkg.TextModel, zebkit.EventProducer, [
        function(s) {
            /**
             * Array of lines
             * @attribute lines
             * @type {zebkit.data.Text.Line[]}
             * @private
             * @readOnly
             */
            this.$lines = [ new this.clazz.Line("") ];
            this._ = new this.clazz.Listeners();
            this.setValue(arguments.length === 0 || s === null ? "" : s);
        },

        function $clazz() {
            this.Line = function(s) {
                this.$s = s;
            };

            //  toString for array.join method
            this.Line.prototype.toString = function() {
                return this.$s;
            };
        },

        function $prototype() {
            /**
             * Text length
             * @attribute textLength
             * @private
             * @readOnly
             * @type {Integer}
             */
            this.textLength = 0;

            /**
             * Detect line by offset starting from the given line and offset.
             * @param  {Integer} [start]       start line
             * @param  {Integer} [startOffset] start offset of the start line
             * @param  {Integer} o             offset to detect line
             * @private
             * @method calcLineByOffset
             * @return {Array}  an array that consists of two elements: detected line index and its offset
             */
            this.calcLineByOffset = function(start, startOffset, o) {
                if (arguments.length === 1) {
                    startOffset = start = 0;
                }

                for(; start < this.$lines.length; start++){
                    var line = this.$lines[start].$s;
                    if (o >= startOffset && o <= startOffset + line.length){
                        return [start, startOffset];
                    }
                    startOffset += (line.length + 1);
                }
                return [];
            };

            /**
             * Calculate an offset in the text the first character of the specified line.
             * @param  {Integer} line a line index
             * @return {Integer} an offset
             * @protected
             * @method  calcLineOffset
             */
            this.calcLineOffset = function(line) {
                var off = 0;
                for(var i = 0; i < line; i++){
                    off += (this.$lines[i].$s.length + 1);
                }
                return off;
            };

            this.$lineTags = function(i) {
                return this.$lines[i];
            };

            this.getLine = function(line) {
                if (line < 0 || line >= this.$lines.length) {
                    throw RangeError(line);
                }
                return this.$lines[line].$s;
            };

            this.getValue = function() {
                return this.$lines.join("\n");
            };

            this.toString = function() {
                return this.$lines.join("\n");
            };

            this.getLines = function () {
                return this.$lines.length;
            };

            this.getTextLength = function() {
                return this.textLength;
            };

            /**
             * Remove number of text lines starting form the specified line
             * @param  {Integer} start a starting line to remove text lines
             * @param  {Integer} [size]  a number of lines to be removed. If the
             * argument is not passed number equals 1
             * @method removeLines
             */
            this.removeLines = function(start, size) {
                if (start < 0 || start >= this.$lines.length) {
                    throw new RangeError(start);
                }

                if (arguments.length === 1) {
                    size = 1;
                } else if (size <= 0) {
                    throw new Error("Invalid number of lines : " + size);
                }

                // normalize number required lines to be removed
                if ((start + size) > this.$lines.length) {
                    size = this.$lines.length - start;
                }

                var end  = start + size - 1,            // last line to be removed
                    off  = this.calcLineOffset(start),  // offset of the first line to be removed
                    olen = start !== end ? this.calcLineOffset(end) + this.$lines[end].$s.length + 1 - off
                                         : this.$lines[start].$s.length + 1;


                // if this is the last line we have to correct offset to point to "\n" character in text
                if (start === this.$lines.length - 1) {
                    off--;
                }

                this.$lines.splice(start, size);
                this._.textUpdated(TE_STUB.$fillWith(this, "remove", start, size, off, olen));
            };

            /**
             * Insert number of lines starting from the given starting line
             * @param  {Integer} startLine a starting line to insert lines
             * @param  {String}  [lines]*  string lines to inserted
             * @method  insertLines
             */
            this.insertLines = function(startLine) {
                if (startLine < 0 || startLine > this.$lines.length) {
                    throw new RangeError(startLine);
                }

                var off = this.calcLineOffset(startLine), offlen = 0;
                if (startLine === this.$lines.length) {
                    off--;
                }

                for(var i = 1; i < arguments.length; i++) {
                    offlen += arguments[i].length + 1;
                    this.$lines.splice(startLine + i - 1, 0, new this.clazz.Line(arguments[i]));
                }
                this._.textUpdated(TE_STUB.$fillWith(this, "insert", startLine, arguments.length - 1, off, offlen));
            };

            this.write = function (s, offset, b) {
                if (s.length > 0) {
                    var slen    = s.length,
                        info    = this.calcLineByOffset(0, 0, offset),
                        line    = this.$lines[info[0]].$s,
                        j       = 0,
                        lineOff = offset - info[1],
                        tmp     = line.substring(0, lineOff) + s + line.substring(lineOff);

                    for(; j < slen && s[j] !== '\n'; j++) {

                    }

                    if (j >= slen) { // means the update has occurred withing one line
                        this.$lines[info[0]].$s = tmp;
                        j = 1;
                    } else {
                        this.$lines.splice(info[0], 1); // remove line
                        j = this.parse(info[0], tmp);   // re-parse the updated part of text
                    }

                    if (slen > 0) {
                        this.textLength += slen;
                        TE_STUB.$fillWith(this, "insert", info[0], j, offset, slen);
                        if (arguments.length > 2) {
                            TE_STUB.isLastStep = b;
                        }
                        this._.textUpdated(TE_STUB);
                        return true;
                    }
                }
                return false;
            };

            this.remove = function(offset, size, b) {
                if (size > 0) {
                    var i1   = this.calcLineByOffset(0, 0, offset),
                        i2   = this.calcLineByOffset(i1[0], i1[1], offset + size),
                        l1   = this.$lines[i1[0]].$s,
                        l2   = this.$lines[i2[0]].$s,
                        off1 = offset - i1[1],
                        off2 = offset + size - i2[1],
                        buf  = l1.substring(0, off1) + l2.substring(off2);

                    if (i2[0] === i1[0]) {
                        this.$lines.splice(i1[0], 1, new this.clazz.Line(buf));
                    } else {
                        this.$lines.splice(i1[0], i2[0] - i1[0] + 1);
                        this.$lines.splice(i1[0], 0, new this.clazz.Line(buf));
                    }

                    if (size > 0) {
                        this.textLength -= size;
                        TE_STUB.$fillWith(this, "remove", i1[0], i2[0] - i1[0] + 1, offset, size);
                        if (arguments.length > 2) {
                            TE_STUB.isLastStep = b;
                        }
                        this._.textUpdated(TE_STUB);
                        return true;
                    }
                }
                return false;
            };

            this.parse = function (startLine, text) {
                var size          = text.length,
                    prevIndex     = 0,
                    prevStartLine = startLine;

                for(var index = 0; index <= size; prevIndex = index, startLine++) {
                    var fi = text.indexOf("\n", index);
                    index = (fi < 0 ? size : fi);
                    this.$lines.splice(startLine, 0, new this.clazz.Line(text.substring(prevIndex, index)));
                    index++;
                }

                return startLine - prevStartLine;
            };

            this.setValue = function(text) {
                var old = this.getValue();
                if (old !== text) {
                    if (old.length > 0) {
                        var numLines = this.getLines(), txtLen = this.getTextLength();
                        this.$lines.length = 0;
                        this.$lines = [ new this.clazz.Line("") ];
                        TE_STUB.$fillWith(this, "remove", 0, numLines, 0, txtLen);
                        TE_STUB.isLastStep = false;
                        this._.textUpdated(TE_STUB);
                    }

                    this.$lines = [];
                    this.parse(0, text);
                    this.textLength = text.length;
                    this._.textUpdated(TE_STUB.$fillWith(this, "insert", 0, this.getLines(), 0, this.textLength));
                    return true;
                }
                return false;
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
     * @uses zebkit.EventProducer
     */
    pkg.SingleLineTxt = Class(pkg.TextModel, zebkit.EventProducer,[
        function (s, max) {
            if (arguments.length > 1) {
                this.maxLen = max;
            }

            this._ = new this.clazz.Listeners();
            this.setValue(arguments.length === 0 || s === null ? "" : s);
        },

        function $prototype() {
            this.$buf    = "";
            this.extra  =  0;

            /**
             * Maximal text length. -1 means the text is not restricted
             * regarding its length.
             * @attribute maxLen
             * @type {Integer}
             * @default -1
             * @readOnly
             */
            this.maxLen = -1;

            this.$lineTags = function(i) {
                return this;
            };

            this.getValue = function(){
                return this.$buf;
            };

            this.toString = function() {
                return this.$buf;
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
                return this.$buf.length;
            };

            this.getLine = function(line){
                if (line !== 0) {
                    throw new RangeError(line);
                }
                return this.$buf;
            };

            this.write = function(s, offset, b) {
                // cut to the first new line character
                var j = s.indexOf("\n");
                if (j >= 0) {
                    s = s.substring(0, j);
                }

                var l = (this.maxLen > 0 && (this.$buf.length + s.length) >= this.maxLen) ? this.maxLen - this.$buf.length
                                                                                          : s.length;
                if (l !== 0) {
                    var nl = (offset === this.$buf.length ?  this.$buf + s.substring(0, l)  // append
                                                          :  this.$buf.substring(0, offset) +
                                                             s.substring(0, l) +
                                                             this.$buf.substring(offset));

                    this.$buf = nl;
                    if (l > 0) {
                        TE_STUB.$fillWith(this, "insert", 0, 1, offset, l);
                        if (arguments.length > 2) {
                            TE_STUB.isLastStep = b;
                        }
                        this._.textUpdated(TE_STUB);
                        return true;
                    }
                }
                return false;
            };

            this.remove = function(offset, size, b) {
                if (size > 0 && offset < this.$buf.length) {

                    // normalize size
                    if (offset + size > this.$buf.length) {
                        size = this.$buf.length - offset;
                    }

                    if (size > 0)  {
                        // build new cut line
                        var nl = this.$buf.substring(0, offset) +
                                 this.$buf.substring(offset + size);

                        if (nl.length !== this.$buf.length) {
                            this.$buf = nl;
                            TE_STUB.$fillWith(this, "remove", 0, 1, offset, size);
                            if (arguments.length > 2) {
                                TE_STUB.isLastStep = b;
                            }
                            this._.textUpdated(TE_STUB);
                            return true;
                        }
                    }
                }
                return false;
            };

            this.setValue = function(text){
                // cut to next line
                var i = text.indexOf('\n');
                if (i >= 0) {
                    text = text.substring(0, i);
                }

                if (this.$buf === null || this.$buf !== text) {
                    if (this.$buf !== null && this.$buf.length > 0) {
                        TE_STUB.$fillWith(this, "remove", 0, 1, 0, this.$buf.length);
                        TE_STUB.isLastStep = false;
                        this._.textUpdated(TE_STUB);
                    }

                    if (this.maxLen > 0 && text.length > this.maxLen) {
                        text = text.substring(0, this.maxLen);
                    }

                    this.$buf = text;
                    this._.textUpdated(TE_STUB.$fillWith(this, "insert", 0, 1, 0, text.length));
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
                if (max !== this.maxLen){
                    this.maxLen = max;
                    this.setValue("");
                }
            };
        }
    ]);

    /**
     * List model class
     * @param  {Array} [a] an array the list model has to be initialized with
     * @example

          // create list model that contains three integer elements
          var l = new zebkit.data.ListModel([1,2,3]);
          l.on("elementInserted", function(list, element, index) {
              // handle list item inserted event
              ...
          })
          ...
          l.add(10)

     * @constructor
     * @class zebkit.data.ListModel
     * @uses zebkit.data.DataModel
     * @uses zebkit.EventProducer
     */

     /**
      * Fired when a new element has been added to the list model

         list.on("elementInserted", function(src, o, i) {
             ...
         });

      * @event elementInserted
      * @param {zebkit.data.ListModel} src a list model that triggers the event
      * @param {Object}  o an element that has been added
      * @param {Integer} i an index at that the new element has been added
      */

     /**
      * Fired when an element has been removed from the list model

         list.on("elementRemoved", function(src, o, i) {
             ...
         });

      * @event elementRemoved
      * @param {zebkit.data.ListModel} src a list model that triggers the event
      * @param {Object}  o an element that has been removed
      * @param {Integer} i an index at that the element has been removed
      */

     /**
      * Fired when an element has been re-set

         list.on("elementSet", function(src, o, p, i) {
             ...
         });

      * @event elementSet
      * @param {zebkit.data.ListModel} src a list model that triggers the event
      * @param {Object}  o an element that has been set
      * @param {Object}  p a previous element
      * @param {Integer} i an index at that the element has been re-set
      */

    pkg.ListModel = Class(pkg.DataModel, zebkit.EventProducer,[
        function() {
            this._ = new this.clazz.Listeners();
            this.$data = (arguments.length === 0) ? [] : arguments[0];
        },

        function $clazz () {
            this.Listeners = zebkit.ListenersClass("elementInserted", "elementRemoved", "elementSet");
        },

        function $prototype() {
            /**
             * Get an item stored at the given location in the list
             * @method get
             * @param  {Integer} i an item location
             * @return {object}  a list item
             */
            this.get = function(i) {
                if (i < 0 || i >= this.$data.length) {
                    throw new RangeError(i);
                }
                return this.$data[i];
            };

            /**
             * Add the given item to the end of the list
             * @method add
             * @param  {Object} o an item to be added
             */
            this.add = function(o) {
                this.$data.push(o);
                this._.elementInserted(this, o, this.$data.length - 1);
            };

            /**
             * Remove all elements from the list model
             * @method removeAll
             */
            this.removeAll = function() {
                var size = this.$data.length;
                for(var i = size - 1; i >= 0; i--) {
                    this.removeAt(i);
                }
            };

            /**
             * Remove an element at the given location of the list model
             * @method removeAt
             * @param {Integer} i a location of an element to be removed from the list
             */
            this.removeAt = function(i) {
                var re = this.$data[i];
                this.$data.splice(i, 1);
                this._.elementRemoved(this, re, i);
            };

            /**
             * Remove the given element from the list
             * @method remove
             * @param {Object} o an element to be removed from the list
             */
            this.remove = function(o) {
                for(var i = 0;i < this.$data.length; i++) {
                    if (this.$data[i] === o) {
                        this.removeAt(i);
                    }
                }
            };

            /**
             * Insert the given element into the given position of the list
             * @method insert
             * @param {Integer} i a position at which the element has to be inserted into the list
             * @param {Object} o an element to be inserted into the list
             */
            this.insert = function(i, o){
                if (i < 0 || i > this.$data.length) {
                    throw new RangeError(i);
                }
                this.$data.splice(i, 0, o);
                this._.elementInserted(this, o, i);
            };

            /**
             * Get number of elements stored in the list
             * @method count
             * @return {Integer} a number of element in the list
             */
            this.count = function () {
                return this.$data.length;
            };

            /**
             * Set the new element at the given position
             * @method setAt
             * @param  {Integer} i a position
             * @param  {Object} o a new element to be set as the list element at the given position
             * @return {Object}  previous element that was stored at the given position
             */
            this.setAt = function(i, o) {
                if (i < 0 || i >= this.$data.length) {
                    throw new RangeError(i);
                }
                var pe = this.$data[i];
                this.$data[i] = o;
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
                return this.$data.indexOf(o);
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
    pkg.Item = Class([
        function(v) {
            /**
             * Array of children items of the item element
             * @attribute kids
             * @type {Array}
             * @default []
             * @readOnly
             */
            this.kids = [];

            if (arguments.length > 0) {
                this.value = v;
            }
        },

        function $prototype() {
            /**
             * Reference to a parent item
             * @attribute parent
             * @type {zebkit.data.Item}
             * @default null
             * @readOnly
             */
             this.parent = null;

             /**
              * The tree model item value. It is supposed the value should be updated
              * via execution of "setValue(...)" method of a tree model the item
              * belongs to.
              * @attribute value
              * @default null
              * @type {Object}
              * @readOnly
              */
             this.value = null;
        }
    ]).hashable();


    /**
     * Tree model class. The class is simple and handy way to keep hierarchical structure.
     *
     * @param  {zebkit.data.Item|Object} [r] a root item. As the argument you can pass "zebkit.data.Item" or
     * a JavaScript object. In the second case you can describe the tree as it is shown in example below:
     * @example

         // create tree model initialized with tree structure passed as
         // special formated JavaScript object. The tree will look as follow:
         //  "Root"
         //    |
         //    +--- "Root kid 1"
         //    +--- "Root kid 2"
         //            |
         //            +--- "Kid of kid 2"
         var tree = new zebkit.data.TreeModel({
            value:"Root",
            kids: [
                "Root kid 1",
                {
                    value: "Root kid 2",
                    kids:  [ "Kid of kid 2"]
                }
            ]
         });
         ...
         // reg item modified events handler
         tree.on("itemModified", function(tree, item, prevValue) {
             // catch item value modification
             ...
         });

         // item value has to be updated via tree model API
         tree.setValue(tree.root.kids[0], "new value");

     * @class zebkit.data.TreeModel
     * @uses zebkit.data.DataModel
     * @uses zebkit.EventProducer
     * @constructor
     */

    /**
     * Fired when the tree model item value has been updated.

     tree.on("itemModified", function(src, item, prevValue) {
         ...
     });

     * @event itemModified
     * @param {zebkit.data.TreeModel} src a tree model that triggers the event
     * @param {zebkit.data.Item}  item an item whose value has been updated
     * @param {Object} prevValue a previous value the item has had
     */

    /**
     * Fired when the tree model item has been removed

     tree.on("itemRemoved", function(src, item) {
        ...
     });

     * @event itemRemoved
     * @param {zebkit.data.TreeModel} src a tree model that triggers the event
     * @param {zebkit.data.Item}  item an item that has been removed from the tree model
     */

    /**
     * Fired when the tree model item has been inserted into the model

     tree.on("itemInserted", function(src, item) {{
        ...
     });

     * @event itemInserted
     * @param {zebkit.data.TreeModel} src a tree model that triggers the event
     * @param {zebkit.data.Item}  item an item that has been inserted into the tree model
     */
    pkg.TreeModel = Class(pkg.DataModel, zebkit.EventProducer, [
        function(r) {
            if (arguments.length === 0) {
                this.root = new pkg.Item();
            } else {
                this.root = zebkit.instanceOf(r, pkg.Item) ? r : this.clazz.create(r);
            }

            this._ = new this.clazz.Listeners();
        },

        function $clazz() {
            this.Listeners = zebkit.ListenersClass("itemModified", "itemRemoved", "itemInserted");

            /**
             * Create tree model item hierarchy by the given JavaScript object.
             * @param  {Object} r
             * @return {zebkit.data.Item} a built items hierarchy
             * @example
             *
             *      // create the following items hierarchy:
             *      //  "Root"
             *      //    +--- "Kid 1"
             *      //    |      +--- "Kid 1.1"
             *      //    |      |       +--- "Kid 1.1.1"
             *      //    |      +--- "Kid 2.2"
             *      //    +--- "Kid 2"
             *      //    |        +--- "Kid 2.1"
             *      //    |        +--- "Kid 2.2"
             *      //    |        +--- "Kid 2.3"
             *      //    +--- "Kid 3"
             *      //
             *      var rootItem = zebkit.data.TreeModel.create({
             *          value : "Root",
             *          kids  : [
             *              {   value : "Kid 1"
             *                  kids  : [
             *                      {  value: "Kid 1.1",
             *                         kids : "Kid 1.1.1"
             *                      },
             *                      "Kid 2.2"
             *                  ]
             *              },
             *              {   value: "Kid 2",
             *                  kids : ["Kid 2.1", "Kid 2.2", "Kid 2.3"]
             *              },
             *              "Kid 3"
             *          ]
             *      });
             *
             * @static
             * @method create
             */
            this.create = function(r, p) {
                var item = new pkg.Item(r.hasOwnProperty("value")? r.value : r);
                item.parent = arguments.length < 2 ? null : p;
                if (typeof r.kids !== 'undefined' && r.kids !== null) {
                    for(var i = 0; i < r.kids.length; i++) {
                        item.kids[i] = this.create(r.kids[i], item);
                    }
                }
                return item;
            };

            /**
             * Find the first tree item (starting from the specified root item) whose value equals the given value.
             * @param  {zebkit.data.Item} root a root item of the tree
             * @param  {Object} value a value to evaluate
             * @return {zebkit.data.Item} a found tree item
             * @static
             * @method findOne
             */
            this.findOne = function(root, value) {
                var res = null;
                this.find(root, value, function(item) {
                    res = item;
                    return true;
                });
                return res;
            };

            /**
             * Find all items (starting from the specified root item) whose value equals the given value.
             * @param  {zebkit.data.Item} root a root item of the tree
             * @param  {Object} value a value to evaluate
             * @param  {Function} [cb] a callback method that is called for every tree item whose value matches
             * the specified one. The method gets the found item as its argument. The method can return true
             * if the tree traversing has to be interrupted.
             * @return {Array} a list of all found item whose value matches the specified one. The array is returned
             * only if no callback method has been passed to the method.
             * @example
             *
             *      // create tree items
             *      var rootItem = zebkit.data.TreeModel.create({
             *          value: "Root",
             *          kids : [ "Kid 1", "Kid 2", "Kid 1", "Kid 3", "Kid 1" ]
             *      });
             *
             *      // find all items that have its value set to "Kid 1" and return
             *      // it as array
             *      var items = zebkit.data.TreeModel.find(rootItem, "Kid 1");
             *
             *      // find the first two "Kid 1" item in the tree using callback
             *      var items = [];
             *      zebkit.data.TreeModel.find(rootItem, "Kid 1", function(item) {
             *          items.push(item);
             *
             *          // stop the tree traversing as soon as we found two items
             *          return items.length > 1;
             *      });
             *
             * @static
             * @method find
             */
            this.find = function(root, value, cb) {
                if (arguments.length < 3) {
                    var res = [];
                    this.find(root, value, function(item) {
                        res.push(item);
                        return false;
                    });
                    return res;
                }

                if (root.value === value) {
                    if (cb.call(this, root) === true) {
                        return true;
                    }
                }

                if (typeof root.kids !== 'undefined' && root.kids !== null) {
                    for (var i = 0; i < root.kids.length; i++) {
                        if (this.find(root.kids[i], value, cb)) {
                            return true;
                        }
                    }
                }
                return false;
            };

            this.print = function(root, render, shift) {
                if (zebkit.instanceOf(root, pkg.TreeModel)) {
                    root = root.root;
                }

                if (arguments.length < 2) {
                    shift  = "";
                    render = null;
                } else if (arguments.length === 2) {
                    if (zebkit.isString(render)) {
                        shift  = render;
                        render = null;
                    } else {
                        shift = "";
                    }
                }

                var b = typeof root.kids !== 'undefined' && root.kids !== null;

                if (render !== null) {
                    render(root);
                }

                if (b) {
                    shift = shift + "    ";
                    for (var i = 0; i < root.kids.length; i++) {
                        this.print(root.kids[i], render, shift);
                    }
                }
            };
        },

        function $prototype() {
            /**
             * Reference to the tree model root item
             * @attribute root
             * @type {zebkit.data.Item}
             * @readOnly
             */
            this.root = null;

            /**
             * Iterate over tree hierarchy starting from its root element
             * @param  {zebkit.data.Item} r a root element to start traversing the tree model
             * @param  {Function} f a callback function that is called for every tree item traversed item.
             * The callback gets tree model and the item as its arguments
             * @method iterate
             */
            this.iterate = function(r, f) {
                var res = f.call(this, r);
                if (res === 1 || res === 2) { //TODO: make it clear what is a mening of the res ?
                    return r;
                }

                for (var i = 0; i < r.kids.length; i++) {
                    res = this.iterate(r.kids[i], f);
                    if (res === 2) {
                        return res;
                    }
                }
            };

            /**
             * Update a value of the given tree model item with the new one
             * @method setValue
             * @param  {zebkit.data.Item} item an item whose value has to be updated
             * @param  {Object} v   a new item value
             */
            this.setValue = function(item, v){
                var prev = item.value;
                item.value = v;
                this._.itemModified(this, item, prev);
            };

            /**
             * Add the new item to the tree model as a children element of the given parent item
             * @method add
             * @param  {zebkit.data.Item} [to] a parent item to which the new item has to be added.
             * If it has not been passed the node will be added to root.
             * @param  {Object|zebkit.data.Item} an item or value of the item to be
             * added to the parent item of the tree model
             */
            this.add = function(to,item) {
                if (arguments.length < 2) {
                    to = this.root;
                }

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
            this.insert = function(to, item, i) {
                if (i < 0 || to.kids.length < i) {
                    throw new RangeError(i);
                }

                if (zebkit.isString(item)) {
                    item = new pkg.Item(item);
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
                if (item === this.root) {
                    this.root = null;
                } else {
                    if (typeof item.kids !== 'undefined') {
                        for(var i = item.kids.length - 1; i >= 0; i--) {
                            this.remove(item.kids[i]);
                        }
                    }
                    item.parent.kids.splice(item.parent.kids.indexOf(item), 1);
                }

                // preserve reference to parent when we call a listener
                try {
                    this._.itemRemoved(this, item);
                } catch(e) {
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
        }
    ]);

    /**
     *  Matrix model class.
     *  @constructor
     *  @param  {Array} [data] the given data as two dimensional array
     *  @param  {Integer} [rows] a number of rows
     *  @param  {Integer} [cols] a number of columns
     *  @class zebkit.data.Matrix
     *  @uses zebkit.EventProducer
     *  @uses zebkit.data.DataModel
     *  @example
     *
     *      // create matrix with 10 rows and 5 columns
     *      var matrix = zebkit.data.Matrix(10, 5);
     *
     *      matrix.get(0,0);
     *      matrix.put(0,0, "Cell [0,0]");
     *
     *  @example
     *
     *      // create matrix with 3 rows and 5 columns
     *      var matrix = zebkit.data.Matrix([
     *          [ 0, 1, 2, 3, 4 ],  // row 0
     *          [ 0, 1, 2, 3, 4 ],  // row 1
     *          [ 0, 1, 2, 3, 4 ],  // row 2
     *          [ 0, 1, 2, 3, 4 ],  // row 3
     *          [ 0, 1, 2, 3, 4 ]   // row 4
     *      ]);
     *
     *  @example
     *
     *      // create matrix with 0 rows and 0 columns
     *      var matrix = zebkit.data.Matrix();
     *
     *      // setting value for cell (2, 4) will change
     *      // matrix size to 2 rows and 3 columns
     *      matrix.put(2, 4, "Cell [row = 2, col = 4]");
     */

    /**
     * Fired when the matrix model size (number of rows or columns) is changed.

      matrix.on("matrixResized", function(src, pr, pc) {
          ...
      });

     * @event matrixResized
     * @param {zebkit.data.Matrix} src a matrix that triggers the event
     * @param {Integer}  pr a previous number of rows
     * @param {Integer}  pc a previous number of columns
     */

    /**
     * Fired when the matrix model cell has been updated.

      matrix.on("cellModified", function(src, row, col, old) {
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

      matrix.on("matrixSorted", function(src, sortInfo) {
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
     * Fired when a row has been inserted into the matrix.

      matrix.on("matrixRowInserted", function(src, rowIndex) {
         ...
      });

     * @event matrixColInserted
     * @param {zebkit.data.Matrix} src a matrix that triggers the event
     * @param {Integer}  rowIndex a row that has been inserted
     * contains:
     */

    /**
     * Fired when a column has been inserted into the matrix.

      matrix.on("matrixColInserted", function(src, colIndex) {
         ...
      });

     * @event matrixColInserted
     * @param {zebkit.data.Matrix} src a matrix that triggers the event
     * @param {Integer}  colIndex a column that has been inserted
     * contains:
     */
    pkg.Matrix = Class(pkg.DataModel, zebkit.EventProducer, [
        function() {
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

            /**
             * The multi-dimensional embedded arrays to host matrix data
             * @attribute $objs
             * @type {Array}
             * @readOnly
             * @private
             */

            this._ = new this.clazz.Listeners();
            if (arguments.length === 1) {
                this.$objs = arguments[0];
                this.cols = (this.$objs.length > 0) ? this.$objs[0].length : 0;
                this.rows = this.$objs.length;
            } else {
                this.$objs = [];
                this.rows = this.cols = 0;
                if (arguments.length > 1) {
                    this.setRowsCols(arguments[0], arguments[1]);
                }
            }
        },

        function $clazz() {
            this.Listeners = zebkit.ListenersClass("matrixResized", "cellModified",
                                                   "matrixSorted",  "matrixRowInserted",
                                                   "matrixColInserted");
        },

        function $prototype() {
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

                return typeof this.$objs[row] === 'undefined' ? undefined : this.$objs[row][col];
            };

            /**
             * Get a matrix model cell value by the specified index
             * @method geti
             * @param  {Integer} index a cell index
             * @return {Object}  matrix model cell value
             */
            this.geti = function(i) {
                return this.get(Math.floor(i / this.cols), i % this.cols);
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

                if (row >= nr) {
                    nr += (row - nr + 1);
                }

                if (col >= nc) {
                    nc += (col - nc + 1);
                }

                this.setRowsCols(nr, nc);
                var old = typeof this.$objs[row] !== 'undefined' ? this.$objs[row][col] : undefined;
                if (old === 'undefined' || obj !== old) {
                    // allocate array if no data for the given row exists
                    if (typeof this.$objs[row] === 'undefined') {
                        this.$objs[row] = [];
                    }
                    this.$objs[row][col] = obj;
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
                this.put( Math.floor(i / this.cols),
                          i % this.cols, obj);
            };

            /**
             * Set the given number of rows and columns the model has to have.
             * @method setRowsCols
             * @param  {Integer} rows a new number of rows
             * @param  {Integer} cols a new number of columns
             */
            this.setRowsCols = function(rows, cols){
                if (rows !== this.rows || cols !== this.cols){
                    var pc = this.cols,
                        pr = this.rows;

                    this.cols = cols;
                    this.rows = rows;

                    // re-locate matrix space
                    if (this.$objs.length > rows) {
                        this.$objs.length = rows;   // shrink number of rows
                    }

                    // shrink columns
                    if (pc > cols) {
                        for(var i = 0; i < this.$objs.length; i++) {
                            // check if data for columns has been allocated and the size
                            // is greater than set number of columns
                            if (typeof this.$objs[i] !== 'undefined' && this.$objs[i].length > cols) {
                                this.$objs[i].length = cols;
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

                this.$objs.splice(begrow, count);
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

                for(var i = 0; i < this.$objs.length; i++) {
                    if (typeof this.$objs[i] !== 'undefined' && this.$objs[i].length > 0) {
                        this.$objs[i].splice(begcol, count);
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

                var i = 0;
                if (row <= this.$objs.length - 1) {
                    for(i = 0; i < count; i++) {
                        this.$objs.splice(row, 0, undefined);
                        this._.matrixRowInserted(this, row + i);
                    }
                } else {
                    for(i = 0; i < count; i++) {
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

                if (this.$objs.length  > 0) {
                    for(var j = 0; j < count; j++) {
                        for(var i = 0; i < this.rows; i++) {
                            if (typeof this.$objs[i] !== 'undefined' && j <= this.$objs[i].length) {
                                this.$objs[i].splice(col, 0, undefined);
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
                if (arguments.length < 2) {
                    f = pkg.descent;
                }

                this.$objs.sort(function(a, b) {
                    return f(a[col], b[col]);
                });

                this._.matrixSorted(this, { col : col,
                                            func: f,
                                            name: zebkit.$FN(f).toLowerCase() });
            };
        }
    ]);
});
zebkit.package("util", function(pkg, Class) {
    /**
     * Number of different utilities methods and classes.
     * @class zebkit.util
     * @access package
     */

    /**
     * Validate the specified value to be equal one of the given values
     * @param  {value} value a value to be validated
     * @param  {Object} [allowedValues]* a number of valid values to test against
     * @throws Error if the value doesn't match any valid value
     * @for  zebkit.util
     * @method  validateValue
     * @example
     *      // test if the alignment is equal one of the possible values
     *      // throws error otherwise
     *      zebkit.util.validateValue(alignment, "top", "left", "right", "bottom");
     * @protected
     */
    pkg.validateValue = function(value) {
        if (arguments.length < 2) {
            throw new Error("Invalid arguments list. List of valid values is expected");
        }

        for(var i = 1; i < arguments.length; i++) {
            if (arguments[i] === value) {
                return value;
            }
        }

        var values = Array.prototype.slice.call(arguments).slice(1);
        throw new Error("Invalid value '" + value + "',the following values are expected: " + values.join(','));
    };

    /**
     * Compare two dates.
     * @param  {Date} d1 a first date
     * @param  {Date} d2 a second sate
     * @return {Integer} 0 if the two dates are equal, -1 if d1 < d2, 1 if d1 > d2,
     * null if one of the date is null
     * @method compareDates
     */
    pkg.compareDates = function(d1, d2) {
        if (arguments.length === 2 && d1 === d2) {
            return 0;
        }

        // exclude null dates
        if (d1 === null || d2 === null) {
            return null;
        }

        var day1, month1, year1,
            day2, month2, year2,
            i = 1;

        if (d1 instanceof Date) {
            day1   = d1.getDate();
            month1 = d1.getMonth();
            year1  = d1.getFullYear();
        } else {
            day1   = arguments[0];
            month1 = arguments[1];
            year1  = arguments[2];
            i = 3;
        }

        d2 = arguments[i];
        if (d2 instanceof Date) {
            day2   = d2.getDate();
            month2 = d2.getMonth();
            year2  = d2.getFullYear();
        } else {
            day2   = arguments[i];
            month2 = arguments[i + 1];
            year2  = arguments[i + 2];
        }

        if (day1 === day2 && month1 === month2 && year1 === year2) {
            return 0;
        } else if (year1 > year2 ||
                   (year1 === year2 && month1 > month2) ||
                   (year1 === year2 && month1 === month2 && day1 > day2))
        {
            return 1;
        } else {
            return -1;
        }
    };

    /**
     * Validate the given date
     * @param  {Date} date a date to be validated
     * @return {Boolean} true if the date is valid
     * @method validateDate
     */
    pkg.validateDate = function(day, month, year) {
        var d = (arguments.length < 3) ? (arguments.length === 1 ? day : new Date(month, day))
                                       : new Date(year, month, day);
        if (d.isValid() === false) {
            throw new Error("Invalid date : " + d);
        }
    };

    pkg.format = function(s, obj, ph) {
        if (arguments.length < 3) {
            ph = '';
        }

        var rg = /\$\{([0-9]+\s*,)?(.?,)?([a-zA-Z_][a-zA-Z0-9_]*)\}/g,
            r  = [],
            i  = 0,
            j  = 0,
            m  = null;

        while ((m = rg.exec(s)) !== null) {
            r[i++] = s.substring(j, m.index);

            j = m.index + m[0].length;

            var v  = obj[m[3]],
                mn = "get" + m[3][0].toUpperCase() + m[3].substring(1),
                f  = obj[mn];

            if (typeof f === "function") {
                v = f.call(obj);
            }

            if (m[1] !== undefined) {
                var ml  = parseInt(m[1].substring(0, m[1].length - 1).trim()),
                    ph2 = m[2] !== undefined ? m[2].substring(0, m[2].length - 1) : ph;

                if (v === null || v === undefined) {
                    ph2 = ph;
                    v = "";
                } else {
                    v = "" + v;
                }

                for(var k = v.length; k < ml; k++) {
                    v = ph2 + v;
                }
            }

            if (v === null || v === undefined) {
                v = ph;
            }

            r[i++] = v;
        }

        if (i > 0) {
            if (j < s.length) {
                r[i++] = s.substring(j);
            }

            return pkg.format(r.join(''), obj, ph);
        }

        return s;
    };

    /**
     * Compute intersection of the two given rectangular areas
     * @param  {Integer} x1 a x coordinate of the first rectangular area
     * @param  {Integer} y1 a y coordinate of the first rectangular area
     * @param  {Integer} w1 a width of the first rectangular area
     * @param  {Integer} h1 a height of the first rectangular area
     * @param  {Integer} x2 a x coordinate of the first rectangular area
     * @param  {Integer} y2 a y coordinate of the first rectangular area
     * @param  {Integer} w2 a width of the first rectangular area
     * @param  {Integer} h2 a height of the first rectangular area
     * @param  {Object}  r  an object to store result
     *
     *      { x: {Integer}, y:{Integer}, width:{Integer}, height:{Integer} }
     *
     * @method intersection
     * @for zebkit.util
     */
    pkg.intersection = function(x1,y1,w1,h1,x2,y2,w2,h2,r){
        r.x = x1 > x2 ? x1 : x2;
        r.width = Math.min(x1 + w1, x2 + w2) - r.x;
        r.y = y1 > y2 ? y1 : y2;
        r.height = Math.min(y1 + h1, y2 + h2) - r.y;
    };

    /**
     * Test if two rectangular areas have intersection
     * @param  {Integer} x1 a x coordinate of the first rectangular area
     * @param  {Integer} y1 a y coordinate of the first rectangular area
     * @param  {Integer} w1 a width of the first rectangular area
     * @param  {Integer} h1 a height of the first rectangular area
     * @param  {Integer} x2 a x coordinate of the first rectangular area
     * @param  {Integer} y2 a y coordinate of the first rectangular area
     * @param  {Integer} w2 a width of the first rectangular area
     * @param  {Integer} h2 a height of the first rectangular area
     * @return {Boolean} true if the given two rectangular areas intersect
     *
     * @method isIntersect
     * @for zebkit.util
     */
    pkg.isIntersect = function(x1,y1,w1,h1,x2,y2,w2,h2){
        return (Math.min(x1 + w1, x2 + w2) - (x1 > x2 ? x1 : x2)) > 0 &&
               (Math.min(y1 + h1, y2 + h2) - (y1 > y2 ? y1 : y2)) > 0;
    };

    /**
     * Unite two rectangular areas to one rectangular area.
     * @param  {Integer} x1 a x coordinate of the first rectangular area
     * @param  {Integer} y1 a y coordinate of the first rectangular area
     * @param  {Integer} w1 a width of the first rectangular area
     * @param  {Integer} h1 a height of the first rectangular area
     * @param  {Integer} x2 a x coordinate of the first rectangular area
     * @param  {Integer} y2 a y coordinate of the first rectangular area
     * @param  {Integer} w2 a width of the first rectangular area
     * @param  {Integer} h2 a height of the first rectangular area
     * @param  {Object}  r  an object to store result
     *
     *      { x: {Integer}, y:{Integer}, width:{Integer}, height:{Integer} }
     *
     * @method unite
     * @for zebkit.util
     */
    pkg.unite = function(x1,y1,w1,h1,x2,y2,w2,h2,r){
        r.x = x1 < x2 ? x1 : x2;
        r.y = y1 < y2 ? y1 : y2;
        r.width  = Math.max(x1 + w1, x2 + w2) - r.x;
        r.height = Math.max(y1 + h1, y2 + h2) - r.y;
    };

    var letterRE = /[A-Za-z]/;
    pkg.isLetter = function (ch) {
        if (ch.length !== 1) {
            throw new Error("Incorrect character");
        }
        return letterRE.test(ch);
    };


    /**
     * Useful class to track a virtual cursor position in a structure that has dedicated number of lines
     * where every line has a number of elements. The structure metric has to be described by providing
     * an instance of zebkit.util.Position.Metric interface that discovers how many lines the structure
     * has and how many elements every line includes.
     * @param {zebkit.util.Position.Metric} m a position metric
     * @constructor
     * @class zebkit.util.Position
     */

    /**
     * Fire when a virtual cursor position has been updated
     *
     *      position.on(function(src, prevOffset, prevLine, prevCol) {
     *          ...
     *      });
     *
     * @event posChanged
     * @param {zebkit.util.Position} src an object that triggers the event
     * @param {Integer} prevOffest a previous virtual cursor offset
     * @param {Integer} prevLine a previous virtual cursor line
     * @param {Integer} prevCol a previous virtual cursor column in the previous line
     */
    pkg.Position = Class([
        function(pi){
            this.setMetric(pi);
        },

        function $clazz() {
            /**
             * Position metric interface. This interface is designed for describing
             * a navigational structure that consists on number of lines where
             * every line consists of number of elements
             * @class zebkit.util.Position.Metric
             * @interface zebkit.util.Position.Metric
             */

            /**
             * Get number of lines to navigate through
             * @return {Integer} a number of lines
             * @method  getLines
             */

             /**
              * Get a number of elements in the given line
              * @param {Integer} l a line index
              * @return {Integer} a number of elements in a line
              * @method  getLineSize
              */

             /**
              * Get a maximal element index (a last element of a last line)
              * @return {Integer} a maximal element index
              * @method  getMaxOffset
              */

            this.Metric = zebkit.Interface([
                "abstract",
                    function getLines()     {},
                    function getLineSize()  {},
                    function getMaxOffset() {}
            ]);
        },

        /**
         *  @for zebkit.util.Position
         */
        function $prototype() {
            /**
             * Current virtual cursor line position
             * @attribute currentLine
             * @type {Integer}
             * @readOnly
             */
            this.currentLine = 0;

            /**
             * Current virtual cursor column position
             * @attribute currentCol
             * @type {Integer}
             * @readOnly
             */
             this.currentCol = 0;

            /**
             * Current virtual cursor offset
             * @attribute offset
             * @type {Integer}
             * @readOnly
             */
            this.offset = 0;

            /**
             * Shows if the position object is in valid state.
             * @private
             * @type {Boolean}
             * @attribute isValid
             */
            this.isValid = false;

            /**
             * Set the specified virtual cursor offsest
             * @param {Integer} o an offset, pass null to set position to indefinite state.
             *
             *   - if offset is null than offset will set to -1 (undefined state)
             *   - if offset is less than zero than offset will be set to zero
             *   - if offset is greater or equal to maximal possible offset it will be set to maximal possible offset
             *
             *  @return {Integer} an offset that has been set
             * @method setOffset
             */
            this.setOffset = function(o){
                if (o < 0) {
                    o = 0;
                } else if (o === null) {
                    o = -1;
                } else {
                    var max = this.metrics.getMaxOffset();
                    if (o >= max) {
                        o = max;
                    }
                }

                if (o !== this.offset){
                    var prevOffset = this.offset,
                        prevLine   = this.currentLine,
                        prevCol    = this.currentCol,
                        p          = this.getPointByOffset(o);

                    this.offset = o;
                    if (p !== null){
                        this.currentLine = p[0];
                        this.currentCol  = p[1];
                    } else {
                        this.currentLine = this.currentCol = -1;
                    }
                    this.isValid = true;
                    this.fire("posChanged", [this, prevOffset, prevLine, prevCol]);
                }

                return o;
            };

            /**
             * Seek virtual cursor offset with the given shift
             * @param {Integer} off a shift
             * @return {Integer} an offset that has been set
             * @method seek
             */
            this.seek = function(off) {
                return this.setOffset(this.offset + off);
            };

            /**
             * Set the virtual cursor line and the given column in the line
             * @param {Integer} r a line
             * @param {Integer} c a column in the line
             * @method setRowCol
             */
            this.setRowCol = function(r, c) {
                if (r !== this.currentLine || c !== this.currentCol){
                    var prevOffset = this.offset,
                        prevLine = this.currentLine,
                        prevCol = this.currentCol;

                    this.offset = this.getOffsetByPoint(r, c);
                    this.currentLine = r;
                    this.currentCol = c;
                    this.fire("posChanged", [this, prevOffset, prevLine, prevCol]);
                }
            };

            /**
             * Special method to inform the position object that its state has to be adjusted
             * because of the given portion of data had been inserted .
             * @param  {Integer} off  an offset the insertion has happened
             * @param  {Integer} size a length of the inserted portion
             * @protected
             * @method  removed
             */
            this.inserted = function(off, size) {
                if (this.offset >= 0 && off <= this.offset){
                    this.isValid = false;
                    this.setOffset(this.offset + size);
                }
            };

            /**
             * Special method to inform the position object that its state has to be adjusted
             * because of the given portion of data had been removed.
             * @param  {Integer} off  an offset the removal has happened
             * @param  {Integer} size a length of the removed portion
             * @protected
             * @method  removed
             */
            this.removed = function (off, size){
                if (this.offset >= 0 && this.offset >= off){
                    this.isValid = false;
                    this.setOffset(this.offset >= (off + size) ? this.offset - size
                                                               : off);
                }
            };

            /**
             * Calculate a line and line column by the given offset.
             * @param  {Integer} off an offset
             * @return {Array} an array that contains a line as the first
             * element and a column in the line as the second element.
             * @method getPointByOffset
             */
            this.getPointByOffset = function(off){
                if (off >= 0) {
                    var m   = this.metrics,
                        max = m.getMaxOffset();

                    if (off > max) {
                        throw new Error("Out of bounds:" + off);
                    } else if (max === 0) {
                        return [(m.getLines() > 0 ? 0 : -1), 0];
                    } else if (off === 0) {
                        return [0, 0];
                    }

                    var d = 0, sl = 0, so = 0;
                    if (this.isValid === true && this.offset !== -1) {
                        sl = this.currentLine;
                        so = this.offset - this.currentCol;
                        if (off > this.offset) {
                            d = 1;
                        } else if (off < this.offset) {
                            d = -1;
                        } else {
                            return [sl, this.currentCol];
                        }
                    } else {
                        d = (Math.floor(max / off) === 0) ? -1 : 1;
                        if (d < 0) {
                            sl = m.getLines() - 1;
                            so = max - m.getLineSize(sl);
                        }
                    }

                    for(; sl < m.getLines() && sl >= 0; sl += d){
                        var ls = m.getLineSize(sl);
                        if (off >= so && off < so + ls) {
                            return [sl, off - so];
                        }
                        so += d > 0 ? ls : -m.getLineSize(sl - 1);
                    }
                }
                return null;
            };

            /**
             * Calculate an offset by the given line and column in the line
             * @param  {Integer} row a line
             * @param  {Integer} col a column in the line
             * @return {Integer} an offset
             * @method getOffsetByPoint
             */
            this.getOffsetByPoint = function (row, col){
                var startOffset = 0, startLine = 0, m = this.metrics, i = 0;

                if (row >= m.getLines()) {
                    throw new RangeError(row);
                }

                if (col >= m.getLineSize(row)) {
                    throw new RangeError(col);
                }

                if (this.isValid === true && this.offset !==  -1) {
                    startOffset = this.offset - this.currentCol;
                    startLine = this.currentLine;
                }

                if (startLine <= row) {
                    for(i = startLine;i < row; i++) {
                        startOffset += m.getLineSize(i);
                    }
                } else {
                    for(i = startLine - 1;i >= row; i--) {
                        startOffset -= m.getLineSize(i);
                    }
                }
                return startOffset + col;
            };

            /**
             * Seek virtual cursor to the next position. How the method has to seek to the next position
             * has to be denoted by one of the following constants:

        - **"begin"** seek cursor to the begin of the current line
        - **"end"** seek cursor to the end of the current line
        - **"up"** seek cursor one line up
        - **"down"** seek cursor one line down

             * If the current virtual position is not known (-1) the method always sets
             * it to the first line, the first column in the line (offset is zero).
             * @param  {Integer} t   an action the seek has to be done
             * @param  {Integer} num number of seek actions
             * @method seekLineTo
             */
            this.seekLineTo = function(t,num){
                if (this.offset < 0){
                    this.setOffset(0);
                } else {
                    if (arguments.length === 1) {
                        num = 1;
                    }

                    var prevOffset = this.offset,
                        prevLine   = this.currentLine,
                        prevCol    = this.currentCol,
                        maxCol     = 0,
                        i          = 0;

                    switch(t) {
                        case "begin":
                            if (this.currentCol > 0){
                                this.offset -= this.currentCol;
                                this.currentCol = 0;
                            } break;
                        case "end":
                            maxCol = this.metrics.getLineSize(this.currentLine);
                            if (this.currentCol < (maxCol - 1)) {
                                this.offset += (maxCol - this.currentCol - 1);
                                this.currentCol = maxCol - 1;
                            } break;
                        case "up":
                            if (this.currentLine > 0) {
                                this.offset -= (this.currentCol + 1);
                                this.currentLine--;
                                for(i = 0; this.currentLine > 0 && i < (num - 1); i++, this.currentLine--) {
                                    this.offset -= this.metrics.getLineSize(this.currentLine);
                                }

                                maxCol = this.metrics.getLineSize(this.currentLine);
                                if (this.currentCol < maxCol) {
                                    this.offset -= (maxCol - this.currentCol - 1);
                                } else {
                                    this.currentCol = maxCol - 1;
                                }
                            } break;
                        case "down":
                            if (this.currentLine < (this.metrics.getLines() - 1)) {
                                this.offset += (this.metrics.getLineSize(this.currentLine) - this.currentCol);
                                this.currentLine++;
                                var size = this.metrics.getLines() - 1;
                                for (i = 0; this.currentLine < size && i < (num - 1); i++ ,this.currentLine++ ) {
                                    this.offset += this.metrics.getLineSize(this.currentLine);
                                }

                                maxCol = this.metrics.getLineSize(this.currentLine);
                                if (this.currentCol < maxCol) {
                                    this.offset += this.currentCol;
                                } else {
                                    this.currentCol = maxCol - 1;
                                    this.offset += this.currentCol;
                                }
                            } break;
                        default: throw new Error("" + t);
                    }

                    this.fire("posChanged", [this, prevOffset, prevLine, prevCol]);
                }
            };

            /**
             * Set position metric. Metric describes how many lines
             * and elements in these line the virtual cursor can be navigated
             * @param {zebkit.util.Position.Metric} p a position metric
             * @method setMetric
             */
            this.setMetric = function(p) {
                if (p === null || p === undefined) {
                    throw new Error("Null metric");
                }

                if (p !== this.metrics){
                    this.metrics = p;
                    this.setOffset(null);
                }
            };
        }
    ]).events("posChanged");

    /**
     * Single column position implementation. More simple and more fast implementation of
     * position class for the cases when only one column is possible.
     * @param {zebkit.util.Position.Metric} m a position metric
     * @constructor
     * @class zebkit.util.SingleColPosition
     * @extends zebkit.util.Position
     */
    pkg.SingleColPosition = Class(pkg.Position, [
        function $prototype() {
            this.setRowCol = function(r,c) {
                this.setOffset(r);
            };

            this.setOffset = function(o) {
                if (o < 0) { o = 0;
                } else if (o === null) {
                    o = -1;
                } else {
                    var max = this.metrics.getMaxOffset();
                    if (o >= max) {
                        o = max;
                    }
                }

                if (o !== this.offset) {
                    var prevOffset = this.offset,
                        prevLine   = this.currentLine,
                        prevCol    = this.currentCol;

                    this.currentLine = this.offset = o;
                    this.isValid = true;
                    this.fire("posChanged", [this, prevOffset, prevLine, prevCol]);
                }

                return o;
            };

            this.seekLineTo = function(t, num){
                if (this.offset < 0){
                    this.setOffset(0);
                } else {
                    if (arguments.length === 1) {
                        num = 1;
                    }

                    switch(t) {
                        case "begin":
                        case "end": break;
                        case "up":
                            if (this.offset > 0) {
                                this.setOffset(this.offset - num);
                            } break;
                        case "down":
                            if (this.offset < (this.metrics.getLines() - 1)){
                                this.setOffset(this.offset + num);
                            } break;
                        default: throw new Error("" + t);
                    }
                }
            };
        }
    ]);

    /**
     * Task set is light-weight class to host number of callbacks methods that
     * are called within a context of one JS interval method execution. The
     * class manages special tasks queue to run it one by one as soon as a
     * dedicated interval for the given task is elapsed

        var tasks = new zebkit.util.TasksSet();

        tasks.run(function(t) {
            // task1 body
            ...
            if (condition) {
                t.shutdown();
            }
        }, 1000, 200);

        tasks.run(function(t) {
            // task2 body
            ...
            if (condition) {
                t.shutdown();
            }
        }, 2000, 300);

     * @constructor
     * @param  {Integer} [maxTasks] maximal possible number of active tasks in queue.
     * @class zebkit.util.TasksSet
     */
    pkg.TasksSet = Class([
        function(c) {
            this.tasks = Array(arguments.length > 0 ? c : 5);

            // pre-fill tasks pool
            for(var i = 0; i < this.tasks.length; i++) {
                this.tasks[i] = new this.clazz.Task(this);
            }
        },

        function $clazz() {
            /**
             * Task class
             * @class zebkit.util.TasksSet.Task
             * @for zebkit.util.TasksSet.Task
             * @param {zebkit.util.TasksSet} tasksSet a reference to tasks set that manages the task
             * @constructor
             */
            this.Task = Class([
                function(set) {
                    /**
                     * Reference to a tasks set that owns the task
                     * @type {zebkit.util.TasksSet}
                     * @attribute taskSet
                     * @private
                     * @readOnly
                     */
                    this.taskSet = set;

                    /**
                     * Indicates if the task is executed (active)
                     * @type {Boolean}
                     * @attribute isStarted
                     * @readOnly
                     */
                    this.isStarted = false;
                },

                function $prototype() {
                    this.task = null;
                    this.ri = this.si  = 0;

                    /**
                     * Shutdown the given task.
                     * @return {Boolean} true if the task has been stopped
                     * @method shutdown
                     */
                    this.shutdown = function() {
                        return this.taskSet.shutdown(this);
                    };

                    /**
                     * Pause the given task.
                     * @return {Boolean} true if the task has been paused
                     * @method pause
                     */
                    this.pause = function() {
                        if (this.task === null) {
                            throw new Error("Stopped task cannot be paused");
                        }

                        if (this.isStarted === true) {
                            this.isStarted = false;
                            return true;
                        } else {
                            return false;
                        }
                    };

                    /**
                     * Resume the given task
                     * @param {Integer} [startIn] a time in milliseconds to resume the task
                     * @return {Boolean} true if the task has been resumed
                     * @method resume
                     */
                    this.resume = function(t) {
                        if (this.task === null) {
                            throw new Error("Stopped task cannot be paused");
                        }

                        this.si = arguments.length > 0 ? t : 0;
                        if (this.isStarted === true) {
                            return false;
                        } else {
                            this.isStarted = true;
                            return true;
                        }
                    };
                }
            ]);
        },

        /**
         *  @for  zebkit.util.TasksSet
         */
        function $prototype() {
            /**
             * Interval
             * @attribute quantum
             * @private
             * @type {Number}
             * @default 40
             */
            this.quantum = 40;

            /**
             * pid of executed JS interval method callback
             * @attribute pid
             * @private
             * @type {Number}
             * @default -1
             */
            this.pid = -1;

            /**
             * Number of run in the set tasks
             * @attribute count
             * @private
             * @type {Number}
             * @default 0
             */
            this.count = 0;

            /**
             * Shut down all active at the given moment tasks
             * body and the given context.
             * @method shutdownAll
             */
            this.shutdownAll = function() {
                for(var i = 0; i < this.tasks.length; i++) {
                    this.shutdown(this.tasks[i]);
                }
            };

            /**
             * Shutdown the given task
             * @param  {zebkit.util.TasksSet.Task} t a task
             * @return {Boolean}  true if the task has been stopped, false if the task has not been started
             * to be stopped
             * @protected
             * @method shutdown
             */
            this.shutdown = function(t) {
                if (t.task !== null) {
                    this.count--;
                    t.task = null;
                    t.isStarted = false;
                    t.ri = t.si = 0;
                    return true;
                } else {
                    if (this.count === 0 && this.pid  >= 0) {
                        zebkit.environment.clearInterval(this.pid);
                        this.pid = -1;
                    }

                    return false;
                }
            };

            /**
             * Take a free task from tasks pool and run it once in the specified period of time.
             * @param  {Function|Object} f a task function that has to be executed. The task method gets the task
             * context as its argument. You can pass an object as the argument if the object has "run" method
             * implemented. In this cases "run" method will be used as the task body.
             * @param  {Integer} [startIn]  time in milliseconds the task has to be executed in
             * @method runOnce
             */
            this.runOnce = function(f, startIn) {
                this.run(f, startIn, -1);
            };

            /**
             * Take a free task from pool and run it with the specified body and the given context.
             * @param  {Function|Object} f a task function that has to be executed. The task method gets the task
             * context as its argument. You can pass an object as the argument if the object has "run" method
             * implemented. In this cases "run" method will be used as the task body.
             * @param {Integer} [si]  time in milliseconds the task has to be executed
             * @param {Integer} [ri]  the time in milliseconds the task has to be periodically repeated
             * @return {zebkit.util.Task} an allocated task
             * @example

        var tasks = new zebkit.util.TasksSet();

        // execute task
        var task = tasks.run(function (t) {
            // do something
            ...
            // complete task if necessary
            t.shutdown();
        }, 100, 300);

        // pause task
        task.pause(1000, 2000);

        ...
        // resume task in a second
        task.resume(1000);

             * @example

        var tasks = new zebkit.util.TasksSet();

        var a = new zebkit.Dummy([
            function run() {
                // task body
                ...
            }
        ]);

        // execute task
        var task = tasks.runOnce(a);

             * @method run
             */
            this.run = function(f, si, ri){
                if (f === null || f === undefined) {
                    throw new Error("" + f);
                }

                var $this = this;
                function dispatcher() {
                    var c = 0;
                    for(var i = 0; i < $this.tasks.length; i++) {
                        var t = $this.tasks[i];

                        // count paused or run tasks
                        if (t.task !== null) {  // means task has been shutdown
                            c++;
                        }

                        if (t.isStarted === true) {
                            if (t.si <= 0) {
                                try {
                                    if (t.task.run !== undefined) {
                                        t.task.run(t);
                                    } else {
                                        t.task(t);
                                    }

                                    if (t.ri < 0) {
                                        t.shutdown();
                                    }
                                } catch(e) {
                                    zebkit.dumpError(e);
                                }

                                t.si += t.ri;
                            } else {
                                t.si -= $this.quantum;
                            }
                        }
                    }

                    if (c === 0 && $this.pid >= 0) {
                        zebkit.environment.clearInterval($this.pid);
                        $this.pid = -1;
                    }
                }

                // find free and return free task
                for(var i = 0; i < this.tasks.length; i++) {
                    var j = (i + this.count) % this.tasks.length,
                        t = this.tasks[j];

                    if (t.task === null) {
                        // initialize internal variables start in and repeat in
                        // arguments
                        t.si = (arguments.length > 1) ? si : 0;
                        t.ri = (arguments.length > 2) ? ri : -1;
                        t.isStarted = true;
                        t.task = f;
                        this.count++;

                        if (this.count > 0 && this.pid < 0) {
                            this.pid = zebkit.environment.setInterval(dispatcher, this.quantum);
                        }

                        return t;
                    }
                }

                throw new Error("Out of active tasks limit (" +  this.tasks.length + ")");
            };
        }
    ]);

    /**
     * Predefined default tasks set.
     * @attribute tasksSet
     * @type {zebkit.util.TasksSet}
     * @for zebkit.util
     */
    pkg.tasksSet = new pkg.TasksSet(7);
});
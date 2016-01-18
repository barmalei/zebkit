/**
 * Number of different utilities methods and classes
 * @module util
 * @requires zebkit
 */
(function(pkg, Class, Interface) {

pkg.format = function(s, obj, ph) {
    if (ph == null) ph = '';

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

        if (m[1] != null) {
            var ml  = parseInt(m[1].substring(0, m[1].length - 1).trim()),
                ph2 = m[2] != null ? m[2].substring(0, m[2].length - 1) : ph;

            if (v == null) {
                ph2 = ph;
                v = "";
            }
            else {
                v = "" + v;
            }
            for(var k = v.length; k < ml; k++) v = ph2 + v;
        }

        if (v == null) v = ph;

        r[i++] = v;
    }

    if (i > 0) {
        if (j < s.length) r[i++] = s.substring(j);
        return pkg.format(r.join(''), obj, ph);
    }
    return s;
};

function hex(v) {
    return (v < 16) ? "0" + v.toString(16) : v.toString(16);
}

pkg.Event = Class([
    function $prototype() {
        this.source = null;
    }
]);

/**
 * Sequential tasks runner. Allows developers to execute number of tasks (async and sync) in the
 * the order they have been called by runner:

        var r = new zebkit.util.Runner();

        r.run(function() {
            // call three asynchronous HTTP GET requests to read three files
            zebkit.io.GET("http://test.com/a.txt", this.join());
            zebkit.io.GET("http://test.com/b.txt", this.join());
            zebkit.io.GET("http://test.com/c.txt", this.join());
        })
        .
        run(function(r1, r2, r3) {
            // handle completely read on previous step files
            r1.responseText  // "a.txt" file content
            r2.responseText  // "b.txt" file content
            r3.responseText  // "c.txt" file content
        })
        .
        error(function(e) {
            // called when an exception has occurred
            ...
        });


 * @class zebkit.ui.Runner
 */
pkg.Runner = function() {
    this.$tasks      = [];
    this.$results    = [];
    this.$error      = null;
    this.$busy       = 0;

    this.run = function(body) {
        this.$tasks.push(function() {
            // clean results of execution of a previous task
            this.$results = [];
            this.$busy    = 0;

            if (this.$error == null) {
                var r = null;
                try {
                    r = body.apply(this, arguments);
                }
                catch(e) {
                    this.fireError(e);
                    return;
                }

                // this.$busy === 0 means we have called synchronous task
                if (this.$busy === 0 && this.$error == null) {
                    // check if the task returned result
                    if (typeof r !== "undefined") {
                        this.$results[0] = r;
                    }
                }
            }
            this.$schedule();
        });

        this.$schedule();
        return this;
    };

    this.fireError = function(e) {
        if (this.$error == null) {
            this.$busy    = 0;
            this.$error   = e;
            this.$results = [];
        }
        this.$schedule();
    };

    this.join = function() {
        var $this = this,
            index = this.$busy++;

        return function() {
            $this.$results[index] = [];

            // since error can occur and times variable
            // can be reset to 0 we have to check it
            if ($this.$busy > 0) {
                if (arguments.length > 0) {
                    for(var i = 0; i < arguments.length; i++) {
                        $this.$results[index][i] = arguments[i];
                    }
                }

                if (--$this.$busy === 0) {
                    // make result
                    if ($this.$results.length > 0) {
                        var r = [];
                        for(var i = 0; i < $this.$results.length; i++) {
                            Array.prototype.push.apply(r, $this.$results[i]);
                        }
                        $this.$results = r;
                    }
                    $this.$schedule();
                }
            }
        };
    };

    this.error = function(callback) {
        var $this = this;
        this.$tasks.push(function() {
            if ($this.$error != null) {
                try {
                    callback.call($this, $this.$error);
                }
                finally {
                    $this.$error = null;
                }
            }
            $this.$schedule();
        });
        this.$schedule();
        return this;
    };

    this.$schedule = function() {
        if (this.$tasks.length > 0 && this.$busy === 0) {
            this.$tasks.shift().apply(this, this.$results);
        }
    };
};

/**
 * Find by xpath-like path an element in a tree-like structure. The method is flexible way to look up
 * elements in tree structures. The only requirements the passed tree-like structure has to follow is
 * declaring a "kids" array field if the element has a children element. To understand if the given tree
 * element matches the current path fragment a special equality function has to be passed.

        var treeLikeRoot = {
            value : "Root",
            kids : [
                { value: "Item 1" },
                { value: "Item 2" }
            ]
        };

        zebkit.util.findInTree(treeLikeRoot,
                              "/Root/item1",
                              function(item, fragment) {
                                  return item.value == fragment;
                              },
                              function(foundElement) {
                                 ...
                                 // true means stop lookup
                                 return true;
                              });


 * @param  {Object} root a tree root element. If the element has a children element it has to
 * declare "kids" field. This field is an array of all children elements
 * @param  {String}   path a xpath-like path. The path has to satisfy number of requirements
 * and rules:

    - "/"" means lookup among all direct children elements
    - "//"" means lookup among all children elements recursively
    - "*" means any path value
    -[@attr=100] means number attribute
    -[@attr=true] means boolean attribute
    -[@attr='value'] means string attribute
    - Path has always starts from "/" or "//"
    - Path element always has to be defined: "*" or an symbolic name

 *
 * Path examples:

    - "//*" traverse all tree elements
    - "//*[@a=10]" traverse all tree elements that has an attribute "a" that equals 10
    - "/Root/Item" find an element by exact path

 * @param  {Function}  eq  an equality function. The function gets current evaluated tree element
 * and a path fragment against which the tree element has to be evaluated. It is expected the method
 * returns boolean value to say if the given passed tree element matches the path fragment.
 * @param  {Function} cb callback function that is called every time a new tree element
 * matches the given path fragment. The function has to return true if the tree look up
 * has to be stopped
 * @api  zebkit.util.findInTree()
 * @method findInTree
 */
pkg.findInTree = function(root, path, eq, cb) {
    var findRE = /(\/\/|\/)?([^\[\/]+)(\[\s*(\@[a-zA-Z_][a-zA-Z0-9_\.]*)\s*\=\s*([0-9]+|true|false|\'[^']*\')\s*\])?/g,
        m = null, res = [];

    function _find(root, ms, idx, cb) {
        function list_child(r, name, deep, cb) {
            if (r.kids != null) {
                for (var i = 0; i < r.kids.length; i++) {
                    var kid = r.kids[i];
                    if (name === '*' || eq(kid, name)) {
                        if (cb(kid)) return true;
                    }

                    if (deep && list_child(kid, name, deep, cb)) {
                        return true;
                    }
                }
            }
            return false;
        }

        if (ms == null || idx >= ms.length) return cb(root);

        var m = ms[idx];
        return list_child(root, m[2], m[1] === "//", function(child) {
            if (m[3] && child[m[4].substring(1)] != m[5]) return false;
            return _find(child, ms, idx + 1, cb);
        });
    }

    var c = 0;
    while (m = findRE.exec(path)) {
        if (m[1] == null || m[2] == null || m[2].trim().length === 0) {
            break;
        }

        c += m[0].length;

        if (m[3] && m[5][0] === "'") m[5] = m[5].substring(1, m[5].length - 1);
        res.push(m);
    }

    if (res.length === 0 || c < path.length) {
        throw new Error("Invalid path: '" + path + "'," + c);
    }

    _find({ kids:[root] }, res, 0, cb);
};

/**
 * RGB color class. This class represents rgb(a) color as JavaScript structure:

       // rgb color
       var rgb1 = new zebkit.util.rgb(100,200,100);

       // rgb with transparency
       var rgb2 = new zebkit.util.rgb(100,200,100, 0.6);

       // encoded as a string rgb color
       var rgb3 = new zebkit.util.rgb("rgb(100,100,200)");

       // hex rgb color
       var rgb3 = new zebkit.util.rgb("#CCDDFF");

 * @param  {Integer|String} r  red color intensity or if this is the only constructor parameter it denotes
 * encoded in string rgb color
 * @param  {Integer} [g]  green color intensity
 * @param  {Integer} [b] blue color intensity
 * @param  {Float}   [a] alpha color intensity
 * @constructor
 * @class zebkit.util.rgb
 */
pkg.rgb = function (r, g, b, a) {

    /**
     * Red color intensity
     * @attribute r
     * @type {Integer}
     * @readOnly
     */

    /**
     * Green color intensity
     * @attribute g
     * @type {Integer}
     * @readOnly
     */

    /**
     * Blue color intensity
     * @attribute b
     * @type {Integer}
     * @readOnly
     */

    /**
     * Alpha
     * @attribute a
     * @type {Float}
     * @readOnly
     */

    /**
     * Indicates if the color is opaque
     * @attribute isOpaque
     * @readOnly
     * @type {Boolean}
     */
    this.isOpaque = true;

    if (arguments.length == 1) {
        if (zebkit.isString(r)) {
            this.s = r;
            if (r[0] === '#') {
                r = parseInt(r.substring(1), 16);
            }
            else {
                if (r[0] === 'r' && r[1] === 'g' && r[2] === 'b') {
                    var i = r.indexOf('(', 3), p = r.substring(i + 1, r.indexOf(')', i + 1)).split(",");
                    this.r = parseInt(p[0].trim(), 10);
                    this.g = parseInt(p[1].trim(), 10);
                    this.b = parseInt(p[2].trim(), 10);
                    if (p.length > 3) {
                        this.a = parseInt(p[3].trim(), 10);
                        this.isOpaque = (this.a === 1);
                    }
                    return;
                }
            }
        }
        this.r =  r >> 16;
        this.g = (r >> 8) & 0xFF;
        this.b = (r & 0xFF);
    }
    else {
        this.r = r;
        this.g = g;
        this.b = b;
        if (arguments.length > 3) this.a = a;
    }

    if (this.s == null) {
        this.s = (typeof this.a !== "undefined") ? ['rgba(', this.r, ",", this.g, ",",
                                                             this.b, ",", this.a, ")"].join('')
                                                 : ['#', hex(this.r), hex(this.g), hex(this.b)].join('');
    }
};

var rgb = pkg.rgb;
rgb.prototype.toString = function() {
    return this.s;
};

rgb.black       = new rgb(0);
rgb.white       = new rgb(0xFFFFFF);
rgb.red         = new rgb(255,0,0);
rgb.blue        = new rgb(0,0,255);
rgb.green       = new rgb(0,255,0);
rgb.gray        = new rgb(128,128,128);
rgb.lightGray   = new rgb(211,211,211);
rgb.darkGray    = new rgb(169,169,169);
rgb.orange      = new rgb(255,165,0);
rgb.yellow      = new rgb(255,255,0);
rgb.pink        = new rgb(255,192,203);
rgb.cyan        = new rgb(0,255,255);
rgb.magenta     = new rgb(255,0,255);
rgb.darkBlue    = new rgb(0, 0, 140);
rgb.transparent = new rgb(0, 0, 0, 0.0);

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
 * @api zebkit.util.intersection();
 */
pkg.intersection = function(x1,y1,w1,h1,x2,y2,w2,h2,r){
    r.x = x1 > x2 ? x1 : x2;
    r.width = Math.min(x1 + w1, x2 + w2) - r.x;
    r.y = y1 > y2 ? y1 : y2;
    r.height = Math.min(y1 + h1, y2 + h2) - r.y;
};

pkg.isIntersect = function(x1,y1,w1,h1,x2,y2,w2,h2){
    return (Math.min(x1 + w1, x2 + w2) - (x1 > x2 ? x1 : x2)) > 0 &&
           (Math.min(y1 + h1, y2 + h2) - (y1 > y2 ? y1 : y2)) > 0;
};

pkg.unite = function(x1,y1,w1,h1,x2,y2,w2,h2,r){
    r.x = x1 < x2 ? x1 : x2;
    r.y = y1 < y2 ? y1 : y2;
    r.width  = Math.max(x1 + w1, x2 + w2) - r.x;
    r.height = Math.max(y1 + h1, y2 + h2) - r.y;
};

var letterRE = /[A-Za-z]/;
pkg.isLetter = function (ch) {
    if (ch.length != 1) throw new Error("Incorrect character");
    return letterRE.test(ch);
};

/**
 * This this META class is handy container to keep different types of listeners and
 * fire events to the listeners:

        // create listener container to keep three different events
        // handlers
        var MyListenerContainerClass = zebkit.util.ListenersClass("event1",
                                                                  "event2",
                                                                  "event3");

        // instantiate listener class container
        var listeners = new MyListenerContainerClass();

        // add "event1" listener
        listeners.add(function event1() {
            ...
        });

        // add "event2" listener
        listeners.add(function event2() {
           ...
        });

        // and firing event1 to registered handlers
        listeners.event1(...);

        // and firing event2 to registered handlers
        listeners.event2(...);

 * @class zebkit.util.Listeners
 * @constructor
 * @param {String} [events]* events types the container has to support
 */
var $NewListener = function() {
    var args = Array.prototype.slice.call(arguments);
    if (args.length === 0) {
       args = ["fired"];
    }

    var clazz = function() {};
    clazz.eventNames = args;
    clazz.ListenersClass = function() {
        var args = this.eventNames.slice(); // clone
        for(var i = 0; i < arguments.length; i++) args.push(arguments[i]);
        return $NewListener.apply(this, args);
    };

    if (args.length === 1) {
        var name = args[0];

        clazz.prototype.add = function() {
            if (this.v == null) this.v = [];

            var ctx = this,
                l   = arguments[arguments.length - 1]; // last arguments are handler(s)

            if (typeof l !== 'function') {
                ctx = l;
                l   = l[name];

                if (l == null || typeof l !== "function") {
                    return null;
                }
            }

            if (arguments.length > 1 && arguments[0] != name) {
                throw new Error("Unknown event type :" + name);
            }

            this.v.push(ctx, l);
            return l;
        };

        clazz.prototype.remove = function(l) {
            if (this.v != null) {
                if (arguments.length === 0) {
                    // remove all
                    this.v.length = 0;
                }
                else {
                    var i = 0;
                    while((i = this.v.indexOf(l)) >= 0) {
                        if (i % 2 > 0) i--;
                        this.v.splice(i, 2);
                    }
                }
            }
        };

        clazz.prototype[name] = function() {
            if (this.v != null) {
                for(var i = 0;i < this.v.length; i+=2) {
                    if (this.v[i + 1].apply(this.v[i], arguments) === true) {
                        return true;
                    }
                }
            }
            return false;
        };
    }
    else {
        var names = {};
        for(var i=0; i< args.length; i++) {
            names[args[i]] = true;
        }

        clazz.prototype.add = function(l) {
            if (this.methods == null) this.methods = {};

            var n = null;
            if (arguments.length > 1) {
                n = arguments[0];
                l = arguments[arguments.length - 1]; // last arguments are handler(s)
            }

            if (typeof l === 'function') {
                if (n == null) n = zebkit.$FN(l);
                if (n !== '' && names.hasOwnProperty(n) === false) {
                    throw new Error("Unknown event type " + n);
                }

                if (this.methods[n] == null) this.methods[n] = [];
                this.methods[n].push(this, l);
            }
            else {
                var b = false;
                for(var k in names) {
                    if (typeof l[k] === "function") {
                        b = true;
                        if (this.methods[k] == null) this.methods[k] = [];
                        this.methods[k].push(l, l[k]);
                    }
                }

                if (b === false) {
                    return null;
                }
            }
            return l;
        };

        clazz.prototype.addEvents = function() {
            for(var i = 0; i < arguments.length; i++) {
                var name = arguments[i];

                if (name == null || this[name] != null) {
                    throw new Error("" + name + " (event name)");
                }

                this[name] = (function(name) {
                    return function() {
                        if (this.methods != null) {
                            var c = this.methods[name];
                            if (c != null) {
                                for(var i = 0; i < c.length; i+=2) {
                                    if (c[i+1].apply(c[i], arguments) === true) {
                                        return true;
                                    }
                                }
                            }

                            c = this.methods[''];
                            if (c != null) {
                                for(var i = 0; i < c.length; i+=2) {
                                    if (c[i+1].apply(c[i], arguments) === true) {
                                        return true;
                                    }
                                }
                            }
                        }
                        return false;
                    };
                })(name);
            }
        };

        // populate methods that has to be called to send appropriate events to
        // registered listeners
        clazz.prototype.addEvents.apply(clazz.prototype, args);

        clazz.prototype.remove = function(l) {
            if (this.methods != null) {
                if (arguments.length === 0) {
                    for(var k in this.methods) {
                        if (this.methods.hasOwnProperty(k)) this.methods[k].length = 0;
                    }
                    this.methods = {};
                }
                else {
                    for (var k in this.methods) {
                        var v = this.methods[k], i = 0;
                        while ((i = v.indexOf(l)) >= 0) {
                            if (i%2 > 0) i--;
                            v.splice(i, 2);
                        }

                        if (v.length === 0) {
                            delete this.methods[k];
                        }
                    }
                }
            }
        };
    }

    return clazz;
};

pkg.Listeners = $NewListener();
pkg.ListenersClass = $NewListener;


/**
 * Useful class to track a virtual cursor position in a structure that has
 * dedicated number of lines where every line has a number of elements. The
 * structure metric has to be described by providing an instance of
 * zebkit.util.Position.Metric interface that discovers how many
 * lines the structure has and how many elements every line includes.
 * @param {zebkit.util.Position.Metric} m a position metric
 * @constructor
 * @class  zebkit.util.Position
 */

/**
 * Fire when a virtual cursor position has been updated

        position.bind(function(src, prevOffset, prevLine, prevCol) {
            ...
        });

 * @event posChanged
 * @param {zebkit.util.Position} src an object that triggers the event
 * @param {Integer} prevOffest a previous virtual cursor offset
 * @param {Integer} prevLine a previous virtual cursor line
 * @param {Integer} prevCol a previous virtual cursor column in the previous line
 */
var  Position = pkg.Position = Class([
    function $clazz() {
        this.Listeners = pkg.ListenersClass("posChanged"),

        /**
         * Position metric interface. This interface is designed for describing
         * a navigational structure that consists on number of lines where
         * every line consists of number of elements
         * @class zebkit.util.Position.Metric
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

        this.Metric = Interface();
    },

    function $prototype() {
        /**
         * Set the specified virtual cursor offsest
         * @param {Integer} o an offset, pass null to set position to indefinite state
         * @return {Integer} an offset that has been set
         * @method setOffset
         */
        this.setOffset = function(o){
            if (o < 0) o = 0;
            else {
                if (o === null) o = -1;
                else {
                    var max = this.metrics.getMaxOffset();
                    if (o >= max) o = max;
                }
            }

            if (o != this.offset){
                var prevOffset = this.offset,
                    prevLine   = this.currentLine,
                    prevCol    = this.currentCol,
                    p          = this.getPointByOffset(o);

                this.offset = o;
                if (p != null){
                    this.currentLine = p[0];
                    this.currentCol  = p[1];
                }
                else {
                    this.currentLine = this.currentCol = -1;
                }
                this.isValid = true;
                this._.posChanged(this, prevOffset, prevLine, prevCol);
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
         * Set the vurtual cursor line and the given column in the line
         * @param {Integer} r a line
         * @param {Integer} c a column in the line
         * @method setRowCol
         */
        this.setRowCol = function(r, c) {
            if (r != this.currentLine || c != this.currentCol){
                var prevOffset = this.offset,
                    prevLine = this.currentLine,
                    prevCol = this.currentCol;

                this.offset = this.getOffsetByPoint(r, c);
                this.currentLine = r;
                this.currentCol = c;
                this._.posChanged(this, prevOffset, prevLine, prevCol);
            }
        };

        this.inserted = function(off,size) {
            if (this.offset >= 0 && off <= this.offset){
                this.isValid = false;
                this.setOffset(this.offset + size);
            }
        };

        this.removed = function (off,size){
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
                var m = this.metrics, max = m.getMaxOffset();
                if (off > max) {
                    throw new Error("Out of bounds:" + off);
                }

                if (max === 0) return [(m.getLines() > 0 ? 0 : -1), 0];
                if (off === 0) return [0, 0];

                var d = 0, sl = 0, so = 0;
                if (this.isValid === true && this.offset != -1) {
                    sl = this.currentLine;
                    so = this.offset - this.currentCol;
                    if (off > this.offset) d = 1;
                    else {
                        if (off < this.offset) d = -1;
                        else return [sl, this.currentCol];
                    }
                }
                else {
                    d = (~~(max / off) === 0) ? -1 : 1;
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
            var startOffset = 0, startLine = 0, m = this.metrics;

            if (row >= m.getLines()) {
                throw new RangeError(row);
            }

            if (col >= m.getLineSize(row)) {
                throw new RangeError(col);
            }

            if (this.isValid === true && this.offset !=  -1) {
                startOffset = this.offset - this.currentCol;
                startLine = this.currentLine;
            }
            if (startLine <= row) {
                for(var i = startLine;i < row; i++) {
                    startOffset += m.getLineSize(i);
                }
            }
            else {
                for(var i = startLine - 1;i >= row; i--) {
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
            }
            else {
                if (arguments.length === 1) num = 1;

                var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol;
                switch(t) {
                    case "begin":
                        if (this.currentCol > 0){
                            this.offset -= this.currentCol;
                            this.currentCol = 0;
                        } break;
                    case "end":
                        var maxCol = this.metrics.getLineSize(this.currentLine);
                        if (this.currentCol < (maxCol - 1)){
                            this.offset += (maxCol - this.currentCol - 1);
                            this.currentCol = maxCol - 1;
                        } break;
                    case "up":
                        if (this.currentLine > 0) {
                            this.offset -= (this.currentCol + 1);
                            this.currentLine--;
                            for(var i = 0;this.currentLine > 0 && i < (num - 1); i++, this.currentLine--){
                                this.offset -= this.metrics.getLineSize(this.currentLine);
                            }
                            var maxCol = this.metrics.getLineSize(this.currentLine);
                            if (this.currentCol < maxCol) this.offset -= (maxCol - this.currentCol - 1);
                            else this.currentCol = maxCol - 1;
                        } break;
                    case "down":
                        if (this.currentLine < (this.metrics.getLines() - 1)) {
                            this.offset += (this.metrics.getLineSize(this.currentLine) - this.currentCol);
                            this.currentLine++;
                            var size = this.metrics.getLines() - 1;
                            for(var i = 0;this.currentLine < size && i < (num - 1); i++ ,this.currentLine++ ){
                                this.offset += this.metrics.getLineSize(this.currentLine);
                            }
                            var maxCol = this.metrics.getLineSize(this.currentLine);
                            if (this.currentCol < maxCol) this.offset += this.currentCol;
                            else {
                                this.currentCol = maxCol - 1;
                                this.offset += this.currentCol;
                            }
                        } break;
                    default: throw new Error("" + t);
                }

                this._.posChanged(this, prevOffset, prevLine, prevCol);
            }
        };

        this[''] = function(pi){
            this._ = new this.clazz.Listeners();
            this.isValid = false;

            /**
             * Current virtual cursor line position
             * @attribute currentLine
             * @type {Integer}
             * @readOnly
             */

            /**
             * Current virtual cursor column position
             * @attribute currentCol
             * @type {Integer}
             * @readOnly
             */

            /**
             * Current virtual cursor offset
             * @attribute offset
             * @type {Integer}
             * @readOnly
             */

            this.currentLine = this.currentCol = this.offset = 0;
            this.setMetric(pi);
        };

        /**
         * Set position metric. Metric describes how many lines
         * and elements in these line the virtual cursor can be navigated
         * @param {zebkit.util.Position.Metric} p a position metric
         * @method setMetric
         */
        this.setMetric = function (p){
            if (p == null) throw new Error("Null metric");
            if (p != this.metrics){
                this.metrics = p;
                this.setOffset(null);
            }
        };
    }
]);

pkg.SingleColPosition = Class(pkg.Position, [
    function $prototype() {
        this.setRowCol = function(r,c) {
            this.setOffset(r);
        };

        this.setOffset = function(o){
            if (o < 0) o = 0;
            else {
                if (o == null) o = -1;
                else {
                    var max = this.metrics.getMaxOffset();
                    if (o >= max) o = max;
                }
            }

            if (o != this.offset) {
                var prevOffset = this.offset,
                    prevLine   = this.currentLine,
                    prevCol    = this.currentCol;

                this.currentLine = this.offset = o;
                this.isValid = true;
                this._.posChanged(this, prevOffset, prevLine, prevCol);
            }

            return o;
        };

        this.seekLineTo = function(t, num){
            if (this.offset < 0){
                this.setOffset(0);
            }
            else {
                if (arguments.length === 1) num = 1;
                switch(t) {
                    case "begin":
                    case "end": break;
                    case "up":
                        if (this.offset > 0) {
                            this.setOffset(this.offset - n);
                        } break;
                    case "down":
                        if (this.offset < (this.metrics.getLines() - 1)){
                            this.setOffset(this.offset + n);
                        } break;
                    default: throw new Error("" + t);
                }
            }
        };
    }
]);

(function() {
    var quantum = 40, tasks = Array(5), count = 0, pid = -1;

    function dispatcher() {
        var c = 0;
        for(var i = 0; i < tasks.length; i++) {
            var t = tasks[i];

            if (t.isStarted === true) {
                c++;
                if (t.si <= 0) {
                    try {
                        if (t.ctx == null) t.task(t);
                        else               t.task.call(t.ctx, t);
                    }
                    catch(e) {
                        console.log(e.stack ? e.stack : e);
                    }

                    t.si += t.ri;
                }
                else {
                    t.si -= quantum;
                }
            }
        }

        if (c === 0 && pid >= 0) {
            window.clearInterval(pid);
            pid = -1;
        }
    }

    /**
     * Task is keeps a context of and allows developers
     * to run, shutdown, pause a required method as a task
     * Developer cannot instantiate the class directly.
     * Use "zebkit.util.task(...)" method to do it:

        var t = zebkit.util.task(function(context) {
            // task body
            ...
        });

        // run task in 1 second and repeat the task execution
        // every half second
        t.run(1000, 500);
        ...

        t.shutdown(); // stop the task

     * @class zebkit.util.TaskCotext
     */
    function Task() {
        this.ctx = this.task = null;
        this.ri  = this.si  = 0;

        /**
         * Indicates if the task is executed (active)
         * @type {Boolean}
         * @attribute isStarted
         * @readOnly
         */
        this.isStarted = false;
    }

    pkg.TaskCotext = Task;

    /**
     * Shutdown the given task.
     * @method shutdown
     */
    Task.prototype.shutdown = function() {
        if (this.task != null) {
            count--;
            this.ctx = this.task = null;
            this.isStarted = false;
            this.ri = this.si = 0;
        }

        if (count === 0 && pid  >= 0) {
            window.clearInterval(pid);
            pid = -1;
        }
    };

    /**
     * Run the task
     * @param {Integer} [startIn] a time (in milliseconds) in which the task has to be started
     * @param {Integer} [repeatIn] a period (in milliseconds) the task has to be executed
     * @method run
     */
    Task.prototype.run = function(startIn, repeatIn) {
        if (this.task == null) {
            throw new Error("Task body has not been defined");
        }

        if (arguments.length > 0) this.si = startIn;
        if (arguments.length > 1) this.ri = repeatIn;
        if (this.ri <= 0) this.ri = 150;

        this.isStarted = true;

        if (count > 0 && pid < 0) {
            pid = window.setInterval(dispatcher, quantum);
        }

        return this;
    };

    /**
     * Pause the given task.
     * @method pause
     */
    Task.prototype.pause = function(t) {
        if (this.task == null) {
            throw new Error("Stopped task cannot be paused");
        }

        if (arguments.length === 0) {
            this.isStarted = false;
        }
        else {
            this.si = t;
        }
    };

    // pre-fill tasks pool
    for(var i = 0; i < tasks.length; i++) {
        tasks[i] = new Task();
    }

    /**
     * Take a free task from pool and run it with the specified
     * body and the given context.

        // allocate task
        var task = zebkit.util.task(function (ctx) {
            // do something

            // complete task if necessary
            ctx.shutdown();
        });

        // run task in second and re-run it every 2 seconds
        task.run(1000, 2000);

        ...

        // pause the task
        task.pause();

        ...
        // run it again
        task.run();

     * @param  {Function|Object} f a function that has to be executed
     * @param  {Object} [ctx]  a context the task has to be executed
     * @return {zebkit.util.Task} an allocated task
     * @method task
     * @api zebkit.util.task
     */
    pkg.task = function(f, ctx){
        if (typeof f != "function") {
            ctx = f;
            f = f.run;
        }

        if (f == null) {
            throw new Error("" + f);
        }

        // find free and return free task
        for(var i=0; i < tasks.length; i++) {
            var j = (i + count) % tasks.length, t = tasks[j];
            if (t.task == null) {
                t.task = f;
                t.ctx  = ctx;
                count++;
                return t;
            }
        }

        throw new Error("Out of tasks limit");
    };

    /**
     * Shut down all active at the given moment tasks
     * body and the given context.
     * @method shutdownAll
     * @api zebkit.util.shutdownAll
     */
    pkg.shutdownAll = function() {
        for(var i=0; i < tasks.length; i++) {
            tasks[i].shutdown();
        }
    };
})();


/**
 * JSON configuration objects loader class. The class is
 * handy way to keep and load configuration encoded in JSON
 * format. Except standard JSON types the class uses number
 * of JSON values and key interpretations such as:

    - **"@key_of_refernced_value"** String values that start from "@" character are considered
      as a reference to other values
    - **{ "$class_name":[ arg1, arg2, ...], "prop1": ...}** Key names that starts from "$" character
      are considered as name of class that has to be instantiated as the value
    - **{"?isToucable": { "label": true } }** Key names that start from "?" are considered as
      conditional section.

 * Also the class support section inheritance. That means
 * you can say to include part of JSON to another part of JSON.
 * For instance, imagine JSON describes properties for number
 * of UI components where an UI component can inherits another
 * one.

        {
           // base component
           "BaseComponent": {
               "background": "red",
               "border": "plain",
               "size": [300, 300]
           },

            // component that inherits properties from BaseComponent,
            // but override background property with own value
           "ExtenderComp": {
               "inherit": [ "BaseComponent" ],
               "background": "green"
           }
        }

 *
 * The loading of JSON can be multi steps procedure where
 * you can load few JSON. That means you can compose the
 * final configuration from number of JSON files:

        // prepare object that will keep loaded data
        var loadedData = {};

        // create bag
        var bag = zebkit.util.Bag(loadedData);

        // load the bag with two JSON
        bag.load("{ ... }", false).load("{  ...  }");


 * @class zebkit.util.Bag
 * @constructor
 * @param {Object} [obj] a root object to be loaded with
 * the given JSON configuration
 */
pkg.Bag = zebkit.Class([
    function $prototype() {
        /**
         * The property says if the object introspection is required to try find a setter
         * method for the given key. For instance if an object is loaded with the
         * following JSON:

         {
            "color": "red"
         }

         * the introspection will cause bag class to try finding "setColor(c)" method in
         * the loaded with the JSON object and call it to set "red" property value.
         * @attribute usePropertySetters
         * @default true
         * @type {Boolean}
         */
        this.usePropertySetters = true;

        this.ignoreNonExistentKeys = false;

        this.globalPropertyLookup = false;

        /**
         * Get a property value. The property name can point to embedded fields:
         *
         *      var bag = new Bag().load("my.json");
         *      bag.get("a.b.c");
         *
         * Also the special property type is considered - factory. Access to such property
         * causes a new instance of a class object will be created. Property is considered
         * as a factory property if it declares a "$new" field. The filed should point to
         * a method that will be called to instantiate the property value.
         *
         * @param  {String} key a property key.
         * @return {Object} a property value
         * @throws Error if property cannot be found and "ignoreNonExistentKeys" is true
         * @method  get
         */
        this.get = function(key) {
            if (key == null) {
                throw new Error("Null key");
            }

            var v = this.$get(key.split('.'), this.root);
            if (this.ignoreNonExistentKeys !== true && v === undefined) {
                throw new Error("Property '" + key + "' not found");
            }

            return v;
        };

        this.$get = function(keys, root) {
            var v = root;
            for(var i = 0; i < keys.length; i++) {
                v = v[keys[i]];
                if (typeof v === "undefined") {
                    return undefined;
                }
            }
            return v != null && v.$new ? v.$new() : v;
        };

        this.$isAtomic = function(v) {
            return zebkit.isString(v) || zebkit.isNumber(v) || zebkit.isBoolean(v);
        };

        this.callMethod = function(name, args) {
            var vs  = [ this, this.root],
                m   = null,
                ctx = null;

            // lookup method
            for(var i = 0; i < vs.length; i++) {
                if (vs[i] != null && vs[i][name] != null && typeof vs[i][name] == 'function') {
                    ctx = vs[i];
                    m   = vs[i][name];
                    break;
                }
            }

            if (m == null || typeof m != 'function') {
                throw new Error("Method '" + name + "' cannot be found");
            }

            return m.apply(ctx, Array.isArray(args) ? args : [ args ]);
        };

        this.buildValue = function(d) {
            if (d == null || zebkit.isNumber(d) || zebkit.isBoolean(d)) {
                return d;
            }

            if (Array.isArray(d)) {
                for(var i = 0; i < d.length; i++) d[i] = this.buildValue(d[i]);
                return d;
            }

            if (zebkit.isString(d)) {
                if (d[0] === '@') {
                    if (d[1] === "(" && d[d.length-1] === ")") {
                        // if the referenced path is not absolute path and the bag has been also
                        // loaded by an URL than build the full URL as a relative path from
                        // BAG URL
                        var path = d.substring(2, d.length-1).trim();
                        if (this.url != null && zebkit.URL.isAbsolute(path) === false) {
                            var pURL = new zebkit.URL(this.url).getParentURL();
                            if (pURL != null) {
                                path = pURL.join(path);
                            }
                        }
                        return this.buildValue(JSON.parse(zebkit.io.GET(path)));
                    }
                    return this.resolveVar(d.substring(1).trim());
                }
                return d;
            }

            // save inheritance
            var inc = d.inherit;
            if (inc != null) {
                delete d.inherit;
            }

            // test whether we have a class definition
            for (var k in d) {
                // handle class definition
                if (k[0] === '$' && d.hasOwnProperty(k) === true) {
                    var classname = k.substring(1).trim(),
                        args      = d[k],
                        clz       = null;

                    delete d[k]; // delete class name

                    if (classname[0] === "?") {
                        classname = classname.substring(1).trim();
                        try {
                            clz = this.resolveClass(classname[0] === '*' ? classname.substring(1).trim() : classname);
                        }
                        catch (e) {
                            return null;
                        }
                    }
                    else {
                        clz = this.resolveClass(classname[0] === '*' ? classname.substring(1).trim() : classname);
                    }

                    args = this.buildValue(Array.isArray(args) ? args : [ args ]);
                    if (classname[0] === "*") {
                        return (function(clazz, args) {
                            return {
                                $new : function() {
                                    return zebkit.newInstance(clazz, args);
                                }
                            };
                        })(clz, args);
                    }

                    // apply properties to instantiated class
                    var classInstance = zebkit.newInstance(clz, args);
                    this.populate(classInstance, d);
                    return classInstance;
                }

                //!!!!  trust the name of class occurs first what in general
                //      cannot be guaranteed by JSON spec but we can trust
                //      since many other third party applications stands
                //      on it too :)
                break;
            }

            for (var k in d) {
                if (d.hasOwnProperty(k)) {
                    var v = d[k];

                    // special field name that says to call method to create a
                    // value by the given description
                    if (k[0] === ".") {
                        var mres = this.callMethod(k.substring(1).trim(), this.buildValue(v));
                        delete d[k];
                        if (typeof mres !== 'undefined') {
                            return mres;
                        }
                    }
                    else {
                        d[k] = this.buildValue(d[k]);
                    }
                }
            }

            if (inc != null) {
                this.inherit(d, inc);
            }

            return d;
        };

        this.populate = function(obj, desc) {
            var inc = desc.inherit;
            if (inc != null) {
                delete desc.inherit;
            }

            for(var k in desc) {
                if (desc.hasOwnProperty(k) === true) {
                    var v = desc[k];
                    if (k[0] === '.') {
                        this.callMethod(k.substring(1).trim(), this.buildValue(v));
                        continue;
                    }

                    if (this.usePropertySetters === true) {
                        var m  = zebkit.getPropertySetter(obj, k);
                        if (m != null) {
                            if (Array.isArray(v)) m.apply(obj, this.buildValue(v));
                            else                  m.call (obj, this.buildValue(v));
                            continue;
                        }
                    }

                    // if target object doesn't have a property defined or
                    // the destination value is atomic or array than
                    // set it directly
                    var ov = obj[k];
                    if (ov == null || this.$isAtomic(ov) || Array.isArray(ov) ||
                        v == null  || this.$isAtomic(v)  || Array.isArray(v)  ||
                        this.$isClassDefinition(k, v)                               )
                    {

                        obj[k] = this.buildValue(v);
                    }
                    else {
                        obj[k] = this.populate(obj[k], v);
                    }
                }
            }

            if (inc != null) {
                this.inherit(obj, inc);
            }

            return obj;
        };

        this.$isClassDefinition = function(kk, v) {
            if (v != null && v.constructor === Object) {
                for(var k in v) {
                    if (k[0] === '$') {
                        return true;
                    }
                    break;
                }
            }
            return false;
        };

        /**
         * Called every time the given class name has to be transformed into
         * the class object (constructor) reference.
         * @param  {String} className a class name
         * @return {Function}   a class reference
         * @method resolveClass
         */
        this.resolveClass = function (className) {
            return this.classAliases.hasOwnProperty(className) ? this.classAliases[className]
                                                               : zebkit.Class.forName(className);
        };

        this.addClassAliases = function (aliases) {
            for(var k in aliases) {
                this.classAliases[k] = Class.forName(aliases[k].trim());
            }
        };

        this.addVariables = function(variables) {
            for(var k in variables) {
                this.variables[k] = variables[k];
            }
        };

        this.inherit = function(o, inc) {
            if (Array.isArray(inc) === false) inc = [ inc ];
            for (var i = 0; i < inc.length; i++) {
                var v = this.resolveVar(inc[i]);

                if (typeof v === 'undefined') {
                    throw new Error("Reference '" + inc[i] + "' not found");
                }

                if (v == null || this.$isAtomic(v) || Array.isArray(v)) {
                    throw new Error("Invalid type of inheritance '" + inc[i] + "'");
                }

                for(var kk in v) {
                    if (kk[0] !== '$' && v.hasOwnProperty(kk) === true && o.hasOwnProperty(kk) === false) {
                        o[kk] = v[kk];
                    }
                }
            }
        };

        /**
         * Load the given JSON content and parse if the given flag is true. The passed
         * boolean flag controls parsing. The flag is used to load few JSON. Before
         * parsing the JSONs are merged and than the final result is parsed.
         * @param  {String|Object} s a JSON content to be loaded. It can be a JSON as string or
         * URL to JSON or JSON object
         * @param {Function} [cb] callback function if the JSOn content has to be loaded asynchronously
         * @chainable
         * @return {zebkit.util.Bag} a reference to the bag class instance
         * @method load
         */
        this.load = function(s, cb) {
            var runner = new pkg.Runner(),
                $this  = this;

            runner.run(function() {
                if (zebkit.isString(s)) {
                    s = s.trim();

                    // detect if the passed string is not a JSON
                    if ((s[0] !== '[' || s[s.length - 1] !== ']') &&
                        (s[0] !== '{' || s[s.length - 1] !== '}')   )
                    {
                        var p = s.toString();
                        p = p + (p.lastIndexOf("?") > 0 ? "&" : "?") + (new Date()).getTime().toString();

                        $this.url = s.toString();

                        if (cb == null) {
                            return zebkit.io.GET(p);
                        }

                        var join = this.join();
                        zebkit.io.GET(p, function(r) {
                            if (r.status != 200) {
                                runner.fireError(new Error("Invalid JSON path"));
                            }
                            else {
                                join.call($this, r.responseText);
                            }
                        });

                        return;
                    }
                }
                return s;
            })
            . // parse JSON if necessary
            run(function(s) {
                if (zebkit.isString(s)) {
                    try {
                        return JSON.parse(s);
                    }
                    catch(e) {
                        throw new Error("JSON format error");
                    }
                }
                return s;
            })
            . // populate JSON content
            run(function(content) {
                $this.content = content;
                $this.root = ($this.root == null ? $this.buildValue(content) : $this.populate($this.root, content));
                if (cb != null) cb.call($this);
            })
            .
            error(function(e) {
                if (cb != null) cb.call($this, e);
                throw e;
            });

            return this;
        };

        this.resolveVar = function(name) {
            if (this.variables.hasOwnProperty(name)) {
                return this.variables[name];
            }

            var k = name.split("."),
                v = undefined;

            if (this.root != null) {
                v = this.$get(k, this.root);
            }

            if (typeof v === 'undefined') {
                v = this.$get(k, this.content);
            }

            if (typeof v === 'undefined' && this.globalPropertyLookup === true) {
                v = this.$get(k, zebkit.$global);
            }

            if (typeof v === 'undefined') {
                throw new Error("Invalid reference '" +  name + "'");
            }

            return v;
        };

        this.expr = function(e) {
            eval("var r="+e);
            return r;
        };

        this[''] = function (root) {
            /**
             * Environment variables that can be referred from loaded content
             * @attribute variables
             * @type {Object}
             */
            this.variables = {};

            /**
             * Object that keeps loaded and resolved content
             * @readonly
             * @attribute root
             * @type {Object}
             * @default {}
             */
            this.root = (root != null ? root : null);

            /**
             * Map of classes
             * @attribute classAliases
             * @protected
             * @type {Object}
             * @default {}
             */
            this.classAliases = {};
        };
    }
]);

/**
 * @for
 */

})(zebkit("util"), zebkit.Class, zebkit.Interface);
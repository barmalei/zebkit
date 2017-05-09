zebkit.package("util", function(pkg, Class) {
    /**
     * Number of different utilities methods and classes. The package has alternative to JS promise approach
     * that helps to make your code more linear looking nevertheless it can contain asynchronous calling.
     * One more useful class is zebkit JSON bag that allows developer to describe number of objects
     * and its properties value in JSON format.
     * @class zebkit.util
     * @access package
     */

    /**
     * Validate the specified value to be equal one of the given values
     * @param  {value} value a value to be validated
     * @param  {Object} [value]* a number of valid values to test against
     * @throws Error if the value doesn't match any valid value
     * @for  zebkit.util
     * @method  $validateValue
     * @example
     *      // test if the alignment is equal one of the possible values
     *      // throws error otherwise
     *      zebkit.util.$validateValue(alignment, "top", "left", "right", "bottom");
     * @protected
     */
    pkg.$validateValue = function(value) {
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

    pkg.format = function(s, obj, ph) {
        if (arguments.length < 3) ph = '';

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

            if (typeof m[1] !== 'undefined') {
                var ml  = parseInt(m[1].substring(0, m[1].length - 1).trim()),
                    ph2 = typeof m[2] !== 'undefined' ? m[2].substring(0, m[2].length - 1) : ph;

                if (v === null || typeof v === 'undefined') {
                    ph2 = ph;
                    v = "";
                } else {
                    v = "" + v;
                }

                for(var k = v.length; k < ml; k++) {
                    v = ph2 + v;
                }
            }

            if (v === null || typeof v === 'undefined') v = ph;

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

    pkg.image = function(ph, fireErr) {
        if (arguments.length < 2) {
            fireErr = false;
        }

        var d  = new zebkit.DoIt(),
            jn = d.join();

        zebkit.environment.loadImage(ph,
            function(img) {
                jn(img);
            },
            function(img, e) {
                if (fireErr === true) {
                    d.error(e);
                } else {
                    jn(img);
                }
            }
        );

        return d;
    };

    /**
     * Abstract event class.
     * @class zebkit.util.Event
     * @constructor
     */
    pkg.Event = Class([
        function $prototype() {
            /**
             * Source of an event
             * @attribute source
             * @type {Object}
             * @default null
             * @readOnly
             */
            this.source = null;
        }
    ]);

    /**
     *  Finds an item by xpath-like simplified expression applied to a tree-like structure. Passed tree-like structure
     *  doesn't have a special requirements except items of the structure have to define its kids by exposing "kids"
     *  field. The field is array of children elements:

            var treeLikeRoot = {
                value : "Root",
                kids : [
                    { value: "Item 1" },
                    { value: "Item 2" }
                ]
            };

            zebkit.util.findInTree(treeLikeRoot,
                                  "/item1",
                                  function(foundElement) {
                                     ...
                                     // true means stop lookup
                                     return true;
                                  },
                                  function(item, fragment) {
                                      return item.value === fragment;
                                  });


     * The find method traverse the tree-like structure according to the xpath-like expression. To understand if
     * the given tree item confronts with the currently traversing path fragment a special equality method has
     * to be passed. The method gets the traversing tree item, a string path fragment and has to decide if the
     * given tree item complies the specified path fragment.
     *
     * @param  {Object} root a tree root element. If the element has a children elements the children have to
     * be stored in  "kids" field as an array.
     * @param  {String}  path a path-like expression. The path has to satisfy number of requirements:

        - has to start from "." or "/" or "//" characters
        - has to define path part after "/" or "//"
        - path part can be either "*" or a name
        - optionally an attribute and its can be defined as "[@<attr_name>=<attr_value>]"
        - attribute value is optional and can be boolean (true or false), integer, null or string value
        - string attribute value has to be wrapped with single quote

     *
     * For examples:

        - "//*" traverse all tree elements
        - "//*[@a=10]" traverse all tree elements that has an attribute "a" that equals 10
        - "//*[@a]" traverse all tree elements that has an attribute "a" defined
        - "/Item1/Item2" find an element by exact path
        - ".//" traverse all tree elements including the root element (element traversing has started)

     * @param  {Function} cb callback function that is called every time a new tree element
     * matches the given path fragment. The function has to return true if the tree look up
     * has to be interrupted
     * @param  {Function}  eq  an equality function. The function gets current evaluated tree element
     * and a path fragment against which the tree element has to be evaluated. It is expected the method
     * returns boolean value to say if the given passed tree element matches the path fragment.
     * @method findInTree
     * @for  zebkit.util
     */

    var PATH_RE = /^[.]?(\/[\/]?)([^\[\/]+)\s*(\[\s*\@([a-zA-Z_][a-zA-Z0-9_\.]*)\s*(\=\s*[0-9]+|\=\s*true|\=\s*false|\=\s*null|\=\s*\'[^']*\')?\s*\])?/;
    pkg.findInTree = function(root, path, cb, eq, m) {
        if (root === null || typeof root === 'undefined') {
            throw new Error("Null tree root");
        }

        // if the method called first time
        if (arguments.length < 5) {
            path = path.trim();
            if (path[0] === '#') {
                path = "//*[@id='" + path.substring(1).trim() + "']";
            } else if (path === '.') {
                return cb(root);
            } else if (path[0] === '.' && path[1] === '/') { // means we have to include root in search
                root = { kids: [ root ] };
                path = path.substring(1);
            }
            m = null;
        }

        if (eq === null || arguments.length < 4) {
            eq = function(n, fragment) { return n.value === fragment; };
        }

        if (typeof root.kids !== 'undefined' &&   // a node has children
            root.kids        !== null        &&
            root.kids.length > 0                )
        {
            //
            // m == null                      : means this is the first call of the method
            // m[0].length !== m.input.length : means this is terminal part of the path
            //
            if (m === null ||  m[0].length !== m.input.length) {
                m = path.match(PATH_RE);

                if (m === null) {
                    throw new Error("Cannot resolve path '" + path + "'");
                }

                // check if the matched path is not terminal
                if (m[0].length !== path.length) {
                    path = path.substring(m[0].length);  // cut found fragment from the path
                }

                // normalize attribute value
                if (typeof m[3] !== 'undefined' && typeof m[5] !== 'undefined') {
                    m[5] = m[5].substring(1).trim();

                    if (m[5][0] === "'") {
                        m[5] = m[5].substring(1, m[5].length - 1);
                    } else if (m[5] === "true") {
                        m[5] = true;
                    } else if (m[5] === "false") {
                        m[5] = false;
                    } else if (m[5] === "null") {
                        m[5] = null;
                    } else {
                        var vv = parseInt(m[5], 10);
                        if (isNaN(vv) === false) m[5] = vv;
                    }
                }
            }

            var isTerminal = m[0].length === m.input.length,
                pathDelim  = m[1],
                pathValue  = m[2];

            for (var i = 0; i < root.kids.length ; i++) {
                var kid     = root.kids[i],
                    isMatch = false;
                                            // XOR
                if (pathValue === "*" || (eq(kid, pathValue) ? pathValue[0] !== '!' : pathValue[0] === '!')) {
                    if (typeof m[3] !== 'undefined') { // has attributes
                        var attrName = m[4].trim();

                        // leave if attribute doesn't match
                        if (typeof kid[attrName] !== 'undefined' && (typeof m[5] === 'undefined' || kid[attrName] === m[5])) {
                            isMatch = true;
                        }
                    } else {
                        isMatch = true;
                    }
                }

                // if the kid match the path fragment and this is a terminal node
                // let callback know we found a node
                if (isMatch === true && isTerminal === true && cb(kid) === true) {
                    return true;
                }

                // if path delimiter indicates it is recursive children search or
                // we matched not a terminal node let dig deeper in tree
                if ((isMatch === true && isTerminal === false) || pathDelim === "//") {
                    if (pkg.findInTree(kid, path, cb, eq, m) === true) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    /**
     * Provide path search functionality
     *
     * @interface zebkit.util.PathSearch
     */
    pkg.PathSearch = zebkit.Interface([
        function $prototype() {
            /**
             * Find all a first children component that satisfies the passed path expression.
             * @param  {String} path path expression. Path expression is simplified form
             * of XPath-like expression:
             *
             *   - **"/zebkit.ui.Panel"**  - find the first child item that has class name equals "zebkit.ui.Panel"
             *   - **"/zebkit.ui.Panel[@id='top']"** - find the first child item that has class name equals "zebkit.ui.Panel" and "id" property equals "top"
             *   - **"//zebkit.ui.Panel"**  - find recursively the first child item that has class name equals "zebkit.ui.Panel"
             *   - **"//~zebkit.ui.Panel"**  - find recursively the first child item that is an instance of "zebkit.ui.Panel" class
             *
             * Shortcuts:
             *
             *   - **"#id"** - find an item by its "id" attribute value. This is equivalent of "//*[@id='a component id property']" path
             *
             * @param {Function} [cb] function that is called every time a new children component has been found.
             * @method find
             * @return {zebkit.layout.Layoutable} found children component or null if
             * no children component can be found
             */
            this.byPath = function(path, cb) {
                if (typeof this.$normalizePath !== 'undefined') {
                    path = this.$normalizePath(path);
                }

                if (arguments.length === 2) {
                    if (arguments[1] === null) {
                        var r = [];
                        pkg.findInTree(this, path, function(n) {
                            r.push(n);
                            return false;
                        }, typeof this.$matchPath !== 'undefined' ? this.$matchPath
                                                                  : null);
                        return r;
                    } else {
                        pkg.findInTree(this, path, cb, typeof this.$matchPath !== 'undefined' ? this.$matchPath
                                                                                              : null);
                    }
                } else {
                    var res = null;
                    pkg.findInTree(this, path, function(n) {
                        res = n;
                        return true;
                    }, typeof this.$matchPath !== 'undefined' ? this.$matchPath : null);
                    return res;
                }
            };
        }
    ]);

    /**
     * RGB color class. This class represents a rgb color as JavaScript structure:

           // rgb color
           var rgb1 = new zebkit.util.rgb(100,200,100);

           // rgb with transparency
           var rgb2 = new zebkit.util.rgb(100,200,100, 0.6);

           // encoded as a string rgb color
           var rgb3 = new zebkit.util.rgb("rgb(100,100,200)");

           // hex rgb color
           var rgb3 = new zebkit.util.rgb("#CCDDFF");

     * @param  {Integer|String} r  the meaning of the argument depends on number of arguments the
     * constructor gets:
     *
     *   - If constructor gets only this argument the argument is considered as encoded rgb color:
     *      - **String**  means its hex encoded ("#CCFFDD") or rgb ("rgb(100,10,122)", "rgba(100,33,33,0.6)") encoded color
     *      - **Integer** means this is number encoded rgb color
     *   - Otherwise the argument is an integer value that depicts a red intensity of rgb color
     *
     * encoded in string rgb color
     * @param  {Integer} [g]  green color intensity
     * @param  {Integer} [b] blue color intensity
     * @param  {Float}   [a] alpha color intensity
     * @constructor
     * @class zebkit.util.rgb
     */
    pkg.rgb = Class([
        function (r, g, b, a) {
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
            if (arguments.length === 1) {
                if (zebkit.isString(r)) {
                    this.s = r;
                    if (r[0] === '#') {
                        r = parseInt(r.substring(1), 16);
                    } else {
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
            } else {
                this.r = r;
                this.g = g;
                this.b = b;
                if (arguments.length > 3) this.a = a;
            }

            if (this.s === null) {
                this.s = (typeof this.a !== "undefined") ? 'rgba(' + this.r + "," + this.g +  "," +
                                                                     this.b + "," + this.a + ")"
                                                         : '#' +
                                                           ((this.r < 16) ? "0" + this.r.toString(16) : this.r.toString(16)) +
                                                           ((this.g < 16) ? "0" + this.g.toString(16) : this.g.toString(16)) +
                                                           ((this.b < 16) ? "0" + this.b.toString(16) : this.b.toString(16));
            }
        },

        function $prototype() {
            this.s = null;

            /**
             * Indicates if the color is opaque
             * @attribute isOpaque
             * @readOnly
             * @type {Boolean}
             */
            this.isOpaque = true;

            this.toString = function() {
                return this.s;
            };
        },

        function $clazz() {
            /**
             * Black color constant
             * @attribute black
             * @type {zebkit.util.rgb}
             * @static
             */

            this.black       = new this(0);
            this.white       = new this(0xFFFFFF);
            this.red         = new this(255,0,0);
            this.blue        = new this(0,0,255);
            this.green       = new this(0,255,0);
            this.gray        = new this(128,128,128);
            this.lightGray   = new this(211,211,211);
            this.darkGray    = new this(169,169,169);
            this.orange      = new this(255,165,0);
            this.yellow      = new this(255,255,0);
            this.pink        = new this(255,192,203);
            this.cyan        = new this(0,255,255);
            this.magenta     = new this(255,0,255);
            this.darkBlue    = new this(0, 0, 140);
            this.transparent = new this(0, 0, 0, 0.0);

            this.mergeable = false;
        }
    ]);

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
        if (ch.length !== 1) throw new Error("Incorrect character");
        return letterRE.test(ch);
    };

    /**
     * This method allows to declare a listeners container class for the given
     * dedicated event types.

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

            // add listener for both event1 and event2 events
            listeners.add(function() {
               ...
            });

            // and firing event1 to registered handlers
            listeners.event1(...);

            // and firing event2 to registered handlers
            listeners.event2(...);

     * @for zebkit.util
     * @method ListenersClass
     * @param {String} [events]* events types the listeners container has to support
     * @return {zebkit.util.Listener} a listener container class
     */
    var $NewListener = function() {
        var clazz = function() {};
        clazz.eventNames = arguments.length === 0 ? [ "fired" ]
                                                  : Array.prototype.slice.call(arguments);

        clazz.ListenersClass = function() {
            var args = this.eventNames.slice(); // clone
            for(var i = 0; i < arguments.length; i++) args.push(arguments[i]);
            return $NewListener.apply(this, args);
        };

        if (clazz.eventNames.length === 1) {
            var $ename = clazz.eventNames[0];

            clazz.prototype.v = null;

            clazz.prototype.add = function() {
                var ctx = this,
                    l   = arguments[arguments.length - 1]; // last arguments are handler(s)

                if (typeof l !== 'function') {
                    ctx = l;
                    l   = l[$ename];

                    if (typeof l !== "function") {
                        return null;
                    }
                }

                if (arguments.length > 1 && arguments[0] !== $ename) {
                    throw new Error("Unknown event type :" + $ename);
                }

                if (this.v === null) {
                    this.v = [];
                }

                this.v.push(ctx, l);
                return l;
            };

            clazz.prototype.remove = function(l) {
                if (this.v !== null) {
                    if (arguments.length === 0) {
                        // remove all
                        this.v.length = 0;
                    } else {
                        var name = arguments.length > 1 || zebkit.isString(arguments[0]) ? arguments[0]
                                                                                         : null,
                            fn   = arguments.length > 1 ? arguments[1]
                                                        : (name === null ? arguments[0] : null),
                            i    = 0;

                        if (name !== null && name !== $ename) {
                            throw new Error("Unknown event type :" + name);
                        }

                        if (fn === null) {
                            this.v.length = 0;
                        } else {
                            while ((i = this.v.indexOf(fn)) >= 0) {
                                if (i % 2 > 0) i--;
                                this.v.splice(i, 2);
                            }
                        }
                    }
                }
            };

            clazz.prototype.hasHandler = function(l) {
                if (zebkit.isString(l)) {
                    return this.v !== null && l === $ename && this.v.length > 0;
                } else {
                    return this.v.length > 0 && this.v.indexOf(l) >= 0;
                }
            };

            clazz.prototype[$ename] = function() {
                if (this.v !== null) {
                    for(var i = 0; i < this.v.length; i +=2 ) {
                        if (this.v[i + 1].apply(this.v[i], arguments) === true) {
                            return true;
                        }
                    }
                }
                return false;
            };

            clazz.prototype.hasEvent = function(nm) {
                return nm === $ename;
            };
        } else {
            var names = {};
            for(var i = 0; i < clazz.eventNames.length; i++) {
                names[clazz.eventNames[i]] = true;
            }

            clazz.prototype.$methods = null;

            clazz.prototype.add = function(l) {
                if (this.$methods === null) {
                    this.$methods = {};
                }

                var n   = null,
                    k   = null,
                    nms = typeof this.$names !== 'undefined' ? this.$names : names;

                if (arguments.length > 1) {
                    n = arguments[0];
                    l = arguments[arguments.length - 1]; // last arguments are handler(s)
                }

                if (typeof l === 'function') {
                    if (n !== null && nms.hasOwnProperty(n) === false) {
                        throw new Error("Unknown event type " + n);
                    }

                    if (n === null) {
                        for(k in nms) {
                            if (this.$methods.hasOwnProperty(k) === false) {
                                this.$methods[k] = [];
                            }
                            this.$methods[k].push(this, l);
                        }
                    } else {
                        if (this.$methods.hasOwnProperty(n) === false) {
                            this.$methods[n] = [];
                        }
                        this.$methods[n].push(this, l);
                    }
                } else {
                    var b = false;
                    for (k in nms) {
                        if (typeof l[k] === "function") {
                            b = true;
                            if (this.$methods.hasOwnProperty(k) === false) {
                                this.$methods[k] = [];
                            }
                            this.$methods[k].push(l, l[k]);
                        }
                    }

                    if (b === false) {
                        return null;
                    }
                }
                return l;
            };

            clazz.prototype.hasHandler = function(l) {
                if (zebkit.isString(l)) {
                    return this.$methods !== null &&
                           this.$methods.hasOwnProperty(l) &&
                           this.$methods[l].length > 0;
                } else {
                    for(var k in this.$methods) {
                        var v = this.$methods[k];
                        if (v.indexOf(l) >= 0) {
                            return true;
                        }
                    }
                    return false;
                }
            };

            clazz.prototype.addEvents = function() {
                if (typeof this.$names === 'undefined') {
                    this.$names = {};
                    for (var k in names) {
                        this.$names[k] = names[k];
                    }
                }

                for(var i = 0; i < arguments.length; i++) {
                    var name = arguments[i];

                    if (name === null || typeof name === 'undefined' || typeof this[name] !== 'undefined') {
                        throw new Error("Invalid " + name + " (event name)");
                    }

                    this[name] = (function(name) {
                        return function() {
                            if (this.$methods !== null) {
                                if (this.$methods.hasOwnProperty(name)) {
                                    var c = this.$methods[name];
                                    for(var i = 0; i < c.length; i += 2) {
                                        if (c[i + 1].apply(c[i], arguments) === true) {
                                            return true;
                                        }
                                    }
                                }
                            }
                            return false;
                        };
                    })(name);

                    this.$names[name] = true;
                }
            };

            // populate methods that has to be called to send appropriate events to
            // registered listeners
            clazz.prototype.addEvents.apply(clazz.prototype, clazz.eventNames);

            clazz.prototype.remove = function() {
                if (this.$methods !== null) {
                    var k = null;
                    if (arguments.length === 0) {
                        for(k in this.$methods) {
                            if (this.$methods.hasOwnProperty(k)) this.$methods[k].length = 0;
                        }
                        this.$methods = {};
                    } else {
                        var name = arguments.length > 1 || zebkit.isString(arguments[0]) ? arguments[0]
                                                                                         : null,
                            fn   = arguments.length > 1 ? arguments[1]
                                                        : (name === null ? arguments[0] : null),
                            i    = 0,
                            v    = null;

                        if (name !== null) {
                            if (this.$methods.hasOwnProperty(name)) {
                                if (fn === null) {
                                    this.$methods[name].length = 0;
                                    delete this.$methods[name];
                                } else {
                                    v = this.$methods[name];
                                    while ((i = v.indexOf(fn)) >= 0) {
                                        if (i % 2 > 0) i--;
                                        v.splice(i, 2);
                                    }

                                    if (v.length === 0) {
                                        delete this.$methods[name];
                                    }
                                }
                            }
                        } else {
                            for (k in this.$methods) {
                                v = this.$methods[k];
                                while ((i = v.indexOf(fn)) >= 0) {
                                    if (i % 2 > 0) i--;
                                    v.splice(i, 2);
                                }

                                if (v.length === 0) {
                                    delete this.$methods[k];
                                }
                            }
                        }
                    }
                }
            };

            clazz.prototype.hasEvent = function(nm) {
                if (typeof this.$names !== 'undefined') {
                    return this.$names.hasOwnProperty(nm);
                } else {
                    return names.hasOwnProperty(nm);
                }
            };
        }


        return clazz;
    };

    /**
     * Listeners container class that can be handy to store number of listeners
     * for one type of event.
     * @param {String} [eventName] an event name the listeners container has been
     * created. By default "fired" is default event name. Event name is used to fire
     * the given event to a listener container.
     * @constructor
     * @class zebkit.util.Listeners
     * @example
     *
     *      // create container with a default event name
     *      var  container = new Listeners();
     *
     *      // register a listener
     *      var  listener = container.add(function(param1, param2) {
     *          // handle fired event
     *      });
     *
     *      ...
     *      // fire event
     *      container.fired(1, 2, 3);
     *
     *      // remove listener
     *      container.remove(listener);
     *
     * @extends {zebkit.util.Listener}
     */


    /**
     * Add listener
     * @param {Function|Object} l a listener method or object.
     * @return {Function} a listener that has been registered in the container. The result should
     * be used to un-register the listener
     * @method  add
     */


    /**
     * Remove listener or all registered listeners from the container
     * @param {Function} [l] a listener to be removed. If the argument has not been specified
     * all registered in the container listeners will be removed
     * @method  remove
     */
    pkg.Listeners = $NewListener();


    pkg.ListenersClass = $NewListener;


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

            position.on(function(src, prevOffset, prevLine, prevCol) {
                ...
            });

     * @event posChanged
     * @param {zebkit.util.Position} src an object that triggers the event
     * @param {Integer} prevOffest a previous virtual cursor offset
     * @param {Integer} prevLine a previous virtual cursor line
     * @param {Integer} prevCol a previous virtual cursor column in the previous line
     */
    pkg.Position = Class(zebkit.EventProducer, [
        function(pi){
            this._ = new this.clazz.Listeners();

            /**
             * Shows if the position object is in valid state.
             * @private
             * @type {Boolean}
             * @attribute isValid
             */
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
        },

        function $clazz() {
            this.Listeners = pkg.ListenersClass("posChanged");

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

            this.Metric = zebkit.Interface([
                "abstract",
                    function getLines()     {

                    },

                    function getLineSize()  {

                    },

                    function getMaxOffset() {

                    }
            ]);
        },

        /**
         *  @for zebkit.util.Position
         */
        function $prototype() {
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
                if (o < 0) o = 0;
                else {
                    if (o === null) o = -1;
                    else {
                        var max = this.metrics.getMaxOffset();
                        if (o >= max) o = max;
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
                    this._.posChanged(this, prevOffset, prevLine, prevCol);
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
                    var m = this.metrics, max = m.getMaxOffset();
                    if (off > max) {
                        throw new Error("Out of bounds:" + off);
                    }

                    if (max === 0) return [(m.getLines() > 0 ? 0 : -1), 0];
                    if (off === 0) return [0, 0];

                    var d = 0, sl = 0, so = 0;
                    if (this.isValid === true && this.offset !== -1) {
                        sl = this.currentLine;
                        so = this.offset - this.currentCol;
                        if (off > this.offset) d = 1;
                        else {
                            if (off < this.offset) d = -1;
                            else return [sl, this.currentCol];
                        }
                    } else {
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
                    if (arguments.length === 1) num = 1;

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

                    this._.posChanged(this, prevOffset, prevLine, prevCol);
                }
            };

            /**
             * Set position metric. Metric describes how many lines
             * and elements in these line the virtual cursor can be navigated
             * @param {zebkit.util.Position.Metric} p a position metric
             * @method setMetric
             */
            this.setMetric = function (p){
                if (p === null || typeof p === 'undefined') {
                    throw new Error("Null metric");
                }

                if (p !== this.metrics){
                    this.metrics = p;
                    this.setOffset(null);
                }
            };
        }
    ]);

    /**
     * Single column position implementation. More simple and more fast implementation of
     * position class for the cases when only one column is possible.
     * @param {zebkit.util.Position.Metric} m a position metric
     * @constructor
     * @class zebkit.util.SingleColPosition
     * @extends {zebkit.util.Position}
     */
    pkg.SingleColPosition = Class(pkg.Position, [
        function $prototype() {
            this.setRowCol = function(r,c) {
                this.setOffset(r);
            };

            this.setOffset = function(o){
                if (o < 0) o = 0;
                else {
                    if (o === null) o = -1;
                    else {
                        var max = this.metrics.getMaxOffset();
                        if (o >= max) o = max;
                    }
                }

                if (o !== this.offset) {
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
                } else {
                    if (arguments.length === 1) {
                        num = 1;
                    }

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

    /**
     * Task set is light-weight class to host number of callbacks methods that are called within a context of one JS interval
     * method execution. The class manages special tasks queue to run it one by one as soon as a dedicated interval for the
     * given task is elapsed

            var tasks = zebkit.util.TaskSet();

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
                        }
                        return false;
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
                        }
                        this.isStarted = true;
                        return true;
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
                }

                if (this.count === 0 && this.pid  >= 0) {
                    zebkit.environment.clearInterval(this.pid);
                    this.pid = -1;
                }

                return false;
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
             *
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
             *
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
                if (f === null || typeof f === 'undefined') {
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
                                    if (typeof t.task.run !== 'undefined') {
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


    pkg.Fireable = zebkit.Interface();

    /**
     * JSON object loader class is a handy way to load hierarchy of objects encoded with
     * JSON format. The class supports standard JSON types plus it extends JSON with a number of
     * features that helps to make object creation more flexible. Zson allows developers
     * to describe creation of any type of object. For instance if you have a class "ABC" with
     * properties "prop1", "prop2", "prop3" you can use instance of the class as a value of
     * a JSON property as follow:
     *
     *      { "instanceOfABC": {
     *              "@ABC"  : [],
     *              "prop1" : "property 1 value",
     *              "prop2" : true,
     *              "prop3" : 200
     *          }
     *      }
     *
     *  And than:
     *
     *       // load JSON mentioned above
     *       zebkit.util.Zson.then("abc.json", function(bag) {
     *           bag.get("instanceOfABC");
     *       });
     *
     *  Features the JSON bag supports are listed below:
     *
     *    - **Access to hierarchical properties** You can use dot notation to get a property value. For
     *    instance:
     *
     *     { "a" : {
     *            "b" : {
     *                "c" : 100
     *            }
     *         }
     *     }
     *
     *     zebkit.util.Zson.then("abc.json", function(bag) {
     *         bag.get("a.b.c"); // 100
     *     });
     *
     *
     *    - **Property reference** Every string JSON value that starts from "@" considers as reference to
     *    another property value in the given JSON.
     *
     *     {  "a" : 100,
     *        "b" : {
     *            "c" : "%{a.b}"
     *        }
     *     }
     *
     *    here property "b.c" equals to 100 since it refers to  property "a.b"
     *
     *    - **Inheritance** By using special property name "inherit" it is possible to embed set of properties
     *    from a JSON object:
     *
     *     {
     *        // base component
     *        "BaseComponent": {
     *            "background": "red",
     *            "border": "plain",
     *            "size": [300, 300]
     *        },
     *
     *        // component that inherits properties from BaseComponent,
     *        // but override background property with own value
     *        "ExtenderComp": {
     *            "inherit": "@{BaseComponent}",
     *            "background": "green"
     *        }
     *     }
     *
     *    - **Class instantiation**  Property can be easily initialized with an instantiation of required class. JSON
     *    bag considers all properties whose name starts from "@" character as a class name that has to be instantiated:
     *
     *     {  "date": {
     *           { "@Date" : [] }
     *         }
     *     }
     *
     *   Here property "date" is set to instance of JS Date class.
     *
     *   - **Factory classes** JSON bag follows special pattern to describe special type of property whose value
     *   is re-instantiated every time the property is requested. Definition of the property value is the same
     *   to class instantiation, but the name of class has to prefixed with "*" character:
     *
     *
     *     {  "date" : {
     *           "@ *Date" : []
     *        }
     *     }
     *
     *
     *   Here, every time you call get("date") method a new instance of JS date object will be returned. So
     *   every time will have current time.
     *
     *   - **JS Object initialization** If you have an object in your code you can easily fulfill properties of the
     *   object with JSON bag. For instance you can create zebkit UI panel and adjust its background, border and so on
     *   with what is stored in JSON:
     *
     *
     *    {
     *      "background": "red",
     *      "layout"    : { "@zebkit.layout.BorderLayout": [] },
     *      "border"    : { "@zebkit.ui.RoundBorder": [ "black", 2 ] }
     *    }
     *
     *    var pan = new zebkit.ui.Panel();
     *    new zebkit.util.Zson(pan).then("pan.json", function(bag) {
     *        // loaded and fullil panel
     *        ...
     *    });
     *
     *
     *   - **Expression** You can evaluate expression as a property value:
     *
     *
     *      {
     *          "a": { ".expr":  "100*10" }
     *      }
     *
     *
     *   Here property "a" equals 1000
     *
     * @class zebkit.util.Zson
     * @constructor
     * @param {Object} [obj] a root object to be loaded with
     * the given JSON configuration
     */
    pkg.Zson = zebkit.Class([
        function (root) {
            if (arguments.length > 0) {
                this.root = root;
            }

            /**
             * Map of aliases and appropriate classes
             * @attribute classAliases
             * @protected
             * @type {Object}
             * @default {}
             */
            this.classAliases = {};
        },

        function $prototype() {
            this.url = null;


            /**
             * Object that keeps loaded and resolved content of a JSON
             * @readOnly
             * @attribute root
             * @type {Object}
             * @default {}
             */
            this.root = null;

            /**
             * Original JSON as a JS object
             * @attribute content
             * @protected
             * @type {Object}
             * @default null
             */
            this.content = null;

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

            /**
             * Get a property value by the given key. The property name can point to embedded fields:
             *
             *      new zebkit.util.Zson().then("my.json", function(bag) {
             *          bag.get("a.b.c");
             *      });
             *
             *
             * @param  {String} key a property key.
             * @return {Object} a property value
             * @throws Error if property cannot be found and it  doesn't start with "?"
             * @method  get
             */
            this.get = function(key) {
                if (key === null || typeof key === 'undefined') {
                    throw new Error("Null key");
                }

                var ignore = false;
                if (key[0] === '?') {
                    key = key.substring(1).trim();
                    ignore = true;
                }

                var v = this.$get(key.split('.'), this.root);
                if (ignore === false && typeof v === 'undefined') {
                    throw new Error("Property '" + key + "' not found");
                }

                return v;
            };

            /**
             * Internal implementation of fetching a property value.
             * @param  {Array} keys array of a key path parts
             * @param  {Object} root an object to start resolving a property value
             * @method  $get
             * @protected
             * @return {Object} a property value or undefined if the property  cannot be fetched from the
             * object
             */
            this.$get = function(keys, root) {
                if (keys.length === 0) {
                    throw new Error("No keys were found");
                }

                var v = root;
                for(var i = 0; i < keys.length; i++) {
                    v = v[keys[i]];
                    if (typeof v === "undefined") {
                        return undefined;
                    }
                }
                return v !== null && v.$new ? v.$new() : v;
            };

            /**
             * Test if the given value has atomic type (String, Number or Boolean).
             * @param  {Object}  v a value
             * @return {Boolean} true if the value has atomic type
             * @protected
             * @method  $isAtomic
             */
            this.$isAtomic = function(v) {
                return v === null || typeof v === 'undefined' ||
                       (typeof v === "string"  || v.constructor === String)  ||
                       (typeof v === "number"  || v.constructor === Number)  ||
                       (typeof v === "boolean" || v.constructor === Boolean)  ;
            };

            /**
             * Call method.
             * @param  {String} name a method name
             * @param  {Object} d arguments
             * @return {Object} a method execution result
             * @method callMethod
             */
            this.callMethod = function(name, d) {
                var m  = this[name.substring(1).trim()],
                    ts = this.$runner.$tasks.length,
                    bs = this.$runner.$busy;

                if (typeof m !== 'function') {
                    throw new Error("Method '" + name + "' cannot be found");
                }

                var args = this.buildValue(Array.isArray(d) ? d
                                                            : [ d ]),
                    $this = this;

                if (this.$runner.$tasks.length === ts &&
                    this.$runner.$busy === bs           )
                {
                    var res = m.apply(this, args);
                    if (res instanceof zebkit.DoIt) {
                        return new zebkit.DoIt().till(this.$runner).then(function() {
                            var jn = this.join();
                            res.then(function(res) {
                                jn(res);
                                return res;
                            }).then(function(res) {
                                return res;
                            });
                        }).catch(function(e) {
                            $this.$runner.error(e);
                        });
                    } else {
                        return res;
                    }
                } else {
                    return new zebkit.DoIt().till(this.$runner).then(function() {
                        if (args instanceof zebkit.DoIt) {
                            var jn = this.join();
                            args.then(function(res) {
                                jn(res);
                                return res;
                            });
                        } else {
                            return args;
                        }
                    }).then(function(args) {
                        var res = m.apply($this, args);
                        if (res instanceof zebkit.DoIt) {
                            var jn = this.join();
                            res.then(function(res) {
                                jn(res);
                                return res;
                            });
                        } else {
                            return res;
                        }
                    }).then(function(res) {
                        return res;
                    }).catch(function(e) {
                        $this.$runner.error(e);
                    });
                }
            };

            this.$resolveRef = function(target, names) {
                var fn = function(ref, rn) {
                    rn.then(function(target) {
                        if (target != null && target.hasOwnProperty(ref) === true) {
                            var v = target[ref];
                            if (v instanceof zebkit.DoIt) {
                                var jn = this.join();
                                v.then(function(res) {
                                    jn.call(rn, res);
                                    return res;
                                });
                            } else {
                                return v;
                            }
                        } else {
                            return undefined;
                        }
                    });
                };

                for (var j = 0; j < names.length; j++) {
                    var ref = names[j];

                    if (target.hasOwnProperty(ref)) {
                        var v = target[ref];

                        if (v instanceof zebkit.DoIt) {
                            var rn      = new zebkit.DoIt(),
                                trigger = rn.join();

                            for(var k = j; k < names.length; k++) {
                                fn(names[k], rn);
                            }

                            trigger.call(rn, target);
                            return rn;
                        } else {
                            target = target[ref];
                        }

                    } else {
                        return undefined;
                    }
                }

                return target;
            };

            this.$buildArray = function(d) {
                var hasAsync = false;
                for (var i = 0; i < d.length; i++) {
                    var v = this.buildValue(d[i]);
                    if (v instanceof zebkit.DoIt) {
                        hasAsync = true;
                        this.$assignValue(d, i, v);
                    } else {
                        d[i] = v;
                    }
                }

                if (hasAsync) {
                    return new zebkit.DoIt().till(this.$runner).then(function() {
                        return d;
                    });
                } else {
                    return d;
                }
            };

            this.$buildClass = function(k, d) {
                var classname = k.substring(1).trim(),
                    args      = d[k],
                    clz       = null,
                    busy      = this.$runner.$busy,
                    tasks     = this.$runner.$tasks.length;

                delete d[k]; // delete class name

                // '?' means optional class instance.
                if (classname[0] === '?') {
                    classname = classname.substring(1).trim();
                    try {
                        clz = this.resolveClass(classname[0] === '*' ? classname.substring(1).trim()
                                                                     : classname);
                    } catch (e) {
                        return null;
                    }
                } else {
                    clz = this.resolveClass(classname[0] === '*' ? classname.substring(1).trim()
                                                                 : classname);
                }

                args = this.buildValue(Array.isArray(args) ? args
                                                           : [ args ]);

                if (classname[0] === '*') {
                    return (function(clazz, args) {
                        return {
                            $new : function() {
                                return zebkit.newInstance(clazz, args);
                            }
                        };
                    })(clz, args);
                }

                var props = this.buildValue(d);

                // let's do optimization to avoid unnecessary overhead
                // equality means nor arguments neither properties has got async call
                if (this.$runner.$busy === busy && this.$runner.$tasks.length === tasks) {
                    var inst = zebkit.newInstance(clz, args);
                    this.merge(inst, props, true);
                    return inst;
                } else {
                    var $this = this;
                    return new zebkit.DoIt().till(this.$runner).then(function() {
                        var jn1 = this.join(),  // create all join here to avoid result overwriting
                            jn2 = this.join();

                        if (args instanceof zebkit.DoIt) {
                            args.then(function(res) {
                                jn1(res);
                                return res;
                            });
                        } else {
                            jn1(args);
                        }

                        if (props instanceof zebkit.DoIt) {
                            props.then(function(res) {
                                jn2(res);
                                return res;
                            });
                        } else {
                            jn2(props);
                        }
                    }).then(function(args, props) {
                        var inst = zebkit.newInstance(clz, args);
                        $this.merge(inst, props, true);
                        return inst;
                    });
                }
            };

            this.$buildRef = function(d) {
                var idx = -1;

                if (d[2] === "<" || d[2] === '.' || d[2] === '/') { //TODO: not complete solution that cannot detect URLs
                    var path  = null,
                        type  = null,
                        $this = this;

                    if (d[2] === '<') {
                        // if the referenced path is not absolute path and the bag has been also
                        // loaded by an URL than build the full URL as a relative path from
                        // BAG URL
                        idx = d.indexOf('>');
                        if (idx <= 4) {
                            throw new Error("Invalid content type in URL '" + d + "'");
                        }

                        path = d.substring(idx + 1, d.length - 1).trim();
                        type = d.substring(3, idx).trim();
                    } else {
                        path = d.substring(2, d.length - 1).trim();
                        type = "json";
                    }

                    if (type === 'js') {
                        return this.expr(path);
                    }

                    if (this.url !== null && zebkit.URI.isAbsolute(path) === false) {
                        var pURL = new zebkit.URI(this.url).getParent();
                        if (pURL !== null) {
                            path = zebkit.URI.join(pURL, path);
                        }
                    }

                    if (type === "json") {
                        var bag = new this.clazz();
                        bag.usePropertySetters = this.usePropertySetters;

                        var bg = bag.then(path).catch();
                        this.$runner.then(bg.then(function(res) {
                            return res.root;
                        }));
                        return bg;
                    } else if (type === 'img') {
                        if (this.url !== null && zebkit.URI.isAbsolute(path) === false) {
                            path = zebkit.URI.join(new zebkit.URI(this.url).getParent(),
                                                   path);
                        }
                        return pkg.image(path, false);
                    } else if (type === 'txt') {
                        return new zebkit.io.GET(path).then(function(r) {
                            return r.responseText;
                        }).catch(function(e) {
                            $this.$runner.error(e);
                        });
                    } else {
                        throw new Error("Invalid content type " + type);
                    }

                } else {
                    // ? means don't throw exception if reference cannot be resolved
                    idx = 2;
                    if (d[2] === '?') {
                        idx ++;
                    }

                    var name    = d.substring(idx, d.length - 1).trim(),
                        names   = name.split('.'),
                        targets = [ this.content, this.root,  zebkit.$global ];

                    for(var i = 0; i < targets.length; i++) {
                        var target = targets[i];
                        if (target !== null) {
                            var value = this.$resolveRef(target, names);
                            if (typeof value !== 'undefined') {
                                return value;
                            }
                        }
                    }

                    if (idx === 2) {
                        throw new Error("Reference '" + name + "' cannot be resolved");
                    } else {
                        return d;
                    }
                }
            };

            /**
             * Build a value by the given JSON description
             * @param  {Object} d a JSON description
             * @return {Object} a value
             * @protected
             * @method buildValue
             */
            this.buildValue = function(d) {
                if (typeof d === 'undefined' || d === null || d instanceof zebkit.DoIt ||
                    (typeof d === "number"   || d.constructor === Number)              ||
                    (typeof d === "boolean"  || d.constructor === Boolean)                )
                {
                    return d;
                }

                if (Array.isArray(d)) {
                    return this.$buildArray(d);
                }

                if (typeof d === "string" || d.constructor === String) {
                    if (d[0] === '%' && d[1] === '{' && d[d.length - 1] === '}') {
                        return this.$buildRef(d);
                    } else {
                        return d;
                    }
                }

                var k = null;

                // test whether we have a class definition
                for (k in d) {
                    // handle class definition
                    if (k[0] === '@' && d.hasOwnProperty(k) === true) {
                        return this.$buildClass(k, d);
                    }

                    //!!!!  trust the name of class occurs first what in general
                    //      cannot be guaranteed by JSON spec but we can trust
                    //      since many other third party applications stands
                    //      on it too :)
                    break;
                }

                for (k in d) {
                    if (d.hasOwnProperty(k)) {
                        var v = d[k];

                        // special field name that says to call method to create a
                        // value by the given description
                        if (k[0] === "." || k[0] === '#') {
                            delete d[k];
                            if (k[0] === '#') {
                                this.callMethod(k, v, d);
                            } else {
                                return this.callMethod(k, v, d);
                            }
                        } else if (k[0] === '%') {
                            delete d[k];
                            this.mixin(d, this.$buildRef(k));
                        } else {
                            this.$assignValue(d, k, this.buildValue(v));
                        }
                    }
                }

                return d;
            };

            this.$assignValue = function(o, k, v) {
                o[k] = v;
                if (v instanceof zebkit.DoIt) {
                    var $this = this;
                    this.$runner.then(v.then(function(res) {
                        o[k] = res;
                        return res;
                    }));
                }
            };

            this.$assignProperty = function(o, m, v) {
                // setter has to be placed in queue to let
                // value resolves its DoIts
                this.$runner.then(function(res) {
                    if (Array.isArray(v)) {
                        m.apply(o, v);
                    } else {
                        m.call (o, v);
                    }
                    return res;
                });
            };

            this.merge = function(dest, src, recursively) {
                if (arguments.length < 3) {
                    recursively = true;
                }

                for (var k in src) {
                    if (src.hasOwnProperty(k)) {
                        var sv = src [k],
                            dv = dest[k];

                        if (this.usePropertySetters === true) {
                            var m = zebkit.getPropertySetter(dest, k);
                            if (m !== null) {
                                this.$assignProperty(dest, m, sv);
                                continue;
                            }
                        }


                        if (this.$isAtomic(dv) || Array.isArray(dv) ||
                            this.$isAtomic(sv) || Array.isArray(sv) ||
                            typeof sv.clazz !== 'undefined'            )
                        {
                            this.$assignValue(dest, k, sv);
                        } else if (recursively === true) {
                            if (dv != null && typeof dv.clazz !== 'undefined' && dv.clazz.mergeable === false) {
                                this.$assignValue(dest, k, sv);
                            } else {
                                this.merge(dv, sv);
                            }
                        }
                    }
                }
                return dest;
            };

            this.mixin = function(dest, src) {
                if (src instanceof zebkit.DoIt) {
                    var $this = this;
                    this.$runner.then(src.then(function(src) {
                        for (var k in src) {
                            if (src.hasOwnProperty(k) && (typeof dest[k] === 'undefined' || dest[k] === null)) {
                                $this.$assignValue(dest, k, src[k]);
                            }
                        }
                    }));
                } else {
                    for (var k in src) {
                        if (src.hasOwnProperty(k) && (typeof dest[k] === 'undefined' || dest[k] === null)) {
                            this.$assignValue(dest, k, src[k]);
                        }
                    }
                }
            };

            /**
             * Called every time the given class name has to be transformed into
             * the class object (constructor) reference. The method checks if the given class name
             * is alias that is mapped with the bag to a class.
             * @param  {String} className a class name
             * @return {Function} a class reference
             * @method resolveClass
             * @protected
             */
            this.resolveClass = function(className) {
                return this.classAliases.hasOwnProperty(className) ? this.classAliases[className]
                                                                   : zebkit.Class.forName(className);
            };

            /**
             * Adds class aliases
             * @param {Object} aliases dictionary where key is a class alias that can be referenced from
             * JSON and the value is class itself (constructor)
             * @method  addClassAliases
             */
            this.addClassAliases = function(aliases) {
                for(var k in aliases) {
                    this.classAliases[k] = Class.forName(aliases[k].trim());
                }
            };

            this.expr = function(expr) {
                if (expr.length > 200) {
                    throw new Error("Out of evaluated script limit");
                }

                return eval("'use strict';" + expr);
            };

            /**
             * Load and parse the given JSON content.
             * @param  {String|Object} json a JSON content. It can be:
             *    - **String**
             *       - JSON string
             *       - URL to a JSON
             *    - **Object** JavaScript object
             * @return {zebkit.DoIt} a reference to the runner
             * @method then
             * @example
             *
             *     // load JSON in bag from a remote site asynchronously
             *     new zebkit.util.Zson().then("http://test.com/test.json", function(bag) {
             *             // bag is loaded and ready for use
             *             bag.get("a.c");
             *         }
             *     ).catch(function(error) {
             *         // handle error
             *         ...
             *     });
             */
            this.then = function(json, fn) {
                if (json === null || typeof json === 'undefined' || (zebkit.isString(json) && json.trim().length === 0)) {
                    throw new Error("Null content");
                }

                this.$runner = new zebkit.DoIt();

                var $this = this;
                this.$runner.then(function() {
                    if (zebkit.isString(json)) {
                        json = json.trim();

                        // detect if the passed string is not a JSON, but URL
                        if ((json[0] !== '[' || json[json.length - 1] !== ']') &&
                            (json[0] !== '{' || json[json.length - 1] !== '}')   )
                        {
                            $this.url = json + (json.lastIndexOf("?") > 0 ? "&" : "?") + (new Date()).getTime().toString();

                            var join = this.join();
                            zebkit.io.GET($this.url).then(function(r) {
                                join.call($this, r.responseText);
                            }).catch(function(e) {
                                $this.$runner.error(e);
                            });
                        } else {
                            return json;
                        }
                    } else {
                        return json;
                    }
                }).then(function(json) { // populate JSON content
                    if (zebkit.isString(json)) {
                        try {
                            $this.content = JSON.parse(json);
                        } catch(e) {
                            throw new Error("JSON format error: " + e);
                        }
                    } else {
                        $this.content = json;
                    }

                    $this.$assignValue($this, "content", $this.buildValue($this.content));
                }).then(function() {
                    if ($this.root !== null) {
                        $this.merge($this.root, $this.content);
                    } else {
                        $this.root = $this.content;
                    }
                    return $this;
                });

                if (arguments.length > 1) {
                    this.$runner.then(fn);
                }

                return this.$runner;
            };
        }
    ]);
});
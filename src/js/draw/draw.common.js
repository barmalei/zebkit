zebkit.package("draw", function(pkg, Class) {
    /**
     * View package
     *
     * @class  zebkit.draw
     * @access package
     */


     /**
      * Dictionary of useful methods an HTML Canvas 2D context can be extended. The following methods are
      * included:
      *
      *   - **setFont(f)**   set font
      *   - **setColor(c)**  set background and foreground colors
      *   - **drawLine(x1, y1, x2, y2, [w])**  draw line of the given width
      *   - **ovalPath(x,y,w,h)**  build oval path
      *   - **polylinePath(xPoints, yPoints, nPoints)**  build path by the given points
      *   - **drawDottedRect(x,y,w,h)**  draw dotted rectangle
      *   - **drawDashLine(x,y,x2,y2)** draw dashed line
      *
      * @attribute Context2D
      * @type {Object}
      * @protected
      * @readOnly
      */
     pkg.Context2D = {
        setFont : function(f) {
            f = (typeof f.s !== 'undefined' ? f.s : f.toString());
            if (f !== this.font) {
                this.font = f;
            }
        },

        setColor : function (c) {
            c = (typeof c.s !== 'undefined' ? c.s : c.toString());
            if (c !== this.fillStyle) {
                this.fillStyle = c;
            }

            if (c !== this.strokeStyle) {
                this.strokeStyle = c;
            }
        },

        drawLine : function (x1, y1, x2, y2, w){
            if (arguments.length < 5) {
                w = 1;
            }

            var pw = this.lineWidth;
            this.beginPath();
            if (this.lineWidth !== w) {
                this.lineWidth = w;
            }

            if (x1 === x2) {
                x1 += w / 2;
                x2 = x1;
            } else if (y1 === y2) {
                y1 += w / 2;
                y2 = y1;
            }

            this.moveTo(x1, y1);
            this.lineTo(x2, y2);
            this.stroke();
            if (pw !== this.lineWidth) {
                this.lineWidth = pw;
            }
        },

        ovalPath: function (x,y,w,h){
            this.beginPath();
            x += this.lineWidth;
            y += this.lineWidth;
            w -= 2 * this.lineWidth;
            h -= 2 * this.lineWidth;

            var kappa = 0.5522848,
                ox = Math.floor((w / 2) * kappa),
                oy = Math.floor((h / 2) * kappa),
                xe = x + w,
                ye = y + h,
                xm = x + w / 2,
                ym = y + h / 2;
            this.moveTo(x, ym);
            this.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
            this.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
            this.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            this.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
            this.closePath();
         },

        polylinePath : function(xPoints, yPoints, nPoints){
            this.beginPath();
            this.moveTo(xPoints[0], yPoints[0]);
            for(var i = 1; i < nPoints; i++) {
                this.lineTo(xPoints[i], yPoints[i]);
            }
        },

        drawRect : function(x,y,w,h) {
            this.beginPath();
            this.rect(x,y,w,h);
            this.stroke();
        },

        drawDottedRect : function(x,y,w,h) {
            var ctx = this, m = ["moveTo", "lineTo", "moveTo"];
            function dv(x, y, s) { for(var i=0; i < s; i++) { ctx[m[i%3]](x + 0.5, y + i); }  }
            function dh(x, y, s) { for(var i=0; i < s; i++) { ctx[m[i%3]](x + i, y + 0.5); } }
            ctx.beginPath();
            dh(x, y, w);
            dh(x, y + h - 1, w);
            ctx.stroke();
            ctx.beginPath();
            dv(x, y, h);
            dv(w + x - 1, y, h);
            ctx.stroke();
        },

        drawDashLine : function(x,y,x2,y2) {
            var pattern = [1,2],
                compute = null,
                dx      = (x2 - x), dy = (y2 - y),
                b       = (Math.abs(dx) > Math.abs(dy)),
                slope   = b ? dy / dx : dx / dy,
                sign    = b ? (dx < 0 ?-1:1) : (dy < 0?-1:1),
                dist    = Math.sqrt(dx * dx + dy * dy);

            if (b) {
                compute = function(step) {
                    x += step;
                    y += slope * step;
                };
            } else {
                compute = function(step) {
                    x += slope * step;
                    y += step;
                };
            }

            this.beginPath();
            this.moveTo(x, y);
            for (var i = 0; dist >= 0.1; i++) {
                var idx  = i % pattern.length,
                    dl   = dist < pattern[idx] ? dist : pattern[idx],
                    step = Math.sqrt(dl * dl / (1 + slope * slope)) * sign;

                compute(step);
                this[(i % 2 === 0) ? 'lineTo' : 'moveTo'](x + 0.5, y + 0.5);
                dist -= dl;
            }
            this.stroke();
        }
    };

    /**
     * Dictionary of predefined views. Every view is accessible by an id associated
     * with the view.
     * @attribute $views
     * @type {Object}
     * @protected
     * @for zebkit.draw
     */
    pkg.$views = {};

    /**
     * Build a view instance by the given object.
     * @param  {Object} v an object that can be used to build a view. The following variants
     * of object types are possible
     *
     *   - **null** null is returned
     *   - **String** if the string is color or border view id than "zebkit.draw.rgb" or border view
     *     is returned. Otherwise an instance of zebkit.draw.StringRender is returned.
     *   -  **String** if the string starts from "#" or "rgb" it is considered as encoded color.  "zebkit.draw.rgb"
     *     instance will be returned as the view
     *   - **Array** an instance of "zebkit.draw.CompositeView" is returned
     *   - **Function** in this case the passed method is considered as ans implementation of "paint(g, x, y, w, h, d)"
     *     method of "zebkit.draw.View" class. Ans instance of "zebkit.draw.View" with the method implemented is returned.
     *   - **Object** an instance of "zebkit.draw.ViewSet" is returned
     *
     * @return zebkit.draw.View a view
     * @method $view
     * @example
     *
     *      // string render
     *      var view = zebkit.draw.$view("String render");
     *
     *      // color render
     *      var view = zebkit.draw.$view("red");
     *
     *      // composite view
     *      var view = zebkit.draw.$view([
     *          zebkit.draw.rgb.yellow,
     *          "String Render"
     *      ]);
     *
     *      // custom view
     *      var view = zebkit.draw.$view(function(g,x,y,w,h,d) {
     *          g.drawLine(x, y, x + w, y + w);
     *          ...
     *       });
     *
     * @protected
     * @for zebkit.draw
     */
    pkg.$view = function(v) {
        if (v === null || typeof v.paint !== 'undefined') {
            return v;
        } else if (typeof v === "string" || v.constructor === String) {
            if (typeof pkg.rgb[v] !== 'undefined') { // detect color
                return pkg.rgb[v];
            } else if (typeof pkg.$views[v] !== 'undefined') { // detect predefined view
                return pkg.$views[v];
            } else {
                if (v.length > 0 &&
                    (v[0] === '#'        ||
                      ( v.length > 2 &&
                        v[0] === 'r' &&
                        v[1] === 'g' &&
                        v[2] === 'b'    )  ))
                {
                    return new pkg.rgb(v);
                } else {
                    return new pkg.StringRender(v);
                }
            }
        } else if (Array.isArray(v)) {
            return new pkg.CompositeView(v);
        } else if (typeof v !== 'function') {
            return new pkg.ViewSet(v);
        } else {
            var vv = new pkg.View();
            vv.paint = v;
            return vv;
        }
    };

    /**
     * View class that is designed as a basis for various reusable decorative UI elements implementations
     * @class zebkit.draw.View
     * @constructor
     */
    pkg.View = Class([
        function $prototype() {
            this.gap = 2;

            /**
             * Get left gap. The method informs UI component that uses the view as
             * a border view how much space left side of the border occupies
             * @return {Integer} a left gap
             * @method getLeft
             */

             /**
              * Get right gap. The method informs UI component that uses the view as
              * a border view how much space right side of the border occupies
              * @return {Integer} a right gap
              * @method getRight
              */

             /**
              * Get top gap. The method informs UI component that uses the view as
              * a border view how much space top side of the border occupies
              * @return {Integer} a top gap
              * @method getTop
              */

             /**
              * Get bottom gap. The method informs UI component that uses the view as
              * a border view how much space bottom side of the border occupies
              * @return {Integer} a bottom gap
              * @method getBottom
              */
            this.getRight = this.getLeft = this.getBottom = this.getTop = function() {
                return this.gap;
            };

            /**
            * Return preferred size the view desires to have
            * @method getPreferredSize
            * @return {Object}
            */
            this.getPreferredSize = function() {
                return { width  : 0,
                         height : 0 };
            };

            /**
            * The method is called to render the decorative element on the given surface of the specified
            * UI component
            * @param {CanvasRenderingContext2D} g  graphical context
            * @param {Integer} x  x coordinate
            * @param {Integer} y  y coordinate
            * @param {Integer} w  required width
            * @param {Integer} h  required height
            * @param {zebkit.layout.Layoutable} c an UI component on which the view
            * element has to be drawn
            * @method paint
            */
            this.paint = function(g,x,y,w,h,c) {};
        }
    ]);

    /**
     * Render class extends "zebkit.draw.View" class with a notion
     * of target object. Render stores reference  to a target that
     * the render knows how to visualize. Basically Render is an
     * object visualizer. For instance, developer can implement
     * text, image and so other objects visualizers.
     * @param {Object} target a target object to be visualized
     * with the render
     * @constructor
     * @extends zebkit.draw.View
     * @class zebkit.draw.Render
     */
    pkg.Render = Class(pkg.View, [
        function(target) {
            if (arguments.length > 0) {
                this.setValue(target);
            }
        },

        function $prototype() {
            /**
             * Target object to be visualized
             * @attribute target
             * @default null
             * @readOnly
             * @type {Object}
             */
            this.target = null;

            /**
             * Set the given target object. The method triggers "valueWasChanged(oldTarget, newTarget)"
             * execution if the method is declared. Implement the method if you need to track a target
             * object updating.
             * @method setValue
             * @param  {Object} o a target object to be visualized
             */
            this.setValue = function(o) {
                if (this.target !== o) {
                    var old = this.target;
                    this.target = o;
                    if (typeof this.valueWasChanged !== 'undefined') {
                        this.valueWasChanged(old, o);
                    }
                }
            };

            /**
             * Get as rendered object.
             * @return {Object} a rendered object
             * @method getValue
             */
            this.getValue = function() {
                return this.target;
            };
        }
    ]);

    /**
     * RGB color class. This class represents a rgb color as JavaScript structure:
     *
     *     // rgb color
     *     var rgb1 = new zebkit.draw.rgb(100,200,100);
     *
     *     // rgb with transparency
     *     var rgb2 = new zebkit.draw.rgb(100,200,100, 0.6);
     *
     *     // encoded as a string rgb color
     *     var rgb3 = new zebkit.draw.rgb("rgb(100,100,200)");
     *
     *     // hex rgb color
     *     var rgb3 = new zebkit.draw.rgb("#CCDDFF");
     *
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
     * @class zebkit.draw.rgb
     * @extends {zebkit.draw.View}
     */
    pkg.rgb = Class(pkg.View, [
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
                if (arguments.length > 3) {
                    this.a = a;
                }
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

            this.gap = 0;

            this.paint = function(g,x,y,w,h,d) {
                if (this.s !== g.fillStyle) {
                    g.fillStyle = this.s;
                }

                // fix for IE10/11, calculate intersection of clipped area
                // and the area that has to be filled. IE11/10 have a bug
                // that triggers filling more space than it is restricted
                // with clip
                if (typeof g.$states !== 'undefined') {
                    var t  = g.$states[g.$curState],
                        rx = x > t.x ? x : t.x,
                        rw = Math.min(x + w, t.x + t.width) - rx;

                    if (rw > 0)  {
                        var ry = y > t.y ? y : t.y,
                        rh = Math.min(y + h, t.y + t.height) - ry;

                        if (rh > 0) {
                            g.fillRect(rx, ry, rw, rh);
                        }
                    }
                } else {
                    g.fillRect(x, y, w, h);
                }
            };

            this.toString = function() {
                return this.s;
            };
        },

        function $clazz() {
            /**
             * Black color constant
             * @attribute black
             * @type {zebkit.draw.rgb}
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
    * Composite view. The view allows developers to combine number of
    * views and renders its together.
    * @class zebkit.draw.CompositeView
    * @param {Object} ...views number of views to be composed.
    * @constructor
    * @extends zebkit.draw.View
    */
    pkg.CompositeView = Class(pkg.View, [
        function() {
            /**
             * Composed views array.
             * @attribute views
             * @type {Array}
             * @protected
             * @readOnly
             */
            this.views = [];

            var args = arguments.length === 1 ? arguments[0] : arguments;
            for(var i = 0; i < args.length; i++) {
                this.views[i] = pkg.$view(args[i]);
                this.$recalc(this.views[i]);
            }
        },

        function $prototype() {
            /**
             * Left padding
             * @readOnly
             * @private
             * @attribute left
             * @type {Integer}
             */

            /**
             * Right padding
             * @private
             * @readOnly
             * @attribute right
             * @type {Integer}
             */

            /**
             * Top padding
             * @private
             * @readOnly
             * @attribute top
             * @type {Integer}
             */

            /**
             * Bottom padding
             * @readOnly
             * @private
             * @attribute bottom
             * @type {Integer}
             */
            this.left = this.right = this.bottom = this.top = this.height = this.width = 0;

            this.getTop = function() {
                return this.top;
            };

            this.getLeft = function() {
                return this.left;
            };

            this.getBottom = function () {
                return this.bottom;
            };

            this.getRight = function () {
                return this.right;
            };

            this.getPreferredSize = function (){
                return { width:this.width, height:this.height};
            };

            this.$recalc = function(v) {
                var b = 0, ps = v.getPreferredSize();
                if (typeof v.getLeft !== 'undefined') {
                    b = v.getLeft();
                    if (b > this.left) {
                        this.left = b;
                    }
                }

                if (typeof v.getRight !== 'undefined') {
                    b = v.getRight();
                    if (b > this.right) {
                        this.right = b;
                    }
                }

                if (typeof v.getTop !== 'undefined') {
                    b = v.getTop();
                    if (b > this.top) {
                        this.top = b;
                    }
                }

                if (typeof v.getBottom !== 'undefined') {
                    b = v.getBottom();
                    if (b > this.bottom) {
                        this.bottom = b;
                    }
                }


                if (ps.width > this.width) {
                    this.width = ps.width;
                }

                if (ps.height > this.height) {
                    this.height = ps.height;
                }

                if (typeof this.voutline === 'undefined' && typeof v.outline !== 'undefined') {
                    this.voutline = v;
                }
            };

            /**
             * Iterate over composed views.
             * @param  {Function} f callback that is called for every iterated view. The callback
             * gets a view index and view itself as its argument.
             * @method iterate
             */
            this.iterate = function(f) {
                for(var i = 0; i < this.views.length; i++) {
                    f.call(this, i, this.views[i]);
                }
            };

            this.recalc = function() {
                this.left = this.right = this.bottom = this.top = this.height = this.width = 0;
                this.iterate(function(k, v) {
                    this.$recalc(v);
                });
            };

            this.ownerChanged = function(o) {
                this.iterate(function(k, v) {
                    if (v !== null && typeof v.ownerChanged !== 'undefined') {
                        v.ownerChanged(o);
                    }
                });
            };

            this.paint = function(g,x,y,w,h,d) {
                var ctx = false;
                for(var i = 0; i < this.views.length; i++) {
                    var v = this.views[i];
                    v.paint(g, x, y, w, h, d);

                    if (i < this.views.length - 1 && typeof v.outline === 'function' && v.outline(g, x, y, w, h, d)) {
                        if (ctx === false) {
                            g.save();
                            ctx = true;
                        }
                        g.clip();
                    }
                }

                if (ctx === true) {
                    g.restore();
                }
            };

            /**
             * Return number of composed views.
             * @return {Integer} number of composed view.
             * @method  count
             */
            this.count = function() {
                return this.views.length;
            };

            this.outline = function(g,x,y,w,h,d) {
                return typeof this.voutline !== 'undefined' && this.voutline.outline(g,x,y,w,h,d);
            };
        }
    ]);

    /**
    * ViewSet view. The view set is a special view container that includes
    * number of views accessible by a key and allows only one view be active
    * in a particular time. Active is view that has to be rendered. The view
    * set can be used to store number of decorative elements where only one
    * can be rendered depending from an UI component state.
    * @param {Object} views object that represents views instances that have
    * to be included in the ViewSet
    * @constructor
    * @class zebkit.draw.ViewSet
    * @extends zebkit.draw.CompositeView
    */
    pkg.ViewSet = Class(pkg.CompositeView, [
        function(views) {
            if (arguments.length === 0 || views === null) {
                throw new Error("" + views);
            }

            /**
             * Views set
             * @attribute views
             * @type Object
             * @default {}
             * @readOnly
            */
            this.views = {};
            this.$size = 0;

            var activeId = "*";
            for(var k in views) {
                var id = k;
                if (k[0] === '+') {
                    id = k.substring(1);
                    activeId = id;
                }

                this.views[id] = pkg.$view(views[k]);
                this.$size++;
                if (this.views[id] !== null) {
                    this.$recalc(this.views[id]);
                }
            }

            this.activate(activeId);
        },

        function $prototype() {
            /**
             * Active in the set view
             * @attribute activeView
             * @type View
             * @default null
             * @readOnly
            */
            this.activeView = null;

            this.paint = function(g,x,y,w,h,d) {
                if (this.activeView !== null) {
                    this.activeView.paint(g, x, y, w, h, d);
                }
            };

            this.count = function() {
                return this.$size;
            };

            /**
             * Activate the given view from the given set.
             * @param  {String} id a key of a view from the set to be activated. Pass
             * null to make current view to undefined state
             * @return {Boolean} true if new view has been activated, false otherwise
             * @method activate
             */
            this.activate = function(id) {
                var old = this.activeView;

                if (id === null) {
                    return (this.activeView = null) !== old;
                } else  if (this.views.hasOwnProperty(id)) {
                    return (this.activeView = this.views[id]) !== old;
                } else if (id.length > 1 && id[0] !== '*' && id[id.length - 1] !== '*') {
                    var i = id.indexOf('.');
                    if (i > 0) {
                        var k = id.substring(0, i) + '.*';
                        if (this.views.hasOwnProperty(k)) {
                            return (this.activeView = this.views[k]) !== old;
                        } else {
                            k = "*" + id.substring(i);
                            if (this.views.hasOwnProperty(k)) {
                                return (this.activeView = this.views[k]) !== old;
                            }
                        }
                    }
                }

                // "*" is default view
                return this.views.hasOwnProperty("*") ? (this.activeView = this.views["*"]) !== old
                                                      : false;
            };

            this.iterate = function(f) {
                for(var k in this.views) {
                    f.call(this, k, this.views[k]);
                }
            };
        }
    ]);

    /**
     * Abstract shape view.
     * @param  {String}  [c]  a color of the shape
     * @param  {Integer} [w]  a line size
     * @class zebkit.draw.Shape
     * @constructor
     * @extends zebkit.draw.View
     */
    pkg.Shape = Class(pkg.View, [
        function (c, w) {
            if (arguments.length > 0) {
                this.color = c;
                if (arguments.length > 1) {
                    this.width = this.gap = w;
                }
            }
        },

        function $prototype() {
            /**
             * Shape color.
             * @attribute color
             * @type {String}
             * @default  "gray"
             */
            this.color = "gray";

            this.gap = 1;

            /**
             * Shape line width
             * @attribute width
             * @type {Integer}
             * @default 1
             */
            this.width = 1;

            this.paint = function(g,x,y,w,h,d) {
                if (g.lineWidth !== this.width) {
                    g.lineWidth = this.width;
                }

                this.outline(g,x,y,w,h,d);
                g.setColor(this.color);
                g.stroke();
            };
        }
    ]);
});
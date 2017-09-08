zebkit.package("draw", function(pkg, Class) {
    /**
     * Triangle shape view.
     * @param  {String}  [c]  a color of the shape
     * @param  {Integer} [w]  a line size
     * @class zebkit.draw.TriangleShape
     * @constructor
     * @extends zebkit.draw.Shape
     */
    pkg.TriangleShape = Class(pkg.Shape, [
        function $prototype() {
            this.outline = function(g,x,y,w,h,d) {
                g.beginPath();
                w -= 2 * this.lineWidth;
                h -= 2 * this.lineWidth;
                g.moveTo(x + w - 1, y);
                g.lineTo(x + w - 1, y + h - 1);
                g.lineTo(x, y + h - 1);
                g.closePath();
                return true;
            };
        }
    ]);

    /**
    * Vertical or horizontal linear gradient view
    * @param {String} startColor start color
    * @param {String} endColor end color
    * @param {String} [type] type of gradient
    *  "vertical" or "horizontal"
    * @constructor
    * @class zebkit.draw.Gradient
    * @extends zebkit.draw.View
    */
    pkg.Gradient = Class(pkg.View, [
        function() {
            /**
             * Gradient start and stop colors
             * @attribute colors
             * @readOnly
             * @type {Array}
             */

            this.colors = Array.prototype.slice.call(arguments, 0);
            if (arguments.length > 2) {
                this.orient = arguments[arguments.length - 1];
                this.colors.pop();
            }
        },

        function $prototype() {
            /**
             * Gradient orientation: vertical or horizontal
             * @attribute orient
             * @readOnly
             * @default "vertical"
             * @type {String}
             */
            this.orient = "vertical";

            this.$gradient = null;
            this.$gy2 = this.$gy1 = this.$gx2 = this.$gx1 = 0;

            this.paint = function(g,x,y,w,h,dd){
                var d  = (this.orient === "horizontal" ? [0,1]: [1,0]),
                    x1 = x * d[1],
                    y1 = y * d[0],
                    x2 = (x + w - 1) * d[1],
                    y2 = (y + h - 1) * d[0];

                if (this.$gradient === null  || this.$gx1 !== x1 ||
                    this.$gx2 !== x2         || this.$gy1 !== y1 ||
                    this.$gy2 !== y2                              )
                {
                    this.$gx1 = x1;
                    this.$gx2 = x2;
                    this.$gy1 = y1;
                    this.$gy2 = y2;

                    this.$gradient = g.createLinearGradient(x1, y1, x2, y2);
                    for(var i = 0; i < this.colors.length; i++) {
                        this.$gradient.addColorStop(i, this.colors[i].toString());
                    }
                }

                g.fillStyle = this.$gradient;
                g.fillRect(x, y, w, h);
            };
        }
    ]);

    /**
    * Radial gradient view
    * @param {String} startColor a start color
    * @param {String} stopColor a stop color
    * @constructor
    * @class zebkit.draw.Radial
    * @extends zebkit.draw.View
    */
    pkg.Radial = Class(pkg.View, [
        function() {
            this.colors = [];
            for(var i = 0; i < arguments.length; i++) {
                this.colors[i] = arguments[i] !== null ? arguments[i].toString() : null;
            }

            this.colors = Array.prototype.slice.call(arguments, 0);
        },

        function $prototype() {
            this.$gradient = null;
            this.$cx1 = this.$cy1 = this.$rad1 = this.$rad2 = 0;
            this.$colors = [];

            this.radius = 10;

            this.paint = function(g,x,y,w,h,d){
                var cx1  = Math.floor(w / 2),
                    cy1  = Math.floor(h / 2),
                    rad2 = w > h ? w : h;

                if (this.$gradient === null     ||
                    this.$cx1  !== cx1         ||
                    this.$cy1  !== cy1         ||
                    this.$rad1 !== this.radius ||
                    this.$rad2 !== this.rad2      )
                {
                    this.$gradient = g.createRadialGradient(cx1, cy1, this.radius, cx1, cy1, rad2);
                }

                var b = false,
                    i = 0;

                if (this.$colors.length !== this.colors.length) {
                    b = true;
                } else {
                    for (i = 0; i < this.$colors.length; i++) {
                        if (this.$colors[i] !== this.colors[i]) {
                            b = true;
                            break;
                        }
                    }
                }

                if (b) {
                    for (i = 0; i < this.colors.length; i++) {
                        this.$gradient.addColorStop(i, this.colors[i]);
                    }
                }

                g.fillStyle = this.$gradient;
                g.fillRect(x, y, w, h);
            };
        }
    ]);

    /**
    * Image render. Render an image target object or specified area of
    * the given target image object.
    * @param {Image} img the image to be rendered
    * @param {Integer} [x] a x coordinate of the rendered image part
    * @param {Integer} [y] a y coordinate of the rendered image part
    * @param {Integer} [w] a width of the rendered image part
    * @param {Integer} [h] a height of the rendered image part
    * @constructor
    * @class zebkit.draw.Picture
    * @extends zebkit.draw.Render
    */
    pkg.Picture = Class(pkg.Render, [
        function(img, x, y, w, h) {
            this.setValue(img);
            if (arguments.length === 2) {
                this.height = this.width = x;
            } else if (arguments.length === 3) {
                this.width  = x;
                this.height = y;
            } else if (arguments.length > 3) {
                this.x      = x;
                this.y      = y;
                this.width  = w;
                this.height = h;
            }
        },

        function $prototype() {
            /**
             * A x coordinate of the image part that has to be rendered
             * @attribute x
             * @readOnly
             * @type {Integer}
             * @default -1
             */
            this.x = -1;

            /**
             * A y coordinate of the image part that has to be rendered
             * @attribute y
             * @readOnly
             * @type {Integer}
             * @default -1
             */
            this.y = -1;

            /**
             * A width  of the image part that has to be rendered
             * @attribute width
             * @readOnly
             * @type {Integer}
             * @default -1
             */
            this.width = -1;

            /**
             * A height of the image part that has to be rendered
             * @attribute height
             * @readOnly
             * @type {Integer}
             * @default -1
             */
            this.height = -1;

            this.paint = function(g,x,y,w,h,d) {
                if (this.target !== null &&
                    this.target.complete === true &&
                    this.target.naturalWidth > 0 &&
                    w > 0 && h > 0)
                {
                    if (this.x >= 0) {
                        g.drawImage(this.target, this.x, this.y,
                                    this.width, this.height, x, y, w, h);
                    } else {
                        g.drawImage(this.target, x, y, w, h);
                    }
                }
            };

            this.getPreferredSize = function() {
                var img = this.target;
                return (img === null ||
                        img.naturalWidth <= 0 ||
                        img.complete !== true) ? { width:0, height:0 }
                                               : (this.width > 0) ? { width:this.width, height:this.height }
                                                                  : { width:img.width, height:img.height };
            };
        }
    ]);

    /**
    * Pattern render.
    * @class zebkit.draw.Pattern
    * @param {Image} [img] an image to be used as the pattern
    * @constructor
    * @extends zebkit.draw.Render
    */
    pkg.Pattern = Class(pkg.Render, [
        function $prototype() {
            /**
             * Buffered pattern
             * @type {Pattern}
             * @protected
             * @attribute $pattern
             * @readOnly
             */
            this.$pattern = null;

            this.paint = function(g,x,y,w,h,d) {
                if (this.$pattern === null && this.target !== null) {
                    this.$pattern = g.createPattern(this.target, 'repeat');
                }
                g.beginPath();
                g.rect(x, y, w, h);
                g.closePath();
                g.fillStyle = this.$pattern;
                g.fill();
            };

            this.valueWasChanged = function(o, n) {
                this.$pattern = null;
            };
        }
    ]);

    /**
     * Line view.
     * @class  zebkit.draw.Line
     * @extends zebkit.draw.View
     * @constructor
     * @param  {String} [side] a side of rectangular area where the line has to be rendered. Use
     * "left", "top", "right" or "bottom" as the parameter value
     * @param  {String} [color] a line color
     * @param  {Integer} [width] a line width
     */
    pkg.LineView = Class(pkg.View, [
        function(side, color, lineWidth) {
            if (arguments.length > 0) {
                this.side = zebkit.util.validateValue(side, "top", "right", "bottom", "left");
                if (arguments.length > 1) {
                    this.color = color;
                    if (arguments.length > 2) {
                        this.lineWidth = lineWidth;
                    }
                }
            }
        },

        function $prototype() {
            /**
             * Side the line has to be rendered
             * @attribute side
             * @type {String}
             * @default "top"
             * @readOnly
             */
            this.side = "top";

            /**
             * Line color
             * @attribute color
             * @type {String}
             * @default "black"
             * @readOnly
             */
            this.color = "black";

            /**
             * Line width
             * @attribute lineWidth
             * @type {Integer}
             * @default 1
             * @readOnly
             */
            this.lineWidth = 1;

            this.paint = function(g,x,y,w,h,t) {
                g.setColor(this.color);
                g.beginPath();
                g.lineWidth = this.lineWidth;

                var d = this.lineWidth / 2;
                if (this.side === "top") {
                    g.moveTo(x, y + d);
                    g.lineTo(x + w - 1, y + d);
                } else if (this.side === "bottom") {
                    g.moveTo(x, y + h - d);
                    g.lineTo(x + w - 1, y + h - d);
                } else if (this.side === "left") {
                    g.moveTo(x + d, y);
                    g.lineTo(x + d, y + h - 1);
                } else if (this.side === "right") {
                    g.moveTo(x + w - d, y);
                    g.lineTo(x + w - d, y + h - 1);
                } else if (this.side === "verCenter") {
                    // TODO: not implemented
                } else if (this.side === "horCenter") {
                    // TODO: not implemented
                }

                g.stroke();
            };

            this.getPreferredSize = function() {
                return {
                    width  : this.lineWidth,
                    height : this.lineWidth
                };
            };
        }
    ]);

    /**
     * Arrow view. Tye view can be use to render triangle arrow element to one of the
     * following direction: "top", "left", "bottom", "right".
     * @param  {String} d an arrow view direction.
     * @param  {String} col an arrow view color.
     * @param  {Integer} w an arrow view width.
     * @param  {Integer} h an arrow view height.
     * @constructor
     * @class zebkit.draw.ArrowView
     * @extends zebkit.draw.View
     */
    pkg.ArrowView = Class(pkg.View, [
        function (d, col, w, h) {
            if (arguments.length > 0) {
                this.direction = zebkit.util.validateValue(d, "left", "right", "bottom", "top");
                if (arguments.length > 1) {
                    this.color = col;
                    if (arguments.length > 2) {
                        this.width = this.height = w;
                        if (arguments.length > 3) {
                            this.height = h;
                        }
                    }
                }
            }
        },

        function $prototype() {
            /**
             *  Line width.
             *  @attribute lineWidth
             *  @type {Integer}
             *  @default 1
             */
            this.lineWidth = 1;

            /**
             *  Indicates if the arrow has to be filled with the arrow line color.
             *  @attribute fill
             *  @type {Boolean}
             *  @default true
             */
            this.fill = true;

            /**
             * Gap
             * @attribute gap
             * @type {Integer}
             * @default 0
             */
            this.gap = 0;

            /**
             * Arrow color
             * @attribute color
             * @type {String}
             * @default "black"
             */
            this.color = "black";

            /**
             * Arrow width.
             * @attribute width
             * @type {Integer}
             * @default 8
             */
            this.width = 8;

             /**
              * Arrow height.
              * @attribute height
              * @type {Integer}
              * @default 8
              */
            this.height = 8;

            /**
             * Arrow direction.
             * @attribute direction
             * @type {String}
             * @default "bottom"
             */
            this.direction = "bottom";

            this.outline = function(g, x, y, w, h, d) {
                x += this.gap;
                y += this.gap;
                w -= this.gap * 2;
                h -= this.gap * 2;

                var dt = this.lineWidth / 2,
                    w2 = Math.round(w / 2) - (w % 2 === 0 ? 0 : dt),
                    h2 = Math.round(h / 2) - (h % 2 === 0 ? 0 : dt);

                g.beginPath();

                if ("bottom" === this.direction) {
                    g.moveTo(x, y + dt);
                    g.lineTo(x + w - 1, y + dt);
                    g.lineTo(x + w2, y + h - dt);
                    g.lineTo(x + dt, y + dt);
                } else if ("top" === this.direction) {
                    g.moveTo(x, y + h - dt);
                    g.lineTo(x + w - 1, y + h - dt);
                    g.lineTo(x + w2, y);
                    g.lineTo(x + dt, y + h - dt);
                } else if ("left" === this.direction) {
                    g.moveTo(x + w - dt, y);
                    g.lineTo(x + w - dt, y + h - 1);
                    g.lineTo(x, y + h2);
                    g.lineTo(x + w + dt, y);
                } else if ("right" === this.direction) {
                    g.moveTo(x + dt, y);
                    g.lineTo(x + dt, y + h - 1);
                    g.lineTo(x + w, y + h2);
                    g.lineTo(x - dt, y);
                }

                return true;
            };

            /**
             * Set gap.
             * @param {Integer} gap a gap
             * @chainable
             * @method setGap
             */
            this.setGap = function(gap) {
                this.gap = gap;
                return this;
            };

            this.paint = function(g, x, y, w, h, d) {
                this.outline(g, x, y, w, h, d);
                g.setColor(this.color);
                g.lineWidth = this.lineWidth;

                if (this.fill === true) {
                    g.fill();
                } else {
                    g.stroke();
                }
            };

            this.getPreferredSize = function () {
                return { width  : this.width  + this.gap * 2,
                         height : this.height + this.gap * 2 };
            };
        }
    ]);

    pkg.TabBorder = Class(pkg.View, [
        function(t, w) {
            if (arguments.length > 1) {
                this.width  = w;
            }

            if (arguments.length > 0) {
                this.state = t;
            }

            this.left = this.top = this.bottom = this.right = 6 + this.width;
        },

        function $prototype() {
            this.state  = "out";
            this.width  = 1;

            this.fillColor1 = "#DCF0F7";
            this.fillColor2 = "white";
            this.fillColor3 = "#F3F3F3";

            this.onColor1 = "black";
            this.onColor2 = "#D9D9D9";
            this.offColor = "#A1A1A1";


            this.paint = function(g,x,y,w,h,d){
                var xx = x + w - 1,
                    yy = y + h - 1,
                    o  = d.parent.orient,
                    t  = this.state,
                    s  = this.width,
                    ww = 0,
                    hh = 0,
                    dt = s / 2;

                g.beginPath();
                g.lineWidth = s;
                switch(o) {
                    case "left":
                        g.moveTo(xx + 1, y + dt);
                        g.lineTo(x + s * 2, y + dt);
                        g.lineTo(x + dt , y + s * 2);
                        g.lineTo(x + dt, yy - s * 2 + dt);
                        g.lineTo(x + s * 2, yy + dt);
                        g.lineTo(xx + 1, yy + dt);

                        if (d.isEnabled === true){
                            g.setColor(t === "over" ? this.fillColor1 : this.fillColor2);
                            g.fill();
                        }

                        g.setColor((t === "selected" || t === "over") ? this.onColor1 : this.offColor);
                        g.stroke();

                        if (d.isEnabled === true) {
                            ww = Math.floor((w - 6) / 2);
                            g.setColor(this.fillColor3);
                            g.fillRect(xx - ww + 1, y + s, ww, h - s - 1);
                        }

                        if (t === "out") {
                            g.setColor(this.onColor2);
                            g.drawLine(x + 2*s + 1, yy - s, xx + 1, yy - s, s);
                        }
                        break;
                    case "right":
                        xx -= dt; // thick line grows left side and right side proportionally
                                  // correct it

                        g.moveTo(x, y + dt);
                        g.lineTo(xx - 2 * s, y + dt);

                        g.lineTo(xx, y + 2 * s);
                        g.lineTo(xx, yy - 2 * s);
                        g.lineTo(xx - 2 * s, yy + dt);
                        g.lineTo(x, yy + dt);

                        if (d.isEnabled === true){
                            g.setColor(t === "over" ? this.fillColor1 : this.fillColor2);
                            g.fill();
                        }

                        g.setColor((t === "selected" || t === "over") ? this.onColor1 : this.offColor);
                        g.stroke();

                        if (d.isEnabled === true) {
                            ww = Math.floor((w - 6) / 2);
                            g.setColor(this.fillColor3);
                            g.fillRect(x, y + s, ww, h - s - 1);
                        }

                        if (t === "out") {
                            g.setColor(this.onColor2);
                            g.drawLine(x, yy - s, xx - s - 1, yy - s, s);
                        }
                        break;
                    case "top":
                        g.moveTo(x + dt, yy + 1 );
                        g.lineTo(x + dt, y + s*2);
                        g.lineTo(x + s * 2, y + dt);
                        g.lineTo(xx - s * 2 + s, y + dt);
                        g.lineTo(xx + dt, y + s * 2);
                        g.lineTo(xx + dt, yy + 1);

                        if (d.isEnabled === true){
                            g.setColor(t === "over" ? this.fillColor1 : this.fillColor2);
                            g.fill();
                        }

                        g.setColor((t === "selected" || t === "over") ? this.onColor1 : this.offColor);
                        g.stroke();

                        if (d.isEnabled === true){
                            g.setColor(this.fillColor3);
                            hh = Math.floor((h - 6) / 2);
                            g.fillRect(x + s, yy - hh + 1 , w - s - 1, hh);
                        }

                        if (t === "selected") {
                            g.setColor(this.onColor2);
                            g.beginPath();
                            g.moveTo(xx + dt - s, yy + 1);
                            g.lineTo(xx + dt - s, y + s * 2);
                            g.stroke();
                        }

                        break;
                    case "bottom":
                        yy -= dt;

                        g.moveTo(x + dt, y);
                        g.lineTo(x + dt, yy - 2 * s);
                        g.lineTo(x + 2 * s + dt, yy);
                        g.lineTo(xx - 2 * s, yy);
                        g.lineTo(xx + dt, yy - 2 * s);
                        g.lineTo(xx + dt, y);

                        if (d.isEnabled === true){
                            g.setColor(t === "over" ? this.fillColor1 : this.fillColor2);
                            g.fill();
                        }

                        g.setColor((t === "selected" || t === "over") ? this.onColor1 : this.offColor);
                        g.stroke();

                        if (d.isEnabled === true){
                            g.setColor(this.fillColor3);
                            hh = Math.floor((h - 6) / 2);
                            g.fillRect(x + s, y, w - s - 1, hh);
                        }

                        if (t === "selected") {
                            g.setColor(this.onColor2);
                            g.beginPath();
                            g.moveTo(xx + dt - s, y);
                            g.lineTo(xx + dt - s, yy - s - 1);
                            g.stroke();
                        }
                        break;
                    default: throw new Error("Invalid tab alignment");
                }
            };

            this.getTop    = function () { return this.top;   };
            this.getBottom = function () { return this.bottom;};
            this.getLeft   = function () { return this.left;  };
            this.getRight  = function () { return this.right; };
        }
    ]);

    /**
     * The check box ticker view.
     * @class  zebkit.draw.CheckboxView
     * @extends zebkit.draw.View
     * @constructor
     * @param {String} [color] color of the ticker
     */
    pkg.CheckboxView = Class(pkg.View, [
        function(color) {
            if (arguments.length > 0) {
                this.color = color;
            }
        },

        function $prototype() {
            /**
             * Ticker color.
             * @attribute color
             * @type {String}
             * @readOnly
             * @default "rgb(65, 131, 255)"
             */
            this.color = "rgb(65, 131, 255)";

            this.paint = function(g,x,y,w,h,d){
                g.beginPath();
                g.strokeStyle = this.color;
                g.lineWidth = 2;
                g.moveTo(x + 1, y + 2);
                g.lineTo(x + w - 3, y + h - 3);
                g.stroke();
                g.beginPath();
                g.moveTo(x + w - 2, y + 2);
                g.lineTo(x + 2, y + h - 2);
                g.stroke();
                g.lineWidth = 1;
            };
        }
    ]);

    /**
     * Thumb element view.
     * @class  zebkit.draw.ThumbView
     * @extends {zebkit.draw.View}
     * @constructor
     * @param  {String} [dir]  a direction
     * @param  {String} [fillColor] a fill color
     */
    pkg.ThumbView = Class(pkg.View, [
        function(dir, fillColor) {
            if (arguments.length > 0) {
                this.direction = zebkit.util.validateValue(dir, "vertical", "horizontal");
                if (arguments.length > 1) {
                    this.fillColor = fillColor;
                }
            }
        },

        function $prototype() {
            /**
             * Fill color.
             * @attribute fillColor
             * @type {String}
             * @default "#AAAAAA"
             */
            this.fillColor = "#AAAAAA";

            /**
             * Direction.
             * @attribute direction
             * @type {String}
             * @default "vertical"
             */
            this.direction = "vertical";

            this.paint =  function(g,x,y,w,h,d) {
                g.beginPath();

                var  r = 0;
                if (this.direction === "vertical") {
                    r = w / 2;
                    g.arc(x + r, y + r, r, Math.PI, 0, false);
                    g.lineTo(x + w, y + h - r);
                    g.arc(x + r, y + h - r, r, 0, Math.PI, false);
                    g.lineTo(x, y + r);
                } else {
                    r = h / 2;
                    g.arc(x + r, y + r, r, 0.5 * Math.PI, 1.5 * Math.PI, false);
                    g.lineTo(x + w - r, y);
                    g.arc(x + w - r, y + h - r, r, 1.5 * Math.PI, 0.5 * Math.PI, false);
                    g.lineTo(x + r, y + h);
                }
                g.setColor(this.fillColor);
                g.fill();
            };
        }
    ]);

    /**
     * The radio button ticker view.
     * @class  zebkit.draw.RadioView
     * @extends zebkit.draw.View
     * @constructor
     * @param {String} [outerColor] color one to fill the outer circle
     * @param {String} [innerColor] color tow to fill the inner circle
     */
    pkg.RadioView = Class(pkg.View, [
        function(outerColor, innerColor) {
            if (arguments.length > 0) {
                this.outerColor = outerColor;
                if (arguments.length > 1) {
                    this.innerColor = innerColor;
                }
            }
        },

        function $prototype() {
            /**
             * Outer circle filling color.
             * @attribute outerColor
             * @readOnly
             * @default "rgb(15, 81, 205)"
             * @type {String}
             */
            this.outerColor = "rgb(15, 81, 205)";

            /**
             * Inner circle filling color.
             * @attribute innerColor
             * @readOnly
             * @default "rgb(65, 131, 255)"
             * @type {String}
             */
            this.innerColor = "rgb(65, 131, 255)";

            this.paint = function(g,x,y,w,h,d){
                g.beginPath();
                if (g.fillStyle !== this.outerColor) {
                    g.fillStyle = this.outerColor;
                }
                g.arc(Math.floor(x + w/2), Math.floor(y + h/2) , Math.floor(w/3 - 0.5), 0, 2 * Math.PI, 1, false);
                g.fill();

                g.beginPath();
                if (g.fillStyle !== this.innerColor) {
                    g.fillStyle = this.innerColor;
                }
                g.arc(Math.floor(x + w/2), Math.floor(y + h/2) , Math.floor(w/4 - 0.5), 0, 2 * Math.PI, 1, false);
                g.fill();
            };
        }
    ]);

    /**
     * Toggle view element class
     * @class  zebkit.draw.ToggleView
     * @extends zebkit.draw.View
     * @constructor
     * @param  {Boolean} [plus] indicates the sign type plus (true) or minus (false)
     * @param  {String}  [color] a color
     * @param  {String}  [bg] a background
     * @param  {Integer} [w] a width
     * @param  {Integer} [h] a height
     * @param  {zebkit.draw.View | String}  [br] a border view
     */
    pkg.ToggleView = Class(pkg.View, [
        function(plus, color, bg, w, h, br) {
            if (arguments.length > 0) {
                this.plus = plus;
                if (arguments.length > 1) {
                    this.color = color;
                    if (arguments.length > 2) {
                        this.bg = bg;
                        if (arguments.length > 3) {
                            this.width = this.height = w;
                            if (arguments.length > 4) {
                                this.height = h;
                                if (arguments.length > 5) {
                                    this.br = pkg.$view(br);
                                }
                            }
                        }
                    }
                }
            }
        },

        function $prototype() {
            this.color = "white";
            this.bg    = "lightGray";
            this.plus  = false;
            this.br    = new pkg.Border("rgb(65, 131, 215)", 1, 3);
            this.width = this.height = 12;

            this.paint = function(g, x, y, w, h, d) {
                if (this.bg !== null && (this.br === null || this.br.outline(g, x, y, w, h, d) === false)) {
                    g.beginPath();
                    g.rect(x, y, w, h);
                }

                if (this.bg !== null) {
                    g.setColor(this.bg);
                    g.fill();
                }

                if (this.br !== null) {
                    this.br.paint(g, x, y, w, h, d);
                }

                g.setColor(this.color);
                g.lineWidth = 2;
                x += 2;
                w -= 4;
                h -= 4;
                y += 2;

                g.beginPath();
                g.moveTo(x, y + h / 2);
                g.lineTo(x + w, y + h / 2);
                if (this.plus) {
                    g.moveTo(x + w / 2, y);
                    g.lineTo(x + w / 2, y + h);
                }

                g.stroke();
                g.lineWidth = 1;
            };

            this.getPreferredSize = function() {
                return { width:this.width, height:this.height };
            };
        }
    ]);

    pkg.CaptionBgView = Class(pkg.View, [
        function(bg, gap, radius) {
            if (arguments.length > 0) {
                this.bg = bg;
                if (arguments.length > 1) {
                    this.gap = gap;

                    if (arguments.length > 2) {
                        this.radius = radius;
                    }
                }
            }
        },

        function $prototype() {
            this.gap    = 6;
            this.radius = 6;
            this.bg      = "#66CCFF";

            this.paint = function(g,x,y,w,h,d) {
                this.outline(g,x,y,w,h,d);
                g.setColor(this.bg);
                g.fill();
            };

            this.outline = function(g,x,y,w,h,d) {
                g.beginPath();
                g.moveTo(x + this.radius, y);
                g.lineTo(x + w - this.radius*2, y);
                g.quadraticCurveTo(x + w, y, x + w, y + this.radius);
                g.lineTo(x + w, y + h);
                g.lineTo(x, y + h);
                g.lineTo(x, y + this.radius);
                g.quadraticCurveTo(x, y, x + this.radius, y);
                return true;
            };
        }
    ]);

    // TODO: not sure it makes sense to put here
    // a bit dirty implementation
    pkg.CloudView = Class(pkg.Shape, [
        function outline(g,x,y,w,h,d) {
            g.beginPath();
            g.moveTo(x + w * 0.2, y  +  h * 0.25);
            g.bezierCurveTo(x, y + h*0.25, x, y + h*0.75, x + w * 0.2, y + h*0.75);
            g.bezierCurveTo(x + 0.1 * w, y + h - 1 , x + 0.8*w, y + h - 1, x + w * 0.7, y + h*0.75);
            g.bezierCurveTo(x + w - 1, y + h * 0.75 , x + w - 1, y, x + w * 0.65, y + h*0.25) ;
            g.bezierCurveTo(x + w - 1, y, x + w * 0.1, y, x + w * 0.2, y + h * 0.25) ;
            g.closePath();
            return true;
        }
    ]);

    pkg.FunctionRender = Class(pkg.Render, [
        function(fn, x1, x2) {
            this.$super(fn);
            this.setRange(x1, x2);
            if (arguments.length > 3) {
                this.granularity = arguments[3];
            }
        },

        function $prototype(g,x,y,w,h,c) {
            this.granularity = 200;
            this.color       = "orange";
            this.lineWidth   = 2;

            this.$fy = null;

            this.valueWasChanged = function(o, n) {
                if (n !== null && typeof n !== 'function') {
                    throw new Error("Function is expected");
                }
                this.$fy = null;
            };

            this.setGranularity = function(g) {
                if (g !== this.granularity) {
                    this.granularity = g;
                    this.$fy = null;
                }
            };

            this.setRange = function(x1, x2) {
                if (x1 > x2) {
                    throw new RangeError("Incorrect range interval");
                }

                if (this.x1 !== x1 || this.x2 !== x2) {
                    this.x1 = x1;
                    this.x2 = x2;
                    this.$fy = null;
                }
            };

            this.recalc = function() {
                if (this.$fy === null) {
                    this.$fy   = [];
                    this.$maxy = -100000000;
                    this.$miny =  100000000;
                    this.$dx   = (this.x2 - this.x1) / this.granularity;

                    for(var x = this.x1, i = 0; x <= this.x2; i++) {
                        this.$fy[i] = this.target(x);
                        if (this.$fy[i] > this.$maxy) {
                            this.$maxy = this.$fy[i];
                        }

                        if (this.$fy[i] < this.$miny) {
                            this.$miny = this.$fy[i];
                        }

                        x += this.$dx;
                    }
                }
            };

            this.paint = function(g,x,y,w,h,c) {
                if (this.target !== null) {
                    this.recalc();

                    var cx = (w - this.lineWidth * 2) / (this.x2 - this.x1),
                        cy = (h - this.lineWidth * 2) / (this.$maxy - this.$miny),
                        sx = this.x1 + this.$dx;

                    g.beginPath();
                    g.setColor(this.color);
                    g.lineWidth = this.lineWidth;
                    g.moveTo(this.lineWidth,
                             this.lineWidth + (this.$fy[0] - this.$miny) * cy);

                    //sx = (sx - this.x1)

                    for(var i = 1; i < this.$fy.length; i++) {
                        g.lineTo(this.lineWidth + (sx - this.x1) * cx,
                                 this.lineWidth + (this.$fy[i] - this.$miny)* cy);
                        sx += this.$dx;
                    }
                    g.stroke();
                }
            };
        }
    ]);


    pkg.Pentahedron =  Class(pkg.Shape, [
        function outline(g,x,y,w,h,d) {
            g.beginPath();
            x += this.lineWidth;
            y += this.lineWidth;
            w -= 2*this.lineWidth;
            h -= 2*this.lineWidth;
            g.moveTo(x + w/2, y);
            g.lineTo(x + w - 1, y + h/3);
            g.lineTo(x + w - 1 - w/3, y + h - 1);
            g.lineTo(x + w/3, y + h - 1);
            g.lineTo(x, y + h/3);
            g.lineTo(x + w/2, y);
            return true;
        }
    ]);

    /**
     * Base class to implement model values renders.
     * @param  {zebkit.draw.Render} [render] a render to visualize values.
     * By default string render is used.
     * @class zebkit.draw.BaseViewProvider
     * @constructor
     */
    pkg.BaseViewProvider = Class([
        function(render) {
            /**
             * Default render that is used to paint grid content.
             * @type {zebkit.draw.Render}
             * @attribute render
             * @readOnly
             * @protected
             */
            this.render = (arguments.length === 0 || typeof render === 'undefined' ? new zebkit.draw.StringRender("")
                                                                                   : render);
            zebkit.properties(this, this.clazz);
        },

        function $prototype() {
            /**
             * Set the default view provider font if defined render supports it
             * @param {zebkit.Font} f a font
             * @method setFont
             * @chainable
             */
            this.setFont = function(f) {
                if (typeof this.render.setFont !== 'undefined') {
                    this.render.setFont(f);
                }
                return this;
            };

            /**
             * Set the default view provider color if defined render supports it
             * @param {String} c a color
             * @method setColor
             * @chainable
             */
            this.setColor = function(c) {
                if (typeof this.render.setColor !== 'undefined') {
                    this.render.setColor(c);
                }
                return this;
            };

            /**
             * Get a view to render the specified value of the target component.
             * @param  {Object} target a target  component
             * @param  {Object} [arg]* arguments list
             * @param  {Object} obj a value to be rendered
             * @return {zebkit.draw.View}  an instance of view to be used to
             * render the given value
             * @method  getView
             */
            this.getView = function(target) {
                var obj = arguments[arguments.length - 1];
                if (obj !== null && typeof obj !== 'undefined') {
                    if (typeof obj.toView !== 'undefined') {
                        return obj.toView();
                    } else if (typeof obj.paint !== 'undefined') {
                        return obj;
                    } else {
                        this.render.setValue(obj.toString());
                        return this.render;
                    }
                } else {
                    return null;
                }
            };
        }
    ]);
});
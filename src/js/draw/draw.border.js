zebkit.package("draw", function(pkg, Class) {
    /**
    * Sunken border view
    * @class zebkit.draw.Sunken
    * @constructor
    * @param {String} [brightest] a brightest border line color
    * @param {String} [moddle] a middle border line color
    * @param {String} [darkest] a darkest border line color
    * @extends zebkit.draw.View
    */
    pkg.Sunken = Class(pkg.View, [
        function (brightest,middle,darkest) {
            if (arguments.length > 0) {
                this.brightest = brightest;
                if (arguments.length > 1) {
                    this.middle = middle;
                    if (arguments.length > 2) {
                        this.darkest   = darkest;
                    }
                }
            }
        },

        function $prototype() {
            /**
             * Brightest border line color
             * @attribute brightest
             * @readOnly
             * @type {String}
             * @default "white"
             */

            /**
             * Middle border line color
             * @attribute middle
             * @readOnly
             * @type {String}
             * @default "gray"
             */

            /**
             * Darkest border line color
             * @attribute darkest
             * @readOnly
             * @type {String}
             * @default "black"
             */
            this.brightest = "white";
            this.middle    = "gray" ;
            this.darkest   = "black";

            this.paint = function(g,x1,y1,w,h,d){
                var x2 = x1 + w - 1, y2 = y1 + h - 1;
                g.setColor(this.middle);
                g.drawLine(x1, y1, x2 - 1, y1);
                g.drawLine(x1, y1, x1, y2 - 1);
                g.setColor(this.brightest);
                g.drawLine(x2, y1, x2, y2 + 1);
                g.drawLine(x1, y2, x2, y2);
                g.setColor(this.darkest);
                g.drawLine(x1 + 1, y1 + 1, x1 + 1, y2);
                g.drawLine(x1 + 1, y1 + 1, x2, y1 + 1);
            };
        }
    ]);

    /**
    * Etched border view
    * @class zebkit.draw.Etched
    * @constructor
    * @param {String} [brightest] a brightest border line color
    * @param {String} [moddle] a middle border line color
    * @extends zebkit.draw.View
    */
    pkg.Etched = Class(pkg.View, [
        function (brightest, middle) {
            if (arguments.length > 0) {
                this.brightest = brightest;
                if (arguments.length > 1) {
                    this.middle = middle;
                }
            }
        },

        function $prototype() {
            /**
             * Brightest border line color
             * @attribute brightest
             * @readOnly
             * @type {String}
             * @default "white"
             */

            /**
             * Middle border line color
             * @attribute middle
             * @readOnly
             * @type {String}
             * @default "gray"
             */
            this.brightest = "white";
            this.middle    = "gray" ;

            this.paint = function(g,x1,y1,w,h,d){
                var x2 = x1 + w - 1, y2 = y1 + h - 1;
                g.setColor(this.middle);
                g.drawLine(x1, y1, x1, y2 - 1);
                g.drawLine(x2 - 1, y1, x2 - 1, y2);
                g.drawLine(x1, y1, x2, y1);
                g.drawLine(x1, y2 - 1, x2 - 1, y2 - 1);

                g.setColor(this.brightest);
                g.drawLine(x2, y1, x2, y2);
                g.drawLine(x1 + 1, y1 + 1, x1 + 1, y2 - 1);
                g.drawLine(x1 + 1, y1 + 1, x2 - 1, y1 + 1);
                g.drawLine(x1, y2, x2 + 1, y2);
            };
        }
    ]);

    /**
    * Raised border view
    * @class zebkit.draw.Raised
    * @param {String} [brightest] a brightest border line color
    * @param {String} [middle] a middle border line color
    * @constructor
    * @extends zebkit.draw.View
    */
    pkg.Raised = Class(pkg.View, [
        function(brightest, middle) {
            /**
             * Brightest border line color
             * @attribute brightest
             * @readOnly
             * @type {String}
             * @default "white"
             */

            /**
             * Middle border line color
             * @attribute middle
             * @readOnly
             * @type {String}
             * @default "gray"
             */

            if (arguments.length > 0) {
                this.brightest = brightest;
                if (arguments.length > 1) {
                    this.middle = middle;
                }
            }
        },

        function $prototype() {
            this.brightest = "white";
            this.middle    = "gray";

            this.paint = function(g,x1,y1,w,h,d){
                var x2 = x1 + w - 1, y2 = y1 + h - 1;
                g.setColor(this.brightest);
                g.drawLine(x1, y1, x2, y1);
                g.drawLine(x1, y1, x1, y2);
                g.setColor(this.middle);
                g.drawLine(x2, y1, x2, y2 + 1);
                g.drawLine(x1, y2, x2, y2);
            };
        }
    ]);

    /**
    * Dotted border view
    * @class zebkit.draw.Dotted
    * @param {String} [c] the dotted border color
    * @constructor
    * @extends zebkit.draw.View
    */
    pkg.Dotted = Class(pkg.View, [
        function (c){
            if (arguments.length > 0) {
                this.color = c;
            }
        },

        function $prototype() {
            /**
             * @attribute color
             * @readOnly
             * @type {String}
             * @default "black"
             */
            this.color = "black";

            this.paint = function(g,x,y,w,h,d){
                g.setColor(this.color);
                g.drawDottedRect(x, y, w, h);
            };
        }
    ]);

    /**
     * Border view. Can be used to render CSS-like border. Border can be applied to any
     * zebkit UI component by calling setBorder method:

            // create label component
            var lab = new zebkit.ui.Label("Test label");

            // set red border to the label component
            lab.setBorder(new zebkit.draw.Border("red"));

     * @param  {String}  [c] border color
     * @param  {Integer} [w] border width
     * @param  {Integer} [r] border corners radius
     * @constructor
     * @class zebkit.draw.Border
     * @extends zebkit.draw.View
     */
    pkg.Border = Class(pkg.View, [
        function(c, w, r) {
            if (arguments.length > 0) {
                this.color = c;
                if (arguments.length > 1) {
                    this.width = this.gap = w;
                    if (arguments.length > 2) {
                        this.radius = r;
                    }
                }
            }
        },

        function $prototype() {
            /**
             * Border color
             * @attribute color
             * @readOnly
             * @type {String}
             * @default "gray"
             */

            /**
             * Border line width
             * @attribute width
             * @readOnly
             * @type {Integer}
             * @default 1
             */

            /**
             * Border radius
             * @attribute radius
             * @readOnly
             * @type {Integer}
             * @default 0
             */

            this.color  = "gray";
            this.gap    = this.width = 1;
            this.radius = 0;
            this.sides  = 15;

            /**
             * Control border sides visibility.
             * @param {String} side*  list of visible sides. You can pass number of arguments
             * to say which sides of the border are visible. The arguments can equal one of the
             * following value: "top", "bottom", "left", "right"
             * @method  setSides
             * @chainable
             */
            this.setSides = function(top, left, bottom, right) {
                this.sides = 0;
                for(var i = 0; i < arguments.length; i++) {
                    if (arguments[i] === "top") {
                        this.sides  |= 1;
                    } else if (arguments[i] === "left") {
                        this.sides  |= 2;
                    } else if (arguments[i] === "bottom") {
                        this.sides  |= 4;
                    } else if (arguments[i] === "right" ) {
                        this.sides  |= 8;
                    }
                }

                return this;
            };

            this.paint = function(g,x,y,w,h,d){
                if (this.color !== null && this.width > 0) {
                    var ps = g.lineWidth;

                    if (g.lineWidth !== this.width) {
                        g.lineWidth = this.width;
                    }

                    if (this.radius > 0) {
                        this.outline(g,x,y,w,h, d);
                        g.setColor(this.color);
                        g.stroke();
                    } else if (this.sides !== 15) {
                        g.setColor(this.color);
                        // top
                        if ((this.sides & 1) > 0) {
                            g.drawLine(x, y, x + w, y, this.width);
                        }

                        // right
                        if ((this.sides & 8) > 0) {
                            g.drawLine(x + w - this.width, y, x + w - this.width, y + h, this.width);
                        }

                        // bottom
                        if ((this.sides & 4) > 0) {
                            g.drawLine(x, y + h - this.width, x + w, y + h - this.width, this.width);
                        }

                        // left
                        if ((this.sides & 2) > 0) {
                            g.drawLine(x, y, x, y + h, this.width);
                        }
                    } else {
                        var dt = this.width / 2;
                        g.beginPath();
                        g.rect(x + dt, y + dt, w - this.width, h - this.width);
                        g.closePath();
                        g.setColor(this.color);
                        g.stroke();
                    }

                    if (g.lineWidth !== ps) {
                        g.lineWidth = ps;
                    }
                }
            };

            /**
             * Defines border outline for the given 2D Canvas context
             * @param  {CanvasRenderingContext2D} g
             * @param  {Integer} x x coordinate
             * @param  {Integer} y y coordinate
             * @param  {Integer} w required width
             * @param  {Integer} h required height
             * @param  {Integer} d target UI component
             * @method outline
             * @return {Boolean} true if the outline has to be applied as an
             * UI component shape
             */
            this.outline = function(g,x,y,w,h,d) {
                if (this.radius <= 0) {
                    return false;
                }

                var r  = this.radius,
                    dt = this.width / 2,
                    xx = x + w - dt,
                    yy = y + h - dt;

                x += dt;
                y += dt;

                // !!! this code can work improperly in IE 10 in Vista !
                // g.beginPath();
                // g.moveTo(x+r, y);
                // g.arcTo(xx, y, xx, yy, r);
                // g.arcTo(xx, yy, x, yy, r);
                // g.arcTo(x, yy, x, y, r);
                // g.arcTo(x, y, xx, y, r);
                // g.closePath();
                // return true;

                g.beginPath();
                g.moveTo(x + r, y);
                g.lineTo(xx - r, y);
                g.quadraticCurveTo(xx, y, xx, y + r);
                g.lineTo(xx, yy  - r);
                g.quadraticCurveTo(xx, yy, xx - r, yy);
                g.lineTo(x + r, yy);
                g.quadraticCurveTo(x, yy, x, yy - r);
                g.lineTo(x, y + r);
                g.quadraticCurveTo(x, y, x + r, y);
                g.closePath();
                return true;
            };
        }
    ]);

    /**
     * Round border view.
     * @param  {String}  [col] border color. Use null as the
     * border color value to prevent painting of the border
     * @param  {Integer} [width] border width
     * @constructor
     * @class zebkit.draw.RoundBorder
     * @extends zebkit.draw.View
     */
    pkg.RoundBorder = Class(pkg.View, [
        function(col, width) {
            if (arguments.length > 0) {
                if (zebkit.isNumber(col)) {
                    this.width = col;
                } else {
                    this.color = col;
                    if (zebkit.isNumber(width)) {
                        this.width = width;
                    }
                }
            }
            this.gap = this.width;
        },

        function $prototype() {
            /**
             * Border width
             * @attribute width
             * @readOnly
             * @type {Integer}
             * @default 1
             */
            this.width = 1;

            /**
             * Border color
             * @attribute color
             * @readOnly
             * @type {String}
             * @default null
             */
            this.color = null;

            /**
             * Color to fill the inner area surrounded with the round border.
             * @attribute fillColor
             * @type {String}
             * @default null
             */
            this.fillColor = null;

            this.paint = function(g,x,y,w,h,d) {
                if (this.color !== null && this.width > 0) {
                    this.outline(g,x,y,w,h,d);
                    g.setColor(this.color);
                    g.stroke();
                    if (this.fillColor !== null) {
                       g.setColor(this.fillColor);
                       g.fill();
                    }
                }
            };

            this.outline = function(g,x,y,w,h,d) {
                g.lineWidth = this.width;
                if (w === h) {
                    g.beginPath();
                    g.arc(Math.floor(x + w / 2) + (w % 2 === 0 ? 0 : 0.5),
                          Math.floor(y + h / 2) + (h % 2 === 0 ? 0 : 0.5),
                          Math.floor((w - g.lineWidth) / 2), 0, 2 * Math.PI, false);
                    g.closePath();
                } else {
                    g.ovalPath(x,y,w,h);
                }
                return true;
            };

            this.getPreferredSize = function() {
                var s = this.width * 8;
                return  {
                    width : s, height : s
                };
            };
        }
    ]);

    /**
     * Render class that allows developers to render a border with a title area.
     * The title area has to be specified by an UI component that uses the border
     * by defining "getTitleInfo()"" method. The method has to return object that
     * describes title size, location and alignment:
     *
     *
     *      {
     *        x: {Integer}, y: {Integer},
     *        width: {Integer}, height: {Integer},
     *        orient: {Integer}
     *      }
     *
     *
     * @class zebkit.draw.TitledBorder
     * @extends zebkit.draw.Render
     * @constructor
     * @param zebkit.draw.View border  a border to be rendered with a title area
     * @param {String} [lineAlignment] a line alignment. Specifies how
     * a title area has to be aligned relatively border line:
     *
     *       "bottom"  - title area will be placed on top of border line:
     *                    ___| Title area |___
     *
     *
     *      "center"   - title area will be centered relatively to border line:
     *                    ---| Title area |-----
     *
     *
     *      "top"      - title area will be placed underneath of border line:
     *                     ____              ________
     *                         |  Title area |
     *
     */
    pkg.TitledBorder = Class(pkg.Render, [
        function (b, a){
            if (arguments.length > 1) {
                this.lineAlignment = zebkit.util.$validateValue(a, "bottom", "top", "center");
            }

            this.setValue(pkg.$view(b));
        },

        function $prototype() {
            this.lineAlignment = "bottom";

            this.getTop  = function (){
                return this.target.getTop();
            };

            this.getLeft = function (){
                return this.target.getLeft();
            };

            this.getRight = function (){
                return this.target.getRight();
            };

            this.getBottom = function (){
                return this.target.getBottom();
            };

            this.outline = function (g,x,y,w,h,d) {
                var xx = x + w, yy = y + h;
                if (typeof d.getTitleInfo !== 'undefined') {
                    var r = d.getTitleInfo();
                    if (r !== null) {
                        switch(r.orient) {
                            case "bottom":
                                var bottom = this.target.getBottom();
                                switch (this.lineAlignment) {
                                    case "center" : yy = r.y + Math.floor((r.height - bottom)/ 2) + bottom; break;
                                    case "top"    : yy = r.y + r.height + bottom; break;
                                    case "bottom" : yy = r.y; break;
                                }
                                break;
                            case "top":
                                var top = this.target.getTop();
                                switch (this.lineAlignment) {
                                    case "center" : y = r.y + Math.floor((r.height - top)/2);   break; // y = r.y + Math.floor(r.height/ 2) ; break;
                                    case "top"    : y = r.y - top; break;
                                    case "bottom" : y = r.y + r.height; break;
                                }
                                break;
                            case "left":
                                var left = this.target.getLeft();
                                switch (this.lineAlignment) {
                                    case "center" : x = r.x + Math.floor((r.width - left) / 2); break;
                                    case "top"    : x = r.x - left; break;
                                    case "bottom" : x = r.x + r.width; break;
                                }
                                break;
                            case "right":
                                var right = this.target.getRight();
                                switch (this.lineAlignment) {
                                    case "center" : xx = r.x + Math.floor((r.width - right) / 2) + right; break;
                                    case "top"    : xx = r.x + r.width + right; break;
                                    case "bottom" : xx = r.x; break;
                                }
                                break;
                        }
                    }
                }

                if (this.target !== null &&
                    typeof this.target.outline !== 'undefined' &&
                    this.target.outline(g, x, y, xx - x, yy - y, d) === true)
                {
                    return true;
                }

                g.beginPath();
                g.rect(x, y, xx - x, yy - y);
                g.closePath();
                return true;
            };

            this.$isIn = function(clip, x, y, w, h) {
                var rx = clip.x > x ? clip.x : x,
                    ry = clip.y > y ? clip.y : y,
                    rw = Math.min(clip.x + clip.width, x + w) - rx,
                    rh = Math.min(clip.y + clip.height, y + h) - ry;
                return (clip.x === rx && clip.y === ry && clip.width === rw && clip.height === rh);
            };

            this.paint = function(g,x,y,w,h,d){
                if (typeof d.getTitleInfo !== 'undefined'){
                    var r = d.getTitleInfo();
                    if (r !== null) {
                        var xx = x + w, yy = y + h, t = g.$states[g.$curState];
                        switch (r.orient) {
                            case "top":
                                var top = this.target.getTop();
                                // compute border y
                                switch (this.lineAlignment) {
                                    case "center" : y = r.y + Math.floor((r.height - top) / 2) ; break;
                                    case "top"    : y = r.y - top; break;
                                    case "bottom" : y = r.y + r.height; break;
                                }

                                // skip rendering border if the border is not in clip rectangle
                                // This is workaround because of IE10/IE11 have bug what causes
                                // handling rectangular clip + none-rectangular clip side effect
                                // to "fill()" subsequent in proper working (fill without respect of
                                // clipping  area)
                                if (this.$isIn(t, x + this.target.getLeft(), y,
                                               w - this.target.getRight() - this.target.getLeft(),
                                               yy - y - this.target.getBottom()))
                                {
                                    return;
                                }

                                g.save();
                                g.beginPath();

                                g.moveTo(x, y);
                                g.lineTo(r.x, y);
                                g.lineTo(r.x, y + top);
                                g.lineTo(r.x + r.width, y + top);
                                g.lineTo(r.x + r.width, y);
                                g.lineTo(xx, y);
                                g.lineTo(xx, yy);
                                g.lineTo(x, yy);
                                g.lineTo(x, y);

                                break;
                            case "bottom":
                                var bottom = this.target.getBottom();
                                switch (this.lineAlignment) {
                                    case "center" : yy = r.y + Math.floor((r.height - bottom) / 2) + bottom; break;
                                    case "top"    : yy = r.y + r.height + bottom; break;
                                    case "bottom" : yy = r.y ; break;
                                }

                                if (this.$isIn(t, x + this.target.getLeft(), y + this.target.getTop(),
                                                  w - this.target.getRight() - this.target.getLeft(),
                                                  yy - y - this.target.getTop()))
                                {
                                    return;
                                }

                                g.save();
                                g.beginPath();

                                g.moveTo(x, y);
                                g.lineTo(xx, y);
                                g.lineTo(xx, yy);
                                g.lineTo(r.x + r.width, yy);
                                g.lineTo(r.x + r.width, yy - bottom);
                                g.lineTo(r.x, yy - bottom);
                                g.lineTo(r.x, yy);
                                g.lineTo(x, yy);
                                g.lineTo(x, y);

                                break;
                            case "left":
                                var left = this.target.getLeft();
                                switch (this.lineAlignment) {
                                    case "center" : x = r.x + Math.floor((r.width - left) / 2); break;
                                    case "top"    : x = r.x  - left; break;
                                    case "bottom" : x = r.x + r.width; break;
                                }

                                if (this.$isIn(t, x, y + this.target.getTop(),
                                               xx - x - this.target.getRight(),
                                               h - this.target.getTop() - this.target.getBottom()))
                                {
                                    return;
                                }

                                g.save();
                                g.beginPath();

                                g.moveTo(x, y);
                                g.lineTo(xx, y);
                                g.lineTo(xx, yy);
                                g.lineTo(x, yy);
                                g.lineTo(x, r.y + r.height);
                                g.lineTo(x + left, r.y + r.height);
                                g.lineTo(x + left, r.y);
                                g.lineTo(x, r.y);
                                g.lineTo(x, y);

                                break;
                            case "right":
                                var right = this.target.getRight();
                                switch (this.lineAlignment) {
                                    case "center" : xx = r.x + Math.floor((r.width - right) / 2) + right; break;
                                    case "top"    : xx = r.x  + r.width + right; break;
                                    case "bottom" : xx = r.x; break;
                                }

                                if (this.$isIn(t, x + this.target.getLeft(),
                                                  y + this.target.getTop(),
                                                  xx - x - this.target.getLeft(),
                                                  h - this.target.getTop() - this.target.getBottom()))
                                {
                                    return;
                                }

                                g.save();
                                g.beginPath();

                                g.moveTo(x, y);
                                g.lineTo(xx, y);
                                g.lineTo(xx, r.y);
                                g.lineTo(xx - right, r.y);
                                g.lineTo(xx - right, r.y + r.height);
                                g.lineTo(xx, r.y + r.height);
                                g.lineTo(xx, yy);
                                g.lineTo(x, yy);
                                g.lineTo(x, y);
                                break;
                            // throw error to avoid wrongly called restore method below
                            default: throw new Error("Invalid title orientation " + r.orient);
                        }

                        g.closePath();
                        g.clip();
                        this.target.paint(g, x, y, xx - x, yy - y, d);
                        g.restore();
                    }
                } else {
                    this.target.paint(g, x, y, w, h, d);
                }
            };
        }
    ]);
});
(function(pkg, Class) {

/**
 * @module  ui
 */
var L = zebkit.layout;

pkg.$view = function(v) {
    if (v == null || v.paint != null) return v;

    if (zebkit.isString(v)) {
        return zebkit.util.rgb.hasOwnProperty(v) ? zebkit.util.rgb[v]
                                     : (pkg.borders != null && pkg.borders.hasOwnProperty(v) ? pkg.borders[v]
                                                                                             : new zebkit.util.rgb(v));
    }

    if (Array.isArray(v)) {
        return new pkg.CompositeView(v);
    }

    if (typeof v !== 'function') {
        return new pkg.ViewSet(v);
    }

    var vv = new pkg.View();
    vv.paint = v;
    return vv;
};

/**
* Sunken border view
* @class zebkit.ui.Sunken
* @constructor
* @param {String} [brightest] a brightest border line color
* @param {String} [moddle] a middle border line color
* @param {String} [darkest] a darkest border line color
* @extends zebkit.ui.View
*/
pkg.Sunken = Class(pkg.View, [
    function (brightest,middle,darkest) {
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

        this.brightest = brightest == null ? "white"  : brightest;
        this.middle    = middle    == null ? "gray"   : middle;
        this.darkest   = darkest   == null ? "black"  : darkest;
    },

    function $prototype() {
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
* @class zebkit.ui.Etched
* @constructor
* @param {String} [brightest] a brightest border line color
* @param {String} [moddle] a middle border line color
* @extends zebkit.ui.View
*/
pkg.Etched = Class(pkg.View, [
    function (brightest, middle) {
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

        this.brightest = brightest == null ? "white" : brightest;
        this.middle    = middle    == null ? "gray"  : middle;
    },

    function $prototype() {
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
* @class zebkit.ui.Raised
* @param {String} [brightest] a brightest border line color
* @param {String} [middle] a middle border line color
* @constructor
* @extends zebkit.ui.View
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

        this.brightest = brightest == null ? "white" : brightest;
        this.middle    = middle    == null ? "gray"  : middle;
    },

    function $prototype() {
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
* @class zebkit.ui.Dotted
* @param {String} [c] the dotted border color
* @constructor
* @extends zebkit.ui.View
*/
pkg.Dotted = Class(pkg.View, [
    function $prototype() {
        this.color = "black";

        this.paint = function(g,x,y,w,h,d){
            g.setColor(this.color);
            g.drawDottedRect(x, y, w, h);
        };

        this[''] = function (c){
            /**
             * @attribute color
             * @readOnly
             * @type {String}
             * @default "black"
             */
            if (c != null) this.color = c;
        };
    }
]);

/**
 * Border view. Can be used to render CSS-like border. Border can be applied to any
 * zebkit UI component by calling setBorder method:

        // create label component
        var lab = new zebkit.ui.Label("Test label");

        // set red border to the label component
        lab.setBorder(new zebkit.ui.Border("red"));

 * @param  {String}  [c] border color
 * @param  {Integer} [w] border width
 * @param  {Integer} [r] border corners radius
 * @constructor
 * @class zebkit.ui.Border
 * @extends zebkit.ui.View
 */
pkg.Border = Class(pkg.View, [
    function $prototype() {
        this.color  = "gray";
        this.gap    = this.width = 1;
        this.radius = 0;

        this.paint = function(g,x,y,w,h,d){
            if (this.color != null && this.width > 0) {
                var ps = g.lineWidth;

                if (g.lineWidth !== this.width) {
                    g.lineWidth = this.width;
                }

                if (this.radius > 0) {
                    this.outline(g,x,y,w,h, d);
                }
                else {
                    var dt = this.width / 2;
                    g.beginPath();
                    g.rect(x + dt, y + dt, w - this.width, h - this.width);
                    g.closePath();
                }

                g.setColor(this.color);
                g.stroke();

                if (g.lineWidth !== ps) g.lineWidth = ps;
            }
        };

        /**
         * Defines border outline for the given 2D Canvas context
         * @param  {2D Canvas context} g
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

        this[''] = function (c,w,r){
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

            if (c != null) this.color = c;
            if (w != null) this.width = this.gap = w;
            if (r != null) this.radius = r;
        };
    }
]);

/**
 * Round border view.
 * @param  {String}  [col] border color. Use null as the
 * border color value to prevent painting of the border
 * @param  {Integer} [width] border width
 * @constructor
 * @class zebkit.ui.RoundBorder
 * @extends zebkit.ui.View
 */
pkg.RoundBorder = Class(pkg.View, [
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

        this.paint =  function(g,x,y,w,h,d) {
            if (this.color != null && this.width > 0) {
                this.outline(g,x,y,w,h,d);
                g.setColor(this.color);
                g.stroke();
            }
        };

        this.outline = function(g,x,y,w,h,d) {
            g.beginPath();
            g.lineWidth = this.width;
            g.arc(Math.floor(x + w/2) + (w % 2 === 0 ? 0 :0.5),
                  Math.floor(y + h/2) + (h % 2 === 0 ? 0 :0.5),
                  Math.floor((w - g.lineWidth)/2), 0, 2 * Math.PI, false);
            g.closePath();
            return true;
        };

        this.getPreferredSize = function() {
            var s = this.lineWidth * 8;
            return  {
                width :s, height:s
            };
        };

        this[''] = function(col, width) {
            if (arguments.length > 0) {
                if (zebkit.isNumber(col)) this.width = col;
                else {
                    this.color = col;
                    if (zebkit.isNumber(width)) this.width = width;
                }
            }
            this.gap = this.width;
        };
    }
]);

/**
 *  UI component render class. Renders the given target UI component
 *  on the given surface using the specified 2D context
 *  @param {zebkit.ui.Panel} [target] an UI component to be rendered
 *  @class zebkit.ui.CompRender
 *  @constructor
 *  @extends zebkit.ui.Render
 */
pkg.CompRender = Class(pkg.Render, [
    function $prototype() {
        /**
         * Get preferred size of the render. The method doesn't calculates
         * preferred size it simply calls the target component "getPreferredSize"
         * method.
         * @method getPreferredSize
         * @return {Object} a preferred size
         *
         *      {width:<Integer>, height: <Integer>}
         */
        this.getPreferredSize = function(){
            return this.target == null || this.target.isVisible === false ? { width:0, height:0 }
                                                                          : this.target.getPreferredSize();
        };

        this.paint = function(g,x,y,w,h,d){
            var c = this.target;
            if (c != null && c.isVisible === true) {
                var prevW = -1, prevH = 0;
                if ((w != c.width || h != c.height) && c.getCanvas() == null){
                    prevW = c.width;
                    prevH = c.height;
                    c.setSize(w, h);
                }

                // validate should be done here since setSize can be called
                // above
                c.validate();

                g.translate(x, y);
                c.paintComponent(g);
                g.translate(-x, -y);

                if (prevW >= 0){
                    c.setSize(prevW, prevH);
                    c.validate();
                }
            }
        };
    }
]);

/**
* Vertical or horizontal linear gradient view
* @param {String} startColor start color
* @param {String} endColor end color
* @param {Integer|String} [type] type of gradient
* "zebkit.layout.VERTICAL" or "zebkit.layout.HORIZONTAL" or "vertical" or "horizontal"
* @constructor
* @class zebkit.ui.Gradient
* @extends zebkit.ui.View
*/
pkg.Gradient = Class(pkg.View, [
    function $prototype() {
        this.orientation = L.VERTICAL;

        this[''] =  function(){
            /**
             * Gradient orientation: vertical or horizontal
             * @attribute orientation
             * @readOnly
             * @default zebkit.layout.VERTICAL
             * @type {Integer}
             */

            /**
             * Gradient start and stop colors
             * @attribute colors
             * @readOnly
             * @type {Array}
             */

            this.colors = Array.prototype.slice.call(arguments, 0);
            if (arguments.length > 2) {
                this.orientation = L.$constraints(arguments[arguments.length-1]);
                this.colors.pop();
            }
        };

        this.paint = function(g,x,y,w,h,dd){
            var d = (this.orientation === L.HORIZONTAL? [0,1]: [1,0]),
                x1 = x * d[1],
                y1 = y * d[0],
                x2 = (x + w - 1) * d[1],
                y2 = (y + h - 1) * d[0];

            if (this.gradient == null || this.gx1 != x1 ||
                this.gx2 != x2        || this.gy1 != y1 ||
                this.gy2 != y2                             )
            {
                this.gx1 = x1;
                this.gx2 = x2;
                this.gy1 = y1;
                this.gy2 = y2;

                this.gradient = g.createLinearGradient(x1, y1, x2, y2);
                for(var i = 0; i < this.colors.length; i++) {
                    this.gradient.addColorStop(i, this.colors[i].toString());
                }
            }

            g.fillStyle = this.gradient;
            g.fillRect(x, y, w, h);
        };
    }
]);

/**
* Radial gradient view
* @param {String} startColor a start color
* @param {String} stopColor a stop color
* @constructor
* @class zebkit.ui.Radial
* @extends zebkit.ui.View
*/
pkg.Radial = Class(pkg.View, [
    function $prototype() {
        this[''] = function() {
            this.colors = Array.prototype.slice.call(arguments, 0);
        };

        this.paint = function(g,x,y,w,h,d){
            var cx1 = w/2, cy1 = h/2;
            this.gradient = g.createRadialGradient(cx1, cy1, 10, cx1, cy1, w > h ? w : h);

            for(var i=0; i < this.colors.length;i++) {
                this.gradient.addColorStop(i, this.colors[i].toString());
            }
            g.fillStyle = this.gradient;
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
* @class zebkit.ui.Picture
* @extends zebkit.ui.Render
*/
pkg.Picture = Class(pkg.Render, [
    function $prototype() {
        this[''] = function (img,x,y,w,h) {
            /**
             * A x coordinate of the image part that has to be rendered
             * @attribute x
             * @readOnly
             * @type {Integer}
             * @default 0
             */

            /**
             * A y coordinate of the image part that has to be rendered
             * @attribute y
             * @readOnly
             * @type {Integer}
             * @default 0
             */

            /**
             * A width  of the image part that has to be rendered
             * @attribute width
             * @readOnly
             * @type {Integer}
             * @default 0
             */

            /**
             * A height  of the image part that has to be rendered
             * @attribute height
             * @readOnly
             * @type {Integer}
             * @default 0
             */

            this.setTarget(img);
            if (arguments.length > 4) {
                this.x = x;
                this.y = y;
                this.width  = w;
                this.height = h;
            }
            else {
                this.x = this.y = this.width = this.height = 0;
            }
        };

        this.paint = function(g,x,y,w,h,d) {
            if (this.target != null && this.target.complete === true && this.target.naturalWidth > 0 && w > 0 && h > 0){
                if (this.width > 0) {
                    g.drawImage(this.target, this.x, this.y,
                                this.width, this.height, x, y, w, h);
                }
                else {
                    g.drawImage(this.target, x, y, w, h);
                }
            }
        };

        this.getPreferredSize = function(){
            var img = this.target;
            return (img == null ||
                    img.naturalWidth <= 0 ||
                    img.complete !== true) ? { width:0, height:0 }
                                           : (this.width > 0) ? { width:this.width, height:this.height }
                                                              : { width:img.width, height:img.height };
        };
    }
]);

/**
* Pattern render.
* @class zebkit.ui.Pattern
* @param {Image} [img] an image to be used as the pattern
* @constructor
* @extends zebkit.ui.Render
*/
pkg.Pattern = Class(pkg.Render, [
    function $prototype() {
        /**
         * Buffered pattern
         * @type {Pattern}
         * @protected
         * @attribute pattern
         * @readOnly
         */
        this.pattern = null;

        this.paint = function(g,x,y,w,h,d) {
            if (this.pattern == null) {
                this.pattern = g.createPattern(this.target, 'repeat');
            }
            g.beginPath();
            g.rect(x, y, w, h);
            g.closePath();
            g.fillStyle = this.pattern;
            g.fill();
        };

        this.targetWasChanged = function(o, n) {
            this.pattern = null;
        };
    }
]);

/**
* Composite view. The view allows developers to combine number of
* views and renders its together.
* @class zebkit.ui.CompositeView
* @param {Arrayt|Object} [views] array of dictionary of views
* to be composed together
* @constructor
* @extends zebkit.ui.View
*/
pkg.CompositeView = Class(pkg.View, [
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
            if (v.getLeft != null) {
                b = v.getLeft();
                if (b > this.left) this.left = b;
            }

            if (v.getRight != null) {
                b = v.getRight();
                if (b > this.right) this.right = b;
            }

            if (v.getTop != null) {
                b = v.getTop();
                if (b > this.top) this.top = b;
            }

            if (v.getBottom != null) {
                b = v.getBottom();
                if (b > this.bottom) this.bottom = b;
            }


            if (ps.width > this.width) this.width = ps.width;
            if (ps.height > this.height) this.height = ps.height;

            if (this.voutline == null && v.outline != null) {
                this.voutline = v;
            }
        };

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
                if (v != null && v.ownerChanged != null) {
                    v.ownerChanged(o);
                }
            });
        };

        this.paint = function(g,x,y,w,h,d) {
            for(var i=0; i < this.views.length; i++) {
                this.views[i].paint(g, x, y, w, h, d);
            }
        };

        this.outline = function(g,x,y,w,h,d) {
            return this.voutline != null && this.voutline.outline(g,x,y,w,h,d);
        };

        this[''] = function() {
            this.views = [];
            var args = arguments.length == 1 ? arguments[0] : arguments;
            for(var i = 0; i < args.length; i++) {
                this.views[i] = pkg.$view(args[i]);
                this.$recalc(this.views[i]);
            }
        };
    }
]);

/**
* ViewSet view. The view set is a special view container that includes
* number of views accessible by a key and allows only one view be active
* in a particular time. Active is view that has to be rendered. The view
* set can be used to store number of decorative elements where only one
* can be rendered depending from an UI component state.
* @param {Object} args object that represents views instances that have
* to be included in the ViewSet
* @constructor
* @class zebkit.ui.ViewSet
* @extends zebkit.ui.CompositeView
*/
pkg.ViewSet = Class(pkg.CompositeView, [
    function $prototype() {
        this.paint = function(g,x,y,w,h,d) {
            if (this.activeView != null) {
                this.activeView.paint(g, x, y, w, h, d);
            }
        };

        /**
         * Activate the given view from the given set.
         * @param  {String} id a key of a view from the set to be activated. Pass
         * null to make current view to undefined state
         * @return {Boolean} true if new view has been activated, false otherwise
         * @method activate
         */
        this.activate = function (id) {
            var old = this.activeView;

            if (id == null) {
                return (this.activeView = null) != old;
            }

            if (typeof this.views[id] !== 'undefined') {
                return (this.activeView = this.views[id]) != old;
            }

            if (id.length > 1 && id[0] !== '*' && id[id.length-1] !== '*') {
                var i = id.indexOf('.');
                if (i > 0) {
                    var k = id.substring(0, i + 1) + '*';
                    if (typeof this.views[k] !== 'undefined') {
                        return (this.activeView = this.views[k]) != old;
                    }

                    k = "*" + id.substring(i);
                    if (typeof this.views[k] !== 'undefined') {
                        return (this.activeView = this.views[k]) != old;
                    }
                }
            }

            return typeof this.views["*"] !== 'undefined' ? (this.activeView = this.views["*"]) != old
                                                          : false;
        };

        this.iterate = function(f) {
            for(var k in this.views) {
                f.call(this, k, this.views[k]);
            }
        };

        this[''] = function(args) {
            if (args == null) {
                throw new Error("" + args);
            }

            /**
             * Views set
             * @attribute views
             * @type Object
             * @default {}
             * @readOnly
            */
            this.views = {};

            /**
             * Active in the set view
             * @attribute activeView
             * @type View
             * @default null
             * @readOnly
            */
            this.activeView = null;

            for(var k in args) {
                this.views[k] = pkg.$view(args[k]);
                if (this.views[k] != null) this.$recalc(this.views[k]);
            }
            this.activate("*");
        };
    }
]);


pkg.LineView = Class(pkg.View, [
    function $prototype() {
        this.side      = L.TOP;
        this.color     = "black";
        this.lineWidth = 1;

        this[''] = function(side, color, lineWidth) {
            if (side != null)      this.side      = L.$constraints(side);
            if (color != null)     this.color     = color;
            if (lineWidth != null) this.lineWidth = lineWidth;
        };

        this.paint = function(g,x,y,w,h,d) {
            g.setColor(this.color);
            g.beginPath();
            g.lineWidth = this.lineWidth;

            var d = this.lineWidth / 2;
            if (this.side === L.TOP) {
                g.moveTo(x, y + d);
                g.lineTo(x + w - 1, y + d);
            }
            else {
                if (this.side === L.BOTTOM) {
                    g.moveTo(x, y + h - d);
                    g.lineTo(x + w - 1, y + h - d);
                }
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

pkg.ArrowView = Class(pkg.View, [
    function $prototype() {
        this.lineWidth = 1;
        this.fill = true;
        this.gap  = 0;
        this.color  = "black";
        this.width = this.height = 6;
        this.direction = L.BOTTOM;

        this[''] = function (d, col, w) {
            if (d   != null) this.direction = L.$constraints(d);
            if (col != null) this.color = col;
            if (w   != null) this.width = this.height = w;
        };

        this.outline  = function(g, x, y, w, h, d) {
            x += this.gap;
            y += this.gap;
            w -= this.gap * 2;
            h -= this.gap * 2;

            var dt = this.lineWidth / 2,
                w2 = Math.round(w / 2) - (w % 2 === 0 ? 0 : dt),
                h2 = Math.round(h / 2) - (h % 2 === 0 ? 0 : dt);

            g.beginPath();

            if (L.BOTTOM === this.direction) {
                g.moveTo(x, y + dt);
                g.lineTo(x + w - 1, y + dt);
                g.lineTo(x + w2, y + h - dt);
                g.lineTo(x + dt, y + dt);
            }
            else {
                if (L.TOP === this.direction) {
                    g.moveTo(x, y + h - dt);
                    g.lineTo(x + w - 1, y + h - dt);
                    g.lineTo(x + w2, y);
                    g.lineTo(x + dt, y + h - dt);
                }
                else {
                    if (L.LEFT === this.direction) {
                        g.moveTo(x + w - dt, y);
                        g.lineTo(x + w - dt, y + h - 1);
                        g.lineTo(x, y + h2);
                        g.lineTo(x + w + dt, y);
                    }
                    else {
                        if (L.RIGHT === this.direction) {
                            g.moveTo(x + dt, y);
                            g.lineTo(x + dt, y + h - 1);
                            g.lineTo(x + w, y + h2);
                            g.lineTo(x - dt, y);
                        }
                        else {
                            throw new Error("" + this.direction);
                        }
                    }
                }
            }
            return true;
        };

        this.paint = function(g, x, y, w, h, d) {
            this.outline(g, x, y, w, h, d);
            g.setColor(this.color);
            g.lineWidth = this.lineWidth;

            if (this.fill === true) {
                g.fill();
            }
            else {
                g.stroke();
            }
        };

        this.getPreferredSize = function () {
            return { width  : this.width  + this.gap * 2,
                     height : this.height + this.gap * 2 };
        };
    }
]);

pkg.TextRenderMix = [
    function $prototype() {
        /**
         * UI component that holds the text render
         * @attribute owner
         * @default null
         * @readOnly
         * @protected
         * @type {zebkit.ui.Panel}
         */
        this.owner = null;

        /**
         * Set the rendered text font.
         * @param  {String|zebkit.ui.Font} f a font as CSS string or
         * zebkit.ui.Font class instance
         * @return {Boolean} return true if a text font has been updated
         * @method setFont
         */
        this.setFont = function(f){
            var old = this.font;
            if (f != null && zebkit.isString(f)) f = new pkg.Font(f);

            if (f !== old && (f == null || old == null || f.toString() !== old.toString())) {
                this.font = f;

                if (this.owner != null && this.owner.isValid === true) {
                    this.owner.invalidate();
                }

                if (this.invalidate != null) this.invalidate();
                return true;
            }
            return false;
        };

        this.getLineHeight = function() {
            return this.font.height;
        };

        /**
         * Get a line indent
         * @default 1
         * @return {Integer} line indent
         * @method getLineIndent
         */
        this.getLineIndent = function() {
            return 1;
        };

        /**
         * Set rendered text color
         * @param  {String} c a text color
         * @return {Boolean} return true if a text color has been updated
         * @method setColor
         */
        this.setColor = function(c){
            if (c != this.color) {
                this.color = c.toString();
                return true;
            }
            return false;
        };

        /**
         * Called whenever an owner UI component has been changed
         * @param  {zebkit.ui.Panel} v a new owner UI component
         * @method ownerChanged
         */
        this.ownerChanged = function(v) {
            this.owner = v;
        };
    }
];

/**
 * Lightweight implementation of single line string render. The render requires
 * a simple string as a target object.
 * @param {String} str a string to be rendered
 * @param {zebkit.ui.Font} [font] a text font
 * @param {String} [color] a text color
 * @constructor
 * @extends {zebkit.ui.Render}
 * @class zebkit.ui.StringRender
 */
pkg.StringRender = Class(pkg.Render, [
    function $mixing() {
        return pkg.TextRenderMix;
    },

    function $prototype() {
        this.stringWidth = -1;

        this[''] = function(txt, font, color) {
            this.setTarget(txt);

            /**
             * Font to be used to render the target string
             * @attribute font
             * @readOnly
             * @type {zebkit.ui.Font}
             */
            this.font = font != null ? font : this.clazz.font;

            /**
             * Color to be used to render the target string
             * @readOnly
             * @attribute color
             * @type {String}
             */
            this.color = color != null ? color : this.clazz.color;
        };

        this.calcLineWidth = function() {
            if (this.stringWidth < 0) {
                this.stringWidth = this.font.stringWidth(this.target);
            }
            return this.stringWidth;
        };

        this.invalidate = function() {
            this.stringWidth = -1;
        };

        this.paint = function(g,x,y,w,h,d) {
            if (this.font.s !== g.font) g.setFont(this.font);
            if (this.color  !== g.fillStyle) g.fillStyle = this.color;

            if (d != null && d.isEnabled === false) {
                g.fillStyle = d != null && d.disabledColor != null ? d.disabledColor
                                                                   : this.clazz.disabledColor;
            }

            g.fillText(this.target, x, y);
        };

        /**
         * Return a string that is rendered by this class
         * @return  {String} a string
         * @method getValue
         */
        this.getValue = function(){
            return this.target;
        };

        /**
         * Set the string to be rendered
         * @param  {String} s a string
         * @method setValue
         */
        this.setValue = function(s) {
            this.setTarget(s);
        };

        this.getLines = function() {
            return 1;
        };

        this.getPreferredSize = function() {
            if (this.stringWidth < 0) {
                this.stringWidth = this.font.stringWidth(this.target);
            }
            return { width: this.stringWidth, height: this.font.height };
        };

        this.targetWasChanged = function(o, n) {
            this.stringWidth = -1;
            if (this.owner != null) this.owner.invalidate();
        };
    }
]);

/**
 * Text render that expects and draws a text model or a string as its target
 * @class zebkit.ui.TextRender
 * @constructor
 * @extends zebkit.ui.Render
 * @param  {String|zebkit.data.TextModel} text a text as string or text model object
 */
pkg.TextRender = Class(pkg.Render, zebkit.util.Position.Metric, [
    function $mixing() {
        return pkg.TextRenderMix;
    },

    function $prototype() {
        /**
         * Get number of lines of target text
         * @return   {Integer} a number of line in the target text
         * @method getLines
         */
        this.getLines = function() {
            return this.target.getLines();
        };

        this.getLineSize = function(l) {
            return this.target.getLine(l).length + 1;
        };

        this.getMaxOffset = function() {
            return this.target.getTextLength();
        };

        /**
         * Paint the specified text line
         * @param  {2DContext} g graphical 2D context
         * @param  {Integer} x x coordinate
         * @param  {Integer} y y coordinate
         * @param  {Integer} line a line number
         * @param  {zebkit.ui.Panel} d an UI component on that the line has to be rendered
         * @method paintLine
         */
        this.paintLine = function(g,x,y,line,d) {
            g.fillText(this.getLine(line), x, y);
        };

        /**
         * Get text line by the given line number
         * @param  {Integer} r a line number
         * @return {String} a text line
         * @method getLine
         */
        this.getLine = function(r) {
            return this.target.getLine(r);
        };

        this.targetWasChanged = function(o,n){
            if (o != null) o.unbind(this);
            if (n != null) {
                n.bind(this);
                this.invalidate(0, this.getLines());
            }
            else {
                this.invLines = 0;
            }
        };

        /**
         * Return a string that is rendered by this class
         * @return  {String} a string
         * @method getValue
         */
        this.getValue = function(){
            return this.target == null ? null : this.target.getValue();
        };

        /**
         * Set the text model content
         * @param  {String} s a text as string object
         * @method setValue
         */
        this.setValue = function (s) {
            this.target.setValue(s);
        };

        /**
         * Get the given text line width in pixels
         * @param  {Integer} line a text line number
         * @return {Integer} a text line width in pixels
         * @method lineWidth
         */
        this.calcLineWidth = function(line){
            if (this.invLines > 0) this.recalc();
            return this.target.$lineTags(line).$lineWidth;
        };

        /**
         * Called every time the target text metrics has to be recalculated
         * @method recalc
         */
        this.recalc = function() {
            if (this.invLines > 0 && this.target != null){
                var text = this.target;
                if (text != null) {
                    if (this.invLines > 0) {
                        for(var i = this.startInvLine + this.invLines - 1; i >= this.startInvLine; i--) {
                            text.$lineTags(i).$lineWidth = this.font.stringWidth(this.getLine(i));
                        }
                        this.startInvLine = this.invLines = 0;
                    }

                    this.textWidth = 0;
                    var size = text.getLines();
                    for(var i = 0; i < size; i++){
                        var len = text.$lineTags(i).$lineWidth;
                        if (len > this.textWidth) {
                            this.textWidth = len;
                        }
                    }
                    this.textHeight = this.getLineHeight() * size + (size - 1) * this.getLineIndent();
                }
            }
        };

        /**
         * Text model update listener handler
         * @param  {zebkit.data.TextModel} src text model object
         * @param  {Boolean} b
         * @param  {Integer} off an offset starting from that
         * the text has been updated
         * @param  {Integer} size a size (in character) of text part that
         * has been updated
         * @param  {Integer} ful a first affected by the given update line
         * @param  {Integer} updatedLines a number of text lines that have
         * been affected by text updating
         * @method textUpdated
         */
        this.textUpdated = function(src,b,off,size,ful,updatedLines){
            if (b === false) {
                if (this.invLines > 0) {
                    var p1 = ful - this.startInvLine,
                        p2 = this.startInvLine + this.invLines - ful - updatedLines;
                    this.invLines = ((p1 > 0) ? p1 : 0) + ((p2 > 0) ? p2 : 0) + 1;
                    this.startInvLine = this.startInvLine < ful ? this.startInvLine : ful;
                }
                else {
                    this.startInvLine = ful;
                    this.invLines = 1;
                }
                if (this.owner != null) this.owner.invalidate();
            }
            else {
                if (this.invLines > 0){
                    if (ful <= this.startInvLine) this.startInvLine += (updatedLines - 1);
                    else {
                        if (ful < (this.startInvLine + size)) size += (updatedLines - 1);
                    }
                }
                this.invalidate(ful, updatedLines);
            }
        };

        /**
         * Invalidate metrics for the specified range of lines.
         * @param  {Integer} start first line to be invalidated
         * @param  {Integer} size  number of lines to be invalidated
         * @method invalidate
         * @private
         */
        this.invalidate = function(start,size) {
            if (arguments.length === 0) {
                start = 0;
                size  = this.getLines();
            }

            if (size > 0 && (this.startInvLine != start || size != this.invLines)) {
                if (this.invLines === 0){
                    this.startInvLine = start;
                    this.invLines = size;
                }
                else {
                    var e = this.startInvLine + this.invLines;
                    this.startInvLine = start < this.startInvLine ? start : this.startInvLine;
                    this.invLines     = Math.max(start + size, e) - this.startInvLine;
                }

                if (this.owner != null) {
                    this.owner.invalidate();
                }
            }
        };

        this.getPreferredSize = function(){
            if (this.invLines > 0 && this.target != null) {
                this.recalc();
            }
            return { width:this.textWidth, height:this.textHeight };
        };

        this.paint = function(g,x,y,w,h,d) {
            var ts = g.$states[g.$curState];
            if (ts.width > 0 && ts.height > 0) {
                var lineIndent = this.getLineIndent(),
                    lineHeight = this.getLineHeight(),
                    lilh       = lineHeight + lineIndent,
                    startInvLine  = 0;

                w = ts.width  < w ? ts.width  : w;
                h = ts.height < h ? ts.height : h;

                if (y < ts.y) {
                    startInvLine = Math.floor((lineIndent + ts.y - y) / lilh);
                    h += (ts.y - startInvLine * lineHeight - startInvLine * lineIndent);
                }
                else {
                    if (y > (ts.y + ts.height)) return;
                }

                var size = this.target.getLines();
                if (startInvLine < size){
                    var lines =  Math.floor((h + lineIndent) / lilh) + (((h + lineIndent) % lilh > lineIndent) ? 1 : 0);
                    if (startInvLine + lines > size) {
                        lines = size - startInvLine;
                    }
                    y += startInvLine * lilh;

                    g.setFont(this.font);

                    if (d == null || d.isEnabled === true){
                        if (this.color != g.fillStyle) g.fillStyle = this.color;

                        var p1 = null, p2 = null, bsel = false;
                        if (lines > 0 && d != null && d.getStartSelection != null) {
                            p1   = d.getStartSelection();
                            p2   = d.getEndSelection();
                            bsel = p1 != null && (p1[0] != p2[0] || p1[1] != p2[1]);
                        }

                        for(var i = 0; i < lines; i++){
                            if (bsel === true) {
                                var line = i + startInvLine;
                                if (line >= p1[0] && line <= p2[0]){
                                    var s  = this.getLine(line),
                                        lw = this.calcLineWidth(line),
                                        xx = x;

                                    if (line === p1[0]) {
                                        var ww = this.font.charsWidth(s, 0, p1[1]);
                                        xx += ww;
                                        lw -= ww;
                                        if (p1[0] === p2[0]) {
                                            lw -= this.font.charsWidth(s, p2[1], s.length - p2[1]);
                                        }
                                    }
                                    else {
                                        if (line == p2[0]) lw = this.font.charsWidth(s, 0, p2[1]);
                                    }
                                    this.paintSelection(g, xx, y, lw === 0 ? 1 : lw, lilh, line, d);

                                    // restore color to paint text since it can be
                                    // res-set with paintSelection method
                                    if (this.color != g.fillStyle) g.fillStyle = this.color;
                                }
                            }

                            this.paintLine(g, x, y, i + startInvLine, d);
                            y += lilh;
                        }
                    }
                    else {
                        var dcol = d != null && d.disabledColor != null ? d.disabledColor
                                                                        : pkg.TextRender.disabledColor;

                        for(var i = 0;i < lines; i++) {
                            g.setColor(dcol);
                            this.paintLine(g, x, y, i + startInvLine, d);
                            y += lilh;
                        }
                    }
                }
            }
        };

        /**
         * Paint the specified text selection of the given line. The area
         * where selection has to be rendered is denoted with the given
         * rectangular area.
         * @param  {2DContext} g a canvas graphical context
         * @param  {Integer} x a x coordinate of selection rectangular area
         * @param  {Integer} y a y coordinate of selection rectangular area
         * @param  {Integer} w a width of of selection rectangular area
         * @param  {Integer} h a height of of selection rectangular area
         * @param  {Integer} line [description]
         * @param  {zebkit.ui.Panel} d a target UI component where the text
         * has to be rendered
         * @protected
         * @method paintSelection
         */
        this.paintSelection = function(g, x, y, w, h, line, d){
            g.setColor(d.selectionColor);
            g.fillRect(x, y, w, h);
        };

        // speed up constructor by avoiding super execution since
        // text render is one of the most used class
        this[''] = function(text) {
            /**
             * Text color
             * @attribute color
             * @type {String}
             * @default zebkit.ui.TextRender.color
             * @readOnly
             */
            this.color = this.clazz.color;

            /**
             * Text font
             * @attribute font
             * @type {String|zebkit.ui.Font}
             * @default zebkit.ui.TextRender.font
             * @readOnly
             */
            this.font = this.clazz.font;


            this.textWidth = this.textHeight = this.startInvLine = this.invLines = 0;

            //!!!
            //   since text render is widely used structure we do slight hack -
            //   don't call parent constructor
            //!!!
            this.setTarget(zebkit.isString(text) ? new zebkit.data.Text(text) : text);
        };
    }
]);


pkg.DecoratedTextRender = zebkit.Class(pkg.TextRender, [
    function setDecoration(id, color) {
        if (id == null) throw new Error();
        this.decorations[id] = color;
    },

    function setDecorations(d) {
        this.decorations = zebkit.clone(d);
    },

    function paintLine(g,x,y,line,d) {
        this.$super(g,x,y,line,d);

        var lw = this.calcLineWidth(line),
            lh = this.getLineHeight(line);

        if (this.decorations.underline != null) {
            g.lineWidth = this.lineWidth;
            g.setColor(this.decorations.underline);
            g.drawLine(x, y + lh - 1, x + lw, y  + lh - 1);
        }

        if (this.decorations.strike != null) {
            var yy = y + Math.round(lh / 2) - 1;
            g.setColor(this.decorations.strike);
            g.lineWidth = this.lineWidth;
            g.drawLine(x, yy, x + lw, yy);
        }
    },

    function(text) {
        this.decorations = {};
        this.lineWidth = 1;
        this.$super(text);
    }
]);


pkg.BoldTextRender = Class(pkg.TextRender, [
    function(t) {
        this.$super(t);
        this.setFont(pkg.boldFont);
    }
]);

/**
 * Password text render class. This class renders a secret text with hiding it with the given character.
 * @param {String|zebkit.data.TextModel} [text] a text as string or text model instance
 * @class zebkit.ui.PasswordText
 * @constructor
 * @extends zebkit.ui.TextRender
 */
pkg.PasswordText = Class(pkg.TextRender, [
    function(text){
        if (arguments.length === 0) text = new zebkit.data.SingleLineTxt("");

        /**
         * Echo character that will replace characters of hidden text
         * @attribute echo
         * @type {String}
         * @readOnly
         * @default "*"
         */
        this.echo = "*";

        /**
         * Indicates if the last entered character doesn't have to be replaced with echo character
         * @type {Boolean}
         * @attribute showLast
         * @default true
         * @readOnly
         */
        this.showLast = true;
        this.$super(text);
    },

    /**
     * Set the specified echo character. The echo character is used to hide secret text.
     * @param {String} ch an echo character
     * @method setEchoChar
     */
    function setEchoChar(ch){
        if (this.echo != ch){
            this.echo = ch;
            if (this.target != null) this.invalidate(0, this.target.getLines());
        }
    },

    function getLine(r){
        var buf = [], ln = this.$super(r);
        for(var i = 0;i < ln.length; i++) buf[i] = this.echo;
        if (this.showLast && ln.length > 0) buf[ln.length-1] = ln[ln.length-1];
        return buf.join('');
    }
]);

pkg.TabBorder = Class(pkg.View, [
    function(t, w) {
        if (arguments.length === 1) w = 1;

        this.type  = t;
        this.left = this.top = this.bottom = this.right = 6 + w;
        this.width = w;

        this.onColor1 = pkg.palette.black;
        this.onColor2 = pkg.palette.gray5;
        this.offColor = pkg.palette.gray1;

        this.fillColor1 = "#DCF0F7";
        this.fillColor2 = pkg.palette.white;
        this.fillColor3 = pkg.palette.gray7;
    },

    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            var xx = x + w - 1,
                yy = y + h - 1,
                o  = d.parent.orient,
                t  = this.type,
                s  = this.width,
                dt = s / 2;

            g.beginPath();
            g.lineWidth = s;
            switch(o) {
                case L.LEFT:
                    g.moveTo(xx + 1, y + dt);
                    g.lineTo(x + s*2, y + dt);
                    g.lineTo(x + dt , y + s*2);
                    g.lineTo(x + dt, yy - s*2 + dt);
                    g.lineTo(x + s*2, yy + dt);
                    g.lineTo(xx + 1, yy + dt);

                    if (d.isEnabled === true){
                        g.setColor(t === 2 ? this.fillColor1 : this.fillColor2);
                        g.fill();
                    }

                    g.setColor((t === 0 || t === 2) ? this.onColor1 : this.offColor);
                    g.stroke();

                    if (d.isEnabled === true) {
                        var ww = Math.floor((w - 6) / 2);
                        g.setColor(this.fillColor3);
                        g.fillRect(xx - ww + 1, y + s, ww, h - s - 1);
                    }

                    if (t === 1) {
                        g.setColor(this.onColor2);
                        g.drawLine(x + 2*s + 1, yy - s, xx + 1, yy - s, s);
                    }
                    break;
                case L.RIGHT:
                    xx -= dt; // thick line grows left side and right side proportionally
                              // correct it

                    g.moveTo(x, y + dt);
                    g.lineTo(xx - 2*s, y + dt);

                    g.lineTo(xx   , y + 2*s);
                    g.lineTo(xx   , yy - 2*s);
                    g.lineTo(xx - 2*s, yy + dt);
                    g.lineTo(x, yy + dt);

                    if (d.isEnabled === true){
                        g.setColor(t == 2 ? this.fillColor1 : this.fillColor2);
                        g.fill();
                    }

                    g.setColor((t === 0 || t === 2) ? this.onColor1 : this.offColor);
                    g.stroke();

                    if (d.isEnabled === true) {
                        var ww = Math.floor((w - 6) / 2);
                        g.setColor(this.fillColor3);
                        g.fillRect(x, y + s, ww, h - s - 1);
                    }

                    if (t === 1) {
                        g.setColor(this.onColor2);
                        g.drawLine(x, yy - s, xx - s - 1, yy - s, s);
                    }
                    break;
                case L.TOP:
                    g.moveTo(x + dt, yy + 1 );
                    g.lineTo(x + dt, y + s*2);
                    g.lineTo(x + s*2, y + dt);
                    g.lineTo(xx - s*2 + s, y + dt);
                    g.lineTo(xx + dt, y + s*2);
                    g.lineTo(xx + dt, yy + 1);

                    if (d.isEnabled === true){
                        g.setColor(t === 2 ? this.fillColor1 : this.fillColor2);
                        g.fill();
                    }

                    g.setColor((t === 0 || t === 2) ? this.onColor1 : this.offColor);
                    g.stroke();

                    if (d.isEnabled === true){
                        g.setColor(this.fillColor3);
                        var hh = Math.floor((h - 6) / 2);
                        g.fillRect(x + s, yy - hh + 1 , w - s - 1, hh);
                    }

                    if (t === 0) {
                        g.setColor(this.onColor2);
                        g.beginPath();
                        g.moveTo(xx + dt - s, yy + 1);
                        g.lineTo(xx + dt - s, y + s*2);
                        g.stroke();
                    }

                    break;
                case L.BOTTOM:
                    yy -= dt;

                    g.moveTo(x + dt, y);
                    g.lineTo(x + dt, yy - 2*s);
                    g.lineTo(x + 2*s + dt, yy);
                    g.lineTo(xx - 2*s, yy);
                    g.lineTo(xx + dt, yy - 2*s);
                    g.lineTo(xx + dt, y);

                    if (d.isEnabled === true){
                        g.setColor(t === 2 ? this.fillColor1 : this.fillColor2);
                        g.fill();
                    }

                    g.setColor((t === 0 || t === 2) ? this.onColor1 : this.offColor);
                    g.stroke();

                    if (d.isEnabled === true){
                        g.setColor(this.fillColor3);
                        var hh = Math.floor((h - 6) / 2);
                        g.fillRect(x + s, y, w - s - 1, hh);
                    }

                    if (t === 0) {
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
 * @class zebkit.ui.TitledBorder
 * @extends zebkit.ui.Render
 * @constructor
 * @param {zebkit.ui.View} border  a border to be rendered with a title area
 * @param {Integer|String} [lineAlignment] a line alignment. Specifies how
 * a title area has to be aligned relatively border line:
 *
 *      BOTTOM or "bottom"  - title area will be placed on top of border line:
 *                    ___| Title area |___
 *
 *
 *      CENTER or "center"  - title area will be centered relatively to border line:
 *                    ---| Title area |-----
 *
 *
 *      TOP or "top"  - title area will be placed underneath of border line:
 *                     ____              ________
 *                         |  Title area |
 *
 *
 */
pkg.TitledBorder = Class(pkg.Render, [
    function $prototype() {
        this.lineAlignment = L.BOTTOM;

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
            if (d.getTitleInfo != null) {
                var r = d.getTitleInfo();
                if (r != null) {
                    switch(r.orient) {
                        case L.BOTTOM:
                            var bottom = this.target.getBottom();
                            switch (this.lineAlignment) {
                                case L.CENTER : yy = r.y + Math.floor((r.height - bottom)/ 2) + bottom; break;
                                case L.TOP    : yy = r.y + r.height + bottom; break;
                                case L.BOTTOM : yy = r.y; break;
                            }
                            break;
                        case L.TOP:
                            var top = this.target.getTop();
                            switch (this.lineAlignment) {
                                case L.CENTER : y = r.y + Math.floor((r.height - top)/2);   break; // y = r.y + Math.floor(r.height/ 2) ; break;
                                case L.TOP    : y = r.y - top; break;
                                case L.BOTTOM : y = r.y + r.height; break;
                            }
                            break;
                        case L.LEFT:
                            var left = this.target.getLeft();
                            switch (this.lineAlignment) {
                                case L.CENTER : x = r.x + Math.floor((r.width - left) / 2); break;
                                case L.TOP    : x = r.x - left; break;
                                case L.BOTTOM : x = r.x + r.width; break;
                            }
                            break;
                        case L.RIGHT:
                            var right = this.target.getRight();
                            switch (this.lineAlignment) {
                                case L.CENTER : xx = r.x + Math.floor((r.width - right) / 2) + right; break;
                                case L.TOP    : xx = r.x + r.width + right; break;
                                case L.BOTTOM : xx = r.x; break;
                            }
                            break;
                    }
                }
            }

            if (this.target != null && this.target.outline != null) {
               b = this.target.outline(g, x, y, xx - x, yy - y, d);
               if (b === true) return b;
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
            if (d.getTitleInfo != null){
                var r = d.getTitleInfo();
                if (r != null) {
                    var xx = x + w, yy = y + h, t = g.$states[g.$curState];
                    switch (r.orient) {
                        case L.TOP:
                            var top = this.target.getTop();
                            // compute border y
                            switch (this.lineAlignment) {
                                case L.CENTER : y = r.y + Math.floor((r.height - top) / 2) ; break;
                                case L.TOP    : y = r.y - top; break;
                                case L.BOTTOM : y = r.y + r.height; break;
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
                        case L.BOTTOM:
                            var bottom = this.target.getBottom();
                            switch (this.lineAlignment) {
                                case L.CENTER : yy = r.y + Math.floor((r.height - bottom) / 2) + bottom; break;
                                case L.TOP    : yy = r.y + r.height + bottom; break;
                                case L.BOTTOM : yy = r.y ; break;
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
                        case L.LEFT:
                            var left = this.target.getLeft();
                            switch (this.lineAlignment) {
                                case L.CENTER : x = r.x + Math.floor((r.width - left) / 2); break;
                                case L.TOP    : x = r.x  - left; break;
                                case L.BOTTOM : x = r.x + r.width; break;
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
                        case L.RIGHT:
                            var right = this.target.getRight();
                            switch (this.lineAlignment) {
                                case L.CENTER : xx = r.x + Math.floor((r.width - right) / 2) + right; break;
                                case L.TOP    : xx = r.x  + r.width + right; break;
                                case L.BOTTOM : xx = r.x; break;
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
            }
            else {
                this.target.paint(g, x, y, w, h, d);
            }
        };

        this[''] = function (b, a){
            if (a != null) {
                this.lineAlignment = L.$constraints(a);
            }

            if (b == null && this.lineAlignment != L.BOTTOM &&
                             this.lineAlignment != L.TOP &&
                             this.lineAlignment != L.CENTER)
            {
                throw new Error("" + this.lineAlignment);
            }
            this.setTarget(b);
        };
    }
]);

pkg.CheckboxView = Class(pkg.View, [
    function $prototype() {
        this.color = "rgb(65, 131, 255)";

        this[''] = function(color) {
            if (color != null) this.color = color;
        };

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

pkg.BunldeView = Class(pkg.View, [
    function $prototype() {
        this.color = "#AAAAAA";
        this.direction = L.VERTICAL;

        this[''] = function(dir, color) {
            if (color != null) this.color = color;
            if (dir != null) this.direction = L.$constraints(dir);
        };

        this.paint =  function(g,x,y,w,h,d) {
            g.beginPath();
            if (this.direction === L.VERTICAL) {
                var r = w/2;
                g.arc(x + r, y + r, r, Math.PI, 0, false);
                g.lineTo(x + w, y + h - r);
                g.arc(x + r, y + h - r, r, 0, Math.PI, false);
                g.lineTo(x, y + r);
            }
            else {
                var r = h/2;
                g.arc(x + r, y + r, r, 0.5 * Math.PI, 1.5 * Math.PI, false);
                g.lineTo(x + w - r, y);
                g.arc(x + w - r, y + h - r, r, 1.5*Math.PI, 0.5*Math.PI, false);
                g.lineTo(x + r, y + h);
            }
            g.setColor(this.color);
            g.fill();
        };
    }
]);

/**
 * The radio button ticker view.
 * @class  zebkit.ui.RadioView
 * @extends zebkit.ui.View
 * @constructor
 * @param {String} [col1] color one to render the outer cycle
 * @param {String} [col2] color tow to render the inner cycle
 */
pkg.RadioView = Class(pkg.View, [
    function(col1, col2) {
        if (col1 != null) this.color1 = col1;
        if (col2 != null) this.color2 = col2;
    },

    function $prototype() {
        this.color1 = "rgb(15, 81, 205)";
        this.color2 = "rgb(65, 131, 255)";

        this.paint = function(g,x,y,w,h,d){
            g.beginPath();

            g.fillStyle = this.color1;
            g.arc(Math.floor(x + w/2), Math.floor(y + h/2) , Math.floor(w/3 - 0.5), 0, 2* Math.PI, 1, false);
            g.fill();

            g.beginPath();
            g.fillStyle = this.color2;
            g.arc(Math.floor(x + w/2), Math.floor(y + h/2) , Math.floor(w/4 - 0.5), 0, 2* Math.PI, 1, false);
            g.fill();
        };
    }
]);

/**
 * Toggle view element class
 * @class  zebkit.ui.ToggleView
 * @extends {zebkit.ui.View}
 * @constructor
 * @param  {Boolean} plus indicates the sign type plus (true) or minus (false)
 * @param  {String} color a color
 * @param  {String} bg a background
 */
pkg.ToggleView = Class(pkg.View, [
    function $prototype() {
        this[''] = function(plus, color, bg) {
            this.color = color == null ? "white" : color;
            this.bg    = bg    == null ? "lightGray" : bg ;
            this.plus  = plus  == null ? false : plus;
            this.br    = new pkg.Border("rgb(65, 131, 215)", 1, 3);
            this.width = this.height = 12;
        };

        this.paint = function(g, x, y, w, h, d) {
            this.br.outline(g, x, y, w, h, d);

            g.setColor(this.bg);
            g.fill();
            this.br.paint(g, x, y, w, h, d);

            g.setColor(this.color);
            g.lineWidth = 2;
            x+=2;
            w-=4;
            h-=4;
            y+=2;
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
            return { width:this.width, height:this.height};
        };
    }
]);

pkg.CaptionBgView = Class(pkg.View, [
    function $prototype() {
        this.gap = this.radius = 6;
        this.bg  = "#66CCFF";

        this[''] = function(bg) {
            if (bg != null) this.bg = bg;
        };

        this.paint = function(g,x,y,w,h,d) {
            this.outline(g,x,y,w,h,d);
            g.setColor(this.bg);
            g.fill();
        };

        this.outline = function (g,x,y,w,h,d) {
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

/**
 * @for
 */

})(zebkit("ui"), zebkit.Class);

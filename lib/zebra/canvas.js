(function(pkg, Class) {

/**
 * Zebra UI. The UI is powerful way to create any imaginable
 * user interface for WEB. The idea is based on developing
 * hierarchy of UI components that sits and renders on HTML5
 * Canvas element.
 *
 * Write zebra UI code in safe place where you can be sure all
 * necessary structure, configurations, etc are ready. The safe
 * place is "zebra.ready(...)" method. Development of zebra UI
 * application begins from creation "zebra.ui.zCanvas" class,
 * that is starting point and root element of your UI components
 * hierarchy. "zCanvas" is actually wrapper around HTML5 Canvas
 * element where zebra UI sits on. The typical zebra UI coding
 * template is shown below:

     // build UI in safe place
     zebra.ready(function() {
        // create canvas element
        var c = new zebra.ui.zCanvas(400, 400);

        // start placing UI component on c.root panel
        //set layout manager
        c.root.setLayout(new zebra.layout.BorderLayout());
        //add label to top
        c.root.add(zebra.layout.TOP,new zebra.ui.Label("Top label"));
        //add text area to center
        c.root.add(zebra.layout.CENTER,new zebra.ui.TextArea(""));
        //add button area to bottom
        c.root.add(zebra.layout.BOTTOM,new zebra.ui.Button("Button"));
        ...
     });

 *  The latest version of zebra JavaScript is available in repository:

        <script src='http://repo.zebkit.org/latest/zebra.min.js'
                type='text/javascript'></script>

 * @module ui
 * @main ui
 * @requires zebra, util, io, data
 */

var instanceOf = zebra.instanceOf, L = zebra.layout, MB = zebra.util,
    $configurators = [], rgb = zebra.util.rgb, temporary = { x:0, y:0, width:0, height:0 },
    MS = Math.sin, MC = Math.cos, $fmCanvas = null, $fmText = null,
    $fmImage = null, $clipboard = null, $clipboardCanvas;

pkg.$canvases = [];

pkg.clipboardTriggerKey = 0;

function $meX(e, d) {
    return d.$context.tX(e.pageX - d.offx, e.pageY - d.offy);
}

function $meY(e, d) {
    return d.$context.tY(e.pageX - d.offx, e.pageY - d.offy);
}

pkg.$view = function(v) {
    if (v == null || v.paint != null) return v;

    if (zebra.isString(v)) {
        return rgb.hasOwnProperty(v) ? rgb[v]
                                     : (pkg.borders && pkg.borders.hasOwnProperty(v) ? pkg.borders[v]
                                                                                     : new rgb(v));
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
 * Look up 2D canvas in the list of existent
 * @param  {2DCanvas} canvas a canvas
 * @return {zebra.ui.zCanvas} a zebra canvas
 */
pkg.$detectZCanvas = function(canvas) {
    if (zebra.isString(canvas)) canvas = document.getElementById(canvas);
    for(var i=0; canvas != null && i < pkg.$canvases.length; i++) {
        if (pkg.$canvases[i].canvas == canvas) return pkg.$canvases[i];
    }
    return null;
};

/**
 * View class that is designed as a basis for various reusable decorative
 * UI elements implementations
 * @class zebra.ui.View
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
            return { width:0, height:0 };
        };

        /**
        * The method is called to render the decorative element on the
        * given surface of the specified UI component
        * @param {Canvas 2D context} g  graphical context
        * @param {Integer} x  x coordinate
        * @param {Integer} y  y coordinate
        * @param {Integer} w  required width
        * @param {Integer} h  required height
        * @param {zebra.ui.Panel} c an UI component on which the view
        * element has to be drawn
        * @method paint
        */
        this.paint = function(g,x,y,w,h,c) {};
    }
]);

/**
 * Render class extends "zebra.ui.View" class with a notion
 * of target object. Render stores reference  to a target that
 * the render knows how to visualize. Basically Render is an
 * object visualizer. For instance, developer can implement
 * text, image and so other objects visualizers.
 * @param {Object} target a target object to be visualized
 * with the render
 * @constructor
 * @extends zebra.ui.View
 * @class zebra.ui.Render
 */
pkg.Render = Class(pkg.View, [
    function $prototype() {
        /**
         * Target object to be visualized
         * @attribute target
         * @default null
         * @readOnly
         * @type {Object}
         */
        this.target = null;

        this[''] = function(target) {
            this.setTarget(target);
        };

        /**
         * Set the given target object. The method triggers
         * "targetWasChanged(oldTarget, newTarget)" execution if
         * the method is declared. Implement the method if you need
         * to track a target object updating.
         * @method setTarget
         * @param  {Object} o a target object to be visualized
         */
        this.setTarget = function(o) {
            if (this.target != o) {
                var old = this.target;
                this.target = o;
                if (this.targetWasChanged != null) {
                    this.targetWasChanged(old, o);
                }
            }
        };
    }
]);

/**
* Raised border view
* @class zebra.ui.Raised
* @param {String} [brightest] a brightest border line color
* @param {String} [middle] a middle border line color
* @constructor
* @extends zebra.ui.View
*/
pkg.Raised = Class(pkg.View, [
    function() { this.$this(pkg.lightBrColor, pkg.midBrColor); },

    function(brightest,middle) {
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
* Sunken border view
* @class zebra.ui.Sunken
* @constructor
* @param {String} [brightest] a brightest border line color
* @param {String} [moddle] a middle border line color
* @param {String} [darkest] a darkest border line color
* @extends zebra.ui.View
*/
pkg.Sunken = Class(pkg.View, [
    function () {
        this.$this(pkg.lightBrColor, pkg.midBrColor, pkg.darkBrColor);
    },

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

        this.brightest = brightest == null ? "white" : brightest;
        this.middle    = middle    == null ? "gray"  : middle;
        this.darkest   = darkest   == null ? "black" : darkest;
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
* @class zebra.ui.Etched
* @constructor
* @param {String} [brightest] a brightest border line color
* @param {String} [moddle] a middle border line color
* @extends zebra.ui.View
*/
pkg.Etched = Class(pkg.View, [
    function () {
        this.$this(pkg.lightBrColor, pkg.midBrColor);
    },

    function (brightest,middle) {
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
        this.middle    = middle    == null ? "gray" : middle;
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
* Dotted border view
* @class zebra.ui.Dotted
* @param {String} [c] the dotted border color
* @constructor
* @extends zebra.ui.View
*/
pkg.Dotted = Class(pkg.View, [
    function $prototype() {
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
            this.color = (c == null) ? "black" : c;
        };
    }
]);

/**
 * Border view. Can be used to render CSS-like border. Border can be applied to any
 * zebra UI component by calling setBorder method:

        // create label component
        var lab = new zebra.ui.Label("Test label");

        // set red border to the label component
        lab.setBorder(new zebra.ui.Border("red"));

 * @param  {String}  [c] border color
 * @param  {Integer} [w] border width
 * @param  {Integer} [r] border corners radius
 * @constructor
 * @class zebra.ui.Border
 * @extends zebra.ui.View
 */
pkg.Border = Class(pkg.View, [
    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            if (this.color != null) {
                var ps = g.lineWidth;
                g.lineWidth = this.width;

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
                g.lineWidth = ps;
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

            this.color  = (arguments.length === 0) ? "gray" : c;
            this.width  = (w == null) ? 1 : w;
            this.radius = (r == null) ? 0 : r;
            this.gap    = this.width;
        };
    }
]);

/**
 * Round border view.
 * @param  {String}  [col] border color. Use null as the
 * border color value to prevent painting of the border
 * @param  {Integer} [width] border width
 * @constructor
 * @class zebra.ui.RoundBorder
 * @extends zebra.ui.View
 */
pkg.RoundBorder = Class(pkg.View, [
    function $prototype() {
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
            g.arc(~~(x + w/2), ~~(y + h/2), ~~(w/2 - 0.5), 0, 2 * Math.PI, false);
            g.closePath();
            return true;
        };

        this[''] = function(col, width) {
            /**
             * Border color
             * @attribute color
             * @readOnly
             * @type {String}
             * @default null
             */

            /**
             * Border width
             * @attribute width
             * @readOnly
             * @type {Integer}
             * @default 1
             */

            this.color = null;
            this.width = 1;

            if (arguments.length > 0) {
                if (zebra.isNumber(col)) this.width = col;
                else {
                    this.color = col;
                    if (zebra.isNumber(width)) this.width = width;
                }
            }
            this.gap = this.width;
        };
    }
]);

/**
* Vertical or horizontal linear gradient view
* @param {String} startColor start color
* @param {String} endColor end color
* @param {Integer|String} [type] type of gradient
* "zebra.layout.VERTICAL" or "zebra.layout.HORIZONTAL" or "vertical" or "horizontal"
* @constructor
* @class zebra.ui.Gradient
* @extends zebra.ui.View
*/
pkg.Gradient = Class(pkg.View, [
    function $prototype() {
        this[''] =  function(){
            /**
             * Gradient orientation: vertical or horizontal
             * @attribute orientation
             * @readOnly
             * @default zebra.layout.VERTICAL
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
            else {
                this.orientation = L.VERTICAL;
            }
        };

        this.paint = function(g,x,y,w,h,dd){
            var d = (this.orientation == L.HORIZONTAL? [0,1]: [1,0]),
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
                for(var i=0;i<this.colors.length;i++) {
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
* @class zebra.ui.Radial
* @extends zebra.ui.View
*/
pkg.Radial = Class(pkg.View, [
    function $prototype() {
        this[''] = function() {
            this.colors = Array.prototype.slice.call(arguments, 0);
        };

        this.paint = function(g,x,y,w,h,d){
            var cx1 = w/2, cy1 = h/2;
            this.gradient = g.createRadialGradient(cx1, cy1, 10, cx1, cy1, w > h ? w : h);

            for(var i=0;i<this.colors.length;i++) {
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
* @class zebra.ui.Picture
* @extends zebra.ui.Render
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
            if (this.target != null && w > 0 && h > 0){
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
            return img == null ? { width:0, height:0 }
                               : (this.width > 0) ? { width:this.width, height:this.height }
                                                  : { width:img.width, height:img.height };
        };
    }
]);

/**
* Pattern render.
* @class zebra.ui.Pattern
* @param {Image} [img] an image to be used as the pattern
* @constructor
* @extends zebra.ui.Render
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
* @class zebra.ui.CompositeView
* @param {Arrayt|Object} [views] array of dictionary of views
* to be composed together
* @constructor
* @extends zebra.ui.View
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

            if (this.voutline == null && v.outline) {
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
                var v = this.views[i];
                v.paint(g, x, y, w, h, d);
            }
        };

        this.outline = function(g,x,y,w,h,d) {
            return this.voutline && this.voutline.outline(g,x,y,w,h,d);
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
* @class zebra.ui.ViewSet
* @extends zebra.ui.CompositeView
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
         * @param  {String} id a key of a view from the set to be activated
         * @return {Boolean} true if new view has been activated, false otherwise
         * @method activate
         */
        this.activate = function (id) {
            var old = this.activeView;
            if (this.views.hasOwnProperty(id)) {
                return (this.activeView = this.views[id]) != old;
            }

            if (id.length > 1 && id[0] != '*' && id[id.length-1] != '*') {
                var i = id.indexOf('.');
                if (i > 0) {
                    var k = id.substring(0, i + 1) + '*';
                    if (this.views.hasOwnProperty(k)) {
                        return (this.activeView = this.views[k]) != old;
                    }

                    k = "*" + id.substring(i);
                    if (this.views.hasOwnProperty(k)) {
                        return (this.activeView = this.views[k]) != old;
                    }
                }
            }

            return this.views.hasOwnProperty("*") ? (this.activeView = this.views["*"]) != old
                                                  : false;
        };

        this.iterate = function(f) {
            for(var k in this.views) {
                f.call(this, k, this.views[k]);
            }
        };

        this[''] = function(args) {
            if (args == null) {
                throw new Error("Null view set");
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
                if (this.views[k]) this.$recalc(this.views[k]);
            }
            this.activate("*");
        };
    }
]);

pkg.Bag = Class(zebra.util.Bag, [
    function $prototype() {
        this.usePropertySetters = true; //false;

        this.contentLoaded = function(v) {
            if (v == null || zebra.isNumber(v) || zebra.isBoolean(v)) return v;
            if (zebra.isString(v)) {
                if (this.root != null && v[0] == "%" && v[1] == "r") {
                    var s = "%root%/";
                    if (v.indexOf(s) === 0) {
                        return this.root.join(v.substring(s.length));
                    }
                }
                return v;
            }

            if (Array.isArray(v)) {
                for (var i = 0; i < v.length; i++) {
                    v[i] = this.contentLoaded(v[i]);
                }
                return v;
            }

            for (var k in v) {
                if (v.hasOwnProperty(k)) v[k] = this.contentLoaded(v[k]);
            }
            return v;
        };
    },

    function loadByUrl(url, b) {
        this.root = null;

        if (zebra.URL.isAbsolute(url)) {
            this.root = (new zebra.URL(url)).getParentURL();
        }

        return this.$super(url, b);
    }
]);

rgb.prototype.paint = function(g,x,y,w,h,d) {
    if (this.s != g.fillStyle) g.fillStyle = this.s;

    // fix for IE10/11, calculate intersection of clipped area
    // and the area that has to be filled. IE11/10 have a bug
    // that triggers filling more space than it is restricted
    // with clip
    if (g.stack != null) {
        var t  = g.stack[g.counter],
            rx = x > t.x ? x : t.x,
            rw = Math.min(x + w, t.x + t.width) - rx;

        if (rw > 0)  {
            var ry = y > t.y ? y : t.y,
            rh = Math.min(y + h, t.y + t.height) - ry;

            if (rh > 0) g.fillRect(rx, ry, rw, rh);
        }
    }
    else {
        g.fillRect(x, y, w, h);
    }
};

rgb.prototype.getPreferredSize = function() {
    return { width:0, height:0 };
};

pkg.$getPS = function(l) {
    return l != null && l.isVisible === true ? l.getPreferredSize()
                                             : { width:0, height:0 };
};

var $cvp = pkg.$cvp = function(c, r) {
    if (c.width > 0 && c.height > 0 && c.isVisible === true){
        var p = c.parent, px = -c.x, py = -c.y;
        if (r == null) r = { x:0, y:0, width:0, height:0 };
        else r.x = r.y = 0;
        r.width  = c.width;
        r.height = c.height;

        while (p != null && r.width > 0 && r.height > 0) {
            var xx = r.x > px ? r.x : px,
                yy = r.y > py ? r.y : py,
                w1 = r.x + r.width,
                w2 = px  + p.width,
                h1 = r.y + r.height,
                h2 = py + p.height;

            r.width  = (w1 < w2 ? w1 : w2) - xx,
            r.height = (h1 < h2 ? h1 : h2) - yy;
            r.x = xx;
            r.y = yy;

            px -= p.x;
            py -= p.y;
            p = p.parent;
        }
        return r.width > 0 && r.height > 0 ? r : null;
    }
    return null;
};

pkg.configure = function(c) {
    if (zebra.isString(c)) {
        var path = c;
        c = function(conf) {
            conf.loadByUrl(path, false);
        };
    }
    $configurators.push(c);
};

/**
 * This class represents a font and provides basic font metrics like
 * height, ascent. Using the class developers can compute string width.

      // plain font
      var f = new zebra.ui.Font("Arial", 14);

      // bold font
      var f = new zebra.ui.Font("Arial", "bold", 14);

      // defining font with CSS font name
      var f = new zebra.ui.Font("100px Futura, Helvetica, sans-serif");

 * @constructor
 * @param {String} name a name of the font. If size and style parameters
 * has not been passed the name is considered as CSS font name that
 * includes size and style
 * @param {String} [style] a style of the font: "bold", "italic", etc
 * @param {Integer} [size] a size of the font
 * @class zebra.ui.Font
 */
pkg.Font = function(name, style, size) {
    if (arguments.length == 1) {
        name = name.replace(/[ ]+/, ' ');
        this.s = name.trim();
    }
    else {
        if (arguments.length == 2) {
            size = style;
            style = '';
        }
        style = style.trim();

        this.s = [   style, (style !== '' ? ' ' : ''),
                     size, 'px ',
                     name
                 ].join('');

        this.name = name;
    }
    $fmText.style.font = this.s;

    /**
     * Height of the font
     * @attribute height
     * @readOnly
     * @type {Integer}
     */
    this.height = $fmText.offsetHeight;

    //!!!
    // Something weird is going sometimes in IE10 !
    // Sometimes the property  offsetHeight is 0 but
    // second attempt to access to the property gives
    // proper result
    if (this.height === 0) {
        this.height = $fmText.offsetHeight;
    }

    /**
     * Ascent of the font
     * @attribute ascent
     * @readOnly
     * @type {Integer}
     */
    this.ascent = $fmImage.offsetTop - $fmText.offsetTop + 1;
};

/**
 * Calculate the given string width in pixels
 * @param  {String} s a string whose width has to be computed
 * @return {Integer} a string size in pixels
 * @method stringWidth
 * @for zebra.ui.Font
 */
pkg.Font.prototype.stringWidth = function(s) {
    if (s.length === 0) return 0;
    if ($fmCanvas.font != this.s) $fmCanvas.font = this.s;
    return ($fmCanvas.measureText(s).width + 0.5) | 0;
};

/**
 * Calculate the specified substring width
 * @param  {String} s a string
 * @param  {Integer} off fist character index
 * @param  {Integer} len length of substring
 * @return {Integer} a substring size in pixels
 * @method charsWidth
 * @for zebra.ui.Font
 */
pkg.Font.prototype.charsWidth = function(s, off, len) {
    if ($fmCanvas.font != this.s) $fmCanvas.font = this.s;
    return ($fmCanvas.measureText(len == 1 ? s[off] : s.substring(off, off + len)).width + 0.5) | 0;
};

/**
 * Returns CSS font representation
 * @return {String} a CSS representation of the given Font
 * @method toString
 * @for zebra.ui.Font
 */
pkg.Font.prototype.toString = function() { return this.s;  };

pkg.Cursor = {
    DEFAULT     : "default",
    MOVE        : "move",
    WAIT        : "wait",
    TEXT        : "text",
    HAND        : "pointer",
    NE_RESIZE   : "ne-resize",
    SW_RESIZE   : "sw-resize",
    SE_RESIZE   : "se-resize",
    NW_RESIZE   : "nw-resize",
    S_RESIZE    : "s-resize",
    W_RESIZE    : "w-resize",
    N_RESIZE    : "n-resize",
    E_RESIZE    : "e-resize",
    COL_RESIZE  : "col-resize",
    HELP        : "help"
};

/**
 * Interface to express intention to control children UI components event handling by
 * making them events transparent. In the easiest way a component that needs take
 * control on input (mouse, keyboard, etc) events has to implement the
 * composite interface. For instance let's make a composite panel, what causes
 * any added to the panel zebra.ui.Button component will not react on any input
 * event:

        // declare composite panel class that set "catchInput"
        // property to true
        var CompositePan = zebra.Class(zebra.ui.Panel, [
            function $prototype() {
                this.catchInput = true;
            }
        ]);

        // instantiate an instance
        var cp = new CompositePan(new zebra.layout.FlowLayout());

        // add button that will not react since they are events transparent
        cp.add(new zebra.ui.Button("Button 1"));
        cp.add(new zebra.ui.Button("Button 2"));

 *
 * If some of the children components have to be made not event transparent
 * you have to implement "catchInput" method as follow:
 *

        // declare composite panel class that inherits standard zebra
        // panel class and implement catchInput method to make first
        // kid not event transparent
        var CompositePan = zebra.Class(zebra.ui.Panel, [
            function catchInput(kid) {
                // make first kid not event transparent
                return this.kids.length === 0 || this.kids[0] == kid;
            }
        ]);

        ...
 */

/**
 * Input event class. Input event is everything what is bound to user
 * inputing like keyboard, mouse, touch screen etc. This class often is
 * used as basis for more specialized input event classes.
 * @param {zebra.ui.Panel} target a source of the input event
 * @param {Integer} id an unique ID of the input event, for
 * instance zebra.ui.KeyEvent.PRESSED
 * @param {Integer} uid an unique class id of the input event,
 * for instance zebra.ui.InputEvent.MOUSE_UID
 * @class  zebra.ui.InputEvent
 * @constructor
 */
var IE = pkg.InputEvent = Class([
    function $clazz() {
        this.MOUSE_UID    = 1;
        this.KEY_UID      = 2;
        this.FOCUS_UID    = 3;

        //!!! don't change order
        this.FOCUS_LOST   = 10;
        this.FOCUS_GAINED = 11;
    },

    function $prototype() {
        this[''] = function (target, id, uid) {
            /**
             * Source of the input event
             * @attribute source
             * @readOnly
             * @type {zebra.ui.Panel}
             */
            this.source = target;

            /**
             * Unique id of the input event
             * @attribute ID
             * @readOnly
             * @type {Integer}
             */
            this.ID = id;

            /**
             * Class id of the input event. It helps to differentiates
             * input events by a device it has been generated
             * @attribute UID
             * @readOnly
             * @type {Integer}
             */
            this.UID = uid;
        };
    }
]),

/**
 * Input key event class. The input event is triggered by a
 * keyboard and has UID property set to zebra.ui.InputEvent.KEY_UID
 * value
 * @param {zebra.ui.Panel} target a source of the key input event
 * @param {Integer} id an unique ID of the key input event: zebra.ui.KeyEvent.PRESSED,
 * zebra.ui.KeyEvent.TYPED, zebra.ui.KeyEvent.RELEASED
 * @param {Integer} code a code of pressed key
 * @param {String} ch a character of typed key
 * @param {Integer} mask a bits mask of pressed meta keys:  zebra.ui.KeyEvent.M_CTRL,
 * zebra.ui.KeyEvent.M_SHIFT, zebra.ui.KeyEvent.M_ALT, zebra.ui.KeyEvent.M_CMD
 * @class  zebra.ui.KeyEvent
 * @extends zebra.ui.InputEvent
 * @constructor
 */
KE = pkg.KeyEvent = Class(IE, [
    function $clazz() {
        //!!! don't change order
        this.TYPED    = 15;
        this.RELEASED = 16;
        this.PRESSED  = 17;

        this.M_CTRL  = 1;
        this.M_SHIFT = 2;
        this.M_ALT   = 4;
        this.M_CMD   = 8;
    },

    function $prototype() {
        this.reset = function(target,id,code,ch,mask){
            this.source = target;
            this.ID     = id;

            /**
             * A code of a pressed key
             * @attribute code
             * @readOnly
             * @type {Integer}
             */
            this.code = code;

            /**
             * A bits mask of pressed meta keys (CTRL, ALT, etc)
             * @attribute mask
             * @readOnly
             * @type {Integer}
             */
            this.mask = mask;

            /**
             * A character of a typed key
             * @attribute ch
             * @readOnly
             * @type {String}
             */
            this.ch = ch;
        };

        /**
         * Test if CTRL key is held
         * @return {Boolean} true if CTRL key is held
         * @method isControlPressed
         */
        this.isControlPressed = function(){
            return (this.mask & KE.M_CTRL) > 0;
        };

        /**
         * Test if SHIFT key is held
         * @return {Boolean} true if SHIFT key is held
         * @method isShiftPressed
         */
        this.isShiftPressed   = function() {
            return (this.mask & KE.M_SHIFT) > 0;
        };

        /**
         * Test if ALT key is held
         * @return {Boolean} true if ALT key is held
         * @method isAltPressed
         */
        this.isAltPressed  = function(){
            return (this.mask & KE.M_ALT) > 0;
        };

        /**
         * Test if command (windows) key is held
         * @return {Boolean} true if command key is held
         * @method isCmdPressed
         */
        this.isCmdPressed = function(){
            return (this.mask & KE.M_CMD) > 0;
        };
    },

    function (target,id,code,ch,mask){
        this.$super(target, id, IE.KEY_UID);
        this.reset(target, id, code, ch, mask);
    }
]),

/**
 * Mouse and touch screen input event class. The input event is
 * triggered by a mouse or touch screen. It has UID property set
 * to zebra.ui.InputEvent.MOUSE_UID value
 * @param {zebra.ui.Panel} target a source of the mouse input event
 * @param {Integer} id an unique ID of the mouse input event:

        zebra.ui.MouseEvent.CLICKED
        zebra.ui.MouseEvent.PRESSED
        zebra.ui.MouseEvent.RELEASED
        zebra.ui.MouseEvent.ENTERED
        zebra.ui.MouseEvent.EXITED
        zebra.ui.MouseEvent.DRAGGED
        zebra.ui.MouseEvent.DRAGSTARTED
        zebra.ui.MouseEvent.DRAGENDED
        zebra.ui.MouseEvent.MOVED

 * @param {Integer} ax an absolute (relatively to a canvas where the source
 * UI component is hosted) mouse pointer x coordinate
 * @param {Integer} ax an absolute (relatively to a canvas where the source
 * UI component is hosted) mouse pointer y coordinate
 * @param {Integer} mask a bits mask of pressed mouse buttons:

         zebra.ui.MouseEvent.LEFT_BUTTON
         zebra.ui.MouseEvent.RIGHT_BUTTON

 * @param {Integer} clicks number of mouse button clicks
 * @class  zebra.ui.MouseEvent
 * @extends zebra.ui.InputEvent
 * @constructor
 */
ME = pkg.MouseEvent = Class(IE, [
    function $clazz() {
        //!!! don't change order
        this.CLICKED      = 21;
        this.PRESSED      = 22;
        this.RELEASED     = 23;
        this.ENTERED      = 24;
        this.EXITED       = 25;
        this.DRAGGED      = 26;
        this.DRAGSTARTED  = 27;
        this.DRAGENDED    = 28;
        this.MOVED        = 29;

        this.LEFT_BUTTON  = 128;
        this.RIGHT_BUTTON = 512;
    },

    function $prototype() {
        this.touchCounter = 1;

        /**
         * Absolute mouse pointer x coordinate
         * @attribute absX
         * @readOnly
         * @type {Integer}
         */

        /**
         * Absolute mouse pointer y coordinate
         * @attribute absY
         * @readOnly
         * @type {Integer}
         */

        /**
         * Mouse pointer x coordinate (relatively to source UI component)
         * @attribute x
         * @readOnly
         * @type {Integer}
         */

        /**
         * Mouse pointer y coordinate (relatively to source UI component)
         * @attribute y
         * @readOnly
         * @type {Integer}
         */

        /**
         * Number of times a mouse button has been pressed
         * @attribute clicks
         * @readOnly
         * @type {Integer}
         */

        /**
         * Number of fingers on a touch screen
         * @attribute touchCounter
         * @readOnly
         * @type {Integer}
         */

        /**
         * A bits mask of a pressed mouse button
         * @attribute mask
         * @readOnly
         * @type {Integer}
         */

        /**
         * State of modifier keys
         * @attribute modifiers
         * @readOnly
         * @type {Object}
         */

        /**
         * Reset the event properties with new values
         * @private
         * @param  {zebra.ui.Panel} target  a target component that triggers the event
         * @param  {Integer} id an unique id of the event
         * @param  {Integer} ax an absolute (relatively to a canvas where the target
         * component is hosted) x mouse cursor coordinate
         * @param  {Integer} ay an absolute (relatively to a canvas where the target
         * component is hosted) y mouse cursor coordinate
         * @param  {Integer} mask   a pressed mouse buttons mask
         * @param  {Integer} clicks number of a button clicks
         * @method  reset
         */
        this.reset = function(target,id,ax,ay,mask,clicks){
            this.ID     = id;
            this.mask   = mask;
            this.clicks = clicks;

            // this can speed up calculation significantly
            if (this.source == target && this.source.parent == target.parent && target.x == this.$px && target.y == this.$py) {
                this.x += (ax - this.absX);
                this.y += (ay - this.absY);
                this.absX = ax;
                this.absY = ay;
                this.source = target;
            }
            else
            {
                this.source = target;
                this.absX = ax;
                this.absY = ay;
                // convert absolute location to relative location
                while(target.parent != null){
                    ax -= target.x;
                    ay -= target.y;
                    target = target.parent;
                }
                this.x = ax;
                this.y = ay;
            }

            this.$px = target.x;
            this.$py = target.y;
        };

        this.isActionMask = function(){
            return this.mask == ME.LEFT_BUTTON;
        };
    },

    function (target,id,ax,ay,mask,clicks){
        this.$super(target, id, IE.MOUSE_UID);

        this.modifiers  = {
            altKey      : false,
            ctrlKey     : false,
            metaKey     : false,
            shiftKey    : false
        };

        this.reset(target, id, ax, ay, mask, clicks);
    }
]);

var MDRAGGED = ME.DRAGGED, EM = null, MMOVED = ME.MOVED, MEXITED = ME.EXITED,
    KPRESSED = KE.PRESSED, MENTERED = ME.ENTERED, $temporaryWinListener = null,
    context = Object.getPrototypeOf(document.createElement('canvas').getContext('2d')),
    $mousePressedEvents = {}, $keyPressedCode = -1, $keyPressedOwner = null,
    $keyPressedModifiers = 0, KE_STUB = new KE(null,  KPRESSED, 0, 'x', 0),
    ME_STUB = new ME("", ME.PRESSED, 0, 0, 0, 1);

pkg.paintManager = pkg.events = pkg.$mouseMoveOwner = null;

// !!!
// global mouse move events handler (registered by drag out a canvas surface)
// has to be removed every time a mouse button released with the given function
function $cleanDragFix() {
    if ($temporaryWinListener != null) {
        window.removeEventListener("mousemove", $temporaryWinListener, true);
        $temporaryWinListener = null;
    }
}

// !!!!
// the document mouse up happens when we drag outside a canvas.
// in this case canvas doesn't catch mouse up, so we gave to do it
// by global mouseup handler
document.addEventListener("mouseup", function(e) {
    $cleanDragFix();

    for(var k in $mousePressedEvents) {
        var mp = $mousePressedEvents[k];

        // !!!!
        // Check if the event target is not the canvas itself
        // On desktop  "mouseup" event is generated only if
        // you drag mouse outside a canvas and than release a mouse button
        // At the same time in Android native browser (and may be other mobile
        // browsers) "mouseup" event is fired every time you touch
        // canvas or any other element. So check if target is not a canvas
        // before doing releasing, otherwise it brings to error on mobile
        if (mp.canvas != null && mp.canvas.canvas != e.target) {
            mp.pageX = e.pageX;
            mp.pageY = e.pageY;
            mp.canvas.$mouseReleased(k, mp);
        }
    }
},  false); // false is important since if mouseUp  happens on
            // canvas the canvas gets the event first and than stops
            // propagating to prevent it


// !!!
// override alert to keep control on event sequence, it is very
// browser dependent
var $alert = (function(){ return this.alert; }());
window.alert = function() {
    if ($keyPressedCode > 0) {
        KE_STUB.reset($keyPressedOwner, KE.RELEASED,
                      $keyPressedCode, '', $keyPressedModifiers);
        EM.fireInputEvent(KE_STUB);
        $keyPressedCode = -1;
    }
    $alert.apply(window, arguments);
    for(var k in $mousePressedEvents) {
        var mp = $mousePressedEvents[k];
        if (mp.canvas != null) {
            mp.canvas.$mouseReleased(k, mp);
        }
    }
};

context.setFont = function(f) {
    f = (f.s != null ? f.s : f.toString());
    if (f != this.font) {
        this.font = f;
    }
};

context.setColor = function(c) {
    if (c == null) throw new Error("Null color");
    c = (c.s != null ? c.s : c.toString());
    if (c != this.fillStyle) this.fillStyle = c;
    if (c != this.strokeStyle) this.strokeStyle = c;
};

context.drawLine = function(x1, y1, x2, y2, w){
    if (arguments.length < 5) w = 1;
    var pw = this.lineWidth;
    this.beginPath();
    this.lineWidth = w;

    if (x1 == x2) {
        x1 += w / 2;
        x2 = x1;
    }
    else
    if (y1 == y2) {
        y1 += w / 2;
        y2 = y1;
    }

    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.stroke();
    this.lineWidth = pw;
};

context.ovalPath = function(x,y,w,h){
    this.beginPath();
    x += this.lineWidth;
    y += this.lineWidth;
    w -= 2 * this.lineWidth;
    h -= 2 * this.lineWidth;

    var kappa = 0.5522848,
        ox = (w / 2) * kappa,
        oy = (h / 2) * kappa,
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
};

context.polylinePath = function(xPoints, yPoints, nPoints){
    this.beginPath();
    this.moveTo(xPoints[0], yPoints[0]);
    for(var i=1; i < nPoints; i++) this.lineTo(xPoints[i], yPoints[i]);
};

context.drawDottedRect = function(x,y,w,h) {
    var ctx = this, m = ["moveTo", "lineTo", "moveTo"];
    function dv(x, y, s) { for(var i=0; i < s; i++) ctx[m[i%3]](x + 0.5, y + i); }
    function dh(x, y, s) { for(var i=0; i < s; i++) ctx[m[i%3]](x + i, y + 0.5); }
    ctx.beginPath();
    dh(x, y, w);
    dh(x, y + h - 1, w);
    ctx.stroke();
    ctx.beginPath();
    dv(x, y, h);
    dv(w + x - 1, y, h);
    ctx.stroke();
};

context.drawDashLine = function(x,y,x2,y2) {
    var pattern=[1,2], count = pattern.length, ctx = this, compute = null,
        dx = (x2 - x), dy = (y2 - y), b = (Math.abs(dx) > Math.abs(dy)),
        slope = b ? dy / dx : dx / dy, sign = b ? (dx < 0 ?-1:1) : (dy < 0?-1:1);

    if (b) {
        compute = function(step) {
            x += step;
            y += slope * step;
        };
    }
    else {
        compute = function(step) {
            x += slope * step;
            y += step;
        };
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    var dist = Math.sqrt(dx * dx + dy * dy), i = 0;
    while (dist >= 0.1) {
        var idx  = i % count;
            dl   = dist < pattern[idx] ? dist : pattern[idx],
            step = Math.sqrt(dl * dl / (1 + slope * slope)) * sign;
        compute(step);
        ctx[(i % 2 === 0) ? 'lineTo' : 'moveTo'](x + 0.5, y + 0.5);
        dist -= dl;
        i++;
    }
    ctx.stroke();
};

pkg.makeFullyVisible = function(d,c){
    if (arguments.length === 1) {
        c = d;
        d = c.parent;
    }

    var right  = d.getRight(),
        top    = d.getTop(),
        bottom = d.getBottom(),
        left   = d.getLeft(),
        xx     = c.x,
        yy     = c.y,
        ww     = c.width,
        hh     = c.height;

    if (xx < left) xx = left;
    if (yy < top)  yy = top;
    if (xx + ww > d.width - right) xx = d.width + right - ww;
    if (yy + hh > d.height - bottom) yy = d.height + bottom - hh;
    c.setLocation(xx, yy);
};

pkg.calcOrigin = function(x,y,w,h,px,py,t,tt,ll,bb,rr){
    if (arguments.length < 8) {
        tt = t.getTop();
        ll = t.getLeft();
        bb = t.getBottom();
        rr = t.getRight();
    }

    var dw = t.width, dh = t.height;
    if (dw > 0 && dh > 0){
        if (dw - ll - rr > w){
            var xx = x + px;
            if (xx < ll) px += (ll - xx);
            else {
                xx += w;
                if (xx > dw - rr) px -= (xx - dw + rr);
            }
        }
        if (dh - tt - bb > h){
            var yy = y + py;
            if (yy < tt) py += (tt - yy);
            else {
                yy += h;
                if (yy > dh - bb) py -= (yy - dh + bb);
            }
        }
        return [px, py];
    }
    return [0, 0];
};

/**
 * Load an image by the given URL.
 * @param  {String|Image} img an image URL or image object
 * @param  {Function} ready a call back method to be notified when the
 * image has been completely loaded or failed. The method gets three parameters

    - an URL to the image
    - boolean loading result. true means success
    - an image that has been loaded

            // load image
            zebra.ui.loadImage("test.png", function(path, result, image) {
                if (result === false) {
                    // handle error
                    ...
                }
            });

 * @return {Image}  an image
 * @api  zebra.ui.loadImage()
 * @method  loadImage
 */
pkg.loadImage = function(img, ready) {
    if (img instanceof Image && img.complete && img.naturalWidth !== 0) {
        if (arguments.length > 1)  {
            ready(img.src, true, img);
        }
        return img;
    }

    var i = new Image();
    i.crossOrigin = '';
    i.crossOrigin ='anonymous';

    zebra.busy();
    if (arguments.length > 1)  {
        i.onerror = function() {  zebra.ready(); ready(img, false, i); };
        i.onload  = function() {  zebra.ready(); ready(img, true, i);  };
    }
    else {
        i.onload = i.onerror = function() { zebra.ready(); };
    }

    i.src = (img instanceof Image) ? img.src : img;
    return i;
};

/**
 *  This the core UI component class. All other UI components has to be
 *  successor of panel class.

      // instantiate panel with no arguments
      var p = new zebra.ui.Panel();

      // instantiate panel with border layout set as its layout manager
      var p = new zebra.ui.Panel(new zebra.layout.BorderLayout());

      // instantiate panel with the given properties (border
      // layout manager, blue background and plain border)
      var p = new zebra.ui.Panel({
         layout: new zebra.ui.BorderLayout(),
         background : "blue",
         border     : "plain"
      });

 * **Container. **
 * Panel can contains number of other UI components as its children where
 * the children components are placed with a defined by the panel layout
 * manager:

      // add few children component to panel top, center and bottom parts
      // with help of border layout manager
      var p = new zebra.ui.Panel();
      p.setLayout(new zebra.layout.BorderLayout(4)); // set layout manager to
                                                     // order children components

      p.add(zebra.layout.TOP, new zebra.ui.Label("Top label"));
      p.add(zebra.layout.CENTER, new zebra.ui.TextArea("Text area"));
      p.add(zebra.layout.BOTTOM, new zebra.ui.Button("Button"));

 * **Events. **
 * The class provides possibility to catch various component and input
 * events by declaring an appropriate event method handler. The most
 * simple case you just define a method:

      var p = new zebra.ui.Panel();
      p.mousePressed = function(e) {
          // handle event here
      };

* If you prefer to create an anonymous class instance you can do it as
* follow:

      var p = new zebra.ui.Panel([
          function mousePressed(e) {
              // handle event here
          }
      ]);

* One more way to add the event handler is dynamic extending of an instance
* class demonstrated below:

      var p = new zebra.ui.Panel("Test");
      p.extend([
          function mousePressed(e) {
              // handle event here
          }
      ]);

 * Pay attention Zebra UI components often declare own event handlers and
 * in this case you can overwrite the default event handler with a new one.
 * Preventing the basic event handler execution can cause the component will
 * work improperly. You should care about the base event handler execution
 * as follow:

      // button component declares own mouse pressed event handler
      // we have to call the original handler to keep the button component
      // properly working
      var p = new zebra.ui.Button("Test");
      p.extend([
          function mousePressed(e) {
              this.$super(e); // call parent class event handler implementation
              // handle event here
          }
      ]);

 *  @class zebra.ui.Panel
 *  @param {Object|zebra.layout.Layout} [l] pass a layout manager or
 *  number of properties that have to be applied to the instance of
 *  the panel class.
 *  @constructor
 *  @extends zebra.layout.Layoutable
 */



/**
 * Implement the event handler method to catch mouse pressed event.
 * The event is triggered every time a mouse button has been pressed or
 * a finger has touched a touch screen.

     var p = new zebra.ui.Panel();
     p.mousePressed = function(e) { ... }; // add event handler

 * @event mousePressed
 * @param {zebra.ui.MouseEvent} e a mouse event
*/

/**
 * Implement the event handler method to catch mouse released event.
 * The event is triggered every time a mouse button has been released or
 * a finger has untouched a touch screen.

     var p = new zebra.ui.Panel();
     p.mouseReleased = function(e) { ... }; // add event handler

 * @event mouseReleased
 * @param {zebra.ui.MouseEvent} e a mouse event
 */

/**
 * Implement the event handler method  to catch mouse moved event.
 * The event is triggered every time a mouse cursor has been moved with
 * no a mouse button pressed.

     var p = new zebra.ui.Panel();
     p.mouseMoved = function(e) { ... }; // add event handler

 * @param {zebra.ui.MouseEvent} e a mouse event
 * @event  mouseMoved
 */

/**
 * Implement the event handler method to catch mouse entered event.
 * The event is triggered every time a mouse cursor entered the
 * given component.

     var p = new zebra.ui.Panel();
     p.mouseEntered = function(e) { ... }; // add event handler

 * @param {zebra.ui.MouseEvent} e a mouse event
 * @event  mouseEntered
 */

/**
 * Implement the event handler method to catch mouse exited event.
 * The event is triggered every time a mouse cursor exited the given
 * component.

     var p = new zebra.ui.Panel();
     p.mouseExited = function(e) { ... }; // add event handler

 * @param {zebra.ui.MouseEvent} e a mouse event
 * @event  mouseExited
 */

/**
 * Implement the event handler method to catch mouse clicked event.
 * The event is triggered every time a mouse button has been clicked. Click events
 * are generated only if no one mouse moved or drag events has been generated
 * in between mouse pressed -> mouse released events sequence.

     var p = new zebra.ui.Panel();
     p.mouseClicked = function(e) { ... }; // add event handler

 * @param {zebra.ui.MouseEvent} e a mouse event
 * @event  mouseClicked
 */

/**
 * Implement the event handler method to catch mouse dragged event.
 * The event is triggered every time a mouse cursor has been moved when a mouse button
 * has been pressed. Or when a finger has been moved over a touch screen.

     var p = new zebra.ui.Panel();
     p.mouseDragged = function(e) { ... }; // add event handler

 * @param {zebra.ui.MouseEvent} e a mouse event
 * @event  mouseDragged
 */

/**
 * Implement the event handler method to catch mouse drag started event.
 * The event is triggered every time a mouse cursor has been moved first time when a mouse button
 * has been pressed. Or when a finger has been moved first time over a touch screen.

     var p = new zebra.ui.Panel();
     p.mouseDragStarted = function(e) { ... }; // add event handler

 * @param {zebra.ui.MouseEvent} e a mouse event
 * @event  mouseDragStarted
*/

/**
 * Implement the event handler method to catch mouse drag ended event.
 * The event is triggered every time a mouse cursor has been moved last time when a mouse button
 * has been pressed. Or when a finger has been moved last time over a touch screen.

     var p = new zebra.ui.Panel();
     p.mouseDragEnded = function(e) { ... }; // add event handler

 * @param {zebra.ui.MouseEvent} e a mouse event
 * @event  mouseDragEnded
*/

/**
 * Implement the event handler method to catch key pressed event
 * The event is triggered every time a key has been pressed.

     var p = new zebra.ui.Panel();
     p.keyPressed = function(e) { ... }; // add event handler

 * @param {zebra.ui.KeyEvent} e a key event
 * @event  keyPressed
 */

/**
 * Implement the event handler method to catch key types event
 * The event is triggered every time a key has been typed.

     var p = new zebra.ui.Panel();
     p.keyTyped = function(e) { ... }; // add event handler

 * @param {zebra.ui.KeyEvent} e a key event
 * @event  keyTyped
 */

/**
 * Implement the event handler method to catch key released event
 * The event is triggered every time a key has been released.

     var p = new zebra.ui.Panel();
     p.keyReleased = function(e) { ... }; // add event handler

 * @param {zebra.ui.KeyEvent} e a key event
 * @event  keyReleased
 */

/**
 * Implement the event handler method to catch the component sized event
 * The event is triggered every time the component has been re-sized.

     var p = new zebra.ui.Panel();
     p.compSized = function(c, pw, ph) { ... }; // add event handler

 * @param {zebra.ui.Panel} c a component that has been sized
 * @param {Integer} pw a previous width the sized component had
 * @param {Integer} ph a previous height the sized component had
 * @event compSized
 */

/**
 * Implement the event handler method to catch component moved event
 * The event is triggered every time the component location has been
 * updated.

     var p = new zebra.ui.Panel();
     p.compMoved = function(c, px, py) { ... }; // add event handler

 * @param {zebra.ui.Panel} c a component that has been moved
 * @param {Integer} px a previous x coordinate the moved component had
 * @param {Integer} py a previous y coordinate the moved component had
 * @event compMoved
 */

/**
 * Implement the event handler method to catch component enabled event
 * The event is triggered every time a component enabled state has been
 * updated.

     var p = new zebra.ui.Panel();
     p.compEnabled = function(c) { ... }; // add event handler

 * @param {zebra.ui.Panel} c a component whose enabled state has been updated
 * @event compEnabled
 */

/**
 * Implement the event handler method to catch component shown event
 * The event is triggered every time a component visibility state has
 * been updated.

     var p = new zebra.ui.Panel();
     p.compShown = function(c) { ... }; // add event handler

 * @param {zebra.ui.Panel} c a component whose visibility state has been updated
 * @event compShown
 */

/**
 * Implement the event handler method to catch component added event
 * The event is triggered every time the component has been inserted into
 * another one.

     var p = new zebra.ui.Panel();
     p.compAdded = function(p, constr, c) { ... }; // add event handler

 * @param {zebra.ui.Panel} p a parent component of the component has been added
 * @param {Object} constr a layout constraints
 * @param {zebra.ui.Panel} c a component that has been added
 * @event compAdded
 */

/**
 * Implement the event handler method to catch component removed event
 * The event is triggered every time the component has been removed from
 * its parent UI component.

     var p = new zebra.ui.Panel();
     p.compRemoved = function(p, i, c) { ... }; // add event handler

 * @param {zebra.ui.Panel} p a parent component of the component that has been removed
 * @param {Integer} i an index of removed component
 * @param {zebra.ui.Panel} c a component that has been removed
 * @event compRemoved
 */

/**
 * Implement the event handler method to catch component focus gained event
 * The event is triggered every time a component has gained focus.

     var p = new zebra.ui.Panel();
     p.focusGained = function(e) { ... }; // add event handler

 * @param {zebra.ui.InputEvent} e an input event
 * @event  focusGained
 */

/**
 * Implement the event handler method to catch component focus lost event
 * The event is triggered every time a component has lost focus

     var p = new zebra.ui.Panel();
     p.focusLost = function(e) { ... }; // add event handler

 * @param {zebra.ui.InputEvent} e an input event
 * @event  focusLost
 */

/**
 * Implement the event handler method to catch children components input events
 *

     var p = new zebra.ui.Panel();
     p.childInputEvent = function(e) { ... }; // add event handler

 * @param {zebra.ui.InputEvent} e an input event
 * @event  childInputEvent
 */

/**
 * Implement the event handler method to catch children components component events
 *
     var p = new zebra.ui.Panel();
     p.childCompEvent = function(id, src, p1, p2) { ... }; // add event handler

 * @param {Integer} id a component event ID. The id can have one of the following value:

        zebra.ui.Panel.ENABLED
        zebra.ui.Panel.SHOWN
        zebra.ui.Panel.MOVED
        zebra.ui.Panel.SIZED
        zebra.ui.Panel.ADDED
        zebra.ui.Panel.REMOVED

 * @param {zebra.ui.Panel} src a component that triggers the event
 * @param {zebra.ui.Panel|Integer|Object} p1 an event first parameter that depends
 * on an component event that has happened

        if id is zebra.ui.Panel.SIZED the parameter is previous component width
        if id is zebra.ui.Panel.MOVED the parameter is previous component x location
        if id is zebra.ui.Panel.ADDED the parameter is constraints a new component has been added
        if id is zebra.ui.Panel.REMOVED the parameter is null

 * @param {zebra.ui.Panel|Integer|Object} p2 an event second parameter depends
 * on an component event that has happened

        if id is zebra.ui.Panel.SIZED the parameter is previous component height
        if id is zebra.ui.Panel.MOVED the parameter is previous component y location
        if id is zebra.ui.Panel.ADDED the parameter is reference to the added children component
        if id is zebra.ui.Panel.REMOVED the parameter is reference to the removed children component

 * @event  childCompEvent
 */


 /**
  * The method is called for focusable UI components (components that can hold input focus) to ask
  * a string to be saved in native clipboard
  * @return {String} a string to be copied in native clipboard
  *
  * @event clipCopy
  */

 /**
  * The method is called to pass string from clipboard to a focusable (a component that can hold
  * input focus) UI component
  *
  * @param {String} s a string from native clipboard
  *
  * @event clipPaste
  */


var CL = pkg.Panel = Class(L.Layoutable, [
    function $clazz() {
        this.ENABLED  = 1;
        this.SHOWN    = 2;
        this.MOVED    = 3;
        this.SIZED    = 4;
        this.ADDED    = 5;
        this.REMOVED  = 6;
    },

    function $prototype() {
        /**
         * UI component border view
         * @attribute border
         * @default null
         * @readOnly
         * @type {zebra.ui.View}
         */

        /**
         * UI component background view
         * @attribute bg
         * @default null
         * @readOnly
         * @type {zebra.ui.View}
        */

        /**
         * Define and set the property to true if the component has to catch focus
         * @attribute canHaveFocus
         * @type {Boolean}
         * @default undefined
         */

        this.top = this.left = this.right = this.bottom = 0;

        /**
         * UI component enabled state
         * @attribute isEnabled
         * @default true
         * @readOnly
         * @type {Boolean}
         */
        this.isEnabled = true;

        /**
         * Find a zebra.ui.zCanvas where the given UI component is hosted
         * @return {zebra.ui.zCanvas} a zebra canvas
         * @method getCanvas
         */
        this.getCanvas = function() {
            var c = this;
            for(; c != null && c.$isMasterCanvas !== true; c = c.parent);
            return c;
        };

        this.notifyRender = function(o,n){
            if (o != null && o.ownerChanged) o.ownerChanged(null);
            if (n != null && n.ownerChanged) n.ownerChanged(this);
        };

        /**
         * Shortcut method to register the specific to the concrete component
         * events listener. For instance "zebra.ui.Button" component fires event
         * when it is pressed:

        var b = new zebra.ui.Button("Test");
        b.bind(function() {
            // button has been pressed
        });


         * @param {Function|Object} a listener function or an object that
         * declares events handler methods
         * @return {Function|Object} a registered listener
         * @method bind
         */

        /**
         * Shortcut method to remove the register component specific events listener
         * @param {Function|Object} a listener function to be removed
         * @method unbind
         */


        /**
         * Load content of the panel UI components from the specified JSON file.
         * @param  {String} jsonPath an URL to a JSON file that describes UI
         * to be loaded into the panel
         * @chainable
         * @method load
         */
        this.load = function(jsonPath) {
            new pkg.Bag(this).loadByUrl(jsonPath);
            return this;
        };

        /**
         * Get a children UI component that embeds the given point.
         * @param  {Integer} x x coordinate
         * @param  {Integer} y y coordinate
         * @return {zebra.ui.Panel} a children UI component
         * @method getComponentAt
         */
        this.getComponentAt = function(x,y){
            var r = $cvp(this, temporary);
            if (r == null || (x < r.x || y < r.y ||
                x >= r.x + r.width || y >= r.y + r.height))
            {
                return null;
            }

            if (this.kids.length > 0){
                for(var i = this.kids.length; --i >= 0; ){
                    var d = this.kids[i];
                    d = d.getComponentAt(x - d.x, y - d.y);
                    if (d != null) return d;
                }
            }
            return this.contains == null || this.contains(x, y) ? this : null;
        };

        /**
         * Shortcut method to invalidating the component
         * and initiating the component repainting
         * @method vrp
         */
        this.vrp = function(){
            this.invalidate();

            // extra condition to save few millisecond on repaint() call
            if (this.isVisible === true && this.parent != null) {
                this.repaint();
            }
        };

        this.getTop = function() {
            return this.border != null ? this.top + this.border.getTop()
                                       : this.top;
        };

        this.getLeft = function() {
            return this.border != null ? this.left + this.border.getLeft()
                                       : this.left;
        };

        this.getBottom = function() {
            return this.border != null ? this.bottom + this.border.getBottom()
                                       : this.bottom;
        };

        this.getRight  = function() {
            return this.border != null ? this.right  + this.border.getRight()
                                       : this.right;
        };

        //TODO: the method is not used yet
        this.isInvalidatedByChild = function(c) {
            return true;
        };

        /**
         * The method is implemented to be aware about a children component
         * insertion.
         * @param  {Integer} index an index at that a new children component
         * has been added
         * @param  {Object} constr a layout constraints of an inserted component
         * @param  {zebra.ui.Panel} l a children component that has been inserted
         * @method kidAdded
         */
        this.kidAdded = function (index,constr,l){
            pkg.events.fireCompEvent(CL.ADDED, this, constr, l);

            if (l.width > 0 && l.height > 0) {
                l.repaint();
            }
            else {
                this.repaint(l.x, l.y, 1, 1);
            }
        };

        /**
         * The method is implemented to be aware about a children component
         * removal.
         * @param  {Integer} i an index of a removed component
         * @param  {zebra.ui.Panel} l a removed children component
         * @method kidRemoved
         */
        this.kidRemoved = function(i,l){
            pkg.events.fireCompEvent(CL.REMOVED, this, i, l);
            if (l.isVisible === true) {
                // TODO: some browser requires (IE10-11) one pix wider cleaning
                if (l.width > 0 && l.height > 0) {
                    var dt = pkg.$applyRenderExploit === true ? 1 : 0;
                    this.repaint(l.x - dt, l.y - dt, l.width + 2*dt, l.height + 2*dt);
                }
            }
        };

        /**
         * The method is implemented to be aware the
         * component location updating
         * @param  {Integer} px a previous x coordinate of the component
         * @param  {Integer} py a previous y coordinate of the component
         * @method relocated
         */
        this.relocated = function(px,py){
            pkg.events.fireCompEvent(CL.MOVED, this, px, py);

            var p = this.parent, w = this.width, h = this.height;
            if (p != null && w > 0 && h > 0){
                var x = this.x, y = this.y, nx = x < px ? x : px, ny = y < py ? y : py;

                //TODO: some mobile browser has bug: moving a component
                //      leaves 0.5 sized traces to fix it 1 pixel extra
                //      has to be added to all sides of repainted rect area
                nx--;
                ny--;

                if (nx < 0) nx = 0;
                if (ny < 0) ny = 0;

                var w1 = p.width - nx,
                    w2 = w + (x > px ? x - px : px - x),
                    h1 = p.height - ny,
                    h2 = h + (y > py ? y - py : py - y);

                // TODO: add crappy 2 for mobile (android)
                pkg.paintManager.repaint(p, nx, ny, (w1 < w2 ? w1 : w2) + 2,
                                                    (h1 < h2 ? h1 : h2) + 2);
            }
        };

        /**
         * The method is implemented to be aware the
         * component size updating
         * @param  {Integer} pw a previous width of the component
         * @param  {Integer} ph a previous height of the component
         * @method resized
         */
        this.resized = function(pw,ph) {
            pkg.events.fireCompEvent(CL.SIZED, this, pw, ph);

            if (this.parent != null) {
                // TODO: IE10-11 leaves traces at the left and bottom
                // sides when the component size is decreased,
                // so it is necessary to repaint one pixel wider
                var dt = pkg.$applyRenderExploit === true ? 1 : 0;

                pkg.paintManager.repaint(this.parent, this.x - dt, this.y - dt,
                                        ((this.width  > pw) ? this.width  : pw) + 2*dt,
                                        ((this.height > ph) ? this.height : ph) + 2*dt );
            }
        };

        /**
         * Checks if the component has a focus
         * @return {Boolean} true if the component has focus
         * @method hasFocus
         */
        this.hasFocus = function(){
            return pkg.focusManager.hasFocus(this);
        };

        /**
         * Force the given component to catch focus if the component is focusable.
         * @method requestFocus
         */
        this.requestFocus = function(){
            pkg.focusManager.requestFocus(this);
        };

        /**
         * Force the given component to catch focus in the given timeout.
         * @param {Integer} [timeout] a timeout in milliseconds. The default value is 50
         * @method requestFocusIn
         */
        this.requestFocusIn = function(timeout) {
            if (arguments.length === 0) {
                timeout = 50;
            }
            var $this = this;
            setTimeout(function () {
                $this.requestFocus();
            }, timeout);
        };

        /**
         * Set the UI component visibility
         * @param  {Boolean} b a visibility state
         * @method setVisible
         * @chainable
         */
        this.setVisible = function (b){
            if (this.isVisible != b) {
                this.isVisible = b;
                this.invalidate();
                pkg.events.fireCompEvent(CL.SHOWN, this, -1,  -1);

                if (this.parent != null) {
                    if (b) this.repaint();
                    else {
                        this.parent.repaint(this.x, this.y, this.width, this.height);
                    }
                }
            }
            return this;
        };

        /**
         *  Set the UI component enabled state. Using this property
         *  an UI component can be excluded from getting input events
         *  @param  {Boolean} b a enabled state
         *  @method setEnabled
         *  @chainable
         */
        this.setEnabled = function (b){
            if (this.isEnabled != b){
                this.isEnabled = b;
                pkg.events.fireCompEvent(CL.ENABLED, this, -1,  -1);
                if (this.kids.length > 0) {
                    for(var i = 0;i < this.kids.length; i++) {
                        this.kids[i].setEnabled(b);
                    }
                }
                this.repaint();
            }
            return this;
        };

        /**
         * Set the UI component top, right, left, bottom paddings to the same given value
         * @param  {Integer} v the value that will be set as top, right, left, bottom UI
         * component paddings
         * @method setPadding
         * @chainable
         */

        /**
         * Set UI component top, left, bottom, right paddings. The paddings are
         * gaps between component border and painted area.
         * @param  {Integer} top a top padding
         * @param  {Integer} left a left padding
         * @param  {Integer} bottom a bottom padding
         * @param  {Integer} right a right padding
         * @method setPadding
         * @chainable
         */
        this.setPadding = function (top,left,bottom,right){
            if (arguments.length == 1) {
                left = bottom = right = top;
            }

            if (this.top    != top    || this.left != left  ||
                this.bottom != bottom || this.right != right  )
            {
                this.top = top;
                this.left = left;
                this.bottom = bottom;
                this.right = right;
                this.vrp();
            }
            return this;
        },

        /**
         * Set the border view
         * @param  {zebra.ui.View|Function|String} v a border view or border "paint(g,x,y,w,h,c)"
         * rendering function or border type: "plain", "sunken", "raised", "etched"
         * @method setBorder
         * @chainable
         */
        this.setBorder = function (v) {
            var old = this.border;
            v = pkg.$view(v);
            if (v != old){
                this.border = v;
                this.notifyRender(old, v);

                if ( old == null || v == null         ||
                     old.getTop()    != v.getTop()    ||
                     old.getLeft()   != v.getLeft()   ||
                     old.getBottom() != v.getBottom() ||
                     old.getRight()  != v.getRight())
                {
                    this.invalidate();
                }

                if (v && v.activate) {
                    v.activate(this.hasFocus() ?  "function": "focusoff");
                }

                this.repaint();
            }
            return this;
        };

        /**
         * Set the background. Background can be a color string or a zebra.ui.View class
         * instance, or a function(g,x,y,w,h,c) that paints the background:

            // set background color
            comp.setBackground("red");

            // set a picture as a component background
            comp.setBackground(new zebra.ui.Picture(...));

            // set a custom rendered background
            comp.setBackground(function (g,x,y,w,h,target) {
                // paint a component background here
                g.setColor("blue");
                g.fillRect(x,y,w,h);
                g.drawLine(...);
                ...
            });


         * @param  {String|zebra.ui.View|Function} v a background view, color or
         * background "paint(g,x,y,w,h,c)" rendering function.
         * @method setBackground
         * @chainable
         */
        this.setBackground = function (v){
            var old = this.bg;
            v = pkg.$view(v);
            if (v != old) {
                this.bg = v;
                this.notifyRender(old, v);
                this.repaint();
            }
            return this;
        };

        /**
         * Add the given children component or number of components to the given panel.
         * @protected
         * @param {zebra.ui.Panel|Array|Object} a children component of number of
         * components to be added. The parameter can be:

    - Component
    - Array of components
    - Dictionary object where every element is a component to be added and the key of
    the component is stored in the dictionary is considered as the component constraints

         * @method setKids
         */
        this.setKids = function(a) {
            if (arguments.length == 1 && instanceOf(a, pkg.Panel)) {
               this.add(a);
               return;
            }

            // if components list passed as number of arguments
            if (arguments.length > 1) {
                for(var i=0; i < arguments.length; i++) {
                    var a = arguments[i];
                    this.add(a.$new != null ? a.$new() : a);
                }
                return;
            }

            if (Array.isArray(a)) {
                for(var i=0; i < a.length; i++) {
                    this.add(a[i]);
                }
            }
            else {
                var kids = a;
                for(var k in kids) {
                    if (kids.hasOwnProperty(k)) {
                        var ctr = L.$constraints(k);
                        this.add(ctr, kids[k]);
                    }
                }
            }
        };

        /**
         * Called whenever the UI component gets or looses focus
         * @method focused
         */
        this.focused = function() {
            // extents of activate method indicates it is
            if (this.border && this.border.activate) {
                var id = this.hasFocus() ? "focuson" : "focusoff" ;
                if (this.border.views[id]) {
                    this.border.activate(id);
                    this.repaint();
                }
            }
        };

        /**
         * Request the whole UI component or part of the UI component to be repainted
         * @param  {Integer} [x] x coordinate of the component area to be repainted
         * @param  {Integer} [y] y coordinate of the component area to be repainted
         * @param  {Integer} [w] width of the component area to be repainted
         * @param  {Integer} [h] height of the component area to be repainted
         * @method repaint
         */
        this.repaint = function(x,y,w,h){
            if (arguments.length === 0) {
                x = y = 0;
                w = this.width;
                h = this.height;
            }

            if (this.parent != null && this.width > 0 && this.height > 0 && pkg.paintManager != null){
                pkg.paintManager.repaint(this, x, y, w, h);
            }
        };

        /**
         * Remove all children UI components
         * @method removeAll
         */
        this.removeAll = function (){
            if (this.kids.length > 0){
                var size = this.kids.length, mx1 = Number.MAX_VALUE, my1 = mx1, mx2 = 0, my2 = 0;
                for(; size > 0; size--){
                    var child = this.kids[size - 1];
                    if (child.isVisible === true){
                        var xx = child.x, yy = child.y;
                        mx1 = mx1 < xx ? mx1 : xx;
                        my1 = my1 < yy ? my1 : yy;
                        mx2 = Math.max(mx2, xx + child.width);
                        my2 = Math.max(my2, yy + child.height);
                    }
                    this.removeAt(size - 1);
                }
                this.repaint(mx1, my1, mx2 - mx1, my2 - my1);
            }
        };

        /**
         * Bring the UI component to front
         * @method toFront
         */
        this.toFront = function(){
            if (this.parent != null && this.parent.kids[this.parent.kids.length-1] != this){
                var p = this.parent;
                p.kids.splice(p.indexOf(this), 1);
                p.kids[p.kids.length] = this;
                p.vrp();
            }
        };

        /**
         * Send the UI component to back
         * @method toBack
         */
        this.toBack = function(){
            if (this.parent != null && this.parent.kids[0] != this){
                var p = this.parent;
                p.kids.splice(p.indexOf(this), 1);
                p.kids.unshift(this);
                p.vrp();
            }
        };

        /**
         * Set the UI component size to its preferred size
         * @return {Object} a preferred size applied to the component.
         * The structure of the returned object is the following:

            { width:{Integer}, height:{Integer} }

         * @method toPreferredSize
         */
        this.toPreferredSize = function (){
            var ps = this.getPreferredSize();
            this.setSize(ps.width, ps.height);
            return ps;
        };

        this[''] = function(l) {
            // !!! dirty trick to call super, for the sake of few milliseconds back
            //this.$super();
            L.Layoutable.prototype[zebra.CNAME].call(this);

            // apply default properties
            this.properties(this.$clazz);

            //var clazz = this.$clazz;
            // while (clazz != null) {
            //     if (clazz.properties != null) {
            //         this.properties(clazz.properties);
            //         break;
            //     }
            //     clazz = clazz.$parent;
            // }

            if (arguments.length > 0) {
                if (instanceOf(l, L.Layout)) this.setLayout(l);
                else this.properties(l);
            }
        };
    }
]);

/**
 * Base layer UI component. Layer is special type of UI
 * components that is used to decouple different logical
 * UI components types from each other. Zebra Canvas
 * consists from number of layers where only one can be
 * active at the given point in time. Layers are stretched
 * to fill full canvas size. Every time an input event
 * happens system detects an active layer by asking all
 * layers from top to bottom. First layer that wants to
 * catch input gets control. The typical layers examples
 * are window layer, popup menus layer and so on.
 * @param {String} id an unique id to identify the layer
 * @constructor
 * @class zebra.ui.BaseLayer
 * @extends {zebra.ui.Panel}
 */
pkg.BaseLayer = Class(pkg.Panel, [
    function $prototype() {
        /**
         *  Define the method to catch mouse pressed event and
         *  answer if the layer wants to have a control.
         *  If the method is not defined it is considered as the
         *  layer is not activated by the mouse event
         *  @param {Integer} x a x mouse cursor location
         *  @param {Integer} y a y mouse cursor location
         *  @param {Integer} m mouse pressed button mask
         *  @return {Boolean} return true if the layer wants to
         *  catch control
         *  @method layerMousePressed
         */

        /**
         *  Define the method to catch key pressed event and
         *  answer if the layer wants to have a control.
         *  If the method is not defined it is considered
         *  as the key event doesn't activate the layer
         *  @param {Integer} code a key code
         *  @param {Integer} m key modifier mask
         *  @return {Boolean} return true if the layer wants to
         *  catch control
         *  @method layerKeyPressed
         */

        /**
         *  Ask if the layer is active at the given location.
         *  If the method is not defined that means the layer
         *  is active at any location.
         *  @param {Integer} x a x location
         *  @param {Integer} y a y location
         *  @return {Boolean} return true if the layer is active
         *  at this location
         *  @method isLayerActiveAt
         */
        

        this.getFocusRoot = function(child) {
            return this;
        };

        this.activate = function(b){
            var fo = pkg.focusManager.focusOwner;
            if (L.isAncestorOf(this, fo) === false) fo = null;

            if (b) pkg.focusManager.requestFocus(fo != null ? fo : this.$pfo);
            else {
                this.$pfo = fo;
                pkg.focusManager.requestFocus(null);
            }
        };
    },

    function(id){
        if (id == null) {
            throw new Error("Invalid layer id: " + id);
        }

        this.$pfo = null;
        this.$super();

        /**
         * Id of the layer
         * @attribute id
         * @type {String}
         * @readOnly
         */
        this.id = id;
    }
]);

/**
 *  Root layer implementation. This is the simplest UI layer implementation
 *  where the layer always try grabbing all input event
 *  @class zebra.ui.RootLayer
 *  @constructor
 *  @extends {zebra.ui.BaseLayer}
 */
pkg.RootLayer = Class(pkg.BaseLayer, [
    function $prototype() {
        this.layerMousePressed = function(x,y,m){
            return true;
        };

        this.layerKeyPressed = function(code,m){
            return true;
        };
    }
]);

/**
 *  UI component to keep and render the given "zebra.ui.View" class
 *  instance. The target view defines the component preferred size
 *  and the component view.
 *  @class zebra.ui.ViewPan
 *  @constructor
 *  @extends {zebra.ui.Panel}
 */
pkg.ViewPan = Class(pkg.Panel, [
    function $prototype() {
        /**
         * Reference to a view that the component visualize
         * @attribute view
         * @type {zebra.ui.View}
         * @default null
         * @readOnly
         */
        this.view = null;

        this.paint = function (g){
            if (this.view != null){
                var l = this.getLeft(), t = this.getTop();
                this.view.paint(g, l, t, this.width  - l - this.getRight(),
                                         this.height - t - this.getBottom(), this);
            }
        };

        /**
         * Set the target view to be wrapped with the UI component
         * @param  {zebra.ui.View|Function} v a view or a rendering
         * view "paint(g,x,y,w,h,c)" function
         * @method setView
         * @chainable
         */
        this.setView = function (v){
            var old = this.view;
            v = pkg.$view(v);

            if (v != old) {
                this.view = v;
                this.notifyRender(old, v);
                this.vrp();
            }

            return this;
        };

        /**
         * Override the parent method to calculate preferred size
         * basing on a target view.
         * @param  {zebra.ui.Panel} t [description]
         * @return {Object} return a target view preferred size if it is defined.
         * The returned structure is the following:
              { width: {Integer}, height:{Integer} }
         * @method  calcPreferredSize
         */
        this.calcPreferredSize = function (t) {
            return this.view ? this.view.getPreferredSize() : { width:0, height:0 };
        };
    }
]);

/**
 *  Image panel UI component class. The component renders an image.
 *  @param {String|Image} [img] a path or direct reference to an image object.
 *  If the passed parameter is string it considered as path to an image.
 *  In this case the image will be loaded using the passed path.
 *  @class zebra.ui.ImagePan
 *  @constructor
 *  @extends zebra.ui.ViewPan
 */
pkg.ImagePan = Class(pkg.ViewPan, [
    function () {
        this.$this(null);
    },

    function(img){
        this.setImage(img);
        this.$super();
    },

    function(img, w, h){
        this.setImage(img != null ? img : null);
        this.$super();
        this.setPreferredSize(w, h);
    },

    /**
     * Set image to be rendered in the UI component
     * @method setImage
     * @param {String|Image|zebra.ui.Picture} img a path or direct reference to an
     * image or zebra.ui.Picture render.
     * If the passed parameter is string it considered as path to an image.
     * In this case the image will be loaded using the passed path
     * @chainable
     */
    function setImage(img) {
        if (img != null) {
            var $this = this, isPic = instanceOf(img, pkg.Picture), imgToLoad = isPic ? img.target : img ;
            pkg.loadImage(imgToLoad,
                function(p, b, i) {
                    if (b) {
                        $this.setView(isPic ? img : new pkg.Picture(i));

                        // it is important to analyze if the given component has zero size
                        // if it is true the repainting will not occur what means validation
                        // is also will not happen, adjust width and height to be none zero
                        if ($this.width === 0 || $this.height === 0) {
                            $this.width  = i.width;
                            $this.height = i.height;
                        }

                        $this.vrp();
                    }

                    if ($this.imageLoaded != null) {
                        $this.imageLoaded(p, b, i);
                    }
                }
            );
        }
        else {
            this.setView(null);
        }
        return this;
    }
]);

/**
 *  UI manager class. The class is widely used as base for building
 *  various UI managers like paint, focus, event etc. Manager is
 *  automatically registered as input and component events listener
 *  if it implements appropriate events methods handlers
 *  @class zebra.ui.Manager
 *  @constructor
 */
pkg.Manager = Class([
    function() {
        // FIXME: should be removed
        //!!! sometimes pkg.events is set to descriptor the descriptor
        //    is used to instantiate new event manager. when we do it
        //    Manager constructor is called from new phase of event manager
        //    instantiation what means  event manager is not null (points to descriptor)
        //    but not assigned yet. So we need check extra condition pkg.events.addListener != null
        if (pkg.events != null && pkg.events.addListener != null) {
            pkg.events.addListener(this);
        }
    }
]);

/**
 *  Paint UI manager abstract class. The class has to be used as
 *  basis to introduce an own paint manager implementations. The
 *  simplest implementation has to extend "zebra.ui.PaintManager"
 *  with "paintComponent(g,c)" method. The method defines how the
 *  given component "c" has to be rendered using 2D context "g".
 *  @class zebra.ui.PaintManager
 *  @extends {zebra.ui.Manager}
 */
pkg.PaintManager = Class(pkg.Manager, [
    function $prototype() {
        var $timers = {};

        /**
         * Ask for repainting of the given rectangular area of the specified UI component. This method
         * doesn't do repainting immediately. It calculates the dirty area of the whole canvas and then
         * schedule repainting. Real repainting happens when all repaint method executions are satisfied.
         * @param  {zebra.ui.Panel} c an UI component that requests repainting
         * @param  {Integer} [x] x coordinate of top-left corner of a rectangular area to be repainted
         * @param  {Integer} [y] y coordinate of top-left corner of a rectangular area to be repainted
         * @param  {Integer} [w] w width of top-left corner of a rectangular area to be repainted
         * @param  {Integer} [h] h height of top-left corner of a rectangular area to be repainted
         * @method repaint
         */
        this.repaint = function(c,x,y,w,h){
            if (arguments.length == 1) {
                x = y = 0;
                w = c.width;
                h = c.height;
            }

            if (w > 0 && h > 0 && c.isVisible === true){
                var r = $cvp(c, temporary);
                if (r == null) return;

                MB.intersection(r.x, r.y, r.width, r.height, x, y, w, h, r);
                if (r.width <= 0 || r.height <= 0) return;

                x = r.x;
                y = r.y;
                w = r.width;
                h = r.height;

                //!!! find buffer that hold the given component
                var canvas = c;
                for(; canvas != null && canvas.$context == null; canvas = canvas.parent);

                if (canvas != null){
                    var x2 = canvas.width, y2 = canvas.height;

                    // calculate abs location
                    var cc = c;
                    while (cc != canvas) {
                        x += cc.x;
                        y += cc.y;
                        cc = cc.parent;
                    }

                    if (x < 0) {
                        w += x;
                        x = 0;
                    }

                    if (y < 0) {
                        h += y;
                        y = 0;
                    }

                    if (w + x > x2) w = x2 - x;
                    if (h + y > y2) h = y2 - y;

                    if (w > 0 && h > 0) {
                        var da = canvas.$da;
                        if (da.width > 0) {
                            if (x >= da.x                &&
                                y >= da.y                &&
                                x + w <= da.x + da.width &&
                                y + h <= da.y + da.height  )
                            {
                                return;
                            }
                            MB.unite(da.x, da.y, da.width, da.height, x, y, w, h, da);
                        }
                        else {
                            MB.intersection(0, 0, canvas.width, canvas.height, x, y, w, h, da);
                        }

                        if (da.width > 0 && $timers[canvas] == null) {
                            var $this = this;
                            $timers[canvas] = window.requestAFrame(function() {
                                $timers[canvas] = null;

                                // prevent double painting, sometimes
                                // width can be -1 what cause clearRect
                                // clean incorrectly
                                if (canvas.$da.width <= 0) {
                                    return ;
                                }

                                var context = canvas.$context;
                                canvas.validate();
                                context.save();

                                try {
                                    context.translate(canvas.x, canvas.y);
                                    context.clipRect(canvas.$da.x, canvas.$da.y,
                                                     canvas.$da.width,
                                                     canvas.$da.height);

                                    if (canvas.bg == null) {
                                        context.save();

                                        context.setTransform(2, 0, 0, 2, 0, 0);
                                        context.clearRect(canvas.$da.x, canvas.$da.y,
                                                          canvas.$da.width, canvas.$da.height);

                                        context.restore();
                                    }

                                    $this.paint(context, canvas);

                                    canvas.$da.width = -1; //!!!
                                }
                                finally {
                                    context.restore();
                                }
                            });
                        }

                        // !!! not sure the code below is redundant, but it looks redundantly
                        // if (da.width > 0) {
                        //     canvas.repaint(da.x, da.y, da.width, da.height);
                        // }
                    }
                }
            }
        };

        this.paint = function(g,c){
            var dw = c.width, dh = c.height, ts = g.stack[g.counter];

            if (dw !== 0      &&
                dh !== 0      &&
                ts.width > 0  &&
                ts.height > 0 &&
                c.isVisible === true)
            {
                if (c.isValid === false || c.isLayoutValid === false) {
                    c.validate();
                }

                g.save();
                g.translate(c.x, c.y);
                g.clipRect(0, 0, dw, dh);

                ts = g.stack[g.counter];

                var c_w = ts.width, c_h = ts.height;
                if (c_w > 0 && c_h > 0) {
                    this.paintComponent(g, c);

                    var count = c.kids.length, c_x = ts.x, c_y = ts.y;
                    for(var i = 0; i < count; i++) {
                        var kid = c.kids[i];
                        if (kid.isVisible === true) {
                            var kidX = kid.x,
                                kidY = kid.y,
                                kidXW = kidX + kid.width,
                                c_xw  = c_x + c_w,
                                kidYH = kidY + kid.height,
                                c_yh  = c_y + c_h,
                                iw = (kidXW < c_xw ? kidXW : c_xw) - (kidX > c_x ? kidX : c_x),
                                ih = (kidYH < c_yh ? kidYH : c_yh) - (kidY > c_y ? kidY : c_y);

                            if (iw > 0 && ih > 0) {
                                this.paint(g, kid);
                            }
                        }
                    }
                    if (c.paintOnTop != null) c.paintOnTop(g);
                }

                g.restore();
            }
        };
    }
]);

/**
 * Zebra UI component paint manager implementation class. Zebra
 * implementation expects an UI component can implements:

    - "paint(g)" method to paint its face
    - "update(g)" method to fill its background
    - "paintOnTop(g)" method to paint some decorative elements after the
    component background and face are rendered

 * Also the implementation expects an UI component can specify
 * background and border view. Using border view can developers change the
 * component shape by defining "ouline(...)" method
 * @constructor
 * @class  zebra.ui.PaintManImpl
 * @extends zebra.ui.PaintManager
 */
pkg.PaintManImpl = Class(pkg.PaintManager, [
    function $prototype() {
        this.paintComponent = function(g,c) {
            var b = c.bg != null && (c.parent == null || c.bg != c.parent.bg);

            // if component defines shape and has update, [paint?] or background that
            // differs from parent background try to apply the shape and than build
            // clip from the applied shape
            if ( (c.border != null && c.border.outline != null) &&
                 (b || c.update != null)                        &&
                 c.border.outline(g, 0, 0, c.width, c.height, c)  )
            {
                g.save();
                g.clip();

                if (b) c.bg.paint(g, 0, 0, c.width, c.height, c);
                if (c.update != null) c.update(g);

                g.restore();
            }
            else {
                if (b) {
                    c.bg.paint(g, 0, 0, c.width, c.height, c);
                }
                if (c.update != null) c.update(g);
            }

            if (c.border != null) {
                c.border.paint(g, 0, 0, c.width, c.height, c);
            }

            if (c.paint != null) {
                var left   = c.getLeft(),
                    top    = c.getTop(),
                    bottom = c.getBottom(),
                    right  = c.getRight();

                if (left + right + top + bottom > 0) {
                    var ts = g.stack[g.counter];

                    if (ts.width > 0 && ts.height > 0) {
                        var cx   = ts.x,
                            cy   = ts.y,
                            x1   = (cx > left ? cx : left),
                            y1   = (cy > top  ? cy : top),
                            cxcw = cx + ts.width,
                            cych = cy + ts.height,
                            cright = c.width - right,
                            cbottom = c.height - bottom;

                        g.save();
                        g.clipRect(x1, y1, (cxcw < cright  ? cxcw : cright)  - x1,
                                           (cych < cbottom ? cych : cbottom) - y1);
                        c.paint(g);
                        g.restore();
                    }
                }
                else {
                    c.paint(g);
                }
            }
        };
    }
]);

/**
 * Focus manager class defines the strategy of focus traversing among
 * hierarchy of UI components. It keeps current focus owner component
 * and provides API to change current focus component
 * @class zebra.ui.FocusManager
 * @extends {zebra.ui.Manager}
 */
pkg.FocusManager = Class(pkg.Manager, [
    function $prototype() {
        /**
         * Reference to the current focus owner component.
         * @attribute focusOwner
         * @readOnly
         * @type {zebra.ui.Panel}
         */

        function freeFocus(ctx, t){
            if (t == ctx.focusOwner) ctx.requestFocus(null);
        }

        this.focusOwner = null;

        /**
         * Component enabled event handler
         * @param  {zebra.ui.Panel} c a component
         * @method compEnabled
         */
        this.compEnabled = function(c)   {
            if (c.isEnabled === false) freeFocus(this, c);
        };

        /**
         * Component shown event handler
         * @param  {zebra.ui.Panel} c a component
         * @method compShown
         */
        this.compShown  = function(c)   {
            if (c.isVisible === false) freeFocus(this, c);
        };

        /**
         * Component removed event handler
         * @param  {zebra.ui.Panel} p a parent
         * @param  {zebra.ui.Panel} c a component
         * @method compRemoved
         */
        this.compRemoved = function(p, i, c) {
            freeFocus(this, c);
        };

        /**
         * The method is called by a canvas that lost native focus
         * @param  {zebra.ui.zCanvas} canvas a canvas
         * @method canvasFocusLost
         * @protected
         */
        this.canvasFocusLost = function(canvas) {
            if (this.focusOwner != null &&
                this.focusOwner.getCanvas() == canvas)
            {
                this.requestFocus(null);
            }
        };

        /**
         * The method is called by a canvas that gained native focus
         * @param  {zebra.ui.zCanvas} canvas a canvas
         * @method canvasFocusGained
         * @protected
         */
        this.canvasFocusGained = function(canvas) {
            // !!!
            //  previous focus owner for native HTML element should be ignored
            // !!!
            if (canvas.$prevFocusOwner != null &&
                zebra.instanceOf(canvas.$prevFocusOwner, pkg.HtmlElement) === false)
            {
                var d = canvas.$prevFocusOwner.getCanvas();
                if (d == canvas)  {
                    this.requestFocus(canvas.$prevFocusOwner);
                }
                else {
                    canvas.$prevFocusOwner = null;
                }
            }
        };

        /**
         * Test if the given component is a focus owner
         * @param  {zebra.ui.Panel} c an UI component to be tested
         * @method hasFocus
         * @return {Boolean} true if the given component holds focus
         */
        this.hasFocus = function(c) {
            return this.focusOwner == c;
        };

        /**
         * Key pressed event handler.
         * @param  {zebra.ui.KeyEvent} e a mouse event
         * @method keyPressed
         */
        this.keyPressed = function(e){
            if (KE.TAB == e.code) {
                var cc = this.ff(e.source, e.isShiftPressed() ?  -1 : 1);
                if (cc != null) this.requestFocus(cc);
            }
        };

        this.findFocusable = function(c) {
            return (this.isFocusable(c) ? c : this.fd(c, 0, 1));
        };

        /**
         * Test if the given component can catch focus
         * @param  {zebra.ui.Panel} c an UI component to be tested
         * @method isFocusable
         * @return {Boolean} true if the given component can catch a focus
         */
        this.isFocusable = function(c){
            var d = c.getCanvas();
            //!!!
            // also we should checks whether parent isFocusable !!!
            return d != null               &&
                   c.isEnabled    === true &&
                   c.isVisible    === true &&
                   c.canHaveFocus === true ||
                  (typeof c.canHaveFocus == "function" && c.canHaveFocus());
        };

        // looking recursively a focusable component among children components of 
        // the given target  starting from the specified by index kid with the 
        // given direction (forward or backward lookup)
        this.fd = function(t,index,d) {
            if (t.kids.length > 0){
                var isNComposite = t.catchInput == null || t.catchInput == false;
                for(var i = index; i >= 0 && i < t.kids.length; i += d) {
                    var cc = t.kids[i];

                    // check if the current children component satisfies 
                    // conditions it can grab focus or any deeper in hierarchy 
                    // component that can grab the focus exist  
                    if (cc.isEnabled === true                                           &&
                        cc.isVisible === true                                           &&
                        cc.width      >  0                                              &&
                        cc.height     >  0                                              &&
                        (isNComposite || (t.catchInput != true       &&
                                          t.catchInput(cc) === false)  )                &&
                        ( (cc.canHaveFocus === true || (cc.canHaveFocus !=  null  &&
                                                        cc.canHaveFocus !== false &&
                                                        cc.canHaveFocus())            ) ||
                          (cc = this.fd(cc, d > 0 ? 0 : cc.kids.length - 1, d)) != null)  )
                    {
                        return cc;
                    }
                }
            }

            return null;
        };

        // find next focusable component 
        // c - component starting from that a next focusable component has to be found
        // d - a direction of next focusable component lookup: 1 (forward) or -1 (backward)
        this.ff = function(c, d){
            var top = c;
            while (top && top.getFocusRoot == null) {
                top = top.parent;
            }

            top = top.getFocusRoot(c);
            if (top == null) {
                return null;
            }

            if (top.traverseFocus != null) {
                return top.traverseFocus(c, d);
            }

            for(var index = (d > 0) ? 0 : c.kids.length - 1; c != top.parent; ){
                var cc = this.fd(c, index, d);
                if (cc != null) return cc;
                cc = c;
                c = c.parent;
                if (c != null) index = d + c.indexOf(cc);
            }

            return this.fd(top, d > 0 ? 0 : top.kids.length - 1, d);
        };

        /**
         * Force to pass a focus to the given UI component
         * @param  {zebra.ui.Panel} c an UI component to pass a focus
         * @method requestFocus
         */
        this.requestFocus = function (c){
            if (c != this.focusOwner && (c == null || this.isFocusable(c))) {

                // if canvas where a potential focus owner component sits
                // doesn't  hold native focus than store the potential
                // focus owner in prevFocusOwner field that will be used
                // as soon as the canvas gets focus
                if (c != null) {
                    var canvas = c.getCanvas();
                    if (canvas.$focusGainedCounter === 0) {
                        canvas.$prevFocusOwner = c;
                        if (zebra.instanceOf(canvas.$prevFocusOwner, pkg.HtmlElement) == false) {
                            canvas.requestFocus();
                            return;
                        }
                    }
                }

                var oldFocusOwner = this.focusOwner;
                if (c != null) {
                    var nf = EM.getEventDestination(c);
                    if (nf == null || oldFocusOwner == nf) return;
                    this.focusOwner = nf;
                }
                else {
                    this.focusOwner = c;
                }

                if (oldFocusOwner != null) {
                    var ofc = oldFocusOwner.getCanvas();
                    if (ofc != null) ofc.$prevFocusOwner = oldFocusOwner;
                }

                if (oldFocusOwner  != null) {
                    pkg.events.fireInputEvent(new IE(oldFocusOwner, IE.FOCUS_LOST, IE.FOCUS_UID));
                }

                if (this.focusOwner != null) {
                    pkg.events.fireInputEvent(new IE(this.focusOwner, IE.FOCUS_GAINED, IE.FOCUS_UID));
                }

                return this.focusOwner;
            }
            return null;
        };

        /**
         * Mouse pressed event handler.
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mousePressed
         */
        this.mousePressed = function(e){
            if (e.isActionMask()) {
                this.requestFocus(e.source);
            }
        };
    }
]);

/**
 *  Command manager supports short cut keys definition and listening. The shortcuts have to be defined in
 *  zebra JSON configuration files. There are two sections:

    - **osx** to keep shortcuts for Mac OS X platform
    - **common** to keep shortcuts for all other platforms

 *  The JSON configuration entity has simple structure:


      {
        "common": [
             {
                "command"   : "undo_command",
                "args"      : [ true, "test"],
                "key"       : "Ctrl+z"
             },
             {
                "command" : "redo_command",
                "key"     : "Ctrl+Shift+z"
             },
             ...
        ],
        "osx" : [
             {
                "command"   : "undo_command",
                "args"      : [ true, "test"],
                "key"       : "Cmd+z"
             },
             ...
        ]
      }

 *  The configuration contains list of shortcuts. Every shortcut is bound to a key combination it is triggered.
 *  Every shortcut has a name and an optional list of arguments that have to be passed to a shortcut listener method.
 *  The optional arguments can be used to differentiate two shortcuts that are bound to the same command.
 *
 *  On the component level shortcut commands can be listened by implementing method whose name equals to shortcut name.
 *  Pay attention to catch shortcut command your component has to be focusable and holds focus at the given time.
 *  For instance, to catch "undo_command"  do the following:

        var pan = new zebra.ui.Panel([
            function redo_command() {
                // handle shortcut here
            },

            // visualize the component gets focus
            function focused() {
                this.$super();
                this.setBackground(this.hasFocus()?"red":null);
            }
        ]);

        // let our panel to hold focus by setting appropriate property
        pan.canHaveFocus = true;


 *  @constructor
 *  @class zebra.ui.CommandManager
 *  @extends {zebra.ui.Manager}
 */

/**
 * Shortcut event is handled by registering a method handler with shortcut manager. The manager is accessed as
 * "zebra.ui.commandManager" static variable:

        zebra.ui.commandManager.bind(function (e) {
            ...
        });

 * @event shortcut
 * @param {Object} e shortcut event
 *         @param {Array} e.args shortcut arguments list
 *         @param {String} e.command shortcut name
 */
pkg.CommandManager = Class(pkg.Manager, [
    function $prototype() {
        /**
         * Key pressed event handler.
         * @param  {zebra.ui.KeyEvent} e a mouse event
         * @method keyPressed
         */
        this.keyPressed = function(e) {
            var fo = pkg.focusManager.focusOwner;
            if (fo != null && this.keyCommands[e.code]) {
                var c = this.keyCommands[e.code];
                if (c && c[e.mask] != null) {
                    c = c[e.mask];
                    this._.fired(c);
                    if (fo[c.command]) {
                         if (c.args && c.args.length > 0) fo[c.command].apply(fo, c.args);
                         else fo[c.command]();
                    }
                }
            }
        };

        this.parseKey = function(k) {
            var m = 0, c = 0, r = k.split("+");
            for(var i = 0; i < r.length; i++) {
                var ch = r[i].trim().toUpperCase();
                if (KE.hasOwnProperty("M_" + ch)) {
                    m += KE["M_" + ch];
                    continue;
                }

                if (KE.hasOwnProperty(ch)) {
                    c = KE[ch];
                    continue;
                }

                if (zebra.isNumber(ch)) {
                    c = ch;
                }
            }
            return [m, c];
        };

        this.setCommands = function(commands) {
            for(var i=0; i < commands.length; i++) {
                var c = commands[i], p = this.parseKey(c.key), v = this.keyCommands[p[1]];

                if (v && v[p[0]]) {
                    throw Error("Duplicated command: '" + c + "'");
                }

                if (v == null) {
                    v = [];
                }

                v[p[0]] = c;
                this.keyCommands[p[1]] = v;
            }
        };
    },

    function(commands){
        this.$super();
        this.keyCommands = {};
        this._ = new zebra.util.Listeners("commandFired");


        this.setCommands(commands.common);
        if (zebra.isMacOS && commands.osx != null) {
            this.setCommands(commands.osx);
        }
    }
]);

/**
 * Cursor manager class. Allows developers to control mouse cursor type by implementing an own
 * getCursorType method or by specifying a cursor by cursorType field. Imagine an UI component
 * needs to change cursor type. It
 *  can be done by one of the following way:

    - **Implement getCursorType method by the component itself if the cursor type depends on cursor location**

          var p = new zebra.ui.Panel([
               // implement getCursorType method to set required
               // mouse cursor type
               function getCursorType(target, x, y) {
                   return zebra.ui.Cursor.WAIT;
               }
          ]);

    - **Define "cursorType" property in component if the cursor type doesn't depend on cursor location **

          var myPanel = new zebra.ui.Panel();
          ...
          myPanel.cursorType = zebra.ui.Cursor.WAIT;

 *  @class zebra.ui.CursorManager
 *  @constructor
 *  @extends {zebra.ui.Manager}
 */
pkg.CursorManager = Class(pkg.Manager, [
    function $prototype() {
        /**
         * Define mouse moved events handler.
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseMoved
         */
        this.mouseMoved = function(e){
            if (this.$isFunc === true) {
                this.cursorType = this.target.getCursorType(this.target, e.x, e.y);
                this.canvas.style.cursor = (this.cursorType == null) ? "default"
                                                                     : this.cursorType;
            }
        };

        /**
         * Define mouse entered events handler.
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseEntered
         */
        this.mouseEntered = function(e){
            if (e.source.cursorType != null || e.source.getCursorType != null) {
                this.$isFunc = (e.source.getCursorType != null);
                this.target = e.source;
                this.canvas = this.target.getCanvas().canvas;
                this.cursorType = this.$isFunc === true ? this.target.getCursorType(this.target, e.x, e.y)
                                                       : this.target.cursorType;

                this.canvas.style.cursor = (this.cursorType == null) ? "default"
                                                                     : this.cursorType;
            }
        };

        /**
         * Define mouse exited events handler.
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseExited
         */
        this.mouseExited  = function(e){
            if (this.target != null) {
                this.cursorType = "default";
                this.canvas.style.cursor = this.cursorType;
                this.canvas = this.target = null;
                this.$isFunc = false;
            }
        };

        /**
         * Define mouse dragged events handler.
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseDragged
         */
        this.mouseDragged = function(e) {
            if (this.$isFunc === true) {
                this.cursorType = this.target.getCursorType(this.target, e.x, e.y);
                this.canvas.style.cursor = (this.cursorType == null) ? "default"
                                                                     : this.cursorType;
            }
        };
    },

    function(){
        this.$super();

        /**
         * Current cursor type
         * @attribute cursorType
         * @type {String}
         * @readOnly
         * @default "default"
         */
        this.cursorType = "default";

        this.canvas = this.target = null;
        this.$isFunc = false;
    }
]);

/**
 * Event manager class. One of the key zebra manager that is responsible for
 * distributing various events in zebra UI. The manager provides number of
 * methods to register global events listeners.
 * @class zebra.ui.EventManager
 * @constructor
 * @extends {zebra.ui.Manager}
 */
pkg.EventManager = Class(pkg.Manager, [
    function $prototype() {
        var IEHM = [], MUID = IE.MOUSE_UID, KUID = IE.KEY_UID;

        IEHM[KE.TYPED]          = 'keyTyped';
        IEHM[KE.RELEASED]       = 'keyReleased';
        IEHM[KE.PRESSED]        = 'keyPressed';

        IEHM[ME.DRAGGED]        = 'mouseDragged';
        IEHM[ME.DRAGSTARTED]    = 'mouseDragStarted';
        IEHM[ME.DRAGENDED]      = 'mouseDragEnded';
        IEHM[ME.MOVED]          = 'mouseMoved';
        IEHM[ME.CLICKED]        = 'mouseClicked';
        IEHM[ME.PRESSED]        = 'mousePressed';
        IEHM[ME.RELEASED]       = 'mouseReleased';
        IEHM[ME.ENTERED]        = 'mouseEntered';
        IEHM[ME.EXITED]         = 'mouseExited';

        IEHM[IE.FOCUS_LOST]     = 'focusLost';
        IEHM[IE.FOCUS_GAINED]   = 'focusGained';

        IEHM[CL.SIZED]   = 'compSized';
        IEHM[CL.MOVED]   = 'compMoved';
        IEHM[CL.ENABLED] = 'compEnabled';
        IEHM[CL.SHOWN]   = 'compShown';
        IEHM[CL.ADDED]   = 'compAdded';
        IEHM[CL.REMOVED] = 'compRemoved';

        this.$hasMethod = function(l, s, e) {
            for (var i = 0; i <=e ; i++) {
                var k = IEHM[i];
                if (typeof l[k] == 'function') {
                    return  true;
                }
            }
            return false;
        };

        this.fireCompEvent = function(id, src, p1, p2){
            var n = IEHM[id];

            if (src[n] != null) {
                src[n].call(src, src, p1, p2);
            }

            for(var i = 0;i < this.c_l.length; i++) {
                var t = this.c_l[i];
                if (t[n] != null) t[n].call(t, src, p1, p2);
            }

            for(var t = src.parent;t != null; t = t.parent){
                if (t.childCompEvent != null) {
                    t.childCompEvent(id, src, p1, p2);
                }
            }
        };

        // destination is component itself or one of his composite parent.
        // composite component is a component that grab control from his
        // children component. to make a component composite
        // it has to implement catchInput field or method. If composite component
        // has catchInput method it will be called
        // to detect if the composite component takes control for the given kid.
        // composite components can be embedded (parent composite can take
        // control on its child composite component)
        this.getEventDestination = function(c) {
            if (c == null) return null;

            var p = c;
            while ((p = p.parent) != null) {
                if (p.catchInput != null && (p.catchInput === true || (p.catchInput !== false && p.catchInput(c)))) {
                    c = p;
                }
            }
            return c;
        };

        this.fireInputEvent = function(e){
            var t = e.source, id = e.ID, it = null, k = IEHM[id], b = false;
            switch(e.UID) {
                case MUID:
                    if (t[k] != null) {
                        t[k].call(t, e);
                    }

                    // for efficiency we have to avoid passing mouse
                    // moved and dragged events to children listener
                    // so pass it only to global listeners and return
                    if (id > 25) {
                        for(var i = 0; i < this.m_l.length; i++) {
                            var tt = this.m_l[i];
                            if (tt[k] != null) tt[k].call(tt, e);
                        }
                        return b;
                    }
                    it = this.m_l;
                    break;
                case KUID:
                    if (t[k] != null) {
                        b = t[k].call(t, e);
                    }
                    it = this.k_l;
                    break;
                case IE.FOCUS_UID:
                    if (t[k] != null) {
                        t[k].call(t, e);
                    }
                    t.focused();
                    it = this.f_l;
                    break;
                default: {
                    throw new Error("Invalid input event UID: " + e.UID);
                }
            }

            // distribute event to globally registered listeners
            for(var i = 0;i < it.length; i++) {
                var tt = it[i], m = tt[k];
                if (m != null) b = m.call(tt, e) || b;
            }

            for (t = t.parent;t != null; t = t.parent){
                if (t.childInputEvent != null) {
                    t.childInputEvent(e);
                }
            }

            return b;
        };

        /**
         * Register global event listener. The listener will
         * get events according to event methods handlers it
         * implements. For instance to listen key and
         * the passed listener should implements one of
         * key event handler method:


        // implement and register global key and mouse listener
        zebra.ui.events.addListener({

            // implement necessary events handlers methods
            keyPressed: function(e) {
                ...
            }
            ...
        });

         * @param  {Object} l
         * @method  addListener
         */
        this.addListener = function (l) {
            if (this.$hasMethod(l, CL.ENABLED, CL.REMOVED)) {
                this.addComponentListener(l);
            }

            if (this.$hasMethod(l, ME.CLICKED, ME.MOVED))  {
                this.addMouseListener(l);
            }

            if (this.$hasMethod(l, KE.TYPED, KE.PRESSED)) {
                this.addKeyListener(l);
            }

            if (this.$hasMethod(l, IE.FOCUS_LOST, IE.FOCUS_GAINED)) {
                this.addFocusListener(l);
            }
        };

        /**
         * Un-register the global listener. The method detects which listener interfaces
         * the passed listener implements and un-registers its.
         * @param  {Object} l a listener
         * @return {Boolean} true if the listener has been removed successfully
         * @method removeListener
         */
        this.removeListener = function (l) {
            this.removeComponentListener(l);
            this.removeMouseListener(l);
            this.removeKeyListener(l);
            this.removeFocusListener(l);
        };

        /**
         * Register global component listener
         * @param  {Object} l a component listener
         * @return {Boolean} true if the listener has been successfully
         * added
         * @method addComponentListener
         */
        this.addComponentListener = function (l) {
            return this.a_(this.c_l, l);
        };

        /**
         * Un-register global component listener
         * @param  {Object} l a component listener
         * @return {Boolean} true if the listener has been removed successfully
         * @method removeFocusListener
         */
        this.removeComponentListener = function(l){
            return this.r_(this.c_l, l);
        };

        /**
         * Register global mouse listener
         * @param  {Object} l a mouse listener
         * @return {Boolean} true if the listener has been successfully
         * added
         * @method addMouseListener
         */
        this.addMouseListener = function(l){
            return this.a_(this.m_l, l);
        };

        /**
         * Un-register global mouse listener
         * @param  {Object} l a mouse listener
         * @return {Boolean} true if the listener has been removed successfully
         * @method removeMouseListener
         */
        this.removeMouseListener = function(l){
            return this.r_(this.m_l, l);
        };

        /**
         * Register global focus listener
         * @param  {Object} l a focus listener
         * @return {Boolean} true if the listener has been successfully
         * added
         * @method addFocusListener
         */
        this.addFocusListener = function (l){
            return this.a_(this.f_l, l);
        };

       /**
        * Un-register global focus listener
        * @param  {Object} l a focus listener
        * @return {Boolean} true if the listener has been removed successfully
        * @method removeFocusListener
        */
        this.removeFocusListener = function (l) {
            return this.r_(this.f_l, l);
        };

        /**
         * Register global key listener
         * @param  {Object} l a key listener
         * @return {Boolean} true if the listener has been successfully
         * added
         * @method addKeyListener
         */
        this.addKeyListener = function(l){
            return this.a_(this.k_l, l);
        };

        /**
         * Un-register global key listener
         * @param  {Object} l a key listener
         * @return {Boolean} true if the listener has been removed successfully
         * @method removeKeyListener
         */
        this.removeKeyListener  = function (l){
            return this.r_(this.k_l, l);
        };

        this.a_ = function(c, l) {
            if (c.indexOf(l) >= 0) return false;
            c.push(l);
            return true;
        };

        this.r_ = function(c, l) {
            var i = c.indexOf(l);
            if (i < 0) return false;
            c.splice(i, 1);
            return true;
        };
    },

    function(){
        this.m_l  = [];
        this.k_l  = [];
        this.f_l  = [];
        this.c_l  = [];
        this.$super();
    }
]);

/**
 *  zCanvas zebra UI component class. This is one of the key
 *  class everybody has to use to start building an UI. The class is a wrapper
 *  for HTML Canvas element. Internally it catches all native HTML Canvas
 *  events and translates its into Zebra UI events.
 *
 *  zCanvas instantiation triggers a new HTML Canvas will be created
 *  and added to HTML DOM tree.  It happens if developer doesn't pass
 *  an HTML Canvas element reference or an ID of existing HTML Canvas
 *  element If developers need to re-use an existent in DOM tree canvas
 *  element they have to pass id of the canvas that has to be used as basis
 *  for zebra UI creation or reference to a HTML Canvas element:

        // a new HTML canvas element is created and added into HTML DOM tree
        var canvas = zebra.ui.zCanvas();

        // a new HTML canvas element is created into HTML DOM tree
        var canvas = zebra.ui.zCanvas(400,500);  // pass canvas size

        // stick to existent HTML canvas element
        var canvas = zebra.ui.zCanvas("ExistentCanvasID");

 *  The zCanvas has layered structure. Every layer is responsible for
 *  showing and controlling a dedicated type of UI elements like windows
 *  pop-up menus, tool tips and so on. Developers have to build an own UI
 *  hierarchy on the canvas root layer. The layer is standard UI panel
 *  that is accessible as zCanvas component instance "root" field.

        // create canvas
        var canvas = zebra.ui.zCanvas(400,500);

        // save reference to canvas root layer where
        // hierarchy of UI components have to be hosted
        var root = canvas.root;

        // fill root with UI components
        var label = new zebra.ui.Label("Label");
        label.setBounds(10,10,100,50);
        root.add(label);

 *  @class zebra.ui.zCanvas
 *  @extends {zebra.ui.Panel}
 *  @constructor
 *  @param {String|Canvas} [element] an ID of a HTML canvas element or
 *  reference to an HTML Canvas element.
 *  @param {Integer} [width] a width of an HTML canvas element
 *  @param {Integer} [height] a height of an HTML canvas element
 */

/**
 * Implement the event handler method  to catch canvas initialized event.
 * The event is triggered once the canvas has been initiated and all properties
 * listeners of the canvas are set upped. The event can be used to load
 * saved data.

     var p = new zebra.ui.zCanvas(300, 300, [
          function canvasInitialized() {
              // do something
          }
     ]);

 * @event  canvasInitialized
 */

pkg.zCanvas = Class(pkg.Panel, [
    function $prototype() {
        this.$isMasterCanvas = true;
        this.$prevFocusOwner = null;

        //!!! flag to block wrongly coming double on focus
        //!!! events
        this.$focusGainedCounter = 0;

        function km(e) {
            var c = 0;
            if (e.altKey)   c += KE.M_ALT;
            if (e.shiftKey) c += KE.M_SHIFT;
            if (e.ctrlKey)  c += KE.M_CTRL;
            if (e.metaKey)  c += KE.M_CMD;
            return c;
        }

        this.load = function(jsonPath){
            return this.root.load(jsonPath);
        };

        this.$keyTyped = function(e){
            if (e.charCode == 0) {
                if ($keyPressedCode != e.keyCode) this.$keyPressed(e);
                $keyPressedCode = -1;
                return;
            }

            if (e.charCode > 0) {
                var fo = pkg.focusManager.focusOwner;
                if (fo != null) {
                    KE_STUB.reset(fo, KE.TYPED, e.keyCode, String.fromCharCode(e.charCode), km(e));
                    if (EM.fireInputEvent(KE_STUB) === true) e.preventDefault();
                }
            }

            if (e.keyCode < 47) e.preventDefault();
        };

        this.$keyPressed = function(e){
            var code = $keyPressedCode = (e.which || e.keyCode || 0), m = km(e), b = false;

            // FF sets keyCode to zero for some diacritic characters
            // to fix the problem we have to try get the code from "key" field
            // of event that stores a character
            if (code === 0 && e.key != null && e.key.length() === 1) {
                code = e.key.charCodeAt(0);
            }

            for(var i = this.kids.length - 1;i >= 0; i--){
                var l = this.kids[i];
                if (l.layerKeyPressed != null && l.layerKeyPressed(code, m)){
                    break;
                }
            }

            var focusOwner = pkg.focusManager.focusOwner;
            if (pkg.clipboardTriggerKey > 0          &&
                code == pkg.clipboardTriggerKey &&
                focusOwner != null                   &&
                (focusOwner.clipCopy  != null        ||
                 focusOwner.clipPaste != null           ))
            {
                $clipboardCanvas = this;
                $clipboard.style.display = "block";
                this.canvas.onfocus = this.canvas.onblur = null;

                // value has to be set, otherwise some browsers (Safari) do not generate
                // "copy" event
                $clipboard.value="1";

                $clipboard.select();
                $clipboard.focus();
                return;
            }

            $keyPressedOwner     = focusOwner;
            $keyPressedModifiers = m;

            if (focusOwner != null) {
                KE_STUB.reset(focusOwner, KPRESSED, code, code < 47 ? KE.CHAR_UNDEFINED : '?', m);
                b = EM.fireInputEvent(KE_STUB);

                if (code == KE.ENTER) {
                    KE_STUB.reset(focusOwner, KE.TYPED, code, "\n", m);
                    b = EM.fireInputEvent(KE_STUB) || b;
                }
            }

            //!!!!
            if ((code < 47 && code != 32) || b) {
                e.preventDefault();
            }
        };

        this.$keyReleased = function(e){
            $keyPressedCode = -1;

            var fo = pkg.focusManager.focusOwner;
            if(fo != null) {
                KE_STUB.reset(fo, KE.RELEASED, e.keyCode, KE.CHAR_UNDEFINED, km(e));
                if (EM.fireInputEvent(KE_STUB)) e.preventDefault();
            }
        };

        this.$mouseEntered = function(id, e) {
            var mp = $mousePressedEvents[id];

            // remove any previously registered listener if
            //  -- a mouse button has been pressed
            //  -- a mouse button has been pressed on the canvas we have entered
            if (mp != null && mp.canvas != null && mp.canvas.canvas == e.target) {
                $cleanDragFix();
            }

            // !!!
            // TODO: review it
            // quick and dirty fix
            // try to track a situation when the canvas has been moved
            this.recalcOffset();

            // if a button has not been pressed handle mouse entered to detect
            // zebra component the mouse pointer entered and send appropriate
            // mouse entered event to it
            if (mp == null || mp.canvas == null) {
                var x = $meX(e, this), 
                    y = $meY(e, this), 
                    d = this.getComponentAt(x, y);

                // setup modifiers 
                ME_STUB.modifiers.altKey   = e.altKey;
                ME_STUB.modifiers.ctrlKey  = e.ctrlKey;
                ME_STUB.modifiers.metaKey  = e.metaKey;
                ME_STUB.modifiers.shiftKey = e.shiftKey;

                // also correct current component on that mouse pointer is located
                if (d != pkg.$mouseMoveOwner) {
                    // if mouse owner is not null but doesn't match new owner
                    // generate mouse exit and clean mouse owner
                    if (pkg.$mouseMoveOwner != null) {
                        var prev = pkg.$mouseMoveOwner;
                        pkg.$mouseMoveOwner = null;

                        ME_STUB.reset(prev, MEXITED, x, y, -1, 0);
                        EM.fireInputEvent(ME_STUB);
                    }

                    // if new mouse owner is not null and enabled
                    // generate mouse entered event ans set new mouse owner
                    if (d != null && d.isEnabled === true){
                        pkg.$mouseMoveOwner = d;
                        ME_STUB.reset(d, MENTERED, x, y, -1, 0);
                        EM.fireInputEvent(ME_STUB);
                    }
                }
            }
        };

        this.$mouseExited = function (id, e) {
            var mp = $mousePressedEvents[id];

            // setup modifiers 
            ME_STUB.modifiers.altKey   = e.altKey;
            ME_STUB.modifiers.ctrlKey  = e.ctrlKey;
            ME_STUB.modifiers.metaKey  = e.metaKey;
            ME_STUB.modifiers.shiftKey = e.shiftKey;

            // if a mouse button has not been pressed and current mouse owner
            // component is not null, flush current mouse owner and send
            // mouse exited event to him
            if (mp == null || mp.canvas == null) {
                if (pkg.$mouseMoveOwner != null) {
                    var p = pkg.$mouseMoveOwner;
                    pkg.$mouseMoveOwner = null;

                    ME_STUB.reset(p, MEXITED, $meX(e, this), $meY(e, this), -1, 0);
                    EM.fireInputEvent(ME_STUB);
                }
            }
            else {
                // if a button has been pressed but the mouse cursor is outside of
                // the canvas temporary listen mouse moved events from window
                // since canvas cannot perform mouse moved events if mouse cursor
                // is outside of canvas element surface
                if ($temporaryWinListener == null && ME_STUB.touch == null) {  // !!! ignore touchscreen devices
                    var $this = this;
                    $temporaryWinListener = function(ee) {
                        ee.stopPropagation();
                        $this.$mouseMoved(id, {
                            pageX : ee.pageX,
                            pageY : ee.pageY,
                            target: e.target,
                            modifiers: ME_STUB.modifiers,
                        });
                        ee.preventDefault();
                    };
                    window.addEventListener("mousemove", $temporaryWinListener, true);
                }
            }
        };

        /**
         * Catch native canvas mouse move events
         * @param {String} id an touch id (for touchable devices)
         * @param {String} e a mouse event that has been triggered by canvas element
         *
         *         {
         *             pageX : {Integer},
         *             pageY : {Integer},
         *             target: {HTMLElement}
         *         }
         * @protected
         * @method $mouseMoved
         */
        this.$mouseMoved = function(id, e){
            // get appropriate mousePressed event by event id
            var mp = $mousePressedEvents[id];

            // mouse button has been pressed and pressed target zebra component exists
            // emulate mouse dragging events if mouse has moved on the canvas where mouse
            // pressed event occurred
            if (mp != null && mp.canvas != null) {
                // target component exits and mouse cursor moved on the same
                // canvas where mouse pressed occurred
                if (mp.component != null && mp.canvas.canvas == e.target) {
                    // !!!!
                    // for the sake of performance $meX(e, this) and $meY(e, this)
                    // methods calls are replaced with direct code
                    var x = this.$context.tX(e.pageX - this.offx, e.pageY - this.offy),
                        y = this.$context.tY(e.pageX - this.offx, e.pageY - this.offy),
                        m = mp.button;

                        // setup modifiers 
                        ME_STUB.modifiers.altKey   = e.altKey;
                        ME_STUB.modifiers.ctrlKey  = e.ctrlKey;
                        ME_STUB.modifiers.metaKey  = e.metaKey;
                        ME_STUB.modifiers.shiftKey = e.shiftKey;

                    // if drag events has not been initiated yet generate mouse
                    // start dragging event
                    if (mp.draggedComponent == null) {

                        // check if zebra mouse moved event has already occurred
                        // if it is true set mouse dragged target component to
                        // the mouse moved target component otherwise compute
                        // the target component basing on mouse moved event location

                        // !!!!
                        // for the sake of performance $meX(e, this) and $meY(e, this)
                        // methods calls are replaced with direct code
                        var xx = this.$context.tX(mp.pageX - this.offx, mp.pageY - this.offy),
                            yy = this.$context.tY(mp.pageX - this.offx, mp.pageY - this.offy),
                            d  = (pkg.$mouseMoveOwner == null) ? this.getComponentAt(xx, yy)
                                                               : pkg.$mouseMoveOwner;

                        // if target component can be detected fire mouse start dragging and
                        // mouse dragged events to the component
                        if (d != null && d.isEnabled === true) {
                            mp.draggedComponent = d;

                            // setup modifiers 
                            ME_STUB.modifiers.altKey   = mp.altKey;
                            ME_STUB.modifiers.ctrlKey  = mp.ctrlKey;
                            ME_STUB.modifiers.metaKey  = mp.metaKey;
                            ME_STUB.modifiers.shiftKey = mp.shiftKey;

                            ME_STUB.reset(d, ME.DRAGSTARTED, xx, yy, m, 0);
                            EM.fireInputEvent(ME_STUB);

                            // if mouse cursor has been moved mouse dragged
                            // event has to be generated
                            if (xx != x || yy != y) {
                                ME_STUB.reset(d, MDRAGGED, x, y, m, 0);
                                EM.fireInputEvent(ME_STUB);
                            }
                        }
                    }
                    else {
                        // the drag event has already occurred before, just send
                        // next dragged event to target zebra component
                        ME_STUB.reset(mp.draggedComponent, MDRAGGED, x, y, m, 0);
                        EM.fireInputEvent(ME_STUB);
                    }
                }
            }
            else {

                // if a mouse button has not been pressed handle the normal mouse moved event

                // !!!!
                // for the sake of performance $meX(e, this) and $meY(e, this)
                // methods calls are replaced with direct code
                var x = this.$context.tX(e.pageX - this.offx, e.pageY - this.offy),
                    y = this.$context.tY(e.pageX - this.offx, e.pageY - this.offy),
                    d = this.getComponentAt(x, y);
              
                // setup modifiers 
                ME_STUB.modifiers.altKey   = e.altKey;
                ME_STUB.modifiers.ctrlKey  = e.ctrlKey;
                ME_STUB.modifiers.metaKey  = e.metaKey;
                ME_STUB.modifiers.shiftKey = e.shiftKey;
                
                if (pkg.$mouseMoveOwner != null) {
                    if (d != pkg.$mouseMoveOwner) {
                        var old = pkg.$mouseMoveOwner;

                        pkg.$mouseMoveOwner = null;

                        ME_STUB.reset(old, MEXITED, x, y, -1, 0);
                        EM.fireInputEvent(ME_STUB);

                        if (d != null && d.isEnabled === true) {
                            pkg.$mouseMoveOwner = d;
                            ME_STUB.reset(pkg.$mouseMoveOwner, MENTERED, x, y, -1, 0);
                            EM.fireInputEvent(ME_STUB);
                        }
                    }
                    else {
                        if (d != null && d.isEnabled === true) {
                            ME_STUB.reset(d, MMOVED, x, y, -1, 0);
                            EM.fireInputEvent(ME_STUB);
                        }
                    }
                }
                else {
                    if (d != null && d.isEnabled === true) {
                        pkg.$mouseMoveOwner = d;
                        ME_STUB.reset(d, MENTERED, x, y, -1, 0);
                        EM.fireInputEvent(ME_STUB);
                    }
                }
            }
        };

        this.$mouseReleased = function(id, e){
            var mp = $mousePressedEvents[id];

            // handle it only if appropriate mouse pressed has occurred
            if (mp != null && mp.canvas != null) {
                var x = $meX(e, this), y = $meY(e, this), po = mp.component;

                // setup modifiers 
                ME_STUB.modifiers.altKey   = e.altKey;
                ME_STUB.modifiers.ctrlKey  = e.ctrlKey;
                ME_STUB.modifiers.metaKey  = e.metaKey;
                ME_STUB.modifiers.shiftKey = e.shiftKey;

                // if a component has been dragged send end dragged event to it to
                // complete dragging
                if (mp.draggedComponent != null){
                    ME_STUB.reset(mp.draggedComponent, ME.DRAGENDED, x, y, mp.button, 0);
                    EM.fireInputEvent(ME_STUB);
                }

                // mouse pressed has not null target zebra component
                // send mouse released and mouse clicked (if necessary)
                // to him
                if (po != null) {
                    // generate mouse click if no mouse drag event has been generated
                    if (mp.draggedComponent == null && (e.touch == null || e.touch.group == null)) {
                        ME_STUB.reset(po, ME.CLICKED, x, y, mp.button, mp.clicks);
                        EM.fireInputEvent(ME_STUB);
                    }

                    // send mouse released to zebra target component
                    ME_STUB.reset(po, ME.RELEASED, x, y, mp.button, mp.clicks);
                    EM.fireInputEvent(ME_STUB);

                    //  make sure it is originally a touch event
                    if (ME_STUB.touch != null) {
                        ME_STUB.reset(po, ME.EXITED, x, y, mp.button, mp.clicks);
                        EM.fireInputEvent(ME_STUB);
                    }
                }

                // mouse released can happen at new location, so move owner has to be corrected
                // and mouse exited entered event has to be generated.
                // the correction takes effect if we have just completed dragging or mouse pressed
                // event target doesn't match pkg.$mouseMoveOwner
                if (ME_STUB.touch == null) {
                    var mo = pkg.$mouseMoveOwner;
                    if (mp.draggedComponent != null || (po != null && po != mo)) {
                        var nd = this.getComponentAt(x, y);

                        if (nd != mo) {
                            if (mo != null) {
                                pkg.$mouseMoveOwner = null;
                                ME_STUB.reset(mo, MEXITED, x, y, -1, 0);
                                EM.fireInputEvent(ME_STUB);
                            }

                            if (nd != null && nd.isEnabled === true){
                                pkg.$mouseMoveOwner = nd;
                                ME_STUB.reset(nd, MENTERED, x, y, -1, 0);
                                EM.fireInputEvent(ME_STUB);
                            }
                        }
                    }
                }

                // release mouse pressed event without removal the event from object
                // keeping event in object is used to handle double click
                mp.canvas = null;
            }
        };

        this.$mousePressed = function(id, e, button) {
            // release mouse pressed if it has not happened before but was not released
            var mp = $mousePressedEvents[id];
            if (mp != null && mp.canvas != null) {
                this.$mouseReleased(id, mp);
            }

            // store mouse pressed event
            var clicks = mp != null && (new Date().getTime() - mp.time) <= pkg.doubleClickDelta ? 2 : 1 ;

            mp = $mousePressedEvents[id] = {
                pageX       : e.pageX,
                pageY       : e.pageY,
                identifier  : id,
                target      : e.target,
                canvas      : this,
                button      : button,
                component   : null,
                mouseDragged: null,
                time        : (new Date()).getTime(),
                clicks      : clicks,
                modifiers   : {
                    altKey      : e.altKey,
                    ctrlKey     : e.ctrlKey,
                    metaKey     : e.metaKey,
                    shiftKey    : e.shiftKey
                }
            };

            var x = $meX(e, this), y = $meY(e, this), tl = null;
            mp.x = x;
            mp.y = y;

            // send mouse event to a layer and test if it has been activated
            for(var i = this.kids.length - 1; i >= 0; i--){
                tl = this.kids[i];
                if (tl.layerMousePressed != null && tl.layerMousePressed(x, y, button)) {
                    break;
                }
            }

            var d = this.getComponentAt(x, y);
            if (d != null && d.isEnabled === true) {
                mp.component = d;

                // setup modifiers 
                ME_STUB.modifiers.altKey   = mp.altKey;
                ME_STUB.modifiers.ctrlKey  = mp.ctrlKey;
                ME_STUB.modifiers.metaKey  = mp.metaKey;
                ME_STUB.modifiers.shiftKey = mp.shiftKey;

                // make sure it was touch event to emulate mouse entered event
                if (ME_STUB.touch != null) {
                    ME_STUB.reset(d, ME.ENTERED, x, y, button, clicks);
                    EM.fireInputEvent(ME_STUB);
                }
                else {
                    // for mouse pointer, check if pressing also should
                    // update current move owner component and generate
                    // approriate event
                    if (pkg.$mouseMoveOwner != d) {
                        pkg.$mouseMoveOwner = d;
                        ME_STUB.reset(d, MENTERED, x, y, button, clicks);
                        EM.fireInputEvent(ME_STUB);
                    }
                }

                ME_STUB.reset(d, ME.PRESSED, x, y, button, clicks);
                EM.fireInputEvent(ME_STUB);
            }

            //!!! this prevent DOM elements selection on the page
            //!!! this code should be still double checked
            //!!!! THIS CODE BRINGS SOME PROBLEM TO IE. IF CURSOR IN ADDRESS TAB PRESSING ON CANVAS
            //!!!! GIVES FOCUS TO CANVAS BUT KEY EVENT GOES TO ADDRESS BAR
            //e.preventDefault();

            // on mobile devices this force to leave edit component by grabbing focus from
            // the editor component (input text field)
            if (document.activeElement != this.canvas) {
                this.canvas.focus();
            }
        };

        this.getComponentAt = function(x,y){
            for(var i = this.kids.length; --i >= 0; ){
                var tl = this.kids[i];
                if (tl.isLayerActiveAt == null || tl.isLayerActiveAt(x, y)) {

                    // !!!
                    //  since the method is widely used the code below duplicates
                    //  functionality of EM.getEventDestination(tl.getComponentAt(x, y));
                    //  method
                    // !!!
                    var c = tl.getComponentAt(x, y);
                    if (c != null)  {
                        var p = c;
                        while ((p = p.parent) != null) {
                            if (p.catchInput != null && (p.catchInput === true || (p.catchInput !== false && p.catchInput(c)))) {
                                c = p;
                            }
                        }
                    }
                    return c;
                }
            }
            return null;
        };

        this.recalcOffset = function() {
            // calculate offset
            var poffx = this.offx,
                poffy = this.offy,
                ba    = this.canvas.getBoundingClientRect();

            this.offx = ((ba.left + 0.5) | 0) + pkg.$measure(this.canvas, "padding-left") + window.pageXOffset;
            this.offy = ((ba.top  + 0.5) | 0) + pkg.$measure(this.canvas, "padding-top" ) + window.pageYOffset;

            if (this.offx != poffx || this.offy != poffy) {
                this.relocated(this, poffx, poffy);
            }
        };

        /**
         * Get the canvas layer by the specified layer ID. Layer is a children component
         * of the canvas UI component. Every layer has an ID assigned to it the method
         * actually allows developers to get the canvas children component by its ID
         * @param  {String} id a layer ID
         * @return {zebra.ui.Panel} a layer (children) component
         * @method getLayer
         */
        this.getLayer = function(id) {
            return this[id];
        };

        /**
         * Set HTML canvas element hosted by the UI component CSS styles
         * @protected
         * @method setStyles
         * @param {Object} styles styles to be applied to the HTML canvas component
         */
        this.setStyles = function(styles) {
            for(var k in styles) {
                this.canvas.style[k] = styles[k];
            }
        };

        /**
         * Set HTML Canvas element hosted by the UI component attribute
         * @protected
         * @method setAttribute
         * @param {String} name an attribute name
         * @param {String} value an attribute value
         */
        this.setAttribute = function(name, value) {
            this.canvas.setAttribute(name, value);
        };

        // override relocated and resized
        // to prevent unnecessary repainting
        this.relocated = function(px,py) {
            pkg.events.fireCompEvent(CL.MOVED, this, px, py);
        };

        this.resized = function(pw,ph) {
            pkg.events.fireCompEvent(CL.SIZED, this, pw, ph);
        };

        // override parent class repaint() method since the necessity
        // of the canvas element repainting should not be analyzed
        // basing on DOM
        this.repaint = function(x,y,w,h) {
            // if the canvas element has no parent nothing
            // should be redrawn
            if (pkg.$contains(this.canvas) &&
                this.canvas.style.visibility != "hidden")
            {
                if (arguments.length === 0) {
                    x = y = 0;
                    w = this.width;
                    h =  this.height;
                }

                if (w > 0 && h > 0 && pkg.paintManager != null) {
                    pkg.paintManager.repaint(this, x,y,w,h);
                }
            }
        };

        this.setFeatures = function() {
           for (var i=0; i < arguments.length; i++) {
               new (Class.forName(arguments[i]))(this);
           }
        };
    },

    function() {
        this.$this(400, 400);
    },

    function(w, h) {
        var e = document.createElement("canvas");
        e.setAttribute("class", "zebcanvas");
        e.setAttribute("id", this.toString());
        e.onselectstart = function() { return false; };
        this.$this(e, w, h);
    },

    function(element) {
        this.$this(element, -1, -1);
    },

    function(element, w, h) {
        var $this = this;

        //  TODO:
        //  touch event listeners have to be taking also
        //  in account
        this.$nativeListeners = {
            "onmousemove": null,
            "onmousedown": null,
            "onmouseup": null,
            "onmouseover": null,
            "onmouseout": null,
            "onkeydown": null,
            "onkeyup": null,
            "onkeypress": null
        };

        /**
         * Reference to HTML Canvas element  where the zebra canvas UI
         * components are hosted
         * @protected
         * @readOnly
         * @attribute canvas
         * @type {Canvas}
         */

        //!!! canvas field  has to be set before super
        if (zebra.isString(element)) {
            this.canvas = document.getElementById(element);

            if (this.canvas == null) {
                throw new Error("Canvas element cannot be found");
            }

            if (pkg.$detectZCanvas(this.canvas) != null) {
                throw new Error("Canvas id = '" + element + "'' is already in use");
            }
        }
        else {
            this.canvas = element;
            if (!pkg.$contains(this.canvas)) {
                document.body.appendChild(this.canvas);
            }
        }

        if (w < 0) w = this.canvas.offsetWidth;
        if (h < 0) h = this.canvas.offsetHeight;

        //!!! Pay attention IE9 handles padding incorrectly
        //!!! the padding has to be set to 0px by appropriate
        //!!! style sheet getPropertySetter
        if (this.canvas.getAttribute("tabindex") === null) {
            this.canvas.setAttribute("tabindex", "1");
        }

        /**
         * Keeps rectangular "dirty" area of the canvas component
         * @private
         * @attribute $da
         * @type {Object}
                { x:Integer, y:Integer, width:Integer, height:Integer }
         */
        this.$da = { x: 0, y: 0, width: -1, height: 0 };

        if (zebra.isTouchable) {
            new pkg.TouchHandler(this.canvas, [
                function $prototype() {
                    this.started = function(e) {
                        ME_STUB.touch          = e;
                        ME_STUB.touches        = this.touches;
                        ME_STUB.touchCounter   = this.touchCounter;
                        $this.$mousePressed(e.identifier, e,
                                           this.touchCounter == 1 ? ME.LEFT_BUTTON
                                                                  : (e.group != null && e.group.size == 2 && e.group.index == 1 ? ME.RIGHT_BUTTON : 0));
                    };

                    this.ended = function(e) {
                        ME_STUB.touch          = e;
                        ME_STUB.touches        = this.touches;
                        ME_STUB.touchCounter   = this.touchCounter;
                        $this.$mouseReleased(e.identifier, e);
                    };

                    this.moved = function(e) {
                        ME_STUB.touch          = e;
                        ME_STUB.touches        = this.touches;
                        ME_STUB.touchCounter   = this.touchCounter;
                        $this.$mouseMoved(e.identifier, e);
                    };
                }
            ]);
        }
        else {
            var oldPX = -1, oldPY = -1;
            this.canvas.onmousemove = function(e) {
                // ignore extra mouse moved event appearing in IE
                if (oldPY != e.pageY || oldPX != e.pageX) {
                    oldPX = e.pageX;
                    oldPY = e.pageY;
                    $this.$mouseMoved(1, e);
                }
                e.stopPropagation();
            };

            this.canvas.onmousedown = function(e) {
                $this.$mousePressed(1, e, e.button === 0 ? ME.LEFT_BUTTON
                                                        : (e.button == 2 ? ME.RIGHT_BUTTON : 0));
                e.stopPropagation();
            };

            this.canvas.onmouseup = function(e) {
                $cleanDragFix();
                $this.$mouseReleased(1, e);
                e.stopPropagation();
            };

            this.canvas.onmouseover = function(e) {
                $this.$mouseEntered(1, e);
                e.stopPropagation();
            };

            this.canvas.onmouseout = function(e) {
                $this.$mouseExited(1, e);
                oldPX = oldPY = -1;
                e.stopPropagation();
            };

            this.canvas.oncontextmenu = function(e) {
                e.preventDefault();
            };

            this.canvas.onkeydown = function(e) {
                $this.$keyPressed(e);
                e.stopPropagation();
            };

            this.canvas.onkeyup = function(e) {
                $this.$keyReleased(e);
                e.stopPropagation();
            };

            this.canvas.onkeypress = function(e) {
                $this.$keyTyped(e);
                e.stopPropagation();
            };
        }

        this.canvas.onfocus = function(e) {
            if ($this.$focusGainedCounter++ > 0) {
                e.preventDefault();
                return;
            }

            if (pkg.focusManager.canvasFocusGained) {
                pkg.focusManager.canvasFocusGained($this);
            }
        };

        this.canvas.onblur = function(e) {
            //!!! sometimes focus lost comes incorrectly
            //    ignore focus lost if canvas still holds focus
            if (document.activeElement == $this.canvas) {
                e.preventDefault();
                return;
            }

            if ($this.$focusGainedCounter !== 0) {
                $this.$focusGainedCounter = 0;

                if (pkg.focusManager.canvasFocusLost != null) {
                    pkg.focusManager.canvasFocusLost($this);
                }
            }
        };

        this.$super();

        // !!!
        // save canvas in list of created Zebra canvases
        // do it before calling setSize(w,h) method
        pkg.$canvases.push(this);

        this.setSize(w, h);

        // sync canvas visibility with what canvas style says
        var cvis = (this.canvas.style.visibility == "hidden" ? false : true);
        if (this.isVisible != cvis) {
            this.setVisible(cvis);
        }

        if (this.canvasInitialized != null) {
            this.canvasInitialized();
        }
    },

    function setLocation(x, y) {
        this.canvas.style.top  = y + "px";
        this.canvas.style.left = x + "px";
        this.canvas.style.position = "absolute";
        this.recalcOffset();
        return this;
    },

    function setSize(w, h) {
        if (this.width != w || h != this.height) {
            var pw  = this.width,
                ph  = this.height,
                ctx = pkg.$canvas.size(this.canvas, w, h);

            //TODO: top works not good in FF and it is better don't use it 
            // So, ascent has to be taking in account as it was implemented 
            // before 
            this.$context = ctx;
            if (this.$context.textBaseline != "top" ) {
                this.$context.textBaseline = "top";
            }

            // canvas has one instance of context, the code below
            // test if the context has been already full filled
            // with necessary methods and if it is true reset and
            // returns canvas
            if (typeof ctx.tX !== "undefined") {
                ctx.reset(w, h);
            }
            else {
                // customize context with number of new methods
                //var proto = ctx.constructor.prototype;
                var $scale     = ctx.scale,
                    $translate = ctx.translate,
                    $rotate    = ctx.rotate,
                    $save      = ctx.save,
                    $restore   = ctx.restore;

                ctx.reset = function(w, h) {
                    this.counter = 0;
                    var s = this.stack[0];
                    s.srot = s.rotateVal = s.x = s.y = s.width = s.height = s.dx = s.dy = 0;
                    s.crot = s.sx = s.sy = 1;
                    s.width = w;
                    s.height = h;
                    this.setFont(pkg.font);
                    this.setColor("white");
                };

                // pre-allocate canvas save stack
                ctx.stack = Array(50);
                for(var i=0; i < ctx.stack.length; i++) {
                    var s = {};
                    s.srot = s.rotateVal = s.x = s.y = s.width = s.height = s.dx = s.dy = 0;
                    s.crot = s.sx = s.sy = 1;
                    ctx.stack[i] = s;
                }
                ctx.reset(w, h);

                ctx.tX = function(x, y) {
                    var c = this.stack[this.counter], b = (c.sx != 1 || c.sy != 1 || c.rotateVal !== 0);
                    return (b ?  (((c.crot * x + y * c.srot)/c.sx + 0.5) | 0) : x) - c.dx;
                };

                ctx.tY = function(x, y) {
                    var c = this.stack[this.counter], b = (c.sx != 1 || c.sy != 1 || c.rotateVal !== 0);
                    return (b ? (((y * c.crot - c.srot * x)/c.sy + 0.5) | 0) : y) - c.dy;
                };

                ctx.translate = function(dx, dy) {
                    if (dx !== 0 || dy !== 0) {
                        var c = this.stack[this.counter];
                        c.x  -= dx;
                        c.y  -= dy;
                        c.dx += dx;
                        c.dy += dy;
                        $translate.call(this, dx, dy);
                    }
                };

                ctx.rotate = function(v) {
                    var c = this.stack[this.counter];
                    c.rotateVal += v;
                    c.srot = MS(c.rotateVal);
                    c.crot = MC(c.rotateVal);
                    $rotate.call(this, v);
                };

                ctx.scale = function(sx, sy) {
                    var c = this.stack[this.counter];
                    c.sx = c.sx * sx;
                    c.sy = c.sy * sy;
                    $scale.call(this, sx, sy);
                };

                ctx.save = function() {
                    this.counter++;
                    var c = this.stack[this.counter], cc = this.stack[this.counter - 1];
                    c.x = cc.x;
                    c.y = cc.y;
                    c.width = cc.width;
                    c.height = cc.height;

                    c.dx = cc.dx;
                    c.dy = cc.dy;
                    c.sx = cc.sx;
                    c.sy = cc.sy;
                    c.srot = cc.srot;
                    c.crot = cc.crot;
                    c.rotateVal = cc.rotateVal;

                    $save.call(this);
                    return this.counter - 1;
                };

                ctx.restore = function() {
                    if (this.counter === 0) {
                        throw new Error("Context restore history is empty");
                    }

                    this.counter--;
                    $restore.call(this);
                    return this.counter;
                };

                ctx.clipRect = function(x,y,w,h){
                    var c = this.stack[this.counter];
                    if (c.x != x || y != c.y || w != c.width || h != c.height) {
                        var xx = c.x, yy = c.y,
                            ww = c.width, hh = c.height,
                            xw = x + w, xxww = xx + ww,
                            yh = y + h, yyhh = yy + hh;

                        c.x      = x > xx ? x : xx;
                        c.width  = (xw < xxww ? xw : xxww) - c.x;
                        c.y      = y > yy ? y : yy;
                        c.height = (yh < yyhh ? yh : yyhh) - c.y;

                        if (c.x != xx || yy != c.y || ww != c.width || hh != c.height) {
                            // begin path is very important to have proper clip area
                            this.beginPath();
                            this.rect(x, y, w, h);
                            this.closePath();
                            this.clip();
                        }
                    }
                };
            }

            this.width  = w;
            this.height = h;

           // if (zebra.isTouchable) {
           //      the strange fix for Android native browser
           //      that can render text blurry before you click
           //      it happens because the browser auto-fit option
           //      var $this = this;
           //      setTimeout(function() {
           //          $this.invalidate();
           //          $this.validate();
           //          $this.repaint();
           //      }, 200);
           //  }
           //  else {
                this.invalidate();
                this.validate();
                this.repaint();
            // }

            if (w != pw || h != ph) {
                this.resized(pw, ph);
            }

            // let know to other zebra canvases that
            // the size of an element on the page has
            // been updated and they have to correct
            // its anchor.
            pkg.$elBoundsUpdated();

            // sometimes changing size can bring to changing canvas location
            // it is required to recalculate offsets
//            this.recalcOffset();
        }

        return this;
    },

    /**
     * Stretch Canvas to occupy full screen area
     * @method fullScreen
     */
    function fullScreen() {
        /**
         * Indicate if the canvas has to be stretched to
         * fill the whole screen area.
         * @type {Boolean}
         * @attribute isFullScreen
         * @readOnly
         */
        this.isFullScreen = true;
        this.setLocation(0,0);

        var ws = pkg.$windowSize();
        this.setSize(ws.width, ws.height);
    },

    function setEnabled(b) {
        if (this.isEnabled != b) {
            // !!!
            // Since disabled state for Canvas element doesn't work
            // we have to emulate it via canvas listeners removal
            //
            for(var k in this.$nativeListeners) {
                if (b) {
                    this.canvas[k] = this.$nativeListeners[k];
                    this.$nativeListeners[k] = null;
                }
                else {
                    this.$nativeListeners[k] = this.canvas[k];
                    this.canvas[k] = null;
                }
            }

            // have to be decided if super has to be called
            //this.$super(b);

            this.isEnabled = b;
        }
        return this;
    },

    function setVisible(b) {
        var prev = this.isVisible;
        this.canvas.style.visibility = b ? "visible" : "hidden";
        this.$super(b);
        if (b != prev) {
            this.repaint();
        }
        return this;
    },

    function vrp() {
        this.$super();
        if (pkg.$contains(this.canvas)) {
            this.repaint();
        }
    },

    function kidAdded(i,constr,c){
        if (typeof this[c.id] !== "undefined") {
            throw new Error("Layer '" + c.id + "' already exist");
        }
        this[c.id] = c;
        this.$super(i, constr, c);
    },

    function kidRemoved(i, c){
        delete this[c.id];
        this.$super(i, c);
    },

    function requestFocus() {
        if (document.activeElement != this.canvas) {
            this.canvas.focus();
        }
    }
]);

zebra.ready(
    // dynamic HTML DOM tree has to be placed to separated function
    // that has to be first in ready list. the function make
    // the page loading busy before necessary dynamically
    // inserted elements will be ready.
    function() {
        zebra.busy();
        $fmCanvas = document.createElement("canvas").getContext("2d");

        var e = document.getElementById("zebra.fm");
        if (e == null) {
            e = document.createElement("div");
            e.setAttribute("id", "zebra.fm");
            e.setAttribute("style", "visibility:hidden;line-height:0;height:1px;vertical-align:baseline;");
            e.innerHTML = "<span id='zebra.fm.text' style='display:inline;vertical-align:baseline;'>&nbsp;</span>" +
                          "<img id='zebra.fm.image' style='width:1px;height:1px;display:inline;vertical-align:baseline;' width='1' height='1'/>";
            document.body.appendChild(e);
        }
        $fmText  = document.getElementById("zebra.fm.text");
        $fmImage = document.getElementById("zebra.fm.image");

        // the next function passed to zebra.ready() will be blocked
        // till the picture is completely loaded
        $fmImage.onload = function() {
           zebra.ready();
        };

        // set 1x1 transparent picture
        $fmImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII%3D';
    },

    function() {
        try {
            zebra.busy();
            pkg.$configuration = new pkg.Bag(pkg);

            var p = zebra()['zebra.json'];
            pkg.$configuration.loadByUrl(p ? p
                                           : pkg.$url.join("canvas.json"), false);

            while($configurators.length > 0) {
                $configurators.shift()(pkg.$configuration);
            }

            pkg.$configuration.end();

            // store ref to event manager
            EM = pkg.events;

            if (pkg.clipboardTriggerKey > 0) {
                // create hidden text area to support clipboard
                $clipboard = document.createElement("textarea");
                $clipboard.setAttribute("style", "display:none; position: absolute; left: -99em; top:-99em;");

                $clipboard.onkeydown = function(ee) {
                    $clipboardCanvas.$keyPressed(ee);
                    $clipboard.value="1";
                    $clipboard.select();
                };

                $clipboard.onkeyup = function(ee) {
                    if (ee.keyCode == pkg.clipboardTriggerKey) {
                        $clipboard.style.display = "none";
                        $clipboardCanvas.canvas.focus();
                        $clipboardCanvas.canvas.onblur  = $clipboardCanvas.focusLost;
                        $clipboardCanvas.canvas.onfocus = $clipboardCanvas.focusGained;
                    }
                    $clipboardCanvas.$keyReleased(ee);
                };

                $clipboard.onblur = function() {
                    this.value="";
                    this.style.display="none";

                    //!!! pass focus back to canvas
                    //    it has to be done for the case when cmd+TAB (switch from browser to
                    //    another application)
                    $clipboardCanvas.canvas.focus();
                };

                $clipboard.oncopy = function(ee) {
                    if (pkg.focusManager.focusOwner && pkg.focusManager.focusOwner.clipCopy != null) {
                        var v = pkg.focusManager.focusOwner.clipCopy();
                        $clipboard.value = (v == null ? "" : v);
                        $clipboard.select();
                    }
                };

                $clipboard.oncut = function(ee) {
                    if (pkg.focusManager.focusOwner && pkg.focusManager.focusOwner.cut) {
                        $clipboard.value = pkg.focusManager.focusOwner.cut();
                        $clipboard.select();
                    }
                };

                if (zebra.isFF) {
                    $clipboard.addEventListener ("input", function(ee) {
                        if (pkg.focusManager.focusOwner &&
                            pkg.focusManager.focusOwner.clipPaste != null)
                        {
                            pkg.focusManager.focusOwner.clipPaste($clipboard.value);
                        }
                    }, false);
                }
                else {
                    $clipboard.onpaste = function(ee) {
                        if (pkg.focusManager.focusOwner && pkg.focusManager.focusOwner.clipPaste != null) {
                            var txt = (typeof ee.clipboardData == "undefined") ? window.clipboardData.getData('Text')  // IE
                                                                               : ee.clipboardData.getData('text/plain');
                            pkg.focusManager.focusOwner.clipPaste(txt);
                        }
                        $clipboard.value = "";
                    };
                }
                document.body.appendChild($clipboard);
            }

            //!!!
            // IE9 has an error: first mouse press formally pass focus to
            // canvas, but actually it doesn't get key events. To fix it
            // it is necessary to pass focus explicitly to window
            if (zebra.isIE) window.focus();
        }
        catch(e) {
            ///!!!!! for some reason throwing exception is not appeared in console.
            //       but it has side effect to the system, what causes other exception
            //       that is not relevant to initial one

            console.log(e.stack ? e.stack : e);
            throw new Error(e.toString());
        }
        finally { zebra.ready(); }
    }
);

/**
 * @for
 */

})(zebra("ui"), zebra.Class);
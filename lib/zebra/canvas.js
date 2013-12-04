(function(pkg, Class, Interface) {

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
    $configurators = [],rgb = zebra.util.rgb, temporary = { x:0, y:0, width:0, height:0 },
    MS = Math.sin, MC = Math.cos, $fmCanvas = null, $fmText = null,
    $fmImage = null, $clipboard = null, $clipboardCanvas, $canvases = [],
    $ratio = typeof window.devicePixelRatio !== "undefined" ? window.devicePixelRatio
                                                            : (typeof window.screen.deviceXDPI !== "undefined" ? // IE
                                                                window.screen.deviceXDPI / window.screen.logicalXDPI : 1); 

pkg.clipboardTriggerKey = 0;

function $meX(e, d) { return d.$context.tX(e.pageX - d.offx, e.pageY - d.offy); }
function $meY(e, d) { return d.$context.tY(e.pageX - d.offx, e.pageY - d.offy); }

// canvases location has to be corrected if document layout is invalid 
function elBoundsUpdated() {
    for(var i = $canvases.length - 1; i >= 0; i--) {
        var c = $canvases[i];
        if (c.isFullScreen) {
            c.setLocation(0, 0);
            c.setSize(window.innerWidth, window.innerHeight);
        }
        c.recalcOffset();
    }
}

pkg.$view = function(v) {
    if (v == null) return null;

    if (v.paint) return v;

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

    v = new pkg.View();
    v.paint = f;
    return v;
};

pkg.$detectZCanvas = function(canvas) {
    if (zebra.isString(canvas)) canvas = document.getElementById(canvas);
    for(var i=0; canvas != null && i < $canvases.length; i++) {
        if ($canvases[i].canvas == canvas) return $canvases[i];
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
         * Target component to be visualized  
         * @attribute target
         * @default null
         * @readOnly
         * @type {Object}
         */

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
                if (this.targetWasChanged) this.targetWasChanged(old, o);
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

    function() { this.$this(pkg.lightBrColor, pkg.midBrColor); },

    function(brightest,middle) {
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
    function () { this.$this(pkg.lightBrColor, pkg.midBrColor, pkg.darkBrColor); },

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
    function () { this.$this(pkg.lightBrColor, pkg.midBrColor); },

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
    /**
     * @attribute color
     * @readOnly
     * @type {String}
     * @default "black"
     */

    function $prototype() {
        this.paint = function(g,x,y,w,h,d){
            g.setColor(this.color);
            g.drawDottedRect(x, y, w, h);
        };

        this[''] = function (c){
            this.color = (c == null) ? "black" : c;
        };
    }
]);

/**
 * Border view. Can be used to render CSS-like border.
 * @param  {String}  [c] border color 
 * @param  {Integer} [w] border width
 * @param  {Integer} [r] border corners radius
 * @constructor
 * @class zebra.ui.Border
 * @extends zebra.ui.View 
 */
pkg.Border = Class(pkg.View, [
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
        
        this.paint = function(g,x,y,w,h,d){
            if (this.color == null) return;

            var ps = g.lineWidth;
            g.lineWidth = this.width;
            if (this.radius > 0) this.outline(g,x,y,w,h, d);
            else {
                var dt = this.width / 2;
                g.beginPath();
                g.rect(x + dt, y + dt, w - this.width, h - this.width);
            }
            g.setColor(this.color);
            g.stroke();
            g.lineWidth = ps;
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
         * @return {Boolean} true if the outline has to be applied as an UI component shape 
         */
        this.outline = function(g,x,y,w,h,d) {
            if (this.radius <= 0) return false;
            var r = this.radius, dt = this.width / 2, xx = x + w - dt, yy = y + h - dt;
            x += dt;
            y += dt;
            g.beginPath();
            g.moveTo(x - 1 + r, y);
            g.lineTo(xx - r, y);
            g.quadraticCurveTo(xx, y, xx, y + r);
            g.lineTo(xx, yy  - r);
            g.quadraticCurveTo(xx, yy, xx - r, yy);
            g.lineTo(x + r, yy);
            g.quadraticCurveTo(x, yy, x, yy - r);
            g.lineTo(x, y + r);
            g.quadraticCurveTo(x, y, x + r, y);
            return true;
        };

        this[''] = function (c,w,r){
            this.color  = (arguments.length === 0) ? "gray" : c;
            this.width  = (w == null) ? 1 : w;
            this.radius = (r == null) ? 0 : r;
            this.gap = this.width + Math.round(this.radius / 4);
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
            g.arc(x + w/2, y + h/2, w/2, 0, 2*Math.PI, false);
            return true;
        };

        this[''] = function(col, width) {
            this.color = null;
            this.width  = 1;

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
* @param {Integer} [type] type of gradient 
* "zebra.layout.VERTICAL" or "zebra.layout.HORIZONTAL"
* @constructor
* @class zebra.ui.Gradient
* @extends zebra.ui.View
*/
pkg.Gradient = Class(pkg.View, [
    /**
     * Gradient orientation: vertical or horizontal
     * @attribute orientation 
     * @readOnly
     * @default zebra.layout.VERTICAL
     * @type {Integer}
     */

    function $prototype() {
        this[''] =  function(){
            this.colors = Array.prototype.slice.call(arguments, 0);
            if (zebra.isNumber(arguments[arguments.length-1])) {
                this.orientation = arguments[arguments.length-1];
                this.colors.pop();
            }
            else {
                this.orientation = L.VERTICAL;
            }
        };

        this.paint = function(g,x,y,w,h,dd){
            var d = (this.orientation == L.HORIZONTAL? [0,1]: [1,0]),
                x1 = x*d[1], y1 = y * d[0], x2 = (x + w - 1) * d[1], y2 = (y + h - 1) * d[0];

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
        this[''] =  function(){
            this.colors = Array.prototype.slice.call(arguments, 0);
        };

        this.paint = function(g,x,y,w,h,d){
            var cx1 = w/2, cy1 = w/2;
            this.gradient = g.createRadialGradient(cx1, cy1, 10, cx1, cy1, w < h ? w : h);
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
* @param {Boolean} [ub] a boolean flag to say if the rendered 
* image has to be double buffered
* @constructor
* @class zebra.ui.Picture
* @extends zebra.ui.Render
*/
pkg.Picture = Class(pkg.Render, [
    function $prototype() {
        this[""] = function (img,x,y,w,h,ub) {
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

            if (zebra.isBoolean(arguments[arguments.length-1]) === false) {
                ub = w > 0 && h > 0 && w < 64 && h < 64;
            }

            if (ub === true) {
                this.buffer = document.createElement("canvas");
                this.buffer.width = 0;
            }
        };

        this.paint = function(g,x,y,w,h,d){
            if (this.target != null && w > 0 && h > 0){
                var img = this.target;
                if (this.buffer) {
                    img = this.buffer;
                    if (img.width <= 0) {
                        var ctx = img.getContext("2d");
                        if (this.width > 0) {
                            img.width  = this.width;
                            img.height = this.height;
                            ctx.drawImage(this.target, this.x, this.y, this.width,
                                          this.height, 0, 0, this.width, this.height);
                        }
                        else {
                            img.width  = this.target.width;
                            img.height = this.target.height;
                            ctx.drawImage(this.target, 0, 0);
                        }
                    }
                }

                if (this.width > 0 && !this.buffer) {
                    g.drawImage(img, this.x, this.y,
                                this.width, this.height, x, y, w, h);
                }
                else {
                    g.drawImage(img, x, y, w, h);
                }
            }
        };

        this.targetWasChanged = function(o, n) {
            if (this.buffer) delete this.buffer;
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
        this.paint = function(g,x,y,w,h,d) {
            if (this.pattern == null) {
                this.pattern = g.createPattern(this.target, 'repeat');
            }
            g.rect(x, y, w, h);
            g.fillStyle = this.pattern;
            g.fill();
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
            if (v.getLeft) {
                b = v.getLeft();
                if (b > this.left) this.left = b;
            }

            if (v.getRight) {
                b = v.getRight();
                if (b > this.right) this.right = b;
            }

            if (v.getTop) {
                b = v.getTop();
                if (b > this.top) this.top = b;
            }

            if (v.getBottom) {
                b = v.getBottom();
                if (b > this.bottom) this.bottom = b;
            }


            if (ps.width > this.width) this.width = ps.width;
            if (ps.height > this.height) this.height = ps.height;

            if (this.voutline == null && v.outline) {
                this.voutline = v;
            }
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
        this.activate = function (id){
            var old = this.activeView;
            if (this.views.hasOwnProperty(id)) {
                return (this.activeView = this.views[id]) != old;
            }
            else {
                if (id.length > 1 && id[0] != '*' && id[id.length-1] != '*') {
                    var i = id.indexOf('.');
                    if (i > 0) {
                        var k = id.substring(0, i + 1).concat('*');
                        if (this.views.hasOwnProperty(k)) {
                            return (this.activeView = this.views[k]) != old;
                        }
                        else {
                            k = "*" + id.substring(i);
                            if (this.views.hasOwnProperty(k)) {
                                return (this.activeView = this.views[k]) != old;
                            }
                        }
                    }
                }
            }

            if (this.views.hasOwnProperty("*")) {
                return (this.activeView = this.views["*"]) != old;
            }
            return false;
        };

        this[''] = function(args) {
            if (args == null) {
                throw new Error("Invalid null view set");
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
        this.usePropertySetters =  true; //false;

        this.contentLoaded = function(v) {
            if (v == null || zebra.isNumber(v) || zebra.isBoolean(v)) return v;
            if (zebra.isString(v)) {
                if (this.root && v[0] == "%" && v[1] == "r") {
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
        this.$super(url, b);
    }
]);

rgb.prototype.paint = function(g,x,y,w,h,d) {
    if (this.s != g.fillStyle) g.fillStyle = this.s;
    g.fillRect(x, y, w, h);
};

rgb.prototype.getPreferredSize = function() {
    return { width:0, height:0 };
};

pkg.getPreferredSize = function(l) {
    return l != null && l.isVisible ? l.getPreferredSize() 
                                    : { width:0, height:0 };
};

var $cvp = pkg.$cvp = function(c, r) {
    if (c.width > 0 && c.height > 0 && c.isVisible){
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
* Mouse and touch screen listener interface to express intention to 
* handle mouse or touch screen events
* @class zebra.ui.MouseListener 
* @interface
*/

/**
* The method is called when a mouse button has been pressed or 
* a finger has touched a touch screen
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mousePressed
*/

/**
* The method is called when a mouse button has been released or 
* a finger has untouched a touch screen
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mouseReleased
*/

/**
* The method is called when a mouse cursor has been moved with 
* no one mouse button has been pressed
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mouseMoved
*/

/**
* The method is called when a mouse cursor entered the given component
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mouseEntered
*/

/**
* The method is called when a mouse cursor exited the given component
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mouseExited
*/

/**
* The method is called when a mouse button has been clicked. Click events
* are generated only if no one mouse moved or drag events has been generated
* in between mouse pressed -> mouse released events sequence. 
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mouseClicked
*/

/**
* The method is called when a mouse cursor has been moved when a mouse button 
* has been pressed. Or when a finger has been moved over a touch screen.
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mouseDragged
*/

/**
* The method is called when a mouse cursor has been moved first time when a mouse button 
* has been pressed. Or when a finger has been moved first time over a touch screen.
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mouseDragStarted
*/

/**
* The method is called when a mouse cursor has been moved last time when a mouse button 
* has been pressed. Or when a finger has been moved last time over a touch screen.
* @optional
* @param {zebra.ui.MouseEvent} e a mouse event
* @method  mouseDragEnded
*/
var MouseListener  = pkg.MouseListener = Interface(),

/**
 * Focus listener interface to express intention to handle focus events
 * @class zebra.ui.FocusListener 
 * @interface
 */

/**
 * The method is called when a component has gained focus 
 * @optional
 * @param {zebra.ui.InputEvent} e an input event
 * @method  focusGained
 */

/**
 * The method is called when a component has lost focus 
 * @optional
 * @param {zebra.ui.InputEvent} e an input event
 * @method  focusLost
 */
FocusListener = pkg.FocusListener = Interface(),

/**
 * Key listener interface to express intention to handle key events
 * @class zebra.ui.KeyListener
 * @interface
 */

/**
 * The method is called when a key has been pressed
 * @optional
 * @param {zebra.ui.KeyEvent} e a key event
 * @method  keyPressed
 */

/**
 * The method is called when a key has been typed
 * @optional
 * @param {zebra.ui.KeyEvent} e a key event
 * @method  keyTyped
 */

/**
 * The method is called when a key has been released 
 * @optional
 * @param {zebra.ui.KeyEvent} e a key event
 * @method  keyReleased
 */

/**
 * The method is called when a key has been pressed
 * @optional
 * @param {zebra.ui.KeyEvent} e a key event
 * @method  keyPressed
 */
KeyListener = pkg.KeyListener = Interface(),

/**
 * Interface to express intention to control children UI components event handling by 
 * making them events transparent
 * @class zebra.ui.Composite 
 * @interface
 */

/**
 * The method is called to ask if the given children UI component 
 * has to be events transparent
 * @optional
 * @param {zebra.ui.Panel} c a children UI component
 * @return {Boolean} true if the given children component has 
 * to be events transparent
 * @method catchInput
 */
Composite = pkg.Composite = Interface(),

/**
 * Interface to express intention to handle children UI components events
 * @class zebra.ui.ChildrenListener 
 * @interface
 */

/**
 * The method is called when an input event has occurred in the children component 
 * @optional
 * @param {zebra.ui.InputEvent} e an input event that has occurred in a children 
 * UI component
 * @method childInputEvent
 */
ChildrenListener = pkg.ChildrenListener = Interface(),

/**
 * Interface to express intention to participate in native clipboard copy-paste actions. 
 * A component that implements it and has focus can get / send data into / from clipboard
 * @class zebra.ui.CopyCutPaste
 * @interface
 */    

/**
 * The method is called to ask return a string that has to be put into clipboard 
 * @optional
 * @return {String} a string to copy in native clipboard 
 * @method copy
 */

/**
 * The method is called to pass string from clipboard to a component 
 * "CopyCutPaste" interface implements
 * @optional
 * @param {String} s a string from native clipboard
 * @method paste
 */
CopyCutPaste = pkg.CopyCutPaste = Interface(),

/**
 * Interface to express intention to catch component events
 * @class zebra.ui.ComponentListener
 * @interface
 */

/**
 * The method is called when a component has been re-sized
 * @optional
 * @param {zebra.ui.Panel} c a component that has been sized
 * @param {Integer} pw a previous width the sized component had
 * @param {Integer} ph a previous height the sized component had
 * @method compSized
 */

/**
 * The method is called when a component has been re-located
 * @optional
 * @param {zebra.ui.Panel} c a component that has been moved
 * @param {Integer} px a previous x coordinate the moved component had
 * @param {Integer} py a previous y coordinate the moved component had
 * @method compMoved
 */

/**
 * The method is called when a component enabled state has been updated
 * @optional
 * @param {zebra.ui.Panel} c a component whose enabled state has been updated
 * @method compEnabled
 */

/**
 * The method is called when a component visibility state has been updated
 * @optional
 * @param {zebra.ui.Panel} c a component whose visibility state has been updated
 * @method compShown
 */

/**
 * The method is called when a component has been inserted into another UI component
 * @optional
 * @param {zebra.ui.Panel} p a parent component of the component has been added
 * @param {Object} constr a layout constraints 
 * @param {zebra.ui.Panel} c a component that has been added
 * @method compAdded
 */

/**
 * The method is called when a component has been removed from its parent UI component
 * @optional
 * @param {zebra.ui.Panel} p a parent component of the component that has been removed
 * @param {zebra.ui.Panel} c a component that has been removed 
 * @method compRemoved
 */
CL = pkg.ComponentListener = Interface();

CL.ENABLED  = 1;
CL.SHOWN    = 2;
CL.MOVED    = 3;
CL.SIZED    = 4;
CL.ADDED    = 5;
CL.REMOVED  = 6;


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
        this.FOCUS_LOST   = 10;
        this.FOCUS_GAINED = 11;
    },

    function (target, id, uid) {
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
    }
]);

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
var KE = pkg.KeyEvent = Class(IE, [
    function $clazz() {
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
]);

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
var ME = pkg.MouseEvent = Class(IE, [
    function $clazz() {
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
         * Reset the event properties with new values 
         * @private
         * @param  {zebra.ui.Panel} target  a target component that triggers the event
         * @param  {Ineteger} id an unique id of the event
         * @param  {Ineteger} ax an absolute (relatively to a canvas where the target 
         * component is hosted) x mouse cursor coordinate
         * @param  {Ineteger} ay an absolute (relatively to a canvas where the target 
         * component is hosted) y mouse cursor coordinate
         * @param  {Ineteger} mask   a pressed mouse buttons mask 
         * @param  {Ineteger} clicks number of a button clicks
         * @method  reset
         */
        this.reset = function(target,id,ax,ay,mask,clicks){
            this.source = target;
            this.ID     = id;
            this.absX   = ax;
            this.absY   = ay;
            this.mask   = mask;
            this.clicks = clicks;

            var p = L.getTopParent(target);
            while(target != p){
                ax -= target.x;
                ay -= target.y;
                target = target.parent;
            }
            this.x = ax;
            this.y = ay;
        };

        this.isActionMask = function(){
            return this.mask == ME.LEFT_BUTTON;
        };
    },

    function (target,id,ax,ay,mask,clicks){
        this.$super(target, id, IE.MOUSE_UID);
        this.reset(target, id, ax, ay, mask, clicks);
    }
]);

var MDRAGGED = ME.DRAGGED, EM = null, MMOVED = ME.MOVED, MEXITED = ME.EXITED,
    KPRESSED = KE.PRESSED, MENTERED = ME.ENTERED,
    context = Object.getPrototypeOf(document.createElement('canvas').getContext('2d')),
    $mousePressedEvents = {}, $keyPressedCode = -1, $keyPressedOwner = null,
    $keyPressedModifiers = 0, KE_STUB = new KE(null,  KPRESSED, 0, 'x', 0),
    ME_STUB = new ME(null, ME.PRESSED, 0, 0, 0, 1);

pkg.paintManager = pkg.events = pkg.$mouseMoveOwner = null;

// !!!!
// the document mouse up happens when we drag outside a canvas
// in this case canvas doesn't get mouse up, so we do it by global 
// mouseup handler
document.addEventListener("mouseup", function(e) {
    for(var k in $mousePressedEvents) {
        var mp = $mousePressedEvents[k];
        if (mp.canvas != null) {
            mp.canvas.mouseReleased(k, mp);
        }
    }
},  false);

// !!!
// override alert to keep control on event sequence, it is very 
// browser dependent
var $alert = (function(){ return this.alert; }());
window.alert = function() {
    if ($keyPressedCode > 0) {
        KE_STUB.reset($keyPressedOwner, KE.RELEASED, 
                      $keyPressedCode, '', $keyPressedModifiers);
        EM.performInput(KE_STUB);
        $keyPressedCode = -1;
    }
    $alert.apply(window, arguments);
    for(var k in $mousePressedEvents) {
        var mp = $mousePressedEvents[k];
        if (mp.canvas != null) {
            mp.canvas.mouseReleased(k, mp);
        }
    }
};

//!!!! debug 
// var debugOff = false, shift = [];
// function debug(msg, d) {
//     if (debugOff) return ;
//     if (d == -1) shift.pop();
//     zebra.print(shift.join('') + msg);
//     if (d == 1) shift.push('    ');
// }

context.setFont = function(f) {
    f = (f.s ? f.s : f.toString()); 
    if (f != this.font) {
        this.font = f;
    }
};

context.setColor = function(c) {
    if (c == null) throw new Error("Null color");
    c = (c.s ? c.s : c.toString()); 
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

    var kappa = 0.5522848, ox = (w / 2) * kappa, oy = (h / 2) * kappa,
        xe = x + w, ye = y + h, xm = x + w / 2, ym = y + h / 2;
    this.moveTo(x, ym);
    this.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    this.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    this.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    this.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
};

context.polylinePath = function(xPoints, yPoints, nPoints){
    this.beginPath();
    this.moveTo(xPoints[0], yPoints[0]);
    for(var i=1; i < nPoints; i++) this.lineTo(xPoints[i], yPoints[i]);
};

context.drawOval = function(x,y,w,h) {
    this.ovalPath(x, y, w, h);
    this.stroke();
};

context.drawPolygon = function(xPoints,yPoints,nPoints){
    this.polylinePath(xPoints, yPoints, nPoints);
    this.lineTo(xPoints[0], yPoints[0]);
    this.stroke();
};

context.drawPolyline = function(xPoints,yPoints,nPoints){
    this.polylinePath(xPoints, yPoints, nPoints);
    this.stroke();
};

context.fillPolygon = function(xPoints,yPoints,nPoints){
    this.polylinePath(xPoints, yPoints, nPoints);
    this.lineTo(xPoints[0], yPoints[0]);
    this.fill();
};

context.fillOval = function(x,y,width,height){
    this.beginPath();
    this.ovalPath(x, y, width, height);
    this.fill();
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

//!!! has to be made public in layout !!!
function measure(e, cssprop) {
    var value = window.getComputedStyle ? window.getComputedStyle(e, null).getPropertyValue(cssprop)
                                        : (e.style ? e.style[cssprop]
                                                   : e.currentStyle[cssprop]);
    return (value == null || value == '') ? 0
                                          : parseInt(/(^[0-9\.]+)([a-z]+)?/.exec(value)[1], 10);
}

pkg.makeFullyVisible = function(d,c){
    var right = d.getRight(), top = d.getTop(), bottom = d.getBottom(), 
        left = d.getLeft(), xx = c.x, yy = c.y, ww = c.width, hh = c.height;
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
            if(xx < ll) px += (ll - xx);
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
 * @param  {String} path an URL
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
pkg.loadImage = function(path, ready) {
    var i = new Image();
    i.crossOrigin = '';
    i.crossOrigin='anonymous';
    zebra.busy();
    if (arguments.length > 1)  {
        i.onerror = function() {  zebra.ready(); ready(path, false, i); };
        i.onload  = function() {  zebra.ready(); ready(path, true, i);  };
    }
    else {
        i.onload  =  i.onerror = function() { zebra.ready(); };
    }
    i.src = path;
    return i;
};

/**
 *  This the core UI component class. All other UI components 
 *  has to be successor of the UI class. 

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

 *  @class zebra.ui.Panel
 *  @param {Object|zebra.layout.Layout} [l] pass a layout manager or 
 *  number of properties that have to be applied to the instance of 
 *  the panel class.
 *  @constructor
 *  @extends zebra.layout.Layoutable
 */
pkg.Panel = Class(L.Layoutable, [
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
          * Implement the method to say if the UI component can hold focus
          * @return {Boolean} true if the component can have gain focus
          * @method canHaveFocus
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
         * Setup UI component properties 
         * @param  {Object} p collection of properties to be applied 
         * @method properties
         * @return {zebra.ui.Panel} the class instance itself
         */
        this.properties = function(p) {
            for(var k in p) {
                if (p.hasOwnProperty(k)) {
                    var v = p[k], m = zebra.getPropertySetter(this, k);
                    if (v && v.$new) v = v.$new();
                    if (m == null) this[k] = v;
                    else {
                        if (Array.isArray(v)) m.apply(this, v);
                        else  m.call(this, v);
                    }
                }
            }
            return this;
        };

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
         * @return {Panel} a children UI component
         * @method getComponentAt
         */
        this.getComponentAt = function(x,y){
            var r = $cvp(this, temporary);
            if (r == null || (x < r.x || y < r.y ||
                x >= r.x + r.width || y >= r.y + r.height))
            {
                return null;
            }

            var k = this.kids;
            if (k.length > 0){
                for(var i = k.length; --i >= 0; ){
                    var d = k[i];
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
            if (this.parent != null) this.repaint();
        };

        this.getTop = function() {
            return this.border != null ? this.top + this.border.getTop() : this.top;
        };

        this.getLeft = function() {
            return this.border != null ? this.left + this.border.getLeft() : this.left;
        };

        this.getBottom = function() {
            return this.border != null ? this.bottom + this.border.getBottom() : this.bottom;
        };

        this.getRight  = function() {
            return this.border != null ? this.right  + this.border.getRight()  : this.right;
        };

        //!!! the method is not used yet
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
            pkg.events.performComp(CL.ADDED, this, constr, l);
            if (l.width > 0 && l.height > 0) l.repaint();
            else this.repaint(l.x, l.y, 1, 1);
        };

        /**
         * The method is implemented to be aware about a children component
         * removal.
         * @param  {Integer} i an index of a removed component 
         * @param  {zebra.ui.Panel} l a removed children component
         * @method kidRemoved
         */
        this.kidRemoved = function(i,l){
            pkg.events.performComp(CL.REMOVED, this, null, l);
            if (l.isVisible) this.repaint(l.x, l.y, l.width, l.height);
        };

        /**
         * The method is implemented to be aware the 
         * component location updating
         * @param  {Integer} px a previous x coordinate of the component
         * @param  {Integer} py a previous y coordinate of the component
         * @method relocated
         */
        this.relocated = function(px,py){ 
            pkg.events.performComp(CL.MOVED, this, px, py); 
        
            var p = this.parent, w = this.width, h = this.height;
            if (p != null && w > 0 && h > 0){
                var x = this.x, y = this.y, nx = x < px ? x : px, ny = y < py ? y : py;
                
                //!!! some mobile browser has bug: moving a component leaves 0.5 sized traces 
                //!!! to fix it 1 pixel extra has to be added to all sides of repainted rect area
                nx--;
                ny--;

                if (nx < 0) nx = 0;
                if (ny < 0) ny = 0;

                var w1 = p.width - nx, 
                    w2 = w + (x > px ? x - px : px - x),
                    h1 = p.height - ny,
                    h2 = h + (y > py ? y - py : py - y);

                pkg.paintManager.repaint(p, nx, ny, (w1 < w2 ? w1 : w2) + 2, //!!! add crappy 2 for mobile
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
            pkg.events.performComp(CL.SIZED, this, pw, ph); 

            if (this.parent != null) {
                pkg.paintManager.repaint(this.parent, this.x, this.y, 
                                        (this.width  > pw) ? this.width  : pw, 
                                        (this.height > ph) ? this.height : ph);
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
         * @param {Integer} [timeout] a timeout. The default value is 50
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
         */
        this.setVisible = function (b){
            if (this.isVisible != b) {
                this.isVisible = b;
                this.invalidate();
                pkg.events.performComp(CL.SHOWN, this, -1,  -1);

                if (this.parent != null) {
                    if (b) this.repaint();
                    else {
                        this.parent.repaint(this.x, this.y, this.width, this.height);
                    }
                }
            }
        };

        /**
         *  Set the UI component enabled state. Using this property 
         *  an UI component can be excluded from getting input events 
         *  @param  {Boolean} b a enabled state
         *  @method setEnabled
         */
        this.setEnabled = function (b){
            if (this.isEnabled != b){
                this.isEnabled = b;
                pkg.events.performComp(CL.ENABLED, this, -1,  -1);
                if (this.kids.length > 0) {
                    for(var i = 0;i < this.kids.length; i++) {
                        this.kids[i].setEnabled(b);
                    }
                }
                this.repaint();
            }
        };

        /**
         * Set UI component top, left, bottom, right paddings. The paddings are 
         * gaps between component border and painted area. 
         * @param  {Integer} top a top padding
         * @param  {Integer} left a left padding
         * @param  {Integer} bottom a bottom padding
         * @param  {Integer} right a right padding
         * @method setPaddings
         */
        this.setPaddings = function (top,left,bottom,right){
            if (this.top != top       || this.left != left  ||
                this.bottom != bottom || this.right != right  )
            {
                this.top = top;
                this.left = left;
                this.bottom = bottom;
                this.right = right;
                this.vrp();
            }
        },

        /**
         * Set the UI component top, right, left, bottom paddings to the same given value
         * @param  {Integer} v the value that will be set as top, right, left, bottom UI 
         * component paddings
         * @method setPadding
         */
        this.setPadding = function(v) {
            this.setPaddings(v,v,v,v);
        };

        /**
         * Set the border view
         * @param  {zebra.ui.View} v a border view
         * @method setBorder
         */
        this.setBorder = function (v){
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


         * @param  {String|zebra.ui.View|Function} v a background 
         * @method setBackground
         */
        this.setBackground = function (v){
            var old = this.bg;
            v = pkg.$view(v);
            if (v != old) {
                this.bg = v;
                this.notifyRender(old, v);
                this.repaint();
            }
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
                    this.add(arguments[i]);
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
                        if (ctr != null) {
                            this.add(L[k], kids[k]);
                        }
                        else {
                            this.add(k, kids[k]);
                        }
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
            if (arguments.length == 0) {
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
                    if (child.isVisible){
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
    },

    function() {
        // !!! dirty trick to call super just to get few milliseconds back 
        //this.$super();
        L.Layoutable.prototype[''].call(this);

        var clazz = this.getClazz();
        while (clazz) {
            if (clazz.properties != null) {
                this.properties(clazz.properties);
                break;
            }
            clazz = clazz.$parent;
        }
    },

    function(l) {
        this.$this();
        if (instanceOf(l, L.Layout)) this.setLayout(l);
        else this.properties(l);
    }
]);

/**
 *  Base layer UI component. Layer is special type of UI 
 *  components that is used to decouple different logical  
 *  UI components types from each other. Zebra Canvas 
 *  consists from number of layers where only one can be 
 *  active at the given point in time. Layers are stretched 
 *  to fill full canvas size. Every time an input event 
 *  happens system detects an active layer by asking all 
 *  layers from top to bottom. First layer that wants to 
 *  catch input gets control. The typical layers examples 
 *  are window layer, popup menus layer and so on.
 *  @param {String} id an unique id to identify the layer
 *  @constructor  
 *  @class zebra.ui.BaseLayer
 *  @extends {zebra.ui.Panel}
 */
pkg.BaseLayer = Class(pkg.Panel, [
    function $prototype() {

        this.layerMousePressed = function(x,y,m){};
        this.layerKeyPressed = function(code,m){};
        this.getFocusRoot = function() { return this; };

        this.activate = function(b){
            var fo = pkg.focusManager.focusOwner;
            if (L.isAncestorOf(this, fo) === false) fo = null;

            if (b) pkg.focusManager.requestFocus(fo != null ? fo : this.pfo);
            else {
                this.pfo = fo;
                pkg.focusManager.requestFocus(null);
            }
        };
    },

    function(id){
        if (id == null) {
            throw new Error("Invalid layer id: " + id);
        }

        this.pfo = null;
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
        this.isLayerActive = function(x,y){
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
        this.paint = function (g){
            if (this.view != null){
                var l = this.getLeft(), t = this.getTop();
                this.view.paint(g, l, t, this.width  - l - this.getRight(),
                                         this.height - t - this.getBottom(), this);
            }
        };

        /**
         * Set the target view to be wrapped with the UI component
         * @param  {zebra.ui.View} v a view 
         * @method setView
         */
        this.setView = function (v){
            var old = this.view;
            v = pkg.$view(v);
            
            if (v != old) {
             
                /**
                 * Reference to a view that the component visualize 
                 * @attribute view
                 * @type {zebra.ui.View}
                 * @default undefined
                 * @readOnly
                 */
                this.view = v;
                this.notifyRender(old, v);
                this.vrp();
            }
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
    function () { this.$this(null); },

    function(img){
        this.setImage(img);
        this.$super();
    },

    /**
     * Set image to be rendered in the UI component
     * @method setImage
     * @param {String|Image} img a path or direct reference to an image. 
     * If the passed parameter is string it considered as path to an image. 
     * In this case the image will be loaded using the passed path
     */
    function setImage(img) {
        if (img && zebra.isString(img)) {
            var $this = this;
            pkg.loadImage(img, function(p, b, i) { if (b) $this.setView(new pkg.Picture(i)); });
            return;
        }
        this.setView(instanceOf(img, pkg.Picture) ? img : new pkg.Picture(img));
    }
]);

/**
 *  UI manager class. The class is widely used as base for building 
 *  various UI managers like paint, focus, event etc. Manager is 
 *  automatically registered as UI events listener for all implement 
 *  by the manager UI event listeners
 *  @class zebra.ui.Manager
 *  @constructor
 */
pkg.Manager = Class([
    function() {
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


                //!!! find buffer
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
                        if (da.width > 0) 
                        {
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
                            $timers[canvas] = setTimeout(function() {
                                $timers[canvas] = null;

                                // prevent double painting, sometimes 
                                // width can be -1 what cause clearRect 
                                // clean incorrectly  
                                if (canvas.$da.width <= 0) {
                                    return ;
                                }

                                var context = canvas.$context;

                                try {
                                    canvas.validate();
                                    context.save();
                                    context.translate(canvas.x, canvas.y);

                                    //!!!! debug
                                    // zebra.print(" ============== DA = " + canvas.$da.y );
                                    // var dg = canvas.canvas.getContext("2d");
                                    // dg.strokeStyle = 'red';
                                    // dg.beginPath();
                                    // dg.rect(da.x, da.y, da.width, da.height);
                                    // dg.stroke();                       

                                    context.clipRect(canvas.$da.x, canvas.$da.y, canvas.$da.width, canvas.$da.height);                                  
                                    if (canvas.bg == null) {
                                        context.clearRect(canvas.$da.x, canvas.$da.y, canvas.$da.width, canvas.$da.height);
                                    }

                                    $this.paint(context, canvas);

                                    context.restore();
                                    canvas.$da.width = -1; //!!!
                                }
                                catch(e) { zebra.print(e); }
                            }, 50);
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
            var dw = c.width, dh = c.height, ts = g.stack[g.counter]; //!!! replace getTopStack() to optimize;
            if (dw !== 0      && 
                dh !== 0      && 
                ts.width > 0  && 
                ts.height > 0 && 
                c.isVisible     )
            {
                c.validate();

                g.save();
                g.translate(c.x, c.y);
                g.clipRect(0, 0, dw, dh);

                ts = g.stack[g.counter]; // replace getTopStack() to optimize;

                var c_w = ts.width, c_h = ts.height;
                if (c_w > 0 && c_h > 0) {
                    
                    this.paintComponent(g, c);
                    
                    var count = c.kids.length, c_x = ts.x, c_y = ts.y;
                    for(var i = 0; i < count; i++) {
                        var kid = c.kids[i];
                        if (kid.isVisible) {
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
 * component shape by defining "ouline(...)"" method  
 * @constructor
 * @class  zebra.ui.PaintManImpl
 * @extends zebra.ui.PaintManager
 */
pkg.PaintManImpl = Class(pkg.PaintManager, [
    function $prototype() {
        this.paintComponent = function(g,c) {

            // if (c.$context != null) {
            //     if (c.$da.width <= 0) {
            //         g.drawImage(0,0,c.canvas);
            //     }
            //     else {
            //         var context = c.$context;

            //         try {
            //             context.save();
            //             context.clipRect(c.$da.x, c.$da.y, c.$da.width, c.$da.height);                                  
            //             if (c.bg == null) {
            //                 context.clearRect(c.$da.x, c.$da.y, c.$da.width, c.$da.height);
            //             }

            //             this.paint(context, c);

            //             context.restore();
            //             c.$da.width = -1; //!!!
            //         }
            //         catch(e) { zebra.print(e); }
            //     }
            // }

            var b = c.bg != null && (c.parent == null || c.bg != c.parent.bg);

            // if component defines shape and has update, [paint?] or background that 
            // differs from parent background try to apply the shape and than build
            // clip from the applied shape
            if ( (c.border != null && c.border.outline != null) && 
                 (b || c.update != null       )                 && 
                 c.border.outline(g, 0, 0, c.width, c.height, c)  ) 
            {
                g.save();
                g.clip();

                if (b) c.bg.paint(g, 0, 0, c.width, c.height, c);
                if (c.update != null) c.update(g);

                g.restore();
            }
            else {
                if (b) c.bg.paint(g, 0, 0, c.width, c.height, c);
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
                    var ts = g.stack[g.counter]; // replace g.getTopStack() to optimize
                   
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
pkg.FocusManager = Class(pkg.Manager, MouseListener, CL, KeyListener, [
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

        this.compEnabled = function(c)   { 
            if (c.isEnabled === false) freeFocus(this, c); 
        };
        
        this.compShown   = function(c)   { 
            if (c.isVisible === false) freeFocus(this, c); 
        };
        
        this.compRemoved = function(p,c) { 
            freeFocus(this, c); 
        };

        this.canvasFocusLost = function(canvas) {
            if (this.focusOwner != null && 
                this.focusOwner.getCanvas() == canvas) 
            {
                this.requestFocus(null);
            }
        };

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

        this.keyPressed = function(e){
            if (KE.TAB == e.code){
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
            // also we should checks whether parents isFocusable !!!
            return d && c.isEnabled && c.isVisible && c.canHaveFocus && c.canHaveFocus();
        };

        this.fd = function(t,index,d){
            if(t.kids.length > 0){
                var isNComposite = (instanceOf(t, Composite) === false);
                for(var i = index; i >= 0 && i < t.kids.length; i += d) {
                    var cc = t.kids[i];
                    if (cc.isEnabled && cc.isVisible && cc.width > 0 && cc.height > 0   && 
                        (isNComposite || (t.catchInput && t.catchInput(cc) === false))  &&
                        ( (cc.canHaveFocus && cc.canHaveFocus()) || 
                          (cc = this.fd(cc, d > 0 ? 0 : cc.kids.length - 1, d)) != null)  )
                    {
                        return cc;
                    }
                }
            }
            return null;
        };

        this.ff = function(c,d){
            var top = c;
            while (top && top.getFocusRoot == null) {
                top = top.parent;
            }
            top = top.getFocusRoot();
            for(var index = (d > 0) ? 0 : c.kids.length - 1;c != top.parent; ){
                var cc = this.fd(c, index, d);
                if(cc != null) return cc;
                cc = c;
                c = c.parent;
                if(c != null) index = d + c.indexOf(cc);
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
                    pkg.events.performInput(new IE(oldFocusOwner, IE.FOCUS_LOST, IE.FOCUS_UID));
                }

                if (this.focusOwner != null) {
                    pkg.events.performInput(new IE(this.focusOwner, IE.FOCUS_GAINED, IE.FOCUS_UID)); 
                }

                return this.focusOwner;
            }
            return null;
        };

        this.mousePressed = function(e){
            if (e.isActionMask()) {
                this.requestFocus(e.source);
            }
        };
    }
]);

/**
 *  Command manager supports short cut keys definition and listening. The shortcuts have to be defined in 
 *  json configuration files:
 
    - **commands.osx.json** for Mac OS X platform
    - **commands.json** for all other platforms 

 *  The JSON configuration has simple structure:
 
      [
         {
            "command"   : "undo_command",
            "args"      : [ true, "test"]
            "key"       : "Ctrl+z"
         },
         {
            "command" : "redo_command",
            "key"     : "Ctrl+Shift+z"
         },
         ...
      ]

 *  The configuration contains list of shortcuts. Every shortcut is bound to a key combination it is triggered. 
 *  Every shortcut has a name and an optional list of arguments that have to passed to a shortcut listener method.
 *  The optional arguments can be used to differentiate two shortcuts that are bound to the same command.
 *  @constructor
 *  @class zebra.ui.CommandManager
 *  @extends {zebra.ui.Manager}
 */

/**
 * Shortcut event is handled by registering a method handler with shortcut manager. The manager is accessed as 
 * "zebra.ui.commandManager" static variable:

        zebra.ui.commandManager._.add(function (e) {
            ...
        });

 * @event shortcut
 * @param {Object} e shortcut event
 *         @param {Array} e.args shortcut arguments list
 *         @param {String} e.command shortcut name
 */
pkg.CommandManager = Class(pkg.Manager, KeyListener, [
    function $prototype() {
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
    },

    function(){
        this.$super();

        this.keyCommands = {}; 
        this._ = new zebra.util.Listeners("commandFired");

        var commands = null;
        if (zebra.isMacOS) { 
            try { commands = zebra.io.GET(pkg.$url + "commands.osx.json"); }
            catch(e) {}
            if (commands != null) commands = JSON.parse(commands); 
        }

        if (commands == null) { 
            commands = JSON.parse(zebra.io.GET(pkg.$url +  "commands.json"));
        }

        for(var i=0; i < commands.length; i++) {
            var c = commands[i], p = this.parseKey(c.key), v = this.keyCommands[p[1]];            

            if (v && v[p[0]]) {
                throw Error("Duplicated command: '" + c + "'");
            }

            if (v == null) v = [];
            v[p[0]] = c;
            this.keyCommands[p[1]] = v;
        }   
    }
]);

/**
 * Cursor manager class. Allows developers to control mouse cursor type by implementing an own 
 * getCursorType method or by specifying a cursor by cursorType field. Imagine an UI component 
 * needs to change cursor type. It 
 *  can be done by one of the following way:
        
    - **Implement getCursorType method by the component itself** 

          var p = new zebra.ui.Panel([
               // implement getCursorType method to set required 
               // mouse cursor type 
               function getCursorType(target, x, y) {
                   return zebra.ui.Cursor.WAIT;
               }
          ]);

    - **Simply set cursorType property of a component** 

          var myPanel = new zebra.ui.Panel();
          ...
          myPanel.cursorType = zebra.ui.Cursor.WAIT;

 *  @class zebra.ui.CursorManager
 *  @constructor
 *  @extends {zebra.ui.Manager}
 */
pkg.CursorManager = Class(pkg.Manager, MouseListener, [
    function $prototype() {

        this.mouseMoved = function(e){
            if (this.isFunc) {
                this.cursorType = this.target.getCursorType(this.target, e.x, e.y);
                this.target.getCanvas().canvas.style.cursor = (this.cursorType == null) ? "default"
                                                                                        : this.cursorType;
            }
        };
        
        this.mouseEntered = function(e){
            if (e.source.cursorType != null) {
                this.target = e.source;
                this.cursorType = this.target.cursorType;
                this.target.getCanvas().canvas.style.cursor = (this.cursorType == null) ? "default"
                                                                                        : this.cursorType;
            }
            else {
                if (e.source.getCursorType != null) {
                    this.isFunc = true; 
                    this.target = e.source;
                    this.cursorType = this.target.getCursorType(this.target, e.x, e.y);
                    this.target.getCanvas().canvas.style.cursor = (this.cursorType == null) ? "default"
                                                                                            : this.cursorType;
                }
            }
        };
        
        this.mouseExited  = function(e){
            if (this.target != null) {
                this.cursorType = "default";
                this.target.getCanvas().canvas.style.cursor = this.cursorType;
                this.target = null;
                this.isFunc = false;
            }
        };
        
        this.mouseDragged = function(e) {
            if (this.isFunc) {
                this.cursorType = this.target.getCursorType(this.target, e.x, e.y);
                this.target.getCanvas().canvas.style.cursor = (this.cursorType == null) ? "default"
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

        this.target = null;
        this.isFunc = false;
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

        this.performComp = function(id, src, p1, p2){
            var n = IEHM[id];

            if (src[n] != null && instanceOf(src, CL)) {
                src[n].call(src, src, p1, p2);            
            }

            for(var i = 0;i < this.c_l.length; i++) {
                var t = this.c_l[i];
                if (t[n] != null) t[n].call(t, src, p1, p2);            
            } 
            
            for(var t = src.parent;t != null; t = t.parent){
                if (t.childCompEvent != null && instanceOf(t, ChildrenListener)) t.childCompEvent(id, src, p1, p2);
            }
        };

        // destination is component itself or one of his composite parent.
        // composite component is a component that grab control from his 
        // children component. to make a component composite
        // it has to implement Composite interface. If composite component 
        // has catchInput method it will be called
        // to clarify if the composite component takes control for the given kid.
        // composite components can be embedded (parent composite can take 
        // control on its child composite component) 
        this.getEventDestination = function(c) {
            if (c == null) return null;
            var cp = c, p = c;
            while((p = p.parent) != null) {
                if (instanceOf(p, Composite) && (p.catchInput == null || p.catchInput(cp))) {
                    cp = p;
                }
            }
            return cp;
        }

        this.performInput = function(e){
            var t = e.source, id = e.ID, it = null, k = IEHM[id], b = false;
            switch(e.UID)
            {
                case MUID:
                    if (t[k] != null && instanceOf(t, MouseListener)) {
                        t[k].call(t, e);
                    }

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
                    if (t[k] != null && instanceOf(t, KeyListener)) {
                        b = t[k].call(t, e);
                    }
                    it = this.k_l;
                    break;
                case IE.FOCUS_UID:
                    if (t[k] != null && instanceOf(t, FocusListener)) {
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
                if (t.childInputEvent != null && instanceOf(t, ChildrenListener)) {
                    t.childInputEvent(e);
                }
            }
            return b;
        };

        /**
         * Register global event listener. The listener will 
         * get events according to event listeners interfaces 
         * it implements. For instance to listen key and 
         * mouse events the passed listener has to be an 
         * instance of "zebra.ui.KeyListener" and 
         * "zebra.ui.MouseListener" interfaces:
                

        // implement and register global key and mouse listener
        zebra.ui.events.addListener(new zebra.Dummy(zebra.ui.MouseListener, 
                                                    zebra.ui.KeyListener, [

            // implement necessary events handlers methods
            function keyPressed(e) {
                ...
            }
            ...
        ])); 

         * @param  {Object} l 
         * @method  addListener
         */
        this.addListener = function (l){
            if (instanceOf(l,CL))             this.addComponentListener(l);
            if (instanceOf(l,MouseListener))  this.addMouseListener(l);
            if (instanceOf(l,KeyListener))    this.addKeyListener(l);
            if (instanceOf(l,FocusListener))  this.addFocusListener(l);
        };

        /**
         * Un-register the global listener. The method detects which listener interfaces 
         * the passed listener implements and un-registers its.
         * @param  {Object} l a listener
         * @method removeListener
         */
        this.removeListener = function (l) {
            if (instanceOf(l, CL))             this.removeComponentListener(l);
            if (instanceOf(l, MouseListener))  this.removeMouseListener(l);
            if (instanceOf(l, KeyListener))    this.removeKeyListener(l);
            if (instanceOf(l, FocusListener))  this.removeFocusListener(l);
        };

        /**
         * Register global component listener
         * @param  {zebra.ui.ComponentListener} l a component listener
         * @method addComponentListener
         */
        this.addComponentListener = function (l) {
            this.a_(this.c_l, l);
        };
  
        /**
         * Un-register global component listener
         * @param  {zebra.ui.ComponentListener} l a component listener
         * @method removeFocusListener
         */
        this.removeComponentListener = function(l){
            this.r_(this.c_l, l);
        };

        /**
         * Register global mouse listener
         * @param  {zebra.ui.MouseListener} l a mouse listener
         * @method addMouseListener
         */
        this.addMouseListener = function(l){
            this.a_(this.m_l, l);
        };

        /**
         * Un-register global mouse listener
         * @param  {zebra.ui.MouseListener} l a mouse listener
         * @method removeMouseListener
         */
        this.removeMouseListener = function(l){
            this.r_(this.m_l, l);
        };

        /**
         * Register global focus listener
         * @param  {zebra.ui.FocusListener} l a focus listener
         * @method addFocusListener
         */
        this.addFocusListener = function (l){
            this.a_(this.f_l, l);
        };
       
       /**
        * Un-register global focus listener
        * @param  {zebra.ui.FocusListener} l a focus listener
        * @method removeFocusListener
        */
        this.removeFocusListener = function (l){ this.r_(this.f_l, l); };

        /**
         * Register global key listener
         * @param  {zebra.ui.KeyListener} l a key listener
         * @method addKeyListener
         */
        this.addKeyListener = function(l){
            this.a_(this.k_l, l);
        };
       
        /**
         * Un-register global key listener
         * @param  {zebra.ui.KeyListener} l a key listener
         * @method removeKeyListener
         */
        this.removeKeyListener  = function (l){
            this.r_(this.k_l, l);
        };

        this.a_ = function(c, l) {
            (c.indexOf(l) >= 0) || c.push(l); };
        
        this.r_ = function(c, l) {
            (c.indexOf(l) < 0) || c.splice(i, 1);
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

pkg.$createContext = function(canvas, w, h) {
    var ctx = canvas.getContext("2d");

    var $save = ctx.save, $restore = ctx.restore, $rotate = ctx.rotate, 
        $scale = ctx.$scale = ctx.scale, $translate = ctx.translate,
        $getImageData = ctx.getImageData;

    // backstage buffer can have different size with a real size
    // what causes the final picture can be zoomed in/out
    // we need to calculate it to make canvas more crisp
    // for HDPI screens
    ctx.$ratio =  $ratio / (ctx.webkitBackingStorePixelRatio ||
                            ctx.mozBackingStorePixelRatio    ||
                            ctx.msBackingStorePixelRatio     ||
                            ctx.backingStorePixelRatio       || 1);

    ctx.counter = 0;
    ctx.stack = Array(50);
    for(var i=0; i < ctx.stack.length; i++) {
        var s = {};
        s.srot = s.rotateVal = s.x = s.y = s.width = s.height = s.dx = s.dy = 0;
        s.crot = s.sx = s.sy = 1;
        ctx.stack[i] = s;
    }
    ctx.stack[0].width  = w;
    ctx.stack[0].height = h;
    ctx.setFont(pkg.font);
    ctx.setColor("white");

    ctx.getTopStack = function() { 
        return this.stack[this.counter]; 
    };

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
            c.x -= dx;
            c.y -= dy;
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

    ctx.getImageData= function(x, y, w, h) {
        return $getImageData.call(this, x * this.$ratio, 
                                        y * this.$ratio, 
                                        w, h);
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
                //!!! begin path is very important to have proper clip area
                this.beginPath();
                this.rect(x, y, w, h);
                this.clip();
            }
        }
    };

    ctx.reset = function(w, h) {
        //!!!!!!!!!!!!
        // while(this.counter > 0) {
        //     this.restore();
        // }
        this.counter = 0;
        this.stack[0].width = w;
        this.stack[0].height = h;
    };

    return ctx;
};

/**
 *  Canvas zebra UI component class. This is one of the key 
 *  class everybody has to use to build an UI. The class is a wrapper  
 *  for HTML Canvas element. Internally it catches all native HTML Canvas 
 *  events and translates its into Zebra UI events. 
 *
 *  zCanvas instantiation triggers a new HTML Canvas will be created 
 *  and added to HTML DOM tree.  It happens if developer doesn't pass
 *  a Canvas element id or pass an id that doesn't reference to an 
 *  existent HTML canvas element. If developers need to re-use an 
 *  existent in DOM tree canvas element they have to pass id of 
 *  the canvas that has to be used as basis for zebra UI creation.
 
        // a new HTML canvas element is created into HTML DOM tree
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
 *  @param {String} [canvasID] an ID of a HTML canvas element. If 
 *  HTML DOM tree already has a HTML Canvas element with the given id
 *  the existent element will be used. Otherwise a new HTML canvas
 *  element will be inserted into HTML DOM tree.
 *  @param {Integer} [width] a width of an HTML canvas element
 *  @param {Integer} [height] a height of an HTML canvas element
 */
pkg.zCanvas = Class(pkg.Panel, [
    function $clazz() {
        this.Layout = Class(L.Layout, [
            function $prototype() {
                this.calcPreferredSize = function(c) {
                    return { width :parseInt(c.canvas.width, 10), 
                             height:parseInt(c.canvas.height, 10) };
                };

                this.doLayout = function(c){
                    var x = c.getLeft(), y = c.getTop(), 
                        w = c.width - c.getRight() - x, 
                        h = c.height - c.getBottom() - y;
                   
                    for(var i = 0;i < c.kids.length; i++){
                        var l = c.kids[i];
                        if (l.isVisible){
                            l.setLocation(x, y);
                            l.setSize(w, h);
                        }
                    }
                };
            }
        ]);
    },

    function $prototype() {
        this.$isMasterCanvas = true;
        this.$prevFocusOwner = null;

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

        this.keyTyped = function(e){
            if (e.charCode == 0) {
                if ($keyPressedCode != e.keyCode) this.keyPressed(e);
                $keyPressedCode = -1;
                return;
            }

            if (e.charCode > 0) {
                var fo = pkg.focusManager.focusOwner;
                if (fo != null) {
                    //debug("keyTyped: " + e.keyCode + "," + e.charCode + " " + (e.charCode == 0));
                    KE_STUB.reset(fo, KE.TYPED, e.keyCode, String.fromCharCode(e.charCode), km(e));
                    if (EM.performInput(KE_STUB)) e.preventDefault();
                }
            }

            if (e.keyCode < 47) e.preventDefault();
        };

        this.keyPressed = function(e){
            $keyPressedCode  = e.keyCode;
            var code = e.keyCode, m = km(e), b = false;
            for(var i = this.kids.length - 1;i >= 0; i--){
                var l = this.kids[i];
                l.layerKeyPressed(code, m);
                if (l.isLayerActive && l.isLayerActive()) break;
            }

            var focusOwner = pkg.focusManager.focusOwner;
            if (pkg.clipboardTriggerKey > 0 && 
                e.keyCode == pkg.clipboardTriggerKey && 
                focusOwner != null && 
                instanceOf(focusOwner, CopyCutPaste)) 
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
                //debug("keyPressed : " + e.keyCode, 1);
                KE_STUB.reset(focusOwner, KPRESSED, code, code < 47 ? KE.CHAR_UNDEFINED : '?', m);
                b = EM.performInput(KE_STUB);

                if (code == KE.ENTER) {
                    //debug("keyTyped keyCode = " + code);
                    KE_STUB.reset(focusOwner, KE.TYPED, code, "\n", m);
                    b = EM.performInput(KE_STUB) || b;
                }
            }

            //!!!! 
            if ((code < 47 && code != 32) || b) { 
                e.preventDefault();
            }
        };

        this.keyReleased = function(e){
            $keyPressedCode = -1;

            var fo = pkg.focusManager.focusOwner;
            if(fo != null) {
                //debug("keyReleased : " + e.keyCode, -1);
                KE_STUB.reset(fo, KE.RELEASED, e.keyCode, KE.CHAR_UNDEFINED, km(e));
                if (EM.performInput(KE_STUB)) e.preventDefault();
            }
        };

        this.mouseEntered = function(id, e) {
            var mp = $mousePressedEvents[id];

            // !!!
            // quick and dirty fix
            // try to track a situation when the canvas has been moved 
            this.recalcOffset();

            // if a button has not been pressed handle mouse entered to detect
            // zebra component the mouse pointer entered and send appropriate
            // mouse entered event to it
            if (mp == null || mp.canvas == null) {
                var x = $meX(e, this), y = $meY(e, this), d = this.getComponentAt(x, y);

                // also correct current component on that mouse pointer is located
                if (pkg.$mouseMoveOwner != null && d != pkg.$mouseMoveOwner) {
                    var prev = pkg.$mouseMoveOwner;
                    pkg.$mouseMoveOwner = null;

                    //debug("mouseExited << ", -1);
                    ME_STUB.reset(prev, MEXITED, x, y, -1, 0);
                    EM.performInput(ME_STUB);
                }

                if (d != null && d.isEnabled){
                    //debug("mouseEntered >> ", 1);
                    pkg.$mouseMoveOwner = d;
                    ME_STUB.reset(d, MENTERED, x, y, -1, 0);
                    EM.performInput(ME_STUB);
                }
            }
        };

        this.mouseExited = function (id, e) {
            var mp = $mousePressedEvents[id];

            // if a mouse button has not been pressed and current mouse owner 
            // component is not null, flush current mouse owner and send 
            // mouse exited event to him 
            if ((mp == null || mp.canvas == null) && pkg.$mouseMoveOwner != null){
                var p = pkg.$mouseMoveOwner;
                pkg.$mouseMoveOwner = null;

                ME_STUB.reset(p, MEXITED, $meX(e, this), $meY(e, this), -1, 0);
                EM.performInput(ME_STUB);
            }
        };

        this.mouseMoved = function(id, e){
            // get appropriate mousePressed event by event id
            var mp = $mousePressedEvents[id];
        
            // mouse button has been pressed and pressed target zebra component exists  
            // emulate mouse dragging events if we mouse moved on the canvas where mouse 
            // pressed event occurred
            if (mp != null && mp.canvas != null) {
                // target component exits and mouse cursor moved on the same canvas where mouse pressed occurred
                if (mp.component != null && mp.canvas.canvas == e.target) {

                    // !!!!
                    // for the sake of performance $meX(e, this) and $meY(e, this)
                    // methods calls are replaced with direct code
                    var x = this.$context.tX(e.pageX - this.offx, e.pageY - this.offy),
                        y = this.$context.tY(e.pageX - this.offx, e.pageY - this.offy),
                        m = mp.button;

                    // if dragg events has not been initiated yet generate mouse 
                    // start dragging event
                    if (mp.draggedComponent == null) {

                        // check if zebra mouse moved event has already occurred 
                        // if it is true set mouse dragged target component to the mouse moved target component
                        // otherwise compute the target component basing on mouse moved event location  

                        // !!!!
                        // for the sake of performance $meX(e, this) and $meY(e, this)
                        // methods calls are replaced with direct code

                        var xx = this.$context.tX(mp.pageX - this.offx, mp.pageY - this.offy), 
                            yy = this.$context.tY(mp.pageX - this.offx, mp.pageY - this.offy),
                            d  = (pkg.$mouseMoveOwner == null) ? this.getComponentAt(xx, yy)
                                                               : pkg.$mouseMoveOwner;
                       
                        // if target component can be detected fire mouse start sragging and 
                        // mouse dragged events to the component  
                        if (d != null && d.isEnabled === true) {
                            mp.draggedComponent = d;

                            ME_STUB.reset(d, ME.DRAGSTARTED, xx, yy, m, 0);
                            EM.performInput(ME_STUB);

                            // if mouse cursor has been moved mouse dragged event has to be generated
                            if (xx != x || yy != y) {
                                ME_STUB.reset(d, MDRAGGED, x, y, m, 0);
                                EM.performInput(ME_STUB);
                            }
                        }
                    }
                    else {
                        // the drag event has already occurred before, just send 
                        // next dragged event to target zebra component 
                        ME_STUB.reset(mp.draggedComponent, MDRAGGED, x, y, m, 0);
                        EM.performInput(ME_STUB);
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

                if (pkg.$mouseMoveOwner != null) {
                    if (d != pkg.$mouseMoveOwner) {
                        var old = pkg.$mouseMoveOwner;

                        //debug("mouseExited << ", -1);
                        pkg.$mouseMoveOwner = null;
                        ME_STUB.reset(old, MEXITED, x, y, -1, 0);
                        EM.performInput(ME_STUB);

                        if (d != null && d.isEnabled === true) {
                            //debug("mouseEntered >> " , 1);
                            pkg.$mouseMoveOwner = d;
                            ME_STUB.reset(pkg.$mouseMoveOwner, MENTERED, x, y, -1, 0);
                            EM.performInput(ME_STUB);
                        }
                    }
                    else {
                        if (d != null && d.isEnabled) {
                            ME_STUB.reset(d, MMOVED, x, y, -1, 0);
                            EM.performInput(ME_STUB);
                        }
                    }
                }
                else {
                    if (d != null && d.isEnabled === true) {
                        //debug("mouseEntered >> ", 1);
                        pkg.$mouseMoveOwner = d;
                        ME_STUB.reset(d, MENTERED, x, y, -1, 0);
                        EM.performInput(ME_STUB);
                    }
                }
            }
        };

        this.mouseReleased = function(id, e){
            var mp = $mousePressedEvents[id];

            // handle it only if appropriate mouse pressed has occurred 
            if (mp != null && mp.canvas != null) {   
                var x = $meX(e, this), y = $meY(e, this), po = mp.component;
               
                // if a component has been dragged send end dragged event to him to 
                // complete dragging
                if (mp.draggedComponent != null){
                    ME_STUB.reset(mp.draggedComponent, ME.DRAGENDED, x, y, mp.button, 0);
                    EM.performInput(ME_STUB);
                }

                // mouse pressed has not null target zebra component 
                // send mouse released and mouse clicked (if necessary)
                // to him
                if (po != null) {
                    //debug("mouseReleased ", -1);

                  
                    // generate mouse click if no mouse drag event has been generated
                    if (mp.draggedComponent == null && (e.touch == null || e.touch.group == null)) {
                        ME_STUB.reset(po, ME.CLICKED, x, y, mp.button, mp.clicks);
                        EM.performInput(ME_STUB);
                    }
                    
                    // send mouse released to zebra target component
                    ME_STUB.reset(po, ME.RELEASED, x, y, mp.button, mp.clicks);
                    EM.performInput(ME_STUB);
                }

                // mouse released can happen at new location, so move owner has to be corrected
                // and mouse exited entered event has to be generated. 
                // the correction takes effect if we have just completed dragging or mouse pressed
                // event target doesn't match pkg.$mouseMoveOwner   
                if (zebra.isTouchable === false) {    //!!! mouse entered / exited event cannot be generated for touch screens 
                    var mo = pkg.$mouseMoveOwner;
                    if (mp.draggedComponent != null || (po != null && po != mo)) {
                        var nd = this.getComponentAt(x, y);
                        if (nd != mo) {
                            if (mo != null) {
                                //debug("mouseExited << ", -1);
                                ME_STUB.reset(mo, MEXITED, x, y, -1, 0);
                                EM.performInput(ME_STUB);
                            }

                            if (nd != null && nd.isEnabled === true){
                                pkg.$mouseMoveOwner = nd;

                                //debug("mouseEntered >> ", 1);

                                ME_STUB.reset(nd, MENTERED, x, y, -1, 0);
                                EM.performInput(ME_STUB);
                            }
                        }
                    }
                }

                // release mouse pressed event without removal the event from object
                // keeping event in object is used to handle double click
                $mousePressedEvents[id].canvas = null;
            }
        };

        this.mousePressed = function(id, e, button) {
            // release mouse pressed if it has not happened before but was not released
            var mp = $mousePressedEvents[id];
            if (mp != null && mp.canvas != null) {
                this.mouseReleased(id, mp);
            }

            //debug("mousePressed ", 0);

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
                clicks      : clicks
            };

            var x = $meX(e, this), y = $meY(e, this);
            mp.x = x;
            mp.y = y;

            // send mouse event to a layer and test if it has been activated
            for(var i = this.kids.length - 1; i >= 0; i--){
                var l = this.kids[i];
                l.layerMousePressed(x, y,button);
                if (l.isLayerActive && l.isLayerActive(x, y)) break;
            }

            var d = this.getComponentAt(x, y);
            if (d != null && d.isEnabled === true){
                mp.component = d;
                ME_STUB.reset(d, ME.PRESSED, x, y, button, clicks);
                EM.performInput(ME_STUB);
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
                if (tl.isLayerActive && tl.isLayerActive(x, y)) {
                    return EM.getEventDestination(tl.getComponentAt(x, y));
                }
            }
            return null;
        };

        this.recalcOffset = function() {
            // calculate offset
            var poffx = this.offx,
                poffy = this.offy,
                ba    = this.canvas.getBoundingClientRect();

            this.offx = ((ba.left + 0.5) | 0) + measure(this.canvas, "padding-left") + window.pageXOffset;
            this.offy = ((ba.top  + 0.5) | 0) + measure(this.canvas, "padding-top" ) + window.pageYOffset;

            if (this.offx != poffx || this.offy != poffy) {
                this.relocated(this, poffx, poffy);
            }
        };

        this.getLayer = function(id) { 
            return this[id]; 
        };

        this.setStyles = function(styles) {
            for(var k in styles) {
                this.canvas.style[k] = styles[k];
            }
        };

        this.setAttribute = function(name, value) {
            this.canvas.setAttribute(name, value);
        };

        // override relocated and resized
        // to prevent unnecessary repainting 
        this.relocated = function(px,py) { 
            pkg.events.performComp(CL.MOVED, this, px, py); 
        };

        this.resized = function(pw,ph) { 
            pkg.events.performComp(CL.SIZED, this, pw, ph); 
        }    
    },

    function()       { this.$this(400, 400); },
    function(w, h)   { this.$this(this.toString(), w, h); },
    function(canvas) { this.$this(canvas, -1, -1); },

    function(canvas, w, h) {
        //!!! flag to block wrongly coming double onfocus
        //!!! events 
        this.$focusGainedCounter = 0;

        var pc = canvas, $this = this;

        //  todo ...
        //!!! touch event listeners have to be taking also 
        //    in account
        this.nativeListeners = {
            "onmousemove": null,
            "onmousedown": null,
            "onmouseup": null,
            "onmouseover": null,
            "onmouseout": null,
            "onkeydown": null,
            "onkeyup": null,
            "onkeypress": null
        };

        var addToBody = true;
        if (zebra.isBoolean(canvas)) {
            addToBody = canvas;
            canvas = null;
        }
        else {
            if (zebra.isString(canvas)) { 
                canvas = document.getElementById(canvas);
                if (canvas != null && pkg.$detectZCanvas(canvas)) {
                    throw new Error("Canvas id='" + pc + "'' is already in use");
                }
            }
        }
        
        if (canvas == null) {
            canvas = document.createElement("canvas");
            canvas.setAttribute("class", "zebcanvas");
            canvas.setAttribute("width",  w <= 0 ? "400" : "" + w);
            canvas.setAttribute("height", h <= 0 ? "400" : "" + h);
            canvas.setAttribute("id", pc);
            if (addToBody) document.body.appendChild(canvas);
        }

        //!!! Pay attention IE9 handles padding incorrectly 
        //!!! the padding has to be set to 0px by appropriate 
        //!!! style sheet getPropertySetter
        if (canvas.getAttribute("tabindex") === null) {
            canvas.setAttribute("tabindex", "1");
        }

        /**
         * Keeps rectangular "dirty" area of the canvas component
         * @private
         * @attribute $da
         * @type {Object} 
                { x:Integer, y:Integer, width:Integer, height:Integer }
         */
        this.$da = { x:0, y:0, width:-1, height:0 };

        /**
         * Reference to HTML Canvas element  where the zebra canvas UI 
         * components are hosted 
         * @protected
         * @readOnly
         * @attribute canvas
         * @type {Canvas}
         */
        this.canvas = canvas; //!!! canvas field  has to be set before super 

        // specify canvas specific layout that stretches all kids to fill the whole canvas area
        this.$super(new pkg.zCanvas.Layout());
    
        for(var i=0; i < pkg.layers.length; i++) {
            var l = pkg.layers[i];
            this.add(l.$new ? l.$new() : l);
        }
    
        if (zebra.isTouchable) {
            new pkg.TouchHandler(canvas, [
                function $prototype() {
                    this.started = function(e) {
                        ME_STUB.touch          = e;
                        ME_STUB.touches        = this.touches;
                        ME_STUB.touchCounter   = this.touchCounter;
                        $this.mousePressed(e.identifier, e, 
                                           this.touchCounter == 1 ? ME.LEFT_BUTTON 
                                                                  : (e.group && e.group.size == 2 && e.group.index == 1 ? ME.RIGHT_BUTTON : 0)); 
                    };

                    this.ended = function(e) {
                        ME_STUB.touch          = e;
                        ME_STUB.touches        = this.touches;
                        ME_STUB.touchCounter   = this.touchCounter; 
                        $this.mouseReleased(e.identifier, e); 
                    };

                    this.moved = function(e) {
                        ME_STUB.touch          = e;
                        ME_STUB.touches        = this.touches;
                        ME_STUB.touchCounter   = this.touchCounter;
                        $this.mouseMoved(e.identifier, e);  
                    };                    
                }
            ]);  
        }
        else {
            this.canvas.onmousemove = function(e) { 
                $this.mouseMoved(1, e);   
                e.stopPropagation();
            };
            
            this.canvas.onmousedown = function(e) { 
                $this.mousePressed(1, e, e.button === 0 ? ME.LEFT_BUTTON
                                                        : (e.button == 2 ? ME.RIGHT_BUTTON : 0)); 
                e.stopPropagation();
            };
            
            this.canvas.onmouseup = function(e) { 
                $this.mouseReleased(1, e);
                e.stopPropagation();
            };

            this.canvas.onmouseover = function(e) { 
                $this.mouseEntered(1, e); 
                e.stopPropagation();
            };
            
            this.canvas.onmouseout = function(e) { 
                $this.mouseExited(1, e);  
                e.stopPropagation();
            };
            
            this.canvas.oncontextmenu = function(e) {
                e.preventDefault();
            };

            this.canvas.onkeydown = function(e) {
                $this.keyPressed(e);
                e.stopPropagation();
            };

            this.canvas.onkeyup = function(e) {
                $this.keyReleased(e); 
                e.stopPropagation();
            };
            
            this.canvas.onkeypress = function(e) {
                $this.keyTyped(e);
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

                if (pkg.focusManager.canvasFocusLost) {
                    pkg.focusManager.canvasFocusLost($this);
                }
            }
        };


        var addons = pkg.zCanvas.addons;
        if (addons) {
            for (var i=0; i<addons.length; i++) {
                (new (Class.forName(addons[i]))()).setup(this);
            }
        }
              
        // !!!
        // save canvas in list of created Zebra canvas
        // do it before setSize
        $canvases.push(this);

        this.setSize(parseInt(this.canvas.width, 10), 
                     parseInt(this.canvas.height, 10));

        if (this.loadAfterCreated) {
            this.loadAfterCreated();
        }
    },

    function setLocation(x, y) {
        this.canvas.style.top  = y + "px";
        this.canvas.style.left = x + "px";
        this.canvas.style.position = "fixed";  
        this.recalcOffset();
    },

    function setSize(w, h) {
        if (this.width != w || h != this.height) {
            var pw = this.width, ph = this.height;

            this.canvas.style.width  = "" + w  + "px";
            this.canvas.style.height = "" + h + "px";
  
            if (this.$context) {
                this.$context.reset(w, h);
            }
            else { 
                this.$context = pkg.$createContext(this.canvas, w, h);
            }

            // take in account that canvas can be visualized on 
            // Retina screen where the size of canvas (backstage)
            // can be less than it is real screen size. Let's 
            // make it match each other
            this.canvas.width  = w * this.$context.$ratio;
            this.canvas.height = h * this.$context.$ratio;

            // again something for Retina screen
            if (this.$context.$ratio != 1) {
                // call original method
                this.$context.$scale(this.$context.$ratio, 
                                  this.$context.$ratio);
            }

            this.width = w;
            this.height = h;

            if (zebra.isTouchable) {
                // the strange fix for Android native browser
                // that can render text blurry before you click
                // it happens because the browser auto-fit option 
                var $this = this;
                setTimeout(function() {
                    $this.invalidate();
                    $this.validate();
                    $this.repaint();
                }, 200);  
            }
            else {
                this.invalidate();
                this.validate();      
                this.repaint();
            }

            if (w != pw || h != ph) {
                this.resized(pw, ph);
            }

            // let know to other zebra canvases that 
            // the size of an element on the page has 
            // been updated and they have to correct 
            // its anchor. 
            elBoundsUpdated();

            // sometimes changing size can bring to changing canvas location 
            // it is required to recalculate offsets
//            this.recalcOffset(); 
        }
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
        this.setSize(window.innerWidth, window.innerHeight);
    },

    function setEnabled(b) {
        if (this.isEnabled != b) {

            // !!!
            // Since disabled state for Canvas element doesn't work
            // we have to emulate it via canvas listeners removal 
            // 
            for(var k in this.nativeListeners ) {
                if (b) {
                    this.canvas[k] = this.nativeListeners[k];  
                    this.nativeListeners[k] = null;
                }
                else {
                    this.nativeListeners[k] = this.canvas[k];  
                    this.canvas[k] = null;            
                }
            }

            // have to be decided if super has to be called
            //this.$super(b);
        
            this.isEnabled = b;
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
        this.canvas.focus();
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
            e.setAttribute("style", "visibility:hidden;line-height: 0; height:1px; vertical-align: baseline;");
            e.innerHTML = "<span id='zebra.fm.text'  style='display:inline;vertical-align:baseline;'>&nbsp;</span>" +
                          "<img  id='zebra.fm.image' style='width:1px;height:1px;display:inline;vertical-align:baseline;' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII%3D' width='1' height='1'/>";
            document.body.appendChild(e);
        }
        $fmText  = document.getElementById("zebra.fm.text");
        $fmImage = document.getElementById("zebra.fm.image");

        // the next function passed to ready will be blocked
        // till the picture completely loaded
        $fmImage.onload = function() {
           zebra.ready();    
        };
    },

    function() {
        try {
            zebra.busy();
            pkg.$configuration = new pkg.Bag(pkg);

            var p = zebra()['canvas.json'];
            pkg.$configuration.loadByUrl(p ? p 
                                           : pkg.$url.join("canvas.json"), false);

            while($configurators.length > 0) $configurators.shift()(pkg.$configuration);
            pkg.$configuration.end();

            // store ref to event manager 
            EM = pkg.events;

            if (pkg.clipboardTriggerKey > 0) {
                // create hidden text area to support clipboard
                $clipboard = document.createElement("textarea");
                $clipboard.setAttribute("style", "display:none; position: absolute; left: -99em; top:-99em;");

                $clipboard.onkeydown = function(ee) {
                    $clipboardCanvas.keyPressed(ee);
                    $clipboard.value="1";
                    $clipboard.select();
                }
                
                $clipboard.onkeyup = function(ee) {
                    //!!!debug  zebra.print("onkeyup : " + ee.keyCode);
                    if (ee.keyCode == pkg.clipboardTriggerKey) {
                        $clipboard.style.display = "none";
                        $clipboardCanvas.canvas.focus();
                        $clipboardCanvas.canvas.onblur  = $clipboardCanvas.focusLost;
                        $clipboardCanvas.canvas.onfocus = $clipboardCanvas.focusGained;
                    }
                    $clipboardCanvas.keyReleased(ee);
                }

                $clipboard.onblur = function() {  
                    //!!!debug zebra.print("$clipboard.onblur()");
                    this.value="";
                    this.style.display="none";

                    //!!! pass focus back to canvas
                    //    it has to be done for the case when cmd+TAB (switch from browser to 
                    //    another application)
                    $clipboardCanvas.canvas.focus();
                }

                $clipboard.oncopy = function(ee) {
                    //!!!debug zebra.print("::: oncopy");
                    if (pkg.focusManager.focusOwner && pkg.focusManager.focusOwner.copy) {
                        var v = pkg.focusManager.focusOwner.copy();
                        $clipboard.value = v == null ? "" : v;
                        $clipboard.select();
                    }
                }

                $clipboard.oncut = function(ee) {
                    //!!!debug zebra.print("::: oncut")
                    if (pkg.focusManager.focusOwner && pkg.focusManager.focusOwner.cut) {
                        $clipboard.value = pkg.focusManager.focusOwner.cut();
                        $clipboard.select();
                    }
                }

                if (zebra.isFF) {
                    $clipboard.addEventListener ("input", function(ee) {
                        if (pkg.focusManager.focusOwner && pkg.focusManager.focusOwner.paste) {
                            //!!!debug zebra.print("input " + $clipboard.value);
                            pkg.focusManager.focusOwner.paste($clipboard.value);
                        }
                    }, false);
                }
                else {
                    $clipboard.onpaste = function(ee) {
                        //!!!debug zebra.print("::: onpaste() " + $clipboard.value + "," + ee.clipboardData);
                        if (pkg.focusManager.focusOwner && pkg.focusManager.focusOwner.paste) {
                            var txt = (typeof ee.clipboardData == "undefined") ? window.clipboardData.getData('Text')  // IE
                                                                               : ee.clipboardData.getData('text/plain');
                            pkg.focusManager.focusOwner.paste(txt);
                        }
                        $clipboard.value="";
                    }
                }
                document.body.appendChild($clipboard);            
            }
        

            // bunch of handlers to track HTML page metrics update
            // it is necessary since to correct zebra canvases anchro
            
            document.addEventListener("DOMNodeInserted", function(e) { 
                elBoundsUpdated(); 
            }, false);
            
            document.addEventListener("DOMNodeRemoved", function(e) { 
                elBoundsUpdated();

                // remove canvas from list 
                for(var i = $canvases.length - 1; i >= 0; i--) {
                    var canvas = $canvases[i];
                    if (e.target == canvas.canvas) {
                        $canvases.splice(i, 1);

                        if (canvas.saveBeforeLeave) {
                            canvas.saveBeforeLeave();
                        }
                        
                        break;
                    }
                }            
            }, false);
            
            window.addEventListener("resize", function(e) { 
                elBoundsUpdated(); 
            }, false);

            window.onbeforeunload = function(e) {
                var msgs = [];
                for(var i = $canvases.length - 1; i >= 0; i--) {
                    if ($canvases[i].saveBeforeLeave) {
                        var m = $canvases[i].saveBeforeLeave();
                        if (m != null) {
                            msgs.push(m);
                        }
                    }
                }

                if (msgs.length > 0) {
                    var message = msgs.join("  ");
                    if (typeof e === 'undefined') {
                        e = window.event;
                    }   

                    if (e) e.returnValue = message;
                    return message;
                }
            };
        }
        catch(e) {
            ///!!!!! for some reason throwing exception doesn't appear in console.
            //       but it has side effect to the system, what causes other exception
            //       that is not relevant to initial one
            zebra.error(e.toString());
            throw e;
        }
        finally { zebra.ready(); }
    }
);

/**
 * @for
 */

})(zebra("ui"), zebra.Class, zebra.Interface);
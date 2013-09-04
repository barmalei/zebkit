(function(pkg, Class, Interface) {

/**
 * @module ui
 * @namespace zebra.ui
 */

var instanceOf = zebra.instanceOf, L = zebra.layout, MB = zebra.util, $configurators = [],
    rgb = zebra.util.rgb, temporary = { x:0, y:0, width:0, height:0 }, MS = Math.sin, MC = Math.cos,
    $MMI = Math.min,  $fmCanvas = null, $fmText = null, $fmImage = null, $clipboard = null, $clipboardCanvas,
    $canvases = [], $density = typeof window.devicePixelRatio !== "undefined" ? window.devicePixelRatio : 1;

pkg.clipboardTriggerKey = 0;

function $meX(e, d) { return d.graph.tX(e.pageX - d.offx, e.pageY - d.offy); }
function $meY(e, d) { return d.graph.tY(e.pageX - d.offx, e.pageY - d.offy); }

pkg.$view = function(v) {
    if (v == null) return null;

    if (v.paint) return v;

    if (zebra.isString(v)) {
        return rgb.hasOwnProperty(v) ? rgb[v] 
                                     : (pkg.borders && pkg.borders.hasOwnProperty(v) ? pkg.borders[v] : new rgb(v));
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
 * View class that is designed as a basis for various reusable decorative UI elements implementation   
 * @class View
 */
pkg.View = Class([
    function $prototype() {
        this.gap = 2;

        this.getRight = this.getLeft = this.getBottom = this.getTop = function() {
            return this.gap;
        };

        /**
        * Return preferred size the view desires to have
        * @method getPreferredSize
        * @return {Object}
        */
        this.getPreferredSize = function() { return { width:0, height:0 }; };

        /**
        * The method is called to render the decorative element on the given surface of the 
        * specified UI component
        * @param {Canvas 2D context} g  graphical context
        * @param {Integer} x  x coordinate
        * @param {Integer} y  y coordinate
        * @param {Integer} w  required width  
        * @param {Integer} h  required height
        * @param {zebra.ui.Panel} c an UI component on which the view element has to be drawn 
        * @method paint
        */
        this.paint = function(g,x,y,w,h,c) {};
    }
]);

/**
 * Render class extends "zebra.ui.View" class with a notion of target object. Render stores reference  
 * to a target that the render knows how to visualize. Basically Render is an object visualizer. 
 * For instance, developer can implement text, image and so other objects visualizers. 
 * @param {Object} target a target object to be visualized with the render
 * @constructor
 * @extends zebra.ui.View 
 * @class Render
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

        this[''] = function(target) { this.setTarget(target); };

        /**
         * Set the given target object. The method triggers "targetWasChanged(oldTarget, newTarget)" 
         * execution if the method is declared. 
         * Declare targetWasChanged method to listen target object updating.
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
* @class Raised
* @param {String} [brightest] a brightest color value
* @param {String} [middle] a middle color value
* @constructor
* @extends zebra.ui.View 
*/
pkg.Raised = Class(pkg.View, [
    /**
     * Brightest color
     * @attribute brightest
     * @readOnly
     * @type {String}
     * @default "white"
     */

    /**
     * Middle color
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
* @class Sunken
* @extends zebra.ui.View 
*/
pkg.Sunken = Class(pkg.View, [
    function () { this.$this(pkg.lightBrColor, pkg.midBrColor, pkg.darkBrColor); },

    function (brightest,middle,darkest) {
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
* @class Etched
* @extends zebra.ui.View 
*/
pkg.Etched = Class(pkg.View, [
    function () { this.$this(pkg.lightBrColor, pkg.midBrColor); },

    function (brightest,middle) {
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
* @class Dotted
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
            this.color  = (c == null) ? "black" : c;
        };
    }
]);


/**
 * Border view. Can be used to render CSS-like border.
 * @param  {String}  [c] border color 
 * @param  {Integer} [w] border width
 * @param  {Integer} [r] border corners radius
 * @constructor
 * @class Border
 * @extends zebra.ui.View 
 */
pkg.Border = Class(pkg.View, [
    function $prototype() {
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
 * @param  {String}  [col] border color 
 * @param  {Integer} [size] border width
 * @constructor
 * @class RoundBorder
 * @extends zebra.ui.View
 */
pkg.RoundBorder = Class(pkg.View, [
    function $prototype() {
        this.paint =  function(g,x,y,w,h,d) {
            if (this.color != null && this.size > 0) {
                this.outline(g,x,y,w,h,d);
                g.setColor(this.color);
                g.stroke();
            }
        };

        this.outline = function(g,x,y,w,h,d) {
            g.beginPath();
            g.lineWidth = this.size;
            g.arc(x + w/2, y + h/2, w/2, 0, 2*Math.PI, false);
            return true;
        };

        this[''] = function(col, size) {
            this.color = null;
            this.size  = 1;

            if (arguments.length > 0) {
                if (zebra.isNumber(col)) this.size = col;
                else {
                    this.color = col;
                    if (zebra.isNumber(size)) this.size = size;
                }
            }
            this.gap = this.size;
        };
    }
]);

/**
* Vertical or horizontal linear gradient view
* @param {String} startColor start color
* @param {String} endColor end color
* @param {Integer} [type] type of gradient "zebra.layout.VERTICAL" or "zebra.layout.HORIZONTAL"
* @constructor
* @class Gradient
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
* @class Radial
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
* Image render. Render an image target object or specified area of the given target image object
* @param {Image} img the image to be rendered
* @param {Integer} [x] x coordinate of the rendered image part
* @param {Integer} [y] y coordinate of the rendered image part
* @param {Integer} [w] width of the rendered image part 
* @param {Integer} [h] height of the rendered image part
* @param {Boolean} [ub] boolean flag to say if the rendered image has to be double buffered
* @constructor
* @class Picture
* @extends zebra.ui.Render
*/
pkg.Picture = Class(pkg.Render, [
    function $prototype() {
        this[""] = function (img,x,y,w,h,ub) {
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
* @class Pattern
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
* Composite view. The view allows to combine number of views and renders together. 
* @class CompositeView
* @param {Arrayt|Object} [views] array of dictionary of views to be composed together 
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
* ViewSet view. The view is special view container that includes number of views accessible by a key and allows only one 
* view be active. Active is view that is have to be rendered. The view set can be used to store number of
* decorative elements where only one can be rendered depending from an UI component state.
* @param {Object} args object that represents Views instances that have to be included in the ViewSet   
* @constructor
* @class ViewSet
* @extends zebra.ui.View
*/
pkg.ViewSet = Class(pkg.CompositeView, [
    function $prototype() {
        this.paint = function(g,x,y,w,h,d) {
            if (this.activeView != null) this.activeView.paint(g, x, y, w, h, d);
        };

        /**
         * Activate the given view from the given set. 
         * @param  {String} id a key of a view from the set to be activated
         * @method activate
         */
        this.activate = function (id){
            var old = this.activeView;
            if (this.views.hasOwnProperty(id)) return (this.activeView = this.views[id]) != old;
            else {
                if (id.length > 1 && id[0] != '*' && id[id.length-1] != '*') {
                    var i = id.indexOf('.');
                    if (i > 0) {
                        var k = id.substring(0, i + 1).concat('*');
                        if (this.views.hasOwnProperty(k)) return (this.activeView = this.views[k]) != old;
                        else {
                            k = "*" + id.substring(i);
                            if (this.views.hasOwnProperty(k)) return (this.activeView = this.views[k]) != old;
                        }
                    }
                }
            }

            if (this.views.hasOwnProperty("*")) return (this.activeView = this.views["*"]) != old;
            return false;
        };

        this[''] = function(args) {
            if (args == null) {
                throw new Error("Invalid view set");
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
        this.usePropertySetters = false;
    },

    function loaded(v) {
        if (v == null || zebra.isNumber(v) || zebra.isBoolean(v)) return v;
        if (zebra.isString(v)) {
            if (this.root && v[0] == "%" && v[1] == "r") {
                var s = "%root%/";
                if (v.indexOf(s) === 0) return this.root.join(v.substring(s.length));
            }
            return v;
        }

        if (Array.isArray(v)) {
            for (var i = 0; i < v.length; i++) v[i] = this.loaded(v[i]);
            return v;
        }

        for (var k in v) if (v.hasOwnProperty(k)) v[k] = this.loaded(v[k]);
        return v;
    },

    function loadByUrl(url) { return this.loadByUrl(url, null); },

    function loadByUrl(url, context) {
        this.root = null;
        if (zebra.URL.isAbsolute(url) || context == null) this.root = (new zebra.URL(url)).getParentURL();
        else {
            if (context != null) {
                url  = new zebra.URL(context.$url.join(url));
                this.root = url.getParentURL();
            }
        }
        return this.load(zebra.io.GET(url.toString()), false);
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
    return l != null && l.isVisible ? l.getPreferredSize() : { width:0, height:0 };
};

var $cvp = pkg.$cvp = function(c, r) {
    if (c.width > 0 && c.height > 0 && c.isVisible){
        var p = c.parent, px = -c.x, py = -c.y;
        if (r == null) r = { x:0, y:0, width:0, height:0 };
        else r.x = r.y = 0;
        r.width  = c.width;
        r.height = c.height;

        while (p != null && r.width > 0 && r.height > 0) {
            var xx = r.x > px ? r.x : px, yy = r.y > py ? r.y : py;

            r.width  = $MMI(r.x + r.width, px + p.width) - xx,
            r.height = $MMI(r.y + r.height, py + p.height) - yy;
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

pkg.configure = function(c) { $configurators.push(c); };

/**
 * This class represents a font and provides basic font metrics like height, ascent. Using the class developers 
 * can compute string width.
        
      // Arial 14px bold font  
      var f = new zebra.ui.Font("Arial", zebra.ui.Font.BOLD, 14);

      // the same to previous 
      var f = new zebra.ui.Font("Arial", "bold", 14);

      // defining font with CSS font name
      var f = new zebra.ui.Font("100px Futura, Helvetica, sans-serif");

 * @constructor
 * @param {String} name a name of the font. If size and style parameters has not been passed the name is considered
 * as CSS font name that includes size and style
 * @param {Integer} [style] a style of the font: zebra.ui.Font.ITALIC, zebra.ui.Font.BOLD, zebra.ui.Font.PLAIN
 * @param {Integer} [size] a size of the font
 * @class Font
 */
pkg.Font = function(name, style, size) {
    if (arguments.length == 1) {
        name = name.replace(/[ ]+/, ' ');
        this.s = name.trim();
    }
    else {
        this.s = [
                    (style & pkg.Font.ITALIC) > 0 ? 'italic ' : '',
                    (style & pkg.Font.BOLD)   > 0 ? 'bold '   : '',
                     size, 'px ', name
                 ].join('');
    }
    $fmText.style.font = this.s;
    this.height = $fmText.offsetHeight;
    this.ascent = $fmImage.offsetTop - $fmText.offsetTop + 1;

    /**
     * Ascent of the font 
     * @attribute ascent 
     * @readOnly
     * @type {Integer}
     */


    /**
     * Height of the font
     * @attribute height 
     * @readOnly
     * @type {Integer}
     */
};

pkg.Font.PLAIN  = 0;
pkg.Font.BOLD   = 1;
pkg.Font.ITALIC = 2;

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
 * @for Font 
 */
pkg.Font.prototype.charsWidth = function(s, off, len) {
    if ($fmCanvas.font != this.s) $fmCanvas.font = this.s;
    return ($fmCanvas.measureText(len == 1 ? s[off] : s.substring(off, off + len)).width + 0.5) | 0;
};

/**
 * Returns CSS font representation
 * @return {String} a CSS representation of the given Font  
 * @method toString
 * @for Font 
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
     * @class MouseListener 
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
     * @class FocusListener 
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
    FocusListener       = pkg.FocusListener       = Interface(),

    /**
     * Key listener interface to express intention to handle key events
     * @class KeyListener
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
    KeyListener         = pkg.KeyListener         = Interface(),

    /**
     * Interface to express intention to control mouse cursor type
     * @class Cursorable 
     */

    /**
     * The method is called by cursor manager to ask which cursor type has to be set for the 
     * at the given location of the given UI component
     * @optional
     * @param {zebra.ui.Panel} c an UI component where a mouse cursor is on
     * @param {Integer} x a x coordinate relevantly the component where a mouse cursor is on
     * @param {integer} y a y coordinate relevantly the component where a mouse cursor is on
     * @return {String} a mouse cursor type
     * @method  getCursorType
     */
    Cursorable  = pkg.Cursorable = Interface(),

    /**
     * Interface to express intention to control children UI components event handling by 
     * making them events transparent
     * @class Composite 
     */
    
    /**
     * The method is called to ask if the given children UI component has to be events transparent
     * @optional
     * @param {zebra.ui.Panel} c a children UI component
     * @return {Boolean} true if the given children component has to be events transparent
     * @method catchInput
     */
    Composite = pkg.Composite = Interface(),

    /**
     * Interface to express intention to handle children UI components events
     * @class ChildrenListener 
     */

    /**
     * The method is called when an input event has occurred in the children component 
     * @optional
     * @param {zebra.ui.InputEvent} e an input event that has occurred in a children UI component
     * @method childInputEvent
     */
    ChildrenListener = pkg.ChildrenListener = Interface(),

    /**
     * Interface to express intention to participate in native clipboard copy-paste actions. A component 
     * that implements it and has focus can get / send data into / from clipboard
     * @class CopyCutPaste
     */    

    /**
     * The method is called to ask return a string that has to be put into clipboard 
     * @optional
     * @return {String} a string to copy in native clipboard 
     * @method copy
     */

    /**
     * The method is called to pass string from clipboard to a component "CopyCutPaste" interface implements
     * @optional
     * @param {String} s a string from native clipboard
     * @method paste
     */
    CopyCutPaste = pkg.CopyCutPaste = Interface(),

    /**
     * Interface to express intention to catch component events
     * @class ComponentListener
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
     * @param {zebra.ui.Panel} p a parent component the component has been added
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

CL.COMP_ENABLED  = 1;
CL.COMP_SHOWN    = 2;
CL.COMP_MOVED    = 3;
CL.COMP_SIZED    = 4;
CL.COMP_ADDED    = 5;
CL.COMP_REMOVED  = 6;


/**
 * Input event class. Input event is everything what is bound to user inputing like keyboard, mouse, touch screen etc.
 * This class often is used as basis for more specialized input event classes.  
 * @param {zebra.ui.Panel} target a source of the input event
 * @param {Integer} id an unique ID of the input event, for instance zebra.ui.KeyEvent.PRESSED
 * @param {Integer} uid an unique class id of the input event, for instance zebra.ui.InputEvent.MOUSE_UID
 * @class  InputEvent
 * @constructor
 */
var IE = pkg.InputEvent = Class([
    /**
     * Unique id of the input event
     * @attribute ID
     * @readOnly
     * @type {Integer}
     */

    /**
     * Class id of the input event. It helps to differentiates input events by a device it has been generated 
     * @attribute UID
     * @readOnly
     * @type {Integer}
     */

    /**
     * Source of the input event
     * @attribute source
     * @readOnly
     * @type {zebra.ui.Panel}
     */

    function $clazz() {
        this.MOUSE_UID    = 1;
        this.KEY_UID      = 2;
        this.FOCUS_UID    = 3;
        this.FOCUS_LOST   = 10;
        this.FOCUS_GAINED = 11;
    },

    function (target, id, uid){
        this.source = target;
        this.ID = id;
        this.UID = uid;
    }
]);

/**
 * Input key event class. The input event is triggered by a keyboard and has UID property set to 
 * zebra.ui.InputEvent.KEY_UID value 
 * @param {zebra.ui.Panel} target a source of the key input event
 * @param {Integer} id an unique ID of the key input event: zebra.ui.KeyEvent.PRESSED, zebra.ui.KeyEvent.TYPED,
 * zebra.ui.KeyEvent.RELEASED
 * @param {Integer} code a code of pressed key
 * @param {String} ch a character of typed key
 * @param {Integer} mask a bits mask of pressed meta keys:  zebra.ui.KeyEvent.M_CTRL, zebra.ui.KeyEvent.M_SHIFT, 
 * zebra.ui.KeyEvent.M_ALT, zebra.ui.KeyEvent.M_CMD
 * @class  KeyEvent
 * @extends zebra.ui.InputEvent
 * @constructor
 */
var KE = pkg.KeyEvent = Class(IE, [
    /**
     * A code of pressed key
     * @attribute code
     * @readOnly
     * @type {Integer}
     */

    /**
     * A character of typed key
     * @attribute ch
     * @readOnly
     * @type {String}
     */

    /**
     * A bits mask of pressed meta keys (CTRL, ALT, etc)
     * @attribute mask
     * @readOnly
     * @type {Integer}
     */

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
            this.code   = code;
            this.mask   = mask;
            this.ch     = ch;
        };

        this.isControlPressed = function(){ return (this.mask & KE.M_CTRL) > 0; };
        this.isShiftPressed   = function(){ return (this.mask & KE.M_SHIFT) > 0; };
        this.isAltPressed     = function(){ return (this.mask & KE.M_ALT) > 0; };
        this.isCmdPressed     = function(){ return (this.mask & KE.M_CMD) > 0; };
    },

    function (target,id,code,ch,mask){
        this.$super(target, id, IE.KEY_UID);
        this.reset(target, id, code, ch, mask);
    }
]);

/**
 * Mouse and touch screen input event class. The input event is triggered by a mouse or touch screen. 
 * It has UID property set to zebra.ui.InputEvent.MOUSE_UID value 
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
  
 * @param {Integer} ax an absolute (relatively to a canvas where the source UI component is hosted) mouse pointer x coordinate 
 * @param {Integer} ax an absolute (relatively to a canvas where the source UI component is hosted) mouse pointer y coordinate
 * @param {Integer} mask a bits mask of pressed mouse buttons:
 
         zebra.ui.MouseEvent.LEFT_BUTTON
         zebra.ui.MouseEvent.RIGHT_BUTTON
         
 * @param {Integer} clicks number of mouse button clicks 
 * @class  MouseEvent
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

pkg.findCanvas = function(c){
    c = L.getTopParent(c);
    return instanceOf(c, pkg.zCanvas) ? c : null;
};

var MDRAGGED = ME.DRAGGED, EM = null, MMOVED = ME.MOVED, MEXITED = ME.EXITED,
    KPRESSED = KE.PRESSED, MENTERED = ME.ENTERED,
    context = Object.getPrototypeOf(document.createElement('canvas').getContext('2d')),
    $mousePressedEvents = {}, $keyPressedCode = -1, $keyPressedOwner = null,
    $keyPressedModifiers = 0, KE_STUB = new KE(null,  KPRESSED, 0, 'x', 0), $focusGainedCounter = 0,
    ME_STUB = new ME(null, ME.PRESSED, 0, 0, 0, 1);

pkg.paintManager = pkg.events = pkg.$mouseMoveOwner = null;

// !!!!
// the document mouse up happens when we drag outside a canvas
// in this case canvas doesn't get mouse up, so we do it by global mouseup handler
document.addEventListener("mouseup", function(e) {
    for(var k in $mousePressedEvents) {
        var mp = $mousePressedEvents[k];
        if (mp.canvas != null) {
            mp.canvas.mouseReleased(k, mp);
        }
    }
},  false);

// !!!
// override alert to keep control on event sequence, it is very browser dependent
var $alert = (function(){ return this.alert; }());
window.alert = function() {
    if ($keyPressedCode > 0) {
        KE_STUB.reset($keyPressedOwner, KE.RELEASED, $keyPressedCode, '', $keyPressedModifiers);
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
        var dl = $MMI(dist, pattern[i % count]), step = Math.sqrt(dl * dl / (1 + slope * slope)) * sign;
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

pkg.loadImage = function(path, ready) {
    var i = new Image();
    i.crossOrigin = '';
    i.crossOrigin='anonymous';
    zebra.busy();
    if (arguments.length > 1)  {
        i.onerror = function() {  zebra.ready(); ready(path, false); };
        i.onload  = function() {  zebra.ready(); ready(path, true, i);  };
    }
    else {
        i.onload  =  i.onerror = function() { zebra.ready(); };
    }
    i.src = path;
    return i;
};

/**
 *  This the core UI component class. All other UI components has to be successor of the UI class. 

        // instantiate panel with no arguments
        var p = new zebra.ui.Panel();

        // instantiate panel with border layout set as its layout manager
        var p = new zebra.ui.Panel(new zebra.layout.BorderLayout());

        // instantiate panel with the given properties (border layout manager, 
        // blue background and plain border)
        var p = new zebra.ui.Panel({
           layout: new zebra.ui.BorderLayout(),
           background : "blue",
           border     : "plain"
        });

 *  @class Panel
 *  @param {Object|zebra.layout.Layout} [l] pass a layout manager or number of properties that have 
 *  to be applied to the instance of the panel class.
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
         * @type {View}
         */

        /**
         * UI component background view
         * @attribute bg
         * @default null
         * @readOnly
         * @type {View}
        */

        /**
         * UI component enabled state  
         * @attribute isEnabled
         * @default true
         * @readOnly
         * @type {Boolean}
         */

        this.top = this.left = this.right = this.bottom = 0;
        this.isEnabled = true;

        this.notifyRender = function(o,n){
            if (o != null && o.ownerChanged) o.ownerChanged(null);
            if (n != null && n.ownerChanged) n.ownerChanged(this);
        };

        /**
         * Setup UI component properties 
         * @param  {Object} p collection of properties to be applied 
         * @method properties
         * @return {Panel} the class instance itself
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

        this.load = function(jsonPath) {
            jsonPath = jsonPath + (jsonPath.lastIndexOf("?") > 0 ? "&" : "?") + (new Date()).getTime().toString();
            (new zebra.util.Bag(this)).load(zebra.io.GET(jsonPath));
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
            if (r == null || (x < r.x || y < r.y || x >= r.x + r.width || y >= r.y + r.height)) {
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

        this.vrp = function(){
            this.invalidate();
            if(this.parent != null) this.repaint();
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

        this.isInvalidatedByChild = function(c) { return true; };

        this.kidAdded = function (index,constr,l){
            pkg.events.performComp(CL.COMP_ADDED, this, constr, l);
            if(l.width > 0 && l.height > 0) l.repaint();
            else this.repaint(l.x, l.y, 1, 1);
        };

        this.kidRemoved = function(i,l){
            pkg.events.performComp(CL.COMP_REMOVED, this, null, l);
            if (l.isVisible) this.repaint(l.x, l.y, l.width, l.height);
        };

        this.relocated    = function(px,py){ pkg.events.performComp(CL.COMP_MOVED, this, px, py); };
        this.resized      = function(pw,ph){ pkg.events.performComp(CL.COMP_SIZED, this, pw, ph); };
        this.hasFocus     = function(){ return pkg.focusManager.hasFocus(this); };
        this.requestFocus = function(){ pkg.focusManager.requestFocus(this); };

        /**
         * Set the UI component visibility
         * @param  {Boolean} b a visibility state 
         * @method setVisible
         */
        this.setVisible = function (b){
            if (this.isVisible != b) {
                this.isVisible = b;
                this.invalidate();
                pkg.events.performComp(CL.COMP_SHOWN, this, -1,  -1);
            }
        };

        /**
         *  Set the UI component enabled state. Using this property an UI component can be excluded from getting input events 
         *  @param  {Boolean} b a enabled state
         *  @method setEnabled
         */
        this.setEnabled = function (b){
            if (this.isEnabled != b){
                this.isEnabled = b;
                pkg.events.performComp(CL.COMP_ENABLED, this, -1,  -1);
                if (this.kids.length > 0) {
                    for(var i = 0;i < this.kids.length; i++) this.kids[i].setEnabled(b);
                }
            }
        };

        /**
         * Set UI component top, left, bottom, right paddings. The paddings are gaps between component border and 
         * painted area. 
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
         * @param  {Integer} v the value that will be set as top, right, left, bottom UI component paddings
         * @method setPadding
         */
        this.setPadding = function(v) { this.setPaddings(v,v,v,v); };

        /**
         * Set the border view
         * @param  {View} v a border view
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
                    v.activate(this.hasFocus() ?  "function": "focusoff" );
                } 

                this.repaint();
            }
        };

        /**
         * Set the background. Background can be a color string or a View instance, or a function(g,x,y,w,h,c) that paints the background  
         * @param  {String|View|Function} v a background 
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

        this.setKids = function(a) {
            if (arguments.length == 1 && Array.isArray(a)) {
                a = a[0];
            }

            if (instanceOf(a, pkg.Panel)) {
                for(var i=0; i<arguments.length; i++) {
                    var kid = arguments[i];
                    this.insert(i, kid.constraints, kid);
                }
            }
            else {
                var kids = a;
                for(var k in kids) {
                    if (kids.hasOwnProperty(k)) {
                        if (L[k] != null && zebra.isNumber(L[k])) {
                            this.add(L[k], kids[k]);
                        }
                        else this.add(k, kids[k]);
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
         * Remove all children UI component
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
         * Bring the UI component to front of its parent component 
         * @method toFront
         */
        this.toFront = function(){
            if (this.parent != null && this.parent.kids[this.parent.kids.length-1] != this){
                var cnt = this.constraints, p = this.parent;
                p.removeAt(p.indexOf(this));
                p.add(cnt, this);
            }
        };

        /**
         * Send the UI component to back of its parent component 
         * @method toBack
         */
        this.toBack = function(){
            if (this.parent != null && this.parent.kids[0] != this){
                var cnt = this.constraints, p = this.parent;
                p.removeAt(p.indexOf(this));
                p.insert(0, cnt, this);
            }
        };

        /**
         * Set the UI component size to its preferred size 
         * @method toPreferredSize
         */
        this.toPreferredSize = function (){
            var ps = this.getPreferredSize();
            this.setSize(ps.width, ps.height);
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
 *  Base layer UI component. Layer is special type of UI components that is used to decouple different 
 *  logical  UI components types from each other. Zebra Canvas consists from number of layers where only 
 *  one can be active at the given point in time. Layers are stretched to fill full canvas size. Every time 
 *  an input event happens system detects an active layer by asking all layers from top to bottom. First 
 *  layer that wants to catch input gets control. The typical layers examples are window layer, popup menus 
 *  layer and so on.
 *  @param {String} id an unique id to identify the layer
 *  @constructor  
 *  @class BaseLayer
 *  @extends zebra.ui.Panel
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

    function (id){
        if (id == null) throw new Error("Wrong ID");
        this.pfo = null;
        this.$super();
        this.id = id;
    }
]);

/**
 *  Root layer implementation. This is the simplest UI layer implementation where the layer always try grabbing all input event 
 *  @class RootLayer
 *  @extends zebra.ui.BaseLayer
 */
pkg.RootLayer = Class(pkg.BaseLayer, [
    function $prototype() {
        this.isLayerActive = function(x,y){ return true; };
    }
]);

/**
 *  UI component to keep and render the given "zebra.ui.View" class instance. The component uses the 
 *  target view it wraps to calculate its preferred size.
 *  @class ViewPan
 *  @extends zebra.ui.Panel
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
            
            if(v != old) {
                this.view = v;
                this.notifyRender(old, v);
                this.vrp();
            }
        };

        this.calcPreferredSize = function (t) {
            return this.view ? this.view.getPreferredSize() : { width:0, height:0 };
        };
    }
]);

/**
 *  Image panel UI component. The component renders an image. 
 *  @param {String|Image} [img] a path or direct reference to an image. If the passed parameter is string
 *  it considered as path to an image. In this case the image will be loaded using the passed path
 *  @class ImagePan
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
     * @param {String|Image} img a path or direct reference to an image. If the passed parameter is string
     *  it considered as path to an image. In this case the image will be loaded using the passed path
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
 *  UI manager class. The class is widely used as base for building various UI managers like paint, focus, event etc. 
 *  Manager is automatically registered as UI events listener for all implement by the manager UI event listeners
 *  @class Manager
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
 *  Paint UI manager abstract class.  
 *  @class PaintManager
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

                var canvas = pkg.findCanvas(c);
                if(canvas != null){
                    var p = L.getAbsLocation(x, y, c), x2 = canvas.width, y2 = canvas.height;

                    x = p[0];
                    y = p[1];
                    if(x < 0) {
                        w += x;
                        x = 0;
                    }
                    if(y < 0) {
                        h += y;
                        y = 0;
                    }

                    if (w + x > x2) w = x2 - x;
                    if (h + y > y2) h = y2 - y;

                    if (w > 0 && h > 0)
                    {
                        var da = canvas.da;
                        if(da.width > 0) {
                            if (x >= da.x && y >= da.y && x + w <= da.x + da.width && y + h <= da.y + da.height) { 
                                return;
                            }
                            MB.unite(da.x, da.y, da.width, da.height, x, y, w, h, da);
                        }
                        else MB.intersection(0, 0, canvas.width, canvas.height, x, y, w, h, da);

                        if (da.width > 0 && !$timers[canvas]) {
                            var $this = this;
                            $timers[canvas] = setTimeout(function() {
                                $timers[canvas] = null;
                                var context = canvas.graph;

                                try {
                                    canvas.validate();
                                    context.save();

                                    //!!!! debug
                                    //zebra.print(" ============== DA = " + canvas.da.y );
                                    // var dg = canvas.canvas.getContext("2d");
                                    // dg.strokeStyle = 'red';
                                    //dg.beginPath();
                                    //dg.rect(da.x, da.y, da.width, da.height);
                                    // dg.stroke();

                                    context.clipRect(canvas.da.x, canvas.da.y, canvas.da.width, canvas.da.height);
                                    $this.paint(context, canvas);
                                    context.restore();
                                    canvas.da.width = -1; //!!!
                                }
                                catch(e) { zebra.print(e); }
                            }, 50);
                        }
                        if (da.width > 0) canvas.repaint(da.x, da.y, da.width, da.height);
                    }
                }
            }
        };

        this.paint = function(g,c){
            var dw = c.width, dh = c.height, ts = g.getTopStack();
            if(dw !== 0 && dh !== 0 && ts.width > 0 && ts.height > 0 && c.isVisible){
                c.validate();

                g.save();
                g.translate(c.x, c.y);
                g.clipRect(0, 0, dw, dh);

                ts = g.getTopStack();
                var c_w = ts.width, c_h = ts.height;
                if (c_w > 0 && c_h > 0) {
                    this.paintComponent(g, c);
                    var count = c.kids.length, c_x = ts.x, c_y = ts.y;
                    for(var i = 0; i < count; i++) {
                        var kid = c.kids[i];
                        if (kid.isVisible) {
                            var kidX = kid.x, kidY = kid.y,
                                iw = $MMI(kidX + kid.width,  c_x + c_w) - (kidX > c_x ? kidX : c_x),
                                ih = $MMI(kidY + kid.height, c_y + c_h) - (kidY > c_y ? kidY : c_y);

                            if (iw > 0 && ih > 0) this.paint(g, kid);
                        }
                    }
                    if (c.paintOnTop) c.paintOnTop(g);
                }

                g.restore();
            }
        };
    }
]);

pkg.PaintManImpl = Class(pkg.PaintManager, CL, [
    function $prototype() {
        this.compEnabled = function(t) { this.repaint(t); };

        this.compShown = function(t){
            if (t.isVisible) this.repaint(t);
            else {
                if (t.parent != null) this.repaint(t.parent, t.x, t.y, t.width, t.height);
            }
        };

        this.compSized = function(t, pw, ph){
            if (t.parent != null) {
                this.repaint(t.parent, t.x, t.y, (t.width > pw) ? t.width : pw, (t.height > ph) ? t.height : ph);
            }
        };

        this.compMoved = function(t, px, py){
            var p = t.parent, w = t.width, h = t.height;
            if(p != null && w > 0 && h > 0){
                var x = t.x, y = t.y, nx = x < px ? x : px, ny = y < py ? y : py;
                
                //!!! some mobile browser has bug: moving a component leaves 0.5 sized traces 
                //!!! to fix it 1 pixel extra has to be added to all isdes of repainted rect area
                nx--;
                ny--;

                if (nx < 0) nx = 0;
                if (ny < 0) ny = 0;

                this.repaint(p, nx, ny, $MMI(p.width - nx, w + (x > px ? x - px : px - x)) + 2,
                                        $MMI(p.height - ny, h + (y > py ? y - py : py - y)) + 2);
            }
        };

        this.paintComponent = function(g,c){
            var b = c.bg != null && (c.parent == null || c.bg != c.parent.bg);

            if (c.border && c.border.outline && b && c.border.outline(g, 0, 0, c.width, c.height,c)) {
                g.save();
                g.clip();
                c.bg.paint(g, 0, 0, c.width, c.height, c);
                g.restore();
                b = false;
            }
         
            if (b) { 
                c.bg.paint(g, 0, 0, c.width, c.height, c);
            }

            if (c.border && c.border.paint) c.border.paint(g, 0, 0, c.width, c.height, c);

            if (c.update) c.update(g);

            if (c.paint) {
                var left = c.getLeft(), top = c.getTop(), bottom = c.getBottom(), right = c.getRight(), id = -1;
                if(left + right + top + bottom > 0){
                    var ts = g.getTopStack(), cw = ts.width, ch = ts.height;
                    if(cw <= 0 || ch <= 0) return;
                    var cx = ts.x, cy = ts.y, x1 = (cx > left ? cx : left), y1 = (cy > top ? cy : top);
                    id = g.save();
                    g.clipRect(x1, y1, $MMI(cx + cw, c.width - right) - x1,
                                       $MMI(cy + ch, c.height - bottom) - y1);
                }
                c.paint(g);
                if (id > 0) g.restore();
            }
        };
    }
]);

/**
 * Focus manager class defines the strategy of focus traversing. It keeps current focus owner component and 
 * provides API to change current focus component
 * @class FocusManager
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


        function freeFocus(ctx, t){ if(t == ctx.focusOwner) ctx.requestFocus(null);}

        this.prevFocusOwner = this.focusOwner = null;

        this.compEnabled = function(c)   { if (c.isEnabled === false) freeFocus(this, c); };
        this.compShown   = function(c)   { if (c.isVisible === false) freeFocus(this, c); };
        this.compRemoved = function(p,c) { freeFocus(this, c); };

        /**
         * Test if the given component is a focus owner
         * @param  {zebra.ui.Panel} c an UI component to be tested 
         * @method hasFocus
         * @return {Boolean} true if the given component holds focus   
         */
        this.hasFocus = function(c) { return this.focusOwner == c; };

        this.keyPressed = function(e){
            if (KE.TAB == e.code){
                var cc = this.ff(e.source, e.isShiftPressed() ?  -1 : 1);
                if (cc != null) this.requestFocus(cc);
            }
        };

        this.findFocusable = function(c){ return (this.isFocusable(c) ? c : this.fd(c, 0, 1)); };

        /**
         * Test if the given component can catch focus
         * @param  {zebra.ui.Panel} c an UI component to be tested 
         * @method isFocusable
         * @return {Boolean} true if the given component can catch a focus
         */
        this.isFocusable = function(c){
            var d = pkg.findCanvas(c);
            //!!!
            // also we should checks whether parents isFocusable !!!
            return d && c.isEnabled && c.isVisible && c.canHaveFocus && c.canHaveFocus();
        };

        this.fd = function(t,index,d){
            if(t.kids.length > 0){
                var isNComposite = (instanceOf(t, Composite) === false);
                for(var i = index; i >= 0 && i < t.kids.length; i += d) {
                    var cc = t.kids[i];
                    if (cc.isEnabled && cc.isVisible && cc.width > 0 && cc.height > 0 && 
                        (isNComposite || (t.catchInput && t.catchInput(cc) === false)) &&
                        ((cc.canHaveFocus && cc.canHaveFocus()) || (cc = this.fd(cc, d > 0 ? 0 : cc.kids.length - 1, d)) != null))
                    {
                        return cc;
                    }
                }
            }
            return null;
        };

        this.ff = function(c,d){
            var top = c;
            while (top && top.getFocusRoot == null) top = top.parent;
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
            if (c != this.focusOwner && (c == null || this.isFocusable(c))){
                var oldFocusOwner = this.focusOwner;
                if (c != null) {
                    var nf = EM.getEventDestination(c);
                    if (nf == null || oldFocusOwner == nf) return;
                    this.focusOwner = nf;
                }
                else {
                    this.focusOwner = c;
                }

                this.prevFocusOwner = oldFocusOwner;
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

pkg.CursorManager = Class(pkg.Manager, MouseListener, [
    function $prototype() {
        this.setCursorable = function(t,c){
            if(c == null) delete this.cursors[t];
            else this.cursors[t] = c;
        };

        this.mouseMoved   = function(e){ this.setCursorType1(e); };
        this.mouseEntered = function(e){ this.setCursorType1(e); };
        this.mouseExited  = function(e){ this.setCursorType2("default", e.source); };
        this.mouseDragged = function(e){ this.setCursorType1(e); };

        this.setCursorType1 = function(e){
            var t = e.source, c = this.cursors.hasOwnProperty(t) ? this.cursors[t] : null;
            if(c == null && instanceOf(t, Cursorable)) c = t;
            this.setCursorType2(((c != null) ? c.getCursorType(t, e.x, e.y) :  "default"), t);
        };

        this.setCursorType2 = function(type,t){
            if (this.cursorType != type) {
                var d = pkg.findCanvas(t);
                if(d != null){
                    this.cursorType = type;
                    d.canvas.style.cursor = (this.cursorType < 0) ? "default" : this.cursorType;
                }
            }
        };
    },

    function(){
        this.$super();
        this.cursors = {};
        this.cursorType = "default";
    }
]);

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

        IEHM[CL.COMP_SIZED]   = 'compSized';
        IEHM[CL.COMP_MOVED]   = 'compMoved';
        IEHM[CL.COMP_ENABLED] = 'compEnabled';
        IEHM[CL.COMP_SHOWN]   = 'compShown';
        IEHM[CL.COMP_ADDED]   = 'compAdded';
        IEHM[CL.COMP_REMOVED] = 'compRemoved';

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
        // composite component is a component that grab control from his children component. to make a component composite
        // it has to implement Composite interface. If composite component has catchInput method it will be called
        // to clarify if the composite component takes control for the given kid.
        // composite components can be embedded (parent composite can take control on its child composite 
        // component) 
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
                default: throw new Error("Invalid input event UID");
            }

            // distribute event to globally registered listeners
            for(var i = 0;i < it.length; i++) {
                var tt = it[i], m = tt[k];
                if (m != null) b = m.call(tt, e) || b;
            }

            for (t = t.parent;t != null; t = t.parent){
                if (t.childInputEvent != null && instanceOf(t, ChildrenListener)) t.childInputEvent(e);
            }
            return b;
        };

        this.addListener = function (l){
            if (instanceOf(l,CL))                  this.addComponentListener(l);
            if (instanceOf(l,MouseListener))       this.addMouseListener(l);
            if (instanceOf(l,KeyListener))         this.addKeyListener(l);
            if (instanceOf(l,FocusListener))       this.addFocusListener(l);
        };

        this.removeListener = function (l) {
            if (instanceOf(l, CL))                  this.removeComponentListener(l);
            if (instanceOf(l, MouseListener))       this.removeMouseListener(l);
            if (instanceOf(l, KeyListener))         this.removeKeyListener(l);
            if (instanceOf(l, FocusListener))       this.removeFocusListener(l);
        };

        this.addComponentListener      = function (l) { this.a_(this.c_l, l); };
        this.removeComponentListener   = function(l){ this.r_(this.c_l, l); };
        this.addMouseListener          = function(l){ this.a_(this.m_l, l); };
        this.removeMouseListener       = function (l){ this.r_(this.m_l, l); };
        this.addFocusListener          = function (l){ this.a_(this.f_l, l); };
        this.removeFocusListener       = function (l){ this.r_(this.f_l, l); };
        this.addKeyListener            = function (l){ this.a_(this.k_l, l); };
        this.removeKeyListener         = function (l){ this.r_(this.k_l, l); };

        this.a_ = function(c, l){ (c.indexOf(l) >= 0) || c.push(l); };
        this.r_ = function(c, l){ (c.indexOf(l) < 0) || c.splice(i, 1); };
    },

    function(){
        this.m_l  = [];
        this.k_l  = [];
        this.f_l  = [];
        this.c_l  = [];
        this.$super();
    }
]);

function createContext(ctx, w, h) {
    var $save = ctx.save, $restore = ctx.restore, $rotate = ctx.rotate, 
        $scale = ctx.scale, $translate = ctx.translate,
        $getImageData = ctx.getImageData;

    ctx.$scale = $scale;
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

    ctx.getTopStack = function() { return this.stack[this.counter]; };

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
        return $getImageData.call(this, x*$density, y*$density, w, h);
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
            var xx = c.x, yy = c.y, ww = c.width, hh = c.height;
            c.x      = x > xx ? x : xx;
            c.width  = $MMI(x + w, xx + ww) - c.x;
            c.y      = y > yy ? y : yy;
            c.height = $MMI(y + h, yy + hh) - c.y;
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
        this.counter = 0;
        this.stack[0].width = w;
        this.stack[0].height = h;
    };

    return ctx;
}

/**
 *  Canvas zebra UI component. This is one of the key class everybody has to use. The class is a wrapper around HTML Canvas element that 
 *  catch all native HTML Canvas events and translate it to Zebra UI events. This class is top (in hierarchy) UI component where all 
 *  other UI component start living. Canvas UI component consist form different layer, use "root" layer panel to place your UI. 
 *  @class zCanvas
 *  @extends zebra.ui.Panel
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

        this.focusGained = function(e){
            if ($focusGainedCounter++ > 0) {
                e.preventDefault();
                return;
            }

            // !!! 
            // if previous focus owner is a native HTML element it should be ignored 
            // !!!
            if (pkg.focusManager.prevFocusOwner != null && 
                zebra.instanceOf(pkg.focusManager.prevFocusOwner, pkg.HtmlElement) === false) 
            {
                var d = pkg.findCanvas(pkg.focusManager.prevFocusOwner);
                if (d == this)  { 
                    pkg.focusManager.requestFocus(pkg.focusManager.prevFocusOwner);
                }
                else {
                    pkg.focusManager.prevFocusOwner = null;
                }
            }
        };

        this.focusLost = function(e){
            //!!! sometimes focus lost comes incorrectly
            //    ignore focus lost if canvas still holds focus
            if (document.activeElement == this.canvas) {
                e.preventDefault();
                return;
            }

            if ($focusGainedCounter !== 0) {
                $focusGainedCounter = 0;

                //debug("focusLost");
                if (pkg.focusManager.focusOwner != null || 
                    pkg.findCanvas(pkg.focusManager.focusOwner) == this) 
                {
                    pkg.focusManager.requestFocus(null);
                }
            }
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

            // if a button has not been pressed handle mouse eneterd to detect
            // zebra component the mouse pointer entered and send appropriate
            // mouse entered event to it
            if (mp == null || mp.canvas == null) {
                var x = $meX(e, this), y = $meY(e, this), d = this.getComponentAt(x, y);

                // also corretct current component on taht mouse pointer is located
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
                    var x = $meX(e, this), y = $meY(e, this), m = mp.button;

                    // if dragg events has not been initiated yet generate mouse 
                    // start dragging event
                    if (mp.draggedComponent == null) {

                        // check if zebra mouse moved event has already occurred 
                        // if it is true set mouse dragged target component to the mouse moved target component
                        // otherwise compute the target component basing on mouse moved event location  
                        var xx = $meX(mp, this), 
                            yy = $meY(mp, this),
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
                var x = $meX(e, this), y = $meY(e, this), d = this.getComponentAt(x, y); 
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
            var ba = this.canvas.getBoundingClientRect();
            this.offx = ((ba.left + 0.5) | 0) + measure(this.canvas, "padding-left") + window.pageXOffset;
            this.offy = ((ba.top  + 0.5) | 0) + measure(this.canvas, "padding-top" ) + window.pageYOffset;
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
    },

    function()       { this.$this(400, 400); },
    function(w, h)   { this.$this(this.toString(), w, h); },
    function(canvas) { this.$this(canvas, -1, -1); },

    function(canvas, w, h) {
        var pc = canvas, $this = this;
        if (zebra.isString(canvas)) { 
            canvas = document.getElementById(canvas);
            if (canvas != null && pkg.$detectZCanvas(canvas)) {
                throw new Error("Canvas is already in use");
            }
        }
        
        if (canvas == null) {
            canvas = document.createElement("canvas");
            canvas.setAttribute("class", "zebcanvas");
            canvas.setAttribute("width",  w <= 0 ? "400" : "" + w);
            canvas.setAttribute("height", h <= 0 ? "400" : "" + h);
            canvas.setAttribute("id", pc);
            document.body.appendChild(canvas);
        }

        //!!! Pay attention IE9 handles padding incorrectly 
        //!!! the padding has to be set to 0px by appropriate 
        //!!! style sheet getPropertySetter

        if (canvas.getAttribute("tabindex") === null) {
            canvas.setAttribute("tabindex", "1");
        }

        // initialize internal canvas variable to host dirty area
        this.da = { x:0, y:0, width:-1, height:0 };

        // canvas has to be set before super 
        this.canvas = canvas;

        // specify canvas specific layout that stretches all kids to fill the whole canvas area
        this.$super(new pkg.zCanvas.Layout());
    
        //!!! Event manager EM variable cannot be initialized before zebra.ui initialization
        EM = pkg.events;
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
                        $this.mousePressed(e.identifier, e, this.touchCounter == 1 ? ME.LEFT_BUTTON 
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
            };
            
            this.canvas.onmousedown = function(e) { 
                $this.mousePressed(1, e, e.button === 0 ? ME.LEFT_BUTTON: (e.button == 2 ? ME.RIGHT_BUTTON : 0)); 
            };
            
            this.canvas.onmouseup = function(e) { 
                $this.mouseReleased(1, e);
            };

            this.canvas.onmouseover = function(e) { 
                $this.mouseEntered(1, e); 
            };
            
            this.canvas.onmouseout = function(e) { 
                $this.mouseExited(1, e);  
            };
            
            this.canvas.oncontextmenu = function(e) { e.preventDefault(); };

            this.canvas.onkeydown     = function(e) { $this.keyPressed(e);   };
            this.canvas.onkeyup       = function(e) { $this.keyReleased(e);  };
            this.canvas.onkeypress    = function(e) { $this.keyTyped(e);     };
            this.canvas.onfocus       = function(e) { $this.focusGained(e);  };
            this.canvas.onblur        = function(e) { $this.focusLost(e);    };
        }

        var addons = pkg.zCanvas.addons;
        if (addons) {
            for (var i=0; i<addons.length; i++) (new (Class.forName(addons[i]))()).setup(this);
        }
        
        this.recalcOffset();
        this.setSize(parseInt(this.canvas.width, 10), parseInt(this.canvas.height, 10));
        $canvases.push(this);
    },

    function setLocation(x, y) {
        this.canvas.style.top  = y + "px";
        this.canvas.style.left = x + "px";
        this.canvas.style.position = "fixed";
        this.recalcOffset();
    },

    function setSize(w, h) {
        if (this.width != w || h != this.height) {
            // take in account that canvas can be visualized on Retina screen 
            this.canvas.width  = w * $density;
            this.canvas.height = h * $density;
            this.canvas.style.width  = "" + w  + "px";
            this.canvas.style.height = "" + h + "px";
            
            if (this.graph) {
                this.graph.reset(w, h)
            }
            else { 
                this.graph = createContext(this.canvas.getContext("2d"), w, h);
            }

            // again something for Retina screen
            if ($density != 1) {
                // call original method
                this.graph.$scale($density, $density);
            }

            this.width = w;
            this.height = h;

            // the strange fix for Android native browser
            // that can render text blurry before you click
            // it happens because the browser autfit option 
            var $this = this;
            setTimeout(function() {
                $this.invalidate();
                $this.validate();      
                $this.repaint();
            }, 200);  

            // sometimes changing size can bring to changing canvas location 
            // it is required to recalculate offsets
            this.recalcOffset(); 
        }
    },

    /**
     * Stretch Canvas over full screen size 
     * @method fullScreen
     */
    function fullScreen() {
        this.isFullScreen = true;        
        this.setLocation(0,0);
        this.setSize(window.innerWidth, window.innerHeight);
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
    }
]);

zebra.ready(function() {
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
    $fmText    = document.getElementById("zebra.fm.text");
    $fmImage   = document.getElementById("zebra.fm.image");

    try {
        zebra.busy();
        pkg.$configuration = new pkg.Bag(pkg);

        var p = zebra()['canvas.json'];
        pkg.$configuration.loadByUrl(p ? p : "canvas.json", pkg);

        while($configurators.length > 0) $configurators.shift()(pkg.$configuration);
        pkg.$configuration.end();

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
                        var txt = zebra.isIE ? window.clipboardData.getData('Text') 
                                             : ee.clipboardData.getData('text/plain');
                        pkg.focusManager.focusOwner.paste(txt);
                    }
                    $clipboard.value="";
                }
            }
            document.body.appendChild($clipboard);            
        }
    
        // canvases location has to be corrected if document layout is invalid 
        function correctOffset(e) {
            var b = (e.type === "DOMNodeRemoved");
        
            for(var i = $canvases.length - 1; i >= 0; i--) {
                var canvas = $canvases[i];
                if (b === false && canvas.isFullScreen) {
                    canvas.setLocation(0, 0);
                    canvas.setSize(window.innerWidth, window.innerHeight);
                }

                canvas.recalcOffset();
                if (b && e.target == canvas.canvas) {
                    $canvases.splice(i, 1);
                }
            }
        }

        document.addEventListener("DOMNodeInserted", correctOffset, false);
        document.addEventListener("DOMNodeRemoved", correctOffset, false);
        window.addEventListener("resize", correctOffset, false);
    }
    catch(e) {
        ///!!!!! for some reason throwing exception doesn't appear in console.
        //       but it has side effect to the system, what causes other exception
        //       that is not relevant to initial one
        zebra.error(e.toString());
        throw e;
    }
    finally { zebra.ready(); }
});

})(zebra("ui"), zebra.Class, zebra.Interface);
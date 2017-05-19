zebkit.package("web", function(pkg, Class) {
    /**
     * Web specific stuff to provide abstracted method to work in WEB context.
     * @class zebkit.web
     * @access package
     */

    /**
     * Device ratio.
     * @attribute $deviceRatio
     * @readOnly
     * @private
     * @type {Number}
     */
    pkg.$deviceRatio = typeof window.devicePixelRatio !== "undefined" ? window.devicePixelRatio
                                                                      : (typeof window.screen.deviceXDPI !== "undefined" ? window.screen.deviceXDPI / window.screen.logicalXDPI // IE
                                                                                                                         : 1);

    pkg.$windowSize = function() {
        // iOS retina devices can have a problem with performance
        // in landscape mode because of a bug (full page size is
        // just 1 pixels column more than video memory that can keep it)
        // So, just make width always one pixel less.
        return  {
            width : window.innerWidth, //   - 1,
            height: window.innerHeight
        };
    };

    /**
     * Calculates view port of a browser window
     * @return {Object} a browser window view port size.
     *
     *    ```json
     *    {
     *      width : {Integer},
     *      height: {Integer}
     *    }
     *    ```
     *
     * @method $viewPortSize
     * @for  zebkit.web
     * @private
     */
    pkg.$viewPortSize = function() {
        var ws   = pkg.$windowSize(),
            body = document.body,
            css  = [ "margin-left", "margin-right", "margin-top", "margin-bottom",
                     "padding-left", "padding-right", "padding-top", "padding-bottom",
                     "border-left-width", "border-right-width", "border-top-width", "border-bottom-width"];

        for(var i = 0; i < css.length;) {
            ws.width  -= (pkg.$measure(body, css[i++]) + pkg.$measure(body, css[i++]));
            ws.height -= (pkg.$measure(body, css[i++]) + pkg.$measure(body, css[i++]));
        }
        return ws;
    };

    pkg.$measure = function(e, cssprop) {
        var value = window.getComputedStyle(e, null).getPropertyValue(cssprop);
        return (value === null || value === '') ? 0
                                                : parseInt(/(^[0-9\.]+)([a-z]+)?/.exec(value)[1], 10);
    };


    /**
     * Tests if the given DOM element is in document
     * @private
     * @param  {Element} element a DOM element
     * @return {Boolean} true if the given DOM element is in document
     * @method $contains
     * @for  zebkit.web
     */
    pkg.$contains = function(element) {
        // TODO: not sure it is required, probably it can be replaced with document.body.contains(e);
        return (typeof document.contains !== 'undefined' && document.contains(element)) ||
               (typeof document.body.contains !== 'undefined' && document.body.contains(element)); // !!! use body for IE
    };

    /**
     * Test if the given page coordinates is inside the given element
     * @private
     * @param  {Element} element a DOM element
     * @param  {Number} pageX an x page coordinate
     * @param  {Number} pageY an y page coordinate
     * @return {Boolean} true if the given point is inside the specified DOM element
     * @method $isInsideElement
     */
    pkg.$isInsideElement = function(element, pageX, pageY) {
        var r = element.getBoundingClientRect();
        return r !== null            &&
               pageX >= r.left       &&
               pageY >= r.top        &&
               pageX <= r.right - 1  &&
               pageY <= r.bottom - 1   ;
    };

    var $focusInOutSupported = (function() {
        var support = false,
            parent  = document.lastChild,
            a       = document.createElement('a');

        a.href = '#';
        a.setAttribute("style", "position:fixed;left:-99em;top:-99em;");
        a.addEventListener('focusin', function() {
            support = true;
        });

        parent.appendChild(a).focus();
        parent.removeChild(a);
        return support;
    })();

    pkg.$focusin = function(element, f, b) {
        return element.addEventListener($focusInOutSupported ? "focusin" : "focus", f, b);
    };

    pkg.$focusout = function(element, f, b) {
        return element.addEventListener($focusInOutSupported ? "focusout" : "blur", f, b);
    };

    pkg.$eventsBlackHole = function(e) {
        e.preventDefault();
        e.stopPropagation();
    };

    /**
     * Creates HTML element that "eats" (doesn't propagate and prevents default) all input (touch, mouse, key)
     * events that it gets.
     * @return {HTMLElement} a created HTML element.
     * @method  $createBlockedElement
     * @protected
     * @for  zebkit.web
     */
    pkg.$createBlockedElement = function() {
        var be = document.createElement("div");
        be.style.height = be.style.width  = "100%";
        be.style.left = be.style.top = "0px";
        be.style.position = "absolute";
        be.style["z-index"] = "100000";
        be.setAttribute("zebkit", "blockedElement");

        be.onmouseup   = be.onmousedown = be.onmouseout =
        be.onmouseover = be.onmousemove = be.onkeydown  =
        be.onkeypress  = be.onkeyup = pkg.$eventsBlackHole;

        var events = [ "touchstart", "touchend", "touchmove",
                       "pointerdown", "pointerup", "pointermove",
                       "pointerenter", "pointerleave" ];

        for(var i = 0 ; i < events.length ; i++ ) {
           be.addEventListener(events[i], pkg.$eventsBlackHole, false);
        }

        return be;
    };

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
     * @attribute $2DContextMethods
     * @type {Object}
     * @protected
     * @readOnly
     */
    pkg.$2DContextMethods = {
        setFont : function(f) {
            f = (typeof f.s !== 'undefined' ? f.s : f.toString());
            if (f !== this.font) {
                this.font = f;
            }
        },

        setColor : function (c) {
            c = (typeof c.s !== 'undefined' ? c.s : c.toString());
            if (c !== this.fillStyle) this.fillStyle = c;
            if (c !== this.strokeStyle) this.strokeStyle = c;
        },

        drawLine : function (x1, y1, x2, y2, w){
            if (arguments.length < 5) w = 1;
            var pw = this.lineWidth;
            this.beginPath();
            if (this.lineWidth !== w) this.lineWidth = w;

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
            if (pw !== this.lineWidth) this.lineWidth = pw;
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
            for(var i = 1; i < nPoints; i++) this.lineTo(xPoints[i], yPoints[i]);
        },

        drawDottedRect : function(x,y,w,h) {
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
            }
            else {
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
     * Extend standard 2D HTML Canvas context instance with the given set of methods.
     * If new methods clash with already existent 2D context method the old one is overwritten
     * with new one and old method is saved using its name prefixed with "$" character
     * @param  {CanvasRenderingContext2D} ctx  a 2D HTML Canvas context instance
     * @param  {Array} methods list of methods to be added to the context
     * @method $extendContext
     * @private
     */
    pkg.$extendContext = function(ctx, methods) {
        for(var k in methods) {
            if (k === "$init") {
                methods[k].call(ctx);
            } else {
                var old = ctx[k];
                if (typeof old !== 'undefined') {
                    var kk = "$" + k;
                    if (typeof ctx[kk] === 'undefined') {
                        ctx[kk] = old;
                    }
                }
                ctx[k] = methods[k];
            }
        }
    };

    /**
     * Adjusts the given HTML Canvas element to the required size that takes in account device DPI.
     * Extend the canvas 2D context with extra methods and variables that are used with zebkit UI
     * engine.
     * @param  {HTMLCanvasElement} c a HTML canvas element
     * @param  {Integer} w  a required width of the given canvas
     * @param  {Integer} h  a required height of the given canvas
     * @param  {Boolean} [forceResize] flag to force canvas resizing even if the canvas has identical width and height.
     * It is required to re-create canvas 2D context to work properly.
     * @return {CanvasRenderingContext2D} a 2D context of the canvas element
     * @method $canvas
     * @protected
     * @for  zebkit.web
     */
    pkg.$canvas = function(c, w, h, forceResize) {
        // fetch current CSS size of canvas
        var cs = window.getComputedStyle(c, null),
            cw = parseInt(cs.getPropertyValue("width"),  10),
            ch = parseInt(cs.getPropertyValue("height"), 10),
            ctx = c.getContext("2d"),
            updateRatio = false;

        // if CSS width or height has not been set for the canvas
        // it has to be done, otherwise scaling on hi-DPI screen
        // will not work
        if (isNaN(parseInt(c.style.width ))||
            isNaN(parseInt(c.style.height))  )
        {
            c.style.width  = "" + cw + "px";
            c.style.height = "" + ch + "px";
            updateRatio = true;
        }

        // setup new canvas CSS size if appropriate width and height
        // parameters have been passed and they don't match current CSS
        // width and height
        if (arguments.length > 1) {
            if (cw !== w || ch !== h) {
                c.style.width  = "" + w + "px";
                c.style.height = "" + h + "px";
                updateRatio = true;
            }
            cw = w;
            ch = h;
        }

        // canvas 2D context is singleton so check if the
        // context has already been modified to prevent
        // redundancy
        if (typeof ctx.$ratio === "undefined") {
            ctx.$ratio = (ctx.webkitBackingStorePixelRatio ||   // backing store ratio
                          ctx.mozBackingStorePixelRatio    ||
                          ctx.msBackingStorePixelRatio     ||
                          ctx.backingStorePixelRatio       ||
                          ctx.backingStorePixelRatio       || 1);

            ctx.$getImageData = ctx.getImageData;
            ctx.$scale        = ctx.scale;          // save original method if at some stage
                                                    // it will be overridden (zebkit does it)
                                                    // only original method has to be used to
                                                    // adjust canvas to screen DPI
            if (pkg.$deviceRatio != ctx.$ratio) {
                var r = pkg.$deviceRatio / ctx.$ratio;
                ctx.getImageData= function(x, y, w, h) {
                    return this.$getImageData(x * r, y * r, w, h);
                };
            }

            // populate extra method to 2d context
            pkg.$extendContext(ctx, pkg.$2DContextMethods);
        }

        // take in account that canvas can be visualized on
        // Retina screen where the size of canvas (backstage)
        // can be less than it is real screen size. Let's
        // make it match each other
        if (ctx.$ratio != pkg.$deviceRatio) {
            var ratio = pkg.$deviceRatio / ctx.$ratio;

            // calculate canvas with and height taking in account
            // screen ratio
            cw = ~~(cw * ratio);
            ch = ~~(ch * ratio);

            // adjust canvas size if it is necessary
            if (c.width != cw || c.height != ch || updateRatio === true || forceResize === true) {
                c.width  = cw;
                c.height = ch;
                ctx.$scale(ratio, ratio);
            }
        } else {
            // adjust canvas size if it is necessary
            if (c.width != cw || c.height != ch || forceResize === true) {
                c.width  = cw;
                c.height = ch;
            }
        }

        // TODO: top works not good in FF and it is better don't use it
        // So, ascent has to be taking in account as it was implemented
        // before
        if (ctx.textBaseline !== "top" ) {
            ctx.textBaseline = "top";
        }

        return ctx;
    };
});
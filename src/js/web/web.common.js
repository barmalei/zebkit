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
    pkg.$deviceRatio = window.devicePixelRatio !== undefined ? window.devicePixelRatio
                                                             : (window.screen.deviceXDPI !== undefined ? window.screen.deviceXDPI / window.screen.logicalXDPI // IE
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
        return (document.contains !== undefined && document.contains(element)) ||
               (document.body.contains !== undefined && document.body.contains(element)); // !!! use body for IE
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
                if (old !== undefined) {
                    var kk = "$" + k;
                    if (ctx[kk] === undefined) {
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
        if (ctx.$ratio === undefined) {
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

            // populate extra method to 2D context
            pkg.$extendContext(ctx, zebkit.draw.Context2D);
        }

        ctx.$scaleRatio      = 1;
        ctx.$scaleRatioIsInt = true;

        // take in account that canvas can be visualized on
        // Retina screen where the size of canvas (backstage)
        // can be less than it is real screen size. Let's
        // make it match each other
        if (ctx.$ratio != pkg.$deviceRatio) {
            var ratio = ctx.$ratio !== 1 ? pkg.$deviceRatio / ctx.$ratio
                                         : pkg.$deviceRatio;


            if (Number.isInteger(ratio)) {
                cw = cw * ratio;
                ch = ch * ratio;
            } else {
                if (pkg.config("approximateRatio") === true) {
                    ratio = Math.round(ratio);
                    cw = cw * ratio;
                    ch = ch * ratio;
                } else {
                    // adjust ratio
                    //  -- get adjusted with ratio width
                    //  -- floor it and re-calculate ratio again
                    //  -- the result is slightly corrected ratio that fits better
                    //  to keep width as integer
                    ratio = Math.floor(cw * ratio) / cw;
                    cw = Math.floor(cw * ratio);
                    ch = Math.floor(ch * ratio);
                    ctx.$scaleRatioIsInt = Number.isInteger(ratio);
                }
            }

            ctx.$scaleRatio = ratio;

            // adjust canvas size if it is necessary
            if (c.width != cw || c.height != ch || updateRatio === true || forceResize === true) {
                c.width  = cw;
                c.height = ch;
                ctx.$scale(ratio, ratio);
            }
        } else if (c.width != cw || c.height != ch || forceResize === true) { // adjust canvas size if it is necessary
            c.width  = cw;
            c.height = ch;
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
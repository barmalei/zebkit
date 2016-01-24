(function(pkg, Class) {
    pkg.$deviceRatio = typeof window.devicePixelRatio !== "undefined"
                        ? window.devicePixelRatio
                        : (typeof window.screen.deviceXDPI !== "undefined"
                            ? window.screen.deviceXDPI / window.screen.logicalXDPI // IE
                            : 1);


    var $taskMethod = window.requestAnimationFrame       ||
                      window.webkitRequestAnimationFrame ||
                      window.mozRequestAnimationFrame    ||
                      function(callback) { return window.setTimeout(callback, 35); };

    pkg.$task = function(f){
        return $taskMethod.call(window, f);
    };

    pkg.$windowSize = function() {
        // iOS retina devices can have a problem with performance
        // in landscape mode because of a bug (full page size is
        // just 1 pixels column more than video memory that can keep it)
        // So, just make width always one pixel less.
        return { width : window.innerWidth - 1,
                 height: window.innerHeight   };
    };

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
        return (value == null || value === '') ? 0
                                               : parseInt(/(^[0-9\.]+)([a-z]+)?/.exec(value)[1], 10);
    };

    // TODO: not sure it is required, probabbly it can be replaced with document.body.contains(e);
    pkg.$contains = function(element) {
        return (document.contains != null && document.contains(element)) ||
               (document.body.contains != null && document.body.contains(element)); // !!! use body for IE
    };

    pkg.$isInsideElement = function(element, pageX, pageY) {
        var r = element.getBoundingClientRect();
        return r != null             &&
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


    /**
     * Load an image by the given URL.
     * @param  {String|Image} img an image URL or image object
     * @param  {Function} ready a call back method to be notified when the
     * image has been completely loaded or failed. The method gets three parameters

        - an URL to the image
        - boolean loading result. true means success
        - an image that has been loaded

                // load image
                zebkit.web.$loadImage("test.png", function(path, result, image) {
                    if (result === false) {
                        // handle error
                        ...
                    }
                });

     * @return {Image}  an image
     * @api  zebkit.web.$loadImage()
     * @method  loadImage
     */
    pkg.$loadImage = function(img, ready) {
        var i = null;
        if (img instanceof Image) {
            i = img;
        }
        else {
            i = new Image();
            i.crossOrigin = '';
            i.crossOrigin ='anonymous';
            i.src = img;
        }

        if (i.complete === true && i.naturalWidth !== 0) {
            if (arguments.length > 1)  {
                ready(i.src, true, i);
            }
            return i;
        }

        var pErr  = i.onerror,
            pLoad = i.onload;

        zebkit.busy();

        i.onerror = function(e) {
            zebkit.ready();
            i.onerror = null;
            if (ready != null) ready(img, false, i);
            if (pErr != null) {
                i.onerror = pErr;
                pErr.call(this, e);
            }
        };

        i.onload  = function(e) {
            i.onload = null;
            zebkit.ready();
            if (ready != null) ready(img, true, i);
            if (pLoad != null) {
                i.onload = pLoad;
                pLoad.call(this, e);
            }
        };

        return i;
    };

    function $eventsBlackHole(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    pkg.$createBlockedElement = function() {
        var be = document.createElement("div");
        be.style.height = be.style.width  = "100%";
        be.style.left = be.style.top = "0px";
        be.style.position = "absolute";
        be.style["z-index"] = "100000";
        be.setAttribute("zebkit", "blockedElement");

        be.onmouseup   = be.onmousedown = be.onmouseout =
        be.onmouseover = be.onmousemove = be.onkeydown  =
        be.onkeypress  = be.onkeyup = $eventsBlackHole;

        var events = [ "touchstart", "touchend", "touchmove",
                       "pointerdown", "pointerup", "pointermove",
                       "pointerenter", "pointerleave" ];

        for(var i = 0 ; i < events.length ; i++ ) {
           be.addEventListener(events[i], $eventsBlackHole, false);
        }

        return be;
    };

    pkg.$ContextMethods = {
        setFont : function(f) {
            f = (f.s != null ? f.s : f.toString());
            if (f !== this.font) {
                this.font = f;
            }
        },

        setColor : function (c) {
            if (c == null) throw new Error("Null color");
            c = (c.s != null ? c.s : c.toString());
            if (c !== this.fillStyle) this.fillStyle = c;
            if (c !== this.strokeStyle) this.strokeStyle = c;
        },

        drawLine : function (x1, y1, x2, y2, w){
            if (arguments.length < 5) w = 1;
            var pw = this.lineWidth;
            this.beginPath();
            if (this.lineWidth !== w) this.lineWidth = w;

            if (x1 == x2) {
                x1 += w / 2;
                x2 = x1;
            }
            else {
                if (y1 == y2) {
                    y1 += w / 2;
                    y2 = y1;
                }
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
        },

        polylinePath : function(xPoints, yPoints, nPoints){
            this.beginPath();
            this.moveTo(xPoints[0], yPoints[0]);
            for(var i=1; i < nPoints; i++) this.lineTo(xPoints[i], yPoints[i]);
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
                var idx  = i % pattern.length;
                    dl   = dist < pattern[idx] ? dist : pattern[idx],
                    step = Math.sqrt(dl * dl / (1 + slope * slope)) * sign;
                compute(step);
                this[(i % 2 === 0) ? 'lineTo' : 'moveTo'](x + 0.5, y + 0.5);
                dist -= dl;
            }
            this.stroke();
        }
    };

    pkg.$extendContext = function(ctx, methods){
        for(var k in methods) {
            if (k === "$init") {
                methods[k].call(ctx);
            }
            else {
                var old = ctx[k];
                if (old != null) {
                    var kk = "$" + k;
                    if (typeof ctx[kk] === 'undefined') {
                        ctx[kk] = old;
                    }
                }
                ctx[k] = methods[k];
            }
        }
    };

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
            if (cw != w || ch != h) {
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
            pkg.$extendContext(ctx, pkg.$ContextMethods);
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
        }
        else {
            // adjust canvas size if it is necessary
            if (c.width != cw || c.height != ch || forceResize === true) {
                c.width  = cw;
                c.height = ch;
            }
        }

        // TODO: top works not good in FF and it is better don't use it
        // So, ascent has to be taking in account as it was implemented
        // before
        if (ctx.textBaseline != "top" ) {
            ctx.textBaseline = "top";
        }

        return ctx;
    };
})(zebkit("web"), zebkit.Class);
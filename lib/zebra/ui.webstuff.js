(function(pkg) {
    zebra.ready(function() {
        pkg.$deviceRatio = typeof window.devicePixelRatio !== "undefined" ? window.devicePixelRatio
                                                                          : (typeof window.screen.deviceXDPI !== "undefined" ? // IE
                                                                             window.screen.deviceXDPI / window.screen.logicalXDPI : 1); 


        pkg.$applyRenderExploit = (parseInt(pkg.$deviceRatio) === pkg.$deviceRatio || zebra.isIE);

        // canvases location has to be corrected if document layout is invalid 
        pkg.$elBoundsUpdated = function() {
            for(var i = pkg.$canvases.length - 1; i >= 0; i--) {
                var c = pkg.$canvases[i];
                if (c.isFullScreen) {
                    //c.setLocation(window.pageXOffset, -window.pageYOffset);
                
                    var ws = pkg.$windowSize();
                    // browser (mobile) can reduce size of browser window by 
                    // the area a virtual keyboard occupies. Usually the 
                    // content scrolls up to the size the VK occupies, so 
                    // to leave zebra full screen content in the window 
                    // with the real size (not reduced) size take in account 
                    // scrolled metrics
                    c.setSize(ws.width + window.pageXOffset, ws.height + window.pageYOffset);
                }
                c.recalcOffset();
            }
        };

        window.requestAFrame = (function(){
            return  window.requestAnimationFrame       ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame    ||
                    function( callback ){ window.setTimeout(callback, 35); };
        })();

        pkg.$windowSize = function() {
            // iOS retina devices can have a problem with performance 
            // in landscape mode because of a bug (full page size is
            // just 1 pixels column more than video memory can keep)
            // So, just make width always one pixel less. 
            return { width : window.innerWidth - 1,
                     height: window.innerHeight   };
        };

        pkg.$measure = function(e, cssprop) {
            var value = window.getComputedStyle ? window.getComputedStyle(e, null).getPropertyValue(cssprop)
                                                : (e.style ? e.style[cssprop]
                                                           : e.currentStyle[cssprop]);
            return (value == null || value == '') ? 0
                                                  : parseInt(/(^[0-9\.]+)([a-z]+)?/.exec(value)[1], 10);
        };

        pkg.$canvas = {
            size : function(c, w, h) {
                c.style.width  = "" + w + "px";
                c.style.height = "" + h + "px";
                
                var ctx = pkg.$canvas.context(c); 

                // take in account that canvas can be visualized on 
                // Retina screen where the size of canvas (backstage)
                // can be less than it is real screen size. Let's 
                // make it match each other
                if (ctx.$ratio != pkg.$deviceRatio) {
                    var ratio = pkg.$deviceRatio / ctx.$ratio;
                    c.width  = ~~(w * ratio);
                    c.height = ~~(h * ratio);
                    ctx.$scale(ratio, ratio);
                }
                else {
                    c.width  = w;
                    c.height = h;
                } 
                return ctx;
            },

            context: function(c) {
                var ctx = c.getContext("2d");

                // canvas 2d context is singleton so check if the 
                // context has already been modified to prevent 
                // redundancy  
                if (typeof ctx.$ratio == "undefined") {
                    var ratio = pkg.$canvas.ratio(ctx); 

                    ctx.$getImageData = ctx.getImageData;
                    ctx.$scale = ctx.scale;
                    ctx.$ratio = ratio; 
                    if (pkg.$deviceRatio != ratio) {
                        var r = pkg.$deviceRatio / ratio;
                        ctx.getImageData= function(x, y, w, h) {
                            return this.$getImageData(x * r, y * r, w, h);
                        };
                    }
                }

                return ctx;
            },

            create: function(w, h) {
                var e = document.createElement("canvas");
                if (arguments.length === 0) {
                    w = typeof e.width  != "undefined" ? e.width  : 0;
                    h = typeof e.height != "undefined" ? e.height : 0;
                }
                pkg.$canvas.size(e, w, h);
                return e;
            },

            ratio : function(ctx) {
                // backstage buffer can have different size with a real size
                // what causes the final picture can be zoomed in/out
                // we need to calculate it to make canvas more crisp
                // for HDPI screens
                return (ctx.webkitBackingStorePixelRatio ||   // backing store ratio
                        ctx.mozBackingStorePixelRatio    ||
                        ctx.msBackingStorePixelRatio     ||
                        ctx.backingStorePixelRatio       || 
                        ctx.backingStorePixelRatio       || 1);
            }
        };

        var $wrt = null, winSizeUpdated = false, wpw = -1, wph = -1;            
        window.addEventListener("resize", function(e) {
            if (wpw == window.innerWidth && wph == window.innerHeight) {
                return;
            }

            wpw = window.innerWidth;
            wph = window.innerHeight;

            if ($wrt != null) {
                winSizeUpdated = true;
                return;
            }

            $wrt = zebra.util.task(
                function(t) {
                    if (winSizeUpdated === false) {  
                        pkg.$elBoundsUpdated();
                        t.shutdown();
                        $wrt = null;
                    }
                    winSizeUpdated = false;                    
                }
            ).run(200, 150);
            
        }, false);

        window.onbeforeunload = function(e) {
            var msgs = [];
            for(var i = pkg.$canvases.length - 1; i >= 0; i--) {
                if (pkg.$canvases[i].saveBeforeLeave != null) {
                    var m = pkg.$canvases[i].saveBeforeLeave();
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

        // bunch of handlers to track HTML page metrics update
        // it is necessary since to correct zebra canvases anchor         
        document.addEventListener("DOMNodeInserted", function(e) { 
            pkg.$elBoundsUpdated(); 
        }, false);
        
        document.addEventListener("DOMNodeRemoved", function(e) { 
            pkg.$elBoundsUpdated();

            // remove canvas from list 
            for(var i = pkg.$canvases.length - 1; i >= 0; i--) {
                var canvas = pkg.$canvases[i];
                if (e.target == canvas.canvas) {
                    pkg.$canvases.splice(i, 1);

                    if (canvas.saveBeforeLeave != null) {
                        canvas.saveBeforeLeave();
                    }
                    
                    break;
                }
            }            
        }, false);
    });

    var PI4 = Math.PI/4, PI4_3 = PI4 * 3, $abs = Math.abs, $atan2 = Math.atan2, L = zebra.layout;

    /**
     *  Mouse wheel support class. Installs necessary mouse wheel
     *  listeners and handles mouse wheel events in zebra UI. The 
     *  mouse wheel support is plugging that is configured by a 
     *  JSON configuration. 
     *  @class zebra.ui.MouseWheelSupport
     *  @param  {zebra.ui.zCanvas} canvas a zebra zCanvas UI component
     *  @constructor
     */
    pkg.MouseWheelSupport = zebra.Class([
        function $prototype() {
            this.naturalDirection = true;

            /**
             * Mouse wheel handler 
             * @param  {MouseWheelEvent} e DOM mouse event object 
             * @method wheeled
             */
            this.wheeled  = function(e){
                var owner = pkg.$mouseMoveOwner;

                while (owner != null && zebra.instanceOf(owner, pkg.ScrollPan) === false) {
                    owner = owner.parent;
                }

                if (owner != null && (owner.vBar != null || owner.hBar != null)) {
                    var dv = e[this.wheelInfo.dy] * this.wheelInfo.dir;  

                    if (dv !== 0 && owner.vBar != null) {


                        var bar = owner.vBar;
                        if (Math.abs(dv) < 1) {
                            dv *= bar.pageIncrement;
                        };

                        dv = Math.floor(dv) % 100

                        if (bar.isVisible === true) {
                            var v =  bar.position.offset + dv;           
                            if (v >= 0) bar.position.setOffset(v);
                        }
                    }

                    e.preventDefault();
                }
            };
        },

        function(canvas) {
            if (canvas == null) {
                throw new Error("Null canvas");
            }

            var WHEEL = {
                wheel: {
                    dy  : "deltaY",
                    dir : 1,
                    test: function() {
                        return "onwheel" in document.createElement("div");
                    }
                },
                mousewheel: {
                    dy  : "wheelDelta",
                    dir : -1,
                    test: function() {
                        return document.onmousewheel !== undefined;
                    }
                },
                DOMMouseScroll: {
                    dy  : "detail",
                    dir : 1,
                    test: function() {
                        return true;
                    }
                }
            };

            for(var k in WHEEL) {
                var w = WHEEL[k];
                if (w.test()) {
                    var $this = this;
                    canvas.canvas.addEventListener(k, 
                        this.wheeled.bind == null ? function(e) { 
                                                        return $this.wheeled(e); 
                                                    }
                                                  : this.wheeled.bind(this),
                    false);
                    
                    this.wheelInfo = w; 
                    break;        
                }
            }
        }
    ]);

    pkg.TouchHandler = zebra.Class([
        function $prototype() {
            this.touchCounter = 0;

            function isIn(t, id) {
                for(var i = 0; i < t.length; i++) {  
                    if (t[i].identifier == id) return true;
                }                    
                return false;
            }

            this.$fixEnd = function(e) {
                var t = e.touches, ct = e.changedTouches; 
                for (var k in this.touches) { 

                    // find out if: 
                    // 1) a stored started touch has appeared as new touch
                    //    it can happen if touch end has not been fired and 
                    //    the new start touch id matches a stored one  
                    // 2) if no one touch among current touches matches a stored 
                    //    touch. If it is true that means the stored touch has not 
                    //    been released since no appropriate touch end event has 
                    //    been fired
                    if (isIn(ct, k) === true || isIn(t, k) === false) {
                        var tt = this.touches[k]; 
                        this.touchCounter--;
                        if (tt.group != null) tt.group.active = false;
                        this.ended(tt); 
                        delete this.touches[k];
                    }
                }
            };

            this.start = function(e) {
                this.$fixEnd(e);

                // fix android bug: parasite event for multi touch 
                // or stop capturing new touches since it is already fixed
                if (this.touchCounter > e.touches.length) return;

                // collect new touches in queue, don't send it immediately 
                var t = e.touches; 
                for(var i = 0; i < t.length; i++) {  // go through all touches
                    var tt = t[i];

                    // test if the given touch has not been collected in queue yet
                    if (this.touches.hasOwnProperty(tt.identifier) === false) {
                        this.touchCounter++; 
                        var nt = {
                            pageX      : tt.pageX,
                            pageY      : tt.pageY,
                            identifier : tt.identifier,
                            target     : tt.target,
                            direction  : L.NONE,  // detected movement direction (L.HORIZONTAL or L.VERTICAL)
                            dx         : 0,       // horizontal shift since last touch movement 
                            dy         : 0,       // vertical shift since last touch movement 
                            dc         : 0,       // internal counter to collect number of the movement 
                                                  // happens in the given direction 
                            group      : null      
                        };
                        this.touches[tt.identifier] = nt;
                        this.queue.push(nt);
                    }
                }

                // initiate timer to send collected new touch events 
                // if any new has appeared. the timer helps to collect 
                // events in one group  
                if (this.queue.length > 0 && this.timer == null) {
                    var $this = this;
                    this.timer = setTimeout(function() {
                        $this.Q(); // flush queue 
                        $this.timer = null;
                    }, 25);
                }
            };

            this.end = function(e) {
                //  remove timer if it has not been started yet
                if (this.timer != null) {
                    clearTimeout(this.timer);
                    this.timer = null;
                }

                //clear queue
                this.Q();

                // update touches
                var t = e.changedTouches;
                for (var i = 0; i < t.length; i++) {
                    var tt = this.touches[t[i].identifier];
                    if (tt != null) {
                        this.touchCounter--;
                        if (tt.group != null) tt.group.active = false;
                        this.ended(tt);
                        delete this.touches[t[i].identifier];
                    }
                }
            };

            this.Q = function() {
                if (this.queue.length > 1) {
                    // marked all collected touches with one group 
                    for(var i = 0; i < this.queue.length; i++) {
                        var t = this.queue[i];
                        t.group = {
                           size  : this.queue.length, // group size
                           index : i,       
                           active: true  // say it is still touched
                        };
                    }
                }

                if (this.queue.length > 0) {
                    for(var i = 0; i < this.queue.length; i++) {
                        this.started(this.queue[i]);
                    }
                    this.queue.length = 0;
                }
            };

            this[''] = function(element) {
                this.touches = {};
                this.queue   = [];
                this.timer   = null;

                var $this = this;
                element.addEventListener("touchstart",  function(e) {
                    $this.start(e);
                }, false);

                element.addEventListener("touchend", function(e) {
                    $this.end(e);
                    e.preventDefault();
                }, false);

                element.addEventListener("touchmove", function(e) {
                    var mt = e.changedTouches;

                    // clear dx, dy for not updated touches 
                    for(var k in $this.touches) {
                        $this.touches[k].dx = $this.touches[k].dy = 0;
                    }

                    for(var i=0; i < mt.length; i++) {
                        var nmt = mt[i], t = $this.touches[nmt.identifier];

                        if (t != null) {
                            if (t.pageX != nmt.pageX || t.pageY != nmt.pageY) {
                                var dx  = nmt.pageX - t.pageX, 
                                    dy  = nmt.pageY - t.pageY, 
                                    d   = t.direction, gamma = null,
                                    dxs = (dx < 0 && t.dx < 0) || (dx > 0 && t.dx > 0),  // test if horizontal move direction has been changed
                                    dys = (dy < 0 && t.dy < 0) || (dy > 0 && t.dy > 0);  // test if vertical move direction has been changed

                                // update stored touch coordinates with a new one 
                                t.pageX  = nmt.pageX;
                                t.pageY  = nmt.pageY;

                                // we can recognize direction only if move was not too short
                                if ($abs(dx) > 2 || $abs(dy) > 2) {
                                    // compute gamma, this is corner in polar coordinate system
                                    gamma = $atan2(dy, dx);

                                    // using gamma we can figure out direction
                                    if (gamma > -PI4) {
                                        d = (gamma < PI4) ? L.RIGHT : (gamma < PI4_3 ? L.BOTTOM : L.LEFT);
                                    }
                                    else {
                                        d = (gamma > -PI4_3) ? L.TOP : L.LEFT;
                                    }

                                    // to minimize wrong touch effect let's update 
                                    // direction only if move event sequence 
                                    // with identical direction is less than 3
                                    if (t.direction != d) {
                                        if (t.dc < 3) t.direction = d;
                                        t.dc = 0;
                                    }
                                    else {
                                        t.dc++;
                                    }
                                    t.gamma = gamma;
                                }

                                // ignore moved if there still start events that are waiting for to be fired 
                                if ($this.timer == null) {
                                    t.dx = dx;
                                    t.dy = dy;
                                    $this.moved(t);
                                }
                                else {
                                    $this.dc = 0;
                                }
                            }
                        }
                    }    

                    e.preventDefault();
                }, false);
            };
        }
    ]);
})(zebra("ui"));
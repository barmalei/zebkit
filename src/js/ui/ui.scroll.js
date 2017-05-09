zebkit.package("ui", function(pkg, Class) {
    /**
     * Scroll manager class.
     * @param {zebkit.ui.Panel} t a target component to be scrolled
     * @constructor
     * @class zebkit.ui.ScrollManager
     */

     /**
      * Fired when a target component has been scrolled

            scrollManager.on(function(px, py) {
                ...
            });

      * @event scrolled
      * @param  {Integer} px a previous x location target component scroll location
      * @param  {Integer} py a previous y location target component scroll location
      */

     /**
      * Fired when a scroll state has been updated

            scrollManager.scrollStateUpdated = function(x, y, px, py) {
                ...
            };

      * @event scrollStateUpdated
      * @param  {Integer} x a new x location target component scroll location
      * @param  {Integer} y a new y location target component scroll location
      * @param  {Integer} px a previous x location target component scroll location
      * @param  {Integer} py a previous y location target component scroll location
      */
    pkg.ScrollManager = Class(zebkit.EventProducer, [
        function(c) {
            this._  = new this.clazz.Listeners();

            /**
             * Target UI component for that the scroll manager has been instantiated
             * @attribute target
             * @type {zebkit.ui.Panel}
             * @readOnly
             */
            this.target = c;
        },

        function $clazz() {
            this.Listeners = zebkit.util.ListenersClass("scrolled");
        },

        function $prototype() {
            this.sx = this.sy = 0;

            /**
             * Get current target component x scroll location
             * @return {Integer} a x scroll location
             * @method getSX
             */
            this.getSX = function() {
                return this.sx;
            };

            /**
             * Get current target component y scroll location
             * @return {Integer} a y scroll location
             * @method getSY
             */
            this.getSY = function() {
                return this.sy;
            };

            /**
             * Set a target component scroll x location to the
             * specified value
             * @param  {Integer} v a x scroll location
             * @method scrollXTo
             */
            this.scrollXTo = function(v){
                this.scrollTo(v, this.getSY());
            };

            /**
             * Set a target component scroll y location to the
             * specified value
             * @param  {Integer} v a y scroll location
             * @method scrollYTo
             */
            this.scrollYTo = function(v){
                this.scrollTo(this.getSX(), v);
            };

            /**
             * Scroll the target component into the specified location
             * @param  {Integer} x a x location
             * @param  {Integer} y a y location
             * @method scrollTo
             */
            this.scrollTo = function(x, y){
                var psx = this.getSX(),
                    psy = this.getSY();

                if (psx !== x || psy !== y){
                    this.sx = x;
                    this.sy = y;
                    if (typeof this.scrollStateUpdated !== 'undefined') this.scrollStateUpdated(x, y, psx, psy);
                    if (typeof this.target.catchScrolled !== 'undefined') this.target.catchScrolled(psx, psy);
                    this._.scrolled(psx, psy);
                }
                return this;
            };

            /**
             * Make visible the given rectangular area of the
             * scrolled target component
             * @param  {Integer} x a x coordinate of top left corner
             * of the rectangular area
             * @param  {Integer} y a y coordinate of top left corner
             * of the rectangular area
             * @param  {Integer} w a width of the rectangular area
             * @param  {Integer} h a height of the rectangular area
             * @method makeVisible
             * @chainable
             */
            this.makeVisible = function(x,y,w,h){
                var p = pkg.calcOrigin(x, y, w, h, this.getSX(), this.getSY(), this.target);
                this.scrollTo(p[0], p[1]);
                return this;
            };
        }
    ]);

    /**
     * Scroll bar UI component
     * @param {String} [t] orientation of the scroll bar components:

            "vertical" - vertical scroll bar
            "horizontal"- horizontal scroll bar

     * @class zebkit.ui.Scroll
     * @constructor
     * @extends {zebkit.ui.Panel}
     * @uses {zebkit.util.Position.Metric}
     * @uses  {zebkit.util.Position.Metric}
     */
    pkg.Scroll = Class(pkg.Panel, zebkit.util.Position.Metric, [
        function(t) {
            if (arguments.length > 0) {
                this.orient = zebkit.util.$validateValue(t, "vertical", "horizontal");
            }

            /**
             * Increment button
             * @attribute incBt
             * @type {zebkit.ui.Button}
             * @readOnly
             */

            /**
             * Decrement button
             * @attribute decBt
             * @type {zebkit.ui.Button}
             * @readOnly
             */

            /**
             * Scroll bar bundle component
             * @attribute bundle
             * @type {zebkit.ui.Panel}
             * @readOnly
             */

            this.bundleLoc = 0;
            this.startDragLoc = Number.MAX_VALUE;
            this.$super(this);

            var b = (this.orient === "vertical");
            this.add("center", b ? new pkg.Scroll.VBundle()    : new pkg.Scroll.HBundle());
            this.add("top"   , b ? new pkg.Scroll.VDecButton() : new pkg.Scroll.HDecButton());
            this.add("bottom", b ? new pkg.Scroll.VIncButton() : new pkg.Scroll.HIncButton());

            this.setPosition(new zebkit.util.SingleColPosition(this));
        },

        function $clazz() {
            this.isDragable = true;

            this.ArrowButton = Class(pkg.ArrowButton, [
                function $prototype() {
                    this.isFireByPress  = true;
                    this.firePeriod     = 20;
                }
            ]);

            this.VIncButton = Class(this.ArrowButton, []);
            this.VDecButton = Class(this.ArrowButton, []);
            this.HIncButton = Class(this.ArrowButton, []);
            this.HDecButton = Class(this.ArrowButton, []);

            this.VBundle = Class(pkg.Panel, []);
            this.HBundle = Class(pkg.Panel, []);

            this.MIN_BUNDLE_SIZE = 16;
        },

        function $prototype() {
            this.incBt = this.decBt = this.bundle = this.position = null;

            /**
             * Maximal possible value
             * @attribute max
             * @type {Integer}
             * @readOnly
             * @default 100
             */
            this.extra = this.max  = 100;

            /**
             * Page increment value
             * @attribute pageIncrement
             * @type {Integer}
             * @readOnly
             * @default 20
             */
            this.pageIncrement = 20;

            /**
             * Unit increment value
             * @attribute unitIncrement
             * @type {Integer}
             * @readOnly
             * @default 5
             */
            this.unitIncrement = 5;


            this.orient = "vertical";

            /**
             * Evaluate if the given point is in scroll bar bundle element
             * @param  {Integer}  x a x location
             * @param  {Integer}  y a y location
             * @return {Boolean}   true if the point is located inside the
             * scroll bar bundle element
             * @method isInBundle
             */
            this.isInBundle = function(x,y){
                var bn = this.bundle;
                return (bn !== null &&
                        bn.isVisible === true &&
                        bn.x <= x && bn.y <= y &&
                        bn.x + bn.width > x &&
                        bn.y + bn.height > y);
            };

            this.amount = function(){
                var db = this.decBt;
                return (this.orient === "vertical") ? this.incBt.y - db.y - db.height
                                                  : this.incBt.x - db.x - db.width;
            };

            this.pixel2value = function(p) {
                var db = this.decBt;
                return (this.orient === "vertical") ? Math.floor((this.max * (p - db.y - db.height)) / (this.amount() - this.bundle.height))
                                                    : Math.floor((this.max * (p - db.x - db.width )) / (this.amount() - this.bundle.width));
            };

            this.value2pixel = function(){
                var db = this.decBt, bn = this.bundle, off = this.position.offset;
                return (this.orient === "vertical") ? db.y + db.height +  Math.floor(((this.amount() - bn.height) * off) / this.max)
                                                    : db.x + db.width  +  Math.floor(((this.amount() - bn.width) * off) / this.max);
            };


            /**
             * Define composite component catch input method
             * @param  {zebkit.ui.Panel} child a children component
             * @return {Boolean} true if the given children component has to be input events transparent
             * @method catchInput
             */
            this.catchInput = function (child){
                return child === this.bundle || (this.bundle.kids.length > 0 &&
                                                 zebkit.layout.isAncestorOf(this.bundle, child));
            };

            this.posChanged = function(target,po,pl,pc){
                if (this.bundle !== null) {
                    if (this.orient === "horizontal") {
                        this.bundle.setLocation(this.value2pixel(), this.getTop());
                    } else {
                        this.bundle.setLocation(this.getLeft(), this.value2pixel());
                    }
                }
            };

            this.getLines     = function ()     { return this.max; };
            this.getLineSize  = function (line) { return 1; };
            this.getMaxOffset = function ()     { return this.max; };

            this.fired = function(src){
                this.position.setOffset(this.position.offset + ((src === this.incBt) ? this.unitIncrement
                                                                                     : -this.unitIncrement));
            };

            /**
             * Define pointer dragged events handler
             * @param  {zebkit.ui.PointerEvent} e a pointer event
             * @method pointerDragged
             */
            this.pointerDragged = function(e){
                if (Number.MAX_VALUE !== this.startDragLoc) {
                    this.position.setOffset(this.pixel2value(this.bundleLoc -
                                                             this.startDragLoc +
                                                             ((this.orient === "horizontal") ? e.x : e.y)));
                }
            };

            /**
             * Define pointer drag started  events handler
             * @param  {zebkit.ui.PointerEvent} e a pointer event
             * @method pointerDragStarted
             */
            this.pointerDragStarted = function (e){
                if (this.isDragable === true && this.isInBundle(e.x, e.y)) {
                    this.startDragLoc = this.orient === "horizontal" ? e.x : e.y;
                    this.bundleLoc    = this.orient === "horizontal" ? this.bundle.x : this.bundle.y;
                }
            };

            /**
             * Define pointer drag ended events handler
             * @param  {zebkit.ui.PointerEvent} e a pointer event
             * @method pointerDragEnded
             */
            this.pointerDragEnded = function(e) {
                this.startDragLoc = Number.MAX_VALUE;
            };

            /**
             * Define pointer clicked events handler
             * @param  {zebkit.ui.PointerEvent} e a pointer event
             * @method pointerClicked
             */
            this.pointerClicked = function (e){
                if (this.isInBundle(e.x, e.y) === false && e.isAction()){
                    var d = this.pageIncrement;
                    if (this.orient === "vertical"){
                        if (e.y < (this.bundle !== null ? this.bundle.y : Math.floor(this.height / 2))) d =  -d;
                    } else {
                        if (e.x < (this.bundle !== null ? this.bundle.x : Math.floor(this.width / 2))) d =  -d;
                    }
                    this.position.setOffset(this.position.offset + d);
                }
            };

            this.calcPreferredSize = function (target){
                var ps1 = pkg.$getPS(this.incBt),
                    ps2 = pkg.$getPS(this.decBt),
                    ps3 = pkg.$getPS(this.bundle);

                if (this.orient === "horizontal"){
                    ps1.width += (ps2.width + ps3.width);
                    ps1.height = Math.max((ps1.height > ps2.height ? ps1.height : ps2.height), ps3.height);
                } else {
                    ps1.height += (ps2.height + ps3.height);
                    ps1.width = Math.max((ps1.width > ps2.width ? ps1.width : ps2.width), ps3.width);
                }
                return ps1;
            };

            this.doLayout = function(target){
                var right  = this.getRight(),
                    top    = this.getTop(),
                    bottom = this.getBottom(),
                    left   = this.getLeft(),
                    ew     = this.width - left - right,
                    eh     = this.height - top - bottom,
                    b      = (this.orient === "horizontal"),
                    ps1    = pkg.$getPS(this.decBt),
                    ps2    = pkg.$getPS(this.incBt),
                    minbs  = this.clazz.MIN_BUNDLE_SIZE;

                this.decBt.setBounds(left, top, b ? ps1.width
                                                  : ew,
                                                b ? eh
                                                  : ps1.height);


                this.incBt.setBounds(b ? this.width - right - ps2.width : left,
                                     b ? top : this.height - bottom - ps2.height,
                                     b ? ps2.width : ew,
                                     b ? eh : ps2.height);

                if (this.bundle !== null && this.bundle.isVisible === true){
                    var am = this.amount();
                    if (am > minbs) {
                        var bsize = Math.max(Math.min(Math.floor((this.extra * am) / this.max), am - minbs), minbs);
                        this.bundle.setBounds(b ? this.value2pixel() : left,
                                              b ? top   : this.value2pixel(),
                                              b ? bsize : ew,
                                              b ? eh    : bsize);
                    } else {
                        this.bundle.setSize(0, 0);
                    }
                }
            };

            /**
             * Set the specified maximum value of the scroll bar component
             * @param {Integer} m a maximum value
             * @method setMaximum
             * @chainable
             */
            this.setMaximum = function (m){
                if (m !== this.max) {
                    this.max = m;
                    if (this.position.offset > this.max) {
                        this.position.setOffset(this.max);
                    }
                    this.vrp();
                }
                return this;
            };

            /**
             * Set the scroll bar value.
             * @param {Integer} v a scroll bar value.
             * @method setValue
             * @chainable
             */
            this.setValue = function(v){
                this.position.setOffset(v);
                return this;
            };

            this.setPosition = function(p){
                if (p !== this.position){
                    if (this.position !== null) this.position.off(this);
                    this.position = p;

                    if (this.position !== null){
                        this.position.on(this);
                        this.position.setMetric(this);
                        this.position.setOffset(0);
                    }
                }
                return this;
            };

            this.setExtraSize = function(e){
                if (e !== this.extra){
                    this.extra = e;
                    this.vrp();
                }
                return this;
            };
        },

        function kidAdded(index,ctr,lw) {
            this.$super(index, ctr, lw);

            if ("center" === ctr) {
                this.bundle = lw;
            } else if ("bottom" === ctr) {
                this.incBt = lw;
                this.incBt.on(this);
            } else if ("top" === ctr) {
                this.decBt = lw;
                this.decBt.on(this);
            } else {
                throw new Error("Invalid constraints : " + ctr);
            }
        },

        function kidRemoved(index,lw) {
            this.$super(index, lw);
            if (lw === this.bundle) {
                this.bundle = null;
            } else if (lw === this.incBt) {
                this.incBt.off(this);
                this.incBt = null;
            } else if (lw === this.decBt) {
                this.decBt.off(this);
                this.decBt = null;
            }
        }
    ]);

    /**
     * Scroll UI panel. The component is used to manage scrolling for a children UI component
     * that occupies more space than it is available. The usage is very simple, just put an
     * component you want to scroll horizontally or/and vertically in the scroll panel:

            // scroll vertically and horizontally a large picture
            var scrollPan = new zebkit.ui.ScrollPan(new zebkit.ui.ImagePan("largePicture.jpg"));

            // scroll vertically  a large picture
            var scrollPan = new zebkit.ui.ScrollPan(new zebkit.ui.ImagePan("largePicture.jpg"),
                                                   "vertical");

            // scroll horizontally a large picture
            var scrollPan = new zebkit.ui.ScrollPan(new zebkit.ui.ImagePan("largePicture.jpg"),
                                                   "horizontal");



     * @param {zebkit.ui.Panel} [c] an UI component that has to be placed into scroll panel
     * @param {String} [scrolls] a scroll bars that have to be shown. Use "vertical", "horizontal"
     * or "both" string value to control scroll bars visibility. By default the value is "both"
     * @constructor
     * @param {Boolean} [autoHide] a boolean value that says if the scrollbars have to work in
     * auto hide mode. Pass true to switch scrollbars in auto hide mode. By default the value is
     * false
     * @class zebkit.ui.ScrollPan
     * @extends {zebkit.ui.Panel}
     */
    pkg.ScrollPan = Class(pkg.Panel, [
        function (c, scrolls, autoHide) {
            if (arguments.length < 2)  {
                scrolls = "both";
            }

            /**
             * Vertical scroll bar component
             * @attribute vBar
             * @type {zebkit.ui.Scroll}
             * @readOnly
             */

            /**
             * Horizontal scroll bar component
             * @attribute hBar
             * @type {zebkit.ui.Scroll}
             * @readOnly
             */

            /**
             * Scrollable target component
             * @attribute scrollObj
             * @type {zebkit.ui.Panel}
             * @readOnly
             */

            this.$isPosChangedLocked = false;
            this.$super();

            if (arguments.length > 0 && c !== null) {
                this.add("center", c);
            }

            if (arguments.length < 2 || scrolls === "both" || scrolls === "horizontal") {
                this.add("bottom", new pkg.Scroll("horizontal"));
            }

            if (arguments.length < 2 || scrolls === "both" || scrolls === "vertical") {
                this.add("right", new pkg.Scroll("vertical"));
            }

            if (arguments.length > 2) {
                this.setAutoHide(autoHide);
            }
        },

        function $clazz() {
            this.ContentPanLayout = Class(zebkit.layout.Layout, [
                function $prototype() {
                    this.calcPreferredSize = function(t) {
                        return t.kids[0].getPreferredSize();
                    };

                    this.doLayout = function(t) {
                        var kid = t.kids[0];
                        if (kid.constraints === "stretch") {
                            var ps = kid.getPreferredSize(),
                                w  = t.parent.hBar !== null ? ps.width : t.width,
                                h  = t.parent.vBar !== null ? ps.height : t.height;
                            kid.setSize(w, h);
                        } else {
                            kid.toPreferredSize();
                        }
                    };
                }
            ]);

            var SM = this.ContentPanScrollManager = Class(pkg.ScrollManager, [
                function $prototype() {
                    this.getSX = function() {
                        return this.target.x;
                    };

                    this.getSY = function() {
                        return this.target.y;
                    };

                    this.scrollStateUpdated = function(sx,sy,psx,psy) {
                        this.target.setLocation(sx, sy);
                    };
                }
            ]);

            var contentPanLayout = new this.ContentPanLayout();
            this.ContentPan = Class(pkg.Panel, [
                function(c) {
                    this.$super(contentPanLayout);
                    this.scrollManager = new SM(c);
                    this.add(c);
                }
            ]);
        },

        function $prototype() {
            this.hBar = this.vBar = this.scrollObj = null;

            /**
             * Indicate if the scroll bars should be hidden
             * when they are not active
             * @attribute autoHide
             * @type {Boolean}
             * @readOnly
             */
            this.autoHide  = false;

            this.$interval = 0;

            /**
             * Set the given auto hide state.
             * @param  {Boolean} b an auto hide state.
             * @method setAutoHide
             * @chainable
             */
            this.setAutoHide = function(b) {
                if (this.autoHide !== b) {
                    this.autoHide = b;
                    if (this.hBar !== null) {
                        if (this.hBar.incBt !== null) this.hBar.incBt.setVisible(b === false);
                        if (this.hBar.decBt !== null) this.hBar.decBt.setVisible(b === false);
                        if (b === true) {
                            this.hBar.toBack();
                        } else {
                            this.hBar.toFront();
                        }
                    }

                    if (this.vBar !== null) {
                        if (this.vBar.incBt !== null) this.vBar.incBt.setVisible(b === false);
                        if (this.vBar.decBt !== null) this.vBar.decBt.setVisible(b === false);
                        if (b === true) {
                            this.vBar.toBack();
                        } else {
                            this.vBar.toFront();
                        }
                    }

                    if (this.$interval !== 0) {
                        zebkit.environment.clearInterval(this.$interval);
                        $this.$interval = 0;
                    }

                    this.vrp();
                }
                return this;
            };

            /**
             * Scroll horizontally and vertically to the given positions
             * @param  {Integer} sx a horizontal position
             * @param  {Integer} sy a vertical position
             * @method scrollTo
             */
            this.scrollTo = function(sx, sy) {
                this.scrollObj.scrollManager.scrollTo(sx, sy);
            };

            /**
             * Scroll horizontally
             * @param  {Integer} sx a position
             * @method scrollXTo
             */
            this.scrollXTo = function(sx) {
                this.scrollObj.scrollManager.scrollXTo(sx);
            };

            /**
             * Scroll vertically
             * @param  {Integer} sy a position
             * @method scrollYTo
             */
            this.scrollYTo = function(sx, sy) {
                this.scrollObj.scrollManager.scrollYTo(sy);
            };

            this.doScroll = function(dx, dy, source) {
                var b = false, v = 0;

                if (dy !== 0 && this.vBar !== null && this.vBar.isVisible === true) {
                    v =  this.vBar.position.offset + dy;
                    if (v >= 0) this.vBar.position.setOffset(v);
                    else        this.vBar.position.setOffset(0);
                    b = true;
                }

                if (dx !== 0 && this.hBar !== null && this.hBar.isVisible === true) {
                    v =  this.hBar.position.offset + dx;
                    if (v >= 0) this.hBar.position.setOffset(v);
                    else        this.hBar.position.setOffset(0);
                    b = true;
                }

                return b;
            };

            /**
             * Scroll manager listener method that is called every time
             * a target component has been scrolled
             * @param  {Integer} psx previous scroll x location
             * @param  {Integer} psy previous scroll y location
             * @method  scrolled
             */
            this.scrolled = function (psx,psy){
                this.validate();
                try {
                    this.$isPosChangedLocked = true;

                    if (this.hBar !== null) {
                        this.hBar.position.setOffset( -this.scrollObj.scrollManager.getSX());
                    }

                    if (this.vBar !== null) {
                        this.vBar.position.setOffset( -this.scrollObj.scrollManager.getSY());
                    }

                    if (this.scrollObj.scrollManager == null) this.invalidate();

                    this.$isPosChangedLocked = false;
                } catch(e) { this.$isPosChangedLocked = false; throw e; }
            };

            this.calcPreferredSize = function (target){
                return pkg.$getPS(this.scrollObj);
            };

            this.doLayout = function (target){
                var sman   = (this.scrollObj === null) ? null : this.scrollObj.scrollManager,
                    right  = this.getRight(),
                    top    = this.getTop(),
                    bottom = this.getBottom(),
                    left   = this.getLeft(),
                    ww     = this.width  - left - right,  maxH = ww,
                    hh     = this.height - top  - bottom, maxV = hh,
                    so     = this.scrollObj.getPreferredSize(),
                    vps    = this.vBar === null ? { width:0, height:0 } : this.vBar.getPreferredSize(),
                    hps    = this.hBar === null ? { width:0, height:0 } : this.hBar.getPreferredSize();

                // compensate scrolled vertical size by reduction of horizontal bar height if necessary
                // autoHidded scrollbars don't have an influence to layout
                if (this.hBar !== null && this.autoHide === false &&
                      (so.width  > ww ||
                      (so.height > hh && so.width > (ww - vps.width))))
                {
                    maxV -= hps.height;
                }
                maxV = so.height > maxV ? (so.height - maxV) :  -1;

                // compensate scrolled horizontal size by reduction of vertical bar width if necessary
                // autoHidded scrollbars don't have an influence to layout
                if (this.vBar !== null && this.autoHide === false &&
                      (so.height > hh ||
                      (so.width > ww && so.height > (hh - hps.height))))
                {
                    maxH -= vps.width;
                }
                maxH = so.width > maxH ? (so.width - maxH) :  -1;

                var sy = sman.getSY(), sx = sman.getSX();
                if (this.vBar !== null) {
                    if (maxV < 0) {
                        if (this.vBar.isVisible === true){
                            this.vBar.setVisible(false);
                            sman.scrollTo(sx, 0);
                            this.vBar.position.setOffset(0);
                        }
                        sy = 0;
                    } else {
                        this.vBar.setVisible(true);
                    }
                }

                if (this.hBar !== null){
                    if (maxH < 0){
                        if (this.hBar.isVisible === true){
                            this.hBar.setVisible(false);
                            sman.scrollTo(0, sy);
                            this.hBar.position.setOffset(0);
                        }
                    } else {
                        this.hBar.setVisible(true);
                    }
                }

                if (this.scrollObj.isVisible === true) {
                    this.scrollObj.setBounds(left, top,
                                             ww - (this.autoHide === false && this.vBar !== null && this.vBar.isVisible === true ? vps.width  : 0),
                                             hh - (this.autoHide === false && this.hBar !== null && this.hBar.isVisible === true ? hps.height : 0));
                }

                if (this.$interval === 0 && this.autoHide === true) {
                    hps.height = vps.width = 0;
                }

                if (this.hBar !== null && this.hBar.isVisible === true){
                    this.hBar.setBounds(left, this.height - bottom - hps.height,
                                        ww - (this.vBar !== null && this.vBar.isVisible === true ? vps.width : 0),
                                        hps.height);
                    this.hBar.setMaximum(maxH);
                }

                if (this.vBar !== null && this.vBar.isVisible === true){
                    this.vBar.setBounds(this.width - right - vps.width, top,
                                        vps.width,
                                        hh -  (this.hBar !== null && this.hBar.isVisible === true ? hps.height : 0));
                    this.vBar.setMaximum(maxV);
                }
            };

            this.posChanged = function (target,prevOffset,prevLine,prevCol){
                if (this.$isPosChangedLocked === false) {
                    //  show if necessary hidden scroll bar(s)
                    if (this.autoHide === true) {
                        // make sure autohide thread has not been initiated and make sure it makes sense
                        // to initiate the thread (one of the scroll bar has to be visible)
                        if (this.$interval === 0 && ((this.vBar !== null && this.vBar.isVisible === true) ||
                                                     (this.hBar !== null && this.hBar.isVisible === true)    ))
                        {
                            var $this = this;

                            // show scroll bar(s)
                            if (this.vBar !== null) this.vBar.toFront();
                            if (this.hBar !== null) this.hBar.toFront();
                            this.vrp();

                            // pointer move should keep scroll bars visible and pointer entered exited
                            // events have to be caught to track if pointer cursor is on a scroll
                            // bar. add temporary listeners
                            $this.$hiddingCounter = 2;
                            $this.$targetBar      = null;
                            var listener = pkg.events.on({
                                pointerMoved: function(e) {
                                    $this.$hiddingCounter = 1;
                                },

                                pointerExited: function(e) {
                                    $this.$targetBar = null;
                                },

                                pointerEntered: function(e) {
                                    if (e.source === $this.vBar) {
                                        $this.$targetBar = $this.vBar;
                                    } else {
                                        if (e.source === $this.hBar) {
                                            $this.$targetBar = $this.hBar;
                                            return;
                                        }

                                        $this.$targetBar = null;
                                    }
                                }
                            });

                            // start thread to autohide shown scroll bar(s)
                            this.$interval = zebkit.environment.setInterval(function() {
                                if ($this.$hiddingCounter-- === 0 && $this.$targetBar === null) {
                                    zebkit.environment.clearInterval($this.$interval);
                                    $this.$interval = 0;
                                    pkg.events.off(listener);
                                    $this.doLayout();
                                }
                            }, 500);
                        }
                    }

                    if (this.vBar !== null && this.vBar.position === target) {
                        this.scrollObj.scrollManager.scrollYTo(-this.vBar.position.offset);
                    } else if (this.hBar !== null && this.hBar.position === target) {
                        this.scrollObj.scrollManager.scrollXTo(-this.hBar.position.offset);
                    }
                }
            };

            this.setIncrements = function (hUnit,hPage,vUnit,vPage) {
                if (this.hBar !== null){
                    if (hUnit !==  -1) this.hBar.unitIncrement = hUnit;
                    if (hPage !==  -1) this.hBar.pageIncrement = hPage;
                }

                if (this.vBar !== null){
                    if (vUnit !==  -1) this.vBar.unitIncrement = vUnit;
                    if (vPage !==  -1) this.vBar.pageIncrement = vPage;
                }
                return this;
            };
        },

        function insert(i,ctr,c) {
            if ("center" === ctr) {
                if (c.scrollManager == null) {
                    c = new this.clazz.ContentPan(c);
                }

                this.scrollObj = c;
                c.scrollManager.on(this);
            } else {
                if ("bottom" === ctr || "top" === ctr){
                    this.hBar = c;
                } else if ("left" === ctr || "right" === ctr) {
                    this.vBar = c;
                } else {
                    throw new Error("Invalid constraints");
                }

                // valid for scroll bar only
                if (c.incBt !== null) c.incBt.setVisible(!this.autoHide);
                if (c.decBt !== null) c.decBt.setVisible(!this.autoHide);
                c.position.on(this);
            }

            return this.$super(i, ctr, c);
        },

        function kidRemoved(index, comp){
            this.$super(index, comp);
            if (comp === this.scrollObj){
                this.scrollObj.scrollManager.off(this);
                this.scrollObj = null;
            } else if (comp === this.hBar) {
                this.hBar.position.off(this);
                this.hBar = null;
            } else if (comp === this.vBar) {
                this.vBar.position.off(this);
                this.vBar = null;
            }
        }
    ]);

    /**
     * Mobile scroll manager class. Implements inertial scrolling in zebkit mobile application.
     * @class zebkit.ui.MobileScrollMan
     * @extends zebkit.ui.Manager
     * @constructor
     */
    pkg.MobileScrollMan = Class(pkg.Manager, [
        function $prototype() {
            this.$timer = this.identifier = this.target = null;

            /**
             * Define pointer drag started events handler.
             * @param  {zebkit.ui.PointerEvent} e a pointer event
             * @method pointerDragStarted
             */
            this.pointerDragStarted = function(e) {
                if (e.touchCounter === 1 && e.pointerType === "touch") {
                    this.$identifier = e.identifier;
                    this.$target     = e.source;

                    // detect scrollable component
                    while (this.$target !== null && typeof this.$target.doScroll === 'undefined') {
                        this.$target = this.$target.parent;
                    }

                    if (this.$target !== null && typeof this.$target.pointerDragged !== 'undefined') {
                         this.$target = null;
                    }
                }
            };

            /**
             * Define pointer dragged events handler.
             * @param  {zebkit.ui.PointerEvent} e a pointer event
             * @method pointerDragged
             */
            this.pointerDragged = function(e) {
                if (e.touchCounter   === 1            &&
                    this.$target    !==  null         &&
                    this.$identifier === e.identifier &&
                    e.direction     !==  null            )
                {
                    this.$target.doScroll(-e.dx, -e.dy, "touch");
                }
            };

            this.$taskMethod = function() {
                var bar = this.$target.vBar,
                    o   = bar.position.offset;

                // this is linear function with angel 42. every next value will
                // be slightly lower prev. one. theoretically angel 45 should
                // bring to infinite scrolling :)
                this.$dt = Math.tan(42 * Math.PI / 180) * this.$dt;
                bar.position.setOffset(o - Math.round(this.$dt));
                this.$counter++;

                if (o === bar.position.offset) {
                    this.$target = null;
                    zebkit.environment.clearInterval(this.$timer);
                    this.$timer = null;
                }
            };

            /**
             * Define pointer drag ended events handler.
             * @param  {zebkit.ui.PointerEvent} e a pointer event
             * @method pointerDragEnded
             */
            this.pointerDragEnded = function(e) {
                if (this.$target !== null &&
                    this.$timer  === null  &&
                    this.$identifier === e.identifier &&
                    (e.direction === "bottom" || e.direction === "top") &&
                    this.$target.vBar !== null &&
                    this.$target.vBar.isVisible &&
                    e.dy !== 0)
                {
                    this.$dt = 2 * e.dy;
                    this.$counter = 0;
                    var $this = this;
                    this.$timer = zebkit.environment.setInterval(function() {
                        $this.$taskMethod($this);
                    }, 50);
                }
            };

            /**
             * Define pointer pressed events handler.
             * @param  {zebkit.ui.PointerEvent} e a pointer event
             * @method pointerPressed
             */
            this.pointerPressed = function(e) {
                if (this.$timer !== null) {
                    zebkit.environment.clearInterval(this.$timer);
                    this.$timer = null;
                }
                this.$target = null;
            };
        }
    ]);
});
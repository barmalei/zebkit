zebkit.package("ui.web", function(pkg, Class) {
    // TODO: dependencies to remove
    //     -- taskSets (util.js)

    pkg.CanvasEvent = Class(zebkit.util.Event, []);

    var ui = pkg.cd(".."),
        COMP_EVENT = new ui.CompEvent();

    // keep pointer owners (the component where cursor/finger placed in)
    pkg.$pointerOwner        = {};
    pkg.$pointerPressedOwner = {};

    /**
     *  zCanvas zebkit UI component class. This is starting point for building zebkit UI. The class is a wrapper
     *  for HTML5 Canvas element. The main goals of the class is catching all native HTML5 Canvas element  events
     *  and translating its into Zebkit UI events.
     *
     *  zCanvas instantiation can trigger a new HTML Canvas will be created and added to HTML DOM tree.
     *  It happens if developer doesn't pass an HTML Canvas element reference or an ID of existing HTML
     *  Canvas element. To re-use an existent in DOM tree HTML5 canvas element pass an id of the canvas
     *  element:

            // a new HTML canvas element is created and added into HTML DOM tree
            var canvas = zebkit.ui.zCanvas();

            // a new HTML canvas element is created into HTML DOM tree
            var canvas = zebkit.ui.zCanvas(400,500);  // pass canvas size

            // stick to existent HTML canvas element
            var canvas = zebkit.ui.zCanvas("ExistentCanvasID");

     *  zCanvas has layered structure. Every layer is responsible for showing and controlling a dedicated
     *  type of UI elements like windows pop-up menus, tool tips and so on. To start building UI use root layer.
     *  The layer is standard zebkit UI panel that is accessible via "root" zCanvas field:

            // create canvas
            var canvas = zebkit.ui.zCanvas(400,500);

            // save reference to canvas root layer where
            // hierarchy of UI components have to be hosted
            var root = canvas.root;

            // fill root with UI components
            var label = new zebkit.ui.Label("Label");
            label.setBounds(10,10,100,50);
            root.add(label);

     *  @class zebkit.ui.zCanvas
     *  @extends {zebkit.ui.web.HtmlCanvas}
     *  @constructor
     *  @param {String|Canvas} [element] an ID of a HTML canvas element or reference to an HTML Canvas element.
     *  @param {Integer} [width] a width of an HTML canvas element
     *  @param {Integer} [height] a height of an HTML canvas element
     */

    /**
     * Implement the event handler method  to catch canvas initialized event. The event is triggered once the
     * canvas has been initiated and all properties listeners of the canvas are set upped. The event can be
     * used to load saved data.

         var p = new zebkit.ui.zCanvas(300, 300, [
              function canvasInitialized() {
                  // do something
              }
         ]);

     * @event  canvasInitialized
     */
    ui.zCanvas = pkg.zCanvas = Class(pkg.HtmlCanvas, [
        function(element, w, h) {
            // no arguments
            if (arguments.length === 0) {
                w = 400;
                h = 400;
                element = null;
            } else if (arguments.length === 1) {
                w = -1;
                h = -1;
            } else if (arguments.length === 2) {
                h = w;
                w = element;
                element = null;
            }

            // if passed element is string than consider it as
            // an ID of an element that is already in DOM tree
            if (element !== null && zebkit.isString(element)) {
                var id = element;
                element = document.getElementById(id);

                // no canvas can be detected
                if (element === null) {
                    throw new Error("Canvas id='" + id + "' element cannot be found");
                }
            }

            /**
             * Dictionary to track layers by its ids.
             * @attribute $layers
             * @private
             * @type {Object}
             */
            this.$layers = {};

            this.$super(element);


            // since zCanvas is top level element it doesn't have to have
            // absolute position
            this.$container.style.position = "relative";

            // let canvas zCanvas listen WEB event
            this.$container.style["pointer-events"] = "auto";

            // if canvas is not yet part of HTML let's attach it to
            // body.
            if (this.$container.parentNode === null) {
                document.body.appendChild(this.$container);
            }

            // force canvas to have a focus
            if (this.element.getAttribute("tabindex") === null) {
                this.element.setAttribute("tabindex", "1");
            }

            if (w < 0) w = this.element.offsetWidth;
            if (h < 0) h = this.element.offsetHeight;

            // !!!
            // save canvas in list of created Zebkit canvases
            // do it before calling setSize(w,h) method
            this.clazz.$canvases.push(this);

            this.setSize(w, h);

            // sync canvas visibility with what canvas style says
            var cvis = (this.element.style.visibility === "hidden" ? false : true);
            if (this.isVisible !== cvis) {
                this.setVisible(cvis);
            }

            // call event method if it is defined
            if (typeof this.canvasInitialized !== 'undefined') {
                this.canvasInitialized();
            }

            var $this = this;

            // this method should clean focus if
            // one of of a child DOM element gets focus
            zebkit.web.$focusin(this.$container, function(e) {
                // TODO: fix and uncomment
                // if (e.target !== $this.$container &&
                //     e.target.parentNode !== null &&
                //     e.target.parentNode.getAttribute("data-zebcont") === null) // TODO: BUG, data-zebcont is not set anymore, use $canvases instead
                // {
                //     ui.focusManager.requestFocus(null);
                // } else {
                //     // clear focus if a focus owner component is hosted with another zCanvas
                //     if (e.target === $this.$container &&
                //         ui.focusManager.focusOwner !== null &&
                //         ui.focusManager.focusOwner.getCanvas() !== $this)
                //     {
                //         ui.focusManager.requestFocus(null);
                //     }
                // }
            }, true);
        },

        function $clazz () {
            this.CLASS_NAME = "zebcanvas";
            this.$canvases  = [];

            this.$getCanvasByElement = function(e) {
                for (var i = 0; i < this.$canvases.length; i++) {
                    if (this.$canvases[i] === e) {
                        return this.$canvases[i];
                    }
                }
                return null;
            };
        },

        function $prototype() {
            /**
             * Indicates this the root canvas element
             * @attribute $isRootCanvas
             * @type {Boolean}
             * @private
             * @default true
             * @readOnly
             */
            this.$isRootCanvas = true;

            /**
             * Indicate if the canvas has to be stretched to fill the whole view port area.
             * @type {Boolean}
             * @attribute isSizeFull
             * @readOnly
             */
            this.isSizeFull = false;


            this.offx = this.offy = 0;

            /**
             * Transforms the pageX coordinate into relatively to the canvas origin
             * coordinate taking in account the canvas transformation
             * @param  {Number} pageX a pageX coordinate
             * @param  {Number} pageY a pageY coordinate
             * @return {Integer} an x coordinate that is relative to the canvas origin
             * @method $toElementX
             * @protected
             */
            this.$toElementX = function(pageX, pageY) {
                // offset has to be added here since "calcOffset" can called (for instance page reloading)
                // to early
                pageX -= (this.offx);
                pageY -= (this.offy);

                var c = this.$context.$states[this.$context.$curState];
                return ((c.sx !== 1 || c.sy !== 1 || c.rotateVal !== 0) ? Math.round((c.crot * pageX + pageY * c.srot)/c.sx)
                                                                        : pageX) - c.dx;
            };

            /**
             * Transforms the pageY coordinate into relatively to the canvas origin
             * coordinate taking in account the canvas transformation
             * @param  {Number} pageX a pageX coordinate
             * @param  {Number} pageY a pageY coordinate
             * @return {Integer} an y coordinate that is relative to the canvas origin
             * @method $toElementY
             * @protected
             */
            this.$toElementY = function(pageX, pageY) {
                // offset has to be added here since "calcOffset" can called (for instance page reloading)
                // to early
                pageX -= (this.offx);
                pageY -= (this.offy);

                var c = this.$context.$states[this.$context.$curState];
                return ((c.sx !== 1 || c.sy !== 1 || c.rotateVal !== 0) ? Math.round((pageY * c.crot - c.srot * pageX)/c.sy)
                                                                        : pageY) - c.dy;
            };

            this.load = function(jsonPath){
                return this.root.load(jsonPath);
            };

            // TODO: may be rename to dedicated method $doWheelScroll
            this.$doScroll = function(dx, dy, src) {
                if (src === "wheel" && pkg.$pointerOwner.mouse != null) {
                    var owner = pkg.$pointerOwner.mouse;
                    while (owner !== null && typeof owner.doScroll === 'undefined') {
                        owner = owner.parent;
                    }

                    if (owner !== null) {
                        return owner.doScroll(dx, dy, src);
                    }
                }
                return false;
            };

            /**
             * Catches key typed events, adjusts and distributes it to UI hierarchy
             * @param  {zebkit.ui.KeyEvent} e an event
             * @private
             * @method $keyTyped
             * @return {Boolean}  true if the event has been processed
             */
            this.$keyTyped = function(e) {
                if (ui.focusManager.focusOwner !== null) {
                    e.source = ui.focusManager.focusOwner;
                    return ui.events.fire("keyTyped", e);
                } else {
                    return false;
                }
            };

            /**
             * Catches key pressed events, adjusts and distributes it to UI hierarchy
             * @param  {zebkit.ui.KeyEvent} e an event
             * @private
             * @method $keyPressed
             * @return {Boolean}  true if the event has been processed
             */
            this.$keyPressed = function(e) {
                for(var i = this.kids.length - 1;i >= 0; i--){
                    var l = this.kids[i];
                    if (typeof l.layerKeyPressed !== 'undefined' && l.layerKeyPressed(e) === true) {
                        return true;
                    }
                }

                if (ui.focusManager.focusOwner !== null) {
                    e.source = ui.focusManager.focusOwner;
                    return ui.events.fire("keyPressed", e);
                } else {
                    e.source = this;
                    return ui.events.fire("keyPressed", e);
                }
            };

            /**
             * Catches key released events, adjusts and distributes it to UI hierarchy
             * @param  {zebkit.ui.KeyEvent} e an event
             * @private
             * @method $keyReleased
             * @return {Boolean}  true if the event has been processed
             */
            this.$keyReleased = function(e){
                if (ui.focusManager.focusOwner !== null) {
                    e.source = ui.focusManager.focusOwner;
                    return ui.events.fire("keyReleased", e);
                } else {
                    return false;
                }
            };

            /**
             * Catches pointer entered events, adjusts and distributes it to UI hierarchy
             * @param  {zebkit.ui.PointerEvent} e an event
             * @private
             * @method $pointerEntered
             */
            this.$pointerEntered = function(e) {
                // TODO: review it quick and dirty fix try to track a situation
                //       when the canvas has been moved
                this.recalcOffset();

                var x = this.$toElementX(e.pageX, e.pageY),
                    y = this.$toElementY(e.pageX, e.pageY),
                    d = this.getComponentAt(x, y),
                    o = pkg.$pointerOwner[e.identifier];

                // also correct current component on that  pointer is located
                if (d !== o) {
                    // if pointer owner is not null but doesn't match new owner
                    // generate pointer exit and clean pointer owner
                    if (o != null) {
                        pkg.$pointerOwner[e.identifier] = null;
                        ui.events.fire("pointerExited", e.update(o, x, y));
                    }

                    // if new pointer owner is not null and enabled
                    // generate pointer entered event ans set new pointer owner
                    if (d !== null && d.isEnabled === true){
                        pkg.$pointerOwner[e.identifier] = d;
                        ui.events.fire("pointerEntered", e.update(d, x, y));
                    }
                }
            };

            /**
             * Catches pointer exited events, adjusts and distributes it to UI hierarchy
             * @param  {zebkit.ui.PointerEvent} e an event
             * @private
             * @method $pointerExited
             */
            this.$pointerExited = function(e) {
                var o = pkg.$pointerOwner[e.identifier];
                if (o != null) {
                    pkg.$pointerOwner[e.identifier] = null;
                    return ui.events.fire("pointerExited", e.update(o,
                                                                          this.$toElementX(e.pageX, e.pageY),
                                                                          this.$toElementY(e.pageX, e.pageY)));
                }
            };

            /**
             * Catches pointer moved events, adjusts and distributes it to UI hierarchy.
             * @param  {zebkit.ui.PointerEvent} e an event
             * @private
             * @method $pointerMoved
             */
            this.$pointerMoved = function(e){
                // if a pointer button has not been pressed handle the normal pointer moved event
                var x = this.$toElementX(e.pageX, e.pageY),
                    y = this.$toElementY(e.pageX, e.pageY),
                    d = this.getComponentAt(x, y),
                    o = pkg.$pointerOwner[e.identifier],
                    b = false;

                // check if pointer already inside a component
                if (o != null) {
                    if (d !== o) {
                        pkg.$pointerOwner[e.identifier] = null;
                        b = ui.events.fire("pointerExited", e.update(o, x, y));

                        if (d != null && d.isEnabled === true) {
                            pkg.$pointerOwner[e.identifier] = d;
                            b = ui.events.fire("pointerEntered", e.update(d, x, y)) || b;
                        }
                    } else {
                        if (d !== null && d.isEnabled === true) {
                            b = ui.events.fire("pointerMoved", e.update(d, x, y));
                        }
                    }
                } else {
                    if (d !== null && d.isEnabled === true) {
                        pkg.$pointerOwner[e.identifier] = d;
                        b = ui.events.fire("pointerEntered", e.update(d, x, y));
                    }
                }

                return b;
            };

            /**
             * Catches pointer drag started events, adjusts and distributes it to UI hierarchy.
             * @param  {zebkit.ui.PointerEvent} e an event
             * @private
             * @method $pointerDragStarted
             */
            this.$pointerDragStarted = function(e) {
                var x = this.$toElementX(e.pageX, e.pageY),
                    y = this.$toElementY(e.pageX, e.pageY),
                    d = this.getComponentAt(x, y);

                // if target component can be detected fire pointer start dragging and
                // pointer dragged events to the component
                if (d !== null && d.isEnabled === true) {
                    return ui.events.fire("pointerDragStarted", e.update(d, x, y));
                }

                return false;
            };

            /**
             * Catches pointer dragged events, adjusts and distributes it to UI hierarchy.
             * @param  {zebkit.ui.PointerEvent} e an event
             * @private
             * @method $pointerDragged
             */
            this.$pointerDragged = function(e){
                if (pkg.$pointerOwner[e.identifier] != null) {
                    return ui.events.fire("pointerDragged", e.update(pkg.$pointerOwner[e.identifier],
                                                                           this.$toElementX(e.pageX, e.pageY),
                                                                           this.$toElementY(e.pageX, e.pageY)));
                }

                return false;
            };

            /**
             * Catches pointer drag ended events, adjusts and distributes it to UI hierarchy.
             * @param  {zebkit.ui.PointerEvent} e an event
             * @private
             * @method $pointerDragEnded
             */
            this.$pointerDragEnded = function(e) {
                if (pkg.$pointerOwner[e.identifier] != null) {
                    return ui.events.fire("pointerDragEnded", e.update(pkg.$pointerOwner[e.identifier],
                                                                             this.$toElementX(e.pageX, e.pageY),
                                                                             this.$toElementY(e.pageX, e.pageY)));
                }
                return false;
            };

            this.$isBlockedByLayer = function(id, method, e) {
                // adjust event for passing it to layers
                // e.x = x;
                // e.y = y;

                for(var i = this.kids.length - 1; i >= 0; i--){
                    var layer = this.kids[i];
                    if (typeof layer[method] !== 'undefined') {
                        e.id = id;
                        if (layer[method](e) === true) {
                            return true;
                        }
                    }
                }
                return false;
            };

            /**
             * Catches pointer clicked events, adjusts and distributes it to UI hierarchy.
             * @param  {zebkit.ui.PointerEvent} e an event
             * @private
             * @method $pointerClicked
             */
            this.$pointerClicked = function(e) {
                var x = this.$toElementX(e.pageX, e.pageY),
                    y = this.$toElementY(e.pageX, e.pageY),
                    d = this.getComponentAt(x, y);

                // zoom inn zoom out can bring to a situation
                // d is null, in this case offset should be recalculated
                // TODO: the cause of the issue has to be investigated deeper
                if (d === null) {
                    this.recalcOffset();
                    x = this.$toElementX(e.pageX, e.pageY);
                    y = this.$toElementY(e.pageX, e.pageY);
                    d = this.getComponentAt(x, y);
                }

                if (d !== null) {
                    e = e.update(d, x, y);
                    if (this.$isBlockedByLayer("pointerClicked", "layerPointerClicked", e)) {
                        return true;
                    } else {
                        return ui.events.fire("pointerClicked", e);
                    }
                } else {
                    return false;
                }
            };

            this.$pointerDoubleClicked = function(e) {
                var x = this.$toElementX(e.pageX, e.pageY),
                    y = this.$toElementY(e.pageX, e.pageY),
                    d = this.getComponentAt(x, y);

                return d !== null ? ui.events.fire("pointerDoubleClicked", e.update(d, x, y))
                                  : false;
            };

            /**
             * Catches pointer released events, adjusts and distributes it to UI hierarchy.
             * @param  {zebkit.ui.PointerEvent} e an event
             * @private
             * @method $pointerReleased
             */
            this.$pointerReleased = function(e) {
                var x  = this.$toElementX(e.pageX, e.pageY),
                    y  = this.$toElementY(e.pageX, e.pageY),
                    pp = pkg.$pointerPressedOwner[e.identifier];

                // release pressed state
                if (pp != null) {
                    try {
                        e = e.update(pp, x, y);
                        if (this.$isBlockedByLayer("pointerReleased", "layerPointerReleased", e) !== true) {
                            ui.events.fire("pointerReleased", e);
                        }
                    } finally {
                        delete pkg.$pointerPressedOwner[e.identifier];
                    }
                }

                // mouse released can happen at new location, so move owner has to be corrected
                // and mouse exited entered event has to be generated.
                // the correction takes effect if we have just completed dragging or mouse pressed
                // event target doesn't match pkg.$pointerOwner
                if (e.pointerType === "mouse" && (e.pressPageX !== e.pageX || e.pressPageY !== e.pageY)) {
                    var nd = this.getComponentAt(x, y),
                        po = this.getComponentAt(this.$toElementX(e.pressPageX, e.pressPageY),
                                                 this.$toElementY(e.pressPageX, e.pressPageY));

                    if (nd !== po) {
                        if (po !== null) {
                            pkg.$pointerOwner[e.identifier] = null;
                            ui.events.fire("pointerExited", e.update(po, x, y));
                        }

                        if (nd !== null && nd.isEnabled === true){
                            pkg.$pointerOwner[e.identifier] = nd;
                            ui.events.fire("pointerEntered", e.update(nd, x, y));
                        }
                    }
                }
            };

            /**
             * Catches pointer pressed events, adjusts and distributes it to UI hierarchy.
             * @param  {zebkit.ui.PointerEvent} e an event
             * @private
             * @method $pointerPressed
             */
            this.$pointerPressed = function(e) {
                var x  = this.$toElementX(e.pageX, e.pageY),
                    y  = this.$toElementY(e.pageX, e.pageY),
                    pp = pkg.$pointerPressedOwner[e.identifier];

                // free pointer prev pressed if any
                if (pp != null) {
                    try {
                        ui.events.fire("pointerReleased", e.update(pp, x, y));
                    } finally {
                        delete pkg.$pointerPressedOwner[e.identifier];
                    }
                }

                e.source = null;
                e.x = x;
                e.y = y;
                if (this.$isBlockedByLayer("pointerPressed", "layerPointerPressed", e)) {
                    return true;
                }

                var d = this.getComponentAt(x, y);
                if (d !== null && d.isEnabled === true) {
                    if (pkg.$pointerOwner[e.identifier] !== d) {
                        pkg.$pointerOwner[e.identifier] = d;
                        ui.events.fire("pointerEntered",  e.update(d, x, y));
                    }

                    pkg.$pointerPressedOwner[e.identifier] = d;

                    // TODO: prove the solution (return true) !?
                    if (ui.events.fire("pointerPressed", e.update(d, x, y)) === true) {
                        delete pkg.$pointerPressedOwner[e.identifier];
                        return true;
                    }
                }

                return false;
            };

            this.getComponentAt = function(x, y) {
                for(var i = this.kids.length; --i >= 0; ){
                    var c = this.kids[i].getComponentAt(x, y);
                    if (c !== null) {
                        var p = c;
                        while ((p = p.parent) !== null) {
                            if (typeof p.catchInput !== 'undefined' && (p.catchInput === true || (p.catchInput !== false && p.catchInput(c)))) {
                                c = p;
                            }
                        }
                        return c;
                    }
                }
                return null;
            };

            this.recalcOffset = function() {
                // calculate the DOM element offset relative to window taking in account scrolling
                var poffx = this.offx,
                    poffy = this.offy,
                    ba    = this.$container.getBoundingClientRect();

                this.offx = Math.round(ba.left) + zebkit.web.$measure(this.$container, "border-left-width") +
                                                  zebkit.web.$measure(this.$container, "padding-left") + window.pageXOffset;
                this.offy = Math.round(ba.top) +  zebkit.web.$measure(this.$container, "padding-top" ) +
                                                  zebkit.web.$measure(this.$container, "border-top-width") + window.pageYOffset;

                if (this.offx !== poffx || this.offy !== poffy) {
                    // force to fire component re-located event
                    this.relocated(this, poffx, poffy);
                }
            };

            /**
             * Get the canvas layer by the specified layer ID. Layer is a children component
             * of the canvas UI component. Every layer has an ID assigned to it the method
             * actually allows developers to get the canvas children component by its ID
             * @param  {String} id a layer ID
             * @return {zebkit.ui.Panel} a layer (children) component
             * @method getLayer
             */
            this.getLayer = function(id) {
                return this.$layers[id];
            };

            // override relocated and resized
            // to prevent unnecessary repainting
            this.relocated = function(px,py) {
                COMP_EVENT.source = this;
                COMP_EVENT.px     = px;
                COMP_EVENT.py     = py;
                ui.events.fire("compMoved", COMP_EVENT);
            };

            this.resized = function(pw,ph) {
                COMP_EVENT.source = this;
                COMP_EVENT.prevWidth  = pw;
                COMP_EVENT.prevHeight = ph;
                ui.events.fire("compSized", COMP_EVENT);
                // don't forget repaint it
                this.repaint();
            };

            this.$initListeners = function() {
                // TODO: hard-coded
                new zebkit.web.PointerEventUnifier(this.$container, this);
                new zebkit.web.KeyEventUnifier(this.element, this); // element has to be used since canvas is
                                                             // styled to have focus and get key events
                new zebkit.web.MouseWheelSupport(this.$container, this);
            };

            /**
             * Force the canvas to occupy the all available view port area
             * @param {Boolean} b true to force the canvas be stretched over all
             * available view port area
             * @chainable
             * @method setSizeFull
             */
            this.setSizeFull = function(b) {
                if (this.isSizeFull !== b) {
                    this.isSizeFull = b;

                    if (b === true) {
                        if (zebkit.web.$contains(this.$container) !== true) {
                            throw new Error("zCanvas is not a part of DOM tree");
                        }

                        this.setLocation(0, 0);

                        // adjust body to kill unnecessary gap for inline-block zCanvas element
                        // otherwise body size will be slightly horizontally bigger than visual
                        // viewport height what causes scroller appears
                        document.body.style["font-size"] = "0px";

                        var ws = zebkit.web.$viewPortSize();
                        this.setSize(ws.width, ws.height);
                    }
                }
            };
        },

        function setSize(w, h) {
            if (this.width !== w || h !== this.height) {
                this.$super(w, h);

                // let know to other zebkit canvases that
                // the size of an element on the page has
                // been updated and they have to correct
                // its anchor.
                pkg.$elBoundsUpdated();
            }
            return this;
        },

        function setVisible(b) {
            var prev = this.isVisible;
            this.$super(b);

            // Since zCanvas has no parent component calling the super
            // method above doesn't trigger repainting. So, do it here.
            if (b !== prev) {
                this.repaint();
            }
            return this;
        },

        function vrp() {
            this.$super();
            if (zebkit.web.$contains(this.element) && this.element.style.visibility === "visible") {
                this.repaint();
            }
        },

        function kidAdded(i,constr,c){
            if (this.$layers.hasOwnProperty(c.id)) {
                throw new Error("Layer '" + c.id + "' already exist");
            }

            this.$layers[c.id] = c;
            if (c.id === "root") this.root = c;
            this.$super(i, constr, c);
        },

        function kidRemoved(i, c){
            delete this.$layers[c.id];
            if (c.id === "root") this.root = null;
            this.$super(i, c);
        }
    ]);

    // canvases location has to be corrected if document layout is invalid
    pkg.$elBoundsUpdated = function() {
        for(var i = pkg.zCanvas.$canvases.length - 1; i >= 0; i--) {
            var c = pkg.zCanvas.$canvases[i];
            if (c.isSizeFull === true) {
                //c.setLocation(window.pageXOffset, -window.pageYOffset);

                var ws = zebkit.web.$viewPortSize();

                // browser (mobile) can reduce size of browser window by
                // the area a virtual keyboard occupies. Usually the
                // content scrolls up to the size the VK occupies, so
                // to leave zebkit full screen content in the window
                // with the real size (not reduced) size take in account
                // scrolled metrics
                c.setSize(ws.width  + window.pageXOffset,
                          ws.height + window.pageYOffset);
            }
            c.recalcOffset();
        }
    };

    var $wrt = null, $winSizeUpdated = false, $wpw = -1, $wph = -1;
    window.addEventListener("resize", function(e) {
        var ws = zebkit.web.$viewPortSize();
        if ($wpw !== window.innerWidth || $wph !== window.innerHeight) {
            $wpw = window.innerWidth;
            $wph = window.innerHeight;

            if ($wrt !== null) {
                $winSizeUpdated = true;
            } else {
                $wrt = zebkit.util.tasksSet.run(
                    function() {
                        if ($winSizeUpdated === false) {
                            pkg.$elBoundsUpdated();
                            this.shutdown();
                            $wrt = null;
                        }
                        $winSizeUpdated = false;
                    }, 200, 150
                );
            }
        }
    }, false);

    window.onbeforeunload = function(e) {
        var msgs = [];
        for(var i = pkg.zCanvas.$canvases.length - 1; i >= 0; i--) {
            if (typeof pkg.zCanvas.$canvases[i].saveBeforeLeave !== 'undefined') {
                var m = pkg.zCanvas.$canvases[i].saveBeforeLeave();
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

            if (e) {
                e.returnValue = message;
            }

            return message;
        }
    };

    // TODO: this is depricated events that can have significant impact to
    // page performance. That means it has to be removed and replace with soemting
    // else
    //
    // bunch of handlers to track HTML page metrics update
    // it is necessary since to correct zebkit canvases anchor
    // and track when a canvas has been removed
    document.addEventListener("DOMNodeInserted", function(e) {
        pkg.$elBoundsUpdated();
    }, false);

    document.addEventListener("DOMNodeRemoved", function(e) {
        // remove canvas from list
        for(var i = pkg.zCanvas.$canvases.length - 1; i >= 0; i--) {
            var canvas = pkg.zCanvas.$canvases[i];
            if (zebkit.web.$contains(canvas.element) !== true) {
                pkg.zCanvas.$canvases.splice(i, 1);
                if (typeof canvas.saveBeforeLeave !== 'undefined') {
                    canvas.saveBeforeLeave();
                }
            }
        }

        pkg.$elBoundsUpdated();
    }, false);
});

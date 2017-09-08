zebkit.package("ui.web", function(pkg, Class) {
    var ui = pkg.cd("..");

    /**
     * HTML Canvas native DOM element wrapper.
     * @constructor
     * @param  {HTMLCanvas} [e] HTML canvas element to be wrapped as a zebkit UI
     * component or nothing to create a new canvas element
     * @class zebkit.ui.web.HtmlCanvas
     * @extends zebkit.ui.web.HtmlElement
     */
    pkg.HtmlCanvas = Class(pkg.HtmlElement,  [
        function(e) {
            if (arguments.length > 0 && e !== null && e.tagName !== "CANVAS") {
                throw new Error("Invalid element '" + e + "'");
            }

            /**
             * Keeps rectangular "dirty" area of the canvas component
             * @private
             * @attribute $da
             * @type {Object}
             *       { x:Integer, y:Integer, width:Integer, height:Integer }
             */
            this.$da = { x: 0, y: 0, width: -1, height: 0 };

            this.$super(arguments.length === 0  || e === null ? "canvas" : e);

            // let HTML Canvas be WEB event transparent
            this.$container.style["pointer-events"] = "none";

            // check if this element has been created
            if (arguments.length === 0 || e === null) {
                // prevent canvas selection
                this.element.onselectstart = function() { return false; };
            }
        },

        function $clazz() {
            this.$ContextMethods = {
                reset : function(w, h) {
                    this.$curState = 0;
                    var s = this.$states[0];
                    s.srot = s.rotateVal = s.x = s.y = s.width = s.height = s.dx = s.dy = 0;
                    s.crot = s.sx = s.sy = 1;
                    s.width = w;
                    s.height = h;
                    this.setFont(ui.font);
                    this.setColor("white");
                },

                $init : function() {
                    // pre-allocate canvas save $states stack
                    this.$states = Array(70);
                    for(var i=0; i < this.$states.length; i++) {
                        var s = {};
                        s.srot = s.rotateVal = s.x = s.y = s.width = s.height = s.dx = s.dy = 0;
                        s.crot = s.sx = s.sy = 1;
                        this.$states[i] = s;
                    }
                },

                translate : function(dx, dy) {
                    if (dx !== 0 || dy !== 0) {
                        var c = this.$states[this.$curState];
                        c.x  -= dx;
                        c.y  -= dy;
                        c.dx += dx;
                        c.dy += dy;
                        this.$translate(dx, dy);
                    }
                },

                rotate : function(v) {
                    var c = this.$states[this.$curState];
                    c.rotateVal += v;
                    c.srot = Math.sin(c.rotateVal);
                    c.crot = Math.cos(c.rotateVal);
                    this.$rotate(v);
                },

                scale : function(sx, sy) {
                    var c = this.$states[this.$curState];
                    c.sx = c.sx * sx;
                    c.sy = c.sy * sy;
                    this.$scale(sx, sy);
                },

                save : function() {
                    this.$curState++;
                    var c = this.$states[this.$curState], cc = this.$states[this.$curState - 1];
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

                    this.$save();
                    return this.$curState - 1;
                },

                restoreAll : function() {
                    while(this.$curState > 0) {
                        this.restore();
                    }
                },

                restore : function() {
                    if (this.$curState === 0) {
                        throw new Error("Context restore history is empty");
                    }

                    this.$curState--;
                    this.$restore();
                    return this.$curState;
                },

                clipRect : function(x,y,w,h){
                    var c = this.$states[this.$curState];
                    if (c.x !== x || y !== c.y || w !== c.width || h !== c.height) {
                        var xx = c.x, yy = c.y,
                            ww = c.width,
                            hh = c.height,
                            xw = x + w,
                            xxww = xx + ww,
                            yh = y + h,
                            yyhh = yy + hh;

                        c.x      = x > xx ? x : xx;
                        c.width  = (xw < xxww ? xw : xxww) - c.x;
                        c.y      = y > yy ? y : yy;
                        c.height = (yh < yyhh ? yh : yyhh) - c.y;

                        if (c.x !== xx || yy !== c.y || ww !== c.width || hh !== c.height) {
                            // begin path is very important to have proper clip area
                            this.beginPath();
                            this.rect(x, y, w, h);
                            this.closePath();
                            this.clip();
                        }
                    }
                }
            };
        },

        function $prototype(clazz) {
            this.$rotateValue = 0;
            this.$scaleX = 1;
            this.$scaleY = 1;

            /**
             *  Canvas context
             *  @attribute $context
             *  @private
             *  @type {CanvasRenderingContext2D}
             */
            this.$context = null;


            // set border for canvas has to be set as zebkit border, since canvas
            // is DOM component designed for rendering, so setting DOM border
            // doesn't allow us to render zebkit border
            this.setBorder = function(b) {
                return ui.Panel.prototype.setBorder.call(this, b);
            };

            this.rotate = function(r) {
                this.$rotateValue += r;
                if (this.$context !== null) {
                    this.$context.rotate(r);
                }

                this.vrp();
                return this;
            };

            this.scale = function(sx, sy) {
                if (this.$context !== null) {
                    this.$context.scale(sx, sy);
                }
                this.$scaleX = this.$scaleX * sx;
                this.$scaleY = this.$scaleY * sy;
                this.vrp();
                return this;
            };

            this.clearTransformations = function() {
                this.$scaleX = 1;
                this.$scaleY = 1;
                this.$rotateValue = 0;
                if (this.$context !== null) {
                    this.$context = zebkit.web.$canvas(this.element, this.width, this.height, true);
                    this.$context.reset(this.width, this.height);
                }
                this.vrp();
                return this;
            };

            // set passing for canvas has to be set as zebkit padding, since canvas
            // is DOM component designed for rendering, so setting DOM padding
            // doesn't allow us to hold painting area proper
            this.setPadding = function() {
                return ui.Panel.prototype.setPadding.apply(this, arguments);
            };

            this.setSize = function(w, h) {
                if (this.width !== w || h !== this.height) {
                    var pw  = this.width,
                        ph  = this.height;


                    this.$context = zebkit.web.$canvas(this.element, w, h);
                    // canvas has one instance of context, the code below
                    // test if the context has been already full filled
                    // with necessary methods and if it is not true
                    // fill it
                    if (typeof this.$context.$states === "undefined") {
                        zebkit.web.$extendContext(this.$context, clazz.$ContextMethods);
                    }

                    this.$context.reset(w, h);

                    // if canvas has been rotated apply the rotation to the context
                    if (this.$rotateValue !== 0) {
                        this.$context.rotate(this.$rotateValue);
                    }

                    // if canvas has been scaled apply it to it
                    if (this.$scaleX !== 1 || this.$scaleY !== 1) {
                        this.$context.scale(this.$scaleX, this.$scaleY);
                    }

                    this.width  = w;
                    this.height = h;

                    // sync state of visibility
                    // TODO: probably it should be in html element manager, manager has
                    // to catch resize event and if size is not 0 correct visibility
                    // now manager doesn't set style visibility to "visible" state
                    // if component size is zero
                    if (this.$container.style.visibility === "hidden" && this.isVisible) {
                        this.$container.style.visibility = "visible";
                    }

                    this.invalidate();

                    // TODO: think to replace it with vrp()
                    this.validate();
                    this.repaint();

                    if (w !== pw || h !== ph) {
                        this.resized(pw, ph);
                    }
                }
                return this;
            };
        }
    ]);

    /**
     * Class that wrapped window component with own HTML Canvas.
     * @param  {zebkit.ui.Window} [target] a window component. If target is not defined
     * it will be instantiated automatically. If the component is not passed the new
     * window component (zebkit.ui.Window) will be created.
     * @constructor
     * @extends zebkit.ui.web.HtmlCanvas
     * @class zebkit.ui.web.HtmlWinCanvas
     */
    pkg.HtmlWinCanvas = Class(pkg.HtmlCanvas, [
        function $prototype() {
            this.winOpened = function(e) {
                this.target.winOpened(e);
            };

            this.winActivated = function(e){
                this.target.winActivated(e);
            };
        },

        function(target) {
            this.$super();

            /**
             * Target window
             * @attribute target
             * @type {zebkit.ui.Window}
             * @readOnly
             */
            this.target = (arguments.length === 0 ? new ui.Window() : target);

            var $this = this;
            target.getWinContainer = function() {
                return $this;
            };

            this.setLayout(new zebkit.layout.BorderLayout());
            this.add("center", target);
        }
    ]);

    /**
     * WEB based HTML components wrapped with as zebkit components.
     * @class zebkit.ui.web.HtmlFocusableElement
     * @constructor
     * @extends zebkit.ui.web.HtmlElement
     */
    pkg.HtmlFocusableElement = Class(pkg.HtmlElement, [
        function $prototype() {
            this.$getElementRootFocus = function() {
                return this.element;
            };
        }
    ]);

    /**
     * HTML input element wrapper class. The class can be used as basis class
     * to wrap HTML elements that can be used to enter a textual information.
     * @constructor
     * @param {String} text a text the text input component has to be filled with
     * @param {String} element an input element name
     * @class zebkit.ui.web.HtmlTextInput
     * @extends zebkit.ui.web.HtmlElement
     */
    pkg.HtmlTextInput = Class(pkg.HtmlFocusableElement, [
        function(text, e) {
            if (text === null) {
                text = "";
            }
            this.$super(e);
            this.setAttribute("tabindex", 0);
            this.setValue(text);

            this.$keyUnifier = new zebkit.web.KeyEventUnifier(this.element, this);
            this.$keyUnifier.preventDefault = function(e, key) {}
        },

        function $prototype() {
            this.cursorType = ui.Cursor.TEXT;

            this.$keyTyped = function(e) {
                e.source = this;
                ui.events.fire("keyTyped", e);
            };

            this.$keyPressed = function(e) {
                e.source = this;
                return ui.events.fire("keyPressed", e);
            };

            this.$keyReleased = function(e) {
                e.source = this;
                return ui.events.fire("keyReleased", e);
            };

            /**
             * Get a text of the text input element
             * @return {String} a text of the  text input element
             * @method getValue
             */
            this.getValue = function() {
                return this.element.value.toString();
            };

            /**
             * Set the text
             * @param {String} t a text
             * @method setValue
             * @chainable
             */
            this.setValue = function(t) {
                if (this.element.value !== t) {
                    this.element.value = t;
                    this.vrp();
                }
                return this;
            };
        }
    ]);

    /**
     * HTML input text element wrapper class. The class wraps standard HTML text field
     * and represents it as zebkit UI component.
     * @constructor
     * @class zebkit.ui.web.HtmlTextField
     * @param {String} [text] a text the text field component has to be filled with
     * @extends zebkit.ui.web.HtmlTextInput
     */
    pkg.HtmlTextField = Class(pkg.HtmlTextInput, [
        function(text) {
            this.$super(text, "input");
            this.element.setAttribute("type",  "text");
        }
    ]);

    /**
     * HTML input text area element wrapper class. The class wraps standard HTML text area
     * element and represents it as zebkit UI component.
     * @constructor
     * @param {String} [text] a text the text area component has to be filled with
     * @class zebkit.ui.web.HtmlTextArea
     * @extends zebkit.ui.web.HtmlTextInput
     */
    pkg.HtmlTextArea = Class(pkg.HtmlTextInput, [
        function(text) {
            this.$super(text, "textarea");
            this.element.setAttribute("rows", 10);
        },

        /**
         * Set the text area resizeable or not resizeable.
         * @param {Boolean} b true to make the text area component resizeable
         * @method setResizeable
         * @chainable
         */
        function setResizeable(b) {
            this.setStyle("resize", b === false ? "none" : "both");
            return this;
        }
    ]);

    /**
     * HTML Link component.
     * @param  {String} text  a text of link
     * @param  {String} [href] an href of the link
     * @extends zebkit.ui.web.HtmlElement
     * @class zebkit.ui.web.HtmlLink
     * @constructor
     * @event fired
     * @param {zebkit.ui.web.Link} src a link that has been pressed
     */
    pkg.HtmlLink = Class(pkg.HtmlElement, [
        function(text, href) {
            this.$super("a");
            this.setContent(text);
            this.setAttribute("href", arguments.length < 2 ? "#": href);
            this._ = new zebkit.Listeners();
            var $this = this;
            this.element.onclick = function(e) {
                $this._.fired($this);
            };
        }
    ]);

    /**
     * This special wrapper component that has to be used to put HtmlElement into
     * "zebkit.ui.ScrollPan"
     * @example
     *
     *      var htmlElement = new zebkit.ui.web.HtmlElement();
     *      ...
     *      var scrollPan = new zebkit.ui.ScrollPan(new zebkit.ui.web.HtmlScrollContent(htmlElement));
     *
     *
     * @param  {zebkit.ui.web.HtmlElement} t target html component that is going to
     * scrolled.
     * @class zebkit.ui.web.HtmlScrollContent
     * @extends {zebkit.ui.web.HtmlElement}
     * @constructor
     */
    pkg.HtmlScrollContent = Class(pkg.HtmlElement, [
        function(t) {
            this.$super();
            this.scrollManager = new ui.ScrollPan.ContentPanScrollManager(t);
            this.setLayout(new ui.ScrollPan.ContentPanLayout());
            this.add("center",t);
            this.setBackground("blue");
        }
    ]);
});



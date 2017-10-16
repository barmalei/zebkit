    zebkit.package("ui.web", function(pkg, Class) {
    var ui = pkg.cd("..");

    /**
     *  WEB based zebkit UI components.
     *
     * @class zebkit.ui.web
     * @access package
     */

    /**
     * HTML element UI component wrapper class. The class represents an HTML element as if it is standard
     * UI component. It helps to use some standard HTML element as zebkit UI components and embeds it
     * in zebkit UI application layout.
     * @class zebkit.ui.web.HtmlElement
     * @constructor
     * @param {String|HTMLElement} [element] an HTML element to be represented as a standard zebkit UI
     * component. If the passed parameter is string it denotes a name of an HTML element. In this case
     * a new HTML element will be created.
     * @extends zebkit.ui.Panel
     */
    pkg.HtmlElement = Class(ui.Panel, [
        function(e) {
            if (arguments.length === 0) {
                e = "div";
            }

            if (zebkit.isString(e)) {
                e = document.createElement(e);
                e.style.border   = "0px solid transparent";   // clean up border
                e.style.fontSize = this.clazz.$bodyFontSize;  // DOM element is wrapped with a container that
                                                              // has zero sized font, so let's set body  font
                                                              // for the created element
            }

            // sync padding and margin of the DOM element with
            // what appropriate properties are set
            e.style.margin = e.style.padding = "0px";

            /**
             * Reference to HTML element the UI component wraps
             * @attribute element
             * @readOnly
             * @type {HTMLElement}
             */
            this.element = e;

            // this is set to make possible to use set z-index for HTML element
            this.element.style.position = "relative";

            if (e.parentNode !== null && e.parentNode.getAttribute("data-zebcont") !== null) {
                throw new Error("DOM element '" + e + "' already has container");
            }

            /**
             * Every zebkit HTML element is wrapped with a container (div) HTML element.
             * It is required since not all HTML elements are designed to be a container
             * (for instance HTMLCanvas element), where every zebkit has to be a container.
             * @attribute $container
             * @readOnly
             * @private
             * @type {HTMLElement}
             */

            // container is a DIV element that is used as a wrapper around original one
            // it is done to make HtmlElement implementation more universal making
            // all DOM elements capable to be a container for another one
            this.$container = document.createElement("div");

            // prevent stretching to a parent container element
            this.$container.style.display = "inline-block";

            // cut content
            this.$container.style.overflow = "hidden";

            // it fixes problem with adding, for instance, DOM element as window what can prevent
            // showing components added to popup layer
            this.$container.style["z-index"] = "0";

            // coordinates have to be set to initial zero value in CSS
            // otherwise the DOM layout can be wrong !
            this.$container.style.left = this.$container.style.top = "0px";

            this.$container.visibility = "hidden";  // before the component will be attached
                                                    // to parent hierarchy the component has to be hidden

            // container div will always few pixel higher than its content
            // to prevent the bloody effect set font to zero
            // border and margin also have to be zero
            this.$container.style.fontSize = this.$container.style.padding = this.$container.style.padding = "0px";

            // add id
            this.$container.setAttribute("id", "container-" + this.toString());

            // mark wrapper with a special attribute to recognize it exists later
            this.$container.setAttribute("data-zebcont", "true");

            // let html element interact
            this.$container.style["pointer-events"] = "auto";

            // if passed DOM element already has parent
            // attach it to container first and than
            // attach the container to the original parent element
            if (e.parentNode !== null) {
                // !!!
                // Pay attention container position cannot be set to absolute
                // since how the element has to be laid out is defined by its
                // original parent
                e.parentNode.replaceChild(this.$container, e);
                this.$container.appendChild(e);
            } else {
                // to force all children element be aligned
                // relatively to the wrapper we have to set
                // position CSS to absolute or absolute
                this.$container.style.position = "absolute";
                this.$container.appendChild(e);
            }

            // set ID if it has not been already defined
            if (e.getAttribute("id") === null) {
                e.setAttribute("id", this.toString());
            }

            this.$super();

            // attach listeners
            if (typeof this.$initListeners !== "undefined") {
                this.$initListeners();
            }

            var fe = this.$getElementRootFocus();

            // TODO: may be this code should be moved to web place
            //
            // reg native focus listeners for HTML element that can hold focus
            if (fe !== null) {
                var $this = this;

                zebkit.web.$focusin(fe, function(e) {
                    // sync native focus with zebkit focus if necessary
                    if ($this.hasFocus() === false) {
                        $this.requestFocus();
                    }
                }, false);

                zebkit.web.$focusout(fe, function(e) {
                    // sync native focus with zebkit focus if necessary
                    if ($this.hasFocus()) {
                        ui.focusManager.requestFocus(null);
                    }
                }, false);
            }
        },

        function $clazz() {
            this.CLASS_NAME = null;
            this.$bodyFontSize = window.getComputedStyle(document.body, null).getPropertyValue('font-size');
        },

        function $prototype() {
            this.$blockElement = this.$container = this.$canvas = null;
            this.ePsW = this.ePsH = 0;

            /**
             * Indicates that this component is a DOM element wrapper
             * @attribute isDOMElement
             * @type {Boolean}
             * @private
             * @readOnly
             */
            this.isDOMElement = true;   // indication of the DOM element that is used by DOM element manager to track
                                        // and manage its visibility

            this.$sizeAdjusted = false;

            this.wrap = function(c) {
                this.setLayout(new zebkit.layout.StackLayout());
                this.add(c);
                return this;
            };

            /**
             * Set the CSS font of the wrapped HTML element
             * @param {String|zebkit.Font} f a font
             * @method setFont
             * @chainable
             */
            this.setFont = function(f) {
                this.setStyle("font", f.toString());
                this.vrp();
                return this;
            };

            /**
             * Set the CSS color of the wrapped HTML element
             * @param {String} c a color
             * @chainable
             * @method setColor
             */
            this.setColor = function(c) {
                this.setStyle("color", c.toString());
                return this;
            };

            this.getColor = function() {
                return window.getComputedStyle(this.element, "color");
            };

            /**
             * Apply the given set of CSS styles to the wrapped HTML element
             * @param {Object} styles a dictionary of CSS styles
             * @chainable
             * @method setStyles
             */
            this.setStyles = function(styles) {
                for(var k in styles) {
                    this.$setStyle(this.element, k, styles[k]);
                }
                this.vrp();
                return this;
            };

            /**
             * Apply the given CSS style to the wrapped HTML element
             * @param {String} a name of the CSS style
             * @param {String} a value the CSS style has to be set
             * @chainable
             * @method setStyle
             */
            this.setStyle = function(name, value) {
                this.$setStyle(this.element, name, value);
                this.vrp();
                return this;
            };

            this.$setStyle = function(element, name, value) {
                name = name.trim();
                var i = name.indexOf(':');
                if (i > 0) {
                    if (zebkit[name.substring(0, i)] !== true) {
                        return;
                    }
                    name = name.substring(i + 1);
                }

                if (element.style[name] !== value) {
                    element.style[name] = value;
                }
                return this;
            };

            /**
             * Set the specified attribute to the wrapped HTML element
             * @param {String} name  a name of attribute
             * @param {String} value a value of the attribute
             * @chainable
             * @method setAttribute
             */
            this.setAttribute = function(name, value) {
                this.element.setAttribute(name, value);
                return this;
            };

            /**
             * Set the specified attributes set to the wrapped HTML element
             * @param {Object} attrs the dictionary of attributes where name of an
             * attribute is a key of the dictionary and
             * @method  setAttributes
             * @chainable
             */
            this.setAttributes = function(attrs) {
                for(var name in attrs) {
                    this.element.setAttribute(name, attrs[name]);
                }
                return this;
            };

            /**
             * Implements "update" method to be aware when the component is visible.
             * It is used to adjust wrapped HTML element visibility and size. Update
             * is the first rendering method that is called, so it is right place
             * to sync HTML element visibility before paint method execution
             * @param  {CanvasRenderingContext2D} g a 2D canvas context
             * @method update
             */
            this.update = function(g) {
                // this method is used as an indication that the component
                // is visible and no one of his parent is invisible
                if (this.$container.style.visibility === "hidden") {
                    this.$container.style.visibility = "visible";
                }

                // calling paint says that the component in DOM tree
                // that is time to correct CSS size if necessary
                if (this.$sizeAdjusted !== true) {
                    this.setSize(this.width, this.height);
                }
            };

            this.calcPreferredSize = function(target) {
                return {
                    width : this.ePsW,
                    height: this.ePsH
                };
            };

            var $store = [
                "paddingTop","paddingLeft","paddingBottom","paddingRight",
                "border","borderStyle","borderWidth", "borderTopStyle",
                "borderTopWidth", "borderBottomStyle","borderBottomWidth",
                "borderLeftStyle","borderLeftWidth", "borderRightStyle",
                "visibility", "borderRightWidth", "width", "height", "position"
            ];

            // the method calculates the given HTML element preferred size
            this.recalc = function() {
                // if component has a layout set it is up to a layout manager to calculate
                // the component preferred size. In this case the HTML element is a container
                // whose preferred size is defined by its content
                if (this.layout === this) {
                    var e         = this.element,
                        vars      = {},
                        domParent = null,
                        k         = null,
                        cv        = this.$container.style.visibility,
                        b         = !zebkit.web.$contains(this.$container);

                    // element doesn't have preferred size if it is not a member of
                    // an html page, so add it if for a while
                    if (b) {
                        // save previous parent node since
                        // appendChild will overwrite it
                        domParent = this.$container.parentNode;
                        document.body.appendChild(this.$container);
                    }

                    // save element metrics
                    for(var i = 0; i < $store.length; i++) {
                        k = $store[i];
                        vars[k] = e.style[k];
                    }

                    // force metrics to be calculated automatically
                    if (cv !== "hidden")  {
                        this.$container.style.visibility = "hidden";
                    }

                    e.style.padding  = "0px";
                    e.style.border   = "none";
                    e.style.position = e.style.height = e.style.width = "auto";

                    // fetch preferred size
                    this.ePsW = e.offsetWidth;
                    this.ePsH = e.offsetHeight;

                    for(k in vars) {
                        var v = vars[k];
                        if (v !== null && e.style[k] !== v) {
                            e.style[k] = v;
                        }
                    }

                    if (this.$container.style.visibility !== cv) {
                        this.$container.style.visibility = cv;
                    }

                    if (b) {
                        document.body.removeChild(this.$container);
                        // restore previous parent node
                        if (domParent !== null) {
                            domParent.appendChild(this.$container);
                        }
                    }
                }
            };

            /**
             * Set the inner content of the wrapped HTML element
             * @param {String} an inner content
             * @method setContent
             * @chainable
             */
            this.setContent = function(content) {
                this.element.innerHTML = content;
                this.vrp();
                return this;
            };

            this.$getElementRootFocus = function() {
                return null;
            };

            this.canHaveFocus = function() {
                return this.$getElementRootFocus() !== null;
            };

            this.$focus = function() {
                if (this.canHaveFocus() && document.activeElement !== this.$getElementRootFocus()) {
                    this.$getElementRootFocus().focus();
                }
            };

            this.$blur = function() {
                if (this.canHaveFocus() && document.activeElement === this.$getElementRootFocus()) {
                    this.$getElementRootFocus().blur();
                }
            };
        },

        function toFront() {
            this.$super();
            var pnode = this.$container.parentNode;
            if (pnode !== null && pnode.lastChild !== this.$container) {
                pnode.removeChild(this.$container);
                pnode.appendChild(this.$container);
            }
            return this;
        },

        function toBack() {
            this.$super();
            var pnode = this.$container.parentNode;
            if (pnode !== null && pnode.firstChild !== this.$container) {
                pnode.removeChild(this.$container);
                pnode.insertBefore(this.$container, pnode.firstChild);
            }
            return this;
        },

        function setEnabled(b) {
            if (this.isEnabled !== b) {
                if (b) {
                    this.$container.removeChild(this.$blockElement);
                } else {
                    if (this.$blockElement === null) {
                        this.$blockElement = zebkit.web.$createBlockedElement();
                    }
                    this.$container.appendChild(this.$blockElement);
               }
            }
            return this.$super(b);
        },

        function setSize(w, h) {
            // by the moment the method setSize is called the DOM element can be not a part of
            // HTML layout. In this case offsetWidth/offsetHeihght are always zero what prevents
            // us from proper calculation of CSS width and height. Postpone
            if (zebkit.web.$contains(this.$container)) {
                var  contStyle      = this.$container.style,
                     elemStyle      = this.element.style,
                     prevVisibility = contStyle.visibility;

                if (contStyle.visibility !== "hidden") {
                    contStyle.visibility = "hidden"; // to make sizing smooth
                }

                // HTML element size is calculated as sum of CSS "width"/"height", paddings, border
                // So the passed width and height has to be corrected (before it will be applied to
                // an HTML element) by reduction of extra HTML gaps. For this we firstly set the
                // width and size
                elemStyle.width  = "" + w + "px";
                elemStyle.height = "" + h + "px";

                var ww = 2 * w - this.element.offsetWidth,
                    hh = 2 * h - this.element.offsetHeight;

                if (ww !== w || hh !== h) {
                    // than we know the component metrics and can compute necessary reductions
                    elemStyle.width   = "" + ww + "px";
                    elemStyle.height  = "" + hh + "px";
                }

                this.$sizeAdjusted = true;

                // visibility correction is done by HTML elements manager
                if (contStyle.visibility !== prevVisibility) {
                    contStyle.visibility = prevVisibility;
                }
            } else {
                this.$sizeAdjusted = false;
            }

            return this.$super(w, h);
        },

        function setPadding(t,l,b,r) {
            if (arguments.length === 1) {
                l = b = r = t;
            }

            this.setStyles({
                paddingTop    : '' + t + "px",
                paddingLeft   : '' + l + "px",
                paddingRight  : '' + r + "px",
                paddingBottom : '' + b + "px"
            });

            if (this.top !== t || this.left !== l || this.right !== r || this.bottom !== b) {
                // changing padding has influence to CSS size the component has to have
                // so we have to request CSS size recalculation
                this.$sizeAdjusted = false;
            }

            this.$super.apply(this, arguments);
            return this;
        },

        function setBorder(b) {
            if (arguments.length === 0) {
                b = "plain";
            }

            b = zebkit.draw.$view(b);

            if (b === null) {
               this.setStyle("border", "none");
            } else {
                this.setStyles({
                    //!!!! bloody FF fix, the border can be made transparent
                    //!!!! only via "border" style
                    border : "0px solid transparent",

                    //!!! FF understands only decoupled border settings
                    borderTopStyle : "solid",
                    borderTopColor : "transparent",
                    borderTopWidth : "" + b.getTop() + "px",

                    borderLeftStyle : "solid",
                    borderLeftColor : "transparent",
                    borderLeftWidth : "" + b.getLeft() + "px",

                    borderBottomStyle : "solid",
                    borderBottomColor : "transparent",
                    borderBottomWidth : "" + b.getBottom() + "px",

                    borderRightStyle : "solid",
                    borderRightColor : "transparent",
                    borderRightWidth : "" + b.getRight() + "px"
                });
            }

            // changing border can have influence to
            // CSS size, so request recalculation of the CSS
            // size
            if (this.border != b) {
                this.$sizeAdjusted = false;
            }

            return this.$super(b);
        },

        function validate() {
            // lookup root canvas
            if (this.$canvas === null && this.parent !== null) {
                this.$canvas = this.getCanvas();
            }

            this.$super();
        },

        function focused() {
            this.$super();

            // sync state of zebkit focus with native focus of the HTML Element
            if (this.hasFocus()) {
                this.$focus();
            } else {
                this.$blur();
            }
        }
    ]).hashable();

    /**
     *  This special private manager that plays key role in integration of HTML ELement into zebkit UI hierarchy.
     *  Description to the class contains technical details of implementation that should not be interested for
     *  end users.
     *
     *  HTML element integrated into zebkit layout has to be tracked regarding:
     *    1) DOM hierarchy. A new added into zebkit layout DOM element has to be attached to the first found
     *       parent DOM element
     *    2) Visibility. If a zebkit UI component change its visibility state it has to have side effect to all
     *       children HTML elements on any subsequent hierarchy level
     *    3) Moving a zebkit UI component has to correct location of children HTML element on any subsequent
     *       hierarchy level.
     *
     *  The implementation of HTML element component has the following specific:
     *    1) Every original HTML is wrapped with "div" element. It is necessary since not all HTML element has been
     *       designed to be a container for another HTML element. By adding extra div we can consider the wrapper as
     *       container. The wrapper element is used to control visibility, location, enabled state
     *    2) HTML element has "isDOMElement" property set to true
     *    3) HTML element visibility depends on an ancestor component visibility. HTML element is visible if:
     *       - the element isVisible property is true
     *       - the element has a parent DOM element set
     *       - all his ancestors are visible
     *       - size of element is more than zero
     *       - getCanvas() != null
     *
     *  The visibility state is controlled with "e.style.visibility"
     *
     *  To support effective DOM hierarchy tracking a zebkit UI component defines "$domKid" property that contains
     *  direct DOM element the UI component hosts and other UI components that host DOM element. This is sort of tree:
     *
     *  <pre>
     *    +---------------------------------------------------------
     *    |  p1 (zebkit component)
     *    |   +--------------------------------------------------
     *    |   |  p2 (zebkit component)
     *    |   |    +---------+      +-----------------------+
     *    |   |    |   h1    |      | p3 zebkit component   |
     *    |   |    +---------+      |  +---------------+    |
     *    |   |                     |  |    h3         |    |
     *    |   |    +---------+      |  |  +---------+  |    |
     *    |   |    |   h2    |      |  |  |   p4    |  |    |
     *    |   |    +---------+      |  |  +---------+  |    |
     *    |   |                     |  +---------------+    |
     *    |   |                     +-----------------------+
     *
     *     p1.$domKids : {
     *         p2.$domKids : {
     *             h1,    * leaf elements are always DOM element
     *             h2,
     *             p3.$domKids : {
     *                h3
     *             }
     *         }
     *     }
     *   </pre>
     *
     *  @constructor
     *  @private
     *  @class zebkit.ui.web.HtmlElementMan
     *  @extends zebkit.ui.event.Manager
     */
    pkg.HtmlElementMan = Class(zebkit.ui.event.Manager, [
        function $prototype() {
            /**
             * Evaluates if the given zebkit HTML UI component is in invisible state.
             * @param  {zebkit.ui.HtmlElement}  c an UI HTML element wrapper
             * @private
             * @method $isInInvisibleState
             * @return {Boolean} true if the HTML element wrapped with zebkit UI is in invisible state
             */
            function $isInInvisibleState(c) {
                if (c.isVisible === false            ||
                    c.$container.parentNode === null ||
                    c.width       <= 0               ||
                    c.height      <= 0               ||
                    c.parent      === null           ||
                    zebkit.web.$contains(c.$container) === false)
                {
                    return true;
                }

                var p = c.parent;
                while (p !== null && p.isVisible === true && p.width > 0 && p.height > 0) {
                    p = p.parent;
                }

                return p !== null || ui.$cvp(c) === null;
            }

            //    +----------------------------------------
            //    |             ^      DOM1
            //    |             .
            //    |             .  (x,y) -> (xx,yy) than correct left
            //                  .  and top of DOM2 relatively to DOM1
            //    |    +--------.--------------------------
            //    |    |        .       zebkit1
            //    |    |        .
            //    |    |  (left, top)
            //    |<............+-------------------------
            //    |    |        |           DOM2
            //    |    |        |
            //
            //  Convert DOM (x, y) zebkit coordinates into appropriate CSS top and left
            //  locations relatively to its immediate DOM element. For instance if a
            //  zebkit component contains DOM component every movement of zebkit component
            //  has to bring to correction of the embedded DOM elements
            function $adjustLocation(c) {
                if (c.$container.parentNode !== null) {
                    // hide DOM component before move
                    // makes moving more smooth
                    var prevVisibility = null;
                    if (c.$container.style.visibility !== "hidden") {
                        prevVisibility = c.$container.style.visibility;
                        c.$container.style.visibility = "hidden";
                    }

                    // find a location relatively to the first parent HTML element
                    var p = c, xx = c.x, yy = c.y;
                    while (((p = p.parent) !== null) && p.isDOMElement !== true) {
                        xx += p.x;
                        yy += p.y;
                    }

                    c.$container.style.left = "" + xx + "px";
                    c.$container.style.top  = "" + yy + "px";
                    if (prevVisibility !== null) {
                        c.$container.style.visibility = prevVisibility;
                    }
                }
            }


            // attach to appropriate DOM parent if necessary
            // c parameter has to be DOM element
            function $resolveDOMParent(c) {
                // try to find an HTML element in zebkit (pay attention, in zebkit hierarchy !)
                // hierarchy that has to be a DOM parent for the given component
                var parentElement = null;
                for(var p = c.parent; p !== null; p = p.parent) {
                    if (p.isDOMElement === true) {
                        parentElement = p.$container;
                        break;
                    }
                }

                // parentElement is null means the component has
                // not been inserted into DOM hierarchy
                if (parentElement !== null && c.$container.parentNode === null) {
                    // parent DOM element of the component is null, but a DOM container
                    // for the element has been detected. We need to add it to DOM
                    // than we have to add the DOM to the found DOM parent element
                    parentElement.appendChild(c.$container);

                    // adjust location of just attached DOM component
                    $adjustLocation(c);
                } else {
                    // test consistency whether the DOM element already has
                    // parent node that doesn't match the discovered
                    if (parentElement           !== null &&
                        c.$container.parentNode !== null &&
                        c.$container.parentNode !== parentElement)
                    {
                        throw new Error("DOM parent inconsistent state ");
                    }
                }
            }

            // iterate over all found children HTML elements
            // !!! pay attention you have to check existence
            // of "$domKids" field before the method calling
            function $domElements(c, callback) {
                for (var k in c.$domKids) {
                    var e = c.$domKids[k];
                    if (e.isDOMElement === true) {
                        callback.call(this, e);
                    } else if (typeof e.$domKids !== 'undefined') { // prevent unnecessary method call by condition
                        $domElements(e, callback);
                    }
                }
            }

            this.compShown = function(e) {
                // 1) if c is DOM element than we have make it is visible if
                //      -- c.isVisible == true : the component visible  AND
                //      -- all elements in parent chain is visible      AND
                //      -- the component is in visible area
                //
                // 2) if c is not a DOM component his visibility state can have
                //    side effect to his children HTML elements (on any level)
                //    In this case we have to do the following:
                //      -- go through all children HTML elements
                //      -- if c.isVisible == false: make invisible every children element
                //      -- if c.isVisible != false: make visible every children element whose
                //         visibility state satisfies the following conditions:
                //          -- kid.isVisible == true
                //          -- all parent to c are in visible state
                //          -- the kid component is in visible area
                var c = e.source;
                if (c.isDOMElement === true) {
                    c.$container.style.visibility = (c.isVisible === false || $isInInvisibleState(c) ? "hidden"
                                                                                                     : "visible");
                } else if (typeof c.$domKids !== 'undefined') {
                    $domElements(c, function(e) {
                        e.$container.style.visibility = (e.isVisible === false || $isInInvisibleState(e) ? "hidden" : "visible");
                    });
                }
            };

            this.compMoved = function(e) {
                var c = e.source;

                // if we move a zebkit component that contains
                // DOM element(s) we have to correct the DOM elements
                // locations relatively to its parent DOM
                if (c.isDOMElement === true) {
                    // root canvas location cannot be adjusted since it is up to DOM tree to do it
                    if (c.$isRootCanvas !== true) {
                        var dx   = e.prevX - c.x,
                            dy   = e.prevY - c.y,
                            cont = c.$container;

                        cont.style.left = ((parseInt(cont.style.left, 10) || 0) - dx) + "px";
                        cont.style.top  = ((parseInt(cont.style.top,  10) || 0) - dy) + "px";
                    }
                } else if (typeof c.$domKids !== 'undefined') {
                    $domElements(c, function(e) {
                        $adjustLocation(e);
                    });
                }
            };

            function isLeaf(c) {
                if (typeof c.$domKids !== 'undefined') {
                    for(var k in c.$domKids) {
                        if (c.$domKids.hasOwnProperty(k)) {
                            return false;
                        }
                    }
                }
                return true;
            }

            function detachFromParent(p, c) {
                // DOM parent means the detached element doesn't
                // have upper parents since it is relative to the
                // DOM element
                if (p.isDOMElement !== true && typeof p.$domKids !== 'undefined') {
                    // delete from parent
                    delete p.$domKids[c.$hash$];

                    // parent is not DOM and doesn't have kids anymore
                    // what means the parent has to be also detached
                    if (isLeaf(p)) {
                        // parent of parent is not null and is not a DOM element
                        if (p.parent !== null && p.parent.isDOMElement !== true) {
                            detachFromParent(p.parent, p);
                        }

                        // remove $domKids from parent since the parent is leaf
                        delete p.$domKids;
                    }
                }
            }

            function removeDOMChildren(c) {
                // DOM element cannot have children dependency tree
                if (c.isDOMElement !== true && typeof c.$domKids !== 'undefined') {
                    for(var k in c.$domKids) {
                        if (c.$domKids.hasOwnProperty(k)) {
                            var kid = c.$domKids[k];

                            // DOM element
                            if (kid.isDOMElement === true) {
                                kid.$container.parentNode.removeChild(kid.$container);
                            } else {
                                removeDOMChildren(kid);
                            }
                        }
                    }
                    delete c.$domKids;
                }
            }

            this.compRemoved = function(e) {
                var c = e.kid;

                // if detached element is DOM element we have to
                // remove it from DOM tree
                if (c.isDOMElement === true) {
                    // DOM component can be detached from document
                    // with a parent component removal so let's
                    // check if it has a DOM parent
                    if (c.$container.parentNode !== null) {
                        c.$container.parentNode.removeChild(c.$container);
                    }
                } else {
                    removeDOMChildren(c);
                }

                detachFromParent(e.source, c);
            };

            this.compAdded = function(e) {
                var p = e.source,  c = e.kid;
                if (c.isDOMElement === true) {
                    $resolveDOMParent(c);
                } else {
                    if (typeof c.$domKids !== 'undefined') {
                        $domElements(c, function(e) {
                            $resolveDOMParent(e);
                        });
                    } else {
                        return;
                    }
                }

                if (p.isDOMElement !== true) {
                    // we come here if parent is not a DOM element and
                    // inserted children is DOM element or an element that
                    // embeds DOM elements
                    while (p !== null && p.isDOMElement !== true) {
                        if (typeof p.$domKids === 'undefined') {
                            // if reference to kid DOM element or kid DOM elements holder
                            // has bot been created we have to continue go up to parent of
                            // the parent to register the whole chain of DOM and DOM holders
                            p.$domKids = {};
                            p.$domKids[c.$genHash()] = c;
                            c = p;
                            p = p.parent;
                        } else {
                            var id = c.$genHash();
                            if (p.$domKids.hasOwnProperty(id)) {
                                throw new Error("Inconsistent state for " + c + ", " + c.clazz.$name);
                            }
                            p.$domKids[id] = c;
                            break;
                        }
                    }
                }
            };
        }
    ]);

    // instantiate manager
    pkg.$htmlElementMan = new pkg.HtmlElementMan();

    if (typeof zebkit.ui.event.FocusManager !== 'undefined') {
        zebkit.ui.event.FocusManager.extend([
            function requestFocus(c) {
                this.$super(c);

                var canvas = null;

                // if the requested for the focus UI componet doesn't belong to a canvas that holds a native
                // focus then let's give native focus to the canvas
                if (c !== null && c !== this.focusOwner && (c.isDOMElement !== true || c.$getElementRootFocus() === null)) {
                    canvas = c.getCanvas();
                    if (canvas !== null && document.activeElement !== canvas.element) {
                        canvas.element.focus();
                    }

                    // if old focus onwer sits on canvas that doesn't hold the native focus
                    // let's clear it
                    if (this.focusOwner !== null && this.focusOwner.getCanvas() !== canvas) {
                        this.requestFocus(null);
                    }
                } else if (this.focusOwner !== null && this.focusOwner.isDOMElement !== true) {
                    // here we check if focus owner belongs to a canvas that has native focus
                    // and if it is not true we give native focus to the canvas
                    canvas = this.focusOwner.getCanvas();
                    if (canvas !== null && document.activeElement !== canvas.element) {
                        canvas.element.focus();
                    }
                }
            },

            function pointerPressed(e){
                if (e.isAction()) {
                    // the problem is a target canvas element get mouse pressed
                    // event earlier than it gets focus what is inconsistent behavior
                    // to fix it a timer is used
                    if (document.activeElement !== e.source.getCanvas().element) {
                        var $this = this;
                        setTimeout(function() {
                            $this.requestFocus(e.source);
                        });
                    } else {
                        this.$$super(e);
                    }
                }
            }
        ]);
    }
});



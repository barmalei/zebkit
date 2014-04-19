(function(pkg, Class) {

/**
 * @module  ui
 */

/**
 * HTML element UI component wrapper class. The class represents
 * an HTML element as if it is standard UI component. It helps to use
 * some standard HTML element as zebra UI components and embeds it
 * in zebra UI application layout.
 * @class zebra.ui.HtmlElement
 * @constructor
 * @param {String|HTMLElement} [element] an HTML element to be represented
 * as a standard zebra UI component. If the passed parameter is string
 * it denotes a name of an HTML element. In this case a new HTML element
 * will be created.
 * @extends {zebra.ui.Panel}
 */
pkg.HtmlElement = Class(pkg.Panel, [
    function $prototype() {
        this.isLocAdjusted = false;
        this.canvas = null;
        this.ePsW = this.ePsH = 0;

        /**
         * Set the CSS font of the wrapped HTML element
         * @param {String|zebra.ui.Font} f a font
         * @method setFont
         */
        this.setFont = function(f) {
            this.element.style.font = f.toString();
            this.vrp();
        };

        /**
         * Set the CSS color of the wrapped HTML element
         * @param {String} c a color
         * @method setColor
         */
        this.setColor = function(c) {
            this.element.style.color = c.toString();
        };

        this.adjustLocation = function() {
            if (this.isLocAdjusted === false && this.canvas != null) {

                // hidden DOM component before move
                // makes moving more smooth
                var visibility = this.element.style.visibility;
                this.element.style.visibility = "hidden";

                if (zebra.instanceOf( this.parent, pkg.HtmlElement)) {
                    this.element.style.top  = "" + this.y + "px";
                    this.element.style.left = "" + this.x + "px";
                }
                else {
                    var a = zebra.layout.toParentOrigin(0,0,this);
                    this.element.style.top  = "" + (this.canvas.offy + a.y) + "px";
                    this.element.style.left = "" + (this.canvas.offx + a.x) + "px";
                }
                this.isLocAdjusted = true;
                this.element.style.visibility = visibility;
            }
        };

        this.calcPreferredSize = function(target) {
            return { width: this.ePsW, height: this.ePsH };
        };

        var $store = [
            "visibility",
            "paddingTop","paddingLeft","paddingBottom","paddingRight",
            "border","borderStyle","borderWidth",
            "borderTopStyle","borderTopWidth",
            "borderBottomStyle","borderBottomWidth",
            "borderLeftStyle","borderLeftWidth",
            "borderRightStyle","borderRightWidth",
            "width", "height"
        ];

        this.recalc = function() {
            // save element metrics
            var e    = this.element,
                vars = {};

            for(var i=0; i<$store.length; i++) {
                var k = $store[i];
                vars[k] = e.style[k];
            }

            // force metrics to be calculated automatically
            e.style.visibility = "hidden";
            e.style.padding = "0px";
            e.style.border  = "none";
            e.style.width   = "auto";
            e.style.height  = "auto";

            // fetch preferred size
            this.ePsW = e.offsetWidth;
            this.ePsH = e.offsetHeight;

            for(var k in vars) {
                var v = vars[k];
                if (v != null) e.style[k] = v;
            }

            this.setSize(this.width, this.height);
        };

        /**
         * Set the inner content of the wrapped HTML element
         * @param {String} an inner content
         * @method setContent
         */
        this.setContent = function(content) {
            this.element.innerHTML = content;
            this.vrp();
        };

        /**
         * Apply the given set of CSS styles to the wrapped HTML element
         * @param {Object} styles a dictionary of CSS styles
         * @method setStyles
         */
        this.setStyles = function(styles) {
            for(var k in styles) {
                this.setStyle(k, styles[k]);
            }
        };

        /**
         * Apply the given CSS style to the wrapped HTML element
         * @param {String} a name of the CSS style
         * @param {String} a value the CSS style has to be set
         * @method setStyle
         */
        this.setStyle = function(name, value) {
            name = name.trim();
            var i = name.indexOf(':');
            if (i > 0) {
                if (zebra[name.substring(0, i)] == null) {
                    return;
                }
                name = name.substring(i + 1);
            }

            this.element.style[name] = value;
            this.vrp();
        };

        /**
         * Set the specified attribute of the wrapped HTML element
         * @param {String} name  a name of attribute
         * @param {String} value a value of the attribute
         * @method setAttribute
         */
        this.setAttribute = function(name, value) {
            this.element.setAttribute(name, value);
        };

        this.isInInvisibleState = function() {
            if (this.width       <= 0    || 
                this.height      <= 0    ||
                this.parent      == null || 
                this.getCanvas() == null   ) 
            {
                return true;
            }

            var p = this.parent;
            while (p != null && p.isVisible === true && p.width > 0 && p.height > 0) {
                p = p.parent;
            }
          
            return p != null || pkg.$cvp(this) == null; 
            // canvas means the component is not
                              // in hierarchy yet, that means it
                              // has to be hidden
        };

        this.paint = function(g) {
            // this method is used as an indication that the component
            // is visible and no one of his parent is invisible
            if (this.element.style.visibility == "hidden") {
                this.element.style.visibility = "visible";
            }
        };
    },

    function(e) {
        /**
         * Reference to HTML element the UI component wraps
         * @attribute element
         * @readOnly
         * @type {HTMLElement}
         */
        e = this.element = zebra.isString(e) ? document.createElement(e) : e;
        e.setAttribute("id", this.toString());
        e.style.visibility = "hidden";  // before the component will be attached
                                        // to parent hierarchy of components that is
                                        // attached to a canvas the component has to be hidden

        this.$super();

        var $this = this;

        // TODO:
        // It is not a very good idea to register global component listener per
        // HTML component. Has to be re-designed, but at this moment this is the
        // only way to understand when the HTML component parent hierarchy has got
        // visibility updates
        this.globalCompListener = {
            compShown :function(c) {
                if (c != $this && c.isVisible === false && zebra.layout.isAncestorOf(c, $this)) {
                    $this.element.style.visibility = "hidden";
                }
            },

            compMoved : function(c, px, py) {
                if (zebra.layout.isAncestorOf(c, $this)) {
                    // force location adjustment when the component
                    // parent HTML canvas has been moved
                    $this.isLocAdjusted = false;
                    $this.adjustLocation();
                }


                if (c != $this && $this.isInInvisibleState()) {
                    $this.element.style.visibility = "hidden";
                }
            },

            compRemoved : function(p, i, c) {
                // if an ancestor parent has been removed the HTML element
                // has to be hidden
                if (c != $this && zebra.layout.isAncestorOf(c, $this)) {
                    $this.element.style.visibility = "hidden";
                }
            },

            compSized : function(c, pw, ph) {
                if (c != $this && zebra.layout.isAncestorOf(c, $this) && $this.isInInvisibleState()) {
                    $this.element.style.visibility = "hidden";
                }
            }
        };

        this.globalWinListener = {
            winActivated : function(layer, win, isActive) {
                if (zebra.layout.isAncestorOf(win, $this) == false) {
                    $this.element.style.visibility;   
                }
            }
        };

        // it is important to avoid mouse event since for some html element
        // it can cause unexpected event generation. for instance text input
        // element can generate mouse moved on mobile devices whenever it gets
        // focus
        if (zebra.isTouchable === false) {
            e.onmousemove = function(ee) {
                if ($this.canvas != null) {
                    $this.canvas.$mouseMoved(1, {
                        target: $this.canvas.canvas,
                        pageX : ee.pageX,
                        pageY : ee.pageY
                    });
                }
            };

            e.onmousedown = function(ee) {
                if ($this.canvas != null) {
                    $this.canvas.$mousePressed(1, {
                        target: $this.canvas.canvas,
                        pageX : ee.pageX,
                        pageY : ee.pageY
                    });
                }
            };

            e.onmouseup = function(ee) {
                if ($this.canvas != null) {
                    $this.canvas.$mouseReleased(1, {
                        target: $this.canvas.canvas,
                        pageX : ee.pageX,
                        pageY : ee.pageY
                    },

                    ee.button === 0 ? pkg.MouseEvent.LEFT_BUTTON
                                    : (ee.button == 2 ? pkg.MouseEvent.RIGHT_BUTTON : 0));
                }
            };
        }

        e.addEventListener("focus", function(ee) {
            // mark the element  has focus on the given canvas
            $this.element.canvas = $this.canvas;

            // notify focus manager the given component has got focus
            zebra.ui.focusManager.requestFocus($this);
        }, false);

        e.addEventListener("blur", function(ee) {
            // flush the native element canvas field to say the component doesn't
            // have focus anymore
            $this.element.canvas = null;

            if ($this.canvas != null) {
                // run timer that checks if the native web component has lost focus because of
                // leaving the canvas where it hosts:
                //  -- the focus doesn't belong to the canvas where the native component sits
                //    AND
                //  -- the focus doesn't belong to another native component that sits on the
                //     canvas
                setTimeout(function() {
                    var fo = zebra.ui.focusManager.focusOwner;
                    if (($this.canvas != null && document.activeElement != $this.canvas.canvas) &&
                        (document.activeElement != null && $this.canvas != document.activeElement.canvas))
                    {
                       zebra.ui.focusManager.requestFocus(null);
                    }
                }, 100);
            }
        }, false);

        e.onkeydown = function(ee) {
            if ($this.canvas != null) {
                // store current focus owner to analyze if the event triggered focus owner changing
                var pfo = zebra.ui.focusManager.focusOwner;

                // re-define key event since preventDefault has to be disabled,
                // otherwise navigation key will not work
                $this.canvas.$keyPressed({
                    keyCode       : ee.keyCode,
                    target        : ee.target,
                    altKey        : ee.altKey,
                    shiftKey      : ee.shiftKey,
                    ctrlKey       : ee.ctrlKey,
                    metaKey       : ee.metaKey,
                    preventDefault: function() {}
                });

                var nfo = zebra.ui.focusManager.focusOwner;

                // if focus owner has been updated
                if (nfo != pfo) {
                    ee.preventDefault();
                    // if focus owner has been moved to another HTML component we have to pass focus to it
                    if (nfo != null && zebra.instanceOf(nfo, pkg.HtmlElement) && document.activeElement != nfo.element) {
                        nfo.element.focus();
                    }
                    else {
                        // otherwise return focus back to canvas
                        $this.canvas.canvas.focus();
                    }
                }
            }
        };

        e.onkeyup  = function(ee) {
            if ($this.canvas != null) {
                $this.canvas.$keyReleased(ee);
            }
        };

        e.onkeypress = function(ee) {
            if ($this.canvas != null) {
                $this.canvas.$keyTyped({
                    keyCode       : ee.keyCode,
                    target        : ee.target,
                    altKey        : ee.altKey,
                    shiftKey      : ee.shiftKey,
                    ctrlKey       : ee.ctrlKey,
                    metaKey       : ee.metaKey,
                    preventDefault: function() {}
                });
            }
        };
    },

    function focused() {
        if (this.hasFocus()) {
            // if the component has focus that has came from Zebra component we should
            // set focus to native component that hosted by Zebra component

            var canvas = this.getCanvas(),
                pfo    = canvas.$prevFocusOwner;
            
            if (pfo == null || zebra.instanceOf(pfo, pkg.HtmlElement) === false) {
                this.element.focus();
            }
        }

        this.$super();
    },

    function setBorder(b) {
        b = pkg.$view(b);

        if (b == null) {
            this.element.style.border = "none";
        }
        else {
            var e = this.element;

            //!!!! Bloody FF fix, the border can be made transparent
            //!!!! only via "border" style
            e.style.border = "0px solid transparent";

            //!!! FF understands only decoupled border settings
            e.style.borderTopStyle = "solid";
            e.style.borderTopColor = "transparent";
            e.style.borderTopWidth = "" + b.getTop() + "px";

            e.style.borderLeftStyle = "solid";
            e.style.borderLeftColor = "transparent";
            e.style.borderLeftWidth = "" + b.getLeft() + "px";

            e.style.borderBottomStyle = "solid";
            e.style.borderBottomColor = "transparent";
            e.style.borderBottomWidth = "" + b.getBottom() + "px";


            e.style.borderRightStyle = "solid";
            e.style.borderRightColor = "transparent";
            e.style.borderRightWidth = "" + b.getRight() + "px";
        }
        this.$super(b);
    },

    function setPadding(t,l,b,r) {
        if (arguments.length == 1) {
            l = b = r = t;
        }

        var e = this.element;
        e.style.paddingTop    = '' + t + "px";
        e.style.paddingLeft   = '' + l + "px";
        e.style.paddingRight  = '' + r + "px";
        e.style.paddingBottom = '' + b + "px";
        
        this.$super.apply(this, arguments);
    },

    function setVisible(b) {
        if (this.isInInvisibleState()) {
            this.element.style.visibility = "hidden";
        }
        else {
            this.element.style.visibility = b ? "visible" : "hidden";
        }
        this.$super(b);
    },

    function setEnabled(b) {
        this.$super(b);
        this.element.disabled = !b;
    },

    function setSize(w, h) {
        this.$super(w, h);
        var visibility = this.element.style.visibility;
        this.element.style.visibility = "hidden"; // could make sizing smooth

        // HTML element size is calculated as sum of "width"/"height", paddings, border
        // So the passed width and height has to be corrected (before it will be applied to
        // an HTML element) by reduction of extra HTML gaps. For this we firstly set the
        // width and size
        this.element.style.width  = "" + w + "px";
        this.element.style.height = "" + h + "px";

        // than we know the component metrics and can compute necessary reductions
        var dx = this.element.offsetWidth  - w,
            dy = this.element.offsetHeight - h;
        this.element.style.width   = "" + (w - dx) + "px";
        this.element.style.height  = "" + (h - dy) + "px";

        if (this.isInInvisibleState()) {
            this.element.style.visibility = "hidden";
        }
        else {
            this.element.style.visibility = visibility;
        }
    },

    function setLocation(x, y) {
        this.$super(x, y);
        this.isLocAdjusted = false;
    },

    function validate() {
        if (this.canvas == null && this.parent != null) {
            this.canvas = this.getCanvas();
        }

        if (this.canvas != null && this.isLocAdjusted === false) {
            this.adjustLocation();
        }

        this.$super();
    },

    function setParent(p) {
        this.$super(p);

        if (p == null) {
            if (this.element.parentNode != null) {
                this.element.parentNode.removeChild(this.element);
            }

            this.element.style.visibility = "hidden";
            pkg.events.removeComponentListener(this.globalCompListener);
        }
        else {
            if (zebra.instanceOf(p, pkg.HtmlElement)) {
                p.element.appendChild(this.element);
            }
            else {
                document.body.appendChild(this.element);
            }

            if (this.isInInvisibleState()) {
                this.element.style.visibility = "hidden";
            }
            else {
                this.element.style.visibility = this.isVisible ? "visible" : "hidden";
            }

            pkg.events.addComponentListener(this.globalCompListener);
        }

        this.isLocAdjusted = false;

        this.canvas = p != null ? this.getCanvas() : null;
    }
]);

/**
 * HTML input element wrapper class. The class can be used as basis class
 * to wrap HTML elements that can be used to enter a textual information.
 * @constructor
 * @param {String} text a text the text input component has to be filled with
 * @param {String} element an input element name
 * @class zebra.ui.HtmlTextInput
 * @extends zebra.ui.HtmlElement
 */
pkg.HtmlTextInput = Class(pkg.HtmlElement, [
    function $prototype() {
        this.canHaveFocus = true;

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
         */
        this.setValue = function(t) {
            if (this.element.value != t) {
                this.element.value = t;
                this.vrp();
            }
        };
    },

    function(text, elementName) {
        if (text == null) text = "";
        this.$super(elementName);
        this.element.setAttribute("tabindex", 0);
        this.setValue(text);
    }
]);


pkg.HtmlContent = Class(pkg.HtmlElement, [
    function() {
        this.$super("div");
        this.setStyle("overflow", "hidden");
    },

    function loadContent(url) {
        var c = zebra.io.GET(url);
        this.setContent(c);
        this.vrp();
    }
]);


/**
 * HTML input text element wrapper class. The class wraps standard HTML text field
 * and represents it as zebra UI component.
 * @constructor
 * @class zebra.ui.HtmlTextField
 * @param {String} [text] a text the text field component has to be filled with
 * @extends zebra.ui.HtmlTextInput
 */
pkg.HtmlTextField = Class(pkg.HtmlTextInput, [
    function(text) {
        this.$super(text, "input");
        this.element.setAttribute("type",  "text");
    }
]);

/**
 * HTML input textarea element wrapper class. The class wraps standard HTML textarea
 * element and represents it as zebra UI component.
 * @constructor
 * @param {String} [text] a text the text area component has to be filled with
 * @class zebra.ui.HtmlTextArea
 * @extends zebra.ui.HtmlTextInput
 */
pkg.HtmlTextArea = Class(pkg.HtmlTextInput, [
    function setResizeable(b) {
        if (b === false) this.setStyle("resize", "none");
        else             this.setStyle("resize", "both");
    },

    function(text) {
        this.$super(text, "textarea");
        this.element.setAttribute("rows", 10);
    }
]);

/**
 * @for
 */

})(zebra("ui"), zebra.Class);
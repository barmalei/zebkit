(function(pkg, Class) {

/**
 * @module  ui
 */

pkg.HtmlElementMan = Class(pkg.Manager, [
//
// HTML element integrated into zebkit layout has to be tracked regarding:
//    1) DOM hierarchy. New added into zebkit layout DOM element has to be
//       attached to the first found parent DOM element
//    2) Visibility. If a zebkit UI component change its visibility state
//       it has to have side effect to all children HTML elements on any
//       subsequent hierarchy level
//    3) Moving a zebkit UI component has to correct location of children
//       HTML element on any subsequent hierarchy level.
//
//  The implementation of HTML element component has the following specific:
//    1) Every original HTML is wrapped with "div" element. It is necessary since
//       not all HTML element has been designed to be a container for another
//       HTML element. By adding extra div we can consider the wrapper as container.
//       The wrapper element is used to control visibility, location, enabled state
//    2) HTML element has "isDOMElement" property set to true
//    3) HTML element visibility depends on an ancestor component visibility.
//       HTML element is visible if:
//          -- the element isVisible property is true
//          -- the element has a parent DOM element set
//          -- all his ancestors are visible
//          -- size of element is more than zero
//          -- getCanvas() != null
//       The visibility state is controlled with "e.style.visibility"
//
//   To support effective DOM hierarchy tracking a zebkit UI component can
//   host "$domKid" property that contains direct DOM element the UI component
//   hosts and other UI components that host DOM element. So it is sort of tree.
//   For instance:
//
//    +---------------------------------------------------------
//    |  p1 (zebkit component)
//    |   +--------------------------------------------------
//    |   |  p2 (zebkit component)
//    |   |    +---------+      +-----------------------+
//    |   |    |   h1    |      | p3 zebkit component    |
//    |   |    +---------+      |  +---------------+    |
//    |   |                     |  |    h3         |    |
//    |   |    +---------+      |  |  +---------+  |    |
//    |   |    |   h2    |      |  |  |   p4    |  |    |
//    |   |    +---------+      |  |  +---------+  |    |
//    |   |                     |  +---------------+    |
//    |   |                     +-----------------------+
//
//     p1.$domKids : {
//         p2.$domKids : {
//             h1,   // leaf elements are always DOM element
//             h2,
//             p3.$domKids : {
//                h3
//             }
//         }
//     }
    function $prototype() {
        function $isInInvisibleState(c) {
            if (c.isVisible === false           ||
                c.$container.parentNode == null ||
                c.width       <= 0              ||
                c.height      <= 0              ||
                c.parent      == null           ||
                zebkit.web.$contains(c.$container) === false)
            {
                return true;
            }

            var p = c.parent;
            while (p != null && p.isVisible === true && p.width > 0 && p.height > 0) {
                p = p.parent;
            }

            return p != null || pkg.$cvp(c) == null;
        }

        // attach to appropriate DOM parent if necessary
        // c parameter has to be DOM element
        function $resolveDOMParent(c) {
            // try to find an HTML element in zebkit (pay attention, in zebkit hierarchy !)
            // hierarchy that has to be a DOM parent for the given component
            var parentElement = null;
            for(var p = c.parent; p != null; p = p.parent) {
                if (p.isDOMElement === true) {
                    parentElement = p.$container;
                    break;
                }
            }

            // parentElement is null means the component has
            // not been inserted into DOM hierarchy
            if (parentElement != null && c.$container.parentNode == null) {
                // parent DOM element of the component is null, but a DOM container
                // for the element has been detected. We need to add it to DOM
                // than we have to add the DOM to the found DOM parent element
                parentElement.appendChild(c.$container);

                // adjust location of just attached DOM component
                $adjustLocation(c);
            }
            else {
                // test consistency whether the DOM element already has
                // parent node that doesn't match the discovered
                if (parentElement           != null &&
                    c.$container.parentNode != null &&
                    c.$container.parentNode !== parentElement)
                {
                    throw new Error("DOM parent inconsistent state ");
                }
            }
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
        //    |    |        |
        //
        //  Convert DOM (x, y) zebkit coordinates into appropriate CSS top and left
        //  locations relatively to its immediate DOM element. For instance if a
        //  zebkit component contains DOM component every movement of zebkit component
        //  has to bring to correction of the embedded DOM elements
        function $adjustLocation(c) {
            if (c.$container.parentNode != null) {
                // hide DOM component before move
                // makes moving more smooth
                var prevVisibility = c.$container.style.visibility;
                c.$container.style.visibility = "hidden";

                // find a location relatively to the first parent HTML element
                var p = c, xx = c.x, yy = c.y;
                while (((p = p.parent) != null) && p.isDOMElement !== true) {
                    xx += p.x;
                    yy += p.y;
                }

                c.$container.style.left = "" + xx + "px";
                c.$container.style.top  = "" + yy + "px";
                c.$container.style.visibility = prevVisibility;
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
                }
                else {
                    // prevent unnecessary method call by condition
                    if (e.$domKids != null) {
                        $domElements(e, callback);
                    }
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
                c.$container.style.visibility = c.isVisible === false || $isInInvisibleState(c) ? "hidden"
                                                                                                : "visible";
            }
            else {
                if (c.$domKids != null) {
                    $domElements(c, function(e) {
                        e.$container.style.visibility = e.isVisible === false || $isInInvisibleState(e) ? "hidden" : "visible";
                    });
                }
            }
        };

        this.compMoved = function(e) {
            var c = e.source, px = e.prevX, py = e.prevY;

            // if we move a zebkit component that contains
            // DOM element(s) we have to correct the DOM elements
            // locations relatively to its parent DOM
            if (c.isDOMElement === true) {
                // root canvas location cannot be adjusted since it is up to DOM tree to do it
                if (c.$isRootCanvas !== true) {
                    var dx   = px - c.x,
                        dy   = py - c.y,
                        cont = c.$container;

                    cont.style.left = ((parseInt(cont.style.left, 10) || 0) - dx) + "px";
                    cont.style.top  = ((parseInt(cont.style.top,  10) || 0) - dy) + "px";
                }
            }
            else {
                if (c.$domKids != null) {
                    $domElements(c, function(e) {
                        $adjustLocation(e);
                    });
                }
            }
        };

        function detachFromParent(p, c) {
            // DOM parent means the detached element doesn't
            // have upper parents since it is relative to the
            // DOM element
            if (p.isDOMElement !== true && p.$domKids != null) {
                // delete from parent
                delete p.$domKids[c];

                // parent is not DOM and doesn't have kids anymore
                // what means the parent has to be also detached
                if (isLeaf(p)) {
                    // parent of parent is not null and is not a DOM element
                    if (p.parent != null && p.parent.isDOMElement !== true) {
                        detachFromParent(p.parent, p);
                    }

                    // remove $domKids from parent since the parent is leaf
                    delete p.$domKids;
                }
            }
        }

        function isLeaf(c) {
            if (c.$domKids != null) {
                for(var k in c.$domKids) {
                    if (c.$domKids.hasOwnProperty(k)) return false;
                }
            }
            return true;
        }

        function removeDOMChildren(c) {
            // DOM element cannot have children dependency tree
            if (c.isDOMElement !== true && c.$domKids != null) {
                for(var k in c.$domKids) {
                    if (c.$domKids.hasOwnProperty(k)) {
                        var kid = c.$domKids[k];

                        // DOM element
                        if (kid.isDOMElement === true) {
                            kid.$container.parentNode.removeChild(kid.$container);
                            kid.$container.parentNode = null;
                        }
                        else {
                            removeDOMChildren(kid);
                        }
                    }
                }
                delete c.$domKids;
            }
        }

        this.compRemoved = function(e) {
            var p = e.source,
                i = e.index,
                c = e.kid;

            // if detached element is DOM element we have to
            // remove it from DOM tree
            if (c.isDOMElement === true) {
                c.$container.parentNode.removeChild(c.$container);
                c.$container.parentNode = null;
            }
            else {
                removeDOMChildren(c);
            }

            detachFromParent(p, c);
        };

        this.compAdded = function(e) {
            var p = e.source,  c = e.kid;
            if (c.isDOMElement === true) {
                $resolveDOMParent(c);
            }
            else {
                if (c.$domKids != null) {
                    $domElements(c, function(e) {
                        $resolveDOMParent(e);
                    });
                }
                else {
                    return;
                }
            }

            if (p.isDOMElement !== true) {
                // we come here if parent is not a DOM element and
                // inserted children is DOM element or an element that
                // embeds DOM elements
                while (p != null && p.isDOMElement !== true) {
                    if (p.$domKids == null) {
                        // if reference to kid DOM element or kid DOM elements holder
                        // has bot been created we have to continue go up to parent of
                        // the parent to register the whole chain of DOM and DOM holders
                        p.$domKids = {};
                        p.$domKids[c] = c;
                        c = p;
                        p = p.parent;
                    }
                    else {
                        if (p.$domKids.hasOwnProperty(c)) {
                            throw new Error("Inconsistent state for " + c + ", " + c.clazz.$name);
                        }
                        p.$domKids[c] = c;
                        break;
                    }
                }
            }
        };
    }
]);

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
 * @class zebkit.ui.HtmlTextInput
 * @extends zebkit.ui.HtmlElement
 */
pkg.HtmlTextInput = Class(pkg.HtmlFocusableElement, [
    function $prototype() {
        this.cursorType = pkg.Cursor.TEXT;

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

    function(text, e) {
        if (text == null) text = "";
        this.$super(e);
        this.setAttribute("tabindex", 0);
        this.setValue(text);
    }
]);

/**
 * HTML input text element wrapper class. The class wraps standard HTML text field
 * and represents it as zebkit UI component.
 * @constructor
 * @class zebkit.ui.HtmlTextField
 * @param {String} [text] a text the text field component has to be filled with
 * @extends zebkit.ui.HtmlTextInput
 */
pkg.HtmlTextField = Class(pkg.HtmlTextInput, [
    function(text) {
        this.$super(text, "input");
        this.element.setAttribute("type",  "text");
    }
]);

/**
 * HTML input textarea element wrapper class. The class wraps standard HTML textarea
 * element and represents it as zebkit UI component.
 * @constructor
 * @param {String} [text] a text the text area component has to be filled with
 * @class zebkit.ui.HtmlTextArea
 * @extends zebkit.ui.HtmlTextInput
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
 * [description]
 * @param  {[type]} text  [description]
 * @param  {zebkit}  href)
 * @return {[type]}       [description]
 */
pkg.HtmlLink = Class(pkg.HtmlElement, [
    function(text, href) {
        this.$super("a");
        this.setContent(text);
        this.setAttribute("href", href == null ? "#": href);
        this._ = new zebkit.util.Listeners();
        var $this = this;
        this.element.onclick = function(e) {
            $this._.fired($this);
        };
    }
]);


/**
 * @for
 */

})(zebkit("ui"), zebkit.Class);
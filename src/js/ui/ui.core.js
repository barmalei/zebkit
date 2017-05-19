zebkit.package("ui", function(pkg, Class) {
    // Panel WEB specific dependencies:
    //   -  getCanvas() -> zCanvas
    //      -  $da (dirty area)
    //      -  $isRootCanvas
    //      -  $waitingForPaint (created and controlled by Panel painting !)
    //      -  $context
    //          - restore(...)
    //          - restoreAll(...)
    //          - save()
    //          - clipRect(...)
    //          - clip()
    //          - clearRect(...)
    //          - translate(...)
    //          - $states[g.$curState] ?
    //
    // Panel zebkit classes dependencies
    //   - ui.CompEvent
    //   - ui.events EventManager
    //   - util.*


    /**
     *  Zebkit UI package contains a lot of various components. Zebkit UI idea is rendering
     *  hierarchy of UI components on a canvas (HTML5 Canvas). Typical zebkit application
     *  looks as following:
     *
     *       zebkit.require("ui", "layout", function(ui) {
     *           // create canvas and save reference to root layer
     *           // where zebkit UI components should live.
     *           var root = new ui.zCanvas(400, 400).root;
     *
     *           // build UI layout
     *           root.properties({
     *               layout : new layout.BorderLayout(4),
     *               padding: 8,
     *               kids   : {
     *                   "center" : new ui.TextArea("A text"),
     *                   "top"    : new ui.ToolbarPan().properties({
     *                       kids : [
     *                           new ui.ImagePan("icon1.png"),
     *                           new ui.ImagePan("icon2.png"),
     *                           new ui.ImagePan("icon3.png")
     *                      ]
     *                   }),
     *                   "bottom" : new ui.Button("Apply")
     *               }
     *           });
     *       });
     *
     *  UI components are ordered with help of layout managers. You should not use absolute
     *  location or size your component. It is up to layout manager to decide which size and
     *  location the given  component has to have. In the example above we add number of UI
     *  components to "root" (UI Panel). The root panel uses "BorderLayout" [to order the
     *  added components. The layout manager split root area to number of areas: "center",
     *  "top", "left", "right", "bottom" where children components can be placed.
     *
     *  @class zebkit.ui
     *  @access package
     */


    // TODO: not stable API
    pkg.$configWith = function(pkg, path) {
        if (arguments.length < 2) {
            var fn = pkg.fullname();
            path = fn.substring(fn.indexOf('.') + 1) + ".json";
        }

        if (path[0] !== '/') {
            var root = zebkit.config['ui.theme.path'];
            if (typeof root === "undefined") {
                root =  typeof zebkit.config['ui.theme.name'] === 'undefined' ? "rs/themes/dark"
                                                                              : "rs/themes/" + zebkit.config['ui.theme.name'];
            }

            if (root[0] !== '/') {
                path = zebkit.URI.join(zebkit.ui.$url, root, path);
            } else {
                path = zebkit.URI.join(root, path);
            }
        }

        // it guarantees that loading if JSONs will be done sequentially in
        // the order the JSON appeared
        zebkit.then(function() { // calling the guarantees it will be called when previous actions are completed
            this.till(new zebkit.util.Zson(pkg).then(path)); // now we can trigger other loading action
        });
    };

    // TODO: prototype of zClass, too simple to say something
    pkg.zCanvas = Class([]);

    /**
     * Get preferred size shortcut. Null can be passed as the method argument
     * @private
     * @param  {zebkit.ui.Layoutable} l a layoutable component
     * @return {Object}  a preferred size:
     *      { width : {Integer}, height: {Integer} }
     * @method $getPS
     * @for zebkit.ui
     */
    pkg.$getPS = function(l) {
        return l !== null && l.isVisible === true ? l.getPreferredSize()
                                                  : { width:0, height:0 };
    };

    /**
     * Calculate visible area of the given components taking in account
     * intersections with parent hierarchy.
     * @private
     * @param  {zebkit.ui.Panel} c  a component
     * @param  {Object} r a variable to store visible area

            { x: {Integer}, y: {Integer}, width: {integer}, height: {Integer} }

     * @method $cvp
     * @for zebkit.ui
     */
    pkg.$cvp = function(c, r) {
        if (c.width > 0 && c.height > 0 && c.isVisible === true){
            var p  = c.parent,
                px = -c.x,
                py = -c.y;

            if (arguments.length < 2) {
                r = { x:0, y:0, width : c.width, height : c.height };
            } else {
                r.x = r.y = 0;
                r.width  = c.width;
                r.height = c.height;
            }

            while (p !== null && r.width > 0 && r.height > 0) {
                var xx = r.x > px ? r.x : px,
                    yy = r.y > py ? r.y : py,
                    w1 = r.x + r.width,
                    w2 = px  + p.width,
                    h1 = r.y + r.height,
                    h2 = py  + p.height;

                r.width  = (w1 < w2 ? w1 : w2) - xx;
                r.height = (h1 < h2 ? h1 : h2) - yy;
                r.x = xx;
                r.y = yy;

                px -= p.x;
                py -= p.y;
                p = p.parent;
            }

            return r.width > 0 && r.height > 0 ? r : null;
        }
        return null;
    };

    /**
     * Relocate the given component to make them fully visible.
     * @param  {zebkit.ui.Panel} [d] a parent component where the given component has to be re-located
     * @param  {zebkit.ui.Panel} c  a component to re-locate to make it fully visible in the parent
     * component
     * @method makeFullyVisible
     * @for  zebkit.ui
     */
    pkg.makeFullyVisible = function(d, c){
        if (arguments.length === 1) {
            c = d;
            d = c.parent;
        }

        var right  = d.getRight(),
            top    = d.getTop(),
            bottom = d.getBottom(),
            left   = d.getLeft(),
            xx     = c.x,
            yy     = c.y;

        if (xx < left) xx = left;
        if (yy < top)  yy = top;
        if (xx + c.width > d.width - right) xx = d.width + right - c.width;
        if (yy + c.height > d.height - bottom) yy = d.height + bottom - c.height;
        c.setLocation(xx, yy);
    };

    pkg.calcOrigin = function(x,y,w,h,px,py,t,tt,ll,bb,rr){
        if (arguments.length < 8) {
            tt = t.getTop();
            ll = t.getLeft();
            bb = t.getBottom();
            rr = t.getRight();
        }

        var dw = t.width, dh = t.height;
        if (dw > 0 && dh > 0){
            if (dw - ll - rr > w){
                var xx = x + px;
                if (xx < ll) px += (ll - xx);
                else {
                    xx += w;
                    if (xx > dw - rr) px -= (xx - dw + rr);
                }
            }
            if (dh - tt - bb > h){
                var yy = y + py;
                if (yy < tt) py += (tt - yy);
                else {
                    yy += h;
                    if (yy > dh - bb) py -= (yy - dh + bb);
                }
            }
            return [px, py];
        }
        return [0, 0];
    };

    /**
     * This class represents a font and provides basic font metrics like height, ascent. Using
     * the class developers can compute string width.

     // plain font
     var f = new zebkit.ui.Font("Arial", 14);

     // bold font
     var f = new zebkit.ui.Font("Arial", "bold", 14);

     // defining font with CSS font name
     var f = new zebkit.ui.Font("100px Futura, Helvetica, sans-serif");

     * @constructor
     * @param {String} name a name of the font. If size and style parameters has not been passed
     * the name is considered as CSS font name that includes size and style
     * @param {String} [style] a style of the font: "bold", "italic", etc
     * @param {Integer} [size] a size of the font
     * @class zebkit.ui.Font
     */
    pkg.Font = Class([
        function(family, style, size) {
            if (arguments.length === 1) {
                this.size = this.clazz.decodeSize(family);
                if (this.size === null) {
                    // trim
                    family = family.trim();

                    // check if a predefined style has been used
                    if (family === "bold" || family === "italic") {
                        this.style = family;
                    } else {  // otherwise handle it as CSS-like font style
                        // try to parse font if possible
                        var re = /([a-zA-Z_\- ]+)?(([0-9]+px|[0-9]+em)\s+([,\"'a-zA-Z_ \-]+))?/,
                            m  = family.match(re);

                        if (typeof m[4] !== 'undefined') {
                            this.family = m[4].trim();
                        }

                        if (typeof m[3] !== 'undefined') {
                            this.size = m[3].trim();
                        }

                        if (typeof m[1] !== 'undefined') {
                            this.style = m[1].trim();
                        }

                        this.s = family;
                    }
                }
            } else if (arguments.length === 2) {
                this.family = family;
                this.size   = this.clazz.decodeSize(style);
                this.style  = this.size === null ? style : null;
            } else if (arguments.length === 3) {
                this.family = family;
                this.style  = style;
                this.size   = this.clazz.decodeSize(size);
            }

            if (this.size === null) {
                this.size = this.clazz.size + "px";
            }

            if (this.s === null) {
                this.s = ((this.style !== null) ? this.style + " ": "") +
                         this.size + " " +
                         this.family;
            }

            var mt = zebkit.environment.fontMetrics(this.s);

            /**
             * Height of the font
             * @attribute height
             * @readOnly
             * @type {Integer}
             */
            this.height = mt.height;

            /**
             * Ascent of the font
             * @attribute ascent
             * @readOnly
             * @type {Integer}
             */
            this.ascent = mt.ascent;
        },

        function $clazz() {

            // default values
            this.family = "Arial, Helvetica";
            this.style  =  null;
            this.size   =  14;

            this.mergeable = false;

            this.decodeSize = function(s, defaultSize) {
                if (arguments.length < 2) {
                    defaultSize = this.size;
                }

                if (zebkit.isString(s)) {
                    var size = Number(s);
                    if (isNaN(size)) {
                        var m = s.match(/^([0-9]+)(%)$/);
                        if (m !== null && typeof m[1] !== 'undefined' && m[2] !== 'undefined') {
                            size = Math.floor((defaultSize * parseInt(m[1], 10)) / 100);
                            return size + "px";
                        } else {
                            return /^([0-9]+)(em|px)$/.test(s) === true ? s : null;
                        }
                    } else {
                        if (s[0] === '+') {
                            size = defaultSize + size;
                        } else if (s[0] === '-') {
                            size = defaultSize - size;
                        }
                        return size + "px";
                    }
                }
                return s === null ? null : s + "px";
            };
        },

        function $prototype(clazz) {
            this.s = null;

            this.family = clazz.family;
            this.style  = clazz.style;
            this.size   = clazz.size;

            /**
             * Returns CSS font representation
             * @return {String} a CSS representation of the given Font
             * @method toString
             * @for zebkit.ui.Font
             */
            this.toString = function() {
                return this.s;
            };

            this.stringWidth = function(s) {
                if (s.length === 0) {
                    return 0;
                } else {
                    var fm = zebkit.environment.fontMeasure;
                    if (fm.font !== this.s) {
                        fm.font = this.s;
                    }

                    return (fm.measureText(s).width + 0.5) | 0;
                }
            };

            /**
             * Calculate the specified substring width
             * @param  {String} s a string
             * @param  {Integer} off fist character index
             * @param  {Integer} len length of substring
             * @return {Integer} a substring size in pixels
             * @method charsWidth
             * @for zebkit.ui.Font
             */
            this.charsWidth = function(s, off, len) {
                var fm = zebkit.environment.fontMeasure;
                if (fm.font !== this.s) {
                    fm.font = this.s;
                }
                return (fm.measureText(len === 1 ? s[off]
                                                 : s.substring(off, off + len)).width + 0.5) | 0;
            };

            /**
             * Resize font and return new instance of font class with new size.
             * @param  {Integer | String} size can be specified in pixels as integer value or as
             * a percentage from the given font:
             * @return {zebkit.ui.Font} a font
             * @for zebkit.ui.Font
             * @method resize
             * @example
             *
             * ```javascript
             * var font = new zebkit.ui.Font(10); // font 10 pixels
             * font = font.resize("200%"); // two times higher font
             * ```
             */
            this.resize = function(size) {
                var nsize = this.clazz.decodeSize(size, this.height);
                if (nsize === null) {
                    throw new Error("Invalid font size : " + size);
                }
                return new this.clazz(this.family, this.style, nsize);
            };

            this.restyle = function(style) {
                return new this.clazz(this.family, style, this.height + "px");
            };
        }
    ]);

    var $paintTask = null,
        $paintTasks = [],
        temporary = { x:0, y:0, width:0, height:0 },
        COMP_EVENT = new pkg.CompEvent();

    /**
     * Trigger painting for all collected paint tasks
     * @protected
     * @method $doPaint
     * @for zebkit.ui
     */
    pkg.$doPaint = function() {
        for (var i = $paintTasks.length - 1; i >= 0; i--) {
            var canvas = $paintTasks.shift();
            try {
                // do validation before timer will be set to null to avoid
                // unnecessary timer initiating what can be caused by validation
                // procedure by calling repaint method
                if (canvas.isValid === false || canvas.isLayoutValid === false) {
                    canvas.validate();
                }

                if (canvas.$da.width > 0) {
                    canvas.$context.save();

                    // check if the given canvas has transparent background
                    // if it is true call clearRect method to clear dirty area
                    // with transparent background, otherwise it will be cleaned
                    // by filling the canvas with background later
                    if (canvas.bg === null || canvas.bg.isOpaque !== true) {
                        canvas.$context.clearRect(canvas.$da.x, canvas.$da.y,
                                                  canvas.$da.width, canvas.$da.height);
                    }
                    // !!!
                    // call clipping area later than possible
                    // clearRect since it can bring to error in IE
                    canvas.$context.clipRect(canvas.$da.x,
                                             canvas.$da.y,
                                             canvas.$da.width,
                                             canvas.$da.height);

                    // no dirty area anymore. put it hear to prevent calling
                    // animation  task from repaint() method that can be called
                    // inside paintComponent method.
                    canvas.$da.width = -1;

                    // clear flag that says the canvas is waiting for repaint, that allows to call
                    // repaint from paint method
                    canvas.$waitingForPaint = false;

                    canvas.paintComponent(canvas.$context);
                    canvas.$context.restore();
                } else {
                    canvas.$waitingForPaint = false;
                }
            } catch(ex) {
                // catch error and clean task list if any to avoid memory leaks
                try {
                    if (canvas !== null) {
                        canvas.$waitingForPaint = false;
                        canvas.$da.width = -1;
                        if (canvas.$context !== null) {
                            canvas.$context.restoreAll();
                        }
                    }
                } catch(exx) {
                    $paintTask = null;
                    $paintTasks.length = 0;
                    throw exx;
                }

                zebkit.dumpError(ex);
            }
        }

        // paint task is done
        $paintTask = null;

        // test if new dirty canvases have appeared and start
        // animation again
        if ($paintTasks.length !== 0) {
            $paintTask = zebkit.environment.animate(pkg.$doPaint);
        }
    };

    /**
     *  This the core UI component class. All other UI components has to be successor of panel class.

          // instantiate panel with no arguments
          var p = new zebkit.ui.Panel();

          // instantiate panel with border layout set as its layout manager
          var p = new zebkit.ui.Panel(new zebkit.layout.BorderLayout());

          // instantiate panel with the given properties (border
          // layout manager, blue background and plain border)
          var p = new zebkit.ui.Panel({
             layout: new zebkit.ui.BorderLayout(),
             background : "blue",
             border     : "plain"
          });

     *  **Container**
     * Panel can contains number of other UI components as its children where the children components
     * are placed with a defined by the panel layout manager:

          // add few children component to panel top, center and bottom parts
          // with help of border layout manager
          var p = new zebkit.ui.Panel();
          p.setLayout(new zebkit.layout.BorderLayout(4)); // set layout manager to
                                                         // order children components

          p.add("top", new zebkit.ui.Label("Top label"));
          p.add("center", new zebkit.ui.TextArea("Text area"));
          p.add("bottom", new zebkit.ui.Button("Button"));

     * **Events**
     * The class provides possibility to catch various component and input events by declaring an
     * appropriate event method handler. The most simple case you just define a method:

          var p = new zebkit.ui.Panel();
          p.pointerPressed = function(e) {
              // handle event here
          };

    * If you prefer to create an anonymous class instance you can do it as follow:

          var p = new zebkit.ui.Panel([
              function pointerPressed(e) {
                  // handle event here
              }
          ]);

    * One more way to add the event handler is dynamic extending of an instance class demonstrated
    * below:

          var p = new zebkit.ui.Panel("Test");
          p.extend([
              function pointerPressed(e) {
                  // handle event here
              }
          ]);

     * Pay attention Zebkit UI components often declare own event handlers and in this case you can
     * overwrite the default event handler with a new one. Preventing the basic event handler execution
     * can cause the component will work improperly. You should care about the base event handler
     * execution as follow:

          // button component declares own pointer pressed event handler
          // we have to call the original handler to keep the button component
          // properly working
          var p = new zebkit.ui.Button("Test");
          p.extend([
              function pointerPressed(e) {
                  this.$super(e); // call parent class event handler implementation
                  // handle event here
              }
          ]);

     *  @class zebkit.ui.Panel
     *  @param {Object|zebkit.layout.Layout} [l] pass a layout manager or number of properties that have
     *  to be applied to the instance of the panel class.
     *  @constructor
     *  @extends zebkit.layout.Layoutable
     */

    /**
     * Implement the event handler method to catch pointer pressed event. The event is triggered every time
     * a pointer button has been pressed or a finger has touched a touch screen.

         var p = new zebkit.ui.Panel();
         p.pointerPressed = function(e) { ... }; // add event handler

     * @event pointerPressed
     * @param {zebkit.ui.PointerEvent} e a pointer event
    */

    /**
     * Implement the event handler method to catch pointer released event. The event is triggered every time
     * a pointer button has been released or a finger has untouched a touch screen.

         var p = new zebkit.ui.Panel();
         p.pointerReleased = function(e) { ... }; // add event handler

     * @event pointerReleased
     * @param {zebkit.ui.PointerEvent} e a pointer event
     */

    /**
     * Implement the event handler method  to catch pointer moved event. The event is triggered every time
     * a pointer cursor has been moved with no a pointer button pressed.

         var p = new zebkit.ui.Panel();
         p.pointerMoved = function(e) { ... }; // add event handler

     * @param {zebkit.ui.PointerEvent} e a pointer event
     * @event  pointerMoved
     */

    /**
     * Implement the event handler method to catch pointer entered event. The event is triggered every
     * time a pointer cursor entered the given component.

         var p = new zebkit.ui.Panel();
         p.pointerEntered = function(e) { ... }; // add event handler

     * @param {zebkit.ui.PointerEvent} e a pointer event
     * @event  pointerEntered
     */

    /**
     * Implement the event handler method to catch pointer exited event. The event is triggered every
     * time a pointer cursor exited the given component.

         var p = new zebkit.ui.Panel();
         p.pointerExited = function(e) { ... }; // add event handler

     * @param {zebkit.ui.PointerEvent} e a pointer event
     * @event  pointerExited
     */

    /**
     * Implement the event handler method to catch pointer clicked event. The event is triggered every
     * time a pointer button has been clicked. Click events are generated only if no one pointer moved
     * or drag events has been generated in between pointer pressed -> pointer released events sequence.

         var p = new zebkit.ui.Panel();
         p.pointerClicked = function(e) { ... }; // add event handler

     * @param {zebkit.ui.PointerEvent} e a pointer event
     * @event  pointerClicked
     */

    /**
     * Implement the event handler method to catch pointer dragged event. The event is triggered every
     * time a pointer cursor has been moved when a pointer button has been pressed. Or when a finger
     * has been moved over a touch screen.

         var p = new zebkit.ui.Panel();
         p.pointerDragged = function(e) { ... }; // add event handler

     * @param {zebkit.ui.PointerEvent} e a pointer event
     * @event  pointerDragged
     */

    /**
     * Implement the event handler method to catch pointer drag started event. The event is triggered
     * every time a pointer cursor has been moved first time when a pointer button has been pressed.
     * Or when a finger has been moved first time over a touch screen.

         var p = new zebkit.ui.Panel();
         p.pointerDragStarted = function(e) { ... }; // add event handler

     * @param {zebkit.ui.PointerEvent} e a pointer event
     * @event  pointerDragStarted
    */

    /**
     * Implement the event handler method to catch pointer drag ended event. The event is triggered
     * every time a pointer cursor has been moved last time when a pointer button has been pressed.
     * Or when a finger has been moved last time over a touch screen.

         var p = new zebkit.ui.Panel();
         p.pointerDragEnded = function(e) { ... }; // add event handler

     * @param {zebkit.ui.PointerEvent} e a pointer event
     * @event  pointerDragEnded
    */

    /**
     * Implement the event handler method to catch key pressed event The event is triggered every
     * time a key has been pressed.

         var p = new zebkit.ui.Panel();
         p.keyPressed = function(e) { ... }; // add event handler

     * @param {zebkit.ui.KeyEvent} e a key event
     * @event  keyPressed
     */

    /**
     * Implement the event handler method to catch key types event The event is triggered every
     *     time a key has been typed.

         var p = new zebkit.ui.Panel();
         p.keyTyped = function(e) { ... }; // add event handler

     * @param {zebkit.ui.KeyEvent} e a key event
     * @event  keyTyped
     */

    /**
     * Implement the event handler method to catch key released event
     * The event is triggered every time a key has been released.

         var p = new zebkit.ui.Panel();
         p.keyReleased = function(e) { ... }; // add event handler

     * @param {zebkit.ui.KeyEvent} e a key event
     * @event  keyReleased
     */

    /**
     * Implement the event handler method to catch the component sized event
     * The event is triggered every time the component has been re-sized.

         var p = new zebkit.ui.Panel();
         p.compSized = function(e) { ... }; // add event handler

     * @param {zebkit.ui.CompEvent} e a component event. Source of the event
     * is a component that has been sized, "prevWidth" and "prevHeight" fields
     * keep a previous size the component had.
     * @event compSized
     */

    /**
     * Implement the event handler method to catch component moved event
     * The event is triggered every time the component location has been
     * updated.

         var p = new zebkit.ui.Panel();
         p.compMoved = function(e) { ... }; // add event handler

     * @param {zebkit.ui.Panel} c a component that has been moved
     * @param {Integer} px a previous x coordinate the moved component had
     * @param {Integer} py a previous y coordinate the moved component had
     * @param {zebkit.ui.CompEvent} e a component event. Source of the event
     * is a component that has been moved. "prevX" and "prevY" fields hold
     * a previous location the component had.
     * @event compMoved
     */

    /**
     * Implement the event handler method to catch component enabled event
     * The event is triggered every time a component enabled state has been
     * updated.

         var p = new zebkit.ui.Panel();
         p.compEnabled = function(e) { ... }; // add event handler

     * @param {zebkit.ui.CompEvent} e a component event.
     * @event compEnabled
     */

    /**
     * Implement the event handler method to catch component shown event
     * The event is triggered every time a component visibility state has
     * been updated.

         var p = new zebkit.ui.Panel();
         p.compShown = function(e) { ... }; // add event handler

     * @param {zebkit.ui.CompEvent} e a component event.
     * @event compShown
     */

    /**
     * Implement the event handler method to catch component added event
     * The event is triggered every time the component has been inserted into
     * another one.

         var p = new zebkit.ui.Panel();
         p.compAdded = function(e) { ... }; // add event handler

     * @param {zebkit.ui.CompEvent} e a component event. The source of the passed event
     * is set to a container component, "kid" field is set to a component that has been
     * added to the container, "constraints" holds a constraints the child component has been
     * added.
     * @event compAdded
     */

    /**
     * Implement the event handler method to catch component removed event
     * The event is triggered every time the component has been removed from
     * its parent UI component.

         var p = new zebkit.ui.Panel();
         p.compRemoved = function(e) { ... }; // add event handler

     * @param {zebkit.ui.CompEvent} e a component event. The source of the passed event
     * is set to the container component. "kid" field is set to a child component that has
     * been removed from the container and "index" field is set to the index the kid component
     * was added before it had been removed from the container.
     * @event compRemoved
     */

    /**
     * Implement the event handler method to catch component focus gained event
     * The event is triggered every time a component has gained focus.

         var p = new zebkit.ui.Panel();
         p.focusGained = function(e) { ... }; // add event handler

     * @param {zebkit.ui.FocusEvent} e an input event
     * @event  focusGained
     */

    /**
     * Implement the event handler method to catch component focus lost event
     * The event is triggered every time a component has lost focus

         var p = new zebkit.ui.Panel();
         p.focusLost = function(e) { ... }; // add event handler

     * @param {zebkit.ui.FocusEvent} e an input event
     * @event  focusLost
     */

    /**
     * It is also possible to listen all the listed above event for children component. To handle
     * the event register listener method following the pattern below:
     *
         var p = new zebkit.ui.Panel();
         p.child<EventName> = function(e) { ... }; // add event handler

     * @param {Integer} id a component event ID. The id can have one of the following value:


     * @param {zebkit.ui.Panel} src a component that triggers the event
     * @param {zebkit.ui.KeyEvent | zebkit.ui.PointerEvent | zebkit.ui.CompEvent| zebkit.ui.FocusEvent} e an UI event fired by a child component.
     * @event  child<EventName>
     */

     /**
      * The method is called for focusable UI components (components that can hold input focus) to ask
      * a string to be saved in native clipboard
      *
      * @return {String} a string to be copied in native clipboard
      *
      * @event clipCopy
      */

     /**
      * The method is called to pass string from clipboard to a focusable (a component that can hold
      * input focus) UI component
      *
      * @param {String} s a string from native clipboard
      *
      * @event clipPaste
      */
    pkg.Panel = Class(zebkit.layout.Layoutable, [
        function $prototype() {
            this.bg = this.border = null;

            /**
             * Request the whole UI component or part of the UI component to be repainted
             * @param  {Integer} [x] x coordinate of the component area to be repainted
             * @param  {Integer} [y] y coordinate of the component area to be repainted
             * @param  {Integer} [w] width of the component area to be repainted
             * @param  {Integer} [h] height of the component area to be repainted
             * @method repaint
             */
            this.repaint = function(x, y, w ,h) {
                // step I: skip invisible components and components that are not in hierarchy
                //         don't initiate repainting thread for such sort of the components,
                //         but don't forget for zCanvas whose parent field is null, but it has $context
                if (this.isVisible === true && (this.parent !== null || typeof this.$context !== 'undefined')) {
                    //!!! find context buffer that holds the given component

                    var canvas = this;
                    for(; typeof canvas.$context === 'undefined'; canvas = canvas.parent) {
                        // component either is not in visible state or is not in hierarchy
                        // than stop repaint procedure
                        if (canvas.isVisible === false || canvas.parent === null) {
                            return;
                        }
                    }

                    // no arguments means the whole component has top be repainted
                    if (arguments.length === 0) {
                        x = y = 0;
                        w = this.width;
                        h = this.height;
                    }

                    // step II: calculate new actual dirty area
                    if (w > 0 && h > 0) {
                        var r = pkg.$cvp(this, temporary);
                        if (r !== null) {
                            zebkit.util.intersection(r.x, r.y, r.width, r.height, x, y, w, h, r);

                            if (r.width > 0 && r.height > 0) {
                                x = r.x;
                                y = r.y;
                                w = r.width;
                                h = r.height;

                                // calculate repainted component absolute location
                                var cc = this;
                                while (cc !== canvas) {
                                    x += cc.x;
                                    y += cc.y;
                                    cc = cc.parent;
                                }

                                // normalize repaint area coordinates
                                if (x < 0) {
                                    w += x;
                                    x = 0;
                                }

                                if (y < 0) {
                                    h += y;
                                    y = 0;
                                }

                                if (w + x > canvas.width ) w = canvas.width - x;
                                if (h + y > canvas.height) h = canvas.height - y;

                                // still have what to repaint than calculate new
                                // dirty area of target canvas element
                                if (w > 0 && h > 0) {
                                    var da = canvas.$da;

                                    // if the target canvas already has a dirty area set than
                                    // unite it with requested
                                    if (da.width > 0) {
                                        // check if the requested repainted area is not in
                                        // exiting dirty area
                                        if (x < da.x                ||
                                            y < da.y                ||
                                            x + w > da.x + da.width ||
                                            y + h > da.y + da.height  )
                                        {
                                            // !!!
                                            // speed up to comment method call
                                            //MB.unite(da.x, da.y, da.width, da.height, x, y, w, h, da);
                                            var dax = da.x, day = da.y;
                                            if (da.x > x) da.x = x;
                                            if (da.y > y) da.y = y;
                                            da.width  = Math.max(dax + da.width,  x + w) - da.x;
                                            da.height = Math.max(day + da.height, y + h) - da.y;
                                        }
                                    } else {
                                        // if the target canvas doesn't have a dirty area set than
                                        // cut (if necessary) the requested repainting area by the
                                        // canvas size

                                        // !!!
                                        // not necessary to call the method since we have already normalized
                                        // repaint coordinates and sizes
                                        //!!! MB.intersection(0, 0, canvas.width, canvas.height, x, y, w, h, da);

                                        da.x      = x;
                                        da.width  = w;
                                        da.y      = y;
                                        da.height = h;
                                    }
                                }
                            }
                        }
                    }

                    if (canvas.$waitingForPaint !== true && (canvas.isValid === false ||
                                                             canvas.$da.width > 0     ||
                                                             canvas.isLayoutValid === false))
                    {
                        $paintTasks[$paintTasks.length] = canvas;
                        canvas.$waitingForPaint = true;
                        if ($paintTask === null) {
                            $paintTask = zebkit.environment.animate(pkg.$doPaint);
                        }
                    }
                }
            };

            // destination is component itself or one of his composite parent.
            // composite component is a component that grab control from his
            // children component. to make a component composite
            // it has to implement catchInput field or method. If composite component
            // has catchInput method it will be called
            // to detect if the composite component takes control for the given kid.
            // composite components can be embedded (parent composite can take
            // control on its child composite component)
            this.getEventDestination = function() {
                var c = this, p = this;
                while ((p = p.parent) !== null) {
                    if (typeof p.catchInput !== 'undefined' &&
                        (p.catchInput === true || (p.catchInput    !== false &&
                                                   p.catchInput(c) === true     )))
                    {
                        c = p;
                    }
                }
                return c;
            };

            /**
             * Paint the component and all its child components using the
             * given 2D HTML Canvas context
             * @param  {CanvasRenderingContext2D} g a canvas 2D context
             * @method paintComponent
             */
            this.paintComponent = function(g) {
                var ts = g.$states[g.$curState];
                if (ts.width  > 0  &&
                    ts.height > 0  &&
                    this.isVisible === true)
                {
                    // !!!
                    // calling setSize in the case of raster layout doesn't
                    // cause hierarchy layout invalidation
                    if (this.isLayoutValid === false) {
                        this.validate();
                    }

                    var b = this.bg !== null && (this.parent === null || this.bg !== this.parent.bg);

                    // if component defines shape and has update, [paint?] or background that
                    // differs from parent background try to apply the shape and than build
                    // clip from the applied shape
                    if ( (this.border !== null && typeof this.border.outline !== 'undefined') &&
                         (b === true || typeof this.update !== 'undefined')                   &&
                         this.border.outline(g, 0, 0, this.width, this.height, this) === true)
                    {
                        g.save();
                        g.clip();

                        if (b) {
                            this.bg.paint(g, 0, 0, this.width, this.height, this);
                        }

                        if (typeof this.update !== 'undefined') {
                            this.update(g);
                        }

                        g.restore();
                    } else {
                        if (b === true) {
                            this.bg.paint(g, 0, 0, this.width, this.height, this);
                        }

                        if (typeof this.update !== 'undefined') {
                            this.update(g);
                        }
                    }

                    if (this.border !== null) {
                        this.border.paint(g, 0, 0, this.width, this.height, this);
                    }

                    if (typeof this.paint !== 'undefined') {
                        var left   = this.getLeft(),
                            top    = this.getTop(),
                            bottom = this.getBottom(),
                            right  = this.getRight();

                        if (left > 0 || right > 0 || top > 0 || bottom > 0) {
                            if (ts.width > 0 && ts.height > 0) {
                                var x1   = (ts.x > left ? ts.x : left),
                                    y1   = (ts.y > top  ? ts.y : top),
                                    cxcw = ts.x + ts.width,
                                    cych = ts.y + ts.height,
                                    cright = this.width - right,
                                    cbottom = this.height - bottom;

                                g.save();
                                g.clipRect(x1, y1, (cxcw < cright  ? cxcw : cright)  - x1,
                                                   (cych < cbottom ? cych : cbottom) - y1);

                                this.paint(g);
                                g.restore();
                            }
                        } else {
                            this.paint(g);
                        }
                    }

                    var count = this.kids.length;
                    for(var i = 0; i < count; i++) {
                        var kid = this.kids[i];
                        if (kid.isVisible === true && typeof kid.$context === 'undefined') {
                            // calculate if the given component area has intersection
                            // with current clipping area
                            var kidXW = kid.x + kid.width,
                                c_xw  = ts.x + ts.width,
                                kidYH = kid.y + kid.height,
                                c_yh  = ts.y + ts.height,
                                iw = (kidXW < c_xw ? kidXW : c_xw) - (kid.x > ts.x ? kid.x : ts.x),
                                ih = (kidYH < c_yh ? kidYH : c_yh) - (kid.y > ts.y ? kid.y : ts.y);

                            if (iw > 0 && ih > 0) {
                                g.save();
                                g.translate(kid.x, kid.y);
                                g.clipRect(0, 0, kid.width, kid.height);
                                kid.paintComponent(g);
                                g.restore();
                            }
                        }
                    }

                    if (typeof this.paintOnTop !== 'undefined') {
                        this.paintOnTop(g);
                    }
                }
            };

            /**
             * UI component border view
             * @attribute border
             * @default null
             * @readOnly
             * @type {zebkit.ui.View}
             */

            /**
             * UI component background view
             * @attribute bg
             * @default null
             * @readOnly
             * @type {zebkit.ui.View}
            */

            /**
             * Define and set the property to true if the component has to catch focus
             * @attribute canHaveFocus
             * @type {Boolean}
             * @default undefined
             */

            this.top = this.left = this.right = this.bottom = 0;

            /**
             * UI component enabled state
             * @attribute isEnabled
             * @default true
             * @readOnly
             * @type {Boolean}
             */
            this.isEnabled = true;

            /**
             * Find a zebkit.ui.zCanvas where the given UI component is hosted
             * @return {zebkit.ui.zCanvas} a zebkit canvas
             * @method getCanvas
             */
            this.getCanvas = function() {
                var c = this;
                for(; c !== null && c.$isRootCanvas !== true; c = c.parent);
                return c;
            };

            this.notifyRender = function(o, n){
                if (o !== null && typeof o.ownerChanged !== 'undefined') o.ownerChanged(null);
                if (n !== null && typeof n.ownerChanged !== 'undefined') n.ownerChanged(this);
            };

            /**
             * Shortcut method to register the specific to the concrete component
             * events listener. For instance "zebkit.ui.Button" component fires event
             * when it is pressed:

            var b = new zebkit.ui.Button("Test");
            b.on(function() {
                // button has been pressed
            });


             * @param {Function|Object} a listener function or an object that
             * declares events handler methods
             * @return {Function|Object} a registered listener
             * @method bind
             */

            /**
             * Shortcut method to remove the register component specific events listener
             * @param {Function|Object} a listener function to be removed
             * @method unbind
             */


            /**
             * Load content of the panel UI components from the specified JSON file.
             * @param  {String|Object} JSON URL, JSON string or JS object tthat describes UI
             * to be loaded into the panel
             * @return {zebkit.DoIt} a runner to track JSON loading
             * @method load
             */
            this.load = function(jsonPath) {
                return new zebkit.util.Zson(this).then(jsonPath);
            };

            /**
             * Get a children UI component that embeds the given point. The method
             * calculates the component visible area first and than looks for a
             * children component only in this calculated visible area. If no one
             * children component has been found than component return itself as
             * a holder of the given point if one of the following condition is true:
             *
             *   - The component doesn't implement custom "contains(x, y)" method
             *   - The component implements "contains(x, y)" method and for the given point the method return true
             *
             * @param  {Integer} x x coordinate
             * @param  {Integer} y y coordinate
             * @return {zebkit.ui.Panel} a children UI component
             * @method getComponentAt
             */
            this.getComponentAt = function(x, y){
                var r = pkg.$cvp(this, temporary);

                if (r === null ||
                    (x < r.x || y < r.y || x >= r.x + r.width || y >= r.y + r.height))
                {
                    return null;
                }

                if (this.kids.length > 0){
                    for(var i = this.kids.length; --i >= 0; ){
                        var kid = this.kids[i];
                        kid = kid.getComponentAt(x - kid.x,
                                                 y - kid.y);
                        if (kid !== null) return kid;
                    }
                }
                return typeof this.contains === 'undefined' || this.contains(x, y) === true ? this : null;
            };

            /**
             * Shortcut method to invalidating the component and initiating the component repainting
             * @method vrp
             */
            this.vrp = function(){
                this.invalidate();

                // extra condition to save few millisecond on repaint() call
                if (this.isVisible === true && this.parent !== null) {
                    this.repaint();
                }
            };

            this.getTop = function() {
                return this.border !== null ? this.top + this.border.getTop()
                                            : this.top;
            };

            this.getLeft = function() {
                return this.border !== null ? this.left + this.border.getLeft()
                                            : this.left;
            };

            this.getBottom = function() {
                return this.border !== null ? this.bottom + this.border.getBottom()
                                            : this.bottom;
            };

            this.getRight  = function() {
                return this.border !== null ? this.right  + this.border.getRight()
                                            : this.right;
            };

            //TODO: the method is not used yet
            this.isInvalidatedByChild = function(c) {
                return true;
            };

            /**
             * The method is implemented to be aware about a children component insertion.
             * @param  {Integer} index an index at that a new children component
             * has been added
             * @param  {Object} constr a layout constraints of an inserted component
             * @param  {zebkit.ui.Panel} l a children component that has been inserted
             * @method kidAdded
             */
            this.kidAdded = function(index, constr, l) {
                COMP_EVENT.source = this;
                COMP_EVENT.constraints = constr;
                COMP_EVENT.kid = l;

                pkg.events.fire("compAdded", COMP_EVENT);

                if (l.width > 0 && l.height > 0) {
                    l.repaint();
                } else {
                    this.repaint(l.x, l.y, 1, 1);
                }
            };

            /**
             * Set the component layout constraints.
             * @param {Object} ctr a constraints whose value depends on layout manager that has been set
             * @method setConstraints
             * @chainable
             */
            this.setConstraints = function(ctr) {
                if (this.constraints !== ctr) {
                    this.constraints = ctr;
                    if (this.parent !== null) {
                        this.vrp();
                    }
                }
                return this;
            };

            /**
             * The method is implemented to be aware about a children component removal.
             * @param  {Integer} i an index of a removed component
             * @param  {zebkit.ui.Panel} l a removed children component
             * @method kidRemoved
             */
            this.kidRemoved = function(i,l){
                COMP_EVENT.source = this;
                COMP_EVENT.index  = i;
                COMP_EVENT.kid    = l;
                pkg.events.fire("compRemoved", COMP_EVENT);
                if (l.isVisible === true) {
                    this.repaint(l.x, l.y, l.width, l.height);
                }
            };

            /**
             * The method is implemented to be aware the component location updating
             * @param  {Integer} px a previous x coordinate of the component
             * @param  {Integer} py a previous y coordinate of the component
             * @method relocated
             */
            this.relocated = function(px, py) {
                COMP_EVENT.source = this;
                COMP_EVENT.prevX  = px;
                COMP_EVENT.prevY  = py;
                pkg.events.fire("compMoved", COMP_EVENT);

                var p = this.parent,
                    w = this.width,
                    h = this.height;

                if (p !== null && w > 0 && h > 0) {
                    var x = this.x,
                        y = this.y,
                        nx = x < px ? x : px,
                        ny = y < py ? y : py;

                    //TODO: some mobile browser has bug: moving a component
                    //      leaves 0.5 sized traces to fix it 1 pixel extra
                    //      has to be added to all sides of repainted rect area
                    // nx--;
                    // ny--;

                    if (nx < 0) nx = 0;
                    if (ny < 0) ny = 0;

                    var w1 = p.width - nx,
                        w2 = w + (x > px ? x - px : px - x),
                        h1 = p.height - ny,
                        h2 = h + (y > py ? y - py : py - y);

                    // TODO: add crappy 2 for mobile (android)
                    p.repaint(nx, ny, (w1 < w2 ? w1 : w2),// + 2,
                                      (h1 < h2 ? h1 : h2));// + 2);
                }
            };

            /**
             * The method is implemented to be aware the component size updating
             * @param  {Integer} pw a previous width of the component
             * @param  {Integer} ph a previous height of the component
             * @method resized
             */
            this.resized = function(pw,ph) {
                COMP_EVENT.source = this;
                COMP_EVENT.prevWidth  = pw;
                COMP_EVENT.prevHeight = ph;
                pkg.events.fire("compSized", COMP_EVENT);

                if (this.parent !== null) {
                    this.parent.repaint(this.x, this.y,
                                        ((this.width  > pw) ? this.width  : pw),
                                        ((this.height > ph) ? this.height : ph));
                }
            };

            /**
             * Checks if the component has a focus
             * @return {Boolean} true if the component has focus
             * @method hasFocus
             */
            this.hasFocus = function(){
                return pkg.focusManager.hasFocus(this);
            };

            /**
             * Force the given component to catch focus if the component is focusable.
             * @method requestFocus
             */
            this.requestFocus = function(){
                pkg.focusManager.requestFocus(this);
            };

            /**
             * Force the given component to catch focus in the given timeout.
             * @param {Integer} [timeout] a timeout in milliseconds. The default value is 50
             * milliseconds
             * @method requestFocusIn
             */
            this.requestFocusIn = function(timeout) {
                if (arguments.length === 0) {
                    timeout = 50;
                }

                var $this = this;
                zebkit.util.tasksSet.runOnce(function () {
                    $this.requestFocus();
                }, timeout);
            };

            /**
             * Set the UI component visibility
             * @param  {Boolean} b a visibility state
             * @method setVisible
             * @chainable
             */
            this.setVisible = function (b) {
                if (this.isVisible !== b) {
                    this.isVisible = b;
                    this.invalidate();

                    COMP_EVENT.source = this;
                    pkg.events.fire("compShown", COMP_EVENT);

                    if (this.parent !== null) {
                        if (b) this.repaint();
                        else {
                            this.parent.repaint(this.x, this.y, this.width, this.height);
                        }
                    }
                }
                return this;
            };

            /**
             *  Set the UI component enabled state. Using this property
             *  an UI component can be excluded from getting input events
             *  @param  {Boolean} b a enabled state
             *  @method setEnabled
             *  @chainable
             */
            this.setEnabled = function (b){
                if (this.isEnabled !== b){
                    this.isEnabled = b;

                    COMP_EVENT.source = this;
                    pkg.events.fire("compEnabled", COMP_EVENT);
                    if (this.kids.length > 0) {
                        for(var i = 0;i < this.kids.length; i++) {
                            this.kids[i].setEnabled(b);
                        }
                    }
                    this.repaint();
                }
                return this;
            };

            /**
             * Set the UI component top, right, left, bottom paddings to the same given value
             * @param  {Integer} v the value that will be set as top, right, left, bottom UI
             * component paddings
             * @method setPadding
             * @chainable
             */

            /**
             * Set UI component top, left, bottom, right paddings. The paddings are
             * gaps between component border and painted area.
             * @param  {Integer} top a top padding
             * @param  {Integer} left a left padding
             * @param  {Integer} bottom a bottom padding
             * @param  {Integer} right a right padding
             * @method setPadding
             * @chainable
             */
            this.setPadding = function (top,left,bottom,right){
                if (arguments.length === 1) {
                    left = bottom = right = top;
                }

                if (this.top    !== top    || this.left  !== left  ||
                    this.bottom !== bottom || this.right !== right   )
                {
                    this.top = top;
                    this.left = left;
                    this.bottom = bottom;
                    this.right = right;
                    this.vrp();
                }
                return this;
            };

            /**
             * Set top padding
             * @param {Integer} top a top padding
             * @method  setTopPadding
             * @chainable
             */
            this.setTopPadding = function(top) {
                if (this.top !== top) {
                    this.top = top;
                    this.vrp();
                }
                return this;
            };

            /**
             * Set left padding
             * @param {Integer} left a left padding
             * @method  setLeftPadding
             * @chainable
             */
            this.setLeftPadding = function(left) {
                if (this.left !== left) {
                    this.left = left;
                    this.vrp();
                }
                return this;
            };

            /**
             * Set bottom padding
             * @param {Integer} bottom a bottom padding
             * @method  setBottomPadding
             * @chainable
             */
            this.setBottomPadding = function(bottom) {
                if (this.bottom !== bottom) {
                    this.bottom = bottom;
                    this.vrp();
                }
                return this;
            };

            /**
             * Set right padding
             * @param {Integer} right a right padding
             * @method  setRightPadding
             * @chainable
             */
            this.setRightPadding = function(right) {
                if (this.right !== right) {
                    this.right = right;
                    this.vrp();
                }
                return this;
            };

            /**
             * Set the border view
             * @param  {zebkit.ui.View|Function|String} v a border view or border "paint(g,x,y,w,h,c)"
             * rendering function or one of predefined border name: "plain", "sunken", "raised", "etched"
             * @method setBorder
             * @example
             *
             *      var pan = new zebkit.ui.Panel();
             *
             *      // set round border
             *      pan.setBorder(zebkit.ui.RoundBorder("red"));
             *
             *      ...
             *      // set one of predefined border
             *      pan.setBorder("plain");
             *
             * @chainable
             */
            this.setBorder = function (v) {
                var old = this.border;
                v = pkg.$view(v);
                if (v != old){
                    this.border = v;
                    this.notifyRender(old, v);

                    if ( old === null || v === null       ||
                         old.getTop()    !== v.getTop()    ||
                         old.getLeft()   !== v.getLeft()   ||
                         old.getBottom() !== v.getBottom() ||
                         old.getRight()  !== v.getRight()     )
                    {
                        this.invalidate();
                    }

                    if (v !== null && typeof v.activate !== 'undefined') {
                        v.activate(this.hasFocus() ?  "focuson": "focusoff", this);
                    }

                    this.repaint();
                }
                return this;
            };

            /**
             * Set the background. Background can be a color string or a zebkit.ui.View class
             * instance, or a function(g,x,y,w,h,c) that paints the background:
             *
             *     // set background color
             *     comp.setBackground("red");
             *
             *     // set a picture as a component background
             *     comp.setBackground(new zebkit.ui.Picture(...));
             *
             *     // set a custom rendered background
             *     comp.setBackground(function(g,x,y,w,h,target) {
             *         // paint a component background here
             *         g.setColor("blue");
             *         g.fillRect(x,y,w,h);
             *         g.drawLine(...);
             *         ...
             *     });
             *
             *
             * @param  {String|zebkit.ui.View|Function} v a background view, color or
             * background "paint(g,x,y,w,h,c)" rendering function.
             * @method setBackground
             * @chainable
             */
            this.setBackground = function (v){
                var old = this.bg;
                v = pkg.$view(v);
                if (v !== old) {
                    this.bg = v;
                    this.notifyRender(old, v);
                    this.repaint();
                }
                return this;
            };

            /**
             * Add the given children component or number of components to the given panel.
             * @protected
             * @param {zebkit.ui.Panel|Array|Object} a children component of number of
             * components to be added. The parameter can be:
             *
             *   - Component
             *   - Array of components
             *   - Dictionary object where every element is a component to be added and the key of
             *     the component is stored in the dictionary is considered as the component constraints
             *
             * @method setKids
             */
            this.setKids = function(a) {
                if (arguments.length === 1 && zebkit.instanceOf(a, pkg.Panel)) {
                   this.add(a);
                } else {
                    var i = 0;

                    // if components list passed as number of arguments
                    if (arguments.length > 1) {
                        for(i = 0; i < arguments.length; i++) {
                            var kid = arguments[i];
                            if (kid !== null) {
                                this.add(typeof kid.$new !== 'undefined' ? kid.$new() : kid);
                            }
                        }
                    } else {
                        if (Array.isArray(a)) {
                            for(i = 0; i < a.length; i++) {
                                if (a[i] !== null) {
                                    this.add(a[i]);
                                }
                            }
                        } else {
                            var kids = a;
                            for(var k in kids) {
                                if (kids.hasOwnProperty(k)) {
                                    this.add(k, kids[k]);
                                }
                            }
                        }
                    }
                }
            };

            /**
             * Called whenever the UI component gets or looses focus
             * @method focused
             * @protected
             */
            this.focused = function() {
                // extents of activate method indicates it is
                if (this.border !== null && typeof this.border.activate !== 'undefined') {
                    var id = this.hasFocus() ? "focuson" : "focusoff" ;
                    if (typeof this.border.views[id] !== 'undefined') {
                        this.border.activate(id, this);
                        this.repaint();
                    }
                }

                // TODO: think if the background has to be focus dependent
                // if (this.bg !== null && typeof this.bg.activate !== 'undefined') {
                //     var id = this.hasFocus() ? "focuson" : "focusoff" ;
                //     if (this.bg.views[id]) {
                //         this.bg.activate(id);
                //         this.repaint();
                //     }
                // }
            };

            /**
             * Remove all children components
             * @method removeAll
             * @chainable
             */
            this.removeAll = function (){
                if (this.kids.length > 0){
                    var size = this.kids.length, mx1 = Number.MAX_VALUE, my1 = mx1, mx2 = 0, my2 = 0;
                    for(; size > 0; size--){
                        var child = this.kids[size - 1];
                        if (child.isVisible === true){
                            var xx = child.x, yy = child.y;
                            mx1 = mx1 < xx ? mx1 : xx;
                            my1 = my1 < yy ? my1 : yy;
                            mx2 = Math.max(mx2, xx + child.width);
                            my2 = Math.max(my2, yy + child.height);
                        }
                        this.removeAt(size - 1);
                    }
                    this.repaint(mx1, my1, mx2 - mx1, my2 - my1);
                }
                return this;
            };

            /**
             * Bring the UI component to front
             * @method toFront
             * @chainable
             */
            this.toFront = function(){
                if (this.parent !== null && this.parent.kids[this.parent.kids.length-1] !== this){
                    var p = this.parent;
                    p.kids.splice(p.indexOf(this), 1);
                    p.kids[p.kids.length] = this;
                    p.vrp();
                }
                return this;
            };

            /**
             * Send the UI component to back
             * @method toBack
             * @chainable
             */
            this.toBack = function(){
                if (this.parent !== null && this.parent.kids[0] !== this){
                    var p = this.parent;
                    p.kids.splice(p.indexOf(this), 1);
                    p.kids.unshift(this);
                    p.vrp();
                }
                return this;
            };

            /**
             * Set the UI component size to its preferred size
             * @return {Object} a preferred size applied to the component.
             * The structure of the returned object is the following:

                { width:{Integer}, height:{Integer} }

             * @method toPreferredSize
             */
            this.toPreferredSize = function (){
                var ps = this.getPreferredSize();
                this.setSize(ps.width, ps.height);
                return ps;
            };

            /**
             * Build zebkit.ui.View that represents the UI component
             * @return {zebkit.ui.View} a view of the component
             * @param {zebkit.ui.Panel} target a target component
             * @method toView
             */
            this.toView = function(target) {
                return new pkg.CompRender(this);
            };

            // TODO: not stable API
            this.paintViewAt = function(g, ax, ay, v) {
                var x  = this.getLeft(),
                    y  = this.getTop(),
                    ps = v.getPreferredSize();

                if (ax === "center") {
                    x = Math.floor((this.width - ps.width)/2);
                } else if (ax === "right") {
                    x = this.width - this.getRight() - ps.width;
                }

                if (ay === "center") {
                    y = Math.floor((this.height - ps.height)/2);
                } else if (ay === "bottom") {
                    y = this.height - this.getBottom() - ps.height;
                }

                v.paint(g, x, y, ps.width, ps.height, this);
            };

            this[''] = function(l) {
                // !!! dirty trick to call super, for the sake of few milliseconds back
                //this.$super();
                if (typeof this.kids === "undefined") {
                    this.kids = [];
                }

                if (this.layout === null) {
                    this.layout = this;
                }

                if (this.clazz.inheritProperties === true) {
                    // instead of recursion collect stack in array than go through it
                    var hierarchy = [],
                        pp        = this.clazz;

                    // collect clazz hierarchy
                    while(pp.$parent !== null && pp.inheritProperties === true) {
                        pp = pp.$parent;
                        hierarchy[hierarchy.length] = pp;
                    }

                    // apply properties from the hierarchy
                    for(var i = hierarchy.length; i >= 0; i--) {
                        this.properties(hierarchy[i]);
                    }
                }
                this.properties(this.clazz);

                if (arguments.length > 0) {
                    if (l.constructor === Object) {  // TODO: not 100% method to detetect "{}" type
                        this.properties(l);
                    } else {
                        this.setLayout(l);
                    }
                }
            };
        }
    ]);

    /**
     * Root layer interface.
     * @class zebkit.ui.RootLayerMix
     * @interface zebkit.ui.RootLayerMix
     */
    pkg.RootLayerMix = zebkit.Interface([
        function $clazz() {
            /**
             * Root layer id.
             * @attribute id
             * @type {String}
             * @readOnly
             * @default "root"
             */
            this.id = "root";
        },

        function $prototype() {
            this.getFocusRoot = function() {
                return this;
            };
        }
    ]);

    /**
     * Root layer panel implementation.
     * @class zebkit.ui.RootLayer
     * @extends {zebkit.ui.Panel}
     * @use {zebkit.ui.RootLayerMix}
     */
    pkg.RootLayer = Class(pkg.Panel, pkg.RootLayerMix, []);
});
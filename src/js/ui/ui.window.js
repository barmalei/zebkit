zebkit.package("ui", function(pkg, Class) {
    pkg.events.regEvents('winOpened', 'winActivated');

    /**
     * Window component event
     * @constructor
     * @class zebkit.ui.event.WinEvent
     * @extends zebkit.Event
     */
    pkg.event.WinEvent = Class(zebkit.Event, [
        function $prototype() {
            /**
             * Indicates if the window has been shown
             * @attribute isShown
             * @type {Boolean}
             * @readOnly
             */
            this.isShown = false;

            /**
             * Indicates if the window has been activated
             * @attribute isActive
             * @type {Boolean}
             * @readOnly
             */
             this.isActive = false;

            /**
             * Layer the source window belongs to
             * @type {zebkit.ui.Panel}
             * @attribute layer
             * @readOnly
             */
            this.layer = null;

            /**
             * Fill the event with parameters
             * @param  {zebkit.ui.Panel}  src  a source window
             * @param  {zebkit.ui.Panel}  layer  a layer the window belongs to
             * @param  {Boolean} isActive boolean flag that indicates the window status
             * @param  {Boolean} isShown  boolean flag that indicates the window visibility
             * @chainable
             * @method  $fillWidth
             */
            this.$fillWith = function(src, layer, isActive, isShown) {
                this.source = src;

                this.layer    = layer;
                this.isActive = isActive;
                this.isShown  = isShown;
                return this;
            };
        }
    ]);

    var WIN_EVENT = new pkg.event.WinEvent();

    /**
     * Show the given UI component as a modal window
     * @param  {zebkit.ui.Panel} context  an UI component of zebkit hierarchy
     * @param  {zebkit.ui.Panel} win a component to be shown as the modal window
     * @for  zebkit.ui
     * @method showModalWindow
     */
    pkg.showModalWindow = function(context, win) {
        pkg.showWindow(context, "modal", win);
    };

    /**
     * Show the given UI component as a window
     * @param  {zebkit.ui.Panel} context  an UI component of zebkit hierarchy
     * @param  {String} [type] a type of the window: "modal", "mdi", "info". The default
     * value is "info"
     * @param  {zebkit.ui.Panel} win a component to be shown as the window
     * @for  zebkit.ui
     * @method showWindow
     */
    pkg.showWindow = function(context, type, win) {
        if (arguments.length < 3) {
            win  = type;
            type = "info";
        }
        return context.getCanvas().getLayer("win").addWin(type, win);
    };

    /**
     * Activate the given window or a window the specified component belongs
     * @param  {zebkit.ui.Panel} win an UI component to be activated
     * @for zebkit.ui
     * @method activateWindow
     */
    pkg.activateWindow = function(win) {
        var l = win.getCanvas().getLayer("win");
        l.activate(zebkit.layout.getDirectChild(l, win));
    };

    /**
     * Window layer class. Window layer is supposed to be used for showing
     * modal and none modal internal window. There are special ready to use
     * "zebkit.ui.Window" UI component that can be shown as internal window, but
     * zebkit allows developers to show any UI component as modal or none modal
     * window. Add an UI component to window layer to show it as modal o none
     * modal window:
     *
     *       // create canvas
     *       var canvas   = new zebkit.ui.zCanvas();
     *
     *       // get windows layer
     *       var winLayer = canvas.getLayer(zebkit.ui.WinLayerMix.id);
     *
     *       // create standard UI window component
     *       var win = new zebkit.ui.Window();
     *       win.setBounds(10,10,200,200);
     *
     *       // show the created window as modal window
     *       winLayer.addWin("modal", win);
     *
     * Also shortcut method can be used
     *
     *       // create canvas
     *       var canvas   = new zebkit.ui.zCanvas();
     *
     *       // create standard UI window component
     *       var win = new zebkit.ui.Window();
     *       win.setBounds(10,10,200,200);
     *
     *       // show the created window as modal window
     *       zebkit.ui.showModalWindow(canvas, win);
     *
     * Window layer supports three types of windows:
     *
     *   - **"modal"** a modal window catches all input till it will be closed
     *   - **"mdi"** a MDI window can get focus, but it doesn't block switching
     *   focus to other UI elements
     *   - **"info"** an INFO window cannot get focus. It is supposed to show
     *   some information like tooltip.
     *
     * @class zebkit.ui.WinLayer
     * @constructor
     * @extends zebkit.ui.HtmlCanvas
     */
    pkg.WinLayerMix = zebkit.Interface([
        function $clazz() {
            this.id = "win";
        },

        function $prototype() {
            /**
             * Currently activated as a window children component
             * @attribute activeWin
             * @type {zebkit.ui.Panel}
             * @readOnly
             * @protected
             */
            this.activeWin = null;

            this.topModalIndex = -1;

            this.layerPointerPressed = function(e) {
                if (this.kids.length > 0) {

                    // I) check most probable variant - pressed has occurred inside an active window that
                    // is placed on the top of all other windows
                    if (this.activeWin !== null) {
                        if (this.indexOf(this.activeWin) === this.kids.length - 1) {
                            var x1 = this.activeWin.x,
                                y1 = this.activeWin.y,
                                x2 = x1 + this.activeWin.width,
                                y2 = y1 + this.activeWin.height;

                            // pressed has occurred inside the topest active window, so let process
                            // goes normally by calling winLayer.getComponetAt(x,y)
                            if (e.x >= x1 && e.y >= y1 && e.x <= x2 && e.y <= y2) {
                                return false;
                            }
                        }
                    }

                    // II) otherwise looking for a window starting from the topest one where the
                    // pressed event has occurred. Pay attention modal window can open MDI windows
                    for(var i = this.kids.length - 1; i >= 0 && i >= this.topModalIndex; i--) {
                        var d = this.kids[i];

                        if (d.isVisible === true  &&   // check pressed is inside of a MDI window that
                            d.isEnabled === true  &&   // is shown after currently active modal window
                            d.winType  !== "info" &&
                            e.x >= d.x            &&
                            e.y >= d.y            &&
                            e.x < d.x + d.width   &&
                            e.y < d.y + d.height     )
                        {
                            if (d !== this.activeWin) {
                                this.activate(d);
                                return true;
                            } else {
                                return false;  // we are inside activated modal window
                            }
                        }
                    }

                    // III) Check if have to deactivate active MDI window since on prev. step we could not find
                    // a target window  what means pressed was outside of a window
                    if (this.topModalIndex < 0 && this.activeWin !== null) { // no a modal window has been shown
                        this.activate(null);
                        return false;
                    } else {
                        return this.topModalIndex >= 0;
                    }
                }

                return false;
            };

            this.layerKeyPressed = function(e){
                if (this.kids.length > 0 &&
                    e.code === "Tab"     &&
                    e.shiftKey === true     )
                {
                    if (this.activeWin === null) {
                        this.activate(this.kids[this.kids.length - 1]);
                    } else {
                        var winIndex = this.kids.indexOf(this.activeWin) - 1;
                        if (winIndex < this.topModalIndex || winIndex < 0) {
                            winIndex = this.kids.length - 1;
                        }
                        this.activate(this.kids[winIndex]);
                    }

                    return true;
                }
                return false;
            };

            /**
             * Define children components input events handler.
             * @param  {zebkit.ui.event.FocusEvent} e a focus event
             * @method childFocusGained
             */
            this.childFocusGained = function (e) {
                this.activate(zebkit.layout.getDirectChild(this, e.source));
            };

            this.getFocusRoot = function() {
                return this.activeWin;
            };

            this.getWinType = function(w) {
                return w.winType;
            };

            /**
             * Activate the given win layer children component window.
             * @param  {zebkit.ui.Panel} c a component to be activated as window
             * @method activate
             */
            this.activate = function(c) {
                if (c !== null && (this.kids.indexOf(c) < 0 ||
                                   c.winType === "info"))
                {
                    throw new Error("Window cannot be activated");
                }

                if (c !== this.activeWin) {
                    var old = this.activeWin;

                    if (c === null) {
                        var type = this.activeWin.winType;
                        if (type === "modal") {
                            throw new Error("Modal window cannot be de-activated");
                        }

                        this.activeWin = null;
                        pkg.events.fire("winActivated", WIN_EVENT.$fillWith(old, this, false, false));

                        // TODO: special flag $dontGrabFocus is not very elegant solution
                        if (type === "mdi" && old.$dontGrabFocus !== true) {
                            pkg.focusManager.requestFocus(null);
                        }
                    } else {
                        if (this.kids.indexOf(c) < this.topModalIndex) {
                            throw new Error();
                        }

                        this.activeWin = c;
                        this.activeWin.toFront();

                        if (old !== null) {
                            pkg.events.fire("winActivated", WIN_EVENT.$fillWith(old, this, false, false));
                        }

                        pkg.events.fire("winActivated", WIN_EVENT.$fillWith(c, this, true, false));
                        this.activeWin.validate();

                        // TODO: special flag $dontGrabFocus is not very elegant
                        if (this.activeWin.winType === "mdi" && this.activeWin.$dontGrabFocus !== true) {
                            var newFocusable = pkg.focusManager.findFocusable(this.activeWin);
                            pkg.focusManager.requestFocus(newFocusable);
                        }
                    }
                }
            };

            /**
             * Add the given window with the given type and the listener to the layer.
             * @param {String} [type]   a type of the window: "modal",
             * "mdi" or "info"
             * @param {zebkit.ui.Panel} win an UI component to be shown as window
             * @method addWin
             */
            this.addWin = function(type, win) {
                // check if window type argument has been passed
                if (arguments.length > 1) {
                    win.winType = type;
                }
                this.add(win);
            };

            this.getComponentAt = function(x, y) {
                return (this.activeWin === null) ? null
                                                 : this.activeWin.getComponentAt(x - this.activeWin.x,
                                                                                 y - this.activeWin.y);
            };
        },

        function kidAdded(index, constr, lw){
            this.$super(index, constr, lw);

            if (typeof lw.winType === 'undefined') {
                lw.winType = "mdi";
            } else {
                zebkit.util.validateValue(lw.winType, "mdi", "modal", "info");
            }

            if (lw.winType === "modal") {
                this.topModalIndex = this.kids.length - 1;
                pkg.events.fire("winOpened", WIN_EVENT.$fillWith(lw, this, false, true));
                this.activate(lw);
            } else {
                pkg.events.fire("winOpened", WIN_EVENT.$fillWith(lw, this, false, true));
            }
        },

        function kidRemoved(index, lw){
            this.$getSuper("kidRemoved").call(this, index, lw);

            if (this.activeWin === lw) {
                this.activeWin = null;
                // TODO:  deactivated event can be used as a trigger of a window closing so
                // it is better don't fire it here this.fire("winActivated", lw, l);
                if (lw.winType === "mdi" && lw.$dontGrabFocus !== true) {
                    pkg.focusManager.requestFocus(null);
                }
            }

            var ci = index; //this.kids.indexOf(lw);
            if (ci < this.topModalIndex) { // correct top modal window index
                this.topModalIndex--;
            } else if (this.topModalIndex === ci) {
                // looking for a new modal window
                for (this.topModalIndex = this.kids.length - 1; this.topModalIndex >= 0; this.topModalIndex--){
                    if (this.kids[this.topModalIndex].winType === "modal") {
                        break;
                    }
                }
            }

            pkg.events.fire("winOpened", WIN_EVENT.$fillWith(lw, this, false, false));

            if (this.topModalIndex >= 0) {
                var aindex = this.kids.length - 1;
                while (this.kids[aindex].winType === "info") {
                    aindex--;
                }
                this.activate(this.kids[aindex]);
            }
        }
    ]);

    pkg.WinLayer = Class(pkg.Panel, pkg.WinLayerMix, []);

    /**
     * Window UI component class. Implements window like UI component. The window component has a header,
     * status bar and content areas. The header component is usually placed at the top of window, the
     * status bar component is placed at the bottom and the content component at places the central part
     * of the window. Also the window defines corner UI component that is supposed to be used to resize
     * the window. The window implementation provides the following possibilities:

        - Move window by dragging the window on its header
        - Resize window by dragging the window corner element
        - Place buttons in the header to maximize, minimize, close, etc the window
        - Indicates state of window (active or inactive) by changing
        the widow header style
        - Define a window icon component
        - Define a window status bar component

     * @class zebkit.ui.Window
     *
     * @param {String} [s] a window title
     * @param {zebkit.ui.Panel} [c] a window content
     * @constructor
     * @extends zebkit.ui.Panel
     */
    pkg.Window = Class(pkg.StatePan, [
        function (s, c) {
            //!!! for some reason state has to be set beforehand
            this.state = "inactive";

            this.prevH = this.prevX = this.prevY = 0;
            this.px = this.py = this.dx = this.dy = 0;
            this.prevW = this.action = -1;

            /**
             * Window caption panel. The panel contains window
             * icons, button and title label
             * @attribute caption
             * @type {zebkit.ui.Panel}
             * @readOnly
             */
            this.caption = this.createCaptionPan();

            /**
             * Window title component
             * @type {zebkit.ui.Panel}
             * @attribute title
             * @readOnly
             */
            this.title = this.createTitle();

            /**
             * Root window panel. The root panel has to be used to
             * add any UI components
             * @attribute root
             * @type {zebkit.ui.Panel}
             * @readOnly
             */
             if (arguments.length === 0) {
                c = s = null;
             } else if (arguments.length === 1) {
                if (zebkit.instanceOf(s, pkg.Panel)) {
                    c = s;
                    s = null;
                } else {
                    c = null;
                }
             }

            this.root = c === null ? this.createContentPan() : c;
            this.title.setValue(s === null ? "" : s);

            /**
             * Icons panel. The panel can contain number of icons.
             * @type {zebkit.ui.Panel}
             * @attribute icons
             * @readOnly
             */
            this.icons = new pkg.Panel(new zebkit.layout.FlowLayout("left", "center", "horizontal", 2));
            this.icons.add(new this.clazz.Icon());

            /**
             * Window buttons panel. The panel can contain number of window buttons
             * @type {zebkit.ui.Panel}
             * @attribute buttons
             * @readOnly
             */
            this.buttons = new pkg.Panel(new zebkit.layout.FlowLayout("center", "center"));

            this.caption.add("center", this.title);
            this.caption.add("left",   this.icons);
            this.caption.add("right",  this.buttons);

            /**
             * Window status panel.
             * @attribute status
             * @readOnly
             * @type {zebkit.ui.Panel}
             */
            this.status = new this.clazz.StatusPan();
            this.sizer  = new this.clazz.SizerPan();
            this.status.add(this.sizer);

            this.setSizeable(true);

            this.$super();
            this.setLayout(new zebkit.layout.BorderLayout(2,2));

            this.add("center", this.root);
            this.add("top",    this.caption);
            this.add("bottom", this.status);
        },

        function $clazz() {
            this.CaptionPan = Class(pkg.StatePan, [
                function $prototype() {
                    this.state = "inactive";
                }
            ]);

            this.TitleLab   = Class(pkg.Label, []);
            this.StatusPan  = Class(pkg.Panel, []);
            this.ContentPan = Class(pkg.Panel, []);
            this.SizerPan   = Class(pkg.ViewPan, []);
            this.Icon       = Class(pkg.ImagePan, []);
            this.Button     = Class(pkg.Button, []);
        },

        function $prototype() {
            var MOVE_ACTION = 1, SIZE_ACTION = 2;

            this.sizer = this.caption = null;

            this.isPopupEditor = true;

            /**
             * Minimal possible size of the window
             * @default 40
             * @attribute minSize
             * @type {Integer}
             */
            this.minSize = 40;

            /**
             * Indicate if the window can be resized by dragging its by corner
             * @attribute isSizeable
             * @type {Boolean}
             * @default true
             * @readOnly
             */
            this.isSizeable = true;

            /**
             * Test if the window is shown as a window and activated
             * @return {Boolean} true is the window is shown as internal window and
             * is active.
             * @method isActive
             */
            this.isActive = function() {
                var c = this.getCanvas();
                return c !== null && c.getLayer("win").activeWin === this.getWinContainer();
            };

            this.pointerDragStarted = function(e){
                this.px = e.absX;
                this.py = e.absY;
                this.action = this.insideCorner(e.x, e.y) ? (this.isSizeable ? SIZE_ACTION : -1)
                                                          : MOVE_ACTION;
                if (this.action > 0) {
                    this.dy = this.dx = 0;
                }
            };

            this.pointerDragged = function(e){
                if (this.action > 0) {
                    var container = null;

                    if (this.action !== MOVE_ACTION){
                        container = this.getWinContainer();

                        var nw = this.dx + container.width,
                            nh = this.dy + container.height;

                        if (nw > this.minSize && nh > this.minSize) {
                            container.setSize(nw, nh);
                        }
                    }

                    this.dx = (e.absX - this.px);
                    this.dy = (e.absY - this.py);
                    this.px = e.absX;
                    this.py = e.absY;
                    if (this.action === MOVE_ACTION){
                        container = this.getWinContainer();
                        container.setLocation(this.dx + container.x, this.dy + container.y);
                    }
                }
            };

            this.pointerDragEnded = function(e){
                if (this.action > 0){
                    if (this.action === MOVE_ACTION){
                        var container = this.getWinContainer();
                        container.setLocation(this.dx + container.x, this.dy + container.y);
                    }
                    this.action = -1;
                }
            };

            this.getWinContainer = function() {
                return this;
            };

            /**
             * Test if the pointer cursor is inside the window corner component
             * @protected
             * @param  {Integer} px a x coordinate of the pointer cursor
             * @param  {Integer} py a y coordinate of the pointer cursor
             * @return {Boolean}  true if the pointer cursor is inside window
             * corner component
             * @method insideCorner
             */
            this.insideCorner = function(px,py){
                return this.getComponentAt(px, py) === this.sizer;
            };

            this.getCursorType = function(target,x,y){
                return (this.isSizeable && this.insideCorner(x, y)) ? pkg.Cursor.SE_RESIZE
                                                                    : null;
            };

            this.catchInput = function(c){
                var tp = this.caption;
                return c === tp ||
                      (zebkit.layout.isAncestorOf(tp, c) && zebkit.instanceOf(c, pkg.Button) === false) ||
                       this.sizer === c;
            };

            this.winOpened = function(e) {
                var state = this.isActive() ? "active" : "inactive";
                if (this.caption !== null && typeof this.caption.setState !== 'undefined') {
                    this.caption.setState(state);
                }
                this.setState(state);
            };

            this.winActivated = function(e) {
                this.winOpened(e);
            };

            this.pointerDoubleClicked = function (e){
                var x = e.x, y = e.y, cc = this.caption;
                if (this.isSizeable === true &&
                    x > cc.x &&
                    x < cc.y + cc.width &&
                    y > cc.y &&
                    y < cc.y + cc.height)
                {
                    if (this.prevW < 0) {
                        this.maximize();
                    } else {
                        this.restore();
                    }
                }
            };

            /**
             * Test if the window has been maximized to occupy the whole
             * window layer space.
             * @return {Boolean} true if the window has been maximized
             * @method isMaximized
             */
            this.isMaximized = function() {
                return this.prevW !== -1;
            };

            /**
             * Create a caption component
             * @return {zebkit.ui.Panel} a zebkit caption component
             * @method createCaptionPan
             * @protected
             */
            this.createCaptionPan = function() {
                return new this.clazz.CaptionPan();
            };

            /**
             * Create a content component
             * @return {zebkit.ui.Panel} a content component
             * @method createContentPan
             * @protected
             */
            this.createContentPan = function() {
                return new this.clazz.ContentPan();
            };

            /**
             * Create a caption title label
             * @return {zebkit.ui.Label} a caption title label
             * @method createTitle
             * @protected
             */
            this.createTitle = function() {
                return new this.clazz.TitleLab();
            };

            this.setIcon = function(i, icon) {
                if (zebkit.isString(icon) || zebkit.instanceOf(icon, zebkit.draw.Picture)) {
                    icon = new pkg.ImagePan(icon);
                }
                this.icons.setAt(i, icon);
                return this;
            };

            /**
             * Make the window sizable or not sizeable
             * @param {Boolean} b a sizeable state of the window
             * @chainable
             * @method setSizeable
             */
            this.setSizeable = function(b){
                if (this.isSizeable !== b){
                    this.isSizeable = b;
                    if (this.sizer !== null) {
                        this.sizer.setVisible(b);
                    }
                }
                return this;
            };

            /**
             * Maximize the window
             * @method maximize
             * @chainable
             */
            this.maximize = function(){
                if (this.prevW < 0){
                    var d    = this.getCanvas(),
                        cont = this.getWinContainer(),
                        left = d.getLeft(),
                        top  = d.getTop();

                    this.prevX = cont.x;
                    this.prevY = cont.y;
                    this.prevW = cont.width;
                    this.prevH = cont.height;

                    cont.setBounds(left, top,
                                   d.width  - left - d.getRight(),
                                   d.height - top - d.getBottom());
                }
                return this;
            };

            /**
             * Restore the window size
             * @method restore
             * @chainable
             */
            this.restore = function(){
                if (this.prevW >= 0){
                    this.getWinContainer().setBounds(this.prevX, this.prevY,
                                                     this.prevW, this.prevH);
                    this.prevW = -1;
                }
                return this;
            };

            /**
             * Close the window
             * @method close
             * @chainable
             */
            this.close = function() {
                this.getWinContainer().removeMe();
                return this;
            };

            /**
             * Set the window buttons set.
             * @param {Object} buttons dictionary of buttons icons for window buttons.
             * The dictionary key defines a method of the window component to be called
             * when the given button has been pressed. So the method has to be defined
             * in the window component.
             * @method setButtons
             */
            this.setButtons = function(buttons) {
                // remove previously added buttons
                for(var i = 0; i < this.buttons.length; i++) {
                    var kid = this.buttons.kids[i];
                    if (kid.isEventFired()) {
                        kid.off();
                    }
                }
                this.buttons.removeAll();

                // add new buttons set
                for(var k in buttons) {
                    if (buttons.hasOwnProperty(k)) {
                        var b = new this.clazz.Button();
                        b.properties(buttons[k]);
                        this.buttons.add(b);

                        (function(t, f) {
                            b.on(function() { f.call(t); });
                        })(this, this[k]);
                    }
                }
                return this;
            };
        },

        function focused(){
            this.$super();
            if (this.caption !== null) {
                this.caption.repaint();
            }
        }
    ]);
});
(function(pkg, Class) {

var KE = pkg.KeyEvent, task = zebra.util.task, L = zebra.layout,
    WIN_OPENED = 1, WIN_CLOSED = 2, WIN_ACTIVATED = 3, WIN_DEACTIVATED = 4,
    WinListeners = zebra.util.ListenersClass("winOpened", "winActivated");

/**
 * Show the given UI component as a modal window
 * @param  {zebra.ui.Panel} context  an UI component of zebra hierarchy
 * @param  {zebra.ui.Panel} win a component to be shown as the modal window
 * @param  {Object} [listener] a window listener

        {
            winActivated : function(layer, win, isActive) {

            },

            winOpened : function(layer, win, isOpened) {

            }
        }

 * @api  zebra.ui.showModalWindow()
 * @method showWindow
 */
pkg.showModalWindow = function(context, win, listener) {
    pkg.showWindow(context, "modal", win, listener);
};

/**
 * Show the given UI component as a window
 * @param  {zebra.ui.Panel} context  an UI component of zebra hierarchy
 * @param  {String} [type] a type of the window: "modal", "mdi", "info". The default
 * value is "info"
 * @param  {zebra.ui.Panel} win a component to be shown as the window
 * @param  {Object} [listener] a window listener

        {
            winActivated : function(layer, win, isActive) {
               ...
            },

            winOpened : function(layer, win, isOpened) {
              ...
            }
        }

 * @api  zebra.ui.showWindow()
 * @method showWindow
 */
pkg.showWindow = function(context, type, win, listener) {
    if (arguments.length < 3) {
        win  = type;
        type = "info";
    }
    return context.getCanvas().getLayer("win").addWin(type, win, listener);
};

pkg.showPopupMenu = function(context, menu) {
    context.getCanvas().getLayer("pop").add(menu);
};

/**
 * Activate the given window or a window the specified component belongs
 * @param  {zebra.ui.Panel} win [description]
 * @api zebra.ui.activateWindow()
 * @method activateWindow
 */
pkg.activateWindow = function(win) {
    var l = win.getCanvas().getLayer("win");
    l.activate(L.getDirectChild(l, win));
};

/**
 * Window layer class. Window layer is supposed to be used for showing
 * modal and none modal internal window. There are special ready to use
 * "zebra.ui.Window" UI component that can be shown as internal window, but
 * zebra allows developers to show any UI component as modal or none modal
 * window. Add an UI component to window layer to show it as modal o none
 * modal window:

        // create canvas
        var canvas   = new zebra.ui.zCanvas();

        // get windows layer
        var winLayer = canvas.getLayer(zebra.ui.WinLayer.ID);

        // create standard UI window component
        var win = new zebra.ui.Window();
        win.setBounds(10,10,200,200);

        // show the created window as modal window
        winLayer.addWin("modal", win);

 * Also shortcut method can be used

        // create canvas
        var canvas   = new zebra.ui.zCanvas();

        // create standard UI window component
        var win = new zebra.ui.Window();
        win.setBounds(10,10,200,200);

        // show the created window as modal window
        zebra.ui.showModalWindow(canvas, win);

 * Window layer supports three types of windows:

    - **"modal"** a modal window catches all input till it will be closed
    - **"mdi"** a MDI window can get focus, but it doesn't block switching
    focus to other UI elements
    - **"info"** an INFO window cannot get focus. It is supposed to show
    some information like tooltip.

 * @class zebra.ui.WinLayer
 * @constructor
 * @extends {zebra.ui.BaseLayer}
 */
pkg.WinLayer = Class(pkg.BaseLayer, [
    function $clazz() {
        this.ID = "win";
    },

    function $prototype() {
        this.isLayerActiveAt = function(x, y) {
            return this.activeWin != null;
        };

        this.layerMousePressed = function(x,y,mask){
            var cnt = this.kids.length;
            if (cnt > 0) {
                // check if mouse pressed has occurred in the topest window since
                // this is the most probable case
                if (this.activeWin != null && this.indexOf(this.activeWin) == cnt - 1) {
                    var x1 = this.activeWin.x,
                        y1 = this.activeWin.y,
                        x2 = x1 + this.activeWin.width,
                        y2 = y1 + this.activeWin.height;

                    if (x >= x1 && y >= y1 && x < x2 && y < y2) {
                        return true;
                    }
                }

                // otherwise looking for a window starting from the topest one
                for(var i = cnt - 1; i >= 0 && i >= this.topModalIndex; i--){
                    var d = this.kids[i];

                    if (d.isVisible === true &&
                        d.isEnabled === true &&
                        this.winsTypes[d] != "info" &&
                        x >= d.x && y >= d.y &&
                        x < d.x + d.width && y < d.y + d.height)
                    {
                        this.activate(d);
                        return true;
                    }
                }

                if (this.topModalIndex < 0 && this.activeWin != null) {
                    this.activate(null);
                    return false;
                }

                return true;
            }

            return false;
        };

        this.layerKeyPressed = function(keyCode,mask){
            if (this.kids.length > 0    &&
                keyCode == KE.TAB       &&
                (mask & KE.M_SHIFT) > 0   )
            {
                if (this.activeWin == null) {
                    this.activate(this.kids[this.kids.length - 1]);
                }
                else {
                    var winIndex = this.winsStack.indexOf(this.activeWin) - 1;
                    if (winIndex < this.topModalIndex || winIndex < 0) {
                        winIndex = this.winsStack.length - 1;
                    }
                    this.activate(this.winsStack[winIndex]);
                }

                return true;
            }
            return false;
        };

        /**
         * Define children components input events handler.
         * @param  {zebra.ui.InputEvent|zebra.ui.KeyEvent|zebra.ui.MouseEvent} e an input event
         * @method childInputEvent
         */
        this.childInputEvent = function (e) {
            if (e.ID == pkg.InputEvent.FOCUS_GAINED) {
                this.activate(L.getDirectChild(this, e.source));
            }
        };

        this.getComponentAt = function(x,y){
            return (this.activeWin == null) ? null
                                            : this.activeWin.getComponentAt(x - this.activeWin.x,
                                                                            y - this.activeWin.y);
        };

        this.getFocusRoot = function(child) {
            return this.activeWin;
        };

        this.getWinType = function(w) {
            return this.winsTypes[w];
        };

        /**
         * Activate the given win layer children component window.
         * @param  {zebra.ui.Panel} c a component to be activated as window
         * @method activate
         */
        this.activate = function(c){

            if (c != null && (this.kids.indexOf(c) < 0 ||
                              this.winsTypes[c] == "info"))
            {
                throw new Error("Window cannot be activated");
            }

            if (c != this.activeWin) {
                var old = this.activeWin;
                if (c == null) {
                    if (this.winsTypes[this.activeWin] == "modal") {
                        throw new Error();
                    }

                    this.activeWin = null;
                    this.fire(WIN_DEACTIVATED, old);
                    pkg.focusManager.requestFocus(null);
                }
                else {
                    if (this.winsStack.indexOf(c) < this.topModalIndex) {
                        throw new Error();
                    }

                    this.activeWin = c;
                    this.activeWin.toFront();

                    if (old != null) {
                        this.fire(WIN_DEACTIVATED, old);
                    }

                    this.fire(WIN_ACTIVATED, this.activeWin);
                    this.activeWin.validate();
                    pkg.focusManager.requestFocus(pkg.focusManager.findFocusable(this.activeWin));
                }
            }
        };

        this.fire = function(id, win, l) {
            if (arguments.length < 3) {
                l = this.winsListeners[win];
            }

            var b = (id == WIN_OPENED || id == WIN_ACTIVATED),
                n = (id == WIN_OPENED || id == WIN_CLOSED) ? "winOpened"
                                                           : "winActivated";

            this._[n](this, win, b);
            if (win[n] != null) {
                win[n].apply(win, [this, win, b]);
            }

            if (l != null && l[n] != null) {
                l[n].apply(l, [this, win, b]);
            }
        };

        /**
         * Add the given window with the given type and the listener to the layer.
         * @param {String} type   a type of the window: "modal",
         * "mdi" or "info"
         * @param {zebra.ui.Panel} win an UI component to be shown as window
         * @param {Object} [listener] an optional the window listener

         {
             winActivated : function(layer, win, isActive) {

             },

             winOpened : function(layer, win, isOpened) {

             }
         }

         * @method addWin
         */
        this.addWin = function(type, win, listener) {
            this.winsTypes[win] = type;
            this.winsListeners[win] = listener;
            this.add(win);
        };
    },

    function () {
        /**
         * Currently activated as a window children component
         * @attribute activeWin
         * @type {zebra.ui.Panel}
         * @readOnly
         * @protected
         */
        this.activeWin     = null;
        this.topModalIndex = -1;
        this.winsStack     = [];
        this.winsListeners = {};
        this.winsTypes     = {};

        this._ = new WinListeners();
        this.$super(pkg.WinLayer.ID);
    },

    function insert(index, constr, lw) {
        var type = this.winsTypes[lw];

        if (typeof type === 'undefined') {
            type = "mdi";
            this.winsTypes[lw] = type;
        }

        if (type != "mdi" && type != "modal" && type != "info") {
            throw new Error("Invalid window type: " + type);
        }

        return this.$super(index, constr, lw);
    },

    function kidAdded(index,constr,lw){
        this.$super(index, constr, lw);

        var type = this.winsTypes[lw];
        this.winsStack.push(lw);
        if (type == "modal") {
            this.topModalIndex = this.winsStack.length - 1;
        }

        this.fire(WIN_OPENED, lw);
        if (type == "modal") this.activate(lw);
    },

    function kidRemoved(index,lw){
        try {
            this.$super(this.kidRemoved,index, lw);
            if (this.activeWin == lw){
                this.activeWin = null;
                pkg.focusManager.requestFocus(null);
            }

            var ci = this.winsStack.indexOf(lw),
                l  = this.winsListeners[lw];

            this.winsStack.splice(this.winsStack.indexOf(lw), 1);

            if (ci < this.topModalIndex) {
                this.topModalIndex--;
            }
            else {
                if (this.topModalIndex == ci){
                    for(this.topModalIndex = this.kids.length - 1;this.topModalIndex >= 0; this.topModalIndex--){
                        if (this.winsTypes[this.winsStack[this.topModalIndex]] == "modal") break;
                    }
                }
            }

            this.fire(WIN_CLOSED, lw, l);

            if (this.topModalIndex >= 0){
                var aindex = this.winsStack.length - 1;
                while(this.winsTypes[this.winsStack[aindex]] == "info") {
                    aindex--;
                }
                this.activate(this.winsStack[aindex]);
            }
        }
        finally {
            delete this.winsTypes[lw];
            delete this.winsListeners[lw];
        }
    }
]);

/**
 * Window UI component class. Implements window like UI component.
 * The window component has a header, status bar and content areas. The header component
 * is usually placed at the top of window, the status bar component is placed at the bottom and
 * the content component at places the central part of the window. Also the window defines
 * corner UI component that is supposed to be used to resize the window. The window implementation
 * provides the following possibilities:

    - Move window by dragging the window on its header
    - Resize window by dragging the window corner element
    - Place buttons in the header to maximize, minimize, close, etc the window
    - Indicates state of window (active or inactive) by changing
    the widow header style
    - Define a window icon component
    - Define a window status bar component

 * @class zebra.ui.Window
 *
 * @param {String} [content] a window title
 * @param {zebra.ui.Panel} [content] a window content
 * @constructor
 * @extends {zebra.ui.Panel}
 */
pkg.Window = Class(pkg.StatePan, [

    function $prototype() {
        var MOVE_ACTION = 1, SIZE_ACTION = 2;

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
            return c != null && c.getLayer("win").activeWin == this;
        };

        this.mouseDragStarted = function(e){
            this.px = e.x;
            this.py = e.y;
            this.psw = this.width;
            this.psh = this.height;
            this.action = this.insideCorner(this.px, this.py) ? (this.isSizeable ? SIZE_ACTION : -1)
                                                              : MOVE_ACTION;
            if (this.action > 0) this.dy = this.dx = 0;
        };

        this.mouseDragged = function(e){
            if (this.action > 0){
                if (this.action != MOVE_ACTION){
                    var nw = this.psw + this.dx, nh = this.psh + this.dy;
                    if (nw > this.minSize && nh > this.minSize) {
                        this.setSize(nw, nh);
                    }
                }
                this.dx = (e.x - this.px);
                this.dy = (e.y - this.py);
                if (this.action == MOVE_ACTION){
                    this.invalidate();
                    this.setLocation(this.x + this.dx, this.y + this.dy);
                }
            }
        };

        this.mouseDragEnded = function(e){
            if (this.action > 0){
                if (this.action == MOVE_ACTION){
                    this.invalidate();
                    this.setLocation(this.x + this.dx, this.y + this.dy);
                }
                this.action = -1;
            }
        };

        /**
         * Test if the mouse cursor is inside the window corner component
         * @protected
         * @param  {Integer} px a x coordinate of the mouse cursor
         * @param  {Integer} py a y coordinate of the mouse cursor
         * @return {Boolean}  true if the mouse cursor is inside window
         * corner component
         * @method insideCorner
         */
        this.insideCorner = function(px,py){
            return this.getComponentAt(px, py) == this.sizer;
        };

        this.getCursorType = function(target,x,y){
            return (this.isSizeable && this.insideCorner(x, y)) ? pkg.Cursor.SE_RESIZE
                                                                : null;
        };

        this.catchInput = function(c){
            var tp = this.caption;
            return c == tp || (L.isAncestorOf(tp, c)          &&
                   zebra.instanceOf(c, pkg.Button) === false) ||
                   this.sizer == c;
        };

        this.winOpened = function(winLayer,target,b) {
            var state = this.isActive() ? "active" : "inactive";

            if (this.caption != null && this.caption.setState) {
                this.caption.setState(state);
            }
            this.setState(state);
        };

        this.winActivated = function(winLayer, target,b){
            this.winOpened(winLayer, target,b);
        };

        this.mouseClicked= function (e){
            var x = e.x, y = e.y, cc = this.caption;
            if (e.clicks == 2 && this.isSizeable && x > cc.x &&
                x < cc.y + cc.width && y > cc.y && y < cc.y + cc.height)
            {
                if (this.prevW < 0) this.maximize();
                else this.restore();
            }
        };

        /**
         * Test if the window has been maximized to occupy the whole
         * window layer space.
         * @return {Boolean} true if the window has been maximized
         * @method isMaximized
         */
        this.isMaximized = function() {
            return this.prevW != -1;
        };

        this.createCaptionPan = function() {
            return new this.$clazz.CaptionPan();
        };

        this.createContentPan = function() {
            return new this.$clazz.ContentPan();
        };

        this.createTitle = function() {
            return new this.$clazz.TitleLab();
        };

        this.setIcon = function(i, icon) {
            if (zebra.isString(icon) || zebra.instanceOf(icon, pkg.Picture)) {
                icon = new pkg.ImagePan(icon);
            }
            this.icons.setAt(i, icon);
        };
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
        this.SizerIcon  = Class(pkg.ImagePan, []);
        this.Icon       = Class(pkg.ImagePan, []);
        this.Button     = Class(pkg.Button, []);
    },

    function () {
        this.$this(null, null);
    },

    function (s) {
        if (s != null && zebra.isString(s)) this.$this(s, null);
        else                                this.$this(null, s);
    },

    function (s, c) {
        //!!! for some reason state has to be set beforehand
        this.state = "inactive";

        this.prevH = this.prevX = this.prevY = this.psw = 0;
        this.psh = this.px = this.py = this.dx = this.dy = 0;
        this.prevW = this.action = -1;

        /**
         * Root window panel. The root panel has to be used to
         * add any UI components
         * @attribute root
         * @type {zebra.ui.Panel}
         * @readOnly
         */
        this.root = (c == null ? this.createContentPan() : c);

        /**
         * Window caption panel. The panel contains window
         * icons, button and title label
         * @attribute caption
         * @type {zebra.ui.Panel}
         * @readOnly
         */
        this.caption = this.createCaptionPan();

        /**
         * Window title component
         * @type {zebra.ui.Panel}
         * @attribute title
         * @readOnly
         */
        this.title = this.createTitle();
        this.title.setValue((s == null ? "" : s));

        /**
         * Icons panel. The panel can contain number of icons.
         * @type {zebra.ui.Panel}
         * @attribute icons
         * @readOnly
         */
        this.icons = new pkg.Panel(new L.FlowLayout(L.LEFT, L.CENTER, L.HORIZONTAL, 2));
        this.icons.add(new this.$clazz.Icon());

        /**
         * Window buttons panel. The panel can contain number of window buttons
         * @type {zebra.ui.Panel}
         * @attribute buttons
         * @readOnly
         */
        this.buttons = new pkg.Panel(new L.FlowLayout(L.CENTER, L.CENTER));

        this.caption.add(L.CENTER, this.title);
        this.caption.add(L.LEFT, this.icons);
        this.caption.add(L.RIGHT, this.buttons);

        /**
         * Window status panel.
         * @attribute status
         * @readOnly
         * @type {zebra.ui.Panel}
         */
        this.status = new this.$clazz.StatusPan();
        this.sizer  = new this.$clazz.SizerIcon();
        this.status.add(this.sizer);

        this.setSizeable(true);

        this.$super(new L.BorderLayout(2,2));

        this.add(L.CENTER, this.root);
        this.add(L.TOP, this.caption);
        this.add(L.BOTTOM, this.status);
    },

    function fired(src) {
        this.removeMe();
    },

    function focused(){
        this.$super();
        if (this.caption != null) {
            this.caption.repaint();
        }
    },

    /**
     * Make the window sizable or not sizeable
     * @param {Boolean} b a sizeable state of the window
     * @method setSizeable
     */
    function setSizeable(b){
        if (this.isSizeable != b){
            this.isSizeable = b;
            if (this.sizer != null) {
                this.sizer.setVisible(b);
            }
        }
    },

    /**
     * Maximize the window
     * @method maximize
     */
    function maximize(){
        if(this.prevW < 0){
            var d    = this.getCanvas(),
                left = d.getLeft(),
                top  = d.getTop();

            this.prevX = this.x;
            this.prevY = this.y;
            this.prevW = this.width;
            this.prevH = this.height;
            this.setLocation(left, top);
            this.setSize(d.width - left - d.getRight(),
                         d.height - top - d.getBottom());
        }
    },

    /**
     * Restore the window size
     * @method restore
     */
    function restore(){
        if (this.prevW >= 0){
            this.setLocation(this.prevX, this.prevY);
            this.setSize(this.prevW, this.prevH);
            this.prevW = -1;
        }
    },

    /**
     * Close the window
     * @method close
     */
    function close() {
        this.removeMe();
    },

    /**
     * Set the window buttons set.
     * @param {Object} buttons dictionary of buttons icons for window buttons.
     * The dictionary key defines a method of the window component to be called
     * when the given button has been pressed. So the method has to be defined
     * in the window component.
     * @method setButtons
     */
    function setButtons(buttons) {
        // remove previously added buttons
        for(var i=0; i< this.buttons.length; i++) {
            var kid = this.buttons.kids[i];
            if (kid._ != null) kid.unbind();
        }
        this.buttons.removeAll();

        // add new buttons set
        for(var k in buttons) {
            if (buttons.hasOwnProperty(k)) {
                var b = new this.$clazz.Button();
                b.setView(buttons[k]);
                this.buttons.add(b);
                (function(t, f) {
                    b.bind(function() { f.call(t); });
                })(this, this[k]);
            }
        }
    }
]);

/**
 * Menu item panel class. The component holds menu item content like
 * caption, icon, sub-menu sign elements. The area of the component
 * is split into three parts: left, right and center. Central part
 * keeps content, left side keeps checked sign element
 * and the right side keeps sub-menu sign element.
 * @param  {String|zebra.ui.Panel} caption a menu item caption string
 * or component. Caption string can encode the item id, item icon and
 * item checked state. For instance:

    - **"Menu Item [@menu_item_id]"** - triggers creation of menu item component
      with "Menu Item" caption and "menu_item_id" id property value
    - **"[x] Menu Item"** - triggers creation of checked menu item component
      with checked on state
    - **"@('mypicture.gif') Menu Item"** - triggers creation of menu item
       component with "Menu Item" caption and loaded mypicture.gif icon

        // create menu item with icon and "Item 1" title
        var mi = new zebra.ui.MenuItem("@('mypicture.gif') Item 1");

 * @class zebra.ui.MenuItem
 * @extends {zebra.ui.Panel}
 * @constructor
 */
pkg.MenuItem = Class(pkg.Panel, [
    function $clazz() {
        this.SubImage      = Class(pkg.StatePan, []);
        this.Label         = Class(pkg.Label,    []);
        this.CheckStatePan = Class(pkg.ViewPan,  []);
    },

    function $prototype() {
        /**
         * Gap between checked, content and sub menu arrow components
         * @attribute gap
         * @type {Integer}
         * @readOnly
         * @default 8
         */
        this.gap = 8;

        /**
         * Switch manager that is set to make the item checkable
         * @type {zebra.ui.SwitchManager | zebra.ui.Group}
         * @attribute manager
         * @readOnly
         */
        this.manager = null;

        /**
         * Callback method that is called every time the menu item has
         * been selected.
         * @method  itemSelected
         */
        this.itemSelected = function() {
            var content = this.getContent();
            if (zebra.instanceOf(content, pkg.Checkbox)) {
                content.setValue(!content.getValue());
            }

            if (this.manager != null) {
                this.manager.setValue(this, !this.manager.getValue(this));
            }
        };

        /**
         * Set the menu item icon.
         * @param {String|Image} img a path to an image or image object
         * @method setIcon
         */
        this.setIcon = function(img) {
            this.getContent().setImage(img);
        };

        /**
         * Set the menu item caption.
         * @param {String} caption a caption
         * @method setCaption
         */
        this.setCaption = function(caption) {
            this.getContent().setCaption(caption);
        };

        /**
         * Callback method that is called every time a checked state
         * of the menu item has been updated
         * @param {Boolean} b a new checked state
         * @method switched
         * @protected
         */
        this.switched = function(b) {
            this.kids[0].view.activate(b ? (this.isEnabled === true ? "on" : "dis.on") : "off");
        };

        /**
         * Get check state component
         * @return {zebra.ui.Panel} a check state component
         * @method getCheck
         * @protected
         */
        this.getCheck = function() {
            return this.kids[0];
        };

        /**
         * Get content component
         * @return {zebra.ui.Panel} a content component
         * @method getContent
         * @protected
         */
        this.getContent = function() {
            return this.kids[1];
        };

        /**
         * Get menu item child component to render sub item arrow element
         * @return {zebra.ui.Panel} a sub item arrow component
         * @method getSub
         * @protected
         */
        this.getSub = function() {
            return this.kids[2];
        };

        /**
         * Hide sub menu arrow component
         * @method hideSub
         */
        this.hideSub = function() {
            this.getSub().setVisible(false);
        };

        this.activateSub = function(b) {
            var kid = this.getSub();
            kid.setState(b ? "arrow" : "*");
            if (this.parent != null && this.parent.noSubIfEmpty === true) {
                kid.setVisible(b);
            }
        };

        this.calcPreferredSize = function (target){
            var cc = 0, pw = 0, ph = 0;

            for(var i=0; i < target.kids.length; i++) {
                var k = target.kids[i];
                if (k.isVisible === true) {
                    var ps = k.getPreferredSize();
                    pw += ps.width + (cc > 0 ? this.gap : 0);
                    if (ps.height > ph) ph = ps.height;
                    cc ++;
                }
            }

            return { width:pw, height:ph };
        };

        this.doLayout = function(target){
            var left    = this.getCheck(),
                right   = this.getSub(),
                content = this.getContent(),
                t       = target.getTop(),
                l       = target.getLeft(),
                eh      = target.height - t - target.getBottom(),
                ew      = target.width  - l - target.getRight();

            if (left != null && left.isVisible === true) {
                left.toPreferredSize();
                left.setLocation(l, t + ~~((eh - left.height)/2));
                l += this.gap + left.width;
                ew -= (this.gap + left.width);
            }

            if (right != null && right.isVisible === true) {
                right.toPreferredSize();
                right.setLocation(target.width - target.getRight() - right.width,
                                  t + ~~((eh - right.height)/2));
                ew -= (this.gap + right.width);
            }

            if (content != null && content.isVisible === true) {
                content.toPreferredSize();
                if (content.width > ew) {
                    content.setSize(ew, content.height);
                }
                content.setLocation(l, t + ~~((eh - content.height)/2));
            }
        };

        /**
         * Set the menu item checked state
         * @param {Boolean} b a checked state
         * @method setCheckState
         */
        this.setCheckState = function(b) {
            if (this.manager == null) {
                this.setCheckManager(new pkg.SwitchManager());
            }
            this.manager.setValue(this, b);
        };

        /**
         * Get menu item checked state
         * @return {Boolean} a menu item checked state
         * @method getCheckState
         */
        this.getCheckState = function() {
            if (this.manager == null) throw new Error();
            return this.manager.getValue(this);
        };

        /**
         * Set the menu item checked state manager.
         * @param {zebra.ui.SwitchManager|zebra.ui.Group} man a switch manager
         * @method setCheckManager
         */
        this.setCheckManager = function(man) {
            if (this.manager != man) {
                if (this.manager != null) {
                    this.manager.uninstall(this);
                }
                this.manager = man;
                this.manager.install(this);
            }
        };
    },

    /**
     * Override setParent method to catch the moment when the
     * item is inserted to a menu
     * @param {zebra.ui.Panel} p a parent
     * @method setParent
     */
    function setParent(p) {
        this.$super(p);
        if (p != null && p.noSubIfEmpty === true) {
            this.getSub().setVisible(false);
        }
    },

    function (c) {
        this.$super();
        this.add(new this.$clazz.CheckStatePan());

        if (zebra.isString(c)) {
            var m = c.match(/(\s*\@\(.*\)\s*)?(\s*\[\s*\]|\s*\[\s*x\s*\]|\s*\(\s*x\s*\)|\s*\(\s*\))?\s*(.*)/);
            if (m == null) {
                throw new Error("Invalid menu item: " + c);
            }

            if (m[2] != null) {
                var s = m[2].trim();
                this.setCheckManager(s[0] == '(' ? new pkg.Group() : new pkg.SwitchManager());
                this.manager.setValue(this, m[2].indexOf('x') > 0);
            }

            var img = null;
            if (m[1] != null) {
                img = m[1].substring(m[1].indexOf("@(") + 2, m[1].lastIndexOf(")")).trim();
                if (img[0] == "'") {
                   img = img.substring(1, img.length-1);
                }
                else {
                    var parts = img.split('.'), scope = zebra.$global;
                    img = null;

                    for (var i=0; i<parts.length; i++) {
                        scope = scope[parts[i]];
                        if (scope == null) break;
                    }
                    img = scope;
                }
            }

            c = m[3];
            m = c.match(/(.*)\s*\[\s*@([a-zA-Z_][a-zA-Z0-9_]+)\s*]\s*/);
            if (m != null) {
                this.id = m[2].trim();
                c       = m[1].trim();
            }
            else {
                this.id = c.toLowerCase().replace(/[ ]+/, '_');
            }

            c = new pkg.ImageLabel(new this.$clazz.Label(c), img);
        }
        else {
            this.getCheck().setVisible(false);
        }

        this.add(c);
        this.add(new this.$clazz.SubImage());

        this.setEnabled(c.isEnabled);
        this.setVisible(c.isVisible);
    },

    function setEnabled(b) {
        this.$super(b);
        // sync menu item enabled state with checkable element state
        if (this.manager != null) {
            this.switched(this.manager.getValue(this));
        }
    }
]);

/**
 * Menu UI component class. The class implements popup menu UI component.

     var m = new Menu({
        "Menu Item 1" : [
            "[x] SubMenu Checked Item 1",
            "[ ] SubMenu Unchecked Item 2",
            "-",   // line
            "[ ] SubMenu Unchecked Item 3"
        ],
        "Menu Item 2" : null,
        "Menu Item 3" : null
     });

 *
 * @class zebra.ui.Menu
 * @constructor
 * @param {Object} [list] use special notation to define a menu

        {
            'Menu Item 1': null,   // menu item 1 without a sub menu
            'Menu Item 2': null,   // menu item 2 without a sub menu
            '-':null,              // decorative line element
            'Menu Item 3': {       // menu item 3 with a sub menu defined
                "[x] Checkable menu item":null, // checkable menu item
                "Sub item 1":null
            }
        }

 * @extends {zebra.ui.CompList}
 */
pkg.Menu = Class(pkg.CompList, [
    function $clazz() {
        var Label = this.Label = Class(pkg.MenuItem.Label,[]);

        this.MenuItem = Class(pkg.MenuItem, [
            function $clazz() {
                this.Label = Class(Label, []);
            }
        ]);

        this.Line = Class(pkg.Line, []);
        this.Line.prototype.$isDecorative = true;
    },

    function $prototype() {
        this.canHaveFocus = true;
        this.noSubIfEmpty = false;

        /**
         * Test if the given menu item is a decorative (not selectable) menu item.
         * Menu item is considered as decorative if it has been added with addDecorative(...)
         * method or has "$isDecorative" property set to "true"
         * @param  {Integer}  i a menu item index
         * @return {Boolean}  true if the given menu item is decorative
         * @method isDecorative
         */
        this.isDecorative = function(i){
            return this.decoratives[this.kids[i]] === true ||
                   this.kids[i].$isDecorative === true;
        };

        /**
         * Define component events handler.
         * @param  {Integer} id  a component event id
         * @param  {zebra.ui,Panel} src a component that triggers the event
         * @param  {Object} p1  a first event parameter.
         * @param  {Object} p2  a second event parameter
         * @method  childCompEvent
         */
        this.childCompEvent = function(id, src, p1, p2){
            // support dynamic disabling/enabling showing/hiding menu items
            if (id == pkg.Panel.SHOWN ||
                id == pkg.Panel.ENABLED)
            {
                for(var i = 0;i < this.kids.length; i++){
                    if (this.kids[i] == src) {
                        // clear selection if an item becomes not selectable
                        if (this.isItemSelectable(i) === false) {
                            if (i == this.selectedIndex) this.select(-1);
                        }
                        break;
                    }
                }
            }
        };

        /**
         * Get a menu item by the given index
         * @param  {Integer} i a menu item index
         * @return {zebra.ui.Panel} a menu item component
         * @method getMenuItem
         */
        this.getMenuItem = function(i) {
            if (zebra.isString(i)) {
                var item = this.find(i);
                if (item != null) return item;
                for (var k in this.menus) {
                    item = this.menus[k].getMenuItem(i);
                    if (item != null) return item;
                }
            }
            return this.kids[i];
        };

        /**
         * Test if the menu has a selectable item
         * @return {Boolean} true if the menu has at least one selectable item
         * @method hasSelectableItems
         */
        this.hasSelectableItems = function(){
            for(var i = 0;i < this.kids.length; i++) {
                if (this.isItemSelectable(i)) return true;
            }
            return false;
        };

        /**
         * Define mouse exited events handler
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseExited
         */
        this.mouseExited = function(e){
            this.position.setOffset(null);
        };

        /**
         * Get a sub menu for the given menu item
         * @param  {Integer} index a menu item index
         * @return {zebra.ui.Menu} a sub menu or null if no sub menu
         * is defined for the given menu item
         * @method getMenuAt
         */
        this.getMenuAt = function(index){
            return this.menus[this.kids[index]];
        };

        /**
         * Set the given menu as a sub-menu for the specified menu item
         * @param {Integer} i an index of a menu item for that a sub menu
         * has to be attached
         * @param {zebra.ui.Menu} m a sub menu to be attached
         * @method setMenuAt
         */
        this.setMenuAt = function (i, m){
            if (m == this) {
                throw new Error("Menu cannot be sub-menu of its own");
            }

            if (this.isDecorative(i)) {
                throw new Error("Decorative element cannot have a sub-menu");
            }

            var p = this.kids[i];
            if (p.activateSub != null) {
                var sub = this.menus[p];
                if (m != null) {
                    if (sub == null) {
                        p.activateSub(true);
                    }
                }
                else {
                    if (sub != null) p.activateSub(false);
                }
            }

            // if the menu is shown and the menu item is selected
            if (this.parent != null && i == this.selectedIndex) {
                this.select(-1);
            }

            this.menus[p] = m;
        };

        /**
         * Get the specified sub-menu index
         * @param  {zebra.ui.Menu} menu a sub menu
         * @return {Integer} a sub menu index. -1 if the menu is
         * not a sub menu of the given menu
         * @method indexMenuOf
         */
        this.indexMenuOf = function(menu) {
            for(var i = 0; i < this.kids.length; i++) {
                if (this.menus[this.kids[i]] == menu) {
                    return i;
                }
            }
            return -1;
        };

        /**
         * Called when the menu or a sub-menu has been canceled (key ESCAPE has been pressed).
         * @param  {zebra.ui.Menu} m a menu (or sub menu) that has been canceled
         * @method $canceled
         * @protected
         */
        this.$canceled = function(m) {
            if (this.$parentMenu != null && this.$canceled != null) {
                this.$parentMenu.$canceled(m);
            }
        };

        /**
         * Get the top menu in the given shown popup menu hierarchy
         * @return {zebra.ui.Menu} a top menu
         * @method $topMenu
         * @protected
         */
        this.$topMenu = function() {
            if (this.parent != null) {
                var t = this;
                while ((p = t.$parentMenu) != null) t = p;
                return t;
            }
            return null;
        };

        /**
         * Hide the menu and all visible sub-menus
         * @param {zebra.ui.Menu} triggeredBy a menu that has triggered the hiding of
         * menu hierarchy
         * @method $hideMenu
         * @protected
         */
        this.$hideMenu = function(triggeredBy) {
            if (this.parent != null) {
                var ch = this.$childMenu();
                if (ch != null) ch.$hideMenu(triggeredBy);
                this.removeMe();
            }
        };

        /**
         * Get a sub menu that is shown at the given moment.
         * @return {zebra.ui.Menu} a child sub menu. null if no child sub-menu
         * has been shown
         * @method $childMenu
         * @protected
         */
        this.$childMenu = function() {
            if (this.parent != null) {
                for(var k in this.menus) {
                    var m = this.menus[k];
                    if (m.$parentMenu == this) {
                        return m;
                    }
                }
            }
            return null;
        };

        /**
         * Show the given sub menu
         * @param  {zebra.ui.Menu} sub a sub menu to be shown
         * @method $showSubMenu
         * @protected
         */
        this.$showSubMenu = function(sub) {
            sub.setLocation(this.x + this.width - 10,
                            this.y + this.kids[this.selectedIndex].y);
            sub.toPreferredSize();
            this.parent.add(sub);
            sub.requestFocus();
        };

        this.triggerSelectionByPos = function(i) {
            return this.getMenuAt(i) != null && this.$triggeredByPointer;
        };
    },

    function () {
        this.menus = {};
        this.functions = {};
        
        /**
         * Dictionary to keep decorative components
         * @attribute decoratives
         * @type {Object}

           {
               {zebra.ui.Panel}:true
           }

         * @readOnly
         * @private
         */
        this.decoratives = {};
        this.$super(true);
    },

    function (d){
        this.$this();
        if (Array.isArray(d)) {
            for(var i = 0; i < d.length; i++) {
                this.add(d[i]);
            }
        }
        else {
            for(var k in d) {
                if (d.hasOwnProperty(k)) {
                    var sub = d[k];
                    this.add(k);
                    if (sub != null) {
                        if (typeof(sub) == "function")
                            this.functions[this.kids.length - 1] = sub;
                        else
                            this.setMenuAt(this.kids.length-1, zebra.instanceOf(sub, pkg.Menu) ? sub : new pkg.Menu(sub));
                    }
                }
            }
        }
    },

    /**
     * Override key pressed events handler to handle key events according to
     * context menu component requirements
     * @param  {zebra.ui.KeyEvent} e a key event
     * @method keyPressed
     */
    function keyPressed(e){
        if (e.code == KE.ESCAPE) {
            if (this.parent != null) {
                var p = this.$parentMenu;
                this.$canceled(this);
                this.$hideMenu(this);
                if (p != null) p.requestFocus();
            }
        }
        else {
            this.$super(e);
        }
    },

    function insert(i, ctr, c) {
        if (zebra.isString(c)) {
            return this.$super(i, ctr, (c.match(/^\-+$/) != null) ? new this.$clazz.Line()
                                                                  : new this.$clazz.MenuItem(c));
        }
        return this.$super(i, ctr, c);
    },

    function setParent(p) {
        if (p != null) {
            this.select(-1);
            this.position.setOffset(null);
        }
        else {
            this.$parentMenu = null;
        }
        this.$super(p);
    },

    /**
     * Add the specified component as a decorative item of the menu
     * @param {zebra.ui.Panel} c an UI component
     * @method addDecorative
     */
    function addDecorative(c) {
        this.decoratives[c] = true;
        this.$super(this.insert, this.kids.length, null, c);
    },

    function kidRemoved(i,c) {
        if (this.decoratives[c] !== true) {
            delete this.decoratives[c];
        }
        this.setMenuAt(i, null);
        this.$super(i, c);
    },

    function isItemSelectable(i) {
        return this.$super(i) && this.isDecorative(i) === false;
    },

    function posChanged(target,prevOffset,prevLine,prevCol) {
        var off = target.offset;

        if (off >= 0) {
            var rs = null;

            // hide previously shown sub menu if position has been re-newed
            if (this.selectedIndex >= 0  && off != this.selectedIndex) {
                var sub = this.getMenuAt(this.selectedIndex);
                if (sub != null) {
                    sub.$hideMenu(this);
                    rs = -1; // ask to clear selection
                }
            }

            // request fire selection if the menu is shown and position has moved to new place
            if (this.parent != null && off != this.selectedIndex && this.isItemSelectable(off)) {
                if (this.triggerSelectionByPos(off)) rs = off;
            }

            if (rs !== null) {
                this.select(rs);
            }
        }

        this.$super(target, prevOffset, prevLine, prevCol);
    },

    function fireSelected(prev) {
        if (this.parent != null && this.selectedIndex >= 0) {
            var sub = this.getMenuAt(this.selectedIndex);

            if (sub != null) {
                if (sub.parent != null) {
                    // hide menu since it has been already shown
                    sub.$hideMenu(this);
                }
                else {
                    // show menu
                    sub.$parentMenu = this;
                    this.$showSubMenu(sub);
                }
            }
            else {
                var k = this.kids[this.selectedIndex];
                if (k.itemSelected != null) {
                    k.itemSelected();
                }
                
                var func = this.functions[this.selectedIndex];
                if ( func )
                    func();

                // an atomic menu, what means a menu item has been selected
                // remove this menu an all parents menus
                var top = this.$topMenu();
                if (top != null) {
                    top.$hideMenu(this);
                }
            }

            pkg.popup._.menuItemSelected(this, this.selectedIndex, this.kids[this.selectedIndex]);
        }
        this.$super(prev);
    }
]);

/**
 * Menu bar UI component class. Menu bar can be build in any part of UI application.
 * There is no restriction regarding the placement of the component.

        var canvas = new zebra.ui.zCanvas(300,200);
        canvas.setLayout(new zebra.layout.BorderLayout());

        var mbar = new zebra.ui.Menubar({
            "Item 1": {
                "Subitem 1.1":null,
                "Subitem 1.2":null,
                "Subitem 1.3":null
            },
            "Item 2": {
                "Subitem 2.1":null,
                "Subitem 2.2":null,
                "Subitem 2.3":null
            },
            "Item 3": null
        });

        canvas.root.add(zebra.layout.BOTTOM, mbar);

 * @class zebra.ui.Menubar
 * @constructor
 * @extends zebra.ui.Menu
 */
pkg.Menubar = Class(pkg.Menu, [
    function $clazz() {
        var Label = this.Label = Class(pkg.MenuItem.Label, []);

        this.MenuItem = Class(pkg.MenuItem, [
            function $clazz() {
                this.Label = Class(Label, []);
            },

            function(c) {
                this.$super(c);
                this.hideSub();
                this.getCheck().setVisible(false);
            }
        ]);
    },

    function $prototype() {
        this.$isActive = false;

        this.triggerSelectionByPos = function (i) {
            return this.isItemSelectable(i) && this.$isActive === true;
        };

        // making menu bar not removable by overriding the method
        this.$hideMenu = function(triggeredBy) {
            var child = this.$childMenu();
            if (child != null) {
                child.$hideMenu(triggeredBy);
            }

            // handle situation when calling hideMenu method has been triggered
            // by a child sub-menu initiate it (an item has been selected or menu
            if (triggeredBy != this) {
                this.select(-1);
            }
        };

        this.$showSubMenu = function(menu) {
            var d   = this.getCanvas(),
                k   = this.kids[this.selectedIndex],
                pop = d.getLayer(pkg.PopupLayer.ID);

            if (menu.hasSelectableItems()) {
                var abs = L.toParentOrigin(0,0,k);
                menu.setLocation(abs.x, abs.y + k.height + 1);
                menu.toPreferredSize();
                pop.add(menu);
                menu.requestFocus();
            }
        };
    },

    function $canceled(m) {
        this.select(-1);
    },

    function select(i) {
        var d   = this.getCanvas(),
            pop = d != null ? d.getLayer(pkg.PopupLayer.ID) : null;

        if (pop != null) {
            if (i < 0) {
                pop.setMenubar(null);
                this.$isActive = false;
            }
            else {
                pop.setMenubar(this);
            }
        }
        this.$super(i);
    },

    // called when an item is selected by user with mouse click or key
    function $select(i) {
        this.$isActive = !this.$isActive;
        if (this.$isActive === false) {
            i = -1;
        }
        this.$super(i);
    }
]);

/**
 * UI popup layer class. Special layer implementation to show
 * context menu. Normally the layer is not used directly.
 * @class zebra.ui.PopupLayer
 * @constructor
 * @extends {zebra.ui.BaseLayer}
 */
pkg.PopupLayer = Class(pkg.BaseLayer, [
    function $clazz() {
        this.ID = "pop";
    },

    function $prototype() {
        this.mTop = this.mLeft = this.mBottom = this.mRight = 0;

        this.layerMousePressed = function(x,y,mask) {
            // if x,y is in extent active menu bar let
            // the menu bar handle it
            if (this.activeMenubar != null  &&
                y <= this.mBottom           &&
                y >= this.mTop              &&
                x >= this.mLeft             &&
                x <= this.mRight              )
            {
                return false;
            }

            if (this.getComponentAt(x, y) == this){
                if (this.activeMenubar != null) {
                    this.activeMenubar.select(-1);
                }

                if (this.kids.length > 0) {
                    this.removeAll();
                }

                return false;
            }

            return true;
        };

        this.isLayerActiveAt = function(x,y) {
            return this.kids.length > 0 &&
                   ( this.activeMenubar == null  ||
                     y > this.mBottom   ||
                     y < this.mTop      ||
                     x < this.mLeft     ||
                     x > this.mRight      );
        };

        /**
         * Define children components input events handler.
         * @param  {zebra.ui.MouseEvent|zebra.ui.KeyEvent|zebra.ui.InputEvent} e an input event
         * @method childInputEvent
         */
        this.childInputEvent = function(e){
            if (e.UID == pkg.InputEvent.KEY_UID && e.ID == KE.PRESSED){
                var dc = L.getDirectChild(this, e.source);

                if (zebra.instanceOf(dc, pkg.Menu) && this.activeMenubar != null) {
                    var s = this.activeMenubar.selectedIndex;
                    switch(e.code) {
                        case KE.RIGHT :
                            if (s < this.activeMenubar.model.count()-1) {
                                //this.removeAll();
                                this.activeMenubar.requestFocus();
                                this.activeMenubar.position.seekLineTo(zebra.util.Position.DOWN);
                            }
                            break;
                        case KE.LEFT :
                            if (s > 0) {
                               // this.removeAll();
                                this.activeMenubar.requestFocus();
                                this.activeMenubar.position.seekLineTo(zebra.util.Position.UP);
                            }
                            break;
                    }
                }
            }
        };

        this.calcPreferredSize = function (target){
            return { width:0, height:0 };
        };

        this.setMenubar = function(mb){
            if (this.activeMenubar != mb){
                this.removeAll();

                this.activeMenubar = mb;
                if (this.activeMenubar != null){
                    // save an area the menu bar component takes
                    // it is required to allow the menu bar getting input
                    // event by inactivating the pop up layer
                    var abs = L.toParentOrigin(0, 0, this.activeMenubar);
                    this.mLeft   = abs.x;
                    this.mRight  = this.mLeft + this.activeMenubar.width - 1;
                    this.mTop    = abs.y;
                    this.mBottom = this.mTop + this.activeMenubar.height - 1;
                }
            }
        };

        this.doLayout = function (target){
            var cnt = this.kids.length;
            for(var i = 0; i < cnt; i++){
                var m = this.kids[i];
                if (zebra.instanceOf(m, pkg.Menu)) {
                    var ps = m.getPreferredSize(),
                        xx = (m.x + ps.width  > this.width ) ? this.width  - ps.width  : m.x,
                        yy = (m.y + ps.height > this.height) ? this.height - ps.height : m.y;

                    m.setSize(ps.width, ps.height);
                    if (xx < 0) xx = 0;
                    if (yy < 0) yy = 0;
                    m.setLocation(xx, yy);
                }
            }
        };
    },

    function () {
        this.activeMenubar = null;
        this.$super(pkg.PopupLayer.ID);
    }
]);

/**
 * Tooltip UI component. The component can be used as a tooltip that
 * shows specified content in figured border.
 * @class  zebra.ui.Tooltip
 * @param  {zebra.util.Panel|String} a content component or test label to be shown in tooltip
 * @constructor
 * @extends {zebra.ui.Panel}
 */
pkg.Tooltip = Class(pkg.Panel, [
    function $clazz() {
        this.borderColor = "black";
        this.borderWidth = 1;

        this.Label = Class(pkg.Label, []);

        this.TooltipBorder = Class(pkg.View, [
            function $prototype() {
                this[''] = function(col, size) {
                    this.color = col !=  null ? col : "black";
                    this.size  = size == null ? 4   : size;
                    this.gap   = 2 * this.size;
                };

                this.paint = function (g,x,y,w,h,d) {
                    if (this.color != null) {
                        var old = g.lineWidth;
                        this.outline(g,x,y,w,h,d);
                        g.setColor(this.color);
                        g.lineWidth = this.size;
                        g.stroke();
                        g.lineWidth = old;
                    }
                };

                this.outline = function(g,x,y,w,h,d) {
                    g.beginPath();
                    h -= 2*this.size;
                    w -= 2*this.size;
                    x+=this.size;
                    y+=this.size;

                    var w2   = (w/2 + 0.5) | 0,
                        h3   = (h/3 + 0.5) | 0,
                        w3_8 = ((3 * w)/8 + 0.5) | 0,
                        h2_3 = ((2 * h)/3 + 0.5) | 0,
                        h3   = (h/3 + 0.5) | 0,
                        w4   = (w/4 + 0.5) | 0;

                    g.moveTo(x + w2, y);
                    g.quadraticCurveTo(x, y, x, y + h3);
                    g.quadraticCurveTo(x, y + h2_3, x + w4,  y + h2_3);
                    g.quadraticCurveTo(x + w4, y + h, x, y + h);
                    g.quadraticCurveTo(x + w3_8, y + h, x + w2, y + h2_3);
                    g.quadraticCurveTo(x + w, y + h2_3, x + w, y + h3);
                    g.quadraticCurveTo(x + w, y, x + w2, y);
                    g.closePath();
                    return true;
                };
            }
        ]);
    },

    function(content) {
        this.$super();
        this.setBorder(new this.$clazz.TooltipBorder(pkg.Tooltip.borderColor,
                                                     pkg.Tooltip.borderWidth));
        this.add(zebra.instanceOf(content, pkg.Panel) ? content
                                                      : new this.$clazz.Label(content));
        this.toPreferredSize();
    },

    function recalc() {
        this.$contentPs = (this.kids.length === 0 ? this.$super()
                                                  : this.kids[0].getPreferredSize());
    },

    function getBottom() {
        return this.$super() + this.$contentPs.height;
    },

    function getTop () {
        return this.$super() + ((this.$contentPs.height/6 + 0.5) | 0);
    },

    function getLeft () {
        return this.$super() + ((this.$contentPs.height/6 + 0.5) | 0);
    },

    function getRight () {
        return this.$super() + ((this.$contentPs.height/6 + 0.5) | 0);
    }
]);

/**
 * Popup window manager class. The manager registering and triggers showing context popup menu
 * and tooltips. Menu appearing is triggered by right mouse click or double fingers touch event.
 * To bind a popup menu to an UI component you can either set "tooltip" property of the component
 * with a popup menu instance:

        // create canvas
        var canvas = new zebra.ui.zCanvas();

        // create menu with three items
        var m = new zebra.ui.Menu();
        m.add("Menu Item 1");
        m.add("Menu Item 2");
        m.add("Menu Item 3");

        // bind the menu to root panel
        canvas.root.popup = m;

 * Or implement "getPopup(target,x,y)" method that can rule showing popup menu depending on
 * the current cursor location:

        // create canvas
        var canvas = new zebra.ui.zCanvas();

        // visualize 50x50 pixels hot component spot
        // to which the context menu is bound
        canvas.root.paint = function(g) {
            g.setColor("red");
            g.fillRect(50,50,50,50);
        }

        // create menu with three items
        var m = new zebra.ui.Menu();
        m.add("Menu Item 1");
        m.add("Menu Item 2");
        m.add("Menu Item 3");

        // implement "getPopup" method that shows popup menu only
        // if mouse cursor located at red rectangular area of the
        // component
        canvas.root.getPopup = function(target, x, y) {
            // test if mouse cursor position is in red spot area
            // and return context menu if it is true
            if (x > 50 && y > 50 && x < 100 && y <  100)  {
                return m;
            }
            return null;
        }

 *  Defining a tooltip for an UI component follows the same approach. Other you
 *  define set "tooltip" property of your component with a component that has to
 *  be shown as the tooltip:

         // create canvas
         var canvas = new zebra.ui.zCanvas();

         // create tooltip
         var t = new zebra.ui.Label("Tooltip");
         t.setBorder("plain");
         t.setBackground("yellow");
         t.setPadding(6);

         // bind the tooltip to root panel
         canvas.root.popup = t;

*  Or you can implement "getTooltip(target,x,y)" method if the tooltip showing depends on
*  the mouse cursor location:


        // create canvas
        var canvas = new zebra.ui.zCanvas();

        // create tooltip
        var t = new zebra.ui.Label("Tooltip");
        t.setBorder("plain");
        t.setBackground("yellow");
        t.setPadding(6);

        // bind the tooltip to root panel
        canvas.root.getPopup = function(target, x, y) {
            return x < 10 && y < 10 ? t : null;
        };

 * @class zebra.ui.PopupManager
 * @extends zebra.ui.Manager
 * @constructor
 */

 /**
  * Fired when a menu item has been selected

         zebra.ui.popup.bind(function menuItemSelected(menu, index, item) {
             ...
         });

  *
  * @event menuItemSelected
  * @param {zebra.ui.Menu} menu a menu component that triggers the event
  * @param {Integer}  index a menu item index that has been selected
  * @param {zebra.ui.Panel} item a menu item component that has been selected
  */
pkg.PopupManager = Class(pkg.Manager, [
    function $prototype() {
        /**
         * Define mouse clicked event handler
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseClicked
         */
        this.mouseClicked = function (e){
            this.$popupMenuX = e.absX;
            this.$popupMenuY = e.absY;

            if ((e.mask & pkg.MouseEvent.RIGHT_BUTTON) > 0) {
                var popup = null;

                if (e.source.popup != null) {
                    popup = e.source.popup;
                }
                else {
                    if (e.source.getPopup != null) {
                        popup = e.source.getPopup(e.source, e.x, e.y);
                    }
                }

                if (popup != null) {
                    popup.setLocation(this.$popupMenuX, this.$popupMenuY);
                    e.source.getCanvas().getLayer(pkg.PopupLayer.ID).add(popup);
                    popup.requestFocus();
                }
            }
        };

        /**
         * Indicates if a shown tooltip has to disappear by mouse pressed event
         * @attribute hideTooltipByPress
         * @type {Boolean}
         * @default true
         */
        this.hideTooltipByPress = true;

        /**
         * Define mouse entered event handler
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseEntered
         */
        this.mouseEntered = function(e){
            var c = e.source;
            if (c.getTooltip != null || c.tooltip != null){
                this.target = c;
                this.$targetTooltipLayer = c.getCanvas().getLayer(pkg.WinLayer.ID);
                this.$tooltipX = e.x;
                this.$tooltipY = e.y;
                this.$toolTask = task(this).run(this.showTooltipIn, this.showTooltipIn);
            }
        };

        /**
         * Define mouse exited event handler
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseExited
         */
        this.mouseExited = function(e){
            if (this.target != null){
                if (this.$toolTask != null) {
                    this.$toolTask.shutdown();
                }

                this.target = null;
                this.hideTooltip();
            }
        };

        /**
         * Define mouse moved event handler
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseMoved
         */
        this.mouseMoved = function(e){
            if (this.target != null){
                if (this.$toolTask != null) {
                    this.$toolTask.run(this.$toolTask.ri);
                }

                this.$tooltipX = e.x;
                this.$tooltipY = e.y;
                if (this.tooltip != null) {
                    this.hideTooltip();
                }
            }
        };

        /**
         * Task body method
         * @private
         * @param  {Task} t a task context
         * @method run
         */
        this.run = function(t){
            if (this.tooltip == null){
                this.tooltip = this.target.tooltip != null ? this.target.tooltip
                                                           : this.target.getTooltip(this.target,
                                                                                    this.$tooltipX,
                                                                                    this.$tooltipY);
                if (this.tooltip != null) {
                    var p = L.toParentOrigin(this.$tooltipX, this.$tooltipY, this.target);
                    this.tooltip.toPreferredSize();
                    var tx = p.x,
                        ty = p.y - this.tooltip.height,
                        dw = this.$targetTooltipLayer.width;

                    if (tx + this.tooltip.width > dw) {
                        tx = dw - this.tooltip.width - 1;
                    }

                    this.tooltip.setLocation(tx < 0 ? 0 : tx, ty < 0 ? 0 : ty);

                    this.tooltip.winType = "info";
                    this.$targetTooltipLayer.add(this.tooltip);
                }
            }

            t.pause();
        };

        /**
         * Hide tooltip if it has been shown
         * @method hideTooltip
         */
        this.hideTooltip = function(){
            if (this.tooltip != null) {
                this.$targetTooltipLayer.remove(this.tooltip);
                this.tooltip = null;
            }
        };

        /**
         * Define mouse pressed event handler
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mousePressed
         */
        this.mousePressed = function(e){
            if (this.hideTooltipByPress && this.target != null) {
                if (this.$toolTask != null) {
                    this.$toolTask.shutdown();
                }
                this.target = null;
                this.hideTooltip();
            }
        };

        /**
         * Define mouse released event handler
         * @param  {zebra.ui.MouseEvent} e a mouse event
         * @method mouseReleased
         */
        this.mouseReleased = function(e){
            if (this.hideTooltipByPress && this.target != null){
                this.x = e.x;
                this.y = e.y;
                this.$toolTask = task(this).run(this.showTooltipIn, this.showTooltipIn);
            }
        };
    },

    function () {
        this.$super();
        this.$popupMenuX = this.$popupMenuY = 0;
        this.$tooltipX = this.$tooltipY = 0;
        this.$targetTooltipLayer = this.tooltip = this.target = null;

        var LClass = zebra.util.ListenersClass("menuItemSelected");
        this._ = new LClass();

        /**
         * Define interval (in milliseconds) between entering a component and showing
         * a tooltip for the entered component
         * @attribute showTooltipIn
         * @type {Integer}
         * @default 400
         */
        this.showTooltipIn = 400;
    }
]);

pkg.WindowTitleView = Class(pkg.View, [
    function $prototype() {
        this[''] = function(bg) {
            this.radius = 6;
            this.gap = this.radius;
            this.bg = bg != null ? bg : "#66CCFF";
        };

        this.paint = function(g,x,y,w,h,d) {
            this.outline(g,x,y,w,h,d);
            g.setColor(this.bg);
            g.fill();
        };

        this.outline = function (g,x,y,w,h,d) {
            g.beginPath();
            g.moveTo(x + this.radius, y);
            g.lineTo(x + w - this.radius*2, y);
            g.quadraticCurveTo(x + w, y, x + w, y + this.radius);
            g.lineTo(x + w, y + h);
            g.lineTo(x, y + h);
            g.lineTo(x, y + this.radius);
            g.quadraticCurveTo(x, y, x + this.radius, y);
            return true;
        };
    }
]);

/**
 * @for
 */

})(zebra("ui"), zebra.Class);

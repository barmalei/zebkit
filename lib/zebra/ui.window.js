(function(pkg, Class, Interface) {

/**
 * @module ui
 */

/**
 * Toltip interface. The interface is supposed to be used to say 
 * which component has to be shown as a tooltip at the given location of 
 * the UI component.
 * @class zebra.ui.TooltipInfo
 * @interface
 */
pkg.TooltipInfo = Interface();
/**
 * Get an UI component to be shown as a tooltip for the given UI
 * component at the given location of the target component 
 * @param {zebra.ui.Panel} target a target UI component
 * @param {Integer} x a x coordinate relatively to the target UI component
 * @param {Integer} x a y coordinate relatively to the target UI component
 * @return {zebra.ui.Panel} an UI component to be shown as tooltip
 * @method getTooltip
 */


/**
 * Popup interface to indicate which UI component has to be shown at the 
 * given location of the UI component as a popup menu.
 * @class zebra.ui.PopupInfo
 * @interface
 */
pkg.PopupInfo = Interface();
/**
 * Get an UI component to be shown as a popup menu for the given UI
 * component at the given location of the target component 
 * @param {zebra.ui.Panel} target a target UI component
 * @param {Integer} x a x coordinate relatively to the target UI component
 * @param {Integer} x a y coordinate relatively to the target UI component
 * @return {zebra.ui.Panel} an UI component to be shown as popup menu UI component
 * @method getPopup
 */


/**
 * Window listener interface
 * @class zebra.ui.WinListener
 * @interface
 */
pkg.WinListener = Interface();
/**
 * Fire when an UI component has been opened or closed on the given window layer 
 * @param {zebra.ui.BaseLayer} winLayer a win layer where the window component is hosted
 * @param {zebra.ui.Panel} win an UI component that is used as the window
 * @param {Boolean} status a status of the window component. true means the window component 
 * has been opened, false means the window component has been closed
 * @method winOpened
 */

/**
 * Fire when an UI component has been activated or deactivate on the given window layer 
 * @param {zebra.ui.BaseLayer} winLayer a win layer where the window component is hosted
 * @param {zebra.ui.Panel} win an UI component that is used as the window
 * @param {Boolean} status a status of the window component. true means the window component 
 * has been activated, false means the window component has been deactivated
 * @method winActivated
 */

var KE = pkg.KeyEvent, timer = zebra.util.timer, L = zebra.layout, MouseEvent = pkg.MouseEvent,
    WIN_OPENED = 1, WIN_CLOSED = 2, WIN_ACTIVATED = 3, WIN_DEACTIVATED = 4, VIS_PART_SIZE = 30,
    WinListeners = zebra.util.Listeners.Class("winOpened", "winActivated");

pkg.showModalWindow = function(context, win, listener) {
    pkg.showWindow(context, "modal", win, listener);
};

/**
 * Show the given UI component as a window 
 * @param  {zebra.ui.Panel} context  an UI component of zebra hierarchy  
 * @param  {String} type a type of the window: "modal", "mdi", "info"
 * @param  {zebra.ui.Panel} win a component to be shown as the window
 * @param  {zebra.ui.WinListener} [listener] a window listener 
 * @for  zebra.ui.showWindow()
 * @method showWindow
 */
pkg.showWindow = function(context, type, win, listener) {
    if (arguments.length < 3) {
        win = type;
        type = "info";
    }
    return context.getCanvas().getLayer("win").addWin(type, win, listener);
};

pkg.hideWindow = function(win) {
    if (win.parent && win.parent.indexOf(win) >=0) {
        win.parent.remove(win);
    }
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
pkg.WinLayer = Class(pkg.BaseLayer, pkg.ChildrenListener, [
    function $clazz() {
        this.ID = "win";
   
        this.activate = function(c) {
            c.getCanvas().getLayer("win").activate(c);
        };
    },

    function $prototype() {
        this.isLayerActive  = function() {
            return this.activeWin != null;
        };

        this.layerMousePressed = function(x,y,mask){
            var cnt = this.kids.length;
            if (cnt > 0) {
                if (this.activeWin != null && this.indexOf(this.activeWin) == cnt - 1) {
                    var x1 = this.activeWin.x,
                        y1 = this.activeWin.y,
                        x2 = x1 + this.activeWin.width,
                        y2 = y1 + this.activeWin.height;

                    if (x >= x1 && y >= y1 && x < x2 && y < y2) {
                        return;
                    }
                }

                for(var i = cnt - 1; i >= 0 && i >= this.topModalIndex; i--){
                    var d = this.kids[i];
                    if (d.isVisible && d.isEnabled && this.winType(d) != "info" &&
                        x >= d.x && y >= d.y && x < d.x + d.width && y < d.y + d.height)
                    {
                        this.activate(d);
                        return;
                    }
                }

                if (this.topModalIndex < 0 && this.activeWin != null) {
                    this.activate(null);
                }
            }
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
            }
        };

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

        this.getFocusRoot = function() {
            return this.activeWin;
        };

        this.winType = function(w) {
            return this.winsInfo[w][1];
        };

        /**
         * Activate the given win layer children component window. 
         * @param  {zebra.ui.Panel} c a component to be activated as window
         * @method activate
         */
        this.activate = function(c){
            if (c != null && (this.winsInfo.hasOwnProperty(c) === false ||
                              this.winType(c) == "info"))
            {
                throw new Error();
            }

            if (c != this.activeWin) {
                var old = this.activeWin;
                if (c == null) {
                    if (this.winType(this.activeWin) == "modal") {
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
                l = this.winsInfo[win][2];
            }

            var b = (id == WIN_OPENED || id == WIN_ACTIVATED),
                n = (id == WIN_OPENED || id == WIN_CLOSED) ? "winOpened"
                                                           : "winActivated";

            this._[n](this, win, b);
            if (zebra.instanceOf(win, pkg.WinListener) && win[n] != null) {
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
         * @param {zebra.ui.WinListener} [listener] an optional the window listener 
         * @method addWin 
         */
        this.addWin = function(type, win, listener) {
            this.winsInfo[win] = [ this.activeWin, type, listener ];
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
        this.activeWin = null;
        this.topModalIndex = -1;
        this.winsInfo  = {};
        this.winsStack = [];
        this._ = new WinListeners();
        this.$super(pkg.WinLayer.ID);
    },

    function insert(index, constr, lw) {
        var info = this.winsInfo[lw];
        if (typeof info === 'undefined') {
            info = [this.activeWin, "mdi", null];
            this.winsInfo[lw] = info;
        }
        if (info[1] != "mdi" && info[1] != "modal" && info[1] != "info") {
            throw new Error("Invalid window type: " + info[1]);
        }
        return this.$super(index, constr, lw);
    },

    function kidAdded(index,constr,lw){
        this.$super(index, constr, lw);
        var info = this.winsInfo[lw];
        this.winsStack.push(lw);
        if (info[1] == "modal") {
            this.topModalIndex = this.winsStack.length - 1;
        }
        this.fire(WIN_OPENED, lw);
        if (info[1] == "modal") this.activate(lw);
    },

    function kidRemoved(index,lw){
        this.$super(this.kidRemoved,index, lw);
        if (this.activeWin == lw){
            this.activeWin = null;
            pkg.focusManager.requestFocus(null);
        }
        var ci = this.winsStack.indexOf(lw), l = this.winsInfo[lw][2];
        delete this.winsInfo[lw];
        this.winsStack.splice(this.winsStack.indexOf(lw), 1);
        if (ci < this.topModalIndex) this.topModalIndex--;
        else {
            if (this.topModalIndex == ci){
                for(this.topModalIndex = this.kids.length - 1;this.topModalIndex >= 0; this.topModalIndex--){
                    if (this.winType(this.winsStack[this.topModalIndex]) == "modal") break;
                }
            }
        }

        this.fire(WIN_CLOSED, lw, l);
        if(this.topModalIndex >= 0){
            var aindex = this.winsStack.length - 1;
            while(this.winType(this.winsStack[aindex]) == "info") aindex--;
            this.activate(this.winsStack[aindex]);
        }
    }
]);

// !!!!!
// this code can be generalized to other cases and UI components
// !!!!!
var $StatePan = Class(pkg.Panel, [
    function $prototype() {
        this.setState = function(s) {
            if (this.state != s) {
                var old = this.state;
                this.state = s;
                this.updateState(old, s);
            }
        };

        this.updateState = function(olds, news) {
            var b = false;
            if (this.bg && this.bg.activate)  b = this.bg.activate(news);
            if (this.border && this.border.activate) b = this.border.activate(news) || b;
            if (b) this.repaint();
        };
    },

    function() {
        this.state = "inactive";
        this.$super();
    },

    function setBorder(v) {
        this.$super(v);
        this.updateState(this.state, this.state);
    },

    function setBackground(v) {
        this.$super(v);
        this.updateState(this.state, this.state);
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
 * @extends {zebra.ui.Panel}
 */
pkg.Window = Class($StatePan, pkg.WinListener,
                   pkg.MouseListener, pkg.Composite, 
                   pkg.Cursorable, pkg.ExternalEditor, [

    function $prototype() {
        var MOVE_ACTION = 1, SIZE_ACTION = 2;

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
         * @return {[type]}  true if the mouse cursor is inside window 
         * corner component
         * @method insideCorner
         */
        this.insideCorner = function(px,py){
            return this.getComponentAt(px, py) == this.sizer;
        };

        this.getCursorType = function(target,x,y){
            return (this.isSizeable && this.insideCorner(x, y)) ? pkg.Cursor.SE_RESIZE : -1;
        };

        this.catchInput = function(c){
            var tp = this.caption;
            return c == tp || (L.isAncestorOf(tp, c)          &&
                   zebra.instanceOf(c, pkg.Button) === false) ||
                   this.sizer == c;
        };

        this.winOpened = function(winLayer,target,b) {
            var state = b?"active":"inactive";
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

        this.isMaximized = function() {
            return this.prevW != -1;
        };

        this.createCaptionPan = function() {
            var clazz = this.getClazz();
            clazz = clazz.CaptionPan ? clazz.CaptionPan : pkg.Window.CaptionPan;
            return new clazz();
        };

        this.createContentPan = function() {
            var clazz = this.getClazz();
            clazz = clazz.ContentPan ? clazz.ContentPan : pkg.Window.ContentPan;
            return new clazz();
        };

        this.createTitle = function() {
            var clazz = this.getClazz();
            clazz = clazz.TitleLab ? clazz.TitleLab : pkg.Window.TitleLab;
            return new clazz();
        };

        this.setIcon = function(i, icon) {
            if (zebra.isString(icon) || zebra.instanceOf(icon, pkg.Picture)) {
                icon = new pkg.ImagePan(icon);
            }

            this.icons.set(i, icon);
        };
    },

    function $clazz() {
        this.CaptionPan = Class($StatePan, []);
        this.TitleLab   = Class(pkg.Label, []);
        this.StatusPan  = Class(pkg.Panel, []);
        this.ContentPan = Class(pkg.Panel, []);
        this.SizerIcon  = Class(pkg.ImagePan, []);
        this.Icon       = Class(pkg.ImagePan, []);
        this.Button     = Class(pkg.Button, []);
    },

    function () {
        this.$this("");
    },

    function (s){
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
        this.root = this.createContentPan();

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
        this.title.setValue(s);

        /**
         * Icons panel. The panel can contain number of icons. 
         * @type {zebra.ui.Panel}
         * @attribute icons
         * @readOnly
         */
        this.icons = new pkg.Panel(new L.FlowLayout(L.LEFT, L.CENTER, L.HORIZONTAL, 2));
        this.icons.add(new pkg.Window.Icon());

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
        this.status = new pkg.Window.StatusPan();
        this.sizer  = new pkg.Window.SizerIcon();
        this.status.add(this.sizer);

        this.setSizeable(true);

        this.$super(new L.BorderLayout(2,2));

        this.add(L.CENTER, this.root);
        this.add(L.TOP, this.caption);
        this.add(L.BOTTOM, this.status);
    },

    function fired(src) {
        this.parent.remove(this);
    },

    function focused(){
        this.$super();
        if (this.caption != null) {
            this.caption.repaint();
        }
    },

    /**
     * Make the window sizeable or not sizeable
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
        if (this.parent) this.parent.remove(this);
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
            if (kid._) kid._.removeAll();
        }
        this.buttons.removeAll();

        // add new buttons set
        for(var k in buttons) {
            if (buttons.hasOwnProperty(k)) {
                var b = new pkg.Window.Button(), bv = buttons[k];
                b.setView(bv);
                this.buttons.add(b);
                (function(t, f) {
                    b._.add(function() { f.call(t); });
                })(this, this[k]);
            }
        }
    }
]);

/**
 * Tooltip manager class implements possibility to define a tooltip 
 * for a component. Tooltip is an UI component that has to be shown 
 * as information window every time a mouse cursor has entered the
 * specified component of the given area of the specified component.
 * @class zebra.ui.TooltipManager
 * @extends zebra.ui.Manager
 * @constructor 
 */
pkg.TooltipManager = Class(pkg.Manager, pkg.MouseListener, [
    function $clazz() {
        this.Label = Class(pkg.Label, []);

        this.createTooltip = function(text){
            var lab = new pkg.TooltipManager.Label(new zebra.data.Text(text));
            lab.toPreferredSize();
            return lab;
        };
    },

    function $prototype() {
        var TI = pkg.TooltipInfo;

        /**
         * Indicates if a shown tooltip has to disappear by mouse pressed event 
         * @attribute stopByPress
         * @type {Boolean}
         * @default true
         */
        this.stopByPress = true;

        this.mouseEntered = function(e){
            var c = e.source;
            if (zebra.instanceOf(c, TI) || this.tooltips[c]){
                this.target = c;
                this.targetLayer = c.getCanvas().getLayer(pkg.WinLayer.ID);
                this.x = e.x;
                this.y = e.y;
                timer.start(this, this.showIn, this.showIn);
            }
        };

        this.mouseExited = function(e){
            if (this.target != null){
                timer.stop(this);
                this.target = null;
                this.hideTooltip();
            }
        };

        this.mouseMoved = function(e){
            if (this.target != null){
                timer.clear(this);
                this.x = e.x;
                this.y = e.y;
                this.hideTooltip();
            }
        };

        this.run = function(){
            if (this.tooltip == null){
                var tp = this.tooltips[this.target];
                if (!tp) tp = null;
                if (tp == null && zebra.instanceOf(this.target, TI)) {
                    tp = this.target;
                }

                this.tooltip = zebra.instanceOf(tp, TI) ? tp.getTooltip(this.target, this.x, this.y) : tp;
                if (this.tooltip != null) {
                    var p = L.getAbsLocation(this.x, this.y, this.target);
                    this.tooltip.toPreferredSize();
                    var tx = p.x,
                        ty = p.y - this.tooltip.height,
                        dw = this.targetLayer.width;
                    
                    if (tx + this.tooltip.width > dw) {
                        tx = dw - this.tooltip.width - 1;
                    }
                    this.tooltip.setLocation(tx < 0 ? 0 : tx, ty < 0 ? 0 : ty);
                    this.targetLayer.addWin("info", this.tooltip, null);
                }
            }
        };

        /**
         * Hide tooltip if it has been shown
         * @method hideTooltip
         */
        this.hideTooltip = function(){
            if (this.tooltip != null) {
                this.targetLayer.remove(this.tooltip);
                this.tooltip = null;
            }
        };

        /**
         * Bind or unbind the given UI component with the specified tooltip component 
         * @param {zebra.ui.Panel} an component for that a tooltip has to be shown
         * @param {zebra.ui.Panel|String} a tooltip to be shown. You can pass string 
         * or an UI component to be shown as the tooltip. String will be transformed 
         * into a tooltip UI label component.  Pass null as the argument to stop
         * showing tooltip for the given component.
         * @method setTooltip
         */
        this.setTooltip = function (c,data){
            if (data != null) {
                this.tooltips[c] = zebra.isString(data) ? pkg.TooltipManager.createTooltip(data)
                                                        : data;
            }
            else {
                if (this.target == c) {
                    timer.stop(this);
                    this.target = null;
                    this.hideTooltip();
                }
                delete this.tooltips[c];
            }
        };

        this.mousePressed = function(e){
            if (this.stopByPress && this.target != null){
                timer.stop(this);
                this.target = null;
                this.hideTooltip();
            }
        };

        this.mouseReleased = function(e){
            if (this.stopByPress && this.target != null){
                this.x = e.x;
                this.y = e.y;
                timer.start(this, this.showIn, this.showIn);
            }
        };
    },

    function(){
        this.$super();
        this.tooltips = {};
        this.x = this.y = 0;
        this.targetLayer = this.tooltip = this.target = null;

        /**
         * Define interval (in milliseconds) between entering a component and showing 
         * a tooltip for the entered component 
         * @attribute showIn
         * @type {Integer}
         */
        this.showIn = 400;
    }
]);

/**
 * Menu UI component class. The class implements popup menu UI component. 
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
pkg.Menu = Class(pkg.CompList, pkg.ChildrenListener, [
    function $prototype() {
        /**
         * Test if the given menu item is a decorative (not selectable) menu item 
         * @param  {Integer}  index a menu item index
         * @return {Boolean}  true if the given menu item is decorative 
         * @method isDecorative
         */
        this.isDecorative = function(index){
            return zebra.instanceOf(this.kids[index], pkg.Menu.ItemPan) === false;
        };

        this.canHaveFocus = function() {
            return true;
        };

        this.childCompEvent = function(id, src, p1, p2){
            if (id == pkg.ComponentListener.SHOWN ||
                id == pkg.ComponentListener.ENABLED)
            {
                for(var i = 0;i < this.kids.length; i++){
                    if (this.kids[i].content == src) {
                        var ccc = this.kids[i];
                        ccc.setVisible(src.isVisible);
                        ccc.setEnabled(src.isEnabled);
                        if (i > 0 && this.isDecorative(i - 1)) {
                            this.kids[i - 1].setVisible(src.isVisible);
                        }
                        break;
                    }
                }
            }
        };

        this.hasVisibleItems = function(){
            for(var i = 0;i < this.kids.length; i++) {
                if (this.kids[i].isVisible) return true;
            }
            return false;
        };

        this.update = function (g){
            if (this.views["marker"] != null && this.hasFocus()){
                var gap = this.getItemGap(), offset = this.position.offset;
                if (offset >= 0 && !this.isDecorative(offset)){
                    var is = this.getItemSize(offset), l = this.getItemLocation(offset);
                    this.views["marker"].paint(g, l.x - gap,
                                                  l.y - gap,
                                                  is.width  + 2 * gap,
                                                  is.height + 2 * gap, this);
                }
            }
        };

        this.mouseExited = function(e){
            var offset = this.position.offset;
            if (offset >= 0 && this.getMenuAt(offset) == null) {
                this.position.clearPos();
            }
        };

        this.drawPosMarker = function(g,x,y,w,h){};

        this.keyPressed = function(e){
            var position = this.position;

            if (position.metrics.getMaxOffset() >= 0){
                var code = e.code, offset = position.offset;
                if (code == KE.DOWN) {
                    var ccc = this.kids.length;
                    do { offset = (offset + 1) % ccc; }
                    while(this.isDecorative(offset));
                    position.setOffset(offset);
                }
                else {
                    if (code == KE.UP) {
                        var ccc = this.kids.length;
                        do { offset = (ccc + offset - 1) % ccc; }
                        while(this.isDecorative(offset));
                        position.setOffset(offset);
                    }
                    else {
                        if (e.code == KE.ENTER || e.code == KE.SPACE) {
                            this.select(offset);
                        }
                    }
                }
            }
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
         * @param {Inetger} i an index of a menu item for that a sub menu 
         * has to be attached
         * @param {zebra.ui.Menu} m a sub menu to be attached
         * @method setMenuAt
         */
        this.setMenuAt = function (i, m){
            if (m == this || this.isDecorative(i)) {
                throw new Error();
            }

            var p = this.kids[i], sub = this.menus[p];
            this.menus[p] = m;

            if (m != null) {
                if (sub == null) {
                    p.set(L.RIGHT, new pkg.Menu.SubImage());
                }
            }
            else {
                if (sub != null) p.set(L.RIGHT, null);
            }
        };
    },

    function $clazz() {
        this.Label = Class(pkg.Label, []);
        this.CheckStatePan = Class(pkg.ViewPan, []);

        this.ItemPan = Class(pkg.Panel, [
            function $prototype() {
                this.gap = 8;

                this.selected = function() {
                    if (this.content.setState) {
                        this.content.setState(!this.content.getState());
                    }
                };

                this.calcPreferredSize = function (target){
                    var cc = 0, pw = 0, ph = 0;

                    for(var i=0; i < target.kids.length; i++) {
                        var k = target.kids[i];
                        if (k.isVisible) {
                            var ps = k.getPreferredSize();
                            pw += ps.width + (cc > 0 ? this.gap : 0);
                            if (ps.height > ph) ph = ps.height;
                            cc ++;
                        }
                    }

                    return { width:pw, height:ph };
                };

                this.doLayout = function(target){
                    var mw = -1;

                    // calculate icons area maximal width
                    for(var i=0; i < target.parent.kids.length; i++) {
                        var k = target.parent.kids[i];
                        if (k.isVisible && zebra.instanceOf(k, pkg.Menu.ItemPan)) {
                            var l = k.getByConstraints(L.LEFT);
                            if (l && l.isVisible) {
                                var ps = l.getPreferredSize();
                                if (ps.width > mw) mw = ps.width;
                            }
                        }
                    }

                    var left    = target.getByConstraints(L.LEFT),
                        right   = target.getByConstraints(L.RIGHT),
                        content = target.getByConstraints(L.CENTER),
                        t = target.getTop(), 
                        eh = target.height - t - target.getBottom();

                    if (left && left.isVisible) {
                        left.toPreferredSize();
                        left.setLocation(this.getLeft(), t + (eh - left.height)/2);
                    }

                    if (content && content.isVisible) {
                        content.toPreferredSize();
                        content.setLocation(target.getLeft() + (mw >= 0 ? mw + this.gap : 0),
                                            t + (eh - content.height)/2);
                    }

                    if (right && right.isVisible) {
                        right.toPreferredSize();
                        right.setLocation(target.width - target.getLeft() - right.width,
                                          t + (eh - right.height)/2);
                    }
                };
            },

            function (c) {
                this.$super();
                this.content = c;
                this.add(L.CENTER, c);
                this.setEnabled(c.isEnabled);
                this.setVisible(c.isVisible);
            }
        ]);

        this.ChItemPan = Class(this.ItemPan, [
            function (c, state) {
                this.$super(c);
                this.add(L.LEFT, new pkg.Menu.CheckStatePan());
                this.state = state;
            },

            function selected() {
                this.$super();
                this.state = !this.state;
                this.getByConstraints(L.LEFT).view.activate(this.state ? "on" : "off");
            }
        ]);

        this.Line     = Class(pkg.Line,     []);
        this.SubImage = Class(pkg.ImagePan, []);
    },

    function (){
        this.menus = {};
        this.$super(true);
    },

    function (d){
        this.$this();
        for(var k in d) {
            if (d.hasOwnProperty(k)) {
                this.add(k);
                if (d[k]) {
                    this.setMenuAt(this.kids.length-1, new pkg.Menu(d[k]));
                }
            }
        }
    },

    function insert(i, ctr, c) {
        if (zebra.isString(c)) {
            if (c == '-') return this.$super(i, ctr, new pkg.Menu.Line());
            else {
                var m = c.match(/(\[\s*\]|\[x\]|\(x\)|\(\s*\))?\s*(.*)/);
                if (m != null && m[1] != null) {
                    return this.$super(i, ctr,
                                       new pkg.Menu.ChItemPan(new pkg.Menu.Label(m[2]),
                                                              m[1].indexOf('x') > 0));
                }
                c = new pkg.Menu.Label(c);
            }
        }
        return this.$super(i, ctr, new pkg.Menu.ItemPan(c));
    },

    /**
     * Add the specified component as a decorative item of the menu
     * @param {zebra.ui.Panel} c an UI component 
     * @method addDecorative
     */
    function addDecorative(c) {
        this.$super(this.insert, this.kids.length, null, c);
    },

    function kidRemoved(i,c){
        this.setMenuAt(i, null);
        this.$super(i, c);
    },

    function posChanged(target,prevOffset,prevLine,prevCol){
        var off = this.position.offset;
        if (off < 0 || (this.kids.length > 0 && this.kids[off].isVisible)){
            this.$super(target, prevOffset, prevLine, prevCol);
        }
        else {
            var d = (prevOffset < off) ? 1 : -1, cc = this.kids.length, ccc = cc;
            for(; cc > 0 && (this.kids[off].isVisible === false || this.isDecorative(off)); cc--){
                off += d;
                if (off < 0) off = ccc - 1;
                if (off >= ccc) off = 0;
            }

            if (cc > 0){
                this.position.setOffset(off);
                this.repaint();
            }
        }
    },

    function select(i) {
        if (i < 0 || this.isDecorative(i) === false) {
            if (i >= 0) {
                if (this.kids[i].content.isEnabled === false) {
                    return;
                }
                this.kids[i].selected();
            }
            this.$super(i);
        }
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
 * @extends {zebra.ui.Panel}
 */
pkg.Menubar = Class(pkg.Panel, pkg.ChildrenListener, pkg.KeyListener, [
    function $prototype() {
        this.childInputEvent = function(e){
            var target = L.getDirectChild(this, e.source);
            switch(e.ID)
            {
                case MouseEvent.ENTERED:
                    if (this.over != target){
                        var prev = this.over;
                        this.over = target;
                        if (this.selected != null) this.$select(this.over);
                        else this.repaint2(prev, this.over);
                    }
                    break;
                case MouseEvent.EXITED:
                    var p = L.getRelLocation(e.absX, e.absY,
                                             this.getCanvas(), this.over);
                    if (p[0] < 0 || p[1] < 0 ||
                        p[0] >= this.over.width || p[1] >= this.over.height)
                    {
                        var prev = this.over;
                        this.over = null;
                        if (this.selected == null) this.repaint2(prev, this.over);
                    }
                    break;
                case MouseEvent.CLICKED:
                    this.over = target;
                    this.$select(this.selected == target ? null : target);
                    break;
            }
        };

        this.activated = function(b) {
            if (b === false) this.$select(null);
        };

        this.$select = function(b){
            if(this.selected != b){
                var prev = this.selected, d = this.getCanvas();
                this.selected = b;
                if (d != null) {
                    var pop = d.getLayer(pkg.PopupLayer.ID);
                    pop.removeAll();
                    if (this.selected != null) {
                        pop.setMenubar(this);
                        var menu = this.getMenu(this.selected);
                        if (menu != null && menu.hasVisibleItems()) {
                            var abs = L.getAbsLocation(0,0,this.selected);
                            menu.setLocation(abs.x, abs.y + this.selected.height + 1);
                            pop.add(menu);
                        }
                    }
                    else pop.setMenubar(null);
                }
                this.repaint2(prev, this.selected);
            }
        };

        this.repaint2 = function(i1,i2){
            if (i1 != null) i1.repaint();
            if (i2 != null) i2.repaint();
        };

        this.paint = function(g){
            if (this.views) {
                var target = (this.selected != null) ? this.selected 
                                                     : this.over;
                if (target != null) {
                    var v = (this.selected != null) ? this.views["on"] 
                                                    : this.views["off"];
                    if (v != null) {
                        v.paint(g, target.x, target.y,
                                   target.width, target.height,
                                   this);
                    }
                }
            }
        };

        this.keyPressed = function(e){
            if (this.selected != null) {
                var idx = this.indexOf(this.selected), pidx = idx, c = null;
                if (e.code == KE.LEFT){
                    var ccc = this.kids.length;
                    do {
                        idx = (ccc + idx - 1) % ccc;
                        c = this.kids[idx];
                    }
                    while (c.isEnabled === false || c.isVisible === false);
                }
                else {
                    if (e.code == KE.RIGHT){
                        var ccc = this.kids.length;
                        do {
                            idx = (idx + 1) % ccc;
                            c = this.kids[idx];
                        }
                        while (c.isEnabled === false || c.isVisible === false);
                    }
                }
                if (idx != pidx) this.$select(this.kids[idx]);
            }
        };

        /**
         * Add a new item to the menu bar component and binds the given menu 
         * to it.
         * @param {zebra.ui.Panel|String} c an item title that can be passed as 
         * an UI component or a string.
         * @param {zebra.ui.Menu} m a menu
         * @method addMenu
         */
        this.addMenu = function(c, m){
            this.add(c);
            this.setMenuAt(this.kids.length - 1, m);
        };

        /**
         * Bind the specified menu to the given item of the menu bar
         * @param {Integer} i an index of a menu bar item
         * @param {zebra.ui.Menu} m a menu. Pass null as the parameter value
         * to unbind the given a menu from the given menu bar item
         * @method setMenuAt
         */
        this.setMenuAt = function(i, m){
            if (i >= this.kids.length) {
                throw new Error("Invalid kid index:" + i);
            }

            var c = this.kids[i];

            if(m == null) {
                var pm = this.menus.hasOwnProperty(c) ? this.menus[c] : null;
                if (pm != null) {
                    delete this.menus[c];
                }
            }
            else {
                this.menus[c] = m;
            }
        };

        /**
         * Get a menu component that is bound to the given menu bar item
         * @param {Integer} i an index of a menu bar item
         * @return {zebra.ui.Menu}  an UI menu component
         * @method getMenuAt 
         */
        this.getMenuAt = function(i) {
            return this.getMenu(this.kids[i]);
        };

        /**
         * Get a menu component that is bound to the given menu bar item
         * @param {zebra.ui.Panel} c a menu bar item UI component 
         * @return {zebra.ui.Menu}  an UI menu component
         * @method getMenu
         */
        this.getMenu = function(c) {
            return this.menus.hasOwnProperty(c) ? this.menus[c] : null;
        };
    },

    function $clazz() {
        this.Label = Class(pkg.Label, []);
    },

    function (){
        this.menus = {};
        this.over = this.selected = null;
        this.$super();
    },

    function (d){
        this.$this();
        for(var k in d) {
            if (d.hasOwnProperty(k)) {
                if (d[k]) this.addMenu(k, new pkg.Menu(d[k]));
                else this.add(k);
            }
        }
    },

    function insert(i, constr, c) {
        if (zebra.isString(c)) c = new pkg.Menubar.Label(c);
        this.$super(i, constr, c);
    },

    function kidRemoved(i, c){
        this.setMenuAt(i, null);
        this.$super(i);
    },

    function removeAll(){
        this.$super();
        this.menus = {};
    }
]);
pkg.Menubar.prototype.setViews = pkg.$ViewsSetter;

/**
 * UI popup layer class. Special layer implementation to show 
 * context menu. Normally the layer is not used directly.   
 * @class zebra.ui.PopupLayer
 * @constructor
 * @extends {zebra.ui.BaseLayer}
 */
pkg.PopupLayer = Class(pkg.BaseLayer, pkg.ChildrenListener, [
    function $clazz() {
        this.ID = "pop";
    },

    function $prototype() {
        this.mTop = this.mLeft = this.mBottom = this.mRight = 0;

        this.layerMousePressed = function(x,y,mask){
            if (this.isLayerActive(x, y) && this.getComponentAt(x, y) == this){
                this.removeAll();
                this.setMenubar(null);
            }
        };

        this.isLayerActive = function(x,y) {
            return this.kids.length > 0 &&
                   (   arguments.length === 0 ||
                       this.mbar == null      ||
                       y > this.mBottom       ||
                       y < this.mTop          ||
                       x < this.mLeft         ||
                       x > this.mRight        ||
                       this.getComponentAt(x, y) != this );
        };

        this.childInputEvent = function(e){
            if(e.UID == pkg.InputEvent.KEY_UID){
                if (e.ID == KE.PRESSED && e.code == KE.ESCAPE){
                    this.remove(L.getDirectChild(this, e.source));
                    if (this.kids === 0) this.setMenubar(null);
                }

                if (zebra.instanceOf(this.mbar, pkg.KeyListener)) {
                    pkg.events.performInput(new KE(this.mbar, e.ID, e.code, e.ch, e.mask));
                }
            }
        };

        this.calcPreferredSize = function (target){
            return { width:0, height:0 };
        };

        this.setMenubar = function(mb){
            if(this.mbar != mb){
                this.removeAll();
                if (this.mbar && this.mbar.activated) this.mbar.activated(false);
                this.mbar = mb;
                if (this.mbar != null){
                    var abs = L.getAbsLocation(0, 0, this.mbar);
                    this.mLeft = abs.x;
                    this.mRight = this.mLeft + this.mbar.width - 1;
                    this.mTop = abs.y;
                    this.mBottom = this.mTop + this.mbar.height - 1;
                }
                if (this.mbar && this.mbar.activated) this.mbar.activated(true);
            }
        };

        this.posChanged = function (target, prevOffset, prevLine, prevCol){
            if (timer.get(this)) {
                timer.stop(this);
            }

            var selectedIndex = target.offset;
            if (selectedIndex >= 0) {
                var index = this.pcMap.indexOf(target), 
                    sub = this.kids[index].getMenuAt(selectedIndex);

                if (index + 1 < this.kids.length && sub != this.kids[index + 1]) {
                    this.removeAt(index + 1);
                }

                if (index + 1 == this.kids.length && sub != null) {
                    timer.start(this, this.showIn, this.showIn*4);
                }
            }
        };

        this.fired  = function(src,data){
            var index = (data != null) ? src.selectedIndex :  -1;
            if (index >= 0) {
                var sub = src.getMenuAt(index);
                if (sub != null) {
                    if (sub.parent == null){
                        sub.setLocation(src.x + src.width - 10, src.y + src.kids[index].y);
                        this.add(sub);
                    }
                    else {
                        pkg.focusManager.requestFocus(this.kids[this.kids.length - 1]);
                    }
                }
                else {
                    this.removeAll();
                    this.setMenubar(null);
                }
            }
            else {
                if (src.selectedIndex >= 0) {
                    var sub = src.getMenuAt(src.selectedIndex);
                    if (sub != null) {
                        this.remove(sub);
                    }
                }
            }
        };

        this.run = function(){
            timer.stop(this);
            if (this.kids.length > 0) {
                var menu = this.kids[this.kids.length - 1];
                menu.select(menu.position.offset);
            }
        };

        this.doLayout = function (target){
            var cnt = this.kids.length;
            for(var i = 0; i < cnt; i++){
                var m = this.kids[i];
                if (zebra.instanceOf(m, pkg.Menu)){
                    var ps = m.getPreferredSize(),
                        xx = (m.x + ps.width > this.width) ? this.width - ps.width : m.x,
                        yy = (m.y + ps.height > this.height) ? this.height - ps.height : m.y;
                    m.setSize(ps.width, ps.height);
                    if (xx < 0) xx = 0;
                    if (yy < 0) yy = 0;
                    m.setLocation(xx, yy);
                }
            }
        };
    },

    function (){
        this.mbar  = null;
        this.pcMap = [];
        this.showIn = 250;
        this.$super(pkg.PopupLayer.ID);
    },

    function removeAt(index){
        for(var i = this.kids.length - 1;i >= index; i--) {
            this.$super(index);
        }
    },

    function kidAdded(index,id,lw){
        this.$super(index, id, lw);
        if (zebra.instanceOf(lw, pkg.Menu)){
            lw.position.clearPos();
            lw.select(-1);
            this.pcMap.splice(index, 0, lw.position);
            lw._.add(this);
            lw.position._.add(this);
            lw.requestFocus();
        }
    },

    function kidRemoved(index,lw){
        this.$super(index, lw);
        if (zebra.instanceOf(lw, pkg.Menu)) {
            lw._.remove(this);
            lw.position._.remove(this);
            this.pcMap.splice(index, 1);
            if (this.kids.length > 0) {
                this.kids[this.kids.length - 1].select(-1);
                this.kids[this.kids.length - 1].requestFocus();
            }
        }
    }
]);

/**
 * Popup menu manager class. The manager registering and triggers showing context popup menu. 
 * Menu appearing is triggered by right mouse click or double fingers touch event.
 
        // create canvas
        var canvas = new zebra.ui.zCanvas();

        // create menu with three items
        var m = new zebra.ui.Menu();
        m.add("Menu Item 1");
        m.add("Menu Item 2");
        m.add("Menu Item 3");
    
        // bind the menu to root panel
        zebra.ui.popup.setPopup(canvas.root, m);
 
 * The popup manager use "zebra.ui.PopupInfo" interface implementation to understand which
 * popup menu has to be shown at the given location of the target UI component. Developer 
 * can tune a context menu appearing depending on the current mouse cursor or touch location:

        // create canvas
        var canvas = new zebra.ui.zCanvas();

        // visualize 50x50 pixels hot spot of toot component  
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
    
        // bind the popup info interface implementation to the canvas
        // root component
        zebra.ui.popup.setPopup(canvas.root, new zebra.ui.PopupInfo([
            function getPopup(target, x, y) {
                // test if mouse cursor position is in red spot area
                // and return context menu if it is true 
                if (x > 50 && y > 50 && x < 100 && y <  100)  {
                    return m;
                }
                return null;
            }
        ]));
 *
 *  Also developers can define a context menu on the level of component, 
 *  without necessary to register it in popup manager. For this just implement
 *  "zebra.ui.PopupInfo" interface with a component that has a context menu:
 
        // create canvas and set border layout for root panel
        var canvas = new zebra.ui.zCanvas();
        canvas.root.setLayout(new zebra.layout.BorderLayout());

        // instantiate anonymous label class that implements 
        // popup info interface to bind a context menu to 
        // the label
        var lab = new zebra.ui.Label("I have a context menu defined", 
                                     zebra.ui.PopupInfo, [
            function getPopup(target, x, y) { return m; }
        ]);
        lab.setBorder("plain");
        lab.setPadding(8);

        // create menu with three items
        var m = new zebra.ui.Menu();
        m.add("Menu Item 1");
        m.add("Menu Item 2");
        m.add("Menu Item 3");

        // add label to top part of root panel
        canvas.root.add(zebra.layout.TOP, lab);

 * @class zebra.ui.PopupManager
 * @constructor
 * @extends {zebra.ui.Manager}
 */
pkg.PopupManager = Class(pkg.Manager, pkg.MouseListener, [
    function $prototype() {
        /**
         * Get popup info interface that is bound to the given component
         * @param  {zebra.ui.Panel} c an UI component
         * @return {zebra.ui.PopupInfo}  an popup info interface implementation
         * @method  getPopup
         */
        this.getPopup = function (c){
            return this.menus.hasOwnProperty(c) ? this.menus[c] : null;
        };

        this.mouseClicked = function (e){
            this.initialX = e.absX;
            this.initialY = e.absY;
            if((e.mask & MouseEvent.RIGHT_BUTTON) > 0) {
                this.showPopup(e.source, e.x, e.y); 
            }
        };

        this.fetchMenu = function(target,x,y){
            var popup = this.getPopup(target);
            return (popup != null) ? popup.getPopup(target, x, y) 
                                   : (zebra.instanceOf(target, pkg.PopupInfo) ? target.getPopup(target, x, y) 
                                                                              : null);
        };

        this.showPopup = function(target,x,y){
            var menu = this.fetchMenu(target, x, y);
            if (menu != null) {
                menu.setLocation(this.initialX, this.initialY);
                target.getCanvas().getLayer(pkg.PopupLayer.ID).add(menu);
                menu.requestFocus();
            }
            this.time = -1;
        };

        /**
         * Set the given context menu or an zebra.ui.PopupInfo interface implementation 
         * to the specified UI component.
         * @param {zebra.ui.Panel} c an UI component
         * @param {zebra.ui.Menu|zebra.ui.PopupInfo} p a popup info interface implementation
         * that says when and which context menu has to be shown for the given UI component.
         * Or UI context menu directly. Passing null as the argument value delete a context
         * menu definition from the given UI component. 
         * @method setPopup   
         */
        this.setPopup = function (c,p){
            if (p == null) { 
                delete this.menus[c];
            }
            else {
                if (zebra.instanceOf(p, pkg.PopupInfo) === false) {
                    var menu = p;
                    p = new pkg.PopupInfo([
                        function $prototype() {
                            this.getPopup = function(target, x, y) { return menu; };
                        }
                    ]); 
                } 
                this.menus[c] = p;
            }
        };
    },

    function () {
        this.$super();
        this.menus = {};
        this.time = this.initialX = this.initialY = 0;
    }
]);

pkg.WindowTitleView = Class(pkg.View, [
    function $prototype() {
        this[''] = function(bg) {
            this.radius = 6;
            this.gap = this.radius;
            this.bg = bg ? bg : "#66CCFF";
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

})(zebra("ui"), zebra.Class, zebra.Interface);
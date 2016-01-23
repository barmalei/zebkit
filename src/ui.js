(function(pkg, Class) {

// redefine configuration
zebkit()["zebkit.json"] = pkg.$url.join("zebkit.json");

/**
 * @module  ui
 */

var Cursor = pkg.Cursor, Listeners = zebkit.util.Listeners, KE = pkg.KeyEvent,
    L = zebkit.layout, instanceOf = zebkit.instanceOf;

pkg.$ViewsSetter = function (v){
    this.views = {};
    for(var k in v) {
        if (v.hasOwnProperty(k)) this.views[k] = pkg.$view(v[k]);
    }
    this.vrp();
};

/**
 * Line UI component class. Draw series of vertical or horizontal lines of using
 * the given line width and color. Vertical or horizontal line rendering s selected
 * depending on the line component size: if height is greater than width than vertical
 * line will be rendered.
 * @constructor
 * @class zebkit.ui.Line
 * @extends {zebkit.ui.Panel}
 */
pkg.Line = Class(pkg.Panel, [
    function() {
        /**
         * Line colors
         * @attribute colors
         * @type {Array}
         * @readOnly
         * @default [ "gray" ]
         */
        this.colors = [ "gray" ];
        this.$super();
    },

    function $prototype() {
        /**
         * Line width
         * @attribute lineWidth
         * @type {Integer}
         * @default 1
         */
        this.lineWidth = 1;

        /**
         * Set set of colors to be used to paint the line. Number of colors defines the number of
         * lines to be painted.
         * @param {String} colors* colors
         * @method setLineColors
         */
        this.setLineColors = function() {
            this.colors = (arguments.length === 1) ? (Array.isArray(arguments[0]) ? arguments[0].slice(0)
                                                                                  : [ arguments[0] ] )
                                                    : Array.prototype.slice.call(arguments);
            this.repaint();
        };

        this.paint = function(g) {
            var isHor  = this.width > this.height,
                left   = this.getLeft(),
                right  = this.getRight(),
                top    = this.getTop(),
                bottom = this.getBottom(),
                xy     = isHor ? top : left;

            for(var i = 0; i < this.colors.length; i++) {
                if (this.colors[i] != null) {
                    g.setColor(this.colors[i]);
                    if (isHor === true) {
                        g.drawLine(this.left, xy, this.width - right - left, xy, this.lineWidth);
                    }
                    else {
                        g.drawLine(xy, top, xy, this.height - top - bottom, this.lineWidth);
                    }
                }
                xy += this.lineWidth;
            }
        };

        this.calcPreferredSize = function(target) {
            var s = this.colors.length * this.lineWidth;
            return { width: s, height:s};
        };
    }
]);

/**
 * Label UI component class. The label can be used to visualize simple string or multi lines text or
 * the given text render implementation:

        // render simple string
        var l = new zebkit.ui.Label("Simple string");

        // render multi lines text
        var l = new zebkit.ui.Label(new zebkit.data.Text("Multiline\ntext"));

        // render password text
        var l = new zebkit.ui.Label(new zebkit.ui.PasswordText("password"));

 * @param  {String|zebkit.data.TextModel|zebkit.ui.TextRender} [r] a text to be shown with the label.
 * You can pass a simple string or an instance of a text model or an instance of text render as the
 * text value.
 * @class zebkit.ui.Label
 * @constructor
 * @extends zebkit.ui.ViewPan
 */
pkg.Label = Class(pkg.ViewPan, [
    function $prototype() {
        /**
         * Get the label text
         * @return {String} a zebkit label text
         * @method getValue
         */
        this.getValue = function() {
            return this.view.getValue();
        };

        /**
         * Set the text field text model
         * @param  {zebkit.data.TextModel|String} m a text model to be set
         * @method setModel
         */
        this.setModel = function(m) {
            this.setView(zebkit.isString(m) ? new pkg.StringRender(m)
                                           : new pkg.TextRender(m));
        };

        this.getModel = function() {
            return this.view != null ? this.view.target : null;
        };

        /**
         * Get the label text color
         * @return {String} a zebkit label color
         * @method getColor
         */
        this.getColor = function (){
            return this.view.color;
        };

        /**
         * Get the label text font
         * @return {zebkit.ui.Font} a zebkit label font
         * @method getFont
         */
        this.getFont = function (){
            return this.view.font;
        };

        /**
         * Set the label text value
         * @param  {String} s a new label text
         * @method setValue
         * @chainable
         */
        this.setValue = function(s){
            if (s == null) s = "";

            var old = this.view.getValue();
            if (old !== s) {
                this.view.setValue(s);
                this.repaint();
            }

            return this;
        };

        /**
         * Set the label text color
         * @param  {String} c a text color
         * @method setColor
         * @chainable
         */
        this.setColor = function(c){
            if (this.view.setColor(c)) {
                this.repaint();
            }
            return this;
        };

        /**
         * Set the label text font
         * @param  {zebkit.ui.Font} f a text font
         * @method setFont
         * @chainable
         */
        this.setFont = function(f){
            if (this.view.setFont(f)){
                this.repaint();
            }
            return this;
        };
    },

    function (r) {
        this.setView(arguments.length === 0 ||
                     zebkit.isString(r)      ? new pkg.StringRender(r)
                                             : (instanceOf(r, zebkit.data.TextModel) ? new pkg.TextRender(r)
                                                                                     : r));
        this.$super();
    }
]);

/**
 * Shortcut class to render multi lines text without necessity to create multi line model
 * @param {String} [t] a text string
 * @constructor
 * @class zebkit.ui.MLabel
 * @extends zebkit.ui.Label
 */
pkg.MLabel = Class(pkg.Label, [
    function(t){
        this.$super(new zebkit.data.Text(t == null ? "" : t));
    }
]);

/**
 * Shortcut class to render bold text in Label
 * @param {String|zebkit.ui.TextRender|zebkit.data.TextModel} [t] a text string,
 * text model or text render instance
 * @constructor
 * @class zebkit.ui.BoldLabel
 * @extends zebkit.ui.Label
 */
pkg.BoldLabel = Class(pkg.Label, []);

/**
 * Image label UI component. This is UI container that consists from an image
 * component and an label component.Image is located at the left size of text.
 * @param {Image|String} img an image or path to the image
 * @param {String|zebkit.ui.TextRender|zebkit.data.TextModel} txt a text string,
 * text model or text render instance
 * @constructor
 * @class zebkit.ui.ImageLabel
 * @extends {zebkit.ui.Panel}
 */
pkg.ImageLabel = Class(pkg.Panel, [
    function(txt, img) {
        this.$super(new L.FlowLayout("left", "center", "horizontal", 6));
        this.add(new pkg.ImagePan(null));
        this.add(instanceOf(txt, pkg.Panel) ? txt : new pkg.Label(txt));
        this.kids[1].setVisible(txt != null);
        this.setImage(img);
    },

    /**
     * Set the specified caption
     * @param {String} c an image label caption text
     * @method setCaption
     */
    function setCaption(c) {
        this.kids[1].setValue(c);
        this.kids[1].setVisible(c != null);
    },

    /**
     * Set the specified label image
     * @param {String|Image} p a path to an image of image object
     * @method setImage
     */
    function setImage(p) {
        this.kids[0].setImage(p);
        this.kids[0].setVisible(p != null);
    }
]);

/**
 * State panel class. The class is UI component that allows to customize
 * the component  face, background and border depending on the component
 * state. Number and names of states the component can have is defined
 * by developers. To bind a view to the specified state use zebkit.ui.ViewSet
 * class. For instance if a component has to support two states : "state1" and
 * "state2" you can do it as following:

        // create state component
        var p = new zebkit.ui.StatePan();

        // define border view that contains views for "state1" and "state2"
        p.setBorder({
            "state1": new zebkit.ui.Border("red", 1),
            "state1": new zebkit.ui.Border("blue", 2)

        });

        // define background view that contains views for "state1" and "state2"
        p.setBorder({
            "state1": "yellow",
            "state1": "green"
        });

        // set component state
        p.setState("state1");

 * State component children components can listening when the state of the component
 * has been updated by implementing "parentStateUpdated(o,n,id)" method. It gets old
 * state, new state and a view id that is mapped to the new state.  The feature is
 * useful if we are developing a composite components whose children component also
 * should react to a state changing.
 * @class  zebkit.ui.StatePan
 * @constructor
 * @extends {zebkit.ui.ViewPan}
 */
pkg.StatePan = Class(pkg.ViewPan, [
    function $prototype() {
        /**
         * Current component state
         * @attribute state
         * @readOnly
         * @type {Object}
         */
        this.state = null;

        /**
         * Set the component state
         * @param {Object} s a state
         * @method  setState
         */
        this.setState = function(s) {
            if (s !== this.state){
                var prev = this.state;
                this.state = s;
                this.stateUpdated(prev, s);
            }
        };

        /**
         * Define the method if the state value has to be
         * somehow converted to a view id. By default the state value
         * itself is used as a view id.
         * @param {Object} s a state to be converted
         * @return {String} a view ID
         * @method toViewId
         */

        /**
         * Called every time the component state has been updated
         * @param  {Integer} o a previous component state
         * @param  {Integer} n a new component state
         * @method stateUpdated
         */
        this.stateUpdated = function(o,n){
            var b = false, id = (this.toViewId != null ? this.toViewId(n) : n);

            if (id != null) {
                for(var i=0; i < this.kids.length; i++) {
                    if (this.kids[i].parentStateUpdated != null) {
                        this.kids[i].parentStateUpdated(o, n, id);
                    }
                }

                if (this.border != null && this.border.activate != null) {
                    b = this.border.activate(id) || b;
                }

                if (this.view != null && this.view.activate != null) {
                    b = this.view.activate(id) || b;
                }

                if (this.bg != null && this.bg.activate != null) {
                    b = this.bg.activate(id) || b;
                }

                if (b) this.repaint();
            }
        };

        /**
         * Refresh state
         * @protected
         * @method syncState
         */
        this.syncState = function() {
            this.stateUpdated(this.state, this.state);
        };
    },

    function setView(v){
        if (v != this.view){
            this.$super(v);
            // check if the method called after constructor execution
            // otherwise sync is not possible
            if (this.kids != null) this.syncState(this.state, this.state);
        }
        return this;
    },

    function setBorder(v){
        if (v != this.border){
            this.$super(v);
            this.syncState(this.state, this.state);
        }
        return this;
    },

    function setBackground(v){
        if (v != this.bg){
            this.$super(v);
            this.syncState(this.state, this.state);
        }
        return this;
    }
]);

/**
 * Event state panel class. The class implements UI component whose face, border and
 * background view depends on its input events state. The component is good basis
 * for creation  dynamic view UI components.The state the component can be is:

    - **over** the pointer cursor is inside the component
    - **out** the pointer cursor is outside the component
    - **pressed over** the pointer cursor is inside the component and an action pointer
      button or key is pressed
    - **pressed out** the pointer cursor is outside the component and an action pointer
      button or key is pressed
    - **disabled** the component is disabled

 * The view border, background or face should be set as "zebkit.ui.ViewSet" where an required
 * for the given component state view is identified by an id. By default corresponding to
 * component states views IDs are the following: "over", "pressed.over", "out", "pressed.out",
 * "disabled".  Imagine for example we have two colors and we need to change between the colors
 * every time pointer cursor is over/out of the component:

     // create state panel
     var statePan = new zebkit.ui.EvStatePan();

     // add dynamically updated background
     statePan.setBackground(new zebkit.ui.ViewSet({
        "over": "red",
        "out": "blue"
     }));

 * Alone with background border view can be done also dynamic

     // add dynamically updated border
     statePan.setBorder(new zebkit.ui.ViewSet({
        "over": new zebkit.ui.Border("green", 4, 8),
        "out": null
     }));

 * Additionally the UI component allows developer to specify whether the component can hold
 * input focus and which UI component has to be considered as the focus marker. The focus marker
 * component is used as anchor to paint focus marker view. In simple case the view can be just
 * a border. So border will be rendered around the focus marker component:

     // create state panel that contains one label component
     var statePan = new zebkit.ui.EvStatePan();
     var lab      = new zebkit.ui.Label("Focus marker label");
     lab.setPadding(6);
     statePan.setPadding(6);
     statePan.setLayout(new zebkit.layout.BorderLayout());
     statePan.add("center", lab);

     // set label as an anchor for focus border indicator
     statePan.setFocusAnchorComponent(lab);
     statePan.setFocusMarkerView("plain");

 * @class zebkit.ui.EvStatePan
 * @constructor
 * @extends zebkit.ui.StatePan
 */
var OVER = "over", PRESSED_OVER = "pressed.over", OUT = "out", PRESSED_OUT = "pressed.out", DISABLED = "disabled";

pkg.EvStatePan = Class(pkg.StatePan,  [
    function $prototype() {
        this.state = OUT;
        this.$isIn = false;

        this.toViewId = function(state) {
            return state;
        };

        this._keyPressed = function(e) {
            if (this.state !== PRESSED_OVER &&
                this.state !== PRESSED_OUT  &&
                (e.code === KE.ENTER || e.code === KE.SPACE))
            {
                this.setState(PRESSED_OVER);
            }
        };

        this._keyReleased = function(e) {
            if (this.state === PRESSED_OVER || this.state === PRESSED_OUT){
                var prev = this.state;
                this.setState(OVER);
                if (this.$isIn === false) this.setState(OUT);
            }
        };

        this._pointerEntered = function(e) {
            if (this.isEnabled === true) {
                this.setState(this.state === PRESSED_OUT ? PRESSED_OVER : OVER);
                this.$isIn = true;
            }
        };

        this._pointerPressed = function(e) {
            if (this.state !== PRESSED_OVER && this.state !== PRESSED_OUT && e.isAction()){
                this.setState(PRESSED_OVER);
            }
        };

        this._pointerReleased = function(e) {
            if ((this.state === PRESSED_OVER || this.state === PRESSED_OUT) && e.isAction()){
                if (e.source === this) {
                    this.setState(e.x >= 0 && e.y >= 0 && e.x < this.width && e.y < this.height ? OVER
                                                                                                : OUT);
                }
                else {
                    var p = L.toParentOrigin(e.x, e.y, e.source, this);
                    this.$isIn = p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height;
                    this.setState(this.$isIn ? OVER : OUT);
                }
            }
        };

        this.childKeyPressed = function(e) {
            this._keyPressed(e);
        };

        this.childKeyReleased = function(e) {
            this._keyReleased(e);
        };

        this.childPointerEntered = function(e) {
            this._pointerEntered(e);
        };

        this.childPointerPressed = function(e) {
            this._pointerPressed(e);
        };

        this.childPointerReleased = function(e) {
            this._pointerReleased(e);
        };

        this.childPointerExited = function(e) {
            // check if the pointer cursor is in of the source component
            // that means another layer has grabbed control
            if (e.x >= 0 && e.y >= 0 && e.x < e.source.width && e.y < e.source.height) {
                this.$isIn = false;
            }
            else {
                var p = L.toParentOrigin(e.x, e.y, e.source, this);
                this.$isIn = p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height;
            }

            if (this.$isIn === false) {
                this.setState(this.state === PRESSED_OVER ? PRESSED_OUT : OUT);
            }
        };

        /**
         * Define key pressed events handler
         * @param  {zebkit.ui.KeyEvent} e a key event
         * @method keyPressed
         */
        this.keyPressed = function(e){
            this._keyPressed(e);
        };

        /**
         * Define key released events handler
         * @param  {zebkit.ui.KeyEvent} e a key event
         * @method keyReleased
         */
        this.keyReleased = function(e){
            this._keyReleased(e);
        };

        /**
         * Define pointer entered events handler
         * @param  {zebkit.ui.PointerEvent} e a key event
         * @method pointerEntered
         */
        this.pointerEntered = function (e){
            this._pointerEntered();
        };

        /**
         * Define pointer exited events handler
         * @param  {zebkit.ui.PointerEvent} e a key event
         * @method pointerExited
         */
        this.pointerExited = function(e){
            if (this.isEnabled === true) {
                this.setState(this.state == PRESSED_OVER ? PRESSED_OUT : OUT);
                this.$isIn = false;
            }
        };

        /**
         * Define pointer pressed events handler
         * @param  {zebkit.ui.PointerEvent} e a key event
         * @method pointerPressed
         */
        this.pointerPressed = function(e){
            this._pointerPressed(e);
        };

        /**
         * Define pointer released events handler
         * @param  {zebkit.ui.PointerEvent} e a key event
         * @method pointerReleased
         */
        this.pointerReleased = function(e){
            this._pointerReleased(e);
        };

        /**
         * Define pointer dragged events handler
         * @param  {zebkit.ui.PointerEvent} e a key event
         * @method pointerDragged
         */
        this.pointerDragged = function(e){
            if (e.isAction()) {
                var pressed = (this.state === PRESSED_OUT || this.state === PRESSED_OVER);
                if (e.x > 0 && e.y > 0 && e.x < this.width && e.y < this.height) {
                    this.setState(pressed ? PRESSED_OVER : OVER);
                }
                else {
                    this.setState(pressed ? PRESSED_OUT : OUT);
                }
            }
        };
    },

    function setEnabled(b){
        this.$super(b);
        this.setState(b ? OUT : DISABLED);
    }
]);

/**
 * Composite event state panel
 * @constructor
 * @extends {zebkit.ui.EvStatePan}
 * @class  zebkit.ui.CompositeEvStatePan
 */
pkg.CompositeEvStatePan = Class(pkg.EvStatePan, [
    function $prototype() {
        /**
         * Indicates if the component can have focus
         * @attribute canHaveFocus
         * @readOnly
         * @type {Boolean}
         */
        this.canHaveFocus = true;


        this.catchInput = true;


        this.focusComponent = null;

        /**
         * Reference to an anchor focus marker component
         * @attribute focusMarkerView
         * @readOnly
         * @type {zebkit.ui.Panel}
         */
        this.focusMarkerView = null;

        this.paintOnTop = function(g){
            var fc = this.focusComponent;
            if (this.focusMarkerView != null && fc != null && this.hasFocus()) {
                this.focusMarkerView.paint(g, fc.x, fc.y, fc.width, fc.height, this);
            }
        };

        /**
         * Set the view that has to be rendered as focus marker
         * when the component gains focus.
         * @param  {String|zebkit.ui.View|Function} c a view.
         * The view can be a color or border string code or view
         * or an implementation of zebkit.ui.View "paint(g,x,y,w,h,t)"
         * method.
         * @method setFocusMarkerView
         */
        this.setFocusMarkerView = function (c){
            if (c != this.focusMarkerView){
                this.focusMarkerView = pkg.$view(c);
                this.repaint();
            }
        };

        /**
         * Says if the component can hold focus or not
         * @param  {Boolean} b true if the component can gain focus
         * @method setCanHaveFocus
         */
        this.setCanHaveFocus = function(b){
            if (this.canHaveFocus != b){
                var fm = pkg.focusManager;
                if (b === false && fm.focusOwner === this) {
                    fm.requestFocus(null);
                }
                this.canHaveFocus = b;
            }
        };

        /**
         * Set the specified children component to be used as
         * focus marker view anchor component. Anchor component
         * is a component over that the focus marker view is
         * painted.
         * @param  {zebkit.ui.Panel} c  an anchor component
         * @method setFocusAnchorComponent
         */
        this.setFocusAnchorComponent = function(c) {
            if (this.focusComponent != c) {
                if (c != null && this.kids.indexOf(c) < 0) {
                    throw new Error("Focus component doesn't exist");
                }
                this.focusComponent = c;
                this.repaint();
            }
        };
    },

    function focused() {
        this.$super();
        this.repaint();
    },

    function kidRemoved(i,l){
        if (l === this.focusComponent) this.focusComponent = null;
        this.$super(i, l);
    }
]);

pkg.ButtonRepeatMix = zebkit.Interface([
    function $prototype () {
        /**
         * Indicate if the button should
         * fire event by pressed event
         * @attribute isFireByPress
         * @type {Boolean}
         * @default false
         * @readOnly
         */
        this.isFireByPress = false;

        /**
         * Fire button event repeating period. -1 means
         * the button event repeating is disabled.
         * @attribute firePeriod
         * @type {Integer}
         * @default -1
         * @readOnly
         */
        this.firePeriod = -1;

        this.startIn = 400;

        /**
         * The method is executed for a button that is configured
         * to repeat fire events.
         * @method run
         * @protected
         */
        this.run = function() {
            if (this.state === PRESSED_OVER) this.fire();
        };

        /**
         * Set the mode the button has to fire events. Button can fire
         * event after it has been unpressed or immediately when it has
         * been pressed. Also button can start firing events periodically
         * when it has been pressed and held in the pressed state.
         * @param  {Boolean} b  true if the button has to fire event by
         * pressed event
         * @param  {Integer} firePeriod the period of time the button
         * has to repeat firing events if it has been pressed and
         * held in pressed state. -1 means event doesn't have
         * repeated
         * @param  {Integer} [startIn] the timeout when repeat events
         * has to be initiated
         * @method setFireParams
         */
        this.setFireParams = function (b, firePeriod, startIn){
            if (this.repeatTask != null) this.repeatTask.shutdown();
            this.isFireByPress = b;
            this.firePeriod = firePeriod;
            if (arguments.length > 2) this.startIn = startIn;
        };

        this.fire = function() {
            this._.fired(this);
            if (this.catchFired != null) this.catchFired();
        };
    },

    function stateUpdated(o,n){
        this.$super(o, n);
        if (n === PRESSED_OVER){
            if (this.isFireByPress === true){
                this.fire();
                if (this.firePeriod > 0) {
                    this.repeatTask = zebkit.util.task(this.run, this).run(this.startIn, this.firePeriod);
                }
            }
        }
        else {
            if (this.firePeriod > 0 && this.repeatTask != null) {
                this.repeatTask.shutdown();
            }

            if (n === OVER && (o === PRESSED_OVER && this.isFireByPress === false)) {
                this.fire();
            }
        }
    }
]);

pkg.ArrowButton = Class(pkg.EvStatePan, pkg.ButtonRepeatMix, [
    function $clazz() {
        this.ArrowView = Class(pkg.ArrowView, []);
    },

    function $prototype() {
        this.direction = "left";

        this.setArrowDirection = function(d) {
            this.iterateArrowViews(function(k, v) {
                if (v != null) v.direction = d;
            });
            this.repaint();
        };

        this.setArrowSize = function(w, h) {
            if (h == null) h = w;
            this.iterateArrowViews(function(k, v) {
                if (v != null) {
                    v.width  = w;
                    v.height = h;
                }
            });
            this.vrp();
        };

        this.setArrowColors = function(pressedColor, overColor, outColor) {
            var views = this.view.views;
            if (views.out != null) views.out.color  = outColor;
            if (views.over.color != null) views.over.color = overColor;
            if (views["pressed.over"] != null) views["pressed.over"].color = pressedColor;
            this.repaint();
        };

        this.iterateArrowViews = function(callback) {
            var views = this.view.views;
            for(var k in views) {
                if (views.hasOwnProperty(k)) {
                    callback.call(this, k, views[k]);
                }
            }
        };
    },

    function(direction) {
        this._ = new Listeners();
        this.cursorType = Cursor.HAND;

        if (arguments.length > 0) {
            this.direction = direction;
        }

        this.setView({
            "out"          : new this.clazz.ArrowView(this.direction, "black"),
            "over"         : new this.clazz.ArrowView(this.direction, "red"),
            "pressed.over" : new this.clazz.ArrowView(this.direction, "black"),
            "disabled"     : new this.clazz.ArrowView(this.direction, "lightGray")
        });
        this.$super();
        this.syncState(this.state, this.state);
    }
]);


/**
 *  Button UI component. Button is composite component whose look and feel can
 *  be easily customized:

        // create image button
        var button = new zebkit.ui.Button(new zebkit.ui.ImagePan("icon1.gif"));

        // create image + caption button
        var button = new zebkit.ui.Button(new zebkit.ui.ImageLabel("Caption", "icon1.gif"));

        // create multilines caption button
        var button = new zebkit.ui.Button(new zebkit.ui.MLabel("Line1\nLine2"));


 *  @class  zebkit.ui.Button
 *  @constructor
 *  @param {String|zebkit.ui.Panel|zebkit.ui.View} [t] a button label.
 *  The label can be a simple text or an UI component.
 *  @extends zebkit.ui.CompositeEvStatePan
 */

/**
 * Fired when a button has been pressed

        var b = new zebkit.ui.Button("Test");
        b.bind(function (src) {
            ...
        });

 * Button can be adjusted in respect how it generates the pressed event. Event can be
 * triggered by pressed or clicked even. Also event can be generated periodically if
 * the button is kept in pressed state.
 * @event buttonPressed
 * @param {zebkit.ui.Button} src a button that has been pressed
 */
pkg.Button = Class(pkg.CompositeEvStatePan, pkg.ButtonRepeatMix, [
    function $clazz() {
        this.Label = Class(pkg.Label, []);

        this.ViewPan = Class(pkg.ViewPan, [
            function $prototype() {
                this.parentStateUpdated = function(o, n, id) {
                    if (instanceOf(this.view, pkg.ViewSet)) {
                        this.activate(id);
                    }
                };
            },

            function(v) {
                this.$super();
                this.setView(v);
            }
        ]);
    },

    function $prototype() {
        this.canHaveFocus = true;
    },

    function(t) {
        this._ = new Listeners();
        if (zebkit.isString(t)) t = new this.clazz.Label(t);
        else {
            if (t instanceof Image) {
                t = new pkg.ImagePan(t);
            }
            else {
                if (t != null && instanceOf(t, pkg.Panel) === false) {
                    t = new this.clazz.ViewPan(t);
                }
            }
        }
        this.$super();
        if (t != null) {
            this.add(t);
            this.setFocusAnchorComponent(t);
        }
    }
]);

/**
 *  Border panel UI component class. The component renders titled border around the
 *  given  content UI component. Border title can be placed on top or
 *  bottom border line and aligned horizontally (left, center, right). Every
 *  zebkit UI component can be used as a border title element.
 *  @param {zebkit.ui.Panel|String} [title] a border panel title. Can be a
 *  string or any other UI component can be used as the border panel title
 *  @param {zebkit.ui.Panel} [content] a content UI component of the border
 *  panel
 *  @param {Integer} [constraints] a title constraints. The constraints gives
 *  a possibility to place border panel title in different places. Generally
 *  the title can be placed on the top or bottom part of the border panel.
 *  Also the title can be aligned horizontally.

         // create border panel with a title located at the
         // top and aligned at the canter
         var bp = new zebkit.ui.BorderPan("Title",
                                         new zebkit.ui.Panel(),
                                         "top", "center");


 *  @constructor
 *  @class zebkit.ui.BorderPan
 *  @extends {zebkit.ui.Panel}
 */
pkg.BorderPan = Class(pkg.Panel, [
    function $clazz() {
        this.Label = Class(pkg.Label, []);
    },

    function $prototype() {
        /**
         * Vertical gap. Define top and bottom paddings between
         * border panel border and the border panel content
         * @attribute vGap
         * @type {Integer}
         * @readOnly
         * @default 0
         */

         /**
          * Horizontal gap. Define left and right paddings between
          * border panel border and the border panel content
          * @attribute hGap
          * @type {Integer}
          * @readOnly
          * @default 0
          */
        this.vGap = this.hGap = 2;

         /**
          * Border panel label indent
          * @type {Integer}
          * @attribute indent
          * @default 4
          */
        this.indent = 4;


        this.orient = "top";

        this.alignment = "left";


         /**
          * Get the border panel title info. The information
          * describes a rectangular area the title occupies, the
          * title location and alignment
          * @return {Object} a title info
          *
          *  {
          *      x: {Integer}, y: {Integer},
          *      width: {Integer}, height: {Integer},
          *      orient: {Integer}
          *  }
          *
          * @method getTitleInfo
          * @protected
          */
        this.getTitleInfo = function() {
            return (this.label != null) ? { x      : this.label.x,
                                            y      : this.label.y,
                                            width  : this.label.width,
                                            height : this.label.height,
                                            orient: this.orient }
                                        : null;
        };

        this.calcPreferredSize = function(target){
            var ps = this.content != null && this.content.isVisible === true ? this.content.getPreferredSize()
                                                                             : { width:0, height:0 };
            if (this.label != null && this.label.isVisible === true){
                var lps = this.label.getPreferredSize();
                ps.height += lps.height;
                ps.width = Math.max(ps.width, lps.width + this.indent);
            }
            ps.width  += (this.hGap * 2);
            ps.height += (this.vGap * 2);
            return ps;
        };

        this.doLayout = function (target){
            var h = 0,
                right  = this.getRight(),
                left   = this.getLeft(),
                top    = this.orient === "top"   ? this.top    : this.getTop(),
                bottom = this.orient === "bottom"? this.bottom : this.getBottom();

            if (this.label != null && this.label.isVisible === true){
                var ps = this.label.getPreferredSize();
                h = ps.height;
                this.label.setBounds((this.alignment === "left") ? left + this.indent
                                                                  : ((this.alignment === "right") ? this.width - right - ps.width - this.indent
                                                                                                   : Math.floor((this.width - ps.width) / 2)),
                                     (this.orient === "bottom") ? (this.height - bottom - ps.height) : top,
                                     ps.width, h);
            }

            if (this.content != null && this.content.isVisible === true){
                this.content.setBounds(left + this.hGap,
                                       (this.orient === "bottom" ? top : top + h) + this.vGap,
                                        this.width  - right - left - 2 * this.hGap,
                                        this.height - top - bottom - h - 2 * this.vGap);
            }
        };

        /**
         * Set vertical and horizontal paddings between the
         * border panel border and the content of the border
         * panel
         * @param {Integer} vg a top and bottom paddings
         * @param {Integer} hg a left and right paddings
         * @method setGaps
         * @chainable
         */
        this.setGaps = function(vg, hg){
            if (this.vGap != vg || hg != this.hGap){
                this.vGap = vg;
                this.hGap = hg;
                this.vrp();
            }
            return this;
        };

        this.setOrientation = function(o) {
            if (this.orient !== o) {
                this.orient = o;
                this.vrp();
            }
        };

        this.setAlignment = function(a) {
            if (this.alignment !== a) {
                this.alignment = a;
                this.vrp();
            }
        };
    },

    function(title, center, o, a){
        if (zebkit.isString(title)) {
            title = new this.clazz.Label(title);
        }

        if (arguments.lengh > 2) {
            this.orient = o;
        }

        if (arguments.lengh > 3) {
            this.alignment = a;
        }

        /**
         * Border panel label component
         * @attribute label
         * @type {zebkit.ui.Panel}
         * @readOnly
         */

        /**
         * Border panel label content component
         * @attribute content
         * @type {zebkit.ui.Panel}
         * @readOnly
         */
        this.label = this.content = null;

        this.$super();
        if (title  != null) this.add("caption", title);
        if (center != null) this.add("center", center);
    },

    function setBorder(br) {
        br = pkg.$view(br);
        if (instanceOf(br, pkg.TitledBorder) === false) {
            br = new pkg.TitledBorder(br, "center");
        }
        return this.$super(br);
    },

    function kidAdded(index,ctr,lw) {
        this.$super(index, ctr, lw);
        if ((ctr == null && this.content == null) || "center" === ctr) {
            this.content = lw;
        }
        else if (this.label == null) {
            this.label = lw;
        }
    },

    function kidRemoved(index,lw){
        this.$super(index, lw);
        if (lw === this.label) {
            this.label = null;
        }
        else if (this.content === lw) {
            this.content = null;
        }
    }
]);

/**
 * The standard UI checkbox component switch manager implementation. The manager holds
 * boolean state of a checkbox UI component. There are few ways how a checkbox can
 * switch its state: standard checkbox or radio group. In general we have a deal with
 * one switchable UI component that can work in different modes. Thus we can re-use
 * one UI, but customize it with appropriate switch manager. That is the main idea of
 * having the class.
 * @constructor
 * @class  zebkit.ui.SwitchManager
 */

/**
 * Fired when a state has been updated

        var ch = new zebkit.ui.Checkbox("Test");
        ch.manager.bind(function (src, ui) {
            ...
        });

 * @event stateUpdated
 * @param {zebkit.ui.SwitchManager} src a switch manager that controls and tracks the event
 * @param {zebkit.ui.Checkbox} ui  an UI component that triggers the event
 */
pkg.SwitchManager = Class([
    function $prototype() {
        /**
         * Get current state of the given UI component
         * @param  {zebkit.ui.Checkbox} o an ui component
         * @return {Boolean}  a boolean state
         * @method getValue
         */
        this.getValue = function(o) { return this.state; };

        /**
         * Set the state for the given UI component
         * @param  {zebkit.ui.Checkbox} o an ui component
         * @param  {Boolean} b  a boolean state
         * @method setValue
         */
        this.setValue = function(o,b) {
            if (this.getValue(o) != b){
                this.state = b;
                this.updated(o, b);
            }
        };

        /**
         * Called every time a state has been updated.
         * @param  {zebkit.ui.Checkbox} o an ui component for which the state has been updated
         * @param  {Boolean} b  a new boolean state of the UI component
         * @method stateUpdated
         */
        this.updated = function(o, b){
            if (o != null) o.switched(b);
            this._.fired(this, o);
        };

        /**
         * Call when the manager has been installed for the given UI component
         * @protected
         * @param  {zebkit.ui.Checkbox} o an UI component the switch manager is designated
         * @method install
         */
        this.install = function(o) {
            o.switched(this.getValue(o));
        };

        /**
         * Call when the manager has been uninstalled for the given UI component
         * @protected
         * @param  {zebkit.ui.Checkbox} o an UI component the switch manager is not anymore used
         * @method uninstall
         */
        this.uninstall = function(o) {};

        this[''] = function() {
            this.state = false;
            this._ = new Listeners();
        };
    }
]);

/**
 * Radio group switch manager implementation. This is an extension of "zebkit.ui.SwicthManager" to
 * support radio group switching behavior. You can use it event with normal checkbox:

       // create group of check boxes that will work as a radio group
       var gr = new zebkit.ui.Group();
       var ch1 = new zebkit.ui.Checkbox("Test 1", gr);
       var ch2 = new zebkit.ui.Checkbox("Test 2", gr);
       var ch3 = new zebkit.ui.Checkbox("Test 3", gr);

 * @class  zebkit.ui.Group
 * @constructor
 * @extends zebkit.ui.SwitchManager
 */
pkg.Group = Class(pkg.SwitchManager, [
    function (){
        this.$super();
        this.state = null;
    },

    function $prototype() {
        this.getValue = function(o) {
            return o === this.state;
        };

        this.setValue = function(o, b){
            if (this.getValue(o) != b){
                this.clearSelected();
                this.state = o;
                this.updated(o, true);
            }
        };

        this.clearSelected = function() {
            if (this.state != null){
                var old = this.state;
                this.state = null;
                this.updated(old, false);
            }
        };
    }
]);

/**
 * Check-box UI component. The component is a container that
 * consists from two other UI components:

    - Box component to keep checker indicator
    - Label component to paint label

 * Developers are free to customize the component as they want.
 * There is no limitation regarding how the box and label components
 * have to be laid out, which UI components have to be used as
 * the box or label components, etc. The check box extends state
 * panel component and re-map states  to own views IDs:

    - "on.out" - checked and pointer cursor is out
    - "off.out" - un-checked and pointer cursor is out
    - "don" - disabled and checked,
    - "doff" - disabled and un-checked ,
    - "on.over" - checked and pointer cursor is over
    - "off.over" - un-checked and pointer cursor is out

 *
 * Customize is quite similar to what explained for zebkit.ui.EvStatePan:
 *

        // create checkbox component
        var ch = new zebkit.ui.Checkbox("Checkbox");

        // change border when the component checked to green
        // otherwise set it to red
        ch.setBorder(new zebkit.ui.ViewSet({
            "off.*": new zebkit.ui.Border("red"),
            "on.*": new zebkit.ui.Border("green")
        }));

        // customize checker box children UI component to show
        // green for checked and red for un-cheked states
        ch.kids[0].setView(new zebkit.ui.ViewSet({
            "off.*": "red",
            "on.*": "green"
        }));
        // sync current state with new look and feel
        ch.syncState();

 * Listening checked event should be done by registering a
 * listener in the check box switch manager as follow:

        // create checkbox component
        var ch = new zebkit.ui.Checkbox("Checkbox");

        // register a checkbox listener
        ch.manager.bind(function(sm) {
            var s = sm.getValue();
            ...
        });

 * @class  zebkit.ui.Checkbox
 * @extends zebkit.ui.CompositeEvStatePan
 * @constructor
 * @param {String|zebkit.ui.Panel} [label] a label
 * @param {zebkit.ui.SwitchManager} [m] a switch manager
 */
pkg.Checkbox = Class(pkg.CompositeEvStatePan, [
    function $clazz() {
        /**
         * The box UI component class that is used by default with
         * the check box component.
         * @constructor
         * @class zebkit.ui.Checkbox.Box
         * @extends zebkit.ui.ViewPan
         */
        this.Box = Class(pkg.StatePan, [
            function $prototype() {
                this.parentStateUpdated = function (o, n, id) {
                    this.setState(id);
                };
            }
        ]);

        /**
         * @for zebkit.ui.Checkbox
         */
        this.Label = Class(pkg.Label, []);
    },

    function $prototype() {
        /**
         * Set the check box state
         * @param  {Boolean} b a state
         * @chainable
         * @method setValue
         */
        this.setValue = function(b) {
            this.manager.setValue(this, b);
            return this;
        };

        /**
         * Get the check box state
         * @return {Boolean} a check box state
         * @method getValue
         */
        this.getValue = function() {
            return this.manager ? this.manager.getValue(this) : false;
        };

        /**
         * Callback method that is called whenever a state of switch
         * manager has been updated.
         * @param  {Boolean} b a new state
         * @method switched
         */
        this.switched = function(b){
            this.stateUpdated(this.state, this.state);
        };

        /**
         * Map the specified state into its symbolic name.
         * @protected
         * @param  {Integer} state a state
         * @return {String} a symbolic name of the state
         * @method toViewId
         */
        this.toViewId = function(state){
            if (this.isEnabled === true) {
                if (this.getValue()) {
                    return (this.state === OVER) ? "on.over" : "on.out";
                }
                return (this.state === OVER) ? "off.over" : "off.out";
            }
            return this.getValue() ? "don" : "doff";
        };
    },

    function (c, m) {
        if (m == null) m = new pkg.SwitchManager();

        if (zebkit.isString(c)) {
            c = new this.clazz.Label(c);
        }

        this.$super();

        /**
         * Reference to box component
         * @attribute box
         * @type {zebkit.ui.Panel}
         * @readOnly
         */
        this.box = new this.clazz.Box();
        this.add(this.box);

        if (c != null) {
            this.add(c);
            this.setFocusAnchorComponent(c);
        }

        this.setSwitchManager(m);
    },

    function keyPressed(e){
        if (instanceOf(this.manager, pkg.Group) && this.getValue()){
            var code = e.code, d = 0;
            if (code === KE.LEFT || code === KE.UP) d = -1;
            else {
                if (code === KE.RIGHT || code === KE.DOWN) d = 1;
            }

            if (d !== 0) {
                var p = this.parent, idx = p.indexOf(this);
                for(var i = idx + d;i < p.kids.length && i >= 0; i += d){
                    var l = p.kids[i];
                    if (l.isVisible === true &&
                        l.isEnabled === true &&
                        instanceOf(l, pkg.Checkbox) &&
                        l.manager === this.manager      )
                    {
                        l.requestFocus();
                        l.setValue(true);
                        break;
                    }
                }
                return ;
            }
        }
        this.$super(e);
    },

    /**
     * Set the specified switch manager
     * @param {zebkit.ui.SwicthManager} m a switch manager
     * @method setSwicthManager
     */
    function setSwitchManager(m){
        /**
         * A switch manager
         * @attribute manager
         * @readOnly
         * @type {zebkit.ui.SwitchManager}
         */

        if (m == null) {
            throw new Error("Null switch manager");
        }

        if (this.manager != m) {
            if (this.manager != null) this.manager.uninstall(this);
            this.manager = m;
            this.manager.install(this);
        }
    },

    function stateUpdated(o, n) {
        if (o === PRESSED_OVER && n === OVER) {
            this.setValue(!this.getValue());
        }
        this.$super(o, n);
    },

    function kidRemoved(index,c) {
        if (this.box === c) {
            this.box = null;
        }
        this.$super(index,c);
    }
]);

/**
 * Radio-box UI component class. This class is extension of "zebkit.ui.Checkbox" class that sets group
 * as a default switch manager. The other functionality id identical to checkbox component. Generally
 * speaking this class is a shortcut for radio box creation.
 * @class  zebkit.ui.Radiobox
 * @constructor
 * @param {String|zebkit.ui.Panel} [label] a label
 * @param {zebkit.ui.Group} [m] a switch manager
 */
pkg.Radiobox = Class(pkg.Checkbox, [
    function $clazz() {
        this.Box   = Class(pkg.Checkbox.Box, []);
        this.Label = Class(pkg.Checkbox.Label, []);
    },

    function(c, group) {
        this.$super(c,  group == null ? new pkg.Group() : group);
    }
]);

/**
 * Splitter panel UI component class. The component splits its area horizontally or vertically into two areas.
 * Every area hosts an UI component. A size of the parts can be controlled by pointer cursor dragging. Gripper
 * element is children UI component that can be customized. For instance:

      // create split panel
      var sp = new zebkit.ui.SplitPan(new zebkit.ui.Label("Left panel"),
                                    new zebkit.ui.Label("Right panel"));

      // customize gripper background color depending on its state
      sp.gripper.setBackground(new zebkit.ui.ViewSet({
           "over" : "yellow"
           "out" : null,
           "pressed.over" : "red"
      }));


 * @param {zebkit.ui.Panel} [first] a first UI component in splitter panel
 * @param {zebkit.ui.Panel} [second] a second UI component in splitter panel
 * @param {String} [o] an orientation of splitter element: "vertical" or "horizontal"
 * @class zebkit.ui.SplitPan
 * @constructor
 * @extends {zebkit.ui.Panel}
 */
pkg.SplitPan = Class(pkg.Panel, [
    function $clazz() {
        this.Bar = Class(pkg.EvStatePan, [
            function $prototype() {
                this.pointerDragged = function(e){
                    var x = this.x + e.x, y = this.y + e.y;
                    if (this.target.orient === "vertical"){
                        if (this.prevLoc != x){
                            x = this.target.normalizeBarLoc(x);
                            if (x > 0){
                                this.prevLoc = x;
                                this.target.setGripperLoc(x);
                            }
                        }
                    }
                    else {
                        if (this.prevLoc != y) {
                            y = this.target.normalizeBarLoc(y);
                            if (y > 0){
                                this.prevLoc = y;
                                this.target.setGripperLoc(y);
                            }
                        }
                    }
                };

                this.pointerDragStarted = function (e){
                    var x = this.x + e.x, y = this.y + e.y;
                    if (e.isAction()) {
                        if (this.target.orient === "vertical"){
                            x = this.target.normalizeBarLoc(x);
                            if (x > 0) this.prevLoc = x;
                        }
                        else {
                            y = this.target.normalizeBarLoc(y);
                            if (y > 0) this.prevLoc = y;
                        }
                    }
                };

                this.pointerDragEnded = function(e){
                    var xy = this.target.normalizeBarLoc(this.target.orient === "vertical" ? this.x + e.x
                                                                                           : this.y + e.y);
                    if (xy > 0) this.target.setGripperLoc(xy);
                };

                this.getCursorType = function(t, x, y) {
                    return (this.target.orient === "vertical" ? Cursor.W_RESIZE
                                                              : Cursor.N_RESIZE);
                };
            },

            function(target) {
                this.prevLoc = 0;
                this.target = target;
                this.$super();
            }
        ]);
    },

    function $prototype() {
        /**
         * A minimal size of the left (or top) sizable panel
         * @attribute leftMinSize
         * @type {Integer}
         * @readOnly
         * @default 50
         */

        /**
         * A minimal size of right (or bottom) sizable panel
         * @attribute rightMinSize
         * @type {Integer}
         * @readOnly
         * @default 50
         */

        /**
         * Indicates if the splitter bar can be moved
         * @attribute isMoveable
         * @type {Boolean}
         * @readOnly
         * @default true
         */

        /**
         * A gap between gripper element and first and second UI components
         * @attribute gap
         * @type {Integer}
         * @readOnly
         * @default 1
         */

        /**
         * A reference to gripper UI component
         * @attribute gripper
         * @type {zebkit.ui.Panel}
         * @readOnly
         */

        /**
         * A reference to left (top) sizable UI component
         * @attribute leftComp
         * @type {zebkit.ui.Panel}
         * @readOnly
         */

        /**
         * A reference to right (bottom) sizable UI component
         * @attribute rightComp
         * @type {zebkit.ui.Panel}
         * @readOnly
         */

        this.leftMinSize = this.rightMinSize = 50;
        this.isMoveable = true;
        this.gap = 1;
        this.orient = "vertical";

        this.normalizeBarLoc = function(xy){
            if (xy < this.minXY) xy = this.minXY;
            else {
                if (xy > this.maxXY) xy = this.maxXY;
            }
            return (xy > this.maxXY || xy < this.minXY) ?  -1 : xy;
        };

        this.setOrientation = function(o) {
            if (o !== this.orient) {
                this.orient = o;
                this.vrp();
            }
        };

        /**
         * Set gripper element location
         * @param  {Integer} l a location of the gripper element
         * @method setGripperLoc
         */
        this.setGripperLoc = function(l){
            if (l != this.barLocation){
                this.barLocation = l;
                this.vrp();
            }
        };

        this.calcPreferredSize = function(c){
            var fSize = pkg.$getPS(this.leftComp),
                sSize = pkg.$getPS(this.rightComp),
                bSize = pkg.$getPS(this.gripper);

            if (this.orient === "horizontal"){
                bSize.width = Math.max(((fSize.width > sSize.width) ? fSize.width : sSize.width), bSize.width);
                bSize.height = fSize.height + sSize.height + bSize.height + 2 * this.gap;
            }
            else {
                bSize.width = fSize.width + sSize.width + bSize.width + 2 * this.gap;
                bSize.height = Math.max(((fSize.height > sSize.height) ? fSize.height : sSize.height), bSize.height);
            }
            return bSize;
        };

        this.doLayout = function(target){
            var right  = this.getRight(),
                top    = this.getTop(),
                bottom = this.getBottom(),
                left   = this.getLeft(),
                bSize  = pkg.$getPS(this.gripper);

            if (this.orient === "horizontal"){
                var w = this.width - left - right;
                if (this.barLocation < top) this.barLocation = top;
                else {
                    if (this.barLocation > this.height - bottom - bSize.height) {
                        this.barLocation = this.height - bottom - bSize.height;
                    }
                }

                if (this.gripper != null){
                    if (this.isMoveable){
                        this.gripper.setBounds(left, this.barLocation, w, bSize.height);
                    }
                    else {
                        this.gripper.toPreferredSize();
                        this.gripper.setLocation(Math.floor((w - bSize.width) / 2), this.barLocation);
                    }
                }
                if (this.leftComp != null){
                    this.leftComp.setBounds(left, top, w, this.barLocation - this.gap - top);
                }
                if (this.rightComp != null){
                    this.rightComp.setLocation(left, this.barLocation + bSize.height + this.gap);
                    this.rightComp.setSize(w, this.height - this.rightComp.y - bottom);
                }
            }
            else {
                var h = this.height - top - bottom;
                if (this.barLocation < left) this.barLocation = left;
                else {
                    if (this.barLocation > this.width - right - bSize.width) {
                        this.barLocation = this.width - right - bSize.width;
                    }
                }

                if (this.gripper != null){
                    if(this.isMoveable === true){
                        this.gripper.setBounds(this.barLocation, top, bSize.width, h);
                    }
                    else{
                        this.gripper.setBounds(this.barLocation, Math.floor((h - bSize.height) / 2),
                                               bSize.width, bSize.height);
                    }
                }

                if (this.leftComp != null){
                    this.leftComp.setBounds(left, top, this.barLocation - left - this.gap, h);
                }

                if (this.rightComp != null){
                    this.rightComp.setLocation(this.barLocation + bSize.width + this.gap, top);
                    this.rightComp.setSize(this.width - this.rightComp.x - right, h);
                }
            }
        };

        /**
         * Set gap between gripper element and sizable panels
         * @param  {Integer} g a gap
         * @method setGap
         */
        this.setGap = function (g){
            if (this.gap != g){
                this.gap = g;
                this.vrp();
            }
        };

        /**
         * Set the minimal size of the left (or top) sizeable panel
         * @param  {Integer} m  a minimal possible size
         * @method setLeftMinSize
         */
        this.setLeftMinSize = function (m){
            if (this.leftMinSize != m){
                this.leftMinSize = m;
                this.vrp();
            }
        };

        /**
         * Set the minimal size of the right (or bottom) sizeable panel
         * @param  {Integer} m  a minimal possible size
         * @method setRightMinSize
         */
        this.setRightMinSize = function(m){
            if (this.rightMinSize != m){
                this.rightMinSize = m;
                this.vrp();
            }
        };

        /**
         * Set the given gripper movable state
         * @param  {Boolean} b the gripper movable state.
         * @method setGripperMovable
         */
        this.setGripperMovable = function (b){
            if (b != this.isMoveable){
                this.isMoveable = b;
                this.vrp();
            }
        };
    },

    function kidAdded(index,ctr,c){
        this.$super(index, ctr, c);

        if ((ctr == null && this.leftComp == null) || "left" === ctr) {
            this.leftComp = c;
        }
        else {
            if ((ctr == null && this.rightComp == null) || "right" === ctr) {
                this.rightComp = c;
            }
            else {
                if ("center" === ctr) this.gripper = c;
                else throw new Error("" + ctr);
            }
        }
    },

    function kidRemoved(index,c){
        this.$super(index, c);
        if (c === this.leftComp) this.leftComp = null;
        else {
            if (c === this.rightComp) {
                this.rightComp = null;
            }
            else {
                if (c === this.gripper) this.gripper = null;
            }
        }
    },

    function resized(pw,ph) {
        var ps = this.gripper.getPreferredSize();
        if (this.orient === "vertical"){
            this.minXY = this.getLeft() + this.gap + this.leftMinSize;
            this.maxXY = this.width - this.gap - this.rightMinSize - ps.width - this.getRight();
        }
        else {
            this.minXY = this.getTop() + this.gap + this.leftMinSize;
            this.maxXY = this.height - this.gap - this.rightMinSize - ps.height - this.getBottom();
        }
        this.$super(pw, ph);
    },

    function (f,s,o){
        if (arguments.length > 2) {
            this.orient = o;
        }

        this.minXY = this.maxXY = 0;
        this.barLocation = 70;
        this.leftComp = this.rightComp = this.gripper = null;

        this.$super();

        if (f != null) this.add("left", f);
        if (s != null) this.add("right", s);
        this.add("center", new this.clazz.Bar(this));
    }
]);

/**
 * Progress bar UI component class.                                                                                                                                                                                                                           y -= (bundleSize + this.gap   [description]
 * @class zebkit.ui.Progress
 * @constructor
 * @extends {zebkit.ui.Panel}
 */

/**
 * Fired when a progress bar value has been updated

        progress.bind(function(src, oldValue) {
            ...
        });

 *  @event fired
 *  @param {zebkit.ui.Progress} src a progress bar that triggers
 *  the event
 *  @param {Integer} oldValue a progress bar previous value
 */

pkg.Progress = Class(pkg.Panel, [
    function $prototype() {
        /**
         * Gap between bundle elements
         * @default 2
         * @attribute gap
         * @type {Integer}
         * @readOnly
         */
        this.gap = 2;

        /**
         * Progress bar orientation
         * @default "horizontal"
         * @attribute orient
         * @type {String}
         * @readOnly
         */
        this.orient = "horizontal";

        this.paint = function(g){
            var left = this.getLeft(), right = this.getRight(),
                top = this.getTop(), bottom = this.getBottom(),
                rs = (this.orient === "horizontal") ? this.width - left - right
                                                    : this.height - top - bottom,
                bundleSize = (this.orient === "horizontal") ? this.bundleWidth
                                                            : this.bundleHeight;

            if (rs >= bundleSize){
                var vLoc = Math.floor((rs * this.value) / this.maxValue),
                    x = left, y = this.height - bottom, bundle = this.bundleView,
                    wh = this.orient === "horizontal" ? this.height - top - bottom
                                                          : this.width - left - right;

                while(x < (vLoc + left) && this.height - vLoc - bottom < y){
                    if(this.orient === "horizontal"){
                        bundle.paint(g, x, top, bundleSize, wh, this);
                        x += (bundleSize + this.gap);
                    }
                    else{
                        bundle.paint(g, left, y - bundleSize, wh, bundleSize, this);
                        y -= (bundleSize + this.gap);
                    }
                }

                if (this.titleView != null){
                    var ps = this.bundleView.getPreferredSize();
                    this.titleView.paint(g, Math.floor((this.width  - ps.width ) / 2),
                                            Math.floor((this.height - ps.height) / 2),
                                            ps.width, ps.height, this);
                }
            }
        };

        this.calcPreferredSize = function(l){
            var bundleSize = (this.orient === "horizontal") ? this.bundleWidth
                                                                 : this.bundleHeight,
                v1 = (this.maxValue * bundleSize) + (this.maxValue - 1) * this.gap,
                ps = this.bundleView.getPreferredSize();

            ps = (this.orient === "horizontal") ? {
                                                         width :v1,
                                                         height:(this.bundleHeight >= 0 ? this.bundleHeight
                                                                                       : ps.height)
                                                       }
                                                     : {
                                                        width:(this.bundleWidth >= 0 ? this.bundleWidth
                                                                                     : ps.width),
                                                        height: v1
                                                      };
            if (this.titleView != null) {
                var tp = this.titleView.getPreferredSize();
                ps.width  = Math.max(ps.width, tp.width);
                ps.height = Math.max(ps.height, tp.height);
            }
            return ps;
        };
    },

    function () {
        /**
         * Progress bar value
         * @attribute value
         * @type {Integer}
         * @readOnly
         */
        this.value = 0;
        this.setBundleView("darkBlue");

        /**
         * Progress bar bundle width
         * @attribute bundleWidth
         * @type {Integer}
         * @readOnly
         * @default 6
         */

        /**
         * Progress bar bundle height
         * @attribute bundleHeight
         * @type {Integer}
         * @readOnly
         * @default 6
         */

        this.bundleWidth = this.bundleHeight = 6;

        /**
         * Progress bar maximal value
         * @attribute maxValue
         * @type {Integer}
         * @readOnly
         * @default 20
         */
        this.maxValue = 20;
        this._ = new Listeners();
        this.$super();
    },

    /**
     * Set the progress bar orientation
     * @param {String} o an orientation: "vertical" or "horizontal"
     * @method setOrientation
     */
    function setOrientation(o){
        if (o !== "horizontal" && o !== "vertical") {
            throw new Error("" + o);
        }
        if (o != this.orient){
            this.orient = o;
            this.vrp();
        }
    },

    /**
     * Set maximal integer value the progress bar value can rich
     * @param {Integer} m a maximal value the progress bar value can rich
     * @method setMaxValue
     */
    function setMaxValue(m){
        if (m != this.maxValue) {
            this.maxValue = m;
            this.setValue(this.value);
            this.vrp();
        }
    },

    /**
     * Set the current progress bar value
     * @param {Integer} p a progress bar
     * @method setValue
     */
    function setValue(p){
        p = p % (this.maxValue + 1);
        if (this.value != p){
            var old = this.value;
            this.value = p;
            this._.fired(this, old);
            this.repaint();
        }
    },

    /**
     * Set the given gap between progress bar bundle elements
     * @param {Integer} g a gap
     * @method setGap
     */
    function setGap(g){
        if (this.gap != g){
            this.gap = g;
            this.vrp();
        }
    },

    /**
     * Set the progress bar bundle element view
     * @param {zebkit.ui.View} v a progress bar bundle view
     * @method setBundleView
     */
    function setBundleView(v){
        if (this.bundleView != v){
            this.bundleView = pkg.$view(v);
            this.vrp();
        }
    },

    /**
     * Set the progress bar bundle element size
     * @param {Integer} w a bundle element width
     * @param {Integer} h a bundle element height
     * @method setBundleSize
     */
    function setBundleSize(w, h){
        if (w != this.bundleWidth && h != this.bundleHeight){
            this.bundleWidth  = w;
            this.bundleHeight = h;
            this.vrp();
        }
    }
]);

/**
 * UI link component class.
 * @class zebkit.ui.Link
 * @param {String} s a link text
 * @constructor
 * @extends zebkit.ui.Button
 */
pkg.Link = Class(pkg.Button, [
    function $prototype() {
        this.cursorType = Cursor.HAND;

        /**
         * Set link font
         * @param {zebkit.ui.Font} f a font
         * @method setFont
         */
        this.setFont = function(f) {
            if (this.view.setFont(f) === true) {
                this.vrp();
            }
        };

        /**
         * Set the link text color for the specified link state
         * @param {String} state a link state
         * @param {String} c a link text color
         * @method  setColor
         */
        this.setColor = function(state,c){
            if (this.colors[state] != c){
                this.colors[state] = c;
                this.syncState();
            }
        };

        this.setColors = function(colors) {
            this.colors = zebkit.clone(colors);
            this.syncState();
        };

        this.setValue = function(s) {
            this.view.setValue(s.toString());
            this.repaint();
        };
    },

    function stateUpdated(o,n){
        this.$super(o, n);

        var k = this.toViewId(n);
        if (this.view != null && this.view.color != this.colors[k] && this.colors[k] != null) {
            this.view.setColor(this.colors[k]);
            if (this.overDecoration != null &&  this.isEnabled === true) {
                if (n === OVER) {
                    this.view.setDecoration(this.overDecoration, this.colors[k]);
                }
            }
            this.repaint();
        }

        if (n !== OVER && this.overDecoration != null && this.view.decorations[this.overDecoration] != null) {
            this.view.setDecoration(this.overDecoration, null);
            this.repaint();
        }
    },

    function(s){
        // do it before super
        this.view = new pkg.DecoratedTextRender(s);
        this.colors = [ "gray" ];
        this.overDecoration = "underline";
        this.$super(null);
        this.stateUpdated(this.state, this.state);
    }
]);

/**
 * Extendable  UI panel class. Implement collapsible panel where
 * a user can hide of show content by pressing special control
 * element:

        // create extendable panel that contains list as its content
        var ext = zebkit.ui.ExtendablePan("Title", new zebkit.ui.List([
            "Item 1",
            "Item 2",
            "Item 3"
        ]));


 * @constructor
 * @class zebkit.ui.ExtendablePan
 * @extends {zebkit.ui.Panel}
 * @param {zebkit.ui.Panel|String} l a title label text or
 * @param {zebkit.ui.Panel} c a content of the extender panel
 * component
 */

 /**
  * Fired when extender is collapsed or extended

         var ex = new zebkit.ui.ExtendablePan("Title", pan);
         ex.bind(function (src, isCollapsed) {
             ...
         });

  * @event fired
  * @param {zebkit.ui.ExtendablePan} src an extender UI component that generates the event
  * @param {Boolean} isCollapsed a state of the extender UI component
  */

pkg.ExtendablePan = Class(pkg.Panel, [
    function $prototype() {
        /**
         * Toogle on or off the extender panel
         * @method toggle
         */
        this.toggle = function(){
            this.isCollapsed = this.isCollapsed ? false : true;
            this.contentPan.setVisible(!this.isCollapsed);
            this.togglePan.setState(this.isCollapsed ? "off" : "on");
            this.repaint();

            if (this._ != null) {
                this._.fired(this, this.isCollapsed);
            }
        };
    },

    function $clazz() {
        this.Label = Class(pkg.Label,[]);
        this.TitlePan = Class(pkg.Panel, []);

        this.TogglePan = Class(pkg.StatePan, [
            function $prototype() {
                this.pointerPressed = function(e){
                    if (e.isAction()) {
                        this.parent.parent.toggle();
                    }
                };

                this.cursorType = Cursor.HAND;
            }
        ]);
    },

    function (lab, content){
        /**
         * Indicate if the extender panel is collapsed
         * @type {Boolean}
         * @attribute isCollapsed
         * @readOnly
         * @default false
         */
        this.isCollapsed = true;

        this.$super();

        /**
         * Label component
         * @attribute label
         * @type {zebkit.ui.Panel}
         * @readOnly
         */
        if (lab == null) lab = "";
        this.label = zebkit.isString(lab) ? new this.clazz.Label(lab) : lab;

        /**
         * Title panel
         * @type {zebkit.ui.Panel}
         * @attribute titlePan
         * @readOnly
         */
        this.titlePan = new this.clazz.TitlePan();
        this.add("top", this.titlePan);

        /**
         * Toggle panel
         * @type {zebkit.ui.Panel}
         * @attribute togglePan
         * @readOnly
         */
        this.togglePan = new this.clazz.TogglePan();
        this.titlePan.add(this.togglePan);
        this.titlePan.add(this.label);

        /**
         * Content panel
         * @type {zebkit.ui.Panel}
         * @readOnly
         * @attribute contentPan
         */
        this.contentPan = content;
        this.contentPan.setVisible(!this.isCollapsed);
        this.add("center", this.contentPan);

        this.toggle();

        this._ = new Listeners();
    }
]);

/**
 * Scroll manager class.
 * @param {zebkit.ui.Panel} t a target component to be scrolled
 * @constructor
 * @class zebkit.ui.ScrollManager
 */

 /**
  * Fired when a target component has been scrolled

        scrollManager.bind(function(px, py) {
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
pkg.ScrollManager = Class([
    function $clazz() {
        this.Listeners = zebkit.util.ListenersClass("scrolled");
    },

    function $prototype() {
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

            if (psx != x || psy != y){
                this.sx = x;
                this.sy = y;
                if (this.scrollStateUpdated != null) this.scrollStateUpdated(x, y, psx, psy);
                if (this.target.catchScrolled != null) this.target.catchScrolled(psx, psy);
                this._.scrolled(psx, psy);
            }
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
         */
        this.makeVisible = function(x,y,w,h){
            var p = pkg.calcOrigin(x, y, w, h, this.getSX(), this.getSY(), this.target);
            this.scrollTo(p[0], p[1]);
        };
    },

    function (c){
        this.sx = this.sy = 0;
        this._  = new this.clazz.Listeners();

        /**
         * Target UI component for that the scroll manager has been instantiated
         * @attribute target
         * @type {zebkit.ui.Panel}
         * @readOnly
         */
        this.target = c;
    }
]);

/**
 * Scroll bar UI component
 * @param {String} [t] orintation of the scroll bar components:

        "vertical" - vertical scroll bar
        "horizontal"- horizontal scroll bar

 * @class zebkit.ui.Scroll
 * @constructor
 * @extends {zebkit.ui.Panel}
 */
pkg.Scroll = Class(pkg.Panel, zebkit.util.Position.Metric, [
    function $clazz() {
        this.isDragable = true;

        var SB = Class(pkg.ArrowButton, [
            function $prototype() {
                this.isFireByPress  = true;
                this.firePeriod     = 20;
            }
        ]);

        this.VIncButton = Class(SB, []);
        this.VDecButton = Class(SB, []);
        this.HIncButton = Class(SB, []);
        this.HDecButton = Class(SB, []);

        this.VBundle = Class(pkg.Panel, []);
        this.HBundle = Class(pkg.Panel, []);

        this.MIN_BUNDLE_SIZE = 16;
    },

    function $prototype() {
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
            return (bn != null &&
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
                                             L.isAncestorOf(this.bundle, child));
        };

        this.posChanged = function(target,po,pl,pc){
            if (this.bundle != null) {
                if (this.orient === "horizontal") {
                    this.bundle.setLocation(this.value2pixel(), this.getTop());
                }
                else {
                    this.bundle.setLocation(this.getLeft(), this.value2pixel());
                }
            }
        };

        this.getLines     = function (){ return this.max; };
        this.getLineSize  = function (line){ return 1; };
        this.getMaxOffset = function (){ return this.max; };

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
            if (Number.MAX_VALUE != this.startDragLoc) {
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
                    if (e.y < (this.bundle != null ? this.bundle.y : Math.floor(this.height / 2))) d =  -d;
                }
                else {
                    if (e.x < (this.bundle != null ? this.bundle.x : Math.floor(this.width / 2))) d =  -d;
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
            }
            else {
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
                minbs  = pkg.Scroll.MIN_BUNDLE_SIZE;

            this.decBt.setBounds(left, top, b ? ps1.width
                                              : ew,
                                            b ? eh
                                              : ps1.height);


            this.incBt.setBounds(b ? this.width - right - ps2.width : left,
                                 b ? top : this.height - bottom - ps2.height,
                                 b ? ps2.width : ew,
                                 b ? eh : ps2.height);

            if (this.bundle != null && this.bundle.isVisible === true){
                var am = this.amount();
                if (am > minbs) {
                    var bsize = Math.max(Math.min(Math.floor((this.extra * am) / this.max), am - minbs), minbs);
                    this.bundle.setBounds(b ? this.value2pixel() : left,
                                          b ? top : this.value2pixel(),
                                          b ? bsize : ew,
                                          b ? eh : bsize);
                }
                else {
                    this.bundle.setSize(0, 0);
                }
            }
        };

        /**
         * Set the specified maximum value of the scroll bar component
         * @param {Integer} m a maximum value
         * @method setMaximum
         */
        this.setMaximum = function (m){
            if (m != this.max) {
                this.max = m;
                if (this.position.offset > this.max) {
                    this.position.setOffset(this.max);
                }
                this.vrp();
            }
        };

        /**
         * Set the scroll bar value.
         * @param {Integer} v a scroll bar value.
         * @method setValue
         */
        this.setValue = function(v){
            this.position.setOffset(v);
        };

        this.setPosition = function(p){
            if (p != this.position){
                if (this.position != null) this.position.unbind(this);
                this.position = p;
                if (this.position != null){
                    this.position.bind(this);
                    this.position.setMetric(this);
                    this.position.setOffset(0);
                }
            }
        };

        this.setExtraSize = function(e){
            if (e != this.extra){
                this.extra = e;
                this.vrp();
            }
        };
    },

    function(t) {
        if (arguments.length > 0) {
            if (t !== "vertical" && t !== "horizontal") {
                throw new Error("" + t + "(alignment)");
            }
            this.orient = t;
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

        this.incBt = this.decBt = this.bundle = this.position = null;
        this.bundleLoc = 0;
        this.startDragLoc = Number.MAX_VALUE;
        this.$super(this);

        var b = (this.orient === "vertical");
        this.add("center", b ? new pkg.Scroll.VBundle()    : new pkg.Scroll.HBundle());
        this.add("top"   , b ? new pkg.Scroll.VDecButton() : new pkg.Scroll.HDecButton());
        this.add("bottom", b ? new pkg.Scroll.VIncButton() : new pkg.Scroll.HIncButton());

        this.setPosition(new zebkit.util.SingleColPosition(this));
    },

    function kidAdded(index,ctr,lw){
        this.$super(index, ctr, lw);

        if ("center" === ctr) this.bundle = lw;
        else {
            if ("bottom" === ctr) {
                this.incBt = lw;
                this.incBt.bind(this);
            }
            else {
                if ("top" === ctr) {
                    this.decBt = lw;
                    this.decBt.bind(this);
                }
                else throw new Error("Invalid constraints : " + ctr);
            }
        }
    },

    function kidRemoved(index,lw){
        this.$super(index, lw);
        if (lw === this.bundle) this.bundle = null;
        else {
            if(lw === this.incBt){
                this.incBt.unbind(this);
                this.incBt = null;
            }
            else {
                if(lw === this.decBt){
                    this.decBt.unbind(this);
                    this.decBt = null;
                }
            }
        }
    }
]);

/**
 * Scroll UI panel. The component is used to manage scrolling
 * for a children UI component that occupies more space than
 * it is available. The usage is very simple, just put an component
 * you want to scroll horizontally or/and vertically in the scroll
 * panel:

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
    function $clazz() {
        this.ContentPanLayout = Class(L.Layout, [
            function $prototype() {
                this.calcPreferredSize = function(t) {
                    return t.kids[0].getPreferredSize();
                };

                this.doLayout = function(t) {
                    var kid = t.kids[0];
                    if (kid.constraints === "stretch") {
                        var ps = kid.getPreferredSize(),
                            w  = t.parent.hBar != null ? ps.width : t.width,
                            h  = t.parent.vBar != null ? ps.height : t.height;
                        kid.setSize(w, h);
                    }
                    else {
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
         */
        this.setAutoHide = function(b) {
            if (this.autoHide != b) {
                this.autoHide = b;
                if (this.hBar != null) {
                    if (this.hBar.incBt != null) this.hBar.incBt.setVisible(!b);
                    if (this.hBar.decBt != null) this.hBar.decBt.setVisible(!b);
                }

                if (this.vBar != null) {
                    if (this.vBar.incBt != null) this.vBar.incBt.setVisible(!b);
                    if (this.vBar.decBt != null) this.vBar.decBt.setVisible(!b);
                }

                if (this.$interval !== 0) {
                    clearInterval(this.$interval);
                    $this.$interval = 0;
                }

                this.vrp();
            }
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
            var b = false;

            if (dy !== 0 && this.vBar != null && this.vBar.isVisible === true) {
                var v =  this.vBar.position.offset + dy;
                if (v >= 0) this.vBar.position.setOffset(v);
                else        this.vBar.position.setOffset(0);
                b = true;
            }

            if (dx !== 0 && this.hBar != null && this.hBar.isVisible === true) {
                var v =  this.hBar.position.offset + dx;
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
            try {
                this.validate();
                this.$isPosChangedLocked = true;

                if (this.hBar != null) {
                    this.hBar.position.setOffset( -this.scrollObj.scrollManager.getSX());
                }

                if (this.vBar != null) {
                    this.vBar.position.setOffset( -this.scrollObj.scrollManager.getSY());
                }

                if (this.scrollObj.scrollManager == null) this.invalidate();

                this.$isPosChangedLocked = false;
            }
            catch(e) { this.$isPosChangedLocked = false; throw e; }
        };

        this.calcPreferredSize = function (target){
            return pkg.$getPS(this.scrollObj);
        };

        this.doLayout = function (target){
            var sman   = (this.scrollObj == null) ? null : this.scrollObj.scrollManager,
                right  = this.getRight(),
                top    = this.getTop(),
                bottom = this.getBottom(),
                left   = this.getLeft(),
                ww     = this.width  - left - right,  maxH = ww,
                hh     = this.height - top  - bottom, maxV = hh,
                so     = this.scrollObj.getPreferredSize(),
                vps    = this.vBar == null ? { width:0, height:0 } : this.vBar.getPreferredSize(),
                hps    = this.hBar == null ? { width:0, height:0 } : this.hBar.getPreferredSize();

            // compensate scrolled vertical size by reduction of horizontal bar height if necessary
            // autoHidded scrollbars don't have an influence to layout
            if (this.hBar != null && this.autoHide === false &&
                  (so.width  > ww ||
                  (so.height > hh && so.width > (ww - vps.width))))
            {
                maxV -= hps.height;
            }
            maxV = so.height > maxV ? (so.height - maxV) :  -1;

            // compensate scrolled horizontal size by reduction of vertical bar width if necessary
            // autoHidded scrollbars don't have an influence to layout
            if (this.vBar != null && this.autoHide === false &&
                  (so.height > hh ||
                  (so.width > ww && so.height > (hh - hps.height))))
            {
                maxH -= vps.width;
            }
            maxH = so.width > maxH ? (so.width - maxH) :  -1;

            var sy = sman.getSY(), sx = sman.getSX();
            if (this.vBar != null) {
                if (maxV < 0) {
                    if (this.vBar.isVisible === true){
                        this.vBar.setVisible(false);
                        sman.scrollTo(sx, 0);
                        this.vBar.position.setOffset(0);
                    }
                    sy = 0;
                }
                else {
                    this.vBar.setVisible(true);
                }
            }

            if (this.hBar != null){
                if (maxH < 0){
                    if (this.hBar.isVisible === true){
                        this.hBar.setVisible(false);
                        sman.scrollTo(0, sy);
                        this.hBar.position.setOffset(0);
                    }
                }
                else this.hBar.setVisible(true);
            }

            if (this.scrollObj.isVisible === true){
                this.scrollObj.setBounds(left, top,
                                         ww - (this.autoHide === false && this.vBar != null && this.vBar.isVisible === true ? vps.width  : 0),
                                         hh - (this.autoHide === false && this.hBar != null && this.hBar.isVisible === true ? hps.height : 0));
            }

            if (this.$interval === 0 && this.autoHide) {
                hps.height = vps.width = 0;
            }

            if (this.hBar != null && this.hBar.isVisible === true){
                this.hBar.setBounds(left, this.height - bottom - hps.height,
                                    ww - (this.vBar != null && this.vBar.isVisible === true ? vps.width : 0),
                                    hps.height);
                this.hBar.setMaximum(maxH);
            }

            if (this.vBar != null && this.vBar.isVisible === true){
                this.vBar.setBounds(this.width - right - vps.width, top,
                                    vps.width,
                                    hh -  (this.hBar != null && this.hBar.isVisible === true ? hps.height : 0));
                this.vBar.setMaximum(maxV);
            }
        };

        this.posChanged = function (target,prevOffset,prevLine,prevCol){
            if (this.$isPosChangedLocked === false) {

                //  show if necessary hidden scroll bar(s)
                if (this.autoHide === true) {
                    // make sure autohide thread has not been initiated and make sure it makes sense
                    // to initiate the thread (one of the scroll bar has to be visible)
                    if (this.$interval === 0 && ((this.vBar != null && this.vBar.isVisible === true) ||
                                                 (this.hBar != null && this.hBar.isVisible === true)    ))
                    {
                        var $this = this;

                        // show scroll bar(s)
                        if (this.vBar != null) this.vBar.toFront();
                        if (this.hBar != null) this.hBar.toFront();
                        this.vrp();

                        // pointer move should keep scroll bars visible and pointer entered exited
                        // events have to be caught to track if pointer cursor is on a scroll
                        // bar. add temporary listeners
                        $this.$hiddingCounter = 2;
                        $this.$targetBar      = null;
                        var listener = pkg.events.bind({
                            pointerMoved: function(e) {
                                $this.$hiddingCounter = 1;
                            },

                            pointerExited: function(e) {
                                $this.$targetBar = null;
                            },

                            pointerEntered: function(e) {
                                if (e.source == $this.vBar) {
                                    $this.$targetBar = $this.vBar;
                                }
                                else {
                                    if (e.source == $this.hBar) {
                                        $this.$targetBar = $this.hBar;
                                        return;
                                    }

                                    $this.$targetBar = null;
                                }
                            }
                        });

                        // start thread to autohide shown scroll bar(s)
                        this.$interval = setInterval(function() {
                            if ($this.$hiddingCounter-- === 0 && $this.$targetBar == null) {
                                clearInterval($this.$interval);
                                $this.$interval = 0;
                                pkg.events.unbind(listener);
                                $this.doLayout();
                            }
                        }, 500);
                    }
                }

                if (this.vBar != null && this.vBar.position === target) {
                    this.scrollObj.scrollManager.scrollYTo(-this.vBar.position.offset);
                }
                else {
                    if (this.hBar != null && this.hBar.position === target) {
                        this.scrollObj.scrollManager.scrollXTo(-this.hBar.position.offset);
                    }
                }
            }
        };

        this.setIncrements = function (hUnit,hPage,vUnit,vPage) {
            if (this.hBar != null){
                if (hUnit !=  -1) this.hBar.unitIncrement = hUnit;
                if (hPage !=  -1) this.hBar.pageIncrement = hPage;
            }

            if (this.vBar != null){
                if (vUnit !=  -1) this.vBar.unitIncrement = vUnit;
                if (vPage !=  -1) this.vBar.pageIncrement = vPage;
            }
        };
    },

    function (c, scrolls, autoHide) {
        if (scrolls == null)  {
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

        this.hBar = this.vBar = this.scrollObj = null;
        this.$isPosChangedLocked = false;
        this.$super();

        if (arguments.length < 2 || scrolls === "both" || scrolls === "horizontal") {
            this.add("bottom", new pkg.Scroll("horizontal"));
        }

        if (arguments.length < 2 || scrolls === "both" || scrolls === "vertical") {
            this.add("right", new pkg.Scroll("vertical"));
        }

        if (c != null) {
            this.add("center", c);
        }

        if (arguments.length > 2) {
            this.setAutoHide(autoHide);
        }
    },

    function insert(i,ctr,c) {
        if ("center" === ctr) {
            if (c.scrollManager == null) {
                c = new this.clazz.ContentPan(c);
            }

            this.scrollObj = c;
            c.scrollManager.bind(this);
        }
        else {
            if ("bottom" === ctr || "top" === ctr){
                this.hBar = c;
            }
            else {
                if ("left" === ctr || "right" === ctr) {
                    this.vBar = c;
                }
                else  {
                    throw new Error("Invalid constraints");
                }
            }

            // valid for scroll bar only
            if (c.incBt != null) c.incBt.setVisible(!this.autoHide);
            if (c.decBt != null) c.decBt.setVisible(!this.autoHide);
            c.position.bind(this);
        }

        return this.$super(i, ctr, c);
    },

    function kidRemoved(index, comp){
        this.$super(index, comp);
        if (comp === this.scrollObj){
            this.scrollObj.scrollManager.unbind(this);
            this.scrollObj = null;
        }
        else {
            if (comp === this.hBar){
                this.hBar.position.unbind(this);
                this.hBar = null;
            }
            else {
                if (comp === this.vBar){
                    this.vBar.position.unbind(this);
                    this.vBar = null;
                }
            }
        }
    }
]);

/**
 * Tabs UI panel. The component is used to organize switching
 * between number of pages where every page is an UI component.
 *
 *  Filling tabs component with pages is the same to how you add
 *  an UI component to a panel. For instance in the example below
 *  three pages with "Titl1", "Title2", "Title3" are added:

      var tabs = new zebkit.ui.Tabs();
      tabs.add("Title1", new zebkit.ui.Label("Label as a page"));
      tabs.add("Title2", new zebkit.ui.Button("Button as a page"));
      tabs.add("Title3", new zebkit.ui.TextArea("Text area as a page"));

 *  You can access tabs pages UI component the same way like you
 *  access a panel children components

     ...
     tabs.kids[0] // access the first page

 *  And you can remove it with standard panel inherited API:

     ...
     tabs.removeAt(0); // remove first tab page


 *  To customize tab page caption and icon you should access tab object and
 *  do it with API it provides:


        // update a tab caption
        tabs.getTab(0).setCaption("Test");

        // update a tab icon
        tabs.getTab(0).setIcon("my.gif");

        // set a particular font and color for the tab in selected state
        tabs.getTab(0).setColor(true, "blue");
        tabs.getTab(0).setFont(true, new zebkit.ui.Font("Arial", "bold", 16));

        // set other caption for the tab in not selected state
        tabs.getTab(0).setCaption(false, "Test");

 * @param {Integer|String} [o] the tab panel orientation:

      "top"
      "bottom"
      "left"
      "right"

 * @class zebkit.ui.Tabs
 * @constructor
 * @extends {zebkit.ui.Panel}
 */

/**
 * Fired when a new tab page has been selected

      tabs.bind(function (src, selectedIndex) {
         ...
      });

 * @event selected
 * @param {zebkit.ui.Tabs} src a tabs component that triggers the event
 * @param {Integer} selectedIndex a tab page index that has been selected
 */
pkg.Tabs = Class(pkg.Panel, [
    function $clazz() {
        /**
         * Tab view class that defines the tab page title and icon
         * @param {String|Image} [icon]  an path to an image or image object
         * @param {String} [caption] a tab caption
         * @class zebkit.ui.Tabs.TabView
         * @extends {zebkit.ui.CompRender}
         * @constructor
         */
        this.TabView = Class(pkg.CompRender, [
            function $clazz() {
                this.TabPan = Class(pkg.Panel, [
                    function() {
                        this.$super();
                        this.add(new pkg.ImagePan(null));
                        this.add(new pkg.ViewPan());
                    },

                    function getImagePan() {
                        return this.kids[0];
                    },

                    function getViewPan() {
                        return this.kids[1];
                    }
                ]);
            },

            function(icon, caption) {
                if (arguments.length === 0) {
                    caption = "";
                }
                else {
                    if (arguments.length === 1) {
                        caption = icon;
                        icon = null;
                    }
                }

                var tp = new this.clazz.TabPan();
                this.$super(tp);
                this.owner = null;

                var $this = this;
                tp.getImagePan().imageLoaded = function(p, b, i) {
                    $this.vrp();

                    // if the icon has zero width and height the repaint
                    // doesn't trigger validation. So let's do it on
                    // parent level
                    if ($this.owner != null && $this.owner.parent != null) {
                        $this.owner.repaint();
                    }
                };

                var r1 = new this.clazz.captionRender(caption),
                    r2 = new this.clazz.captionRender(caption);

                r2.setColor(this.clazz.fontColor);
                r1.setColor(this.clazz.selectedFontColor);
                r2.setFont (this.clazz.font);
                r1.setFont (this.clazz.selectedFont);

                this.getCaptionPan().setView(
                    new pkg.ViewSet(
                        {
                            "selected": r1,
                            "*"       : r2
                        },
                        [
                            function setFont(id, f) {
                                var v = this.views[id];
                                if (v != null) {
                                    v.setFont(s);
                                    this.recalc();
                                }
                            },

                            function setCaption(id, s) {
                                var v = this.views[id];
                                if (v != null) {
                                    v.setValue(s);
                                    this.recalc();
                                }
                            },

                            function getCaption(id) {
                                var v = this.views[id];
                                return v == null ? null : v.getValue();
                            }
                        ]
                    )
                );

                this.setIcon(icon);
            },

            function ownerChanged(v) {
                this.owner = v;
            },

            function vrp() {
                if (this.owner != null) this.owner.vrp();
            },

            /**
             * Set the given tab caption for the specified tab or both - selected and not selected - states.
             * @param {Boolean} [b] the tab state. true means selected state.
             * @param {String} s the tab caption
             * @method setCaption
             */
            function setCaption(b, s) {
                if (arguments.length === 1) {
                    this.setCaption(true, b);
                    this.setCaption(false, b);
                }
                else {
                    this.getCaptionPan().view.setCaption(this.$toId(b), s);
                    this.vrp();
                }
            },

            /**
             * Get the tab caption for the specified tab state
             * @param {Boolean} b the tab state. true means selected state.
             * @return {String} the tab caption
             * @method getCaption
             */
            function getCaption(b) {
                return this.getCaptionPan().view.getCaption(this.$toId(b));
            },

            /**
             * Set the given tab caption text color for the specified tab or both
             * selected and not selected states.
             * @param {Boolean} [b] the tab state. true means selected state.
             * @param {String} c the tab caption
             * @method setColor
             */
            function setColor(b, c) {
                if (arguments.length === 1) {
                    this.setColor(true, b);
                    this.setColor(false, b);
                }
                else {
                    var v = this.getCaptionPan().view.views[this.$toId(b)];
                    if (v != null) {
                        v.setColor(c);
                        this.vrp();
                    }
                }
            },

            /**
             * Set the given tab caption text font for the specified or both
             * selected not slected states.
             * @param {Boolean} [b] the tab state. true means selected state.
             * @param {zebkit.ui.Font} f the tab text font
             * @method setFont
             */
            function setFont(b, f) {
                if (arguments.length === 1) {
                    this.setFont(true, b);
                    this.setFont(false, b);
                }
                else {
                    this.getCaptionPan().view.setFont(this.$toId(b), f);
                    this.vrp();
                }
            },

            function getCaptionPan() {
                return this.target.getViewPan();
            },

            /**
             * Set the tab icon.
             * @param {String|Image} c an icon path or image object
             * @method setIcon
             */
            function setIcon(c) {
                this.target.getImagePan().setImage(c);
                this.target.getImagePan().setVisible(c != null);
            },

            /**
             * The method is invoked every time the tab selection state has been updated
             * @param {zebkit.ui.Tabs} tabs the tabs component the tab belongs
             * @param {Integer} i an index of the tab
             * @param {Boolean} b a new state of the tab
             * @method selected
             */
            function selected(tabs, i, b) {
                this.getCaptionPan().view.activate(this.$toId(b));
            },

            function $toId(b) {
                return b ? "selected" : "*";
            }
        ]);
    },

    /**
     * @for zebkit.ui.Tabs
     */
    function $prototype() {
        /**
         * Declare can have focus attribute to make the component focusable
         * @type {Boolean}
         * @attribute canHaveFocus
         * @readOnly
         */
        this.canHaveFocus = true;

        /**
         * Define pointer moved event handler
         * @param  {zebkit.ui.PointerEvent} e a key event
         * @method pointerMoved
         */
        this.pointerMoved = function(e) {
            var i = this.getTabAt(e.x, e.y);
            if (this.overTab != i) {
                this.overTab = i;
                if (this.views.tabover != null) {
                    this.repaint(this.repaintX, this.repaintY,
                                 this.repaintWidth, this.repaintHeight);
                }
            }
        };

        /**
         * Define pointer drag ended event handler
         * @param  {zebkit.ui.PointerEvent} e a key event
         * @method pointerDragEnded
         */
        this.pointerDragEnded = function(e) {
            var i = this.getTabAt(e.x, e.y);
            if (this.overTab != i) {
                this.overTab = i;
                if (this.views.tabover != null) {
                    this.repaint(this.repaintX, this.repaintY,
                                 this.repaintWidth, this.repaintHeight);
                }
            }
        };

        /**
         * Define pointer exited event handler
         * @param  {zebkit.ui.PointerEvent} e a key event
         * @method pointerExited
         */
        this.pointerExited = function(e) {
            if (this.overTab >= 0) {
                this.overTab = -1;
                if (this.views.tabover != null) {
                    this.repaint(this.repaintX, this.repaintY,
                                 this.repaintWidth, this.repaintHeight);
                }
            }
        };

        /**
         * Navigate to a next tab page following the given direction starting
         * from the given page
         * @param  {Integer} page a starting page index
         * @param  {Integer} d a navigation direction. 1 means forward and -1 means backward
         * navigation.
         * @return {Integer}      a new tab page index
         * @method next
         */
        this.next =  function (page, d){
            for(; page >= 0 && page < Math.floor(this.pages.length / 2); page += d) {
                if (this.isTabEnabled(page) === true) return page;
            }
            return -1;
        };

        this.getTitleInfo = function(){
            var b   = (this.orient === "left" || this.orient === "right"),
                res = b ? { x      : this.tabAreaX,
                            y      : 0,
                            width  : this.tabAreaWidth,
                            height : 0,
                            orient : this.orient }
                        : { x      : 0,
                            y      : this.tabAreaY,
                            width  : 0,
                            height : this.tabAreaHeight,
                            orient : this.orient };

            if (this.selectedIndex >= 0){
                var r = this.getTabBounds(this.selectedIndex);
                if (b){
                    res.y = r.y;
                    res.height = r.height;
                }
                else{
                    res.x = r.x;
                    res.width = r.width;
                }
            }
            return res;
        };

        /**
         * Test if the given tab page is in enabled state
         * @param  {Integer} index a tab page index
         * @return {Boolean} a tab page state
         * @method isTabEnabled
         */
        this.isTabEnabled = function (index){
            return this.kids[index].isEnabled;
        };

        this.paintOnTop = function(g){
            var ts = g.$states[g.$curState];
            // stop painting if the tab area is outside of clip area
            if (zebkit.util.isIntersect(this.repaintX, this.repaintY,
                                       this.repaintWidth, this.repaintHeight,
                                       ts.x, ts.y, ts.width, ts.height))
            {
                if (this.selectedIndex > 0){
                    var r = this.getTabBounds(this.selectedIndex);
                }

                for(var i = 0;i < this.selectedIndex; i++) {
                    this.paintTab(g, i);
                }

                for(var i = this.selectedIndex + 1;i < Math.floor(this.pages.length / 2); i++) {
                    this.paintTab(g, i);
                }

                if (this.selectedIndex >= 0){
                    this.paintTab(g, this.selectedIndex);
                    if (this.hasFocus()) {
                        this.drawMarker(g, this.getTabBounds(this.selectedIndex));
                    }
                }
            }
        };

        /**
         * Draw currently activate tab page marker.
         * @param  {2DContext} g a graphical context
         * @param  {Object} r a tab page title rectangular area
         * @method drawMarker
         */
        this.drawMarker = function(g,r){
            var marker = this.views.marker;
            if (marker != null){
                //TODO: why only "tab" is checked ?
                var bv = this.views.tab;
                marker.paint(g, r.x + bv.getLeft(), r.y + bv.getTop(),
                                r.width - bv.getLeft() - bv.getRight(),
                                r.height - bv.getTop() - bv.getBottom(), this);
            }
        };

        /**
         * Paint the given tab page title
         * @param  {2DContext} g a graphical context
         * @param  {Integer} pageIndex a tab page index
         * @method paintTab
         */
        this.paintTab = function (g, pageIndex){
            var b       = this.getTabBounds(pageIndex),
                page    = this.kids[pageIndex],
                tab     = this.views.tab,
                tabover = this.views.tabover,
                tabon   = this.views.tabon,
                v       = this.pages[pageIndex * 2],
                ps      = v.getPreferredSize();

            if (this.selectedIndex === pageIndex && tabon != null) {
                tabon.paint(g, b.x, b.y, b.width, b.height, page);
            }
            else {
                tab.paint(g, b.x, b.y, b.width, b.height, page);
            }

            if (this.overTab >= 0 && this.overTab === pageIndex && tabover != null) {
                tabover.paint(g, b.x, b.y, b.width, b.height, page);
            }

            v.paint(g, b.x + Math.floor((b.width - ps.width) / 2),
                       b.y + Math.floor((b.height - ps.height) / 2),
                       ps.width, ps.height, page);
        };

        /**
         * Get the given tab page title rectangular bounds
         * @param  {Integer} i a tab page index
         * @return {Object} a tab page rectangular bounds
         *
         *    {x:{Integer}, y:{Integer}, width:{Integer}, height:{Integer}}
         *
         * @protected
         * @method getTabBounds
         */
        this.getTabBounds = function(i){
            return this.pages[2 * i + 1];
        };

        this.calcPreferredSize = function(target){
            var max = L.getMaxPreferredSize(target);
            if (this.orient === "bottom" || this.orient === "top"){
                max.width = Math.max(max.width, 2 * this.sideSpace + this.tabAreaWidth);
                max.height += this.tabAreaHeight + this.sideSpace;
            }
            else {
                max.width += this.tabAreaWidth + this.sideSpace;
                max.height = Math.max(max.height, 2 * this.sideSpace + this.tabAreaHeight);
            }
            return max;
        };

        this.doLayout = function(target){
            var right  = this.orient === "right"  ? this.right  : this.getRight(),
                top    = this.orient === "top"    ? this.top    : this.getTop(),
                bottom = this.orient === "bottom" ? this.bottom : this.getBottom(),
                left   = this.orient === "left"   ? this.left   : this.getLeft(),
                b      = (this.orient === "top" || this.orient === "bottom");

            if (b) {
                this.repaintX = this.tabAreaX = left ;
                this.repaintY = this.tabAreaY = (this.orient === "top") ? top : this.height - bottom - this.tabAreaHeight;
                if (this.orient === "bottom") {
                    this.repaintY -= (this.border != null ? this.border.getBottom() : 0);
                }
            }
            else {
                this.repaintX = this.tabAreaX = (this.orient === "left" ? left : this.width - right - this.tabAreaWidth);
                this.repaintY = this.tabAreaY = top ;
                if (this.orient === "right") {
                    this.repaintX -= (this.border != null ? this.border.getRight() : 0);
                }
            }

            var count = this.kids.length,
                sp    = 2 * this.sideSpace,
                xx    = (this.orient === "right"  ? this.tabAreaX : this.tabAreaX + this.sideSpace),
                yy    = (this.orient === "bottom" ? this.tabAreaY : this.tabAreaY + this.sideSpace);

            for(var i = 0;i < count; i++ ){
                var r = this.getTabBounds(i);

                r.x = xx;
                r.y = yy;

                if (b) {
                    xx += r.width;
                    if (i === this.selectedIndex) {
                        xx -= sp;
                        if (this.orient === "bottom") {
                            r.y -= (this.border != null ? this.border.getBottom() : 0);
                        }
                    }
                }
                else {
                    yy += r.height;
                    if (i === this.selectedIndex) {
                        yy -= sp;
                        if (this.orient === "right") {
                            r.x -= (this.border != null ? this.border.getRight() : 0);
                        }
                    }
                }
            }

            // make visible tab title
            if (this.selectedIndex >= 0){
                var r = this.getTabBounds(this.selectedIndex), dt = 0;
                if (b) {
                    r.x -= this.sideSpace;
                    r.y -= ((this.orient === "top") ? this.sideSpace : 0);
                    dt = (r.x < left) ? left - r.x
                                      : (r.x + r.width > this.width - right) ? this.width - right - r.x - r.width : 0;
                }
                else {
                    r.x -= (this.orient === "left") ? this.sideSpace : 0;
                    r.y -= this.sideSpace;
                    dt = (r.y < top) ? top - r.y
                                     : (r.y + r.height > this.height - bottom) ? this.height - bottom - r.y - r.height : 0;
                }

                for(var i = 0;i < count; i ++ ){
                    var br = this.getTabBounds(i);
                    if (b) br.x += dt;
                    else   br.y += dt;
                }
            }

            for(var i = 0;i < count; i++){
                var l = this.kids[i];
                if (i === this.selectedIndex) {
                    if (b) {
                        l.setBounds(left + this.hgap,
                                    ((this.orient === "top") ? top + this.repaintHeight : top) + this.vgap,
                                    this.width - left - right - 2 * this.hgap,
                                    this.height - this.repaintHeight - top - bottom - 2 * this.vgap);
                    }
                    else {
                        l.setBounds(((this.orient === "left") ? left + this.repaintWidth : left) + this.hgap,
                                    top + this.vgap,
                                    this.width - this.repaintWidth - left - right - 2 * this.hgap,
                                    this.height - top - bottom - 2 * this.vgap);
                    }
                }
                else {
                    l.setSize(0, 0);
                }
            }
        };

        /**
         * Define recalc method to compute the component metrical characteristics
         * @method recalc
         */
        this.recalc = function(){
            var count = Math.floor(this.pages.length / 2);
            if (count > 0) {
                this.tabAreaHeight = this.tabAreaWidth = 0;

                var bv   = this.views.tab,
                    b    = (this.orient === "left" || this.orient === "right"),
                    max  = 0,
                    hadd = bv.getLeft() + bv.getRight(),
                    vadd = bv.getTop()  + bv.getBottom();

                for(var i = 0;i < count; i++){
                    var ps =  this.pages[i * 2] != null ? this.pages[i * 2].getPreferredSize()
                                                        : { width:0, height:0},
                        r = this.getTabBounds(i);

                    if (b) {
                        r.height = ps.height + vadd;
                        if (ps.width + hadd > max) max = ps.width + hadd;
                        this.tabAreaHeight += r.height;
                    }
                    else {
                        r.width = ps.width + hadd;
                        if (ps.height + vadd > max) max = ps.height + vadd;
                        this.tabAreaWidth += r.width;
                    }
                }

                // align tabs widths or heights to have the same size
                for(var i = 0; i < count; i++ ){
                    var r = this.getTabBounds(i);
                    if (b) r.width  = max;
                    else   r.height = max;
                }

                if (b) {
                    this.tabAreaWidth   = max + this.sideSpace;
                    this.tabAreaHeight += (2 * this.sideSpace);
                    this.repaintHeight  = this.tabAreaHeight;
                    this.repaintWidth   = this.tabAreaWidth + (this.border != null ? (b === "left" ? this.border.getLeft()
                                                                                                   : this.border.getRight())
                                                                                   : 0);
                }
                else {
                    this.tabAreaWidth += (2 * this.sideSpace);
                    this.tabAreaHeight = this.sideSpace + max;
                    this.repaintWidth  = this.tabAreaWidth;
                    this.repaintHeight = this.tabAreaHeight + (this.border != null ? (b === "top" ? this.border.getTop()
                                                                                                  : this.border.getBottom())
                                                                                   : 0);
                }

                // make selected tab page title bigger
                if (this.selectedIndex >= 0) {
                    var r = this.getTabBounds(this.selectedIndex);
                    if (b) {
                        r.height += 2 * this.sideSpace;
                        r.width += this.sideSpace +  (this.border != null ? (b === "left" ? this.border.getLeft()
                                                                                          : this.border.getRight())
                                                                          : 0);
                    }
                    else {
                        r.height += this.sideSpace + (this.border != null ? (b === "top" ? this.border.getTop()
                                                                                         : this.border.getBottom())
                                                                          : 0);
                        r.width  += 2 * this.sideSpace;
                    }
                }
            }
        };

        /**
         * Get tab index located at the given location
         * @param  {Integer} x a x coordinate
         * @param  {Integer} y a y coordinate
         * @return {Integer} an index of the tab that is
         * detected at the given location. -1 if no any
         * tab can be found
         * @method getTabAt
         */
        this.getTabAt = function(x,y){
            this.validate();
            if (x >= this.tabAreaX && y >= this.tabAreaY &&
                x < this.tabAreaX + this.tabAreaWidth &&
                y < this.tabAreaY + this.tabAreaHeight)
            {
                // handle selected as a special case since it can overlap neighborhood titles
                if (this.selectedIndex >= 0) {
                    var tb = this.getTabBounds(this.selectedIndex);
                    if (x >= tb.x && y >= tb.y && x < tb.x + tb.width && y < tb.y + tb.height) {
                        return i;
                    }
                }

                for(var i = 0; i < Math.floor(this.pages.length / 2); i++) {
                    if (this.selectedIndex != i) {
                        var tb = this.getTabBounds(i);
                        if (x >= tb.x && y >= tb.y && x < tb.x + tb.width && y < tb.y + tb.height) {
                            return i;
                        }
                    }
                }
            }
            return -1;
        };

        /**
         * Define key pressed event handler
         * @param  {zebkit.ui.KeyEvent} e a key event
         * @method keyPressed
         */
        this.keyPressed = function(e){
            if (this.selectedIndex != -1 && this.pages.length > 0){
                switch(e.code) {
                    case KE.UP:
                    case KE.LEFT:
                        var nxt = this.next(this.selectedIndex - 1,  -1);
                        if(nxt >= 0) this.select(nxt);
                        break;
                    case KE.DOWN:
                    case KE.RIGHT:
                        var nxt = this.next(this.selectedIndex + 1, 1);
                        if(nxt >= 0) this.select(nxt);
                        break;
                }
            }
        };

        /**
         * Define pointer clicked  event handler
         * @param  {zebkit.ui.PointerEvent} e a key event
         * @method pointerClicked
         */
        this.pointerClicked = function(e){
            if (e.isAction()){
                var index = this.getTabAt(e.x, e.y);
                if (index >= 0 && this.isTabEnabled(index)) this.select(index);
            }
        };

        /**
         * Switch to the given tab page
         * @param  {Integer} index a tab page index to be navigated
         * @method select
         */
        this.select = function(index){
            if (this.selectedIndex != index){
                var prev = this.selectedIndex;
                this.selectedIndex = index;

                if (prev >= 0) {
                    this.pages[prev * 2].selected(this, prev, false);
                }

                if (index >= 0) {
                    this.pages[index * 2].selected(this, index, true);
                }

                this._.fired(this, this.selectedIndex);
                this.vrp();
            }
        };

        /**
         * Get the given tab. Using the tab you can control tab caption,
         * icon.
         * @param {Integer} pageIndex a tab page index
         * @return  {zebkit.ui.Tabs.TabView}
         * @method getTab
         */
        this.getTab = function(pageIndex){
            return this.pages[pageIndex * 2];
        };

        /**
         * Set tab side spaces.
         * @param {Integer} sideSpace  [description]
         * @method setSideSpace
         */
        this.setSideSpace = function(sideSpace){
            if (sideSpace != this.sideSpace) {
                this.sideSpace = sideSpace;
                this.vrp();
            }
        };

        this.setPageGaps = function (vg,hg){
            if (this.vgap != vg || hg != this.hgap){
                this.vgap = vg;
                this.hgap = hg;
                this.vrp();
            }
        };

        /**
         * Set the tab page element alignments
         * @param {String} o an alignment. The valid value is one of the following:
         * "left", "right", "top", "bottom"
         * @method  setAlignment
         */
        this.setAlignment = function(o){
            if (o !== "top" && o !== "bottom" && o !== "left" && o !== "right") {
                throw new Error("Invalid tabs alignment:" + o);
            }

            if (this.orient != o){
                this.orient = o;
                this.vrp();
            }
        };

        /**
         * Set enabled state for the given tab page
         * @param  {Integer} i a tab page index
         * @param  {Boolean} b a tab page enabled state
         * @method enableTab
         */
        this.enableTab = function(i,b){
            var c = this.kids[i];
            if (c.isEnabled != b){
                c.setEnabled(b);
                if (b === false && this.selectedIndex === i) {
                    this.select(-1);
                }
                this.repaint();
            }
        };

        /**
         *  Set number of views to render different Tab component elements
         *  @param {Object} a set of views as dictionary where key is a view
         *  name and the value is a view instance, string(for color), or render
         *  function. The following view elements can be passed:
         *
         *
         *      {
         *         "tab"    : <view to render not selected tab page>,
         *         "tabover": <view to render a tab page when pointer is over>
         *         "tabon"  : <a view to render selected tab page>
         *         "marker" : <a marker view to be rendered around tab page title>
         *      }
         *
         *
         *  @method  setViews
         */
    },

    function(o) {
        if (arguments.length === 0) {
            o = "top";
        }

        /**
         * Selected tab page index
         * @attribute selectedIndex
         * @type {Integer}
         * @readOnly
         */


        /**
         * Tab orientation
         * @attribute orient
         * @type {String}
         * @readOnly
         */

        /**
         * Sides gap
         * @attribute sideSpace
         * @type {Integer}
         * @readOnly
         * @default 1
         */

        this.vgap = this.hgap = this.tabAreaX = 0;
        this.repaintWidth = this.repaintHeight = this.repaintX = this.repaintY = 0;
        this.sideSpace = 1;

        this.tabAreaY = this.tabAreaWidth = this.tabAreaHeight = 0;
        this.overTab = this.selectedIndex = -1;
        this.orient = o;
        this._ = new Listeners();
        this.pages = [];
        this.views = {};

        if (pkg.Tabs.font != null) this.render.setFont(pkg.Tabs.font);
        if (pkg.Tabs.fontColor != null) this.render.setColor(pkg.Tabs.fontColor);

        this.$super();

        // since alignment pass as the constructor argument the setter has to be called after $super
        // because $super can re-set title alignment
        this.setAlignment(o);
    },

    function focused(){
        this.$super();
        if (this.selectedIndex >= 0){
            var r = this.getTabBounds(this.selectedIndex);
            this.repaint(r.x, r.y, r.width, r.height);
        }
        else {
            if (this.hasFocus() === false) {
                this.select(this.next(0, 1));
            }
        }
    },

    function kidAdded(index,constr,c) {
        // correct wrong selection if inserted tab index is less or equals
        if (this.selectedIndex >= 0 && index <= this.selectedIndex) {
            this.selectedIndex++;
        }

        if (this.selectedIndex < 0) {
            this.select(this.next(0, 1));
        }

        return this.$super(index,constr,c);
    },

    function insert(index,constr,c) {
        var render = null;
        if (instanceOf(constr, this.clazz.TabView)) {
            render = constr;
        }
        else {
            render = new this.clazz.TabView((constr == null ? "Page " + index
                                                             : constr ));
            render.ownerChanged(this); // TODO: a little bit ugly but setting an owner is required to
                                       // keep tabs component informed when an icon has been updated
        }

        this.pages.splice(index * 2, 0, render, { x:0, y:0, width:0, height:0 });
        return this.$super(index, constr, c);
    },

    function removeAt(i){
        if (this.selectedIndex >= 0 && i <= this.selectedIndex) {
            if (i === this.selectedIndex) this.select(-1);
            else {
                this.selectedIndex--;
                this.repaint();
            }
        }
        this.pages.splice(i * 2, 2);
        this.$super(i);
    },

    function removeAll(){
        this.select(-1);
        this.pages.splice(0, this.pages.length);
        this.pages.length = 0;
        this.$super();
    },

    function setSize(w,h){
        if (this.width != w || this.height != h){
            if (this.orient === "right" || this.orient === "bottom") {
                this.tabAreaX =  -1;
            }
            this.$super(w, h);
        }
    }
]);
pkg.Tabs.prototype.setViews = pkg.$ViewsSetter;

/**
 * Slider UI component class.
 * @class  zebkit.ui.Slider
 * @extends {zebkit.ui.Panel}
 */
pkg.Slider = Class(pkg.Panel, [
    function $prototype() {
        this.max = this.min = this.value = this.roughStep = this.exactStep = 0;
        this.netSize = this.gap = 3;
        this.correctDt = this.scaleStep = this.psW = this.psH = 0;
        this.intervals = this.pl = null;
        this.canHaveFocus = true;
        this.orient = "horizontal";

        /**
         * Get a value
         * @return {Integer} a value
         * @method getValue
         */
        this.getValue = function() {
            return this.value;
        };

        this.paintNums = function(g,loc){
            if (this.isShowTitle === true)
                for(var i = 0;i < this.pl.length; i++ ){
                    var render = this.provider.getView(this, this.getPointValue(i)),
                        d = render.getPreferredSize();

                    if (this.orient === "horizontal") {
                        render.paint(g, this.pl[i] - Math.floor(d.width / 2), loc, d.width, d.height, this);
                    }
                    else {
                        render.paint(g, loc, this.pl[i] - Math.floor(d.height / 2),  d.width, d.height, this);
                    }
                }
        };

        this.getScaleSize = function(){
            var bs = this.views.bundle.getPreferredSize();
            return (this.orient === "horizontal" ? this.width - this.getLeft() -
                                                  this.getRight() - bs.width
                                                : this.height - this.getTop() -
                                                  this.getBottom() - bs.height);
        };

        this.pointerDragged = function(e){
            if(this.dragged) {
                this.setValue(this.findNearest(e.x + (this.orient === "horizontal" ? this.correctDt : 0),
                                               e.y + (this.orient === "horizontal" ? 0 : this.correctDt)));
            }
        };

        this.paint = function(g){
            if (this.pl == null){
                this.pl = Array(this.intervals.length);
                for(var i = 0, l = this.min;i < this.pl.length; i ++ ){
                    l += this.intervals[i];
                    this.pl[i] = this.value2loc(l);
                }
            }

            var left   = this.getLeft(),
                top    = this.getTop(),
                right  = this.getRight(),
                bottom = this.getBottom(),
                bnv    = this.views.bundle,
                gauge  = this.views.gauge,
                bs     = bnv.getPreferredSize(),
                gs     = gauge.getPreferredSize(),
                w      = this.width - left - right - 2,
                h      = this.height - top - bottom - 2;

            if (this.orient === "horizontal"){
                var topY = top + Math.floor((h - this.psH) / 2) + 1, by = topY;
                if(this.isEnabled === true) {
                    gauge.paint(g, left + 1,
                                   topY + Math.floor((bs.height - gs.height) / 2),
                                   w, gs.height, this);
                }
                else{
                    g.setColor("gray");
                    g.strokeRect(left + 1, topY + Math.floor((bs.height - gs.height) / 2), w, gs.height);
                }

                topY += bs.height;
                if (this.isShowScale === true){
                    topY += this.gap;
                    g.setColor(this.isEnabled === true ? this.scaleColor : "gray");
                    g.beginPath();
                    for(var i = this.min;i <= this.max; i += this.scaleStep){
                        var xx = this.value2loc(i) + 0.5;
                        g.moveTo(xx, topY);
                        g.lineTo(xx, topY + this.netSize);
                    }

                    for(var i = 0;i < this.pl.length; i ++ ) {
                        g.moveTo(this.pl[i] + 0.5, topY);
                        g.lineTo(this.pl[i] + 0.5, topY + 2 * this.netSize);
                    }
                    g.stroke();
                    topY += (2 * this.netSize);
                }
                this.paintNums(g, topY);
                bnv.paint(g, this.getBundleLoc(this.value), by, bs.width, bs.height, this);
            }
            else {
                var leftX = left + Math.floor((w - this.psW) / 2) + 1, bx = leftX;
                if (this.isEnabled === true) {
                    gauge.paint(g, leftX + Math.floor((bs.width - gs.width) / 2),
                                   top + 1, gs.width, h, this);
                }
                else {
                    g.setColor("gray");
                    g.strokeRect(leftX + Math.floor((bs.width - gs.width) / 2),
                                 top + 1, gs.width, h);
                }

                leftX += bs.width;
                if (this.isShowScale === true) {
                    leftX += this.gap;
                    g.setColor(this.scaleColor);
                    g.beginPath();
                    for(var i = this.min;i <= this.max; i += this.scaleStep){
                        var yy = this.value2loc(i) + 0.5;
                        g.moveTo(leftX, yy);
                        g.lineTo(leftX + this.netSize, yy);
                    }

                    for(var i = 0;i < this.pl.length; i ++ ) {
                        g.moveTo(leftX, this.pl[i] + 0.5);
                        g.lineTo(leftX + 2 * this.netSize, this.pl[i] + 0.5);
                    }

                    g.stroke();
                    leftX += (2 * this.netSize);
                }

                this.paintNums(g, leftX);
                bnv.paint(g, bx, this.getBundleLoc(this.value), bs.width, bs.height, this);
            }

            if (this.hasFocus() && this.views.marker != null) {
                this.views.marker.paint(g, left, top, w + 2, h + 2, this);
            }
        };

        this.findNearest = function(x,y){
            var v = this.loc2value(this.orient === "horizontal" ? x : y);
            if (this.isIntervalMode){
                var nearest = Number.MAX_VALUE, res = 0;
                for(var i = 0;i < this.intervals.length; i ++ ){
                    var pv = this.getPointValue(i), dt = Math.abs(pv - v);
                    if(dt < nearest){
                        nearest = dt;
                        res = pv;
                    }
                }
                return res;
            }

            v = this.exactStep * Math.floor((v + v % this.exactStep) / this.exactStep);
            if (v > this.max) v = this.max;
            else {
                if(v < this.min) v = this.min;
            }
            return v;
        };

        this.value2loc = function (v){
            var ps = this.views.bundle.getPreferredSize(),
                l  = Math.floor((this.getScaleSize() * (v - this.min)) / (this.max - this.min));
            return  (this.orient === "vertical") ? this.height - Math.floor(ps.height/2) - this.getBottom() - l
                                                 : this.getLeft() + Math.floor(ps.width/2) + l;
        };

        this.loc2value = function(xy){
            var ps = this.views.bundle.getPreferredSize(),
                sl = (this.orient === "vertical") ? this.getLeft() + Math.floor(ps.width/2) : this.getTop() + Math.floor(ps.height/2),
                ss = this.getScaleSize();

            if (this.orient === "vertical") {
                xy = this.height - xy;
            }

            if (xy < sl) xy = sl;
            else {
                if (xy > sl + ss) xy = sl + ss;
            }

            return this.min + Math.floor(((this.max - this.min) * (xy - sl)) / ss);
        };

        this.nextValue = function(value,s,d){
            if (this.isIntervalMode) {
                return this.getNeighborPoint(value, d);
            }

            var v = value + (d * s);
            if(v > this.max) v = this.max;
            else {
                if (v < this.min) v = this.min;
            }

            return v;
        };

        this.getBundleLoc = function(v){
            var bs = this.views.bundle.getPreferredSize();
            return this.value2loc(v) - (this.orient === "horizontal" ? Math.floor(bs.width / 2)
                                                                     : Math.floor(bs.height / 2));
        };

        this.getBundleBounds = function (v){
            var bs = this.views.bundle.getPreferredSize();
            return this.orient === "horizontal"? {
                                                   x:this.getBundleLoc(v),
                                                   y:this.getTop() + Math.floor((this.height - this.getTop() - this.getBottom() - this.psH) / 2) + 1,
                                                   width:bs.width,
                                                   height:bs.height
                                                 }
                                               : {
                                                   x:this.getLeft() + Math.floor((this.width - this.getLeft() - this.getRight() - this.psW) / 2) + 1,
                                                   y:this.getBundleLoc(v),
                                                   width:bs.width,
                                                   height:bs.height
                                                 };
        };

        this.getNeighborPoint = function (v,d){
            var left  = this.min + this.intervals[0],
                right = this.getPointValue(this.intervals.length - 1);
            if (v < left) return left;
            else {
                if (v > right) return right;
            }

            if (d > 0) {
                var start = this.min;
                for(var i = 0;i < this.intervals.length; i ++ ){
                    start += this.intervals[i];
                    if(start > v) return start;
                }
                return right;
            }
            else {
                var start = right;
                for(var i = this.intervals.length - 1;i >= 0; i--) {
                    if (start < v) return start;
                    start -= this.intervals[i];
                }
                return left;
            }
        };

        this.calcPreferredSize = function(l) {
            return { width:this.psW + 2, height: this.psH + 2 };
        };

        this.recalc = function(){
            var ps = this.views.bundle.getPreferredSize(),
                ns = this.isShowScale ? (this.gap + 2 * this.netSize) : 0,
                dt = this.max - this.min, hMax = 0, wMax = 0;

            if (this.isShowTitle && this.intervals.length > 0){
                for(var i = 0;i < this.intervals.length; i ++ ){
                    var d = this.provider.getView(this, this.getPointValue(i)).getPreferredSize();
                    if (d.height > hMax) hMax = d.height;
                    if (d.width  > wMax) wMax = d.width;
                }
            }
            if (this.orient === "horizontal"){
                this.psW = dt * 2 + ps.width;
                this.psH = ps.height + ns + hMax;
            }
            else{
                this.psW = ps.width + ns + wMax;
                this.psH = dt * 2 + ps.height;
            }
        };

        this.setValue = function(v) {
            if (v < this.min || v > this.max) {
                throw new Error("Value is out of bounds: " + v);
            }

            var prev = this.value;
            if(this.value != v){
                this.value = v;
                this._.fired(this, prev);
                this.repaint();
            }
        };

        this.getPointValue = function (i){
            var v = this.min + this.intervals[0];
            for(var j = 0; j < i; j++, v += this.intervals[j]);
            return v;
        };

        this.keyPressed = function(e){
            var b = this.isIntervalMode;
            switch(e.code) {
                case KE.DOWN:
                case KE.LEFT:
                    var v = this.nextValue(this.value, this.exactStep,-1);
                    if (v >= this.min) this.setValue(v);
                    break;
                case KE.UP:
                case KE.RIGHT:
                    var v = this.nextValue(this.value, this.exactStep, 1);
                    if (v <= this.max) this.setValue(v);
                    break;
                case KE.HOME: this.setValue(b ? this.getPointValue(0) : this.min);break;
                case KE.END:  this.setValue(b ? this.getPointValue(this.intervals.length - 1)
                                            : this.max);
                              break;
            }
        };

        this.pointerPressed = function (e){
            if (e.isAction()){
                var x = e.x, y = e.y, bb = this.getBundleBounds(this.value);
                if (x < bb.x || y < bb.y || x >= bb.x + bb.width || y >= bb.y + bb.height) {
                    var l = ((this.orient === "horizontal") ? x : y), v = this.loc2value(l);
                    if (this.value != v) {
                        this.setValue(this.isJumpOnPress ? v
                                                         : this.nextValue(this.value,
                                                                          this.roughStep,
                                                                          v < this.value ? -1:1));
                    }
                }
            }
        };

        this.pointerDragStarted = function(e){
            var r = this.getBundleBounds(this.value);

            if (e.x >= r.x && e.y >= r.y &&
                e.x < r.x + r.width &&
                e.y < r.y + r.height)
            {
                this.dragged = true;
                this.correctDt = this.orient === "horizontal" ? r.x + Math.floor(r.width  / 2) - e.x
                                                              : r.y + Math.floor(r.height / 2) - e.y;
            }
        };

        this.pointerDragEnded = function(e) {
            this.dragged = false;
        };

        this.getView = function(d,o){
            this.render.setValue(o != null ? o.toString() : "");
            return this.render;
        };
    },

    function (o) {
        this._ = new Listeners();
        this.views = {};
        this.isShowScale = this.isShowTitle = true;
        this.dragged = this.isIntervalMode = false;
        this.render = new pkg.BoldTextRender("");
        this.render.setColor("gray");
        if (arguments.length > 0) {
            this.orient = o;
        }
        this.setValues(0, 20, [0, 5, 10], 2, 1);
        this.setScaleStep(1);

        this.$super();
        this.views.bundle = (o === "horizontal" ? this.views.hbundle : this.views.vbundle);

        this.provider = this;
    },

    function focused() {
        this.$super();
        this.repaint();
    },

    function setScaleGap(g){
        if (g != this.gap){
            this.gap = g;
            this.vrp();
        }
    },

    function setScaleColor(c){
        if (c != this.scaleColor) {
            this.scaleColor = c;
            if (this.provider === this) this.render.setColor(c);
            this.repaint();
        }
        return this;
    },

    function setScaleStep(s){
        if (s != this.scaleStep){
            this.scaleStep = s;
            this.repaint();
        }
    },

    function setShowScale(b){
        if (this.isShowScale != b){
            this.isShowScale = b;
            this.vrp();
        }
    },

    function setShowTitle(b){
        if (this.isShowTitle != b){
            this.isShowTitle = b;
            this.vrp();
        }
    },

    function setViewProvider(p){
        if (p != this.provider){
            this.provider = p;
            this.vrp();
        }
    },

    function setValues(min,max,intervals,roughStep,exactStep) {

        if (roughStep <= 0 || exactStep < 0 || min >= max ||
            min + roughStep > max || min + exactStep > max  )
        {
            throw new Error("[" + min + "," + max + "], " + roughStep + "," + exactStep);
        }

        for(var i = 0, start = min;i < intervals.length; i ++ ){
            start += intervals[i];
            if (start > max || intervals[i] < 0) throw new Error();
        }

        this.min = min;
        this.max = max;
        this.roughStep = roughStep;
        this.exactStep = exactStep;
        this.intervals = Array(intervals.length);

        for(var i=0; i<intervals.length; i++){
            this.intervals[i] = intervals[i];
        }

        if(this.value < min || this.value > max) {
            this.setValue(this.isIntervalMode ? min + intervals[0] : min);
        }
        this.vrp();
    },

    function invalidate(){
        this.pl = null;
        this.$super();
    }
]);
pkg.Slider.prototype.setViews = pkg.$ViewsSetter;

/**
 * Status bar UI component class
 * @class zebkit.ui.StatusBar
 * @param {Integer} [gap] a gap between status bar children elements
 * @extends {zebkit.ui.Panel}
 */
pkg.StatusBar = Class(pkg.Panel, [
    function (gap){
        if (arguments.length === 0) gap = 2;
        this.setPadding(gap, 0, 0, 0);
        this.$super(new L.PercentLayout("horizontal", gap));
    },

    /**
     * Set the specified border to be applied for status bar children components
     * @param {zebkit.ui.View} v a border
     * @method setBorderView
     */
    function setBorderView(v){
        if (v != this.borderView){
            this.borderView = v;
            for(var i = 0;i < this.kids.length; i++) {
                this.kids[i].setBorder(this.borderView);
            }
            this.repaint();
        }
    },

    function insert(i,s,d){
        d.setBorder(this.borderView);
        this.$super(i, s, d);
    }
]);

/**
 * Toolbar UI component. Handy way to place number of click able elements
 * @class zebkit.ui.Toolbar
 * @extends {zebkit.ui.Panel}
 */

/**
 * Fired when a toolbar element has been pressed

        var t = new zebkit.ui.Toolbar();

        // add three pressable icons
        t.addImage("icon1.jpg");
        t.addImage("icon2.jpg");
        t.addLine();
        t.addImage("ico3.jpg");

        // catch a toolbar icon has been pressed
        t.bind(function (src) {
            ...
        });

 * @event pressed
 * @param {zebkit.ui.Panel} src a toolbar element that has been pressed
 */
pkg.Toolbar = Class(pkg.Panel, [
    function $clazz() {
        this.ToolPan = Class(pkg.EvStatePan, [
            function(c) {
                this.$super(new L.BorderLayout());
                this.add("center", c);
            },

            function getContentComponent() {
                return this.kids[0];
            },

            function stateUpdated(o, n) {
                this.$super(o, n);
                if (o === PRESSED_OVER && n === OVER) {
                    this.parent._.fired(this);
                }
            }
        ]);

        this.ImagePan = Class(pkg.ImagePan, []);
        this.Line     = Class(pkg.Line, []);
        this.Checkbox = Class(pkg.Checkbox, []);
        this.Radiobox = Class(pkg.Radiobox, []);
    },

    function $prototype() {
        /**
         * Test if the given component is a decorative element
         * in the toolbar
         * @param  {zebkit.ui.Panel}  c a component
         * @return {Boolean} return true if the component is
         * decorative element of the toolbar
         * @method isDecorative
         * @protected
         */
        this.isDecorative = function(c){
            return instanceOf(c, pkg.EvStatePan) === false;
        };
    },

    function () {
        this._ = new Listeners();
        this.$super();
    },

    /**
     * Add a radio box as the toolbar element that belongs to the
     * given group and has the specified content component
     * @param {zebkit.ui.Group} g a radio group the radio box belongs
     * @param {zebkit.ui.Panel} c a content
     * @return {zebkit.ui.Panel} a component that has been added
     * @method addRadio
     */
    function addRadio(g,c) {
        var cbox = new this.clazz.Radiobox(c, g);
        cbox.setCanHaveFocus(false);
        return this.add(cbox);
    },

    /**
     * Add a check box as the toolbar element with the specified content
     * component
     * @param {zebkit.ui.Panel} c a content
     * @return {zebkit.ui.Panel} a component that has been added
     * @method addSwitcher
     */
    function addSwitcher(c){
        return this.add(new this.clazz.Checkbox(c));
    },

    /**
     * Add an image as the toolbar element
     * @param {String|Image} img an image or a path to the image
     * @return {zebkit.ui.Panel} a component that has been added
     * @method addImage
     */
    function addImage(img) {
        this.validateMetric();
        return this.add(new this.clazz.ImagePan(img));
    },

    /**
     * Add line to the toolbar component. Line is a decorative ]
     * element that logically splits toolbar elements. Line as any
     * other decorative element doesn't fire event
     * @return {zebkit.ui.Panel} a component that has been added
     * @method addLine
     */
    function addLine(){
        var line = new this.clazz.Line();
        line.constraints = "stretch";
        return this.addDecorative(line);
    },

    /**
     * Add the given component as decorative element of the toolbar.
     * Decorative elements don't fire event and cannot be pressed
     * @param {zebkit.ui.Panel} c a component
     * @return {zebkit.ui.Panel} a component that has been added
     * @method addDecorative
     */
    function addDecorative(c){
        return this.$super(this.insert, this.kids.length, null, c);
    },

    function insert(i,id,d){
        return this.$super(i, id, new this.clazz.ToolPan(d));
    }
]);

/**
 * Simple video panel that can be used to play a video:
 *

        // create canvas, add video panel to the center and
        // play video
        var canvas = zebkit.ui.zCanvas(500,500).root.properties({
            layout: new zebkit.layout.BorderLayout(),
            center: new zebkit.ui.VideoPan("trailer.mpg")
        });

 *
 * @param {String} url an URL to a video
 * @class zebkit.ui.VideoPan
 * @extends {zebkit.ui.Panel}
 * @constructor
 */
pkg.VideoPan = Class(pkg.Panel,  [
    function $prototype() {
        this.paint = function(g) {
            g.drawImage(this.video, 0, 0, this.width, this.height);
        };

        /**
         * Pause video
         * @method pause
         */
        this.pause = function() {
            if (this.isPlaying === true) {
                this.isPlaying = false;
                this.video.pause();
            }
        };

        /**
         * Start or continue playing video
         * @method play
         */
        this.play = function() {
            if (this.isPlaying === false) {
                this.isPlaying = true;
                this.video.play();

                var $this = this;
                zebkit.web.$task(function anim() {
                    if ($this.isReady === true) $this.repaint();
                    if ($this.isPlaying === true) zebkit.web.$task(anim);
                });
            }
        };

        /**
         * Called whenever a video playing has been finished
         * @method finished
         */
    },

    function(src) {
        this.isPlaying = false;
        this.isReady = false;

        var $this = this;

        /**
         * Original video DOM element that is created
         * to play video
         * @type {Video}
         * @readOnly
         * @attribute video
         */
        this.video = document.createElement("video");
        this.video.setAttribute("src", src);

        this.video.addEventListener("canplaythrough", function() {
            $this.isReady = true;
        }, false);

        this.video.addEventListener("ended", function() {
            $this.isPlaying = false;
            if ($this.finished != null) $this.finished();
        }, false);

        this.$super();
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
        this.sx = this.sy = 0;
        this.target = null;
        this.identifier = -1;

        /**
         * Define pointer drag started events handler.
         * @param  {zebkit.ui.PointerEvent} e a pointer event
         * @method pointerDragStarted
         */
        this.pointerDragStarted = function(e) {
            if (e.touchCounter === 1 && e.pointerType === "touch") {
                this.identifier = e.identifier;  // finger
                var owner = e.source;

                while(owner != null && owner.doScroll == null) {
                    owner = owner.parent;
                }

                if (owner != null && owner.pointerDragged == null) {
                    this.target = owner;
                    this.sx = e.x;
                    this.sy = e.y;
                }
            }
        };

        /**
         * Define pointer dragged events handler.
         * @param  {zebkit.ui.PointerEvent} e a pointer event
         * @method pointerDragged
         */
        this.pointerDragged = function(e) {
            if (e.touchCounter   === 1 &&
                this.target      != null &&
                this.identifier  === e.identifier)
            {
                var d = e.direction;
                if (d === "bottom" || d === "top") {
                    this.target.doScroll(0, this.sy - e.y, "touch");
                }
                else {
                    if (d === "left" || d === "right") {
                        this.target.doScroll(this.sx - e.x, 0, "touch");
                    }
                }

                this.sx = e.x;
                this.sy = e.y;
            }
        };

        /**
         * Define pointer drag ended events handler.
         * @param  {zebkit.ui.PointerEvent} e a pointer event
         * @method pointerDragEnded
         */
        this.pointerDragEnded = function(e) {
            if (this.target != null &&
                this.timer  == null &&
                this.identifier === e.identifier &&
                (e.direction === "bottom" || e.direction === "top") &&
                this.target.vBar != null &&
                this.target.vBar.isVisible === true &&
                e.dy !== 0)
            {
                this.$dt = 2 * e.dy;
                var $this = this, bar = this.target.vBar, k = 0;

                this.timer = setInterval(function() {
                    var o = bar.position.offset;

                    bar.position.setOffset(o - $this.$dt);
                    if (++k % 5 === 0) {
                        $this.$dt = Math.floor($this.$dt/2);
                    }

                    if (o === bar.position.offset || ($this.$dt >= -1  &&  $this.$dt <= 1)) {
                        clearInterval($this.timer);
                        $this.timer = $this.target = null;
                    }
                }, 10);
            }
        };

        /**
         * Define pointer pressed events handler.
         * @param  {zebkit.ui.PointerEvent} e a pointer event
         * @method pointerPressed
         */
        this.pointerPressed = function(e) {
            if (this.timer != null) {
                clearInterval(this.timer);
                this.timer = null;
            }
            this.target = null;
        };
    }
]);


/**
 * @for
 */

})(zebkit("ui"), zebkit.Class);

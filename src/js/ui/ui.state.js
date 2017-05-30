zebkit.package("ui", function(pkg, Class) {
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
            p.setBackground({
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
             * @default null
             * @type {Object}
             */
            this.state = null;

            /**
             * Set the component state
             * @param {Object} s a state
             * @method  setState
             * @chainable
             */
            this.setState = function(s) {
                if (s !== this.state){
                    var prev = this.state;
                    this.state = s;
                    this.stateUpdated(prev, s);
                }
                return this;
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
            this.stateUpdated = function(o, n) {
                var b  = false,
                    id = (typeof this.toViewId !== 'undefined' ? this.toViewId(n) : n);

                if (id !== null) {
                    for(var i = 0; i < this.kids.length; i++) {
                        var kid = this.kids[i];
                        if (typeof kid.setState !== 'undefined') {
                            kid.setState(id);
                        }
                    }

                    if (this.border !== null && typeof this.border.activate !== 'undefined') {
                        b = this.border.activate(id, this) === true || b;
                    }

                    if (this.view !== null && typeof this.view.activate !== 'undefined') {
                        b = this.view.activate(id, this) === true || b;
                    }

                    if (this.bg !== null && typeof this.bg.activate !== 'undefined') {
                        b = this.bg.activate(id, this) === true || b;
                    }

                    if (b) {
                        this.repaint();
                    }
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
                if (typeof this.kids !== 'undefined') {
                    this.syncState(this.state, this.state);
                }
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
    var OVER         = "over",
        PRESSED_OVER = "pressed.over",
        OUT          = "out",
        PRESSED_OUT  = "pressed.out",
        DISABLED     = "disabled";

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
                    (e.code === "Enter" || e.code === "Space"))
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
                        var p = zebkit.layout.toParentOrigin(e.x, e.y, e.source, this);
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
                    var p = zebkit.layout.toParentOrigin(e.x, e.y, e.source, this);
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
                    this.setState(this.state === PRESSED_OVER ? PRESSED_OUT : OUT);
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
                    } else {
                        this.setState(pressed ? PRESSED_OUT : OUT);
                    }
                }
            };
        },

        function setEnabled(b) {
            this.$super(b);
            this.setState(b ? OUT : DISABLED);
            return this;
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
             * @default true
             */
            this.canHaveFocus = true;

            /**
             * Indicates this composite component can make its children components
             * event transparent.
             * @attribute catchInput
             * @readOnly
             * @type {Boolean}
             * @default true
             */
            this.catchInput = true;

            /**
             * Component that has to be used as focus indicator anchor
             * @attribute focusComponent
             * @type {zebkit.ui.Panel}
             * @default null
             * @readOnly
             */
            this.focusComponent = null;

            /**
             * Reference to an anchor focus marker component
             * @attribute focusMarkerView
             * @readOnly
             * @type {zebkit.ui.Panel}
             */
            this.focusMarkerView = null;

            /**
             * Focus marker verical and horizontal gaps.
             * @attribute focusMarkerGaps
             * @type {Number}
             * @default 2
             */
            this.focusMarkerGaps = 2;

            this.paintOnTop = function(g){
                var fc = this.focusComponent;
                if (this.focusMarkerView !== null && fc !== null && this.hasFocus()) {
                    this.focusMarkerView.paint(g, fc.x - this.focusMarkerGaps,
                                                  fc.y - this.focusMarkerGaps,
                                                  this.focusMarkerGaps * 2 + fc.width,
                                                  this.focusMarkerGaps * 2 + fc.height,
                                                  this);
                }
            };

            /**
             * Set the view that has to be rendered as focus marker when the component gains focus.
             * @param  {String|zebkit.ui.View|Function} c a view.
             * The view can be a color or border string code or view
             * or an implementation of zebkit.ui.View "paint(g,x,y,w,h,t)" method.
             * @method setFocusMarkerView
             * @chainable
             */
            this.setFocusMarkerView = function (c){
                if (c != this.focusMarkerView){
                    this.focusMarkerView = pkg.$view(c);
                    this.repaint();
                }
                return this;
            };

            /**
             * Says if the component can hold focus or not
             * @param  {Boolean} b true if the component can gain focus
             * @method setCanHaveFocus
             */
            this.setCanHaveFocus = function(b){
                if (this.canHaveFocus !== b) {
                    var fm = pkg.focusManager;
                    if (b === false && fm.focusOwner === this) {
                        fm.requestFocus(null);
                    }
                    this.canHaveFocus = b;
                }
                return this;
            };

            /**
             * Set the specified children component to be used as focus marker view anchor component.
             * Anchor component is a component over that the focus marker view is painted.
             * @param  {zebkit.ui.Panel} c an anchor component
             * @method setFocusAnchorComponent
             * @chainable
             */
            this.setFocusAnchorComponent = function(c) {
                if (this.focusComponent !== c) {
                    if (c !== null && this.kids.indexOf(c) < 0) {
                        throw new Error("Focus component doesn't exist");
                    }
                    this.focusComponent = c;
                    this.repaint();
                }
                return this;
            };
        },

        function focused() {
            this.$super();
            this.repaint();
        },

        function kidRemoved(i,l){
            if (l === this.focusComponent) {
                this.focusComponent = null;
            }
            this.$super(i, l);
        }
    ]);
});
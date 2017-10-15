zebkit.package("ui", function(pkg, Class) {
    /**
     * State panel class. The class is UI component that allows to customize
     * the component  face, background and border depending on the component
     * state. Number and names of states the component can have is defined
     * by developers. To bind a view to the specified state use zebkit.draw.ViewSet
     * class. For instance if a component has to support two states : "state1" and
     * "state2" you can do it as following:
     *
     *     // create state component
     *     var p = new zebkit.ui.StatePan();
     *
     *     // define border view that contains views for "state1" and "state2"
     *     p.setBorder({
     *         "state1": new zebkit.draw.Border("red", 1),
     *         "state1": new zebkit.draw.Border("blue", 2)
     *     });
     *
     *     // define background view that contains views for "state1" and "state2"
     *     p.setBackground({
     *         "state1": "yellow",
     *         "state1": "green"
     *     });
     *
     *     // set component state
     *     p.setState("state1");
     *
     * State component children components can listening when the state of the component
     * has been updated by implementing "parentStateUpdated(o,n,id)" method. It gets old
     * state, new state and a view id that is mapped to the new state.  The feature is
     * useful if we are developing a composite components whose children component also
     * should react to a state changing.
     * @class  zebkit.ui.StatePan
     * @constructor
     * @extends zebkit.ui.ViewPan
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
            this.toViewId = function(st) {
                return st;
            };

            /**
             * Called every time the component state has been updated
             * @param  {Integer} o a previous component state
             * @param  {Integer} n a new component state
             * @method stateUpdated
             */
            this.stateUpdated = function(o, n) {
                var b  = false,
                    id = this.toViewId(n);

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

        function setBorder(v) {
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
        },

        function setEnabled(b) {
            this.$super(b);
            this.setState(b ? "out" : "disabled");
            return this;
        }
    ]);

    // TODO: probably should be removed
    /**
     * Input events state panel.
     * @class zebkit.ui.EvStatePan
     * @extends {zebkit.ui.StatePan}
     * @uses zebkit.ui.event.InputEventState
     * @constructor
     */
    pkg.EvStatePan = Class(pkg.StatePan, pkg.event.InputEventState, []);

    /**
     * Composite focusable interface. the interface adds support for focus marker
     * view and anchor focus component.
     * @class  zebkit.ui.FocusableComposite
     * @interface  zebkit.ui.FocusableComposite
     */
    pkg.FocusableComposite = zebkit.Interface([
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

            this.paintOnTop = function(g) {
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
             * @param  {String|zebkit.draw.View|Function} c a view.
             * The view can be a color or border string code or view
             * or an implementation of zebkit.draw.View "paint(g,x,y,w,h,t)" method.
             * @method setFocusMarkerView
             * @chainable
             */
            this.setFocusMarkerView = function(c) {
                if (c != this.focusMarkerView){
                    this.focusMarkerView = zebkit.draw.$view(c);
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
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
     *         "state2": new zebkit.draw.Border("blue", 2)
     *     });
     *
     *     // define background view that contains views for "state1" and "state2"
     *     p.setBackground({
     *         "state1": "yellow",
     *         "state2": "green"
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
                        if (kid.setState !== undefined) {
                            kid.setState(id);
                        }
                    }

                    if (this.border !== null && this.border.activate !== undefined) {
                        b = this.border.activate(id, this) === true || b;
                    }

                    if (this.view !== null && this.view.activate !== undefined) {
                        b = this.view.activate(id, this) === true || b;
                    }

                    if (this.bg !== null && this.bg.activate !== undefined) {
                        b = this.bg.activate(id, this) === true || b;
                    }

                    if (b) {
                        this.repaint();
                    }
                }

                // TODO: code to support potential future state update listener support
                if (this._ !== undefined && this._.stateUpdated !== undefined) {
                    this._.stateUpdated(this, o, n, id);
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

        function setView(v) {
            if (v !== this.view) {
                this.$super(v);

                // check if the method called after constructor execution
                // otherwise sync is not possible
                if (this.kids !== undefined) {
                    this.syncState(this.state, this.state);
                }
            }
            return this;
        },

        function setBorder(v) {
            if (v !== this.border) {
                this.$super(v);
                this.syncState(this.state, this.state);
            }
            return this;
        },

        function setBackground(v) {
            if (v !== this.bg) {
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
     * @extends zebkit.ui.StatePan
     * @uses zebkit.ui.event.TrackInputEventState
     * @uses zebkit.ui.StatePan
     * @constructor
     */
    pkg.EvStatePan = Class(pkg.StatePan, pkg.event.TrackInputEventState, []);

    /**
     * Interface to add focus marker rendering. Focus marker is drawn either over
     * the component space or around the specified anchor child component.
     * @class  zebkit.ui.DrawFocusMarker
     * @interface  zebkit.ui.DrawFocusMarker
     */
    pkg.DrawFocusMarker = zebkit.Interface([
        function $prototype() {
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
             * @type {zebkit.draw.View}
             */
            this.focusMarkerView = null;

            /**
             * Focus marker vertical and horizontal gaps.
             * @attribute focusMarkerGaps
             * @type {Integer}
             * @default 2
             */
            this.focusMarkerGaps = 2;

            this.paintOnTop = function(g) {
                var fc = this.focusComponent;
                if (this.focusMarkerView !== null && fc !== null && this.hasFocus()) {
                    if (fc === this) {
                        this.focusMarkerView.paint(g, this.focusMarkerGaps,
                                                      this.focusMarkerGaps,
                                                      fc.width  - this.focusMarkerGaps * 2,
                                                      fc.height - this.focusMarkerGaps * 2,
                                                      this);
                    } else {
                        this.focusMarkerView.paint(g, fc.x - this.focusMarkerGaps,
                                                      fc.y - this.focusMarkerGaps,
                                                      this.focusMarkerGaps * 2 + fc.width,
                                                      this.focusMarkerGaps * 2 + fc.height,
                                                      this);
                    }
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
             * Set the specified children component to be used as focus marker view anchor
             * component. Anchor component is a component over that the focus marker view
             * is painted.
             * @param  {zebkit.ui.Panel} c an anchor component
             * @method setFocusAnchorComponent
             * @chainable
             */
            this.setFocusAnchorComponent = function(c) {
                if (this.focusComponent !== c) {
                    if (c !== this && c !== null && this.kids.indexOf(c) < 0) {
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

        function kidRemoved(i, l, ctr){
            if (l === this.focusComponent) {
                this.focusComponent = null;
            }
            this.$super(i, l, ctr);
        }
    ]);
});
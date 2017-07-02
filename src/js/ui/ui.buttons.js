zebkit.package("ui", function(pkg, Class) {
    /**
     * Special interface that provides set of method for state components to implement repeatable
     * state.
     * @class zebkit.ui.ButtonRepeatMix
     * @interface zebkit.ui.ButtonRepeatMix
     */
    pkg.ButtonRepeatMix = zebkit.Interface([
        function $prototype() {
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

            /**
             * Indicates a time the repeat state events have to start in
             * @attribute startIn
             * @type {Integer}
             * @readOnly
             * @default 400
             */
            this.startIn = 400;

            this.$repeatTask = null;

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
                if (this.$repeatTask !== null) {
                    this.$repeatTask.shutdown();
                }

                this.isFireByPress = b;
                this.firePeriod = firePeriod;
                if (arguments.length > 2) {
                    this.startIn = startIn;
                }
                return this;
            };

            this.$fire = function() {
                this.fire();
                if (typeof this.fired !== 'undefined') {
                    this.fired();
                }
            };
        },

        function stateUpdated(o,n){
            this.$super(o, n);
            if (n === "pressed.over") {
                if (this.isFireByPress === true){
                    this.$fire();

                    if (this.firePeriod > 0) {
                        var $this = this;
                        this.$repeatTask = zebkit.util.tasksSet.run(function() {
                                if ($this.state === "pressed.over") {
                                    $this.$fire();
                                }
                            },
                            this.startIn,
                            this.firePeriod
                        );
                    }
                }
            } else {
                if (this.firePeriod > 0 && this.$repeatTask !== null) {
                    this.$repeatTask.shutdown();
                }

                if (n === "over" && (o === "pressed.over" && this.isFireByPress === false)) {
                    this.$fire();
                }
            }
        }
    ]);

    /**
     * Arrow button component. The component use arrow views as its icon.
     * @class zebkit.ui.ArrowButton
     * @constructor
     * @param  {String} direction an arrow icon direction. Use "left", "right", "top", "bottom" as
     * the parameter value.
     * @extends zebkit.ui.EvStatePan
     * @uses zebkit.ui.ButtonRepeatMix
     */

     /**
      * Fired when a button has been pressed

             var b = new zebkit.ui.ArrowButton("left");
             b.on(function (src) {
                 ...
             });

      * Button can be adjusted in respect how it generates the pressed event. Event can be
      * triggered by pressed or clicked even. Also event can be generated periodically if
      * the button is kept in pressed state.
      * @event fired
      * @param {zebkit.ui.ArrowButton} src a button that has been pressed
      */
    pkg.ArrowButton = Class(pkg.EvStatePan, zebkit.util.Fireable, pkg.ButtonRepeatMix, [
        function(direction) {
            this._ = new zebkit.util.Listeners();
            this.cursorType = pkg.Cursor.HAND;

            if (arguments.length > 0) {
                this.direction = zebkit.util.$validateValue(direction, "left", "right", "top", "bottom");
            }

            var clz = typeof this.clazz.$colors !== 'undefined' ? this.clazz : pkg.ArrowButton;
            this.setView({
                "out"          : new clz.ArrowView(this.direction, clz.$colors.out),
                "over"         : new clz.ArrowView(this.direction, clz.$colors.over),
                "pressed.over" : new clz.ArrowView(this.direction, clz.$colors["pressed.over"]),
                "disabled"     : new clz.ArrowView(this.direction, clz.$colors.disabled)
            });

            this.$super();
            this.syncState(this.state, this.state);
        },

        function $clazz() {
            this.ArrowView = Class(zebkit.draw.ArrowView, []);

            this.$colors = {
                "out"          : "red",
                "over"         : "red",
                "pressed.over" : "black",
                "disabled"     : "lightGray"
            };
        },

        function $prototype() {
            /**
             * Arrow icon view direction
             * @attribute direction
             * @type {String}
             * @default "left"
             * @readOnly
             */
            this.direction = "left";

            /**
             * Set arrow view orientation.
             * @param {String} d an orientation of triangle arrow
             * @method setArrowDirection
             * @chainable
             */
            this.setArrowDirection = function(d) {
                this.iterateArrowViews(function(k, v) {
                    if (v !== null) {
                        v.direction = d;
                    }
                });
                this.repaint();
                return this;
            };

            /**
             * Set arrow view size.
             * @param {Integer} w an arrow view width
             * @param {Integer} h an arrow view height
             * @method setArrowSize
             * @chainable
             */
            this.setArrowSize = function(w, h) {
                if (arguments.length < 2) {
                    h = w;
                }
                this.iterateArrowViews(function(k, v) {
                    if (v !== null) {
                        v.width  = w;
                        v.height = h;
                    }
                });
                this.vrp();
                return this;
            };

            /**
             * Set arrow views states colors.
             * @param {String} pressedColor a pressed state color
             * @param {String} overColor an over state color
             * @param {String} outColor an out state color
             * @method setArrowColors
             * @chainable
             */
            this.setArrowColors = function(pressedColor, overColor, outColor) {
                var views = this.view.views;
                if (views.out !== null && typeof views.out !== 'undefined') {
                    views.out.color = outColor;
                }

                if (views.over.color !== null && typeof views.over !== 'undefined') {
                    views.over.color = overColor;
                }

                if (views["pressed.over"] !== null && typeof views["pressed.over"] !== 'undefined') {
                    views["pressed.over"].color = pressedColor;
                }

                this.repaint();
                return this;
            };

            /**
             * Iterate button arrows views.
             * @param  {Function} callback a callback that is called for every found arrow view.
             * The method gets the view id and view itself as its arguments.
             * @chainable
             * @method iterateArrowViews
             */
            this.iterateArrowViews = function(callback) {
                var views = this.view.views;
                for(var k in views) {
                    if (views.hasOwnProperty(k)) {
                        callback.call(this, k, views[k]);
                    }
                }
                return this;
            };
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
            var button = new zebkit.ui.Button("Line1\nLine2");


     *  @class  zebkit.ui.Button
     *  @constructor
     *  @param {String|zebkit.ui.Panel|zebkit.draw.View} [t] a button label.
     *  The label can be a simple text or an UI component.
     *  @extends zebkit.ui.CompositeEvStatePan
     *  @uses  zebkit.ui.ButtonRepeatMix
     */

    /**
     * Fired when a button has been pressed
     *
     *     var b = new zebkit.ui.Button("Test");
     *     b.on(function (src) {
     *         ...
     *     });
     *
     * Button can be adjusted in respect how it generates the pressed event. Event can be
     * triggered by pressed or clicked even. Also event can be generated periodically if
     * the button is kept in pressed state.
     * @event fired
     * @param {zebkit.ui.Button} src a button that has been pressed
     *
     */
    pkg.Button = Class(pkg.CompositeEvStatePan, zebkit.util.Fireable, pkg.ButtonRepeatMix, [
        function(t) {
            this._ = new zebkit.util.Listeners();

            this.$super();

            if (arguments.length > 0 && t !== null) {
                t = pkg.$component(t, this);
                this.add(t);
                this.setFocusAnchorComponent(t);
            }
        },

        function $clazz() {
            this.Label = Class(pkg.Label, []);

            this.ViewPan = Class(pkg.ViewPan, [
                function(v) {
                    this.$super();
                    this.setView(v);
                },

                function $prototype() {
                    this.setState = function(id) {
                        if (this.view !== null && typeof this.view.activate !== 'undefined') {
                            this.activate(id);
                        }
                    };
                }
            ]);

            this.ImageLabel = Class(pkg.ImageLabel, []);
        },

        function $prototype() {
            /**
             * Indicates the component can have focus
             * @attribute canHaveFocus
             * @type {Boolean}
             * @default true
             */
            this.canHaveFocus = true;
        }
    ]);

    /**
     * Group class to help managing group of element where only one can be on.
     *
     *     // create group of check boxes that will work as a radio group
     *     var gr  = new zebkit.ui.Group();
     *     var ch1 = new zebkit.ui.Checkbox("Test 1", gr);
     *     var ch2 = new zebkit.ui.Checkbox("Test 2", gr);
     *     var ch3 = new zebkit.ui.Checkbox("Test 3", gr);
     *
     * @class  zebkit.ui.Group
     * @param {Boolean} [un] indicates if group can have no one item selected.
     * @constructor
     */
    pkg.Group = Class(zebkit.EventProducer, [
        function(un) {
            this.selected = null;
            this._ = new zebkit.util.Listeners();
            if (arguments.length > 0) {
                this.allowNoneSelected = un;
            }
        },

        function $prototype() {
            /**
             * indicates if group can have no one item selected.
             * @attribute allowNoneSelected
             * @readOnly
             * @type {Boolean}
             * @default false
             */
            this.allowNoneSelected = false;

            this.$group  = null;
            this.$locked = false;

            this.$allowValueUpdate = function(src) {
                if (this.$group === null || this.$group.indexOf(src) < 0) {
                    throw new Error("Component is not the group member");
                }

                return (this.selected !== src ||
                        src.getValue() === false ||
                        this.allowNoneSelected === true);
            };

            this.attach = function(c) {
                if (this.$group === null) {
                    this.$group = [];
                }

                if (this.$group.indexOf(c) >= 0) {
                    throw new Error("Duplicated group element");
                }

                if (this.selected !== null && c.getValue() === true) {
                    c.setValue(false);
                }

                c.on(this);
                this.$group.push(c);
            };

            this.detach = function(c) {
                if (this.$group === null || this.$group.indexOf(c) < 0) {
                    throw new Error("Component is not the group member");
                }

                if (this.selected !== null && c.getValue() === true) {
                    c.setValue(false);
                }

                c.off(this);
                var i = this.$group.indexOf(c);
                this.$group.splice(i, 1);

                if (this.selected === c) {
                    if (this.allowNoneSelected !== true && this.$group.length > 0) {
                        this.$group[i % this.$group.length].setValue(true);
                    }
                    this.selected = null;
                }
            };

            this.fired = function(c) {
                if (this.$locked !== true) {
                    try {
                        this.$locked = true;
                        var b   = c.getValue(),
                            old = this.selected;

                        if (this.allowNoneSelected && b === false && this.selected !== null) {
                            this.selected = null;
                            this.updated(old);
                        } else if (b && this.selected !== c) {
                            this.selected = c;
                            if (old !== null) {
                                old.setValue(false);
                            }
                            this.updated(old);
                        }
                    } finally {
                        this.$locked = false;
                    }
                }
            };

            this.updated = function(old) {
                this._.fired(this, this.selected, old);
            };
        }
    ]);

    /**
     * Check-box UI component. The component is a container that consists from two other UI components:
     *
     *   - Box component to keep checker indicator
     *   - Label component to paint label
     *
     * Developers are free to customize the component as they want. There is no limitation regarding
     * how the box and label components have to be laid out, which UI components have to be used as
     * the box or label components, etc. The check box extends state panel component and re-map states
     * to own views IDs:
     *
     *   - **"pressed.out"** - checked and pointer cursor is out
     *   - **"out"** - un-checked and pointer cursor is out
     *   - **"pressed.disabled"** - disabled and checked,
     *   - **"disabled"** - disabled and un-checked ,
     *   - **"pressed.over"** - checked and pointer cursor is over
     *   - **"over"** - un-checked and pointer cursor is out
     *
     *
     * Customize is quite similar to what explained for zebkit.ui.EvStatePan:
     *
     *
     *       // create checkbox component
     *       var ch = new zebkit.ui.Checkbox("Checkbox");
     *
     *       // change border when the component checked to green
     *       // otherwise set it to red
     *       ch.setBorder(new zebkit.draw.ViewSet({
     *           "*": new zebkit.draw.Border("red"),
     *           "pressed.*": new zebkit.draw.Border("green")
     *       }));
     *
     *       // customize checker box children UI component to show
     *       // green for checked and red for un-cheked states
     *       ch.kids[0].setView(new zebkit.draw.ViewSet({
     *           "*": "red",
     *           "pressed.*": "green"
     *       }));
     *       // sync current state with new look and feel
     *       ch.syncState();
     *
     * Listening checked event should be done by registering a listener in the check box switch manager
     * as follow:
     *
     *       // create check box component
     *       var ch = new zebkit.ui.Checkbox("Checkbox");
     *
     *       // register a check box listener
     *       ch.on(function(src) {
     *           var s = src.getValue();
     *           ...
     *       });
     *
     * @class  zebkit.ui.Checkbox
     * @extends zebkit.ui.CompositeEvStatePan
     * @constructor
     * @param {String|zebkit.ui.Panel} [label] a label
     */
    pkg.Checkbox = Class(pkg.CompositeEvStatePan, [
        function (c) {
            if (arguments.length > 0 && c !== null && zebkit.isString(c)) {
                c = new this.clazz.Label(c);
            }

            this.$super();

            this._ = new zebkit.util.Listeners();

            /**
             * Reference to box component
             * @attribute box
             * @type {zebkit.ui.Panel}
             * @readOnly
             */
            this.box = new this.clazz.Box();
            this.add(this.box);

            if (arguments.length > 0 && c !== null) {
                this.add(c);
                this.setFocusAnchorComponent(c);
            }
        },

        function $clazz() {
            /**
             * The box UI component class that is used by default with the check box component.
             * @constructor
             * @class zebkit.ui.Checkbox.Box
             * @extends zebkit.ui.ViewPan
             */
            this.Box = Class(pkg.StatePan, []);

            /**
             * @for zebkit.ui.Checkbox
             */
            this.Label = Class(pkg.Label, []);
        },

        function $prototype() {
            /**
             * Check box state
             * @attribute value
             * @type {Boolean}
             * @readOnly
             * @protected
             */
            this.value = false;



            this.$group = null;

            /**
             * Set the check box state.
             * @param {Boolean} v a state of the check box
             * @method setValue
             * @chainable
             */
            this.setValue = function(v) {
                if (this.value !== v && (this.$group === null || this.$group.$allowValueUpdate(this))) {
                    this.value = v;
                    this.stateUpdated(this.state, this.state);
                    if (typeof this.switched !== 'undefined') {
                        this.switched(this);
                    }
                    this._.fired(this);
                }
                return this;
            };

            /**
             * Get the check box state
             * @return {Boolean} a state
             * @method getValue
             */
            this.getValue = function() {
                return this.value;
            };

            /**
             * Toggle check box state.
             * @method toggle
             * @chainable
             */
            this.toggle = function() {
                this.setValue(this.value !== true);
                return this;
            };

            /**
             * Map the specified state into its symbolic name.
             * @protected
             * @param  {String} state a state
             * @return {String} a symbolic name of the state
             * @method toViewId
             */
            this.toViewId = function(state){
                if (this.isEnabled === true) {
                    return this.getValue() ? (state === "over" ? "pressed.over" : "pressed.out")
                                           : (state === "over" ? "over" : "out");
                } else {
                    return this.getValue() ? "pressed.disabled" : "disabled";
                }
            };

            /**
             * Attach the given check box tho the specified group
             * @param {zebkit.ui.Group} g a group
             * @method setGroup
             * @chainable
             */
            this.setGroup = function(g) {
                if (this.$group !== null) {
                    this.$group.detach(this);
                    this.$group = null;
                }

                if (this.$group !== g) {
                    this.$group = g;
                    if (this.$group !== null) {
                        this.$group.attach(this);
                    }
                }

                return this;
            };
        },

        function stateUpdated(o, n) {
            if (o === "pressed.over" && n === "over") {
                this.toggle();
            }
            this.$super(o, n);
        },

        function kidRemoved(index,c) {
            if (this.box === c) {
                this.box = null;
            }
            this.$super(index,c);
        },

        function keyPressed(e){
            if (this.$group !== null && this.getValue()){
                var d = 0;
                if (e.code === "ArrowLeft" || e.code === "ArrowUp") {
                    d = -1;
                } else if (e.code === "ArrowRight" || e.code === "ArrowDown") {
                    d = 1;
                }

                if (d !== 0) {
                    var p = this.parent;
                    for(var i = p.indexOf(this) + d; i < p.kids.length && i >= 0; i += d) {
                        var l = p.kids[i];
                        if (l.isVisible === true &&
                            l.isEnabled === true &&
                            l.$group    === this.$group )
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
        }
    ]);

    /**
     * Radio-box UI component class. This class is extension of "zebkit.ui.Checkbox" class that sets group
     * as a default switch manager. The other functionality id identical to check box component. Generally
     * speaking this class is a shortcut for radio box creation.
     * @class  zebkit.ui.Radiobox
     * @constructor
     * @param {String|zebkit.ui.Panel} [label] a label
     * @param {zebkit.ui.Group} [m] a group
     * @extends zebkit.ui.Checkbox
     */
    pkg.Radiobox = Class(pkg.Checkbox, [
        function(lab, group) {
            if (arguments.length > 0) {
                if (zebkit.instanceOf(lab, pkg.Group)) {
                    group = lab;
                    lab   = null;
                }

                this.$super(lab);
            } else {
                this.$super();
            }

            if (typeof group !== 'undefined') {
                this.setGroup(group);
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
        function(s) {
            // do it before super
            this.view = new zebkit.draw.DecoratedTextRender(s);
            this.overDecoration = "underline";

            this.$super(null);

            // if colors have not been set with default property set it here
            if (this.colors === null) {
                this.colors  = {
                    "pressed.over" : "blue",
                    "out"          : "white",
                    "over"         : "white",
                    "pressed.out"  : "black",
                    "disabled"     : "gray"
                };
            }

            this.stateUpdated(this.state, this.state);
        },

        function $prototype() {
            this.colors = null;

            /**
             * Mouse cursor type.
             * @attribute cursorType
             * @default zebkit.ui.Cursor.HAND;
             * @type {String}
             * @readOnly
             */
            this.cursorType = pkg.Cursor.HAND;

            /**
             * Set link font
             * @param {zebkit.Font} f a font
             * @method setFont
             * @chainable
             */
            this.setFont = function(f) {
                var old = this.view !== null ? this.view.font
                                             : null;

                this.view.setFont.apply(this.view, arguments);
                if (old !== this.view.font) {
                    this.vrp();
                }
                return this;
            };

            /**
             * Set the link text color for the specified link state
             * @param {String} state a link state
             * @param {String} c a link text color
             * @method  setColor
             * @chainable
             */
            this.setColor = function(state,c){
                if (this.colors[state] !== c){
                    this.colors[state] = c;
                    this.syncState();
                }
                return this;
            };

            this.setColors = function(colors) {
                this.colors = zebkit.clone(colors);
                this.syncState();
                return this;
            };

            this.setValue = function(s) {
                this.view.setValue(s.toString());
                this.repaint();
                return this;
            };
        },

        function stateUpdated(o, n){
            this.$super(o, n);

            var k = this.toViewId(n),
                b = false;

            if (this.view !== null &&
                this.view.color !== this.colors[k] &&
                this.colors[k]  !== null &&
                typeof this.colors[k] !== 'undefined')
            {
                this.view.setColor(this.colors[k]);
                b = true;
            }

            if (this.view.decorations && this.overDecoration && this.isEnabled === true) {
                if (n === "over") {
                    this.view.setDecoration(this.overDecoration, this.colors[k]);
                    b = true;
                } else if (this.view.decorations[this.overDecoration]) {
                    this.view.setDecoration(this.overDecoration, null);
                    b = true;
                }
            }

            if (b) {
                this.repaint();
            }
        }
    ]);

    // cannot be declared in Button.$clazz since Link appears later and link inherits Button class
    pkg.Button.Link = Class(pkg.Link, []);


    /**
     * Toolbar UI component. Handy way to place number of click able elements
     * @class zebkit.ui.Toolbar
     * @constructor
     * @extends zebkit.ui.Panel
     */

    /**
     * Fired when a toolbar element has been pressed
     *
     *       var t = new zebkit.ui.Toolbar();
     *
     *       // add three pressable icons
     *       t.addImage("icon1.jpg");
     *       t.addImage("icon2.jpg");
     *       t.addLine();
     *       t.addImage("ico3.jpg");
     *
     *       // catch a toolbar icon has been pressed
     *       t.on(function (src) {
     *           ...
     *       });
     *
     * @event pressed
     * @constructor
     * @param {zebkit.ui.Panel} src a toolbar element that has been pressed
     */
    pkg.Toolbar = Class(pkg.Panel, [
        function () {
            this._ = new zebkit.util.Listeners();
            this.$super();
        },

        function $clazz() {
            this.ToolPan = Class(pkg.EvStatePan, [
                function(c) {
                    this.$super(new zebkit.layout.BorderLayout());
                    this.add("center", c);
                },

                function getContentComponent() {
                    return this.kids[0];
                },

                function stateUpdated(o, n) {
                    this.$super(o, n);
                    if (o === "pressed.over" && n === "over") {
                        this.parent._.fired(this);
                    }
                }
            ]);

            this.ImagePan = Class(pkg.ImagePan, []);
            this.Line     = Class(pkg.Line, []);
            this.Checkbox = Class(pkg.Checkbox, []);
            this.Radiobox = Class(pkg.Radiobox, []);

            // TODO: combo is not available in  this module yet
            // ui + ui.list has to be combined as one package
            //this.Combo    = Class(pkg.Combo, []);
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
                return zebkit.instanceOf(c, pkg.EvStatePan) === false;
            };

            /**
             * Add a radio box as the toolbar element that belongs to the
             * given group and has the specified content component
             * @param {zebkit.ui.Group} g a radio group the radio box belongs
             * @param {zebkit.ui.Panel} c a content
             * @return {zebkit.ui.Panel} a component that has been added
             * @method addRadio
             */
            this.addRadio = function(g,c) {
                var cbox = new this.clazz.Radiobox(c, g);
                cbox.setCanHaveFocus(false);
                return this.add(cbox);
            };

            /**
             * Add a check box as the toolbar element with the specified content
             * component
             * @param {zebkit.ui.Panel} c a content
             * @return {zebkit.ui.Panel} a component that has been added
             * @method addSwitcher
             */
            this.addSwitcher = function(c){
                var cbox = new this.clazz.Checkbox(c);
                cbox.setCanHaveFocus(false);
                return this.add(cbox);
            };

            /**
             * Add an image as the toolbar element
             * @param {String|Image} img an image or a path to the image
             * @return {zebkit.ui.Panel} a component that has been added
             * @method addImage
             */
            this.addImage = function(img) {
                this.validateMetric();
                return this.add(new this.clazz.ImagePan(img));
            };

            /**
             * Add line to the toolbar component. Line is a decorative ]
             * element that logically splits toolbar elements. Line as any
             * other decorative element doesn't fire event
             * @return {zebkit.ui.Panel} a component that has been added
             * @method addLine
             */
            this.addLine = function(){
                var line = new this.clazz.Line();
                line.constraints = "stretch";
                return this.addDecorative(line);
            };
        },

        /**
         * Add the given component as decorative element of the toolbar.
         * Decorative elements don't fire event and cannot be pressed
         * @param {zebkit.ui.Panel} c a component
         * @return {zebkit.ui.Panel} a component that has been added
         * @method addDecorative
         */
        function addDecorative(c) {
            return this.$getSuper("insert").call(this, this.kids.length, null, c);
        },

        function insert(i,id,d){
            if (d === "-") {
                var line = new this.clazz.Line();
                line.constraints = "stretch";
                return this.$super(i, null, line);
            } else if (Array.isArray(d)) {
                d = new this.clazz.Combo(d);
            }
            return this.$super(i, id, new this.clazz.ToolPan(d));
        }
    ]);
});
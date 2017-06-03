zebkit.package("ui", function(pkg, Class) {
    /**
     * Combo box UI component class. Combo uses a list component to show in drop down window.
     * You can use any available list component implementation:

            // use simple list as combo box drop down window
            var combo = new zebkit.ui.Combo(new zebkit.ui.List([
                "Item 1",
                "Item 2",
                "Item 3"
            ]));


            // use component list as combo box drop down window
            var combo = new zebkit.ui.Combo(new zebkit.ui.CompList([
                "Item 1",
                "Item 2",
                "Item 3"
            ]));


            // let combo box decides which list component has to be used
            var combo = new zebkit.ui.Combo([
                "Item 1",
                "Item 2",
                "Item 3"
            ]);

     * @class zebkit.ui.Combo
     * @extends {zebkit.ui.Panel}
     * @constructor
     * @param {Array|zebkit.ui.BaseList} data an combo items array or a list component
     */

    /**
     * Fired when a new value in a combo box component has been selected

         combo.on("selected", function(combo, value) {
             ...
         });

     * @event selected
     * @param {zebkit.ui.Combo} combo a combo box component where a new value
     * has been selected
     * @param {Object} value a previously selected index
     */

    /**
     * Implement the event handler method to detect when a combo pad window
     * is shown or hidden

         var p = new zebkit.ui.Combo();
         p.padShown = function(src, b) { ... }; // add event handler

     * @event padShown
     * @param {zebkit.ui.Combo} src a combo box component that triggers the event
     * @param {Boolean} b a flag that indicates if the combo pad window has been
     * shown (true) or hidden (false)
    */
    pkg.Combo = Class(pkg.Panel, [
        function(list, editable) {
            if (arguments.length === 1 && zebkit.isBoolean(list)) {
                editable = list;
                list = null;
            }

            if (arguments.length === 0) {
                editable = false;
            }

            if (arguments.length === 0 || list === null) {
                list = new this.clazz.List(true);
            }

            /**
             * Reference to combo box list component
             * @attribute list
             * @readOnly
             * @type {zebkit.ui.BaseList}
             */
            if (zebkit.instanceOf(list, pkg.BaseList) === false) {
                list = list.length > 0 && zebkit.instanceOf(list[0], pkg.Panel) ? new this.clazz.CompList(list, true)
                                                                                : new this.clazz.List(list, true);
            }

            /**
             * Maximal size the combo box height can have
             * @attribute maxPadHeight
             * @readOnly
             * @type {Integer}
             */
            this.maxPadHeight = 0;

            this.$lockListSelEvent = false;
            this._ = new this.clazz.Listeners();
            this.setList(list);

            this.$super();

            this.add("center", editable ? new this.clazz.EditableContentPan()
                                        : new this.clazz.ReadonlyContentPan());
            this.add("right", new this.clazz.Button());
        },


        function $clazz() {
            this.Listeners = zebkit.util.ListenersClass("selected");

            /**
             * UI panel class that is used to implement combo box content area
             * @class  zebkit.ui.Combo.ContentPan
             * @extends {zebkit.ui.Panel}
             * @constructor
             */
            this.ContentPan = Class(pkg.Panel, [
                function $prototype() {
                    /**
                     * Called whenever the given combo box value has been updated with the specified
                     * value. Implement the method to synchronize content panel with updated combo
                     * box value
                     * @method comboValueUpdated
                     * @param {zebkit.ui.Combo} combo a combo box component that has been updated
                     * @param {Object} value a value with which the combo box has been updated
                     */
                    this.comboValueUpdated = function(combo, value) {};

                    /**
                     * Indicates if the content panel is editable. Set the property to true
                     * to indicate the content panel implementation is editable. Editable
                     * means the combo box content can be editable by a user
                     * @attribute isEditable
                     * @type {Boolean}
                     * @readOnly
                     * @default undefined
                     */

                    /**
                     * Get a combo box the content panel belongs
                     * @method getCombo
                     * @return {zebkit.ui.Combo} a combo the content panel belongs
                     */
                    this.getCombo = function() {
                        for (var p = this.parent; p !== null && zebkit.instanceOf(p, pkg.Combo) === false; p = p.parent);
                        return p;
                    };
                }
            ]);

            /**
             * Combo box list pad component class
             * @extends zebkit.ui.ScrollPan
             * @class  zebkit.ui.Combo.ComboPadPan
             * @constructor
             * @param {zebkit.ui.Panel} c a target component
             */
            this.ComboPadPan = Class(pkg.ScrollPan, [
                function $prototype() {
                    this.$closeTime = 0;

                    this.adjustToComboSize = true;

                    this.owner = null;

                    /**
                     * A reference to combo that uses the list pad component
                     * @attribute owner
                     * @type {zebkit.ui.Combo}
                     * @readOnly
                     */
                    this.childKeyPressed = function(e){
                        if (e.code === "Escape" && this.parent !== null) {
                            this.removeMe();
                            if (this.owner !== null) this.owner.requestFocus();
                        }
                    };
                },

                function setParent(l) {
                    this.$super(l);
                    if (l === null && this.owner !== null) {
                        this.owner.requestFocus();
                    }

                    this.$closeTime = l === null ? new Date().getTime() : 0;
                }
            ]);

            /**
             * Read-only content area combo box component panel class
             * @extends zebkit.ui.Combo.ContentPan
             * @constructor
             * @class  zebkit.ui.Combo.ReadonlyContentPan
             */
            this.ReadonlyContentPan = Class(this.ContentPan, [
                function $prototype() {
                    this.calcPsByContent = false;

                    this.getCurrentView = function() {
                        var list = this.getCombo().list,
                            selected = list.getSelected();

                        return selected !== null ? list.provider.getView(list, list.selectedIndex, selected)
                                                 : null;
                    };

                    this.paintOnTop = function(g){
                        var v = this.getCurrentView();
                        if (v !== null) {
                            var ps = v.getPreferredSize();
                            v.paint(g, this.getLeft(),
                                       this.getTop() + Math.floor((this.height - this.getTop() - this.getBottom() - ps.height) / 2),
                                       this.width, ps.height, this);
                        }
                    };

                    this.setCalcPsByContent = function(b) {
                        if (this.calcPsByContent !== b) {
                            this.calcPsByContent = b;
                            this.vrp();
                        }
                        return this;
                    };

                    this.calcPreferredSize = function(l) {
                        var p = this.getCombo();
                        if (p !== null && this.calcPsByContent !== true) {
                            return p.list.calcMaxItemSize();
                        }
                        var cv = this.getCurrentView();
                        return cv === null ? { width: 0, height: 0} : cv.getPreferredSize();
                    };

                    this.comboValueUpdated = function(combo, value) {
                        if (this.calcPsByContent === true) this.invalidate();
                    };
                }
            ]);

            /**
             * Editable content area combo box component panel class
             * @class zebkit.ui.Combo.EditableContentPan
             * @constructor
             * @extends zebkit.ui.Combo.ContentPan
             */

            /**
             * Fired when a content value has been updated.

            content.on(function(contentPan, newValue) {
                ...
            });

             * @param {zebkit.ui.Combo.ContentPan} contentPan a content panel that
             * updated its value
             * @param {Object} newValue a new value the content panel has been set
             * with
             * @event  contentUpdated
             */
            this.EditableContentPan = Class(this.ContentPan, [
                function $clazz() {
                    this.TextField = Class(pkg.TextField, []);
                    this.Listeners = zebkit.util.ListenersClass("contentUpdated");
                },

                function $prototype() {
                    this.canHaveFocus = true;

                    this.textUpdated = function(src,b,off,size,startLine,lines){
                        if (this.dontGenerateUpdateEvent === false) {
                            this._.contentUpdated(this, this.textField.getValue());
                        }
                    };

                    /**
                     * Called when the combo box content has been updated
                     * @param {zebkit.ui.Combo} combo a combo where the new value has been set
                     * @param {Object} v a new combo box value
                     * @method comboValueUpdated
                     */
                    this.comboValueUpdated = function(combo, v){
                        this.dontGenerateUpdateEvent = true;
                        try {
                            var txt = (v === null ? "" : v.toString());
                            this.textField.setValue(txt);
                            this.textField.select(0, txt.length);
                        } finally {
                            this.dontGenerateUpdateEvent = false;
                        }
                    };
                },

                function focused(){
                    this.$super();
                    this.textField.requestFocus();
                },

                function() {
                    this.$super();
                    this._ = new this.clazz.Listeners();

                    this.isEditable = true;

                    this.dontGenerateUpdateEvent = false;

                    /**
                     * A reference to a text field component the content panel uses as a
                     * value editor
                     * @attribute textField
                     * @readOnly
                     * @private
                     * @type {zebkit.ui.TextField}
                     */
                    this.textField = new this.clazz.TextField("",  -1);
                    this.textField.view.target.on(this);
                    this.add("center", this.textField);
                }
            ]);

            this.Button = Class(pkg.Button, [
                function() {
                    this.setFireParams(true,  -1);
                    this.$super();
                }
            ]);

            this.List = Class(pkg.List, []);
            this.CompList = Class(pkg.CompList, []);
        },

        /**
         * @for zebkit.ui.Combo
         */
        function $prototype() {
            this.list = null;

            /**
             * Reference to combo box button component
             * @attribute button
             * @readOnly
             * @type {zebkit.ui.Panel}
             */

            /**
             * Reference to combo box content component
             * @attribute content
             * @readOnly
             * @type {zebkit.ui.Panel}
             */

            /**
             * Reference to combo box pad component
             * @attribute winpad
             * @readOnly
             * @type {zebkit.ui.Panel}
             */

            /**
             * Reference to selection view
             * @attribute selectionView
             * @readOnly
             * @type {zebkit.ui.View}
             */

            this.selectionView = this.button = this.content = this.winpad = null;


            this.paint = function(g){
                if (this.content       !== null &&
                    this.selectionView !== null &&
                    this.hasFocus())
                {
                    this.selectionView.paint(g, this.content.x,
                                                this.content.y,
                                                this.content.width,
                                                this.content.height,
                                                this);
                }
            };

            this.catchInput = function (child) {
                return child !== this.button && (this.content === null || this.content.isEditable !== true);
            };

            this.canHaveFocus = function() {
                return this.winpad.parent === null && (this.content !== null && this.content.isEditable !== true);
            };

            this.contentUpdated = function(src, text){
                if (src === this.content) {
                    try {
                        this.$lockListSelEvent = true;
                        if (text === null) {
                            this.list.select(-1);
                        } else {
                            var m = this.list.model;
                            for(var i = 0;i < m.count(); i++){
                                var mv = m.get(i);
                                if (mv !== text) {
                                    this.list.select(i);
                                    break;
                                }
                            }
                        }
                    } finally {
                        this.$lockListSelEvent = false;
                    }
                    this._.selected(this, text);
                }
            };

            /**
             * Select the given value from the list as the combo box value
             * @param  {Integer} i an index of a list element to be selected
             * as the combo box value
             * @method select
             * @chainable
             */
            this.select = function(i) {
                this.list.select(i);
                return this;
            };

            // This method has been added to support selectedIndex property setter
            this.setSelectedIndex = function(i) {
                this.select(i);
                return this;
            };

            /**
             * Set combo box value selected value.
             * @param {Object} v a value
             * @method  setValue
             */
            this.setValue = function(v) {
                return this.list.setValue(v);
            };

            /**
             * Get the current combo box selected value
             * @return {Object} a value
             * @method getValue
             */
            this.getValue = function() {
                return this.list.getValue();
            };

            /**
             * Define pointer pressed events handler
             * @param  {zebkit.ui.event.PointerEvent} e a pointer event
             * @method pointerPressed
             */
            this.pointerPressed = function (e) {
                if (e.isAction() && this.content !== null                 &&
                    (new Date().getTime() - this.winpad.$closeTime) > 100 &&
                    e.x > this.content.x && e.y > this.content.y          &&
                    e.x < this.content.x + this.content.width             &&
                    e.y < this.content.y + this.content.height              )
                {
                    this.showPad();
                }
            };

            /**
             * Test if the combo window pad is shown
             * @return {Boolean} true if the combo window pad is shown
             * @method isPadShown
             */
            this.isPadShown = function() {
                return this.winpad !== null && this.winpad.parent !== null && this.winpad.isVisible === true;
            };

            /**
             * Hide combo drop down list
             * @method hidePad
             * @chainable
             */
            this.hidePad = function() {
                var d = this.getCanvas();
                if (d !== null && this.winpad.parent !== null) {
                    this.winpad.removeMe();
                    this.requestFocus();
                }
                return this;
            };

            /**
             * Show combo drop down list
             * @method showPad
             * @chainable
             */
            this.showPad = function(){
                var canvas = this.getCanvas();
                if (canvas !== null) {
                    var ps  = this.winpad.getPreferredSize(),
                        p   = zebkit.layout.toParentOrigin(0, 0, this.winpad.adjustTo == null ? this : this.winpad.adjustTo),
                        py  = p.y;

                    // if (this.winpad.hbar && ps.width > this.width) {
                    //     ps.height += this.winpad.hbar.getPreferredSize().height;
                    // }

                    if (this.maxPadHeight > 0 && ps.height > this.maxPadHeight) {
                        ps.height = this.maxPadHeight;
                    }

                    if (py + this.height + ps.height > canvas.height) {
                        if (py - ps.height >= 0) {
                            py -= (ps.height + this.height);
                        } else {
                            var hAbove = canvas.height - py - this.height;
                            if (py > hAbove) {
                                ps.height = py;
                                py -= (ps.height + this.height);
                            } else {
                                ps.height = hAbove;
                            }
                        }
                    }

                    this.winpad.setBounds(p.x,
                                          py + (this.winpad.adjustTo == null ? this.height
                                                                             : this.winpad.adjustTo.height),
                                          this.winpad.adjustTo == null ? (this.winpad.adjustToComboSize === true ? this.width
                                                                                                                 : ps.width)
                                                                       : this.winpad.adjustTo.width,
                                          ps.height);

                    this.list.notifyScrollMan(this.list.selectedIndex);
                    canvas.getLayer(pkg.PopupLayerMix.id).add(this, this.winpad);
                    this.list.requestFocus();
                    if (typeof this.padShown !== 'undefined') {
                        this.padShown(true);
                    }

                    return this;
                }
            };

            /**
             * Bind the given list component to the combo box component.
             * @param {zebkit.ui.BaseList} l a list component
             * @method setList
             * @chainable
             */
            this.setList = function(l){
                if (this.list !== l) {
                    this.hidePad();

                    if (this.list !== null) this.list.off(this);
                    this.list = l;
                    if (typeof this.list._ !== 'undefined') this.list.on(this);

                    var $this = this;
                    this.winpad = new this.clazz.ComboPadPan(this.list, [
                        function setParent(p) {
                            this.$super(p);
                            if (typeof $this.padShown !== 'undefined') {
                                $this.padShown($this, p !== null);
                            }
                        }
                    ]);

                    this.winpad.owner = this;
                    if (this.content !== null) {
                        this.content.comboValueUpdated(this, this.list.getSelected());
                    }
                    this.vrp();
                }
                return this;
            };

            /**
             * Define key pressed events handler
             * @param  {zebkit.ui.event.KeyEvent} e a key event
             * @method keyPressed
             */
            this.keyPressed = function (e) {
                if (this.list !== null && this.list.model !== null) {
                    var index = this.list.selectedIndex;
                    switch(e.code) {
                        case "Enter"     : this.showPad(); break;
                        case "ArrowLeft" :
                        case "ArrowUp"   : if (index > 0) this.list.select(index - 1); break;
                        case "ArrowDown" :
                        case "ArrowRight": if (this.list.model.count() - 1 > index) this.list.select(index + 1); break;
                    }
                }
            };

            /**
             * Define key typed  events handler
             * @param  {zebkit.ui.event.KeyEvent} e a key event
             * @method keyTyped
             */
            this.keyTyped = function(e) {
                this.list.keyTyped(e);
            };

            /**
             * Set the given combo box selection view
             * @param {zebkit.ui.View} c a view
             * @method setSelectionView
             * @chainable
             */
            this.setSelectionView = function (c){
                if (c !== this.selectionView) {
                    this.selectionView = pkg.$view(c);
                    this.repaint();
                }
                return this;
            };

            /**
             * Set the maximal height of the combo box pad element.
             * @param {Integer} h a maximal combo box pad size
             * @method setMaxPadHeight
             * @chainable
             */
            this.setMaxPadHeight = function(h){
                if (this.maxPadHeight !== h) {
                    this.hidePad();
                    this.maxPadHeight = h;
                }
                return this;
            };

            /**
             * Make the commbo editable
             * @param {Boolean} b  true to make the combo ediatable
             * @chainable
             * @method setEditable
             */
            this.setEditable = function(b) {
                if (this.content === null || this.content.isEditable !== b) {
                    var ctr = "center";
                    if (this.content !== null) {
                        ctr = this.content.constraints;
                        this.content.removeMe();
                    }
                    this.add(ctr, b ? new this.clazz.EditableContentPan()
                                    : new this.clazz.ReadonlyContentPan());
                }
                return this;
            };

            /**
             * Combo box button listener method. The method triggers showing
             * combo box pad window when the combo button has been pressed
             * @param  {zebkit.ui.Button} src a button that has been pressed
             * @method fired
             */
            this.fired = function(src) {
                if ((new Date().getTime() - this.winpad.$closeTime) > 100) {
                    this.showPad();
                }
            };

            /**
             * Combo pad list listener method. Called every time an item in
             * combo pad list has been selected.
             * @param  {zebkit.ui.BaseList} src a list
             * @param  {Integer} data a selected index
             * @method selected
             * @protected
             */
            this.selected = function(src, data) {
                if (this.$lockListSelEvent === false) {
                    this.hidePad();
                    if (this.content !== null) {
                        this.content.comboValueUpdated(this, this.list.getSelected());
                        if (this.content.isEditable === true) {
                            this.content.requestFocus();
                        }
                        this.repaint();
                    }
                    this._.selected(this, data);
                }
            };
        },

        function focused(){
            this.$super();
            this.repaint();
        },

        function kidAdded(index, s, c){
            if (zebkit.instanceOf(c, pkg.Combo.ContentPan)) {
                if (this.content !== null) {
                    throw new Error("Content panel is set");
                }

                this.content = c;

                if (this.list !== null) {
                    c.comboValueUpdated(this, this.list.getSelected());
                }
            } else if (this.button === null) {
                this.button = c;
            }

            if (zebkit.instanceOf(c, zebkit.util.Fireable)) {
                c.on(this);
            }

            this.$super(index, s, c);
        },

        function kidRemoved(index,l) {
            if (zebkit.instanceOf(l, zebkit.util.Fireable)) {
                l.off(this);
            }

            if (this.content === l) {
                this.content = null;
            } else if (this.button === l) {
                this.button = null;
            }

            this.$super(index, l);
        },

        function setVisible(b) {
            if (b === false) {
                this.hidePad();
            }
            this.$super(b);
            return this;
        },

        function setParent(p) {
            if (p === null) this.hidePad();
            this.$super(p);
        }
    ]);
});
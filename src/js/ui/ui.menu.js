zebkit.package("ui", function(pkg, Class) {
    pkg.events.regEvents("menuItemSelected");

    /**
     * Menu event class
     * @constructor
     * @class zebkit.ui.MenuEvent
     * @extends {zebkit.util.Event}
     */
    pkg.MenuEvent = Class(zebkit.util.Event, [
        function $prototype() {
            /**
             * Index of selected menu item
             * @type {Integer}
             * @attribute index
             * @readOnly
             */
            this.index = -1;

            /**
             * Selected menu item component
             * @type {zebkit.ui.Panel}
             * @attribute item
             * @readOnly
             */
            this.item = null;

            /**
             * Fill menu event with specified parameters
             * @param  {zebkit.ui.Menu} src a source of the menu event
             * @param  {Integer} index an index of selected menu item
             * @param  {zebkit.ui.Panel} item a selected menu item
             * @protected
             * @chainable
             * @method $fillWith
             */
            this.$fillWith = function(src, index, item) {
                this.source = src;
                this.index  = index;
                this.item   = item;
                return this;
            };
        }
    ]);

    var MENU_EVENT = new pkg.MenuEvent();

    /**
     * Show the given popup menu.
     * @param  {zebkit.ui.Panel} context  an UI component of zebkit hierarchy
     * @param  {zebkit.ui.Menu}  menu a menu to be shown
     * @for  zebkit.ui
     * @method showPopupMenu
     */
    pkg.showPopupMenu = function(context, menu) {
        context.getCanvas().getLayer(pkg.PopupLayerMix.id).add(menu);
    };

    /**
     * Menu item panel class. The component holds menu item content like caption, icon, sub-menu
     * sign elements. The area of the component is split into three parts: left, right and center.
     * Central part keeps content, left side keeps checked sign element and the right side keeps
     * sub-menu sign element.
     * @param  {String|zebkit.ui.Panel} caption a menu item caption string or component. Caption
     * string can encode the item id, item icon and item checked state. For instance:
     *
     *   - **"Menu Item [@menu_item_id]"** - triggers creation of menu item component
     *     with "Menu Item" caption and "menu_item_id" id property value
     *   - **"[x] Menu Item"** - triggers creation of checked menu item component
     *     with checked on state
     *   - **"@('mypicture.gif') Menu Item"** - triggers creation of menu item
     *      component with "Menu Item" caption and loaded mypicture.gif icon
     *
     * @example
     *
     *
     *     // create menu item with icon and "Item 1" title
     *     var mi = new zebkit.ui.MenuItem("@('mypicture.gif') Item 1");
     *
     *
     * @class zebkit.ui.MenuItem
     * @extends {zebkit.ui.Panel}
     * @constructor
     */
    pkg.MenuItem = Class(pkg.Panel, [
        function (c) {
            this.$super();
            this.add(new this.clazz.CheckStatePan());

            if (zebkit.isString(c)) {
                var m = c.match(/(\s*\@\(.*\)\s*)?(\s*\[\s*\]|\s*\[\s*x\s*\]|\s*\(\s*x\s*\)|\s*\(\s*\))?\s*(.*)/);
                if (m === null) {
                    throw new Error("Invalid menu item: " + c);
                }

                if (typeof m[2] !== 'undefined') {
                    var s = m[2].trim();
                    this.setCheckManager(s[0] === '(' ? new pkg.Group() : new pkg.SwitchManager());
                    this.manager.setValue(this, m[2].indexOf('x') > 0);
                }

                var img = null;
                if (typeof m[1] !== 'undefined') {
                    img = m[1].substring(m[1].indexOf("@(") + 2, m[1].lastIndexOf(")")).trim();
                    if (img[0] === "'") {
                       img = img.substring(1, img.length-1);
                    } else {
                        var parts = img.split('.'),
                            scope = zebkit.$global;

                        img = null;
                        for (var i = 0; i < parts.length; i++) {
                            scope = scope[parts[i]];
                            if (typeof scope === 'undefined' || scope === null) {
                                break;
                            }
                        }
                        img = scope;
                    }
                }

                c = m[3];
                m = c.match(/(.*)\s*\[\s*@([a-zA-Z_][a-zA-Z0-9_]+)\s*]\s*/);
                if (m !== null) {
                    this.id = m[2].trim();
                    c       = m[1].trim();
                } else {
                    this.id = c.toLowerCase().replace(/[ ]+/, '_');
                }

                c = new pkg.ImageLabel(new this.clazz.Label(c), img);
            } else {
                this.getCheck().setVisible(false);
            }

            this.add(c);
            this.add(new this.clazz.SubImage());

            this.setEnabled(c.isEnabled);
            this.setVisible(c.isVisible);
        },

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
             * @type {zebkit.ui.SwitchManager | zebkit.ui.Group}
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
                if (zebkit.instanceOf(content, pkg.Checkbox)) {
                    content.setValue(!content.getValue());
                }

                if (this.manager !== null) {
                    this.manager.setValue(this, !this.manager.getValue(this));
                }
            };

            /**
             * Set the menu item icon.
             * @param {String|Image} img a path to an image or image object
             * @method setIcon
             * @chainable
             */
            this.setIcon = function(img) {
                this.getContent().setImage(img);
                return this;
            };

            /**
             * Set the menu item caption.
             * @param {String} caption a caption
             * @method setCaption
             * @chainable
             */
            this.setCaption = function(caption) {
                this.getContent().setCaption(caption);
                return this;
            };

            /**
             * Callback method that is called every time a checked state
             * of the menu item has been updated
             * @param {Boolean} b a new checked state
             * @method switched
             * @protected
             */
            this.switched = function(b) {
                this.kids[0].view.activate(b ? (this.isEnabled === true ? "on" : "on.disabled") : "off", this);
            };

            /**
             * Get check state component
             * @return {zebkit.ui.Panel} a check state component
             * @method getCheck
             * @protected
             */
            this.getCheck = function() {
                return this.kids[0];
            };

            /**
             * Get content component
             * @return {zebkit.ui.Panel} a content component
             * @method getContent
             * @protected
             */
            this.getContent = function() {
                return this.kids.length > 0 ? this.kids[1] : null;
            };

            /**
             * Get menu item child component to render sub item arrow element
             * @return {zebkit.ui.Panel} a sub item arrow component
             * @method getSub
             * @protected
             */
            this.getSub = function() {
                return this.kids.length > 1 ? this.kids[2] : null;
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
                if (this.parent !== null && this.parent.noSubIfEmpty === true) {
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

                if (left !== null && left.isVisible === true) {
                    left.toPreferredSize();
                    left.setLocation(l, t + Math.floor((eh - left.height)/2));
                    l += this.gap + left.width;
                    ew -= (this.gap + left.width);
                }

                if (right !== null && right.isVisible === true) {
                    right.toPreferredSize();
                    right.setLocation(target.width - target.getRight() - right.width,
                                      t + Math.floor((eh - right.height)/2));
                    ew -= (this.gap + right.width);
                }

                if (content !== null && content.isVisible === true) {
                    content.toPreferredSize();
                    if (content.width > ew) {
                        content.setSize(ew, content.height);
                    }
                    content.setLocation(l, t + Math.floor((eh - content.height)/2));
                }
            };

            /**
             * Set the menu item checked state
             * @param {Boolean} b a checked state
             * @method setCheckState
             * @chainable
             */
            this.setCheckState = function(b) {
                if (this.manager === null) {
                    this.setCheckManager(new pkg.SwitchManager());
                }
                this.manager.setValue(this, b);
                return this;
            };

            /**
             * Get menu item checked state
             * @return {Boolean} a menu item checked state
             * @method getCheckState
             */
            this.getCheckState = function() {
                return this.manager.getValue(this);
            };

            /**
             * Set the menu item checked state manager.
             * @param {zebkit.ui.SwitchManager|zebkit.ui.Group} man a switch manager
             * @method setCheckManager
             * @chainable
             */
            this.setCheckManager = function(man) {
                if (this.manager !== man) {
                    if (this.manager !== null) {
                        this.manager.uninstall(this);
                    }
                    this.manager = man;
                    this.manager.install(this);
                }
                return this;
            };
        },

        /**
         * Override setParent method to catch the moment when the
         * item is inserted to a menu
         * @param {zebkit.ui.Panel} p a parent
         * @method setParent
         */
        function setParent(p) {
            this.$super(p);
            if (p !== null && p.noSubIfEmpty === true) {
                this.getSub().setVisible(false);
            }
        },

        function setEnabled(b) {
            this.$super(b);
            // sync menu item enabled state with checkable element state
            if (this.manager !== null) {
                this.switched(this.manager.getValue(this));
            }
            return this;
        }
    ]).hashable();

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
     * @class zebkit.ui.Menu
     * @constructor
     * @param {Object} [list] menu items description
     * @extends {zebkit.ui.CompList}
     */
    pkg.Menu = Class(pkg.CompList, [
        function (d) {
            this.menus = {};

            this.$super([], zebkit.isBoolean(d) ? d : true);

            if (Array.isArray(d)) {
                for(var i = 0; i < d.length; i++) {
                    this.add(d[i]);
                }
            } else {
                for(var k in d) {
                    if (d.hasOwnProperty(k)) {
                        var sub = d[k];
                        this.add(k);
                        if (sub != null) {
                            this.setMenuAt(this.kids.length - 1, zebkit.instanceOf(sub, pkg.Menu) ? sub : new pkg.Menu(sub));
                        }
                    }
                }
            }
        },

        function $clazz() {
            this.MenuItem = Class(pkg.MenuItem, [
                function $clazz() {
                    this.Label = Class(pkg.MenuItem.Label, []);
                }
            ]);

            this.Line = Class(pkg.Line, []);
            this.Line.prototype.$isDecorative = true;
        },

        function $prototype() {
            this.$parentMenu = null;

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
                return this.kids[i].$isDecorative === true || this.kids[i].$$isDecorative === true;
            };

            /**
             * Define component events handler.
             * @param  {zebkit.ui.CompEvent} e  a component event
             * @method  childCompEnabled
             */
            this.childCompEnabled = this.childCompShown = function(e) {
                var src = e.source;
                for(var i = 0;i < this.kids.length; i++){
                    if (this.kids[i] === src) {
                        // clear selection if an item becomes not selectable
                        if (this.isItemSelectable(i) === false) {
                            if (i === this.selectedIndex) this.select(-1);
                        }
                        break;
                    }
                }
            };

            /**
             * Get a menu item by the given index
             * @param  {Integer} i a menu item index
             * @return {zebkit.ui.Panel} a menu item component
             * @method getMenuItem
             */
            this.getMenuItem = function(i) {
                if (zebkit.isString(i) === true) {
                    var item = this.byPath(i);
                    if (item !== null) return item;
                    for (var k in this.menus) {
                        item = this.menus[k].getMenuItem(i);
                        if (item !== null) return item;
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
                for(var i = 0; i < this.kids.length; i++) {
                    if (this.isItemSelectable(i)) return true;
                }
                return false;
            };

            /**
             * Define pointer exited events handler
             * @param  {zebkit.ui.PointerEvent} e a pointer event
             * @method pointerExited
             */
            this.pointerExited = function(e){
                this.position.setOffset(null);
            };

            /**
             * Get a sub menu for the given menu item
             * @param  {Integer} index a menu item index
             * @return {zebkit.ui.Menu} a sub menu or null if no sub menu
             * is defined for the given menu item
             * @method getMenuAt
             */
            this.getMenuAt = function(index) {
                if (index < this.kids.length) {
                    var hash = this.kids[index].$hash$;
                    return this.menus.hasOwnProperty(hash) ? this.menus[hash] : null;
                } else {
                    return null;
                }
            };

            /**
             * Set the given menu as a sub-menu for the specified menu item
             * @param {Integer} i an index of a menu item for that a sub menu
             * has to be attached
             * @param {zebkit.ui.Menu} m a sub menu to be attached
             * @method setMenuAt
             * @chainable
             */
            this.setMenuAt = function (i, m) {
                if (m === this) {
                    throw new Error("Menu cannot be sub-menu of its own");
                }

                if (this.isDecorative(i)) {
                    throw new Error("Decorative element cannot have a sub-menu");
                }

                var p = this.kids[i];
                if (typeof p.activateSub !== 'undefined') {
                    var sub = this.menus[p];
                    if (m !== null) {
                        if (sub == null) {
                            p.activateSub(true);
                        }
                    } else if (sub != null) {
                        p.activateSub(false);
                    }
                }

                // if the menu is shown and the menu item is selected
                if (this.parent !== null && i === this.selectedIndex) {
                    this.select(-1);
                }

                if (typeof p.$hash$ === 'undefined') {
                    throw new Error("Invalid key");
                }

                this.menus[p] = m;
                return this;
            };

            /**
             * Get the specified sub-menu index
             * @param  {zebkit.ui.Menu} menu a sub menu
             * @return {Integer} a sub menu index. -1 if the menu is
             * not a sub menu of the given menu
             * @method indexMenuOf
             */
            this.indexMenuOf = function(menu) {
                for(var i = 0; i < this.kids.length; i++) {
                    if (this.menus[this.kids[i]] === menu) {
                        return i;
                    }
                }
                return -1;
            };

            /**
             * Called when the menu or a sub-menu has been canceled (key ESCAPE has been pressed).
             * @param  {zebkit.ui.Menu} m a menu (or sub menu) that has been canceled
             * @method $canceled
             * @protected
             */
            this.$canceled = function(m) {
                if (this.$parentMenu !== null && typeof this.$canceled !== 'undefined') {
                    this.$parentMenu.$canceled(m);
                }
            };

            /**
             * Get the top menu in the given shown popup menu hierarchy
             * @return {zebkit.ui.Menu} a top menu
             * @method $topMenu
             * @protected
             */
            this.$topMenu = function() {
                if (this.parent !== null) {
                    var t = this,
                        p = null;

                    while ((p = t.$parentMenu) !== null) t = p;
                    return t;
                }
                return null;
            };

            this.doScroll = function(dx, dy, source) {
                var sy = this.scrollManager.getSY(),
                    ps = this.layout.calcPreferredSize(this),
                    eh = this.height - this.getTop() - this.getBottom();

                if (this.height < ps.height && sy + ps.height >= eh && sy - dy <= 0) {
                    var nsy = sy - dy;
                    if (nsy + ps.height < eh) {
                        nsy = eh - ps.height;
                    }
                    if (sy !== nsy) this.scrollManager.scrollYTo(nsy);
                }
            };

            /**
             * Hide the menu and all visible sub-menus
             * @method $hideMenu
             * @protected
             */
            this.$hideMenu = function() {
                if (this.parent !== null) {
                    var ch = this.$childMenu();
                    if (ch !== null) {
                        ch.$hideMenu();
                    }

                    this.removeMe();
                    this.select(-1);
                }
            };

            /**
             * Get a sub menu that is shown at the given moment.
             * @return {zebkit.ui.Menu} a child sub menu. null if no child sub-menu
             * has been shown
             * @method $childMenu
             * @protected
             */
            this.$childMenu = function() {
                if (this.parent !== null) {
                    for(var k in this.menus) {
                        var m = this.menus[k];
                        if (m.$parentMenu === this) {
                            return m;
                        }
                    }
                }
                return null;
            };

            /**
             * Show the given sub menu
             * @param  {zebkit.ui.Menu} sub a sub menu to be shown
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
                return this.getMenuAt(i) !== null && this.$triggeredByPointer === true;
            };
        },

        /**
         * Override key pressed events handler to handle key events according to
         * context menu component requirements
         * @param  {zebkit.ui.KeyEvent} e a key event
         * @method keyPressed
         */
        function keyPressed(e){
            if (e.code === "Escape") {
                if (this.parent !== null) {
                    var p = this.$parentMenu;
                    this.$canceled(this);
                    this.$hideMenu();
                    if (p !== null) p.requestFocus();
                }
            } else {
                this.$super(e);
            }
        },

        function insert(i, ctr, c) {
            if (zebkit.isString(c)) {
                return this.$super(i, ctr, (c.match(/^\-+$/) !== null) ? new this.clazz.Line()
                                                                       : new this.clazz.MenuItem(c));
            }
            return this.$super(i, ctr, c);
        },

        function setParent(p) {
            if (p !== null) {
                this.select(-1);
                this.position.setOffset(null);
            } else {
                this.$parentMenu = null;
            }
            this.$super(p);
        },

        /**
         * Add the specified component as a decorative item of the menu
         * @param {zebkit.ui.Panel} c an UI component
         * @method addDecorative
         */
        function addDecorative(c) {
            if (c.$isDecorative !== true) {
                c.$$isDecorative = true;
            }
            this.$getSuper("insert").call(this, this.kids.length, null, c);
        },

        function kidRemoved(i, c) {
            if (typeof c.$$isDecorative !== 'undefined') {
                delete c.$$isDecorative;
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
                if (this.selectedIndex >= 0  && off !== this.selectedIndex) {
                    var sub = this.getMenuAt(this.selectedIndex);
                    if (sub !== null) {
                        sub.$hideMenu();
                        rs = -1; // request to clear selection
                        this.requestFocus();
                    }
                }

                // request fire selection if the menu is shown and position has moved to new place
                if (this.parent !== null && off !== this.selectedIndex && this.isItemSelectable(off)) {
                    if (this.triggerSelectionByPos(off)) rs = off;
                }

                if (rs !== null) {
                    this.select(rs);
                }
            }

            this.$super(target, prevOffset, prevLine, prevCol);
        },

        function fireSelected(prev) {
            if (this.parent !== null) {
                var sub = null;

                if (this.selectedIndex >= 0) {
                    sub = this.getMenuAt(this.selectedIndex);
                    if (sub !== null) { // handle sub menu here
                        if (sub.parent !== null) {
                            // hide menu since it has been already shown
                            sub.$hideMenu();
                        } else {
                            // show menu
                            sub.$parentMenu = this;
                            this.$showSubMenu(sub);
                        }
                    } else {
                        // handle an item menu selection here.
                        // hide the whole menu hierarchy
                        var k = this.kids[this.selectedIndex];
                        if (typeof k.itemSelected !== 'undefined') {
                            k.itemSelected();
                        }

                        // an atomic menu, what means a menu item has been selected
                        // remove this menu an all parents menus
                        var top = this.$topMenu();
                        if (top !== null) {
                            top.$hideMenu();
                        }
                    }

                    pkg.events.fire("menuItemSelected",
                                     MENU_EVENT.$fillWith(this,
                                                          this.selectedIndex,
                                                          this.kids[this.selectedIndex]));
                } else if (prev >= 0) {
                    // hide child menus if null item has been selected
                    sub = this.getMenuAt(prev);
                    if (sub !== null && sub.parent !== null) {
                        // hide menu since it has been already shown
                        sub.$hideMenu();
                    }

                    pkg.events.fire("menuItemSelected",
                                     MENU_EVENT.$fillWith(this,
                                                          this.selectedIndex,
                                                          this.kids[prev]));
                }
            }
            this.$super(prev);
        }
    ]);

    /**
     * Menu bar UI component class. Menu bar can be build in any part of UI application.
     * There is no restriction regarding the placement of the component.

            var canvas = new zebkit.ui.zCanvas(300,200);
            canvas.setLayout(new zebkit.layout.BorderLayout());

            var mbar = new zebkit.ui.Menubar({
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

            canvas.root.add("bottom", mbar);

     * @class zebkit.ui.Menubar
     * @constructor
     * @extends zebkit.ui.Menu
     */
    pkg.Menubar = Class(pkg.Menu, [
        function $clazz() {
            this.MenuItem = Class(pkg.MenuItem, [
                function $clazz() {
                    this.Label = Class(pkg.MenuItem.Label, []);
                },

                function(c) {
                    this.$super(c);
                    this.hideSub();
                    this.getCheck().setVisible(false);
                }
            ]);
        },

        function $prototype() {
            this.canHaveFocus = false;

            this.triggerSelectionByPos = function (i) {
                return this.isItemSelectable(i) && this.selectedIndex >= 0;
            };

            // making menu bar not removable from its layer by overriding the method
            this.$hideMenu = function() {
                var child = this.$childMenu();
                if (child !== null) {
                    child.$hideMenu();
                }

                this.select(-1);
            };

            this.$showSubMenu = function(menu) {
                var d   = this.getCanvas(),
                    k   = this.kids[this.selectedIndex],
                    pop = d.getLayer(pkg.PopupLayer.id);

                if (menu.hasSelectableItems()) {
                    var abs = zebkit.layout.toParentOrigin(0, 0, k);
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

        // called when an item is selected by user with pointer click or key
        function $select(i) {
            // if a user again pressed the same item consider it as
            // de-selection
            if (this.selectedIndex >= 0 && this.selectedIndex === i) {
                i = -1;
            }

            this.$super(i);
        }
    ]);

    pkg.PopupLayerLayout = Class(zebkit.layout.Layout, [
        function $prototype() {
            this.calcPreferredSize = function (target){
                return { width:0, height:0 };
            };

            this.doLayout = function(target) {
                for(var i = 0; i < target.kids.length; i++){
                    var m = target.kids[i];
                    if (zebkit.instanceOf(m, pkg.Menu)) {
                        var ps = m.getPreferredSize(),
                            xx = (m.x + ps.width  > target.width ) ? target.width  - ps.width  : m.x,
                            yy = (m.y + ps.height > target.height) ? target.height - ps.height : m.y;

                        m.setSize(ps.width, ps.height);
                        if (xx < 0) xx = 0;
                        if (yy < 0) yy = 0;
                        m.setLocation(xx, yy);
                    }
                }
            };
        }
    ]);

    /**
     * UI popup layer class. Special layer implementation to show
     * context menu. Normally the layer is not used directly.
     * @class zebkit.ui.PopupLayerMix
     * @constructor
     * @extends {zebkit.ui.HtmlCanvas}
     */
    pkg.PopupLayerMix = zebkit.Interface([
        function $clazz() {
            this.id = "popup";
        },

        function $prototype() {
            this.$prevFocusOwner = null;

            this.getFocusRoot = function() {
                return this;
            };

            this.childFocusGained = function(e) {
                if (zebkit.instanceOf(e.source, pkg.Menu)) {
                    if (e.related !== null && zebkit.layout.isAncestorOf(this, e.related) === false ) {
                        this.$prevFocusOwner = e.related;
                    }
                } else {
                    // means other than menu type of component grabs the focus
                    // in this case we should not restore focus when the popup
                    // component will be removed
                    this.$prevFocusOwner = null;
                }


                // save the focus owner whose owner was not a pop up layer
                if (e.related !== null && zebkit.layout.isAncestorOf(this, e.related) === false && zebkit.instanceOf(e.source, pkg.Menu)) {
                    this.$prevFocusOwner = e.related;
                }
            };

            this.isTriggeredWith = function(e) {
                return e.isAction() === false && (e.identifier === "rmouse" || e.touchCounter === 2);
            };

            /**
             * Define children components input events handler.
             * @param  {zebkit.ui.KeyEvent} e an input event
             * @method childKeyPressed
             */
            this.childKeyPressed = function(e){
                var p = e.source.$parentMenu;
                if (typeof p !== 'undefined' && p !== null) {
                    switch (e.code) {
                        case "ArrowRight" :
                            if (p.selectedIndex < p.model.count() - 1) {
                                p.requestFocus();
                                p.position.seekLineTo("down");
                            }
                            break;
                        case "ArrowLeft" :
                            if (p.selectedIndex > 0) {
                                p.requestFocus();
                                p.position.seekLineTo("up");
                            }
                            break;
                    }
                }
            };

            this.$topMenu = function() {
                if (this.kids.length > 0) {
                    for (var i = this.kids.length - 1; i >= 0; i--) {
                        if (zebkit.instanceOf(this.kids[i], pkg.Menu)) {
                            return this.kids[i].$topMenu();
                        }
                    }
                }
                return null;
            };

            this.compRemoved = function(e) {
                // if last component has been removed and the component is a menu
                // than try to restore focus owner
                if (this.$prevFocusOwner !== null && this.kids.length === 0 && zebkit.instanceOf(e.kid, pkg.Menu)) {

                    console.log(">>>> return focus back : " + (this.$prevFocusOwner===null?"null":this.$prevFocusOwner.clazz.$name) + "," + document.activeElement + "," + document.activeElement.id);
                    this.$prevFocusOwner.requestFocus();
                    this.$prevFocusOwner = null;
                }
            };

            this.layerPointerClicked = function (e) {
                if (this.kids.length === 0 && this.isTriggeredWith(e)) {
                    var popup = null;
                    if (typeof e.source.popup !== 'undefined' && e.source.popup !== null) {
                        popup = e.source.popup;
                    } else if (typeof e.source.getPopup !== 'undefined') {
                        popup = e.source.getPopup(e.source, e.x, e.y);
                    }

                    if (popup !== null) {
                        popup.setLocation(e.absX, e.absY);
                        this.add(popup);
                        popup.requestFocus();
                    }

                    return true;
                }
                return false;
            };
        },

        function layerPointerPressed(e) {
            // if a shown menu exists
            if (this.kids.length > 0) {
                // if pressed has happened over a popup layer no a menu
                if (this.$getSuper("getComponentAt").call(this, e.x, e.y) === this) {
                    var top = this.$topMenu();
                    if (top !== null) {
                        // if top menu is menu bar. menu bar is located in other layer
                        // we need check if the pressed has happened not over the
                        // menu bar
                        if (zebkit.instanceOf(top, pkg.Menubar)) {
                            var origin = zebkit.layout.toParentOrigin(top);
                            if (e.x >= origin.x && e.y >= origin.y && e.x < origin.x + top.width && e.y < origin.y + top.height) {
                                return;
                            }
                        }

                        // hide all shown menu
                        top.$hideMenu();
                    }

                    // still have a pop up components, than remove it
                    if (this.kids.length > 0) {
                        this.removeAll();
                    }
                }
            }
        },

        function getComponentAt(x, y) {
            // if there is a component on popup layer and the component is
            // not the popup layer itself than return the component otherwise
            // return null what delegates getComponentAt() to other layer
            if (this.kids.length > 0) {
                var comp = this.$super(x, y);
                if (comp !== this) {
                    return comp;
                }
            }
            return null;
        }
    ]);

    pkg.PopupLayer = Class(pkg.Panel, pkg.PopupLayerMix, []);
});
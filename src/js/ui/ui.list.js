zebkit.package("ui", function(pkg, Class) {
    /**
     * Base UI list component class that has to be extended with a
     * concrete list component implementation. The list component
     * visualizes list data model (zebkit.data.ListModel).
     * @class  zebkit.ui.BaseList
     * @constructor
     * @param {zebkit.data.ListModel|Array} [m] a list model that should be passed as an instance
     * of zebkit.data.ListModel or as an array.
     * @param {Boolean} [b] true if the list navigation has to be triggered by
     * pointer cursor moving
     * @extends zebkit.ui.Panel
     * @uses zebkit.util.Position.Metric
     * @uses zebkit.ui.DecorationViews
     */

    /**
     * Fire when a list item has been selected:
     *
     *     list.on("selected", function(src, prev) {
     *         ...
     *     });
     *
     * @event selected
     * @param {zebkit.ui.BaseList} src a list that triggers the event
     * @param {Integer|Object} prev a previous selected index, return null if the selected item has been re-selected
     */
    pkg.BaseList = Class(pkg.Panel, zebkit.util.Position.Metric, pkg.DecorationViews, [
        function (m, b) {
            if (arguments.length === 0) {
                m = [];
                b = false;
            } else if (arguments.length === 1) {
                if (zebkit.isBoolean(m))  {
                    b = m;
                    m = [];
                } else {
                    b = false;
                }
            } else if (m === null) {
                m = [];
            }

            /**
             * Currently selected list item index
             * @type {Integer}
             * @attribute selectedIndex
             * @default -1
             * @readOnly
             */
            this.selectedIndex = -1;

            /**
             * Indicate the current mode the list items selection has to work
             * @readOnly
             * @default false
             * @attribute isComboMode
             * @type {Boolean}
             */
            this.isComboMode = b;

            /**
             * Scroll manager
             * @attribute scrollManager
             * @readOnly
             * @protected
             * @type {zebkit.ui.ScrollManager}
             */
            this.scrollManager = new pkg.ScrollManager(this);

            this.$super();

            // position manager should be set before model initialization
            this.setPosition(new zebkit.util.Position(this));

            /**
             * List model
             * @readOnly
             * @attribute model
             */
            this.setModel(m);
        },

        function $prototype() {
            this.scrollManager = null;

            /**
             * Makes the component focusable
             * @attribute canHaveFocus
             * @type {Boolean}
             * @default true
             */
            this.canHaveFocus = true;

            /**
             * List model the component visualizes
             * @attribute model
             * @type {zebkit.data.ListModel}
             * @readOnly
             */
            this.model = null;

            /**
             * Position manager.
             * @attribute position
             * @type {zebkit.util.Position}
             * @readOnly
             */
            this.position = null;

            /**
             * Select the specified list item.
             * @param {Object} v a list item to be selected. Use null as
             * the parameter value to clean an item selection
             * @return {Integer} an index of a selected item
             * @method setValue
             */
            this.setValue = function(v) {
                if (v === null) {
                    this.select(-1);
                } else if (this.model !== null) {
                    for(var i = 0; i < this.model.count(); i++) {
                        if (this.model.get(i) === v && this.isItemSelectable(i)) {
                            this.select(i);
                            return i;
                        }
                    }
                }
                return -1;
            };

            /**
             * Get the list component selected item
             * @return {Object} a selected item
             * @method getValue
             */
            this.getValue = function() {
                return this.getSelected();
            };

            /**
             * Test if the given item is selectable.
             * @param  {Integer}  i an item index
             * @return {Boolean}  true if the given item is selectable
             * @method isItemSelectable
             */
            this.isItemSelectable = function(i) {
                return true;
            };

            /**
             * Get selected list item
             * @return {Object} an item
             * @method getSelected
             */
            this.getSelected = function() {
                return this.selectedIndex < 0 ? null
                                              : this.model.get(this.selectedIndex);
            };

            /**
             * Lookup a list item buy the given first character
             * @param  {String} ch a first character to lookup
             * @return {Integer} a position of found list item in the list or -1 if no item is found.
             * @method lookupItem
             * @protected
             */
            this.lookupItem = function(ch){
                var count = this.model === null ? 0 : this.model.count();
                if (zebkit.util.isLetter(ch) && count > 0){
                    var index = this.selectedIndex < 0 ? 0 : this.selectedIndex + 1;
                    ch = ch.toLowerCase();
                    for(var i = 0;i < count - 1; i++){
                        var idx  = (index + i) % count,
                            item = this.model.get(idx).toString();

                        if (this.isItemSelectable(idx) && item.length > 0 && item[0].toLowerCase() === ch) {
                            return idx;
                        }
                    }
                }
                return -1;
            };

            /**
             * Test if the given list item is selected
             * @param  {Integer}  i an item index
             * @return {Boolean}  true if the item with the given index is selected
             * @method isSelected
             */
            this.isSelected = function(i) {
                return i === this.selectedIndex;
            };

            /**
             * Called when a pointer (pointer or finger on touch screen) is moved
             * to a new location
             * @param  {Integer} x a pointer x coordinate
             * @param  {Integer} y a pointer y coordinate
             * @method $pointerMoved
             * @protected
             */
            this.$pointerMoved = function(x, y){
                if (this.isComboMode === true && this.model !== null) {
                    var index = this.getItemIdxAt(x, y);
                    if (index !== this.position.offset && (index < 0 || this.isItemSelectable(index) === true)) {
                        this.$triggeredByPointer = true;

                        if (index < 0) {
                            this.position.setOffset(null);
                        } else {
                            this.position.setOffset(index);
                        }
                        this.makeItemVisible(index);
                        this.$triggeredByPointer = false;
                    }
                }
            };

            /**
             * Return the given list item location.
             * @param  {Integer} i a list item index
             * @return {Object}  a location of the list item. The result is object that
             * has the following structure:
                    { x:{Integer}, y:{Integer} }
             * @method getItemLocation
             */
            this.getItemLocation = function(index) {
                this.validate();

                var y = this.getTop() + this.scrollManager.getSY();
                for(var i = 0; i < index; i++) {
                    y += this.getItemSize(i).height;
                }

                return { x:this.getLeft(), y:y };
            };

            /**
             * Return the given list item size.
             * @param  {Integer} i a list item index
             * @return {Object}  a size of the list item. The result is object that
             * has the following structure:
                    { width:{Integer}, height:{Integer} }
             * @method getItemSize
             */
            this.getItemSize = function(i) {
                throw new Error("Not implemented");
            };

            this.getLines = function() {
                return this.model === null ? 0 : this.model.count();
            };

            this.getLineSize = function(l) {
                return 1;
            };

            this.getMaxOffset = function() {
                return this.getLines() - 1;
            };

            this.catchScrolled = function(psx, psy) {
                this.repaint();
            };

            /**
             * Detect an item by the specified location
             * @param  {Integer} x a x coordinate
             * @param  {Integer} y a y coordinate
             * @return {Integer} a list item that is located at the given position.
             * -1 if no any list item can be found.
             * @method getItemIdxAt
             */
            this.getItemIdxAt = function(x,y) {
                return -1;
            };

            /**
             * Calculate maximal width and maximal height the items in the list have
             * @protected
             * @return {Integer} a max items size
             * @method calcMaxItemSize
             */
            this.calcMaxItemSize = function (){
                var maxH = 0,
                    maxW = 0;

                this.validate();
                if (this.model !== null) {
                    for(var i = 0;i < this.model.count(); i++){
                        var is = this.getItemSize(i);
                        if (is.height > maxH) {
                            maxH = is.height;
                        }

                        if (is.width  > maxW) {
                            maxW = is.width;
                        }
                    }
                }
                return { width:maxW, height:maxH };
            };

            /**
             * Force repainting of the given list items
             * @protected
             * @param  {Integer} p an index of the first list item to be repainted
             * @param  {Integer} n an index of the second list item to be repainted
             * @method repaintByOffsets
             */
            this.repaintByOffsets = function(p, n) {
                this.validate();
                var xx    = this.width - this.getRight(),
                    l     = 0,
                    count = this.model === null ? 0
                                                : this.model.count();

                if (p >= 0 && p < count){
                    l = this.getItemLocation(p);
                    this.repaint(l.x, l.y, xx - l.x, this.getItemSize(p).height);
                }

                if (n >= 0 && n < count){
                    l = this.getItemLocation(n);
                    this.repaint(l.x, l.y, xx - l.x, this.getItemSize(n).height);
                }
            };

            /**
             * Draw the given list view element identified by the given id
             * on the given list item.
             * @param  {CanvasRenderingContext2D} g     a graphical context
             * @param  {String}     id    a view id
             * @param  {Integer}    index a list item index
             * @protected
             * @method drawViewAt
             */
            this.drawViewAt = function(g, id, index) {
                if (index >= 0 && this.views.hasOwnProperty(id) && this.views[id] !== null && this.isItemSelectable(index)) {
                    var is  = this.getItemSize(index),
                        l   = this.getItemLocation(index);

                    this.drawView(g, id, this.views[id],
                                  l.x, l.y,
                                  is.width ,
                                  is.height);
                }
            };

            /**
             * Draw the given list view element identified by the given id
             * at the specified location.
             * @param  {CanvasRenderingContext2D} g     a graphical context
             * @param  {String}     id    a view id
             * @param  {Integer}    x a x coordinate the view has to be drawn
             * @param  {Integer}    y a y coordinate the view has to be drawn
             * @param  {Integer}    w a view width
             * @param  {Integer}    h a view height
             * @protected
             * @method drawView
             */
            this.drawView = function(g, id, v, x, y, w ,h) {
                this.views[id].paint(g, x, y, w, h, this);
            };

            this.update = function(g) {
                if (this.isComboMode === true || this.hasFocus() === true)  {
                    this.drawViewAt(g, "marker", this.position.offset);
                }
                this.drawViewAt(g, "select", this.selectedIndex);
            };

            this.paintOnTop = function(g) {
                if (this.isComboMode === true || this.hasFocus())  {
                    this.drawViewAt(g, "topMarker", this.position.offset);
                }
            };

            /**
             * Select the given list item
             * @param  {Integer} index an item index to be selected
             * @method select
             */
            this.select = function(index){
                if (index === null || index === undefined) {
                    throw new Error("Null index");
                }

                if (this.model !== null && index >= this.model.count()){
                    throw new RangeError(index);
                }

                if (this.selectedIndex !== index) {
                    if (index < 0 || this.isItemSelectable(index)) {
                        var prev = this.selectedIndex;
                        this.selectedIndex = index;
                        this.makeItemVisible(index);
                        this.repaintByOffsets(prev, this.selectedIndex);
                        this.fireSelected(prev);
                    }
                } else {
                    this.fireSelected(null);
                }
            };

            /**
             * Fire selected event
             * @param  {Integer|null} prev a previous selected item index. null if the
             * same item has been re-selected
             * @method fireSelected
             * @protected
             */
            this.fireSelected = function(prev) {
                this.fire("selected", [this, prev]);
            };

            this.pointerClicked = function(e) {
                if (this.model !== null && e.isAction() && this.model.count() > 0) {
                    this.$select(this.position.offset < 0 ? 0 : this.position.offset);
                }
            };

            this.pointerReleased = function(e){
                if (this.model !== null    &&
                    this.model.count() > 0 &&
                    e.isAction()           &&
                    this.position.offset !== this.selectedIndex)
                {
                    this.position.setOffset(this.selectedIndex);
                }
            };

            this.pointerPressed = function(e){
                if (e.isAction() && this.model !== null && this.model.count() > 0) {
                    var index = this.getItemIdxAt(e.x, e.y);
                    if (index >= 0 && this.position.offset !== index && this.isItemSelectable(index)) {
                        this.position.setOffset(index);
                    }
                }
            };

            this.pointerDragged = this.pointerMoved = this.pointerEntered = function(e){
                this.$pointerMoved(e.x, e.y);
            };

            this.pointerExited = function(e){
                this.$pointerMoved(-10, -10);
            };

            this.pointerDragEnded = function(e){
                if (this.model !== null && this.model.count() > 0 && this.position.offset >= 0) {
                    this.select(this.position.offset < 0 ? 0 : this.position.offset);
                }
            };

            this.keyPressed = function(e){
                if (this.model !== null && this.model.count() > 0){
                    switch(e.code) {
                        case "End":
                            if (e.ctrlKey) {
                                this.position.setOffset(this.position.metrics.getMaxOffset());
                            } else {
                                this.position.seekLineTo("end");
                            }
                            break;
                        case "Home":
                            if (e.ctrlKey) {
                                this.position.setOffset(0);
                            } else {
                                this.position.seekLineTo("begin");
                            }
                            break;
                        case "ArrowRight": this.position.seek(1); break;
                        case "ArrowDown" : this.position.seekLineTo("down"); break;
                        case "ArrowLeft" : this.position.seek(-1);break;
                        case "ArrowUp"   : this.position.seekLineTo("up");break;
                        case "PageUp"    : this.position.seek(this.pageSize(-1));break;
                        case "PageDown"  : this.position.seek(this.pageSize(1));break;
                        case "Space"     :
                        case "Enter"     : this.$select(this.position.offset); break;
                    }
                }
            };

            /**
             * Select the given list item. The method is called when an item
             * selection is triggered by a user interaction: key board, or pointer
             * @param  {Integer} o an item index
             * @method $select
             * @protected
             */
            this.$select = function(o) {
                this.select(o);
            };

            /**
             * Define key typed events handler
             * @param  {zebkit.ui.event.KeyEvent} e a key event
             * @method keyTyped
             */
            this.keyTyped = function (e){
                var i = this.lookupItem(e.key);
                if (i >= 0) {
                    this.$select(i);
                }
            };

            this.elementInserted = function(target, e,index){
                this.invalidate();
                if (this.selectedIndex >= 0 && this.selectedIndex >= index) {
                    this.selectedIndex++;
                }
                this.position.inserted(index, 1);
                this.repaint();
            };

            this.elementRemoved = function(target, e,index){
                this.invalidate();
                if (this.selectedIndex === index || this.model.count() === 0) {
                    this.select(-1);
                } else {
                    if (this.selectedIndex > index) {
                        this.selectedIndex--;
                    }
                }
                this.position.removed(index, 1);
                this.repaint();
            };

            this.elementSet = function (target, e, pe,index){
                if (this.selectedIndex === index) {
                    this.select(-1);
                }
                this.vrp();
            };

            /**
             * Find a next selectable list item starting from the given offset
             * with the specified direction
             * @param  {Integer} off a start item index to perform search
             * @param  {Integer} d   a direction increment. Cam be -1 or 1
             * @return {Integer} a next selectable item index
             * @method findSelectable
             * @protected
             */
            this.findSelectable = function(off, d) {
                var c = this.model.count(), i = 0, dd = Math.abs(d);
                while (this.isItemSelectable(off) === false && i < c) {
                    off = (c + off + d) % c;
                    i += dd;
                }
                return i < c ? off : -1;
            };

            this.posChanged = function (target, prevOffset, prevLine, prevCol) {
                var off = this.position.offset;
                if (off >= 0) {
                    off = this.findSelectable(off, prevOffset < off ? 1 : -1);

                    if (off !== this.position.offset) {
                        this.position.setOffset(off);
                        this.repaintByOffsets(prevOffset, off);
                        return;
                    }
                }

                if (this.isComboMode === true) {
                    this.makeItemVisible(off);
                } else {
                    this.select(off);
                }

                // this.makeItemVisible(off);
                this.repaintByOffsets(prevOffset, off);
            };

            /**
             * Set the list model to be rendered with the list component
             * @param {zebkit.data.ListModel} m a list model
             * @method setModel
             * @chainable
             */
            this.setModel = function (m){
                if (m !== this.model){
                    if (m !== null && Array.isArray(m)) {
                        m = new zebkit.data.ListModel(m);
                    }

                    if (this.model !== null) {
                        this.model.off(this);
                    }

                    this.model = m;

                    if (this.model !== null) {
                        this.model.on(this);
                    }

                    this.vrp();
                }
                return this;
            };

            /**
             * Set the given position controller. List component uses position to
             * track virtual cursor.
             * @param {zebkit.util.Position} c a position
             * @method setPosition
             * @chainable
             */
            this.setPosition = function(c) {
                if (c !== this.position) {
                    if (this.position !== null) {
                        this.position.off(this);
                    }
                    this.position = c;
                    this.position.on(this);
                    this.position.setMetric(this);
                    this.repaint();
                }

                return this;
            };

            /**
             * Set the list items view provider. Defining a view provider allows developers
             * to customize list item rendering.
             * @param {Object|Function} v a view provider class instance or a function that
             * says which view has to be used for the given list model data. The function
             * has to satisfy the following method signature: "function(list, modelItem, index)"
             * @method setViewProvider
             * @chainable
             */
            this.setViewProvider = function (v){
                if (this.provider !== v) {
                    if (typeof v === "function") {
                        var o = new zebkit.Dummy();
                        o.getView = v;
                        v = o;
                    }

                    this.provider = v;
                    this.vrp();
                }
                return this;
            };

            /**
             * Scroll if necessary the given item to make it visible
             * @param  {Integer} index an item index
             * @chainable
             * @method makeItemVisible
             */
            this.makeItemVisible = function (index){
                if (index >= 0 && this.scrollManager !== null) {
                    this.validate();
                    var is = this.getItemSize(index);

                    if (is.width > 0 && is.height > 0) {
                        var l = this.getItemLocation(index);
                        this.scrollManager.makeVisible(l.x - this.scrollManager.getSX(),
                                                       l.y - this.scrollManager.getSY(),
                                                       is.width, is.height);
                    }
                }
                return this;
            };

            this.makeSelectedVisible = function(){
                if (this.selectedIndex >= 0) {
                    this.makeItemVisible(this.selectedIndex);
                }
                return this;
            };

            /**
             * The method returns the page size that has to be scroll up or down
             * @param  {Integer} d a scrolling direction. -1 means scroll up, 1 means
             * scroll down
             * @return {Integer} a number of list items to be scrolled
             * @method pageSize
             * @protected
             */
            this.pageSize = function(d){
                var offset = this.position.offset;
                if (offset >= 0) {
                    var vp = pkg.$cvp(this, {});
                    if (vp !== null) {
                        var sum = 0, i = offset;
                        for(;i >= 0 && i <= this.position.metrics.getMaxOffset() && sum < vp.height; i += d){
                            sum += (this.getItemSize(i).height);
                        }
                        return i - offset - d;
                    }
                }
                return 0;
            };
        },

        /**
         * Sets the views for the list visual elements. The following elements are
         * supported:
         *
         *   - "select" -  a selection view element
         *   - "topMarker" - a position marker view element that is rendered  on top of list item
         *   - "marker" - a position marker view element
         *
         * @param {Object} views view elements
         * @method setViews
         */
        function focused(){
            this.$super();
            this.repaint();
        }
    ]).events("selected");

    /**
     * The class is list component implementation that visualizes zebkit.data.ListModel.
     * It is supposed the model can have any type of items. Visualization of the items
     * is customized by defining a view provider.
     *
     * The general use case:

            // create list component that contains three item
            var list = new zebkit.ui.List([
                "Item 1",
                "Item 2",
                "Item 3"
            ]);

            ...
            // add new item
            list.model.add("Item 4");

            ...
            // remove first item
            list.model.removeAt(0);


     * To customize list items views you can redefine item view provider as following:

            // suppose every model item is an array that contains two elements,
            // first element points to the item icon and the second element defines
            // the list item text
            var list = new zebkit.ui.List([
                [ "icon1.gif", "Caption 1" ],
                [ "icon2.gif", "Caption 1" ],
                [ "icon3.gif", "Caption 1" ]
            ]);

            // define new list item views provider that represents every
            // list model item as icon with a caption
            list.setViewProvider(new zebkit.ui.List.ViewProvider([
                function getView(target, i, value) {
                    var caption = value[1];
                    var icon    = value[0];
                    return new zebkit.ui.CompRender(new zebkit.ui.ImageLabel(caption, icon));
                }
            ]));

     * @class  zebkit.ui.List
     * @extends zebkit.ui.BaseList
     * @constructor
     * @param {zebkit.data.ListModel|Array} [model] a list model that should be passed as an instance
     * of zebkit.data.ListModel or as an array.
     * @param {Boolean} [isComboMode] true if the list navigation has to be triggered by
     * pointer cursor moving
     */
    pkg.List = Class(pkg.BaseList, [
        function (m, b){
            /**
             * Index of the first visible list item
             * @readOnly
             * @attribute firstVisible
             * @type {Integer}
             * @private
             */
            this.firstVisible = -1;

            /**
             * Y coordinate of the first visible list item
             * @readOnly
             * @attribute firstVisibleY
             * @type {Integer}
             * @private
             */
            this.firstVisibleY = this.psWidth_ = this.psHeight_ = 0;

            /**
             * Internal flag to track list items visibility status. It is set
             * to false to trigger list items metrics and visibility recalculation
             * @attribute visValid
             * @type {Boolean}
             * @private
             */
            this.visValid = false;
            this.setViewProvider(new this.clazz.ViewProvider());
            this.$supera(arguments);
        },

        function $clazz() {
            /**
             * List view provider class. This implementation renders list item using string
             * render. If a list item is an instance of "zebkit.draw.View" class than it will
             * be rendered as the view.
             * @class zebkit.ui.List.ViewProvider
             * @extends zebkit.draw.BaseViewProvider
             * @constructor
             */
            this.ViewProvider = Class(zebkit.draw.BaseViewProvider, []);

            this.Item = Class([
                function(value, caption) {
                    this.value = value;
                    if (arguments.length > 1) {
                        this.caption = caption;
                    } else {
                        this.caption = value;
                    }
                },

                function $prototype() {
                    this.toString = function() {
                        return this.caption;
                    };
                }
            ]);

            this.ItemViewProvider = Class(zebkit.draw.BaseViewProvider, [
                function getView(t, i, v) {
                    if (v !== null) {
                        if (typeof v.getCaption === 'function') {
                            v = v.getCaption();
                        } else if (v.caption !== undefined) {
                            v = v.caption;
                        }
                    }
                    return this.$super(t, i, v);
                }

            ]);

            /**
             * @for zebkit.ui.List
             */
        },

        function $prototype() {
            this.heights = this.widths = this.vArea = null;

            /**
             * Extra list item side gaps
             * @type {Integer}
             * @attribute gap
             * @default 2
             * @readOnly
             */
            this.gap = 2;

            /**
             * Set the left, right, top and bottom a list item paddings
             * @param {Integer} g a left, right, top and bottom a list item paddings
             * @method setItemGap
             * @chainable
             */
            this.setItemGap = function(g){
                if (this.gap !== g){
                    this.gap = g;
                    this.vrp();
                }
                return this;
            };

            this.paint = function(g){
                this.vVisibility();
                if (this.firstVisible >= 0){
                    var sx = this.scrollManager.getSX(),
                        sy = this.scrollManager.getSY();

                    try {
                        g.translate(sx, sy);
                        var y        = this.firstVisibleY,
                            x        = this.getLeft(),
                            yy       = this.vArea.y + this.vArea.height - sy,
                            count    = this.model.count(),
                            dg       = this.gap * 2;

                        for (var i = this.firstVisible; i < count; i++){
                            if (i !== this.selectedIndex && typeof this.provider.getCellColor === 'function') {
                                var bc = this.provider.getCellColor(this, i);
                                if (bc !== null) {
                                    g.setColor(bc);
                                    g.fillRect(x, y, this.width, this.heights[i]);
                                }
                            }

                            this.provider.getView(this, i, this.model.get(i))
                                         .paint(g, x + this.gap, y + this.gap,
                                                   this.widths[i] - dg,
                                                   this.heights[i]- dg, this);

                            y += this.heights[i];
                            if (y > yy) {
                                break;
                            }
                        }

                        g.translate(-sx,  -sy);
                    } catch(e) {
                        g.translate(-sx,  -sy);
                        throw e;
                    }
                }
            };

            this.recalc = function(){
                this.psWidth_ = this.psHeight_ = 0;
                if (this.model !== null) {
                    var count = this.model.count();
                    if (this.heights === null || this.heights.length !== count) {
                        this.heights = Array(count);
                    }

                    if (this.widths  === null || this.widths.length  !== count) {
                        this.widths = Array(count);
                    }

                    var provider = this.provider;
                    if (provider !== null) {
                        var dg = 2*this.gap;
                        for(var i = 0;i < count; i++){
                            var ps = provider.getView(this, i, this.model.get(i)).getPreferredSize();
                            this.heights[i] = ps.height + dg;
                            this.widths [i] = ps.width  + dg;

                            if (this.widths[i] > this.psWidth_) {
                                this.psWidth_ = this.widths[i];
                            }
                            this.psHeight_ += this.heights[i];
                        }
                    }
                }
            };

            this.calcPreferredSize = function(l){
                return { width : this.psWidth_,
                         height: this.psHeight_ };
            };

            this.vVisibility = function(){
                this.validate();
                var prev = this.vArea;
                this.vArea = pkg.$cvp(this, {});

                if (this.vArea === null) {
                    this.firstVisible = -1;
                } else  {
                    if (this.visValid === false ||
                        (prev === null || prev.x !== this.vArea.x ||
                         prev.y !== this.vArea.y || prev.width !== this.vArea.width ||
                         prev.height !== this.vArea.height))
                    {
                        var top = this.getTop();
                        if (this.firstVisible >= 0){
                            var dy = this.scrollManager.getSY();
                            while (this.firstVisibleY + dy >= top && this.firstVisible > 0){
                                this.firstVisible--;
                                this.firstVisibleY -= this.heights[this.firstVisible];
                            }
                        } else {
                            this.firstVisible  = 0;
                            this.firstVisibleY = top;
                        }

                        if (this.firstVisible >= 0) {
                            var count = this.model === null ? 0 : this.model.count(),
                                hh    = this.height - this.getBottom();

                            for(; this.firstVisible < count; this.firstVisible++) {
                                var y1 = this.firstVisibleY + this.scrollManager.getSY(),
                                    y2 = y1 + this.heights[this.firstVisible] - 1;

                                if ((y1 >= top && y1 < hh) || (y2 >= top && y2 < hh) || (y1 < top && y2 >= hh)) {
                                    break;
                                }

                                this.firstVisibleY += (this.heights[this.firstVisible]);
                            }

                            if (this.firstVisible >= count) {
                                this.firstVisible =  -1;
                            }
                        }
                        this.visValid = true;
                    }
                }
            };

            this.getItemLocation = function(index){
                this.validate();
                var y = this.getTop() + this.scrollManager.getSY();
                for(var i = 0; i < index; i++) {
                    y += this.heights[i];
                }
                return { x:this.getLeft(), y : y };
            };

            this.getItemSize = function(i){
                this.validate();
                return { width:this.widths[i], height:this.heights[i] };
            };

            this.getItemIdxAt = function(x,y){
                this.vVisibility();
                if (this.vArea !== null && this.firstVisible >= 0) {
                    var yy    = this.firstVisibleY + this.scrollManager.getSY(),
                        hh    = this.height - this.getBottom(),
                        count = this.model.count();

                    for (var i = this.firstVisible; i < count; i++) {
                        if (y >= yy && y < yy + this.heights[i]) {
                            return i;
                        }

                        yy += (this.heights[i]);
                        if (yy > hh) {
                            break;
                        }
                    }
                }
                return  -1;
            };
        },

        function invalidate(){
            this.visValid = false;
            this.firstVisible = -1;
            this.$super();
        },

        function drawView(g,id,v,x,y,w,h) {
            this.$super(g, id, v, x, y, this.width - this.getRight() - x, h);
        },

        function catchScrolled(psx,psy){
            this.firstVisible = -1;
            this.visValid = false;
            this.$super(psx, psy);
        }
    ]);

    /**
     * List component consider its children UI components as a list model items. Every added to the component
     * UI children component becomes a list model element. The implementation allows developers to use
     * other UI components as its elements what makes list item view customization very easy and powerful:
     *
     *     // use image label as the component list items
     *     var list = new zebkit.ui.CompList();
     *     list.add(new zebkit.ui.ImageLabel("Caption 1", "icon1.gif"));
     *     list.add(new zebkit.ui.ImageLabel("Caption 2", "icon2.gif"));
     *     list.add(new zebkit.ui.ImageLabel("Caption 3", "icon3.gif"));
     *
     *
     * @class zebkit.ui.CompList
     * @constructor
     * @extends zebkit.ui.BaseList
     * @param {zebkit.data.ListModel|Array} [model] a list model that should be passed as an instance
     * of zebkit.data.ListModel or as an array.
     * @param {Boolean} [isComboMode] true if the list navigation has to be triggered by
     * pointer cursor moving
     */
    pkg.CompList = Class(pkg.BaseList, [
        function (m, b) {
            this.model = this;

            this.setViewProvider(new zebkit.Dummy([
                function $prototype() {
                    this.render = new pkg.CompRender();
                    this.getView = function (target,i, obj) {
                        this.render.setValue(obj);
                        return this.render;
                    };
                }
            ]));

            this.$supera(arguments);
        },

        function $clazz() {
            this.Label      = Class(pkg.Label, []);
            this.ImageLabel = Class(pkg.ImageLabel, []);
        },

        function $prototype() {
            this.max = null;

            this.get = function(i) {
                if (i < 0 || i >= this.kids.length) {
                    throw new RangeError(i);
                }
                return this.kids[i];
            };

            this.contains = function (c) {
                return this.indexOf(c) >= 0;
            };

            this.count = function () {
                return this.kids.length;
            };

            this.catchScrolled = function(px, py) {};

            this.getItemLocation = function(i) {
                return { x:this.kids[i].x, y:this.kids[i].y };
            };

            this.getItemSize = function(i) {
                return this.kids[i].isVisible === false ? { width:0, height: 0 }
                                                        : { width:this.kids[i].width, height:this.kids[i].height};
            };

            this.recalc = function (){
                this.max = zebkit.layout.getMaxPreferredSize(this);
            };

            this.calcMaxItemSize = function() {
                this.validate();
                return { width:this.max.width, height:this.max.height };
            };

            this.getItemIdxAt = function(x, y) {
                return zebkit.layout.getDirectAt(x, y, this);
            };

            this.isItemSelectable = function(i) {
                return this.model.get(i).isVisible === true &&
                       this.model.get(i).isEnabled === true;
            };

            this.catchInput = function (child){
                if (this.isComboMode !== true) {
                    var p = child;
                    while (p !== this) {
                        if (p.stopCatchInput === true) {
                            return false;
                        }
                        p = p.parent;
                    }
                }
                return true;
            };

            this.setModel = function(m){
                if (Array.isArray(m)) {
                    for(var i = 0; i < m.length; i++) {
                        this.add(m[i]);
                    }
                } else {
                    throw new Error("Invalid comp list model");
                }

                return this;
            };
        },

        function setPosition(c){
            if (c !== this.position){
                if (zebkit.instanceOf(this.layout, zebkit.util.Position.Metric)) {
                    c.setMetric(this.layout);
                }
                this.$super(c);
            }
            return this;
        },

        function setLayout(layout){
            if (layout !== this.layout){
                this.scrollManager = new pkg.ScrollManager(this, [
                    function $prototype() {
                        this.calcPreferredSize = function(t) {
                            return layout.calcPreferredSize(t);
                        };

                        this.doLayout = function(t){
                            layout.doLayout(t);
                            for(var i = 0; i < t.kids.length; i++){
                                var kid = t.kids[i];
                                if (kid.isVisible === true) {
                                    kid.setLocation(kid.x + this.getSX(),
                                                    kid.y + this.getSY());
                                }
                            }
                        };

                        this.scrollStateUpdated = function(sx,sy,px,py){
                            this.target.vrp();
                        };
                    }
                ]);

                this.$super(this.scrollManager);
                if (this.position !== null) {
                    this.position.setMetric(zebkit.instanceOf(layout, zebkit.util.Position.Metric) ? layout : this);
                }
            }

            return this;
        },

        function setAt(i, item) {
            if (i < 0 || i >= this.kids.length) {
                throw new RangeError(i);
            }
            return this.$super(i, item);
        },

        function insert(i, constr, e) {
            if (arguments.length === 2) {
                e = constr;
                constr = null;
            }

            if (i < 0 || i > this.kids.length) {
                throw new RangeError(i);
            }
            return this.$super(i, constr, zebkit.instanceOf(e, pkg.Panel) ? e : new this.clazz.Label("" + e));
        },

        function kidAdded(index,constr,e){
            this.$super(index,constr,e);
            this.model.fire("elementInserted", [this, e, index]);
        },

        function kidRemoved(index,e) {
            this.$super(index,e);
            this.model.fire("elementRemoved", [this, e, index]);
        }
    ]).events("elementInserted", "elementRemoved", "elementSet");
});
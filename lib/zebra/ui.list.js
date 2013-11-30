(function(pkg, Class) {

/**
 * @module ui
*/

var L = zebra.layout, Position = zebra.util.Position, KE = pkg.KeyEvent, Listeners = zebra.util.Listeners;

/**
 * Base UI list component class that has to be extended with a 
 * concrete list component implementation. The list component 
 * visualizes list model.
 * @class  zebra.ui.BaseList
 * @extends {zebra.ui.Panel}
 */

/**
 * Fire when a list item has been selected:
        
        list._.add(function(src, prev) {
            ...
        });

 * @event selected
 * @param {zebra.ui.BaseList} src a list that triggers the event
 * @param {Ineteger} prev a previous selected index
 */
pkg.BaseList = Class(pkg.Panel, pkg.MouseListener, pkg.KeyListener, Position.Metric, [
    function $prototype() {
        this.gap = 2;

        /**
         * Selected list item index
         * @type {Integer}
         * @readOnly
         * @attribute selectedIndex
         */
        
        /**
         * List model the component visualizes
         * @attribute model
         * @type {zebra.data.ListModel}
         * @readOnly
         */

        /**
         * Select the specified list item. 
         * @param {Object} v a list item to be selected. Use null as 
         * the parameter value to clean an item selection
         * @method setValue 
         */
        this.setValue = function(v) {
            if (v == null) {
                this.select(-1);
                return;
            }

            for(var i=0; i<this.model.count(); i++) {
                if (this.model.get(i) == v) {
                    this.select(i);
                    return;
                }
            }

            throw new Error("Invalid value : " + v);
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
         * Get a value that defines left, right, top and bottom list item gaps.  
         * @return {Integer} an item gap
         * @method getItemGap
         */
        this.getItemGap = function() {
            return this.gap;
        };

        /**
         * Get selected list item
         * @return {Object} an item 
         * @method getSelected
         */
        this.getSelected = function(){
            return this.selectedIndex < 0 ? null
                                          : this.model.get(this.selectedIndex);
        };

        this.lookupItem = function(ch){
            var count = this.model == null ? 0 : this.model.count();
            if (zebra.util.isLetter(ch) && count > 0){
                var index = this.selectedIndex < 0 ? 0 : this.selectedIndex + 1;
                ch = ch.toLowerCase();
                for(var i = 0;i < count - 1; i++){
                    var idx = (index + i) % count, item = this.model.get(idx).toString();
                    if (item.length > 0 && item[0].toLowerCase() == ch) return idx;
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
            return i == this.selectedIndex; 
        };

        this.correctPM = function(x,y){
            if (this.isComboMode){
                var index = this.getItemIdxAt(x, y);
                if (index >= 0 && index != this.position.offset) {
                    this.position.setOffset(index);
                    this.notifyScrollMan(index);
                }
            }
        };

        /**
         * Return the given list item location. 
         * @param  {Integer} i a list item index
         * @return {Object}  a location of the list item. The result is object that 
         * has the following structure:
                { x:Integer, y:Integer}
         * @method getItemLocation
         */
        this.getItemLocation = function(i) {
            this.validate();
            var gap = this.getItemGap(), y = this.getTop() + this.scrollManager.getSY() + gap;
            for(var i = 0;i < index; i++) y += (this.getItemSize(i).height + 2 * gap);
            return { x:this.getLeft(), y:y };
        };

        /**
         * Return the given list item size. 
         * @param  {Integer} i a list item index
         * @return {Object}  a size of the list item. The result is object that 
         * has the following structure:
                { width:Integer, height:Integer}
         * @method getItemLocation
         */
        this.getItemSize = function (i){
            return this.provider.getView(this, this.model.get(i), i).getPreferredSize();
        };

        this.mouseMoved   = function(e){ this.correctPM(e.x, e.y); };

        this.getLines     = function() { return this.model.count();};
        this.getLineSize  = function(l){ return 1; };
        this.getMaxOffset = function (){ return this.getLines() - 1; };
        this.canHaveFocus = function (){ return true; };

        this.catchScrolled = function(psx,psy){ this.repaint();};
       
        /**
         * Detect an item by the specified location
         * @param  {Integer} x a x coordinate
         * @param  {Integer} y a y coordinate
         * @return {Integer} a list item that is located at the given position. -1 if no any list item can be 
         * found.
         * @method getItemIdxAt   
         */
        this.getItemIdxAt = function(x,y){ return -1;};

        /**
         * Calculate maximal width and maximal height the items in the list have
         * @protected
         * @return {Integer} a max items size
         * @method calcMaxItemSize
         */
        this.calcMaxItemSize = function (){
            var maxH = 0, maxW = 0;
            this.validate();
            if (this.model != null) {
                for(var i = 0;i < this.model.count(); i ++ ){
                    var is = this.getItemSize(i);
                    if(is.height > maxH) maxH = is.height;
                    if(is.width  > maxW) maxW = is.width;
                }
            }
            return { width:maxW, height:maxH };
        };

        /**
         * Force repainting of the given list items 
         * @protected
         * @param  {Integer} p an index of the first list item to be repainted
         * @param  {Integer} n an index of the second list item to be repainted
         * @method  repaintByOffsets
         */
        this.repaintByOffsets = function(p,n){
            this.validate();
            var xx = this.width - this.getRight(),
                gap = this.getItemGap(),
                count = this.model == null ? 0 : this.model.count();

            if (p >= 0 && p < count){
                var l = this.getItemLocation(p), x = l.x - gap;
                this.repaint(x, l.y - gap, xx - x, this.getItemSize(p).height + 2 * gap);
            }

            if (n >= 0 && n < count){
                var l = this.getItemLocation(n), x = l.x - gap;
                this.repaint(x, l.y - gap, xx - x, this.getItemSize(n).height + 2 * gap);
            }
        };

        this.update = function(g) {
            if (this.selectedIndex >= 0 && this.views["select"] != null){
                var gap = this.getItemGap(),
                    is  = this.getItemSize(this.selectedIndex),
                    l   = this.getItemLocation(this.selectedIndex);

                this.drawSelMarker(g, l.x - gap, l.y - gap,
                                   is.width + 2 * gap,
                                   is.height + 2 * gap);
            }
        };

        this.paintOnTop = function(g) {
            if (this.views["marker"] != null && (this.isComboMode || this.hasFocus())){
                var offset = this.position.offset;
                if (offset >= 0){
                    var gap = this.getItemGap(),
                        is  = this.getItemSize(offset),
                        l   = this.getItemLocation(offset);

                    this.drawPosMarker(g, l.x - gap, l.y - gap,
                                          is.width  + 2 * gap, is.height + 2 * gap);
                }
            }
        };

        /**
         * Select the given list item
         * @param  {Integer} index an item index to be selected
         * @method select
         */
        this.select = function(index){
            if (this.model != null && index >= this.model.count()){
                throw new Error("index=" + index + ",max=" + this.model.count());
            }

            if (this.selectedIndex != index){
                var prev = this.selectedIndex;
                this.selectedIndex = index;
                this.notifyScrollMan(index);
                this.repaintByOffsets(prev, this.selectedIndex);
                this._.fired(this, prev);
            }
            else {
                this._.fired(this, null);
            }
        };

        this.mouseClicked = function(e) {
            if (this.model != null && e.isActionMask() && this.model.count() > 0) {
                this.select(this.position.offset < 0 ? 0 : this.position.offset);
            }
        };

        this.mouseReleased = function(e){
            if (this.model != null     &&
                this.model.count() > 0 &&
                e.isActionMask()       &&
                this.position.offset != this.selectedIndex)
            {
                this.position.setOffset(this.selectedIndex);
            }
        };

        this.mousePressed = function(e){
            if (e.isActionMask() && this.model != null && this.model.count() > 0) { //&& this.isComboMode === false) {
                var index = this.getItemIdxAt(e.x, e.y);
                if (index >= 0 && this.position.offset != index) {
                    this.position.setOffset(index);
                }
            }
        };

        this.mouseEntered  = function(e){
            this.correctPM(e.x, e.y);
        };

        this.keyPressed = function(e){
            if (this.model != null && this.model.count() > 0){
                var po = this.position.offset;
                switch(e.code) {
                    case KE.END:
                        if (e.isControlPressed()) {
                            this.position.setOffset(this.position.metrics.getMaxOffset());
                        }
                        else {
                            this.position.seekLineTo(Position.END);
                        }
                        break;
                    case KE.HOME:
                        if (e.isControlPressed()) this.position.setOffset(0);
                        else this.position.seekLineTo(Position.BEG);
                        break;
                    case KE.RIGHT    : this.position.seek(1); break;
                    case KE.DOWN     : this.position.seekLineTo(Position.DOWN); break;
                    case KE.LEFT     : this.position.seek(-1);break;
                    case KE.UP       : this.position.seekLineTo(Position.UP);break;
                    case KE.PAGEUP   : this.position.seek(this.pageSize(-1));break;
                    case KE.PAGEDOWN : this.position.seek(this.pageSize(1));break;
                    case KE.SPACE    :
                    case KE.ENTER    : this.select(this.position.offset);break;
                }

                if (po != this.position.offset) {
                    if (this.isComboMode) {
                        this.notifyScrollMan(this.position.offset);
                    }
                    else {
                        this.select(this.position.offset);
                    }
                }
            }
        };

        this.keyTyped = function (e){
            var i = this.lookupItem(e.ch);
            if (i >= 0) this.select(i);
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
            if (this.selectedIndex == index || this.model.count() === 0) {
                this.select(-1);
            }
            else {
                if (this.selectedIndex > index) {
                    this.selectedIndex--;
                }
            }
            this.position.removed(index, 1);
            this.repaint();
        };

        this.elementSet = function (target, e, pe,index){
            this.invalidate();
            this.repaint();
        };

        this.posChanged = function (target,prevOffset,prevLine,prevCol){
            var off = this.position.offset;
          //  this.notifyScrollMan(off);
            this.repaintByOffsets(prevOffset, off);
        };

        this.drawSelMarker = function (g,x,y,w,h) {
            if (this.views["select"]) this.views["select"].paint(g, x, y, w, h, this);
        };

        this.drawPosMarker = function (g,x,y,w,h) {
            if (this.views["marker"]) this.views["marker"].paint(g, x, y, w, h, this);
        };

        /**
         * Set the left, right, top and bottom a list item paddings
         * @param {Integer} g a left, right, top and bottom a list item paddings
         * @method setItemGap
         */
        this.setItemGap = function(g){
            if (this.gap != g){
                this.gap = g;
                this.vrp();
            }
        };

        /**
         * Set the list model to be rendered with the list component
         * @param {zebra.data.ListModel} m a list model
         * @method setModel
         */
        this.setModel = function (m){
            if (m != this.model){
                if (m != null && Array.isArray(m)) {
                    m = new zebra.data.ListModel(m);
                }

                if (this.model != null && this.model._) this.model._.remove(this);
                this.model = m;
                if (this.model != null && this.model._) this.model._.add(this);
                this.vrp();
            }
        };

        /**
         * Set the given position controller. List component uses position to 
         * track virtual cursor.
         * @param {zebra.util.Position} c a position 
         * @method setPosition
         */
        this.setPosition = function(c){
            if (c != this.position) {
                if (this.position != null) this.position._.remove(this);
                this.position = c;
                this.position._.add(this);
                this.position.setMetric(this);
                this.repaint();
            }
        };

        /**
         * Set the list items view provider. Defining a view provider allows developers
         * to customize list item rendering.  
         * @param {Object|Function} v a view provider class instance or a function that 
         * says which view has to be used for the given list model data. The function 
         * has to satisfy the following method signature: "function(list, modelItem, index)"
         * @method setViewProvider
         */
        this.setViewProvider = function (v){
            if (this.provider != v){
                if (typeof v  == "function") {
                    var o = new zebra.Dummy();
                    o.getView = v;
                    v = o;
                }

                this.provider = v;
                this.vrp();
            }
        };

        this.notifyScrollMan = function (index){
            if (index >= 0 && this.scrollManager != null) {
                this.validate();
                var gap = this.getItemGap(),
                    dx = this.scrollManager.getSX(), dy = this.scrollManager.getSY(),
                    is = this.getItemSize(index), l = this.getItemLocation(index);

                this.scrollManager.makeVisible(l.x - dx - gap, l.y - dy - gap,
                                               is.width + 2 * gap, is.height + 2 * gap);
            }
        };

        this.pageSize = function(d){
            var offset = this.position.offset;
            if (offset >= 0) {
                var vp = pkg.$cvp(this, {});
                if (vp != null) {
                    var sum = 0, i = offset, gap = 2 * this.getItemGap();
                    for(;i >= 0 && i <= this.position.metrics.getMaxOffset() && sum < vp.height; i += d){
                        sum += (this.getItemSize(i).height + gap);
                    }
                    return i - offset - d;
                }
            }
            return 0;
        };
    },

    function (m, b){
        /**
         * Currently selected list item index 
         * @type {Integer}
         * @attribute selectedIndex
         * @default -1
         * @readOnly
         */
        this.selectedIndex = -1;
        
        this._ = new Listeners();
        this.isComboMode = b;

        /**
         * Scroll manager
         * @attribute scrollManager
         * @readOnly
         * @type {zebra.ui.ScrollManager}
         */
        this.scrollManager = new pkg.ScrollManager(this);
        this.$super();

        // position manager should be set before model initialization
        this.setPosition(new Position(this));

        /**
         * List model
         * @readOnly
         * @attribute model
         */
        this.setModel(m);
    },

    function focused(){
        this.$super();
        this.repaint();
    }
]);
pkg.BaseList.prototype.setViews = pkg.$ViewsSetter;

/**
 * The class is list component implementation that visualizes zebra.data.ListModel. 
 * It is supposed the model can have any type of items. Visualization of the items 
 * is customized by defining a view provider. 
 * @class  zebra.ui.List
 * @extends zebra.ui.BaseList
 * @constructor
 * @param {zebra.data.ListModel|Array} [model] a list model that should be passed as an instance
 * of zebra.data.ListModel or as an array.
 * @param {Boolean} [isComboMode] true if the list navigation has to be triggered by 
 * mouse cursor moving
 */
pkg.List = Class(pkg.BaseList, [
    function $clazz() {
        /**
         * List view provider class. This implementation renders list item using string 
         * render. If a list item is an instance of "zebra.ui.View" class than it will 
         * be rendered as the view.
         * @class zebra.ui.List.ViewProvider
         * @constructor
         * @param {String|zebra.ui.Font} [f] a font to render list item text
         * @param {String} [c] a color to render list item text
         */
        this.ViewProvider = Class([
            function $prototype() {
                this[''] = function(f, c) {
                    /**
                     * Reference to text render that is used to paint a list items
                     * @type {zebra.ui.TextRender}
                     * @attribute text
                     * @readOnly
                     */

                    this.text = new pkg.TextRender("");
                    if (f != null) this.text.setFont(f);
                    if (c != null) this.text.setColor(c);
                };

                /**
                 * Get a view for the given model data element of the
                 * specified list component 
                 * @param  {zebra.ui.List} target a list component
                 * @param  {Object} value  a data model value
                 * @return {zebra.ui.View}  a view to be used to render 
                 * the given list component item
                 * @method getView
                 */
                this.getView = function(target, value, i) {
                    if (value && value.paint) return value;
                    this.text.target.setValue(value == null ? "<null>" : value.toString());
                    return this.text;
                };
            }
        ]);

        /**
         * @for zebra.ui.List
         */
    },

    function $prototype() {
        this.paint = function(g){
            this.vVisibility();
            if (this.firstVisible >= 0){
                var sx = this.scrollManager.getSX(), sy = this.scrollManager.getSY();
                try {
                    g.translate(sx, sy);
                    var gap      = this.getItemGap(),
                        y        = this.firstVisibleY,
                        x        = this.getLeft() + gap,
                        yy       = this.vArea.y + this.vArea.height - sy,
                        count    = this.model.count(),
                        provider = this.provider;

                    for(var i = this.firstVisible; i < count; i++){
                        if (i != this.selectedIndex && provider.getCellColor) {
                            var bc = provider.getCellColor(this, i);
                            if (bc != null) {
                                g.setColor(bc);
                                g.fillRect(x - gap,
                                           y - gap, 
                                           this.width,
                                           this.heights[i] + 2*gap);
                            }
                        }
                        provider.getView(this, this.model.get(i), i).paint(g, x, y, this.widths[i], this.heights[i], this);
                        y += (this.heights[i] + 2 * gap);
                        if (y > yy) break;
                    }
                }
                catch(e) {
                    throw e;
                }
                finally {
                    g.translate(-sx,  -sy);
                }
            }
        };

        this.recalc = function(){
            this.psWidth_ = this.psHeight_ = 0;
            if (this.model != null) {
                var count = this.model.count();
                if (this.heights == null || this.heights.length != count) {
                    this.heights = Array(count);
                }

                if (this.widths  == null || this.widths.length  != count) {
                    this.widths  = Array(count);
                }

                var provider = this.provider;
                if (provider != null) {
                    for(var i = 0;i < count; i++){
                        var ps = provider.getView(this, this.model.get(i), i).getPreferredSize();
                        this.heights[i] = ps.height;
                        this.widths [i] = ps.width;
                        if (this.widths[i] > this.psWidth_) {
                            this.psWidth_ = this.widths[i];
                        }
                        this.psHeight_ += this.heights[i];
                    }
                }
            }
        };

        this.calcPreferredSize = function(l){
            var gap = 2 * this.getItemGap();
            return { width:gap + this.psWidth_,
                     height: this.model == null ? 0 : gap * this.model.count() + this.psHeight_ };
        };

        this.vVisibility = function(){
            this.validate();
            var prev = this.vArea;
            this.vArea = pkg.$cvp(this, {});

            if (this.vArea == null) {
                this.firstVisible = -1;
                return;
            }

            if (this.visValid === false ||
                (prev == null || prev.x != this.vArea.x ||
                 prev.y != this.vArea.y || prev.width != this.vArea.width ||
                 prev.height != this.vArea.height))
            {
                var top = this.getTop(), gap = this.getItemGap();
                if (this.firstVisible >= 0){
                    var dy = this.scrollManager.getSY();
                    while (this.firstVisibleY + dy >= top && this.firstVisible > 0){
                        this.firstVisible--;
                        this.firstVisibleY -= (this.heights[this.firstVisible] + 2 * gap);
                    }
                }
                else {
                    this.firstVisible = 0;
                    this.firstVisibleY = top + gap;
                }

                if (this.firstVisible >= 0){
                    var count = this.model == null ? 0 : this.model.count(), hh = this.height - this.getBottom();

                    for(; this.firstVisible < count; this.firstVisible++)
                    {
                        var y1 = this.firstVisibleY + this.scrollManager.getSY(),
                            y2 = y1 + this.heights[this.firstVisible] - 1;

                        if ((y1 >= top && y1 < hh) || (y2 >= top && y2 < hh) || (y1 < top && y2 >= hh)) {
                            break;
                        }

                        this.firstVisibleY += (this.heights[this.firstVisible] + 2 * gap);
                    }

                    if (this.firstVisible >= count) this.firstVisible =  -1;
                }
                this.visValid = true;
            }
        };

        this.getItemLocation = function(index){
            this.validate();
            var gap = this.getItemGap(), y = this.getTop() + this.scrollManager.getSY() + gap;
            for(var i = 0;i < index; i++) {
                y += (this.heights[i] + 2 * gap);
            }
            return { x:this.getLeft() + this.getItemGap(), y:y };
        };

        this.getItemSize = function(i){
            this.validate();
            return { width:this.widths[i], height:this.heights[i] };
        };

        this.getItemIdxAt = function(x,y){
            this.vVisibility();
            if (this.vArea != null && this.firstVisible >= 0) {
                var yy    = this.firstVisibleY + this.scrollManager.getSY(),
                    hh    = this.height - this.getBottom(),
                    count = this.model.count(),
                    gap   = this.getItemGap(),
                    dgap  = gap * 2;

                for(var i = this.firstVisible; i < count; i++) {
                    if (y >= yy - gap && y < yy + this.heights[i] + dgap) {
                        return i;
                    }
                    yy += (this.heights[i] + dgap);
                    if (yy > hh) break;
                }
            }
            return  -1;
        };
    },

    function() {
        this.$this(false);
    },

    function (m) {
        if (zebra.isBoolean(m)) this.$this([], m);
        else this.$this(m, false);
    },

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
        this.heights = this.widths = this.vArea = null;
        
        /**
         * Internal flag to track list items visibility status. It is set 
         * to false to trigger list items metrics and visibility recalculation 
         * @attribute visValid 
         * @type {Boolean}
         * @private
         */
        this.visValid = false;
        this.setViewProvider(new pkg.List.ViewProvider());
        this.$super(m, b);
    },

    function invalidate(){
        this.visValid = false;
        this.firstVisible = -1;
        this.$super();
    },

    function drawSelMarker(g,x,y,w,h){
        this.$super(g, x, y, this.width - this.getRight() - x, h);
    },

    function drawPosMarker(g,x,y,w,h){
        this.$super(g, x, y, this.width - this.getRight() - x, h);
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
 * other UI components as its elements what makes list item view customization very easy and powerful.
 * @class zebra.ui.CompList
 * @extends zebra.ui.BaseList
 * @param {zebra.data.ListModel|Array} [model] a list model that should be passed as an instance
 * of zebra.data.ListModel or as an array.
 * @param {Boolean} [isComboMode] true if the list navigation has to be triggered by 
 * mouse cursor moving 
 */
pkg.CompList = Class(pkg.BaseList, pkg.Composite, [
    function $clazz() {
        this.Label      = Class(pkg.Label, []);
        this.ImageLabel = Class(pkg.ImageLabel, []);
        var CompListModelListeners = Listeners.Class("elementInserted", "elementRemoved");

        this.CompListModel = Class([
            function $prototype() {
                this.get = function (i) { return this.src.kids[i]; };

                this.set = function(item,i){
                    this.src.removeAt(i);
                    this.src.insert(i, null, item);
                };

                this.add = function(o){ this.src.add(o); };
                this.removeAt = function (i){ this.src.removeAt(i);};
                this.insert = function (item,i){ this.src.insert(i, null, item); };
                this.count = function (){ return this.src.kids.length; };
                this.removeAll = function () { this.src.removeAll(); };
            },

            function(src) {
                this.src = src;
                this._ = new CompListModelListeners();
            }
        ]);
    },

    function $prototype() {
        this.catchScrolled = function(px,py) {};

        this.getItemLocation = function(i) {
            var gap = this.getItemGap();
            return { x:this.kids[i].x + gap, y:this.kids[i].y + gap };
        };

        this.getItemSize = function (i) {
            var gap = this.getItemGap();
            return { width:this.kids[i].width - 2 * gap, height:this.kids[i].height -  2 * gap };
        };

        this.recalc = function (){
            var gap = this.getItemGap();
            this.max = L.getMaxPreferredSize(this);
            this.max.width  -= 2 * gap;
            this.max.height -= 2 * gap;
        };

        this.calcMaxItemSize = function (){
            this.validate();
            return { width:this.max.width, height:this.max.height };
        };

        this.getItemIdxAt = function(x,y){
            return L.getDirectAt(x, y, this);
        };

        this.catchInput = function (child){
            if (this.isComboMode) {
                return true;
            }

            var b = this.input != null && L.isAncestorOf(this.input, child);

            if (b && this.input != null &&
                L.isAncestorOf(this.input, pkg.focusManager.focusOwner) &&
                this.hasFocus() === false)
            {
                this.input = null;
            }
            return (this.input == null || b === false);
        };
    },

    function () {
        this.$this([], false);
    },

    function (b){
        if (zebra.isBoolean(b)) {
            this.$this([], b);
        }
        else {
            this.$this(b, false);
        }
    },

    function (d, b){
        this.input = this.max = null;
        this.setViewProvider(new zebra.Dummy([
            function getView(target,obj,i) {
                return new pkg.CompRender(obj);
            }
        ]));
        this.$super(d, b);
    },

    function setModel(m){
        var a =[];
        if (Array.isArray(m)) {
            a = m;
            m = new pkg.CompList.CompListModel(this);
        }

        if (zebra.instanceOf(m, pkg.CompList.CompListModel) === false) {
            throw new Error("Invalid model");
        }

        this.$super(m);
        for(var i=0; i < a.length; i++) this.add(a[i]);
    },

    function setPosition(c){
        if (c != this.position){
            if (zebra.instanceOf(this.layout, Position.Metric)) {
                c.setMetric(this.layout);
            }
            this.$super(c);
        }
    },

    function setLayout(layout){
        if (layout != this.layout){
            this.scrollManager = new pkg.ScrollManager(this, [
                function $prototype() {
                    this.calcPreferredSize = function(t) {
                        return layout.calcPreferredSize(t);
                    };

                    this.doLayout = function(t){
                        layout.doLayout(t);
                        for(var i = 0; i < t.kids.length; i++){
                            var kid = t.kids[i];
                            kid.setLocation(kid.x + this.getSX(),
                                            kid.y + this.getSY());
                        }
                    };

                    this.updated = function(sx,sy,px,py){
                        this.target.vrp();
                    };
                }
            ]);

            this.$super(this.scrollManager);
            if (this.position != null) {
                this.position.setMetric(zebra.instanceOf(layout, Position.Metric) ? layout : this);
            }
        }
    },

    function focused(){
        var o = this.position.offset;
        this.input = (o >= 0 && o == this.selectedIndex) ? this.model.get(this.position.offset) : null;
        this.$super();
    },

    function drawSelMarker(g,x,y,w,h){
        if (this.input == null || L.isAncestorOf(this.input, pkg.focusManager.focusOwner) === false) {
            this.$super(g, x, y, w, h);
        }
    },

    function posChanged(target,prevOffset,prevLine,prevCol){
        this.$super(target, prevOffset, prevLine, prevCol);
        if (this.isComboMode === false) {
            this.input = (this.position.offset >= 0) ? this.model.get(this.position.offset)
                                                     : null;
        }
    },

    function insert(index,constr,e) {
        var c = zebra.isString(e) ? new pkg.CompList.Label(e) : e,
            g = this.getItemGap();
        c.setPaddings(c.top + g, c.left + g, c.bottom + g, c.right + g);
        return this.$super(index, constr, c);
    },

    function kidAdded(index,constr,e){
        this.$super(index,constr,e);
        this.model._.elementInserted(this, e, index);
    },

    function kidRemoved(index,e) {
        var g = this.getItemGap();
        e.setPaddings(c.top - g, c.left - g, c.bottom - g, c.right - g);
        this.model._.elementRemoved(this, e, index);
    }
]);

var ContentListeners = Listeners.Class("contentUpdated");

/**
 * Combo box UI component class 
 * @class zebra.ui.Combo
 * @extends {zebra.ui.Panel}
 */

/**
 * Fired when a new value in a combo box component has been selected
  
     combo._.add(function(combo, value) {
         ...
     });

 * @event selected
 * @param {zebra.ui.Combo} combo a combo box component where a new value
 * has been selected
 * @param {Object} value a new value that has been selected
 */
pkg.Combo = Class(pkg.Panel, pkg.MouseListener, pkg.KeyListener, pkg.Composite, [
    function $clazz() {
        /**
         * UI panel class that is used to implement combo box content area  
         * @class  zebra.ui.Combo.ContentPan
         * @extends {zebra.ui.Panel}
         */
        this.ContentPan = Class(pkg.Panel, [
            function $prototype() {
                /**
                 * Called whenever the given combo box value has been updated with the specified 
                 * value. Implement the method to synchronize content panel with updated combo 
                 * box value
                 * @method updateValue
                 * @param {zebra.ui.Combo} combo a combo box component that has been updated
                 * @param {Object} value a value with which the combo box has been updated
                 */
                this.updateValue = function(combo, value) {

                };
                
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
                 * @return {zebra.ui.Combo} a combo the content panel belongs
                 */
                this.getCombo = function() {
                    var p = this;
                    while((p = p.parent) && zebra.instanceOf(p, pkg.Combo) == false);
                    return p;
                };
            }
        ]);
        
        this.ComboPadPan = Class(pkg.ScrollPan, [
            function $prototype() {
                this.closeTime = 0;
            },

            function setParent(l){
                this.$super(l);
                if (l == null && this.owner) {
                    this.owner.requestFocus();
                }

                this.closeTime = l == null ? new Date().getTime() : 0;
            }
        ]);

        /**
         * Read-only content area combo box component panel class
         * @extends zebra.ui.Combo.ContentPan
         * @class  zebra.ui.Combo.ReadonlyContentPan
         */
        this.ReadonlyContentPan = Class(this.ContentPan, [
            function $prototype() {
                this.calcPreferredSize = function(l){
                    var p = this.getCombo();
                    return p ? p.list.calcMaxItemSize() : { width:0, height:0 };
                };

                this.paintOnTop = function(g){
                    var list = this.getCombo().list, 
                        selected = list.getSelected(),
                        v = selected != null ? list.provider.getView(list, selected, list.selectedIndex) : null;

                    if (v != null) {
                        var ps = v.getPreferredSize();
                        v.paint(g, this.getLeft(), this.getTop() + ~~((this.height - this.getTop() - this.getBottom() - ps.height) / 2),
                                   this.width, ps.height, this);
                    }
                };
            }
        ]);

        /**
         * Editable content area combo box component panel class
         * @class zebra.ui.Combo.EditableContentPan
         * @extends zebra.ui.Combo.ContentPan
         */
        
        /**
         * Fired when a content value has been updated. 
         
        content._.add(function(contentPan, newValue) {
            ...
        });
        
         * @param {zebra.ui.Combo.ContentPan} contentPan a content panel that 
         * updated its value
         * @param {Object} newValue a new value the content panel has been set
         * with
         * @event  contentUpdated
         */
        this.EditableContentPan = Class(this.ContentPan, [
            function $clazz() {
                this.TextField = Class(pkg.TextField, []);
            },

            function (){
                this.$super(new L.BorderLayout());
                this._ = new ContentListeners();

                this.isEditable = true;

                this.dontGenerateUpdateEvent = false;

                /**
                 * A reference to a text field component the content panel uses as a 
                 * value editor
                 * @attribute textField
                 * @readOnly
                 * @private
                 * @type {zebra.ui.TextField}
                 */
                this.textField = new pkg.Combo.EditableContentPan.TextField("",  -1);
                this.textField.view.target._.add(this);
                this.add(L.CENTER, this.textField);
            },

            function focused(){
                this.$super();
                this.textField.requestFocus();
            },

            function $prototype() {
                this.textUpdated = function(src,b,off,size,startLine,lines){
                    if (this.dontGenerateUpdateEvent === false) {
                        this._.contentUpdated(this, this.textField.getValue());
                    }
                };

                this.canHaveFocus = function() { return true; };

                /**
                 * Called when the combo box content has been updated
                 * @param {zebra.ui.Combo} combo a combo where the new value has been set
                 * @param {Object} v a new combo box value 
                 * @method updateValue
                 */
                this.updateValue = function(combo, v){
                    this.dontGenerateUpdateEvent = true;
                    try {
                        var txt = (v == null ? "" : v.toString());
                        this.textField.setValue(txt);
                        this.textField.select(0, txt.length);
                    }
                    finally {
                        this.dontGenerateUpdateEvent = false;
                    }
                };
            }
        ]);

        this.Button = Class(pkg.Button, [
            function() {
                this.setFireParams(true,  -1);
                this.setCanHaveFocus(false);
                this.$super();
            }
        ]);

        this.List = Class(pkg.List, []);
    },

    /**
     * @for zebra.ui.Combo
     */
    function $prototype() {
        this.paint = function(g){
            if (this.content != null &&
                this.selectionView != null &&
                this.hasFocus())
            {
                this.selectionView.paint(g, this.content.x, this.content.y,
                                            this.content.width, this.content.height,
                                            this);
            }
        };

        this.catchInput = function (child) {
            return child != this.button && (this.content == null || !this.content.isEditable);
        };

        this.canHaveFocus = function() {
            return this.winpad.parent == null && (this.content != null || !this.content.isEditable);
        };

        this.contentUpdated = function(src, text){
            if (src == this.content){
                try {
                    this.lockListSelEvent = true;
                    if (text == null) this.list.select(-1);
                    else {
                        var m = this.list.model;
                        for(var i = 0;i < m.count(); i++){
                            var mv = m.get(i);
                            if (mv != text){
                                this.list.select(i);
                                break;
                            }
                        }
                    }
                }
                finally { this.lockListSelEvent = false; }
                this._.fired(this, text);
            }
        };

        /**
         * Select the given value from the list as the combo box value
         * @param  {Integer} i an index of a list element to be selected 
         * as the combo box value 
         * @method select
         */
        this.select = function(i) {
            this.list.select(i);
        };

        this.setSelectedIndex = function(i) {
            this.select(i);
        };

        /**
         * Set combo box value.
         * @param {Object} v a value 
         * @method  setValue
         */
        this.setValue = function(v) {
            this.list.setValue(v);
        };

        /**
         * Get the current combo box value
         * @return {Object} a value
         * @method getValue
         */
        this.getValue = function() {
            return this.list.getValue();
        };

        this.mousePressed = function (e) {
            if (e.isActionMask() && this.content != null             &&
                (new Date().getTime() - this.winpad.closeTime) > 100 &&
                e.x > this.content.x && e.y > this.content.y         &&
                e.x < this.content.x + this.content.width            &&
                e.y < this.content.y + this.content.height              )
            {
                this.showPad();
            }
        };

        /**
         * Hide combo drop down list
         * @method hidePad 
         */
        this.hidePad = function (){
            var d = this.getCanvas();
            if (d != null && this.winpad.parent != null){
                d.getLayer(pkg.PopupLayer.ID).remove(this.winpad);
                this.requestFocus();
            }
        };

        /**
         * Show combo drop down list
         * @method showPad 
         */
        this.showPad = function(){
            var canvas = this.getCanvas();
            if (canvas != null) {
                var winlayer = canvas.getLayer(pkg.PopupLayer.ID),
                    ps       = this.winpad.getPreferredSize(),
                    p        = L.getAbsLocation(0, 0, this),
                    px       = p.x,
                    py       = p.y;

                if (this.winpad.hbar && ps.width > this.width) {
                    ps.height += this.winpad.hbar.getPreferredSize().height;
                }

                if (this.maxPadHeight > 0 && ps.height > this.maxPadHeight) {
                    ps.height = this.maxPadHeight;
                }

                if (py + this.height + ps.height > canvas.height) {
                    if (py - ps.height >= 0) py -= (ps.height + this.height);
                    else {
                        var hAbove = canvas.height - py - this.height;
                        if(py > hAbove) {
                            ps.height = py;
                            py -= (ps.height + this.height);
                        }
                        else ps.height = hAbove;
                    }
                }

                this.winpad.setSize(this.width, ps.height);
                this.winpad.setLocation(px, py + this.height);
                this.list.notifyScrollMan(this.list.selectedIndex);
                winlayer.add(this, this.winpad);
                this.list.requestFocus();
            }
        };

        /**
         * Bind the given list component to the combo box component. 
         * @param {zebra.ui.BaseList} l a list component
         * @method setList
         */
        this.setList = function(l){
            if (this.list != l){
                this.hidePad();

                if (this.list != null) this.list._.remove(this);
                this.list = l;
                if (this.list._) this.list._.add(this);
                this.winpad = new pkg.Combo.ComboPadPan(this.list);
                this.winpad.owner = this;
                if (this.content != null) {
                    this.content.updateValue(this, this.list.getSelected());
                }
                this.vrp();
            }
        };

        this.keyPressed = function (e){
            if (this.list.model != null) {
                var index = this.list.selectedIndex;
                switch(e.code) {
                    case KE.LEFT :
                    case KE.UP   : if (index > 0) this.list.select(index - 1); break;
                    case KE.DOWN :
                    case KE.RIGHT: if (this.list.model.count() - 1 > index) this.list.select(index + 1); break;
                }
            }    
        };

        this.keyTyped = function(e) { this.list.keyTyped(e); };

        /**
         * Set the given combo box selection view
         * @param {zebra.ui.View} c a view
         * @method setSelectionView
         */
        this.setSelectionView = function (c){
            if (c != this.selectionView){
                this.selectionView = pkg.$view(c);
                this.repaint();
            }
        };

        /**
         * Set the maximal height of the combo box pad element. 
         * @param {Integer} h a maximal combo box pad size
         * @method setMaxPadHeight
         */
        this.setMaxPadHeight = function(h){
            if(this.maxPadHeight != h){
                this.hidePad();
                this.maxPadHeight = h;
            }
        };
    },

    function() {
        this.$this(new pkg.Combo.List(true));
    },

    function(list){
        if (zebra.isBoolean(list)) this.$this(new pkg.Combo.List(true), list);
        else this.$this(list, false);
    },

    function(list, editable){
        /**
         * Reference to combo box list component
         * @attribute list
         * @readOnly
         * @type {zebra.ui.BaseList}
         */
        if (zebra.instanceOf(list, pkg.BaseList) === false) {
            list = new pkg.Combo.List(list, true);
        }

        /**
         * Reference to combo box button component
         * @attribute button
         * @readOnly
         * @type {zebra.ui.Panel}
         */

        /**
         * Reference to combo box content component
         * @attribute content
         * @readOnly
         * @type {zebra.ui.Panel}
         */

        /**
         * Reference to combo box pad component
         * @attribute winpad
         * @readOnly
         * @type {zebra.ui.Panel}
         */
        
        /**
         * Reference to selection view
         * @attribute selectionView
         * @readOnly
         * @type {zebra.ui.View}
         */

        this.button = this.content = this.winpad = null;
        
        /**
         * Maximal size the combo box height can have
         * @attribute maxPadHeight
         * @readOnly
         * @type {Integer}
         */
        this.maxPadHeight = 0;
        
        this.lockListSelEvent = false;
        this._ = new Listeners();
        this.setList(list);
        this.$super();

        this.add(L.CENTER, editable ? new pkg.Combo.EditableContentPan()
                                    : new pkg.Combo.ReadonlyContentPan());
        this.add(L.RIGHT, new pkg.Combo.Button());
    },

    function focused(){
        this.$super();
        this.repaint();
    },

    function kidAdded(index,s,c){
        if (zebra.instanceOf(c, pkg.Combo.ContentPan)) {
            if (this.content != null) throw new Error("Content panel is set");
            if (c._) c._.add(this);
            this.content = c;
            if (this.list != null) c.updateValue(this, this.list.getSelected());
        }

        this.$super(index, s, c);
        if (this.button == null && zebra.instanceOf(c, zebra.util.Actionable)){
            this.button = c;
            this.button._.add(this);
        }
    },

    function kidRemoved(index,l){
        if (this.content == l){
            if (l._) l._.remove(this);
            this.content = null;
        }

        this.$super(index, l);
        if(this.button == l){
            this.button._.remove(this);
            this.button = null;
        }
    },

    /**
     * Combo box button listener method. The method triggers showing 
     * combo box pad window when the combo button has been pressed
     * @param  {zebra.ui.Button} src a button that has been pressed
     * @method fired
     */
    function fired(src) {
        if ((new Date().getTime() - this.winpad.closeTime) > 100) {
            this.showPad();
        }
    },

    function fired(src, data) {
        if (this.lockListSelEvent === false){
            this.hidePad();
            if (this.content != null) {
                this.content.updateValue(this, this.list.getSelected());
                if (this.content.isEditable) {
                    pkg.focusManager.requestFocus(this.content);
                }
                this.repaint();
            }
        }
    }
]);

/**
 * Combo box arrow view. The view is used to render combo box arrow element
 * in pressed  and unpressed state.  
 * @class zebra.ui.ComboArrowView
 * @constructor
 * @param {String} [col] a color of arrow element 
 * @param {Boolean} [state] a state of arrow element. true means pressed state.
 * @extends zebra.ui.View 
 */
pkg.ComboArrowView = Class(pkg.View, [
    function $prototype() {
        this[''] = function(col, state) {
            /**
             * Arrow color 
             * @type {String}
             * @readOnly
             * @default "black"
             * @attribute color
             */

            /**
             * Arrow state to be rendered 
             * @type {Boolean}
             * @readOnly
             * @default false
             * @attribute state
             */

            /**
             * Top, left, right and bottom gap value 
             * @type {Integer}
             * @readOnly
             * @default 4
             * @attribute gap
             */

            this.color = col == null ? "black" : col;
            this.state = state == null ? false : state;
            this.gap   = 4;
        };

        this.paint = function(g, x, y, w, h, d) {
            if (this.state) {
                g.setColor("#CCCCCC");
                g.drawLine(x, y, x, y + h);
                g.setColor("gray");
                g.drawLine(x + 1, y, x + 1, y + h);
            }
            else {
                g.setColor("#CCCCCC");
                g.drawLine(x, y, x, y + h);
                g.setColor("#EEEEEE");
                g.drawLine(x + 1, y, x + 1, y + h);
            }

            x += this.gap + 1;
            y += this.gap + 1;
            w -= this.gap * 2;
            h -= this.gap * 2;

            var s = Math.min(w, h);
            x = x + (w - s)/2 + 1;
            y = y + (h - s)/2;

            g.setColor(this.color);
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x + s, y);
            g.lineTo(x + s/2, y + s);
            g.lineTo(x, y);
            g.fill();
        };

        this.getPreferredSize = function() {
            return { width: 2 * this.gap + 6, height:2 * this.gap + 6 };
        };
    }
]);

/**
 * @for
 */

})(zebra("ui"), zebra.Class);
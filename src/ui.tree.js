(function(pkg, Class, ui)  {

/**
 * Tree UI components and all related to the component classes and interfaces.
 * Tree components are graphical representation of a tree model that allows a user
 * to navigate over the model item, customize the items rendering and
 * organize customizable editing of the items.

        // create tree component instance to visualize the given tree model
        var tree = new zebra.ui.tree.Tree({
            value: "Root",
            kids : [
                "Item 1",
                "Item 2",
                "Item 3"
            ]
        });

        // make all tree items editable with text field component
        tree.setEditorProvider(new zebra.ui.tree.DefEditors());

 * One more tree  component implementation - "CompTree" - allows developers
 * to create tree whose nodes are  other UI components

        // create tree component instance to visualize the given tree model
        var tree = new zebra.ui.tree.CompTree({
            value: new zebra.ui.Label("Root label item"),
            kids : [
                new zebra.ui.Checkbox("Checkbox Item"),
                new zebra.ui.Button("Button Item"),
                new zebra.ui.TextField("Text field item")
            ]
        });

 * @module ui.tree
 * @main
 */


//  tree node metrics:
//   |
//   |-- <-gapx-> {icon} -- <-gapx-> {view}
//

var KE = ui.KeyEvent;

/**
 * Simple private structure to keep a tree model item metrical characteristics
 * @constructor
 * @param {Boolean} b a state of an appropriate tree component node of the given
 * tree model item. The state is sensible for item that has children items and
 * the state indicates if the given tree node is collapsed (false) or expanded
 * (true)
 * @private
 * @class zebra.ui.tree.$IM
 */
pkg.$IM = function(b) {
    /**
     *  The whole width of tree node that includes a rendered item preferred
     *  width, all icons and gaps widths
     *  @attribute width
     *  @type {Integer}
     *  @readOnly
     */

    /**
     *  The whole height of tree node that includes a rendered item preferred
     *  height, all icons and gaps heights
     *  @attribute height
     *  @type {Integer}
     *  @readOnly
     */

    /**
     *  Width of an area of rendered tree model item. It excludes icons, toggle
     *  and gaps widths
     *  @attribute viewWidth
     *  @type {Integer}
     *  @readOnly
     */

    /**
     *  Height of an area of rendered tree model item. It excludes icons, toggle
     *  and gaps heights
     *  @attribute viewHeight
     *  @type {Integer}
     *  @readOnly
     */

    /**
     *  Indicates whether a node is in expanded or collapsed state
     *  @attribute isOpen
     *  @type {Boolean}
     *  @readOnly
     */

    this.width = this.height = this.x = this.y = this.viewHeight = 0;
    this.viewWidth = -1;
    this.isOpen = b;
};

/**
 * Abstract tree component that can used as basement for building own tree components.
 * The component is responsible for rendering tree, calculating tree nodes metrics,
 * computing visible area, organizing basic user interaction. Classes that inherit it
 * has to provide the following important things:

    * **A tree model item metric** Developers have to implement "getItemPreferredSize(item)"
      method to say which size the given tree item wants to have.
    * **Tree node item rendering** If necessary developers have to implement the way
      a tree item has to be visualized by implementing "this.paintItem(...)" method

 *
 * @class zebra.ui.tree.BaseTree
 * @constructor
 * @param {zebra.data.TreeModel|Object} a tree model. It can be an instance of tree model
 * class or an object that described tree model. An example of such object is shown below:

        {
            value : "Root",
            kids  : [
                {
                    value: "Child 1",
                    kids :[
                        "Sub child 1"
                    ]
                },
                "Child 2",
                "Child 3"
            ]
        }

 * @param {Boolean} [nodeState] a default tree nodes state (expanded or collapsed)
 * @extends {zebra.ui.Panel}
 */

 /**
  * Fired when a tree item has been toggled

        tree.bind(function toggled(src, item) {
           ...
        });

  * @event toggled
  * @param  {zebra.ui.tree.BaseTree} src a tree component that triggers the event
  * @param  {zebra.data.Item} item an tree item that has been toggled
  */

 /**
  * Fired when a tree item has been selected

      tree.bind(function selected(src, prevItem) {
         ...
      });

  * @event selected
  * @param  {zebra.ui.tree.BaseTree} src a tree component that triggers the event
  * @param  {zebra.data.Item} prevItem a previously selected tree item
  */


/**
  * Fired when a tree item editing has been started

      tree.bind(function editingStarted(src, item, editor) {
         ...
      });

  * @event editingStarted
  * @param  {zebra.ui.tree.BaseTree} src an tree component that triggers the event
  * @param  {zebra.data.Item} item a tree item to be edited
  * @param  {zebra.ui.Panel} editor an editor to be used to edit the given item
  */

/**
  * Fired when a tree item editing has been stopped

      tree.bind(function editingStopped(src, item, oldValue, editor, isApplied) {
         ...
      });

  * @event editingStopped
  * @param  {zebra.ui.tree.BaseTree} src a tree component that triggers the event
  * @param  {zebra.data.Item} item a tree item that has been edited
  * @param  {Object} oldValue an old value of the edited tree item
  * @param  {zebra.ui.Panel} editor an editor to be used to edit the given item
  * @param  {Boolean} isApplied flag that indicates if the edited value has been
  * applied to the given tree item
  */
pkg.BaseTree = Class(ui.Panel, [
    function  $clazz() {
        this.Listeners = zebra.util.ListenersClass("toggled", "selected", "editingStarted", "editingStopped");
    },

    function $prototype() {
        /**
         * Horizontal gap between a node elements: toggle, icons and tree item view
         * @attribute gapx
         * @readOnly
         * @default 2
         * @type {Integer}
         */

        /**
         * Vertical gap between a node elements: toggle, icons and tree item view
         * @attribute gapy
         * @readOnly
         * @default 2
         * @type {Integer}
         */

        this.gapx = this.gapy = 2;
        this.canHaveFocus = true;

        /**
         * Test if the given tree component item is opened
         * @param  {zebra.data.Item}  i a tree model item
         * @return {Boolean} true if the given tree component item is opened
         * @method isOpen
         */
        this.isOpen = function(i){
            this.validate();
            return this.isOpen_(i);
        };

        /**
         * Get calculated for the given tree model item metrics
         * @param  {zebra.data.Item} i a tree item
         * @return {Object}   an tree model item metrics. Th
         * @method getItemMetrics
         */
        this.getItemMetrics = function(i){
            this.validate();
            return this.getIM(i);
        };

        this.togglePressed = function(root) {
            this.toggle(root);
        };

        this.itemPressed = function(root, e) {
            this.select(root);
        };

        this.pointerPressed = function(e){
            if (this.firstVisible != null && e.isAction()) {
                var x = e.x,
                    y = e.y,
                    root = this.getItemAt(this.firstVisible, x, y);

                if (root != null) {
                    x -= this.scrollManager.getSX();
                    y -= this.scrollManager.getSY();
                    var r = this.getToggleBounds(root);

                    if (x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height){
                        this.togglePressed(root);
                    }
                    else {
                        if (x > r.x + r.width) this.itemPressed(root, e);
                    }
                }
            }
        };

        this.vVisibility = function (){
            if (this.model == null) this.firstVisible = null;
            else {
                var nva = ui.$cvp(this, {});
                if (nva == null) this.firstVisible = null;
                else {
                    if (this._isVal === false ||
                        (this.visibleArea == null              ||
                         this.visibleArea.x != nva.x           ||
                         this.visibleArea.y != nva.y           ||
                         this.visibleArea.width != nva.width   ||
                         this.visibleArea.height != nva.height   ))
                    {
                        this.visibleArea = nva;
                        if (this.firstVisible != null) {
                            this.firstVisible = this.findOpened(this.firstVisible);
                            this.firstVisible = this.isOverVisibleArea(this.firstVisible) ? this.nextVisible(this.firstVisible)
                                                                                          : this.prevVisible(this.firstVisible);
                        }
                        else {
                            this.firstVisible = (-this.scrollManager.getSY() > Math.floor(this.maxh / 2)) ? this.prevVisible(this.findLast(this.model.root))
                                                                                                          : this.nextVisible(this.model.root);
                        }
                    }
                }
            }
            this._isVal = true;
        };

        this.recalc = function(){
            this.maxh = this.maxw = 0;
            if (this.model != null && this.model.root != null) {
                this.recalc_(this.getLeft(), this.getTop(), null, this.model.root, true);
                this.maxw -= this.getLeft();
                this.maxh -= this.gapy;
            }
        };

        /**
         * Get tree model item  metrical bounds (location and size).
         * @param  {zebra.data.Item} root an tree model item
         * @return {Object} a structure that keeps an item view location
         * and size:

                {
                    x: {Integer},
                    y: {Integer},
                    width: {Integer},
                    height: {Integer}
                }

         * @method getItemBounds
         * @protected
         */
        this.getItemBounds = function(root){
            var metrics = this.getIM(root),
                toggle  = this.getToggleBounds(root),
                image   = this.getIconBounds(root);

            toggle.x = image.x + image.width + (image.width > 0 || toggle.width > 0 ? this.gapx : 0);
            toggle.y = metrics.y + Math.floor((metrics.height - metrics.viewHeight) / 2);
            toggle.width = metrics.viewWidth;
            toggle.height = metrics.viewHeight;
            return toggle;
        };

        /**
         * Get toggle element bounds for the given tree model item.
         * @param  {zebra.data.Item} root an tree model item
         * @return {Object} a structure that keeps an item toggle location
         * and size:

                {
                    x: {Integer},
                    y: {Integer},
                    width: {Integer},
                    height: {Integer}
                }

         * @method getToggleBounds
         * @protected
         */
        this.getToggleBounds = function(root){
            var node = this.getIM(root), d = this.getToggleSize(root);
            return { x     : node.x,
                     y     : node.y + Math.floor((node.height - d.height) / 2),
                     width : d.width,
                     height: d.height };
        };

        /**
         * Get current toggle element view. The view depends on the state of tree item.
         * @param  {zebra.data.Item} i a tree model item
         * @protected
         * @return {zebra.ui.View}  a toggle element view
         * @method getToogleView
         */
        this.getToggleView = function(i){
            return i.kids.length > 0 ? (this.getIM(i).isOpen ? this.views.on
                                                             : this.views.off) : null;
        };

        /**
         * An abstract method that a concrete tree component implementations have to
         * override. The method has to return a preferred size the given tree model
         * item wants to have.
         * @param  {zebra.data.Item} root an tree model item
         * @return {Object} a structure that keeps an item preferred size:

                {
                    width: {Integer},
                    height: {Integer}
                }

         * @method getItemPreferredSize
         * @protected
         */
        this.getItemPreferredSize = function(root) {
            throw new Error("Not implemented");
        };

        /**
         * An abstract method that a concrete tree component implementations should
         * override. The method has to render the given tree node of the specified
         * tree model item at the given location
         * @param  {2DContext} g a graphical context
         * @param  {zebra.data.Item} root a tree model item to be rendered
         * @param  {zebra.ui.tree.$IM} node a tree node metrics
         * @param  {Ineteger} x a x location where the tree node has to be rendered
         * @param  {Ineteger} y a y location where the tree node has to be rendered
         * @method paintItem
         * @protected
         */

        this.recalc_ = function (x,y,parent,root,isVis){
            var node = this.getIM(root);
            if (isVis === true) {
                if (node.viewWidth < 0){
                    var viewSize = this.getItemPreferredSize(root);
                    node.viewWidth  = viewSize.width === 0 ? 5 : viewSize.width;
                    node.viewHeight = viewSize.height;
                }

                var imageSize = this.getIconSize(root), toggleSize = this.getToggleSize(root);
                if (parent != null){
                    var pImg = this.getIconBounds(parent);
                    x = pImg.x + Math.floor((pImg.width - toggleSize.width) / 2);
                }

                node.x = x;
                node.y = y;
                node.width = toggleSize.width + imageSize.width +
                             node.viewWidth + (toggleSize.width > 0 ? this.gapx : 0) + 10 +
                                              (imageSize.width  > 0 ? this.gapx : 0);

                node.height = Math.max(((toggleSize.height > imageSize.height) ? toggleSize.height
                                                                               : imageSize.height),
                                        node.viewHeight);

                if (node.x + node.width > this.maxw) {
                    this.maxw = node.x + node.width;
                }

                this.maxh += (node.height + this.gapy);
                x = node.x + toggleSize.width + (toggleSize.width > 0 ? this.gapx : 0);
                y += (node.height + this.gapy);
            }

            var b = node.isOpen && isVis === true;
            if (b) {
                var count = root.kids.length;
                for(var i = 0; i < count; i++) {
                    y = this.recalc_(x, y, root, root.kids[i], b);
                }
            }
            return y;
        };

        this.isOpen_ = function (i){
            return i == null || (i.kids.length > 0 && this.getIM(i).isOpen && this.isOpen_(i.parent));
        };

        /**
         * Get a tree node metrics by the given tree model item.
         * @param  {zebra.data.Item} i a tree model item
         * @return {zebra.ui.tree.$IM} a tree node metrics
         * @protected
         * @method getIM
         */
        this.getIM = function (i){
            var node = this.nodes[i];
            if (typeof node === 'undefined'){
                node = new pkg.$IM(this.isOpenVal);
                this.nodes[i] = node;
            }
            return node;
        };

        /**
         * Get a tree item that is located at the given location.
         * @param  {zebra.data.Item} [root] a starting tree node
         * @param  {Integer} x a x coordinate
         * @param  {Integer} y a y coordinate
         * @return {zebra.data.Item} a tree model item
         * @method getItemAt
         */
        this.getItemAt = function(root, x, y){
            this.validate();

            if (arguments.length < 3) {
                x = arguments[0];
                y = arguments[1];
                root = this.model.root;
            }

            if (this.firstVisible != null && y >= this.visibleArea.y && y < this.visibleArea.y + this.visibleArea.height){
                var dx    = this.scrollManager.getSX(),
                    dy    = this.scrollManager.getSY(),
                    found = this.getItemAtInBranch(root, x - dx, y - dy);

                if (found != null) return found;

                var parent = root.parent;
                while (parent != null) {
                    var count = parent.kids.length;
                    for(var i = parent.kids.indexOf(root) + 1;i < count; i ++ ){
                        found = this.getItemAtInBranch(parent.kids[i], x - dx, y - dy);
                        if (found != null) return found;
                    }
                    root = parent;
                    parent = root.parent;
                }
            }
            return null;
        };

        this.getItemAtInBranch = function(root,x,y){
            if (root != null){
                var node = this.getIM(root);
                if (x >= node.x && y >= node.y && x < node.x + node.width && y < node.y + node.height + this.gapy) {
                    return root;
                }

                if (this.isOpen_(root)){
                    for(var i = 0;i < root.kids.length; i++) {
                        var res = this.getItemAtInBranch(root.kids[i], x, y);
                        if (res != null) return res;
                    }
                }
            }
            return null;
        };

        this.getIconView = function (i){
            return i.kids.length > 0 ? (this.getIM(i).isOpen ? this.views.open
                                                             : this.views.close)
                                     : this.views.leaf;
        };

        this.getIconSize = function (i) {
            var v =  i.kids.length > 0 ? (this.getIM(i).isOpen ? this.viewSizes.open
                                                               : this.viewSizes.close)
                                       : this.viewSizes.leaf;
            return v ? v : { width:0, height:0 };
        };

        /**
         * Get icon element bounds for the given tree model item.
         * @param  {zebra.data.Item} root an tree model item
         * @return {Object} a structure that keeps an item icon location
         * and size:

                {
                    x: {Integer},
                    y: {Integer},
                    width: {Integer},
                    height: {Integer}
                }

         * @method getToggleBounds
         * @protected
         */
        this.getIconBounds = function (root){
            var node = this.getIM(root),
                id   = this.getIconSize(root),
                td   = this.getToggleSize(root);
            return { x:node.x + td.width + (td.width > 0 ? this.gapx : 0),
                     y:node.y + Math.floor((node.height - id.height) / 2),
                     width:id.width, height:id.height };
        };

        this.getToggleSize = function (i){
            return this.isOpen_(i) ? this.viewSizes.on : this.viewSizes.off;
        };

        this.isOverVisibleArea = function (i){
            var node = this.getIM(i);
            return node.y + node.height + this.scrollManager.getSY() < this.visibleArea.y;
        };

        this.findOpened = function (item){
            var parent = item.parent;
            return (parent == null || this.isOpen_(parent)) ? item : this.findOpened(parent);
        };

        this.findNext = function (item){
            if (item != null){
                if (item.kids.length > 0 && this.isOpen_(item)){
                    return item.kids[0];
                }
                var parent = null;
                while ((parent = item.parent) != null){
                    var index = parent.kids.indexOf(item);
                    if (index + 1 < parent.kids.length) return parent.kids[index + 1];
                    item = parent;
                }
            }
            return null;
        };

        this.findPrev = function (item){
            if (item != null) {
                var parent = item.parent;
                if (parent != null) {
                    var index = parent.kids.indexOf(item);
                    return (index - 1 >= 0) ? this.findLast(parent.kids[index - 1]) : parent;
                }
            }
            return null;
        };

        this.findLast = function (item){
            return this.isOpen_(item) && item.kids.length > 0 ? this.findLast(item.kids[item.kids.length - 1])
                                                              : item;
        };

        this.prevVisible = function (item){
            if (item == null || this.isOverVisibleArea(item)) return this.nextVisible(item);
            var parent = null;
            while((parent = item.parent) != null){
                for(var i = parent.kids.indexOf(item) - 1;i >= 0; i-- ){
                    var child = parent.kids[i];
                    if (this.isOverVisibleArea(child)) return this.nextVisible(child);
                }
                item = parent;
            }
            return item;
        };

        this.isVerVisible = function (item){
            if (this.visibleArea == null) return false;

            var node = this.getIM(item),
                yy1  = node.y + this.scrollManager.getSY(),
                yy2  = yy1 + node.height - 1,
                by   = this.visibleArea.y + this.visibleArea.height;

            return ((this.visibleArea.y <= yy1 && yy1 < by) ||
                    (this.visibleArea.y <= yy2 && yy2 < by) ||
                    (this.visibleArea.y > yy1 && yy2 >= by)    );
        };

        this.nextVisible = function(item){
            if (item == null || this.isVerVisible(item)) return item;
            var res = this.nextVisibleInBranch(item), parent = null;
            if (res != null) return res;
            while((parent = item.parent) != null){
                var count = parent.kids.length;
                for(var i = parent.kids.indexOf(item) + 1;i < count; i++){
                    res = this.nextVisibleInBranch(parent.kids[i]);
                    if (res != null) return res;
                }
                item = parent;
            }
            return null;
        };

        this.nextVisibleInBranch = function (item){
            if (this.isVerVisible(item)) return item;
            if (this.isOpen_(item)){
                for(var i = 0;i < item.kids.length; i++){
                    var res = this.nextVisibleInBranch(item.kids[i]);
                    if (res != null) return res;
                }
            }
            return null;
        };

        this.paintSelectedItem = function(g, root, node, x, y) {
            var v = this.hasFocus() ? this.views.aselect : this.views.iselect;
            if (v != null) {
                v.paint(g, x, y, node.viewWidth, node.viewHeight, this);
            }
        };

        this.paintTree = function (g,item){
            this.paintBranch(g, item);
            var parent = null;
            while((parent = item.parent) != null){
                this.paintChild(g, parent, parent.kids.indexOf(item) + 1);
                item = parent;
            }
        };

        this.paintBranch = function (g, root){
            if (root == null) return false;

            var node = this.getIM(root),
                dx   = this.scrollManager.getSX(),
                dy   = this.scrollManager.getSY();

            if (zebra.util.isIntersect(node.x + dx, node.y + dy,
                                       node.width, node.height,
                                       this.visibleArea.x, this.visibleArea.y,
                                       this.visibleArea.width, this.visibleArea.height))
            {
                var toggle     = this.getToggleBounds(root),
                    toggleView = this.getToggleView(root),
                    image      = this.getIconBounds(root),
                    vx         = image.x + image.width + this.gapx,
                    vy         = node.y + Math.floor((node.height - node.viewHeight) / 2);

                if (toggleView != null) {
                    toggleView.paint(g, toggle.x, toggle.y, toggle.width, toggle.height, this);
                }

                if (image.width > 0) {
                    this.getIconView(root).paint(g, image.x, image.y,
                                                 image.width, image.height, this);
                }

                if (this.selected == root){
                    this.paintSelectedItem(g, root, node, vx, vy);
                }

                if (this.paintItem != null) {
                    this.paintItem(g, root, node, vx, vy);
                }

                if (this.lnColor != null){
                    g.setColor(this.lnColor);
                    var yy = toggle.y + Math.floor(toggle.height / 2) + 0.5;

                    g.beginPath();
                    g.moveTo(toggle.x + (toggleView == null ? Math.floor(toggle.width / 2)
                                                            : toggle.width - 1), yy);
                    g.lineTo(image.x, yy);
                    g.stroke();
                }
            }
            else {
                if (node.y + dy > this.visibleArea.y + this.visibleArea.height ||
                    node.x + dx > this.visibleArea.x + this.visibleArea.width    )
                {
                    return false;
                }
            }
            return this.paintChild(g, root, 0);
        };

        this.y_ = function (item, isStart){
            var node = this.getIM(item),
                th = this.getToggleSize(item).height,
                ty = node.y + Math.floor((node.height - th) / 2),
                dy = this.scrollManager.getSY(),
                y  = (item.kids.length > 0) ? (isStart ? ty + th : ty - 1)
                                            : ty + Math.floor(th / 2);

            return (y + dy < 0) ?  -dy - 1
                                : ((y + dy > this.height) ? this.height - dy : y);
        };

        /**
         * Paint children items of the given root tree item.
         * @param  {2DContext} g a graphical context
         * @param  {zebra.data.Item} root a root tree item
         * @param  {Integer} index an index
         * @return {Boolean}
         * @protected
         * @method paintChild
         */
        this.paintChild = function (g, root, index){
            var b = this.isOpen_(root);
            if (root == this.firstVisible && this.lnColor != null) {
                g.setColor(this.lnColor);
                var xx = this.getIM(root).x + Math.floor((b ? this.viewSizes.on.width
                                                            : this.viewSizes.off.width) / 2);
                g.beginPath();
                g.moveTo(xx + 0.5, this.getTop());
                g.lineTo(xx + 0.5, this.y_(root, false));
                g.stroke();
            }
            if (b && root.kids.length > 0){
                var firstChild = root.kids[0];
                if (firstChild == null) return true;

                var x = this.getIM(firstChild).x + Math.floor((this.isOpen_(firstChild) ? this.viewSizes.on.width
                                                                                        : this.viewSizes.off.width) / 2),
                count = root.kids.length;
                if (index < count) {
                    var  node = this.getIM(root),
                         y    = (index > 0) ? this.y_(root.kids[index - 1], true)
                                            : node.y + Math.floor((node.height + this.getIconSize(root).height) / 2);

                    for(var i = index;i < count; i ++ ){
                        var child = root.kids[i];
                        if (this.lnColor != null){
                            g.setColor(this.lnColor);
                            g.beginPath();
                            g.moveTo(x + 0.5, y);
                            g.lineTo(x + 0.5, this.y_(child, false));
                            g.stroke();
                            y = this.y_(child, true);
                        }
                        if (this.paintBranch(g, child) === false){
                            if (this.lnColor != null && i + 1 != count){
                                g.setColor(this.lnColor);
                                g.beginPath();
                                g.moveTo(x + 0.5, y);
                                g.lineTo(x + 0.5, this.height - this.scrollManager.getSY());
                                g.stroke();
                            }
                            return false;
                        }
                    }
                }
            }
            return true;
        };

        this.nextPage = function (item,dir){
            var sum = 0, prev = item;
            while(item != null && sum < this.visibleArea.height){
                sum += (this.getIM(item).height + this.gapy);
                prev = item;
                item = dir < 0 ? this.findPrev(item) : this.findNext(item);
            }
            return prev;
        };

        this.paint = function(g){
            if (this.model != null){
                this.vVisibility();
                if (this.firstVisible != null){
                    var sx = this.scrollManager.getSX(), sy = this.scrollManager.getSY();
                    try {
                        g.translate(sx, sy);
                        this.paintTree(g, this.firstVisible);
                        g.translate(-sx,  -sy);
                    }
                    catch(e) {
                        g.translate(-sx,  -sy);
                        throw e;
                    }
                }
            }
        };

        /**
         * Select the given item.
         * @param  {zebra.data.Item} an item to be selected. Use null value to clear any selection
         * @method  select
         */
        this.select = function(item){
            if (this.isSelectable === true){
                var old = this.selected;

                this.selected = item;
                if (this.selected != null) {
                    this.makeVisible(this.selected);
                }

                this._.selected(this, old);

                if (old != null && this.isVerVisible(old)) {
                    var m = this.getItemMetrics(old);
                    this.repaint(m.x + this.scrollManager.getSX(),
                                 m.y + this.scrollManager.getSY(),
                                 m.width, m.height);
                }

                if (this.selected != null && this.isVerVisible(this.selected)) {
                    var m = this.getItemMetrics(this.selected);
                    this.repaint(m.x + this.scrollManager.getSX(),
                                 m.y + this.scrollManager.getSY(),
                                 m.width, m.height);
                }
            }
        };

        /**
         * Make the given tree item visible. Tree component rendered content can takes more space than
         * the UI component size is. In this case the content can be scrolled to make visible required
         * tree item.
         * @param  {zebra.data.Item} item an item to be visible
         * @method makeVisible
         */
        this.makeVisible = function(item){
            this.validate();
            var r = this.getItemBounds(item);
            this.scrollManager.makeVisible(r.x, r.y, r.width, r.height);
        };

        /**
         * Toggle off or on recursively all items of the given item
         * @param  {zebra.data.Item} root a starting item to toggle
         * @param  {Boolean} b  true if all items have to be in opened
         * state and false otherwise
         * @method toggleAll
         */
        this.toggleAll = function (root,b){
            var model = this.model;
            if (root.kids.length > 0){
                if (this.getItemMetrics(root).isOpen != b) this.toggle(root);
                for(var i = 0; i < root.kids.length; i++ ){
                    this.toggleAll(root.kids[i], b);
                }
            }
        };

        /**
         * Toggle the given tree item
         * @param  {zebra.data.Item} item an item to be toggled
         * @method toggle
         */
        this.toggle = function(item){
            if (item.kids.length > 0){
                this.validate();
                var node = this.getIM(item);
                node.isOpen = (node.isOpen ? false : true);
                this.invalidate();
                this._.toggled(this, item);
                if( !node.isOpen && this.selected != null){
                    var parent = this.selected;
                    do {
                        parent = parent.parent;
                    }
                    while(parent != item && parent != null);
                    if(parent == item) this.select(item);
                }
                this.repaint();
            }
        };

        this.itemInserted = function (target,item){
            this.vrp();
        };

        this.itemRemoved = function (target,item){
            if (item == this.firstVisible) this.firstVisible = null;
            if (item == this.selected) this.select(null);
            delete this.nodes[item];
            this.vrp();
        };

        this.itemModified = function (target,item){
            var node = this.getIM(item);
            if (node != null) node.viewWidth = -1;
            this.vrp();
        };

        this.calcPreferredSize = function (target){
            return this.model == null ? { width:0, height:0 }
                                      : { width:this.maxw, height:this.maxh };
        };
    },

    function (d, b){
        if (arguments.length < 2) {
            b = true;
        }

         /**
          * Selected tree model item
          * @attribute selected
          * @type {zebra.data.Item}
          * @default null
          * @readOnly
          */

        this.selected = this.firstVisible = null;
        this.maxw = this.maxh = 0;

         /**
          * Tree component line color
          * @attribute lnColor
          * @type {String}
          * @readOnly
          */

        this.visibleArea = this.lnColor = null;

        this.views     = {};
        this.viewSizes = {};

        this._isVal = false;
        this.nodes = {};
        this._ = new this.$clazz.Listeners();
        this.setLineColor("gray");

        this.isOpenVal = b;

        this.setSelectable(true);
        this.$super();
        this.setModel(d);
        this.scrollManager = new ui.ScrollManager(this);
    },

    function focused(){
        this.$super();
        if (this.selected != null) {
            var m = this.getItemMetrics(this.selected);
            this.repaint(m.x + this.scrollManager.getSX(),
                         m.y + this.scrollManager.getSY(), m.width, m.height);
        }
    },
    /**
     * Say if items of the tree component should be selectable
     * @param {Boolean} b true is tree component items can be selected
     * @method setSelectable
     */
    function setSelectable(b){
        if (this.isSelectable != b){
            if (b === false && this.selected != null) this.select(null);
            this.isSelectable = b;
            this.repaint();
        }
    },

    /**
     * Set tree component connector lines color
     * @param {String} c a color
     * @method setLineColor
     */
    function setLineColor(c){
        this.lnColor = c;
        this.repaint();
    },

    /**
     * Set the given horizontal gaps between tree node graphical elements:
     * toggle, icon, item view
     * @param {Integer} gx horizontal gap
     * @param {Integer} gy vertical gap
     * @method setGaps
     */
    function setGaps(gx,gy){
        if (gx != this.gapx || gy != this.gapy){
            this.gapx = gx;
            this.gapy = gy;
            this.vrp();
        }
    },

    /**
     * Set the number of views to customize rendering of different visual elements of the tree
     * UI component. The following decorative elements can be customized:

    - **"close" ** - closed tree item icon view
    - **"open" **  - opened tree item icon view
    - **"leaf" **  - leaf tree item icon view
    - **"on" **    - toggle on view
    - **"off" **   - toggle off view
    - **"iselect" **   - a view to express an item selection when tree component doesn't hold focus
    - **"aselect" **   - a view to express an item selection when tree component holds focus

     * For instance:

        // build tree UI component
        var tree = new zebra.ui.tree.Tree({
            value: "Root",
            kids: [
                "Item 1",
                "Item 2"
            ]
        });

        // set " [x] " text render for toggle on and
        // " [o] " text render for toggle off tree elements
        tree.setViews({
            "on": new zebra.ui.TextRender(" [x] "),
            "off": new zebra.ui.TextRender(" [o] ")
        });

     * @param {Object} v dictionary of tree component decorative elements views
     * @method setViews
     */
    function setViews(v){
        for(var k in v) {
            if (v.hasOwnProperty(k)) {
                var vv = ui.$view(v[k]);

                this.views[k] = vv;
                if (k != "aselect" && k != "iselect"){
                    this.viewSizes[k] = vv ? vv.getPreferredSize() : null;
                    this.vrp();
                }
            }
        }
    },

    /**
     * Set the given tree model to be visualized with the UI component.
     * @param {zebra.data.TreeModel|Object} d a tree model
     * @method setModel
     */
    function setModel(d){
        if (this.model != d) {
            if (zebra.instanceOf(d, zebra.data.TreeModel) === false) {
                d = new zebra.data.TreeModel(d);
            }

            this.select(null);
            if (this.model != null && this.model._) this.model.bind(this);
            this.model = d;
            if (this.model != null && this.model._) this.model.bind(this);
            this.firstVisible = null;
            delete this.nodes;
            this.nodes = {};
            this.vrp();
        }
    },

    function invalidate(){
        if (this.isValid === true){
            this._isVal = false;
        }
            this.$super();
    }
]);

/**
 * Default tree editor provider
 * @class zebra.ui.tree.DefEditors
 */
pkg.DefEditors = Class([
    function (){
        /**
         * Internal component that are designed as default editor component
         * @private
         * @readOnly
         * @attribute tf
         * @type {zebra.ui.TextField}
         */
        this.tf = new ui.TextField(new zebra.data.SingleLineTxt(""));
        this.tf.setBackground("white");
        this.tf.setBorder(null);
        this.tf.setPadding(0);
    },

    function $prototype() {
        /**
         * Get an UI component to edit the given tree model element
         * @param  {zebra.ui.tree.Tree} src a tree component
         * @param  {zebra.data.Item} item an data model item
         * @return {zebra.ui.Panel} an editor UI component
         * @method getEditor
         */
        this.getEditor = function(src,item){
            var o = item.value;
            this.tf.setValue((o == null) ? "" : o.toString());
            return this.tf;
        };

        /**
         * Fetch a model item from the given UI editor component
         * @param  {zebra.ui.tree.Tree} src a tree UI component
         * @param  {zebra.ui.Panel} editor an editor that has been used to edit the tree model element
         * @return {Object} an new tree model element value fetched from the given UI editor component
         * @method fetchEditedValue
         */
        this.fetchEditedValue = function(src, editor){
            return editor.view.target.getValue();
        };

        /**
         * The method is called to ask if the given input event should trigger an tree component item
         * @param  {zebra.ui.tree.Tree} src a tree UI component
         * @param  {zebra.ui.PointerEvent|zebra.ui.KeyEvent} e   an input event: pointer or key event
         * @return {Boolean} true if the event should trigger edition of a tree component item
         * @method @shouldStartEdit
         */
        this.shouldStartEdit = function(src,e){
            return  e.id === "pointerDoubleClicked" ||
                   (e.id === "keyPressed" && e.code === KE.ENTER);
        };
    }
]);

/**
 * Default tree editor view provider
 * @class zebra.ui.tree.DefViews
 * @constructor
 * @param {String} [color] the tree item text color
 * @param {String} [font] the tree item text font
 */
pkg.DefViews = Class([
    function $prototype() {
        /**
         * Get a view for the given model item of the UI tree component
         * @param  {zebra.ui.tree.Tree} tree  a tree component
         * @param  {zebra.data.Item} item a tree model element
         * @return {zebra.ui.View}  a view to visualize the given tree data model element
         * @method  getView
         */
        this.getView = function (tree, item){
            if (item.value && item.value.paint != null) {
                return item.value;
            }
            this.render.setValue(item.value == null ? "<null>" : item.value);
            return this.render;
        };

        /**
         * Set the default view provider text render font
         * @param {zebra.ui.Font} f a font
         * @method setFont
         */
        this.setFont = function(f) {
            this.render.setFont(f);
        };

        /**
         * Set the default view provider text render color
         * @param {String} c a color
         * @method setColor
         */
        this.setColor = function(c) {
            this.render.setColor(c);
        };

        this[''] = function(color, font) {
            /**
             * Default tree item render
             * @attribute render
             * @readOnly
             * @type {zebra.ui.StringRender}
             */
            this.render = new ui.StringRender("");

            zebra.properties(this, this.$clazz);

            if (color != null) this.setColor(color);
            if (font  != null) this.setFont(font);
        };
    }
]);

/**
 * Tree UI component that visualizes a tree data model. The model itself can be passed as JavaScript
 * structure or as a instance of zebra.data.TreeModel. Internally tree component keeps the model always
 * as zebra.data.TreeModel class instance:

     var tree = new zebra.ui.tree.Tree({
          value: "Root",
          kids : [  "Item 1", "Item 2"]
     });

 * or

     var model = new zebra.data.TreeModel("Root");
     model.add(model.root, "Item 1");
     model.add(model.root, "Item 2");

     var tree = new zebra.ui.tree.Tree(model);

 * Tree model rendering is fully customizable by defining an own views provider. Default views
 * provider renders tree model item as text. The tree node can be made editable by defining an
 * editor provider. By default tree modes are not editable.
 * @class  zebra.ui.tree.Tree
 * @constructor
 * @extends zebra.ui.tree.BaseTree
 * @param {Object|zebra.data.TreeModel} [model] a tree data model passed as JavaScript
 * structure or as an instance
 * @param {Boolean} [b] the tree component items toggle state. true to have all items
 * in opened state.
 */
pkg.Tree = Class(pkg.BaseTree, [
    function $prototype() {
        this.itemGapY = 2;
        this.itemGapX = 4;

        this.childKeyPressed = function(e){
            console.log("childKeyPressed : " + e.code);

            if (e.code === KE.ESCAPE) {
                this.stopEditing(false);
            }
            else {
                if (e.code === KE.ENTER) {
                    if ((zebra.instanceOf(e.source, ui.TextField) === false) ||
                        (zebra.instanceOf(e.source.view.target, zebra.data.SingleLineTxt)))
                    {
                        this.stopEditing(true);
                    }
                }
            }
        };

        this.catchScrolled = function (psx, psy){
            if (this.kids.length > 0) this.stopEditing(false);

            if (this.firstVisible == null) this.firstVisible = this.model.root;
            this.firstVisible = (this.y < psy) ? this.nextVisible(this.firstVisible)
                                               : this.prevVisible(this.firstVisible);
            this.repaint();
        };

        this.laidout = function() {
            this.vVisibility();
        };

        this.getItemPreferredSize = function(root) {
            var ps = this.provider.getView(this, root).getPreferredSize();
            ps.width  += this.itemGapX * 2;
            ps.height += this.itemGapY * 2;
            return ps;
        };

        this.paintItem = function(g, root, node, x, y) {
            if (root != this.editedItem){
                var v = this.provider.getView(this, root);
                v.paint(g, x + this.itemGapX, y + this.itemGapY,
                        node.viewWidth, node.viewHeight, this);
            }
        };

        /**
         * Initiate the given item editing if the specified event matches condition
         * @param  {zebra.data.Item} item an item to be edited
         * @param  {zebra.ui.InputEvent} e an even that may trigger the item editing
         * @return {Boolean}  return true if an item editing process has been started,
         * false otherwise
         * @method  se
         * @private
         */
        this.se = function (item,e ){
            if (item != null){
                this.stopEditing(true);
                if (this.editors != null && this.editors.shouldStartEdit(item, e)) {
                    this.startEditing(item);
                    return true;
                }
            }
            return false;
        };

        this.pointerClicked = function(e){
            if (this.se(this.pressedItem, e)) {
                this.pressedItem = null;
            }
        };

        this.pointerDoubleClicked = function(e) {
            if (this.se(this.pressedItem, e)) {
                this.pressedItem = null;
            }
            else {
                if (this.selected != null &&
                    this.getItemAt(this.firstVisible, e.x, e.y) == this.selected)
                {
                    this.toggle(this.selected);
                }
            }
        };

        this.pointerReleased = function(e){
            if (this.se(this.pressedItem, e)) this.pressedItem = null;
        };

        this.keyTyped = function(e){
            if (this.selected != null){
                switch(e.ch) {
                    case '+': if (this.isOpen(this.selected) === false) {
                        this.toggle(this.selected);
                    } break;
                    case '-': if (this.isOpen(this.selected)) {
                        this.toggle(this.selected);
                    } break;
                }
            }
        };

        this.keyPressed = function(e){
            var newSelection = null;
            switch(e.code) {
                case KE.DOWN    :
                case KE.RIGHT   : newSelection = this.findNext(this.selected);break;
                case KE.UP      :
                case KE.LEFT    : newSelection = this.findPrev(this.selected);break;
                case KE.HOME    : if (e.ctrlKey) this.select(this.model.root);break;
                case KE.END     : if (e.ctrlKey) this.select(this.findLast(this.model.root));break;
                case KE.PAGEDOWN: if (this.selected != null) this.select(this.nextPage(this.selected, 1));break;
                case KE.PAGEUP  : if (this.selected != null) this.select(this.nextPage(this.selected,  -1));break;
                //!!!!case KE.ENTER: if(this.selected != null) this.toggle(this.selected);break;
            }
            if (newSelection != null) this.select(newSelection);
            this.se(this.selected, e);
        };

        /**
         * Start editing the given if an editor for the item has been defined.
         * @param  {zebra.data.Item} item an item whose content has to be edited
         * @method startEditing
         * @protected
         */
        this.startEditing = function (item){
            this.stopEditing(true);
            if (this.editors != null){
                var editor = this.editors.getEditor(this, item);
                if (editor != null) {
                    this.editedItem = item;
                    var b  = this.getItemBounds(this.editedItem),
                        ps = editor.getPreferredSize();

                    editor.setBounds(b.x + this.scrollManager.getSX() + this.itemGapX,
                                     b.y - Math.floor((ps.height - b.height + 2 * this.itemGapY) / 2) +
                                     this.scrollManager.getSY() + this.itemGapY,
                                     ps.width, ps.height);

                    this.add(editor);
                    ui.focusManager.requestFocus(editor);
                    this._.editingStarted(this, item, editor);
                }
            }
        };

        /**
         * Stop editing currently edited tree item and apply or discard the result of the
         * editing to tree data model.
         * @param  {Boolean} true if the editing result has to be applied to tree data model
         * @method stopEditing
         * @protected
         */
        this.stopEditing = function(applyData){
            if (this.editors != null && this.editedItem != null) {
                var item     = this.editedItem,
                    oldValue = item.value,
                    editor   = this.kids[0];

                try {
                    if (applyData)  {
                        this.model.setValue(this.editedItem,
                                            this.editors.fetchEditedValue(this.editedItem, this.kids[0]));
                    }
                }
                finally {
                    this.editedItem = null;
                    this.removeAt(0);
                    this.requestFocus();
                    this._.editingStopped(this, item, oldValue, editor, applyData);
                }
            }
        };
    },

    function (d, b){
        if (arguments.length < 2) {
            b  = true;
        }

        this.provider = this.editedItem = this.pressedItem = null;

        /**
         * A tree model items view provider
         * @readOnly
         * @attribute provider
         * @default an instance of zebra.ui.tree.DefsViews
         * @type {zebra.ui.tree.DefsViews}
         */

        /**
         * A tree model editor provider
         * @readOnly
         * @attribute editors
         * @default null
         * @type {zebra.ui.tree.DefEditors}
         */

        this.editors = null;
        this.setViewProvider(new pkg.DefViews());
        this.$super(d, b);
    },

    function toggle(item) {
        this.stopEditing(false);
        this.$super(item);
    },

    function itemInserted(target,item){
        this.stopEditing(false);
        this.$super(target,item);
    },

    function itemRemoved(target,item){
        this.stopEditing(false);
        this.$super(target,item);
    },

    /**
     * Set the given editor provider. The editor provider is a class that is used to decide which UI
     * component has to be used as an item editor, how the editing should be triggered and how the
     * edited value has to be fetched from an UI editor.
     * @param {zebra.ui.tree.DefEditors} p an editor provider
     * @method setEditorProvider
     */
    function setEditorProvider(p){
        if (p != this.editors){
            this.stopEditing(false);
            this.editors = p;
        }
    },

    /**
     * Set tree component items view provider. Provider says how tree model items
     * have to be visualized.
     * @param {zebra.ui.tree.DefViews} p a view provider
     * @method setViewProvider
     */
    function setViewProvider(p){
        if (this.provider != p) {
            this.stopEditing(false);
            this.provider = p;
            delete this.nodes;
            this.nodes = {};
            this.vrp();
        }
    },

    /**
     * Set the given tree model to be visualized with the UI component.
     * @param {zebra.data.TreeModel|Object} d a tree model
     * @method setModel
     */
    function setModel(d){
        this.stopEditing(false);
        this.$super(d);
    },

    function paintSelectedItem(g, root, node, x, y) {
        if (root != this.editedItem) {
            this.$super(g, root, node, x, y);
        }
    },

    function itemPressed(root, e) {
        this.$super(root, e);
        if (this.se(root, e) === false) this.pressedItem = root;
    },

    function pointerPressed(e){
        this.pressedItem = null;
        this.stopEditing(true);
        this.$super(e);
    }
]);

/**
 * Component tree component that expects other UI components to be a tree model values.
 * In general the implementation lays out passed via tree model UI components as tree
 * component nodes. For instance:

     var tree = new zebra.ui.tree.Tree({
          value: new zebra.ui.Label("Label root item"),
          kids : [
                new zebra.ui.Checkbox("Checkbox Item"),
                new zebra.ui.Button("Button item"),
                new zebra.ui.Combo(["Combo item 1", "Combo item 2"])
         ]
     });

 * But to prevent unexpected navigation it is better to use number of predefined
 * with component tree UI components:

   - zebra.ui.tree.CompTree.Label
   - zebra.ui.tree.CompTree.Checkbox
   - zebra.ui.tree.CompTree.Combo

 * You can describe tree model keeping in mind special notation

     var tree = new zebra.ui.tree.Tree({
          value: "Label root item",  // zebra.ui.tree.CompTree.Label
          kids : [
                "[ ] Checkbox Item 1", // unchecked zebra.ui.tree.CompTree.Checkbox
                "[x] Checkbox Item 2", // checked zebra.ui.tree.CompTree.Checkbox
                ["Combo item 1", "Combo item 2"] // zebra.ui.tree.CompTree.Combo
         ]
     });

 *
 * @class  zebra.ui.tree.CompTree
 * @constructor
 * @extends zebra.ui.tree.BaseTree
 * @param {Object|zebra.data.TreeModel} [model] a tree data model passed as JavaScript
 * structure or as an instance
 * @param {Boolean} [b] the tree component items toggle state. true to have all items
 * in opened state.
 */
pkg.CompTree = Class(pkg.BaseTree, [
    function $clazz() {
        this.Label = Class(ui.Label, [
            function $prototype() {
                this.canHaveFocus = true;
            }
        ]);

        this.Checkbox = Class(ui.Checkbox, []);

        this.Combo = Class(ui.Combo, [
            function keyPressed(e) {
                if (e.code != KE.UP && e.code != KE.DOWN) {
                    this.$super(e);
                }
            }
        ]);
    },

    function $prototype() {
        this.$blockCIE = false;
        this.canHaveFocus = false;

        this.getItemPreferredSize = function(root) {
            return root.value.getPreferredSize();
        };


        this.childKeyTyped = function(e) {
            if (this.selected != null){
                switch(e.ch) {
                    case '+': if (this.isOpen(this.selected) === false) {
                        this.toggle(this.selected);
                    } break;
                    case '-': if (this.isOpen(this.selected)) {
                        this.toggle(this.selected);
                    } break;
                }
            }
        };

        this.childKeyPressed = function(e) {
            if (this.isSelectable === true){
                var newSelection = (e.code == KE.DOWN) ? this.findNext(this.selected)
                                                       : (e.code == KE.UP) ? this.findPrev(this.selected)
                                                                           : null;
                if (newSelection != null) {
                    this.select(newSelection);
                }
            }
        };

        this.childPointerPressed = this.childFocusGained = function(e) {
            if (this.isSelectable === true && this.$blockCIE !== true) {
                this.$blockCIE = true;
                try {
                    var item = zebra.data.TreeModel.findOne(this.model.root,
                                                            zebra.layout.getDirectChild(this,
                                                                                        e.source));
                    if (item != null) this.select(item);
                }
                finally {
                    this.$blockCIE = false;
                }
            }
        }

        this.childFocusLost = function(e) {
            if (this.isSelectable === true) {
                this.select(null);
            }
        };

        this.catchScrolled = function(psx, psy){
            this.vrp();
        };

        this.doLayout = function() {
            this.vVisibility();

            // hide all components
            for(var i=0; i < this.kids.length; i++) {
                this.kids[i].setVisible(false);
            }


            if (this.firstVisible != null) {
                var $this = this, fvNode = this.getIM(this.firstVisible), started = 0;


                this.model.iterate(this.model.root, function(item) {
                    var node = $this.nodes[item];  // slightly improve performance
                                                   // (instead of calling $this.getIM(...))

                    if (started === 0 && item == $this.firstVisible) {
                        started = 1;
                    }

                    if (started === 1) {
                        var sy = $this.scrollManager.getSY();

                        if (node.y + sy < $this.height) {
                            var image = $this.getIconBounds(item),
                                x = image.x + image.width +
                                           (image.width > 0 || $this.getToggleSize().width > 0 ? $this.gapx : 0) +
                                           $this.scrollManager.getSX(),
                                y = node.y + Math.floor((node.height - node.viewHeight) / 2) + sy;

                            item.value.setVisible(true);
                            item.value.setLocation(x, y);
                            item.value.width  = node.viewWidth;
                            item.value.height = node.viewHeight;
                        }
                        else {
                            started = 2;
                        }
                    }

                    return (started === 2) ? 2 : (node.isOpen === false ? 1 : 0);
                });
            }
        };
    },

    function itemInserted(target, item){
        this.add(item.value);
    },

    function itemRemoved(target,item){
        this.$super(target,item);
        this.remove(item.value);
    },

    function setModel(d){
        var old = this.model;
        this.$super(d);

        if (old != this.model) {
            this.removeAll();

            if (this.model != null) {
                var $this = this;
                this.model.iterate(this.model.root, function(item) {
                    if (item.value == null ||
                        zebra.isString(item.value))
                    {
                        if (item.value == null) item.value = "";
                        item.value = item.value.trim();

                        var m = item.value.match(/\[\s*(.*)\s*\](.*)/);

                        if (m != null) {
                            item.value = new $this.$clazz.Checkbox(m[2]);
                            item.value.setValue(m[1].trim().length > 0);
                        }
                        else {
                            item.value = new $this.$clazz.Label(item.value);
                        }
                    }
                    else {
                        if (Array.isArray(item.value)) {
                            item.value = new $this.$clazz.Combo(item.value);
                        }
                    }

                    $this.add(item.value);
                });
            }
        }
    },

    function select(item) {
        if (this.isSelectable === true) {
            var old = this.selected;

            if (old != null && old.value.hasFocus()) {
                ui.focusManager.requestFocus(null);
            }

            this.$super(item);

            if (item != null) {
                item.value.requestFocus();
            }

        }
    },

    function makeVisible(item) {
       item.value.setVisible(true);
       this.$super(item);
    }
]);

/**
 * @for
 */

})(zebra("ui.tree"), zebra.Class, zebra.ui);
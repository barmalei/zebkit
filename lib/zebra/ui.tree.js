(function(pkg, Class, ui)  {

var KE = ui.KeyEvent,
    IM = function(b) {
        this.width = this.height = this.x = this.y = this.viewHeight = 0;
        this.viewWidth = -1;
        this.isOpen = b;
    },
    TreeListeners = zebra.util.Listeners.Class("toggled", "selected");

pkg.DefEditors = Class([
    function (){
        this.tf = new ui.TextField(new zebra.data.SingleLineTxt(""));
        this.tf.setBackground("white");
        this.tf.setBorder(null);
        this.tf.setPadding(0);
    },

    function $prototype() {
        this.getEditor = function(src,item){
            var o = item.value;
            this.tf.setValue((o == null) ? "" : o.toString());
            return this.tf;
        };

        this.fetchEditedValue = function(src,editor){ return editor.view.target.getValue(); };

        this.shouldStartEdit = function(src,e){
            return (e.ID == ui.MouseEvent.CLICKED && e.clicks > 1) ||
                   (e.ID == KE.PRESSED && e.code == KE.ENTER);
        };
    }
]);

pkg.DefViews = Class([
    function $prototype() {
        this.getView = function (d, obj){
            if (obj.value && obj.value.paint) return obj.value;
            this.defaultRender.target.setValue(obj.value == null ? "<null>" : obj.value);
            return this.defaultRender;
        };
    },

    function() {
        this.defaultRender = new ui.TextRender("");
        this.defaultRender.setFont(pkg.Tree.font);
        this.defaultRender.setColor(pkg.Tree.fontColor);
    }
]);

pkg.Tree = Class(ui.Panel, ui.MouseListener, ui.KeyListener, ui.ChildrenListener, [
    function $prototype() {
        this.itemGapY = this.gapx = this.gapy = 2;
        this.itemGapX = 4;

        this.canHaveFocus = function() { return true; };

        this.childInputEvent = function(e){
            if(e.ID == KE.PRESSED){
                var kc = e.code;
                if(kc == KE.ESCAPE) this.stopEditing(false);
                else {
                    if(kc == KE.ENTER){
                        if(!(zebra.instanceOf(e.source, ui.TextField)) ||
                            (zebra.instanceOf(e.source.view.target, zebra.data.SingleLineTxt))){
                            this.stopEditing(true);
                        }
                    }
                }
            }
        };

        this.isInvalidatedByChild = function (c){ return false; };

        this.catchScrolled = function (psx,psy){
            this.stopEditing(true);
            if(this.firstVisible == null) this.firstVisible = this.model.root;
            this.firstVisible = (this.y < psy) ? this.nextVisible(this.firstVisible)
                                               : this.prevVisible(this.firstVisible);
            this.repaint();
        };

        this.isOpen = function(i){
            this.validate();
            return this.isOpen_(i);
        };

        this.getItemMetrics = function(i){
            this.validate();
            return this.getIM(i);
        };

        this.laidout = function() { this.vVisibility(); };

        this.vVisibility = function (){
            if (this.model == null) this.firstVisible = null;
            else {
                var nva = ui.$cvp(this, {});
                if (nva == null) this.firstVisible = null;
                else
                {
                    if (this._isVal === false ||
                        (this.visibleArea == null || this.visibleArea.x != nva.x ||
                         this.visibleArea.y != nva.y || this.visibleArea.width != nva.width ||
                         this.visibleArea.height != nva.height))
                    {
                        this.visibleArea = nva;
                        if(this.firstVisible != null){
                            this.firstVisible = this.findOpened(this.firstVisible);
                            this.firstVisible = this.isAbove(this.firstVisible) ? this.nextVisible(this.firstVisible)
                                                                                : this.prevVisible(this.firstVisible);
                        }
                        else
                            this.firstVisible = (-this.scrollManager.getSY() > ~~(this.maxh / 2)) ? this.prevVisible(this.findLast(this.model.root))
                                                                                         : this.nextVisible(this.model.root);
                    }
                }
            }
            this._isVal = true;
        };

        this.recalc = function (){
            this.maxh = this.maxw = 0;
            if(this.model != null && this.model.root != null){
                this.recalc_(this.getLeft(), this.getTop(), null, this.model.root, true);
                this.maxw -= this.getLeft();
                this.maxh -= this.gapy;
            }
        };

        this.getViewBounds = function(root){
            var metrics = this.getIM(root), toggle = this.getToggleBounds(root), image = this.getImageBounds(root);
            toggle.x = image.x + image.width + (image.width > 0 || toggle.width > 0 ? this.gapx : 0);
            toggle.y = metrics.y + ~~((metrics.height - metrics.viewHeight) / 2);
            toggle.width = metrics.viewWidth;
            toggle.height = metrics.viewHeight;
            return toggle;
        };

        this.getToggleBounds = function(root){
            var node = this.getIM(root), d = this.getToggleSize(root);
            return { x:node.x, y:node.y + ~~((node.height - d.height) / 2), width:d.width, height:d.height };
        };

        this.getToggleView = function(i){
            return i.kids.length > 0 ? (this.getIM(i).isOpen ? this.views["on"]
                                                             : this.views["off"]) : null;
        };

        this.getItemAt = function(x,y){
            this.validate();
            return this.firstVisible == null ? null : this.getItemAt_(this.firstVisible, x, y);
        };

        this.recalc_ = function (x,y,parent,root,isVis){
            var node = this.getIM(root);
            if(isVis === true){
                if(node.viewWidth < 0){
                    var viewSize = this.provider.getView(this, root).getPreferredSize();
                    node.viewWidth = viewSize.width === 0 ? 5 : viewSize.width + this.itemGapX * 2;
                    node.viewHeight = viewSize.height + this.itemGapY * 2;
                }
                var imageSize = this.getImageSize(root), toggleSize = this.getToggleSize(root);
                if(parent != null){
                    var pImg = this.getImageBounds(parent);
                    x = pImg.x + ~~((pImg.width - toggleSize.width) / 2);
                }
                node.x = x;
                node.y = y;
                node.width = toggleSize.width + imageSize.width +
                             node.viewWidth + (toggleSize.width > 0 ? this.gapx : 0) + (imageSize.width > 0 ? this.gapx : 0);
                node.height = Math.max(Math.max(toggleSize.height, imageSize.height), node.viewHeight);
                if(node.x + node.width > this.maxw) this.maxw = node.x + node.width;
                this.maxh += (node.height + this.gapy);
                x = node.x + toggleSize.width + (toggleSize.width > 0 ? this.gapx : 0);
                y += (node.height + this.gapy);
            }
            var b = node.isOpen && isVis;
            if(b){
                var count = root.kids.length;
                for(var i = 0;i < count; i++) y = this.recalc_(x, y, root, root.kids[i], b);
            }
            return y;
        };

        this.isOpen_ = function (i){
            return i == null || (i.kids.length > 0 && this.getIM(i).isOpen && this.isOpen_(i.parent));
        };

        this.getIM = function (i){
            var node = this.nodes[i];
            if(typeof node === 'undefined'){
                node = new IM(this.isOpenVal);
                this.nodes[i] = node;
            }
            return node;
        };

        this.getItemAt = function(root,x,y){
            if(y >= this.visibleArea.y && y < this.visibleArea.y + this.visibleArea.height){
                var dx = this.scrollManager.getSX(), dy = this.scrollManager.getSY(),
                    found = this.getItemAtInBranch(root, x - dx, y - dy);

                if (found != null) return found;

                var parent = root.parent;
                while(parent != null){
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
            if(root != null){
                var node = this.getIM(root);
                if (x >= node.x && y >= node.y && x < node.x + node.width && y < node.y + node.height + this.gapy) return root;
                if (this.isOpen_(root)){
                    for(var i = 0;i < root.kids.length; i++) {
                        var res = this.getItemAtInBranch(root.kids[i], x, y);
                        if(res != null) return res;
                    }
                }
            }
            return null;
        };

        this.getImageView = function (i){
            return i.kids.length > 0 ? (this.getIM(i).isOpen ? this.views["open"]
                                                             : this.views["close"])
                                     : this.views["least"];
        };

        this.getImageSize = function (i) {
            var v =  i.kids.length > 0 ? (this.getIM(i).isOpen ? this.viewSizes["open"]
                                                               : this.viewSizes["close"])
                                       : this.viewSizes["least"];
            return v ? v : { width:0, height:0 }; 
        };

        this.getImageBounds = function (root){
            var node = this.getIM(root), id = this.getImageSize(root), td = this.getToggleSize(root);
            return { x:node.x + td.width + (td.width > 0 ? this.gapx : 0),
                     y:node.y + ~~((node.height - id.height) / 2), width:id.width, height:id.height };
        };

        this.getImageY = function (root){
            var node = this.getIM(root);
            return node.y + ~~((node.height - this.getImageSize(root).height) / 2);
        };

        this.getToggleY = function (root){
            var node = this.getIM(root);
            return node.y + ~~((node.height - this.getToggleSize(root).height) / 2);
        };

        this.getToggleSize = function (i){
            return this.isOpen_(i) ? this.viewSizes["on"] : this.viewSizes["off"];
        };

        this.isAbove = function (i){
            var node = this.getIM(i);
            return node.y + node.height + this.scrollManager.getSY() < this.visibleArea.y;
        };

        this.findOpened = function (item){
            var parent = item.parent;
            return (parent == null || this.isOpen_(parent)) ? item : this.findOpened(parent);
        };

        this.findNext = function (item){
            if(item != null){
                if(item.kids.length > 0 && this.isOpen_(item)){
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
            if(item == null || this.isAbove(item)) return this.nextVisible(item);
            var parent = null;
            while((parent = item.parent) != null){
                for(var i = parent.kids.indexOf(item) - 1;i >= 0; i-- ){
                    var child = parent.kids[i];
                    if (this.isAbove(child)) return this.nextVisible(child);
                }
                item = parent;
            }
            return item;
        };

        this.isVerVisible = function (item){
            if(this.visibleArea == null) return false;
            var node = this.getIM(item), yy1 = node.y + this.scrollManager.getSY(), yy2 = yy1 + node.height - 1,
                by = this.visibleArea.y + this.visibleArea.height;

            return ((this.visibleArea.y <= yy1 && yy1 < by) ||
                    (this.visibleArea.y <= yy2 && yy2 < by) ||
                    (this.visibleArea.y > yy1 && yy2 >= by)    );
        };

        this.nextVisible = function (item){
            if (item == null || this.isVerVisible(item)) return item;
            var res = this.nextVisibleInBranch(item), parent = null;
            if(res != null) return res;
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
            if(this.isVerVisible(item)) return item;
            if(this.isOpen_(item)){
                for(var i = 0;i < item.kids.length; i++){
                    var res = this.nextVisibleInBranch(item.kids[i]);
                    if(res != null) return res;
                }
            }
            return null;
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
            if(root == null) return false;
            var node = this.getIM(root), dx = this.scrollManager.getSX(), dy = this.scrollManager.getSY(), va = this.visibleArea;
            if (zebra.util.isIntersect(node.x + dx, node.y + dy, node.width, node.height,
                                       va.x, va.y, va.width, va.height))
            {
                var toggle = this.getToggleBounds(root), toggleView = this.getToggleView(root);
                if(toggleView != null) {
                    toggleView.paint(g, toggle.x, toggle.y, toggle.width, toggle.height, this);
                }

                var image = this.getImageBounds(root);
                if(image.width > 0) this.getImageView(root).paint(g, image.x, image.y, image.width, image.height, this);

                var vx = image.x + image.width + (image.width > 0 || toggle.width > 0 ? this.gapx : 0),
                    vy = node.y + ~~((node.height - node.viewHeight) / 2);

                if(this.selected == root && root != this.editedItem){
                    var selectView = this.views[this.hasFocus()?"aselect":"iselect"];
                    if(selectView != null) selectView.paint(g, vx, vy, node.viewWidth, node.viewHeight, this);
                }

                if(root != this.editedItem){
                    var vvv = this.provider.getView(this, root), vvvps = vvv.getPreferredSize();
                    vvv.paint(g, vx + this.itemGapX, vy + this.itemGapY, vvvps.width, vvvps.height, this);
                }

                if(this.lnColor != null){
                    g.setColor(this.lnColor);
                    var x1 = toggle.x + (toggleView == null ? ~~(toggle.width / 2) + 1 : toggle.width),
                        yy = toggle.y + ~~(toggle.height / 2) + 0.5;

                    g.beginPath();
                    g.moveTo(x1-1, yy);
                    g.lineTo(image.x, yy);
                    g.stroke();
                }
            }
            else{
                if(node.y + dy > this.visibleArea.y + this.visibleArea.height ||
                   node.x + dx > this.visibleArea.x + this.visibleArea.width)
                {
                    return false;
                }
            }
            return this.paintChild(g, root, 0);
        };

        this.y_ = function (item,isStart){
            var ty = this.getToggleY(item), th = this.getToggleSize(item).height, dy = this.scrollManager.getSY(),
                y = (item.kids.length > 0) ? (isStart ? ty + th : ty - 1) : ty + ~~(th / 2);
            if (y + dy < 0) y = -dy - 1;
            else if (y + dy > this.height) y = this.height - dy;
            return y;
        };

        this.paintChild = function (g,root,index){
            var b = this.isOpen_(root), vs = this.viewSizes;
            if(root == this.firstVisible && this.lnColor != null){
                g.setColor(this.lnColor);
                var y1 = this.getTop(), y2 = this.y_(root, false),
                    xx = this.getIM(root).x + ~~((b ? vs["on"].width
                                                    : vs["off"].width) / 2);
                g.beginPath();
                g.moveTo(xx + 0.5, y1);
                g.lineTo(xx + 0.5, y2);
                g.stroke();
            }
            if(b && root.kids.length > 0){
                var firstChild = root.kids[0];
                if(firstChild == null) return true;
                var x = this.getIM(firstChild).x + ~~((this.isOpen_(firstChild) ? vs["on"].width
                                                                                : vs["off"].width) / 2);
                var count = root.kids.length;
                if(index < count){
                    var y = (index > 0) ? this.y_(root.kids[index - 1], true)
                                        : this.getImageY(root) + this.getImageSize(root).height;
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

        this.se = function (item,e){
            if (item != null){
                this.stopEditing(true);
                if(this.editors != null && this.editors.shouldStartEdit(item, e)){
                    this.startEditing(item);
                    return true;
                }
            }
            return false;
        };

        this.paint = function(g){
            if (this.model != null){
                this.vVisibility();
                if (this.firstVisible != null){
                    var sx = this.scrollManager.getSX(), sy = this.scrollManager.getSY();
                    try{
                        g.translate(sx, sy);
                        this.paintTree(g, this.firstVisible);
                    }
                    finally{
                        g.translate(-sx,  -sy);
                    }
                }
            }
        };

        this.select = function(item){
            if (this.isSelectable && item != this.selected){
                var old = this.selected, m = null;
                this.selected = item;
                if(this.selected != null) this.makeVisible(this.selected);
                this._.selected(this, this.selected);

                if(old != null && this.isVerVisible(old)){
                    m = this.getItemMetrics(old);
                    this.repaint(m.x + this.scrollManager.getSX(), m.y + this.scrollManager.getSY(), m.width, m.height);
                }
                if(this.selected != null && this.isVerVisible(this.selected)){
                    m = this.getItemMetrics(this.selected);
                    this.repaint(m.x + this.scrollManager.getSX(), m.y + this.scrollManager.getSY(), m.width, m.height);
                }
            }
        };

        this.makeVisible = function(item){
            this.validate();
            var r = this.getViewBounds(item);
            this.scrollManager.makeVisible(r.x, r.y, r.width, r.height);
        };

        this.mouseClicked = function(e){
            if (this.se(this.pressedItem, e)) this.pressedItem = null;
            else {
                if(this.selected != null && e.clicks > 1 && e.isActionMask() &&
                   this.getItemAt(this.firstVisible, e.x, e.y) == this.selected)
                {
                    this.toggle(this.selected);
                }
            }
        };

        this.mouseReleased = function(e){ if (this.se(this.pressedItem, e)) this.pressedItem = null; };

        this.keyTyped = function(e){
            if (this.selected != null){
                switch(e.ch) {
                    case '+': if (this.isOpen(this.selected) === false) this.toggle(this.selected);break;
                    case '-': if (this.isOpen(this.selected)) this.toggle(this.selected);break;
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
                case KE.HOME    : if (e.isControlPressed()) this.select(this.model.root);break;
                case KE.END     : if (e.isControlPressed()) this.select(this.findLast(this.model.root));break;
                case KE.PAGEDOWN: if (this.selected != null) this.select(this.nextPage(this.selected, 1));break;
                case KE.PAGEUP  : if (this.selected != null) this.select(this.nextPage(this.selected,  - 1));break;
                //!!!!case KE.ENTER: if(this.selected != null) this.toggle(this.selected);break;
            }
            if (newSelection != null) this.select(newSelection);
            this.se(this.selected, e);
        };

        this.mousePressed = function(e){
            
            this.pressedItem = null;
            this.stopEditing(true);
        
            if (this.firstVisible != null && e.isActionMask()){
                var x = e.x, y = e.y, root = this.getItemAt(this.firstVisible, x, y);
                if (root != null){
                    x -= this.scrollManager.getSX();
                    y -= this.scrollManager.getSY();
                    var r = this.getToggleBounds(root);

                    if (x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height){
                        if (root.kids.length > 0) this.toggle(root);
                    }
                    else {
                        if (x > r.x + r.width) this.select(root);
                        if (this.se(root, e) === false) this.pressedItem = root;
                    }
                }
            }
        };

        this.toggleAll = function (root,b){
            var model = this.model;
            if (root.kids.length > 0){
                if(this.getItemMetrics(root).isOpen != b) this.toggle(root);
                for(var i = 0;i < root.kids.length; i++ ){
                    this.toggleAll(root.kids[i], b);
                }
            }
        };

        this.toggle = function(item){
            if (item.kids.length > 0){
                this.stopEditing(true);
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
            this.stopEditing(false);
            this.vrp();
        };

        this.itemRemoved = function (target,item){
            if (item == this.firstVisible) this.firstVisible = null;
            this.stopEditing(false);
            if (item == this.selected) this.select(null);
            delete this.nodes[item];
            this.vrp();
        };

        this.itemModified = function (target,item){
            var node = this.getIM(item);
            if (node != null) node.viewWidth = -1;
            this.vrp();
        };

        this.startEditing = function (item){
            this.stopEditing(true);
            if(this.editors != null){
                var editor = this.editors.getEditor(this, item);
                if(editor != null){
                    this.editedItem = item;
                    var b = this.getViewBounds(this.editedItem), ps = editor.getPreferredSize();
                    editor.setLocation(b.x + this.scrollManager.getSX(),
                                       b.y - ~~((ps.height - b.height) / 2)+ this.scrollManager.getSY());
                    editor.setSize(ps.width, ps.height);
                    this.add(editor);
                    ui.focusManager.requestFocus(editor);
                }
            }
        };

        this.stopEditing = function(applyData){
            if(this.editors != null && this.editedItem != null){
                try{
                    if(applyData)  {
                        this.model.setValue(this.editedItem, this.editors.fetchEditedValue(this.editedItem, this.kids[0]));
                    }
                }
                finally{
                    this.editedItem = null;
                    this.removeAt(0);
                    this.requestFocus();
                }
            }
        };

        this.calcPreferredSize = function (target){
            return this.model == null ? { width:0, height:0 }
                                      : { width:this.maxw, height:this.maxh };
        };
    },

    function () { this.$this(null); },
    function (d){ this.$this(d, true);},

    function (d,b){
        this.provider = this.selected = this.firstVisible = this.editedItem = this.pressedItem = null;
        this.maxw = this.maxh = 0;
        
        this.visibleArea = this.lnColor = this.editors = null;

        this.views     = {};
        this.viewSizes = {};

        this._isVal = false;
        this.nodes = {};
        this._ = new TreeListeners(); 
        this.setLineColor("gray");

        this.isOpenVal = b;
        this.setModel(d);

        this.setViewProvider(new pkg.DefViews());

        this.setSelectable(true);
        this.$super();
        this.scrollManager = new ui.ScrollManager(this);
    },

    function focused(){ 
        this.$super();
        if (this.selected != null) {
            var m = this.getItemMetrics(this.selected);
            this.repaint(m.x + this.scrollManager.getSX(), m.y + this.scrollManager.getSY(), m.width, m.height);
        }
    },

    function setEditorProvider(p){
        if(p != this.editors){
            this.stopEditing(false);
            this.editors = p;
        }
    },

    function setSelectable(b){
        if(this.isSelectable != b){
            if (b === false && this.selected != null) this.select(null);
            this.isSelectable = b;
            this.repaint();
        }
    },

    function setLineColor(c){
        this.lnColor = c;
        this.repaint();
    },

    function setGaps(gx,gy){
        if((gx >= 0 && gx != this.gapx) || (gy >= 0 && gy != this.gapy)){
            this.gapx = gx < 0 ? this.gapx : gx;
            this.gapy = gy < 0 ? this.gapy : gy;
            this.vrp();
        }
    },

    function setViewProvider(p){
        if(p == null) p = this;
        if(this.provider != p){
            this.stopEditing(false);
            this.provider = p;
            delete this.nodes;
            this.nodes = {};
            this.vrp();
        }
    },

    function setViews(v){
        for(var k in v) {
            if (v.hasOwnProperty(k)) {
                var vv = ui.$view(v[k]);
                this.views[k] = vv;
                if (k != "aselect" && k != "iselect"){
                    this.stopEditing(false);
                    this.viewSizes[k] = vv ? vv.getPreferredSize() : null;
                    this.vrp();
                }
            }
        }
    },

    function setModel(d){
        if (this.model != d) {
            if (zebra.instanceOf(d, zebra.data.TreeModel) === false) {
                d = new zebra.data.TreeModel(d);
            }

            this.stopEditing(false);
            this.select(null);
            if(this.model != null && this.model._) this.model._.remove(this);
            this.model = d;
            if(this.model != null && this.model._) this.model._.add(this);
            this.firstVisible = null;
            delete this.nodes;
            this.nodes = {};
            this.vrp();
        }
    },

    function invalidate(){
        if (this.isValid){
            this._isVal = false;
            this.$super();
        }
    }
]);

pkg.TreeSignView = Class(ui.View, [
    function () {
        this.$this(true);
    },

    function (plus) {
        this.$this("white", "lightGray", plus);
    },

    function (color, bg, plus) {
        this.color = color;
        this.bg = bg;
        this.plus = plus;
        this.br = new ui.Border("rgb(65, 131, 215)", 1, 3);
    },

    function $prototype() {
        this.paint = function(g, x, y, w, h, d) {
            this.br.outline(g, x, y, w, h, d);

            g.setColor(this.bg);
            g.fill();
            this.br.paint(g, x, y, w, h, d);

            g.setColor(this.color);
            g.lineWidth = 2;
            x+=2;
            w-=4;
            h-=4;
            y+=2;
            g.beginPath();
            g.moveTo(x, y + h/2);
            g.lineTo(x + w, y + h/2);
            if (this.plus) {
                g.moveTo(x + w/2, y);
                g.lineTo(x + w/2, y + h);
            }

            g.stroke();
            g.lineWidth = 1;
        };

        this.getPreferredSize = function() {
            return { width:12, height:12};
        };
    }
]);

})(zebra("ui.tree"), zebra.Class, zebra.ui);
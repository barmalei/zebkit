(function(pkg, Class, ui)  {
    
var KE = ui.KeyEvent, Dimension = JAVA.awt.Dimension, Rectangle = JAVA.awt.Rectangle, Color = JAVA.awt.Color;
        
IM = function(b) {
    this.width = this.height = this.x = this.y = this.viewHeight = 0;
    this.viewWidth = -1;
    this.isOpen = b; 
}

pkg.DefEditors = Class([
    function (){
        this.tf = new ui.TextField(new zebra.data.SingleLineTxt(""));
        this.tf.setBackground(ui.view.Fill.white);
        this.tf.setBorder(null);
        this.tf.padding(0);
    },

    function getEditor(src,item){
        var o = item.value;
        this.tf.setText((o == null) ? "" : o.toString());
        return this.tf;
    },

    function fetchEditedValue(src,editor){ return editor.getModel().getText(); },

    function shouldStartEdit(src,e){
        return (e.ID == ui.MouseEvent.CLICKED && e.clicks == 2) || 
               (e.ID == KE.PRESSED && e.code == KE.VK_ENTER);
    }
]);

pkg.Tree = Class(ui.Panel, zebra.data.TreeModelListener, ui.view.ViewProvider, ui.MouseListener,
                 ui.KeyListener, ui.ScrollListener, ui.ChildrenListener, ui.FocusListener, function($) {
    var Tree = this,  ZERO = new Dimension(0,0);
    
    this.LEAST_VIEW = 0;
    this.OPENED_VIEW = 1;
    this.CLOSED_VIEW = 2;
    this.TOGGLE_OFF_VIEW = 3;
    this.TOGGLE_ON_VIEW = 4;
    this.ACTIVE_SEL_VIEW = 5;
    this.INACTIVE_SEL_VIEW = 6;
    this.SELECT_EVENT = 1;
    this.TOGGLE_EVENT = 2;
        
    $(function (){ this.$this(null); });
    $(function (d){ this.$this(d, true);});

    $(function (d,b){
        this.provider = this.selected = this.firstVisible = this.editedItem = this.pressedItem = null;
        this.gapx = this.gapy = 2;
        this.maxw = this.maxh = this.itemGapY = 0;
        this.itemGapX = 3;
        this.visibleArea = this.lnColor = this.editors = null;
    
        this.views = [null, null, null, null, null, null, null];
        this.viewSizes = Array(5);
        this.defaultRender = new ui.view.TextRender("");
        this._isVal = false;
        this.nodes = {};
        this._ = new zebra.util.Listeners();
        this.$super();
        this.setLineColor(Color.gray);
        this.isOpenVal = b;
        this.setModel(d);
        this.setViewProvider(this);
        this.setView(Tree.TOGGLE_ON_VIEW, ui.get("tree.on"));
        this.setView(Tree.TOGGLE_OFF_VIEW, ui.get("tree.off"));
        this.setView(Tree.LEAST_VIEW, ui.get("tree.least"));
        this.setView(Tree.OPENED_VIEW, ui.get("tree.open"));
        this.setView(Tree.CLOSED_VIEW, ui.get("tree.close"));
        this.setView(Tree.ACTIVE_SEL_VIEW, ui.get("tree.av"));
        this.setView(Tree.INACTIVE_SEL_VIEW, ui.get("tree.iv"));
        this.setSelectable(true);
        this.sman = new ui.SimpleScrollManager(this);
        this.setBackground(ui.get("tree.bg"));
        this.defaultRender.setFont(ui.get("tree.vp.fn"));
        this.defaultRender.setForeground(ui.get("tree.vp.fg"));
        this.customize(ui.Wizard.TREE);
    });

    $(function focusGained(e){ focusStateUpdated(this); });
    $(function focusLost(e){ focusStateUpdated(this); });
    $(function getScrollManager(){ return this.sman; });

    $(function setEditorProvider(p){
        if(p != this.editors){
            this.stopEditing(false);
            this.editors = p;
        }
    });

    $(function startEditing(item){
        this.stopEditing(true);
        if(this.editors != null){
            var editor = this.editors.getEditor(this, item);
            if(editor != null){
                this.editedItem = item;
                var b = this.getViewBounds(this.editedItem), ps = editor.getPreferredSize();
                editor.setLocation(b.x + this.sman.getSX(), 
                                   b.y - Math.floor((ps.height - b.height) / 2)+ this.sman.getSY());
                editor.setSize(ps.width, ps.height);
                this.add(editor);
                ui.focusManager.requestFocus(editor);
            }
        }
    });

    $(function stopEditing(applyData){
        if(this.editors != null && this.editedItem != null){
            try{
                if(applyData) 
                    this.model.set(this.editedItem, this.editors.fetchEditedValue(this.editedItem, this.kids[0]));
            }
            finally{
                this.editedItem = null;
                this.removeAt(0);
                this.requestFocus();
            }
        }
    });

    $(function canHaveFocus(){ return true; });

    $(function setSelectable(b){
        if(this.isSelectable != b){
            if(!b && this.selected != null) this.select(null);
            this.isSelectable = b;
            this.repaint();
        }
    });

    $(function setLineColor(c){
        this.lnColor = c;
        this.repaint();
    });

    $(function setGaps(gx,gy){
        if((gx >= 0 && gx != this.gapx) || (gy >= 0 && gy != this.gapy)){
            this.gapx = gx < 0 ? this.gapx : gx;
            this.gapy = gy < 0 ? this.gapy : gy;
            this.vrp();
        }
    });

    $(function setViewProvider(p){
        if(p == null) p = this;
        if(this.provider != p){
            this.stopEditing(false);
            this.provider = p;
            delete this.nodes;
            this.nodes = {};
            this.repaint();
        }
    });

    $(function setView(id,v){
        if(this.views[id] != v){
            this.views[id] = v;
            if(id < Tree.ACTIVE_SEL_VIEW){
                this.stopEditing(false);
                this.viewSizes[id] = (v == null) ? ZERO : v.getPreferredSize(); 
                this.vrp();
            }
        }
    });

    $(function getView(id){ return this.views[id]; });

    $(function setModel(d){
        if(this.model != d){
            this.stopEditing(false);
            this.select(null);
            if(this.model != null) this.model.removeTreeModelListener(this);
            this.model = d;
            if(this.model != null) this.model.addTreeModelListener(this);
            this.firstVisible = null;
            this.vrp();
        }
    });

    $(function paint(g){
        if(this.model != null){
            this.vVisibility();
            if(this.firstVisible != null){
                var sx = this.sman.getSX(), sy = this.sman.getSY();
                try{
                    g.translate(sx, sy);
                    paintTree(this, g, this.firstVisible);
                }
                finally{ g.translate(-sx,  -sy); }
            }
        }
    });

    $(function getView(d,obj){
        this.defaultRender.target.setText(obj.repr);
        return this.defaultRender;
    });

    $(function mouseClicked(e){
        if (se(this, this.pressedItem, e)) this.pressedItem = null;
        else
            if(this.selected != null && e.clicks > 1 && e.isActionMask() && 
               getItemAt(this, this.firstVisible, e.x, e.y) == this.selected)
            {
                this.toggle(this.selected);
            }
    });

    $(function mouseReleased(e){ if (se(this, this.pressedItem, e)) this.pressedItem = null; });

    $(function keyTyped(e){
        if(this.selected != null){
            switch(e.ch) {
                case '+': if( !this.isOpen(this.selected)) this.toggle(this.selected);break;
                case '-': if(this.isOpen(this.selected)) this.toggle(this.selected);break;
            }
        }
    });

    $(function keyPressed(e){
        var newSelection = null;
        switch(e.code) {
            case KE.VK_DOWN:
            case KE.VK_RIGHT: newSelection = findNext(this, this.selected);break;
            case KE.VK_UP:
            case KE.VK_LEFT: newSelection = findPrev(this, this.selected);break;
            case KE.VK_HOME: if(e.isControlPressed()) this.select(this.model.root);break;
            case KE.VK_END:  if(e.isControlPressed()) this.select(findLast(this, this.model.root));break;
            case KE.VK_PAGE_DOWN: if(this.selected != null) this.select(nextPage(this, this.selected, 1));break;
            case KE.VK_PAGE_UP: if(this.selected != null) this.select(nextPage(this, this.selected,  - 1));break;
            //!!!!case KE.VK_ENTER: if(this.selected != null) this.toggle(this.selected);break;
        }
        if(newSelection != null) this.select(newSelection);
        se(this, this.selected, e);
    });

    $(function childInputEvent(e){
        if(e.ID == KE.PRESSED){
            var kc = e.code;
            if(kc == KE.VK_ESCAPE) this.stopEditing(false);
            else
                if(kc == KE.VK_ENTER){
                    if(!(zebra.instanceOf(e.source, ui.TextField)) || 
                        (zebra.instanceOf(e.source.getModel(), zebra.data.SingleLineTxt))){
                        this.stopEditing(true);
                    }
                }
        }
    });

    $(function mousePressed(e){
        this.pressedItem = null;
        this.stopEditing(true);
        if(this.firstVisible != null && e.isActionMask()){
            var x = e.x, y = e.y, root = getItemAt(this, this.firstVisible, x, y);
            if(root != null){
                x -= this.sman.getSX();
                y -= this.sman.getSY();
                var r = this.getToggleBounds(root);
                if(r.contains(x, y)){
                    if(this.model.hasChildren(root)) this.toggle(root);
                }
                else {
                    if(x > r.x + r.width) this.select(root);
                    if( !se(this, root, e)) this.pressedItem = root;
                }
            }
        }
    });

    $(function toggleAll(root,b){
        var model = this.model;
        if(model.hasChildren(root)){
            if(this.getItemMetrics(root).isOpen != b) this.toggle(root);
            for(var i = 0;i < model.getChildrenCount(root); i++ ){
                this.toggleAll(model.getChildAt(root, i), b);
            }
        }
    });

    $(function toggle(item){
        if(this.model.hasChildren(item)){
            this.stopEditing(true);
            this.validate();
            var node = getIM(this, item);
            node.isOpen = (node.isOpen ? false : true);
            this.invalidate();
            this._.fire(this, Tree.TOGGLE_EVENT, item);
            if( !node.isOpen && this.selected != null){
                var parent = this.selected;
                do {
                    parent = this.model.getParent(parent);
                }
                while(parent != item && parent != null);
                if(parent == item) this.select(item);
            }
            this.repaint();
        }
    });

    $(function select(item){
        if(this.isSelectable && item != this.selected){
            var old = this.selected, m = null;
            this.selected = item;
            if(this.selected != null) this.makeVisible(this.selected);
            this._.fire(this, Tree.SELECT_EVENT, this.selected);

            if(old != null && isVerVisible(this, old)){
                m = this.getItemMetrics(old);
                this.repaint(m.x + this.sman.getSX(), m.y + this.sman.getSY(), m.width, m.height);
            }
            if(this.selected != null && isVerVisible(this, this.selected)){
                m = this.getItemMetrics(this.selected);
                this.repaint(m.x + this.sman.getSX(), m.y + this.sman.getSY(), m.width, m.height);
            }
        }
    });

    $(function makeVisible(item){
        this.validate();
        var r = this.getViewBounds(item);
        this.sman.makeVisible(r.x, r.y, r.width, r.height);
    });

    $(function itemInserted(target,item){
        this.stopEditing(false);
        this.vrp();
    });

    $(function itemMoved(target,item,parent){
        this.firstVisible = null;
        this.stopEditing(false);
        this.vrp();
    });

    $(function itemRemoved(target,item){
        if(item == this.firstVisible) this.firstVisible = null;
        this.stopEditing(false);
        if(item == this.selected) this.select(null);
        delete this.nodes[item];
        this.vrp();
    });

    $(function itemModified(target,item){
        var node = getIM(this, item);
        if(node != null) node.viewWidth = -1;
        this.vrp();
    });

    $(function getItemAt(x,y){
        this.validate();
        return this.firstVisible == null ? null : getItemAt_(this, this.firstVisible, x, y);
    });

    $(function invalidate(){
        if(this.isValid){
            this._isVal = false;
            this.$super(this.invalidate);
        }
    });

    $(function isInvalidatedByChild(c){ return false; });

    $(function scrolled(psx,psy){
        this.stopEditing(true);
        if(this.firstVisible == null) this.firstVisible = this.model.root;
        this.firstVisible = (this.y < psy) ? nextVisible(this, this.firstVisible) : prevVisible(this, this.firstVisible);
        this.repaint();
    });

    $(function iItem(item){
        if(item == this.firstVisible) this.firstVisible = null;
        getIM(this, item).viewWidth =  -1;
        this.invalidate();
    });

    $(function iItems(){
        this.firstVisible = null;
        delete this.nodes;
        this.nodes = {}
        this.invalidate();
    });

    $(function isOpen(i){
        this.validate();
        return isOpen_(this, i);
    });

    $(function getItemMetrics(i){
        this.validate();
        return getIM(this, i);
    });

    $(function getDefaultRender(){ return (this.provider == this) ? this.defaultRender : null; });

    $(function calcPreferredSize(target){
        return this.model == null ? this.$super(this.calcPreferredSize,target) : new Dimension(this.maxw, this.maxh);
    });

    $(function laidout(){ this.vVisibility(); });

    $(function vVisibility(){
        if(this.model == null) this.firstVisible = null;
        else{
            var nva = this.cvp(new Rectangle());
            if(nva == null) this.firstVisible = null;
            else{
                if( !this._isVal || !nva.equals(this.visibleArea)){
                    this.visibleArea = nva;
                    if(this.firstVisible != null){
                        this.firstVisible = findOpened(this, this.firstVisible);
                        this.firstVisible = isAbove(this, this.firstVisible) ? nextVisible(this, this.firstVisible) : prevVisible(this, this.firstVisible);
                    }
                    else
                        this.firstVisible = (-this.sman.getSY() > Math.floor(this.maxh / 2)) ? prevVisible(this, findLast(this, this.model.root)) 
                                                                                             : nextVisible(this, this.model.root);
                }
            }
        }
        this._isVal = true;
    });

    $(function recalc(){
        this.maxh = this.maxw = 0;
        if(this.model != null && this.model.root != null){
            recalc_(this, this.getLeft(), this.getTop(), null, this.model.root, true);
            this.maxw -= this.getLeft();
            this.maxh -= this.gapy;
        }
    });

    $(function getViewBounds(root){
        var metrics = getIM(this, root), toggle = this.getToggleBounds(root), image = getImageBounds(this, root);
        toggle.x = image.x + image.width + (image.width > 0 || toggle.width > 0 ? this.gapx : 0);
        toggle.y = metrics.y + Math.floor((metrics.height - metrics.viewHeight) / 2);
        toggle.width = metrics.viewWidth;
        toggle.height = metrics.viewHeight;
        return toggle;
    });

    $(function getToggleBounds(root){
        var node = getIM(this, root), d = getToggleSize(this, root);
        return new Rectangle(node.x, node.y + Math.floor((node.height - d.height) / 2), d.width, d.height);
    });

    $(function getToggleView(i){
        return this.model.hasChildren(i) ? (getIM(this, i).isOpen ? this.views[Tree.TOGGLE_ON_VIEW] 
                                                                  : this.views[Tree.TOGGLE_OFF_VIEW]) : null;
    });

    function focusStateUpdated(t){
        if(t.selected != null){
            var m = t.getItemMetrics(t.selected);
            t.repaint(m.x + t.sman.getSX(), m.y + t.sman.getSY(), m.width, m.height);
        }
    }

    function recalc_(t, x,y,parent,root,isVis){
        var node = getIM(t, root);
        if(isVis == true){
            if(node.viewWidth < 0){
                var nodeView = t.provider.getView(t, root), viewSize = nodeView.getPreferredSize();
                node.viewWidth = viewSize.width == 0 ? 5 : viewSize.width + t.itemGapX * 2;
                node.viewHeight = viewSize.height + t.itemGapY * 2;
            }
            var imageSize = getImageSize(t, root), toggleSize = getToggleSize(t, root);
            if(parent != null){
                var pImg = getImageBounds(t, parent);
                x = pImg.x + Math.floor((pImg.width - toggleSize.width) / 2);
            }
            node.x = x;
            node.y = y;
            node.width = toggleSize.width + imageSize.width + 
                         node.viewWidth + (toggleSize.width > 0 ? t.gapx : 0) + (imageSize.width > 0 ? t.gapx : 0);
            node.height = Math.max(Math.max(toggleSize.height, imageSize.height), node.viewHeight);
            if(node.x + node.width > t.maxw) t.maxw = node.x + node.width;
            t.maxh += (node.height + t.gapy);
            x = node.x + toggleSize.width + (toggleSize.width > 0 ? t.gapx : 0);
            y += (node.height + t.gapy);
        }
        var b = node.isOpen && isVis;
        if(b){
            var count = t.model.getChildrenCount(root);
            for(var i = 0;i < count; i++) y = recalc_(t, x, y, root, t.model.getChildAt(root, i), b);
        }
        return y;
    }

    function isOpen_(t, i){
        return i == null || (t.model.hasChildren(i) && getIM(t, i).isOpen && isOpen_(t, t.model.getParent(i)));
    }

    function getIM(t, i){
        var node = t.nodes[i];
        if(typeof node === 'undefined'){
            node = new IM(t.isOpenVal);
            t.nodes[i] = node;
        }
        return node;
    }

    function getItemAt(t, root,x,y){
        if(y >= t.visibleArea.y && y < t.visibleArea.y + t.visibleArea.height){
            var dx = t.sman.getSX(), dy = t.sman.getSY();
            var found = getItemAtInBranch(t, root, x - dx, y - dy);
            if(found != null) return found;
            var parent = t.model.getParent(root);
            while(parent != null){
                var count = t.model.getChildrenCount(parent);
                for(var i = t.model.getChildIndex(root) + 1;i < count; i ++ ){
                    found = getItemAtInBranch(t, t.model.getChildAt(parent, i), x - dx, y - dy);
                    if(found != null) return found;
                }
                root = parent;
                parent = t.model.getParent(root);
            }
        }
        return null;
    }

    function getItemAtInBranch(t,root,x,y){
        if(root != null){
            var node = getIM(t, root);
            if(x >= node.x && y >= node.y && x < node.x + node.width && y < node.y + node.height + t.gapy) return root;
            if(isOpen_(t, root)){
                for(var i = 0;i < t.model.getChildrenCount(root); i ++ ){
                    var res = getItemAtInBranch(t, t.model.getChildAt(root, i), x, y);
                    if(res != null) return res;
                }
            }
        }
        return null;
    }

    function getImageView(t, i){
        return t.model.hasChildren(i) ? (getIM(t, i).isOpen ? t.views[Tree.OPENED_VIEW] 
                                                            : t.views[Tree.CLOSED_VIEW]) 
                                      : t.views[Tree.LEAST_VIEW];
    }

    function getImageSize(t, i){
        return t.model.hasChildren(i) ? (getIM(t, i).isOpen ? t.viewSizes[Tree.OPENED_VIEW] 
                                                            : t.viewSizes[Tree.CLOSED_VIEW]) 
                                      : t.viewSizes[Tree.LEAST_VIEW];
    }

    function getImageBounds(t, root){
        var node = getIM(t, root), id = getImageSize(t, root), td = getToggleSize(t, root);
        return new Rectangle(node.x + td.width + (td.width > 0 ? t.gapx : 0), 
                             node.y + Math.floor((node.height - id.height) / 2), id.width, id.height);
    }

    function getImageY(t, root){
        var node = getIM(t, root);
        return node.y + Math.floor((node.height - getImageSize(t,root).height) / 2);
    }

    function getToggleY(t, root){
        var node = getIM(t, root);
        return node.y + Math.floor((node.height - getToggleSize(t, root).height) / 2);
    }

    function getToggleSize(t, i){
        return isOpen_(t, i) ? t.viewSizes[Tree.TOGGLE_ON_VIEW] : t.viewSizes[Tree.TOGGLE_OFF_VIEW];
    }

    function isAbove(t, i){
        var node = getIM(t, i);
        return node.y + node.height + t.sman.getSY() < t.visibleArea.y;
    }

    function findOpened(t, item){
        var parent = t.model.getParent(item);
        return (parent == null || isOpen_(t, parent)) ? item : findOpened(t, parent);
    }

    function findNext(t, item){
        if(item != null){
            if(t.model.hasChildren(item) && isOpen_(t, item) && t.model.getChildrenCount(item) > 0){
                return t.model.getChildAt(item, 0);
            }
            var parent = null;
            while((parent = t.model.getParent(item)) != null){
                var index = t.model.getChildIndex(item);
                if(index + 1 < t.model.getChildrenCount(parent)) return t.model.getChildAt(parent, index + 1);
                item = parent;
            }
        }
        return null;
    }

    function findPrev(t, item){
        if(item != null){
            var parent = t.model.getParent(item);
            if(parent != null){
                var index = t.model.getChildIndex(item);
                return (index - 1 >= 0) ? findLast(t, t.model.getChildAt(parent, index - 1)) : parent;
            }
        }
        return null;
    }

    function findLast(t, item){
        return isOpen_(t, item) && t.model.getChildrenCount(item) > 0 ? findLast(t, t.model.getChildAt(item, t.model.getChildrenCount(item) - 1)) : item;
    }

    function prevVisible(t, item){
        if(item == null || isAbove(t, item)) return nextVisible(t, item);
        var parent = null;
        while((parent = t.model.getParent(item)) != null){
            for(var i = t.model.getChildIndex(item) - 1;i >= 0; i-- ){
                var child = t.model.getChildAt(parent, i);
                if(isAbove(t, child)) return nextVisible(t, child);
            }
            item = parent;
        }
        return item;
    }

    function isVerVisible(t, item){
        if(t.visibleArea == null) return false;
        var node = getIM(t, item);
        var yy1 = node.y + t.sman.getSY(), yy2 = yy1 + node.height - 1, by = t.visibleArea.y + t.visibleArea.height;
        return ((t.visibleArea.y <= yy1 && yy1 < by) || (t.visibleArea.y <= yy2 && yy2 < by) || (t.visibleArea.y > yy1 && yy2 >= by));
    }

    function nextVisible(t, item){
        if(item == null || isVerVisible(t, item)) return item;
        var res = nextVisibleInBranch(t, item), parent = null;
        if(res != null) return res;
        while((parent = t.model.getParent(item)) != null){
            var count = t.model.getChildrenCount(parent);
            for(var i = t.model.getChildIndex(item) + 1;i < count; i ++ ){
                res = nextVisibleInBranch(t, t.model.getChildAt(parent, i));
                if(res != null) return res;
            }
            item = parent;
        }
        return null;
    }

    function nextVisibleInBranch(t, item){
        if(isVerVisible(t, item)) return item;
        if(isOpen_(t, item)){
            for(var i = 0;i < t.model.getChildrenCount(item); i ++ ){
                var res = nextVisibleInBranch(t, t.model.getChildAt(item, i));
                if(res != null) return res;
            }
        }
        return null;
    }

    function paintTree(t, g,item){
        paintBranch(t, g, item);
        var parent = null;
        while((parent = t.model.getParent(item)) != null){
            paintChild(t, g, parent, t.model.getChildIndex(item) + 1);
            item = parent;
        }
    }

    function paintBranch(t, g,root){
        if(root == null) return false;
        var node = getIM(t, root), dx = t.sman.getSX(), dy = t.sman.getSY();
        if(t.visibleArea.intersects(node.x + dx, node.y + dy, node.width, node.height)){
            var toggle = t.getToggleBounds(root), toggleView = t.getToggleView(root);
            if(toggleView != null) toggleView.paint(g, toggle.x, toggle.y, t);
            var image = getImageBounds(t, root);
            if(image.width > 0) getImageView(t, root).paint(g, image.x, image.y, t);
            var vx = image.x + image.width + (image.width > 0 || toggle.width > 0 ? t.gapx : 0);
            var vy = node.y + Math.floor((node.height - node.viewHeight) / 2);
            if(t.selected == root && root != t.editedItem){
                var selectView = t.views[t.hasFocus()?Tree.ACTIVE_SEL_VIEW:Tree.INACTIVE_SEL_VIEW];
                if(selectView != null) selectView.paint(g, vx, vy, node.viewWidth, node.viewHeight, t);
            }
            if(root != t.editedItem){
                t.provider.getView(t, root).paint(g, vx + t.itemGapX, vy + t.itemGapY, t);
            }
            if(t.lnColor != null){
                g.setColor(t.lnColor);
                var x1 = toggle.x + (toggleView == null ? Math.floor(toggle.width / 2) + 1 : toggle.width) + 1
                var yy = toggle.y + Math.floor(toggle.height / 2);
                g.drawLine(x1, yy, image.x - 1, yy);
            }
        }
        else{
            if(node.y + dy > t.visibleArea.y + t.visibleArea.height || 
               node.x + dx > t.visibleArea.x + t.visibleArea.width)
                return false;
        }
        return paintChild(t, g, root, 0);
    }

    function y_(t, item,isStart){
        var ty = getToggleY(t, item), th = getToggleSize(t, item).height, dy = t.sman.getSY();
        var y = (t.model.hasChildren(item)) ? (isStart ? ty + th : ty - 1) : ty + Math.floor(th / 2);
        if(y + dy < 0) y =  -dy - 1;
        else if(y + dy > t.height) y = t.height - dy;
        return y;
    }

    function paintChild(t, g,root,index){
        var b = isOpen_(t, root), vs = t.viewSizes;
        if(root == t.firstVisible && t.lnColor != null){
            g.setColor(t.lnColor);
            var y1 = t.getTop(), y2 = y_(t, root, false);
            var xx = getIM(t, root).x + Math.floor((b ? vs[Tree.TOGGLE_ON_VIEW].width 
                                                      : vs[Tree.TOGGLE_OFF_VIEW].width) / 2);
            g.drawLine(xx, y1, xx, y2);
        }
        if(b && t.model.getChildrenCount(root) > 0){
            var firstChild = t.model.getChildAt(root, 0);
            if(firstChild == null) return true;
            var x = getIM(t, firstChild).x + Math.floor((isOpen_(t, firstChild) ? vs[Tree.TOGGLE_ON_VIEW].width 
                                                                                      : vs[Tree.TOGGLE_OFF_VIEW].width) / 2);
            var count = t.model.getChildrenCount(root);
            if(index < count){
                var y = (index > 0) ? y_(t, t.model.getChildAt(root, index - 1), true) 
                                    : getImageY(t, root) + getImageSize(t, root).height;
                for(var i = index;i < count; i ++ ){
                    var child = t.model.getChildAt(root, i);
                    if(t.lnColor != null){
                        g.setColor(t.lnColor);
                        g.drawLine(x, y, x, y_(t, child, false));
                        y = y_(t, child, true);
                    }
                    if(!paintBranch(t, g, child)){
                        if(t.lnColor != null && i + 1 != count){
                            g.setColor(t.lnColor);
                            g.drawLine(x, y, x, t.height - t.sman.getSY());
                        }
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function nextPage(t, item,dir){
        var sum = 0, prev = item;
        while(item != null && sum < t.visibleArea.height){
            sum += (getIM(t, item).height + t.gapy);
            prev = item;
            item = dir < 0 ? findPrev(t, item) : findNext(t, item);
        }
        return prev;
    }

    function se(t, item,e){
        if(item != null){
            t.stopEditing(true);
            if(t.editors != null && t.editors.shouldStartEdit(item, e)){
                t.startEditing(item);
                return true;
            }
        }
        return false;
    }
});

})(zebra("ui.tree"), zebra.Class, zebra.ui);
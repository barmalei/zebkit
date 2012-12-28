(function(pkg, Class) {

var L = zebra.layout, Position = zebra.util.Position, KE = pkg.KeyEvent, Listeners = zebra.util.Listeners;

pkg.BaseList = Class(pkg.Panel, pkg.MouseMotionListener, pkg.MouseListener, pkg.KeyListener,
                     Position.PositionMetric, pkg.ScrollListener, pkg.FocusListener, [

    function $prototype() {
        this.gap = 2;

        this.getItemGap = function() { return this.gap; };

        this.getSelected = function(){
            return this.selectedIndex < 0 ? null
                                          : this.model.get(this.selectedIndex);
        };

        this.lookupItem = function(ch){
            var count = this.model.count();
            if(zebra.util.isLetter(ch) && count > 0){
                var index = this.selectedIndex < 0 ? 0 : this.selectedIndex + 1;
                ch = ch.toLowerCase();
                for(var i = 0;i < count - 1; i++){
                    var idx = (index + i) % count, item = this.model.get(idx).toString();
                    if(item.length > 0 && item[0].toLowerCase() == ch) return idx;
                }
            }
            return -1;
        };

        this.isSelected = function(i) { return i == this.selectedIndex; };

        this.correctPM = function(x,y){
            if(this.isComboMode){
                var index = this.getItemIdxAt(x, y);
                if (index >= 0) this.position.setOffset(index);
            }
        };

        this.getItemLocation = function(i) {
            this.validate();
            var gap = this.getItemGap(), y = this.getTop() + this.getScrollManager().getSY() + gap;
            for(var i = 0;i < index; i++) y += (this.getItemSize(i).height + 2 * gap);
            return { x:this.getLeft(), y:y };
        };

        this.getItemSize = function (i){
            return this.provider.getView(this, this.model.get(i)).getPreferredSize();
        };

        this.mouseMoved = function(e){ this.correctPM(e.x, e.y); };

        this.getLines     = function() { return this.model.count();};
        this.getLineSize  = function(l){ return 1; };
        this.getMaxOffset = function (){ return this.getLines() - 1; };
        this.getScrollManager = function (){ return this.sman; };
        this.canHaveFocus = function (){ return true; };

        this.scrolled = function(psx,psy){ this.repaint();};
        this.getItemIdxAt = function(x,y){ return -1;};

        this.calcMaxItemSize = function (){
            var maxH = 0, maxW = 0;
            this.validate();
            for(var i = 0;i < this.model.count(); i ++ ){
                var is = this.getItemSize(i);
                if(is.height > maxH) maxH = is.height;
                if(is.width  > maxW) maxW = is.width;
            }
            return { width:maxW, height:maxH };
        };
    },

    function (m, b){
        this.selectedIndex = -1;
        this._ = new Listeners();
        this.sman = this.createScrollManager();
        this.isComboMode = b;
        this.$super();
        this.setModel(m);
        this.setPosition(new Position(this));
    },

    function setItemGap(g){
        if(this.gap != g){
            this.gap = g;
            this.vrp();
        }
    },

    function select(index){
        if(index >= this.model.count()){
            throw new Error("index=" + index + ",max=" + this.model.count());
        }

        if(this.selectedIndex != index){
            var prev = this.selectedIndex;
            this.selectedIndex = index;
            this.notifyScrollMan(index);
            this.repaint(prev, this.selectedIndex);
            this.fire(this, prev);
        }
        else this.fire(this, null);
    },

    function mousePressed(e){
        if (this.isComboMode === false && e.isActionMask()){
            var index = this.getItemIdxAt(e.x, e.y);
            if(index >= 0){
                if(this.position.offset != index) this.position.setOffset(index);
                else this.select(index);
            }
        }
    },

    function mouseEntered(e){  this.correctPM(e.x, e.y);},
    function mouseReleased(e){ if (this.isComboMode && e.isActionMask()) this.select(this.position.offset); },

    function keyPressed(e){
        if(this.model.count() > 0){
            switch(e.code)
            {
                case KE.VK_END:
                    if (e.isControlPressed()) this.position.setOffset(this.position.metrics.getMaxOffset());
                    else this.position.seekLineTo(Position.END);
                    break;
                case KE.VK_HOME:
                    if(e.isControlPressed()) this.position.setOffset(0);
                    else this.position.seekLineTo(Position.BEG);
                    break;
                case KE.VK_RIGHT: this.position.seek(1); break;
                case KE.VK_DOWN: this.position.seekLineTo(Position.DOWN); break;
                case KE.VK_LEFT: this.position.seek(-1);break;
                case KE.VK_UP: this.position.seekLineTo(Position.UP);break;
                case KE.VK_PAGE_UP: this.position.seek(this.pageSize(-1));break;
                case KE.VK_PAGE_DOWN: this.position.seek(this.pageSize(1));break;
                case KE.VK_ENTER: this.select(this.position.offset);break;
            }
        }
    },

    function keyTyped(e){
        var i = this.lookupItem(e.ch);
        if(i >= 0) this.select(i);
    },

    function focusGained(e){ this.repaint();},
    function focusLost(e){ this.repaint();},

    function posChanged(target,prevOffset,prevLine,prevCol){
        var off = this.position.offset;
        this.notifyScrollMan(off);
        if (this.isComboMode === false) this.select(off);
        this.repaint(prevOffset, off);
    },

    function setModel(m){
        if (m == null) throw new Error("Null list model");
        if (m != this.model){
            if (Array.isArray(m)) {
                m = new zebra.data.ListModel(m);
            }

            if (this.model != null && this.model._) this.model._.remove(this);
            this.model = m;
            if (this.model._) this.model._.add(this);
            this.vrp();
        }
    },

    function setPosition(c){
        if(c != this.position){
            if(this.position != null) this.position._.remove(this);
            this.position = c;
            this.position._.add(this);
            this.position.setPositionMetric(this);
            this.repaint();
        }
    },

    function setViewProvider(v){
        if(this.provider != v){
            this.provider = v;
            this.vrp();
        }
    },

    function update(g){
        if(this.selectedIndex >= 0 && this.views["select"] != null){
            var gap = this.getItemGap(), is = this.getItemSize(this.selectedIndex),
                l = this.getItemLocation(this.selectedIndex);

            this.drawSelMarker(g, l.x - gap, l.y - gap,
                               is.width + 2 * gap, is.height + 2 * gap);
        }
    },

    function paintOnTop(g){
        if (this.views["marker"] != null && (this.isComboMode || this.hasFocus())){
            var offset = this.position.offset;
            if(offset >= 0){
                var gap = this.getItemGap(), is = this.getItemSize(offset), l = this.getItemLocation(offset);
                this.drawPosMarker(g, l.x - gap, l.y - gap, is.width  + 2 * gap, is.height + 2 * gap);
            }
        }
    },

    function elementInserted(target, e,index){
        this.invalidate();
        if(this.selectedIndex >= 0 && this.selectedIndex >= index) this.selectedIndex ++ ;
        this.position.inserted(index, 1);
        this.repaint();
    },

    function elementRemoved(target, e,index){
        this.invalidate();
        if(this.selectedIndex == index || this.model.count() === 0) this.select(-1);
        else {
            if (this.selectedIndex > index) this.selectedIndex--;
        }
        this.position.removed(index, 1);
        this.repaint();
    },

    function elementSet(target, e, pe,index){
        this.invalidate();
        this.repaint();
    },

    function fire(src, data){ this._.fire(src, data); },

    function repaint(p,n){
        this.validate();
        var xx = this.width - this.getRight(), gap = this.getItemGap(),
            count = this.model.count();

        if(p >= 0 && p < count){
            var l = this.getItemLocation(p), x = l.x - gap, is = this.getItemSize(p) ;
            this.repaint(x, l.y - gap, xx - x, is.height + 2 * gap);
        }

        if(n >= 0 && n < count){
            var l = this.getItemLocation(n), x = l.x - gap, is = this.getItemSize(n);
            this.repaint(x, l.y - gap, xx - x, is.height + 2 * gap);
        }
    },

    function notifyScrollMan(index){
        if(index >= 0 && this.getScrollManager() != null){
            this.validate();
            var sman = this.getScrollManager(), gap = this.getItemGap(),
                dx = sman.getSX(), dy = sman.getSY(), is = this.getItemSize(index),
                l = this.getItemLocation(index);

            sman.makeVisible(l.x - dx - gap, l.y - dy - gap,
                             is.width + 2 * gap, is.height + 2 * gap);
        }
    },

    function pageSize(d){
        var offset = this.position.offset;
        if(offset >= 0){
            var vp = pkg.cvp(this, {});
            if (vp != null){
                var sum = 0, i = offset, gap = 2 * this.getItemGap();
                for(;i >= 0 && i <= this.position.metrics.getMaxOffset() && sum < vp.height; i += d){
                    sum += (this.getItemSize(i).height + gap);
                }
                return i - offset - d;
            }
        }
        return 0;
    },

    function drawSelMarker(g,x,y,w,h){ this.views["select"].paint(g, x, y, w, h, this); },
    function drawPosMarker(g,x,y,w,h){ this.views["marker"].paint(g, x, y, w, h, this); },

    function createScrollManager(){ return new pkg.ScrollManager(this);}
]);

pkg.List = Class(pkg.BaseList, [
    function $prototype() {
        this.paint = function(g){
            this.vVisibility();
            if (this.firstVisible >= 0){
                var sx = this.getScrollManager().getSX(), sy = this.getScrollManager().getSY();
                try {
                    g.translate(sx, sy);
                    var gap = this.getItemGap(), y = this.firstVisibleY, x = this.getLeft() + gap,
                        yy = this.vArea.y + this.vArea.height - sy, count = this.model.count(),
                        provider = this.provider;

                    for(var i = this.firstVisible;i < count; i++){
                        provider.getView(this, this.model.get(i)).paint(g, x, y, this.widths[i], this.heights[i], this);
                        y += (this.heights[i] + 2 * gap);
                        if (y > yy) break;
                    }
                }
                catch(e) { throw e; }
                finally { g.translate(-sx,  -sy); }
            }
        };

        this.recalc = function(){
            this.psWidth_ = this.psHeight_ = 0;
            var count = this.model.count();
            if(this.heights == null || this.heights.length != count) this.heights = Array(count);
            if(this.widths == null || this.widths.length != count) this.widths = Array(count);

            var provider = this.provider;
            if (provider != null)  {
                for(var i = 0;i < count; i++){
                    var ps = provider.getView(this, this.model.get(i)).getPreferredSize();
                    this.heights[i] = ps.height;
                    this.widths [i] = ps.width;
                    if (this.widths[i] > this.psWidth_) this.psWidth_ = this.widths[i];
                    this.psHeight_ += this.heights[i];
                }
            }
        };

        this.calcPreferredSize = function(l){
            var gap = 2 * this.getItemGap();
            return { width:gap + this.psWidth_, height:gap * this.model.count() + this.psHeight_ };
        };

        this.vVisibility = function(){
            this.validate();
            var prev = this.vArea;
            this.vArea = pkg.cvp(this, {});

            if(this.vArea == null) {
                this.firstVisible = -1;
                return;
            }

            if (this.visValid === false ||
                    (prev == null || prev.x != this.vArea.x ||
                     prev.y != this.vArea.y || prev.width != this.vArea.width ||
                     prev.height != this.vArea.height))
            {
                var top = this.getTop(), gap = this.getItemGap();
                if(this.firstVisible >= 0){
                    var dy = this.getScrollManager().getSY();
                    while(this.firstVisibleY + dy >= top && this.firstVisible > 0){
                        this.firstVisible--;
                        this.firstVisibleY -= (this.heights[firstVisible] + 2 * gap);
                    }
                }
                else{
                    this.firstVisible = 0;
                    this.firstVisibleY = top + gap;
                }

                if(this.firstVisible >= 0){
                    var count = this.model.count(), hh = this.height - this.getBottom();

                    for(; this.firstVisible < count; this.firstVisible++)
                    {
                        var y1 = this.firstVisibleY + this.getScrollManager().getSY(),
                            y2 = y1 + this.heights[this.firstVisible] - 1;

                        if ((y1 >= top && y1 < hh) || (y2 >= top && y2 < hh) || (y1 < top && y2 >= hh)) {
                            break;
                        }

                        this.firstVisibleY += (this.heights[firstVisible] + 2 * gap);
                    }

                    if(this.firstVisible >= count) this.firstVisible =  -1;
                }
                this.visValid = true;
            }
        };

        this.getItemLocation = function(index){
            this.validate();
            var gap = this.getItemGap(), y = this.getTop() + this.getScrollManager().getSY() + gap;
            for(var i = 0;i < index; i++) y += (this.heights[i] + 2 * gap);
            return { x:this.getLeft() + this.getItemGap(), y:y };
        };

        this.getItemSize = function(i){
            this.validate();
            return { width:this.widths[i], height:this.heights[i] };
        };

        this.getItemIdxAt = function(x,y){
            this.vVisibility();
            if (this.vArea != null && this.firstVisible >= 0) {
                var yy    = this.firstVisibleY + this.getScrollManager().getSY(), 
                    hh    = this.height - this.getBottom(),
                    count = this.model.count(), gap = this.getItemGap() * 2;

                for(var i = this.firstVisible; i < count; i++) {
                    if (y >= yy && y < yy + this.heights[i]) return i;
                    yy += (this.heights[i] + gap);
                    if (yy > hh) break;
                }
            }
            return  -1;
        };
    },

    function() { this.$this(false); },

    function (m) {
        if (zebra.isBoolean(m)) this.$this([], m);
        else this.$this(m, false);
    },

    function (m, b){
        this.firstVisible = -1;
        this.firstVisibleY = this.psWidth_ = this.psHeight_ = 0;
        this.heights = this.widths = this.vArea = null;
        this.visValid = false;
        this.setViewProvider(new zebra.Dummy([
            function () { this.text = new pkg.TextRender(""); },
            function getView(target, value) {
                if (value.paint) return value;
                this.text.target.setText(value.toString());
                return this.text;
            }
        ]));
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

    function scrolled(psx,psy){
        this.firstVisible = -1;
        this.visValid = false;
        this.$super(psx, psy);
    }
]);

pkg.CompList = Class(pkg.BaseList, pkg.Composite, [
    function $clazz() {
        this.Label = Class(pkg.Label, []);

        this.CompListModel = Class([
            function $prototype() {
                this.get = function (i) { return this.src.kids[i]; };

                this.set = function(item,i){
                    this.src.removeAt(i);
                    this.src.insert(item, i);
                };

                this.add = function(o){ this.src.add(zebra.isString(o)? new pkg.Label(s) : o); };

                this.removeAt = function (i){ this.src.removeAt(i);};

                this.insert = function (item,i){ this.src.insert(i, null, item); };

                this.count = function (){
                    return this.src.kids.length;
                };

                this.removeAll = function () { this.src.removeAll(); };
            },

            function(src) {
                this.src = src;
                this._ = new zebra.util.MListeners("elementInserted", "elementRemoved");
            }
        ]);
    },

    function $prototype() {
        this.scrolled = function(px,py) {};

        this.getItemLocation = function(i) {
            return { x:this.kids[i].x, y:this.kids[i].y };
        };

        this.getItemSize = function (i) {
            return { width:this.kids[i].width, height:this.kids[i].height };
        };

        this.recalc = function (){
            this.max = L.getMaxPreferredSize(this);
        };

        this.maxItemSize = function (){
            this.validate();
            return { width:this.max.width, height:this.max.height };
        };

        this.getItemIdxAt = function(x,y){
            return L.getDirectAt(x, y, this);
        };

        this.createScrollManager = function(){
            return new pkg.CompScrollManager(this);
        };

        this.getItemGap = function(){ return 0; };

        this.catchInput = function (child){
            if (this.isComboMode) return true;
            var b = this.input != null && L.isAncestorOf(this.input, child);
            if( b && this.input != null &&
                L.isAncestorOf(this.input, pkg.focusManager.focusOwner) &&
                this.hasFocus() === false)
            {
                this.input = null;
            }
            return (this.input == null || b === false);
        };
    },

    function (){ this.$this(false); },

    function (b){
        this.input = this.max = null;
        this.setViewProvider(new zebra.Dummy([
            function getView(target,obj) { return new pkg.CompRender(obj); }
        ]));
        this.$super(new pkg.CompList.CompListModel(this), b);
    },

    function setModel(m){
        if (zebra.instanceOf(m, pkg.CompList.CompListModel) === false) {
            throw new Error("Invalid model");
        }
        this.$super(m);
    },

    function setPosition(c){
        if(c != this.position){
            if (zebra.instanceOf(this.layout, Position.PositionMetric)) c.setPositionMetric(this.layout);
            this.$super(c);
        }
    },

    function setLayout(l){
         if(l != this.layout){
             this.$super(l);
             if (this.position != null) {
                this.position.setPositionMetric(zebra.instanceOf(l, Position.PositionMetric) ? l : this);
            }
         }
    },

    function focusGained(e){
        var o = this.position.offset;
        this.input = (o >= 0 && o == this.selectedIndex) ? this.model.get(this.position.offset) : null;
        this.$super(e);
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
        return this.$super(index, constr, zebra.isString(e) ? new pkg.CompList.Label(e) : e);
    },

    function kidAdded(index,constr,e){ this.model._.elementInserted(this, e, index); },
    function kidRemoved(index,e)     { this.model._.elementRemoved(this, e, index); }
]);

pkg.Combo = Class(pkg.Panel, pkg.MouseListener, pkg.KeyListener,
                  pkg.Composite, pkg.FocusListener, [
    function $clazz() {
        this.ContentPan = Class(pkg.Panel, [
            function getCombo() {
                var p = this;
                while((p = p.parent) && zebra.instanceOf(p, pkg.Combo) == false);
                return p;
            }
        ]);

        this.ComboPadPan = Class(pkg.ScrollPan, [
            function setParent(l){
                this.$super(l);
                if (l == null) this.time = zebra.util.currentTimeMillis();
            }
        ]);

        this.ReadonlyContentPan = Class(this.ContentPan, [
            function calcPreferredSize(l){
                var p = this.getCombo();
                return p ? p.list.calcMaxItemSize() : { width:0, height:0 };
            },

            function updateValue(v) {
            //    this.repaint();
            },

            function paintOnTop(g){
                var list = this.getCombo().list, selected = list.getSelected(),
                    v = selected != null ? list.provider.getView(list, selected) : null;

                if (v != null) {
                    var ps = v.getPreferredSize();
                    v.paint(g, this.getLeft(), this.getTop() + ~~((this.height - this.getTop() - this.getBottom() - ps.height) / 2),
                               this.width, this.height, this);
                }
            }
        ]);

        this.EditableContentPan = Class(this.ContentPan, pkg.FocusListener, [
            function (){
                this.$super(new L.BorderLayout());
                this._ = new zebra.util.Listeners("contentUpdated");
                this.isEditable = true;
                this.dontGenerateUpdateEvent = false;
                this.textField = new pkg.TextField("",  -1);
                this.textField.setBorder(null);
                this.textField.setBackground(null);
                this.textField.view.target._.add(this);
                this.add(L.CENTER, this.textField);
            },

            function textUpdated(src,b,off,size,startLine,lines){
                if (this.dontGenerateUpdateEvent === false) {
                    this._.fire(this, this.textField.getText());
                }
            },

            function focusGained(e){ this.textField.requestFocus(); },
            function focusLost(e){ this.textField.requestFocus(); },
            function canHaveFocus(){ return true; },

            function updateValue(v){
                this.dontGenerateUpdateEvent = true;
                try{
                    var txt = (v == null ? "" : v.toString());
                    this.textField.setText(txt);
                    this.textField.select(0, txt.length);
                }
                finally { this.dontGenerateUpdateEvent = false; }
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

    function() {
        this.$this(new pkg.Combo.List(true));
    },

    function(list){
        if (zebra.isBoolean(list)) this.$this(new pkg.Combo.List(true), list);
        else this.$this(list, false);
    },

    function(list, editable){
        if (zebra.instanceOf(list, pkg.BaseList) === false) {
            list = new pkg.Combo.List(list, true);
        }

        this.button = this.content = this.winpad = this.arrowGlyph = null;
        this.maxPadHeight = this.time = 0;
        this.lockListSelEvent = false;
        this._ = new Listeners();
        this.setList(list);
        this.$super();

        this.add(L.CENTER, editable ? new pkg.Combo.EditableContentPan()
                                    : new pkg.Combo.ReadonlyContentPan());
        this.add(L.RIGHT, new pkg.Combo.Button());
    },

    function focusGained(e){ this.repaint(); },
    function focusLost(e){ this.repaint(); },

    function setSelectionView(c){
        if(c != this.selectionView){
            this.selectionView = c;
            this.repaint();
        }
    },

    function setArrowGlyph(v){
        if(v != this.arrowGlyph){
            this.arrowGlyph = v;
            this.repaint();
        }
    },

    function canHaveFocus(){
        return this.winpad.parent == null && (this.content != null || this.content.isEditable == false);
    },

    function kidAdded(index,s,c){
        if (zebra.instanceOf(c, pkg.Combo.ContentPan)) {
            if (this.content != null) throw new Error("Content panel is set");
            if (c._) c._.add(this);
            this.content = c;
            if (this.list != null) c.updateValue(this.list.getSelected());
        }

        this.$super(index, s, c);
        if(this.button == null && zebra.instanceOf(c, zebra.util.Actionable)){
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

    function setMaxPadHeight(h){
        if(this.maxPadHeight != h){
            this.hidePad();
            this.maxPadHeight = h;
        }
    },

    function setList(l){
        if(this.list != l){
            this.hidePad();
            if(this.list != null) this.list._.remove(this);
            this.list = l;
            if (this.list._) this.list._.add(this);
            this.winpad = new pkg.Combo.ComboPadPan(this.list);
            if(this.content != null) {
                this.content.updateValue(this.list.getSelected());
            }
            this.vrp();
        }
    },

    function keyPressed(e){
        var index = this.list.selectedIndex;
        switch(e.code) {
            case KE.VK_LEFT :
            case KE.VK_UP   : if (index > 0) this.list.select(index - 1); break;
            case KE.VK_DOWN :
            case KE.VK_RIGHT: if (this.list.model.count() - 1 > index) this.list.select(index + 1); break;
        }
    },

    function keyTyped(e) { this.list.keyTyped(e); },

    function fired(src){
        if (zebra.util.currentTimeMillis() - this.time > 100) this.showPad();
    },

    function fired(src, data){
        if (this.lockListSelEvent === false){
            this.hidePad();
            if(this.content != null){
                this.content.updateValue(this.list.getSelected());
                if(this.content.isEditable) pkg.focusManager.requestFocus(this.content);
                this.repaint();
            }
        }
    },

    function contentUpdated(src, text){
        if (src == this.content){
            try {
                this.lockListSelEvent = true;
                if (text == null) this.list.select( -1);
                else {
                    var m = this.list.model;
                    for(var i = 0;i < m.count(); i++){
                        var mv = m.get(i);
                        if(mv == text || (mv.equals && mv.equals(text))){
                            this.list.select(i);
                            break;
                        }
                    }
                }
            }
            finally { this.lockListSelEvent = false; }
            this._.fire(this, text);
        }
    },

    function mousePressed(e){
        if (zebra.util.currentTimeMillis() - this.time > 100 &&
            e.isActionMask() && this.content != null         &&
            e.x > this.content.x && e.y > this.content.y     &&
            e.x < this.content.x + this.content.width        &&
            e.y < this.content.y + this.content.height)
        {
            this.showPad();
        }
    },

    function paint(g){
        if(this.content != null && this.selectionView != null && this.hasFocus()){
            this.selectionView.paint(g, this.content.x, this.content.y,
                                        this.content.width, this.content.height, this);
        }
    },

    function paintOnTop(g){
        if(this.arrowGlyph != null && this.button != null){
            var ps = this.arrowGlyph.getPreferredSize(), b = this.button;
            this.arrowGlyph.paint(g, b.x + ~~((b.width  - ps.width ) / 2),
                                     b.y + ~~((b.height - ps.height) / 2),
                                     ps.width, ps.height, this);
        }
    },

    function catchInput(child){
        return child != this.button && (this.content == null || this.content.isEditable === false);
    },

    function hidePad(){
        var d = pkg.findCanvas(this);
        if(d != null && this.winpad.parent != null){
            d.getLayer(pkg.PopupLayer.ID).remove(this.winpad);
            this.requestFocus();
        }
    },

    function showPad(){
        var desktop = pkg.findCanvas(this);
        if(desktop != null) {
            var winlayer = desktop.getLayer(pkg.PopupLayer.ID),
                ps = this.winpad.getPreferredSize(),
                p = L.getAbsLocation(0, 0, this), px = p[0], py = p[1];

            if (this.winpad.hbar && ps.width > this.width) {
                ps.height += this.winpad.hbar.getPreferredSize().height;
            }

            if (this.maxPadHeight > 0 && ps.height > this.maxPadHeight) {
                ps.height = this.maxPadHeight;
            }

            if (py + this.height + ps.height > desktop.height)
            {
                if(py - ps.height >= 0) py -= (ps.height + this.height);
                else {
                    var hAbove = desktop.height - py - this.height;
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
    }
]);

})(zebra("ui"), zebra.Class);
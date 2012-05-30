(function(pkg, Class) {

var Dimension = zebra.util.Dimension, Rectangle = zebra.util.Rectangle, L = zebra.layout, Position = zebra.util.Position, KE = pkg.KeyEvent; 

pkg.BaseList = Class(pkg.Panel, pkg.MouseMotionListener, pkg.MouseListener, pkg.KeyListener, Position.PositionMetric,
                     pkg.ScrollListener, pkg.FocusListener, pkg.view.ViewProvider, function($) {
    var BaseList = this;

    this.SEL_VIEW = 0;
    this.POS_BR_VIEW = 1;
    
    $(function() { this.$this(false); });

    $(function (b){
        this.provider = this.model = this.position = null;
        this.selectedIndex = -1;
        this.gaps = 2;
        
        this.$super();
        this._ = new zebra.util.Listeners();
        this.views = [ pkg.get("list.sv"), pkg.get("list.pos.br")];
        if (b == false) this.setBorder(pkg.get("list.br"));
        this.sman = this.createScrollManager();
        this.setModel(this.createModel());
        this.setViewProvider(this);
        this.setPosition(this.createPosition());
        this.setBackground(pkg.get("list.bg"));
        this.isComboMode = b;
        this.customize(pkg.Wizard.LIST);
    });

    $(function setItemGaps(g){
        if(this.gaps != g){
            this.gaps = g;
            this.vrp();
        }
    });

    $(function getItemGaps() { return this.gaps; });
    $(function getSelected(){ return this.selectedIndex < 0 ? null : this.model.elementAt(this.selectedIndex); });

    $(function lookupItem(ch){
        var count = this.model.elementsCount();
        if(zebra.util.isLetter(ch) && count > 0){
            var index = this.selectedIndex < 0 ? 0 : this.selectedIndex + 1;
            ch = ch.toLowerCase();
            for(var i = 0;i < count - 1; i++){
                var idx = (index + i) % count, item = this.model.elementAt(idx).toString();
                if(item.length > 0 && item[0].toLowerCase() == ch) return idx;
            }
        }
        return -1;
    });

    $(function select(index){
        if(index >= this.model.elementsCount()){
            throw new Error("index=" + index + ",max=" + this.model.elementsCount());
        }

        if(this.selectedIndex != index){
            var prev = this.selectedIndex;
            this.selectedIndex = index;
            this.notifyScrollMan(index);
            this.repaint(prev, this.selectedIndex);
            this.fire(this, prev);
        }
        else this.fire(this, null);
    });

    $(function isSelected(i){ return i == this.selectedIndex; });

    $(function mousePressed(e){
        if( !this.isComboMode && e.isActionMask()){
            var index = this.getItemIdxAt(e.x, e.y);
            if(index >= 0){
                if(this.position.offset != index) this.position.setOffset(index);
                else this.select(index);
            }
        }
    });

    $(function mouseMoved(e){ this.correctPM(e.x, e.y); });
    $(function mouseEntered(e){  this.correctPM(e.x, e.y);});
    $(function mouseReleased(e){ if(this.isComboMode && e.isActionMask()) this.select(this.position.offset); });

    $(function keyPressed(e){
        if(this.model.elementsCount() > 0){
            switch(e.code)
            {
                case KE.VK_END: {
                    if (e.isControlPressed()) this.position.setOffset(this.position.metrics.getMaxOffset());
                    else this.position.seekLineTo(Position.END);
                } break;
                case KE.VK_HOME: {
                    if(e.isControlPressed()) this.position.setOffset(0);
                    else this.position.seekLineTo(Position.BEG);
                } break;
                case KE.VK_RIGHT: this.position.seek(1); break;
                case KE.VK_DOWN: this.position.seekLineTo(Position.DOWN); break;
                case KE.VK_LEFT: this.position.seek(-1);break;
                case KE.VK_UP: this.position.seekLineTo(Position.UP);break;
                case KE.VK_PAGE_UP: this.position.seek(this.pageSize(-1));break;
                case KE.VK_PAGE_DOWN: this.position.seek(this.pageSize(1));break;
                case KE.VK_ENTER: this.select(this.position.offset);break;
            }
        }
    });

    $(function keyTyped(e){
        var i = this.lookupItem(e.ch);
        if(i >= 0) this.select(i);
    });

    $(function focusGained(e){ this.repaint();});
    $(function focusLost(e){ this.repaint();});
    $(function getLines(){ return this.model.elementsCount();});
    $(function getLineSize(l){ return 1; });
    $(function getMaxOffset(){ return this.getLines() - 1; });

    $(function posChanged(target,prevOffset,prevLine,prevCol){
        var off = this.position.offset;
        this.notifyScrollMan(off);
        if( !this.isComboMode) this.select(off);
        this.repaint(prevOffset, off);
    });

    $(function canHaveFocus(){ return true; });

    $(function setModel(m){
        if(m == null) throw new Error();
        if(m != this.model){
            if(this.model != null) this.model.removeListModelListener(this);
            this.model = m;
            this.model.addListModelListener(this);
            this.vrp();
        }
    });

    $(function getElementView(type){ return this.views[type]; });

    $(function setElementView(type,c){
        if(this.views[type] != c){
            this.views[type] = c;
            this.repaint();
        }
    });

    $(function getScrollManager(){ return this.sman; });

    $(function setPosition(c){
        if(c != this.position){
            if(this.position != null) this.position._.remove(this);
            this.position = c;
            this.position._.add(this);
            this.position.setPositionMetric(this);
            this.repaint();
        }
    });

    $(function setViewProvider(v){
        if(this.provider != v){
            this.provider = v;
            this.vrp();
        }
    });

    $(function getViewProvider(){ return this.provider; });

    $(function update(g){
        this.$super(g);
        if(this.selectedIndex >= 0 && this.views[BaseList.SEL_VIEW] != null){
            var gap = this.getItemGaps();
            this.drawSelMarker(g, this.getItemX(this.selectedIndex) - gap, 
                                  this.getItemY(this.selectedIndex) - gap, 
                                  this.getItemW(this.selectedIndex) + 2 * gap, 
                                  this.getItemH(this.selectedIndex) + 2 * gap);
        }
    });

    $(function paintOnTop(g){
        if(this.views[BaseList.POS_BR_VIEW] != null && (this.isComboMode || this.hasFocus())){
            var offset = this.position.offset;
            if(offset >= 0){
                var gap = this.getItemGaps();
                this.drawPosMarker(g, this.getItemX(offset) - gap, 
                                      this.getItemY(offset) - gap, 
                                      this.getItemW(offset) + 2 * gap, 
                                      this.getItemH(offset) + 2 * gap);
            }
        }
    });

    $(function getView(c,item){ return null; });

    $(function elementInserted(e,index){
        this.invalidate();
        if(this.selectedIndex >= 0 && this.selectedIndex >= index) this.selectedIndex ++ ;
        this.position.inserted(index, 1);
        this.repaint();
    });

    $(function elementRemoved(e,index){
        this.invalidate();
        if(this.selectedIndex == index || this.model.elementsCount() == 0) this.select(-1);
        else if(this.selectedIndex > index) this.selectedIndex--;
        this.position.removed(index, 1);
        this.repaint();
    });

    $(function elementSet(e,pe,index){
        this.invalidate();
        this.repaint();
    });

    $(function scrolled(psx,psy){ this.repaint();});
    $(function getItemIdxAt(x,y){ return  -1;});

    $(function calcMaxItemSize(){
        var maxH = 0, maxW = 0;
        this.validate();
        for(var i = 0;i < this.model.elementsCount(); i ++ ){
            if(this.getItemH(i) > maxH) maxH = this.getItemH(i);
            if(this.getItemW(i) > maxW) maxW = this.getItemW(i);
        }
        return new Dimension(maxW, maxH);
    });

    $(function fire(src,data){ this._.fire(src, data); });

    $(function repaint(p,n){
        this.validate();
        var xx = this.width - this.getRight(), gap = this.getItemGaps();
        var count = this.model.elementsCount();
        if(p >= 0 && p < count){
            var x = this.getItemX(p) - gap;
            this.repaint(x, this.getItemY(p) - gap, xx - x, this.getItemH(p) + 2 * gap);
        }
        if(n >= 0 && n < count){
            var x = this.getItemX(n) - gap;
            this.repaint(x, this.getItemY(n) - gap, xx - x, this.getItemH(n) + 2 * gap);
        }
    });

    $(function notifyScrollMan(index){
        if(index >= 0 && this.getScrollManager() != null){
            var sman = this.getScrollManager();
            this.validate();
            var gap = this.getItemGaps(), dx = sman.getSX(), dy = sman.getSY();
            sman.makeVisible(this.getItemX(index) - dx - gap, this.getItemY(index) - dy - gap, 
                             this.getItemW(index) + 2 * gap, this.getItemH(index) + 2 * gap);
        }
    });

    $(function pageSize(d){
        var offset = this.position.offset;
        if(offset >= 0){
            var vp = this.cvp(new Rectangle());
            if(vp != null){
                var sum = 0, i, gap = 2 * this.getItemGaps();
                for(i = offset;i >= 0 && i <= this.position.metrics.getMaxOffset() && sum < vp.height; i += d){
                    sum += (this.getItemH(i) + gap);
                }
                return i - offset - d;
            }
        }
        return 0;
    });

    $(function drawSelMarker(g,x,y,w,h){ this.views[BaseList.SEL_VIEW].paint(g, x, y, w, h, this); });
    $(function drawPosMarker(g,x,y,w,h){ this.views[BaseList.POS_BR_VIEW].paint(g, x, y, w, h, this); });

    $(function correctPM(x,y){
        if(this.isComboMode){
            var index = this.getItemIdxAt(x, y);
            if(index >= 0) this.position.setOffset(index);
        }
    });

    $(function createScrollManager(){ return new pkg.SimpleScrollManager(this);});
    $(function createModel(){ return new zebra.data.ListModel(); });
    $(function createPosition(){ return new Position(this); });
    $(function getItemX(i){ return this.getLeft(); });

    $(function getItemY(index){
        this.validate();
        var gap = this.getItemGaps(), y = this.getTop() + this.getScrollManager().getSY() + gap;
        for(var i = 0;i < index; i ++) y += (this.getItemH(i) + 2 * gap);
        return y;
    });

    $(function getItemW(i){
        return this.provider.getView(this, this.model.elementAt(i)).getPreferredSize().width;
    });

    $(function getItemH(i){
        return this.provider.getView(this, this.model.elementAt(i)).getPreferredSize().height;
    });
});

pkg.List = Class(pkg.BaseList, function($) {
    $(function (){ this.$this(false); });

    $(function (b){ 
        this.text = new pkg.view.TextRender("");
        this.firstVisible = -1;
        this.firstVisibleY = this.psWidth_ = this.psHeight_ = 0;
        this.heights = this.widths = this.vArea = null;
        this.visValid = false;
        this.$super(b); 
    });

    $(function getView(c,item){
        if (zebra.isString(item)) {
            this.text.target.setText(item.toString());
            return this.text;
        }
        return item;
    });

    $(function paint(g){
        this.vVisibility();
        if(this.firstVisible >= 0){
            var sx = this.getScrollManager().getSX(), sy = this.getScrollManager().getSY();
            try{
                g.translate(sx, sy);
                this.$super(g);
                var gap = this.getItemGaps(), y = this.firstVisibleY, x = this.getLeft() + gap;
                var yy = this.vArea.y + this.vArea.height - sy, count = this.model.elementsCount();
                var provider = this.getViewProvider();
                for(var i = this.firstVisible;i < count; i ++ ){
                    provider.getView(this, this.model.elementAt(i)).paint(g, x, y, this.widths[i], this.heights[i], this);
                    y += (this.heights[i] + 2 * gap);
                    if(y > yy) break;
                }
            }
            finally { g.translate(-sx,  -sy); }
        }
    });

    $(function invalidate(){
        this.iVisibility();
        this.firstVisible =  -1;
        this.$super();
    });

    $(function drawSelMarker(g,x,y,w,h){
        this.$super(g, x, y, this.width - this.getRight() - x, h);
        //this.$super(g, x, y, w, h);
    });

    $(function drawPosMarker(g,x,y,w,h){
        this.$super(g, x, y, this.width - this.getRight() - x, h);
        //this.$super(g, x, y, w, h);
    });

    $(function recalc(){
        this.psWidth_ = this.psHeight_ = 0;
        var count = this.model.elementsCount();
        if(this.heights == null || this.heights.length != count) this.heights = Array(count);
        if(this.widths == null || this.widths.length != count) this.widths = Array(count);
        var provider = this.getViewProvider();
        for(var i = 0;i < count; i++){
            var ps = provider.getView(this, this.model.elementAt(i)).getPreferredSize();
            this.heights[i] = ps.height;
            this.widths [i] = ps.width;
            if(this.widths [i] > this.psWidth_)this.psWidth_ = this.widths[i];
            this.psHeight_ += this.heights[i];
        }
    });

    $(function calcPreferredSize(l){
        var gap = 2 * this.getItemGaps();
        return new Dimension(gap + this.psWidth_, gap * this.model.elementsCount() + this.psHeight_);
    });

    $(function scrolled(psx,psy){
        this.firstVisible =  - 1;
        this.iVisibility();
        this.$super(psx, psy);
    });

    $(function getItemIdxAt(x,y){
        this.vVisibility();
        if(this.vArea != null && this.firstVisible >= 0){
            var yy = this.firstVisibleY + this.getScrollManager().getSY(), hh = this.height - this.getBottom();
            var count = this.model.elementsCount(), gap = this.getItemGaps() * 2;
            for(var i = this.firstVisible;i < count; i++) {
                if(y >= yy && y < yy + this.heights[i]) return i;
                yy += (this.heights[i] + gap);
                if (yy > hh) break;
            }
        }
        return  -1;
    });

    $(function vVisibility(){
        this.validate();
        var prev = this.vArea;
        this.vArea = this.cvp(new Rectangle());
        if(this.vArea == null){
            this.firstVisible =  -1;
            return ;
        }
        if( !this.vArea.equals(prev) || !this.visValid){
            var top = this.getTop(), gap = this.getItemGaps();
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
                var count = this.model.elementsCount();
                for(; this.firstVisible < count && !isVisible(this, this.firstVisibleY, top, this.firstVisible); this.firstVisible++){
                    this.firstVisibleY += (this.heights[firstVisible] + 2 * gap);
                }
                if(this.firstVisible >= count) this.firstVisible =  -1;
            }
            this.visValid = true;
        }
    });

    $(function iVisibility(){ this.visValid = false; });
    $(function getItemX(i){ return this.getLeft() + this.getItemGaps(); });

    $(function getItemY(index){
        this.validate();
        var gap = this.getItemGaps(), y = this.getTop() + this.getScrollManager().getSY() + gap;
        for(var i = 0;i < index; i++) y += (this.heights[i] + 2 * gap);
        return y;
    });

    $(function getItemW(i){
        this.validate();
        return this.widths[i];
    });

    $(function getItemH(i){
        this.validate();
        return this.heights[i];
    });

    function isVisible(t, y,top,index){
        var y1 = y + t.getScrollManager().getSY(), y2 = y1 + t.heights[index] - 1, hh = t.height - t.getBottom();
        return ((y1 >= top && y1 < hh) || (y2 >= top && y2 < hh) || (y1 < top && y2 >= hh));
    }
});

pkg.CompList = Class(pkg.BaseList, pkg.Composite, [
    function (){ this.$this(false); },

    function (b){ 
        this.input = this.max = this.msupport = null;
        this.$super(b); 
    },

    function setModel(m){
        if (m != this) throw new Error("" + m);
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
             if(this.position != null) this.position.setPositionMetric(zebra.instanceOf(l, Position.PositionMetric) ? l : this);
         }
    },

    function getItemGaps(){ return 0; },

    function focusGained(e){
        var o = this.position.offset;
        this.input = (o >= 0 && o == this.selectedIndex) ? this.elementAt(this.position.offset) : null;
        this.$super(e);
    },

    function drawSelMarker(g,x,y,w,h){
        if (this.input == null || !L.isAncestorOf(this.input, pkg.focusManager.focusOwner)) this.$super(g, x, y, w, h); 
    },

    function catchInput(child){
        if(this.isComboMode) return true;
        var b = this.input != null && L.isAncestorOf(this.input, child);
        if(b && this.input != null && L.isAncestorOf(this.input, pkg.focusManager.focusOwner) && !this.hasFocus()) this.input = null;
        return (this.input == null || !b);
    },

    function posChanged(target,prevOffset,prevLine,prevCol){
        this.$super(target, prevOffset, prevLine, prevCol);
        if (this.isComboMode == false) this.input = (this.position.offset >= 0) ? this.elementAt(this.position.offset) : null;
    },

    function elementAt(i) { return this.kids[i]; },

    function setElementAt(item,i){
        this.removeElementAt(i);
        this.insertElementAt(item, i);
    },

    function addElement(o){ this.add(zebra.isString(o)? new pkg.Label(s) : o); },
    function removeElementAt(i){ this.removeAt(i);},
    function insertElementAt(item,i){ this.insert(i, null, zebra.isString(item) ? new pkg.Label(item) : item); },
    function elementsCount(){ return this.kids.length; },

    function addListModelListener(l){
        if(this.msupport == null) this.msupport = [];
        this.msupport.push(l);
    },

    function removeListModelListener(l){ if (this.msupport != null) zebra.util.array_rm(this.msupport, l); },
    function removeAllElements() { if (msupport != null) this.msupport.length = 0; },

    function kidAdded(index,constr,e){
        if(this.msupport != null){
            for(var i = 0;i < this.msupport.length; i++) this.msupport[i].elementInserted(e, index);
        }
    },

    function kidRemoved(index,e){
        if(this.msupport != null){
            for(var i = 0;i < this.msupport.length; i++) this.msupport[i].elementRemoved(e, index);
        }
    },

    function scrolled(px,py){},
    function getView(target,obj) { return new pkg.view.CompRender(obj); },
    function getItemX(i){ return this.kids[i].x; },
    function getItemY(i){ return this.kids[i].y; },
    function getItemW(i){ return this.kids[i].width; },
    function getItemH(i){ return this.kids[i].height; },
    function recalc(){ this.max = L.getMaxPreferredSize(this); },

    function maxItemSize(){
        this.validate();
        return new Dimension(this.max.width, this.max.height);
    },

    function getItemIdxAt(x,y){ return L.getDirectAt(x, y, this); },
    function getDefaultLayout(){ return new L.ListLayout(); },
    function createScrollManager(){ return new pkg.CompScrollManager(this); },
    function createModel(){ return this; }
]);

pkg.Combo = Class(pkg.Panel, pkg.MouseListener, pkg.KeyListener, pkg.Composite, pkg.FocusListener, function($) {        
    var ContentComponent = Class(pkg.Panel, function($) {
        $(function (){ 
            this.$super();
            this.owner = null;
            this.setBackground(null); 
        });

        $(function setContentValue(nv){
            var old = this.getContentValue();
            if(nv != old && (nv == null || !nv.equals || !nv.equals(old))){
                this.updateContentValue(old, nv);
                if(this.owner != null) this.owner.contentFired(this,  -1, old);
            }
        });

        $(function getContentValue(){ return this.fetchContentValue(); });

        $(function paintOnTop(g){
            var v = this.getContentView();
            if(v != null){
                var ps = v.getPreferredSize(), vpW = this.width, vpH = this.height;
                v.paint(g, this.getLeft(), this.getTop() + ~~((vpH - ps.height) / 2), vpW, vpH, this);
            }
        });

        $(function isEditable(){ return false;});
        $(function setContentComponentListener(o){ this.owner = o; });
        $(function getContentComponentListener(){ return this.owner; });
        
        this.Abstract(function updateContentValue(ov,nv){ });
        this.Abstract(function fetchContentValue(){ });
        this.Abstract(function getContentView(){ });
    });
    
    this.ContentComponent = ContentComponent;

    var ComboPad = Class(pkg.ScrollPan, [
        function(c){
            this.$super(c);
            this.setBackground(pkg.get("combo.wpad.bg"));
            this.setBorder(pkg.get("combo.wpad.br"));
        },

        function setParent(l){
            this.$super(l);
            if(l == null) this.time = zebra.util.currentTimeMillis();
        }
    ]);

    var ReadonlyContentPan = Class(ContentComponent,[
        function (t){ 
            this.$super();
            this.target = t; 
            this.value = null; 
        },
        
        function calcPreferredSize(l){ return this.target.list.calcMaxItemSize(); },
        function updateContentValue(ov,nv){ this.value = nv; },
        function fetchContentValue(){ return this.value; },

        function getContentView(){
            var list = this.target.list, selected = list.getSelected();
            return (selected != null) ? list.getView(list, selected) : null;
        }
    ]);

    var EditableContentPan = Class(ContentComponent, zebra.data.TextModelListener, pkg.FocusListener, [
        function (){
            this.$super();
            this.dontGenerateUpdateEvent = false;
            this.textField = new pkg.TextField("",  -1);
            this.textField.setBorder(null);
            this.textField.setBackground(null);
            this.add(L.CENTER, this.textField);
        },

        function textUpdated(src,id,off,size,startLine,lines){
            var changeListener = this.getContentComponentListener();
            if( !this.dontGenerateUpdateEvent && changeListener != null){
                changeListener.contentFired(this,  -1, null);
            }
        },

        function focusGained(e){ this.textField.requestFocus(); },
        function focusLost(e){ this.textField.requestFocus(); },
        function canHaveFocus(){ return true; },
        function isEditable(){ return true; },

        function updateContentValue(ov,nv){
            this.dontGenerateUpdateEvent = true;
            try{
                var txt = (nv == null ? "" : nv.toString());
                this.textField.setText(txt);
                this.textField.select(0, txt.length);
            }
            finally { this.dontGenerateUpdateEvent = false; }
        },

        function setContentComponentListener(o){
            var owner = this.getContentComponentListener();
            if(owner != o){
                if(o == null) this.textField.getModel()._.remove(this);
                this.$super(o);
                if(o != null) this.textField.getModel()._.add(this);
            }
        },

        function fetchContentValue(){ return this.textField.getText(); },
        function getContentView(){ return null; },
        function getDefaultLayout(){ return new L.BorderLayout();}
    ]);
    
    this.EditableContentPan = EditableContentPan;
        
    $(function (){ this.$this(new pkg.List(true)); });

    $(function (list){
        this.list = this.button = this.content = this.winpad = this.arrowGlyph = this.selView = null;
        this.maxPadHeight = this.time = 0;
        this.lockListSelEvent = false;
    
        this.$super();
        this._ = new zebra.util.Listeners();
        this.setBorder(pkg.get("combo.br"));
        this.selView = pkg.get("combo.sv");
        this.arrowGlyph = pkg.get("combo.bt.ag");
        var button = new pkg.Button();
        button.fireByPress(true,  -1);
        button.canHaveFocus(false);
        var man = new pkg.view.ViewSet();
        man.put("out", pkg.get("combo.bt.out"));
        man.put("over", pkg.get("combo.bt.over"));
        man.put("pressed", pkg.get("combo.bt.pressed"));
        man.put("disabled", pkg.get("combo.bt.disabled"));
        button.setView(man);
    
        this.setDefaultContentComponent();
        this.add(L.RIGHT, button);
        this.setList(list);
        var ps = pkg.get("combo.bt.ps");
        if(ps != null) button.setPSSize(ps.width, ps.height);
        this.customize(pkg.Wizard.COMBO);
    });

    $(function setDefaultContentComponent(){ this.setContentComponent(new ReadonlyContentPan(this)); });

    $(function setContentComponent(c){
        if(c != this.content){
            if(this.content != null){
                this.content.setContentComponentListener(null);
                this.remove(this.content);
            }
            this.content = c;
            if(this.content != null){
                this.content.setContentComponentListener(this);
                if(this.list != null) this.content.setContentValue(this.list.getSelected());
                this.add(L.CENTER, this.content);
            }
        }
    });

    $(function focusGained(e){ this.repaint(); });
    $(function focusLost(e){ this.repaint(); });
    $(function getSelectionView(){ return this.selView; });

    $(function setSelectionView(c){
        if(c != this.selView || (c != null && !c.equals(this.selView))){
            this.selView = c;
            this.repaint();
        }
    });

    $(function setArrowGlyph(v){
        if(v != this.arrowGlyph){
            this.arrowGlyph = v;
            this.repaint();
        }
    });

    $(function canHaveFocus(){ return this.winpad.parent == null && (this.content == null ||  ! this.content.isEditable()); });

    $(function kidAdded(index,s,c){
        this.$super(index, s, c);
        if(this.button == null && zebra.instanceOf(c, zebra.util.Actionable)){
            this.button = c;
            this.button._.add(this);
        }
    });

    $(function kidRemoved(index,l){
        this.$super(index, l);
        if(this.button == l){
            this.button._.remove(this);
            this.button = null;
        }
    });

    $(function setMaxPadHeight(h){
        if(this.maxPadHeight != h){
            this.hidePad();
            this.maxPadHeight = h;
        }
    });

    $(function setList(l){
        if(this.list != l){
            this.hidePad();
            if(this.list != null) this.list._.remove(this);
            this.list = l;
            this.list._.add(this);
            this.winpad = new ComboPad(this.list);
            if(this.content != null) this.content.setContentValue(this.list.getSelected());
            this.vrp();
        }
    });

    $(function keyPressed(e){
        var index = this.list.selectedIndex;
        switch(e.code) {
            case KE.VK_LEFT:
            case KE.VK_UP: if(index > 0) this.list.select(index - 1);break;
            case KE.VK_DOWN:
            case KE.VK_RIGHT:if(this.list.model.elementsCount() - 1 > index) this.list.select(index + 1); break;
        }
    });

    $(function keyTyped(e){ this.list.keyTyped(e);});

    $(function fired(src){
        if (zebra.util.currentTimeMillis() - this.time > 100) this.showPad();
    });

    $(function fired(src, data){
        if( !this.lockListSelEvent){
            this.hidePad();
            if(this.content != null){
                this.content.setContentValue(this.list.getSelected());
                if(this.content.isEditable()) pkg.focusManager.requestFocus(this.content);
                this.repaint();
            }
        }
    });

    $(function contentFired(src,id,data){
        if(src == this.content){
            try{
                this.lockListSelEvent = true;
                var v = this.content.getContentValue();
                if(v == null) this.list.select( -1);
                else {
                    var m = this.list.model;
                    for(var i = 0;i < m.elementsCount(); i++){
                        var mv = m.elementAt(i);
                        if(mv == v || (mv.equals && mv.equals(v))){
                            this.list.select(i);
                            break;
                        }
                    }
                }
            }
            finally { this.lockListSelEvent = false; }
            this._.fire(this, data);
        }
    });

    $(function mousePressed(e){
        if (zebra.util.currentTimeMillis() - this.time > 100 && e.isActionMask() && this.content != null && 
             e.x > this.content.x && e.y > this.content.y && e.x < this.content.x + this.content.width && 
             e.y < this.content.y + this.content.height) 
        {
            this.showPad();
        }
    });

    $(function paint(g){
        if(this.content != null && this.selView != null && this.hasFocus()){
            this.selView.paint(g, this.content.x, this.content.y, this.content.width, this.content.height, this);
        }
    });

    $(function paintOnTop(g){
        if(this.arrowGlyph != null && this.button != null){
            var ps = this.arrowGlyph.getPreferredSize(), b = this.button;
            this.arrowGlyph.paint(g, b.x + ~~((b.width  - ps.width ) / 2), 
                                     b.y + ~~((b.height - ps.height) / 2), ps.width, ps.height, this);
        }
    });

    $(function catchInput(child){ return child != this.button && (this.content == null ||  ! this.content.isEditable()); });
    $(function getDefaultLayout(){ return pkg.get("combo.lay"); });

    $(function hidePad(){
        var d = pkg.getDesktop(this);
        if(d != null && this.winpad.parent != null){
            var l = d.getLayer(pkg.PopupLayer.ID);
            l.remove(this.winpad);
            this.requestFocus();
        }
    });

    $(function showPad(){
        var desktop = pkg.getDesktop(this);
        if(desktop != null){
            var winlayer = desktop.getLayer(pkg.PopupLayer.ID), ps = this.winpad.getPreferredSize();
            if(ps.width > this.width) ps.height += this.winpad.get(pkg.ScrollPan.HBAR_EL).getPreferredSize().height;
            var p = L.getAbsLocation(0,0,this);
            if(this.maxPadHeight > 0 && ps.height > this.maxPadHeight) ps.height = this.maxPadHeight;
            if(p.y + this.height + ps.height > desktop.height){
                if(p.y - ps.height >= 0) p.y -= (ps.height + this.height);
                else{
                    var hAbove = desktop.height - p.y - this.height;
                    if(p.y > hAbove){
                        ps.height = p.y;
                        p.y -= (ps.height + this.height);
                    }
                    else ps.height = hAbove;
                }
            }
            this.winpad.setSize(this.width, ps.height);
            this.winpad.setLocation(p.x, p.y + this.height);
            this.list.notifyScrollMan(this.list.selectedIndex);
            winlayer.add(this, this.winpad);
            
            
            this.list.requestFocus();
        }
    });
});

})(zebra("ui"), zebra.Class);
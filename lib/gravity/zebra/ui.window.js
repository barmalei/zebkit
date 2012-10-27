(function(pkg, Class, Interface) {

pkg.TooltipInfo = Interface();
pkg.PopupInfo   = Interface();
pkg.WinListener = Interface();

var KE = pkg.KeyEvent, timer = zebra.util.timer, L = zebra.layout, InputEvent = pkg.InputEvent, MouseEvent = pkg.MouseEvent,
    WinListener = pkg.WinListener, ComponentListener = pkg.ComponentListener, BaseList = pkg.BaseList;

var WIN_OPENED = 1, WIN_CLOSED = 2, WIN_ACTIVATED = 3, WIN_DEACTIVATED = 4, VIS_PART_SIZE = 30;
pkg.WinLayer = Class(pkg.BaseLayer, pkg.ChildrenListener, [
    function $clazz() {
        this.ID = "win";

        this.MODAL = 1;
        this.MDI   = 2;
        this.INFO  = 3;
    },

    function $prototype() {
        this.isLayerActive  = function(){ return this.activeWin != null; };
        this.isLayerActiveAt= function(x,y) { return this.activeWin != null; };

        this.layerMousePressed = function(x,y,mask){
            var cnt = this.kids.length;
            if(cnt > 0){
                if(this.activeWin != null && this.indexOf(this.activeWin) == cnt - 1){
                    var x1 = this.activeWin.x, y1 = this.activeWin.y,
                        x2 = x1 + this.activeWin.width, y2 = y1 + this.activeWin.height;
                    if(x >= x1 && y >= y1 && x < x2 && y < y2) return;
                }
                for(var i = cnt - 1;i >= 0 && i >= this.topModalIndex; i--){
                    var d = this.kids[i];
                    if(d.isVisible && d.isEnabled && this.winType(d) != pkg.WinLayer.INFO &&
                       x >= d.x && y >= d.y && x < d.x + d.width && y < d.y + d.height)
                    {
                        this.activate(d);
                        return;
                    }
                }
                if(this.topModalIndex < 0 && this.activeWin != null) this.activate(null);
            }
        };

        this.layerKeyPressed = function(keyCode,mask){
            if(this.kids.length > 0 && keyCode == KE.VK_TAB && (mask & KE.SHIFT) > 0){
                if(this.activeWin == null) this.activate(this.kids[this.kids.length - 1]);
                else{
                    var winIndex = this.winsStack.indexOf(this.activeWin) - 1;
                    if(winIndex < this.topModalIndex || winIndex < 0) winIndex = this.winsStack.length - 1;
                    this.activate(this.winsStack[winIndex]);
                }
            }
        };

        this.childInputEvent = function (e) {
            if (e.ID == InputEvent.FOCUS_GAINED) this.activate(L.getDirectChild(this, e.source));
        };

        this.getComponentAt = function(x,y){
            return (this.activeWin == null) ? null
                                            : this.activeWin.getComponentAt(x - this.activeWin.x,
                                                                            y - this.activeWin.y);
        };

        this.calcPreferredSize = function(target) {
            return L.getMaxPreferredSize(target);
        };

        this.getFocusRoot = function(){ return this.activeWin; };

        this.winType = function(w){ return this.winsInfo[w][1]; };
    },

    function (){
        this.activeWin = null;
        this.topModalIndex = -1;
        this.winsInfo  = {};
        this.winsStack = [];
        this._ = new zebra.util.MListeners("winOpened", "winActivated");
        this.$super(pkg.WinLayer.ID);
    },

    function addWin(type, win, listener) {
        this.winsInfo[win] = [ this.activeWin, type, listener ];
        this.add(win);
    },

    function insert(index, constr, lw) {
        var info = this.winsInfo[lw];
        if (typeof info === 'undefined') {
            info = [this.activeWin, pkg.WinLayer.MDI, null];
            this.winsInfo[lw] = info;
        }
        if (info[1] != pkg.WinLayer.MDI && info[1] != pkg.WinLayer.MODAL && info[1] != pkg.WinLayer.INFO) throw new Error();
        return this.$super(index, constr, lw);
    },

    function kidAdded(index,constr,lw){
        this.$super(index, constr, lw);
        var info = this.winsInfo[lw];
        this.winsStack.push(lw);
        if (info[1] == pkg.WinLayer.MODAL) this.topModalIndex = this.winsStack.length - 1;
        this.fire(WIN_OPENED, lw);
        if(info[1] == pkg.WinLayer.MODAL) this.activate(lw);
    },

    function kidRemoved(index,lw){
        this.$super(this.kidRemoved,index, lw);
        if(this.activeWin == lw){
            this.activeWin = null;
            pkg.focusManager.requestFocus(null);
        }
        var ci = this.winsStack.indexOf(lw), l = this.winsInfo[lw][2];
        delete this.winsInfo[lw];
        this.winsStack.splice(this.winsStack.indexOf(lw), 1);
        if(ci < this.topModalIndex) this.topModalIndex--;
        else {
            if(this.topModalIndex == ci){
                for(this.topModalIndex = this.kids.length - 1;this.topModalIndex >= 0; this.topModalIndex--){
                    if (this.winType(this.winsStack[this.topModalIndex]) == pkg.WinLayer.MODAL) break;
                }
            }
        }

        this.fire(WIN_CLOSED, lw, l);
        if(this.topModalIndex >= 0){
            var aindex = this.winsStack.length - 1;
            while(this.winType(this.winsStack[aindex]) == pkg.WinLayer.INFO) aindex--;
            this.activate(this.winsStack[aindex]);
        }
    },


    function doLayout(target){
        var cnt = this.kids.length;
        for(var i = 0;i < cnt; i ++ ){
            var l = this.kids[i];
            if(l.isVisible){
                var x = l.x, y = l.y, w = l.width, h = l.height, minH = Math.min(VIS_PART_SIZE, h), minW = Math.min(VIS_PART_SIZE, w);
                if(x > this.width - minW) x = this.width - minW;
                else if(x + w < minW) x = minW - w;
                if(y > this.height - minH) y = this.height - minH;
                else if(y < 0) y = 0;
                l.setLocation(x, y);
            }
        }
    },

    function activate(c){
        if(c != null && (this.winsInfo.hasOwnProperty(c) === false || this.winType(c) == pkg.WinLayer.INFO)) throw new Error();
        if(c != this.activeWin){
            var old = this.activeWin;
            if(c == null){
                if (this.winType(this.activeWin) == pkg.WinLayer.MODAL) throw new Error();
                this.activeWin = null;
                this.fire(WIN_DEACTIVATED, old);
                pkg.focusManager.requestFocus(null);
            }
            else{
                if(this.winsStack.indexOf(c) < this.topModalIndex) throw new Error();
                this.activeWin = c;
                this.toFront(this.activeWin);
                if(old != null) this.fire(WIN_DEACTIVATED, old);
                this.fire(WIN_ACTIVATED, this.activeWin);
                this.activeWin.validate();
                pkg.focusManager.requestFocus(pkg.focusManager.findFocusable(this.activeWin));
            }
        }
    },

    function fire(id, win) { this.fire(id, win, this.winsInfo[win][2]); },

    function fire(id, win, l) {
        var b = (id == WIN_OPENED || id == WIN_ACTIVATED),
            n = (id == WIN_OPENED || id == WIN_CLOSED) ? "winOpened" : "winActivated";

        this._[n](this, win, b);
        if (zebra.instanceOf(win, WinListener)) win[n].apply(win, [this, win, b]);
        if (l != null) l[n].apply(l, [this, win, b]);
    }
]);

pkg.Window = Class(pkg.Panel, pkg.MouseMotionListener, WinListener,
                       pkg.MouseListener, pkg.Composite, pkg.Cursorable,
                       pkg.FocusListener, pkg.ExternalEditor, [
    function $prototype() {
        var MOVE_ACTION = 1, SIZE_ACTION = 2;
        this.minSize = 40;
        this.isSizeable = true;

        this.startDragged = function(e){
            this.px = e.x;
            this.py = e.y;
            this.psw = this.width;
            this.psh = this.height;
            this.action = this.insideCorner(this.px, this.py) ? (this.isSizeable ? SIZE_ACTION : -1): MOVE_ACTION;
            if(this.action > 0) this.dy = this.dx = 0;
        };

        this.mouseDragged = function(e){
            if(this.action > 0){
                if(this.action != MOVE_ACTION){
                    var nw = this.psw + this.dx, nh = this.psh + this.dy;
                    if(nw > this.minSize && nh > this.minSize) this.setSize(nw, nh);
                }
                this.dx = (e.x - this.px);
                this.dy = (e.y - this.py);
                if(this.action == MOVE_ACTION){
                    this.invalidate();
                    this.setLocation(this.x + this.dx, this.y + this.dy);
                }
            }
        };

        this.endDragged = function(e){
            if(this.action > 0){
                if(this.action == MOVE_ACTION){
                    this.invalidate();
                    this.setLocation(this.x + this.dx, this.y + this.dy);
                }
                this.action = -1;
            }
        };

        this.insideCorner = function(px,py){ return this.getComponentAt(px, py) == this.sizer; };

        this.getCursorType = function(target,x,y){
            return (this.isSizeable && this.insideCorner(x, y)) ? pkg.Cursor.SE_RESIZE : -1;
        };

        this.catchInput = function(c){
            var tp = this.caption;
            return c == tp || (L.isAncestorOf(tp, c) && !(zebra.instanceOf(c, pkg.Button))) || this.sizer== c;
        };
    },

    function $clazz() {
        this.CaptionPan = Class(pkg.Panel, [
            function() {
                this.$super();
                this.activate(false);
            },

            function activate(b) {
                this.setBackground(b?this.activeBg:this.inactiveBg);
            }
        ]);

        this.TitleLab   = Class(pkg.Label, []);
        this.StatusPan  = Class(pkg.Panel, []);
        this.ContentPan = Class(pkg.Panel, []);
        this.SizerIcon  = Class(pkg.ImagePan, []);
        this.Icon       = Class(pkg.ImagePan, []);
        this.Button     = Class(pkg.Button, []);
    },

    function () {  this.$this("");  },

    function (s){
        this.prevH = this.prevX = this.prevY = this.psw = this.psh = this.px = this.py = this.dx = this.dy = 0;
        this.prevW = this.action = -1;

        this.root    = new pkg.Window.ContentPan();
        this.caption = new pkg.Window.CaptionPan();
        this.title   = new pkg.Window.TitleLab(s);

        var icons = new pkg.Panel(new L.FlowLayout(L.LEFT, L.CENTER, L.HORIZONTAL, 2));
        this.buttons = new pkg.Panel(new L.FlowLayout(L.CENTER, L.CENTER)),

        icons.add(new pkg.Window.Icon());
        icons.add(this.title);

        this.caption.add(L.LEFT, icons);
        this.caption.add(L.RIGHT, this.buttons);

        this.status = new pkg.Window.StatusPan();
        this.sizer  = new pkg.Window.SizerIcon();
        this.status.add(this.sizer);

        this.setSizeable(true);

        this.$super(new L.BorderLayout(2,2));

        this.add(L.CENTER, this.root);
        this.add(L.TOP, this.caption);
        this.add(L.BOTTOM, this.status);
    },

    function fired(src) { this.parent.remove(this); },

    function focusGained(e){ this.focusStateUpdated(); },
    function focusLost(e){ this.focusStateUpdated(); },

    function setSizeable(b){
        if(this.isSizeable != b){
            this.isSizeable = b;
            if (this.sizer != null) this.sizer.setVisible(b);
        }
    },

    function winOpened(winLayer,target,b) {
        if (this.caption != null && this.caption.activate) {
            this.caption.activate(false);
        }
    },

    function winActivated(winLayer, target,b){
        if (this.caption != null && this.caption.activate) {
            this.caption.activate(b);
        }
    },

    function mouseClicked(e){
        var x = e.x, y = e.y, cc = this.caption;
        if (e.clicks == 2 && this.isSizeable && x > cc.x &&
            x < cc.y + cc.width && y > cc.y && y < cc.y + cc.height)
        {
            if(this.prevW < 0) this.maximize();
            else this.restore();
        }
    },

    function maximize(){
        if(this.prevW < 0){
            var d = pkg.getDesktop(this), left = d.getLeft(), top = d.getTop();
            this.prevX = this.x;
            this.prevY = this.y;
            this.prevW = this.width;
            this.prevH = this.height;
            this.setLocation(left, top);
            this.setSize(d.width - left - d.getRight(), d.height - top - d.getBottom());
        }
    },

    function restore(){
        if(this.prevW >= 0){
            this.setLocation(this.prevX, this.prevY);
            this.setSize(this.prevW, this.prevH);
            this.prevW = -1;
        }
    },

    function close() {
        if (this.parent) this.parent.remove(this);
    },

    function setButtons(buttons) {
        for(var i=0; i< this.buttons.length; i++) {
            var kid = this.buttons.kids[i];
            if (kid._) kid._.removeAll();
        }
        this.buttons.removeAll();

        for(var k in buttons) {
            if (buttons.hasOwnProperty(k)) {
                var b = new pkg.Window.Button(), bv = buttons[k];
                b.setView(bv);
                this.buttons.add(b);
                (function(t, f) {
                    b._.add(function() { f.call(t); });
                })(this, this[k]);
            }
        }
    },

    function isMaximized(){ return this.prevW != -1; },
    function focusStateUpdated() { if(this.caption != null) this.caption.repaint(); }
]);

pkg.TooltipManager = Class(pkg.Manager, pkg.MouseListener, pkg.MouseMotionListener, [
    function $clazz() {
        this.Label = Class(pkg.Label, []);

        this.createTooltip = function(text){
            var lab = new pkg.TooltipManager.Label(new zebra.data.Text(text));
            lab.toPreferredSize();
            return lab;
        };
    },

    function $prototype() {
        var TI = pkg.TooltipInfo;

        this.mouseEntered = function(e){
            var c = e.source;
            if(zebra.instanceOf(c, TI) || this.tooltips[c]){
                this.target = c;
                this.targetLayer = pkg.getDesktop(c).getLayer(pkg.WinLayer.ID);
                this.x = e.x;
                this.y = e.y;
                timer.run(this, this.tick, this.tick);
            }
        };

        this.mouseExited = function(e){
            if(this.target != null){
                timer.remove(this);
                this.target = null;
                this.hideTooltipInfo();
            }
        };

        this.mouseMoved = function(e){
            if(this.target != null){
                timer.clear(this);
                this.x = e.x;
                this.y = e.y;
                this.hideTooltipInfo();
            }
        };

        this.run = function(){
            if(this.tooltip == null){
                var tp = this.tooltips[this.target];
                if (!tp) tp = null;
                if (tp == null && zebra.instanceOf(this.target, TI)) tp = this.target;
                this.tooltip = zebra.instanceOf(tp, TI) ? tp.getTooltip(this.target, this.x, this.y) : tp;
                if(this.tooltip != null) {
                    var ps = this.tooltip.getPreferredSize(), p = L.getAbsLocation(this.x, this.y, this.target);
                    this.tooltip.setSize(ps.width, ps.height);
                    var tx = p[0], ty = p[1] - this.tooltip.height, dw = this.targetLayer.width;
                    if(tx + ps.width > dw) tx = dw - ps.width - 1;
                    this.tooltip.setLocation(tx < 0 ? 0 : tx, ty);
                    this.targetLayer.addWin(pkg.WinLayer.INFO, this.tooltip, null);
                }
            }
        };

        this.hideTooltipInfo = function(){
            if(this.tooltip != null){
                this.targetLayer.remove(this.tooltip);
                this.tooltip = null;
            }
        };
    },

    function(){
        this.$super();
        this.tooltips = {};
        this.x = this.y = 0;
        this.targetLayer = this.tooltip = this.target = null;
        this.tick = 400;

    },

    function setTooltip(c,data){
        if(data != null) this.tooltips[c] = zebra.isString(data) ? pkg.TooltipManager.createTooltip(data) : data;
        else {
            if(this.target == c){
                timer.remove(this);
                this.target = null;
                this.hideTooltipInfo();
            }
            delete this.tooltips[c];
        }
    },

    function mousePressed(e){
        if(this.target != null){
            timer.remove(this);
            this.target = null;
            this.hideTooltipInfo();
        }
    },

    function mouseReleased(e){
        if(this.target != null){
            this.x = e.x;
            this.y = e.y;
            timer.run(this, this.tick, this.tick);
        }
    },

    function destroy() {  delete this.tooltips; }
]);

pkg.Menu = Class(pkg.CompList, pkg.ChildrenListener, [
    function $prototype() {
        this.rightIndent = this.gap = 4;
        this.leftIndent = 2;

        this.getSubMenuIndex = function (target){
            for(var i = 0;i < this.menus.length; i++) {
                if (this.menus[i][0] == target) return i;
            }
            return -1;
        };

        this.isDecorative = function (index){
            return !(zebra.instanceOf(this.kids[index], pkg.Panel) &&
                     zebra.instanceOf(this.kids[index].layout, pkg.Menu));
        };

        this.canHaveFocus = function(){return true;};

        this.childCompEvent = function(id,src){
            if(id == ComponentListener.COMP_SHOWN ||
               id == ComponentListener.COMP_ENABLED)
            {
                for(var i = 0;i < this.kids.length; i++){
                    if(this.fetchContentComp(i) == src){
                        var ccc = this.kids[i];
                        ccc.setVisible(src.isVisible);
                        ccc.setEnabled(src.isEnabled);
                        if(i > 0 && this.isDecorative(i - 1)) this.kids[i - 1].setVisible(src.isVisible);
                        break;
                    }
                }
            }
        };

        this.hasVisibleItems = function(){
            for(var i = 0;i < this.kids.length; i++) if (this.kids[i].isVisible) return true;
            return false;
        };
    },

    function $clazz() {
        this.Label = Class(pkg.Label, []);
        this.ItemPan = Class(pkg.Panel, []);
        this.Line = Class(pkg.Line, []);
        this.SubImage = Class(pkg.ImagePan, []);
    },

    function () { this.$this(-1); },

    function (key){
        this.arrowAreaWidth = this.iconAreaWidth = 0;
        this.parentComp = null;
        this.menus = [];
        this.key = key;
        this.$super(true);
    },

    function setIndents(left,right){
        if(left != this.leftIndent || right != this.rightIndent){
            this.leftIndent = left;
            this.rightIndent = right;
            this.vrp();
        }
    },

    function insert(i,o,c){ return this.$super(i, o, this.createItem(c));},
    function addDecorative(c){ this.addDecorative(null, c); },
    function addDecorative(constr, c) { this.$super(this.insert, this.kids.length, constr, c); },
    function addLine(){ this.addDecorative(new Menu.Line()); },

    function addWithIcon(c,icon){
        var p = this.createItem(c);
        p.insert(0, null, icon);
        this.$super(this.insert, this.kids.length, null, p);
    },

    function removeAll(){
        this.menus.length = 0;
        this.menus = [];
        this.$super();
    },

    function removeAt(i){
        this.setSubMenu(i, null);
        this.$super(i);
    },

    function setSubMenu(index,menu){
        if(index >= this.kids.length || menu == this || this.isDecorative(index)) throw new Error();
        var p = this.get(index), sub = this.getSubMenuIndex(p), psub = sub < 0 ? null : this.getSubMenu(index);
        if(psub != null) psub.setMenuParent(null);
        if(menu != null){
            if(sub < 0) {
                this.menus.push([p, menu]);
                p.add(new pkg.Menu.SubImage());
            }
            else this.menus[sub][1] = menu;
            menu.setMenuParent(this);
        }
        else{
            if(sub >= 0){
                this.menus.splice(sub, 1);
                p.removeAt(p.kids.length - 1);
            }
        }
    },

    function posChanged(target,prevOffset,prevLine,prevCol){
        var off = this.position.offset;
        if(off < 0 || (this.kids.length > 0 && this.kids[off].isVisible)){
            this.$super(target, prevOffset, prevLine, prevCol);
        }
        else{
            var d = (prevOffset < off) ? 1 :  -1, cc = this.kids.length, ccc = cc;
            for(; cc > 0 && (!this.get(off).isVisible || this.isDecorative(off)); cc--){
                off += d;
                if(off < 0) off = ccc - 1;
                if(off >= ccc) off = 0;
            }
            if(cc > 0){
                this.position.setOffset(off);
                this.repaint();
            }
        }
    },

    function getSubMenu(index){
        if (this.menus.length === 0) return null;
        var sub = this.getSubMenuIndex(this.get(index));
        return sub < 0 ? null : this.menus[sub][1];
    },

    function select(index){
        if(index < 0 || !this.isDecorative(index)){
            if(index >= 0){
                var l = this.fetchContentComp(index);
                if(l.isEnabled === false) return;
                if(zebra.instanceOf(l, pkg.Checkbox)) l.setState(!l.getState());
            }
            this.$super(this.select,index);
        }
    },

    function calcPreferredSize(target){
        var cc = target.kids.length, gaps = this.getItemGap(),
            ps = (cc > 2 || (this.getSubMenuIndex(target) < 0 && cc > 1)) ? target.kids[1].getPreferredSize()
                                                                          : target.kids[0].getPreferredSize();
        for(var i = 0;i < cc; i++){
            var cps = target.get(i).getPreferredSize();
            if (cps.height > ps.height) ps.height = cps.height;
        }
        ps.width += this.leftIndent + this.rightIndent + this.iconAreaWidth + this.arrowAreaWidth + 2 * gaps;
        ps.height += 2 * gaps;
        return ps;
    },

    function doLayout(target){
        var top = target.getTop(), left = target.getLeft(), right = target.getRight(), bottom = target.getBottom();
        left  += this.leftIndent;
        right += this.rightIndent;

        var x = left, eh = target.height - top - bottom, ew = target.width - left - right,
            count = target.kids.length, hasSub = this.getSubMenuIndex(target) >= 0, l = null;

        if(hasSub){
            l = target.kids[count - 1];
            var ps = l.getPreferredSize();
            l.setLocation(left + ew - ps.width, top + ((eh - ps.height) / 2) + 0.5) | 0;
            l.setSize(ps.width, ps.height);
        }

        if(count > 2 || (!hasSub && count > 1)){
            l = target.kids[0];
            var ps = l.getPreferredSize();
            l.setLocation(x, top + ((eh - ps.height) / 2) + 0.5) | 0;
            l.setSize(ps.width, ps.height);
            l = target.kids[1];
        }
        else l = target.kids[0];

        var ps = l.getPreferredSize();
        l.setLocation(x + this.iconAreaWidth, top + ((eh - ps.height) / 2) + 0.5) | 0;
        l.setSize(ew - this.iconAreaWidth - this.arrowAreaWidth, ps.height);
    },

    function update(g){
        if(this.views["marker"] != null && this.hasFocus()){
            var gap = this.getItemGap(), offset = this.position.offset;
            if(offset >= 0 && !this.isDecorative(offset)){
                this.views["marker"].paint(g, this.getItemX(offset) - gap,
                                           this.getItemY(offset) - gap,
                                           this.getItemW(offset) + 2 * gap,
                                           this.getItemH(offset) + 2 * gap, this);
            }
        }
    },

    function mouseExited(e){
        var offset = this.position.offset;
        if(offset >= 0 && this.getSubMenu(offset) == null) this.position.clearPos();
    },

    function fetchContentComp(index){
        var count = this.kids[index].length;
        return this.isDecorative(index) ? null : this.kids[index].get((count > 2 || (this.getSubMenu(index) == null && count > 1)) ? 1 : 0);
    },

    function keyPressed(e){
        var position = this.position;
        if(position.metrics.getMaxOffset() > 0){
            var code = e.code, offset = position.offset;
            if(code == KE.VK_DOWN){
                var ccc = this.kids.length;
                do { offset = (offset + 1) % ccc; }
                while(this.isDecorative(offset));
                position.setOffset(offset);
            }
            else {
                if(code == KE.VK_UP){
                    var ccc = this.kids.length;
                    do { offset = (ccc + offset - 1) % ccc; }
                    while(this.isDecorative(offset));
                    position.setOffset(offset);
                }
                else
                    if(e.code == KE.VK_ENTER || e.code == KE.VK_SPACE) this.select(offset);
            }
        }
    },

    function drawPosMarker(g,x,y,w,h){},

    function createItem(c){
        if (zebra.isString(c)) c = new pkg.Menu.Label(c);

        var cc = c, pan = new pkg.Menu.ItemPan(this);

        if (zebra.instanceOf(cc, pkg.StatePan)) cc = c.focusComponent;
        else
        if(zebra.instanceOf(c, pkg.Checkbox)){
            var box = c.box;
            c.setBox(box, false);
            c.setLayout(new L.FlowLayout(L.LEFT, L.CENTER));
            c.padding(0);
            pan.add(box);
        }
        pan.add(c);
        pan.setEnabled(c.isEnabled);
        pan.setVisible(c.isVisible);
        pan.setBackground(null);
        return pan;
    },

    function recalc(){
        for(var i = 0;i < this.kids.length; i++) this.kids[i].invalidate();
        this.iconAreaWidth = this.arrowAreaWidth = 0;
        for(var i = 0;i < this.kids.length; i++){
            if(!this.isDecorative(i)){
                var pan = this.kids[i], sub = this.getSubMenuIndex(pan), cc = pan.kids.length;
                if((sub < 0 && cc > 1) || cc > 2){
                    var ps = pan.kids[0].getPreferredSize();
                    if(this.iconAreaWidth < ps.width) this.iconAreaWidth = ps.width;
                }
                if(sub >= 0){
                    var ps = pan.kids[cc - 1].getPreferredSize();
                    if(this.arrowAreaWidth < ps.width) this.arrowAreaWidth = ps.width;
                }
            }
        }
        if(this.iconAreaWidth > 0) this.iconAreaWidth += this.gap;
        if(this.arrowAreaWidth > 0) this.arrowAreaWidth += this.gap;
    },

    function setMenuParent(m){ this.parentComp = m; }
]);

pkg.MenuBar = Class(pkg.Panel, pkg.ChildrenListener, pkg.KeyListener, [
    function $prototype() {
        this.childInputEvent = function(e){
            var target = L.getDirectChild(this, e.source);
            switch(e.ID)
            {
                case MouseEvent.ENTERED:{
                    if(this.over != target){
                        var prev = this.over;
                        this.over = target;
                        if(this.selected != null) this.$select(this.over);
                        else this.repaint2(prev, this.over);
                    }
                } break;
                case MouseEvent.EXITED:{
                    var p = L.getRelLocation(e.absX, e.absY, pkg.getDesktop(this), this.over);
                    if(p[0] < 0 || p[1] < 0 || p[0] >= this.over.width || p[1] >= this.over.height){
                        var prev = this.over;
                        this.over = null;
                        if (this.selected == null) this.repaint2(prev, this.over);
                    }
                } break;
                case MouseEvent.PRESSED:{
                    this.over = target;
                    this.$select(this.selected == target ? null : target);
                } break;
            }
        };

        this.activated = function(b) { if (!b) this.$select(null); };

        this.$select = function(b){
            if(this.selected != b){
                var prev = this.selected, d = pkg.getDesktop(this);
                this.selected = b;
                if(d != null){
                    var pop = d.getLayer(pkg.PopupLayer.ID);
                    pop.removeAll();
                    if(this.selected != null){
                        pop.setMenuBar(this);
                        var menu = this.getMenu(this.selected);
                        if(menu != null && menu.hasVisibleItems()){
                            var abs = L.getAbsLocation(0,0,this.selected);
                            menu.setLocation(abs[0], abs[1] + this.selected.height + 1);
                            pop.add(menu);
                        }
                    }
                    else pop.setMenuBar(null);
                }
                this.repaint2(prev, this.selected);
                this.itemSelected(this.selected);
            }
        };

        this.repaint2 = function(i1,i2){
            if(i1 != null) i1.repaint();
            if(i2 != null) i2.repaint();
        };
    },

    function $clazz() {
        this.Label = Class(pkg.Label, []);
    },

    function (){
        this.menus = {};
        this.over = this.selected = null;
        this.views = {};
        this.$super();
    },

    function add(c,m){
        if (isString(c) ) c = new pkg.MenuBar.Label(c);
        var r = this.add(c);
        this.setMenu(this.kids.length - 1, m);
        return r;
    },

    function setMenu(index,m){
        var c = this.get(index);
        if(m == null) {
            var pm = this.menus.hasOwnProperty(c) ? this.menus[c] : null;
            if (pm != null) {
                delete this.menus[c];
                pm.setMenuParent(null);
            }
        }
        else {
            this.menus[c] = m;
            m.setMenuParent(this);
        }
    },

    function removeAt(i){
        this.setMenu(i, null);
        this.$super(i);
    },

    function removeAll(){
        this.menus = {};
        this.$super();
    },


    function paint(g){
        var target = (this.selected != null) ? this.selected : this.over;
        if(target != null){
            var v = (this.selected != null) ? this.views["on"] : this.views["off"];
            if(v != null) v.paint(g, target.x, target.y, target.width, target.height, this);
        }
    },

    function keyPressed(e){
        if(this.selected != null){
            var idx = this.indexOf(this.selected), pidx = idx, c = null;
            if(e.code == KE.VK_LEFT){
                var ccc = this.kids.length;
                do {
                    idx = (ccc + idx - 1) % ccc;
                    c = this.kids[idx];
                }
                while(!c.isEnabled || !c.isVisible);
            }
            else
                if(e.code == KE.VK_RIGHT){
                    var ccc = this.kids.length;
                    do {
                        idx = (idx + 1) % ccc;
                        c = this.kids[idx];
                    }
                    while(!c.isEnabled || !c.isVisible);
                }
            if(idx != pidx) this.$select(this.get(idx));
        }
    },

    function getMenu(c) { return this.menus.hasOwnProperty(c) ? this.menus[c] : null; },
    function itemSelected(selected) {}
]);

pkg.PopupLayer = Class(pkg.BaseLayer, pkg.ChildrenListener, [
    function $clazz() {
        this.ID = "pop";
    },

    function $prototype() {
        this.mTop = this.mLeft = this.mBottom = this.mRight = 0;

        this.layerMousePressed = function(x,y,mask){
            if(this.isLayerActiveAt(x, y) && this.getComponentAt(x, y) == this){
                this.removeAll();
                this.setMenuBar(null);
            }
        };

        this.isLayerActive = function(){return this.kids.length > 0;};

        this.isLayerActiveAt = function(x,y){
            return this.kids.length > 0 && (this.mbar == null || y > this.mBottom || y < this.mTop ||
                   x < this.mLeft || x > this.mRight || this.getComponentAt(x, y) != this);
        };

        this.childInputEvent = function(e){
            if(e.UID == pkg.InputEvent.KEY_UID){
                if(e.ID == KE.PRESSED && e.code == KE.VK_ESCAPE){
                    var p = e.source;
                    while(p.parent != this) p = p.parent;
                    this.remove(p);
                    if(this.kids === 0) this.setMenuBar(null);
                }
                if(zebra.instanceOf(this.mbar, pkg.KeyListener))
                    pkg.events.performInput(new KE(this.mbar, e.ID, e.code, e.ch, e.mask));
            }
        };

        this.calcPreferredSize = function (target){ return { width:0, height:0 }; };
    },

    function (){
        this.mbar = null;
        this.pcMap = [];
        this.$super(pkg.PopupLayer.ID);
    },

    function run(){
        timer.remove(this);
        if(this.kids.length > 0){
            var menu = this.kids[this.kids.length - 1];
            menu.select(menu.position.offset);
        }
    },

    function removeAt(index){ for(var i = this.kids.length - 1;i >= index; i--) this.$super(this.removeAt,index); },

    function posChanged(target,prevOffset,prevLine,prevCol){
        if (timer.get(this)) timer.remove(this);
        var selectedIndex = target.offset;
        if(selectedIndex >= 0){
            var index = this.pcMap.indexOf(target), sub = this.get(index).getSubMenu(selectedIndex);
            if(index + 1 < this.kids.length && sub != this.get(index + 1)) this.removeAt(index + 1);
            if(index + 1 == this.kids.length && sub != null) timer.run(this, 900, 5000);
        }
    },

    function fired(src,data){
        var index = (data != null) ? src.selectedIndex :  -1;
        if(index >= 0){
            var sub = src.getSubMenu(index);
            if(sub != null){
                if(sub.parent == null){
                    sub.setLocation(src.x + src.width - 10, src.y + src.get(index).y);
                    this.add(sub);
                }
                else pkg.focusManager.requestFocus(this.get(this.kids.length - 1));
            }
            else{
                this.removeAll();
                this.setMenuBar(null);
            }
        }
        else {
            if (src.selectedIndex >= 0) {
                var sub = src.getSubMenu(src.selectedIndex);
                if (sub != null) { this.remove(sub); }
            }
        }
    },

    function setMenuBar(mb){
        if(this.mbar != mb){
            this.removeAll();
            if (this.mbar && this.mbar.activated) this.mbar.activated(false);
            this.mbar = mb;
            if(this.mbar != null){
                var abs = L.getAbsLocation(0, 0, this.mbar);
                this.mLeft = abs[0];
                this.mRight = this.mLeft + this.mbar.width - 1;
                this.mTop = abs[1];
                this.mBottom = this.mTop + this.mbar.height - 1;
            }
            if (this.mbar && this.mbar.activated) this.mbar.activated(true);
        }
    },

    function kidAdded(index,id,lw){
        this.$super(index, id, lw);
        if(zebra.instanceOf(lw, pkg.Menu)){
            lw.position.clearPos();
            lw.select(-1);
            this.pcMap.splice(index, 0, lw.position);
            lw._.add(this);
            lw.position._.add(this);
            lw.requestFocus();
        }
    },

    function kidRemoved(index,lw){
        this.$super(index, lw);
        if(zebra.instanceOf(lw, pkg.Menu)){
            lw._.remove(this);
            lw.position._.remove(this);
            this.pcMap.splice(index, 1);
            if(this.kids.length > 0) {
                this.get(this.kids.length - 1).select(-1);
                this.get(this.kids.length - 1).requestFocus();
            }
        }
    },

    function doLayout(target){
        var cnt = this.kids.length;
        for(var i = 0; i < cnt; i++){
            var m = this.kids[i];
            if(zebra.instanceOf(m, pkg.Menu)){
                var ps = m.getPreferredSize(),
                    xx = (m.x + ps.width > this.width) ? this.width - ps.width : m.x,
                    yy = (m.y + ps.height > this.height) ? this.height - ps.height : m.y;
                m.setSize(ps.width, ps.height);
                if (xx < 0) xx = 0;
                if (yy < 0) yy = 0;
                m.setLocation(xx, yy);
            }
        }
    }
]);

pkg.PopupManager = Class(pkg.Manager, pkg.MouseListener, [
    function () {
        this.$super();
        this.menus = {};
        this.time = this.initialX = this.initialY = 0;
    },

    function setPopup(c,p){
        if(p == null) delete this.menus[c];
        else this.menus[c] = p;
    },

    function getPopup(c){ return this.menus.hasOwnProperty(c) ? this.menus[c] : null; },
    function destroy(){ delete this.menus; },

    function mousePressed(e){
        this.time = zebra.util.currentTimeMillis();
        this.initialX = e.absX;
        this.initialY = e.absY;
        if((e.mask & MouseEvent.RIGHT_BUTTON) > 0) {
            this.addPopup(e.source, e.x, e.y);
        }
    },

    function mouseReleased(e){
        if (this.time > 0 && zebra.util.currentTimeMillis() - this.time > 500){
            var nx = e.absX, ny = e.absY;
            if(this.initialX == nx && this.initialY == ny) this.addPopup(e.source, nx, ny);
        }
    },

    function fetchMenu(target,x,y){
        var popup = this.getPopup(target);
        return (popup != null) ? popup.getPopup(target, x, y) : (zebra.instanceOf(target, pkg.PopupInfo)) ? target.getPopup(target, x, y) : null;
    },

    function addPopup(target,x,y){
        var menu = this.fetchMenu(target, x, y);
        if(menu != null){
            menu.setLocation(this.initialX, this.initialY);
            pkg.getDesktop(target).getLayer(pkg.PopupLayer.ID).add(menu);
            menu.requestFocus();
        }
        this.time = -1;
    }
]);

})(zebra("ui"), zebra.Class, zebra.Interface);
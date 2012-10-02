(function(pkg, Class, Interface) {

pkg.TooltipInfo = Interface();
pkg.PopupInfo = Interface();

var KE = pkg.KeyEvent, timer = zebra.util.timer, L = zebra.layout, InputEvent = pkg.InputEvent, MouseEvent = pkg.MouseEvent,
    WinListener = pkg.WinListener, ComponentListener = pkg.ComponentListener, Dimension = zebra.util.Dimension, BaseList = pkg.BaseList;

pkg.WinLayer = Class(pkg.BaseLayer, pkg.ChildrenListener, function($) {
    var WL = this, WIN_OPENED = 1, WIN_CLOSED = 2, WIN_ACTIVATED = 3, WIN_DEACTIVATED = 4, VIS_PART_SIZE = 30;

    WL.ID = "win";
    WL.MODAL = 1;
    WL.MDI   = 2;
    WL.INFO  = 3;

    $(function (){
        this.activeWin = null;
        this.topModalIndex = -1;
        this.winsInfo  = {};
        this.winsStack = [];
        this._ = new zebra.util.Listeners();
        this.$super(WL.ID);
        this.setBackground(null);

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
                    if(d.isVisible && d.isEnabled && winType(this, d) != WL.INFO &&
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
    });

    $(function childInputEvent(e) { if (e.ID == InputEvent.FOCUS_GAINED) this.activate(L.getDirectChild(this, e.source)); });

    $(function addWin(type, win, listener) {
        this.winsInfo[win] = [ this.activeWin, type, listener ];
        this.add(win);
    });

    $(function insert(index, constr, lw) {
        var info = this.winsInfo[lw];
        if (typeof info === 'undefined') {
            info = [this.activeWin, WL.MDI, null];
            this.winsInfo[lw] = info;
        }
        if (info[1] != WL.MDI && info[1] != WL.MODAL && info[1] != WL.INFO) throw new Error();
        return this.$super(index, constr, lw);
    });

    $(function kidAdded(index,constr,lw){
        this.$super(index, constr, lw);
        var info = this.winsInfo[lw];
        this.winsStack.push(lw);
        if (info[1] == WL.MODAL) this.topModalIndex = this.winsStack.length - 1;
        this.fire(WIN_OPENED, lw);
        if(info[1] == WL.MODAL) this.activate(lw);
    });

    $(function kidRemoved(index,lw){
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
                    if (winType(this, this.winsStack[this.topModalIndex]) == WL.MODAL) break;
                }
            }
        }

        this.fire(WIN_CLOSED, lw, l);
        if(this.topModalIndex >= 0){
            var aindex = this.winsStack.length - 1;
            while(winType(this, this.winsStack[aindex]) == WL.INFO) aindex--;
            this.activate(this.winsStack[aindex]);
        }
    });

    $(function getComponentAt(x,y){
        return (this.activeWin == null) ? null : this.activeWin.getComponentAt(x - this.activeWin.x, y - this.activeWin.y);
    });

    $(function calcPreferredSize(target){ return L.getMaxPreferredSize(target); });

    $(function doLayout(target){
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
    });

    $(function activate(c){
        if(c != null && (this.winsInfo.hasOwnProperty(c) === false || winType(this, c) == WL.INFO)) throw new Error("101");
        if(c != this.activeWin){
            var old = this.activeWin;
            if(c == null){
                if (winType(this, this.activeWin) == WL.MODAL) throw new Error();
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
    });

    $(function getFocusRoot(){ return this.activeWin; });

    $(function fire(id, win) { this.fire(id, win, this.winsInfo[win][2]); });

    $(function fire(id, win, l){
        var b = (id == WIN_OPENED || id == WIN_ACTIVATED), n = (id == WIN_OPENED || id == WIN_CLOSED) ? "winOpened" : "winActivated";
        this._.fireTo(n, [this, win, b]);
        if (zebra.instanceOf(win, WinListener)) win[n].apply(win, [this, win, b]);
        if (l != null) l[n].apply(l, [this, win, b]);
    });

    function winType(t, w){ return t.winsInfo[w][1]; }
});

pkg.Window = Class(pkg.Panel, pkg.MouseMotionListener, WinListener,
                       pkg.MouseListener, pkg.Composite, pkg.Cursorable,
                       pkg.FocusListener, pkg.ExternalEditor, function($) {
    var MIN_SIZE = 40, MOVE_ACTION = 1, SIZE_ACTION = 2;

    $(function () {  this.$this("");  });
    $(function (s){
        this.$super(new L.BorderLayout(2,2));

        this.isSizeable = true;
        this.prevH = this.prevX = this.prevY = this.psw = this.psh = this.px = this.py = this.dx = this.dy = 0;
        this.prevW = this.action = -1;
        this.createRoot();
        this.createCaption();
        this.createStatus();

        this.add(L.CENTER, this.root);
        this.add(L.TOP, this.caption);
        this.add(L.BOTTOM, this.status);

        if (this.title != null) this.title.setText(s);
        this.setBorder(pkg.get("win.br"));
        this.setSizeable(true);
        this.customize(pkg.Wizard.WIN);
    });

    $(function createRoot() { this.root = new pkg.Panel(new L.BorderLayout()); });

    $(function createCaption() {
        this.caption = new pkg.Panel(new L.BorderLayout(2, 2));
        this.caption.padding(1);

        var exit = new pkg.Button(), man = new pkg.view.ViewSet();
        man.put("over", pkg.get("win.b.over"));
        man.put("out", pkg.get("win.b.out"));
        man.put("pressed", pkg.get("win.b.pressed"));
        exit.setView(man);
        exit._.add(this);

        this.title = new pkg.Label();
        this.title.setBackground(null);
        this.title.setForeground(zebra.util.rgb.white);
        this.title.getView().setDefBoldFont();

        this.buttons = new pkg.Panel(new L.FlowLayout(L.CENTER, L.CENTER));
        this.buttons.setBackground(null);

        this.icons = new pkg.Panel(new L.FlowLayout(L.LEFT, L.CENTER, L.HORIZONTAL, 2));
        this.icons.setBackground(null);

        this.icons.add(new pkg.ImagePan(pkg.get("win.icon")));
        this.icons.add(this.title);

        this.caption.add(L.LEFT, this.icons);
        this.caption.add(L.RIGHT, this.buttons);
        this.buttons.add(exit);
    });

    $(function fired(src) { this.parent.remove(this); });

    $(function createStatus(){
        this.status = new pkg.Panel(new L.FlowLayout(L.RIGHT, L.CENTER));
        this.sizer = new pkg.ImagePan(pkg.get("win.corner"))
        this.status.add(this.sizer);
        this.status.setBackground(null);
    });

    $(function focusGained(e){ focusStateUpdated(this); });
    $(function focusLost(e){ focusStateUpdated(this); });

    $(function setSizeable(b){
        if(this.isSizeable != b){
            this.isSizeable = b;
            if (this.sizer != null) this.sizer.setVisible(b);
        }
    });

    $(function startDragged(e){
        this.px = e.x;
        this.py = e.y;
        this.psw = this.width;
        this.psh = this.height;
        this.action = insideCorner(this, this.px, this.py) ? (this.isSizeable ? SIZE_ACTION : -1): MOVE_ACTION;
        if(this.action > 0) this.dy = this.dx = 0;
    });

    $(function mouseDragged(e){
        if(this.action > 0){
            if(this.action != MOVE_ACTION){
                var nw = this.psw + this.dx, nh = this.psh + this.dy;
                if(nw > MIN_SIZE && nh > MIN_SIZE) this.setSize(nw, nh);
            }
            this.dx = (e.x - this.px);
            this.dy = (e.y - this.py);
            if(this.action == MOVE_ACTION){
                this.invalidate();
                this.setLocation(this.x + this.dx, this.y + this.dy);
            }
        }
    });

    $(function endDragged(e){
        if(this.action > 0){
            if(this.action == MOVE_ACTION){
                this.invalidate();
                this.setLocation(this.x + this.dx, this.y + this.dy);
            }
            this.action = -1;
        }
    });

    $(function winOpened(winLayer,target,b) { if (this.caption != null) this.caption.setBackground(pkg.get("win.cap.iv")); });

    $(function winActivated(winLayer, target,b){
        if (this.caption != null) {
            this.caption.setBackground(pkg.get(b?"win.cap.av":"win.cap.iv"));
        }
    });

    $(function getCursorType(target,x,y){
        return (this.isSizeable && insideCorner(this, x, y)) ? pkg.Cursor.SE_RESIZE : -1;
    });

    $(function catchInput(c){
        var tp = this.caption;
        return c == tp || (L.isAncestorOf(tp, c) && !(zebra.instanceOf(c, pkg.Button))) || this.sizer== c;
    });

    $(function mouseClicked(e){
        var x = e.x, y = e.y, cc = this.caption;
        if(e.clicks == 2 && this.isSizeable && x > cc.x && x < cc.y + cc.width && y > cc.y && y < cc.y + cc.height){
            if(this.prevW < 0) this.maximize();
            else this.restore();
        }
    });

    $(function maximize(){
        if(this.prevW < 0){
            var d = pkg.getDesktop(this), left = d.getLeft(), top = d.getTop();
            this.prevX = this.x;
            this.prevY = this.y;
            this.prevW = this.width;
            this.prevH = this.height;
            this.setLocation(left, top);
            this.setSize(d.width - left - d.getRight(), d.height - top - d.getBottom());
        }
    });

    $(function restore(){
        if(this.prevW >= 0){
            this.setLocation(this.prevX, this.prevY);
            this.setSize(this.prevW, this.prevH);
            this.prevW = -1;
        }
    });

    $(function isMaximized(){ return this.prevW != -1; });
    $(function focusStateUpdated(){ if(this.caption != null) this.caption.repaint(); });

    function insideCorner(t, px,py){ return t.getComponentAt(px, py) == t.sizer; }
});

pkg.TooltipManager = Class(pkg.Manager, pkg.MouseListener, pkg.MouseMotionListener, function($) {
    var TM = this, TI = pkg.TooltipInfo;

    $(function(){
        this.$super();
        this.tooltips = {};
        this.x = this.y = 0;
        this.targetLayer = this.tooltip = this.target = null;
        this.tick = 400;

        this.mouseEntered = function(e){
            var c = e.source;
            if(zebra.instanceOf(c, TI) || this.tooltips[c]){
                this.target = c;
                this.targetLayer = pkg.getDesktop(c).getLayer(pkg.WinLayer.ID);
                this.x = e.x;
                this.y = e.y;
                timer.run(this, this.tick, this.tick);
            }
        }

        this.mouseExited = function(e){
            if(this.target != null){
                timer.remove(this);
                this.target = null;
                hideTooltipInfo(this);
            }
        }

        this.mouseMoved = function(e){
            if(this.target != null){
                timer.clear(this);
                this.x = e.x;
                this.y = e.y;
                hideTooltipInfo(this);
            }
        }

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
        }
    });

    $(function setTooltip(c,data){
        if(data != null) this.tooltips[c] = zebra.isString(data) ? TM.createTooltip(data) : data;
        else {
            if(this.target == c){
                timer.remove(this);
                this.target = null;
                hideTooltipInfo(this);
            }
            delete this.tooltips[c];
        }
    });

    $(function mousePressed(e){
        if(this.target != null){
            timer.remove(this);
            this.target = null;
            hideTooltipInfo(this);
        }
    });

    $(function mouseReleased(e){
        if(this.target != null){
            this.x = e.x;
            this.y = e.y;
            timer.run(this, this.tick, this.tick);
        }
    });

    $(function destroy() {  delete this.tooltips; });

    this.createTooltip = function(text){
        var lab = new pkg.Label(new zebra.data.Text(text));
        lab.setBackground(pkg.get("tt.bg"));
        lab.setFont(pkg.get("tt.fn"));
        lab.setForeground(pkg.get("tt.fg"));
        lab.setBorder(pkg.get("tt.br"));
        var ins = pkg.get("tt.padding");
        if(ins != null) lab.paddings(ins[0], ins[1], ins[2], ins[3]);
        else lab.padding(2, 6, 2, 6);
        lab.toPreferredSize();
        return lab;
    }

    function hideTooltipInfo(t){
        if(t.tooltip != null){
            t.targetLayer.remove(t.tooltip);
            t.tooltip = null;
        }
    }
});

pkg.Menu = Class(pkg.CompList, pkg.ChildrenListener, function($) {
    $(function () { this.$this(-1); });

    $(function (key){
        this.$super(true);
        this.setLayout(new L.ListLayout(1));

        this.gap = 4;
        this.leftIndent = 2;
        this.rightIndent = 4;
        this.arrowAreaWidth = this.iconAreaWidth = 0;
        this.parentComp = null;
        this.menus = [];
        this.key = key;

        this.setElementView(BaseList.POS_BR_VIEW, pkg.get("menu.pos.br"));
        this.setElementView(BaseList.SEL_VIEW, pkg.get("menu.sv"));
        this.padding(3);
        this.setBorder(pkg.get("menu.br"));
        this.setBackground(pkg.get("menu.bg"));
        this.customize(pkg.Wizard.MENU);
    });

    $(function setIndents(left,right){
        if(left != this.leftIndent || right != this.rightIndent){
            this.leftIndent = left;
            this.rightIndent = right;
            this.vrp();
        }
    });

    $(function insert(i,o,c){ return this.$super(i, o, this.createItem(c));});
    $(function addDecorative(c){ this.addDecorative(null, c); });
    $(function addDecorative(constr, c) { this.$super(this.insert, this.kids.length, constr, c); });
    $(function addLine(){ this.addDecorative(pkg.get("menu.item.line")); });

    $(function addWithIcon(c,icon){
        var p = this.createItem(c);
        p.insert(0, null, icon);
        this.$super(this.insert, this.kids.length, null, p);
    });

    $(function removeAll(){
        this.menus.length = 0;
        this.menus = [];
        this.$super();
    });

    $(function removeAt(i){
        this.setSubMenu(i, null);
        this.$super(i);
    });

    $(function setSubMenu(index,menu){
        if(index >= this.kids.length || menu == this || isDecorative(this, index)) throw new Error();
        var p = this.get(index), sub = getSubMenuIndex(this, p), psub = sub < 0 ? null : this.getSubMenu(index);
        if(psub != null) psub.setMenuParent(null);
        if(menu != null){
            if(sub < 0) {
                this.menus.push([p, menu]);
                var ip = new pkg.ImagePan(pkg.get("menu.sub"));
                ip.setBackground(null);
                p.add(ip);
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
    });

    $(function posChanged(target,prevOffset,prevLine,prevCol){
        var off = this.position.offset;
        if(off < 0 || (this.kids.length > 0 && this.kids[off].isVisible)){
            this.$super(target, prevOffset, prevLine, prevCol);
        }
        else{
            var d = (prevOffset < off) ? 1 :  -1, cc = this.kids.length, ccc = cc;
            for(; cc > 0 && (!this.get(off).isVisible || isDecorative(this, off)); cc--){
                off += d;
                if(off < 0) off = ccc - 1;
                if(off >= ccc) off = 0;
            }
            if(cc > 0){
                this.position.setOffset(off);
                this.repaint();
            }
        }
    });

    $(function hasVisibleItems(){
        for(var i = 0;i < this.kids.length; i++) if (this.kids[i].isVisible) return true;
        return false;
    });

    $(function getSubMenu(index){
        if (this.menus.length === 0) return null;
        var sub = getSubMenuIndex(this, this.get(index));
        return sub < 0 ? null : this.menus[sub][1];
    });

    $(function select(index){
        if(index < 0 || !isDecorative(this, index)){
            if(index >= 0){
                var l = this.fetchContentComp(index);
                if(!l.isEnabled) return;
                if(zebra.instanceOf(l, pkg.Checkbox)) l.setState(!l.getState());
            }
            this.$super(this.select,index);
        }
    });

    $(function calcPreferredSize(target){
        var cc = target.kids.length, gaps = this.getItemGap();
        var ps = (cc > 2 || (getSubMenuIndex(this, target) < 0 && cc > 1)) ? target.kids[1].getPreferredSize()
                                                                           : target.kids[0].getPreferredSize();
        for(var i = 0;i < cc; i++){
            var cps = target.get(i).getPreferredSize();
            if (cps.height > ps.height) ps.height = cps.height;
        }
        ps.width += this.leftIndent + this.rightIndent + this.iconAreaWidth + this.arrowAreaWidth + 2 * gaps;
        ps.height += 2 * gaps;
        return ps;
    });

    $(function doLayout(target){
        var top = target.getTop(), left = target.getLeft(), right = target.getRight(), bottom = target.getBottom();
        left  += this.leftIndent;
        right += this.rightIndent;
        var x = left, eh = target.height - top - bottom, ew = target.width - left - right;
        var count = target.kids.length, hasSub = getSubMenuIndex(this, target) >= 0, l = null;
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
    });

    $(function update(g){
        if(this.getElementView(BaseList.POS_BR_VIEW) != null && this.hasFocus()){
            var gap = this.getItemGap(), offset = this.position.offset;
            if(offset >= 0 && !isDecorative(this, offset)){
                this.getElementView(BaseList.POS_BR_VIEW).paint(g, this.getItemX(offset) - gap,
                                                                   this.getItemY(offset) - gap,
                                                                   this.getItemW(offset) + 2 * gap,
                                                                   this.getItemH(offset) + 2 * gap, this);
            }
        }
    });

    $(function canHaveFocus(){return true;});

    $(function childCompEvent(id,src){
        if(id == ComponentListener.COMP_SHOWN || id == ComponentListener.COMP_ENABLED){
            for(var i = 0;i < this.kids.length; i++){
                if(this.fetchContentComp(i) == src){
                    var ccc = this.kids[i];
                    ccc.setVisible(src.isVisible);
                    ccc.setEnabled(src.isEnabled);
                    if(i > 0 && isDecorative(this, i - 1)) this.kids[i - 1].setVisible(src.isVisible);
                    break;
                }
            }
        }
    });

    $(function mouseExited(e){
        var offset = this.position.offset;
        if(offset >= 0 && this.getSubMenu(offset) == null) this.position.clearPos();
    });

    $(function fetchContentComp(index){
        var count = this.kids[index].length;
        return isDecorative(this, index) ? null : this.kids[index].get((count > 2 || (this.getSubMenu(index) == null && count > 1)) ? 1 : 0);
    });

    $(function keyPressed(e){
        var position = this.position;
        if(position.metrics.getMaxOffset() > 0){
            var code = e.code, offset = position.offset;
            if(code == KE.VK_DOWN){
                var ccc = this.kids.length;
                do { offset = (offset + 1) % ccc; }
                while(isDecorative(this, offset));
                position.setOffset(offset);
            }
            else
                if(code == KE.VK_UP){
                    var ccc = this.kids.length;
                    do { offset = (ccc + offset - 1) % ccc; }
                    while(isDecorative(this, offset));
                    position.setOffset(offset);
                }
                else
                    if(e.code == KE.VK_ENTER || e.code == KE.VK_SPACE) this.select(offset);
        }
    });

    $(function drawPosMarker(g,x,y,w,h){});

    $(function createItem(c){
        if (zebra.isString(c)) c = new pkg.Label(c);

        var cc = c, pan = new pkg.Panel(this);

        if(zebra.instanceOf(cc, pkg.ActivePan)) cc = c.focusComponent;
        else
        if(zebra.instanceOf(cc, pkg.Label)){
            cc.setFont(pkg.get("menu.fn"));
            cc.setForeground(pkg.get("menu.fgcol"));
        }
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
        pan.setBackground(null, true);
        return pan;
    });

    $(function recalc(){
        for(var i = 0;i < this.kids.length; i++) this.kids[i].invalidate();
        this.iconAreaWidth = this.arrowAreaWidth = 0;
        for(var i = 0;i < this.kids.length; i++){
            if(!isDecorative(this, i)){
                var pan = this.kids[i], sub = getSubMenuIndex(this, pan), cc = pan.kids.length;
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
    });

    $(function setMenuParent(m){ this.parentComp = m; });

    function getSubMenuIndex(t, target){
        for(var i = 0;i < t.menus.length; i++) if (t.menus[i][0] == target) return i;
        return -1;
    }

    function isDecorative(t, index){
        return !(zebra.instanceOf(t.kids[index], pkg.Panel) && zebra.instanceOf(t.kids[index].layout, pkg.Menu));
    }
});

pkg.MenuBar = Class(pkg.Panel, pkg.ChildrenListener, pkg.KeyListener, pkg.Switchable, function($) {
    var MenuBar = this;

    this.ON_BR_VIEW = 0;
    this.OFF_BR_VIEW = 1;

    $(function (){
        this.menus = {};
        this.over = this.selected = null;
        this.views = [ null, null ];
        this.$super(new L.FlowLayout(4));
        this.padding(1);
        this.setBackground(pkg.get("mbar.bg"));
        this.setBorder(pkg.get("mbar.br"));
        this.views[MenuBar.ON_BR_VIEW] = pkg.get("mbar.onbr");
        this.views[MenuBar.OFF_BR_VIEW] = pkg.get("mbar.offbr");
        this.customize(pkg.Wizard.MENUBAR);
    });

    $(function setView(type,v){
        if(this.views[type] != v){
            this.views[type] = v;
            this.repaint();
        }
    });

    $(function getView(type){
        if(type != MenuBar.ON_BR_VIEW && type != MenuBar.OFF_BR_VIEW) throw new Error("2003");
        return this.views[type];
    });

    $(function add(c,m){
        if (isString(c) ) c = new pkg.Label(c);

        if(zebra.instanceOf(c, pkg.Label)){
            c.setFont(pkg.get("mbar.fn"));
            c.setForeground(pkg.get("mbar.fgcol"));
        }
        c.paddings(1, 5, 1, 5);
        c.setBackground(null);
        var r = this.add(c);
        this.setMenu(this.kids.length - 1, m);
        return r;
    });

    $(function setMenu(index,m){
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
    });

    $(function removeAt(i){
        this.setMenu(i, null);
        this.$super(i);
    });

    $(function removeAll(){
        this.menus = {};
        this.$super();
    });

    $(function childInputEvent(e){
        var target = L.getDirectChild(this, e.source);
        switch(e.ID)
        {
            case MouseEvent.ENTERED:{
                if(this.over != target){
                    var prev = this.over;
                    this.over = target;
                    if(this.selected != null) $select(this, this.over);
                    else repaint(prev, this.over);
                }
            } break;
            case MouseEvent.EXITED:{
                var p = L.getRelLocation(e.absX, e.absY, pkg.getDesktop(this), this.over);
                if(p[0] < 0 || p[1] < 0 || p[0] >= this.over.width || p[1] >= this.over.height){
                    var prev = this.over;
                    this.over = null;
                    if (this.selected == null) repaint(prev, this.over);
                }
            } break;
            case MouseEvent.PRESSED:{
                this.over = target;
                $select(this, this.selected == target ? null : target);
            } break;
        }
    });

    $(function paint(g){
        var target = (this.selected != null) ? this.selected : this.over;
        if(target != null){
            var v = (this.selected != null) ? this.views[MenuBar.ON_BR_VIEW] : this.views[MenuBar.OFF_BR_VIEW];
            if(v != null) v.paint(g, target.x, target.y, target.width, target.height, this);
        }
    });

    $(function keyPressed(e){
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
            if(idx != pidx) $select(this, this.get(idx));
        }
    });

    $(function switched(b){ if (!b) $select(this, null);});
    $(function getMenu(c) { return this.menus.hasOwnProperty(c) ? this.menus[c] : null; });
    $(function itemSelected(selected){});

    function $select(t, b){
        if(t.selected != b){
            var prev = t.selected, d = pkg.getDesktop(t);
            t.selected = b;
            if(d != null){
                var pop = d.getLayer(pkg.PopupLayer.ID);
                pop.removeAll();
                if(t.selected != null){
                    pop.setMenuBar(t);
                    var menu = t.getMenu(t.selected);
                    if(menu != null && menu.hasVisibleItems()){
                        var abs = L.getAbsLocation(0,0,t.selected);
                        menu.setLocation(abs[0], abs[1] + t.selected.height + 1);
                        pop.add(menu);
                    }
                }
                else pop.setMenuBar(null);
            }
            repaint(prev, t.selected);
            t.itemSelected(t.selected);
        }
    }

    function repaint(i1,i2){
        if(i1 != null) i1.repaint();
        if(i2 != null) i2.repaint();
    }
});

pkg.PopupLayer = Class(pkg.BaseLayer, pkg.ChildrenListener, function($) {
    var PopupLayer = this;
    this.ID = "pop";

    $(function (){
        this.mTop = this.mLeft = this.mBottom = this.mRight = 0;
        this.mbar = null;
        this.pcMap = [];
        this.$super(PopupLayer.ID);
        this.setBackground(null);

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
    });

    $(function run(){
        timer.remove(this);
        if(this.kids.length > 0){
            var menu = this.kids[this.kids.length - 1];
            menu.select(menu.position.offset);
        }
    });

    $(function childInputEvent(e){
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
    });

    $(function removeAt(index){ for(var i = this.kids.length - 1;i >= index; i--) this.$super(this.removeAt,index); });

    $(function posChanged(target,prevOffset,prevLine,prevCol){
        if (timer.get(this)) timer.remove(this);
        var selectedIndex = target.offset;
        if(selectedIndex >= 0){
            var index = this.pcMap.indexOf(target), sub = this.get(index).getSubMenu(selectedIndex);
            if(index + 1 < this.kids.length && sub != this.get(index + 1)) this.removeAt(index + 1);
            if(index + 1 == this.kids.length && sub != null) timer.run(this, 900, 5000);
        }
    });

    $(function fired(src,data){
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
    });

    $(function setMenuBar(mb){
        if(this.mbar != mb){
            this.removeAll();
            if(zebra.instanceOf(this.mbar, pkg.Switchable)) this.mbar.switched(false);
            this.mbar = mb;
            if(this.mbar != null){
                var abs = L.getAbsLocation(0, 0, this.mbar);
                this.mLeft = abs[0];
                this.mRight = this.mLeft + this.mbar.width - 1;
                this.mTop = abs[1];
                this.mBottom = this.mTop + this.mbar.height - 1;
            }
            if(zebra.instanceOf(this.mbar, pkg.Switchable)) this.mbar.switched(true);
        }
    });

    $(function kidAdded(index,id,lw){
        this.$super(this.kidAdded,index, id, lw);
        if(zebra.instanceOf(lw, pkg.Menu)){
            lw.position.clearPos();
            lw.select(-1);
            this.pcMap.splice(index, 0, lw.position);
            lw._.add(this);
            lw.position._.add(this);
            lw.requestFocus();
        }
    });

    $(function kidRemoved(index,lw){
        this.$super(this.kidRemoved, index, lw);
        if(zebra.instanceOf(lw, pkg.Menu)){
            lw._.remove(this);
            lw.position._.remove(this);
            this.pcMap.splice(index, 1);
            if(this.kids.length > 0) {
                this.get(this.kids.length - 1).select(-1);
                this.get(this.kids.length - 1).requestFocus();
            }
        }
    });

    $(function calcPreferredSize(target){ return new Dimension(); });

    $(function doLayout(target){
        var cnt = this.kids.length;
        for(var i = 0; i < cnt; i++){
            var m = this.kids[i];
            if(zebra.instanceOf(m, pkg.Menu)){
                var ps = m.getPreferredSize();
                m.setSize(ps.width, ps.height);
                var xx = (m.x + ps.width > this.width) ? this.width - ps.width : m.x,
                    yy = (m.y + ps.height > this.height) ? this.height - ps.height : m.y;
                if (xx < 0) xx = 0;
                if (yy < 0) yy = 0;
                m.setLocation(xx, yy);
            }
        }
    });
});

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
        if((e.mask & MouseEvent.RIGHT_BUTTON) > 0) this.addPopup(e.source, e.x, e.y);
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

pkg.Line = Class(pkg.Panel, [
    function (b){ this.$this(b, L.HORIZONTAL); },

    function (b, orient){
        this.$super();
        if(orient != L.HORIZONTAL && orient != L.VERTICAL) throw new Error("2001");
        //!!!!
        // b is not used

        this.setBackground(null);
        this.orient = orient;
    },

    function paint(g){
        //!!!
        if (pkg.get("line.col") != null) g.setColor(pkg.get("line.col"));

        if(this.orient == L.HORIZONTAL) {
            var yy = this.top + ~~((this.height - this.top - this.bottom - 1) / 2);
            g.drawLine(this.left, 3, this.width - this.right - this.left, 3);
        }
        else {
            var xx = this.left + ~~((this.width - this.left - this.right - 1) / 2);
            g.drawLine(xx, this.top, xx, this.height - this.top - this.bottom);
        }
    },

    function getPreferredSize() { return new Dimension(5,5); }
]);

})(zebra("ui"), zebra.Class, zebra.Interface);
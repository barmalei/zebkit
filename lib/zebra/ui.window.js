(function(pkg, Class, Interface) {

pkg.TooltipInfo = Interface();
pkg.PopupInfo   = Interface();
pkg.WinListener = Interface();

var KE = pkg.KeyEvent, timer = zebra.util.timer, L = zebra.layout, InputEvent = pkg.InputEvent, MouseEvent = pkg.MouseEvent;

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
            if(this.kids.length > 0 && keyCode == KE.TAB && (mask & KE.M_SHIFT) > 0){
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
        if (this.activeWin == lw){
            this.activeWin = null;
            pkg.focusManager.requestFocus(null);
        }
        var ci = this.winsStack.indexOf(lw), l = this.winsInfo[lw][2];
        delete this.winsInfo[lw];
        this.winsStack.splice(this.winsStack.indexOf(lw), 1);
        if (ci < this.topModalIndex) this.topModalIndex--;
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
        if(c != this.activeWin) {
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
        if (zebra.instanceOf(win, pkg.WinListener)) win[n].apply(win, [this, win, b]);
        if (l != null) l[n].apply(l, [this, win, b]);
    }
]);


// !!!!!
// this code can be generalized to other cases and UI components
// !!!!!
var $StatePan = Class(pkg.Panel, [
    function() {
        this.state = "inactive";
        this.$super();
    },

    function setState(s) {
        if (this.state != s) {
            var old = this.state;
            this.state = s;
            this.updateState(old, s);
        }
    },

    function setBorder(v) {
        this.$super(v);
        this.updateState(this.state, this.state);
    },

    function setBackground(v) {
        this.$super(v);
        this.updateState(this.state, this.state);
    },

    function updateState(olds, news) {
        var b = false;
        if (this.bg && this.bg.activate)  b = this.bg.activate(news); 
        if (this.border && this.border.activate) b = this.border.activate(news) || b;
        if (b) this.repaint(); 
    }
]);

pkg.Window = Class($StatePan, pkg.MouseMotionListener, pkg.WinListener,
                   pkg.MouseListener, pkg.Composite, pkg.Cursorable,
                   pkg.ExternalEditor, [
    
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
            if (this.action > 0){
                if (this.action != MOVE_ACTION){
                    var nw = this.psw + this.dx, nh = this.psh + this.dy;
                    if(nw > this.minSize && nh > this.minSize) this.setSize(nw, nh);
                }
                this.dx = (e.x - this.px);
                this.dy = (e.y - this.py);
                if (this.action == MOVE_ACTION){
                    this.invalidate();
                    this.setLocation(this.x + this.dx, this.y + this.dy);
                }
            }
        };

        this.endDragged = function(e){
            if (this.action > 0){
                if (this.action == MOVE_ACTION){
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
            return c == tp || (L.isAncestorOf(tp, c) && zebra.instanceOf(c, pkg.Button) === false) || 
                   this.sizer== c;
        };

        this.winOpened = function(winLayer,target,b) {
            var state = b?"active":"inactive";
            if (this.caption != null && this.caption.setState) {
                this.caption.setState(state);
            }
            this.setState(state);
        };

        this.winActivated = function(winLayer, target,b){
            this.winOpened(winLayer, target,b);
        };

        this.mouseClicked= function (e){
            var x = e.x, y = e.y, cc = this.caption;
            if (e.clicks == 2 && this.isSizeable && x > cc.x &&
                x < cc.y + cc.width && y > cc.y && y < cc.y + cc.height)
            {
                if(this.prevW < 0) this.maximize();
                else this.restore();
            }
        };
    },

    function $clazz() {
        this.CaptionPan = Class($StatePan, []);
        this.TitleLab   = Class(pkg.Label, []);
        this.StatusPan  = Class(pkg.Panel, []);
        this.ContentPan = Class(pkg.Panel, []);
        this.SizerIcon  = Class(pkg.ImagePan, []);
        this.Icon       = Class(pkg.ImagePan, []);
        this.Button     = Class(pkg.Button, []);
    },

    function () {  this.$this("");  },

    function (s){
        //!!! for some reason state has to be set beforehand
        this.state = "inactive";

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

    function focused(){ 
        this.$super();
        if (this.caption != null) this.caption.repaint();
    },

    function setSizeable(b){
        if (this.isSizeable != b){
            this.isSizeable = b;
            if (this.sizer != null) this.sizer.setVisible(b);
        }
    },

    function maximize(){
        if(this.prevW < 0){
            var d = pkg.findCanvas(this), left = d.getLeft(), top = d.getTop();
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

    function isMaximized() { return this.prevW != -1; }
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
                this.targetLayer = pkg.findCanvas(c).getLayer(pkg.WinLayer.ID);
                this.x = e.x;
                this.y = e.y;
                timer.start(this, this.tick, this.tick);
            }
        };

        this.mouseExited = function(e){
            if(this.target != null){
                timer.stop(this);
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
                timer.stop(this);
                this.target = null;
                this.hideTooltipInfo();
            }
            delete this.tooltips[c];
        }
    },

    function mousePressed(e){
        if(this.target != null){
            timer.stop(this);
            this.target = null;
            this.hideTooltipInfo();
        }
    },

    function mouseReleased(e){
        if(this.target != null){
            this.x = e.x;
            this.y = e.y;
            timer.start(this, this.tick, this.tick);
        }
    }
]);

pkg.Menu = Class(pkg.CompList, pkg.ChildrenListener, [
    function $prototype() {
        this.isDecorative = function(index){
            return zebra.instanceOf(this.kids[index], pkg.Menu.ItemPan) === false;
        };

        this.canHaveFocus = function() { return true; };

        this.childCompEvent = function(id, src){
            if(id == pkg.ComponentListener.COMP_SHOWN ||
               id == pkg.ComponentListener.COMP_ENABLED)
            {
                for(var i = 0;i < this.kids.length; i++){
                    if (this.kids[i].content == src) {
                        var ccc = this.kids[i];
                        ccc.setVisible(src.isVisible);
                        ccc.setEnabled(src.isEnabled);
                        if (i > 0 && this.isDecorative(i - 1)) this.kids[i - 1].setVisible(src.isVisible);
                        break;
                    }
                }
            }
        };

        this.hasVisibleItems = function(){
            for(var i = 0;i < this.kids.length; i++) if (this.kids[i].isVisible) return true;
            return false;
        };

        this.update = function (g){
            if(this.views["marker"] != null && this.hasFocus()){
                var gap = this.getItemGap(), offset = this.position.offset;
                if(offset >= 0 && !this.isDecorative(offset)){
                    var is = this.getItemSize(offset), l = this.getItemLocation(offset);
                    this.views["marker"].paint(g, l.x - gap, l.y - gap, is.width + 2 * gap, is.height + 2 * gap, this);
                }
            }
        };

        this.mouseExited = function(e){
            var offset = this.position.offset;
            if(offset >= 0 && this.getSubmenuAt(offset) == null) {
                this.position.clearPos();
            }
        };

        this.drawPosMarker = function(g,x,y,w,h){};
    },

    function $clazz() {
        this.Label = Class(pkg.Label, []);
        this.CheckStatePan = Class(pkg.ViewPan, []);

        this.ItemPan = Class(pkg.Panel, [
            function $prototype() {
                this.gap = 8;
            },

            function (c) {
                this.$super();
                this.content = c;
                this.add(L.CENTER, c);
                this.setEnabled(c.isEnabled);
                this.setVisible(c.isVisible);
            },

            function selected() {
                if (this.content.setState) {
                    this.content.setState(!this.content.getState());
                }
            },

            function calcPreferredSize(target){
                var cc = 0, pw = 0, ph = 0;

                for(var i=0; i < target.kids.length; i++) {
                    var k = target.kids[i];
                    if (k.isVisible) {
                        var ps = k.getPreferredSize();
                        pw += ps.width + (cc > 0 ? this.gap : 0);
                        if (ps.height > ph) ph = ps.height;
                        cc ++;
                    }
                }

                return { width:pw, height:ph };
            },

            function doLayout(target){
                var mw = -1;

                // calculate icons area maximal width
                for(var i=0; i < target.parent.kids.length; i++) {
                    var k = target.parent.kids[i];
                    if (k.isVisible && zebra.instanceOf(k, pkg.Menu.ItemPan)) {
                        var l = k.getByConstraints(L.LEFT);
                        if (l && l.isVisible) {
                            var ps = l.getPreferredSize();
                            if (ps.width > mw) mw = ps.width;
                        }
                    }
                }

                var left    = target.getByConstraints(L.LEFT),
                    right   = target.getByConstraints(L.RIGHT),
                    content = target.getByConstraints(L.CENTER),
                    t = target.getTop(), eh = target.height - t - target.getBottom();

                if (left && left.isVisible) {
                    left.toPreferredSize();
                    left.setLocation(this.getLeft(), t + (eh - left.height)/2);
                }

                if (content && content.isVisible) {
                    content.toPreferredSize();
                    content.setLocation(target.getLeft() + (mw >= 0 ? mw + this.gap : 0), t + (eh - content.height)/2);
                }

                if (right && right.isVisible) {
                    right.toPreferredSize();
                    right.setLocation(target.width - target.getLeft() - right.width, t + (eh - right.height)/2);
                }
            }
        ]);

        this.ChItemPan = Class(this.ItemPan, [
            function (c, state) {
                this.$super(c);
                this.add(L.LEFT, new pkg.Menu.CheckStatePan());
                this.state = state;
            },

            function selected() {
                this.$super();
                this.state = !this.state;
                this.getByConstraints(L.LEFT).view.activate(this.state ? "on" : "off");
            }
        ]);

        this.Line     = Class(pkg.Line,     []);
        this.SubImage = Class(pkg.ImagePan, []);
    },

    function (){
        this.menus = {};
        this.$super(true);
    },

    function (d){
        this.$this();
        for(var k in d) {
            if (d.hasOwnProperty(k)) {
                this.add(k);
                if (d[k]) {
                    this.setSubmenuAt(this.kids.length-1, new pkg.Menu(d[k]));
                }
            }
        }
    },

    function insert(i, ctr, c) {
        if (zebra.isString(c)) {
            if (c == '-') return this.$super(i, ctr, new pkg.Menu.Line());
            else {
                var m = c.match(/(\[\s*\]|\[x\]|\(x\)|\(\s*\))?\s*(.*)/);
                if (m != null && m[1] != null) {
                    return this.$super(i, ctr, new pkg.Menu.ChItemPan(new pkg.Menu.Label(m[2]), m[1].indexOf('x') > 0));
                }
                c = new pkg.Menu.Label(c);
            }
        }
        return this.$super(i, ctr, new pkg.Menu.ItemPan(c));
    },

    function addDecorative(c) {
        this.$super(this.insert, this.kids.length, null, c);
    },

    function kidRemoved(i,c){
        this.setSubmenuAt(i, null);
        this.$super(i, c);
    },

    function getSubmenuAt(index){
        return this.menus[this.kids[index]];
    },

    function setSubmenuAt(i, m){
        if (m == this || this.isDecorative(i)) throw new Error();
        var p = this.kids[i], sub = this.menus[p];
        this.menus[p] = m;

        if(m != null){
            if (sub == null) {
                p.set(L.RIGHT, new pkg.Menu.SubImage());
            }
        }
        else {
            if (sub != null) p.set(L.RIGHT, null);
        }
    },

    function posChanged(target,prevOffset,prevLine,prevCol){
        var off = this.position.offset;
        if (off < 0 || (this.kids.length > 0 && this.kids[off].isVisible)){
            this.$super(target, prevOffset, prevLine, prevCol);
        }
        else {
            var d = (prevOffset < off) ? 1 : -1, cc = this.kids.length, ccc = cc;
            for(; cc > 0 && (this.kids[off].isVisible === false || this.isDecorative(off)); cc--){
                off += d;
                if (off < 0) off = ccc - 1;
                if (off >= ccc) off = 0;
            }

            if (cc > 0){
                this.position.setOffset(off);
                this.repaint();
            }
        }
    },

    function select(i) {
        if (i < 0 || this.isDecorative(i) === false) {
            if (i >= 0) {
                if (this.kids[i].content.isEnabled === false) return;
                this.kids[i].selected();
            }
            this.$super(i);
        }
    },

    function keyPressed(e){
        var position = this.position;

        if(position.metrics.getMaxOffset() >= 0){
            var code = e.code, offset = position.offset;
            if(code == KE.DOWN){
                var ccc = this.kids.length;
                do { offset = (offset + 1) % ccc; }
                while(this.isDecorative(offset));
                position.setOffset(offset);
            }
            else {
                if(code == KE.UP){
                    var ccc = this.kids.length;
                    do { offset = (ccc + offset - 1) % ccc; }
                    while(this.isDecorative(offset));
                    position.setOffset(offset);
                }
                else {
                    if(e.code == KE.ENTER || e.code == KE.SPACE) this.select(offset);
                }
            }
        }
    }
]);

pkg.Menubar = Class(pkg.Panel, pkg.ChildrenListener, pkg.KeyListener, [
    function $prototype() {
        this.childInputEvent = function(e){
            var target = L.getDirectChild(this, e.source);
            switch(e.ID)
            {
                case MouseEvent.ENTERED:
                    if(this.over != target){
                        var prev = this.over;
                        this.over = target;
                        if(this.selected != null) this.$select(this.over);
                        else this.repaint2(prev, this.over);
                    }
                    break;
                case MouseEvent.EXITED:
                    var p = L.getRelLocation(e.absX, e.absY, pkg.findCanvas(this), this.over);
                    if(p[0] < 0 || p[1] < 0 || p[0] >= this.over.width || p[1] >= this.over.height){
                        var prev = this.over;
                        this.over = null;
                        if (this.selected == null) this.repaint2(prev, this.over);
                    }
                    break;
                case MouseEvent.PRESSED:
                    this.over = target;
                    this.$select(this.selected == target ? null : target);
                    break;
            }
        };

        this.activated = function(b) { if (b === false) this.$select(null); };

        this.$select = function(b){
            if(this.selected != b){
                var prev = this.selected, d = pkg.findCanvas(this);
                this.selected = b;
                if (d != null) {
                    var pop = d.getLayer(pkg.PopupLayer.ID);
                    pop.removeAll();
                    if(this.selected != null) {
                        pop.setMenubar(this);
                        var menu = this.getMenu(this.selected);
                        if (menu != null && menu.hasVisibleItems()) {
                            var abs = L.getAbsLocation(0,0,this.selected);
                            menu.setLocation(abs[0], abs[1] + this.selected.height + 1);
                            pop.add(menu);
                        }
                    }
                    else pop.setMenubar(null);
                }
                this.repaint2(prev, this.selected);
            }
        };

        this.repaint2 = function(i1,i2){
            if (i1 != null) i1.repaint();
            if (i2 != null) i2.repaint();
        };

        this.paint = function(g){
            if (this.views) {
                var target = (this.selected != null) ? this.selected : this.over;
                if (target != null) {
                    var v = (this.selected != null) ? this.views["on"] : this.views["off"];
                    if (v != null) {
                        v.paint(g, target.x, target.y, target.width, target.height, this);
                    }
                }
            }
        };

        this.keyPressed = function(e){
            if (this.selected != null) {
                var idx = this.indexOf(this.selected), pidx = idx, c = null;
                if(e.code == KE.LEFT){
                    var ccc = this.kids.length;
                    do {
                        idx = (ccc + idx - 1) % ccc;
                        c = this.kids[idx];
                    }
                    while (c.isEnabled === false || c.isVisible === false);
                }
                else {
                    if(e.code == KE.RIGHT){
                        var ccc = this.kids.length;
                        do {
                            idx = (idx + 1) % ccc;
                            c = this.kids[idx];
                        }
                        while (c.isEnabled === false || c.isVisible === false);
                    }
                }
                if (idx != pidx) this.$select(this.kids[idx]);
            }
        };
    },

    function $clazz() {
        this.Label = Class(pkg.Label, []);
    },

    function (){
        this.menus = {};
        this.over = this.selected = null;
        this.$super();
    },

    function (d){
        this.$this();
        for(var k in d) {
            if (d.hasOwnProperty(k)) {
                if (d[k]) this.addMenu(k, new pkg.Menu(d[k]));
                else this.add(k);
            }
        }
    },

    function insert(i, constr, c) {
        if (zebra.isString(c)) c = new pkg.Menubar.Label(c);
        this.$super(i, constr, c);
    },

    function addMenu(c,m){
        this.add(c);
        this.setMenuAt(this.kids.length - 1, m);
    },

    function setMenuAt(i, m){
        if (i >= this.kids.length) throw new Error("Invalid kid index:" + i);
        var c = this.kids[i];

        if(m == null) {
            var pm = this.menus.hasOwnProperty(c) ? this.menus[c] : null;
            if (pm != null) delete this.menus[c];
        }
        else {
            this.menus[c] = m;
        }
    },

    function kidRemoved(i, c){
        this.setMenuAt(i, null);
        this.$super(i);
    },

    function removeAll(){
        this.$super();
        this.menus = {};
    },

    function getMenuAt(i) {
        return this.getMenu(this.kids[i]);
    },

    function getMenu(c) {
        return this.menus.hasOwnProperty(c) ? this.menus[c] : null;
    }
]);
pkg.Menubar.prototype.setViews = pkg.$ViewsSetter;

pkg.PopupLayer = Class(pkg.BaseLayer, pkg.ChildrenListener, [
    function $clazz() {
        this.ID = "pop";
    },

    function $prototype() {
        this.mTop = this.mLeft = this.mBottom = this.mRight = 0;

        this.layerMousePressed = function(x,y,mask){
            if(this.isLayerActive(x, y) && this.getComponentAt(x, y) == this){
                this.removeAll();
                this.setMenubar(null);
            }
        };

        this.isLayerActive = function(x,y) {
            return this.kids.length > 0 && 
                   (   arguments.length == 0 || 
                       this.mbar == null     || 
                       y > this.mBottom      || 
                       y < this.mTop         ||
                       x < this.mLeft        || 
                       x > this.mRight       || 
                       this.getComponentAt(x, y) != this );
        };

        this.childInputEvent = function(e){
            if(e.UID == pkg.InputEvent.KEY_UID){
                if (e.ID == KE.PRESSED && e.code == KE.ESCAPE){
                    this.remove(L.getDirectChild(this, e.source));
                    if(this.kids === 0) this.setMenubar(null);
                }

                if (zebra.instanceOf(this.mbar, pkg.KeyListener)) {
                    pkg.events.performInput(new KE(this.mbar, e.ID, e.code, e.ch, e.mask));
                }
            }
        };

        this.calcPreferredSize = function (target){ return { width:0, height:0 }; };

        this.setMenubar = function(mb){
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
        };

        this.posChanged = function (target, prevOffset, prevLine, prevCol){
            if (timer.get(this)) timer.stop(this);

            var selectedIndex = target.offset;
            if(selectedIndex >= 0){
                var index = this.pcMap.indexOf(target), sub = this.kids[index].getSubmenuAt(selectedIndex);

                if (index + 1 < this.kids.length && sub != this.kids[index + 1]) {
                    this.removeAt(index + 1);
                }

                if (index + 1 == this.kids.length && sub != null) {
                    timer.start(this, 900, 5000);
                }
            }
        };

        this.fired  = function(src,data){
            var index = (data != null) ? src.selectedIndex :  -1;
            if(index >= 0){
                var sub = src.getSubmenuAt(index);
                if(sub != null){
                    if(sub.parent == null){
                        sub.setLocation(src.x + src.width - 10, src.y + src.kids[index].y);
                        this.add(sub);
                    }
                    else pkg.focusManager.requestFocus(this.kids[this.kids.length - 1]);
                }
                else{
                    this.removeAll();
                    this.setMenubar(null);
                }
            }
            else {
                if (src.selectedIndex >= 0) {
                    var sub = src.getSubmenuAt(src.selectedIndex);
                    if (sub != null) { this.remove(sub); }
                }
            }
        };

        this.run = function(){
            timer.stop(this);
            if(this.kids.length > 0){
                var menu = this.kids[this.kids.length - 1];
                menu.select(menu.position.offset);
            }
        };
    },

    function (){
        this.mbar  = null;
        this.pcMap = [];
        this.$super(pkg.PopupLayer.ID);
    },

    function removeAt(index){
        for(var i = this.kids.length - 1;i >= index; i--) this.$super(index);
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
                this.kids[this.kids.length - 1].select(-1);
                this.kids[this.kids.length - 1].requestFocus();
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
    function $prototype() {
        this.getPopup = function (c){
            return this.menus.hasOwnProperty(c) ? this.menus[c] : null;
        };

        this.mousePressed = function (e){
            this.time = zebra.util.currentTimeMillis();
            this.initialX = e.absX;
            this.initialY = e.absY;
            if((e.mask & MouseEvent.RIGHT_BUTTON) > 0) {
                this.showPopup(e.source, e.x, e.y);
            }
        };

        this.mouseReleased = function (e){
            if (this.time > 0 && zebra.util.currentTimeMillis() - this.time > 500){
                var nx = e.absX, ny = e.absY;
                if (this.initialX == nx && this.initialY == ny) this.showPopup(e.source, nx, ny);
            }
        };

        this.fetchMenu = function(target,x,y){
            var popup = this.getPopup(target);
            return (popup != null) ? popup.getPopup(target, x, y) : (zebra.instanceOf(target, pkg.PopupInfo)) ? target.getPopup(target, x, y) : null;
        };

        this.showPopup = function(target,x,y){
            var menu = this.fetchMenu(target, x, y);
            if(menu != null){
                menu.setLocation(this.initialX, this.initialY);
                pkg.findCanvas(target).getLayer(pkg.PopupLayer.ID).add(menu);
                menu.requestFocus();
            }
            this.time = -1;
        };
    },

    function () {
        this.$super();
        this.menus = {};
        this.time = this.initialX = this.initialY = 0;
    },

    function setPopup(c,p){
        if(p == null) delete this.menus[c];
        else this.menus[c] = p;
    }
]);

pkg.WindowTitleView = Class(pkg.View, [
    function() {
        this.$this("#66CCFF");
    },

    function(bgcol) {
        this.radius = 6;
        this.gap = this.radius;
        this.bg = bgcol;
    },

    function $prototype() {

        this.paint = function(g,x,y,w,h,d) {
            this.outline(g,x,y,w,h,d);
            g.setColor(this.bg);
            g.fill();
        };

        this.outline = function (g,x,y,w,h,d) {
            g.beginPath();
            g.moveTo(x + this.radius, y);
            g.lineTo(x + w - this.radius*2, y);
            g.quadraticCurveTo(x + w, y, x + w, y + this.radius);
            g.lineTo(x + w, y + h);
            g.lineTo(x, y + h);
            g.lineTo(x, y + this.radius);
            g.quadraticCurveTo(x, y, x + this.radius, y);
            return true;
        };
    }
]);  

})(zebra("ui"), zebra.Class, zebra.Interface);
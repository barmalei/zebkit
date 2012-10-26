(function(pkg, Class, Interface) {

pkg.ScrollListener  = Interface();
pkg.ExternalEditor  = Interface();

var MB = zebra.util,Composite = pkg.Composite, rgb = zebra.util.rgb, ViewSet = pkg.view.ViewSet, ME = pkg.MouseEvent,
    TextRender = pkg.view.TextRender, MouseListener = pkg.MouseListener, Cursor = pkg.Cursor, TextModel = zebra.data.TextModel,
    Actionable = zebra.util.Actionable, KE = pkg.KeyEvent, L = zebra.layout, instanceOf = zebra.instanceOf,
    timer = zebra.util.timer, KeyListener = pkg.KeyListener, Cursorable = pkg.Cursorable, FocusListener = pkg.FocusListener,
    ChildrenListener = pkg.ChildrenListener, MouseMotionListener = pkg.MouseMotionListener, Listeners = zebra.util.Listeners;

pkg.MouseWheelSupport = Class([
    function $prototype() {
        var bars = [2, 1];

        this.mouseWheelMoved = function(e){
            var owner = this.lookup(pkg.$mouseMoveOwner);
            if (owner == null) return;

            var d = [0, 0];
            d[0] = (e.detail? e.detail : e.wheelDelta/120);
            if (e.axis) {
                if (e.axis === e.HORIZONTAL_AXIS) {
                    d[1] = d[0];
                    d[0] = 0;
                }
            }

            if (d[0] > 1) d[0] = ~~(d[0]/3);
            if (zebra.isIE || zebra.isChrome || zebra.isSafari) d[0] = -d[0];

            for(var i=0; i < bars.length; i++) {
                if (d[i] != 0) {
                    var bar = owner.getByConstraints(bars[i]);
                    if (bar != null && bar.isVisible) bar.position.setOffset(bar.position.offset + d[i]*bar.pageIncrement);
                }
            }
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
        };

        this.lookup = function(c) {
            while(c != null && instanceOf(c, pkg.ScrollPan) === false) c = c.parent;
            return c;
        };
    },

    function setup(desktop) {
        if (desktop == null) throw new Error();
        this.desktop = desktop;
        var elem = desktop.canvas, $this = this;
        elem.addEventListener ("mousewheel", function(e) { $this.mouseWheelMoved(e); }, false);
        elem.addEventListener ("DOMMouseScroll", function(e) { $this.mouseWheelMoved(e); }, false);
    }
]);

pkg.CompRender = Class(pkg.view.Render, [
    function $prototype() {
        this.getPreferredSize = function(){
            return this.target == null ? { width:0, height:0 } : this.target.getPreferredSize();
        };

        this.recalc = function() { if (this.target != null) this.target.validate(); };

        this.paint = function(g,x,y,w,h,d){
            var c = this.target;
            if(c != null) {
                c.validate();
                var prevW =  -1, prevH = 0;
                if(zebra.ui.getDesktop(c) == null){
                    prevW = c.width;
                    prevH = c.height;
                    c.setSize(w, h);
                }
                var cx = x - c.x, cy = y - c.y;
                g.translate(cx, cy);
                pkg.paintManager.paint(g, c);
                g.translate(-cx,  -cy);
                if(prevW >= 0){
                    c.setSize(prevW, prevH);
                    c.validate();
                }
            }
        };
    }
]);

pkg.Line = Class(pkg.Panel, [
    function (){
        this.$this(L.VERTICAL);
    },

    function (orient){
        if(orient != L.HORIZONTAL && orient != L.VERTICAL) throw new Error();
        this.orient = orient;
        this.$super();
    },

    function $prototype() {
        this.lineWidth = 1;
        this.lineColor = rgb.black;

        this.paint = function(g) {
            g.setColor(this.lineColor);
            if(this.orient == L.HORIZONTAL) {
                var yy = this.top + ~~((this.height - this.top - this.bottom - 1) / 2);
                g.drawLine(this.left, yy, this.width - this.right - this.left, yy, this.lineWidth);
            }
            else {
                var xx = this.left + ~~((this.width - this.left - this.right - 1) / 2);
                g.drawLine(xx, this.top, xx, this.height - this.top - this.bottom, this.lineWidth);
            }
        };

        this.getPreferredSize = function() { return { width:this.lineWidth, height:this.lineWidth }; };
    }
]);

pkg.Label = Class(pkg.ViewPan, [
    function () { this.$this(""); },

    function (r){
        if (zebra.isString(r)) r = new zebra.data.SingleLineTxt(r);
        this.setView(instanceOf(r, TextModel) ? new TextRender(r) : r);
        this.$super();
    },

    function getText(){ return this.view.getText(); },
    function getModel(){ return this.view.target; },
    function wrapText(){ this.setView(new zebra.view.WrappedText(this.view.target)); },
    function getFont(){ return this.view.font; },
    function getForeground(){ return this.view.foreground; },

    function setText(s){
        this.view.setText(s);
        this.repaint();
    },

    function setForeground(c){
        if (c == null) throw new Error("Null color");
        if (!this.getForeground().equals(c)){
            this.view.setForeground(c);
            this.repaint();
        }
    },

    function setFont(f){
        if (f == null) throw new Error("Null font");
        if (!this.getFont().equals(f)){
            this.view.setFont(f);
            this.repaint();
        }
    }
]);

pkg.ImagePan = Class(pkg.ViewPan, [
    function () { this.$this(null); },

    function (img){
        this.setImage(img);
        this.$super();
    },

    function setImage(img) {
        if (img && zebra.isString(img)) {
            var $this = this;
            img = pkg.loadImage(img, function(b) { if (b) $this.vrp(); });
        }
        this.setView(instanceOf(img, pkg.view.Picture) ? img : new pkg.view.Picture(img));
    }
]);

pkg.ImageLabel = Class(pkg.Panel, [
    function(txt, img) {
        this.$super(new L.FlowLayout(L.LEFT, L.CENTER, L.HORIZONTAL, 6));
        this.add(new pkg.ImagePan(img));
        this.add(new pkg.Label(txt));
    }
]);

var OVER = 0, PRESSED_OVER = 1, OUT = 2, PRESSED_OUT = 3, DISABLED = 4;
pkg.StatePan = Class(pkg.ViewPan, FocusListener, Composite, MouseListener,
                     MouseMotionListener, KeyListener, [
    function $clazz() {
        this.OVER = OVER;
        this.PRESSED_OVER = PRESSED_OVER;
        this.OUT = OUT;
        this.PRESSED_OUT = PRESSED_OUT;
        this.DISABLED = DISABLED;
    },

    function $prototype() {
        var IDS = [ "over", "pressed", "out", "out", "disabled" ];

        this.state = OUT;
        this.isCanHaveFocus = false;
        this.focusComponent = null;
        this.focusMarkerView = null;

        this.idByState = function(s) { return IDS[s]; };

        this.updateState = function(s) {
            if(s != this.state){
                var prev = this.state;
                this.state = s;
                this.stateUpdated(prev, s);
            }
        };

        this.stateUpdated = function(o,n){
            var id = this.idByState(n), b = false;

            for(var i=0; i < this.kids.length; i++) {
                if (this.kids[i].parentStateUpdated) {
                    this.kids[i].parentStateUpdated(o, n, id);
                }
            }

            if (this.border && this.border.activate) b = this.border.activate(id) || b;
            if (this.view   && this.view.activate)  b = this.view.activate(id) || b;
            if (this.bg     && this.bg.activate)   b = this.bg.activate() || b;

            if (b) this.repaint();
        };

        this.keyPressed = function(e){
            if(this.state != PRESSED_OVER && this.state != PRESSED_OUT &&
                (e.code == KE.VK_ENTER || e.code == KE.VK_SPACE))
            {
                this.updateState(PRESSED_OVER);
            }
        };

        this.keyReleased = function(e){
            if(this.state == PRESSED_OVER || this.state == PRESSED_OUT){
                this.updateState(OVER);
                if (pkg.$mouseMoveOwner != this) this.updateState(OUT);
            }
        };

        this.mouseEntered = function (e){
            if (this.isEnabled) this.updateState(this.state == PRESSED_OUT ? PRESSED_OVER : OVER);
        };

        this.mouseExited = function(e){
            if (this.isEnabled) this.updateState(this.state == PRESSED_OVER ? PRESSED_OUT : OUT);
        };

        this.mousePressed = function(e){
            if(this.state != PRESSED_OVER && this.state != PRESSED_OUT && e.isActionMask()){
                this.updateState(pkg.$mouseMoveOwner == this ? PRESSED_OVER : PRESSED_OUT);
            }
        };

        this.mouseReleased = function(e){
            if((this.state == PRESSED_OVER || this.state == PRESSED_OUT) && e.isActionMask()){
                this.updateState(pkg.$mouseMoveOwner == this ? OVER : OUT);
            }
        };

        this.mouseDragged = function(e){
            if(e.isActionMask()){
                var pressed = (this.state == PRESSED_OUT || this.state == PRESSED_OVER);
                if (e.x > 0 && e.y > 0 && e.x < this.width && e.y < this.height) {
                    this.updateState(pressed ? PRESSED_OVER : OVER);
                }
                else this.updateState(pressed ? PRESSED_OUT : OUT);
            }
        };

        this.canHaveFocus = function (){ return this.isCanHaveFocus; };
        this.focusGained = function (e){ this.repaint(); };
        this.focusLost = function (e){ this.repaint(); };

        this.paintOnTop = function(g){
            var fc = this.focusComponent;
            if (this.focusMarkerView != null &&  fc != null && this.hasFocus()) {
                this.focusMarkerView.paint(g, fc.x, fc.y, fc.width, fc.height, this);
            }
        };
    },

    function setCanHaveFocus(b){
        if(this.isCanHaveFocus != b){
            var fm = pkg.focusManager;
            if (!b && fm.focusOwner == this) fm.requestFocus(null);
            this.isCanHaveFocus = b;
        }
    },

    function setView(v){
        if (v != this.view){
            v = this.createViewSet(v);
            this.$super(v);
            this.stateUpdated(this.state, this.state);
        }
    },

    function setBorder(v){
        if(v != this.border){
            v = this.createViewSet(v);
            this.$super(v);
            this.stateUpdated(this.state, this.state);
        }
    },

    function setBackground(v){
        if(v != this.bg){
            v = this.createViewSet(v);
            this.$super(v);
            this.stateUpdated(this.state, this.state);
        }
    },

    function createViewSet(v) {
        if (v && v.paint) return v;
        if (typeof v === "function") return pkg.view.createView(v);
        var s = new ViewSet();
        for (var k in v) if (v.hasOwnProperty(k)) s.put(k, v[k]);
        return s;
    },

    function setEnabled(b){
        this.$super(b);
        this.updateState(b ? OUT : DISABLED);
    },

    function addFocusComponent(c) {
        if (this.focusComponent != c) {
            if (c != null && this.kids.indexOf(c) >= 0) throw Error();
            this.focusComponent = c;
            this.isCanHaveFocus = (c != null);
            if (c != null) this.add(c);
        }
    },

    function setFocusMarkerView(c){
        if(c != this.focusMarkerView){
            this.focusMarkerView = c;
            this.repaint();
        }
    },

    function kidRemoved(i,l){
        if(l == this.focusComponent) this.focusComponent = null;
        this.$super(i, l);
    }
]);

pkg.Button = Class(pkg.StatePan, Actionable, [
    function $clazz() {
        this.Label = Class(pkg.Label, []);

        //!!! should be identified automatically
        this.Label.$name = "Label";
    },

    function $prototype() {
        this.isFireByPress = true;
        this.firePeriod    = 20;
        this.isCanHaveFocus = true;

        this.fire = function() { this._.fire(this); };
        this.run = function(){ if (this.state == PRESSED_OVER) this.fire(); };
    },

    function() { this.$this(null); },

    function (t){
        this._ = new Listeners();
        if (zebra.isString(t)) t = new pkg.Button.Label(t);
        this.$super();
        if (t != null) this.addFocusComponent(t);
    },

    function stateUpdated(o,n){
        this.$super(o, n);
        if(n == PRESSED_OVER){
            if(this.isFireByPress){
                this.fire();
                if (this.firePeriod > 0) timer.run(this, 400, this.firePeriod);
            }
        }
        else {
            if (this.firePeriod > 0 && timer.get(this) != null)  timer.remove(this);
            if(n == OVER && (o == PRESSED_OVER && this.isFireByPress === false)) this.fire();
        }
    },

    function setFireParams(b,time){
        this.isFireByPress = b;
        this.firePeriod = time;
    }
]);

pkg.BorderPan = Class(pkg.Panel, pkg.view.TitleInfo, [
    function $clazz() {
        this.Label = Class(pkg.Label, []);

        //!!! should be identified automatically
        this.Label.$name = "Label";
    },

    function $prototype() {
         this.vGap = this.hGap = 0;
         this.indent = 4;

         this.getTitleInfo = function() {
            return (this.label != null) ? { x:this.label.x, y:this.label.y,
                                            width:this.label.width, height:this.label.height,
                                            orient:this.label.constraints & (L.TOP | L.BOTTOM) }
                                        : null;
        };

        this.calcPreferredSize = function(target){
            var ps = this.center != null && this.center.isVisible ? this.center.getPreferredSize()
                                                                  : { width:0, height:0 };
            if(this.label != null && this.label.isVisible){
                var lps = this.label.getPreferredSize();
                ps.height += lps.height;
                ps.width = Math.max(ps.width, lps.width + this.indent);
            }
            ps.width += (this.hGap * 2);
            ps.height += (this.vGap * 2);
            return ps;
        };

        this.doLayout = function (target){
            var h = 0, right = this.getRight(), top = this.getTop(), bottom = this.getBottom(), left = this.getLeft(),
                xa = this.label ? this.label.constraints & (L.LEFT | L.CENTER | L.RIGHT): 0,
                ya = this.label ? this.label.constraints & (L.BOTTOM | L.TOP) : 0;

            if(this.label != null && this.label.isVisible){
                var ps = this.label.getPreferredSize();
                h = ps.height;
                this.label.setSize(ps.width, h);
                this.label.setLocation((xa == L.LEFT) ? left + this.indent
                                                      : ((xa == L.RIGHT) ? this.width - right - ps.width - this.indent
                                                                                                   : ~~((this.width - ps.width) / 2)),
                                        (ya == L.BOTTOM) ? (this.height - bottom - ps.height) : top);
            }

            if(this.center != null && this.center.isVisible){
                this.center.setLocation(left + this.hGap, (ya == L.BOTTOM ? top : top + h) + this.vGap);
                this.center.setSize(this.width - right - left - 2 * this.hGap,
                                    this.height - top - bottom - h - 2 * this.vGap);
            }
        };
    },

    function(title) { this.$this(title, null); },
    function() { this.$this(null); },
    function(title, center) { this.$this(title, center, L.TOP | L.LEFT); },

    function(title, center, ctr){
        if (zebra.isString(title)) title = new pkg.BorderPan.Label(title);
        this.label = this.center= null;
        this.$super();
        if(title != null) this.add(ctr, title);
        if(center != null) this.add(L.CENTER, center);
    },

    function setGaps(vg,hg){
        if(this.vGap != vg || hg != this.hGap){
            this.vGap = vg;
            this.hGap = hg;
            this.vrp();
        }
    },

    function kidAdded(index,id,lw){
        this.$super(index, id, lw);
        if(L.CENTER == id) this.center = lw;
        else this.label = lw;
    },

    function kidRemoved(index,lw){
        this.$super(index, lw);
        if(lw == this.label) this.label = null;
        else this.center = null;
    },

    function set(ctr,c){
        var rc = (CENTER == ctr) ? this.center : this.label;
        if(rc != null) this.remove(rc);
        this.add(ctr, c);
    }
]);

pkg.SwitchManager = Class([
    function $prototype() {
        this.getState = function(o) { return this.state; };

        this.setState = function(o,b) {
            if(this.getState(o) != b){
                this.state = b;
                this.updated(o, b);
            }
        };

        this.updated = function(o, b){
            if (o != null) o.switched(b);
            this._.fire(this, o);
        };
    },

    function () {
        this.state = false;
        this._ = new Listeners();
    },

    function install(o) { o.switched(this.getState(o)); },
    function uninstall(o){}
]);

pkg.Group = Class(pkg.SwitchManager, [
    function (){
        this.$super();
        this.state = null;
    },

    function getState(o) { return o == this.state; },

    function setState(o,b){
        if(this.getState(o) != b){
            this.clearSelected();
            this.state = o;
            this.updated(o, true);
        }
    },

    function clearSelected(){
        if(this.state != null){
            var old = this.state;
            this.state = null;
            this.updated(old, false);
        }
    }
]);

pkg.Checkbox = Class(pkg.StatePan, Actionable, [
    function $clazz() {
        var IDS = ["on", "off", "don", "doff", "onover", "offover"];

        this.Box = Class(pkg.ViewPan, [
            function parentStateUpdated(o, n, id) {
                this.view.activate(id);
                this.repaint();
            }
        ]);

        this.Label = Class(pkg.Label, []);
    },

    function $prototype() {
       this.setState = function(b){ this.manager.setState(this, b); };
       this.getState = function() { return this.manager.getState(this); };
       this.switched = function(b){ this.stateUpdated(this.state, this.state); };

       this.idByState = function(state){
           if(this.isEnabled) {
               var id = this.getState() ? "on" : "off";
               return (this.state == OVER) ? id.concat("over") : id;
           }
           return this.getState() ? "don" : "doff";
       };
    },

    function () { this.$this(null); },

    function (c){
        this.$this(c, new pkg.SwitchManager());
    },

    function (c, m){
        var clazz = this.getClazz();
        if (zebra.isString(c)) c = new clazz.Label(c);
        this.$super();
        this.add(new clazz.Box());
        if (c != null) this.addFocusComponent(c);
        this.setSwitchManager(m);
    },

    function keyPressed(e){
        if(instanceOf(this.manager, pkg.Group) && this.getState()){
            var code = e.code, d = 0;
            if(code == KE.VK_LEFT || code == KE.VK_UP) d = -1;
            else if (code == KE.VK_RIGHT || code == KE.VK_DOWN) d = 1;

            if(d !== 0) {
                var p = this.parent, idx = p.indexOf(this);
                for(var i = idx + d;i < p.kids.length && i >= 0; i += d){
                    var l = p.kids[i];
                    if(l.isVisible && l.isEnabled && instanceOf(l, pkg.Checkbox) && l.manager == this.manager){
                        l.requestFocus();
                        l.setState(true);
                        break;
                    }
                }
                return ;
            }
        }
        this.$super(e);
    },

    function setSwitchManager(m){
        if(m == null) throw new Error();
        if(this.manager != m){
            if(this.manager != null) this.manager.uninstall(this);
            this.manager = m;
            this.manager.install(this);
        }
    },

    function stateUpdated(o, n) {
        if (o == PRESSED_OVER && n == OVER) this.setState(!this.getState());
        this.$super(o, n);
    }
]);

pkg.Radiobox = Class(pkg.Checkbox, [
    function $clazz() {
        this.Box   = Class(pkg.Checkbox.Box, []);
        this.Label = Class(pkg.Checkbox.Label, []);
    },

    function(c) {
        this.$this(c, new pkg.Group());
    },

    function(c, group) {
        this.$super(c, group);
    }
]);

pkg.SplitPan = Class(pkg.Panel, MouseMotionListener, Composite, Cursorable, [
    function $clazz() {
        this.Bar = Class(pkg.Panel, []);
    },

    function $prototype() {
        this.leftMinSize = this.rightMaxSize = 50;
        this.isMoveable = true;
        this.gap = 1;

        this.getCursorType = function(t,x,y){
            return this.isInGripper(this.gripper, x, y) ? this.orientation == L.VERTICAL ? Cursor.W_RESIZE
                                                                                         : Cursor.N_RESIZE : -1;
        };

        this.catchInput = function(c) { return c == this.gripper; };

        this.mouseDragged = function(e){
            if(this.isDragged === true){
                var x = e.x, y = e.y;
                if(this.orientation == L.VERTICAL){
                    if(this.prevLoc != x){
                        x = this.normalizeBarLoc(x);
                        if(x > 0){
                            this.prevLoc = x;
                            this.setGripperLoc(x);
                        }
                    }
                }
                else{
                    if(this.prevLoc != y){
                        y = this.normalizeBarLoc(y);
                        if(y > 0){
                            this.prevLoc = y;
                            this.setGripperLoc(y);
                        }
                    }
                }
            }
        };

        this.normalizeBarLoc = function(xy){
            if(xy < this.minXY) xy = this.minXY;
            else if(xy > this.maxXY) xy = this.maxXY;
            return (xy > this.maxXY || xy < this.minXY) ?  -1 : xy;
        };

        this.isInGripper = function(g, x, y){
            return g != null && x >= g.x && y >= g.y && x < g.x + g.width && y < g.y + g.height;
        };

        this.setGripperLoc = function(l){
            if(l != this.barLocation){
                this.barLocation = l;
                this.vrp();
            }
        };

        this.calcPreferredSize = function(c){
            var fSize = pkg.getPreferredSize(this.leftComp),
                sSize = pkg.getPreferredSize(this.rightComp),
                bSize = pkg.getPreferredSize(this.gripper);

            if(this.orientation == L.HORIZONTAL){
                bSize.width = Math.max(Math.max(fSize.width, sSize.width), bSize.width);
                bSize.height = fSize.height + sSize.height + bSize.height + 2 * this.gap;
            }
            else{
                bSize.width = fSize.width + sSize.width + bSize.width + 2 * this.gap;
                bSize.height = Math.max(Math.max(fSize.height, sSize.height), bSize.height);
            }
            return bSize;
        };

        this.doLayout = function(target){
            var right = this.getRight(), top = this.getTop(), bottom = this.getBottom(),
                left = this.getLeft(), gap = this.gap, bSize = pkg.getPreferredSize(this.gripper);

            if (this.orientation == L.HORIZONTAL){
                var w = this.width - left - right;
                if(this.barLocation < top) this.barLocation = top;
                else {
                    if(this.barLocation > this.height - bottom - bSize.height) {
                        this.barLocation = this.height - bottom - bSize.height;
                    }
                }

                if(this.gripper != null){
                    if(this.isMoveable){
                        this.gripper.setLocation(left, this.barLocation);
                        this.gripper.setSize(w, bSize.height);
                    }
                    else{
                        this.gripper.setSize(bSize.width, bSize.height);
                        this.gripper.toPreferredSize();
                        this.gripper.setLocation(~~((w - bSize.width) / 2), this.barLocation);
                    }
                }
                if(this.leftComp != null){
                    this.leftComp.setLocation(left, top);
                    this.leftComp.setSize(w, this.barLocation - gap - top);
                }
                if(this.rightComp != null){
                    this.rightComp.setLocation(left, this.barLocation + bSize.height + gap);
                    this.rightComp.setSize(w, this.height - this.rightComp.y - bottom);
                }
            }
            else{
                var h = this.height - top - bottom;
                if(this.barLocation < left) this.barLocation = left;
                else {
                    if (this.barLocation > this.width - right - bSize.width) {
                        this.barLocation = this.width - right - bSize.width;
                    }
                }

                if (this.gripper != null){
                    if(this.isMoveable){
                        this.gripper.setLocation(this.barLocation, top);
                        this.gripper.setSize(bSize.width, h);
                    }
                    else{
                        this.gripper.setSize(bSize.width, bSize.height);
                        this.gripper.setLocation(this.barLocation, ~~((h - bSize.height) / 2));
                    }
                }

                if (this.leftComp != null){
                    this.leftComp.setLocation(left, top);
                    this.leftComp.setSize(this.barLocation - left - gap, h);
                }

                if(this.rightComp != null){
                    this.rightComp.setLocation(this.barLocation + bSize.width + gap, top);
                    this.rightComp.setSize(this.width - this.rightComp.x - right, h);
                }
            }
        };
    },

    function (){ this.$this(null, null, L.VERTICAL); },
    function (f,s){ this.$this(f, s, L.VERTICAL); },

    function (f,s,o){
        this.isDragged = false;
        this.prevLoc = this.orientation = this.minXY = this.maxXY = 0;
        this.barLocation = 70;
        this.leftComp = this.rightComp = this.gripper = null;
        this.setOrientation(o);
        this.$super();

        if(f != null) this.add(L.LEFT, f);
        if(s != null) this.add(L.RIGHT, s);
        this.add(L.CENTER, new pkg.SplitPan.Bar());
    },

    function setGap(g){
        if(this.gap != g){
            this.gap = g;
            this.vrp();
        }
    },

    function setLeftMinSize(m){
        if(this.leftMinSize != m){
            this.leftMinSize = m;
            this.vrp();
        }
    },

    function setRightMaxSize(m){
        if(this.rightMaxSize != m){
            this.rightMaxSize = m;
            this.vrp();
        }
    },

    function setOrientation(o){
        if(o != L.VERTICAL && o != L.HORIZONTAL) throw new Error();
        if(this.orientation != o){
            this.orientation = o;
            this.vrp();
        }
    },

    function startDragged(e){
        var x = e.x, y = e.y;
        if(e.isActionMask() && this.isInGripper(this.gripper, x, y)){
            this.isDragged = true;
            if(this.orientation == L.VERTICAL){
                x = this.normalizeBarLoc(x);
                if(x > 0) this.prevLoc = x;
            }
            else{
                y = this.normalizeBarLoc(y);
                if(y > 0) this.prevLoc = y;
            }
        }
    },

    function endDragged(e){
        if(this.isDragged === true){
            this.isDragged = false;
            var xy = this.normalizeBarLoc(this.orientation == L.VERTICAL ? e.x : e.y);
            if(xy > 0) this.setGripperLoc(xy);
        }
    },

    function setGripperMovable(b){
        if(b != this.isMoveable){
            this.isMoveable = b;
            this.vrp();
        }
    },

    function kidAdded(index,id,c){
        this.$super(index, id, c);
        if(L.LEFT == id) this.leftComp = c;
        else
            if(L.RIGHT == id) this.rightComp = c;
            else
                if(L.CENTER == id) this.gripper = c;
                else throw new Error();
    },

    function kidRemoved(index,c){
        this.$super(index, c);
        if(c == this.leftComp) this.leftComp = null;
        else
            if(c == this.rightComp) this.rightComp = null;
            else
                if(c == this.gripper) this.gripper = null;
    },

    function resized(pw,ph) {
        var ps = this.gripper.getPreferredSize();
        if(this.orientation == L.VERTICAL){
            this.minXY = this.getLeft() + this.gap + this.leftMinSize;
            this.maxXY = this.width - this.gap - this.rightMaxSize - ps.width - this.getRight();
        }
        else{
            this.minXY = this.getTop() + this.gap + this.leftMinSize;
            this.maxXY = this.height - this.gap - this.rightMaxSize - ps.height - this.getBottom();
        }
        this.$super(pw, ph);
    }
]);

pkg.Progress = Class(pkg.Panel, Actionable, [
    function (){
        this.value = 0;
        this.gap = 2;
        this.bundleView = rgb.darkBlue;
        this.bundleWidth = this.bundleHeight = 6;
        this.orientation = L.HORIZONTAL;
        this.maxValue = 20;
        this._ = new Listeners();
        this.$super();
    },

    function setOrientation(o){
        if(o != L.HORIZONTAL && o != L.VERTICAL) throw new Error();
        if(o != this.orientation){
            this.orientation = o;
            this.vrp();
        }
    },

    function setMaxValue(m){
        if(m != this.maxValue){
            this.maxValue = m;
            this.setValue(this.value);
            this.vrp();
        }
    },

    function setValue(p){
        p = p % (this.maxValue + 1);
        if(this.value != p){
            var old = this.value;
            this.value = p;
            this._.fire(this, old);
            this.repaint();
        }
    },

    function setGap(g){
        if(this.gap != g){
            this.gap = g;
            this.vrp();
        }
    },

    function setBundleView(v){
        if(this.bundleView != v){
            this.bundleView = v;
            this.vrp();
        }
    },

    function setBundleSize(w, h){
        if(w != this.bundleWidth && h != this.bundleHeight){
            this.bundleWidth  = w;
            this.bundleHeight = h;
            this.vrp();
        }
    },

    function paint(g){
        var left = this.getLeft(), right = this.getRight(), top = this.getTop(), bottom = this.getBottom(),
            rs = (this.orientation == L.HORIZONTAL) ? this.width - left - right : this.height - top - bottom,
            bundleSize = (this.orientation == L.HORIZONTAL) ? this.bundleWidth : this.bundleHeight;

        if(rs >= bundleSize){
            var vLoc = ~~((rs * this.value) / this.maxValue),
                x = left, y = this.height - bottom, bundle = this.bundleView,
                wh = this.orientation == L.HORIZONTAL ? this.height - top - bottom
                                                      : this.width - left - right;

            while(x < (vLoc + left) && this.height - vLoc - bottom < y){
                if(this.orientation == L.HORIZONTAL){
                    bundle.paint(g, x, top, bundleSize, wh, this);
                    x += (bundleSize + this.gap);
                }
                else{
                    bundle.paint(g, left, y - bundleSize, wh, bundleSize, this);
                    y -= (bundleSize + this.gap);
                }
            }

            if (this.titleView != null){
                var ps = this.bundleView.getPreferredSize();
                this.titleView.paint(g, L.getXLoc(ps.width, L.CENTER, this.width),
                                           L.getYLoc(ps.height, L.CENTER, this.height),
                                           ps.width, ps.height, this);
            }
        }
    },

    function calcPreferredSize(l){
        var bundleSize = (this.orientation == L.HORIZONTAL) ? this.bundleWidth : this.bundleHeight,
            v1 = (this.maxValue * bundleSize) + (this.maxValue - 1) * this.gap,
            ps = this.bundleView.getPreferredSize();

        ps = (this.orientation == L.HORIZONTAL) ? { width:v1,
                                                    height:(this.bundleHeight >= 0 ? this.bundleHeight
                                                                                   : ps.height) }
                                                : { width:(this.bundleWidth >= 0 ? this.bundleWidth
                                                                                 : ps.width),
                                                    height: v1 };
        if (this.titleView != null) {
            var tp = this.titleView.getPreferredSize();
            ps.width  = Math.max(ps.width, tp.width);
            ps.height = Math.max(ps.height, tp.height);
        }
        return ps;
    }
]);

pkg.Link = Class(pkg.Button, Cursorable, [
    function $prototype() {
        this.getCursorType = function(target,x,y){ return Cursor.HAND; };
    },

    function(s){
        this.colors = [ rgb.blue, rgb.darkBlue, rgb.black, rgb.blue, rgb.gray]
        this.$super(null);
        var tr = new TextRender(s);
        tr.setFont(pkg.Link.font);
        this.setView(tr);
        this.stateUpdated(this.state, this.state);
    },

    function setColor(state,c){
        if (this.colors[state].equals(c) === false){
            this.colors[state] = c;
            this.stateUpdated(state, state);
        }
    },

    function stateUpdated(o,n){
        this.$super(o, n);
        var r = this.view;
        if (r && !r.foreground.equals(this.colors[n])){
            r.setForeground(this.colors[n]);
            this.repaint();
        }
    }
]);

pkg.Extender = Class(pkg.Panel, MouseListener, Composite, [
    function $prototype() {
        this.catchInput = function(child){ return child != this.contentPan && !L.isAncestorOf(this.contentPan, child); };
    },

    function $clazz() {
        this.Label = Class(pkg.Label,[]);
        this.TitlePan = Class(pkg.Panel, []);
        this.TogglePan = Class(pkg.ViewPan, []);
    },

    function (content, lab){
        this.isCollapsed = false;
        this.$super(new L.BorderLayout(8,8));
        if (zebra.isString(lab)) lab = new pkg.Extender.Label(lab);

        this.labelPan = lab;
        this.titlePan = new pkg.Extender.TitlePan();
        this.add(L.TOP, this.titlePan);

        this.togglePan = new pkg.Extender.TogglePan();
        this.titlePan.add(this.togglePan);
        this.titlePan.add(this.labelPan);

        this.contentPan = content;
        this.contentPan.setVisible( !this.isCollapsed);
        this.add(L.CENTER, this.contentPan);
    },

    function toggle(){
        this.isCollapsed = this.isCollapsed ? false : true;
        this.contentPan.setVisible(!this.isCollapsed);
        this.togglePan.view.activate(this.isCollapsed ? "off" : "on");
        this.repaint();
    },

    function mousePressed(e){
        if (e.isActionMask() && this.getComponentAt(e.x, e.y) == this.togglePan) this.toggle();
    }
]);

pkg.ScrollManager = Class([
    function (c){
        this.sx = this.sy = 0;
        this._ = new Listeners('scrolled');
        this.target = c;
        this.targetIsListener = instanceOf(c, pkg.ScrollListener);
    },

    function getSX(){ return this.sx; },
    function getSY(){ return this.sy; },

    function scrolled(sx,sy,psx,psy){
        this.sx = sx;
        this.sy = sy;
    },

    function scrollXTo(v){ this.scrollTo(v, this.getSY());},
    function scrollYTo(v){ this.scrollTo(this.getSX(), v); },

    function scrollTo(x, y){
        var psx = this.getSX(), psy = this.getSY();
        if(psx != x || psy != y){
            this.scrolled(x, y, psx, psy);
            if (this.targetIsListener === true) this.target.scrolled(psx, psy);
            this._.fire(psx, psy);
        }
    },

    function makeVisible(x,y,w,h){
        var p = pkg.calcOrigin(x, y, w, h, this.getSX(), this.getSY(), this.target);
        this.scrollTo(p[0], p[1]);
    }
]);

//!!! not sure the class is useful
pkg.CompScrollManager = Class(pkg.ScrollManager, L.Layout, [
    function (c){
        this.$super(c);
        this.tl = c.layout;
        c.setLayout(this);
    },

    function $prototype() {
        this.calcPreferredSize = function(l) { return this.tl.calcPreferredSize(l); };

        this.doLayout = function(t){
            this.tl.doLayout(t);
            for(var i = 0;i < t.kids.length; i ++ ){
                var l = t.kids[i];
                l.setLocation(l.x + this.getSX(), l.y + this.getSY());
            }
        };

        this.scrolled = function(sx,sy,px,py){
            this.$super(sx, sy, px, py);
            this.target.invalidate();
        };
    }
]);

pkg.Scroll = Class(pkg.Panel, MouseListener, MouseMotionListener,
                   zebra.util.Position.PositionMetric, Composite, [

    function $clazz() {
        var SB = Class(pkg.Button, [
            function $prototype() {
                this.isFireByPress = true;
                this.firePeriod = 20;
                this.isCanHaveFocus = false;
            }
        ]);

        this.VIncButton = Class(SB, []);
        this.VDecButton = Class(SB, []);
        this.HIncButton = Class(SB, []);
        this.HDecButton = Class(SB, []);

        this.VBundle = Class(pkg.Panel, []);
        this.HBundle = Class(pkg.Panel, []);

        this.MIN_BUNDLE_SIZE = 16;
    },

    function $prototype() {
        this.extra = this.max  = 100;
        this.pageIncrement = 20;
        this.unitIncrement = 5;

        this.isInBundle = function(x,y){
            var bn = this.bundle;
            return (bn != null && bn.isVisible && bn.x <= x && bn.y <= y && bn.x + bn.width > x && bn.y + bn.height > y);
        };

        this.amount = function(){
            var db = this.decBt, ib = this.incBt;
            return (this.type == L.VERTICAL) ? ib.y - db.y - db.height : ib.x - db.x - db.width;
        };

        this.pixel2value = function(p) {
            var db = this.decBt, bn = this.bundle;
            return (this.type == L.VERTICAL) ? ~~((this.max * (p - db.y - db.height)) / (this.amount() - bn.height))
                                             : ~~((this.max * (p - db.x - db.width )) / (this.amount() - bn.width));
        };

        this.value2pixel = function(){
            var db = this.decBt, bn = this.bundle, off = this.position.offset;
            return (this.type == L.VERTICAL) ? db.y + db.height +  ~~(((this.amount() - bn.height) * off) / this.max)
                                             : db.x + db.width  +  ~~(((this.amount() - bn.width) * off) / this.max);
        };


        this.catchInput = function (child){
            return child == this.bundle || (this.bundle.kids.length > 0 &&
                                            L.isAncestorOf(this.bundle, child));
        };

        this.posChanged = function(target,po,pl,pc){
            if(this.bundle != null){
                if(this.type == L.HORIZONTAL) this.bundle.setLocation(this.value2pixel(), this.getTop());
                else this.bundle.setLocation(this.getLeft(), this.value2pixel());
            }
        };

        this.getLines     = function (){ return this.max; };
        this.getLineSize  = function (line){ return 1; };
        this.getMaxOffset = function (){ return this.max; };

        this.fired = function(src){
            this.position.setOffset(this.position.offset + ((src == this.incBt) ? this.unitIncrement
                                                                                : -this.unitIncrement));
        };

        this.mouseDragged = function(e){
            if(Number.MAX_VALUE != this.startDragLoc) {
                this.position.setOffset(this.pixel2value(this.bundleLoc -
                                                         this.startDragLoc +
                                                         ((this.type == L.HORIZONTAL) ? e.x : e.y)));
            }
        };

        this.calcPreferredSize = function (target){
            var ps1 = pkg.getPreferredSize(this.incBt), ps2 = pkg.getPreferredSize(this.decBt),
                ps3 = pkg.getPreferredSize(this.bundle);

            if(this.type == L.HORIZONTAL){
                ps1.width += (ps2.width + ps3.width);
                ps1.height = Math.max(Math.max(ps1.height, ps2.height), ps3.height);
            }
            else{
                ps1.height += (ps2.height + ps3.height);
                ps1.width = Math.max(Math.max(ps1.width, ps2.width), ps3.width);
            }
            return ps1;
        };

        this.doLayout = function(target){
            var right = this.getRight(), top = this.getTop(), bottom = this.getBottom(),
                left = this.getLeft(), ew = this.width - left - right, eh = this.height - top - bottom,
                b = (this.type == L.HORIZONTAL), ps1 = pkg.getPreferredSize(this.decBt),
                ps2 = pkg.getPreferredSize(this.incBt),
                minbs = pkg.Scroll.MIN_BUNDLE_SIZE;

            if(ps1.width > 0){
                this.decBt.setSize(b ? ps1.width : ew, b ? eh : ps1.height);
                this.decBt.setLocation(left, top);
            }

            if(ps2.width > 0){
                this.incBt.setSize(b ? ps2.width : ew, b ? eh : ps2.height);
                this.incBt.setLocation(b ? this.width - right - ps2.width : left, b ? top : this.height - bottom - ps2.height);
            }

            if(this.bundle != null && this.bundle.isVisible){
                var am = this.amount();
                if(am > minbs){
                    var bsize = Math.max(Math.min(~~((this.extra * am) / this.max), am - minbs), minbs);
                    this.bundle.setSize(b ? bsize : ew, b ? eh : bsize);
                    this.bundle.setLocation(b ? this.value2pixel() : left, b ? top : this.value2pixel());
                }
                else this.bundle.setSize(0, 0);
            }
        };
    },

    function (t) {
        if (t != L.VERTICAL && t != L.HORIZONTAL) throw new Error();
        this.incBt = this.decBt = this.bundle = this.position = null;
        this.bundleLoc = this.type = 0;
        this.startDragLoc = Number.MAX_VALUE;
        this.$super(this);

        this.add(L.CENTER, t == L.VERTICAL ? new pkg.Scroll.VBundle()    : new pkg.Scroll.HBundle());
        this.add(L.TOP   , t == L.VERTICAL ? new pkg.Scroll.VDecButton() : new pkg.Scroll.HDecButton());
        this.add(L.BOTTOM, t == L.VERTICAL ? new pkg.Scroll.VIncButton() : new pkg.Scroll.HIncButton());

        this.type = t;
        this.setPosition(new zebra.util.Position(this));
    },

    function setMaximum(m){
        if(m != this.max){
            this.max = m;
            if(this.position.offset > this.max) this.position.setOffset(this.max);
            this.vrp();
        }
    },

    function setPosition(p){
        if(p != this.position){
            if(this.position != null) this.position._.remove(this);
            this.position = p;
            if(this.position != null){
                this.position._.add(this);
                this.position.setPositionMetric(this);
                this.position.setOffset(0);
            }
        }
    },

    function startDragged(e){
        if (this.isInBundle(e.x, e.y)){
            this.startDragLoc = this.type == L.HORIZONTAL ? e.x : e.y;
            this.bundleLoc = this.type == L.HORIZONTAL ? this.bundle.x : this.bundle.y;
        }
    },

    function endDragged(e){ this.startDragLoc = Number.MAX_VALUE; },

    function mousePressed(e){
        if( !this.isInBundle(e.x, e.y) && e.isActionMask()){
            var d = this.pageIncrement;
            if(this.type == L.VERTICAL){
                if(e.y < (this.bundle != null ? this.bundle.y : ~~(this.height / 2))) d =  -d;
            }
            else {
                if(e.x < (this.bundle != null ? this.bundle.x : ~~(this.width / 2))) d =  -d;
            }
            this.position.setOffset(this.position.offset + d);
        }
    },

    function setExtraSize(e){
        if(e != this.extra){
            this.extra = e;
            this.vrp();
        }
    },

    function kidAdded(index,id,lw){
        this.$super(index, id, lw);
        if(L.CENTER == id) this.bundle = lw;
        else
            if(L.BOTTOM == id){
                this.incBt = lw;
                this.incBt._.add(this);
            }
            else
                if(L.TOP == id){
                    this.decBt = lw;
                    this.decBt._.add(this);
                }
                else throw new Error();
    },

    function kidRemoved(index,lw){
        this.$super(index, lw);
        if(lw == this.bundle) this.bundle = null;
        else {
            if(lw == this.incBt){
                this.incBt._.remove(this);
                this.incBt = null;
            }
            else {
                if(lw == this.decBt){
                    this.decBt._.remove(this);
                    this.decBt = null;
                }
            }
        }
    }
]);

pkg.ScrollPan = Class(pkg.Panel, pkg.ScrollListener, [
    function $clazz() {
        this.ContentPan = Class(pkg.Panel, [
            function (c){
                this.$super(new L.RasterLayout(L.USE_PS_SIZE));
                this.sman = new pkg.ScrollManager(c, [
                    function getSX() {  return this.target.x; },
                    function getSY() { return this.target.y;  },
                    function scrolled(sx,sy,psx,psy){ this.target.setLocation(sx, sy); }
                ]);
                this.addScrolledComponent(c);
            },

            function getScrollManager(){ return this.sman; },
            function addScrolledComponent(c){ this.add(c);}
        ]);
    },

    function $prototype() {
        this.scrolled = function (psx,psy){
            try{
                this.validate();
                this.isPosChangedLocked = true;
                if(this.hBar != null) this.hBar.position.setOffset( -this.scrollObj.getScrollManager().getSX());
                if(this.vBar != null) this.vBar.position.setOffset( -this.scrollObj.getScrollManager().getSY());
                if(this.scrollObj.getScrollManager() == null) this.invalidate();
            }
            finally { this.isPosChangedLocked = false; }
        };

        this.calcPreferredSize = function (target){ return pkg.getPreferredSize(this.scrollObj); };

        this.doLayout = function (target){
            var sman = (this.scrollObj == null) ? null : this.scrollObj.getScrollManager(),
                right = this.getRight(), top = this.getTop(), bottom = this.getBottom(), left = this.getLeft(),
                ww = this.width - left - right, maxH = ww, hh = this.height - top - bottom, maxV = hh,
                so = this.scrollObj.getPreferredSize();

            if(this.hBar != null &&
                (so.width > ww ||
                  (so.height > hh && so.width > (ww - (this.vBar == null ? 0
                                                                         : this.vBar.getPreferredSize().width)))))
            {
                maxV -= this.hBar.getPreferredSize().height;
            }

            maxV = so.height > maxV ? (so.height - maxV) :  -1;
            if(this.vBar != null &&
                (so.height > hh ||
                  (so.width > ww && so.height > (hh - (this.hBar == null ? 0
                                                                         : this.hBar.getPreferredSize().height)))))
            {
                maxH -= this.vBar.getPreferredSize().width;
            }

            maxH = so.width > maxH ? (so.width - maxH) :  -1;
            var sy = sman.getSY(), sx = sman.getSX();
            if(this.vBar != null){
                if(maxV < 0){
                    if(this.vBar.isVisible){
                        this.vBar.setVisible(false);
                        sman.scrollTo(sx, 0);
                        this.vBar.position.setOffset(0);
                    }
                    sy = 0;
                }
                else{
                    this.vBar.setVisible(true);
                    sy = sman.getSY();
                }
            }
            if(this.hBar != null){
                if(maxH < 0){
                    if(this.hBar.isVisible){
                        this.hBar.setVisible(false);
                        sman.scrollTo(0, sy);
                        this.hBar.position.setOffset(0);
                    }
                }
                else this.hBar.setVisible(true);
            }
            var vs = pkg.getPreferredSize(this.vBar), hs = pkg.getPreferredSize(this.hBar);
            if(this.scrollObj.isVisible){
                this.scrollObj.setLocation(left, top);
                this.scrollObj.setSize(ww - vs.width, hh - hs.height);
            }

            if(this.hBar != null && hs.height > 0){
                this.hBar.setLocation(left, this.height - bottom - hs.height);
                this.hBar.setSize(ww - vs.width, hs.height);
                this.hBar.setMaximum(maxH);
            }

            if(this.vBar != null && vs.width > 0){
                this.vBar.setLocation(this.width - right - vs.width, top);
                this.vBar.setSize(vs.width, hh - hs.height);
                this.vBar.setMaximum(maxV);
            }
        };
    },

    function (){ this.$this(null, L.HORIZONTAL | L.VERTICAL); },
    function (c){ this.$this(c, L.HORIZONTAL | L.VERTICAL); },

    function (c, barMask){
        this.hBar = this.vBar = this.scrollObj = null;
        this.isPosChangedLocked = false;
        this.$super();
        if ((L.HORIZONTAL & barMask) > 0) this.add(L.BOTTOM, new pkg.Scroll(L.HORIZONTAL));
        if ((L.VERTICAL & barMask) > 0) this.add(L.RIGHT, new pkg.Scroll(L.VERTICAL));
        if (c != null) this.add(L.CENTER, c);
    },

    function setIncrements(hUnit,hPage,vUnit,vPage){
        if(this.hBar != null){
            if(hUnit !=  -1) this.hBar.unitIncrement = hUnit;
            if(hPage !=  -1) this.hBar.pageIncrement = hPage;
        }

        if(this.vBar != null){
            if(vUnit !=  -1) this.vBar.unitIncrement = vUnit;
            if(vPage !=  -1) this.vBar.pageIncrement = vPage;
        }
    },

    function posChanged(target,prevOffset,prevLine,prevCol){
        if (this.isPosChangedLocked === false){
            if(this.hBar != null && this.hBar.position == target) {
                this.scrollObj.getScrollManager().scrollXTo(-this.hBar.position.offset);
            }
            else {
                if(this.vBar != null) this.scrollObj.getScrollManager().scrollYTo(-this.vBar.position.offset);
            }
        }
    },

    function insert(i,ctr,c){
        if (L.CENTER == ctr && c.getScrollManager() == null) c = new pkg.ScrollPan.ContentPan(c);
        return this.$super(i, ctr, c);
    },

    function kidAdded(index,id,comp){
        this.$super(index, id, comp);
        if(L.CENTER == id){
            this.scrollObj = comp;
            this.scrollObj.getScrollManager()._.add(this);
        }
        if(L.BOTTOM  == id || L.TOP == id){
            this.hBar = comp;
            this.hBar.position._.add(this);
        }
        else
            if(L.LEFT == id || L.RIGHT == id){
                this.vBar = comp;
                this.vBar.position._.add(this);
            }
    },

    function kidRemoved(index,comp){
        this.$super(index, comp);
        if(comp == this.scrollObj){
            this.scrollObj.getScrollManager()._.remove(this);
            this.scrollObj = null;
        }
        else {
            if(comp == this.hBar){
                this.hBar.position._.remove(this);
                this.hBar = null;
            }
            else {
                if(comp == this.vBar){
                    this.vBar.position._.remove(this);
                    this.vBar = null;
                }
            }
        }
    }
]);

pkg.Tabs = Class(pkg.Panel, MouseListener, KeyListener, pkg.view.TitleInfo, FocusListener,
                 MouseMotionListener, [
    function $prototype() {
        this.brSpace = this.upperSpace = this.vgap = this.hgap = this.tabAreaX = 0;
        this.tabAreaY = this.tabAreaWidth = this.tabAreaHeight = 0;
        this.overTab = this.selectedIndex = -1;
        this.hTabGap = this.vTabGap = this.sideSpace = 1;
        this.orient = L.TOP;

        this.mouseMoved = function(e) {
            var i = this.getTabAt(e.x, e.y);
            if (this.overTab != i) {
                //!!! var tr1 = (this.overTab >= 0) ? this.getTabBounds(this.overTab) : null;
                //!!!var tr2 = (i >= 0) ? this.getTabBounds(i) : null;
                //!!!if (tr1 && tr2) zebra.util.unite();
                this.overTab = i;
                if (this.views["tabover"] != null) {
                    this.repaint(this.tabAreaX, this.tabAreaY, this.tabAreaWidth, this.tabAreaHeight);
                }
            }
        };

        this.endDragged = function(e) {
            var i = this.getTabAt(e.x, e.y);
            if (this.overTab != i) {
                this.overTab = i;
                if (this.views["tabover"] != null) {
                    this.repaint(this.tabAreaX, this.tabAreaY, this.tabAreaWidth, this.tabAreaHeight);
                }
            }
        };

        this.mouseExited = function(e) {
            if (this.overTab >= 0) {
                this.overTab = -1;
                if (this.views["tabover"] != null) {
                    this.repaint(this.tabAreaX, this.tabAreaY, this.tabAreaWidth, this.tabAreaHeight);
                }
            }
        };

        this.next =  function (page, d){
            for(; page >= 0 && page < ~~(this.pages.length / 2); page += d) {
                if (this.isTabEnabled(page)) return page;
            }
            return -1;
        };

        this.getTitleInfo = function(){
            var b = (this.orient == L.LEFT || this.orient == L.RIGHT),
                res = b ? { x:this.tabAreaX, y:0, width:this.tabAreaWidth, height:0, orient:this.orient }
                        : { x:0, y:this.tabAreaY, width:0, height:this.tabAreaHeight, orient:this.orient };
            if(this.selectedIndex >= 0){
                var r = this.getTabBounds(this.selectedIndex);
                if(b){
                    res[1] = r.y;
                    res[3] = r.height;
                }
                else{
                    res[0] = r.x;
                    res[2] = r.width;
                }
            }
            return res;
        };

        this.canHaveFocus = function(){ return true; };

        this.getTabView = function (index){
            var data = this.pages[2 * index];
            if (data.paint) return data;
            this.textRender.target.setText(data.toString());
            return this.textRender;
        };

        this.isTabEnabled = function (index){ return this.kids[index].isEnabled; };
    
        this.paint = function(g){
            var ts = g.getTopStack(), cx = ts.x, cy = ts.y, cw = ts.width, ch = ts.height;

            if(this.selectedIndex > 0){
                var r = this.getTabBounds(this.selectedIndex);
                //!!!! if(this.orient == L.LEFT || this.orient == L.RIGHT)
                //     g.clipRect(r.x, this.tabAreaY, r.width, r.y - this.tabAreaY);
                // else
                //     g.clipRect(this.tabAreaX, r.y, r.x - this.tabAreaX, r.height);
            }

            for(var i = 0;i < this.selectedIndex; i++) this.paintTab(g, i);

            if(this.selectedIndex >= 0){
                //!!!g.setClip(cx, cy, cw, ch);
                var r = this.getTabBounds(this.selectedIndex);
                //!!!! if(this.orient == L.LEFT || this.orient == L.RIGHT)
                //     g.clipRect(r.x, r.y + r.height, r.width, this.height - r.y - r.height);
                // else
                //     g.clipRect(r.x + r.width, r.y, this.width - r.x - r.width, r.height);
            }

            for(var i = this.selectedIndex + 1;i < ~~(this.pages.length / 2); i++) this.paintTab(g, i);

            //!!!!if (cw > 0 && ch > 0) g.setClip(cx, cy, cw, ch);

            if(this.selectedIndex >= 0){
                this.paintTab(g, this.selectedIndex);
                if (this.hasFocus()) this.drawMarker(g, this.getTabBounds(this.selectedIndex));
            }
        };

        this.drawMarker = function(g,r){
            var marker = this.views["marker"];
            if(marker != null){
                var bv = this.views["tab"];
                marker.paint(g, r.x + bv.getLeft(), r.y + bv.getTop(),
                                            r.width - bv.getLeft() - bv.getRight(),
                                            r.height - bv.getTop() - bv.getBottom(), this);
            }
        };

        this.paintTab = function (g, pageIndex){
            var b = this.getTabBounds(pageIndex), page = this.kids[pageIndex], vs = this.views,
                tab = vs["tab"], tabover = vs["tabover"], tabon = vs["tabon"];

            if(this.selectedIndex == pageIndex && tabon != null) {
                tabon.paint(g, b.x, b.y, b.width, b.height, page);
            }
            else {
                tab.paint(g, b.x, b.y, b.width, b.height, page);
            }

            if (this.overTab >= 0 && this.overTab == pageIndex && tabover != null) {
                tabover.paint(g, b.x, b.y, b.width, b.height, page);
            }

            var v = this.getTabView(pageIndex),
                ps = v.getPreferredSize(), px = b.x + L.getXLoc(ps.width, L.CENTER, b.width),
                py = b.y + L.getYLoc(ps.height, L.CENTER, b.height);

            v.paint(g, px, py, ps.width, ps.height, page);
            if (this.selectedIndex == pageIndex) {
                v.paint(g, px + 1, py, ps.width, ps.height, page);
            }
        };

        this.getTabBounds = function(i){ return this.pages[2 * i + 1]; };
    },

    function (){ this.$this(L.TOP); },

    function (o){
        this._ = new Listeners();
        this.pages = [];
        this.views = {};
        this.textRender = new pkg.view.TextRender(new zebra.data.SingleLineTxt(""));

        if (pkg.Tabs.font != null) this.textRender.setFont(pkg.Tabs.font);
        if (pkg.Tabs.fontColor != null) this.textRender.setForeground(pkg.Tabs.fontColor);
        this.setTitleAlignment(o);

        this.$super();
        this.setTitleAlignment(o);
    },

    function setViews(v){
        for(var k in v) { 
            if (v.hasOwnProperty(k)) this.views[k] = v[k];
        }
        this.vrp();
    },

    function setTabSpaces(vg,hg,sideSpace,upperSpace,brSpace){
        if(this.vTabGap != vg || this.hTabGap != hg || sideSpace != this.sideSpace ||
           upperSpace != this.upperSpace || brSpace != this.brSpace)
        {
            this.vTabGap = vg;
            this.hTabGap = hg;
            this.sideSpace = sideSpace;
            this.upperSpace = upperSpace;
            this.brSpace = brSpace;
            this.vrp();
        }
    },

    function setGaps(vg,hg){
        if(this.vgap != vg || hg != this.hgap){
            this.vgap = vg;
            this.hgap = hg;
            this.vrp();
        }
    },

    function setTitleAlignment(o){
        if(o != L.TOP && o != L.BOTTOM && o != L.LEFT && o != L.RIGHT) throw new Error();
        if(this.orient != o){
            this.orient = o;
            this.vrp();
        }
    },

    function enableTab(i,b){
        var c = this.kids[i];
        if(c.isEnabled != b){
            c.setEnabled(b);
            if( !b && this.selectedIndex == i) this.select(-1);
            this.repaint();
        }
    },

    function insert(index,constr,c){
        this.pages.splice(index * 2, 0, constr == null ? "Page " + index
                                                       : constr, { x:0, y:0, width:0, height:0 });
        var r = this.$super(index, constr, c);
        if(this.selectedIndex < 0) this.select(this.next(0, 1));
        return r;
    },

    function setTitle(pageIndex,data){
        if( !this.pages[2 * pageIndex].equals(data)){
            this.pages[pageIndex * 2] = data;
            this.vrp();
        }
    },

    function removeAt(i){
        if(this.selectedIndex == i) this.select( -1);
        this.pages.splice(i * 2, 2);
        this.$super(i);
    },

    function removeAll(){
        if(this.selectedIndex >= 0) this.select( -1);
        this.pages.splice(0, this.pages.length);
        this.pages.length = 0;
        this.$super();
    },

    function recalc(){
        var count = ~~(this.pages.length / 2);
        if(count > 0){
            this.tabAreaHeight = this.tabAreaWidth = 0;
            var bv = this.views["tab"], b = (this.orient == L.LEFT || this.orient == L.RIGHT), max = 0,
                hadd = 2 * this.hTabGap + bv.getLeft() + bv.getRight(),
                vadd = 2 * this.vTabGap + bv.getTop() + bv.getBottom();

            for(var i = 0;i < count; i++){
                var ps = this.getTabView(i).getPreferredSize(), r = this.getTabBounds(i);
                if(b){
                    r.height = ps.height + vadd;
                    if(ps.width + hadd > max) max = ps.width + hadd;
                    this.tabAreaHeight += r.height;
                }
                else{
                    r.width = ps.width + hadd;
                    if(ps.height + vadd > max) max = ps.height + vadd;
                    this.tabAreaWidth += r.width;
                }
            }
            for(var i = 0; i < count; i++ ){
                var r = this.getTabBounds(i);
                if(b) r.width = max;
                else r.height = max;
            }
            if(b) {
                this.tabAreaWidth = max + this.upperSpace + 1;
                this.tabAreaHeight += (2 * this.sideSpace);
            }
            else {
                this.tabAreaWidth += (2 * this.sideSpace);
                this.tabAreaHeight = this.upperSpace + max + 1;
            }
            if(this.selectedIndex >= 0) {
                var r = this.getTabBounds(this.selectedIndex);
                if(b){
                    r.height += 2 * this.sideSpace;
                    r.width += (this.brSpace + this.upperSpace);
                }
                else{
                    r.height += (this.brSpace + this.upperSpace);
                    r.width += 2 * this.sideSpace;
                }
            }
        }
    },

    function keyPressed(e){
        if(this.selectedIndex != -1 && this.pages.length > 0){
            switch(e.code)
            {
                case KE.VK_UP:
                case KE.VK_LEFT:
                    var nxt = this.next(this.selectedIndex - 1,  -1);
                    if(nxt >= 0) this.select(nxt);
                    break;
                case KE.VK_DOWN:
                case KE.VK_RIGHT:
                    var nxt = this.next(this.selectedIndex + 1, 1);
                    if(nxt >= 0) this.select(nxt);
                    break;
            }
        }
    },

    function mousePressed(e){
        if(e.isActionMask()){
            var index = this.getTabAt(e.x, e.y);
            if(index >= 0 && this.isTabEnabled(index)) this.select(index);
        }
    },

    function calcPreferredSize(target){
        var max = L.getMaxPreferredSize(target);
        if(this.orient == L.BOTTOM || this.orient == L.TOP){
            max.width = Math.max(2 * this.sideSpace + max.width, this.tabAreaWidth);
            max.height += this.tabAreaHeight;
        }
        else{
            max.width += this.tabAreaWidth;
            max.height = Math.max(2 * this.sideSpace + max.height, this.tabAreaHeight);
        }
        max.width  += (this.hgap * 2);
        max.height += (this.vgap * 2);
        return max;
    },

    function doLayout(target){
        var right = this.getRight(), top = this.getTop(), bottom = this.getBottom(), left = this.getLeft();
        var b = (this.orient == L.TOP || this.orient == L.BOTTOM);
        if(b){
            this.tabAreaX = left;
            this.tabAreaY = (this.orient == L.TOP) ? top : this.height - bottom - this.tabAreaHeight;
        }
        else{
            this.tabAreaX = (this.orient == L.LEFT) ? left : this.width - right - this.tabAreaWidth;
            this.tabAreaY = top;
        }
        var count = ~~(this.pages.length / 2), sp = 2*this.sideSpace,
            xx = b ? (this.tabAreaX + this.sideSpace)
                   : ((this.orient == L.LEFT) ? (this.tabAreaX + this.upperSpace) : this.tabAreaX + 1),
            yy = b ? (this.orient == L.TOP ? this.tabAreaY + this.upperSpace : this.tabAreaY + 1)
                   : (this.tabAreaY + this.sideSpace);

        for(var i = 0;i < count; i++ ){
            var r = this.getTabBounds(i);
            if(b){
                r.x = xx;
                r.y = yy;
                xx += r.width;
                if(i == this.selectedIndex) xx -= sp;
            }
            else{
                r.x = xx;
                r.y = yy;
                yy += r.height;
                if(i == this.selectedIndex) yy -= sp;
            }
        }

        for(var i = 0;i < count; i++){
            var l = this.kids[i];
            if(i == this.selectedIndex){
                if(b) {
                    l.setSize(this.width - left - right - 2 * this.hgap,
                              this.height - this.tabAreaHeight - top - bottom - 2 * this.vgap);
                    l.setLocation(left + this.hgap,
                                 ((this.orient == L.TOP) ? top + this.tabAreaHeight : top) + this.vgap);
                }
                else {
                    l.setSize(this.width - this.tabAreaWidth - left - right - 2 * this.hgap,
                              this.height - top - bottom - 2 * this.vgap);
                    l.setLocation(((this.orient == L.LEFT) ? left + this.tabAreaWidth : left) + this.hgap,
                                  top + this.vgap);
                }
            }
            else l.setSize(0, 0);
        }

        if(this.selectedIndex >= 0){
            var r = this.getTabBounds(this.selectedIndex), dt = 0;
            if(b){
                r.x -= this.sideSpace;
                r.y -= (this.orient == L.TOP) ? this.upperSpace : this.brSpace;
                dt = (r.x < left) ? left - r.x
                                  : (r.x + r.width > this.width - right) ? this.width - right - r.x - r.width : 0;
            }
            else{
                r.x -= (this.orient == L.LEFT) ? this.upperSpace : this.brSpace;
                r.y -= this.sideSpace;
                dt = (r.y < top) ? top - r.y
                                 : (r.y + r.height > this.height - bottom) ? this.height - bottom - r.y - r.height : 0;
            }
            for(var i = 0;i < count; i ++ ){
                var br = this.getTabBounds(i);
                if(b) br.x += dt;
                else br.y += dt;
            }
        }
    },

    function select(index){
        if(this.selectedIndex != index){
            this.selectedIndex = index;
            this._.fire(this, this.selectedIndex);
            this.vrp();
        }
    },

    function focusGained(e){
        if(this.selectedIndex < 0) this.select(this.next(0, 1));
        else {
            if(this.selectedIndex >= 0){
                var r = this.getTabBounds(this.selectedIndex);
                this.repaint(r.x, r.y, r.width, r.height);
            }
        }
    },

    function focusLost(e){
        if(this.selectedIndex >= 0){
            var r = this.getTabBounds(this.selectedIndex);
            this.repaint(r.x, r.y, r.width, r.height);
        }
    },

    function getTabAt(x,y){
        this.validate();
        if(x >= this.tabAreaX && y >= this.tabAreaY &&
            x < this.tabAreaX + this.tabAreaWidth &&
            y < this.tabAreaY + this.tabAreaHeight)
        {
            for(var i = 0; i < ~~(this.pages.length / 2); i++ ) {
                var tb = this.getTabBounds(i);
                if (x >= tb.x && y >= tb.y && x < tb.x + tb.width && y < tb.y + tb.height) return i;
            }
        }
        return -1;
    },

    function setSize(w,h){
        if(this.width != w || this.height != h){
            if(this.orient == L.RIGHT || this.orient == L.BOTTOM) this.tabAreaX =  -1;
            this.$super(w, h);
        }
    }
]);

pkg.Slider = Class(pkg.Panel, KeyListener, MouseListener, FocusListener,MouseMotionListener,
                   Actionable, [
    function $prototype() {
        this.max = this.min = this.value = this.roughStep = this.exactStep = 0;
        this.netSize = this.gap = 3;
        this.correctDt = this.orient = this.scaleStep = this.psW = this.psH = 0;
        this.intervals = this.pl = this.scaleColor = null;

        this.paintNums = function(g,loc){
            if(this.isShowTitle)
                for(var i = 0;i < this.pl.length; i ++ ){
                    var render = this.provider.getView(this, this.getPointValue(i)),
                        d = render.getPreferredSize();

                    if (this.orient == L.HORIZONTAL) {
                        render.paint(g, this.pl[i] - ~~(d.width / 2), loc, this);
                    }
                    else {
                        render.paint(g, loc, this.pl[i] - ~~(d.height / 2), this);
                    }
                }
        };

        this.getScaleSize = function(){
            var bs = this.views["bundle"].getPreferredSize();
            return (this.orient == L.HORIZONTAL ? this.width - this.getLeft() -
                                                  this.getRight() - bs.width
                                                : this.height - this.getTop() -
                                                  this.getBottom() - bs.height) - 2;
        };

        this.getScaleLocation = function(){
            var bs = this.views["bundle"].getPreferredSize();
            return (this.orient == L.HORIZONTAL ? this.getLeft() + ~~(bs.width / 2)
                                                : this.getTop()  + ~~(bs.height/ 2)) + 1;
        };
    },

    function() { this.$this(L.HORIZONTAL); },

    function (o){
        this._ = new Listeners();
        this.views = {};
        this.isShowScale = this.isShowTitle = true;
        this.dragged = this.isIntervalMode = false;
        this.render = new pkg.view.TextRender("");
        this.render.setDefBoldFont();
        this.render.setForeground(this.scaleColor);
        this.orient = o;
        this.setValues(0, 20, [0, 5, 10], 2, 1);
        this.setScaleStep(1);

        this.$super();
        this.views["bundle"] = (o == L.HORIZONTAL ? this.views["hbundle"] : this.views["vbundle"]);

        this.provider = this;
    },

    function focusGained(e){ this.repaint(); },
    function focusLost(e){ this.repaint(); },
    function canHaveFocus(){ return true; },

    function setScaleGap(g){
        if(g != this.gap){
            this.gap = g;
            this.vrp();
        }
    },

    function setScaleColor(c){
        if(!c.equals(this.scaleColor)){
            this.scaleColor = c;
            if (this.provider == this) this.render.setForeground(c);
            this.repaint();
        }
    },

    function setScaleStep(s){
        if(s != this.scaleStep){
            this.scaleStep = s;
            this.repaint();
        }
    },

    function showScale(b){
        if(isShowScale != b){
            this.isShowScale = b;
            this.vrp();
        }
    },

    function showTitle(b){
        if(this.isShowTitle != b){
            this.isShowTitle = b;
            this.vrp();
        }
    },

    function setViewProvider(p){
        if(p != this.provider){
            this.provider = p;
            this.vrp();
        }
    },

    function getView(d,o){
        this.render.target.setText(o != null ? o.toString() : "");
        return this.render;
    },

    function setViews(v){
        for(var k in v) this.views[k] = v[k];
        this.vrp();
    },

    function setValue(v){
        if(v < this.min || v > this.max) throw new Error();
        var prev = this.value;
        if(this.value != v){
            this.value = v;
            this._.fire(this, prev);
            this.repaint();
        }
    },

    function setValues(min,max,intervals,roughStep,exactStep){
        if(roughStep <= 0 || exactStep < 0 || min >= max || min + roughStep > max || min + exactStep > max)
            throw new Error();

        for(var i = 0, start = min;i < intervals.length; i ++ ){
            start += intervals[i];
            if(start > max || intervals[i] < 0) throw new Error();
        }
        this.min = min;
        this.max = max;
        this.roughStep = roughStep;
        this.exactStep = exactStep;
        this.intervals = Array(intervals.length);
        for(var i=0; i<intervals.length; i++) this.intervals[i] = intervals[i];
        if(this.value < min || this.value > max) {
            this.setValue(this.isIntervalMode ? min + intervals[0] : min);
        }
        this.vrp();
    },

    function getPointValue(i){
        var v = this.min + this.intervals[0];
        for(var j = 0; j < i; j++, v += this.intervals[j]);
        return v;
    },

    function keyPressed(e){
        var b = this.isIntervalMode;
        switch(e.code)
        {
            case KE.VK_UP:
            case KE.VK_LEFT:
                var v = this.nextValue(this.value, this.exactStep,-1);
                if(v >= this.min) this.setValue(v);
                break;
            case KE.VK_DOWN:
            case KE.VK_RIGHT:
                var v = this.nextValue(this.value, this.exactStep, 1);
                if(v <= this.max) this.setValue(v);
                break;
            case KE.VK_HOME: this.setValue(b ? this.getPointValue(0) : this.min);break;
            case KE.VK_END:  this.setValue(b ? this.getPointValue(this.intervals.length - 1) : this.max);break;
        }
    },

    function mousePressed(e){
        if(e.isActionMask()){
            var x = e.x, y = e.y, bb = this.getBundleBounds(this.value);
            if (x < bb.x || y < bb.y || x >= bb.x + bb.width || y >= bb.y + bb.height) {
                var l = ((this.orient == L.HORIZONTAL) ? x : y), v = this.loc2value(l);
                if(this.value != v)
                    this.setValue(this.isJumpOnPress ? v
                                                     : this.nextValue(this.value, this.roughStep, v < this.value ? -1:1));
            }
        }
    },

    function startDragged(e){
        var r = this.getBundleBounds(this.value);
        if(e.x >= r.x && e.y >= r.y && e.x < r.x + r.width && e.y < r.y + e.height){
            this.dragged = true;
            this.correctDt = this.orient == L.HORIZONTAL ? r.x + ~~(r.width  / 2) - e.x
                                                         : r.y + ~~(r.height / 2) - e.y;
        }
    },

    function endDragged(e){ this.dragged = false; },

    function mouseDragged(e){
        if(this.dragged)
            this.setValue(this.findNearest(e.x + (this.orient == L.HORIZONTAL ? this.correctDt : 0),
                                           e.y + (this.orient == L.HORIZONTAL ? 0 : this.correctDt)));
    },

    function paint(g){
        if(this.pl == null){
            this.pl = Array(this.intervals.length);
            for(var i = 0, l = this.min;i < this.pl.length; i ++ ){
                l += this.intervals[i];
                this.pl[i] = this.value2loc(l);
            }
        }
        var left = this.getLeft(), top = this.getTop(), right = this.getRight(), bottom = this.getBottom(),
            bnv = this.views["bundle"], gauge = this.views["gauge"],
            bs = bnv.getPreferredSize(), gs = gauge.getPreferredSize(),
            w = this.width - left - right - 2, h = this.height - top - bottom - 2;

        if(this.orient == L.HORIZONTAL){
            var topY = top + ~~((h - this.psH) / 2) + 1, by = topY;
            if(this.isEnabled) {
                gauge.paint(g, left + 1, topY + ~~((bs.height - gs.height) / 2), w, gs.height, this);
            }
            else{
                g.setColor(rgb.gray);
                g.strokeRect(left + 1, topY + ~~((bs.height - gs.height) / 2), w, gs.height);
            }
            topY += bs.height;
            if(this.isShowScale){
                topY += this.gap;
                g.setColor(this.isEnabled ? this.scaleColor : rgb.gray);
                for(var i = this.min;i <= this.max; i += this.scaleStep){
                    var xx = this.value2loc(i);
                    g.drawLine(xx, topY, xx, topY + this.netSize);
                }
                for(var i = 0;i < this.pl.length; i ++ )
                    g.drawLine(this.pl[i], topY, this.pl[i], topY + 2 * this.netSize);
                topY += (2 * this.netSize);
            }
            this.paintNums(g, topY);
            bnv.paint(g, this.getBundleLoc(this.value), by, bs.width, bs.height, this);
        }
        else{
            var leftX = left + ~~((w - this.psW) / 2) + 1, bx = leftX;
            if(this.isEnabled) {
                gauge.paint(g, leftX + ~~((bs.width - gs.width) / 2), top + 1, gs.width, h, this);
            }
            else{
                g.setColor(rgb.gray);
                g.strokeRect(leftX + ~~((bs.width - gs.width) / 2), top + 1, gs.width, h);
            }
            leftX += bs.width;
            if(this.isShowScale){
                leftX += this.gap;
                g.setColor(this.scaleColor);
                for(var i = this.min;i <= this.max; i += this.scaleStep){
                    var yy = this.value2loc(i);
                    g.drawLine(leftX, yy, leftX + this.netSize, yy);
                }
                for(var i = 0;i < this.pl.length; i ++ )
                    g.drawLine(leftX, this.pl[i], leftX + 2 * this.netSize, this.pl[i]);
                leftX += (2 * this.netSize);
            }
            this.paintNums(g, leftX);
            bnv.paint(g, bx, this.getBundleLoc(this.value), bs.width, bs.height, this);
        }
        if(this.hasFocus()) this.views["marker"].paint(g, left, top, w + 2, h + 2, this);
    },

    function findNearest(x,y){
        var v = this.loc2value(this.orient == L.HORIZONTAL ? x : y);
        if(this.isIntervalMode){
            var nearest = Number.MAX_VALUE, res = 0;
            for(var i = 0;i < this.intervals.length; i ++ ){
                var pv = this.getPointValue(i), dt = Math.abs(pv - v);
                if(dt < nearest){
                    nearest = dt;
                    res = pv;
                }
            }
            return res;
        }
        v = this.exactStep * ~~((v + v % this.exactStep) / this.exactStep);
        if(v > this.max) v = this.max;
        else if(v < this.min) v = this.min;
        return v;
    },

    function value2loc(v){
        return ~~((this.getScaleSize() * (v - this.min)) / (this.max - this.min)) +
               this.getScaleLocation();
    },

    function loc2value(xy){
        var sl = this.getScaleLocation(), ss = this.getScaleSize();
        if(xy < sl) xy = sl;
        else if(xy > sl + ss) xy = sl + ss;
        return this.min + ~~(((this.max - this.min) * (xy - sl)) / ss);
    },

    function invalidate(){
        this.pl = null;
        this.$super();
    },

    function calcPreferredSize(l){ return { width:this.psW + 2, height: this.psH + 2 }; },

    function recalc(){
        var ps = this.views["bundle"].getPreferredSize(),
            ns = this.isShowScale ? (this.gap + 2 * this.netSize) : 0,
            dt = this.max - this.min, hMax = 0, wMax = 0;

        if(this.isShowTitle && this.intervals.length > 0){
            for(var i = 0;i < this.intervals.length; i ++ ){
                var v = this.provider.getView(this, this.getPointValue(i)), d = v.getPreferredSize();
                if(d.height > hMax) hMax = d.height;
                if(d.width  > wMax) wMax = d.width;
            }
        }
        if(this.orient == L.HORIZONTAL){
            this.psW = dt * 2 + ps.width;
            this.psH = ps.height + ns + hMax;
        }
        else{
            this.psW = ps.width + ns + wMax;
            this.psH = dt * 2 + ps.height;
        }
    },

    function nextValue(value,s,d){
        if(this.isIntervalMode) return this.getNeighborPoint(value, d);
        else{
            var v = value + (d * s);
            if(v > this.max) v = this.max;
            else if(v < this.min) v = this.min;
            return v;
        }
    },

    function getBundleLoc(v){
        var bs = this.views["bundle"].getPreferredSize();
        return this.value2loc(v) - (this.orient == L.HORIZONTAL ? ~~(bs.width / 2)
                                                                : ~~(bs.height / 2));
    },

    function getBundleBounds(v){
        var bs = this.views["bundle"].getPreferredSize();
        return this.orient == L.HORIZONTAL ? { x:this.getBundleLoc(v),
                                               y:this.getTop() + ~~((this.height - this.getTop() - this.getBottom() - this.psH) / 2) + 1,
                                               width:bs.width, height:bs.height }
                                           : { x:this.getLeft() + ~~((this.width - this.getLeft() - this.getRight() - this.psW) / 2) + 1,
                                               y:this.getBundleLoc(v), width:bs.width, height:bs.height };
    },

    function getNeighborPoint(v,d){
        var left = this.min + this.intervals[0], right = this.getPointValue(this.intervals.length - 1);
        if (v < left) return left;
        else if (v > right) return right;
        if (d > 0) {
            var start = this.min;
            for(var i = 0;i < this.intervals.length; i ++ ){
                start += this.intervals[i];
                if(start > v) return start;
            }
            return right;
        }
        else {
            var start = right;
            for(var i = this.intervals.length - 1;i >= 0; i--) {
                if (start < v) return start;
                start -= this.intervals[i];
            }
            return left;
        }
    }
]);

pkg.StatusBar = new Class(pkg.Panel, [
    function () { this.$this(2); },

    function (gap){
        this.paddings(gap, 0, 0, 0);
        this.$super(new L.PercentLayout(Layout.HORIZONTAL, gap));
    },

    function setBorderView(v){
        if(v != this.borderView){
            this.borderView = v;
            for(var i = 0;i < this.count(); i++) this.get(i).setBorder(this.borderView);
            this.repaint();
        }
    },

    function insert(i,s,d){
        d.setBorder(this.borderView);
        this.$super(i, s, d);
    }
]);


pkg.Toolbar = Class(pkg.Panel, ChildrenListener, [
    function $clazz() {
        this.Constraints = function(isDec, str) {
            this.views = [null, null, null];
            this.isDecorative = arguments.length > 0 ? isDec : false;
            this.stretched = arguments.length > 1 ? str : false;
        };
    },

    function $prototype() {
        var OVER = "over", OUT = "out", PRESSED = "pressed";

        this.isDecorative = function(c){ return c.constraints.isDecorative; };

        this.childInputEvent = function(e){
            if(e.UID == pkg.InputEvent.MOUSE_UID){
                var dc = L.getDirectChild(this, e.source);
                if (!this.isDecorative(dc)){
                    switch(e.ID)
                    {
                        case ME.ENTERED:this.select(dc, true); break;
                        case ME.EXITED  : if(this.selected != null && L.isAncestorOf(this.selected, e.source)) this.select(null, true); break;
                        case ME.PRESSED : this.select(this.selected, false);break;
                        case ME.RELEASED: this.select(this.selected, true); break;
                    }
                }
            }
        };

        this.recalc = function(){
            var v = this.views, vover = v[OVER], vpressed = v[PRESSED];
            this.leftShift   = Math.max(vover     == null ? 0 : vover.getLeft(),
                                        vpressed  == null ? 0 : vpressed.getLeft());
            this.rightShift  = Math.max(vover     == null ? 0 : vover.getRight(),
                                        vpressed  == null ? 0 : vpressed.getRight());
            this.topShift    = Math.max(vover     == null ? 0 : vover.getTop(),
                                        vpressed  == null ? 0 : vpressed.getTop());
            this.bottomShift = Math.max(vover     == null ? 0 : vover.getBottom(),
                                        vpressed  == null ? 0 : vpressed.getBottom());
        };

        this.paint = function(g) {
            for(var i = 0;i < this.kids.length; i++){
                var c = this.kids[i];
                if(c.isVisible && this.isDecorative(c) === false){
                    var index = (this.selected == c) ? (this.isOver ? OVER : PRESSED) : OUT;
                    if (instanceOf(c, pkg.Checkbox) && c.getState()) index = PRESSED;
                    var v = this.getView(c, index);
                    if(v != null) {
                        v.paint(g, c.x, this.getTop(),
                                   c.width, this.height - this.getTop() - this.getBottom(), this);
                    }
                }
            }
        };
    },

    function () { this.$this(L.HORIZONTAL, 4); },

    function (orient,gap){
        if(orient != L.HORIZONTAL && orient != L.VERTICAL) throw new Error();

        this.selected = null;
        this.isOver = false;
        this._ = new Listeners();
        this.leftShift = this.topShift = this.bottomShift = this.rightShift = 0;
        
        this.views = {};
        this.orient = orient;
        this.gap = gap;
        this.$super();
    },

    function setViews(v){ 
        for(var k in v) {
            if (v.hasOwnProperty(k)) this.views[k] = v[k];
        }
        this.vrp();
    },

    function setView(type,v){ this.setView(null, type, v); },

    function setView(c,id,v){
        if(c != null){
            if (this.indexOf(c) < 0) throw new Error();
            c.constraints.views[id] = v;
        }
        else this.views[id] = v;
        this.vrp();
    },

    function getView(id){ return this.getView(null, id); },

    function getView(c,id){
        // if(c != null){
        //     var constr = c.constraints;
        //     if(constr.views[id] != null) return constr.views[id];
        // }
        return this.views[id];
    },

    function addDecorative(c){ this.add(new pkg.Toolbar.Constraints(true), c); },

    function addRadio(g,c){
        var cbox = new pkg.Radiobox(c, g);
        this.add(cbox);
        return cbox;
    },

    function addSwitcher(c){
        var cbox = new pkg.Checkbox(c);
        this.add(cbox);
        return cbox;
    },

    function addImage(img){
        this.validateMetric();
        var pan = new pkg.ImagePan(img);
        pan.paddings(this.topShift, this.leftShift + 2, this.bottomShift, this.rightShift+2);
        this.add(pan);
        return pan;
    },

    function addCombo(list){
        var combo = new pkg.Combo(list);
        this.add(new pkg.Toolbar.Constraints(false), combo);
        combo.paddings(1, 4, 1, 1);
        return combo;
    },

    function addLine(){
        var line = new pkg.Line(L.VERTICAL);
        this.add(new pkg.Toolbar.Constraints(true, true), line);
        return line;
    },

    function insert(i,id,d){
        if(id == null) id = new pkg.Toolbar.Constraints();
        return this.$super(i, id, d);
    },

    function calcPreferredSize(target){
        var w = 0, h = 0, c = 0, b = (this.orient == L.HORIZONTAL);
        for(var i = 0;i < target.kids.length; i++ ){
            var l = target.kids[i];
            if(l.isVisible){
                var ps = l.getPreferredSize();
                if(b) {
                    w += (ps.width + (c > 0 ? this.gap : 0));
                    h = Math.max(ps.height, h);
                }
                else{
                    w = Math.max(ps.width, w);
                    h += (ps.height + (c > 0 ? this.gap : 0));
                }
                c++;
            }
        }

        return { width:  (b ? w + c * (this.leftShift + this.rightShift)
                            : w + this.topShift + this.bottomShift),
                 height: (b ? h + this.leftShift + this.rightShift
                            : h + c * (this.topShift + this.bottomShift)) };
    },

    function doLayout(t){
        var b = (this.orient == L.HORIZONTAL), x = t.getLeft(), y = t.getTop(),
            av = this.topShift + this.bottomShift, ah = this.leftShift + this.rightShift,
            hw = b ? t.height - y - t.getBottom() : t.width - x - t.getRight();
        for(var i = 0;i < t.kids.length; i++){
            var l = t.kids[i];
            if(l.isVisible){
                var ps = l.getPreferredSize(), str = l.constraints.stretched;
                if(b){
                    if (str) ps.height = hw;
                    l.setLocation(x + this.leftShift, y + ((hw - ps.height) / 2  + 0.5) | 0);
                    x += (this.gap + ps.width + ah);
                }
                else{
                    if (str) ps.width = hw;
                    l.setLocation(x + (hw - ps.width) / 2, y + this.topShift);
                    y += (this.gap + ps.height + av);
                }
                l.setSize(ps.width, ps.height);
            }
        }
    },

    function select(c,state){
        if(c != this.selected || (this.selected != null && state != this.isOver)){
            var prev = this.selected, addW = this.leftShift + this.rightShift, addH = this.topShift + this.bottomShift;
            this.selected = c;
            this.isOver = state;
            var top = this.getTop(), mb = this.height - this.getBottom() + top;
            //!!! if(prev != null) this.repaint(prev.x - this.leftShift, top, prev.width + addW, mb);
            //!!! if(c != null) this.repaint(c.x - this.leftShift, top, c.width + addW, mb);
            this.repaint();
            if (state === false && c != null) this._.fire(this, c);
        }
    }
]);


pkg.configurator(function(conf) {
    conf.loadByUrl("ui.json", pkg);
    p = zebra()["ui.json"];
    if (p) conf.loadByUrl(p, pkg);
});

})(zebra("ui"), zebra.Class, zebra.Interface);
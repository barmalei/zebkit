zebra.package("ui.vk", function(pkg, Class) {
    var L = zebra.layout, ui = zebra("ui"), $vk = null;

    pkg.makeEditorVisible = true;

    /**
     * Virtual keyboard implementation
     * @module  ui.vk
     * @main
     */

    pkg.VKLayout = Class(L.Layout, [
        function $prototype () {
            this.gap   = 2;
            this.ratio = 2;

            this.doLayout = function(t) {
                var m     = this.keyboardMetrics(t),
                    rows  = m.rows,
                    row   = -1,
                    x     =  0,
                    y     =  0,
                    left  = t.getLeft(),
                    top   = t.getTop(),
                    ew    = t.width - left - t.getRight(),
                    extra = 1000000;

                // compute extra alignment for fixed size keys to
                // take larger than preferred size horizontal
                // space
                for(var i = 0; i < rows.length; i++) {
                    if (rows[i].fixKeys === 0) {
                        continue;
                    }

                    var r  = rows[i],
                        w  = (r.keys > 0 ? r.keys - 1 : 0) * this.gap + m.fixKeyWidth * r.fixKeys + r.occupiedHorSpace,
                        ex = ew - w;

                    ex =  Math.round(ex/r.fixKeys);
                    if (extra > ex) {
                        extra = ex;
                    }
                }

                // calculate final fixed size key size
                if (extra != 1000000 && extra != 0) {
                    m.fixKeyWidth += extra;

                    // check if key proportion is good, otherwise again correct fixed key size
                    if (m.fixKeyWidth / m.rowHeight > this.ratio) {
                        m.fixKeyWidth = ~~(m.rowHeight * this.ratio);
                    }

                    // re-calculate keyboard width
                    m.width = this.maxRowWidth(rows, m.fixKeyWidth);
                }

                for (var i = 0; i < t.kids.length; i++) {
                    var k = t.kids[i], ctr = k.constraints, r = m.rows[ctr.row];

                    if (row != ctr.row) {
                        row ++;
                        y += (row == 0 ? top : this.gap + m.rowHeight);

                        // compute actual width the row occupies
                        var aw = r.fixKeys * m.fixKeyWidth + r.occupiedHorSpace + (r.keys > 0 ? r.keys - 1 : 0) * this.gap;

                        if (r.stretchedKeys === 0) {
                            x = left + ~~((ew - aw) / 2);
                        }
                        else {
                            x  = left + ~~((ew - m.width) / 2)
                            extra = ~~ ((m.width - aw) / r.stretchedKeys);
                        }
                    }

                    if (k.isVisible === true) {
                        if (ctr.size == null) {
                            k.setSize(m.fixKeyWidth, m.rowHeight);
                        }
                        else {
                            var ps = k.getPreferredSize();
                            if (ctr.size == "stretched") {
                                k.setSize(ps.width + extra, m.rowHeight);
                            }
                            else {
                                k.setSize(ps.width, m.rowHeight);
                            }
                        }

                        k.setLocation(x, y);
                        x += this.gap + k.width;
                    }
                }
            };

            this.calcPreferredSize = function(t) {
                var m = this.keyboardMetrics(t);
                return {
                    width : m.width,
                    height: m.height
                };
            };

            this.maxRowWidth = function(rows, fixKeyWidth) {
                // calculate preferred size
                var width = 0;
                for(var i = 0; i < rows.length; i++) {
                    var r    = rows[i],
                        w    = (r.keys > 0 ? r.keys - 1 : 0) * this.gap + fixKeyWidth * r.fixKeys + r.occupiedHorSpace;
                    if (w > width) width = w;
                }
                return width;
            };

            this.keyboardMetrics = function(t) {
                var rows             = [],
                    rowHeight        = 0,
                    fixKeyWidth      = 0;

                for(var row = 0;  ;row++) {
                    var r = this.rowMetric(row, t);
                    if (r == null) break;

                    rows.push(r);
                    if (r.fixKeyMaxWidth > fixKeyWidth) fixKeyWidth = r.fixKeyMaxWidth;
                    if (r.rowHeight      > rowHeight  ) rowHeight   = r.rowHeight;
                }

                // check if key proportion is good, otherwise again correct fixed key size
                if (fixKeyWidth / rowHeight > this.ratio) {
                    fixKeyWidth = ~~(rowHeight * this.ratio);
                }

                return {
                    rows         : rows,
                    rowHeight    : rowHeight,
                    fixKeyWidth  : fixKeyWidth,
                    width        : this.maxRowWidth(rows, fixKeyWidth),
                    height       : rows.length * rowHeight + (rows.length > 0 ? rows.length - 1 : 0) * this.gap
                };
            };

            this.rowMetric = function(row, t) {
                var fixKeys           = 0,
                    prefKeys          = 0,
                    stretchedKeys     = 0,
                    fixKeyMaxWidth    = 0,
                    occupiedHorSpace  = 0,
                    rowHeight         = 0,
                    stretchedHorSpace = 0,
                    ctr               = null;

                for (var i=0; i < t.kids.length; i++) {
                    var k = t.kids[i];

                    ctr = k.constraints;

                    // next row detected
                    if (ctr.row > row) {
                        break;
                    }

                    if (ctr.row === row && k.isVisible === true) {
                        var ps = k.getPreferredSize();

                        if (ctr.size == null) {
                            if (fixKeyMaxWidth < ps.width) fixKeyMaxWidth = ps.width;
                            fixKeys ++;
                        }
                        else {
                            if (ctr.size == "ps") {
                                prefKeys++;
                            }
                            else {
                                stretchedKeys++;
                                stretchedHorSpace += ps.width;
                            }
                            occupiedHorSpace += ps.width;
                        }

                        if (rowHeight < ps.height) rowHeight = ps.height;
                    }
                }

                // no row exists
                if (ctr == null || ctr.row < row) {
                    return null;
                }

                return {
                    keys             : fixKeys + prefKeys + stretchedKeys,
                    fixKeys          : fixKeys,
                    prefKeys         : prefKeys,
                    stretchedKeys    : stretchedKeys,
                    rowHeight        : rowHeight,
                    fixKeyMaxWidth   : fixKeyMaxWidth,
                    occupiedHorSpace : occupiedHorSpace,
                    stretchedHorSpace: stretchedHorSpace
                };
            };
        }
    ]);

    pkg.ShiftKeyArrow = zebra.Class(ui.View, [
        function $prototype() {
            //       /\A
            //      /  \
            //     /    \
            //    / C  F \
            // B ^^^|  |^^^ G
            //      |__|
            //     D    E
            //
            // Proportions:
            //     AC = FG = w / 4
            //     CF = w / 2
            //     w =  h / 2
            this.outline = function(g,x,y,w,h,d) {
                x += 4;
                y += 4;
                w -= 8;
                h -= 8;

                var cx = x + ~~(w / 2),
                    ww = ~~(h / 2),
                    dw = ~~(h / 4),
                    dt = g.lineWidth/2;

                g.beginPath();
                g.moveTo(cx, y);                      // A
                g.lineTo(cx - ww + dt, y + ww + dt);  // B
                g.lineTo(cx - dw - dt, y + ww + dt);  // C
                g.lineTo(cx - dw - dt, y + h - dt);   // D
                g.lineTo(cx + dw + dt, y + h - dt);   // E
                g.lineTo(cx + dw + dt, y + ww + dt);  // F
                g.lineTo(cx + ww - dt, y + ww + dt);  // G
                g.lineTo(cx, y);                      // A
                return true;
            };

            this.paint = function(g,x,y,w,h,d) {
                this.outline(g,x,y,w,h,d);

                if (this.lineColor) {
                    g.setColor(this.lineColor);
                    g.stroke();
                }

                if (this.bg != null) {
                    g.setColor(this.bg);
                    g.fill();
                }
            };

            this.getPreferredSize = function() {
                return {
                    width : this.prefSize,
                    height: this.prefSize
                };
            };
        },

        function(bg, lnCol) {
            this.lineColor= lnCol != null ? lnCol: "white";
            this.bg       = bg;
            this.prefSize = 10;
        }
    ]);

    pkg.HintPan = Class(ui.Panel, [
        function $clazz() {
            this.Label = Class(ui.Label, []);
        },

        function() {
            this.$super();
            this.add(new this.$clazz.Label(""));
        },

        function setValue(v) {
            this.kids[0].setValue(v);
        }
    ]);

    var tooltip = null;

    pkg.VKeyBase = Class(ui.Button, [
        function $clazz() {
            this.padding = 1;
            this.Label = Class(ui.Label, []);
            this.Label.font = new ui.Font("Arial", "bold", 14);
        },

        function $prototype() {
            this.$isVkElement = true;
            this.canHaveFocus = false;

            this.showHint = function(ch) {
                this.hideHint();

                if (tooltip == null) {
                    tooltip = new pkg.HintPan();
                }

                tooltip.setValue(ch);
                tooltip.toPreferredSize();
                var rl = L.toParentOrigin(this);
                if (rl.y - tooltip.height > 0) {
                    tooltip.setLocation(rl.x, rl.y - tooltip.height);
                }
                else {
                    tooltip.setLocation(rl.x, rl.y + this.height);
                }
                tooltip.setSize(this.width, tooltip.height);
                ui.showWindow(this, "info", tooltip);
            };

            this.hideHint = function() {
                if (tooltip != null) tooltip.removeMe();
            };

            this.findVK = function(id) {
                var p = this.parent;
                while(p != null && p[id] == null) p = p.parent;
                return p;
            };

            this.setLabel = function(l) {
                if (zebra.instanceOf(this.kids[0], ui.Label)) {
                    this.kids[0].setValue(l);
                }
            };

            this.getLabel = function() {
                return zebra.instanceOf(this.kids[0], ui.Label) ? this.kids[0].getValue() : null;
            };

            this.nextStatusView = function() {
                if (this.statusViews != null) {
                    this.statusKeyIndex = (this.statusKeyIndex + 1) % this.statusViewKeys.length;
                    this.statusViews.activate(this.statusViewKeys[this.statusKeyIndex]);
                    this.repaint();
                }
            };
        },

        function(v) {
            if (zebra.isString(v) == false &&
                zebra.instanceOf(v, ui.Panel) == false &&
                (v instanceof Image) == false)
            {
                v = ui.$view(v);

                if (zebra.instanceOf(v, ui.ViewSet)) {
                    this.statusViews    = v;
                    this.statusViewKeys = [];
                    this.statusKeyIndex = 0;
                    for(var k in v.views) {
                        this.statusViewKeys.push(k);
                    }
                    this.statusViews.activate(this.statusViewKeys[0]);
                }
                v = new ui.ViewPan().setView(v);
                this.$super(v);
                this.setLayout(new L.StackLayout());
            }
            else {
                this.$super(v);
            }
        },

        function mousePressed(e) {
            this.$super(e);
            this.nextStatusView();
        }
    ]);

    // 1) "A" single character key
    //   {  ch: "A" }
    //
    // 2) General virtual key pattern
    //   {
    //      ch  : <ch>,
    //      code: <code>,
    //      mask: <mask>,
    //      label | view | icon : <?>
    //   }
    //
    // 3) Character shortcut:
    // "A"
    //
    // 4) Multiple single char VK variants:
    //    "ABCD"
    //
    // 5) Multiple caharcter single key
    //    [ "AA" ]  or with variants [ "AA", ["BB"], ["CC"] ]
    //
    pkg.VKey = Class(pkg.VKeyBase, [
        function $prototype() {
            this.$sticked = false;

            this.$syncMask = function(m) {
                if (this.mask != null) {
                    var isOn = this.mask & m;
                    if (isOn != this.$sticked) {
                        this.$sticked = !this.$sticked;
                        this.setState(this.$sticked ? 3 : 2);
                        this.nextStatusView();
                    }
                }
            };

            this.catchFired = function() {
                if (this.ch != null) {
                    this.fireVkTyped(this.code, this.ch, this.mask);
                }
                else {
                    // handle period keys
                    if (this.firePeriod > 0 &&
                        this.repeatTask != null &&
                        this.repeatTask.isStarted === true)
                    {
                        this.fireVkPressed(this.code, this.ch, this.mask);
                    }
                }
            };

            this.fireVkTyped = function(code, ch, mask) {
                var vk = this.findVK("vkTyped");
                if (vk != null) {
                    vk.vkTyped(this, code, ch, mask);
                }
            };

            this.fireVkReleased = function(code, ch, mask) {
                this.hideHint();

                var vk = this.findVK("vkReleased");
                if (vk != null) {
                    vk.vkReleased(this, code, ch, mask);
                }
            };

            this.fireVkPressed = function(code, ch, mask) {
                var vk = this.findVK("vkPressed");
                if (vk != null) {
                    vk.vkPressed(this, code, ch, mask);
                }

                if (ch != null && this.hint !== null) {
                    this.showHint(this.hint !== null ? ch : this.hint);
                }
            };

            this.upperCase = function() {
                if (this.ch != null) {
                    var l = this.getLabel();
                    if (l != null && l.toLowerCase() == this.ch.toLowerCase()) {
                        this.setLabel(l.toUpperCase());
                    }
                }
            };

            this.lowerCase = function() {
                if (this.ch != null) {
                    var l = this.getLabel();
                    if (l != null && l.toLowerCase() == this.ch.toLowerCase()) {
                        this.setLabel(l.toLowerCase());
                    }
                }
            };
        },

        function(t) {
            if (zebra.isString(t)) {
                t = { ch : t };
            }

            this.ch   = t.ch == null ? null : t.ch;
            this.mask = t.mask == null ? 0 : t.mask;
            this.code = (t.code == null) ? 0 : t.code;

            if (typeof t.hint != "undefined") {
                this.hint = t.hint;
            }

            if (t.repeat != null) {
                this.setFireParams(true, t.repeat);
            }

            this.$super(t.view || t.icon || t.label || this.ch);
        },

        function _mousePressed(e) {
            if (this.$sticked == true) {
                this.$sticked = false;
                this.$super(this._mouseReleased, e);
                this.fireVkReleased(this.code, this.ch, this.mask);
            }
            else {
                this.$super(e);
                this.fireVkPressed(this.code, this.ch, this.mask);
                if (this.mask != 0) {
                    this.$sticked = true;
                }
            }
        },

        function _mouseReleased(e) {
            if (this.mask == 0) {
                this.$super(e);
                this.fireVkReleased(this.code, this.ch, this.mask);
            }
        }
    ]);

    pkg.PredefinedVKey = {
        shift : {
            view: {
                "on" : new pkg.ShiftKeyArrow(),
                "off": new pkg.ShiftKeyArrow()
            },
            code : ui.KeyEvent.SHIFT,
            mask : ui.KeyEvent.M_SHIFT
        },

        left: {
            code : zebra.ui.KeyEvent.LEFT,
            view : new zebra.ui.ArrowView("left"),
            period: 150
        },

        right: {
            code : zebra.ui.KeyEvent.RIGHT,
            view : new zebra.ui.ArrowView("right"),
            period: 150
        },

        enter : {
            //          |  A
            //     E    |
            // C /______|  B
            //   \ D
            //
            view: ui.$view(function(g, x, y, w, h, d) {
                var gap = 6;
                g.setColor("orange");
                g.beginPath();
                g.lineWidth = 2;
                g.moveTo(x + w - gap, y + gap);          // A
                g.lineTo(x + w - gap, y + h - 2*gap);  // AB
                g.lineTo(x + gap, y + h - 2*gap);      // BC
                g.lineTo(x + 2*gap, y + h - gap);      // CD
                g.moveTo(x + gap - 1, y + h - 2*gap);      // C
                g.lineTo(x + 2*gap, y + h - 3 * gap);      // CE
                g.stroke();
            }),
            ch : "\n",
            hint: null
        },

        space : {
            label: "Space",
            ch   : " ",
            size : "stretched",
            hint : null
        },

        backspace: {
            code: ui.KeyEvent.BSPACE,
            label: "<=",
            view2: ui.$view(function(g, x, y, w, h, d) {
                g.setColor("black");
                g.beginPath();
                g.lineWidth = 2;
                g.moveTo(x + w - 2, y + h - 8);  // B
                g.lineTo(x + 6, y + h - 8);      // BC
                g.lineTo(x + 12, y + h - 4);      // CD
                g.moveTo(x + 6, y + h - 8);      // C
                g.lineTo(x + 12, y + h -12);      // CE
                g.stroke();
            }),
            repeat: 150,
            size: "ps",
            hints: "backspace"
        }
    }

    pkg.VKeyOption = Class(pkg.VKeyBase, [
        function $clazz() {
            this.Menu = Class(ui.Menu, []);
        },

        function $prototype() {
            this.catchFired = function() {
                if (this.menu.parent != null) {
                    this.menu.removeMe();
                }
                else {
                    var o = L.toParentOrigin(this);
                    this.menu.select(-1);
                    this.menu.setLocation(o.x, o.y - this.menu.height);
                    ui.showPopupMenu(this, this.menu);
                }
            };
        },

        function (v, options) {
            this.$super(v);
            this.menu = new this.$clazz.Menu(options);
            this.menu.toPreferredSize();
            this.menu.$isVkElement = true;


            this.options = options.slice(0);
            var $this = this;
            this.menu.bind(function(src, i) {
                if (src.selectedIndex >= 0) {
                    var vk = $this.findVK("vkOptionSelected");
                    if (vk != null) {
                        vk.vkOptionSelected($this,
                                            src.selectedIndex,
                                            $this.options[src.selectedIndex]);
                    }
                }
            });
        }
    ]);

    var RL = Class(L.RasterLayout, [
            function calcPreferredSize(t) {
                var w = 0, h = 0;
                for (var i = 0; i < t.kids.length; i++) {
                    if (t.kids[i].isVisible === true) {
                        var ps = t.kids[i].getPreferredSize();
                        w += ps.width;
                        h += ps.height;
                    }
                }
                return { width: w, height: h };
            }
        ]),
        KE = new ui.KeyEvent(null, ui.KeyEvent.PRESSED, 1, 1, 0);


    pkg.VKeys = Class(pkg.VKey, [
        function $clazz () {
            this.layout = new L.BorderLayout();

            this.SmallLabel = Class(ui.Label, []);
            this.SmallLabel.font = new ui.Font(pkg.VKey.Label.font.name, ~~((2*pkg.VKey.Label.font.height)/3));

            this.KeysPopupPan = Class(ui.Panel, [
                function $clazz() {
                    this.layout     = new L.FlowLayout("left", "center", "horizontal", 6);
              		this.padding    = 6;
              		this.border     = new ui.Border("plain");
              		this.background = "rgba(200,200,200,0.8)";
                },

                function $prototype() {
                    this.$isVkElement = true;
                },

                function() {
                    this.$super();
                }
            ]);

            this.KeysLabelPan = Class(ui.Panel, [
                function $clazz() {
                    this.layout = new RL(L.USE_PS_SIZE);
                },

                function(chars) {
                    this.$super();
                    this.constraints = "center";

                    var mainLab = new pkg.VKeys.Label(chars[0]),
                        altLab  = new pkg.VKeys.SmallLabel(chars.length == 2 ? chars[1] : "...");

                    mainLab.constraints = L.CENTER;
                    altLab.constraints  = L.TopRight;
                    this.add(mainLab);
                    this.add(altLab);

                    this.mainLab = mainLab;
                }
            ]);
        },

        function $prototype() {
            this.getLabel = function() {
                return this.kids[0].mainLab.getValue();
            };

            this.setLabel = function(l) {
                this.kids[0].mainLab.setValue(l);
            };

            this.showKeysPopupPan = function() {
                this.hideHint();

                if (this.keysPopupPan == null) {
                    this.$counter = (this.$counter + 1 ) % 2;
                    this.showHint(this.$counter == 0 ? this.ch : this.altCh);
                }
                else {
                    this.$pressed.shutdown();

                    var rl = L.toParentOrigin(this);
                    for(var i = 0; i < this.keysPopupPan.kids.length; i++) {
                        this.keysPopupPan.kids[i].setPreferredSize(this.width, this.height);
                    }

                    this.keysPopupPan.toPreferredSize();
                    this.keysPopupPan.setLocation(rl.x, rl.y - this.keysPopupPan.height);
                    ui.showWindow(this, "mdi", this.keysPopupPan, {
                        winActivated : function (l, w, isActive) {
                            if (isActive === false) {
                                w.removeMe();
                            }
                        }
                    });
                    ui.makeFullyVisible(this.keysPopupPan);
                    ui.activateWindow(this.keysPopupPan);
                }
            };

            this.hideKeysPopupPan = function() {
                if (this.keysPopupPan != null) {
                    this.keysPopupPan.removeMe();
                }
            };
        },

        function fireVkPressed(code, ch, mask) {
            this.$counter = 0;
            this.hideKeysPopupPan();
            this.$super(code, ch, mask);
            this.$pressed = zebra.util.task(this.showKeysPopupPan, this).run(700, 700);
        },

        function fireVkTyped(code, ch, mask) {
            if (this.keysPopupPan == null) {
                ch = this.$counter > 0 ? this.altCh : this.ch;
                this.$super(ch.charCodeAt(0), ch, mask);
            }
            else {
                if (this.keysPopupPan.parent == null) {
                    this.$super(code, ch, mask);
                }
            }
        },

        function fireVkReleased(code, ch, mask) {
            this.$pressed.shutdown();
            this.$super(code, ch, mask);
        },

        function(chars) {
            if (chars.length < 2) {
                throw new Error();
            }

            this.$super( {
                ch    : chars[0],
                label : new this.$clazz.KeysLabelPan(chars)
            });

            this.keysPopupPan = null;
            if (chars.length > 2) {
                this.keysPopupPan = new this.$clazz.KeysPopupPan();

                var $this = this;
                for(var i = 1; i < chars.length; i++) {
                    var key =  pkg.createVKey(chars[i]);
                    key.extend([
                        function findVK(id) {
                            return $this.findVK(id);
                        },

                        function fireVkReleased(code, ch, mask) {
                            this.$super(code, ch, mask);
                            $this.hideKeysPopupPan();
                        }
                    ]);
                    this.keysPopupPan.add(key);
                }
            }
            else {
                this.altCh = chars[1];
            }
        }
    ]);

    pkg.showVK = function(input) {
        $vk.show(input);
    };

    pkg.getVK = function() {
        return $vk;
    };

    pkg.createVKey = function(d) {
        if (zebra.isString(d)) {
            if (pkg.PredefinedVKey[d.toLowerCase()] != null) {
                d = pkg.PredefinedVKey[d.toLowerCase()];
            }
            else {
                if (d.length > 1) return new pkg.VKeys(d);
            }
        }
        else {
            if (Array.isArray(d)) {
        		return d.length === 1 ? new pkg.VKey (d[0])
                                      : new pkg.VKeys(d);
            }
            else {
                if (d.hasOwnProperty("vkey")) return d["vkey"];
            }
        }

        return new pkg.VKey(d);
    };

    pkg.VKListeners = zebra.util.ListenersClass("vkPressed", "vkTyped", "vkReleased", "vkMaskUpdated", "vkOptionSelected");

    pkg.VK = Class(ui.Panel, [
        function $prototype() {
            this.mask = 0;

            this.eachGroupKey = function(g, f) {
                var g = this.getGroupPan(g);
                if (g != null) {
                    for(var i = 0; i < g.kids.length; i++) {
                        var k = g.kids[i];
                        f.call(this, g, k);
                    }
                }
            };

            this.eachKey = function(f) {
                for(var i = 0; i < this.kids.length; i++) {
                    this.eachGroupKey(this.kids[i].name, f);
                }
            };

            this.show = function(d) {
                if (d != this.input) {
                    this.removeMe();

                    if (this.input != null) {
                        this.input.$forceToShow = false;
                    }

                    this.input = d;

                    if (d != null) {
                        d.$forceToShow = true;
                        this.constraints = L.HORIZONTAL | L.BOTTOM;
                        this.toPreferredSize();

                        if (pkg.makeEditorVisible === true) {
                            var p  = L.toParentOrigin(this.input);

                            if (p.y + this.input.height > this.height) {
                                this.constraints = L.HORIZONTAL | L.TOP;
                            }
                        }

                        ui.showWindow(d, "mdi", this);
                        ui.activateWindow(this);
                    }
                }
            };

            this.isShiftOn = function() {
                return (this.mask & ui.KeyEvent.M_SHIFT) > 0;
            };

            this.isAltOn = function() {
                return (this.mask & ui.KeyEvent.M_ALT) > 0;
            };

            this.isCtrlOn = function() {
                return (this.mask & ui.KeyEvent.M_CTRL) > 0;
            };

            this.onMask = function(mask, vk) {
                var oldMask = this.mask;
                if (mask != 0) {
                    this.mask = mask | this.mask;
                    if (oldMask != this.mask) {
                        this.vkMaskUpdated(vk, oldMask, this.mask);
                    }
                }
            };

            this.offMask = function(mask, vk) {
                var oldMask = this.mask;
                if (mask != 0) {
                    this.mask = mask ^ this.mask;
                    if (oldMask != this.mask) {
                        this.vkMaskUpdated(vk, oldMask, this.mask);
                    }
                }
            };

            this.vkOptionSelected = function(vkey, index, option) {
                this._.vkOptionSelected(vkey, index, option);
            };

            this.vkMaskUpdated = function(vkey, om, nm) {
                this.eachKey(function(g, k) {
                    if (k != vkey && k.mask != 0 && k.mask != null) {
                        k.$syncMask(nm);
                    }
                });

                this._.vkMaskUpdated(vkey, om, nm);
            };

            this.vkPressed = function (vk, code, ch, mask) {
                if (mask != 0) {
                    this.onMask(mask, vk);
                }

                this._.vkPressed(vk, code, ch, mask);

                KE.reset(this.input, ui.KeyEvent.PRESSED, code, ch, this.mask);
                ui.events.fireInputEvent(KE);
            };

            this.vkTyped = function (vk, code, ch, mask) {
                var ch = this.isShiftOn() ? ch.toUpperCase() : ch;
                this._.vkTyped(vk, code, ch, mask);
                KE.reset(this.input, ui.KeyEvent.TYPED, code, ch, this.mask);
                ui.events.fireInputEvent(KE);
            };

            this.vkReleased = function(vk, code, ch, mask) {
                if (mask != 0) {
                    this.offMask(mask, vk);
                }

                this._.vkReleased(vk, code, ch, mask);
                KE.reset(this.input, ui.KeyEvent.RELEASED, code, ch, this.mask);
                ui.events.fireInputEvent(KE);
            };

            this.setActiveGroup = function(name) {
                if (this.group != name) {
                    this.group = name;
                    for(var i = 0; i < this.kids.length; i++) {
                        var k = this.kids[i];
                        k.setVisible(k.name == name);
                    }
                    this.toPreferredSize();
                }
            };

            this.getGroupPan = function(name) {
                for(var i = 0; i < this.kids.length; i++) {
                    var k = this.kids[i];
                    if (k.name == name) return k;
                }
                return null;
            };

            this.setGroups = function(groups) {
                for(var k in groups) {
                    if (groups.hasOwnProperty(k)) {
                        this.addGroup(k, groups[k]);
                    }
                }
            };

            this.addGroup = function(name, layout) {
                var group = new ui.Panel(new pkg.VKLayout());
                group.name = name;

                for(var row = 0; row < layout.length; row++) {
                    var r = layout[row];
                    for(var col = 0; col < r.length; col++) {
                        var v = r[col];

                        if (zebra.isString(v)) {
                            if (pkg.PredefinedVKey.hasOwnProperty(v)) {
                                v = pkg.PredefinedVKey[v];
                            }
                        }

                        group.add({
                            row : row,
                            size: v.size
                        }, pkg.createVKey(v));
                    }
                }
                this.add(group);
            };
        },

        function setParent(p) {
            // mean the vk is removed from its parent
            if (p == null) {
                if (this.parent != null) {
                    // remove other VK related elements
                    for(var i = this.parent.kids.length - 1; i >= 0; i--) {
                        var kid = this.parent.kids[i];
                        if (kid.$isVkElement === true) {
                            kid.removeMe();
                        }
                    }
                }
            }

            this.$super(p);
        },

        function() {
            this.$super();
            this._ = new pkg.VKListeners();
        }
    ]);

    pkg.activateVK = function() {
        $vk = new pkg.VK();
        return $vk;
    };

    function $isVkElement(c) {
        var p = c;
        while (p != null && p.$isVkElement != true) p = p.parent;
        return p != null;
    }

    ui.events.addListener({
        focusGained : function (e) {
            if ($vk != null && $isVkElement(e.source) == false) {
                pkg.showVK(zebra.instanceOf(e.source, ui.TextField) ? e.source : null);
            }
        },

        mousePressed : function(e) {
            if ($vk != null) {
                if ($vk.input != null && $vk.input != e.source && $isVkElement(e.source) == false && L.isAncestorOf($vk, e.source) == false) {
                    pkg.showVK(null);
                }

                // if input component holds focus, virtual keyboard is
                // hidden and we press on the input component
                if ($vk.parent == null && zebra.instanceOf(e.source, ui.TextField)) {
                    pkg.showVK(e.source);
                }
            }
        }
    });

    new ui.Bag(pkg).load(pkg.$url + "vk.json");

    /**
     * @for
     */
});

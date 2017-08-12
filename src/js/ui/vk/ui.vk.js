zebkit.package("ui.vk", function(pkg, Class) {
    var ui = zebkit.ui;

    pkg.$vk = null;
    pkg.makeEditorVisible = true;

    pkg.KeyEvent = Class(ui.event.KeyEvent, [
        function $prototype() {
            this.withMasks = function(masks) {
                this.altKey   = false;
                this.shiftKey = false;
                this.ctrlKey  = false;
                this.metaKey  = false;

                for(var k in masks) {
                    this[k] = masks[k];
                }
            };
        }
    ]);


    /**
     * Virtual keyboard implementation
     * @class  zebkit.ui.vk
     * @access package
     */
    pkg.VKLayout = Class(zebkit.layout.Layout, [
        function $prototype () {
            this.ratio = this.gap = 2;

            this.doLayout = function(t) {
                var m     =  this.keyboardMetrics(t),
                    rows  =  m.rows,
                    row   = -1,
                    x     =  0,
                    y     =  0,
                    i     =  0,
                    r     =  null,
                    left  =  t.getLeft(),
                    top   =  t.getTop(),
                    ew    =  t.width - left - t.getRight(),
                    extra =  1000000;

                // compute extra alignment for fixed size keys to
                // take larger than preferred size horizontal
                // space
                for(i = 0; i < rows.length; i++) {
                    if (rows[i].fixKeys !== 0) {
                        r  = rows[i];
                        var w  = (r.keys > 0 ? r.keys - 1 : 0) * this.gap + m.fixKeyWidth * r.fixKeys + r.occupiedHorSpace,
                            ex = ew - w;

                        ex =  Math.round(ex/r.fixKeys);
                        if (extra > ex) {
                            extra = ex;
                        }
                    }
                }

                // calculate final fixed size key size
                if (extra !== 1000000 && extra !== 0) {
                    m.fixKeyWidth += extra;

                    // check if key proportion is good, otherwise again correct fixed key size
                    if (m.fixKeyWidth / m.rowHeight > this.ratio) {
                        m.fixKeyWidth = Math.floor(m.rowHeight * this.ratio);
                    }

                    // re-calculate keyboard width
                    m.width = this.maxRowWidth(rows, m.fixKeyWidth);
                }

                for (i = 0; i < t.kids.length; i++) {
                    var k = t.kids[i], ctr = k.constraints;

                    r = m.rows[ctr.row];

                    if (row !== ctr.row) {
                        row ++;
                        y += (row === 0 ? top : this.gap + m.rowHeight);

                        // compute actual width the row occupies
                        var aw = r.fixKeys * m.fixKeyWidth + r.occupiedHorSpace + (r.keys > 0 ? r.keys - 1 : 0) * this.gap;

                        if (r.stretchedKeys === 0) {
                            x = left + Math.floor((ew - aw) / 2);
                        } else {
                            x  = left + Math.floor((ew - m.width) / 2);
                            extra = Math.floor((m.width - aw) / r.stretchedKeys);
                        }
                    }

                    if (k.isVisible === true) {
                        if (typeof ctr.size === 'undefined' || ctr.size === null) {
                            k.setSize(m.fixKeyWidth, m.rowHeight);
                        } else {
                            var ps = k.getPreferredSize();
                            if (ctr.size === "stretched") {
                                k.setSize(ps.width + extra, m.rowHeight);
                            } else {
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
                    if (w > width) {
                        width = w;
                    }
                }
                return width;
            };

            this.keyboardMetrics = function(t) {
                var rows             = [],
                    rowHeight        = 0,
                    fixKeyWidth      = 0;

                for(var row = 0;  ;row++) {
                    var r = this.rowMetric(row, t);
                    if (r === null) {
                        break;
                    }

                    rows.push(r);
                    if (r.fixKeyMaxWidth > fixKeyWidth) {
                        fixKeyWidth = r.fixKeyMaxWidth;
                    }

                    if (r.rowHeight > rowHeight) {
                        rowHeight   = r.rowHeight;
                    }
                }

                // check if key proportion is good, otherwise again correct fixed key size
                if (fixKeyWidth / rowHeight > this.ratio) {
                    fixKeyWidth = Math.floor(rowHeight * this.ratio);
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
                    if (ctr !== null && ctr.row > row) {
                        break;
                    }

                    if (ctr.row === row && k.isVisible === true) {
                        var ps = k.getPreferredSize();

                        if (typeof ctr.size === 'undefined' || ctr.size === null) {
                            if (fixKeyMaxWidth < ps.width) {
                                fixKeyMaxWidth = ps.width;
                            }
                            fixKeys ++;
                        } else {
                            if (ctr.size === "ps") {
                                prefKeys++;
                            } else {
                                stretchedKeys++;
                                stretchedHorSpace += ps.width;
                            }
                            occupiedHorSpace += ps.width;
                        }

                        if (rowHeight < ps.height) {
                            rowHeight = ps.height;
                        }
                    }
                }

                // no row exists
                if (ctr === null || ctr.row < row) {
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

    pkg.ShiftKeyArrow = zebkit.Class(zebkit.draw.View, [
        function(bg, lnCol) {
            if (arguments.length > 1) {
                this.lineColor = lnCol;
            }

            if (arguments.length > 0) {
                this.bg = bg;
            }
        },

        function $prototype() {
            this.prefSize = 10;
            this.lineColor = "white";
            this.bg = null;

            //       / \A
            //      /   \
            //     /     \
            //    / C  F  \
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

                var cx = x + Math.floor(w / 2),
                    ww = Math.floor(h / 2),
                    dw = Math.floor(h / 4),
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

                if (this.lineColor !== null) {
                    g.setColor(this.lineColor);
                    g.stroke();
                }

                if (this.bg !== null) {
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
        }
    ]);

    pkg.HintPan = Class(ui.Panel, [
        function() {
            this.$super();
            this.add(new this.clazz.Label(""));
        },

        function $clazz() {
            this.Label = Class(ui.Label, []);
        },

        function setValue(v) {
            this.kids[0].setValue(v);
        }
    ]);

    var tooltip = null;

    pkg.VKeyBase = Class(ui.Button, [
        function(v) {
            if (zebkit.isString(v) === false &&
                zebkit.instanceOf(v, ui.Panel) === false &&
                (v instanceof Image) === false)
            {
                v = zebkit.draw.$view(v);

                if (zebkit.instanceOf(v, zebkit.draw.ViewSet)) {
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
                this.setLayout(new zebkit.layout.StackLayout());
            } else {
                this.$super(v);
            }
        },

        function $clazz() {
            this.padding = 1;
            this.Label = Class(ui.Label, []);
            this.Label.font = new zebkit.Font("Arial", "bold", 14);
        },

        function $prototype() {
            this.$isVkElement = true;
            this.canHaveFocus = false;
            this.statusViews  = null;

            this.showHint = function(ch) {
                this.hideHint();

                if (tooltip === null) {
                    tooltip = new pkg.HintPan();
                }

                tooltip.setValue(ch);
                tooltip.toPreferredSize();
                var rl = zebkit.layout.toParentOrigin(this);
                if (rl.y - tooltip.height > 0) {
                    tooltip.setLocation(rl.x, rl.y - tooltip.height);
                } else {
                    tooltip.setLocation(rl.x, rl.y + this.height);
                }
                tooltip.setSize(this.width, tooltip.height);
                ui.showWindow(this, "info", tooltip);
            };

            this.hideHint = function() {
                if (tooltip !== null) {
                    tooltip.removeMe();
                }
            };

            this.findVK = function(id) {
                var p = this.parent;
                while (p !== null && typeof p[id] === 'undefined') {
                    p = p.parent;
                }
                return p;
            };

            this.setLabel = function(l) {
                if (zebkit.instanceOf(this.kids[0], ui.Label)) {
                    this.kids[0].setValue(l);
                }
            };

            this.getLabel = function() {
                return zebkit.instanceOf(this.kids[0], ui.Label) ? this.kids[0].getValue() : null;
            };

            this.nextStatusView = function() {
                if (this.statusViews !== null) {
                    this.statusKeyIndex = (this.statusKeyIndex + 1) % this.statusViewKeys.length;
                    this.statusViews.activate(this.statusViewKeys[this.statusKeyIndex]);
                    this.repaint();
                }
            };
        },

        function pointerPressed(e) {
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
    //      mask: "altKey",
    //      label | view | icon : <?>
    //   }
    //
    // 3) Character shortcut:
    // "A"
    //
    // 4) Multiple single char VK variants:
    //    "ABCD"
    //
    // 5) Multiple character single key
    //    [ "AA" ]  or with variants [ "AA", ["BB"], ["CC"] ]
    //
    pkg.VKey = Class(pkg.VKeyBase, [
        function(t) {
            if (zebkit.isString(t)) {
                t = { ch : t };
            }

            this.mask   = typeof t.mask   === 'undefined' ? null  : t.mask;
            this.ch     = typeof t.ch     === 'undefined' ? null  : t.ch;
            this.code   = typeof t.code   === 'undefined' ? 0     : t.code;
            this.hint   = typeof t.hint   === 'undefined' ? null  : t.hint;
            this.repeat = typeof t.repeat === 'undefined' ? false : t.repeat;

            if (this.repeat !== false) {
                this.setFireParams(true, t.repeat);
            }

            this.$super(t.view || t.icon || t.label || this.ch);
        },

        function $prototype() {
            this.$sticked = false;

            this.$syncMask = function(mask, value) {
                if (this.mask === mask && value === true) {
                    this.$sticked = !this.$sticked;
                    this.setState(this.$sticked ? "pressed.over" : "over");
                    this.nextStatusView();
                }
            };

            this.fired = function() {
                if (this.ch !== null) {
                    this.fireVkTyped(this.code, this.ch, this.mask);
                } else {
                    // handle period keys
                    if (this.firePeriod > 0 &&
                        this.$repeatTask !== null &&
                        this.$repeatTask.isStarted === true)
                    {

                        this.fireVkPressed(this.code, this.ch, this.mask);
                    }
                }
            };

            this.fireVkTyped = function(code, ch, mask) {
                var vk = this.findVK("vkTyped");
                if (vk !== null) {
                    vk.vkTyped(this, code, ch, mask);
                }
            };

            this.fireVkReleased = function(code, ch, mask) {
                this.hideHint();

                var vk = this.findVK("vkReleased");
                if (vk !== null) {
                    vk.vkReleased(this, code, ch, mask);
                }
            };

            this.fireVkPressed = function(code, ch, mask) {
                var vk = this.findVK("vkPressed");
                if (vk !== null) {
                    vk.vkPressed(this, code, ch, mask);
                }

                if (ch !== null && this.hint !== null) {
                    this.showHint(this.hint !== null ? ch : this.hint);
                }
            };

            this.upperCase = function() {
                if (this.ch !== null) {
                    var l = this.getLabel();
                    if (l !== null && l.toLowerCase() === this.ch.toLowerCase()) {
                        this.setLabel(l.toUpperCase());
                    }
                }
            };

            this.lowerCase = function() {
                if (this.ch !== null) {
                    var l = this.getLabel();
                    if (l !== null && l.toLowerCase() === this.ch.toLowerCase()) {
                        this.setLabel(l.toLowerCase());
                    }
                }
            };
        },

        function _pointerPressed(e) {
            if (this.$sticked === true) {
                this.$sticked = false;
                this.$getSuper("_pointerReleased").call(this, e);
                this.fireVkReleased(this.code, this.ch, this.mask);
            } else {
                this.$super(e);
                this.fireVkPressed(this.code, this.ch, this.mask);
                if (this.mask !== null) {
                    this.$sticked = true;
                }
            }
        },

        function _pointerReleased(e) {
            if (this.mask === null) {
                this.$super(e);
                this.fireVkReleased(this.code, this.ch, this.mask);
            }
        }
    ]);

    pkg.ArrowView = Class(zebkit.draw.ArrowView, [
        function $prototype() {
            this.gap = 0;
            this.color = "white";
            this.height = this.width = 8;
        }
    ]);

    pkg.PredefinedVKey = {
        shift : {
            view: {
                "on" : new pkg.ShiftKeyArrow(),
                "off": new pkg.ShiftKeyArrow()
            },
            code : "Shift",
            mask : "shiftKey"
        },

        left: {
            code : "ArrowLeft",
            view : new pkg.ArrowView("left"),
            firePeriod: 150
        },

        right: {
            code : "ArrowRight",
            view : new pkg.ArrowView("right"),
            repeat: 150
        },

        up: {
            code : "ArrowUp",
            view : new pkg.ArrowView("top"),
            repeat: 150
        },

        down: {
            code : "ArrowDown",
            view : new pkg.ArrowView("bottom"),
            repeat: 150
        },

        enter : {
            //          |  A
            //     E    |
            // C /______|  B
            //   \ D
            //
            view: zebkit.draw.$view(function(g, x, y, w, h, d) {
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
            code: "Backspace",
            label: "<=",
            view2: zebkit.draw.$view(function(g, x, y, w, h, d) {
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
    };

    pkg.VKeyOption = Class(pkg.VKeyBase, [
        function (v, options) {
            this.$super(v);
            this.menu = new this.clazz.Menu(options);
            this.menu.toPreferredSize();
            this.menu.$isVkElement = true;

            this.options = options.slice(0);
            var $this = this;
            this.menu.on(function(src, i) {
                if (src.selectedIndex >= 0) {
                    var vk = $this.findVK("vkOptionSelected");
                    if (vk !== null) {
                        vk.vkOptionSelected($this,
                                            src.selectedIndex,
                                            $this.options[src.selectedIndex]);
                    }
                }
            });
        },

        function $clazz() {
            this.Menu = Class(ui.Menu, [
                function $prototype() {
                    this.canHaveFocus = false;
                }
            ]);
        },

        function $prototype() {
            this.fired = function() {
                if (this.menu.parent !== null) {
                    this.menu.removeMe();
                } else {
                    var o = zebkit.layout.toParentOrigin(this);
                    this.menu.select(-1);
                    this.menu.toPreferredSize();
                    this.menu.setLocation(o.x, o.y - this.menu.height);
                    ui.showPopupMenu(this, this.menu);
                }
            };
        }
    ]);

    var RL = Class(zebkit.layout.RasterLayout, [
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

    KE = new pkg.KeyEvent();
    KE.device = "vkeyboard";

    pkg.VKeys = Class(pkg.VKey, [
        function(chars) {
            if (chars.length < 2) {
                throw new Error();
            }

            this.$super( {
                ch    : chars[0],
                label : new this.clazz.KeysLabelPan(chars)
            });

            if (chars.length > 2) {
                this.keysPopupPan = new this.clazz.KeysPopupPan();

                var $this = this;
                for(var i = 1; i < chars.length; i++) {
                    var key = pkg.createVKey(chars[i]);
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
            } else {
                this.altCh = chars[1];
            }
        },

        function $clazz () {
            this.layout = new zebkit.layout.BorderLayout();

            this.SmallLabel = Class(ui.Label, []);
            this.SmallLabel.font = new zebkit.Font(pkg.VKey.Label.font.name, Math.floor((2*pkg.VKey.Label.font.height)/3));

            this.KeysPopupPan = Class(ui.Panel, [
                function $clazz() {
                    this.layout     = new zebkit.layout.FlowLayout("left", "center", "horizontal", 6);
              		this.padding    = 6;
              		this.border     = new zebkit.draw.Border("plain");
              		this.background = "rgba(200,200,200,0.8)";
                },

                function $prototype() {
                    this.$dontGrabFocus = this.$isVkElement = true;
                },

                function() {
                    this.$super();
                }
            ]);

            this.KeysLabelPan = Class(ui.Panel, [
                function $clazz() {
                    this.layout = new RL(true);
                },

                function(chars) {
                    this.$super();
                    this.constraints = "center";

                    var mainLab = new pkg.VKeys.Label(chars[0]),
                        altLab  = new pkg.VKeys.SmallLabel(chars.length === 2 ? chars[1] : "...");

                    mainLab.constraints = "center";
                    altLab.constraints  = "topRight";
                    this.add(mainLab);
                    this.add(altLab);

                    this.mainLab = mainLab;
                }
            ]);
        },

        function $prototype() {
            this.keysPopupPan = null;

            this.getLabel = function() {
                return this.kids[0].mainLab.getValue();
            };

            this.setLabel = function(l) {
                this.kids[0].mainLab.setValue(l);
            };

            this.showKeysPopupPan = function() {
                this.hideHint();

                if (this.keysPopupPan === null) {
                    this.$counter = (this.$counter + 1 ) % 2;
                    this.showHint(this.$counter === 0 ? this.ch : this.altCh);
                } else {
                    this.$pressed.shutdown();

                    var rl = zebkit.layout.toParentOrigin(this);
                    for(var i = 0; i < this.keysPopupPan.kids.length; i++) {
                        this.keysPopupPan.kids[i].setPreferredSize(this.width, this.height);
                    }

                    this.keysPopupPan.toPreferredSize();
                    this.keysPopupPan.setLocation(rl.x, rl.y - this.keysPopupPan.height);

                    this.keysPopupPan.winActivated = function(e) {
                        if (e.isActive === false) {
                            e.source.removeMe();
                        }
                    };

                    ui.showWindow(this, "mdi", this.keysPopupPan);
                    ui.makeFullyVisible(this.keysPopupPan);
                    ui.activateWindow(this.keysPopupPan);

                    this.setState("out");
                }
            };

            this.hideKeysPopupPan = function() {
                if (this.keysPopupPan !== null) {
                    this.keysPopupPan.removeMe();
                }
            };
        },

        function fireVkPressed(code, ch, mask) {
            this.$counter = 0;
            this.hideKeysPopupPan();
            this.$super(code, ch, mask);

            var $this = this;
            this.$pressed = zebkit.util.tasksSet.run(function(t) {
                $this.showKeysPopupPan(t);
            }, 700, 700);
        },

        function fireVkTyped(code, ch, mask) {
            if (this.keysPopupPan === null) {
                ch = this.$counter > 0 ? this.altCh : this.ch;
                this.$super(ch.charCodeAt(0), ch, mask);
            } else  if (this.keysPopupPan.parent === null) {
                this.$super(code, ch, mask);
            }
        },

        function fireVkReleased(code, ch, mask) {
            this.$pressed.shutdown();
            this.$super(code, ch, mask);
        }
    ]);

    pkg.showVK = function(input) {
        pkg.$vk.show(input);
    };

    pkg.getVK = function() {
        return pkg.$vk;
    };

    pkg.createVKey = function(d) {
        if (zebkit.isString(d)) {
            if (pkg.PredefinedVKey.hasOwnProperty(d.toLowerCase())) {
                d = pkg.PredefinedVKey[d.toLowerCase()];
            } else if (d.length > 1) {
                return new pkg.VKeys(d);
            }
        } else {
            if (Array.isArray(d)) {
        		return d.length === 1 ? new pkg.VKey (d[0])
                                      : new pkg.VKeys(d);
            } else if (d.hasOwnProperty("vkey")) {
                return d.vkey;
            }
        }

        return new pkg.VKey(d);
    };

    pkg.VK = Class(ui.Panel, [
        function() {
            this.$super();
            this.masks = {
                shiftKey : false,
                metaKey  : false,
                ctrlKey  : false,
                altKey   : false
            };
        },

        function $clazz() {
            this.Listeners = zebkit.util.ListenersClass("vkMaskUpdated", "vkOptionSelected");
        },

        function $prototype() {
            this.$dontGrabFocus = true;

            this.eachGroupKey = function(g, f) {
                g = this.getGroupPan(g);
                if (g !== null) {
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
                this.removeMe();
                if (d !== null) {
                    this.constraints = "bottom";
                    this.toPreferredSize();

                    if (pkg.makeEditorVisible === true) {
                        var p = zebkit.layout.toParentOrigin(d);
                        if (p.y + d.height > this.height) {
                            this.constraints = "top";
                        }
                    }

                    ui.showWindow(d, "mdi", this);
                    var win = this.getCanvas().getLayer("win");
                    this.setSize(win.width - win.getLeft() - win.getRight(), this.height);
                    ui.activateWindow(this);
                }
            };

            this.onMask = function(mask, vk) {
                if (mask !== null && (this.masks.hasOwnProperty(mask) === false || this.masks[mask] !== true)) {
                    this.masks[mask] = true;
                    this.vkMaskUpdated(vk, mask, true);
                }
            };

            this.offMask = function(mask, vk) {
                if (mask !== null && this.masks.hasOwnProperty(mask) && this.masks[mask] === true) {
                    this.masks[mask] = false;
                    this.vkMaskUpdated(vk, mask, false);
                }
            };

            this.vkOptionSelected = function(vkey, index, option) {
                this.fire("vkOptionSelected", [vkey, index, option]);
            };

            this.hasMaskSet = function(mask) {
                if (mask.match(/^[a-z]+Key$/) === null) {
                    throw new Error("Invalid mask '" + mask + "'");
                }
                return this.masks.hasOwnProperty(mask) && this.masks[mask] === true;
            };

            this.vkMaskUpdated = function(vkey, mask, value) {
                if (typeof mask === 'undefined' || mask === null) {
                    throw new Error();
                }

                this.eachKey(function(group, key) {
                    if (key !== vkey && key.mask !== null && key.mask === mask) {
                        key.$syncMask(mask, value);
                    }
                });

                this.fire("vkMaskUpdated", [vkey, mask, value]);
            };

            this.vkPressed = function (vk, code, key, mask) {
                if (mask !== null) {
                    this.onMask(mask, vk);
                }

                KE.key = key;
                KE.code = code;
                KE.withMasks(this.masks);
                this.getCanvas().$keyPressed(KE);
            };

            this.vkTyped = function (vk, code, key, mask) {
                KE.key = this.hasMaskSet("shiftKey") ? key.toUpperCase() : key;
                KE.code = code;
                KE.withMasks(this.masks);
                this.getCanvas().$keyTyped(KE);
            };

            this.vkReleased = function(vk, code, key, mask) {
                if (mask !== null) {
                    this.offMask(mask, vk);
                }
                KE.key = key;
                KE.code = code;
                KE.withMasks(this.masks);
                this.getCanvas().$keyReleased(KE);
            };

            this.setActiveGroup = function(name) {
                if (this.group !== name) {
                    this.group = name;
                    for(var i = 0; i < this.kids.length; i++) {
                        var k = this.kids[i];
                        k.setVisible(k.name === name);
                    }

                    // adjust size if VK is shown
                    var can = this.getCanvas();
                    if (can !== null && can.hasOwnProperty("win") === true) {
                        var win = can.getLayer("win");
                        this.toPreferredSize();
                        this.setSize(win.width - win.getLeft() - win.getRight(), this.height);
                    }
                }
            };

            this.getGroupPan = function(name) {
                for(var i = 0; i < this.kids.length; i++) {
                    var k = this.kids[i];
                    if (k.name === name) {
                        return k;
                    }
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

                        if (zebkit.isString(v)) {
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
            if (p === null && this.parent !== null) {
                // remove other VK related elements
                for(var i = this.parent.kids.length - 1; i >= 0; i--) {
                    var kid = this.parent.kids[i];
                    if (kid.$isVkElement === true) {
                        kid.removeMe();
                    }
                }
            }

            this.$super(p);
        }
    ]);

    pkg.activateVK = function() {
        pkg.$vk = new pkg.VK();
        return pkg.$vk;
    };

    function $isVkElement(c) {
        var p = c;
        while (p !== null && p.$isVkElement !== true) {
            p = p.parent;
        }
        return p !== null;
    }

    ui.events.on({
        focusGained : function (e) {
            if (pkg.$vk !== null && $isVkElement(e.source) === false && typeof e.source.vkMode !== 'undefined') {
                pkg.showVK(zebkit.instanceOf(e.source, ui.TextField) ? e.source : null);
            }
        },

        pointerPressed : function(e) {
            if (pkg.$vk !== null) {
                if (pkg.$vk.parent !== null &&
                    $isVkElement(e.source) === false &&
                    zebkit.layout.isAncestorOf(pkg.$vk, e.source) === false)
                {
                    pkg.showVK(null);
                }

                // if input component holds focus, virtual keyboard is
                // hidden and we press on the input component
                if (pkg.$vk.parent === null && typeof e.source.vkMode !== 'undefined') {
                    pkg.showVK(e.source);
                }
            }
        }
    });

    ui.$configWith(pkg);
});

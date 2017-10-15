zebkit.package("ui", function(pkg, Class) {
    /**
     *  Border panel UI component class. The component renders titled border around the
     *  given  content UI component. Border title can be placed on top or
     *  bottom border line and aligned horizontally (left, center, right). Every
     *  zebkit UI component can be used as a border title element.
     *  @param {zebkit.ui.Panel|String} [title] a border panel title. Can be a
     *  string or any other UI component can be used as the border panel title
     *  @param {zebkit.ui.Panel} [content] a content UI component of the border
     *  panel
     *  @param {Integer} [constraints] a title constraints. The constraints gives
     *  a possibility to place border panel title in different places. Generally
     *  the title can be placed on the top or bottom part of the border panel.
     *  Also the title can be aligned horizontally.
     *
     *  @example
     *
     *      // create border panel with a title located at the
     *      // top and aligned at the canter
     *      var bp = new zebkit.ui.BorderPan("Title",
     *                                       new zebkit.ui.Panel(),
     *                                       "top", "center");
     *
     *  @constructor
     *  @class zebkit.ui.BorderPan
     *  @extends zebkit.ui.Panel
     */
    pkg.BorderPan = Class(pkg.Panel, [
        function(title, center, o, a) {
            if (arguments.length > 0) {
                title = pkg.$component(title, this);
            }

            if (arguments.length > 2) {
                this.orient = o;
            }

            if (arguments.length > 3) {
                this.alignment = a;
            }

            this.$super();
            if (arguments.length > 0) {
                this.add("caption", title);
            }

            if (arguments.length > 1) {
                this.add("center", center);
            }
        },

        function $clazz() {
            this.Label = Class(pkg.Label, []);
            this.ImageLabel = Class(pkg.ImageLabel, []);
            this.Checkbox = Class(pkg.Checkbox, []);
        },

        function $prototype() {
            /**
             * Border panel label content component
             * @attribute content
             * @type {zebkit.ui.Panel}
             * @readOnly
             */
            this.content = null;

            /**
             * Border panel label component
             * @attribute label
             * @type {zebkit.ui.Panel}
             * @readOnly
             */
             this.label = null;

            /**
             * Vertical gap. Define top and bottom paddings between
             * border panel border and the border panel content
             * @attribute vGap
             * @type {Integer}
             * @readOnly
             * @default 0
             */

             /**
              * Horizontal gap. Define left and right paddings between
              * border panel border and the border panel content
              * @attribute hGap
              * @type {Integer}
              * @readOnly
              * @default 0
              */
            this.vGap = this.hGap = 2;

             /**
              * Border panel label indent
              * @type {Integer}
              * @attribute indent
              * @readOnly
              * @default 4
              */
            this.indent = 4;

            /**
             * Border panel title area arrangement. Border title can be placed
             * either at the top or bottom area of border panel component.
             * @type {String}
             * @attribute orient
             * @readOnly
             * @default "top"
             */
            this.orient = "top";

            /**
             * Border panel title horizontal alignment.
             * @type {String}
             * @attribute alignment
             * @readOnly
             * @default "left"
             */
            this.alignment = "left";

             /**
              * Get the border panel title info. The information
              * describes a rectangular area the title occupies, the
              * title location and alignment
              * @return {Object} a title info
              *
              *  {
              *      x: {Integer}, y: {Integer},
              *      width: {Integer}, height: {Integer},
              *      orient: {Integer}
              *  }
              *
              * @method getTitleInfo
              * @protected
              */
            this.getTitleInfo = function() {
                return (this.label !== null) ? { x      : this.label.x,
                                                 y      : this.label.y,
                                                 width  : this.label.width,
                                                 height : this.label.height,
                                                 orient: this.orient }
                                             : null;
            };

            this.calcPreferredSize = function(target){
                var ps = this.content !== null && this.content.isVisible === true ? this.content.getPreferredSize()
                                                                                  : { width:0, height:0 };
                if (this.label !== null && this.label.isVisible === true){
                    var lps = this.label.getPreferredSize();
                    ps.height += lps.height;
                    ps.width = Math.max(ps.width, lps.width + this.indent);
                }
                ps.width  += (this.hGap * 2);
                ps.height += (this.vGap * 2);
                return ps;
            };

            this.doLayout = function (target){
                var h = 0,
                    right  = this.getRight(),
                    left   = this.getLeft(),
                    top    = this.orient === "top"   ? this.top    : this.getTop(),
                    bottom = this.orient === "bottom"? this.bottom : this.getBottom();

                if (this.label !== null && this.label.isVisible === true){
                    var ps = this.label.getPreferredSize();
                    h = ps.height;
                    this.label.setBounds((this.alignment === "left") ? left + this.indent
                                                                      : ((this.alignment === "right") ? this.width - right - ps.width - this.indent
                                                                                                       : Math.floor((this.width - ps.width) / 2)),
                                         (this.orient === "bottom") ? (this.height - bottom - ps.height) : top,
                                         ps.width, h);
                }

                if (this.content !== null && this.content.isVisible === true){
                    this.content.setBounds(left + this.hGap,
                                           (this.orient === "bottom" ? top : top + h) + this.vGap,
                                            this.width  - right - left - 2 * this.hGap,
                                            this.height - top - bottom - h - 2 * this.vGap);
                }
            };

            /**
             * Set vertical and horizontal paddings between the border panel border and the content
             * of the border panel
             * @param {Integer} vg a top and bottom paddings
             * @param {Integer} hg a left and right paddings
             * @method setGaps
             * @chainable
             */
            this.setGaps = function(vg, hg){
                if (this.vGap !== vg || hg !== this.hGap){
                    this.vGap = vg;
                    this.hGap = hg;
                    this.vrp();
                }
                return this;
            };

            /**
             * Set border panel title orientation. The title area can be
             * placed either at the top or at the bottom of border panel
             * component.
             * @param {String} o a border title orientation. Can be "top" or "bottom"
             * @method setOrientation
             * @chainable
             */
            this.setOrientation = function(o) {
                if (this.orient !== o) {
                    this.orient = zebkit.util.validateValue(o, "top", "bottom");
                    this.vrp();
                }
                return this;
            };

            /**
             * Set border panel title horizontal alignment.
             * @param {String} a a horizontal alignment. Use "left", "right", "center" as
             * the parameter value.
             * @method setAlignment
             * @chainable
             */
            this.setAlignment = function(a) {
                if (this.alignment !== a) {
                    this.alignment = zebkit.util.validateValue(a, "left", "right", "center");
                    this.vrp();
                }
                return this;
            };
        },

        function setBorder(br) {
            if (arguments.length === 0) {
                br = "plain";
            }

            br = zebkit.draw.$view(br);
            if (zebkit.instanceOf(br, zebkit.draw.TitledBorder) === false) {
                br = new zebkit.draw.TitledBorder(br, "center");
            }
            return this.$super(br);
        },

        function kidAdded(index, ctr, lw) {
            this.$super(index, ctr, lw);
            if ((ctr === null && this.content === null) || "center" === ctr) {
                this.content = lw;
            } else if (this.label === null) {
                this.label = lw;
            }
        },

        function kidRemoved(index,lw){
            this.$super(index, lw);
            if (lw === this.label) {
                this.label = null;
            } else if (this.content === lw) {
                this.content = null;
            }
        }
    ]);

    /**
     * Splitter panel UI component class. The component splits its area horizontally or vertically into two areas.
     * Every area hosts an UI component. A size of the parts can be controlled by pointer cursor dragging. Gripper
     * element is children UI component that can be customized. For instance:

          // create split panel
          var sp = new zebkit.ui.SplitPan(new zebkit.ui.Label("Left panel"),
                                          new zebkit.ui.Label("Right panel"));

          // customize gripper background color depending on its state
          sp.gripper.setBackground(new zebkit.draw.ViewSet({
               "over" : "yellow"
               "out" : null,
               "pressed.over" : "red"
          }));


     * @param {zebkit.ui.Panel} [first] a first UI component in splitter panel
     * @param {zebkit.ui.Panel} [second] a second UI component in splitter panel
     * @param {String} [o] an orientation of splitter element: "vertical" or "horizontal"
     * @class zebkit.ui.SplitPan
     * @constructor
     * @extends zebkit.ui.Panel
     */
    pkg.SplitPan = Class(pkg.Panel, [
        function(f,s,o) {
            if (arguments.length > 2) {
                this.orient = o;
            }

            this.$super();

            if (arguments.length > 0) {
                this.add("left", f);
                if (arguments.length > 1) {
                    this.add("right", s);
                }
            }

            this.add("center", new this.clazz.Bar(this));
        },

        function $clazz() {
            this.Bar = Class(pkg.EvStatePan, [
                function(target) {
                    this.target = target;
                    this.$super();
                },

                function $prototype() {
                    this.prevLoc = 0;

                    this.pointerDragged = function(e){
                        var x = this.x + e.x, y = this.y + e.y;
                        if (this.target.orient === "vertical"){
                            if (this.prevLoc !== x){
                                x = this.target.normalizeBarLoc(x);
                                if (x > 0){
                                    this.prevLoc = x;
                                    this.target.setGripperLoc(x);
                                }
                            }
                        } else {
                            if (this.prevLoc !== y) {
                                y = this.target.normalizeBarLoc(y);
                                if (y > 0){
                                    this.prevLoc = y;
                                    this.target.setGripperLoc(y);
                                }
                            }
                        }
                    };

                    this.pointerDragStarted = function (e){
                        var x = this.x + e.x,
                            y = this.y + e.y;

                        if (e.isAction()) {
                            if (this.target.orient === "vertical"){
                                x = this.target.normalizeBarLoc(x);
                                if (x > 0) {
                                    this.prevLoc = x;
                                }
                            } else {
                                y = this.target.normalizeBarLoc(y);
                                if (y > 0) {
                                    this.prevLoc = y;
                                }
                            }
                        }
                    };

                    this.pointerDragEnded = function(e){
                        var xy = this.target.normalizeBarLoc(this.target.orient === "vertical" ? this.x + e.x
                                                                                               : this.y + e.y);
                        if (xy > 0) {
                            this.target.setGripperLoc(xy);
                        }
                    };

                    this.getCursorType = function(t, x, y) {
                        return (this.target.orient === "vertical" ? pkg.Cursor.W_RESIZE
                                                                  : pkg.Cursor.N_RESIZE);
                    };
                }
            ]);
        },

        function $prototype() {
            /**
             * A minimal size of the left (or top) sizable panel
             * @attribute leftMinSize
             * @type {Integer}
             * @readOnly
             * @default 50
             */

            /**
             * A minimal size of right (or bottom) sizable panel
             * @attribute rightMinSize
             * @type {Integer}
             * @readOnly
             * @default 50
             */

            /**
             * Indicates if the splitter bar can be moved
             * @attribute isMoveable
             * @type {Boolean}
             * @readOnly
             * @default true
             */

            /**
             * A gap between gripper element and first and second UI components
             * @attribute gap
             * @type {Integer}
             * @readOnly
             * @default 1
             */

            /**
             * A reference to gripper UI component
             * @attribute gripper
             * @type {zebkit.ui.Panel}
             * @readOnly
             */

            /**
             * A reference to left (top) sizable UI component
             * @attribute leftComp
             * @type {zebkit.ui.Panel}
             * @readOnly
             */

            /**
             * A reference to right (bottom) sizable UI component
             * @attribute rightComp
             * @type {zebkit.ui.Panel}
             * @readOnly
             */

            this.leftMinSize = this.rightMinSize = 50;
            this.isMoveable = true;
            this.gap = 1;
            this.orient = "vertical";

            this.minXY = this.maxXY = 0;
            this.barLocation = 70;
            this.leftComp = this.rightComp = this.gripper = null;

            this.normalizeBarLoc = function(xy){
                if (xy < this.minXY) {
                    xy = this.minXY;
                } else if (xy > this.maxXY) {
                    xy = this.maxXY;
                }

                return (xy > this.maxXY || xy < this.minXY) ?  -1 : xy;
            };

            /**
             * Set split panel orientation.
             * @param  {String} o an orientation ("horizontal" or "vertical")
             * @method setOrientation
             * @chainable
             */
            this.setOrientation = function(o) {
                if (o !== this.orient) {
                    this.orient = zebkit.util.validateValue(o, "horizontal", "vertical");
                    this.vrp();
                }
                return this;
            };

            /**
             * Set gripper element location
             * @param  {Integer} l a location of the gripper element
             * @method setGripperLoc
             * @chainable
             */
            this.setGripperLoc = function(l){
                if (l !== this.barLocation){
                    this.barLocation = l;
                    this.vrp();
                }
                return this;
            };

            this.calcPreferredSize = function(c){
                var fSize = pkg.$getPS(this.leftComp),
                    sSize = pkg.$getPS(this.rightComp),
                    bSize = pkg.$getPS(this.gripper);

                if (this.orient === "horizontal"){
                    bSize.width = Math.max(((fSize.width > sSize.width) ? fSize.width : sSize.width), bSize.width);
                    bSize.height = fSize.height + sSize.height + bSize.height + 2 * this.gap;
                }
                else {
                    bSize.width = fSize.width + sSize.width + bSize.width + 2 * this.gap;
                    bSize.height = Math.max(((fSize.height > sSize.height) ? fSize.height : sSize.height), bSize.height);
                }
                return bSize;
            };

            this.doLayout = function(target){
                var right  = this.getRight(),
                    top    = this.getTop(),
                    bottom = this.getBottom(),
                    left   = this.getLeft(),
                    bSize  = pkg.$getPS(this.gripper);

                if (this.orient === "horizontal"){
                    var w = this.width - left - right;
                    if (this.barLocation < top) {
                        this.barLocation = top;
                    } else if (this.barLocation > this.height - bottom - bSize.height) {
                        this.barLocation = this.height - bottom - bSize.height;
                    }

                    if (this.gripper !== null){
                        if (this.isMoveable){
                            this.gripper.setBounds(left, this.barLocation, w, bSize.height);
                        } else {
                            this.gripper.toPreferredSize();
                            this.gripper.setLocation(Math.floor((w - bSize.width) / 2), this.barLocation);
                        }
                    }

                    if (this.leftComp !== null){
                        this.leftComp.setBounds(left, top, w, this.barLocation - this.gap - top);
                    }

                    if (this.rightComp !== null){
                        this.rightComp.setLocation(left, this.barLocation + bSize.height + this.gap);
                        this.rightComp.setSize(w, this.height - this.rightComp.y - bottom);
                    }
                } else {
                    var h = this.height - top - bottom;
                    if (this.barLocation < left) {
                        this.barLocation = left;
                    } else if (this.barLocation > this.width - right - bSize.width) {
                        this.barLocation = this.width - right - bSize.width;
                    }

                    if (this.gripper !== null){
                        if (this.isMoveable === true){
                            this.gripper.setBounds(this.barLocation, top, bSize.width, h);
                        } else {
                            this.gripper.setBounds(this.barLocation, Math.floor((h - bSize.height) / 2),
                                                   bSize.width, bSize.height);
                        }
                    }

                    if (this.leftComp !== null){
                        this.leftComp.setBounds(left, top, this.barLocation - left - this.gap, h);
                    }

                    if (this.rightComp !== null){
                        this.rightComp.setLocation(this.barLocation + bSize.width + this.gap, top);
                        this.rightComp.setSize(this.width - this.rightComp.x - right, h);
                    }
                }
            };

            /**
             * Set gap between gripper element and sizable panels
             * @param  {Integer} g a gap
             * @method setGap
             * @chainable
             */
            this.setGap = function (g){
                if (this.gap !== g){
                    this.gap = g;
                    this.vrp();
                }
                return this;
            };

            /**
             * Set the minimal size of the left (or top) sizeable panel
             * @param  {Integer} m  a minimal possible size
             * @method setLeftMinSize
             * @chainable
             */
            this.setLeftMinSize = function (m){
                if (this.leftMinSize !== m){
                    this.leftMinSize = m;
                    this.vrp();
                }
                return this;
            };

            /**
             * Set the minimal size of the right (or bottom) sizeable panel
             * @param  {Integer} m  a minimal possible size
             * @method setRightMinSize
             * @chainable
             */
            this.setRightMinSize = function(m){
                if (this.rightMinSize !== m){
                    this.rightMinSize = m;
                    this.vrp();
                }
                return this;
            };

            /**
             * Set the given gripper movable state
             * @param  {Boolean} b the gripper movable state.
             * @method setGripperMovable
             */
            this.setGripperMovable = function (b){
                if (b !== this.isMoveable){
                    this.isMoveable = b;
                    this.vrp();
                }
                return this;
            };
        },

        function kidAdded(index, ctr, c){
            this.$super(index, ctr, c);

            if ((ctr === null && this.leftComp === null) || "left" === ctr) {
                this.leftComp = c;
            } else if ((ctr === null && this.rightComp === null) || "right" === ctr) {
                this.rightComp = c;
            } else {
                if ("center" === ctr) {
                    this.gripper = c;
                } else {
                    throw new Error("" + ctr);
                }
            }
        },

        function kidRemoved(index,c){
            this.$super(index, c);
            if (c === this.leftComp) {
                this.leftComp = null;
            } else {
                if (c === this.rightComp) {
                    this.rightComp = null;
                } else if (c === this.gripper) {
                    this.gripper = null;
                }
            }
        },

        function resized(pw,ph) {
            var ps = this.gripper.getPreferredSize();
            if (this.orient === "vertical"){
                this.minXY = this.getLeft() + this.gap + this.leftMinSize;
                this.maxXY = this.width - this.gap - this.rightMinSize - ps.width - this.getRight();
            } else {
                this.minXY = this.getTop() + this.gap + this.leftMinSize;
                this.maxXY = this.height - this.gap - this.rightMinSize - ps.height - this.getBottom();
            }
            this.$super(pw, ph);
        }
    ]);

    /**
     * Extendable  UI panel class. Implement collapsible panel where
     * a user can hide of show content by pressing special control
     * element:

            // create extendable panel that contains list as its content
            var ext = zebkit.ui.CollapsiblePan("Title", new zebkit.ui.List([
                "Item 1",
                "Item 2",
                "Item 3"
            ]));


     * @constructor
     * @class zebkit.ui.CollapsiblePan
     * @extends zebkit.ui.Panel
     * @param {zebkit.ui.Panel|String} l a title label text or
     * @param {zebkit.ui.Panel} c a content of the extender panel
     * component
     */

     /**
      * Fired when extender is collapsed or extended

             var ex = new zebkit.ui.CollapsiblePan("Title", pan);
             ex.on(function (src, isCollapsed) {
                 ...
             });

      * @event fired
      * @param {zebkit.ui.CollapsiblePan} src an extender UI component that generates the event
      * @param {Boolean} isCollapsed a state of the extender UI component
      */
    pkg.CollapsiblePan = Class(pkg.Panel, [
        function(lab, content){
            this.$super();

            this.headerPan = new this.clazz.Header();
            this.togglePan = new this.clazz.Toogle();
            this.togglePan.on(this);

            this.add("top", this.headerPan);

            this.headerPan.add(this.togglePan);
            this.headerPan.add(pkg.$component(arguments.length === 0 || lab === null ? "" : lab, this));

            if (arguments.length > 1 && content !== null) {
                this.contentPan = content;
                content.setVisible(this.getValue());
                this.add("center", this.contentPan);
            }
        },

        function $clazz() {
            this.Label = Class(pkg.Label,[]);

            this.ImageLabel = Class(pkg.ImageLabel, []);

            this.Header = Class(pkg.EvStatePan, []);

            this.Toogle = Class(pkg.Checkbox, [
                function $prototype() {
                    this.cursorType = pkg.Cursor.HAND;
                },

                function $clazz() {
                    this.layout = new zebkit.layout.FlowLayout();
                }
            ]);

            this.GroupPan = Class(pkg.Panel, [
                function() {
                    this.group = new pkg.Group(true);

                    this.$super();
                    for(var i = 0; i < arguments.length; i++) {
                        arguments[i].togglePan.setGroup(this.group);
                        this.add(arguments[i]);
                        arguments[i].setBorder(null);
                    }
                },

                function $prototype() {
                    this.doLayout = function(t) {
                        var y     = t.getTop(),
                            x     = t.getLeft(),
                            w     = t.width  - x - t.getRight(),
                            eh    = t.height - y - t.getBottom(),
                            kid   = null,
                            i     = 0;

                        // setup sizes for not selected item and calculate the vertical
                        // space that can be used for an expanded item
                        for(i = 0; i < t.kids.length; i++) {
                            kid = t.kids[i];
                            if (kid.isVisible) {
                                if (kid.getValue() === false) {
                                    var psh = kid.getPreferredSize().height;
                                    eh -= psh;
                                    kid.setSize(w, psh);
                                }
                            }
                        }

                        for(i = 0; i < t.kids.length; i++) {
                            kid = t.kids[i];
                            if (kid.isVisible) {
                                kid.setLocation(x, y);
                                if (kid.getValue()) {
                                    kid.setSize(w, eh);
                                }
                                y += kid.height;
                            }
                        }
                    };

                    this.calcPreferredSize = function(t) {
                        var w = 0,
                            h = 0;

                        for(var i = 0; i < t.kids.length; i++) {
                            var kid = t.kids[i];
                            if (kid.isVisible) {
                                var ps = kid.getPreferredSize();
                                h += ps.height;
                                if (ps.width > w) {
                                    w = ps.width;
                                }
                            }
                        }
                        return { width:w, height:h };
                    };

                    this.compAdded = function(e) {
                        if (this.group.selected === null) {
                            e.kid.setValue(true);
                        }
                    };

                    this.compRemoved = function(e) {
                        if (this.group.selected === e.kid.togglePan) {
                            e.kid.setValue(false);
                        }
                        e.kid.setGroup(null);
                    };
                }
            ]);
        },

        function $prototype() {
            /**
             * Title panel
             * @type {zebkit.ui.Panel}
             * @attribute headerPan
             * @readOnly
             */
            this.headerPan = null;

            /**
             * Content panel
             * @type {zebkit.ui.Panel}
             * @readOnly
             * @attribute contentPan
             */
            this.contentPan = null;

            /**
             * Toggle UI element
             * @type {zebkit.ui.Checkbox}
             * @readOnly
             * @attribute togglePan
             */
            this.togglePan = null;

            this.setValue = function(b) {
                if (this.togglePan !== null) {
                    this.togglePan.setValue(b);
                }
                return this;
            };

            this.getValue = function(b) {
                return (this.togglePan !== null) ? this.togglePan.getValue() : false;
            };

            this.setGroup = function(g) {
                if (this.togglePan !== null) {
                    this.togglePan.setGroup(g);
                }
                return this;
            };

            this.toggle = function() {
                if (this.togglePan !== null) {
                    this.togglePan.toggle();
                }
                return this;
            };

            this.fired = function(src) {
                var value = this.getValue();
                if (this.contentPan !== null) {
                    this.contentPan.setVisible(value);
                }
            };

            this.compRemoved = function(e) {
                if (this.headerPan === e.kid) {
                    this.headerPan = null;
                } else if (e.kid === this.contentPan) {
                    this.contentPan = null;
                } else if (e.kid === this.togglePan) {
                    this.togglePan.off(this);
                    this.togglePan = null;
                }
            };
        }
    ]);

    /**
     * Status bar UI component class
     * @class zebkit.ui.StatusBar
     * @constructor
     * @param {Integer} [gap] a gap between status bar children elements
     * @extends zebkit.ui.Panel
     */
    pkg.StatusBarPan = Class(pkg.Panel, [
        function (gap){
            if (arguments.length === 0) {
                gap = 2;
            }

            this.setPadding(gap, 0, 0, 0);
            this.$super(new zebkit.layout.PercentLayout("horizontal", gap));
        },

        function $prototype() {
            /**
             * Set the specified border to be applied for status bar children components
             * @param {zebkit.draw.View} v a border
             * @method setBorderView
             * @chainable
             */
            this.setBorderView = function(v){
                if (v != this.borderView){
                    this.borderView = v;
                    for(var i = 0; i < this.kids.length; i++) {
                        this.kids[i].setBorder(this.borderView);
                    }
                    this.repaint();
                }
                return this;
            };
        },

        function insert(i,s,d){
            d.setBorder(this.borderView);
            this.$super(i, s, d);
        }
    ]);

    /**
     * Panel class that uses zebkit.layout.StackLayout as a default layout manager.
     * @class  zebkit.ui.StackPan
     * @param {zebkit.ui.Panel} [varname]* number of components to be added to the stack
     * panel
     * @constructor
     * @extends zebkit.ui.Panel
     */
    pkg.StackPan = Class(pkg.Panel, [
        function() {
            this.$super(new zebkit.layout.StackLayout());
            for(var i = 0; i < arguments.length; i++) {
                this.add(arguments[i]);
            }
        }
    ]);
});
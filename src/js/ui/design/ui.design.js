zebkit.package("ui.design", function(pkg, Class) {
    var ui = pkg.cd("..");

    /**
     * The package contains number of UI components that can be helpful to
     * perform visual control of an UI component. You can control an UI component
     * size and location.
     *
     *     var root = (new zebkit.ui.zCanvas(400, 300)).root;
     *     root.setRasterLayout();
     *     root.setPadding(8);
     *
     *     // Add check box component wrapped with shaper panel
     *     // to control the component size and location
     *     var ch = new zebkit.ui.Checkbox("Check-box")
     *                           .setBounds(10, 10, 100, 30);
     *
     *     root.add(new zebkit.ui.design.ShaperPan(ch));
     *
     * @class  zebkit.ui.design
     * @access package
     */
    var CURSORS = {
        left        : ui.Cursor.W_RESIZE,
        right       : ui.Cursor.E_RESIZE,
        top         : ui.Cursor.N_RESIZE,
        bottom      : ui.Cursor.S_RESIZE,
        topLeft     : ui.Cursor.NW_RESIZE,
        topRight    : ui.Cursor.NE_RESIZE,
        bottomLeft  : ui.Cursor.SW_RESIZE,
        bottomRight : ui.Cursor.SE_RESIZE,
        center      : ui.Cursor.MOVE,
        none        : ui.Cursor.DEFAULT
    };

    /**
     * A designer border view. The border view visually indicates areas
     * of border with different size possibilities. The border logically
     * split area around a component to number of predefined areas such
     * as: "center", "bottom", "right", "left", "topRight", "topLeft",
     * "bottomLeft", "bottomRight", "none". See illustration below:
     *
     *
     *      |topLeft|-----------| top |-------------|topRight|
     *          |                                        |
     *          |                                        |
     *      |  left |            center             |  right |
     *          |                                        |
     *          |                                        |
     *      |bottomLeft|-------|bottom|-------------|bottomRight|
     *
     *
     * @param {String} [color] a bordar color
     * @param {Integer} [gap] a bordar gap
     * @constructor
     * @class zebkit.ui.design.ShaperBorder
     * @extends zebkit.draw.View
     */
    pkg.ShaperBorder = Class(zebkit.draw.View, [
        function(color, gap) {
            if (arguments.length > 0) {
                this.color = color;
                if (arguments.length > 1) {
                    this.gap = gap;
                }
            }
        },

        function $prototype() {
            /**
             * Border color
             * @attribute color
             * @type {String}
             * @default "blue"
             */
            this.color = "blue";

            /**
             * Border gap.
             * @attribute gap
             * @type {Number}
             * @default 7
             */
            this.gap = 8;

            function contains(x, y, gx, gy, ww, hh) {
                return gx <= x && (gx + ww) > x && gy <= y && (gy + hh) > y;
            }

            this.paint = function(g,x,y,w,h,d) {
                if (this.color !== null) {

                    var cx = Math.floor((w - this.gap)/2),
                        cy = Math.floor((h - this.gap)/2);

                    g.setColor(this.color);
                    g.beginPath();
                    g.rect(x, y, this.gap, this.gap);
                    g.rect(x + cx, y, this.gap, this.gap);
                    g.rect(x, y + cy, this.gap, this.gap);
                    g.rect(x + w - this.gap, y, this.gap, this.gap);
                    g.rect(x, y + h - this.gap, this.gap, this.gap);
                    g.rect(x + cx, y + h - this.gap, this.gap, this.gap);
                    g.rect(x + w - this.gap, y + cy, this.gap, this.gap);
                    g.rect(x + w - this.gap, y + h - this.gap, this.gap, this.gap);
                    g.fill();

                    g.beginPath();

                    // very strange thing with rect() method if it called with w or h
                    // without decreasing with gap it is ok, otherwise moving   a
                    // component with the border outside parent component area leaves
                    // traces !
                    //
                    // adding 0.5 (to center line) solves the problem with traces
                    g.rect(x + Math.floor(this.gap / 2) + 0.5,
                           y + Math.floor(this.gap / 2) + 0.5,
                           w - this.gap,
                           h - this.gap );

                    g.stroke();
                }
            };

            /**
             * Detect area type by the given location of the given component
             * @param  {zebkit.ui.Panel} target a target component
             * @param  {Integer} x a x coordinate
             * @param  {Integer} y an y coordinate
             * @return {String} a detected area type
             * @protected
             * @method detectAt
             */
            this.detectAt = function(target, x, y) {
                if (contains(x, y, this.gap, this.gap, target.width - 2 * this.gap, target.height - 2 * this.gap)) {
                    return "center";
                }

                if (contains(x, y, 0, 0, this.gap, this.gap)) {
                    return "topLeft";
                }

                if (contains(x, y, 0, target.height - this.gap, this.gap, this.gap)) {
                    return "bottomLeft";
                }

                if (contains(x, y, target.width - this.gap, 0, this.gap, this.gap)) {
                    return "topRight";
                }

                if (contains(x, y, target.width - this.gap, target.height - this.gap, this.gap, this.gap)) {
                    return "bottomRight";
                }

                var mx = Math.floor((target.width - this.gap) / 2);
                if (contains(x, y, mx, 0, this.gap, this.gap)) {
                    return "top";
                }

                if (contains(x, y, mx, target.height - this.gap, this.gap, this.gap)) {
                    return "bottom";
                }

                var my = Math.floor((target.height - this.gap) / 2);
                if (contains(x, y, 0, my, this.gap, this.gap)) {
                    return "left";
                }

                return contains(x, y, target.width - this.gap, my, this.gap, this.gap) ? "right"
                                                                                       : null;
            };
        }
    ]);

    pkg.DesignPan = Class(ui.Panel, [
        function() {
            this.statusBar    = new ui.StatusBarPan();
            this.inspectorPan = new ui.Panel();
            this.compsPan     = new ui.Panel([
                function() {
                    this.shaper = new pkg.ShaperPan();
                    this.$super();

                    var $this = this;
                    this.shaper.on("moved", function(t, px, py) {
                        $this.repaint();
                    });
                },

                function catchInput(c) {
                    return zebkit.instanceOf(c, pkg.ShaperPan) === false;
                },

                function getPopup(t, x, y) {
                    var c = this.getComponentAt(x, y);
                    if (c !== null && c !== this) {
                        return new ui.Menu([
                            "Remove ",
                            "To preferred size",
                            "-",
                            "Properties"
                        ]);
                    }
                    return null;
                },

                function pointerClicked(e) {
                    var c = this.getComponentAt(e.x, e.y);
                    if (c !== null && c !== this && zebkit.instanceOf(c.parent, pkg.ShaperPan) === false) {
                        c = zebkit.layout.getDirectChild(this, c);
                        this.shaper.setValue(c);
                        this.shaper.setState("selected");
                    }
                },

                function paintOnTop(g) {
                    if (this.shaper.isSelected()) {
                        var tx = this.shaper.getValue().x ,
                            ty = this.shaper.getValue().y;

                        for (var i = 0; i < this.kids.length; i++) {
                            var kid = this.kids[i];

                            if (this.shaper.getValue() !== kid && kid.x === tx) {
                                g.setColor("blue");
                                g.drawLine(tx, ty, tx, kid.y)
                            }
                        }
                    }
                }
            ]);

            this.statusBar.add(10, "(x,y) = 1");
            this.statusBar.add("|");
            this.statusBar.add(10, "(x,y) = 2");
            this.statusBar.add("|");
            this.statusBar.add(10, "(x,y) = 3");
           // this.statusBar.add(10, new  this.statusBar.clazz.Combo([ "Item 1", "Item 2", "Item 3"]));
            this.statusBar.addCombo(10, [ "Item 1", "Item 2", "Item 3"]);

            this.$super();
            this.setBorderLayout();
            this.add(new ui.SplitPan(this.inspectorPan, this.compsPan));
            this.add("bottom", this.statusBar);


            for(var i = 0; i < arguments.length; i++) {
                this.compsPan.add(arguments[i]);
            }
        }
    ]);

    /**
     * This is UI component class that implements possibility to embeds another
     * UI components to control the component size and location visually.
     *
     *       // create canvas
     *       var canvas = new zebkit.ui.zCanvas(300,300);
     *
     *       // create two UI components
     *       var lab = new zebkit.ui.Label("Label");
     *       var but = new zebkit.ui.Button("Button");
     *
     *       // add created before label component as target of the shaper
     *       // component and than add the shaper component into root panel
     *       canvas.root.add(new zebkit.ui.design.ShaperPan(lab).properties({
     *           bounds: [ 30,30,100,40]
     *       }));
     *
     *       // add created before button component as target of the shaper
     *       // component and than add the shaper component into root panel
     *       canvas.root.add(new zebkit.ui.design.ShaperPan(but).properties({
     *           bounds: [ 130,130,100,50]
     *       }));
     *
     * @class  zebkit.ui.design.ShaperPan
     * @constructor
     * @extends zebkit.ui.Panel
     * @param {zebkit.ui.Panel} [target] a target UI component whose size and location
     * has to be controlled
     */
    pkg.ShaperPan = Class(ui.StatePan, ui.ApplyStateProperties, [
        function(t) {
            this.border = new pkg.ShaperBorder();
            this.$super();
            if (arguments.length > 0) {
                this.setValue(t);
            }
        },

        function $prototype() {
            this.layout = new zebkit.layout.BorderLayout();

           /**
            * Indicates if controlled component can be moved
            * @attribute isMoveEnabled
            * @type {Boolean}
            * @default true
            */
           this.isMoveEnabled = true;

           /**
            * Indicates if controlled component can be sized
            * @attribute isResizeEnabled
            * @type {Boolean}
            * @default true
            */
            this.isResizeEnabled = true;

            /**
             * Minimal possible height or controlled component
             * @attribute minHeight
             * @type {Integer}
             * @default 12
             */
            this.minHeight = 12;

            /**
             * Minimal possible width or controlled component
             * @attribute minWidth
             * @type {Integer}
             * @default 12
             */
            this.minWidth = 12;


            /**
             * Resize aspect ratio (width/height). 0 value means no aspect ratio
             * has been defined.
             * @attribute aspectRatio
             * @type {Number}
             * @default 0
             */
            this.aspectRatio = 0; //2/3;


            this.$cursorState     = null;
            this.$dragCursorState = null;
            this.$px = 0;
            this.$py = 0;
            this.$targetParent = null;

            this.catchInput       = true;

            this.canHaveFocus     = true;

            this.$detectAt = function(t, x, y) {
                if (this.border !== null && this.border.detectAt !== undefined) {
                    return this.border.detectAt(t, x, y);
                } else {
                    return null;
                }
            };

            this.getCursorType = function (t, x ,y) {
                this.$cursorState = this.$detectAt(t, x, y);

                if (this.$cursorState === null) {
                    return null
                } else if (this.$cursorState === "center")  {
                    if (this.isMoveEnabled === false) {
                        return null;
                    }
                } else {
                    if (this.isResizeEnabled === false) {
                        return null;
                    }
                }

                var cur = CURSORS[this.$cursorState];
                return cur === undefined ? null : cur;
            };

            this.pointerExited = function() {
                this.$dragCursorState = this.$cursorState = null;
            };

            /**
             * Define key pressed events handler
             * @param  {zebkit.ui.event.KeyEvent} e a key event
             * @method keyPressed
             */
            this.keyPressed = function(e) {
                if (this.kids.length > 0){
                    var dx = (e.code === "ArrowLeft" ? -1 : (e.code === "ArrowRight" ? 1 : 0)),
                        dy = (e.code === "ArrowUp"   ? -1 : (e.code === "ArrowDown"  ? 1 : 0)),
                        w  = this.width  + dx,
                        h  = this.height + dy,
                        x  = this.x + dx,
                        y  = this.y + dy;

                    if (e.shiftKey) {
                        var minW = this.border !== null ? this.border.getLeft() + this.border.getRight()
                                                        : 10,
                            minH = this.border !== null ? this.border.getTop() + this.border.getBottom()
                                                        : 10;

                        if (this.isResizeEnabled === true && w > minW && h > minH) {
                            this.setSize(w, h);
                        }
                    } else if (this.isMoveEnabled) {
                        if (x + this.width/2  > 0 &&
                            y + this.height/2 > 0 &&
                            x < this.parent.width  - this.width/2  &&
                            y < this.parent.height - this.height/2    )
                        {
                            this.setLocation(x, y);
                        }
                    }
                }
            };

            /**
             * Define pointer drag started events handler
             * @param  {zebkit.ui.event.PointerEvent} e a pointer event
             * @method pointerDragStarted
             */
            this.pointerDragStarted = function(e) {
                this.$dragCursorState = null;
                if (this.$cursorState !== null && (this.isResizeEnabled || this.isMoveEnabled)) {
                    if ((this.isMoveEnabled   && this.$cursorState === "center") ||
                        (this.isResizeEnabled && this.$cursorState !== "center")   )
                    {
                        this.$px = e.absX;
                        this.$py = e.absY;
                        this.$dragCursorState = this.$cursorState;
                    }
                }
            };

            /**
             * Define pointer dragged events handler
             * @param  {zebkit.ui.event.PointerEvent} e a pointer event
             * @method pointerDragged
             */
            this.pointerDragged = function(e){
                if (this.$dragCursorState !== null) {
                    var dy = (e.absY - this.$py),
                        dx = (e.absX - this.$px),
                        s  = this.$dragCursorState;

                    this.$px = e.absX;
                    this.$py = e.absY;

                    if (s === "center") {
                        this.setLocation(this.x + dx, this.y + dy);
                    } else {
                        var m = { top    : (s === "top"    || s === "topLeft"     || s === "topRight"   ) ? 1 : 0,
                                  left   : (s === "left"   || s === "topLeft"     || s === "bottomLeft" ) ? 1 : 0,
                                  right  : (s === "right"  || s === "topRight"    || s === "bottomRight") ? 1 : 0,
                                  bottom : (s === "bottom" || s === "bottomRight" || s === "bottomLeft" ) ? 1 : 0 },
                            nh = this.height - dy * m.top  + dy * m.bottom,
                            nw = this.width  - dx * m.left + dx * m.right;

                        this.setBounds(this.x + m.left * dx, this.y + m.top  * dy, nw, nh);
                    }
                }
            };

            this.pointerDragEnded = function(e) {
                this.$px = this.$py = 0;
                this.$dragCursorState = null;
            };

            /**
             * Set the border color for the given focus state.
             * @param {String} id a focus state. Use "focuson" or "focusoff" as the
             * parameter value
             * @param {String} color a border color
             * @method setBorderColor
             * @chainable
             */
            this.setBorderColor = function(color) {
                if (this.border !== null && this.border.color !== color) {
                    this.border.color = color;
                    this.repaint();
                }
                return this;
            };

            /**
             * Get a component whose shape is controlled
             * @return {zebkit.ui.Panel} a controlled component
             * @method getValue
             */
            this.getValue = function() {
                if (this.kids.length > 0) {
                    var t = this.byConstraints(null) || this.byConstraints("center");
                    return t;
                } else {
                    return null;
                }
            };

            /**
             * Set the controlled with the shape controller component.
             * @param {zebkit.ui.Panel} v a component to be controlled
             * @method setValue
             * @chainable
             */
            this.setValue = function(v) {
                var ov = this.getValue();
                if (ov !== v) {
                    var top  = this.getTop(),
                        left = this.getLeft();

                    if (ov !== null) {
                        ov.removeMe();

                        // attach the target back to its parent
                        if (this.$targetParent !== null) {
                            this.removeMe();
                            ov.setBounds(this.x + ov.x, this.y + ov.y, ov.width, ov.height);
                            this.$targetParent.add(ov);
                        }
                    }

                    this.$targetParent = null;
                    if (v !== null) {
                        if (v.parent !== null) {
                            // detach the shaper from old parent
                            if (this.parent !== null && this.parent !== v.parent) {
                                this.removeMe();
                            }

                            // save target parent and detach it from it
                            this.$targetParent = v.parent;
                            v.removeMe();

                            // add the shaper to the target parent
                            this.$targetParent.add(this);
                        }

                        // calculate location and size the shaper requires
                        // taking in account gaps
                        if (v.width === 0 || v.height === 0) {
                            v.toPreferredSize();
                        }

                        // set shaper bounds
                        this.setBounds(v.x - left, v.y - top,
                                       v.width + left + this.getRight(),
                                       v.height + top + this.getBottom());

                        this.add(v);
                    }
                }
                return this;
            };

            this.isSelected = function() {
                return this.state === "selected";
            };
        },

        function setSize(w, h) {
            if (this.aspectRatio !== 0) {
                w = Math.floor(h * this.aspectRatio);
            }

            if (w >= this.minWidth && h >= this.minHeight && (this.width !== w || this.height !== h)) {
                var pw = this.width,
                    ph = this.height;

                this.$super(w, h);
                this.fire("sized", [ this, (w - pw), (h - ph) ]);
            }
            return this;
        },

        function setLocation(x, y) {
            if (this.x !== x || this.y !== y) {
                var px = this.x,
                    py = this.y;

                this.$super(x, y);
                this.fire("moved", [ this, (x - px), (y - py) ]);
            }
            return this;
        },

        function setState(s) {
            var prev = this.state;
            this.$super(s);

            if (prev !== this.state) {
                if (this.state === "selected") {
                    this.fire("selected", [ this, true ]);
                } else if (prev === "selected") {
                    this.fire("selected", [ this, false ]);
                }
            }

            return this;
        },

        function focused() {
            this.$super();
            this.setState(this.hasFocus() ? "selected"
                                          : "unselected" );
        },

        function kidRemoved(i, kid, ctr) {
            if (ctr === null || ctr === "center") {
                this.fire("detached", [this, kid]);
            }
        },

        function kidAdded(i, constr, d) {
            if (constr === null || constr === "center") {
                this.fire("attached", [ this, d ]);
            }
        }
    ]).events("selected", "sized", "moved", "attached", "detached");

    /**
     * Special tree model implementation that represents zebkit UI component
     * hierarchy as a simple tree model.
     * @param  {zebkit.ui.Panel} target a root UI component
     * @constructor
     * @class zebkit.ui.design.FormTreeModel
     * @extends zebkit.data.TreeModel
     */
    pkg.FormTreeModel = Class(zebkit.data.TreeModel, [
        function (target) {
            this.$super(this.buildModel(target, null));
        },

        function $prototype() {
            /**
             * Build tree model by the given UI component.
             * @param  {zebkit.ui.Panel} comp a component
             * @return {zebkit.data.Item} a root tree model item
             * @method buildModel
             */
            this.buildModel = function(comp, root){
                var b    = this.exclude !== undefined && this.exclude(comp),
                    item = b ? root : this.createItem(comp);

                for(var i = 0; i < comp.kids.length; i++) {
                    var r = this.buildModel(comp.kids[i], item);
                    if (r !== null) {
                        r.parent = item;
                        item.kids.push(r);
                    }
                }
                return b ? null : item;
            };

            /**
             * Find a tree item that relates to the given component.
             * @param  {zebkit.ui.Panel} c a component.
             * @return {zebkit.data.Item} a tree item.
             * @method itemByComponent
             */
            this.itemByComponent = function (c, r) {
                if (arguments.length < 2) {
                    r = this.root;
                }

                if (r.comp === c) {
                    return c;
                } else {
                    for(var i = 0; i < r.kids.length; i++) {
                        var item = this.itemByComponent(c, r.kids[i]);
                        if (item !== null) {
                            return item;
                        }
                    }
                    return null;
                }
            };

            this.createItem = function(comp){
                var name = comp.clazz.$name;
                if (name === undefined) {
                    name = comp.toString();
                }

                var index = name.lastIndexOf('.'),
                    item = new zebkit.data.Item(index > 0 ? name.substring(index + 1) : name);

                item.comp = comp;
                return item;
            };
        }
    ])

}, true);
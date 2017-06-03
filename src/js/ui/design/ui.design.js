zebkit.package("ui.design", function(pkg, Class) {
    var ui = pkg.cd("..");

    /**
     * The package contains number of UI components that can be helpful to
     * perform visual control of an UI component. You can control an UI component
     * size and location.
     *
     *     var root = (new zebkit.ui.zCanvas(400, 300)).root;
     *     root.setLayout(new zebkit.layout.RasterLayout());
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
     * @constructor
     * @class zebkit.ui.design.ShaperBorder
     * @extends {zebkit.ui.View}
     */
    pkg.ShaperBorder = Class(ui.View, [
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
            this.gap = 7;

            function contains(x, y, gx, gy, ww, hh) {
                return gx <= x && (gx + ww) > x && gy <= y && (gy + hh) > y;
            }

            this.paint = function(g,x,y,w,h,d){
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

                var my = Math.floor((target.height - this.gap)/2);
                if (contains(x, y, 0, my, this.gap, this.gap)) {
                    return "left";
                }

                return contains(x, y, target.width - this.gap, my, this.gap, this.gap) ? "right"
                                                                                       : "none";
            };
        }
    ]);

    /**
     * This is UI component class that implements possibility to embeds another
     * UI components to control the component size and location visually.

            // create canvas
            var canvas = new zebkit.ui.zCanvas(300,300);

            // create two UI components
            var lab = new zebkit.ui.Label("Label");
            var but = new zebkit.ui.Button("Button");

            // add created before label component as target of the shaper
            // component and than add the shaper component into root panel
            canvas.root.add(new zebkit.ui.design.ShaperPan(lab).properties({
                bounds: [ 30,30,100,40]
            }));

            // add created before button component as target of the shaper
            // component and than add the shaper component into root panel
            canvas.root.add(new zebkit.ui.design.ShaperPan(but).properties({
                bounds: [ 130,130,100,50]
            }));

     * @class  zebkit.ui.design.ShaperPan
     * @constructor
     * @extends {zebkit.ui.Panel}
     * @param {zebkit.ui.Panel} target a target UI component whose size and location
     * has to be controlled
     */
    pkg.ShaperPan = Class(ui.Panel, [
        function(t) {
            this.shaperBr = new pkg.ShaperBorder();
            this.$super(new zebkit.layout.BorderLayout());
            this.px = this.py = 0;
            this.setBorder(this.shaperBr);
            if (arguments.length > 0) {
                this.add(t);
            }
        },

        function $clazz() {
            this.colors = [ "lightGray", "blue" ];
        },

        function $prototype() {
            this.colors = null;

           /**
            * Indicates if controlled component can be moved
            * @attribute isMoveEnabled
            * @type {Boolean}
            * @default true
            */

           /**
            * Indicates if controlled component can be sized
            * @attribute isResizeEnabled
            * @type {Boolean}
            * @default true
            */

            /**
             * Minimal possible height or controlled component
             * @attribute minHeight
             * @type {Integer}
             * @default 12
             */

            /**
             * Minimal possible width or controlled component
             * @attribute minWidth
             * @type {Integer}
             * @default 12
             */
            this.minHeight = this.minWidth = 12;
            this.canHaveFocus = this.isResizeEnabled = this.isMoveEnabled = true;
            this.$state = null;

            this.catchInput = true;

            this.getCursorType = function (t, x ,y) {
                return this.kids.length > 0 ? CURSORS[this.shaperBr.detectAt(t, x, y)]
                                            : null;
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
                        if (this.isResizeEnabled === true && w > this.shaperBr.gap * 2 && h > this.shaperBr.gap * 2) {
                            this.setSize(w, h);
                        }
                    } else {
                        if (this.isMoveEnabled) {
                            if (x + this.width/2  > 0 &&
                                y + this.height/2 > 0 &&
                                x < this.parent.width  - this.width/2  &&
                                y < this.parent.height - this.height/2    )
                            {
                                this.setLocation(x, y);
                            }
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
                this.$state = null;
                if (this.isResizeEnabled || this.isMoveEnabled) {
                    var t = this.shaperBr.detectAt(this, e.x, e.y);
                    if ((this.isMoveEnabled   === true || t !== "center")||
                        (this.isResizeEnabled === true || t === "center")  )
                    {
                        this.$state = { top    : (t === "top"    || t === "topLeft"     || t === "topRight"   ) ? 1 : 0,
                                       left   : (t === "left"   || t === "topLeft"     || t === "bottomLeft" ) ? 1 : 0,
                                       right  : (t === "right"  || t === "topRight"    || t === "bottomRight") ? 1 : 0,
                                       bottom : (t === "bottom" || t === "bottomRight" || t === "bottomLeft" ) ? 1 : 0 };

                        this.px = e.absX;
                        this.py = e.absY;
                    }
                }
            };

            /**
             * Define pointer dragged events handler
             * @param  {zebkit.ui.event.PointerEvent} e a pointer event
             * @method pointerDragged
             */
            this.pointerDragged = function(e){
                if (this.$state !== null) {
                    var dy = (e.absY - this.py),
                        dx = (e.absX - this.px),
                        s  = this.$state,
                        nw = this.width  - dx * s.left + dx * s.right,
                        nh = this.height - dy * s.top  + dy * s.bottom;

                    if (nw >= this.minWidth && nh >= this.minHeight) {
                        this.px = e.absX;
                        this.py = e.absY;
                        if ((s.top + s.right + s.bottom + s.left) === 0) {
                            this.setLocation(this.x + dx, this.y + dy);
                        } else {
                            this.setBounds(this.x + dx * s.left, this.y + dy * s.top, nw, nh);
                     //       this.invalidateLayout();
                        }
                    }
                }
            };

            /**
             * Set the border color for the given focus state.
             * @param {Boolean} b a focus state. true means the component holds focus,
             * false means the component is not a focus owner.
             * @param {String} color a border color
             * @method setBorderColor
             * @chainable
             */
            this.setBorderColor = function (b, color) {
                var rp = false;
                if (this.colors === null) {
                    this.colors = [ "lightGray", "blue"];
                    rp = true;
                }

                var oldCol = this.colors[b?1:0];
                if (oldCol !== color) {
                    this.colors[b ? 1 : 0] = color;
                    rp = true;
                }

                var hasFocus = this.hasFocus();
                if (this.shaperBr.color !== this.colors[hasFocus?1:0]) {
                    this.shaperBr.color = this.colors[hasFocus?1:0];
                    rp = true;
                }

                if (rp) {
                    this.repaint();
                }

                return this;
            };

            /**
             * Set the border colors.
             * @param {String} col1 a color the border has to have when the
             * component doesn't hold focus.
             * @param {String} [col2] a color the border has to have if the
             * component is focus owner.
             * @method setBorderColors
             * @chainable
             */
            this.setBorderColors = function(col1, col2) {
                this.setColor(false, col1);
                if (arguments.length > 1) {
                    this.setColor(true, col2);
                }
                return this;
            };
        },

        function insert(i, constr, d) {
            if (this.kids.length > 0) {
                this.removeAll();
            }

            var top  = this.getTop(),
                left = this.getLeft();

            if (d.width === 0 || d.height === 0) {
                d.toPreferredSize();
            }

            this.setBounds(d.x - left, d.y - top,
                           d.width + left + this.getRight(),
                           d.height + top + this.getBottom());
            this.$super(i, "center", d);
        },

        function focused(){
            this.$super();
            this.shaperBr.color = this.colors[this.hasFocus()? 1 : 0];
            this.repaint();
        }
    ]);

    /**
     * Special tree model implementation that represents zebkit UI component
     * hierarchy as a simple tree model.
     * @param  {zebkit.ui.Panel} target a root UI component
     * @constructor
     * @class zebkit.ui.design.FormTreeModel
     * @extends {zebkit.data.TreeModel}
     */
    pkg.FormTreeModel = Class(zebkit.data.TreeModel, [
        function (target){
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
                var b    = typeof this.exclude !== 'undefined' && this.exclude(comp),
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
                if (arguments.length < 2) r = this.root;
                if (r.comp === c) return c;
                for(var i = 0;i < r.kids.length; i++) {
                    var item = this.itemByComponent(c, r.kids[i]);
                    if (item !== null) return item;
                }
                return null;
            };

            this.createItem = function(comp){
                var name = comp.clazz.$name;
                if (typeof name === 'undefined') name = comp.toString();
                var index = name.lastIndexOf('.'),
                    item = new zebkit.data.Item(index > 0 ? name.substring(index + 1) : name);
                item.comp = comp;
                return item;
            };
        }
    ]);
});
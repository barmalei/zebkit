zebkit.package("ui", function(pkg, Class) {
    /**
     * Class that holds mouse cursor constant.
     * @constructor
     * @class zebkit.ui.Cursor
     */
    pkg.Cursor = {
        /**
         * "default"
         * @const DEFAULT
         * @type {String}
         */
        DEFAULT     : "default",

        /**
         * "move"
         * @const MOVE
         * @type {String}
         */
        MOVE        : "move",

        /**
         * "wait"
         * @const WAIT
         * @type {String}
         */
        WAIT        : "wait",

        /**
         * "text"
         * @const TEXT
         * @type {String}
         */
        TEXT        : "text",

        /**
         * "pointer"
         * @const HAND
         * @type {String}
         */
        HAND        : "pointer",

        /**
         * "ne-resize"
         * @const NE_RESIZE
         * @type {String}
         */
        NE_RESIZE   : "ne-resize",

        /**
         * "sw-resize"
         * @const SW_RESIZE
         * @type {String}
         */
        SW_RESIZE   : "sw-resize",

        /**
         * "se-resize"
         * @const SE_RESIZE
         * @type {String}
         */
        SE_RESIZE   : "se-resize",

        /**
         * "nw-resize"
         * @const NW_RESIZE
         * @type {String}
         */
        NW_RESIZE   : "nw-resize",

        /**
         * "s-resize"
         * @const S_RESIZE
         * @type {String}
         */
        S_RESIZE    : "s-resize",

        /**
         * "w-resize"
         * @const W_RESIZE
         * @type {String}
         */
        W_RESIZE    : "w-resize",

        /**
         * "n-resize"
         * @const N_RESIZE
         * @type {String}
         */
        N_RESIZE    : "n-resize",

        /**
         * "e-resize"
         * @const E_RESIZE
         * @type {String}
         */
        E_RESIZE    : "e-resize",

        /**
         * "col-resize"
         * @const COL_RESIZE
         * @type {String}
         */
        COL_RESIZE  : "col-resize",

        /**
         * "help"
         * @const HELP
         * @type {String}
         */
        HELP        : "help"
    };

    /**
     * Shortcut to create a UI component by the given description. Depending on the description type
     * the following components are created:
     *
     *    - **String** zebkit.ui.Label
     *    - **Array** zebkit.ui.Combobox
     *    - **2D Array** zebkit.ui.grid.Grid
     *
     * @method $component
     * @protected
     * @for  zebkit.ui
     * @param  {Object} desc a description
     * @return {zebkit.ui.Panel}  a created UI component
     */
    pkg.$component = function(desc, instance) {
        var hasInstance = arguments.length > 1;

        if (zebkit.isString(desc)) {
            //  [x] Text
            //  @(image-path:wxh) Text
            //  Text

            var m   = desc.match(/^(\[[x ]?\])/),
                txt = null;

            if (m !== null) {
                txt = desc.substring(m[1].length);
                var ch  = hasInstance && typeof instance.clazz.Checkbox !== 'undefined' ? new instance.clazz.Checkbox(txt)
                                                                                        : new pkg.Checkbox(txt);
                ch.setValue(m[1].indexOf('x') > 0);
                return ch;
            } else {
                m = desc.match(/^@\((.*)\)(\:[0-9]+x[0-9]+)?/);
                if (m !== null) {
                    var path = m[1];

                    txt  = desc.substring(path.length + 3 + (typeof m[2] !== 'undefined' ? m[2].length : 0)).trim();

                    var img = hasInstance && typeof instance.clazz.ImagePan !== 'undefined' ? new instance.clazz.ImagePan(path)
                                                                                            : new pkg.ImagePan(path);

                    if (typeof m[2] !== 'undefined') {
                        var s = m[2].substring(1).split('x'),
                            w = parseInt(s[0], 10),
                            h = parseInt(s[1], 10);

                        img.setPreferredSize(w, h);
                    }

                    if (txt.length === 0) {
                        return img;
                    }

                    return hasInstance && typeof instance.clazz.ImageLabel !== 'undefined' ? new instance.clazz.ImageLabel(txt, img)
                                                                                           : new pkg.ImageLabel(txt, img);
                } else {
                    return hasInstance && typeof instance.clazz.Label !== 'undefined' ? new instance.clazz.Label(desc)
                                                                                      : new pkg.Label(desc);
                }
            }
        } else if (Array.isArray(desc)) {
            if (desc.length > 0 && Array.isArray(desc[0])) {
                var model = new zebkit.data.Matrix(desc.length, desc[0].length);
                for(var row = 0; row < model.rows; row++) {
                    for(var col = 0; col < model.cols; col++) {
                        model.put(row, col, desc[row][col]);
                    }
                }
                return new pkg.grid.Grid(model);
            } else {
                var clz = hasInstance && typeof instance.clazz.Combo !== 'undefined' ? instance.clazz.Combo
                                                                                     : pkg.Combo,
                    combo = new clz(new clz.CompList(true)),
                    selectedIndex = -1;

                for(var i = 0; i < desc.length; i++) {
                    var ss = desc[i];
                    if (zebkit.isString(ss)) {
                        if (selectedIndex === -1 && ss.length > 1 && ss[0] === '*') {
                            selectedIndex = i;
                            desc[i] = ss.substring(1);
                        }
                    }
                    combo.list.add(pkg.$component(desc[i], combo.list));
                }

                combo.select(selectedIndex);
                return combo;
            }
        } else if (desc instanceof Image) {
            return hasInstance && typeof instance.clazz.ImagePan !== 'undefined' ? new instance.clazz.ImagePan(desc)
                                                                                 : new pkg.ImagePan(desc);
        } else if (zebkit.instanceOf(desc, pkg.View)) {
            var v = hasInstance && typeof instance.clazz.ViewPan !== 'undefined' ? new instance.clazz.ViewPan()
                                                                                 : new pkg.ViewPan();
            v.setView(desc);
            return v;
        }

        return desc;
    };

    /**
     * Named views holder interface.
     * @class  zebkit.ui.DecorationViews
     * @interface  zebkit.ui.DecorationViews
     */
    pkg.DecorationViews = zebkit.Interface([
        function $prototype() {
            /**
             * Set views set.
             * @param {Object} v named views set.
             * @method setViews
             * @chainable
             */
            this.setViews = function(v){
                if (typeof this.views === 'undefined') {
                    this.views = {};
                }

                var b = false;
                for(var k in v) {
                    if (v.hasOwnProperty(k)) {
                        var nv = pkg.$view(v[k]);
                        if (this.views[k] !== nv) {
                            this.views[k] = nv;
                            b = true;
                        }
                    }
                }

                if (b === true) {
                    this.vrp();
                }

                return this;
            };
        }
    ]);

    /**
     * Base class to implement model values renders.
     * @param  {zebkit.ui.Render} [render] a render to visualize values. By default string render is used.
     * @class zebkit.ui.BaseViewProvider
     * @constructor
     */
    pkg.BaseViewProvider = Class([
        function(render) {
            /**
             * Default render that is used to paint grid content.
             * @type {zebkit.ui.Render}
             * @attribute render
             * @readOnly
             * @protected
             */
            this.render = (arguments.length === 0 || typeof render === 'undefined' ? new pkg.StringRender("")
                                                                                   : render);
            zebkit.properties(this, this.clazz);
        },

        function $prototype() {
            /**
             * Set the default view provider font if defined render supports it
             * @param {zebkit.ui.Font} f a font
             * @method setFont
             * @chainable
             */
            this.setFont = function(f) {
                if (typeof this.render.setFont !== 'undefined') {
                    this.render.setFont(f);
                }
                return this;
            };

            /**
             * Set the default view provider color if defined render supports it
             * @param {String} c a color
             * @method setColor
             * @chainable
             */
            this.setColor = function(c) {
                if (typeof this.render.setColor !== 'undefined') {
                    this.render.setColor(c);
                }
                return this;
            };

            /**
             * Get a view to render the specified value of the target component.
             * @param  {Object} target a target  component
             * @param  {Object} [arg]* arguments list
             * @param  {Object} obj a value to be rendered
             * @return {zebkit.ui.View}  an instance of view to be used to
             * render the given value
             * @method  getView
             */
            this.getView = function(target) {
                var obj = arguments[arguments.length - 1];
                if (obj !== null && typeof obj !== 'undefined') {
                    if (typeof obj.toView !== 'undefined') {
                        return obj.toView();
                    } else if (typeof obj.paint !== 'undefined') {
                        return obj;
                    } else {
                        this.render.setValue(obj.toString());
                        return this.render;
                    }
                } else {
                    return null;
                }
            };
        }
    ]);

    /**
     *  UI component to keep and render the given "zebkit.ui.View" class
     *  instance. The target view defines the component preferred size
     *  and the component view.
     *  @class zebkit.ui.ViewPan
     *  @constructor
     *  @extends {zebkit.ui.Panel}
     */
    pkg.ViewPan = Class(pkg.Panel, [
        function $prototype() {
            /**
             * Reference to a view that the component visualize
             * @attribute view
             * @type {zebkit.ui.View}
             * @default null
             * @readOnly
             */
            this.view = null;

            this.paint = function (g){
                if (this.view !== null){
                    var l = this.getLeft(),
                        t = this.getTop();

                    this.view.paint(g, l, t, this.width  - l - this.getRight(),
                                             this.height - t - this.getBottom(), this);
                }
            };

            /**
             * Set the target view to be wrapped with the UI component
             * @param  {zebkit.ui.View|Function} v a view or a rendering
             * view "paint(g,x,y,w,h,c)" function
             * @method setView
             * @chainable
             */
            this.setView = function(v){
                var old = this.view;
                v = pkg.$view(v);

                if (v !== old) {
                    this.view = v;
                    this.notifyRender(old, v);
                    this.vrp();
                }

                return this;
            };

            /**
             * Override the parent method to calculate preferred size basing on a target view.
             * @param  {zebkit.ui.Panel} t a target container
             * @return {Object} return a target view preferred size if it is defined.
             * The returned structure is the following:
             *
             *     { width: {Integer}, height:{Integer} }
             *
             *  @method  calcPreferredSize
             */
            this.calcPreferredSize = function (t) {
                return this.view !== null ? this.view.getPreferredSize() : { width:0, height:0 };
            };
        }
    ]);

    /**
     *  Image panel UI component class. The component renders an image.
     *  @param {String|Image} [img] a path or direct reference to an image object.
     *  If the passed parameter is string it considered as path to an image.
     *  In this case the image will be loaded using the passed path.
     *  @param {Integer} [w] a preferred with of the image
     *  @param {Integer} [h] a preferred height of the image
     *  @class zebkit.ui.ImagePan
     *  @constructor
     *  @extends zebkit.ui.ViewPan
     */
    pkg.ImagePan = Class(pkg.ViewPan, [
        function(img, w, h) {
            this.setImage(arguments.length > 0 ? img : null);
            this.$super();
            if (arguments.length > 1) {
                this.setPreferredSize(w, arguments < 3 ? w : h);
            }
        },

        function $prototype() {
            this.$runner = null;

            /**
             * Set image to be rendered in the UI component
             * @method setImage
             * @param {String|Image|zebkit.ui.Picture} img a path or direct reference to an
             * image or zebkit.ui.Picture render.
             * If the passed parameter is string it considered as path to an image.
             * In this case the image will be loaded using the passed path
             * @chainable
             */
            this.setImage = function(img) {
                var $this = this;

                if (img !== null) {
                    var isPic     = zebkit.instanceOf(img, pkg.Picture),
                        imgToLoad = isPic ? img.target : img ;

                    this.setView(isPic ? img : new pkg.Picture(img));


                    this.$runner = zebkit.util.image(imgToLoad);
                    this.$runner.then(function(img) {
                        $this.$runner = null;
                        $this.setView(isPic ? img : new pkg.Picture(img));
                        $this.vrp();

                        if (typeof $this.imageLoaded !== 'undefined') {
                            $this.imageLoaded(img);
                        }

                        // fire imageLoaded event to children
                        for(var t = $this.parent; t !== null; t = t.parent){
                            if (typeof t.childImageLoaded !== 'undefined') {
                                t.childImageLoaded(img);
                            }
                        }
                    }).catch(function(e) {
                        console.log(img);
                        zebkit.dumpError(e);

                        $this.$runner = null;
                        $this.setView(null);
                    });
                } else {
                    if (this.$runner === null) {
                        this.setView(null);
                    } else {
                        this.$runner.then(function() {
                            $this.setView(null);
                        });
                    }
                }
                return this;
            };
        }
    ]);

    /**
     * Line UI component class. Draw series of vertical or horizontal lines of using
     * the given line width and color. Vertical or horizontal line rendering s selected
     * depending on the line component size: if height is greater than width than vertical
     * line will be rendered.
     * @constructor
     * @class zebkit.ui.Line
     * @extends {zebkit.ui.Panel}
     */
    pkg.Line = Class(pkg.Panel, [
        function() {
            /**
             * Line colors
             * @attribute colors
             * @type {Array}
             * @readOnly
             * @default [ "gray" ]
             */
            this.$super();

            if (arguments.length > 0) {
                this.setColors.apply(this, arguments);
            }
        },

        function $prototype() {
            this.colors = [ "gray" ];

            /**
             * Line width
             * @attribute lineWidth
             * @type {Integer}
             * @default 1
             */
            this.lineWidth = 1;

            /**
             * Set line color
             * @param {String} c a color
             * @method  setColor
             * @chainable
             */
            this.setColor = function(c) {
                this.setColors(c);
                return this;
            };

            /**
             * Set set of colors to be used to paint the line. Number of colors defines the number of
             * lines to be painted.
             * @param {String} colors* colors
             * @method setLineColors
             * @chainable
             */
            this.setColors = function() {
                this.colors = (arguments.length === 1) ? (Array.isArray(arguments[0]) ? arguments[0].slice(0)
                                                                                      : [ arguments[0] ] )
                                                       : Array.prototype.slice.call(arguments);
                this.repaint();
                return this;
            };

            this.paint = function(g) {
                var isHor  = this.width > this.height,
                    left   = this.getLeft(),
                    right  = this.getRight(),
                    top    = this.getTop(),
                    bottom = this.getBottom(),
                    xy     = isHor ? top : left;

                for(var i = 0; i < this.colors.length; i++) {
                    if (this.colors[i] !== null) {
                        g.setColor(this.colors[i]);
                        if (isHor === true) {
                            g.drawLine(this.left, xy, this.width - right - left, xy, this.lineWidth);
                        } else {
                            g.drawLine(xy, top, xy, this.height - top - bottom, this.lineWidth);
                        }
                    }
                    xy += this.lineWidth;
                }
            };

            this.calcPreferredSize = function(target) {
                var s = this.colors.length * this.lineWidth;
                return { width: s, height:s};
            };
        }
    ]);

    /**
     * Label UI component class. The label can be used to visualize simple string or multi lines text or
     * the given text render implementation:

            // render simple string
            var l = new zebkit.ui.Label("Simple string");

            // render multi lines text
            var l = new zebkit.ui.Label(new zebkit.data.Text("Multiline\ntext"));

            // render password text
            var l = new zebkit.ui.Label(new zebkit.ui.PasswordText("password"));

     * @param  {String|zebkit.data.TextModel|zebkit.ui.TextRender} [r] a text to be shown with the label.
     * You can pass a simple string or an instance of a text model or an instance of text render as the
     * text value.
     * @class zebkit.ui.Label
     * @constructor
     * @extends zebkit.ui.ViewPan
     */
    pkg.Label = Class(pkg.ViewPan, [
        function (r) {
            if (arguments.length === 0) {
                this.setView(new pkg.StringRender(""));
            } else {
                // test if input string is string
                if (typeof r === "string" || r.constructor === String) {
                    this.setView(r.length === 0 || r.indexOf('\n') >= 0 ? new pkg.TextRender(new zebkit.data.Text(r))
                                                                        : new pkg.StringRender(r));
                } else if (typeof r.clazz         !== "undefined" &&
                           typeof r.getTextLength !== 'undefined' &&   // a bit faster tnan instanceOf checking if
                           typeof r.getLines      !== 'undefined'   )  // test if this is an instance of zebkit.data.TextModel
                {
                    this.setView(new pkg.TextRender(r));
                } else {
                    this.setView(r);
                }
            }
            this.$super();
        },

        function $prototype() {
            /**
             * Get the label text
             * @return {String} a zebkit label text
             * @method getValue
             */
            this.getValue = function() {
                return this.view.toString();
            };

            /**
             * Set the text field text model
             * @param  {zebkit.data.TextModel|String} m a text model to be set
             * @method setModel
             * @chainable
             */
            this.setModel = function(m) {
                this.setView(zebkit.isString(m) ? new pkg.StringRender(m)
                                                : new pkg.TextRender(m));
                return this;
            };

            /**
             * Get a text model
             * @return {zebkit.data.TextModel} a text model
             * @method getModel
             */
            this.getModel = function() {
                return this.view !== null ? this.view.target : null;
            };

            /**
             * Get the label text color
             * @return {String} a zebkit label color
             * @method getColor
             */
            this.getColor = function (){
                return this.view.color;
            };

            /**
             * Get the label text font
             * @return {zebkit.ui.Font} a zebkit label font
             * @method getFont
             */
            this.getFont = function (){
                return this.view.font;
            };

            /**
             * Set the label text value
             * @param  {String} s a new label text
             * @method setValue
             * @chainable
             */
            this.setValue = function(s){
                if (s === null) s = "";

                var old = this.view.toString();
                if (old !== s) {
                    this.view.setValue(s);
                    this.repaint();
                }

                return this;
            };

            /**
             * Set the label text color
             * @param  {String} c a text color
             * @method setColor
             * @chainable
             */
            this.setColor = function(c) {
                var old = this.view.color;
                if (old !== c) {
                    this.view.setColor(c);
                    this.repaint();
                }
                return this;
            };

            /**
             * Set the label text font
             * @param  {zebkit.ui.Font} f a text font
             * @method setFont
             * @chainable
             */
            this.setFont = function(f) {
                var old = this.view.font;
                this.view.setFont.apply(this.view, arguments);
                if (old != this.view.font) {
                    this.repaint();
                }
                return this;
            };
        }
    ]);

    /**
     * Shortcut class to render bold text in Label
     * @param {String|zebkit.ui.TextRender|zebkit.data.TextModel} [t] a text string,
     * text model or text render instance
     * @constructor
     * @class zebkit.ui.BoldLabel
     * @extends zebkit.ui.Label
     */
    pkg.BoldLabel = Class(pkg.Label, []);

    /**
     * Image label UI component. This is UI container that consists from an image
     * component and an label component.Image is located at the left size of text.
     * @param {Image|String} img an image or path to the image
     * @param {String|zebkit.ui.TextRender|zebkit.data.TextModel} txt a text string,
     * text model or text render instance
     * @constructor
     * @class zebkit.ui.ImageLabel
     * @extends {zebkit.ui.Panel}
     */
    pkg.ImageLabel = Class(pkg.Panel, [
        function(txt, path) {
            var img = zebkit.instanceOf(path, pkg.ImagePan) ? path : new this.clazz.ImagePan(path),
                lab = zebkit.instanceOf(txt, pkg.Panel)     ? txt  : new this.clazz.Label(txt);

            img.constraints = "image";
            lab.constraints = "label";

            // TODO: this is copy paste of Panel constructor to initialize fields that has to
            // be used for adding child components. these components have to be added before
            // properties() call. a bit dirty trick
            if (typeof this.kids === "undefined") {
                this.kids = [];
            }

            this.layout = new zebkit.layout.FlowLayout("left", "center", "horizontal", 6);

            // add before panel constructor thanks to copy pasted code above
            this.add(img);
            this.add(lab);

            this.$super();

            lab.setVisible(txt !== null);
        },

        function $clazz() {
            this.ImagePan = Class(pkg.ImagePan, []);
            this.Label    = Class(pkg.Label, []);
        },

        function $prototype() {
            /**
             * Set the specified caption
             * @param {String|zebkit.ui.Label} c a label text or component
             * @method setValue
             * @chainable
             */
            this.setValue = function(c) {
                var lab = this.byConstraints("label");

                if (zebkit.instanceOf(c, pkg.Label)) {
                    var i = -1;
                    if (lab !== null) {
                        i = this.indexOf(lab);
                    }

                    c.constraints = "label";
                    if (i >= 0) {
                        this.setAt(i, c);
                    }
                } else {
                    lab.setValue(c);
                    lab.setVisible(c !== null);
                }

                return this;
            };

            /**
             * Set the specified label image
             * @param {String|Image} p a path to an image of image object
             * @method setImage
             * @chainable
             */
            this.setImage = function(p) {
                var image = this.byConstraints("image");
                image.setImage(p);
                image.setVisible(p !== null);
                return this;
            };

            /**
             * Set the caption font
             * @param {zebkit.ui.Font} a font
             * @method setFont
             * @chainable
             */
            this.setFont = function() {
                var lab = this.byConstraints("label");
                if (lab !== null) {
                    lab.setFont.apply(lab, arguments);
                }
                return this;
            };

            /**
             * Set the caption color
             * @param {String} a color
             * @method setColor
             * @chainable
             */
            this.setColor = function (c) {
                var lab = this.byConstraints("label");
                if (lab !== null) {
                    lab.setColor(c);
                }
                return this;
            };

            /**
             * Get caption value
             * @return {zebkit.ui.Panel} a caption value
             * @method getValue
             */
            this.getValue = function () {
                var lab = this.byConstraints("label");
                return lab === null ? null : lab.getValue();
            };

            /**
             * Set the image alignment.
             * @param {String} an alignment. Following values are possible:
             *
             *    - "left"
             *    - "right"
             *    - "top"
             *    - "bottom"
             *
             * @method  setImgAlignment
             * @chainable
             */
            this.setImgAlignment = function(a) {
                var b   = false,
                    img = this.byConstraints("image"),
                    i   = this.indexOf(img);

                if (a === "top" || a === "bottom") {
                    if (this.layout.direction !== "vertical") {
                        this.layout.direction = "vertical";
                        b = true;
                    }
                } else if (a === "left" || a === "right") {
                    if (this.layout.direction !== "horizontal") {
                        this.layout.direction = "horizontal";
                        b = true;
                    }
                }

                if (this.layout.ax !== "center") {
                    this.layout.ax = "center";
                    b = true;
                }

                if (this.layout.ay !== "center") {
                    this.layout.ay = "center";
                    b = true;
                }

                if ((a === "top" || a === "left") && i !== 0 ) {
                    this.insert("image", 0, this.removeAt(i));
                    b = false;
                } else if ((a === "bottom"  || a === "right") && i !== 1) {
                    this.add("image", this.removeAt(i));
                    b = false;
                }

                if (b) {
                    this.vrp();
                }

                return this;
            };

            /**
             * Set image preferred size.
             * @param {Integer} w a width and height if the second argument has not been specified
             * @param {Integer} [h] a height
             * @method setImgPreferredSize
             * @chainable
             */
            this.setImgPreferredSize = function (w, h) {
                if (arguments.length === 1) h = w;
                this.byConstraints("image").setPreferredSize(w, h);
                return this;
            };
        }
    ]);

    /**
     * Progress bar UI component class.
     * @class zebkit.ui.Progress
     * @constructor
     * @extends {zebkit.ui.Panel}
     */

    /**
     * Fired when a progress bar value has been updated

            progress.on(function(src, oldValue) {
                ...
            });

     *  @event fired
     *  @param {zebkit.ui.Progress} src a progress bar that triggers
     *  the event
     *  @param {Integer} oldValue a progress bar previous value
     */
    pkg.Progress = Class(pkg.Panel, [
        function () {
            this.setBundleView("darkBlue");
            this._ = new zebkit.util.Listeners();
            this.$super();
        },

        function $prototype() {
            /**
             * Progress bar value
             * @attribute value
             * @type {Integer}
             * @readOnly
             */
            this.value = 0;

            /**
             * Progress bar bundle width
             * @attribute bundleWidth
             * @type {Integer}
             * @readOnly
             * @default 6
             */

            /**
             * Progress bar bundle height
             * @attribute bundleHeight
             * @type {Integer}
             * @readOnly
             * @default 6
             */
            this.bundleWidth = this.bundleHeight = 6;

            /**
             * Gap between bundle elements
             * @default 2
             * @attribute gap
             * @type {Integer}
             * @readOnly
             */
            this.gap = 2;

            /**
             * Progress bar maximal value
             * @attribute maxValue
             * @type {Integer}
             * @readOnly
             * @default 20
             */
            this.maxValue = 20;


            this.bundleView = this.titleView = null;

            /**
             * Progress bar orientation
             * @default "horizontal"
             * @attribute orient
             * @type {String}
             * @readOnly
             */
            this.orient = "horizontal";

            this.paint = function(g){
                var left    = this.getLeft(),
                    right   = this.getRight(),
                    top     = this.getTop(),
                    bottom  = this.getBottom(),
                    rs      = (this.orient === "horizontal") ? this.width - left - right
                                                             : this.height - top - bottom,
                    bundleSize = (this.orient === "horizontal") ? this.bundleWidth
                                                                : this.bundleHeight;

                if (rs >= bundleSize){
                    var vLoc   = Math.floor((rs * this.value) / this.maxValue),
                        x      = left,
                        y      = this.height - bottom,
                        bundle = this.bundleView,
                        wh     = this.orient === "horizontal" ? this.height - top - bottom
                                                              : this.width - left - right;

                    while (x < (vLoc + left) && this.height - vLoc - bottom < y){
                        if (this.orient === "horizontal"){
                            bundle.paint(g, x, top, bundleSize, wh, this);
                            x += (bundleSize + this.gap);
                        } else {
                            bundle.paint(g, left, y - bundleSize, wh, bundleSize, this);
                            y -= (bundleSize + this.gap);
                        }
                    }

                    if (this.titleView !== null) {
                        var ps = this.bundleView.getPreferredSize();
                        this.titleView.paint(g, Math.floor((this.width  - ps.width ) / 2),
                                                Math.floor((this.height - ps.height) / 2),
                                                ps.width, ps.height, this);
                    }
                }
            };

            this.calcPreferredSize = function(l){
                var bundleSize = (this.orient === "horizontal") ? this.bundleWidth
                                                                : this.bundleHeight,
                    v1 = (this.maxValue * bundleSize) + (this.maxValue - 1) * this.gap,
                    ps = this.bundleView.getPreferredSize();

                ps = (this.orient === "horizontal") ? {
                                                         width :v1,
                                                         height:(this.bundleHeight >= 0 ? this.bundleHeight
                                                                                        : ps.height)
                                                      }
                                                    : {
                                                        width:(this.bundleWidth >= 0 ? this.bundleWidth
                                                                                     : ps.width),
                                                        height: v1
                                                      };
                if (this.titleView !== null) {
                    var tp = this.titleView.getPreferredSize();
                    ps.width  = Math.max(ps.width, tp.width);
                    ps.height = Math.max(ps.height, tp.height);
                }
                return ps;
            };
        },

        /**
         * Set the progress bar orientation
         * @param {String} o an orientation: "vertical" or "horizontal"
         * @method setOrientation
         * @chainable
         */
        function setOrientation(o){
            if (o !== this.orient) {
                this.orient = zebkit.util.$validateValue(o, "horizontal", "vertical");
                this.vrp();
            }
            return this;
        },

        /**
         * Set maximal integer value the progress bar value can rich
         * @param {Integer} m a maximal value the progress bar value can rich
         * @method setMaxValue
         * @chainable
         */
        function setMaxValue(m){
            if (m !== this.maxValue) {
                this.maxValue = m;
                this.setValue(this.value);
                this.vrp();
            }
            return this;
        },

        /**
         * Set the current progress bar value
         * @param {Integer} p a progress bar
         * @method setValue
         * @chainable
         */
        function setValue(p){
            p = p % (this.maxValue + 1);
            if (this.value !== p){
                var old = this.value;
                this.value = p;
                this._.fired(this, old);
                this.repaint();
            }
            return this;
        },

        /**
         * Set the given gap between progress bar bundle elements
         * @param {Integer} g a gap
         * @method setGap
         * @chainable
         */
        function setGap(g){
            if (this.gap !== g){
                this.gap = g;
                this.vrp();
            }
            return this;
        },

        /**
         * Set the progress bar bundle element view
         * @param {zebkit.ui.View} v a progress bar bundle view
         * @method setBundleView
         * @chainable
         */
        function setBundleView(v){
            if (this.bundleView != v){
                this.bundleView = pkg.$view(v);
                this.vrp();
            }
            return this;
        },

        /**
         * Set the progress bar bundle element size
         * @param {Integer} w a bundle element width
         * @param {Integer} h a bundle element height
         * @method setBundleSize
         * @chainable
         */
        function setBundleSize(w, h){
            if (w !== this.bundleWidth && h !== this.bundleHeight){
                this.bundleWidth  = w;
                this.bundleHeight = h;
                this.vrp();
            }
            return this;
        }
    ]);
});
zebkit.package("ui.grid", function(pkg, Class) {
    var ui = pkg.cd("..");

    pkg.CaptionViewProvider = Class([
        function(render) {
            if (arguments.length === 0 || typeof render === 'undefined') {
                render = new ui.StringRender("");
            }

            this.render = render;
            this.render.setFont(pkg.GridCaption.font);
            this.render.setColor(pkg.GridCaption.fontColor);
        },

        function $prototype() {
            this.render = null;
            this.meta = null;

            /**
             * Set the default view provider text render font
             * @param {zebkit.ui.Font} f a font
             * @method setFont
             */
            this.setFont = function(f) {
                this.render.setFont(f);
                return this;
            };

            /**
             * Set the default view provider text render color
             * @param {String} c a color
             * @method setColor
             */
            this.setColor = function(c) {
                this.render.setColor(c);
                return this;
            };

            this.getView = function(target, rowcol, value){
                if (value !== null) {
                    if (typeof value.toView !== 'undefined') return value.toView();
                    if (typeof value.paint  !== 'undefined') return value;
                    this.render.setValue(value.toString());
                    return this.render;
                } else {
                    return null;
                }
            };

            this.$getCellMeta = function(rowcol) {
                if (this.meta === null) {
                    this.meta = {};
                }

                if (this.meta.hasOwnProperty(rowcol)) {
                    return this.meta[rowcol];
                } else {
                    this.meta[rowcol] = {
                        ax : null,
                        ay : null,
                        bg : null
                    };
                    return this.meta[rowcol];
                }
            };

            this.getXAlignment = function(target, rowcol) {
                return this.meta === null || this.meta.hasOwnProperty(rowcol) === false ? null
                                                                                        : this.meta[rowcol].ax;
            };

            this.getYAlignment = function(target, rowcol) {
                return this.meta === null || this.meta.hasOwnProperty(rowcol) === false ? null
                                                                                        : this.meta[rowcol].ay;
            };

            this.getCellBackground = function(target, rowcol) {
                return this.meta === null || this.meta.hasOwnProperty(rowcol) === false ? null
                                                                                        : this.meta[rowcol].bg;
            };

            this.setTitleAlignments = function(rowcol, ax, ay) {
                var m = this.$getCellMeta(rowcol);
                if (m.ax !== ax || m.ay !== ay) {
                    m.ax = ax;
                    m.ay = ay;
                    return true;
                } else {
                    return false;
                }
            };

            this.setCellBackground = function(rowcol, bg) {
                var m = this.$getCellMeta(rowcol);
                if (m.bg !== bg) {
                    m.bg = ui.$view(bg);

                    console.log("BG = " + bg);
                    return true;
                } else {
                    return false;
                }
            };
        }
    ]);

    /**
     * Grid caption class that implements rendered caption.
     * Rendered means all caption titles, border are painted
     * as a number of views.
     * @param  {Array} [titles] a caption titles. Title can be a string or
     * a zebkit.ui.View class instance
     * @param  {zebkit.ui.StringRender|zebkit.ui.TextRender} [render] a text render to be used
     * to paint grid titles
     * @constructor
     * @class zebkit.ui.grid.GridCaption
     * @extends zebkit.ui.grid.BaseCaption
     */
    pkg.GridCaption = Class(pkg.BaseCaption, [
        function(titles, render) {
            this.titles = {};

            this.psW = this.psH = 0;
            this.setViewProvider(new pkg.CaptionViewProvider(render));

            if (arguments.length === 0) {
                this.$super();
            } else {
                this.$super(titles);
            }
        },

        function $prototype() {
            this.provider = null;

            this.defYAlignment = this.defXAlignment = "center";

            this.defCellBg = null;

            this.setViewProvider = function(p) {
                if (p !== this.provider) {
                    this.provider = p;
                    this.vrp();
                }
                return this;
            };

            this.getTitle = function(rowcol) {
                return this.titles.hasOwnProperty(rowcol) ? this.titles[rowcol]
                                                          : null;
            };

            this.calcPreferredSize = function (l) {
                return { width:this.psW, height:this.psH };
            };

            this.setFont = function(f) {
                this.provider.setFont(f);
                this.vrp();
                return this;
            };

            this.setColor = function(c) {
                this.provider.setColor(c);
                this.repaint();
                return this;
            };

            this.recalc = function(){
                this.psW = this.psH = 0;
                if (this.metrics !== null){
                    var m     = this.metrics,
                        isHor = (this.orient === "horizontal"),
                        size  = isHor ? m.getGridCols() : m.getGridRows();

                    for(var i = 0;i < size; i++) {
                        var v = this.provider.getView(this, i, this.getTitle(i));
                        if (v !== null) {
                            var ps = v.getPreferredSize();
                            if (isHor === true) {
                                if (ps.height > this.psH) this.psH = ps.height;
                                this.psW += ps.width;
                            } else {
                                if (ps.width > this.psW) this.psW = ps.width;
                                this.psH += ps.height;
                            }
                        }
                    }

                    if (this.psH === 0) this.psH = pkg.Grid.DEF_ROWHEIGHT;
                    if (this.psW === 0) this.psW = pkg.Grid.DEF_COLWIDTH;
                }
            };

            /**
             * Put the given title for the given caption cell.
             * @param  {Integer} rowcol a grid caption cell index
             * @param  {String|zebkit.ui.View|zebkit.ui.Panel} title a title of the given grid caption cell.
             * Can be a string or zebkit.ui.View or zebkit.ui.Panel class instance
             * @method putTitle
             * @chainable
             */
            this.putTitle = function(rowcol, value) {
                if (value === null) {
                    if (title !== null) {
                        delete this.titles[rowcol];
                    }
                } else {
                    this.titles[rowcol] = value;
                }

                this.vrp();
                return this;
            };

            this.setTitleAlignments = function(rowcol, xa, ya){
                if (this.provider.setTitleAlignments(rowcol, xa, ya)) {
                    this.repaint();
                }
                return this;
            };

            this.setCellBackground = function(rowcol, bg) {
                if (this.provider.setCellBackground(rowcol, bg)) {
                    this.repaint();
                }
                return this;
            };

            this.getCaptionPS = function(rowcol) {
                var v = this.provider.getView(this, rowcol, this.getTitle(rowcol));
                return (v !== null) ? (this.orient === "horizontal" ? v.getPreferredSize().width
                                                                    : v.getPreferredSize().height)
                                    : 0;
            };
        },

        function paintOnTop(g) {
            if (this.metrics !== null){
                var cv = this.metrics.getCellsVisibility();

                if ((cv.fc !== null && cv.lc !== null && this.orient === "horizontal")||
                    (cv.fr !== null && cv.lr !== null && this.orient === "vertical"  )   )
                {
                    var isHor  = (this.orient === "horizontal"),
                        gap    = this.metrics.lineSize,
                        top    = this.getTop(),
                        left   = this.getLeft(),
                        bottom = this.getBottom(),
                        right  = this.getRight(),
                        x      = isHor ? cv.fc[1] - this.x + this.metrics.getXOrigin() - gap
                                       : left,
                        y      = isHor ? top
                                       : cv.fr[1] - this.y + this.metrics.getYOrigin() - gap,
                        size   = isHor ? this.metrics.getGridCols()
                                       : this.metrics.getGridRows();

                    //           top
                    //           >|<
                    //  +=========|===========================
                    //  ||        |
                    //  ||   +====|============+     +========
                    //  ||   ||   |            ||   ||
                    //  ||--------> left       ||   ||
                    //  ||   ||<-------------->||   ||
                    //  ||   ||       ww       ||   ||
                    //  ||   ||                ||   ||
                    // >-------< lineSize      ||   ||
                    //  ||   ||                ||   ||
                    //  x   first
                    //      visible

                    for(var i = (isHor ? cv.fc[0] : cv.fr[0]); i <= (isHor ? cv.lc[0] : cv.lr[0]); i++) {
                        var ww = isHor ? this.metrics.getColWidth(i)
                                       : this.width - left - right,
                            hh = isHor ? this.height - top - bottom
                                       : this.metrics.getRowHeight(i),
                            v = this.provider.getView(this, i, this.getTitle(i));

                        if (v !== null) {
                            var xa = this.provider.getXAlignment(this, i, v),
                                ya = this.provider.getYAlignment(this, i, v),
                                bg = this.provider.getCellBackground(this, i, v);

                            if (xa === null) {
                                xa = this.defXAlignment;
                            }

                            if (ya === null) {
                                ya = this.defYAlignment;
                            }

                            if (bg === null) {
                                bg = this.defCellBg;
                            }

                            var ps = v.getPreferredSize(),
                                vx = xa === "center" ? Math.floor((ww - ps.width)/2)
                                                     : (xa === "right" ? ww - ps.width - ((i === size - 1) ? right : 0)
                                                                       : (i === 0 ? left: 0)),
                                vy = ya === "center" ? Math.floor((hh - ps.height)/2)
                                                     : (ya === "bottom" ? hh - ps.height - ((i === size - 1) ? bottom : 0)
                                                                        : (i === 0 ? top: 0));


                            if (bg !== null) {
                                if (isHor) bg.paint(g, x, 0, ww + gap , this.height, this);
                                else       bg.paint(g, 0, y, this.width, hh + gap, this);
                            }

                            g.save();
                            g.clipRect(x + gap, y + gap, ww, hh);
                            v.paint(g, x + vx + gap, y + vy + gap, ps.width, ps.height, this);
                            g.restore();
                        }

                        if (isHor) x += ww + gap;
                        else       y += hh + gap;
                    }
                }

                this.$super(g);
            }
        }
    ]);
});
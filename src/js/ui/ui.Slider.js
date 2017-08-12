zebkit.package("ui", function(pkg, Class) {
    /**
     * Simple ruler panel class. The ruler can render minimal and maximal values of the
     * specified range.
     * @param  {String} [o] ruler orientation. Use "horizontal" or "vertical" as the
     * argument value
     * @constructor
     * @class zebkit.ui.RulerPan
     * @extends zebkit.ui.Panel
     */
    pkg.RulerPan = Class(pkg.Panel, [
        function(o) {
            this.$super();
            this.setLabelsRender(new this.clazz.PercentageLabels());
            if (arguments.length > 0) {
                this.setOrientation(o);
            }
        },

        function $clazz() {
            // TODO: complete the class
            this.LabelsHighlighter = zebkit.Interface([
                function paintLabel(g, x, y, w, h, v, value) {
                    this.$super(g, x, y, w, h, v, value);

                    if (typeof this.$labelsInfo === 'undefined') {
                        this.$labelsInfo = [];
                    }

                    var found = false;
                    for (var i = 0; i < this.$labelsInfo.length; i++) {
                        var info = this.$labelsInfo[i];
                        if (info.value === value) {
                            if (info.x !== x || info.y !== y || info.w !== w || info.h !== h) {
                                info.x = x;
                                info.y = y;
                                info.w = w;
                                info.h = h;
                            }
                            found = true;
                            break;
                        }
                    }

                    if (found === false) {
                        this.$labelsInfo.push({
                            value : value,
                            x     : x,
                            y     : y,
                            w     : w,
                            h     : h
                        });
                    }
                },

                function invalidate(p) {
                    this.$labelsInfo = [];
                    this.$selectedLabel = null;
                    this.$super();
                },

                function setParent(p) {
                    if (p === null && this.$labelsInfo) {
                        this.$labelsInfo = [];
                        this.$selectedLabel = null;
                    }
                    return this.$super(p);
                },

                function paint(g) {
                    if (this.highlighterView !== null && this.$selectedLabel !== null) {
                        this.highlighterView.paint(g, this.$selectedLabel.x,
                                                       this.$selectedLabel.y,
                                                       this.$selectedLabel.w,
                                                       this.$selectedLabel.h,
                                                    this);
                    }

                    this.$super(g);
                },

                function $prototype() {
                    this.catchInput = true;
                    this.$selectedLabel = null;
                    this.highlighterView = zebkit.draw.$view("yellow");

                    this.getLabelAt = function(x, y) {
                        if (typeof this.$labelsInfo !== 'undefined') {
                            for (var i = 0; i < this.$labelsInfo.length; i++) {
                                var inf = this.$labelsInfo[i];
                                if (x >= inf.x && x < inf.w + inf.x && y >= inf.y && y < inf.h + inf.y) {
                                    return inf;
                                }
                            }
                        }

                        return null;
                    };

                    this.pointerMoved = function(e) {
                        if (this.highlighterView !== null) {
                            var label = this.getLabelAt(e.x, e.y);
                            if (this.$selectedLabel !== label) {
                                this.$selectedLabel = label;
                                this.repaint();
                            }
                        }
                    };

                    this.pointerExited = function(e) {
                        if (this.highlighterView !== null) {
                            var label = this.getLabelAt(e.x, e.y);
                            if (this.$selectedLabel !== null) {
                                this.$selectedLabel = null;
                                this.repaint();
                            }
                        }
                    };

                    this.seHighlighterView = function(v) {
                        if (this.highlighterView !== v) {
                            this.highlighterView = v;
                            this.repaint();
                        }
                        return this;
                    };

                    this.pointerClicked = function(e) {
                        var label = this.getLabelAt(e.x, e.y);
                        if (label !== null) {
                            this.parent.setValue(label.value);
                        }
                    };
                }
            ]);

            /**
             * Numeric label renderer factory.
             * @param  {Integer} [numPrecision] precision of displayed numbers.
             * @class zebkit.ui.RulerPan.NumLabels
             * @extends zebkit.draw.BaseViewProvider
             */
            this.NumLabels = Class(zebkit.draw.BaseViewProvider, [
                function(numPrecision) {
                    this.$super(new zebkit.draw.BoldTextRender(""));
                    if (arguments.length > 0) {
                        this.numPrecision = numPrecision;
                    }
                },

                function $prototype() {
                    /**
                     * Number precision.
                     * @attribute numPrecision
                     * @type {Integer}
                     * @readOnly
                     * @default  -1
                     */
                    this.numPrecision = -1;
                },

                /**
                 * Get a view to render the given number.
                 * @param  {zebkit.ui.RulerPan} t a target ruler panel.
                 * @param  {Number} v a number to be rendered
                 * @return {zebkit.draw.View}  a view to render the number
                 * @method getView
                 */
                function getView(t, v) {
                    if (v !== null && typeof v !== 'undefined' && this.numPrecision !== -1 && zebkit.isNumber(v)) {
                        v = v.toFixed(this.numPrecision);
                    }
                    return this.$super(t, v);
                },

                function $clazz() {
                    this.color = "gray";
                    this.font  = new zebkit.Font("Arial", "bold", 12);
                }
            ]);

            /**
             * Percentage label renderer factory.
             * @param  {Integer} [numPrecision] precision of displayed numbers.
             * @class zebkit.ui.RulerPan.PercentageLabels
             * @extends zebkit.ui.RulerPan.NumLabels
             */
            this.PercentageLabels = Class(this.NumLabels, [
                function(numPrecision) {
                    if (arguments.length === 0) {
                        numPrecision = 0;
                    }
                    this.$super(numPrecision);
                },

                function getView(t, v) {
                    var min = t.getMin(),
                        max = t.getMax();

                    v = ((v - min) * 100) / (max - min);
                    if (this.numPrecision !== -1) {
                        v = v.toFixed(this.numPrecision);
                    }

                    return this.$super(t, v + "%");
                }
            ]);
        },

        /**
         * @for zebkit.ui.RulerPan
         */
        function $prototype() {
            /**
             * Gap between stroke and labels
             * @attribute gap
             * @type {Integer}
             * @readOnly
             * @default 2
             */
            this.gap = 2;

            /**
             * Stroke color.
             * @attribute color
             * @type {String}
             * @readOnly
             * @default "gray"
             */
            this.color = "gray";

            /**
             * Stroke line width
             * @attribute lineWidth
             * @type {Integer}
             * @default 1
             * @readOnly
             */
            this.lineWidth  = 1;

            /**
             * Stroke line size
             * @attribute strokeSize
             * @type {Integer}
             * @default 4
             * @readOnly
             */
            this.strokeSize = 4;

            /**
             * Ruler orientation ("horizontal" or "vertical").
             * @attribute orient
             * @type {String}
             * @readOnly
             * @default "horizontal"
             */
            this.orient = "horizontal";

            /**
             * Ruler labels alignment
             * @type {String}
             * @attribute labelsAlignment
             * @default "normal"
             * @readOnly
             */
            this.labelsAlignment = "normal"; // "invert"

            /**
             * Ruler labels provider
             * @type {zebkit.draw.BaseViewProvider}
             * @attribute provider
             * @readOnly
             * @protected
             */
            this.provider = null;

            /**
             * Indicates if labels have to be rendered
             * @attribute showLabels
             * @type {Boolean}
             * @default true
             * @readOnly
             */
            this.showLabels = true;

            /**
             * Indicate if stroke has to be rendered
             * @type {Boolean}
             * @attribute showStrokes
             * @readOnly
             * @default true
             */
            this.showStrokes = true;

            this.$min    = 0;
            this.$max    = 100;

            this.$minGap = this.$maxGap = 0;
            this.$psW    = this.$psH = 0;
            this.$maxLabSize = 0;

            /**
             * Show ruler labels with percentage.
             * @param  {Integer} [precision] a precision
             * @chainable
             * @method showPercentage
             */
            this.showPercentage = function(precision) {
                this.setLabelsRender(new this.clazz.PercentageLabels(arguments.length > 0 ? precision
                                                                                          : 0));
                return this;
            };

            /**
             * Show ruler labels with number.
             * @param  {Integer} [precision] a precision
             * @chainable
             * @method showNumbers
             */
            this.showNumbers = function(precision) {
                this.setLabelsRender(new this.clazz.NumLabels(arguments.length > 0 ? precision : 0));
                return this;
            };

            /**
             * Set the ruler color.
             * @param {String} c a color
             * @method setColor
             * @chainable
             */
            this.setColor = function(c) {
                if (c !== this.color) {
                    this.color = c;
                    this.repaint();
                }
                return this;
            };

            /**
             * Set the ruler gap between stroke and labels.
             * @param {Integer} gap a gap
             * @method setGap
             * @chainable
             */
            this.setGap = function(gap) {
                if (this.gap !== gap) {
                    this.gap = gap;
                    this.vrp();
                }
                return this;
            };

            /**
             * Set visibility of labels
             * @param {Boolean} b a boolean value that indicates if the
             * labels has to be shown
             * @method setShowLabels
             * @chainable
             */
            this.setShowLabels = function(b) {
                if (this.showLabels !== b) {
                    this.showLabels = b;
                    this.vrp();
                }
                return this;
            };

            /**
             * Set visibility of strokes
             * @param {Boolean} b a boolean value that indicates if the
             * strokes have to be shown
             * @method setShowStrokes
             * @chainable
             */
            this.setShowStrokes = function(b) {
                if (this.showStrokes !== b) {
                    this.showStrokes = b;
                    this.vrp();
                }
                return this;
            };

            /**
             * Set the labels font
             * @param {String|zebkit.Font} font a font of labels
             * @method setLabelsFont
             * @chainable
             */
            this.setLabelsFont = function() {
                if (this.provider !== null) {
                    this.provider.setFont.apply(this.provider,
                                                arguments);
                    this.vrp();
                }
                return this;
            };

            /**
             * Set the labels color
             * @param {String} color a color of labels
             * @method setLabelsColor
             * @chainable
             */
            this.setLabelsColor = function() {
                if (this.provider !== null) {
                    this.provider.setColor.apply(this.provider,
                                                 arguments);
                    this.vrp();
                }
                return this;
            };

            /**
             * Set the stroke size.
             * @param {Integer} strokeSize a stroke size
             * @method setStrokeSize
             * @chainable
             */
            this.setStrokeSize = function(strokeSize) {
                if (this.strokeSize !== strokeSize) {
                    this.strokeSize = strokeSize;
                    this.vrp();
                }
                return this;
            };

            /**
             * Set the labels render
             * @param {zebkit.draw.BaseViewProvider} r labels render
             * @method setLabelsRender
             * @chainable
             */
            this.setLabelsRender = function(p) {
                if (this.provider !== p) {
                    this.provider = p;
                    if (this.showLabels === true) {
                        this.vrp();
                    }
                }
                return this;
            };

            /**
             * Set the ruler labels alignment. Label alignment specifies a side the labels has
             * to be placed relatively stroke.
             * @param {String} a labels alignment. The value can be "normal" or "invert"
             * @method setLabelsAlignment
             * @chainable
             */
            this.setLabelsAlignment = function(a) {
                if (this.labelsAlignment !== a) {
                    zebkit.util.$validateValue(a, "normal", "invert");
                    this.labelsAlignment = a;
                    this.repaint();
                }
                return this;
            };

            /**
             * Set the ruler range.
             * @param {Number} min a minimal value of the range
             * @param {Number} max a maximal value of the range
             * @method setRange
             * @chainable
             */
            this.setRange = function(min, max) {
                if (min >= max) {
                    throw new Error("Invalid range [" + min + "," + max + "]");
                }

                if (this.$min !== min || this.$max !== max) {
                    this.$min = min;
                    this.$max = max;
                    this.vrp();
                }
                return this;
            };

            /**
             * Get the ruler effective size. The size includes only pixels that are
             * used to be transformed into range values.
             * @return {Integer} a ruler size
             * @protected
             * @method $getRulerSize
             */
            this.$getRulerSize = function() {
                var s = (this.orient === "horizontal" ? this.width  - this.getLeft() - this.getRight()
                                                      : this.height - this.getTop()  - this.getBottom());
                return s - this.$minGap - this.$maxGap;
            };

            /**
             * Get a minimal value in the ruler values range
             * @return {Number} a minimal range value
             * @method getMin
             */
            this.getMin = function() {
                return this.$min;
            };

            /**
             * Get a maximal value in the ruler values range
             * @return {Number} a maximal range value
             * @method getMax
             */
            this.getMax = function() {
                return this.$max;
            };

            /**
             * Project the given range value to appropriate ruler component coordinate
             * @param  {Number} v a range value
             * @return {Integer} coordinate
             * @method toLocation
             */
            this.toLocation = function(v) {
                var max = this.getMax(),
                    min = this.getMin(),
                    xy  = Math.floor((this.$getRulerSize() * (v - min)) / (max - min));

                return  (this.orient === "vertical") ? this.height - this.getBottom() - this.$minGap - xy
                                                     : this.getLeft() + this.$minGap + xy;
            };

            /**
             * Project the given ruler component coordinate to a range value.
             * @param  {Integer} xy a x or y (depending on the ruler orientation) coordinate
             * @return {Number} a range value
             * @method toValue
             */
            this.toValue = function(xy) {
                var min = this.getMin(),
                    max = this.getMax(),
                    sl  = (this.orient === "horizontal") ? this.getLeft() + this.$minGap
                                                         : this.getTop()  + this.$minGap,
                    ss = this.$getRulerSize();

                if (this.orient === "vertical") {
                    xy = this.height - xy - 1;
                }

                if (xy < sl) {
                    xy = sl;
                } else if (xy > sl + ss) {
                    xy = sl + ss;
                }

                return min + ((max - min) * (xy - sl)) / ss;
            };

            /**
             * Set the ruler orientation
             * @param {String} o an orientation. Use "horizontal" or "vertical" values.
             * @method setOrientation
             * @chainable
             */
            this.setOrientation = function(o) {
                if (this.orient !== o) {
                    this.orient = zebkit.util.$validateValue(o, "vertical", "horizontal");
                    this.vrp();
                }
                return this;
            };

            this.calcPreferredSize = function() {
                return {
                    width  : this.$psW,
                    height : this.$psH
                };
            };

            this.recalc = function() {
                this.$maxLabSize = this.$psW = this.$psH = this.$maxGap = this.$minGap = 0;
                if (this.isVisible) {
                    this.recalcMetrics();
                }
            };

            /**
             * Called when the ruler requires its metric recalculation
             * @method recalcMetrics
             */
            this.recalcMetrics = function() {
                if (this.provider !== null && this.showLabels === true) {
                    // TODO: pay attention since view render shares single render
                    // don't store instance of view and then store another instance
                    // of view
                    var minView   = this.provider.getView(this, this.getMin()),
                        minViewPs = minView === null ? { width: 0, height: 0 } : minView.getPreferredSize(),
                        maxView   = this.provider.getView(this, this.getMax()),
                        maxViewPs = maxView === null ? { width: 0, height: 0 } : maxView.getPreferredSize();

                    if (this.orient === "horizontal") {
                        this.$minGap = Math.round(minViewPs.width / 2);
                        this.$maxGap = Math.round(maxViewPs.width / 2);
                        this.$maxLabSize = Math.max(minViewPs.height, maxViewPs.height);
                    } else {
                        this.$maxLabSize = Math.max(minViewPs.width, maxViewPs.width);
                        this.$minGap = Math.round(minViewPs.height / 2);
                        this.$maxGap = Math.round(maxViewPs.height / 2);
                    }
                }

                if (this.orient === "vertical") {
                    this.$psH = 50 * this.lineWidth  + this.$minGap + this.$maxGap;
                    this.$psW = (this.showStrokes ? this.strokeSize : 0) +
                                (this.$maxLabSize === 0 ? 0 : this.$maxLabSize + this.gap);
                } else {
                    this.$psW = 50 * this.lineWidth + this.$minGap + this.$maxGap;
                    this.$psH = (this.showStrokes ? this.strokeSize : 0) +
                                (this.$maxLabSize === 0 ? 0 : this.$maxLabSize + this.gap);
                }
            };

            //   =================================================================
            //            ^                            ^
            //            |  top                       | top
            //        . . .                        +---------+ . . .
            //       ||   ^                        | Label   |   ^
            //       ||   | strokeSize             |         |   |  $maxLabSize
            //       ||   |                        +---------+ . |
            //            ^                                      ^
            //            |  gap                        . . . . .|  gap
            //    +---------+ . . .                    ||        ^
            //    | Label   |   ^                      ||        |
            //    |         |   |  $maxLabSize         ||        | strokeSize
            //    +---------+ . ^                       . . . . .^
            //                  |  bottom                        | bottom
            // ==================================================================

            this.paint = function(g) {
                if (this.provider !== null) {
                    var min  = this.getMin(),
                        max  = this.getMax(),
                        view = null,
                        yy   = 0,
                        xx   = 0,
                        ps   = null,
                        ss   = this.showStrokes ? this.strokeSize : 0;

                    g.setColor(this.color);

                    if (this.orient === "horizontal") {
                        yy   = this.getTop();
                        xx   = this.getLeft() + this.$minGap;

                        if (this.showLabels) {
                            view = this.provider.getView(this, min);
                            if (view !== null) {
                                ps = view.getPreferredSize();
                                view.paint(g,
                                           this.toLocation(min) - Math.round(ps.width / 2),
                                           this.labelsAlignment === "normal" ? yy + ss + this.gap
                                                                             : yy + this.$maxLabSize - ps.height,
                                           ps.width,
                                           ps.height,
                                           this);
                            }

                            view = this.provider.getView(this, max);
                            if (view !== null) {
                                ps = view.getPreferredSize();
                                view.paint(g,
                                           this.toLocation(max) - Math.round(ps.width / 2),
                                           this.labelsAlignment === "normal" ? yy + ss + this.gap
                                                                             : yy + this.$maxLabSize - ps.height,
                                           ps.width,
                                           ps.height,
                                           this);
                            }

                            if (this.labelsAlignment !== "normal") {
                                yy += (this.$maxLabSize + this.gap);
                            }
                        }

                        g.drawLine(xx, yy, xx, yy + ss, this.lineWidth);
                        xx = this.width - this.getRight() - this.$maxGap - 1;
                        g.drawLine(xx, yy, xx, yy + ss, this.lineWidth);

                    } else {
                        yy   = this.getTop() + this.$maxGap;
                        xx   = this.getLeft();
                        if (this.showLabels) {
                            view = this.provider.getView(this, min);
                            if (view !== null) {
                                ps = view.getPreferredSize();
                                this.paintLabel(g,
                                                this.labelsAlignment === "normal" ? xx + this.$maxLabSize - ps.width
                                                                                  : ss + this.gap + xx,
                                                this.toLocation(min) - Math.round(ps.height / 2),
                                                ps.width, ps.height,
                                                view, min);
                            }

                            view = this.provider.getView(this, max);
                            if (view !== null) {
                                ps = view.getPreferredSize();
                                this.paintLabel(g,
                                                this.labelsAlignment === "normal" ? xx + this.$maxLabSize - ps.width
                                                                                  : ss + this.gap + xx,
                                                this.toLocation(max) - Math.round(ps.height / 2),
                                                ps.width,
                                                ps.height,
                                                view, max);
                            }

                            if (this.labelsAlignment === "normal") {
                                xx += (this.$maxLabSize + this.gap);
                            }
                        }

                        g.drawLine(xx, yy, xx + ss, yy, this.lineWidth);
                        yy = this.height - this.getBottom() - this.$minGap - 1;
                        g.drawLine(xx, yy, xx + ss, yy, this.lineWidth);
                    }
                }
            };

            this.paintLabel = function(g, x, y, w, h, v, value) {
                if (v !== null) {
                    v.paint(g, x, y, w, h, this);
                }
            };

            this.getLabelAt = function(x, y) {
                return null;
            };
        }
    ]);

    /**
     * Pointer ruler class. The ruler uses generator class instance to get and render labels values
     * @param  {String} o an orientation.
     * @constructor
     * @class zebkit.ui.PointRulerPan
     * @extends zebkit.ui.RulerPan
     */
    pkg.PointRulerPan = Class(pkg.RulerPan, [
        function() {
            this.$supera(arguments);
            this.$generator = new this.clazz.DeltaPointsGenerator(10);
        },

        function $clazz() {
            /**
             * Basic class to implement sequence of points values
             * @class zebkit.ui.PointRulerPan.PointsGenerator
             * @constructor
             */
            this.PointsGenerator = Class([
                function $prototype() {
                    /**
                     * Generate next point value in the sequence or null if end of sequence has been reached.
                     * @param  {zebkit.ui.RulerPan} ruler a ruler
                     * @param  {Integer} index a point index
                     * @return {Number} a value for the given point with the specified index
                     * @method pointValue
                     */
                    this.pointValue = function(ruler, index) {
                        return null;
                    };
                }
            ]);

            /**
             * Delta point generator implementation. The generator uses fixed delta value
             * to calculate next value of the points sequence.
             * @param {Number} [delta] a delta
             * @class zebkit.ui.PointRulerPan.DeltaPointsGenerator
             * @extends zebkit.ui.PointRulerPan.PointsGenerator
             * @constructor
             */
            this.DeltaPointsGenerator = Class(this.PointsGenerator, [
                function(delta) {
                    if (arguments.length > 0) {
                        this.$delta = delta;
                    }
                },

                function $prototype() {
                    /**
                     * Delta
                     * @attribute $delta
                     * @type {Number}
                     * @readOnly
                     * @protected
                     */
                    this.$delta = 0;

                    this.pointValue = function(ruler, i) {
                        if (this.$delta === 0) {
                            return null;
                        } else {
                            var v = ruler.getMin() + i * this.$delta;
                            return (v > ruler.getMax()) ? null : v;
                        }
                    };
                }
            ]);
        },

        /**
         * @for zebkit.ui.PointRulerPan
         */
        function $prototype() {
            this.$generator = null;

            /**
             * Set the points values generator
             * @param {zebkit.ui.PointRulerPan.PointsGenerator} g a point generator
             * @method setPointsGenerator
             */
            this.setPointsGenerator = function(g) {
                if (this.$generator !== g) {
                    this.$generator = g;
                    this.vrp();
                }
                return this;
            };

            /**
             * Setup delta points generator. The generator builds points sequence basing on incrementing
             * the sequence with fixed delta number.
             * @param  {Number} delta a delta
             * @chainable
             * @method useDeltaPointsGenerator
             */
            this.useDeltaPointsGenerator = function(delta) {
                this.setPointsGenerator(new this.clazz.DeltaPointsGenerator(delta));
                return this;
            };

            this.recalcMetrics = function() {
                if (this.provider !== null && this.showLabels === true) {
                    var i   = 0,
                        v   = null,
                        min = this.getMin(),
                        max = this.getMax();

                    while ((v = this.$generator.pointValue(this, i++)) !== null) {
                        var view = this.provider.getView(this, v);
                        if (view !== null) {
                            var ps = view.getPreferredSize();
                            if (this.orient === "horizontal") {
                                if (ps.height > this.$maxLabSize) {
                                    this.$maxLabSize = ps.height;
                                }

                                if (min === v) {
                                    this.$minGap = Math.round(ps.width / 2);
                                } else if (max === v) {
                                    this.$maxGap = Math.round(ps.width / 2);
                                }

                            } else {
                                if (ps.width > this.$maxLabSize) {
                                    this.$maxLabSize = ps.width;
                                }

                                if (min === v) {
                                    this.$minGap = Math.round(ps.height / 2);
                                } else if (max === v) {
                                    this.$maxGap = Math.round(ps.height / 2);
                                }
                            }
                        }
                    }
                }

                if (this.orient === "vertical") {
                    this.$psH = 50 + this.$minGap + this.$maxGap;
                    this.$psW = (this.showStrokes ? this.strokeSize : 0) +
                                (this.$maxLabSize === 0 ? 0 : this.$maxLabSize + this.gap);
                } else {
                    this.$psW = 50 + this.$minGap + this.$maxGap;
                    this.$psH = (this.showStrokes ? this.strokeSize : 0) +
                                (this.$maxLabSize === 0 ? 0 : this.$maxLabSize + this.gap);
                }
            };

            this.paint = function(g) {
                if (this.$generator !== null) {
                    var y          = this.getTop(),
                        x          = this.getLeft(),
                        prevLabLoc = null,
                        prevPs     = null,
                        v          = null,
                        i          = 0,
                        j          = 0,
                        ss         = this.showStrokes ? this.strokeSize : 0;

                    g.beginPath();
                    while ((v = this.$generator.pointValue(this, i++)) !== null) {
                        var loc = this.toLocation(v);

                        if (this.provider !== null && this.showLabels === true) {
                            var view     = this.provider.getView(this, v),
                                rendered = false;

                            if (view !== null) {
                                var ps = view.getPreferredSize();

                                if (this.orient === "horizontal") {
                                    if (prevLabLoc === null || loc > prevLabLoc + prevPs.width) {
                                        this.paintLabel(g,
                                                        loc - Math.floor(ps.width / 2),
                                                        this.labelsAlignment === "normal" ?  y  + ss + this.gap
                                                                                          :  y,
                                                        ps.width, ps.height,
                                                        view, v);

                                        prevLabLoc = loc;
                                        prevPs     = ps;
                                        rendered   = true;
                                    }
                                } else {
                                    if (prevLabLoc === null || Math.round(loc + ps.height/2) < prevLabLoc) {
                                        prevLabLoc = loc - Math.floor(ps.height / 2);
                                        this.paintLabel(g,
                                                        this.labelsAlignment === "normal" ? x  + ss + this.gap
                                                                                          : x,
                                                        prevLabLoc,
                                                        ps.width,
                                                        ps.height,
                                                        view, v);
                                        rendered = true;
                                    }
                                }
                            }

                            if (rendered === true && this.showStrokes) {
                                if (this.orient === "horizontal") {
                                    if (this.labelsAlignment === "normal") {
                                        g.moveTo(loc + 0.5, y);
                                        g.lineTo(loc + 0.5, y + this.strokeSize);
                                    } else {
                                        g.moveTo(loc + 0.5, y + this.$maxLabSize + this.gap);
                                        g.lineTo(loc + 0.5, y + this.$maxLabSize + this.gap + this.strokeSize);
                                    }
                                } else {
                                    if (this.labelsAlignment === "normal") {
                                        g.moveTo(x, loc + 0.5);
                                        g.lineTo(x + this.strokeSize, loc + 0.5);
                                    } else {
                                        g.moveTo(x + this.$maxLabSize + this.gap, loc + 0.5);
                                        g.lineTo(x + this.$maxLabSize + this.gap + this.strokeSize, loc + 0.5);
                                    }
                                }
                            }

                        } else {
                            if (this.showStrokes) {
                                if (this.orient === "horizontal") {
                                    if (this.labelsAlignment === "normal") {
                                        g.moveTo(loc + 0.5, y);
                                        g.lineTo(loc + 0.5, y + this.strokeSize);
                                    } else {
                                        g.moveTo(loc + 0.5, y + this.$maxLabSize + this.gap);
                                        g.lineTo(loc + 0.5, y + this.$maxLabSize + this.gap + this.strokeSize);
                                    }
                                } else {
                                    if (this.labelsAlignment === "normal") {
                                        g.moveTo(x, loc + 0.5);
                                        g.lineTo(x + this.strokeSize, loc + 0.5);
                                    } else {
                                        g.moveTo(x + this.$maxLabSize + this.gap, loc + 0.5);
                                        g.lineTo(x + this.$maxLabSize + this.gap + this.strokeSize, loc + 0.5);
                                    }
                                }
                            }
                        }
                    }

                    g.lineWidth = this.lineWidth;
                    g.setColor(this.color);
                    g.stroke();
                }
            };
        }
    ]);

    /**
     * Linear ruler class. The ruler draws strokes using dedicated pixel delta value.
     * @param  {String} [o] an orientation (use "vertical" or "horizontal" as the parameter value)
     * @class zebkit.ui.LinearRulerPan
     * @constructor
     * @extends zebkit.ui.RulerPan
     */
    pkg.LinearRulerPan = Class(pkg.RulerPan, [
        function $prototype() {
            this.strokeStep = 2;
            this.longStrokeRate = this.strokeStep * 8;

            this.setStrokeStep = function(strokeStep, longStrokeRate) {
                var b = false;
                if (strokeStep !== this.strokeStep) {
                    this.strokeStep = strokeStep;
                    b = true;
                }

                if (arguments.length > 1) {
                    if (this.longStrokeRate !== longStrokeRate) {
                        this.longStrokeRate = longStrokeRate;
                        b = true;
                    }
                } else if (this.longStrokeRate <= 2 * strokeStep) {
                    this.longStrokeRate = strokeStep * 8;
                    b = true;
                }

                if (b) {
                    this.repaint();
                }

                return this;
            };

            this.paint = function(g) {
                var i          = 0,
                    ss         = this.showStrokes ? this.strokeSize : 0,
                    ps         = null,
                    prevLabLoc = null,
                    prevPs     = null,
                    rendered   = false,
                    v          = null,
                    view       = null,
                    loc        = 0;

                g.beginPath();

                if (this.orient === "horizontal") {
                    var y          = this.getTop(),
                        xx         = this.getLeft() + this.$minGap,
                        maxX       = this.width - this.getRight() - this.$maxGap - 1;

                    for (i = 0; xx <= maxX; i++, xx += this.strokeStep) {
                        if (i % this.longStrokeRate === 0) {
                            rendered = false;

                            if (this.provider !== null && this.showLabels) {
                                v    = this.toValue(xx);
                                view = this.provider.getView(this, v);

                                if (view !== null) {
                                    ps = view.getPreferredSize();

                                    loc = xx - Math.round(ps.width / 2);
                                    if (prevLabLoc === null || loc > prevLabLoc + prevPs.width) {
                                        this.paintLabel(g,
                                                        loc,
                                                        this.labelsAlignment === "normal" ? y + 2 * ss + this.gap
                                                                                          : y,
                                                        ps.width, ps.height, view, v);

                                        prevLabLoc = loc;
                                        prevPs  = ps;
                                        rendered = true;
                                    }
                                }
                            }

                            if (this.showStrokes) {
                                if (this.labelsAlignment === "normal") {
                                    g.moveTo(xx + 0.5, y);
                                    g.lineTo(xx + 0.5, y + (rendered ? 2 * ss : ss));
                                } else {
                                    g.moveTo(xx + 0.5, y + this.$maxLabSize + this.gap + (rendered ? 0 : ss));
                                    g.lineTo(xx + 0.5, y + this.$maxLabSize + this.gap + 2 * ss);
                                }
                            }
                        } else if (this.showStrokes) {
                            if (this.labelsAlignment === "normal") {
                                g.moveTo(xx + 0.5, y);
                                g.lineTo(xx + 0.5, y + ss);
                            } else {
                                g.moveTo(xx + 0.5, y + this.$maxLabSize + this.gap + ss);
                                g.lineTo(xx + 0.5, y + this.$maxLabSize + this.gap + 2 * ss);
                            }
                        }
                    }
                } else {
                    var x    = this.getLeft(),
                        yy   = this.height - this.getBottom() - this.$minGap - 1,
                        minY = this.getTop() + this.$maxGap;

                    for (i = 0; yy >= minY; i++, yy -= this.strokeStep) {
                        if (i % this.longStrokeRate === 0) {
                            rendered = false;

                            if (this.provider !== null && this.showLabels) {
                                v    = this.toValue(yy);
                                view = this.provider.getView(this, v);

                                if (view !== null) {
                                    ps = view.getPreferredSize();

                                    loc = yy - Math.round(ps.height / 2);
                                    if (prevLabLoc === null || (loc + ps.height) < prevLabLoc) {
                                        this.paintLabel(g,
                                                        this.labelsAlignment === "normal" ? x + 2 * ss + this.gap
                                                                                          : x,
                                                        loc,
                                                        ps.width, ps.height, view, v);

                                        prevLabLoc = loc;
                                        rendered = true;
                                    }
                                }
                            }

                            if (this.showStrokes) {
                                if (this.labelsAlignment === "normal") {
                                    g.moveTo(x, yy + 0.5);
                                    g.lineTo(x + (rendered ? 2 * ss : ss), yy + 0.5);
                                } else {
                                    g.moveTo(x + this.$maxLabSize + this.gap + (rendered ? 0 : ss), yy + 0.5);
                                    g.lineTo(x + this.$maxLabSize + this.gap + 2 * ss, yy + 0.5);
                                }
                            }
                        } else if (this.showStrokes) {
                            if (this.labelsAlignment === "normal") {
                                g.moveTo(x, yy + 0.5);
                                g.lineTo(x + ss, yy + 0.5);
                            } else {
                                g.moveTo(x + this.$maxLabSize + this.gap + ss, yy + 0.5);
                                g.lineTo(x + this.$maxLabSize + this.gap + 2 * ss, yy + 0.5);
                            }
                        }
                    }
                }

                g.setColor(this.color);
                g.lineWidth = this.lineWidth;
                g.stroke();
            };
        },

        function recalcMetrics() {
            this.$super();
            if (this.orient === "horizontal") {
                this.$psH += this.strokeSize;
            } else {
                this.$psW += this.strokeSize;
            }
        }
    ]);

    /**
     * Slider UI component class.
     * @class  zebkit.ui.Slider
     * @param {String} [o]  a slider orientation ("vertical or "horizontal")
     * @constructor
     * @extends zebkit.ui.Panel
     * @uses   zebkit.ui.DecorationViews
     */
    pkg.Slider = Class(pkg.Panel, pkg.DecorationViews, [
        function(o) {
            this._ = new zebkit.util.Listeners();
            this.views = {
                marker: null,
                gauge : null
            };

            this.$super();

            var ruler = null;
            if (arguments.length > 0) {
                if (zebkit.instanceOf(o, zebkit.ui.RulerPan)) {
                    this.orient = o.orient;
                    ruler = o;
                } else {
                    ruler = new pkg.RulerPan(o);
                }
            } else {
                ruler = new pkg.RulerPan(this.orient);
            }

            this.add("ruler", ruler);
            this.add("gauge", new this.clazz.GaugePan());
        },

        function $clazz() {
            this.GaugePan = Class(pkg.Panel, []);
        },

        function $prototype() {
            /**
             * Current slider value
             * @type {Number}
             * @attribute value
             * @readOnly
             */
            this.value = 0;

            /**
             * Slider orientation.
             * @type {String}
             * @attribute orient
             * @readOnly
             */
            this.orient = "horizontal";

            /**
             * Gap between slider handle and ruler
             * @type {Integer}
             * @attribute gap
             * @readOnly
             * @default 4
             */
            this.gap = 4;

            this.canHaveFocus = true;

            /**
             * Granularity of sliding.
             * @type {Number}
             * @attribute granularity
             * @readOnly
             * @default 1
             */
            this.granularity = 1;

            /**
             * Ruler component.
             * @type {zebkit.ui.RulerPan}
             * @attribute ruler
             * @readOnly
             */
            this.ruler = null;


            this.gauge = null;


            this.handle = null;

            this.$dragged = false;
            this.$dxy = this.$val = 0;

            this.compAdded = function(e) {
                if (e.constraints === "ruler") {
                    this.ruler = e.kid;
                    this.orient = this.ruler.orient;
                    this.setValue(this.ruler.getMin());
                } else if (e.constraints === "gauge") {
                    this.gauge = e.kid;
                }
            };

            this.compRemoved = function(e) {
                if (this.gauge === e.kid) {
                    this.gauge = null;
                }
            };

            this.setHandleView = function(v) {
                if (this.handle !== v) {
                    this.handle = zebkit.draw.$view(v);
                    this.vrp();
                }
                return this;
            };

            /**
             * Get maximal possible value.
             * @return {Number} a value
             * @method getMax
             */
            this.getMax = function() {
                return this.ruler.getMax();
            };

            /**
             * Get minimal possible value.
             * @return {Number} a value
             * @method getMin
             */
            this.getMin = function() {
                return this.ruler.getMin();
            };

            this.toLocation = function(v) {
                return (this.orient === "horizontal") ? this.ruler.toLocation(v) + this.ruler.x
                                                      : this.ruler.toLocation(v) + this.ruler.y;
            };

            this.getHandleView = function() {
                var h = this.orient === "horizontal" ? this.views.horHandle
                                                     : this.views.verHandle;
                return typeof h === 'undefined' ? null : h;
            };

            this.getHandlePreferredSize = function() {
                var h = this.orient === "horizontal" ? this.views.horHandle
                                                     : this.views.verHandle;
                return typeof h === 'undefined' || h === null ? { width: 0, height: 0}
                                                              : h.getPreferredSize();
            };

            /**
             * Set orientation
             * @param {String} o an orientation. Use "horizontal" or "vertical" as the parameter value
             * @method setOrientation
             * @chainable
             */
            this.setOrientation = function(o) {
                if (this.orient !== o) {
                    this.orient = zebkit.util.$validateValue(o, "vertical", "horizontal");
                    this.ruler.setOrientation(o);
                    this.vrp();
                }
                return this;
            };

            this.pointerDragged = function(e){
                if (this.$dragged) {
                    var max  = this.ruler.getMax(),
                        min  = this.ruler.getMin(),
                        dxy = (this.orient === "horizontal" ? e.x - this.$sxy : this.$sxy - e.y);

                    // TODO: ruler.toValue
                    this.setValue(this.$val + dxy * ((max - min)/ this.ruler.$getRulerSize()));
                }
            };

            //
            //    +---------------------------------------------------------
            //    |        ^
            //    |        | top
            //    |      . . . . . . . . . . . . . . . . . . . . . . . . . .
            //    | left .                ------ ----------------------
            //    |<---->.               |      |                    ^
            //    |      .               |      |                    |
            //    |      . ==============|      |=================   |  handler
            //    |      . ==============|      |=================   | preferred
            //    |      .               |      |                    |   height
            //    \      .               |      |                    |
            //    |      .                ------
            //    |      .                  ^
            //    |      .                  | gap
            //    |      .  |---|---|---|---|---|---|---|---|---|---|---|  ^
            //    |      .              |               |               |  | 2 * netSize
            //    |      .              ^
            //    |      .              | gap
            //    |      .            Num_1            Num_2          Num_3
            //

            this.paintOnTop = function(g) {
                var left        = this.getLeft(),
                    top         = this.getTop(),
                    right       = this.getRight(),
                    bottom      = this.getBottom(),
                    handleView  = this.getHandleView(),
                    handlePs    = this.getHandlePreferredSize(),
                    w           = this.width  - left - right,
                    h           = this.height - top  - bottom;

                if (this.orient === "horizontal") {
                    if (handleView !== null) {
                        handleView.paint(g, this.getHandleLoc(),
                                            top,
                                            handlePs.width,
                                            handlePs.height,
                                            this);
                    }
                } else {
                    if (handleView !== null) {
                        handleView.paint(g, left,
                                            this.getHandleLoc(),
                                            handlePs.width,
                                            handlePs.height,
                                            this);
                    }
                }

                if (this.hasFocus() && this.views.marker) {
                    this.views.marker.paint(g, left, top, w, h, this);
                }
            };

            this.getHandleLoc = function() {
                var hs = this.getHandlePreferredSize();
                return (this.orient === "horizontal") ? this.toLocation(this.value) - Math.round(hs.width  / 2)
                                                      : this.toLocation(this.value) - Math.round(hs.height / 2);
            };

            this.getHandleBounds = function() {
                var bs = this.getHandlePreferredSize();
                return this.orient === "horizontal" ? {
                    x: this.getHandleLoc(),
                    y: this.getTop(),
                    width : bs.width,
                    height: bs.height
                }
                                                   : {
                    x: this.getLeft(),
                    y: this.getHandleLoc(),
                    width : bs.width,
                    height: bs.height
                };
            };

            this.catchInput = function(target) {
                return target !== this.ruler || this.ruler.catchInput !== true;
            };

            this.doLayout = function(t) {
                var gaugePs = this.gauge !== null && this.gauge.isVisible ? this.gauge.getPreferredSize() : null,
                    hs      = this.getHandlePreferredSize(),
                    h2s     = this.orient === "vertical" ? Math.round(hs.height / 2)
                                                         : Math.round(hs.width / 2);


                if (this.orient === "vertical") {
                    var y = this.getTop() + (this.ruler.$maxGap >= h2s ? 0 : h2s - this.ruler.$maxGap);

                    this.ruler.setLocation(this.getLeft() + hs.width + this.gap, y);
                    this.ruler.setSize(this.ruler.getPreferredSize().width,
                        this.height - y - this.getBottom() -
                                       (this.ruler.$minGap >= h2s ? 0 : (h2s - this.ruler.$minGap)));

                    if (this.gauge !== null && this.gauge.isVisible) {
                        this.gauge.setBounds(this.getLeft() + Math.floor((hs.width - gaugePs.width) / 2),
                                             this.getTop(),
                                             gaugePs.width,
                                             this.height - this.getTop() - this.getBottom());
                    }

                } else {
                    var x = this.getLeft() + (this.ruler.$minGap >= h2s ? 0 : h2s - this.ruler.$minGap);

                    this.ruler.setLocation(x, this.getTop() + hs.height + this.gap);
                    this.ruler.setSize(this.width - x - this.getRight() -
                                       (this.ruler.$maxGap >= h2s ? 0 : (h2s - this.ruler.$maxGap)),
                                        this.ruler.getPreferredSize().height);



                    if (this.gauge !== null && this.gauge.isVisible) {
                        this.gauge.setBounds(this.getLeft(),
                                             this.getTop() + Math.floor((hs.height - gaugePs.height) / 2),
                                             this.width - this.getLeft() - this.getRight(),
                                             gaugePs.height);
                    }
                }
            };

            this.calcPreferredSize = function(l) {
                var ps  = this.getHandlePreferredSize();

                if (this.ruler.isVisible === true) {
                    var rps = this.ruler.getPreferredSize(),
                        h2s = 0;

                    if (this.orient === "horizontal") {
                        h2s = Math.round(ps.width / 2);
                        ps.height += (this.gap + rps.height);
                        ps.width = 10 * ps.width +
                                   Math.max(h2s, this.ruler.isVisible ? this.ruler.$minGap : 0) +
                                   Math.max(h2s, this.ruler.isVisible ? this.ruler.$maxGap : 0);
                    } else {
                        h2s = Math.round(ps.height / 2);
                        ps.height = 10 * ps.height +
                                    Math.max(h2s, this.ruler.isVisible ? this.ruler.$minGap : 0) +
                                    Math.max(h2s, this.ruler.isVisible ? this.ruler.$maxGap : 0);

                        ps.width += (this.gap + rps.width);
                    }
                }
                return ps;
            };

            /**
             * Set the slider value that has to be withing the given defined range.
             * If the value is out of the defined range then the value will be
             * adjusted to maximum or minimum possible value.
             * @param {Number} v a value
             * @method setValue
             * @chainable
             */
            this.setValue = function(v) {
                // normalize value
                v = Math.round(v / this.granularity) * this.granularity;

                var max = this.getMax(),
                    min = this.getMin();

                // align value
                if (v > max) {
                    v = max;
                } else if (v < min) {
                    v = min;
                }

                var prev = this.value;
                if (this.value !== v){
                    this.value = v;
                    this._.fired(this, prev);
                    this.repaint();
                }

                return this;
            };

            this.keyPressed = function(e) {
                switch(e.code) {
                    case "ArrowDown":
                    case "ArrowLeft":
                        this.setValue(this.value - this.granularity);
                        break;
                    case "ArrowUp":
                    case "ArrowRight":
                        this.setValue(this.value + this.granularity);
                        break;
                    case "Home":
                        this.setValue(this.getMin());
                        break;
                    case "End":
                        this.setValue(this.getMax());
                        break;
                }
            };

            this.pointerClicked = function (e){
                if (e.isAction()) {
                    var x = e.x,
                        y = e.y,
                        handle = this.getHandleBounds();

                    if (x < handle.x ||
                        y < handle.y ||
                        x >= handle.x + handle.width ||
                        y >= handle.y + handle.height   )
                    {
                        if (this.getComponentAt(x, y) !== this.ruler) {
                            var l = ((this.orient === "horizontal") ? x - this.ruler.x
                                                                    : y - this.ruler.y);
                            this.setValue(this.ruler.toValue(l));
                        }
                    }
                }
            };

            this.pointerDragStarted = function(e){
                var r = this.getHandleBounds();
                if (e.x >= r.x           &&
                    e.y >= r.y           &&
                    e.x < r.x + r.width  &&
                    e.y < r.y + r.height   )
                {
                    this.$dragged = true;
                    this.$sxy     = this.orient === "horizontal" ? e.x : e.y;
                    this.$val     = this.value;
                }
            };

            this.pointerDragEnded = function(e) {
                this.$dragged = false;
            };

            /**
             * Set the granularity. Granularity defines a delta to a slider value
             * can be decreased or increased.
             * @param {Number} g a granularity.
             * @method setGranularity
             * @chainable
             */
            this.setGranularity = function(g) {
                if (g >= (this.getMax() - this.getMin())) {
                    throw new Error("Invalid granularity " + g);
                }

                if (this.granularity !== g) {
                    this.granularity = g;
                    this.setValue(this.value);
                }
                return this;
            };

            /**
             * Set the range the slider value can be changed.
             * @param {Number} min a minimal possible value
             * @param {Number} max a maximal possible value
             * @param {Number} [granularity] a granularity
             * @method setRange
             * @chainable
             */
            this.setRange = function(min, max, granularity) {
                if (this.getMin() !== min || this.getMax() !== max || granularity !== this.granularity) {
                    this.ruler.setRange(min, max);
                    this.setGranularity(arguments.length > 2 ? granularity : this.granularity); // validate granularity
                    this.vrp();
                }
                return this;
            };

            /**
             * Set the ruler to be used
             * @param {zebkit.ui.RulerPan} r a ruler
             * @method setRuler
             * @chainable
             */
            this.setRuler = function(r) {
                this.setByConstraints("ruler", r);
                return this;
            };

            /**
             * Set the gap between the slider handle and the ruler.
             * @param {Integer} g a gap
             * @method setRulerGap
             * @chainable
             */
            this.setRulerGap = function(g) {
                if (g !== this.gap) {
                    this.gap = g;
                    this.vrp();
                }
                return this;
            };
        },

        function focused() {
            this.$super();
            this.repaint();
        }
    ]);
});
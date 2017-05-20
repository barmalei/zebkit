zebkit.package("ui", function(pkg, Class) {
    /**
     * Slider UI component class.
     * @class  zebkit.ui.Slider
     * @param {String} [o]  a slider orientation ("vertical or "horizontal")
     * @constructor
     * @extends {zebkit.ui.Panel}
     */
    pkg.Slider = Class(pkg.Panel, pkg.$ViewsSetterMix, [
        function (o) {
            this._ = new zebkit.util.Listeners();
            this.views = {
                gauge: null
            };

            if (arguments.length > 0) {
                this.orient = zebkit.util.$validateValue(o, "vertical", "horizontal");
            }

            this.setValues(0, 20, [0, 5, 10], 2, 1);
            this.setScaleStep(1);

            this.$super();
            this.views.bundle = (this.orient === "horizontal" ? this.views.hbundle : this.views.vbundle);
            if (typeof this.views.bundle === 'undefined') {
                this.views.bundle = null;
            }

            this.provider = new this.clazz.ViewProvider();
        },

        function $clazz() {
            this.ViewProvider = Class([
                function(color, font) {
                    this.render = new pkg.BoldTextRender("");

                    zebkit.properties(this, this.clazz);

                    if (arguments.length > 0) {
                        this.color = color;
                    }

                    if (arguments.length > 1) {
                        this.font = font;
                    }

                    this.render.setColor(this.color);
                    this.render.setFont(this.font);
                },

                function $prototype() {
                    this.color = "white";
                    this.font  = new pkg.Font("Arial", "bold", 12);

                    this.getView = function(d, o) {
                        this.render.setValue(o !== null && typeof o !== 'undefined' ? o.toString() : "");
                        return this.render;
                    };
                }
            ]);
        },

        function $prototype() {
            this.max = this.min = this.value = this.roughStep = this.exactStep = 0;
            this.netSize = this.gap = 3;
            this.correctDt = this.scaleStep = this.psW = this.psH = 0;
            this.intervals = this.pl = null;
            this.canHaveFocus = true;
            this.orient = "horizontal";

            this.isShowScale = this.isShowTitle = true;
            this.dragged = this.isIntervalMode = false;

            /**
             * Get a value
             * @return {Integer} a value
             * @method getValue
             */
            this.getValue = function() {
                return this.value;
            };

            this.paintNums = function(g,loc){
                if (this.isShowTitle === true)
                    for(var i = 0; i < this.pl.length; i++) {
                        var render = this.provider.getView(this, this.getPointValue(i)),
                            d      = render.getPreferredSize();

                        if (this.orient === "horizontal") {
                            render.paint(g, this.pl[i] - Math.floor(d.width / 2), loc, d.width, d.height, this);
                        } else {
                            render.paint(g, loc, this.pl[i] - Math.floor(d.height / 2),  d.width, d.height, this);
                        }
                    }
            };

            this.getScaleSize = function(){
                var bs = this.views.bundle === null ? { width: 0, height:0 }
                                                    : this.views.bundle.getPreferredSize();
                return (this.orient === "horizontal" ? this.width - this.getLeft() -
                                                       this.getRight() - bs.width
                                                     : this.height - this.getTop() -
                                                       this.getBottom() - bs.height);
            };

            this.pointerDragged = function(e){
                if (this.dragged) {
                    this.setValue(this.findNearest(e.x + (this.orient === "horizontal" ? this.correctDt : 0),
                                                   e.y + (this.orient === "horizontal" ? 0 : this.correctDt)));
                }
            };

            this.paint = function(g) {
                var i = 0;

                if (this.pl === null){
                    this.pl = Array(this.intervals.length);
                    var l = this.min;
                    for(i = 0; i < this.pl.length; i ++ ){
                        l += this.intervals[i];
                        this.pl[i] = this.value2loc(l);
                    }
                }

                var left   = this.getLeft(),
                    top    = this.getTop(),
                    right  = this.getRight(),
                    bottom = this.getBottom(),
                    bnv    = this.views.bundle,
                    gauge  = this.views.gauge,
                    bs     = bnv === null ? { width: 0, height: 0 } : bnv.getPreferredSize(),
                    gs     = gauge === null ? { width: 0, height: 0 } : gauge.getPreferredSize(),
                    w      = this.width - left - right - 2,
                    h      = this.height - top - bottom - 2;

                if (this.orient === "horizontal"){
                    var topY = top + Math.floor((h - this.psH) / 2) + 1, by = topY;
                    if (this.isEnabled === true) {
                        if (gauge !== null) {
                            gauge.paint(g, left + 1,
                                           topY + Math.floor((bs.height - gs.height) / 2),
                                           w, gs.height, this);
                        }
                    } else {
                        g.setColor("gray");
                        g.strokeRect(left + 1, topY + Math.floor((bs.height - gs.height) / 2), w, gs.height);
                    }

                    topY += bs.height;
                    if (this.isShowScale === true){
                        topY += this.gap;
                        g.setColor(this.isEnabled === true ? this.scaleColor : "gray");
                        g.beginPath();
                        for(i = this.min;i <= this.max; i += this.scaleStep){
                            var xx = this.value2loc(i) + 0.5;
                            g.moveTo(xx, topY);
                            g.lineTo(xx, topY + this.netSize);
                        }

                        for(i = 0; i < this.pl.length; i++) {
                            g.moveTo(this.pl[i] + 0.5, topY);
                            g.lineTo(this.pl[i] + 0.5, topY + 2 * this.netSize);
                        }
                        g.stroke();
                        topY += (2 * this.netSize);
                    }
                    this.paintNums(g, topY);
                    if (bnv !== null) {
                        bnv.paint(g, this.getBundleLoc(this.value), by, bs.width, bs.height, this);
                    }
                } else {
                    var leftX = left + Math.floor((w - this.psW) / 2) + 1, bx = leftX;
                    if (this.isEnabled === true) {
                        if (gauge !== null) {
                            gauge.paint(g, leftX + Math.floor((bs.width - gs.width) / 2),
                                           top + 1, gs.width, h, this);
                        }
                    } else {
                        g.setColor("gray");
                        g.strokeRect(leftX + Math.floor((bs.width - gs.width) / 2),
                                     top + 1, gs.width, h);
                    }

                    leftX += bs.width;
                    if (this.isShowScale === true) {
                        leftX += this.gap;
                        g.setColor(this.scaleColor);
                        g.beginPath();
                        for(i = this.min;i <= this.max; i += this.scaleStep){
                            var yy = this.value2loc(i) + 0.5;
                            g.moveTo(leftX, yy);
                            g.lineTo(leftX + this.netSize, yy);
                        }

                        for(i = 0;i < this.pl.length; i ++ ) {
                            g.moveTo(leftX, this.pl[i] + 0.5);
                            g.lineTo(leftX + 2 * this.netSize, this.pl[i] + 0.5);
                        }

                        g.stroke();
                        leftX += (2 * this.netSize);
                    }

                    this.paintNums(g, leftX);
                    if (bnv !== null) {
                        bnv.paint(g, bx, this.getBundleLoc(this.value), bs.width, bs.height, this);
                    }
                }

                if (this.hasFocus() && this.views.marker != null) {
                    this.views.marker.paint(g, left, top, w + 2, h + 2, this);
                }
            };

            this.findNearest = function(x,y){
                var v = this.loc2value(this.orient === "horizontal" ? x : y);
                if (this.isIntervalMode){
                    var nearest = Number.MAX_VALUE, res = 0;
                    for(var i = 0;i < this.intervals.length; i ++ ){
                        var pv = this.getPointValue(i), dt = Math.abs(pv - v);
                        if (dt < nearest){
                            nearest = dt;
                            res = pv;
                        }
                    }
                    return res;
                }

                v = this.exactStep * Math.floor((v + v % this.exactStep) / this.exactStep);
                if (v > this.max) {
                    v = this.max;
                } else if (v < this.min) {
                    v = this.min;
                }
                return v;
            };

            this.value2loc = function (v){
                var ps = this.views.bundle === null ? { width:0, height:0 } : this.views.bundle.getPreferredSize(),
                    l  = Math.floor((this.getScaleSize() * (v - this.min)) / (this.max - this.min));
                return  (this.orient === "vertical") ? this.height - Math.floor(ps.height/2) - this.getBottom() - l
                                                     : this.getLeft() + Math.floor(ps.width/2) + l;
            };

            this.loc2value = function(xy){
                var ps = this.views.bundle === null ? { width:0, height:0 } : this.views.bundle.getPreferredSize(),
                    sl = (this.orient === "vertical") ? this.getLeft() + Math.floor(ps.width/2)
                                                      : this.getTop()  + Math.floor(ps.height/2),
                    ss = this.getScaleSize();

                if (this.orient === "vertical") {
                    xy = this.height - xy;
                }

                if (xy < sl) {
                    xy = sl;
                } else if (xy > sl + ss) {
                    xy = sl + ss;
                }

                return this.min + Math.floor(((this.max - this.min) * (xy - sl)) / ss);
            };

            this.nextValue = function(value,s,d){
                if (this.isIntervalMode) {
                    return this.getNeighborPoint(value, d);
                }

                var v = value + (d * s);
                if (v > this.max) {
                    v = this.max;
                } else if (v < this.min) {
                    v = this.min;
                }

                return v;
            };

            this.getBundleLoc = function(v){
                var bs = this.views.bundle === null ? { width:0, height:0 } : this.views.bundle.getPreferredSize();
                return this.value2loc(v) - (this.orient === "horizontal" ? Math.floor(bs.width / 2)
                                                                         : Math.floor(bs.height / 2));
            };

            this.getBundleBounds = function (v){
                var bs = this.views.bundle === null ? { width:0, height:0 } : this.views.bundle.getPreferredSize();
                return this.orient === "horizontal"? {
                                                       x:this.getBundleLoc(v),
                                                       y:this.getTop() + Math.floor((this.height - this.getTop() - this.getBottom() - this.psH) / 2) + 1,
                                                       width:bs.width,
                                                       height:bs.height
                                                     }
                                                   : {
                                                       x:this.getLeft() + Math.floor((this.width - this.getLeft() - this.getRight() - this.psW) / 2) + 1,
                                                       y:this.getBundleLoc(v),
                                                       width:bs.width,
                                                       height:bs.height
                                                     };
            };

            this.getNeighborPoint = function (v,d){
                var left  = this.min + this.intervals[0],
                    right = this.getPointValue(this.intervals.length - 1),
                    i     = 0,
                    start = 0;

                if (v < left) {
                    return left;
                } else if (v > right) {
                    return right;
                }

                if (d > 0) {
                    start = this.min;
                    for(i = 0;i < this.intervals.length; i ++ ){
                        start += this.intervals[i];
                        if(start > v) return start;
                    }
                    return right;
                } else {
                    start = right;
                    for(i = this.intervals.length - 1;i >= 0; i--) {
                        if (start < v) return start;
                        start -= this.intervals[i];
                    }
                    return left;
                }
            };

            this.calcPreferredSize = function(l) {
                return { width:this.psW + 2, height: this.psH + 2 };
            };

            this.recalc = function(){
                var ps = this.views.bundle !== null ? this.views.bundle.getPreferredSize()
                                                    : { width: 0, height:0 },
                    ns = this.isShowScale ? (this.gap + 2 * this.netSize) : 0,
                    dt = this.max - this.min,
                    hMax = 0,
                    wMax = 0;

                if (this.isShowTitle && this.intervals.length > 0){
                    for(var i = 0;i < this.intervals.length; i ++ ){
                        var d = this.provider.getView(this, this.getPointValue(i)).getPreferredSize();
                        if (d.height > hMax) hMax = d.height;
                        if (d.width  > wMax) wMax = d.width;
                    }
                }
                if (this.orient === "horizontal"){
                    this.psW = dt * 2 + ps.width;
                    this.psH = ps.height + ns + hMax;
                } else {
                    this.psW = ps.width + ns + wMax;
                    this.psH = dt * 2 + ps.height;
                }
            };

            this.setValue = function(v) {
                if (v < this.min || v > this.max) {
                    throw new Error("Value is out of bounds: " + v);
                }

                var prev = this.value;
                if (this.value !== v){
                    this.value = v;
                    this._.fired(this, prev);
                    this.repaint();
                }

                return this;
            };

            this.getPointValue = function (i){
                var v = this.min + this.intervals[0];
                for(var j = 0; j < i; j++, v += this.intervals[j]);
                return v;
            };

            this.keyPressed = function(e){
                var b = this.isIntervalMode,
                    v = null;
                switch(e.code) {
                    case "ArrowDown":
                    case "ArrowLeft":
                        v = this.nextValue(this.value, this.exactStep,-1);
                        if (v >= this.min) this.setValue(v);
                        break;
                    case "ArrowUp":
                    case "ArrowRight":
                        v = this.nextValue(this.value, this.exactStep, 1);
                        if (v <= this.max) this.setValue(v);
                        break;
                    case "Home": this.setValue(b ? this.getPointValue(0) : this.min);break;
                    case "End":  this.setValue(b ? this.getPointValue(this.intervals.length - 1)
                                                 : this.max);
                                 break;
                }
            };

            this.pointerPressed = function (e){
                if (e.isAction()){
                    var x = e.x, y = e.y, bb = this.getBundleBounds(this.value);
                    if (x < bb.x || y < bb.y || x >= bb.x + bb.width || y >= bb.y + bb.height) {
                        var l = ((this.orient === "horizontal") ? x : y), v = this.loc2value(l);
                        if (this.value != v) {
                            this.setValue(this.isJumpOnPress ? v
                                                             : this.nextValue(this.value,
                                                                              this.roughStep,
                                                                              v < this.value ? -1:1));
                        }
                    }
                }
            };

            this.pointerDragStarted = function(e){
                var r = this.getBundleBounds(this.value);

                if (e.x >= r.x && e.y >= r.y &&
                    e.x < r.x + r.width &&
                    e.y < r.y + r.height)
                {
                    this.dragged = true;
                    this.correctDt = this.orient === "horizontal" ? r.x + Math.floor(r.width  / 2) - e.x
                                                                  : r.y + Math.floor(r.height / 2) - e.y;
                }
            };

            this.pointerDragEnded = function(e) {
                this.dragged = false;
            };
        },

        function focused() {
            this.$super();
            this.repaint();
        },

        function setScaleGap(g) {
            if (g !== this.gap){
                this.gap = g;
                this.vrp();
            }
            return this;
        },

        function setScaleColor(c) {
            if (c !== this.scaleColor) {
                this.scaleColor = c;
                if (this.provider === this) this.render.setColor(c);
                this.repaint();
            }
            return this;
        },

        function setScaleStep(s){
            if (s !== this.scaleStep){
                this.scaleStep = s;
                this.repaint();
            }
            return this;
        },

        function setShowScale(b) {
            if (this.isShowScale !== b){
                this.isShowScale = b;
                this.vrp();
            }
            return this;
        },

        function setShowTitle(b) {
            if (this.isShowTitle !== b){
                this.isShowTitle = b;
                this.vrp();
            }
            return this;
        },

        function setViewProvider(p){
            if (p !== this.provider){
                this.provider = p;
                this.vrp();
            }
            return this;
        },

        function setValues(min,max,intervals,roughStep,exactStep) {
            if (roughStep <= 0 || exactStep < 0 || min >= max ||
                min + roughStep > max || min + exactStep > max  )
            {
                throw new Error("[" + min + "," + max + "], " + roughStep + "," + exactStep);
            }

            var i = 0, start = min;

            for(i = 0; i < intervals.length; i ++ ){
                start += intervals[i];
                if (start > max || intervals[i] < 0) throw new Error();
            }

            this.min = min;
            this.max = max;
            this.roughStep = roughStep;
            this.exactStep = exactStep;
            this.intervals = Array(intervals.length);

            for(i = 0; i < intervals.length; i++){
                this.intervals[i] = intervals[i];
            }

            if (this.value < min || this.value > max) {
                this.setValue(this.isIntervalMode ? min + intervals[0] : min);
            }
            this.vrp();

            return this;
        },

        function invalidate(){
            this.pl = null;
            this.$super();
        }
    ]);
});
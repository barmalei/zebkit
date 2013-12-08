
(function(pkg, Class) {

var ST_ONSURFACE = 0;
var ST_PRESSED = 1;
var ST_OUTSURFACE = 2;
var ST_REMOVING = 3;
var BUNDLE_1 = 1;
var BUNDLE_2 = 2;
var OUTER_SCALE = 0;
var INNER_SCALE = 1;

var TrackerEl = new Class([
    function $prototype() {
        this.value =  0;
        this.state =  ST_OUTSURFACE;
        this.tooltip =  null;
    },
        
    function (v){
        this.value = v;
    }
]);


pkg.TrackerListeners = zebra.util.Listeners.Class("bundleRemoved", "bundleAdded", "bundleValueChanged");

pkg.Tracker = new Class(pkg.Panel, pkg.MouseListener,  [

        function $prototype() {
            this.min = 0;
            this.max = 0;
            this.psW = 0;
            this.psH = 0;
            this.intervals = 0;
            this.scaleStep = 1;
            this.scaleSize = 0;
            this.titleLoc = 0;
            this.netSize = 2;
            this.exactStep = 0;
            this.gapx = 0;
            this.gapy = 0;
            this.targetBundle = -1;
            this.targetMin = 0;
            this.targetMax = 0;
            this.correctDt = 0;
            this.startValue = 0;
        },
        
        // constructors
        function (){
            this.scaleColor = ["gray", "darkBlue"];
            this.values   = [];
            this.bundles = new Array(8);
            this.scaleLoc = { x:0 , y:0 };

            this._ = new pkg.TrackerListeners();

            var clazz = this.$clazz;
            this.setView(BUNDLE_1, ST_ONSURFACE,  clazz["b1.on"]);
            this.setView(BUNDLE_1, ST_PRESSED,  clazz["b1.pressed"]);
            this.setView(BUNDLE_1, ST_OUTSURFACE,  clazz["b1.out"]);
            this.setView(BUNDLE_1, ST_REMOVING,  clazz["b1.removing"]);
            this.setView(BUNDLE_2, ST_ONSURFACE,  clazz["b2.on"]);
            this.setView(BUNDLE_2, ST_PRESSED,  clazz["b2.pressed"]);
            this.setView(BUNDLE_2, ST_OUTSURFACE,  clazz["b2.out"]);
            this.setValues(0, 100, [0, 20, 20, 20, 20], [0, 20, 30, 100], 1);
            this.titleRender = new pkg.TextRender("");
            this.setShowTitle(true);

            this.$super();
        },
  
        function canHaveFocus(){
            return true;
        },

        function setShowTitle(b){
            if (this.isShowTitle != b) {
                this.isShowTitle = b;
                this.vrp();
            }
        },

        function setTooltip(index,c){
            this.values[index].tooltip = c;
        },

        function getView(id,state){
            return this.bundles[(id == BUNDLE_1 ? state
                                                : this.bundles.length/2 + state)];
        },

        function setView(id,state,v){
            var old = this.getView(id, state);
            if (old != v){
                this.bundles[(id == BUNDLE_1 ? state : this.bundles.length/2 + state)] = v;
                this.vrp();
            }
        },

        function getScaleColor(type){
            return this.scaleColor[type];
        },

        function setScaleColor(type,c){
            this.scaleColor[type] = c;
            this.repaint();
        },

        function setScaleStep(s){
            if(s != this.scaleStep){
                this.scaleStep = s;
                this.repaint();
            }
        },

        function setValues(min,max,intervals,values,step){
            if(values.length < 2 || step < 0 || min >= max || min + step > max) {
                throw new Error();
            }

            for(var i = 0, start = min;i < intervals.length; i ++ ){
                start += intervals[i];
                if (start > max || intervals[i] < 0) throw new Error();
            }

            this.min = min;
            this.max = max;
            this.exactStep = step;
            this.intervals = new Array(intervals.length);
            zebra.util.arraycopy(intervals, 0, this.intervals, 0, intervals.length);
            
            this.values.length = 0;
            for(var i = 0;i < values.length; i ++ ){
                this.insertBundle(values[i]);
            }
            this.vrp();
        },

        function getBundles(){
            return this.values.length;
        },

        function removeBundle(index){
            var value = this.getValue(index);
            this.values.splice(index, 1);

            this._.bundleRemoved(this, index, value);

            this.repaint();
        },

        function insertBundle(value){
            var i = this.getInterval(value);
            if (i < 0) throw new Error();
            this.values.splice(i, 0, new TrackerEl(value));

            this._.bundleAdded(this, i, value);
            this.repaint();
            return i;
        },

        function getMin(){
            return this.min;
        },

        function getMin(bundleIndex){
            return bundleIndex == 0 ? this.getMin() : this.getValue(bundleIndex - 1) + this.exactStep;
        },

        function getMax(){
            return this.max;
        },

        function getMax(bundleIndex){
            return bundleIndex == this.values.length - 1 ? this.getMax() : this.getValue(bundleIndex + 1) - this.exactStep;
        },

        function setValue(index,value){
            var max = this.getMax(index),
                min = this.getMin(index);
            if(value > max || value < min) throw new Error();
            var oldValue = this.getValue(index);
            if(oldValue != value){
                var info = this.values[index];
                info.value = value;
                this._.bundleValueChanged(this, index, value, oldValue);
                this.repaint();
            }
        },

        function getValue(index){
            return this.values[index].value;
        },

        function paint(g){
            this.rMetric();

            var iright = this.getRight(),
                itop = this.getTop(),
                ibottom = this.getBottom(),
                ileft = this.getLeft(),
                left = this.value2loc(this.getValue(0)),
                right = this.value2loc(this.getValue(this.values.length - 1));

            // for(var i = this.min;i <= this.max; i += this.scaleStep){
            //     var x = this.value2loc(i);
            //     g.setColor(this.isEnabled ? ((x < left || x > right) ? this.scaleColor[0] : this.scaleColor[1]) : "gray");
           

            //     g.drawLine(x, this.scaleLoc.y, x, this.scaleLoc.y + this.netSize);
            

            // }


            // draw scale
            g.setColor("red");
            g.fillRect(this.value2loc(this.min), this.scaleLoc.y,
                       this.value2loc(this.getValue(0)),this.netSize);

            g.fillRect(this.value2loc(this.getValue(this.values.length - 1)), this.scaleLoc.y,
                       this.value2loc(this.max),this.netSize);

            g.setColor(this.scaleColor[0]);
            // g.fillRect(this.value2loc(this.getValue(0)), this.scaleLoc.y,
            //            this.value2loc(this.getValue(this.values.length - 1)), this.netSize);



            var v = this.min;
            for(var i = 0;i < this.intervals.length; i ++ ){
                v += this.intervals[i];
                var x = this.value2loc(v);
                if (this.isShowTitle){
                    this.titleRender.target.setValue("" + v);
                    var tps = this.titleRender.getPreferredSize();
                    this.titleRender.paint(g, x - Math.floor(tps.width / 2), this.titleLoc,
                                              tps.width, tps.height, this);
                }
                g.setColor(this.isEnabled ? ((x < left || x > right) ? this.scaleColor[0] : this.scaleColor[1])
                                          : "gray");
                g.drawLine(x, this.scaleLoc.y, x, this.scaleLoc.y + this.netSize * 4);
            }

            var size = this.values.length;
            for(var i = 0;i < size; i ++ ){
                var view = this.getBundleView(i);

                if(view != null){
                    var ps = view.getPreferredSize();
                    var x = this.value2loc(this.getValue(i)) - Math.floor (ps.width / 2);
                    view.paint(g, x, this.scaleLoc.y - Math.floor(ps.height / (this.isLRBundle(i) ? 2 : 1)),
                                  ps.width, ps.height, this);
                }
            }

            if (this.hasFocus()) {
                pkg.borders.dot.paint(g, ileft, itop,
                                         this.width - ileft - iright,
                                         this.height - itop - ibottom, this);
            }
        },

        function mouseDragStarted(e){
            if (this.targetBundle >= 0){
                this.targetMin = this.getMin(this.targetBundle);
                this.targetMax = this.getMax(this.targetBundle);
                var r = this.getBundleBounds(this.targetBundle);
                this.correctDt = r.x + Math.floor(r.width / 2) - e.x;
                this.startValue = this.getValue(this.targetBundle);
            }
        },

        function mouseDragEnded(e){
            if (this.targetBundle >= 0){
                var x = e.x, y = e.y;
                if (this.targetBundle > 0 &&
                    this.targetBundle < this.values.length - 1 &&
                    (x < 0 || y < 0 || x >= this.width || y >= this.height))
                {
                    this.removeBundle(this.targetBundle);
                }
            }
        },

        function mouseDragged(e){
            if(this.targetBundle >= 0){
                var x = e.x, y = e.y, v = this.findNearest(x + this.correctDt, y);
                
                if (v > this.targetMax) v = this.targetMax;
                else {
                    if (v < this.targetMin) v = this.targetMin;
                }

                this.setValue(this.targetBundle, v);
                if(this.targetBundle > 0 && this.targetBundle < this.values.length - 1){
                    var s = x < 0 || x >= this.width || y < 0 || y >= this.height ? ST_REMOVING
                                                                                  : ST_PRESSED;
                    this.setBundleState(this.targetBundle, s);
                }
            }
        },

        function mousePressed(e){
            if (this.targetBundle >= 0) {
                this.setBundleState(this.targetBundle, ST_PRESSED);
            }
        },

        function mouseReleased(e){
            if (this.targetBundle >= 0){
                var i = this.getBundleIndex(e.x, e.y);
                if (i >= 0) this.setBundleState(i, ST_ONSURFACE);
                if (i != this.targetBundle) this.setBundleState(this.targetBundle, ST_OUTSURFACE);
                this.targetBundle = i;
            }
        },

        function mouseMoved(e){
            var x = e.x, y = e.y, i = this.getBundleIndex(x, y);
            if (this.targetBundle != i){
                if(this.targetBundle >= 0) {
                    this.setBundleState(this.targetBundle, ST_OUTSURFACE);
                }
                this.targetBundle = i;
                if (this.targetBundle >= 0) {
                    this.setBundleState(this.targetBundle, ST_ONSURFACE);
                }
            }
        },

        function mouseClicked(e) {
            if (e.isActionMask()) {
                if (this.targetBundle < 0 && e.clicks > 1) {
                    var v = this.findNearest(e.x, e.y),
                        i = this.getInterval(v);

                    if (i > 0 && i < this.values.length) {
                        this.insertBundle(v);
                    }
                }
                else {
                    if (this.targetBundle < 0) {

                    }
                }
            }

        },

        function mouseExited(e){
            if (this.targetBundle >= 0){
                this.setBundleState(this.targetBundle, ST_OUTSURFACE);
                this.targetBundle =  - 1;
            }
        },

        function invalidate(){
            this.scaleSize =  -1;
            this.$super();
        },

        function getTooltip(target,x,y){
            var index = this.getBundleIndex(x, y);
            return (index >= 0) ? (this.values[index]).tooltip : null;
        },

        function getBundleIndex(x,y){
            var found =  -1;
            for(var i = 0;i < this.values.length; i++) {
                var r = this.getBundleBounds(i);
                if (r != null &&  (x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height )){
                    if (found ==  -1) {
                        found = i;
                        if (x <= r.x + r.width / 2 &&
                            this.getValue(i) > this.getMin(i) ||
                            i + 1 < this.values.length &&
                            this.getValue(i + 1) == this.getMax(i + 1))
                        {
                            break;
                        }
                    }
                    else {
                        found = i;
                    }
                }
                else {
                    if (found !=  -1) break;
                }
            }
            return found;
        },

        function findNearest(x,y){
            var v = this.loc2value(x);
            return this.exactStep *  Math.floor((v + v % this.exactStep) / this.exactStep);
        },

        function value2loc(v){
            return Math.floor((this.scaleSize * (v - this.min)) / (this.max - this.min)) + this.scaleLoc.x;
        },

        function loc2value(x){
            return this.min + Math.floor(((this.max - this.min) * (x - this.scaleLoc.x)) / this.scaleSize);
        },

        function setStep(step){
            this.exactStep = step;
        },

        function calcPreferredSize(target){
            return { width:this.psW, height:this.psH };
        },

        function getBundleView(bundleIndex){
            var index = bundleIndex == 0 || bundleIndex == this.values.length - 1 ? this.bundles.length / 2 : 0;            
            return this.bundles[index + this.getBundleState(bundleIndex)];
        },

        function recalc(){
            var mw2 = 0, mh1 = 0, mh2 = 0;
            for(var i = 0;i < this.bundles.length / 2; i ++ ){
                if(this.bundles[i] != null){
                    var ps = this.bundles[i].getPreferredSize();
                    if(ps.height > mh1)
                        mh1 = ps.height;
                }
            }
            for(var i = this.bundles.length / 2;i < this.bundles.length; i ++ ){
                if(this.bundles[i] != null){
                    var ps = this.bundles[i].getPreferredSize();
                    if (ps.height > mh2) mh2 = ps.height;
                    if (ps.width  > mw2) mw2 = ps.width;
                }
            }
            this.gapx = Math.floor(mw2 / 2) + mw2 % 2;
            this.gapy = Math.max(mh1, Math.floor(mh2 / 2));
            this.psW = (this.getMax() - this.getMin()) * 2 + mw2 + 2;
            this.psH = this.gapy + Math.max(Math.floor(mh2 / 2) + mh2 % 2, 4 * this.netSize) + 2;
            if (this.isShowTitle) {
                this.psH += (this.titleRender.font.height);
            }
        },
        
        function getInterval(value){
            var i = 0, min = 0, max = this.getMin();
            for(i = 0;i < this.values.length; i ++ ){
                min = this.getMin(i);
                max = this.getValue(i);
                if(min <= value && value < max)break;
            }
            return (i == this.values.length && (value > this.getMax() || value < max)) ?  - 1 : i;
        },

        function setBundleState(index,state){
            var bi = this.values[index];
            if(bi.state != state){
                bi.state = state;
                this.repaint();
            }
        },

        function getBundleState(index){
            return this.values[index].state;
        },

        function getBundleBounds(index){
            var v = this.getBundleView(index);
            if (v != null){
                var ps = v.getPreferredSize();
                return { x : this.value2loc(this.getValue(index)) - Math.floor(ps.width / 2),
                         y : this.scaleLoc.y - Math.floor(ps.height / (this.isLRBundle(index) ? 2 : 1)),
                         width  : ps.width,
                         height : ps.height };
            }
            return null;
        },

        function isLRBundle(index){
            return index === 0 || index == this.values.length - 1;
        },

        function rMetric(){
            if (this.scaleSize < 0){
                var iright = this.getRight(), itop = this.getTop(), ibottom = this.getBottom(), ileft = this.getLeft();
                this.scaleSize = this.width - ileft - iright - 2 * this.gapx - 2;
                this.scaleLoc.x = ileft + this.gapx + 1;
                this.scaleLoc.y = itop + this.gapy + Math.floor((this.height - itop - ibottom - this.psH) / 2) + 1;
                this.titleLoc = this.scaleLoc.y + 4 * this.netSize;
            }
        }
]);

pkg.configure(pkg.$url + "tr.json");

})(zebra("ui"), zebra.Class);
(function(pkg, Class) {

var PI4 = Math.PI/4, PI4_3 = PI4 * 3, $abs = Math.abs, $atan2 = Math.atan2, L = zebra.layout;

pkg.TouchHandler = Class([
    function $prototype() {
        this.touchCounter = 0;

        this.start = function(e) {
            // fix android bug: parasite event for multi touch 
            // or stop capturing new touches since it is already fixed
            if (this.touchCounter > e.touches.length) return;

            if (this.timer == null) {
                var $this = this;
                this.timer = setTimeout(function() {
                    $this.Q();
                    $this.timer = null;
                }, 25);
            }

            // collect touches
            var t = e.touches;
            for(var i = 0; i < t.length; i++) {
                var tt = t[i];
                if (this.touches[tt.identifier] == null) {
                    this.touchCounter++;
                    var nt = {
                        pageX      : tt.pageX,
                        pageY      : tt.pageY,
                        identifier : tt.identifier,
                        target     : tt.target,
                        direction  : L.NONE,
                        dx         : 0,
                        dy         : 0,
                        dc         : 0,
                        group      : null
                    };
                    this.touches[tt.identifier] = nt;
                    this.queue.push(nt);
                }
            }
        };

        this.end = function(e) {
            if (this.timer != null) {
                clearTimeout(this.timer);
                this.timer = null;
            }

            this.Q();

            // update touches
            var t = e.changedTouches;
            for (var i = 0; i < t.length; i++) {
                var tt = this.touches[t[i].identifier];
                if (tt != null) {
                    this.touchCounter--;
                    if (tt.group != null) tt.group.active = false;
                    this.ended(tt);
                    delete this.touches[t[i].identifier];
                }
            }
        };

        this.Q = function() {
            if (this.queue.length > 1) {
                for(var i = 0; i < this.queue.length; i++) {
                    var t = this.queue[i];
                    t.group = {
                       size  : this.queue.length,
                       index : i,
                       active: true
                    };
                }
            }

            if (this.queue.length > 0) {
                for(var i = 0; i < this.queue.length; i++) {
                    this.started(this.queue[i]);
                }
                this.queue.length = 0;
            }
        };

        this[''] = function(element) {
            this.touches = {};
            this.queue   = [];
            this.timer   = null;

            var $this = this;
            element.addEventListener("touchstart",  function(e) {
                $this.start(e);
            }, false);

            element.addEventListener("touchend", function(e) {
                $this.end(e);
                e.preventDefault();
            }, false);

            element.addEventListener("touchmove", function(e) {
                var mt = e.changedTouches;

                // clear dx, dy for not updated touches 
                for(var k in $this.touches) {
                    $this.touches[k].dx = $this.touches[k].dy = 0;
                }

                for(var i=0; i < mt.length; i++) {
                    var nmt = mt[i], t = $this.touches[nmt.identifier];
                    if (t != null) {
                        if (t.pageX != nmt.pageX || t.pageY != nmt.pageY) {
                            var dx = nmt.pageX - t.pageX, dy = nmt.pageY - t.pageY, d = t.direction, gamma = null,
                                dxs = (dx < 0 && t.dx < 0) || (dx > 0 && t.dx > 0),  // test if horizontal move direction has been changed
                                dys = (dy < 0 && t.dy < 0) || (dy > 0 && t.dy > 0);  // test if vertical move direction has been changed

                            // update stored touch coordinates with a new one 
                            t.pageX  = nmt.pageX;
                            t.pageY  = nmt.pageY;

                            // we can recognize direction only if move was not too short
                            if ($abs(dx) > 2 || $abs(dy) > 2) {
                                // compute gamma, this is corner in polar coordinate system
                                gamma = $atan2(dy, dx);

                                // using gamma we can figure out direction
                                if (gamma > -PI4) {
                                    d = (gamma < PI4) ? L.RIGHT : (gamma < PI4_3 ? L.BOTTOM : L.LEFT);
                                }
                                else {
                                    d = (gamma > -PI4_3) ? L.TOP : L.LEFT;
                                }

                                // to minimize wrong touch effect let's update direction only if move event sequence 
                                // with identical direction is less than 3
                                if (t.direction != d) {
                                    if (t.dc < 3) t.direction = d;
                                    t.dc = 0;
                                }
                                else {
                                    t.dc++;
                                }
                                t.gamma = gamma;
                            }

                            if ($this.timer == null) {
                                t.dx = dx;
                                t.dy = dy;
                                $this.moved(t);
                            }
                            else {
                                $this.dc = 0;
                            }
                        }
                    }
                }
                e.preventDefault();
            }, false);
        };
    }
]);

})(zebra("ui"), zebra.Class);
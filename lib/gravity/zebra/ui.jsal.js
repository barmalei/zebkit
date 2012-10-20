(function(pkg, Class) {

var MouseEvent = pkg.MouseEvent, KeyEvent = pkg.KeyEvent,
    MDRAGGED = MouseEvent.DRAGGED, EM = null, MMOVED = MouseEvent.MOVED, MEXITED = MouseEvent.EXITED, MENTERED = MouseEvent.ENTERED,
    KPRESSED = KeyEvent.PRESSED, BM1 = MouseEvent.LEFT_BUTTON, BM3 = MouseEvent.RIGHT_BUTTON,
    MS = Math.sin, MC = Math.cos, context = Object.getPrototypeOf(document.createElement('canvas').getContext('2d')),
    $mousePressedEvent = null, $keyPressedCode = -1, $keyPressedOwner = null, $mousePressedX = 0, $mousePressedY = 0,
    $keyPressedModifiers = 0, KE_STUB = new pkg.KeyEvent(null,  KPRESSED, 0, 'x', 0), $focusGainedCounter = 0,
    ME_STUB = new pkg.MouseEvent(null,  MouseEvent.PRESSED, 0, 0, 0, 1), meX, meY;

pkg.$mousePressedOwner = pkg.$mouseDraggOwner = pkg.$mouseMoveOwner = null;

//!!!!
var shift = [];


// !!!!
// the document mouse up happens whan we drag outside a canvas
// in this case canvas soen't get mouse up, so we do it by global mouseup handler
document.addEventListener("mouseup", function(e) {
    if (pkg.$mousePressedOwner) { $this.mouseReleased(e); }
},  false);


var $alert = (function(){ return this.alert; }());
window.alert = function() {
    if ($keyPressedCode > 0) {
        KE_STUB.reset($keyPressedOwner, KeyEvent.RELEASED, $keyPressedCode, '', $keyPressedModifiers);
        EM.performInput(KE_STUB);
        $keyPressedCode = -1;
    }
    $alert.apply(window, arguments);
    if ($mousePressedEvent) $mousePressedEvent.$zcanvas.mouseReleased($mousePressedEvent);
};

var debugOff = true;
function debug(msg, d) {
    if (debugOff) return ;
    if (d == -1) shift.pop();
    zebra.print(shift.join('') + msg);
    if (d == 1) shift.push('    ');
}


context.setFont = function(f) {
    //!!!! Bloody chrome doesn't set font property for some unclear reason !
    if (f.s != this.font) {
        this.font = f.s;
    }
};

context.setColor = function(c) {
    if (c.s != this.fillStyle) this.fillStyle = c.s;
    if (c.s != this.strokeStyle) this.strokeStyle = c.s;
};

context.drawLine = function(x1, y1, x2, y2, w){
    if (arguments.length < 5) w = 1;
    var pw = this.lineWidth;
    this.beginPath();
    this.lineWidth = w;

    if (x1 == x2) x1 += w / 2;
    else
    if (y1 == y2) y1 += w / 2;

    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.stroke();
    this.lineWidth = pw;
};

context.drawArc = function(cx,cy,r, sa, ea, d){
    this.beginPath();
    this.arc(cx, cy, r, sa, ea, d);
    this.stroke();
};

context.fillArc = function(cx,cy,r, sa, ea, d){
    this.beginPath();
    this.arc(cx, cy, r, sa, ea, d);
    this.fill();
};

context.ovalPath = function(x,y,w,h){
    this.beginPath();
    var kappa = 0.5522848, ox = (w / 2) * kappa, oy = (h / 2) * kappa,
        xe = x + w, ye = y + h, xm = x + w / 2, ym = y + h / 2;
    this.moveTo(x, ym);
    this.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    this.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    this.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    this.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
};

context.polylinePath = function(xPoints, yPoints, nPoints){
    this.beginPath();
    this.moveTo(xPoints[0], yPoints[0]);
    for(var i=1; i < nPoints; i++) this.lineTo(xPoints[i], yPoints[i]);
};

context.drawOval = function(x,y,w,h) {
    this.ovalPath(x, y, w, h);
    this.stroke();
};

context.drawPolygon = function(xPoints,yPoints,nPoints){
    this.polylinePath(xPoints, yPoints, nPoints);
    this.lineTo(xPoints[0], yPoints[0]);
    this.stroke();
};

context.drawPolyline = function(xPoints,yPoints,nPoints){
    this.polylinePath(xPoints, yPoints, nPoints);
    this.stroke();
};

context.fillPolygon = function(xPoints,yPoints,nPoints){
    this.polylinePath(xPoints, yPoints, nPoints);
    this.lineTo(xPoints[0], yPoints[0]);
    this.fill();
};

context.fillOval = function(x,y,width,height){
    this.beginPath();
    this.ovalPath(x, y, width, height);
    this.fill();
};

context.drawDottedRect = function(x,y,w,h) {
    var ctx = this, m = ["moveTo", "lineTo", "moveTo"];
    function dv(x, y, s) { for(var i=0; i < s; i++) ctx[m[i%3]](x + 0.5, y + i); }
    function dh(x, y, s) { for(var i=0; i < s; i++) ctx[m[i%3]](x + i, y + 0.5); }
    ctx.beginPath();
    dh(x, y, w);
    dh(x, y + h - 1, w);
    ctx.stroke();
    ctx.beginPath();
    dv(x, y, h);
    dv(w + x - 1, y, h);
    ctx.stroke();
};

context.drawDashLine = function(x,y,x2,y2) {
    var pattern=[1,2], count = pattern.length, ctx = this, compute = null,
        dx = (x2 - x), dy = (y2 - y), b = (Math.abs(dx) > Math.abs(dy)),
        slope = b ? dy / dx : dx / dy, sign = b ? (dx < 0 ?-1:1) : (dy < 0?-1:1);

    if (b) {
        compute = function(step) {
            x += step;
            y += slope * step;
        };
    }
    else {
        compute = function(step) {
            x += slope * step;
            y += step;
        };
    }

    ctx.moveTo(x, y);
    var dist = Math.sqrt(dx * dx + dy * dy), i = 0;
    while (dist >= 0.1) {
        var dl = Math.min(dist, pattern[i % count]), step = Math.sqrt(dl * dl / (1 + slope * slope)) * sign;
        compute(step);
        ctx[(i % 2 === 0) ? 'lineTo' : 'moveTo'](x + 0.5, y + 0.5);
        dist -= dl;
        i++;
    }
    ctx.stroke();
};

//!!! has to be made public in layout !!!
function measure(e, cssprop) {
    var value = window.getComputedStyle ? window.getComputedStyle(e, null).getPropertyValue(cssprop)
                                        : (e.style ? e.style[cssprop] : e.currentStyle[cssprop]);

    if (value == null || value == '') return 0;
    var m = /(^[0-9\.]+)([a-z]+)?/.exec(value);
    return parseInt(m[1], 10);
}


pkg.MWheelSupport = Class([
    function $prototype() {
        var bars = [2, 1];

        this.mouseWheelMoved = function(e){
            var owner = this.lookup(pkg.$mouseMoveOwner);
            if (owner == null) return;

            var d = [0, 0];
            d[0] = (e.detail? e.detail : e.wheelDelta/120);
            if (e.axis) {
                if (e.axis === e.HORIZONTAL_AXIS) {
                    d[1] = d[0];
                    d[0] = 0;
                }
            }

            if (d[0] > 1) d[0] = ~~(d[0]/3);
            if (zebra.isIE || zebra.isChrome || zebra.isSafari) d[0] = -d[0];

            for(var i=0; i < bars.length; i++) {
                if (d[i] != 0) {
                    var bar = owner.getByConstraints(bars[i]);
                    if (bar != null && bar.isVisible) bar.position.setOffset(bar.position.offset + d[i]*bar.pageIncrement);
                }
            }
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
        };

        this.lookup = function(c) {
            while(c != null && zebra.instanceOf(c, pkg.ScrollPan) === false) c = c.parent;
            return c;
        };
    },

    function(desktop) {
        if (desktop == null) throw new Error();
        this.desktop = desktop;
        var elem = desktop.canvas, $this = this;
        elem.addEventListener ("mousewheel", function(e) { $this.mouseWheelMoved(e); }, false);
        elem.addEventListener ("DOMMouseScroll", function(e) { $this.mouseWheelMoved(e); }, false);
    }
]);

function setupMeF() {
    if (zebra.isIE) {
        var de = document.documentElement, db = document.body;
        meX = function meX(e, d) { return d.graph.tX(e.clientX - d.offx + de.scrollLeft + db.scrollLeft,
                                                     e.clientY - d.offy + de.scrollTop  + db.scrollTop);  };
        meY = function meY(e, d) {
            return d.graph.tY(e.clientX - d.offx + de.scrollLeft + de.scrollLeft,
                              e.clientY - d.offy + de.scrollTop + db.scrollTop);  };
    }
    else {
        meX = function meX(e, d) {  return d.graph.tX(e.pageX - d.offx, e.pageY - d.offy); };
        meY = function meY(e, d) {  return d.graph.tY(e.pageX - d.offx, e.pageY - d.offy); };
    }
}

function createContext(ctx, w, h) {
    var $save = ctx.save, $restore = ctx.restore, $rotate = ctx.rotate, $scale = ctx.scale, $translate = ctx.translate;

    ctx.counter = 0;
    ctx.stack = Array(33);
    for(var i=0; i < ctx.stack.length; i++) {
        var s = {};
        s.srot = s.rotateVal = s.x = s.y = s.width = s.height = s.dx = s.dy = 0;
        s.crot = s.sx = s.sy = 1;
        ctx.stack[i] = s;
    }
    ctx.stack[0].width  = w;
    ctx.stack[0].height = h;
    ctx.setFont(pkg.Font.defaultNormal);
    ctx.setColor(zebra.util.rgb.white);

    ctx.getTopStack = function() { return this.stack[this.counter]; };

    ctx.tX = function(x, y) {
        var c = this.stack[this.counter], b = (c.sx != 1 || c.sy != 1 || c.rotateVal !== 0);
        return (b ?  ((c.crot * x + y * c.srot)/c.sx + 0.5) | 0 : x) - c.dx;
    };

    ctx.tY = function(x, y) {
        var c = this.stack[this.counter], b = (c.sx != 1 || c.sy != 1 || c.rotateVal !== 0);
        return (b ? ((y * c.crot - c.srot * x)/c.sy + 0.5) | 0 : y) - c.dy;
    };

    ctx.translate = function(dx, dy) {
        if (dx !== 0 || dy !== 0) {
            var c = this.stack[this.counter];
            c.x -= dx;
            c.y -= dy;
            c.dx += dx;
            c.dy += dy;
            $translate.call(this, dx, dy);
        }
    };

    ctx.rotate = function(v) {
        var c = this.stack[this.counter];
        c.rotateVal += v;
        c.srot = MS(c.rotateVal);
        c.crot = MC(c.rotateVal);
        $rotate.call(this, v);
    };

    ctx.scale = function(sx, sy) {
        var c = this.stack[this.counter];
        c.sx = c.sx * sx;
        c.sy = c.sy * sy;
        $scale.call(this, sx, sy);
    };

    ctx.save = function() {
        this.counter++;
        var c = this.stack[this.counter], cc = this.stack[this.counter - 1];
        c.x = cc.x;
        c.y = cc.y;
        c.width = cc.width;
        c.height = cc.height;

        c.dx = cc.dx;
        c.dy = cc.dy;
        c.sx = cc.sx;
        c.sy = cc.sy;
        c.srot = cc.srot;
        c.crot = cc.crot;
        c.rotateVal = cc.rotateVal;

        $save.call(this);
        return this.counter - 1;
    };

    ctx.restore = function() {
        if (this.counter === 0) throw new Error();
        this.counter--;
        $restore.call(this);
        return this.counter;
    };

    //!!!!!
    ctx.setClip = function(x,y,w,h) {};

    ctx.clipRect = function(x,y,w,h){
        var c = this.stack[this.counter];
        if (c.x != x || y != c.y || w != c.width || h != c.height) {
            var xx = c.x, yy = c.y, ww = c.width, hh = c.height;
            c.x      = Math.max(x, xx);
            c.width  = Math.min(x + w, xx + ww) - c.x;
            c.y      = Math.max(y, yy);
            c.height = Math.min(y + h, yy + hh) - c.y;
            if (c.x != xx || yy != c.y || ww != c.width || hh != c.height) {
                this.beginPath();
                this.rect(x, y, w, h);
                this.clip();
            }
        }
    };

    ctx.reset = function(w, h) {
        //!!!!!!!!!!!!
        this.counter = 0;
        this.stack[0].width = w;
        this.stack[0].height = h;
    };

    return ctx;
}

pkg.zCanvas = Class(pkg.Panel, pkg.Desktop, [
    function $clazz() {
        this.Layout = Class(zebra.layout.Layout, [
            function calcPreferredSize(c) {
                return  { width:parseInt(c.canvas.width, 10), height:parseInt(c.canvas.height, 10) };
            },

            function doLayout(c){
                var x = c.getLeft(), y = c.getTop(), w = c.width - c.getRight() - x, h = c.height - c.getBottom() - y;
                for(var i = 0;i < c.kids.length; i++){
                    var l = c.kids[i];
                    if(l.isVisible){
                        l.setLocation(x, y);
                        l.setSize(w, h);
                    }
                }
            }
        ]);
    },

    function $prototype() {
        function km(e) {
            var c = 0;
            if (e.altKey)   c += KeyEvent.ALT;
            if (e.shiftKey) c += KeyEvent.SHIFT;
            if (e.ctrlKey)  c += KeyEvent.CTRL;
            if (e.metaKey)  c += KeyEvent.CMD;
            return c;
        }

        this.focusGained = function(e){
            if ($focusGainedCounter++ > 0) {
                e.preventDefault();
                return;
            }

            debug("focusGained");

            if (pkg.focusManager.prevFocusOwner != null) {
                pkg.focusManager.requestFocus(pkg.focusManager.prevFocusOwner);
            }
        };

        this.focusLost = function(e){
            //!!! sometimes focus lost comes incorrectly
            if (document.activeElement == this.canvas) {
                e.preventDefault();
                return;
            }

            if ($focusGainedCounter === 0) return;
            $focusGainedCounter = 0;

            debug("focusLost");

            if (pkg.focusManager.focusOwner != null || pkg.getDesktop(pkg.focusManager.focusOwner) == this) {
                pkg.focusManager.requestFocus(null);
            }
        };

        this.keyTyped = function(e){
            if (e.charCode == 0) {
                if ($keyPressedCode != e.keyCode) this.keyPressed(e);
                $keyPressedCode = -1;
                return;
            }

            var ch = e.charCode;
            if (ch > 0) {
                var fo = pkg.focusManager.focusOwner;
                if(fo != null) {
                    debug("keyTyped: " + e.keyCode + "," + e.charCode + " " + (e.charCode == 0));
                    KE_STUB.reset(fo, KeyEvent.TYPED, e.keyCode, String.fromCharCode(e.charCode), km(e));
                    EM.performInput(KE_STUB);
                }
            }

            if (e.keyCode < 47) e.preventDefault();
        };

        this.keyPressed = function(e){
            $keyPressedCode  = e.keyCode;

            var code = e.keyCode, m = km(e);
            for(var i = this.kids.length - 1;i >= 0; i--){
                var l = this.kids[i];
                l.layerKeyPressed(code, m);
                if (l.isLayerActive()) break;
            }

            var focusOwner = pkg.focusManager.focusOwner;
            $keyPressedOwner     = focusOwner;
            $keyPressedModifiers = m;

            if (focusOwner != null) {
                debug("keyPressed : " + e.keyCode, 1);
                KE_STUB.reset(focusOwner, KPRESSED, code, code < 47 ? KeyEvent.CHAR_UNDEFINED : '?', m);
                EM.performInput(KE_STUB);

                if (code == KeyEvent.VK_ENTER) {
                    debug("keyTyped keyCode = " + code);
                    KE_STUB.reset(focusOwner, KeyEvent.TYPED, code, "\n", m);
                    EM.performInput(KE_STUB);
                }
            }

            //!!!!
            if (code < 47 && code != 32) e.preventDefault();
        };

        this.keyReleased = function(e){
            $keyPressedCode = -1;

            var fo = pkg.focusManager.focusOwner;
            if(fo != null) {
                debug("keyReleased : " + e.keyCode, -1);
                KE_STUB.reset(fo, KeyEvent.RELEASED, e.keyCode, KeyEvent.CHAR_UNDEFINED, km(e));
                EM.performInput(KE_STUB);
            }
        };

        this.mouseEntered = function(e){
            if (pkg.$mouseDraggOwner == null){
                var x = meX(e, this), y = meY(e, this), d = this.getComponentAt(x, y);

                if (pkg.$mouseMoveOwner != null && d != pkg.$mouseMoveOwner) {
                    var prev = pkg.$mouseMoveOwner;
                    pkg.$mouseMoveOwner = null;

                    debug("mouseExited << ", -1);
                    ME_STUB.reset(prev, MEXITED, x, y, -1, 0);
                    EM.performInput(ME_STUB);
                }

                if(d != null && d.isEnabled){
                    debug("mouseEntered >> ", 1);
                    pkg.$mouseMoveOwner = d;
                    ME_STUB.reset(d, MENTERED, x, y, -1, 0);
                    EM.performInput(ME_STUB);
                }
            }
        };

        this.mouseExited = function (e){
            if(pkg.$mouseMoveOwner != null && pkg.$mouseDraggOwner == null){
                var p = pkg.$mouseMoveOwner;
                pkg.$mouseMoveOwner = null;

                ME_STUB.reset(p, MEXITED, meX(e, this), meY(e, this), -1, 0);
                EM.performInput(ME_STUB);
            }
        };

        this.mouseMoved = function(e){
            if (pkg.$mousePressedOwner != null) {
                this.mouseDragged(e);
                return;
            }

            var x = meX(e, this), y = meY(e, this), d = this.getComponentAt(x, y);
            if (pkg.$mouseMoveOwner != null) {
                if (d != pkg.$mouseMoveOwner) {
                    var old = pkg.$mouseMoveOwner;

                    debug("mouseExited << ", -1);

                    pkg.$mouseMoveOwner = null;
                    ME_STUB.reset(old, MEXITED, x, y, -1, 0);
                    EM.performInput(ME_STUB);

                    if (d != null && d.isEnabled === true) {

                        debug("mouseEntered >> " , 1);

                        pkg.$mouseMoveOwner = d;
                        ME_STUB.reset(pkg.$mouseMoveOwner, MENTERED, x, y, -1, 0);
                        EM.performInput(ME_STUB);
                    }
                }
                else {
                    if (d != null && d.isEnabled) {
                        ME_STUB.reset(d, MMOVED, x, y, -1, 0);
                        EM.performInput(ME_STUB);
                    }
                }
            }
            else {
                if (d != null && d.isEnabled === true){
                    debug("mouseEntered >> ", 1);
                    pkg.$mouseMoveOwner = d;
                    ME_STUB.reset(d, MENTERED, x, y, -1, 0);
                    EM.performInput(ME_STUB);
                }
            }
        };

        this.mouseReleased = function(e){

            if ($mousePressedEvent == null) return;
            $mousePressedEvent = null;

            var drag = pkg.$mouseDraggOwner, x = meX(e, this), y = meY(e, this), m = e.button === 0 ? BM1: (e.button == 2 ? BM3 : 0);
            if(drag != null){
                ME_STUB.reset(drag, MouseEvent.ENDDRAGGED, x, y, m, 0);
                EM.performInput(ME_STUB);
                pkg.$mouseDraggOwner = null;
            }

            var po = pkg.$mousePressedOwner;
            if (po != null){

                debug("mouseReleased ", -1);
                ME_STUB.reset(po, MouseEvent.RELEASED, x, y, m, 0);
                EM.performInput(ME_STUB);

                if (drag == null) {
                    var when = (new Date()).getTime(), clicks = ((when - this.lastClickTime) < this.doubleClickDelta) ? 2 : 1;
                    ME_STUB.reset(po, MouseEvent.CLICKED, x, y, m, clicks);
                    EM.performInput(ME_STUB);
                    this.lastClickTime = clicks > 1 ? 0 : when;
                }
                pkg.$mousePressedOwner = null;
            }

            var mo = pkg.$mouseMoveOwner;
            if (drag != null || (po != null && po != mo)) {
                var nd = this.getComponentAt(x, y);
                if (nd != mo) {
                    if (mo != null) {
                        debug("mouseExited << ", -1);
                        ME_STUB.reset(mo, MEXITED, x, y, -1, 0);
                        EM.performInput(ME_STUB);
                    }

                    if (nd != null && nd.isEnabled === true){
                        pkg.$mouseMoveOwner = nd;

                        debug("mouseEntered >> ", 1);

                        ME_STUB.reset(nd, MENTERED, x, y, -1, 0);
                        EM.performInput(ME_STUB);
                    }
                }
            }
        };

        this.mousePressed = function(e) {
            var $mousePressedMask = e.button === 0 ? BM1: (e.button == 2 ? BM3 : 0);

            // !!! it is possible to have a problem with stored event object in IE
            // !!! store what we need in event-independent object
            $mousePressedEvent = {
                button  : e.button,
                clientX : e.clientX,
                clientY : e.clientY,
                pageX   : e.pageX,
                pageY   : e.pageY,
                $button : $mousePressedMask,
                $zcanvas: this
            };

            $mousePressedX = meX(e, this);
            $mousePressedY = meY(e, this);

            for(var i = this.kids.length - 1;i >= 0; i--){
                var l = this.kids[i];
                l.layerMousePressed($mousePressedX, $mousePressedY, $mousePressedMask);
                if (l.isLayerActiveAt($mousePressedX, $mousePressedY)) break;
            }

            var d = this.getComponentAt($mousePressedX, $mousePressedY);
            if (d != null && d.isEnabled === true){
                pkg.$mousePressedOwner = d;
                ME_STUB.reset(d, MouseEvent.PRESSED, $mousePressedX, $mousePressedY, $mousePressedMask, 0);
                EM.performInput(ME_STUB);
            }
        };

        this.mouseDragged = function(e){
            var x = meX(e, this), y = meY(e, this), m = $mousePressedEvent.$button;

            if (pkg.$mouseDraggOwner == null){
                var d = (pkg.$mouseMoveOwner == null) ? this.getComponentAt($mousePressedX, $mousePressedY)
                                                      : pkg.$mouseMoveOwner;
                if (d != null && d.isEnabled === true) {
                    pkg.$mouseDraggOwner = d;
                    ME_STUB.reset(d, MouseEvent.STARTDRAGGED, $mousePressedX, $mousePressedY, m, 0);
                    EM.performInput(ME_STUB);

                    if ($mousePressedX != x || $mousePressedY != y) {
                        ME_STUB.reset(d, MDRAGGED, x, y, m, 0);
                        EM.performInput(ME_STUB);
                    }
                }
            }
            else {
                ME_STUB.reset(pkg.$mouseDraggOwner, MDRAGGED, x, y, m, 0);
                EM.performInput(ME_STUB);
            }
        };

        this.getComponentAt = function(x,y){
            for(var i = this.kids.length; --i >= 0; ){
                var tl = this.kids[i];
                if (tl.isLayerActiveAt(x, y)) return EM.getEventDestination(tl.getComponentAt(x, y));
            }
            return null;
        };
    },

    function(w, h) { this.$this(this.toString(), w, h); },

    function(canvas) { this.$this(canvas, -1, -1); },

    function(canvas, w, h) {
        var pc = canvas;
        if (zebra.isString(canvas)) canvas = document.getElementById(canvas);

        if (canvas == null) {
            canvas = document.createElement("canvas");
            canvas.setAttribute("class", "zebracanvas");
            canvas.setAttribute("width",  w <= 0 ? "400px" : "" + w + "px");
            canvas.setAttribute("height", h <= 0 ? "400px" : "" + h + "px");
            canvas.setAttribute("id", pc);
            document.body.appendChild(canvas);
        }

        if (canvas.getAttribute("tabindex") === null) {
            canvas.setAttribute("tabindex", "0");
        }


        //!!!! need for native element layouting
        ////canvas.style.overflow = "auto";

        this.$super(new pkg.zCanvas.Layout());

        this.da = { x:0, y:0, width:-1, height:0 };
        this.width  = parseInt(canvas.width, 10);
        this.height = parseInt(canvas.height, 10);
        this.offx = this.offy = 0;
        this.graph = createContext(canvas.getContext("2d"), this.width, this.height);

        var e = canvas;
        if (e.offsetParent) {
            do {
                this.offx += parseInt(e.offsetLeft, 10) + measure(e, 'border-left-width');
                this.offy += parseInt(e.offsetTop, 10)  + measure(e, 'border-top-width');
            } while (e = e.offsetParent);
        }
        this.offx += measure(canvas, "padding-left");
        this.offy += measure(canvas, "padding-top");

        this.canvas = canvas;
        this.doubleClickDelta = 180;

        //!!! Event manager EM variable cannot be initialized before zebra.ui initialization
        EM = pkg.events;

        var layers = pkg.get("layers");
        for(var i=0; i < layers.length; i++) this.add(pkg.get(layers[i]));

        var $this = this;
        this.canvas.onmousemove   = function(e) { $this.mouseMoved(e);   };
        this.canvas.onmousedown   = function(e) { $this.mousePressed(e); };
        this.canvas.onmouseup     = function(e) { $this.mouseReleased(e);};
        this.canvas.onmouseover   = function(e) { $this.mouseEntered(e); };
        this.canvas.onmouseout    = function(e) { $this.mouseExited(e);  };
        this.canvas.onkeydown     = function(e) { $this.keyPressed(e);   };
        this.canvas.onkeyup       = function(e) { $this.keyReleased(e);  };
        this.canvas.onkeypress    = function(e) { $this.keyTyped(e);     };
        this.canvas.oncontextmenu = function(e) { e.preventDefault(); };
        this.canvas.onmove        = function(e) { setupMeF(); };
        this.canvas.onfocus       = function(e) { $this.focusGained(e); };
        this.canvas.onblur        = function(e) {  $this.focusLost(e);  };
        if (zebra.isInBrowser) window.onresize = function() { setupMeF(); };


        //!!!
        new pkg.MWheelSupport(this);
        this.bg = pkg.get("def.bg");
        this.validate();

        //!!!
        setupMeF();
    },

    function setSize(w, h) {
        if (this.canvas.width != w || h != this.canvas.height) {
            this.graph.reset(w, h);
            this.canvas.width  = w;
            this.canvas.height = h;
            this.$super(w, h);
        }
    },

    function kidAdded(i,constr,c){
        if (typeof this[c.id] !== "undefined") throw new Error();
        this[c.id] = c;
        this.$super(i, constr, c);
    },

    function getLayer(id){ return this[id]; },

    function kidRemoved(i, c){
        delete this[c.id];
        this.$super(i, c);
    }
]);

pkg.NativeE = Class(pkg.Panel, pkg.MouseListener, pkg.FocusListener, [
    function() {
        this.$super();
        this.element = document.createElement("input");
        this.element.setAttribute("type",  "text");
        this.element.setAttribute("id", this);
        //this.element.setAttribute("style", "visibility:hidden;");


        this.element.style.border  = "none";
        this.element.style.backgroundColor  = "transparent";


        document.body.appendChild(this.element);


        zebra.print("Element : " + this.element.offsetWidth);
        console.log(this.element);


        this.setPreferredSize(1, 22);

        zebra.print("Element : " + this.element.offsetWidth);

        this.element.style.zIndex = 10;



        var $this = this;

        // this.element.onfocus = function() {
        //     zebra.print("onfocus");
        //     pkg.focusManager.requestFocus($this);
        // };


        function keyHandler(e) {
            if(e.keyCode == 9) {
                if(e.preventDefault) e.preventDefault();

                EM.performInput(new pkg.KeyEvent($this, 5, e.keyCode, '', 0));
                return false;

            }
        }


        if(this.element.addEventListener) {
            this.element.addEventListener('keydown', keyHandler,false);
        }
        else
        if (this.element.attachEvent) {
            this.element.attachEvent('onkeydown',this.keyHandler);
        }



        this.setBorder(new pkg.view.Border(1));
        this.setBackground(new pkg.view.Gradient("#CCCCCC", "#FFFFFF"));


        this.delegate = function(name, e) {
            var d = pkg.getDesktop(this);
            if (d) {
                if (typeof e.clientX !== "undefined") {
                    zebra.print(e.clientX + "," + this.x);
                 //   e.clientX = e.clientX + this.x;
                   // e.clientY = e.clientY + this.y;
                }
                d[name].call(d, e);
            }
        };

        var $this = this;
        this.element.onmousemove   = function(e) { $this.delegate("mouseMoved", e);   };
        this.element.onmousedown   = function(e) { $this.delegate("mousePressed",e); };
        this.element.onmouseup     = function(e) { $this.delegate("mouseReleased",e);};
        this.element.onmouseover   = function(e) { $this.delegate("mouseEntered",e); };
        this.element.onmouseout    = function(e) { $this.delegate("mouseExited",e);  };
        this.element.onkeydown     = function(e) { $this.delegate("keyPressed",e);   };
        this.element.onkeyup       = function(e) { $this.delegate("keyReleased",e);  };
        this.element.onkeypress    = function(e) { $this.delegate("keyTyped",e);     };
    },

    function focusLost(e) {
        zebra.print("FocusLost ....  ");
        this.element.blur();

    },

    function focusGained(e) {
        zebra.print("FocusGained ....  ");
        this.element.focus();

    },

    function mouseEntered(e) {
        zebra.print("!!!!!!!! " + e.y);
    },

    function canHaveFocus() { return true; },

    function setBorder(br) {
        this.$super(br);

        zebra.print(this.getLeft());
        this.element.style.paddingTop  = this.getTop() + "px";
        this.element.style.paddingLeft = this.getLeft() + 4+ "px";
        this.element.style.paddingRight = this.getRight() + "px";
        this.element.style.paddingBottom = this.getBottom() + "px";
    },

    function paddins(t,l,b,r) {
        this.$super(t,l,b,r);
        // this.element.style["padding-top"]  = t;
        // this.element.style["padding-left"] = l;
        // this.element.style["padding-right"] = r;
        // this.element.style["padding-bottom"] = b;
    },

    function setVisible(b) {
        if (this.isVisible != b) {
            this.element.style.zIndex = b ? 10 : -1;
            this.$super(b);
        }
    },

    function setSize(w, h) {
        this.$super(w, h);
        //if (this.parent != null) {
            this.element.style.width = "" + w + "px";
            this.element.style.height = "" + h + "px";
        //}
    },

    function setLocation(x, y) {
        this.$super(x, y);
        //if (this.parent != null) {
            var a = zebra.layout.getAbsLocation(0,0,this);
            zebra.print(a[0] + "," + a[1]);
            this.element.style.position = "absolute";
            this.element.style.top = "" + a[1] + "px";
            this.element.style.left = "" + a[0] + "px";
        //}
    },

    function setParent(p) {
        this.$super(p);
        this.element.style.display = "visible";
    }




]);




})(zebra("ui"), zebra.Class);
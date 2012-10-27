(function(pkg, Class, Interface) {

pkg.getPropertySetter = function(clazz, name) {
    if (clazz.$beanInfo) {
        if (clazz.$beanInfo.hasOwnProperty(name)) return clazz.$beanInfo[name];
    }
    else clazz.$beanInfo = {};

    var names = [ ["set", name[0].toUpperCase(), name.substring(1)].join(''), name ], f = null;
    for (var i=0; i < names.length && f == null; i++) {
        f = (function(m) {
            if (typeof m  === "function") {
                if (m.$clone$) {
                    for(var k in m.methods) {
                        if (k > 1) return (function(o, v) { m.apply(o, v && v.$new ? v.$new() : v); });
                    }
                }
                return m.length > 1 ? (function(o, v) { m.apply(o, v && v.$new ? v.$new() : v); })
                                    : function(o, v) { m.call(o, v && v.$new ? v.$new() : v); };
            }
        })(clazz.prototype[names[i]]);
    }

    if (f == null) f = function(o, v) { o[name] = v && v.$new ? v.$new() : v; };
    clazz.$beanInfo[name] = f;
    return f;
};

function hex(v) { return (v < 16) ? ["0", v.toString(16)].join('') :  v.toString(16); }

pkg.rgb = function (r, g, b, a) {
    if (arguments.length == 1) {
        if (zebra.isString(r)) {
            this.s = r;
            if (r[0] === '#') {
                r = parseInt(r.substring(1), 16);
            }
            else {
                if (r[0] === 'r' && r[1] === 'g' && r[2] === 'b') {
                    var i = r.indexOf('(', 3), p = r.substring(i + 1, r.indexOf(')', i + 1)).split(",");
                    this.r = parseInt(p[0].trim(), 10);
                    this.g = parseInt(p[1].trim(), 10);
                    this.b = parseInt(p[2].trim(), 10);
                    if (p.length > 3) this.D = parseInt(p[2].trim(), 10);
                    return;
                }
            }
        }
        this.r = r >> 16;
        this.g = (r >> 8) & 0xFF;
        this.b = (r & 0xFF);
    }
    else {
        this.r = r;
        this.g = g;
        this.b = b;
        if (arguments.length > 3) this.a = a;
    }

    if (this.s == null) {
        this.s = (typeof this.a !== "undefined") ? ['rgba(', this.r, ",", this.g, ",",
                                                             this.b, ",", this.a, ")"].join('')
                                                 : ['#', hex(this.r), hex(this.g), hex(this.b)].join('');
    }
};

var rgb = pkg.rgb;
rgb.prototype.toString = function() { return this.s; };

rgb.prototype.equals = function(c){
    return c != null && (c === this || (this.r == c.r && this.b == c.b && this.g == c.g && this.a == c.a));
};

rgb.prototype.paint = function(g,x,y,w,h,d) {
    if (this.s != g.fillStyle) g.fillStyle = this.s;
    g.fillRect(x, y, w, h);
};

rgb.prototype.getPreferredSize = function() {
    return { width:0, height:0 };
};

rgb.black     = new rgb(0);
rgb.white     = new rgb(0xFFFFFF);
rgb.red       = new rgb(255,0,0);
rgb.blue      = new rgb(0,0,255);
rgb.green     = new rgb(0,255,0);
rgb.gray      = new rgb(128,128,128);
rgb.lightGray = new rgb(211,211,211);
rgb.darkGray  = new rgb(169,169,169);
rgb.orange    = new rgb(255,165,0);
rgb.yellow    = new rgb(255,255,0);
rgb.pink      = new rgb(255,192,203);
rgb.cyan      = new rgb(0,255,255);
rgb.magenta   = new rgb(255,0,255);
rgb.darkBlue  = new rgb(0, 0, 140);

pkg.Actionable = Interface();

pkg.index2point  = function(offset,cols) { return [~~(offset / cols), (offset % cols)]; };
pkg.indexByPoint = function(row,col,cols){ return (cols <= 0) ?  -1 : (row * cols) + col; };

pkg.intersection = function(x1,y1,w1,h1,x2,y2,w2,h2,r){
    r.x = x1 > x2 ? x1 : x2;
    r.width = Math.min(x1 + w1, x2 + w2) - r.x;
    r.y = y1 > y2 ? y1 : y2;
    r.height = Math.min(y1 + h1, y2 + h2) - r.y;
};

pkg.isIntersect = function(x1,y1,w1,h1,x2,y2,w2,h2){
    return (Math.min(x1 + w1, x2 + w2) - (x1 > x2 ? x1 : x2)) > 0 &&
           (Math.min(y1 + h1, y2 + h2) - (y1 > y2 ? y1 : y2)) > 0;
};

pkg.unite = function(x1,y1,w1,h1,x2,y2,w2,h2,r){
    r.x = x1 < x2 ? x1 : x2;
    r.y = y1 < y2 ? y1 : y2;
    r.width  = Math.max(x1 + w1, x2 + w2) - r.x;
    r.height = Math.max(y1 + h1, y2 + h2) - r.y;
};

pkg.arraycopy = function(src, spos, dest, dpos, dlen) {
    for(var i=0; i<dlen; i++) dest[i + dpos] = src[spos + i];
};

pkg.currentTimeMillis = function() { return (new Date()).getTime(); };

pkg.str2bytes = function(s) {
    var ar = [];
    for (var i = 0; i < s.length; i++) {
        var code = s.charCodeAt(i);
        ar.push((code >> 8) & 0xFF);
        ar.push(code & 0xFF);
    }
    return ar;
};

var digitRE = /[0-9]/;
pkg.isDigit = function(ch) {
    if (ch.length != 1) throw new Error("Incorrect character");
    return digitRE.test(ch);
};

var letterRE = /[A-Za-z]/;
pkg.isLetter = function (ch) {
    if (ch.length != 1) throw new Error("Incorrect character");
    return letterRE.test(ch);
};

pkg.Listeners = function(n) {
    this.n = n ? n : 'fired';
};

var L = pkg.Listeners.prototype;

L.add = function(l) {
    if (!this.v) this.v = [];
    this.v.push(l);
};

L.remove = function(l) {
    if (this.v) {
        var i = 0;
        while((i = this.v.indexOf(l)) >= 0) this.v.splice(i, 1);
    }
};

L.fire = function() {
    if(this.v) {
        var n = this.n;
        for(var i = 0;i < this.v.length; i++) {
            var v = this.v[i];
            if (typeof v === 'function') v.apply(this, arguments);
            else v[n].apply(v, arguments);
        }
    }
};

L.removeAll = function(){ if (this.v) this.v.length = 0; };

pkg.MListeners = function() {
    if (arguments.length == 0) throw new Error();
    var $this = this;
    this.methods = {};
    for(var i=0; i<arguments.length; i++) {
        var c = [], m = arguments[i];
        this.methods[m] = c;
        (function(m, c) {
            $this[m] = function() {
                for(var i=0;i<c.length; i++) c[i][1].apply(c[i][0], arguments);
            };
        })(m, c);
    }
};

var ML = pkg.MListeners.prototype;

ML.add = function(l) {
    if (typeof l === 'function') {
        var n = zebra.FN(l);
        if (n == '') {
            for(var k in this.methods) {
                if (this.methods.hasOwnProperty(k)) this.methods[k].push([this, l]);
            }
        }
        else {
            if (this.methods.hasOwnProperty(n) === false) throw new Error("Unknown listener " + n);
            this.methods[n].push([this, l]);
        }
    }
    else {
        var b = false;
        for(var k in this.methods) {
            if (this.methods.hasOwnProperty(k)) {
                if (typeof l[k] === "function") {
                    this.methods[k].push([l, l[k]]);
                    b = true;
                }
            }
        }
        if (b === false) throw new Error("No listener can be registered for " + l);
    }
};

ML.remove = function(l) {
    for(var k in this.methods) {
        var v = this.methods[k];
        for(var i = 0; i < v.length; i++) {
            var f = v[i];
            if (l != this && (f[1] == l || f[0] == l)) v.splice(i, 1);
        }
    }
};

ML.removeAll = function(l) {
    for(var k in this.methods) {
        if (thi.methods.hasOwnProperty(k)) this.methods[k].length = 0;
    }
};

var Position = pkg.Position = Class([
    function $clazz() {
        this.PositionMetric = Interface();
        this.DOWN = 1;
        this.UP   = 2;
        this.BEG  = 3;
        this.END  = 4;
    },

    function $prototype() {
        this.invalidate = function (){ this.isValid = false; };

        this.clearPos = function (){
            if(this.offset >= 0){
                var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol;
                this.offset  = this.currentLine = this.currentCol - 1;
                this._.fire(this, prevOffset, prevLine, prevCol);
            }
        };

        this.setOffset = function(o){
            if(o < 0) o = 0;
            else {
                var max = this.metrics.getMaxOffset();
                if(o >= max) o = max;
            }

            if(o != this.offset){
                var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol,  p = this.getPointByOffset(o);
                this.offset = o;
                if(p != null){
                    this.currentLine = p[0];
                    this.currentCol = p[1];
                }
                this.isValid = true;
                this._.fire(this, prevOffset, prevLine, prevCol);
            }
        };

        this.seek = function(off){ this.setOffset(this.offset + off); };

        this.setRowCol = function (r,c){
            if(r != this.currentLine || c != this.currentCol){
                var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol;
                this.offset = this.getOffsetByPoint(r, c);
                this.currentLine = r;
                this.currentCol = c;
                this._.fire(this, prevOffset, prevLine, prevCol);
            }
        };

        this.inserted = function (off,size){
            if(this.offset >= 0 && off <= this.offset){
                this.invalidate();
                this.setOffset(this.offset + size);
            }
        };

        this.removed = function (off,size){
            if(this.offset >= 0 && this.offset >= off){
                this.invalidate();
                if(this.offset >= (off + size)) this.setOffset(this.offset - size);
                else this.setOffset(off);
            }
        };

        this.getPointByOffset = function(off){
            if(off == -1) return [-1, -1];
            var m = this.metrics, max = m.getMaxOffset();
            if(off > max) throw new Error("" + off);
            if(max === 0) return [(m.getLines() > 0 ? 0 : -1)];
            if(off === 0) return [0,0];
            var d = 0, sl = 0, so = 0;
            if(this.isValid && this.offset !=  -1){
                sl = this.currentLine;
                so = this.offset - this.currentCol;
                if(off > this.offset) d = 1;
                else
                    if(off < this.offset) d =  -1;
                    else return [sl, this.currentCol];
            }
            else{
                d = (~~(max / off) === 0) ?  -1 : 1;
                if(d < 0){
                    sl = m.getLines() - 1;
                    so = max - m.getLineSize(sl);
                }
            }
            for(; sl < m.getLines() && sl >= 0; sl += d){
                var ls = m.getLineSize(sl);
                if(off >= so && off < so + ls) return [sl, off - so];
                so += d > 0 ? ls : -m.getLineSize(sl - 1);
            }
            return [-1, -1];
        };

        this.getOffsetByPoint = function (row,col){
            var startOffset = 0, startLine = 0, m = this.metrics;

            if(row >= m.getLines() || col >= m.getLineSize(row)) throw new Error();
            if(this.isValid && this.offset !=  -1) {
                startOffset = this.offset - this.currentCol;
                startLine = this.currentLine;
            }
            if (startLine <= row) for(var i = startLine;i < row; i++) startOffset += m.getLineSize(i);
            else for(var i = startLine - 1;i >= row; i--) startOffset -= m.getLineSize(i);
            return startOffset + col;
        };

        this.calcMaxOffset = function (){
            var max = 0, m = this.metrics;
            for(var i = 0;i < m.getLines(); i ++ ) max += m.getLineSize(i);
            return max - 1;
        };
    },

    function (pi){
        this._ = new pkg.Listeners("posChanged");
        this.isValid = false;
        this.metrics = null;
        this.currentLine = this.currentCol = this.offset = 0;
        this.setPositionMetric(pi);
    },

    function setPositionMetric(p){
        if(p == null) throw new Error();
        if(p != this.metrics){
            this.metrics = p;
            this.clearPos();
        }
    },

    function seekLineTo(t){ this.seekLineTo(t, 1); },

    function seekLineTo(t,num){
        if(this.offset < 0){
            this.setOffset(0);
            return;
        }
        var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol;
        switch(t)
        {
            case Position.BEG:
                if(this.currentCol > 0){
                    this.offset -= this.currentCol;
                    this.currentCol = 0;
                    this._.fire(this, prevOffset, prevLine, prevCol);
                } break;
            case Position.END:
                var maxCol = this.metrics.getLineSize(this.currentLine);
                if(this.currentCol < (maxCol - 1)){
                    this.offset += (maxCol - this.currentCol - 1);
                    this.currentCol = maxCol - 1;
                    this._.fire(this, prevOffset, prevLine, prevCol);
                } break;
            case Position.UP:
                if(this.currentLine > 0){
                    this.offset -= (this.currentCol + 1);
                    this.currentLine--;
                    for(var i = 0;this.currentLine > 0 && i < (num - 1); i++ , this.currentLine--){
                        this.offset -= this.metrics.getLineSize(this.currentLine);
                    }
                    var maxCol = this.metrics.getLineSize(this.currentLine);
                    if(this.currentCol < maxCol) this.offset -= (maxCol - this.currentCol - 1);
                    else this.currentCol = maxCol - 1;
                    this._.fire(this, prevOffset, prevLine, prevCol);
                } break;
            case Position.DOWN:
                if(this.currentLine < (this.metrics.getLines() - 1)){
                    this.offset += (this.metrics.getLineSize(this.currentLine) - this.currentCol);
                    this.currentLine++;
                    var size = this.metrics.getLines() - 1;
                    for(var i = 0;this.currentLine < size && i < (num - 1); i++ ,this.currentLine++ ){
                        this.offset += this.metrics.getLineSize(this.currentLine);
                    }
                    var maxCol = this.metrics.getLineSize(this.currentLine);
                    if(this.currentCol < maxCol) this.offset += this.currentCol;
                    else {
                        this.currentCol = maxCol - 1;
                        this.offset += this.currentCol;
                    }
                    this._.fire(this, prevOffset, prevLine, prevCol);
                } break;
            default: throw new Error();
        }
    }
]);

pkg.timer = new (function() {
    var quantum = 40;

    function CI() {
       this.run = null;
       this.ri = this.si = 0;
    }

    this.consumers  = Array(5);
    this.aconsumers = 0;
    for(var i = 0; i< this.consumers.length; i++) this.consumers[i] = new CI();

    this.get = function(r) {
        if (this.aconsumers > 0) {
            for(var i=0; i < this.consumers.length; i++) {
                var c = this.consumers[i];
                if (c.run != null && c.run == r) return c;
            }
        }
        return null;
    };

    this.run = function(r, startIn, repeatIn){
        var ps = this.consumers.length;
        if (this.aconsumers == ps) throw new Error("Out of runners limit");

        var ci = this.get(r);
        if (ci == null) {
            var consumers = this.consumers, $this = this;
            for(var i=0; i < ps; i++) {
                var j = (i + this.aconsumers) % ps, c = consumers[j];
                if (c.run == null) {
                    c.run = r;
                    c.si = startIn;
                    c.ri = repeatIn;
                    break;
                }
            }
            this.aconsumers++;

            if (this.aconsumers == 1) {
                var ii = window.setInterval(function() {
                    for(var i = 0; i < ps; i++) {
                        var c = consumers[i];
                        if (c.run != null) {
                            if (c.si <= 0){
                                try { c.run.run(); }
                                catch(e) {
                                    if (e.msg && e.msg.toLowerCase() === "interrupt") {
                                        c.run = null;
                                        $this.aconsumers--;
                                        if ($this.aconsumers === 0) break;
                                        continue;
                                    }
                                    zebra.out.print(e);
                                }
                                c.siw += c.ri;
                            }
                            else c.si -= quantum;
                        }
                    }
                    if ($this.aconsumers === 0) window.clearInterval(ii);
                }, quantum);
            }
         }
         else {
             ci.si = startIn;
             ci.ri = repeatIn;
         }
    };

    this.remove = function(l) {
        this.get(l).run = null;
        this.aconsumers--;
    };

    this.clear = function(l){
        var c = this.get(l);
        c.si = c.ri;
    };
})();

pkg.Bag = zebra.Class([
    function () { this.$this({}); },

    function (container) {
        this.aliases = {};
        this.objects = container;
        this.content = {};
    },

    function get(key) {
        if (key == null) throw new Error();
        var n = key.split('.'), v = this.objects;
        for(var i = 0; i < n.length; i++) {
            v = v[n[i]];
            if (typeof v === "undefined") return v;
        }
        return v != null && v.$new ? v.$new() : v;
    },

    function load(s) { return this.load(s, true); },

    function load(s, b) {
        if (this.isloaded === true) throw new Error("Load is done");
        var content = null;
        try { content = JSON.parse(s); }
        catch(e) { throw new Error("Wrong JSON format"); }
        this.content = this.mergeContent(this.content, content);
        this.loaded(this.content);
        if (b === true) this.end();
        return this;
    },

    function end() {
        if (typeof this.isloaded === "undefined") {
            this.isloaded = true;
            if (this.content.hasOwnProperty("$aliases")) {
                var aliases = this.content["$aliases"];
                for(var k in aliases) {
                    this.aliases[k.trim()] = Class.forName(aliases[k].trim());
                }
                delete this.content["$aliases"];
            }
            this.objects = this.mergeObjWithDesc(this.objects, this.content);
        }
    },

    function loaded(c) {},

    function preprocess(v, cb) {
        if (v == null || zebra.isNumber(v) || zebra.isBoolean(v)) return v;
        if (zebra.isString(v)) return cb(v);

        if (Array.isArray(v)) {
            for (var i = 0; i < v.length; i++) v[i] = this.preprocess(v[i], cb);
            return v;
        }

        for (var k in v) if (v.hasOwnProperty(k)) v[k] = this.preprocess(v[k], cb);
        return v;
    },

    function mergeContent(o, v) {
        if (v === null || zebra.isNumber(v) || zebra.isBoolean(v) || zebra.isString(v)) return v;

        if (Array.isArray(v)) {
            if (o && !Array.isArray(o)) throw new Error("Array merging type inconsistency");
            return o ? o.concat(v) : v;
        }

        for (var k in v) {
            if (v.hasOwnProperty(k)) {
                o[k] = o.hasOwnProperty(k) ? this.mergeContent(o[k], v[k]) : v[k];
            }
        }
        return o;
    },

    function inherit(o, pp) {
        for(var i=0; i < pp.length; i++) {
            var op = this.objects, n = pp[i].trim(), nn = n.split("."), j = 0;
            while (j < nn.length) {
                op = op[nn[j++]];
                if (op == null) {
                    for(var kk in this.objects) zebra.print(" kk = " + kk);
                    throw new Error("Cannot find referenced object by '" + n + "(" + nn[j-1] + ")' path");
                }
            }

            for(var k in op) {
                if (op.hasOwnProperty(k) && o.hasOwnProperty(k) === false) o[k] = op[k];
            }
        }
    },

    // pass object to be assigned with the given value
    function mergeObjWithDesc(o, d) {
        if (d === null || zebra.isNumber(d) || zebra.isBoolean(d)) {
            return d;
        }

        if (Array.isArray(d)) {
            var v = [];
            for(var i=0; i< d.length; i++) v[i] = this.mergeObjWithDesc(null, d[i]);
            if (o && !Array.isArray(o)) throw new Error("Destination has to be array");
            return (o != null) ? o.concat(v) : v;
        }

        if (zebra.isString(d)) {
            return (d[0] == "@") ? this.get(d.substring(1)) : this.decodeStringValue(d);
        }

        var inh = null;
        if (d.hasOwnProperty("$inherit")) {
            inh = d["$inherit"];
            delete d["$inherit"];
        }

        var v = (o == null || zebra.isNumber(o) || zebra.isBoolean(o) || zebra.isString(o) || Array.isArray(o)) ? d : o;
        for (var k in d) {
            if (d.hasOwnProperty(k)) {
                if (k[0] == ".") {
                    var vv = d[k], mn = k.substring(1).trim();
                    if (!Array.isArray(vv)) vv = [ vv ];
                    return this.objects[mn].apply(this.objects, this.mergeObjWithDesc(null, vv));
                }

                if (k[0] == "$") {
                    var args = d[k];
                    v["$args" ] = this.mergeObjWithDesc(null, Array.isArray(args) ? args : [ args ]);
                    v["$class"] = k.substring(1).trim();
                }
                else
                {
                    var po = o && o.hasOwnProperty(k) ? o[k] : null;
                    v[k] = d[k];
                    v[k] = this.mergeObjWithDesc(po, d[k]);
                }
            }
        }

        if (v.hasOwnProperty("$class")) {
            var cn = v["$class"], args = v["$args"], $this = this;
            if (cn[0] == "*") {
                return { $new : function() { return $this.newInstance(cn.substring(1).trim(), args, v); } };
            }
            return this.newInstance(cn, args, v);
        }

        if (inh !== null) this.inherit(v, inh);
        return v;
    },

    function newInstance(cn, args, p) {
        var clazz = this.resolveClass(cn), o = null;
        if (args && args.length > 0) {
            var f = function() {};
            f.prototype = clazz.prototype;
            o = new f();
            o.constructor = clazz;
            clazz.apply(o, args);
        }
        else o = new clazz();
        if (p) {
            for(var k in p) {
                if (p.hasOwnProperty(k) && k[0] != "$") o[k] = p[k];
            }
        }
        return o;
    },

    function decodeStringValue(v) {
        return (v[0] == "#" || (v[0] == 'r' && v[1] == 'g' && v[2] == 'b')) ? new pkg.rgb(v) : v;
    },

    function resolveClass(clazz) {
        return this.aliases.hasOwnProperty(clazz) ? this.aliases[clazz] : zebra.Class.forName(clazz);
    }
]);

})(zebra("util"), zebra.Class, zebra.Interface);
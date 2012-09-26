(function(pkg, Class, Interface) {

var HEX = "0123456789ABCDEF";

pkg.ID = function UUID(size) {
    if (typeof size === 'undefined') size = 16;
    var id = [];
    for (var i=0; i<36; i++)  id[i] = HEX[~~(Math.random() * 16)];
    return id.join('');
};

pkg.Dimension = function(w, h) {
     this.width  = w;
     this.height = h;
};
pkg.Dimension.prototype.equals = function(obj) { return obj === this || (obj !== null && this.width == obj.width && this.height == obj.height); };
pkg.Dimension.prototype.toString = function() { return ["width=", this.width, ", height=", this.height].join(''); };

pkg.Point = function(x, y) {
    this.x = x;
    this.y = y;
};

pkg.Point.prototype.equals = function(obj) { return obj !== null && this.x == obj.x && this.y == obj.y; };
pkg.Point.prototype.toString = function() { return ["x=", this.x, ", y=", this.y].join(''); };

pkg.Rectangle = function(x, y, w, h) {
    if (arguments.length === 0)  this.x = this.y = this.width = this.height = 0;
    else {
	    this.x     = x;
	    this.y     = y;
	    this.width = w;
	    this.height= h;
	}
};

pkg.Rectangle.prototype.equals = function(obj) {
    return obj === this ||
           (obj !== null && this.x == obj.x && this.y == obj.y &&
            this.width == obj.width && this.height == obj.height);
};

pkg.Rectangle.prototype.toString = function(){
    return ["x=", this.x, ",y=", this.y, ",w=", this.width, ",h=", this.height].join('');
};

pkg.Rectangle.prototype.contains = function(x, y) {
    return this.x <= x && (this.x + this.width) > x && this.y <= y && (this.y + this.height) > y;
};

pkg.Rectangle.prototype.intersects = function(x, y, w, h) {
    var xx = Math.max(this.x, x), yy = Math.max(this.y, y);
    w  = Math.min(this.x + this.width,  x + w) - xx,
    h  = Math.min(this.y + this.height, y + h) - yy;
    return w > 0 && h > 0;
};

pkg.Rectangle.prototype.intersection = function(x, y, w, h) {
    var xx = Math.max(this.x, x), yy = Math.max(this.y, y);
    this.width  = Math.min(this.x + this.width,  x + w) - xx;
    this.height = Math.min(this.y + this.height, y + h) - yy;
    this.x = xx;
    this.y = yy;
};

function hex(v) { return (v < 16) ? ["0", v.toString(16)].join('') :  v.toString(16); }

pkg.rgb = function (r, g, b, a) {
    if (arguments.length == 1) {
        if (zebra.isString(r)) {
            this.s = r;
            if (r[0] === '#') {
                r = parseInt(r.substring(1), 16);
            }
            else
            if (r[0] === 'r' && r[1] === 'g' && r[2] === 'b') {
                var i = r.indexOf('(', 3), p = r.substring(i + 1, r.indexOf(')', i + 1)).split(","); //split(r.substring(i + 1), , ',');
                this.r = parseInt(p[0].trim(), 10);
                this.g = parseInt(p[1].trim(), 10);
                this.b = parseInt(p[2].trim(), 10);
                if (p.length > 3) this.a = parseInt(p[2].trim(), 10);
                return;
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

    if (typeof this.s === "undefined") {
        this.s = (typeof this.a !== "undefined") ? ['rgba(', this.r, ",", this.g, ",", this.b, ",", this.a, ")"].join('')
                                                 : ['#', hex(this.r), hex(this.g), hex(this.b)].join('');
    }
};

var rgb = pkg.rgb, Point = pkg.Point;
rgb.prototype.toString = function() { return this.s; };
rgb.prototype.equals   = function(c){ return c && (c === this || (this.r == c.r && this.b == c.b && this.g == c.g && this.a == c.a)); };

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

pkg.index2point = function(offset,cols){ return new Point(~~(offset / cols), (offset % cols)); };
pkg.indexByPoint = function(row,col,cols){ return (cols <= 0) ?  -1 : (row * cols) + col; };

pkg.intersection = function(x1,y1,w1,h1,x2,y2,w2,h2,r){
    r.x = Math.max(x1, x2);
    r.width = Math.min(x1 + w1, x2 + w2) - r.x;
    r.y = Math.max(y1, y2);
    r.height = Math.min(y1 + h1, y2 + h2) - r.y;
};

pkg.unite = function(x1,y1,w1,h1,x2,y2,w2,h2,r){
    r.x = Math.min(x1, x2);
    r.y = Math.min(y1, y2);
    r.width = Math.max(x1 + w1, x2 + w2) - r.x;
    r.height = Math.max(y1 + h1, y2 + h2) - r.y;
};

pkg.array_rm = function(a, e) {
    var i = a.indexOf(e);
    if (i >= 0) a.splice(i, 1);
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

pkg.Listeners = function(n) { this.n = n ? n : 'fired'; };
var L = pkg.Listeners;

L.prototype.add = function(l) {
    if (!this.v) this.v = [];
    this.v.push(l);
};

L.prototype.remove = function(l) {
    this.v || pkg.array_rm(this.v, l);
};

L.prototype.fire = function() {
    if(this.v) {
        var n = this.n;
        for(var i = 0;i < this.v.length; i++) {
            var v = this.v[i];
            if (typeof v === 'function') v.apply(this, arguments);
            else {
                v[n].apply(v, arguments);
            }
        }
    }
};

L.prototype.fireTo = function(n, args) {
    if(this.v) {
        var o = this.n;
        this.n = n;
        try { this.fire.apply(this, args); }
        catch(e) { throw e; }
        finally { this.n = o; }
    }
};

L.prototype.removeAll = function(){ if (this.v) this.v.length = 0; };

var Position = pkg.Position = Class([
    function $clazz() {
        this.PositionMetric = Interface();
        this.DOWN = 1;
        this.UP   = 2;
        this.BEG  = 3;
        this.END  = 4;
    },

    function (pi){
        this._ = new L("posChanged");
        this.isValid = false;
        this.metrics = null;
        this.currentLine = this.currentCol = this.offset = 0;
        this.setPositionMetric(pi);
    },

    function invalidate(){ this.isValid = false; },

    function setPositionMetric(p){
        if(p == null) throw new Error();
        if(p != this.metrics){
            this.metrics = p;
            this.clearPos();
        }
    },

    function clearPos(){
        if(this.offset >= 0){
            var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol;
            this.offset  = this.currentLine = this.currentCol - 1;
            this._.fire(this, prevOffset, prevLine, prevCol);
        }
    },

    function setOffset(o){
        if(o < 0) o = 0;
        else {
            var max = this.metrics.getMaxOffset();
            if(o >= max) o = max;
        }
        if(o != this.offset){
            var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol,  p = this.getPointByOffset(o);
            this.offset = o;
            if(p != null){
                this.currentLine = p.x;
                this.currentCol = p.y;
            }
            this.isValid = true;
            this._.fire(this, prevOffset, prevLine, prevCol);
        }
    },

    function seek(off){ this.setOffset(this.offset + off); },

    function setRowCol(r,c){
        if(r != this.currentLine || c != this.currentCol){
            var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol;
            this.offset = this.getOffsetByPoint(r, c);
            this.currentLine = r;
            this.currentCol = c;
            this._.fire(this, prevOffset, prevLine, prevCol);
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
                }
                break;
            case Position.END:
                var maxCol = this.metrics.getLineSize(this.currentLine);
                if(this.currentCol < (maxCol - 1)){
                    this.offset += (maxCol - this.currentCol - 1);
                    this.currentCol = maxCol - 1;
                    this._.fire(this, prevOffset, prevLine, prevCol);
                }
                break;
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
                }
                break;
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
                }
                break;
            default: throw new Error();
        }
    },

    function inserted(off,size){
        if(this.offset >= 0 && off <= this.offset){
            this.invalidate();
            this.setOffset(this.offset + size);
        }
    },

    function removed(off,size){
        if(this.offset >= 0 && this.offset >= off){
            this.invalidate();
            if(this.offset >= (off + size)) this.setOffset(this.offset - size);
            else this.setOffset(off);
        }
    },

    function getPointByOffset(off){
        if(off == -1) return new Point(-1, -1);
        var m = this.metrics, max = m.getMaxOffset();
        if(off > max) throw new Error("" + off);
        if(max === 0) return new Point((m.getLines() > 0 ? 0 : -1));
        if(off === 0) return new Point(0,0);
        var d = 0, sl = 0, so = 0;
        if(this.isValid && this.offset !=  -1){
            sl = this.currentLine;
            so = this.offset - this.currentCol;
            if(off > this.offset) d = 1;
            else
                if(off < this.offset) d =  -1;
                else return new Point(sl, this.currentCol);
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
            if(off >= so && off < so + ls) return new Point(sl, off - so);
            so += d > 0 ? ls : -m.getLineSize(sl - 1);
        }
        return new Point(-1, -1);
    },

    function getOffsetByPoint(row,col){
        var startOffset = 0, startLine = 0, m = this.metrics;

        if(row >= m.getLines() || col >= m.getLineSize(row)) throw new Error();
        if(this.isValid && this.offset !=  -1) {
            startOffset = this.offset - this.currentCol;
            startLine = this.currentLine;
        }
        if (startLine <= row) for(var i = startLine;i < row; i++) startOffset += m.getLineSize(i);
        else for(var i = startLine - 1;i >= row; i--) startOffset -= m.getLineSize(i);
        return startOffset + col;
    },

    function calcMaxOffset(){
        var max = 0, m = this.metrics;
        for(var i = 0;i < m.getLines(); i ++ ) max += m.getLineSize(i);
        return max - 1;
    }
]);

pkg.Properties = Class([
	function() { this.values = {}; },

    function get(name) { return this.values.hasOwnProperty(name) ? this.values[name] : null;  },

    function put(name, value) {
        var prev = this.get(name);
        this.values[name] = value;
        return prev;
    },

	function load(txt) {
        var lines = txt.split("\n");
        for(var i=0; i<lines.length; i++)
        {
              var key = lines[i].trim();
              if (key.length > 0 && key[0] != '#')
              {
                  var comment = key.indexOf('#');
                  if (comment > 0) key = key.substring(0, comment).trim();
                  var index = key.indexOf('=');
                  if (index <= 0) throw new Error(key + " property is invalid");
                  this.put(key.substring(0, index).trim(), key.substring(index + 1).trim());
              }
        }
	}
]);

pkg.Bag = Class(function($) {
    var Bag = this;
    function ObjDesc(obj, desc) {
        this.obj  = obj;
        this.desc = desc;
        this.pos  = null;
    }

    Bag.OBJ_ADDED = 1;
    Bag.OBJ_REMOVED = 2;
    Bag.BAG_DESTROYED = 3;

    $(function () {
        this.aliases = {};
        this.objects = {};
        this._       = new L();

        this.aliases["rgb"] = pkg.rgb;
        this.aliases["Dimension"] = pkg.Dimension;
        this.put("true", true);
        this.put("false", false);
    });

    $(function contains(key){ return this.objects.hasOwnProperty(key); });

    $(function put(key,obj){
        var prev = this.objects.hasOwnProperty(key) ? this.objects[key] : null;
        if (obj == null) delete this.objects[key];
        this.objects[key] = new ObjDesc(obj, null);
        if(prev != null && prev.obj != null) this._.fire(key, Bag.OBJ_REMOVED, prev.obj);
        if(obj != null) this._.fire(key, Bag.OBJ_ADDED, obj);
        return (prev == null) ? null : prev.obj;
    });

    $(function get(key){
        if (this.objects.hasOwnProperty(key)) {
            var o = this.objects[key];
            if (o != null) return (o.desc == null) ? o.obj : this.createObject(o.desc, 0).obj;
        }
        return null;
    });

    $(function load(txt){
        var lines = txt.split("\n");
        for(var jj=0; jj<lines.length; jj++)
        {
            var key = lines[jj].trim();
            if(key.length > 0 && key[0] != '#'){
                var index = key.indexOf('=');
                if (index <= 0) throw new Error("Wrong property format : " + key);
                var desc = key.substring(index + 1).trim();
                key = key.substring(0, index);
                if (key[0] == '@') {
                    var i = key.lastIndexOf('.');
                    if (i < 0) throw new Error("Unknown property name in '" + key + "' key");
                    this.get(key.substring(1,i))[key.substring(i+1)] = this.createObject(desc, 0).obj;
                }
                else {
                    this.objects[key] = (desc[0] != '*') ? this.createObject(desc, 0) : new ObjDesc(null, desc.substring(1));
                    this._.fire(key, Bag.OBJ_ADDED, this.objects[key].obj);
                }
            }
        }
        return true;
    });

    $(function createObject(s, pos){
        pos = skipDummy(s, pos);
        var desc = new ObjDesc(), ch = s[pos];
        switch(ch)
        {
            case '@': {
                desc.pos = seekStop(s, pos);
                var key = s.substring(pos + 1, desc.pos).trim();
                if (this.contains(key)) desc.obj = this.get(key);
                else throw new Error("Cannot find referenced by '" + key + "' object");
            } break;
            case '#': {
                desc.pos = seekStop(s, pos);
                desc.obj = new pkg.rgb(s.substring(pos, desc.pos).trim());
            } break;
            case '\"': {
                var i = s.indexOf('\"', pos + 1);
                desc.obj = s.substring(pos + 1, i);
                desc.pos = seekStop(s, i + 1);
            } break;
            case 'f': {
                desc.pos = seekStop(s, pos);
                if (pkg.isDigit(s[pos+1])) desc.obj = Number(s.substring(pos+1, desc.pos));
                throw new Error("Wrong float number format:" + s);
            } break;
            default: {
                if(pkg.isDigit(ch)){
                    desc.pos = seekStop(s, pos);
                    desc.obj = parseInt(s.substring(pos, desc.pos));
                    return desc;
                }

                var i = s.indexOf('(', pos), cn = s.substring(pos, i).trim(), args = [];
                if (i < 0) {
                    desc.pos = seekStop(s, pos);
                    desc.obj = this.resolveUnknownIdentifier(s.substring(pos, desc.pos));
                    return desc;
                }

                pos = skipDummy(s, i + 1);

                if (s[pos] != ')') {
                    for(;;) {
                        var o = this.createObject(s, pos);
                        args.push(o.obj);
                        pos = o.pos + 1;
                        if (s[o.pos] != ',') break;
                    }
                }
                desc.obj = this.constructObject(cn, args);
                desc.pos = pos;
                return desc;
            }
        }
        return desc;
    });

    $(function destroy(){
        for(var k in this.objects)  {
            if (this.objects.hasOwnProperty(k)) {
                var o = this.objects[k];
                if(o.desc == null && o.obj.destroy) o.obj.destroy();
            }
        }
        this._.removeAll();
    });

    $(function resolveClass(clazz) { return this.aliases.hasOwnProperty(clazz) ? this.aliases[clazz] : Class.forName(clazz); });

    $(function constructObject(clazzName, v){
        if (clazzName == '') return v;
        if (this[clazzName]) return this[clazzName].apply(this, v);
        var clazz = this.resolveClass(clazzName);
        if (v.length == 0) return new clazz();
        var f = function() {}
        f.prototype = clazz.prototype;
        var o = new f();
        o.constructor = clazz;
        clazz.apply(o, v);
        return o;
    });

    $(function resolveUnknownIdentifier(name) {
        throw new Error("Cannot resolve key = '" + name + "'");
    });

    function skipDummy(s, pos){
        while(pos < s.length && s[pos] == ' ' || s[pos] == '\t' || s[pos] == '\n') pos ++;
        return pos > s.length ? s.length : pos;
    }

    function seekStop(s, pos){
        while(pos < s.length && s[pos] != ',' && s[pos] != ')') pos++;
        return pos > s.length ? s.length : pos;
    }
});

pkg.sleep = function() {
    var r = new XMLHttpRequest(), t = (new Date()).getTime().toString(), i = window.location.toString().lastIndexOf("?");
    r.open('GET', window.location + (i > 0 ? "&" : "?") + t, false);
    r.send(null);
};

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

// !!!
// b64 is supposed to be used with binary stuff, applying it to utf-8 encoded data can bring to error
// !!!
var b64str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

pkg.b64encode = function(input) {
    var out = [], i = 0, len = input.length, c1, c2, c3;
    if (typeof ArrayBuffer !== "undefined") {
        if (input instanceof ArrayBuffer) input = new Uint8Array(input);
        input.charCodeAt = function(i) { return this[i]; };
    }
    if (Array.isArray(input)) input.charCodeAt = function(i) { return this[i]; };

    while(i < len) {
        c1 = input.charCodeAt(i++) & 0xff;
        out.push(b64str.charAt(c1 >> 2));
        if (i == len) {
            out.push(b64str.charAt((c1 & 0x3) << 4), "==");
            break;
        }
        c2 = input.charCodeAt(i++);
        out.push(b64str.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)));
        if (i == len) {
            out.push(b64str.charAt((c2 & 0xF) << 2), "=");
            break;
        }
        c3 = input.charCodeAt(i++);
        out.push(b64str.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6)), b64str.charAt(c3 & 0x3F));
    }
    return out.join('');
};

pkg.b64decode = function(input) {
    var output = [], chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while ((input.length % 4) !== 0) input += "=";

    for(var i=0; i < input.length;) {
        enc1 = b64str.indexOf(input.charAt(i++));
        enc2 = b64str.indexOf(input.charAt(i++));
        enc3 = b64str.indexOf(input.charAt(i++));
        enc4 = b64str.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output.push(String.fromCharCode(chr1));
        if (enc3 != 64) output.push(String.fromCharCode(chr2));
        if (enc4 != 64) output.push(String.fromCharCode(chr3));
    }
    return output.join('');
};

pkg.dateToISO8601 = function(d) {
    function pad(n) { return n < 10 ? '0'+n : n; }
    return [ d.getUTCFullYear(), '-', pad(d.getUTCMonth()+1), '-', pad(d.getUTCDate()), 'T', pad(d.getUTCHours()), ':',
             pad(d.getUTCMinutes()), ':', pad(d.getUTCSeconds()), 'Z'].join('');
};

// http://webcloud.se/log/JavaScript-and-ISO-8601/
pkg.ISO8601toDate = function(v) {
    var regexp = ["([0-9]{4})(-([0-9]{2})(-([0-9]{2})", "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?",
                  "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?"].join(''), d = v.match(new RegExp(regexp)),
                  offset = 0, date = new Date(d[1], 0, 1);

    if (d[3])  date.setMonth(d[3] - 1);
    if (d[5])  date.setDate(d[5]);
    if (d[7])  date.setHours(d[7]);
    if (d[8])  date.setMinutes(d[8]);
    if (d[10]) date.setSeconds(d[10]);
    if (d[12]) date.setMilliseconds(Number("0." + d[12]) * 1000);
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    date.setTime(Number(date) + (offset * 60 * 1000));
    return date;
};

pkg.parseXML = function(s) {
    function rmws(node) {
        if (node.childNodes !== null) {
            for (var i = node.childNodes.length; i-->0;) {
                var child= node.childNodes[i];
                if (child.nodeType === 3 && child.data.match(/^\s*$/)) node.removeChild(child);
                if (child.nodeType === 1) rmws(child);
            }
        }
        return node;
    }

    if (typeof DOMParser !== "undefined") return rmws((new DOMParser()).parseFromString(s, "text/xml"));
    else {
        for (var n in { "Microsoft.XMLDOM":0, "MSXML2.DOMDocument":1, "MSXML.DOMDocument":2 }) {
            var p = null;
            try {
                p = new ActiveXObject(n);
                p.async = false;
            }  catch (e) { continue; }
            if (p === null) throw new Error("XML parser is not available");
            p.loadXML(s);
            return p;
        }
    }
    throw new Error("No XML parser is available");
};


})(zebra("util"), zebra.Class, zebra.Interface);
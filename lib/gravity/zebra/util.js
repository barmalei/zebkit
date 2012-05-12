(function(pkg, Class, Interface) {

pkg.Dimension = function(w, h) {
     this.width  = w;
     this.height = h;
}
pkg.Dimension.prototype.equals = function(obj) { return obj === this || (obj != null && this.width == obj.width && this.height == obj.height); }
pkg.Dimension.prototype.toString = function() { return ["width=", this.width, ", height=", this.height].join(''); }

pkg.Point = function(x, y) {
    this.x = x;
    this.y = y; 
}
pkg.Point.prototype.equals = function(obj) { return obj != null && this.x == obj.x && this.y == obj.y; } 
pkg.Point.prototype.toString = function() { return ["x=", this.x, ", y=", this.y].join(''); }

pkg.Rectangle = function(x, y, w, h) {
    if (arguments.length == 0)  this.x = this.y = this.width = this.height = 0;
    else {
	    this.x     = x;
	    this.y     = y;
	    this.width = w;
	    this.height= h;
	}
}
pkg.Rectangle.prototype.equals = function(obj) { return obj === this || (obj != null && this.x == obj.x && this.y == obj.y && this.width == obj.width && this.height == obj.height); }
pkg.Rectangle.prototype.toString = function(){ return ["x=", this.x, ",y=", this.y, ",w=", this.width, ",h=", this.height].join(''); }
pkg.Rectangle.prototype.contains = function(x, y) { return this.x <= x && (this.x + this.width) > x && this.y <= y && (this.y + this.height) > y; }

pkg.Rectangle.prototype.intersects = function(x, y, w, h) { 
    var xx = Math.max(this.x, x), yy = Math.max(this.y, y);
    var w  = Math.min(this.x + this.width,  x + w) - xx;
    var h  = Math.min(this.y + this.height, y + h) - yy;
    return w > 0 && h > 0;
}

pkg.Rectangle.prototype.intersection = function(x, y, w, h) {
    var xx = Math.max(this.x, x), yy = Math.max(this.y, y);
    this.width  = Math.min(this.x + this.width,  x + w) - xx;
    this.height = Math.min(this.y + this.height, y + h) - yy;
    this.x = xx;
    this.y = yy;
}

pkg.rgb = function (r, g, b) {
    if (arguments.length == 1) {
        if (zebra.isString(r)) r = (r[0] == '#') ? parseInt(r.substring(1), 16) : parseInt(r);
        this.r = r >> 16;
        this.g = (r >> 8) & 0xFF;
        this.b = (r & 0xFF);
    }
    else {
	    this.r = r;
	    this.g = g;
	    this.b = b;
	}

    this.a = arguments.length > 3 ? arguments[3] : -1;
    this.s = rgb.encode(this);
}

var rgb = pkg.rgb, Point = pkg.Point;
rgb.prototype.toString = function() { return this.s; }
rgb.prototype.equals   = function(c){ return c && (c === this || (this.r == c.r && this.b == c.b && this.g == c.g && this.a == c.a)); }

rgb.encode = function(c) {
    function hex(v) { return (v < 16) ? "0" + v.toString(16) :  v.toString(16); }
    return (c.a > 0) ? ['rgba(', c.r, ",", c.g, ",", c.b, ",", c.a, ")"].join('')
                     : ['#', hex(c.r), hex(c.g), hex(c.b)].join('');
}

rgb.decode = function(s) {
    if (s[0] === '#') return new rgb(parseInt(s.substring(1), 16));
    if (s[0] === 'r' && s[1] === 'g' && s[2] === 'b') {
        var i = s.indexOf('(', 3), p = s.split(s.substring(i + 1), s.indexOf(')', i + 1), ',');
        return new rgb(parseInt(p[0].trim()), parseInt(p[1].trim()), parseInt(p[2].trim()));
    }
    if (s in rgb) return rgb[s];
    throw new Error(s);
}

rgb.black     = new rgb(0,0,0);
rgb.white     = new rgb(255,255,255);
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

pkg.index2point = function(offset,cols){ return new Point(Math.floor(offset / cols), (offset % cols)); }
pkg.indexByPoint = function(row,col,cols){ return (cols <= 0) ?  -1 : (row * cols) + col; }

pkg.intersection = function(x1,y1,w1,h1,x2,y2,w2,h2,r){
    r.x = Math.max(x1, x2);
    r.width = Math.min(x1 + w1, x2 + w2) - r.x;
    r.y = Math.max(y1, y2);
    r.height = Math.min(y1 + h1, y2 + h2) - r.y;
}

pkg.unite = function(x1,y1,w1,h1,x2,y2,w2,h2,r){
    r.x = Math.min(x1, x2);
    r.y = Math.min(y1, y2);
    r.width = Math.max(x1 + w1, x2 + w2) - r.x;
    r.height = Math.max(y1 + h1, y2 + h2) - r.y;
}

pkg.array_rm = function(a, e) {
    var i = a.indexOf(e);
    if (i >= 0) a.splice(i, 1);
}

pkg.arraycopy = function(src, spos, dest, dpos, dlen) {
    for(var i=0; i<dlen; i++) dest[i + dpos] = src[spos + i];
}

pkg.currentTimeMillis = function() { return (new Date()).getTime(); }

pkg.str2bytes = function(s) {
    var ar = [];
    for (var i = 0; i < s.length; i++) {
        var code = s.charCodeAt(i);  
        ar.push((code >> 8) & 0xFF);
        ar.push(code & 0xFF);
    }
    return ar;
}

var digitRE = /[0-9]/
pkg.isDigit = function(ch) {
    if (ch.length != 1) throw new Error("Incorrect character");
	return digitRE.test(ch);
}

var letterRE = /[A-Za-z]/;
pkg.isLetter = function (ch) {
    if (ch.length != 1) throw new Error("Incorrect character");
	return letterRE.test(ch);
}

pkg.Listeners = function(n) { this.n = n ? n : 'fired'; }
var L = pkg.Listeners;

L.prototype.add = function(l) {
    if (!this.v) this.v = [];
    this.v.push(l);
}

L.prototype.remove = function(l) {
    this.v || pkg.array_rm(this.v, l);
}

L.prototype.fire = function() {
    if(this.v) {
        var n = this.n;
        for(var i = 0;i < this.v.length; i++) {
            var v = this.v[i];  
            if (typeof v == 'function') v.apply(this, arguments);
            else v[n].apply(v, arguments);
        }
    }
}

L.prototype.removeAll = function(){ if (this.v) this.v.length = 0; }

pkg.Position = Class(function($) {
    var Position = this;

    this.PositionMetric = new zebra.Interface();
    this.DOWN = 1;
    this.UP   = 2;
    this.BEG  = 3;
    this.END  = 4;
    
    $(function (pi){ 
        this._ = new L("posChanged");
        this.isValid = false;
        this.metrics = null;
        this.currentLine = this.currentCol = this.offset = 0;
        this.setPositionMetric(pi); 
    });
    
    $(function invalidate(){ this.isValid = false; });

    $(function setPositionMetric(p){
        if(p == null) throw new Error("" + p);
        if(p != this.metrics){
            this.metrics = p;
            this.clearPos();
        }
    });

    $(function clearPos(){
        if(this.offset >= 0){
            var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol;
            this.offset  = this.currentLine = this.currentCol - 1;
            this._.fire(this, prevOffset, prevLine, prevCol);
        }
    });

    $(function setOffset(o){
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
    });

    $(function seek(off){ this.setOffset(this.offset + off); });

    $(function setRowCol(r,c){
        if(r != this.currentLine || c != this.currentCol){
            var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol;
            this.offset = this.getOffsetByPoint(r, c);
            this.currentLine = r;
            this.currentCol = c;
            this._.fire(this, prevOffset, prevLine, prevCol);
        }
    });

    $(function seekLineTo(t){ this.seekLineTo(t, 1); });

    $(function seekLineTo(t,num){
        if(this.offset < 0){
            this.setOffset(0);
            return;
        }
        var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol;
        switch(t)
        {
            case Position.BEG:{
                if(this.currentCol > 0){
                    this.offset -= this.currentCol;
                    this.currentCol = 0;
                    this._.fire(this, prevOffset, prevLine, prevCol);
                }
            }break;
            case Position.END:{
                var maxCol = this.metrics.getLineSize(this.currentLine);
                if(this.currentCol < (maxCol - 1)){
                    this.offset += (maxCol - this.currentCol - 1);
                    this.currentCol = maxCol - 1;
                    this._.fire(this, prevOffset, prevLine, prevCol);
                }
            }break;
            case Position.UP:{
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
            }break;
            case Position.DOWN:{
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
            }break;
            default: throw new Error();
        }
    });

    $(function inserted(off,size){
        if(this.offset >= 0 && off <= this.offset){
            this.invalidate();
            this.setOffset(this.offset + size);
        }
    });

    $(function removed(off,size){
        if(this.offset >= 0 && this.offset >= off){
            this.invalidate();
            if(this.offset >= (off + size)) this.setOffset(this.offset - size);
            else this.setOffset(off);
        }
    });

    $(function getPointByOffset(off){
        if(off == -1) return new Point(-1, -1);
        var m = this.metrics, max = m.getMaxOffset();
        if(off > max) throw new Error("" + off);
        if(max == 0) return new Point((m.getLines() > 0 ? 0 : -1));
        if(off == 0) return new Point(0,0);
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
            d = (Math.floor(max / off) == 0) ?  -1 : 1;
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
    });

    $(function getOffsetByPoint(row,col){
        var startOffset = 0, startLine = 0, m = this.metrics;

        if(row >= m.getLines() || col >= m.getLineSize(row)) throw new Error();
        if(this.isValid && this.offset !=  -1) {
            startOffset = this.offset - this.currentCol;
            startLine = this.currentLine;
        }
        if (startLine <= row) for(var i = startLine;i < row; i++) startOffset += m.getLineSize(i);
        else for(var i = startLine - 1;i >= row; i--) startOffset -= m.getLineSize(i);
        return startOffset + col;
    });

    $(function calcMaxOffset(){
        var max = 0, m = this.metrics;
        for(var i = 0;i < m.getLines(); i ++ ) max += m.getLineSize(i);
        return max - 1;
    });
});

pkg.Properties = Class([
	function() { this.values = {}; },
	
    function get(name) { return this.values.hasOwnProperty(name) ? this.values[name] : null;  },
    
    function put(name, value) { 
        var prev = this.get(name);
        this.values[name] = value;
        return prev; 
    },

	function load(is) {
	    var key = null, reader = (zebra.isString(is)) ? new zebra.io.StringReader(is) : 
	                                                    new zebra.io.InputStreamLineReader(is, "ascii")
	    while ((key = reader.readLine()) != null)
	    {
	          key = key.trim();
	          if (key.length > 0 && key[0] != '#')
	          {
	              var comment = key.indexOf('#');
	              if (comment > 0) key = key.substring(0, comment).trim();
	              var index = key.indexOf('=');
	              if (index <= 0) throw new Error(key + " is invalid property format");
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

    $(function() { this.$this(null);  });
    
    $(function (is) {
        this.aliases = {};
        this.objects = {};
        this._       = new L();
        
        this.aliases["rgb"] = pkg.rgb;
        this.aliases["Dimension"] = pkg.Dimension;
        if (is != null) this.load(is);
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

    $(function load(fi){
        var buf = zebra.isString(fi)? new zebra.io.StringReader(fi) : new zebra.io.InputStreamLineReader(fi);
        var key = null;
       try{
            while((key = buf.readLine()) != null){
                key = key.trim();
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
        }
        finally { if (buf != null) try { buf.close(); } catch(e) {} }
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
            case 't':
            case 'f': {
                desc.pos = seekStop(s, pos);
                if (pkg.isDigit(s[pos+1])) desc.obj = Number(s.substring(pos+1, desc.pos));
                else desc.obj = (ch == 't');
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

    $(function constructObject(clazz, v){
        if (clazz == '') return v;
        clazz = this.resolveClass(clazz);
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

pkg.Interrupt = function(m) { Error.call(this, m); }
pkg.Interrupt.prototype = new Error();

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
	}

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
                                    if (e instanceof pkg.Interrupt) {
                                        c.run = null;
                                        $this.aconsumers--;
                                        if ($this.aconsumers == 0) break;
                                        continue;
                                    }
                                    zebra.out.print(e); 
                                }
                                c.siw += c.ri;
                            }
                            else c.si -= quantum;
                        }
                    }
                    if ($this.aconsumers == 0) window.clearInterval(ii);
    		    }, quantum);	
		    }
    	 }
         else {
             ci.si = startIn;
             ci.ri = repeatIn;
         }
    }

    this.remove = function(l) {
        this.get(l).run = null;
        this.aconsumers--;
    }

    this.clear = function(l){
        var c = this.get(l);
        c.si = c.ri;
    }
})();

zebra.setupNames(pkg);

})(zebra("util"), zebra.Class, zebra.Interface);
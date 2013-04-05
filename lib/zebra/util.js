(function(pkg, Class, Interface) {

pkg.newInstance = function(clazz, args) {
    if (args && args.length > 0) {
        var f = function() {};
        f.prototype = clazz.prototype;
        var o = new f();
        o.constructor = clazz;
        clazz.apply(o, args);
        return o;
    }
    return new clazz();
};

function hex(v) { return (v < 16) ? ["0", v.toString(16)].join('') :  v.toString(16); }

pkg.findInTree = function(root, path, eq, cb) {
    var findRE = /(\/\/|\/)?(\*|[a-zA-Z_][a-zA-Z0-9_\.]*)(\[\s*(\@[a-zA-Z_][a-zA-Z0-9_\.]*)\s*\=\s*([0-9]+|true|false|\'[^']*\')\s*\])?/g,
        m = null, res = [];

    if (typeof eq !== "function") {
        eq = function(kid, name) { return kid.value == name; };
    }

    function _find(root, ms, idx, cb) {
        function list_child(r, name, deep, cb) {
            for (var i=0; i < r.kids.length; i++) {
                var kid = r.kids[i];
                if (name == '*' || eq(kid, name)) {
                    if (cb(kid)) return true;
                }

                if (deep && list_child(kid, name, deep, cb)) {
                    return true;
                }
            }
            return false;
        }

        if (ms == null || idx >= ms.length) return cb(root);

        var m = ms[idx];
        return list_child(root, m[2], m[1] == "//", function(child) {
            if (m[3] && child[m[4].substring(1)] != m[5]) return false;
            return _find(child, ms, idx + 1, cb);
        });
    }

    while(m = findRE.exec(path)) {
        if (m[2] == null || m[2].trim().length == 0) throw new Error("Empty path name element");
        if (m[3] && m[5][0] == "'") m[5] = m[5].substring(1, m[5].length - 1);
        res.push(m);
    }
    _find(root, res, 0, cb);
};

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

// rgb.prototype.equals = function(c){
//     return c != null && (c === this || (this.r == c.r && this.b == c.b && this.g == c.g && this.a == c.a));
// };

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

var $NewListener = function() {
    if (arguments.length == 0) arguments = [ "fired" ];
    
    var clazz = function() {};

    if (arguments.length == 1) {
        var name = arguments[0]; 

        clazz.prototype.add = function(l) {
            if (this.v == null) this.v = [];
            var ctx = this;
            if (typeof l !== 'function') {
                ctx = l;
                l   = l[name]; 
                if (l == null || typeof l !== "function") {
                    throw new Error("Instance doesn't declare '" + names + "' listener method");
                }
            }
            this.v.push(ctx, l);
            return l;
        };

        clazz.prototype.remove = function(l) {
            if (this.v != null) {
                var i = 0;
                while((i = this.v.indexOf(l)) >= 0) {
                    if (i%2 > 0) i--;
                    this.v.splice(i, 2);
                }
            }
        };

        clazz.prototype.removeAll = function() { if (this.v != null) this.v.length = 0; };

        clazz.prototype[name] = function() {
            if (this.v != null) {
                for(var i = 0;i < this.v.length; i+=2) {
                    this.v[i + 1].apply(this.v[i], arguments);
                }
            }
        };
    }
    else {
        var names = {};
        for(var i=0; i< arguments.length; i++) {
            names[arguments[i]] = true;
        }

        clazz.prototype.add = function(l) {
            if (this.methods == null) this.methods = {};
            
            if (typeof l === 'function') {
                var n = zebra.$FN(l);
                if (names[n] == null) {
                    throw new Error("Unknown listener " + n);
                }

                if (!this.methods[n]) this.methods[n] = [];
                this.methods[n].push(this, l);
            }
            else {
                var b = false;
                for(var k in names) {
                    if (typeof l[k] === "function") {
                        b = true;
                        if (this.methods[k] == null) this.methods[k] = [];
                        this.methods[k].push(l, l[k]);
                    }
                }
                if (b === false) throw new Error("No listener methods have been found");
            }
            return l;
        };

        for(var i=0; i<arguments.length; i++) {
            var m = arguments[i];
            (function(m) {
                clazz.prototype[m] = function() {
                    if (this.methods != null) {
                        var c = this.methods[m];
                        if (c != null) {
                            for(var i=0; i < c.length; i+=2) c[i+1].apply(c[i], arguments);
                        }
                    }
                };
            })(m);
        }

        clazz.prototype.remove = function(l) {
            if (this.methods != null) {
                for(var k in this.methods) {
                    var v = this.methods[k], i = 0;
                    while((i = v.indexOf(l)) >= 0) {
                        if (i%2 > 0) i--;
                        v.splice(i, 2);
                    }
                    if (v.length === 0) delete this.methods[k];
                }
            }
        };

        clazz.prototype.removeAll = function() {
            if (this.methods != null) {
                for(var k in this.methods) {
                    if (this.methods.hasOwnProperty(k)) this.methods[k].length = 0;
                }
                this.methods = {};
            }
        };
    }
    return clazz;    
} 

pkg.Listeners = $NewListener(); 
pkg.Listeners.Class = $NewListener;

var PosListeners = pkg.Listeners.Class("posChanged"), Position = pkg.Position = Class([
    function $clazz() {
        this.PositionMetric = Interface();
        this.DOWN = 1;
        this.UP   = 2;
        this.BEG  = 3;
        this.END  = 4;
    },

    function $prototype() {
        this.clearPos = function (){
            if(this.offset >= 0){
                var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol;
                this.offset  = this.currentLine = this.currentCol - 1;
                this._.posChanged(this, prevOffset, prevLine, prevCol);
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
                this._.posChanged(this, prevOffset, prevLine, prevCol);
            }
        };

        this.seek = function(off){ this.setOffset(this.offset + off); };

        this.setRowCol = function (r,c){
            if(r != this.currentLine || c != this.currentCol){
                var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol;
                this.offset = this.getOffsetByPoint(r, c);
                this.currentLine = r;
                this.currentCol = c;
                this._.posChanged(this, prevOffset, prevLine, prevCol);
            }
        };

        this.inserted = function (off,size){
            if(this.offset >= 0 && off <= this.offset){
                this.isValid = false;
                this.setOffset(this.offset + size);
            }
        };

        this.removed = function (off,size){
            if(this.offset >= 0 && this.offset >= off){
                this.isValid = false;
                if(this.offset >= (off + size)) this.setOffset(this.offset - size);
                else this.setOffset(off);
            }
        };

        this.getPointByOffset = function(off){
            if (off == -1) return [-1, -1];
            var m = this.metrics, max = m.getMaxOffset();
            if (off > max) throw new Error("Out of bounds:" + off);
            if (max === 0) return [(m.getLines() > 0 ? 0 : -1), 0];
            if (off === 0) return [0, 0];
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

            if (row >= m.getLines() || col >= m.getLineSize(row)) throw new Error();
            if (this.isValid && this.offset !=  -1) {
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

        this.seekLineTo = function(t,num){
            if(this.offset < 0){
                this.setOffset(0);
                return;
            }
            
            if (arguments.length == 1) num = 1;

            var prevOffset = this.offset, prevLine = this.currentLine, prevCol = this.currentCol;
            switch(t)
            {
                case Position.BEG:
                    if(this.currentCol > 0){
                        this.offset -= this.currentCol;
                        this.currentCol = 0;
                        this._.posChanged(this, prevOffset, prevLine, prevCol);
                    } break;
                case Position.END:
                    var maxCol = this.metrics.getLineSize(this.currentLine);
                    if (this.currentCol < (maxCol - 1)){
                        this.offset += (maxCol - this.currentCol - 1);
                        this.currentCol = maxCol - 1;
                        this._.posChanged(this, prevOffset, prevLine, prevCol);
                    } break;
                case Position.UP:
                    if (this.currentLine > 0){
                        this.offset -= (this.currentCol + 1);
                        this.currentLine--;
                        for(var i = 0;this.currentLine > 0 && i < (num - 1); i++ , this.currentLine--){
                            this.offset -= this.metrics.getLineSize(this.currentLine);
                        }
                        var maxCol = this.metrics.getLineSize(this.currentLine);
                        if (this.currentCol < maxCol) this.offset -= (maxCol - this.currentCol - 1);
                        else this.currentCol = maxCol - 1;
                        this._.posChanged(this, prevOffset, prevLine, prevCol);
                    } break;
                case Position.DOWN:
                    if (this.currentLine < (this.metrics.getLines() - 1)){
                        this.offset += (this.metrics.getLineSize(this.currentLine) - this.currentCol);
                        this.currentLine++;
                        var size = this.metrics.getLines() - 1;
                        for(var i = 0;this.currentLine < size && i < (num - 1); i++ ,this.currentLine++ ){
                            this.offset += this.metrics.getLineSize(this.currentLine);
                        }
                        var maxCol = this.metrics.getLineSize(this.currentLine);
                        if (this.currentCol < maxCol) this.offset += this.currentCol;
                        else {
                            this.currentCol = maxCol - 1;
                            this.offset += this.currentCol;
                        }
                        this._.posChanged(this, prevOffset, prevLine, prevCol);
                    } break;
                default: throw new Error();
            }
        };

        this[''] = function(pi){
            this._ = new PosListeners();
            this.isValid = false;
            this.currentLine = this.currentCol = this.offset = 0;
            this.setPositionMetric(pi);
        };

        this.setPositionMetric = function (p){
            if (p == null) throw new Error("Null metric");
            if (p != this.metrics){
                this.metrics = p;
                this.clearPos();
            }
        };
    }
]);

pkg.timer = new (function() {
    var quantum = 40;

    this.runners =  Array(5);
    this.count   =  0;
    this.pid     = -1;
    for(var i = 0; i < this.runners.length; i++) this.runners[i] = { run:null };

    this.get = function(r) {
        if (this.count > 0) {
            for(var i=0; i < this.runners.length; i++) {
                var c = this.runners[i];
                if (c.run != null && c.run == r) return c;
            }
        }
        return null;
    };

    this.start = function(r, startIn, repeatIn){
        if (arguments.length < 3) repeatIn = 150;
        if (arguments.length < 2) startIn  = 150;

        var ps = this.runners.length;
        if (this.count == ps) throw new Error("Out of runners limit");

        var ci = this.get(r);
        if (ci == null) {
            var runners = this.runners, $this = this;
            for(var i=0; i < ps; i++) {
                var j = (i + this.count) % ps, c = runners[j];
                if (c.run == null) {
                    c.run = r;                      
                    c.si  = startIn;
                    c.ri  = repeatIn;
                    break;
                }
            }
            this.count++;

            if (this.count == 1) {
                this.pid = window.setInterval(function() {
                    for(var i = 0; i < ps; i++) {
                        var c = runners[i];
                        if (c.run != null) {
                            if (c.si <= 0) {
                                try      { c.run.run(); }
                                catch(e) { zebra.print(e); }
                                c.si += c.ri;
                            }
                            else c.si -= quantum;
                        }
                    }
                    if ($this.count === 0) { 
                        window.clearInterval($this.pid);
                        $this.pid = -1;
                    }
                }, quantum);
            }
        }
        else {
            ci.si = startIn;
            ci.ri = repeatIn;
        }

        return r;
    };

    this.stop = function(l) {
        this.get(l).run = null;
        this.count--;
        if (this.count == 0 && this.pid >= 0) {
            window.clearInterval(this.pid);
            this.pid = -1;
        }
    };

    this.clear = function(l){
        var c = this.get(l);
        c.si = c.ri;
    };
})();

pkg.Bag = zebra.Class([
    function $prototype() {
        this.usePropertySetters = true;
        this.ignoreNonExistentKeys = false;

        this.get = function(key) {
            if (key == null) throw new Error("Null key");
            var n = key.split('.'), v = this.objects;
            for(var i = 0; i < n.length; i++) {
                v = v[n[i]];
                if (typeof v === "undefined") { 
                    if (this.ignoreNonExistentKeys) return v;
                    throw new Error("Property '" + key + "' not found");
                }
            }
            return v != null && v.$new ? v.$new() : v;
        };

        this.mergeContent = function(o, v) {
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
        };

        // create, merge to o and return a value by the given description d that is designed to be assigned to o
        // -- atomic types int string boolean number are returned as is
        // -- created by the given description array are append to o array
        // -- structure description (dictionary) are merged to o
        this.mergeObjWithDesc = function(o, d) {
            // atomic type should be returned as is
            if (d === null || zebra.isNumber(d) || zebra.isBoolean(d)) {
                return d;
            }

            // array should be merged (concatenated)
            if (Array.isArray(d)) {
                var v = [];
                for(var i=0; i< d.length; i++) v[i] = this.mergeObjWithDesc(null, d[i]);
                if (o && Array.isArray(o) === false) throw new Error("Destination has to be array");
                return (o != null) ? o.concat(v) : v;
            }

            // string is atomic, but  string can encode type other than string, decode string
            // (if necessary) by calling decodeStringValue method
            if (zebra.isString(d)) {
                return (d[0] == "@") ? this.get(d.substring(1)) 
                                     : (this.decodeStringValue ? this.decodeStringValue(d) : d);
            }

            // store and cleanup $inherit synthetic field from description.
            var inh = null;
            if (d.hasOwnProperty("$inherit")) {
                inh = d["$inherit"];
                delete d["$inherit"];
            }

            // test whether we have a class definition
            for (var k in d) {
                // handle class definition
                if (k[0] == '$' && d.hasOwnProperty(k)) {
                    var classname = k.substring(1).trim(), args = d[k];
                    args = this.mergeObjWithDesc(null, Array.isArray(args) ? args : [ args ]);
                    delete d[k];

                    if (classname[0] == "*") {
                        return (function(clazz, args) {
                            return {
                                $new : function() { return pkg.newInstance(clazz, args); }
                            };
                        })(this.resolveClass(classname.substring(1).trim()), args);
                    }
                    return this.mergeObjWithDesc(pkg.newInstance(this.resolveClass(classname), args), d);
                }

                //!!!! trust the name of class occurs first what in general cannot be guaranteed by JSON spec
                //     but we can trust since many other third party applications stands on it too :)
                break;
            }

            // the description is not atomic or array type. it can be either a number of fields that should be
            // merged with appropriate field of "o" object, or it can define how to instantiate an instance of a
            // class. There is one special case: ".name" property says that object is created by calling
            // "name" method
            var v = (o == null || zebra.isNumber(o) || zebra.isBoolean(o) || zebra.isString(o) || Array.isArray(o)) ? d : o;

            for (var k in d) {
                if (d.hasOwnProperty(k)) {
                    // special field name that says to call method to create a value by the given description
                    if (k[0] == ".") {
                        var vv = d[k];
                        if (Array.isArray(vv) === false) vv = [ vv ];
                        return this.objects[k.substring(1).trim()].apply(this.objects, this.mergeObjWithDesc(null, vv));
                    }

                    var po = o && o.hasOwnProperty(k) ? o[k] : null;
                   
                   // v[k] = d[k];

                    var nv = this.mergeObjWithDesc(po, d[k]);
                    if (this.usePropertySetters && k[0] != '.') {
                        m  = zebra.getPropertySetter(v, k);
                        if (m != null) {
                            if (m.length > 1) m.apply(v, nv);
                            else              m.call(v, nv);
                            continue;
                        }
                    }
                    v[k] = nv;
                }
            }

            if (inh !== null) this.inherit(v, inh);
            return v;
        };

        this.resolveClass = function (clazz) {
            return this.aliases.hasOwnProperty(clazz) ? this.aliases[clazz]
                                                      : zebra.Class.forName(clazz);
        };

        this.inherit = function(o, pp) {
            for(var i=0; i < pp.length; i++) {
                var op = this.objects, n = pp[i].trim(), nn = n.split("."), j = 0;
                while (j < nn.length) {
                    op = op[nn[j++]];
                    if (op == null) {
                        throw new Error("Wrong inherit path '" + n + "(" + nn[j-1] + ")'");
                    }
                }

                for(var k in op) {
                    if (op.hasOwnProperty(k) && o.hasOwnProperty(k) === false) o[k] = op[k];
                }
            }
        };
    },

    function () { this.$this({}); },

    function (container) {
        this.aliases = {};
        this.objects = container;
        this.content = {};
    },

    function load(s) { return this.load(s, true); },

    function load(s, b) {
        if (this.isloaded === true) throw new Error("Load is done");
        var content = null;
        try { content = JSON.parse(s); }
        catch(e) {
            throw new Error("JSON  loading error: " + e);
        }
        this.content = this.mergeContent(this.content, content);
        if (this.loaded) this.loaded(this.content);
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
    }
]);

})(zebra("util"), zebra.Class, zebra.Interface);
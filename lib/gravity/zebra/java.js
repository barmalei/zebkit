if (typeof(JAVA) === "undefined") {
    JAVA = zebra.namespace('JAVA');
    JAVA([ 'io', 'awt', 'util' ]);
}

(function(Class, Interface) {
    (function(pkg) { 
        pkg.EventObject = Class([ function(src) { this.source = src; } ]);

        pkg.Hashtable = Class([
        	function() {
        	    this.data   = {}
        	    this.length = 0;
        	},

            function get(key) { return (this.data.hasOwnProperty(key)) ? this.data[key] : null; },

            function put(key, value) {
                if (!this.data.hasOwnProperty(key)) this.length++;
                this.data[key] = value;
            },

            function contains(value) { return this.containsValue(value); },
            function containsKey(key) { return this.data.hasOwnProperty(key); },

            function containsValue(value) {
                for(var k in this.data) if (this.data[k] == value) return true;
                return false;
            },

            function elements()  {
                var $this = this;
                return new (function() {
                    this.values = [];
                    for (var k in $this.data) this.values.push($this.data[k]);

                    this.hasMoreElements = function() { return this.values.length > 0; }
                    this.nextElement = function()  { return this.values.pop(); }
                })();
            },

            function remove(key) {
                if (this.data.hasOwnProperty(key)) {
                    delete this.data[key];
                    this.length--;
                }
            },

            function size() { return this.length; },
            function isEmpty() { return this.length == 0; },

            function clear() {
                for(var e = this.keys(); e.hasMoreElements(); ) delete this.data[e.nextElement()];
                this.length = 0;
            },
        ]);

        pkg.Properties = Class(pkg.Hashtable, [
        	function() { this.$super(); },
            function getProperty(name) { return this.get(name); },
            function setProperty(name, value) { return this.put(name, value); },

        	function load(is) {
        	    var key = null, reader = (zebra.isString(is)) ? new JAVA.io.StringReader(is) : 
        	                                                    new JAVA.io.InputStreamLineReader(is, "ascii")
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
        
        //!!!!
        //  KEYS is standard function of Object that cannot be overrided by normal way in IE9
        //  only by prototype
        //!!!!
        pkg.Hashtable.prototype.keys = function()  {
            var $this = this;
            return new (function() {
                this.keys = [];
                for (var k in $this.data) this.keys.push(k);

                this.hasMoreElements = function()  { return this.keys.length > 0; }
                this.nextElement = function()  { return this.keys.pop(); }
            })();
        }
	    
    })(JAVA.util);
  
    (function(pkg) { 
        pkg.IOException = function(m) { Error.call(this, m); }
        pkg.FileNotFoundException = function(m){ IOException.call(m); }
        var IOException = pkg.IOException, FileNotFoundException = pkg.FileNotFoundException;
        IOException.prototype = new Error(); 
        FileNotFoundException.prototype = new IOException();

        pkg.File = Class([
        	function(path) {
        	    this.path = path.trim().replace("\\", "/");
	    
        	    var p = this.path.split('/');
        	    this.name   = p.pop();
        	    this.parent = p.join('/');
        	    if (this.parent.length == 0) this.parent = null;

        	    var i = this.name.lastIndexOf('.');
        	    this.extension = (i > 0) ? this.name.substring(i + 1).toLowerCase() : null;
        	},

        	function getPath()     { return this.path; },
        	function getParent()   { return this.parent; },
        	function getName()     { return this.name; },
        	function ext()         { return this.extension; },
        	function isFile()      { return true; },
        	function isDirectory() { return false; }
        ]);

        pkg.InputStream = Class(function($) {
        	$(function skip(n) {
        	    var a = this.available();
                if (a <= 0) throw new IOException();
                if (n <= 0) return 0;
        
                var npos = this.pos + n;
                if (npos >= a) npos = a - 1;
                for (var i = 0; i < npos - n; i++) this.read();
                return npos - n;
        	});

        	$(function available() { return 0; });
            $(function markSupported() { return false; });
        	$(function mark() { this.mark(0); });
        	$(function mark(readlimit) { throw new IOException(); });
        	$(function reset() { throw new IOException(); });
        	$(function close() {});
        	$(function read() { return (this.available() > 0) ? this.readByte() : -1; });
        	$(function read(buf) { return this.read(buf, 0, buf.length); });

        	$(function read(buf, off, len) {
                for(var i = 0; i < len; i++) { 
                    var b = this.read();
                    if (b < 0) return i == 0 ? -1 : i;
                    buf[off + i] = b;
                }
                return len;
        	});

        	this.Abstract(function readByte() {});
        });

        pkg.ByteArrayInputStream = Class(pkg.InputStream, function($) {
            var isBA = typeof(ArrayBuffer) !== 'undefined';

        	$(function(container) {
        	    if (isBA && container instanceof ArrayBuffer) {    
        	        this.data = new Uint8Array(container);
        	    }   
                else {
            	    if (zebra.isString(container)) {
                	    this.Field("readByte", function() { return this.data.charCodeAt(this.pos++) & 0xFF; });
            	    }
            	    else {
            	        if (container.constructor != Array) throw new Error("Wrong type: " + typeof(container));
            	    }
            	    this.data = container; 
        	    }
        	    this.marked  = -1; 
        	    this.pos     = 0;
        	});

        	$(function skip(n) {
        	    var av = this.available();
        	    if (av <= 0) throw new IOException();
        	    if (n <= 0) return 0;
	    
        	    if (n > av) {
        	        this.pos += av;
        	        return av;
        	    }
        	    this.pos += n;
        	    return n;
        	});

        	$(function mark(readlimit) {
        	    if (this.available() <= 0) throw new IOException();
        		this.marked = this.pos;
        	});

        	$(function reset() {
                if (this.available() <= 0 || this.marked < 0) throw new IOException();
                this.pos    = this.marked;
                this.marked = -1;
        	});

            $(function available() { return this.data.length - this.pos; });
            $(function markSupported() { return true; });
        	$(function readByte() { return this.data[this.pos++]; });
        });

        pkg.FileInputStream = Class(pkg.ByteArrayInputStream, function($) {
            function download(path, target) {
                if(zebra.isIE) {
                    var data = BinFileReaderImpl_IE_VBAjaxLoader(path).toArray();
                    if (data.length <= 0) throw new FileNotFoundException(path); 
                    return data;
                }
                else {
                    var req = new XMLHttpRequest(), b = ('responseType' in req);
                    req.open('GET', path + (path[path.length - 1] == '?' ? '&' : '?') + (new Date()).getTime(), false);
    
//                    if (b) req.responseType = 'arraybuffer';
                    //else   
                    req.overrideMimeType('text/plain; charset=x-user-defined');
                    req.send(null);
            
                    if (req.status != 200) throw new FileNotFoundException(path);
                    return b ? req.response : req.responseText;
               }
            }

        	$(function(path) { this.$super(download(path)); });	

            $(function close() {
                if (this.data) {
                    this.data.length = 0;
                    this.data = null;
                }
            });
        });

        pkg.Reader = Class(function($) {
            $(function ready()   { return true; });
            $(function read(buf) { return this.read(buf, 0, buf.length); });

            $(function read(buf, offset, len) {
                for(var i = 0; i < len; i++) {
                    var d = this.read();
                    if (d < 0) return i == 0 ? -1 : i;
                    buf[offset + i] = d;
                }
                return len;
            });


            $(function markSupported() { return false; });
            $(function skip(n) { throw new IOException(); });
            $(function mark(n) { throw new IOException(); });
            $(function mark() { this.mark(0); });
            $(function reset() { throw new IOException(); });

            this.Abstract(function read() {});
        });

        pkg.InputStreamReader = Class(pkg.Reader, function($) {
        	function readUTF8() {
        		var c = this.stream.read(); 
        		if (c < 0) return -1;
		
        		if (c < 128) return String.fromCharCode(c);

                var c2 = this.stream.read();
                if (c2 < 0) throw new IOException();
        
        		if (c > 191 && c < 224) return String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        		else {
        		    var c3 = this.stream.read();
                    if (c3 < 0) throw new IOException();
        			return String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        		}
        	}

        	function readUTF16() {
        	    function be_reader() {
            	    var c1 = this.stream.read(), c2 = this.stream.read();
            	    if (c1 < 0) return -1; 
            	    if (c2 < 0) throw new IOException();

            	    if (c1 >= 0xD8 && c1 < 0xE0) {
                	    c1 = this.stream.read(); 
                	    c2 = this.stream.read();
                	    if (c1 < 0 || c2 < 0) throw new IOException();
            		}
            		return String.fromCharCode((c1 << 8) + c2);
        	    }

        	    function le_reader() {
            	    var c1 = this.stream.read(), c2 = this.stream.read();
            	    if (c1 < 0) return -1; 
            	    if (c2 < 0) throw new IOException();

            	    if (c2 >= 0xD8 && c2 < 0xE0) {
                	    c1 = this.stream.read(); 
                	    c2 = this.stream.read();
                	    if (c1 < 0 || c2 < 0) throw new IOException();
            		}
            		return String.fromCharCode((c2 << 8) + c1);
        	    }
	    
        	    this.stream.mark();
        	    var c1 = this.stream.read(), c2 = this.stream.read();
        	    if (c1 < 0) return -1; 
        	    if (c2 < 0) throw new IOException();

                var be = 0;
                if (c1 == 0xFE && c2 == 0xFF) be = 1;
                if (c1 == 0xFF && c2 == 0xFE) be = 2;
                if (be == 0) this.stream.reset();
                var r = (be < 2 ? be_reader : le_reader);
        	    this.Field('read', r);
        	    return r.call(this);
        	}

        	function readASCII() {
        	    var c1 = this.stream.read();
        	    if (c1 < 0) return -1;
        		return String.fromCharCode(c1);
        	}

        	var readers  = {
        		'utf8'  : readUTF8,
        		'utf-8' : readUTF8,
        		'ascii' : readASCII,
        		'latin' : readASCII,
        		'latin1': readASCII,
        		'utf16' : readUTF16,
        		'utf-16': readUTF16
        	};

        	$(function(stream) { this.$this(stream, 'utf8'); });

        	$(function(stream, encoding){
        	    this.stream   = stream; 
        		this.encoding = encoding.toLowerCase();
        		if (!(this.encoding in readers)) throw new Error("Unknown encoding : " + this.encoding);
        		this.Field('read', readers[this.encoding]);
        	});
	
        	$(function read() {});
        });

        pkg.InputStreamLineReader = Class(pkg.InputStreamReader, [
        	function(stream) { this.$this(stream, 'utf8'); },
    		function(stream, encoding) { this.$super(stream, encoding); },

    	    function readLine() {
                if (this.stream.available() > 0) 
    	        {
    	            var line = [], b;
                    while ((b = this.read()) != -1 && b != "\n") line.push(b);
                    var r = line.join('');
                    line.length = 0;
    	            return r;
    	        }
    	        return null;
    	    },
    
    	    function readAll() {
                if (this.stream.available() > 0) 
    	        {
    	            var text = [], l;
                    while ((l = this.readLine()) != null) text.push(l);
                    var r = text.join('\n');
                    text.length = 0;
    	            return r;
    	        }
    	        return null;
    	    }
        ]);

        //!!!
        pkg.TextFileReader = Class(function($) {
            function getRequest() {
                if (window && window.XMLHttpRequest) return new XMLHttpRequest(); 
                if (window && window.ActiveXObject) return new ActiveXObject("Microsoft.XMLHTTP"); 
                throw new Error("Request object is not available");
            }

            $(function(path) {
                var req = getRequest();
                req.open("GET", path + (path[path.length - 1] == '?' ? '&' : '?') + (new Date()).getTime(), false);
                req.send(null);
                if (req.status != 200) throw new FileNotFoundException(path);
                this.text = req.responseText;
            });
        });

        pkg.StringReader = Class(pkg.Reader,[
        	function(str) { 
        	    this.data = str; 
        	    this.pos = 0;
        	},

            function read() { return (this.pos >= this.data.length) ? -1 : this.data[this.pos++]; },

        	function readLine() {
                if (this.pos >= this.data.length) return null;
                var i = this.data.indexOf("\n", this.pos), p = this.pos;
                this.pos = (i >= 0) ? i + 1 : this.data.length + 1;
                return this.data.substring(p, this.pos - 1);
        	}
        ]);

        pkg.OutputStream = Class(function($) {
            $(function() { this.isClosed = false; });
        	$(function close() { this.isClosed = true; });
        	$(function flush(){ this.testIfClosed(); });

            $(function write(b, off, len) {
                this.testIfClosed();
                for(var i = 0; i < len; i++) this.writeByte(b[i + off]);
            });
    
            $(function write(b) {
                if (b.constructor == Array)  this.write(b, 0, b.length);
                else {
                    this.testIfClosed();
                    this.writeByte(b);
                }
            });
    
            $(function testIfClosed() { if (this.isClosed) throw new IOException(); });
    
            this.Abstract(function writeByte(b) {});
        });

        pkg.ByteArrayOutputStream = Class(pkg.OutputStream, [
            function() { this.$this(-1); },
    
            function(size) {
                this.$super();
                this.maxSize = size;
                this.data = size > 0 ? Array(size) : [];
            },

            function close() {
                this.$super();
                if (this.data.length) { 
                    this.data.length = 0;
                    this.data = null;
                }
            },

            function size() { return this.data == null ? 0 : this.data.length; },

            function writeByte(b) {
                if (this.maxSize > 0 && this.data.length >= this.maxSize) throw new IOException("Buffer size limit is reached");
                this.data[this.size()] = b;
            },

            function toString() {  return this.toString("ascii"); },

            function toString(encoding) { 
                this.testIfClosed();
                if (encoding.toLowerCase() == "ascii") return String.fromCharCode.apply(String, this.data); 
                var r = new pkg.InputStreamReader(new pkg.ByteArrayInputStream(this.data), encoding), s = "", ch;
                while ((ch = r.read()) != -1) s += ch;
                return s;
            }
        ]);
    })(JAVA.io);

    (function(pkg) { 

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

        pkg.Point.prototype.set = function(x,y) { this.x = x;  this.y = y; } 
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

        pkg.Graphics = Class(function($) {
                var MS = Math.sin, MC = Math.cos;

                function oval(ctx, x,y,w,h){
                    ctx.beginPath();  
                    var kappa = .5522848, ox = (w / 2) * kappa, oy = (h / 2) * kappa, xe = x + w, ye = y + h, xm = x + w / 2, ym = y + h / 2;
                    ctx.moveTo(x, ym);
                    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
                    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
                    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
                    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
                }

                function roundRect(ctx, x, y, width, height, arcWidth, arcHeight){
                    ctx.beginPath();  
                    ctx.moveTo(x, y + arcHeight);  
                    ctx.lineTo(x, y + height-arcHeight);  
                    ctx.quadraticCurveTo(x, y + height, x + arcWidth, y + arcHeight);  
                    ctx.lineTo(x + width - arcWidth, y + height);  
                    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height-arcHeight);  
                    ctx.lineTo(x + width,y + arcHeight);  
                    ctx.quadraticCurveTo(x + width, y, x + width - arcWidth,y);  
                    ctx.lineTo(x + arcWidth,y);  
                    ctx.quadraticCurveTo(x, y, x, y + arcHeight);  
                }

                function polyline(ctx, xPoints, yPoints, nPoints){
                    ctx.beginPath();  
                    ctx.moveTo(xPoints[0], yPoints[0]);
                    for(var i=1; i < nPoints; i++) ctx.lineTo(xPoints[i], yPoints[i]);
                }

                $(function(canvas) {
                    this.setFont = function(f) { 
                        if (f.s != this.target.font) {
                            this.font = f; 
                            this.target.font = f.s;
                        }
                    }

                    this.setColor = function(c) {
                        if (c.s != this.target.fillStyle) this.target.fillStyle = c.s;
                        if (c.s != this.target.strokeStyle) this.target.strokeStyle = c.s;
                        this.color = c;
                    }

                    this.drawString = function(str, x, y) { this.target.fillText(str, x, y); }
                    this.getClipBounds = function() { return new pkg.Rectangle(this.clip.x, this.clip.y, this.clip.width, this.clip.height); }

                    this.translate = function(dx, dy) { 
                        if (dx != 0 || dy != 0) {
                            this.dx += dx;
                            this.dy += dy;
                            this.clip.x -= dx;
                            this.clip.y -= dy;
                            this.target.translate(dx, dy); 
                        }
                    }

                    this.setClip = function(x,y,w,h) {
                        var c = this.clip, ctx = this.target;
                        if (x != c.x || y != c.y || w != c.width || h != c.height) {
                            var xx = x + w, yy = y + h;
                            if (this.restored == false && (x < c.x || y < c.y || xx > (c.x + c.width) || yy > (c.y + c.height))) {
                                ctx.restore();
                                this.restored = true;
                                if (this.color != null) ctx.strokeStyle = ctx.fillStyle = this.color.s;
                                if (this.font != null) ctx.font = this.font.s;
                                ctx.translate(this.dx - this.rdx, this.dy - this.rdy); 
                                c.x = -this.dx;
                                c.y = -this.dy;
                                c.width  = parseInt(ctx.canvas.width);
                                c.height = parseInt(ctx.canvas.height);
                            }
                            this.clipRect(x, y, w, h);
                        }
                    }

                    this.clipRect = function(x,y,w,h){
                        var c = this.clip;
                        if (c.x != x || y != c.y || w != c.width || h != c.height) {
                            var xx = c.x, yy = c.y, ww = c.width, hh = c.height;
                            c.intersection(x, y, w, h);
                            if (c.x != xx || yy != c.y || ww != c.width || hh != c.height) {
                                var ctx = this.target;
                                if (this.restored == true)  { 
                                    this.restored = false;
                                    this.rdx = this.dx;
                                    this.rdy = this.dy;
                                    ctx.save();
                                }
                                ctx.beginPath();
                                ctx.rect(x, y, w, h);
                                ctx.clip();
                            }
                        } 
                    }

                    this.drawHLine = function(x1, y, x2, w){
                        if (arguments.length < 4) w = 1;
                        var ctx = this.target, pw = ctx.lineWidth;
                        ctx.beginPath();
                        ctx.lineWidth = w;
                        if (this.rs == false) y += w / 2;
                        ctx.moveTo(x1, y);
                        ctx.lineTo(x2, y);
                        ctx.stroke();
                        ctx.lineWidth = pw;
                    }

                    this.drawVLine = function(x, y1, y2, w){
                        if (arguments.length < 4) w = 1;
                        var ctx = this.target, pw = ctx.lineWidth;
                        ctx.beginPath();
                        ctx.lineWidth = w;
                        if (this.rs == false) x += w / 2;
                        ctx.moveTo(x, y1);
                        ctx.lineTo(x, y2);
                        ctx.stroke();
                        ctx.lineWidth = pw;
                    }

                    this.drawLine = function(x1, y1, x2, y2, w){
                        if (arguments.length < 5) w = 1;

                        if (x1 == x2) { 
                            this.drawVLine(x1, y1, y2, w);
                            return;
                        }

                        if (y1 == y2) { 
                            this.drawHLine(x1, y1, x2, w);
                            return;
                        }

                        var ctx = this.target, pw = ctx.lineWidth;
                        ctx.beginPath();
                        ctx.lineWidth = w;
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                        ctx.lineWidth = pw;
                    }

                    this.drawRect = function(x,y,w,h){ this.target.strokeRect(x, y, w, h); }
                    this.fillRect = function(x,y,w,h){ this.target.fillRect(x,y,w,h);   }

                    this.tX = function(x, y) {
                        return (this.rs ? Math.round((this.crot*x + y*this.srot)/this.sx) : x) - this.dx;
                    }

                    this.tY = function(x, y) {
                        return (this.rs ? Math.round((y*this.crot - this.srot*x)/this.sy) : y) - this.dy;
                    }

                    this.rotate = function(v) {
                        if (this.restored == false) restore();
                        this.rotateVal += v;
                        this.srot = MS(this.rotateVal);
                        this.crot = MC(this.rotateVal);
                        this.target.rotate(v);
                        this.rs = true;
                    }

                    this.reinit = function() {
                        this.target = this.canvas.getContext("2d"); 
                        this.canvas.width = parseInt(this.canvas.width); 
                        this.rs = false;
                        this.restored = true;
                        this.crot = this.sx = this.sy = 1;
                        this.dx = this.dy = this.rotateVal = this.srot = 0;
                        this.setFont(pkg.Font.defaultNormal);
                        this.setColor(pkg.Color.white);
                        this.clip = new pkg.Rectangle(0, 0, parseInt(this.canvas.width), parseInt(this.canvas.height));
                    }

                    this.scale = function(sx, sy) {
                        if (this.restored == false) restore();
                        this.sx = this.sx*sx;
                        this.sy = this.sy*sy; 
                        this.target.scale(sx, sy);
                        this.rs = true;
                    }

                    this.restore = function() {
                        var ctx = this.target;
                        ctx.restore();
                        this.restored = true;
                        if (this.color != null) ctx.strokeStyle = ctx.fillStyle = this.color.s;
                        if (this.font != null) ctx.font = this.font.s;
                        ctx.translate(this.dx - this.rdx, this.dy - this.rdy); 
                        c.x = -this.dx;
                        c.y = -this.dy;
                        c.width  = parseInt(ctx.canvas.width);
                        c.height = parseInt(ctx.canvas.height);
                    }

                    this.canvas = canvas;
                    this.reinit();
                });

                $(function drawRoundRect(x,y,w,h,arc) { this.drawRoundRect(x, y, w, h, arc, arc); });

                $(function drawArc(cx,cy,r, sa, ea, d){
                    var ctx = this.target;
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, sa, ea, d);
                    this.target.stroke();
                });

                $(function drawRoundRect(x, y, w, h, arcWidth, arcHeight){
                    var ctx = this.target;
                    roundRect(ctx, x, y, w, h, arcWidth, arcHeight);
                    ctx.stroke();
                });

                $(function fillRoundRect(x, y, width, height, arcWidth, arcHeight){
                    roundRect(this.target, x, y, width, height, arcWidth, arcHeight);
                    this.target.fill();
                });

                $(function drawImage(img, x, y) { this.target.drawImage(img, x, y); });
                $(function drawImage(img,x,y,w,h){ this.target.drawImage(img, x, y, w, h);});

                $(function drawImage(img,dx1,dy1,dx2,dy2,sx1,sy1,sx2,sy2){
                    this.target.drawImage(img, sx1, sy1, sx2 - sx1, sy2 - sy1, dx1, dy1, dx2 - dx1, dy2 - dy1); 
                });

                $(function clearRect(x,y,w,h){
                    var ctx = this.target;
                    ctx.beginPath();
                    ctx.rect(x,y,w,h);
                    ctx.fill();
                });

                $(function fillArc(cx,cy,r, sa, ea, d){
                    var ctx = this.target;
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, sa, ea, d);
                    ctx.fill();
                });

                $(function drawOval(x,y,w,h) {
                    oval(this.target, x, y, w, h);
                    this.target.stroke();
                });

                $(function drawPolygon(xPoints,yPoints,nPoints){
                    polyline(this.target, xPoints, yPoints, nPoints);
                    this.target.lineTo(xPoints[0], yPoints[0]);
                    this.target.stroke();
                });

                $(function drawPolyline(xPoints,yPoints,nPoints){
                    polyline(this.target, xPoints, yPoints, nPoints);
                    this.target.stroke();
                });

                $(function fillPolygon(xPoints,yPoints,nPoints){
                    polyline(this.target, xPoints, yPoints, nPoints);
                    this.target.lineTo(xPoints[0], yPoints[0]);
                    this.target.fill();
                });

                $(function fillOval(x,y,width,height){
                    this.target.beginPath();
                    oval(this.target, x, y, width, height);
                    this.target.fill();
                });

                $(function drawDottedRect(x,y,w,h) {
                    var ctx = this.target, m = ["moveTo", "lineTo", "moveTo"];
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
                });

                $(function drawDashLine(x,y,x2,y2) {
                    var pattern=[1,2], count = pattern.length, ctx = this.target, compute = null;
                    var dx = (x2 - x), dy = (y2 - y), b = (Math.abs(dx) > Math.abs(dy));
                    var slope = b ? dy / dx : dx / dy, sign = b ? (dx < 0 ?-1:1) : (dy < 0?-1:1);

                    if (b) {
                        compute = function(step) {
                            x += step
                            y += slope * step;
                        }
                    }
                    else {
                        compute = function(step) {
                            x += slope * step;
                            y += step;
                        }
                    }

                    ctx.moveTo(x, y);
                    var dist = Math.sqrt(dx * dx + dy * dy), i = 0;
                    while (dist >= 0.1) {
                        var dl = Math.min(dist, pattern[i % count]), step = Math.sqrt(dl * dl / (1 + slope * slope)) * sign;
                        compute(step);
                        ctx[(i % 2 == 0) ? 'lineTo' : 'moveTo'](x + 0.5, y + 0.5);
                        dist -= dl;
                        i++;
                    }
                    ctx.stroke();
                });        
        });

        pkg.Cursor = Class(function() {
            this.DEFAULT = "default";
            this.MOVE = "move";
            this.WAIT = "wait";
            this.TEXT = "text";
            this.HAND = "pointer";
            this.NE_RESIZE = "ne-resize";
            this.SW_RESIZE = "sw-resize";
            this.SE_RESIZE = "se-resize";
            this.NW_RESIZE = "nw-resize";
            this.S_RESIZE = "s-resize";
            this.W_RESIZE = "w-resize";
            this.N_RESIZE ="n-resize";
            this.E_RESIZE = "e-resize";
        });
    
        if (zebra.isInBrowser) {
            var $fmCanvas = document.createElement("canvas").getContext("2d"), $fmText = null, $fmImage = null;
            
            zebra.ready(
                function() {
                    var e = document.createElement("div");
                    e.setAttribute("id", "zebra.fm");
                    e.setAttribute("style", "visibility:hidden;line-height: 0;");
                    e.innerHTML = "<span id='zebra.fm.text'  style='display:inline;'>&nbsp;</span>" +
            		              "<img  id='zebra.fm.image' style='display:inline;' src='1x1.png' width='1' height='1'/>";
                    document.body.appendChild(e);
                    $fmText   = e.childNodes[0];
                    $fmImage  = e.childNodes[1];
                    
                    pkg.Font.defaultNormal = new pkg.Font(defFontName, 0, 12);  
                    pkg.Font.defaultSmall = new pkg.Font(defFontName, 0, 10);  
                    pkg.Font.defaultBold  = new pkg.Font(defFontName, pkg.Font.BOLD, 12);  
                }
            );
        }
    
        pkg.Font = Class(function($) {
            var Font = this;
            
            this.PLAIN  = 0;
            this.BOLD   = 1;
            this.ITALIC = 2;

        	$(function (name, style, size) {
        	    this.name   = name;
        	    this.style  = style;
        	    this.size   = size;
        	    this.s      = [ (this.style & Font.ITALIC) > 0 ? 'italic ' : '', 
        	                    (style & Font.BOLD) > 0 ? 'bold ':'', 
        	                    this.size, 'px ', this.name].join('');
        	
        	    $fmText.style.font = this.s;
        	    this.height = $fmText.offsetHeight;
        	    this.ascent = $fmImage.offsetTop - $fmText.offsetTop + 1;

                this.stringWidth = function(s) { 
                    if ($fmCanvas.font != this.s) $fmCanvas.font = this.s;
                    return Math.round($fmCanvas.measureText(s).width);
                }
                
                this.charsWidth = function(s, off, len) { 
                    if ($fmCanvas.font != this.s) $fmCanvas.font = this.s;
                    return Math.round($fmCanvas.measureText(len == 1 ? s[off] : s.substring(off, off + len)).width); 
                }
        	});

        	$(function toString() { return this.s;  });
        	$(function equals(f)  { return f === this || (f != null && this.s === f.s); });
        });

        var defFontName = "Arial";
        //!!!
        pkg.SmallFont = Class(pkg.Font, function($) { $(function() { this.$super(defFontName, 0, 10); } )} );
        pkg.BoldFont  = Class(pkg.Font, function($) { $(function() { this.$super(defFontName, pkg.Font.BOLD, 12); } )} );
        pkg.NormalFont = Class(pkg.Font, function($) { $(function() { this.$super(defFontName, 0, 12); } )} );

        pkg.Color = function (r, g, b) {
            if (arguments.length == 1) {
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
            this.s = Color.encode(this);
        }

        var Color = pkg.Color;
        Color.prototype.getGreen = function() { return this.g; }
        Color.prototype.getRed   = function() { return this.r; }
        Color.prototype.getBlue  = function() { return this.b; }
        Color.prototype.toString = function() { return this.s; }
        Color.prototype.equals   = function(c){ return c && (c === this || (this.r == c.r && this.b == c.b && this.g == c.g && this.a == c.a)); }

        Color.encode = function(c) {
            function hex(v) { return (v < 16) ? "0" + v.toString(16) :  v.toString(16); }
            return (c.a > 0) ? ['rgba(', c.r, ",", c.g, ",", c.b, ",", c.a, ")"].join('')
                             : ['#', hex(c.r), hex(c.g), hex(c.b)].join('');
        }

        Color.decode = function(s) {
            if (s[0] === '#') return new Color(parseInt(s.substring(1), 16));
            if (s[0] === 'r' && s[1] === 'g' && s[2] === 'b') {
                var i = s.indexOf('(', 3), p = s.split(s.substring(i + 1), s.indexOf(')', i + 1), ',');
                return new Color(parseInt(p[0].trim()), parseInt(p[1].trim()), parseInt(p[2].trim()));
            }
            if (s in Color) return Color[s];
            throw new Error(s);
        }

        Color.black     = new Color(0,0,0);
        Color.white     = new Color(255,255,255);
        Color.red       = new Color(255,0,0);
        Color.blue      = new Color(0,0,255);
        Color.green     = new Color(0,255,0);
        Color.gray      = new Color(128,128,128);
        Color.lightGray = new Color(211,211,211);
        Color.darkGray  = new Color(169,169,169);
        Color.orange    = new Color(255,165,0);
        Color.yellow    = new Color(255,255,0);
        Color.pink      = new Color(255,192,203);
        Color.cyan      = new Color(0,255,255);
        Color.magenta   = new Color(255,0,255);
        Color.darkBlue  = new Color(0, 0, 140);
        
    })(JAVA.awt);

})(zebra.Class, zebra.Interface);








if (typeof(JAVA) === "undefined") {
    JAVA = zebra.namespace('JAVA');
    JAVA('io');
}

(function(pkg, Class, Interface) {
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
})(JAVA.io, zebra.Class, zebra.Interface);








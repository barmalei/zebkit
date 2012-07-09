(function(pkg, Class) {    
    pkg.getRequest = function() {
        function urlid(url) {
            return url + (url[url.length - 1] == '?' ? '&' : '?') + (new Date()).getTime();
        }
        
        if (zebra.isIE) {
            if (location.protocol == "file:") {
                var r = Object();
                r.read = function(url) {
                    var req = new ActiveXObject("Microsoft.XMLHTTP");
                    req.open('GET', urlid(url), false);
                    if (req.overrideMimeType) req.overrideMimeType('text/plain; charset=x-user-defined');
                    req.send(null);
                    if (req.readyState != 4 || (req.status != 0 && req.status != 200)) throw new Error("Path not found: '" + url + "', status = " + req.status);
                    return req.responseText;
                }
                return r;
            }
            
            var req = new XDomainRequest();
            req.read = function(url) {
                var responseText = null, finished = false;
                function completed() {
                    if (req.status === undefined || req.status == 200) responseText = req.responseText;
                    finished = true;
                };
                
                this.onload  = function() { completed(); }
                this.onerror = function() { completed(); }
                this.open('GET', urlid(url));
                this.send(null);
                
                while (!finished) {
                    var r = new XMLHttpRequest();
                    r.open('GET', urlid(window.location), false);
                    r.send(null);
                }
                if (responseText == null) throw new Error("Path not found: '" + url + "'");
                return responseText;
            }
            return req;
        }
        else {
            var req = new XMLHttpRequest();
            req.read = function(url) {
                var b = ('responseType' in this);
                this.open('GET', urlid(url), false);
                if (this.overrideMimeType) this.overrideMimeType('text/plain; charset=x-user-defined');
                this.send(null);
                if (this.readyState != 4 || (this.status != 0 && this.status != 200)) throw new Error("Path not found: '" + url + "', status = " + this.status);
                return b ? this.response : this.responseText;
            }
            return req;
        }
    }

    pkg.readTextFile =  function(path) {
        return pkg.getRequest().read(path);
    }
    
    var isBA = typeof(ArrayBuffer) !== 'undefined';
    pkg.InputStream = Class([
    	function(container) {
    	    if (isBA && container instanceof ArrayBuffer) this.data = new Uint8Array(container);
            else {
        	    if (zebra.isString(container)) {
            	    this.Field(function read() { return this.available() > 0 ? this.data.charCodeAt(this.pos++) & 0xFF : -1; });
        	    }
        	    else {
        	        if (container.constructor != Array) throw new Error("Wrong type: " + typeof(container));
        	    }
        	    this.data = container; 
    	    }
    	    this.marked = -1; 
    	    this.pos    = 0;
    	},

    	function mark() {
    	    if (this.available() <= 0) throw new Error();
    		this.marked = this.pos;
    	},

    	function reset() {
            if (this.available() <= 0 || this.marked < 0) throw new Error();
            this.pos    = this.marked;
            this.marked = -1;
    	},

    	function close() {  this.pos = this.data.length; },
    	function read()    { return this.available() > 0 ? this.data[this.pos++] : -1; },
    	function read(buf) { return this.read(buf, 0, buf.length); },

    	function read(buf, off, len) {
            for(var i = 0; i < len; i++) { 
                var b = this.read();
                if (b < 0) return i == 0 ? -1 : i;
                buf[off + i] = b;
            }
            return len;
    	},

        function available() { return this.data.length - this.pos; }
    ]);

    pkg.FileInputStream = Class(pkg.InputStream, [
    	function(path) { this.$super(this.download(path)); },

        function download(path) {
            return pkg.getRequest().read(path);
        },
        
        function close() {
            this.$super();
            if (this.data) {
                this.data.length = 0;
                this.data = null;
            }
        }
    ]);

    pkg.InputStreamReader = Class(function($) {
    	function readUTF8() {
    		var c = this.stream.read(); 
    		if (c < 0) return -1;
	
    		if (c < 128) return String.fromCharCode(c);

            var c2 = this.stream.read();
            if (c2 < 0) throw new Error();
    
    		if (c > 191 && c < 224) return String.fromCharCode(((c & 31) << 6) | (c2 & 63));
    		else {
    		    var c3 = this.stream.read();
                if (c3 < 0) throw new Error();
    			return String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
    		}
    	}

    	function readUTF16() {
    	    function be_reader() {
        	    var c1 = this.stream.read(), c2 = this.stream.read();
        	    if (c1 < 0) return -1; 
        	    if (c2 < 0) throw new Error();

        	    if (c1 >= 0xD8 && c1 < 0xE0) {
            	    c1 = this.stream.read(); 
            	    c2 = this.stream.read();
            	    if (c1 < 0 || c2 < 0) throw new Error();
        		}
        		return String.fromCharCode((c1 << 8) + c2);
    	    }

    	    function le_reader() {
        	    var c1 = this.stream.read(), c2 = this.stream.read();
        	    if (c1 < 0) return -1; 
        	    if (c2 < 0) throw new Error();

        	    if (c2 >= 0xD8 && c2 < 0xE0) {
            	    c1 = this.stream.read(); 
            	    c2 = this.stream.read();
            	    if (c1 < 0 || c2 < 0) throw new Error();
        		}
        		return String.fromCharCode((c2 << 8) + c1);
    	    }
    
    	    this.stream.mark();
    	    var c1 = this.stream.read(), c2 = this.stream.read();
    	    if (c1 < 0) return -1; 
    	    if (c2 < 0) throw new Error();

            var be = 0;
            if (c1 == 0xFE && c2 == 0xFF) be = 1;
            if (c1 == 0xFF && c2 == 0xFE) be = 2;
            if (be == 0) this.stream.reset();
            var r = (be < 2 ? be_reader : le_reader);
    	    this.read = r;
    	    return r.call(this);
    	}

    	function readASCII() {
    	    var c1 = this.stream.read();
    	    return (c1 < 0) ? -1 : String.fromCharCode(c1);
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
    	    this.stream   = zebra.isString(stream) ? new pkg.FileInputStream(stream): stream; 
    		this.encoding = encoding.toLowerCase();
    		if (!(this.encoding in readers)) throw new Error("Unknown encoding : " + this.encoding);
    		this.read = readers[this.encoding];
    	});
    	        
        $(function readLine() {
            if (this.stream.available() > 0) 
	        {
	            var line = [], b;
                while ((b = this.read()) != -1 && b != "\n") line.push(b);
                var r = line.join('');
                line.length = 0;
	            return r;
	        }
	        return null;
	    });

	    $(function readAll() {
            if (this.stream.available() > 0) {
	            var text = [], l;
                while ((l = this.readLine()) != null) text.push(l);
                var r = text.join('\n');
                text.length = 0;
	            return r;
	        }
	        return null;
	    });
	    
	    $(function close() { this.stream.close(); });
    });

    pkg.StringReader = Class([
    	function(str) { 
    	    this.data = str; 
    	    this.pos = 0;
    	},
    	
        function read() {
            if (this.pos >= this.data.length) return -1;
            return this.data[this.pos++];
        },

    	function readLine() {
            if (this.pos >= this.data.length) return null;
            var i = this.data.indexOf("\n", this.pos), p = this.pos;
            this.pos = (i >= 0) ? i + 1 : this.data.length + 1;
            return this.data.substring(p, this.pos - 1);
    	},

	    function readAll() {
            if (this.pos >= this.data.length) return null;
            var pos = this.pos;
            this.pos = this.data.length;
            return this.data.substring(pos);
	    },
	    
	    function close() { this.pos = this.data.length; }
    ]);

    pkg.OutputStream = Class([
        function() { this.$this(-1); },

        function(size) {
            this.isClosed = false;
            this.maxSize = size;
            this.data = size > 0 ? Array(size) : [];
        },
        
        function write(b, off, len) {
            this.testIfClosed();
            for(var i = 0; i < len; i++) this.writeByte(b[i + off]);
        },

        function write(b) {
            if (b.constructor == Array)  this.write(b, 0, b.length);
            else {
                this.testIfClosed();
                this.writeByte(b);
            }
        },

        function testIfClosed() { if (this.isClosed) throw new Error(); },

        function close() {
            this.isClosed = true;
            if (this.data.length) { 
                this.data.length = 0;
                this.data = null;
            }
        },

        function size() { return this.data == null ? 0 : this.data.length; },

        function writeByte(b) {
            if (this.maxSize > 0 && this.data.length >= this.maxSize) throw new Error("Buffer size limit is reached");
            this.data[this.size()] = b;
        },

        function toString() {  return this.toString("ascii"); },

        function toString(encoding) { 
            this.testIfClosed();
            if (encoding.toLowerCase() == "ascii") return String.fromCharCode.apply(String, this.data); 
            var r = new pkg.InputStreamReader(new pkg.InputStream(this.data), encoding), s = "", ch;
            while ((ch = r.read()) != -1) s += ch;
            return s;
        }
    ]);
    
})(zebra("io"), zebra.Class);








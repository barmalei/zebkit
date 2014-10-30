(function(io, Class) {
    var CDNAME = '';

    /**
     * Get declared by this class methods.
     * @param  {String} [name] a method name. The name can be used as a
     * filter to exclude all methods whose name doesn't match the passed name
     * @return {Array} an array of declared by the class methods
     * @method  getMethods
     */
    zebra.getMethods = function(clazz, name)  {
         var m = [];

         // map user defined constructor to internal constructor name
         if (name == CDNAME) name = zebra.CNAME;
         for (var n in clazz.prototype) {
             var f = clazz.prototype[n];
             if (arguments.length > 0 && name != n) continue;
             if (typeof f === 'function') {
                if (f.$clone$ != null) {
                    if (f.methods != null) {
                        for (var mk in f.methods) m.push(f.methods[mk]);
                    }
                    else {
                        m.push(f.f);
                    }
                }
                else m.push(f);
             }
         }
         return m;
    };

    zebra.getMethod = function(clazz, name, params) {
        // map user defined constructor to internal constructor name
        if (name == CDNAME) name = zebra.CNAME;
        var m = clazz.prototype[name];
        if (typeof m === 'function') {
            if (m.$clone$ != null) {
                if (m.methods == null) {
                    return m.f;
                }

                if (typeof params === "undefined")  {
                    if (m.methods[0]) return m.methods[0];
                    for(var k in m.methods) {
                        if (m.methods.hasOwnProperty(k)) {
                            return m.methods[k];
                        }
                    }
                    return null;
                }

                m = m.methods[params];
            }
            if (m) return m;
        }
        return null;
    };

    var isBA = typeof(ArrayBuffer) !== 'undefined';
    io.InputStream = Class([
        function(container) {
            if (isBA && container instanceof ArrayBuffer) this.data = new Uint8Array(container);
            else {
                if (zebra.isString(container)) {
                    this.extend([
                        function read() {
                            return this.available() > 0 ? this.data.charCodeAt(this.pos++) & 0xFF : -1;
                        }
                    ]);
                }
                else {
                    if (Array.isArray(container) === false) {
                        throw new Error("Wrong type: " + typeof(container));
                    }
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

        function close()   { this.pos = this.data.length; },
        function read()    { return this.available() > 0 ? this.data[this.pos++] : -1; },
        function read(buf) { return this.read(buf, 0, buf.length); },

        function read(buf, off, len) {
            for(var i = 0; i < len; i++) {
                var b = this.read();
                if (b < 0) return i === 0 ? -1 : i;
                buf[off + i] = b;
            }
            return len;
        },

        function readChar() {
            var c = this.read();
            if (c < 0) return -1;
            if (c < 128) return String.fromCharCode(c);

            var c2 = this.read();
            if (c2 < 0) throw new Error();

            if (c > 191 && c < 224) return String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            else {
                var c3 = this.read();
                if (c3 < 0) throw new Error();
                return String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            }
        },

        function readLine() {
            if (this.available() > 0)
            {
                var line = [], b;
                while ((b = this.readChar()) != -1 && b != "\n") line.push(b);
                var r = line.join('');
                line.length = 0;
                return r;
            }
            return null;
        },

        function available() { return this.data === null ? -1 : this.data.length - this.pos; },
        function toBase64() { return io.b64encode(this.data); }
    ]);

    io.URLInputStream = Class(io.InputStream, [
        function(url) {
            this.$this(url, null);
        },

        function(url, f) {
            var r = io.getRequest(), $this = this;
            r.open("GET", url, f !== null);
            if (f === null || isBA === false) {
                if (!r.overrideMimeType) throw new Error("Binary mode is not supported");
                r.overrideMimeType("text/plain; charset=x-user-defined");
            }

            if (f !== null)  {
                if (isBA) r.responseType = "arraybuffer";
                r.onreadystatechange = function() {
                    if (r.readyState == 4) {
                        if (r.status != 200)  throw new Error(url);
                        zebra.getMethod($this.$clazz.$parent, '', 1).call($this, isBA ? r.response : r.responseText); // $this.$super(res);
                        f($this.data, r);
                    }
                };
                r.send(null);
            }
            else {
                r.send(null);
                if (r.status != 200) throw new Error(url);
                this.$super(r.responseText);
            }
        },

        function close() {
            this.$super();
            if (this.data) {
                this.data.length = 0;
                this.data = null;
            }
        }
    ]);
})(zebra("io"), zebra.Class);
    pkg.Output = Class([
        function $prototype() {
            this.print = function print(o) { this._p(0, o); };
            this.error = function error(o) { this._p(2, o); };
            this.warn  = function warn(o)  { this._p(1, o); };

            this._p = function(l, o) {
                o = this.format(o);
                if (pkg.isInBrowser) {
                    if (typeof console === "undefined" || !console.log) {
                        alert(o);
                    }
                    else {
                        if (l === 0) console.log(o);
                        else {
                            if (l == 1) console.warn(o);
                            else console.error(o);
                        }
                    }
                }
                else pkg.$global.print(o);
            };

            this.format = function (o) {
                if (o && o.stack) return [o.toString(), ":",  o.stack.toString()].join("\n");
                if (o === null) return "<null>";
                if (typeof o === "undefined") return "<undefined>";
                if (pkg.isString(o) || pkg.isNumber(o) || pkg.isBoolean(o)) return o;
                var d = [o.toString() + " " + (o.clazz ? o.clazz.$name:"") , "{"];
                for(var k in o) if (o.hasOwnProperty(k)) d.push("    " + k + " = " + o[k]);
                return d.join('\n') + "\n}";
            };
        }
    ]);

    pkg.HtmlOutput = Class(pkg.Output, [
        function(element) {
            if (arguments.length === 0) element = null;

            element = element || "zebkit.out";
            if (pkg.isString(element)) {
                this.el = document.getElementById(element);
                if (this.el == null) {
                    this.el = document.createElement('div');
                    this.el.setAttribute("id", element);
                    document.body.appendChild(this.el);
                }
            }
            else {
                if (element == null) {
                    throw new Error("Unknown HTML output element");
                }

                this.el = element;
            }
        },

        function print(s) { this.out('black', s); },
        function error(s) { this.out('red', s); },
        function warn(s)  { this.out('orange', s); },

        function out(color, msg) {
            var t = ["<div class='zebkit.out.print' style='color:", color, "'>", this.format(msg), "</div>" ];
            this.el.innerHTML += t.join('');
        }
    ]);

    pkg.RemoteOutput = Class(pkg.Output, [
        function(url) {
            this.http   = new zebkit.io.HTTP(url);
            this.apikey = "19751975";
            this.buffer = [];
            this.$justSaved = false;
        },

        function $prototype() {
            this.query = function(cmd,args) {
                var s = "apikey=" + this.apikey + "&command=" + cmd;
                if (args != null) {
                    for(var k in args) s += "&" + k + "=" + args[k];
                }
                return s;
            };

            this.print = function(s,f) { this.out("info", s,f);    };
            this.error = function(s,f) { this.out("error", s,f);   };
            this.warn  = function(s,f) { this.out("warning", s,f); };

            this.out = function(l, s, f) {
                if (f == null) {
                    this.$justSaved = true;
                    this.buffer.push({ level: l, message: s, time:(new Date()).toString() });

                    if (this.$timer == null) {
                        var $this = this;
                        this.$timer = setInterval(function() {
                            if ($this.$justSaved === true) {
                                $this.$justSaved = false;
                                return;
                            }

                            if ($this.buffer.length === 0) {
                                clearInterval($this.$timer);
                                $this.$timer = null;
                                return;
                            }

                            try {
                                var q = $this.query("log", {});
                                for(var i=0; i < $this.buffer.length; i++) {
                                    q   += "&level=" + $this.buffer[i]["level"];
                                    q   += "&message=" +  $this.buffer[i]["message"];
                                    q   += "&time=" + $this.buffer[i]["time"];
                                }
                                $this.buffer.length= 0;

                                var r = $this.http.POST(q).split("\n");
                                if (parseInt(r[0], 10) < 0) throw new Error(r[1]);
                            }
                            catch(e) {
                                alert(e);
                            }
                        }, 1500);
                    }
                }
                else {
                    this.http.POST(this.query("log", { "level"  : l, "message": s, "time": (new Date()).toString() }),
                                    function(result, req) {
                                        var r = result.split("\n");
                                        if (parseInt(r[0], 10) < 0) throw new Error(r[1]);
                                        f(r);
                                    }
                    );
                }
            };

            this.tail = function(l) {
                var s = this.query("tail", { startline:l }),
                    r = this.http.GET(s).split("\n"),
                    c = parseInt(r[0].split(" ")[0], 10);

                if (c < 0) {
                    throw new Error(r[1]);
                }

                r.shift();
                r.pop();
                return r;
            };

            this.clear = function() {
                var r = this.http.POST(this.query("clear")).split("\n");
                if (parseInt(r[0],10) < 0) {
                    throw new Error(r[1]);
                }
            };
        }
    ]);

    pkg.$out  = new pkg.Output();
    pkg.print = function() { pkg.$out.print.apply(pkg.$out, arguments); };
    pkg.error = function() { pkg.$out.error.apply(pkg.$out, arguments); };
    pkg.warn  = function() { pkg.$out.warn.apply(pkg.$out, arguments); };

    if (typeof console == "undefined") {
        console = { log   : pkg.print,
                    error : pkg.error,
                    debug : pkg.print };
    }

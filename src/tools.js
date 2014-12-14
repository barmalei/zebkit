(function(pkg, Class) {

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
                var d = [o.toString() + " " + (o.$clazz ? o.$clazz.$name:"") , "{"];
                for(var k in o) if (o.hasOwnProperty(k)) d.push("    " + k + " = " + o[k]);
                return d.join('\n') + "\n}";
            };
        }
    ]);

    pkg.HtmlOutput = Class(pkg.Output, [
        function() { this.$this(null); },

        function(element) {
            element = element || "zebra.out";
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
            var t = ["<div class='zebra.out.print' style='color:", color, "'>", this.format(msg), "</div>" ];
            this.el.innerHTML += t.join('');
        }
    ]);

    pkg.RemoteOutput = Class(pkg.Output, [
        function(url) {
            this.http   = new zebra.io.HTTP(url);
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

    pkg.$out   = new pkg.Output();
    pkg.print = function() { pkg.$out.print.apply(pkg.$out, arguments); };
    pkg.error = function() { pkg.$out.error.apply(pkg.$out, arguments); };
    pkg.warn  = function() { pkg.$out.warn.apply(pkg.$out, arguments); };

    if (typeof console == "undefined") {
        console = { log   : pkg.print,
                    error : pkg.error,
                    debug : pkg.print };
    }

    function AssertionError(msg) {
        Error.call(this, msg);
        this.message = msg;
    }
    AssertionError.prototype = new Error();

    pkg.assertTrue = function(c, lab) {
        pkg.assert(c, true, lab, "AssertTrue");
    };

    pkg.assertFalse = function(c, lab) {
        pkg.assert(c, false, lab, "AssertFalse");
    };

    pkg.assertNull = function(c, lab) {
        pkg.assert(c, null, lab,  "AssertNull");
    };

    pkg.assertDefined = function(o, p, lab) {
        pkg.assert(typeof o[p] !== "undefined", true, lab,  "AssertDefined");
    };

    pkg.assertFDefined = function(o, f, lab) {
        var b = typeof o[f] !== "undefined" && typeof o[f] === "function";
        if (!b && zebra.isIE) b = !!o[f] && typeof o[f].toString==="undefined" && /^\s*\bfunction\b/.test(o[f]);
        pkg.assert(b, true, lab, "AssertFunctionDefined");
    };

    pkg.assertObjEqual = function(obj1, obj2, lab) {
        function cmp(obj1, obj2) {
            function isNumeric(n) {
              return !isNaN(parseFloat(n)) && isFinite(n);
            }

            if (obj1 === obj2) return true;

            if (obj1 === null || obj2 === null) {
                throw new AssertionError("One of the compared object is null");
            }

            if (Array.isArray(obj1)) {
                if (!Array.isArray(obj2) || obj1.length != obj2.length) {
                    throw new AssertionError("Array type or length mismatch");
                }

                for(var i=0; i < obj1.length; i++) {
                    cmp(obj1[i], obj2[i]);
                }
                return true;
            }

            if (zebra.isString(obj1) || isNumeric(obj1) || typeof obj1 === 'boolean') {
                if (obj1 !== obj2) throw new AssertionError("Objects values '" + obj1 + "' !== '" + obj2 );
                return true;
            }

            for(var k in obj1) {
                if (typeof obj2[k] === "undefined") {
                    throw new AssertionError("Object field '"  + k + "' is undefined" );
                }
                cmp(obj1[k], obj2[k]);
            }
            return true;
        }

        pkg.assert(cmp(obj1, obj2), true, lab, "AssertObjectEqual");
    };

    pkg.assert = function(c, er, lab, assertLab) {
        if (typeof assertLab === "undefined") {
            assertLab = "Assert";
        }
        if (c !== er) {
            throw new AssertionError((lab ? "'" + lab + "' ":"") + assertLab + " result = '" + c  + "' expected = '" + er + "'");
        }
    };

    pkg.assertException = function(f, et, lab) {
        if (!(f instanceof Function)) throw new WrongArgument("Function as input is expected");

        if (zebra.isString(et)) lab = et;
        if (arguments.length < 2 || zebra.isString(et)) et = Error;

        try { f(); }
        catch(e) {
            if ((e.instanceOf && e.instanceOf(et)) || (e instanceof et)) return;
            throw e;
        }
        throw new AssertionError((lab ? "'" + lab + "'":"") + " in\n" + f + "\n" + "method. '" + et.name + "' exception is expected");
    };

    pkg.assertNoException = function(f, lab) {
        if (!(f instanceof Function)) throw new WrongArgument("Function as input is expected");
        try { f(); }
        catch(e) {
            throw new AssertionError((lab ? "'" + lab + "'":"") + " in\n" + f + "\n" + "method. '" + e.toString() + "' exception is not expected");
        }
    };

    pkg.assume = function(c, er, lab) {
        if (c !== er) pkg.warn("Wrong assumption " + (lab ? "'" + lab + "'":"") + " evaluated = '" + c  + "' expected = '" + er + "'");
    };

    pkg.obj2str = function(v, shift) {
        if (typeof shift === "undefined") shift = "";

        if (v == null || zebra.isNumber(v) || zebra.isBoolean(v) || zebra.isString(v)) {
            return v;
        }

        if (Array.isArray(v)) {
            var s = [  "["  ];
            for(var i=0; i < v.length; i++) {
                if (i > 0) s.push(", ");
                s.push(pkg.obj2str(v[i]));
            }
            s.push("]");
            return s.join("");
        }

        var s = [shift, "{"];
        for(var k in v) {
            s.push("\n  " + shift + k + " = " + pkg.obj2str(v[k], shift + "  "));
        }
        s.push("\n", shift, "}");
        return s.join('');
    };

    pkg.runTests = function() {
        var pout = pkg.$out, c = 0,  err = 0, sk = 0, title = null;
        if (pkg.isInBrowser) {
            pkg.$out = new pkg.HtmlOutput();
        }

        var args = Array.prototype.slice.call(arguments);
        if (args.length > 0 && zebra.isString(args[0])) {
            title = args.shift();
        }

        try {
            pkg.print("Running " + args.length + " test cases "  + (title !== null? "from '" + title + "' test suite" : "") + " :");
            pkg.print("==============================================");
            for(var i = 0; i<args.length; i++) {
                var f = args[i];
                if (typeof f !== "function") {
                    throw new Error("Test case has to be function");
                }

                var k = pkg.$FN(f);
                try {
                    if (k.indexOf("_") === 0) {
                        pkg.warn("? " + k + " (remove leading '_' to enable '" + k + "' test case)");
                        sk++;
                        continue;
                    }
                    c++;
                    f();
                    pkg.print("+ " + k);
                }
                catch(e) {
                    err++;
                    if (e instanceof AssertionError) {
                        pkg.error("- " + k + " || " + e.message);
                    }
                    else {
                        pkg.error("" + k + " (unexpected error) " + (e.stack ? e.stack : e));
                        console.log("" + e.stack);
                        throw e;
                    }
                }
            }
            pkg.print("==============================================");
            if (c === 0) {
                pkg.warn("No test case to be run was found");
            }
            else {
                if (sk > 0) {
                    pkg.warn("" + sk + " test cases have been skipped");
                }

                if (err === 0) {
                    pkg.print((sk === 0 ? "ALL (" + c  + ")" : c) + " test cases have passed successfully");
                }
                else {
                    pkg.error("" + err  + " test cases have failed");
                }

                if (err > 0) {
                    throw new Error("" + err + " test case(s) have failed");
                }
            }
        }
        finally {
            pkg.$out = pout;
        }
    };

    pkg.$annotate = function (clazz, callback) {
        var methodName = pkg.$FN(callback);

        if (typeof clazz.prototype[methodName] !== 'function') {
            throw new Error("Method '" + methodName + "' not found");
        }

        var m = clazz.prototype[methodName];
        if (typeof m.$watched !== 'undefined') {
            throw new Error("Method '" + methodName + "' is already annotated");
        }

        clazz.prototype[methodName] = function() {
            var o = new Object(), t = this, a = Array.prototype.slice.call(arguments);
            o.method = m;
            o.args   = a;
            o.call = function() {
                return m.apply(t, a);
            };
            return callback.call(this, o);
        };

        clazz.prototype[methodName].$watched = m;
    };

})(zebra, zebra.Class);
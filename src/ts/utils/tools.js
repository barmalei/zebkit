(function(pkg, Class) {
    if (typeof console === "undefined" ) {
        console = {
            log  : function() {
                return print.apply(this, arguments);
            }
        };
    }

    pkg.assume = function(c, er, lab) {
        if (c !== er) pkg.warn("Wrong assumption " + (lab ? "'" + lab + "'":"") + " evaluated = '" + c  + "' expected = '" + er + "'");
    };

    pkg.obj2str = function(v, shift) {
        if (typeof shift === "undefined") shift = "";

        if (v == null || zebkit.isNumber(v) || zebkit.isBoolean(v) || zebkit.isString(v)) {
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
            if (v.hasOwnProperty(k) && k[0] != '$') {
                s.push("\n  " + shift + k + " = " + pkg.obj2str(v[k], shift + "  "));
            }
        }
        s.push("\n", shift, "}");
        return s.join('');
    };

    pkg.runTests = function() {
        var out = pkg.$out, c = 0,  err = 0, sk = 0, title = null;
        if (pkg.isInBrowser) {
            out = new pkg.HtmlOutput();
        }

        var args = Array.prototype.slice.call(arguments);
        if (args.length > 0 && zebkit.isString(args[0])) {
            title = args.shift();
        }

        // validate arguments
        for(var i = 0; i < args.length; i++) {
            var f = args[i];
            if (typeof f !== "function") {
                throw new Error("Test case has to be function");
            }
        }

        out.print("Running " + args.length + " test cases "  + (title !== null? "from '" + title + "' test suite" : "") + " :");
        out.print("==============================================");
        if (typeof zebkit.util.Runner !== "undefined" && pkg.$useSyncTest != true) {
            var runner = new zebkit.util.Runner();

            for(var i = 0; i < args.length; i++) {
                var f = args[i], k = pkg.$FN(f);

                // if some of usea cases already genereated error
                // we should not start new test cases since it
                // will override faieled test case name
                if (runner.$error != null) {
                    break;
                }

                if (k.indexOf("_") === 0) {
                    out.warn("? " + k + " (remove leading '_' to enable '" + k + "' test case)");
                    sk++;
                }
                else {
                    (function(f, k) {
                        runner.$currentTestCase = k;

                        // put call back function in context of runner
                        // async test cases has to perfrom testing
                        // with the function
                        runner.assertCallback = function(f) {
                            var notify = this.join(), $this = this;
                            return function() {
                                try {
                                    runner.$currentTestCase = k;
                                    f.apply(this, arguments);
                                    notify.call($this);
                                }
                                catch(e) {
                                    $this.fireError(e);
                                }
                            }
                        };

                        runner.run(function() {
                            c++ ;
                            f.call(this);
                        })
                        .
                        run(function() {
                            out.print("+ " + k);
                        });
                    })(f, k);
                }
            }

            runner.run(function() {
                out.print("==============================================");
                if (c === 0) {
                    out.warn("No test case to be run was found");
                }
                else {
                    if (sk > 0) {
                        out.warn("" + sk + " test cases have been skipped");
                    }

                    out.print((sk === 0 ? "ALL (" + c  + ")" : c) + " test cases have passed successfully");
                }
            });

            runner.error(function(e) {
                if (e instanceof AssertionError) {
                    out.error("- " + this.$currentTestCase + " || " + e.message);
                }
                else {
                    out.error("" + this.$currentTestCase + " (unexpected error) " + (e.stack ? e.stack : e));
                    console.log("" + e.stack);
                }

                this.$currentTestCase = null;
            });

        }
        else {
            for(var i = 0; i < args.length; i++) {
                var f = args[i], k = pkg.$FN(f);

                try {
                    if (k.indexOf("_") === 0) {
                        out.warn("? " + k + " (remove leading '_' to enable '" + k + "' test case)");
                        sk++;
                    }
                    else {
                        c++;
                        f();
                        out.print("+ " + k);
                    }
                }
                catch(e) {
                    err++;
                    if (e instanceof AssertionError) {
                        out.error("- " + k + " || " + e.message);
                    }
                    else {
                        out.error("" + k + " (unexpected error) " + (e.stack ? e.stack : e));
                        console.log("" + e.stack);
                        throw e;
                    }
                }
            }

            out.print("==============================================");
            if (c === 0) {
                out.warn("No test case to be run was found");
            }
            else {
                if (sk > 0) {
                    out.warn("" + sk + " test cases have been skipped");
                }

                if (err === 0) {
                    out.print((sk === 0 ? "ALL (" + c  + ")" : c) + " test cases have passed successfully");
                }
                else {
                    out.error("" + err  + " test cases have failed");
                }

                if (err > 0) {
                    throw new Error("" + err + " test case(s) have failed");
                }
            }
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

})(zebkit, zebkit.Class);
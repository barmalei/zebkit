
if (typeof(zebra) === "undefined") {
    load(arguments[0] + '/src/easyoop.js');
    load(arguments[0] + '/src/tools.js');
    load(arguments[0] + '/src/util.js');
    load(arguments[0] + '/src/io.js');
}

var assert = zebra.assert, Class = zebra.Class,
    assertException = zebra.assertException,
    assertFDefined = zebra.assertFDefined,
    Runner = zebra.util.Runner;


zebra.$useSyncTest = true;

zebra.runTests("Runner tests",
    function test_runner_state() {
        var runner = new Runner();
        assert(runner.$tasks.length, 0);
        assert(runner.$busy, 0);
        assert(runner.$results.length, 0);
        assert(runner.$error, null);
    },

    function test_sync_run() {
        var runner     = new Runner(),
            runCounter = 0,
            err        = [];

        runner.run(function() {
            try {
                assertFDefined(this, "join");
                assert(arguments.length, 0);
                assert(runner.$results.length, 0);
                assert(runner.$error, null);
            }
            catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            return 10;
        })
        .
        run(function() {
            try {
                assert(runner.$results.length, 0);
                assertFDefined(this, "join");
                assert(arguments.length, 1);
                assert(arguments[0], 10);
                assert(runner.$error, null);
            }
            catch(e) {
                err.push(e);
                throw e;
            }
            runCounter ++;
            return [ 20, 30, 40 ];
        })
        .
        run(function() {
            try {
                assert(runner.$results.length, 0);
                assertFDefined(this, "join");
                assert(arguments.length, 1);
                assert(arguments[0][0], 20);
                assert(arguments[0][1], 30);
                assert(arguments[0][2], 40);
                assert(runner.$error, null);
            }
            catch(e) {
                err.push(e);
                throw e;
            }
            runCounter++;
        })
        .
        run(function() {
            try {
                assert(runner.$results.length, 0);
                assertFDefined(this, "join");
                assert(arguments.length, 0);
                assert(runner.$error, null);
            }
            catch(e) {
                err.push(e);
                throw e;
            }
            runCounter++;
        });

        if (err.length > 0) {
            throw err.shift();
        }

        assert(runner.$error, null);
        assert(runCounter, 4);
    },

    function test_run_exception() {
        var runner = new Runner(),
            runCounter = 0,
            err = [];

        function validateEndState(b) {
            assert(runner.$tasks.length, 0, "not all tasks have been completed/skipped");
            assert(runner.$busy, 0);
            assert(runner.$error != null, b);
        }

        // exception has occured in first task
        // second task has to be skipped
        runner.run(function() {
            try {
                assert(runner.$results.length, 0);
                assertFDefined(this, "join");
                assert(arguments.length, 0);
            }
            catch(e) {
                err.push(e);
                throw e;
            }
            runCounter++;
            throw new Error();
            return 10;
        })
        .
        run(function() {
            try {
                assert(runner.$results.length, 0);
            }
            catch(e) {
                err.push(e);
                throw e;
            }
            throw new Error("Don't have to be called");
        });

        if (err.length > 0) throw err.shift();
        validateEndState(true);
        assert(runCounter, 1);


        // exception has occured in second task
        runCounter = 0;
        runner = new Runner()
        err = [];

        runner.run(function() {
            try {
                assert(runner.$results.length, 0);
                assertFDefined(this, "join");
                assert(arguments.length, 0);
            }
            catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            return 10;
        })
        .
        run(function() {
            try {
                assert(runner.$results.length, 0);
                assertFDefined(this, "join");
                assert(arguments.length, 1);
            }
            catch(e) {
                err.push(e);
                throw e;
            }
            runCounter++;
            throw new Error();
        });

        if (err.length > 0) throw err.shift();
        validateEndState(true);
        assert(runCounter, 2);

        // exception has occured in the second task
        // error method has to ve called
        runCounter = 0;
        runner = new Runner();
        err = [];

        runner.run(function() {
            try {
                assert(runner.$results.length, 0);
                assertFDefined(this, "join");
                assert(arguments.length, 0);
            }
            catch(e) {
                err.push(e);
                throw e;
            }
            runCounter++;
            return 10;
        })
        .
        run(function() {
            try {
                assert(runner.$results.length, 0);
                assertFDefined(this, "join");
                assert(arguments.length, 1);
            }
            catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            throw new Error();
        })
        .
        error(function(e) {
            assert(runner.$results.length, 0);
            assert(e instanceof Error, true);
            assert(this.$error != null, true);
            assert(this.$error, e);
            assert(this.$tasks.length, 0);
            assert(this.$busy, 0);
            runCounter++;
        });

        if (err.length > 0) throw err.shift();
        validateEndState(false);
        assert(runCounter, 3);

        // no exception has occured
        // error method doesn't have to be called
        runCounter = 0;
        runner = new Runner();
        err    = [];

        runner.run(function() {
            try {
                assertFDefined(this, "join");
                assert(arguments.length, 0);
            }
            catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            return 10;
        })
        .
        run(function() {
            try {
                assertFDefined(this, "join");
                assert(arguments.length, 1);
            }
            catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
        })
        .
        error(function(e) {
            throw new Error("Don't have to be called");
        });

        if (err.length > 0) throw err.shift();
        validateEndState(false);
        assert(runCounter, 2);

        // no exception has occured
        // error method doesn't have to be called
        // sunsequent tasks have to be called
        runCounter = 0;
        runner = new Runner();
        err = [];

        runner.run(function() {
            try {
                assert(runner.$results.length, 0);
                assertFDefined(this, "join");
                assert(arguments.length, 0);
            }
            catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            return 10;
        })
        .
        run(function() {
            try {
                assert(runner.$results.length, 0);
                assertFDefined(this, "join");
                assert(arguments.length, 1);
            }
            catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
        })
        .
        error(function(e) {
            throw new Error("Don't have to be called");
        })
        .
        run(function() {
            try {
                assert(runner.$results.length, 0);
                assertFDefined(this, "join");
                assert(arguments.length, 0);
            }
            catch(e) {
                err.push(e);
                throw e;
            }
            runCounter++;
        })
        .
        error(function(e) {
            throw new Error("Don't have to be called");
        });

        if (err.length > 0) throw err.shift();
        validateEndState(false);
        assert(runCounter, 3);


        // two exceptions have to trigger two error handlers execution
        runCounter = 0;
        runner = new Runner();
        err = [];

        runner.run(function() {
            try {
                assert(runner.$results.length, 0);
                assertFDefined(this, "join");
                assert(arguments.length, 0);
            }
            catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            return 10;
        })
        .
        run(function() {
            try {
                assert(runner.$results.length, 0);
                assertFDefined(this, "join");
                assert(arguments.length, 1);
            }
            catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            throw new Error();
        })
        .
        error(function(e) {
            runCounter++;
        })
        .
        run(function() {
            try {
                assert(runner.$results.length, 0);
                assertFDefined(this, "join");
                assert(arguments.length, 0);
            }
            catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            throw new Error();
        })
        .
        error(function(e) {
            runCounter++;
        });

        if (err.length > 0) throw err.shift();
        validateEndState(false);
        assert(runCounter, 5);


        // error initated by ctx method with error handler
        runCounter = 0;
        runner = new Runner();
        err = [];

        runner.run(function() {
            try {
                assert(runner.$results.length, 0, "result is cleaned");
                assertFDefined(this, "join", "join is defined");
                assert(arguments.length, 0, "no arguments");
            }
            catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            return 10;
        })
        .
        run(function() {
            try {
                assert(runner.$results.length, 0, "resukt is cleaned");
                assert(arguments.length, 1, "one argument presents");
                assert(arguments[0], 10, "argument is 10");
            }
            catch(e) {
                err.push(e);
                throw e;
            }

            this.fireError(new Error());

            try {
                assert(runner.$results.length, 0, "resukt is cleaned");
                assert(runner.$error != null, true);
                assert(runner.$busy, 0);
            }
            catch(e) {
                err.push(e);
                throw e;
            }


            runCounter++;
        })
        .
        run(function() {
            runCounter++;
            throw new Error("Don't have to be called");
        })
        .
        error(function(e) {
            runCounter+=10;
        })

        if (err.length > 0) throw err.shift();
        validateEndState(false);
        assert(runCounter, 12);


        // error initated by ctx method with error handler
        runCounter = 0;
        runner     = new Runner();
        err        = [];

        runner.run(function() {
            try {
                assert(this.$results.length, 0);
                assert(this.$busy, 0);
                assert(this.$tasks.length, 0);
            }
            catch(e) {
                err.push(e);
                throw e;
            }

            var e = new Error("1")
            this.fireError(e);
            this.fireError(new Error("2"));

            try {
                assert(this.$error != null, true);
                assert(this.$error, e);
                assert(this.$busy, 0);
                assert(this.$results.length, 0);
            }
            catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            return 100;
        })
        .
        run(function() {
            runCounter++;
            return 100;
        });

        if (err.length > 0) throw err.shift();
        validateEndState(true);
        assert(runCounter, 1);
    },

    function asyn_run_test() {
        if (zebra.isInBrowser) {

            var runCounter = 0,
                runner     = new Runner(),
                err        = [];

            runner.run(function() {
                zebra.io.GET("t1.txt", this.join());
                zebra.io.GET("t2.txt", this.join());
                runCounter++;
            })
            .
            run(function(r1, r2) {
                try {
                    assert(runner.$results.length, 0, "async result is zero");
                    assert(arguments.length, 2, "two arguments are expected");
                    assert(r1.responseText, "hello");
                    assert(r2.responseText, "hello2");
                }
                catch(e) {
                    err.push(e);
                    throw e;
                }
                runCounter++;
            })
            .
            run(function() {
                try {
                    assert(runner.$results.length, 0, "No arguments");
                    assert(runCounter, 2);
                }
                catch(e) {
                    err.push(e);
                    throw e;
                }
            })
            .
            error(function(e) {
                if (err.length > 0) throw err.shift();
            });


            var runner22 = new Runner();
            runner22._counter = 0;
            runner22._err = [];

            runner.run(function() {
                zebra.io.GET("t1.txt", this.join());
                runCounter++;
            })
            .
            run(function(r1) {
                try {
                    assert(runner22.$results.length, 0);
                    assert(arguments.length, 1);
                    assert(r1.responseText, "hello");
                }
                catch(e) {
                    runner22._err.push(e);
                    throw e;
                }
                runCounter++;
            })


            var runner2 = new Runner();
            runner2._counter = 0;
            runner2._err = [];

            runner2.run(function() {
                err = [];
                zebra.io.GET("t1.txt", this.join());
                zebra.io.GET("t22.txt", this.join());
                runner2._counter++
            })
            .
            run(function(r1, r2) {
                try {
                    assert(runner2.$results.length, 0);
                    assert(arguments.length, 2);
                    assert(r1.responseText, "hello");
                    assert(r1.status, 200);
                    assert(r2.status, 404);
                }
                catch(e) {
                    runner2._err.push(e);
                    throw e;
                }

                if (r1.status != 200) {
                    throw new Error("Bad response code");
                }

                if (r2.status != 200) {
                    throw new Error("Bad response code");
                }

                runner2._counter++;
            })
            .
            error(function(e) {
                if (runner2._err.length > 0) throw runner2._err.shift();
                assert(runner2._counter, 1);
            })
            .
            run(function() {
                try {
                    assert(runner2.$results.length, 0);
                    assert(runner2._counter, 1);
                }
                catch(e) {
                    runner2._err.push(e);
                    throw e;
                }
            })
            .
            error(function(e) {
                assert(runner2.$results.length, 0);
                if (runner2._err.length > 0) throw runner2._err.shift();
            });



            var runner3 = new Runner();
            runner3._counter = 0;
            runner3._err = [];

            runner3.run(function() {
                err = [];
                zebra.io.GET("t1.txt", this.join());
                zebra.io.GET("t2.txt", this.join());
                runner3._counter++
            })
            .
            run(function(r1, r2) {
                try {
                    assert(runner3.$results.length, 0);
                    assert(runner3._counter, 1);
                    assert(arguments.length, 2);
                    assert(r1.responseText, "hello");
                    assert(r2.responseText, "hello2");
                }
                catch(e) {
                    runner3._err.push(e);
                    throw e;
                }

                zebra.io.GET("t3.txt", this.join());
                runner3._counter++;
            })
            .
            run(function(r3) {
                try {
                    assert(runner3.$results.length, 0);
                    assert(runner3._counter, 2);
                    assert(arguments.length, 1);
                    assert(r3.responseText, "hello3");
                }
                catch(e) {
                    runner3._err.push(e);
                    throw e;
                }
                runner3._counter++;
            })
            .
            error(function(e) {
                if (runner3._err.length > 0) throw runner3._err.shift();
                assert(runner3.$results.length, 0);
                assert(runner3._counter, 3);
            });
        }
    }
);

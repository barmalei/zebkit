
if (typeof(zebkit) === "undefined") {
    require('../build/easyoop.js');
    require('../src/js/misc/tools.js');
}

zebkit.require(function() {

if (typeof(XMLHttpRequest) === 'undefined') {
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
}

function GET(url, rn) {
    var jn  = rn.join(),
        xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status >= 400) {
                rn.error(new Error("HTTP error " + this.status + ", " + url), false);
            } else {
                jn.call(rn, this);
            }
        }
    };

    try {
        xhr.open("GET", url);
    } catch(e) {
        zebkit.dumpError(e);
        rn.error(e);
    }

    xhr.send();
}

var assert = zebkit.assert,
    Class = zebkit.Class,
    assertException = zebkit.assertException,
    assertObjEqual = zebkit.assertObjEqual,
    assertFDefined = zebkit.assertFDefined,
    DoIt = zebkit.DoIt;


zebkit.$useSyncTest = false;

zebkit.runTests("DoIt tests",
    function test_runner_state() {
        var runner = new DoIt();
        assert(runner.$tasks.length, 0);
        assert(runner.$busy, 0);
        assert(runner.$results.length, 0);
        assert(runner.$error, null);
    },

    function test_sync_run() {
        var runner     = new DoIt(),
            runCounter = 0,
            err        = [];

        runner.then(function() {
            try {
                assertFDefined(this, "join", "Assert 1");
                assert(arguments.length, 0, "Assert 2");
                assert(runner.$results.length, 1, "Assert 3");
                assert(runner.$error, null, "Assert 4");
            } catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            return 10;
        }).then(function(r) {
            try {
                assert(runner.$results.length, 1, "Assert 5");
                assertFDefined(this, "join", "Assert 6");
                assert(arguments.length, 1, "Assert 7");
                assert(arguments[0], 10, "Assert 8");
                assert(r, 10, "Assert 81");
                assert(runner.$error, null, "Assert 9");
            } catch(e) {
                err.push(e);
                throw e;
            }
            runCounter ++;
            return [ 20, 30, 40 ];
        }).then(function() {
            try {
                assert(runner.$results.length, 1, "Assert 10");
                assertFDefined(this, "join", "Assert 11");
                assert(arguments.length, 1, "Assert 12");
                assert(arguments[0][0], 20, "Assert 13");
                assert(arguments[0][1], 30, "Assert 14");
                assert(arguments[0][2], 40, "Assert 15");
                assert(runner.$error, null, "Assert 16");
            } catch(e) {
                err.push(e);
                throw e;
            }
            runCounter++;
        }).then(function() {
            try {
                assert(runner.$results.length, 1, "Assert 17");
                assertFDefined(this, "join", "Assert 18");
                assert(arguments.length, 0, "Assert 19");
                assert(runner.$error, null, "Assert 20");
            } catch(e) {
                err.push(e);
                throw e;
            }
            runCounter++;
        });

        if (err.length > 0) {
            throw err.shift();
        }

        assert(runner.$error, null, "Assert 21");
        assert(runCounter, 4, "Assert 22");
        assert(runner.$tasks.length, 0, "Assert 221");
    },

    function test_run_exception() {
        var runner = new DoIt(),
            runCounter = 0,
            err = [];

        function validateEndState(b, sub) {
            assert(runner.$tasks.length, 0, "not all tasks have been completed/skipped", "Assert 23." + sub);
            assert(runner.$busy, 0, "Assert 24." + sub);
  //          assert(runner.$error != null, b, "Assert 25." + sub);
        }

        // exception has occurred in first task
        // second task has to be skipped
        runner.then(function() {
            try {
                assert(runner.$results.length, 1, "Assert 26");
                assertFDefined(this, "join", "Assert 27");
                assert(arguments.length, 0, "Assert 28");
            } catch(e) {
                err.push(e);
                throw e;
            }
            runCounter++;
            throw new Error();
            return 10;
        }).then(function() {
            try {
                assert(runner.$results.length, 1, "Assert 29");
            } catch(e) {
                err.push(e);
                throw e;
            }
            throw new Error("Don't have to be called");
        });

        if (err.length > 0) throw err.shift();
        validateEndState(true, "1");
        assert(runCounter, 1, "Assert 291");
        assert(runner.$tasks.length, 0, "Assert 292");


        // exception has occurred in second task
        runCounter = 0;
        runner = new DoIt()
        err = [];

        runner.then(function() {
            try {
                assert(runner.$results.length, 1, "Assert 30");
                assertFDefined(this, "join", "Assert 31");
                assert(arguments.length, 0, "Assert 32");
            } catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            return 10;
        })
        .
        then(function() {
            try {
                assert(runner.$results.length, 1, "Assert 33");
                assertFDefined(this, "join", "Assert 34");
                assert(arguments.length, 1, "Assert 35");
            } catch(e) {
                err.push(e);
                throw e;
            }
            runCounter++;
            throw new Error();
        });

        if (err.length > 0) throw err.shift();
        validateEndState(true, "2");
        assert(runCounter, 2, "Assert 36");
        assert(runner.$tasks.length, 0, "Assert 361");

        // exception has occured in the second task
        // error method has to ve called
        runCounter = 0;
        runner = new DoIt();
        err = [];

        runner.then(function() {
            try {
                assert(runner.$results.length, 1, "Assert 37");
                assertFDefined(this, "join", "Assert 38");
                assert(arguments.length, 0, "Assert 39");
            } catch(e) {
                err.push(e);
                throw e;
            }
            runCounter++;
            return 10;
        })
        .
        then(function() {
            try {
                assert(runner.$results.length, 1, "Assert 40");
                assertFDefined(this, "join", "Assert 41");
                assert(arguments.length, 1, "Assert 42");
            } catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            throw new Error();
        }).catch(function(e) {
            try {
                assert(runner.$results.length, 0, "Assert 43");
                assert(e instanceof Error, true, "Assert 44");
                assert(this.$error != null, true, "Assert 45");
                assert(this.$error, e, "Assert 46");
                assert(this.$tasks.length, 0, "Assert 47");
                assert(this.$busy, 0, "Assert 48");
            } catch (e) {
                err.push(e);
                throw e;
            }
            runCounter++;
        });

        if (err.length > 0) throw err.shift();
        validateEndState(false, "3");
        assert(runCounter, 3, "Assert 49");
        assert(runner.$tasks.length, 0, "Assert 491");

        // no exception has occured
        // error method doesn't have to be called
        runCounter = 0;
        runner = new DoIt();
        err    = [];

        runner.then(function() {
            try {
                assertFDefined(this, "join", "Assert 50");
                assert(arguments.length, 0, "Assert 51");
            } catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            return 10;
        }).then(function() {
            try {
                assertFDefined(this, "join", "Assert 52");
                assert(arguments.length, 1, "Assert 53");
            } catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
        }).catch(function(e) {
            runCounter++;
            throw new Error("Don't have to be called");
        });

        if (err.length > 0) throw err.shift();
        validateEndState(false, "4");
        assert(runCounter, 2, "Assert 54");
        assert(runner.$tasks.length, 0, "Assert 541");

        // no exception has occurred
        // error method doesn't have to be called
        // subsequent tasks have to be called
        runCounter = 0;
        runner = new DoIt();
        err = [];

        runner.then(function() {
            try {
                assert(runner.$results.length, 1, "Assert 55");
                assertFDefined(this, "join", "Assert 56");
                assert(arguments.length, 0, "Assert 57");
            } catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            return 10;
        }).then(function() {
            try {
                assert(runner.$results.length, 1, "Assert 58");
                assertFDefined(this, "join", "Assert 59");
                assert(arguments.length, 1, "Assert 60");
            } catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
        }).catch(function(e) {
            runCounter++;
            throw new Error("Don't have to be called");
        }).then(function() {
            try {
                assert(runner.$results.length, 1, "Assert 61");
                assertFDefined(this, "join", "Assert 62");
                assert(arguments.length, 0, "Assert 63");
            } catch(e) {
                err.push(e);
                throw e;
            }
            runCounter++;
        }).catch(function(e) {
            runCounter++;
            throw new Error("Don't have to be called");
        });

        if (err.length > 0) throw err.shift();
        validateEndState(false, "5");
        assert(runCounter, 3, "Assert 64");
        assert(runner.$tasks.length, 0, "Assert 641");


        // two exceptions have to trigger two error handlers execution
        runCounter = 0;
        runner = new DoIt();
        err = [];

        runner.then(function() {
            try {
                assert(runner.$results.length, 1, "Assert 65");
                assert(runner.$results[0].length, 0, "Assert 651");
                assertFDefined(this, "join", "Assert 66");
                assert(arguments.length, 0, "Assert 67");
            } catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            return 10;
        }).then(function() {
            try {
                assert(runner.$results.length, 1, "Assert 68");
                assert(runner.$results[0].length, 0, "Assert 681");
                assertFDefined(this, "join", "Assert 69");
                assert(arguments.length, 1, "Assert 70");
            } catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            throw new Error();
        }).catch(function(e) {
            runCounter++;
            this.$error = null;
        }).then(function() {
            try {
                assert(runner.$results.length, 1, "Assert 71");
                assertFDefined(this, "join", "Assert 72");
                assert(arguments.length, 0, "Assert 73");
            } catch(e) {
                err.push(e);
                throw e;
            }
            runCounter++;
            throw new Error();
        }).catch(function(e) {
            runCounter++;
        });

        if (err.length > 0) {
            throw err.shift();
        }

        validateEndState(false, "6");
        assert(runCounter, 5, "Assert 731");
        assert(runner.$tasks.length, 0, "Assert 732");


        // error initiated by ctx method with error handler
        runCounter = 0;
        runner = new DoIt();
        err = [];

        runner.then(function() {
            try {
                assert(runner.$results.length, 1, "result is cleaned");
                assert(runner.$results[0].length, 0, "result is cleaned");
                assertFDefined(this, "join", "join is defined");
                assert(arguments.length, 0, "no arguments");
            } catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            return 10;
        }).then(function() {
            try {
                assert(runner.$results.length, 1, "result is cleaned");
                assert(arguments.length, 1, "one argument presents");
                assert(arguments[0], 10, "argument is 10");
            } catch(e) {
                err.push(e);
                throw e;
            }

            this.error(new Error());

            try {
                assert(runner.$results.length, 0, "result is cleaned");
                assert(runner.$error != null, true, "assert  772");
                assert(runner.$busy, 0, "assert  773");
            } catch(e) {
                err.push(e);
                throw e;
            }


            runCounter++;
        }).then(function() {
            runCounter++;
            throw new Error("Don't have to be called");
        }).catch(function(e) {
            runCounter+=10;
        })

        if (err.length > 0) throw err.shift();
        validateEndState(false, "7");
        assert(runCounter, 12, "assert  774");
        assert(runner.$tasks.length, 0, "Assert 7741");


        // error initiated by ctx method with error handler
        runCounter = 0;
        runner     = new DoIt();
        err        = [];

        runner.then(function() {
            try {
                assert(this.$results.length, 1, "assert  775");
                assert(this.$results[0].length, 0, "assert  7751");
                assert(this.$busy, 0, "assert  776");
                assert(this.$tasks.length, 0, "assert  777");
            } catch(e) {
                err.push(e);
                throw e;
            }

            var e = new Error("1");
            this.error(e);
            this.error(new Error("Test double error: firing error second time should not clean prev error but dump it"), false);

            try {
                assert(this.$error != null, true, "assert  778");
                assert(this.$error, e, "assert  779");
                assert(this.$busy, 0, "assert  780");
                assert(this.$results.length, 0, "assert  781");
            } catch(e) {
                err.push(e);
                throw e;
            }

            runCounter++;
            return 100;
        }).then(function() {
            runCounter++;
            return 100;
        });

        if (err.length > 0) throw err.shift();
        validateEndState(true, "8");
        assert(runCounter, 1, "assert  782");
        assert(runner.$tasks.length, 0, "Assert 783");
    },

    function test_asyn() {
        var runCounter = 0,
            runner     = new DoIt(),
            err        = [];

        runner.then(function() {
            GET("http://localhost:8090/tests/t1.txt", this);
            GET("http://localhost:8090/tests/t2.txt", this);
            runCounter++;
        }).then(function(r1, r2) {
            try {
                assert(runner.$results.length, 1, "async result is zero");
                assert(arguments.length, 2, "two arguments are expected");
                assert(r1.responseText, "hello", "Expected first result");
                assert(r2.responseText, "hello2", "Expected second result");
            } catch(e) {
                err.push(e);
                throw e;
            }
            runCounter++;
        }).then(function() {
            try {
                assert(runner.$results.length, 1, "No arguments");
                assert(runCounter, 2);
            } catch(e) {
                err.push(e);
                throw e;
            }
        }).catch(function(e) {
            zebkit.dumpError(e);
            if (err.length > 0) throw err.shift();
        }).then(function() {
            //assert(this.$tasks.length, 0, "Test tasks length");
        });


        var runner22 = new DoIt();
        runner22._counter = 0;
        runner22._err = [];

        runner.then(function() {
            GET("http://localhost:8090/tests/t1.txt", this);
            runCounter++;
        }).then(function(r1) {
            try {
                assert(runner22.$results.length, 0,  "Assert 74");
                assert(arguments.length, 1,  "Assert 75");
                assert(r1.responseText, "hello",  "Assert 76");
            }
            catch(e) {
                runner22._err.push(e);
                throw e;
            }
            runCounter++;
        }).catch(function(e) {
            console.log("" + e);
        });


        var runner2 = new DoIt();
        runner2._counter = 0;
        runner2._err = [];

        runner2.then(function() {
            err = [];
            GET("http://localhost:8090/tests/t1.txt", this);
            GET("http://localhost:8090/tests/t22.txt", this);
            runner2._counter++
        }).then(function(r1, r2) {
            try {
                assert(runner2.$results.length, 1,   "Assert 77");
                assert(arguments.length, 2,  "Assert 78");
                assert(r1.responseText, "hello",  "Assert 79");
                assert(r1.status, 200,  "Assert 80");
                assert(r2.status, 404,  "Assert 81");
            } catch(e) {
                runner2._err.push(e);
                throw e;
            }

            runner2._counter++;
        }).catch(function(e) {
            if (runner2._err.length > 0) {
                throw runner2._err.shift();
            }
            assert(runner2._counter, 1);
        }).then(function() {
            try {
                assert(runner2.$results.length, 0,  "Assert 82");
                assert(runner2._counter, 1,  "Assert 83");
            } catch(e) {
                runner2._err.push(e);
                throw e;
            }
        }).catch(function(e) {
            assert(runner2.$results.length, 0,  "Assert 84");
            if (runner2._err.length > 0) throw runner2._err.shift();
        });

        var runner3 = new DoIt();
        runner3._counter = 0;
        runner3._err = [];

        runner3.then(function() {
            err = [];
            GET("http://localhost:8090/tests/t1.txt", this);
            GET("http://localhost:8090/tests/t2.txt", this);
            runner3._counter++
        }).then(function(r1, r2) {
            try {
                assert(runner3.$results.length, 1,  "Assert 85");
                assert(runner3._counter, 1,  "Assert 86");
                assert(arguments.length, 2,  "Assert 87");
                assert(r1.responseText, "hello",  "Assert 88");
                assert(r2.responseText, "hello2",  "Assert 89");
            }
            catch(e) {
                runner3._err.push(e);
                throw e;
            }

            GET("http://localhost:8090/tests/t3.txt", this);
            runner3._counter++;
        }).then(function(r3) {
            try {
                assert(runner3.$results.length, 1,  "Assert 90");
                assert(runner3._counter, 2,  "Assert 91");
                assert(arguments.length, 1,  "Assert 92");
                assert(r3.responseText, "hello3",  "Assert 93");
            }
            catch(e) {
                runner3._err.push(e);
                throw e;
            }
            runner3._counter++;
        }).catch(function(e) {
            zebkit.dumpError(e);
            if (runner3._err.length > 0) throw runner3._err.shift();
            assert(runner3.$results.length, 0,  "Assert 94");
            assert(runner3._counter, 3,  "Assert 95");
        });
    },

    function test_embeding() {
        var r = new DoIt(), seq = [];

        r.then(function() {
            seq.push("1");
            this.then(function() {
                seq.push("1.1");
                return "a";
            }).then(function(r) {
                seq.push("1.2");
                assert(r, "a", "Test test_embeding 1");
                assert(arguments.length, 1, "Test test_embeding 2");
                this.then(function() {
                    seq.push("1.2.1");

                    this.then(function() {
                        seq.push("1.2.1.1");
                        return "b";
                    }).then(function(r) {
                        seq.push("1.2.1.2");
                        assert(r, "b", "Test test_embeding 3");
                        assert(arguments.length, 1, "Test test_embeding 4");
                        this.then(function() {
                            seq.push("1.2.1.2.1");
                        });
                    });

                    return "c";
                }).then(function (r) {
                    assert(r, "c", "Test test_embeding 5");
                    seq.push("1.2.2");
                });
            });
            return 10;
        }).then(function(r) {
            seq.push("2");
            assert(r, 10, "Test test_embeding 6");
            assert(arguments.length, 1, "Test test_embeding 7");

            this.then(function() {
                seq.push("2.1");
                assert(arguments.length, 0, "Test test_embeding 8");
                return 100;
            }).then(function(r) {
                seq.push("2.2");
                assert(arguments.length, 1, "Test test_embeding 9");
                assert(r, 100, "Test test_embeding 10");
            });

            var jn1 = this.join();
            var jn2 = this.join();
            jn1.call(this, 555, 554);
            jn2.call(this, 556);

        }).then(function(r1, r2, r3) {
            seq.push("3");
            assert(r1, 555, "Test test_embeding 11");
            assert(r2, 554, "Test test_embeding 12");
            assert(r3, 556, "Test test_embeding 13");
            assert(arguments.length, 3);

            this.then(function() {
                seq.push("3.1");
                assert(arguments.length, 0, "Test test_embeding 14");
            }).then(function() {
                 seq.push("3.2");
                 this.then(function() {
                    seq.push("3.2.1");
                 }).then(function() {
                    seq.push("3.2.2");
                    this.then(function() {
                        seq.push("3.2.2.1");
                    });
                 });
            }).then(function() {
                 seq.push("3.3");
            });

        }).catch(function(e) {
            zebkit.dumpError(e);
        });


        zebkit.assertObjEqual(seq, [
            "1",
                "1.1",
                "1.2",
                "1.2.1",
                    "1.2.1.1",
                    "1.2.1.2",
                        "1.2.1.2.1",
                "1.2.2",
            "2",
                "2.1",
                "2.2",
            "3",
                "3.1",
                "3.2",
                    "3.2.1",
                    "3.2.2",
                        "3.2.2.1",
                "3.3"
        ], "Correct sequence 1");

        assert(r.$tasks.length, 0,"Test test_embeding 15");
        assert(r.$error, null, "Test test_embeding 16");
        for(var i = 0; i < r.$results.length; i++) {
            assert(r.$results[i].length, 0, "Test test_embeding 17." + i);
        }
    },

    function test_embeding_async() {
        var r = new DoIt(), seq = [];

        r.then(function() {
            seq.push("1");
            this.then(function() {
                seq.push("1.1");
                GET("http://localhost:8090/tests/t1.txt", this);
                assert(arguments.length, 0);
            }).then(function(r) {
                seq.push("1.2");
                assert(arguments.length, 1);
                assert(r.responseText, "hello", "Test test_embeding 1");
                this.then(function() {
                    seq.push("1.2.1");
                    GET("http://localhost:8090/tests/t2.txt", this);
                    this.then(function(r) {
                        GET("http://localhost:8090/tests/t1.txt", this);
                        seq.push("1.2.1.1");
                    }).then(function(r) {
                        seq.push("1.2.1.2");
                        assert(arguments.length, 1);
                        assert(r.responseText, "hello", "Test test_embeding 2");
                        this.then(function() {
                            seq.push("1.2.1.2.1");
                        });
                    });

                    return "c";
                }).then(function(r) {
                    seq.push("1.2.2");
                    assert(arguments.length, 1);
                    assert(r.responseText, "hello2", "Test test_embeding 2");
                });
            });
            return 10;
        }).then(function(r) {
            seq.push("2");
            assert(r, 10, "Test test_embeding 4");
            this.then(function() {
                seq.push("2.1");
                assert(arguments.length, 0);
                return 100;
            }).then(function(r) {
                seq.push("2.2");
                assert(r, 100, "Test test_embeding 5");
                assert(arguments.length, 1);
                var jn1 = this.join();
                var jn2 = this.join();
                jn1.call(this, 1,2,3);
                jn2.call(this, 5,6);
            }).then(function(r1, r2, r3, r4, r5) {
                assert(arguments.length, 5);
                assert(r1, 1);
                assert(r2, 2);
                assert(r3, 3);
                assert(r4, 5);
                assert(r5, 6);
                seq.push("2.3");
                GET("http://localhost:8090/tests/t1.txt", this);
                GET("http://localhost:8090/tests/t2.txt", this);
                GET("http://localhost:8090/tests/t3.txt", this);
            }).then(function(r1, r2, r3) {
                seq.push("2.4");
                assert(arguments.length, 3);
                assert(r1.responseText, "hello", "Test test_embeding 2");
                assert(r2.responseText, "hello2", "Test test_embeding 2");
                assert(r3.responseText, "hello3", "Test test_embeding 2");
            });
            return 555;
        }).then(function(r) {
            seq.push("3");

            assert(r, 555, "Test test_embeding 6");
            assert(arguments.length, 1);

            this.then(function() {
                seq.push("3.1");
                assert(arguments.length, 0);

            }).then(function() {
                seq.push("3.2");
                GET("http://localhost:8090/tests/t1.txt", this);
                assert(arguments.length, 0);

                this.then(function() {
                    seq.push("3.2.1");
                    assert(arguments.length, 0);
                    return 70;
                }).then(function(r) {
                    seq.push("3.2.2");
                    assert(r, 70);
                    assert(arguments.length, 1);
                    this.then(function() {
                        assert(arguments.length, 0);
                        seq.push("3.2.2.1");
                    });
                });
            }).then(function(r) {
                seq.push("3.3");
                assert(r.responseText, "hello", "Test test_embeding 2");
                assert(arguments.length, 1);
            });

        }).then(function() {
            assert(arguments.length, 0);
            zebkit.assertObjEqual(seq, [
                "1",
                    "1.1",
                    "1.2",
                    "1.2.1",
                        "1.2.1.1",
                        "1.2.1.2",
                            "1.2.1.2.1",
                    "1.2.2",
                "2",
                    "2.1",
                    "2.2",
                    "2.3",
                    "2.4",
                "3",
                    "3.1",
                    "3.2",
                        "3.2.1",
                        "3.2.2",
                            "3.2.2.1",
                    "3.3"
            ], "Correct sequence 1");

        }).catch(function(e) {
            zebkit.dumpError(e);
        });
    },

    function test_embbeded_error() {
        var r = new DoIt(), errIn = 0, err = null, res = [];

        r.then(function() {
            res.push("1");
            r.then(function() {
                res.push("1.1");
            }).then(function() {
                res.push("1.2");
                this.then(function() {
                    res.push("1.1.1");
                    throw new Error("err 1");
                }).catch(function(e) {
                    errIn++;
                    assert(e.toString().indexOf("err 1") >= 0, true, "test_embbeded_error 1");
                });
            }).then(function() {
                res.push("1.3");
            }).catch(function(e) {
                errIn++;
                assert(e.toString().indexOf("err 1") >= 0, true, "test_embbeded_error 2");
            });
        }).then(function() {
            res.push("1.22");
        }).catch(function(e) {
            errIn++;
            err = e;
            assert(e.toString().indexOf("err 1") >= 0, true,  "test_embbeded_error 3");
        }).catch(function(e) {
            errIn++;
            assert(e.toString().indexOf("err 1") >= 0, true,  "test_embbeded_error 4");
        });

        assert(errIn, 4, "test_embbeded_error 5");
        assert(err != null, true, "test_embbeded_error 6");
        zebkit.assertObjEqual(res, ["1", "1.1", "1.2", "1.1.1"], "test_embbeded_error 7");
    },

    function test_async_throw() {
        var r = new DoIt(), c = 0;
        r.then(function() {
            r.then(function() {
                c++;
            }).then(function() {
                c++;
                this.then(function() {
                    c++;
                    GET("http://localhost:8090/tests/t111.txt", this);
                    c++;
                });
            });
        }).then(function() {
            c++;
        });
        r.throw();
        r.catch(function(e) {
            c++;
        });

        assert(c, 4);
    },

    function test_external_join() {
        var r = new DoIt(), c = 0, cb = r.join();
        assert(r.$tasks.length, 0);

        r.then(function(r) {
            c++;
            assert(r, 323);
        });

        assert(c, 0);
        cb(323);
        assert(c, 1);

        var r = new DoIt(), c = 0, cb = r.join();
        assert(r.$tasks.length, 0);

        r.then(function(res) {
            var cbb = this.join();
            this.then(function(r) {
                assert(c, 1);
                c++;
                return 222;
            }).then(function(r) {
                c++;
                assert(r, 222);
            });

            assert(c, 0);
            assert(res, 123);
            c++;
            cbb(222);
        }).then(function(r) {
            assert(r, 222);
            c++;
        }).throw();

        assert(c, 0);
        cb(123);
        assert(c, 4);
    },

    function test_run_runner() {
        var r1 = new DoIt();
        assert(r1.$tasks.length, 0);

        var r2 = new DoIt();
        r2.then(function() {
            return 100;
        });
        assert(r2.$tasks.length, 0);

        var r3 = new DoIt();
        r3.then(function() {
            GET("http://localhost:8090/tests/t1.txt", this);
        });
        assert(r3.$tasks.length, 0);

        r1.then(function(r) {
            return 777;
        })
        .then(r3)
        .then(function(r) {
            assert(r, 777);
            assert(arguments.length, 1);
        });


        assert(r1.$tasks.length, 1); // one task that waits for r3 is expected
        assert(r3.$tasks.length, 2); // one task and catch in r3 is expected

        r3.then(function(r) {
            assert(r.status, 200);
            assert(r.responseText, "hello");
            assert(arguments.length, 1);
        }).then(function() {
            assert(arguments.length, 0);
        }).catch(function(e) {
            zebkit.dumpError(e);
            assert(e.toString(), "err");
        });
    },

    function test_join_throw() {
        var r = new DoIt();

        r.then(function() {
            var jn = this.join();
            jn();
        }).then(function() {
            throw new Error("test");
        }).catch(function(e) {
            console.log("Error has been correctly detected :" + e.toString());
        });
    },

    function test_async_error_wrong_scheduling() {
        var d = new zebkit.DoIt(), path = [];

        d.then(function() {
            path.push("0");
        }).then(function() {
            path.push("1");

            this.then(function() {
                path.push("1.1");
            });

            path.push("2");
        }).then(function() {
            path.push("3");
        }).then(function() {
            zebkit.assertObjEqual(path, ["0", "1", "2", "1.1", "3"], "test_async_error_wrong_scheduling 1");
        }).catch();


        path = [];
        var cb = this.assertCallback(function(path) {
            zebkit.assertObjEqual(path, ["0", "1", "2", "1.1", "3"], "test_async_error_wrong_scheduling 2");
        });
        d = new DoIt();
        d.then(function() {
            path.push("0");
            GET("http://localhost:8090/tests/t1.txt", this);
        }).then(function() {
            path.push("1");
            this.then(function() {
                path.push("1.1");
            })
            path.push("2");
        }).then(function() {
            path.push("3");
        }).then(function() {
            cb(path);
        });


        var path2 = [], ex = null;
        d = new DoIt();
        d.then(function() {
            path2.push("0");
        }).then(function() {
            path2.push("1");
            this.then(function() {
                path2.push("1.1");
                throw new Error("err");
            });

            path2.push("2");
        }).then(function() {
            path2.push("3");
        }).catch(function(e) {
            ex = e;
        });
        assert(ex != null, true, ex == null ? "" : ex.toString());
        zebkit.assertObjEqual(path2, ["0", "1", "2", "1.1"], "test_async_error_wrong_scheduling 3");

        var path2 = [], ex = null;
        d = new DoIt();
        d.then(function() {
            path2.push("0");
        }).then(function() {
            path2.push("1");
            this.then(function() {
                path2.push("1.1");
                throw new Error("err");
            }).catch(null);

            path2.push("2");
        }).then(function() {
            path2.push("3");
        }).catch(function(e) {
            ex = e;
        });
        assert(ex != null, true, ex == null ? "" : ex.toString());
        zebkit.assertObjEqual(path2, ["0", "1", "2", "1.1"], "test_async_error_wrong_scheduling 4");


        var path2 = [], ex = null;
        d = new DoIt();
        try {
            d.then(function() {
                path2.push("0");
            }).then(function() {
                path2.push("1");
                this.then(function() {
                    path2.push("1.1");
                    throw new Error("test err");
                }).throw();

                path2.push("2");
            }).then(function() {
                path2.push("3");
            }).catch(function(e) {
                ex = e;
            });
        } catch(e) {
            ex = e
        }
        assert(ex != null, true, "test_async_error_wrong_scheduling 5");
        assert(ex.toString().indexOf("test err") >= 0, true, "test_async_error_wrong_scheduling 6");
        zebkit.assertObjEqual(path2, ["0", "1", "2", "1.1"], "test_async_error_wrong_scheduling 7");

        var path3 = [], ex3 = null;
        var cb3 = this.assertCallback(function(path) {
            assert(ex3 != null, true, "test_async_error_wrong_scheduling 5");
            assert(ex3.toString().indexOf("test err") >= 0, true, "test_async_error_wrong_scheduling 6");
            zebkit.assertObjEqual(path3, ["0", "1", "2", "1.1"], "test_async_error_wrong_scheduling 7");
        });

        d = new DoIt();
        d.then(function() {
            path3.push("0");
            GET("http://localhost:8090/tests/t1.txt", this);
        }).then(function() {
            path3.push("1");
            this.then(function() {
                path3.push("1.1");
                throw new Error("test err");
            });

            path3.push("2");
        }).then(function() {
            path3.push("3");
        }).catch(function(e) {
            ex3 = e;
            cb3();
        });


        var path4 = [], ex4 = null;
        var cb4 = this.assertCallback(function() {
            assert(ex4 != null, true, "test_async_error_wrong_scheduling 8");
            assert(ex4.toString().indexOf("test err") >= 0, true, "test_async_error_wrong_scheduling 9");
            zebkit.assertObjEqual(path4, ["0", "1", "2", "1.1"], "test_async_error_wrong_scheduling 10");
        });

        d = new DoIt();
        d.then(function() {
            path4.push("0");
            GET("http://localhost:8090/tests/t1.txt", this);
        }).then(function() {
            path4.push("1");
            this.then(function() {
                path4.push("1.1");
                throw new Error("test err");
            }).catch(null);

            path4.push("2");
        }).then(function() {
            path4.push("3");
        }).catch(function(e) {
            ex4 = e;
            cb4();
        });
    },

    function test_then_then_seq() {
        var r  = new DoIt(),
            r1 = new DoIt(),
            r2 = new DoIt(),
            r3 = new DoIt(),
            track = [] ;

        var cb = this.assertCallback(function() {
            assertObjEqual(track, [ "1", "2", "3", "4" ],  "test_then_then_seq -1");
            assert(r.$tasks.length, 1, "test_then_then_seq -2");
            assert(r.$error, null, "test_then_then_seq -3");
            assert(r.$results.length, 1, "test_then_then_seq -4");
            assert(r.$results[0].length, 0, "test_then_then_seq -5");
            assert(r1.$busy, 0, "test_then_then_seq -51");
            assert(r2.$busy, 0, "test_then_then_seq -52");
            assert(r3.$busy, 0, "test_then_then_seq -53");


            var seq = [];
            r1.then(function aaa1(r) {
                seq.push("1");
                assert(arguments.length, 1, "test_then_then_seq -6");
                assert(r.responseText, "hello2", "test_then_then_seq -7");
            }).throw();


            r2.then(function aaa2(r) {
                seq.push("2");
                assert(arguments.length, 1, "test_then_then_seq -8");
                assert(r.responseText, "hello", "test_then_then_seq -9");
            }).throw();

            r3.then(function aaa3(r) {
                seq.push("3");
                assert(arguments.length, 1, "test_then_then_seq -10");
                assert(r.responseText, "hello3", "test_then_then_seq -11");
            }).throw();

            assertObjEqual(seq, ["1", "2", "3"], "test_then_then_seq -12");
        });

        r.then(function() {
            track.push("1");
            return 100;
        }).then(r1.then(function() {
            assert(arguments.length, 0, "test_then_then_seq 0");
            GET("http://localhost:8090/tests/t2.txt", this);
        })).then(function(r) {
            track.push("2");
            assert(arguments.length, 1, "test_then_then_seq 1")
            assert(r.responseText, "hello2", "test_then_then_seq 2");
        }).then(r2.then(function() {
            GET("http://localhost:8090/tests/t1.txt", this);
        })).then(function(r) {
            track.push("3");
            assert(arguments.length, 1, "test_then_then_seq 3")
            assert(r.responseText, "hello", "test_then_then_seq 4");
        }).then(r3.then(function r_3() {
            assert(arguments.length, 0, "test_then_then_seq 5");
            GET("http://localhost:8090/tests/t3.txt", this);
        })).then(function r_after_r3(r) {
            track.push("4");
            assert(arguments.length, 1, "test_then_then_seq 6")
            assert(r.responseText, "hello3", "test_then_then_seq 7");
            cb();
        }).catch();
    },

    function test_recovering() {
        var t     = new DoIt(),
            track = [];

        t.then(function() {
            track.push("1");
        }).then(function() {
            throw new Error("1");
        }).then(function() {
            track.push("3");
        }).catch(null);

        t.recover();

        t.then(function() {
            track.push("4");
        });

        assertObjEqual(track, ["1", "4" ]);

        var t = new DoIt(),
            track = [],
            cb    = this.assertCallback(function(r) {
                assert(r.responseText, "hello");
                assertObjEqual(track, ["1", "2", "4"]);
            });

        t.then(function() {
            GET("http://localhost:8090/tests/t3.txt", this);
            track.push("1");
        }).then(function() {
            GET("http://localhost:8090/tests/t333.txt", this);
            track.push("2");
        }).then(function() {
            track.push("3");
        }).catch(function(e) {
            this.restart();
        }).then(function() {
            GET("http://localhost:8090/tests/t1.txt", this);
            track.push("4");
        }).then(function(r) {
            cb(r);
        }).catch();
    },

    function test_till() {
        var d = new DoIt(), seq = [];

        d.then(function() {
            seq.push("1");
            return 10;
        });

        var dt = new DoIt().till(d).then(function() {
            seq.push("2");
            return 20;
        });

        d.then(function(res) {
            assert(res, 10, "test_till 1");
            seq.push("3");
        }).throw();


        dt.then(function(res) {
            assert(res, 20, "test_till 2");
            seq.push("4");
        }).throw();

        assertObjEqual(seq, ["1", "2", "3", "4"], "test_till 3");

        var d   = new DoIt(),
            seq = [],
            cb  = this.assertCallback(function(r, dt) {
                assertObjEqual(seq, ["1", "2", "3", "4", "5"], "test_till 4");
                assert(r.responseText, "hello3", "test_till 5");

                var bb = false;
                dt.then(function(r) {
                    bb = true;
                    assert(r.responseText, "hello2", "test_till 6");
                }).catch();
            });

        d.then(function() {
            seq.push("1");
            GET("http://localhost:8090/tests/t1.txt", this);
        }).catch();

        var dt = new DoIt().till(d).then(function(res) {
            seq.push("2");
            GET("http://localhost:8090/tests/t2.txt", this);
        }).catch();

        d.then(function(r) {
            seq.push("3");
            assert(r.responseText, "hello", "test_till 8");
            return r;
        });

        d.then(function(r) {
            seq.push("4");
            GET("http://localhost:8090/tests/t3.txt", this);
            assert(r.responseText, "hello", "test_till 9");
        }).catch();

        d.then(function(r) {
            assert(r.responseText, "hello3", "test_till 10");
            seq.push("5");
            cb(r, dt);
        });
    },

    function test_something() {
        var doit1 = new DoIt(), doit2 = new DoIt();
        doit1.then(function() {
            this.then(doit2.then(function() {
                throw "sdsd";
            }));
        });
    }
)});
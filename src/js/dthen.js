/**
 * Promise-like sequential tasks runner (D-then). Allows developers to execute
 * number of steps (async and sync) in the exact order they have been called with
 * the class instance. The idea of the runner implementation is making the
 * code more readable and plain nevertheless it includes asynchronous parts:
 * @example
 *
 *     var r = new zebkit.DoIt();
 *
 *     // step 1
 *     r.then(function() {
 *         // call three asynchronous HTTP GET requests to read three files
 *         // pass join to every async. method to be notified when the async.
 *         // part is completed
 *         asyncHttpCall("http://test.com/a.txt", this.join());
 *         asyncHttpCall("http://test.com/b.txt", this.join());
 *         asyncHttpCall("http://test.com/c.txt", this.join());
 *     })
 *     .  // step 2
 *     then(function(r1, r2, r3) {
 *         // handle completely read on previous step files
 *         r1.responseText  // "a.txt" file content
 *         r2.responseText  // "b.txt" file content
 *         r3.responseText  // "c.txt" file content
 *     })
 *     . // handle error
 *     catch(function(e) {
 *         // called when an exception has occurred
 *         ...
 *     });
 *
 *
 * @class zebkit.DoIt
 * @param {Boolean} [ignore] flag to rule error ignorance
 * @constructor
 */
function DoIt(body, ignore) {
    this.recover();

    if (arguments.length === 1) {
        if (body !== undefined && body !== null && (typeof body === "boolean" || body.constructor === Boolean)) {
            this.$ignoreError = body;
            body = null;
        } else {
            this.then(body);
        }
    } else if (arguments.length === 2) {
        this.$ignoreError = ignore;
        this.then(body);
    }
}

DoIt.prototype = {
    /**
     * Indicates if the error has to be ignored
     * @attribute $ignoreError
     * @private
     * @type {Boolean}
     */
    $ignoreError : false,

    // TODO: not stable API
    recover : function(body) {
        if (this.$error !== null) {
            var err = this.$error;
            this.$error = null;
            this.$tasks   = [];
            this.$results = [];
            this.$taskCounter = this.$level = this.$busy = 0;

            if (arguments.length === 1) {
                body.call(this, err);
            }
        }
        return this;
    },

    /**
     * Restart the do it object to clear error that has happened and
     * continue tasks that has not been run yet because of the error.
     * @method  restart
     * @chainable
     */
    restart : function() {
        if (this.$error !== null) {
            this.$error = null;
        }
        this.$schedule();
        return this;
    },

    /**
     * Run the given method as one of the sequential step of the doit execution.
     * @method  then
     * @param  {Function} body a method to be executed. The method can get results
     * of previous step execution as its arguments. The method is called in context
     * of a DoIt instance.
     * @chainable
     */
    then : function(body, completed) {
        var level = this.$level;  // store level then was executed for the given task
                                  // to be used to compute correct the level inside the
                                  // method below
        if (body instanceof DoIt) {
            if (body.$error !== null) {
                this.error(body.$error);
            } else {
                var $this = this;
                this.then(function() {
                    var jn = $this.join();
                    body.then(function() {
                        if (arguments.length > 0) {
                            // also pass result to body DoIt
                            this.join.apply(this, arguments);
                        }
                    }, function() {
                        if ($this.$error === null) {
                            jn.apply($this, arguments);
                        }
                    }).catch(function(e) {
                        $this.error(e);
                    });
                });
            }

            return this;
        } else {
            var task = function() {
                // clean results of execution of a previous task

                this.$busy = 0;
                var pc = this.$taskCounter, args = null, r;

                if (this.$error === null) {
                    if (this.$results[level] !== undefined) {
                        args = this.$results[level];
                    }

                    this.$taskCounter    = 0;  // we have to count the tasks on this level
                    this.$level          = level + 1;
                    this.$results[level] = [];

                    // it is supposed the call is embedded with other call, no need to
                    // catch it one more time
                    if (level > 0) {
                        r = body.apply(this, args);
                    } else {
                        try {
                            r = body.apply(this, args);
                        } catch(e) {
                            this.error(e);
                        }
                    }

                    // this.$busy === 0 means we have called synchronous task
                    // and make sure the task has returned a result
                    if (this.$busy === 0 && this.$error === null && r !== undefined) {
                        this.$results[level] = [ r ];
                    }
                }

                if (level === 0) {
                    // zero level is responsible for handling exception
                    try {
                        this.$schedule();
                    } catch(e) {
                        this.error(e);
                    }
                } else {
                    this.$schedule();
                }

                this.$level = level; // restore level
                this.$taskCounter = pc;  // restore counter

                // TODO: not a graceful solution. It has been done to let call "join" out
                // outside of body. Sometimes it is required to provide proper level of
                // execution since join calls schedule
                if (typeof completed === 'function') {
                    if (level === 0) {
                        try {
                            if (args === null) {
                                completed.call(this);
                            } else {
                                completed.apply(this, args);
                            }
                        } catch(e) {
                            this.error(e);
                        }
                    } else {
                        if (args === null) {
                            completed.call(this);
                        } else {
                            completed.apply(this, args);
                        }
                    }
                }
                if (args !== null) {
                    args.length = 0;
                }
            };

            if (this.$error === null) {
                if (level === 0 && this.$busy === 0) {
                    if (this.$results[level] !== null &&
                        this.$results[level] !== undefined &&
                        this.$results[level].length > 0)
                    {
                        task.apply(this, this.$results[level]);
                    } else {
                        task.call(this);
                    }
                } else {
                    // put task in list
                    if (this.$level > 0) {
                        this.$tasks.splice(this.$taskCounter++, 0, task);
                    } else {
                        this.$tasks.push(task);
                    }
                }
            }
        }

        if (this.$level === 0) {
            this.$schedule();
        }

        return this;
    },

    $ignored : function(e) {
        this.dumpError(e);
    },

    /**
     * Force to fire error.
     * @param  {Error} [e] an error to be fired
     * @method error
     * @chainable
     */
    error : function(e, pr) {
        if (arguments.length === 0) {
            if (this.$error !== null) {
                this.dumpError(e);
            }
        } else {
            if (this.$error === null) {
                if (this.$ignoreError) {
                    this.$ignored(e);
                } else {
                    this.$taskCounter = this.$level = this.$busy = 0;
                    this.$error   = e;
                    this.$results = [];
                }

                this.$schedule();
            } else if (arguments.length < 2 || pr === true) {
                this.dumpError(e);
            }
        }

        return this;
    },

    /**
     * Wait for the given doit redness.
     * @param  {zebkit.DoIt} r a runner
     * @example
     *
     *      var async = new DoIt().then(function() {
     *          // imagine we do asynchronous ajax call
     *          ajaxCall("http://test.com/data", this.join());
     *      });
     *
     *      var doit = new DoIt().till(async).then(function(res) {
     *          // handle result that has been fetched
     *          // by "async" do it
     *          ...
     *      });
     *
     * @chainable
     * @method till
     */
    till : function(r) {
        // wait till the given DoIt is executed
        this.then(function() {
            var $this = this,
                jn    = this.join(), // block execution of the runner
                res   = arguments.length > 0 ? Array.prototype.slice.call(arguments) : []; // save arguments to restore it later

            // call "doit" we are waiting for
            r.then(function() {
                if ($this.$error === null) {
                    // unblock the doit that waits for the runner we are in and
                    // restore its arguments
                    if (res.length > 0) {
                        jn.apply($this, res);
                    } else {
                        jn.call($this);
                    }

                    // preserve arguments for the next call
                    if (arguments.length > 0) {
                        this.join.apply(this, arguments);
                    }
                }
            }).catch(function(e) {
                // delegate error to a waiting runner
                $this.error(e);
            });
        });

        return this;
    },

    /**
     * Returns join callback for asynchronous parts of the doit. The callback
     * has to be requested and called by an asynchronous method to inform the
     * doit the given method is completed.
     * @example
     *
     *      var d = new DoIt().then(function() {
     *          // imagine we call ajax HTTP requests
     *          ajaxCall("http://test.com/data1", this.join());
     *          ajaxCall("http://test.com/data2", this.join());
     *      }).then(function(res1, res2) {
     *          // handle results of ajax requests from previous step
     *          ...
     *      });
     *
     * @return {Function} a method to notify doit the given asynchronous part
     * has been completed. The passed to the method arguments will be passed
     * to the next step of the runner.         *
     * @method join
     */
    join : function() {
        // if join is called outside runner than level is set to 0
        var level = this.$level === 0 ? 0 : this.$level - 1;

        if (arguments.length > 0) {
            this.$results[level] = [];
            for(var i = 0; i < arguments.length; i++) {
                this.$results[level][i] = arguments[i];
            }
        } else {
            // TODO: join uses busy flag to identify the result index the given join will supply
            // what triggers a potential result overwriting  problem (jn2 overwrite jn1  result):
            //    var jn1 = join(); jn1();
            //    var jn2 = join(); jn2();

            var $this = this,
                index = this.$busy++;

            return function() {
                if ($this.$results[level] === null || $this.$results[level] === undefined) {
                    $this.$results[level] = [];
                }

                // since error can occur and times variable
                // can be reset to 0 we have to check it
                if ($this.$busy > 0) {
                    var i = 0;

                    if (arguments.length > 0) {
                        $this.$results[level][index] = [];
                        for(i = 0; i < arguments.length; i++) {
                            $this.$results[level][index][i] = arguments[i];
                        }
                    }

                    if (--$this.$busy === 0) {
                        // collect result
                        if ($this.$results[level].length > 0) {
                            var args = $this.$results[level],
                                res  = [];

                            for(i = 0; i < args.length; i++) {
                                Array.prototype.push.apply(res, args[i]);
                            }
                            $this.$results[level] = res;
                        }

                        // TODO: this code can bring to unexpected scheduling for a situation when
                        // doit is still in then:
                        //    then(function () {
                        //        var jn1 = join();
                        //        ...
                        //        jn1()  // unexpected scheduling of the next then since busy is zero
                        //        ...
                        //        var jn2 = join(); // not actual
                        //    })

                        $this.$schedule();
                    }
                }
            };
        }
    },

    /**
     * Method to catch error that has occurred during the doit sequence execution.
     * @param  {Function} [body] a callback to handle the error. The method
     * gets an error that has happened as its argument. If there is no argument
     * the error will be printed in output. If passed argument is null then
     * no error output is expected.
     * @chainable
     * @method catch
     */
    catch : function(body) {
        var level = this.$level;  // store level then was executed for the given task
                                  // to be used to compute correct the level inside the
                                  // method below

        var task = function() {
            // clean results of execution of a previous task

            this.$busy = 0;
            var pc = this.$taskCounter;
            if (this.$error !== null) {
                this.$taskCounter = 0;  // we have to count the tasks on this level
                this.$level       = level + 1;

                try {
                    if (typeof body === 'function') {
                        body.call(this, this.$error);
                    } else if (body === null) {

                    } else {
                        this.dumpError(this.$error);
                    }
                } catch(e) {
                    this.$level       = level; // restore level
                    this.$taskCounter = pc;    // restore counter
                    throw e;
                }
            }

            if (level === 0) {
                try {
                    this.$schedule();
                } catch(e) {
                    this.error(e);
                }
            } else {
                this.$schedule();
            }

            this.$level       = level; // restore level
            this.$taskCounter = pc;    // restore counter
        };

        if (this.$level > 0) {
            this.$tasks.splice(this.$taskCounter++, 0, task);
        } else {
            this.$tasks.push(task);
        }

        if (this.$level === 0) {
            this.$schedule();
        }

        return this;
    },

    /**
     * Throw an exception if an error has happened before the method call,
     * otherwise do nothing.
     * @method  throw
     * @chainable
     */
    throw : function() {
        return this.catch(function(e) {
            throw e;
        });
    },

    $schedule : function() {
        if (this.$tasks.length > 0 && this.$busy === 0) {
            this.$tasks.shift().call(this);
        }
    },

    end : function() {
        this.recover();
    },

    dumpError: function(e) {
        if (typeof console !== "undefined" && console.log !== undefined) {
            if (e === null || e === undefined) {
                console.log("Unknown error");
            } else {
                console.log((e.stack ? e.stack : e));
            }
        }
    }
};
/**
 * Abstract event class.
 * @class zebkit.Event
 * @constructor
 */
var Event = Class([
    function $prototype() {
        /**
         * Source of an event
         * @attribute source
         * @type {Object}
         * @default null
         * @readOnly
         */
        this.source = null;
    }
]);

/**
 * This method allows to declare a listeners container class for the given
 * dedicated event types.

    // create listener container to keep three different events
    // handlers
    var MyListenerContainerClass = zebkit.ListenersClass("event1",
                                                         "event2",
                                                         "event3");

    // instantiate listener class container
    var listeners = new MyListenerContainerClass();

    // add "event1" listener
    listeners.add(function event1() {
        ...
    });

    // add "event2" listener
    listeners.add(function event2() {
       ...
    });

    // add listener for both event1 and event2 events
    listeners.add(function() {
       ...
    });

    // and firing event1 to registered handlers
    listeners.event1(...);

    // and firing event2 to registered handlers
    listeners.event2(...);

 * @for zebkit
 * @method ListenersClass
 * @param {String} [events]* events types the listeners container has to support
 * @return {zebkit.Listener} a listener container class
 */
var $NewListener = function() {
    var clazz = function() {};
    clazz.eventNames = arguments.length === 0 ? [ "fired" ]
                                              : Array.prototype.slice.call(arguments);

    clazz.ListenersClass = function() {
        var args = this.eventNames.slice(); // clone
        for(var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        return $NewListener.apply(this, args);
    };

    if (clazz.eventNames.length === 1) {
        var $ename = clazz.eventNames[0];

        clazz.prototype.v = null;

        clazz.prototype.add = function() {
            var ctx = this,
                l   = arguments[arguments.length - 1]; // last arguments are handler(s)

            if (typeof l !== 'function') {
                ctx = l;
                l   = l[$ename];

                if (typeof l !== "function") {
                    return null;
                }
            }

            if (arguments.length > 1 && arguments[0] !== $ename) {
                throw new Error("Unknown event type :" + $ename);
            }

            if (this.v === null) {
                this.v = [];
            }

            this.v.push(ctx, l);
            return l;
        };

        clazz.prototype.remove = function(l) {
            if (this.v !== null) {
                if (arguments.length === 0) {
                    // remove all
                    this.v.length = 0;
                } else {
                    var name = arguments.length > 1 || zebkit.isString(arguments[0]) ? arguments[0]
                                                                                     : null,
                        fn   = arguments.length > 1 ? arguments[1]
                                                    : (name === null ? arguments[0] : null),
                        i    = 0;

                    if (name !== null && name !== $ename) {
                        throw new Error("Unknown event type :" + name);
                    }

                    if (fn === null) {
                        this.v.length = 0;
                    } else {
                        while ((i = this.v.indexOf(fn)) >= 0) {
                            if (i % 2 > 0) {
                                i--;
                            }
                            this.v.splice(i, 2);
                        }
                    }
                }
            }
        };

        clazz.prototype.hasHandler = function(l) {
            if (zebkit.isString(l)) {
                return this.v !== null && l === $ename && this.v.length > 0;
            } else {
                return this.v.length > 0 && this.v.indexOf(l) >= 0;
            }
        };

        clazz.prototype[$ename] = function() {
            if (this.v !== null) {
                for (var i = 0; i < this.v.length; i += 2) {
                    if (this.v[i + 1].apply(this.v[i], arguments) === true) {
                        return true;
                    }
                }
            }
            return false;
        };

        clazz.prototype.hasEvent = function(nm) {
            return nm === $ename;
        };
    } else {
        var names = {};
        for(var i = 0; i < clazz.eventNames.length; i++) {
            names[clazz.eventNames[i]] = true;
        }

        clazz.prototype.$methods = null;

        clazz.prototype.add = function(l) {
            if (this.$methods === null) {
                this.$methods = {};
            }

            var n   = null,
                k   = null,
                nms = typeof this.$names !== 'undefined' ? this.$names : names;

            if (arguments.length > 1) {
                n = arguments[0];
                l = arguments[arguments.length - 1]; // last arguments are handler(s)
            }

            if (typeof l === 'function') {
                if (n !== null && nms.hasOwnProperty(n) === false) {
                    throw new Error("Unknown event type " + n);
                }

                if (n === null) {
                    for(k in nms) {
                        if (this.$methods.hasOwnProperty(k) === false) {
                            this.$methods[k] = [];
                        }
                        this.$methods[k].push(this, l);
                    }
                } else {
                    if (this.$methods.hasOwnProperty(n) === false) {
                        this.$methods[n] = [];
                    }
                    this.$methods[n].push(this, l);
                }
            } else {
                var b = false;
                for (k in nms) {
                    if (typeof l[k] === "function") {
                        b = true;
                        if (this.$methods.hasOwnProperty(k) === false) {
                            this.$methods[k] = [];
                        }
                        this.$methods[k].push(l, l[k]);
                    }
                }

                if (b === false) {
                    return null;
                }
            }
            return l;
        };

        clazz.prototype.hasHandler = function(l) {
            if (zebkit.isString(l)) {
                return this.$methods !== null &&
                       this.$methods.hasOwnProperty(l) &&
                       this.$methods[l].length > 0;
            } else {
                for(var k in this.$methods) {
                    var v = this.$methods[k];
                    if (v.indexOf(l) >= 0) {
                        return true;
                    }
                }
                return false;
            }
        };

        clazz.prototype.addEvents = function() {
            if (typeof this.$names === 'undefined') {
                this.$names = {};
                for (var k in names) {
                    this.$names[k] = names[k];
                }
            }

            for(var i = 0; i < arguments.length; i++) {
                var name = arguments[i];

                if (name === null || typeof name === 'undefined' || typeof this[name] !== 'undefined') {
                    throw new Error("Invalid " + name + " (event name)");
                }

                this[name] = (function(name) {
                    return function() {
                        // typeof is faster then hasOwnProperty under nodejs
                        if (this.$methods !== null && typeof this.$methods[name] !== 'undefined') {
                            var c = this.$methods[name];
                            for(var i = 0; i < c.length; i += 2) {
                                if (c[i + 1].apply(c[i], arguments) === true) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    };
                })(name);

                this.$names[name] = true;
            }
        };

        // populate methods that has to be called to send appropriate events to
        // registered listeners
        clazz.prototype.addEvents.apply(clazz.prototype, clazz.eventNames);

        clazz.prototype.remove = function() {
            if (this.$methods !== null) {
                var k = null;
                if (arguments.length === 0) {
                    for(k in this.$methods) {
                        if (this.$methods.hasOwnProperty(k)) {
                            this.$methods[k].length = 0;
                        }
                    }
                    this.$methods = {};
                } else {
                    var name = arguments.length > 1 || zebkit.isString(arguments[0]) ? arguments[0]
                                                                                     : null,
                        fn   = arguments.length > 1 ? arguments[1]
                                                    : (name === null ? arguments[0] : null),
                        i    = 0,
                        v    = null;

                    if (name !== null) {
                        if (this.$methods.hasOwnProperty(name)) {
                            if (fn === null) {
                                this.$methods[name].length = 0;
                                delete this.$methods[name];
                            } else {
                                v = this.$methods[name];
                                while ((i = v.indexOf(fn)) >= 0) {
                                    if (i % 2 > 0) {
                                        i--;
                                    }
                                    v.splice(i, 2);
                                }

                                if (v.length === 0) {
                                    delete this.$methods[name];
                                }
                            }
                        }
                    } else {
                        for (k in this.$methods) {
                            v = this.$methods[k];
                            while ((i = v.indexOf(fn)) >= 0) {
                                if (i % 2 > 0) {
                                    i--;
                                }
                                v.splice(i, 2);
                            }

                            if (v.length === 0) {
                                delete this.$methods[k];
                            }
                        }
                    }
                }
            }
        };

        clazz.prototype.hasEvent = function(nm) {
            if (typeof this.$names !== 'undefined') {
                return this.$names.hasOwnProperty(nm);
            } else {
                return names.hasOwnProperty(nm);
            }
        };
    }


    return clazz;
};

/**
 * Listeners container class that can be handy to store number of listeners
 * for one type of event.
 * @param {String} [eventName] an event name the listeners container has been
 * created. By default "fired" is default event name. Event name is used to fire
 * the given event to a listener container.
 * @constructor
 * @class zebkit.Listeners
 * @example
 *
 *      // create container with a default event name
 *      var  container = new Listeners();
 *
 *      // register a listener
 *      var  listener = container.add(function(param1, param2) {
 *          // handle fired event
 *      });
 *
 *      ...
 *      // fire event
 *      container.fired(1, 2, 3);
 *
 *      // remove listener
 *      container.remove(listener);
 *
 * @extends zebkit.Listener
 */


/**
 * Add listener
 * @param {Function|Object} l a listener method or object.
 * @return {Function} a listener that has been registered in the container. The result should
 * be used to un-register the listener
 * @method  add
 */


/**
 * Remove listener or all registered listeners from the container
 * @param {Function} [l] a listener to be removed. If the argument has not been specified
 * all registered in the container listeners will be removed
 * @method  remove
 */
var Listeners = $NewListener();


/**
 * Event producer interface. This interface provides number of methods
 * to register, un-register, fire events. It follows on/off notion like
 * JQuery does it. It is expected an event producer class implementation
 * has a special field  "_" that keeps listeners.
 *
 *     var MyClass = zebkit.Class(zebkit.EventProducer, [
 *         function() {
 *             // "fired" events listeners container
 *             this._ = new zebkit.Listeners();
 *         }
 *     ]);
 *
 *     var a = new MyClass();
 *     a.on("fired", function(arg) {
 *         // handle "fired" events
 *     });
 *
 *     a.fire(10);
 *
 * @class zebkit.EventProducer
 * @interface zebkit.EventProducer
 */
var EventProducer = Interface([
    function $prototype() {
        // on(event, path, cb)  handle the given event for all elements identified with the path
        // on(cb)               handle all events
        // on(path | event, cb) handle the given event or all events for elements matched with the path


        /**
         * Register listener for the given events types or/and the given nodes in tree-like
         * structure or listen all events types.
         * @param {String} [eventName] an event type name to listen. If the event name is not passed
         * then listen all events types.
         * @param {String} [path] a xpath-like path to traversing elements in tree and register event
         * handlers for the found elements. The parameter can be used if the interface is implemented
         * with tree-like structure (for instance zebkit UI components).
         * @param {Function|Object} cb a listener method or an object that contains number of methods
         * to listen the specified events types.
         * @example
         *     var comp = new zebkit.ui.Panel();
         *     comp.add(new zebkit.ui.Button("Test 1").setId("c1"));
         *     comp.add(new zebkit.ui.Button("Test 2").setId("c2"));
         *     ...
         *     // register event handler for children components of "comp"
         *     comp.on("/*", function() {
         *         // handle button fired event
         *         ...
         *     });
         *
         *     // register event handler for button component with id equals "c1"
         *     comp.on("#c1", function() {
         *         // handle button fired event
         *         ...
         *     });
         *
         * @method on
         */
        this.on = function() {
            var cb = arguments[arguments.length - 1],  // callback or object
                pt = null,                             // path
                nm = null;                             // event name

            if (cb === null || (typeof cb === "string" || cb.constructor === String)) {
                throw new Error("Invalid event handler");
            }

            if (arguments.length === 1) {
                if (typeof this._ === 'undefined') {
                    if (typeof this.clazz.Listeners !== 'undefined') {
                        this._ = new this.clazz.Listeners();
                    } else {
                        return false;
                    }
                }
                return this._.add(cb);
            } else if (arguments.length === 2) {
                if (arguments[0] === null) {
                    throw new Error("Invalid event or path");
                } else if (arguments[0][0] === '.' || arguments[0][0] === '/' || arguments[0][0] === '#') { // a path detected
                    pt = arguments[0];
                } else {
                    if (typeof this._ === 'undefined') {
                        if (typeof this.clazz.Listeners !== 'undefined') {
                            this._ = new this.clazz.Listeners();
                        } else {
                            return false;
                        }
                    }
                    return this._.add(arguments[0], cb);
                }
            } else if (arguments.length === 3) {
                pt = arguments[1];
                nm = arguments[0];
                if (pt === null) {
                    if (typeof this._ === 'undefined') {
                        if (typeof this.clazz.Listeners !== 'undefined') {
                            this._ = new this.clazz.Listeners();
                        } else {
                            return false;
                        }
                    }
                    return this._.add(nm, cb);
                }
            }

            this.byPath(pt, function(node) {
                // try to initiate
                if (typeof node._ === 'undefined' && typeof node.clazz.Listeners !== 'undefined') {
                    node._ = new node.clazz.Listeners();
                }

                if (typeof node._ !== 'undefined') {
                    if (nm !== null) {
                        if (typeof node._[nm] !== 'undefined') {
                            node._.add(nm, cb);
                        }
                    } else {
                        node._.add(cb);
                    }
                }
                return false;
            });

            return cb;
        };

        // off()            remove all events handler
        // off(event)       remove the event handler
        // off(event, path)  remove the event handler for all nodes detected with the path
        // off(path)
        // off(cb)
        // off(path, cb)
        //
        /**
         * Stop listening the given event type.
         * @param {String} [eventName] an event type name to stop listening. If the event name is not passed
         * then stop listening all events types.
         * @param {String} [path] a xpath-like path to traversing elements in tree and stop listening
         * the event type for the found in the tree elements. The parameter can be used if the interface
         * is implemented with tree-like structure (for instance zebkit UI components).
         * @param [cb] remove the given event handler.
         * @method off
         */
        this.off = function() {
            var pt = null,  // path
                fn = null,  // handler
                nm = null;  // event name or listener

            if (arguments.length === 0) {
                return this._.remove();
            } else if (arguments.length === 1) {
                if (isString(arguments[0]) && (arguments[0][0] === '.' || arguments[0][0] === '/' || arguments[0][0] === '#')) {
                    pt = arguments[0];
                } else {
                    return this._.remove(arguments[0]);
                }
            } else if (arguments.length === 2) {
                if (isString(arguments[1])) { // detect path
                    pt = arguments[1];
                    nm = arguments[0];
                } else {
                    if (isString(arguments[1])) {
                        nm = arguments[1];
                    } else {
                        fn = arguments[1];
                    }

                    if (arguments[0][0] === '.' || arguments[0][0] === '/' || arguments[0][0] === '#') {
                        pt = arguments[0];
                    } else {
                        throw new Error("Path is expected");
                    }
                }
            }

            this.byPath(pt, function(node) {
                if (typeof node._ !== 'undefined') {
                    if (fn !== null) {
                        node._.remove(fn);
                    } else if (nm !== null) {
                        if (typeof node._[nm] !== 'undefined') {
                            node._.remove(nm);
                        }
                    } else {
                        node._.remove();
                    }
                }
                return false;
            });
        };

        /**
         * Fire event with the given parameters.
         * @param {String} event an event name
         * @param {String} [path]  a path if the event has to be send to multiple destination in the tree
         * @param {Object|Array}  [params] array of parameters or single parameter to be passed to an event
         * handler or handlers.
         * @method fire
         */
        this.fire = function() {
            var pt   = null,  // path
                args = null,
                nm   = arguments[0];  // event name or listener

            if (arguments.length >= 0 && arguments.length < 3) {
                if (typeof this._ !== 'undefined') {
                    if (arguments.length === 0) {
                        nm = "fired";
                    }

                    if (this._.hasEvent(nm) === false) {
                        throw new Error("Listener doesn't '" + nm + "' support the event");
                    }

                    var fn = this._[nm];
                    if (arguments.length === 2) {
                        return Array.isArray(arguments[1]) ? fn.apply(this._, arguments[1])
                                                           : fn.call(this._,  arguments[1]);
                    } else {
                        return fn.call(this._, this);
                    }
                } else {
                    return false;
                }
            } else if (arguments.length === 3) {
                pt   = arguments[1];
                args = arguments[2];
            } else {
                throw new Error("Invalid number of arguments");
            }

            this.byPath(pt, function(n) {
                var ec = n._;
                if (typeof ec !== 'undefined' && n._.hasEvent(nm)) {
                    if (args !== null && Array.isArray(args)) {
                        ec[nm].apply(ec, args);
                    } else {
                        ec[nm].call(ec, args);
                    }
                }
                return false;
            });
        };
    }
]);


/**
 * @extends the class with the given events support.
 * @param {String} [args]* list of events names
 * @method events
 * @for  zebkit.Class
 */
classTemplateFields.events = function() {
    var args = Array.prototype.slice.call(arguments);
    if (arguments.length === 0) {
        args.push("fired");
    }

    var c = args.length;
    if (typeof this.Listeners !== 'undefined') {
        for (var i = 0; i < this.Listeners.eventNames.length; i++) {
            var en = this.Listeners.eventNames[i];
            if (args.indexOf(en) < 0) {
                args.push(en);
            }
        }
    }

    if (typeof this.Listeners === 'undefined') {
        this.Listeners = $NewListener.apply($NewListener, args);
    } else if (c !== args.length) {
        this.Listeners = $NewListener.apply($NewListener, args);
    }

    if (this.isInherit(EventProducer) === false) {
        this.extend(EventProducer);
    }

    return this;
};



// TODO: should be at least re-named to better name
var Fireable = Interface();

$export({
    "Event"          : Event,
    "Fireable"       : Fireable,
    "Listeners"      : Listeners,
    "ListenersClass" : $NewListener,
    "EventProducer"  : EventProducer
});
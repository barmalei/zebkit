// TODO List:
//    [+] add pressure level field to pointer events
//    [-] group field
//    [+] floor for pageX/pageY
//    [+] double click
//    [+] check if button field is required or can be removed from pointer event
//    [+] support global status keeping and updating (ctrl/alt/shift)
//    [+] "lmouse" and "rmouse" should be constants
//    [-] list of active touches or pointers have to be available
//    [-] meX/meY -> (x, y) ?

(function(pkg, Class) {
    if (pkg.doubleClickDelta == null) {
        pkg.doubleClickDelta = 180;
    }

    var PI4                      = Math.PI/4,  // used to calculate touch event gamma (direction
        PI4_3                    = PI4 * 3,    // in polar coordinate)
        $enteredElement          = null,
        $tmpWinMouseMoveListener = null,
        $lastPointerReleased     = null,
        $pointerPressedEvents    = {},         // collect all pointer pressed events
        LMOUSE = "lmouse",
        RMOUSE = "rmouse";

    /**
     * Mouse and touch screen input event class. The input event is
     * triggered by a mouse or touch screen.
     * @param {zebkit.ui.Panel} source a source of the mouse input event
     * @param {Integer} ax an absolute (relatively to a canvas where the source
     * UI component is hosted) mouse pointer x coordinate
     * @param {Integer} ax an absolute (relatively to a canvas where the source
     * UI component is hosted) mouse pointer y coordinate
     * @param {Integer} mask a bits mask of pressed mouse buttons:

             zebkit.ui.PointerEvent.LEFT_BUTTON
             zebkit.ui.PointerEvent.RIGHT_BUTTON

     * @class  zebkit.ui.PointerEvent
     * @constructor
     */
    pkg.PointerEvent = Class(zebkit.util.Event, [
        function $prototype() {
            /**
             * Pointer type. Can be "mouse", "touch", "pen"
             * @attribute  poiterType
             * @type {String}
             */
            this.pointerType = "mouse";

            /**
             * Touch counter
             * @attribute touchCounter
             * @type {Integer}
             * @default 0
             */
            this.touchCounter = 0;

            /**
             * Page x
             * @attribute pageX
             * @type {Integer}
             * @default -1
             */
            this.pageX = -1;

            /**
             * Page y
             * @attribute pageY
             * @type {Integer}
             * @default -1
             */
            this.pageY = -1;

            /**
             * Target DOM element
             * @attribute target
             * @type {DOMElement}
             * @default null
             */
            this.target = null;

            /**
             * Pointer identifier
             * @attribute identifier
             * @type {Object}
             * @default null
             */
            this.identifier = null;

            this.shiftKey = this.altKey = this.metaKey = this.ctrlKey = false;

            this.pressure = 0.5;

            // TODO: not completed
            this.pressGroup = [];

            this.isAction = function() {
                return this.identifier === LMOUSE && this.touchCounter === 1;
            };

            this.isContext = function() {
                return this.identifier === RMOUSE && this.touchCounter === 1;
            };

            this.$fillWith = function(identifier, e) {
                this.pageX      = Math.floor(e.pageX);
                this.pageY      = Math.floor(e.pageY);
                this.target     = e.target;
                this.identifier = identifier;
                this.altKey     = typeof e.altKey   !== 'undefined' ? e.altKey   : false;
                this.shiftKey   = typeof e.shiftKey !== 'undefined' ? e.shiftKey : false;
                this.ctrlKey    = typeof e.ctrlKey  !== 'undefined' ? e.ctrlKey  : false;
                this.metaKey    = typeof e.metaKey  !== 'undefined' ? e.metaKey  : false;
                this.pressure   = typeof e.pressure !== 'undefined' ? e.pressure : 0.5;
            };
        }
    ]);

    var ME_STUB      = new pkg.PointerEvent(), // instance of mouse event
        TOUCH_STUB   = new pkg.PointerEvent(), // instance of touch event
        POINTER_STUB = new pkg.PointerEvent(); // instance of pointer event


    TOUCH_STUB.isAction = function() {
        return this.touchCounter === 1;
    };

    TOUCH_STUB.isContext = function() {
        return this.touchCounter === 2;  // TODO: here should be group analyzed (both touch has to be the same group)
    };

    ME_STUB.pointerType      = "mouse";
    TOUCH_STUB.pointerType   = "touch";
    POINTER_STUB.pointerType = "pointer"

    /**
     *  Mouse wheel support class. Installs necessary mouse wheel
     *  listeners and handles mouse wheel events in zebkit UI. The
     *  mouse wheel support is plugging that is configured by a
     *  JSON configuration.
     *  @class zebkit.ui.MouseWheelSupport
     *  @param  {zebkit.ui.zCanvas} canvas a zCanvas UI component
     *  @constructor
     */
    pkg.MouseWheelSupport = Class([
        function $clazz() {
            this.dxZoom = this.dyZoom = 20;
            this.dxNorma = this.dyNorma = 80;

            this.$META = {
                wheel: {
                    dy  : "deltaY",
                    dx  : "deltaX",
                    dir : 1,
                    test: function() {
                        return "WheelEvent" in window;
                    }
                },
                mousewheel: {
                    dy  : "wheelDelta",
                    dx  : "wheelDeltaX",
                    dir : -1,
                    test: function() {
                        return document.onmousewheel !== undefined;
                    }
                },
                DOMMouseScroll: {
                    dy  : "detail",
                    dir : 1,
                    test: function() {
                        return true;
                    }
                }
            };
        },

        function $prototype() {
            this.naturalDirection = true;
        },

        function(element, destination) {
            var META = this.clazz.$META;
            for(var k in META) {
                if (META[k].test()) {
                    var $wheelMeta = META[k], $clazz = this.clazz;
                    element.addEventListener(k,
                        function(e) {
                            var dy = e[$wheelMeta.dy] != null ? e[$wheelMeta.dy] * $wheelMeta.dir : 0,
                                dx = e[$wheelMeta.dx] != null ? e[$wheelMeta.dx] * $wheelMeta.dir : 0;

                            // some version of FF can generates dx/dy  < 1
                            if (Math.abs(dy) < 1) {
                                dy *= $clazz.dyZoom;
                            }

                            if (Math.abs(dx) < 1) {
                                dx *= $clazz.dxZoom;
                            }

                            dy = Math.abs(dy) > $clazz.dyNorma ? dy % $clazz.dyNorma : dy;
                            dx = Math.abs(dx) > $clazz.dxNorma ? dx % $clazz.dxNorma : dx;


                            // do floor since some mouse devices can fire float as
                            if (destination.$doScroll(Math.floor(dx),
                                                      Math.floor(dy), "wheel"))
                            {
                                e.preventDefault();
                            }
                        },
                        false);
                    break;
                }
            }
        }
    ]);

    // !!!
    // global mouse move events handler (registered by drag out a canvas surface)
    // has to be removed every time a mouse button released with the given function
    function $cleanDragFix() {
        if ($tmpWinMouseMoveListener != null && $pointerPressedEvents[LMOUSE] == null && $pointerPressedEvents[RMOUSE] == null) {
            window.removeEventListener("mousemove", $tmpWinMouseMoveListener, true);
            $tmpWinMouseMoveListener = null;
            return true;
        }
        return false;
    };

    pkg.PointerEventUnifier = Class([
        function $clazz() {
            // !!!!
            // TODO: this method works only for mouse (constant of mouse event ids is in)
            // not clear if it is ok
            //
            // the document mouse up happens when we drag outside a canvas.
            // in this case canvas doesn't catch mouse up, so we have to do it
            // by global mouseup handler
            document.addEventListener("mouseup", function(e) {
                // ignore any mouse buttons except left
                // and right buttons
                if (e.button === 0 || e.button === 2) {
                    var id = e.button == 0 ? LMOUSE : RMOUSE,
                        mp = $pointerPressedEvents[id];

                    // !!!!
                    // Check if the event target is not the canvas itself
                    // On desktop  "mouseup" event is generated only if
                    // you drag mouse outside a canvas and than release a mouse button
                    // At the same time in Android native browser (and may be other mobile
                    // browsers) "mouseup" event is fired every time you touch
                    // canvas or any other element. So check if target is not a canvas
                    // before doing releasing, otherwise it brings to error on mobile
                    if (mp != null                       &&
                        mp.$adapter.element != e.target  &&
                        mp.$adapter.element.contains(e.target) === false)
                    {
                        try {
                            if ($enteredElement != null) {
                                $enteredElement = null;
                                mp.$adapter.destination.$pointerExited(ME_STUB);
                            }
                        }
                        finally {
                            mp.$adapter.$UP(id, e, ME_STUB);
                        }
                    }
                }
            },  false); // false is important since if mouseUp  happens on
                        // canvas the canvas gets the event first and than stops
                        // propagating to prevent it
        },

        function $prototype() {
            this.$timer = null;
            this.$queue = [];

            this.$touchedAt = function(pageX, pageY, d) {
                var lx = pageX - d,
                    ty = pageY - d,
                    rx = pageX + d,
                    by = pageY + d;

                for(var k in $pointerPressedEvents) {
                    if (k !== LMOUSE && k !== RMOUSE) {
                        var e = $pointerPressedEvents[k];
                        if (e.pageX >= lx && e.pageY >= ty && e.pageX <= rx && e.pageY <= by) {
                            return true;
                        }
                    }
                }
                return false;
            };

            this.$DRAG = function(id, e, stub) {
                // get appropriate pointerPressed event that has occurred before
                var mp = $pointerPressedEvents[id];

                // a pointer touched has been pressed and pressed target zebkit component exists
                // emulate mouse dragging events if mouse has moved on the canvas where mouse
                // pressed event occurred
                if (mp != null) {
                    // ignore moved if there still start events that are waiting for to be fired
                    if (mp.$adapter.element === this.element) {
                        // target component exists and mouse cursor moved on the same
                        // canvas where mouse pressed occurred
                        if (this.$timer === null) {
                            stub.$fillWith(id, e);

                            var dx = stub.pageX - mp.pageX,
                                dy = stub.pageY - mp.pageY,
                                d  = mp.direction;

                            // accumulate shifting of pointer
                            mp.$adx += dx;
                            mp.$ady += dy;

                            // update stored touch coordinates with a new one
                            mp.pageX  = stub.pageX;
                            mp.pageY  = stub.pageY;

                            // we can recognize direction only if move was not too small
                            if (Math.abs(mp.$adx) > 4 || Math.abs(mp.$ady) > 4) {
                                // compute gamma, this is corner in polar coordinate system
                                var gamma = Math.atan2(mp.$ady, mp.$adx);

                                // using gamma we can figure out direction
                                if (gamma > -PI4) {
                                    d = (gamma < PI4) ? "right" : (gamma < PI4_3 ? "buttom" : "left");
                                }
                                else {
                                    d = (gamma > -PI4_3) ? "top" : "left";
                                }

                                mp.direction = d;

                                // clear accumulated shift
                                mp.$ady = mp.$adx = 0;

                                mp.gamma = gamma;
                            }

                            stub.direction = mp.direction;
                            stub.dx = dx;
                            stub.dy = dy;

                            try {
                                if (mp.isDragged === false) {
                                    this.destination.$pointerDragStarted(stub);
                                }

                                if (mp.isDragged === false || dx != 0 || dy != 0) {
                                    this.destination.$pointerDragged(stub);
                                }
                            }
                            finally {
                                mp.isDragged = true;
                            }
                        }
                    }
                    else {
                        mp.$adapter.$DRAG(id, e, stub);
                    }
                }
            };

            //  Possible cases of mouse up events:
            //
            //   a) +-------------+        b) +----------------+       c) +---------------+
            //      |  E          |           | E +----+       |          | E       +-----|
            //      |      p--u   |          |    | p--|-u     |          |         |  p--|-u
            //      |             |           |   +----+       |          |         +-----|
            //      +-------------+           +----------------+          +---------------+
            // (out to document/body)      (out from kid to element)   (out from kid to document)
            //
            //   d) +--------+--------+    e) +----------+----------+    f) +---------+-------+
            //      | E      |        |       |  E +-----|-----+    |       | E +-----|       |
            //      |     p--|--u     |       |    | p---|--u  |    |       |   |  p--|-u     |
            //      |        |        |       |    +-----|-----+    |       |   +-----|       |
            //      +--------+--------+       +----------+----------+       +---------+-------+
            //     (out from element to       (out from kid of element     (out from kid element
            //      other element)            to kid of another element)    to another element)
            // Contract:
            //   -- handle only mouse events whose destination is the passed element
            //   -- does stop propagation if event has been handled
            //   -- clear drag  fix ?
            this.$UP = function(id, e, stub) {
                // remove timer if it has not been started yet since we already have
                // got UP event and have to fire pressed events from queue with the
                // UP handler
                if (this.$timer != null) {
                    clearTimeout(this.$timer);
                    this.$timer = null;
                }

                // test if the pressed event for the given id has not been fired yet
                var isPressedInQ = false;
                for(var i = 0; i < this.$queue.length; i++) {
                    if (this.$queue[i].identifier === id) {
                        isPressedInQ = true;
                        break;
                    }
                }

                // fire collected in queue pressed events
                this.$firePressedFromQ();

                // get pointer pressed state for the given id
                var mp = $pointerPressedEvents[id];

                // check if a pointer state is in pressed state
                if (mp != null) {
                    // mouse up can happen in another element than
                    // mouse down occurred. let the original element
                    // (where mouse down is happened) to handle it
                    if (this.element !== mp.$adapter.element) {
                        $enteredElement = null;

                        // wrap with try-catch to prevent inconsistency
                        try {
                            stub.$fillWith(id, e);
                            mp.$adapter.destination.$pointerExited(stub);
                            $enteredElement = this.element;
                            this.destination.$pointerEntered(stub);
                        }
                        catch(ee) {
                            // keep it for exceptional cases
                            $enteredElement = this.element;
                        }
                        finally {
                            mp.$adapter.$UP(id, e, stub);
                        }
                    }
                    else {
                        function $fireUP(id, e, mp, stub, destination) {
                            try {
                                // store coordinates and target
                                stub.$fillWith(id, e);

                                // TODO: uncomment it and replace with sub or so
                                //if (tt.group != null) tt.group.active = false;

                                // add press coordinates what can help to detect source
                                // of the event
                                stub.pressPageX = mp.pressPageX;
                                stub.pressPageY = mp.pressPageY;

                                // fire dragged or clicked
                                if (mp.isDragged === true) {
                                    destination.$pointerDragEnded(stub);
                                }
                                else {
                                    if ($lastPointerReleased != null &&
                                        $lastPointerReleased.identifier === id &&
                                        (new Date().getTime() - $lastPointerReleased.time) <= pkg.doubleClickDelta)
                                    {
                                        destination.$pointerDoubleClicked(stub);
                                    }
                                    else {
                                        destination.$pointerClicked(stub);
                                    }
                                }

                                // always complete pointer pressed with appropriate
                                // release event
                                destination.$pointerReleased(stub);
                            }
                            finally {
                                // clear handled pressed and dragged state
                                if (stub.touchCounter > 0) stub.touchCounter--;
                                $lastPointerReleased = $pointerPressedEvents[id];
                                delete $pointerPressedEvents[id];

                                // remove global move listener if necessary
                                $cleanDragFix();
                            }
                        }

                        if (isPressedInQ) {
                            var $this = this;
                            setTimeout(function() {
                                $fireUP(id, e, mp, stub, $this.destination);
                            }, 50);
                        }
                        else {
                            $fireUP(id, e, mp, stub, this.destination);
                        }
                    }
                }
            };

            this.$indexOfQ = function(id) {
                for(var i = 0; i < this.$queue.length; i++) {
                    if (id === this.$queue[i].identifier) return i;
                }
                return -1;
            };

            this.$firePressedFromQ = function() {
                // fire collected pointer pressed events
                if (this.$queue.length > 0) {
                    var l = this.$queue.length;
                    for(var i = 0; i < l; i++) {
                        var t = this.$queue[i];

                        try {
                            // reg the event
                            $pointerPressedEvents[t.identifier] = t;

                            t.stub.$fillWith(t.identifier, t);
                            t.stub.group = l; // TODO: temporary solution
                            this.destination.$pointerPressed(t.stub);
                        }
                        catch(ex) {
                            // don't forget to decrease counter
                            if (t.stub != null && t.stub.touchCounter > 0) t.stub.touchCounter--;
                            delete $pointerPressedEvents[t.identifier];
                            console.log(ex.stack);
                        }
                    }
                    this.$queue.length = 0;

                }
            };

            this.$DOWN = function(id, e, stub) {
                $cleanDragFix();

                // remove not fired pointer pressed from queue if necessary
                var i = this.$indexOfQ(id);
                if (i >= 0) {
                    this.$queue.splice(i, 1);
                }

                // release mouse pressed if it has not happened before
                var mp = $pointerPressedEvents[id];
                if (mp != null) {
                    mp.$adapter.$UP(id, e, mp.stub);
                }

                // count pointer pressed
                stub.touchCounter++;

                try {
                    // put pointer pressed in queue
                    this.$queue.push({
                        pageX       : Math.floor(e.pageX),
                        pageY       : Math.floor(e.pageY),
                        pressPageX  : Math.floor(e.pageX),
                        pressPageY  : Math.floor(e.pageY),
                        target      : e.target,
                        direction   : null,
                        identifier  : id,
                        shiftKey    : e.shiftKey,
                        altKey      : e.altKey,
                        metaKey     : e.metaKey,
                        ctrlKey     : e.ctrlKey,
                        time        : (new Date()).getTime(),
                        $adapter    : this,
                        $adx        : 0,
                        $ady        : 0,
                        isDragged   : false,
                        stub        : stub
                    });

                    // initiate timer to send collected new touch events
                    // if any new has appeared. the timer helps to collect
                    // events in one group
                    if (this.$queue.length > 0 && this.$timer === null) {
                        var $this = this;
                        this.$timer = setTimeout(function() {
                            $this.$timer = null;
                            $this.$firePressedFromQ(); // flush queue
                        }, 25);
                    }
                }
                catch(ee) {
                    // restore touch counter if an error has happened
                    if (stub.touchCounter > 0) stub.touchCounter--;
                    throw ee;
                }
            };

            this.$MMOVE = function(e) {
                var pageX = Math.floor(e.pageX),
                    pageY = Math.floor(e.pageY) ;

                // ignore extra mouse moved event that can appear in IE
                if (this.$mousePageY != pageY || this.$mousePageX != pageX) {

                    this.$mousePageX = pageX;
                    this.$mousePageY = pageY;


                    if ($pointerPressedEvents[LMOUSE] != null || $pointerPressedEvents[RMOUSE] != null) {
                        if ($pointerPressedEvents[LMOUSE] != null) {
                            this.$DRAG(LMOUSE, e, ME_STUB);
                        }

                        if ($pointerPressedEvents[RMOUSE] != null) {
                            this.$DRAG(RMOUSE, e, ME_STUB);
                        }
                    }
                    else {
                        // initialize native fields
                        ME_STUB.$fillWith("mouse", e);
                        this.destination.$pointerMoved(ME_STUB);
                    }
                }
            };
        },

        function (element, destination) {
            this.destination = destination;
            this.element     = element;

            var $this = this;

            element.onmousedown = function(e) {
                // ignore any mouse buttons except left
                // and right buttons or long touch emulates mouse event what causes generations of
                // mouse down event after touch start event. Let's suppress it
                if ((e.button !== 0 && e.button !== 2) ||
                     $this.$touchedAt(e.pageX, e.pageY, 0))
                {
                    e.preventDefault();
                }
                else {
                    $this.$DOWN(e.button == 0 ? LMOUSE : RMOUSE, e, ME_STUB);
                    e.stopPropagation();
                }
            };


            //  Possible cases of mouse up events:
            //
            //   a) +-------------+        b) +----------------+       c) +---------------+
            //      |  E          |           | E +----+       |          | E       +-----|
            //      |      p--u   |          |    | p--|-u     |          |         |  p--|-u
            //      |             |           |   +----+       |          |         +-----|
            //      +-------------+           +----------------+          +---------------+
            // (out to document/body)      (out from kid to element)   (out from kid to document)
            //
            //   d) +--------+--------+    e) +----------+----------+    f) +---------+-------+
            //      | E      |        |       |  E +-----|-----+    |       | E +-----|       |
            //      |     p--|--u     |       |    | p---|--u  |    |       |   |  p--|-u     |
            //      |        |        |       |    +-----|-----+    |       |   +-----|       |
            //      +--------+--------+       +----------+----------+       +---------+-------+
            //     (out from element to       (out from kid of element     (out from kid element
            //      other element)            to kid of another element)    to another element)
            // Contract:
            //   -- handle only mouse events whose destination is the passed element
            //   -- does stop propagation if event has been handled
            //   -- clear drag  fix ?
            element.onmouseup = function(e) {
                // ignore any mouse buttons except left
                // and right buttons
                if (e.button !== 0 && e.button !== 2) {
                    e.preventDefault();
                }
                else {
                    var id = e.button == 0 ? LMOUSE : RMOUSE,
                        mp = $pointerPressedEvents[id];

                    $this.$UP(id, e, ME_STUB);

                    if (e.stopPropagation != null) e.stopPropagation();
                }
            };

            // mouse over has to setup if necessary current over element variable
            // it requires to detect repeat mouse over event that happens when
            // for instance we switch between browser and other application, but
            // mouse cursor stays at the same place
            element.onmouseover = function(e) {
                // this code prevent mouse over for first touch on iOS and Android
                if ($this.$touchedAt(e.pageX, e.pageY, 0)) {
                    e.preventDefault();
                }
                else {
                    var id = e.button == 0 ? LMOUSE : RMOUSE,
                        mp = $pointerPressedEvents[id];

                    // if a button has not been pressed handle mouse entered to detect
                    // zebkit component the mouse pointer entered and send appropriate
                    // mouse entered event to it
                    if (mp == null) {
                        // just for the sake of error prevention
                        // clean global move listeners
                        $cleanDragFix();

                        // if entered element is null or the target element
                        // is not a children/element of the entered element than
                        // fires pointer entered event
                        if ($enteredElement == null || ($enteredElement.contains(e.target) === false && $enteredElement !== e.target)) {
                            ME_STUB.$fillWith("mouse", e);
                            $enteredElement = element;
                            destination.$pointerEntered(ME_STUB);
                        }
                    }
                    else {
                        // remove any previously registered listener if
                        //  -- a mouse button has been pressed
                        //  -- a mouse button has been pressed on the canvas we have entered
                        if (element === e.target || element.contains(e.target)) {
                            $cleanDragFix();
                        }
                    }

                    e.stopPropagation();
                }
            };

            //  Possible cases of mouse out events:
            //
            //   a) +-------------+        b) +----------------+       c) +---------------+
            //      |  E          |           | E +----+       |          | E       +-----|
            //      |        *----|->         |   | *--|->     |          |         |  *--|->
            //      |             |           |   +----+       |          |         +-----|
            //      +-------------+           +----------------+          +---------------+
            // (out to document/body)      (out from kid to element)   (out from kid to document)
            //
            //   d) +--------+--------+    e) +----------+----------+    f) +---------+-------+
            //      | E      |        |       |  E +-----|-----+    |       | E +-----|       |
            //      |     *--|-->     |       |    | *---|-->  |    |       |   |  *--|->     |
            //      |        |        |       |    +-----|-----+    |       |   +-----|       |
            //      +--------+--------+       +----------+----------+       +---------+-------+
            //     (out from element to       (out from kid of element     (out from kid element
            //      other element)            to kid of another element)    to another element)
            //
            //   1) a mouse button doesn't have to be pressed on any element
            //   2) e.target always equals to element (E), just because we register event handler
            //      for element. This guarantees element will get mouse out event only from itself
            //      and its children elements
            //   3) mouse out should trigger pointerExited event only if the relatedTarget element
            //      is not the element (E) or kid of the element (E)
            //   4) if a mouse button has been pressed than mouse out registers mouse move listener
            //      to track drag events if the listener has nor been registered yet.
            //   5) mouse out set to null $enteredElement

            element.onmouseout = function(e) {
                var id = e.button == 0 ? LMOUSE : RMOUSE,
                    mp = $pointerPressedEvents[id];

                // no pressed button exists
                if (mp == null) {
                    // the target element is the not a kid of the element
                    if ($enteredElement != null && (e.relatedTarget != null     &&
                                                    e.relatedTarget !== element &&
                                                    element.contains(e.relatedTarget) === false))
                    {
                        $enteredElement = null;
                        ME_STUB.$fillWith("mouse", e);

                        if (zebkit.web.$isInsideElement(element, e.pageX, e.pageY) === false) {
                            destination.$pointerExited(ME_STUB);
                        }
                    }
                }
                else {
                    // if a button has been pressed but the mouse cursor is outside of
                    // the canvas, for a time being start listening mouse moved events
                    // of Window to emulate mouse moved events in canvas
                    if ($tmpWinMouseMoveListener == null &&
                        e.relatedTarget != null &&
                        element.contains(e.relatedTarget) === false)
                    {
                        // !!! ignore touchscreen devices
                        if (id === LMOUSE || id === RMOUSE) {
                            $tmpWinMouseMoveListener = function(ee) {
                                ee.stopPropagation();

                                if ($pointerPressedEvents[LMOUSE] != null) {
                                    $this.$DRAG(LMOUSE, {
                                        pageX  : ee.pageX,
                                        pageY  : ee.pageY,
                                        target : mp.target,
                                    }, ME_STUB);
                                }

                                if ($pointerPressedEvents[RMOUSE] != null) {
                                    $this.$DRAG(RMOUSE, {
                                        pageX  : ee.pageX,
                                        pageY  : ee.pageY,
                                        target : mp.target,
                                    }, ME_STUB);
                                }

                                ee.preventDefault();
                            };

                            window.addEventListener("mousemove", $tmpWinMouseMoveListener, true);
                        }
                    }
                }

                $this.$mousePageX = $this.$mousePageY = -1;
                e.stopPropagation();
            };

            if ("onpointerdown" in window || "onmspointerdown" in window) {
                var names = "onpointerdown" in window ? [ "pointerdown",
                                                          "pointerup",
                                                          "pointermove",
                                                          "pointerenter",
                                                          "pointerleave" ]
                                                      : [ "MSPointerDown",
                                                          "MSPointerUp",
                                                          "MSPointerMove",
                                                          "MSPointerEnter",
                                                          "MSPointerLeave" ];

                element.addEventListener(names[0], function(e) {
                    if (e.pointerType !== "mouse")  {
                        POINTER_STUB.touch = e;
                        $this.$DOWN(e.pointerId, e, POINTER_STUB);
                    }
                }, false);

                element.addEventListener(names[1], function(e) {
                    if (e.pointerType !== "mouse") {
                        POINTER_STUB.touch = e;
                        $this.$UP(e.pointerId, e, POINTER_STUB);
                    }
                }, false);

                element.addEventListener(names[2], function(e) {
                    if (e.pointerType !== "mouse") {
                        POINTER_STUB.touch = e;
                        $this.$DRAG(e.pointerId, e, POINTER_STUB);
                    }
                    else {
                        $this.$MMOVE(e);
                    }
                }, false);
            }
            else {
                function isIn(t, id) {
                    for(var i = 0; i < t.length; i++) {
                        if (t[i].identifier == id) return true;
                    }
                    return false;
                }

                element.addEventListener("touchstart", function(e) {
                    var allTouches = e.touches,
                        newTouches = e.changedTouches; // list of touch events that become
                                               // active with the current touchstart


                    // fix android bug: parasite event for multi touch
                    // or stop capturing new touches since it is already fixed
                    // TODO: have no idea what it is
                    // if (TOUCH_STUB.touchCounter > e.touches.length) {
                    //     return;
                    // }

                    // android devices fire mouse move if touched but not moved
                    // let save coordinates what should prevent mouse move event
                    // generation
                    //
                    // TODO: not clear if second tap will fire mouse move or if the
                    // second tap will have any influence to first tap mouse move
                    // initiation
                    $this.$mousePageX = Math.floor(e.pageX);
                    $this.$mousePageY = Math.floor(e.pageY);

                    // fire touches that has not been fired yet
                    for(var i = 0; i < newTouches.length; i++) {  // go through all touches
                        var newTouch = newTouches[i];
                        $this.$DOWN(newTouch.identifier, newTouch, TOUCH_STUB);
                    }

                    // clear touches that still is not in list of touches
                    for (var k in $pointerPressedEvents) {
                        if (isIn(allTouches, k) === false) {
                            var tt = $pointerPressedEvents[k];
                            if (tt.group != null) tt.group.active = false;
                            $this.$UP(tt.identifier, tt, TOUCH_STUB);
                        }
                    }

                    //!!!
                    //TODO: this calling prevents generation of phantom mouse move event
                    //but it is not clear if it will stop firing touch end/move events
                    //for some mobile browsers. Check it !
                    e.preventDefault();

                }, false);

                element.addEventListener("touchend", function(e) {
                    // update touches
                    var t = e.changedTouches;
                    for (var i = 0; i < t.length; i++) {
                        var tt = t[i];
                        $this.$UP(tt.identifier, tt, TOUCH_STUB);
                    }

                    e.preventDefault();
                }, false);

                element.addEventListener("touchmove", function(e) {
                    var mt = e.changedTouches;

                    // clear dx, dy for not updated touches
                    for(var k in $this.touches) {
                        $pointerPressedEvents[k].dx = $pointerPressedEvents[k].dy = 0;
                    }

                    for(var i=0; i < mt.length; i++) {
                        var nmt = mt[i],
                            t   = $pointerPressedEvents[nmt.identifier];

                        if (t != null && (t.pageX != Math.floor(nmt.pageX) ||
                                          t.pageY != Math.floor(nmt.pageY))  )
                        {
                            $this.$DRAG(t.identifier, t, TOUCH_STUB);
                        }
                    }

                    e.preventDefault();
                }, false);


                element.onmousemove = function(e) {
                    $this.$MMOVE(e);
                    e.stopPropagation();
                };
            }

            // TODO: not sure it has to be in pointer unifier
            element.oncontextmenu = function(e) {
                e.preventDefault();
            };
        }
    ]);

})(zebkit("ui"), zebkit.Class);
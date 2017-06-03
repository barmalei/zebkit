zebkit.package("ui.event", function(pkg, Class) {

   /**
    *  UI  event and event manager package.
    *  @class zebkit.ui.event
    *  @access package
    */

    /**
     *  UI manager class. The class is widely used as a basement for building various UI managers
     *  like focus, event managers etc. Manager is automatically registered as global events
     *  listener for events it implements to handle.
     *  @class zebkit.ui.event.Manager
     *  @constructor
     */
    pkg.Manager = Class([
        function() {
            //TODO: correct to event package
            if (zebkit.ui.events !== null && typeof zebkit.ui.events !== 'undefined') {
                zebkit.ui.events.on(this);
            }
        }
    ]);

    /**
     * Component event class. Component events are fired when:
     *
     *   - a component is re-located ("compMoved" event)
     *   - a component is re-sized ("compResized" event)
     *   - a component visibility is updated ("compShown" event)
     *   - a component is enabled ("compEnabled" event)
     *   - a component has been inserted into another component ("compAdded" event)
     *   - a component has been removed from another component ("compRemoved" event)
     *
     * Appropriate event type is set in the event id property.
     * @constructor
     * @class   zebkit.ui.event.CompEvent
     * @extends zebkit.util.Event
     */
    pkg.CompEvent = Class(zebkit.util.Event, [
        function $prototype() {
            /**
             * A kid component that has been added or removed (depending on event type).
             * @attribute kid
             * @readOnly
             * @default null
             * @type {zebkit.ui.Panel}
             */
            this.kid = this.constraints = null;

            /**
             * A constraints with that a kid component has been added or removed (depending on event type).
             * @attribute constraints
             * @readOnly
             * @default null
             * @type {Object}
             */

            /**
             * A previous x location the component has had.
             * @readOnly
             * @attribute prevX
             * @type {Integer}
             * @default -1
             */

            /**
             * A previous y location the component has had.
             * @readOnly
             * @attribute prevY
             * @type {Integer}
             * @default -1
             */

            /**
             * An index at which a component has been added or removed.
             * @readOnly
             * @attribute index
             * @type {Integer}
             * @default -1
             */

            /**
             * A previous width the component has had.
             * @readOnly
             * @attribute prevWidth
             * @type {Integer}
             * @default -1
             */

            /**
             * A previous height the component has had.
             * @readOnly
             * @attribute height
             * @type {Integer}
             * @default -1
             */
            this.prevX = this.prevY = this.index = -1;
            this.prevWidth = this.prevHeight = -1;
        }
    ]);

    /**
     * Input key event class.
     * @class  zebkit.ui.event.KeyEvent
     * @extends zebkit.util.Event
     * @constructor
     */
    pkg.KeyEvent = Class(zebkit.util.Event, [
        function $prototype() {
            /**
             * A code of a pressed key
             * @attribute code
             * @readOnly
             * @type {Strung}
             */
            this.code = null;

            /**
             * A pressed key
             * @attribute key
             * @readOnly
             * @type {String}
             */
            this.key = null;

            /**
             * Input device type. Can be for instance "keyboard", vkeyboard" (virtual keyboard)
             * @attribute device
             * @default "keyboard"
             * @type {String}
             */
            this.device = "keyboard";

            /**
             * Boolean that shows state of ALT key.
             * @attribute altKey
             * @type {Boolean}
             * @readOnly
             */
            this.altKey = false;

            /**
             * Boolean that shows state of SHIFT key.
             * @attribute shiftKey
             * @type {Boolean}
             * @readOnly
             */
            this.shiftKey = false;

            /**
             * Boolean that shows state of CTRL key.
             * @attribute ctrlKey
             * @type {Boolean}
             * @readOnly
             */
            this.ctrlKey = false;

            /**
             * Boolean that shows state of META key.
             * @attribute metaKey
             * @type {Boolean}
             * @readOnly
             */
            this.metaKey = false;

            /**
             * Repeat counter
             * @attribute repeat
             * @type {Number}
             */
            this.repeat = 0;

            /**
             * Time stamp
             * @attribute  timeStamp
             * @type {Number}
             */
            this.timeStamp = 0;

            /**
             * Get the given modifier key state. The following modifier key codes are supported:
             * "Meta", "Control", "Shift", "Alt".
             * @param  {String} m a modifier key code
             * @return {Boolean} true if the modifier key state is pressed.
             * @method getModifierState
             */
            this.getModifierState = function(m) {
                if (m === "Meta") {
                    return this.metaKey;
                }

                if (m === "Control") {
                    return this.ctrlKey;
                }

                if (m === "Shift") {
                    return this.shiftKey;
                }

                if (m === "Alt") {
                    return this.altKey;
                }

                throw new Error("Unknown modifier key '" + m + "'");
            };
        }
    ]);

    /**
     * Mouse and touch screen input event class. The input event is triggered by a mouse or
     * touch screen.
     * @class  zebkit.ui.event.PointerEvent
     * @extends zebkit.util.Event
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
             * Pointer identifier.
             * @attribute identifier
             * @type {Object}
             * @default null
             */
            this.identifier = null;

            this.shiftKey = this.altKey = this.metaKey = this.ctrlKey = false;

            this.pressure = 0.5;

            /**
             * Absolute mouse pointer x coordinate
             * @attribute absX
             * @readOnly
             * @type {Integer}
             */
            this.absX = 0;

            /**
             * Absolute mouse pointer y coordinate
             * @attribute absY
             * @readOnly
             * @type {Integer}
             */
             this.absY = 0;

            /**
             * Mouse pointer x coordinate (relatively to source UI component)
             * @attribute x
             * @readOnly
             * @type {Integer}
             */
            this.x = 0;

            /**
             * Mouse pointer y coordinate (relatively to source UI component)
             * @attribute y
             * @readOnly
             * @type {Integer}
             */
            this.y = 0;

            /**
             * Recompute the event relative location for the new source component and it
             * absolute location
             * @private
             * @param  {zebkit.ui.Panel} source  a source component that triggers the event
             * @param  {Integer} ax an absolute (relatively to a canvas where the source
             * component is hosted) x mouse cursor coordinate
             * @param  {Integer} ay an absolute (relatively to a canvas where the source
             * component is hosted) y mouse cursor coordinate
             * @method  updateCoordinates
             */
            this.update = function(source, ax, ay){
                // this can speed up calculation significantly check if source zebkit component
                // has not been changed, his location and parent component also has not been
                // changed than we can skip calculation of absolute location by traversing
                // parent hierarchy
                if (this.source        === source        &&
                    this.source.parent === source.parent &&
                    source.x           === this.$px      &&
                    source.y           === this.$py         )
                {
                    this.x += (ax - this.absX);
                    this.y += (ay - this.absY);
                    this.absX = ax;
                    this.absY = ay;
                    this.source = source;
                } else {
                    this.source = source;
                    this.absX = ax;
                    this.absY = ay;

                    // convert absolute location to relative location
                    while (source.parent !== null) {
                        ax -= source.x;
                        ay -= source.y;
                        source = source.parent;
                    }
                    this.x = ax;
                    this.y = ay;
                }

                this.$px = source.x;
                this.$py = source.y;
                return this;
            };

            this.isAction = function() {
                // TODO: actually this is abstract method
                throw new Error("Not implemented");
            };

            this.getTouches = function() {
                // TODO: actually this is abstract method
                throw new Error("Not implemented");
            };
        }
    ]);

    /**
     * Event manager class. One of the key zebkit manager that is responsible for distributing various
     * events in zebkit UI. The manager provides possibility to catch and handle UI events globally. Below
     * is list event types that can be caught with the event manager:
     *
     *   - Key events:
     *     - "keyTyped"
     *     - "keyReleased"
     *     - "keyPressed"
     *
     *   - Pointer events:
     *     - "pointerDragged"
     *     - "pointerDragStarted"
     *     - "pointerDragEnded"
     *     - "pointerMoved"
     *     - "pointerClicked"
     *     - "pointerDoubleClicked"
     *     - "pointerPressed"
     *     - "pointerReleased"
     *     - "pointerEntered"
     *     - "pointerExited"
     *
     *   - Focus event:
     *     - "focusLost"
     *     - "focusGained"
     *
     *   - Component events:
     *     - "compSized"
     *     - "compMoved"
     *     - "compEnabled"
     *     - "compShown"
     *     - "compAdded"
     *     - "compRemoved"
     *
     *   - Window events:
     *     - "winOpened"
     *     - "winActivated"
     *
     *   - Menu events:
     *     - "menuItemSelected'
     *
     *   - Shortcut events:
     *     - "shortcutFired"
     *
     * Current events manager is available with "zebkit.ui.events"
     *
     * @class zebkit.ui.event.EventManager
     * @constructor
     * @extends {zebkit.ui.event.Manager}
     * @example
     *
     *     // catch all pointer pressed events that are triggered by zebkit UI
     *     zebkit.ui.events.on("pointerPressed", function(e) {
     *         // handle event
     *         ...
     *     });
     */
    pkg.EventManager = Class(pkg.Manager, zebkit.EventProducer, [
        function() {
            this._ = new this.clazz.Listerners();
            this.$super();
        },

        function $clazz(argument) {
            var eventNames = [
                'keyTyped',
                'keyReleased',
                'keyPressed',
                'pointerDragged',
                'pointerDragStarted',
                'pointerDragEnded',
                'pointerMoved',
                'pointerClicked',
                'pointerDoubleClicked',
                'pointerPressed',
                'pointerReleased',
                'pointerEntered',
                'pointerExited',

                'focusLost',
                'focusGained',

                'compSized',
                'compMoved',
                'compEnabled',
                'compShown',
                'compAdded',
                'compRemoved'
            ];

            this.$CHILD_EVENTS_MAP = {};

            // add child<eventName> events names mapping
            for(var i = 0; i < eventNames.length; i++) {
                var eventName = eventNames[i];
                this.$CHILD_EVENTS_MAP[eventName] = "child" + eventName[0].toUpperCase() + eventName.substring(1);
            }

            this.Listerners = zebkit.util.ListenersClass.apply(this, eventNames);
        },

        function $prototype(clazz) {
            var $CEM = clazz.$CHILD_EVENTS_MAP;

            this.regEvents = function() {
                this._.addEvents.apply(this._, arguments);

                // add child<eventName> events names mapping
                for(var i = 0; i < arguments.length; i++) {
                    var eventName = arguments[i];
                    $CEM[eventName] = "child" + eventName[0].toUpperCase() + eventName.substring(1);
                }
            };

            /**
             * Fire event with the given id
             * @param  {String} id an event id type
             * @param  {zebkit.util.Event} e different sort of event
             * @return {Boolean} boolean flag that indicates if a event handling has been interrupted on one of a stage:
             *
             *    - Suppressed by a target component
             *    - By a global listener
             *    - By a target component event listener
             *
             * @method  fire
             * @protected
             */
            this.fire = function(id, e) {
                var childEvent = $CEM[id];

                // assign id that matches method to be called
                e.id = id;

                // TODO: not stable concept. the idea to suppress event
                // distribution to global listeners (managers) and child
                // components
                if (typeof e.source.suppressEvent !== 'undefined' &&
                    e.source.suppressEvent(e) === true)
                {
                    return true;
                }

                // call global listeners
                if (this._[id](e) === false) {
                    // call target component listener
                    if (typeof e.source[id] !== 'undefined' && e.source[id].call(e.source, e) === true) {
                        return true;
                    }

                    // call parent listeners
                    for(var t = e.source.parent; t !== null; t = t.parent){
                        if (typeof t[childEvent] !== 'undefined') {
                            t[childEvent].call(t, e);
                        }
                    }

                    return false;
                } else {
                    return true;
                }
            };
        }
    ]);

    /**
     * Event manager reference. The reference can be used to register listeners that can
     * get all events of the given type that are fired by zebkit UI. For instance you can
     * catch all pointer pressed events as follow:
     * @example
     *
     *     zebkit.ui.events.on("pointerPressed", function(e) {
     *         // handle pointer pressed event here
     *         ...
     *     });
     *
     * @attribute events
     * @type {zebkit.ui.event.EventManager}
     * @readOnly
     */

     // TODO: correct to event package
     //this.events = new pkg.EventManager();
     zebkit.ui.events = new pkg.EventManager();

     /**
      * Base class to implement clipboard manager.
      * @class zebkit.ui.event.Clipboard
      * @constructor
      * @extends zebkit.ui.event.Manager
      */
     pkg.Clipboard = Class(pkg.Manager, [
         function $prototype() {
             /**
              * Get destination component. Destination component is a component that
              * is currently should participate in clipboard data exchange.
              * @return {zebkit.ui.Panel} a destination component.
              * @method getDestination
              */
             this.getDestination = function() {
                 //TODO: may be focusManager has to be moved to "ui.event" package
                 return zebkit.ui.focusManager.focusOwner;
             };
         }
     ]);

     /**
      * Base class to implement cursor manager.
      * @class zebkit.ui.event.CursorManager
      * @constructor
      * @extends zebkit.ui.event.Manager
      */
     pkg.CursorManager = Class(pkg.Manager, [
        function $prototype() {
            /**
             * Current cursor type
             * @attribute cursorType
             * @type {String}
             * @readOnly
             * @default "default"
             */
            this.cursorType = "default";
        }
     ]);
});
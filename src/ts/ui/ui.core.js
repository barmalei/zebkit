zebkit.package("ui", function(pkg, Class) {

/**
 * Zebkit UI. The UI is powerful way to create any imaginable
 * user interface for WEB. The idea is based on developing
 * hierarchy of UI components that sits and renders on HTML5
 * Canvas element.
 *
 * Write zebkit UI code in safe place where you can be sure all
 * necessary structure, configurations, etc are ready. The safe
 * place is "zebkit.ready(...)" method. Development of zebkit UI
 * application begins from creation "zebkit.ui.zCanvas" class,
 * that is starting point and root element of your UI components
 * hierarchy. "zCanvas" is actually wrapper around HTML5 Canvas
 * element where zebkit UI sits on. The typical zebkit UI coding
 * template is shown below:

     // build UI in safe place
     zebkit.ready(function() {
        // create canvas element
        var c = new zebkit.ui.zCanvas(400, 400);

        // start placing UI component on c.root panel
        //set layout manager
        c.root.setLayout(new zebkit.layout.BorderLayout());
        //add label to top
        c.root.add("top",new zebkit.ui.Label("Top label"));
        //add text area to center
        c.root.add("center",new zebkit.ui.TextArea(""));
        //add button area to bottom
        c.root.add("bottom",new zebkit.ui.Button("Button"));
        ...
     });

 *  The latest version of zebkit JavaScript is available in repository:

        <script src='http://repo.zebkit.org/latest/zebkit.min.js'
                type='text/javascript'></script>

 * @module ui
 * @main ui
 * @requires zebkit, util, io, data
 */

var temporary = { x:0, y:0, width:0, height:0 }, COMP_EVENT, FOCUS_EVENT;

// keep pointer owners (the component where cursor/finger placed in)
pkg.$pointerOwner = {};
pkg.$pointerPressedOwner = {};

pkg.FocusEvent = Class(zebkit.util.Event, [
    function $prototype() {
        this.related = null;
    }
]);

pkg.CompEvent = Class(zebkit.util.Event, [
    function $prototype() {
        this.kid = this.constraints = null;
        this.prevX = this.prevY = this.index = -1;
        this.prevWidth = this.prevHeight = -1;
    }
]);

COMP_EVENT     = new pkg.CompEvent();
FOCUS_EVENT    = new pkg.FocusEvent();
SHORTCUT_EVENT = new zebkit.util.Event();

//
// Extend Pointer event with zebkit specific fields and methods
//
pkg.PointerEvent.extend([
    function $prototype() {
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
         * Reset the event properties with new values
         * @private
         * @param  {zebkit.ui.Panel} source  a source component that triggers the event
         * @param  {Integer} ax an absolute (relatively to a canvas where the source
         * component is hosted) x mouse cursor coordinate
         * @param  {Integer} ay an absolute (relatively to a canvas where the source
         * component is hosted) y mouse cursor coordinate
         * @method  updateCoordinates
         */
        this.update = function(source,ax,ay){
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
                while (source.parent != null) {
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
    }
]);

pkg.load = function(path, callback) {
    return new pkg.Bag(pkg).load(path, callback);
};

pkg.Bag = Class(zebkit.util.Bag, [
    function $prototype() {
        this.globalPropertyLookup = this.usePropertySetters = true;

        this.loadImage = function(path) {
            if (this.url != null && zebkit.URL.isAbsolute(path) === false) {
                var base = (new zebkit.URL(this.url)).getParentURL();
                path = base.join(path);
            }
            return zebkit.web.$loadImage(path);
        };
    },

    function load(s, cb) {
        if (cb != null) {
            zebkit.busy();
            try {
                return this.$super(s, function(e) {
                    // if an error during loading has happened callback method
                    // gets the error as a single argument. The problem callback itself
                    // can triggers the error and than be called second time but
                    // with the error as argument. So we have to recognize the situation
                    // by analyzing if the callback gets an error as
                    if (e == null) {
                        zebkit.ready();
                    }
                    cb.call(this, e);
                });
            }
            catch(e) {
                zebkit.ready();
                throw e;
            }
        }

        return this.$super(s, null);
    }
]);

pkg.$getPS = function(l) {
    return l != null && l.isVisible === true ? l.getPreferredSize()
                                             : { width:0, height:0 };
};

pkg.$cvp = function(c, r) {
    if (c.width > 0 && c.height > 0 && c.isVisible === true){
        var p = c.parent, px = -c.x, py = -c.y;
        if (r == null) {
            r = { x:0, y:0, width : c.width, height : c.height };
        } else {
            r.x = r.y = 0;
            r.width  = c.width;
            r.height = c.height;
        }


        while (p != null && r.width > 0 && r.height > 0) {
            var xx = r.x > px ? r.x : px,
                yy = r.y > py ? r.y : py,
                w1 = r.x + r.width,
                w2 = px  + p.width,
                h1 = r.y + r.height,
                h2 = py + p.height;

            r.width  = (w1 < w2 ? w1 : w2) - xx,
            r.height = (h1 < h2 ? h1 : h2) - yy;
            r.x = xx;
            r.y = yy;

            px -= p.x;
            py -= p.y;
            p = p.parent;
        }

        return r.width > 0 && r.height > 0 ? r : null;
    }
    return null;
};

pkg.Cursor = {
    DEFAULT     : "default",
    MOVE        : "move",
    WAIT        : "wait",
    TEXT        : "text",
    HAND        : "pointer",
    NE_RESIZE   : "ne-resize",
    SW_RESIZE   : "sw-resize",
    SE_RESIZE   : "se-resize",
    NW_RESIZE   : "nw-resize",
    S_RESIZE    : "s-resize",
    W_RESIZE    : "w-resize",
    N_RESIZE    : "n-resize",
    E_RESIZE    : "e-resize",
    COL_RESIZE  : "col-resize",
    HELP        : "help"
};

pkg.makeFullyVisible = function(d,c){
    if (arguments.length === 1) {
        c = d;
        d = c.parent;
    }

    var right  = d.getRight(),
        top    = d.getTop(),
        bottom = d.getBottom(),
        left   = d.getLeft(),
        xx     = c.x,
        yy     = c.y;

    if (xx < left) xx = left;
    if (yy < top)  yy = top;
    if (xx + c.width > d.width - right) xx = d.width + right - c.width;
    if (yy + c.height > d.height - bottom) yy = d.height + bottom - c.height;
    c.setLocation(xx, yy);
};

pkg.calcOrigin = function(x,y,w,h,px,py,t,tt,ll,bb,rr){
    if (arguments.length < 8) {
        tt = t.getTop();
        ll = t.getLeft();
        bb = t.getBottom();
        rr = t.getRight();
    }

    var dw = t.width, dh = t.height;
    if (dw > 0 && dh > 0){
        if (dw - ll - rr > w){
            var xx = x + px;
            if (xx < ll) px += (ll - xx);
            else {
                xx += w;
                if (xx > dw - rr) px -= (xx - dw + rr);
            }
        }
        if (dh - tt - bb > h){
            var yy = y + py;
            if (yy < tt) py += (tt - yy);
            else {
                yy += h;
                if (yy > dh - bb) py -= (yy - dh + bb);
            }
        }
        return [px, py];
    }
    return [0, 0];
};

/**
 *  This the core UI component class. All other UI components has to be
 *  successor of panel class.

      // instantiate panel with no arguments
      var p = new zebkit.ui.Panel();

      // instantiate panel with border layout set as its layout manager
      var p = new zebkit.ui.Panel(new zebkit.layout.BorderLayout());

      // instantiate panel with the given properties (border
      // layout manager, blue background and plain border)
      var p = new zebkit.ui.Panel({
         layout: new zebkit.ui.BorderLayout(),
         background : "blue",
         border     : "plain"
      });

 * **Container. **
 * Panel can contains number of other UI components as its children where
 * the children components are placed with a defined by the panel layout
 * manager:

      // add few children component to panel top, center and bottom parts
      // with help of border layout manager
      var p = new zebkit.ui.Panel();
      p.setLayout(new zebkit.layout.BorderLayout(4)); // set layout manager to
                                                     // order children components

      p.add("top", new zebkit.ui.Label("Top label"));
      p.add("center", new zebkit.ui.TextArea("Text area"));
      p.add("bottom", new zebkit.ui.Button("Button"));

 * **Events. **
 * The class provides possibility to catch various component and input
 * events by declaring an appropriate event method handler. The most
 * simple case you just define a method:

      var p = new zebkit.ui.Panel();
      p.pointerPressed = function(e) {
          // handle event here
      };

* If you prefer to create an anonymous class instance you can do it as
* follow:

      var p = new zebkit.ui.Panel([
          function pointerPressed(e) {
              // handle event here
          }
      ]);

* One more way to add the event handler is dynamic extending of an instance
* class demonstrated below:

      var p = new zebkit.ui.Panel("Test");
      p.extend([
          function pointerPressed(e) {
              // handle event here
          }
      ]);

 * Pay attention Zebkit UI components often declare own event handlers and
 * in this case you can overwrite the default event handler with a new one.
 * Preventing the basic event handler execution can cause the component will
 * work improperly. You should care about the base event handler execution
 * as follow:

      // button component declares own pointer pressed event handler
      // we have to call the original handler to keep the button component
      // properly working
      var p = new zebkit.ui.Button("Test");
      p.extend([
          function pointerPressed(e) {
              this.$super(e); // call parent class event handler implementation
              // handle event here
          }
      ]);

 *  @class zebkit.ui.Panel
 *  @param {Object|zebkit.layout.Layout} [l] pass a layout manager or
 *  number of properties that have to be applied to the instance of
 *  the panel class.
 *  @constructor
 *  @extends zebkit.layout.Layoutable
 */



/**
 * Implement the event handler method to catch pointer pressed event.
 * The event is triggered every time a pointer button has been pressed or
 * a finger has touched a touch screen.

     var p = new zebkit.ui.Panel();
     p.pointerPressed = function(e) { ... }; // add event handler

 * @event pointerPressed
 * @param {zebkit.ui.PointerEvent} e a pointer event
*/

/**
 * Implement the event handler method to catch pointer released event.
 * The event is triggered every time a pointer button has been released or
 * a finger has untouched a touch screen.

     var p = new zebkit.ui.Panel();
     p.pointerReleased = function(e) { ... }; // add event handler

 * @event pointerReleased
 * @param {zebkit.ui.PointerEvent} e a pointer event
 */

/**
 * Implement the event handler method  to catch pointer moved event.
 * The event is triggered every time a pointer cursor has been moved with
 * no a pointer button pressed.

     var p = new zebkit.ui.Panel();
     p.pointerMoved = function(e) { ... }; // add event handler

 * @param {zebkit.ui.PointerEvent} e a pointer event
 * @event  pointerMoved
 */

/**
 * Implement the event handler method to catch pointer entered event.
 * The event is triggered every time a pointer cursor entered the
 * given component.

     var p = new zebkit.ui.Panel();
     p.pointerEntered = function(e) { ... }; // add event handler

 * @param {zebkit.ui.PointerEvent} e a pointer event
 * @event  pointerEntered
 */

/**
 * Implement the event handler method to catch pointer exited event.
 * The event is triggered every time a pointer cursor exited the given
 * component.

     var p = new zebkit.ui.Panel();
     p.pointerExited = function(e) { ... }; // add event handler

 * @param {zebkit.ui.PointerEvent} e a pointer event
 * @event  pointerExited
 */

/**
 * Implement the event handler method to catch pointer clicked event.
 * The event is triggered every time a pointer button has been clicked. Click events
 * are generated only if no one pointer moved or drag events has been generated
 * in between pointer pressed -> pointer released events sequence.

     var p = new zebkit.ui.Panel();
     p.pointerClicked = function(e) { ... }; // add event handler

 * @param {zebkit.ui.PointerEvent} e a pointer event
 * @event  pointerClicked
 */

/**
 * Implement the event handler method to catch pointer dragged event.
 * The event is triggered every time a pointer cursor has been moved when a pointer button
 * has been pressed. Or when a finger has been moved over a touch screen.

     var p = new zebkit.ui.Panel();
     p.pointerDragged = function(e) { ... }; // add event handler

 * @param {zebkit.ui.PointerEvent} e a pointer event
 * @event  pointerDragged
 */

/**
 * Implement the event handler method to catch pointer drag started event.
 * The event is triggered every time a pointer cursor has been moved first time when a pointer button
 * has been pressed. Or when a finger has been moved first time over a touch screen.

     var p = new zebkit.ui.Panel();
     p.pointerDragStarted = function(e) { ... }; // add event handler

 * @param {zebkit.ui.PointerEvent} e a pointer event
 * @event  pointerDragStarted
*/

/**
 * Implement the event handler method to catch pointer drag ended event.
 * The event is triggered every time a pointer cursor has been moved last time when a pointer button
 * has been pressed. Or when a finger has been moved last time over a touch screen.

     var p = new zebkit.ui.Panel();
     p.pointerDragEnded = function(e) { ... }; // add event handler

 * @param {zebkit.ui.PointerEvent} e a pointer event
 * @event  pointerDragEnded
*/

/**
 * Implement the event handler method to catch key pressed event
 * The event is triggered every time a key has been pressed.

     var p = new zebkit.ui.Panel();
     p.keyPressed = function(e) { ... }; // add event handler

 * @param {zebkit.ui.KeyEvent} e a key event
 * @event  keyPressed
 */

/**
 * Implement the event handler method to catch key types event
 * The event is triggered every time a key has been typed.

     var p = new zebkit.ui.Panel();
     p.keyTyped = function(e) { ... }; // add event handler

 * @param {zebkit.ui.KeyEvent} e a key event
 * @event  keyTyped
 */

/**
 * Implement the event handler method to catch key released event
 * The event is triggered every time a key has been released.

     var p = new zebkit.ui.Panel();
     p.keyReleased = function(e) { ... }; // add event handler

 * @param {zebkit.ui.KeyEvent} e a key event
 * @event  keyReleased
 */

/**
 * Implement the event handler method to catch the component sized event
 * The event is triggered every time the component has been re-sized.

     var p = new zebkit.ui.Panel();
     p.compSized = function(c, pw, ph) { ... }; // add event handler

 * @param {zebkit.ui.Panel} c a component that has been sized
 * @param {Integer} pw a previous width the sized component had
 * @param {Integer} ph a previous height the sized component had
 * @event compSized
 */

/**
 * Implement the event handler method to catch component moved event
 * The event is triggered every time the component location has been
 * updated.

     var p = new zebkit.ui.Panel();
     p.compMoved = function(c, px, py) { ... }; // add event handler

 * @param {zebkit.ui.Panel} c a component that has been moved
 * @param {Integer} px a previous x coordinate the moved component had
 * @param {Integer} py a previous y coordinate the moved component had
 * @event compMoved
 */

/**
 * Implement the event handler method to catch component enabled event
 * The event is triggered every time a component enabled state has been
 * updated.

     var p = new zebkit.ui.Panel();
     p.compEnabled = function(c) { ... }; // add event handler

 * @param {zebkit.ui.Panel} c a component whose enabled state has been updated
 * @event compEnabled
 */

/**
 * Implement the event handler method to catch component shown event
 * The event is triggered every time a component visibility state has
 * been updated.

     var p = new zebkit.ui.Panel();
     p.compShown = function(c) { ... }; // add event handler

 * @param {zebkit.ui.Panel} c a component whose visibility state has been updated
 * @event compShown
 */

/**
 * Implement the event handler method to catch component added event
 * The event is triggered every time the component has been inserted into
 * another one.

     var p = new zebkit.ui.Panel();
     p.compAdded = function(p, constr, c) { ... }; // add event handler

 * @param {zebkit.ui.Panel} p a parent component of the component has been added
 * @param {Object} constr a layout constraints
 * @param {zebkit.ui.Panel} c a component that has been added
 * @event compAdded
 */

/**
 * Implement the event handler method to catch component removed event
 * The event is triggered every time the component has been removed from
 * its parent UI component.

     var p = new zebkit.ui.Panel();
     p.compRemoved = function(p, i, c) { ... }; // add event handler

 * @param {zebkit.ui.Panel} p a parent component of the component that has been removed
 * @param {Integer} i an index of removed component
 * @param {zebkit.ui.Panel} c a component that has been removed
 * @event compRemoved
 */

/**
 * Implement the event handler method to catch component focus gained event
 * The event is triggered every time a component has gained focus.

     var p = new zebkit.ui.Panel();
     p.focusGained = function(e) { ... }; // add event handler

 * @param {zebkit.ui.FocusEvent} e an input event
 * @event  focusGained
 */

/**
 * Implement the event handler method to catch component focus lost event
 * The event is triggered every time a component has lost focus

     var p = new zebkit.ui.Panel();
     p.focusLost = function(e) { ... }; // add event handler

 * @param {zebkit.ui.FocusEvent} e an input event
 * @event  focusLost
 */

/**
 * Implement the event handler method to catch children components component events
 *
     var p = new zebkit.ui.Panel();
     p.childCompEvent = function(id, src, p1, p2) { ... }; // add event handler

 * @param {Integer} id a component event ID. The id can have one of the following value:


 * @param {zebkit.ui.Panel} src a component that triggers the event
 * @param {zebkit.ui.Panel|Integer|Object} p1 an event first parameter that depends
 * on an component event that has happened:


   - if id is **zebkit.ui.Panel.SIZED** the parameter is previous component width
   - if id is **zebkit.ui.Panel.MOVED** the parameter is previous component x location
   - if id is **zebkit.ui.Panel.ADDED** the parameter is constraints a new component has been added
   - if id is **zebkit.ui.Panel.REMOVED** the parameter is null

 * @param {zebkit.ui.Panel|Integer|Object} p2 an event second parameter depends
 * on an component event that has happened:


    - if id is **zebkit.ui.Panel.SIZED** the parameter is previous component height
    - if id is **zebkit.ui.Panel.MOVED** the parameter is previous component y location
    - if id is **zebkit.ui.Panel.ADDED** the parameter is reference to the added children component
    - if id is **zebkit.ui.Panel.REMOVED** the parameter is reference to the removed children component

 * @event  childCompEvent
 */

 /**
  * The method is called for focusable UI components (components that can hold input focus) to ask
  * a string to be saved in native clipboard
  *
  * @return {String} a string to be copied in native clipboard
  *
  * @event clipCopy
  */

 /**
  * The method is called to pass string from clipboard to a focusable (a component that can hold
  * input focus) UI component
  *
  * @param {String} s a string from native clipboard
  *
  * @event clipPaste
  */

pkg.Panel = Class(zebkit.layout.Layoutable, [
    function $prototype() {
        // TODO: not stable api, probably it should be moved to static
        this.wrapWithCanvas = function() {
            var c = new pkg.HtmlCanvas();
            c.setLayout(new zebkit.layout.StackLayout());
            c.add(this);
            return c;
        };

        // TODO: not stable api, probably it should be moved to static
        this.wrapWithHtmlElement = function() {
            var c = new pkg.HtmlElement();
            c.setLayout(new zebkit.layout.StackLayout());
            c.add(this);
            return c;
        };

        /**
         * Request the whole UI component or part of the UI component to be repainted
         * @param  {Integer} [x] x coordinate of the component area to be repainted
         * @param  {Integer} [y] y coordinate of the component area to be repainted
         * @param  {Integer} [w] width of the component area to be repainted
         * @param  {Integer} [h] height of the component area to be repainted
         * @method repaint
         */
        this.repaint = function(x,y,w,h) {
            // step I: skip invisible components and components that are not in hierarchy
            //         don't initiate repainting thread for such sort of the components,
            //         but don't forget for zCanvas whose parent field is null, but it has $context
            if (this.isVisible === true && (this.parent != null || this.$context != null)) {
                //!!! find context buffer that holds the given component

                var canvas = this;
                for(; canvas.$context == null; canvas = canvas.parent) {
                    // component either is not in visible state or is not in hierarchy
                    // than stop repaint procedure
                    if (canvas.isVisible === false || canvas.parent == null) {
                        return;
                    }
                }

                // no arguments means the whole component has top be repainted
                if (arguments.length === 0) {
                    x = y = 0;
                    w = this.width;
                    h = this.height;
                }

                // step II: calculate new actual dirty area
                if (w > 0 && h > 0) {
                    var r = pkg.$cvp(this, temporary);
                    if (r != null) {
                        zebkit.util.intersection(r.x, r.y, r.width, r.height, x, y, w, h, r);
                        if (r.width > 0 && r.height > 0) {
                            x = r.x;
                            y = r.y;
                            w = r.width;
                            h = r.height;

                            // calculate repainted component absolute location
                            var cc = this;
                            while (cc != canvas) {
                                x += cc.x;
                                y += cc.y;
                                cc = cc.parent;
                            }

                            // normalize repaint area coordinates
                            if (x < 0) {
                                w += x;
                                x = 0;
                            }
                            if (y < 0) {
                                h += y;
                                y = 0;
                            }
                            if (w + x > canvas.width ) w = canvas.width - x;
                            if (h + y > canvas.height) h = canvas.height - y;

                            // still have what to repaint than calculate new
                            // dirty area of target canvas element
                            if (w > 0 && h > 0) {
                                var da = canvas.$da;

                                // if the target canvas already has a dirty area set than
                                // unite it with requested
                                if (da.width > 0) {
                                    // check if the requested repainted area is not in
                                    // exiting dirty area
                                    if (x < da.x                ||
                                        y < da.y                ||
                                        x + w > da.x + da.width ||
                                        y + h > da.y + da.height  )
                                    {
                                        // !!!
                                        // speed up to comment method call
                                        //MB.unite(da.x, da.y, da.width, da.height, x, y, w, h, da);
                                        var dax = da.x, day = da.y;
                                        if (da.x > x) da.x = x;
                                        if (da.y > y) da.y = y;
                                        da.width  = Math.max(dax + da.width,  x + w) - da.x;
                                        da.height = Math.max(day + da.height, y + h) - da.y;
                                    }
                                } else {
                                    // if the target canvas doesn't have a dirty area set than
                                    // cut (if necessary) the requested repainting area by the
                                    // canvas size

                                    // !!!
                                    // not necessary to call the method since we have already normalized
                                    // repaint coordinates and sizes
                                    //!!! MB.intersection(0, 0, canvas.width, canvas.height, x, y, w, h, da);

                                    da.x      = x;
                                    da.width  = w;
                                    da.y      = y;
                                    da.height = h;
                                }
                            }
                        }
                    }
                }

                // step III: initiate repainting thread
                if (canvas.$paintTask === null && (canvas.isValid === false || canvas.$da.width > 0 || canvas.isLayoutValid === false)) {
                    var $this = this;
                    canvas.$paintTask = zebkit.web.$task(function() {
                        var g = null;
                        try {
                            // do validation before timer will be set to null to avoid
                            // unnecessary timer initiating what can be caused by validation
                            // procedure by calling repaint method
                            if (canvas.isValid === false || canvas.isLayoutValid === false) {
                                canvas.validate();
                            }

                            if (canvas.$da.width > 0) {
                                g = canvas.$context;
                                g.save();

                                // check if the given canvas has transparent background
                                // if it is true call clearRect method to clear dirty area
                                // with transparent background, otherwise it will be cleaned
                                // by filling the canvas with background later
                                if (canvas.bg == null || canvas.bg.isOpaque !== true) {
                                    g.clearRect(canvas.$da.x, canvas.$da.y,
                                                canvas.$da.width, canvas.$da.height);
                                }
                                // !!!
                                // call clipping area later than possible
                                // clearRect since it can bring to error in IE
                                g.clipRect(canvas.$da.x,
                                           canvas.$da.y,
                                           canvas.$da.width,
                                           canvas.$da.height);

                                canvas.paintComponent(g);
                            }

                            canvas.$paintTask = null;
                            // no dirty area anymore
                            canvas.$da.width = -1;
                            if (g !== null) g.restore();
                        }
                        catch(ee) {
                            canvas.$paintTask = null;
                            canvas.$da.width = -1;
                            if (g !== null) {
                                g.restoreAll();
                            }
                            throw ee;
                        }
                    });
                }
            }
        };

        // destination is component itself or one of his composite parent.
        // composite component is a component that grab control from his
        // children component. to make a component composite
        // it has to implement catchInput field or method. If composite component
        // has catchInput method it will be called
        // to detect if the composite component takes control for the given kid.
        // composite components can be embedded (parent composite can take
        // control on its child composite component)
        this.getEventDestination = function() {
            var c = this, p = this;
            while ((p = p.parent) != null) {
                if (p.catchInput != null && (p.catchInput === true || (p.catchInput !== false && p.catchInput(c)))) {
                    c = p;
                }
            }
            return c;
        };

        this.paintComponent = function(g) {
            var ts = g.$states[g.$curState];
            if (ts.width  > 0  &&
                ts.height > 0  &&
                this.isVisible === true)
            {
                // !!!
                // calling setSize in the case of raster layout doesn't
                // cause hierarchy layout invalidation
                if (this.isLayoutValid === false) {
                    this.validate();
                }

                var b = this.bg != null && (this.parent == null || this.bg != this.parent.bg);

                // if component defines shape and has update, [paint?] or background that
                // differs from parent background try to apply the shape and than build
                // clip from the applied shape
                if ( (this.border != null && this.border.outline != null) &&
                     (b || this.update != null)                           &&
                     this.border.outline(g, 0, 0, this.width, this.height, this))
                {
                    g.save();
                    g.clip();

                    if (b) {
                        this.bg.paint(g, 0, 0, this.width, this.height, this);
                    }

                    if (this.update != null) {
                        this.update(g);
                    }

                    g.restore();
                } else {
                    if (b) {
                        this.bg.paint(g, 0, 0, this.width, this.height, this);
                    }
                    if (this.update != null) this.update(g);
                }

                if (this.border != null) {
                    this.border.paint(g, 0, 0, this.width, this.height, this);
                }

                if (this.paint != null) {
                    var left   = this.getLeft(),
                        top    = this.getTop(),
                        bottom = this.getBottom(),
                        right  = this.getRight();

                    if (left > 0 || right > 0 || top > 0 || bottom > 0) {
                        if (ts.width > 0 && ts.height > 0) {
                            var x1   = (ts.x > left ? ts.x : left),
                                y1   = (ts.y > top  ? ts.y : top),
                                cxcw = ts.x + ts.width,
                                cych = ts.y + ts.height,
                                cright = this.width - right,
                                cbottom = this.height - bottom;

                            g.save();
                            g.clipRect(x1, y1, (cxcw < cright  ? cxcw : cright)  - x1,
                                               (cych < cbottom ? cych : cbottom) - y1);
                            this.paint(g);
                            g.restore();
                        }
                    } else {
                        this.paint(g);
                    }
                }

                var count = this.kids.length;
                for(var i = 0; i < count; i++) {
                    var kid = this.kids[i];
                    if (kid.isVisible === true && kid.$context == null) {
                        // calculate if the given component area has intersection
                        // with current clipping area
                        var kidXW = kid.x + kid.width,
                            c_xw  = ts.x + ts.width,
                            kidYH = kid.y + kid.height,
                            c_yh  = ts.y + ts.height,
                            iw = (kidXW < c_xw ? kidXW : c_xw) - (kid.x > ts.x ? kid.x : ts.x),
                            ih = (kidYH < c_yh ? kidYH : c_yh) - (kid.y > ts.y ? kid.y : ts.y);

                        if (iw > 0 && ih > 0) {
                            g.save();
                            g.translate(kid.x, kid.y);
                            g.clipRect(0, 0, kid.width, kid.height);
                            kid.paintComponent(g);
                            g.restore();
                        }
                    }
                }

                if (this.paintOnTop != null) this.paintOnTop(g);
            }
        };

        /**
         * UI component border view
         * @attribute border
         * @default null
         * @readOnly
         * @type {zebkit.ui.View}
         */

        /**
         * UI component background view
         * @attribute bg
         * @default null
         * @readOnly
         * @type {zebkit.ui.View}
        */

        /**
         * Define and set the property to true if the component has to catch focus
         * @attribute canHaveFocus
         * @type {Boolean}
         * @default undefined
         */

        this.top = this.left = this.right = this.bottom = 0;

        /**
         * UI component enabled state
         * @attribute isEnabled
         * @default true
         * @readOnly
         * @type {Boolean}
         */
        this.isEnabled = true;

        /**
         * Find a zebkit.ui.zCanvas where the given UI component is hosted
         * @return {zebkit.ui.zCanvas} a zebkit canvas
         * @method getCanvas
         */
        this.getCanvas = function() {
            var c = this;
            for(; c != null && c.$isRootCanvas !== true; c = c.parent);
            return c;
        };

        this.notifyRender = function(o,n){
            if (o != null && o.ownerChanged != null) o.ownerChanged(null);
            if (n != null && n.ownerChanged != null) n.ownerChanged(this);
        };

        /**
         * Shortcut method to register the specific to the concrete component
         * events listener. For instance "zebkit.ui.Button" component fires event
         * when it is pressed:

        var b = new zebkit.ui.Button("Test");
        b.bind(function() {
            // button has been pressed
        });


         * @param {Function|Object} a listener function or an object that
         * declares events handler methods
         * @return {Function|Object} a registered listener
         * @method bind
         */

        /**
         * Shortcut method to remove the register component specific events listener
         * @param {Function|Object} a listener function to be removed
         * @method unbind
         */


        /**
         * Load content of the panel UI components from the specified JSON file.
         * @param  {String} jsonPath an URL to a JSON file that describes UI
         * to be loaded into the panel
         * @chainable
         * @method load
         */
        this.load = function(jsonPath, cb) {
            new pkg.Bag(this).load(jsonPath, cb);
            return this;
        };

        /**
         * Get a children UI component that embeds the given point.
         * @param  {Integer} x x coordinate
         * @param  {Integer} y y coordinate
         * @return {zebkit.ui.Panel} a children UI component
         * @method getComponentAt
         */
        this.getComponentAt = function(x,y){
            var r = pkg.$cvp(this, temporary);

            if (r === null ||
                (x < r.x || y < r.y || x >= r.x + r.width || y >= r.y + r.height))
            {
                return null;
            }

            if (this.kids.length > 0){
                for(var i = this.kids.length; --i >= 0; ){
                    var kid = this.kids[i];
                    kid = kid.getComponentAt(x - kid.x,
                                             y - kid.y);
                    if (kid != null) return kid;
                }
            }
            return this.contains == null || this.contains(x, y) === true ? this : null;
        };

        /**
         * Shortcut method to invalidating the component
         * and initiating the component repainting
         * @method vrp
         */
        this.vrp = function(){
            this.invalidate();

            // extra condition to save few millisecond on repaint() call
            if (this.isVisible === true && this.parent != null) {
                this.repaint();
            }
        };

        this.getTop = function() {
            return this.border != null ? this.top + this.border.getTop()
                                       : this.top;
        };

        this.getLeft = function() {
            return this.border != null ? this.left + this.border.getLeft()
                                       : this.left;
        };

        this.getBottom = function() {
            return this.border != null ? this.bottom + this.border.getBottom()
                                       : this.bottom;
        };

        this.getRight  = function() {
            return this.border != null ? this.right  + this.border.getRight()
                                       : this.right;
        };

        //TODO: the method is not used yet
        this.isInvalidatedByChild = function(c) {
            return true;
        };

        /**
         * The method is implemented to be aware about a children component
         * insertion.
         * @param  {Integer} index an index at that a new children component
         * has been added
         * @param  {Object} constr a layout constraints of an inserted component
         * @param  {zebkit.ui.Panel} l a children component that has been inserted
         * @method kidAdded
         */
        this.kidAdded = function (index,constr,l){
            COMP_EVENT.source = this;
            COMP_EVENT.constraints = constr;
            COMP_EVENT.kid = l;

            pkg.events.fireEvent("compAdded", COMP_EVENT);

            if (l.width > 0 && l.height > 0) {
                l.repaint();
            } else {
                this.repaint(l.x, l.y, 1, 1);
            }
        };

        /**
         * Set the component layout constraints.
         * @param {Object} ctr a constraints
         * @method setConstraints
         */
        this.setConstraints = function(ctr) {
            if (this.constraints != ctr) {
                this.constraints = ctr;
                if (this.parent !== null) this.vrp();
            }
            return this;
        };

        /**
         * The method is implemented to be aware about a children component
         * removal.
         * @param  {Integer} i an index of a removed component
         * @param  {zebkit.ui.Panel} l a removed children component
         * @method kidRemoved
         */
        this.kidRemoved = function(i,l){
            COMP_EVENT.source = this;
            COMP_EVENT.index  = i;
            COMP_EVENT.kid    = l;
            pkg.events.fireEvent("compRemoved", COMP_EVENT);
            if (l.isVisible === true) {
                this.repaint(l.x, l.y, l.width, l.height);
            }
        };

        /**
         * The method is implemented to be aware the
         * component location updating
         * @param  {Integer} px a previous x coordinate of the component
         * @param  {Integer} py a previous y coordinate of the component
         * @method relocated
         */
        this.relocated = function(px, py) {
            COMP_EVENT.source = this;
            COMP_EVENT.prevX  = px;
            COMP_EVENT.prevY  = py;
            pkg.events.fireEvent("compMoved", COMP_EVENT);

            var p = this.parent,
                w = this.width,
                h = this.height;

            if (p != null && w > 0 && h > 0) {
                var x = this.x,
                    y = this.y,
                    nx = x < px ? x : px,
                    ny = y < py ? y : py;

                //TODO: some mobile browser has bug: moving a component
                //      leaves 0.5 sized traces to fix it 1 pixel extra
                //      has to be added to all sides of repainted rect area
                // nx--;
                // ny--;

                if (nx < 0) nx = 0;
                if (ny < 0) ny = 0;

                var w1 = p.width - nx,
                    w2 = w + (x > px ? x - px : px - x),
                    h1 = p.height - ny,
                    h2 = h + (y > py ? y - py : py - y);

                // TODO: add crappy 2 for mobile (android)
                p.repaint(nx, ny, (w1 < w2 ? w1 : w2),// + 2,
                                  (h1 < h2 ? h1 : h2));// + 2);
            }
        };

        /**
         * The method is implemented to be aware the
         * component size updating
         * @param  {Integer} pw a previous width of the component
         * @param  {Integer} ph a previous height of the component
         * @method resized
         */
        this.resized = function(pw,ph) {
            COMP_EVENT.source = this;
            COMP_EVENT.prevWidth  = pw;
            COMP_EVENT.prevHeight = ph;
            pkg.events.fireEvent("compSized", COMP_EVENT);

            if (this.parent != null) {
                this.parent.repaint(this.x, this.y,
                                    ((this.width  > pw) ? this.width  : pw),
                                    ((this.height > ph) ? this.height : ph));
            }
        };

        /**
         * Checks if the component has a focus
         * @return {Boolean} true if the component has focus
         * @method hasFocus
         */
        this.hasFocus = function(){
            return pkg.focusManager.hasFocus(this);
        };

        /**
         * Force the given component to catch focus if the component is focusable.
         * @method requestFocus
         */
        this.requestFocus = function(){
            pkg.focusManager.requestFocus(this);
        };

        /**
         * Force the given component to catch focus in the given timeout.
         * @param {Integer} [timeout] a timeout in milliseconds. The default value is 50
         * milliseconds
         * @method requestFocusIn
         */
        this.requestFocusIn = function(timeout) {
            if (arguments.length === 0) {
                timeout = 50;
            }
            var $this = this;
            setTimeout(function () {
                $this.requestFocus();
            }, timeout);
        };

        /**
         * Set the UI component visibility
         * @param  {Boolean} b a visibility state
         * @method setVisible
         * @chainable
         */
        this.setVisible = function (b){
            if (this.isVisible != b) {
                this.isVisible = b;
                this.invalidate();

                COMP_EVENT.source = this;
                pkg.events.fireEvent("compShown", COMP_EVENT);

                if (this.parent != null) {
                    if (b) this.repaint();
                    else {
                        this.parent.repaint(this.x, this.y, this.width, this.height);
                    }
                }
            }
            return this;
        };

        /**
         *  Set the UI component enabled state. Using this property
         *  an UI component can be excluded from getting input events
         *  @param  {Boolean} b a enabled state
         *  @method setEnabled
         *  @chainable
         */
        this.setEnabled = function (b){
            if (this.isEnabled != b){
                this.isEnabled = b;

                COMP_EVENT.source = this;
                pkg.events.fireEvent("compEnabled", COMP_EVENT);
                if (this.kids.length > 0) {
                    for(var i = 0;i < this.kids.length; i++) {
                        this.kids[i].setEnabled(b);
                    }
                }
                this.repaint();
            }
            return this;
        };

        /**
         * Set the UI component top, right, left, bottom paddings to the same given value
         * @param  {Integer} v the value that will be set as top, right, left, bottom UI
         * component paddings
         * @method setPadding
         * @chainable
         */

        /**
         * Set UI component top, left, bottom, right paddings. The paddings are
         * gaps between component border and painted area.
         * @param  {Integer} top a top padding
         * @param  {Integer} left a left padding
         * @param  {Integer} bottom a bottom padding
         * @param  {Integer} right a right padding
         * @method setPadding
         * @chainable
         */
        this.setPadding = function (top,left,bottom,right){
            if (arguments.length === 1) {
                left = bottom = right = top;
            }

            if (this.top    !== top    || this.left  !== left  ||
                this.bottom !== bottom || this.right !== right   )
            {
                this.top = top;
                this.left = left;
                this.bottom = bottom;
                this.right = right;
                this.vrp();
            }
            return this;
        };

        this.setTopPadding = function(top) {
            if (this.top !== top) {
                this.top = top;
                this.vrp();
            }
            return this;
        };

        this.setLeftPadding = function(left) {
            if (this.left !== left) {
                this.left = left;
                this.vrp();
            }
            return this;
        };

        this.setBottomPadding = function(bottom) {
            if (this.bottom !== bottom) {
                this.bottom = bottom;
                this.vrp();
            }
            return this;
        };

        this.setRightPadding = function(right) {
            if (this.right !== right) {
                this.right = right;
                this.vrp();
            }
            return this;
        };

        /**
         * Set the border view
         * @param  {zebkit.ui.View|Function|String} v a border view or border "paint(g,x,y,w,h,c)"
         * rendering function or border type: "plain", "sunken", "raised", "etched"
         * @method setBorder
         * @chainable
         */
        this.setBorder = function (v) {
            var old = this.border;
            v = pkg.$view(v);
            if (v != old){
                this.border = v;
                this.notifyRender(old, v);

                if ( old == null || v == null         ||
                     old.getTop()    != v.getTop()    ||
                     old.getLeft()   != v.getLeft()   ||
                     old.getBottom() != v.getBottom() ||
                     old.getRight()  != v.getRight()     )
                {
                    this.invalidate();
                }

                if (v != null && v.activate != null) {
                    v.activate(this.hasFocus() ?  "focuson": "focusoff");
                }

                this.repaint();
            }
            return this;
        };

        /**
         * Set the background. Background can be a color string or a zebkit.ui.View class
         * instance, or a function(g,x,y,w,h,c) that paints the background:

            // set background color
            comp.setBackground("red");

            // set a picture as a component background
            comp.setBackground(new zebkit.ui.Picture(...));

            // set a custom rendered background
            comp.setBackground(function (g,x,y,w,h,target) {
                // paint a component background here
                g.setColor("blue");
                g.fillRect(x,y,w,h);
                g.drawLine(...);
                ...
            });


         * @param  {String|zebkit.ui.View|Function} v a background view, color or
         * background "paint(g,x,y,w,h,c)" rendering function.
         * @method setBackground
         * @chainable
         */
        this.setBackground = function (v){
            var old = this.bg;
            v = pkg.$view(v);
            if (v != old) {
                this.bg = v;
                this.notifyRender(old, v);
                this.repaint();
            }
            return this;
        };

        /**
         * Add the given children component or number of components to the given panel.
         * @protected
         * @param {zebkit.ui.Panel|Array|Object} a children component of number of
         * components to be added. The parameter can be:

    - Component
    - Array of components
    - Dictionary object where every element is a component to be added and the key of
    the component is stored in the dictionary is considered as the component constraints

         * @method setKids
         */
        this.setKids = function(a) {
            if (arguments.length === 1 && zebkit.instanceOf(a, pkg.Panel)) {
               this.add(a);
            } else {
                // if components list passed as number of arguments
                if (arguments.length > 1) {
                    for(var i = 0; i < arguments.length; i++) {
                        var a = arguments[i];
                        if (a != null) {
                            this.add(a.$new != null ? a.$new() : a);
                        }
                    }
                } else {
                    if (Array.isArray(a)) {
                        for(var i=0; i < a.length; i++) {
                            if (a[i] != null) {
                                this.add(a[i]);
                            }
                        }
                    } else {
                        var kids = a;
                        for(var k in kids) {
                            if (kids.hasOwnProperty(k)) {
                                this.add(k, kids[k]);
                            }
                        }
                    }
                }
            }
        };

        /**
         * Called whenever the UI component gets or looses focus
         * @method focused
         */
        this.focused = function() {
            // extents of activate method indicates it is
            if (this.border != null && this.border.activate != null) {
                var id = this.hasFocus() ? "focuson" : "focusoff" ;
                if (typeof this.border.views[id] !== 'undefined') {
                    this.border.activate(id);
                    this.repaint();
                }
            }

            // TODO: think if the background has to be focus dependent
            // if (this.bg != null && this.bg.activate != null) {
            //     var id = this.hasFocus() ? "focuson" : "focusoff" ;
            //     if (this.bg.views[id]) {
            //         this.bg.activate(id);
            //         this.repaint();
            //     }
            // }
        };

        /**
         * Remove all children UI components
         * @method removeAll
         */
        this.removeAll = function (){
            if (this.kids.length > 0){
                var size = this.kids.length, mx1 = Number.MAX_VALUE, my1 = mx1, mx2 = 0, my2 = 0;
                for(; size > 0; size--){
                    var child = this.kids[size - 1];
                    if (child.isVisible === true){
                        var xx = child.x, yy = child.y;
                        mx1 = mx1 < xx ? mx1 : xx;
                        my1 = my1 < yy ? my1 : yy;
                        mx2 = Math.max(mx2, xx + child.width);
                        my2 = Math.max(my2, yy + child.height);
                    }
                    this.removeAt(size - 1);
                }
                this.repaint(mx1, my1, mx2 - mx1, my2 - my1);
            }
        };

        /**
         * Bring the UI component to front
         * @method toFront
         */
        this.toFront = function(){
            if (this.parent != null && this.parent.kids[this.parent.kids.length-1] !== this){
                var p = this.parent;
                p.kids.splice(p.indexOf(this), 1);
                p.kids[p.kids.length] = this;
                p.vrp();
            }
            return this;
        };

        /**
         * Send the UI component to back
         * @method toBack
         */
        this.toBack = function(){
            if (this.parent != null && this.parent.kids[0] !== this){
                var p = this.parent;
                p.kids.splice(p.indexOf(this), 1);
                p.kids.unshift(this);
                p.vrp();
            }
            return this;
        };

        /**
         * Set the UI component size to its preferred size
         * @return {Object} a preferred size applied to the component.
         * The structure of the returned object is the following:

            { width:{Integer}, height:{Integer} }

         * @method toPreferredSize
         */
        this.toPreferredSize = function (){
            var ps = this.getPreferredSize();
            this.setSize(ps.width, ps.height);
            return ps;
        };

        /**
         * Build view by this component
         * @return {zebkit.ui.View} a view of the component
         * @param [{target}]
         * @method toView
         */
        this.toView = function(target) {
            return new pkg.CompRender(this);
        };

        // TODO: not stable API
        this.paintViewAt = function(g, ax, ay, v) {
            var x  = this.getLeft(),
                y  = this.getTop(),
                ps = v.getPreferredSize();

            if (ax === "center") {
                x = Math.floor((this.width - ps.width)/2);
            }
            else if (ax === "right") {
                x = this.width - this.getRight() - ps.width;
            }

            if (ay === "center") {
                y = Math.floor((this.height - ps.height)/2);
            }
            else if (ay === "bottom") {
                y = this.height - this.getBottom() - ps.height;
            }

            v.paint(g, x, y, ps.width, ps.height, this);
        };

        this[''] = function(l) {
            // !!! dirty trick to call super, for the sake of few milliseconds back
            //this.$super();
            if (typeof this.kids === "undefined") {
                this.kids = [];
            }

            if (this.layout == null) {
                this.layout = this;
            }

            if (this.clazz.parentPropsLookup === true) {
                // instead of recursion collect stack in array than go through it
                var hierarchy = [],
                    pp        = this.clazz;

                // collect clazz hierarchy
                while(pp.$parent !== null && pp.parentPropsLookup === true) {
                    pp = pp.$parent;
                    hierarchy[hierarchy.length] = pp;
                }

                // fire properties from the hierarchy
                for(var i = hierarchy.length; i >= 0; i--) {
                    this.properties(hierarchy[i]);
                }
            }
            this.properties(this.clazz);

            if (arguments.length > 0) {
                if (l.constructor === Object) {
                    this.properties(l);
                } else {
                    this.setLayout(l);
                }
            }
        };
    }
]);

/**
 * HTML element UI component wrapper class. The class represents
 * an HTML element as if it is standard UI component. It helps to use
 * some standard HTML element as zebkit UI components and embeds it
 * in zebkit UI application layout.
 * @class zebkit.ui.HtmlElement
 * @constructor
 * @param {String|HTMLElement} [element] an HTML element to be represented
 * as a standard zebkit UI component. If the passed parameter is string
 * it denotes a name of an HTML element. In this case a new HTML element
 * will be created.
 * @extends {zebkit.ui.Panel}
 */
pkg.HtmlElement = Class(pkg.Panel, [
    function $clazz() {
        this.CLASS_NAME = null;
        this.$bodyFontSize = window.getComputedStyle(document.body, null).getPropertyValue('font-size');
    },

    function $prototype() {
        this.$container = this.$canvas = null;
        this.ePsW = this.ePsH = 0;
        this.isDOMElement = true;   // indication of the DOM element that is used by DOM element manager to track
                                    // and manage its visibility

        this.$sizeAdjusted = false;

        /**
         * Set the CSS font of the wrapped HTML element
         * @param {String|zebkit.ui.Font} f a font
         * @method setFont
         * @chainable
         */
        this.setFont = function(f) {
            this.setStyle("font", f.toString());
            this.vrp();
            return this;
        };

        /**
         * Set the CSS color of the wrapped HTML element
         * @param {String} c a color
         * @chainable
         * @method setColor
         */
        this.setColor = function(c) {
            this.setStyle("color", c.toString());
            return this;
        };

        /**
         * Apply the given set of CSS styles to the wrapped HTML element
         * @param {Object} styles a dictionary of CSS styles
         * @chainable
         * @method setStyles
         */
        this.setStyles = function(styles) {
            for(var k in styles) {
                this.$setStyle(this.element, k, styles[k]);
            }
            this.vrp();
            return this;
        };

        /**
         * Apply the given CSS style to the wrapped HTML element
         * @param {String} a name of the CSS style
         * @param {String} a value the CSS style has to be set
         * @chainable
         * @method setStyle
         */
        this.setStyle = function(name, value) {
            this.$setStyle(this.element, name, value);
            this.vrp();
            return this;
        };

        this.$setStyle = function(element, name, value) {
            name = name.trim();
            var i = name.indexOf(':');
            if (i > 0) {
                if (zebkit[name.substring(0, i)] == null) {
                    return;
                }
                name = name.substring(i + 1);
            }
            element.style[name] = value;
        };

        /**
         * Set the specified attribute of the wrapped HTML element
         * @param {String} name  a name of attribute
         * @param {String} value a value of the attribute
         * @chainable
         * @method setAttribute
         */
        this.setAttribute = function(name, value) {
            this.element.setAttribute(name, value);
            return this;
        };

        this.setAttributes = function(attrs) {
            for(var name in attrs) {
                this.element.setAttribute(name, attrs[name]);
            }
            return this;
        };

        this.paint = function(g) {
            // this method is used as an indication that the component
            // is visible and no one of his parent is invisible
            if (this.$container.style.visibility === "hidden") {
                this.$container.style.visibility = "visible";
            }

            // calling paint says that the component in DOM tree
            // that is time to correct CSS size if necessary
            if (this.$sizeAdjusted !== true) {
                this.setSize(this.width, this.height);
            }
        };

        this.calcPreferredSize = function(target) {
            return { width: this.ePsW, height: this.ePsH };
        };

        var $store = [
            "paddingTop","paddingLeft","paddingBottom","paddingRight",
            "border","borderStyle","borderWidth", "borderTopStyle",
            "borderTopWidth", "borderBottomStyle","borderBottomWidth",
            "borderLeftStyle","borderLeftWidth", "borderRightStyle",
            "visibility", "borderRightWidth", "width", "height", "position"
        ];

        // the method calculates the given HTML element preferred size
        this.recalc = function() {
            // if component has a layout set it is up to a layout manager to calculate
            // the component preferred size. In this case the HTML element is a container
            // whose preferred size is defined by its content
            if (this.layout === this) {
                var e         = this.element,
                    vars      = {},
                    domParent = null,
                    b         = !zebkit.web.$contains(this.$container);

                // element doesn't have preferred size if it is not a member of
                // an html page, so add it if for a while
                if (b) {
                    // save previous parent node since
                    // appendChild will overwrite it
                    domParent = this.$container.parentNode;
                    document.body.appendChild(this.$container);
                }

                // save element metrics
                for(var i = 0; i < $store.length; i++) {
                    var k = $store[i];
                    vars[k] = e.style[k];
                }

                // force metrics to be calculated automatically
                this.$container.style.visibility = "hidden";
                e.style.padding  = "0px";
                e.style.border   = "none";
                e.style.position = e.style.height = e.style.width = "auto";

                // fetch preferred size
                this.ePsW = e.offsetWidth;
                this.ePsH = e.offsetHeight;

                for(var k in vars) {
                    var v = vars[k];
                    if (v != null) e.style[k] = v;
                }

                if (b) {
                    document.body.removeChild(this.$container);
                    // restore previous parent node
                    if (domParent != null) domParent.appendChild(this.$container);
                }
            }
        };

        /**
         * Set the inner content of the wrapped HTML element
         * @param {String} an inner content
         * @method setContent
         * @chainable
         */
        this.setContent = function(content) {
            this.element.innerHTML = content;
            this.vrp();
            return this;
        };

        this.$getElementRootFocus = function() {
            return null;
        };

        this.canHaveFocus = function() {
            return this.$getElementRootFocus() != null;
        };

        this.$focus = function() {
            if (this.canHaveFocus() && document.activeElement !== this.$getElementRootFocus()) {
                this.$getElementRootFocus().focus();
            }
        };

        this.$blur = function() {
            if (this.canHaveFocus() && document.activeElement === this.$getElementRootFocus()) {
                this.$getElementRootFocus().blur();
            }
        };
    },

    function toFront() {
        this.$super();
        var pnode = this.$container.parentNode;
        if (pnode != null && pnode.lastChild !== this.$container) {
            pnode.removeChild(this.$container);
            pnode.appendChild(this.$container);
        }
    },

    function toBack() {
        this.$super();
        var pnode = this.$container.parentNode;
        if (pnode != null && pnode.firstChild !== this.$container) {
            pnode.removeChild(this.$container);
            pnode.insertBefore(this.$container, pnode.firstChild);
        }
    },

    function setEnabled(b) {
        if (this.isEnabled != b) {
            if (b) {
                this.$container.removeChild(this.$blockElement);
            } else {
                if (this.$blockElement == null) {
                    this.$blockElement = zebkit.web.$createBlockedElement();
                }
                this.$container.appendChild(this.$blockElement);
           }
        }
        return this.$super(b);
    },

    function setSize(w, h) {
        // by the moment the method setSize is called the DOM element can be not a part of
        // HTML layout. In this case offsetWidth/offsetHeihght are always zero what prevents
        // us from proper calculation of CSS width and height. Postpone
        if (zebkit.web.$contains(this.$container)) {
            var prevVisibility = this.$container.style.visibility;
            this.$container.style.visibility = "hidden"; // could make sizing smooth

            // HTML element size is calculated as sum of CSS "width"/"height", paddings, border
            // So the passed width and height has to be corrected (before it will be applied to
            // an HTML element) by reduction of extra HTML gaps. For this we firstly set the
            // width and size
            this.element.style.width  = "" + w + "px";
            this.element.style.height = "" + h + "px";

            var ww = 2 * w - this.element.offsetWidth,
                hh = 2 * h - this.element.offsetHeight;

            if (ww != w || hh != h) {
                // than we know the component metrics and can compute necessary reductions
                this.element.style.width   = "" + ww + "px";
                this.element.style.height  = "" + hh + "px";
            }

            this.$sizeAdjusted = true;

            // visibility correction is done by HTML elements manager
            this.$container.style.visibility = prevVisibility;
        } else {
            this.$sizeAdjusted = false;
        }

        return this.$super(w, h);
    },

    function setPadding(t,l,b,r) {
        if (arguments.length === 1) {
            l = b = r = t;
        }

        this.setStyles({
            paddingTop    : '' + t + "px",
            paddingLeft   : '' + l + "px",
            paddingRight  : '' + r + "px",
            paddingBottom : '' + b + "px"
        });

        if (this.top !== t || this.left !== l || this.right !== r || this.bottom !== b) {
            // changing padding has influence to CSS size the component has to have
            // so we have to request CSS size recalculation
            this.$sizeAdjusted = false;
        }

        this.$super.apply(this, arguments);
        return this;
    },

    function setBorder(b) {
        b = pkg.$view(b);

        if (b == null) {
           this.setStyle("border", "none");
        } else {
            this.setStyles({
                //!!!! bloody FF fix, the border can be made transparent
                //!!!! only via "border" style
                border : "0px solid transparent",

                //!!! FF understands only decoupled border settings
                borderTopStyle : "solid",
                borderTopColor : "transparent",
                borderTopWidth : "" + b.getTop() + "px",

                borderLeftStyle : "solid",
                borderLeftColor : "transparent",
                borderLeftWidth : "" + b.getLeft() + "px",

                borderBottomStyle : "solid",
                borderBottomColor : "transparent",
                borderBottomWidth : "" + b.getBottom() + "px",

                borderRightStyle : "solid",
                borderRightColor : "transparent",
                borderRightWidth : "" + b.getRight() + "px"
            });
        }

        // changing border can have influence to
        // CSS size, so request recalculation of the CSS
        // size
        if (this.border != b) {
            this.$sizeAdjusted = false;
        }

        return this.$super(b);
    },

    function validate() {
        // lookup root canvas
        if (this.$canvas == null && this.parent != null) {
            this.$canvas = this.getCanvas();
        }

        this.$super();
    },

    function focused() {
        this.$super();

        // sync state of native focus and zebkit focus
        if (this.hasFocus()) {
            this.$focus();
        } else {
            this.$blur();
        }
    },

    function(e) {
        if (e == null) {
            e = "div";
        }

        if (zebkit.isString(e)) {
            e = document.createElement(e);
            if (this.clazz.CLASS_NAME != null) {
                e.setAttribute("class", this.clazz.CLASS_NAME);
            }
            e.style.border   = "0px solid transparent";   // clean up border
            e.style.fontSize = this.clazz.$bodyFontSize;  // DOM element is wrapped with a container that
                                                          // has zero sized font, so let's set body  font
                                                          // for the created element
        }

        // sync padding and margin of the DOM element with
        // what appropriate properties are set
        e.style.margin = e.style.padding = "0px";

        /**
         * Reference to HTML element the UI component wraps
         * @attribute element
         * @readOnly
         * @type {HTMLElement}
         */
        this.element = e;

        // this is set to make possible to use set z-index for HTML element
        this.element.style.position = "relative";


        if (e.parentNode != null && e.parentNode.getAttribute("data-zebcont") != null) {
            throw new Error("DOM element '" + e + "' already has container");
        }

        // container is a DIV element that is used as a wrapper around original one
        // it is done to make HtmlElement implementation more universal making
        // all DOM elements capable to be a container for another one
        this.$container = document.createElement("div");

        // prevent stretching to a parent container element
        this.$container.style.display = "inline-block";

        // cut content
        this.$container.style.overflow = "hidden";

        // it fixes problem with adding, for instance, DOM element as window what can prevent
        // showing components added to popup layer
        this.$container.style["z-index"] = "0";


        // coordinates have to be set to initial zero value in CSS
        // otherwise the DOM layout can be wrong !
        this.$container.style.left = this.$container.style.top = "0px";

        this.$container.visibility = "hidden";  // before the component will be attached
                                                // to parent hierarchy the component has to be hidden

        // container div will always few pixel higher than its content
        // to prevent the bloody effect set font to zero
        // border and margin also have to be zero
        this.$container.style.fontSize = this.$container.style.padding = this.$container.style.padding = "0px";

        // add id
        this.$container.setAttribute("id", "container-" + this.toString());

        // mark wrapper with a special attribute to recognize it exists later
        this.$container.setAttribute("data-zebcont", "true");

        // let html element interact
        this.$container.style["pointer-events"] = "auto";

        // if passed DOM element already has parent
        // attach it to container first and than
        // attach the container to the original parent element
        if (e.parentNode != null) {
            // !!!
            // Pay attention container position cannot be set to absolute
            // since how the element has to be laid out is defined by its
            // original parent
            e.parentNode.replaceChild(this.$container, e);
            this.$container.appendChild(e);
        } else {
            // to force all children element be aligned
            // relatively to the wrapper we have to set
            // position CSS to absolute or absolute
            this.$container.style.position = "absolute";
            this.$container.appendChild(e);
        }

        // set ID if it has not been already defined
        if (e.getAttribute("id") == null) {
            e.setAttribute("id", this.toString());
        }

        this.$super();

        // attach listeners
        if (this.$initListeners != null) {
            this.$initListeners();
        }

        var fe = this.$getElementRootFocus();

        // TODO: may be this code should be moved to web place
        //
        // reg native focus listeners for HTML element that can hold focus
        if (fe != null) {
            var $this = this;

            zebkit.web.$focusin(fe, function(e) {

                // sync native focus with zebkit focus if necessary
                if ($this.hasFocus() === false) {
                    $this.requestFocus();
                }
            }, false);

            zebkit.web.$focusout(fe, function(e) {

                // sync native focus with zebkit focus if necessary
                if ($this.hasFocus()) {
                    pkg.focusManager.requestFocus(null);
                }
            }, false);
        }
    }
]);

/**
 *  zCanvas zebkit UI component class. This is one of the key
 *  class everybody has to use to start building an UI. The class is a wrapper
 *  for HTML Canvas element. Internally it catches all native HTML Canvas
 *  events and translates its into Zebkit UI events.
 *
 *  zCanvas instantiation triggers a new HTML Canvas will be created
 *  and added to HTML DOM tree.  It happens if developer doesn't pass
 *  an HTML Canvas element reference or an ID of existing HTML Canvas
 *  element If developers need to re-use an existent in DOM tree canvas
 *  element they have to pass id of the canvas that has to be used as basis
 *  for zebkit UI creation or reference to a HTML Canvas element:

        // a new HTML canvas element is created and added into HTML DOM tree
        var canvas = zebkit.ui.zCanvas();

        // a new HTML canvas element is created into HTML DOM tree
        var canvas = zebkit.ui.zCanvas(400,500);  // pass canvas size

        // stick to existent HTML canvas element
        var canvas = zebkit.ui.zCanvas("ExistentCanvasID");

 *  The zCanvas has layered structure. Every layer is responsible for
 *  showing and controlling a dedicated type of UI elements like windows
 *  pop-up menus, tool tips and so on. Developers have to build an own UI
 *  hierarchy on the canvas root layer. The layer is standard UI panel
 *  that is accessible as zCanvas component instance "root" field.

        // create canvas
        var canvas = zebkit.ui.zCanvas(400,500);

        // save reference to canvas root layer where
        // hierarchy of UI components have to be hosted
        var root = canvas.root;

        // fill root with UI components
        var label = new zebkit.ui.Label("Label");
        label.setBounds(10,10,100,50);
        root.add(label);

 *  @class zebkit.ui.zCanvas
 *  @extends {zebkit.ui.Panel}
 *  @constructor
 *  @param {String|Canvas} [element] an ID of a HTML canvas element or
 *  reference to an HTML Canvas element.
 *  @param {Integer} [width] a width of an HTML canvas element
 *  @param {Integer} [height] a height of an HTML canvas element
 */

/**
 * Implement the event handler method  to catch canvas initialized event.
 * The event is triggered once the canvas has been initiated and all properties
 * listeners of the canvas are set upped. The event can be used to load
 * saved data.

     var p = new zebkit.ui.zCanvas(300, 300, [
          function canvasInitialized() {
              // do something
          }
     ]);

 * @event  canvasInitialized
 */
pkg.HtmlCanvas = Class(pkg.HtmlElement, [
    function $clazz() {
        this.$ContextMethods = {
            reset : function(w, h) {
                this.$curState = 0;
                var s = this.$states[0];
                s.srot = s.rotateVal = s.x = s.y = s.width = s.height = s.dx = s.dy = 0;
                s.crot = s.sx = s.sy = 1;
                s.width = w;
                s.height = h;
                this.setFont(pkg.font);
                this.setColor("white");
            },

            $init : function() {
                // pre-allocate canvas save $states
                this.$states = Array(50);
                for(var i=0; i < this.$states.length; i++) {
                    var s = {};
                    s.srot = s.rotateVal = s.x = s.y = s.width = s.height = s.dx = s.dy = 0;
                    s.crot = s.sx = s.sy = 1;
                    this.$states[i] = s;
                }
            },

            translate : function(dx, dy) {
                if (dx !== 0 || dy !== 0) {
                    var c = this.$states[this.$curState];
                    c.x  -= dx;
                    c.y  -= dy;
                    c.dx += dx;
                    c.dy += dy;
                    this.$translate(dx, dy);
                }
            },

            rotate : function(v) {
                var c = this.$states[this.$curState];
                c.rotateVal += v;
                c.srot = Math.sin(c.rotateVal);
                c.crot = Math.cos(c.rotateVal);
                this.$rotate(v);
            },

            scale : function(sx, sy) {
                var c = this.$states[this.$curState];
                c.sx = c.sx * sx;
                c.sy = c.sy * sy;
                this.$scale(sx, sy);
            },

            save : function() {
                this.$curState++;
                var c = this.$states[this.$curState], cc = this.$states[this.$curState - 1];
                c.x = cc.x;
                c.y = cc.y;
                c.width = cc.width;
                c.height = cc.height;

                c.dx = cc.dx;
                c.dy = cc.dy;
                c.sx = cc.sx;
                c.sy = cc.sy;
                c.srot = cc.srot;
                c.crot = cc.crot;
                c.rotateVal = cc.rotateVal;

                this.$save();
                return this.$curState - 1;
            },

            restoreAll : function() {
                while(this.$curState > 0) {
                    this.restore();
                }
            },

            restore : function() {
                if (this.$curState === 0) {
                    throw new Error("Context restore history is empty");
                }

                this.$curState--;
                this.$restore();
                return this.$curState;
            },

            clipRect : function(x,y,w,h){
                var c = this.$states[this.$curState];
                if (c.x != x || y != c.y || w != c.width || h != c.height) {
                    var xx = c.x, yy = c.y,
                        ww = c.width,
                        hh = c.height,
                        xw = x + w,
                        xxww = xx + ww,
                        yh = y + h,
                        yyhh = yy + hh;

                    c.x      = x > xx ? x : xx;
                    c.width  = (xw < xxww ? xw : xxww) - c.x;
                    c.y      = y > yy ? y : yy;
                    c.height = (yh < yyhh ? yh : yyhh) - c.y;

                    if (c.x != xx || yy != c.y || ww != c.width || hh != c.height) {
                        // begin path is very important to have proper clip area
                        this.beginPath();
                        this.rect(x, y, w, h);
                        this.closePath();
                        this.clip();
                    }
                }
            }
        };
    },

    function $prototype(clazz) {
        this.$rotateValue = 0;
        this.$scaleX = 1;
        this.$scaleY = 1;

        this.$paintTask = null;


        // set border for canvas has to be set as zebkit border, since canvas
        // is DOM component designed for rendering, so setting DOM border
        // doesn't allow us to render zebkit border
        this.setBorder = function(b) {
            return pkg.Panel.prototype.setBorder.call(this, b);
        };

        this.rotate = function(r) {
            this.$rotateValue += r;
            if (this.$context != null) {
                this.$context.rotate(r);
            }

            this.vrp();
            return this;
        };

        this.scale = function(sx, sy) {
            if (this.$context != null) this.$context.scale(sx, sy);
            this.$scaleX = this.$scaleX * sx;
            this.$scaleY = this.$scaleY * sy;
            this.vrp();
            return this;
        };

        this.clearTransformations = function() {
            this.$scaleX = 1;
            this.$scaleY = 1;
            this.$rotateValue = 0;
            if (this.$context != null) {
                this.$context = zebkit.web.$canvas(this.element, this.width, this.height, true);
                this.$context.reset(this.width, this.height);
            }
            this.vrp();
            return this;
        };

        // set passing for canvas has to be set as zebkit padding, since canvas
        // is DOM component designed for rendering, so setting DOM padding
        // doesn't allow us to hold painting area proper
        this.setPadding = function() {
            return pkg.Panel.prototype.setPadding.apply(this, arguments);
        };

        this.setSize = function(w, h) {
            if (this.width != w || h != this.height) {
                var pw  = this.width,
                    ph  = this.height;

                this.$context = zebkit.web.$canvas(this.element, w, h);

                // canvas has one instance of context, the code below
                // test if the context has been already full filled
                // with necessary methods and if it is not true
                // fill it
                if (typeof this.$context.$states === "undefined") {
                    zebkit.web.$extendContext(this.$context, clazz.$ContextMethods);
                }

                this.$context.reset(w, h);

                // if canvas has been rotated apply the rotation to the context
                if (this.$rotateValue !== 0) {
                    this.$context.rotate(this.$rotateValue);
                }

                // if canvas has been scaled apply it to it
                if (this.$scaleX !== 1 || this.$scaleY !== 1) {
                    this.$context.scale(this.$scaleX, this.$scaleY);
                }

                this.width  = w;
                this.height = h;

                this.invalidate();

                // TODO: think to replace it with vrp()
                this.validate();
                this.repaint();

                if (w != pw || h != ph) {
                    this.resized(pw, ph);
                }
            }
            return this;
        };
    },

    function(e) {
        if (e != null && (e.tagName == null || e.tagName != "CANVAS")) {
            throw new Error("Invalid element '" + e + "'");
        }

        /**
         * Keeps rectangular "dirty" area of the canvas component
         * @private
         * @attribute $da
         * @type {Object}
                { x:Integer, y:Integer, width:Integer, height:Integer }
         */
        this.$da = { x: 0, y: 0, width: -1, height: 0 };

        this.$super(e == null ? "canvas" : e);

        // let HTML Canvas be WEB event transparent
        this.$container.style["pointer-events"] = "none";

        // add class to canvas if this element has been created
        if (e == null) {
            // prevent canvas selection
            this.element.onselectstart = function() { return false; };
        }
    }
]);

/**
 * Base layer UI component. Layer is special type of UI
 * components that is used to decouple different logical
 * UI components types from each other. Zebkit Canvas
 * consists from number of layers where only one can be
 * active at the given point in time. Layers are stretched
 * to fill full canvas size. Every time an input event
 * happens system detects an active layer by asking all
 * layers from top to bottom. First layer that wants to
 * catch input gets control. The typical layers examples
 * are window layer, pop up menus layer and so on.
 * @param {String} id an unique id to identify the layer
 * @constructor
 * @class zebkit.ui.CanvasLayer
 * @extends {zebkit.ui.Panel}
 */
pkg.CanvasLayer = Class(pkg.HtmlCanvas, [
    function $prototype() {
        /**
         *  Define the method to catch pointer pressed event and
         *  answer if the layer wants to have a control.
         *  If the method is not defined it is considered as the
         *  layer is not activated by the pointer event
         *  @param {zebkit.ui.PointerEvent} e a pointer event
         *  @return {Boolean} return true if the layer wants to
         *  catch control
         *  @method pointerPressed
         */

        /**
         *  Define the method to catch key pressed event and
         *  answer if the layer wants to have a control.
         *  If the method is not defined it is considered
         *  as the key event doesn't activate the layer
         *  @param {zebkit.ui.KeyEvent} e a key code
         *  @return {Boolean} return true if the layer wants to
         *  catch control
         *  @method keyPressed
         */
    },

    function() {
        this.$super();
        this.id = this.clazz.ID;
    }
]);

/**
 *  Root layer implementation. This is the simplest UI layer implementation
 *  where the layer always try grabbing all input event
 *  @class zebkit.ui.RootLayer
 *  @constructor
 *  @extends {zebkit.ui.CanvasLayer}
 */
pkg.RootLayer = Class(pkg.CanvasLayer, [
    function $clazz() {
        this.ID = "root";
        this.layout = new zebkit.layout.RasterLayout();
    },

    function $prototype() {
        this.getFocusRoot = function() {
            return this;
        };
    }
]);

/**
 *  UI component to keep and render the given "zebkit.ui.View" class
 *  instance. The target view defines the component preferred size
 *  and the component view.
 *  @class zebkit.ui.ViewPan
 *  @constructor
 *  @extends {zebkit.ui.Panel}
 */
pkg.ViewPan = Class(pkg.Panel, [
    function $prototype() {
        /**
         * Reference to a view that the component visualize
         * @attribute view
         * @type {zebkit.ui.View}
         * @default null
         * @readOnly
         */
        this.view = null;

        this.paint = function (g){
            if (this.view !== null){
                var l = this.getLeft(),
                    t = this.getTop();

                this.view.paint(g, l, t, this.width  - l - this.getRight(),
                                         this.height - t - this.getBottom(), this);
            }
        };

        /**
         * Set the target view to be wrapped with the UI component
         * @param  {zebkit.ui.View|Function} v a view or a rendering
         * view "paint(g,x,y,w,h,c)" function
         * @method setView
         * @chainable
         */
        this.setView = function(v){
            var old = this.view;
            v = pkg.$view(v);

            if (v !== old) {
                this.view = v;
                this.notifyRender(old, v);
                this.vrp();
            }

            return this;
        };

        /**
         * Override the parent method to calculate preferred size
         * basing on a target view.
         * @param  {zebkit.ui.Panel} t [description]
         * @return {Object} return a target view preferred size if it is defined.
         * The returned structure is the following:
              { width: {Integer}, height:{Integer} }
         * @method  calcPreferredSize
         */
        this.calcPreferredSize = function (t) {
            return this.view !== null ? this.view.getPreferredSize() : { width:0, height:0 };
        };
    }
]);

/**
 *  Image panel UI component class. The component renders an image.
 *  @param {String|Image} [img] a path or direct reference to an image object.
 *  If the passed parameter is string it considered as path to an image.
 *  In this case the image will be loaded using the passed path.
 *  @class zebkit.ui.ImagePan
 *  @constructor
 *  @extends zebkit.ui.ViewPan
 */
pkg.ImagePan = Class(pkg.ViewPan, [
    function(img, w, h) {
        this.$runner = null;
        this.setImage(img != null ? img : null);
        this.$super();
        if (arguments.length > 2) this.setPreferredSize(w, h);
    },

    /**
     * Set image to be rendered in the UI component
     * @method setImage
     * @param {String|Image|zebkit.ui.Picture} img a path or direct reference to an
     * image or zebkit.ui.Picture render.
     * If the passed parameter is string it considered as path to an image.
     * In this case the image will be loaded using the passed path
     * @chainable
     */
    function setImage(img) {
        if (img != null) {
            var $this     = this,
                isPic     = zebkit.instanceOf(img, pkg.Picture),
                imgToLoad = isPic ? img.target : img ;

            if (this.$runner == null) {
                this.$runner = new zebkit.util.Runner();
            }

            this.$runner.run(function() {
                zebkit.web.$loadImage(imgToLoad, this.join());
            })
            .
            run(function(p, b, i) {
                $this.$runner = null;
                if (b) {
                    $this.setView(isPic ? img : new pkg.Picture(i));
                    $this.vrp();
                }

                if ($this.imageLoaded != null) {
                    $this.imageLoaded(p, b, i);
                }

                // TODO: should be generalized for the whole hierarchy, not only for one
                // parent
                if ($this.parent !== null && $this.parent.childImageLoaded != null) {
                     $this.parent.childImageLoaded(p, b, i);
                }
            })
            .
            error(function() {
                this.$runner = null;
                $this.setView(null);
            });
        } else {
            if (this.$runner == null) {
                this.setView(null);
            } else {
                var $this = this;
                this.$runner.run(function() {
                    $this.setView(null);
                });
            }
        }
        return this;
    }
]);

/**
 *  UI manager class. The class is widely used as base for building
 *  various UI managers like paint, focus, event etc. Manager is
 *  automatically registered as input and component events listener
 *  if it implements appropriate events methods handlers
 *  @class zebkit.ui.Manager
 *  @constructor
 */
pkg.Manager = Class([
    function() {
        if (pkg.events != null) {
            pkg.events.bind(this);
        }
    }
]);

/**
 * Focus manager class defines the strategy of focus traversing among
 * hierarchy of UI components. It keeps current focus owner component
 * and provides API to change current focus component
 * @class zebkit.ui.FocusManager
 * @extends {zebkit.ui.Manager}
 */
pkg.FocusManager = Class(pkg.Manager, [
    function $prototype() {
        /**
         * Reference to the current focus owner component.
         * @attribute focusOwner
         * @readOnly
         * @type {zebkit.ui.Panel}
         */
        this.focusOwner = null;

        this.$freeFocus = function(comp) {
            if ( this.focusOwner != null &&
                (this.focusOwner === comp || zebkit.layout.isAncestorOf(comp, this.focusOwner)))
            {
                this.requestFocus(null);
            }
        };

        /**
         * Component enabled event handler
         * @param  {zebkit.ui.Panel} c a component
         * @method compEnabled
         */
        this.compEnabled = function(e) {
            var c = e.source;
            if (c.isVisible === true && c.isEnabled === false && this.focusOwner != null) {
                this.$freeFocus(c);
            }
        };

        /**
         * Component shown event handler
         * @param  {zebkit.ui.Panel} c a component
         * @method compShown
         */
        this.compShown = function(e) {
            var c = e.source;
            if (c.isEnabled === true && c.isVisible === false && this.focusOwner != null) {
                this.$freeFocus(c);
            }
        };

        /**
         * Component removed event handler
         * @param  {zebkit.ui.Panel} p a parent
         * @param  {Integer} i      a removed component index
         * @param  {zebkit.ui.Panel} c a removed component
         * @method compRemoved
         */
        this.compRemoved = function(e) {
            var c = e.kid;
            if (c.isEnabled === true && c.isVisible === true && this.focusOwner != null) {
                this.$freeFocus(c);
            }
        };

        /**
         * Test if the given component is a focus owner
         * @param  {zebkit.ui.Panel} c an UI component to be tested
         * @method hasFocus
         * @return {Boolean} true if the given component holds focus
         */
        this.hasFocus = function(c) {
            return this.focusOwner === c;
        };

        /**
         * Key pressed event handler.
         * @param  {zebkit.ui.KeyEvent} e a key event
         * @method keyPressed
         */
        this.keyPressed = function(e){
            if (pkg.KeyEvent.TAB === e.code) {
                var cc = this.ff(e.source, e.shiftKey ?  -1 : 1);
                if (cc != null) {

                    // TODO: WEB specific code has to be removed moved to another place
                    if (document.activeElement != cc.getCanvas().element) {
                        cc.getCanvas().element.focus();
                        this.requestFocus(cc);
                    } else {
                        this.requestFocus(cc);
                    }
                }

                return true;
            }
        };

        this.findFocusable = function(c) {
            return (this.isFocusable(c) ? c : this.fd(c, 0, 1));
        };

        /**
         * Test if the given component can catch focus
         * @param  {zebkit.ui.Panel} c an UI component to be tested
         * @method isFocusable
         * @return {Boolean} true if the given component can catch a focus
         */
        this.isFocusable = function(c) {
            var d = c.getCanvas();
            if (d != null &&
                   (c.canHaveFocus === true ||
                     (typeof c.canHaveFocus == "function" && c.canHaveFocus() === true)))
            {
                for(;c !== d && c != null; c = c.parent) {
                    if (c.isVisible === false || c.isEnabled === false) {
                        return false;
                    }
                }
                return c === d;
            }

            return false;
        };

        // looking recursively a focusable component among children components of
        // the given target  starting from the specified by index kid with the
        // given direction (forward or backward lookup)
        this.fd = function(t,index,d) {
            if (t.kids.length > 0){
                var isNComposite = t.catchInput == null || t.catchInput === false;
                for(var i = index; i >= 0 && i < t.kids.length; i += d) {
                    var cc = t.kids[i];

                    // check if the current children component satisfies
                    // conditions it can grab focus or any deeper in hierarchy
                    // component that can grab the focus exist
                    if (cc.isEnabled === true                                           &&
                        cc.isVisible === true                                           &&
                        cc.width      >  0                                              &&
                        cc.height     >  0                                              &&
                        (isNComposite || (t.catchInput !== true      &&
                                          t.catchInput(cc) === false)  )                &&
                        ( (cc.canHaveFocus === true || (cc.canHaveFocus !=  null  &&
                                                        cc.canHaveFocus !== false &&
                                                        cc.canHaveFocus())            ) ||
                          (cc = this.fd(cc, d > 0 ? 0 : cc.kids.length - 1, d)) != null)  )
                    {
                        return cc;
                    }
                }
            }

            return null;
        };

        // find next focusable component
        // c - component starting from that a next focusable component has to be found
        // d - a direction of next focusable component lookup: 1 (forward) or -1 (backward)
        this.ff = function(c, d){
            var top = c;
            while (top != null && top.getFocusRoot == null) {
                top = top.parent;
            }

            if (top == null) {
                return null;
            }

            top = top.getFocusRoot();
            if (top == null) {
                return null;
            }

            if (top.traverseFocus != null) {
                return top.traverseFocus(c, d);
            }

            for(var index = (d > 0) ? 0 : c.kids.length - 1; c != top.parent; ){
                var cc = this.fd(c, index, d);
                if (cc != null) return cc;
                cc = c;
                c = c.parent;
                if (c != null) index = d + c.indexOf(cc);
            }

            return this.fd(top, d > 0 ? 0 : top.kids.length - 1, d);
        };

        /**
         * Force to pass a focus to the given UI component
         * @param  {zebkit.ui.Panel} c an UI component to pass a focus
         * @method requestFocus
         */
        this.requestFocus = function(c) {
            if (c != this.focusOwner && (c == null || this.isFocusable(c))) {
                var oldFocusOwner = this.focusOwner;
                if (c != null) {
                    var nf = c.getEventDestination();
                    if (nf == null || oldFocusOwner == nf) return;
                    this.focusOwner = nf;
                } else {
                    this.focusOwner = c;
                }

                if (oldFocusOwner != null) {
                    var ofc = oldFocusOwner.getCanvas();
                    FOCUS_EVENT.source  = oldFocusOwner;
                    FOCUS_EVENT.related = this.focusOwner;
                    oldFocusOwner.focused();
                    pkg.events.fireEvent("focusLost", FOCUS_EVENT);
                }

                if (this.focusOwner != null) {
                    FOCUS_EVENT.source  = this.focusOwner;
                    FOCUS_EVENT.related = oldFocusOwner;
                    this.focusOwner.focused();
                    pkg.events.fireEvent("focusGained", FOCUS_EVENT);
                }

                return this.focusOwner;
            }
            return null;
        };

        /**
         * Pointer pressed event handler.
         * @param  {zebkit.ui.PointerEvent} e a pointer event
         * @method pointerPressed
         */
        this.pointerPressed = function(e){
            if (e.isAction()) {
                // TODO: WEB specific code that has to be moved to another place
                // the problem is a target canvas element get mouse pressed
                // event earlier than it gets focus what is inconsistent behavior
                // to fix it a timer is used
                if (document.activeElement !== e.source.getCanvas().element) {
                    var $this = this;
                    setTimeout(function() {
                        $this.requestFocus(e.source);
                    }, 50);
                } else {
                    this.requestFocus(e.source);
                }
            }
        };
    }
]);

/**
 *  Command manager supports short cut keys definition and listening. The shortcuts have to be defined in
 *  zebkit JSON configuration files. There are two sections:

    - **osx** to keep shortcuts for Mac OS X platform
    - **common** to keep shortcuts for all other platforms

 *  The JSON configuration entity has simple structure:


      {
        "common": [
             {
                "command"   : "undo_command",
                "args"      : [ true, "test"],
                "key"       : "Ctrl+z"
             },
             {
                "command" : "redo_command",
                "key"     : "Ctrl+Shift+z"
             },
             ...
        ],
        "osx" : [
             {
                "command"   : "undo_command",
                "args"      : [ true, "test"],
                "key"       : "Cmd+z"
             },
             ...
        ]
      }

 *  The configuration contains list of shortcuts. Every shortcut is bound to a key combination it is triggered.
 *  Every shortcut has a name and an optional list of arguments that have to be passed to a shortcut listener method.
 *  The optional arguments can be used to differentiate two shortcuts that are bound to the same command.
 *
 *  On the component level shortcut commands can be listened by implementing method whose name equals to shortcut name.
 *  Pay attention to catch shortcut command your component has to be focusable and holds focus at the given time.
 *  For instance, to catch "undo_command"  do the following:

        var pan = new zebkit.ui.Panel([
            function redo_command() {
                // handle shortcut here
            },

            // visualize the component gets focus
            function focused() {
                this.$super();
                this.setBackground(this.hasFocus()?"red":null);
            }
        ]);

        // let our panel to hold focus by setting appropriate property
        pan.canHaveFocus = true;


 *  @constructor
 *  @class zebkit.ui.ShortcutManager
 *  @extends {zebkit.ui.Manager}
 */

/**
 * Shortcut event is handled by registering a method handler with events manager. The manager is accessed as
 * "zebkit.ui.events" static variable:

        zebkit.ui.events.bind(function commandFired(c) {
            ...
        });

 * @event shortcut
 * @param {Object} c shortcut command
 *         @param {Array} c.args shortcut arguments list
 *         @param {String} c.command shortcut name
 */
pkg.ShortcutManager = Class(pkg.Manager, [
    function $prototype() {
        /**
         * Key pressed event handler.
         * @param  {zebkit.ui.KeyEvent} e a key event
         * @method keyPressed
         */
        this.keyPressed = function(e) {
            var fo = pkg.focusManager.focusOwner;
            if (fo != null && this.keyCommands[e.code]) {
                var c = this.keyCommands[e.code];
                if (c && c[e.mask] != null) {
                    c = c[e.mask];

                    SHORTCUT_EVENT.source  = fo;
                    SHORTCUT_EVENT.command = c;
                    pkg.events.fireEvent( "commandFired", SHORTCUT_EVENT);

                    if (fo[c.command] != null) {
                        if (c.args && c.args.length > 0) {
                            fo[c.command].apply(fo, c.args);
                        } else {
                            fo[c.command]();
                        }
                    }
                }
            }
        };

        this.$parseKey = function(k) {
            var m = 0, c = 0, r = k.split("+");
            for(var i = 0; i < r.length; i++) {
                var ch = r[i].trim().toUpperCase();
                if (pkg.KeyEvent.hasOwnProperty("M_" + ch)) {
                    m += pkg.KeyEvent["M_" + ch];
                } else {
                    if (pkg.KeyEvent.hasOwnProperty(ch)) {
                        c = pkg.KeyEvent[ch];
                    } else {
                        c = parseInt(ch);
                        if (c == NaN) {
                            throw new Error("Invalid key code : " + ch);
                        }
                    }
                }
            }
            return [m, c];
        };

        this.setCommands = function(commands) {
            for(var i=0; i < commands.length; i++) {
                var c = commands[i],
                    p = this.$parseKey(c.key),
                    v = this.keyCommands[p[1]];

                if (v && v[p[0]]) {
                    throw new Error("Duplicated command: '" + c.command +  "' (" + p +")");
                }

                if (v == null) {
                    v = [];
                }

                v[p[0]] = c;
                this.keyCommands[p[1]] = v;
            }
        };
    },

    function(commands){
        this.$super();
        this.keyCommands = {};
        if (commands != null) {
            pkg.events._.addEvents("commandFired");
            this.setCommands(commands.common);
            if (zebkit.isMacOS === true && commands.osx != null) {
                this.setCommands(commands.osx);
            }
        }
    }
]);

/**
 * Cursor manager class. Allows developers to control pointer cursor type by implementing an own
 * getCursorType method or by specifying a cursor by cursorType field. Imagine an UI component
 * needs to change cursor type. It
 *  can be done by one of the following way:

    - **Implement getCursorType method by the component itself if the cursor type depends on cursor location**

          var p = new zebkit.ui.Panel([
               // implement getCursorType method to set required
               // pointer cursor type
               function getCursorType(target, x, y) {
                   return zebkit.ui.Cursor.WAIT;
               }
          ]);

    - **Define "cursorType" property in component if the cursor type doesn't depend on cursor location **

          var myPanel = new zebkit.ui.Panel();
          ...
          myPanel.cursorType = zebkit.ui.Cursor.WAIT;

 *  @class zebkit.ui.CursorManager
 *  @constructor
 *  @extends {zebkit.ui.Manager}
 */
pkg.CursorManager = Class(pkg.Manager, [
    function $prototype() {
        /**
         * Define pointer moved events handler.
         * @param  {zebkit.ui.PointerEvent} e a pointer event
         * @method pointerMoved
         */
        this.pointerMoved = function(e){
            if (this.$isFunc === true) {
                this.cursorType = this.source.getCursorType(this.source, e.x, e.y);
                this.target.style.cursor = (this.cursorType == null) ? "default"
                                                                     : this.cursorType;
            }
        };

        /**
         * Define pointer entered events handler.
         * @param  {zebkit.ui.PointerEvent} e a pointer event
         * @method pointerEntered
         */
        this.pointerEntered = function(e){
            if (e.source.cursorType != null || e.source.getCursorType != null) {
                this.$isFunc = (e.source.getCursorType != null);
                this.target = e.target;
                this.source = e.source;

                this.cursorType = this.$isFunc === true ? this.source.getCursorType(this.source, e.x, e.y)
                                                        : this.source.cursorType;

                this.target.style.cursor = (this.cursorType == null) ? "default"
                                                                     : this.cursorType;
            }
        };

        /**
         * Define pointer exited events handler.
         * @param  {zebkit.ui.PointerEvent} e a pointer event
         * @method pointerExited
         */
        this.pointerExited  = function(e){
            if (this.source != null) {
                this.cursorType = "default";
                if (this.target.style.cursor != this.cursorType) {
                    this.target.style.cursor = this.cursorType;
                }
                this.source = this.target = null;
                this.$isFunc = false;
            }
        };

        /**
         * Define pointer dragged events handler.
         * @param  {zebkit.ui.PointerEvent} e a pointer event
         * @method pointerDragged
         */
        this.pointerDragged = function(e) {
            if (this.$isFunc === true) {
                this.cursorType = this.source.getCursorType(this.source, e.x, e.y);
                this.target.style.cursor = (this.cursorType == null) ? "default"
                                                                      : this.cursorType;
            }
        };
    },

    function(){
        this.$super();

        /**
         * Current cursor type
         * @attribute cursorType
         * @type {String}
         * @readOnly
         * @default "default"
         */
        this.cursorType = "default";
        this.source = this.target = null;
        this.$isFunc = false;
    }
]);

/**
 * Event manager class. One of the key zebkit manager that is responsible for
 * distributing various events in zebkit UI. The manager provides number of
 * methods to register global events listeners.
 * @class zebkit.ui.EventManager
 * @constructor
 * @extends {zebkit.ui.Manager}
 */
pkg.EventManager = Class(pkg.Manager, [
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
            'compRemoved',

            'winOpened',
            'winActivated',

            'menuItemSelected'
        ];

        this.$CHILD_EVENTS_MAP = {};

        // add child<eventName> events names
        var l = eventNames.length;
        for(var i = 0; i < l; i++) {
            var eventName = eventNames[i];
            eventNames.push("child" + eventName[0].toUpperCase() + eventName.substring(1));
            this.$CHILD_EVENTS_MAP[eventName] = eventNames[l + i];
        }

        this.Listerners = zebkit.util.ListenersClass.apply(this, eventNames);
    },

    function $prototype(clazz) {
        var $CEM = clazz.$CHILD_EVENTS_MAP;

        this.fireEvent = function(id, e){
            var t = e.source, kk = $CEM[id], b = false;

            // assign id that matches method to be called
            e.id = id;

            // call target component listener
            if (t[id] != null) {
                if (t[id].call(t, e) === true) {
                    return true;
                }
            }

            // call global listeners
            b = this._[id](e);

            // call parent listeners
            if (b === false) {
                for (t = t.parent;t != null; t = t.parent){
                    if (t[kk] != null) {
                        t[kk].call(t, e);
                    }
                }
            }

            return b;
        };
    },

    function() {
        this._ = new this.clazz.Listerners();
        this.$super();
    }
]);

this.events = new pkg.EventManager();

pkg.zCanvas = Class(pkg.HtmlCanvas, [
    function $clazz () {
        this.CLASS_NAME = "zebcanvas";
    },

    function $prototype() {
        this.$isRootCanvas   = true;
        this.isSizeFull      = false;

        this.$toElementX = function(pageX, pageY) {
            pageX -= this.offx;
            pageY -= this.offy;

            var c = this.$context.$states[this.$context.$curState];
            return ((c.sx != 1 || c.sy != 1 || c.rotateVal !== 0) ? Math.round((c.crot * pageX + pageY * c.srot)/c.sx)
                                                                  : pageX) - c.dx;
        };

        this.$toElementY = function(pageX, pageY) {
            pageX -= this.offx;
            pageY -= this.offy;

            var c = this.$context.$states[this.$context.$curState];
            return ((c.sx != 1 || c.sy != 1 || c.rotateVal !== 0) ? Math.round((pageY * c.crot - c.srot * pageX)/c.sy)
                                                                 : pageY) - c.dy;
        };

        this.load = function(jsonPath, cb){
            return this.root.load(jsonPath, cb);
        };

        // TODO: may be rename to dedicated method $doWheelScroll
        this.$doScroll = function(dx, dy, src) {
            if (src === "wheel") {
                var owner = pkg.$pointerOwner.mouse;
                while (owner != null && owner.doScroll == null) {
                    owner = owner.parent;
                }

                if (owner != null) {
                    return owner.doScroll(dx, dy, src);
                }
            }
        };

        this.$keyTyped = function(e) {
            if (pkg.focusManager.focusOwner != null) {
                e.source = pkg.focusManager.focusOwner;
                return pkg.events.fireEvent("keyTyped", e);
            }
            return false;
        };

        this.$keyPressed = function(e) {
            for(var i = this.kids.length - 1;i >= 0; i--){
                var l = this.kids[i];
                if (l.layerKeyPressed != null && l.layerKeyPressed(e) === true) {
                    return true;
                }
            }

            if (pkg.focusManager.focusOwner != null) {
                e.source = pkg.focusManager.focusOwner;
                return pkg.events.fireEvent("keyPressed", e);
            }

            return false;
        };

        this.$keyReleased = function(e){
            if (pkg.focusManager.focusOwner != null) {
                e.source = pkg.focusManager.focusOwner;
                return pkg.events.fireEvent("keyReleased", e);
            }
            return false;
        };

        this.$pointerEntered = function(e) {
            // TODO: review it quick and dirty fix try to track a situation
            //       when the canvas has been moved
            this.recalcOffset();

            var x = this.$toElementX(e.pageX, e.pageY),
                y = this.$toElementY(e.pageX, e.pageY),
                d = this.getComponentAt(x, y),
                o = pkg.$pointerOwner[e.identifier];

            // also correct current component on that  pointer is located
            if (d !== o) {
                // if pointer owner is not null but doesn't match new owner
                // generate pointer exit and clean pointer owner
                if (o != null) {
                    pkg.$pointerOwner[e.identifier] = null;
                    pkg.events.fireEvent("pointerExited", e.update(o, x, y));
                }

                // if new pointer owner is not null and enabled
                // generate pointer entered event ans set new pointer owner
                if (d != null && d.isEnabled === true){
                    pkg.$pointerOwner[e.identifier] = d;
                    pkg.events.fireEvent("pointerEntered", e.update(d, x, y));
                }
            }
        };

        this.$pointerExited = function(e) {
            var o = pkg.$pointerOwner[e.identifier];
            if (o != null) {
                pkg.$pointerOwner[e.identifier] = null;
                return pkg.events.fireEvent("pointerExited", e.update(o,
                                                                      this.$toElementX(e.pageX, e.pageY),
                                                                      this.$toElementY(e.pageX, e.pageY)));
            }
        };

        /**
         * Catch native canvas pointer move events
         * @param {String} id an touch id (for touchable devices)
         * @param {String} e a pointer event that has been triggered by canvas element
         *
         *         {
         *             pageX : {Integer},
         *             pageY : {Integer},
         *             target: {HTMLElement}
         *         }
         * @protected
         * @method $pointerMoved
         */
        this.$pointerMoved = function(e){
            // if a pointer button has not been pressed handle the normal pointer moved event
            var x = this.$toElementX(e.pageX, e.pageY),
                y = this.$toElementY(e.pageX, e.pageY),
                d = this.getComponentAt(x, y),
                o = pkg.$pointerOwner[e.identifier],
                b = false;

            // check if pointer already inside a component
            if (o != null) {
                if (d != o) {
                    pkg.$pointerOwner[e.identifier] = null;
                    b = pkg.events.fireEvent("pointerExited", e.update(o, x, y));

                    if (d != null && d.isEnabled === true) {
                        pkg.$pointerOwner[e.identifier] = d;
                        b = pkg.events.fireEvent("pointerEntered", e.update(d, x, y)) || b;
                    }
                } else {
                    if (d != null && d.isEnabled === true) {
                        b = pkg.events.fireEvent("pointerMoved", e.update(d, x, y));
                    }
                }
            } else {
                if (d != null && d.isEnabled === true) {
                    pkg.$pointerOwner[e.identifier] = d;
                    b = pkg.events.fireEvent("pointerEntered", e.update(d, x, y));
                }
            }

            return b;
        };

        this.$pointerDragStarted = function(e) {
            var x = this.$toElementX(e.pageX, e.pageY),
                y = this.$toElementY(e.pageX, e.pageY),
                d = this.getComponentAt(x, y);

            // if target component can be detected fire pointer start dragging and
            // pointer dragged events to the component
            if (d != null && d.isEnabled === true) {
                return pkg.events.fireEvent("pointerDragStarted", e.update(d, x, y));
            }

            return false;
        };

        this.$pointerDragged = function(e){
            if (pkg.$pointerOwner[e.identifier] != null) {
                return pkg.events.fireEvent("pointerDragged", e.update(pkg.$pointerOwner[e.identifier],
                                                                       this.$toElementX(e.pageX, e.pageY),
                                                                       this.$toElementY(e.pageX, e.pageY)));
            }

            return false;
        };

        this.$pointerDragEnded = function(e) {
            if (pkg.$pointerOwner[e.identifier] != null) {
                return pkg.events.fireEvent("pointerDragEnded", e.update(pkg.$pointerOwner[e.identifier],
                                                                         this.$toElementX(e.pageX, e.pageY),
                                                                         this.$toElementY(e.pageX, e.pageY)));
            }
            return false;
        };

        this.$pointerClicked = function(e) {
            var x = this.$toElementX(e.pageX, e.pageY),
                y = this.$toElementY(e.pageX, e.pageY),
                d = this.getComponentAt(x, y);

            return d != null ? pkg.events.fireEvent("pointerClicked", e.update(d, x, y))
                             : false;
        };

        this.$pointerDoubleClicked = function(e) {
            var x = this.$toElementX(e.pageX, e.pageY),
                y = this.$toElementY(e.pageX, e.pageY),
                d = this.getComponentAt(x, y);

            return d != null ? pkg.events.fireEvent("pointerDoubleClicked", e.update(d, x, y))
                             : false;
        };

        this.$pointerReleased = function(e) {
            var x  = this.$toElementX(e.pageX, e.pageY),
                y  = this.$toElementY(e.pageX, e.pageY),
                pp = pkg.$pointerPressedOwner[e.identifier];

            // release pressed state
            if (pp != null) {
                try {
                    pkg.events.fireEvent("pointerReleased", e.update(pp, x, y));
                } finally {
                    pkg.$pointerPressedOwner[e.identifier] = null;
                }
            }

            // mouse released can happen at new location, so move owner has to be corrected
            // and mouse exited entered event has to be generated.
            // the correction takes effect if we have just completed dragging or mouse pressed
            // event target doesn't match pkg.$pointerOwner
            if (e.pointerType === "mouse" && (e.pressPageX != e.pageX || e.pressPageY != e.pageY)) {
                var nd = this.getComponentAt(x, y),
                    po = this.getComponentAt(this.$toElementX(e.pressPageX, e.pressPageY),
                                             this.$toElementY(e.pressPageX, e.pressPageY));

                if (nd !== po) {
                    if (po != null) {
                        pkg.$pointerOwner[e.identifier] = null;
                        pkg.events.fireEvent("pointerExited", e.update(po, x, y));
                    }

                    if (nd != null && nd.isEnabled === true){
                        pkg.$pointerOwner[e.identifier] = nd;
                        pkg.events.fireEvent("pointerEntered", e.update(nd, x, y));
                    }
                }
            }
        };

        this.$pointerPressed = function(e) {
            var x  = this.$toElementX(e.pageX, e.pageY),
                y  = this.$toElementY(e.pageX, e.pageY),
                pp = pkg.$pointerPressedOwner[e.identifier];

            // free pointer prev presssed if any
            if (pp != null) {
                try {
                    pkg.events.fireEvent("pointerReleased", e.update(pp, x, y));
                } finally {
                    pkg.$pointerPressedOwner[e.identifier] = null;
                }
            }

            // adjust event for passing it to layers
            e.x = x;
            e.y = y;
            e.source = null;

            // send pointer event to a layer and test if it has been activated
            for(var i = this.kids.length - 1; i >= 0; i--){
                var tl = this.kids[i];
                if (tl.layerPointerPressed != null) {
                    e.id = "pointerPressed";
                    if (tl.layerPointerPressed(e) === true) {
                        return true;
                    }
                }
            }

            var d = this.getComponentAt(x, y);

            if (d != null && d.isEnabled === true) {
                if (pkg.$pointerOwner[e.identifier] !== d) {
                    pkg.$pointerOwner[e.identifier] = d;
                    pkg.events.fireEvent("pointerEntered",  e.update(d, x, y));
                }

                pkg.$pointerPressedOwner[e.identifier] = d;

                // TODO: prove the solution (returning true) !?
                if (pkg.events.fireEvent("pointerPressed", e.update(d, x, y)) === true) {
                   delete pkg.$pointerPressedOwner[e.identifier];
                   return true;
                }
            }

            return false;
        };

        this.getComponentAt = function(x, y){
            for(var i = this.kids.length; --i >= 0; ){
                var c = this.kids[i].getComponentAt(x, y);
                if (c != null) {
                    var p = c;
                    while ((p = p.parent) != null) {
                        if (p.catchInput != null && (p.catchInput === true || (p.catchInput !== false && p.catchInput(c)))) {
                            c = p;
                        }
                    }
                    return c;
                }
            }
            return null;
        };

        this.recalcOffset = function() {
            // calculate the DOM element offset relative to window taking in account
            // scrolling
            var poffx = this.offx,
                poffy = this.offy,
                ba    = this.$container.getBoundingClientRect();

            this.offx = Math.round(ba.left) + zebkit.web.$measure(this.$container, "border-left-width") +
                                              zebkit.web.$measure(this.$container, "padding-left") +
                                              window.pageXOffset;
            this.offy = Math.round(ba.top) +  zebkit.web.$measure(this.$container, "padding-top" ) +
                                              zebkit.web.$measure(this.$container, "border-top-width") +
                                              window.pageYOffset;

            if (this.offx != poffx || this.offy != poffy) {
                // force to fire component re-located event
                this.relocated(this, poffx, poffy);
            }
        };

        /**
         * Get the canvas layer by the specified layer ID. Layer is a children component
         * of the canvas UI component. Every layer has an ID assigned to it the method
         * actually allows developers to get the canvas children component by its ID
         * @param  {String} id a layer ID
         * @return {zebkit.ui.Panel} a layer (children) component
         * @method getLayer
         */
        this.getLayer = function(id) {
            return this[id];
        };

        // override relocated and resized
        // to prevent unnecessary repainting
        this.relocated = function(px,py) {
            COMP_EVENT.source = this;
            COMP_EVENT.px     = px;
            COMP_EVENT.py     = py;
            pkg.events.fireEvent("compMoved", COMP_EVENT);
        };

        this.resized = function(pw,ph) {
            COMP_EVENT.source = this;
            COMP_EVENT.prevWidth  = pw;
            COMP_EVENT.prevHeight = ph;
            pkg.events.fireEvent("compSized", COMP_EVENT);
            // don't forget repaint it
            this.repaint();
        };

        this.$initListeners = function() {
            // TODO: hard-coded
            new pkg.PointerEventUnifier(this.$container, this);
            new pkg.KeyEventUnifier(this.element, this); // element has to be used since canvas is
                                                         // styled to have focus and get key events
            new pkg.MouseWheelSupport(this.$container, this);
        };

        this.fullScreen = function() {
            var element = document.documentElement;
            if (element.requestFullscreen) {
                element.requestFullscreen();
              } else if(element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
              } else if(element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
              } else if(element.msRequestFullscreen) {
                element.msRequestFullscreen();
              }
            //}
        //    document.documentElement.webkitRequestFullscreen();
        };
    },

    function(element, w, h) {
        // no arguments
        if (arguments.length === 0) {
            w = 400;
            h = 400;
        } else {
            if (arguments.length === 1) {
                w = -1;
                h = -1;
            } else {
                if (arguments.length === 2) {
                    h = w;
                    w = element;
                    element = null;
                }
            }
        }

        // if passed element is string than consider it as
        // an ID of an element that is already in DOM tree
        if (zebkit.isString(element)) {
            var id = element;
            element = document.getElementById(id);

            // no canvas can be detected
            if (element == null) {
                throw new Error("Canvas id='" + id + "' element cannot be found");
            }
        }

        this.$super(element);

        // since zCanvas is top level element it doesn't have to have
        // absolute position
        this.$container.style.position = "relative";

        // let canvas zCanvas listen WEB event
        this.$container.style["pointer-events"] = "auto";

        // if canvas is not yet part of HTML let's attach it to
        // body.
        if (this.$container.parentNode == null) {
            document.body.appendChild(this.$container);
        }

        // force canvas to have a focus
        if (this.element.getAttribute("tabindex") === null) {
            this.element.setAttribute("tabindex", "1");
        }

        if (w < 0) w = this.element.offsetWidth;
        if (h < 0) h = this.element.offsetHeight;

        // !!!
        // save canvas in list of created Zebkit canvases
        // do it before calling setSize(w,h) method
        pkg.$canvases.push(this);

        this.setSize(w, h);

        // sync canvas visibility with what canvas style says
        var cvis = (this.element.style.visibility == "hidden" ? false : true);
        if (this.isVisible != cvis) {
            this.setVisible(cvis);
        }

        // call event method if it is defined
        if (this.canvasInitialized != null) {
            this.canvasInitialized();
        }

        var $this = this;

        // this method should clean focus if
        // one of of a child DOM element gets focus
        zebkit.web.$focusin(this.$container, function(e) {
            if (e.target !== $this.$container &&
                e.target.parentNode != null &&
                e.target.parentNode.getAttribute("data-zebcont") == null)
            {
                pkg.focusManager.requestFocus(null);
            } else {
                // clear focus if a focus owner component is placed in another zCanvas
                if (e.target === $this.$container &&
                    pkg.focusManager.focusOwner != null &&
                    pkg.focusManager.focusOwner.getCanvas() !== $this)
                {
                    pkg.focusManager.requestFocus(null);
                }
            }
        }, true);
    },

    function setSize(w, h) {
        if (this.width != w || h != this.height) {
            this.$super(w, h);

            // let know to other zebkit canvases that
            // the size of an element on the page has
            // been updated and they have to correct
            // its anchor.
            pkg.$elBoundsUpdated();
        }
        return this;
    },

    function fullSize() {
        /**
         * Indicate if the canvas has to be stretched to
         * fill the whole screen area.
         * @type {Boolean}
         * @attribute isFullSize
         * @readOnly
         */
        if (this.isFullSize !== true) {
            if (zebkit.web.$contains(this.$container) !== true) {
                throw new Error("zCanvas is not a part of DOM tree");
            }

            this.isFullSize = true;
            this.setLocation(0, 0);

            // adjust body to kill unnecessary gap for inline-block zCanvas element
            // otherwise body size will be slightly horizontally bigger than visual
            // viewport height what causes scroller appears
            document.body.style["font-size"] = "0px";

            var ws = zebkit.web.$viewPortSize();
            this.setSize(ws.width, ws.height);
        }
    },

    function setVisible(b) {
        var prev = this.isVisible;
        this.$super(b);

        // Since zCanvas has no parent component calling the super
        // method above doesn't trigger repainting. So, do it here.
        if (b != prev) {
            this.repaint();
        }
        return this;
    },

    function vrp() {
        this.$super();
        if (zebkit.web.$contains(this.element) && this.element.style.visibility === "visible") {
            this.repaint();
        }
    },

    function kidAdded(i,constr,c){
        if (typeof this[c.id] !== "undefined") {
            throw new Error("Layer '" + c.id + "' already exist");
        }

        this[c.id] = c;
        this.$super(i, constr, c);
    },

    function kidRemoved(i, c){
        delete this[c.id];
        this.$super(i, c);
    }
]);


pkg.HtmlElementMan = Class(pkg.Manager, [
//
// HTML element integrated into zebkit layout has to be tracked regarding:
//    1) DOM hierarchy. New added into zebkit layout DOM element has to be
//       attached to the first found parent DOM element
//    2) Visibility. If a zebkit UI component change its visibility state
//       it has to have side effect to all children HTML elements on any
//       subsequent hierarchy level
//    3) Moving a zebkit UI component has to correct location of children
//       HTML element on any subsequent hierarchy level.
//
//  The implementation of HTML element component has the following specific:
//    1) Every original HTML is wrapped with "div" element. It is necessary since
//       not all HTML element has been designed to be a container for another
//       HTML element. By adding extra div we can consider the wrapper as container.
//       The wrapper element is used to control visibility, location, enabled state
//    2) HTML element has "isDOMElement" property set to true
//    3) HTML element visibility depends on an ancestor component visibility.
//       HTML element is visible if:
//          -- the element isVisible property is true
//          -- the element has a parent DOM element set
//          -- all his ancestors are visible
//          -- size of element is more than zero
//          -- getCanvas() != null
//       The visibility state is controlled with "e.style.visibility"
//
//   To support effective DOM hierarchy tracking a zebkit UI component can
//   host "$domKid" property that contains direct DOM element the UI component
//   hosts and other UI components that host DOM element. So it is sort of tree.
//   For instance:
//
//    +---------------------------------------------------------
//    |  p1 (zebkit component)
//    |   +--------------------------------------------------
//    |   |  p2 (zebkit component)
//    |   |    +---------+      +-----------------------+
//    |   |    |   h1    |      | p3 zebkit component    |
//    |   |    +---------+      |  +---------------+    |
//    |   |                     |  |    h3         |    |
//    |   |    +---------+      |  |  +---------+  |    |
//    |   |    |   h2    |      |  |  |   p4    |  |    |
//    |   |    +---------+      |  |  +---------+  |    |
//    |   |                     |  +---------------+    |
//    |   |                     +-----------------------+
//
//     p1.$domKids : {
//         p2.$domKids : {
//             h1,   // leaf elements are always DOM element
//             h2,
//             p3.$domKids : {
//                h3
//             }
//         }
//     }
    function $prototype() {
        function $isInInvisibleState(c) {
            if (c.isVisible === false           ||
                c.$container.parentNode == null ||
                c.width       <= 0              ||
                c.height      <= 0              ||
                c.parent      == null           ||
                zebkit.web.$contains(c.$container) === false)
            {
                return true;
            }

            var p = c.parent;
            while (p != null && p.isVisible === true && p.width > 0 && p.height > 0) {
                p = p.parent;
            }

            return p != null || pkg.$cvp(c) == null;
        }

        // attach to appropriate DOM parent if necessary
        // c parameter has to be DOM element
        function $resolveDOMParent(c) {
            // try to find an HTML element in zebkit (pay attention, in zebkit hierarchy !)
            // hierarchy that has to be a DOM parent for the given component
            var parentElement = null;
            for(var p = c.parent; p != null; p = p.parent) {
                if (p.isDOMElement === true) {
                    parentElement = p.$container;
                    break;
                }
            }

            // parentElement is null means the component has
            // not been inserted into DOM hierarchy
            if (parentElement != null && c.$container.parentNode == null) {
                // parent DOM element of the component is null, but a DOM container
                // for the element has been detected. We need to add it to DOM
                // than we have to add the DOM to the found DOM parent element
                parentElement.appendChild(c.$container);

                // adjust location of just attached DOM component
                $adjustLocation(c);
            } else {
                // test consistency whether the DOM element already has
                // parent node that doesn't match the discovered
                if (parentElement           != null &&
                    c.$container.parentNode != null &&
                    c.$container.parentNode !== parentElement)
                {
                    throw new Error("DOM parent inconsistent state ");
                }
            }
        }

        //    +----------------------------------------
        //    |             ^      DOM1
        //    |             .
        //    |             .  (x,y) -> (xx,yy) than correct left
        //                  .  and top of DOM2 relatively to DOM1
        //    |    +--------.--------------------------
        //    |    |        .       zebkit1
        //    |    |        .
        //    |    |  (left, top)
        //    |<............+-------------------------
        //    |    |        |           DOM2
        //    |    |        |
        //
        //  Convert DOM (x, y) zebkit coordinates into appropriate CSS top and left
        //  locations relatively to its immediate DOM element. For instance if a
        //  zebkit component contains DOM component every movement of zebkit component
        //  has to bring to correction of the embedded DOM elements
        function $adjustLocation(c) {
            if (c.$container.parentNode != null) {
                // hide DOM component before move
                // makes moving more smooth
                var prevVisibility = c.$container.style.visibility;
                c.$container.style.visibility = "hidden";

                // find a location relatively to the first parent HTML element
                var p = c, xx = c.x, yy = c.y;
                while (((p = p.parent) != null) && p.isDOMElement !== true) {
                    xx += p.x;
                    yy += p.y;
                }

                c.$container.style.left = "" + xx + "px";
                c.$container.style.top  = "" + yy + "px";
                c.$container.style.visibility = prevVisibility;
            }
        }

        // iterate over all found children HTML elements
        // !!! pay attention you have to check existence
        // of "$domKids" field before the method calling
        function $domElements(c, callback) {
            for (var k in c.$domKids) {
                var e = c.$domKids[k];
                if (e.isDOMElement === true) {
                    callback.call(this, e);
                } else {
                    // prevent unnecessary method call by condition
                    if (e.$domKids != null) {
                        $domElements(e, callback);
                    }
                }
            }
        }

        this.compShown = function(e) {
            // 1) if c is DOM element than we have make it is visible if
            //      -- c.isVisible == true : the component visible  AND
            //      -- all elements in parent chain is visible      AND
            //      -- the component is in visible area
            //
            // 2) if c is not a DOM component his visibility state can have
            //    side effect to his children HTML elements (on any level)
            //    In this case we have to do the following:
            //      -- go through all children HTML elements
            //      -- if c.isVisible == false: make invisible every children element
            //      -- if c.isVisible != false: make visible every children element whose
            //         visibility state satisfies the following conditions:
            //          -- kid.isVisible == true
            //          -- all parent to c are in visible state
            //          -- the kid component is in visible area
            var c = e.source;
            if (c.isDOMElement === true) {
                c.$container.style.visibility = c.isVisible === false || $isInInvisibleState(c) ? "hidden"
                                                                                                : "visible";
            } else {
                if (c.$domKids != null) {
                    $domElements(c, function(e) {
                        e.$container.style.visibility = e.isVisible === false || $isInInvisibleState(e) ? "hidden" : "visible";
                    });
                }
            }
        };

        this.compMoved = function(e) {
            var c = e.source;

            // if we move a zebkit component that contains
            // DOM element(s) we have to correct the DOM elements
            // locations relatively to its parent DOM
            if (c.isDOMElement === true) {
                // root canvas location cannot be adjusted since it is up to DOM tree to do it
                if (c.$isRootCanvas !== true) {
                    var dx   = e.prevX - c.x,
                        dy   = e.prevY - c.y,
                        cont = c.$container;

                    cont.style.left = ((parseInt(cont.style.left, 10) || 0) - dx) + "px";
                    cont.style.top  = ((parseInt(cont.style.top,  10) || 0) - dy) + "px";
                }
            } else {
                if (c.$domKids != null) {
                    $domElements(c, function(e) {
                        $adjustLocation(e);
                    });
                }
            }
        };

        function detachFromParent(p, c) {
            // DOM parent means the detached element doesn't
            // have upper parents since it is relative to the
            // DOM element
            if (p.isDOMElement !== true && p.$domKids != null) {
                // delete from parent
                delete p.$domKids[c];

                // parent is not DOM and doesn't have kids anymore
                // what means the parent has to be also detached
                if (isLeaf(p)) {
                    // parent of parent is not null and is not a DOM element
                    if (p.parent != null && p.parent.isDOMElement !== true) {
                        detachFromParent(p.parent, p);
                    }

                    // remove $domKids from parent since the parent is leaf
                    delete p.$domKids;
                }
            }
        }

        function isLeaf(c) {
            if (c.$domKids != null) {
                for(var k in c.$domKids) {
                    if (c.$domKids.hasOwnProperty(k)) return false;
                }
            }
            return true;
        }

        function removeDOMChildren(c) {
            // DOM element cannot have children dependency tree
            if (c.isDOMElement !== true && c.$domKids != null) {
                for(var k in c.$domKids) {
                    if (c.$domKids.hasOwnProperty(k)) {
                        var kid = c.$domKids[k];

                        // DOM element
                        if (kid.isDOMElement === true) {
                            kid.$container.parentNode.removeChild(kid.$container);
                            kid.$container.parentNode = null;
                        } else {
                            removeDOMChildren(kid);
                        }
                    }
                }
                delete c.$domKids;
            }
        }

        this.compRemoved = function(e) {
            var c = e.kid;

            // if detached element is DOM element we have to
            // remove it from DOM tree
            if (c.isDOMElement === true) {
                c.$container.parentNode.removeChild(c.$container);
                c.$container.parentNode = null;
            } else {
                removeDOMChildren(c);
            }

            detachFromParent(e.source, c);
        };

        this.compAdded = function(e) {
            var p = e.source,  c = e.kid;
            if (c.isDOMElement === true) {
                $resolveDOMParent(c);
            } else {
                if (c.$domKids != null) {
                    $domElements(c, function(e) {
                        $resolveDOMParent(e);
                    });
                } else {
                    return;
                }
            }

            if (p.isDOMElement !== true) {
                // we come here if parent is not a DOM element and
                // inserted children is DOM element or an element that
                // embeds DOM elements
                while (p != null && p.isDOMElement !== true) {
                    if (p.$domKids == null) {
                        // if reference to kid DOM element or kid DOM elements holder
                        // has bot been created we have to continue go up to parent of
                        // the parent to register the whole chain of DOM and DOM holders
                        p.$domKids = {};
                        p.$domKids[c] = c;
                        c = p;
                        p = p.parent;
                    } else {
                        if (p.$domKids.hasOwnProperty(c)) {
                            throw new Error("Inconsistent state for " + c + ", " + c.clazz.$name);
                        }
                        p.$domKids[c] = c;
                        break;
                    }
                }
            }
        };
    }
]);

});
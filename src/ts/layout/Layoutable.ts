import Layout from '.';

/**
 * Layoutable class defines rectangular component that
 * has elementary metrical properties like width, height
 * and location and can be a participant of layout management
 * process. Layoutable component is container that can
 * contains other layoutable component as its children.
 * The children components are ordered by applying a layout
 * manager of its parent component.
 * @class zebkit.layout.Layoutable
 * @constructor
 * @extends {zebkit.layout.Layout}
 */
class Layoutable extends Layout {
      /**
       * x coordinate
       * @attribute x
       * @default 0
       * @readOnly
       * @type {Integer}
       */

      /**
      * y coordinate
      * @attribute y
      * @default 0
      * @readOnly
      * @type {Integer}
      */

      /**
      * Width of rectangular area
      * @attribute width
      * @default 0
      * @readOnly
      * @type {Integer}
      */

      /**
      * Height of rectangular area
      * @attribute height
      * @default 0
      * @readOnly
      * @type {Integer}
      */

      /**
      * Indicate a layoutable component visibility
      * @attribute isVisible
      * @default true
      * @readOnly
      * @type {Boolean}
      */

      /**
      * Indicate a layoutable component validity
      * @attribute isValid
      * @default false
      * @readOnly
      * @type {Boolean}
      */

      /**
      * Reference to a parent layoutable component
      * @attribute parent
      * @default null
      * @readOnly
      * @type {zebkit.layout.Layoutable}
      */
    constructor() {
        super();

        this.x = this.y = this.height = this.width = this.cachedHeight= 0;

        this.psWidth = this.psHeight = this.cachedWidth = -1;
        this.isLayoutValid = this.isValid = false;

        /**
         * The component layout constraints. The constraints is specific to
         * the parent component layout manager value that customizes the
         * children component layouting on the parent component.
         * @attribute constraints
         * @default null
         * @type {Object}
         */
        this.constraints = this.parent = null;
        this.isVisible = true;

        /**
         *  Reference to children components
         *  @attribute kids
         *  @type {Array}
         *  @default empty array
         *  @readOnly
         */
        this.kids = [];

        /**
        * Layout manager that is used to order children layoutable components
        * @attribute layout
        * @default itself
        * @readOnly
        * @type {zebkit.layout.Layout}
        */
        this.layout = this;        
    }

    $normPath = (p) {
        p = p.trim();
        if (p[0] === '/') return p;
        if (p[0] === '#') return "//*[@id='" + p.substring(1).trim() + "']";
        return "//" + (p[0] === '.' ? p.substring(1).trim() : p);
    }

    /**
     * Find a first children component that satisfies the passed path expression.
     * @param  {String} path path expression. Path expression is simplified form
     * of XPath-like expression:

    "/Panel"  - find first children that is an instance of zebkit.ui.Panel
    "/Panel[@id='top']" - find first children that is an instance of zebkit.ui.Panel with "id" property that equals "top"
    "//Panel"  - find first children that is an instance of zebkit.ui.Panel recursively

      * Shortcuts:

        "#id" - find a component by its "id" attribute value. This is equivalent of "//*[@id='a component id property']" path
        "zebkit.ui.Button" - find a component by its class.  This is equivalent of "//className" path

      *
      * @method find
      * @return {zebkit.layout.Layoutable} found children component or null if
      * no children component can be found
      */
    find(path){
        var res = null;
        zebkit.util.findInTree(this, $normPath(path),
            function(node, name) {
                return node.clazz != null && zebkit.instanceOf(node, zebkit.Class.forName(name));
            },

            function(kid) {
                res = kid;
                return true;
        });
        return res;
    }

    /**
     * Find children components that satisfy the passed path expression.
     * @param  {String} path path expression. Path expression is
     * simplified form of XPath-like expression:

      "/Panel"  - find first children that is an instance of zebkit.ui.Panel
      "/Panel[@id='top']" - find first children that is an instance of zebkit.ui.Panel with "id" property that equals "top"
      "//Panel"  - find first children that is an instance of zebkit.ui.Panel recursively

      * Shortcuts:

        "#id" - find a component by its "id" attribute value. This is equivalent of "//*[@id='a component id property']" path
        "zebkit.ui.Button" - find a component by its class.  This is equivalent of "//className" path

      * @param {Function} [callback] function that is called every time a
      * new children component has been found.
      * @method findAll
      * @return {Array}  return array of found children components if
      * passed function has not been passed
      */
    findAll(path, callback){
        var res = [];
        if (arguments.length < 2) {
            callback =  function(kid) {
                res.push(kid);
                return false;
            };
        }

        zebkit.util.findInTree(this, $normPath(path),
            function(node, name) {
                return node.clazz != null && zebkit.instanceOf(node, zebkit.Class.forName(name));
            }, callback);
        return res;
    }

    /**
     * Set the given id for the component
     * @chainable
     * @param {String} id an ID to be set
     * @method setId
     */
    setId(id) {
        this.id = id;
        return this;
    }

    /**
     * Apply the given set of properties to the given component or a number of children
     * components.

    var c = new zebkit.layout.Layoutable();
    c.properties({
        width: [100, 100],
        location: [10,10],
        layout: new zebkit.layout.BorderLayout()
    })

    c.add(new zebkit.layout.Layoutable()).add(zebkit.layout.Layoutable()).add(zebkit.layout.Layoutable());
    c.properties("//*", {
        size: [100, 200]
    });


      *
      * @param  {String} [path]  a path to find children components
      * @param  {Object} props a dictionary of properties to be applied
      * @return {zebkit.ui.Layoutable} a component itself
      * @chainable
      * @method properties
      */
    properties(path, props) {
        if (arguments.length === 1) {
            return zebkit.properties(this, path);
        }

        this.findAll(path, function(kid) {
            zebkit.properties(kid, props);
        });
        return this;
    }

    /**
     * Set the given property to the component or children component
     * specified by the given selector
     * @param  {String} [path]  a path to find children components
     * @param  {String} name a property name
     * @param  {object} value a property value
     * @chainable
     * @method property
     */
    property() {
        var p = {};
        if (arguments.length > 2) {
            p[arguments[1]] = arguments[2];
            return this.properties(arguments[0], p);
        }
        p[arguments[0]] = arguments[1];
        return this.properties(p);
    }

    /**
     * Validate the component metrics. The method is called as
     * a one step of the component validation procedure. The
     * method causes "recalc" method execution if the method
     * has been implemented and the component is in invalid
     * state. It is supposed the "recalc" method has to be
     * implemented by a component as safe place where the
     * component metrics can be calculated. Component
     * metrics is individual for the given component
     * properties that has influence to the component
     * preferred size value. In many cases the properties
     * calculation has to be minimized what can be done
     * by moving the calculation in "recalc" method
     * @method validateMetric
     * @protected
     */
    validateMetric(){
        if (this.isValid === false) {
            if (this.recalc != null) this.recalc();
            this.isValid = true;
        }
    }

    /**
     * By default there is no any implementation of "recalc" method
     * in the layoutable component. In other words the method doesn't
     * exist. Developer should implement the method if the need a proper
     * and efficient place  to calculate component properties that
     * have influence to the component preferred size. The "recalc"
     * method is called only when it is really necessary to compute
     * the component metrics.
     * @method recalc
     * @protected
     */

    /**
     * Invalidate the component layout. Layout invalidation means the
     * component children components have to be placed with the component
     * layout manager. Layout invalidation causes a parent component
     * layout is also invalidated.
     * @method invalidateLayout
     * @protected
     */
    invalidateLayout(){
        this.isLayoutValid = false;
        if (this.parent !== null) this.parent.invalidateLayout();
    }

    /**
     * Invalidate component layout and metrics.
     * @method invalidate
     */
    invalidate(){
        this.isValid = this.isLayoutValid = false;
        this.cachedWidth =  -1;
        if (this.parent !== null) {
            this.parent.invalidate();
        }
    }

    /**
     * Force validation of the component metrics and layout if it is not valid
     * @method validate
     */
    validate() {
        if (this.isValid === false) {
            this.validateMetric();
        }

        if (this.width > 0 && this.height > 0 &&
            this.isLayoutValid === false &&
            this.isVisible === true)
        {
            this.layout.doLayout(this);
            for (var i = 0; i < this.kids.length; i++) {
                this.kids[i].validate();
            }
            this.isLayoutValid = true;
            if (this.laidout != null) this.laidout();
        }
    }

    /**
     * The method can be implemented to be informed every time
     * the component has completed to layout its children components
     * @method laidout
     */

    /**
     * Get preferred size. The preferred size includes  top, left,
     * bottom and right paddings and
     * the size the component wants to have
     * @method getPreferredSize
     * @return {Object} return size object the component wants to
     * have as the following structure:

      {width:{Integer}, height:{Integer}} object

      */
    getPreferredSize(){
        this.validateMetric();

        if (this.cachedWidth < 0) {
            var ps = (this.psWidth < 0 || this.psHeight < 0) ? this.layout.calcPreferredSize(this)
                                                              : { width:0, height:0 };

            ps.width  = this.psWidth  >= 0 ? this.psWidth
                                            : ps.width  + this.getLeft() + this.getRight();
            ps.height = this.psHeight >= 0 ? this.psHeight
                                            : ps.height + this.getTop()  + this.getBottom();
            this.cachedWidth  = ps.width;
            this.cachedHeight = ps.height;
            return ps;
        }
        return { width:this.cachedWidth,
                  height:this.cachedHeight };
    }

    /**
     * Get top padding.
     * @method getTop
     * @return {Integer} top padding in pixel
     */
    getTop()  { return 0; }

    /**
     * Get left padding.
     * @method getLeft
     * @return {Integer} left padding in pixel
     */
    getLeft()  { return 0; }

    /**
     * Get bottom padding.
     * @method getBottom
     * @return {Integer} bottom padding in pixel
     */
    getBottom()  { return 0; }

    /**
     * Get right padding.
     * @method getRight
     * @return {Integer} right padding in pixel
     */
    getRight()  { return 0; }

    /**
     * Set the parent component.
     * @protected
     * @param {zebkit.layout.Layoutable} o a parent component
     * @method setParent
     * @protected
     */
    setParent(o) {
        if (o !== this.parent){
            this.parent = o;
            this.invalidate();
        }
    }

    /**
     * Set the given layout manager that is used to place
     * children component. Layout manager is simple class
     * that defines number of rules concerning the way
     * children components have to be ordered on its parent
     * surface.
     * @method setLayout
     * @param {zebkit.ui.Layout} m a layout manager
     * @chainable
     */
    setLayout(m){
        if (m == null) throw new Error("Null layout");

        if (this.layout != m){
            var pl = this.layout;
            this.layout = m;
            this.invalidate();
        }

        return this;
    }

    /**
     * Internal implementation of the component
     * preferred size calculation.
     * @param  {zebkit.layout.Layoutable} target a component
     * for that the metric has to be calculated
     * @return {Object} a preferred size. The method always
     * returns { width:10, height:10 } as the component preferred
     * size
     * @private
     * @method calcPreferredSize
     */
    calcPreferredSize(target){
        return { width:10, height:10 };
    }

    /**
     * By default layoutbable component itself implements
     * layout manager to order its children components.
     * This method implementation does nothing, so children
     * component will placed according locations and sizes they
     * have set.
     * @method doLayout
     * @private
     */
    doLayout(target) {}

    /**
     * Detect index of a children component.
     * @param  {zebkit.ui.Layoutbale} c a children component
     * @method indexOf
     * @return {Integer}
     */
    indexOf(c){
        return this.kids.indexOf(c);
    }

    /**
     * Insert the new children component at the given index with the specified layout constraints.
     * The passed constraints can be set via a layoutable component that is inserted. Just
     * set "constraints" property of in inserted component.
     * @param  {Integer} i an index at that the new children component has to be inserted
     * @param  {Object} constr layout constraints of the new children component
     * @param  {zebkit.layout.Layoutbale} d a new children layoutable component to be added
     * @return {zebkit.layout.Layoutable} an inserted children layoutable component
     * @method insert
     */
    insert(i,constr,d){
        if (d.constraints != null) constr = d.constraints;
        else                       d.constraints = constr;

        if (i === this.kids.length) this.kids.push(d);
        else this.kids.splice(i, 0, d);

        d.setParent(this);

        if (this.kidAdded != null) this.kidAdded(i, constr, d);
        this.invalidate();
        return d;
    }

    /**
     * The method can be implemented to be informed every time a new component
     * has been inserted into the component
     * @param  {Integer} i an index at that the new children component has been inserted
     * @param  {Object} constr layout constraints of the new children component
     * @param  {zebkit.layout.Layoutbale} d a new children layoutable component that has
     * been added
     * @method kidAdded
     */

    /**
     * Set the layoutable component location. Location is x, y coordinates relatively to
     * a parent component
     * @param  {Integer} xx x coordinate relatively to the layoutable component parent
     * @param  {Integer} yy y coordinate relatively to the layoutable component parent
     * @method setLocation
     */
    setLocation(xx,yy){
        if (xx != this.x || this.y != yy){
            var px = this.x, py = this.y;
            this.x = xx;
            this.y = yy;
            if (this.relocated != null) this.relocated(px, py);
        }
        return this;
    }

    /**
     * The method can be implemented to be informed every time the component
     * has been moved
     * @param  {Integer} px x previous coordinate of moved children component
     * @param  {Integer} py y previous coordinate of moved children component
     * @method relocated
     */


    /**
     * Set the layoutable component bounds. Bounds defines the component location and size.
     * @param  {Integer} x x coordinate relatively to the layoutable component parent
     * @param  {Integer} y y coordinate relatively to the layoutable component parent
     * @param  {Integer} w a width of the component
     * @param  {Integer} h a height of the component
     * @method setBounds
     * @chainable
     */
    setBounds(x, y, w, h){
        this.setLocation(x, y);
        this.setSize(w, h);
        return this;
    };

    /**
     * Set the layoutable component size.
     * @param  {Integer} w a width of the component
     * @param  {Integer} h a height of the component
     * @method setSize
     */
    setSize(w,h){
        if (w != this.width || h != this.height){
            var pw = this.width, ph = this.height;
            this.width = w;
            this.height = h;
            this.isLayoutValid = false;
            if (this.resized != null) this.resized(pw, ph);
        }
        return this;
    };

    /**
     * The method can be implemented to be informed every time the component
     * has been resized
     * @param  {Integer} w a previous width of the component
     * @param  {Integer} h a previous height of the component
     * @method resized
     */

    /**
     * Get a children layoutable component by the given constraints.
     * @param  {zebkit.layout.Layoutable} c a constraints
     * @return {zebkit.layout.Layoutable} a children component
     * @method getByConstraints
     */
    getByConstraints(c) {
        if (this.kids.length > 0){
            for(var i = 0;i < this.kids.length; i++ ){
                var l = this.kids[i];
                if (c === l.constraints) return l;
            }
        }
        return null;
    }

    $setConstraints(c) {
        this.constraints = c;
        return this;
    }

    /**
     * Remove the given children component.
     * @param {zebkit.layout.Layoutable} c a children component to be removed
     * @method remove
     * @return {zebkit.layout.Layoutable} a removed children component
     */
    remove(c) {
        return this.removeAt(this.kids.indexOf(c));
    }

    /**
     * Remove a children component at the specified position.
     * @param {Integer} i a children component index at which it has to be removed
     * @method removeAt
     * @return {zebkit.layout.Layoutable} a removed children component
     */
    removeAt(i){
        var obj = this.kids[i];
        obj.setParent(null);
        if (obj.constraints != null) obj.constraints = null;
        this.kids.splice(i, 1);
        if (this.kidRemoved != null) this.kidRemoved(i, obj);
        this.invalidate();
        return obj;
    }

    /**
     * Remove the component from its parent if it has a parent
     * @method removeMe
     */
    removeMe() {
        var i = -1;
        if (this.parent !== null && (i = this.parent.indexOf(this)) >=0) {
            this.parent.removeAt(i);
        }
    }

    /**
     * The method can be implemented to be informed every time a children component
     * has been removed
     * @param {Integer} i a children component index at which it has been removed
     * @param  {zebkit.layout.Layoutable} c a children component that has been removed
     * @method kidRemoved
     */

    /**
     * Set the specified preferred size the component has to have.
     * Component preferred size is important thing that is widely
     * used to layout the component. Usually the preferred
     * size is calculated by a concrete component basing on
     * its metrics. For instance, label component calculates its
     * preferred size basing on text size. But if it is required
     * the component preferred size can be fixed with the desired
     * value.
     * @param  {Integer} w a preferred width. Pass "-1" as the
     * argument value to not set preferred width
     * @param  {Integer} h a preferred height. Pass "-1" as the
     * argument value to not set preferred height
     * @chainable
     * @method setPreferredSize
     */
    setPreferredSize(w, h) {
        // if (arguments.length === 1) {
        //     h = w;
        // }

        if (w != this.psWidth || h != this.psHeight){
            this.psWidth  = w;
            this.psHeight = h;
            this.invalidate();
        }
        return this;
    }

    /**
     * Replace a children component at the specified index
     * with the given new children component
     * @param  {Integer} i an index of a children component to be replaced
     * @param  {zebkit.layout.Layoutable} d a new children
     * @return {zebkit.layout.Layoutable} a previous component that has
     * been re-set with the new one
     * @method setAt
     */
    setAt(i, d) {
        var constr = this.kids[i].constraints,
            pd     = this.removeAt(i);
        if (d != null) this.insert(i, constr, d);
        return pd;
    }

    /**
     * Add the new children component with the given constraints
     * @param  {Object} constr a constraints of a new children component
     * @param  {zebkit.layout.Layoutable} d a new children component to
     * be added
     * @method add
     * @return {zebkit.layout.Layoutable} added layoutable component
     */
    add(constr,d) {
        return (arguments.length === 1) ? this.insert(this.kids.length, null, constr)
                                        : this.insert(this.kids.length, constr, d);
    }
}

(function(pkg, Class) {

pkg.NONE        = 0;
pkg.LEFT        = 1;
pkg.RIGHT       = 2;
pkg.TOP         = 4;
pkg.BOTTOM      = 8;
pkg.CENTER      = 16;
pkg.HORIZONTAL  = 32;
pkg.VERTICAL    = 64;
pkg.TEMPORARY   = 128;

pkg.USE_PS_SIZE = 512;
pkg.STRETCH     = 256;

pkg.TLEFT  = pkg.LEFT  | pkg.TOP;
pkg.TRIGHT = pkg.RIGHT | pkg.TOP;
pkg.BLEFT  = pkg.LEFT  | pkg.BOTTOM;
pkg.BRIGHT = pkg.RIGHT | pkg.BOTTOM;


// collect constraints into a separate dictionary
var $ctrs = {};
for(var k in pkg) {
    if (pkg.hasOwnProperty(k) && /^\d+$/.test(pkg[k])) {
        $ctrs[k.toUpperCase()] = pkg[k];
    }
}

pkg.$constraints = function(v) {
    return zebra.isString(v) ? $ctrs[v.toUpperCase()] : v;
};

/**
 * Layout package provides number of classes, interfaces, methods and 
 * variables that allows developer easily implement rules based layouting 
 * of hierarchy of rectangular elements. The package has no relation 
 * to any concrete UI, but it can be applied to a required UI framework
 *
 * The package declares the following constraints constants:
     
    - **NONE** no constraints 
    - **LEFT** left alignment constraint
    - **TOP** top alignment constraint
    - **RIGHT** right alignment constraint
    - **BOTTOM** bottom alignment constraint
    - **CENTER** center alignment constraint
    - **HORIZONTAL** horizontal elements alignment constraint
    - **VERTICAL** vertical elements alignment constraint
    - **TLEFT** top left alignment constraint
    - **TRIGHT** top right alignment constraint
    - **BLEFT** bottom left alignment constraint
    - **BRIGHT** bottom right alignment constraint
    - **STRETCH** stretch element
    - **USE_PS_SIZE** use preferred size for an element
        
 * 
 * @module layout
 * @main layout
 */

/**
 * Layout manager interface
 * @class zebra.layout.Layout
 * @interface
 */

/**
 * Calculate preferred size of the given component
 * @param {zebra.layout.Layoutable} t a target layoutable component
 * @method calcPreferredSize
 */

/**
 * Layout children components of the specified layoutable target component 
 * @param {zebra.layout.Layoutable} t a target layoutable component
 * @method doLayout
 */
var L = pkg.Layout = new zebra.Interface();

/**
 * Find a direct children element for the given children component 
 * and the specified parent component
 * @param  {zebra.layout.Layoutable} parent  a parent component 
 * @param  {zebra.layout.Layoutable} child  a children component
 * @return {zebra.layout.Layoutable}  a direct children component
 * @method getDirectChild
 * @api zebra.layout.getDirectChild()
 */
pkg.getDirectChild = function(parent,child){
    for(; child != null && child.parent != parent; child = child.parent) {}
    return child;
};

/**
 * Find a direct component located at the given location of the specified 
 * parent component and the specified parent component
 * @param  {Integer} x a x coordinate relatively to the parent component
 * @param  {Integer} y a y coordinate relatively to the parent component
 * @param  {zebra.layout.Layoutable} parent  a parent component 
 * @return {zebra.layout.Layoutable} an index of direct children component 
 * or -1 if no a children component can be found
 * @method getDirectAt
 * @api zebra.layout.getDirectAt()
 */
pkg.getDirectAt = function(x,y,p){
    for(var i = 0;i < p.kids.length; i++){
        var c = p.kids[i];
        if (c.isVisible === true && c.x <= x && c.y <= y && c.x + c.width > x && c.y + c.height > y) return i;
    }
    return -1;
};

/**
 * Get a top (the highest in component hierarchy) parent component 
 * of the given component 
 * @param  {zebra.layout.Layoutable} c a component
 * @return {zebra.layout.Layoutable}  a top parent component
 * @method getTopParent
 * @api zebra.layout.getTopParent()
 */
pkg.getTopParent = function(c){
    for(; c != null && c.parent != null; c = c.parent);
    return c;
};

/**
 * Translate the given relative to the specified component location 
 * in a parent relative location. 
 * @param  {Integer} [x] a x coordinate relatively  to the given component
 * @param  {Integer} [y] a y coordinate relatively  to the given component
 * @param  {zebra.layout.Layoutable} c a component
 * @param  {zebra.layout.Layoutable} [p] a parent component
 * @return {Object} a relative to the given parent UI component location:
 
        { x:{Integer}, y:{Integer} } 

 * @method toParentOrigin
 * @api zebra.layout.toParentOrigin()
 */
pkg.toParentOrigin = function(x,y,c,p){
    if (arguments.length == 1) {
        c = x;
        x = y = 0;
        p = null;
    }
    else {
        if (arguments.length < 4) p = null;
    }

    while (c != p) {
        x += c.x;
        y += c.y;
        c = c.parent;
    }
    return { x:x, y:y };
};

/**
 * Convert the given component location into relative 
 * location of the specified children component successor.      
 * @param  {Integer} x a x coordinate relatively to the given 
 * component
 * @param  {Integer} y a y coordinate relatively to the given 
 * component
 * @param  {zebra.layout.Layoutable} p a component
 * @param  {zebra.layout.Layoutable} c a children successor component
 * @return {Object} a relative location 
 *
 *      { x:{Integer}, y:{Integer} } 
 *
 * @method toChildOrigin
 * @api zebra.layout.toChildOrigin()
 */
pkg.toChildOrigin = function(x, y, p, c){
    while(c != p){
        x -= c.x;
        y -= c.y;
        c = c.parent;
    }
    return { x:x, y:y };
};

pkg.xAlignment = function(aow,alignX,aw){
    if (alignX == pkg.RIGHT)  return aw - aow;
    if (alignX == pkg.CENTER) return ~~((aw - aow) / 2);
    if (alignX == pkg.LEFT || alignX == pkg.NONE) return 0;
    throw new Error("Invalid alignment " + alignX);
};

pkg.yAlignment = function(aoh,alignY,ah){
    if (alignY == pkg.BOTTOM) return ah - aoh;
    if (alignY == pkg.CENTER) return ~~((ah - aoh) / 2);
    if (alignY == pkg.TOP || alignY == pkg.NONE) return 0;
    throw new Error("Invalid alignment " + alignY);
};

/**
 * Calculate maximal preferred width and height of 
 * children component of the given target component.
 * @param  {zebra.layout.Layoutable} target a target component  
 * @return {Object} a maximal preferred width and height 
 
        { width:{Integer}, height:{Integer} }

 * @method getMaxPreferredSize
 * @api zebra.layout.getMaxPreferredSize()
 */
pkg.getMaxPreferredSize = function(target) {
    var maxWidth = 0, maxHeight = 0;
    for(var i = 0;i < target.kids.length; i++){
        var l = target.kids[i];
        if (l.isVisible === true){
            var ps = l.getPreferredSize();
            if (ps.width > maxWidth) maxWidth = ps.width;
            if (ps.height > maxHeight) maxHeight = ps.height;
        }
    }
    return { width:maxWidth, height:maxHeight };
};

pkg.isAncestorOf = function(p,c){
    for(; c != null && c != p; c = c.parent);
    return c != null;
};

/**
 * Layoutable class defines rectangular component that 
 * has elementary metrical properties like width, height 
 * and location and can be a participant of layout management 
 * process. Layoutable component is container that can 
 * contains other layoutable component as its children. 
 * The children components are ordered by applying a layout 
 * manager of its parent component. 
 * @class zebra.layout.Layoutable
 * @constructor
 * @extends {zebra.layout.Layout}
 */
pkg.Layoutable = Class(L, [
    function $prototype() {
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
        * @type {zebra.layout.Layoutable}
        */

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

        function $normPath(p) {
            p = p.trim();
            if (p[0] == '/') return p;
            if (p[0] == '#') return "//*[@id='" + p.substring(1).trim() + "']";
            return "//" + (p[0] == '.' ? p.substring(1).trim() : p);
        }

        /**
         * Find a first children component that satisfies the passed path expression. 
         * @param  {String} path path expression. Path expression is simplified form 
         * of XPath-like expression:
         
        "/Panel"  - find first children that is an instance of zebra.ui.Panel
        "/Panel[@id='top']" - find first children that is an instance of zebra.ui.Panel with "id" property that equals "top"
        "//Panel"  - find first children that is an instance of zebra.ui.Panel recursively 
        
         * Shortcuts:
        
            "#id" - find a component by its "id" attribute value. This is equivalent of "//*[@id='a component id property']" path
            "zebra.ui.Button" - find a component by its class.  This is equivalent of "//className" path
            
         *
         * @method find
         * @return {zebra.layout.Layoutable} found children component or null if 
         * no children component can be found
         */
        this.find = function(path){
            var res = null;
            zebra.util.findInTree(this, $normPath(path),
                function(node, name) {
                    return node.$clazz != null && zebra.instanceOf(node, zebra.Class.forName(name)); 
                },

                function(kid) {
                   res = kid;
                   return true;
            });
            return res;
        };

        /**
         * Find children components that satisfy the passed path expression. 
         * @param  {String} path path expression. Path expression is 
         * simplified form of XPath-like expression:
         
         "/Panel"  - find first children that is an instance of zebra.ui.Panel
         "/Panel[@id='top']" - find first children that is an instance of zebra.ui.Panel with "id" property that equals "top"
         "//Panel"  - find first children that is an instance of zebra.ui.Panel recursively 

         * Shortcuts:
        
            "#id" - find a component by its "id" attribute value. This is equivalent of "//*[@id='a component id property']" path
            "zebra.ui.Button" - find a component by its class.  This is equivalent of "//className" path
         
         * @param {Function} [callback] function that is called every time a 
         * new children component has been found.  
         * @method findAll
         * @return {Array}  return array of found children components if 
         * passed function has not been passed
         */
        this.findAll = function(path, callback){
            var res = [];
            if (callback == null) {
                callback =  function(kid) {
                    res.push(kid);
                    return false;
                };
            }

            zebra.util.findInTree(this, $normPath(path),
                function(node, name) {
                    return node.$clazz != null && zebra.instanceOf(node, zebra.Class.forName(name)); 
                }, callback);
            return res;
        };

        /**
         * Set the given id for the component 
         * @chainable 
         * @param {String} id an ID to be set
         * @method setId
         */
        this.setId = function(id) {
            this.id = id;
            return this;
        };

        /**
         * Apply the given set of properties to the given component or a number of children
         * components. 
 
        var c = new zebra.layout.Layoutable();
        c.properties({
            width: [100, 100],
            location: [10,10],
            layout: new zebra.layout.BorderLayout()
        })

        c.add(new zebra.layout.Layoutable()).add(zebra.layout.Layoutable()).add(zebra.layout.Layoutable());
        c.properties("//*", {
            size: [100, 200]
        });


         *
         * @param  {String} [path]  a path to find children components
         * @param  {Object} props a dictionary of properties to be applied
         * @return {zebra.ui.Layoutable} a component itself
         * @chainable
         * @method properties
         */
        this.properties = function(path, props) {
            if (arguments.length === 1) {
                return zebra.properties(this, path);     
            }

            this.findAll(path, function(kid) {
                zebra.properties(kid, props);   
            });
            return this;
        };

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
        this.validateMetric = function(){
            if (this.isValid === false) {
                if (this.recalc != null) this.recalc();
                this.isValid = true;
            }
        };

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
        this.invalidateLayout = function(){
            this.isLayoutValid = false;
            if (this.parent != null) this.parent.invalidateLayout();
        };

        /**
         * Invalidate component layout and metrics.
         * @method invalidate
         */
        this.invalidate = function(){
            this.isValid = this.isLayoutValid = false;
            this.cachedWidth =  -1;
            if (this.parent != null) this.parent.invalidate();
        };

        /**
         * Force validation of the component metrics and layout if it is not valid
         * @method validate
         */
        this.validate = function(){
            this.validateMetric();
            if (this.width > 0 && this.height > 0 &&
                this.isLayoutValid === false && 
                this.isVisible === true)
            {
                this.layout.doLayout(this);
                for(var i = 0;i < this.kids.length; i++) {
                    this.kids[i].validate();
                }
                this.isLayoutValid = true;
                if (this.laidout != null) this.laidout();
            }
        };

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
        this.getPreferredSize = function(){
            this.validateMetric();
            if (this.cachedWidth < 0){
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
        };

        /**
         * Get top padding.
         * @method getTop
         * @return {Integer} top padding in pixel
         */
        this.getTop = function ()  { return 0; };

        /**
         * Get left padding.
         * @method getLeft
         * @return {Integer} left padding in pixel
         */
        this.getLeft = function ()  { return 0; };

        /**
         * Get bottom padding.
         * @method getBottom
         * @return {Integer} bottom padding in pixel
         */
        this.getBottom = function ()  { return 0; };

        /**
         * Get right padding.
         * @method getRight
         * @return {Integer} right padding in pixel
         */
        this.getRight = function ()  { return 0; };

        /**
         * Set the parent component.  
         * @protected
         * @param {zebra.layout.Layoutable} o a parent component 
         * @method setParent
         * @protected
         */
        this.setParent = function (o){
            if (o != this.parent){
                this.parent = o;
                this.invalidate();
            }
        };

        /**
         * Set the given layout manager that is used to place 
         * children component. Layout manager is simple class 
         * that defines number of rules concerning the way 
         * children components have to be ordered on its parent 
         * surface.  
         * @method setLayout
         * @param {zebra.ui.Layout} m a layout manager 
         * @chainable 
         */
        this.setLayout = function (m){
            if (m == null) throw new Error("Null layout");

            if (this.layout != m){
                var pl = this.layout;
                this.layout = m;
                this.invalidate();
            }

            return this;
        };

        /**
         * Internal implementation of the component 
         * preferred size calculation.  
         * @param  {zebra.layout.Layoutable} target a component 
         * for that the metric has to be calculated
         * @return {Object} a preferred size. The method always 
         * returns { width:10, height:10 } as the component preferred 
         * size
         * @private
         * @method calcPreferredSize
         */
        this.calcPreferredSize = function (target){
            return { width:10, height:10 };
        };

        /**
         * By default layoutbable component itself implements 
         * layout manager to order its children components.
         * This method implementation does nothing, so children 
         * component will placed according locations and sizes they 
         * have set.  
         * @method doLayout
         * @private
         */
        this.doLayout = function (target) {};

        /**
         * Detect index of a children component.
         * @param  {zebra.ui.Layoutbale} c a children component
         * @method indexOf
         * @return {Integer}
         */
        this.indexOf = function (c){
            return this.kids.indexOf(c);
        };

        /**
         * Insert the new children component at the given index with the specified layout constraints. 
         * The passed constraints can be set via a layoutable component that is inserted. Just 
         * set "constraints" property of in inserted component.
         * @param  {Integer} i an index at that the new children component has to be inserted 
         * @param  {Object} constr layout constraints of the new children component
         * @param  {zebra.layout.Layoutbale} d a new children layoutable component to be added
         * @return {zebra.layout.Layoutable} an inserted children layoutable component
         * @method insert
         */
        this.insert = function(i,constr,d){
            if (d.constraints != null) constr = d.constraints;
            else                       d.constraints = constr;

            if (i == this.kids.length) this.kids.push(d);
            else this.kids.splice(i, 0, d);

            d.setParent(this);

            if (this.kidAdded != null) this.kidAdded(i, constr, d);
            this.invalidate();
            return d;
        };

        /**
         * The method can be implemented to be informed every time a new component 
         * has been inserted into the component
         * @param  {Integer} i an index at that the new children component has been inserted 
         * @param  {Object} constr layout constraints of the new children component
         * @param  {zebra.layout.Layoutbale} d a new children layoutable component that has 
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
        this.setLocation = function (xx,yy){
            if (xx != this.x || this.y != yy){
                var px = this.x, py = this.y;
                this.x = xx;
                this.y = yy;
                if (this.relocated != null) this.relocated(px, py);
            }
        };

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
        this.setBounds = function (x, y, w, h){
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
        this.setSize = function (w,h){
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
         * @param  {zebra.layout.Layoutable} c a constraints
         * @return {zebra.layout.Layoutable} a children component
         * @method getByConstraints
         */
        this.getByConstraints = function (c) {
            if (this.kids.length > 0){
                for(var i = 0;i < this.kids.length; i++ ){
                    var l = this.kids[i];
                    if (c == l.constraints) return l;
                }
            }
            return null;
        };

        /**
         * Remove the given children component.
         * @param {zebra.layout.Layoutable} c a children component to be removed
         * @method remove
         * @return {zebra.layout.Layoutable} a removed children component 
         */
        this.remove = function(c) { 
            return this.removeAt(this.kids.indexOf(c)); 
        };

        /**
         * Remove a children component at the specified position.
         * @param {Integer} i a children component index at which it has to be removed 
         * @method removeAt
         * @return {zebra.layout.Layoutable} a removed children component 
         */
        this.removeAt = function (i){
            var obj = this.kids[i];
            obj.setParent(null);
            if (obj.constraints) obj.constraints = null;
            this.kids.splice(i, 1);
            if (this.kidRemoved != null) this.kidRemoved(i, obj);
            this.invalidate();
            return obj;
        };

        /**
         * Remove the component from its parent if it has a parent 
         * @method removeMe
         */
        this.removeMe = function() {
            var i = -1;
            if (this.parent != null && (i = this.parent.indexOf(this)) >=0) {
                this.parent.removeAt(i);
            }
        };

        /**
         * The method can be implemented to be informed every time a children component
         * has been removed
         * @param {Integer} i a children component index at which it has been removed 
         * @param  {zebra.layout.Layoutable} c a children component that has been removed
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
         * @method setPreferredSize
         */
        this.setPreferredSize = function(w,h) {
            if (w != this.psWidth || h != this.psHeight){
                this.psWidth  = w;
                this.psHeight = h;
                this.invalidate();
            }
        };

        /**
         * Replace a children component at the specified index
         * with the given new children component
         * @param  {Integer} i an index of a children component to be replaced
         * @param  {zebra.layout.Layoutable} d a new children 
         * @return {zebra.layout.Layoutable} a previous component that has 
         * been re-set with the new one
         * @method setAt
         */
        this.setAt = function(i, d) {
            var pd = this.removeAt(i);
            if (d != null) this.insert(i, constr, d);
            return pd;
        };

        /**
         * Add the new children component with the given constraints 
         * @param  {Object} constr a constraints of a new children component
         * @param  {zebra.layout.Layoutable} d a new children component to 
         * be added
         * @method add
         * @return {zebra.layout.Layoutable} added layoutable component 
         */
        this.add = function(constr,d) {
            return (arguments.length == 1) ? this.insert(this.kids.length, null, constr) 
                                           : this.insert(this.kids.length, constr, d);
        };

        // speedup constructor execution
        this[''] = function() {
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
            * @type {zebra.layout.Layout}
            */
            this.layout = this;
        };
    }
]);

/**
 *  Layout manager implementation that places layoutbale components 
 *  on top of each other stretching its to fill all available parent 
 *  component space 
 *  @class zebra.layout.StackLayout
 *  @constructor
 */
pkg.StackLayout = Class(L, [
    function $prototype() {
        this.calcPreferredSize = function (target){
            return pkg.getMaxPreferredSize(target);
        };

        this.doLayout = function(t){
            var top = t.getTop()  , hh = t.height - t.getBottom() - top,
                left = t.getLeft(), ww = t.width - t.getRight() - left;

            for(var i = 0;i < t.kids.length; i++){
                var l = t.kids[i];
                if (l.isVisible === true) {
                    if (l.constraints == pkg.USE_PS_SIZE) {
                        var ps = l.getPreferredSize();
                        l.setSize(ps.width, ps.height);
                        l.setLocation(left + (ww - ps.width)/2, top + (hh - ps.height)/2);
                    }
                    else {
                        l.setSize(ww, hh);
                        l.setLocation(left, top);
                    }
                }
            }
        };
    }
]);

/**
 *  Layout manager implementation that logically splits component area into five areas: TOP, BOTTOM, LEFT, RIGHT and CENTER.
 *  TOP and BOTTOM components are stretched to fill all available space horizontally and are sized to have preferred height horizontally. 
 *  LEFT and RIGHT components are stretched to fill all available space vertically and are sized to have preferred width vertically.
 *  CENTER component is stretched to occupy all available space taking in account TOP, LEFT, RIGHT and BOTTOM components.
 
       // create panel with border layout
       var p = new zebra.ui.Panel(new zebra.layout.BorderLayout());
       
       // add children UI components with top, center and left constraints 
       p.add(zebra.layout.TOP,    new zebra.ui.Label("Top"));
       p.add(zebra.layout.CENTER, new zebra.ui.Label("Center"));
       p.add(zebra.layout.LEFT,   new zebra.ui.Label("Left"));
 
 * Construct the layout with the given vertical and horizontal gaps. 
 * @param  {Integer} [hgap] horizontal gap. The gap is a horizontal distance between laid out components  
 * @param  {Integer} [vgap] vertical gap. The gap is a vertical distance between laid out components  
 * @constructor 
 * @class zebra.layout.BorderLayout
 * @extends {zebra.layout.Layout}
 */
pkg.BorderLayout = Class(L, [
    function $prototype() {
        /**
         * Horizontal gap (space between components)
         * @attribute hgap
         * @default 0
         * @readOnly
         * @type {Integer}
         */

        /**
         * Vertical gap (space between components)
         * @attribute vgap
         * @default 0
         * @readOnly
         * @type {Integer}
         */
        this.hgap = this.vgap = 0;

        this[''] = function(hgap,vgap){
            if (arguments.length > 0) {
                if (arguments.length == 1) {
                    this.hgap = this.vgap = hgap;    
                }
                else {
                    this.hgap = hgap;
                    this.vgap = vgap;
                }
            }
        };

        this.calcPreferredSize = function (target){
            var center = null, west = null,  east = null, north = null, south = null, d = null;
            for(var i = 0; i < target.kids.length; i++){
                var l = target.kids[i];
                if (l.isVisible === true){
                    switch(l.constraints) {
                       case pkg.CENTER : center = l;break;
                       case pkg.TOP    : north  = l;break;
                       case pkg.BOTTOM : south  = l;break;
                       case pkg.LEFT   : west   = l;break;
                       case pkg.RIGHT  : east   = l;break;
                       default: throw new Error("Invalid constraints: " + l.constraints);
                    }
                }
            }

            var dim = { width:0, height:0 };
            if (east != null) {
                d = east.getPreferredSize();
                dim.width += d.width + this.hgap;
                dim.height = (d.height > dim.height ? d.height: dim.height );
            }

            if (west != null) {
                d = west.getPreferredSize();
                dim.width += d.width + this.hgap;
                dim.height = d.height > dim.height ? d.height : dim.height;
            }

            if (center != null) {
                d = center.getPreferredSize();
                dim.width += d.width;
                dim.height = d.height > dim.height ? d.height : dim.height;
            }

            if (north != null) {
                d = north.getPreferredSize();
                dim.width = d.width > dim.width ? d.width : dim.width;
                dim.height += d.height + this.vgap;
            }

            if (south != null) {
                d = south.getPreferredSize();
                dim.width = d.width > dim.width ? d.width : dim.width;
                dim.height += d.height + this.vgap;
            }
            return dim;
        };

        this.doLayout = function(t){
            var top = t.getTop(), bottom = t.height - t.getBottom(),
                left = t.getLeft(), right = t.width - t.getRight(),
                center = null, west = null,  east = null;

            for(var i = 0;i < t.kids.length; i++){
                var l = t.kids[i];
                if (l.isVisible === true) {
                    switch(l.constraints) {
                        case pkg.CENTER: center = l; break;
                        case pkg.TOP :
                            var ps = l.getPreferredSize();
                            l.setLocation(left, top);
                            l.setSize(right - left, ps.height);
                            top += ps.height + this.vgap;
                            break;
                        case pkg.BOTTOM:
                            var ps = l.getPreferredSize();
                            l.setLocation(left, bottom - ps.height);
                            l.setSize(right - left, ps.height);
                            bottom -= ps.height + this.vgap;
                            break;
                        case pkg.LEFT: west = l; break;
                        case pkg.RIGHT: east = l; break;
                        default: throw new Error("Invalid constraints: " + l.constraints);
                    }
                }
            }

            if (east != null){
                var d = east.getPreferredSize();
                east.setLocation(right - d.width, top);
                east.setSize(d.width, bottom - top);
                right -= d.width + this.hgap;
            }

            if (west != null){
                var d = west.getPreferredSize();
                west.setLocation(left, top);
                west.setSize(d.width, bottom - top);
                left += d.width + this.hgap;
            }

            if (center != null){
                center.setLocation(left, top);
                center.setSize(right - left, bottom - top);
            }
        };
    }
]);

/**
 * Rester layout manager can be used to use absolute position of 
 * layoutable components. That means all components will be laid 
 * out according coordinates and size they have. Raster layout manager 
 * provides extra possibilities to control children components placing. 
 * It is possible to align components by specifying layout constraints, 
 * size component to its preferred size and so on.  
 * @param {Integer} [m] flag to add extra rule to components layouting. 
 * For instance use zebra.layout.USE_PS_SIZE as the flag value to set 
 * components size to its preferred sizes.  
 * @class  zebra.layout.RasterLayout
 * @constructor
 * @extends {zebra.layout.Layout}
 */
pkg.RasterLayout = Class(L, [
    function $prototype() {
        this.calcPreferredSize = function(c){
            var m = { width:0, height:0 }, b = (this.flag & pkg.USE_PS_SIZE) > 0;
            for(var i = 0;i < c.kids.length; i++ ){
                var el = c.kids[i];
                if (el.isVisible === true){
                    var ps = b ? el.getPreferredSize() : { width:el.width, height:el.height },
                        px = el.x + ps.width, py = el.y + ps.height;
                    if (px > m.width) m.width = px;
                    if (py > m.height) m.height = py;
                }
            }
            return m;
        };

        this.doLayout = function(c){
            var r = c.width - c.getRight(), 
                b = c.height - c.getBottom(),
                usePsSize = (this.flag & pkg.USE_PS_SIZE) > 0;

            for(var i = 0;i < c.kids.length; i++){
                var el = c.kids[i], ww = 0, hh = 0;
                if (el.isVisible === true){
                    if (usePsSize){
                        var ps = el.getPreferredSize();
                        ww = ps.width;
                        hh = ps.height;
                    }
                    else{
                        ww = el.width;
                        hh = el.height;
                    }

                    if ((this.flag & pkg.HORIZONTAL) > 0) ww = r - el.x;
                    if ((this.flag & pkg.VERTICAL  ) > 0) hh = b - el.y;
                    el.setSize(ww, hh);

                    if (el.constraints) {
                        var x = el.x, y = el.y;
                        if (el.constraints == pkg.CENTER) {
                            x = (c.width - ww)/2;
                            y = (c.height - hh)/2;
                        }
                        else {
                            if ((el.constraints & pkg.TOP) > 0)  y = 0;
                            else
                            if ((el.constraints & pkg.BOTTOM) > 0)  y = c.height - hh;

                            if ((el.constraints & pkg.LEFT) > 0)  x = 0;
                            else
                            if ((el.constraints & pkg.RIGHT) > 0)  x = c.width - ww;
                        }

                        el.setLocation(x, y);
                    }
                }
            }
        };

        //!!! speed up
        this[''] = function(f) {
            this.flag = f ? f : 0;
        };
    }
]);

/**
 * Flow layout manager group and places components aligned with 
 * different vertical and horizontal alignments
  
        // create panel and set flow layout for it
        // components added to the panel will be placed 
        // horizontally aligned at the center of the panel 
        var p = new zebra.ui.Panel();
        p.setLayout(new zebra.layout.FlowLayout(zebra.layout.CENTER, zebra.layout.CENTER));

        // add three buttons into the panel with flow layout 
        p.add(new zebra.ui.Button("Button 1"));
        p.add(new zebra.ui.Button("Button 2"));
        p.add(new zebra.ui.Button("Button 3"));
  
 * @param {Integer|String} [ax] (zebra.layout.LEFT by default) horizontal alignment:
  
     zebra.layout.LEFT - left alignment 
     zebra.layout.RIGHT - right alignment 
     zebra.layout.CENTER - center alignment 

     or
     
     "left" 
     "center"
     "right"  
 
 * @param {Integer|String} [ay] (zebra.layout.TOP by default) vertical alignment:
 
     zebra.layout.TOP - top alignment 
     zebra.layout.CENTER - center alignment 
     zebra.layout.BOTTOM - bottom alignment 

     or
     
     "top" 
     "center"
     "bottom"  

 * @param {Integer|String} [dir] (zebra.layout.HORIZONTAL by default) a direction 
 * the component has to be placed in the layout
 
     zebra.layout.VERTICAL - vertical placed components
     zebra.layout.HORIZONTAL - horizontal placed components 
      
     or
     
     "vertical" 
     "horizontal"  
    

 * @param {Integer} [gap] a space in pixels between laid out components
 * @class  zebra.layout.FlowLayout
 * @constructor
 * @extends {zebra.layout.Layout}
 */
pkg.FlowLayout = Class(L, [
    function $prototype() {
        /**
         * Gap between laid out components
         * @attribute gap
         * @readOnly
         * @type {Integer}
         * @default 0
         */
        this.gap = 0;

        /**
         * Horizontal laid out components alignment 
         * @attribute ax
         * @readOnly
         * @type {Integer|String}
         * @default zebra.layout.LEFT
         */
        this.ax = pkg.LEFT;

        /**
         * Vertical laid out components alignment 
         * @attribute ay
         * @readOnly
         * @type {Integer|String}
         * @default zebra.layout.TOP
         */
        this.ay = pkg.TOP;

        /**
         * Laid out components direction
         * @attribute direction
         * @readOnly
         * @type {Integer|String}
         * @default zebra.layout.HORIZONTAL
         */
        this.direction = pkg.HORIZONTAL;

        this.stretchLast = false;

        this[''] =  function (ax,ay,dir,g){
            if (arguments.length == 1) this.gap = ax;
            else {
                if (arguments.length >= 2) {
                    this.ax = pkg.$constraints(ax);
                    this.ay = pkg.$constraints(ay);
                }

                if (arguments.length > 2)  {
                    dir = pkg.$constraints(dir);
                    if (dir != pkg.HORIZONTAL && dir != pkg.VERTICAL) {
                        throw new Error("Invalid direction " + dir);
                    }
                    this.direction = dir;
                }

                if (arguments.length > 3) this.gap = g;
            }
        };

        this.calcPreferredSize = function (c){
            var m = { width:0, height:0 }, cc = 0;
            for(var i = 0;i < c.kids.length; i++){
                var a = c.kids[i];
                if (a.isVisible === true){
                    var d = a.getPreferredSize();
                    if (this.direction == pkg.HORIZONTAL){
                        m.width += d.width;
                        m.height = d.height > m.height ? d.height : m.height;
                    }
                    else {
                        m.width = d.width > m.width ? d.width : m.width;
                        m.height += d.height;
                    }
                    cc++;
                }
            }
            var add = this.gap * (cc > 0 ? cc - 1 : 0);
            if (this.direction == pkg.HORIZONTAL) m.width += add;
            else m.height += add;
            return m;
        };

        this.doLayout = function(c){
            var psSize = this.calcPreferredSize(c), t = c.getTop(), l = c.getLeft(), lastOne = null,
                px = pkg.xAlignment(psSize.width,  this.ax, c.width  - l - c.getRight()) + l,
                py = pkg.yAlignment(psSize.height, this.ay, c.height - t - c.getBottom()) + t;

            for(var i = 0;i < c.kids.length; i++){
                var a = c.kids[i];
                if (a.isVisible === true){

                    var d = a.getPreferredSize();
                    if (this.direction == pkg.HORIZONTAL){
                        if (a.constraints === pkg.STRETCH) { 
                            d.height = c.height - t - c.getBottom();
                        }

                        a.setLocation(px, ~~((psSize.height - d.height) / 2) + py);
                        px += (d.width + this.gap);
                    }
                    else {
                        if (a.constraints === pkg.STRETCH) d.width = c.width - l - c.getRight();
                        a.setLocation(px + ~~((psSize.width - d.width) / 2), py);
                        py += d.height + this.gap;
                    }

                    a.setSize(d.width, d.height);
                    lastOne = a;
                }
            }

            if (lastOne !== null && this.stretchLast === true){
                if (this.direction == pkg.HORIZONTAL) {
                    lastOne.setSize(c.width - lastOne.x - c.getRight(), lastOne.height);
                }
                else {
                    lastOne.setSize(lastOne.width, c.height - lastOne.y - c.getBottom());
                }
            }
        };
    }
]);

/**
 * List layout places components vertically one by one 
  
        // create panel and set list layout for it
        var p = new zebra.ui.Panel();
        p.setLayout(new zebra.layout.ListLayout());

        // add three buttons into the panel with list layout 
        p.add(new zebra.ui.Button("Item 1"));
        p.add(new zebra.ui.Button("Item 2"));
        p.add(new zebra.ui.Button("Item 3"));
  
 * @param {Integer|String} [ax] horizontal list item alignment:
  
     zebra.layout.LEFT - left alignment 
     zebra.layout.RIGHT - right alignment 
     zebra.layout.CENTER - center alignment 
     zebra.layout.STRETCH - stretching item to occupy the whole horizontal space

     or

     "left"
     "right"
     "center"
     "stretch"

 * @param {Integer} [gap] a space in pixels between laid out components
 * @class  zebra.layout.ListLayout
 * @constructor
 * @extends {zebra.layout.Layout}
 */
pkg.ListLayout = Class(L,[
    function $prototype() {
        this[''] = function (ax, gap) {
            if (arguments.length == 1) {
                gap = ax;
            }

            if (arguments.length <= 1) {
                ax = pkg.$constraints(pkg.STRETCH);
            }

            if (arguments.length === 0) {
                gap = 0;
            }

            if (ax != pkg.STRETCH && ax != pkg.LEFT && 
                ax != pkg.RIGHT && ax != pkg.CENTER) 
            {
                throw new Error("Invalid alignment");
            }

            /**
             * Horizontal list items alignment 
             * @attribute ax
             * @type {Integer}
             * @readOnly
             */
            this.ax = ax;

            /**
             * Pixel gap between list items
             * @attribute gap
             * @type {Integer}
             * @readOnly
             */
            this.gap = gap;
        };

        this.calcPreferredSize = function (lw){
            var w = 0, h = 0, c = 0;
            for(var i = 0; i < lw.kids.length; i++){
                var kid = lw.kids[i];
                if (kid.isVisible === true){
                    var d = kid.getPreferredSize();
                    h += (d.height + (c > 0 ? this.gap : 0));
                    c++;
                    if (w < d.width) w = d.width;
                }
            }
            return { width:w, height:h };
        };

        this.doLayout = function (lw){
            var x = lw.getLeft(), y = lw.getTop(), psw = lw.width - x - lw.getRight();
            for(var i = 0;i < lw.kids.length; i++){
                var cc = lw.kids[i];
                if (cc.isVisible === true){
                    var d = cc.getPreferredSize(), constr = cc.constraints;
                    if (constr == null) constr = this.ax;
                    cc.setSize    ((constr == pkg.STRETCH) ? psw : d.width, d.height);
                    cc.setLocation((constr == pkg.STRETCH) ? x   : x + pkg.xAlignment(cc.width, constr, psw), y);
                    y += (d.height + this.gap);
                }
            }
        };
    }
]);

/**
 * Percent layout places components vertically or horizontally and 
 * sizes its according to its percentage constraints.
  
        // create panel and set percent layout for it
        var p = new zebra.ui.Panel();
        p.setLayout(new zebra.layout.PercentLayout());

        // add three buttons to the panel that are laid out horizontally with
        // percent layout according to its constraints: 20, 30 and 50 percents
        p.add(20, new zebra.ui.Button("20%"));
        p.add(30, new zebra.ui.Button("30%"));
        p.add(50, new zebra.ui.Button("50%"));
  
 * @param {Integer|String} [dir] a direction of placing components. The 
 * value can be "zebra.layout.HORIZONTAL" or "zebra.layout.VERTICAL" or 
 * "horizontal" or "vertical" 
 * @param {Integer} [gap] a space in pixels between laid out components
 * @param {Boolean} [stretch] true if the component should be stretched 
 * vertically or horizontally
 * @class  zebra.layout.PercentLayout
 * @constructor
 * @extends {zebra.layout.Layout}
 */
pkg.PercentLayout = Class(L, [
    function $prototype() {
         /**
          * Direction the components have to be placed (vertically or horizontally)
          * @attribute direction
          * @readOnly
          * @type {Integer}
          * @default zebra.layout.HORIZONTAL
          */
        this.direction = pkg.HORIZONTAL;

        /**
         * Pixel gap between components
         * @attribute gap
         * @readOnly
         * @type {Integer}
         * @default 2
         */
        this.gap = 2;

        /**
         * Boolean flag that say if the laid out components have 
         * to be stretched vertically (if direction is set to zebra.layout.VERTICAL) 
         * or horizontally (if direction is set to zebra.layout.HORIZONTAL) 
         * @attribute stretch
         * @readOnly
         * @type {Integer}
         * @default true
         */
        this.stretch = true;

        this[''] = function(dir, gap, stretch) {
            if (arguments.length > 0) {
                this.direction = pkg.$constraints(dir);
                if (this.direction != pkg.HORIZONTAL && this.direction != pkg.VERTICAL) {
                    throw new Error("Invalid direction : " + this.direction);
                }
                
                if (arguments.length > 1) this.gap = gap;
                if (arguments.length > 2) this.stretch = stretch;
            }
        };

        this.doLayout = function(target){
            var right  = target.getRight(),
                top    = target.getTop(),
                bottom = target.getBottom(),
                left   = target.getLeft(),
                size   = target.kids.length,
                rs     = -this.gap * (size === 0 ? 0 : size - 1),
                loc    = 0,
                ns     = 0;

            if (this.direction == pkg.HORIZONTAL){
                rs += target.width - left - right;
                loc = left;
            }
            else{
                rs += target.height - top - bottom;
                loc = top;
            }

            for(var i = 0;i < size; i ++ ){
                var l = target.kids[i], c = l.constraints, useps = (c == pkg.USE_PS_SIZE);
                if (this.direction == pkg.HORIZONTAL){
                    ns = ((size - 1) == i) ? target.width - right - loc
                                           : (useps ? l.getPreferredSize().width
                                                      : ~~((rs * c) / 100));
                    var yy = top, hh = target.height - top - bottom;
                    if (this.stretch === false) {
                        var ph = hh;
                        hh = l.getPreferredSize().height;
                        yy = top + ~~((ph - hh) / 2);
                    }

                    l.setLocation(loc, yy);
                    l.setSize(ns, hh);
                }
                else {
                    ns = ((size - 1) == i) ? target.height - bottom - loc
                                           : (useps ? l.getPreferredSize().height
                                                    : ~~((rs * c) / 100));
                    var xx = left, ww = target.width - left - right;
                    if (this.stretch === false) {
                        var pw = ww;
                        ww = l.getPreferredSize().width;
                        xx = left + ~~((pw - ww) / 2 );
                    }

                    l.setLocation(xx, loc);
                    l.setSize(ww, ns);
                }
                loc += (ns + this.gap);
            }
        };

        this.calcPreferredSize = function (target){
            var max  = 0,
                size = target.kids.length,
                as   = this.gap * (size === 0 ? 0 : size - 1);

            for(var i = 0;i < size; i++){
                var d = target.kids[i].getPreferredSize();
                if (this.direction == pkg.HORIZONTAL){
                    if(d.height > max) max = d.height;
                    as += d.width;
                }
                else {
                    if(d.width > max) max = d.width;
                    as += d.height;
                }
            }
            return (this.direction == pkg.HORIZONTAL) ? { width:as, height:max }
                                                      : { width:max, height:as };
        };
    }
]);

/**
 * Grid layout manager constraints. Constraints says how a  component has to be placed in 
 * grid layout virtual cell. The constraints specifies vertical and horizontal alignments, 
 * a virtual cell paddings, etc.
 * @param {Integer} [ax] a horizontal alignment 
 * @param {Integer} [ay] a vertical alignment
 * @param {Integer} [p]  a cell padding
 * @constructor 
 * @class zebra.layout.Constraints
 */
pkg.Constraints = Class([
    function $prototype() {
        /**
         * Top cell padding
         * @attribute top
         * @type {Integer}
         * @default 0
         */

        /**
         * Left cell padding
         * @attribute left
         * @type {Integer}
         * @default 0
         */

        /**
         * Right cell padding
         * @attribute right
         * @type {Integer}
         * @default 0
         */

        /**
         * Bottom cell padding
         * @attribute bottom
         * @type {Integer}
         * @default 0
         */

        /**
         * Horizontal alignment
         * @attribute ax
         * @type {Integer}
         * @default zebra.layout.STRETCH
         */

        /**
         * Vertical alignment
         * @attribute ay
         * @type {Integer}
         * @default zebra.layout.STRETCH
         */

        this.top = this.bottom = this.left = this.right = 0;
        this.ay = this.ax = pkg.STRETCH;
        this.rowSpan = this.colSpan = 1;

        this[''] = function(ax, ay, p) {
            if (arguments.length > 0) {
                this.ax = ax;
                if (arguments.length > 1) this.ay = ay;
                if (arguments.length > 2) this.setPadding(p);
            }
        };

        /**
         * Set all four paddings (top, left, bottom, right) to the given value 
         * @param  {Integer} p a padding
         * @method setPadding
         */

        /**
         * Set top, left, bottom, right paddings 
         * @param  {Integer} t a top padding
         * @param  {Integer} l a left padding
         * @param  {Integer} b a bottom padding
         * @param  {Integer} r a right padding
         * @method setPadding
         */
        this.setPadding = function(t,l,b,r) {
            if (arguments.length == 1) {
                this.bottom = this.left = this.right = t;
            }
            else {
                this.top    = t;
                this.bottom = b;
                this.left   = l;
                this.right  = r;
            }
        };
    }
]);

/**
 * Grid layout manager. can be used to split a component area to 
 * number of virtual cells where children components can be placed. 
 * The way how the children components have to be laid out in the cells can 
 * be customized by using "zebra.layout.Constraints" class:
 
        // create constraints
        var ctr = new zebra.layout.Constraints();
        
        // specify cell top, left, right, bottom paddings 
        ctr.setPadding(8);
        // say the component has to be left aligned in a 
        // virtual cell of grid layout 
        ctr.ax = zebra.layout.LEFT;

        // create panel and set grid layout manager with two 
        // virtual rows and columns
        var p = new zebra.ui.Panel();
        p.setLayout(new zebra.layout.GridLayout(2,2));

        // add children component
        p.add(ctr, new zebra.ui.Label("Cell 1,1"));
        p.add(ctr, new zebra.ui.Label("Cell 1,2"));
        p.add(ctr, new zebra.ui.Label("Cell 2,1"));
        p.add(ctr, new zebra.ui.Label("Cell 2,2"));

 * @param {Integer} rows a number of virtual rows to layout 
 * children components
 * @param {Integer} cols a number of virtual columns to 
 * layout children components
 * @constructor 
 * @class  zebra.layout.GridLayout
 * @extends {zebra.layout.Layout}
 */
pkg.GridLayout = Class(L, [
    function(r,c) { this.$this(r, c, 0); },

    function(r,c,m){
        /**
         * Number of virtual rows to place children components 
         * @attribute rows
         * @readOnly
         * @type {Integer}
         */
        this.rows = r;

        /**
         * Number of virtual columns to place children components 
         * @attribute cols
         * @readOnly
         * @type {Integer}
         */
        this.cols = c;
        this.mask = m;
        this.colSizes = Array(c + 1);
        this.rowSizes = Array(r + 1);
    
        /**
         * Default constraints that is applied for children components 
         * that doesn't define own constraints 
         * @type {zebra.layout.Constraints}
         * @attribute constraints
         */
        this.constraints = new pkg.Constraints();
    },

    function $prototype() {

        /**
         * Calculate columns metrics
         * @param  {zebra.layout.Layoutable} c the target container
         * @return {Array} a columns widths
         * @method calcCols
         * @protected
         */
        this.calcCols = function(c){
            this.colSizes[this.cols] = 0;
            for(var i = 0;i < this.cols; i++){
                this.colSizes[i] = this.calcCol(i, c);
                this.colSizes[this.cols] += this.colSizes[i];
            }
            return this.colSizes;
        };

        /**
         * Calculate rows metrics
         * @param  {zebra.layout.Layoutable} c the target container
         * @return {Array} a rows heights
         * @method calcRows
         * @protected
         */
        this.calcRows = function(c){
            this.rowSizes[this.rows] = 0;
            for(var i = 0;i < this.rows; i++){
                this.rowSizes[i] = this.calcRow(i, c);
                this.rowSizes[this.rows] += this.rowSizes[i];
            }
            return this.rowSizes;
        };

        /**
         * Calculate the given row height
         * @param  {Integer} row a row
         * @param  {zebra.layout.Layoutable} c the target container
         * @return {Integer} a size of the row
         * @method calcRow
         * @protected
         */
        this.calcRow = function(row, c){
            var max = 0, s = row * this.cols;
            for (var i = s; i < c.kids.length && i < s + this.cols; i++) {
                var a = c.kids[i];
                if (a.isVisible === true) {
                    var arg = a.constraints || this.constraints, d = a.getPreferredSize().height;
                    d += (arg.top + arg.bottom);
                    if (d > max) max = d;
                }
            }
            return max;
        };

        /**
         * Calculate the given column width
         * @param  {Integer} col a column
         * @param  {zebra.layout.Layoutable} c the target container
         * @return {Integer} a size of the column
         * @method calcCol
         * @protected
         */
        this.calcCol = function(col, c){
            var max = 0;

            for(var r = 0; r < this.rows; r++) {
                var i = r * this.cols + col;
                if (i >= c.kids.length) break;
               
                var a = c.kids[i];
                if (a.isVisible === true) {
                    var arg = a.constraints || this.constraints, d = a.getPreferredSize().width + arg.left + arg.right;
                    if (d > max) max = d;
                }            
            }
            return max;
        };

        this.calcPreferredSize = function(c){
            return { width : this.calcCols(c)[this.cols],
                     height: this.calcRows(c)[this.rows] };
        };

        this.doLayout = function(c){
            var rows     = this.rows, 
                cols     = this.cols,
                colSizes = this.calcCols(c),
                rowSizes = this.calcRows(c),
                top      = c.getTop(), 
                left     = c.getLeft();

            if ((this.mask & pkg.HORIZONTAL) > 0) {
                var dw = c.width - left - c.getRight() - colSizes[cols];
                for(var i = 0;i < cols; i ++ ) {
                    colSizes[i] = colSizes[i] + (colSizes[i] !== 0 ? ~~((dw * colSizes[i]) / colSizes[cols]) : 0);
                }
            }

            if ((this.mask & pkg.VERTICAL) > 0) {
                var dh = c.height - top - c.getBottom() - rowSizes[rows];
                for(var i = 0;i < rows; i++) {
                    rowSizes[i] = rowSizes[i] + (rowSizes[i] !== 0 ? ~~((dh * rowSizes[i]) / rowSizes[rows]) : 0);
                }
            }

            var cc = 0;
            for (var i = 0;i < rows && cc < c.kids.length; i++) {
                var xx = left;
                for(var j = 0;j < cols && cc < c.kids.length; j++, cc++){
                    var l = c.kids[cc];
                    if (l.isVisible === true){
                        var arg   = l.constraints || this.constraints,
                            d     = l.getPreferredSize(),
                            cellW = colSizes[j], 
                            cellH = rowSizes[i];

                        cellW -= (arg.left + arg.right);
                        cellH -= (arg.top  + arg.bottom);

                        if (pkg.STRETCH == arg.ax) d.width  = cellW;
                        if (pkg.STRETCH == arg.ay) d.height = cellH;
                        l.setSize(d.width, d.height);
                        l.setLocation(xx  + arg.left + (pkg.STRETCH == arg.ax ? 0 : pkg.xAlignment(d.width,  arg.ax, cellW)),
                                      top + arg.top  + (pkg.STRETCH == arg.ay ? 0 : pkg.yAlignment(d.height, arg.ay, cellH)));
                        xx += colSizes[j];
                    }
                }
                top += rowSizes[i];
            }
        };
    }
]);

/**
 * @for
 */


})(zebra("layout"), zebra.Class);
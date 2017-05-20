/**
 * Layout package provides number of classes, interfaces, methods and
 * variables that allows developer easily implement rules based layouting
 * of hierarchy of rectangular elements. The package has no relation
 * to any concrete UI, but it can be applied to a required UI framework
 *
 * @module layout
 * @main layout
 */

 /**
  * Find a direct children element for the given children component
  * and the specified parent component
  * @param  {zebkit.layout.Layoutable} parent  a parent component
  * @param  {zebkit.layout.Layoutable} child  a children component
  * @return {zebkit.layout.Layoutable}  a direct children component
  * @method getDirectChild
  * @for zebkit.layout
  */
export function getDirectChild(parent, child) {
    for(; child !== null && child.parent !== parent; child = child.parent) {}
    return child;
};

/**
 * Layout manager interface
 * @class zebkit.layout.Layout
 * @interface
 */

/**
 * Calculate preferred size of the given component
 * @param {zebkit.layout.Layoutable} t a target layoutable component
 * @method calcPreferredSize
 */

/**
 * Layout children components of the specified layoutable target component
 * @param {zebkit.layout.Layoutable} t a target layoutable component
 * @method doLayout
 */

/**
 * Find a direct component located at the given location of the specified
 * parent component and the specified parent component
 * @param  {Integer} x a x coordinate relatively to the parent component
 * @param  {Integer} y a y coordinate relatively to the parent component
 * @param  {zebkit.layout.Layoutable} parent  a parent component
 * @return {zebkit.layout.Layoutable} an index of direct children component
 * or -1 if no a children component can be found
 * @method getDirectAt
 * @api zebkit.layout.getDirectAt()
 */
export function getDirectAt(x,y,p){
    for(var i = 0;i < p.kids.length; i++){
        var c = p.kids[i];
        if (c.isVisible === true && c.x <= x && c.y <= y && c.x + c.width > x && c.y + c.height > y) {
            return i;
        }
    }
    return -1;
};

/**
 * Get a top (the highest in component hierarchy) parent component
 * of the given component
 * @param  {zebkit.layout.Layoutable} c a component
 * @return {zebkit.layout.Layoutable}  a top parent component
 * @method getTopParent
 * @api zebkit.layout.getTopParent()
 */
export function getTopParent(c){
    for(; c != null && c.parent !== null; c = c.parent);
    return c;
};

/**
 * Translate the given relative location into the parent relative location.
 * @param  {Integer} [x] a x coordinate relatively  to the given component
 * @param  {Integer} [y] a y coordinate relatively  to the given component
 * @param  {zebkit.layout.Layoutable} c a component
 * @param  {zebkit.layout.Layoutable} [p] a parent component
 * @return {Object} a relative to the given parent UI component location:

        { x:{Integer}, y:{Integer} }

 * @method toParentOrigin
 * @api zebkit.layout.toParentOrigin()
 */
export function toParentOrigin(x,y,c,p){
    if (arguments.length === 1) {
        c = x;
        x = y = 0;
        p = null;
    } else {
        if (arguments.length < 4) p = null;
    }

    while (c !== p) {
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
 * @param  {zebkit.layout.Layoutable} p a component
 * @param  {zebkit.layout.Layoutable} c a children successor component
 * @return {Object} a relative location
 *
 *      { x:{Integer}, y:{Integer} }
 *
 * @method toChildOrigin
 * @api zebkit.layout.toChildOrigin()
 */
export function toChildOrigin(x, y, p, c){
    while(c !== p){
        x -= c.x;
        y -= c.y;
        c = c.parent;
    }
    return { x:x, y:y };
};

/**
 * Calculate maximal preferred width and height of
 * children component of the given target component.
 * @param  {zebkit.layout.Layoutable} target a target component
 * @return {Object} a maximal preferred width and height

        { width:{Integer}, height:{Integer} }

 * @method getMaxPreferredSize
 * @api zebkit.layout.getMaxPreferredSize()
 */
export function getMaxPreferredSize(target) {
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

export function isAncestorOf(p, c){
    for(; c !== null && c !== p; c = c.parent);
    return c != null;
};










/**
 * @for
 */

})(zebkit("layout"), zebkit.Class);
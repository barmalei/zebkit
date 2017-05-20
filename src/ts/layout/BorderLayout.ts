import Layout from '.';

/**
 *  Layout manager implementation that logically splits component area into five areas: top, bottom, left, right and center.
 *  Top and bottom components are stretched to fill all available space horizontally and are sized to have preferred height horizontally.
 *  Left and right components are stretched to fill all available space vertically and are sized to have preferred width vertically.
 *  Center component is stretched to occupy all available space taking in account top, left, right and bottom components.

       // create panel with border layout
       var p = new zebkit.ui.Panel(new zebkit.layout.BorderLayout());

       // add children UI components with top, center and left constraints
       p.add("top",    new zebkit.ui.Label("Top"));
       p.add("center", new zebkit.ui.Label("Center"));
       p.add("left",   new zebkit.ui.Label("Left"));

 * Construct the layout with the given vertical and horizontal gaps.
 * @param  {Integer} [hgap] horizontal gap. The gap is a horizontal distance between laid out components
 * @param  {Integer} [vgap] vertical gap. The gap is a vertical distance between laid out components
 * @constructor
 * @class zebkit.layout.BorderLayout
 * @extends {zebkit.layout.Layout}
 */
class BorderLayout extends Layout {

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
    constructor(hgap = 0,vgap = 0) {      
        this.hgap = hgap;
        this.vgap = vgap;
    }

    calcPreferredSize(target){
        var center = null, left = null,  right = null, top = null, bottom = null, topRight = null, d = null;
        for(var i = 0; i < target.kids.length; i++){
            var l = target.kids[i];
            if (l.isVisible === true){
                switch(l.constraints) {
                    case null:
                    case undefined:
                    case "center"    : center = l; break;
                    case "top"       : top    = l; break;
                    case "bottom"    : bottom = l; break;
                    case "left"      : left   = l; break;
                    case "right"     : right  = l; break;
                    default: throw new Error("Invalid constraints: " + l.constraints);
                }
            }
        }

        var dim = { width:0, height:0 };
        if (right !== null) {
            d = right.getPreferredSize();
            dim.width  = d.width + this.hgap;
            dim.height = (d.height > dim.height ? d.height: dim.height );
        }

        if (left !== null) {
            d = left.getPreferredSize();
            dim.width += d.width + this.hgap;
            dim.height = d.height > dim.height ? d.height : dim.height;
        }

        if (center != null) {
            d = center.getPreferredSize();
            dim.width += d.width;
            dim.height = d.height > dim.height ? d.height : dim.height;
        }

        if (top != null) {
            d = top.getPreferredSize();
            dim.width = d.width > dim.width ? d.width : dim.width;
            dim.height += d.height + this.vgap;
        }

        if (bottom != null) {
            d = bottom.getPreferredSize();
            dim.width = d.width > dim.width ? d.width : dim.width;
            dim.height += d.height + this.vgap;
        }
        return dim;
    }

    doLayout(target){
        var t      = target.getTop(),
            b      = target.height - target.getBottom(),
            l      = target.getLeft(),
            r      = target.width - target.getRight(),
            center = null,
            left   = null,
            top    = null,
            bottom = null,
            right  = null;

        for(var i = 0;i < target.kids.length; i++){
            var kid = target.kids[i];
            if (kid.isVisible === true) {
                switch(kid.constraints) {
                    case null:
                    case undefined:
                    case "center":
                        if (center != null) {
                            throw new Error("Component with center constraints is already defined");
                        }
                        center = kid;
                        break;
                    case "top" :
                        if (top != null) {
                            throw new Error("Component with top constraints is already defined");
                        }
                        var ps = kid.getPreferredSize();
                        kid.setBounds(l, t, r - l, ps.height);
                        t += ps.height + this.vgap;
                        top = kid;
                        break;
                    case "bottom":
                        if (bottom != null) {
                            throw new Error("Component with bottom constraints is already defined");
                        }
                        var ps = kid.getPreferredSize();
                        kid.setBounds(l, b - ps.height, r - l, ps.height);
                        b -= ps.height + this.vgap;
                        bottom = kid;
                        break;
                    case "left":
                        if (left != null) {
                            throw new Error("Component with left constraints is already defined");
                        }
                        left = kid;
                        break;
                    case "right":
                        if (right != null) {
                            throw new Error("Component with right constraints is already defined");
                        }
                        right = kid;
                        break;
                    default: throw new Error("Invalid constraints: " + kid.constraints);
                }
            }
        }

        if (right != null){
            var d = right.getPreferredSize();
            right.setBounds(r - d.width, t, d.width, b - t);
            r -= d.width + this.hgap;
        }

        if (left != null){
            var d = left.getPreferredSize();
            left.setBounds(l, t, d.width, b - t);
            l += d.width + this.hgap;
        }

        if (center != null){
            center.setBounds(l, t, r - l, b - t);
        }
    }
}


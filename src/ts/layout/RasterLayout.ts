import Layout from '.';
/**
 * Rester layout manager can be used to use absolute position of
 * layoutable components. That means all components will be laid
 * out according coordinates and size they have. Raster layout manager
 * provides extra possibilities to control children components placing.
 * It is possible to align components by specifying layout constraints,
 * size component to its preferred size and so on.
 * @param {Boolean} [usePsSize] flag to add extra rule to set
 * components size to its preferred sizes.
 * @class  zebkit.layout.RasterLayout
 * @constructor
 * @extends {zebkit.layout.Layout}
 */
class RasterLayout extends Layout {
    constructor(ups = false) {
        this.usePsSize = ups;
    }

    calcPreferredSize(c){
        var m = { width:0, height:0 };

        for(var i = 0;i < c.kids.length; i++ ){
            var kid = c.kids[i];
            if (kid.isVisible === true) {
                var ps = this.usePsSize ? kid.getPreferredSize()
                                        : { width:kid.width, height:kid.height },
                    px = kid.x + ps.width,
                    py = kid.y + ps.height;

                if (px > m.width)  m.width  = px;
                if (py > m.height) m.height = py;
            }
        }
        return m;
    };

    doLayout(c) {
        var r = c.getRight(),
            b = c.getBottom(),
            t = c.getTop(),
            l = c.getLeft();

        for(var i = 0;i < c.kids.length; i++){
            var kid = c.kids[i], ww = 0, hh = 0;

            if (kid.isVisible === true){
                if (this.usePsSize) {
                    var ps = kid.toPreferredSize();
                    ww = ps.width;
                    hh = ps.height;
                } else {
                    ww = kid.width;
                    hh = kid.height;
                }

                var ctr = kid.constraints == null ? null : kid.constraints;
                if (ctr != null) {
                    var x = kid.x, y = kid.y, size = null;

                    if (ctr === "top" || ctr === "topRight" || ctr === "topLeft") {
                        y = t;
                    } else if (ctr === "bottom" || ctr === "bottomLeft" || ctr === "bottomRight") {
                        y = c.height - hh - b;
                    } else if (ctr === "center" || ctr === "left" || ctr === "right") {
                        y = Math.floor((c.height - hh) / 2);
                    }

                    if (ctr === "left" || ctr === "topLeft" || ctr === "bottomLeft") {
                        x = l;
                    } else if (ctr === "right" || ctr === "topRight" || ctr === "bottomRight") {
                        x = c.width - ww - r;
                    } else if (ctr === "center" || ctr === "top" || ctr === "bottom") {
                        x = Math.floor((c.width  - ww) / 2);
                    }

                    kid.setLocation(x, y);
                }
            }
        }
    }
}

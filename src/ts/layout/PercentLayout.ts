/**
 * Percent layout places components vertically or horizontally and
 * sizes its according to its percentage constraints.

        // create panel and set percent layout for it
        var p = new zebkit.ui.Panel();
        p.setLayout(new zebkit.layout.PercentLayout());

        // add three buttons to the panel that are laid out horizontally with
        // percent layout according to its constraints: 20, 30 and 50 percents
        p.add(20, new zebkit.ui.Button("20%"));
        p.add(30, new zebkit.ui.Button("30%"));
        p.add(50, new zebkit.ui.Button("50%"));

 * @param {String} [dir] a direction of placing components. The
 * value can be "horizontal" or "vertical"
 * @param {Integer} [gap] a space in pixels between laid out components
 * @param {Boolean} [stretch] true if the component should be stretched
 * vertically or horizontally
 * @class  zebkit.layout.PercentLayout
 * @constructor
 * @extends {zebkit.layout.Layout}
 */
class PercentLayout extends Layout {
    constructor(dir, gap, stretch) {
         /**
          * Direction the components have to be placed (vertically or horizontally)
          * @attribute direction
          * @readOnly
          * @type {String}
          * @default "horizontal"
          */
        this.direction = "horizontal";

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
         * to be stretched vertically (if direction is set to "vertical")
         * or horizontally (if direction is set to "horizontal")
         * @attribute stretch
         * @readOnly
         * @type {Integer}
         * @default true
         */
        this.stretch = true;

        if (arguments.length > 0) {
            this.direction = zebkit.util.$validateValue(dir, "horizontal", "vertical");
            if (arguments.length > 1) this.gap = gap;
            if (arguments.length > 2) this.stretch = stretch;
        }
    }

    doLayout(target){
        var right  = target.getRight(),
            top    = target.getTop(),
            bottom = target.getBottom(),
            left   = target.getLeft(),
            size   = target.kids.length,
            rs     = -this.gap * (size === 0 ? 0 : size - 1),
            loc    = 0,
            ns     = 0;

        if (this.direction === "horizontal"){
            rs += target.width - left - right;
            loc = left;
        }
        else{
            rs += target.height - top - bottom;
            loc = top;
        }

        for(var i = 0; i < size; i ++ ){
            var l = target.kids[i], c = l.constraints, useps = (c === "usePsSize");
            if (this.direction === "horizontal"){
                ns = ((size - 1) === i) ? target.width - right - loc
                                        : (useps ? l.getPreferredSize().width
                                                  : ~~((rs * c) / 100));
                var yy = top, hh = target.height - top - bottom;
                if (this.stretch === false) {
                    var ph = hh;
                    hh = l.getPreferredSize().height;
                    yy = top + Math.floor((ph - hh) / 2);
                }

                l.setBounds(loc, yy, ns, hh);
            }
            else {
                ns = ((size - 1) === i) ? target.height - bottom - loc
                                        : (useps ? l.getPreferredSize().height
                                                  : Math.floor((rs * c) / 100));
                var xx = left, ww = target.width - left - right;
                if (this.stretch === false) {
                    var pw = ww;
                    ww = l.getPreferredSize().width;
                    xx = left + Math.floor((pw - ww) / 2);
                }

                l.setBounds(xx, loc, ww, ns);
            }
            loc += (ns + this.gap);
        }
    }

    calcPreferredSize(target){
        var max  = 0,
            size = target.kids.length,
            as   = this.gap * (size === 0 ? 0 : size - 1);

        for(var i = 0; i < size; i++){
            var d = target.kids[i].getPreferredSize();
            if (this.direction === "horizontal"){
                if (d.height > max) max = d.height;
                as += d.width;
            }
            else {
                if (d.width > max) max = d.width;
                as += d.height;
            }
        }
        return (this.direction === "horizontal") ? { width:as, height:max }
                                                  : { width:max, height:as };
    }
}

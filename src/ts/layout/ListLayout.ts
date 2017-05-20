/**
 * List layout places components vertically one by one

        // create panel and set list layout for it
        var p = new zebkit.ui.Panel();
        p.setLayout(new zebkit.layout.ListLayout());

        // add three buttons into the panel with list layout
        p.add(new zebkit.ui.Button("Item 1"));
        p.add(new zebkit.ui.Button("Item 2"));
        p.add(new zebkit.ui.Button("Item 3"));

 * @param {String} [ax] horizontal list item alignment:

     "left"
     "right"
     "center"
     "stretch"

 * @param {Integer} [gap] a space in pixels between laid out components
 * @class  zebkit.layout.ListLayout
 * @constructor
 * @extends {zebkit.layout.Layout}
 */
class ListLayout extends Layout {
    constructor(ax, gap) {
        /**
         * Horizontal list items alignment
         * @attribute ax
         * @type {String}
         * @readOnly
         */
        this.ax = "stretch";

        /**
         * Pixel gap between list items
         * @attribute gap
         * @type {Integer}
         * @readOnly
         */
        this.gap = 0;

        if (arguments.length === 1) {
            this.gap = ax;
        } else if (arguments.length > 1) {
            this.ax  = zebkit.util.$validateValue(ax, "stretch", "left", "right", "center");
            this.gap = gap;
        }
    }

    calcPreferredSize(lw){
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
    }

    doLayout(lw){
        var x   = lw.getLeft(),
            y   = lw.getTop(),
            psw = lw.width - x - lw.getRight();

        for(var i = 0;i < lw.kids.length; i++){
            var cc = lw.kids[i];

            if (cc.isVisible === true){
                var d      = cc.getPreferredSize(),
                    constr = cc.constraints == null ? this.ax
                                                    : cc.constraints;

                cc.setSize    ((constr === "stretch") ? psw
                                                        : d.width, d.height);
                cc.setLocation((constr === "stretch") ? x
                                                        : x + ((constr === "right") ? psw - cc.width
                                                                                    : ((constr === "center") ? Math.floor((psw - cc.width) / 2)
                                                                                                              : 0)), y);
                y += (d.height + this.gap);
            }
        }
    };
}

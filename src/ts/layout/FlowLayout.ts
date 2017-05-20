import Layout from '.';
/**
 * Flow layout manager group and places components aligned with
 * different vertical and horizontal alignments

        // create panel and set flow layout for it
        // components added to the panel will be placed
        // horizontally aligned at the center of the panel
        var p = new zebkit.ui.Panel();
        p.setLayout(new zebkit.layout.FlowLayout("center", "center"));

        // add three buttons into the panel with flow layout
        p.add(new zebkit.ui.Button("Button 1"));
        p.add(new zebkit.ui.Button("Button 2"));
        p.add(new zebkit.ui.Button("Button 3"));

 * @param {String} [ax] ("left" by default) horizontal alignment:

     "left"
     "center"
     "right"

 * @param {String} [ay] ("top" by default) vertical alignment:

     "top"
     "center"
     "bottom"

 * @param {String} [dir] ("horizontal" by default) a direction
 * the component has to be placed in the layout

     "vertical"
     "horizontal"

 * @param {Integer} [gap] a space in pixels between laid out components
 * @class  zebkit.layout.FlowLayout
 * @constructor
 * @extends {zebkit.layout.Layout}
 */
class FlowLayout extends Layout {
    constructor(ax, ay, dir, g) {
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
         * @type {String}
         * @default "left"
         */
        this.ax = "left";

        /**
         * Vertical laid out components alignment
         * @attribute ay
         * @readOnly
         * @type {String}
         * @default "center"
         */
        this.ay = "center";

        /**
         * Laid out components direction
         * @attribute direction
         * @readOnly
         * @type {String}
         * @default "horizontal"
         */
        this.direction = "horizontal";

        this.stretchLast = false;
        
        if (arguments.length === 1) this.gap = ax;
        else {
            if (arguments.length > 1) {
                this.ax = ax;
                this.ay = ay;
            }

            if (arguments.length > 2)  {
                this.direction = zebkit.util.$validateValue(dir, "horizontal", "vertical");
            }

            if (arguments.length > 3) this.gap = g;
        }
    }

    calcPreferredSize(c){
        var m = { width:0, height:0 }, cc = 0;
        for(var i = 0;i < c.kids.length; i++){
            var a = c.kids[i];
            if (a.isVisible === true){
                var d = a.getPreferredSize();
                if (this.direction === "horizontal"){
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
        if (this.direction === "horizontal") m.width += add;
        else m.height += add;
        return m;
    }

    doLayout(c){
        var psSize  = this.calcPreferredSize(c),
            t       = c.getTop(),
            l       = c.getLeft(),
            lastOne = null,
            ew      = c.width  - l - c.getRight(),
            eh      = c.height - t - c.getBottom(),
            px      = ((this.ax === "right") ? ew - psSize.width
                                              : ((this.ax === "center") ? Math.floor((ew - psSize.width) / 2) : 0)) + l,
            py      = ((this.ay === "bottom") ? eh - psSize.height
                                              : ((this.ay === "center") ? Math.floor((eh - psSize.height) / 2): 0)) + t;

        for(var i = 0;i < c.kids.length; i++){
            var a = c.kids[i];
            if (a.isVisible === true) {

                var d = a.getPreferredSize(),
                    ctr = a.constraints == null ? null : a.constraints;

                if (this.direction === "horizontal") {
                    ctr = ctr || this.ay;

                    if (ctr === "stretch") {
                        d.height = c.height - t - c.getBottom();
                    }

                    a.setLocation(px, ctr === "stretch" ? t :
                                      (ctr === "top"    ? py :
                                      (ctr === "bottom" ? Math.floor(psSize.height - d.height) + py :
                                                          Math.floor((psSize.height - d.height) / 2) + py)));
                    px += (d.width + this.gap);
                }
                else {
                    ctr = ctr || this.ax;

                    if (ctr === "stretch") {
                        d.width = c.width - l - c.getRight();
                    }

                    a.setLocation(ctr === "stretch"  ? l  :
                                  (ctr === "left"    ? px :
                                  (ctr === "right"   ? px + Math.floor(psSize.width - d.width) :
                                                        px + Math.floor((psSize.width - d.width) / 2))), py);

                    py += d.height + this.gap;
                }

                a.setSize(d.width, d.height);
                lastOne = a;
            }
        }

        if (lastOne !== null && this.stretchLast === true){
            if (this.direction === "horizontal") {
                lastOne.setSize(c.width - lastOne.x - c.getRight(), lastOne.height);
            }
            else {
                lastOne.setSize(lastOne.width, c.height - lastOne.y - c.getBottom());
            }
        }
    }
}

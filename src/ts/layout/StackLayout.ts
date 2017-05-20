import Layout from '.';

/**
 *  Layout manager implementation that places layoutbale components
 *  on top of each other stretching its to fill all available parent
 *  component space
 *  @class zebkit.layout.StackLayout
 *  @constructor
 */
class StackLayout extends Layout {
    constructor() {
      super();
    }

    calcPreferredSize(target){
        return pkg.getMaxPreferredSize(target);
    }

    doLayout(t){
        var top  = t.getTop(),
            hh   = t.height - t.getBottom() - top,
            left = t.getLeft(),
            ww   = t.width - t.getRight() - left;

        for(var i = 0;i < t.kids.length; i++){
            var l = t.kids[i];
            if (l.isVisible === true) {
                var ctr = l.constraints == null ? null : l.constraints;

                if (ctr === "usePsSize") {
                    var ps = l.getPreferredSize();
                    l.setBounds(left + Math.floor((ww - ps.width )/2),
                                top  + Math.floor((hh - ps.height)/2),
                                ps.width, ps.height);
                } else {
                    l.setBounds(left, top, ww, hh);
                }
            }
        }
    }
}

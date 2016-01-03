zebkit.package("ui.demo", function(pkg, Class) {
    var Panel     = zebkit.ui.Panel,
        Label     = zebkit.ui.Label,
        Border    = zebkit.ui.Border,
        BorderPan = zebkit.ui.BorderPan;

    pkg.createLabel = function (txt, color, font) {
        color = color || zebkit.ui.palette.gray1;
        var l = new Label(txt.indexOf("\n") >= 0 ? new zebkit.data.Text(txt) : txt);
        l.setColor(color);
        if (font) l.setFont(font);
        else l.setFont(zebkit.ui.boldFont);
        l.setBorder(new Border(zebkit.util.rgb.gray));
        l.setPadding(4);
        return l;
    };

    pkg.createBorderPan = function (txt, content, w, h) {
        content = content || new Panel();
        var bp = new BorderPan(txt, content);
        content.setPadding(4);
        w = w || -1;
        h = h || -1;
        bp.setPreferredSize(w, h);
        return bp;
    };

    pkg.DemoPan = Class(Panel, [
        function() {
            this.$super();
            this.setPadding(6);
        },

        function activated(b) {}
    ]);

    new zebkit.ui.Bag(zebkit.ui).load(pkg.$url.join("demo.json"));
});
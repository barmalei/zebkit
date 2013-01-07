(function(pkg, Class) {

var Panel = zebra.ui.Panel;
var Label = zebra.ui.Label;
var Border = zebra.ui.Border;
var BorderPan = zebra.ui.BorderPan;
var L = zebra.layout;

pkg.createLabel = function (txt, color) {
    color = color || zebra.ui.palette.gray1;
    var l = new Label(txt.indexOf("\n") >= 0 ? new zebra.data.Text(txt) : txt);
    l.setColor(color);
    l.setFont(zebra.ui.boldFont);
    l.setBorder(new Border(zebra.util.rgb.gray));
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

zebra.ui.configure(function(conf) {
    conf.loadByUrl("demo.json", pkg);
});

})(zebra("ui.demo"), zebra.Class);
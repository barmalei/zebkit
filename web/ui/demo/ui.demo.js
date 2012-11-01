(function(pkg, Class) {

var Panel = zebra.ui.Panel;
var Label = zebra.ui.Label;
var Border = zebra.ui.view.Border;
var BorderPan = zebra.ui.BorderPan;
var L = zebra.layout;

pkg.createLabel = function (txt, color) {
    color = color || zebra.ui.palette.gray1;
    var l = new Label(txt.indexOf("\n") >= 0 ? new zebra.data.Text(txt) : txt);
    l.setForeground(color);
    l.setFont(zebra.ui.boldFont);
    l.setBorder(new Border(1, zebra.util.rgb.gray));
    l.padding(4);
    return l;
};

pkg.createBorderPan = function (txt, content, w, h) {
    content = content || new Panel();
    var bp = new BorderPan(txt, content);
    content.padding(4);
    w = w || -1;
    h = h || -1;
    bp.setPreferredSize(w, h);
    return bp;
};

pkg.createLabedComponent = function(title, comp) {
    var content = new Panel(new L.BorderLayout());
    content.setBackground(null);
    var lab = new Label(title);
    lab.setFont(zebra.ui.boldFont);
    content.add(L.LEFT, lab)
    content.add(L.RIGHT, comp);
    return content;
};

pkg.DemoPan = Class(Panel, [
    function() {
        this.$super();
        this.padding(6);
    },

    function activated(b) {}
]);

zebra.ui.configurator(function(conf) {
    conf.loadByUrl("demo.json", pkg);
});

})(zebra("ui.demo"), zebra.Class);
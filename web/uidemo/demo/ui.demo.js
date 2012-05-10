
(function(pkg, Class) {

var Panel = zebra.ui.Panel; 
var Label = zebra.ui.Label; 
var SimpleBorder = zebra.ui.view.SimpleBorder; 
var BorderPan = zebra.ui.BorderPan; 
var L = zebra.layout; 

pkg.createLabel = function (txt, color) {
    color = color || zebra.ui.get("demo.createLabel.col") || zebra.ui.get("col.gray7");
    var l = new Label(txt.indexOf("\n") >= 0 ? new zebra.data.Text(txt) : txt);
    l.setForeground(color);
    l.setFont(JAVA.awt.Font.defaultBold);
    l.setBorder(new SimpleBorder(1, zebra.util.Color.gray));
    l.padding(4);
    return l;
}

pkg.createBorderPan = function (txt, content, w, h) {
    content = content || new Panel();
    var bp = new BorderPan(txt, content);
    content.padding(4);
    w = w || -1; 
    h = h || -1; 
    bp.setPSSize(w, h);
    return bp;
}

pkg.createLabedComponent = function(title, comp) {
    var content = new Panel(new L.BorderLayout());
    content.setBackground(null);
    var lab = new Label(title);
    lab.setFont(JAVA.awt.Font.defaultBold);
    content.add(L.LEFT, lab)
    content.add(L.RIGHT, comp);
    return content;
}

pkg.DemoPan = new Class(Panel, function($) {
    $(function() { 
        this.$super(); 
        this.padding(6);
    });    
    
    $(function activated(b) {});    
});

})(zebra("ui.demo"), zebra.Class);
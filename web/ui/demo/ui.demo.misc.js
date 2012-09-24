
(function(pkg, Class) {

var Panel = zebra.ui.Panel; 
var rgb = zebra.util.rgb;
var Label = zebra.ui.Label; 
var TextField = zebra.ui.TextField; 
var GridLayout = zebra.layout.GridLayout; 
var BorderPan = zebra.ui.BorderPan; 
var Fill = zebra.ui.view.Fill; 
var ScrollPan = zebra.ui.ScrollPan; 
var Border = zebra.ui.view.Border; 
var Border = zebra.ui.view.Border; 
var Tree = zebra.ui.tree.Tree;
var Constraints = zebra.layout.Constraints;

pkg.MiscDemo = new Class(pkg.DemoPan, function($) {
    $(function() {
        this.$super();
        this.setLayout(new GridLayout(1, 3));
		this.padding(8);
    });    
    
    function createExtenderpan() {
        var p = new Panel();
    
        var extPan = new Panel(new zebra.layout.ListLayout());
        var ext1Content = new Panel();
        ext1Content.setPreferredSize(-1, 80);
        ext1Content.setBackground(Fill.darkGray);
        ext1Content.setBorder(new Border(1));
        var ext2Content = new Panel();
        ext2Content.setPreferredSize(-1, 80);
        ext2Content.setBorder(new Border(1));
        ext2Content.setBackground(Fill.gray);
        var ext3Content = new Panel();
        ext3Content.setPreferredSize(-1, 80);
        ext3Content.setBorder(new Border(1));
        ext3Content.setBackground(Fill.lightGray);
        
        var ext1 = new zebra.ui.Extender(ext1Content, "Panel 1");
        var ext2 = new zebra.ui.Extender(ext2Content, "Panel 2");
        var ext3 = new zebra.ui.Extender(ext3Content, "Panel 3");
        extPan.add(ext1);
        extPan.add(ext2);
        extPan.add(ext3);
        p.add(extPan);
        
        return p
    }
});

})(zebra.ui.demo, zebra.Class);
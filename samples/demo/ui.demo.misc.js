
zebkit.package("zebkit.ui", function(pkg, Class) {

    var Panel = zebkit.ui.Panel;
    var rgb = zebkit.util.rgb;
    var Label = zebkit.ui.Label;
    var TextField = zebkit.ui.TextField;
    var GridLayout = zebkit.layout.GridLayout;
    var BorderPan = zebkit.ui.BorderPan;
    var ScrollPan = zebkit.ui.ScrollPan;
    var Border = zebkit.ui.Border;
    var Tree = zebkit.ui.tree.Tree;
    var Constraints = zebkit.layout.Constraints;

    pkg.MiscDemo = new Class(pkg.DemoPan,[
        function() {
            this.$super();
            this.setLayout(new GridLayout(1, 3));
    		this.setPadding(8);
        },

        function createExtenderpan() {
            var p = new Panel();

            var extPan = new Panel(new zebkit.layout.ListLayout());
            var ext1Content = new Panel();
            ext1Content.setPreferredSize(-1, 80);
            ext1Content.setBackground(rgb.darkGray);
            ext1Content.setBorder(new Border());
            var ext2Content = new Panel();
            ext2Content.setPreferredSize(-1, 80);
            ext2Content.setBorder(new Border());
            ext2Content.setBackground(rgb.gray);
            var ext3Content = new Panel();
            ext3Content.setPreferredSize(-1, 80);
            ext3Content.setBorder(new Border());
            ext3Content.setBackground(rgb.lightGray);

            var ext1 = new zebkit.ui.ExtendablePan(ext1Content, "Panel 1");
            var ext2 = new zebkit.ui.ExtendablePan(ext2Content, "Panel 2");
            var ext3 = new zebkit.ui.ExtendablePan(ext3Content, "Panel 3");
            extPan.add(ext1);
            extPan.add(ext2);
            extPan.add(ext3);
            p.add(extPan);

            return p
        }
    ]);

})
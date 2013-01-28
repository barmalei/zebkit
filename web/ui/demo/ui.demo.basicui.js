
(function(pkg, Class, ui) {

var Panel = zebra.ui.Panel,
    BorderPan = zebra.ui.BorderPan,
    Label = zebra.ui.Label,
    BoldLabel = zebra.ui.BoldLabel,
    Button = zebra.ui.Button,
    FlowLayout = zebra.layout.FlowLayout,
    GridLayout = zebra.layout.GridLayout,
    ListLayout = zebra.layout.ListLayout,
    Gradient = zebra.ui.Gradient,
    L = zebra.layout,
    PercentLayout = zebra.layout.PercentLayout,
    Tabs = zebra.ui.Tabs,
    Checkbox = zebra.ui.Checkbox,
    Radiobox = zebra.ui.Radiobox,
    ImagePan = zebra.ui.ImagePan,
    Link = zebra.ui.Link,
    rgb = zebra.util.rgb,
    List = zebra.ui.List,
    CompList = zebra.ui.CompList,
    Slider = zebra.ui.Slider,
    Progress = zebra.ui.Progress,
    TextField = zebra.ui.TextField,
    Constraints = zebra.layout.Constraints;

pkg.BasicUIDemo = new Class(pkg.DemoPan, [
    function() {
        this.$super();
        this.setLayout(new FlowLayout(L.CENTER, L.CENTER));
        var r = new Panel(new L.BorderLayout(8,4));

        var p = new Panel(new GridLayout(3, 2)), ctr = new Constraints();
        ctr.left = ctr.right = ctr.bottom = ctr.top = 6;
        ctr.ax = L.STRETCH 
        ctr.ay = L.STRETCH;
        p.add(ctr, this.createCheckboxPan(3, true));
        p.add(ctr, this.createCheckboxPan(3, false));
        p.add(ctr, this.createTextFieldPan());
        p.add(ctr, this.createMTextFieldPan());
        p.add(ctr, this.createProgressPan());
        p.add(ctr, this.createSliderPan());

        var p_c = new Panel(new L.BorderLayout(4, 4));
        p_c.add(L.CENTER, p);
        p_c.add(L.BOTTOM, this.createButtonPan());

        var p_w = new Panel(new ListLayout(8));
        p_w.add(this.createComboPan());
        p_w.add(this.createListPan());

        r.add(L.LEFT, p_w);
        r.add(L.CENTER, p_c);

        this.add(r);
    },

    function createTextFieldPan() {
        var p = new Panel(new GridLayout(3, 2));
        var tf = new TextField();
        var ctr = new L.Constraints();
        ctr.ay = L.CENTER
        ctr.setPadding(2);

        tf.setPreferredSize(100, -1);
        tf.setHint("<enter text>");
        
        p.add(ctr, new BoldLabel("Text field:"));
        p.add(ctr, tf);

        tf = new TextField(new zebra.data.SingleLineTxt("dsd", 5));
        tf.setPreferredSize(100, -1);
        p.add(ctr, new BoldLabel("Fixed size(5):"));
        p.add(ctr, tf);

        tf = new TextField(new zebra.ui.PasswordText());
        tf.setPreferredSize(100, -1);
        p.add(ctr, new BoldLabel("Password field:"));
        p.add(ctr, tf);

        return pkg.createBorderPan("Text fields", p);
    },

    function createMTextFieldPan() {
        var p = new Panel(new L.BorderLayout());
        p.setBackground(null);
        var tf = new TextField(new zebra.data.Text("Multiline\ntext field\ncomponents"));
        tf.setPreferredSize(150, 70);
        p.add(L.CENTER, tf);
        return pkg.createBorderPan("Multilines text field", p);
    },

    function createSliderPan() {
        var p = new Panel(new L.BorderLayout());
        p.setBackground(null);
        var sl = new Slider();
        sl.setPreferredSize(90, -1);
        p.add(L.CENTER, sl);
        return pkg.createBorderPan("Slider", p);
    },

    function createProgressPan() {
        var p = new Panel(new FlowLayout(L.CENTER, L.CENTER, L.VERTICAL, 16));
        p.setBackground(null);
        var pr1 = new Progress();
        pr1.setPreferredSize(130, -1);
        pr1.setMaxValue(10);
        pr1.setValue(3);
        var pr2 = new Progress();
        pr2.setMaxValue(4);
        pr2.setValue(1);
        pr2.setBundleView(new Gradient(rgb.lightGray, rgb.darkGray, L.HORIZONTAL));
        pr2.setPreferredSize(130, 12);
        pr2.setBundleSize(70, pr2.bundleHeight);
        p.add(pr1);
        p.add(pr2);
        return pkg.createBorderPan("Progress", p);
    },

    function createButtonPan() {
        var p = new Panel(new FlowLayout(L.CENTER, L.CENTER, L.HORIZONTAL, 8));
        p.setBackground(null);
        p.add(new Button("Button"));
        var bt = new Button(new ImagePan(ui.get("butterfly")));
        bt.setFocusMarkerView(null);
        p.add(bt);
        p.add(new Button(new zebra.ui.ImageLabel("Image button", ui.get("butterfly"))));
        bt = new Button("Disabled button");
        bt.setEnabled(false);
        p.add(bt);
        p.add(new Link("Link"));
        return pkg.createBorderPan("Buttons", p);
    },

    function createListPan() {
        var p = new Panel(new ListLayout(8));
        p.setBackground(null);
        var m = new zebra.data.ListModel();
        m.add("Item 1");
        m.add("Item 2");
        m.add("Item 3");
        var l = new zebra.ui.List();
        l.setModel(m);
        l.select(0);
        var lbp = new BorderPan("Simple list", l);
        lbp.setGaps(6,6);
        p.add(lbp);
        var l = new zebra.ui.CompList();
        l.add("Label Item");
        l.add(new Checkbox("Checkbox Item"));
        l.add(new zebra.ui.CompList.ImageLabel("Image Label Item", ui.get("butterfly")));
        var lbp = new BorderPan("Components list", l);
        lbp.setGaps(6,6);
        p.add(lbp);
        l.select(0);

        var bp = pkg.createBorderPan("List", p)
        bp.setGaps(4,4);
        return bp;
    },

    function createCheckboxPan(n, t) {
        var p = new Panel(new FlowLayout(L.CENTER, L.CENTER, L.VERTICAL, 4));
        var s = t ? "Radio button " : "Checkbox button ", g = t ? new zebra.ui.Group() : null;
        p.setBackground(null);

        for(var i=0; i < n;  i++) {
            var ch = t ? new Radiobox(s + (i+1)) : new Checkbox(s + (i+1));
            p.add(ch);
            if (g != null) ch.setSwitchManager(g);
        }
        return pkg.createBorderPan(s, p);
    },

    function createComboPan() {
        var p = new Panel(new ListLayout(8));
        p.setBackground(null);
        var cb = new zebra.ui.Combo();
        cb.list.model.add("Item 1");
        cb.list.model.add("Item 2");
        cb.list.model.add("Item 3");
        cb.list.select(0);
        p.add(cb);

        var cb2 = new zebra.ui.Combo(true);
        cb2.list.model.add("Item 1");
        cb2.list.model.add("Item 2");
        cb2.list.model.add("Item 3");
        var ps= cb2.getPreferredSize();
        cb2.setPreferredSize(ps.width, -1);
        p.add(cb2);

        var l = new CompList(true);
        l.add(new zebra.ui.CompList.ImageLabel("Item 1", ui.get("ind1")));
        l.add(new zebra.ui.CompList.ImageLabel("Item 2", ui.get("ind1")));
        l.add(new zebra.ui.CompList.ImageLabel("Item 3", ui.get("ind2")));
        var cb3 = new zebra.ui.Combo(l);
        cb3.list.select(0);
        p.add(cb3);

        var bp = pkg.createBorderPan("Drop down list", p);
        bp.setGaps(4,8);
        return bp;
    }
]);

})(zebra.ui.demo, zebra.Class, zebra.ui);
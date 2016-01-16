zebkit.package("ui.demo", function(pkg, Class) {

var ui = zebkit.ui;
eval(zebkit.Import("ui", "layout"));

pkg.BasicUIDemo = new Class(pkg.DemoPan, [
    function() {
        this.$super();
        this.setLayout(new FlowLayout("center", "center"));
        var r = new Panel(new BorderLayout(8,4));

        var p = new Panel(new GridLayout(3, 2)), ctr = new Constraints();
        ctr.left = ctr.right = ctr.bottom = ctr.top = 8;
        ctr.ax = "stretch";
        ctr.ay = "stretch";
        p.add(ctr, this.createCheckboxPan(3, true));
        p.add(ctr, this.createCheckboxPan(3, false));
        p.add(ctr, this.createTextFieldPan());
        p.add(ctr, this.createMTextFieldPan());
        p.add(ctr, this.createProgressPan());
        p.add(ctr, this.createSliderPan());

        var p_c = new Panel(new BorderLayout(4, 4));
        p_c.add("center", p);
        p_c.add("bottom", this.createButtonPan());

        var p_w = new Panel(new ListLayout(8));
        p_w.add(this.createComboPan());
        p_w.add(this.createListPan());

        r.add("left", p_w);
        r.add("center", p_c);

        this.add(r);
    },

    function createTextFieldPan() {
        var p = new Panel(new GridLayout(3, 2));
        var tf = new TextField();
        var ctr = new Constraints();
        ctr.ay = "center";
        ctr.setPadding(2);

        tf.setPreferredSize(150, -1);
        tf.setHint("<enter text>");

        p.add(ctr, new BoldLabel("Text field:"));
        p.add(ctr, tf);



        tf = new TextField(new zebkit.data.SingleLineTxt("dsd", 5));
        tf.setPreferredSize(150, -1);
        p.add(ctr, new BoldLabel("Fixed size(5):"));
        p.add(ctr, tf);

        tf = new TextField(new PasswordText());
        tf.setPreferredSize(150, -1);
        p.add(ctr, new BoldLabel("Password field:"));
        p.add(ctr, tf);

        return pkg.createBorderPan("Text fields", p);
    },

    function createMTextFieldPan() {
        var p = new Panel(new BorderLayout());
        var tf = new TextArea("Multiline\ntext field\ncomponents");
        tf.setBlinking();
        tf.setPreferredSize(180, 80);
        p.add("center", tf);
        return pkg.createBorderPan("Multilines text field", p);
    },

    function createSliderPan() {
        var p = new Panel(new BorderLayout());
        var sl = new Slider();
        sl.setPreferredSize(90, -1);
        p.add("center", sl);
        return pkg.createBorderPan("Slider", p);
    },

    function createProgressPan() {
        var p = new Panel(new FlowLayout("center", "center", "vertical", 16));
        var pr1 = new Progress();
        pr1.setPreferredSize(130, -1);
        pr1.setMaxValue(10);
        pr1.setValue(3);
        var pr2 = new Progress();
        pr2.setMaxValue(4);
        pr2.setValue(1);
        pr2.setBundleView(new Gradient("lightGray", "gray", "horizontal"));
        pr2.setPreferredSize(130, 12);
        pr2.setBundleSize(70, pr2.bundleHeight);
        p.add(pr1);
        p.add(pr2);
        return pkg.createBorderPan("Progress", p);
    },

    function createButtonPan() {
        var p = new Panel(new FlowLayout("center", "center", "horizontal", 8));
        p.add(new Button("Button"));
        var bt = new Button(new ImagePan(ui.demo.butterfly));
        bt.setFocusMarkerView(null);
        p.add(bt);
        p.add(new Button(new ImageLabel("Image button", ui.demo.butterfly)));
        bt = new Button("Disabled button");
        bt.setEnabled(false);
        p.add(bt);
        p.add(new Link("Link"));
        var bp = pkg.createBorderPan("Buttons", p);
        bp.setPadding(8);
        return bp;
    },

    function createListPan() {
        var p = new Panel(new ListLayout(8));
        var m = new zebkit.data.ListModel();
        m.add("Item 1");
        m.add("Item 2");
        m.add("Item 3");
        var l = new List();
        l.setModel(m);
        l.select(0);
        var lbp = new BorderPan("Simple list", l);
        lbp.setGaps(6,6);
        p.add(lbp);
        var l = new CompList();
        l.add("Label Item");
        l.add(new Checkbox("Checkbox Item"));
        l.add(new CompList.ImageLabel("Image Label Item", ui.demo.butterfly));
        var lbp = new BorderPan("Components list", l);
        lbp.setGaps(6,6);
        p.add(lbp);
        l.select(0);

        var bp = pkg.createBorderPan("List", p);
        bp.setGaps(4,4);
        return bp;
    },

    function createCheckboxPan(n, t) {
        var p = new Panel(new FlowLayout("center", "center", "vertical", 4)),
            s = t ? "Radio button " : "Checkbox button ", g = t ? new Group() : null;

        for(var i=0; i < n;  i++) {
            var ch = t ? new Radiobox(s + (i+1)) : new Checkbox(s + (i+1));
            p.add(ch);
            if (g != null) ch.setSwitchManager(g);
        }

        ch.setEnabled(false);
        ch.setValue(true);
        return pkg.createBorderPan(s, p);
    },

    function createComboPan() {
        var p = new Panel(new ListLayout(8));

        var cb = new Combo(["Item 1", "Item 2", "Item 3"]);
        cb.list.select(0);
        p.add(cb);

        var cb2 = new Combo(true);
        cb2.list.model.add("Item 1");
        cb2.list.model.add("Item 2");
        cb2.list.model.add("Item 3");
        var ps= cb2.getPreferredSize();
        cb2.setPreferredSize(ps.width, -1);
        p.add(cb2);

        var l = new CompList(true);
        l.setBorder(null);
        l.add(new CompList.ImageLabel("Item 1", ui.demo.ind1));
        l.add(new CompList.ImageLabel("Item 2", ui.demo.ind1));
        l.add(new CompList.ImageLabel("Item 3", ui.demo.ind2));

        var cb3 = new Combo(l);
        cb3.list.select(0);
        p.add(cb3);

        var bp = pkg.createBorderPan("Drop down list", p);
        bp.setGaps(4,8);
        return bp;
    }
]);

});
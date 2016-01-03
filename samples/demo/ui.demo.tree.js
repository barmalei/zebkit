
zebkit.package("ui.demo", function(pkg, Class) {

    var ui = zebkit.ui;
    eval(zebkit.Import("ui", "ui.tree", "layout"));

    function makeTreeModel() {
        var tm = new zebkit.data.TreeModel(new zebkit.data.Item("Root"));
        tm.add(tm.root, new zebkit.data.Item("Item 1"));
        tm.add(tm.root, new zebkit.data.Item("Item 2"));
        var ch = new zebkit.data.Item("Item 3");
        tm.add(tm.root, ch);
        tm.add(ch, new zebkit.data.Item("Item 3.1"));
        tm.add(ch, new zebkit.data.Item("Item 3.2"));
        return tm;
    }

    function makeTreeModel2(items, deepness) {
        function makeBranch(tm, r, items) {
            for(var i=0; i < deepness; i++) {
                var kid = new zebkit.data.Item("Long tree item : " + items);
                tm.add(r, kid);
                if (i%2 > 0) r = kid;
                items--;
                if (items <= 0) break;
            }
            return items;
        }

        var tm = new zebkit.data.TreeModel(new zebkit.data.Item("Root")), r = tm.root;
        while((items = makeBranch(tm, r, items)) > 0);
        return tm;
    }

    pkg.TreeDemo = new Class(pkg.DemoPan, [
        function() {
            this.$super();

            var p = new Panel(new FlowLayout(CENTER, TOP, HORIZONTAL, 8));
            this.setLayout(new BorderLayout(4,4));

            var t1 = new Tree(makeTreeModel()), p1 = new BorderPan("Standard tree", t1);
            p1.setGaps(6,6);
            p1.setPreferredSize(210, 180);
            t1.select(t1.model.root);

            var t2 = new Tree(makeTreeModel()), p2 = new BorderPan("Custom view tree", t2);
            var fn = new Font("Arial", "bold", 14);
            t2.setViewProvider(new zebkit.Dummy([
                  function getView(c, i) {
                        var tr = new TextRender(i.value);
                        if (i.value.indexOf("1") > 0) {
                            tr.setColor("red");
                        }

                        if (i.value.indexOf("2") > 0) {
                            return new BoldTextRender(i.value);
                        }

                        if (i.value.indexOf("Root") === 0) {
                            return new CompRender(new ImageLabel("Root", ui.demo.butterfly));
                        }
                        return tr;
                  }
            ]));
            t2.select(t2.model.root);
            p2.setGaps(6,6);
            p2.setPreferredSize(210, 180);

            var t3 = new Tree(makeTreeModel()), p3 = new BorderPan("Editable tree(use enter)", new ScrollPan(t3));
            t3.select(t3.model.root);
            t3.setEditorProvider(new DefEditors());
            p3.setGaps(6,6);
            p3.setPreferredSize(210, 180);

            var t4 = new Tree(makeTreeModel2(1000, 30)), p4 = new BorderPan("Long tree", new ScrollPan(t4));
            t4.select(t4.model.root);
            t4.setPadding(4);
            p4.setPreferredSize(-1, 280);
            this.add(BOTTOM, p4);

            var ctr = new Constraints();
            this.setPadding(8);
            p.add(ctr, p1);
            p.add(ctr, p2);
            p.add(ctr, p3);
            this.add(CENTER, p);
        }
    ]);

});
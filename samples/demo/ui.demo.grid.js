zebra.package("ui.demo", function(pkg, Class) {

var ui = zebra.ui;
eval(zebra.Import("ui", "layout", "ui.grid", "data", "ui.tree"));

function wrapWithPan() {
    var p = new Panel(new FlowLayout(CENTER, TOP, VERTICAL, 16));
    p.setPadding(8);
    for(var i=0; i< arguments.length; i++) p.add(arguments[i]);
    return p;
}

var colors = [ ["white", "lightGray", "white"],
               ["orange", "black", "orange"],
               ["white", "lightGray", "white"] ];

var ColumnsAlignmentProvider = Class(zebra.ui.grid.DefViews, [
    function getView(target,row,col,data){
        var tf = new BoldTextRender(data);
        tf.setFont(new Font("Helvetica", 16));
        if (row == 1 && col == 1) {
            tf.setColor("white");
        }
        else {
            tf.setColor("black");
        }
        return tf;
    },

    function getXAlignment(target, row,col){
        if(col === 0) return LEFT;
        else {
            if (col == 1) return CENTER;
            else if(col == 2) return RIGHT;
        }
        return this.$super(target, this.getXAlignment,row, col);
    },

    function getYAlignment(target, row,col){
        if(row === 0) return TOP;
        else {
            if(row == 1) return CENTER;
            else if(row == 2) return BOTTOM;
        }
        return this.$super(target, this.getYAlignment,row, col);
    },

    function getCellColor(target,row,col) {
        return colors[row][col];
    }
]);

var IMAGES = [ "android", "google", "yelp", "gmail" ];
var CustomGridEditor = new Class(zebra.ui.grid.DefEditors, [
    function() {
        this.$super();

        var ExtEditor = new Class(Panel, [
            function() {
                this.$super(new BorderLayout());

                this.isPopupEditor = true;

                var $this = this;

                this.accepted = false;
                this.list = new CompList(true);
                this.list.setLayout(new GridLayout(2, 2));
                this.list.setPadding(6);
                this.list.views[0] = null;
                this.add(CENTER, this.list);

                var controls = new Panel(new FlowLayout(CENTER, CENTER, HORIZONTAL, 8));
                var cancelLink = new Link("<cancel>");
                controls.add(cancelLink);
                controls.setPadding(0, 0, 4, 0);
                cancelLink.bind(function() {
                    $this.accepted = false;
                    $this.removeMe();
                });

                this.list.bind(function() {
                    $this.accepted = true;
                    $this.removeMe();
                });

                this.setBorder(new zebra.ui.Border("#7297BA", 2, 6));
                this.setBackground("#E0F4FF");

                this.add(BOTTOM, controls);
            },

            function fire(t, prev) {
                this.$super(t, prev);
                this.removeMe();
            },

            function isAccepted() { return this.accepted; }
        ]);

        this.extWin = new ExtEditor();
        for(var i = 0; i < IMAGES.length; i++) {
            var im = new ImagePan(zebra.ui.demo[IMAGES[i]]);
            im.setPadding(2);
            this.extWin.list.add(im);
        }
        this.extWin.toPreferredSize();

        this.editors["0"] = new Checkbox(null);
        this.editors["0"].setLayout(new FlowLayout(CENTER, CENTER));
        this.editors["1"] = new this.clazz.Combo();
        this.editors["1"].setBorder(null);
        var list = this.editors["1"].list;
        list.model.add("Item 1");
        list.model.add("Item 2");
        list.model.add("Item 3");
    },

    function getEditor(t, row,col,o){
        if (col == 3) return this.extWin;

        if (col === 0) {
            var e = this.$super(t, row, col, o);
            e.setValue(o == "on");
            return e;
        }

        return this.$super(t, row, col, o);
    },

    function fetchEditedValue(grid, row,col,data,editor){
        if (col == 0) return editor.getValue() ? "on" : "off";
        return (col == 3) ? editor.list.selectedIndex
                          : this.$super(grid, row, col, data, editor);
    }
]);

var CompViewProvider = new Class(zebra.ui.grid.DefViews,[
    function getView(target,row,col,o){
        return row == 2 ? new CompRender(o) : this.$super(target, row, col, o);
    }
]);

var CompEditorProvider = new Class(zebra.ui.grid.DefEditors, [
    function getEditor(t,r,c,v){
        if(r == 2) return v;
        else {
            var ce = this.$super(t, r, c, v);
            ce.setBorder(null);
            ce.setPadding(0);
            return ce;
        }
    },

    function fetchEditedValue(grid, row,col,data,c){
        return (row == 2) ? c : this.$super(grid, row, col, data, c);
    },

    function shouldStart(grid,row,col,e){
        return true;
    }
]);

function longGrid() {
    var m = new zebra.data.Matrix(100,10);
	for(var i=0; i < m.rows*m.cols; i++) { m.puti(i, "Cell [" + i +"]");  }

	var g = new Grid(m);
    g.setViewProvider(new zebra.ui.grid.DefViews([
        function getCellColor(target, row,col) {
            return (row % 2 === 0) ? ui.cellbg1 : ui.cellbg2 ;
        },

        function getXAlignment(target, row,col) {
            return zebra.layout.CENTER;
        }
    ]));

	var gp1 = new GridCaption(g);
	for(var i=0; i < m.cols; i++) gp1.putTitle(i, "Title " + i);
    g.add(TOP, gp1);

	var gp2 = new GridCaption(g);
	for(var i=0; i < m.rows; i++) gp2.putTitle(i, " " + i + " ");
    g.add(LEFT, gp2);

	var p = new ScrollPan(g);
	p.setPadding(4);
	return p;
}

function editableGrid() {
    function makeSubgrid(){
        var data = new Matrix(7, 3);

        for(var i = 0;i < data.rows; i ++ ){
            for(var j = 0;j < data.cols; j ++ ) data.put(i, j, "Cell [" + i + "," + j + "]");
        }
        var grid = new Grid(data);
        grid.position.setOffset(0);
        var cap = new GridCaption(grid);
        for (var i = 0; i < data.cols; i++) {
            cap.putTitle(i, "Title " + (i + 1));
        }

        cap.isResizable = false;
        grid.add(TOP, cap);
        return grid;
    }

    function makeTree(){
        var root = new Item("root"), data = new TreeModel(root);
        for(var i = 0;i < 2; i ++ ){
            var item = new Item("Item " + i);
            data.add(root, item);
            for(var j = 0;j < 2; j ++ ) data.add(item, new Item("Item " + i + "." + j));
        }
        var tree = new Tree(data);
        tree.select(root);
        return tree;
    }

    function makeTabs(){
        var book = new Tabs();
        book.add("Page 1", new Panel());
        book.add("Page 2", new Panel());
        book.add("Page 3", new Panel());
        var ps = book.getPreferredSize();
        book.setPreferredSize(ps.width, 130);
        return book;
    }

    function compGrid(){
        var data = new Matrix(1, 3);
        for(var i = 0;i < 3; i++){
            for(var j = 0;j < 2; j ++ ) data.put(j, i, "Cell[" + i + "][" + j + "]");
        }
        data.put(2, 0, makeSubgrid());
        data.put(2, 1, makeTree());
        data.put(2, 2, makeTabs());
        var grid = new Grid(data), cap = new GridCaption(grid);
        cap.isResizable = false;
        cap.putTitle(0, "Grid Inside");
        cap.putTitle(1, "Tree Inside");
        cap.putTitle(2, "Tabs Inside");
        grid.add(TOP, cap);
        grid.setEditorProvider(new CompEditorProvider());
        grid.setViewProvider(new CompViewProvider());
        grid.setPosition(null);
        grid.setUsePsMetric(true);

        var ps = grid.getPreferredSize();
        grid.setPreferredSize(ps.width, ps.height);
        return grid;
    }

    var onView = new Picture(zebra.ui.demo.on), offView = new Picture(zebra.ui.demo.off);
    var d = [ ["on", "Item 1", "text 1", "0"],
              ["off", "Item 1", "text 2", "0"],
              ["off", "Item 2", "text 3", "1"],
              ["on", "Item 3", "text 4", "2" ],
              ["on", "Item 1", "text 7",  "1"] ];
    var m = new Matrix(d);
    var t = ["Checkbox\nas editor", "Drop down\nas editor", "Text field\nas editor", "External Window\nas editor"];

	var g = new Grid();
    g.defXAlignment = CENTER;
    g.setViewProvider(new zebra.ui.grid.DefViews([
        function getView(target, row, col, data) {
            if (col === 0) return (data == "on") ? onView : offView;
            else {
                if (col == 3) return new Picture(zebra.ui.demo["s" + IMAGES[data]]);
            }
            return this.$super(target, row, col, data);
        }
    ]));
	g.setEditorProvider(new CustomGridEditor());


    g.setModel(m);

	var gp1 = new GridCaption(t, new TextRender(new Text("")));
	gp1.isResizable = false;
	g.add(TOP, gp1);

    // for(var i = 0;i < m.rows; i ++ ) g.setRowHeight(i, 40);
    for(var i = 0;i < m.cols; i ++ ) g.setColWidth(i, 130);

	return wrapWithPan(g, compGrid());
}

function createSortableGrid() {
    var g = new Grid(1, 3);

    for (var i=0; i < 50; i++) {
        for (var j=0; j < 3; j++) {
            g.model.put(i,j, "" + Math.floor(Math.random()* 1000000));
        }
    }

    var cap = new CompGridCaption();
    for (var i=0; i < 3; i++) {
        cap.add("Title " + i);
        cap.setSortable(i, true);
    }

    g.add(TOP, cap);
    return new ScrollPan(new GridStretchPan(g));
}


function customCellAlignmentGrid() {
    var d = [ "Top-Left\nAlignment", "Top-Center\nAlignment", "Top-Right\nAlignment",
              "Center-Left\nAlignment", "Center-Center\nAlignment", "Center-Right\nAlignment",
              "Bottom-Left\nAlignment", "Bottom-Center\nAlignment", "Bottom-Right\nAlignment"];
    var titles = [ "Left Aligned", new CompRender(new zebra.ui.ImageLabel("Center", zebra.ui.demo.ringtone)), "Right Aligned"];

    var root = new Panel(new RasterLayout(USE_PS_SIZE)),
        data = new Matrix(3, 3);

    for(var i = 0;i < data.rows * data.cols; i ++ ){
        data.puti(i, d[i]);
    }

    var grid = new Grid(data), caption = new GridCaption(grid);
    for(var i = 0;i < data.cols; i++) {
        caption.putTitle(i, titles[i]);
    }

    caption.setTitleAlignments(0, LEFT, CENTER);
    caption.setTitleAlignments(1, CENTER, CENTER);
    caption.setTitleAlignments(2, RIGHT, CENTER);
    caption.render.setFont(new Font("Helvetica", "bold", 14));
    caption.isResizable = false;

    grid.add(TOP, caption);
    grid.setViewProvider(new ColumnsAlignmentProvider());
    grid.setLocation(20, 20);
    for(var i = 0;i < data.rows; i ++ ) grid.setRowHeight(i, 120);
    for(var i = 0;i < data.cols; i ++ ) grid.setColWidth(i, 170);
    grid.toPreferredSize();

    root.add(grid);
    return wrapWithPan(root);
}

function createDynamicGrid() {
    var grid = new Grid(200, 10);

    for(var i=0; i<grid.getGridRows() * grid.getGridCols(); i++) {
        grid.model.puti(i, "Item [" + i+ "]");
    }

    var topCaption = new CompGridCaption();
    grid.add(TOP, topCaption);

    var addBt = new Button("+");
    addBt.setBorder(new RoundBorder("gray", 2));
    addBt.setPadding(3);
    addBt.canHaveFocus = false;
    topCaption.add(new Panel({
        layout: new FlowLayout("center", "center"),
        padding: 2,
        kids: addBt
    }));

    addBt.bind(function() {
        grid.model.insertCols(1, 1);
    });

    return new Panel({
        layout : new BorderLayout(8),
        kids   : {
            CENTER : new ScrollPan(grid)
        }
    });
}


pkg.GridDemo = new Class(pkg.DemoPan, [
    function() {
        this.$super();
        this.setLayout(new BorderLayout());
        this.setPadding(6);

        var n = new Tabs(LEFT);
        n.add("1000 cells", longGrid());
        n.add("Grid", customCellAlignmentGrid());
        n.add("Editable grid", editableGrid());
        n.add("Sortable", createSortableGrid());
        n.add("Dynamic", createDynamicGrid());

		this.add(CENTER, n);
    }
]);

});
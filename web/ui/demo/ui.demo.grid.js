
(function(pkg, Class, ui) {


var Matrix = zebra.data.Matrix;
var Panel = zebra.ui.Panel;
var Label = zebra.ui.Label;
var L = zebra.layout;
var FlowLayout = zebra.layout.FlowLayout;
var Grid  = zebra.ui.grid.Grid;
var Checkbox  = zebra.ui.Checkbox;
var Combo  = zebra.ui.Combo;
var DefViews = zebra.ui.grid.DefViews;
var DefEditors = zebra.ui.grid.DefEditors;
var GridCaption = zebra.ui.grid.GridCaption;
var BorderPan = zebra.ui.BorderPan;
var RasterLayout = zebra.layout.RasterLayout;
var TextRender = zebra.ui.view.TextRender;
var Fill = zebra.ui.view.Fill;
var rgb = zebra.util.rgb;
var TreeModel = zebra.data.TreeModel;
var Tree = zebra.ui.tree.Tree;
var Item = zebra.data.Item;
var Tabs = zebra.ui.Tabs;
var CompRender = zebra.ui.view.CompRender;
var CompList = zebra.ui.CompList;
var ImagePan = zebra.ui.ImagePan;
var GridLayout = zebra.layout.GridLayout;
var BorderLayout = zebra.layout.BorderLayout;
var Link = zebra.ui.Link;

function wrapWithPan() {
    var p = new Panel(new FlowLayout(L.CENTER, L.TOP, L.VERTICAL, 16));
    p.padding(8);
    for(var i=0; i< arguments.length; i++) p.add(arguments[i]);
    return p;
}

pkg.GridBooleanEditor = new Class([
        function getEditor(t, r,c,o){
            if(c != 2) return null;
            var state = o != null && o == "Yes", box = new Checkbox();
            box.setState(state);
            return box;
        },
        function fetchEditedValue(row,col,data,c){ return c.getState() ? "Yes" : "No"; },
        function shouldDo(action,row,col,e){ return a == grid.START_EDITING; },
        function editingCanceled(row,col,data,editor){}
]);

var colors = [ [rgb.white, rgb.lightGray, rgb.white],
               [rgb.orange, rgb.black, rgb.orange],
               [rgb.white, rgb.lightGray, rgb.white] ];

var ColumnsAlignmentProvider = new Class(DefViews, [
    function getView(row,col,data){
        var tf = new TextRender(data);
        if (row == 1 && col == 1) {
            tf.setDefBoldFont();
            tf.setForeground(rgb.white);
        }
        return tf;
    },

    function getXAlignment(row,col){
        if(col == 0) return L.LEFT;
        else
            if(col == 1) return L.CENTER;
            else if(col == 2) return L.RIGHT;
        return this.$super(this.getXAlignment,row, col);
    },

    function getYAlignment(row,col){
        if(row == 0) return L.TOP;
        else
            if(row == 1) return L.CENTER;
            else if(row == 2) return L.BOTTOM;
        return this.$super(this.getYAlignment,row, col);
    },

    function getCellColor(row,col) {
        return colors[row][col];
    }
]);

var IMAGES = [ "android", "google", "yelp", "gmail" ];
var CustomGridEditor = new Class(DefEditors, [
        function() {
            var ExtEditor = new Class(Panel, zebra.ui.ExternalEditor, [
                function() {
                    this.$super(new BorderLayout());

                    var $this = this;

                    this.accepted = false;
                    this.list = new CompList(true);
                    this.list.setLayout(new GridLayout(2, 2));
                    this.list.padding(6);
                    this.list.views[0] = null;
                    this.add(L.CENTER, this.list);

                    var controls = new Panel(new FlowLayout(L.CENTER, L.CENTER, L.HORIZONTAL, 8));
                    controls.setBackground(null);
                    var cancelLink = new Link("<cancel>");
                    controls.add(cancelLink);
                    controls.paddings(0, 0, 4, 0);
                    cancelLink._.add(function() {
                        $this.accepted = false;
                        $this.parent.remove($this);
                    });

                    this.list._.add(function() {
                        $this.accepted = true;
                        $this.parent.remove($this);
                    });

                    this.setBorder(new zebra.ui.view.Border(1, rgb.white, 2));
                    this.setBackground(new Fill(zebra.ui.get("col.gray6")));


                    this.add(L.BOTTOM, controls);
                },

                function fire(t, prev) {
                    this.$super(t, prev);
                    this.parent.remove(this);
                },

                function isAccepted() { return this.accepted; }
            ]);

            this.extWin = new ExtEditor();
            for(var i = 0; i < IMAGES.length; i++) {
                var im = new ImagePan(zebra.ui.get(IMAGES[i]));
                im.padding(2);
                this.extWin.list.add(im);
            }
            this.extWin.toPreferredSize();
        },

        function getEditor(t, row,col,o){
            if(col == 0){
                var cbox = new Checkbox(null);
                cbox.setState(o == "on");
                return cbox;
            }
            else
                if(col == 1){
                    var combo = new Combo(), list = combo.list;
                    list.model.addElement("Item 1");
                    list.model.addElement("Item 2");
                    list.model.addElement("Item 3");
                    for(var i = 0;i < list.model.elementsCount(); i ++ ){
                        if (list.model.elementAt(i) == o) {
                            list.select(i);
                            break;
                        }
                    }
                    return combo;
                }
                else {
                    if (col == 3) return this.extWin;
                }
                return this.$super(t, row, col, o);
            },

        function fetchEditedValue(row,col,data,editor){
            if(col == 0) return editor.getState() ? "on" : "off";
            else
                if(col == 1) return editor.list.model.elementAt(editor.list.selectedIndex);
                else
                    if (col == 3) return editor.list.selectedIndex;
            return this.$super(this.fetchEditedValue,row, col, data, editor);
        }
]);

var CompViewProvider = new Class(DefViews,[
    function getView(row,col,o){
        return row == 2 ? new CompRender(o) : this.$super(row, col, o);
    }
]);

var CompEditorProvider = new Class(DefEditors, [
    function getEditor(t, r,c,o){
        if(r == 2) return o;
        else {
            var ce = this.$super(t, r, c, o);
            ce.setBorder(null);
            ce.padding(0);
            return ce;
        }
    },

    function fetchEditedValue(row,col,data,c){
        return (row == 2) ? c : this.$super(this.fetchEditedValue,row, col, data, c);
    },

    function shouldDo(t, action,row,col,e){
        return action == START_EDITING;
    }
]);


function longGrid() {
   // var m = new zebra.data.Matrix(10000,20);
    var m = new zebra.data.Matrix(100,10);
	for(var i=0; i<m.rows*m.cols; i++) { m.puti(i, "Cell [" + i +"]");  }

	var g = new Grid(m);
    g.setViewProvider(new DefViews([
        function getCellColor(row,col) {
            return (row % 2 == 0) ? ui.get("cell.bg1") : ui.get("cell.bg2") ;
        }
    ]));

	var gp1 = new GridCaption(g);
	for(var i=0; i < 10; i++) gp1.putTitle(i, "Title " + i);
    g.add(L.TOP, gp1);

	var gp2 = new GridCaption(g);
	for(var i=0; i < 100; i++) gp2.putTitle(i, " " + i + " ");
    g.add(L.LEFT, gp2);

	var corner = new Panel();
	corner.setBorder(ui.get("gcap.brv"));
	corner.setBackground(ui.get("gcap.bg"));
	g.add(L.NONE, corner);
	var p = new zebra.ui.ScrollPan(g);
	p.padding(4);
	return p;
}

function editableGrid() {
    function makeSubgrid(){
        var data = new Matrix(4, 2);
        for(var i = 0;i < data.rows; i ++ ){
            for(var j = 0;j < data.cols; j ++ ) data.put(i, j, "Cell [" + i + "," + j + "]");
        }
        var grid = new Grid(data);
        grid.position.setOffset(0);
        var cap = new GridCaption(grid);
        cap.putTitle(0, "Title 1");
        cap.putTitle(1, "Title 2");
        cap.isResizable = false;
        grid.add(L.TOP, cap);
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
//        book.add("Page 3", new Panel());
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
        grid.add(L.TOP, cap);
        grid.setEditorProvider(new CompEditorProvider());
        grid.setViewProvider(new CompViewProvider());
        grid.setPosition(null);
        grid.usePsMetric(true);
        return grid;
    }

    var onView = zebra.ui.get("on"), offView = zebra.ui.get("off"),  m = new Matrix(4,4);
    var d = [ "on", "Item 1", "text 1", "0",
              "off", "Item 1", "text 2", "0",
              "off", "Item 2", "text 3", "1",
              "on", "Item 3", "text 4", "2",
              "on", "Item 1", "text 5",  "1" ];
    var t = ["Checkbox\nas editor", "Drop down\nas editor", "Text field\nas editor", "External Window\nas editor"];

	for(var i=0; i < (m.rows * m.cols); i++) { m.puti(i, d[i]);  }

	var g = new Grid(m);
    g.setViewProvider(new DefViews([
        function getView(row, col, data) {
            if (col == 0) return (data == "on") ? onView : offView;
            else {
                if (col == 3) return zebra.ui.get("s" + IMAGES[data]);
            }
            return this.$super(row, col, data);
        }
    ]));

	g.setEditorProvider(new CustomGridEditor());

	var gp1 = new GridCaption(g);
	gp1.isResizable = false;
	for(var i=0; i < m.cols; i++) gp1.putTitle(i, t[i]);
	g.add(L.TOP, gp1);

    // for(var i = 0;i < m.rows; i ++ ) g.setRowHeight(i, 40);
    for(var i = 0;i < m.cols; i ++ ) g.setColWidth(i, 110);

	return wrapWithPan(g, compGrid());
}

function customCellAlignmentGrid() {
    var d = [ "Top-Left\nAlignment", "Top-Center\nAlignment", "Top-Right\nAlignment",
              "Center-Left\nAlignment", "Center-Center\nAlignment", "Center-Right\nAlignment",
              "Bottom-Left\nAlignment", "Bottom-Center\nAlignment", "Bottom-Right\nAlignment"];
    var titles = [ "Left Aligned", new CompRender(new zebra.ui.ImageLabel("Center", zebra.ui.get("ringtone"))), "Right Aligned"];

    var root = new Panel(new RasterLayout(L.USE_PS_SIZE)), data = new Matrix(3, 3);
    for(var i = 0;i < data.rows*data.cols; i ++ ){
        data.puti(i, d[i]);
    }
    var grid = new Grid(data), caption = new GridCaption(grid);
    for(var i = 0;i < data.cols; i ++ ) caption.putTitle(i, titles[i]);
    caption.setTitleProps(0, L.LEFT, L.CENTER, null);
    caption.setTitleProps(2, L.RIGHT, L.CENTER, null);
    caption.isResizable = false;

    grid.add(L.TOP, caption);
    grid.setViewProvider(new ColumnsAlignmentProvider());
    grid.setLocation(20, 20);
    for(var i = 0;i < data.rows; i ++ ) grid.setRowHeight(i, 90);
    for(var i = 0;i < data.cols; i ++ ) grid.setColWidth(i, 140);
    grid.toPreferredSize();

    root.add(grid);
    return wrapWithPan(root);
}

pkg.GridDemo = new Class(pkg.DemoPan, [
    function() {
        this.$super();
        this.setLayout(new L.BorderLayout());
        this.padding(6);

        var n = new Tabs(L.LEFT);
        n.add("1000 cells", longGrid());
        n.add("Grid", customCellAlignmentGrid());
        n.add("Editable grid", editableGrid());

		this.add(L.CENTER, n);
    }
]);

})(zebra.ui.demo, zebra.Class, zebra.ui);
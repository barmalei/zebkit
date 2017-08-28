---
layout: page
parent: docs
title: Data model 
---

Zebkit data models are number of simple classes that help to keep various data structures and track the data updating. 

Data models classes and interfaces are hosted in separated and independent from UI “zebkit.data” package. Almost every zebkit data model can be represented with a JavaScript structure:

<table class="info">
<tr><th>
Zebkit data model
</th><th>
JavaScript type
</th></tr>

<tr><td>
zebra.data.ListModel
</td><td markdown="1">
[1, 2, 3,…  ]
</td></tr>

<tr><td>
zebkit.data.Text<br/> 
zebkit.data.SingleLineTxt 
</td><td>
```js
"The text", "Multiline\ntext"
```
</td></tr>

<tr><td>
zebkit.data.Matrix
</td><td markdown="1">
```js
// 2 rows 3 cols matrix
[ 
  [1,2,3],
  [3,4,5]
]
```    
</td></tr>

<tr><td>
zebkit.data.TreeModel
</td><td markdown="1">
```json
{
  "value": "tree item",
  "kids" : ["Subitem 1", "Subitem 2" ]
}
```
</td></tr>
</table>

The JavaScript type can be used to construct an appropriate data model. Usually it is done by a data model class constructor.

##  ListModel (zebkit.data.ListModel)

List model provides the following API:
<table>
<tr><th>
        
</th><th>

</th></tr>

<tr><td>
        
</td><td>
    </td>
</tr>
</table>

Method  Description
get(index)  get a list element by the given index
add(value)  add a new element to the list
set(value, index)   set the new value for the specified by the given index element
insert(value, index)    insert the given element into list at the specified position
remove(value)   find and remove the given element from the list
removeAt(index) remove an element by at the given position
removeAll() remove all elements from the list
count() return number of elements stored in the list
indexOf(value)  find a position of the given element in the list
contains(value) return "true" if the given element is in the list
List model events:
Event   Description
elementInserted(listModel, value, index)    fired when a new element has been inserted in the list
elementRemoved(listModel, removedValue, index)  fired when an element has been removed from the list
elementSet(listModel, value, prevValue, index)  fired when a new value has been set for an element in the list
Example below is basic use-case of list model usage:

```js
// create list model
var l = new zebkit.data.ListModel();
 
// add three elements into the list
l.add(1);
l.add(2);
l.add(3);
 
// register the list element removal events handler
l.on("elementRemoved", function(listModel, removedValue, index) {
   ...
});
```




## Matrix (zebkit.data.Matrix)

Matrix data model provides the following API:
Method and properties   Description
get(row,col)    get an element of the matrix stored at the given row and column
put(row,col,value)  add or set an element value at the specified row and column
puti(index, value)  add or set an element value at the specified index
setRowsCols(rows, cols) resize the matrix
setRows(rows)   set number of rows of the matrix
setCols(cols)   set number of columns of the matrix
removeRows(begrow, count)   remove the given number of rows starting from the specified row
removeCols(begcol, count)   remove the given number of columns starting from the specified column
rows, cols  number of rows and columns in the matrix
Matrix model events:
Event   Description
matrixResized(matrixModel, prevRows, prevCols)  fired when a number of rows or columns in the matrix has been changed
cellModified(matrixModel, row,col, prevValue)   fired when a matrix element has been updated
matrixSorted(matrixModel, sortInfo) fired when a matrix column has been sorted. The passed info contains "func" (sort function), "name" (sort function name) and "col" (sorted column) fields.
Simple example of matrix model usage:

```js
// create 2x2 matrix model
var m = new zebkit.data.Matrix(2,2);
 
// fill all cells of the matrix with values
// the result is the following matrix:
// [ 0, 1 ]
// [ 2, 3 ]
for(var i=0; i< m.rows*m.cols; i++) {
   m.puti(i, i);
}
 
// catch matrix cell update events
m.on("cellModified", function(matrixModel, row, col, prevValue) {
   ...
});
```


## TreeModel (zebkit.data.TreeModel)

Tree model is represented as a hierarchy of “zebra.data.Item” class instances. “zebra.data.Item” class is designed to keep tree model node value, references to its kids nodes and a reference to its parent node. “zebra.data.Item” class is simple structure that has the following readonly properties:

kids Array of children items
value A value the item stores
parent Reference to the item parent
All these listed above properties should not be modified directly. The properties are supposed to be used as read-only properties. To modify tree structure or an item value use API provided by the tree model:
Method and properties   Description
setValue(item,value)    set the value of the specified tree model item
add(toItem, newItem)    add the specified item as a children item of the given tree model item
insert(toItem, newItem, index)  insert the specified item as a children of the given tree model item at the given index
remove(item)    remove the specified item from the tree model
removeKids(item)    remove all children items of the given tree model item
root    root item of the tree model
Tree model events:
Event   Description
itemModified(treeModel, item)   Fired when a tree model item value has been updated
itemRemoved(treeModel, item)    Fired when a tree model item has been removed the model
itemInserted(treeModel, item)   Fired when a new item has been inserted into the tree model
Often it is more handy to define tree model using JavaScript structure. The structure is passed as a tree model class constructor argument. Than the tree model transforms the structure into hierarchy of “zebra.data.Item” class instances. For instance find below JavaScript tree model definition alone with the tree structure it declares:

JavaScript tree model:

```json
{
   "value": "Root",
   "kids" : [
      "Item 1",
      {
         "value": "Item 2"
         "kids" : [ "Item 2.1", "Item 2.2" ]
      }
   ]
}
```

Tree model structure:

```bash
Root
 |
 +--- Item 1
 +--- Item 2
       |
       +--- Item 2.1
       +--- Item 2.2
```

Find simple example of tree model usage:

```js
// create tree model
// Root
//  +-- Item 1
//  +-- Item 2
//       +--- Item 3
var t = new zebkit.data.TreeModel({
   value: "Root",
   kids : [
      "Item 1",
      {
        value: "Item 2",
        kids: [
           "Item 3"
        ]
      }
   ]
});
 
// catch tree model item value modification events
t.on("itemModified", function(treeModel, item) {
   ...
});
 
// update "Item 1" value with "New value"
t.setValue(t.root.kids[0], "New value");
```



### TextModel (zebkit.data.TextModel interface)

“zebra.data.TextModel” is interface that has two implementations:

zebra.data.SingleLineTxt Single line text
zebra.data.Text Multilines text
Text model provides the following API:
Method and property Description
getLine(line)   return the given text line
getValue()  get the original text string wrapped with the text model
setValue(str)   set the specified text string to the text model
getLines()  get number of lines stored in the given text model
getTextLength() get number of characters stored in the given text model
write(str, offset)  write the given string into text model starting from the specified offset
remove(offset, size)    remove part of text from the text model starting from the specified offset with the given length
Text model events:
Event   Description
textUpdated(txtModel,isAdded, offset,
size, startLine, endLine)   Fired when a text model has been updated. The passed event parameters discover which part of text has been updated, which lines have been affected with the update and what type of update (insertion or removal) has occurred
Simple example of tree model usage:

```js
// create three lines text model
var t = new zebkit.data.Text("One\nTwo\nThree");
 
// list text model lines
for(var i=0; i < t.getLines();  i++) {
   print(t.getLine(i));
}
 
// catch text update events
t.on(function(e) {
   ...
});
```


## Data models visualization

Data models are used by UI components as a content that has to be visualized. The table below shows Zebra UI components and a data model they visualize:
UI Component    Data model
zebra.ui.Label
zebra.ui.MLabel
zebra.ui.TextField
zebra.ui.TextArea
zebra.ui.TextRender zebra.data.Text, zebra.data.TextModel
zebra.ui.List
zebra.ui.CompList   zebra.data.ListModel
zebra.ui.grid.Grid  zebra.data.Matrix
zebra.ui.tree.Tree  zebra.data.TreeModel
In most cases UI is customizable concerning a way the given data model or data model elements have to be rendered. The picture below illustrates widely used by Zebra design pattern of a data model elements rendering customization:

vcustomization

According to the picture above data model elements are transformed into UI “zebra.ui.View” views by a view provider. The views can be easily drawn on an UI component surface. Thus the rendering customization is usually done by implementing an own view provider. The typical pseudo-code a developer has to use to customize data model elements rendering is shown below:

...
ui.setViewProvider(new zebra.Dummy([  // anonymous class
    // define how a data model element has to be transformed into an UI element
    function getView(uiComponent, dataModelElement) { 
        return new zebra.ui.TextRender(dataModelElement.toString());
    }
]));
...
Before we start with samples …

Before starting to write model visualization code it is necessary to do few preparation actions:

1. Load resources we need in the samples
As you should know Zebra code has to be written in “zebra.ready(…)” what guarantees the code is run in proper time and place. But pay attention if zebra UI requires images to be used they have to be loaded in advance. Browsers load images asynchronously, what means an image metrics (width and height) cannot be known in advance. Also only a completely loaded image can be safely rendered on HTML Canvas element. To avoid inconsistency and errors all images have to be loaded before “zebra.ready(…)” section is called using “zebra.ui.loadImage(imgRef)” method.

In our examples we need three images to be loaded, let’s do it as follow:

// load required images and store references to its
var yelp    = zebra.ui.loadImage("yelp.png");
var android = zebra.ui.loadImage("android.png") ;
var gmail16 = zebra.ui.loadImage("gmail_16.png");
 
// write and run a zebra example
zebra.ready(function() {
   // an example code
   ...
});
2. Write custom “zebra.ui.View” the samples are shared
Samples we are going to write down need a simple view element that can paint left aligned icon with a text. Let’s implement the view as follow:

var ItemRender = zebra.Class(zebra.ui.View, [
    function(icon, text) { // pass icon image and text to be rendered
        this.icon = icon;
        this.font = zebra.ui.boldFont; 
        this.text = text;
    },
    
    // implement left aligned icon with text painting
    function paint(g,x,y,w,h,t) {
        g.drawImage(this.icon,x,y);
        x += this.icon.width + 4;
        g.setColor("orange");
        g.setFont(this.font);
        g.fillText(this.text,x,(this.icon.height-this.font.height)/2+y); 
    },
     
    // say which size the view prefers to have
    function getPreferredSize() {
        return { 
            width : this.icon.width + 4 + this.font.stringWidth(this.text), 
            height: Math.max(this.font.height, this.icon.height) 
        };
    }
]);


### ListModel visualization

<script type="text/javascript">
    zebkit.resources("public/images/bmw_small.png",
                     "public/images/honda_small.png",
                     "public/images/saab_small.png",
        function(bmw, honda, saab) {
            zebkit.images = {};
            zebkit.images.bmw   = bmw;
            zebkit.images.honda = honda;
            zebkit.images.saab  = saab;
        }
    );
</script>


{% include zsample.html canvas_id='model1' title='List model' %}

<script type="text/javascript">
    zebkit.require("data", "ui", function(data, ui) {
        var l = new ui.List([ "Item 1", "Item 2", "Item 3" ]);
        
        new ui.zCanvas("model1").root.properties({
            layout : new zebkit.layout.BorderLayout(),
                padding: 4,
                kids   : {  center: l }
        });

        l.model.add("Item 4");
    });
</script>


{% include zsample.html canvas_id='model2' title='List model' %}

<script type="text/javascript">
    zebkit.require("data", "ui", "draw", function(data, ui, draw) {
        var l = new ui.List([
            new draw.Picture(zebkit.images.bmw, 0, 0, 24, 24),
            new draw.Picture(zebkit.images.honda,  0, 0, 24, 24),
            new draw.Picture(zebkit.images.saab,  0, 0, 24, 24)
        ]);

        new ui.zCanvas("model2").root.properties({
           layout : new zebkit.layout.BorderLayout(),
           padding: 4,
           kids   : { center: l }
        });
    });
</script>

{% include zsample.html canvas_id='model3' title='List model' %}

<script type="text/javascript">
    zebkit.require("data", "ui", "draw", function(data, ui, draw) {
        var l = new ui.CompList([
            new ui.ImageLabel("Item 1", zebkit.images.bmw),
            new ui.ImageLabel("Item 2", zebkit.images.honda),
            new ui.ImageLabel("Item 3", zebkit.images.saab)
        ]);

        new ui.zCanvas("model3").root.properties({
           layout : new zebkit.layout.BorderLayout(),
           padding: 4,
           kids : { center: l }
        });
    });
</script>

{% include zsample.html canvas_id='model4' title='List model' %}

<script type="text/javascript">
    zebkit.require("data", "ui", "ui.tree", function(data, ui, tree) {
        var t = new zebkit.ui.tree.Tree({
            value: "Item 1",
            kids: [
                "Item 2",
                {
                    value: "Item 3",
                    kids:  [
                        "Item 4",
                        "Item 5"
                    ]
                }
            ]
        });

        new ui.zCanvas("model4").root.properties({
           layout : new zebkit.layout.BorderLayout(),
           padding: 4,
           kids : { center: t }
        });
    });
</script>


{% include zsample.html canvas_id='model5' title='List model' %}

<script type="text/javascript">
    zebkit.require("data", "ui", "ui.tree", function(data, ui, tree) {
        var t = new zebkit.ui.tree.Tree({
            value: "Item 1",
            kids: [
                "Item 2",
                {
                    value: "Item 3",
                    kids:  [
                        "Item 4",
                        "Item 5"
                    ]
                }
            ]
        });

        new ui.zCanvas("model5").root.properties({
           layout : new zebkit.layout.BorderLayout(),
           padding: 4,
           kids : { center: t }
        });
    });
</script>

{% include zsample.html canvas_id='model6' title='List model' %}

<script type="text/javascript">
    zebkit.require("data", "ui", "ui.tree", function(data, ui, tree) {
        var t = new zebkit.ui.tree.Tree({
            value: new zebkit.draw.Picture(zebkit.images.bmw),
            kids: [
                "Item 2",
                {
                    value: "Item 3",
                    kids:  [
                        "Item 4",
                        "Item 5"
                    ]
                }
            ]
        });

        new ui.zCanvas("model6").root.properties({
           layout : new zebkit.layout.BorderLayout(),
           padding: 4,
           kids : { center: t }
        });
    });
</script>

{% include zsample.html canvas_id='model7' title='List model' %}

<script type="text/javascript">
    zebkit.require("data", "ui", "ui.grid", function(data, ui, grid) {
        var g = new grid.Grid([
            ["Cell 1,1", "Cell 1,2", "Cell 1,3"],
            ["Cell 2,1", "Cell 2,2", "Cell 2,3"],
            ["Cell 3,1", "Cell 3,2", "Cell 3,3"]
        ]);
        g.setUsePsMetric(true);
        g.setCellPadding(8);

        new ui.zCanvas("model7").root.properties({
            layout : new zebkit.layout.FlowLayout("center", "center"),
            padding: 4,
            border: "plain",
            kids : g
        });
    });
</script>

{% include zsample.html canvas_id='model8' title='List model' %}

<script type="text/javascript">
    zebkit.require("data", "ui", "ui.grid", function(data, ui, grid) {
        var p = new zebkit.draw.Picture(zebkit.images.bmw,0,0,24,24);
        var g = new grid.Grid([
            [p, "Cell 1,2", "Cell 1,3"],
            ["Cell 2,1", p, "Cell 2,3"],
            ["Cell 3,1", "Cell 3,2", p]
        ]);
        g.setUsePsMetric(true);
        g.setCellPadding(8);
        console.log(">>> "  +  p.getPreferredSize().width);

        new ui.zCanvas("model8").root.properties({
            layout : new zebkit.layout.FlowLayout("center", "center"),
            padding: 4,
            border: "plain",
            kids : g
        });
    });
</script>

List model can be visualized with “zebra.ui.List” component:
// create list component to visualize list model
var l=new zebra.ui.List(["Item 1","Item 2","Item 3"]);
 
// add list to canvas
new zebra.ui.zCanvas(150,150).root.properties({
   layout : new zebra.layout.BorderLayout(),
   padding: 4,
   kids   : { CENTER: l }
});
 
// add new item to list model of list UI component
l.model.add("Item 4");


The easiest way to customize list model items rendering is using “zebra.ui.View” class implementations as the list model values. For instance the example below fills list model with “zebra.ui.Picture” class instances. In this case the list renders model items as pictures:
// visualize list model where every item is view
var l = new zebra.ui.List([
  new zebra.ui.Picture(gmailImg),
  new zebra.ui.Picture(yelpImg),
  new zebra.ui.Picture(androidImg)
]);
 
// add list component to canvas
new zebra.ui.zCanvas(150,150).root.properties({
   layout : new zebra.layout.BorderLayout(),
   padding: 4,
   kids   : { CENTER: l }
});


The example above put UI elements direct into list model what is not good solution since it messes data with visualization. The better solution is re-defining the component view provider with a custom one. The example below implements and sets a custom view provider that renders list model items as a combination of icon and text:
// create list component with the given list model
var l = new zebra.ui.List([
  "Item 1",
  "Item 2",
  "Item 3"
]);
 
// customize list model rendering
l.setViewProvider(new zebra.Dummy([
    function getView(list, item, index) {
        return new ItemRender(gmailImg, item);
    }
]));
 
// add list to canvas
new zebra.ui.zCanvas(150,150).root.properties({
   layout : new zebra.layout.BorderLayout(),
   padding: 4,
   kids : { CENTER: l }
});


TextModel visualization

There are bunch of UI components and views that can render single line or multi lines text model:
// create single line and multilines label components
var l1 = new zebra.ui.Label("Single line label");
var l2 = new zebra.ui.MLabel("Multi-lines\nlabel\nexample");
l1.setPadding(4);
l1.setBorder("plain");
l2.setPadding(4);
l2.setBorder("plain");
 
// add labels to canvas
new zebra.ui.zCanvas(150,150).root.properties({
   layout : new zebra.layout.ListLayout(4),
   padding: 4, kids : [ l1, l2]
});


Text rendering can be customizing by extending “zebra.ui.TextRender” class. For instance, find below very strait-forward extension of “zebra.ui.TextRender” that adds sort of syntactic highlighting:
// extend standard "zebra.ui.TextRender" class with
// basic syntactic highlighting
var SynRender = new zebra.Class(zebra.ui.TextRender, [
    function(content) {
        this.words = {};
        this.$super(content);
        this.setColor("black");
        this.setFont(new zebra.ui.Font("Courier","bold",14));
    },
 
    function paintLine(g,x,y,line,d){
        var s=this.getLine(line),v=s.split(/\s/),xx = x;
        for(var i = 0; i < v.length; i++){
            var str = v[i] + " ", color = this.words[v[i]];
            g.setColor(color != null ? color : this.color);
            g.fillText(str, xx, y);
            xx += this.font.stringWidth(str);
        }
    }
]);
 
// load text from remote server
var sh = new SynRender(zebra.io.GET("rs/test.java"));
 
// define colors for key words
sh.words = { "class"   : "orange", "public" : "blue",
             "extends" : "orange", "static" : "orange",
             "if"      : "red", "==":"green" };
 
// create "zebra.ui.Label" component with the just
// implemented custom text render
new zebra.ui.zCanvas(200, 250).root.properties({
    layout : new zebra.layout.BorderLayout(),
    padding: 4, border: "etched", background: "white",
    kids : { CENTER: new zebra.ui.Label(sh) }
});


Matrix model visualization

Matrix model can be visualized with “zebra.ui.grid.Grid” component. For instance:
// create grid UI component with the given matrix model
var g = new zebra.ui.grid.Grid([
    ["Cell 1,1", "Cell 1,2", "Cell 1,3"],
    ["Cell 2,1", "Cell 2,2", "Cell 2,3"],
    ["Cell 3,1", "Cell 3,2", "Cell 3,3"]
]);
g.setUsePsMetric(true);
g.setCellPadding(8);
 
// add grid to canvas
new zebra.ui.zCanvas(250,200).root.properties({
   layout: new zebra.layout.FlowLayout("center",
                                       "center"),
   padding: 4, border: "plain", kids : g
});


The easiest way to customize matrix elements rendering is put “zebra.ui.View” class implementations as the model values. For instance the example below sets matrix diagonal values to “zebra.ui.Picture” view instances:
// create picture view element
var p = new zebra.ui.Picture(gmailImg);
// create grid UI component with the 
// given model  
var g = new zebra.ui.grid.Grid([
    [p, "Cell 1,2", "Cell 1,3"],
    ["Cell 2,1", p, "Cell 2,3"],
    ["Cell 3,1", "Cell 3,2", p]
]);
 
// add grid to canvas
var z=new zebra.ui.zCanvas(250,200);
 
z.root.properties({
   layout:new zebra.layout.FlowLayout(
                    "center",
                    "center"),
   padding: 4, border: "plain", kids: g
});


The better way of matrix model elements rendering customization is redefining the grid component view provider. In this case data model is fully decoupled from visualization. For instance in example shown below all grid cells will be rendered as icon + text views:
// create grid with the given matrix model
var g = new zebra.ui.grid.Grid([
    ["Cell 1,1", "Cell 1,2", "Cell 1,3"],
    ["Cell 2,1", "Cell 2,2", "Cell 2,3"],
    ["Cell 3,1", "Cell 3,2", "Cell 3,3"]
]);
g.setUsePsMetric(true);
g.setCellPadding(10);
 
// define custom view provider by extending standard 
// "zebra.ui.grid.DefViews" grid provider class
var GridViewProvider=zebra.Class(zebra.ui.grid.DefViews,[
  function getView(grid, row, col, data) {
     return new ItemRender(gmailImg,
                           data);
  },
 
  function getCellColor(grid, row,col){
      return (row==col)?"#DADADA"
                       :null;
  }
]);
 
// set custom view provider declared above
g.setViewProvider(new GridViewProvider());
 
// add grid to canvas
new zebra.ui.zCanvas(300,250).root.properties({
  layout:new zebra.layout.FlowLayout("center",
                                     "center"),
  padding: 4, border: "plain", kids : g
});


Tree model visualization

Tree model can be visualized by “zebra.ui.Tree” component. In simple case developer can just pass model as tree UI component argument:
// create tree with the given tree model
var t = new zebra.ui.tree.Tree({
  value: "Item 1",
  kids: [
    "Item 2",
    {
      value: "Item 3",
      kids:  [ "Item 4", "Item 5" ]
    }
  ]
});
 
// add tree to canvas
new zebra.ui.zCanvas(150,150).root.properties({
   layout : new zebra.layout.BorderLayout(),
   padding: 4, border: "plain",
   kids : { CENTER: t}
});


The easiest way to customize tree model items rendering is using “zebra.ui.View” implementations as the tree model values. In the example below
root tree model item value is set to “zebra.ui.Picture” view class instance. It causes the tree model item will be rendered as “zebra.ui.Picture” view:
// define tree with the given tree model
var t = new zebra.ui.tree.Tree({
  value: new zebra.ui.Picture(gmailImg),
  kids: [
    "Item 2",
    {
      value: "Item 3",
      kids: [ "Item 4", "Item 5" ]
    }
  ]
});
 
// add tree component to canvas
new zebra.ui.zCanvas(150,150).root.properties({
   layout : new zebra.layout.BorderLayout(),
   padding: 4, border: "plain",
   kids : { CENTER: t}
});


The previous tree model item rendering customization is a little bit dirty, since the declared tree model messes data with UI specific element. The better solution is redefining view provider of the tree UI component with a custom one. In example below all items of a tree model will be rendered as icon + text views:
// create tree with the given tree model
var t = new zebra.ui.tree.Tree({
  value: "Item 1",
  kids: [
    "Item 2",
    {
      value: "Item 3",
      kids:  [ "Item 4", "Item 5" ]
    }
  ]
});
 
// customize tree model items rendering
t.setViewProvider(new zebra.Dummy([
    function getView(list, item) {
        return new ItemRender(gmailImg,
                              item.value);
    }
]));
 
// add tree into canvas
new zebra.ui.zCanvas(150,150).root.properties({
   layout : new zebra.layout.BorderLayout(),
   padding: 4, border: "plain", kids : { CENTER: t}
});



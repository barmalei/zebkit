---
layout: page
parent: docs
title: Data model 
---

Zebkit data models are number of simple classes that help to keep various data structures and track the structures updating. 

Data models classes and interfaces are hosted in separated and independent from UI “zebkit.data” package. Almost every zebkit data model can be represented with a JavaScript structure:

<table class="info">
<tr><th>
Zebkit data model
</th><th>
JavaScript type
</th></tr>

<tr><td>
zebkit.data.ListModel
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

JavaScript types can be used to construct an appropriate data model. Usually it is done by a data model class constructor.


##  ListModel (zebkit.data.ListModel)

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

```js
// create 2 x 2 matrix model
var m = new zebkit.data.Matrix(2,2);
 
// fill all cells of the matrix with values
// the result is the following matrix:
// [ 0, 1 ]
// [ 2, 3 ]
for(var i = 0; i< m.rows * m.cols; i++) {
   m.puti(i, i);
}
 
// catch matrix cell update events
m.on("cellModified", function(matrixModel, row, col, prevValue) {
   ...
});
```


## TreeModel (zebkit.data.TreeModel)

Tree model is represented as a hierarchy of __“zebkit.data.Item”__ class instances. “zebkit.data.Item” class is designed to keep tree model node value, references to its kids nodes and a reference to its parent node. 

JavaScript tree model:

```json
{
   "value": "Root",
   "kids" : [
      "Item 1",
      {
         "value": "Item 2",
         "kids" : [ "Item 2.1", "Item 2.2" ]
      }
   ]
}
```

Tree model structure:

```bash
Root
 |
 +-- Item 1
 +-- Item 2
       |
       +-- Item 2.1
       +-- Item 2.2
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

__“zebkit.data.TextModel"__ is interface that has two implementations:

   * "zebkit.data.SingleLineTxt" - single line text
   * "zebkit.data.Text" - multi-lines text
   
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

Data models are used by UI components as a content that has to be visualized. The table below shows zebkit UI components and a data model they visualize:

<table class="info">
<tr><th>
UI Component  
</th><th>
Data model
</th><th>
Visualization
</th></tr>

<tr><td>
zebkit.ui.Label<br/>
zebkit.ui.BoldLabel<br/>
zebkit.ui.TextField<br/>
zebkit.ui.TextArea<br/>
</td><td>
zebkit.data.Text<br/>
zebkit.data.TextModel
</td><td align="center">
<canvas id="textxModel"></canvas>
</td></tr>

<tr><td>
zebkit.ui.List
</td><td>
zebkit.data.List
</td><td align="center">
<canvas id="listModel"></canvas>
</td></tr>

<tr><td>
zebkit.ui.grid.Grid
</td><td>
zebkit.data.Matrix
</td><td align="center">
<canvas id="matrixModel"></canvas>
</td></tr>

<tr><td>
zebkit.ui.tree.Tree
</td><td>
zebkit.data.TreeModel
</td><td align="center" valign="center">
<canvas id="treeModel"></canvas>
</td></tr>

</table>
    

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

<script type="text/javascript">
    zebkit.require("data", "ui", "draw", function(data, ui, draw) {
        var l = new ui.Label("Multi-line\ntext\nto show").setFont("200%");

        new ui.zCanvas("textxModel", 200, 150).root.properties({
           layout : new zebkit.layout.BorderLayout(),
           padding: 4,
           background: null,
           kids : [ l ] 
        });
    });
</script>

<script type="text/javascript">
    zebkit.require("data", "ui", "draw", function(data, ui, draw) {
        var l = new ui.CompList([
            new ui.ImageLabel("List item 1", zebkit.images.bmw, 24),
            new ui.ImageLabel("List item 2", zebkit.images.honda, 24),
            new ui.ImageLabel("List item 3", zebkit.images.saab, 24)
        ]);

        l.properties("/*", {
            "font" : "150%"
        });

        new ui.zCanvas("listModel", 200, 150).root.properties({
           layout : new zebkit.layout.BorderLayout(),
           padding: 0,
           background: null,
           kids : [ l ] 
        });
    });
</script>

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
        }).setFont("150%");

        new ui.zCanvas("treeModel", 200, 150).root.properties({
           layout : new zebkit.layout.BorderLayout(),
           padding: 4,
           kids : { center: t }
        });
    });
</script>

<script type="text/javascript">
    zebkit.require("data", "ui", "ui.grid", function(data, ui, grid) {
        var p = new zebkit.draw.Picture(zebkit.images.bmw,24,24);
        var g = new grid.Grid([
            [p, "Cell 1,2", "Cell 1,3"],
            ["Cell 2,1", p, "Cell 2,3"],
            ["Cell 3,1", "Cell 3,2", p]
        ]);
        g.setUsePsMetric(true);
        g.setCellPadding(8);

        new ui.zCanvas("matrixModel", 220, 150).root.properties({
            layout : new zebkit.layout.FlowLayout("center", "center"),
            padding: 4,
            border: "plain",
            kids : g
        });
    });
</script>





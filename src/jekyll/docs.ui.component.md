---
layout: page
parent: docs
---

## zebkit.ui.Panel

```bash
                zebkit.layout.Layoutable 
                          |
                    zebkit.ui.Panel
                          |
        +-----------------+-----------+--------------+  
        |                             |              |
zebkit.ui.web.HTMLElement      zebkit.ui.Button    Many others
                                                zebkit UI components  
```

Zebkit UI components are instances of __"zebkit.ui.Panel"__ class. The class unifies UI components with common API, events handling, metrics and behavior. __"zebkit.ui.Panel"__ class provides the following main UI component possibilities and features: 

   * __Container__ Panel is a container that can host other zebkit UI components as its child components. The child components are ordered inside the container with a layout manager the container is set. In most cases zebkit UI applications are multi-levels hierarchy of various UI components that are ordered with different layout manages:

```js
    zebkit.require("ui", "layout", function(ui, layout) {
        ...
        // create panel with border layout manager
        var panel = new ui.Panel(new layout.BorderLayout());
        // add button component at the top part of the container
        panel.add("top", new ui.Button("Button"));
        // add text area component to occupy central part of the 
        // container
        panel.add("center", new ui.TextArea("Text area"));
        ...
    });
```

   * __Rendering__ Panel participates in zebkit UI application rendering process. By overriding appropriate panel method(s) - __"paint(g)"__ or/and __"update(g)"__ or/and __"paintOnTop(g)"__ - developers can paint desired visual content using passed 2D graphical context:

```js
    zebkit.require("ui", function(ui) {
        ...
        // instantiate anonymous panel class that implements 
        // "paint(g)" method to draw red circle in the panel 
        var panel = new ui.Panel([
            function paint(g) {
                g.setColor("red");
                g.beginPath();
                g.arc(Math.floor(this.width  / 2),
                      Math.floor(this.height / 2),
                      Math.floor((this.width-1)/2),0,2*Math.PI,false);
                g.closePath();
                g.fill();
            }
        ]);
        ...
    });
```

   * __Input events handling__ Panel is designed to catch number of input events via implementing appropriate events handler methods (__pointerPressed(e)__, __"pointerReleased(e)"__, __"keyPressed(e)"__ and many others).  

```js
    zebkit.require("ui", function(ui) {
        ...
        // Handle pointer entered and exited events
        var panel = new ui.Panel([
            function pointerEntered(e) {
                console.log("Pointer is in the panel");
            },

            function pointerExited(e) {
                console.log("Pointer is out of the panel");
            }
        ]);
        ...
    });
```
   

## Placing UI hierarchy  

Zebkit UI components framework utilizes HTML5 Canvas as a target surface to render UI components hierarchy (theoretically zebkit can be adapted to any Canvas-like surface). The surface is abstracted with __"zebkit.ui.zCanvas"__ class that as any other UI component, inherits __"zebkit.ui.Panel"__. zCanvas is the destination to place an UI hierarchy. To do it follow the steps listed below:

   * __Instantiate "zebkit.ui.zCanvas" class.__ Depending on arguments that have been passed the canvas instance sticks to an existing DOM HTML5 Canvas element or creates a new one in the DOM tree. 
   
   * __Put UI hierarchy into zCanvas "root" layer.__ zCanvas has layered structure. As a container (__zebkit.ui.Panel__) it hosts number if child layers designed for different purposes (showing pop-up, windows, etc). It is expected "root" layer has to be used for placing zebkit UI components hierarchy.

For example: 

```js
zebkit.require("ui", "layout", function(ui, layout) {
    // create HTML Canvas element where zebkit UI to host
    // zebkit UI components hierarchy 
    var htmlCanvas = new ui.zCanvas(500, 400);

    // to place UI components use root layer of 
    // created HTML canvas
    var root = htmlCanvas.root;

    // everything has to be ordered with rules
    // so specify layout manager 
    root.setLayout(new layout.BorderLayout(8));

    // add button zebkit component
    root.add("bottom", new ui.Button("Hello zebkit"));    
    ...
```


## Simple zebkit application  

Find below a simple zebkit application that builds the following UI components hierarchy:

<table>
<tr><td markdown="1">
```bash
# HTML5 Canvas surface
zebkit.ui.zCanvas 
  +-root  # root layer 
     |
     +-zebkit.ui.Panel 
        |   (blue)
        |
        +- zebkit.ui.Label 
        |   ("Test Label")
        |
        +- zebkit.ui.Button 
        |   ("Button")
        |
        +- zebkit.ui.Panel 
            | (orange)
            |
            +-zebkit.ui.TextField
             ("Text Field")
```      
</td><td>
      {% include zsample2.html canvas_id='layoutSample' title='Components hierarchy' description=description %}                
</td></tr>
</table>

<script type="text/javascript">
zebkit.require("ui","layout","draw",function(ui,layout,draw) {
    var root = new ui.zCanvas("layoutSample", 300, 420).root;
    root.properties({
        layout: new layout.BorderLayout(),
        kids  : {
            "center": new ui.Panel({
                border: new draw.Border("white", 2),
                bounds: [10,10, 380, 280],
                background: "#3F76AA",
                kids: [
                    new ui.Label("Test Label").properties({
                        color: "white",
                        font: "bold",
                        bounds: [10, 10, 360, 50]
                    }),
                    new ui.Button("Button").setBounds(10,60,270,50),
                    new ui.Panel({
                        bounds: [10, 120, 280, 270],
                        background: "orange",
                        kids: [
                            new ui.TextField("Text Field")
                            .setBounds(10, 10, 250, 30)
                            .toPreferredHeight()
                            .setBorder(new draw.Border("white"))  
                        ]
                    })
                ]
            })
        }
    });
});
</script>

The application code is shown below:

```js
zebkit.require("ui","layout","draw",function(ui,layout,draw) {
    (new ui.zCanvas("layoutSample", 300, 420)).root.properties({
        layout: new layout.BorderLayout(),
        kids  : {
            "center": new ui.Panel({
                border: new draw.Border("white", 2),
                bounds: [10,10, 380, 280],
                background: "#3F76AA",
                kids: [
                    new ui.Label("Test Label").properties({
                        color: "white",
                        font: "bold",
                        bounds: [10, 10, 360, 50]
                    }),
                    new ui.Button("Button").setBounds(10,60,270,50),
                    new ui.Panel({
                        bounds: [10, 120, 280, 270],
                        background: "orange",
                        kids: [
                            new ui.TextField("Text Field")
                            .setBounds(10, 10, 250, 30)
                            .toPreferredHeight()
                            .setBorder(new draw.Border("white"))  
                        ]
                    })
                ]
            })
        }
    });
});
```

## UI container API

It has been mentioned many times zebkit UI is organized as a multi-level hierarchy of various UI components. To manage the hierarchy UI component API provides the following methods and fields:

<table class="info">
<tr><th>Method or field</th><th>Description</th></tr>

<tr><td markdown="1">
__UI hierarchy fields__:<br/>
_parent_, _kids_
</td><td>
References to a parent component (parent) and array of child components (kids) 
</td></tr>

<tr><td markdown="1">
__Insertion API__:<br/>
_add([constraints],component)_<br/> 
_setAt(index,component)_<br/> 
_setByConstraints(constraints,component)_<br/> 
_insert(index,constraints,component)_
</td><td>
Add, insert, re-set a child component. 
</td></tr>

<tr><td markdown="1">
__Removal API__:<br/> 
_removeAt(index)_<br/>
_remove(comp)_<br/>
_removeAll()_<br/>
_removeMe()_
</td><td> 
Remove child component by child component index, by passed child component instance, all children or the given component.
</td></tr>

<tr><td markdown="1">
__Layout API__:<br/> 
_layout_<br/>
_constraints_<br/>
_byConstraints(ctr)_<br/>
_setLayout(ctr)_
</td><td> 
Setup layout manager, find child components by its constraints.
</td></tr>

</table>

UI component defines a layout manager to order its child components. Layout manager is special class that:

   * inherits **"zebkit.layout.Layout"** interface
        
   * Implement **"calcPreferredSize(comp)"** method to calculate component "pure" preferred size (the size that does not take in account border and padding gaps)
        
   * Implement **"doLayout(comp)"** method that knows how to place child components basing on some rules

Layout manager is mandatory. If an UI component has not defined a layout manager a default one is taken. The default layout manager doesn't have any special rules to order child components. Actually it does nothing, what means defined with a child component size and coordinates ("x", "y", "width", "height") will have effect.

For more details consult "zebkit.ui.Panel" API documentation.

## Traveling over UI components hierarchy

Finding components in an UI hierarchy is implemented with "__byPath(...)__" method that is a part of panel API. The method gets two parameters:   

   * __XPath like__ simplified expression
   * __Call back__ method that is called every time a new component in the traversing hierarchy matches the given expression

The XPath like expression has to satisfy number of requirements:

   * Has to start with one of the following characters combination: 
      * __"."__  to include current component in traversing. "//" or "/" have to follow __"."__.  
      * __"/"__  to include all immediate child components in traversing
      * __"//"__ to include all child components on all levels in traversing
   * Has to define path part after __"/"__ or __"//"__. The path part van be one of the following: 
      * A component class name (e.g. "zebkit.ui.Label") to match components of the specified class
      * A component class name with __"~"__ prefix (e.g. "~zebkit.ui.Label") to match components that are instance of the class 
      * __"*"__ to match any component 
   * Can contain number of path parts delimited with "/" or "//"

Let's imagine we have the following UI hierarchy:

```bash
zcan ("zebkit.ui.zCanvas")
  |
  +-- root ("zebkit.ui.Panel")
       +-- pan1 ("zebkit.ui.Panel")
       |     | 
       |     +-- lab1 ("zebkit.ui.Label")
       |     +-- tf1  ("zebkit.ui.TextField")
       |
       +-- pan2 ("zebkit.ui.Panel")
             | 
             +-- ta1 ("zebkit.ui.TextArea")
             +-- bt1 ("zebkit.ui.Button")  
```

Then examples of path expressions and traversing results are shown in the table below:
<table class="info">
<tr><th>
Path
</th><th>
Result    
</th></tr>

<tr><td markdown="1">
_zcan.byPath("//*", callback)_    
</td><td>
root, pan1, lab1, tf1, pan2, ta1, bt1    
</td></tr>

<tr><td markdown="1">
_zcan.byPath("/*", callback)_   
</td><td>
root    
</td></tr>

<tr><td markdown="1">
_zcan.byPath("./zebkit.ui.Panel", callback)_ 
</td><td>
zcan, root    
</td></tr>

<tr><td markdown="1">
_zcan.byPath("//zebkit.ui.Label", callback)_  
</td><td>
lab1
</td></tr>

<tr><td markdown="1">
_zcan.byPath("//~zebkit.ui.Label", callback)_    
</td><td>
lab1, tf1, ta1<br/>(since tf1 and ta1 are instances<br/>of "zebkit.ui.Label" class)
</td></tr>

<tr><td markdown="1">
_zcan.byPath("/*/*",callback)_    
</td><td>
pan1, pan2
</td></tr>

<tr><td markdown="1">
_pan1.byPath("./*",callback)_
</td><td>
pan1, lab1, tf1
</td></tr>

</table>

It is possible to use id shortcut path to find a component by its id (if the id has been set with __"setId(id)"__ method). The shortcut path expression starts form __"#"__ prefix that precedes an id value: 

```js
// found component in hierarchy by its id 
var foundComp = root.byPath("#test");
```

Optionally path part can include property value filter that defines a property value traversing component have to match:

```js
// find all visible labels component 
root.byPath("//zebkit.ui.Label[@isVisible=true]",function(found) {
    ...
});
```

```js
// find all labels component that defines id property
root.byPath("//zebkit.ui.Label[@id]", function(foundComp) {
    ...
});
```


XPath like expressions can be optionally used with other "zebkit.ui.Panel" API methods:

   * __properties(...)__ to apply the given properties set to UI components that match the passed xpath-like expression:

```js
    // Make visible all child text field components on ll level  
    // for the root  
    root.properties("//zebkit.ui.TextField", { visisble: true });
```

   * __on(...)__ and __off(...)__  to register or un-register events listener handler for UI components that match the passed xpath-like expression:

```js
    // Register listener for all found button components 
    // that are child of the root recursively  
    root.on("//zebkit.ui.Button", function(button) {
        ...
    });
```



## UI Component metrics

![ScreenShot]( {{ site.baseurl }}public/images/comp.metrics.png)

<table class="info">
<tr><th>Metric</th><th>Description</th></tr>

<tr><td>
x,y<br/>
setLocation(x,y) 
</td><td>
component coordinates relatively to its parent component  
</td></tr>

<tr><td>
width,height
<br/>
setSize(w,h)  
</td><td>
component size and component size method setter
</td></tr>

<tr><td>
setBounds(x,y,w,h)    
</td><td>
component bounds (location and size) setter
</td></tr>

<tr><td>
getPreferredSize()<br/>
setPreferredSize(w,h)
</td><td>
the size the component desires to have plus border and padding gaps. The getter method returns result as "{ width:intValue, height:intValue }" data structure. The "pure" preferred size of a component is calculated by its layout manager. Layout manager implements special "calcPreferredSize(comp)" method that does the calculation. The "pure" preferred size does not include border and padding gaps.
</td></tr>

<tr><td>
left,right,top,bottom,<br/>
setPaddings(t,l,r,b)<br/>
setPadding(p)
</td><td>
component paddings and appropriate setters to setup the paddings.
</td></tr>

<tr><td>
getLeft(),getRight()<br/>
getTop(),getBottom()
</td><td>
calculated gaps as amount of padding and border gaps.
</td></tr>

<tr><td>
border.getLeft(),border.getRight()<br/>
border.getTop(),border.getBottom()
</td><td>
border gaps if border is has been defined for the component
</td></tr>

</table>
 
## Component validation

For the sake of performance UI component saves its state to avoid redundant preferred size calculation, repainting and lay outing. The state can be valid or invalid. Developer can check the component state by accessing **"isValid"** boolean property. The following methods allow developers to control a component state:
    
  * **invalidate()** Call to invalidate a component metric and layout.
  * **validate()** Call to validate a component. Validation initiates the following actions:
    * Calculate component metrics (preferred size) if it is in invalid state. Developer can declare **"recalc()"** method in a UI component class that will be called every time the component metric has to be re-calculated. It supposed **"recalc()"** method should calculate some component specific metics that have influence to component preferred size.    
    * Lay outing children component if necessary
    * Call **"validate()"** method for all children component
            
In most cases developers should not care to much about UI component validation and invalidation. Proper invalidation and validation is implemented in particular UI component basing on its specific implementation. UI Component API methods do validation and invalidation when it is necessary. Just use it as is with no extra thought regarding its internal implementation.  

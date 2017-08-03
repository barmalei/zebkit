---
layout: page
parent: docs
---


The key root zebkit UI component is "__zebkit.ui.Panel__". Every zebkit UI component is an instance of "zebkit.ui.Panel" class. This class unifies all existent zebkit components with common API, event handling, metrics and behavior. Even if you instantiate a zebkit HTML component it will be represented as an instance of "zebkit.ui.Panel" class.           

"zebkit.ui.Panel" is container, what means it can embeds other UI components as its children component. The children components are ordered with a alyout manager of the container has set.    

Zebkit UI application is hierarchy of ordered with layout managers UI components that are rendered on HTML5 Canvas. To start building an application layout you have to instantiate zebkit canvas component ("zebkit.ui.zCanvas"). The instance is either bound to existent HTML5 Canvas element or dynamically  creates HTML5 Canvas element in DOM tree:


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


Below is shown simple zebkit application that shows hierarchy of UI components:

<table>
<tr><td markdown="1">
```bash
zebkit.ui.zCanvas
  +-root
     |
     +-zebkit.ui.Panel 
        |   (blue)
        |
        +- zebkit.ui.Label 
        |   ("Test Label")
        |
        +- zebkit.ui.Button 
        |   ("Test Button")
        |
        +- zebkit.ui.Panel 
            | (orange)
            |
            +-zebkit.ui.TextField
             ("Test Text Field")
```      
</td><td>
      {% include zsample2.html canvas_id='layoutSample' title='Components hierarchy' description=description %}                
</td></tr>
</table>


<script type="text/javascript">
zebkit.require("ui", "layout", function(ui, layout) {
    var p = new ui.Panel();
    p.setBorder(new zebkit.draw.Border("white", 2)); 
    p.setBounds(10,10, 380, 280); 
    p.setBackground("#3F76AA");    
                
    var l = new ui.Label("Test Label"); 
    l.setColor("white");
    l.setFont("bold");
    l.setBounds(10, 10, 360, 50); 
    p.add(l);                     
    var b = new ui.Button("Test Button"); 
    b.setBounds(10, 60, 270, 50); 
    p.add(b);                     
    var pp = new ui.Panel();  
    pp.setBounds(10, 120, 280, 250);
    pp.setBackground("orange");     
    p.add(pp);                    

    var tf = new ui.TextField("Test Text Field");
    tf.setBounds(10, 10, 200, 30);
    tf.toPreferredHeight();
    tf.setBorder(new zebkit.draw.Border("white"));
    pp.add(tf);

    new ui.zCanvas("layoutSample", 300, 400)
          .root
          .setLayout(new layout.BorderLayout())
          .add("center", p); 
});
</script>


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
calculated gaps as amount of padding and border sizes.
</td></tr>

<tr><td>
getLeft(),getRight()<br/>
getTop(),getBottom()
</td><td>
border gaps
</td></tr>

</table>
 
## UI Component as a container

Zebra UI components are organized as hierarchy where every top level UI component can have 0 to N children UI components. To keep the hierarchy UI component API provides the following methods and fields:

<table class="info">
<tr><th>Method or field</th><th>Description</th></tr>

<tr><td markdown="1">
_parent_
</td><td>
reference to parent component
</td></tr>

<tr><td markdown="1">
_kids_
</td><td> 
array of children UI components
</td></tr>

<tr><td markdown="1">
_add(component)_
</td><td>
add a new children component
</td></tr>

<tr><td markdown="1">
_add(constraints, component)_
</td><td>
add a new children component with the given constraint
</td></tr>

<tr><td markdown="1">
_set(constraints, component)_
</td><td>
re-set existing children UI component with the given constraints or add new one if there is not a kid with the specified constraints
</td></tr>

<tr><td markdown="1">
_insert(index, constraints, component)_
</td><td>
insert a new kid component at the given index and constraints
</td></tr>

<tr><td markdown="1">
_removeAt(index)_
</td><td> 
remove children component at the given index of "kids" array
</td></tr>

<tr><td markdown="1">
_remove(comp)_
</td><td>
remove the given children component
</td></tr>

<tr><td markdown="1">
_removeAll()_
</td><td>
remove all children components
</td></tr>

</table>

Every UI component defines a layout manager to layout its children components. Layout manager is special class that:

	
  * inherits **"zebkit.layout.Layout"** interface

        
  * Declare **"calcPreferredSize(comp)"** method to calculate component "pure" preferred size (the size that does not take in account border and padding gaps)

        
  * Declare **"doLayout(comp)"** method that knows how to place children components basing on some rules


Layout manager is mandatory. If an UI component has not defined a layout manager a default one is taken. The default layout manager doesn't have any special rules to order children components. Actually it does nothing, what means component bounds ("x", "y", "width", "height") have effect.


## Component validation

For the sake of performance UI component saves its state to avoid redundant preferred size calculation, repainting and lay outing. The state can be valid or invalid. Developer can check the component state by accessing **"isValid"** boolean property. The following methods allow developers to control a component state:
    
  * **invalidate()** Call to invalidate a component metric and layout.

  * **validate()** Call to validate a component. Validation initiates the following actions:
            
    * Calculate component metrics (preferred size) if it is in invalid state. Developer can declare **"recalc()"** method in a UI component class that will be called every time the component metric has to be re-calculated. It supposed **"recalc()"** method should calculate some component specific metics that have influence to component preferred size.
                        
    * Lay outing children component if necessary
    * Call **"validate()"** method for all children component
            

In most cases developers should not care to much about UI component validation and invalidation. Proper invalidation and validation is implemented in particular UI component basing on its specific implementation. UI Component API methods do validation and invalidation when it is necessary. Just use it as is with no extra thought regarding its internal implementation.  

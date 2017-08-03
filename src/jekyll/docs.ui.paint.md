---
author: admin
layout: page
title: Component rendering
---

Every zebkit UI component is fully rendered on (HTML5) Canvas. The rendering is implemented with number of special methods component abstraction provides.  In most cases developers have to follow number of simple rules: 

   * Inherit "zebkit.ui.Panel" class. All UI component have to be successors of basic panel class. 
   * Implement "paint(g)" method that gets 2D context and defines how to paint the custom component with the context.
   * If a component changes its visual state (for instance a property of the component has been updated) inform zebkit engine the component has to be repainted via "repaint()" or "repaint(x,y,w,h)" method call. Pay attention "paint(g)" method never should be called directly. It is up to zebkit engine to call it in proper time with properly prepared 2D context.       

For instance:

```js
zebkit.require("ui", "layout", function(ui, layout) {
    var MyUIComponent = zebkit.Class(ui.Panel, [
        function paint(g) {
            // draw something with the given color
            g.setColor(this.color);
            g.drawLine(...);  
            ...
        },
        // define "color" visual property 
        function setColor(c) {
            this.color = c;
            this.repaint(); // force the component repainting
                            // since its visual state has been 
                            // updated  
        }
    ]);
    ...
})
```

### UI component decorative elements 

Every zebkit UI component has number of predefined decorative elements that can be customized: 

   * __background__. Background of the component that can be set via "setBackground(bg)" method. The method can get a simple color definition: 
      * **hex color** For instance: "#CCFFDD" 
      * **rgb color** For instance: "rgb(100,90,80)" 
      * **rgba color** For instance: "rgba(33,44,55,0.5)" 
      * **a color name** For instance: "blue"
   
   Or it is possible to pass something more complex (instances of "zebkit.draw.View" class) like gradient, pattern, anything what can be rendered.   
   * __border__ 
   * **Children UI components** It could be a good idea to construct UI component from other UI components, since every UI component is a container that layouts its children components.


### UI component rendering actions  

The picture below shows side view of UI component. The rectangular parts express different painted component areas:


[![paintw](http://www.zebkit.com/wp-content/uploads/2013/06/paintw-1024x392.png)](http://www.zebkit.com/wp-content/uploads/2013/06/paintw.png)

The painting process is split to sequence of steps that are demonstrated at the picture above:
	
  * **Step I** Draw component background view if it has been defined for the given UI component. Background view can be clipped by border view. It happens if: border view has been specified and border view implements "outline(...)" method

	
  * **Step II** Draw component border view if it has been defined for the given UI component

	
  * **Step III** If UI component implements "update(...)" method call it to fill background with a custom content. The clipping area is set to full UI component size

	
  * **Step IV** If UI component implements "paint(...)" method call it to render the component "face" content. The clipping area is cut by the the component border gaps and paddings

	
  * **Step V** Recursively paints all children components following the sequence of steps listed above

	
  * **Step VI** If component implements "paintOnTop(...)" method, call it to render necessary decorative elements over component surface and its rendered children components. The clipping area is set to full UI component size

	
  * **Step VII** That is all ! :)


Component rendering customization is quite simple thing. Let's implement step by step al these three methods to draw gray cross on red background marked with white border:

**paint(g)**

Inherit the basic top level "zebra.ui.Panel" UI component class and implement "paint(g)" method that draws gray cross:

<table>
<tr><td>
{% include zsample2.html canvas_id='paintSample1' title='Paint method implementation' description=description %}          
</td>
<td>
{% include zsample2.html canvas_id='paintSample2' title='Update method implementation' description=description %}                    
</td>
<td>
{% include zsample2.html canvas_id='paintSample3' title='Paint on top method implementation' description=description %}                    
</td>
</tr>
</table>



```js
zebkit.require("ui", "layout", function(ui, layout) {
    // inherit "zebkit.ui.Panel" and implement "paint()"
    ui.PaintComponent=zebkit.Class(ui.Panel,[
        function paint(g) {
           g.setColor("lightGray");
           g.fillRect(8,this.height/3,
                      this.width-16,this.height/4);
           g.fillRect(this.width/3,8,
                      this.width/4,this.height-16);
        }
    ]);
    // create canvas and add just developed component
    var c = new ui.zCanvas(150,150);
    c.root.setLayout(new layout.BorderLayout());
    c.root.add("center", new ui.PaintComponent());
});
```


<script>
zebkit.require("ui", "layout", function(ui, layout) {
    var z = new ui.zCanvas("paintSample1", 150, 150);
    var PaintComponent = zebkit.Class(zebkit.ui.Panel,[
        function paint(g) {
           g.setColor("lightGray");
           g.fillRect(8,this.height / 3, this.width - 16, this.height / 4);
           g.fillRect(this.width / 3, 8, this.width / 4, this.height - 16);
        }
    ]);
    // create canvas and add just developed component
    var r = z.root;
    r.setLayout(new layout.BorderLayout());
    r.add("center", new PaintComponent());   

    var z = new ui.zCanvas("paintSample2", 150, 150);
    var UpdateComponent=zebkit.Class(PaintComponent,[
        function update(g) {
           g.setColor("red");
           g.fillRect(0,0,this.width, this.height);
        }
    ]);
    var r = z.root;
    r.setLayout(new layout.BorderLayout());
    r.add("center", new UpdateComponent()); 

    var PaintOnTopComponent = zebkit.Class(UpdateComponent,[
        function paintOnTop(g) {
           g.setColor("white");
           g.lineWidth = 3;
           g.rect(3,3,this.width-6, this.height-6);
           g.stroke();
        }
    ]);
    var c = new ui.zCanvas("paintSample3", 150,150);
    c.root.setLayout(new layout.BorderLayout());
    c.root.add("center",new PaintOnTopComponent());
});
</script>

**update(g)**

Inherit developed on previous step "PaintComponent" class and extend it with "update(g)" method that fills the component background with red color:

```js
zebkit.require("ui", "layout", function(ui, layout) {
    // extend "PaintComponent" class with "update" method
    ui.UpdateComponent=zebra.Class(ui.PaintComponent,[
        function update(g) {
           g.setColor("red");
           g.fillRect(0,0,this.width, this.height);
        }
    ]);
    // create canvas and add just developed component
    var c = new ui.zCanvas(150,150);
    c.root.setLayout(new layout.BorderLayout());
    c.root.add("center", new ui.UpdateComponent());
});
```


**paintOnTop(g)**

Inherit developed on previous step "UpdateComponent" class and extend it with "paintOnTop(g)" method that draws white rectangle over gray cross:

```js
zebkit.require("ui", "layout", function(ui, layout) {
    // extend "UpdateComponent" class with "paintOnTop"
    // method
    ui.PaintOnTopComponent=zebkit.Class(ui.UpdateComponent,[
        function paintOnTop(g) {
           g.setColor("white");
           g.lineWidth = 3;
           g.rect(3,3,this.width-6, this.height-6);
           g.stroke();
        }
    ]);
    // create canvas and add just developed component
    var c = new ui.zCanvas(150,150);
    c.root.setLayout(new layout.BorderLayout());
    c.root.add("center", new ui.PaintOnTopComponent());
});
```


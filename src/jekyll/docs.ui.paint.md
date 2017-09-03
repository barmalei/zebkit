---
parent: docs
layout: page
notitle: true
title: Component rendering
---

## UI hierarchy rendering

Zebkit UI components hierarchy is rendered on (HTML5) Canvas surface. 
Painting procedure starts traversing UI hierarchy (where every UI component is instance of __"zebkit.ui.Panel"__ class) from __zCanvas__ then switches to its child components and so on recursively. For every UI component in rendered hierarchy the painting procedure does the following:

   * __Prepare 2D context__ to be clipped according to the rendered component size and location and the canvas dirty area.
   * __Renders decorative elements__ defined with the component: 
      *  __Border view__  Border can define the component shape, what has side effect to clipping area of provided 2D context.    
      *  __Background view__ It renders withing the shape defined by the component border.
      *  __Call "update(g)"__ method of rendered component if it implements the method.
   * __Call component "paint(g)"__ method if the rendered component implements it. The method gets 2D context that is clipped according to the component shape.
   * __Call component "paintOnTop(g)"__ method if the rendered component implements it. The method gets 2D context that is clipped only according the component size and location.
   * __Traverse and paint recursively__ child components the same manner as it has been described before.

As it has been shown above rendering is localized with zebkit UI component. If a new fancy UI component has to be implemented and the component has to draw an own unique view, then do the following:

   * Inherit __"zebkit.ui.Panel"__ class. All zebkit UI components have to be successors of the basic panel class. 
   * Implement __"paint(g)"__ method (or one of other required paint methods)  that gets 2D context and should define how to paint the custom component with the given 2D context.
   * Place the component to an UI hierarchy  


## Re-painting  

As it has been shown before, zebkit UI component should implement dedicated API paint method or methods to draw desired view. The open question is:  

   * Who is responsible for calling paint methods a component implements ?  

First of all UI components never call implemented paint methods (__"paint(g)"__, __"update(g)"__, __"paintOnTop(g)"__) directly. It is up to zebkit painting procedure to call the methods when it has been requested, at proper time with properly prepared 2D context.

Secondly painting procedure is initiated on-demand. UI components are provided with __"repaint()"__  or __"repaint(z, y, width, height)"__ panel API method that is supposed to request a component re-painting. If a component changes its visual state, the component has to inform zebkit that the component or a part of the component have to be re-painted. To do it the component has to call __"repaint(...)"__ method. For example:

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


## Paint methods implementation

As it has been mentioned before, to customize a component rendering the component can implement one of the following method or its combination:

   * __"paint(...)"__ method is supposed to render the component "face" content. The clipping area is cut by the the component border gaps and component paddings

   * __"update(...)"__ method is supposed to render/fill the component background with a custom content. The clipping area is set to whole UI component size.

   * __"paintOnTop(...)"__ method is supposed to render decorative elements on component surface and its rendered child components. The clipping area is set to whole UI component size


Let's implement step by step all these three methods to draw "gray" cross on "red" background marked with "white" border:

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

## UI component decorative elements 

Zebkit UI component has number of predefined decorative elements that can be customized: 

   * __background__. Background of a component can be set via __"setBackground(bg)"__ method. The method can get a simple color definition or an instance of __"zebkit.draw.View"__ class like image, gradient, pattern anything what can be rendered:
      * **hex color** For instance: "#CCFFDD" 
      * **rgb color** For instance: "rgb(100,90,80)" 
      * **rgba color** For instance: "rgba(33,44,55,0.5)" 
      * **a color name** For instance: "blue"
      * **instance of zebkit.draw.View** 
   
   * __border__. Border of a component can be set via __"setBorder(br)"__ method that expects an instance of __"zebkit.draw.View"__ class as a parameter. There are number ready to use borders views available in zebkit:
      * __"zebkit.draw.Border"__ - standard border view.
      * __"zebkit.draw.RoundBorder"__ - round border view.
      * __"zebkit.draw.Etched"__, __"zebkit.draw.Sunken", __"zebkit.draw.Raised"__ set of windows-like border views.
   
## UI component shape

By default zebkit component is a rectangle with the given width and height. Component shape customization can be done with setting a border view that has to implement __"outline(g,x,y,w,h,d)"__ method. The outline method setups closed path in passed 2D context that defines the shape and returns ```true``` if the context path has to be applied as a shape. 

For instance let's create round zebkit UI component. As the first step let's implement a view that setups round 2D path:

```js
zebkit.require("ui", "draw", "layout", function(ui, draw, layout) {
    var RoundShape = zebkit.Class(draw.View, [
        function outline(g,x,y,w,h,d) {
            if (w === h) {
                g.beginPath();
                g.arc(Math.floor(x + w/2) + (w % 2 === 0 ? 0 : 0.5),
                      Math.floor(y + h/2) + (h % 2 === 0 ? 0 : 0.5),
                      Math.floor((w - 1)/2), 0, 2 * Math.PI, false);
                g.closePath();
            } else {
                g.ovalPath(x,y,w,h);
            }
            return true; // say to apply it as shape
        }
    ]); 
});
```


Then let's use the developed above shape to a component:

```js
zebkit.require("ui", "draw", "layout", function(ui, draw, layout) {
    ...
    var r = new ui.zCanvas("roundShape", 300, 300).root;
    r.setLayout(new layout.BorderLayout());
    r.add(new ui.Panel({
        border: new RoundShape(),  // set shape via border
        background: new draw.Gradient("red", "orange")
    }));
});
```

The result is shown below:

{% include zsample2.html canvas_id='roundShape1' title='Custom shape' description=description %}          

<script type="text/javascript">
zebkit.require("ui", "draw", "layout", function(ui, draw, layout) {
    var RoundShape = zebkit.Class(draw.View, [
        function outline(g,x,y,w,h,d) {
            if (w === h) {
                g.beginPath();
                g.arc(Math.floor(x + w/2) + (w % 2 === 0 ? 0 : 0.5),
                      Math.floor(y + h/2) + (h % 2 === 0 ? 0 : 0.5),
                      Math.floor((w - 1)/2), 0, 2 * Math.PI, false);
                g.closePath();
            } else {
                g.ovalPath(x,y,w,h);
            }
            return true;
        }
    ]); 

    var r = new ui.zCanvas("roundShape1", 300, 300).root;
    r.setLayout(new layout.BorderLayout());
    r.add(new ui.Panel({
        border: new RoundShape(),
        background: new draw.Gradient("red", "orange")
    }));
});
</script> 

If the shaped component needs to handle input events, it is necessary to aware events manager which points belong to the component taking in account its round shape. It has to be done with __"contains(x, y)"__ method implementation. The method returns ```true``` if the given point is inside the component shape. Let's extending our example with possibility to change background color depending where mouse pointer is located:  

```js
zebkit.require("ui", "draw", "layout", function(ui, draw, layout) {
    ...
    r.add(new ui.Panel({
        border: new RoundShape(),
        background: new draw.Gradient("red", "orange")
    }, 
    [
        // say if the given point is inside component
        function contains(x, y) {
            var a = this.width / 2, b = this.height / 2;
            x -= a; y = -y + b;
            return (x * x)/(a * a) + (y * y)/(b * b) <= 1;
        },
        // handle pointer entered event
        function pointerEntered(e) {
            this.setBackground(new draw.Gradient("orange", "blue"));  
        },
        // handle pointer exited event
        function pointerExited(e) {
            this.setBackground(new draw.Gradient("red", "orange"));
        }
    ]));
});
```

The result is shown below:

{% include zsample2.html canvas_id='roundShape2' title='Custom shape' description=description %}          

<script type="text/javascript">  
zebkit.require("ui", "draw", "layout", function(ui, draw, layout) {
    var RoundShape = zebkit.Class(draw.View, [
        function outline(g,x,y,w,h,d) {
            if (w === h) {
                g.beginPath();
                g.arc(Math.floor(x + w/2) + (w % 2 === 0 ? 0 : 0.5),
                      Math.floor(y + h/2) + (h % 2 === 0 ? 0 : 0.5),
                      Math.floor((w - 1)/2), 0, 2 * Math.PI, false);
                g.closePath();
            } else {
                g.ovalPath(x,y,w,h);
            }
            return true;
        }
    ]); 

    var r = new ui.zCanvas("roundShape2", 300, 300).root;
    r.setLayout(new layout.BorderLayout());
    r.add(new ui.Panel({
        border: new RoundShape(),
        background: new draw.Gradient("red", "orange")
    }, 
    [
        function contains(x, y) {
            var a = this.width / 2, b = this.height / 2;
            x -= a;
            y  = -y + b;
            return (x * x)/(a * a) + (y * y)/(b * b) <= 1;
        },

        function pointerEntered(e) {
            this.setBackground(new draw.Gradient("orange", "blue"));  
        },

        function pointerExited(e) {
            this.setBackground(new draw.Gradient("red", "orange"));
        }
    ]));
});
</script> 


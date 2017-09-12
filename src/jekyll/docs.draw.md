---
layout: page
parent: docs
title: Decorative elements
---

<script type="text/javascript">
zebkit.resources("public/images/pattern.png",
                 "public/images/gleb.png", 
                 "public/desc.txt", 
    function(img1, img2, txt) {
        zebkit.ui.imgPattern = img1;
        zebkit.ui.imgGleb    = img2;
        zebkit.ui.wrpTxt     = txt;
    }
);
</script> 

Zebkit supplies __"zebkit.draw"__ package that collects classes and interfaces are responsible for rendering different objects: borders, graphical elements, texts and so on. As soon a developer needs to render a re-usable decorative element it makes sense to implement it basing on the package abstraction.

In general there are two base classes for implementing rendered objects:
	
   * **zebkit.draw.View** Paints a visual element on the provided surface. Developing a new decorative element requires the view class inherits "zebkit.draw.View" class and implements __"paint(g,x,y,w,h,c)"__ method. The method is responsible for painting the visual element on a rectangular surface "(x,y,w,h)" with the given "2D" context "g". For instance let's implement view that shows color board:
  
{% include zsample.html canvas_id='drawView1' title='Random color board view' description=description %}                    

<script type="text/javascript">
zebkit.require("draw","ui", function(draw, ui) {
    var ColorBoardView = new zebkit.Class(draw.View,[
        function paint(g,x,y,w,h,c) {
          var cl = ['#59031A','#5BA68A','#D9C45B','#D95829','#D90404'],
              size = 20, 
              rows = Math.floor(h / size),
              cols = Math.floor(w / size);
          for (var i = 0; i < rows * cols; i++) {
            g.fillStyle = cl [Math.floor(Math.random() * cl.length)];
            g.fillRect((i % cols) * size, 
                        Math.floor(i / cols) * size, size, size);
          }
      }
    ]);

    var canvas = new ui.zCanvas("drawView1", 301,251);
    canvas.root.setBackground(new ColorBoardView());
});
</script>

```js
zebkit.require("draw","ui", function(draw, ui) {
    var ColorBoardView = new zebkit.Class(draw.View,[
        // implement "paint" method
        function paint(g,x,y,w,h,c) {
            var cl =['#59031A','#5BA68A','#D9C45B',
                     '#D95829','#D90404', '#FFCCDD'],
                size = 20, 
                rows = Math.floor(h / size),
                cols = Math.floor(w / size);
            for (var i = 0; i < rows * cols; i++) {
                g.fillStyle= cl[Math.floor(Math.random()*cl.length)];
                g.fillRect((i % cols) * size, 
                           Math.floor(i / cols) * size, size, size);
             }
        }
    ]);
    // create canvas
    var canvas = new ui.zCanvas();
    // instantiate and set the implemented view as, for instance,
    // the canvas root UI component background
    canvas.root.setBackground(new ColorBoardView());
});
```

	
   * **zebkit.draw.Render** Render class is successor of "zebkit.draw.View" class that is designed to render or visualize the given target object (for instance text, image etc). From the implementation point of view it is close to "zebkit.draw.View" classes: you also should implement __"paint(g,x,y,w,h,c)"__ method, but the method has to render a "target" object on the given rectangular surface. For instance, let's implement render that draw the given function (target object): 

{% include zsample.html canvas_id='drawView2' title='Draw target fiction for the given interval' description=description %}                    

<script type="text/javascript">
  zebkit.require("draw", "ui",function(draw, ui) {
    var FunctionRender = zebkit.Class(draw.Render, [
        function(fn, x1, x2) {
            this.$super(fn);
            this.x1 = x1; this.x2 = x2;
        },

        function paint(g,x,y,w,h,c) {
            var fy = [], dx =(this.x2 - this.x1)/200,
                maxy = -1000000, miny = 1000000;
            for(var x = this.x1, i = 0; x < this.x2; x += dx, i++) {
                fy[i] = this.target(x);
                if (fy[i] > maxy) maxy = fy[i];
                if (fy[i] < miny) miny = fy[i];
            }
            var cx = (w - 8)/(this.x2 - this.x1), cy = (h - 8)/(maxy - miny),
                t  = function (xy, ct) { return ct * xy; };
            g.beginPath();
            g.setColor("red");
            g.lineWidth = 4;
            g.moveTo(4, 4 + t(fy[0] - miny, cy));
            for(var x=this.x1+dx,i=1;i<fy.length;x+=dx,i++) {
                g.lineTo(4+t(x - this.x1, cx),4+t(fy[i]-miny, cy));
            }
            g.stroke();
        }
    ]);
    var canvas = new ui.zCanvas("drawView2", 400, 200);
    canvas.root.setBackground(new FunctionRender(function(x) {
        return Math.cos(x) * Math.sin(x) - 2 * Math.sin(x*x);
    }, -2, 5));
});
</script>


```js
  zebkit.require("draw", "ui",function(draw, ui) {
    var FunctionRender = zebkit.Class(draw.Render, [
        function(fn, x1, x2) { // fn is target rendered object
            this.$super(fn);
            this.x1 = x1;  // start x
            this.x2 = x2;  // end   x
        },

        function paint(g,x,y,w,h,c) {
          var fy=[],dx=(this.x2-this.x1)/200,my=-1000000,mny=1000000;
          // calculate function values for the given range and 
          // the function minimal and maximal values 
          for(var x = this.x1,i = 0; x < this.x2; x+= dx,i++) {
              fy[i] = this.target(x); // call target function 
              if (fy[i] > my) my = fy[i];
              if (fy[i] < mny) mny = fy[i];
          }
          var cx = (w - 8) / (this.x2 - this.x1), 
              cy = (h - 8) / (maxy - miny);
          g.beginPath();
          g.setColor("red");
          g.lineWidth = 4;
          g.moveTo(4, 4 + (fy[0] - miny) * cy);
          for(var vx = dx, i = 1; i < fy.length; vx += dx, i++) {
              g.lineTo(4 + vx * cx),
                       4 + (fy[i] - miny) * cy));
          }
          g.stroke();
        }
    ]);
    var canvas = new ui.zCanvas(400, 200);
    // implemented render as, the canvas root background
    canvas.root.setBackground(new FunctionRender(function(x) {
        return Math.cos(x) * Math.sin(x) - 2 * Math.sin(x*x);
    }, -2, 5));
});
```


## Standard views and renders

Zebkit provides rich set of various predefined views and renders. 

### Border view (zebkit.draw.Border)

Border view allows developers to render borders of with the given color, size and radius. 

{% include zsample.html canvas_id='borderView1' title='Border view variations' description=description %}                    

<script type="text/javascript">
zebkit.require("draw","ui", "layout", function(draw, ui, lay) {
    var canvas = new ui.zCanvas("borderView1", 600, 200);
    canvas.root.setLayout(new lay.FlowLayout(32));

    canvas.root.add(new ui.Panel().setBorder(new draw.Border("red", 4))).setPreferredSize(150, 150);    
    canvas.root.add(new ui.Panel().setBorder(new draw.Border("orange", 4, 16))).setPreferredSize(150, 150);    ;   
    canvas.root.add(new ui.Panel().setBorder(new draw.Border("red", 1))).setPreferredSize(150, 150);    ;    
});
</script>

Developers can specify which parts ("top", "left", "right", "bottom") of a border have to be painted: 

{% include zsample.html canvas_id='borderView2' title='Partially rendered border view' description=description %}                    

<script type="text/javascript">
zebkit.require("draw","ui", "layout", function(draw, ui, lay) {
    var canvas = new ui.zCanvas("borderView2", 600, 200);
    canvas.root.setLayout(new lay.FlowLayout(32));

    var br = new draw.Border("red", 4);
    br.setSides("top", "bottom");
    canvas.root.add(new ui.Panel()).setBorder(br).setPreferredSize(150, 150);  

    var br = new draw.Border("red", 4);
    br.setSides("left", "right");
    canvas.root.add(new ui.Panel()).setBorder(br).setPreferredSize(150, 150);  

    var br = new draw.Border("red", 4);
    br.setSides("top", "right");
    canvas.root.add(new ui.Panel()).setBorder(br).setPreferredSize(150, 150);  
});
</script>

### Round border view (zebkit.draw.RoundBorder)

Round border view allows developer to render round or oval views and also shape UI components with the view. 

{% include zsample.html canvas_id='roundView1' title='Round border view variations' description=description %}                    

<script type="text/javascript">
zebkit.require("draw","ui", "layout", function(draw, ui, lay) {
    var canvas = new ui.zCanvas("roundView1", 600, 200);
    canvas.root.setLayout(new lay.FlowLayout(32));

    var br = new draw.RoundBorder("red", 4);
    canvas.root.add(new ui.Panel()).setBorder(br).setPreferredSize(150, 150);  

    var br = new draw.RoundBorder("orange", 1);
    canvas.root.add(new ui.Panel()).setBorder(br).setPreferredSize(150, 200);  

    var br = new draw.RoundBorder("red", 4);
    canvas.root.add(new ui.Panel()).setBorder(br).setPreferredSize(200, 150);  
});
</script>

```js
zebkit.require("draw","ui", "layout", function(draw, ui, lay) {
    var canvas = new ui.zCanvas("roundView1", 600, 200);
    canvas.root.setLayout(new lay.FlowLayout(32));

    var br = new draw.RoundBorder("red", 4);
    canvas.root.add(new ui.Panel()).setBorder(br).setPreferredSize(150, 150);  

    var br = new draw.RoundBorder("orange", 1);
    canvas.root.add(new ui.Panel()).setBorder(br).setPreferredSize(150, 200);  

    var br = new draw.RoundBorder("red", 4);
    canvas.root.add(new ui.Panel()).setBorder(br).setPreferredSize(200, 150);  
});
```

### Classic border views 

Set of old-style, windows-like borders views ("zebkit.draw.Sunken", "zebkit.draw.Raised", "zebkit.draw.Etched", "zebkit.draw.Dotted"). 

{% include zsample.html canvas_id='classicBorder1' title='Classic, old-style borders views' description=description %}                    

<script type="text/javascript">
zebkit.require("draw","ui", "layout", function(draw, ui, lay) {
    var canvas = new ui.zCanvas("classicBorder1", 300, 300);
    canvas.root.setLayout(new lay.BorderLayout());
    canvas.setBackground("lightGray");
    canvas.setPadding(8);

    canvas.root.add(new ui.Panel({
        padding: 8,
        layout : new lay.BorderLayout(),
        border : new draw.Sunken(),
        kids   : {
          center: new ui.Panel({
            padding: 15,
            layout : new lay.BorderLayout(),
            border : new draw.Raised(),
            kids   : {
              center: new ui.Panel({
                padding: 15,
                layout : new lay.BorderLayout(),
                border : new draw.Etched(),
                kids   : {
                  center: new ui.Panel({
                    padding: 15,
                    layout : new lay.BorderLayout(),
                    border : new draw.Dotted(),
                  })
                }
              })
            }
          })
        }
    }));
});
</script>


### Gradient (zebkit.draw.Gradient, zebkit.draw.Radial)

Zebkit supplies views for vertical, horizontal and radial gradients rendering.

{% include zsample.html canvas_id='gradientView1' title='Gradient views' description=description %}                    

<script type="text/javascript">
zebkit.require("draw","ui","layout", function(draw, ui, lay) {
    var c = new ui.zCanvas("gradientView1", 600, 200);
    c.root.setLayout(new lay.FlowLayout(32));

    var gr = new draw.Gradient("red", "orange");
    c.root.add(new ui.Panel()).setBackground(gr).setPreferredSize(150, 150);  

    var gr = new draw.Gradient("red", "orange", "horizontal");
    c.root.add(new ui.Panel()).setBackground(gr).setPreferredSize(150, 150);  

    var gr = new draw.Radial("yellow", "red");
    c.root.add(new ui.Panel()).setBackground(gr).setPreferredSize(150, 150);  
});
</script>

```js
zebkit.require("draw","ui","layout", function(draw, ui, lay) {
    var c = new ui.zCanvas("gradientView1", 600, 200);
    c.root.setLayout(new lay.FlowLayout(32));

    var gr = new draw.Gradient("red", "orange");
    c.root.add(new ui.Panel()).setBackground(gr).setPreferredSize(150, 150);  

    var gr = new draw.Gradient("red", "orange", "horizontal");
    c.root.add(new ui.Panel()).setBackground(gr).setPreferredSize(150, 150);  

    var gr = new draw.Radial("yellow", "red");
    c.root.add(new ui.Panel()).setBackground(gr).setPreferredSize(150, 150);  
});
```

### Pattern (zebkit.draw.Pattern)

Pattern render paints the given picture repeatedly on the given area. 

{% include zsample.html canvas_id='patternView1' title='Pattern render' description=description %}                    

<script type="text/javascript">
  zebkit.require("draw","ui",function(draw, ui) {
      var c = new ui.zCanvas("patternView1", 300, 320);
      c.root.setBackground(new draw.Pattern(ui.imgPattern));
  });
</script>

```js
  zebkit.require("draw","ui",function(draw, ui) {
      var c = new ui.zCanvas("patternView1", 300, 320);
      // pass Image to be used as a pattern 
      c.root.setBackground(new draw.Pattern(img)); 
  });
```

### Picture (zebkit.draw.Picture)

Picture rendering. 

{% include zsample.html canvas_id='pictureView1' title='Picture render' description=description %}                    

<script type="text/javascript">
zebkit.require("draw","ui",function(draw, ui) {
    var c = new ui.zCanvas("pictureView1", 300, 380);
    c.root.setBackground(new draw.Picture(ui.imgGleb));
});
</script>

```js
zebkit.require("draw","ui",function(draw, ui) {
    var c = new ui.zCanvas("pictureView1", 300, 380);
    // pass Image as a target 
    c.root.setBackground(new draw.Picture(img));
});
```

### Composite views (zebkit.draw.CompositeView)

Composite view is supposed to be used to combine number of the specified views together. Below you can see composition from two views: picture and custom "Moustache" view:

{% include zsample.html canvas_id='compositeView1' title='Composite view' description=description %}                    

<script type="text/javascript">

zebkit.require("draw","ui","layout",function(draw, ui, lay) {
    var c = new ui.zCanvas("compositeView1", 300, 370);
    var Moustache = new zebkit.Class(draw.View, [
        function paint(g,x,y,w,h,c) {
            g.setColor("rgba(0,0,0,0.3)");
            g.drawLine(w/2 -15, h - h/4, w/2 + 40, h - h/4 + 5, 2);
            g.drawLine(w/2 - 10, h - h/4 + 10, w/2 + 40, h - h/4 + 5, 3);
            g.drawLine(w/2,      h - h/4 + 20, w/2 + 40, h - h/4 + 5, 2);

            g.drawLine(w/2 + 60, h - h/4 + 5, w/2 + 95, h - h/4 - 5, 2);
            g.drawLine(w/2 + 60, h - h/4 + 5, w/2 + 100, h - h/4 + 5, 2);
            g.drawLine(w/2 + 60, h - h/4 + 5, w/2 + 90, h - h/4 + 15, 3);
          }
        ]);

    var comp = new draw.CompositeView(new draw.Picture(ui.imgGleb), 
                                      new Moustache());
    c.root.setBackground(comp);
});
</script>

```js
zebkit.require("draw","ui","layout",function(draw, ui, lay) {
    var c = new ui.zCanvas("compositeView1", 300, 370);
    // implement moustache view 
    var Moustache = new zebkit.Class(draw.View, [
        function paint(g,x,y,w,h,c) {
            g.setColor("rgba(0,0,0,0.3)");
            g.drawLine(w/2-15, h-h/4, w/2+40, h-h/4+5, 2);
            g.drawLine(w/2-10, h-h/4+10, w/2+40, h-h/4+5, 3);
            g.drawLine(w/2, h-h/4+20, w/2+40, h-h/4 + 5, 2);

            g.drawLine(w/2+60, h-h/4+5, w/2+95, h-h/4-5, 2);
            g.drawLine(w/2+60, h-h/4+5, w/2+100, h-h/4+5, 2);
            g.drawLine(w/2+60, h-h/4+5, w/2+90, h-h/4+15, 3);
          }
        ]);

    // combine moustache and picture view
    var comp = new draw.CompositeView(new draw.Picture(img), 
                                      new Moustache());
    c.root.setBackground(comp);
});
```

### Text (zebkit.draw.TextRender, zebkit.draw.StringRender, etc)

Zebkit supplies different kind of text renders: simple single line text render, multi-lines text render, decorated (underlined, crossed) text render, wrapped text render. The renders e=are widely utilized with zebkit UI components.

{% include zsample.html canvas_id='textView1' title='Text renders' description=description %}                    

<script type="text/javascript">
zebkit.require("draw","ui","layout",function(draw, ui, lay) {
    var c = new ui.zCanvas("textView1", 700, 300);
    c.root.setLayout(new lay.FlowLayout(48));

    c.root.add(new ui.ViewPan()
          .setView(new draw.StringRender("String render")
          .setFont("30px")));

    c.root.add(new ui.ViewPan()
          .setView(new draw.TextRender("Text\nrender\ncan show\nmulti-line string")
          .setColor("green")  
          .setFont("30px")));


    c.root.add(new ui.ViewPan()
          .setView(new draw.DecoratedTextRender("Decorated\ntext")
          .setDecorations("underline")
          .setColor("green").setFont("30px")));
});
</script>

Wrapped text render:

{% include zsample.html canvas_id='textView2' title='Wrapped text render' description=description %}                    

<script type="text/javascript">
zebkit.require("draw","ui","layout",function(draw, ui, lay) {
    var c  = new ui.zCanvas("textView2", 600, 450),
        tf = new ui.Label(new draw.WrappedTextRender(ui.wrpTxt));
    
    tf.setFont("20px");
    c.root.setBorder("plain");
    c.root.add(new zebkit.ui.design.ShaperPan(tf))
    .setBounds(50, 50, 300,300);          
});
</script>


### Arrow view (zebkit.draw.ArrowView)

View to render arrows.

{% include zsample.html canvas_id='arrowView1' title='Arrow views' description=description %}                    

<script type="text/javascript">
zebkit.require("draw","ui","layout",function(draw, ui, lay) {
    var c = new ui.zCanvas("arrowView1", 300, 300);
    c.root.setLayout(new lay.BorderLayout(16));

    draw.ArrowView.prototype.color = "orange";

    c.root.add("left",new ui.ViewPan().setView(new draw.ArrowView("left")))
    .setPreferredSize(40, -1);
    c.root.add("top",new ui.ViewPan().setView(new draw.ArrowView("top")))
    .setPreferredSize(-1, 40);
    c.root.add("right",new ui.ViewPan().setView(new draw.ArrowView("right")))
    .setPreferredSize(40, -1);
    c.root.add("bottom",new ui.ViewPan().setView(new draw.ArrowView("bottom")))
    .setPreferredSize(-1, 40);

});
</script>

### View set (zebkit.draw.ViewSet)

View set is special type of container view that hosts set of views identified by its ids. The view set renders only one from the passed set of view that is called active view.

{% include zsample.html canvas_id='setView1' title='View set' description=description %}                    

<script type="text/javascript">
zebkit.require("draw","ui","layout",function(draw, ui, lay) {
    var c = new ui.zCanvas("setView1", 300, 300);
    c.root.setLayout(new lay.BorderLayout(8));

    var pan = new ui.ViewPan().setBackground(new draw.ViewSet({
        "Pattern"  : new draw.Pattern(ui.imgPattern),
        "+Gradient" : new draw.Gradient("red", "green"),
        "Color"   : "#44AAff"
    })).setBorder("plain");

    c.root.add(pan);
    c.root.add("top", new ui.Combo(["Pattern",
                                    "Gradient",
                                    "Color"]).setValue("Color")).on(
        function(src) { 
            pan.bg.activate(src.getValue());
            pan.repaint();
        }
    );
});
</script>

```js
zebkit.require("draw","ui","layout",function(draw, ui, lay) {
    var c = new ui.zCanvas("setView1", 300, 300);
    c.root.setLayout(new lay.BorderLayout(8));
    // set view set as a background view
    var pan = new ui.ViewPan().setBackground(new draw.ViewSet({
        "Pattern"  : new draw.Pattern(ui.imgPattern),
        "Gradient" : new draw.Gradient("red", "green"),
        "+Color"   : "#44AAff"  // active view
    })).setBorder("plain");

    c.root.add(pan);
    c.root.add("top", new ui.Combo(["Pattern",
                                    "Gradient",
                                    "Color"]).setValue("Color")).on(
        function(src) { 
            // handle combo selection event to switch view in the set
            pan.bg.activate(src.getValue());
            pan.repaint();
        }
    );
});
```


## Define view shape

View can define a shape by implementing "outline(g,x,y,w,h,c)" method. This method has to build a path with passed 2D context and return true if the path has to be applied as a shape for a zebkit UI component. To apply the view shape to a zebkit UI component set the view as the component border. 

For instance, let's create a component with a cloud-like shape:

{% include zsample.html canvas_id='shapeView1' title='Shaped with the view UI component' description=description %}                    

<script type="text/javascript">
zebkit.require("draw","ui",function(draw, ui) {
    var c = new ui.zCanvas("shapeView1", 400, 300);
    var Cloud = zebkit.Class(zebkit.draw.Shape, [
        function outline(g,x,y,w,h,d) {
            g.beginPath();
            g.moveTo(x+w * 0.2, y+h * 0.25);
            g.bezierCurveTo(x,y+h*0.25,x,y+h*0.75,x+w*0.2,y+h*0.75);
            g.bezierCurveTo(x+0.1*w,y+h-1,x+0.8*w,y+h-1,x+w*0.7,y+h*0.75);
            g.bezierCurveTo(x+w-1,y+h*0.75,x+w-1,y,x+w*0.65,y+h*0.25);
            g.bezierCurveTo(x+w-1,y,x+w*0.1,y,x+w*0.2,y+h*0.25);
            g.closePath();
            return true;
        }
    ]);
    c.root.setBorder(new Cloud());
    c.root.setBackground("#2dd3FF");
});
</script>

The code below implements and sets the cloud shape to a root component: 

```js
zebkit.require("draw", "ui", function(draw, ui) {
    var c = new ui.zCanvas("shapeView1", 400, 300);
    // let's create shape view
    var Cloud = zebkit.Class(zebkit.draw.Shape, [
      function outline(g,x,y,w,h,d) {
        g.beginPath();
        g.moveTo(x+w * 0.2, y + h * 0.25);
        g.bezierCurveTo(x,y+h*0.25,x,y+h*0.75,x+w*0.2,y+h*0.75);
        g.bezierCurveTo(x+0.1*w,y+h-1,x+0.8*w,y+h-1,x+w*0.7,y+h*0.75);
        g.bezierCurveTo(x+w-1,y+h*0.75,x+w-1,y,x+w*0.65,y+h*0.25);
        g.bezierCurveTo(x+w-1,y,x+w*0.1,y,x+w*0.2,y + h * 0.25);
        g.closePath();
        return true; // say to clip a component shape with the path  
      }
    ]);
    // apply the shape to root UI component   
    c.root.setBorder(new Cloud());
    // set background the shaped component has to be filled with
    c.root.setBackground("#2dd3FF");
});
```


## View metrics

__view preferred size__

Views and renders are supposed to be widely used as various decorative elements of zebkit UI components. Since UI components are ordered with layout managers it is required to know its preferred size. Views and renders can have influence to calculation of preferred size, so knowing a preferred size the given render of view wants to have also is important.   

To let know which preferred size the given view wants to have implement "getPreferredSize" method. The expected outcome of the method is { width:intValue, height:intValue } structure:  


```js
    var MyView = zebkit.Class(zebkit.draw.View, [
        function paint(g,x,y,w,h,c) {
            ... // paint something
        }, 
        // tell the size the view wants to have
        function getPreferredSize() {
           return { width: 100, height: 20 };
        }
    ]);
```


__view gaps__

View gaps are important what the given view or render is going to be used as a border view for an UI component. In this case the gaps the given view provides adds extra paddings to the UI component metrics. View gaps have to be defined by implementing "getLeft()", "getRight()", "getBottom()", "getTop()" method or methods:

```js
    var MyView = zebkit.Class(zebkit.draw.View, [
        function paint(g,x,y,w,h,c) {
            ... // paint something
        },
        // get top gap
        function getTop() {
           return 10;
        }
    ]);
```





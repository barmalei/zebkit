---
layout: page
parent: docs
title: UI layouts
---

User interface has to be adjustable and adaptive to an environment and a hardware where it can be shown. To avoid potential UI layouting problems developers should not positioning and sizing UI components by assigning dedicated (x,y) coordinates and (width,height). 

Layout managers is well known solution to get adaptive UI that helps developing adjustable UI layout. Layout manager doesn't trust fixed UI components positions and sizes. It uses rules-based manner to order UI components. Layout manager "knows" two important things:

  * How to order UI children components
  
  * How to compute the component preferred size basing on its children components hierarchy

In zebkit layout manager usage looks something like below:

```js
...
var pan = new zebkit.ui.Panel();
// set layout manager
pan.setLayout(new zebkit.layout.BorderLayout()) 
...
// border layout manager understand number of children components 
// alignments (top, center, left, etc). let's add a component at 
// the top of panel
pan.add("top", new zebkit.ui.Button("Ok"));
...
```

Zebkit is supplied with number ready-to-use layout managers. In most cases they are enough for building UI application.    

### Raster Layout

The layout manager orders children components basing on its exact locations and sizes that are set via "setLocation(x, y)", "setSize(w,h)" or "setBounds(x, y, w, h)" methods. But also the manager can use preferred sizes and custom vertical and horizontal alignments to place the children components.    

{% include zsample.html canvas_id='rasterLayout1' title='Raster layout' %}

```js
zebkit.require("ui","layout",function(ui, lay) {
    var r = new ui.zCanvas().root;
    // raster layout that size components according to 
    // its preferred size
    r.setLayout(new lay.RasterLayout(true));

    // add children UI components with different constraints
    r.add("center", new ui.Button("Center,\npreferred Sized"));
    r.add("bottomLeft",new ui.Button("BottomLeft,\npreferred sized"));
    r.add("topRight",new ui.Button("TopRight,\npreferred sized"));
});
```

### Stack Layout

This the most simple layout manager that place children components on top of each other stretching (or using preferred size) its to fill all available parent component space.

{% include zsample.html canvas_id='stackLayout1' title='Raster layout' %}


```js
zebkit.require("ui","layout",function(ui, lay) {
    var r = new ui.zCanvas().root;
    // setup stack layout
    r.setLayout(new lay.StackLayout());

    // add children component stretched vertically and 
    // horizontally over the whole parent component area
    r.add(new ui.Button("Stretched\n\n\n\n button"));

    // add children component sized according its 
    // preferred size
    r.add("usePsSize", new ui.Button("Ok"));
});
```


### Border Layout

The layout manager splits container area into five logical areas: "left", "right", "top", "bottom", "center". Children component cab be added to occupy one of the listed above logical area:   

{% include zsample.html canvas_id='layoutSample1' title='Border layout' %}

```js
zebkit.require("ui","layout",function(ui, lay) {
    var r = new ui.zCanvas().root;
    // set border layout manager
    r.setLayout(new lay.BorderLayout());

    // add children UI components with different constraints
    r.add("center", new ui.Button("CENTER"));
    r.add("left",   new ui.Button("LEFT"));
    r.add("right",  new ui.Button("RIGHT"));
    r.add("top",    new ui.Button("TOP"));
    r.add("bottom", new ui.Button("BOTTOM"));
});
```


### List layout

List layout manager treats children components as sequence of list items ordered vertically. The items can be either aligned horizontally or stretched to occupy the whole available horizontal space.     

{% include zsample.html canvas_id='layoutSample2' title='List layout' %}

```js
zebkit.require("ui","layout", function(ui, layout) {
    var r = new ui.zCanvas().root;
    // set list layout manager that orders components as list 
    // item and stretches children horizontally
    r.setLayout(new layout.ListLayout());

    // add children components
    r.add(new ui.Button("Stretched Item 1"));
    r.add(new ui.Button("Stretched Item 1"));
    r.add(new ui.Button("Stretched Item 1"));
});
```


### Percentage layout

This layout manager orders children components vertically or horizontally according to requested in percents height or width. 

{% include zsample.html canvas_id='layoutSample3' title='Percentage layout' %}

```js
zebkit.require("ui","layout",function(ui, lay) {
    var r = new ui.zCanvas().root;
    // set percent layout manager that stretches components 
    // vertically and sizes component horizontally according 
    // to its percentage constraints
    r.setLayout(new lay.PercentLayout());

    // add button that takes 20% of horizontal space
    r.add(20, new ui.Button("20%"));
    // add button that takes 30% of horizontal space
    r.add(30, new ui.Button("30%"));
    // add button that takes 50% of horizontal space
    r.add(50, new ui.Button("50%"));
});
```


### Flow layout

Flow layout manager orders children components vertically or horizontally according to its preferred size. Additionally the ordered components can be aligned vertically  ("top", "bottom", "center") and horizontally ("left", "right", "center").  

{% include zsample.html canvas_id='layoutSample4' title='Flow layout' %}

```js
zebkit.require("ui","layout", function(ui, lay) {
    var r = new ui.zCanvas().root;

    // set flow layout with vertical components ordering and center 
    // vertical and horizontal alignments
    r.setLayout(new lay.FlowLayout("center","center","vertical",2));

    // add children components
    r.add(new ui.Button("VCentered"));
    r.add(new ui.Button("VCentered"));
    r.add(new ui.Button("VCentered"));
});
```

### Grid layout

Grid layout splits container area to number of logical cells where children components have to be placed. Every children component can have specified constraints that says how the component has to be aligned inside the virtual cell (vertical alignment, horizontal alignment, stretching).  

{% include zsample.html canvas_id='layoutSample5' title='Grid layout' %}

```js
zebkit.require("ui","layout", function(ui, layout) {
    var r = new ui.zCanvas().root;
    // create layout that splits a container area 
    // into four virtual cells (2 rows, and 2 columns)  
    r.setLayout(new layout.GridLayout(2,2));

    // add children components
    r.add(new ui.Button("1x1"));
    r.add(new ui.Button("1x2"));
    r.add(new ui.Button("2x1"));
    r.add(new ui.Button("2x2"));
});
```


### Custom layout manager

If existent layout managers are not enough it is not a big deal to implement a custom one. To do it inherit "zebkit.layout.Layout" interface and implement the following two methods:

   * **"calcPreferredSize(target)"** The method has to calculate a target component preferred size basing on its content (usually preferred size of its children component). 
   * **"doLayout(target)"** The method orders the target container children components basing on specific rules the manager implements.

Let's develop layout manager that orders components along parent component diagonal:

```js
zebkit.package("ui.demo", function(pkg, Class) {
   // declare layout manager class
   pkg.DiagLayout = Class(zebkit.layout.Layout,[
       // preferred size target component wants to have is calculated 
       // as sum of preferred sizes of children components
       function calcPreferredSize(target) {
          var psW = 0, psH = 0;
          for(var i=0; i < target.kids.length; i++) {
              var kid = target.kids[i];
              if (kid.isVisible) {
                  var ps = kid.getPreferredSize();
                  psW += ps.width;
                  psH += ps.height;
              }
          }
          return { width:psW, height:psH };
       },
       // define rules how children components of the
       // given "target" have to be ordered
       function doLayout(target) {
          var x = target.getTop(), y = target.getLeft();
          for(var i=0; i < target.kids.length; i++) {
              var kid = target.kids[i];
              if (kid.isVisible) {
                  var ps = kid.getPreferredSize();
                  kid.setBounds(x, y, ps.width, ps.height);
                  x += ps.width;
                  y += ps.height;
              }
          }
       }
   ]);
});
```

<script type="text/javascript">
zebkit.package("ui.demo", function(pkg, Class) {
     pkg.DiagLayout = Class(zebkit.layout.Layout,[
         function calcPreferredSize(target) {
            var psW = 0, psH = 0;
            for(var i=0; i < target.kids.length; i++) {
                var kid = target.kids[i];
                if (kid.isVisible) {
                    var ps = kid.getPreferredSize();
                    psW += ps.width; psH += ps.height;
                }
            }
            return { width:psW, height:psH };
         },
         function doLayout(target) {
            var x = target.getTop(), y = target.getLeft();
            for(var i=0; i < target.kids.length; i++) {
                var kid = target.kids[i];
                if (kid.isVisible) {
                    var ps = kid.getPreferredSize();
                    kid.setBounds(x, y, ps.width, ps.height);
                    x += ps.width; y += ps.height;
                }
            }
         }
     ]);
 });
</script>

Use the developed diagonal layout manager as follow:

{% include zsample2.html canvas_id='layoutSampleDiag' title='Custom diagonal layout' description=description %}       


```js
zebkit.require("ui", "ui.demo", function(ui, demo) {
     var r = new ui.zCanvas().root;
     r.setPadding(8);
     r.setBorder("plain");
     // set developed above diagonal layout manager
     r.setLayout(new demo.DiagLayout());
     // add children components
     r.add(new ui.Button("One ..."));
     r.add(new ui.Button("Two ..."));
     r.add(new ui.Button("Three ..."));
});
```


<script type="text/javascript">
   zebkit.require("ui", "ui.demo", function(ui, demo) {
       var r = new ui.zCanvas("layoutSampleDiag", 250,145).root;
       r.setBorder("plain");
       r.setPadding(8);
       r.setLayout(new demo.DiagLayout());
       r.add(new ui.Button("One ..."));
       r.add(new ui.Button("Two ..."));
       r.add(new ui.Button("Three ..."));
   });
</script>


<script type='text/javascript'>
zebkit.require("ui", "layout", function(ui, lay) {
    var PAN = zebkit.Class(ui.Panel, []);
    PAN.padding = 8;
    PAN.border = "plain";

    // raster layout
    var r = new ui.zCanvas("rasterLayout1",700,500).root;
    r.setLayout(new lay.GridLayout(2, 2).setPadding(8));
    r.add(new PAN({
        layout: new lay.RasterLayout(),
        kids: [
            new ui.Button("(10,10,140,40)").setBounds(10,10,140,40),
            new ui.Button("(10,120,99,50)").setBounds(10,120,99,50)
        ]
    }).setPreferredSize(300, -1));

    r.add(new PAN({
        layout: new lay.RasterLayout(true),
        kids: [
            new ui.Button("(10,10) Preferred Sized").setLocation(10,10),
            new ui.Button("(30,100)\nPreferred sized").setLocation(30,100)
        ]
    }).setPreferredSize(300, -1));

    r.add(new PAN({
      layout: new lay.RasterLayout(true),
      kids: {
        center    :new ui.Button("Center\npreferred Sized"),
        bottomLeft:new ui.Button("BottomLeft,\npreferred sized"),
        topRight  :new ui.Button("TopRight,\npreferred sized")
      }
    }).setPreferredSize(300, 250));

    // stack layout
    var r = new ui.zCanvas("stackLayout1",700, 300).root;
    r.setLayout(new lay.GridLayout(1, 2).setPadding(8));
    r.add(new PAN({
      layout: new lay.StackLayout(),
      kids: [
          new ui.Button("Button"),
          new ui.Panel({
            layout: new lay.FlowLayout("center", "top"),
            padding: 8,
            background: "rgba(200,300,200,0.4)",
            kids: [
              new ui.Label("Top component\nwith transparent background\nplaced over button")
            ]
          })
        ]
    }).setPreferredSize(300, 250));

    r.add(new PAN({
        layout: new lay.StackLayout(),
        kids: [   
            new ui.Button("Stretched\n\n\n\n button"),
            new ui.Button("Ok").setConstraints("usePsSize")
        ]
    }).setPreferredSize(300, 250));


    // Border layout
    var r = new ui.zCanvas("layoutSample1", 500, 400).root;
    r.setLayout(new lay.BorderLayout());
    r.add(new ui.Panel({
        layout : new lay.BorderLayout(4),
        kids   : {
            "center": new ui.Button("CENTER"),
            "left":   new ui.Button("LEFT"),
            "right":  new ui.Button("RIGHT"),
            "top":    new ui.Button("TOP"),
            "bottom": new ui.Button("BOTTOM")
        }
    }).setPreferredSize(300, -1));

    // List layout
    var r = new ui.zCanvas("layoutSample2", 700, 350).root;
    r.setLayout(new lay.GridLayout(2, 2).setPadding(8));
    r.add(new PAN({
        layout : new lay.ListLayout(8),
        kids   : [
            new ui.Button("Stretched Item 1"),
            new ui.Button("Stretched Item 2"),
            new ui.Button("Stretched Item 3")
        ]
    }).setPreferredSize(320, -1));

    r.add(new PAN({
        layout : new lay.ListLayout("center", 8),
        kids   : [
            new ui.Button("Center aligned item 1"),
            new ui.Button("Center aligned item 2"),
            new ui.Button("Center aligned item 3")
        ]
    }).setPreferredSize(320, -1));

    r.add(new PAN({
        layout : new lay.ListLayout("left", 8),
        kids   : [
            new ui.Button("Left aligned item 1"),
            new ui.Button("Left aligned item 2"),
            new ui.Button("Left aligned item 3")
        ]
    }));

    r.add(new PAN({
        layout : new lay.ListLayout("right", 8),
        kids   : [
            new ui.Button("Right aligned item 1"),
            new ui.Button("Right aligned item 2"),
            new ui.Button("Right aligned item 3")
        ]
    }));

    // percentage layout
    var r = new ui.zCanvas("layoutSample3", 700, 220).root;
    r.setLayout(new lay.GridLayout(2, 2).setPadding(8));
    r.add(new PAN({
        layout : new lay.PercentLayout(),
        kids   : {
           20: new ui.Button("20%"),
           30: new ui.Button("30%"),
           50: new ui.Button("50%")
        }
    }).setPreferredSize(320, -1));

    r.add(new PAN({
        layout : new lay.PercentLayout("horizontal", 2, false),
        kids   : {
           20: new ui.Button("20%"),
           30: new ui.Button("30%"),
           50: new ui.Button("50%")
        }
    }).setPreferredSize(320, -1));

    r.add(new PAN({
        layout : new lay.PercentLayout("vertical", 2, false),
        kids   : {
           20: new ui.Button("20%"),
           30: new ui.Button("30%"),
           50: new ui.Button("50%")
        }
    }));
 
    r.add(new PAN({
        layout : new lay.PercentLayout("vertical", 2, true),
        kids   : {
           20: new ui.Button("20%"),
           30: new ui.Button("30%"),
           50: new ui.Button("50%")
        }
    }));

    // Flow layout 
    var r = new ui.zCanvas("layoutSample4", 700, 1000).root;
    r.setLayout(new lay.GridLayout(9, 1).setPadding(8));

    r.add(new PAN({
        layout : new lay.FlowLayout("center", "center", "vertical", 4),
        kids   : [
           new ui.Button("VCentered"),
           new ui.Button("VCentered"),
           new ui.Button("VCentered")
        ]
    }).setPreferredSize(650, -1));

    r.add(new PAN({
        layout : new lay.FlowLayout("center", "center", "horizontal", 4),
        kids   : [
           new ui.Button("HCentered"),
           new ui.Button("HCentered"),
           new ui.Button("HCentered")
        ]
    }));

    r.add(new PAN({
        layout : new lay.FlowLayout("left", "center", "horizontal", 4),
        kids   : [
           new ui.Button("Left-Center-Hor"),
           new ui.Button("Left-Center-Hor"),
           new ui.Button("Left-Center-Hor")
        ]
    }));

    r.add(new PAN({
        layout : new lay.FlowLayout("right", "center", "horizontal", 4),
        kids   : [
           new ui.Button("Right-Center-Hor"),
           new ui.Button("Right-Center-Hor"),
           new ui.Button("Right-Center-Hor")
        ]
    }));

    r.add(new PAN({
        layout : new lay.FlowLayout("right", "top", "horizontal", 4),
        kids   : [
           new ui.Button("Right-Top-Hor"),
           new ui.Button("Right-Top-Hor"),
           new ui.Button("Right-Top-Hor")
        ]
    }));

    r.add(new PAN({
        layout : new lay.FlowLayout("left", "top", "horizontal", 4),
        kids   : [
           new ui.Button("Left-Top-Hor"),
           new ui.Button("Left-Top-Hor"),
           new ui.Button("Left-Top-Hor")
        ]
    }));

    r.add(new PAN({
        layout : new lay.FlowLayout("left", "top", "vertical", 4),
        kids   : [
           new ui.Button("Left-Top-Ver"),
           new ui.Button("Left-Top-Ver"),
           new ui.Button("Left-Top-Ver")
        ]
    }));

    r.add(new PAN({
        layout : new lay.FlowLayout("right", "top", "vertical", 4),
        kids   : [
           new ui.Button("Right-Top-Ver"),
           new ui.Button("Right-Top-Ver"),
           new ui.Button("Right-Top-Ver")
        ]
    }));
 
    r.add(new PAN({
        layout : new lay.FlowLayout("right", "bottom", "vertical", 4),
        kids   : [
           new ui.Button("Right-Bottom-Ver"),
           new ui.Button("Right-Bottom-Ver"),
           new ui.Button("Right-Bottom-Ver")
        ]
    }));

    var r = new ui.zCanvas("layoutSample5", 700, 600).root;
    r.setLayout(new lay.GridLayout(4, 2).setPadding(8));

    r.add(new PAN({
        layout : new lay.GridLayout(2,2),
        kids   : [
            new ui.Button("1x1"),
            new ui.Button("1x2"),
            new ui.Button("2x1"),
            new ui.Button("2x2")
        ]
    }).setPreferredSize(320, 200));

    r.add(new PAN({
        layout : new lay.GridLayout(2,2, true).setPadding(8),
        kids   : [
            new ui.Button("1x1"),
            new ui.Button("1x2"),
            new ui.Button("2x1"),
            new ui.Button("2x2")
        ]
    }));

    r.add(new PAN({
        layout : new lay.GridLayout(2,2, true, true).setPadding(8),
        kids   : [
            new ui.Button("1x1"),
            new ui.Button("1x2"),
            new ui.Button("2x1"),
            new ui.Button("2x2")
        ]
    }));

    var ctr2 = new lay.Constraints("center", "bottom");
    var ctr3 = new lay.Constraints("center", "center");
    ctr2.setPadding(8);
    r.add(new PAN({
        layout : new lay.GridLayout(2,2).setPadding(8),
        kids   : [
            new ui.Button("1x1 bottom component").setConstraints(ctr2),
            new ui.Button("1x2\nnew line\nnew line"),
            new ui.Button("Centered").setConstraints(ctr3),
            new ui.Button("2x2\n2x2\n2x2")
        ]
    }));

    var ctr = new lay.Constraints();
    ctr.ax = "left"; ctr.ay = "top" ;
    r.add(new PAN({
        layout : new lay.GridLayout(2,2,true, true).setPadding(8),
        kids   : [
            new ui.Button("1x1").setConstraints(ctr),
            new ui.Button("1x2").setConstraints(ctr),
            new ui.Button("2x1").setConstraints(ctr),
            new ui.Button("2x2").setConstraints(ctr)
        ]
    }).setPreferredSize(-1, 150));

    var ctr1 = new lay.Constraints();
    var ctr2 = new lay.Constraints();
    var ctr3 = new lay.Constraints();
    var ctr4 = new lay.Constraints();
    ctr1.ax = "left"; ctr1.ay = "top" ;
    ctr2.ax = "stretch"; ctr2.ay = "top" ;
    ctr3.ax = "center"; ctr3.ay = "stretch" ;
    ctr4.ax = "stretch"; ctr4.ay = "stretch";
    r.add(new PAN({
        layout : new lay.GridLayout(2,2,true,true).setPadding(8),
        kids   : [
            new ui.Button("1x1").setConstraints(ctr1),
            new ui.Button("1x2").setConstraints(ctr2),
            new ui.Button("2x1").setConstraints(ctr3),
            new ui.Button("2x2").setConstraints(ctr4)
        ]
    }));
});
</script>

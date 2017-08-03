---
layout: page
title: Layout UI components
---

### Keep UI component in order

User interface has to be adjustable and adaptive to an environment and a hardware where it can be shown. In that respect existence of mobile phones, various WEB browsers, different operation systems, PCs, laptops, tablets and combinations of all these factors makes life harder. To avoid potential UI layouting problems developers should not locate and size UI components by assigning dedicated (x,y) coordinates and (width,height) values. Otherwise even slight font changing can crash designed UI layout.

Layout managers is well known solution to get adaptive UI. That is exactly the thing that helps developing adjustable UI layout. Layout manager doesn't trust fixed UI components positions and sizes. It uses rules-based manner to order UI components. Layout manager is defined on the level of an UI component and "knows" two important things:

  * How to order UI children components
	
  * How to compute the component preferred size basing on its children components hierarchy


Technically zbkit layout manager class has to implement the following:

  * **"doLayout(target)"** method to define rules children components of the given target component has to be laid outed
        
  * **"calcPreferredSize(target)"** method to calculate size the given target component desires to have
	
  * **"zebkit.layout.Layout"** interface should be implemented by a layout manager class


A layout manager can be applied to any Zebra UI component by calling "setLayout(layout)" method. Additionally children UI components can specify extra parameter called constraints that is specific for a particular layout manager. It is can be done either by setting a children component "constraints" field or during insertion of the component to the parent component:

```js
zebkit.require("ui", "layout", function(ui, lay) {
    // create panel
    var p = new ui.Panel();
    // set layout manager for the panel
    p.setLayout(new lay.BorderLayout());
    // add children components
    p.add("center", new ui.Label("Center")); 

    // another way to specify constraints is filling "constraints"
    // field of a children component
    var l = new ui.Label("Top");
    l.constraints = "top";
    p.add(l);
    ...
});
```


### Implementing simple layout manage

Nevertheless zebkit provides rich set of different predefined layout managers, it makes sense for better understanding to start from developing an own Zebra layout manager. It should help to discover how simple the idea is. As an example, let's develop layout manager that orders components along parent component diagonal:

```js
zebkit.package("ui.demo", function(pkg, Class) {
    // declare layout manager class
    pkg.DiagLayout = Class(zebkit.layout.Layout,[
        // define what preferred size the given "target" component 
        // wants to have. in this case it calculated as sum of 
        // preferred heights and widths of children components
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
           var psW = 0, 
               psH = 0;

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

        function doLayout(target) {
           var x = target.getTop(), 
               y = target.getLeft();
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
</script>

Use just developed diagonal layout manager as follow:

{% include zsample2.html canvas_id='layoutSampleDiag' title='Custom diagonal layout' description=description %}                    

```js
zebkit.require("ui", "ui.demo", function(ui, demo) {
    var r = new ui.zCanvas("layoutSampleDiag", 200,200).root;
    // set developed above diagonal layout manager
    r.setLayout(new demo.DiagLayout());
    // add children components
    r.add(new ui.Button("One"));
    r.add(new ui.Button("Two"));
    r.add(new ui.Button("Three"));
});
```

<script type="text/javascript">
    zebkit.require("ui", "ui.demo", function(ui, demo) {
        var r = new ui.zCanvas("layoutSampleDiag", 200,200).root;
        // set developed above diagonal layout manager
        r.setLayout(new demo.DiagLayout());

        // add children components
        r.add(new ui.Button("One"));
        r.add(new ui.Button("Two"));
        r.add(new ui.Button("Three"));
    });
</script>


### Predefined layout managers

Below you can find snapshots for all supplied by zebkit layout managers. Every snapshots are provided together with "live" application that run the snapshot source code directly on this page.


#### zebkit.layout.StackLayout

The layout manager places children UI components over each other and stretches its to fill the whole parent component surface.

{% include zsample2.html canvas_id='layoutSample1' title='Paint on top method implementation' description=description %}                    

```js
zebkit.require("ui", "layout", function(ui, layout) {
    var r = new ui.zCanvas("layoutSample1", 300, 300).root;
    r.setBorder("plain");
    // set stack layout manager
    r.setLayout(new layout.StackLayout());
    // add button
    r.add(new ui.Button("Under transparent"));
    // add partially transparent panel component
    var p = new ui.Panel();
    p.setBackground("rgba(240,240,240,0.7)");
    r.add(p);
});
```

<script type="text/javascript">  
zebkit.require("ui", "layout", function(ui, layout) {
    var r = new ui.zCanvas("layoutSample1", 300, 300).root;
    r.setBorder("plain");
    r.setLayout(new layout.StackLayout());
    r.add(new ui.Button("Under transparent"));
    var p = new ui.Panel();
    p.setBackground("rgba(240,240,240,0.7)");
    r.add(p);
});
</script>


#### zebkit.layout.BorderLayout

Border layout manager splits component area into five parts: top, left, right, bottom and center. Children components are placed to one of the part basing on constraints that have been specified for them:

<script type="text/javascript">
    zebkit.require("ui","layout",function(ui, layout) {
        var r = new ui.zCanvas("layoutSampleBorder", 600,350).root;
        r.setLayout(new layout.BorderLayout());
        r.add("center",new ui.Button("CENTER"));
        r.add("left", new ui.Button("LEFT"));
        r.add("right",new ui.Button("RIGHT"));
        r.add("top",new ui.Button("TOP"));
        r.add("bottom",new ui.Button("BOTTOM"));
    });
</script>

{% include zsample2.html canvas_id='layoutSampleBorder' title='Border layout' description=description %}                    

```js
zebkit.require("ui","layout",function(ui, lay) {
    var r = new ui.zCanvas("layoutSampleBorder", 600,350).root;
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


#### zebkit.layout.PercentLayout

Percent layout manager orders children components basing on percentage sizes of the components. The percentage sizes are defined as the children components constraints.

**Horizontally ordered percent layout manager with stretched vertically components**

{% include zsample2.html canvas_id='percentLayout1' title='Percent layout' description=description %}                    

```js
zebkit.require("ui","layout",function(ui, lay) {
    var r = new ui.zCanvas("percentLayout1", 400, 250).root;
    r.setBorder("plain");

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

<script type="text/javascript">
    zebkit.require("ui","layout",function(ui, layout) {
        var r = new ui.zCanvas("percentLayout1", 400, 250).root;
        r.setBorder("plain");
        r.setLayout(new layout.PercentLayout());
        r.add(20, new ui.Button("20%"));
        r.add(30, new ui.Button("30%"));
        r.add(50, new ui.Button("50%"));
    });
</script>

**Horizontally ordered percent layout manager with preferred components heights**

{% include zsample2.html canvas_id='percentLayout2' title='Percent layout' description=description %}                    

```js
zebkit.require("ui","layout",function(ui, lay) {
    var r = new ui.zCanvas("percentLayout2", 400, 200).root;
    r.setBorder("plain");

    // set percent layout manager that sizes components vertically 
    // according to its preferred heights and sizes components 
    // horizontally according to its percentage constraints
    r.setLayout(new lay.PercentLayout("horizontal", 2, false));

    // add button that takes 20% of horizontal space
    r.add(20, new ui.Button("20%"));
    // add button that takes 30% of horizontal space
    r.add(30, new ui.Button("30%"));
    // add button that takes 50% of horizontal space
    r.add(50, new ui.Button("50%"));  
});
```

<script type="text/javascript">
    zebkit.require("ui","layout",function(ui, layout) {
        var r = new ui.zCanvas("percentLayout2", 400,200).root;
        r.setBorder("plain");
        r.setLayout(new layout.PercentLayout("horizontal", 2, false));
        r.add(20, new ui.Button("20%"));
        r.add(30, new ui.Button("30%"));
        r.add(50, new ui.Button("50%"));  
    });
</script>


**Vertically ordered percent layout manager with preferred components widths**

{% include zsample2.html canvas_id='percentLayout3' title='Percent layout' description=description %}                    

```js
zebkit.require("ui","layout",function(ui, lay) {
  var r = new ui.zCanvas("percentLayout3", 400,200).root;
  r.setBorder("plain");

  // set percent layout manager that sizes components horizontally 
  // according to its preferred widths and sizes components 
  // vertically according to its percentage constraints
  r.setLayout(new lay.PercentLayout("vertical", 2, false));

  // add button that takes 20% of vertical space
  r.add(20, new ui.Button("20%"));
  // add button that takes 30% of vertical space
  r.add(30, new ui.Button("30%"));
  // add button that takes 50% of vertical space
  r.add(50, new ui.Button("50%"));
});
```

<script type="text/javascript">
    zebkit.require("ui","layout",function(ui, layout) {
      var r = new ui.zCanvas("percentLayout3", 400,200).root;
      r.setBorder("plain");
      r.setLayout(new layout.PercentLayout("vertical", 2, false));
      r.add(20, new ui.Button("20%"));
      r.add(30, new ui.Button("30%"));
      r.add(50, new ui.Button("50%"));
    });
</script>


**Vertically ordered percent layout manager with stretched horizontally components**

{% include zsample2.html canvas_id='percentLayout4' title='Percent layout' description=description %}                    

```js
zebkit.require("ui","layout",function(ui, lay) {
    var r = new ui.zCanvas("percentLayout4", 400,200).root;
    r.setBorder("plain");

    // set percent layout manager that stretches components
    // horizontally and sizes components vertically according
    // to its percentage constraints
    r.setLayout(new lay.PercentLayout("vertical", 2, true));

    // add button that takes 20% of vertical space
    r.add(20, new ui.Button("20%"));
    // add button that takes 30% of vertical space
    r.add(30, new ui.Button("30%"));
    // add button that takes 50% of vertical space
    r.add(50, new ui.Button("50%"));
});
```

<script type="text/javascript">
    zebkit.require("ui","layout",function(ui, layout) {
      var r = new ui.zCanvas("percentLayout4", 400,200).root;
      r.setBorder("plain");
      r.setLayout(new layout.PercentLayout("vertical", 2, true));
      r.add(20, new ui.Button("20%"));
      r.add(30, new ui.Button("30%"));
      r.add(50, new ui.Button("50%"));
    });
</script>


#### zebkit.layout.FlowLayout

Flow layout provides many possibilities to align children components.

**Vertically ordered UI components are centered horizontally and vertically:**

{% include zsample2.html canvas_id='flowLayout1' title='Flow layout' description=description %}                      

```js
zebkit.require("ui","layout", function(ui, lay) {
    var r = new ui.zCanvas("flowLayout1", 400, 200).root;
    r.setBorder("plain");

    // set flow layout with vertical components ordering and center 
    // vertical and horizontal alignments
    r.setLayout(new lay.FlowLayout("center","center","vertical",2));

    // add children components
    r.add(new ui.Button("VCentered"));
    r.add(new ui.Button("VCentered"));
    r.add(new ui.Button("VCentered"));
});
```

<script type="text/javascript">
    zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("flowLayout1", 400,200).root;
        r.setBorder("plain");
        r.setLayout(new layout.FlowLayout("center","center","vertical", 2));
        r.add(new ui.Button("VCentered"));
        r.add(new ui.Button("VCentered"));
        r.add(new ui.Button("VCentered"));
    });
</script>


**Vertically ordered UI components are aligned top-left:**

{% include zsample2.html canvas_id='flowLayout2' title='Flow layout' description=description %}                    

```js
zebkit.require("ui","layout", function(ui, lay) {
    var r = new ui.zCanvas("flowLayout2", 400,200).root;
    r.setBorder("plain");
    // set flow layout with vertical components
    // ordering, top-left alignment and 2 pixels
    // gap between inserted components
    r.setLayout(new lay.FlowLayout("left","top",
                                    "vertical", 2));
    // add children components
    r.add(new ui.Button("Left-Top-Ver"));
    r.add(new ui.Button("Left-Top-Ver"));
    r.add(new ui.Button("Left-Top-Ver"));
});
```

<script type="text/javascript">
    zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("flowLayout2", 400,200).root;
        r.setBorder("plain");
        r.setLayout(new layout.FlowLayout("left","top","vertical", 2));
        r.add(new ui.Button("Left-Top-Ver"));
        r.add(new ui.Button("Left-Top-Ver"));
        r.add(new ui.Button("Left-Top-Ver"));
    });
</script>


**Vertically ordered UI components are aligned top-right:**

{% include zsample2.html canvas_id='flowLayout3' title='Flow layout' description=description %}                    

```js
zebkit.require("ui","layout", function(ui, layout) {
    var r = new ui.zCanvas("flowLayout3", 400,200).root;
    r.setBorder("plain");
    // set flow layout with vertical components
    // ordering, top-right alignment and 2 pixels
    // gap between inserted components
    r.setLayout(new layout.FlowLayout("right","top",
                                      "vertical", 2));
    // add children components
    r.add(new ui.Button("Right-Top-Ver"));
    r.add(new ui.Button("Right-Top-Ver"));
    r.add(new ui.Button("Right-Top-Ver"));
});
```

<script type="text/javascript">
    zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("flowLayout3", 400,200).root;
        r.setBorder("plain");
        r.setLayout(new layout.FlowLayout("right","top","vertical", 2));
        r.add(new ui.Button("Right-Top-Ver"));
        r.add(new ui.Button("Right-Top-Ver"));
        r.add(new ui.Button("Right-Top-Ver"));
    });
</script>


**Vertically ordered UI components are aligned bottom-right:**

{% include zsample2.html canvas_id='flowLayout4' title='Flow layout' description=description %}                    

```js
zebkit.require("ui","layout", function(ui, layout) {
    var r = new ui.zCanvas("flowLayout4", 200,200).root;
    r.setBorder("plain");
    // set flow layout with vertical components
    // ordering, bottom-right alignment and 2 pixels
    // gap between inserted components
    r.setLayout(new layout.FlowLayout("right","bottom",
                                      "vertical", 2));
    // add children components
    r.add(new ui.Button("Right-Bottom-Ver"));
    r.add(new ui.Button("Right-Bottom-Ver"));
    r.add(new ui.Button("Right-Bottom-Ver"));
});
```

<script type="text/javascript">
    zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("flowLayout4", 200,200).root;
        r.setBorder("plain");
        r.setLayout(new layout.FlowLayout("right","bottom","vertical", 2));
        r.add(new ui.Button("Right-Bottom-Ver"));
        r.add(new ui.Button("Right-Bottom-Ver"));
        r.add(new ui.Button("Right-Bottom-Ver"));
    });
</script>

**Horizontally ordered UI components are centered vertically and horizontally:**

{% include zsample2.html canvas_id='flowLayout5' title='Flow layout' description=description %}                    

```js
zebkit.require("ui","layout", function(ui, layout) {
    var r = new ui.zCanvas("flowLayout5", 600,120).root;
    r.setBorder("plain");
    // set flow layout with horizontal components
    // ordering, center-center alignment and 2 pixels
    // gap between inserted components
    r.setLayout(new layout.FlowLayout("center","center",
                                      "horizontal", 2));
    // add children components
    r.add(new ui.Button("HCentered"));
    r.add(new ui.Button("HCentered"));
    r.add(new ui.Button("HCentered"));
});
```

<script type="text/javascript">
    zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("flowLayout5", 600,120).root;
        r.setBorder("plain");
        r.setLayout(new layout.FlowLayout("center","center","horizontal", 2));
        r.add(new ui.Button("HCentered"));
        r.add(new ui.Button("HCentered"));
        r.add(new ui.Button("HCentered"));
    });
</script>

**Horizontally ordered UI components are aligned center-left:**

{% include zsample2.html canvas_id='flowLayout6' title='Flow layout' description=description %}                    

```js
zebkit.require("ui","layout", function(ui, layout) {
    var r = new ui.zCanvas("flowLayout6", 600,120).root;
    r.setBorder("plain");
    // set flow layout with horizontal components
    // ordering, center-left alignment and 2 pixels
    // gap between inserted components
    r.setLayout(new layout.FlowLayout("left","center",
                                      "horizontal",2));
    // add children components
    r.add(new ui.Button("Left-Center-Hor"));
    r.add(new ui.Button("Left-Center-Hor"));
    r.add(new ui.Button("Left-Center-Hor"));
});
```

<script type="text/javascript">
    zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("flowLayout6", 600,120).root;
        r.setBorder("plain");
        r.setLayout(new layout.FlowLayout("left","center","horizontal",2));
        r.add(new ui.Button("Left-Center-Hor"));
        r.add(new ui.Button("Left-Center-Hor"));
        r.add(new ui.Button("Left-Center-Hor"));
    });
</script>

**Horizontally ordered UI components are aligned center-right:**

{% include zsample2.html canvas_id='flowLayout7' title='Flow layout' description=description %}                    

```js
zebkit.require("ui","layout", function(ui, layout) {
    var r = new ui.zCanvas("flowLayout7", 600,120).root;
    r.setBorder("plain");
    // set flow layout with horizontal components
    // ordering, center-right alignment and 2 pixels
    // gap between inserted components
    r.setLayout(new layout.FlowLayout("right","center",
                                      "horizontal", 2));
    // add children components
    r.add(new ui.Button("Right-Center-Hor"));
    r.add(new ui.Button("Right-Center-Hor"));
    r.add(new ui.Button("Right-Center-Hor"));
});
```

<script type="text/javascript">
    zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("flowLayout7", 600,120).root;
        r.setBorder("plain");
        r.setLayout(new layout.FlowLayout("right","center","horizontal", 2));
        r.add(new ui.Button("Right-Center-Hor"));
        r.add(new ui.Button("Right-Center-Hor"));
        r.add(new ui.Button("Right-Center-Hor"));
    });
</script>

**Horizontally ordered UI components are aligned top-right:**

{% include zsample2.html canvas_id='flowLayout8' title='Flow layout' description=description %}                    

```js
zebkit.require("ui","layout", function(ui, layout) {
    var r = new ui.zCanvas("flowLayout8", 600,120).root;
    r.setBorder("plain");
    // set flow layout with horizontal components
    // ordering, top-right alignment and 2 pixels
    // gap between inserted components
    r.setLayout(new layout.FlowLayout("right","top",
                                      "horizontal", 2));
    // add children components
    r.add(new ui.Button("Right-Top-Hor"));
    r.add(new ui.Button("Right-Top-Hor"));
    r.add(new ui.Button("Right-Top-Hor"));
});
```

<script type="text/javascript">
    zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("flowLayout8", 600,120).root;
        r.setBorder("plain");
        r.setLayout(new layout.FlowLayout("right","top","horizontal", 2));
        r.add(new ui.Button("Right-Top-Hor"));
        r.add(new ui.Button("Right-Top-Hor"));
        r.add(new ui.Button("Right-Top-Hor"));
    });
</script>

**Horizontally ordered UI components are aligned top-left:**

{% include zsample2.html canvas_id='flowLayout9' title='Flow layout' description=description %}                    

```js
zebkit.require("ui","layout", function(ui, layout) {
    var r = new ui.zCanvas("flowLayout9", 600,120).root;
    r.setBorder("plain");
    // set flow layout with horizontal components
    // ordering, top-left alignment and 2 pixels
    // gap between inserted components
    r.setLayout(new layout.FlowLayout("left","top",
                                      "horizontal",2));
    // add children components
    r.add(new ui.Button("Left-Top-Hor"));
    r.add(new ui.Button("Left-Top-Hor"));
    r.add(new ui.Button("Left-Top-Hor"));
});
```

<script type="text/javascript">
    zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("flowLayout9", 600,120).root;
        r.setBorder("plain");
        r.setLayout(new layout.FlowLayout("left","top","horizontal",2));
        r.add(new ui.Button("Left-Top-Hor"));
        r.add(new ui.Button("Left-Top-Hor"));
        r.add(new ui.Button("Left-Top-Hor"));
    });
</script>

#### zebkit.layout.RasterLayout

Raster layout manager is default Zebra component layout manager. It emulates the standard approach where locations and sizes are precisely specified by calling "setLocation(x,y)", "setSize(w,h)" or "setBounds(x,y,w,h)" methods. It is strongly recommended to avoid using raster layout manager the way developers define exact values for a component location and size. Rules are better in respect of implementing adaptive UI that doesn't depend on screen resolutions, font metrics, allocated for an UI application size and so on.

**Hardcoded, user defined components locations and sizes:**

{% include zsample2.html canvas_id='rasterLayout1' title='Raster layout' description=description %}                    

<script type="text/javascript">
    zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("rasterLayout1",400,200).root;
        r.setBorder("plain");
        r.setLayout(new layout.RasterLayout());

        // create component, setup its metrics precisely
        // and add its to parent component
        var b = new ui.Button("(10,10,140,40)");
        b.setBounds(10,10,140,40);
        r.add(b);

        var b = new ui.Button("(10,120,80,50)");
        b.setBounds(10,100,120,50);
        r.add(b);
    });
</script>

Raster layout manager also can be less dependent from an environment an UI application can be run:

**Size components to its referred size:**

{% include zsample2.html canvas_id='rasterLayout2' title='Raster layout' description=description %}                    

<script type="text/javascript">
    zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("rasterLayout2",400,200).root;
        r.setBorder("plain");

        // set raster layout that sizes children components
        // according to its preferred size
        r.setLayout(new layout.RasterLayout(true));

        // add children components
        var b=new ui.Button("(10,10) Preferred Sized");
        b.setLocation(10,10);
        r.add(b);

        var b = new ui.Button(
        new ui.MLabel("(30,100)\nPreferred sized"));
        b.setLocation(30,100);
        r.add(b);
    });
</script>

**Size components to its preferred size and align its:**

{% include zsample2.html canvas_id='rasterLayout3' title='Raster layout' description=description %}                    

<script type="text/javascript">
    zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("rasterLayout3", 400,200).root,
            MLabel=ui.MLabel; //shortcut to class
        r.setBorder("plain");

        // set raster layout that sizes children components
        // according to its preferred size
        r.setLayout(new layout.RasterLayout(true));

        var b = new ui.Button("(10,10) Preferred Sized");
        b.setLocation(10,10);
        r.add(b);

        // add top-left aligned button
        var b = new ui.Button(
            new MLabel("(Left,Bottom)\nPreferred sized"));
        r.add("leftBottom", b);

        // add center aligned button
        var b = new ui.Button(
            new MLabel("(Center)\nPreferred sized"));
        r.add("center", b);

        // add right aligned button
        var b = new ui.Button(
            new MLabel("(Center)\nPreferred sized"));
        r.add("right", b);
    });
</script>

#### zebkit.layout.ListLayout

List layout manager orders children component vertically as a list of items.

**Children components are stretched horizontally to occupy whole parent container width:**

{% include zsample2.html canvas_id='listLayout1' title='Raster layout' description=description %}                    

<script type="text/javascript">
    zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("listLayout1", 400,200).root;
        r.setBorder("plain");

        // set list layout manager that orders
        // components as list item and stretches
        // children horizontally
        r.setLayout(new layout.ListLayout());

        // add children components
        r.add(new ui.Button("Item1"));
        r.add(new ui.Button("Item2"));
        r.add(new ui.Button("Item3"));
    });
</script>

**Children components are centered horizontally:**

{% include zsample2.html canvas_id='listLayout2' title='List layout' description=description %}                    

<script type="text/javascript">
    zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("listLayout2", 400,200).root;
        r.setBorder("plain");

        // set list layout manager with centered
        // horizontally children components and
        // 2 pixels gap between the components
        r.setLayout(new layout.ListLayout("center",2));

        // add children components
        r.add(new ui.Button("Item1"));
        r.add(new ui.Button("Item2"));
        r.add(new ui.Button("Item3"));
    });
</script>

**Children components are aligned left:**

{% include zsample2.html canvas_id='listLayout3' title='List layout' description=description %}                    

<script type="text/javascript">
  zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("listLayout3", 400,200).root;
        r.setBorder("plain");

        // set list layout manager with aligned
        // left children components and
        // 2 pixels gap between the components
        r.setLayout(new layout.ListLayout("left", 2));

        // add children components
        r.add(new ui.Button("Item1"));
        r.add(new ui.Button("Item2"));
        r.add(new ui.Button("Item3"));
    });
</script>

#### zebkit.layout.GridLayout


Grid layout manager splits a component area to number of virtual cells. Children components are placed into the cells. One cell can be occupied only by one children component. Using "zebkit.layout.Constraints" class developers can control how a children component has to be placed inside the virtual cell. "zebra.layout.Constraints" declares the following fields that declares how a component has to be placed inside a virtual cell:

<table class="info">
<tr><th>
Field    
</th><th>
Allowed values
</th><th>
Description    
</th></tr>

<tr><td>
ax
</td><td>
"left"<br/>"right"<br/>"center"<br/>"stretch"
</td><td>
Horizontal alignment in cell
</td></tr>

<tr><td>
ay
</td><td>
"top"<br/>"bottom"<br/>"center"<br/>"stretch"
</td><td>
Vertical alignment in cell
</td></tr>

<tr><td>
top,left,<br/>bottom,right
</td><td>
integer value >= 0
</td><td>
Cell top, left, bottom and right paddings
</td></tr>

</table>

The picture below explains how a component can be aligned inside a virtual cell controlled by grid layout manager:

[![gridlayout](http://www.zebkit.com/wp-content/uploads/2013/06/gridlayout-1024x512.png)](http://www.zebkit.com/wp-content/uploads/2013/06/gridlayout.png)


**Default grid layout manager constraints**

{% include zsample2.html canvas_id='gridLayout1' title='List layout' description=description %}                    

<script type="text/javascript">
  zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("gridLayout1", 150,150).root;
        r.setBorder("plain");
        r.setLayout(new layout.GridLayout(2,2));

        // add children components
        r.add(new ui.Button("1x1"));
        r.add(new ui.Button("1x2"));
        r.add(new ui.Button("2x1"));
        r.add(new ui.Button("2x2"));
    });
</script>


**1. Custom grid layout manager constraints**

{% include zsample2.html canvas_id='gridLayout2' title='List layout' description=description %}                    

<script type="text/javascript">
  zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("gridLayout2", 400,150).root,
            ctr = new layout.Constraints();
        ctr.setPadding(8);

        r.setBorder("plain");
        r.setLayout(new layout.GridLayout(2,2));
        r.add(ctr,new ui.Button("1x1 Long component"));
        r.add(ctr,new ui.Button("1x2"));
        r.add(ctr,new ui.Button("2x1"));
        r.add(ctr,new ui.Button("2x2"));
    });
</script>


**2. Custom grid layout manager constraints**

{% include zsample2.html canvas_id='gridLayout3' title='List layout' description=description %}                    

<script type="text/javascript">
    zebkit.require("ui","layout", function(ui, layout) {
        var r = new ui.zCanvas("gridLayout3", 400,200).root,
            ctr = new layout.Constraints(),
            MLabel = ui.MLabel; // class shortcut
        ctr.setPadding(8);

        r.setBorder("plain");
        r.setLayout(new layout.GridLayout(2,2));

        var ctr2=new layout.Constraints("center","bottom");

        ctr2.setPadding(8);
        r.add(ctr2,new ui.Button("1x1 bottom component"));

        r.add(ctr,new ui.Button(new MLabel("1x2\nnew line\nnew line")));

        r.add(new layout.Constraints("center","center"),
              new ui.Button("Centered"));

        r.add(ctr, new ui.Button(new MLabel("2x2\n2x2\n2x2")));
    });
</script>



### Layout package API and constants


All zebra layout managers are hosted in "zebra.layout" package. The package provides the core "zebra.layout.Layoutable" class. This class describes a rectangular object that is bound with the given size and location. "zebra.layout.Layoutable" component can contain other layoutable components as its children. The children components are laid outed with a layout manager. Pay attention "zebra.layout" package is completely independent from UI part. Developer can easily use it as basis for layout management, for instance, for WEB based elements. Zebra UI engine just extends the basic "zebra.layout.Layoutable" class with visual and event related stuff.

The package provides number of useful API methods that can be handy to manipulate with component hierarchy:

<table class="info">
<tr><th>
API method    
</th><th>
Description 
</th></tr>

<tr><td>
zebra.layout.getDirectChild(p,k)    
</td><td>
 get immediate kid for the given parent and children component 
</td></tr>


<tr><td>
zebra.layout.getDirectAt(x,y,p)
</td><td>
get immediate kid located at the given location of the specified parent component
</td></tr>

; 
zebra.layout.getTopParent(comp); get top parent by the given component. Top is a component whose parent is "null"
zebra.layout.toParentOrigin(x,y,c, [p]); translate the given relative location into a parent relative location
zebra.layout.toChildOrigin(x,y,c,p); convert the given component location into relative location of the specified children component successor
zebra.layout.isAncestorOf(p,k); test if the given kid component is an ancestor of the specified parent component


</table>

Also it declares number of constants that from time to time have to be used as a layout constraints:
[wpcol_2third]
[table]
Constraints;Description
"left"; left constraint or alignment
"right"; right constraint or alignment
"top"; top constraint or alignment
zebra.layout.BOTTOM; bottom constraint or alignment
"center"; center constraint or alignment
"horizontal"; horizontal constraint or alignment
"vertical"; vertical constraint or alignment
zebra.layout.STRETCH; stretch constraint
zebra.layout.USE_PS_SIZE; use preferred size
zebra.layout.TLEFT; top left constraint or alignment
zebra.layout.TRIGHT; top right constraint or alignment
zebra.layout.BLEFT; bottom left constraint or alignment
zebra.layout.BRIGHT; bottom right constraint or alignment
[/table][/wpcol_2third][wpcol_1third_end]
[![constraints](http://www.zebkit.com/wp-content/uploads/2013/06/constraints-1024x651.png)](http://www.zebkit.com/wp-content/uploads/2013/06/constraints.png)
[/wpcol_1third_end]

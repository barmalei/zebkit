---
layout: page
tags: menu2
title: UI layouts
---

<script type="text/javascript" src="/website/public/js/zebkit.min.js">  
</script>

<script type="text/javascript">
    zebkit.config["zebkit.theme"] = "dark";
</script>

Zebkit uses rules to order UI components as a better alternative to using absolute location and defined UI component sizes what gives the following advantages:

   * zebkit applications UI looks more or less the same on different screens in various environments 
   * zebkit applications UI is adaptable to screens sizes and resolutions
   * zebkit custom components development is more general and re-usable 

If existent layout manager are not enough than developing a new custom layout is not a big deal. You need to inherit "zebkit.layout.Layout" class and implement the following two methods:

   * **"calcPreferredSize(container)"** The method has to calculate a preferred size a component with the given layout wants to have. Normally preferred size is computed basing on preferred sizes the container children components  
   * **"doLayout(container)"** The method orders the target container children component basing on specific rules of the implemented layout manager

For instance:

```js
var CustomLayout = zebkit.Class(zebkit.layout.Layout, [
    function calcPreferredSize(target) {
       // calculate preferred size the container wants to have 
       ...
       return { width: <a desired width>, 
                height: <a desired height> };
    },
 
    function doLayout(target) {
       // order the target children 
       ... 
    }
]);   
```
   
And than use the developed layout as follow:

```js
// create container and set Custom layout to order its kids
var panel = new zebkit.ui.Panel(new CustomLayout());

// add kids
panel.add(new Label("Kid 1"));
panel.add(new Label("Kid 2"));
panel.add(new Label("Kid 3"));
```

Zebkit comes with number of ready to use layout managers that are in most cases enough to design an application. The following layout managers are available out of box: 

   * **Border Layout:**

{% include zsample.html canvas_id='layoutSample1' title='Border layout' %}

   * **List layout**

{% include zsample.html canvas_id='layoutSample2' title='List layout' %}

   * **Percentage layout**

{% include zsample.html canvas_id='layoutSample3' title='Percentage layout' %}

   * **Flow layout**

{% include zsample.html canvas_id='layoutSample4' title='Flow layout' %}

   * **Grid layout**

{% include zsample.html canvas_id='layoutSample5' title='Grid layout' %}


<script type='text/javascript'>
zebkit.require(function() {
    eval(zebkit.import("ui", "layout"));

    var PAN = zebkit.Class(Panel, []);
    PAN.padding = 8;
    PAN.border = "plain";

    // Border layout
    var r = new zCanvas("layoutSample1", 500, 400).root;
    r.setLayout(new BorderLayout());
    r.add(new Panel({
        layout : new BorderLayout(4),
        kids   : {
            "center": new Button("CENTER"),
            "left":   new Button("LEFT"),
            "right":  new Button("RIGHT"),
            "top":    new Button("TOP"),
            "bottom": new Button("BOTTOM")
        }
    }).setPreferredSize(300, -1));

    // List layout
    var r = new zCanvas("layoutSample2", 700, 320).root;
    r.setLayout(new zebkit.layout.GridLayout(2, 2).setPadding(8));
    r.add(new PAN({
        layout : new ListLayout(8),
        kids   : [
            new Button("Stretched Item 1"),
            new Button("Stretched Item 2"),
            new Button("Stretched Item 3")
        ]
    }).setPreferredSize(320, -1));

    r.add(new PAN({
        layout : new ListLayout("center", 8),
        kids   : [
            new Button("Center aligned item 1"),
            new Button("Center aligned item 2"),
            new Button("Center aligned item 3")
        ]
    }).setPreferredSize(320, -1));

    r.add(new PAN({
        layout : new ListLayout("left", 8),
        kids   : [
            new Button("Left aligned item 1"),
            new Button("Left aligned item 2"),
            new Button("Left aligned item 3")
        ]
    }));

    r.add(new PAN({
        layout : new ListLayout("right", 8),
        kids   : [
            new Button("Right aligned item 1"),
            new Button("Right aligned item 2"),
            new Button("Right aligned item 3")
        ]
    }));

    // percentage layout
    var r = new zCanvas("layoutSample3", 700, 220).root;
    r.setLayout(new zebkit.layout.GridLayout(2, 2).setPadding(8));
    r.add(new PAN({
        layout : new PercentLayout(),
        kids   : {
           20: new Button("20%"),
           30: new Button("30%"),
           50: new Button("50%")
        }
    }).setPreferredSize(320, -1));

    r.add(new PAN({
        layout : new PercentLayout("horizontal", 2, false),
        kids   : {
           20: new Button("20%"),
           30:  new Button("30%"),
           50: new Button("50%")
        }
    }).setPreferredSize(320, -1));

    r.add(new PAN({
        layout : new PercentLayout("vertical", 2, false),
        kids   : {
           20: new Button("20%"),
           30:  new Button("30%"),
           50: new Button("50%")
        }
    }));
 
    r.add(new PAN({
        layout : new PercentLayout("vertical", 2, true),
        kids   : {
           20: new Button("20%"),
           30: new Button("30%"),
           50: new Button("50%")
        }
    }));

    // Flow layout 
    var r = new zCanvas("layoutSample4", 700, 930).root;
    r.setLayout(new GridLayout(9, 1).setPadding(8));

    r.add(new PAN({
        layout : new FlowLayout("center", "center", "vertical", 4),
        kids   : [
           new Button("VCentered"),
           new Button("VCentered"),
           new Button("VCentered")
        ]
    }).setPreferredSize(650, -1));

    r.add(new PAN({
        layout : new FlowLayout("center", "center", "horizontal", 4),
        kids   : [
           new Button("HCentered"),
           new Button("HCentered"),
           new Button("HCentered")
        ]
    }));

    r.add(new PAN({
        layout : new FlowLayout("left", "center", "horizontal", 4),
        kids   : [
           new Button("Left-Center-Hor"),
           new Button("Left-Center-Hor"),
           new Button("Left-Center-Hor")
        ]
    }));

    r.add(new PAN({
        layout : new FlowLayout("right", "center", "horizontal", 4),
        kids   : [
           new Button("Right-Center-Hor"),
           new Button("Right-Center-Hor"),
           new Button("Right-Center-Hor")
        ]
    }));

    r.add(new PAN({
        layout : new FlowLayout("right", "top", "horizontal", 4),
        kids   : [
           new Button("Right-Top-Hor"),
           new Button("Right-Top-Hor"),
           new Button("Right-Top-Hor")
        ]
    }));

    r.add(new PAN({
        layout : new FlowLayout("left", "top", "horizontal", 4),
        kids   : [
           new Button("Left-Top-Hor"),
           new Button("Left-Top-Hor"),
           new Button("Left-Top-Hor")
        ]
    }));

    r.add(new PAN({
        layout : new FlowLayout("left", "top", "vertical", 4),
        kids   : [
           new Button("Left-Top-Ver"),
           new Button("Left-Top-Ver"),
           new Button("Left-Top-Ver")
        ]
    }));

    r.add(new PAN({
        layout : new FlowLayout("right", "top", "vertical", 4),
        kids   : [
           new Button("Right-Top-Ver"),
           new Button("Right-Top-Ver"),
           new Button("Right-Top-Ver")
        ]
    }));
 
    r.add(new PAN({
        layout : new FlowLayout("right", "bottom", "vertical", 4),
        kids   : [
           new Button("Right-Bottom-Ver"),
           new Button("Right-Bottom-Ver"),
           new Button("Right-Bottom-Ver")
        ]
    }));

    var r = new zCanvas("layoutSample5", 700, 600).root;
    r.setLayout(new GridLayout(4, 2).setPadding(8));

    r.add(new PAN({
        layout : new zebkit.layout.GridLayout(2,2),
        kids   : [
            new zebkit.ui.Button("1x1"),
            new zebkit.ui.Button("1x2"),
            new zebkit.ui.Button("2x1"),
            new zebkit.ui.Button("2x2")
        ]
    }).setPreferredSize(320, 200));

    r.add(new PAN({
        layout : new zebkit.layout.GridLayout(2,2, true).setPadding(8),
        kids   : [
            new zebkit.ui.Button("1x1"),
            new zebkit.ui.Button("1x2"),
            new zebkit.ui.Button("2x1"),
            new zebkit.ui.Button("2x2")
        ]
    }));

    r.add(new PAN({
        layout : new zebkit.layout.GridLayout(2,2, true, true).setPadding(8),
        kids   : [
            new zebkit.ui.Button("1x1"),
            new zebkit.ui.Button("1x2"),
            new zebkit.ui.Button("2x1"),
            new zebkit.ui.Button("2x2")
        ]
    }));

    var ctr2 = new zebkit.layout.Constraints("center", "bottom");
    var ctr3 = new zebkit.layout.Constraints("center", "center");
    ctr2.setPadding(8);
    r.add(new PAN({
        layout : new zebkit.layout.GridLayout(2,2).setPadding(8),
        kids   : [
            new zebkit.ui.Button("1x1 bottom component").setConstraints(ctr2),
            new zebkit.ui.Button("1x2\nnew line\nnew line"),
            new zebkit.ui.Button("Centered").setConstraints(ctr3),
            new zebkit.ui.Button("2x2\n2x2\n2x2")
        ]
    }));

    var ctr = new zebkit.layout.Constraints();
    ctr.ax = "left"; ctr.ay = "top" ;
    r.add(new PAN({
        layout : new zebkit.layout.GridLayout(2,2,true, true).setPadding(8),
        kids   : [
            new zebkit.ui.Button("1x1").setConstraints(ctr),
            new zebkit.ui.Button("1x2").setConstraints(ctr),
            new zebkit.ui.Button("2x1").setConstraints(ctr),
            new zebkit.ui.Button("2x2").setConstraints(ctr)
        ]
    }).setPreferredSize(-1, 150));

    var ctr1 = new zebkit.layout.Constraints();
    var ctr2 = new zebkit.layout.Constraints();
    var ctr3 = new zebkit.layout.Constraints();
    var ctr4 = new zebkit.layout.Constraints();
    ctr1.ax = "left"; ctr1.ay = "top" ;
    ctr2.ax = "stretch"; ctr2.ay = "top" ;
    ctr3.ax = "center"; ctr3.ay = "stretch" ;
    ctr4.ax = "stretch"; ctr4.ay = "stretch";
    r.add(new PAN({
        layout : new zebkit.layout.GridLayout(2,2,true,true).setPadding(8),
        kids   : [
            new zebkit.ui.Button("1x1").setConstraints(ctr1),
            new zebkit.ui.Button("1x2").setConstraints(ctr2),
            new zebkit.ui.Button("2x1").setConstraints(ctr3),
            new zebkit.ui.Button("2x2").setConstraints(ctr4)
        ]
    }));
});
</script>

---
layout: page
parent: docs
title: HTML Elements in zebkit layout
---

Zebkit introduces unique feature - __"seamless integration of HTML elements into zebkit layout"__.  HTML elements can be placed in any zebkit UI component as if the HTML elements are also rendered on HTML5 Canvas. Placing HTML elements into zebkit layout gives the following:

   * Applying zebkit layout managers to order HTML elements in a context of zebkit layout. 
   * Combining HTML elements with rendered on the canvas zebkit UI components. Virtually (rendered on canvas) __zebkit.ui.Panel__ instances can contain HTML elements and  other way round: HTML elements can contain zebkit UI components.
   * Adding visual effects, additional graphical decorations to HTML elements. For instance google map can be annotated with zebkit tool tip, context menu and so on. In general it is possible to paint any desired content on the surface of inserted into zebkit google map HTML element.
   * Unifying input events handling. HTML elements located in zebkit layout follows the same to zebkit UI components events handling paradigm.
 
As any other zebkit UI component HTML elements have to be represented as an instances of standard __"zebkit.ui.Panel"__ class. It is done with help of __"zebkit.ui.web.HtmlElement"__ class that inherits __"zebkit.ui.Panel"__.


__HTML elements in zebkit layout__ 

Below is shown an example of zebkit application that does following:

   * add HTML _DIV_ (light green) element at the central part of zebkit root panel (ordered with zebkit border layout manager)
   * add zebkit button at the "bottom" in the root panel layout
   * add zebkit check box component at the "top" part of inserted earlier HTML _DIV_ element. Border layout is set for DIV element.  

{% include zsample.html canvas_id='webSample0' title='HTML elements in zebkit  layout' description=description %}                    

<script type="text/javascript">
zebkit.require("ui", "ui.web", function(ui, web) {
    var root = new ui.zCanvas("webSample0", 500, 300).root;
    root.setBorderLayout(8).setBorder("plain").setPadding(32);
    
    var htmlElement = new web.HtmlElement();
    htmlElement.setBorderLayout(8);
    htmlElement.setPadding(16);
    htmlElement.add(new web.HtmlElement()
                           .setContent("HTML DIV element")
                           .setColor("lightcoral")
                           .setStyle("background-color", "cream"));
    
    var c2 = new web.HtmlCanvas();
    c2.setBorderLayout();
    c2.add(new ui.Checkbox("Zebkit checkbox inside zebkit HTML element")
                 .setBackground("orange")
                 .setPadding(8));

    htmlElement.add("top", c2);

    root.add("bottom", new ui.Button("Zebkit button"));
    root.add(htmlElement).setStyle("background-color", "greenyellow");
});
</script>

```js
zebkit.require("ui", "ui.web", function(ui, web) {
    var root = new ui.zCanvas(500, 300).root;
    root.setBorderLayout(8).setBorder("plain").setPadding(32);
    
    // Create HTML DIV element
    var htmlElement = new web.HtmlElement();
    htmlElement.setBorderLayout(8); // set border layout for the DIV  
    htmlElement.setPadding(16);
    htmlElement.add(new web.HtmlElement()
            .setContent("HTML DIV element") // inner DIV content
            .setColor("lightcoral")         // font color
            .setStyle("background-color", "cream")); // CSS background
    
    // Wrap zebkit UI component with a HTML canvas element
    // if the component has to be added into an HTML element
    var c2 = new web.HtmlCanvas().setBorderLayout();
    c2.add(new ui.Checkbox("Zebkit checkbox inside HTML element")
                 .setBackground("orange")
                 .setPadding(8));

    htmlElement.add("top", c2);

    root.add("bottom", new ui.Button("Zebkit button"));
    root.add(htmlElement).setStyle("background-color", "greenyellow");
});
```


More impressive example is __scrolling HTML element with zebkit UI scroll panel component__. In this case the HTML element is scrolled with virtual, rendered on HTML canvas scrolls !  

{% include zsample.html canvas_id='webSample1' title='Scroll HTML element with zebkit scroll panel' description=description %}                    

<script type="text/javascript">
zebkit.require("ui", "ui.web", function(ui, web) {
    var root = new ui.zCanvas("webSample1", 400, 400).root;
    root.setBorderLayout(8).setBorder("plain").setPadding(32);
    
    var htmlElement = new web.HtmlElement();
    zebkit.GET("public/test.html").then(function(r) {
        htmlElement.setContent(r.responseText);        
    });

    root.add(new ui.ScrollPan(
        new web.HtmlScrollContent(htmlElement)
    ));
});
</script>


```js
zebkit.require("ui", "ui.web", function(ui, web) {
    var root = new ui.zCanvas(400, 400).root;
    root.setBorderLayout(8).setBorder("plain").setPadding(32);
    
    // Instantiate HTML element
    var htmlElement = new web.HtmlElement();

    // Load HTML element inner content (HTML table) 
    zebkit.GET("./test.html").then(function(r) {
        htmlElement.setContent(r.responseText);        
    });

    // Add the component into scroll panel.
    // Pay attention it should be wrapped with special 
    // "HtmlScrollContent" component to scroll it properly 
    root.add("center", new ui.ScrollPan(
        new web.HtmlScrollContent(htmlElement)
    ));
});
```


__Handle HTML element event following zebkit style__ 

Below find an example of handling zebkit input events ("pointerEntered" and "pointerExited") in HTML _DIV_ element. The way how it is done is the same to standard zebkit input events handling paradigm: 

{% include zsample.html canvas_id='webSample2' title='Handling zebkit input events with HTML elements' description=description %}                    

<script type="text/javascript">
    zebkit.require("ui", "ui.web", function(ui, web) {
        var root = new ui.zCanvas("webSample2", 600, 200).root;
        root.setBorderLayout().setBorder("plain").setPadding(32);
        var htmlElement = new web.HtmlElement()
        .setContent("HTML DIV element, move mouse cursor in/out");
        htmlElement.setStyle("background-color", "greenyellow");  
        
        htmlElement.pointerEntered = function(e) {
            this.setStyle("background-color", "gold");
        };    

        htmlElement.pointerExited = function(e) {
            this.setStyle("background-color", "greenyellow");
        };    
        root.add(htmlElement);
    });
</script> 

```js
zebkit.require("ui", "ui.web", function(ui, web) {
    var root = new ui.zCanvas(600, 200).root;
    root.setBorderLayout().setBorder("plain").setPadding(32);
    
    var htmlElement = new web.HtmlElement()
    .setContent("HTML DIV element, move mouse cursor in/out");

    htmlElement.setStyle("background-color", "greenyellow");  
    
    // add  "pointerEntered" events handler
    htmlElement.pointerEntered = function(e) {
        this.setStyle("background-color", "gold");
    };    
    // add pointerExited events handler
    htmlElement.pointerExited = function(e) {
        this.setStyle("background-color", "greenyellow");
    };    
    root.add(htmlElement);
});
```


__Decorate HTML element with zebkit rendering__ 

Find below an example that decorates __"zebkit.ui.web.HtmlTextField"__ HTML element with:

   * Zebkit rendered border
   * Zebkit rendered background. It paints a function as the HTML element background depending on entered by a user x value interval (e.g. 1-10, 1-100)
   
The application catches "keyReleased" event to refresh the chart with entered by a user interval. 

{% include zsample.html canvas_id='webSample3' title='Chart as a background of HTML text field' description=description %}                    

<script type="text/javascript">
    zebkit.require("ui", "ui.web", "draw", function(ui, web, draw) {
        var root = new ui.zCanvas("webSample3", 600, 300).root;
        root.setBorderLayout().setBorder("plain").setPadding(32);
      
        var fn  = new ui.TextField();
        fn.setValue("Math.cos(x)");
        root.add("bottom", fn);


        var ta = new web.HtmlTextField("Correct function interval: 0-12")
                    .setStyle("background-color", "transparent")
                    .setBorder("plain")  
                    .setFont(new zebkit.Font("Helvetica", 32));
          
        ta.keyReleased = function(e) {
            this.setBackground(null);
            var re=/((\-)?[0-9]+(.[0-9]+)?)[,\-]((\-)?[0-9]+(.[0-9]+)?)/,
                m = this.getValue().match(re);
            if (m !== null) {
                var min=parseFloat(m[1]), max=parseFloat(m[4]);
                if (max > min && !isNaN(min) && !isNaN(max)) {  
                    var func = eval(
                        "(function(x) { return "+fn.getValue()+";});"
                    ); 

                    this.setBackground(new draw.FunctionRender(function(x) {
                         //return Math.sin(x);
                          return func(x);
                     // return Math.sin(x)*Math.cos(2*x)-Math.cos(x*x); 
                    }, min, max));
                }
            } 
        };    
        ta.keyReleased(null); 
        root.add(ta);
    });
</script>   


```js
zebkit.require("ui", "ui.web", "draw", function(ui, web, draw) {
    var root = new ui.zCanvas(600, 200).root;
    root.setBorderLayout().setBorder("plain").setPadding(32);
    // Instantiate text field component 
    var ta = new web.HtmlTextField("Correct function interval: 0-12")
                .setStyle("background-color", "transparent")
                .setBorder("plain")  
                .setFont(new zebkit.Font("Helvetica", 32));
      
    ta.keyReleased = function(e) {
        this.setBackground(null); // clear layout 
        // Reg exp to detect rendered function interval enterRd by 
        // a user
        var re=/((\-)?[0-9]+(.[0-9]+)?)[,\-]((\-)?[0-9]+(.[0-9]+)?)/,
            m = this.getValue().match(re);
        if (m !== null) {
            var min=parseFloat(m[1]), max=parseFloat(m[4]);
            if (max > min && !isNaN(min) && !isNaN(max)) {  
                this.setBackground(new draw.FunctionRender(function(x) {
                  return Math.sin(x)*Math.cos(2*x)-Math.cos(x*x); 
                }, min, max));
            }
        } 
    };    
    ta.keyReleased(null); // a bit dirty trick to render initial chart
    root.add(ta); // add text field to zebkit layout
});
```


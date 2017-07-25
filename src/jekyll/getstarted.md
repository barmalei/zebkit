---
layout: page
title: Get started
tags: menu
---

In general is expected you are dealing with JS code following zebkit easy OOP concept, using and extending zebkit components. No HTML neither CSS manipulation is required. Dealing with WEB specific world should be avoided.  

   * **Take existent or create a new HTML:**

```html
<!DOCTYPE html>
<html>
    <head>
       ...
    </head>
    <body> ... </body>
</html>
```

   * **Add meta to HTML head tag for single page / mobile applications**  

```html
...
<meta name="viewport" 
   content="user-scalable=no,width=device-width,initial-scale=1,maximum-scale=1">
<meta name="msapplication-tap-highlight" content="no">
...
```

   * **Include zebkit JS in script section:**

```html
<html>
    <head>
        <script type="text/javascript"
                src="http://zebkit.org/ver/latest/zebkit.min.js">
        </script>
     ...
```

   * **Write application code:**

```js
// wrap zebkit code with require method to make sure everything
// has been initialized 
zebkit.require("ui", "layout", function(ui, layout) {
    var root = new ui.zCanvas("sample", 300, 300).root;
    root.properties({
        border:  "plain", 
        padding: 8,
        layout:  new layout.BorderLayout(6),
        kids  : {
            "center": new ui.TextArea("A text ... "),
            "bottom": new ui.Button("test") 
        }
    });
});
```

   * **Enjoy the result:**

{% include zsample.html canvas_id='sample' title="Get started zebkit application" %}

<script>
zebkit.require("ui", "layout", function(ui, layout) {
    var root = new ui.zCanvas("sample", 400, 300).root;
    root.properties({
        border:  "plain", 
        padding: 8,
        layout:  new layout.BorderLayout(6),
        kids  : {
            "center" : new ui.TextArea("A text ... "),
            "bottom" : new ui.Button("test") 
        }
    });
});
</script>

### Add events handling

```js
zebkit.require(function() {
    ...
    // find first component whose class is zebkit.ui.Button
    root.on("//zebkit.ui.Button", function() {
        // find first component whose class is zebkit.ui.TextArea
        // and clear it
        root.byPath("//zebkit.ui.TextArea").setValue("");
    })
});
```


{% include zsample.html canvas_id='sample2' title="Get started zebkit application" %}

<script>
zebkit.config["zebkit.theme"] = "dark";

zebkit.require("ui", "layout", function(ui, layout) {
    var root = new ui.zCanvas("sample2", 400, 300).root;
    root.properties({
        border:  "plain", 
        padding: 8,
        layout:  new layout.BorderLayout(6),
        kids  : {
            "center" : new ui.TextArea("A text ... "),
            "bottom" : new ui.Button("Clear text") 
        }
    });

    root.on("//zebkit.ui.Button", function() {
        root.byPath("//zebkit.ui.TextArea").setValue("");
    });
});
</script>

### Load required resources

```js
zebkit.resources("myimage.jpg", "mytext.txt", function(image, text) {
    // here you get completely loaded image and textual data  
    ...
});
```



![ScreenShot](/src/images/readme.png)

# Zebkit - HTML5 Canvas based UI framework 

**Zebkit is the next generation of zebra project. It has been heavily re-worked, re-designed and re-organized. The new version is definitely not backward compatible with zebra because of big number of changes it has got. New zebkit grabs the best ideas from previous one and takes many new concepts and features.** 

Zebkit provides impressive bunch of UI components that works on various devices, supports touch screens and fits single page application development. Implemented with help of easy OOP concept zebkit components are abstracted from WEB/CSS mess what brings support, extendibility and portability on the level of software engineering. With zebkit and its concept any imaginable UI component can be rendered on HTML5 Canvas.      

The latest version of previous generation of zebkit (zebra) can be found as "zebra" release.

# Most significant changes 

   * **DOM elements can be hosted in zebkit layout.** They look as natural as native zebkit UI components. For instance: Google map can be added into zebkit layout together with zebkit UI tool tip that will be rendered over the map. You can scroll HTML element in zebkit scroll panel even taking in account the scroll panel exists only as a rendered on HTML5 Canvas UI component:

   ```js
      ...
      var c = new zebkit.ui.zCanvas();
      c.root.setLayout(new zebkit.layout.BorderLayout());
      c.root.add(new zebkit.ui.web.HtmlElement("<an ID of an HTML element>"));
      ...
   ```

   * **Re-worked OOP and packaging, mixing.** Some aspects of easy OOP concept has been simplified: no method overloading and no single constructor. In the same time it has got possibility to define methods in interfaces and mix the interfaces into classes. Interfaces can be parametrized.

   * **JS code has been reorganized** to decouple zebkit components from WEB environment and have more clear modules dependencies tree. Most of zebkit UI components are free from a specific (WEB) context and potentially can be adapted or ported to other canvas implementations and environments. 
      
   * **Multiple devices input events unification.** Mouse, touch, pen input events are the one type of events in zebkit. Key event is normalized to have it the same for all platforms and browsers.
 
   * **New UI black theme and specially developed for zebkit yuidoc theme** with better look and feel and JavaDoc-like features are provided.   
  
  ```js
    // configure zebkit to use light theme
    zebkit.ui.config("theme", "light");  

    zebkit.require("ui", "layout", function(ui, layout) {
        // write zebkit application here
        ...
    });
  ```

   * **Massive changes in components API, new features and new components.**  

   * **"Zson" configuration and zebkit "DoIt"** as a better variation of configuration and promises. Zson extends JSON with class instantiation, JSON key references, expressions, external JSONs inclusion and so on.

  ```json
  {   "a": 100,
      "b": "%{a}",           
      "c": { "@Date": [] },
      "d": "%{../external.json}"  
  }   
  ```

   - "b" is a reference to "a"
   - "c" value will be an instance of __Date__ class
   - "d" value will be set with the loaded JSON 

# Requirements 

Zebkit works in MS Internet Explorer 10+, MS Edge, FireFox 3+, Safari 5+, Google Chrome. It should support iOS 7+ and Android 4+ mobile browsers.

Zebkit requires nodejs to be installed. If you plan to re-generate zebkit web site you have to install jekyll (https://jekyllrb.com/). If you plan to re-generate am API Doc you have to install "yuidoc" as follow:

```bash
  $npm install -g yuidocjs
```

# Installation 

To install required nodejs packages run the following command from zebkit home folder: 
```bash
    $ npm install
```

# Building zebkit artifacts

To build major zebkit artifacts (JS code) run the following command:
```bash
   $ gulp
```

To build runtime zip package (find it in "build" folder): 
```bash
   $ gulp runtime
```

To generate API doc run the following command (find generated light and dark versions of API doc in "apidoc/light" and "apidoc/dark" folders correspondingly):
```bash
   $ gulp apidoc
```

If you have installed jekyll you can initiate zebkit WEB site re-generation with the following command (find generated light and dark website versions in "website/light" and "website/dark" folders correspondingly):
```bash
   $ gulp website
```


# Run http server and view web site 

```bash
   $ gulp http
```

Open zebkit WEB site "http://localhost:8090/index.html" in a browser.

# Simple example of a zebkit application

To have an idea what zebkit programming looks like see the example code below:
```html
<!DOCTYPE html>
<html>
    <head>
        <script src='build/zebkit.min.js'
                type='text/javascript'></script>
        <script type='text/javascript'>
            zebkit.require("ui", "layout", function(ui, layout) {
                // create Canvas using JSON like style
                var zc = new ui.zCanvas();
                zc.root.properties({
                    layout: new layout.BorderLayout(4),
                    padding: 8,
                    kids  : {
                        center: new ui.TextArea("", true),
                        top   : (new ui.BoldLabel("Sample application")).properties({
                            padding : 8
                        }),
                        bottom: new ui.Button("Select all")
                    }
                }).on("//zebkit.ui.Button", function(bt) { // reg event handler
                    // select text in the text area
                    zc.byPath("//zebkit.ui.TextArea").selectAll();
                });
            });
        </script>
    </head>
    <body></body>
</html>
```

You can create, for instance, "sample.html" in zebkit home folder. Then fill the file with the content shown above and run it in a browser with the URL below:

"http://localhost:8090/sample.html"

# License

Apache License, Version 2.0 http://www.apache.org/licenses/LICENSE-2.0.html

# Contact

   * e-mail  : ask@zebkit.org
   * linkedin: http://nl.linkedin.com/pub/andrei-vishneuski/14/525/34b/


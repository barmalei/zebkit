
![ScreenShot](http://repo.zebkit.org/zebkit.logo.png)

## Zebkit - HTML5 Canvas based UI framework 

**Zebkit is the next generation of zebra project. It has been heavily re-worked, re-designed and re-organized. The new version is definitely not backward compatible with zebra because of big number of changes it has got. New zebkit grabs the best ideas from previous one and takes new one** 

## Most significant changes 

   * **DOM elements can be hosted in zebkit layout** They look as natural as native zebkit UI components. For instance: google map can be added into zebkit layout together with zebkit UI tool tip that will be rendered over the map. You can scroll HTML element in zebkit scroll panel even taking in account the scroll panel exists only as a rendered on HTML5 Canvas UI component.

   * **Re-worked OOP and packaging, mixing.** Easy OOP concept has been from one hand simplified: no method overloading and no single constructor. From another hand has got possibility to define methods in interfaces and mix the interfaces into classes. More over interfaces can be parametrized.

   * **JS code has been reorganized** to decouple zebkit components from WEB environment and have clear module dependencies tree. Most of zebkit UI components are free from a specific (WEB) context and potentially can be adapted or ported to other canvas implementations and environments. 
      
   * **Input event unification.** One type of event for mouse, touch, pen etc events. Normalized key event that is the same for all platforms. 
 
   * **New black theme and specially developed for zebkit yuidoc theme** with better look and feel and JavaDoc-like features.   
      
   * Massive changes, updates, new features and components. 

   * **"Zson" configuration and zebkit "DoIt"** as a better variation of promise. Zson extends JSON with class instantiation, references, expressions, external JSONs inclusion and so on.

## Requirements 

Zebkit works in MS Internet Explorer 9+, MS Edge, FireFox 3+, Safari 5+, Google Chrome. It should support iOS 7+ and Android 4+ mobile browsers.

To build the package install nodejs. To generate zebkit artifacts install jekyll (https://jekyllrb.com/). 

## Installation 

To install required packages run the following: 
```bash
    $ npm install
```

## Building zebkit artifacts

To build main artifacts like JS code, website:
```bash
   $ gulp
```

To build runtime package 
```bash
   $ gulp runtime
```

To generate apidoc:
```bash
   $ gulp apidoc
```

## Run http server and view web site 

```bash
   $ gulp http
```

Open "http://localhost:8090/index.html" in a browser.

## Simple example of a zebkit application

```html
<!DOCTYPE html>
<html>
    <head>
        <script src='http://repo.zebkit.org/latest/zebkit.min.js'
                type='text/javascript'></script>
        <script type='text/javascript'>
            zebkit.require("ui", "layout", function(ui, layout) {
                // create Canvas using JSON like style
                (new zCanvas()).root.properties({
                    layout: new layout.BorderLayout(),
                    kids  : {
                        center: new ui.TextField("", true),
                        top   : (new ui.BoldLabel("Sample application")).properties({
                            padding : 8
                        }),
                        bottom: new ui.Button("Ok")
                    }
                });
            }).on("//zebkit.ui.Button", function(bt) { // reg event handler
                // handle button pressed here
                ...
            }); 
        </script>
    </head>
    <body></body>
</html>
```

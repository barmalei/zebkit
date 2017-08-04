---
layout: page
parent: docs
---

## UI component self configuration 

Zebkit UI components apply default properties values during its instantiation. The properties values are read from static context of appropriate UI component class or from a parent class. For instance, if we want to change color of all subsequent "zebkit.ui.Label" component instances we can change it on class level:

```js
// specify default label color value in label class static context;  
zebkit.ui.Label.color = "orange";
...
// the label instance will have color set to "orange"
var lab = new zebkit.ui.Label("Label");
```

inheritProperties


## Configuration resources 

Configuration 

```bash
[rs]                      # root resource folder
 +-- [light]              # light theme resources folder
 |     +--  ui.json       # zebkit.ui package configuration  
 |     +--  ui.web.json   # zebkit.ui.web package configuration
 |     +--  ui.tree.json  # zebkit.ui.tree package configuration
 |     +--  ui.grid.json  # zebkit.ui.grid package configuration
 +-- [dark]               # dark theme resources folder
 |     +--  ui.json
 |     +--  ui.web.json
 |     +--  ui.tree.json
 |     +--  ui.grid.json
 |
 +-- ui.common.json
```


Configuration for a dedicated package are placed in dedicated json file. The JSON is loaded during zebkit initialization phase to fulfill the given package with Zson values.  


```json
"TextField" : {
    "border"     : { "@zebkit.draw.Border":[ "red", 2 ]},
    "color"      : "white",
    "background" : { "@zebkit.draw.Gradient":[ "red", "orange" ]},
}
```


You can build an own JSON to configure:

```js
zebkit.ui.configPackage(zebkit.ui, "my.json");
```


inheritProperties

## Theme configuration


zebkit.config["ui.theme.path"] = "../rs/themes/light";

zebkit.config["ui.theme.name"] = "light";


## Zson as form descriptive language 

---
author: admin
comments: true
date: 2013-06-22 13:50:41+00:00
layout: page
slug: json-like-ui-definition
title: JSON and UI definition
wordpress_id: 2050
---

[purehtml id=26]
JSON format is handy and clear way to declare various configurations, transfer data between clients and servers, etc. Zebra also utilizes JSON format and JSON-like JavaScript code style to define UI. In the first case you have to create JSON file, store it somewhere and than load it to build UI. In the second case, you just write JavaScript code following JSON-like style what can help to make your code more beautiful and simple. Thus you have three "flavors" of UI declaration: classical, JSON, JSON JavaScript like coding.

**Classical UI definition**

Let's build simple Zebra UI application following "classical" approach:

[wpcol_2third][js gutter="false"]
// create canvas
var r=new zebra.ui.zCanvas(200,200).root;
r.setLayout(new zebra.layout.BorderLayout(4,4));
r.setPadding(4);
r.setBorder("plain");

// add title label
var l = new zebra.ui.BoldLabel("Simple application");
l.setPadding(4);
l.setBackground("lightGray");
r.add(zebra.layout.TOP, l);
r.add(zebra.layout.CENTER,
      new zebra.ui.TextArea(""));
r.add(zebra.layout.BOTTOM,
      new zebra.ui.Button("Clear"));
[/js][/wpcol_2third]
[wpcol_1third_end]

[/wpcol_1third_end]


**JSON UI definition**

Let's build the same UI basing on JSON definition:

[js gutter="false"] {
   "padding": 4,
   "layout": { "$zebra.layout.BorderLayout":[ 4, 4] },
   "border": "plain",
   "kids": {
      "TOP": {
         "$zebra.ui.BoldLabel": "Simple application",
         "padding":4,
         "background": "lightGray"
      },
      "CENTER": {
         "$zebra.ui.TextArea": ""
      },
     "BOTTOM": {
         "$zebra.ui.Button": "Clear"
     }
  }
}
[/js]

To load the JSON definition the following code can be used:
[js gutter="false"]
   // create canvas and load JSON definition to its root
   new zebra.ui.zCanvas(200, 200).root.load("myui.json");
[/js]

The result of the code shown above is an application with the same UI we have created with "classical" approach. It is expected the JSON definition is stored as "myui.json" file at the same place where your demo script is.

Pay attention you can load JSON defined UI in any part of your application. "zebra.ui.Panel" class declare special "load(ref)" method to do it. So, you can keep complex UI definition in different JSON files. For example, let's load four panels that are placed in grid layout from the same JSON UI definition. Firstly let's write JSON definition:
[js gutter="false"]
{
    "kids": [
        {
            "$zebra.ui.Panel":[],
            "layout" : { "$zebra.layout.BorderLayout" :[4, 4] },
            "padding": 4,
            "border" : "plain",
            "kids"   : {
                "TOP": {
                    "$zebra.ui.BoldLabel": "Simple application",
                    "padding"            : 4,
                    "background"         : "lightGray"
                },

                "CENTER": {
                    "$zebra.ui.TextField": ""
                },

                "BOTTOM": {
                    "$zebra.ui.Button": "Clear"
                }
           }
       }
    ]
}
[/js]

Than load it four times:
[wpcol_2third][js gutter="false"]
   // create canvas and load JSON definition to
   // its root
   var r = new zebra.ui.zCanvas(400, 350).root;
   r.setLayout(new zebra.layout.GridLayout(2,2));
   r.load("pan.json");
   r.load("pan.json");
   r.load("pan.json");
   r.load("pan.json");
[/js][/wpcol_2third][wpcol_1third_end][/wpcol_1third_end]

The JSON definition loading works as follow:




  * 
Read provided JSON definition by HTTP GET method



  * 
Parse the read definition starting from "kids" field:


    * 
Look for a property "kids" in "r" panel.



    * 
Call "kids" property "setKids" setter from "r" panel. This causes creation by JSON description panel and adding it as "r" panel children component.









Zebra interprets some JSON definition using special semantical rules. For instance the following JSON snippet:
[js gutter="false"]
  ...
  test : {
     "$zebra.ui.Panel":[]
     padding: 10
     ...
  }
  ...
[/js]
says: instantiate "zebra.ui.Panel" class, set property "padding" of the instance to 10 and assign the panel instance to "test" key.


**JSON JavaScript code style UI definition**

At last, let define the same UI following JSON like JavaScript coding:
[js gutter="false"]
new zebra.ui.zCanvas(200,200).root.properties({
   layout  : new zebra.layout.BorderLayout(4,4),
   padding : 4,
   border  : "plain",
   kids: {
      TOP: new zebra.ui.BoldLabel("Simple application").properties({
          padding: 4,
          background: "lightGray"
      }),
      CENTER: new zebra.ui.TextArea(),
      BOTTOM: new zebra.ui.Button("Clear")
   }
});
[/js]



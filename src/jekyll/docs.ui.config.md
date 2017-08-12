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

```sh
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


Configuration for a dedicated package are placed in dedicated JSON file. The JSON is loaded during zebkit initialization phase to fulfill the given package with desire values.  


```json
"TextField" : {
    "border"     : { "@zebkit.draw.Border":[ "red", 2 ]},
    "color"      : "white",
    "background" : { "@zebkit.draw.Gradient":[ "red", "orange" ]}
}
```


You can build an own JSON to configure:

```js
zebkit.ui.configPackage(zebkit.ui, "my.json");
```


inheritProperties

## Theme configuration

By default zebkit expects theme resources are located at the the same level where zebkit JS code is located. You can switch to required UI theme with setting special configuration variable:  

```js
// say to use light theme
zebkit.config["ui.theme.name"] = "light"; // name of theme folder
```

If a case zebra theme resources are not located together with JS code you can specify path to the resources with setting appropriate configuration variable: 

```js
// define path to light theme    
zebkit.config["ui.theme.path"] = "http://test.com./zebkit/rs/light";
```


## Zson as form descriptive language 

JSON format is handy and clear way to declare various configurations, transfer data between clients and servers, etc. Zebkit extends JSON format interpretation with number of powerful features what allows developer to use it for UI form definition. 

To load the JSON definition the following code can be used:

```js
    zebkit.require("ui", function(ui) {
        new ui.zCanvas(400, 300).root.load("simple.json");
    });
```

For example, let's load the following Zson:

```json
{
    "layout": { "@zebkit.layout.BorderLayout" :4 },
    "kids": [
        {
            "@zebkit.ui.Panel":[],
            "layout" : { "@zebkit.layout.BorderLayout" :4 },
            "padding": 4,
            "border" : "plain",
            "kids"   : {
                "top": {
                    "@zebkit.ui.BoldLabel": "Simple application",
                    "padding"            : 4,
                    "background"         : "lightGray"
                },

                "center": {
                    "@zebkit.ui.TextField": ""
                },

                "bottom": {
                    "@zebkit.ui.Button": "Clear",
                    "! fired": {
                        "path"  : "//textField",
                        "action": {

                        }    
                    }
                }
           }
       }
    ]
}
```

The result of the loading is shown below:

{% include zsample.html canvas_id='zsonForm1' title='Children UI events handling' description=description %}                    

<script type="text/javascript">
    zebkit.require("ui", function(ui) {
       var r = new ui.zCanvas("zsonForm1", 400, 300).root;
       r.load("public/simple.json").catch();
    });
</script>



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



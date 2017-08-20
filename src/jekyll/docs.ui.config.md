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
{
"TextField" : {
    "border"     : { "@zebkit.draw.Border":[ "red", 2 ]},
    "color"      : "white",
    "background" : { "@zebkit.draw.Gradient":[ "red", "orange" ]}
}
}
```


You can build an own JSON to configure:

```js
zebkit.ui.configWith("/my.json");
```


inheritProperties

## Theme configuration

By default zebkit expects theme resources are located at the the same level where zebkit JS code is located. You can switch to required UI theme with setting special configuration variable:  

```js
// say to use light theme
zebkit.ui.config("theme", "light"); // name of theme folder
```

If a case zebra theme resources are not located together with JS code you can specify path to the resources with setting appropriate configuration variable: 

```js
// define path to light theme    
zebkit.ui.config("basedir", "http://test.com./zebkit/rs/light");
```

Or you can use placeholder to add theme name to the path:

```js
// define path to light theme    
zebkit.ui.config("basedir", "http://test.com./zebkit/rs/%{theme}");
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
    "layout": { "@zebkit.layout.StackLayout" : []},
    "kids"  : [{
        "@zebkit.ui.Panel": [],
        "layout" : { "@zebkit.layout.BorderLayout" :4 },
        "padding": 4,
        "border" : "plain",
        "kids"   : {
            "top": {
                "@zebkit.ui.BoldLabel": "Simple application",
                "padding"             : 4
            },
            "center": { "@zebkit.ui.TextArea": "" },
            "bottom": {
                "@zebkit.ui.Button": "Clear",
                "canHaveFocus"     : false
            }
       }
    }],
    "#actions" : [{
        "source"  : "//zebkit.ui.Button",
        "target"  : {
            "path"   : "//zebkit.ui.TextArea",
            "update" : { "value": "" }
        }
    }]
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

There is "#actions" section in the JSON shown above. The section allows developers to declare simple event handling. In this particular case the section says to clear text area component text by button click. Full supported features of the section are shown below:

<table class="info">
<tr><th>
JSON element    
</th><th>
Description
</th></tr>

<tr><td>
"#actions.source"    
</td><td>
Path to identify a source component that fires an event(s)
</td></tr>

<tr><td>
"#actions.event"    
</td><td>
Optional an event name that has to be handled from the source
</td></tr>

<tr><td>
"#actions.targets" or
<br/>
"#actions.target"    
</td><td>
List of targets ("#actions.targets") components or single target ("#actions.target") component to be updated by the source event(s)
</td></tr>

<tr><td>
"#actions.target.path" 
</td><td>
Path to detect a target component
</td></tr>

<tr><td>
"#actions.target.update" 
</td><td>
Properties set the target has to be updated
</td></tr>

<tr><td>
"#actions.target.do" 
</td><td>
Set of actions over the target component  
</td></tr>

</table>

## Composing Zson

Zson can be composed from multiple JSONs. Zson guarantees everything is loaded in a order it is mentioned in Zson.   

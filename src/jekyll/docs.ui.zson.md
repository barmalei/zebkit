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

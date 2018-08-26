---
layout: page
tags: menu
id: about
title: Zebkit ?
---

Zebkit is unique UI platform that renders hierarchy of UI components on HTML5 Canvas. It has minimal dependencies from WEB context and built with zebkit easy JS OOP approach what makes feasible to adapt zebkit UI to other canvas implementations. 

{% capture description %}
Abstract JavaScript API, powerful OOP concept, rich UI components set is good basement for software engineering with reduced impact of typical WEB development mess.
{% endcapture %}

{% include zsample2.html canvas_id='designer' title='Simple zebkit application to shape and move components' description=description %}

<br/>
Zebkit is perfect choice for development of mobile, single page applications with no limitations regarding desirable UI components set. Everything can be rendered with zebkit and packaged as a re-usable components.  

<script>

zebkit.require("ui", "layout", "ui.design", function(ui, layout, design) {
    var root = (new ui.zCanvas("designer", 400, 300)).root;
    root.properties({
        borderLayout : [4, 4],
        padding: 8,
        kids: {
            center: new ui.BorderPan("Designer panel", new ui.Panel({
                padding: 6,
                kids: [
                    new design.ShaperPan(new ui.Checkbox("Check-box")
                            .properties({
                        value:true,
                        location: [10, 10]
                            })
                    ),

                    new design.ShaperPan(new ui.Button("Button")
                            .properties({
                        value:true,
                        location: [190, 50]
                            })
                    ),

                    new design.ShaperPan(new ui.TextField("Text Field")
                            .properties({
                        size : [120, 60],
                        location: [30, 100]
                            })
                    )
                ]
            })),

            bottom: new ui.Button("Align", [
                function $fire() {
                    this.$super();
                    var y = 10; 
                    root.byPath("//zebkit.ui.design.ShaperPan", function(c) {
                        c.toPreferredSize();
                        c.setLocation(10, y);
                        y += c.height + 5;                        
                    });
                }
            ])
        }
    });
});
</script>

![ScreenShot]( {{ site.baseurl }}public/images/overview-{{site.themeId}}.png)

**Easy OOP JavaScript concept** _Dart_, _CoffeeScript_, _TypeScript_ and other helping intermediate technologies are not necessary. Zebkit easy JavaScript OOP gives power to keep code under control, increases re-usability and simplifies support. Easy OOP produces classes and interfaces, inheritance and mixing, constructor, static context, method overriding, **true access to super context**, **anonymous classes**, packaging, dynamic class extension, etc. 
   
```js
var A = zebkit.Class([  // class A declaration 
    function() { ... }, // constructor
    function a() { return 1; } // declare class method "a"
]);
var B = zebkit.Class(A, [ // declare class B that inherits A 
    function() { this.$super(); }, // call super constructor
    function a() { // overriding method "a"
        return 1+this.$super(); // call method super implementation 
    }
]);

var a = new A(), // class A instantiation
    b = new B([ // customize class B instance on the fly
        function a() { return 0; }, // override method
        function b() { return 3; }  // add new method 
   ]);     
a.a();  // call "a" method => 1
b.a();  // call "a" method => 2
b.b();  // call "b" method => 3
```
   
<br/>

**Everything is rendered on canvas** Practically any required UI component can be developed with help of zebkit components model and API. Zebkit abstraction makes UI components development easier, UI components layout managers eliminates dealing with CSS/DOM stuff. 

{% capture description %}
<ul>
   <li>Example of syntactic highlighting of code</li>
   <li>Example of very simple implementation of charts</li>
   <li>Example of text field rendering customization</li>    
</ul>
{% endcapture %}

{% include zsample.html canvas_id='renderingSample' title='Customized rendering' description=description%}

<script type="text/javascript">
zebra_image = null;
zebkit.resources("public/images/zebra-pattern.png", function(img) {
    zebra_image = img;
});

zebkit.require("ui", "layout", "draw", function(ui, layout, draw) {
    var ZebkitTextRender = zebkit.Class(draw.TextRender, [
        function(t, reflection) {
            if (arguments.length === 1) {
                reflection = false;
            }
            this.$super(t);
            this.image = zebra_image;
            this.reflectionGap = -40;
        },

        function getLineHeight() {
            return this.hasReflection ? this.font.height * 2 + 
                                        this.reflectionGap 
                                      : this.font.height;
        },

        function paintLine(g,x,y,line,d) {
            var gradient=g.createLinearGradient(x,y,x,y+this.font.height);

            if ('{{site.themeId}}' === 'dark') {
                gradient.addColorStop(0.1, '#222');
                gradient.addColorStop(0.35, '#fff');
                gradient.addColorStop(0.65, '#fff');
                gradient.addColorStop(1.0, '#000');
            } else {
                gradient.addColorStop(0.1, 'orange');
                gradient.addColorStop(0.35, 'white');
                gradient.addColorStop(0.65, 'white');
                gradient.addColorStop(1.0, 'orange');
            }

            g.fillStyle = gradient;            
            g.fillText(this.getLine(line), x, y);
            g.fillStyle = this.pattern;
            g.fillRect(x, y,this.calcLineWidth(line),this.getLineHeight());
        },

        function paint(g,x,y,w,h,d) {
            this.pattern = g.createPattern(this.image, 'repeat');
            this.$super(g,x,y,w,h,d);
        }
    ]);

    var root = new ui.zCanvas("renderingSample", 450, 300).root;
    root.setBorderLayout(8);
    root.add(new ui.TextField(new ZebkitTextRender("Zebkit ...")).properties({
        cursorView    : "red",
        curW          : 3,
        selectionColor: "gray",
        background    : "black",
        font          : new zebkit.Font("Arial", 100)
    }));
    
    var SimpleChart = zebkit.Class(ui.Panel, [
        function(fn, x1, x2, col) {
            this.$super();
            var r = new draw.FunctionRender(fn,x1,x2,150,col)
            r.lineWidth = 4;
            this.setBackground(r);        
        }
    ]);

    var SynRender = new zebkit.Class(draw.TextRender, [
        function(content) {
            this.words = {};
            this.$super(content);
            this.setFont("Courier", 16);
        },

        function paintLine(g,x,y,line,d){
            var s  = this.getLine(line), 
                v  = s.split(/\s/), 
                xx = x;

            for(var i = 0; i < v.length; i++){
                var str = v[i], color = this.words[str];
                str += " ";
                g.setColor(color != null ? color : this.color);
                g.fillText(str, xx, y);
                xx += this.font.stringWidth(str);
            }
        }
    ]);

    sh = new SynRender("public class Test\nextends Object {\n    static {\n        if (a > 0) {\n            a = 10;\n        }\n    }\n}").setColor("white");

    if ('{{site.themeId}}' === 'light') {
        sh.words= {"class"   : "#55DD22", "public" : "#FF7744",
                   "extends" : "#FF7744", "static" : "#FF7744",
                   "if"      : "#55DD22", "==":"green"          };
    } else {
        sh.words= {"class"   : "#55DD22", "public" : "#FF7744",
                   "extends" : "#FF7744", "static" : "#FF7744",
                   "if"      : "#55DD22", "==":"green"          };
    }

    var cpan = new ui.Panel().setPreferredSize(230, 120);
    cpan.setStackLayout();
    cpan.add(new SimpleChart(function(x) {
        return Math.cos(x) * Math.sin(x) - 2 * Math.sin(x*x);
    }, -2, 5, "#FF7744"));
    cpan.add(new SimpleChart(function(x) {
        return Math.cos(x) * Math.sin(x) + 2 * Math.sin(x*x);
    }, -2, 1, "#55DD22"))

    var pan = new ui.Panel({
        flowLayout: 8,
        kids: [ 
           new ui.Label(sh)
                 .setColor('{{site.themeId}}'=='light'?"gray":"white"), 
           cpan 
        ]
    });
    root.add("top", pan);
});
</script>

<br/>

**HTML elements in zebkit layout** Zebkit is able to host HTML elements in zebkit layout. You can add HTML5 Canvas elements, Google map, native HTML input fields and treats them as standard zebkit UI components. 

{% capture description %}
<ul>
   <li>Google map is in zebkit border panel</li>
   <li>Zebkit tool tip is shown every time a mouse is in google map element</li>
   <li>Zebkit context menu is shown on google map</li>
   <li>Control google layer with zebkit combo component</li>
</ul>
{% endcapture %}


{% include zsample.html canvas_id='sampleGoogleMap' title="DOM elements integrated in zebkit layout" description=description %}

<script>
    var gmap = null;
    function initMap() {
        zebkit.require("ui", "draw", "layout", function(ui, draw, layout) {
            var c   = new ui.zCanvas("sampleGoogleMap", 400, 400),
                map = new zebkit.ui.web.HtmlElement();
            map.setAttribute("id", "map");
            map.tooltip = new ui.Tooltip("Zebkit Tooltip");
                                                       
            map.popup = new ui.Menu(["Zebkit", "Context", "Menu"]);
            gmap = map.element;
            c.root.properties({
                borderLayout : 8,
                padding: 16,
                border : new draw.Border("red", 2, 6),
                kids: {
                    center : new ui.BorderPan(
                        "Google Map in zebkit layout", map
                    ),
                    bottom: new ui.Combo([
                        "TERRAIN",  "ROADMAP", "SATELLITE" 
                    ]).properties({ border: new draw.Border("red", 1, 6) })  
                }
            });

            var gmap = new google.maps.Map(gmap, {
                center: {lat: -34.397, lng: 150.644},
                scrollwheel: false,
                zoom: 8
            });

            var combo = c.byPath("//~zebkit.ui.Combo"); 
            combo.select(1);
            combo.on(function(src) {
                gmap.setMapTypeId(google.maps.MapTypeId[src.getValue()]);    
            });

            c.setSize(400, 401);
        });
    }
</script>
<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDHbhEB-ZtVg7-eXE1yLioDSR2MIafnsIs&callback=initMap"> </script>

<br/>

**Unification of input events** Mouse, touch screen, pen input events in zebkit are handled with one common approach. Keyboard events management produces the same sequence of events and its fields everywhere.

```js
var root = new zebkit.ui.zCanvas(300, 300).root;
root.pointerPressed = function(e) {
    // catch and handle mouse pressed, touch etc events here
    ... 
}  
```

<br/>

**Customizable UI components shape** Zebkit UI components are not restricted with rectangular shape. They can have a custom shape. 

{% include zsample.html canvas_id='customShapeSample' title="Custom shaped UI components" %}

<script>
zebkit.require("ui", "draw", "layout", function(ui, draw, layout) {
    var zcan = new ui.zCanvas("customShapeSample", 550, 250),
        root = new ui.Panel(new layout.FlowLayout("center", 
                                                  "center", 
                                                  "vertical", 16));
    zcan.root.setFlowLayout(16);
    zcan.root.add(root);


    var RoundButton = zebkit.Class(ui.Button, [
        function (target) {
            this.$super(target);
            this.setBorder ({
                "pressed.over" : new draw.RoundBorder("#AACCDD", 4),
                "pressed.out"  : new draw.RoundBorder("black", 4),
                "over"         : new draw.RoundBorder("orange", 4),
                "out"          : new draw.RoundBorder("red", 4)
            });

            this.setBackground({
                "pressed.over" : "#DDFFCC",
                "pressed.out"  : "#DDFFFF",
                "over" : "red",
                "out" : "orange"
            });
        },

        function contains(x, y) {
            var a = this.width / 2, 
                b = this.height / 2;
            x -= a;
            y  = -y + b;
            return  (x * x)/(a * a) + (y * y)/(b * b) <= 1;
        }
    ]);

    var Cloud = zebkit.Class(draw.Shape, [
        function outline(g,x,y,w,h,d) {
            g.beginPath();
            g.moveTo(x + w * 0.2, y  +  h * 0.25);
            g.bezierCurveTo(x, y+h*0.25, x, y+h*0.75, x+w*0.2,y+ h*0.75);
            g.bezierCurveTo(x+0.1*w,y+h-1,x+0.8*w, y+h-1,x+w*0.7,y+h*0.75);
            g.bezierCurveTo(x+w-1,y+h*0.75,x+w-1,y,x+w*0.65,y + h*0.25);
            g.bezierCurveTo(x+w-1,y,x+w*0.1,y,x+w*0.2,y + h * 0.25) ;
            g.closePath();
            return true;
        }
    ]);

    var TriangleBorder = zebkit.Class(draw.Shape, [
        function outline(g,x,y,w,h,d) {
            g.beginPath();
            x += this.lineWidth;
            y += this.lineWidth;
            w -= 2 * this.lineWidth;
            h -= 2 * this.lineWidth;
            g.moveTo(x + Math.floor(w / 2) - 1, y);
            g.lineTo(x + w - 1, y + h - 1);
            g.lineTo(x, y + h - 1);
            g.closePath();
            return true;
        }
    ]);

    var TriangleButton = zebkit.Class(ui.Button, [
        function(target, color) {
            this.$super(target);
            this.setBorder(new TriangleBorder(arguments.length > 1 ? color
                                                                   : "red",
                           4));
        },

        function contains(x, y) {
            var w = this.width, 
                h = this.height,
                x1 = Math.floor(w/2) - 1, 
                x2 = w - 1, 
                x3 = 0,
                y1 = 0, y2 = h - 1, y3 = y2,
                b1 = ((x - x2) * (y1 - y2) - (x1 - x2) * (y - y2)) < 0,
                b2 = ((x - x3) * (y2 - y3) - (x2 - x3) * (y - y3)) < 0,
                b3 = ((x - x1) * (y3 - y1) - (x3 - x1) * (y - y1)) < 0;
            return b1 == b2 && b2 == b3;
        }
    ]);

    var SimpleChart = zebkit.Class(ui.Panel, [
        function(fn, x1, x2, dx, col) {
            this.fn = fn;
            this.x1 = x1;
            this.x2 = x2;
            this.dx = dx;
            this.color = col;
            this.lineWidth = 2;
            this.$super();
        },
        function validate() {
            var b = this.isLayoutValid;
            this.$super();
            if (b === false)  {
                var maxy = -1000000, miny = 1000000, fy = [];
                for(var x=this.x1, i = 0; x < this.x2; x += this.dx, i++) {
                    fy[i] = this.fn(x);
                    if (fy[i] > maxy) maxy = fy[i];
                    if (fy[i] < miny) miny = fy[i];
                }

                var left = this.getLeft() + this.lineWidth,
                    top  = this.getTop() + this.lineWidth,
                    ww = this.width-left-this.getRight()-this.lineWidth*2,
                    hh = this.height-top-this.getBottom()-this.lineWidth*2,
                    cx  = ww/(this.x2 - this.x1), cy = hh/ (maxy - miny);

                var t = function (xy, ct) {
                    return ct * xy;
                };

                this.gx = [ left ];
                this.gy = [ top + t(fy[0] - miny, cy) ];
                for(var x=this.x1+this.dx,i=1;i<fy.length;x+=this.dx,i++) {
                    this.gx[i] = left + t(x - this.x1, cx);
                    this.gy[i] = top  + t(fy[i] - miny, cy);
                }
            }
        },

        function paint(g) {
            g.beginPath();
            g.setColor(this.color);
            g.lineWidth = this.lineWidth;
            g.moveTo(this.gx[0], this.gy[0]);
            for(var i = 1; i < this.gx.length; i++) {
                g.lineTo(this.gx[i], this.gy[i]);
            }
            g.stroke();
        }
    ]);

    var b = new ui.Button(new ui.Label("Cloud button").setColor("white"));
    b.setBackground({
        "over"         : "red",
        "out"          : "orange",
        "pressed.over" : "black" 
    });
    b.setBorder(new Cloud("red", null, 4));
    b.setPreferredSize(140, 90);
    root.add(b);

    var b1=new RoundButton(new ui.ImagePan("public/images/boat.png")
                                 .setPadding(6)),
        b2=new RoundButton(new ui.ImagePan("public/images/drop.png")
                                 .setPadding(6)),
        b3=new RoundButton(new ui.ImagePan("public/images/bug-o.png")
                                 .setPadding(6));
    root.add(new ui.Panel({
        flowLayout: [ "center","center","horizontal", 8 ],
        kids  : [ b1, b2, b3 ]
    }));

    var lab = new ui.ImageLabel("Triangle\nbutton", 
                                new ui.ImagePan("public/images/bug-o.png").setPreferredSize(32,32));
    lab.setImgAlignment("bottom");
    lab.setPadding(14,0,0,0);
    lab.setColor("black");
    var tb = new TriangleButton(lab.setFont("bold"));
    zcan.root.add(tb.setPreferredSize(200, 150));
});
</script>

<br/>

**JSON UI descriptive language** Zebkit UI can be defined and loaded with a special human readable JSON. 

```json
{ "@zebkit.ui.Panel": {
    "borderLayout" : 4 ,
    "padding": 16, 
    "border" : "plain",
    "kids"   : {
        "center": {
            "@zebkit.ui.Tabs" : [],
            "kids" : {
                "TextArea" : { "@zebkit.ui.TextArea": "Text" },
                "Tree"     : { "@zebkit.ui.tree.Tree" : {
                    "value" : "Root Node",
                    "kids"  : [
                        { 
                            "value" : "Node 1",
                            "kids"  : [ 
                                "Sub node of node 1.1", 
                                "Sub node of node 1.2"
                            ] 
                        },"Node 2", "Node 3"
                    ]}
                },
                "Grid" : { "@zebkit.ui.grid.Grid" :  [
                    [  [ "Item 1",  "Item 2",  "Item 3" ],
                       [ "Item 4",  "Item 5",  "Item 6" ],
                       [ "Item 7",  "Item 8",  "Item 9" ],
                       [ "Item 10", "Item 11", "Item 12"],
                       [ "Item 13", "Item 14", "Item 15"]  ]
                ], "topCaption":[ "Head 1", "Head 2", "Head 3"]}
            }
        }
    }
}}
```

Find below zebkit application that has been created and loaded with the JSON shown above:

<table cellspacing="0" cellpadding="0" border="0" style="margin:0px;">
<tr style="padding:0px;">
<td align="left" valign="top" style="padding:0px;">
{% include zsample.html canvas_id='jsonSample' title="UI loaded and built with Zson" %}
</td><td align="left" valign="top" style="padding:0px;" markdown='1'>

```js
zebkit.require("ui","layout",
function(ui, lay) {
    var c = new ui.zCanvas(300,300),
        r = c.root;
    r.setStackLayout();

    zebkit.Zson
          .then("simpleapp.json")
          .then(function(b) {
              root.add(b.root);
          });
});
```

</td></tr></table>

<br/>

<script>
zebkit.require("ui", "layout", function(ui, layout) {
    var root = new ui.zCanvas("jsonSample", 300, 300).root;
    root.setStackLayout();
    zebkit.Zson.then("public/simpleapp.json").then(function(bag) {
        root.add(bag.root);
    }).catch();    
});
</script>

**More than 40 various UI components** Zebkit includes set of highly customizable UI components that are ready to use or extend.    

{% include zsample.html canvas_id='sampleRichSet' title="Number of zebkit UI components"%}

<script type="text/javascript">
    zebkit.require("ui", "ui.grid", "ui.tree","ui.design", "layout", 
                   function(ui, gr, tr, design, layout) 
    {
        var root = new ui.zCanvas("sampleRichSet", 650, 750).root;
        root.setRasterLayout(true);

        root.add(new ui.Button("Button"));
        root.add(new ui.Button(
            "@(public/images/bug-o.png):32x32Image\nbutton")
        ).setLocation(30, 45);

        root.add(new ui.Link(new zebkit.data.Text("Just a simple\nLink"))
                       .setLocation(150,30));

        root.add(new ui.TextField("Text field").setLocation(250, 540)
                       .setPreferredSize(150, -1));

        var grid = new gr.Grid([
           [   "Item 1.1", 
               "Item 1.2",
                new ui.ImagePan("public/images/bmw_small.png", [
                    function imageLoaded() { 
                        if (grid != null) grid.vrp(); 
                    }
               ]).setPreferredSize(32, 32)
           ],
           [   "Item 2.1", 
               "Item 2.2",
                new ui.ImagePan("public/images/saab_small.png")
                      .setPreferredSize(32,32)
           ],
        ]); 
        grid.defXAlignment = "center"; 
        grid.setUsePsMetric(true);
        grid.setCellPadding(8);

        grid.add("top", new gr.CompGridCaption([
          "Title 1", 
          "Title 2", 
             new ui.ImageLabel(new gr.CompGridCaption.Link("Title 3"), 
             new ui.ImagePan("public/images/wbug.png")
               .setPreferredSize(24,24))
               .setPadding(4,4,4,8)
       ]));
       
        grid.add(new gr.LeftCompGridCaption([ "I", "II" ]));
       
        var checks = new ui.Panel(new layout.FlowLayout("left", 
                                                        "center",
                                                        "vertical", 4));
        checks.add(new ui.Checkbox("Checkbox"));
        checks.add(new ui.Line("orange", "red").setConstraints("stretch"));
        var group = new ui.Group(); 
        checks.add(new ui.Radiobox("Radiobox 1", group));
        checks.add(new ui.Radiobox("Radiobox 2", group));
        checks.setPadding(8);
        root.add(new ui.BorderPan("Checkboxes", checks).setLocation(30, 300));        
        root.add(grid.setLocation(10,150));
  
        var tabs = new ui.Tabs();
        tabs.setPreferredSize(360, 260);
   
        tabs.add("Scroll panel", new ui.ScrollPan(new ui.ImagePan(
            "public/images/flowers2.jpg"
        )).setAutoHide(true));

        tabs.add("Split panel", new ui.SplitPan(
            new ui.ImagePan("public/images/flowers3.png").setPadding(8), 
            new ui.SplitPan(
                new ui.ImagePan("public/images/flowers.jpg").setPadding(8),
                new ui.ImagePan("public/images/landscape.jpg").setPadding(8), 
                "horizontal"
            ).setGripperLoc(100)
        ).setGripperLoc(120));

        var p = new ui.Panel(
            new layout.GridLayout(2,2,true,true).setPadding(4)
        );
        
        p.add(new ui.BorderPan("Label"));
        p.add(new ui.BorderPan(
            "@(public/images/honda_small.png):20x20Image label"
        ));
        p.add(new ui.BorderPan("Label").setAlignment("center"));
        p.add(new ui.BorderPan("[x]Interactive Label")
                    .setOrientation("bottom")
                    .setAlignment("right"));

        tabs.add("Border panel", p);
        root.add(tabs.setLocation(290, 80));

        var grp = new ui.Group();
        var mbar = new ui.Menubar([
           { 
                content: "Menu Item 1",
                sub    : [
                    {
                        content: "Sub Item 1",
                        checked: true
                    },
                    "-",
                    "Sub Item 2",
                    "Sub Item 3" 
                ]
            },
            {
                content: "Menu Item 2", 
                sub: [
                    { 
                        content: "Sub Item 1",
                        group: grp
                    },
                    { 
                        content: "Sub Item 2",
                        group: grp
                    },
                    { 
                        content: "Sub Item 3",
                        group: grp,
                        checked: true
                    }
                ]
            },
            {
                content: "Menu Item 3",
                sub: [
                    "Sub Item 1",
                    { 
                        content: "Sub Item 2",
                        sub: [
                            "Sub Item 1",
                            "Sub Item 2",
                            "Sub Item 3"
                        ]
                    }
               ]
           }
        ]).setLocation(250, 0);
        root.add(mbar);

        var tree = new tr.CompTree({
           value: "Root",
           kids: [
               "[x] Item 1",
               [ "Combo Item 1", "Combo Item 2", "Combo Item 3" ],
               {   value: "Item 2",
                   kids : [
                       "Subitem 1",
                       "[] Subitem 2",
                       "[x] Subitem 3"
                   ] 
               }
           ]
        }).setLocation(430, 510);
        tree.model.root.kids[1].value.select(0);
        root.add(tree);

        tabs.toBack();

        var ta = new ui.TextArea("This is multi lines text in\nfully rendered in\nHTML5 Canvas\ncomponent");
        ta.setPreferredSize(170, 120);
        ta.setLocation(210, 360);
        root.add(ta);

        var toolbar = new ui.Toolbar();
        toolbar.add(new ui.ImagePan("public/images/bug-o.png")
                          .setPreferredSize(24, 24));
        toolbar.add(new ui.ImagePan("public/images/drop.png")
                          .setPreferredSize(24, 24));
       toolbar.add("-");
        toolbar.add(new ui.ImagePan("public/images/boat.png")
                          .setPreferredSize(24, 24));
       toolbar.add("-");
       toolbar.addSwitcher("On/Off");
       root.add(toolbar.setLocation(400, 360));

        var combo = ui.$component([
           "*@(public/images/bmw.png):16x16 Item 1",
           "@(public/images/honda.png):16x16 Item 2",
           "@(public/images/saab.png):16x16 Item 3"
       ]).setPreferredSize(140, 30);

       root.add(combo.setLocation(140, 100));

        var p = new ui.CollapsiblePan.GroupPan(
            new ui.CollapsiblePan("Page 1", new ui.Panel({
                layout: new layout.GridLayout(3, 2, false, true).
                    setDefaultConstraints(
                        new layout.Constraints("stretch","center",4)
                    ),
                padding: 8,
                kids  : [
                    new ui.Label("User name: "),
                    new ui.TextField("", 8),
                    new ui.Label("Password: "),
                    new ui.PassTextField(""),
                    new ui.Label(""), 
                    new ui.Button("Save").$setConstraints(
                        new layout.Constraints("right","center", 4)
                    )
               ]
            })),
            new ui.CollapsiblePan("Page 2", 
                new ui.Panel({
                    flowLayout : ["center", "center" ],
                    background : "#202220",
                    kids       : [
                        new ui.Label("No content is available")
                    ]
               })),
            new ui.CollapsiblePan("Page 3", 
                                 new ui.Label("..."))
        ).setPreferredSize(220, 250);
        
        root.add(p.setLocation(10, 500));

        var pt = new ui.PassTextField("", 12, true).setHint("enter password");
        root.add(pt.setPreferredSize(150, -1).setLocation(250, 495));
       
        var desBt = new design.ShaperPan(
            new ui.Checkbox("Control size\nand drag me!")
        );
        desBt.setLocation(450, 430);
        root.add(desBt);

        var tpLab = new ui.Label("Move mouse in\ntool tip is shown");
        tpLab.setBorder("plain");
        tpLab.setPadding(8);
        tpLab.setFont("bold");
        tpLab.tooltip = new ui.Tooltip(
            "@(public/images/wbug.png):16x16Tooltip"
        );
        root.add(tpLab.setLocation(290, 600));
   });
</script>

<br/>

**Fast and responsive UI components** that can handle and visualize tons of data. For instance find below grid component that keeps **10.000.000 (10 millions)** dynamically generated cells! In this example the grid component size is more than HTML5 Canvas precision can handle. Zebkit has a fix to HTML5 canvas precision problem, but it has to be applied separately.
 
{% include zsample.html canvas_id='sampleBigGrid' title='10.000.000 cells' %}

<script type="text/javascript">
    zebkit.require("ui", "ui.grid", function(ui, gr) {
        var grid = new gr.Grid(1000000, 10);
        grid.defXAlignment = "center";
        var titles = [];
        for(var i = 0; i < 10; i++) { titles[i] = "Title " + i; }
        grid.add("top", new gr.GridCaption(titles));
        grid.setViewProvider(new gr.DefViews([
            function getView(target, row, col, obj){
                this.render.setValue("Item ["+ row + "," + col +"]");
                return this.render;
            },
            function getCellColor(target, row, col) {
                if ('{{site.themeId}}' === 'light') {
                    return row % 2 === 0 ?  "white" : "#EEEEEE"; 
                } else {
                    return row % 2 === 0 ?  "orange" : "#ff9149"; 
                }
            }
        ]));

        var root = new ui.zCanvas("sampleBigGrid", 650, 400).root;
        root.setBorderLayout();
        root.add(new ui.ScrollPan(grid).setAutoHide(true));
    });
</script>

<br/>

**Layout management** Zebkit uses rules to order UI components to avoid manipulation with exact UI components positions and sizes. This approach is more general and adaptable to the world of various devices, screens and resolutions.

{% include zsample.html canvas_id='layoutSample1' title='Border layout' %}

<script type='text/javascript'>
zebkit.require("ui", "layout", function(ui, layout) {
    // Border layout
    var r = new ui.zCanvas("layoutSample1", 500, 400).root;
    r.setBorderLayout();
    r.add(new ui.Panel({
        borderLayout : 4,
        kids   : {
            "center": new ui.Button("CENTER"),
            "left":   new ui.Button("LEFT"),
            "right":  new ui.Button("RIGHT"),
            "top":    new ui.Button("TOP"),
            "bottom": new ui.Button("BOTTOM")
        }
    }).setPreferredSize(300, -1));
});
</script>

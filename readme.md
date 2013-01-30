
## Three steps from prototype to ALPHA!
## Step III 

The new Zebra version (pre-alpha3) has been practically completely re-viewed and re-worked. Many new features, design 
decisions have been applied. The new version is a bunch of new ideas with more accurate modularization. JSON UI form 
definition, IO package, JSON look and feel configuration, decoupling powerful Zebra UI engine from Rich UI components 
set are just a part of work has been done. Also performance and memory consumption has been improved sometimes in few 
times. 

Zebra is JavaScript library that implements graceful and easy to use OOP concept together with rich set of UI
components. The UI components are developed based on HTML5 Canvas element. This approach differs from
traditional WEB UI, where user interface is built around HTML DOM and than "colored" with CSS. Zebra UI components
are implemented from scratch as a number of widgets rendered on HTML Canvas. Everything, including UI components
rendering, in developers hands. 

The project is still in pre-alpha state, but the new version is much more closer to the next alpha and beta 
phases. The author appreciates any possible feedback, criticism, help, suggestions and proposals.

### Features

   *  Zebra easy OOP concept JavaScript: classes and interfaces, overriding, overloading, 
   	  constructors, packaging, inner class, access to super class methods, etc
   *  **Zebra UI Engine that can be used as powerful basis for:**
      * Pixel by pixel UI components rendering controlling 
      * Simple and flexible events (keyboard, mouse, etc) manipulation, advanced event technique to develop composite UI components
      * Layouting UI components using number of predefined layout managers
      * Easy developing of own layout managers 
      * Full control of UI components rendering, paint manager does many things behind the scene   
      * **Play video in Zebra UI panel**
      * **Flash-free, pure web native clipboard paste and copy supporting**
      * **Font metrics calculation** 
      * Layered UI architecture
      * and many other ...
   *  Zebra rich UI Components set developed basing on Zebra UI Engine:
      * More than 30 various UI components
      * Complex UI components: Grid, Tree, Tabs, Combo, Designer, Scroll, Menu, etc
      * Thanks to easy OOP concept and proper design: expendable and fully customizable UI components
      * **Simple data model description**
      * and many other ...
   *  **JSON as Zebra UI form descriptive language**
   *  **JSON as Zebra UI look and feel configuration**
   *  **Zebra IO**   
      *  GET/POST/etc Ajax requests  
      *  XML-RPC, JSON-RPC Service communication
      *  binary data handling
   * ...
  

### Write first UI Zebra application

To write first application **no zebra stuff on you PC has to be downloaded and deployed (you need only the readme file :).** 
Let's start writing simple Zebra HTML following traditional style:

```html
<!DOCTYPE html>
<html>
	<header>
		<script src='http://repo.zebkit.org/pa3/zebra.min.js'
                type='text/javascript'></script>
		<script type='text/javascript'>
		    zebra.ready(function() {
				// import classes and variables from "ui" and "layout" packages in local space
				eval(zebra.Import("ui", "layout"));
				// create Canvas
			    var root = (new zCanvas()).root;
				// define layout
				root.setLayout(new BorderLayout());
				// add button to center
				root.add(CENTER, new Button("Ok"));
				...
	 		});
		</script>
	</header>
	<body></body>
</html>
```

We can write the application following more graceful manner using JSON-like style:

```html
<!DOCTYPE html>
<html>
	<header>
		<script src='http://repo.zebkit.org/pa3/zebra.min.js'
                type='text/javascript'></script>
		<script type='text/javascript'>
		    zebra.ready(function() {
				// import classes and variables from "ui" and "layout" packages in local space
				eval(zebra.Import("ui", "layout"));

				// create Canvas using JSON like style
			    (new zCanvas()).root.properties({
			    	layout: new BorderLayout(),
			    	kids  : {
			    		CENTER: new TextField("", true),
			    		TOP   : (new BoldLabel("Sample application")).properties({
			    			padding : 8
			    		}),
			    		BOTTOM: new Button("Ok")
			    	}
			    });
			}); 
		</script>
	</header>
	<body></body>
</html>
```

### Defining UI with JSON

JSON can be interpreted as Zebra UI form definition language. For instance, use UI definition shown below and store 
it in the same place where HTML is going to be hosted:
```json
{
	"padding": 8, 
	"layout" : { "$zebra.layout.BorderLayout":[ 4, 4 ] },
	"kids"   : {
		"CENTER": { "$zebra.ui.TextField": ["", true]  },
		"BOTTOM": { "$zebra.ui.Panel": [],
			"layout": { "$zebra.layout.FlowLayout": [] },
			"kids"  : [
				{ "$zebra.ui.Button": "Clear" } 
			]  
		}
	}
}
```

Pay attention the code demonstrated below expects JSON UI form definition is stored in "myform.json" file. 
Load the JSON UI form definition as it is illustrated below:
```html
<!DOCTYPE html>
<html>
	<header>
		<script src='http://repo.zebkit.org/pa3/zebra.min.js'
                type='text/javascript'></script>
		<script type='text/javascript'>
		    zebra.ready(function() {
				// load UI form from JSON file
			    var root = (new zebra.ui.zCanvas()).root;
			    (new zebra.util.Bag(root)).load(zebra.io.GET("myform.json"));

			    // find by class "Button" component and register button
			    // event handler to clear text field content by button click
			    root.find("//Button")._.add(function() {
				    root.find("//TextField").setText("");
				});	    
			});
		</script>
	</header>
	<body></body>
</html>
```


### Use native clipboard in Zebra UI components

By implementing special __"zebra.ui.CopyCutPaste"__ interface a Zebra UI component can start participating in 
clipboard data exchange. Pay attention Zebra doesn't use invisible Flash application to work with clipboard, 
it is pure WEB based solution: 

```html
<!DOCTYPE html>
<html>
	<header>		
		<script src='http://repo.zebkit.org/pa3/zebra.min.js'
                type='text/javascript'></script>
		<script type='text/javascript'>
			zebra.ready(function() {
				eval(zebra.Import("ui", "layout"));

				// define our own UI component class that wants to handle clipboard events
				// the components inherits multi lines label component (MLabel)
				var MyComponent = zebra.Class(MLabel, CopyCutPaste, [
				    // override "canHaveFocus" method to make your component focusable
				    function canHaveFocus() { return true; },

				    // returns what you want to put in clipboard
				    function copy() {
				    	this.setColor("#FF3311");
				    	return this.getText();
				    },

				    // this method is called when paste event has happened for this 
				    // component 
				    function paste(s) { 
				    	this.setColor("#000000");
				    	this.setText(s); 
				    }
				]); 

				// create UI application with our clipboard handler UI component
				(new zCanvas()).root.properties({
					layout: new BorderLayout(8,8), padding:8,
					kids  : {
						TOP   : new BoldLabel("Copy/Paste in box below"),
						// create inner class that is customized to indicate 
						// when the component gets or looses focus 
						CENTER: (new MyComponent(FocusListener, [
							function focusGained(e) { this.setBorder(borders.sunken); },
							function focusLost(e)   { this.setBorder(borders.plain); }
						])).properties( { border:borders.plain, 
										  text:"Copy me in clipboard", 
										  padding:6 })
					}
				});
			});
		</script>
	</header>
	<body></body>
</html>
```

### Zebra UI components look and feel customization

Default values of UI components properties can be controlled by JSON configuration. You can define an
own JSON configuration to override default Zebra configurations (that is stored in "ui.json" and "canvas.json"). 
For instance, imagine we need to define new background and font for __"zebra.ui.Button"__ component. It can be done 
by providing the following JSON configuration file:

```json
{
	"Button" : {
       "properties" : {
          "font"      : { "$font": ["Arial", 1, 18 ] },
          "background": "#DDDDEF"
       }
    }
}
```

As soon as the file will be added in configuration chain, every new instantiated Button component will get 
the new font and background properties values. 


### NEW IO API: HTTP POST/GET, JSON-RPC or XML-RPC

The module provides handy manner to interact with remote services.

#### POST and GET requests:

```js
// get, post data
var gdata = zebra.io.GET(url),
	pdata = zebra.io.POST(url, "request");

// async GET/POST
zebra.io.GET(url, function(data, requests) {
    ...
})
```

####  Interact to remote XML-RPC server:

```js
// XML-RPC server
var s = new zebra.io.XRPC(url, [ "method1", "method2", "method3" ]);

// call remote methods
s.method1(p1, p2);
var res = s.method2(p2);

// async remote method call
s.method1(p1, p2, function(res) {
    ...
});
```

####  Interact to remote JSON-RPC server

```js
// JSON-RPC server
var s = new zebra.io.JRPC(url, [ "method1", "method2", "method3" ]);

// call remote methods
s.method1(p1, p2);
var res = s.method2(p2);

// async remote method call
s.method1(p1, p2, function(res) {
    ...
});
```

#### Shortcuts to call remote services:

```js
// JSON-RPC remote method execution
var res = zebra.io.JRPC.invoke(url, "method1")(param1, param2);

// Async JSON-RPC remote method execution
zebra.io.JRPC.invoke(url, "method1")(param1, param2, function(res) {
  ....
});
```

### Requirements and installation

Basically Zebra doesn't require extra installation or configuration steps. You even can keep free 
your PC from Zebra stuff, since zebra code can be loaded remotely from Zebra repo. Only if 
you need Java to JavaScript converter, Treetop PEG parser has to be installed from "https://github.com/nathansobo/treetop". 

Zebra package:
```bash
zebra-home
  |
  +--- lib     # zebra source code
  +--- samples # various zebra snippets
  +--- web/ui  # demo application
  +--- startup.py # small HTTP Web server 
```

### Run demos and samples

Zebra include "samples" folder that keeps various Zebra UI snippets. A desired sample can be run 
by opening appropriate HTML with a browser. Some sample cannot be opened as file (because of security restrictions browsers have), 
In this case they have to be opened through a web server. Zebra includes small, simple but buggy Python web server that can be used 
for demo purposes. 

Except snippets Zebra also provides demo application where the most of zebra UI components can be seen and "touched". The demo 
is located in "web/ui/*" and "web/ui/demo/*" folders. 

To see snippets and demo it is preferable to start embedded Python HTTP web server. To do it following the instruction below:
   	  * Open terminal
      * Go to zebra home directory
      * Run small python HTTP server on your PC:
```bash
   $ python startup.py
```

Than yo can:
  * Run demo application by opening http://127.0.0.1:8080/web/ui URL
  * Run a snippet by  opening http://127.0.0.1:8080/samples URL and selecting a desired snipper HTML file


### Developing and building

Zebra source code is split into bunch of JS files you can find in "lib/zebra" folder. Also there is number of JSON 
configuration and resources ("lib/zebra/rs") files that are required in runtime. All "lib/zebra/zebra*.js" files are 
final artifacts that are supposed to be used to build Zebra applications. They are generated from source code 
by running special command as follow:
```bash
   $ ruby ./bin/lithium build
```
The following JS files are generated:    
```bash
zebra-home
  |
  +-- lib     
       |
       +- zebra.min.js # compressed all Zebra JS code (UI engine, IO, Rich UI components set)
       +- zebra.js     # all Zebra JS code (UI engine, IO, Rich UI components set)
       |
       +- zebra.canvas.min.js  # compressed Zebra UI engine (IO also included) JS code
       +- zebra.canvas.js      # Zebra UI engine (IO also included) JS code 
       |
       +- zebra.io.min.js  # compressed Zebra IO JS code
       +- zebra.io.js      # Zebra IO JS code
```

Copy the stuff into your WEB server alone with "lib/zebra/rs" folder and "lib/zebra/*.json" fies.
Depending on your need you can use one of the mentioned above Zebra module:
   * Zebra UI engine, if you don't need Rich UI components set. Add "zebra.canvas.min.js" into a HTML page.
   * Small zebra IO if you don't need any UI feature. Add "zebra.io.min.js" into a HTML page.
   * Zebra UI Rich components set that actually contains all zebra code. Add "zebra.min.js" into a HTML page.


### License

Zebra is Still free. General Public License (GPL) and MIT for academic projects

### Contact

   * WEB     : http://www.zebkit.org
   * e-mail  : ask@zebkit.org 
   * linkedin: http://nl.linkedin.com/pub/andrei-vishneuski/14/525/34b/
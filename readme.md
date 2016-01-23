
![ScreenShot](/docs/zebkit.logo.png)

v02.2016 (Gleb)

## For impatient: look at few demos   

   * Zebkit rich set of UI components: http://repo.zebkit.org/latest/samples/uidemo.html
   * Zebkit UI engine simple samples: http://repo.zebkit.org/latest/samples/uiengine.html
   * Zebkit UI documentation http://www.zebkit.org/documentation

## What is Zebkit ?

Zebkit is a JavaScript library that implements a graceful and easy to use OOP concept together with a rich set of UI components, decoupled UI engine, IO and other packages. UI are fully based on the HTML5 Canvas element. This approach differs from traditional WEB UI, where user interface is built around HTML DOM and then "colored" with CSS.

### Features

   *  Zebkit's easy OOP concept JavaScript: classes, interfaces, overriding, overloading, constructors, packaging, anonymous class, access to super class methods, mixing, etc
   *  **Zebkit UI Engine can be used as powerful basis for:**
      * Pixel by pixel UI components rendering controlling
      * Simple and flexible events (keyboard, mouse, etc) manipulation, advanced event technique to develop composite UI components
      * Laying out UI components using a number of predefined layout managers
      * Easy developing of own layout managers
      * Full control of UI components rendering
      * **Play video in Zebkit UI panel**
      * **Flash-free, pure web native clipboard paste and copy support**
      * **Font metrics calculation**
      * Layered UI architecture
      * and many more ...
   *  Zebkit's rich UI Components set is developed based on the Zebkit UI Engine:
      * More than 40 various UI components
      * Look and feel customization
      * Complex UI components: Grid, Tree, Tabs, Combo, Designer, Scroll, Menu, etc
      * Thanks to easy OOP concept and proper design: expandable and fully customizable UI components
      * **Simple data model description**
      * **HTML DOM as part of Zebkit UI**
      * and many more ...
   *  **JSON as Zebkit UI form descriptive language**
   *  **JSON as Zebkit UI look and feel configuration**
   *  **Zebkit IO**   
      *  GET/POST/etc Ajax requests  
      *  XML-RPC, JSON-RPC Service communication
      *  binary data handling
   * **Mobile devices support**
      * **Touch screen support**
      * **Inertial scrolling**
      * **Virtual keyboard input**


### Build and run zebkit demos

To build zebkit artifacts and run zebkit samples you have to install nodejs (http://nodejs.org/) on your PC. Then go to zebkit home directory and deploy required node JS packages:

```bash
    $ npm install
```

Then re-build zebkit artifacts:
```bash
    $ gulp
```

And if you want to open demos and samples on your computer in a browser start the simple test HTTP server:
```bash
    $ gulp http
```

To track changes and zebkit artifact re-building you should start the watch task:
```bash
    $ gulp watch
```

To generate api doc install yuidoc once:
```bash
   $ [sudo] npm -g install yuidocjs.
```
and then run the following command from zebkit home:
```bash
   $ yuidoc -t yuidoc/themes/default -c yuidoc/yuidoc.json -n -C -o apidoc .
```


Open demos in a browser: http://127.0.0.1:8090/

### Zebkit package structure:

      ```bash
      zebkit-home
        |
        +--- [src]        # zebkit source code
        +--- [apidoc]     # the latest zebkit API documentation
        +--- [samples]    # various zebkit snippets and general UI set demo
        +--- gulpfile.js  # zebkit building and deploying tasks
        +--- package.json # nodejs package descriptor
        +--- index.html   # index WEB page to see main samples and demos
        +--- zebkit.png         # zebkit (Runtime) UI elements icons
        +--- zebkit.json        # zebkit (Runtime) JSON configuration
        +--- zebkit.js          # Zebkit (Runtime) JS code
        +--- zebkit.min.js      # minified (Runtime) Zebkit JS code
        +--- zebkit.runtime.zip # zipped all you need in runtime
      ```

**Use artifacts packaged in "zebkit.runtime.zip" file if you need to keep zebkit on your web site. Unpack it in your web folder and include "zebkit.min.js" in your HTML page.**

### Simple UI Zebkit application

To write the first application **no zebkit stuff on your PC has to be downloaded and deployed (you need only this readme file :).** Let's start writing simple Zebkit HTML following traditional style:

```html
<!DOCTYPE html>
<html>
	<head>
		<script src='http://repo.zebkit.org/latest/zebkit.min.js'
                type='text/javascript'></script>
		<script type='text/javascript'>
		    zebkit.ready(function() {
				// import classes and variables from "ui" and "layout" packages in local space
				eval(zebkit.Import("ui", "layout"));
				// create Canvas
			    var root = (new zCanvas()).root;
				// define layout
				root.setLayout(new BorderLayout());
				// add button to center
				root.add(CENTER, new Button("Ok"));
				...
	 		});
		</script>
	</head>
	<body></body>
</html>
```

We can write the application following more graceful manner using JSON-like style:

```html
<!DOCTYPE html>
<html>
	<head>
		<script src='http://repo.zebkit.org/latest/zebkit.min.js'
                type='text/javascript'></script>
		<script type='text/javascript'>
		    zebkit.ready(function() {
				// import classes and variables from "ui" and "layout" packages in local space
				eval(zebkit.Import("ui", "layout"));
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
	</head>
	<body></body>
</html>
```

### Keeping UI forms in JSON

JSON can be interpreted as Zebkit UI form definition language. For instance, use UI definition shown below and store it in "myform.json" file located in the same place where HTML is hosted:
```json
{
	"padding": 8, 
	"layout" : { "$zebkit.layout.BorderLayout":[ 4] },
	"kids"   : {
		"CENTER": { "$zebkit.ui.TextField": ["", true]  },
		"BOTTOM": { "$zebkit.ui.Panel": [],
			"layout": { "$zebkit.layout.FlowLayout": [] },
			"kids"  : [
				{ "$zebkit.ui.Button": "Clear" } 
			]  
		}
	}
}
```

Load the JSON UI form definition as it is illustrated below:
```html
<!DOCTYPE html>
<html>
	<head>
		<script src='http://repo.zebkit.org/latest/zebkit.min.js'
                type='text/javascript'></script>
		<script type='text/javascript'>
		    zebkit.ready(function() {
				// load UI form from JSON file
			    var root = (new zebkit.ui.zCanvas()).root;
			    root.load("myform.json");
			    // find by class "Button" component and register button
			    // event handler to clear text field content by button click
			    root.find("//zebkit.ui.Button").bind(function() {
				    root.find("//zebkit.ui.TextField").setValue("");
				});	    
			});
		</script>
	</head>
	<body></body>
</html>
```


### Native clipboard support

Zebkit supports native browser clipboard. The implementation doesn't require any Flash or other plug-in installed. It is pure WEB based solution !

By implementing special methods __"clipCopy()"__  and/or __"clipPaste(s)"__ a focusable UI component can start participating in clipboard data exchange. For instance:

```html
<!DOCTYPE html>
<html>
	<head>		
		<script src='http://repo.zebkit.org/latest/zebkit.min.js'
                type='text/javascript'></script>
		<script type='text/javascript'>
			zebkit.ready(function() {
				eval(zebkit.Import("ui", "layout"));
				// define our own UI component class that wants to handle 
                // clipboard events
				var MyComponent = zebkit.Class(MLabel, [
				    // override "canHaveFocus" method to make your component
                    // focusable
				    function canHaveFocus() { return true; },

				    // returns what you want to put in clipboard
				    function clipCopy() {
				    	this.setColor("#FF3311");
				    	return this.getValue();
				    },

				    // this method is called when paste event has 
                    // happened for this component 
				    function clipPaste(s) { 
				    	this.setColor("#000000");
				    	this.setValue(s); 
				    },

				    // use border as an indication the component has focus
				    function focused() {
				    	this.$super() // call super
				    	this.setBorder(this.hasFocus() ? new Border("red",2,3) : borders.plain);
				    }
				]); 
				// create UI application with our clipboard handler UI
                // component
				(new zCanvas()).root.properties({
					background: "#EEEEEE",
					layout: new BorderLayout(8,8), 
                    padding: 8,
					kids  : {
						TOP   : new BoldLabel("Copy/Paste in box below"),
						CENTER: new MyComponent("Copy me in clipboard").properties({border:borders.plain, padding:8})
					}
				});
			});
		</script>
	</head>
	<body></body>
</html>
```

### UI look and feel customization

Default values of UI components properties can be controlled by JSON configuration. You can define your own JSON configuration to override default Zebkit configurations (that is stored in "zebkit.json"). For instance, imagine we need to define new background and font for __"zebkit.ui.Button"__ component. It can be done by providing the following JSON configuration file:

```json
{
	"Button" : {
        "font"      : { "$Font": ["Arial", "bold", 18 ] },
        "background": "#DDDDEF"
    }
}
```

As soon as the file is added in the configuration chain, every new Button instance will get the new font and background properties' values.


### IO API: HTTP POST/GET, JSON-RPC or XML-RPC

The module provides handy manner to interact with remote services.

#### POST and GET requests:

```js
// get, post data
var gdata = zebkit.io.GET(url),
	pdata = zebkit.io.POST(url, "request");
// async GET/POST
zebkit.io.GET(url, function(request) {
    if (request.status == 200) {
    	// handle result
    	request.responseText	
	}
	else {
		// handle error
	}
    ...
})
```

####  Interact to remote XML-RPC server:

```js
// XML-RPC server
var s = new zebkit.io.XRPC(url, [ "method1", "method2", "method3" ]);
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
var s = new zebkit.io.JRPC(url, [ "method1", "method2", "method3" ]);
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
var res = zebkit.io.JRPC.invoke(url, "method1")(param1, param2);
// Async JSON-RPC remote method execution
zebkit.io.JRPC.invoke(url, "method1")(param1, param2, function(res) {
  ....
});
```

### License

Apache License, Version 2.0
http://www.apache.org/licenses/LICENSE-2.0.html

### Contact

   * WEB     : http://www.zebkit.org
   * e-mail  : ask@zebkit.org
   * linkedin: http://nl.linkedin.com/pub/andrei-vishneuski/14/525/34b/

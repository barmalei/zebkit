
## Three steps from prototype to ALPHA!
## Step III 

The code of the new Zebra version has been practically completely re-viewed and re-worked. Many new feature, design 
decisions have been applied. The new version is a bunch of new ideas with more accurate modularization. JSON UI form 
definition, IO package, JSON look and feel configuration, decoupling powerful Zebra UI engine from Rich UI component 
set are just a part of work has been done. Also performance and memory consumption has been improved sometimes in few 
times. 

Zebra is JavaScript library that implements graceful and easy to use OOP concept together with rich set of UI
components. The UI components are developed based on HTML5 Canvas element. This approach differs from
traditional WEB UI, where user interface is built around HTML DOM and than "colored" with CSS. Zebra UI components
are implemented from scratch as a number of widgets rendered on HTML Canvas. Everything, including UI components
rendering, in developers hands. 

The project is still in pre-alpha state, but with the new version it is much more closer to the next alpha and beta 
phases. The author appreciates any possible feedback, criticism, help, suggestions and proposals.

### Features

   *  Zebra easy OOP concept JavaScript
  
   *  (**NEW**) Zebra UI Engine that can be used as powerful basis for: 
      * Rendered from scratch WEB UI components creation
      * Events (keyboard, mouse, etc) manipulation, advanced event technique to develop composite UI components
      * UI components layouting using number of predefined layout managers
      * Full control of UI components rendering, paint manager does many things behind the scene   
      * (**NEW**) Flash-free, pure web native clipboard paste and copy support 
      * Layered UI nature
      * and many other ...

   *  Zebra rich UI Components set developed basing on Zebra UI Engine 
      * More than 30 various UI components
      * Complex UI components: Grid, Tree, Tabs, Combo, Designer, Scroll, Menu, etc
      * Thanks to easy OOP concept and proper design: expendable and fully customizable UI 
      * (NEW) Simple data model description 
      * and many other ...

   *  (**NEW**) JSON as Zebra UI descriptive language

   *  (**NEW**) JSON as Zebra UI look and feel configuration 

   *  (**NEW**) Zebra IO   
      *  GET/POST/etc  Ajax requests  
      *  XML-RPC, JSON-RPC Service communication
      *  binary data handling
  

### Write first UI Zebra application

To write first application **no zebra stuff on you PC has to be downloaded and deployed.** Let's start writing simple Zebra html
following traditional style:

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
			    var canvas = new zCanvas(400, 400), root = canvas.root;
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

We can write the application in more graceful manner using JSON-like style:

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

### JSON UI definition 

Create UI definition and store it in the same place where html is going to be hosted:
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

It is expected that JSON UI description file name is "myform.json". 
Than load the JSON UI description as follow:
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

			    // find by class Button component and register button
			    // event handler to clear text field content
			    root.find("//Button")._.add(function() {
				    root.find("//TextField").setText("");
				});	    
			});
		</script>
	</header>
	<body></body>
</html>
```


### Use native clipboard in an Zebra UI component

By implementing special "zebra.ui.CopyCutPaste" interface the component can start participating in 
clipboard data exchange. Zebra doesn't use invisible Flash application to work with clipboard: 

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
				var MyComponent = zebra.Class(MLabel, CopyCutPaste, [
				    // override "canHaveFocus" method to make your component focusable
				    function canHaveFocus() { return true; },

				    // returns what you want to put in clipboard
				    function copy() {
				    	this.setForeground("#FF3311");
				    	return this.getText();
				    },

				    // this method is called when paste event has happened for this 
				    // component 
				    function paste(s) { 
				    	this.setForeground("#000000");
				    	this.setText(s); 
				    }
				]); 

				// create UI application with our clipboard handler component
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

### Customize zebra UI components look and feel

Every property default value for every existent UI component can be controlled by JSON configuration. You can define 
own JSON configuration to overload default Zebra configurations "ui.json" or "canvas.json" stuff. For instance imagine 
we need to define new background and font for "Button" component. It can be done by providing the following JSON
configuration file:

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
the new font and background. 


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

Basically lib doesn't require extra instillation or configuration steps. You even can keep free 
your PC from Zebra stuff, since zebra code can be loaded remotely from Zebra repo. Only if 
you need Java to JavaScript converter: Treetop PEG parser has to be installed. Find it on GITHUB: "https://github.com/nathansobo/treetop". 

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
by opening appropriate HTML with a browser. Some samples cannot be opened as file (because of security restrictions browsers have), 
they have to be opened by a web server. Zebra includes small, simple but buggy Python web server that can be used for demo purposes.
Zebra also provides demo application where the most of zebra UI components can be seen.


   * Zebra HTML5 Canvas  UI Demo and also samples can be viewed by starting local python WEB server:
   	  * Open terminal
      * Go to zebra home directory
      * Run small python HTTP server on your PC:
```
    python startup.py
```
      * To run main demo, open "http://localhost:8080/web/ui"
      * To see and run a sample go to "http://localhost:8080/samples"


### License

General Public License (GPL) and MIT for academic projects

### Contact

   * WEB: http://www.zebkit.org
   * e-mail: ask@zebkit.org 
   * linkedin:
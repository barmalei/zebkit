
## Three steps from prototype to ALPHA! 
## Step I

Zebra is JavaScript library that implements graceful and easy to use OOP concept together with rich set of UI
components. The UI components are developed based on HTML5 Canvas element. This approach differs from
traditional WEB UI, where user interface is built around HTML DOM and "colored" with CSS. Zebra UI components
are implemented from scratch as a number of widgets rendered on HTML Canvas. Everything, including UI component
rendering, in developers hands.

This is the first stable version that demonstrates Zebra development concept: software engineering in WEB with minimal
DOM/HTML stuff and maximal intuitive code representation. Take a look at "samples" folder to have more information.

### Functionality

   * [+] Zebra Java to JavaScript converter Ruby code
   * [+] Zebra easy OOP concept JavaScript implementation
   * [+] Zebra HTML5 Canvas based UI
   * [+] Zebra IO  GET/POST XML-RPC JSON-RPC Service, binary data
   * [-] Zebra XML UI Form builder


### NEW IO API: HTTP POST/GET, JSON-RPC or XML-RPC


#### POST and GET requests:
        
```js
// get, post data
var gdata = zebra.io.GET(url);
var pdata = zebra.io.POST(url, "request");

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


### Write first Zebra application

**No zebra stuff on you PC has to be downloaded and deployed.** Let's start writing simple Zebra html:

		<html>
			<header>
				<script src='http://repo.gravitysoft.org/zebra/all.min.js' type='text/javascript'></script>
				<script type='text/javascript'>
				    zebra.ready(function() {
						// import classes and variables from "ui" and "layout" packages in local space
						eval(zebra.Import("ui", "layout"));
						// create Canvas
					    var canvas = new zebra.ui.zCanvas(400, 400), root = canvas.root;
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

To configure Zebra UI to use "black" palette do the following:

		<html>
			<header>
				<script src='http://repo.gravitysoft.org/zebra/all.min.js' type='text/javascript'></script>
				<script type='text/javascript'>
					zebra()["theme.palette"] = "black";
					...
				</script>
			</header>
			<body></body>
		</html>

Take a look at more complex example, Grid with 10000 cells:

		<html>
			<header>
				<script src='http://repo.gravitysoft.org/zebra/all.min.js' type='text/javascript'></script>
				<script type='text/javascript'>
				    zebra.ready(function() {
						// import classes and variables from "ui", "ui.grid" and "layout" packages in local space
						eval(zebra.Import("ui", "layout", "ui.grid"));
						eval(zebra.Import("ui", "layout", "ui.editors"));
						// create Canvas
					    var canvas = new zebra.ui.zCanvas(400, 400), root = canvas.root;
                        // setup layout
					    root.setLayout(new BorderLayout());
						// create Grid with 1000 rows and 10 columns
						var grid = new Grid(1000, 10);
						// make top grid header visible
						grid.showTopHeader();
						// fill grid cells
						for(var i=0; i<grid.getGridRows()*grid.getGridCols(); i++) {
							grid.model.put(i, " Cell [ " + i + " ] ");
						}
						// add scrollable grid into canvas
						root.add(CENTER, new ScrollPan(grid));
			 		});
				</script>
			</header>
			<body></body>
		</html>


### Requirements and installation

If you need Java to JavaScript converter than Treetop PEG parser has to be installed.
Find it on GITHUB: "https://github.com/nathansobo/treetop". Otherwise no any installation
activities are necessary.

### Run demos and samples

   * Zebra HTML5 Canvas UI Demo:
   	  * Open terminal
      * Go to zebra home directory
      * Run small python HTTP server on your PC:
```
    python startup.py
```
      * Open "http://localhost:8080/web/ui"
      * Enjoy Zebra UI WEB Demo

   * Java to JavaScript converter usage:
      * Make sure TreeTop PEG parser has been installed
      * Open terminal
      * Go to zebra home directory
      * Run, for instance, the following command:
```
    ruby -Ilib samples/j2js/j2js.converter.rb  samples/j2js/ReadFile.java
```
      * Find generated "ReadFile.java.js" and "ReadFile.java.html" files in current directory


### License

General Public License (GPL) and MIT for academic projects

### Contact

   * WEB: http://zebra.gravitysoft.org, http://www.gravitysoft.org
   * e-mail: vish@gravitysoft.org

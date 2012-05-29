## Zebra alpha/prototype version

This is the first version that demonstrates Zebra development concept: software engineering in WEB with minimal
DOM/HTML stuff and maximal intuitive code representation. Take a look at "snippet" folder to have more information. 

## Functionality

   * [+] Zebra Java to JavaScript converter Ruby code
   * [+] Zebra easy OOP concept JavaScript implementation
   * [+] Zebra HTML5 Canvas based UI
   * [-] Zebra JS XML
   * [-] Zebra XML-RPC DataBus XML
   * [-] Zebra XML UI Form builder

## Write first Zebra application

**No zebra stuff on you PC has to be downloaded and deployed.** Start from writing simple html with a bunch of Zebra code:

		<html>
			<header>
				<script src='http://zebra.gravitysoft.org/alpha/all.min.js' type='text/javascript'></script>
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

Configuring Zebra UI to use "black" palette:

		<html>
			<header>
				<script src='http://zebra.gravitysoft.org/alpha/all.min.js' type='text/javascript'></script>
				<script type='text/javascript'>
					zebra()["theme.palette"] = "black";
					...
				</script>
			</header>
			<body></body>
		</html>

More complex example, Grid with 10000 cells:

		<html>
			<header>
				<script src='http://zebra.gravitysoft.org/alpha/all.min.js' type='text/javascript'></script>
				<script type='text/javascript'>
				    zebra.ready(function() {
						// import classes and variables from "ui", "ui.grid" and "layout" packages in local space
						eval(zebra.Import("ui", "layout", "ui.grid"));
						// create Canvas
					    var canvas = new zebra.ui.zCanvas(400, 400), root = canvas.root;
						// create Grid with 1000 rows and 10 columns
						var grid = new Grid(1000, 10);
						// make top grid header visible
						grid.showTopHeader(true);
						// fill grid cells
						for(var i=0; i<grid.getGridRows()*grid.getGridCols(); i++) {
							grid.put(i, " Cell [ " + i + " ] ");
						}
						// add scrollable grid into canvas
						root.add(CENTER, new ScrollPan(g));
						...
			 		});
				</script>
			</header>
			<body></body>
		</html>


## Requirements 

The package has no specific requirements. Java to JavaScript converter is the only part that is required third party 
Treetop PEG parse. Find it on GITHUB: "https://github.com/nathansobo/treetop"

## Installation 

No particular installation steps are required, except installation of TreeTop PEG parser

## Run demos and samples

   * Zebra HTML5 Canvas based UI:
   	  * Open terminal
      * Go to zebra home directory
      * Run small python HTTP server on your PC:
 
     			$ python startup.py
  
      * Open "http://localhost:8080/web/uidemo"
      * Enjoy Zebra UI WEB Demo 

	* Run Java to JavaScript converter sample:
		* Pay attention TreeTop PEG parser has been installed 
		* Open terminal
		* Go to zebra home directory
		* Run, for instance, the following command:
	 
	   			$ ruby -Ilib samples/j2js/j2js.converter.rb  samples/j2js/ReadFile.java 
	
		* Find generated "ReadFile.java.js" and "ReadFile.java.html" files in current directory


## License 

General Public License (GPL) and MIT for academic projects
 
## Contact

   * WEB: http://zebra.gravitysoft.org, http://www.gravitysoft.org
   * e-mail: vish@gravitysoft.org

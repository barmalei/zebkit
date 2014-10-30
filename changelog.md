**11.2014 (Anna)**

   * New UI component tree. Add UI components directly as tree nodes  
   * Grid cell marker mode support
   * Own zebra custom virtual keyboard implementation 
   * Remove "zebra.ui.Composite" interface, use "catchInput" field as boolean flag to say if component composite or as a method to say it dynamically
   * Remove zebra.ui.CopyCutPaste interface. Use "clipCopy", "clipPaste" method to catch clipboard events
   * Reorganized tree component
   * OOP Singleton classes support
   * Use nodejs/gulp to as deployment tool
   * Fixes and improvements
   
**4.2014 (Luda)**

   * Reduce number of zebra artifact required to host zebra on a user side. To host zebra only three artifacts are required:
       - zebra.min.js
       - zebra.png (UI elements set)
       - zebra.json (configuration)
   * Completely re-worked popup menu component. Menu events can be handled globally by registering a listener in popup manager
   * Simplified input events handling. An UI component should not anymore implements appropriate input listener interface, just add appropriate method to handle required event
   * Polished zebra.ui.Extender component
   * Polished zebra.ui.Toolbar component
   * New component grid caption component is provided. The component allows developer to to use any UI component as a title of a grid column. 
   * Support sortable grid columns
   * Component based grid caption is supported
   * Grid columns data sorting is available out of box 
   * Polished and re-designed grid editor provider
   * Tabs border rendering is much more accurate and well done
   * Tabs icon and title control is much more simple
   * Radiobox component rendering is done more accurate
   * More accurate HTML Element as a zebra UI component integration
   * Faster and simpler StringRender is implemented 
   * List components are review-ed and partially re-implemented 
   * Better support of mobile devices
   * Simpler popup menus and tooltip support
   * Smother painting when a browser window is resized
   * Bloody IE10/11 canvas clipping and filling bugs workarounds 
   * More detailed API docs  
   * Load JSON from JSON what allows developers to split it in logical parts 
   * More smooth rendering control (with request animation frame whenever it is possible)   
   * Tooltip manager has been merged with popup manager
   * Better test cases coverage 
   * +1000 other changes and bug fixes

** 8.2013 (Gleb) Zebra documentation is available !**

   * Zebra start supporting mobile !
   * Tutorial is written published on WEB site
   * API doc is written and published on WEB site  
   * +100 fixes and small changes


### Contact

   * WEB     : http://www.zebkit.org
   * e-mail  : ask@zebkit.org 
   * linkedin: http://nl.linkedin.com/pub/andrei-vishneuski/14/525/34b/
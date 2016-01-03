**06.2015 (Anna)**

   * Significant changes in zebkit easy OOP concept. For the sake of simplicity zebkit doesn't support neither constructor nor method overloading. It makes development more simple less error prone. 
   * OOP mixing.
   * Powerful class level class extending with access to super context  
   * New core API method to clone JS object. 
   * New date API and UI components:
      - Calendar component
      - Input date component 
      - Input date range
   * Simple LineView has been added.
   * format utility method
   * Tooltip showing supports more options including showing tooltip that requires a user interaction 
   * Decorated text render has been added. Use to paint underlined and strike text.
   * Event manager listener support has been re-worked to follow common concept. Listeners are registered by single "bind" method. 
   * Link component has been switched to use DecoratedTextRender 
   * ArrowButton component has been added 
   * Place source code of various views and renders in dedicated file "ui.views.js"  
   * Decouple clipboard functionality to a dedicated manager class. No clipboard mess in code anymore. Clipboard manager supports listeners 
   * Very light weight string render has been added. That is widely used by single line label component.
   * Matrix model has been re-viewed and improved regarding the big amount of data  (millions cells) support.  
   * Fully re-implement JSON bag. No conditional keys are allowed because of their inconsistency  
   * String names for constraints and alignments 
   * New UI component - component tree. It is allows developers to add UI components directly as tree nodes. The tree components have been re-designed to be more executable and re-usable system design.     
   * Grid cell marker mode support. It is possible to navigate over grid. 
   * Own zebkit custom virtual keyboard implementation. This is special package that helps to implement own virtual keyboards. The basic features set allows developers to specify key, keys set, command key. As an example you can easily load Hind keyboard layout.  
   * Remove "zebkit.ui.Composite" interface, use "catchInput" field as boolean flag to say if component composite or as a method to say it dynamically
   * Remove zebkit.ui.CopyCutPaste interface. Use "clipCopy", "clipPaste", "clipCut" method to catch clipboard events
   * Reorganized tree component
   * Tabs setOrientation method added
   * Singleton classes
   * Text field performance of cursor position detection has been improved 
   * OOP Singleton classes support
   * Use nodejs/gulp to as deployment tool
   * Fixes and improvements
   * Matrix model has been extended with rows and columns insertion methods 
   * package objects and classes can be defined with a special "package" method
   * remove possibility to composite UI JSON configuration 
   * remove %root% variable from JSON BAG, use relative to loaded JSON path or absolute path  
   * zebkit sources has been moved from "lib/zebkit" to "src"
   * json bag utility class has been updated:
      - Use classAliases property to define short names for classes
      - Use variables property to define variables
      - Variables can be classes and structure
      - loadByUrl has been removed, use in all cases "load" method instead
      - load can be run asynchronously 
   * new "zebkit.Runner" class has been added. It provides graceful way to represent sync and async code as sequence of tasks
   * virtual keyboard hindi layout has been added
   * Matrix model has been re-worked to be less resource consuming 
   * For the really big number for that can be used as a component coordinates (for instance large grid) a fix of 2S Context precision issue can be used by including 'src/fix2d.precision.js' script
   * TextField component supports right alignment 
   *  zebkit.package(...) method has been used as more graceful and safe method of an own package definition.
   *  UI components can handle mouse scroll (wheel) events by implementing "doScroll(dx, dy, source)" method.
   
**4.2014 (Luda)**

   * Reduce number of zebkit artifact required to host zebkit on a user side. To host zebkit only three artifacts are required:
       - zebkit.min.js
       - zebkit.png (UI elements set)
       - zebkit.json (configuration)
   * Completely re-worked popup menu component. Menu events can be handled globally by registering a listener in popup manager
   * Simplified input events handling. An UI component should not anymore implements appropriate input listener interface, just add appropriate method to handle required event
   * Polished zebkit.ui.Extender component
   * Polished zebkit.ui.Toolbar component
   * New component grid caption component is provided. The component allows developer to to use any UI component as a title of a grid column. 
   * Support sortable grid columns
   * Component based grid caption is supported
   * Grid columns data sorting is available out of box 
   * Polished and re-designed grid editor provider
   * Tabs border rendering is much more accurate and well done
   * Tabs icon and title control is much more simple
   * Radiobox component rendering is done more accurate
   * More accurate HTML Element as a zebkit UI component integration
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

** 8.2013 (Gleb) Zebkit documentation is available !**

   * Zebkit start supporting mobile !
   * Tutorial is written published on WEB site
   * API doc is written and published on WEB site  
   * +100 fixes and small changes


### Contact

   * WEB     : http://www.zebkit.org
   * e-mail  : ask@zebkit.org 
   * linkedin: http://nl.linkedin.com/pub/andrei-vishneuski/14/525/34b/
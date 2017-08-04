---
layout: page
title: Event handling
parent: docs
notitle: true
---

### Component specific event handling 

Zebkit event listener registration pattern:

```js
comp.on([path,][eventName,], callback);
```

   * __path__ is an optional parameter, to lookup component or components the given event handler have to be registered. Path is X-Path like expression. For instance: ```"//*"``` detects all children components, ```"//zebkit.ui.Label"``` will match all children labels components. 
   
   * __eventName__ is an optional parameter to say which event exactly you need to catch. For instance: ```"matrixModel.on('matrixResized', ...);"```. If the parameter has not been specified all available events will be caught.  
   * __callback__ is an event or events handler function.

To stop handling event or events use the following pattern:

```js
comp.off([path,][eventName]);
```

The parameter meaning is the same to "on(...)" method. If there is no parameters have been specified, all events handlers for the given component will be detached.  

### UI events handling 

UI components generate number of UI specific events like:  

   * __Key events__ like key pressed, released and typed
   * __Pointer events__ like pointer pressed, released, clicked, moved, dragged and so on. Zebkit pointer events are unified, what means you work with the same event type nevertheless of input device: mouse, touch screen, pen. 
   * __Focus events__ UI components can catch and lost focus. In this case it fires focus gained and lost events.
   * __UI Component events__ UI components can update its metrics (size, location) and manage the children components set (add, remove, set).

The event type is handled following __overriding pattern__ instead of registering listeners via "on(...)/off(...)" methods call. It is done to save resources, speeds up events handling and minimize possible memory leaks that are probable when you have to track listeners list. 

Overriding pattern applied to mentioned above UI events says that you have to override desired UI event handler method for the given UI component to start handling it. For instance, if you need to handle pointer released event do it as follow:

```js
...
var comp = new zebkit.ui.Panel();
...
comp.pointerReleased = function(e) {
    // here you will get pointer released event 
    ...
};
```

or the same with anonymous class paradigm:

```js
...
var comp = new zebkit.ui.Panel([
    function pointerReleased(e) {
        // here you will get pointer released event 
        ...
    }
]);
```

Pay attention that zebkit UI components can have own implementations of appropriate UI events handler. In this case don't forget to call super implementation:

```js
...
var comp = new zebkit.ui.Button("Button", [
    function pointerReleased(e) {
        // here you will get pointer released event 
        ...
        // call super implementation of the UI event handler
        this.$super(e);
    }
]);
```


__List of available UI events:__

<table class="info">
<tr><th>UI events names</th><th>Description</th></tr>

<tr><td markdown="1" valign="top">
**Pointer events:**<br/>
pointerMoved, pointerPressed,<br/>
pointerReleased, pointerClicked,<br/> 
pointerDragStarted, pointerDragged,<br/>
pointerDragEnded, pointerEntered,<br/> 
pointerExited
</td><td markdown="1">
Pointer events that are fired with mouse, touch screen, pen devices. Pointer events handlers get "zebkit.ui.PointerEvent" class instance as its argument. The class has the following fields:

   * **source**. Source UI component that has fired the event
   * **id**. Name of the event ("ponterPressed", "pointerEntered", etc)  
   * **ponterType**. A type of device that has fired the event: "mouse", "touch", etc.
   * **identifier**. An identifier of pointer event. For instance every touch event has unique identifier. Events are fired with mouse left and right buttons will have "lmouse" and "rmouse" identifiers correspondingly. 
   * **touchCounter**. Amount of touches. In case of mouse if you press both left and right button then "touchCounter" field will be set to 2.
   * **altKey, shiftKey, ctrlKey, metaKey**. Meta key states boolean flags. 
   * **absX, absY**. Absolute location of pointer event relatively to HTML Canvas where the UI component is hosted.
   * **x, y**. Location relatively to a source UI component. 

</td></tr>

<tr><td markdown="1" valign="top">
**Key events:**<br/>
keyPressed, keyTyped,<br/>
keyReleased
</td><td markdown="1">
Keyboard events. Key event handler methods get "zebkit.ui.KeyEvent" class instance as its argument. The class has the following fields:

   * **source**. Source UI component that has fired the event
   * **id**. Name of the event ("keyTyped", "keyPressed", etc)  
   * **key**. A character(s) that has been typed.
   * **code**. A unique key code like "KeyK", "F1", "Escape", etc
   * **altKey, shiftKey, ctrlKey, metaKey**. Meta key states boolean flags. 
   * **device**. Name of devices that fired the given event: "keyboard", "virtualKeyboard".
   * **repeat**. Number of repeated occurrences. 
   
</td></tr>

<tr><td markdown="1" valign="top">
**Focus events:**<br/>
focusGained, focusLost
</td><td markdown="1">
Focus events. Focus event handler methods get "zebkit.ui.FocusEvent" class instance as its argument. The class has the following fields:

   * **source**. Source UI component that has fired the event
   * **id**. Name of the event ("focusLost", "focusGained")  
   * **related**. A character(s) that has been typed.

</td></tr>

<tr><td markdown="1" valign="top">
**UI component events:**<br/>
compResized, compMoved,<br/> 
compEnabled, compShown,<br/>
compAdded, compRemoved
</td><td markdown="1">
UI component events. Component event handler methods get "zebkit.ui.CompEvent" class instance as its argument. The class has the following fields:

   * **source**. Source UI component that has fired the event
   * **id**. Name of the event ("compResized", "compMoved", etc)  
   * **kid**. A kid that has been removed or added.
   * **index**. Am index of a kid that has been removed or added to the source component.
   * **constraints**. A layout constraints the kid has been added to the source component.
   * **prevX, prevY**. A previous location the component has had before it has been moved.
   * **prevWidth, prevHeight**. A previous size the component has had before it has been re-sized.  

</td></tr>
</table>

## Handling children UI events

It is possible to catch UI events from children components with a direct parent or ancestor component. It can be done the same way you handle UI events - with overriding appropriate event handler method, but in this case you have to add "child" prefix to a name of required handler method. 

For instance, imagine you have a panel that contains number of labels components as its children. You want to handle pointer pressed UI event that has occurred over the labels. You can try to add event "pointerPressed" method handler to every label, but is not handy and generic. Instead add children UI events handler on the level of parent panel component:

{% include zsample.html canvas_id='childrenEvents' title='Children UI events handling' description=description %}                    

<script type="text/javascript">
zebkit.require("ui", "layout", function(ui, layout) {
    var root = new ui.zCanvas("childrenEvents", 400, 300).root;
    root.setLayout(new layout.ListLayout(8));
    root.setPadding(8);
    root.setBorder("plain");
    for (var i = 0; i < 5; i++) {
        root.add(new ui.Label("Press on " + i + "-th label\n" + 
                              "to change its background")
            .setPadding(4))
            .setBorder("plain");
    }

    root.childPointerPressed = function(e) {
        e.source.setBackground(e.source.bg !=null ? null : "#44AAFF"); 
    };
});  
</script>

```js
zebkit.require("ui", "layout", function(ui, layout) {
    var root = new ui.zCanvas(400, 300).root;
    root.setLayout(new layout.ListLayout(8));
    root.setPadding(8);
    root.setBorder("plain");
    for (var i = 0; i < 5; i++) {
        root.add(new ui.Label("Press on " + i + "-th label\n" + 
                              "to change its background")
            .setPadding(4))
            .setBorder("plain");
    }
    // catch children labels pointer pressed event to update 
    // the labels background
    root.childPointerPressed = function(e) {
        e.source.setBackground(e.source.bg != null ?null:"#44AAFF"); 
    };
});  
```


## Composite components

Zebkit UI is organized as a hierarchy of UI components where every UI component can be a container for other UI components. UI hierarchy is a good developing approach to implement compound UI components where developers can assemble UI components from another UI components. For example  "zebkit.ui.Button" component can use any other UI component as its content: images, series of images, combinations of labels and images, etc.

The problem of developing compound component is children events handling. In the case of "zebkit.ui.Button" every time a pointer pressed over its content component the event is sent only to the content component, button itself doesn't get it. Possible solution is implementing children component UI events handler(s) as it has been described earlier. More graceful solution is follow **composite UI component** approach.

Composite is an UI component that makes its children components "event transparent". Event transparency means the children components don't get any input (pointer, keyboard, etc) events. It looks like the children components transparent for these events.

To make children of a container events transparent you should set "catchInput" property in the container to true value. It makes all children component of the container event transparent:

{% include zsample.html canvas_id='compositeComp1' title='Children UI events handling' description=description %}                    

<script type="text/javascript">
zebkit.require("ui", "layout", function(ui, layout) {
    var root = new ui.zCanvas("compositeComp1", 400, 250).root;
    root.properties({
        padding: 8,
        border: "plain",
        layout: new layout.ListLayout(16),
        kids  : [
          new zebkit.ui.Button("Event transparent button"),
          new zebkit.ui.Checkbox("Event transparent checkbox"),
          new zebkit.ui.TextField("Event transparent field")
        ]
    });
    root.catchInput = true;
});  
</script>

```js
zebkit.require("ui", "layout", function(ui, layout) {
    var root = new ui.zCanvas("compositeComp1", 400, 250).root;
    root.properties({
        padding: 8, border: "plain",
        layout: new layout.ListLayout(16),
        kids  : [
          new zebkit.ui.Button("Event transparent button"),
          new zebkit.ui.Checkbox("Event transparent checkbox"),
          new zebkit.ui.TextField("Event transparent field")
        ]
    });
    // Make children components of "root" component 
    root.catchInput = true;
});  
```


More flexible way to add event transparency is defining "catchInput(kid)" method (instead of treating it as a filed) that gets kid component as an input and should decide whether the given children component has to be make event transparent: 

{% include zsample.html canvas_id='compositeComp2' title='Children UI events handling' description=description %}                    

<script type="text/javascript">
zebkit.require("ui", "layout", function(ui, layout) {
    var root = new ui.zCanvas("compositeComp2", 400, 300).root;
    root.properties({
        padding: 8,
        border: "plain",
        layout: new layout.ListLayout(16),
        kids  : [
        new zebkit.ui.Button("Event transparent button"),
        new zebkit.ui.Checkbox("Normal check box"),
        new zebkit.ui.TextField("Normal field")
        ]
    });
    root.catchInput = function(kid) {
        return kid === root.kids[0]; 
    };
});  
</script>


```js
zebkit.require("ui", "layout", function(ui, layout) {
    var root = new ui.zCanvas("compositeComp2", 400, 300).root;
    root.properties({
        padding: 8, border: "plain",
        layout: new layout.ListLayout(16),
        kids  : [
          new zebkit.ui.Button("Event transparent button"),
          new zebkit.ui.Checkbox("Normal check box"),
          new zebkit.ui.TextField("Normal field")
        ]
    });

    // Make first button of "root" component events transparent. 
    root.catchInput = function(kid) {
        return kid === root.kids[0]; 
    };
});  
```



## Global event handling 


Zebkit **UI events** handling and distribution is managed with a special singleton class "zebkit.ui.EventManager" class. The manager gets all UI events and than decides how its have to be delivered to destination UI components.

The manager is accessible via "zebkit.ui.events" variable and provides possibility to register global events listeners. Global means the handlers  are getting all UI events have happened with all active UI components. To register and unregister global UI events handler follow the standard pattern:

```js
// listen all pointer pressed events for all actiev UI components
zebkit.ui.events.on("pointerPressed", function(e) {
    ...
});
```

For example imagine you need to listen "pointerPressed" event for all UI components to show information window with the components metrics (size and location):    

{% include zsample.html canvas_id='globalEvents' title='Children UI events handling' description=description %}                    


<script type="text/javascript">
zebkit.require("ui", "layout", function(ui, layout) {
    var root = new ui.zCanvas("globalEvents", 400, 300).root;
    root.setLayout(new layout.RasterLayout(true));
    root.setPadding(8);
    root.setBorder("plain");

    root.add(new ui.Button("Test Button").setLocation(90,90));
    root.add(new ui.Checkbox("Test\nCheck box").setLocation(240,170));
    root.add(new ui.TextField("Test text field").setLocation(50,220));

    var info = new ui.Tooltip("");
    ui.events.on("pointerPressed", function(e) {
        if (info.parent !== null) {
            info.removeMe();
        }
        if (root !== e.source) {
            // show info about an UI component the pointer pressed
            // event has occurred  
            info.setValue("x = " + e.source.x+",y = "+e.source.y+
                          "\nw = "+e.source.width+",h = "+e.source.height);
            info.toPreferredSize();
            info.setLocation(e.absX + 5, e.absY - info.height);
            ui.showWindow(root, info);
            info.removeMe(1500);
        }
    });
});  
</script>


```js
zebkit.require("ui", "layout", function(ui, layout) {
    var root = new ui.zCanvas("globalEvents", 400, 300).root;
    root.setLayout(new layout.RasterLayout(true));
    root.setPadding(8);
    root.setBorder("plain");
    // add number of components
    root.add(new ui.Button("Test Button").setLocation(90,90));
    root.add(new ui.Checkbox("Test\nCheck box").setLocation(240,170));
    root.add(new ui.TextField("Test text field").setLocation(50,220));

    var info = new ui.Tooltip("");

    // register global pointer pressed handler
    ui.events.on("pointerPressed", function(e) {
        if (info.parent !== null) {
            info.removeMe();
        }

        if (root !== e.source) {
            // show info about an UI component the pointer pressed
            // event has occurred  
            info.setValue("x = " + e.source.x+",y = "+e.source.y+
                  "\nw = "+e.source.width+",h = "+e.source.height);
            info.toPreferredSize();
            info.setLocation(e.absX + 5, e.absY - info.height);
            ui.showWindow(root, info);
            info.removeMe(1500);
        }
    });
});  
```



---
layout: page
title: Event handling
parent: docs
notitle: true
---

### Component specific event handling 

Components (visual and not-visual) often fire specific to its business events. For instance text model fires text updated event, button UI component fires fired event every time the button has been pressed, list component fires selected event when a new item in the list has been selected and so on. To handle such sort of events a listener or listeners registration pattern have to be applied. A listener can be registered or removed with calling __"on()/off()"__ methods that are part of zebkit component API:

```js
comp.on([eventName,][path,], callback);
```

   * __path__ is an optional parameter to lookup component or components the given event handler have to be registered. Path is X-Path like expression. For instance: ```"//*"``` detects all child components, ```"//zebkit.ui.Label"``` will match all child labels components. 
   
   * __eventName__ is an optional parameter to say which event exactly has to be caught. For instance: ```"matrixModel.on('matrixResized', ...);"```. If the parameter has not been specified all available events will be caught.  
   
   * __callback__ is an event or events handler function.

To stop handling event or events use the following pattern:

```js
comp.off([eventName,][path]);
```

The parameter meaning is the same to "on(...)" method. If there is no parameters have been specified, all events handlers for the given component will be detached.  

To develop a custom component that fires an event or events can be simplified with implementing special __"zebkit.EventProducer"__ interface to add  "on()/off()/fire()" methods implementations. Additionally listeners container class has to be declared in __"_"__ class static variable:

```js
// implement  "zebkit.EventProducer" to add event listening and 
// firing API in the class 
var MyClassThatFiresEvents = zebkit.Class(zebkit.EventProducer, [
    function $clazz() {
        // define listeners container that keeps two types of events 
        this._ = zebkit.ListenersClass("propertyAChanged", 
                                       "propertyBChanged");
    },

    function setA(v) {
        this.a = v;
        // fire appropriate event with API 
        this.fire("propertyAChanged", [ this, v ]);
    },

    function setB(v) {
        this.b = b;
        // fire appropriate event with API 
        this.fire("propertyBChanged", [ this, v ]);
    } 
]);

...

var m = new MyClassThatFiresEvents();
m.on("propertyAChanged", function(src, value) {
    // handle events 
    ...
});

// this triggers "propertyAChanged" event will be fired
m.setA(10);
```

### UI events handling 

UI components generate number of UI specific events:  

   * __Key events__ : key pressed, released and typed
   * __Pointer events__ : pointer pressed, released, clicked, moved, dragged and so on. Zebkit pointer events are unified, what means the same event type is used for various input devices: mouse, touch screen, pen. 
   * __Focus events__ UI components can catch focus gained and lost events. 
   * __UI Component events__ UI components can update its metrics (size, location) and manage the child components set (add, remove, set). This triggers component events: component added, component resized and so on.

__Pay attention the events types are handled following <h4>overriding pattern</h4> instead of registering listeners via __"on(...)/off(...)"__ methods call. It is done to save resources, speeds up events handling and minimize possible memory leaks that are probable when developers have to track listeners list. 

Overriding pattern means that events catching have to be done by overriding desired UI events handler methods. For instance, if to handle pointer released event do it as follow:

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

Pay attention that zebkit UI components can have own implementations of appropriate UI events handlers. In this case don't forget to call super implementation:

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
Pointer events that are fired with mouse, touch screen, pen devices. Pointer events handlers get __"zebkit.ui.event.PointerEvent" class instance as its argument. The class has the following fields:

   * **source**. Source UI component that has fired the event
   * **id**. Name of the event ("ponterPressed", "pointerEntered", etc)  
   * **ponterType**. A type of device that has fired the event: "mouse", "touch", etc.
   * **identifier**. An identifier of pointer event. For instance multiple touch events have unique identifiers. Events are fired with mouse left and right buttons will have "lmouse" and "rmouse" identifiers correspondingly. 
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
Keyboard events. Key event handler methods get __"zebkit.ui.event.KeyEvent"__ class instance as its argument. The class has the following fields:

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
Focus events. Focus event handler methods get __"zebkit.ui.event.FocusEvent"__ class instance as its argument. The class has the following fields:

   * **source**. Source UI component that has fired the event
   * **id**. Name of the event ("focusLost", "focusGained")  
   * **related**. A related UI component. In a case "focusGained" event the field keeps an UI component that has lost focus. In a case of "focusLost" event the field keeps an UI component that is going to gain focus.  

</td></tr>

<tr><td markdown="1" valign="top">
**UI component events:**<br/>
compResized, compMoved,<br/> 
compEnabled, compShown,<br/>
compAdded, compRemoved
</td><td markdown="1">
UI component events. Component event handler methods get __"zebkit.ui.event.CompEvent"__ class instance as its argument. The class has the following fields:

   * **source**. Source UI component that has fired the event
   * **id**. Name of the event ("compResized", "compMoved", etc)  
   * **kid**. A kid that has been removed or added.
   * **index**. An index of a kid that has been removed or added to the source component.
   * **constraints**. A layout constraints the kid has been added to the source component.
   * **prevX, prevY**. A previous location the component has had before it has been moved.
   * **prevWidth, prevHeight**. A previous size the component has had before it has been re-sized.  

</td></tr>
</table>

## Handling child UI events

To catch UI events from child components (on all level of UI hierarchy) follow the same overriding appropriate that have been shown before, but in this case add "child" prefix to a name of required handler method name. 

For instance, imagine a panel contains number of labels components as its children. To handle pointer pressed events that have occurred over the labels "pointerPressed" method handler can be overriding. It has to be done for every label component. The solution is not handy and generic. Instead add child UI events handler on the level of parent panel component:

{% include zsample.html canvas_id='childrenEvents' title='Child UI events handling' description=description %}                    

<script type="text/javascript">
zebkit.require("ui", function(ui) {
    var root = new ui.zCanvas("childrenEvents", 400, 300).root;
    root.setListLayout(8);
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
zebkit.require("ui", function(ui) {
    var root = new ui.zCanvas(400, 300).root;
    root.setListLayout(8);
    root.setPadding(8);
    root.setBorder("plain");
    for (var i = 0; i < 5; i++) {
        root.add(new ui.Label("Press on " + i + "-th label\n" + 
                              "to change its background")
            .setPadding(4))
            .setBorder("plain");
    }
    // catch child labels pointer pressed event to update 
    // the labels background
    root.childPointerPressed = function(e) {
        e.source.setBackground(e.source.bg != null ?null:"#44AAFF"); 
    };
});  
```


## Composite components

Zebkit UI is organized as a hierarchy of UI components where every UI component can be a container for other UI components. UI hierarchy is a good developing approach to implement compound UI components where developers can assemble UI components from another UI components. For example  "zebkit.ui.Button" component can use any other UI component as its content: images, series of images, combinations of labels and images, etc.

Handling of UI input events (pointer, key, focus) in compound component can be not a trivial thing since the input events are captured with child components.  In the case of "zebkit.ui.Button" every time a pointer pressed over its content component (for instance label) the event is sent only to the content component, button itself doesn't get it. Possible solution is implementing child component UI events handler(s) as it has been described earlier. More graceful solution is follow **composite UI component** approach.

Composite is an UI component that makes its child components "event transparent". Event transparency means the child components don't get any input (pointer, keyboard, etc) events. It looks like the child components transparent for these events. The input events are sent directly to a parent component as if its child component not exist. 

To make children of a container events transparent set __"catchInput"__ property in the container to ```true``` value:

{% include zsample.html canvas_id='compositeComp1' title='Child UI events handling' description=description %}                    

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
    // Make child components of "root" component 
    root.catchInput = true;
});  
```


More flexible way to add event transparency is defining __"catchInput(kid)"__ method (instead of treating it as a field) that gets a kid component as input parameter. Then the method has to decide whether the given child component has to be make event transparent or not: 

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


Zebkit **UI events** handling and distribution is managed with a special singleton class __"zebkit.ui.event.EventManager"__ class. The manager gets all UI events and then decides how its have to be delivered to destination UI components.

The manager is accessible via __"zebkit.ui.events"__ variable and provides possibility to register global events listeners. Global means the handlers  are getting all UI event or events that have happened. To register and unregister global UI events handlers follow the standard pattern:

```js
// listen all pointer pressed events for all actiev UI components
zebkit.ui.events.on("pointerPressed", function(e) {
    ...
});
```

For example let's listening "pointerPressed" event for all UI components to show information window with the source UI components metrics (size and location):    

{% include zsample.html canvas_id='globalEvents' title='Children UI events handling' description=description %}                    


<script type="text/javascript">
zebkit.require("ui", function(ui) {
    var root = new ui.zCanvas("globalEvents", 400, 300).root;
    root.setRasterLayout(true);
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
zebkit.require("ui", function(ui) {
    var root = new ui.zCanvas("globalEvents", 400, 300).root;
    root.setRasterLayout(true);
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



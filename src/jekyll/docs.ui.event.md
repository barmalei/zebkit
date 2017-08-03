---
layout: page
title: Event handling
parent: docs
---

#### Component specific events


Component specific event is an event that is triggered by the component itself. For instance: an item selection, data updating, tree item removed etc. The standard way of catching this type of events is calling _"bind"_ method one of the following manner:

   * **Anonymous event handler** If component generates only one type of event no event name has to be specified:

```js
// create UI button
var button = new zebra.ui.Button("Test");

// handle an button pressed event
button.on(function(src) {
   ...
})
```
   
   
   * **Named event handler** If component generates different event types pass an event type name as a parameter or as the event handler function name:
    
```js
// handle a tree model item removed event
treeModel.on("itemRemoved", function(src) {
   ...
})
```

or the same using named event handler function:

```js
// handle a tree model item removed event
treeModel.on(function itemRemoved(src) {
   ...
})
```
   

  * **Global events handler** If component generates different types of events you can handle all of its with one event handler:
```js
// handle all tree model events types (item removed, inserted, etc)
treeModel.on(function(src) {
   ...
})
```


Calling **"bind"** method returns an instance of listener that has been registered. Use it to stop listening a particular component event as a parameter of **"unbind()"** method:
[js]
   // register listener
   var l = model.bind("itemSelected", function() { ... });
   ...
   // un-register listener
   model.unbind(l);
[/js]

To remove all registered listener call "unbind()" method with no parameters:
[js]
   // remove all registered listeners
   model.unbind();
[/js]



#### Catching and handling UI components events



Zebra **UI events** are various common for all UI components events. For instance mouse, key, touch events. The events always has a particular UI destination component. For instance a mouse button is pressed over a dedicated UI component. If a key is typed it is processed in the context of current focus owner UI component and so on. Zebra doesn't support catching or bubbling or combination of WEB events handling approaches.

Zebra introduces a simple approach to catch and handle the UI events handling. If you need to catch a component event just implement an appropriate UI component event handler method. For instance let's handle UI panel mouse pressed and released events:
[js gutter="false"]
// create UI panel
var p = new zebra.ui.Panel();
// implement mouse pressed event handler
p.mousePressed = function(e)  { ... };
// implement mouse released event handler
p.mouseReleased = function(e)  { ... };
[/js]

Pay attention an UI component can define own component events handlers. That means your implementation of the component event handler can overwrite the native one. It can cause the component start working improperly. In this case you have to call the native event handler implementation as follow:
[js gutter="false"]
// create UI button that declares an own mouse pressed events handler
var b = new zebra.ui.Button("Test");
// implement mouse pressed event handler that calls the native
// implementation to leave the button component in workable state
b.extend([
    function mousePressed(e) {
       // call implemented by button component mouse pressed handler
       this.$super(e);
       ...
    }
]);
[/js]

or the same, but slightly shorter with anonymous class instantiation:
[js gutter="false"]
// create UI button that declares an own mouse pressed events handler
var b = new zebra.ui.Button("Test", [
    function mousePressed(e) {
       // call implemented by button component mouse pressed handler
       this.$super(e);
       ...
    }
]);
[/js]




#### UI components events



Zebra UI component fires the following UI events:






  * 
**Key events**:
[table th="0"]
_"keyPressed(e)"_;the event fired when a key has been pressed
_"keyTyped(e)"_;the event fired when a character has been typed
_"keyReleased(e)"_;the event fired when a key has been released
[/table]

Key event handler methods gets "zebra.ui.KeyEvent" objects as its argument. The class provides the following important fields and methods:
[table]
Field or Method;Description
_source_; destination UI component
_ID_; event type ID
_ch_; typed character
_code_; pressed key code
_mask_; "ctrl", "alt", "shift", "cmd" keys mask
[/table]





  * 
**Mouse and touch screen events**:
[table th="0"]
_"mousePressed(e)"_;the event is fired when a mouse button has been pressed
_"mouseClicked(e)"_;the event is fired when a mouse button has been clicked.
_"mouseReleased(e)"_;the event is fired when a mouse button has been released
_"mouseEntered(e)"_;the event is fired when mouse cursor has entered the given UI component
_"mouseMoved(e)"_;the event is fired when mouse cursor has been moved over the given UI component
_"mouseExited(e)"_;the event is fired when mouse cursor has exited the given UI component
_"mouseDragStarted(e)"_;the event fired when mouse cursor has started being moved when a mouse button is kept pressed
_"mouseDragEnded(e)"_;the event fired when mouse cursor has ended being moved when a mouse button is kept pressed
_"mouseDragged(e)"_;the event fired when mouse cursor has moved when a mouse button is kept pressed
[/table]

Mouse event handler methods gets "zebra.ui.MouseEvent" objects as its argument. The class provides the following important fields and methods:
[table]
Field or Method;Description
_source_; destination UI component
_ID_; event type ID
_x,y_; mouse cursor location relatively to a destination UI component
_button_; button mask
_absX,absY_; mouse cursor location relatively to zebra canvas where the given destination UI component sits on
[/table]




  * 
**Component events**:
[table th="0"]
_"compSized(c,pw,ph)"_;the event is fired when component "c" has been resized. "pw" and "ph" the previos width and height correspondingly, the component had before resizing
_"compMoved(c,px,py)"_;the event is fired when component "c" has been moved. "px" and "py" the previos x and y location correspondingly, the component had before
_"compEnabled(c)"_;the event is fired when component "c" has been enabled or disabled
_"compShown(c)"_;the event is fired when component "c" visibility state has been updated
_"compRemoved(p, index, c)"_;the event is fired when component "c" has been removed from parent container "p"
_"compAdded(p, constraints, c)"_;the event is fired when component "c" has been added to parent container "p"
[/table]




  * 
**Window events**:
[table th="0"]
_"winActivated(layer,c,state)"_;the event is fired when component "c" has been activated or deactivated as internal window. "state" parameter indicates the component activity status.
_"winShown(layer,c,visibility)"_;the event is fired when component "c" has been shown or hidden as internal window. "visibility" parameter indicates if the component has been shown or hidden.
[/table]



  * 
**Focus events**:
[table th="0"]
_"focusGained(e)"_;the event is fired when a component has gained focus
_"focusLost(e)"_;the event is fired when a component has lost focus
[/table]

Focus event handler methods gets "zebra.ui.InputEvent" objects as its argument. The class provides the following important fields and methods:
[table]
Field or Method;Description
_source_; destination UI component
_ID_; event type ID
[/table]




  * 
**Children UI components events**:
[table th="0"]
_"childCompEvent(id,src,p1,p2)"_;the event is fired when a component event has occurred
_"childInputEvent(e)"_;the event is fired when an input (mouse, keyboard, focus) has occurred
[/table]





#### Children UI components events catching 


[purehtml id=23]
Imagine you are developing a new UI component. The new component contains some children UI components. It is important, for instance, to know when mouse cursor is entered and exited the children components since the events have to trigger updating children component background:
[js gutter="false"]
// import classes, methods and interfaces into local space
eval(zebra.Import("ui", "layout"));

// declare UI component class that inherits standard
// "zebra.ui.Panel"
var MyComponent = zebra.Class(Panel, [
     // implement method to handle children UI events
     function childInputEvent(e) {
        if (e.ID == MouseEvent.ENTERED) {
            e.source.setBackground("orange");
        }
        else
        if (e.ID == MouseEvent.EXITED) {
            e.source.setBackground(null);
        }
    }
]);
// build UI
var canvas = new zCanvas(350,150);
canvas.root.setLayout(new BorderLayout());
canvas.root.setBorder(new Border("gray"));
// instantiate few UI components with border element
var a=new Panel({border:new Border("red"),preferredSize:[100,70]});
var b=new Panel({border:new Border("blue"),preferredSize:[100,70]});
var c=new Panel({border:new Border("green"),preferredSize:[100,70]});
// instantiate just implemented "MyComponent" class
var myComp = new MyComponent();
myComp.setLayout(new FlowLayout(CENTER, CENTER, HORIZONTAL, 8));

// add few children UI components
myComp.add(a);
myComp.add(b);
myComp.add(c);

canvas.root.add(CENTER, myComp);
[/js]

Find live-application below:





#### Composite UI component



Zebra UI is organized as hierarchy of UI components. Every UI component can be a container for other UI components. UI hierarchy is good developing approach to implement compound UI component where developer can assemble the compound UI component from another UI components. Typical example is "zebra.ui.Button" component that allows a developer to use any other UI component as its content. Developers can add images, series of images, combinations of labels and images or any existing Zebra UI component as "zebra.ui.Button" component content.

The main problem of developing compound component is handling of children events. For instance, "zebra.ui.Button" component uses by default "zebra.ui.Label" component as its content. Every time a mouse button is pressed over the label the mouse event is sent to the label. Button component doesn't get the event. Possible solution  is implementing children component events handler. Zebra provides more graceful solution - implementing composite component by inheriting **"zebra.ui.Composite"** interface.

**"zebra.ui.Composite"** interface has very clear meaning: by implementing the interface an UI component can make its children components "event transparent". In other words children components will not get any input (mouse, keyboard, etc) events. It looks like the children components don't exist (transparent) for the events.

[js gutter="false"]
eval(zebra.Import("ui", "layout", "data"));
// listen mouse entered and exited event, change background
// color whenever mouse cursor entered the component
var p = new Panel([
    function mouseEntered(e) {this.setBackground("orange");},
    function mouseExited(e) {this.setBackground(null);}
]);

// listen mouse entered and exited event, change background
// color whenever mouse cursor entered the component
// The anonymous class instance implements composite interface,
// what causes mouse exited event will not happen if
// mouse cursor enters its children components
var composite = new Panel(Composite, [
    function mouseEntered(e){ this.setBackground("orange");},
    function mouseExited(e) { this.setBackground(null);}
]);

// build UI
var c = new zCanvas(430,150);
c.root.setBorder(new Border("black"));
p.setBounds(20,20, 250, 110);
p.setBorder(new Border("red", 2));
var l=new Label(
   new Text("Usual, not event transparent\nchildren component"));
l.setPadding(12);
l.setBorder(new Border("red"));
l.setLocation(20,20);
l.toPreferredSize();
p.add(l);
c.root.add(p);

composite.setBounds(280,20, 190, 110);
composite.setBorder(new Border("orange", 2));
var l = new Label(new Text("Event transparent\nchildren component"));
l.setPadding(12);
l.setBorder(new Border("red"));
l.setLocation(20,20);
l.toPreferredSize();
composite.add(l);
c.root.add(composite);
[/js]


Find live-application below:



Individual children UI component event transparency can be customized by implementing "catchInput(c)" method. The method gets a children UI component as input and has to return "true" if the passed children component is event transparent:
[js gutter="false"]
// instantiate "zebra.ui.Panel" class instance that listen
// mouse entered and exited events. The instance is composite
// component that makes first added children component event
// transparent
var composite = new Panel(Composite, [
    function mouseEntered(e) { this.setBackground("orange"); },
    function mouseExited(e)  { this.setBackground(null); },
    // say the first children component is event transparent
    function catchInput(c) {
        return this.indexOf(c) === 0;
    }
]);
// build UI
var c = new zCanvas(500, 150);
c.root.setBorder(new Border("black"));
c.root.setLayout(new BorderLayout());
composite.setLayout(new FlowLayout(CENTER, CENTER, VERTICAL, 16));
c.root.add(CENTER, composite);

var p1 = new Label("Event transparent children component");
p1.setBorder(new Border("red", 2));
p1.setPadding(12);
var p2 = new Label("Normal, not event transparent children component");
p2.setPadding(12);
p2.setBorder(new Border("gray", 2));

composite.add(p1);
composite.add(p2);
[/js]


Find live-application below:





#### Global UI events listeners



Zebra **UI events** handling and distribution is centralized in "zebra.ui.EventManager" class. The event manager gets all UI events and than decides how it has to be delivered to a source UI component. The event manager declares number of methods to register different type of event listeners. By registering the listeners you can catch all UI events that are happening in system.

The current installed event manager instance is accessible as **"zebra.ui.events"** variable. The following listener registration and un-registration methods are available:
[table]
Listener; Description
_addMouseListener(l)~~removeMouseListener(l)_;add, remove mouse events listener
_addKeyListener(l)~~removeKeyListener(l)_;add, remove keyboard events listener
_addComponentListener(l)~~removeComponentListener(l)_;add, remove component events listener
_addFocusListener(l)~~removeFocusListener(l)_;add, remove focus events listener
_addListener(l)~~removeListener(l)_;add, remove generic events listener. This methods analyzes which events handler methods are implemented with the passed object and add or remove the passed object detected listeners
[/table]

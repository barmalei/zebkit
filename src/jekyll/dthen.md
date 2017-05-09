---
layout: page
tags: menu2
title: D-then 
---


Writing and subsequent reading JS code can make developers crazy because of callbacks JS software is normally overloaded. Especially "curved" code is encouraged by asynchronous calls. JS Promises are good to make JS code better looking and understandable. But in a context of zebkit project standard promises concept was not enough. 

As an better alternative top JS Promise, zebkit has introduced 'DoIt' approach that have the following key advantages:   

**Simply run a sequence of methods.** No reject or resolve callbacks have to be called:

```js
new zebkit.DoIt().then(function() {
    // first executed method
    return 10;
}).then(function(arg) {
    // second executed method,'arg' is 10
    ...
}).catch(function(e) {
    // handle error it has occurred by the moment
    ...
}).then(function() {
    ...
});
```


**Run methods in an order you add it.** Synchronous, asynchronous methods can be combined in the executed sequence where every next step run only when previous one is completed:  

```js
var rn = new zebkit.DoIt().then(function() {
    // first executed method
    ...
}).then(function(arg) { // run asynchronous method
    var jn = this.join(), // request callback method 
        req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status >= 400) rn.error(new Error(this.status));
            else jn(this);
        }
    };
    req.open("GET", "https://foogle.com");
    req.send();
}).then(function(req) {
    print(req.responseText); // HTTP GET request response  
});
```


**Embedded sequences are possible.** Embedded execution method sequences can be useful to make your code more readable. Embedded sequence don't pass its result with outer sequence: 

```js
new zebkit.DoIt().then(function() {
    return 10; 
}).then(function(arg) {
    this.then(function() {
        return 100;
    }).then(function(res) {
        print(res); // 100 
    }); 
}).then(function (res)) {
    print(res); // 10
});    
```


**Multiple sequences execution can be combined.** A sequence can be run as a part of other sequence or can its run can be synchronized with another one:

```js
var doit1 = new zebkit.DoIt().then(function() {
    ...  // first executed method
}).then(function() {
    return 111;
});
// insert doit1 into the sequence 
new zebkit.DoIt().then(doit1).then(function (res) {
    print(res); // print 111;
});
```

or

```js
var doit1 = new zebkit.DoIt().then(function() {
    ...
}).then(function() {
    return 111;
});
// wait for completion of doit1 sequence
new zebkit.DoIt().till(doit1).then(function (res) {
    print(res); // print undefined;
});
```


**Simple error handling.** An exception a method of a sequence throws will be exposed in the nearest "catch" method call:

```js
new zebkit.DoIt().then(function() {
    ...
    throw new Error("My Error");
}).catch(function(e) {
    ... // handle error
    this.restart(); // flush error to let run next methods
                    // of the sequence
}).then(function() {
    ... // continue running after handling error 
});
```

**Asynchronous are easy to control.** Calling 'join' method multiple times are used to join results of multiple asynchronous code execution:

```js
new zebkit.DoIt().then(function() {
    // three asynchronous results in one method
    ajax("http://test.com/file1.txt", this.join()); 
    ajax("http://test.com/file2.txt", this.join()); 
    ajax("http://test.com/file3.txt", this.join()); 
    ...
}).then(function(r1, r2, r3) {
    // it guarantees the results will be in the order 
    // the asynchronous AJAX calls have been done on 
    // previous step
    ...  
});
```



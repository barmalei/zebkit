---
layout: page
parent: docs
title: IO
---

Zebkit __“io”__ package collects different communication classes and methods to perform HTTP requests and perform JRPC and XRPC services calls. Requests according to WEB recommendations works in asynchronous mode and return promise-like structure to track response and handle error.   

```js
// get data synchronously
zebkit.io.GET(url).then(function(request) {
    // handle  HTTP GET response
}).catch(function(error) {
    // handle error 
    ...
}),
```


Calling XRPC and JRPC service methods is also trivial thing:

```js
// Connector to a XML-RPC server that has three methods
var s = new zebkit.io.XRPC(url, [ "method1", "method2", "method3" ]);
 

// call remote service methods
s.method1(p1, p2).then(function(result) {
    // handle result the service method has returned
    ... 
}).catch(function(error) {
    // handle error
    ...
});
```

The same manner works JRPC service communication:

```js
// Connector to a JSON-RPC server that has three methods
var s = new zebkit.io.JRPC(url, [ "method1", "method2", "method3" ]);
 

// call remote service methods
s.method1(p1, p2).then(function(result) {
    // handle result the service method has returned
    ... 
}).catch(function(error) {
    // handle error
    ...
});
```

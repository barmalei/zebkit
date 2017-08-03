---
layout: page
parent: docs
title: Zson
---

### Zson features

JSON is for ages becoming is widely used format to keep configuration, exchange and store data etc. Zebkit uses JSON:

   * To configure UI components properties
   * As a descriptive language to define UI forms

Pure JSON is too basic and limited. Zebkit extends JSON interpretation to support number of advanced features. The new JSON interpretation is called Zson. Zson supports the following:
   
   * **Class instantiation.** A JSON field value can be described as an instance of a class. For instance, "a" field in the JSON below will be set to an instance of JS "RegExp" (a = new RegExp("[a-z]+","i")) class:

```json
    { "a" : { "@RegExp" : [ "[a-z]+", "i" ] } }
```

   * **Properties.** Loading a JS object with a JSON takes in account the target object can have setter methods for a dedicated properties. For the following JSON zebkit tries to call __"setTest(100)"__ method of the target object if the method is available: 
   
```json
    { "test": 100 }
```

   * **References.** A value can be set as reference to other JSON value. For instance "b" field value is set to 12:

```json
    {  "a": 12, "b": "%{a}" } 
```
   
   * **Expressions.** Expression is JS code that is evaluated and then assigned to a JSON field as a value. For instance the value of "a" field below will be resolved as JS expression and set to 20:
   
```json
    {  "a": { ".expr" : "10 + 10" } }
```

   * **Image, textual file and embedded JSON loadings.**  JSON values can be references to external resources like images, JSON, etc. For instance to load image and set it as "a" field value the following JSON can be used:

```json
    {  "a": "%{<img> http://test.com/picture.jpg}" }
```

Pay attention that external files are loaded asynchronously. You can load multiple external files recursively. Zebkit keeps the loadings in order. That means any subsequent field value can be a reference to a an externally loaded field. For instance:     

```json 
{  "a" : 100,
   "b" : { "c": { "@Date" : [] } }, 
   "d" : "%{a}",
   "e" : "%{<json> http://test.com/embedded.json}",
   "f" : "%{e.m.k}"
}
```

Where "embedded.json" is:

```json 
{  "m" : {  "k" : "Hello" } }
```


   - __"a"__ equals 100
   - __"c"__ is an instance of JS "Date" class 
   - __"d"__ is reference that will be resolved to value "a" key has (100)
   - __"e"__ value will be loaded and set to data "http://test.com/data.txt" URL points
   - __"f"__ value is a reference to JSON content that is loaded as external JSON. In this case "f" equals "Hello".

```js
new Zson().then(function("config.json", conf) {
    ... // handle fully loaded json
});  
```


### Configure JS objects with Zson

Zson can be used to configure classes and class instances with required properties. The way to do it looks as follow:

   - Imagine we declare simple class: 

```js
var A = zebkit.Class([
    function(a, b, c) {  // constructor
        this.a = a;
        this.b = b;
        this.c = c;
    },

    function setD(d) { // setter of property "d" 
        this.d = d;
    }
]); 
```

   - Then we declare JSON  ("config.json") to configure the class instance:

```json 
{  
    "d" : "value of property 'd'",
    "c" : { "@Date": [] },
    "c" : [ 1,2,3 ]
}
```

  - And at last instantiate the class and configure the instance with JSON:  

```js
var a = new A();
// configure instance of class "A" with JSON
zebkit.util.then("config.json", a);  
```

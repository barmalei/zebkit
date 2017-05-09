---
layout: page
tags: menu2
title: Zson
---

### Zson features

JSON is for ages becoming is widely used format to keep configuration, parse data etc. Zebkit uses JSON:

   * To configure UI components properties
   * As way to describe UI forms

Definitely pure JSON is not enough and zebkit has introduced extended JSON interpretation that supports:
   
   * **Class instantiation.** A JSON value can be described as an instance of the a class. For instance, "a" key in the JSON below will be set to an instance of JS "RegExp" class:

    ```json
    { "a" : { "@RegExp" : [ "[a-z]+", "i" ] } }
    ```

   * **Properties.** Loading a JS object with a JSON takes in account the target object can have setter methods for a dedicated properties. For the following JSON zebkit tries to call __"setTest(100)"__ method of the target object: 
   
    ```json
    { "test": 100 }
    ```

   * **References.** A value can be set as reference to other JSON value. For instance "b" key value is 12:

    ```json
    {  "a": 12, "b": "%{a}" } 
    ```
   
   * **Expressions.** Expression is JS code that is evaluated and then assign to JSON key as a value. For instance the value of "a" key below will be set to 20:
   
    ```json
    {  "a": { ".expr" : "10 + 10" } }
    ```

   * **Image, textual file and embedded JSON loadings.**  JSON values can be references to external resources like images, JSON, etc. For instance to load image and set it as key "a" value the following JSON can be used:

    ```json
    {  "a": "%{<img> http://test.com/picture.jpg}" }
    ```

   * **Zebkit JSON is loaded asynchronously.** You can load multiple embedded JSON recursively, zebkit does the loadings asynchronously but  

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


```js
var A = zebkit.Class([
    function(a, b, c) {  // constructor
        this.a = a;
        this.b = b;
        this.c = c;
    },

    function setD(d) { // property "d" 
        this.d = d;
    }
]); 
```


```json 
{  "@A" : [ 1, 2, 3],
    "d" : "property 'd' value"
}
```


```js

var a = null;
new Zson().then(function(".json", conf) {
    
});  
```

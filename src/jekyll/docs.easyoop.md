---
layout: page
parent: docs
title: Easy OOP
---

<br/>

**Simple concept** 

   * Use _"zebkit.Class(...)"_ method to declare zebkit classes
   * Pass parent class (optionally), interfaces (optionally) and array of methods that the given class has to have
   * Method with empty name is reserved for constructor

```js
// Declare "MyClass" class
var MyClass = zebkit.Class([
    // Declare class constructor
    function () {
        this.a = 10; // Initialize variable "a" 
    },

    // Declare class method "abc"  
    function abc() { ... }
]);

// Instantiate the class 
var myClassInstance = new MyClass();

// Call method "abc"
myClassInstance.abc(); 
myClassInstance.a; // 10 
```
   

**Access to parent context** 

   * Use __$super(...)__ method to call a parent method implementation
   * __$super(...)__ works correct for deep hierarchy tracking properly an order of methods execution 

```js
var A = zebkit.Class([
    function(a) { this.varA = a; },
    function abc() { return 2; }
]);

var B = zebkit.Class(A, [
    function(a, b) {
        this.$super(a); // Call parent constructor  
        this.varB = b;
    },

    function abc() {
        return 3 + this.$super(); // Call parent method "abc()" 
    }
]);
var a = new A(3), b = new B(2, 5); 
a.varA;  // 3
b.varA;  // 2
b.varB;  // 5
b.abc(); // 3 + 2 = 5   
```


**Inheritance** 

   * Zebkit easy OOP supports single parent inheritance 
   * Pass a parent class to be inherited as the first parameter of __"zebkit.Class(...)"__ method
   * Class methods can be overridden, but not overloaded
   * Constructor is inherited
   * Use __"zebkit.instanceOf()__ operator instead of standard JS __"instanceof"__  

```js
// Define class A with class method  "abc()"
var A = zebkit.Class([
    function abc() { ... }
]);

// Declare class B that inherits class A 
var B = zebkit.Class(A, [ ]);

// Instantiate the class B and A
var b = new B(), a = new A();

b.abc();  // Call inherited method
zebkit.instanceOf(b, A) // true
zebkit.instanceOf(b, B) // true
zebkit.instanceOf(a, B) // false
```


**Mixing (Interface)** Mixing is way to share common functionality between classes without necessity to support improper multi inheritance OOP concept.

   * Mix methods set has to be declared with __"zebkit.Interface(...)"__
   * __"zebkit.Interface()"__ can declare set of methods
   * Interface cannot inherit other interfaces and classes

```js
// Declare Mix1 and Mix2 interfaces  x§
var Mix1 = zebkit.Interface([
    function abc() { ... }
]); 
var Mix2 = zebkit.Interface([
    function cde() { ... }
]); 

// Declare class A that mixes "Mix1" interface methods
var A = zebkit.Class(Mix1, [...]);

// Declare class B that mixes "Mix1" and "Mix2" interfaces methods
var B = zebkit.Class(Mix1, Mix2, [...]);

// Instances of A and B classes have  got mixed methods
var a = new A(), b = new B();

a.abc();
b.abc();
b.cde();
```

**Parametrized interfaces** A declared interface can be parametrized. Parametrization is a declaration of the same interface (with the identical set of methods) but with another default properties set.

```js
// Declare an interface that renders rectangle 
var DrawRect = zebkit.Interface([
    function paint(g) {
        if (typeof this.color !== 'undefined') {
            g.color = this.color; 
        }

        if (typeof this.lineWidth !== 'undefined') {
            g.lineWidth = this.lineWidth;
        }

        g.rect(0, 0, 100, 100);
        g.stroke();
    }
]);

// Let's create an interface that draws thick red rectangle 
var DrawSolidRedRect = DrawRect({
    color: "red",
    lineWidth: 4
});
```

**Anonymous classes** Anonymous classes is one of the greatest feature zebkit Easy OOP provides. Zebkit allows developers to customize classes during the classes instantiation.

   * Pass to instantiated class array of anonymous class methods to customize it as the last argument
   * Original class methods and constructor can be overridden with anonymous methods
   * Super context is accessible from an anonymous class methods

```js
// Declare class A
var A = zebkit.Class([
    function(p) {  // Constructor
        this.v = p;
    }, 
    function abc() { return 10; }
]);
// Instantiate anonymous class A that overrides constructor and method 
// "abc()".Add new class method-"cba()"
var a = new A(1/* Constructor arg */,[
    function(p){ // Override 
        this.$super(p + 1); 
    },
    function abc() { // Override
        return this.$super() + 10; 
    },
    function cba() { ... } 
]);
a.abc(); // 20
a.v;     // 1 + 1 = 2
```


**Static methods and variables** 

   * Static variables and methods have to be declared inside special _"$clazz()"_ method. The method is called in a class scope context
   * Static variables are inheritable 
   * Static variables whose names start from "$" character are not inheritable

```js
var A = zebkit.Class([
    // Declare static stuff inside the  method
    function $clazz() {  
       this.staticVar    = 10;
       this.$staticVar   = 11;
       this.staticMethod = function(){
           ... 
       };
    }
]);

// Declare class B that inherits class A
var B = zebkit.Class(A, []);

A.staticVar;    // 10
A.$staticVar;   // 11
B.staticVar;    // 10 (inherited) 
B.$staticVar;   // undefined
B.staticMethod == A.staticMethod;// true
```


**Packaging** It is recommended to use package system zebkit provides. The packages are organized as hierarchy (the same way Java does it). Packages are accessible from predefined __"zebkit"__ global package with using dot notation. The main rules you should follow:

   * Declare a package variables and classes safely with __"zebkit.package(...)"__ method
   * Safely access to packages stuff with __"zebkit.require(...)"__ method
   * Use dot notation to access package stuff 

```js
// Define stuff in "test" package 
zebkit.package("test", function() {
    this.v = "Hello 1"; 
}); 

// Access "v" from package "test"
zebkit.test.v; // "Hello 1"

// It is recommended to access a package stuff with "require(...)"
// method, since a package can do some initialization stuff 
// asynchronously 
zebkit.require("test", function(test) {
   test.v // "Hello 1" 
}); 
```


**Import package stuff in your scope** Not always handy to access classes and variables by pointing full path to its (__"zebkit.ui.grid.Grid"__). Zebkit helps importing fields from the given package(s) into a local scope by using __zebkit.import()__ method that should be used in combination with JS "eval()" standard method. Pay attention that using JS "eval()" method is bad practice. It is recommended to use __"zebkit.require(...)"__ method.

```js
// Define variables in "test" package 
zebkit.package("test", function() {
    this.variable = "Hello 1"; 
    this.A = zebkit.Class([...]);
    this.$variable = 100;
});
 
// Use zebkit.require() to write zebkit code safely 
zebkit.require(function() {
    // Import fields from "test" package into current scope 
    eval(zebkit.import("test"));
  
    // Now access variables directly
    variable; // "Hello 1"
    new A();  // new instance of class zebkit.test.A
  
    // variables whose names start from '$' character 
    // are not imported
    $variable;// undefined
});
```


**Dynamic class extensions** Zebkit classes can be extended dynamically either on the class level (extend class definition with new methods and variables) or on the class instance level.

   * Use __"extend(...)"__ method to extend a class or a class instance with new methods and fields
   * Extending of a class causes his new instances will get the extensions
   * Extending an instance of a class has effect only for the given class instance

```js
var A = zebkit.Class([
    function abc() { return 10; }
]);
// Extend class "A" with "cba()" method and override "abc()" method 
A.extend([
    function cba() { ... },
    function abc() { 
        return this.$super() + 1; 
    }
]);
var a = new A(), aa = new A();
a.cba(); // Call "cba()" method 

// Extend instance of class "A" 
a.extend([
   function q() { this.abc(); this.cba(); }
]);
a.q(); // call "q()" instance specific method
aa.q;  // undefined
```



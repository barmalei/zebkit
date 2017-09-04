/**
 * This is the core package that provides powerful easy OOP concept, packaging
 * and number of utility methods. The package doesn't have any dependencies
 * from others zebkit packages and can be used independently. Briefly the
 * package possibilities are listed below:

   - **easy OOP concept**. Use "zebkit.Class" and "zebkit.Interface" to declare
     classes and interfaces

    ```JavaScript
        // declare class A
        var ClassA = zebkit.Class([
            function() { // class constructor
                ...
            },
            // class method
            function a(p1, p2, p3) { ... }
        ]);

        var ClassB = zebkit.Class(ClassA, [
            function() {  // override cotoString.nanstructor
                this.$super(); // call super constructor
            },

            function a(p1, p2, p3) { // override method "a"
                this.$super(p1, p2, p3);  // call super implementation of method "a"
            }
        ]);

        var b = new ClassB(); // instantiate classB
        b.a(1,2,3); // call "a"

        // instantiate anonymous class with new method "b" declared and
        // overridden method "a"
        var bb = new ClassB([
            function a(p1, p2, p3) { // override method "a"
                this.$super(p1, p2, p3);  // call super implementation of method "a"
            },

            function b() { ... } // declare method "b"
        ]);

        b.a();
        b.b();
    ```

   - **Packaging.** Zebkit uses Java-like packaging system where your code is bundled in
      the number of hierarchical packages.

    ```JavaScript
        // declare package "zebkit.test"
        zebkit.package("test", function(pkg) {
            // declare class "Test" in the package
            pkg.Test = zebkit.Class([ ... ]);
        });

        ...
        // Later on use class "Test" from package "zebkit.test"
        zebkit.require("test", function(test) {
            var test = new test.Test();
        });
    ```

    - **Resources loading.** Resources should be loaded with a special method to guarantee
      its proper loading in zebkit sequence and the loading completeness.

    ```JavaScript
        // declare package "zebkit.test"
        zebkit.resources("http://my.com/test.jpg", function(img) {
            // handle completely loaded image here
            ...
        });

        zebkit.package("test", function(pkg, Class) {
            // here we can be sure all resources are loaded and ready
        });
    ```

   - **Declaring number of core API method and classes**
      - **"zebkit.DoIt"** - improves Promise like alternative class
      - **"zebkit.URI"** - URI helper class
      - **"zebkit.Dummy"** - dummy class
      - **instanceOf(...)** method to evaluate zebkit classes and and interfaces inheritance.
        The method has to be used instead of JS "instanceof" operator to provide have valid
        result.
      - **zebkit.newInstance(...)** method
      - **zebkit.clone(...)**  method
      - etc

 * @class zebkit
 * @access package
 */

// =================================================================================================
//
//   Zebkit root package declaration
//
// =================================================================================================
var zebkit = new Package("zebkit");

/**
 * Reference to zebkit environment. Environment is basic, minimal API
 * zebkit and its components require.
 * @for  zebkit
 * @attribute environment
 * @readOnly
 * @type {Environment}
 */

// declaring zebkit as a global variable has to be done before calling "package" method
// otherwise the method cannot find zebkit to resolve class names
//
// nodejs
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = zebkit;
}

$global.zebkit = zebkit;

// collect exported entities in zebkit package space
zebkit.package(function(pkg) {
    for(var exp in $exports) {
        pkg[exp] = $exports[exp];
    }
});

if ($isInBrowser) {

    // collect query string parameters
    try {
        var uri = new URI(document.URL);
        if (uri.qs !== null) {
            var params = URI.parseQS(uri.qs);
            for (var k in params) {
                zebkit.config(k, URI.decodeQSValue(params[k]));
            }

            var cacheBusting = zebkit.config("zson.cacheBusting");
            if (typeof cacheBusting !== 'undefined' && cacheBusting !== null) {
                Zson.prototype.cacheBusting = cacheBusting;
            }
        }
    } catch(e) {
        dumpError(e);
    }

    zebkit.then(function() {
        var jn        = this.join(),
            $interval = $zenv.setInterval(function () {
            if (document.readyState === "complete") {
                $zenv.clearInterval($interval);
                jn(zebkit);
            }
        }, 50);
    });
}

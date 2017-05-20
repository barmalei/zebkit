    function AssertionError(msg) {
        Error.call(this, msg);
        this.message = msg;
    }
    AssertionError.prototype = new Error();

    pkg.assertTrue = function(c, lab) {
        pkg.assert(c, true, lab, "AssertTrue");
    };

    pkg.assertFalse = function(c, lab) {
        pkg.assert(c, false, lab, "AssertFalse");
    };

    pkg.assertNull = function(c, lab) {
        pkg.assert(c, null, lab,  "AssertNull");
    };

    pkg.assertDefined = function(o, p, lab) {
        pkg.assert(typeof o[p] !== "undefined", true, lab,  "AssertDefined");
    };

    pkg.assertFDefined = function(o, f, lab) {
        var b = typeof o[f] !== "undefined" && typeof o[f] === "function";
        if (!b && zebkit.isIE) b = !!o[f] && typeof o[f].toString==="undefined" && /^\s*\bfunction\b/.test(o[f]);
        pkg.assert(b, true, lab, "AssertFunctionDefined");
    };

    pkg.assertObjEqual = function(obj1, obj2, lab) {
        function cmp(obj1, obj2, path) {
            function isNumeric(n) {
              return !isNaN(parseFloat(n)) && isFinite(n);
            }

            if (obj1 === obj2) return true;

            if (obj1 == null || obj2 == null) {
                throw new AssertionError("One of the compared object is null");
            }

            if (Array.isArray(obj1)) {
                if (!Array.isArray(obj2) || obj1.length != obj2.length) {
                    throw new AssertionError("Array type or length mismatch");
                }

                for(var i=0; i < obj1.length; i++) {
                    if (!cmp(obj1[i], obj2[i], path)) return false;
                }
                return true;
            }

            if (zebkit.isString(obj1) || isNumeric(obj1) || typeof obj1 === 'boolean') {
                if (obj1 !== obj2) throw new AssertionError("Objects values '" + obj1 + "' !== '" + obj2 );
                return true;
            }

            for(var k in obj1) {
                var pp =  path == "" ? k : path + "." + k;

                if (typeof obj2[k] === "undefined") {
                    throw new AssertionError("Object field '"  + pp + "' is undefined" );
                }
                if (!cmp(obj1[k], obj2[k], pp)) return false;
            }
            return true;
        }

        pkg.assert(cmp(obj1, obj2, "") && cmp(obj2, obj1, ""), true, lab, "AssertObjectEqual");
    };

    pkg.assert = function(c, er, lab, assertLab) {
        if (typeof assertLab === "undefined") {
            assertLab = "Assert";
        }
        if (c !== er) {
            throw new AssertionError((lab ? "'" + lab + "' ":"") + assertLab + " result = '" + c  + "' expected = '" + er + "'");
        }
    };

    pkg.assertException = function(f, et, lab) {
        if (!(f instanceof Function)) throw new WrongArgument("Function as input is expected");

        if (zebkit.isString(et)) lab = et;
        if (arguments.length < 2 || zebkit.isString(et)) et = Error;

        try { f(); }
        catch(e) {
            if (e instanceof et) return;
            throw e;
        }
        throw new AssertionError((lab ? "'" + lab + "'":"") + " in\n" + f + "\n" + "method. '" + et.name + "' exception is expected");
    };

    pkg.assertNoException = function(f, lab) {
        if (!(f instanceof Function)) throw new WrongArgument("Function as input is expected");
        try { f(); }
        catch(e) {
            throw new AssertionError((lab ? "'" + lab + "'":"") + " in\n" + f + "\n" + "method. '" + e.toString() + "' exception is not expected");
        }
    };

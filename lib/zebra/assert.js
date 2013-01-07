(function(pkg) {

function dummy() {}
var FN = zebra.$FN

function AssertionError(msg) {
    Error.call(this, msg);
    this.message = msg;
}
AssertionError.prototype = new Error();

pkg.assertTrue = function(c, lab) { pkg.assert(c, true, lab, "AssertTrue");};
pkg.assertFalse = function(c, lab) { pkg.assert(c, false, lab, "AssertFalse"); };
pkg.assertNull = function(c, lab) { pkg.assert(c, null, lab,  "AssertNull"); };
pkg.assertDefined = function(o, p, lab) { pkg.assert(typeof o[p] !== "undefined", true, lab,  "AssertDefined"); };

pkg.assertFDefined = function(o, f, lab) {
    var b = typeof o[f] !== "undefined" && typeof o[f] === "function";
    if (!b && zebra.isIE) b = !!o[f] && typeof o[f].toString==="undefined" && /^\s*\bfunction\b/.test(o[f]);
    pkg.assert(b, true, lab, "AssertFunctionDefined");
};

pkg.assertObjEqual = function(obj1, obj2, lab) {
    function cmp(obj1, obj2) {
        function isNumeric(n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        }

        if (obj1 === obj2) return true;
        if (obj1 === null || obj2 === null) throw new AssertionError("One of the compared object is null");

        if (Array.isArray(obj1)) {
            if (!Array.isArray(obj2) || obj1.length != obj2.length) throw new AssertionError("Array type or length mismatch");
            for(var i=0; i < obj1.length; i++) {
                cmp(obj1[i], obj2[i]);
            }
            return true;
        }

        if (zebra.isString(obj1) || isNumeric(obj1) || typeof obj1 === 'boolean') {
            if (obj1 !== obj2) throw new AssertionError("Objects values '" + obj1 + "' !== '" + obj2 );
            return true;
        }

        for(var k in obj1) {
            if (typeof obj2[k] === "undefined") throw new AssertionError("Object field '"  + k + "' is undefined" );
            cmp(obj1[k], obj2[k]);
        }
        return true;
    }

    pkg.assert(cmp(obj1, obj2), true, lab, "AssertObjectEqual");
};

pkg.assert = function(c, er, lab, assertLab) {
    if (typeof assertLab === "undefined") assertLab = "Assert";
    if (c !== er) throw new AssertionError((lab ? "'" + lab + "' ":"") + assertLab + " result = '" + c  + "' expected = '" + er + "'");
};

pkg.assertException = function(f, et, lab) {
    if (!(f instanceof Function)) throw new WrongArgument("Function as input is expected");
    
    if (zebra.isString(et)) lab = et;
    if (arguments.length < 2 || zebra.isString(et)) et = Error;
    
    try { f(); }
    catch(e) {
        if ((e.instanceOf && e.instanceOf(et)) || (e instanceof et)) return;
        throw e;
    }
    throw new AssertionError((lab ? "'" + lab + "'":"") + " in\n" + f + "\n" + "method. '" + et.name + "' exception is expected");
};

pkg.assume = function(c, er, lab) {
    if (c !== er) pkg.out.warn("Wrong assumption " + (lab ? "'" + lab + "'":"") + " evaluated = '" + c  + "' expected = '" + er + "'");
};

pkg.obj2str = function(v, shift) {
    if (typeof shift === "undefined") shift = "";

    if (v == null || zebra.isNumber(v) || zebra.isBoolean(v) || zebra.isString(v)) return v;

    if (Array.isArray(v)) {
        var s = [ "[" ];
        for(var i=0; i < v.length; i++) {
            if (i > 0) s.push(", ");
            s.push(pkg.obj2str(v[i]));
        }
        s.push("]");
        return s.join("");
    }

    var s = [shift, "{"];
    for(var k in v) {
        s.push("\n  " + shift + k + " = " + pkg.obj2str(v[k], shift + "  "));
    }
    s.push("\n", shift, "}");
    return s.join('');
};

pkg.runTests = function() {
    var pout = pkg.out, c = 0,  err = 0, sk = 0, title = null;
    if (pkg.isInBrowser) pkg.out = new pkg.HtmlOutput();

    var args = Array.prototype.slice.call(arguments);
    if (args.length > 0 && zebra.isString(args[0])) title = args.shift();

    try {
        pkg.print("Running " + args.length + " test cases "  + (title !== null? "from '" + title + "' test suite" : "") + " :");
        pkg.print("==============================================");
        for(var i = 0; i<args.length; i++) {
            var f = args[i];
            if (typeof f !== "function") throw new Error("Test case has to be function");

            var k = FN(f);
            try {
                if (k.indexOf("_") === 0) {
                    pkg.out.warn("? " + k + " (remove leading '_' to enable '" + k + "' test case)");
                    sk++;
                    continue;
                }
                c++;
                f();
                pkg.print("+ " + k);
            }
            catch(e) {
                err++;
                if (e instanceof AssertionError) pkg.out.error("- " + k + " || " + e.message);
                else {
                    pkg.out.error("Unexpected error: " + e);
                    // if (e.rhinoException)  {
                    //     e.rhinoException.printStackTrace();
                    // }
                    throw e;
                }
            }
        }
        pkg.out.print("==============================================");
        if (c === 0) {
            pkg.out.warn("No test case to be run was found");
        }
        else {
            if (sk > 0)  pkg.out.warn("" + sk + " test cases have been skipped");
            if (err === 0) pkg.print((sk === 0 ? "ALL (" + c  + ")" : c) + " test cases have passed successfully");
            else pkg.out.error("" + err  + " test cases have failed");
        }
    }
    finally {
        pkg.out = pout;
    }
};

})(zebra);

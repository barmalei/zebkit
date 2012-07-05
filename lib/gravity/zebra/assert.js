(function(pkg) {

pkg.assertTrue = function(c, lab) { pkg.assert(c, true, lab);}
pkg.assertFalse = function(c, lab) { pkg.assert(c, false, lab); }
pkg.assertNull = function(c, lab) { pkg.assert(c, null, lab); }

pkg.assert = function(c, er, lab) {
    lab = lab ? lab : 'undefined';
    if (c !== er) throw new Error("Assertion (" + lab + ") value = '" + c  + "' doesn't match '" + er + "'");
}

pkg.assertException = function(f, et, lab) {
    lab = lab ? lab : 'undefined';
    if (!(f instanceof Function)) throw new WrongArgument("Function as input is expected");
    try { f(); }
    catch(e) { 
        if ((e.instanceOf && e.instanceOf(et)) || (e instanceof et)) return;
        throw e;
    } 
    throw new Error("Assertion ("+ lab + ") in\n" + f + "\n" + "method. '" + et.name + "' exception is expected");
}

pkg.assume = function(c, er, lab) {
    lab = lab ? lab : 'undefined';
    if (c !== er) pkg.out.warn("Wrong assumption (" + lab + ") value = '" + c  + "' doesn't match '" + er + "'");
}

pkg.runTests = function(scope) {
    var pout = pkg.out, c = err = 0;
    if (pkg.isInBrowser) pkg.out = new pkg.HtmlOutput();
    
    try {
        for(var k in scope) {
            var f = scope[k];
            if (f instanceof Function && k.indexOf("test_") == 0) {
                try {
                    c++;
                    f();
                    pkg.out.print("+ " + k);
                }
                catch(e) {
                    err++;
                    pkg.out.error("- " + k + " : " + e.message);
                }
            }
        }
        pkg.out.print("==============================================");
        if (c == 0) {
            pkg.out.warn("There is no a test case defined in the given test suit");
        }
        else {
            if (err == 0) pkg.out.print("all (" + c  + ") test cases have passed successfully");
            else pkg.out.error("" + err  + " test cases have failed");
        }
    }
    finally {
        pkg.out = pout;
    }
}

})(zebra);

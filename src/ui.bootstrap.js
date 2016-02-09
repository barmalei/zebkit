zebkit.package("ui", function(pkg, Class) {

    var path = zebkit()['zebkit.json'];
    if (typeof path === "undefined") {
        path = pkg.$url.join("zebkit.json");
    }

    if (path != null) {
        zebkit.busy();
        pkg.load(path,function(e) {
            if (e != null) {
                console.log("Config JSON loading failed:" + (e.stack != null ? e.stack : e));
            }
            zebkit.ready();
        });
    }

    //!!!
    // IE9 has an error: first mouse press formally pass focus to
    // canvas, but actually it doesn't get key events. To fix it
    // it is necessary to pass focus explicitly to window
    if (zebkit.isIE) window.focus();
});
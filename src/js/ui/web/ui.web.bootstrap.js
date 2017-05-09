zebkit.package("ui.web", function(pkg, Class) {
    zebkit.ui.$configWith(pkg);

    //!!!
    // IE9 has an error: first mouse press formally pass focus to
    // canvas, but actually it doesn't get key events. To fix it
    // it is necessary to pass focus explicitly to window
    if (zebkit.isIE) {
        window.focus();
    }
});
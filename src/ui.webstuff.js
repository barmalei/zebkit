(function(pkg, Class) {
    pkg.$canvases = [];

    zebkit.ready(function() {
        // canvases location has to be corrected if document layout is invalid
        pkg.$elBoundsUpdated = function() {
            for(var i = pkg.$canvases.length - 1; i >= 0; i--) {
                var c = pkg.$canvases[i];
                if (c.isFullScreen === true) {
                    //c.setLocation(window.pageXOffset, -window.pageYOffset);

                    var ws = zebkit.web.$viewPortSize();

                    // browser (mobile) can reduce size of browser window by
                    // the area a virtual keyboard occupies. Usually the
                    // content scrolls up to the size the VK occupies, so
                    // to leave zebkit full screen content in the window
                    // with the real size (not reduced) size take in account
                    // scrolled metrics
                    c.setSize(ws.width  + window.pageXOffset,
                              ws.height + window.pageYOffset);
                }
                c.recalcOffset();
            }
        };

        var $wrt = null, winSizeUpdated = false, wpw = -1, wph = -1;
        window.addEventListener("resize", function(e) {
            if (wpw == window.innerWidth && wph == window.innerHeight) {
                return;
            }

            wpw = window.innerWidth;
            wph = window.innerHeight;

            if ($wrt != null) {
                winSizeUpdated = true;
            }
            else {
                $wrt = zebkit.util.task(
                    function(t) {
                        if (winSizeUpdated === false) {
                            pkg.$elBoundsUpdated();
                            t.shutdown();
                            $wrt = null;
                        }
                        winSizeUpdated = false;
                    }
                ).run(200, 150);
            }
        }, false);

        window.onbeforeunload = function(e) {
            var msgs = [];
            for(var i = pkg.$canvases.length - 1; i >= 0; i--) {
                if (pkg.$canvases[i].saveBeforeLeave != null) {
                    var m = pkg.$canvases[i].saveBeforeLeave();
                    if (m != null) {
                        msgs.push(m);
                    }
                }
            }

            if (msgs.length > 0) {
                var message = msgs.join("  ");
                if (typeof e === 'undefined') {
                    e = window.event;
                }

                if (e) e.returnValue = message;
                return message;
            }
        };

        // TODO: this is depricated events that can have significant impact to
        // page performance. That means it has to be removed and replace with soemting
        // else
        //
        // bunch of handlers to track HTML page metrics update
        // it is necessary since to correct zebkit canvases anchor
        // and track when a canvas has been removed
        document.addEventListener("DOMNodeInserted", function(e) {
            pkg.$elBoundsUpdated();
        }, false);

        document.addEventListener("DOMNodeRemoved", function(e) {
            // remove canvas from list
            for(var i = pkg.$canvases.length - 1; i >= 0; i--) {
                var canvas = pkg.$canvases[i];
                if (zebkit.web.$contains(canvas.element) !== true) {
                    pkg.$canvases.splice(i, 1);
                    if (canvas.saveBeforeLeave != null) {
                        canvas.saveBeforeLeave();
                    }
                }
            }

            pkg.$elBoundsUpdated();
        }, false);
    });
})(zebkit("ui"), zebkit.Class);
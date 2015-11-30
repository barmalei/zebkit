(function(pkg, Class) {
    pkg.$canvases = [];

    zebra.ready(function() {
        // canvases location has to be corrected if document layout is invalid
        pkg.$elBoundsUpdated = function() {
            for(var i = pkg.$canvases.length - 1; i >= 0; i--) {
                var c = pkg.$canvases[i];
                if (c.isFullScreen === true) {
                    //c.setLocation(window.pageXOffset, -window.pageYOffset);

                    var ws = zebkit.web.$windowSize();
                    // browser (mobile) can reduce size of browser window by
                    // the area a virtual keyboard occupies. Usually the
                    // content scrolls up to the size the VK occupies, so
                    // to leave zebra full screen content in the window
                    // with the real size (not reduced) size take in account
                    // scrolled metrics
                    c.setSize(ws.width + window.pageXOffset, ws.height + window.pageYOffset);
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
                $wrt = zebra.util.task(
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
        // it is necessary since to correct zebra canvases anchor
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

    // TODO: not a good place for clipboard manager
    pkg.ClipboardSupport = Class([
        function $clazz() {
            this.Listeners = zebra.util.ListenersClass("clipCopy", "clipPaste", "clipCut");
        },

        function $prototype() {
            this.keyPressed = function (e) {
                var focusOwner = pkg.focusManager.focusOwner;
                if (e.code     === this.clipboardTriggerKey &&
                    focusOwner !=  null                     &&
                    (focusOwner.clipCopy  != null || focusOwner.clipPaste != null))
                {
                    this.$clipboard.style.display = "block";
                    this.$clipboardCanvas = focusOwner.getCanvas();

                    // value has to be set, otherwise some browsers (Safari) do not generate
                    // "copy" event
                    this.$clipboard.value = "1";

                    this.$clipboard.select();
                    this.$clipboard.focus();
                }
            };
        },

        function(clipboardTriggerKey) {
            this.clipboardTriggerKey = clipboardTriggerKey;

            function $dupKeyEvent(e, id, target)  {
                var k = new Event(id);
                k.keyCode  = e.keyCode;
                k.key      = e.key;
                k.target   = target;
                k.ctrlKey  = e.ctrlKey;
                k.altKey   = e.altKey;
                k.shiftKey = e.shiftKey;
                k.metaKey  = e.metaKey;
                return k;
            }

            if (clipboardTriggerKey > 0) {
                // TODO: why bind instead of being a manager ?
                pkg.events.bind(this);

                this._ = new this.clazz.Listeners();

                var $clipboard = this.$clipboard = document.createElement("textarea"),
                    $this = this;

                $clipboard.setAttribute("style", "display:none;position:fixed;left:-99em;top:-99em;");

                $clipboard.onkeydown = function(ee) {
                    $this.$clipboardCanvas.$container.dispatchEvent($dupKeyEvent(ee, 'keydown', $this.$clipboardCanvas.$container));
                    $clipboard.value="1";
                    $clipboard.select();
                };

                $clipboard.onkeyup = function(ee) {
                    if (ee.keyCode === $this.clipboardTriggerKey) {
                        $clipboard.style.display = "none";
                        $this.$clipboardCanvas.$container.focus();
                    }

                    $this.$clipboardCanvas.$container.dispatchEvent($dupKeyEvent(ee, 'keyup', $this.$clipboardCanvas.$container));
                };

                $clipboard.onblur = function() {
                    this.value="";
                    this.style.display="none";

                    //!!! pass focus back to canvas
                    //    it has to be done for the case when cmd+TAB (switch from browser to
                    //    another application)
                    $this.$clipboardCanvas.$container.focus();
                };

                $clipboard.oncopy = function(ee) {
                    if (pkg.focusManager.focusOwner          != null &&
                        pkg.focusManager.focusOwner.clipCopy != null    )
                    {
                        var v = pkg.focusManager.focusOwner.clipCopy();
                        $clipboard.value = (v == null ? "" : v);
                        $clipboard.select();
                        $this._.clipCopy(v, $clipboard.value);
                    }
                };

                $clipboard.oncut = function(ee) {
                    if (pkg.focusManager.focusOwner && pkg.focusManager.focusOwner.cut != null) {
                        $clipboard.value = pkg.focusManager.focusOwner.cut();
                        $clipboard.select();
                        $this._.clipCut(pkg.focusManager.focusOwner, $clipboard.value);
                    }
                };

                if (zebra.isFF === true) {
                    $clipboard.addEventListener ("input", function(ee) {
                        if (pkg.focusManager.focusOwner &&
                            pkg.focusManager.focusOwner.clipPaste != null)
                        {
                            pkg.focusManager.focusOwner.clipPaste($clipboard.value);
                            $this._.clipPaste(pkg.focusManager.focusOwner, $clipboard.value);
                        }
                    }, false);
                }
                else {
                    $clipboard.onpaste = function(ee) {
                        if (pkg.focusManager.focusOwner != null && pkg.focusManager.focusOwner.clipPaste != null) {
                            var txt = (typeof ee.clipboardData == "undefined") ? window.clipboardData.getData('Text')  // IE
                                                                               : ee.clipboardData.getData('text/plain');
                            pkg.focusManager.focusOwner.clipPaste(txt);
                            $this._.clipPaste(pkg.focusManager.focusOwner, txt);
                        }
                        $clipboard.value = "";
                    };
                }
                document.body.appendChild($clipboard);
            }
        }
    ]);

})(zebra("ui"), zebra.Class);
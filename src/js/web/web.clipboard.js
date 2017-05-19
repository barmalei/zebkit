zebkit.package("web", function(pkg, Class) {
    //  zebkit dependencies:
    //      -- zebkit.ui.Clipboard
    //      -- zebkit.web.$fetchKeyCode
    //
    //

    // IE doesn't allow standard window.Event instantiation
    // this is a workaround to avoid the problem
    function CustomEvent(event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }
    CustomEvent.prototype = window.Event.prototype;

    function $dupKeyEvent(e, id, target)  {
        var k = new CustomEvent(id);
        k.keyCode   = e.keyCode;
        k.key       = e.key;
        k.code      = e.code;
// TODO: cannot be set in strict mode and most likely it is set with dispactEvent() function
// properly
//        k.target    = target;
        k.ctrlKey   = e.ctrlKey;
        k.altKey    = e.altKey;
        k.shiftKey  = e.shiftKey;
        k.metaKey   = e.metaKey;
        k.which     = e.which;

      // TODO: cannot be set in strict mode and most likely it is set with dispactEvent() function
      // properly
      //  k.timeStamp = e.timeStamp;
        return k;
    }

    /**
     * Clipboard support class. The class is light abstraction that helps to perform
     * textual data exchange via system (browser) clipboard. Browsers have different approaches
     * and features regarding clipboard implementation and clipboard API. This class
     * hides the native specific and provides simple way to exchange data via clipboard.
     * @param  {String} [triggerKeyCode] a key code that starts triggering clipboard copy
     * paste actions. It depends on platform. On Linux "Control" + <xxx> combination
     * should be used, but on Mac OSX "MetaLeft" + xxx.
     * To handle copy, paste and cut event override the following methods:
     *    - **copy**   "clipCopy(focusOwnerComponent, data)"
     *    - **paste**  "clipPaste(focusOwnerComponent, data)"
     *    - **cut**    "clipCut(focusOwnerComponent, data)"
     * @constructor
     * @class zebkit.web.Clipboard
     * @extends zebkit.ui.Clipboard
     */
    pkg.Clipboard = Class(zebkit.ui.Clipboard, [
        function(triggerKeyCode) {
            if (document.getElementById(this.clazz.id) !== null) {
                throw new Error("Duplicated clipboard element");
            }

            if (arguments.length > 0 && triggerKeyCode !== null) {
                this.triggerKeyCode = triggerKeyCode;
            } else {
                this.triggerKeyCode = zebkit.isMacOS ? "MetaLeft"
                                                     : "Control";
            }

            if (this.triggerKeyCode !== null) {
                this.$clipboard = document.createElement("textarea");
                this.$clipboard.setAttribute("style", "display:none;position:fixed;left:-99em;top:-99em;");
                this.$clipboard.setAttribute("id", this.clazz.id);

                this.$element   = null;

                var $this = this;

                window.addEventListener("keydown", function(e) {
                    var dest = $this.getDestination();
                    if (dest !== null) {
                        if (typeof dest.clipCopy !== 'undefined' || typeof dest.clipPaste !== 'undefined') {
                            if (zebkit.web.$fetchKeyCode(e) === $this.triggerKeyCode) {
                                // value has to be set, otherwise some browsers (Safari) do not generate
                                // "copy" event
                                $this.$on("1");
                            }
                        }
                    }
                }, true);

                this.$clipboard.onkeydown = function(ee) {
                    $this.$element.dispatchEvent($dupKeyEvent(ee, 'keydown', this.$element));
                    $this.$clipboard.value = "1";
                    $this.$clipboard.select();
                };

                this.$clipboard.onkeyup = function(ee) {
                    if (zebkit.web.$fetchKeyCode(ee) === $this.triggerKeyCode) {
                        $this.$clipboard.style.display = "none";
                        $this.$element.focus();
                    }

                    $this.$element.dispatchEvent($dupKeyEvent(ee,'keyup', $this.$element));
                };

                this.$clipboard.onfocus = function(e) {
                    if ($this.$element == null && e.relatedTarget != null) {
                        $this.$element = e.relatedTarget;
                    }
                };

                this.$clipboard.onblur = function() {
                    this.value = "";
                    this.style.display = "none";

                    //!!! pass focus back to canvas
                    //    it has to be done for the case when cmd+TAB (switch from browser to
                    //    another application)
                    $this.$element.focus();
                };

                this.$clipboard.oncopy = function(ee) {
                    var dest = $this.getDestination();
                    if (dest          !== null &&
                        typeof dest.clipCopy !== 'undefined')
                    {
                        var v = dest.clipCopy();
                        $this.$clipboard.value = (v === null || typeof v === 'undefined' ? "" : v);
                        $this.$clipboard.select();
                        if (typeof $this.clipCopy !== 'undefined') {
                            $this.clipCopy(v, $this.$clipboard.value);
                        }
                    }
                };

                this.$clipboard.oncut = function(ee) {
                    var dest = $this.getDestination();
                    if (dest !== null && typeof dest.cut !== 'undefined') {
                        $this.$clipboard.value = dest.cut();
                        $this.$clipboard.select();
                        if (typeof $this.clipCut !== 'undefined') {
                            $this.clipCut(dest, $this.$clipboard.value);
                        }
                    }
                };

                if (zebkit.isFF === true) {
                    this.$clipboard.addEventListener("input", function(ee) {
                        var dest = $this.getDestination();
                        if (dest !== null && typeof dest.clipPaste !== 'undefined') {
                            dest.clipPaste($this.$clipboard.value);
                            if (typeof $this.clipPaste !== 'undefined') {
                                $this.clipPaste(dest, $clipboard.value);
                            }
                        }

                    }, false);
                } else {
                    this.$clipboard.onpaste = function(ee) {
                        var dest = $this.getDestination();
                        if (dest !== null && typeof dest.clipPaste !== 'undefined') {
                            var txt = (typeof ee.clipboardData === "undefined") ? window.clipboardData.getData('Text')  // IE
                                                                                : ee.clipboardData.getData('text/plain');
                            dest.clipPaste(txt);
                            if (typeof $this.clipPaste !== 'undefined') {
                                $this.clipPaste(dest, txt);
                            }
                        }
                        $this.$clipboard.value = "";
                    };
                }

                document.body.appendChild(this.$clipboard);
            }
        },

        function $clazz() {
            this.id = "zebkitClipboardBuffer";
        },

        function $prototype() {
            /**
             * Clipboard trigger key code.
             * @private
             * @readOnly
             * @attribute triggerKeyCode
             * @type {String}
             */
            this.triggerKeyCode = null;

            /**
             * Write the given content into clipboard. This method not necessary work on
             * all browsers by default. Many browsers issue security restrictions regarding
             * clipboard data manipulation.
             * @param  {String} txt a content
             * @method  write
             */
            this.write = function(txt) {
                try {
                    this.$on(txt);
                    if (typeof document.execCommand !== 'undefined' && document.execCommand("copy") !== true) {
                        throw new Error("Unsupported 'copy' clipboard command");
                    }
                } finally {
                    this.$off();
                }
            };

            /**
             * Read clipboard content. This method not necessary work on
             * all browsers by default. Many browsers issue security restrictions regarding
             * clipboard data manipulation.
             * @return {String} a clipboard content.
             * @method  read
             */
            this.read = function() {
                try {
                    var clip = this.$on("");
                    if (typeof document.execCommand !== 'undefined' && document.execCommand("paste", null, null)) {
                        return clip.value;
                    } else {
                        throw new Error("Unsupported 'paste' clipboard command");
                    }
                } finally {
                    this.$off();
                }
            };

            /**
             * Return focus from a hidden element back to initial one.
             * @private
             * @method $off
             */
            this.$off = function() {
                if (this.$clipboard.style.display !== "none") {
                    this.$clipboard.value = "";
                    this.$clipboard.style.display = "none";

                    //!!! pass focus back to canvas
                    //    it has to be done for the case when cmd+TAB (switch from browser to
                    //    another application)
                    this.$element.focus();
                }
            };

            /**
             * Pass focus to hidden html element to catch input.
             * @private
             * @method $on
             */
            this.$on = function(txt) {
                this.$off();

                this.$element = document.activeElement;
                this.$clipboard.style.display = "block";

                // value has to be set, otherwise some browsers (Safari) do not generate
                // "copy" event
                this.$clipboard.value = arguments.length > 0 ? txt : "1";
                this.$clipboard.select();
                this.$clipboard.focus();
                return this.$clipboard;
            };
        }
    ]);

    new pkg.Clipboard();
});
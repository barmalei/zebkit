zebkit.package("ui", function(pkg, Class) {
 
    pkg.ClipboardSupport = Class([
        function $clazz() {
            this.Listeners = zebkit.util.ListenersClass("clipCopy", "clipPaste", "clipCut");
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
                    $this.$clipboardCanvas.element.dispatchEvent($dupKeyEvent(ee, 'keydown', $this.$clipboardCanvas.element));
                    $clipboard.value="1";
                    $clipboard.select();
                };

                $clipboard.onkeyup = function(ee) {
                    if (ee.keyCode === $this.clipboardTriggerKey) {
                        $clipboard.style.display = "none";
                        $this.$clipboardCanvas.element.focus();
                    }

                    $this.$clipboardCanvas.element.dispatchEvent($dupKeyEvent(ee, 'keyup', $this.$clipboardCanvas.element));
                };

                $clipboard.onblur = function() {
                    this.value="";
                    this.style.display="none";

                    //!!! pass focus back to canvas
                    //    it has to be done for the case when cmd+TAB (switch from browser to
                    //    another application)
                    $this.$clipboardCanvas.element.focus();
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

                if (zebkit.isFF === true) {
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



    /**
     * Input key event class.
     * @param {zebkit.ui.Panel} source a source of the key input event
     * @param {Integer} code a code of pressed key
     * @param {String} ch a character of typed key
     * @param {Integer} mask a bits mask of pressed meta keys:  zebkit.ui.KeyEvent.M_CTRL,
     * zebkit.ui.KeyEvent.M_SHIFT, zebkit.ui.KeyEvent.M_ALT, zebkit.ui.KeyEvent.M_CMD
     * @class  zebkit.ui.KeyEvent
     * @extends zebkit.util.Event
     * @constructor
     */
    pkg.KeyEvent = Class(zebkit.util.Event, [
        function $clazz() {
            this.M_CTRL  = 1;
            this.M_SHIFT = 2;
            this.M_ALT   = 4;
            this.M_CMD   = 8;
        },

        function $prototype() {
            /**
             * A code of a pressed key
             * @attribute code
             * @readOnly
             * @type {Integer}
             */
            this.code = 0;

            /**
             * A bits mask of pressed meta keys (CTRL, ALT, etc)
             * @attribute mask
             * @readOnly
             * @type {Integer}
             */
            this.mask = 0;

            /**
             * A character of a typed key
             * @attribute ch
             * @readOnly
             * @type {String}
             */
            this.ch = 0;

            this.type = "kb";

            this.altKey = this.shiftKey = this.ctrlKey = this.metaKey = false;


            this.$fillWithParams = function(source, code, ch, mask) {
                this.$setMask(mask);
                this.code   = code;
                this.ch     = ch;
                this.source = source;
                return this;
            };

            this.$setMask = function(m) {
                m = (m & pkg.KeyEvent.M_ALT & pkg.KeyEvent.M_SHIFT & pkg.KeyEvent.M_CTRL & pkg.KeyEvent.M_CMD);
                this.mask = m;
                this.altKey   = ((m & pkg.KeyEvent.M_ALT  ) > 0);
                this.shiftKey = ((m & pkg.KeyEvent.M_SHIFT) > 0);
                this.ctrlKey  = ((m & pkg.KeyEvent.M_CTRL ) > 0);
                this.metaKey  = ((m & pkg.KeyEvent.M_CMD  ) > 0);
                return this;
            };

            this.$fillWith = function(e) {
                this.code = (e.which || e.keyCode || 0);
                if (this.code === pkg.KeyEvent.ENTER) {
                    this.ch = "\n";
                }
                else {
                    // FF sets keyCode to zero for some diacritic characters
                    // to fix the problem we have to try get the code from "key" field
                    // of event that stores a character
                    if (this.code === 0 && e.key != null && e.key.length === 1) {
                        this.code = e.key.charCodeAt(0);
                        this.ch   = e.key;
                    }
                    else {
                        this.ch = e.charCode > 0 && this.code >= 32 ? String.fromCharCode(e.charCode) : 0;
                    }
                }

                this.altKey   = e.altKey;
                this.shiftKey = e.shiftKey;
                this.ctrlKey  = e.ctrlKey;
                this.metaKey  = e.metaKey;

                this.mask = 0;
                if (e.altKey)   this.mask += pkg.KeyEvent.M_ALT;
                if (e.shiftKey) this.mask += pkg.KeyEvent.M_SHIFT;
                if (e.ctrlKey)  this.mask += pkg.KeyEvent.M_CTRL;
                if (e.metaKey)  this.mask += pkg.KeyEvent.M_CMD;

                return this;
            };
        },
    ]);


    var $keyPressedCode = -1, KEY_EVENT = new pkg.KeyEvent();

    pkg.KeyEventUnifier = Class([
        function(element, destination) {

            //   Alt + x  was pressed  (for IE11 consider sequence of execution of "alt" and "x" keys)
            //   Chrome/Safari/FF  keydown -> keydown -> keypressed
            // ----------------------------------------------------------------------------------------------------------------------
            //          |     which   |    keyCode   | charCode |      code        |     key        |   keyIdentifier   |  char
            // ----------------------------------------------------------------------------------------------------------------------
            //          |             |              |          |                  |                |                   |
            //  Chrome  |    unicode/ |    unicode/  |   0      |  undefined       |  undefined     | Mnemonic + Unistr |   No
            //          |     code    |     code     |          |                  |                |  "Alt" + "U-0058" |
            //          |   18 + 88   |    18 + 88   |          |                  |                |                   |
            //----------+-----------------------------------------------------------------------------------------------|------------
            //          |             |              |          |                  |                |                   |
            //  IE11    |  unicode/   |  unicode/    |          |                  |                |                   |  Alt => ""
            //          |   code      |    code      |    0     |   undefined      |   "Alt","x"    |   undefined       |  x => "x"
            //          |    18, 88   |   18, 88     |          |                  |                |                   |
            //          |             |              |          |                  |                |                   |
            //----------+-------------|--------------|----------|------------------|----------------|-------------------|------------
            //          |   unicode/  |   unicode/   |          |                  |                |                   |
            //          |   code      |     code     |    0     |  undefined       | undefined      | Mnemonic + Unistr |   No
            //  Safari  |   18 + 88   |   18 + 88    |          |                  |                |  "Alt" + "U-0058" |
            //          |             |              |          |                  |                |                   |
            //----------+-----------------------------------------------------------------------------------------------|------------
            //          |             |              |          |                  |                |                   |
            //  FF      |   unicode/  |   unicode/   |    0     |  Mnemonic        | Mnemonic/char  |                   |  No
            //          |    code     |     code     |          |("AltLeft"+"KeyX")|  "Alt"+"≈"     |   undefined       |
            //          |  18 + 88    |  18 + 88     |          |                  |                |                   |
            //
            element.onkeydown = function(e) {
                KEY_EVENT.$fillWith(e);
                var code = $keyPressedCode = KEY_EVENT.code;
                //!!!!
                // TODO: hard coded constants
                // Since container of zCanvas catch all events from its children DOM
                // elements don't prevent the event for the children DOM element
                if (destination.$keyPressed(KEY_EVENT) === true ||
                    (code != 13 &&
                     code < 47  &&
                     code != 32 &&
                    e.target === element))
                {
                    e.preventDefault();
                }

                e.stopPropagation();
            };

            element.onkeyup = function(e) {
                $keyPressedCode = -1;
                if (destination.$keyReleased(KEY_EVENT.$fillWith(e)) === true) {
                    e.preventDefault();
                }
                e.stopPropagation();
            };

            //   Alt + x  was pressed  (for IE11 consider sequence of execution of "alt" and "x" keys)
            // ----------------------------------------------------------------------------------------------------------------------
            //          |     which   |    keyCode   | charCode |      code        |     key        |   keyIdentifier   |  char
            // ----------------------------------------------------------------------------------------------------------------------
            //          |             |              |          |                  |                |                   |
            //  Chrome  |    unicode/ |    unicode/  |   8776   |  undefined       |  undefined     | Mnemonic + Unistr |   No
            //          |     code    |     code     |   (≈)    |                  |                |     "U-0058"      |
            //          |   8776 (≈)  |    8776 (≈)  |          |                  |                |                   |
            //----------+-----------------------------------------------------------------------------------------------|------------
            //          |             |              |          |                  |                |                   |
            //  IE11    |  unicode/   |  unicode/    |          |                  |                |                   |
            //          |   code      |    code      |  88 (x)  |   undefined      |     "x"        |   undefined       |   "x"
            //          |    88 (x)   |   88 (x)     |          |                  |                |                   |
            //          |             |              |          |                  |                |                   |
            //----------+-------------|--------------|----------|------------------|----------------|-------------------|------------
            //          |   unicode/  |   unicode/   |          |                  |                |                   |
            //          |   code      |     code     | 8776 (≈) |  undefined       | undefined      |                   |   No
            //  Safari  |   8776 (≈)  |   8776 (≈)   |          |                  |                |        ""         |
            //          |             |              |          |                  |                |                   |
            //----------+-----------------------------------------------------------------------------------------------|------------
            //          |             |              |          |                  |                |                   |
            //  FF      |   unicode/  |    0         |   8776   |  Mnemonic        | Mnemonic/char  |                   |   No
            //          |    code     |              |   (≈)    |  ("KeyX")        |      "≈"       |   undefined       |
            //          |  8776 (≈)   |              |          |                  |                |                   |
            //
            element.onkeypress = function(e) {
                KEY_EVENT.$fillWith(e);

                var code = KEY_EVENT.code;
                if (KEY_EVENT.ch === 0) {
                    // wrap with try catch to restore variable
                    try {
                        if ($keyPressedCode != code) {
                            if (destination.$keyPressed(KEY_EVENT) === true) {
                                e.preventDefault();
                            }
                        }
                    }
                    catch(ee) {
                        $keyPressedCode = -1;
                        throw ee;
                    }
                    $keyPressedCode = -1;
                }
                else {
                    // Since container of zCanvas catch all events from its children DOM
                    // elements don't prevent the event for the children DOM element
                    if (destination.$keyTyped(KEY_EVENT) === true || (e.target === element && code < 47 && code != 32)) {
                        e.preventDefault();
                    }
                }

                e.stopPropagation();
            };
        }
    ]);

});

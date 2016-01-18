(function(pkg, Class) {
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

            // TODO: experemental property
            this.eatMe = false;

            this.$fillWithParams = function(source, code, ch, mask) {
                this.$setMask(mask);
                this.code   = code;
                this.ch     = ch;
                this.source = source;
                return this;
            };

            this.$setMask = function(m) {
                m = (m & pkg.KeyEvent.M_ALT & pkg.KeyEvent.M_SHIFT & pkg.KeyEvent.M_CTRL & pkg.KeyEvent.M_CMD)
                this.mask = m;
                this.altKey   = ((m & pkg.KeyEvent.M_ALT  ) > 0);
                this.shiftKey = ((m & pkg.KeyEvent.M_SHIFT) > 0);
                this.ctrlKey  = ((m & pkg.KeyEvent.M_CTRL ) > 0);
                this.metaKey  = ((m & pkg.KeyEvent.M_CMD  ) > 0);
                return this;
            };

            this.$fillWith = function(e) {
                this.eatMe = false;

                this.code = (e.which || e.keyCode || 0);
                if (this.code === pkg.KeyEvent.ENTER) {
                    this.ch = "\n";
                }
                else {
                    // FF sets keyCode to zero for some diacritic characters
                    // to fix the problem we have to try get the code from "key" field
                    // of event that stores a character
                    if (this.code === 0 && e.key != null && e.key.length() === 1) {
                        this.code = e.key.charCodeAt(0);
                        this.ch   = e.key;
                    }
                    else {
                        this.ch = e.charCode > 0 && (this.code >= 47 || this.code === 32) ? String.fromCharCode(e.charCode) : 0;
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

})(zebkit("ui"), zebkit.Class);
zebkit.package("web", function(pkg, Class) {
    // Key CODES meta
    // pr  - preventDefault, false if not defined
    // rp  - repeatable key, true if not defined
    // map  - map code to another code
    // ignore  - don't fire the given event, false by default

    //!!!
    // keyCode   - unique integer code of a key
    // code      - unique string representation of a key
    // key       - char that has been pressed
    //!!!


    //  { "string:code" => { keyCode : "int",  key: "string" (a character entered), "rp": "boolean" }  }
    var CODES = {
            "KeyA"  : { keyCode: 65 },
            "KeyB"  : { keyCode: 66 },
            "KeyC"  : { keyCode: 67 },
            "KeyD"  : { keyCode: 68 },
            "KeyE"  : { keyCode: 69 },
            "KeyF"  : { keyCode: 70 },
            "KeyG"  : { keyCode: 71 },
            "KeyH"  : { keyCode: 72 },
            "KeyI"  : { keyCode: 73 },
            "KeyJ"  : { keyCode: 74 },
            "KeyK"  : { keyCode: 75 },
            "KeyL"  : { keyCode: 76 },
            "KeyM"  : { keyCode: 77 },
            "KeyN"  : { keyCode: 78 },
            "KeyO"  : { keyCode: 79 },
            "KeyP"  : { keyCode: 80 },
            "KeyQ"  : { keyCode: 81 },
            "KeyR"  : { keyCode: 82 },
            "KeyS"  : { keyCode: 83 },
            "KeyT"  : { keyCode: 84 },
            "KeyU"  : { keyCode: 85 },
            "KeyV"  : { keyCode: 86 },
            "KeyW"  : { keyCode: 87 },
            "KeyX"  : { keyCode: 88 },
            "KeyY"  : { keyCode: 89 },
            "KeyZ"  : { keyCode: 90 },
            "Digit0": { keyCode: 48 },
            "Digit1": { keyCode: 49 },
            "Digit2": { keyCode: 50 },
            "Digit3": { keyCode: 51 },
            "Digit4": { keyCode: 52 },
            "Digit5": { keyCode: 53 },
            "Digit6": { keyCode: 54 },
            "Digit7": { keyCode: 55 },
            "Digit8": { keyCode: 56 },
            "Digit9": { keyCode: 57 },

            "F1":  { keyCode: 112, key: "F1",   rp: false  },
            "F2":  { keyCode: 113, key: "F2",   rp: false  },
            "F3":  { keyCode: 114, key: "F3",   rp: false  },
            "F4":  { keyCode: 115, key: "F4",   rp: false  },
            "F5":  { keyCode: 116, key: "F5",   rp: false  },
            "F6":  { keyCode: 117, key: "F6",   rp: false  },
            "F7":  { keyCode: 118, key: "F7",   rp: false  },
            "F8":  { keyCode: 119, key: "F8",   rp: false  },
            "F9":  { keyCode: 120, key: "F9",   rp: false  },
            "F10": { keyCode: 121, key: "F10",  rp: false  },
            "F11": { keyCode: 122, key: "F11",  rp: false  },
            "F12": { keyCode: 123, key: "F12",  rp: false  },
            "F13": { keyCode: 124, key: "F13",  rp: false  },
            "F14": { keyCode: 125, key: "F14",  rp: false  },
            "F15": { keyCode: 126, key: "F15",  rp: false  },

            "Numpad0"       : { keyCode: 96  },
            "Numpad1"       : { keyCode: 97  },
            "Numpad2"       : { keyCode: 98  },
            "Numpad3"       : { keyCode: 99  },
            "Numpad4"       : { keyCode: 100 },
            "Numpad5"       : { keyCode: 101 },
            "Numpad6"       : { keyCode: 102 },
            "Numpad7"       : { keyCode: 103 },
            "Numpad8"       : { keyCode: 104 },
            "Numpad9"       : { keyCode: 105 },
            "NumpadDecimal" : { keyCode: 110, key: "Decimal"  },
            "NumpadSubtract": { keyCode: 109, key: "Subtract" },
            "NumpadDivide"  : { keyCode: 111, key: "Divide"   },
            "NumpadMultiply": { keyCode: 106, key: "Multiply" },
            "NumpadAdd"     : { keyCode: 107, key: "Add"      },
            "NumLock"       : { keyCode: (zebkit.isFF ? 144 : 12) , key: "NumLock", rp: false, ignore : true },

            "Comma"        : { keyCode: 188 },
            "Period"       : { keyCode: 190 },
            "Semicolon"    : { keyCode: (zebkit.isFF ? 59  : 186) },
            "Quote"        : { keyCode: 222 },
            "BracketLeft"  : { keyCode: 219 },
            "BracketRight" : { keyCode: 221 },
            "Backquote"    : { keyCode: 192 },
            "Backslash"    : { keyCode: 220 },
            "Minus"        : { keyCode: (zebkit.isFF ? 173 : 189) },
            "Equal"        : { keyCode: (zebkit.isFF ? 61  : 187) },

            "NumpadEnter"  : { map: "Enter" },
            "Enter"        : { keyCode: 13, key: "\n" },

            "Slash"        : { keyCode: 191 },
            "Space"        : { keyCode: 32, pr: true, key: " " },
            "Delete"       : { keyCode: 46, key: "Delete" },

            "IntlRo"     : { keyCode: (zebkit.isFF ? 167 : 193), key: "IntlRo"},

            "Backspace"  :  { keyCode: 8, pr: true, key: "Backspace" },
            "Tab":          { keyCode: 9, pr: true, key: "\t" },
            "ContextMenu":  { keyCode: zebkit.isFF ? 93 : 0, pr: true, key: "ContextMenu" },

            "ArrowLeft"   : { keyCode: 37, pr: true,  key: "ArrowLeft"   },
            "ArrowRight"  : { keyCode: 39, pr: true,  key: "ArrowRight"  },
            "ArrowUp"     : { keyCode: 38, pr: true,  key: "ArrowUp"     },
            "ArrowDown"   : { keyCode: 40, pr: true,  key: "ArrowDown"   },
            "PageUp"      : { keyCode: 33, pr: true,  key: "PaheUp"      },
            "PageDown"    : { keyCode: 34, pr: true,  key: "PageDown"    },
            "Home"        : { keyCode: 36, pr: true,  key: "Home"        },
            "End"         : { keyCode: 35, pr: true,  key: "End"         },

            "Escape"      : { keyCode: 27,  pr: true,  key: "Escape",   rp: false },
            "CapsLock"    : { keyCode: 20,             key: "CapsLock", rp: false, ignore : true },

            "Shift"       : { keyCode: 16,  pr: true, key: "Shift", rp: false,},
            "ShiftLeft"   : { map: "Shift" },
            "ShiftRight"  : { map: "Shift" },

            "Alt"         : { keyCode: 18,  pr: true,  key: "Alt",  rp: false, },
            "AltLeft"     : { map: "Alt" },
            "AltRight"    : { map: "Alt" },

            "Control"     : { keyCode: 17,  pr: true,  key: "Control",  rp: false },
            "ControlRight": { map: "Control" },
            "ControlLeft" : { map: "Control" },

            "MetaLeft"    : { keyCode: 91,  pr: true,  key: "Meta", rp: false },
            "MetaRight"   : { keyCode: 93,  pr: true,  key: "Meta", rp: false },
            "OSLeft"      : { keyCode: 224,  map: "MetaLeft" },
            "OSRight"     : { keyCode: 224,  map: "MetaRight"  }
        },

        CODES_MAP = {};

    // codes to that are not the same for different browsers
    function $initializeCodesMap() {
        var k    = null,
            code = null;

        // validate codes mapping
        for(k in CODES) {
            code = CODES[k];
            if (code.map !== undefined)  {
                if (CODES[code.map] === undefined) {
                    throw new Error("Invalid mapping for code = '" + k + "'");
                }
            } else if (code.keyCode === undefined) {
                throw new Error("Unknown keyCode for code = '" + k + "'");
            }
        }

        // build codes map table for the cases when "code" property
        CODES_MAP = {};
        for(k in CODES) {
            code = CODES[k];
            if (code.map !== undefined) {
                if (code.keyCode !== undefined) {
                    CODES_MAP[code.keyCode] = code.map;
                }
            } else {
                CODES_MAP[code.keyCode] = k;
            }
        }
    }

    pkg.$fetchKeyCode = function(e) {
        var code = e.code;
        if (code !== undefined) {
            if (CODES.hasOwnProperty(code) && CODES[code].hasOwnProperty("map")) {
                code = CODES[code].map;
            }
        } else {
            code = CODES_MAP[(e.which || e.keyCode || 0)];
            if (code === undefined) {
                code = null;
            }
        }
        return code;
    };

    $initializeCodesMap();

    /**
     * Input key event class.
     * @class  zebkit.web.KeyEvent
     * @extends zebkit.ui.event.KeyEvent
     * @constructor
     */
    pkg.KeyEvent = Class(zebkit.ui.event.KeyEvent, [
        function $prototype() {
            /**
             * Fulfills the given abstract event with fields from the specified native WEB key event
             * @param  {KeyboardEvent} e a native WEB event
             * @method $fillWith
             * @chainable
             * @protected
             */
            this.$fillWith = function(e) {
                // code defines integer that in a case of
                // key pressed/released is zero or equals to physical key layout integer identifier
                // but for keyTyped should depict Unicode character code
                var keyCode = (e.which || e.keyCode || 0);

                this.code = pkg.$fetchKeyCode(e);

                // try to fetch and normalize "key" field
                if (this.code === "Enter" || this.code === "Space" || this.code === "Tab") {
                    this.key = CODES[this.code].key;
                } else if (e.key != null) {
                    this.key = e.key;
                } else if (e.type === "keypress") {
                    this.key = e.charCode > 0 && keyCode >= 32 ? String.fromCharCode(e.charCode)
                                                               : null;
                } else {
                    if (e.keyIdentifier != null) {
                        if (e.keyIdentifier[0] === 'U' &&  e.keyIdentifier[1] === '+') {
                            this.key = String.fromCharCode(parseInt(e.keyIdentifier.substring(2), 16));
                        } else {
                            this.key = e.keyIdentifier;
                        }
                    } else {
                        if (this.code != null && CODES.hasOwnProperty(this.code) === true && CODES[this.code].key != null) {
                            this.key = CODES[this.code].key;
                        } else {
                            this.key = e.charCode > 0 && keyCode >= 32 ? String.fromCharCode(e.charCode)
                                                                       : null;
                        }
                    }
                }

                this.altKey   = e.altKey;
                this.shiftKey = e.shiftKey;
                this.ctrlKey  = e.ctrlKey;
                this.metaKey  = e.metaKey;
                return this;
            };
        }
    ]);


    var KEY_DOWN_EVENT  = new pkg.KeyEvent(),
        KEY_UP_EVENT    = new pkg.KeyEvent(),
        KEY_PRESS_EVENT = new pkg.KeyEvent(),
        wasMetaLeftPressed  = false,
        wasMetaRightPressed = false;

    /**
     * Class that is responsible for translating native DOM element key event into abstract event that further
     * can be transfered to zebkit UI engine (or any other destination). Browsers key events support can be
     * implemented with slight differences from the standards. The goal of the class is key events unification.
     * The class fires three types of key events to passed event destination code:
     *    - $keyPressed(e)
     *    - $keyReleased(e)
     *    - $keyTyped(e)
     *
     * For instance imagine we have a DOM Element and want to have identical sequence and parameters of key
     * events the DOM element triggers. It can be done as follow:
     *
     *      new KeyEventUnifier(domElement, {
     *          "$keyPressed" : function(e) {
     *              ...
     *          },
     *
     *          "$keyReleased" : function(e) {
     *              ...
     *          },
     *
     *          "$keyTyped" : function(e) {
     *              ...
     *          }
     *      });
     *
     * @param  {HTMLElement} element
     * @param  {Object} destination a destination listener that can listen
     * @constructor
     * @class  zebkit.web.KeyEventUninfier
     */
    pkg.KeyEventUnifier = Class([
        function(element, destination) {
            var $this = this;

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
                var code = KEY_DOWN_EVENT.code,
                    pts  = KEY_DOWN_EVENT.timeStamp,
                    ts   = new Date().getTime();

                // fix loosing meta left keyup event in some browsers
                var fc = pkg.$fetchKeyCode(e);

                // ignore some keys that cannot be handled properly
                if (CODES[fc] != null && CODES[fc].ignore === true) {
                    return;
                }

                if (wasMetaLeftPressed === true && (e.metaKey !== true ||  fc === "MetaLeft")) {
                    wasMetaLeftPressed = false;
                    try {
                        KEY_DOWN_EVENT.code      = "MetaLeft";
                        KEY_DOWN_EVENT.repeat    = 0;
                        KEY_DOWN_EVENT.metaKey   = true;
                        KEY_DOWN_EVENT.timeStamp = ts;
                        destination.$keyReleased(KEY_DOWN_EVENT);
                    } catch(ex) {
                        zebkit.dumpError(ex);
                    } finally {
                        KEY_DOWN_EVENT.code = null;
                        code = null;
                    }
                }

                // fix loosing meta right keyup event in some browsers
                if (wasMetaRightPressed === true && (e.metaKey !== true || fc === "MetaRight")) {
                    wasMetaRightPressed = false;
                    try {
                        KEY_DOWN_EVENT.code      = "MetaRight";
                        KEY_DOWN_EVENT.repeat    = 0;
                        KEY_DOWN_EVENT.metaKey   = true;
                        KEY_DOWN_EVENT.timeStamp = ts;
                        destination.$keyReleased(KEY_DOWN_EVENT);
                    } catch(ex) {
                        zebkit.dumpError(ex);
                    } finally {
                        KEY_DOWN_EVENT.code = null;
                        code = null;
                    }
                }

                // we suppose key down object is shared with key up that means it
                // holds state of key (we can understand whether a key has been
                // still held or was released by checking if the code equals)
                KEY_DOWN_EVENT.$fillWith(e);
                KEY_DOWN_EVENT.timeStamp = ts;

                // calculate repeat counter
                if (KEY_DOWN_EVENT.code === code && e.metaKey !== true && (ts - pts) < 1000) {
                    KEY_DOWN_EVENT.repeat++;
                } else {
                    KEY_DOWN_EVENT.repeat = 1;
                }

                //!!!!
                // Suppress some standard browser actions.
                // Since container of zCanvas catch all events from its children DOM
                // elements don't prevent the event for the children DOM element
                var key = CODES[KEY_DOWN_EVENT.code];
                if (key != null && key.pr === true && e.target === element) {
                    // TODO: may be put the "if" logic into prevent default
                    $this.preventDefault(e, key);
                }

                e.stopPropagation();

                // fire key pressed event
                try {
                    destination.$keyPressed(KEY_DOWN_EVENT);
                } catch(ex) {
                    zebkit.dumpError(ex);
                }

                if (KEY_DOWN_EVENT.code === "MetaLeft") {
                    wasMetaLeftPressed = true;
                } else if (KEY_DOWN_EVENT.code === "MetaRight") {
                    wasMetaRightPressed = true;
                } else {
                    // if meta key is kept than generate key released event for
                    // all none-Meta keys. it is required since Meta + <a key>
                    // will never fire key released for <a key> (except state keys
                    // like shift, control etc)
                    if (e.metaKey === true) {
                        // only repeat
                        if (key == null || key.rp !== false) {
                            try {
                                KEY_UP_EVENT.$fillWith(e);
                                KEY_UP_EVENT.repeat = 0;
                                KEY_UP_EVENT.timeStamp = ts;
                                destination.$keyReleased(KEY_UP_EVENT);
                            } catch(ex) {
                                zebkit.dumpError(ex);
                            }
                        }
                    } else if (KEY_DOWN_EVENT.code === "Space" ||
                               KEY_DOWN_EVENT.code === "Enter" ||
                               KEY_DOWN_EVENT.code === "Tab"     )
                    {
                        // since space and enter key press event triggers preventDefault
                        // standard key press can never happen so let's emulate it here
                        KEY_PRESS_EVENT.$fillWith(e);
                        KEY_PRESS_EVENT.repeat = KEY_DOWN_EVENT.repeat;
                        KEY_PRESS_EVENT.timeStamp = ts;
                        destination.$keyTyped(KEY_PRESS_EVENT);
                    }
                }
            };

            element.onkeyup = function(e) {
                e.stopPropagation();

                KEY_UP_EVENT.$fillWith(e);

                // ignore some keys that cannot be handled properly
                if (CODES[KEY_UP_EVENT.code] != null && CODES[KEY_UP_EVENT.code].ignore === true) {
                    return;
                }

                if (wasMetaLeftPressed === true && KEY_UP_EVENT.code === "MetaLeft") {
                    wasMetaLeftPressed = false;
                }

                if (wasMetaRightPressed === true && KEY_UP_EVENT.code === "MetaRight") {
                    wasMetaRightPressed = false;
                }

                var key = CODES[KEY_UP_EVENT.code];
                if (e.metaKey !== true || (key != null && key.rp === false)) {
                    KEY_UP_EVENT.repeat    = 0;
                    KEY_UP_EVENT.timeStamp = new Date().getTime();
                    try {
                        destination.$keyReleased(KEY_UP_EVENT);
                    } finally {
                        // clean repeat counter
                        if (KEY_DOWN_EVENT.code === KEY_UP_EVENT.code) {
                            KEY_DOWN_EVENT.repeat = 0;
                        }
                    }
                }
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
                e.stopPropagation();

                // pressed meta key should bring to ignorance keypress event since the event
                // is emulated in keydown event handler.
                if (e.metaKey !== true) {
                    KEY_PRESS_EVENT.$fillWith(e);

                    KEY_PRESS_EVENT.code   = KEY_DOWN_EVENT.code;      // copy code of keydown key since key press can contain undefined code
                    KEY_PRESS_EVENT.repeat = KEY_DOWN_EVENT.repeat;

                    if (KEY_PRESS_EVENT.code !== "Space" &&
                        KEY_PRESS_EVENT.code !== "Enter" &&
                        KEY_PRESS_EVENT.code !== "Tab"   &&
                        KEY_PRESS_EVENT.code !== "ContextMenu")
                    {
                        // Since container of zCanvas catch all events from its children DOM
                        // elements don't prevent the event for the children DOM element
                        KEY_PRESS_EVENT.timeStamp = new Date().getTime();
                        destination.$keyTyped(KEY_PRESS_EVENT);
                    }
                }
            };
        },

        function $prototype() {
            this.preventDefault = function(e, key) {
                e.preventDefault();
            };
        }
    ]);
});
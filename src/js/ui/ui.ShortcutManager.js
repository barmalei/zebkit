zebkit.package("ui", function(pkg, Class) {
    // add shortcut event type
    pkg.events.regEvents("shortcutFired");

    /**
     * Shortcut event class
     * @constructor
     * @param  {zebkit.ui.Panel} src a source of the event
     * @param  {String} shortcut a shortcut name
     * @param  {String} keys a keys combination ("Control + KeyV")
     * @class zebkit.ui.ShortcutEvent
     * @extends {zebkit.util.Event}
     */
    pkg.ShortcutEvent = Class(zebkit.util.Event, [
        function(src, shortcut, keys) {
            this.source = src;

            /**
             * Shortcut name
             * @attribute shortcut
             * @readOnly
             * @type {String}
             */
            this.shortcut = shortcut;

            /**
             * Shortcut keys combination
             * @attribute keys
             * @readOnly
             * @type {String}
             */
            this.keys = keys;
        }
    ]);

    var SHORTCUT_EVENT = new pkg.ShortcutEvent();

    /**
     *  Shortcut manager supports short cut (keys) definition and listening. The shortcuts have to be defined in
     *  zebkit JSON configuration files. There are two sections:

        - **osx** to keep shortcuts for Mac OS X platform
        - **common** to keep shortcuts for all other platforms

     *  The JSON configuration entity has simple structure:


          {
            "common": {
                "UNDO": "Control + KeyZ",
                "REDO": "Control + Shift + KeyZ",
                 ...
            },
            "osx" : {
                "UNDO":  "MetaLeft + KeyZ",
                 ...
            }
          }

     *  The configuration contains list of shortcuts. Every shortcut is bound to a key combination that triggers it.
     *  Shortcut has a name and an optional list of arguments that have to be passed to a shortcut listener method.
     *  The optional arguments can be used to differentiate two shortcuts that are bound to the same command.
     *
     *  On the component level shortcut can be listened by implementing "shortcutFired(e)" listener handler.
     *  Pay attention to catch shortcut your component has to be focusable - be able to hold focus.
     *  For instance, to catch "UNDO" shortcut do the following:

            var pan = new zebkit.ui.Panel([
                function shortcutFired(e) {
                    // handle shortcut here
                    if (e.shortcut === "UNDO") {

                    }
                },

                // visualize the component gets focus
                function focused() {
                    this.$super();
                    this.setBackground(this.hasFocus()?"red":null);
                }
            ]);

            // let our panel to hold focus by setting appropriate property
            pan.canHaveFocus = true;


     *  @constructor
     *  @class zebkit.ui.ShortcutManager
     *  @extends {zebkit.ui.Manager}
     */
    pkg.ShortcutManager = Class(pkg.Manager, [
        function $prototype() {
            this.keyPath = [];

            /**
             * Key pressed event handler.
             * @param  {zebkit.ui.KeyEvent} e a key event
             * @method keyPressed
             */
            this.keyPressed = function(e) {
                if (e.code === null || this.keyPath.length > 5) {
                    this.keyPath = [];
                } else if (e.repeat === 1) {
                    this.keyPath[this.keyPath.length] = e.code;
                }

                var fo = pkg.focusManager.focusOwner;
                if (this.keyPath.length > 1) {
                    var sh = this.keyShortcuts;
                    for(var i = 0; i < this.keyPath.length; i++) {
                        var code = this.keyPath[i];
                        if (sh.hasOwnProperty(code)) {
                            sh = sh[code];
                        } else {
                            sh = null;
                            break;
                        }
                    }

                    if (sh !== null) {
                        SHORTCUT_EVENT.source   = fo;
                        SHORTCUT_EVENT.shortcut = sh;
                        SHORTCUT_EVENT.keys     = this.keyPath.join('+');
                        pkg.events.fire("shortcutFired", SHORTCUT_EVENT);
                    }
                }
            };

            this.keyReleased = function(e) {
                if (e.key === "Meta") {
                    this.keyPath = [];
                } else {
                    for(var i = 0; i < this.keyPath.length; i++) {
                        if (this.keyPath[i] === e.code) {
                            this.keyPath.splice(i, 1);
                            break;
                        }
                    }
                }
            };

            /**
             * Set shortcuts. Expected shortcuts format is:
             *
             *      { "<ID>"  : "Control + KeyZ", ... }
             *
             * or
             *
             *       { "<ID>"  :  ["Control + KeyZ", "Control + KeyV" ], ... }
             *
             * @param {shortcuts} shortcuts
             * @method setShortcuts
             */
            this.setShortcuts = function(shortcuts) {
                for (var id in shortcuts) {
                    var shortcut = shortcuts[id];
                    id = id.trim();

                    if (Array.isArray(shortcut) === false) {
                        shortcut = [ shortcut ];
                    }

                    for(var j = 0; j < shortcut.length; j++) {
                        var keys  = shortcut[j].replace(/\s+/g, '').split('+'),
                            st    = this.keyShortcuts,
                            len   = keys.length;

                        for(var i = 0; i < len; i++) {
                            var key = keys[i];
                            if (i === (len - 1)) {
                                st[key] = id;
                            } else if (st.hasOwnProperty(key) === false || zebkit.isString(st[key])) {
                                st[key] = {};
                            }

                            st = st[key];
                        }
                    }
                }
            };
        },

        function(shortcuts) {
            this.$super();

            // special structure that is a path from the first key of a sjortcut to the ID
            // for instance SELECTALL : [ "Control + KeyA", "Control + KeyW"], ... } will
            // be stored as:
            //  {
            //     "Control" : {
            //         "KeyA" : SELECTALL,
            //         "KeyW" : SELECTALL
            //     }
            //  }

            this.keyShortcuts = {};

            if (arguments.length > 0) {
                this.setShortcuts(shortcuts.common);
                if (zebkit.isMacOS === true && typeof shortcuts.osx !== 'undefined') {
                    this.setShortcuts(shortcuts.osx);
                }
            }
        }
    ]);
});
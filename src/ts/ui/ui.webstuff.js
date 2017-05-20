zebkit.package("ui", function(pkg, Class) {


    function decodeSize(s, defaultHeight) {
        if (zebkit.isString(s)) {
            var size = Number(s);
            if (isNaN(size)) {
                var m = s.match(/^([0-9]+)(%)$/);
                if (m != null && m[1] != null && m[2] != null) {
                    size = Math.floor((defaultHeight * parseInt(m[1], 10)) / 100);
                    return size + "px";
                }
                return /^([0-9]+)(em|px)$/.test(s) === true ? s : null;
            } else {
                if (s[0] === '+') {
                    size = defaultHeight + size;
                } else if (s[0] === '-') {
                    size = defaultHeight - size;
                }
                return size + "px";
            }
        }
        return s == null ? null : s + "px";
    }


    /**
     * This class represents a font and provides basic font metrics like
     * height, ascent. Using the class developers can compute string width.

          // plain font
          var f = new zebkit.ui.Font("Arial", 14);

          // bold font
          var f = new zebkit.ui.Font("Arial", "bold", 14);

          // defining font with CSS font name
          var f = new zebkit.ui.Font("100px Futura, Helvetica, sans-serif");

     * @constructor
     * @param {String} name a name of the font. If size and style parameters
     * has not been passed the name is considered as CSS font name that
     * includes size and style
     * @param {String} [style] a style of the font: "bold", "italic", etc
     * @param {Integer} [size] a size of the font
     * @class zebkit.ui.Font
     */
    pkg.Font = function(family, style, size) {
        this.family = pkg.Font.family,
        this.style  = pkg.Font.style;

        if (arguments.length === 1) {
            this.size = decodeSize(family, pkg.Font.height);
            if (this.size === null) {
                // trim
                family = family.trim();

                // check if a predefined style has been used
                if (family === "bold" || family === "italic") {
                    this.style = family;
                } else {  // otherwise handle it as CSS-like font style
                    // try to parse font if possible
                    var re = /([a-zA-Z_\- ]+)?(([0-9]+px|[0-9]+em)\s+([,\"'a-zA-Z_ \-]+))?/,
                        m  = family.match(re);

                    if (m[4] != null) {
                        this.family = m[4].trim();
                    }

                    if (m[3] != null) {
                        this.size = m[3].trim();
                    }

                    if (m[1] != null) {
                        this.style = m[1].trim();
                    }

                    this.s = family;
                }
            }
        } else if (arguments.length === 2) {
            this.family = family;
            this.size   = decodeSize(style, pkg.Font.height);
            this.style  = this.size == null ? style : null;

        } else if (arguments.length === 3) {
            this.family = family;
            this.style  = style;
            this.size   = decodeSize(size, pkg.Font.height);
        }

        if (this.size == null) {
            this.size = pkg.Font.height + "px";
        }

        if (this.s == null) {
            this.s = ((this.style != null) ? this.style + " ": "") +
                     this.size + " " +
                     this.family;
        }

        var $fmText = pkg.Font.$fmText;
        if ($fmText.style.font !== this.s) {
            $fmText.style.font = this.s;
        }

        /**
         * Height of the font
         * @attribute height
         * @readOnly
         * @type {Integer}
         */
        this.height = $fmText.offsetHeight;

        //!!!
        // Something weird is going sometimes in IE10 !
        // Sometimes the property offsetHeight is 0 but
        // second attempt to access to the property gives
        // proper result
        if (this.height === 0) {
            this.height = $fmText.offsetHeight;
        }

        /**
         * Ascent of the font
         * @attribute ascent
         * @readOnly
         * @type {Integer}
         */
        this.ascent = pkg.Font.$fmImage.offsetTop - $fmText.offsetTop + 1;
    };

    /**
     * Calculate the given string width in pixels
     * @param  {String} s a string whose width has to be computed
     * @return {Integer} a string size in pixels
     * @method stringWidth
     * @for zebkit.ui.Font
     */
    pkg.Font.prototype.stringWidth = function(s) {
        if (s.length === 0) return 0;

        if (pkg.Font.$fmCanvas.font !== this.s) {
            pkg.Font.$fmCanvas.font = this.s;
        }

        return (pkg.Font.$fmCanvas.measureText(s).width + 0.5) | 0;
    };

    /**
     * Calculate the specified substring width
     * @param  {String} s a string
     * @param  {Integer} off fist character index
     * @param  {Integer} len length of substring
     * @return {Integer} a substring size in pixels
     * @method charsWidth
     * @for zebkit.ui.Font
     */
    pkg.Font.prototype.charsWidth = function(s, off, len) {
        if (pkg.Font.$fmCanvas.font !== this.s) {
            pkg.Font.$fmCanvas.font = this.s;
        }

        return ( pkg.Font.$fmCanvas.measureText(len === 1 ? s[off]
                                                          : s.substring(off, off + len)).width + 0.5) | 0;
    };

    /**
     * Returns CSS font representation
     * @return {String} a CSS representation of the given Font
     * @method toString
     * @for zebkit.ui.Font
     */
    pkg.Font.prototype.toString = function() {
        return this.s;
    };

    pkg.Font.prototype.resize = function(size) {
        var nsize = decodeSize(size, this.height);
        if (nsize == null) {
            throw new Error("Invalid size : " + size);
        }
        return new pkg.Font(this.family, this.style, nsize);
    };

    pkg.Font.prototype.restyle = function(style) {
        return new pkg.Font(this.family, style, this.height + "px");
    };

    // default values
    pkg.Font.family = "Arial, Helvetica";
    pkg.Font.style  =  null;
    pkg.Font.height =  14;


    // initialize font specific structures
    zebkit.busy();
    pkg.Font.$fmCanvas = document.createElement("canvas").getContext("2d");

    var e = document.getElementById("zebkit.fm");
    if (e == null) {
        e = document.createElement("div");
        e.setAttribute("id", "zebkit.fm");  // !!! position fixed below allows to avoid 1px size in HTML layout for "zebkit.fm" element
        e.setAttribute("style", "visibility:hidden;line-height:0;height:1px;vertical-align:baseline;position:fixed;");
        e.innerHTML = "<span id='zebkit.fm.text' style='display:inline;vertical-align:baseline;'>&nbsp;</span>" +
                      "<img id='zebkit.fm.image' style='width:1px;height:1px;display:inline;vertical-align:baseline;' width='1' height='1'/>";
        document.body.appendChild(e);
    }
    pkg.Font.$fmText  = document.getElementById("zebkit.fm.text");
    pkg.Font.$fmImage = document.getElementById("zebkit.fm.image");

    //the next function passed to zebkit.ready() will be blocked
    //till the picture is completely loaded
    pkg.Font.$fmImage.onload = function() {
       zebkit.ready();
    };

    // set 1x1 transparent picture
    pkg.Font.$fmImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII%3D';

    pkg.$canvases = [];
    // canvases location has to be corrected if document layout is invalid
    pkg.$elBoundsUpdated = function() {
        for(var i = pkg.$canvases.length - 1; i >= 0; i--) {
            var c = pkg.$canvases[i];
            if (c.isFullSize === true) {
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

    var $wrt = null, $winSizeUpdated = false, $wpw = -1, $wph = -1;
    window.addEventListener("resize", function(e) {
        var ws = zebkit.web.$viewPortSize();
        if ($wpw !== window.innerWidth || $wph !== window.innerHeight) {
            $wpw = window.innerWidth;
            $wph = window.innerHeight;

            if ($wrt != null) {
                $winSizeUpdated = true;
            }
            else {
                $wrt = zebkit.util.task(
                    function(t) {
                        if ($winSizeUpdated === false) {
                            pkg.$elBoundsUpdated();
                            t.shutdown();
                            $wrt = null;
                        }
                        $winSizeUpdated = false;
                    }
                ).run(200, 150);
            }
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
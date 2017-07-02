/**
 * This class represents a font and provides basic font metrics like height, ascent. Using
 * the class developers can compute string width.
 *
 *     // plain font
 *     var f = new zebkit.Font("Arial", 14);
 *
 *     // bold font
 *     var f = new zebkit.Font("Arial", "bold", 14);
 *
 *     // defining font with CSS font name
 *     var f = new zebkit.Font("100px Futura, Helvetica, sans-serif");
 *
 * @constructor
 * @param {String} name a name of the font. If size and style parameters has not been passed
 * the name is considered as CSS font name that includes size and style
 * @param {String} [style] a style of the font: "bold", "italic", etc
 * @param {Integer} [size] a size of the font
 * @class zebkit.Font
 */
zebkit.Font = zebkit.Class([
    function(family, style, size) {
        if (arguments.length === 1) {
            this.size = this.clazz.decodeSize(family);
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

                    if (typeof m[4] !== 'undefined') {
                        this.family = m[4].trim();
                    }

                    if (typeof m[3] !== 'undefined') {
                        this.size = m[3].trim();
                    }

                    if (typeof m[1] !== 'undefined') {
                        this.style = m[1].trim();
                    }

                    this.s = family;
                }
            }
        } else if (arguments.length === 2) {
            this.family = family;
            this.size   = this.clazz.decodeSize(style);
            this.style  = this.size === null ? style : null;
        } else if (arguments.length === 3) {
            this.family = family;
            this.style  = style;
            this.size   = this.clazz.decodeSize(size);
        }

        if (this.size === null) {
            this.size = this.clazz.size + "px";
        }

        if (this.s === null) {
            this.s = ((this.style !== null) ? this.style + " ": "") +
                     this.size + " " +
                     this.family;
        }

        var mt = zebkit.environment.fontMetrics(this.s);

        /**
         * Height of the font
         * @attribute height
         * @readOnly
         * @type {Integer}
         */
        this.height = mt.height;

        /**
         * Ascent of the font
         * @attribute ascent
         * @readOnly
         * @type {Integer}
         */
        this.ascent = mt.ascent;
    },

    function $clazz() {

        // default values
        this.family = "Arial, Helvetica";
        this.style  =  null;
        this.size   =  14;

        this.mergeable = false;

        this.decodeSize = function(s, defaultSize) {
            if (arguments.length < 2) {
                defaultSize = this.size;
            }

            if (typeof s === "string" || s.constructor === String) {
                var size = Number(s);
                if (isNaN(size)) {
                    var m = s.match(/^([0-9]+)(%)$/);
                    if (m !== null && typeof m[1] !== 'undefined' && m[2] !== 'undefined') {
                        size = Math.floor((defaultSize * parseInt(m[1], 10)) / 100);
                        return size + "px";
                    } else {
                        return /^([0-9]+)(em|px)$/.test(s) === true ? s : null;
                    }
                } else {
                    if (s[0] === '+') {
                        size = defaultSize + size;
                    } else if (s[0] === '-') {
                        size = defaultSize - size;
                    }
                    return size + "px";
                }
            }
            return s === null ? null : s + "px";
        };
    },

    function $prototype(clazz) {
        this.s = null;

        /**
         *  Font family.
         *  @attribute family
         *  @type {String}
         *  @default null
         */
        this.family = clazz.family;

        /**
         *  Font style (for instance "bold").
         *  @attribute style
         *  @type {String}
         *  @default null
         */
        this.style = clazz.style;
        this.size  = clazz.size;

        /**
         * Returns CSS font representation
         * @return {String} a CSS representation of the given Font
         * @method toString
         * @for zebkit.Font
         */
        this.toString = function() {
            return this.s;
        };

        /**
         * Compute the given string width in pixels basing on the
         * font metrics.
         * @param  {String} s a string
         * @return {Integer} a string width
         * @method stringWidth
         */
        this.stringWidth = function(s) {
            if (s.length === 0) {
                return 0;
            } else {
                var fm = zebkit.environment.fontMeasure;
                if (fm.font !== this.s) {
                    fm.font = this.s;
                }

                return Math.round(fm.measureText(s).width);
            }
        };

        /**
         * Calculate the specified substring width
         * @param  {String} s a string
         * @param  {Integer} off fist character index
         * @param  {Integer} len length of substring
         * @return {Integer} a substring size in pixels
         * @method charsWidth
         * @for zebkit.Font
         */
        this.charsWidth = function(s, off, len) {
            var fm = zebkit.environment.fontMeasure;
            if (fm.font !== this.s) {
                fm.font = this.s;
            }

            return Math.round((fm.measureText(len === 1 ? s[off]
                                                        : s.substring(off, off + len))).width );
        };

        /**
         * Resize font and return new instance of font class with new size.
         * @param  {Integer | String} size can be specified in pixels as integer value or as
         * a percentage from the given font:
         * @return {zebkit.Font} a font
         * @for zebkit.Font
         * @method resize
         * @example
         *
         * ```javascript
         * var font = new zebkit.Font(10); // font 10 pixels
         * font = font.resize("200%"); // two times higher font
         * ```
         */
        this.resize = function(size) {
            var nsize = this.clazz.decodeSize(size, this.height);
            if (nsize === null) {
                throw new Error("Invalid font size : " + size);
            }
            return new this.clazz(this.family, this.style, nsize);
        };

        /**
         * Restyle font and return new instance of the font class
         * @param  {String} style a new style
         * @return {zebkit.Font} a font
         */
        this.restyle = function(style) {
            return new this.clazz(this.family, style, this.height + "px");
        };
    }
]);
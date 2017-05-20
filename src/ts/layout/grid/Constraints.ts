/**
 * Grid layout manager constraints. Constraints says how a  component has to be placed in
 * grid layout virtual cell. The constraints specifies vertical and horizontal alignments,
 * a virtual cell paddings, etc.
 * @param {Integer} [ax] a horizontal alignment
 * @param {Integer} [ay] a vertical alignment
 * @param {Integer} [p]  a cell padding
 * @constructor
 * @class zebkit.layout.Constraints
 */
class Constraints {
    constructor(ax, ay, p) {
        /**
         * Top cell padding
         * @attribute top
         * @type {Integer}
         * @default 0
         */

        /**
         * Left cell padding
         * @attribute left
         * @type {Integer}
         * @default 0
         */

        /**
         * Right cell padding
         * @attribute right
         * @type {Integer}
         * @default 0
         */

        /**
         * Bottom cell padding
         * @attribute bottom
         * @type {Integer}
         * @default 0
         */

        /**
         * Horizontal alignment
         * @attribute ax
         * @type {String}
         * @default "stretch"
         */

        /**
         * Vertical alignment
         * @attribute ay
         * @type {String}
         * @default "stretch"
         */

        this.top = this.bottom = this.left = this.right = 0;
        this.ay = this.ax = "stretch";
        this.rowSpan = this.colSpan = 1;

        if (arguments.length > 0) {
            this.ax = ax;
            if (arguments.length > 1) this.ay = ay;
            if (arguments.length > 2) this.setPadding(p);

            zebkit.util.$validateValue(this.ax, "stretch", "left", "center", "right");
            zebkit.util.$validateValue(this.ay, "stretch", "top", "center", "bottom");
        }
    }

    /**
     * Set all four paddings (top, left, bottom, right) to the given value
     * @param  {Integer} p a padding
     * @method setPadding
     */

    /**
     * Set top, left, bottom, right paddings
     * @param  {Integer} t a top padding
     * @param  {Integer} l a left padding
     * @param  {Integer} b a bottom padding
     * @param  {Integer} r a right padding
     * @method setPadding
     */
    setPadding(t,l,b,r) {
        if (arguments.length === 1) {
            this.top = this.bottom = this.left = this.right = t;
        } else {
            this.top    = t;
            this.bottom = b;
            this.left   = l;
            this.right  = r;
        }
        return this;
    };
}

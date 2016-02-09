zebkit.package("ui", function(pkg, Class) {

/**
 * @module  ui.html
 */
pkg.HtmlFocusableElement = Class(pkg.HtmlElement, [
    function $prototype() {
        this.$getElementRootFocus = function() {
            return this.element;
        };
    }
]);

/**
 * HTML input element wrapper class. The class can be used as basis class
 * to wrap HTML elements that can be used to enter a textual information.
 * @constructor
 * @param {String} text a text the text input component has to be filled with
 * @param {String} element an input element name
 * @class zebkit.ui.HtmlTextInput
 * @extends zebkit.ui.HtmlElement
 */
pkg.HtmlTextInput = Class(pkg.HtmlFocusableElement, [
    function $prototype() {
        this.cursorType = pkg.Cursor.TEXT;

        /**
         * Get a text of the text input element
         * @return {String} a text of the  text input element
         * @method getValue
         */
        this.getValue = function() {
            return this.element.value.toString();
        };

        /**
         * Set the text
         * @param {String} t a text
         * @method setValue
         */
        this.setValue = function(t) {
            if (this.element.value !== t) {
                this.element.value = t;
                this.vrp();
            }
        };
    },

    function(text, e) {
        if (text == null) text = "";
        this.$super(e);
        this.setAttribute("tabindex", 0);
        this.setValue(text);
    }
]);

/**
 * HTML input text element wrapper class. The class wraps standard HTML text field
 * and represents it as zebkit UI component.
 * @constructor
 * @class zebkit.ui.HtmlTextField
 * @param {String} [text] a text the text field component has to be filled with
 * @extends zebkit.ui.HtmlTextInput
 */
pkg.HtmlTextField = Class(pkg.HtmlTextInput, [
    function(text) {
        this.$super(text, "input");
        this.element.setAttribute("type",  "text");
    }
]);

/**
 * HTML input textarea element wrapper class. The class wraps standard HTML textarea
 * element and represents it as zebkit UI component.
 * @constructor
 * @param {String} [text] a text the text area component has to be filled with
 * @class zebkit.ui.HtmlTextArea
 * @extends zebkit.ui.HtmlTextInput
 */
pkg.HtmlTextArea = Class(pkg.HtmlTextInput, [
    function setResizeable(b) {
        this.setStyle("resize", b === false ? "none" : "both");
    },

    function(text) {
        this.$super(text, "textarea");
        this.element.setAttribute("rows", 10);
    }
]);

/**
 * [description]
 * @param  {[type]} text  [description]
 * @param  {zebkit}  href)
 * @return {[type]}       [description]
 */
pkg.HtmlLink = Class(pkg.HtmlElement, [
    function(text, href) {
        this.$super("a");
        this.setContent(text);
        this.setAttribute("href", href == null ? "#": href);
        this._ = new zebkit.util.Listeners();
        var $this = this;
        this.element.onclick = function(e) {
            $this._.fired($this);
        };
    }
]);

/**
 * @for
 */
});
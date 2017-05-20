import TextModel from './TextModel';
/**
 * Single line text model implementation
 * @param  {String}  [s] the specified text the model has to be filled
 * @param  {Integer} [max] the specified maximal text length
 * @constructor
 * @class zebkit.data.SingleLineTxt
 * @extends zebkit.data.TextModel
 */
class SingleLineTxt extends TextModel {
    constructor() {
        this.maxLen = max == null ? -1 : max;
        this.buf = "";
        this.extra = 0;
        this._ = new this.clazz.Listeners();
        this.setValue(s == null ? "" : s);
    }

    /**
     * Maximal text length. -1 means the text is not restricted
     * regarding its length.
     * @attribute maxLen
     * @type {Integer}
     * @default -1
     * @readOnly
     */
    $lineTags(i) {
        return this;
    }

    getValue(){
        return this.buf;
    }

    /**
     * Get number of lines stored in the text model. The model
     * can have only one line
     * @method getLines
     * @return {Integer} a number of lines
     */
    getLines(){
        return 1;
    }

    getTextLength(){
        return this.buf.length;
    }

    getLine(line){
        if (line !== 0) {
            throw new RangeError(line);
        }
        return this.buf;
    }

    write(s,offset) {
        // cut to the first new line character
        var j = s.indexOf("\n");
        if (j >= 0) {
            s = s.substring(0, j);
        }

        var l = (this.maxLen > 0 && (this.buf.length + s.length) >= this.maxLen) ? this.maxLen - this.buf.length
                                                                                  : s.length;
        if (l !== 0) {
            var nl = this.buf.substring(0, offset) + s.substring(0, l) + this.buf.substring(offset);
            if (this.validate == null || this.validate(nl)) {
                this.buf = nl;
                if (l > 0) {
                    this._.textUpdated(this, true, offset, l, 0, 1);
                    return true;
                }
            }
        }
        return false;
    }

    remove(offset,size){
        if (size > 0) {
            var nl = this.buf.substring(0, offset) +
                      this.buf.substring(offset + size);

            if (nl.length !== this.buf.length && (this.validate == null || this.validate(nl))) {
                this.buf = nl;
                this._.textUpdated(this, false, offset, size, 0, 1);
                return true;
            }
        }
        return false;
    }

    setValue(text){
        if (text == null) {
            throw new Error("Invalid null string");
        }

        if (this.validate != null && this.validate(text) === false) {
            return false;
        }

        // cut to next line
        var i = text.indexOf('\n');
        if (i >= 0) {
            text = text.substring(0, i);
        }

        if ((this.buf == null || this.buf !== text) && (this.validate == null || this.validate(text))) {
            if (this.buf != null && this.buf.length > 0) {
                this._.textUpdated(this, false, 0, this.buf.length, 0, 1);
            }

            if (this.maxLen > 0 && text.length > this.maxLen) {
                text = text.substring(0, this.maxLen);
            }

            this.buf = text;
            this._.textUpdated(this, true, 0, text.length, 0, 1);
            return true;
        }

        return false;
    }

    /**
     * Set the given maximal length the text can have
     * @method setMaxLength
     * @param  {Integer} max a maximal length of text
     */
    setMaxLength(max){
        if (max !== this.maxLen){
            this.maxLen = max;
            this.setValue("");
        }
    }

    /**
     *  Validate the given text. This method can be implemented to prevent
     *  inserting text in text model that doesn't satisfy the given condition.
     *  For instance text can allow only numeric.
     *  @method validate
     *  @param {String} text a text
     *  @return {Boolean} return true if the text is valid otherwise return false
     */
    validate(text) {
      return true;
    }
}

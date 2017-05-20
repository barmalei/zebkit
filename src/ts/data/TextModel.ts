/**
 * Text model class
 * @class zebkit.data.TextModel
 * @abstract
*/

/**
 * Get the given string line stored in the model
 * @method getLine
 * @param  {Integer} line a line number
 * @return {String}  a string line
 */

/**
 * Get wrapped by the text model original text string
 * @method getValue
 * @return {String} an original text
 */

/**
 * Get number of lines stored in the text model
 * @method getLines
 * @return {Integer} a number of lines
 */

/**
 * Get number of characters stored in the model
 * @method getTextLength
 * @return {Integer} a number of characters
 */

/**
 * Write the given string in the text model starting from the
 * specified offset
 * @method write
 * @param  {String} s a string to be written into the text model
 * @param  {Integer} offset an offset starting from that the passed
 * string has to be written into the text model
 */

/**
 * Remove substring from the text model.
 * @method remove
 * @param  {Integer} offset an offset starting from that a substring
 * will be removed
 * @param  {Integer} size a size of a substring to be removed
 */

/**
 * Fill the text model with the given text
 * @method  setValue
 * @param  {String} text a new text to be set for the text model
 */

/**
 * Fired when the text model has been updated: a string has been
 * inserted or removed

        text.bind(function (src, b, off, len, startLine, lines) {
            ...
        });

 *
 * @event textUpdated
 * @param {zebkit.data.Text} src a text model that triggers the event
 * @param {Boolean}  b a flag that is true if a string has been written
 * in the text model, false if the model substring has been removed
 * @param {Integer}  off an offset starting form that the text update
 * took place
 * @param {Integer}  len a length of text that has been affected by
 * the text model update
 * @param {Integer}  startLine a first line that has been affected
 * by the text model update
 * @param {Integer}  lines a number of lines that has been affected
 * by the text model update
 */
 class TextModel {
    $clazz = () {
      // hack to detect text model class
      this.isTextModel = true;
      this.Listeners = zebkit.util.ListenersClass("textUpdated");
    }
 }



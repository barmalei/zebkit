/**
 * List model class
 * @param  {Array} [a] an array the list model has to be initialized with
 * @example

      // create list model that contains three integer elements
      var l = new zebkit.data.ListModel([1,2,3]);

 * @constructor
 * @class zebkit.data.ListModel
 */

 /**
  * Fired when a new element has been added to the list model

     list.bind(function elementInserted(src, o, i) {
         ...
     });

  * @event elementInserted
  * @param {zebkit.data.ListModel} src a list model that triggers the event
  * @param {Object}  o an element that has been added
  * @param {Integer} i an index at that the new element has been added
  */

 /**
  * Fired when an element has been removed from the list model

     list.bind(function elementRemoved(src, o, i) {
         ...
     });

  * @event elementRemoved
  * @param {zebkit.data.ListModel} src a list model that triggers the event
  * @param {Object}  o an element that has been removed
  * @param {Integer} i an index at that the element has been removed
  */

 /**
  * Fired when an element has been re-set

     list.bind(function elementSet(src, o, p, i) {
         ...
     });

  * @event elementSet
  * @param {zebkit.data.ListModel} src a list model that triggers the event
  * @param {Object}  o an element that has been set
  * @param {Object}  p a previous element
  * @param {Integer} i an index at that the element has been re-set
  */

class ListModel {
    $clazz  = () {
        this.Listeners = zebkit.util.ListenersClass("elementInserted", "elementRemoved", "elementSet");
    }

    constructor() {
        this._ = new this.clazz.Listeners();
        this.d = (arguments.length === 0) ? [] : arguments[0];
    }
    
    /**
     * Get an item stored at the given location in the list
     * @method get
     * @param  {Integer} i an item location
     * @return {object}  a list item
     */
    at(i) {
        if (i < 0 || i >= this.d.length) {
            throw new RangeError(i);
        }
        return this.d[i];
    }

    /**
     * Add the given item to the end of the list
     * @method add
     * @param  {Object} o an item to be added
     */
    add(o) {
        this.d.push(o);
        this._.elementInserted(this, o, this.d.length - 1);
    }

    /**
     * Remove all elements from the list model
     * @method removeAll
     */
    removeAll() {
        var size = this.d.length;
        for(var i = size - 1; i >= 0; i--) this.removeAt(i);
    }

    /**
     * Remove an element at the given location of the list model
     * @method removeAt
     * @param {Integer} i a location of an element to be removed from the list
     */
    removeAt(i) {
        var re = this.d[i];
        this.d.splice(i, 1);
        this._.elementRemoved(this, re, i);
    }

    /**
     * Remove the given element from the list
     * @method remove
     * @param {Object} o an element to be removed from the list
     */
    remove(o) {
        for(var i = 0;i < this.d.length; i++ ){
            if (this.d[i] === o) this.removeAt(i);
        }
    }

    /**
     * Insert the given element into the given position of the list
     * @method insert
     * @param {Integer} i a position at which the element has to be inserted into the list
     * @param {Object} o an element to be inserted into the list
     */
    insert(i, o){
        if (i < 0 || i > this.d.length) {
            throw new RangeError(i);
        }
        this.d.splice(i, 0, o);
        this._.elementInserted(this, o, i);
    }

    /**
     * Get number of elements stored in the list
     * @method count
     * @return {Integer} a number of element in the list
     */
    count() {
        return this.d.length;
    }

    /**
     * Set the new element at the given position
     * @method setAt
     * @param  {Integer} i a position
     * @param  {Object} o a new element to be set as the list element at the given position
     * @return {Object}  previous element that was stored at the given position
     */
    setAt(i, o) {
        if (i < 0 || i >= this.d.length) {
            throw new RangeError(i);
        }
        var pe = this.d[i];
        this.d[i] = o;
        this._.elementSet(this, o, pe, i);
        return pe;
    }

    /**
     * Check if the element is in the list
     * @method contains
     * @param  {Object} o an element to be checked
     * @return {Boolean} true if the element is in the list
     */
    contains(o){
        return this.indexOf(o) >= 0;
    }

    /**
     * Get position the given element is stored in the list
     * @method indexOf
     * @param  {Object} o an element
     * @return {Integer} the element position. -1 if the element cannot be found in the list
     */
    indexOf(o){
        return this.d.indexOf(o);
    }
}

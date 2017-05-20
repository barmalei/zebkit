/**
 * Tree model item class. The structure is used by tree model to store
 * tree items values, parent and children item references.
 * @class zebkit.data.Item
 * @param  {Object} [v] the item value
 * @constructor
 */
class Item {
    constructor() {
        /**
         * Array of children items of the item element
         * @attribute kids
         * @type {Array}
         * @default []
         * @readOnly
         */
        this.kids = [];

        /**
         * Value stored with this item
         * @attribute value
         * @type {Object}
         * @default null
         * @readOnly
         */
        this.value = v;

        /**
         * Reference to a parent item
         * @attribute parent
         * @type {zebkit.data.Item}
         * @default undefined
         * @readOnly
         */
    }
)

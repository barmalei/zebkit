import data from '.';

/**
 * Tree model class. The class is simple and handy way to keep hierarchical structure.
 * @constructor
 * @param  {zebkit.data.Item|Object} [r] a root item. As the argument you can pass "zebkit.data.Item" or
 * a JavaType object. In the second case you can describe the tree as follow:

     // create tree model initialized with tree structure passed as
     // special formated JavaScript object
     var tree = new zebkit.data.TreeModel({ value:"Root",
                                          kids: [
                                              "Root kid 1",
                                              {
                                                value: "Root kid 2",
                                                kids:  [ "Kid of kid 2"]
                                              }
                                          ]});

 * @class zebkit.data.TreeModel
 */

/**
 * Fired when the tree model item value has been updated.

    tree.bind(function itemModified(src, item) {
        ...
    });

 * @event itemModified
 * @param {zebkit.data.TreeModel} src a tree model that triggers the event
 * @param {zebkit.data.Item}  item an item whose value has been updated
 */

/**
 * Fired when the tree model item has been removed

    tree.bind(function itemRemoved(src, item) {
       ...
    });

 * @event itemRemoved
 * @param {zebkit.data.TreeModel} src a tree model that triggers the event
 * @param {zebkit.data.Item}  item an item that has been removed from the tree model
 */

/**
 * Fired when the tree model item has been inserted into the model) {
       ...
    });

 * @event itemInserted
 * @param {zebkit.data.TreeModel} src a tree model that triggers the event
 * @param {zebkit.data.Item}  item an item that has been inserted into the tree model
 */

class TreeModel {
    $clazz = () {
        this.Listeners = zebkit.util.ListenersClass("itemModified", "itemRemoved", "itemInserted");

        this.create = function(r, p) {
            var item = new data.Item(r.hasOwnProperty("value")? r.value : r);
            item.parent = p;
            if (r.hasOwnProperty("kids")) {
                for(var i = 0; i < r.kids.length; i++) {
                    item.kids[i] = pkg.TreeModel.create(r.kids[i], item);
                }
            }
            return item;
        };

        this.findOne = function(root, value) {
            var res = null;
            data.TreeModel.find(root, value, function(item) {
                res = item;
                return true;
            });
            return res;
        };

        this.find = function(root, value, cb) {
            if (cb == null) {
                var res = [];
                pkg.TreeModel.find(root, value, function(item) {
                    res.push(item);
                    return false;
                });
                return res;
            }

            if (root.value === value) {
                if (cb.call(this, root) === true) return true;
            }

            if (root.kids != null) {
                for (var i = 0; i < root.kids.length; i++) {
                    if (pkg.TreeModel.find(root.kids[i], value, cb)) {
                        return true;
                    }
                }
            }
            return false;
        };
    }

    constructor() {
        if (arguments.length === 0) r = new pkg.Item();

        /**
         * Reference to the tree model root item
         * @attribute root
         * @type {zebkit.data.Item}
         * @readOnly
         */
        this.root = zebkit.instanceOf(r, pkg.Item) ? r : TreeModel.create(r);
        this.root.parent = null;
        this._ = new this.clazz.Listeners();      
    }
     
    iterate(r, f) {
        var res = f.call(this, r);
        if (res === 1 || res === 2) return r;

        for (var i = 0; i < r.kids.length; i++) {
            res = this.iterate(r.kids[i], f);
            if (res === 2) return res;
        }
    }

    /**
     * Update a value of the given tree model item with the new one
     * @method setValue
     * @param  {zebkit.data.Item} item an item whose value has to be updated
     * @param  {[type]} v   a new item value
     */
    setValue(item, v){
        item.value = v;
        this._.itemModified(this, item);
    }

    /**
     * Add the new item to the tree model as a children element of the given parent item
     * @method add
     * @param  {zebkit.data.Item} to a parent item to which the new item has to be added
     * @param  {Object|zebkit.data.Item} an item or value of the item to be
     * added to the parent item of the tree model
     */
    add(to,item){
        this.insert(to, item, to.kids.length);
    }

    /**
     * Insert the new item to the tree model as a children element at the
     * given position of the parent element
     * @method insert
     * @param  {zebkit.data.Item} to a parent item to which the new item
     * has to be inserted
     * @param  {Object|zebkit.data.Item} an item or value of the item to be
     * inserted to the parent item
     * @param  {Integer} i a position the new item has to be inserted into
     * the parent item
     */
    insert(to,item,i){
        if (i < 0 || to.kids.length < i) throw new RangeError(i);
        if (zebkit.isString(item)) {
            item = new pkg.Item(item);
        }
        to.kids.splice(i, 0, item);
        item.parent = to;
        this._.itemInserted(this, item);

        // !!!
        // it is necessary to analyze if the inserted item has kids and
        // generate inserted event for all kids recursively
    }

    /**
     * Remove the given item from the tree model
     * @method remove
     * @param  {zebkit.data.Item} item an item to be removed from the tree model
     */
    remove(item){
        if (item == this.root) {
            this.root = null;
        }
        else {
            if (item.kids != null) {
                for(var i = item.kids.length - 1; i >= 0; i--) {
                    this.remove(item.kids[i]);
                }
            }

            item.parent.kids.splice(item.parent.kids.indexOf(item), 1);
        }

        // preserve refernce to parent when we call a listener
        try {
            this._.itemRemoved(this, item);
        }
        catch(e) {
            item.parent = null;
            throw e;
        }
        item.parent = null;
    }

    /**
     * Remove all children items from the given item of the tree model
     * @method removeKids
     * @param  {zebkit.data.Item} item an item from that all children items have to be removed
     */
    removeKids(item) {
        for(var i = item.kids.length - 1; i >= 0; i--) {
            this.remove(item.kids[i]);
        }
    }
}

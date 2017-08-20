/**
 *  Finds an item by xpath-like simplified expression applied to a tree-like structure.
 *  Passed tree-like structure doesn't have a special requirements except every item of
 *  the structure have to define its kids by exposing "kids" field. The field is array
 *  of children elements:
 *
 *      // example of tree-like structure
 *      var treeLikeRoot = {
 *          value : "Root",
 *          kids : [
 *              { value: "Item 1" },
 *              { value: "Item 2" }
 *          ]
 *      };
 *
 *      zebkit.findInTree(treeLikeRoot,
 *          "/item1",
 *          function(foundElement) {
 *             ...
 *             // returning true means stop lookup
 *             return true;
 *          },
 *          function(item, fragment) {
 *              return item.value === fragment;
 *          });
 *
 *
 * The find method traverse the tree-like structure according to the xpath-like
 * expression. To understand if the given tree item confronts with the currently
 * traversing path fragment a special equality method has to be passed. The method
 * gets the traversing tree item and a string path fragment. The method has to
 * decide if the given tree item complies the specified path fragment.
 *
 * @param  {Object} root a tree root element. If the element has a children elements
 * the children have to be stored in "kids" field as an array.
 * @param  {String}  path a path-like expression. The path has to satisfy number of requirements:

    - has to start with "." or "/" or "//" character
    - has to define path part after "/" or "//"
    - path part can be either "*" or a name
    - optionally an attribute or/and its value can be defined as "[@<attr_name>=<attr_value>]"
    - attribute value is optional and can be boolean (true or false), integer, null or string value
    - string attribute value has to be wrapped with single quotes

 *
 * For examples:

    - "//*" traverse all tree elements
    - "//*[@a=10]" traverse all tree elements that has an attribute "a" that equals 10
    - "//*[@a]" traverse all tree elements that has an attribute "a" defined
    - "/Item1/Item2" find an element by exact path
    - ".//" traverse all tree elements including the root element

 * @param  {Function} cb callback function that is called every time a new tree element
 * matches the given path fragment. The function has to return true if the tree look up
 * has to be interrupted
 * @param  {Function}  [eq]  an equality function. The function gets current evaluated tree element
 * and a path fragment against which the tree element has to be evaluated. It is expected the method
 * returns boolean value to say if the given passed tree element matches the path fragment. If the
 * parameter is not passed or null then default equality method is used. The default method expects
 * a tree item has "path" field that is matched with  given path fragment.
 * @method findInTree
 * @for  zebkit
 */
var PATH_RE = /^[.]?(\/[\/]?)([^\[\/]+)\s*(\[\s*\@([a-zA-Z_][a-zA-Z0-9_\.]*)\s*(\=\s*[0-9]+|\=\s*true|\=\s*false|\=\s*null|\=\s*\'[^']*\')?\s*\])?/;
function findInTree(root, path, cb, eq, m) {
    if (root === null || typeof root === 'undefined') {
        throw new Error("Null tree root");
    }

    // if the method called first time
    if (arguments.length < 5) {
        path = path.trim();
        if (path[0] === '#') {
            path = "//*[@id='" + path.substring(1).trim() + "']";
        } else if (path === '.') {
            return cb(root);
        } else if (path[0] === '.' && path[1] === '/') { // means we have to include root in search
            root = { kids: [ root ] };
            path = path.substring(1);
        }
        m = null;
    }

    if (eq === null || arguments.length < 4) {
        eq = function(n, fragment) { return n.path === fragment; };
    }

    if (typeof root.kids !== 'undefined' &&   // a node has children
        root.kids        !== null        &&
        root.kids.length > 0                )
    {
        //
        // m == null                      : means this is the first call of the method
        // m[0].length !== m.input.length : means this is terminal part of the path
        //
        if (m === null ||  m[0].length !== m.input.length) {
            m = path.match(PATH_RE);

            if (m === null) {
                throw new Error("Cannot resolve path '" + path + "'");
            }

            // check if the matched path is not terminal
            if (m[0].length !== path.length) {
                path = path.substring(m[0].length);  // cut found fragment from the path
            }

            // normalize attribute value
            if (typeof m[3] !== 'undefined' && typeof m[5] !== 'undefined') {
                m[5] = m[5].substring(1).trim();

                if (m[5][0] === "'") {
                    m[5] = m[5].substring(1, m[5].length - 1);
                } else if (m[5] === "true") {
                    m[5] = true;
                } else if (m[5] === "false") {
                    m[5] = false;
                } else if (m[5] === "null") {
                    m[5] = null;
                } else {
                    var vv = parseInt(m[5], 10);
                    if (isNaN(vv) === false) {
                        m[5] = vv;
                    }
                }
            }
        }

        var isTerminal = m[0].length === m.input.length,
            pathDelim  = m[1],
            pathValue  = m[2];

        for (var i = 0; i < root.kids.length ; i++) {
            var kid     = root.kids[i],
                isMatch = false;
                                        // XOR
            if (pathValue === "*" || (eq(kid, pathValue) ? pathValue[0] !== '!' : pathValue[0] === '!')) {
                if (typeof m[3] !== 'undefined') { // has attributes
                    var attrName = m[4].trim();

                    // leave if attribute doesn't match
                    if (typeof kid[attrName] !== 'undefined' && (typeof m[5] === 'undefined' || kid[attrName] === m[5])) {
                        isMatch = true;
                    }
                } else {
                    isMatch = true;
                }
            }

            // if the kid match the path fragment and this is a terminal node
            // let callback know we found a node
            if (isMatch === true && isTerminal === true && cb(kid) === true) {
                return true;
            }

            // if path delimiter indicates it is recursive children search or
            // we matched not a terminal node let dig deeper in tree
            if ((isMatch === true && isTerminal === false) || pathDelim === "//") {
                if (findInTree(kid, path, cb, eq, m) === true) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * Interface that provides path search functionality for a tree-like structure.
 * @class  zebkit.PathSearch
 * @interface zebkit.PathSearch
 */
var PathSearch = Interface([
    function $prototype() {
        /**
         * Find all children items with the passed path expression.
         * @param  {String} path path expression. Path expression is simplified form
         * of XPath-like expression. See  {{#crossLink "zebkit"}}sdsd{{/crossLink}} method to
         * get more details.
         *
         * @param {Function} [cb] function that is called every time a new children
         * component has been found. If callback has not been passed then the method
         * return first found item or null.
         * @method byPath
         * @return {Object} found children item or null if no children items were found
         */
        this.byPath = function(path, cb) {
            if (typeof this.$normalizePath !== 'undefined') {
                path = this.$normalizePath(path);
            }

            if (arguments.length === 2) {
                if (arguments[1] === null) {
                    var r = [];
                    findInTree(this, path, function(n) {
                        r.push(n);
                        return false;
                    }, typeof this.$matchPath !== 'undefined' ? this.$matchPath
                                                              : null);
                    return r;
                } else {
                    findInTree(this, path, cb, typeof this.$matchPath !== 'undefined' ? this.$matchPath
                                                                                      : null);
                }
            } else {
                var res = null;
                findInTree(this, path, function(n) {
                    res = n;
                    return true;
                }, typeof this.$matchPath !== 'undefined' ? this.$matchPath : null);
                return res;
            }
        };
    }
]);

$export(findInTree, { "PathSearch": PathSearch } );
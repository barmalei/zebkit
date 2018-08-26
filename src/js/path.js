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
 * @param  {String}  path a path-like expression. The path has to satisfy number of
 * requirements:
 *
 *   - has to start with "." or "/" or "//" character
 *   - has to define path part after "/" or "//"
 *   - path part can be either "*" or a name
 *   - the last path that starts from '@' character is considered as an attribute
 *     value requester In this case an attribute value will be returned.
 *   - optionally an attribute or/and its value can be defined as "[@<attr_name>=<attr_value>]"
 *   - attribute value is optional and can be boolean (true or false), integer, null
 *     or string value
 *   - string attribute value has to be wrapped with single quotes
 *
 *
 * For examples:
 *
 *   - "//*" traverse all tree elements
 *   - "//*[@a=10]" traverse all tree elements that has an attribute "a" that equals 10
 *   - "//*[@a]" traverse all tree elements that has an attribute "a" defined
 *   - "/Item1/Item2" find an element by exact path
 *   - ".//" traverse all tree elements including the root element
 *   - "./Item1/@k" value of property 'k' for a tree node found with "./Item1" path
 *
 * @param  {Function} cb callback function that is called every time a new tree element
 * matches the given path fragment. The function has to return true if the tree look up
 * has to be interrupted
 * @param  {Function}  [eq]  an equality function. The function gets current evaluated
 * tree element and a path fragment against which the tree element has to be evaluated.
 * It is expected the method returns boolean value to say if the given passed tree
 * element matches the path fragment. If the parameter is not passed or null then default
 * equality method is used. The default method expects a tree item has "path" field that
 * is matched with  given path fragment.
 * @method findInTree
 * @for  zebkit
 */

var PATH_RE = /^[.]?(\/[\/]?)([^\[\/]+)(\[\s*\@([a-zA-Z_][a-zA-Z0-9_\.]*)\s*(\=\s*[0-9]+|\=\s*true|\=\s*false|\=\s*null|\=\s*\'[^']*\')?\s*\])?/,
    DEF_EQ  =  function(n, fragment) { return n.value === fragment; };

function findInTree(root, path, cb, eq) {
    if (root === null || root === undefined) {
        throw new Error("Null tree root");
    }

    path = path.trim();
    if (path[0] === '#') {  // id shortcut
        path = "//*[@id='" + path.substring(1).trim() + "']";
    } else if (path === '.') { // current node shortcut
        return cb.call(root, root);
    } else if (path[0] === '.' && path[1] === '/') { // means we have to include root in search
        if (path[2] !== '@') {
            root = { kids: [ root ] };
        }
        path = path.substring(1);
    }

    // no match method has been defined, let use default method
    // to match the given node to the current path fragment
    if (eq === null || arguments.length < 4) {  // check null first for perf.
        eq = DEF_EQ;
    }

    return $findInTree(root, path, cb, eq, null);
}

function $findInTree(root, path, cb, eq, m) {
    if (path[0] === '/' && path[1] === '/' && path[2] === '@') {
        path = "//*" + path.substring(1);
    }

    var pathValue,
        pv         = undefined,
        isTerminal = false;

    if (path[0] === '/' && path[1] === '@') {
        if (m === null || m[0].length !== m.input.length) {
            m = path.match(PATH_RE);

            if (m === null) {
                throw new Error("Cannot resolve path '" + path + "'");
            }

            // check if the matched path is not terminal
            if (m[0].length !== path.length) {
                path = path.substring(m[0].length);  // cut found fragment from the path
            }
        }

        pathValue = m[2].trim();
        if (pathValue[1] === '{') {
            if (pathValue[pathValue.length - 1] !== '}') {
                throw new Error("Invalid properties aggregation expression '" + pathValue + "'");
            }

            pv = {};
            var names = pathValue.substring(2, pathValue.length - 1).split(',');
            for (var ni = 0; ni < names.length; ni++) {
                var name = names[ni].trim();
                pv[name] = getPropertyValue(root, name, true);
            }
        } else {
            pv = getPropertyValue(root, pathValue.substring(1), true);
        }

        if (m[0].length === m.input.length) {  // terminal path
            if (pv !== undefined && cb.call(root, pv) === true) {
                return true;
            }
        } else {
            if (isAtomic(pv)) {
                throw new Error("Atomic typed node cannot be traversed");
            } else if (pv !== null && pv !== undefined) {
                if ($findInTree(pv, path, cb, eq, m) === true) {
                    return true;
                }
            }
        }
    } else if (root.kids !== undefined &&   // a node has children
               root.kids !== null      &&
               root.kids.length > 0       ) {

        var ppath = path;
        //
        // m == null                      : means this is the first call of the method
        // m[0].length !== m.input.length : means this is terminal part of the path
        //
        if (m === null || m[0].length !== m.input.length) {
            m = path.match(PATH_RE);

            if (m === null) {
                throw new Error("Cannot resolve path '" + path + "'");
            }

            // check if the matched path is not terminal
            if (m[0].length !== path.length) {
                path = path.substring(m[0].length);  // cut found fragment from the path
            }

            // normalize attribute value
            if (m[3] !== undefined && m[5] !== undefined) {
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

        if (m[0].length === m.input.length) {
            isTerminal = true;
        }
        pathValue = m[2].trim();

        // traverse root kid nodes
        for (var i = 0; i < root.kids.length ; i++) {
            var kid     = root.kids[i],
                isMatch = false;
                                        // XOR
            if (pathValue === "*" || (eq(kid, pathValue) ? pathValue[0] !== '!' : pathValue[0] === '!') === true) {
                if (m[3] !== undefined) { // has attributes
                    var attrName = m[4].trim();

                    // leave if attribute doesn't match
                    if (kid[attrName] !== undefined && (m[5] === undefined || kid[attrName] === m[5])) {
                        isMatch = true;
                    }
                } else {
                    isMatch = true;
                }
            }

            if (isTerminal === true) {
                // node match then call callback and leave if the callback says to do it
                if (isMatch === true) {
                    if (cb.call(root, kid) === true) {
                        return true;
                    }
                }

                if (m[1] === "//") {
                    if ($findInTree(kid, path, cb, eq, m) === true) {
                       return true;
                    }
                }
            } else {
                // not a terminal and match, then traverse kid
                if (isMatch === true) {
                    if ($findInTree(kid, path, cb, eq, m) === true) {
                        return true;
                    }
                }

                // not a terminal and recursive traversing then do it
                // with previous path
                if (m[1] === "//") {
                    if ($findInTree(kid, ppath, cb, eq, m) === true) {
                        return true;
                    }
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
         *  Method to match two element in tree.
         *  @protected
         *  @attribute $matchPath
         *  @type {Function}
         */
         this.$matchPath = null;

        /**
         * Find children items or values with the passed path expression.
         * @param  {String} path path expression. Path expression is simplified form
         * of XPath-like expression. See  {{#crossLink "findInTree"}}findInTree{{/crossLink}}
         * method to get more details.
         *
         * @param {Function} [cb] function that is called every time a new children
         * component has been found. If callback has not been passed then the method
         * return first found item or null. If the callback has been passed as null
         * then all found elements will be returned as array.
         * @method byPath
         * @return {Object} found children item/property value or null if no children
         * items were found
         */
        this.byPath = function(path, cb) {
            if (arguments.length === 2) {
                if (arguments[1] === null) {
                    var r = [];
                    findInTree(this, path, function(n) {
                        r.push(n);
                        return false;
                    }, this.$matchPath !== null ? this.$matchPath
                                                : null);
                    return r;
                } else {
                    findInTree(this, path, cb, this.$matchPath !== null ? this.$matchPath
                                                                        : null);
                }
            } else {
                var res = null;
                findInTree(this, path, function(n) {
                    res = n;
                    return true;
                }, this.$matchPath !== null ? this.$matchPath : null);
                return res;
            }
        };
    }
]);

$export(findInTree, { "PathSearch": PathSearch } );
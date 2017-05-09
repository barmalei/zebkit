zebkit.package("ui.tree", function(pkg, Class) {
    var ui = pkg.cd("..");

    /**
     * Component tree component that expects other UI components to be a tree model values.
     * In general the implementation lays out passed via tree model UI components as tree
     * component nodes. For instance:

         var tree = new zebkit.ui.tree.Tree({
              value: new zebkit.ui.Label("Label root item"),
              kids : [
                    new zebkit.ui.Checkbox("Checkbox Item"),
                    new zebkit.ui.Button("Button item"),
                    new zebkit.ui.Combo(["Combo item 1", "Combo item 2"])
             ]
         });

     * But to prevent unexpected navigation it is better to use number of predefined
     * with component tree UI components:

       - zebkit.ui.tree.CompTree.Label
       - zebkit.ui.tree.CompTree.Checkbox
       - zebkit.ui.tree.CompTree.Combo

     * You can describe tree model keeping in mind special notation

         var tree = new zebkit.ui.tree.Tree({
              value: "Label root item",  // zebkit.ui.tree.CompTree.Label
              kids : [
                    "[ ] Checkbox Item 1", // unchecked zebkit.ui.tree.CompTree.Checkbox
                    "[x] Checkbox Item 2", // checked zebkit.ui.tree.CompTree.Checkbox
                    ["Combo item 1", "Combo item 2"] // zebkit.ui.tree.CompTree.Combo
             ]
         });

     *
     * @class  zebkit.ui.tree.CompTree
     * @constructor
     * @extends zebkit.ui.tree.BaseTree
     * @param {Object|zebkit.data.TreeModel} [model] a tree data model passed as JavaScript
     * structure or as an instance
     * @param {Boolean} [b] the tree component items toggle state. true to have all items
     * in opened state.
     */
    pkg.CompTree = Class(pkg.BaseTree, [
        function $clazz() {
            this.Label = Class(ui.Label, [
                function $prototype() {
                    this.canHaveFocus = true;
                }
            ]);

            this.Checkbox = Class(ui.Checkbox, []);

            this.Combo = Class(ui.Combo, [
                function keyPressed(e) {
                    if (e.code !== "ArrowUp" && e.code !== "ArrowDown") {
                        this.$super(e);
                    }
                }
            ]);

            this.createModel = function(item, root, tree) {
                var mi = new zebkit.data.Item();

                if (typeof item.value !== "undefined") {
                    mi.value = item.value !== null ? item.value : "";
                } else {
                    mi.value = item;
                }

                mi.value = ui.$component(mi.value, tree);
                mi.parent = root;
                if (typeof item.kids !== 'undefined' && item.kids.length > 0 && zebkit.instanceOf(item, ui.Panel) === false) {
                    for (var i = 0; i < item.kids.length; i++) {
                        mi.kids[i] = this.createModel(item.kids[i], mi, tree);
                    }
                }

                return mi;
            };
        },

        function $prototype() {
            this.$blockCIE = false;
            this.canHaveFocus = false;

            this.getItemPreferredSize = function(root) {
                return root.value.getPreferredSize();
            };

            this.childKeyTyped = function(e) {
                if (this.selected !== null){
                    switch(e.key) {
                        case '+': if (this.isOpen(this.selected) === false) {
                            this.toggle(this.selected);
                        } break;
                        case '-': if (this.isOpen(this.selected)) {
                            this.toggle(this.selected);
                        } break;
                    }
                }
            };

            this.setFont = function(f) {
                this.font = zebkit.isString(f) ? new zebkit.ui.Font(f) : f;
                return this;
            };

            this.childKeyPressed = function(e) {
                if (this.isSelectable === true){
                    var newSelection = (e.code === "ArrowDown") ? this.findNext(this.selected)
                                                                : (e.code === "ArrowUp") ? this.findPrev(this.selected)
                                                                                         : null;
                    if (newSelection !== null) {
                        this.select(newSelection);
                    }
                }
            };

            this.childPointerPressed = this.childFocusGained = function(e) {
                if (this.isSelectable === true && this.$blockCIE !== true) {
                    this.$blockCIE = true;
                    try {
                        var item = zebkit.data.TreeModel.findOne(this.model.root,
                                                                zebkit.layout.getDirectChild(this,
                                                                                            e.source));
                        if (item !== null) this.select(item);
                    } finally {
                        this.$blockCIE = false;
                    }
                }
            };

            this.childFocusLost = function(e) {
                if (this.isSelectable === true) {
                    this.select(null);
                }
            };

            this.catchScrolled = function(psx, psy){
                this.vrp();
            };

            this.doLayout = function() {
                this.vVisibility();

                // hide all components
                for(var i = 0; i < this.kids.length; i++) {
                    this.kids[i].setVisible(false);
                }

                if (this.firstVisible !== null) {
                    var $this = this, fvNode = this.getIM(this.firstVisible), started = 0;

                    this.model.iterate(this.model.root, function(item) {
                        var node = $this.nodes[item];  // slightly improve performance
                                                       // (instead of calling $this.getIM(...))

                        if (started === 0 && item === $this.firstVisible) {
                            started = 1;
                        }

                        if (started === 1) {
                            var sy = $this.scrollManager.getSY();

                            if (node.y + sy < $this.height) {
                                var image = $this.getIconBounds(item),
                                    x = image.x + image.width +
                                               (image.width > 0 || $this.getToggleSize(item).width > 0 ? $this.gapx : 0) +
                                               $this.scrollManager.getSX(),
                                    y = node.y + Math.floor((node.height - node.viewHeight) / 2) + sy;

                                item.value.setVisible(true);
                                item.value.setLocation(x, y);
                                item.value.width  = node.viewWidth;
                                item.value.height = node.viewHeight;
                            } else {
                                started = 2;
                            }
                        }

                        return (started === 2) ? 2 : (node.isOpen === false ? 1 : 0);
                    });
                }
            };

            this.itemInserted = function(target, item) {
                this.add(item.value);
            };
        },

        function itemRemoved(target,item){
            this.$super(target,item);
            this.remove(item.value);
        },

        function setModel(model) {
            var old = this.model;

            if (model !== null && zebkit.instanceOf(model, zebkit.data.TreeModel) === false) {
                model = new zebkit.data.TreeModel(this.clazz.createModel(model, null, this));
            }

            this.$super(model);

            if (old !== this.model) {
                this.removeAll();
                if (this.model !== null) {
                    var $this = this;
                    this.model.iterate(this.model.root, function(item) {
                        $this.add(item.value);
                    });
                }
            }
            return this;
        },

        function recalc() {
            // track with the flag a node metrics has been updated
            this.$isMetricUpdated  = false;
            this.$super();

            // if a node size has been changed we have to force calling
            // repaint method for the whole tree component to render
            // tree lines properly
            if (this.$isMetricUpdated === true) {
                this.repaint();
            }
        },

        function recalc_(x,y,parent,root,isVis) {
            // in a case of component tree node view size has to be synced with
            // component
            var node = this.getIM(root);
            if (isVis === true) {
                var viewSize = this.getItemPreferredSize(root);
                if (this.$isMetricUpdated === false && (node.viewWidth  !== viewSize.width  ||
                                                        node.viewHeight !== viewSize.height  ))
                {
                    this.$isMetricUpdated = true;
                }

                node.viewWidth  = viewSize.width;
                node.viewHeight = viewSize.height;
            }
            return this.$super(x,y,parent,root,isVis);
        },

        function select(item) {
            if (this.isSelectable === true) {
                var old = this.selected;

                if (old !== null && old.value.hasFocus()) {
                    ui.focusManager.requestFocus(null);
                }

                this.$super(item);

                if (item !== null) {
                    item.value.requestFocus();
                }
            }
        },

        function makeVisible(item) {
           item.value.setVisible(true);
           this.$super(item);
        }
    ]);
});
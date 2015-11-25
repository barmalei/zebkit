zebra.package("ui.excel", function(pkg) {
    // TODO: standard component look and feel adjustment
    // has to be moved away from here

    zebra.ui.Menubar.MenuItem.Label.color = "white";
    zebra.ui.Menubar.MenuItem.Label.font = new zebra.ui.Font("Arial", "bold", 14);
    zebra.ui.Menu.MenuItem.Label.font = new zebra.ui.Font("Arial", "bold", 14);
    zebra.ui.Menu.MenuItem.Label.color = "black";

    var MAX_SHEET_PAGES = 10;


    var Class    = zebra.Class,
        ui       = zebra.ui,
        L        = zebra.layout,
        rg       = /\=([A-Z]+)([0-9]+)/,
        alphabet = [
                    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
                    "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X",
                    "Y", "Z"
                   ];


    pkg.yieldAlphabet = function(n, c) {
        for(var i = 0; i < n; i++) {
            c.call(this, alphabet[i % alphabet.length]);
        }
    };

    pkg.Matrix = Class(zebra.data.Matrix, [
        function $get(row, col) {
            return this.$super(this.get, row, col);
        },

        function get(row, col) {
            var v = this.$super(row, col);

            if (v != null) {
                var m = v.match( rg);
                if (m != null) {
                    col = alphabet.indexOf(m[1]);
                    row = parseInt(m[2]) - 1;
                    return this.$super(row, col);
                }
            }
            return v;
        }
    ]);

    pkg.EditorProvider = Class(ui.grid.DefEditors, [
        function shouldFinish(grid, row, col, e) {
            return e.id == "keyPresssed" && e.code == ui.KeyEvent.ENTER;
        },

        function shouldStart(grid, row, col, e) {
            return e.id === "keyTyped" ||
                   e.id === "pointerDoubleClicked";
        },

        function getEditor(grid, row, col, v) {
            return this.$super(grid, row, col, grid.model.$get(row, col));
        }
    ]);

    var MarkerSupport = [
        function $prototype() {
            this.markIndex = -1;
        },

        function setMarkerView(v) {
            this.markerView = v;
            this.repaint();
        },

        function mark(i) {
            if (this.markIndex != i) {
                var prev = this.markIndex;
                this.markIndex = i;
                if (prev >= 0) this.setTitleBackground(prev, null);
                if (i >= 0) this.setTitleBackground(i, this.markerView);
            }
        }
    ];

    pkg.TopCaption = Class(ui.grid.GridCaption, [
        function getTitle(i) {
            return alphabet[i % alphabet.length];
        }
    ]);
    pkg.TopCaption.extend(MarkerSupport);

    pkg.LeftCaption = Class(ui.grid.GridCaption, [
        function getTitle(i) {
            return "" + (i + 1);
        }
    ]);
    pkg.LeftCaption.extend(MarkerSupport);


    pkg.SheetPan = Class(ui.Panel, [
        function(grid) {
            this.grid = grid;
            this.$super(new L.BorderLayout());
            this.add("center", new ui.ScrollPan(grid));
            this.grid.position.bind(this);

            // TODO: re-worked to avoid references to specific to the given editors
            // provider context
            var $this = this;
            this.grid.editors.textEditor.extend([
                function write(pos, s) {
                    this.$super(pos, s);
                    $this.cellUpdated($this.grid.editedRow, $this.grid.editedCol, this.getValue());
                },

                function remove(pos, len) {
                    this.$super(pos, len);
                    $this.cellUpdated($this.grid.editedRow, $this.grid.editedCol, this.getValue());
                }
            ]);
        },

        function getGrid() {
            return this.grid;
        },

        function getCellValue(row, col) {
            return this.getGrid().model.$get(row, col);
        },

        function getMarkedCell() {
            if (this.getGrid().position.offset < 0) {
                return null;
            }

            return {
                row : this.getGrid().position.currentLine,
                col : this.getGrid().position.currentCol
            };
        },

        function posChanged(src, prevOffset, prevLine, prevCol) {
            var row = src.currentLine,
                col = src.currentCol,
                off = src.offset;

            this.cellMarked(row, col, off >= 0 ? this.getCellValue(row, col) : null);
        },

        function cellMarked(row, col, data) {},
        function cellUpdated(row, col, data) {}
    ]);

    pkg.Grid = Class(ui.grid.Grid, [
        function $prototype() {
            this.paintOnTop = function(g) {
                if (this.topCaption != null && this.topCaption.lineColor != null) {
                    g.setColor(this.topCaption.lineColor);
                    g.drawLine(0, this.topCaption.height - 1, this.topCaption.x + this.topCaption.width, this.topCaption.height-1);
                }

                if (this.leftCaption != null && this.leftCaption.lineColor != null) {
                    g.setColor(this.leftCaption.lineColor);
                    g.drawLine(this.leftCaption.width -1, 0, this.leftCaption.width-1, this.leftCaption.y + this.leftCaption.height);
                }
            };
        },

        function posChanged(target, prevOffset, prevLine, prevCol) {
            this.$super(target, prevOffset, prevLine, prevCol);
            if (this.leftCaption != null) this.leftCaption.mark(this.position.currentLine);
            if (this.topCaption  != null) this.topCaption.mark(this.position.currentCol);
        },

        function keyTyped(e) {
            var editor = this.editor;
            this.$super(e);
            if (editor == null && this.editor != null && this.editor.keyTyped != null) {
                // TODO: to be completely correct the redistributed key event has to have
                // corrected to the editor event source
                this.editor.keyTyped(e);
            }
        },

        function getCoordinates(row, col) {
            return {
                row : this.leftCaption.getTitle(row),
                col : this.topCaption.getTitle(col)
            };
        }
    ]);

    pkg.Application = Class([
        function(root) {
            var $this = this,
                spath = ".zebra.ui.excel.SheetPan",
                tabs  = root.find(".zebra.ui.Tabs");

            tabs.bind(function(src, prev) {
                // new tab sheet has to be added
                if (src.selectedIndex == tabs.kids.length - 1) {
                    var sheet = new zebra.util.Bag().load("sheetLayout.json");
                    tabs.insert(tabs.kids.length - 1, "Sheet " + tabs.kids.length, sheet.root);
                    if (tabs.kids.length - 1 == MAX_SHEET_PAGES) tabs.enableTab(tabs.kids.length - 1, false);
                }
                else {
                    var page =  src.selectedIndex >= 0 ? src.kids[src.selectedIndex] : null;
                    $this.sheetSelected(page == null ? null : page.find(spath));
                }
            });

            tabs.extend([
                function kidAdded(i, ctr, c) {
                    this.$super(i, ctr, c);
                    var sheet = c.find(spath);
                    $this.installSheet(sheet);
                    $this.sheetAdded(c.find(spath));
                    tabs.select(tabs.kids.length - 2);
                    tabs.select(tabs.kids.length - 2);
                },

                function kidRemoved(i, c) {
                    this.$super(i, c);
                    if (i == tabs.selectedIndex) {
                        $this.sheetSelected(null);
                    }
                    $this.sheetRemoved(c.find(spath));
                }
            ]);

            tabs.findAll(spath, function(c) {
                $this.installSheet(c);
            })
        },

        function installSheet(sheet) {
            var $this = this;

            sheet.cellMarked = function(row, col, value) {
                $this.sheetCellMarked(sheet, row, col, value);
            }

            sheet.cellUpdated = function(row, col, value) {
                $this.sheetCellUpdated(sheet, row, col, value);
            }
        },

        function sheetAdded(sheet) {

        },

        function sheetSelected(sheet) {

        },

        function sheetCellMarked(sheet, row, col, value) {

        },

        function sheetCellUpdated(sheet, row, col, value) {

        }

    ]);
})

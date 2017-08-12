zebkit.package("ui.date", function(pkg, Class) {
    var ui = zebkit.ui;

    /**
     * The package contains number of classes to implement
     * UI date related component like calendar, date field etc.
     *
     *     zebkit.require("ui", "ui.date", "layout", function(ui, date, layout) {
     *         var root = (new ui.zCanvas()).root;
     *         root.setLayout(new layout.FlowLayout("center", "center", "horizontal", 8));
     *
     *         // add calendar component
     *         root.add(new date.Calendar());
     *     });
     *
     * @class zebkit.ui.date
     * @access package
     */
    pkg.compareDates = function(d1, d2) {
        if (arguments.length === 2 && d1 === d2) {
            return 0;
        }

        // exclude null dates
        if (d1 === null || d2 === null) {
            return null;
        }

        var day1, month1, year1,
            day2, month2, year2,
            i = 1;

        if (d1 instanceof Date) {
            day1   = d1.getDate();
            month1 = d1.getMonth();
            year1  = d1.getFullYear();
        } else {
            day1   = arguments[0];
            month1 = arguments[1];
            year1  = arguments[2];
            i = 3;
        }

        d2 = arguments[i];
        if (d2 instanceof Date) {
            day2   = d2.getDate();
            month2 = d2.getMonth();
            year2  = d2.getFullYear();
        } else {
            day2   = arguments[i];
            month2 = arguments[i + 1];
            year2  = arguments[i + 2];
        }

        if (day1 === day2 && month1 === month2 && year1 === year2) {
            return 0;
        }

        if (year1 > year2 ||
            (year1 === year2 && month1 > month2) ||
            (year1 === year2 && month1 === month2 && day1 > day2))
        {
            return 1;
        }

        return -1;
    };


    Date.prototype.daysInMonth = function() {
        return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate();
    };

    Date.prototype.firstWeekDay = function() {
        return new Date(this.getFullYear(), this.getMonth(), 1).getDay();
    };

    Date.prototype.prevMonth = function() {
        return new Date(this.getFullYear(), this.getMonth() - 1, 1);
    };

    Date.prototype.nextMonth = function() {
        return new Date(this.getFullYear(), this.getMonth() + 1, 1);
    };

    Date.prototype.isValid = function() {
        // invalid dates have time set
        // to NaN, NaN never equals each other
        return this.getTime() === this.getTime();
    };

    Date.prototype.getMonthName = function() {

        return pkg.MONTHS[this.getMonth()].name;
    };

    Date.prototype.getMonthNick = function() {
        return pkg.MONTHS[this.getMonth()].nickname;
    };

    Date.prototype.getWeekdayName = function() {
        return pkg.WEEKS[this.getDay()].name;
    };

    Date.prototype.getWeekdayNick = function() {
        return pkg.WEEKS[this.getDay()].nickname;
    };

    Date.prototype.getMonth2 = function() {
        return this.getMonth() + 1;
    };

    pkg.validateDate = function(day, month, year) {
        var d = (arguments.length < 3) ? (arguments.length === 1 ? day : new Date(month, day))
                                       : new Date(year, month, day);
        if (d.isValid() === false) {
            throw new Error("Invalid date : " + d);
        }
    };

    /**
     *  Shows the given month and year days.
     *  @constructor
     *  @class zebkit.ui.date.DaysGrid
     *  @extends zebkit.ui.grid.Grid
     */
    pkg.DaysGrid = Class(ui.grid.Grid, [
        function () {
            this.tags    = {};
            this.view    = new ui.CompRender(null);
            this.itemPan = new this.clazz.ItemPan();

            this.$super(6, 7);

            //  pre-fill model with data
            for(var i = 0; i < this.model.rows * this.model.cols; i++) {
                this.model.puti(i, new this.clazz.Item());
            }

            this.setViewProvider(this);
            this.caption = new this.clazz.GridCaption();
            this.add("top", this.caption);
        },

        function $clazz() {
            this.Item = function() {
                this.tags    = [];
                this.$exists = {};
                this.day = this.month = this.year = 0;
            };

            this.Item.prototype = {
                set : function(day, month, year) {
                    this.day   = day;
                    this.month = month;
                    this.year  = year;
                },

                tag : function(tag) {
                    if (tag === null || typeof tag === 'undefined') {
                        throw new Error();
                    }

                    if (this.hasTag(tag) === false) {
                        this.tags.push(tag);
                        this.$exists[tag] = this.tags.length - 1;
                        return true;
                    }
                    return false;
                },

                untag : function(tag) {
                    if (tag === null || typeof tag === 'undefined') {
                        throw new Error();
                    }

                    if (this.hasTag(tag) === true) {
                        var i = this.$exists[tag];
                        this.tags.splice(i, 1);
                        for(; i < this.tags.length; i++) {
                            this.$exists[tag]--;
                        }
                        return true;
                    }
                    return false;
                },

                hasTag : function(tag) {
                    return this.$exists[tag] >= 0;
                },

                untagAll : function() {
                    if (this.tags.length > 0) {
                        this.tags.length = 0;
                        this.tags        = [];
                        this.$exists     = {};
                    }
                }
            };

            this.ItemPan = Class(ui.Panel, [
                function () {
                    this.icon  = new ui.ViewPan();
                    this.label = new ui.Label(new zebkit.draw.DecoratedTextRender(""));
                    this.$super();
                    this.add(this.icon);
                    this.add(this.label);
                },

                function $prototype() {
                    this.setLabel = function(p) {
                        this.label.properties(p);
                    };

                    this.setColor = function(c) {
                        this.label.setColor(c);
                    };

                    this.setFont = function(f) {
                        this.label.setFont(f);
                    };

                    this.setValue = function(v) {
                        this.label.setValue("" + v);
                    };

                    this.setIconView = function(v) {
                        this.icon.setView(v);
                    };

                    this.setIcon = function(p) {
                        this.icon.properties(p);
                    };

                    this.setTextDecorations = function(d) {
                        this.label.view.setDecorations(d);
                    };
                }
            ]);

            this.Listeners = this.$parent.Listeners.ListenersClass("cellSelected", "monthShown");

            this.GridCaption = Class(ui.grid.GridCaption, [
                function $clazz() {
                    this.Label = Class(ui.Label, [
                        function setNickname(name) {
                            return this.setValue(name);
                        }
                    ]);
                },

                function $prototype() {
                    this.setNamesOfWeekDays = function(daysOfWeek) {
                        for(var i = 0; i < daysOfWeek.length; i++) {
                            this.setLabel(i, new this.clazz.Label().properties(daysOfWeek[i]));
                        }
                    };
                }
            ]);
        },

        function $prototype() {
            this.tagger = null;

            this.retagModel = function() {
                var i = 0;

                for(i = 0; i < this.model.rows * this.model.cols; i++) {
                    var item = this.model.geti(i);
                    item.untagAll();

                    if (item.year < this.year || (item.year === this.year && item.month < this.month)) {
                        item.tag("prevMonth");
                    } else {
                        if (item.year > this.year || (item.year === this.year && item.month > this.month)) {
                            item.tag("nextMonth");
                        } else {
                            item.tag("shownMonth");
                        }
                    }

                    if (this.isItemSelectable(item) === false) {
                        item.tag("notSelectable");
                    }

                    if (this.tagger !== null) {
                        this.tagger.tag(item);
                    }
                }

                i = this.indexOfItem(new Date());
                if (i > 0) {
                    this.model.geti(i).tag("today");
                }

                this.vrp();
            };

            /**
             * Set a month and an year with the given arguments.
             * @param {Date} [date] a date object.
             * @param {Integer} [month] a month.
             * @param {Integer} [year] a full year.
             * @method setValue
             */
            this.setValue = function(month, year) {
                if (arguments.length === 1) {
                    if (month instanceof Date) {
                        year  = month.getFullYear();
                        month = month.getMonth();
                    } else {
                        year = (new Date()).getFullYear();
                    }
                } else if (arguments.length === 0) {
                    var cd = new Date();
                    year  = cd.getFullYear();
                    month = cd.getMonth();
                }

                pkg.validateDate(month, year);

                if (this.month !== month || this.year !== year) {
                    var prevYear  = this.year,
                        prevMonth = this.month;

                    this.month = month;
                    this.year  = year;

                    if (prevMonth >= 0) {
                        this.clearCellsSelection();
                    }

                    var date         = new Date(this.year, this.month),
                        firstWeekDay = date.firstWeekDay(),
                        pdate        = date.prevMonth(),
                        ndate        = date.nextMonth(),
                        pdays        = pdate.daysInMonth(),
                        i            = 0,
                        d            = 0;

                    // if current month starts from the first cell
                    // shift one week ahead to shown number of
                    // previous month days
                    if (firstWeekDay === 0) {
                        firstWeekDay += 7;
                    }

                    for(; i < firstWeekDay; i++) {
                        this.model.geti(i).set(
                            pdays - firstWeekDay + i + 1,
                            pdate.getMonth(),
                            pdate.getFullYear()
                        );
                    }

                    for(d = 1; d <= date.daysInMonth(); i++, d++) {
                        this.model.geti(i).set(d, month, year);
                    }

                    for(d = 1; i < this.model.rows * this.model.cols; i++, d++) {
                        this.model.geti(i).set(d, ndate.getMonth(), ndate.getFullYear());
                    }

                    this.retagModel();
                    this.fire("monthShown", [this, prevMonth, prevYear]);
                }
            };

            /**
             * Get days grid cell color.
             * @param  {Integer} row  a row
             * @param  {Integer} col  a column
             * @return {String} a cell color
             * @method  getCellColor
             */
            this.getCellColor = function(grid, row, col) {
                var color = null,
                    tags  = this.tags;

                if (tags.length > 0) {
                    for(var i = 0; i < tags.length; i++) {
                        var k = tags[i];
                        if (this.tags.hasOwnProperty(k) && this.tags[k] !== null) {
                            color = this.tags[k].cellColor;
                        }
                    }
                }
                return color;
            };

            this.getViewComponent = function(item) {
                this.itemPan.properties(this.itemPan.clazz);

                if (item.tags.length > 0) {
                    for(var i = 0; i < item.tags.length; i++) {
                        var k = item.tags[i];
                        if (this.tags.hasOwnProperty(k) && this.tags[k] !== null) {
                            this.itemPan.properties(this.tags[k]);
                        }
                    }
                }

                this.itemPan.setValue(item.day);
                return this.itemPan;
            };

            this.getView = function(grid, row, col, data) {
                this.view.setValue(this.getViewComponent(data));
                return this.view;
            };

            this.isItemSelectable = function (item) {
                return true;
            };

            this.isSelected = function (row, col) {
                return row >= 0 && col >= 0 && this.model.get(row, col).isSelected;
            };

            this.indexOfItem = function(day, month, year) {
                if (arguments.length === 1) {
                    month = day.getMonth();
                    year  = day.getFullYear();
                    day   = day.getDate();
                }

                var m = this.model.rows * this.model.cols;
                for(var i = 0; i < m; i++) {
                    var item = this.model.geti(i);
                    if (item.year === year && item.day === day && item.month === month) {
                        return i;
                    }
                }
                return -1;
            };

            this.pointerMoved = function(e) {
                var p = this.cellByLocation(e.x, e.y);
                if (p !== null) {
                    this.position.setRowCol(p.row, p.col);
                }
                else {
                    this.position.setOffset(null);
                }
            };

            this.clearCellsSelection = function() {
                for(var i = 0;  i < this.model.rows * this.model.cols; i++) {
                    var item = this.model.geti(i);
                    if (item.isSelected === true) {
                        this.selectCell(i, false);
                    }
                }
            };

            this.pointerExited = function(e) {
                this.position.setOffset(null);
            };

            this.setTagger = function(tagger) {
                if (this.tagger !== tagger) {
                    this.tagger = tagger;
                    this.retagModel();
                }
            };

            this.setTags = function(tags) {
                this.tags = zebkit.clone(tags);
                this.vrp();

            };

            this.addTags = function(tags) {
                for(var k in tags) {
                    this.tags[k] = zebkit.clone(tags[k]);
                }
                this.vrp();
            };

            this.setTag = function(tag, p) {
                this.tags[tag] = zebkit.clone(p);
                this.vrp();
            };

            this.selectCell = function(offset, b) {
                if (arguments.length > 2) {
                    offset = this.indexOfItem(arguments[0], arguments[1], arguments[2]);
                    b = arguments[3];
                }

                if (offset === null || typeof offset === 'undefined') {
                    throw new Error("" + offset);
                }

                if (offset instanceof Date) {
                    offset = this.indexOfItem(offset);
                }

                var item = this.model.geti(offset);
                if (item.isSelected !== b && (b === false || this.isItemSelectable(item))) {
                    item.isSelected = b;
                    this.repaint();
                    this.fire("cellSelected", [this, offset, b]);
                }
            };
        },

        function rPsMetric() {
            this.$super();

            var max = 0, cols = this.getGridCols(), i = 0;
            for(i = 0; i < cols; i++) {
                if (this.colWidths[i] > max) {
                    max = this.colWidths[i];
                }
            }

            for(i = 0; i < cols; i++) {
                this.colWidths[i] = max;
            }
        },

        function $getPosMarker() {
            var item = this.model.geti(this.position.offset);
            return this.isItemSelectable(item) === false ? this.views.notSelectableMarker
                                                         : this.$super();
        },

        function pointerClicked(e) {
            this.$super(e);
            var p = this.cellByLocation(e.x, e.y);
            if (p !== null) {
                this.selectCell(p.row * this.getGridCols() + p.col, true);
            }
        },

        function keyPressed(e) {
            if (e.code !== "Enter") {
                return this.$super(e);
            }

            if (this.position.offset >= 0) {
                this.selectCell(this.position.offset, true);
            }
        }
    ]);

    pkg.Calendar = new Class(ui.Panel, [
        function(date) {
            if (arguments.length === 0) {
                date = new Date();
            }

            var $this = this;

            this.$super(new zebkit.layout.BorderLayout());
            this.monthDaysGrid = new pkg.DaysGrid([
                function isItemSelectable(item) {
                    return (item.tags.length > 0 && item.hasTag("shownMonth") === null) ||
                           $this.canDateBeSet(new Date(item.year, item.month, item.day));
                }

            ]);
            this.monthDaysGrid.on(this);

            this.comboMonth = new this.clazz.MonthsCombo();
            this.comboMonth.content.setCalcPsByContent(true);

            // TODO: find another solution since the property is not suppotred anymore
            //this.comboMonth.winpad.adjustToComboSize = false;

            this.comboMonth.on(function(src) {
                $this.showMonth(src.list.selectedIndex, $this.monthDaysGrid.year);
            });

            this.yearText = new this.clazz.YearField("", [
                function fireNextYear() {
                    $this.showNextYear();
                },

                function firePrevYear() {
                    $this.showPrevYear();
                }
            ]);

            var topPan = new this.clazz.InfoPan({
                layout: new zebkit.layout.BorderLayout(),
                kids  : {
                    center: new ui.Panel({
                        layout : new zebkit.layout.FlowLayout("center", "center"),
                        kids   : [
                            this.comboMonth,
                            new ui.Panel({
                                layout : new zebkit.layout.BorderLayout(),
                                kids   : {
                                    center : this.yearText,
                                    right  : new ui.Panel({
                                        layout: new zebkit.layout.FlowLayout("center", "center", "vertical", 1),
                                        kids  : [
                                            new this.clazz.TopArrowButton(),
                                            new this.clazz.BottomArrowButton()
                                        ]
                                    })
                                }
                            })
                        ]
                    }),

                    left: new ui.Panel({
                        layout : new zebkit.layout.FlowLayout("center", "center", "horizontal", 3),
                        kids   : [
                            new this.clazz.LeftArrowButton(),
                            new this.clazz.DotButton(),
                            new this.clazz.RightArrowButton()
                        ]
                    }),

                    right: new ui.Panel({
                        layout : new zebkit.layout.FlowLayout("center", "bottom"),
                        kids   : new this.clazz.Link("today"),
                        padding: [0,8,4,0]
                    })
                }
            });

            this.add("top", topPan);
            this.add("center", this.monthDaysGrid);
            this.setValue(date);

            this.byPath("#dotButton").on(function() {
                $this.showSelectedMonth();
            });

            this.byPath("#leftButton").on(function() {
                $this.showPrevMonth();
            });

            this.byPath("#rightButton").on(function() {
                $this.showNextMonth();
            });

            this.byPath("#topButton").on(function() {
                $this.showNextYear();
            });

            this.byPath("#bottomButton").on(function() {
                $this.showPrevYear();
            });

            this.byPath("#nowLink").on(function() {
                $this.setValue(new Date());
            });
        },

        function $clazz() {
            this.Listeners = zebkit.util.ListenersClass("dateSet");

            this.LeftArrowButton   = Class(ui.ArrowButton, []);
            this.TopArrowButton    = Class(ui.ArrowButton, []);
            this.BottomArrowButton = Class(ui.ArrowButton, []);
            this.RightArrowButton  = Class(ui.ArrowButton, []);
            this.Link              = Class(ui.Link, []);

            this.DotButton = Class(ui.EvStatePan, ui.ButtonRepeatMix, [
                function() {
                    this._ = new zebkit.util.Listeners();
                    this.$super();
                }
            ]);

            this.MonthsCombo = Class(ui.Combo, [
                function $clazz() {
                    this.Label    = Class(ui.Label, []);
                    this.CompList = Class(ui.CompList, []);
                },

                function $prototype() {
                    this.setMonths = function(months) {
                        for(var i = 0; i < months.length; i++) {
                            this.list.model.add(new this.clazz.Label(months[i].name));
                        }
                    };

                    this.padShown = function(b) {
                        if (b === true) {
                            this.list.position.setOffset(0);
                        }
                    };
                },

                function() {
                    this.$super(new this.clazz.CompList(true));
                    this.button.removeMe();
                }
            ]);

            this.InfoPan = Class(ui.Panel, []);

            this.YearField = Class(ui.TextField, [
                function keyPressed(e) {
                    switch (e.code) {
                        case "ArrowUp"  :
                            if (typeof this.fireNextYear !== 'undefined') {
                                this.fireNextYear();
                            } break;
                        case "ArrowDown":
                            if (typeof this.firePrevYear !== 'undefined') {
                                this.firePrevYear();
                            } break;
                        default: return this.$super(e);
                    }
                }
            ]);
        },

        function $prototype() {
            this.comboMonth = this.monthDaysGrid = null;
            this.selectedDate = this.minDate = this.maxDate = null;
            this.$freeze = false;

            this.canMonthBeShown = function(month, year) {
                return true;
            };

            this.showMonth = function(month, year) {
                pkg.validateDate(month, year);
                if (this.canMonthBeShown(month, year)) {
                    this.monthDaysGrid.setValue(month, year);
                }
            };

            this.monthShown = function(src, prevMonth, prevYear) {
                if (this.selectedDate !== null &&
                    this.selectedDate.getMonth() === src.month &&
                    this.selectedDate.getFullYear() === src.year)
                {
                    src.selectCell(this.selectedDate, true);
                }

                this.comboMonth.select(src.month);
                this.yearText.setValue("" + src.year);
                this.repaint();
            };

            this.showNextYear = function() {
                this.showMonth(this.monthDaysGrid.month, this.monthDaysGrid.year + 1);
            };

            this.showPrevYear = function () {
                this.showMonth(this.monthDaysGrid.month, this.monthDaysGrid.year - 1);
            };

            this.showNextMonth = function () {
                if (this.monthDaysGrid.month < 0) {
                    this.showMonth(0, 1900);
                } else {
                    var d = new Date(this.monthDaysGrid.year,
                                     this.monthDaysGrid.month).nextMonth();
                    this.showMonth(d.getMonth(), d.getFullYear());
                }
            };

            this.showPrevMonth = function () {
                if (this.showMonth < 0) {
                    this.showMonth(0, 1900);
                } else {
                    var d = new Date(this.monthDaysGrid.year, this.monthDaysGrid.month).prevMonth();
                    this.showMonth(d.getMonth(), d.getFullYear());
                }
            };

            this.showSelectedMonth = function () {
                if (this.selectedDate !== null) {
                    this.showMonth(this.selectedDate.getMonth(),
                                   this.selectedDate.getFullYear());
                }
            };

            this.canDateBeSet = function (date) {
                return  date === null || (
                            (this.minDate === null || pkg.compareDates(date, this.minDate) >= 0) &&
                            (this.maxDate === null || pkg.compareDates(date, this.maxDate) <= 0)
                        );
            };

            this.cellSelected = function(src, offset, b) {
                if (this.$freeze !== true && b === true) {
                    var item = src.model.geti(offset);
                    if (item.tags.length > 0) {
                        if (item.hasTag("shownMonth") === true) {
                            this.setValue(item.day, item.month, item.year);
                        } else {
                            if (item.hasTag("nextMonth") === true) {
                                this.showNextMonth();
                            } else {
                                this.showPrevMonth();
                            }
                        }
                    }
                }
            };
        },

        function setMinValue(date) {
            if (arguments.length > 1) {
                date = new Date(arguments[2], arguments[1], arguments[0]);
            }

            if (date !== null) {
                pkg.validateDate(date);
            }

            if (pkg.compareDates(this.minDate, date) !== 0) {
                if (pkg.compareDates(date, this.maxDate) === 1) {
                    throw new RangeError();
                }

                this.minDate = date;
                if (pkg.compareDates(this.selectedDate, this.minDate) === -1) {
                    this.setValue(null);
                }

                this.monthDaysGrid.retagModel();
            }
        },

        function setMaxValue(date) {
            if (arguments.length > 1) {
                date = new Date(arguments[2], arguments[1], arguments[0]);
            }

            if (date !== null) {
                pkg.validateDate(date);
            }

            if (pkg.compareDates(this.maxDate, date) !== 0) {
                if (pkg.compareDates(date, this.minDate) === -1) {
                    throw new RangeError("" + date + "," + this.minDate + "," + pkg.compareDates(date, this.minDate));
                }

                this.maxDate = date;
                if (pkg.compareDates(this.selectedDate, this.maxDate) === 1) {
                    this.setValue(null);
                }

                this.monthDaysGrid.retagModel();
            }
        },

        function setValue(date) {
            if (arguments.length > 1) {
                date = new Date(arguments[2], arguments[1], arguments[0]);
            }

            if (this.$freeze !== true) {
                if (date !== null) {
                    pkg.validateDate(date);
                }

                if (this.canDateBeSet(date) === true && pkg.compareDates(this.selectedDate, date) !== 0) {
                    try {
                        this.$freeze = true;

                        var prevDate = this.selectedDate;
                        if (prevDate !== null                                 &&
                            prevDate.getMonth() === this.monthDaysGrid.month  &&
                            prevDate.getFullYear() === this.monthDaysGrid.year  )
                        {
                            this.monthDaysGrid.selectCell(this.selectedDate, false);
                        }

                        this.selectedDate = date;
                        this.byPath("#dotButton").setEnabled(this.selectedDate !== null);
                        this.byPath("#nowLink").setEnabled(pkg.compareDates(new Date(), this.selectedDate) !== 0);

                        if (this.selectedDate !== null) {
                            this.showSelectedMonth();
                            this.monthDaysGrid.selectCell(this.selectedDate, true);
                        }

                        this.monthDaysGrid.retagModel();
                        this.fire("dateSet", [this, prevDate]);
                    } finally {
                        this.$freeze = false;
                    }
                }
            }
        }
    ]);

    pkg.DateTextField = Class(ui.TextField, [
        function(format) {
            if (arguments.length === 0) {
                format = "${2,0,date}/${2,0,month2}/${4,0,fullYear}";
            }

            this.$super();
            this.setFormat(format);
            this.maxWidth = 0;
        },

        function $prototype() {
            this.notDefined = "-";
            this.date = null;

            this.$format = function(d) {
                return zebkit.util.format(this.format, d !== null ? d :{}, this.notDefined);
            };
        },

        function setFormat(format) {
            if (format === null || typeof format === 'undefined') {
                throw new Error("Format is not defined " + this.clazz.$name);
            }

            if (this.format !== format) {
                this.format = format;
                this.$getSuper("setValue").call(this, this.$format(this.date));
            }
        },

        function setValue(d) {
            if (d !== null) {
                pkg.validateDate(d);
            }

            if (pkg.compareDates(this.date, d) !== 0) {
                this.date = d;
                this.$super(this.$format(this.date));
            }
        },

        function calcPreferredSize(target) {
            var ps = this.$super(target);
            ps.width = this.maxWidth;
            return ps;
        },

        function focused () {
            if (this.hasFocus()) {
                this.selectAll();
            } else {
                this.clearSelection();
            }
            this.$super();
        },

        function recalc() {
            this.$super();
            var s = this.$format(new Date());
            this.maxWidth = this.getFont().stringWidth(s);
            this.maxWidth += Math.floor(this.maxWidth / 10);
        }
    ]);

    var PopupCalendarMix = zebkit.Interface([
        function childKeyPressed(e) {
            if (e.code === "Enter") {
                this.showCalendar(e.source);
            } else if (e.code === "Backspace") {
                //
            }
        },

        function getCalendar() {
            if (typeof this.calendar === 'undefined' || this.calendar === null) {
                var $this = this;

                this.$freezeCalendar = false;

                this.calendar = new pkg.Calendar([
                    function winActivated (e){
                        if (e.isActive === false) {
                            $this.hideCalendar();
                        }
                    },

                    function childKeyPressed(e){
                        if (e.code === "Escape") {
                            $this.hideCalendar();
                        }
                    }
                ]);

                this.calendar.on("dateSet", function() {
                    if ($this.$freezeCalendar === false) {
                        if (typeof $this.calendarDateSet !== 'undefined') {
                            $this.calendarDateSet.apply($this, arguments);
                        }
                        $this.hideCalendar();
                    }
                });
            }
            return this.calendar;
        },

        function showCalendar(anchor) {
            try {
                this.$freezeCalendar = true;

                var calendar = this.getCalendar();
                this.hideCalendar();
                this.anchor = anchor;

                var c = this.getCanvas(),
                    w = c.getLayer("win"),
                    p = zebkit.layout.toParentOrigin(0, 0, anchor, c);

                calendar.toPreferredSize();

                p.y = p.y + anchor.height;
                if (p.y + calendar.height > w.height - w.getBottom()) {
                    p.y = p.y - calendar.height - anchor.height - 1;
                }

                if (p.x + calendar.width > w.width - w.getRight()) {
                    p.x -= (p.x + calendar.width - w.width + w.getRight());
                }

                calendar.setLocation(p.x, p.y);
                ui.showWindow(this, "mdi", calendar);

                ui.activateWindow(calendar);
                calendar.monthDaysGrid.requestFocus();

                if (typeof this.calendarShown !== 'undefined') {
                    this.calendarShown(this.calendar);
                }
            } finally {
                this.$freezeCalendar = false;
            }
        },

        function  hideCalendar() {
            var calendar = this.getCalendar();
            if (calendar.parent !== null) {
                calendar.removeMe();
                if (typeof this.calendarHidden !== 'undefined') {
                    this.calendarHidden();
                }
                this.anchor.requestFocus();
                this.anchor = null;
            }
        }
    ]);

    pkg.DateInputField = Class(ui.Panel, PopupCalendarMix, [
        function (format) {
            this.$super(new zebkit.layout.FlowLayout());

            var $this = this;
            this.dateField = arguments.length === 0 ? new this.clazz.DateTextField()
                                                    : new this.clazz.DateTextField(format);
            this.add(this.dateField);
            this.add(new this.clazz.Button("..."));

            // sync calendar and input field dates
            this.dateField.setValue(this.getValue());

            this.byPath("//~zebkit.ui.Button").on(function(src) {
                $this.showCalendar($this.dateField);
            });
        },

        function $clazz() {
            this.Button = Class(ui.Button, []);

            this.Calendar = Class(pkg.Calendar, [
                function $clazz() {
                    this.MonthsCombo = Class(pkg.Calendar.MonthsCombo, []);
                }
            ]);

            this.DateTextField = Class(pkg.DateTextField, []);
        },

        function calendarDateSet(src) {
            this.dateField.setValue(src.selectedDate);
        },

        function setValue(d) {
            this.getCalendar().setValue(d);
        },

        function getValue(d) {
            return this.getCalendar().selectedDate;
        }
    ]);

    pkg.DateRangeInput = Class(ui.Panel, PopupCalendarMix, [
        function() {
            this.$super();

            var $this = this,
                la    = new this.clazz.LeftArrowButton(),
                ra    = new this.clazz.RightArrowButton(),
                cal   = this.getCalendar();

            this._ = new zebkit.util.Listeners();

            this.minDateField = new this.clazz.MinDateTextField([
                function keyPressed(e) {
                    if (e.code === "ArrowRight" && this.position.offset === this.getMaxOffset()) {
                        $this.maxDateField.position.setOffset(0);
                        $this.maxDateField.requestFocus();
                    }
                    this.$super(e);
                }
            ]);

            this.maxDateField = new this.clazz.MaxDateTextField([
                function keyPressed(e) {
                    if (e.code === "ArrowLeft" && this.position.offset === 0) {
                        $this.minDateField.requestFocus();
                    }
                    this.$super(e);
                }
            ]);

            cal.monthDaysGrid.setTagger({
                tag : function(item) {
                    if (pkg.compareDates(item.day, item.month, item.year, $this.minDateField.date) === 0) {
                        item.tag("startDate");
                    }
                    else {
                        if (pkg.compareDates(item.day, item.month, item.year, $this.maxDateField.date) === 0) {
                            item.tag("endDate");
                        }
                    }
                }
            });

            if (typeof this.clazz.tags !== 'undefined' &&  this.clazz.tags !== null) {
                cal.monthDaysGrid.addTags(this.clazz.tags);
            }

            this.add(new this.clazz.DateInputPan(la, this.minDateField));
            this.add(new this.clazz.Line());
            this.add(new this.clazz.DateInputPan(this.maxDateField, ra));

            la.on(function () {
                $this.getCalendar().setMaxValue($this.maxDateField.date);
                $this.showCalendar($this.minDateField);
            });

            ra.on(function () {
                $this.getCalendar().setMinValue($this.minDateField.date);
                $this.showCalendar($this.maxDateField);
            });
        },

        function $clazz() {
            this.MinDateTextField  = Class(pkg.DateTextField, []);
            this.MaxDateTextField  = Class(pkg.DateTextField, []);
            this.LeftArrowButton   = Class(ui.ArrowButton, []);
            this.RightArrowButton  = Class(ui.ArrowButton, []);

            this.DateInputPan = Class(ui.Panel, [
                function() {
                    this.$super();
                    for(var i = 0; i < arguments.length; i++) {
                        this.add(arguments[i]);
                    }
                }
            ]);

            this.Line = Class(ui.Line, []);
        },

        function calendarShown(calendar) {
            if (this.anchor === this.minDateField) {
                calendar.setValue(this.minDateField.date);
                calendar.setMaxValue(this.maxDateField.date);
                calendar.setMinValue(null);
            } else {
                calendar.setValue(this.maxDateField.date);
                calendar.setMaxValue(null);
                calendar.setMinValue(this.minDateField.date);
            }
        },

        function calendarDateSet(src) {
            this.setValue(this.anchor === this.minDateField ? src.selectedDate : this.minDateField.date,
                          this.anchor === this.maxDateField ? src.selectedDate : this.maxDateField.date);
        },

        function setValue(d1, d2) {
            if (pkg.compareDates(d1, d2) === 1) {
                throw new RangeError();
            }

            if (pkg.compareDates(d1, this.minDateField.date) !== 0 ||
                pkg.compareDates(d2, this.maxDateField.date) !== 0   )
            {
                var prev = this.getValue();
                this.minDateField.setValue(d1);
                this.maxDateField.setValue(d2);

                this.getCalendar().monthDaysGrid.retagModel();

                this._.fired(this, prev);
            }
        },

        function getValue() {
            return  {
                min : this.minDateField.date,
                max : this.maxDateField.date
            };
        }
    ]);

    ui.$configWith(pkg);
});
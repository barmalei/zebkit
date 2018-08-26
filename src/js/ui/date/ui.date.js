zebkit.package("ui.date", function(pkg, Class) {
    var ui           = zebkit.ui,
        compareDates = zebkit.util.compareDates,
        validateDate = zebkit.util.validateDate;

    /**
     * The package contains number of classes to implement
     * UI date related component like calendar, date field etc.
     *
     *     zebkit.require("ui", "ui.date", "layout", function(ui, date, layout) {
     *         var root = (new ui.zCanvas()).root;
     *         root.setFlowLayout("center", "center", "horizontal", 8);
     *
     *         // add calendar component
     *         root.add(new date.Calendar());
     *     });
     *
     * @class zebkit.ui.date
     * @access package
     */

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

    /**
     *  Shows the given month and year days. This is one of the core class that
     *  is widely used with other date UI component.
     *  @constructor
     *  @param {Date} [date] year to specify month and year to be shown
     *  @param {Integer}  [month] a month to be shown
     *  @param {Integer}  [year] an year to be shown
     *  @class zebkit.ui.date.MonthDaysGrid
     *  @extends zebkit.ui.grid.Grid
     */

    /**
     * Fire when the specified month of the given year has been shown with the
     * component
     *
     *       monthDays.on("monthShown", function(src, prevMonth, prevYear) {
     *           ...
     *       });
     *
     * @event monthShown
     * @param  {zebkit.ui.date.MonthDaysGrid} src a source of the event
     * @param  {Integer} prevMonth a previous shown month
     * @param  {Integer} prevYear a previous shown year
     */

    /**
     * Fire when the given date has been selected
     *
     *       monthDays.on("dateSelected", function(src, item, b) {
     *           ...
     *       });
     *
     * @event dateSelected
     * @param  {zebkit.ui.date.MonthDaysGrid} src a source of the event
     * @param  {zebkit.ui.date.MonthDaysGrid.DayPan} item a selected item
     * @param  {Boolean} b true if fate has been selected, false if the date has
     * been de-selected
     */
    pkg.MonthDaysGrid = Class(ui.grid.Grid, [
        function() {
            this.tags = {};
            this.$super(6, 7);

            this.setSelectMode(new this.clazz.DaySelectMode(this));
            this.setNavigationMode("cell");

            // pre-fill model with data
            for(var i = 0; i < this.model.rows * this.model.cols; i++) {
                this.model.puti(i, new this.clazz.DayPan());
            }

            this.add("top", new this.clazz.GridCaption());

            if (arguments.length > 0) {
                this.setMonthToShow.apply(this, arguments);
            }
        },

        function $clazz() {
            this.DaySelectMode = Class(zebkit.ui.grid.CellSelectMode, [
                function(target) {
                    this.$super(target);
                    this.selectedItems = {};
                },

                function $prototype() {
                    this.posChanged = function(pos, prevOffset, prevLine, prevCol) {};

                    this.isSelected = function (row, col) {
                        if (this.target.hasMonthShown() && row >= 0 && col >= 0) {
                            var idx = this.$idx(this.target.model.get(row, col));
                            return idx !== null ? this.selectedItems[idx] !== undefined
                                                : false;
                        } else {
                            return false;
                        }
                    };

                    this.clearSelect = function() {
                        for(var row = 0; row < this.target.model.rows; row++) {
                            for(var col = 0; col < this.target.model.cols; col++) {
                                if (this.isSelected(row, col)) {
                                    var idx  = this.$idx(this.target.model.get(row, col));
                                    delete this.selectedItems[idx];
                                    this.fireSelected(row, col, false);
                                }
                            }
                        }
                    };

                    this.select = function(row, col, b) {
                        var model = this.target.model;
                        if (row >= 0 && col >= 0) {
                            this.clearSelect();
                            var item = this.target.model.get(row, col);
                            if (this.isSelected(row, col) !== b && this.target.isDaySelectable(item)) {
                                this.selectedItems[this.$idx(item)] = {
                                    day   : item.day,
                                    month : item.month,
                                    year  : item.year
                                };
                                this.fireSelected(row, col, b);
                                this.target.repaint();
                            }
                        }
                    };

                    this.uninstall = function() {
                        this.selectedItems = {};
                    };

                    this.$idx = function(item) {
                        if (item.day >= 0 && item.month >= 0 && item.year >= 0) {
                            return 10000000 * item.day + 100000 * item.month + item.year;
                        } else {
                            return null;
                        }
                    };

                    this.getFirstSelected = function() {
                        for (var selected in this.selectedItems) {
                            var item = this.selectedItems[selected];
                            return new Date(item.year, item.month, item.day);
                        }
                        return null;
                    };
                },

                function fireSelected(row, col, b) {
                    this.$super(row, col, b);
                    var day = this.target.model.get(row, col);
                    this.target.dateSelected(day, b);
                }
            ]);

            /**
             * Day panel element class.
             * @constructor
             * @class zebkit.ui.date.MonthDaysGrid.DayPan
             * @extends {zebkit.ui.Panel}
             */
            this.DayPan = Class(ui.Panel, [
                function() {
                    this.tags  = [];
                    this.icon  = new this.clazz.IconPan();
                    this.label = new this.clazz.Label();
                    this.$super();
                    this.add(this.icon);
                    this.add(this.label);
                },

                function $clazz() {
                    this.Label   = Class(ui.Label, [
                        function() {
                            this.$super(new zebkit.draw.DecoratedTextRender(""));
                        },

                        function setTextDecorations() {
                            this.view.setDecorations.apply(this.view, arguments);
                            this.repaint();
                            return this;
                        },

                        function setTextDecorationsColor(c) {
                            this.view.lineColor = c;
                            this.repaint();
                            return this;
                        }
                    ]);

                    this.IconPan = Class(ui.ViewPan, []);
                },

                function $prototype() {
                    /**
                     * Assigned tags list.
                     * @attribute tags
                     * @type {Array}
                     * @readOnly
                     * @private
                     */
                    this.tags = null;

                    /**
                     * A month day
                     * @attribute day
                     * @type {Integer}
                     * @default -1
                     * @readOnly
                     */
                    this.day = -1;

                    /**
                     * A month.
                     * @attribute month
                     * @type {Integer}
                     * @default -1
                     * @readOnly
                     */
                    this.month = -1;

                    /**
                     * An year.
                     * @attribute year
                     * @type {Integer}
                     * @default -1
                     * @readOnly
                     */
                    this.year = -1;

                    /**
                     * Set the specified related to the panel date.
                     * @param {Integer} day   a month day
                     * @param {Integer} month a month
                     * @param {Integer} year  an year
                     * @method setValue
                     * @chainable
                     */
                    this.setValue = function(day, month, year) {
                        this.day   = day;
                        this.month = month;
                        this.year  = year;
                        this.label.setValue("" + day);
                        return this;
                    };

                    /**
                     * Add the specified tag to the given day panel
                     * @param  {String} tag a tag name
                     * @return {Boolean} true if the tag has been added
                     * @method tag
                     */
                    this.tag = function(tag) {
                        if (tag === null || tag === undefined) {
                            throw new Error("Undefined tag name");
                        }

                        if (this.tags.indexOf(tag) < 0) {
                            this.tags.push(tag);
                            return true;
                        } else {
                            return false;
                        }
                    };
                    /**
                     * Remove the specified tag or all tags for the given day panel
                     * @param  {String} [tag] a tag name to be removed. All assigned
                     * tags will be removed if the argument has not been specified.
                     * @return {Boolean} true if the tag or tags have been removed
                     * @method untag
                     */
                    this.untag = function(tag) {
                        if (arguments.length === 0) {
                            var len = this.tags.length;
                            if (len > 0) {
                                this.tags.length = 0;
                                this.tags        = [];
                                this.properties(this.clazz);
                            }
                            return len > 0;
                        } else  {
                            var i = this.tags.indexOf(tag);
                            if (i >= 0) {
                                this.tags.splice(i, 1);
                                return true;
                            } else {
                                return false;
                            }
                        }
                    };

                    /**
                     * Check if the day panel has the given tag;
                     * @param  {String}  a tag to be checked
                     * @return {Boolean} true if the given tag has been assigned to the day panel
                     * @method hasTag
                     */
                    this.hasTag = function(tag) {
                        return this.tags.indexOf(tag) >= 0;
                    };

                    /**
                     * Set text color.
                     * @param {String} c a color
                     * @method setColor
                     * @chainable
                     */
                    this.setColor = function(c) {
                        this.label.setColor(c);
                        return this;
                    };

                    /**
                     * Set text font
                     * @param {String | zebkit.Font} f a font
                     * @method setFont
                     * @chainable
                     */
                    this.setFont = function(c) {
                        this.label.setFont(c);
                        return this;
                    };

                    this.setTextDecorations = function() {
                        this.label.setTextDecorations.apply(this.label, arguments);
                        return this;
                    };

                    this.setTextDecorationsColor = function() {
                        this.label.setTextDecorationsColor.apply(this.label, arguments);
                        return this;
                    };
                }
            ]);

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

        /**
         * @for zebkit.ui.date.MonthDaysGrid
         */
        function $prototype() {
            /**
             * Custom tagger. The attribute is function that is called to tag
             * the given day panel item.
             * @attribute tagger
             * @type {Function}
             * @default null
             * @readOnly
             */
            this.tagger = null;

            /**
             * Shown month
             * @attribute month
             * @type {Integer}
             * @default -1
             * @readOnly
             */
            this.month = -1;

            /**
             * Shown month year
             * @attribute year
             * @type {Integer}
             * @default -1
             * @readOnly
             */
            this.year = -1;

            /**
             * Minimum possible selection date
             * @attribute minDate
             * @type {Date}
             * @default null
             * @readOnly
             */
            this.minDate = null;

            /**
             * Maximum possible selection date
             * @attribute maxDate
             * @type {Date}
             * @default null
             * @readOnly
             */
            this.maxDate = null;

            /**
             * Re-tag the grid model. The process assign the following tags to grid model items:
             *
             *    -  "prevMonth" - for model item that belong to previous month of the year
             *    -  "nextMonth" - for model item that belong to the next month of the year
             *    -  "notSelectable" - for model items that cannot be selected
             *    -  "today"         - for model item that matches current date
             *
             * @chainable
             * @method retagModel
             */
            this.retagModel = function() {
                var curDate = new Date(),
                    month   = curDate.getMonth(),
                    year    = curDate.getFullYear(),
                    day     = curDate.getDate();

                for(var i = 0; i < this.model.rows * this.model.cols; i++) {
                    var item = this.model.geti(i);
                    item.untag();

                    if (item.year < this.year || (item.year === this.year && item.month < this.month)) {
                        item.tag("prevMonth");
                    } else if (item.year > this.year || (item.year === this.year && item.month > this.month)) {
                        item.tag("nextMonth");
                    } else {
                        item.tag("shownMonth");
                    }

                    if (this.isDaySelectable(item) === false) {
                        item.tag("notSelectable");
                    }

                    if (this.tagger !== null) {
                        this.tagger(item);
                    }

                    if (item.day === day && item.month === month && item.year === year) {
                        item.tag("today");
                    }

                    for(var j = 0; j < item.tags.length; j++) {
                        var k = item.tags[j];
                        if (this.tags[k] !== undefined && this.tags[k] !== null) {
                            item.properties(this.tags[k]);
                        }
                    }
                }

                this.vrp();
            };

            /**
             * Set date range possible for selection
             * @param {Date} min a minimal possible selection date or null
             * @param {Date} max a maximal possible selection date or null
             * @method setDateRange
             * @chainable
             */
            this.setDateRange = function(min, max) {
                if (min !== null) {
                    validateDate(min);
                }

                if (max !== null) {
                    validateDate(max);
                }

                var b       = false,
                    prevMin = this.minDate,
                    prevMax = this.maxDate;

                if (min !== this.minDate && compareDates(this.minDate, min) !== 0) {
                    b = true;
                    this.minDate = min;
                }

                if (max !== this.maxDate && compareDates(this.maxDate, max) !== 0) {
                    b = true;
                    this.maxDate = max;
                }

                if (compareDates(this.minDate, this.maxDate) === 1) {
                    this.maxDate = prevMax;
                    this.minDate = prevMin;
                    throw new RangeError("Date range is not valid : [" + min + ", " + max + "]");
                }

                if (b) {
                    this.clearSelect();
                    this.retagModel();
                    if (this.dateRangeUpdated !== undefined) {
                        this.dateRangeUpdated(prevMin, prevMax);
                    }
                }

                return this;
            };

            /**
             * Test if the month days have a month shown.
             * @method hasMonthShown
             * @return {Boolean} true if a month is shown
             */
            this.hasMonthShown = function() {
                return this.month >= 0 && this.year;
            };

            /**
             * Set maximal possible selection date
             * @param {Date} date a maximal possible selection date or null
             * @method setMaxDate
             * @chainable
             */
            this.setMaxDate = function(date) {
                this.setDateRange(this.minDate, date);
                return this;
            };

            /**
             * Set minimal possible selection date
             * @param {Date} date a minimal possible selection date or null
             * @method setMinDate
             * @chainable
             */
            this.setMinDate = function(date) {
                this.setDateRange(date, this.maxDate);
                return this;
            };

            /**
             * Test if the given month can be shown
             * @param  {Integer} month a month
             * @param  {Integer} year  a year
             * @return {Boolean} true if the month can be shown
             * @method  canMonthBeShown
             */
            this.canMonthBeShown = function(month, year) {
                return true;
            };

            /**
             * Set a month and an year with the given arguments. If no parameters
             * have been passed the current date year and month will be set.
             * @param {Date} [date] a date object.
             * @param {Integer} [month] a month.
             * @param {Integer} [year] a full year.
             * @method setMonthToShow
             * @chainable
             */
            this.setMonthToShow = function(month, year) {
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

                validateDate(month, year);

                if (this.canMonthBeShown(month, year) && this.month !== month || this.year !== year) {
                    var prevYear  = this.year,
                        prevMonth = this.month;

                    this.month = month;
                    this.year  = year;

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
                        this.model.geti(i).setValue(
                            pdays - firstWeekDay + i + 1,
                            pdate.getMonth(),
                            pdate.getFullYear()
                        );
                    }

                    for(d = 1; d <= date.daysInMonth(); i++, d++) {
                        this.model.geti(i).setValue(d, month, year);
                    }

                    for(d = 1; i < this.model.rows * this.model.cols; i++, d++) {
                        this.model.geti(i).setValue(d, ndate.getMonth(), ndate.getFullYear());
                    }

                    this.retagModel();
                    if (this.monthShown !== undefined) {
                        this.monthShown(prevMonth, prevYear);
                    }
                    this.fire("monthShown", [this, prevMonth, prevYear]);
                }
                return this;
            };

            /**
             * Set the current date month shown.
             * @chainable
             * @method setCurrentMonthToShow
             */
            this.setCurrentMonthToShow = function() {
                this.setMonthToShow(new Date());
                return this;
            };

            /**
             * Set the next date month to show
             * @chainable
             * @method setNextMonthToShow
             */
            this.setNextMonthToShow = function() {
                if (this.month < 0) {
                    this.setMonthToShow(0, 1900);
                } else {
                    var d = new Date(this.year,
                                     this.month).nextMonth();
                    this.setMonthToShow(d.getMonth(), d.getFullYear());
                }
                return this;
            };

            /**
             * Set the previous date month to show.
             * @chainable
             * @method setPrevMonthToShow
             */
            this.setPrevMonthToShow = function() {
                if (this.month < 0) {
                    this.setMonthToShow(0, 1900);
                } else {
                    var d = new Date(this.year,
                                     this.month).prevMonth();
                    this.setMonthToShow(d.getMonth(), d.getFullYear());
                }
                return this;
            };

            /**
             * Set the next year with the current month to show.
             * @chainable
             * @method setNextYearToShow
             */
            this.setNextYearToShow = function() {
                this.setMonthToShow(this.month, this.year + 1);
                return this;
            };

            /**
             * Set the next year with the current month to show.
             * @chainable
             * @method setSelectedToShow
             */
            this.setSelectedToShow = function() {
                var selected = this.selectMode.getFirstSelected();
                if (selected !== null) {
                    this.setMonthToShow(selected);
                }
                return this;
            };

            this.getFirstSelected = function() {
                return this.selectMode.getFirstSelected();
            };

            /**
             * Set the previous year with the current month to show.
             * @chainable
             * @method setNextYearToShow
             */
            this.setPrevYearToShow = function () {
                this.setMonthToShow(this.month, this.year - 1);
                return this;
            };

            /**
             * Test if the given day is selectable
             * @param  {zebkit.ui.date.DayPan} item a day panel
             * @return {Boolean} true if the given day is selectable
             * @method isDaySelectable
             */
            this.isDaySelectable = function(item) {
                return  (this.minDate === null || compareDates(item.day, item.month, item.year, this.minDate) >= 0) &&
                        (this.maxDate === null || compareDates(item.day, item.month, item.year, this.maxDate) <= 0);
            };

            this.pointerMoved = function(e) {
                var p = this.cellByLocation(e.x, e.y);
                if (p !== null) {
                    this.position.setRowCol(p.row, p.col);
                } else {
                    this.position.setOffset(null);
                }
            };

            this.pointerExited = function(e) {
                this.position.setOffset(null);
            };

            /**
             * Set days tagger function.
             * @param {Function} tagger a tagger function
             * @method setTagger
             * @chainable
             */
            this.setTagger = function(tagger) {
                if (this.tagger !== tagger) {
                    this.tagger = tagger;
                    this.retagModel();
                }
                return this;
            };

            /**
             * Set the visual properties for the tags.
             * @param {Object} tags set visual properties for the given tags
             * @chainable
             * @method setTagsDecoration
             * @example
             *
             *     //  render previous month day with gray color
             *     //  and next month with light gray color
             *     daysGrid.setTagsDecoration({
             *         "prevMonth" : {
             *             "color" : "lightGray"
             *          },
             *
             *          "nextMonth" : {
             *              "color" : "lightGray"
             *          }
             *      });
             */
            this.setTagsDecoration = function(tags) {
                this.tags = zebkit.clone(tags);
                this.vrp();
                return this;
            };

            /**
             * Add visual properties for the given tags set
             * @param {Object} tags [description]
             * @chainable
             * @method addTagsDecoration
             */
            this.addTagsDecoration = function(tags) {
                for(var k in tags) {
                    this.tags[k] = zebkit.clone(tags[k]);
                }
                this.vrp();
                return this;
            };

            /**
             * Set decoration for the given tag.
             * @param {String} tag a tag name
             * @param {Object} p  a tag decoration
             * @chainable
             * @method setTagDecoration
             */
            this.setTagDecoration = function(tag, p) {
                if (p === null) {
                    delete this.tags[tag];
                } else {
                    this.tags[tag] = zebkit.clone(p);
                }
                this.vrp();
                return this;
            };

            /**
             * Day selected callback function.
             * @param  {zebkit.ui.date.MonthDaysGrid.Daypan} item a day panel
             * @param  {Boolean} b  a selection cell state
             * @method dateSelected
             * @protected
             */
            this.dateSelected = function(item, b) {
                this.fire("dateSelected", [ this, item, b] );
            };

            /**
             * Select the specified date and show appropriate month of
             * selected date year.
             * @param  {Integer} day   a day
             * @param  {Integer} month a month
             * @param  {Integer} year  an year
             * @chainable
             * @method selectDate
             */
            this.selectDate = function(day, month, year) {
                if (day === null) {
                    this.clearSelect();
                } else {
                    if (arguments.length === 0) {
                        day = new Date();
                    }


                    if (day instanceof Date) {
                        month = day.getMonth();
                        year  = day.getFullYear();
                        day   = day.getDate();
                    }

                    this.setMonthToShow(month, year);

                    for(var r = 0; r < this.model.rows; r++) {
                        for(var c = 0; c < this.model.cols; c++) {
                            var item = this.model.get(r, c);
                            if (item.year === year && item.day === day && item.month === month) {
                                this.select(r, c, true);
                                break;
                            }
                        }
                    }
                }
                return this;
            };
        },

        function keyPressed(e) {
            if (e.code === "Enter") {
                this.select(this.position.currentLine, this.position.currentCol, true);
            }
            this.$super(e);
        },

        function pointerClicked(e) {
            this.$super(e);
            var p = this.cellByLocation(e.x, e.y);
            if (p !== null) {
                this.select(p.row, p.col, true);
            }
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
            return this.isDaySelectable(item) === false ? this.views.notSelectableMarker
                                                        : this.$super();
        }

    ]).events("monthShown", "dateSelected");

    /**
     * Calendar component. This component is supposed to be used to select a single date
     * with the help of provided UI.
     *
     *
     *      var c = new zebkit.ui.date.Calendar();
     *      var z = new zebkit.ui.zCanvas();
     *      z.root.setFlowLayout();
     *      z.root.add(c);
     *
     * @param  {Date} [date] a date to be set
     * @class zebkit.ui.date.Calendar
     * @extends zebkit.ui.Panel
     * @uses zebkit.ui.FireEventRepeatedly
     * @constructor
     */

    /**
     * Fire when the date has been selected or de-selected.
     *
     *       calendar.on("dateSelected", function(src, date, b) {
     *           ...
     *       });
     *
     * @event dateSelected
     * @param  {zebkit.ui.date.Calendar} src a source of the event
     * @param  {Date} date a date that has been selected.
     * @param  {Boolean} b a selection state.
     */
    pkg.Calendar = new Class(ui.Panel, [
        function(date) {
            if (arguments.length === 0) {
                date = new Date();
            }

            var $this = this;
            this.$super(new zebkit.layout.BorderLayout());

            this.monthDays = new pkg.MonthDaysGrid([
                function monthShown(prevMonth, prevYear) {
                    $this.comboMonth.select(this.month);
                    $this.yearField.setValue("" + this.year);

                    var v = $this.getValue();
                    $this.byPath("#dotButton").setEnabled(v !== null &&
                                                          (this.year  !== v.getFullYear() ||
                                                           this.month !== v.getMonth()       ));

                    $this.repaint();
                    $this.fire("monthShown", [$this, prevMonth, prevYear]);
                },

                function dateSelected(item, b) {
                    if (b === true) {
                        if (item.tags.length > 0) {
                            if (item.hasTag("nextMonth") === true) {
                                $this.monthDays.setNextMonthToShow();
                            } else if (item.hasTag("prevMonth") === true) {
                                $this.monthDays.setPrevMonthToShow();
                            }
                        }
                        $this.dateSelected(new Date(item.year, item.month, item.day), b);
                    } else {
                        $this.dateSelected(new Date(item.year, item.month, item.day), b);
                    }

                    this.$super(item, b);
                }
            ]);

            this.comboMonth = new this.clazz.MonthsCombo();
            this.comboMonth.setMaxPadHeight(200);
            this.comboMonth.on("selected", function(src) {
                var m = src.getSelectedMonth();
                $this.monthDays.setMonthToShow(m.value, $this.monthDays.year);
            });

            this.yearField = new this.clazz.YearField("", [
                function keyPressed(e) {
                    switch (e.code) {
                        case "ArrowUp"  : $this.monthDays.setNextYearToShow(); break;
                        case "ArrowDown": $this.monthDays.setPrevYearToShow(); break;
                        default: return this.$super(e);
                    }
                }
            ]);

            var topPan = new this.clazz.InfoPan({
                layout: new zebkit.layout.BorderLayout(),
                kids  : {
                    right: new ui.Panel({
                        layout : new zebkit.layout.FlowLayout("center", "center"),
                        kids   : [
                            this.comboMonth,
                            new ui.Panel({
                                layout : new zebkit.layout.BorderLayout(),
                                kids   : {
                                    center : this.yearField,
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
                    })
                }
            });

            this.add("top", topPan);
            this.add("center", this.monthDays);

            this.byPath("#dotButton").on(function() {
                $this.monthDays.setSelectedToShow();
            });

            this.byPath("#leftButton").on(function() {
                $this.monthDays.setPrevMonthToShow();
            });

            this.byPath("#rightButton").on(function() {
                $this.monthDays.setNextMonthToShow();
            });

            this.byPath("#topButton").on(function() {
                $this.monthDays.setNextYearToShow();
            });

            this.byPath("#bottomButton").on(function() {
                $this.monthDays.setPrevYearToShow();
            });

            this.monthDays.selectDate(date);
        },

        function $clazz() {
            this.LeftArrowButton   = Class(ui.ArrowButton, []);
            this.TopArrowButton    = Class(ui.ArrowButton, []);
            this.BottomArrowButton = Class(ui.ArrowButton, []);
            this.RightArrowButton  = Class(ui.ArrowButton, []);
            this.Link              = Class(ui.Link, []);

            this.DotButton = Class(ui.EvStatePan, ui.FireEventRepeatedly, []).events("fired");

            /**
             * Combo box component to render and host selectable list of months.
             * @constructor
             * @extends zebkit.ui.Combo
             * @class  zebkit.ui.date.Calendar.MonthsCombo
             */
            this.MonthsCombo = Class(ui.Combo, [
                function() {
                    this.$super(new this.clazz.CompList(true));
                    this.button.removeMe();
                },

                function $clazz() {
                    this.Label = Class(ui.Label, [
                        function(month) {
                            this.$super(month.name);
                            this.month = {
                                name     : month.name,
                                value    : month.value,
                                nickname : month.nickname
                            };
                        }
                    ]);

                    this.CompList = Class(ui.CompList, []);
                },

                function $prototype() {
                    /**
                     * Set the list of months.
                     * @param {Array} array of months. It is expected every item in the array is:
                     *
                     *      {
                     *          name     : "<name of month>",
                     *          nickname : "<short name of month>",
                     *          value    : an integer number of the month
                     *      }
                     *
                     * @method setMonths
                     * @chainable
                     */
                    this.setMonths = function(months) {
                        this.list.model.removeAll();
                        for(var i = 0; i < months.length; i++) {
                            this.list.model.add(new this.clazz.Label(months[i]));
                        }
                        return this;
                    };

                    /**
                     * Get selected month item.
                     * @return {object} a selected month as a the following structure:
                     *
                     *      {
                     *          name     : "<name of month>",
                     *          nickname : "<short name of month>",
                     *          value    : an integer number of the month
                     *      }
                     *
                     * @method getSelectedMonth
                     */
                    this.getSelectedMonth = function() {
                        var s = this.list.getSelected();
                        if (s === null) {
                            return null;
                        } else {
                            return {
                                name     : s.month.name,
                                value    : s.month.value,
                                nickname : s.month.nickname
                            };
                        }
                    };

                    this.padShown = function(b) {
                        if (b === true) {
                            this.list.makeSelectedVisible();
                            //this.list.position.setOffset(0);
                        }
                    };
                }
            ]);

            this.InfoPan = Class(ui.Panel, []);

            this.YearField = Class(ui.TextField, []);
        },

        /**
         * @for zebkit.ui.date.Calendar
         */
        function $prototype() {
            /**
             * Combo box component to show list of months.
             * @attribute comboMonth
             * @type {zebkit.ui.date.Calendar.Combo}
             * @readOnly
             */
            this.comboMonth = null;

            /**
             * Month days
             * @attribute monthDays
             * @type {zebkit.ui.date.MonthDaysGrid}
             * @readOnly
             */
            this.monthDays = null;

            /**
             * Year selection field.
             * @attribute yearField
             * @type {zebkit.ui.date.Calendar.YearField}
             * @readOnly
             */
            this.yearField = null;

            /**
             * Get a selected date.
             * @return {Date} a selected date
             * @method getValue
             */
            this.getValue = function() {
                return this.monthDays.getFirstSelected();
            };

            /**
             * Set the given date as selected.
             * @return {Date} date a date to be selected
             * @method setValue
             * @chainable
             */
            this.setValue = function() {
                this.monthDays.selectDate.apply(this.monthDays, arguments);
                return this;
            };

            /**
             * Set the date range. Date selection is possible only withing the range.
             * @param minDate a minimal possible date.
             * @param maxDate a maximal possible date.
             * @method setDateRange
             * @chainable
             */
            this.setDateRange = function() {
                this.monthDays.setDateRange.apply(this.monthDays, arguments);
                return this;
            };

            /**
             * Set minimal possible date
             * @param minDate a minimal possible date.
             * @method setMinDate
             * @chainable
             */
            this.setMinDate = function() {
                this.monthDays.setMinDate.apply(this.monthDays, arguments);
                return this;
            };

            /**
             * Set maximal possible date
             * @param mazDate a maximal possible date.
             * @method setMaxDate
             * @chainable
             */
            this.setMaxDate = function() {
                this.monthDays.setMaxDate.apply(this.monthDays, arguments);
                return this;
            };

            /**
             * Method that is called every time a new date has been selected
             * @param  {Date} date a date that has been selected
             * @param  {Boolean} b indicates if the date has been selected or de-selected
             * @method dateSelected
             * @protected
             */
            this.dateSelected = function(date, b) {
                this.byPath("#dotButton").setEnabled(false);
                this.fire("dateSelected", [this, date]);
            };
        }
    ]).events("dateSelected", "monthShown");


    /**
     * Text field component to keep formated with the specified pattern date. The pattern
     * can consists of from the placeholders where every placeholder is a formatted value
     * of a property of Date object:
     *
     *      ${N,K,<date_object_property>}
     *
     *     N - length of the field
     *     K - character to fulfill
     *
     *  For example "${2,0,date}/${2,0,month2}/${4,0,fullYear}" pattern represents "Day/Month/Year"
     *  date format ("22/12/1997").
     *
     * @param  {String} [format] format string
     * @constructor
     * @class zebkit.ui.date.DateTextField
     * @extends zebkit.ui.TextField
     */
    pkg.DateTextField = Class(ui.TextField, [
        function(format) {
            if (arguments.length === 0) {
                format = "${2,0,date}/${2,0,month2}/${4,0,fullYear}";
            }

            this.$super();
            this.setFormat(format);


            // this.on("updated", function(src) {

            //     var parser = /([0-9][0-9])\s*[\/\-]\s*([0-9][0-9])\s*[\/\-]\s*([0-9][0-9][0-9][0-9])/;
            //     var v = src.getValue();
            //     var m = v.match(parser);
            //     if (m !== null) {
            //         src.setColor("black");
            //     } else {
            //         var prev = src.date;
            //         src.date = null;
            //         if (src.date !== null) {
            //             src.fire("dateSelected", [src, prev, false]);
            //         }

            //         src.setColor("red");
            //     }
            // });

            // this.setEditable(true);
        },

        function $prototype() {
            this.notDefined = "-";

            this.$maxWidth = 0;

            /**
             * Date value
             * @attribute date
             * @type {Date}
             * @readOnly
             * @default null
             */
            this.date = null;

            this.$format = function(d) {
                return zebkit.util.format(this.format, d !== null ? d :{}, this.notDefined);
            };
        },

        /**
         * Set the pattern to be used to format date
         * @param {String} format a format pattern
         * @method setFormat
         * @chainable
         */
        function setFormat(format) {
            if (format === null || format === undefined) {
                throw new Error("Format is not defined " + this.clazz.$name);
            }

            if (this.format !== format) {
                this.format = format;
                this.$getSuper("setValue").call(this, this.$format(this.date));
            }

            return this;
        },

        function setValue(d) {
            if (d !== null) {
                validateDate(d);
            }

            if (compareDates(this.date, d) !== 0) {
                this.date = d;
                this.$super(this.$format(this.date));
            }
        },

        function calcPreferredSize(target) {
            var ps = this.$super(target);
            ps.width = this.$maxWidth;
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
            this.$maxWidth = this.getFont().stringWidth(s);
            this.$maxWidth += Math.floor(this.$maxWidth / 10);
        }
    ]).events("dateSelected");

    /**
     * Popup calendar interface. The interface should be mixed to components that
     * need to show popup calendar.
     * @class zebkit.ui.date.PopupCalendarMix
     * @interface zebkit.ui.date.PopupCalendarMix
     */
    pkg.PopupCalendarMix = zebkit.Interface([
        function childKeyPressed(e) {
            if (e.code === "Enter") {
                this.showCalendar(e.source);
            } else if (e.code === "Backspace") {
                //
            }
        },

        /**
         * Get calendar component.
         * @return {zebkit.ui.date.Calendar} a calendar
         * @method getCalendar
         */
        function getCalendar() {
            if (this.clazz.$name === undefined) {
                throw new Error();
            }

            if (this.calendar === undefined || this.calendar === null) {
                var $this = this;

                this.$freezeCalendar = false;

                this.calendar = new pkg.Calendar([
                    function $clazz() {
                        this.MonthsCombo.$name = "INNER";
                    },

                    function winActivated(e) {
                        if (e.isActive === false) {
                            $this.hideCalendar();
                        }
                    },

                    function childKeyPressed(e){
                        if (e.code === "Escape") {
                            $this.hideCalendar();
                        }
                    },

                    function dateSelected(date, b) {
                        this.$super(date, b);
                        if (date !== null && b) {
                            if ($this.$freezeCalendar === false) {
                                if ($this.dateSelected !== undefined) {
                                    $this.dateSelected.call($this, date, b);
                                }
                                $this.hideCalendar();
                            }
                        }
                    }
                ]);
            }
            return this.calendar;
        },

        /**
         * Show calendar as popup window for the given anchor component
         * @param  {zebkit.ui.Panel} anchor an anchor component.
         * @chainable
         * @method showCalendar
         */
        function showCalendar(anchor) {
            try {
                this.$freezeCalendar = true;
                this.hideCalendar();

                var calendar = this.getCalendar();
                this.$anchor = anchor;

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
                calendar.monthDays.requestFocus();

                if (this.calendarShown !== undefined) {
                    this.calendarShown(this.calendar);
                }
            } finally {
                this.$freezeCalendar = false;
            }

            return this;
        },

        /**
         * Hide calendar that has been shown as popup window.
         * @chainable
         * @method hideCalendar
         */
        function hideCalendar() {
            if (this.calendar !== undefined && this.calendar !== null) {
                var calendar = this.getCalendar();
                if (calendar.parent !== null) {
                    calendar.removeMe();
                    if (this.calendarHidden !== undefined) {
                        this.calendarHidden();
                    }
                    this.$anchor.requestFocus();
                    this.$anchor = null;
                }
            }
            return this;
        }
    ]);

    /**
     * Input field to specify a date.
     * @param  {String} [format] a date format
     * @constructor
     * @class zebkit.ui.date.DateInputField
     * @extends {zebkit.ui.Panel}
     * @uses zebkit.ui.date.PopupCalendarMix
     */

    /**
     * Fire when a date has been selected or de-selected.
     *
     *       dateInputField.on("dateSelected", function(src, date, b) {
     *           ...
     *       });
     *
     * @event dateSelected
     * @param  {zebkit.ui.date.DateInputField} src a source of the event
     * @param  {Date} date a new date that has been selected.
     * @param  {Boolean} b a selection state
     */
    pkg.DateInputField = Class(ui.Panel, pkg.PopupCalendarMix, [
        function (format) {
            this.$super(new zebkit.layout.FlowLayout());

            var $this = this;
            this.dateField = arguments.length === 0 ? new this.clazz.DateTextField()
                                                    : new this.clazz.DateTextField(format);
            this.add(this.dateField);
            this.add(new this.clazz.Button("...")).on(function(src) {
                $this.showCalendar($this.dateField);
            });

            // sync calendar and input field dates
            this.dateField.setValue(this.getValue());
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

        function $prototype() {
            this.dateSelected = function(date, b) {
                this.dateField.setValue(date);
                this.fire("dateSelected", [this, date, b]);
            };

            /**
             * Set the selected date.
             * @param {Date} d a date
             * @method setValue
             * @chainable
             */
            this.setValue = function(d) {
                this.getCalendar().selectValue(d);
                return this;
            };

            /**
             * Get the selected date.
             * @return {Date} a selected date.
             * @method getValue
             * @chainable
             */
            this.getValue = function() {
                return this.getCalendar().getValue();
            };
        }
    ]).events("dateSelected");

    /**
     * Input field to enter a date range.
     * @constructor
     * @class zebkit.ui.date.DateRangeInput
     * @uses zebkit.ui.date.PopupCalendarMix
     * @extends {zebkit.ui.Panel}
     */

    /**
     * Fire when a new date range has been selected.
     *
     *       dateRangeInput.on("dateRangeSelected", function(src, prevRange) {
     *           ...
     *       });
     *
     * @event dateRangeSelected
     * @param  {zebkit.ui.date.DateRangeInput} src a source of the event
     * @param  {Object} prevRange a previous range. The object has the
     * following structure:
     *
     *      {
     *         min : {Date},
     *         max : {Date}
     *      }
     *
     */
    pkg.DateRangeInput = Class(ui.Panel, pkg.PopupCalendarMix, [
        function() {
            this.$super();

            var $this = this,
                la    = new this.clazz.LeftArrowButton(),
                ra    = new this.clazz.RightArrowButton();

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

            var cal = this.getCalendar();
            cal.monthDays.setTagger((function(item) {
                if (compareDates(item.day, item.month, item.year, $this.minDateField.date) === 0) {
                    item.tag("startDate");
                } else if (compareDates(item.day, item.month, item.year, $this.maxDateField.date) === 0) {
                    item.tag("endDate");
                }
            }));

            if (this.clazz.tags !== undefined &&  this.clazz.tags !== null) {
                cal.monthDays.addTagsDecoration(this.clazz.tags);
            }

            this.add(new this.clazz.DateInputPan(la, this.minDateField));
            this.add(new this.clazz.Line());
            this.add(new this.clazz.DateInputPan(this.maxDateField, ra));

            la.on(function () {
                $this.getCalendar().monthDays.setMaxDate($this.maxDateField.date);
                $this.showCalendar($this.minDateField);
            });

            ra.on(function () {
                $this.getCalendar().monthDays.setMinDate($this.minDateField.date);
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
            if (this.$anchor === this.minDateField) {
                calendar.setValue(this.minDateField.date);
                calendar.monthDays.setDateRange(null, this.maxDateField.date);
            } else {
                calendar.setValue(this.maxDateField.date);
                calendar.monthDays.setDateRange(this.minDateField.date, null);
            }
        },

        function dateSelected(date, b) {
            if (b === true) {
                this.setValue(this.$anchor === this.minDateField ? date : this.minDateField.date,
                              this.$anchor === this.maxDateField ? date : this.maxDateField.date);
            }
        },

        /**
         * Set the given date range.
         * @param {Date} d1 a minimal possible date
         * @param {Date} d2 a maximal possible date
         * @method setValue
         */
        function setValue(d1, d2) {
            if (compareDates(d1, d2) === 1) {
                throw new RangeError();
            }

            if (compareDates(d1, this.minDateField.date) !== 0 ||
                compareDates(d2, this.maxDateField.date) !== 0   )
            {
                var prev = this.getValue();
                this.minDateField.setValue(d1);
                this.maxDateField.setValue(d2);

                this.getCalendar().monthDays.retagModel();

                this.fire("dateRangeSelected", [this, prev]);
                if (this.dateRangeSelected !== undefined) {
                    this.dateRangeSelected(prev);
                }
            }
        },

        /**
         * Get current date range.
         * @return {Object} a date range object:
         *
         *     {
         *         min : {Date},
         *         max : {Date}
         *      }
         *
         * @method getValue
         */
        function getValue() {
            return  {
                min : this.minDateField.date,
                max : this.maxDateField.date
            };
        }
    ]).events("dateRangeSelected");
}, true);
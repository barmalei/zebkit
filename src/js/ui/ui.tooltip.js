zebkit.package("ui", function(pkg, Class) {
    /**
     * Tooltip UI component. The component can be used as a tooltip that shows specified content in
     * figured border.
     * @class  zebkit.ui.Tooltip
     * @param  {zebkit.util.Panel|String} a content component or test label to be shown in tooltip
     * @constructor
     * @extends zebkit.ui.Panel
     */
    pkg.Tooltip = Class(pkg.Panel, [
        function(content) {
            this.$super();
            if (arguments.length > 0) {
                this.add(pkg.$component(content, this));
                this.toPreferredSize();
            }
        },

        function $clazz() {
            this.Label = Class(pkg.Label, []);

            this.ImageLabel = Class(pkg.ImageLabel, []);

            this.TooltipBorder = Class(zebkit.draw.View, [
                function(col, size) {
                    if (arguments.length > 0) {
                        this.color = col;
                    }
                    if (arguments.length > 1) {
                        this.size  = size;
                    }
                    this.gap = 2 * this.size;
                },

                function $prototype() {
                    this.color = "black";
                    this.size  = 2;

                    this.paint = function (g,x,y,w,h,d) {
                        if (this.color !== null) {
                            this.outline(g,x,y,w,h,d);
                            g.setColor(this.color);
                            g.lineWidth = this.size;
                            g.stroke();
                        }
                    };

                    this.outline = function(g,x,y,w,h,d) {
                        g.beginPath();
                        h -= 2 * this.size;
                        w -= 2 * this.size;
                        x += this.size;
                        y += this.size;

                        var w2   = Math.round(w /2),
                            w3_8 = Math.round((3 * w)/8),
                            h2_3 = Math.round((2 * h)/3),
                            h3   = Math.round(h/3),
                            w4   = Math.round(w/4);

                        g.moveTo(x + w2, y);
                        g.quadraticCurveTo(x, y, x, y + h3);
                        g.quadraticCurveTo(x, y + h2_3, x + w4,  y + h2_3);
                        g.quadraticCurveTo(x + w4, y + h, x, y + h);
                        g.quadraticCurveTo(x + w3_8, y + h, x + w2, y + h2_3);
                        g.quadraticCurveTo(x + w, y + h2_3, x + w, y + h3);
                        g.quadraticCurveTo(x + w, y, x + w2, y);
                        g.closePath();
                        return true;
                    };
                }
            ]);
        },

        function recalc() {
            this.$contentPs = (this.kids.length === 0 ? this.$super()
                                                      : this.kids[0].getPreferredSize());
        },

        function getBottom() {
            return this.$super() + this.$contentPs.height;
        },

        function getTop() {
            return this.$super() + Math.round(this.$contentPs.height / 6);
        },

        function getLeft() {
            return this.$super() + Math.round(this.$contentPs.height / 6);
        },

        function getRight() {
            return this.$super() + Math.round(this.$contentPs.height / 6);
        }
    ]);

    /**
     * Popup window manager class. The manager registering and triggers showing context popup menu
     * and tooltips. Menu appearing is triggered by right pointer click or double fingers touch event.
     * To bind a popup menu to an UI component you can either set "tooltip" property of the component
     * with a popup menu instance:

            // create canvas
            var canvas = new zebkit.ui.zCanvas();

            // create menu with three items
            var m = new zebkit.ui.Menu();
            m.add("Menu Item 1");
            m.add("Menu Item 2");
            m.add("Menu Item 3");

            // bind the menu to root panel
            canvas.root.popup = m;

     * Or implement "getPopup(target,x,y)" method that can rule showing popup menu depending on
     * the current cursor location:

            // create canvas
            var canvas = new zebkit.ui.zCanvas();

            // visualize 50x50 pixels hot component spot
            // to which the context menu is bound
            canvas.root.paint = function(g) {
                g.setColor("red");
                g.fillRect(50,50,50,50);
            }

            // create menu with three items
            var m = new zebkit.ui.Menu();
            m.add("Menu Item 1");
            m.add("Menu Item 2");
            m.add("Menu Item 3");

            // implement "getPopup" method that shows popup menu only
            // if pointer cursor located at red rectangular area of the
            // component
            canvas.root.getPopup = function(target, x, y) {
                // test if pointer cursor position is in red spot area
                // and return context menu if it is true
                if (x > 50 && y > 50 && x < 100 && y <  100)  {
                    return m;
                }
                return null;
            }

     *  Defining a tooltip for an UI component follows the same approach. Other you
     *  define set "tooltip" property of your component with a component that has to
     *  be shown as the tooltip:

             // create canvas
             var canvas = new zebkit.ui.zCanvas();

             // create tooltip
             var t = new zebkit.ui.Label("Tooltip");
             t.setBorder("plain");
             t.setBackground("yellow");
             t.setPadding(6);

             // bind the tooltip to root panel
             canvas.root.popup = t;

    *  Or you can implement "getTooltip(target,x,y)" method if the tooltip showing depends on
    *  the pointer cursor location:


            // create canvas
            var canvas = new zebkit.ui.zCanvas();

            // create tooltip
            var t = new zebkit.ui.Label("Tooltip");
            t.setBorder("plain");
            t.setBackground("yellow");
            t.setPadding(6);

            // bind the tooltip to root panel
            canvas.root.getPopup = function(target, x, y) {
                return x < 10 && y < 10 ? t : null;
            };

     * @class zebkit.ui.TooltipManager
     * @extends zebkit.ui.event.Manager
     * @constructor
     */

     /**
      * Fired when a menu item has been selected

             zebkit.ui.events.on("menuItemSelected", function(menu, index, item) {
                 ...
             });

      *
      * @event menuItemSelected
      * @param {zebkit.ui.Menu} menu a menu component that triggers the event
      * @param {Integer}  index a menu item index that has been selected
      * @param {zebkit.ui.Panel} item a menu item component that has been selected
      */
    pkg.TooltipManager = Class(zebkit.ui.event.Manager, [
        function $prototype() {
            this.$tooltipX = this.$tooltipY = 0;
            this.$toolTask = this.$targetTooltipLayer = this.$tooltip = this.$target = null;

            /**
             * Indicates if a shown tooltip has to disappear by pointer pressed event
             * @attribute hideTooltipByPress
             * @type {Boolean}
             * @default true
             */
            this.hideTooltipByPress = true;

            /**
             * Define interval (in milliseconds) between entering a component and showing
             * a tooltip for the entered component
             * @attribute showTooltipIn
             * @type {Integer}
             * @default 400
             */
            this.showTooltipIn = 400;

            /**
             * Indicates if tool tip position has to be synchronized with pointer position
             * @attribute syncTooltipPosition
             * @type {Boolean}
             * @default true
             */
            this.syncTooltipPosition = true;

            /**
             * Define pointer clicked event handler
             * @param  {zebkit.ui.event.PointerEvent} e a pointer event
             * @method pointerClicked
             */
            // this.pointerClicked = function (e){

            //     // Right button
            //     // TODO: check if it is ok and compatible with touch
            //     if (this.isTriggeredWith(e)) {
            //         var popup = null;

            //         if (e.source.popup != null) {
            //             popup = e.source.popup;
            //         } else {
            //             if (e.source.getPopup != null) {
            //                 popup = e.source.getPopup(e.source, e.x, e.y);
            //             }
            //         }

            //         if (popup != null) {
            //             popup.setLocation(e.absX, e.absY);
            //             e.source.getCanvas().getLayer(pkg.PopupLayer.id).add(popup);
            //             popup.requestFocus();
            //         }
            //     }
            // };

            /**
             * Define pointer entered event handler
             * @param  {zebkit.ui.event.PointerEvent} e a pointer event
             * @method pointerEntered
             */
            this.pointerEntered = function(e) {
                if (this.$target === null &&
                    ((typeof e.source.tooltip !== 'undefined' && e.source.tooltip !== null) || typeof e.source.getTooltip !== 'undefined'))
                {
                    this.$target = e.source;
                    this.$targetTooltipLayer = e.source.getCanvas().getLayer("win");
                    this.$tooltipX = e.x;
                    this.$tooltipY = e.y;
                    this.$toolTask = zebkit.util.tasksSet.run(
                        this,
                        this.showTooltipIn,
                        this.showTooltipIn
                    );
                }
            };

            /**
             * Define pointer exited event handler
             * @param  {zebkit.ui.event.PointerEvent} e a pointer event
             * @method pointerExited
             */
            this.pointerExited = function(e) {
                // exited triggers tooltip hiding only for "info" tooltips
                if (this.$target !== null && (this.$tooltip === null || this.$tooltip.winType === "info")) {
                    this.stopShowingTooltip();
                }
            };

            /**
             * Define pointer moved event handler
             * @param  {zebkit.ui.event.PointerEvent} e a pointer event
             * @method pointerMoved
             */
            this.pointerMoved = function(e) {
                // to prevent handling pointer moved from component of mdi
                // tooltip we have to check if target equals to source
                // instead of just checking if target is not a null
                if (this.$target === e.source) {
                    // store a new location for a tooltip
                    this.$tooltipX = e.x;
                    this.$tooltipY = e.y;

                    // wake up task try showing a tooltip
                    // at the new location
                    if (this.$toolTask !== null) {
                        this.$toolTask.resume(this.showTooltipIn);
                    }
                }
            };

            /**
             * Task body method
             * @private
             * @param  {Task} t a task context
             * @method run
             */
            this.run = function(t) {
                if (this.$target !== null) {
                    var ntooltip = (typeof this.$target.tooltip !== 'undefined' &&
                                   this.$target.tooltip !== null) ? this.$target.tooltip
                                                                  : this.$target.getTooltip(this.$target,
                                                                                            this.$tooltipX,
                                                                                            this.$tooltipY),
                        p = null,
                        tx = 0,
                        ty = 0;

                    if (this.$tooltip !== ntooltip) {

                        // hide previously shown tooltip
                        if (this.$tooltip !== null) {
                            this.hideTooltip();
                        }

                        // set new tooltip
                        this.$tooltip = ntooltip;

                        // if new tooltip exists than show it
                        if (ntooltip !== null) {
                            p = zebkit.layout.toParentOrigin(this.$tooltipX, this.$tooltipY, this.$target);

                            this.$tooltip.toPreferredSize();
                            tx = p.x;
                            ty = p.y - this.$tooltip.height;

                            var dw = this.$targetTooltipLayer.width;

                            if (tx + this.$tooltip.width > dw) {
                                tx = dw - this.$tooltip.width - 1;
                            }

                            this.$tooltip.setLocation(tx < 0 ? 0 : tx, ty < 0 ? 0 : ty);

                            if (typeof this.$tooltip.winType === 'undefined') {
                                this.$tooltip.winType = "info";
                            }

                            this.$targetTooltipLayer.add(this.$tooltip);
                            if (this.$tooltip.winType !== "info") {
                                pkg.activateWindow(this.$tooltip);
                            }
                        }
                    } else {
                        if (this.$tooltip !== null && this.syncTooltipPosition === true) {
                            p  = zebkit.layout.toParentOrigin(this.$tooltipX,
                                                              this.$tooltipY,
                                                              this.$target);
                            tx = p.x;
                            ty = p.y - this.$tooltip.height;

                            this.$tooltip.setLocation(tx < 0 ? 0 : tx, ty < 0 ? 0 : ty);
                        }
                    }
                }
                t.pause();
            };

            this.winActivated = function(e) {
                // this method is called only for mdi window
                // consider every deactivation of a mdi window as
                // a signal to stop showing tooltip
                if (e.isActive === false && this.$tooltip !== null)  {
                    this.$tooltip.removeMe();
                }
            };

            this.winOpened = function(e) {
                if (e.isShown === false) {
                    // cleanup tooltip reference
                    this.$tooltip = null;

                    if (e.source.winType !== "info") {
                        this.stopShowingTooltip();
                    }
                }
            };

            /**
             * Stop showing tooltip
             * @private
             * @method stopShowingTooltip
             */
            this.stopShowingTooltip = function() {
                if (this.$target !== null) {
                    this.$target = null;
                }

                if (this.$toolTask !== null) {
                    this.$toolTask.shutdown();
                }

                this.hideTooltip();
            };

            /**
             * Hide tooltip if it has been shown
             * @method hideTooltip
             */
            this.hideTooltip = function(){
                if (this.$tooltip !== null) {
                    this.$tooltip.removeMe();
                    this.$tooltip = null;
                }
            };

            /**
             * Define pointer pressed event handler
             * @param  {zebkit.ui.event.PointerEvent} e a pointer event
             * @method pointerPressed
             */
            this.pointerPressed = function(e) {
                if (this.hideTooltipByPress === true &&
                    e.pointerType === "mouse" &&
                    this.$target !== null &&
                    (this.$tooltip === null || this.$tooltip.winType === "info"))
                {
                    this.stopShowingTooltip();
                }
            };

            /**
             * Define pointer released event handler
             * @param  {zebkit.ui.event.PointerEvent} e a pointer event
             * @method pointerReleased
             */
            this.pointerReleased = function(e) {
                if ((this.hideTooltipByPress === false || e.pointerType !== "mouse") &&
                    this.$target !== null &&
                    (this.$tooltip === null || this.$tooltip.winType === "info"))
                {
                    this.stopShowingTooltip();
                }
            };
        }
    ]);
});
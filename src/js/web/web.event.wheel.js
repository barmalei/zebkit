zebkit.package("web", function(pkg, Class) {
    /**
     *  Mouse wheel support class. Installs necessary mouse wheel listeners and handles mouse wheel
     *  events in zebkit UI. The mouse wheel support is plugging that is configured by a JSON
     *  configuration.
     *  @class zebkit.web.MouseWheelSupport
     *  @param  {DOMElement} element
     *  @param  {Object} destination
     *  @constructor
     */
    pkg.MouseWheelSupport = Class([
        function(element, destination) {
            var META = this.clazz.$META;
            for(var k in META) {
                if (META[k].test()) {
                    var $wheelMeta = META[k],
                        $clazz     = this.clazz;

                    element.addEventListener(k,
                        function(e) {
                            var dy = e[$wheelMeta.dy] !== undefined ? e[$wheelMeta.dy] * $wheelMeta.dir : 0,
                                dx = e[$wheelMeta.dx] !== undefined ? e[$wheelMeta.dx] * $wheelMeta.dir : 0;

                            // some version of FF can generates dx/dy  < 1
                            if (Math.abs(dy) < 1) {
                                dy *= $clazz.dyZoom;
                            }

                            if (Math.abs(dx) < 1) {
                                dx *= $clazz.dxZoom;
                            }

                            dy = Math.abs(dy) > $clazz.dyNorma ? dy % $clazz.dyNorma : dy;
                            dx = Math.abs(dx) > $clazz.dxNorma ? dx % $clazz.dxNorma : dx;

                            // do floor since some mouse devices can fire float as
                            if (destination.$doScroll(Math.floor(dx),
                                                      Math.floor(dy), "wheel"))
                            {
                                e.preventDefault();
                            }
                        },
                        false);
                    break;
                }
            }
        },

        function $clazz() {
            this.dxZoom = this.dyZoom = 20;
            this.dxNorma = this.dyNorma = 80;

            this.$META = {
                wheel: {
                    dy  : "deltaY",
                    dx  : "deltaX",
                    dir : 1,
                    test: function() {
                        return "WheelEvent" in window;
                    }
                },
                mousewheel: {
                    dy  : "wheelDelta",
                    dx  : "wheelDeltaX",
                    dir : -1,
                    test: function() {
                        return document.onmousewheel !== undefined;
                    }
                },
                DOMMouseScroll: {
                    dy  : "detail",
                    dir : 1,
                    test: function() {
                        return true;
                    }
                }
            };
        },

        function $prototype() {
            /**
             * Indicates if the wheel scrolling is done following natural
             * direction.
             * @attribute naturalDirection
             * @type {Boolean}
             * @default true
             */
            this.naturalDirection = true;
        }
    ]);
});
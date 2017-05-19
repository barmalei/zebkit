zebkit.package("ui.web", function(pkg, Class) {
    var ui = pkg.cd("..");

    /**
     * The base class for HTML developing HTML layers.
     * @class zebkit.ui.web.HtmlLayer
     * @constructor
     * @extends {zebkit.ui.web.HtmlCanvas}
     */
    pkg.HtmlLayer = Class(pkg.HtmlCanvas, []);

    /**
     *  Root layer implementation. This is the simplest UI layer implementation
     *  where the layer always try grabbing all input event
     *  @class zebkit.ui.web.RootLayer
     *  @constructor
     *  @extends {zebkit.ui.web.HtmlLayer}
     *  @uses {zebkit.ui.RootLayerMix}
     */
    pkg.RootLayer = Class(pkg.HtmlLayer, ui.RootLayerMix, [
        function $clazz() {
            this.layout = new zebkit.layout.RasterLayout();
        }
    ]);

    /**
     *  Window layer implementation.
     *  @class zebkit.ui.web.WinLayer
     *  @constructor
     *  @extends {zebkit.ui.web.HtmlLayer}
     *  @uses {zebkit.ui.WinLayerMix}
     */
    pkg.WinLayer = Class(pkg.HtmlLayer, ui.WinLayerMix, [
        function() {
            this.$super();

            // TODO: why 1000 and how to avoid z-index manipulation
            // the layer has to be placed above other elements that are virtually
            // inserted in the layer
            this.element.style["z-index"] = 10000;
        },

        function $clazz() {
            this.layout = new zebkit.layout.RasterLayout();
        }
    ]);

    /**
     *  Ppopup layer implementation.
     *  @class zebkit.ui.web.PopupLayer
     *  @constructor
     *  @extends {zebkit.ui.web.HtmlLayer}
     *  @uses {zebkit.ui.PopupLayerMix}
     */
    pkg.PopupLayer = Class(pkg.HtmlLayer, ui.PopupLayerMix, [
        function $clazz() {
            this.layout = new ui.PopupLayerLayout([
                function doLayout(target){
                    // TODO:
                    // prove of concept. if layer is active don't allow WEB events comes to upper layer
                    // since there can be another HtmlElement that should not be part of interaction
                    if (target.kids.length > 0) {
                        if (target.$container.style["pointer-events"] !== "auto") {
                            target.$container.style["pointer-events"] = "auto";
                        }
                    } else if (target.$container.style["pointer-events"] !== "none") {
                        target.$container.style["pointer-events"] = "none";  // make the layer transparent for pointer events
                    }

                    this.$super(target);
                }
            ]);
        }
    ]);
});

---
layout: page
title: Slider 
parent: docs
---

<script type="text/javascript" src="../build/zebkit.js">  
</script>

{% include zsample.html canvas_id='sample' title="Get started zebkit application" %}

<script>
zebkit.require("ui", "layout", "draw", function(ui, layout, draw) {
    var s1 = new ui.Slider();
    var s2 = new ui.Slider();
    var s3 = new ui.Slider("vertical");
    var s4 = new ui.Slider();

    s2.setRuler(new ui.LinearRulerPan());
    s3.setRuler(new ui.PointRulerPan("vertical").
    setPointsGenerator(new ui.PointRulerPan.PointsGenerator([
        function pointValue(ruler, index) {
            console.log("index = " + index);

            var min = ruler.getMin();
            var max = ruler.getMax();
            if (index === 0) {
                return min;
            } else if (index === 2) {
                return max;
            } else if (index === 1) {
                return min + (2 * (max - min)) / 3;
            } else {
                return null;
            }
        }
    ])));
    s3.ruler.showNumbers();
    s3.ruler.setStrokeSize(8);
    s3.ruler.setColor("orange");
    s3.ruler.lineWidth = 3;
    s3.ruler.setLabelsRender(new ui.RulerPan.NumLabels([
        function getView(t, value) {
            var v = this.$supera(arguments);
            if (v !== null) {
                if (value < 100  && value > 0) {
                    v.setValue(Math.round(value) + "*");
                    v.setColor("red");
                    return v;
                }
            }
            v.setColor("orange");
            return v;
        }
    ]));

    var root = new ui.zCanvas("sample", 400, 300).root;
    root.properties({
        border:  "plain",
        padding: 8,
        layout:  new layout.GridLayout(2, 2),
        kids  : [
            s1,
            s2,
            s3,
            s4
        ]
    });
});
</script>


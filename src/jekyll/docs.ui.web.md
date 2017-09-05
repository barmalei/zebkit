---
layout: page
parent: docs
title: HTML Elements in zebkit layout
---


Zebkit introduces unique feature - __"possibility to layout HTML elements into zebkit layout"__  HTML elements can be placed over zebkit HTML5 Canvas as if the canvas and zebkit UI components are containers of the native HTML elements. Placing HTML element into zebkit layout gives the following possibilities:

   * Use zebkit layout managers to order HTML element. 
   * Combine HTML elements with rendered on the canvas UI components. They work together, virtual (rendered on canvas) __zebkit.ui.Panel__ can contain HTML elements in.   
   * Add visual effect, additional graphical element to HTML elements. For instance google map can be annotated with zebkit tool tip, context menu and so on. 
   * Unify input events handling. HTML element located in zebkit layout follows the same to zebkit UI components events handling paradigm.
 
Below an example of inserted into zebkit layout text field component. The application:
   * Sets rendered by zebkit border for the HTML text input element
   * Catches key board event as if it has been zebkit component
   * Renders chart as the HTML text input field background. The chart uses entered into the HTML text field interval.    

Enter an interval (0-100 or 0,100) and see result: 

{% include zsample.html canvas_id='webSample1' title='Chart as a background of HTML text field' description=description %}                    

<script type="text/javascript">
    zebkit.require("ui", "ui.web", "draw", function(ui, web, draw) {
        var FunctionRender = zebkit.Class(draw.Render, [
            function(fn, x1, x2) {
                this.$super(fn);
                this.x1 = x1; this.x2 = x2;
            },

            function paint(g,x,y,w,h,c) {
                var fy = [], dx =(this.x2 - this.x1)/200,
                    maxy = -1000000, miny = 1000000;
                for(var x = this.x1, i = 0; x < this.x2; x += dx, i++) {
                    fy[i] = this.target(x);
                    if (fy[i] > maxy) maxy = fy[i];
                    if (fy[i] < miny) miny = fy[i];
                }
                var cx = (w - 8)/(this.x2 - this.x1), cy = (h - 8)/(maxy - miny),
                    t  = function (xy, ct) { return ct * xy; };
                g.beginPath();
                g.setColor("darkorange");
                g.lineWidth = 2;
                g.moveTo(4, 4 + t(fy[0] - miny, cy));
                for(var x=this.x1+dx,i=1;i<fy.length;x+=dx,i++) {
                    g.lineTo(4+t(x - this.x1, cx),4+t(fy[i]-miny, cy));
                }
                g.stroke();
            }
        ]);

        var canvas = new ui.zCanvas("webSample1", 600, 200);
        canvas.root.setLayout(new zebkit.layout.BorderLayout());
        canvas.root.setBorder("plain");
        canvas.root.setPadding(32);
        var ta = new web.HtmlTextField("Enter an interval e.g: 0-23");
        ta.setStyle("background-color", "rgba(0,0,0,0)");
        ta.setBorder("plain");
        ta.setFont(new zebkit.Font("Helvetica", 32));
        var color = ta.getColor();
        ta.keyReleased = function(e) {
            var re=/\s*((\-)?[0-9]+(.[0-9]+)?)\s*[,\-]\s*((\-)?[0-9]+(.[0-9]+)?)\s*/;
            var m = this.getValue().match(re);
            if (m !== null) {
                var min = parseFloat(m[1]),
                    max = parseFloat(m[4]);
                if (max > min && !isNaN(min) && !isNaN(max)) {  
                    this.setColor(color);
                    this.setBackground(new FunctionRender(function(x) {
                        return (Math.sin(x) * Math.cos(2*x) - Math.cos(x*x)); 
                    }, min, max));
                } else {
                    this.setColor("red");
                }
            } else {
                this.setBackground(null);
            }
        };    
        canvas.root.add(ta);
    });
</script>   

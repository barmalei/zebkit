(function(pkg, Class) {

var L = zebra.layout, View = pkg.View, rgb = zebra.util.rgb;

pkg.CheckboxView = Class(View, [
    function(state) { this.$this(state, new rgb(220,0,0)); },

    function(state, bg) {
        this.state = state;
        this.bg = bg;
    },

    function paint(g,x,y,w,h,d){
        g.fillStyle = this.bg.s;
        g.rect(x, y, w, h);
        g.fill();

        g.strokeStyle ="gray";
        g.beginPath();
        g.moveTo(x + w - 0.5, y + 1);
        g.lineTo(x + w - 0.5, y + h - 1);
        g.lineTo(x+1, y + h - 0.5);
        g.stroke();

        if (this.state) {
            g.beginPath();
            g.strokeStyle = "white";
            g.lineWidth = 2;
            g.moveTo(x + 1, y + 2);
            g.lineTo(x + w - 3, y + h - 3);
            g.stroke();
            g.beginPath();
            g.moveTo(x + w - 2, y + 2);
            g.lineTo(x + 2, y + h - 2);
            g.stroke();
            g.lineWidth = 1;
        }
    }
]);

pkg.RadioboxView = Class(View, [
    function(state) { this.$this(state, new rgb(220,0,0)); },

    function(state, bg) {
        this.state = state;
        this.bg = bg;
    },

    function paint(g,x,y,w,h,d){
        g.beginPath();
        g.fillStyle = this.bg.s;
        g.arc(x + w/2, y + h/2, w/2, 0, 2*Math.PI, 1);
        g.fill();

        if (this.state) {
            g.beginPath();
            g.fillStyle = "white";
            g.arc(x + w/2, y + h/2, w/5 , 0, 2* Math.PI, 1);
            g.fill();
        }
    },

    function getPreferredSize() { return { width:12, height:12 }; }
]);

pkg.ScrollButton = Class(View, [
    function(o) { this.o = o; },

    function paint(g,x,y,w,h,d){
        g.beginPath();
        g.fillStyle = rgb.red.s;
        if (this.o == L.TOP) {
            g.moveTo(x + ~~(w/2), y);
            g.lineTo(x, y + h - 1);
            g.lineTo(x + w - 1, y + h - 1);
        }
        else
        if (this.o == L.BOTTOM) {
            g.moveTo(x + ~~(w/2), y + h - 1);
            g.lineTo(x, y);
            g.lineTo(x + w - 1, y);
        }
        else
        if (this.o == L.LEFT) {
            g.moveTo(x, y + ~~(h/2));
            g.lineTo(x + w - 1, y);
            g.lineTo(x + w - 1, y + h - 1);
        }
        else
        if (this.o == L.RIGHT) {
            g.moveTo(x + w - 1, y + ~~(h/2));
            g.lineTo(x, y);
            g.lineTo(x, y + h - 1);
        }
        g.fill();
    },

    function getPreferredSize() { return { width:12, height:12 }; }
]);


})(zebra("ui"), zebra.Class);
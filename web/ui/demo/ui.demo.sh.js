(function(pkg, Class) {

var Panel = zebra.ui.Panel;
var Label = zebra.ui.Label;
var TextField = zebra.ui.TextField;
var BorderLayout = zebra.layout.BorderLayout;
var FlowLayout = zebra.layout.FlowLayout;
var GridLayout = zebra.layout.GridLayout;
var BorderPan = zebra.ui.BorderPan;
var ScrollPan = zebra.ui.ScrollPan;
var Border = zebra.ui.Border;
var L = zebra.layout;
var Constraints = zebra.layout.Constraints;

var SynHighlighterRender = new Class(zebra.ui.TextRender, [
        function(path){
            this.words = {};
            this.$super(zebra.io.GET(path));
            this.setColor("gray");
            this.setFont(new zebra.ui.Font("Courier", "bold", 14));
        },

        function paintLine(g,x,y,line,d){
            var s = this.getLine(line), v = this.parse(s), xx = x;
            for(var i = 0;i < v.length; i++){
                var str = v[i], color = this.words.get(str);
                if(color != null) g.setColor(color);
                else g.setColor(this.color);
                g.drawString(str, xx, y + this.font.getAscent());
                xx += this.font.stringWidth(str);
            }
        },

        function parse(s){
            var v = [], c =  -2, isLetter = false;
            for(var i = 0;i < s.length; i ++ ){
                var b = zebra.util.isLetter(s[i]);
                if(c ==  -2){
                    isLetter = b;
                    c = 0;
                }

                if(isLetter != b && c >= 0){
                    v.push(s.substring(c, i));
                    c = i;
                    isLetter = b;
                }
            }
            if(c >= 0) v.push(s.substring(c, s.length));
            return v;
        }
]);


pkg.ShDemo = new Class(pkg.DemoPan, [
    function(path) {
        this.$super();
        this.setLayout(new BorderLayout());
		this.setPadding(0);

        var sh = new SynHighlighterRender(path);
        sh.words.put("function", "black");
        sh.words.put("var", "black");
        sh.words.put("for", "black");
        sh.words.put("if", "black");
        sh.words.put("else", "black");
        sh.words.put("return", "black");
        sh.words.put("break", "black");
        sh.words.put("continue", "black");

        sh.words.put("new", "blue");
        sh.words.put("this", "blue");
        sh.words.put("true", "blue");
        sh.words.put("false", "blue");
        sh.words.put("substring", "blue");
        sh.words.put("indexOf", "blue");
        sh.words.put("Math", "blue");
        sh.words.put("null", "blue");

        sh.words.put("Class", "red");
        sh.words.put("Interface", "red");
        sh.words.put("Point", "red");
        sh.words.put("Dimension", "red");
        sh.words.put("Rectangle", "red");
        sh.words.put("Layout", "red");
        sh.words.put("MathBox", "red");
        sh.words.put("$super", "red");
        sh.words.put("$this", "red");

        sh.words.put("bits", "green");
        sh.words.put("top", "green");
        sh.words.put("left", "green");
        sh.words.put("bottom", "green");
        sh.words.put("right", "green");
        sh.words.put("width", "green");
        sh.words.put("height", "green");

        this.tf = new TextField(sh);
        this.add(L.CENTER, new ScrollPan(this.tf));
    }
]);

})(zebra.ui.demo, zebra.Class);

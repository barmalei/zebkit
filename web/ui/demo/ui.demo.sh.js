(function(pkg, Class) {

var Panel = zebra.ui.Panel; 
var rgb = zebra.util.rgb;
var Label = zebra.ui.Label; 
var TextField = zebra.ui.TextField; 
var BorderLayout = zebra.layout.BorderLayout;
var FlowLayout = zebra.layout.FlowLayout; 
var GridLayout = zebra.layout.GridLayout; 
var BorderPan = zebra.ui.BorderPan; 
var ScrollPan = zebra.ui.ScrollPan; 
var Border = zebra.ui.view.Border; 
var L = zebra.layout; 
var Constraints = zebra.layout.Constraints;

var SynHighlighterRender = new Class(zebra.ui.view.TextRender, function($, $$) {
        $(function(path){
            this.words = new JAVA.util.Hashtable();
            this.$super((new JAVA.io.TextFileReader(path)).text);
            this.setForeground(rgb.darkGray);
            this.setFont(new zebra.ui.Font("Courier", "bold", 14));
        });

        $(function paintLine(g,x,y,line,d){
            var s = this.getLine(line), v = this.parse(s), xx = x;
            for(var i = 0;i < v.length; i++){
                var str = v[i], color = this.words.get(str);
                if(color != null) g.setColor(color);
                else g.setColor(this.foreground);
                g.drawString(str, xx, y + this.font.getAscent());
                xx += this.font.stringWidth(str);
            }
        });

        $(function parse(s){
            var v = [], c =  -2, isLetter = false;
            for(var i = 0;i < s.length; i ++ ){
                var b = JAVA.lang.Character.isLetter(s[i]);
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
        });
});


pkg.ShDemo = new Class(pkg.DemoPan, function($) {
    $(function(path) {
        this.$super();
        this.setLayout(new BorderLayout());
		this.padding(0);
        
        var sh = new SynHighlighterRender(path);
        sh.words.put("function", rgb.black);
        sh.words.put("var", rgb.black);
        sh.words.put("for", rgb.black);
        sh.words.put("if", rgb.black);
        sh.words.put("else", rgb.black);
        sh.words.put("return", rgb.black);
        sh.words.put("break", rgb.black);
        sh.words.put("continue", rgb.black);

        sh.words.put("new", rgb.blue);
        sh.words.put("this", rgb.blue);
        sh.words.put("true", rgb.blue);
        sh.words.put("false", rgb.blue);
        sh.words.put("substring", rgb.blue);
        sh.words.put("indexOf", rgb.blue);
        sh.words.put("Math", rgb.blue);
        sh.words.put("null", rgb.blue);

        sh.words.put("Class", rgb.red);
        sh.words.put("Interface", rgb.red);
        sh.words.put("Point", rgb.red);
        sh.words.put("Dimension", rgb.red);
        sh.words.put("Rectangle", rgb.red);
        sh.words.put("Layout", rgb.red);
        sh.words.put("MathBox", rgb.red);
        sh.words.put("$super", rgb.red);
        sh.words.put("$this", rgb.red);

        sh.words.put("bits", rgb.green);
        sh.words.put("top", rgb.green);
        sh.words.put("left", rgb.green);
        sh.words.put("bottom", rgb.green);
        sh.words.put("right", rgb.green);
        sh.words.put("width", rgb.green);
        sh.words.put("height", rgb.green);

        this.tf = new TextField(sh);
        this.add(L.CENTER, new ScrollPan(this.tf));
    });    
});

})(zebra.ui.demo, zebra.Class);

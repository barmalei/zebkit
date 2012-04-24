(function(pkg, Class) {

var Panel = zebra.ui.Panel; 
var Color = JAVA.awt.Color;
var Label = zebra.ui.Label; 
var TextField = zebra.ui.TextField; 
var BorderLayout = zebra.layout.BorderLayout;
var FlowLayout = zebra.layout.FlowLayout; 
var GridLayout = zebra.layout.GridLayout; 
var BorderPan = zebra.ui.BorderPan; 
var ScrollPan = zebra.ui.ScrollPan; 
var SimpleBorder = zebra.ui.view.SimpleBorder; 
var Border = zebra.ui.view.Border; 
var L = zebra.layout; 
var Constraints = zebra.layout.Constraints;

var SynHighlighterRender = new Class(zebra.ui.view.TextRender, function($, $$) {
        $(function(path){
            this.words = new JAVA.util.Hashtable();
            this.$super((new JAVA.io.TextFileReader(path)).text);
            this.setForeground(Color.darkGray);
            this.setFont(new JAVA.awt.Font("Courier", "bold", 14));
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
        sh.words.put("function", Color.black);
        sh.words.put("var", Color.black);
        sh.words.put("for", Color.black);
        sh.words.put("if", Color.black);
        sh.words.put("else", Color.black);
        sh.words.put("return", Color.black);
        sh.words.put("break", Color.black);
        sh.words.put("continue", Color.black);

        sh.words.put("new", Color.blue);
        sh.words.put("this", Color.blue);
        sh.words.put("true", Color.blue);
        sh.words.put("false", Color.blue);
        sh.words.put("substring", Color.blue);
        sh.words.put("indexOf", Color.blue);
        sh.words.put("Math", Color.blue);
        sh.words.put("null", Color.blue);

        sh.words.put("Class", Color.red);
        sh.words.put("Interface", Color.red);
        sh.words.put("Point", Color.red);
        sh.words.put("Dimension", Color.red);
        sh.words.put("Rectangle", Color.red);
        sh.words.put("Layout", Color.red);
        sh.words.put("MathBox", Color.red);
        sh.words.put("$super", Color.red);
        sh.words.put("$this", Color.red);

        sh.words.put("bits", Color.green);
        sh.words.put("top", Color.green);
        sh.words.put("left", Color.green);
        sh.words.put("bottom", Color.green);
        sh.words.put("right", Color.green);
        sh.words.put("width", Color.green);
        sh.words.put("height", Color.green);

        this.tf = new TextField(sh);
        this.add(L.CENTER, new ScrollPan(this.tf));
    });    
});

})(zebra.ui.demo, zebra.Class);

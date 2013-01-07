
require 'zebra/j2js/converter'

$BASE_PATH = File.dirname(__FILE__)

$TEST_CONTEXT="
load('zebra/easyoop.js');

var test = zebra.namespace('test');
"

$HTML_TEMPLATE = "
<html>
<header>
    <script src='http://zebkit.org/easyoop.js' type='text/javascript'></script>

    <script>
(function() {
        var test = zebra.namespace('test');
        eval(JAVA.Import('lang'));

        $code
})();
    </script>
</header>
<body>
</body>
</html>
"


def convert_file(path)
    content = File.new(path).readlines().join("")
    out_name_js = File.basename(path) + ".js"
    out_name_html = File.basename(path) + ".html"
    c = JavaConverter.new(content)

    puts "Convert #{path} to JavaScript";
    puts "   ...generate #{out_name_js}";
    puts "   ...generate #{out_name_html}";

    f = File.new(out_name_js, 'w')
    f.write($TEST_CONTEXT)
    f.write(c.to_s)
    f.close()

    f = File.new(out_name_html, 'w')
    f.write($HTML_TEMPLATE.sub("$code", c.to_s))
    f.close()

    puts "Conversion is done"
    #Node.list(c.root, Treetop::Runtime::SyntaxNode)
    #Node.list(c.root)
#    puts c.to_s
end

def convert_content(content)
    c = JavaConverter.new(content)
  #  Node.list(c.root, Treetop::Runtime::SyntaxNode)
    Node.list(c.root)
    puts c.to_s
end

#convert_file("InnerClass.java")
#convert_file("HelloWorld.java")
#convert_file("ReadFile.java")
#convert_file("ReadPropertiesFile.java")


if ARGV.length > 0
    convert_file(ARGV[0])
else

content = "
package test;

public class Test {
    final static int StaticVar = 10;

    final Integer intValue = new Integer(10);

    public interface IInterface { }
    public static class IClass { }

    private int variable1 = 10, variable2 = 20;

    public void publicMethod1() {}

    public void publicMethod2(int variable1) {
        // inner class creation
        new IClass(  ) {
            public void testaaa() {

            }
        };

        int cint = Integer.parseInt(\"323\");

        IClass icl = new IClass();

        // no this has to be added
        this.variable1 = variable1;

        // this has to be added:
        //  1. to method call
        //  2. to variable2
        publicMethod2(variable12.a.b.c);

        // this has to be added to variable2:
        // this should not be added to variable1
        // static prefix has to be added to StaticVar
        publicMethod2(variable12.a.b.c, variable1.ab.c, StaticVar.dd.dd);

        // no this has to be added
        variable1++;
    }

    public abstract void abstractMethod() {

    }

    public final void finalMethod() {

    }

    private static void main(String[] args) {
        if (a instanceof A) {}
    }
}
"
convert_content(content)

end

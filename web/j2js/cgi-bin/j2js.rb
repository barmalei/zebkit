#!/usr/bin/ruby

$LOAD_PATH << "lib"

require 'cgi'

begin
    require 'zebra/j2js/converter'
rescue
    cgi = CGI.new()
    puts cgi.header
    puts "!Error:"
    puts  $!
end

$HTML_TEMPLATE = "
<html>
<header>
    <script src='http://zebra.gravitysoft.org/zebra/easyoop.js' type='text/javascript'></script>

    <script>
(function() {
        var test = zebra.namespace('test');

        $code
})();
    </script>
</header>
<body>
</body>
</html>
"

$FMAP = {
    "hello"  => "lib/zebra/test/HelloWorld.java",
    "props"  => "lib/zebra/test/ReadPropertiesFile.java",
    "io"     => "lib/zebra/test/ReadFile.java",
    "mycode" => "lib/zebra/test/mycode.java",
    "inner"  => "lib/zebra/test/InnerClass.java"
}

cgi = CGI.new()
puts cgi.header
if cgi.params.has_key?("javasrc") 
    begin
        content = cgi.params["javasrc"]
        content = content[0] if content.kind_of?(Array)
        content = content.read.to_s if content.kind_of?(IO)
        raise "Out of source code length limit (max 20000 characters)" if content.length > 10000
        s = JavaConverter.new(content).to_s
        puts s
    rescue 
        puts "!Error:"
        puts  $!
    end
elsif cgi.params.has_key?("getfile")
    begin
        content = cgi.params["getfile"]
        content = content[0] if content.kind_of?(Array)
        content = content.readlines.to_s if content.kind_of?(IO)
        raise "File '#{content}' not found" if !$FMAP.has_key?(content)
        f = nil
        begin
            f = File.new($FMAP[content], "r")
            s = f.read
            puts s
        ensure
            f.close() if f
        end
    rescue 
        puts "!Error:"
        puts  $!
    end
else
    puts "Error: Java code has not been passed"   
end


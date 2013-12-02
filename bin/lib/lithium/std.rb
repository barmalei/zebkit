require 'lithium/common-std'
require 'pathname'


$std_output_parsers = [ 
     [ /python/,       Format::LocRecognizer.new(/\s*SyntaxError:\s+\(\'[^']+\'\,\s*\(\'([^']+)\'\,\s*([0-9]+).*\)\)/, {1 => 'file', 2 => 'line'}) ],            
     [ /java/,         Format::JavaExceptionRecognizer.new() ],  
     [ /java/,         Format::LocRecognizer.new(/^([^\{\}\>\<\|]+)\:([0-9]+)\:/), {1 => 'file', 2 => 'line'} ],  
     [ /groovy/,       Format::LocRecognizer.new(/^\s*(.*)\s*:\s*([0-9]+)\s*\:.*/), {1 => 'file', 2 => 'line'} ],  
     [ /\.php/,        Format::LocRecognizer.new(/\s*Parse error:.*in\s+(.*)\s+on\s+line\s+([0-9]+)/, {1 => 'file', 2 => 'line'}) ], 
     [ /\.js/,         Format::LocRecognizer.new(/\s*js\:.*\"(.*)\"\,\s+line\s+([0-9]+)\:/, {1 => 'file', 2 => 'line'}) ],  
     [ nil,            Format::LocRecognizer.new(/\s*from\s+(.*)\:([0-9]+)/, { 1 => 'file', 2 => 'line '}) ],     # ruby
     [ nil,            Format::URLRecognizer.new() ]
     #[ nil,            Format::LocRecognizer.new() ] 
]

class LithiumStd < Std
    class LithiumFormat < Format
        def initialize(format = '(#{level})  #{sign}  #{msg}')
            super  format, $std_output_parsers
            @backtrace_deepness = -1
        end   

        def recognizers()
            arr = []
            @recognizers.each() { |r|
                regexp, recognizer = r[0], r[1]
                arr << recognizer if regexp.nil? || (defined?($exec4_cmd) && !$exec4_cmd.nil? && regexp.match($exec4_cmd))
            }
            arr
        end
    end
    
    def initialize()
       super(LithiumFormat.new()) 
    end
end

class HTMLFormat < LithiumStd::LithiumFormat
    def initialize(format = '<div><b>(#{level})</b>&nbsp;&nbsp;#{sign}&nbsp;&nbsp;#{msg}</div>') 
        super(format)
    end

    def normalize(e, entities) 
        if e.type == 'file'
            ln, bn, dr = entities['line'], File.basename(e), File.dirname(e)
            bn = File.join(File.basename(dr), bn) if dr
            return e.clone("<a href='txmt://open?url=file://#{e}&line=#{ln}'>#{bn}</a>")
        elsif e.type == 'url'
            return e.clone("<a href=\"javascript:TextMate.system('open #{e}')\">#{e}</a>") 
        end
        super
    end

    def _format_(msg, level, entities) 
        msg = super(msg, level, entities) 
        msg = "<font color='red'>#{msg}</font>" if level == 2
        msg = "<font color='orange'>#{msg}</font>" if level == 3
        msg = "<font color='blue'>#{msg}</font>" if level == 1
        msg.gsub('  ', '&nbsp;&nbsp;')
    end
end
      
class TextmateHTMLStd < Std
    attr_accessor :font_size, :font_type, :font_color
    
    HOME = "http://www.gravitysoft.org/doku.php?id=home:projects:lithium"
    
    def initialize() 
        super(HTMLFormat.new()) 
        @font_size = 2
        @font_face = 'Menlo, monospace'
        @font_color = '#347C17'
    end
    
    def started() 
        self << "<HTML>\n"  
        self << "  <BODY>\n"
        self << "     <font color='#{@font_color}' face='#{@font_face}' size='#{@font_size}'>\n"  
    end

    attr_reader :attr_names

# !!! brings to wrong style when exception happens
#    def flush()
 #       self << "</font></BODY></HTML>"
  #      super
  #  end  ::sndsd:jsdjshdh
  
  #$ compile:@
end


class SublimeStd < Std
    class SublimeFormat < LithiumStd::LithiumFormat
        def normalize(e, entities) 
            return e.clone("[[#{e}:#{entities['line']}]]") if e.type == 'file'
            super
        end
    end
    
    def initialize() 
        super(SublimeFormat.new()) 
    end
end




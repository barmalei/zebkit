require 'gravity/lithium/file-artifact/command'
require 'gravity/lithium/rb-artifact'
require 'gravity/lithium/util/misc'


class CompileTTGrammar < FileCommand
    required RUBY
    
    def initialize(*args)
        super
        @output_dir ||= File.dirname(@name)
        @output_dir = "#{@root}/#{@output_dir}"
        @tt = "#{$lithium_home}/tools/tt/bin/tt"
        raise "Undefined output dir '#{@output_dir}'." if !File.directory?(@output_dir)
    end

    def build()
        # kill extension
        oname = File.basename(@name)
        ext   = File.extname(oname)
        oname[ext] = '.rb' if ext
        
        opath = File.join(@output_dir, oname)
        File.delete(opath) if File.exists?(opath)
        
        r = exec4(ruby().ruby, @tt, "'#{fullpath()}'", "-o", "'#{opath}'")
        raise "Grammar '#{@name}' compilation failed" if r != 0
    end
 
    def what_it_does() "Compile '#{@name}' grammar to '#{@output_dir}'" end
end




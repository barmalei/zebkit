require 'lithium/file-artifact/command'


class RunPhpScript < FileCommand
    def build() raise 'Run failed' if exec4("php", "-f", "'#{fullpath}'") != 0 end
    def what_it_does() "Run '#{@name}' script" end    
end

class ValidatePhpScript < FileCommand
    def build() raise 'Invalid script' if exec4("php", "-l", "-f", "'#{fullpath}'") != 0 end
    def what_it_does() "Validate '#{@name}' script" end    
end


require 'lithium/file-artifact/command'
require 'lithium/util/loggable'
require 'lithium/util/misc'
require 'lithium/draft'

require 'pathname'


class RUBY < Artifact    
    include LogArtifactAttrs
    extend  Singletone 

    log_attr :libs

    def initialize(name) 
        super 
        @libs ||= [ 'lib' ]
        @ruby_path = ''
        @libs.each { | path | 
            path = "#{$project_home}/#{path}" if !Pathname.new(path).absolute?()
            raise "Invalid lib path - '#{path}'" if !File.directory?(path)
            @ruby_path = "#{@ruby_path} -I#{path}" 
        }
    end

    def ruby() "ruby #{@ruby_path}" end
    def build() end
    def what_it_does() "Initialize ruby environment '#{@name}'" end
end


class RunRubyScript < FileCommand
    required RUBY

    def build() 
        raise 'Run failed' if exec4(ruby().ruby, "'#{fullpath()}'", $arguments.join(' ')) != 0 end
    def what_it_does() "Run '#{@name}' script" end
end

class RunRubyString < StringRunner
    required RUBY    
    def cmd() ruby().ruby end
end


class ValidateRubyScript < FileCommand
    def build() raise "Validation failed", 2 if exec4("ruby -c", "'#{fullpath}'") {} != 0 end
    def what_it_does() "Validate '#{@name}' script" end
end



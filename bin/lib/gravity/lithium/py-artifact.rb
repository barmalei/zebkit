require 'pathname'

require 'gravity/lithium/file-artifact/command'
require 'gravity/lithium/util/loggable'
require 'gravity/lithium/util/misc'
require 'gravity/lithium/draft'


class PYTHON < Artifact    
    include LogArtifactAttrs
    extend  Singletone 

    log_attr :libs, :pypath, :python

    def initialize(*args) 
        super 
        @libs  ||= [] 
        @pypath = ENV['PYTHONPATH']
        @python ||= 'python'

        raise 'Python cannot be found' if exec4(@python, "-c \"exit(0)\"") != 0

        @libs.each { | lib |
            lib = "#{$project_home}/#{lib}" if !Pathname.new(lib).absolute?() 
            raise "Invalid lib path - '#{lib}'" if !File.directory?(lib)
            @pypath = @pypath ? lib + File::PATH_SEPARATOR + @pypath : lib
        }
        ENV['PYTHONPATH'] = @pypath
    end
    
    def build() end
    def what_it_does() "Initialize python environment '#{@name}'" end
end


class RunPythonScript < FileCommand
    required PYTHON

    def build() 
        raise "File '#{fullpath()}' cannot be found" if !File.exists?(fullpath())
        raise 'Run failed' if exec4("#{python().python} -u", "'#{fullpath()}'")  != 0 
    end
    
    def what_it_does() "Run '#{@name}' script" end
end

class RunPythonString < StringRunner
    required PYTHON

    def cmd() "#{python.python} -" end
end


class ValidatePythonCode < PermanentFile
    def build()
        raise 'Pyflake python code validation failed' if exec4("pyflake", "'#{fullpath()}'")  != 0 
    end
end

class ValidatePythonScript < FileCommand
    def build() raise "Validation failed" if !ValidatePythonScript.validate(fullpath()) end
    def what_it_does() "Validate '#{@name}' script" end
    
    def self.validate(path)
script = "
import py_compile, sys\n

try:\n 
    py_compile.compile('#{path}', doraise=True)\n
except py_compile.PyCompileError:\n
    print sys.exc_info()[1]\n  
    exit(1)
"
        exec4 "python", "-c", "\"#{script}\""
    end
end




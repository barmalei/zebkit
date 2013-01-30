require 'gravity/lithium/file-artifact/command'
require 'gravity/lithium/java-artifact/base'
require 'gravity/lithium/py-artifact'

class JYTHON < Artifact 
    required PYTHON
    required JAVA
    
    attr_reader :path, :jython_home
    
    def initialize(name)
        super
        @jython_home = "#{$lithium_home}/tools/jython"
        raise "Cannot find jython home" if !File.exists?(@jython_home)

        @path = python().pypath 
        if !@path || @path.length == 0
           @path = java().classpath
        else
           cp = java().classpath
           @path = @path + File::PATH_SEPARATOR + cp if cp
        end
    
        ENV['JYTHON_HOME'] = @jython_home
        #ENV['JYTHONPATH'] = @path
    end
    
    def build() end
end

class RunJythonScript < FileCommand
    required JYTHON
        
    def build()
        puts "Python path : #{jython.path}"
        raise 'Run failed' if exec4("#{jython.jython_home}/bin/jython", "-Dpython.path=#{jython.path}",  "#{fullpath()}", $arguments.join(' ')) != 0 
    end

    def what_it_does() "Run python '#{@name}' script in JVM" end    
end

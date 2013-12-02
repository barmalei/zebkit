require 'fileutils'
require 'tempfile'

require 'lithium/file-artifact/command'
require 'lithium/file-artifact/acquired'
require 'lithium/java-artifact/base'

class CheckStyle < FileMask
    required JAVA

    def initialize(*args)
        super
        @checkstyle_home = "#{$lithium_home}/tools/java/checkstyle"       if !@checkstyle_home 
        raise "Checkstyle home '#{@checkstyle_home}' is incorrect"        if !File.directory?(@checkstyle_home)
        @checkstyle_config = "#{@checkstyle_home}/sun_checks.xml"         if !@checkstyle_config
        raise "Checkstyle config '#{@checkstyle_config}' cannot be found" if !File.exists?(@checkstyle_config)
    end

    def build()
        j = java() 
        cmd  = "#{j.java()} -cp #{@checkstyle_home}/checkstyle-5.6-all.jar com.puppycrawl.tools.checkstyle.Main -r #{fullpath()} -c #{@checkstyle_config}" 
        raise "Cannot run check style" if !exec4(cmd, "")
    end

    def what_it_does() "Check '#{@name}' java code style" end
end


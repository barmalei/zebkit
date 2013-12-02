require 'lithium/file-artifact/base'
require 'lithium/java-artifact/base'
require 'lithium/util/misc'


class RunANT < Directory
    required JAVA

    def initialize(*args)
        super 
        @ant_path  ||= "#{$lithium_home}/tools/ant" 
        @build_xml ||= 'build.xml'
        @build_xml_path = "#{@name}/#{@build_xml}" 
        raise "ANT tool cannot be found '#{@ant_path}'" if !File.exists?(@ant_path)
        raise "ANT '#{@build_xml_path}' cannot be found" if !File.exists?(@build_xml_path)
    end

    def build()
        classpath = java().classpath
        ENV['JAVA_HOME'] = java().java_home

        Dir["#{@ant_path}/lib/*.jar"].each { |item|
            classpath = classpath ? classpath + File::PATH_SEPARATOR + item : item
        }

        Dir.chdir(fullpath())
        r = exec4(java().java(), "-classpath", classpath, 
                   "org.apache.tools.ant.Main", "-buildfile", 
                   @build_xml_path, @target)
                
        raise 'ANT error' if r != 0
    end
    
    def what_it_does() "Run ANT '#{@build_xml_path}', target = '#{@target}'" end
    def expired?() true end
end
    

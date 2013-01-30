require 'gravity/lithium/file-artifact/command'
require 'gravity/lithium/java-artifact/base'
require 'gravity/lithium/util/misc'


class PMD < FileCommand
    required JAVA

    def initialize(*args)
        super
        @pmd_path = "#{$lithium_home}/tools/java/pmd"
        raise "Path cannot be found '#{@pmd_path}'" if !File.exists?(@pmd_path)

        @pmd_opts ||= '' 
        @pmd_optimization_args ||= 'basic,design,unusedcode,imports' 
    end

    def build()
        classpath = java().classpath

        p = "#{@pmd_path}/lib/*.jar"
        p = "#{@pmd_path}/java14/lib/*.jar" if java().java_version_low.to_i < 5     
        
        Dir[p].each { |item|
            classpath = classpath ? classpath + File::PATH_SEPARATOR + item : item
        }

        r = exec4(java().java(), "-classpath", classpath, 
                  "net.sourceforge.pmd.PMD", fullpath(), 
                  "text", @pmd_optimization_args)

        raise 'PMD error' if r != 0
    end
    
    def what_it_does() "Validate '#{@name}' code applying #{@pmd_optimization_args}" end
end


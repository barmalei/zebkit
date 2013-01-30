require 'gravity/lithium/file-artifact/base'

#  TODO: FileSet and its dependencies problem. For instance: "lib/*.jar" means FileSet wiil 
#        requires sequence of jar artifacts, but if the JAR artifact has to be created before  
#        no correct way to do it. 
class FileMask < FileArtifact
    def list_items()
        counter = 0
        Dir.chdir(@root)
        Dir[@name].each { | i |
            yield i, File.mtime(i).to_i()
            counter += 1
        }
        return counter 
    end 
    
    def expired?() true end
end

#$  run:/Users/avishneu/projects/lithium/lib/gravity/lithium/file-artifact/set.rb
class BaseFileSet < FileArtifact
    def CLASS(name, &block) @clazz, @clazz_block = name, block end

    def requires()
        r = super
        r += artifacts_set()
        r
    end
    
    def list_items() raise NotImplementedError, '' end
    def cleanup() artifacts_set().each() { |a| a.cleanup() } end
    def build() end
    def what_it_does() "Form artifacts list by '#{@name}' pattern" end
        
    private

    def artifacts_set()
        l = []
        list_items() { |n, t|
            if @clazz
                n = @clazz.new(n) 
                n.instance_eval(&@clazz_block) if @clazz_block
                l << n
            end
        }
        raise "File set '#{@name}' is empty "if l.length == 0
        l
    end
end

class FileSet < BaseFileSet
    def list_items()
        Dir.chdir(@root)
        Dir[@name].each { | i | yield i, File.mtime(i).to_i() }
    end 
end

require 'lithium/core-artifact/base'


class CLEANUP < Artifact
    def build() Artifact.artifact(@name).cleanup end
    def what_it_does() "Cleanup '#{@name}', #{Artifact.artifact(@name).class}" end
end

class REQUIRE < Artifact
    def build()
        r = Artifact.artifact(@name).requires().collect() { | e | ' require: ' + e.to_s }
        puts "dependencies list is empty" if r.length == 0
        puts                              if r.length > 0
    end

    def what_it_does() "List '#{@name}' artifact dependencies" end
end

class TREE < Artifact
    def build()
        tree = ArtifactTree.new(@name)
        tree.build()
        tree.norm_tree() if @normalize_tree
        tree.show_tree()
    end

    def what_it_does() "Show '#{@name}' dependencies tree" end
end

class EXPIRED < Artifact
    def build() puts Artifact.artifact(@name).list_items() end
    def what_it_does() "List expired for '#{@name}'" end
end

class INSPECT < Artifact
    def initialize(name = '.') super end

    def build()
        a = Artifact.artifact(@name)
        v = a.instance_variables
        puts "Artifact: '#{a.name}'(#{a.class})", '{'
        v.each() { |v| puts "   #{v}= #{format(a.instance_variable_get(v))}" if v != '@name'}
        puts '}'
    end

    def what_it_does() "Inspect artifact '#{@name}'" end

    protected

    def format(val)
        return 'nil' if val.nil?
        return val.inspect if val.kind_of?(Array) || val.kind_of?(Hash) || val.kind_of?(String)
        return val.to_s
    end
end

class BUILD < Artifact
    @@current = nil

    def build()
        tree = ArtifactTree.new(@name)
        tree.build()
        @root, @art = tree.root_node, tree.root_node.art
        tree.norm_tree()
        build_tree(@root)
    end

    def self.current() @@current end

    def build_tree(root, level = 0)
        raise "Nil artifact cannot be built" if root.nil?
        if !root.expired
            puts "'#{root.art.name}', #{root.art.class} is not expired", 'There is nothing to be done!' if level == 0
            return false
        end

        art = root.art
        root.children.each { |i| build_tree(i, level + 1) }
        if art.respond_to?(:build)
            begin
                @@current = art
                wid = art.what_it_does()
                puts wid if wid
                art.pre_build()
                art.build()
            rescue
                art.build_failed()
                raise
            ensure
                @@current = nil
            end
            art.build_done()
        else
            puts_warning "'#{art.name}' does not declare build() method"
        end
        true
    end

    # def what_it_does()
    #     "BUILD #{@name}"
    # end
end

class GROUP < Artifact
    def initialize(*args)
        super
        @cleanup_before ||= false
    end

    def expired?() 
        requires().each() { |a|  
            return true if Artifact.artifact(a).expired?
        }
        return false
    end

    def cleanup() 
        r = ArtifactTree.new(@name)
        r.build()
        r.root_node.traverse_kids() { |n, level|
            puts "#{' '*2*level}Cleanup #{n.art.class}:#{n.art.name}"
            n.art.cleanup() 
        }
    end

    def build()
        
    end

    def what_it_does() "Build '#{name}'' grouped artifact" end
end


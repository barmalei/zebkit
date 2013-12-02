require 'lithium/util/misc'

class Artifact
    attr_reader :name, :shortname, :ver

    class Context
        instance_methods.each() { |m|
            if not m.to_s =~ /__[a-z]+__/
                undef_method m if not m.to_s =~ /object_id/
            end
        }

        @@context = []

        def initialize(target)
            raise 'Target has to be defined' if !target
            @target = target
        end

        def method_missing(meth, *args, &block)
            switched = false
            if @@context.last != @target
                @@context.push(@target)
                switched = true
            end
            begin
                return @target.send(meth, *args, &block)
            ensure
                @@context.pop() if switched
            end
        end

        def self.context() @@context.last; end
    end

    module Singletone
        @instance = nil
        def new(*args, &block)
            return @instance if @instance
            @instance = super
            @instance
        end
    end

    def Artifact.required(clazz, name = nil)
        name = clazz.name if name.nil?

        self.send(:define_method, name.downcase.intern) {
            a = instance_variable_get("@_#{name.downcase}_")
            return a if a

            a = nil
            begin
                a = Artifact.artifact(name)
            rescue NameError=>e
            end

            a = clazz.new(name) if !a
            instance_variable_set( "@_#{name.downcase}_", a)
        }

        rname = "#{name.to_s}__requires"
        alias_method rname, "requires"
        undef_method "requires"

        self.send(:define_method, 'requires') {
            r = self.send(rname.intern)
            r << self.send(name.downcase)
            r
        }
    end

    # !!! this method creates wrapper arround every created artifact
    # !!! to keep track for the current context (instance where a method
    # !!! has been executed)
    def Artifact.new(*args, &block)
        Context.new(super(*args, &block))
    end

    def Artifact.context() Context.context() end

    def initialize(name, &block)
        Artifact.nil_name(name)

        name.scan(/\@[a-zA-Z]+/).each { |i|
            value = eval i
            raise "Cannot resolve variable #{i}." if value.nil?
            name = name.gsub(i, value.to_s())
        }
        @name, @shortname = name, File.basename(name)
        self.instance_eval(&block) if block
    end

    def method_missing(meth, *args, &block)
        return if meth == :build_done || meth == :build_failed || meth == :pre_build
        super(meth, *args, &block)
    end

    def requires()
        @requires ||= []
        @requires.dup()
    end

    def expired?() true end
    def cleanup() end
    def to_s() shortname end

    def what_it_does() return "Build #{to_s}" end

    def REQUIRE(*args)
        @requires ||= []
        args.each { | name |
            Artifact.nil_name(name)
            @requires << name
        }
    end

    def self.artifact(name, &block)
        Artifact.nil_name(name)
        clazz, name = self.parse_name(name)
        return self.instantiate(clazz, name, &block)
    end

    def self.instantiate(clazz, *args,  &block)
        Artifact.nil_name(clazz, 'Class')
        begin
            clazz = Module.const_get(clazz) if clazz.kind_of?(String)
        rescue NameError
            raise "Class '#{clazz}' not found"
        end
        return args ? clazz.new(*args)         : clazz.new() if block.nil?
        return args ? clazz.new(*args, &block) : clazz.new(&block)
    end

    def self.parse_name(name)
        Artifact.nil_name(name)
        t, r = nil, name.match(/^[a-zA-Z][a-zA-Z_]+\:/)
        t, name = name[0, r[0].length - 1], name[r[0].length, name.length] if r
        name = nil if name.length == 0
        [t, name]
    end

    def ==(art) art && self.class == art.class && @name == art.name && @ver == art.ver end

    def mtime() -1 end

    protected

    def self.nil_name(name, msg = 'Artifact')
        raise "#{msg} name cannot be nil" if name.nil?  || (name.kind_of?(String) && name.strip.length == 0)
    end
end

class ArtifactTree < Artifact
    attr_reader :root_node

    class Node
        attr_accessor :art, :parent, :children, :expired, :expired_by_kid

        def initialize(art, parent=nil)
            raise 'Artifact cannot be nil' if art.nil?
            art = Artifact.artifact(art) if art.kind_of?(String)
            @children, @art, @parent, @expired, @expired_by_kid = [], art, parent, art.expired?, nil
        end

        def traverse(&block)
            traverse_(self, 0, &block)
        end

        def traverse_kids(&block)
            @children.each { |n| traverse_(n, 0, &block) }
        end

        def traverse_(root, level, &block)
            root.children.each { |n|
                traverse_(n, level+1, &block)
            }
            block.call(root, level)
        end
    end

    def initialize(*args)
        super
        @show_mtime ||= true
    end

    def build()
        @root_node = Node.new(@name)
        build_tree(@root_node)
    end

    def norm_tree()
        norm_tree_exp(@root_node)
        norm_tree_ver(@root_node)
    end

    def build_tree(root)
        root.art.requires().each { |a|
            kid_node, p = Node.new(a, root), root
            while p && p.art != kid_node.art
                p = p.parent
            end
            raise "'#{root.art}' has CYCLIC dependency on '#{p.art}'" if p
            root.children << kid_node
            build_tree(kid_node)
        }
    end

    def show_tree() puts tree2string(nil, @root_node) end

    def norm_tree_ver(root, map={})
        # !!! key building code should be optimized
        key = root.art.name + root.art.class.to_s
        if map[key].nil?
            map[key] = root
            root.children.each { |i| norm_tree_ver(i, map) }
            root.children = root.children.compact()
        else
            #puts_warning "Cut dependency branch '#{root.art}'"
            root.parent.children[root.parent.children.index(root)], item  = nil, map[key]
            if Version.compare(root.art.ver, item.art.ver) == 1
                puts_warning "Replace branch '#{item.art}' with version #{root.art.ver}"
                item.art = root.art
            end
        end
    end

    def norm_tree_exp(root)
        bt = root.art.mtime()
        root.children.each { |kid|
            norm_tree_exp(kid)
            if !root.expired && (kid.expired || (bt > 0 && kid.art.mtime() > bt))
                root.expired = true
                root.expired_by_kid = kid.art
            end
        }
    end

    def tree2string(parent, root, shift=0)
        pshift, name = shift, root.art.to_s()

        e = (root.expired ? '*' : '') +  (root.expired_by_kid ? "*[#{root.expired_by_kid}]" : '') + (@show_mtime ? ": #{root.art.mtime}" : '')
        s = "#{' '*shift}" + (parent ? '+-' : '') + "#{name}(#{root.art.class})"  + e
        b = parent && root != parent.children.last
        if b
            s, k = "#{s}\n#{' '*shift}|", name.length/2 + 1
            s = "#{s}#{' '*k}|" if root.children.length > 0
        else
            k = shift + name.length/2 + 2
            s = "#{s}\n#{' '*k}|" if root.children.length > 0
        end

        shift = shift + name.length/2 + 2
        root.children.each { |i|
            rs, s = tree2string(root, i, shift), s + "\n"
            if b
                rs.each_line { |l|
                    l[pshift] = '|'
                    s = s + l
                }
            else
                s = s + rs
            end
        }
        s
    end

    def what_it_does() "Build '#{@name}' artifact dependencies tree" end
end

class NAME_MAPPER < Artifact
    def self.new(*args, &block)
        map, n = block.call(), args[0]
        raise "Artifact map has not been defined" if !map
        m = map[n]
        raise "No mapping is available for '#{n}' artifact" if !m
        return Artifact.artifact(m)
    end
end

class EXT_MAPPER < Artifact
    def self.new(*args, &block)
        map, n = block.call(), args[0]
        raise "Artifact map has not been defined" if !map
        m = map[self.build_key(*args)]
        raise "No mapping is available for '#{n}' artifact" if !m
        return Artifact.artifact("#{m}:#{n}") if m.kind_of?(String)
        return m.new(*args) if m.kind_of?(Class)
        raise "Artifact '#{n}' mapping has wrong type #{m.class}"
    end

    def self.build_key(*args)
        n = args[0]
        e = File.extname(n)
        raise "File '#{n}' extension cannot be fetched" if e.nil? || e.length < 2
        e[1, e.length]
    end
end




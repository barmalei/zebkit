require 'gravity/lithium/file-artifact/base'


def ALIAS(aname, name) [aname, name] end

class Artifact
    @@artifacts, @@aliases, @@patterns = {}, {}, []

    def self.artifact(name, &block)

        if @@artifacts[name]
            return @@artifacts[name] if @@artifacts[name].kind_of?(Artifact)
            args = @@artifacts[name][0]
            a = Artifact.instantiate(args[-1], *args[0, args.length-1], &@@artifacts[name][1])
            @@artifacts[name] = a
            return a
        end

        # prepare variables
        type, name = self.parse_name(name)
        block, clean = nil, false

        # find command
        if type && @@aliases[type]
            type, block, def_name, clean = @@aliases[type]
            name = def_name if !name
            raise "Unknown artifact name for #{type} command" if !name
        end

        r = @@patterns.detect { | p | p[0].match(name) } if type.nil?
        type, block = r[1], r[2] if r
        raise NameError.new("No artifact is assosiated with '#{name}'") if type.nil?
        art = self.instantiate(type, name, &block)

        @@artifacts[name] = art if type.nil?

        art.cleanup() if clean

        return art
    end

    def self.aliases() @@aliases end
    def self.patterns() @@patterns end
    def self.artifacts() @@artifacts end

    module Singletone
        def new(*args)
            @cached ||=  {}
            n = args[0]
            @cached[n] = super if !@cached[n]
            return @cached[n]
        end
    end
end


class LIST_ARTIFACT < Artifact
    def build()
        if @name == 'artifacts'
            ls_artifacts()
        elsif @name == 'commands'
            ls_commands()
        elsif @name == 'sets'
            ls_sets()
        elsif @name == 'all'
            puts "Artifacts list"
            puts "#{'='*60}"
            ls_artifacts()
            puts "\nCommands list"
            puts "#{'='*60}"
            ls_commands()
            puts "\nSets list"
            puts "#{'='*60}"
            ls_sets()
            puts
        else
            raise "'#{@name}' is unknown artifacts list type"
        end
    end

    def ls_sets()
        Artifact.patterns.each() { |e|
            puts "#{e[0]}  :  #{e[1]}"
        }
    end

    def ls_commands()
        Artifact.aliases.each_pair() { |k, v|
            puts sprintf "  %-15s: %s\n", k, v[0].to_s
        }
    end

    def ls_artifacts()
        Artifact.artifacts.each_value() { |e|
            if e.kind_of?(Artifact)
                n, clazz = e.name, e.class.to_s
            else
                n, clazz = e[0][0], e[0][-1].to_s
            end
            puts sprintf "  %-20s('%s')\n", clazz, n
        }
    end

    def what_it_does() "List project #{@name}" end
end


class Project < PermanentFile
    def initialize(root = $project_home, &block)
        super('.', root, &block)
        @desc ||= File.basename(root)
    end

    def expired?() true end
    def build() end
    def what_it_does()
        return nil
        #"Load '#{@desc}'  ('#{@root}')"
    end

    def COMMAND(nick, clazz, def_name = nil, cleanup = false, &block)
        puts_warning "Override '#{nick}' command" if Artifact.aliases[nick]
        Artifact.aliases[nick] = [clazz, block, def_name, cleanup ]
    end

    def SET(pattern, clazz = nil, &block)
        Artifact.patterns.delete_if() { | e |
            if e[0] == pattern
                puts_warning "Override pattern '#{pattern}'"
                true
            else
                false
            end
        }

        pattern = PatternString.new(pattern)

        # try to identify class by pattern
        if clazz.nil?
            p = pattern
            if p.is_fmask
                i = p.index(/[\?\*\{\}]/)
                p = p[0, i]
            end
            clazz = File.exists?("#{@root}/.lithium/#{p}") ? MetaGeneratedFileSet : FileSet
        end

        Artifact.patterns << [pattern, clazz, block]
        Artifact.patterns.sort() { |a, b| a[0] <=> b[0] }
    end

    def ARTIFACT(*args, &block)
        args.unshift(args[0].to_s) if args.length < 2
        name = args[0]

        # handle alias
        if name.kind_of?(Array)
            args[0] = name[1]
            name = name[0]
        end

        puts_warning "Override '#{name}' artifact" if Artifact.artifacts[name]
        Artifact.artifacts[name] = [ args, block ]
        name
    end
end


def PROJECT(clazz = Project, &block)
    p = Artifact.instantiate(clazz, &block)
    Artifact.artifacts['.'] = p
    Artifact.artifact("BUILD:.").build()
end



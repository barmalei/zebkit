require 'fileutils'

require 'gravity/lithium/util/misc'
require 'gravity/lithium/file-artifact/set'
require 'gravity/lithium/java-artifact/base'

class JavaCompiler < FileMask
    include LogArtifactItems
    required JAVA

    def initialize(*args)
        super
        if !@destination
            @destination = 'classes'
            @destination = 'lib' if !File.exists?(fullpath(@destination))
            puts_warning "Class destination is not specified. Use '#{@destination}' as the destination."
        end

        @create_destination ||= false
        @description ||= 'Undefined'
        @options ||= ''
        @list_expired ||= false
    end

    def list_items()
        b = File.exist?(fullpath(@destination))
        c = super { |f, m|
            yield f, (b ? m : -1)
        }
        return c
    end

    def expired?() false end

    def build()
        list = []
        if @list_expired
            list_expired() { |n, t|  list << n }
        else
            list_items() { |n, t|  list << n }
        end

        fdest = fullpath(@destination)
        if !File.exists?(fdest)
            raise "Destination classes folder #{@destination} doesn't exist" if !@create_destination
            puts_warning "Create destination '#{@destination}' folder"
            FileUtils.mkdir_p(fdest)
        end

        if list && list.length > 0
            Dir.chdir(@root)
            raise 'Compile error' if compile(list, fdest, java()) != 0
            puts "#{list.length} source files have been compiled"
        else
            puts "Nothing to be compiled"
        end
    end

    def compile(list, dest, jdk) exec4(command(dest, jdk), list.join(' ')) end
    def command(d, j)  "#{j.javac()}  -classpath #{j.classpath} #{@options} -d #{d}" end
    def what_it_does() "Compile (#{@description}) '#{@name}' to '#{@destination}'" end
end

class SunJavaCompiler < JavaCompiler
    def initialize(*args)
        super
        @description = 'Sun'
    end

    def compile(list, dest, jdk)
        path = File.expand_path('to_be_compiled.lst')
        begin
            File.open(path, "w") { |f| f.print(list.join("\n")) }
            return exec4(command(dest, jdk), "'@#{path}'")
        ensure
            File.delete(path)
        end
    end
end

class EclipseJavaCompiler < SunJavaCompiler
    def initialize(*args)
        super
        @description = 'eclipse'
    end

    def command(d, j)
        cp = j.classpath
        Dir["#{$lithium_home}/tools/java/jdt/*.jar"].each { |item|
            cp = (cp && cp.length > 0) ? "#{cp}#{File::PATH_SEPARATOR}#{item}" : item
        }
        "#{j.java()} -cp #{cp} org.eclipse.jdt.internal.compiler.batch.Main #{@options} -d #{d}"
    end
end

class PersonalJavaCompiler < JavaCompiler
    def initialize(*args)
        super
        @description = 'Personal Java'
    end

    def compile(list, dest, jdk)
        list.each { |item|
            fp = File.exists?(item) ? File.expand_path(item) : @root/item
            if FileUtil.grep(fp, /-J2SE-/)
                puts_warning "Skip none-PJ file - #{item}"
                next
            end
            puts item
            Dir.chdir(File.dirname(fp))
            return 1 if exec4(command(dest, jdk), File.basename(fp)) != 0
        }
    end
end

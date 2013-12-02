require 'tmpdir'
require "pathname"

require 'lithium/util/loggable'
require 'lithium/maven-artifact'

class JAVA < Artifact
    GET_VER_CLASS = 'lithium.java.ShowJVMInfo'
    GET_VER_SRC   = 'lib/lithium/java-artifact/ShowJVMInfo.java'

    include LogArtifactAttrs
    extend  Artifact::Singletone

    attr_reader :classpath
    log_attr :java_home, :java_version, :libs, :java_version_low, :java_version_high

    def initialize(*args)
        super

        if !@libs
            @libs = []
            @libs << 'classes' if File.exists?(File.join($project_home, 'classes'))
            @libs << 'lib' if File.exists?(File.join($project_home, 'lib'))
        end

        bdir = $lithium_home

        # identify Java Home
        if !defined?(@java_home)
            if ENV['JAVA_HOME']
                @java_home = ENV['JAVA_HOME']
                puts_warning "Java home has not been defined by project.",
                             "Use Java home specified by env. variable."
            else
                compile_version_class()
                res = `java -classpath #{bdir}/lib #{GET_VER_CLASS}`
                res = res.split("\n")
                @java_version, @java_home = res[0].chomp(), res[1].chomp()
                #!!!puts_warning "Found Java '#{@java_home}'" if @java_home
            end
        end
        raise 'Java home cannot be identified.' if !@java_home
        @java_home = @java_home.gsub('\\','/')

        # identify Java Version
        if !@java_version
            jpath = "#{@java_home}/bin/java"
            ENV['classpath']="@classpath;#{bdir}/lib"
            @java_version = `#{jpath} #{GET_VER_CLASS}`
            @java_version = @java_version.split("\n")[0]
        end

        raise "Java version cannot be identified for #{@java_home}" if !@java_version

        @java_version = @java_version.chomp()
        @java_version_high = @java_version[/^[0-9]+/]
        @java_version_low  = @java_version[/\.[0-9]+/]
        @java_version_low  = @java_version_low[1, @java_version_low.length]

        #  add JDK classes for old java
        if @java_version_low == '1'
            jdk_lib = "#{@java_home}/lib/classes.zip"
            if @classpath
                @classpath=jdk_lib + File::PATH_SEPARATOR + @classpath
            else
                @classpath=jdk_lib
            end
        end

        build_classpath()
    end

    def build() end

    def expired?() false end

    def build_classpath()
        @root = $project_home
        @libs.each { |lib|
            lib = "#{@root}/#{lib}" if !(Pathname.new lib).absolute?
            @classpath = @classpath ? @classpath + File::PATH_SEPARATOR + lib : lib
            if File.directory?(lib)
                Dir["#{lib}/*.jar"].each { |i|  @classpath = @classpath + File::PATH_SEPARATOR + i }
            end
        }
    end

    def javac()   jtool('javac')   end
    def javadoc() jtool('javadoc') end
    def java()    jtool('java')    end
    def jar()     jtool('jar')     end

    def what_it_does() "Initialize Java environment #{@java_version} '#{@name}' " end

    protected

    def compile_version_class()
        bdir = $lithium_home
        if !File.exists?("#{bdir}/lib/#{GET_VER_CLASS.gsub('.', '/')}.class")
            puts_warning "Lithium classes have not been compiled yet."
            puts "Compile lithium classes."
            r = system "javac  -d #{bdir}/lib #{bdir}/#{GET_VER_SRC}"
            raise "Utility class cannot be compiled '#{bdir}/#{GET_VER_SRC}'" if !r
        end
    end

    def jtool(tool)
        path = "#{@java_home}/bin/#{tool}"
        return path if File.exists?(path) || (File::PATH_SEPARATOR && File.exists?(path + '.exe'))
        puts_warning "'#{path}' not found. Use '#{tool}' as is"
        tool
    end
end


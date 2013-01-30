require 'gravity/lithium/util/misc'
require 'gravity/lithium/java-artifact/base'


class JavaFileRunner < FileCommand
    required JAVA

    def build()
        Dir.chdir(@root)

        raise "Running '#{@name}' failed." if run() != 0
    end

    def what_it_does() "Run '#{name}' class" end

    def cmd()
        clpath  = java().classpath
        clpath  = clpath ? "-classpath \"#{clpath}\"" : ''
        "#{java().java()} #{clpath} #{@options  ? @options : ''}"
    end

    def run() raise NotImplementedError, '' end
end

class RunJavaCode < JavaFileRunner
    def initialize(name)
        super
        REQUIRE "compilejava:#{name}"
    end

    def run() exec4(cmd(), fetch_class_name()) end

    def fetch_class_name()
        file = fullpath()
        pkgname = FileUtil.grep(file, /^package[ \t]+([a-zA-Z0-9_.]+)[ \t]*;/)
        clname  = FileUtil.grep(file, /\s*public\s+(static\s+)?(abstract\s+)?class\s+([a-zA-Z][a-zA-Z0-9_]*)/)

        raise 'Class name cannot be identified.' if clname.nil?
        puts_warning 'Package name is empty.' if pkgname.nil?

        pkgname = pkgname[1] if pkgname
        pkgname ? "#{pkgname}.#{clname[-1]}": clname[-1]
    end
end

class RunJAR < JavaFileRunner
    #!!! arguments have to be generalized
    def run()
        command = [cmd(), "-jar", @name, @arguments ? "#{@arguments.join(' ')}" : '']
        command = command.join(' ')
        exec4(command)
    end
end

class RunJavaClass < RunJavaCode
    def fetch_class_name()
        n = @name.dup
        n[/[.]class/] = ''
        n
    end
end

class RunTestCases < RunJavaClass
    def run(file, jdk)
        msg "Run #{file}"

        res = FileUtil.grep(file, /#test-case=/)
        raise "File '#{file}' doesn't have bound testcases to be executed." if res.nil?

        file = "#{@root}/#{res.post_match.chomp()}"
        raise "Test case '#{file}' cannot be found." if !File.exists?(file)
        super(file);
    end
end

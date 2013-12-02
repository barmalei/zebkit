require 'lithium/core-artifact/base'
require 'lithium/file-artifact/acquired'
require 'lithium/file-artifact/base'
require 'lithium/util/misc'

require 'rexml/parsers/pullparser'


class GenericBuild
    @@to_be_compiled = [ 'cpp', 'c', 'php', 'java', 'rb', 'py', 'tt', 'treetop', 'xml' ]

    def self.new(*args, &block)
        name = args[0]
        i    = name.index('.lithium/')
        if i 
            if File.basename(name) == MetaGeneratedDirectory::CONTENT_FN
                begin
                    args[0] = File.dirname(name) 
                    return Artifact.artifact(*args)
                rescue NameError
                end
                return MetaGeneratedDirectory.new(*args, &block)
            else    
                return Artifact.artifact(*args)
            end
        else
            ext = File.extname(name)
            ext = ext[1, ext.length-1] if ext && ext.length > 0
            return Artifact.artifact("compile:#{name}") if @@to_be_compiled.index(ext.downcase())
            raise "Unknown build action for '#{name}' artifact"
        end
    end
end

class RunShell < FileCommand
    def build() 
        raise "Script '#{@name}' running failed" if exec4(fullpath()) != 0
    end
end  

class ValidateXML < FileCommand
    def build() 
        parser = REXML::Parsers::PullParser.new(File.new(fullpath(), 'r'))
        parser.each() { |res|
            raise res[1] if res.error?
        }
    end
    
    def what_it_does() "Validate #{@name} XML file" end
end

class OpenHTML < FileCommand
    def build() 
        `open #{fullpath()}`
    end
end

class StringRunner < Artifact
    def build() 
        raise 'Script string has not been defined' if !@script
        r = Open4.popen4(cmd()) { | pid, stdin, stdout, stderr |
            stdin << @script
            stdin.close
            
            l = stderr.read()
            $stderr.puts l if l.length != 0

            l = stdout.read()
            $stdout.puts(l)  if l.length != 0
        }
        raise 'Run failed' if r.exitstatus != 0
    end
    
    def what_it_does() 
        formated, line = [], 1
        @script.each_line() { |l|
            formated << "  #{line}: #{l.strip}" 
            line += 1
        }
        "Run string by #{self.class}: {\n#{formated.join("\n")}\n}\n\n" 
    end
    
    def cmd() raise "Not implemented" end
end


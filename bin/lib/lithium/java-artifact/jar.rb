require 'fileutils'
require 'tempfile'

require 'lithium/file-artifact/command'
require 'lithium/file-artifact/acquired'
require 'lithium/java-artifact/base'

class ExtractJAR < FileCommand
    def initialize(*args)
        super
        @destination ||= 'tmp'
    end 

    def build() 
        FileUtils.mkdir_p(@destination) if !File.exists?(@destination)
        Dir.chdir(@destination)
        `jar -xfv '#{fullpath()}'`.each { |i|
            puts " :: #{i.chomp}"
        }
    end

    def what_it_does() "Extract files from '#{@name}' to '#{@destination}'" end
end

class FindClassInJAR < FileCommand
    def build()
        c = 0 
        @class_name = @class_name.gsub('.', '/')
        `jar -ft '#{fullpath()}'`.each { |item| 
            index = item.chomp.index(@class_name)
            if index == 0
                puts "#{@name}:#{@class_name}:" 
                c += 1
            end
        }
    end

    def what_it_does() "Try to find #{@class_name} class in '#{@name}'" end
end

class JARFile < ZipFile
    def initialize(*args)
        super
        @base ||= "classes" 
    end

    def command(list) "jar cf '#{fullpath()}' #{list.join(' ')}" end
end


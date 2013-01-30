require 'fileutils'
require 'pathname'

require 'gravity/lithium/core-artifact/base'
require 'gravity/lithium/util/misc'
require 'gravity/lithium/util/loggable'

class FileArtifact < Artifact
    def initialize(name, root=$project_home)  
        root ||= File.expand_path('.')  
        raise "Root '#{root}' is invalid" if !File.exists?(root) or !File.directory?(root)  
        @root = File.expand_path(root)
        super(name)
        raise "Absolute path ('#{@name}') usage is not allowed." if Pathname.new(@name).absolute?()
    end

    def fullpath(p = @name) "#{@root}/#{p}"  end
        
    def list_items()
        f = fullpath()
        yield @name, File.exists?(f) ? File.mtime(f).to_i() : -1 
    end

    def expired?() false end
    
    def mtime()
        f= fullpath()
        File.exists?(f) ? File.mtime(f).to_i() : -1
    end
end

class PermanentFile < FileArtifact
    def initialize(*args)  
        super
        raise "File '#{@name}' doesn't exist" if !File.exists?(fullpath())
    end

    def mtime() File.mtime(fullpath()).to_i() end
end

class Directory < FileArtifact
    def initialize(*args)  
        super
        raise "File '#{@name}' is not a directory." if !File.directory?(fullpath())
    end
end

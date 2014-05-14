require 'fileutils'

require 'lithium/file-artifact/command'
require 'lithium/java-artifact/runner'
require 'lithium/file-artifact/acquired'


class JS < Artifact
    extend Artifact::Singletone

    attr :compressorClassName

    def initialize(*args)
        super
        @compressorClassName ||= "YUICompressor"
        @compressorOptions = []
    end    

    def compressor()
        c = Object.const_get(@compressorClassName)
        return c.new
    end

    def build() end
    def what_it_does() "Initialize JavaScript environment '#{@name}'" end
end


class RunJavaScript < FileCommand
    def build()
        f = fullpath()
        r = RunJAR.new("tools/rhino/js.jar", $lithium_home) {
            @arguments = [  '-version', '170', '-w', "'#{f}'", $project_home ]
        }
        return r.build()
    end

    def what_it_does() "Run '#{@name}' script" end
end


class YUICompressor 
    @@options = []

    def self.options(opt) 
        @@options = opt
    end

    def compress(infile, outfile)
        raise "Input file '#{infile}' cannot be found" if !File.exists?(infile) || File.directory?(infile)
        raise "Output file is identical to input file '#{f}'" if outfile == infile
        opt = ["'#{infile}'", "-o", "'#{outfile}'"]
        opt << @@options
        r = RunJAR.new("tools/yuicompressor/yuicompressor.jar", $lithium_home) {
            @arguments = opt
        }
        r.build()
    end
end

class UglifyCompressor
    @@options = []
    @@lib     = "#{$project_home}/node_modules/uglify-js" 

    def self.lib(lib) 
        @@lib = lib
    end

    def self.options(opt) 
        @@options = opt
    end

    def compress(infile, outfile)
        raise "Input file '#{infile}' cannot be found" if !File.exists?(infile) || File.directory?(infile)
        raise "Output file is identical to input file '#{f}'" if outfile == infile
        opt = ["#{@@lib}/bin/uglifyjs"]
        opt << @@options
        opt << infile
        opt << ">"
        opt << outfile
        raise "" if exec4(opt.join(' ')) != 0
    end
end

class CompressJavaScript < FileCommand
    required JS

    def initialize(name)
        super
    end

    def build()
        f = fullpath()

        if @output_dir
            o = File.join(File.join($project_home, @output_dir), File.basename(f))
        else
            e = File.extname(f)
            n = File.basename(f).chomp(e)
            o = File.join(File.dirname(f), "#{n}.min#{e}")
        end

        js.compressor.compress(f, o)
    end

    def what_it_does() "Compress (#{js.compressorClassName}) '#{@name}' JS script" end
end

class CompressedJavaScript < FileArtifact
    required JS

    def initialize(name)
        super

        if !@source
            s = ".min.js"
            i = @name.rindex(s)
            raise "JS compressed file name '#{@name}' cannot be used to identify input file name automatically" if i.nil? || i != (@name.length - s.length)
            @source = @name[0, i+1] + "js"
        end
    end

    def expired?()
       return !File.exists?(fullpath())
    end

    def cleanup() 
       File.delete(fullpath()) if File.exists?(fullpath())     
    end

    def build()
        sfp = File.join($project_home, @source)
        raise "Source file cannot be identified" if !File.exists?(sfp)
        js.compressor.compress(sfp, fullpath())
    end

    def what_it_does() "Compress (#{js.compressorClassName}) '#{@source}' JS script" end
end

class CombinedJavaScript < MetaGeneratedFile
    def build()
        f = File.new(fullpath(), "w")
        f.write("(function() {\n\n")
        @meta.list_items(true) { |n,t|
            puts " add #{n}"
            f.write(File.readlines(n).join())
            f.write("\n\n")
        }
        f.write("\n\n})();")
        f.close()
    end

    def cleanup() 
       File.delete(fullpath()) if File.exists?(fullpath())     
    end

    def what_it_does() "Combine JavaScript files into '#{@name}'" end
end

class RunJavaScriptTest < RunJavaScript
    def build()
        super
    end

    def what_it_does
        "Run test case '#{name}'"
    end
end

class GenerateJavaScriptDoc < FileArtifact
    def initialize(name)
        super
        @config   ||= nil
        @template ||= nil
        @input    ||= "."
        raise "Name has to be directory" if File.exists?(fullpath()) && !File.directory?(fullpath()) 
    end
    
    def expired?()
       return !File.exists?(fullpath())
    end

    def cleanup
        FileUtils.rmtree(fullpath()) if File.exists?(fullpath()) && File.directory?(fullpath()) 
    end

    def build
        p = fullpath()
        raise "Invalid artifact path '#{p}'" if File.exists?(p) && !File.directory?(p)

        args = [ "-o ", p, "-n", "-C" ]

        if !@template.nil? 
            t = File.join($project_home, @template)
            raise "Invalid template path '#{t}'" if !File.exists?(t) || !File.directory?(t) 
            args << "-t " << t             
        end

        if !@config.nil? 
            c = File.join($project_home, @config)
            raise "Invalid template path '#{c}'" if !File.exists?(c) || File.directory?(c) 
            args << "-c " << c
        end

        istmp = false
        i = File.join($project_home, @input)
        raise "Invalid input path '#{i}'" if !File.exists?(i)
        if !File.directory?(i)
            tmp = Dir.mktmpdir()
            FileUtils.cp(i, tmp.to_s)
            i = tmp
            istmp = true
        end

        args << i    
        exec4("yuidoc", args.join(' '))
        FileUtils.rmtree(i) if istmp
    end

    def what_it_does()
        "Generate '#{@name}' JavaScript doc by '#{@input}'"
    end
end





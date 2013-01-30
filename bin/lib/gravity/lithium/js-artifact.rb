require 'gravity/lithium/file-artifact/command'
require 'gravity/lithium/java-artifact/runner'

class RunJavaScript < FileCommand
    def build()
        f = fullpath()
        r = RunJAR.new("tools/js/rhino/js.jar", $lithium_home) {
            @arguments = [  '-version', '170', '-w', "'#{f}'", $project_home ]
        }
        r.build()
    end

    def what_it_does() "Run '#{@name}' script" end
end

class CompressJavaScript < FileCommand
    def initialize(name)
        super
        @options ||= []
    end

    def build()
        f = fullpath()

        if @output_dir
            o = File.join(File.join($project_home, @output_dir), File.basename(f))
        else
            e = File.extname(f)
            n = File.basename(f).chomp(e)
            o = File.join(File.dirname(f), "#{n}.min.#{e}")
        end

        CompressJavaScript.compress(f, o, @options)
    end

    def self.compress(infile, outfile, options)
        raise "Input file '#{infile}' cannot be found" if !File.exists?(infile) || File.directory?(infile)
        raise "Output file is identical to input file '#{f}'" if outfile == infile
        opt = ["'#{infile}'", "-o", "'#{outfile}'"]
        opt << options
        r = RunJAR.new("tools/js/yuicompressor.jar", $lithium_home) {
            @arguments = opt
        }
        r.build()
    end

    def what_it_does() "Compress '#{@name}' JS script" end
end

class CompressedJavaScript < FileArtifact
    def initialize(name)
        super

        @options ||= []
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

    def build()
        sfp = File.join($project_home, @source)
        raise "Source file cannot be identified" if !File.exists?(sfp)
        CompressJavaScript.compress(sfp, fullpath(), @options)
    end

    def what_it_does() "Compress '#{@source}' JS script" end
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

    def what_it_does() "Combine JavaScript files into '#{@name}'" end
end


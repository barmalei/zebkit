require 'lithium/file-artifact/base'
require 'lithium/java-artifact/base'
require 'lithium/util/loggable'


class GenerateJavaDoc < FileArtifact
    include LogArtifactItems
    required JAVA
    
    def initialize(*args)
        super
        @sources ||= 'src/java' 
        raise "Source dir '#{@sources}' cannot be found" if !File.directory?("#{@root}/#{@sources}") 

        if !@pkgs
            puts_warning 'Package list has not been specified. Build it automatically.'
            @pkgs = []
     
            Dir.chdir("#{@root}/#{@sources}")
            Dir["**/*"].each { | n |
                next if n =~ /CVS$/ || n =~ /[.].*/
                @pkgs << n if File.directory?(n) 

            }
        end

        raise "Packages have not been identified" if @pkgs.length == 0

        @pkgs.each() { |p|
            p = File.join(@root, @sources, p.tr('.', '/'))
            raise "Package '#{p}' cannot be found" if !File.exists?(p)
        }
    end

    def list_items() 
        Dir.chdir(@root)
        Dir["#{@sources}/**/*.java"].each { | n |
            yield n, File.mtime(n).to_i
        }
    end

    def pre_build() cleanup() end

    def build()
        p = @pkgs.collect() { |e| e.tr('/', '.') }
        puts ['Packages:'] << p

        j = java()
        system "#{j.javadoc()} -classpath '#{j.classpath}' -d '#{fullpath()}' -sourcepath '#{@root}/#{@sources}' #{p.join(' ')}"
        raise 'Java doc generation error.' if $? != 0
    end
    
    def cleanup() FileUtils.rm_r(fullpath()) if  File.exists?(fullpath()) end
    def expired?() !File.exists?(fullpath()) end 
    def what_it_does() "Generate javadoc into '#{@name}'" end
end


class FindClassAction < Artifact
    def build_()
        result = []
        path = @target.name.gsub('.', '/') + '.class'
        msg "Looking for '#{path}' class."

    java().classpath.split(File::PATH_SEPARATOR).each { |i|
      if File.directory?(i)
        Dir["#{i}/#{path}"].each { |file|
          next if File.directory?(file)
          result << file
        }
        result = result + JAR.find(i, @target.name)
      else
        wmsg "File '#{i}' doesn't exist." if !File.exists?(i)
      end
    }
    wmsg "Class #{@target.name} not found." if result.length == 0
    result
  end
end

class DecompileClassAction < Artifact
  attr_reader :decompile_opts, :decompile_dir

  def initialize(name)
    super(name)
    @decompile_dir  = 'src/decompile'  if @decompile_dir.nil?
    @decompile_opts = '-& -o -r -s java' if @decompile_opts.nil?
    Utils.mkdirs("#{Artifact.root}/#{@decompile_dir}")
  end

  def build_()
    dest = Artifact.root/@decompile_dir
    msg "Decompile destination directory: '#{dest}'"

    fcl = FindClassAction.new(':find-class')
    fcl.target = @target

    result = []
    fcl.build_().each { |i|
      msg "Decompile #{i}"
      i = JAR.extract(i) if i.index(/.jar\//i)
      `#{$lithium_home}/tools/java/jad/jad #{@decompile_opts} -d #{dest} #{i}`
      raise 'Decompile error.' if $? != 0
    }
    result
  end
end



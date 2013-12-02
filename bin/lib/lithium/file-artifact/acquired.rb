require 'lithium/file-artifact/set'
require 'open4'


class MetaFile < FileArtifact
    include LogArtifactItems

    def list_items(check_existance = false)
        return if !File.exists?(fullpath())

        if File.directory?(fullpath())
            puts_error "Template points to '#{fullpath()}' directory"
            return
        end

        Dir.chdir(@root)
        File.readlines(fullpath()).each { | i |
            i = i.strip
            next if i.length == 0 || i[0,1]=='#'

            if i[0,1] == ':'
                raise "Unknown command '#{i}'" if !@command_listener
                @command_listener.handle_command(i)
                next
            end

            i = PatternString.new(i)
            if i.is_fmask
                cc = 0
                Dir[i].each { | j |
                    yield j, File.mtime("#{@root}/#{j}").to_i()
                    cc += 1
                }
                raise "Mask '#{@name}>#{i}' doesn't match any file" if cc == 0 && check_existance
            else
                p = "#{@root}/#{i}"
                raise "File '#{@name}>#{i}' cannot be found" if check_existance && !File.exists?(p)
                yield i, File.exists?(i) ? File.mtime(p).to_i() : -1
            end
        }
    end

    def build() end
    def what_it_does() '' end

    def command_listener(l)
        raise "Object '#{l}' does not declare 'handle_command(cmd)' method" if l && !l.respond_to?(:handle_command)
        @command_listener = l
    end
end

class AcquiredFile < FileArtifact
    def cleanup() File.delete(fullpath) if File.exists?(fullpath()) end
    def expired?() !File.exists?(fullpath()) end
    def build() raise NotImplementedError, '' end
end

class MetaGeneratedFile < AcquiredFile
    def initialize(*args)
        super
        @meta = META()
        REQUIRE @meta
    end

    def META() MetaFile.new(".lithium/#{@name}", @root) end
    def what_it_does() "Create file by '#{@meta.name}'" end
end

class ZipFile < MetaGeneratedFile
    def initialize(*args)
        super
        raise "Zip file name points to directory #{fullpath()}" if File.exists?(fullpath) && File.directory?(fullpath)
        @options ||= '-9q'
        @base ||= @root
    end

    def pre_build() cleanup() end

    def build()
        Dir.chdir(@root)
        list = []
        @meta.list_items(true) { |n,t| list << "#{n}" }

        if list.length > 0
            if @base
                list.each_index { |i| list[i] = list[i].gsub("#{@base}/", '') }
                Dir.chdir(@base)
            end

            list.each() { |f| raise "'#{f}' file cannot be found" if !File.exists?(f) }
            list = list.collect() { |f| "'#{f}'" }
            raise 'Archive building failed.' if exec4(command(list)) != 0
        else
            puts_warning 'No file to be packed.'
        end
    end

    def build_failed() cleanup() end
    def what_it_does() "Create ZIP file by '#{@meta.name}'" end

    def command(list)
        zip_path  = "#{$lithium_home}/tools/zip/zip"
        zip_path += '.exe' if File::PATH_SEPARATOR == ';'
        zip_path  = 'zip' if !File.exists?(zip_path)
        "#{zip_path} #{@options} #{fullpath()} #{list.join(' ')}"
    end
end

# Copy file format:
#   1. pattern: src/test.java                  - copy "test.java" file to "."
#   2. pattern: src/test.java && preserve_path - copy "test.java" file to "./src"
#   3. pattern: src/lib                        - copy "lib" directorty to "./lib"
#   4. pattern: src/lib && preserve_path       - copy "lib" directorty as "./src/lib"
class MetaGeneratedDirectory < MetaGeneratedFile
    CONTENT_FN = 'list_of_files'

    def cleanup()
        @preserve_path = false
        fp = fullpath()
        @meta.list_items() { |n, t|
            p =  @preserve_path ? "#{fp}/#{n}" : "#{fp}/#{File.basename(n)}"

            next if !File.exists?(p)
            if File.directory?(p)
                if @preserve_path
                    FileUtils.rm_r("#{fp}/#{n.split('/')[0]}")
                else
                    FileUtils.rm_r(p)
                end
            else
                FileUtils.rm(p)
            end
        }
    end

    def expired?()
        return true if super

        @preserve_path = false
        fp = fullpath()
        @meta.list_items() { |n, t|
            p =  @preserve_path ? "#{fp}/#{n}" : "#{fp}/#{File.basename(n)}"
            return true if !File.exists?(p)
        }
        false
    end

    def pre_build() cleanup() end

    def build()
        @preserve_path = false
        fp = fullpath()
        FileUtils.mkdir_p(fp) if !File.exists?(fp)

        Dir.chdir(@root)
        @meta.list_items(true) { |n, t|
            s = "#{@root}/#{n}"
            raise "File '#{s}' cannot be found" if !File.exists?(s)

            d = fp
            if @preserve_path
                d = "#{d}/#{File.dirname(n)}"
                FileUtils.mkdir_p(d) if !File.exists?(d)
                d = "#{d}/#{File.basename(n)}"
            end

            if File.directory?(s)
                if @preserve_path
                    FileUtils.cp_r(s, "#{fp}/#{n}")
                else
                    FileUtils.cp_r(s, "#{fp}/#{File.basename(n)}")
                end
            else
                FileUtils.cp(s, d)
            end
        }
    end

    def handle_command(c)
        i = c.index(':preserve_path')
        if i == 0
            @preserve_path = true
        else
            raise "Unknown command '#{c}'"
        end
    end

    def META()
        meta = MetaFile.new(".lithium/#{name}/#{CONTENT_FN}")
        meta.command_listener(self)
        meta
    end

    def what_it_does() "Create folder '#{@name}' and its content" end
end

class MetaGeneratedFileSet < FileSet
    attr_reader :template

    def initialize(*args)
        super
        @template = "#{@root}/.lithium/#{@name}"
    end

    def list_items()
        Dir.chdir(template_dir())
        Dir[@name].each { | i |
            fp = "#{@root}/#{i}"
            yield i, File.exists?(fp) ? File.mtime(fp).to_i() : -1
        }
    end

    def template_dir() "#{@root}/.lithium" end
end

class MetaFileMapper < Artifact
    def self.new(*args)
        args[0]['.lithium/'] = ''
        if File.basename(args[0]) == MetaGeneratedDirectory::CONTENT_FN
            begin
                args[0] = File.dirname(args[0])
                return Artifact.artifact(*args)
            rescue NameError
            end
            return MetaGeneratedDirectory.new(*args)
        else
            return Artifact.artifact(*args)
        end
    end
end






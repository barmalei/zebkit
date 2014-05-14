require 'lithium/file-artifact/set'


class FileCommand < FileArtifact
    def build() raise NotImplementedError, 'Not implemented' end
    def expired?() true end
end

class CopyFile < FileCommand
    def initialize(*args)
        super
        @ignore_hidden_files ||= true  

        if !@destination
            self.destination = $arguments[0] if $arguments.length > 0 && $arguments[0]
        else
            self.destination = @destination 
        end
    end
        
    def destination=(v) 
        raise 'Destination is not defined.' if !v

        if Pathname.new(v).absolute?() 
            puts "Destination is absolute path '#{v}'."
        else
            v = File.join($project_home, v)
        end  

        v = File.join(v, File.basename(fullpath())) if !File.directory?(fullpath()) && File.directory?(v)

        @destination = File.expand_path(v)
    end 
   
    def expired?
        validate(); 
        return !File.exists?(@destination) || File.mtime(fullpath()).to_i > File.mtime(@destination).to_i
    end

    def cleanup()
    end

    def build()
        validate()
        source = fullpath()
        if File.directory?(source)
            filter = @ignore_hidden_files ? /^[\.].*/ : nil
            FileUtil.cpdir(source, @destination, filter)
        else
            FileUtils.cp(source, @destination)
        end
    end
    
    def validate
        raise 'Destination is not defined.' if !@destination
        raise "Source file #{source} cannot be found" if !File.exists?(fullpath())
    end

    def what_it_does() "Copy from: #{fullpath()}\n     to  : #{@destination}" end
    
    attr_reader :destination
end

class RmFile < FileCommand
    def initialize(*args)
        super
        @recursive ||= false;   
    end

    def build()
        path = fullpath()
        if File.directory?(path)
             FileUtils.remove_dir(path)
        else
             File.delete(path)
        end
    end

    def expired?() 
        !File.exists(fullpath())         
    end
end


class GREP < FileMask
    def initialize(*args) 
        super
        @auto_detect_comment ||= true
        if !@auto_detect_comment
            @singleline_comment ||= nil
            @multilines_comment ||= nil
        else
            raise "Comment expression cannot be set. It is autodected." if @singleline_comment || @multilines_comment
        end
        @grep ||= 'TODO'
    end
    
    def build()
        Dir.chdir(@root)
        list_items() { |n, t|
            next if File.directory?(n)
            bcomment_started, line_num = false, 0
            @singleline_comment, @multilines_comment = GREP.detect_commet(n) if @auto_detect_comment
    
            File.readlines(n).each() { | line |
                line_num += 1
                line = line.chomp.strip()
                next if line.length == 0

                lcomment_started = false
                bcomment_started = line.index(@multilines_comment[0]) if @multilines_comment && !bcomment_started
                lcomment_started = line.index(@singleline_comment)    if @singleline_comment && !bcomment_started
                if !bcomment_started && !lcomment_started
                    $~ = nil
                    if line.index(@grep)
                        if $~
                            puts "#{n}:#{line_num}:#{line}"  
                        else 
                            puts "#{n}:#{line_num}:#{line}"  
                        end
                    end
                end
                bcomment_started = false if bcomment_started && line.index(@multilines_comment[1])
            }
        }
    end
    
    def what_it_does() "Looking for '#{@grep}' in '#{@name}'" end
    
    protected 
    
    def self.detect_commet(n) 
        e = File.extname(n) 
        e = e && e.length > 1 ? e[1, e.length-1] : nil
        return [nil, nil] if !e
        @comments[e]
    end

    @comment_set1 = [  /[ ]*\/\//,  [ /[ ]*\/\*/, '*/' ] ]
    @comment_set2 = [  /[ ]*#/,  nil ]
    @comment_set3 = [  /[ ]*\/\//,  [ /[ ]*\{/, '}' ] ]
    
    @comments = { 'java' => @comment_set1, 
                  'cpp'  => @comment_set1, 
                  'c'    => @comment_set1, 
                  'php'  => @comment_set1,
                  'rb'   => @comment_set2,
                  'py'   => @comment_set2,
                  'sh'   => @comment_set2,
                  'pas'  => @comment_set3  }
end


class BackupFile < PermanentFile
    def build()
        if @destination_dir.nil?
            wmsg 'Destination directory is not defined. Use default one.'
            @destination_dir = @root/'backup' if @destination_dir.nil?
        end
        
        template_name = (@name == '.') ? 'project-root' : @name
        template_path = $project_def/template_name + '.backup'

        if @backup_descriptor && !File.exists?(template_path)
            template_path= $project_def/@backup_descriptor
            raise "Backup descriptor cannot be found #{template_path}" if !File.exists?(template_path)
        end
        
        template_path = nil if !File.exists?(template_path)
        
        Dir.chdir($project_home)
        msg "Backup '#{@name}' to '#{@destination_dir}'"
        if template_path
            File.readlines(template_path).each { |l|
                l = l.chomp
                next if l.length == 0
                msg "Backup by '#{l}' mask"
                cpbymask(l, @name, @destination_dir)
            }
        else
            wmsg 'No backup descriptor file was found.'
            wmsg 'All available files will be copied.'
            cpbymask('**/*', @name, @destination_dir)
        end
    end
    
    private
    
    def cpbymask(mask, src_dir, dest_dir)
        Dir[src_dir/mask].each { |f|
         if File.directory?(f)
             FileUtils.mkdir_p(f) if !File.exists?(f)
         else
             cf = f.gsub('../', '')
             dir = File.expand_path(dest_dir/File.dirname(cf))
             FileUtils.mkdir_p(dir) if !File.exists?(dir)
             dest_file = dest_dir/cf
             raise "File '#{dest_file}' already exists" if File.exists?(dest_file)
             File.cp(f, dest_file)
         end
        }
    end
end


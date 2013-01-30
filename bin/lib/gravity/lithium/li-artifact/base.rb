require 'fileutils'

require 'gravity/lithium/file-artifact/command'
require 'gravity/common/platform'
require 'gravity/lithium/util/misc'


class INIT < FileCommand
    def initialize(*args)
        super
        @template ||= 'generic' 
    end

    def build()
        path = fullpath()
        raise "File '#{path}' doesn't exist" if !File.exists?(path)
        raise "File '#{path}' is not a directory" if !File.directory?(path)
        lp = File.expand_path("#{path}/.lithium")
        
        if File.exists?(lp)
            raise "'.lithium' file existence prevents '.lithium' folder creation" if !File.directory?(lp) 
            puts_warning "Project '#{lp}' has lithium stuff already"
        else
            lh = "#{$lithium_home}/templates/#{@template}/.lithium"
            begin
                l = "#{lp}/project.layout"
                FileUtils.cp_r(lh, path)
                FileUtil.replace_placeholders(l, '$description', @project_desc) if @project_desc
                FileUtil.replace_placeholders(l, '$version', @project_version) if @project_version
            rescue
                FileUtils.rm_r lp if File.exists?(lp)
                raise
            end
        end
    end
   
    def what_it_does() "Generate lithium stuff for '#{@name}'" end
end

class HELP < FileCommand
    @@map = { 'java'=>'helps/jdk-1.5.0.chm', 'rb'=> 'helps/ProgrammingRuby.chm', 'py' => 'helps/python-2.5.chm'  }
    
    def initialize(name, root = $lithium_home, &block)
        n = @@map[name]
        raise NameError.new("No help is available for '#{name}'") if !n
        super(n, root, &block)
        @word ||= ''
    end
    
    def build() 
        raise "Cannot open #{@name}" if exec4(command(), "'#{fullpath()}'") != 0
    end        
    
    def command() 'open' end
    def what_it_does() "Open '#{@name}' help" end
end

class INSTALL < Artifact
    def initialize(name = 'INSTALL')
        super
        @script_name ||= 'lithium' 

@nix_script = "#!/bin/bash 

LITHIUM_HOME=#{$lithium_home}

vc=\"ruby \\\"$LITHIUM_HOME/lithium.rb\\\" \"
for ((i=1; i<=$\#; i++))
do
  vn=\"$\"$i
  va=$(eval echo $vn)
  vc=\"$vc \\\"$va\\\"\" 
done;

eval \"$vc\"
"
@win_script="
@set LITHIUM_HOME=#{$lithium_home}
@ruby %LITHIUM_HOME%/lithium.rb %*
"
        if Platform::OS == :unix
            @script_path = "/usr/bin/#{@script_name}"
            @script = @nix_script
        elsif Platform::OS == :win32
            win = ENV['WINDIR'].dup
            win["\\"] = '/'
            win = FileUtil.correct_win_path(win)
            @script_path = "#{win}/#{@script_name}.bat"
            @script = @win_script
        else
            raise "Unsupported platform #{Platform::OS}"
        end
    end

    def build()
        if File.exists?(@script_path)
            puts_warning "File '#{@script_path}' already exists"
            File.open(@script_path, 'r') { |f|
                l = f.readlines()
                l = l.join(' ')
                if l.index('LITHIUM_HOME').nil?
                    raise "File '#{@script_path}' cannot be overwritten, it is not lithium script\nTry to use another name for deployed script"
                end
            }
            puts "Install '#{@script_path}' anyway"
        end 
        File.open(@script_path, 'w') { |f| 
            f.print @script 
            f.chmod(0007) if !Platform::OS == :win32
        }    
    end
    
    def what_it_does() "Install Lithium '#{@script_path}' script" end
end

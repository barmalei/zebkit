require 'gravity/lithium/core-artifact/base'
require 'gravity/common/platform'
require 'fileutils'


class TextMateBundle < Artifact
    def initilalize(*args) 
        super
        raise "Unsupported plafrom #{Platform::IMPL}, only MacOS X is supported." if Platform::IMPL != :macosx
        @command ||= 'Command is not defined'
    end

    def build()
        if @command == 'install'
            install()
        elsif @command == 'remove'
            remove()
        end
    end

    def li_tm_bundle()
        "#{$lithium_home}/lib/gravity/lithium/textmate/Lithium.tmbundle"
    end

    def tm_bundles_folder()
        "#{ENV['HOME']}/Library/Application\ Support/TextMate/Bundles"
    end

    def install()
        src  = li_tm_bundle()
        dest = tm_bundles_folder()
        raise "Lithium textmate bundle has been already installed" if File.exists?("#{dest}/Lithium.tmbundle")
        FileUtils.cp_r(src, dest)
    end

    def remove()
        src = "#{tm_bundles_folder()}/Lithium.tmbundle"
        raise "Nothing to be removed" if !File.exists?(src) 
        FileUtils.rm_r(src)
    end
    
    def what_it_does() 
        if !@command || (@command != 'install' && @command != 'remove')
            "The command has not been specified. Use one of the following command:\n" +
            "  install - to install lithium text mate bundle\n" +
            "  remove  - to uninstall lithium bundle"
        else
            "#{@command} Lithium textmate bundle"
        end
    end
end








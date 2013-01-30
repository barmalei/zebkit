require 'fileutils'
require 'tempfile'
require 'open4'
require 'open3'

$exec4_cmd = nil

class Version
    attr_reader :version
    
    def initialize(version) @version = version end
    def <=>(v) self.compare(@version, v.to_s) end
    def to_s() return @version end

    def self.compare(ver1, ver2)
        ver1 = '' if ver1.nil?
        ver2 = '' if ver2.nil?
        return 0 if  ver1 == ver2
        pvers1, pvers2 = ver1.split('.'), ver2.splitplit('.')
        pvers1.each_index { |i|
          break if pvers2.length <= i
          return -1 if pvers1[i] < pvers2[i]
          return  1 if pvers1[i] > pvers2[i]
        }
        pvers1.length > pvers2.length ? 1 : -1
    end
end

def exec4(*args, &block)
    def read_std(std, out, &block)
        while  (rr = IO.select([std], nil, nil, 2)) != nil
            next if rr.empty?
            begin
                l = std.readline()
                if l
                    if block
                        block.call(l)
                    else
                        out.puts l
                    end
                end
            rescue IOError=>e
                break
            end
        end
    end
    
    def read_all(pid, stdout, stderr, sout, serr, &block)
        while true
            begin
                Process.getpgid(pid) 
            rescue Errno::ESRCH
                begin
                    read_std(stdout, sout, &block)
                    read_std(stderr, serr)
                rescue
                end
                break
            end
            read_std(stdout, sout, &block)
            read_std(stderr, serr)
        end
    end
    
    begin
        cmd = args.join(' ')
        $exec4_cmd = cmd
        if RUBY_VERSION < '1.9'
            r = Open4.popen4(cmd) { | pid, stdin, stdout, stderr |
                read_all(pid, stdout, stderr, $stdout, $stderr, &block)
            }
            return r.exitstatus if r
            return 1
        else
            r = Open3.popen3(cmd) { | stdin, stdout, stderr, thread |
                read_all(thread.pid, stdout, stderr, $stdout, $stderr, &block)
                return thread.value 
            }   
        end
    ensure
        $exec4_cmd = nil
    end
end

class PatternString < String
    attr_reader :reg_exp, :is_fmask

    def initialize(s)
        s = s.to_s if s.kind_of?(Symbol)
        if s.length > 3 && s[0,1] == '/' && s[-1..-1] == '/'
            @reg_exp = Regexp.new(s[1..-2])
        else
            @is_fmask = s.index(/[\?\*\{\}]/) != nil    
        end 
        super(s)
    end

    def match(name)
        # symbol is allowed to be matched as a string
        name = name.to_s if name.kind_of?(Symbol)

        if @reg_exp
            return false if name.kind_of?(PatternString) && (name.reg_exp || name.is_fmask)
            return @reg_exp.match(name) != nil
        end

        if @is_fmask
            return false if name.kind_of?(PatternString) && name.reg_exp
            return File.fnmatch(self, name, File::FNM_PATHNAME)
        end
        name == self
    end  

    def <=>(p)
        return 0 if p == self  
        if @reg_exp
            if p.kind_of?(PatternString)
                return  0 if p.reg_exp
                return -1 if p.is_fmask
            end
            return match(p) ? 1 : -1 
        end   
    
        if @is_fmask
            return 1 if p.kind_of?(PatternString) && p.reg_exp
            return match(p) ? 1 : -1  
        end  
    
        return -1  if p.kind_of?(PatternString) && (p.reg_exp || p.is_fmask)
        return self.length > p.length ? 1 : -1            
    end
end


class FileUtil
    def self.dirlist(base, rp=nil)
        self.testdir(base)
        list = []
        Dir.foreach(base) {|path|
            bp = base/path
            next if path == '.' || path == '..' || !File.directory?(bp)
            list << (rp ? rp/path : path)
            list = list + dirlist(bp, list.last)
        }
        list
    end

    def self.cpdir(src, dest, em=nil)
        self.testdir(src) && self.testdir(dest)
        Dir.foreach(src) { |path|
            next if path == '.' || path == '..' || (em && (path =~ em) != nil)
            dpath, spath = dest/path, src/path
        
            if File.directory?(spath)
                Dir.mkdir(dpath)
                cpdir(spath, dpath, em)
            else
                File.cp(spath, dpath)
            end
        }
    end
 
    def self.testdir(dir)
        raise 'Dir cannot be nil' if dir.nil?
    end

    def self.filelist(file)
        res = []
        Dir.glob(file) { |i|  res << i if !File.directory?(i) }
        res
    end

    def self.grep(file, pattern)
        raise 'Pattern cannot be nil' if pattern.nil?
        File.readlines(file).each { |l|  return Regexp.last_match if l =~ pattern }
        nil
    end

    #  Windows absolute path contains letter and the letter case can differ
    def self.correct_win_path(path)
        if File::PATH_SEPARATOR == ';' 
            i  = path.index(/^[A-Za-z][:]\//)
            return path[0,1].downcase() + path[1, path.length()] if i == 0
        end
        return path
    end

    #  Replace the given placeholder in the given file with the specified value
    def self.replace_placeholders(file, placeholder, value)
        raise "File '#{file}' not found" if !File.exists?(file)
        raise "Place holder has not been defined" if placeholder.nil?

        tmpfile = Tempfile.new(File.basename(file))
        File.open(file, 'r') { |f|
            f.each() { |l| tmpfile.print(l.gsub(placeholder, value)) }
        }
        tmpfile.close
        File.cp(tmpfile.path, file)
    end
end






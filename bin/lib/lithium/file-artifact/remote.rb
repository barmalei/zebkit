require 'net/http'
require 'uri'

require 'lithium/file-artifact/base' 

class RemoteFile < FileArtifact
    attr_reader :url

    class RemoteFileNotFound < Exception
    end
    
    @@PROXY_PORT = nil
    @@PROXY_HOST = nil

    def build() fetch(@name, fullpath()) end

    def expired?()  !File.exists?(fullpath()) || File.size(fullpath()) == 0 end
    def what_it_does() "Download '#{@name}'\nfrom #{@url}" end
        
    def cleanup()
        lp = fullpath()
        File.delete(lp) if File.exists?(lp)
    end

    protected 

    @@bin_types = [
        'jar', 'zip', 'gz', 'tar', 'gif', 'jpeg', 'jpg', 'png', 
        'tiff', 'bmp', 'avi', 'exe', 'mov', 'chm', 'pdf', 'iso', 
        'doc', 'vsd', 'psd', 'dmg', 'rar', 'bin' 
    ]

    def detect_binary_mode(path)
        i = path.index(/[.]\w+{6}$/)
        return true if i && @@bin_types.index(path[i+1, path.length - i]) 
        return false
    end

    def fetch(src_path, dest_path)
        u = URI.parse(@url[-1, 1] == '/' ? @url +  src_path : @url + '/' + src_path)
        m = method("#{u.scheme.downcase}_fetch")
        raise "Unsupported protocol #{u.scheme}." if m.nil?
        m.call(u, dest_path)
    end
end

class HTTPRemoteFile < RemoteFile
    def http_fetch(src_url, dest_path)
        is_bin = detect_binary_mode(src_url.path)
        Net::HTTP::Proxy(@@PROXY_HOST, @@PROXY_PORT).start(src_url.host) { |http|
            res, data = http.get(src_url.path)
            raise RemoteFileNotFound.new("Remote file '#{src_url}' not found") if res.code == '404'
            res.value()
            raise "Detination '#{dest_path}' directory doesn't exist." if !File.exists?(File.dirname(dest_path))
            File.open(dest_path, 'w') { |f|
                f.binmode() if is_bin
                f.print(data)
            }
        }
        true
    end     
end

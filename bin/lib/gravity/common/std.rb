

#!!! debug field
$M = $stdout

def puts_error(*args) Std.std().puts_error(*args) end
def puts_warning(*args) Std.std().puts_warning(*args) if Std.std() end

class Std
    @@std = nil
    @@backtrace_deepness = 10
    @@ruby_exception_pattern = /.*\:[0-9]+(:in\s+`.*')?/

    def Std.new(*args, &block)
        @@std.endup() if @@std
        @@std = super(*args, &block)
        @@std.started() if @@std.respond_to?(:started)
        @@std
    end

    def Std.std() @@std end
    def Std.restore_std() @@std.endup() if @@std end
    def Std.backtrace(d) @@backtrace_deepness = d end

    class Std
        def initialize(&block) @block = block end
        def write(msg) @block.call(msg)  end

        def puts(*args)
            args.each() {|a|
                a = a.to_s
                write((a.length == 0 || a[-1,1] != "\n") ? "#{a}\n" : a)
            }
        end

        def print(*args) args.each() {|a| write(a.to_s) } end
        def <<(*args) print(*args) end

        def flush() end
    end

    def initialize(format = nil)
        @stdout, @stderr, @ebuffer, @buffer = $stdout, $stderr, [], []
        $stdout, $stderr, @format = Std.new() { |m| self.write(m, 0) }, Std.new() { |m| self.write(m, 2) }, format
    end

    def <<(msg) @stdout << msg end

    def puts_warning(*args)
        args.each() { |a|
            a = a.to_s
            write((a.length == 0 || a[-1,1] != "\n") ? "#{a}\n" : a, 1)
        }
    end

    def puts_error(*args)
        args.each() { |a|
            a = a.to_s
            write((a.length == 0 || a[-1,1] != "\n") ? "#{a}\n" : a, 2)
        }
    end

    def print_warning(*args) args.each() { |a| write(a.to_s, 2) } end
    def print_error(*args) args.each() { |a| write(a.to_s, 1) } end

    def write(msg, level)
        msg = msg.to_s
        return if msg.length == 0
        begin
            # disable uncontrolled output for a thrown exception and
            # do it with special Std method "_exception_"

            if $! && level == 2 && msg =~ @@ruby_exception_pattern
                if @exception != $!
                    @exception = $!
                    _exception_($!)
                end
                return
            end

            msg.each_line() { |line|
                if line[-1, 1] != "\n"
                    @buffer << line
                else
                    if @buffer.length > 0
                        line = "#{@buffer.join('')}#{line}"
                        @buffer.clear()
                    end
                    expose(line, level)
                end
            }
        rescue
            begin
                _fatal_(e)
            rescue
            end
        end

    end

    def _fatal_(e)
        # fatal error has happened in Std implementation
        @stderr.puts "#{$!.message}:"
        e.backtrace().each() { |line| @stderr.puts "     #{line}" }
    end

    def _exception_(e)
        expose("#{e.message}\n", 3)
        bt  = e.backtrace()
        max = @@backtrace_deepness < 0 ? bt.length : @@backtrace_deepness
        for i in 0..max-1
            expose("   #{bt[i]}\n", 3)
        end
    end

    def expose(msg, level)
        self << (@format ? @format.format(msg, level) : msg)
    end

    def endup()
        flush()
        $stderr, $stdout = @stderr, @stdout
    end

    def flush()
        if @buffer.length > 0
            expose("#{@buffer.join('')}", 0)
            @buffer.clear()
        end
    end
end

class Format
    class Entity < String
        #  type, and the given entity location
        attr_accessor :type, :start_at, :end_at

        def initialize(text, type, offsets = [-1, -1])
            super text
            @type, @start_at, @end_at = type, offsets[0], offsets[1]
        end

        def ==(o) super(o) && @start_at == o.start_at && @type == o.type && @end_at == o.end_at end

        def clone(text)   Entity.new(text, type, [start_at, end_at]) end
    end

    class RegexpRecognizer
        attr_reader :regexp, :types_map

        def initialize(regexp, types_map)
            @regexp, @types_map = regexp, types_map
        end

        def recognize(msg)
            m = @regexp.match(msg)
            if m && m.length > 0
                for i in 1..m.length-1
                    text, type, offsets = m[i], types_map[i], m.offset(i)
                    e = normalize(Entity.new(text, type, offsets))
                    yield e
                end
            end
        end

        def normalize(e) e end
    end

    class LocRecognizer < RegexpRecognizer
        def initialize(regexp = /\s*[^\\>\\<\\|\\*\\"\\'\\=\\{\\}]+\:([0-9]+)(.*)/, types_map = { 1 => "file", 2 => "line", 3 => "msg" })
            super(regexp, types_map)
        end

        def normalize(e)
            return e.clone(normalize_path(e)) if e.type == 'file'
            return e
        end

        def normalize_path(path)
            path = File.join($project_home, path) if !Pathname.new(path).absolute?
            path
        end
    end

    class JavaExceptionRecognizer < LocRecognizer
        def initialize()
            super(/\s+at\s+([^\(\)]+)\.[a-zA-Z0-9_]+\(.*\:([0-9]+)\)/, { 1 => 'file', 2 => 'line'})
        end

        def normalize_path(path)
            super(File.join("src", path.gsub('.', '/') + ".java"))
        end
    end

    class URLRecognizer < RegexpRecognizer
        def initialize() super(/.*(http:\/\/[^ \t]*)/, { 1 => 'url' }) end
    end

    @@signs_map = { 0 => [ 'INF', 'Z'], 1 => [ 'WAR', '!'],
                    2 => [ 'ERR', '?'], 3 => [ 'EXC', '?'] }

    def initialize(format = '#{msg}', recognizers = [])
        raise 'Format has to be defined' if !format
        @format, @recognizers = format, recognizers
    end

    def format(msg, level)
        r, a = recognize(msg), []
        r.each_pair() { | k, v | a << v }
        a.sort!() { |aa, bb| aa.start_at <=> bb.start_at  }

        a.each_index() { | i |
            e = a[i]
            msg[e.start_at .. e.end_at - 1] = e.to_s
            dt = e.start_at + e.length - e.end_at
            e.end_at = e.start_at + e.length
            for j in (i + 1)..(a.length-1)
                a[j].end_at = a[j].end_at + dt
                a[j].start_at += dt
            end
        }

        return _format_(msg, level, r)
    end

    def _format_(msg, l, entities = {})
        level, sign = @@signs_map[l]
        eval "\"#{@format}\""
    end

    def recognize(msg)
        entities = {}
        # collect recognized entities
        recognizers().each() { | r |
            r.recognize(msg) { | e |
                entities[e.type] = e if !entities.has_key?(e.type)
            }
        }

        # normalized found entities
        entities.each_pair() { |k, e| entities[k] = normalize(e, entities) }
        return entities
    end

    def recognizers() @recognizers end
    def normalize(e, entities) e end
    def time(format = "%H:%M:%S %d/%b/%Y") Time.now().strftime(format) end
end




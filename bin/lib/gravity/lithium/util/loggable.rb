#
#  Log always take care about looged expiration state. That means orginal
#  expired method is removed.
#
#  Log assist to calculate proper modified time. If an artifact returns
#  modified time that greater than zero it is compared to what log
#  modified time. The most recent will be return as result.
#

# this module is supposed to be used as extension
module HookMethods
    @@hooked = [ :cleanup, :build_done, :mtime,  :expired? ]

    def included(clazz)
        if clazz.kind_of?(Class)
            raise 'No methods for catching have been defined' if !@@hooked

            clazz.instance_methods().each { |m|
                m = m.intern
                HookMethods.hook_method(clazz, m) if @@hooked.index(m)
            }

            def clazz.method_added(m)
                unless @adding
                    @adding = true
                    HookMethods.hook_method(self, m) if @@hooked.index(m) && self.method_defined?(m)
                    @adding = false
                end
            end
        else
            clazz.extend(HookMethods)
        end
    end

    def HookMethods.hook_method(clazz, m)
        clazz.class_eval {
            n = "original_#{m}"
            alias_method n, m.to_s
            undef_method m
        }
    end
end

module LogArtifact
    extend HookMethods

    def method_missing(meth, *args)
        if meth == :cleanup
            original_cleanup()
            expire_log()
        elsif meth == :build_done
            original_build_done() if self.respond_to?(:original_build_done)
            update_log() if File.exists?(File.dirname(log_path()))
        elsif meth == :mtime
            t = File.exists?(log_path()) ? File.mtime(log_path()).to_i : -1
            return original_mtime() if t < 0
            tt = original_mtime()
            return t > tt ? t : tt
        elsif meth == :expired?
            return log_expired? || original_expired?
        else
            super
        end
    end

    def expire_log() File.delete(log_path()) if File.exists?(log_path()) end

    def log_expired?()
        return !File.exists?(log_path())  || File.mtime(log_path()).to_i < mtime()
    end

    def update_log()
        if File.exists?(log_path())
            t = Time.now
            File.utime(t, t, log_path())
        else
            File.open(log_path(), 'w') {}
        end
    end

    def log_path()
        @log_path ||= "#{log_home_dir()}/#{self.class.to_s}_#{self.name.tr("/\\<>:.*{}[]", '_')}"
        @log_path
    end

    def log_home_dir()
        raise 'Project home has not been defined' if !$project_home
        h = "#{$project_home}/.lithium/.logs"
        if !File.exists?(h)
            puts_warning "LOG dir '#{h}' cannot be found"
            puts_warning "Create LOG dir '#{h}' ... "
            Dir.mkdir(h)
        end
        return h
    end
end

#  Class which includes loggable module should provide "list_items" method.
#  This method has to yield (filename, time) pairs.
module LogArtifactItems
    include LogArtifact

    def list_expired_items(&block)
        e = load_log()
        list_items() { |n, t|
            block.call(n, e[n] ? e[n] : -1) if t == -1 || e[n].nil? || e[n].to_i == -1 || e[n].to_i < t
        }
    end

    def log_expired?()
        list_expired_items() { |n, t|
            return true
        }
        false
    end

    def update_log()
        d, e, r = false, load_log(), {}
        list_items() { |n, t|
            d = true if !d && (e[n] == nil || e[n] != t)
            r[n] = t
        }

        # save log
        if d || r.length != e.length
            File.open(log_path(), 'w') { |f|
                r.each_pair { |name, time|
                    f.printf("%s %i\n", name, time)
                }
            }
        end
    end

    def load_log()
        p, e = log_path(), {}
        if File.exists?(p)
            File.open(p, 'r') { |f|
                f.each { |i|
                    i = i.strip()
                    j = i.rindex(' ')
                    name, time = i[0, j], i[j+1, i.length]
                    e[name] = time.to_i
                }
            }
        end
        e
    end
end

module LogArtifactAttrs
    include LogArtifact

    module LoggedAttrs
        def log_attr(*args)
            @logged_attrs ||= []
            @logged_attrs += args
            attr_accessor *args
        end

        def list_log_attrs() @logged_attrs.each() { |e| yield e } if @logged_attrs end
    end

    def self.included(clazz)
       super
       clazz.extend(LoggedAttrs)
    end

    def log_expired?()
        return true if !File.exists?(log_path())
        File.open(log_path(), 'r') { |f|
            d = Marshal.load(f)
            raise "Incorrect serialized object type '#{d.class}' (Hash is expected)" if !d.kind_of?(Hash)
            self.class.list_log_attrs() { |a|
                return true if !self.respond_to?(a) || self.send(a) != d[a]
            }
        }
        false
    end

    def update_log()
        data = {}
        self.class.list_log_attrs { |a| data[a] = self.send(a) }
        File.open(log_path(), 'w') { |f| Marshal.dump(data, f) }
    end

    def log_path() super + ".ser" end
end


require 'gravity/lithium/file-artifact/base'
require 'gravity/common/txtparser/java'

class ShowMethodsAction < Artifact
  def build()
    result = {}
    TXTPARSER::TREE('java').HANDLER([ :_method]) { |c|
      result[c.path] = [] if result[c.path].nil?
      puts [c.path] << "[#{c.buffer.chomp}:#{c.lineno}]"
    }

    list_target().each { |i| TXTPARSER::TREE('java').MATCH(i) }
  end
end


class FindClassImplAction < Artifact
  def build_()
    fc = FindClassRefAction.new(':find-clref')
    fc.target = @target
    list = fc.build_()

    result = {}
    clname = @target.name

    TXTPARSER::TREE('java-fci') {
      MEMBER(:_group, nil)
      MEMBER(:_comment, "/*", "*/")
      MEMBER(:_lcomment, "//", /$/)

      MEMBER(:_class_def, /(public\s+|protected\s+)?(static\s+|abstract\s+)?class\s+(\w+)/, '{') { |c|
        ext_list  = c.buffer[/(\s+|^)extends\s+([a-zA-Z0-9_\.]+(\s*,\s*[a-zA-Z0-9_\.]+)*)/]
        ext_classes = Regexp.last_match[2].split(/\s*,\s*/) if ext_list

        impl_list = c.buffer[/(\s+|^)implements\s+(\w+(\s*,\s*\w+)*)/]
        impl_interfaces = Regexp.last_match[2].split(/\s*,\s*/) if impl_list

        p = proc { |cl_list|
          return nil if cl_list.nil? || cl_list.length == 0
          re = Regexp.new('(\.|^)' + clname + '$')
          nil != cl_list.detect { |i| i.index(re) != nil }
        }

        if p.call(ext_classes) || p.call(impl_interfaces)
          result[c.path] = [] if result[c.path].nil?
          result[c.path] << c.lineno
        end
      }

      re = Regexp.new('[^a-zA-Z_]new\s+' + clname + '\s*\(.*\)\s*\{')
      MEMBER(:_aclass_def, re) { |c|
        result[c.path] = [] if result[c.path].nil?
        result[c.path] << c.lineno
      }

      DEF_ERASE {
        _comment '*'
        _lcomment '*'
      }

      DEF_TREE {
        _class_def '*'
        _aclass_def '*'
      }
    }

    list.each_key { |i| TXTPARSER::TREE('java-fci').MATCH(i)   }
    result
  end
end

class FindClassRefAction < Artifact
  def build_()
    list = {}
    classname = File.basename(target.name)
    classname = classname[/\w+/]
    regstr  = "[^a-zA-Z0-9_]"
    regexpr = Regexp.new("(#{regstr}|^)" + classname + "(#{regstr}|$)")

    msg "Looking for class references to '#{classname}' class."
    Dir["#{Artifact.root}/src/**/*.java"].each { |file|
      next if File.directory?(file)
      linenum = 1
      File.readlines(file).each { |l|
        l = l.chomp.gsub(/\"[^\"]+`\"/, '').gsub(/\/\/.*$/, '')
        if l =~ regexpr
          list[file] = [] if list[file].nil?
          list[file] << linenum
        end
        linenum += 1
      }
    }
    list
  end
end


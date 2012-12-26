
require 'zebra/converter'
require 'zebra/j2js/nodes'

class JavaContextVar < ContextVar
    attr_accessor :defvalue

    def self.VARIABLE()     1 end
    def self.METHOD()       2 end
    def self.CLASS()        3 end
    def self.INTERFACE()    4 end
    def self.PACKAGE()      5 end

    def initialize(type, is_static = false)
        super(type)
        @is_static = is_static
    end

    def method?     () type == JavaContextVar.METHOD();     end
    def variable?   () type == JavaContextVar.VARIABLE();   end
    def class?      () type == JavaContextVar.CLASS();      end
    def package?    () type == JavaContextVar.PACKAGE();    end
    def interface?  () type == JavaContextVar.INTERFACE();  end

    def static?() @is_static end
end


class JavaContext < Context
    def initialize(node)
        super
        @is_static = node.kind_of?(JavaClassMethod) && node.static?
    end

    def getvar(key)
        if key.kind_of?(JavaNode)
            if key.kind_of?(JavaClassMethod) || key.kind_of?(JavaMethodCall)
                key = key.name.to_s + "(" + key.arity.to_s + ")"
            else
                key = key.respond_to?(:name) ? key.name.to_s : key.to_s
            end
        end

        if @is_static
            return variables[key] if variables.has_key?(key)
            p = parent
            while p
                return p.variables[key] if p.variables.has_key?(key) && p.variables[key].static?
            end
            return nil
        else
            return super(key)
        end
    end

    def addvar(*args)
        if (args.length == 1)
            a = args[0];
            if a.kind_of?(JavaNode)
                k = a.respond_to?(:name) ? a.name.to_s : a.to_s
                if a.kind_of?(JavaClassMethod)
                    k, v = k + "(" + a.arity.to_s + ")", JavaContextVar.new(JavaContextVar.METHOD, a.static?)
                elsif a.kind_of?(JavaMethodParameter)
                    v = JavaContextVar.new(JavaContextVar.VARIABLE)
                elsif a.kind_of?(JavaClassLocalVariables)
                    sf = self
                    a.each() { |v, i| sf.addvar(v)  }
                    return
                elsif a.kind_of?(JavaVariable)
                    if a.declaration.kind_of?(JavaClassLocalVariables)
                        v = JavaContextVar.new(JavaContextVar.VARIABLE, a.declaration.static?)
                    else
                        v = JavaContextVar.new(JavaContextVar.VARIABLE)
                    end
                elsif a.kind_of?(JavaImport)
                    v = JavaContextVar.new(JavaContextVar.CLASS)
                elsif a.kind_of?(JavaClass)
                    v = JavaContextVar.new(JavaContextVar.CLASS)
                elsif a.kind_of?(JavaInterface)
                    v = JavaContextVar.new(JavaContextVar.INTERFACE)
                elsif a.kind_of?(JavaSourceCode)
                    v = JavaContextVar.new(JavaContextVar.PACKAGE)
                else
                    raise "Unknown JavaNode type : #{a.class}"
                end
            else
                raise "Input argument has to be an instance of JavaNode class"
            end
        else
            k, v = args[0], args[1]
        end
        super(k, v)
    end
end


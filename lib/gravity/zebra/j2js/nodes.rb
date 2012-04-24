
require 'gravity/zebra/nodes'

module JavaModifiers 
    def abstract?()  @modifier.index('abstract') != nil end
    def final?()  @modifier.index('final') != nil end
    def public?()  @modifier.index('public') != nil end
    def private?()  @modifier.index('private') != nil end
    def protected?()  @modifier.index('protected') != nil end
    def static?()  @modifier.index('static') != nil end
    def friend?()  !public? && !private? && !protected? end
end

class JavaNode < Node
    undef_method :type # remove deprected alias since it will be used by nodes
end

class JavaExpressionOperator < JavaNode;end
class JavaType < JavaNode; end
class JavaPackage < JavaNode; end 
class JavaCatch < JavaNode; end 
class JavaMethodParameter < JavaNode;    end
class JavaInterfaceDeclaration < JavaNode; end 
class JavaIf < JavaNode; end 
class JavaClassBody < JavaNode; end 
class JavaImplements < JavaNode;    end
class JavaExtends < JavaNode; end
class JavaClassCreator < JavaNode;end
class JavaBlock < JavaNode;end 
class JavaAssertion < JavaNode; end
class JavaSync < JavaNode; end
class JavaThrow < JavaNode; end
class JavaComment < JavaNode; end
class JavaCase < JavaNode; end
class JavaDefaultCase < JavaNode; end
class JavaExpr < JavaNode; end
class JavaExpressionMember < JavaNode; end
class JavaStatement < JavaNode; end 
class JavaConditionalExpression < JavaNode; end 
class JavaMemberAccessor < JavaNode; end 
class JavaFinally < JavaNode; end 
class JavaTry < JavaNode; end 
class JavaReturn < JavaNode; end 
class JavaContinue < JavaNode; end 
class JavaBreak < JavaNode; end 
class JavaFor < JavaNode; end 
class JavaWhile < JavaNode; end 
class JavaDo < JavaNode; end 
class JavaMethodDeclaration < JavaNode; end
class JavaInstanceof < JavaNode; end 
class JavaClassInstantiation < JavaNode; end 
class JavaDimExpr < JavaNode; end 
class JavaArrayInitializer < JavaNode; end 
class JavaArrayInstantiation < JavaNode; end
class JavaExpressionGroup < JavaNode; end
class JavaIdentifier < JavaNode; end
class JavaSuperMethodCall < JavaNode; end
class JavaSuperConstructorCall < JavaNode; end
class JavaThisMethodCall < JavaNode; end
class JavaField < JavaNode ; end
class JavaSemicolumn < JavaNode ; end


class JavaPackageIdentifier < JavaNode
    def to_s
        i = text_value.index('java.')
        i != 0 ? text_value : "JAVA" + text_value[4, text_value.length]
    end
end

class JavaBodyIdentifier < JavaNode
    def no_parent_accessor?
        p = parent_by_type(JavaNode)
        return !p ||  !p.kind_of?(JavaFieldAccessor)
    end
end

class JavaFieldAccessor < JavaNode
    def accessor_field
        select("JavaField") { |n|
            return n
        }
    end
end 

class JavaVariable < JavaNode 
    attr_accessor :declaration
end

class JavaMethodCall < JavaNode
    def no_parent_accessor?
        n = parent_by_type(JavaField)
        n = n.parent_by_type(JavaNode)
        n.nil? || !n.kind_of?(JavaFieldAccessor) 
    end

    def arity()
        return arguments.length if arguments.kind_of?(JavaGroup)
        return 0
    end
end

class JavaSourceCode  < RootNode
    def initialize(a, b, c)
        super a, b, c
        @language   = "Java => Zebra Java Script transformer"
        @version    = "0.9"
        @copyrights = "Gravity Soft, Oct 2011"
    end
end 

class JavaClass < JavaNode    
    attr_reader   :interfaces, :modifier
    attr_accessor :parent

    include JavaModifiers

    def startup()
        p = self
        @interfaces  = [] 
        select("JavaImplements") { |i|
            i.interfaces.text_value.strip().split(',').each() { | ii |
                p.interfaces << ii.strip()
            }
        }
    
        @parent = nil
        select("JavaExtends") { |e|
            p.parent = e.parent.text_value.strip
        }
        
        @modifier = modifier.text_value.split(/\s+/)
    end
end 

class JavaInterface < JavaNode    
    attr_reader :interfaces, :modifier
    
    include JavaModifiers
    
    def startup()
        p, @interfaces  = self, [] 
        select("JavaImplements") { |i|
            i.interfaces.text_value.strip().split(',').each() { | ii |
                p.interfaces << ii.strip()
            }
        }
        @modifier = modifier.text_value.split(/\s+/)
    end
end

class JavaImport < JavaNode 
    attr_reader :class_name

    def all_classes?() !all_classes.empty? end

    def startup()  
        @all_classes = !all_classes.empty? 
        @class_name = nil
        @class_name = path.to_s.split('.')[-1] if !@all_classes
    end
end 

class JavaClassMethod < JavaNode
    attr_reader :arguments, :name, :modifier

    include JavaModifiers
    
    def startup()
        p = self
        @arguments = []
        methodDeclaration.select("JavaGroup/JavaMethodParameter*") { |a|
            p.arguments << a
        }
        
        @name     = methodDeclaration.name
        @modifier = methodDeclaration.modifier.text_value.split(/\s+/)
    end
    
    def each(&block) 
        i = 0
        @arguments.each() { |m|
            block.call(m, i)
            i += 1
        }
    end
    
    def arity() @arguments.length end
end 

class JavaLocalVariables < JavaNode
    def startup() 
        vars, sf = [], self
        variables.select("JavaVariable*") { |v|
            vars << v
            v.declaration = sf 
        }
        @variables = vars
    end

    def atomic?() 
        ['int', 'long', 'float', 'double', 'short', 'char'].index(type.text_value) != nil || boolean?
    end

    def boolean?() 
        type.text_value == 'boolean'
    end    

    def each(&block) 
        i = 0
        @variables.each() { |v|
            block.call(v, i)
            i += 1
        }
    end
end
    
class JavaGroup < JavaNode
    def startup()
        n = []
        select("JavaNode*") { |nn|
            n << nn
        }
        @nodes = n
    end
    
    def length() @nodes.length end
    
    def each(&block) 
        i = 0
        @nodes.each() { |v|
            block.call(v, i)
            i += 1
        }
    end
end 
    
class JavaSwitch < JavaNode
    def each(&block) 
        i = 0
        select("JavaGroup/JavaCase*") { |n|
            block.call(n, i)
            i += 1
        }
    end
    
    def default(&block) 
        select("JavaGroup/JavaDefaultCase*") { |n|
            block.call(n)
        }
    end    
end 
  
class JavaClassLocalVariables < JavaLocalVariables
    attr_reader :modifier
    include JavaModifiers

    def startup()
        super
        @modifier = modifier.text_value.strip.split(/\s+/) if modifier
    end
end

class JavaInterfaceVariable < JavaNode
    attr_reader :modifier
    include JavaModifiers

    def startup()
        super
        @modifier = modifier.text_value.strip.split(/\s+/) if modifier
    end
end
    
class JavaFixedValue < JavaNode
    def float?() false; end
    def int?() false; end
    def str?() false; end
    def char?() false; end
    def hex?() false; end
    def bool?() false; end
    def null?() false; end
end 







require 'zebra/j2js/context'

base = File.dirname(__FILE__)
Treetop.load File.join(base,"JavaCommon")
Treetop.load File.join(base,"JavaMethod")
Treetop.load File.join(base,"JavaLiteral")
Treetop.load File.join(base,"JavaExpression")


class JavaConverter < Converter
    def initialize(content, comment_off = true)
        @comment_off = comment_off
        super(content)
    end

    def parser() JavaExpressionParser.new() end

    def JavaImport(c, i)
        raise "'*' character is not supported in import (#{i})" if i.all_classes?
        c << "var #{i.class_name} = #{i.path};"
    end

    def JavaSourceCode(c, code)
        # fetch package
        @package = code.package

        # collect all imports
        convert_list(c, code, "JavaImport*", "import necessary classes") < "\n"
        convert(code.body)
    end

    def JavaInterface(c, id)
        prev_class_name = @class_name;
        @class_name = id.name.to_s

        if c.contexts.top.parent
            ref = id.name
            c << "\n// embedded interface definition" << "var #{ref} = "
        else
            ref = "#{@package.path}.#{id.name}"
            c << "#{ref} = "
        end

        c < "new zebra.Interface(#{id.interfaces.join(',')});"
        @indention[-1] = ''

        id.select("JavaInterfaceVariable*") { |v|
            c << ref < '.' < v.name.to_s < " = "
            c.convert(v.initializer) < ';'
        }

        c << "\n// put static reference to embedded interface" << "this.#{id.name} = #{id.name};"  if c.contexts.top.parent
        @class_name = prev_class_name
    end

    def JavaClass(c, cd)
        prev_class_name = @class_name
        @class_name = cd.name.to_s
        main = nil

        if c.contexts.top.parent
            c << "// #{cd.name} embedded class definition" << "var #{cd.name} = "
        else
            c << "// declare #{@package.path}.#{cd.name} class" << "#{@package.path}.#{cd.name} = "
            cd.body.select("JavaClassMethod*[static? && name.to_s == 'main' && arity == 1]") { |n|
                main = n
            }
        end

        c < "new zebra.Class("
        c <  "#{cd.parent}," if cd.parent
        c <  "#{cd.interfaces.join(',')}," if cd.interfaces.length > 0
        c << "    function($) {" << "        "

        c << "// reference to class itself" << "var " < cd.name < ' = this;' if !c.contexts.top.parent

        convert(cd.body)
        @indention[-1] = ''
        c << "});"

        c << "\n// put static reference to embedded class" << "this.#{cd.name} = #{cd.name};" if c.contexts.top.parent && cd.static?
        c << "\n// call main function" << "#{@package.path}.#{cd.name}.main(arguments);\n" if main

        @class_name = prev_class_name
    end

    def convert_list(c, target, path, comment = nil, marker = nil)
        mc = 0
        target.select(path) {
            c << "\n// #{comment}" if mc == 0 && comment != nil
            c << marker if mc == 0 && marker
            c.convert(self)
            mc += 1
        }
        return c
    end

    def JavaClassBody(c, cb)
        convert_list(c, cb, "JavaClass*")
        convert_list(c, cb, "JavaInterface*")

        convert_list(c, cb, "JavaClassLocalVariables*", "class defined variables")
        convert_list(c, cb, "JavaClassMethod*[constructor?]", "constructors")
        convert_list(c, cb, "JavaClassMethod*[(public? || friend? || protected?) && !static? && !constructor?]", "public method")
        convert_list(c, cb, "JavaClassMethod*[static?]", "static methods declaration")
        convert_list(c, cb, "JavaClassMethod*[!constructor? && private? && !static?]", "private class methods", "this.Private()")
    end

    def JavaIf(c, v)
        self << "    if"
        convert(v.condition, v.body)
        if defined?(v.else_body)
            self << "else"
            convert(v.else_body)
        end
    end

    def JavaLocalVariables(c, v)
        dt = defined?(v.type)
        c << "    var " if dt
        v.each() { |vv, i|
            c < ", " if i > 0
            convert(vv)
            c.contexts.top.addvar(vv) if dt
        }
        c < ';'
    end

    def JavaVariable(c, v)
        c < v.name
        if defined?(v.initializer)
            c < ' = '
            convert(v.initializer)
        end
    end

    def JavaClassLocalVariables(c, v)
        pref = v.static? ? "this." : "$("
        v.each() { |vv, i|
            if v.static?
                c << "#{pref}#{vv.name}"  < ' = '
            else
                c << "#{pref}'#{vv.name}'"  < ', '
            end
            if defined?(vv.initializer)
                convert(vv.initializer)
            else
                df = v.atomic? ? (v.boolean? ? 'false' : '0') : 'null';
                c < df
            end
            c < ")" if !v.static?
            c < ';'
            c.contexts.top.addvar(vv)
        }
    end

    def JavaArrayInstantiation(c, a)
        if defined?(a.initializer)
            convert(a.initializer)
        else
            counter= 0;
            a.select("JavaDimExpr*") { |n|
                raise "Multidimensional arrays '#{a.text_value}' are not supported" if counter > 0
                c < "new Array("
                c.convert(n.expression)
                c < ")"
                counter += 1;
            }
        end
    end

    def JavaArrayInitializer(c, i)
        c < '['
        if i.initializer
            i.initializer.each() { |n, i|
                c < ', ' if i > 0
                convert(n)
            }
        end
        c < ']'
    end

    def JavaFor(c, f)
        c << "    for("
        if defined?(f.initializer.variables)
            convert(f.initializer)
        else
            c < "; "
        end
        convert(f.condition) < "; "
        JavaGroup(c, f.updater, ",") if f.updater.kind_of?(JavaGroup)
        c < ')'
        convert(f.body)
    end

    def JavaBlock(c, b)
        c < "{"
        b.select("JavaNode*") {
            c.convert(self)
        }
        c << "}"
    end

    def JavaThrow(c, b)
        c << "    throw "
        convert(b.expression) < ";"
    end

    def JavaTry(c, b)
        self << "    try"
        convert(b.body)
        if b.catches.kind_of?(JavaGroup) && b.catches.length > 0
            if b.catches.length == 1
                convert(b.catches)
            else
                self << "catch($$ee) {"
                b.catches.each() { |n, i|
                    c << "else" if i > 0
                    c << "{"    if i > 0
                    c << "        var #{n.name} = $$ee;"
                    c << "        if ($$ee.instanceOf(#{n.type}))"
                    c.convert(n.body)
                    c << "}" if i > 0
                }
                self << "}"
            end
        end
        convert(b.finally)
    end

    def JavaSuperMethodCall(c, b)
        name = b.method.name
        c < "this.$super(this.#{name}"
        if b.method.arity > 0
            c < ','
            ConvertPassedArguments(c, b.method.arguments)
        end
        c < ")"
    end

    def JavaSuperConstructorCall(c, b)
        c < "this.$super("
        ConvertPassedArguments(c, b.arguments) < ')'
    end

    def JavaThisMethodCall(c, b)
        c < "this.$this("
        ConvertPassedArguments(c, b.arguments) < ')'
    end

    def JavaMethodCall(c, b)
        name = b.name
        if b.no_parent_accessor?
            m = contexts.top.getvar(b)
            if m
                if m.static?
                    c < @class_name < "."
                else
                    c < "this."
                end
            end
        end
        c < b.name < '('
        ConvertPassedArguments(c, b.arguments) < ')'
    end

    def ConvertPassedArguments(c, a)
        JavaGroup(c, a, ", ") if a.kind_of?(JavaGroup)
        return c
    end

    def JavaCatch(c, b)
        self << "catch(" < b.name < ')'
        convert(b.body)
    end

    def JavaFinally(c, b)
        self << "finally"
        convert(b.body)
    end

    def JavaExpressionGroup(c, m)
        c < "("
        convert(m.expression) < ")"
    end

    def JavaExpressionOperator(c, m) c < " #{m} " end

    def JavaExpr(c, m)
        c << "    "
        convert(m.expression) < ";"
    end

    def JavaGroup(c, g, d=nil)
        g.each() { |n, i|
            c < d if d && i > 0
            convert(n)
        }
    end

    def JavaReturn(c, m)
        c << "    return "
        convert(m.expression) < ";"
    end

    def JavaConditionalExpression(c, v)
        c < ' ? '
        convert(v.expression1) < ' : '
        convert(v.expression2)
    end

    def JavaClassMethod(c, m)
        raise "Static method '#{m.name}' cannot be abstract" if m.static? && m.abstract?
        raise "Constructor cannot be abstract" if m.constructor? && m.abstract?

        if m.static?
            s = 'this.'
        elsif m.abstract?
            s = 'this.Abstract('
        elsif m.final?
            s = 'this.Final('
        else
            s = '$('
        end

        n = m.constructor? ? '' : m.name
        if m.static?
            c << "#{s}#{n} = function("
        else
            c << "#{s}function #{n}("
        end

        m.each() { |a, i|
            c < ',' if i > 0
            c < a.name
            c.contexts.top.addvar(a)
        }
        c < ')'

        if m.abstract?
            c < "{ }"
        else
            convert(m.body)
        end

        c < ");" if !m.static? && s.length > 0
        c < "\n"
    end

    def JavaWhile(c, w)
        c << "    while"
        convert(w.condition, w.body)
    end

    def JavaDo(c, d)
        c << "    do"
        convert(d.body) << "while"
        convert(d.condition) < ";"
    end

    def JavaSwitch(c, s)
        c << "    switch"
        convert(s.condition) << "{"
        s.each() { |cc, i|
            convert(cc)
        }
        c << "}"
    end

    def JavaFieldAccessor(c, n)
        c < "."
        convert(n.accessor_field());
    end

    def JavaBreak(c, b)
        c < b
    end

    def JavaContinue(c, b)
        c < b
    end

    def JavaDimExpr(c, de)
        c < "["
        convert(de.expression) < ']'
    end

    def JavaCase(c, cc)
        if defined?(cc.expression)
            c << "    case "
            convert(cc.expression) < ":"
        else
            c << "    default:"
        end
        convert(cc.body)
        convert(cc.break) if defined?(cc.break)
    end

    def JavaInstanceof(c, i)
        c < "zebra.instanceOf("
        convert(i.arg1) < ","
        convert(i.arg2) < ")"
    end

    def JavaClassInstantiation(c, cl)
        iset = ["Integer", "Long", "Short", "Boolean", "Double", "Float"]
        if iset.index(cl.name.to_s) != nil
            ConvertPassedArguments(c, cl.arguments)
            return
        end

        c < "new " < cl.name < '('
        ConvertPassedArguments(c, cl.arguments)
        if (!cl.body.empty?)
            c < ',' if cl.arguments.kind_of?(JavaNode) && cl.arguments.length > 0
            c < 'function($) {'
            convert(cl.body)
            c << "}"
        end
        c < ')'
    end

    def JavaBodyIdentifier(c, i)
        if i.no_parent_accessor?
            v = contexts.top.getvar(i)
            if v && v.variable?
                if v.static?
                    c < @class_name < "."
                elsif v.context.node.kind_of?(JavaClassBody)
                    c < "this."
                end
            end
        end
        c < i
    end

    def JavaSync(c, n)
        c << "    zebra.sync("
        convert(n.condition)
        c < ", function() "
        convert(n.body)
        c < ", this);"
    end

    def JavaIdentifier(c, i) c < i end
    def JavaType(c, t) end
    def JavaSemicolumn(c, s) c < ';' end
    def JavaFixedValue(c, v) c <  v  end
    def to_s() @buffer.join("\n") end

    def self.new_context(node) JavaContext.new(node) end

    context_method(:JavaSourceCode, [ "JavaImport*", 'JavaClass*', 'JavaInterface*', '.' ])
    context_method(:JavaBlock)
    context_method(:JavaClassBody, ["JavaClassMethod*[!constructor?]", "JavaClassLocalVariables*"])
    context_method(:JavaFor)
    context_method(:JavaClassMethod)
end


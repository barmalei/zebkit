require 'gravity/zebra/nodes'


class ContextVar
    attr_accessor :context
    attr_reader   :type
    
    def initialize(type)
        @context, @type = nil, type
    end
end

class Context
    attr_accessor :parent, :variables, :node
    
    def initialize(node) 
        @variables, @parent, @node = {}, nil, node 
    end

    def addvar(key, value) 
        value.context = self
        @variables[key] = value
    end

    def getvar(key) 
        return variables[key] if variables.has_key?(key)
        
        p = parent
        while p
            return p.variables[key] if p.variables.has_key?(key)
            p = p.parent
        end
        return nil
    end
end

class Converter
    class Contexts
        def initialize()
            @contexts = []
        end
        
        def top() 
            return @contexts.last()  
        end
        
        def push(ctx)
            ctx.parent = top()
            @contexts.push(ctx)
        end
        
        def pop()
            ctx = @contexts.pop()
            ctx.parent = nil
        end
    end

    attr_reader :root, :contexts

    def initialize(content)
        parser = parser()
        @indention, @buffer, @contexts = [''], [''], Contexts.new()
        @root = parser.parse(content)
        raise parser.failure_reason + " .... line = #{parser.failure_line}"  if @root.nil?
        raise "Incorrect root node class" if !@root.kind_of?(RootNode)
        convert(@root)
    end
    
    def <<(msg)
        prev_indention, current_indention, indention = @indention[-2], @indention[-1], msg.scan(/[\t ]*/)[0]
        l = current_indention.length - prev_indention.length
        @indention[-1] = @indention[-1] + "#{' '*(indention.length - l)}" if l < indention.length 
        msg.each_line() { |line| 
            @buffer << "#{@indention[-1]}#{line.lstrip}" 
        }
        return self
    end
    
    def <(msg) 
        @buffer[-1] = "#{@buffer[-1]}#{msg}"   
        return self
    end

    def convert(*args)
        args.each() { |n|
            convert_node(n)
        }
        return self
    end
    
    def convert_node(root)
        begin
            @indention.push(@indention[-1])
            if respond_to?(root.class.name)
                send(root.class.name, self, root) 
            else 
                c = self
                if root.kind_of?(Node)
                    root.select('Node*') { c.convert(self) }
                else
                    root.elements.each() { | e | convert(e) } if root.elements
                end
            end
        ensure
            @indention.pop()
        end
        return self
    end
    
    def parser() raise "Not Implemented" end
    def to_s() @buffer.join("\n") end
        
    def self.context_method(*args)
        m, s_it = args[0], []
        s_it = args[1] if args.length > 1
         
        self.class_eval {
            n = "original_#{m}"
            alias_method n, m.to_s 
            undef_method m

            define_method(m) { |c, node|
                b = false
                begin
                    new_context = self.class.new_context(node)
                    s_it.each() { |selector|
                        node.select(selector) { |e|
                            new_context.addvar(e)
                        }
                    }

                    self.contexts.push(new_context)
                    b = true
                    self.send(n, c, node)
                ensure
                    self.contexts.pop() if b
                end
            }
        }
    end
    
    def self.new_context(node) Context.new(node) end
end


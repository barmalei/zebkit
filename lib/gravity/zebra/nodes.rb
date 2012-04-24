require 'treetop'

class Node < Treetop::Runtime::SyntaxNode 
    #   (path(*)?|*|**)([cond])?(/(pathN(*)?|*|**)([condN])?)*
    def select(query, &block)
        def nodes(b = false, root = self, &block)
            if root.elements && root.elements.length > 0
                root.elements.each() { |e|
                    if e.kind_of?(Node)
                        block.call(e)
                        nodes(b, e, &block) if b
                    else
                        nodes(b, e, &block)
                    end
                }
            end
        end
    
        return false if !elements || elements.length == 0
    
        return self if query == '.'
    
        i    = query.index('/')
        raise Exception.new("Query (#{query}) cannot start from '/' character") if i == 0
        path = i ? query[0, i] : query

        j = /\[(.*)\]/.match(path)
        cond = nil
        
        if j
            path = path[0, j.begin(0)]
            cond = j[1].to_s
        end
        
        all_nodes  = path[-1, 1] == '*' 
        all_levels = all_nodes && path.length > 1 && path[-2, 1] == '*'
        path       = path[0, path.length - 1 - (all_levels ? 1: 0)] if all_nodes

        query = i ? query[i + 1, query.length - 1] : nil
        node_type = path.length > 0 ? Object::const_get(path) : Node
        
        nodes(all_levels) { |e| 
            if e.kind_of?(node_type) && (cond.nil? || e.instance_eval(cond))
                if query
                    e.select(query, &block) 
                else
                    e.instance_eval(&block)
                    return if !all_nodes
                end
            end
        }
    end
  
    def kid(type = Node, root = self)
        if root.elements && root.elements.length > 0
            root.elements.each() { |e|
                return e if e.kind_of?(type)
                k = kid(type,  e) 
                return k if k
            }
        end
        nil
    end

    def kids(type = Node, root = self, &block)
        if root.elements && root.elements.length > 0
            root.elements.each() { |e| 
                if e.kind_of?(type)
                    block.call(e) 
                else
                    kids(type, e, &block) if !e.kind_of?(Node)
                end
            } 
        end
    end
       
    def startup() end

    def parent_by_type(type)
        p = parent
        while p && p.kind_of?(Treetop::Runtime::SyntaxNode)
            return p if p.kind_of?(type)
            p = p.parent
        end
        return nil
    end

    def Node.list(root, type = Node, indent="")
        raise "Tree node is nil" if root.nil? 

        if !type or root.kind_of?(type)
            s = "#{indent}#{root.class}  : #{root.extension_modules.inspect()}"
            if root.text_value.length < 40
                t = root.text_value.gsub("\n", "\\n")
                s +=  " '#{t}'" 
            else 
                s += "  #{root.text_value.length}"
            end
            puts s
            indent += "  "
        end

        if root && root.elements && root.elements.length > 0
            root.elements.each() { |e|
                puts "  +++ found nil  " if e.nil? 
                Node.list(e, type, indent)
            }
        end
    end
    
    def to_s() text_value end
end

class RootNode < Node
    def initialize(a, b, c)
        super a, b, c
        do_startup(self)
    end
    
    def do_startup(root)
        root.startup() if root.kind_of?(Node)
        root.elements.each() { |e| do_startup(e) } if root.elements && root.elements.length > 0
    end
end




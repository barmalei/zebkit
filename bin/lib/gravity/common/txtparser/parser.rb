#
# Text Parser
#
module TXTPARSER
  $trees    = {}
  $prefixes = {'_if_' => 'ConditionMember', '_erase_' => 'ErasedMember', '_group_' => 'GroupMember' }

  class ParsedMember
    attr_reader :member, :lineno, :buffer, :start_, :end_, :path

    def initialize(member, start_, end_, context)
      raise 'Member cannot be nil' if member.nil?
      @member, @lineno, @start_, @end_ = member, context.lineno, start_, end_
      @buffer = context.buffer[@start_.index, @end_.index - @start_.index + @end_.match_len]
      @path = context.path
    end
  end

  class ParseContext
    attr_reader :buffer, :offset, :block, :path

    def initialize(stream,lines_support=true,&block)
      raise 'Stream cannot be nil' if stream.nil?
      @buffer, @offset, @block, @lines_support  = '', 0, block, lines_support
      @path = stream.kind_of?(File) ? stream.path : nil

      lines = stream.readlines()
      if @lines_support
        class <<@buffer
          def <<(s)
            @lines[@lbuf_len], @lines[@lbuf_len + 1] = length(), s.length
            @lbuf_len += 2
            super(s)
          end

          def init_(s) @lines = Array.new(s*2); @lbuf_len=0 end

          def []=(off, len, v)
            start_line=lookup(off)
            sll,offlen = @lines[start_line + 1],off + len
            if (offlen <= @lines[start_line] + sll)
              end_line = start_line
              @lines[start_line + 1] = sll - len
            else
              end_line = lookup(offlen)
              @lines[start_line + 1] = off - @lines[start_line]
              @lines[end_line + 1] = @lines[end_line] + @lines[end_line + 1] - offlen
              @lines[end_line] -= len
            end

            i,elo = start_line + 2, @lines[end_line]
            while i<end_line
              @lines[i + 1],@lines[i] = 0,elo,
              i += 2
            end

            while i<@lbuf_len
              @lines[i] -= len
              i += 2
            end
            super(off, len, v)
          end

          def lookup(off)
            sl,l = 0,@lbuf_len
            while true
              l2=l/2
              l1=l - l2
              break if l1 == 0

              i = (sl + l1 - 1)*2
              lo = @lines[i]
              if off < lo
                l = l1 - 1
              elsif off >= lo + @lines[i + 1]
                break if l2 == 0
                sl,l = sl + l1, l2
              else
                return i
              end
            end
            -2
          end
        end
        @buffer.init_(lines.length)
      end

      lines.each { |l| @buffer << l }
    end

    def offset=(o) @offset = o end
    def lineno()   @lines_support ? @buffer.lookup(offset)/2 + 1 : -1  end
    def to_s() "Parse Context: offset = #{@offset}, BUFFER[\n#{@buffer}\n]" end
  end

  class TextTree
    attr_reader :root
    attr_writer :is_debug

    def MATCH(stream, &block)
      raise 'Text cannot be nil'       if stream.nil?
      raise 'Tree has not been defined ' if @root.nil?
      stream = File.new(stream, 'r') if stream.kind_of?(String)
      context = ParseContext.new(stream, &block)
      if @eraser_tree
        @eraser_tree.make_ready()
        match_(@eraser_tree, context)
      end

      context.offset = 0
      @root.make_ready()
      match_(@root, context)
    end

    def HANDLER(id, &block)
      if id.kind_of?(String) || id.kind_of?(Symbol)
        @members_def[id.to_s][2] = block
      else
        id.each { |i|
          raise "Member '#{i}' has not been declared." if @members_def[i.to_s].nil?
          @members_def[i.to_s][2] = block
        }
      end
    end

  protected

    def initialize(tree_id, &block)
      raise 'Tree ID cannot be nil' if tree_id.nil?
      raise 'Tree definition block has not been passed' if !block
      tree_id = tree_id.to_s
      raise "Tree '#{tree_id}' is already defined" if $trees[tree_id]

      @members_def, @parent_stack, @is_debug = {}, [], false
      instance_eval(&block)
    end

    def MEMBER(id, start_at, end_at = nil, &block)
      raise 'Member ID cannot be nil' if id.nil?
      id = id.to_s
      raise "Member '#{id}' has been already defined." if @members_def[id]
      @members_def[id] = [start_at, end_at, block]
    end

    def DEF_TREE (&block) @root = GroupMember.new('root'); tree_(@root, &block) end
    def DEF_ERASE(&block) @eraser_tree = GroupMember.new('eraser'); tree_(@eraser_tree, &block) end

    def instantiate_member(id, *args)
      prefix = id[/^_[a-zA-Z]+_/]
      if prefix && $prefixes[prefix]
        def_class = eval $prefixes[prefix]
      else
        if @eraser_tree && @parent_stack[0] == @eraser_tree
          def_class = ErasedMember
        else
          def_class = TextMember
        end
      end

      definition = @members_def[id]
      raise "Unknown member #{id}" if definition.nil?

      m = def_class.new(id, definition[0], definition[1], &definition[2])
      if args.length > 0
        m.is_reference = true if (args[0] == :r || (args.length > 1 && args[1] == :r))
        m.is_union     = true if (args[0] == :u || (args.length > 1 && args[1] == :u))
        m.occurence = args[0] if args[0] != :r && args[0] != :u
      end
      return m
    end

    def def_tree_(root, &block)
      raise 'Root cannot be nil' if root.nil?
      @parent_stack.push(root)
      instance_eval(&block) if block
      @parent_stack.pop()
    end

    def method_missing(method, *args, &block)
      id = method.to_s
      parent = @parent_stack.last
      raise "Parent '#{parent.id}' cannot have kids" if !parent.can_have_kids?()
      raise "Incorrect member name format '#{id}'"   if id[0,1] != '_'
      raise "Member '#{id}' has not been defined"    if @members_def[id].nil?

      kid = instantiate_member(id, *args)
      parent.kids << kid
      kid.parent = parent
      def_tree_(kid, &block) if block
    end

    def match_(root, context, shift='')
      start_,end_,p_offset,p_len,kids = nil,nil,context.offset,context.buffer.length,resolve_kids(root.kids)

      while !root.done?
        stored_offset, stored_len = context.offset, context.buffer.length

        if start_.nil?
          start_ = root.match_start(context)
          break if start_.nil?

          debug "#{shift}>>>#{root}"

          root.member_started(start_, context)
          # clean up occurences
          kids.each { |k| k.occurences = 0 }
        end

        if root.is_union
          handle_kids_union(kids, root, context, shift + '   ')
        else
          handle_kids_sequence(kids, root, context, shift + '   ')
        end

        end_ = root.match_end(context)
        if end_ || (stored_offset == context.offset && stored_len == context.buffer.length)
          debug "#{shift}<<<#{root}"
          kids.each { | kid |
            raise "Kid '#{kid.id}' has not been resolved for '#{root.id}' parent." if (kid.occurence.nil? || kid.occurence == '+') && kid.occurences == 0
          }

          call_handler(root, start_, end_, context) if end_
          root.member_ended(start_, end_, context)
          break
        end
      end
      p_offset != context.offset || p_len != context.buffer.length
    end

    def call_handler(root, start_, end_, context)
      mdef     = @members_def[root.id.to_s]
      handler  = mdef.nil? ? nil : mdef[2]
      mcontext = ParsedMember.new(root, start_, end_, context) if handler || context.block
      handler.call(mcontext) if handler
      context.block.call(mcontext) if context.block
    end

    def resolve_kids(kids)
      kids.each_index { |i|
        k = kids[i]
        if k.is_reference
          parent = k.lookup_parent(k.id)
          raise "Cannot find parent #{k.id}" if parent.nil?
          clonned = parent.clone_member()
          clonned.parent = k.parent
          kids[i] = clonned
        end
      }
      kids
    end

    def handle_kids_sequence(kids, root, context, shift='')
      # Looking for an active kid
      index = kids.length - 1
      while index >= 0 && kids[index].occurences == 0; index -= 1; end
      index += 1 if index >= 0 && (kids[index].occurence == '?' || kids[index].occurence.nil?)
      index  = 0 if index < 0

      # Test kids
      while index < kids.length
        end_ = root.end_at ? root.match_end(context) : nil

        kid = kids[index]
        res = kid.match_start(context)

        if res && (end_.nil? || res.index <= end_.index)
          context.offset = res.index
          b = match_(kid, context, shift)
          raise "Mandatory member '#{kid}' cannot be found" if b == false && (kid.occurence.nil? || kid.occurence == '+')
          index += 1 if b == false || kid.occurence.nil? || kid.occurence == '?'
        else
          break if kid.occurence.nil? || kid.occurence == '?'
          index += 1
        end
      end
    end

    def handle_kids_union(kids, root, context, shift='')
      excluded_kids = []
      while excluded_kids.length < kids.length
        mkid_sr, mkid = nil, nil
        kids.each { |kid|
          next if kid.done? || excluded_kids.include?(kid)
          sr = kid.match_start(context)
          if sr && (mkid.nil? || mkid_sr.index > sr.index)
            end_ = root.match_end(context)
            if end_.nil? || end_.index >= sr.index
              mkid    = kid
              mkid_sr = sr
            end
          end
        }

        break if mkid.nil?
        context.offset = mkid_sr.index
        excluded_kids << mkid if !match_(mkid, context, shift + '   ')
      end
    end

  private

    def tree_(root, &block)
      raise 'Root cannot be nil' if root.nil?
      @parent_stack.clear()
      def_tree_(root, &block)
      root
    end

    def debug(s)
      puts s if @is_debug
    end
  end

  class SearchResult
    attr_reader :index, :match_len, :match_data

    def initialize(index, match_data, match_len)
      raise 'Incorrect match len' if index >= 0 && match_len.nil?
      @index, @match_len, @match_data = index, match_len, match_data
    end

    def to_s() "Search Result: index = #{index}, len = #{match_len}, md = #{match_data}" end
  end

  class TextMember
    attr_reader :id, :start_at, :end_at, :occurence, :occurences, :is_union, :is_reference, :parent, :kids
    attr_writer :occurence, :occurences, :is_union, :is_reference, :parent

    def dump(parent=nil, shift='')
      return if self == parent
      @kids.each { | kid | kid.dump(self, shift + '   ') }
    end

    def match_end(context)
      @end_at ? match(context, @end_at) : SearchResult.new(context.offset, nil, 0)
    end

    def match_start(context) @s_match_start  = match(context, @start_at) end

    def member_started(start_, context)
      context.offset = start_.index + start_.match_len
    end

    def member_ended(start_, end_, context)
      @occurences += 1
      context.offset = end_.index + end_.match_len
    end

    def make_ready()
      @occurences  = 0
      @kids.each { |kid| kid.make_ready() }
    end

    def can_have_kids?() @end_at != nil end

    #
    # Done means the member cannot be applied
    #
    def done?()
      b = @kids.length > 0 && @kids.last.done?
      return b || (!@start_at.nil? && occurences > 0 && (occurence == '?' || occurence.nil?))
    end

    def lookup_parent(pid)
      p = parent
      while p != nil && pid != p.id
        p = p.parent
      end
      p
    end

    def clone_member()
      cloned = self.class.new(@id, @start_at, @end_at)
      cloned.occurence = @occurence
      cloned.is_reference = @is_reference
      cloned.is_union = @is_union
      @kids.each { |k|
        ck = k.clone_member()
        ck.parent = cloned
        cloned.kids << ck
      }
      cloned
    end

    def to_s()
      union_s = @is_union ? 'UNION' : 'SEQUENCE'
      cn_s = self.class.to_s
      cn_s[/[a-zA-Z0-9_]+::/] = ''
      ref_s = @is_reference ? '<REF>' : ''
      "#{cn_s}: #{@id} [#{@start_at},#{@end_at}], #{@occurence}, #{union_s}, #{mtype_s()} #{ref_s}"
    end

  protected

    def initialize(id, start_at = nil, end_at = nil)
      @id, @start_at, @end_at, @kids = nid(id), start_at, end_at, []
      @occurences, @occurence, @is_union, @is_reference = 0, nil, false, false
    end

    def mtype_s() @end_at ? 'SECTION' : 'SINGLE' end

  private

    def match(context, s)
      res = context.buffer.index(s, context.offset)
      if res
        md   = Regexp.last_match
        md_l = md ? context.buffer.length - md.post_match.length - md.pre_match.length : s.length
        return SearchResult.new(res, md, md_l)
      end
      nil
    end

    def nid(id)
      raise 'ID cannot be nil.' if id.nil?
      id.kind_of?(Symbol) ? id.to_s : id
    end
  end

  class ConditionMember < TextMember
    def member_ended(start_, end_, context)
      @occurences += 1
      context.offset = end_.index + end_.match_len
    end

    def member_started(start_, context) end
    def can_have_kids?() true end
  end

  class ErasedMember < TextMember
    def member_ended(start_, end_, context)
      super(start_, end_, context)
      @occurences += 1
      context.offset = start_.index
      context.buffer[start_.index, end_.index - start_.index + end_.match_len] = ''
    end
  end

  class GroupMember < TextMember
    def match_start(context) SearchResult.new(context.offset, nil, 0)  end
    def member_ended(start_, end_, context) @occurences += 1 end
    def match_end(context) nil end
    def can_have_kids?() true end
  end

  def TXTPARSER.TREE(id, &block)
    raise 'Tree ID cannot be nil' if id.nil?
    id = id.to_s
    if block
      raise "Tree '#{id}' has been already defined." if $trees[id]
      $trees[id] = TextTree.new(id, &block)
    end
    raise "Tree '#{id}' was not defined." if $trees[id].nil?
    $trees[id]
  end
end


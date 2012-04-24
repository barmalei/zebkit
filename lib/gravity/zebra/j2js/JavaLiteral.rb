# Auto-generated from a Treetop grammar. Edits may be lost.


module JavaLiteral
  include Treetop::Runtime

  def root
    @root ||= :literal
  end

  module Literal0
  end

  def _nt_literal
    start_index = index
    if node_cache[:literal].has_key?(index)
      cached = node_cache[:literal][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    r1 = _nt_charLiteral
    r1.extend(JavaFixedValue)
    if r1
      r0 = r1
    else
      r2 = _nt_stringLiteral
      r2.extend(JavaFixedValue)
      if r2
        r0 = r2
      else
        r3 = _nt_hexLiteral
        r3.extend(JavaFixedValue)
        if r3
          r0 = r3
        else
          r4 = _nt_floatLiteral
          r4.extend(JavaFixedValue)
          if r4
            r0 = r4
          else
            r5 = _nt_integerLiteral
            r5.extend(JavaFixedValue)
            if r5
              r0 = r5
            else
              i6, s6 = index, []
              i7 = index
              if has_terminal?("true", false, index)
                r8 = instantiate_node(SyntaxNode,input, index...(index + 4))
                @index += 4
              else
                terminal_parse_failure("true")
                r8 = nil
              end
              if r8
                r7 = r8
              else
                if has_terminal?("false", false, index)
                  r9 = instantiate_node(SyntaxNode,input, index...(index + 5))
                  @index += 5
                else
                  terminal_parse_failure("false")
                  r9 = nil
                end
                if r9
                  r7 = r9
                else
                  if has_terminal?("null", false, index)
                    r10 = instantiate_node(SyntaxNode,input, index...(index + 4))
                    @index += 4
                  else
                    terminal_parse_failure("null")
                    r10 = nil
                  end
                  if r10
                    r7 = r10
                  else
                    @index = i7
                    r7 = nil
                  end
                end
              end
              s6 << r7
              if r7
                i11 = index
                if has_terminal?('\G[a-zA-Z0-9]', true, index)
                  r12 = true
                  @index += 1
                else
                  r12 = nil
                end
                if r12
                  r11 = nil
                else
                  @index = i11
                  r11 = instantiate_node(SyntaxNode,input, index...index)
                end
                s6 << r11
              end
              if s6.last
                r6 = instantiate_node(SyntaxNode,input, i6...index, s6)
                r6.extend(Literal0)
              else
                @index = i6
                r6 = nil
              end
              if r6
                r0 = r6
              else
                @index = i0
                r0 = nil
              end
            end
          end
        end
      end
    end

    node_cache[:literal][start_index] = r0

    r0
  end

  module IntegerLiteral0
  end

  def _nt_integerLiteral
    start_index = index
    if node_cache[:integerLiteral].has_key?(index)
      cached = node_cache[:integerLiteral][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    i1 = index
    r2 = _nt_hexLiteral
    if r2
      r1 = r2
    else
      s3, i3 = [], index
      loop do
        if has_terminal?('\G[0-9]', true, index)
          r4 = true
          @index += 1
        else
          r4 = nil
        end
        if r4
          s3 << r4
        else
          break
        end
      end
      if s3.empty?
        @index = i3
        r3 = nil
      else
        r3 = instantiate_node(SyntaxNode,input, i3...index, s3)
      end
      if r3
        r1 = r3
      else
        @index = i1
        r1 = nil
      end
    end
    s0 << r1
    if r1
      if has_terminal?('\G[lL]', true, index)
        r6 = true
        @index += 1
      else
        r6 = nil
      end
      if r6
        r5 = r6
      else
        r5 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r5
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(IntegerLiteral0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:integerLiteral][start_index] = r0

    r0
  end

  module HexLiteral0
  end

  def _nt_hexLiteral
    start_index = index
    if node_cache[:hexLiteral].has_key?(index)
      cached = node_cache[:hexLiteral][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    i1 = index
    if has_terminal?("0x", false, index)
      r2 = instantiate_node(SyntaxNode,input, index...(index + 2))
      @index += 2
    else
      terminal_parse_failure("0x")
      r2 = nil
    end
    if r2
      r1 = r2
    else
      if has_terminal?("0X", false, index)
        r3 = instantiate_node(SyntaxNode,input, index...(index + 2))
        @index += 2
      else
        terminal_parse_failure("0X")
        r3 = nil
      end
      if r3
        r1 = r3
      else
        @index = i1
        r1 = nil
      end
    end
    s0 << r1
    if r1
      s4, i4 = [], index
      loop do
        r5 = _nt_hexDigit
        if r5
          s4 << r5
        else
          break
        end
      end
      if s4.empty?
        @index = i4
        r4 = nil
      else
        r4 = instantiate_node(SyntaxNode,input, i4...index, s4)
      end
      s0 << r4
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(HexLiteral0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:hexLiteral][start_index] = r0

    r0
  end

  module FloatLiteral0
  end

  module FloatLiteral1
  end

  module FloatLiteral2
  end

  def _nt_floatLiteral
    start_index = index
    if node_cache[:floatLiteral].has_key?(index)
      cached = node_cache[:floatLiteral][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    i1 = index
    i2, s2 = index, []
    s3, i3 = [], index
    loop do
      if has_terminal?('\G[0-9]', true, index)
        r4 = true
        @index += 1
      else
        r4 = nil
      end
      if r4
        s3 << r4
      else
        break
      end
    end
    if s3.empty?
      @index = i3
      r3 = nil
    else
      r3 = instantiate_node(SyntaxNode,input, i3...index, s3)
    end
    s2 << r3
    if r3
      if has_terminal?('.', false, index)
        r5 = instantiate_node(SyntaxNode,input, index...(index + 1))
        @index += 1
      else
        terminal_parse_failure('.')
        r5 = nil
      end
      s2 << r5
      if r5
        s6, i6 = [], index
        loop do
          if has_terminal?('\G[0-9]', true, index)
            r7 = true
            @index += 1
          else
            r7 = nil
          end
          if r7
            s6 << r7
          else
            break
          end
        end
        r6 = instantiate_node(SyntaxNode,input, i6...index, s6)
        s2 << r6
      end
    end
    if s2.last
      r2 = instantiate_node(SyntaxNode,input, i2...index, s2)
      r2.extend(FloatLiteral0)
    else
      @index = i2
      r2 = nil
    end
    if r2
      r1 = r2
    else
      i8, s8 = index, []
      if has_terminal?(".", false, index)
        r9 = instantiate_node(SyntaxNode,input, index...(index + 1))
        @index += 1
      else
        terminal_parse_failure(".")
        r9 = nil
      end
      s8 << r9
      if r9
        s10, i10 = [], index
        loop do
          if has_terminal?('\G[0-9]', true, index)
            r11 = true
            @index += 1
          else
            r11 = nil
          end
          if r11
            s10 << r11
          else
            break
          end
        end
        if s10.empty?
          @index = i10
          r10 = nil
        else
          r10 = instantiate_node(SyntaxNode,input, i10...index, s10)
        end
        s8 << r10
      end
      if s8.last
        r8 = instantiate_node(SyntaxNode,input, i8...index, s8)
        r8.extend(FloatLiteral1)
      else
        @index = i8
        r8 = nil
      end
      if r8
        r1 = r8
      else
        s12, i12 = [], index
        loop do
          if has_terminal?('\G[0-9]', true, index)
            r13 = true
            @index += 1
          else
            r13 = nil
          end
          if r13
            s12 << r13
          else
            break
          end
        end
        if s12.empty?
          @index = i12
          r12 = nil
        else
          r12 = instantiate_node(SyntaxNode,input, i12...index, s12)
        end
        if r12
          r1 = r12
        else
          @index = i1
          r1 = nil
        end
      end
    end
    s0 << r1
    if r1
      r15 = _nt_exponent
      if r15
        r14 = r15
      else
        r14 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r14
      if r14
        if has_terminal?('\G[fFdD]', true, index)
          r17 = true
          @index += 1
        else
          r17 = nil
        end
        if r17
          r16 = r17
        else
          r16 = instantiate_node(SyntaxNode,input, index...index)
        end
        s0 << r16
      end
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(FloatLiteral2)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:floatLiteral][start_index] = r0

    r0
  end

  def _nt_hexDigit
    start_index = index
    if node_cache[:hexDigit].has_key?(index)
      cached = node_cache[:hexDigit][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    if has_terminal?('\G[a-fA-F0-9]', true, index)
      r0 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      r0 = nil
    end

    node_cache[:hexDigit][start_index] = r0

    r0
  end

  module Exponent0
  end

  def _nt_exponent
    start_index = index
    if node_cache[:exponent].has_key?(index)
      cached = node_cache[:exponent][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?('\G[eE]', true, index)
      r1 = true
      @index += 1
    else
      r1 = nil
    end
    s0 << r1
    if r1
      if has_terminal?('\G[+-]', true, index)
        r3 = true
        @index += 1
      else
        r3 = nil
      end
      if r3
        r2 = r3
      else
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
      if r2
        s4, i4 = [], index
        loop do
          if has_terminal?('\G[0-9]', true, index)
            r5 = true
            @index += 1
          else
            r5 = nil
          end
          if r5
            s4 << r5
          else
            break
          end
        end
        if s4.empty?
          @index = i4
          r4 = nil
        else
          r4 = instantiate_node(SyntaxNode,input, i4...index, s4)
        end
        s0 << r4
      end
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(Exponent0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:exponent][start_index] = r0

    r0
  end

  module UnicodeEscape0
    def hexDigit1
      elements[1]
    end

    def hexDigit2
      elements[2]
    end

    def hexDigit3
      elements[3]
    end

    def hexDigit4
      elements[4]
    end
  end

  def _nt_unicodeEscape
    start_index = index
    if node_cache[:unicodeEscape].has_key?(index)
      cached = node_cache[:unicodeEscape][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    s1, i1 = [], index
    loop do
      if has_terminal?('u', false, index)
        r2 = instantiate_node(SyntaxNode,input, index...(index + 1))
        @index += 1
      else
        terminal_parse_failure('u')
        r2 = nil
      end
      if r2
        s1 << r2
      else
        break
      end
    end
    if s1.empty?
      @index = i1
      r1 = nil
    else
      r1 = instantiate_node(SyntaxNode,input, i1...index, s1)
    end
    s0 << r1
    if r1
      r3 = _nt_hexDigit
      s0 << r3
      if r3
        r4 = _nt_hexDigit
        s0 << r4
        if r4
          r5 = _nt_hexDigit
          s0 << r5
          if r5
            r6 = _nt_hexDigit
            s0 << r6
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(UnicodeEscape0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:unicodeEscape][start_index] = r0

    r0
  end

  module Escape0
  end

  def _nt_escape
    start_index = index
    if node_cache[:escape].has_key?(index)
      cached = node_cache[:escape][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("\\", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      terminal_parse_failure("\\")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      if has_terminal?('\G[btnfr\\"\\\\\']', true, index)
        r3 = true
        @index += 1
      else
        r3 = nil
      end
      if r3
        r2 = r3
      else
        r4 = _nt_unicodeEscape
        if r4
          r2 = r4
        else
          @index = i2
          r2 = nil
        end
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(Escape0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:escape][start_index] = r0

    r0
  end

  module CharLiteral0
  end

  module CharLiteral1
  end

  def _nt_charLiteral
    start_index = index
    if node_cache[:charLiteral].has_key?(index)
      cached = node_cache[:charLiteral][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("'", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      terminal_parse_failure("'")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_escape
      if r3
        r2 = r3
      else
        i4, s4 = index, []
        i5 = index
        if has_terminal?('\G[\\\'\\\\]', true, index)
          r6 = true
          @index += 1
        else
          r6 = nil
        end
        if r6
          r5 = nil
        else
          @index = i5
          r5 = instantiate_node(SyntaxNode,input, index...index)
        end
        s4 << r5
        if r5
          if index < input_length
            r7 = instantiate_node(SyntaxNode,input, index...(index + 1))
            @index += 1
          else
            terminal_parse_failure("any character")
            r7 = nil
          end
          s4 << r7
        end
        if s4.last
          r4 = instantiate_node(SyntaxNode,input, i4...index, s4)
          r4.extend(CharLiteral0)
        else
          @index = i4
          r4 = nil
        end
        if r4
          r2 = r4
        else
          @index = i2
          r2 = nil
        end
      end
      s0 << r2
      if r2
        if has_terminal?("'", false, index)
          r8 = instantiate_node(SyntaxNode,input, index...(index + 1))
          @index += 1
        else
          terminal_parse_failure("'")
          r8 = nil
        end
        s0 << r8
      end
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(CharLiteral1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:charLiteral][start_index] = r0

    r0
  end

  module StringLiteral0
  end

  module StringLiteral1
  end

  def _nt_stringLiteral
    start_index = index
    if node_cache[:stringLiteral].has_key?(index)
      cached = node_cache[:stringLiteral][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("\"", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      terminal_parse_failure("\"")
      r1 = nil
    end
    s0 << r1
    if r1
      s2, i2 = [], index
      loop do
        i3 = index
        r4 = _nt_escape
        if r4
          r3 = r4
        else
          i5, s5 = index, []
          i6 = index
          if has_terminal?('\G[\\r\\n\\"]', true, index)
            r7 = true
            @index += 1
          else
            r7 = nil
          end
          if r7
            r6 = nil
          else
            @index = i6
            r6 = instantiate_node(SyntaxNode,input, index...index)
          end
          s5 << r6
          if r6
            if index < input_length
              r8 = instantiate_node(SyntaxNode,input, index...(index + 1))
              @index += 1
            else
              terminal_parse_failure("any character")
              r8 = nil
            end
            s5 << r8
          end
          if s5.last
            r5 = instantiate_node(SyntaxNode,input, i5...index, s5)
            r5.extend(StringLiteral0)
          else
            @index = i5
            r5 = nil
          end
          if r5
            r3 = r5
          else
            @index = i3
            r3 = nil
          end
        end
        if r3
          s2 << r3
        else
          break
        end
      end
      r2 = instantiate_node(SyntaxNode,input, i2...index, s2)
      s0 << r2
      if r2
        if has_terminal?("\"", false, index)
          r9 = instantiate_node(SyntaxNode,input, index...(index + 1))
          @index += 1
        else
          terminal_parse_failure("\"")
          r9 = nil
        end
        s0 << r9
      end
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(StringLiteral1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:stringLiteral][start_index] = r0

    r0
  end

end

class JavaLiteralParser < Treetop::Runtime::CompiledParser
  include JavaLiteral
end


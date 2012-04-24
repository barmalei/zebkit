# Auto-generated from a Treetop grammar. Edits may be lost.


module JavaCommon
  include Treetop::Runtime

  def root
    @root ||= :letterOrDigit
  end

  def _nt_letterOrDigit
    start_index = index
    if node_cache[:letterOrDigit].has_key?(index)
      cached = node_cache[:letterOrDigit][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    if has_terminal?('\G[a-zA-Z]', true, index)
      r1 = true
      @index += 1
    else
      r1 = nil
    end
    if r1
      r0 = r1
    else
      if has_terminal?('\G[0-9]', true, index)
        r2 = true
        @index += 1
      else
        r2 = nil
      end
      if r2
        r0 = r2
      else
        @index = i0
        r0 = nil
      end
    end

    node_cache[:letterOrDigit][start_index] = r0

    r0
  end

  def _nt_letter
    start_index = index
    if node_cache[:letter].has_key?(index)
      cached = node_cache[:letter][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    if has_terminal?('\G[a-zA-Z_$]', true, index)
      r0 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      r0 = nil
    end

    node_cache[:letter][start_index] = r0

    r0
  end

  module BinomialOperation0
  end

  def _nt_binomialOperation
    start_index = index
    if node_cache[:binomialOperation].has_key?(index)
      cached = node_cache[:binomialOperation][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    i1 = index
    r2 = _nt_arithmeticOperation
    if r2
      r1 = r2
    else
      r3 = _nt_logicalOperation
      if r3
        r1 = r3
      else
        r4 = _nt_bitOperation
        if r4
          r1 = r4
        else
          @index = i1
          r1 = nil
        end
      end
    end
    s0 << r1
    if r1
      if has_terminal?('', false, index)
        r5 = instantiate_node(SyntaxNode,input, index...(index + 0))
        @index += 0
      else
        terminal_parse_failure('')
        r5 = nil
      end
      s0 << r5
    end
    if s0.last
      r0 = instantiate_node(JavaExpressionOperator,input, i0...index, s0)
      r0.extend(BinomialOperation0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:binomialOperation][start_index] = r0

    r0
  end

  module LogicalOperation0
  end

  module LogicalOperation1
  end

  def _nt_logicalOperation
    start_index = index
    if node_cache[:logicalOperation].has_key?(index)
      cached = node_cache[:logicalOperation][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    if has_terminal?("&&", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 2))
      @index += 2
    else
      terminal_parse_failure("&&")
      r1 = nil
    end
    if r1
      r0 = r1
    else
      if has_terminal?("||", false, index)
        r2 = instantiate_node(SyntaxNode,input, index...(index + 2))
        @index += 2
      else
        terminal_parse_failure("||")
        r2 = nil
      end
      if r2
        r0 = r2
      else
        if has_terminal?("!=", false, index)
          r3 = instantiate_node(SyntaxNode,input, index...(index + 2))
          @index += 2
        else
          terminal_parse_failure("!=")
          r3 = nil
        end
        if r3
          r0 = r3
        else
          if has_terminal?("==", false, index)
            r4 = instantiate_node(SyntaxNode,input, index...(index + 2))
            @index += 2
          else
            terminal_parse_failure("==")
            r4 = nil
          end
          if r4
            r0 = r4
          else
            if has_terminal?("<=", false, index)
              r5 = instantiate_node(SyntaxNode,input, index...(index + 2))
              @index += 2
            else
              terminal_parse_failure("<=")
              r5 = nil
            end
            if r5
              r0 = r5
            else
              if has_terminal?(">=", false, index)
                r6 = instantiate_node(SyntaxNode,input, index...(index + 2))
                @index += 2
              else
                terminal_parse_failure(">=")
                r6 = nil
              end
              if r6
                r0 = r6
              else
                i7, s7 = index, []
                if has_terminal?("<", false, index)
                  r8 = instantiate_node(SyntaxNode,input, index...(index + 1))
                  @index += 1
                else
                  terminal_parse_failure("<")
                  r8 = nil
                end
                s7 << r8
                if r8
                  i9 = index
                  if has_terminal?('\G[<=]', true, index)
                    r10 = true
                    @index += 1
                  else
                    r10 = nil
                  end
                  if r10
                    r9 = nil
                  else
                    @index = i9
                    r9 = instantiate_node(SyntaxNode,input, index...index)
                  end
                  s7 << r9
                end
                if s7.last
                  r7 = instantiate_node(SyntaxNode,input, i7...index, s7)
                  r7.extend(LogicalOperation0)
                else
                  @index = i7
                  r7 = nil
                end
                if r7
                  r0 = r7
                else
                  i11, s11 = index, []
                  if has_terminal?(">", false, index)
                    r12 = instantiate_node(SyntaxNode,input, index...(index + 1))
                    @index += 1
                  else
                    terminal_parse_failure(">")
                    r12 = nil
                  end
                  s11 << r12
                  if r12
                    i13 = index
                    if has_terminal?('\G[>=]', true, index)
                      r14 = true
                      @index += 1
                    else
                      r14 = nil
                    end
                    if r14
                      r13 = nil
                    else
                      @index = i13
                      r13 = instantiate_node(SyntaxNode,input, index...index)
                    end
                    s11 << r13
                  end
                  if s11.last
                    r11 = instantiate_node(SyntaxNode,input, i11...index, s11)
                    r11.extend(LogicalOperation1)
                  else
                    @index = i11
                    r11 = nil
                  end
                  if r11
                    r0 = r11
                  else
                    @index = i0
                    r0 = nil
                  end
                end
              end
            end
          end
        end
      end
    end

    node_cache[:logicalOperation][start_index] = r0

    r0
  end

  module BitOperation0
  end

  module BitOperation1
  end

  module BitOperation2
  end

  module BitOperation3
  end

  module BitOperation4
  end

  def _nt_bitOperation
    start_index = index
    if node_cache[:bitOperation].has_key?(index)
      cached = node_cache[:bitOperation][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    i1, s1 = index, []
    if has_terminal?("&", false, index)
      r2 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      terminal_parse_failure("&")
      r2 = nil
    end
    s1 << r2
    if r2
      i3 = index
      if has_terminal?('\G[&=]', true, index)
        r4 = true
        @index += 1
      else
        r4 = nil
      end
      if r4
        r3 = nil
      else
        @index = i3
        r3 = instantiate_node(SyntaxNode,input, index...index)
      end
      s1 << r3
    end
    if s1.last
      r1 = instantiate_node(SyntaxNode,input, i1...index, s1)
      r1.extend(BitOperation0)
    else
      @index = i1
      r1 = nil
    end
    if r1
      r0 = r1
    else
      i5, s5 = index, []
      if has_terminal?("|", false, index)
        r6 = instantiate_node(SyntaxNode,input, index...(index + 1))
        @index += 1
      else
        terminal_parse_failure("|")
        r6 = nil
      end
      s5 << r6
      if r6
        i7 = index
        if has_terminal?('\G[=|]', true, index)
          r8 = true
          @index += 1
        else
          r8 = nil
        end
        if r8
          r7 = nil
        else
          @index = i7
          r7 = instantiate_node(SyntaxNode,input, index...index)
        end
        s5 << r7
      end
      if s5.last
        r5 = instantiate_node(SyntaxNode,input, i5...index, s5)
        r5.extend(BitOperation1)
      else
        @index = i5
        r5 = nil
      end
      if r5
        r0 = r5
      else
        i9, s9 = index, []
        if has_terminal?(">>>", false, index)
          r10 = instantiate_node(SyntaxNode,input, index...(index + 3))
          @index += 3
        else
          terminal_parse_failure(">>>")
          r10 = nil
        end
        s9 << r10
        if r10
          i11 = index
          if has_terminal?("=", false, index)
            r12 = instantiate_node(SyntaxNode,input, index...(index + 1))
            @index += 1
          else
            terminal_parse_failure("=")
            r12 = nil
          end
          if r12
            r11 = nil
          else
            @index = i11
            r11 = instantiate_node(SyntaxNode,input, index...index)
          end
          s9 << r11
        end
        if s9.last
          r9 = instantiate_node(SyntaxNode,input, i9...index, s9)
          r9.extend(BitOperation2)
        else
          @index = i9
          r9 = nil
        end
        if r9
          r0 = r9
        else
          i13, s13 = index, []
          if has_terminal?(">>", false, index)
            r14 = instantiate_node(SyntaxNode,input, index...(index + 2))
            @index += 2
          else
            terminal_parse_failure(">>")
            r14 = nil
          end
          s13 << r14
          if r14
            i15 = index
            if has_terminal?('\G[>=]', true, index)
              r16 = true
              @index += 1
            else
              r16 = nil
            end
            if r16
              r15 = nil
            else
              @index = i15
              r15 = instantiate_node(SyntaxNode,input, index...index)
            end
            s13 << r15
          end
          if s13.last
            r13 = instantiate_node(SyntaxNode,input, i13...index, s13)
            r13.extend(BitOperation3)
          else
            @index = i13
            r13 = nil
          end
          if r13
            r0 = r13
          else
            i17, s17 = index, []
            if has_terminal?("<<", false, index)
              r18 = instantiate_node(SyntaxNode,input, index...(index + 2))
              @index += 2
            else
              terminal_parse_failure("<<")
              r18 = nil
            end
            s17 << r18
            if r18
              i19 = index
              if has_terminal?("=", false, index)
                r20 = instantiate_node(SyntaxNode,input, index...(index + 1))
                @index += 1
              else
                terminal_parse_failure("=")
                r20 = nil
              end
              if r20
                r19 = nil
              else
                @index = i19
                r19 = instantiate_node(SyntaxNode,input, index...index)
              end
              s17 << r19
            end
            if s17.last
              r17 = instantiate_node(SyntaxNode,input, i17...index, s17)
              r17.extend(BitOperation4)
            else
              @index = i17
              r17 = nil
            end
            if r17
              r0 = r17
            else
              if has_terminal?("^", false, index)
                r21 = instantiate_node(SyntaxNode,input, index...(index + 1))
                @index += 1
              else
                terminal_parse_failure("^")
                r21 = nil
              end
              if r21
                r0 = r21
              else
                @index = i0
                r0 = nil
              end
            end
          end
        end
      end
    end

    node_cache[:bitOperation][start_index] = r0

    r0
  end

  module ArithmeticOperation0
  end

  module ArithmeticOperation1
  end

  module ArithmeticOperation2
  end

  module ArithmeticOperation3
  end

  module ArithmeticOperation4
  end

  def _nt_arithmeticOperation
    start_index = index
    if node_cache[:arithmeticOperation].has_key?(index)
      cached = node_cache[:arithmeticOperation][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    i1, s1 = index, []
    if has_terminal?("*", false, index)
      r2 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      terminal_parse_failure("*")
      r2 = nil
    end
    s1 << r2
    if r2
      i3 = index
      if has_terminal?("=", false, index)
        r4 = instantiate_node(SyntaxNode,input, index...(index + 1))
        @index += 1
      else
        terminal_parse_failure("=")
        r4 = nil
      end
      if r4
        r3 = nil
      else
        @index = i3
        r3 = instantiate_node(SyntaxNode,input, index...index)
      end
      s1 << r3
    end
    if s1.last
      r1 = instantiate_node(SyntaxNode,input, i1...index, s1)
      r1.extend(ArithmeticOperation0)
    else
      @index = i1
      r1 = nil
    end
    if r1
      r0 = r1
    else
      i5, s5 = index, []
      if has_terminal?("/", false, index)
        r6 = instantiate_node(SyntaxNode,input, index...(index + 1))
        @index += 1
      else
        terminal_parse_failure("/")
        r6 = nil
      end
      s5 << r6
      if r6
        i7 = index
        if has_terminal?("=", false, index)
          r8 = instantiate_node(SyntaxNode,input, index...(index + 1))
          @index += 1
        else
          terminal_parse_failure("=")
          r8 = nil
        end
        if r8
          r7 = nil
        else
          @index = i7
          r7 = instantiate_node(SyntaxNode,input, index...index)
        end
        s5 << r7
      end
      if s5.last
        r5 = instantiate_node(SyntaxNode,input, i5...index, s5)
        r5.extend(ArithmeticOperation1)
      else
        @index = i5
        r5 = nil
      end
      if r5
        r0 = r5
      else
        i9, s9 = index, []
        if has_terminal?("%", false, index)
          r10 = instantiate_node(SyntaxNode,input, index...(index + 1))
          @index += 1
        else
          terminal_parse_failure("%")
          r10 = nil
        end
        s9 << r10
        if r10
          i11 = index
          if has_terminal?("=", false, index)
            r12 = instantiate_node(SyntaxNode,input, index...(index + 1))
            @index += 1
          else
            terminal_parse_failure("=")
            r12 = nil
          end
          if r12
            r11 = nil
          else
            @index = i11
            r11 = instantiate_node(SyntaxNode,input, index...index)
          end
          s9 << r11
        end
        if s9.last
          r9 = instantiate_node(SyntaxNode,input, i9...index, s9)
          r9.extend(ArithmeticOperation2)
        else
          @index = i9
          r9 = nil
        end
        if r9
          r0 = r9
        else
          i13, s13 = index, []
          if has_terminal?("+", false, index)
            r14 = instantiate_node(SyntaxNode,input, index...(index + 1))
            @index += 1
          else
            terminal_parse_failure("+")
            r14 = nil
          end
          s13 << r14
          if r14
            i15 = index
            if has_terminal?("=", false, index)
              r16 = instantiate_node(SyntaxNode,input, index...(index + 1))
              @index += 1
            else
              terminal_parse_failure("=")
              r16 = nil
            end
            if r16
              r15 = nil
            else
              @index = i15
              r15 = instantiate_node(SyntaxNode,input, index...index)
            end
            s13 << r15
          end
          if s13.last
            r13 = instantiate_node(SyntaxNode,input, i13...index, s13)
            r13.extend(ArithmeticOperation3)
          else
            @index = i13
            r13 = nil
          end
          if r13
            r0 = r13
          else
            i17, s17 = index, []
            if has_terminal?("-", false, index)
              r18 = instantiate_node(SyntaxNode,input, index...(index + 1))
              @index += 1
            else
              terminal_parse_failure("-")
              r18 = nil
            end
            s17 << r18
            if r18
              i19 = index
              if has_terminal?('\G[=-]', true, index)
                r20 = true
                @index += 1
              else
                r20 = nil
              end
              if r20
                r19 = nil
              else
                @index = i19
                r19 = instantiate_node(SyntaxNode,input, index...index)
              end
              s17 << r19
            end
            if s17.last
              r17 = instantiate_node(SyntaxNode,input, i17...index, s17)
              r17.extend(ArithmeticOperation4)
            else
              @index = i17
              r17 = nil
            end
            if r17
              r0 = r17
            else
              @index = i0
              r0 = nil
            end
          end
        end
      end
    end

    node_cache[:arithmeticOperation][start_index] = r0

    r0
  end

  module AssignmentOperation0
  end

  module AssignmentOperation1
  end

  def _nt_assignmentOperation
    start_index = index
    if node_cache[:assignmentOperation].has_key?(index)
      cached = node_cache[:assignmentOperation][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    i1 = index
    i2, s2 = index, []
    if has_terminal?("=", false, index)
      r3 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      terminal_parse_failure("=")
      r3 = nil
    end
    s2 << r3
    if r3
      i4 = index
      if has_terminal?("=", false, index)
        r5 = instantiate_node(SyntaxNode,input, index...(index + 1))
        @index += 1
      else
        terminal_parse_failure("=")
        r5 = nil
      end
      if r5
        r4 = nil
      else
        @index = i4
        r4 = instantiate_node(SyntaxNode,input, index...index)
      end
      s2 << r4
    end
    if s2.last
      r2 = instantiate_node(SyntaxNode,input, i2...index, s2)
      r2.extend(AssignmentOperation0)
    else
      @index = i2
      r2 = nil
    end
    if r2
      r1 = r2
    else
      if has_terminal?("+=", false, index)
        r6 = instantiate_node(SyntaxNode,input, index...(index + 2))
        @index += 2
      else
        terminal_parse_failure("+=")
        r6 = nil
      end
      if r6
        r1 = r6
      else
        if has_terminal?("-=", false, index)
          r7 = instantiate_node(SyntaxNode,input, index...(index + 2))
          @index += 2
        else
          terminal_parse_failure("-=")
          r7 = nil
        end
        if r7
          r1 = r7
        else
          if has_terminal?("*=", false, index)
            r8 = instantiate_node(SyntaxNode,input, index...(index + 2))
            @index += 2
          else
            terminal_parse_failure("*=")
            r8 = nil
          end
          if r8
            r1 = r8
          else
            if has_terminal?("/=", false, index)
              r9 = instantiate_node(SyntaxNode,input, index...(index + 2))
              @index += 2
            else
              terminal_parse_failure("/=")
              r9 = nil
            end
            if r9
              r1 = r9
            else
              if has_terminal?("&=", false, index)
                r10 = instantiate_node(SyntaxNode,input, index...(index + 2))
                @index += 2
              else
                terminal_parse_failure("&=")
                r10 = nil
              end
              if r10
                r1 = r10
              else
                if has_terminal?("|=", false, index)
                  r11 = instantiate_node(SyntaxNode,input, index...(index + 2))
                  @index += 2
                else
                  terminal_parse_failure("|=")
                  r11 = nil
                end
                if r11
                  r1 = r11
                else
                  if has_terminal?("^=", false, index)
                    r12 = instantiate_node(SyntaxNode,input, index...(index + 2))
                    @index += 2
                  else
                    terminal_parse_failure("^=")
                    r12 = nil
                  end
                  if r12
                    r1 = r12
                  else
                    if has_terminal?("%=", false, index)
                      r13 = instantiate_node(SyntaxNode,input, index...(index + 2))
                      @index += 2
                    else
                      terminal_parse_failure("%=")
                      r13 = nil
                    end
                    if r13
                      r1 = r13
                    else
                      if has_terminal?("<<=", false, index)
                        r14 = instantiate_node(SyntaxNode,input, index...(index + 3))
                        @index += 3
                      else
                        terminal_parse_failure("<<=")
                        r14 = nil
                      end
                      if r14
                        r1 = r14
                      else
                        if has_terminal?(">>=", false, index)
                          r15 = instantiate_node(SyntaxNode,input, index...(index + 3))
                          @index += 3
                        else
                          terminal_parse_failure(">>=")
                          r15 = nil
                        end
                        if r15
                          r1 = r15
                        else
                          if has_terminal?(">>>=", false, index)
                            r16 = instantiate_node(SyntaxNode,input, index...(index + 4))
                            @index += 4
                          else
                            terminal_parse_failure(">>>=")
                            r16 = nil
                          end
                          if r16
                            r1 = r16
                          else
                            @index = i1
                            r1 = nil
                          end
                        end
                      end
                    end
                  end
                end
              end
            end
          end
        end
      end
    end
    s0 << r1
    if r1
      if has_terminal?('', false, index)
        r17 = instantiate_node(SyntaxNode,input, index...(index + 0))
        @index += 0
      else
        terminal_parse_failure('')
        r17 = nil
      end
      s0 << r17
    end
    if s0.last
      r0 = instantiate_node(JavaExpressionOperator,input, i0...index, s0)
      r0.extend(AssignmentOperation1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:assignmentOperation][start_index] = r0

    r0
  end

  module PrefixOp0
  end

  def _nt_prefixOp
    start_index = index
    if node_cache[:prefixOp].has_key?(index)
      cached = node_cache[:prefixOp][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    i1 = index
    if has_terminal?("++", false, index)
      r2 = instantiate_node(SyntaxNode,input, index...(index + 2))
      @index += 2
    else
      terminal_parse_failure("++")
      r2 = nil
    end
    if r2
      r1 = r2
    else
      if has_terminal?("--", false, index)
        r3 = instantiate_node(SyntaxNode,input, index...(index + 2))
        @index += 2
      else
        terminal_parse_failure("--")
        r3 = nil
      end
      if r3
        r1 = r3
      else
        if has_terminal?("!", false, index)
          r4 = instantiate_node(SyntaxNode,input, index...(index + 1))
          @index += 1
        else
          terminal_parse_failure("!")
          r4 = nil
        end
        if r4
          r1 = r4
        else
          if has_terminal?("~", false, index)
            r5 = instantiate_node(SyntaxNode,input, index...(index + 1))
            @index += 1
          else
            terminal_parse_failure("~")
            r5 = nil
          end
          if r5
            r1 = r5
          else
            if has_terminal?("+", false, index)
              r6 = instantiate_node(SyntaxNode,input, index...(index + 1))
              @index += 1
            else
              terminal_parse_failure("+")
              r6 = nil
            end
            if r6
              r1 = r6
            else
              if has_terminal?("-", false, index)
                r7 = instantiate_node(SyntaxNode,input, index...(index + 1))
                @index += 1
              else
                terminal_parse_failure("-")
                r7 = nil
              end
              if r7
                r1 = r7
              else
                @index = i1
                r1 = nil
              end
            end
          end
        end
      end
    end
    s0 << r1
    if r1
      if has_terminal?('', false, index)
        r8 = instantiate_node(SyntaxNode,input, index...(index + 0))
        @index += 0
      else
        terminal_parse_failure('')
        r8 = nil
      end
      s0 << r8
    end
    if s0.last
      r0 = instantiate_node(JavaExpressionOperator,input, i0...index, s0)
      r0.extend(PrefixOp0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:prefixOp][start_index] = r0

    r0
  end

  module PostFixOp0
  end

  def _nt_postFixOp
    start_index = index
    if node_cache[:postFixOp].has_key?(index)
      cached = node_cache[:postFixOp][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    i1 = index
    if has_terminal?("++", false, index)
      r2 = instantiate_node(SyntaxNode,input, index...(index + 2))
      @index += 2
    else
      terminal_parse_failure("++")
      r2 = nil
    end
    if r2
      r1 = r2
    else
      if has_terminal?("--", false, index)
        r3 = instantiate_node(SyntaxNode,input, index...(index + 2))
        @index += 2
      else
        terminal_parse_failure("--")
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
      if has_terminal?('', false, index)
        r4 = instantiate_node(SyntaxNode,input, index...(index + 0))
        @index += 0
      else
        terminal_parse_failure('')
        r4 = nil
      end
      s0 << r4
    end
    if s0.last
      r0 = instantiate_node(JavaExpressionOperator,input, i0...index, s0)
      r0.extend(PostFixOp0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:postFixOp][start_index] = r0

    r0
  end

  module Keyword0
  end

  def _nt_keyword
    start_index = index
    if node_cache[:keyword].has_key?(index)
      cached = node_cache[:keyword][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    i1 = index
    if has_terminal?("assert", false, index)
      r2 = instantiate_node(SyntaxNode,input, index...(index + 6))
      @index += 6
    else
      terminal_parse_failure("assert")
      r2 = nil
    end
    if r2
      r1 = r2
    else
      if has_terminal?("break", false, index)
        r3 = instantiate_node(SyntaxNode,input, index...(index + 5))
        @index += 5
      else
        terminal_parse_failure("break")
        r3 = nil
      end
      if r3
        r1 = r3
      else
        if has_terminal?("case", false, index)
          r4 = instantiate_node(SyntaxNode,input, index...(index + 4))
          @index += 4
        else
          terminal_parse_failure("case")
          r4 = nil
        end
        if r4
          r1 = r4
        else
          if has_terminal?("catch", false, index)
            r5 = instantiate_node(SyntaxNode,input, index...(index + 5))
            @index += 5
          else
            terminal_parse_failure("catch")
            r5 = nil
          end
          if r5
            r1 = r5
          else
            if has_terminal?("class", false, index)
              r6 = instantiate_node(SyntaxNode,input, index...(index + 5))
              @index += 5
            else
              terminal_parse_failure("class")
              r6 = nil
            end
            if r6
              r1 = r6
            else
              if has_terminal?("continue", false, index)
                r7 = instantiate_node(SyntaxNode,input, index...(index + 8))
                @index += 8
              else
                terminal_parse_failure("continue")
                r7 = nil
              end
              if r7
                r1 = r7
              else
                if has_terminal?("default", false, index)
                  r8 = instantiate_node(SyntaxNode,input, index...(index + 7))
                  @index += 7
                else
                  terminal_parse_failure("default")
                  r8 = nil
                end
                if r8
                  r1 = r8
                else
                  if has_terminal?("do", false, index)
                    r9 = instantiate_node(SyntaxNode,input, index...(index + 2))
                    @index += 2
                  else
                    terminal_parse_failure("do")
                    r9 = nil
                  end
                  if r9
                    r1 = r9
                  else
                    if has_terminal?("else", false, index)
                      r10 = instantiate_node(SyntaxNode,input, index...(index + 4))
                      @index += 4
                    else
                      terminal_parse_failure("else")
                      r10 = nil
                    end
                    if r10
                      r1 = r10
                    else
                      if has_terminal?("enum", false, index)
                        r11 = instantiate_node(SyntaxNode,input, index...(index + 4))
                        @index += 4
                      else
                        terminal_parse_failure("enum")
                        r11 = nil
                      end
                      if r11
                        r1 = r11
                      else
                        if has_terminal?("extends", false, index)
                          r12 = instantiate_node(SyntaxNode,input, index...(index + 7))
                          @index += 7
                        else
                          terminal_parse_failure("extends")
                          r12 = nil
                        end
                        if r12
                          r1 = r12
                        else
                          if has_terminal?("finally", false, index)
                            r13 = instantiate_node(SyntaxNode,input, index...(index + 7))
                            @index += 7
                          else
                            terminal_parse_failure("finally")
                            r13 = nil
                          end
                          if r13
                            r1 = r13
                          else
                            if has_terminal?("final", false, index)
                              r14 = instantiate_node(SyntaxNode,input, index...(index + 5))
                              @index += 5
                            else
                              terminal_parse_failure("final")
                              r14 = nil
                            end
                            if r14
                              r1 = r14
                            else
                              if has_terminal?("for", false, index)
                                r15 = instantiate_node(SyntaxNode,input, index...(index + 3))
                                @index += 3
                              else
                                terminal_parse_failure("for")
                                r15 = nil
                              end
                              if r15
                                r1 = r15
                              else
                                if has_terminal?("if", false, index)
                                  r16 = instantiate_node(SyntaxNode,input, index...(index + 2))
                                  @index += 2
                                else
                                  terminal_parse_failure("if")
                                  r16 = nil
                                end
                                if r16
                                  r1 = r16
                                else
                                  if has_terminal?("implements", false, index)
                                    r17 = instantiate_node(SyntaxNode,input, index...(index + 10))
                                    @index += 10
                                  else
                                    terminal_parse_failure("implements")
                                    r17 = nil
                                  end
                                  if r17
                                    r1 = r17
                                  else
                                    if has_terminal?("import", false, index)
                                      r18 = instantiate_node(SyntaxNode,input, index...(index + 6))
                                      @index += 6
                                    else
                                      terminal_parse_failure("import")
                                      r18 = nil
                                    end
                                    if r18
                                      r1 = r18
                                    else
                                      if has_terminal?("interface", false, index)
                                        r19 = instantiate_node(SyntaxNode,input, index...(index + 9))
                                        @index += 9
                                      else
                                        terminal_parse_failure("interface")
                                        r19 = nil
                                      end
                                      if r19
                                        r1 = r19
                                      else
                                        if has_terminal?("instanceof", false, index)
                                          r20 = instantiate_node(SyntaxNode,input, index...(index + 10))
                                          @index += 10
                                        else
                                          terminal_parse_failure("instanceof")
                                          r20 = nil
                                        end
                                        if r20
                                          r1 = r20
                                        else
                                          if has_terminal?("new", false, index)
                                            r21 = instantiate_node(SyntaxNode,input, index...(index + 3))
                                            @index += 3
                                          else
                                            terminal_parse_failure("new")
                                            r21 = nil
                                          end
                                          if r21
                                            r1 = r21
                                          else
                                            if has_terminal?("package", false, index)
                                              r22 = instantiate_node(SyntaxNode,input, index...(index + 7))
                                              @index += 7
                                            else
                                              terminal_parse_failure("package")
                                              r22 = nil
                                            end
                                            if r22
                                              r1 = r22
                                            else
                                              if has_terminal?("return", false, index)
                                                r23 = instantiate_node(SyntaxNode,input, index...(index + 6))
                                                @index += 6
                                              else
                                                terminal_parse_failure("return")
                                                r23 = nil
                                              end
                                              if r23
                                                r1 = r23
                                              else
                                                if has_terminal?("static", false, index)
                                                  r24 = instantiate_node(SyntaxNode,input, index...(index + 6))
                                                  @index += 6
                                                else
                                                  terminal_parse_failure("static")
                                                  r24 = nil
                                                end
                                                if r24
                                                  r1 = r24
                                                else
                                                  if has_terminal?("switch", false, index)
                                                    r25 = instantiate_node(SyntaxNode,input, index...(index + 6))
                                                    @index += 6
                                                  else
                                                    terminal_parse_failure("switch")
                                                    r25 = nil
                                                  end
                                                  if r25
                                                    r1 = r25
                                                  else
                                                    if has_terminal?("synchronized", false, index)
                                                      r26 = instantiate_node(SyntaxNode,input, index...(index + 12))
                                                      @index += 12
                                                    else
                                                      terminal_parse_failure("synchronized")
                                                      r26 = nil
                                                    end
                                                    if r26
                                                      r1 = r26
                                                    else
                                                      if has_terminal?("this", false, index)
                                                        r27 = instantiate_node(SyntaxNode,input, index...(index + 4))
                                                        @index += 4
                                                      else
                                                        terminal_parse_failure("this")
                                                        r27 = nil
                                                      end
                                                      if r27
                                                        r1 = r27
                                                      else
                                                        if has_terminal?("throws", false, index)
                                                          r28 = instantiate_node(SyntaxNode,input, index...(index + 6))
                                                          @index += 6
                                                        else
                                                          terminal_parse_failure("throws")
                                                          r28 = nil
                                                        end
                                                        if r28
                                                          r1 = r28
                                                        else
                                                          if has_terminal?("throw", false, index)
                                                            r29 = instantiate_node(SyntaxNode,input, index...(index + 5))
                                                            @index += 5
                                                          else
                                                            terminal_parse_failure("throw")
                                                            r29 = nil
                                                          end
                                                          if r29
                                                            r1 = r29
                                                          else
                                                            if has_terminal?("try", false, index)
                                                              r30 = instantiate_node(SyntaxNode,input, index...(index + 3))
                                                              @index += 3
                                                            else
                                                              terminal_parse_failure("try")
                                                              r30 = nil
                                                            end
                                                            if r30
                                                              r1 = r30
                                                            else
                                                              if has_terminal?("void", false, index)
                                                                r31 = instantiate_node(SyntaxNode,input, index...(index + 4))
                                                                @index += 4
                                                              else
                                                                terminal_parse_failure("void")
                                                                r31 = nil
                                                              end
                                                              if r31
                                                                r1 = r31
                                                              else
                                                                if has_terminal?("while", false, index)
                                                                  r32 = instantiate_node(SyntaxNode,input, index...(index + 5))
                                                                  @index += 5
                                                                else
                                                                  terminal_parse_failure("while")
                                                                  r32 = nil
                                                                end
                                                                if r32
                                                                  r1 = r32
                                                                else
                                                                  @index = i1
                                                                  r1 = nil
                                                                end
                                                              end
                                                            end
                                                          end
                                                        end
                                                      end
                                                    end
                                                  end
                                                end
                                              end
                                            end
                                          end
                                        end
                                      end
                                    end
                                  end
                                end
                              end
                            end
                          end
                        end
                      end
                    end
                  end
                end
              end
            end
          end
        end
      end
    end
    s0 << r1
    if r1
      i33 = index
      r34 = _nt_letterOrDigit
      if r34
        r33 = nil
      else
        @index = i33
        r33 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r33
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(Keyword0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:keyword][start_index] = r0

    r0
  end

  module WHILE0
  end

  def _nt_WHILE
    start_index = index
    if node_cache[:WHILE].has_key?(index)
      cached = node_cache[:WHILE][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("while", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 5))
      @index += 5
    else
      terminal_parse_failure("while")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(WHILE0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:WHILE][start_index] = r0

    r0
  end

  module SWITCH0
  end

  def _nt_SWITCH
    start_index = index
    if node_cache[:SWITCH].has_key?(index)
      cached = node_cache[:SWITCH][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("switch", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 6))
      @index += 6
    else
      terminal_parse_failure("switch")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(SWITCH0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:SWITCH][start_index] = r0

    r0
  end

  module ASSERT0
  end

  def _nt_ASSERT
    start_index = index
    if node_cache[:ASSERT].has_key?(index)
      cached = node_cache[:ASSERT][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("assert", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 6))
      @index += 6
    else
      terminal_parse_failure("assert")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(ASSERT0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:ASSERT][start_index] = r0

    r0
  end

  module BREAK0
  end

  def _nt_BREAK
    start_index = index
    if node_cache[:BREAK].has_key?(index)
      cached = node_cache[:BREAK][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("break", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 5))
      @index += 5
    else
      terminal_parse_failure("break")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(BREAK0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:BREAK][start_index] = r0

    r0
  end

  module CASE0
  end

  def _nt_CASE
    start_index = index
    if node_cache[:CASE].has_key?(index)
      cached = node_cache[:CASE][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("case", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 4))
      @index += 4
    else
      terminal_parse_failure("case")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(CASE0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:CASE][start_index] = r0

    r0
  end

  module CATCH0
  end

  def _nt_CATCH
    start_index = index
    if node_cache[:CATCH].has_key?(index)
      cached = node_cache[:CATCH][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("catch", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 5))
      @index += 5
    else
      terminal_parse_failure("catch")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(CATCH0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:CATCH][start_index] = r0

    r0
  end

  module CLASS0
  end

  def _nt_CLASS
    start_index = index
    if node_cache[:CLASS].has_key?(index)
      cached = node_cache[:CLASS][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("class", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 5))
      @index += 5
    else
      terminal_parse_failure("class")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(CLASS0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:CLASS][start_index] = r0

    r0
  end

  module CONTINUE0
  end

  def _nt_CONTINUE
    start_index = index
    if node_cache[:CONTINUE].has_key?(index)
      cached = node_cache[:CONTINUE][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("continue", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 8))
      @index += 8
    else
      terminal_parse_failure("continue")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(CONTINUE0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:CONTINUE][start_index] = r0

    r0
  end

  module NEW0
  end

  def _nt_NEW
    start_index = index
    if node_cache[:NEW].has_key?(index)
      cached = node_cache[:NEW][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("new", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 3))
      @index += 3
    else
      terminal_parse_failure("new")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(NEW0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:NEW][start_index] = r0

    r0
  end

  module DEFAULT0
  end

  def _nt_DEFAULT
    start_index = index
    if node_cache[:DEFAULT].has_key?(index)
      cached = node_cache[:DEFAULT][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("default", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 7))
      @index += 7
    else
      terminal_parse_failure("default")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(DEFAULT0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:DEFAULT][start_index] = r0

    r0
  end

  module DO0
  end

  def _nt_DO
    start_index = index
    if node_cache[:DO].has_key?(index)
      cached = node_cache[:DO][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("do", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 2))
      @index += 2
    else
      terminal_parse_failure("do")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(DO0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:DO][start_index] = r0

    r0
  end

  module ELSE0
  end

  def _nt_ELSE
    start_index = index
    if node_cache[:ELSE].has_key?(index)
      cached = node_cache[:ELSE][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("else", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 4))
      @index += 4
    else
      terminal_parse_failure("else")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(ELSE0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:ELSE][start_index] = r0

    r0
  end

  module EXTENDS0
  end

  def _nt_EXTENDS
    start_index = index
    if node_cache[:EXTENDS].has_key?(index)
      cached = node_cache[:EXTENDS][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("extends", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 7))
      @index += 7
    else
      terminal_parse_failure("extends")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(EXTENDS0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:EXTENDS][start_index] = r0

    r0
  end

  module FINALLY0
  end

  def _nt_FINALLY
    start_index = index
    if node_cache[:FINALLY].has_key?(index)
      cached = node_cache[:FINALLY][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("finally", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 7))
      @index += 7
    else
      terminal_parse_failure("finally")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(FINALLY0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:FINALLY][start_index] = r0

    r0
  end

  module FINAL0
  end

  def _nt_FINAL
    start_index = index
    if node_cache[:FINAL].has_key?(index)
      cached = node_cache[:FINAL][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("final", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 5))
      @index += 5
    else
      terminal_parse_failure("final")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(FINAL0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:FINAL][start_index] = r0

    r0
  end

  module FOR0
  end

  def _nt_FOR
    start_index = index
    if node_cache[:FOR].has_key?(index)
      cached = node_cache[:FOR][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("for", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 3))
      @index += 3
    else
      terminal_parse_failure("for")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(FOR0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:FOR][start_index] = r0

    r0
  end

  module IF0
  end

  def _nt_IF
    start_index = index
    if node_cache[:IF].has_key?(index)
      cached = node_cache[:IF][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("if", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 2))
      @index += 2
    else
      terminal_parse_failure("if")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(IF0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:IF][start_index] = r0

    r0
  end

  module IMPLEMENTS0
  end

  def _nt_IMPLEMENTS
    start_index = index
    if node_cache[:IMPLEMENTS].has_key?(index)
      cached = node_cache[:IMPLEMENTS][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("implements", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 10))
      @index += 10
    else
      terminal_parse_failure("implements")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(IMPLEMENTS0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:IMPLEMENTS][start_index] = r0

    r0
  end

  module IMPORT0
  end

  def _nt_IMPORT
    start_index = index
    if node_cache[:IMPORT].has_key?(index)
      cached = node_cache[:IMPORT][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("import", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 6))
      @index += 6
    else
      terminal_parse_failure("import")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(IMPORT0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:IMPORT][start_index] = r0

    r0
  end

  module INSTANCEOF0
  end

  def _nt_INSTANCEOF
    start_index = index
    if node_cache[:INSTANCEOF].has_key?(index)
      cached = node_cache[:INSTANCEOF][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("instanceof", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 10))
      @index += 10
    else
      terminal_parse_failure("instanceof")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(INSTANCEOF0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:INSTANCEOF][start_index] = r0

    r0
  end

  module PACKAGE0
  end

  def _nt_PACKAGE
    start_index = index
    if node_cache[:PACKAGE].has_key?(index)
      cached = node_cache[:PACKAGE][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("package", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 7))
      @index += 7
    else
      terminal_parse_failure("package")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(PACKAGE0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:PACKAGE][start_index] = r0

    r0
  end

  module INTERFACE0
  end

  def _nt_INTERFACE
    start_index = index
    if node_cache[:INTERFACE].has_key?(index)
      cached = node_cache[:INTERFACE][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("interface", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 9))
      @index += 9
    else
      terminal_parse_failure("interface")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(INTERFACE0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:INTERFACE][start_index] = r0

    r0
  end

  module RETURN0
  end

  def _nt_RETURN
    start_index = index
    if node_cache[:RETURN].has_key?(index)
      cached = node_cache[:RETURN][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("return", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 6))
      @index += 6
    else
      terminal_parse_failure("return")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(RETURN0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:RETURN][start_index] = r0

    r0
  end

  module SYNCHRONIZED0
  end

  def _nt_SYNCHRONIZED
    start_index = index
    if node_cache[:SYNCHRONIZED].has_key?(index)
      cached = node_cache[:SYNCHRONIZED][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("synchronized", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 12))
      @index += 12
    else
      terminal_parse_failure("synchronized")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(SYNCHRONIZED0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:SYNCHRONIZED][start_index] = r0

    r0
  end

  module THROW0
  end

  def _nt_THROW
    start_index = index
    if node_cache[:THROW].has_key?(index)
      cached = node_cache[:THROW][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("throw", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 5))
      @index += 5
    else
      terminal_parse_failure("throw")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(THROW0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:THROW][start_index] = r0

    r0
  end

  module THROWS0
  end

  def _nt_THROWS
    start_index = index
    if node_cache[:THROWS].has_key?(index)
      cached = node_cache[:THROWS][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("throws", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 6))
      @index += 6
    else
      terminal_parse_failure("throws")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(THROWS0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:THROWS][start_index] = r0

    r0
  end

  module TRY0
  end

  def _nt_TRY
    start_index = index
    if node_cache[:TRY].has_key?(index)
      cached = node_cache[:TRY][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("try", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 3))
      @index += 3
    else
      terminal_parse_failure("try")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(TRY0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:TRY][start_index] = r0

    r0
  end

  module VOID0
  end

  def _nt_VOID
    start_index = index
    if node_cache[:VOID].has_key?(index)
      cached = node_cache[:VOID][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("void", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 4))
      @index += 4
    else
      terminal_parse_failure("void")
      r1 = nil
    end
    s0 << r1
    if r1
      i2 = index
      r3 = _nt_letterOrDigit
      if r3
        r2 = nil
      else
        @index = i2
        r2 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(VOID0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:VOID][start_index] = r0

    r0
  end

  module Modifier0
  end

  def _nt_modifier
    start_index = index
    if node_cache[:modifier].has_key?(index)
      cached = node_cache[:modifier][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    i1 = index
    if has_terminal?("public", false, index)
      r2 = instantiate_node(SyntaxNode,input, index...(index + 6))
      @index += 6
    else
      terminal_parse_failure("public")
      r2 = nil
    end
    if r2
      r1 = r2
    else
      if has_terminal?("protected", false, index)
        r3 = instantiate_node(SyntaxNode,input, index...(index + 9))
        @index += 9
      else
        terminal_parse_failure("protected")
        r3 = nil
      end
      if r3
        r1 = r3
      else
        if has_terminal?("private", false, index)
          r4 = instantiate_node(SyntaxNode,input, index...(index + 7))
          @index += 7
        else
          terminal_parse_failure("private")
          r4 = nil
        end
        if r4
          r1 = r4
        else
          if has_terminal?("static", false, index)
            r5 = instantiate_node(SyntaxNode,input, index...(index + 6))
            @index += 6
          else
            terminal_parse_failure("static")
            r5 = nil
          end
          if r5
            r1 = r5
          else
            if has_terminal?("abstract", false, index)
              r6 = instantiate_node(SyntaxNode,input, index...(index + 8))
              @index += 8
            else
              terminal_parse_failure("abstract")
              r6 = nil
            end
            if r6
              r1 = r6
            else
              if has_terminal?("final", false, index)
                r7 = instantiate_node(SyntaxNode,input, index...(index + 5))
                @index += 5
              else
                terminal_parse_failure("final")
                r7 = nil
              end
              if r7
                r1 = r7
              else
                if has_terminal?("native", false, index)
                  r8 = instantiate_node(SyntaxNode,input, index...(index + 6))
                  @index += 6
                else
                  terminal_parse_failure("native")
                  r8 = nil
                end
                if r8
                  r1 = r8
                else
                  if has_terminal?("synchronized", false, index)
                    r9 = instantiate_node(SyntaxNode,input, index...(index + 12))
                    @index += 12
                  else
                    terminal_parse_failure("synchronized")
                    r9 = nil
                  end
                  if r9
                    r1 = r9
                  else
                    if has_terminal?("transient", false, index)
                      r10 = instantiate_node(SyntaxNode,input, index...(index + 9))
                      @index += 9
                    else
                      terminal_parse_failure("transient")
                      r10 = nil
                    end
                    if r10
                      r1 = r10
                    else
                      if has_terminal?("volatile", false, index)
                        r11 = instantiate_node(SyntaxNode,input, index...(index + 8))
                        @index += 8
                      else
                        terminal_parse_failure("volatile")
                        r11 = nil
                      end
                      if r11
                        r1 = r11
                      else
                        if has_terminal?("strictfp", false, index)
                          r12 = instantiate_node(SyntaxNode,input, index...(index + 8))
                          @index += 8
                        else
                          terminal_parse_failure("strictfp")
                          r12 = nil
                        end
                        if r12
                          r1 = r12
                        else
                          @index = i1
                          r1 = nil
                        end
                      end
                    end
                  end
                end
              end
            end
          end
        end
      end
    end
    s0 << r1
    if r1
      i13 = index
      r14 = _nt_letterOrDigit
      if r14
        r13 = nil
      else
        @index = i13
        r13 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r13
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(Modifier0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:modifier][start_index] = r0

    r0
  end

  module QualifiedIdentifier0
    def identifier
      elements[1]
    end
  end

  module QualifiedIdentifier1
    def identifier
      elements[0]
    end

  end

  def _nt_qualifiedIdentifier
    start_index = index
    if node_cache[:qualifiedIdentifier].has_key?(index)
      cached = node_cache[:qualifiedIdentifier][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_identifier
    s0 << r1
    if r1
      s2, i2 = [], index
      loop do
        i3, s3 = index, []
        if has_terminal?(".", false, index)
          r4 = instantiate_node(SyntaxNode,input, index...(index + 1))
          @index += 1
        else
          terminal_parse_failure(".")
          r4 = nil
        end
        s3 << r4
        if r4
          r5 = _nt_identifier
          s3 << r5
        end
        if s3.last
          r3 = instantiate_node(SyntaxNode,input, i3...index, s3)
          r3.extend(QualifiedIdentifier0)
        else
          @index = i3
          r3 = nil
        end
        if r3
          s2 << r3
        else
          break
        end
      end
      r2 = instantiate_node(SyntaxNode,input, i2...index, s2)
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(JavaPackageIdentifier,input, i0...index, s0)
      r0.extend(QualifiedIdentifier1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:qualifiedIdentifier][start_index] = r0

    r0
  end

  module Identifier0
  end

  def _nt_identifier
    start_index = index
    if node_cache[:identifier].has_key?(index)
      cached = node_cache[:identifier][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    i1 = index
    r2 = _nt_keyword
    if r2
      r1 = nil
    else
      @index = i1
      r1 = instantiate_node(SyntaxNode,input, index...index)
    end
    s0 << r1
    if r1
      if has_terminal?('\G[a-zA-Z]', true, index)
        r3 = true
        @index += 1
      else
        r3 = nil
      end
      s0 << r3
      if r3
        s4, i4 = [], index
        loop do
          if has_terminal?('\G[a-zA-Z0-9_$]', true, index)
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
        r4 = instantiate_node(SyntaxNode,input, i4...index, s4)
        s0 << r4
      end
    end
    if s0.last
      r0 = instantiate_node(JavaIdentifier,input, i0...index, s0)
      r0.extend(Identifier0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:identifier][start_index] = r0

    r0
  end

  module Type0
    def dim
      elements[1]
    end
  end

  module Type1
  end

  def _nt_type
    start_index = index
    if node_cache[:type].has_key?(index)
      cached = node_cache[:type][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    i1 = index
    r2 = _nt_basicType
    if r2
      r1 = r2
    else
      r3 = _nt_qualifiedIdentifier
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
        i5, s5 = index, []
        s6, i6 = [], index
        loop do
          r7 = _nt_gap
          if r7
            s6 << r7
          else
            break
          end
        end
        r6 = instantiate_node(SyntaxNode,input, i6...index, s6)
        s5 << r6
        if r6
          r8 = _nt_dim
          s5 << r8
        end
        if s5.last
          r5 = instantiate_node(SyntaxNode,input, i5...index, s5)
          r5.extend(Type0)
        else
          @index = i5
          r5 = nil
        end
        if r5
          s4 << r5
        else
          break
        end
      end
      r4 = instantiate_node(SyntaxNode,input, i4...index, s4)
      s0 << r4
    end
    if s0.last
      r0 = instantiate_node(JavaType,input, i0...index, s0)
      r0.extend(Type1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:type][start_index] = r0

    r0
  end

  module BasicType0
  end

  def _nt_basicType
    start_index = index
    if node_cache[:basicType].has_key?(index)
      cached = node_cache[:basicType][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    i1 = index
    if has_terminal?("byte", false, index)
      r2 = instantiate_node(SyntaxNode,input, index...(index + 4))
      @index += 4
    else
      terminal_parse_failure("byte")
      r2 = nil
    end
    if r2
      r1 = r2
    else
      if has_terminal?("short", false, index)
        r3 = instantiate_node(SyntaxNode,input, index...(index + 5))
        @index += 5
      else
        terminal_parse_failure("short")
        r3 = nil
      end
      if r3
        r1 = r3
      else
        if has_terminal?("char", false, index)
          r4 = instantiate_node(SyntaxNode,input, index...(index + 4))
          @index += 4
        else
          terminal_parse_failure("char")
          r4 = nil
        end
        if r4
          r1 = r4
        else
          if has_terminal?("int", false, index)
            r5 = instantiate_node(SyntaxNode,input, index...(index + 3))
            @index += 3
          else
            terminal_parse_failure("int")
            r5 = nil
          end
          if r5
            r1 = r5
          else
            if has_terminal?("long", false, index)
              r6 = instantiate_node(SyntaxNode,input, index...(index + 4))
              @index += 4
            else
              terminal_parse_failure("long")
              r6 = nil
            end
            if r6
              r1 = r6
            else
              if has_terminal?("float", false, index)
                r7 = instantiate_node(SyntaxNode,input, index...(index + 5))
                @index += 5
              else
                terminal_parse_failure("float")
                r7 = nil
              end
              if r7
                r1 = r7
              else
                if has_terminal?("double", false, index)
                  r8 = instantiate_node(SyntaxNode,input, index...(index + 6))
                  @index += 6
                else
                  terminal_parse_failure("double")
                  r8 = nil
                end
                if r8
                  r1 = r8
                else
                  if has_terminal?("boolean", false, index)
                    r9 = instantiate_node(SyntaxNode,input, index...(index + 7))
                    @index += 7
                  else
                    terminal_parse_failure("boolean")
                    r9 = nil
                  end
                  if r9
                    r1 = r9
                  else
                    @index = i1
                    r1 = nil
                  end
                end
              end
            end
          end
        end
      end
    end
    s0 << r1
    if r1
      i10 = index
      r11 = _nt_letterOrDigit
      if r11
        r10 = nil
      else
        @index = i10
        r10 = instantiate_node(SyntaxNode,input, index...index)
      end
      s0 << r10
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(BasicType0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:basicType][start_index] = r0

    r0
  end

  module ClassType0
    def identifier
      elements[1]
    end
  end

  module ClassType1
    def identifier
      elements[0]
    end

  end

  def _nt_classType
    start_index = index
    if node_cache[:classType].has_key?(index)
      cached = node_cache[:classType][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_identifier
    s0 << r1
    if r1
      s2, i2 = [], index
      loop do
        i3, s3 = index, []
        if has_terminal?(".", false, index)
          r4 = instantiate_node(SyntaxNode,input, index...(index + 1))
          @index += 1
        else
          terminal_parse_failure(".")
          r4 = nil
        end
        s3 << r4
        if r4
          r5 = _nt_identifier
          s3 << r5
        end
        if s3.last
          r3 = instantiate_node(SyntaxNode,input, i3...index, s3)
          r3.extend(ClassType0)
        else
          @index = i3
          r3 = nil
        end
        if r3
          s2 << r3
        else
          break
        end
      end
      r2 = instantiate_node(SyntaxNode,input, i2...index, s2)
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(ClassType1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:classType][start_index] = r0

    r0
  end

  module ClassTypeList0
    def qualifiedIdentifier
      elements[3]
    end
  end

  module ClassTypeList1
    def qualifiedIdentifier
      elements[0]
    end

  end

  def _nt_classTypeList
    start_index = index
    if node_cache[:classTypeList].has_key?(index)
      cached = node_cache[:classTypeList][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_qualifiedIdentifier
    s0 << r1
    if r1
      s2, i2 = [], index
      loop do
        i3, s3 = index, []
        s4, i4 = [], index
        loop do
          r5 = _nt_gap
          if r5
            s4 << r5
          else
            break
          end
        end
        r4 = instantiate_node(SyntaxNode,input, i4...index, s4)
        s3 << r4
        if r4
          if has_terminal?(",", false, index)
            r6 = instantiate_node(SyntaxNode,input, index...(index + 1))
            @index += 1
          else
            terminal_parse_failure(",")
            r6 = nil
          end
          s3 << r6
          if r6
            s7, i7 = [], index
            loop do
              r8 = _nt_gap
              if r8
                s7 << r8
              else
                break
              end
            end
            r7 = instantiate_node(SyntaxNode,input, i7...index, s7)
            s3 << r7
            if r7
              r9 = _nt_qualifiedIdentifier
              s3 << r9
            end
          end
        end
        if s3.last
          r3 = instantiate_node(SyntaxNode,input, i3...index, s3)
          r3.extend(ClassTypeList0)
        else
          @index = i3
          r3 = nil
        end
        if r3
          s2 << r3
        else
          break
        end
      end
      r2 = instantiate_node(SyntaxNode,input, i2...index, s2)
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(ClassTypeList1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:classTypeList][start_index] = r0

    r0
  end

  module Dim0
  end

  def _nt_dim
    start_index = index
    if node_cache[:dim].has_key?(index)
      cached = node_cache[:dim][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("[", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      terminal_parse_failure("[")
      r1 = nil
    end
    s0 << r1
    if r1
      s2, i2 = [], index
      loop do
        r3 = _nt_gap
        if r3
          s2 << r3
        else
          break
        end
      end
      r2 = instantiate_node(SyntaxNode,input, i2...index, s2)
      s0 << r2
      if r2
        if has_terminal?("]", false, index)
          r4 = instantiate_node(SyntaxNode,input, index...(index + 1))
          @index += 1
        else
          terminal_parse_failure("]")
          r4 = nil
        end
        s0 << r4
      end
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(Dim0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:dim][start_index] = r0

    r0
  end

  module PackageDeclaration0
    def PACKAGE
      elements[0]
    end

    def package_name
      elements[2]
    end

  end

  def _nt_packageDeclaration
    start_index = index
    if node_cache[:packageDeclaration].has_key?(index)
      cached = node_cache[:packageDeclaration][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_PACKAGE
    s0 << r1
    if r1
      s2, i2 = [], index
      loop do
        r3 = _nt_gap
        if r3
          s2 << r3
        else
          break
        end
      end
      if s2.empty?
        @index = i2
        r2 = nil
      else
        r2 = instantiate_node(SyntaxNode,input, i2...index, s2)
      end
      s0 << r2
      if r2
        r4 = _nt_qualifiedIdentifier
        s0 << r4
        if r4
          s5, i5 = [], index
          loop do
            r6 = _nt_gap
            if r6
              s5 << r6
            else
              break
            end
          end
          r5 = instantiate_node(SyntaxNode,input, i5...index, s5)
          s0 << r5
          if r5
            if has_terminal?(";", false, index)
              r7 = instantiate_node(SyntaxNode,input, index...(index + 1))
              @index += 1
            else
              terminal_parse_failure(";")
              r7 = nil
            end
            s0 << r7
            if r7
              s8, i8 = [], index
              loop do
                r9 = _nt_gap
                if r9
                  s8 << r9
                else
                  break
                end
              end
              r8 = instantiate_node(SyntaxNode,input, i8...index, s8)
              s0 << r8
            end
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaPackage,input, i0...index, s0)
      r0.extend(PackageDeclaration0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:packageDeclaration][start_index] = r0

    r0
  end

  module ImportDeclaration0
  end

  module ImportDeclaration1
    def IMPORT
      elements[0]
    end

    def path
      elements[3]
    end

    def all_classes
      elements[4]
    end

  end

  def _nt_importDeclaration
    start_index = index
    if node_cache[:importDeclaration].has_key?(index)
      cached = node_cache[:importDeclaration][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_IMPORT
    s0 << r1
    if r1
      s2, i2 = [], index
      loop do
        r3 = _nt_gap
        if r3
          s2 << r3
        else
          break
        end
      end
      if s2.empty?
        @index = i2
        r2 = nil
      else
        r2 = instantiate_node(SyntaxNode,input, i2...index, s2)
      end
      s0 << r2
      if r2
        i5, s5 = index, []
        if has_terminal?("static", false, index)
          r6 = instantiate_node(SyntaxNode,input, index...(index + 6))
          @index += 6
        else
          terminal_parse_failure("static")
          r6 = nil
        end
        s5 << r6
        if r6
          s7, i7 = [], index
          loop do
            r8 = _nt_gap
            if r8
              s7 << r8
            else
              break
            end
          end
          if s7.empty?
            @index = i7
            r7 = nil
          else
            r7 = instantiate_node(SyntaxNode,input, i7...index, s7)
          end
          s5 << r7
        end
        if s5.last
          r5 = instantiate_node(SyntaxNode,input, i5...index, s5)
          r5.extend(ImportDeclaration0)
        else
          @index = i5
          r5 = nil
        end
        if r5
          r4 = r5
        else
          r4 = instantiate_node(SyntaxNode,input, index...index)
        end
        s0 << r4
        if r4
          r9 = _nt_qualifiedIdentifier
          s0 << r9
          if r9
            if has_terminal?(".*", false, index)
              r11 = instantiate_node(SyntaxNode,input, index...(index + 2))
              @index += 2
            else
              terminal_parse_failure(".*")
              r11 = nil
            end
            if r11
              r10 = r11
            else
              r10 = instantiate_node(SyntaxNode,input, index...index)
            end
            s0 << r10
            if r10
              s12, i12 = [], index
              loop do
                r13 = _nt_gap
                if r13
                  s12 << r13
                else
                  break
                end
              end
              r12 = instantiate_node(SyntaxNode,input, i12...index, s12)
              s0 << r12
              if r12
                if has_terminal?(";", false, index)
                  r14 = instantiate_node(SyntaxNode,input, index...(index + 1))
                  @index += 1
                else
                  terminal_parse_failure(";")
                  r14 = nil
                end
                s0 << r14
              end
            end
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaImport,input, i0...index, s0)
      r0.extend(ImportDeclaration1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:importDeclaration][start_index] = r0

    r0
  end

  module Comma0
  end

  def _nt_comma
    start_index = index
    if node_cache[:comma].has_key?(index)
      cached = node_cache[:comma][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    s1, i1 = [], index
    loop do
      r2 = _nt_gap
      if r2
        s1 << r2
      else
        break
      end
    end
    r1 = instantiate_node(SyntaxNode,input, i1...index, s1)
    s0 << r1
    if r1
      if has_terminal?(",", false, index)
        r3 = instantiate_node(SyntaxNode,input, index...(index + 1))
        @index += 1
      else
        terminal_parse_failure(",")
        r3 = nil
      end
      s0 << r3
      if r3
        s4, i4 = [], index
        loop do
          r5 = _nt_gap
          if r5
            s4 << r5
          else
            break
          end
        end
        r4 = instantiate_node(SyntaxNode,input, i4...index, s4)
        s0 << r4
      end
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(Comma0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:comma][start_index] = r0

    r0
  end

  module Comment0
  end

  module Comment1
  end

  module Comment2
  end

  module Comment3
  end

  def _nt_comment
    start_index = index
    if node_cache[:comment].has_key?(index)
      cached = node_cache[:comment][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    i1, s1 = index, []
    if has_terminal?("/*", false, index)
      r2 = instantiate_node(SyntaxNode,input, index...(index + 2))
      @index += 2
    else
      terminal_parse_failure("/*")
      r2 = nil
    end
    s1 << r2
    if r2
      s3, i3 = [], index
      loop do
        i4, s4 = index, []
        i5 = index
        if has_terminal?('*/', false, index)
          r6 = instantiate_node(SyntaxNode,input, index...(index + 2))
          @index += 2
        else
          terminal_parse_failure('*/')
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
          r4.extend(Comment0)
        else
          @index = i4
          r4 = nil
        end
        if r4
          s3 << r4
        else
          break
        end
      end
      r3 = instantiate_node(SyntaxNode,input, i3...index, s3)
      s1 << r3
      if r3
        if has_terminal?("*/", false, index)
          r8 = instantiate_node(SyntaxNode,input, index...(index + 2))
          @index += 2
        else
          terminal_parse_failure("*/")
          r8 = nil
        end
        s1 << r8
      end
    end
    if s1.last
      r1 = instantiate_node(JavaComment,input, i1...index, s1)
      r1.extend(Comment1)
    else
      @index = i1
      r1 = nil
    end
    if r1
      r0 = r1
    else
      i9, s9 = index, []
      if has_terminal?("//", false, index)
        r10 = instantiate_node(SyntaxNode,input, index...(index + 2))
        @index += 2
      else
        terminal_parse_failure("//")
        r10 = nil
      end
      s9 << r10
      if r10
        s11, i11 = [], index
        loop do
          i12, s12 = index, []
          i13 = index
          if has_terminal?('\G[\\r\\n]', true, index)
            r14 = true
            @index += 1
          else
            r14 = nil
          end
          if r14
            r13 = nil
          else
            @index = i13
            r13 = instantiate_node(SyntaxNode,input, index...index)
          end
          s12 << r13
          if r13
            if index < input_length
              r15 = instantiate_node(SyntaxNode,input, index...(index + 1))
              @index += 1
            else
              terminal_parse_failure("any character")
              r15 = nil
            end
            s12 << r15
          end
          if s12.last
            r12 = instantiate_node(SyntaxNode,input, i12...index, s12)
            r12.extend(Comment2)
          else
            @index = i12
            r12 = nil
          end
          if r12
            s11 << r12
          else
            break
          end
        end
        r11 = instantiate_node(SyntaxNode,input, i11...index, s11)
        s9 << r11
        if r11
          if has_terminal?('\G[\\r\\n]', true, index)
            r16 = true
            @index += 1
          else
            r16 = nil
          end
          s9 << r16
        end
      end
      if s9.last
        r9 = instantiate_node(JavaComment,input, i9...index, s9)
        r9.extend(Comment3)
      else
        @index = i9
        r9 = nil
      end
      if r9
        r0 = r9
      else
        @index = i0
        r0 = nil
      end
    end

    node_cache[:comment][start_index] = r0

    r0
  end

  def _nt_gap
    start_index = index
    if node_cache[:gap].has_key?(index)
      cached = node_cache[:gap][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    if has_terminal?('\G[ \\t\\r\\n]', true, index)
      r1 = true
      @index += 1
    else
      r1 = nil
    end
    if r1
      r0 = r1
    else
      r2 = _nt_comment
      if r2
        r0 = r2
      else
        @index = i0
        r0 = nil
      end
    end

    node_cache[:gap][start_index] = r0

    r0
  end

end

class JavaCommonParser < Treetop::Runtime::CompiledParser
  include JavaCommon
end


# Auto-generated from a Treetop grammar. Edits may be lost.


module JavaMethod
  include Treetop::Runtime

  def root
    @root ||= :constructorDeclaration
  end

  include JavaCommon

  module ConstructorDeclaration0
    def modifier
      elements[0]
    end

  end

  module ConstructorDeclaration1
    def formalPparameters
      elements[0]
    end

  end

  module ConstructorDeclaration2
    def throws
      elements[1]
    end
  end

  module ConstructorDeclaration3
    def access_modifiers
      elements[0]
    end

    def method_name
      elements[1]
    end

  end

  def _nt_constructorDeclaration
    start_index = index
    if node_cache[:constructorDeclaration].has_key?(index)
      cached = node_cache[:constructorDeclaration][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    i2, s2 = index, []
    r3 = _nt_modifier
    s2 << r3
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
      if s4.empty?
        @index = i4
        r4 = nil
      else
        r4 = instantiate_node(SyntaxNode,input, i4...index, s4)
      end
      s2 << r4
    end
    if s2.last
      r2 = instantiate_node(SyntaxNode,input, i2...index, s2)
      r2.extend(ConstructorDeclaration0)
    else
      @index = i2
      r2 = nil
    end
    if r2
      r1 = r2
    else
      r1 = instantiate_node(SyntaxNode,input, index...index)
    end
    s0 << r1
    if r1
      r6 = _nt_identifier
      s0 << r6
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
        s0 << r7
        if r7
          if has_terminal?("(", false, index)
            r9 = instantiate_node(SyntaxNode,input, index...(index + 1))
            @index += 1
          else
            terminal_parse_failure("(")
            r9 = nil
          end
          s0 << r9
          if r9
            s10, i10 = [], index
            loop do
              r11 = _nt_gap
              if r11
                s10 << r11
              else
                break
              end
            end
            r10 = instantiate_node(SyntaxNode,input, i10...index, s10)
            s0 << r10
            if r10
              i13, s13 = index, []
              r14 = _nt_formalPparameters
              s13 << r14
              if r14
                s15, i15 = [], index
                loop do
                  r16 = _nt_gap
                  if r16
                    s15 << r16
                  else
                    break
                  end
                end
                r15 = instantiate_node(SyntaxNode,input, i15...index, s15)
                s13 << r15
              end
              if s13.last
                r13 = instantiate_node(SyntaxNode,input, i13...index, s13)
                r13.extend(ConstructorDeclaration1)
              else
                @index = i13
                r13 = nil
              end
              if r13
                r12 = r13
              else
                r12 = instantiate_node(SyntaxNode,input, index...index)
              end
              s0 << r12
              if r12
                if has_terminal?(")", false, index)
                  r17 = instantiate_node(SyntaxNode,input, index...(index + 1))
                  @index += 1
                else
                  terminal_parse_failure(")")
                  r17 = nil
                end
                s0 << r17
                if r17
                  i19, s19 = index, []
                  s20, i20 = [], index
                  loop do
                    r21 = _nt_gap
                    if r21
                      s20 << r21
                    else
                      break
                    end
                  end
                  r20 = instantiate_node(SyntaxNode,input, i20...index, s20)
                  s19 << r20
                  if r20
                    r22 = _nt_throws
                    s19 << r22
                  end
                  if s19.last
                    r19 = instantiate_node(SyntaxNode,input, i19...index, s19)
                    r19.extend(ConstructorDeclaration2)
                  else
                    @index = i19
                    r19 = nil
                  end
                  if r19
                    r18 = r19
                  else
                    r18 = instantiate_node(SyntaxNode,input, index...index)
                  end
                  s0 << r18
                end
              end
            end
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaMethodDeclaration,input, i0...index, s0)
      r0.extend(ConstructorDeclaration3)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:constructorDeclaration][start_index] = r0

    r0
  end

  module MethodDeclaration0
    def modifier
      elements[0]
    end

  end

  module MethodDeclaration1
    def formalPparameters
      elements[0]
    end

  end

  module MethodDeclaration2
    def throws
      elements[1]
    end
  end

  module MethodDeclaration3
    def access_modifiers
      elements[0]
    end

    def return_type
      elements[1]
    end

    def method_name
      elements[3]
    end

  end

  def _nt_methodDeclaration
    start_index = index
    if node_cache[:methodDeclaration].has_key?(index)
      cached = node_cache[:methodDeclaration][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    s1, i1 = [], index
    loop do
      i2, s2 = index, []
      r3 = _nt_modifier
      s2 << r3
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
        if s4.empty?
          @index = i4
          r4 = nil
        else
          r4 = instantiate_node(SyntaxNode,input, i4...index, s4)
        end
        s2 << r4
      end
      if s2.last
        r2 = instantiate_node(SyntaxNode,input, i2...index, s2)
        r2.extend(MethodDeclaration0)
      else
        @index = i2
        r2 = nil
      end
      if r2
        s1 << r2
      else
        break
      end
    end
    r1 = instantiate_node(SyntaxNode,input, i1...index, s1)
    s0 << r1
    if r1
      i6 = index
      r7 = _nt_type
      if r7
        r6 = r7
      else
        r8 = _nt_VOID
        if r8
          r6 = r8
        else
          @index = i6
          r6 = nil
        end
      end
      s0 << r6
      if r6
        s9, i9 = [], index
        loop do
          r10 = _nt_gap
          if r10
            s9 << r10
          else
            break
          end
        end
        if s9.empty?
          @index = i9
          r9 = nil
        else
          r9 = instantiate_node(SyntaxNode,input, i9...index, s9)
        end
        s0 << r9
        if r9
          r11 = _nt_identifier
          s0 << r11
          if r11
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
              if has_terminal?("(", false, index)
                r14 = instantiate_node(SyntaxNode,input, index...(index + 1))
                @index += 1
              else
                terminal_parse_failure("(")
                r14 = nil
              end
              s0 << r14
              if r14
                s15, i15 = [], index
                loop do
                  r16 = _nt_gap
                  if r16
                    s15 << r16
                  else
                    break
                  end
                end
                r15 = instantiate_node(SyntaxNode,input, i15...index, s15)
                s0 << r15
                if r15
                  i18, s18 = index, []
                  r19 = _nt_formalPparameters
                  s18 << r19
                  if r19
                    s20, i20 = [], index
                    loop do
                      r21 = _nt_gap
                      if r21
                        s20 << r21
                      else
                        break
                      end
                    end
                    r20 = instantiate_node(SyntaxNode,input, i20...index, s20)
                    s18 << r20
                  end
                  if s18.last
                    r18 = instantiate_node(SyntaxNode,input, i18...index, s18)
                    r18.extend(MethodDeclaration1)
                  else
                    @index = i18
                    r18 = nil
                  end
                  if r18
                    r17 = r18
                  else
                    r17 = instantiate_node(SyntaxNode,input, index...index)
                  end
                  s0 << r17
                  if r17
                    if has_terminal?(")", false, index)
                      r22 = instantiate_node(SyntaxNode,input, index...(index + 1))
                      @index += 1
                    else
                      terminal_parse_failure(")")
                      r22 = nil
                    end
                    s0 << r22
                    if r22
                      i24, s24 = index, []
                      s25, i25 = [], index
                      loop do
                        r26 = _nt_gap
                        if r26
                          s25 << r26
                        else
                          break
                        end
                      end
                      r25 = instantiate_node(SyntaxNode,input, i25...index, s25)
                      s24 << r25
                      if r25
                        r27 = _nt_throws
                        s24 << r27
                      end
                      if s24.last
                        r24 = instantiate_node(SyntaxNode,input, i24...index, s24)
                        r24.extend(MethodDeclaration2)
                      else
                        @index = i24
                        r24 = nil
                      end
                      if r24
                        r23 = r24
                      else
                        r23 = instantiate_node(SyntaxNode,input, index...index)
                      end
                      s0 << r23
                    end
                  end
                end
              end
            end
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaMethodDeclaration,input, i0...index, s0)
      r0.extend(MethodDeclaration3)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:methodDeclaration][start_index] = r0

    r0
  end

  module Throws0
    def comma
      elements[0]
    end

    def qualifiedIdentifier
      elements[1]
    end
  end

  module Throws1
    def THROWS
      elements[0]
    end

    def qualifiedIdentifier
      elements[2]
    end

  end

  def _nt_throws
    start_index = index
    if node_cache[:throws].has_key?(index)
      cached = node_cache[:throws][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_THROWS
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
        r4 = _nt_qualifiedIdentifier
        s0 << r4
        if r4
          s5, i5 = [], index
          loop do
            i6, s6 = index, []
            r7 = _nt_comma
            s6 << r7
            if r7
              r8 = _nt_qualifiedIdentifier
              s6 << r8
            end
            if s6.last
              r6 = instantiate_node(SyntaxNode,input, i6...index, s6)
              r6.extend(Throws0)
            else
              @index = i6
              r6 = nil
            end
            if r6
              s5 << r6
            else
              break
            end
          end
          r5 = instantiate_node(SyntaxNode,input, i5...index, s5)
          s0 << r5
        end
      end
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(Throws1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:throws][start_index] = r0

    r0
  end

  module FormalPparameters0
    def comma
      elements[0]
    end

    def formalParameter
      elements[1]
    end
  end

  module FormalPparameters1
    def formalParameter
      elements[0]
    end

  end

  def _nt_formalPparameters
    start_index = index
    if node_cache[:formalPparameters].has_key?(index)
      cached = node_cache[:formalPparameters][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_formalParameter
    s0 << r1
    if r1
      s2, i2 = [], index
      loop do
        i3, s3 = index, []
        r4 = _nt_comma
        s3 << r4
        if r4
          r5 = _nt_formalParameter
          s3 << r5
        end
        if s3.last
          r3 = instantiate_node(SyntaxNode,input, i3...index, s3)
          r3.extend(FormalPparameters0)
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
      r0 = instantiate_node(JavaGroup,input, i0...index, s0)
      r0.extend(FormalPparameters1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:formalPparameters][start_index] = r0

    r0
  end

  module FormalParameter0
    def access_modifier
      elements[0]
    end

    def parameter_type
      elements[2]
    end

    def parameter_name
      elements[4]
    end

  end

  def _nt_formalParameter
    start_index = index
    if node_cache[:formalParameter].has_key?(index)
      cached = node_cache[:formalParameter][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r2 = _nt_FINAL
    if r2
      r1 = r2
    else
      r1 = instantiate_node(SyntaxNode,input, index...index)
    end
    s0 << r1
    if r1
      s3, i3 = [], index
      loop do
        r4 = _nt_gap
        if r4
          s3 << r4
        else
          break
        end
      end
      r3 = instantiate_node(SyntaxNode,input, i3...index, s3)
      s0 << r3
      if r3
        r5 = _nt_type
        s0 << r5
        if r5
          s6, i6 = [], index
          loop do
            r7 = _nt_gap
            if r7
              s6 << r7
            else
              break
            end
          end
          if s6.empty?
            @index = i6
            r6 = nil
          else
            r6 = instantiate_node(SyntaxNode,input, i6...index, s6)
          end
          s0 << r6
          if r6
            r8 = _nt_identifier
            s0 << r8
            if r8
              s9, i9 = [], index
              loop do
                r10 = _nt_gap
                if r10
                  s9 << r10
                else
                  break
                end
              end
              r9 = instantiate_node(SyntaxNode,input, i9...index, s9)
              s0 << r9
              if r9
                s11, i11 = [], index
                loop do
                  r12 = _nt_dim
                  if r12
                    s11 << r12
                  else
                    break
                  end
                end
                r11 = instantiate_node(SyntaxNode,input, i11...index, s11)
                s0 << r11
              end
            end
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaMethodParameter,input, i0...index, s0)
      r0.extend(FormalParameter0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:formalParameter][start_index] = r0

    r0
  end

end

class JavaMethodParser < Treetop::Runtime::CompiledParser
  include JavaMethod
end


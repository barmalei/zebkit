# Auto-generated from a Treetop grammar. Edits may be lost.


module JavaExpression
  include Treetop::Runtime

  def root
    @root ||= :code
  end

  include JavaCommon

  include JavaLiteral

  include JavaMethod

  module Code0
    def import
      elements[0]
    end

  end

  module Code1
    def package
      elements[1]
    end

    def body
      elements[4]
    end
  end

  def _nt_code
    start_index = index
    if node_cache[:code].has_key?(index)
      cached = node_cache[:code][index]
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
      r3 = _nt_package
      s0 << r3
      if r3
        s4, i4 = [], index
        loop do
          i5, s5 = index, []
          r6 = _nt_import
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
            r7 = instantiate_node(SyntaxNode,input, i7...index, s7)
            s5 << r7
          end
          if s5.last
            r5 = instantiate_node(SyntaxNode,input, i5...index, s5)
            r5.extend(Code0)
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
        if r4
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
            r11 = _nt_codeBodyList
            s0 << r11
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaSourceCode,input, i0...index, s0)
      r0.extend(Code1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:code][start_index] = r0

    r0
  end

  module CodeBodyList0
    def codeBody
      elements[0]
    end

  end

  module CodeBodyList1
    def codeBody
      elements[0]
    end

  end

  def _nt_codeBodyList
    start_index = index
    if node_cache[:codeBodyList].has_key?(index)
      cached = node_cache[:codeBodyList][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_codeBody
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
        s4, i4 = [], index
        loop do
          i5, s5 = index, []
          r6 = _nt_codeBody
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
            r7 = instantiate_node(SyntaxNode,input, i7...index, s7)
            s5 << r7
          end
          if s5.last
            r5 = instantiate_node(SyntaxNode,input, i5...index, s5)
            r5.extend(CodeBodyList0)
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
    end
    if s0.last
      r0 = instantiate_node(JavaGroup,input, i0...index, s0)
      r0.extend(CodeBodyList1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:codeBodyList][start_index] = r0

    r0
  end

  def _nt_codeBody
    start_index = index
    if node_cache[:codeBody].has_key?(index)
      cached = node_cache[:codeBody][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    r1 = _nt_class
    if r1
      r0 = r1
    else
      r2 = _nt_interface
      if r2
        r0 = r2
      else
        @index = i0
        r0 = nil
      end
    end

    node_cache[:codeBody][start_index] = r0

    r0
  end

  module Expression0
    def type
      elements[2]
    end

  end

  module Expression1
    def arg1
      elements[0]
    end

    def INSTANCEOF
      elements[2]
    end

    def arg2
      elements[4]
    end
  end

  module Expression2
    def exprOperator
      elements[1]
    end

    def expression
      elements[3]
    end
  end

  module Expression3
    def unaryOperator
      elements[0]
    end

  end

  module Expression4
    def conditionalExpression
      elements[1]
    end
  end

  module Expression5
  end

  def _nt_expression
    start_index = index
    if node_cache[:expression].has_key?(index)
      cached = node_cache[:expression][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    i2, s2 = index, []
    if has_terminal?("(", false, index)
      r3 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      terminal_parse_failure("(")
      r3 = nil
    end
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
      r4 = instantiate_node(SyntaxNode,input, i4...index, s4)
      s2 << r4
      if r4
        r6 = _nt_type
        s2 << r6
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
          s2 << r7
          if r7
            if has_terminal?(")", false, index)
              r9 = instantiate_node(SyntaxNode,input, index...(index + 1))
              @index += 1
            else
              terminal_parse_failure(")")
              r9 = nil
            end
            s2 << r9
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
              s2 << r10
            end
          end
        end
      end
    end
    if s2.last
      r2 = instantiate_node(SyntaxNode,input, i2...index, s2)
      r2.extend(Expression0)
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
      i12 = index
      i13, s13 = index, []
      r14 = _nt_unaryOperator
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
        if s15.empty?
          @index = i15
          r15 = nil
        else
          r15 = instantiate_node(SyntaxNode,input, i15...index, s15)
        end
        s13 << r15
        if r15
          r17 = _nt_INSTANCEOF
          s13 << r17
          if r17
            s18, i18 = [], index
            loop do
              r19 = _nt_gap
              if r19
                s18 << r19
              else
                break
              end
            end
            if s18.empty?
              @index = i18
              r18 = nil
            else
              r18 = instantiate_node(SyntaxNode,input, i18...index, s18)
            end
            s13 << r18
            if r18
              r20 = _nt_expression
              s13 << r20
            end
          end
        end
      end
      if s13.last
        r13 = instantiate_node(JavaInstanceof,input, i13...index, s13)
        r13.extend(Expression1)
      else
        @index = i13
        r13 = nil
      end
      if r13
        r12 = r13
      else
        i21, s21 = index, []
        r22 = _nt_unaryOperator
        s21 << r22
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
            r27 = _nt_exprOperator
            s24 << r27
            if r27
              s28, i28 = [], index
              loop do
                r29 = _nt_gap
                if r29
                  s28 << r29
                else
                  break
                end
              end
              r28 = instantiate_node(SyntaxNode,input, i28...index, s28)
              s24 << r28
              if r28
                r30 = _nt_expression
                s24 << r30
              end
            end
          end
          if s24.last
            r24 = instantiate_node(SyntaxNode,input, i24...index, s24)
            r24.extend(Expression2)
          else
            @index = i24
            r24 = nil
          end
          if r24
            r23 = r24
          else
            r23 = instantiate_node(SyntaxNode,input, index...index)
          end
          s21 << r23
        end
        if s21.last
          r21 = instantiate_node(SyntaxNode,input, i21...index, s21)
          r21.extend(Expression3)
        else
          @index = i21
          r21 = nil
        end
        if r21
          r12 = r21
        else
          @index = i12
          r12 = nil
        end
      end
      s0 << r12
      if r12
        i32, s32 = index, []
        s33, i33 = [], index
        loop do
          r34 = _nt_gap
          if r34
            s33 << r34
          else
            break
          end
        end
        r33 = instantiate_node(SyntaxNode,input, i33...index, s33)
        s32 << r33
        if r33
          r35 = _nt_conditionalExpression
          s32 << r35
        end
        if s32.last
          r32 = instantiate_node(SyntaxNode,input, i32...index, s32)
          r32.extend(Expression4)
        else
          @index = i32
          r32 = nil
        end
        if r32
          r31 = r32
        else
          r31 = instantiate_node(SyntaxNode,input, index...index)
        end
        s0 << r31
      end
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(Expression5)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:expression][start_index] = r0

    r0
  end

  def _nt_exprOperator
    start_index = index
    if node_cache[:exprOperator].has_key?(index)
      cached = node_cache[:exprOperator][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    r1 = _nt_binomialOperation
    if r1
      r0 = r1
    else
      r2 = _nt_assignmentOperation
      if r2
        r0 = r2
      else
        @index = i0
        r0 = nil
      end
    end

    node_cache[:exprOperator][start_index] = r0

    r0
  end

  module ConditionalExpression0
    def expression1
      elements[2]
    end

    def expression2
      elements[6]
    end
  end

  def _nt_conditionalExpression
    start_index = index
    if node_cache[:conditionalExpression].has_key?(index)
      cached = node_cache[:conditionalExpression][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("?", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      terminal_parse_failure("?")
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
        r4 = _nt_expression
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
            if has_terminal?(":", false, index)
              r7 = instantiate_node(SyntaxNode,input, index...(index + 1))
              @index += 1
            else
              terminal_parse_failure(":")
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
              if r8
                r10 = _nt_expression
                s0 << r10
              end
            end
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaConditionalExpression,input, i0...index, s0)
      r0.extend(ConditionalExpression0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:conditionalExpression][start_index] = r0

    r0
  end

  module UnaryOperator0
    def prefixOp
      elements[0]
    end

  end

  module UnaryOperator1
    def NEW
      elements[0]
    end

    def name
      elements[2]
    end

    def arguments
      elements[6]
    end

    def body
      elements[10]
    end

  end

  module UnaryOperator2
    def memberArrayCreator
      elements[0]
    end

  end

  module UnaryOperator3
    def postFixOp
      elements[1]
    end
  end

  module UnaryOperator4
  end

  def _nt_unaryOperator
    start_index = index
    if node_cache[:unaryOperator].has_key?(index)
      cached = node_cache[:unaryOperator][index]
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
      r3 = _nt_prefixOp
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
        r4 = instantiate_node(SyntaxNode,input, i4...index, s4)
        s2 << r4
      end
      if s2.last
        r2 = instantiate_node(SyntaxNode,input, i2...index, s2)
        r2.extend(UnaryOperator0)
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
      i7, s7 = index, []
      r8 = _nt_NEW
      s7 << r8
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
        if s9.empty?
          @index = i9
          r9 = nil
        else
          r9 = instantiate_node(SyntaxNode,input, i9...index, s9)
        end
        s7 << r9
        if r9
          r11 = _nt_qualifiedIdentifier
          s7 << r11
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
            s7 << r12
            if r12
              if has_terminal?("(", false, index)
                r14 = instantiate_node(SyntaxNode,input, index...(index + 1))
                @index += 1
              else
                terminal_parse_failure("(")
                r14 = nil
              end
              s7 << r14
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
                s7 << r15
                if r15
                  r18 = _nt_exprList
                  if r18
                    r17 = r18
                  else
                    r17 = instantiate_node(SyntaxNode,input, index...index)
                  end
                  s7 << r17
                  if r17
                    s19, i19 = [], index
                    loop do
                      r20 = _nt_gap
                      if r20
                        s19 << r20
                      else
                        break
                      end
                    end
                    r19 = instantiate_node(SyntaxNode,input, i19...index, s19)
                    s7 << r19
                    if r19
                      if has_terminal?(")", false, index)
                        r21 = instantiate_node(SyntaxNode,input, index...(index + 1))
                        @index += 1
                      else
                        terminal_parse_failure(")")
                        r21 = nil
                      end
                      s7 << r21
                      if r21
                        s22, i22 = [], index
                        loop do
                          r23 = _nt_gap
                          if r23
                            s22 << r23
                          else
                            break
                          end
                        end
                        r22 = instantiate_node(SyntaxNode,input, i22...index, s22)
                        s7 << r22
                        if r22
                          r25 = _nt_classBody
                          if r25
                            r24 = r25
                          else
                            r24 = instantiate_node(SyntaxNode,input, index...index)
                          end
                          s7 << r24
                          if r24
                            if has_terminal?('', false, index)
                              r26 = instantiate_node(SyntaxNode,input, index...(index + 0))
                              @index += 0
                            else
                              terminal_parse_failure('')
                              r26 = nil
                            end
                            s7 << r26
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
      if s7.last
        r7 = instantiate_node(JavaClassInstantiation,input, i7...index, s7)
        r7.extend(UnaryOperator1)
      else
        @index = i7
        r7 = nil
      end
      if r7
        r6 = r7
      else
        i27, s27 = index, []
        r28 = _nt_memberArrayCreator
        s27 << r28
        if r28
          if has_terminal?('', false, index)
            r29 = instantiate_node(SyntaxNode,input, index...(index + 0))
            @index += 0
          else
            terminal_parse_failure('')
            r29 = nil
          end
          s27 << r29
        end
        if s27.last
          r27 = instantiate_node(JavaExpressionMember,input, i27...index, s27)
          r27.extend(UnaryOperator2)
        else
          @index = i27
          r27 = nil
        end
        if r27
          r6 = r27
        else
          r30 = _nt_field
          if r30
            r6 = r30
          else
            @index = i6
            r6 = nil
          end
        end
      end
      s0 << r6
      if r6
        i32, s32 = index, []
        s33, i33 = [], index
        loop do
          r34 = _nt_gap
          if r34
            s33 << r34
          else
            break
          end
        end
        r33 = instantiate_node(SyntaxNode,input, i33...index, s33)
        s32 << r33
        if r33
          r35 = _nt_postFixOp
          s32 << r35
        end
        if s32.last
          r32 = instantiate_node(SyntaxNode,input, i32...index, s32)
          r32.extend(UnaryOperator3)
        else
          @index = i32
          r32 = nil
        end
        if r32
          r31 = r32
        else
          r31 = instantiate_node(SyntaxNode,input, index...index)
        end
        s0 << r31
      end
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(UnaryOperator4)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:unaryOperator][start_index] = r0

    r0
  end

  module Field0
    def dimExpr
      elements[1]
    end
  end

  module Field1
  end

  def _nt_field
    start_index = index
    if node_cache[:field].has_key?(index)
      cached = node_cache[:field][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    i1 = index
    r2 = _nt_groupExpressionMembers
    if r2
      r1 = r2
    else
      r3 = _nt_literal
      if r3
        r1 = r3
      else
        r4 = _nt_thisMethodCall
        if r4
          r1 = r4
        else
          r5 = _nt_superConstructorCall
          if r5
            r1 = r5
          else
            r6 = _nt_superMethodCall
            if r6
              r1 = r6
            else
              r7 = _nt_methodCall
              if r7
                r1 = r7
              else
                r8 = _nt_classReference
                if r8
                  r1 = r8
                else
                  r9 = _nt_bodyIdenfifier
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
      s10, i10 = [], index
      loop do
        i11, s11 = index, []
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
        s11 << r12
        if r12
          r14 = _nt_dimExpr
          s11 << r14
        end
        if s11.last
          r11 = instantiate_node(SyntaxNode,input, i11...index, s11)
          r11.extend(Field0)
        else
          @index = i11
          r11 = nil
        end
        if r11
          s10 << r11
        else
          break
        end
      end
      r10 = instantiate_node(SyntaxNode,input, i10...index, s10)
      s0 << r10
      if r10
        r16 = _nt_accessorField
        if r16
          r15 = r16
        else
          r15 = instantiate_node(SyntaxNode,input, index...index)
        end
        s0 << r15
      end
    end
    if s0.last
      r0 = instantiate_node(JavaField,input, i0...index, s0)
      r0.extend(Field1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:field][start_index] = r0

    r0
  end

  module BodyIdenfifier0
    def dimExpr
      elements[1]
    end
  end

  module BodyIdenfifier1
    def name
      elements[0]
    end

  end

  def _nt_bodyIdenfifier
    start_index = index
    if node_cache[:bodyIdenfifier].has_key?(index)
      cached = node_cache[:bodyIdenfifier][index]
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
          r6 = _nt_dimExpr
          s3 << r6
        end
        if s3.last
          r3 = instantiate_node(SyntaxNode,input, i3...index, s3)
          r3.extend(BodyIdenfifier0)
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
      if r2
        i7 = index
        if has_terminal?('\G[\\(]', true, index)
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
        s0 << r7
      end
    end
    if s0.last
      r0 = instantiate_node(JavaBodyIdentifier,input, i0...index, s0)
      r0.extend(BodyIdenfifier1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:bodyIdenfifier][start_index] = r0

    r0
  end

  module ClassReference0
    def identifier
      elements[0]
    end

  end

  def _nt_classReference
    start_index = index
    if node_cache[:classReference].has_key?(index)
      cached = node_cache[:classReference][index]
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
      if has_terminal?(".class", false, index)
        r2 = instantiate_node(SyntaxNode,input, index...(index + 6))
        @index += 6
      else
        terminal_parse_failure(".class")
        r2 = nil
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(ClassReference0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:classReference][start_index] = r0

    r0
  end

  module SuperMethodCall0
    def method
      elements[1]
    end
  end

  def _nt_superMethodCall
    start_index = index
    if node_cache[:superMethodCall].has_key?(index)
      cached = node_cache[:superMethodCall][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("super.", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 6))
      @index += 6
    else
      terminal_parse_failure("super.")
      r1 = nil
    end
    s0 << r1
    if r1
      r2 = _nt_methodCall
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(JavaSuperMethodCall,input, i0...index, s0)
      r0.extend(SuperMethodCall0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:superMethodCall][start_index] = r0

    r0
  end

  module SuperConstructorCall0
    def arguments
      elements[4]
    end

  end

  def _nt_superConstructorCall
    start_index = index
    if node_cache[:superConstructorCall].has_key?(index)
      cached = node_cache[:superConstructorCall][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("super", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 5))
      @index += 5
    else
      terminal_parse_failure("super")
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
        if has_terminal?("(", false, index)
          r4 = instantiate_node(SyntaxNode,input, index...(index + 1))
          @index += 1
        else
          terminal_parse_failure("(")
          r4 = nil
        end
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
            r8 = _nt_exprList
            if r8
              r7 = r8
            else
              r7 = instantiate_node(SyntaxNode,input, index...index)
            end
            s0 << r7
            if r7
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
                if has_terminal?(")", false, index)
                  r11 = instantiate_node(SyntaxNode,input, index...(index + 1))
                  @index += 1
                else
                  terminal_parse_failure(")")
                  r11 = nil
                end
                s0 << r11
              end
            end
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaSuperConstructorCall,input, i0...index, s0)
      r0.extend(SuperConstructorCall0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:superConstructorCall][start_index] = r0

    r0
  end

  module ThisMethodCall0
    def arguments
      elements[4]
    end

  end

  def _nt_thisMethodCall
    start_index = index
    if node_cache[:thisMethodCall].has_key?(index)
      cached = node_cache[:thisMethodCall][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("this", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 4))
      @index += 4
    else
      terminal_parse_failure("this")
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
        if has_terminal?("(", false, index)
          r4 = instantiate_node(SyntaxNode,input, index...(index + 1))
          @index += 1
        else
          terminal_parse_failure("(")
          r4 = nil
        end
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
            r8 = _nt_exprList
            if r8
              r7 = r8
            else
              r7 = instantiate_node(SyntaxNode,input, index...index)
            end
            s0 << r7
            if r7
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
                if has_terminal?(")", false, index)
                  r11 = instantiate_node(SyntaxNode,input, index...(index + 1))
                  @index += 1
                else
                  terminal_parse_failure(")")
                  r11 = nil
                end
                s0 << r11
              end
            end
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaThisMethodCall,input, i0...index, s0)
      r0.extend(ThisMethodCall0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:thisMethodCall][start_index] = r0

    r0
  end

  module MethodCall0
    def name
      elements[0]
    end

    def arguments
      elements[4]
    end

  end

  def _nt_methodCall
    start_index = index
    if node_cache[:methodCall].has_key?(index)
      cached = node_cache[:methodCall][index]
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
        if has_terminal?("(", false, index)
          r4 = instantiate_node(SyntaxNode,input, index...(index + 1))
          @index += 1
        else
          terminal_parse_failure("(")
          r4 = nil
        end
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
            r8 = _nt_exprList
            if r8
              r7 = r8
            else
              r7 = instantiate_node(SyntaxNode,input, index...index)
            end
            s0 << r7
            if r7
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
                if has_terminal?(")", false, index)
                  r11 = instantiate_node(SyntaxNode,input, index...(index + 1))
                  @index += 1
                else
                  terminal_parse_failure(")")
                  r11 = nil
                end
                s0 << r11
              end
            end
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaMethodCall,input, i0...index, s0)
      r0.extend(MethodCall0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:methodCall][start_index] = r0

    r0
  end

  module AccessorField0
    def field
      elements[1]
    end

  end

  def _nt_accessorField
    start_index = index
    if node_cache[:accessorField].has_key?(index)
      cached = node_cache[:accessorField][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?(".", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      terminal_parse_failure(".")
      r1 = nil
    end
    s0 << r1
    if r1
      r2 = _nt_field
      s0 << r2
      if r2
        if has_terminal?('', false, index)
          r3 = instantiate_node(SyntaxNode,input, index...(index + 0))
          @index += 0
        else
          terminal_parse_failure('')
          r3 = nil
        end
        s0 << r3
      end
    end
    if s0.last
      r0 = instantiate_node(JavaFieldAccessor,input, i0...index, s0)
      r0.extend(AccessorField0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:accessorField][start_index] = r0

    r0
  end

  module MemberArrayCreator0
    def dim
      elements[1]
    end
  end

  module MemberArrayCreator1
    def NEW
      elements[0]
    end

    def type
      elements[2]
    end

    def dim
      elements[4]
    end

    def initializer
      elements[7]
    end
  end

  module MemberArrayCreator2
    def dimExpr
      elements[1]
    end
  end

  module MemberArrayCreator3
    def NEW
      elements[0]
    end

    def type
      elements[2]
    end

    def dimExpr
      elements[4]
    end

  end

  def _nt_memberArrayCreator
    start_index = index
    if node_cache[:memberArrayCreator].has_key?(index)
      cached = node_cache[:memberArrayCreator][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    i1, s1 = index, []
    r2 = _nt_NEW
    s1 << r2
    if r2
      s3, i3 = [], index
      loop do
        r4 = _nt_gap
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
      s1 << r3
      if r3
        r5 = _nt_qualifiedIdentifier
        s1 << r5
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
          r6 = instantiate_node(SyntaxNode,input, i6...index, s6)
          s1 << r6
          if r6
            r8 = _nt_dim
            s1 << r8
            if r8
              s9, i9 = [], index
              loop do
                i10, s10 = index, []
                s11, i11 = [], index
                loop do
                  r12 = _nt_gap
                  if r12
                    s11 << r12
                  else
                    break
                  end
                end
                r11 = instantiate_node(SyntaxNode,input, i11...index, s11)
                s10 << r11
                if r11
                  r13 = _nt_dim
                  s10 << r13
                end
                if s10.last
                  r10 = instantiate_node(SyntaxNode,input, i10...index, s10)
                  r10.extend(MemberArrayCreator0)
                else
                  @index = i10
                  r10 = nil
                end
                if r10
                  s9 << r10
                else
                  break
                end
              end
              r9 = instantiate_node(SyntaxNode,input, i9...index, s9)
              s1 << r9
              if r9
                s14, i14 = [], index
                loop do
                  r15 = _nt_gap
                  if r15
                    s14 << r15
                  else
                    break
                  end
                end
                r14 = instantiate_node(SyntaxNode,input, i14...index, s14)
                s1 << r14
                if r14
                  r17 = _nt_arrayInitializer
                  if r17
                    r16 = r17
                  else
                    r16 = instantiate_node(SyntaxNode,input, index...index)
                  end
                  s1 << r16
                end
              end
            end
          end
        end
      end
    end
    if s1.last
      r1 = instantiate_node(JavaArrayInstantiation,input, i1...index, s1)
      r1.extend(MemberArrayCreator1)
    else
      @index = i1
      r1 = nil
    end
    if r1
      r0 = r1
    else
      i18, s18 = index, []
      r19 = _nt_NEW
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
        if s20.empty?
          @index = i20
          r20 = nil
        else
          r20 = instantiate_node(SyntaxNode,input, i20...index, s20)
        end
        s18 << r20
        if r20
          r22 = _nt_qualifiedIdentifier
          s18 << r22
          if r22
            s23, i23 = [], index
            loop do
              r24 = _nt_gap
              if r24
                s23 << r24
              else
                break
              end
            end
            r23 = instantiate_node(SyntaxNode,input, i23...index, s23)
            s18 << r23
            if r23
              r25 = _nt_dimExpr
              s18 << r25
              if r25
                s26, i26 = [], index
                loop do
                  i27, s27 = index, []
                  s28, i28 = [], index
                  loop do
                    r29 = _nt_gap
                    if r29
                      s28 << r29
                    else
                      break
                    end
                  end
                  r28 = instantiate_node(SyntaxNode,input, i28...index, s28)
                  s27 << r28
                  if r28
                    r30 = _nt_dimExpr
                    s27 << r30
                  end
                  if s27.last
                    r27 = instantiate_node(SyntaxNode,input, i27...index, s27)
                    r27.extend(MemberArrayCreator2)
                  else
                    @index = i27
                    r27 = nil
                  end
                  if r27
                    s26 << r27
                  else
                    break
                  end
                end
                r26 = instantiate_node(SyntaxNode,input, i26...index, s26)
                s18 << r26
              end
            end
          end
        end
      end
      if s18.last
        r18 = instantiate_node(JavaArrayInstantiation,input, i18...index, s18)
        r18.extend(MemberArrayCreator3)
      else
        @index = i18
        r18 = nil
      end
      if r18
        r0 = r18
      else
        @index = i0
        r0 = nil
      end
    end

    node_cache[:memberArrayCreator][start_index] = r0

    r0
  end

  module ArrayInitializer0
    def initializer
      elements[2]
    end

  end

  def _nt_arrayInitializer
    start_index = index
    if node_cache[:arrayInitializer].has_key?(index)
      cached = node_cache[:arrayInitializer][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("{", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      terminal_parse_failure("{")
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
        r5 = _nt_initializersGroup
        if r5
          r4 = r5
        else
          r4 = instantiate_node(SyntaxNode,input, index...index)
        end
        s0 << r4
        if r4
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
          s0 << r6
          if r6
            if has_terminal?("}", false, index)
              r8 = instantiate_node(SyntaxNode,input, index...(index + 1))
              @index += 1
            else
              terminal_parse_failure("}")
              r8 = nil
            end
            s0 << r8
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaArrayInitializer,input, i0...index, s0)
      r0.extend(ArrayInitializer0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:arrayInitializer][start_index] = r0

    r0
  end

  module InitializersGroup0
    def comma
      elements[0]
    end

    def variableInitializer
      elements[1]
    end
  end

  module InitializersGroup1
    def variableInitializer
      elements[0]
    end

  end

  def _nt_initializersGroup
    start_index = index
    if node_cache[:initializersGroup].has_key?(index)
      cached = node_cache[:initializersGroup][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_variableInitializer
    s0 << r1
    if r1
      s2, i2 = [], index
      loop do
        i3, s3 = index, []
        r4 = _nt_comma
        s3 << r4
        if r4
          r5 = _nt_variableInitializer
          s3 << r5
        end
        if s3.last
          r3 = instantiate_node(SyntaxNode,input, i3...index, s3)
          r3.extend(InitializersGroup0)
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
      r0.extend(InitializersGroup1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:initializersGroup][start_index] = r0

    r0
  end

  module GroupExpressionMembers0
    def expression
      elements[2]
    end

  end

  def _nt_groupExpressionMembers
    start_index = index
    if node_cache[:groupExpressionMembers].has_key?(index)
      cached = node_cache[:groupExpressionMembers][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("(", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      terminal_parse_failure("(")
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
        r4 = _nt_expression
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
            if has_terminal?(")", false, index)
              r7 = instantiate_node(SyntaxNode,input, index...(index + 1))
              @index += 1
            else
              terminal_parse_failure(")")
              r7 = nil
            end
            s0 << r7
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaExpressionGroup,input, i0...index, s0)
      r0.extend(GroupExpressionMembers0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:groupExpressionMembers][start_index] = r0

    r0
  end

  def _nt_variableInitializer
    start_index = index
    if node_cache[:variableInitializer].has_key?(index)
      cached = node_cache[:variableInitializer][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    r1 = _nt_arrayInitializer
    if r1
      r0 = r1
    else
      r2 = _nt_expression
      if r2
        r0 = r2
      else
        @index = i0
        r0 = nil
      end
    end

    node_cache[:variableInitializer][start_index] = r0

    r0
  end

  module LocalVariables0
    def FINAL
      elements[0]
    end

  end

  module LocalVariables1
    def is_final
      elements[0]
    end

    def type
      elements[1]
    end

    def variables
      elements[3]
    end

  end

  def _nt_localVariables
    start_index = index
    if node_cache[:localVariables].has_key?(index)
      cached = node_cache[:localVariables][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    i2, s2 = index, []
    r3 = _nt_FINAL
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
      r4 = instantiate_node(SyntaxNode,input, i4...index, s4)
      s2 << r4
    end
    if s2.last
      r2 = instantiate_node(SyntaxNode,input, i2...index, s2)
      r2.extend(LocalVariables0)
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
      r6 = _nt_type
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
        if s7.empty?
          @index = i7
          r7 = nil
        else
          r7 = instantiate_node(SyntaxNode,input, i7...index, s7)
        end
        s0 << r7
        if r7
          r9 = _nt_variables
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
              if has_terminal?(";", false, index)
                r12 = instantiate_node(SyntaxNode,input, index...(index + 1))
                @index += 1
              else
                terminal_parse_failure(";")
                r12 = nil
              end
              s0 << r12
            end
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaLocalVariables,input, i0...index, s0)
      r0.extend(LocalVariables1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:localVariables][start_index] = r0

    r0
  end

  module Variables0
    def comma
      elements[0]
    end

    def variable
      elements[1]
    end
  end

  module Variables1
    def variable
      elements[0]
    end

  end

  def _nt_variables
    start_index = index
    if node_cache[:variables].has_key?(index)
      cached = node_cache[:variables][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_variable
    s0 << r1
    if r1
      s2, i2 = [], index
      loop do
        i3, s3 = index, []
        r4 = _nt_comma
        s3 << r4
        if r4
          r5 = _nt_variable
          s3 << r5
        end
        if s3.last
          r3 = instantiate_node(SyntaxNode,input, i3...index, s3)
          r3.extend(Variables0)
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
      r0.extend(Variables1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:variables][start_index] = r0

    r0
  end

  module Variable0
    def dim
      elements[1]
    end
  end

  module Variable1
    def name
      elements[0]
    end

    def initializer
      elements[5]
    end
  end

  module Variable2
    def dim
      elements[1]
    end
  end

  module Variable3
    def name
      elements[0]
    end

  end

  def _nt_variable
    start_index = index
    if node_cache[:variable].has_key?(index)
      cached = node_cache[:variable][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    i1, s1 = index, []
    r2 = _nt_identifier
    s1 << r2
    if r2
      s3, i3 = [], index
      loop do
        i4, s4 = index, []
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
        s4 << r5
        if r5
          r7 = _nt_dim
          s4 << r7
        end
        if s4.last
          r4 = instantiate_node(SyntaxNode,input, i4...index, s4)
          r4.extend(Variable0)
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
        s1 << r8
        if r8
          if has_terminal?("=", false, index)
            r10 = instantiate_node(SyntaxNode,input, index...(index + 1))
            @index += 1
          else
            terminal_parse_failure("=")
            r10 = nil
          end
          s1 << r10
          if r10
            s11, i11 = [], index
            loop do
              r12 = _nt_gap
              if r12
                s11 << r12
              else
                break
              end
            end
            r11 = instantiate_node(SyntaxNode,input, i11...index, s11)
            s1 << r11
            if r11
              r13 = _nt_variableInitializer
              s1 << r13
            end
          end
        end
      end
    end
    if s1.last
      r1 = instantiate_node(JavaVariable,input, i1...index, s1)
      r1.extend(Variable1)
    else
      @index = i1
      r1 = nil
    end
    if r1
      r0 = r1
    else
      i14, s14 = index, []
      r15 = _nt_identifier
      s14 << r15
      if r15
        s16, i16 = [], index
        loop do
          i17, s17 = index, []
          s18, i18 = [], index
          loop do
            r19 = _nt_gap
            if r19
              s18 << r19
            else
              break
            end
          end
          r18 = instantiate_node(SyntaxNode,input, i18...index, s18)
          s17 << r18
          if r18
            r20 = _nt_dim
            s17 << r20
          end
          if s17.last
            r17 = instantiate_node(SyntaxNode,input, i17...index, s17)
            r17.extend(Variable2)
          else
            @index = i17
            r17 = nil
          end
          if r17
            s16 << r17
          else
            break
          end
        end
        r16 = instantiate_node(SyntaxNode,input, i16...index, s16)
        s14 << r16
      end
      if s14.last
        r14 = instantiate_node(JavaVariable,input, i14...index, s14)
        r14.extend(Variable3)
      else
        @index = i14
        r14 = nil
      end
      if r14
        r0 = r14
      else
        @index = i0
        r0 = nil
      end
    end

    node_cache[:variable][start_index] = r0

    r0
  end

  module DimExpr0
    def expression
      elements[2]
    end

  end

  def _nt_dimExpr
    start_index = index
    if node_cache[:dimExpr].has_key?(index)
      cached = node_cache[:dimExpr][index]
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
        r4 = _nt_expression
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
            if has_terminal?("]", false, index)
              r7 = instantiate_node(SyntaxNode,input, index...(index + 1))
              @index += 1
            else
              terminal_parse_failure("]")
              r7 = nil
            end
            s0 << r7
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaDimExpr,input, i0...index, s0)
      r0.extend(DimExpr0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:dimExpr][start_index] = r0

    r0
  end

  module Class0
    def modifier
      elements[0]
    end

  end

  module Class1
    def extends
      elements[1]
    end
  end

  module Class2
    def implements
      elements[1]
    end
  end

  module Class3
    def modifier
      elements[0]
    end

    def CLASS
      elements[1]
    end

    def name
      elements[3]
    end

    def body
      elements[7]
    end
  end

  def _nt_class
    start_index = index
    if node_cache[:class].has_key?(index)
      cached = node_cache[:class][index]
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
        r2.extend(Class0)
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
      r6 = _nt_CLASS
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
        if s7.empty?
          @index = i7
          r7 = nil
        else
          r7 = instantiate_node(SyntaxNode,input, i7...index, s7)
        end
        s0 << r7
        if r7
          r9 = _nt_identifier
          s0 << r9
          if r9
            i11, s11 = index, []
            s12, i12 = [], index
            loop do
              r13 = _nt_gap
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
            s11 << r12
            if r12
              r14 = _nt_extends
              s11 << r14
            end
            if s11.last
              r11 = instantiate_node(SyntaxNode,input, i11...index, s11)
              r11.extend(Class1)
            else
              @index = i11
              r11 = nil
            end
            if r11
              r10 = r11
            else
              r10 = instantiate_node(SyntaxNode,input, index...index)
            end
            s0 << r10
            if r10
              i16, s16 = index, []
              s17, i17 = [], index
              loop do
                r18 = _nt_gap
                if r18
                  s17 << r18
                else
                  break
                end
              end
              if s17.empty?
                @index = i17
                r17 = nil
              else
                r17 = instantiate_node(SyntaxNode,input, i17...index, s17)
              end
              s16 << r17
              if r17
                r19 = _nt_implements
                s16 << r19
              end
              if s16.last
                r16 = instantiate_node(SyntaxNode,input, i16...index, s16)
                r16.extend(Class2)
              else
                @index = i16
                r16 = nil
              end
              if r16
                r15 = r16
              else
                r15 = instantiate_node(SyntaxNode,input, index...index)
              end
              s0 << r15
              if r15
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
                s0 << r20
                if r20
                  r22 = _nt_classBody
                  s0 << r22
                end
              end
            end
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaClass,input, i0...index, s0)
      r0.extend(Class3)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:class][start_index] = r0

    r0
  end

  module Extends0
    def EXTENDS
      elements[0]
    end

    def parent
      elements[2]
    end
  end

  def _nt_extends
    start_index = index
    if node_cache[:extends].has_key?(index)
      cached = node_cache[:extends][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_EXTENDS
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
      end
    end
    if s0.last
      r0 = instantiate_node(JavaExtends,input, i0...index, s0)
      r0.extend(Extends0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:extends][start_index] = r0

    r0
  end

  module Implements0
    def IMPLEMENTS
      elements[0]
    end

    def interfaces
      elements[2]
    end
  end

  def _nt_implements
    start_index = index
    if node_cache[:implements].has_key?(index)
      cached = node_cache[:implements][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_IMPLEMENTS
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
        r4 = _nt_classTypeList
        s0 << r4
      end
    end
    if s0.last
      r0 = instantiate_node(JavaImplements,input, i0...index, s0)
      r0.extend(Implements0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:implements][start_index] = r0

    r0
  end

  module ClassBody0
    def classBodyDeclaration
      elements[1]
    end
  end

  module ClassBody1
  end

  def _nt_classBody
    start_index = index
    if node_cache[:classBody].has_key?(index)
      cached = node_cache[:classBody][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("{", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      terminal_parse_failure("{")
      r1 = nil
    end
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
          r6 = _nt_classBodyDeclaration
          s3 << r6
        end
        if s3.last
          r3 = instantiate_node(SyntaxNode,input, i3...index, s3)
          r3.extend(ClassBody0)
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
      if r2
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
          if has_terminal?("}", false, index)
            r9 = instantiate_node(SyntaxNode,input, index...(index + 1))
            @index += 1
          else
            terminal_parse_failure("}")
            r9 = nil
          end
          s0 << r9
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaClassBody,input, i0...index, s0)
      r0.extend(ClassBody1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:classBody][start_index] = r0

    r0
  end

  module ClassBodyDeclaration0
  end

  module ClassBodyDeclaration1
    def block
      elements[1]
    end
  end

  def _nt_classBodyDeclaration
    start_index = index
    if node_cache[:classBodyDeclaration].has_key?(index)
      cached = node_cache[:classBodyDeclaration][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    if has_terminal?(";", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      terminal_parse_failure(";")
      r1 = nil
    end
    if r1
      r0 = r1
    else
      i2, s2 = index, []
      i4, s4 = index, []
      if has_terminal?("static", false, index)
        r5 = instantiate_node(SyntaxNode,input, index...(index + 6))
        @index += 6
      else
        terminal_parse_failure("static")
        r5 = nil
      end
      s4 << r5
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
        r6 = instantiate_node(SyntaxNode,input, i6...index, s6)
        s4 << r6
      end
      if s4.last
        r4 = instantiate_node(SyntaxNode,input, i4...index, s4)
        r4.extend(ClassBodyDeclaration0)
      else
        @index = i4
        r4 = nil
      end
      if r4
        r3 = r4
      else
        r3 = instantiate_node(SyntaxNode,input, index...index)
      end
      s2 << r3
      if r3
        r8 = _nt_block
        s2 << r8
      end
      if s2.last
        r2 = instantiate_node(SyntaxNode,input, i2...index, s2)
        r2.extend(ClassBodyDeclaration1)
      else
        @index = i2
        r2 = nil
      end
      if r2
        r0 = r2
      else
        r9 = _nt_memberDecl
        if r9
          r0 = r9
        else
          @index = i0
          r0 = nil
        end
      end
    end

    node_cache[:classBodyDeclaration][start_index] = r0

    r0
  end

  module ClassBodyMethod0
    def methodDeclaration
      elements[0]
    end

    def body
      elements[2]
    end
  end

  module ClassBodyMethod1
    def constructor?() false; end
  end

  def _nt_classBodyMethod
    start_index = index
    if node_cache[:classBodyMethod].has_key?(index)
      cached = node_cache[:classBodyMethod][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_methodDeclaration
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
        i4 = index
        r5 = _nt_block
        if r5
          r4 = r5
        else
          if has_terminal?(";", false, index)
            r6 = instantiate_node(SyntaxNode,input, index...(index + 1))
            @index += 1
          else
            terminal_parse_failure(";")
            r6 = nil
          end
          if r6
            r4 = r6
          else
            @index = i4
            r4 = nil
          end
        end
        s0 << r4
      end
    end
    if s0.last
      r0 = instantiate_node(JavaClassMethod,input, i0...index, s0)
      r0.extend(ClassBodyMethod0)
      r0.extend(ClassBodyMethod1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:classBodyMethod][start_index] = r0

    r0
  end

  module ClassBodyConstructor0
    def methodDeclaration
      elements[0]
    end

    def body
      elements[2]
    end
  end

  module ClassBodyConstructor1
    def constructor?() true; end
  end

  def _nt_classBodyConstructor
    start_index = index
    if node_cache[:classBodyConstructor].has_key?(index)
      cached = node_cache[:classBodyConstructor][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_constructorDeclaration
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
        r4 = _nt_block
        s0 << r4
      end
    end
    if s0.last
      r0 = instantiate_node(JavaClassMethod,input, i0...index, s0)
      r0.extend(ClassBodyConstructor0)
      r0.extend(ClassBodyConstructor1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:classBodyConstructor][start_index] = r0

    r0
  end

  module ClassBodyVariables0
    def modifier
      elements[0]
    end

  end

  module ClassBodyVariables1
    def modifier
      elements[0]
    end

    def type
      elements[1]
    end

    def variables
      elements[3]
    end

  end

  def _nt_classBodyVariables
    start_index = index
    if node_cache[:classBodyVariables].has_key?(index)
      cached = node_cache[:classBodyVariables][index]
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
        r2.extend(ClassBodyVariables0)
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
      r6 = _nt_type
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
        if s7.empty?
          @index = i7
          r7 = nil
        else
          r7 = instantiate_node(SyntaxNode,input, i7...index, s7)
        end
        s0 << r7
        if r7
          r9 = _nt_variables
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
              if has_terminal?(";", false, index)
                r12 = instantiate_node(SyntaxNode,input, index...(index + 1))
                @index += 1
              else
                terminal_parse_failure(";")
                r12 = nil
              end
              s0 << r12
            end
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaClassLocalVariables,input, i0...index, s0)
      r0.extend(ClassBodyVariables1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:classBodyVariables][start_index] = r0

    r0
  end

  def _nt_memberDecl
    start_index = index
    if node_cache[:memberDecl].has_key?(index)
      cached = node_cache[:memberDecl][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    r1 = _nt_classBodyConstructor
    if r1
      r0 = r1
    else
      r2 = _nt_classBodyMethod
      if r2
        r0 = r2
      else
        r3 = _nt_classBodyVariables
        if r3
          r0 = r3
        else
          r4 = _nt_interface
          if r4
            r0 = r4
          else
            r5 = _nt_class
            if r5
              r0 = r5
            else
              @index = i0
              r0 = nil
            end
          end
        end
      end
    end

    node_cache[:memberDecl][start_index] = r0

    r0
  end

  module Interface0
    def modifier
      elements[0]
    end

  end

  module Interface1
    def iimplements
      elements[1]
    end
  end

  module Interface2
    def modifier
      elements[0]
    end

    def INTERFACE
      elements[1]
    end

    def name
      elements[3]
    end

    def body
      elements[6]
    end
  end

  def _nt_interface
    start_index = index
    if node_cache[:interface].has_key?(index)
      cached = node_cache[:interface][index]
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
        r2.extend(Interface0)
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
      r6 = _nt_INTERFACE
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
        if s7.empty?
          @index = i7
          r7 = nil
        else
          r7 = instantiate_node(SyntaxNode,input, i7...index, s7)
        end
        s0 << r7
        if r7
          r9 = _nt_identifier
          s0 << r9
          if r9
            i11, s11 = index, []
            s12, i12 = [], index
            loop do
              r13 = _nt_gap
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
            s11 << r12
            if r12
              r14 = _nt_iimplements
              s11 << r14
            end
            if s11.last
              r11 = instantiate_node(SyntaxNode,input, i11...index, s11)
              r11.extend(Interface1)
            else
              @index = i11
              r11 = nil
            end
            if r11
              r10 = r11
            else
              r10 = instantiate_node(SyntaxNode,input, index...index)
            end
            s0 << r10
            if r10
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
                r17 = _nt_interfaceBody
                s0 << r17
              end
            end
          end
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaInterface,input, i0...index, s0)
      r0.extend(Interface2)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:interface][start_index] = r0

    r0
  end

  module Iimplements0
    def EXTENDS
      elements[0]
    end

    def interfaces
      elements[2]
    end
  end

  def _nt_iimplements
    start_index = index
    if node_cache[:iimplements].has_key?(index)
      cached = node_cache[:iimplements][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_EXTENDS
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
        r4 = _nt_classTypeList
        s0 << r4
      end
    end
    if s0.last
      r0 = instantiate_node(JavaImplements,input, i0...index, s0)
      r0.extend(Iimplements0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:iimplements][start_index] = r0

    r0
  end

  module InterfaceBody0
    def interfaceMemberDecl
      elements[0]
    end

  end

  module InterfaceBody1
  end

  def _nt_interfaceBody
    start_index = index
    if node_cache[:interfaceBody].has_key?(index)
      cached = node_cache[:interfaceBody][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("{", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      terminal_parse_failure("{")
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
        s4, i4 = [], index
        loop do
          i5, s5 = index, []
          r6 = _nt_interfaceMemberDecl
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
            r7 = instantiate_node(SyntaxNode,input, i7...index, s7)
            s5 << r7
          end
          if s5.last
            r5 = instantiate_node(SyntaxNode,input, i5...index, s5)
            r5.extend(InterfaceBody0)
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
        if r4
          if has_terminal?("}", false, index)
            r9 = instantiate_node(SyntaxNode,input, index...(index + 1))
            @index += 1
          else
            terminal_parse_failure("}")
            r9 = nil
          end
          s0 << r9
        end
      end
    end
    if s0.last
      r0 = instantiate_node(SyntaxNode,input, i0...index, s0)
      r0.extend(InterfaceBody1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:interfaceBody][start_index] = r0

    r0
  end

  module InterfaceMemberDecl0
    def methodDeclaration
      elements[0]
    end

  end

  def _nt_interfaceMemberDecl
    start_index = index
    if node_cache[:interfaceMemberDecl].has_key?(index)
      cached = node_cache[:interfaceMemberDecl][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    r1 = _nt_interfaceVariable
    if r1
      r0 = r1
    else
      i2, s2 = index, []
      r3 = _nt_methodDeclaration
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
        r4 = instantiate_node(SyntaxNode,input, i4...index, s4)
        s2 << r4
        if r4
          if has_terminal?(";", false, index)
            r6 = instantiate_node(SyntaxNode,input, index...(index + 1))
            @index += 1
          else
            terminal_parse_failure(";")
            r6 = nil
          end
          s2 << r6
        end
      end
      if s2.last
        r2 = instantiate_node(SyntaxNode,input, i2...index, s2)
        r2.extend(InterfaceMemberDecl0)
      else
        @index = i2
        r2 = nil
      end
      if r2
        r0 = r2
      else
        r7 = _nt_interface
        if r7
          r0 = r7
        else
          r8 = _nt_class
          if r8
            r0 = r8
          else
            @index = i0
            r0 = nil
          end
        end
      end
    end

    node_cache[:interfaceMemberDecl][start_index] = r0

    r0
  end

  module InterfaceVariable0
    def modifier
      elements[0]
    end

  end

  module InterfaceVariable1
    def modifier
      elements[0]
    end

    def type
      elements[1]
    end

    def name
      elements[3]
    end

    def initializer
      elements[7]
    end

  end

  def _nt_interfaceVariable
    start_index = index
    if node_cache[:interfaceVariable].has_key?(index)
      cached = node_cache[:interfaceVariable][index]
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
        r2.extend(InterfaceVariable0)
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
      r6 = _nt_type
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
        if s7.empty?
          @index = i7
          r7 = nil
        else
          r7 = instantiate_node(SyntaxNode,input, i7...index, s7)
        end
        s0 << r7
        if r7
          r9 = _nt_identifier
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
              if has_terminal?("=", false, index)
                r12 = instantiate_node(SyntaxNode,input, index...(index + 1))
                @index += 1
              else
                terminal_parse_failure("=")
                r12 = nil
              end
              s0 << r12
              if r12
                s13, i13 = [], index
                loop do
                  r14 = _nt_gap
                  if r14
                    s13 << r14
                  else
                    break
                  end
                end
                r13 = instantiate_node(SyntaxNode,input, i13...index, s13)
                s0 << r13
                if r13
                  r15 = _nt_variableInitializer
                  s0 << r15
                  if r15
                    s16, i16 = [], index
                    loop do
                      r17 = _nt_gap
                      if r17
                        s16 << r17
                      else
                        break
                      end
                    end
                    r16 = instantiate_node(SyntaxNode,input, i16...index, s16)
                    s0 << r16
                    if r16
                      if has_terminal?(";", false, index)
                        r18 = instantiate_node(SyntaxNode,input, index...(index + 1))
                        @index += 1
                      else
                        terminal_parse_failure(";")
                        r18 = nil
                      end
                      s0 << r18
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
      r0 = instantiate_node(JavaInterfaceVariable,input, i0...index, s0)
      r0.extend(InterfaceVariable1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:interfaceVariable][start_index] = r0

    r0
  end

  module Block0
    def blockStatement
      elements[1]
    end
  end

  module Block1
  end

  def _nt_block
    start_index = index
    if node_cache[:block].has_key?(index)
      cached = node_cache[:block][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    if has_terminal?("{", false, index)
      r1 = instantiate_node(SyntaxNode,input, index...(index + 1))
      @index += 1
    else
      terminal_parse_failure("{")
      r1 = nil
    end
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
          r6 = _nt_blockStatement
          s3 << r6
        end
        if s3.last
          r3 = instantiate_node(SyntaxNode,input, i3...index, s3)
          r3.extend(Block0)
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
      if r2
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
          if has_terminal?("}", false, index)
            r9 = instantiate_node(SyntaxNode,input, index...(index + 1))
            @index += 1
          else
            terminal_parse_failure("}")
            r9 = nil
          end
          s0 << r9
        end
      end
    end
    if s0.last
      r0 = instantiate_node(JavaBlock,input, i0...index, s0)
      r0.extend(Block1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:block][start_index] = r0

    r0
  end

  def _nt_blockStatement
    start_index = index
    if node_cache[:blockStatement].has_key?(index)
      cached = node_cache[:blockStatement][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    r1 = _nt_localVariables
    if r1
      r0 = r1
    else
      r2 = _nt_class
      if r2
        r0 = r2
      else
        r3 = _nt_statement
        if r3
          r0 = r3
        else
          @index = i0
          r0 = nil
        end
      end
    end

    node_cache[:blockStatement][start_index] = r0

    r0
  end

  module Statement0
    def expression
      elements[3]
    end
  end

  module Statement1
    def ASSERT
      elements[0]
    end

    def expression
      elements[2]
    end

  end

  module Statement2
    def IF
      elements[0]
    end

    def condition
      elements[2]
    end

    def body
      elements[4]
    end

    def ELSE
      elements[6]
    end

    def else_body
      elements[8]
    end
  end

  module Statement3
    def IF
      elements[0]
    end

    def condition
      elements[2]
    end

    def body
      elements[4]
    end
  end

  module Statement4
    def FOR
      elements[0]
    end

    def initializer
      elements[4]
    end

    def condition
      elements[6]
    end

    def updater
      elements[10]
    end

    def body
      elements[14]
    end
  end

  module Statement5
    def WHILE
      elements[0]
    end

    def condition
      elements[2]
    end

    def body
      elements[4]
    end
  end

  module Statement6
    def DO
      elements[0]
    end

    def body
      elements[2]
    end

    def WHILE
      elements[4]
    end

    def condition
      elements[6]
    end

  end

  module Statement7
    def TRY
      elements[0]
    end

    def body
      elements[2]
    end

    def catches
      elements[4]
    end

    def finally
      elements[6]
    end
  end

  module Statement8
    def SWITCH
      elements[0]
    end

    def condition
      elements[2]
    end

    def cases
      elements[6]
    end

  end

  module Statement9
    def SYNCHRONIZED
      elements[0]
    end

    def condition
      elements[2]
    end

    def body
      elements[4]
    end
  end

  module Statement10
    def RETURN
      elements[0]
    end

    def expression
      elements[2]
    end

  end

  module Statement11
    def THROW
      elements[0]
    end

    def expression
      elements[2]
    end

  end

  module Statement12
    def identifier
      elements[1]
    end
  end

  module Statement13
    def BREAK
      elements[0]
    end

  end

  module Statement14
    def identifier
      elements[1]
    end
  end

  module Statement15
    def CONTINUE
      elements[0]
    end

  end

  module Statement16
    def identifier
      elements[0]
    end

  end

  module Statement17
    def statement
      elements[2]
    end
  end

  module Statement18
    def expression
      elements[0]
    end

  end

  def _nt_statement
    start_index = index
    if node_cache[:statement].has_key?(index)
      cached = node_cache[:statement][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    r1 = _nt_block
    if r1
      r0 = r1
    else
      i2, s2 = index, []
      r3 = _nt_ASSERT
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
        r4 = instantiate_node(SyntaxNode,input, i4...index, s4)
        s2 << r4
        if r4
          r6 = _nt_expression
          s2 << r6
          if r6
            i8, s8 = index, []
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
            s8 << r9
            if r9
              if has_terminal?(":", false, index)
                r11 = instantiate_node(SyntaxNode,input, index...(index + 1))
                @index += 1
              else
                terminal_parse_failure(":")
                r11 = nil
              end
              s8 << r11
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
                s8 << r12
                if r12
                  r14 = _nt_expression
                  s8 << r14
                end
              end
            end
            if s8.last
              r8 = instantiate_node(SyntaxNode,input, i8...index, s8)
              r8.extend(Statement0)
            else
              @index = i8
              r8 = nil
            end
            if r8
              r7 = r8
            else
              r7 = instantiate_node(SyntaxNode,input, index...index)
            end
            s2 << r7
            if r7
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
              s2 << r15
              if r15
                if has_terminal?(";", false, index)
                  r17 = instantiate_node(SyntaxNode,input, index...(index + 1))
                  @index += 1
                else
                  terminal_parse_failure(";")
                  r17 = nil
                end
                s2 << r17
              end
            end
          end
        end
      end
      if s2.last
        r2 = instantiate_node(JavaAssertion,input, i2...index, s2)
        r2.extend(Statement1)
      else
        @index = i2
        r2 = nil
      end
      if r2
        r0 = r2
      else
        i18, s18 = index, []
        r19 = _nt_IF
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
          if r20
            r22 = _nt_groupExpressionMembers
            s18 << r22
            if r22
              s23, i23 = [], index
              loop do
                r24 = _nt_gap
                if r24
                  s23 << r24
                else
                  break
                end
              end
              r23 = instantiate_node(SyntaxNode,input, i23...index, s23)
              s18 << r23
              if r23
                r25 = _nt_statement
                s18 << r25
                if r25
                  s26, i26 = [], index
                  loop do
                    r27 = _nt_gap
                    if r27
                      s26 << r27
                    else
                      break
                    end
                  end
                  r26 = instantiate_node(SyntaxNode,input, i26...index, s26)
                  s18 << r26
                  if r26
                    r28 = _nt_ELSE
                    s18 << r28
                    if r28
                      s29, i29 = [], index
                      loop do
                        r30 = _nt_gap
                        if r30
                          s29 << r30
                        else
                          break
                        end
                      end
                      r29 = instantiate_node(SyntaxNode,input, i29...index, s29)
                      s18 << r29
                      if r29
                        r31 = _nt_statement
                        s18 << r31
                      end
                    end
                  end
                end
              end
            end
          end
        end
        if s18.last
          r18 = instantiate_node(JavaIf,input, i18...index, s18)
          r18.extend(Statement2)
        else
          @index = i18
          r18 = nil
        end
        if r18
          r0 = r18
        else
          i32, s32 = index, []
          r33 = _nt_IF
          s32 << r33
          if r33
            s34, i34 = [], index
            loop do
              r35 = _nt_gap
              if r35
                s34 << r35
              else
                break
              end
            end
            r34 = instantiate_node(SyntaxNode,input, i34...index, s34)
            s32 << r34
            if r34
              r36 = _nt_groupExpressionMembers
              s32 << r36
              if r36
                s37, i37 = [], index
                loop do
                  r38 = _nt_gap
                  if r38
                    s37 << r38
                  else
                    break
                  end
                end
                r37 = instantiate_node(SyntaxNode,input, i37...index, s37)
                s32 << r37
                if r37
                  r39 = _nt_statement
                  s32 << r39
                end
              end
            end
          end
          if s32.last
            r32 = instantiate_node(JavaIf,input, i32...index, s32)
            r32.extend(Statement3)
          else
            @index = i32
            r32 = nil
          end
          if r32
            r0 = r32
          else
            i40, s40 = index, []
            r41 = _nt_FOR
            s40 << r41
            if r41
              s42, i42 = [], index
              loop do
                r43 = _nt_gap
                if r43
                  s42 << r43
                else
                  break
                end
              end
              r42 = instantiate_node(SyntaxNode,input, i42...index, s42)
              s40 << r42
              if r42
                if has_terminal?("(", false, index)
                  r44 = instantiate_node(SyntaxNode,input, index...(index + 1))
                  @index += 1
                else
                  terminal_parse_failure("(")
                  r44 = nil
                end
                s40 << r44
                if r44
                  s45, i45 = [], index
                  loop do
                    r46 = _nt_gap
                    if r46
                      s45 << r46
                    else
                      break
                    end
                  end
                  r45 = instantiate_node(SyntaxNode,input, i45...index, s45)
                  s40 << r45
                  if r45
                    r48 = _nt_forInitializer
                    if r48
                      r47 = r48
                    else
                      r47 = instantiate_node(SyntaxNode,input, index...index)
                    end
                    s40 << r47
                    if r47
                      s49, i49 = [], index
                      loop do
                        r50 = _nt_gap
                        if r50
                          s49 << r50
                        else
                          break
                        end
                      end
                      r49 = instantiate_node(SyntaxNode,input, i49...index, s49)
                      s40 << r49
                      if r49
                        r52 = _nt_condition
                        if r52
                          r51 = r52
                        else
                          r51 = instantiate_node(SyntaxNode,input, index...index)
                        end
                        s40 << r51
                        if r51
                          s53, i53 = [], index
                          loop do
                            r54 = _nt_gap
                            if r54
                              s53 << r54
                            else
                              break
                            end
                          end
                          r53 = instantiate_node(SyntaxNode,input, i53...index, s53)
                          s40 << r53
                          if r53
                            if has_terminal?(";", false, index)
                              r55 = instantiate_node(SyntaxNode,input, index...(index + 1))
                              @index += 1
                            else
                              terminal_parse_failure(";")
                              r55 = nil
                            end
                            s40 << r55
                            if r55
                              s56, i56 = [], index
                              loop do
                                r57 = _nt_gap
                                if r57
                                  s56 << r57
                                else
                                  break
                                end
                              end
                              r56 = instantiate_node(SyntaxNode,input, i56...index, s56)
                              s40 << r56
                              if r56
                                r59 = _nt_exprList
                                if r59
                                  r58 = r59
                                else
                                  r58 = instantiate_node(SyntaxNode,input, index...index)
                                end
                                s40 << r58
                                if r58
                                  s60, i60 = [], index
                                  loop do
                                    r61 = _nt_gap
                                    if r61
                                      s60 << r61
                                    else
                                      break
                                    end
                                  end
                                  r60 = instantiate_node(SyntaxNode,input, i60...index, s60)
                                  s40 << r60
                                  if r60
                                    if has_terminal?(")", false, index)
                                      r62 = instantiate_node(SyntaxNode,input, index...(index + 1))
                                      @index += 1
                                    else
                                      terminal_parse_failure(")")
                                      r62 = nil
                                    end
                                    s40 << r62
                                    if r62
                                      s63, i63 = [], index
                                      loop do
                                        r64 = _nt_gap
                                        if r64
                                          s63 << r64
                                        else
                                          break
                                        end
                                      end
                                      r63 = instantiate_node(SyntaxNode,input, i63...index, s63)
                                      s40 << r63
                                      if r63
                                        r65 = _nt_statement
                                        s40 << r65
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
            if s40.last
              r40 = instantiate_node(JavaFor,input, i40...index, s40)
              r40.extend(Statement4)
            else
              @index = i40
              r40 = nil
            end
            if r40
              r0 = r40
            else
              i66, s66 = index, []
              r67 = _nt_WHILE
              s66 << r67
              if r67
                s68, i68 = [], index
                loop do
                  r69 = _nt_gap
                  if r69
                    s68 << r69
                  else
                    break
                  end
                end
                r68 = instantiate_node(SyntaxNode,input, i68...index, s68)
                s66 << r68
                if r68
                  r70 = _nt_groupExpressionMembers
                  s66 << r70
                  if r70
                    s71, i71 = [], index
                    loop do
                      r72 = _nt_gap
                      if r72
                        s71 << r72
                      else
                        break
                      end
                    end
                    r71 = instantiate_node(SyntaxNode,input, i71...index, s71)
                    s66 << r71
                    if r71
                      r73 = _nt_statement
                      s66 << r73
                    end
                  end
                end
              end
              if s66.last
                r66 = instantiate_node(JavaWhile,input, i66...index, s66)
                r66.extend(Statement5)
              else
                @index = i66
                r66 = nil
              end
              if r66
                r0 = r66
              else
                i74, s74 = index, []
                r75 = _nt_DO
                s74 << r75
                if r75
                  s76, i76 = [], index
                  loop do
                    r77 = _nt_gap
                    if r77
                      s76 << r77
                    else
                      break
                    end
                  end
                  r76 = instantiate_node(SyntaxNode,input, i76...index, s76)
                  s74 << r76
                  if r76
                    r78 = _nt_statement
                    s74 << r78
                    if r78
                      s79, i79 = [], index
                      loop do
                        r80 = _nt_gap
                        if r80
                          s79 << r80
                        else
                          break
                        end
                      end
                      r79 = instantiate_node(SyntaxNode,input, i79...index, s79)
                      s74 << r79
                      if r79
                        r81 = _nt_WHILE
                        s74 << r81
                        if r81
                          s82, i82 = [], index
                          loop do
                            r83 = _nt_gap
                            if r83
                              s82 << r83
                            else
                              break
                            end
                          end
                          r82 = instantiate_node(SyntaxNode,input, i82...index, s82)
                          s74 << r82
                          if r82
                            r84 = _nt_groupExpressionMembers
                            s74 << r84
                            if r84
                              s85, i85 = [], index
                              loop do
                                r86 = _nt_gap
                                if r86
                                  s85 << r86
                                else
                                  break
                                end
                              end
                              r85 = instantiate_node(SyntaxNode,input, i85...index, s85)
                              s74 << r85
                              if r85
                                if has_terminal?(";", false, index)
                                  r87 = instantiate_node(SyntaxNode,input, index...(index + 1))
                                  @index += 1
                                else
                                  terminal_parse_failure(";")
                                  r87 = nil
                                end
                                s74 << r87
                              end
                            end
                          end
                        end
                      end
                    end
                  end
                end
                if s74.last
                  r74 = instantiate_node(JavaDo,input, i74...index, s74)
                  r74.extend(Statement6)
                else
                  @index = i74
                  r74 = nil
                end
                if r74
                  r0 = r74
                else
                  i88, s88 = index, []
                  r89 = _nt_TRY
                  s88 << r89
                  if r89
                    s90, i90 = [], index
                    loop do
                      r91 = _nt_gap
                      if r91
                        s90 << r91
                      else
                        break
                      end
                    end
                    r90 = instantiate_node(SyntaxNode,input, i90...index, s90)
                    s88 << r90
                    if r90
                      r92 = _nt_block
                      s88 << r92
                      if r92
                        s93, i93 = [], index
                        loop do
                          r94 = _nt_gap
                          if r94
                            s93 << r94
                          else
                            break
                          end
                        end
                        r93 = instantiate_node(SyntaxNode,input, i93...index, s93)
                        s88 << r93
                        if r93
                          r96 = _nt_catches
                          if r96
                            r95 = r96
                          else
                            r95 = instantiate_node(SyntaxNode,input, index...index)
                          end
                          s88 << r95
                          if r95
                            s97, i97 = [], index
                            loop do
                              r98 = _nt_gap
                              if r98
                                s97 << r98
                              else
                                break
                              end
                            end
                            r97 = instantiate_node(SyntaxNode,input, i97...index, s97)
                            s88 << r97
                            if r97
                              r100 = _nt_finally
                              if r100
                                r99 = r100
                              else
                                r99 = instantiate_node(SyntaxNode,input, index...index)
                              end
                              s88 << r99
                            end
                          end
                        end
                      end
                    end
                  end
                  if s88.last
                    r88 = instantiate_node(JavaTry,input, i88...index, s88)
                    r88.extend(Statement7)
                  else
                    @index = i88
                    r88 = nil
                  end
                  if r88
                    r0 = r88
                  else
                    i101, s101 = index, []
                    r102 = _nt_SWITCH
                    s101 << r102
                    if r102
                      s103, i103 = [], index
                      loop do
                        r104 = _nt_gap
                        if r104
                          s103 << r104
                        else
                          break
                        end
                      end
                      r103 = instantiate_node(SyntaxNode,input, i103...index, s103)
                      s101 << r103
                      if r103
                        r105 = _nt_groupExpressionMembers
                        s101 << r105
                        if r105
                          s106, i106 = [], index
                          loop do
                            r107 = _nt_gap
                            if r107
                              s106 << r107
                            else
                              break
                            end
                          end
                          r106 = instantiate_node(SyntaxNode,input, i106...index, s106)
                          s101 << r106
                          if r106
                            if has_terminal?("{", false, index)
                              r108 = instantiate_node(SyntaxNode,input, index...(index + 1))
                              @index += 1
                            else
                              terminal_parse_failure("{")
                              r108 = nil
                            end
                            s101 << r108
                            if r108
                              s109, i109 = [], index
                              loop do
                                r110 = _nt_gap
                                if r110
                                  s109 << r110
                                else
                                  break
                                end
                              end
                              r109 = instantiate_node(SyntaxNode,input, i109...index, s109)
                              s101 << r109
                              if r109
                                r111 = _nt_cases
                                s101 << r111
                                if r111
                                  s112, i112 = [], index
                                  loop do
                                    r113 = _nt_gap
                                    if r113
                                      s112 << r113
                                    else
                                      break
                                    end
                                  end
                                  r112 = instantiate_node(SyntaxNode,input, i112...index, s112)
                                  s101 << r112
                                  if r112
                                    if has_terminal?("}", false, index)
                                      r114 = instantiate_node(SyntaxNode,input, index...(index + 1))
                                      @index += 1
                                    else
                                      terminal_parse_failure("}")
                                      r114 = nil
                                    end
                                    s101 << r114
                                  end
                                end
                              end
                            end
                          end
                        end
                      end
                    end
                    if s101.last
                      r101 = instantiate_node(JavaSwitch,input, i101...index, s101)
                      r101.extend(Statement8)
                    else
                      @index = i101
                      r101 = nil
                    end
                    if r101
                      r0 = r101
                    else
                      i115, s115 = index, []
                      r116 = _nt_SYNCHRONIZED
                      s115 << r116
                      if r116
                        s117, i117 = [], index
                        loop do
                          r118 = _nt_gap
                          if r118
                            s117 << r118
                          else
                            break
                          end
                        end
                        r117 = instantiate_node(SyntaxNode,input, i117...index, s117)
                        s115 << r117
                        if r117
                          r119 = _nt_groupExpressionMembers
                          s115 << r119
                          if r119
                            s120, i120 = [], index
                            loop do
                              r121 = _nt_gap
                              if r121
                                s120 << r121
                              else
                                break
                              end
                            end
                            r120 = instantiate_node(SyntaxNode,input, i120...index, s120)
                            s115 << r120
                            if r120
                              r122 = _nt_block
                              s115 << r122
                            end
                          end
                        end
                      end
                      if s115.last
                        r115 = instantiate_node(JavaSync,input, i115...index, s115)
                        r115.extend(Statement9)
                      else
                        @index = i115
                        r115 = nil
                      end
                      if r115
                        r0 = r115
                      else
                        i123, s123 = index, []
                        r124 = _nt_RETURN
                        s123 << r124
                        if r124
                          s125, i125 = [], index
                          loop do
                            r126 = _nt_gap
                            if r126
                              s125 << r126
                            else
                              break
                            end
                          end
                          r125 = instantiate_node(SyntaxNode,input, i125...index, s125)
                          s123 << r125
                          if r125
                            r128 = _nt_expression
                            if r128
                              r127 = r128
                            else
                              r127 = instantiate_node(SyntaxNode,input, index...index)
                            end
                            s123 << r127
                            if r127
                              s129, i129 = [], index
                              loop do
                                r130 = _nt_gap
                                if r130
                                  s129 << r130
                                else
                                  break
                                end
                              end
                              r129 = instantiate_node(SyntaxNode,input, i129...index, s129)
                              s123 << r129
                              if r129
                                if has_terminal?(";", false, index)
                                  r131 = instantiate_node(SyntaxNode,input, index...(index + 1))
                                  @index += 1
                                else
                                  terminal_parse_failure(";")
                                  r131 = nil
                                end
                                s123 << r131
                              end
                            end
                          end
                        end
                        if s123.last
                          r123 = instantiate_node(JavaReturn,input, i123...index, s123)
                          r123.extend(Statement10)
                        else
                          @index = i123
                          r123 = nil
                        end
                        if r123
                          r0 = r123
                        else
                          i132, s132 = index, []
                          r133 = _nt_THROW
                          s132 << r133
                          if r133
                            s134, i134 = [], index
                            loop do
                              r135 = _nt_gap
                              if r135
                                s134 << r135
                              else
                                break
                              end
                            end
                            r134 = instantiate_node(SyntaxNode,input, i134...index, s134)
                            s132 << r134
                            if r134
                              r136 = _nt_expression
                              s132 << r136
                              if r136
                                s137, i137 = [], index
                                loop do
                                  r138 = _nt_gap
                                  if r138
                                    s137 << r138
                                  else
                                    break
                                  end
                                end
                                r137 = instantiate_node(SyntaxNode,input, i137...index, s137)
                                s132 << r137
                                if r137
                                  if has_terminal?(";", false, index)
                                    r139 = instantiate_node(SyntaxNode,input, index...(index + 1))
                                    @index += 1
                                  else
                                    terminal_parse_failure(";")
                                    r139 = nil
                                  end
                                  s132 << r139
                                end
                              end
                            end
                          end
                          if s132.last
                            r132 = instantiate_node(JavaThrow,input, i132...index, s132)
                            r132.extend(Statement11)
                          else
                            @index = i132
                            r132 = nil
                          end
                          if r132
                            r0 = r132
                          else
                            i140, s140 = index, []
                            r141 = _nt_BREAK
                            s140 << r141
                            if r141
                              i143, s143 = index, []
                              s144, i144 = [], index
                              loop do
                                r145 = _nt_gap
                                if r145
                                  s144 << r145
                                else
                                  break
                                end
                              end
                              if s144.empty?
                                @index = i144
                                r144 = nil
                              else
                                r144 = instantiate_node(SyntaxNode,input, i144...index, s144)
                              end
                              s143 << r144
                              if r144
                                r146 = _nt_identifier
                                s143 << r146
                              end
                              if s143.last
                                r143 = instantiate_node(SyntaxNode,input, i143...index, s143)
                                r143.extend(Statement12)
                              else
                                @index = i143
                                r143 = nil
                              end
                              if r143
                                r142 = r143
                              else
                                r142 = instantiate_node(SyntaxNode,input, index...index)
                              end
                              s140 << r142
                              if r142
                                s147, i147 = [], index
                                loop do
                                  r148 = _nt_gap
                                  if r148
                                    s147 << r148
                                  else
                                    break
                                  end
                                end
                                r147 = instantiate_node(SyntaxNode,input, i147...index, s147)
                                s140 << r147
                                if r147
                                  if has_terminal?(";", false, index)
                                    r149 = instantiate_node(SyntaxNode,input, index...(index + 1))
                                    @index += 1
                                  else
                                    terminal_parse_failure(";")
                                    r149 = nil
                                  end
                                  s140 << r149
                                end
                              end
                            end
                            if s140.last
                              r140 = instantiate_node(JavaBreak,input, i140...index, s140)
                              r140.extend(Statement13)
                            else
                              @index = i140
                              r140 = nil
                            end
                            if r140
                              r0 = r140
                            else
                              i150, s150 = index, []
                              r151 = _nt_CONTINUE
                              s150 << r151
                              if r151
                                i153, s153 = index, []
                                s154, i154 = [], index
                                loop do
                                  r155 = _nt_gap
                                  if r155
                                    s154 << r155
                                  else
                                    break
                                  end
                                end
                                if s154.empty?
                                  @index = i154
                                  r154 = nil
                                else
                                  r154 = instantiate_node(SyntaxNode,input, i154...index, s154)
                                end
                                s153 << r154
                                if r154
                                  r156 = _nt_identifier
                                  s153 << r156
                                end
                                if s153.last
                                  r153 = instantiate_node(SyntaxNode,input, i153...index, s153)
                                  r153.extend(Statement14)
                                else
                                  @index = i153
                                  r153 = nil
                                end
                                if r153
                                  r152 = r153
                                else
                                  r152 = instantiate_node(SyntaxNode,input, index...index)
                                end
                                s150 << r152
                                if r152
                                  s157, i157 = [], index
                                  loop do
                                    r158 = _nt_gap
                                    if r158
                                      s157 << r158
                                    else
                                      break
                                    end
                                  end
                                  r157 = instantiate_node(SyntaxNode,input, i157...index, s157)
                                  s150 << r157
                                  if r157
                                    if has_terminal?(";", false, index)
                                      r159 = instantiate_node(SyntaxNode,input, index...(index + 1))
                                      @index += 1
                                    else
                                      terminal_parse_failure(";")
                                      r159 = nil
                                    end
                                    s150 << r159
                                  end
                                end
                              end
                              if s150.last
                                r150 = instantiate_node(JavaContinue,input, i150...index, s150)
                                r150.extend(Statement15)
                              else
                                @index = i150
                                r150 = nil
                              end
                              if r150
                                r0 = r150
                              else
                                i160, s160 = index, []
                                i161, s161 = index, []
                                r162 = _nt_identifier
                                s161 << r162
                                if r162
                                  s163, i163 = [], index
                                  loop do
                                    r164 = _nt_gap
                                    if r164
                                      s163 << r164
                                    else
                                      break
                                    end
                                  end
                                  r163 = instantiate_node(SyntaxNode,input, i163...index, s163)
                                  s161 << r163
                                  if r163
                                    if has_terminal?(":", false, index)
                                      r165 = instantiate_node(SyntaxNode,input, index...(index + 1))
                                      @index += 1
                                    else
                                      terminal_parse_failure(":")
                                      r165 = nil
                                    end
                                    s161 << r165
                                  end
                                end
                                if s161.last
                                  r161 = instantiate_node(SyntaxNode,input, i161...index, s161)
                                  r161.extend(Statement16)
                                else
                                  @index = i161
                                  r161 = nil
                                end
                                s160 << r161
                                if r161
                                  s166, i166 = [], index
                                  loop do
                                    r167 = _nt_gap
                                    if r167
                                      s166 << r167
                                    else
                                      break
                                    end
                                  end
                                  r166 = instantiate_node(SyntaxNode,input, i166...index, s166)
                                  s160 << r166
                                  if r166
                                    r168 = _nt_statement
                                    s160 << r168
                                  end
                                end
                                if s160.last
                                  r160 = instantiate_node(SyntaxNode,input, i160...index, s160)
                                  r160.extend(Statement17)
                                else
                                  @index = i160
                                  r160 = nil
                                end
                                if r160
                                  r0 = r160
                                else
                                  i169, s169 = index, []
                                  r170 = _nt_expression
                                  s169 << r170
                                  if r170
                                    s171, i171 = [], index
                                    loop do
                                      r172 = _nt_gap
                                      if r172
                                        s171 << r172
                                      else
                                        break
                                      end
                                    end
                                    r171 = instantiate_node(SyntaxNode,input, i171...index, s171)
                                    s169 << r171
                                    if r171
                                      if has_terminal?(";", false, index)
                                        r173 = instantiate_node(SyntaxNode,input, index...(index + 1))
                                        @index += 1
                                      else
                                        terminal_parse_failure(";")
                                        r173 = nil
                                      end
                                      s169 << r173
                                    end
                                  end
                                  if s169.last
                                    r169 = instantiate_node(JavaExpr,input, i169...index, s169)
                                    r169.extend(Statement18)
                                  else
                                    @index = i169
                                    r169 = nil
                                  end
                                  if r169
                                    r0 = r169
                                  else
                                    if has_terminal?(";", false, index)
                                      r174 = instantiate_node(JavaSemicolumn,input, index...(index + 1))
                                      @index += 1
                                    else
                                      terminal_parse_failure(";")
                                      r174 = nil
                                    end
                                    if r174
                                      r0 = r174
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
                    end
                  end
                end
              end
            end
          end
        end
      end
    end

    node_cache[:statement][start_index] = r0

    r0
  end

  module Catches0
    def catch
      elements[1]
    end
  end

  module Catches1
    def catch
      elements[0]
    end

  end

  def _nt_catches
    start_index = index
    if node_cache[:catches].has_key?(index)
      cached = node_cache[:catches][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_catch
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
          r6 = _nt_catch
          s3 << r6
        end
        if s3.last
          r3 = instantiate_node(SyntaxNode,input, i3...index, s3)
          r3.extend(Catches0)
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
      r0.extend(Catches1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:catches][start_index] = r0

    r0
  end

  module Catch0
    def CATCH
      elements[0]
    end

    def type
      elements[4]
    end

    def name
      elements[6]
    end

    def body
      elements[10]
    end
  end

  def _nt_catch
    start_index = index
    if node_cache[:catch].has_key?(index)
      cached = node_cache[:catch][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_CATCH
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
        if has_terminal?("(", false, index)
          r4 = instantiate_node(SyntaxNode,input, index...(index + 1))
          @index += 1
        else
          terminal_parse_failure("(")
          r4 = nil
        end
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
            r7 = _nt_type
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
              if s8.empty?
                @index = i8
                r8 = nil
              else
                r8 = instantiate_node(SyntaxNode,input, i8...index, s8)
              end
              s0 << r8
              if r8
                r10 = _nt_identifier
                s0 << r10
                if r10
                  s11, i11 = [], index
                  loop do
                    r12 = _nt_gap
                    if r12
                      s11 << r12
                    else
                      break
                    end
                  end
                  r11 = instantiate_node(SyntaxNode,input, i11...index, s11)
                  s0 << r11
                  if r11
                    if has_terminal?(")", false, index)
                      r13 = instantiate_node(SyntaxNode,input, index...(index + 1))
                      @index += 1
                    else
                      terminal_parse_failure(")")
                      r13 = nil
                    end
                    s0 << r13
                    if r13
                      s14, i14 = [], index
                      loop do
                        r15 = _nt_gap
                        if r15
                          s14 << r15
                        else
                          break
                        end
                      end
                      r14 = instantiate_node(SyntaxNode,input, i14...index, s14)
                      s0 << r14
                      if r14
                        r16 = _nt_block
                        s0 << r16
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
    if s0.last
      r0 = instantiate_node(JavaCatch,input, i0...index, s0)
      r0.extend(Catch0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:catch][start_index] = r0

    r0
  end

  module Finally0
    def FINALLY
      elements[0]
    end

    def body
      elements[2]
    end
  end

  def _nt_finally
    start_index = index
    if node_cache[:finally].has_key?(index)
      cached = node_cache[:finally][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_FINALLY
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
        r4 = _nt_block
        s0 << r4
      end
    end
    if s0.last
      r0 = instantiate_node(JavaFinally,input, i0...index, s0)
      r0.extend(Finally0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:finally][start_index] = r0

    r0
  end

  module Cases0
    def case
      elements[1]
    end
  end

  module Cases1
    def case
      elements[0]
    end

  end

  def _nt_cases
    start_index = index
    if node_cache[:cases].has_key?(index)
      cached = node_cache[:cases][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_case
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
          r6 = _nt_case
          s3 << r6
        end
        if s3.last
          r3 = instantiate_node(SyntaxNode,input, i3...index, s3)
          r3.extend(Cases0)
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
      r0.extend(Cases1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:cases][start_index] = r0

    r0
  end

  module CaseBreak0
    def BREAK
      elements[0]
    end

  end

  def _nt_case_break
    start_index = index
    if node_cache[:case_break].has_key?(index)
      cached = node_cache[:case_break][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_BREAK
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
        if has_terminal?(";", false, index)
          r4 = instantiate_node(SyntaxNode,input, index...(index + 1))
          @index += 1
        else
          terminal_parse_failure(";")
          r4 = nil
        end
        s0 << r4
      end
    end
    if s0.last
      r0 = instantiate_node(JavaBreak,input, i0...index, s0)
      r0.extend(CaseBreak0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:case_break][start_index] = r0

    r0
  end

  module Case0
    def case_break
      elements[1]
    end
  end

  module Case1
    def CASE
      elements[0]
    end

    def expression
      elements[2]
    end

    def body
      elements[6]
    end

    def break
      elements[7]
    end
  end

  module Case2
    def DEFAULT
      elements[0]
    end

    def body
      elements[4]
    end
  end

  def _nt_case
    start_index = index
    if node_cache[:case].has_key?(index)
      cached = node_cache[:case][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    i1, s1 = index, []
    r2 = _nt_CASE
    s1 << r2
    if r2
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
      s1 << r3
      if r3
        r5 = _nt_expression
        s1 << r5
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
          r6 = instantiate_node(SyntaxNode,input, i6...index, s6)
          s1 << r6
          if r6
            if has_terminal?(":", false, index)
              r8 = instantiate_node(SyntaxNode,input, index...(index + 1))
              @index += 1
            else
              terminal_parse_failure(":")
              r8 = nil
            end
            s1 << r8
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
              s1 << r9
              if r9
                r11 = _nt_statement
                s1 << r11
                if r11
                  i13, s13 = index, []
                  s14, i14 = [], index
                  loop do
                    r15 = _nt_gap
                    if r15
                      s14 << r15
                    else
                      break
                    end
                  end
                  r14 = instantiate_node(SyntaxNode,input, i14...index, s14)
                  s13 << r14
                  if r14
                    r16 = _nt_case_break
                    s13 << r16
                  end
                  if s13.last
                    r13 = instantiate_node(SyntaxNode,input, i13...index, s13)
                    r13.extend(Case0)
                  else
                    @index = i13
                    r13 = nil
                  end
                  if r13
                    r12 = r13
                  else
                    r12 = instantiate_node(SyntaxNode,input, index...index)
                  end
                  s1 << r12
                end
              end
            end
          end
        end
      end
    end
    if s1.last
      r1 = instantiate_node(JavaCase,input, i1...index, s1)
      r1.extend(Case1)
    else
      @index = i1
      r1 = nil
    end
    if r1
      r0 = r1
    else
      i17, s17 = index, []
      r18 = _nt_DEFAULT
      s17 << r18
      if r18
        s19, i19 = [], index
        loop do
          r20 = _nt_gap
          if r20
            s19 << r20
          else
            break
          end
        end
        r19 = instantiate_node(SyntaxNode,input, i19...index, s19)
        s17 << r19
        if r19
          if has_terminal?(":", false, index)
            r21 = instantiate_node(SyntaxNode,input, index...(index + 1))
            @index += 1
          else
            terminal_parse_failure(":")
            r21 = nil
          end
          s17 << r21
          if r21
            s22, i22 = [], index
            loop do
              r23 = _nt_gap
              if r23
                s22 << r23
              else
                break
              end
            end
            r22 = instantiate_node(SyntaxNode,input, i22...index, s22)
            s17 << r22
            if r22
              r24 = _nt_statement
              s17 << r24
            end
          end
        end
      end
      if s17.last
        r17 = instantiate_node(JavaCase,input, i17...index, s17)
        r17.extend(Case2)
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

    node_cache[:case][start_index] = r0

    r0
  end

  module ForInitializer0
    def type
      elements[0]
    end

    def variables
      elements[2]
    end

  end

  module ForInitializer1
    def variables
      elements[0]
    end

  end

  def _nt_forInitializer
    start_index = index
    if node_cache[:forInitializer].has_key?(index)
      cached = node_cache[:forInitializer][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0 = index
    i1, s1 = index, []
    r2 = _nt_type
    s1 << r2
    if r2
      s3, i3 = [], index
      loop do
        r4 = _nt_gap
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
      s1 << r3
      if r3
        r5 = _nt_variables
        s1 << r5
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
          r6 = instantiate_node(SyntaxNode,input, i6...index, s6)
          s1 << r6
          if r6
            if has_terminal?(";", false, index)
              r8 = instantiate_node(SyntaxNode,input, index...(index + 1))
              @index += 1
            else
              terminal_parse_failure(";")
              r8 = nil
            end
            s1 << r8
          end
        end
      end
    end
    if s1.last
      r1 = instantiate_node(JavaLocalVariables,input, i1...index, s1)
      r1.extend(ForInitializer0)
    else
      @index = i1
      r1 = nil
    end
    if r1
      r0 = r1
    else
      i9, s9 = index, []
      r10 = _nt_variables
      s9 << r10
      if r10
        s11, i11 = [], index
        loop do
          r12 = _nt_gap
          if r12
            s11 << r12
          else
            break
          end
        end
        r11 = instantiate_node(SyntaxNode,input, i11...index, s11)
        s9 << r11
        if r11
          if has_terminal?(";", false, index)
            r13 = instantiate_node(SyntaxNode,input, index...(index + 1))
            @index += 1
          else
            terminal_parse_failure(";")
            r13 = nil
          end
          s9 << r13
        end
      end
      if s9.last
        r9 = instantiate_node(JavaLocalVariables,input, i9...index, s9)
        r9.extend(ForInitializer1)
      else
        @index = i9
        r9 = nil
      end
      if r9
        r0 = r9
      else
        if has_terminal?(";", false, index)
          r14 = instantiate_node(SyntaxNode,input, index...(index + 1))
          @index += 1
        else
          terminal_parse_failure(";")
          r14 = nil
        end
        if r14
          r0 = r14
        else
          @index = i0
          r0 = nil
        end
      end
    end

    node_cache[:forInitializer][start_index] = r0

    r0
  end

  module ExprList0
    def comma
      elements[0]
    end

    def exprListItem
      elements[1]
    end
  end

  module ExprList1
    def exprListItem
      elements[0]
    end

  end

  def _nt_exprList
    start_index = index
    if node_cache[:exprList].has_key?(index)
      cached = node_cache[:exprList][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_exprListItem
    s0 << r1
    if r1
      s2, i2 = [], index
      loop do
        i3, s3 = index, []
        r4 = _nt_comma
        s3 << r4
        if r4
          r5 = _nt_exprListItem
          s3 << r5
        end
        if s3.last
          r3 = instantiate_node(SyntaxNode,input, i3...index, s3)
          r3.extend(ExprList0)
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
      r0.extend(ExprList1)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:exprList][start_index] = r0

    r0
  end

  module ExprListItem0
    def expression
      elements[0]
    end

  end

  def _nt_exprListItem
    start_index = index
    if node_cache[:exprListItem].has_key?(index)
      cached = node_cache[:exprListItem][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_expression
    s0 << r1
    if r1
      if has_terminal?('', false, index)
        r2 = instantiate_node(SyntaxNode,input, index...(index + 0))
        @index += 0
      else
        terminal_parse_failure('')
        r2 = nil
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(JavaNode,input, i0...index, s0)
      r0.extend(ExprListItem0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:exprListItem][start_index] = r0

    r0
  end

  module Condition0
    def expression
      elements[0]
    end

  end

  def _nt_condition
    start_index = index
    if node_cache[:condition].has_key?(index)
      cached = node_cache[:condition][index]
      if cached
        cached = SyntaxNode.new(input, index...(index + 1)) if cached == true
        @index = cached.interval.end
      end
      return cached
    end

    i0, s0 = index, []
    r1 = _nt_expression
    s0 << r1
    if r1
      if has_terminal?('', false, index)
        r2 = instantiate_node(SyntaxNode,input, index...(index + 0))
        @index += 0
      else
        terminal_parse_failure('')
        r2 = nil
      end
      s0 << r2
    end
    if s0.last
      r0 = instantiate_node(JavaNode,input, i0...index, s0)
      r0.extend(Condition0)
    else
      @index = i0
      r0 = nil
    end

    node_cache[:condition][start_index] = r0

    r0
  end

end

class JavaExpressionParser < Treetop::Runtime::CompiledParser
  include JavaExpression
end



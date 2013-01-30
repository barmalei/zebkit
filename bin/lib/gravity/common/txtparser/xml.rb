require 'gravity/common/txtparser/parser'

TXTPARSER::TREE('xml') {
  MEMBER(:_comment, '<!--', "-->")
  MEMBER(:_single_tag, '<' , '/>')
  MEMBER(:_tag, '<' , /<\/\s*[a-zA-Z0-9_-]+\s*>/)
  MEMBER(:_doctag, '<?' , '?>')
  MEMBER(:_tagname, /[a-zA-Z_][a-zA-Z0-9_-]*(:[a-zA-Z_][a-zA-Z0-9_-]*)?/)
  MEMBER(:_attribute, /[a-zA-Z_][a-zA-Z0-9_-]*\s*=\s*\"[^\"]*\"/)
  MEMBER(:_close_tag, '>')
  MEMBER(:_body, nil)
  MEMBER(:_if_text, /[^<>]*(<|>)/)
  MEMBER(:_text, /[^<>]*/)
  MEMBER(:_group_tags, nil)
  MEMBER(:_if_single_tag, /<\s*[a-zA-Z0-9_\-]+[^<>]*\/>/)
  MEMBER(:_if_tag, /<\s*[a-zA-Z0-9_\-]+[^<>]*[^\/]>/)

  DEF_ERASE {
    _comment '*'
  }

  DEF_TREE {
    _doctag '*'

    _group_tags('*', :u){

      _if_single_tag('*') {
        _single_tag('*') {
          _tagname
          _attribute '*'
        }
      }

      _if_tag ('*'){
        _tag('?') {
          _tagname
          _attribute '*'
          _close_tag
          _if_text('?') {
            _text '?'
          }
          _group_tags '*', :r
        }
      }
    }
  }
}


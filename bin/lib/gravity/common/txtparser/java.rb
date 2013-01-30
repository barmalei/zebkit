require 'gravity/common/txtparser/parser'

TXTPARSER::TREE('java') {
  MEMBER(:_comment, "/*", "*/")
  MEMBER(:_lcomment, "//", /$/)
  MEMBER(:_package, /^package[ ]+([a-zA-Z_\.]+)[ ]*;/)
  MEMBER(:_import, /^import[ ]+.*[ ]*;/)
  MEMBER(:_section, "{", "}")
  MEMBER(:_class_section, "{", "}")
  MEMBER(:_method, /(public\s+|private\s+|protected\s+)?\w+\s+(\s*\[\s*\]\s+)?\w+\s*\(.*\)/)
  MEMBER(:_constructor, /(public\s+|private\s+|protected\s+)?\w+\s*\(.*\)/)
  MEMBER(:_class, /\s*(public\s+|protected\s+)?(class|interface)\s+(\w+)[^\{]*\{/, '}')
  MEMBER(:_field, /.*=.*;/)

  DEF_ERASE {
    _comment '*'
    _lcomment '*'
  }

  DEF_TREE {
    _package'?'
    _import'*'
    _class('+',:u) {
   # _class_section(:u) {
      _field '*'
      _constructor '*'
      _section('*') {
        _section('*', :r)
      }
      _method('*')
    }
  }
}


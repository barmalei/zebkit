require 'gravity/common/txtparser/parser'


TXTPARSER::TREE('properties') {
  MEMBER(:_comment, '#', /$/)
  MEMBER(:_property, /(\w+(.\w+)*)=(.*)\n/ , '')

  DEF_ERASE {
    _comment '*'
  }

  DEF_TREE {
    _property '*'
  }
}


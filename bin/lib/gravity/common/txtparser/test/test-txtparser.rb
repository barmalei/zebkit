require 'gravity/common/txtparser/parser'

TXTPARSER::TREE('test') {
  MEMBER(:_section, '{', '}')
  MEMBER(:_name, /[a-zA-Z]+/)
  MEMBER(:_comment, '/*', '*/')
  MEMBER(:_lcomment, '//', /$/)

  DEF_ERASE {
    _comment  '*'
    _lcomment '*'
  }

  DEF_TREE {
    _section('*') {
      _name '?'
      _section '*', :r
    }
  }
}

TXTPARSER.TREE('test').MATCH(File.new('test.txt', 'r')) { |context|
  puts "#{context.member.id} : --#{context.buffer}--"
}





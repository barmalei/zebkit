require 'gravity/common/txtparser/properties'

TXTPARSER.TREE('properties').MATCH('lw.properties') { |context|
  puts "#{context.member.id} : #{context.buffer}"
}



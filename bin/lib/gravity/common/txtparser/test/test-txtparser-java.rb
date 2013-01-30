require 'gravity/common/txtparser/java'

puts ">>>>>>>>> start at:#{Time.new()}"

TXTPARSER.TREE('java').MATCH('JComponent.java') { |context|
  puts "--#{context.buffer} -- #{context.lineno} " if context.member.id == '_method'
}

puts "<<<<<<<<< end at:#{Time.new()}"

#TXTPARSER.TREE('java').MATCH('NCanvas.java') { |context|
 # puts "#{context.member.id}: #{context.buffer}" if context.member.id == '_method' }

#TXTPARSER.TREE('java').root.dump

#TXTPARSER.TREE('java').MATCH('Grid.java') { |context|
 # puts context.buffer if context.member.id == '_method'
#}


#TXTPARSER.TREE('java').root.dump

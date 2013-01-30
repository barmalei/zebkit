require 'gravity/common/txtparser/xml.rb'

TXTPARSER.TREE('xml').is_debug = true
TXTPARSER.TREE('xml').MATCH('test.xml') { |context|
 # id = context.member.id
  #if id == '_tagname' ||  id == '_attribute' || id == '_text' || id == '_if_text'
  #  puts "#{id} : #{context.buffer}"
  #end
}



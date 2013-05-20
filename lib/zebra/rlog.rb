#!/usr/bin/ruby

require 'cgi'


COMMANDS = {
	"log" => true,
	"tail" => true,
	"clear" => true
}

MAX_LOG_SIZE = 1000000

cgi = CGI.new()

begin
	puts cgi.header

	raise "Content length is out of the limit" if cgi.has_key?("content_length") || cgi["content_length"].to_i > 1000


	apikey = cgi.params["apikey"].to_s
	apikey = apikey.chomp()
	raise "Invalid API key format" if /[0-9]+/.match(apikey).nil?
	if apikey != "19751975"
		raise "Unknown API key" if !File.exists?(apikey) || File.directory?(apikey) 
		raise "Expired API key" if (File.mtime(apikey) - Time.new) > 1 * 60 * 60
	end

	raise "Unknown command" if !cgi.params.has_key?("command")
	command = cgi.params["command"].to_s.chomp()
	raise  "Unsupported command" if !COMMANDS.has_key?(command)

	fname = "#{apikey}.log"


	raise "File size limit is " if File.exists?(fname) && File.size(fname) > MAX_LOG_SIZE


	if command == "clear"
		File.delete(fname) if File.exists?(fname)
	else
		if command == "log"
			raise "Message to be logged cannot be found" if !cgi.params.has_key?("message")

			File.open(fname, 'a+') {|f| 
				message = cgi.params["message"]	
				
				level   = []  
				level   = cgi.params["level"] if cgi.params.has_key?("level") 

				time   = []  
				time   = cgi.params["time"] if cgi.params.has_key?("time")

				message.each_index() { |i|
					m = message[i]
					raise "Content length is out of the limit" if  m.length > 1000

					if level.length <= i  
						l = "info"
					else
						l = level[i];
					end

					if time.length <= i
						t = Time.new.to_s	
					else
						t = time[i] 
					end

					f.write("\n#{l.upcase} : [ #{t} ] :  #{m}") 
				}
			}
	
			puts "0"
		else 
			if command = "tail"
				if File.exists?(fname)  
					if cgi.params.has_key?("startline")
						startline = cgi.params["startline"].to_s.to_i
					else
						startline = 0	
					end

					lines = File.readlines(fname)
					if startline >= lines.length
						puts "0 #{lines.length}"
					else
						r = lines[startline, lines.length].join("")
						puts "#{lines.length - startline - 1} #{lines.length}#{r}"
					end
				else
					puts "0"
				end
			end			
		end

	end
rescue
	puts "-1"
	puts "#{$!}"
end




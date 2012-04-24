from __future__ import with_statement
import os, xmlrpclib, datetime, re, traceback, sys, logging, pickle, SocketServer
from DocXMLRPCServer import DocXMLRPCServer, DocXMLRPCRequestHandler
from SimpleHTTPServer import SimpleHTTPRequestHandler    

class RequestHandler(DocXMLRPCRequestHandler, SimpleHTTPRequestHandler):
    #
    #  Implementing HTTP handshake
    #
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-METHODS", "POST,GET,OPTIONS")
        self.send_header("Content-length", "0")
        self.end_headers()
        
    #
    #  work as HTTP server if GET
    #    
    def do_GET(self):
        return SimpleHTTPRequestHandler.do_GET(self)
        
    #
    # Part of HTTP handshake
    #
    def end_headers(self):
       self.send_header("Access-Control-Allow-Origin", "*")
       DocXMLRPCRequestHandler.end_headers(self)
    
        
def START():
    host = "localhost"
    print("Listen host:" + host)
    server = DocXMLRPCServer((host, 8080), RequestHandler)
    server.serve_forever()
    
if __name__ == '__main__': 
    START()
    

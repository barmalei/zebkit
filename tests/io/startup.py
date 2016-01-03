from __future__ import with_statement

import os, xmlrpclib, datetime, sys, SocketServer
#sys.path.insert(0, os.path.join(os.path.normpath(os.path.dirname(os.path.abspath(sys.argv[0]))), 'lib'))

from DocXMLRPCServer import DocXMLRPCServer, DocXMLRPCRequestHandler
from SimpleXMLRPCServer import SimpleXMLRPCServer
from SimpleXMLRPCServer import SimpleXMLRPCDispatcher
from SimpleHTTPServer import SimpleHTTPRequestHandler
from SocketServer import TCPServer
from threading import Thread

from jsonrpclib.SimpleJSONRPCServer import SimpleJSONRPCRequestHandler
from jsonrpclib.SimpleJSONRPCServer import SimpleJSONRPCDispatcher


class XRPCRequestHandler(DocXMLRPCRequestHandler, SimpleHTTPRequestHandler):
    rpc_paths = ('/xrpc',)

    #  Implementing HTTP handshake
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Methods", "POST,GET,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-length", "0")
        self.end_headers()

    #  work as HTTP server if GET
    def do_GET(self):
#        return "!!!!"
        return SimpleHTTPRequestHandler.do_GET(self)

    # Part of HTTP handshake
    def end_headers(self):
       self.send_header("Access-Control-Allow-Origin", "*")
       DocXMLRPCRequestHandler.end_headers(self)

class JRPCRequestHandler(SimpleJSONRPCRequestHandler, SimpleHTTPRequestHandler):
    rpc_paths = ('/jrpc')

    #  Implementing HTTP handshake
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Methods", "POST,GET,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-length", "0")
        self.end_headers()

    #  work as HTTP server if GET
    def do_GET(self):
        return SimpleHTTPRequestHandler.do_GET(self)

    # Part of HTTP handshake
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        SimpleJSONRPCRequestHandler.end_headers(self)

class JRPCServer(TCPServer, SimpleJSONRPCDispatcher):
    def __init__(self, addr=("localhost", 8080)):
        self.logRequests = False
        SimpleJSONRPCDispatcher.__init__(self, encoding=None)
        TCPServer.__init__(self, addr, JRPCRequestHandler)


def summ(a, b):
    print("%d + %d" % (a, b))
    return a + b

def echo(s):
    print("echo %s" % s)
    return s

def fault(s):
    raise "Exception"

def wdate(s):
    raise "Exception"

def struct(s1, s2):
    r = {};
    print(s1);
    r["a"] = s1
    r["b"] = [s1, s2]
    r["c"] = True
    print(r);
    return r

def arr():
    return [ 1, [2, 3], [ "ABC", [ {"k":"MMM"} ], True ], [] ]


def reg_srv_methods(server):
    server.register_function(summ, "summ")
    server.register_function(echo, "echo")
    server.register_function(fault, "fault")
    server.register_function(struct, "struct")
    server.register_function(arr, "arr")

def START(host = "localhost", port = 8080):
    class AsyncDocXMLRPCServer(SocketServer.ThreadingMixIn, DocXMLRPCServer): pass
    class AsyncJRPCServer(SocketServer.ThreadingMixIn, JRPCServer): pass

    server1 = DocXMLRPCServer((host, port), XRPCRequestHandler)
    server2 = JRPCServer((host, port + 1))
    reg_srv_methods(server1);
    reg_srv_methods(server2);

    class ST(Thread):
        def __init__(self, server, msg):
            Thread.__init__(self);
            self.daemon = True
            self.server = server
            self.msg = msg
            self.start()

        def run(self):
            self.server.serve_forever()

    print("Start zebkit demo HTTP Server %s:%d" % (host, port))
    #server1.serve_forever()

    ST(server1, "Start XML-RPC Server %s:%d" % (host, port))
    print("Start JSON-RPC Server %s:%d" % (host, port + 1))
    server2.serve_forever()

if __name__ == '__main__':
    os.chdir("../../")
    START(host="192.168.178.11", port=8090)
    #START(host="192.168.3.46")
    #START(host="10.26.214.170")

    #START(host="192.168.178.11", port=8090)
    #START("192.168.1.11")

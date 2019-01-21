from threading import Thread
import sys, urlparse
from SocketServer import ThreadingMixIn
from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler
sys.path.append('/home/pi/barmen-app/python/scale_scripts')
import scales as scales

scaleVar = "scale="

class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    pass

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        parsed_path = urlparse.urlparse(self.path).query

        scaleNumber = parsed_path[parsed_path.find(scaleVar) + len(scaleVar)]
        print('Server: Request: Scale number ' + scaleNumber)
        data = scales.getWeight(scaleNumber)
        weight = data.astype(str)
        print('Server: Scale number ' + scaleNumber + ': Weight ' + weight)

        self.wfile.write(weight)

def serve_on_port(port):
    server = ThreadingHTTPServer(("localhost", port), Handler)
    server.serve_forever()

try :
    scales.setupScales()
    print('Server: Access http://localhost:9000')
    serve_on_port(9000)
except KeyboardInterrupt :
    print "\nServer: Shutting down...\n"
    scales.cleanAndExit()
except Exception as exc :
    print "Server: Error:\n"
    print exc
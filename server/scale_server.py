from threading import Thread
import sys, urlparse
from SocketServer import ThreadingMixIn
from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler
sys.path.append('/home/pi/barmen-app/python/scale_scripts')
import gpio_routine as gpio

from time import sleep

kScaleLabel = 'scale'
kVolumeLabel = 'volume'
kSuccessResponse = "OK"
kFailureResponse = "FAIL"

class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    pass

class Handler(BaseHTTPRequestHandler):

    def do_GET(self):
        # query = urlparse.urlparse(self.path).query
        query_components = urlparse.parse_qs(urlparse.urlparse(self.path).query)
        scaleNumber = next(iter(query_components[kScaleLabel] or []), None)
        volume = next(iter(query_components[kVolumeLabel] or []), None)
        print('Server: Request: Scale number ' + scaleNumber + ' Volume: ' + volume)
        if scaleNumber != None and volume != None:
            gpio.pour(scaleNumber, volume)
            self.sendSuccess()
        else:
            self.sendError()

    def sendSuccess(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(kSuccessResponse.encode())

    def sendError(self):
        self.send_response(404)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(kFailureResponse .encode())

def serve_on_port(port):
    server = ThreadingHTTPServer(("localhost", port), Handler)
    server.serve_forever()

try :
    gpio.setupScales()
    print('Server: Access http://localhost:9000')
    serve_on_port(9000)

except KeyboardInterrupt :
    print "\nServer: Shutting down...\n"
    gpio.cleanAndExit()
except Exception as exc :
    print "Server: Error:\n"
    print exc
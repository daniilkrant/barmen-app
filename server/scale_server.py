import sys, urlparse, json
from threading import Thread
from SocketServer import ThreadingMixIn
from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler
sys.path.append('/home/pi/barmen-app/python/scale_scripts')
from gpio_routine import PourRoutine

kScaleLabel = 'scale'
kVolumeLabel = 'volume'
kSuccessResponse = "OK"
kFailureResponse = "FAIL"

pouring = PourRoutine()

class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    pass

class Handler(BaseHTTPRequestHandler):

    def do_GET(self):
        query_components = urlparse.parse_qs(urlparse.urlparse(self.path).query)
        scaleNumber = next(iter(query_components[kScaleLabel] or []), None)
        volume = next(iter(query_components[kVolumeLabel] or []), None)
        print('Server: Request: Scale number ' + scaleNumber + ' Volume: ' + volume)
        if scaleNumber != None and volume != None:
            pouring.pour(scaleNumber, volume)
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
    with open('/home/pi/barmen-app/server/barmen_pinout.cfg') as f:
        config = json.load(f)

    pump_pins = config['Pumps']['pins']
    scale_pin_pairs = []
    
    for i in xrange(3):
        dout = config['Scales']['dout'][i]
        sck = config['Scales']['sck'][i]
        scale_pin_pairs.append((dout, sck))

    pouring.setupScales(scale_pin_pairs, pump_pins)
    print('Server: Access http://localhost:9000')
    serve_on_port(9000)

except KeyboardInterrupt :
    print "\nServer: Shutting down...\n"
    pouring.cleanAndExit()
except Exception as exc :
    print "Server: Error:\n"
    print exc
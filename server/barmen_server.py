import sys, urlparse, json
from threading import Thread
from SocketServer import ThreadingMixIn
from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler
from gpio_routine import PourRoutine
from wifi_routine import WiFiRoutine

kScaleLabel = 'scale'
kVolumeLabel = 'volume'
kWifiLabel = 'wifi'
kSsidLabel = 'ssid'
kPassLabel = 'pass'
kIndexLabel = 'index'
kSuccessResponse = "OK"
kFailureResponse = "FAIL"

pouring = PourRoutine()
wifi = WiFiRoutine()

class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    pass

class Handler(BaseHTTPRequestHandler):

    def do_GET(self):
        query_components = urlparse.parse_qs(urlparse.urlparse(self.path).query)
        index = query_components.get(kIndexLabel, None)
        volume = query_components.get(kVolumeLabel, None)
        if index != None and volume != None:
            pouring.setVolume(index[0], volume[0])
            self.sendSuccess()
            return
        isWifi = query_components.get(kWifiLabel, None)
        if isWifi != None:
            res = wifi.scan()
            self.sendSuccessRes(res)
            return
        ssid = query_components.get(kSsidLabel, None)
        passw = query_components.get(kPassLabel, None)
        if ssid != None and passw != None:
            wifi.saveSSID(ssid[0], passw[0])
            self.sendSuccess()
            return
        scaleNumber = query_components.get(kScaleLabel, None)
        volume = query_components.get(kVolumeLabel, None)
        if scaleNumber != None and volume != None:
            res = pouring.pour(scaleNumber[0], int(volume[0]))
            self.sendSuccessRes(res)
        else:
            self.sendError()

    def sendSuccess(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(kSuccessResponse.encode())

    def sendSuccessRes(self, res):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(str(res).encode())

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
    print("\nServer: Shutting down...\n")
    pouring.cleanAndExit()
except Exception as exc :
    print("Server: Error:\n")
    print(exc)

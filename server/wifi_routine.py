import subprocess
import json

class WiFiRoutine(object):
    def __init__(self):
        pass

    def scan(self):
        bashCommand = "sudo iwlist wlan0 scan | grep SSID | awk -F: '{print $2}' | tr -d '\"'"
        output = subprocess.check_output(['bash','-c', bashCommand])
        ssidList = output.split()
        return json.dumps(ssidList)

    def saveSSID(self, ssid, passw):
        f = open("/etc/wpa_supplicant/wpa_supplicant.conf","w+")
        conf = "ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\n\
update_config=1\ncountry=us\nnetwork={\n\
    ssid=\"%s\"\n\
    psk=\"%s\"\n\
}" % (ssid[0], passw[0])
        f.write(conf)
        bashCommand = "sudo shutdown -r -h now"
        output = subprocess.check_output(['bash','-c', bashCommand])
import RPi.GPIO as GPIO
import time
import sys
from hx711 import HX711

class PourRoutine(object):
    def __init__(self):
        self.scalesAmount = 3
        self.scaleList = []
        self.gpioList = []

    def cleanAndExit(self):
        print "Server: Cleaning..."
        GPIO.cleanup()
        print "Server: Bye!"
        sys.exit()

    # GPIO pins
    def setupScales(self, scale_pin_pairs, pump_pins):
        print('Server: ----------------------')
        print('Server: Creating scale objects')
        for dout, sck in scale_pin_pairs:
            self.scaleList.append(HX711(dout, sck))
            print('Server: Created scale')
        print('Server: Scale objects created!')

        print('Server: ----------------------')

        print('Server: Setting pumps pins')
        for pin in pump_pins:
            self.gpioList.append(pin)
            print('Server: Created pump')
        print('Server: Pumps pins setted!')

        print('Server: ----------------------')

        for i in xrange(self.scalesAmount):
            self.scaleList[i].set_reading_format("MSB", "MSB")

        # HOW TO CALCULATE THE REFFERENCE UNIT
        # To set the reference unit to 1. Put 1kg on your sensor or anything you have and know exactly how much it weights.
        # In this case, 92 is 1 gram because, with 1 as a reference unit I got numbers near 0 without any weight
        # and I got numbers around 184000 when I added 2kg. So, according to the rule of thirds:
        # If 2000 grams is 184000 then 1000 grams is 184000 / 2000 = 92.
        #scale1.set_reference_unit(1)
        for i in xrange(self.scalesAmount):
            self.scaleList[i].set_reference_unit(2005)
            self.scaleList[i].reset()
            self.scaleList[i].tare()

    def getWeight(self, index):
        val = self.scaleList[index].get_weight(7)
        self.scaleList[index].power_down()
        self.scaleList[index].power_up()
        return val

    #blocking
    def pour(self, index, volume):
        i_index = int(index) - 1

        GPIO.setup(self.gpioList[i_index], GPIO.OUT)
        GPIO.output(self.gpioList[i_index], GPIO.HIGH)
        time.sleep(3)
        GPIO.output(self.gpioList[i_index], GPIO.LOW)

        # i_index = int(index)

        # current_level = self.getWeight(i_index)
        # GPIO.setup(self.gpioList[i_index], GPIO.OUT)
        # GPIO.output(self.gpioList[i_index], GPIO.HIGH)
        # while True:
        #     if getWeight(i_index) <= (current_level - volume):
        #         # GPIO.output(gpioList[i_index], GPIO.LOW)
        #         break
        #     else:
        #         sleep(0.01)




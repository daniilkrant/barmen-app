import RPi.GPIO as GPIO
import time
import sys
from hx711 import HX711 

trigger_on = GPIO.LOW
trigger_off = GPIO.HIGH

class Bottle(object):
    def __init__(self):
        self.total_volume = 0
        self.poured = 0
        self.needsToRefill = False

class PourRoutine(object):
    def __init__(self):
        GPIO.setmode(GPIO.BCM)
        self.scalesAmount = 3
        self.scaleList = []
        self.gpioList = []
        self.bottleList = []

    def cleanAndExit(self):
        print("Server: Cleaning...")
        GPIO.cleanup()
        print("Server: Bye!")
        sys.exit()

    # GPIO pins
    def setupScales(self, scale_pin_pairs, pump_pins):

        for i in xrange(self.scalesAmount):
            self.bottleList.append(Bottle())

        print('Server: ----------------------')
        print('Server: Creating scale objects')
        for dout, sck in scale_pin_pairs:
            self.scaleList.append(HX711(dout, sck))
            print('Server: Created scale')
        try:
            for i in xrange(self.scalesAmount):
                self.scaleList[i].zero()
                self.scaleList[i].set_scale_ratio(1090)
        except Exception as exc :
            print(exc)
        print('Server: Scale objects created!')

        print('Server: ----------------------')

        print('Server: Setting pumps pins')
        for pin in pump_pins:
            self.gpioList.append(pin)
            print('Server: Created pump')
        print('Server: Pumps pins setted!')        

        print('Server: ----------------------')

        while True:
            res = input('Bottle ')
            self.pour(res, 50)

    def getWeight(self, index):
        val = self.scaleList[index].get_weight_mean(2)
        return val

    #blocking
    def pour(self, index, portion):
        i_index = int(index) - 1

        # while True:
        #     print self.getWeight(i_index)

        # GPIO.setup(self.gpioList[i_index], GPIO.OUT)
        # GPIO.output(self.gpioList[i_index], trigger_on)
        # time.sleep(1)
        # GPIO.output(self.gpioList[i_index], trigger_off)

        self.bottleList[i_index].poured = self.getWeight(i_index) * -1
        print(self.bottleList[i_index].poured)
        # if self.bottleList[i_index].poured > self.bottleList[i_index].total_volume - portion:
        #     return -1
        GPIO.setup(self.gpioList[i_index], GPIO.OUT)
        GPIO.output(self.gpioList[i_index], trigger_on)

        while True:
            curr = self.getWeight(i_index) * -1
            if curr >= (self.bottleList[i_index].poured + portion):
                GPIO.output(self.gpioList[i_index], trigger_off)
                print('Done')
                return (self.bottleList[i_index].total_volume - self.bottleList[i_index].poured)
            else:
                time.sleep(0.01)
                print(curr)





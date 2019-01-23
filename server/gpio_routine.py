import RPi.GPIO as GPIO
import time
import sys
from hx711 import HX711

scalesAmount = 3

scaleList=[]
gpioList=[]

# GPIO pins
print('Server: Setting scales')
scaleList.append(HX711(21, 22))
gpioList.append(12)
print('Server: First scales created!')
scaleList.append(HX711(23, 24))
gpioList.append(13)
print('Server: Second scales created!')
scaleList.append(HX711(27, 28))
gpioList.append(14)
print('Server: Third scales created!')

def cleanAndExit():
    print "Server: Cleaning..."
    GPIO.cleanup()
    print "Server: Bye!"
    sys.exit()

def setupScales():
    # I've found out that, for some reason, the order of the bytes is not always the same between versions of python, numpy and the hx711 itself.
    # Still need to figure out why does it change.
    # If you're experiencing super random values, change these values to MSB or LSB until to get more stable values.
    # There is some code below to debug and log the order of the bits and the bytes.
    # The first parameter is the order in which the bytes are used to build the "long" value.
    # The second paramter is the order of the bits inside each byte.
    # According to the HX711 Datasheet, the second parameter is MSB so you shouldn't need to modify it.
    for i in xrange(scalesAmount):
        scaleList[i].set_reading_format("MSB", "MSB")

    # HOW TO CALCULATE THE REFFERENCE UNIT
    # To set the reference unit to 1. Put 1kg on your sensor or anything you have and know exactly how much it weights.
    # In this case, 92 is 1 gram because, with 1 as a reference unit I got numbers near 0 without any weight
    # and I got numbers around 184000 when I added 2kg. So, according to the rule of thirds:
    # If 2000 grams is 184000 then 1000 grams is 184000 / 2000 = 92.
    #scale1.set_reference_unit(1)
    for i in xrange(scalesAmount):
        scaleList[i].set_reference_unit(2005)
        scaleList[i].reset()
        scaleList[i].tare()

def getWeight(index):
    val = scaleList[index].get_weight(7)
    scaleList[index].power_down()
    scaleList[index].power_up()
    return val

#blocking
def pour(index, volume):
    i_index = int(index)

    current_level = getWeight(i_index)
    GPIO.setup(gpioList[i_index], GPIO.OUT)
    GPIO.output(gpioList[i_index], GPIO.HIGH)

    time.sleep(3)

    # while True:
    #     if getWeight(i_index) <= (current_level - volume):
    #         # GPIO.output(gpioList[i_index], GPIO.LOW)
    #         break
    #     else:
    #         sleep(0.01)




import RPi.GPIO as GPIO
import time
import sys
from hx711 import HX711

# GPIO pins
print('Server: Setting scales')
scale1 = HX711(21, 22)
print('Server: First scales created!')
scale2 = HX711(23, 24)
print('Server: Second scales created!')
scale3 = HX711(27, 28)
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
    scale1.set_reading_format("MSB", "MSB")
    scale2.set_reading_format("MSB", "MSB")
    scale3.set_reading_format("MSB", "MSB")

    # HOW TO CALCULATE THE REFFERENCE UNIT
    # To set the reference unit to 1. Put 1kg on your sensor or anything you have and know exactly how much it weights.
    # In this case, 92 is 1 gram because, with 1 as a reference unit I got numbers near 0 without any weight
    # and I got numbers around 184000 when I added 2kg. So, according to the rule of thirds:
    # If 2000 grams is 184000 then 1000 grams is 184000 / 2000 = 92.
    #scale1.set_reference_unit(2005)
    scale1.set_reference_unit(2005)
    scale2.set_reference_unit(2005)
    scale3.set_reference_unit(2005)

    scale1.reset()
    scale1.tare()

    scale2.reset()
    scale2.tare()
    
    scale3.reset()
    scale3.tare()

def getFirstWeight():
    #val_A = hx.get_weight_A(5)
    val = scale1.get_weight(7)
    scale1.power_down()
    scale1.power_up()
    return val

def getSecondWeight():
    #val_A = hx.get_weight_A(5)
    val = scale2.get_weight(7)
    scale2.power_down()
    scale2.power_up()
    return val

def getThirdWeight():
    #val_A = hx.get_weight_A(5)
    val = scale3.get_weight(7)
    scale3.power_down()
    scale3.power_up()
    return val

def getWeight(index):
    if index == '1':
        return getFirstWeight()
    if index == '2':
        return getSecondWeight()
    if index == '3':
        return getThirdWeight()

var gpio = require("pi-gpio");
var consts = require('./consts')

exports.startPouring = function(drink_name) {
    var gpioPin = consts.pinsMap.get(drink_name)
    console.log('Pin ' + gpioPin)

    gpio.open(gpioPin, "output", function(err) {
        console.log('GPIO pin '+ gpioPin +' is open.');
        gpio.write(gpioPin, 1, function(err) {})
    });
}

exports.stopPouring = function(drink_name) {
    var gpioPin = consts.pinsMap.get(drink_name)
    console.log('Pin ' + gpioPin)

    gpio.close(gpioPin)
}
#!/bin/bash

export DISPLAY=:2
export ELECTRON_ENABLE_LOGGING=true
unclutter -idle 0 &
cd /home/pi/barmen-app/
npm start
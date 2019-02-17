#!/bin/bash

export DISPLAY=:0
export ELECTRON_ENABLE_LOGGING=true
unclutter -idle 0 &
python /home/pi/barmen-app/server/barmen_server.py &
cd /home/pi/barmen-app/
npm start
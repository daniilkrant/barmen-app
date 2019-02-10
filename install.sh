#!/bin/bash

cd /tmp
wget https://nodejs.org/dist/v8.2.1/node-v8.2.1-linux-armv7l.tar.xz
tar xfv node-v8.2.1-linux-armv7l.tar.xz
cd node-v8.2.1-linux-armv7l
sudo cp -R * /usr/local/

sudo apt-get -y install unclutter
npm install superagent

sudo cp barmen.service
sudo mkdir /etc/conf
sudo cp server/barmen_pinout.cfg
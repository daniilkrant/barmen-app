const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const http = require('http')
const superagent = require('superagent');
const consts = require('./js/consts')
const {ipcMain} = require('electron')
const VirtualKeyboard = require('electron-virtual-keyboard');

var barmenWindow = null
var musicWindow = null
var wifiWindow = null
var serverAddr = 'http://127.0.0.1:9000'
var portion = 50
let vkb

var bottles = [{fullVolume: 500, currentVolume: 500},{fullVolume: 750, currentVolume: 750}, {fullVolume: 1000, currentVolume: 1000}]

app.once('ready', () => {
  function initBottlesFirstTime() {
      barmenWindow.webContents.send('enableRefillModal', 0);
      barmenWindow.webContents.send('initFirstBottle', 0);
      ipcMain.on('initFirstBottleResponse', (event, arg) => {
          console.log("First bottle volume " + arg);
          bottles[0].fullVolume = arg
          bottles[0].currentVolume = arg
          barmenWindow.webContents.send('initSecondBottle', 0);
      })
      ipcMain.on('initSecondBottleResponse', (event, arg) => {
          console.log("Second bottle volume " + arg);
          bottles[1].fullVolume = arg
          bottles[1].currentVolume = arg
          barmenWindow.webContents.send('initThirdBottle', 0);
      })
      ipcMain.on('initThirdBottleResponse', (event, arg) => {
          console.log("Third bottle volume " + arg);
          bottles[2].fullVolume = arg
          bottles[2].currentVolume = arg
          barmenWindow.webContents.send('disableRefillModal', 0);
          barmenWindow.webContents.send('setBottle1Volume', bottles[0].fullVolume);
          barmenWindow.webContents.send('setBottle2Volume', bottles[1].fullVolume);
          barmenWindow.webContents.send('setBottle3Volume', bottles[2].fullVolume);
      })
  }
   
  barmenWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: 800,
    height: 480,  
    show: false,
    resizable: false,
    frame: false,
    toolbar: false,
    transparent: true
  })

  barmenWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  barmenWindow.once('ready-to-show', () => {
    barmenWindow.maximize()
    barmenWindow.show()
    initBottlesFirstTime()
  })

  barmenWindow.on('closed', () => {
    win = null
  })

  ipcMain.on('save-wifi-pressed', (event, arg) => {
    superagent.get(serverAddr)
        .query({ssid: arg.name, pass: arg.pass})
        .buffer(true)
        .then((res, err) => {
            if (err) { return console.log(err); }
            console.log(res.text)
            wifiWindow.hide()
            barmenWindow.show()
        });
  })

  ipcMain.on('bottle-pressed', (event, scale_num) => {
    barmenWindow.webContents.send('showPouringModal', 0);

    superagent.get(serverAddr)
        .query({scale: scale_num, volume: portion})
        .buffer(true)
        .then((res, err) => {
            if (err) { return console.log(err); }
            console.log(res.text)
            barmenWindow.webContents.send('hidePouringModal', 0);
        });

    bottles[scale_num-1].currentVolume -= portion
    var percent = Math.round(bottles[scale_num-1].currentVolume / (bottles[scale_num-1].fullVolume / 100))
    console.log(percent)
    barmenWindow.webContents.send('setBottleVolume', {index: scale_num, percent: percent});
  })

  ipcMain.on('music-pressed', (event, arg) => {
      console.log('music-pressed');

      if (musicWindow == null) {
        musicWindow = new BrowserWindow({
            x: 0,
            y: 0,
            width: 800,
            height: 480,  
            show: false,
            resizable: false,
            frame: false,
            toolbar: false,
            transparent: true
        })

        musicWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'player', 'index.html'),
            protocol: 'file:',
            slashes: true
          }))
      } else {
        musicWindow.maximize()
        musicWindow.show()
      }

      musicWindow.once('ready-to-show', () => {
        barmenWindow.hide()
        musicWindow.show()
        musicWindow.webContents.send('initRadio', 0);
      })
  })

  ipcMain.on('wifi-pressed', (event, arg) => {
    console.log('wifi-pressed');

    if (wifiWindow == null) {
      wifiWindow = new BrowserWindow({
          x: 0,
          y: 0,
          width: 800,
          height: 480,  
          show: false,
          resizable: false,
          frame: false,
          toolbar: false,
          transparent: true
      })

      wifiWindow.loadURL(url.format({
          pathname: path.join(__dirname, 'wifi-conf', 'index.html'),
          protocol: 'file:',
          slashes: true
        }))
    } else {
      wifiWindow.maximize()
      wifiWindow.show()
    }

    wifiWindow.once('ready-to-show', () => {
      barmenWindow.hide()
      wifiWindow.show()
      wifiWindow.webContents.setFrameRate(30)
      vkb = new VirtualKeyboard(wifiWindow.webContents);
    })
})

  ipcMain.on('barmen-pressed', (event, arg) => {
    console.log('barmen-pressed');
    musicWindow.hide()
    barmenWindow.show()
  })

})
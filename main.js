const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const http = require('http')
const superagent = require('superagent');
const consts = require('./js/consts')
const {ipcMain} = require('electron')
const VirtualKeyboard = require('./wifi-conf/kbd/main')

let vkb

var barmenWindow = null
var musicWindow = null
var wifiWindow = null
var videoWindow = null
var serverAddr = 'http://127.0.0.1:9000'
var portion = 50

var bottles = [{fullVolume: 500, currentVolume: 500},{fullVolume: 750, currentVolume: 750}, {fullVolume: 1000, currentVolume: 1000}]

app.once('ready', () => {
  function initBottlesFirstTime() {
      barmenWindow.webContents.send('enableRefillModal', 0);
      barmenWindow.webContents.send('initFirstBottle', 0);
      ipcMain.on('initFirstBottleResponse', (event, arg) => {
          console.log("First bottle volume " + arg);
          superagent.get(serverAddr)
              .query({index: 1, volume: arg})
              .then((res, err) => {
                if (err) { return console.log(err); }});
          barmenWindow.webContents.send('initSecondBottle', 0);
      })
      ipcMain.on('initSecondBottleResponse', (event, arg) => {
          console.log("Second bottle volume " + arg);
          superagent.get(serverAddr)
              .query({index: 2, volume: arg})
              .then((res, err) => {
                if (err) { return console.log(err); }});
          barmenWindow.webContents.send('initThirdBottle', 0);
      })
      ipcMain.on('initThirdBottleResponse', (event, arg) => {
          console.log("Third bottle volume " + arg);
          superagent.get(serverAddr)
              .query({index: 3, volume: arg})
              .then((res, err) => {
                if (err) { return console.log(err); }});
          barmenWindow.webContents.send('disableRefillModal', 0);
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
        });
        wifiWindow.hide()
        barmenWindow.show()
  })

  ipcMain.on('bottle-pressed', (event, scale_num) => {
    barmenWindow.webContents.send('showPouringModal', 0);
    console.log(scale_num)

    let currentPortion = portion
    if (scale_num === 3) {
        currentPortion = portion * 2
    }

    superagent.get(serverAddr)
        .query({scale: scale_num, volume: currentPortion})
        .buffer(true)
        .then((res, err) => {
            if (err) { return console.log(err); }
            if(res.text.indexOf('Empty') > -1) {
                console.log('Blocking bottle: ' + scale_num)
                barmenWindow.webContents.send('blockBottle', {index: scale_num})
            }
            barmenWindow.webContents.send('hidePouringModal', 0);
        });
  })

  ipcMain.on('blockBottleResponse', (event, data) => {
    superagent.get(serverAddr)
        .query({index: data.index, volume: data.volume})
        .buffer(true)
        .then((res, err) => {
            barmenWindow.webContents.send('disableRefillModal', 0);
        });
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

  ipcMain.on('userIdle', (event, arg) => {
    console.log('userIdle');

    if (videoWindow == null) {
      videoWindow = new BrowserWindow({
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

      videoWindow.loadURL(url.format({
          pathname: path.join(__dirname, 'video', 'index.html'),
          protocol: 'file:',
          slashes: true
        }))
    } else {
      videoWindow.maximize()
      videoWindow.show()
    }

    videoWindow.once('ready-to-show', () => {
      videoWindow.show()
      videoWindow.webContents.send('userIdlePlay', 0);
    })

  })

  ipcMain.on('userBack', (event, arg) => {
    videoWindow.hide()
    videoWindow.webContents.send('userIdlePlay', 0);
  })

})

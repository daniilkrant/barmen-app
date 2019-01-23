const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const http = require('http')
const superagent = require('superagent');
const consts = require('./js/consts')
const {ipcMain} = require('electron')

let window = null
let musicWindow = null
var serverAddr = 'http://localhost:9000'

class Bottle {
    constructor(full_volume, poured, position, is_pouring, current_level) {
      this._full_volume = full_volume;
      this._poured = poured;
      this._position = position;
      this._is_pouring = is_pouring;
      this._current_level = current_level;
    }
  
    get fullVolume() {
      return this._full_volume;
    }

    get poured() {
        return this._poured;
    }

    get position() {
        return this._full_volume;
    }

    get isPouring() {
        return this._is_pouring;
    }

    get currentLevel() {
        return this._current_level;
    }

    set fullVolume(newValue) {
        this._full_volume = newValue;
    }

    set poured(newValue) {
        this._poured = newValue;
    }

    set position(newValue) {
        this._full_volume = newValue;
    }

    set isPouring(newValue) {
        this._is_pouring = newValue;
    }

    set currentLevel(newValue) {
        this._current_level = newValue;
    }
};

var isInited = false;

var bottle1 = new Bottle(0, 0, 1, false, 0)
var bottle2 = new Bottle(0, 0, 2, false, 0)
var bottle3 = new Bottle(0, 0, 3, false, 0)

app.once('ready', () => {
  function initBottlesFirstTime() {
      window.webContents.send('enableRefillModal', 0);
      window.webContents.send('initFirstBottle', 0);
      ipcMain.on('initFirstBottleResponse', (event, arg) => {
          console.log("First bottle volume " + arg);
          bottle1.fullVolume = arg
          window.webContents.send('initSecondBottle', 0);
      })
      ipcMain.on('initSecondBottleResponse', (event, arg) => {
          console.log("Second bottle volume " + arg);
          bottle2.fullVolume = arg
          window.webContents.send('initThirdBottle', 0);
      })
      ipcMain.on('initThirdBottleResponse', (event, arg) => {
          console.log("Third bottle volume " + arg);
          bottle3.fullVolume = arg
          window.webContents.send('disableRefillModal', 0);
          window.webContents.send('setBottle1Volume', bottle1.fullVolume);
          window.webContents.send('setBottle2Volume', bottle2.fullVolume);
          window.webContents.send('setBottle3Volume', bottle3.fullVolume);
      })
  }
   
  window = new BrowserWindow({
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

  window.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  window.once('ready-to-show', () => {
    window.maximize()
    window.show()
    initBottlesFirstTime()
  })

  window.on('closed', () => {
    win = null
  })

  ipcMain.on('bottle-pressed', (event, scale_num) => {
    window.webContents.send('showPouringModal', 0);

    superagent.get(serverAddr)
    .query({scale: scale_num, volume: '50'})
    .buffer(true)
    .then((res, err) => {
        if (err) { return console.log(err); }
        console.log(res.text)
        window.webContents.send('hidePouringModal', 0);
    });

  })

  ipcMain.on('music-pressed', (event, arg) => {
    console.log('music-pressed');
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
        pathname: path.join(__dirname, 'player/howler.js/examples/player', 'index.html'),
        protocol: 'file:',
        slashes: true
      }))
    
      musicWindow.once('ready-to-show', () => {
        window.hide()
        musicWindow.maximize()
        musicWindow.show()
      })
  })

})


// Start pouring
// window   -->   main  -->   gpio_routine
//     button_pres     gpio

// Stop pouring
// gpio_routine   -->   main   -->   window
//               done          done
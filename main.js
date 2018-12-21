const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const gpio = require('./js/gpio_routine')
const consts = require('./js/consts')
const {ipcMain} = require('electron')
const {PythonShell} = require("python-shell")

let window = null
let scale1py
var scale1pyPath = 'hx711py/scale1.py'
var pyShellOptions = {
    mode: 'text',
    pythonOptions: ['-u'],
    pythonPath: '/usr/bin/python',
};

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
  
  function lauchFirstScaleScript() {
      window.webContents.send('enableInitingModal', 0);  
      scale1py = new PythonShell(scale1pyPath, pyShellOptions);
      scale1py.on('message', function (weight) {
          if (isInited === false) {
              window.webContents.send('disableInitingModal', 0);
              initBottlesFirstTime();
              isInited = true;
          } else {
              bottle1.poured = (weight * (-1) | 0);
              console.log("bottle1.poured: " + bottle1.poured);
              if (bottle1.isPouring) {
                console.log("poured: " + bottle1.poured + " currentLevel: " + bottle1.currentLevel +  " portion: " + consts.portionMl)
                if (bottle1.poured < (bottle1.currentLevel + consts.portionMl)) {
                } else {
                    gpio.stopPouring(consts.bottle1Name)
                    window.webContents.send('hidePouringModal', 0);
                    bottle1.isPouring = false;
                }
              }
            }
      });
  }

  function startFirstBottleStopping() {
      let currentLevel = bottle1.poured;
      while (bottle1.poured < (currentLevel + 50)) {
      }
      gpio.stopPouring(consts.bottle1Name)
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
    lauchFirstScaleScript()
  })

  window.on('closed', () => {
    win = null
  })

  ipcMain.on('bottle-pressed', (event, arg) => {
    console.log(arg);
    if (arg === 1) {
        window.webContents.send('showPouringModal', 0);
        bottle1.currentLevel = bottle1.poured;
        gpio.startPouring(consts.bottle1Name)
        bottle1.isPouring = true;
    }
    if (arg === 2) {
        gpio.startPouring(consts.bottle2Name)
        window.webContents.send('showPouringModal', 0);
    }
    if (arg === 3) {
        gpio.startPouring(consts.bottle3Name)
        window.webContents.send('showPouringModal', 0);
    }
  })
})


// Start pouring
// window   -->   main  -->   gpio_routine
//     button_pres     gpio

// Stop pouring
// gpio_routine   -->   main   -->   window
//               done          done
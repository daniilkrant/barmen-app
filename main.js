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
    constructor(full_volume, diff, position) {
      this._full_volume = full_volume;
      this._diff = diff;
      this._position = position;
    }
  
    get fullVolume() {
      return this._full_volume;
    }

    get diff() {
        return this._diff;
    }

    get position() {
        return this._full_volume;
    }

    set fullVolume(newValue) {
        this._full_volume = newValue;
    }

    set diff(newValue) {
        this._diff = newValue;
    }

    set position(newValue) {
        this._full_volume = newValue;
    }  
};

var isInited = false;

var bottle1 = new Bottle(0, 0, 1)
var bottle2 = new Bottle(0, 0, 2)
var bottle3 = new Bottle(0, 0, 3)

app.once('ready', () => {

function lauchScaleScripts() {    
    scale1py = new PythonShell(scale1pyPath, pyShellOptions);
    scale1py.on('message', function (weight) {
        console.log("Weight: " + weight);
        if (isInited === false) {
            window.webContents.send('disableInitingModal', 0);
            initBottles();
            isInited = true;
        } else {
            bottle1.diff = weight;
        }
    });
}

function initBottles() {
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
    lauchScaleScripts()
    window.maximize()
    window.show()
  })

  window.on('closed', () => {
    win = null
  })

  ipcMain.on('bottle-pressed', (event, arg) => {
    console.log(arg);
    if (arg === 1)
        gpio.startPouring(consts.bottle1Name)
    if (arg === 2)
        gpio.startPouring(consts.bottle2Name)
    if (arg === 3)
        gpio.startPouring(consts.bottle3Name)
  })
})


// Start pouring
// window   -->   main  -->   gpio_routine
//     button_pres     gpio

// Stop pouring
// gpio_routine   -->   main   -->   window
//               done          done
const {ipcRenderer} = require('electron')

var keyboard = $('input:text').keyboard({
    theme: "theme-black",
    autoPosition: false
});

const saveBtn = document.getElementById("save_wifi")
const ssidField = document.getElementById("ssid")
const passField = document.getElementById("pswd")

saveBtn.addEventListener('click', function() {
    let ssid = ssidField.value
    let pswd = passField.value
    ipcRenderer.send('save-wifi-pressed', {name: ssid, pass: pswd})
})
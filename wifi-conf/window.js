const {ipcRenderer} = require('electron')
const superagent = require('superagent');

const serverAddr = 'http://127.0.0.1:9000';

var keyboard = $('input:text').keyboard({
    theme: "theme-black",
    autoPosition: false
});

let defaultOption = document.createElement('option');
let dropdown = document.getElementById('wifi-dropdown');
const saveBtn = document.getElementById("save_wifi")
const updBtn = document.getElementById("update_wifi")
const passField = document.getElementById("pswd")

dropdown.length = 0;
defaultOption.text = 'Choose SSID';
dropdown.add(defaultOption);
dropdown.selectedIndex = 0;

saveBtn.addEventListener('click', function() {
    let ssid = dropdown.options[dropdown.selectedIndex].text
    let pswd = passField.value
    ipcRenderer.send('save-wifi-pressed', {name: ssid, pass: pswd})
})

updBtn.addEventListener('click', function() {
    getWifiList()
})

function getWifiList() {
    superagent.get(serverAddr)
    .query({wifi: 'get'})
    .buffer(true)
    .then((res, err) => {
        if (err) { return console.log(err); }
        const data = JSON.parse(res.text);
        dropdown.innerText = null
        let option;
        for (let i = 0; i < data.length; i++) {
          option = document.createElement('option');
          option.text = data[i];
          dropdown.add(option);
        }
    });
}

getWifiList()


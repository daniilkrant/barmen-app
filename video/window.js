window.onload = function() {
const {ipcRenderer} = require('electron')
const video = document.getElementById("barmen_video")

ipcRenderer.on('userIdlePlay', (event, arg) => {
    video.play()
})

video.addEventListener('click', function() {
    console.log("Click")
    video.pause()
    ipcRenderer.send('userBack', 1)
})
}


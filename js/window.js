window.onload = function() {
const {ipcRenderer} = require('electron')

const bottle1Btn = document.getElementById("bottle1_btn")
const bottle2Btn = document.getElementById("bottle2_btn")
const bottle3Btn = document.getElementById("bottle3_btn")

const bottle1Txt = document.getElementById("bottle1_txt")
const bottle2Txt = document.getElementById("bottle2_txt")
const bottle3Txt = document.getElementById("bottle3_txt")

const blockerModal = document.getElementById('blocker_modal');
const waitingModal = document.getElementById('preparing_modal');
const chooseVolumeModal = document.getElementById('choose_volume_modal');
const bottleNumberLabel = document.getElementById('choose_volume_bottle_number');

const firstVolumeBtn = document.getElementById("first_volume_btn")
const secondVolumeBtn = document.getElementById("second_volume_btn")
const thirdVolumeBtn = document.getElementById("third_volume_btn")
const fourthVolumeBtn = document.getElementById("fourth_volume_btn")

const musicBtn = document.getElementById("music_button")

chooseVolumeModal.style.display = "none";
waitingModal.style.display = "none";

let ipc_cb
let initing_bottle_index

function showBlocker() {
    blockerModal.style.display = "block";
}

function hideBlocker() {
    blockerModal.style.display = "none";
}

function volumeBtnEvent(button) {
    let amount
    if (button === 1) {amount = 500}
    if (button === 2) {amount = 700}
    if (button === 3) {amount = 1000}
    if (button === 4) {amount = 1500}

    if (initing_bottle_index === 1) {
        ipc_cb.sender.send('initFirstBottleResponse', amount)
    }
    if (initing_bottle_index === 2) {
        ipc_cb.sender.send('initSecondBottleResponse', amount)
    }
    if (initing_bottle_index === 3) {
        ipc_cb.sender.send('initThirdBottleResponse', amount)
    }
}

firstVolumeBtn.addEventListener('click', function() {
    volumeBtnEvent(1)
})

secondVolumeBtn.addEventListener('click', function() {
    volumeBtnEvent(2)
})

thirdVolumeBtn.addEventListener('click', function() {
    volumeBtnEvent(3)
})

fourthVolumeBtn.addEventListener('click', function() {
    volumeBtnEvent(4)
})

musicBtn.addEventListener('click', function() {
    ipcRenderer.send('music-pressed', 1)
})

ipcRenderer.on('disableInitingModal', function(event , data) {
    waitingModal.style.display = "none";
});

ipcRenderer.on('enableInitingModal', function(event , data) {
    waitingModal.style.display = "block";
});

ipcRenderer.on('enableRefillModal', function(event , data) {
    chooseVolumeModal.style.display = "block";
});

ipcRenderer.on('disableRefillModal', function(event , data) {
    chooseVolumeModal.style.display = "none";
});

ipcRenderer.on('initFirstBottle', function(cb , data) {
    bottleNumberLabel.innerHTML = "Bottle 1 volume";
    ipc_cb = cb;
    initing_bottle_index = 1;
});

ipcRenderer.on('initSecondBottle', function(cb , data) {
    bottleNumberLabel.innerHTML = "Bottle 2 volume";
    ipc_cb = cb;
    initing_bottle_index = 2;
});

ipcRenderer.on('initThirdBottle', function(cb , data) {
    bottleNumberLabel.innerHTML = "Bottle 3 volume";
    ipc_cb = cb;
    initing_bottle_index = 3;
});

ipcRenderer.on('setBottle1Volume', function(cb , data) {
    bottle1Txt.innerHTML = data;
});

ipcRenderer.on('setBottle2Volume', function(cb , data) {
    bottle2Txt.innerHTML = data;
});

ipcRenderer.on('setBottle3Volume', function(cb , data) {
    bottle3Txt.innerHTML = data;
});

ipcRenderer.on('setBottleVolume', function(cb , data) {
    if (data.index == 1)
        bottle1Txt.innerHTML = data.percent + "%";
    if (data.index == 2)
        bottle2Txt.innerHTML = data.percent + "%";
    if (data.index == 3)
        bottle3Txt.innerHTML = data.percent + "%";
});

ipcRenderer.on('showPouringModal', function(cb , data) {
    showBlocker();
});

ipcRenderer.on('hidePouringModal', function(cb , data) {
    hideBlocker();
});

bottle1Btn.addEventListener('click', function () {
    ipcRenderer.send('bottle-pressed', 1)
});

bottle2Btn.addEventListener('click', function () {
    ipcRenderer.send('bottle-pressed', 2)
});

bottle3Btn.addEventListener('click', function () {
    ipcRenderer.send('bottle-pressed', 3)
});

}

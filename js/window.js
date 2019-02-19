window.onload = function() {
const {ipcRenderer} = require('electron')

var jQuery = $ = require('jquery');

const bottle1Btn = document.getElementById("bottle1_btn")
const bottle2Btn = document.getElementById("bottle2_btn")
const bottle3Btn = document.getElementById("bottle3_btn")

const bottle1Sts = document.getElementById("bottle1_status")
const bottle2Sts = document.getElementById("bottle2_status")
const bottle3Sts = document.getElementById("bottle3_status")

const blockerModal = document.getElementById('blocker_modal');
const waitingModal = document.getElementById('preparing_modal');
const chooseVolumeModal = document.getElementById('choose_volume_modal');
const bottleNumberLabel = document.getElementById('choose_volume_bottle_number');

const firstVolumeBtn = document.getElementById("first_volume_btn")
const secondVolumeBtn = document.getElementById("second_volume_btn")
const thirdVolumeBtn = document.getElementById("third_volume_btn")
const fourthVolumeBtn = document.getElementById("fourth_volume_btn")

const musicBtn = document.getElementById("music_button")
const wifiBtn = document.getElementById("wifi_button")

chooseVolumeModal.style.display = "none";
waitingModal.style.display = "none";

let ipc_cb
let initing_bottle_index
let status, refill_index
let is_refilling = false

var inactivityTime = function () {
    var t;
    window.onload = resetTimer;
    // DOM Events
    document.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onmousedown = resetTimer;
    document.ontouchstart = resetTimer;
    document.onclick = resetTimer;
    document.onkeypress = resetTimer;

    function logout() {
        ipcRenderer.send('userIdle', 0)
    }

    function resetTimer() {
        clearTimeout(t);
        t = setTimeout(logout, 10000)
        // 1000 milisec = 1 sec
    }
};
inactivityTime()

function showBlocker() {
    blockerModal.style.display = "block";
}

function hideBlocker() {
    blockerModal.style.display = "none";
}

function volumeBtnEvent(button) {
    let amount
    if (button === 1) {amount = 500}
    if (button === 2) {amount = 750}
    if (button === 3) {amount = 1000}
    if (button === 4) {amount = 1500}

    if (status === 0) {
        ipcRenderer.send('blockBottleResponse', {index: refill_index, volume: amount})
    } else {
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

wifiBtn.addEventListener('click', function() {
    ipcRenderer.send('wifi-pressed', 1)
})

ipcRenderer.on('init', function(e, d) {
    bottle1Sts.disabled = true;
    bottle2Sts.disabled = true;
    bottle3Sts.disabled = true;
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
    status = 1
    bottleNumberLabel.innerHTML = "Bottle 1 volume";
    ipc_cb = cb;
    initing_bottle_index = 1;
});

ipcRenderer.on('initSecondBottle', function(cb , data) {
    status = 1
    bottleNumberLabel.innerHTML = "Bottle 2 volume";
    ipc_cb = cb;
    initing_bottle_index = 2;
});

ipcRenderer.on('initThirdBottle', function(cb , data) {
    status = 1
    bottleNumberLabel.innerHTML = "Bottle 3 volume";
    ipc_cb = cb;
    initing_bottle_index = 3;
});

ipcRenderer.on('blockBottle', function(cb , data) {
    console.log('Blocking bottle: ' + data.index)
    is_refilling = true
    if (data.index === 1) {
        bottle1Sts.innerHTML = "Refill & Press";
        bottle1Btn.disabled = true;
        bottle1Sts.disabled = false;
    }
    if (data.index === 2) {
        bottle2Sts.style.display = "block";
        bottle2Btn.disabled = true;
    }
    if (data.index === 3) {
        bottle3Sts.style.display = "block";
        bottle3Btn.disabled = true;
    }
});

bottle1Sts.addEventListener('click', function () {
    if (is_refilling === true) {
        bottle1Sts.innerHTML = "";
        bottle1Sts.disabled = true;
    
        bottle1Btn.disabled = false;
    
        chooseVolumeModal.style.display = "block";
        status = 0
        refill_index = 1
        bottleNumberLabel.innerHTML = "Bottle 1 volume";
    }
});

bottle2Sts.addEventListener('click', function () {
    if (is_refilling === true) {
        bottle2Sts.innerHTML = "";
        bottle2Sts.disabled = true;
    
        bottle2Btn.disabled = false;
    
        chooseVolumeModal.style.display = "block";
        status = 0
        refill_index = 2
        bottleNumberLabel.innerHTML = "Bottle 2 volume";
    }
});

bottle3Sts.addEventListener('click', function () {
    if (is_refilling === true) {
        bottle3Sts.innerHTML = "";
        bottle3Sts.disabled = true;
    
        bottle3Btn.disabled = false;
    
        chooseVolumeModal.style.display = "block";
        status = 0
        refill_index = 3
        bottleNumberLabel.innerHTML = "Bottle 3 volume";
    }
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

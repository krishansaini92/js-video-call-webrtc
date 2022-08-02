const socket = io();    // io() function 이 자동으로 socket.io를 실행하고 있는 서버를 찾음

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;

let roomName;
let myPeerConnection;

// To get Camera informations
async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();    // To get all devices of your computer
        // console.log(devices);
        const cameras = devices.filter((device) => device.kind === "videoinput");
        // console.log(cameras);
        // console.log(myStream.getVideoTracks());
        const currentCamera = myStream.getVideoTracks()[0];     // To connect current video device with 'select'tag

        cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;

            if(currentCamera.label == camera.label){
                option.selected = true;
            }

            camerasSelect.appendChild(option);
        });
    } catch (e) {
        console.log(e);
    }
}

// To set Camera
async function getMedia(deviceId){
    // when we don't have 'deviceId'
    const initialConstraints = {
        audio: true,
        video: { facingMode: "user" },
    }
    // when we have 'deviceId'
    const cameraConstraints = {
        audio: true,
        video: { deviceId: { exact: deviceId } },
    }

    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstraints   // switch camera devices
        );
        // console.log(myStream);
        myFace.srcObject = myStream;

        if(!deviceId){
            await getCameras();
        }

    }
    catch(e){
        console.log(e);
    }
}

// getMedia();

function handleMuteClick(){
    // console.log(myStream.getAudioTracks());  // get audio track information
    myStream
        .getAudioTracks()
        .forEach(track => (track.enabled = !track.enabled));

    if(!muted) {
        muteBtn.innerText = "Unmute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}
function handleCameraClick(){
    // console.log(myStream.getVideoTracks());  // get video track information
    myStream
        .getVideoTracks()
        .forEach(track => (track.enabled = !track.enabled));

    if(cameraOff) {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}

async function handleCameraChange(){
    // console.log(camerasSelect.value);
    await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);

camerasSelect.addEventListener("input", handleCameraChange);


// Welcome Form (Choose(Join) a room)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

// [1. Get Media]
async function startMedia(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();

    makeConnection();   // connect between browsers (peer to peer)
}

function handleWelcomeSubmit(event){
    event.preventDefault();
    const input = welcome.querySelector("input");
    // console.log(input.value);

    roomName = input.value;
    socket.emit("join_room", roomName, startMedia);
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket
socket.on("welcome", async () => {
    // console.log("someone joined");
    // [3. Create Offer]
    const offer = await myPeerConnection.createOffer();
    // console.log(offer);
    // [4. Set Local Description]
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");

    // [5-1. Send Offer] - Peer A to Server
    socket.emit("offer", offer, roomName);
});

// [5-3. Send Offer] - Server to Peer B
socket.on("offer", offer => {
    console.log(offer);
});

// RTC
function makeConnection(){
    myPeerConnection = new RTCPeerConnection();
    // console.log(myStream.getTracks());
    // [2. Add Stream]
    myStream    // get Stream informations into peer connection
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track, myStream));
}
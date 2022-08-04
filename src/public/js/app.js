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

let myDataChannel;

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

    // Sender
    // to update stream when camera changes
    if (myPeerConnection) {
        // console.log(myPeerConnection.getSenders());
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection
            .getSenders()
            .find((sender) => sender.track.kind === "video");
        // console.log(videoSender);
        videoSender.replaceTrack(videoTrack);
    }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);

camerasSelect.addEventListener("input", handleCameraChange);


// Welcome Form (Choose(Join) a room)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

// [1-1. Get Media]
async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();

    makeConnection();   // connect between browsers (peer to peer)
}

async function handleWelcomeSubmit(event){
    event.preventDefault();
    const input = welcome.querySelector("input");
    // console.log(input.value);

    roomName = input.value;
    await initCall();
    socket.emit("join_room", roomName);
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket
// runs on <Peer A>
socket.on("welcome", async () => {
    // Data Channel - the host must create
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message", (event) => {
        console.log(event.data);
    });
    console.log("made data channel");

    // console.log("someone joined");
    // [2-1. Create Offer]
    const offer = await myPeerConnection.createOffer();
    // console.log(offer);
    // [2-2. Set Local Description]
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");

    // [2-3-1. Send Offer] - Peer A to Server
    socket.emit("offer", offer, roomName);
});

// runs on <Peer B>
// [2-3-4. Get Offer] - Server to Peer B
socket.on("offer", async (offer) => {
    // Data Channel
    // myPeerConnection.addEventListener("datachannel", console.log);
    myPeerConnection.addEventListener("datachannel", (event) => {
        myDataChannel = event.channel;
        myDataChannel.addEventListener("message", (event) => {
            console.log(event.data);
        });
    });

    // console.log(offer);
    console.log("received the offer");
    // [2-4. Set Remote Description]
    myPeerConnection.setRemoteDescription(offer);

    // [2-5. Create Answer]
    const answer = await myPeerConnection.createAnswer();
    // console.log(answer);

    // [2-6. Set Local Description]
    myPeerConnection.setLocalDescription(answer);

    // [2-7-1. Send Answer] - Peer B to Server
    socket.emit("answer", answer, roomName);
    console.log("sent the answer");
});

// runs on <Peer A> again
// [2-7-4. Get Answer] - Server to PeerA
socket.on("answer", (answer) => {
    console.log("received the answer");
    // [2-8. Set Remote Description]
    myPeerConnection.setRemoteDescription(answer);
});

// [3-3. Get Candidates from Other Browsers] - Server -> Peer
socket.on("ice", (ice) => {
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
});

// RTC
function makeConnection(){
    // Local Server
    myPeerConnection = new RTCPeerConnection();

    // STUN Server
    // used google public stun server (which is only for test usage)
    // myPeerConnection = new RTCPeerConnection({
    //     iceServers : [
    //         {
    //             urls: [
    //                 "stun:stun.l.google.com:19302",
    //                 "stun:stun1.l.google.com:19302",
    //                 "stun:stun2.l.google.com:19302",
    //                 "stun:stun3.l.google.com:19302",
    //                 "stun:stun4.l.google.com:19302",
    //             ],
    //         },
    //     ],
    // });

    // [3. IceCandidate]
    // [3-1. Make IceCandidate from My Browser]
    myPeerConnection.addEventListener("icecandidate", handleIce);

    // [4. Add Peer's Stream]
    myPeerConnection.addEventListener("addstream", handleAddStream);

    // console.log(myStream.getTracks());
    // [1-2. Add My Stream]
    myStream    // get Stream informations into peer connection
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data){
    console.log("get ice candidate");
    // console.log(data);
    // [3-2-1. Send IceCandidates to Server] - Peer to Server
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data){
    console.log("got an event from my peer");
    // console.log(data);
    console.log("Peer's Stream", data.stream);
    console.log("My Stream", myStream);

    // create peer's video
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
}
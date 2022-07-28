// [SocketIO way]
const socket = io();    // io() function 이 자동으로 socket.io를 실행하고 있는 서버를 찾음

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");
const room = document.querySelector("#room");

room.hidden = true;

let roomName;

function backendDone(msg){
    console.log(`Backend says: `, msg);
}

function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
}

function handleRoomSubmit(event){
    event.preventDefault();
    
    const input = form.querySelector("input");

    // socket.emit("[event name]", [payload..], [callback function]);     // callback function : 서버(백엔드)에서 호출하고 프론트에서 실행하는 함수 (MUST BE the LAST ARGUMENT)
 
    // socket.emit("enter_room", { payload: input.value }, () => {
    //     console.log("server is done");
    // });
 
    // socket.emit("enter_room", input.value, "additional arg", backendDone);
    socket.emit("enter_room", input.value, "additional arg", showRoom);
    roomName = input.value;

    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
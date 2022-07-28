// [SocketIO way]
const socket = io();    // io() function 이 자동으로 socket.io를 실행하고 있는 서버를 찾음

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");
const room = document.querySelector("#room");

room.hidden = true;

let roomName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function backendDone(msg){
    console.log(`Backend says: `, msg);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const inputMsg = room.querySelector("input");
    const value = inputMsg.value;
    socket.emit("new_message", inputMsg.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    inputMsg.value = "";
}

function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const formMsg = room.querySelector("form");
    formMsg.addEventListener("submit", handleMessageSubmit);
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

socket.on("welcome", () => {
    addMessage("Someone Joined!");
});

socket.on("bye", () => {
    addMessage("Someone Left!");
})

socket.on("new_message", addMessage);   // = socket.on("new_message", (msg)=>{addMessage(msg)});

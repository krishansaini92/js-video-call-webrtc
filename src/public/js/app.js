// [SocketIO way]
const socket = io();    // io() function 이 자동으로 socket.io를 실행하고 있는 서버를 찾음

const welcome = document.querySelector("#welcome");
const formName = welcome.querySelector("#name");
const formEnter = welcome.querySelector("#enterRoom");
const room = document.querySelector("#room");

room.hidden = true;

let nickname = "Anonymous";
let roomName;

function addMessage(message){
    const roomUl = room.querySelector("#roomNoti");
    const li = document.createElement("li");
    li.innerText = message;
    roomUl.appendChild(li);
}

function addNotification(message){
    const ul = welcome.querySelector("#noti");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function refreshRoom(userCount){
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${userCount})`;
}

function handleMessageSubmit(event){
    event.preventDefault();
    const inputMsg = room.querySelector("#msg input");
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
    const formMsg = room.querySelector("#msg");
    formMsg.addEventListener("submit", handleMessageSubmit);
}

function handleNameSubmit(event){
    event.preventDefault();
    const inputName = welcome.querySelector("#name input");
    socket.emit("nickname", inputName.value, () => {
        addNotification(`Your Nickname has been set to ${inputName.value}`);
    });
    nickname = inputName.value;
}

formName.addEventListener("submit", handleNameSubmit);

function handleRoomSubmit(event){
    event.preventDefault();
    
    const input = formEnter.querySelector("input");
    
    // socket.emit("[event name]", [payload..], [callback function]);     // callback function : 서버(백엔드)에서 호출하고 프론트에서 실행하는 함수 (MUST BE the LAST ARGUMENT)
    
    // socket.emit("enter_room", { payload: input.value }, () => {
    //     console.log("server is done");
    // });
        
    // socket.emit("enter_room", input.value, "additional arg", backendDone);
    socket.emit("enter_room", input.value, nickname, showRoom);
    roomName = input.value;
    
    input.value = "";
}
    
formEnter.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
    refreshRoom(newCount);
    addMessage(`${user} Joined!`);
});

socket.on("bye", (user, newCount) => {
    refreshRoom(newCount);
    addMessage(`${user} Left!`);
})

socket.on("new_message", addMessage);   // = socket.on("new_message", (msg)=>{addMessage(msg)});
    
// socket.on("room_change", console.log);  // = socket.on("room_change", (msg)=>console.log(msg))
socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("#roomList");
    roomList.innerHTML = "";
    if (rooms.length === 0){
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});
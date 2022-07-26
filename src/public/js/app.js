// [SocketIO way]
const socket = io();    // io() function 이 자동으로 socket.io를 실행하고 있는 서버를 찾음

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");

// function backendDone(){
//     console.log("backend done");
// }
function backendDone(msg){
    console.log(`Backend says: `, msg);
}

function handleRoomSubmit(event){
    event.preventDefault();
    
    const input = form.querySelector("input");

    // socket.emit("[event name]", [payload..], [callback function]);     // callback function : 서버(백엔드)에서 호출하고 프론트에서 실행하는 함수 (MUST BE the LAST ARGUMENT)
 
    // socket.emit("enter_room", { payload: input.value }, () => {
    //     console.log("server is done");
    // });
 
    socket.emit("enter_room", input.value, "additional arg", backendDone);

    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
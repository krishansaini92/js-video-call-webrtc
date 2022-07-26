// alert("hi");

const messageList = document.querySelector("ul");
// const messageForm = document.querySelector("form");
const messageForm = document.querySelector("#message");
const nicknameForm = document.querySelector("#nickname");

// const socket = new WebSocket("ws://localhost:3000");
const socket = new WebSocket(`ws://${window.location.host}`);   // socket (frontend) : 서버로의 연결

// 소켓으로 메시지를 보내기 전, 메시지의 종류를 알려주기 위해 메시지를 json object로 묶어서 보내줌 (단, 보낼 때는 string 형식으로 보내야한다.)
function makeStrMessageFromJson(type, payload){
    const msg = {type, payload};
    return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
    console.log("Connected to Server");
});

socket.addEventListener("message", (message) => {
    // console.log("New message: ", message.data);
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

socket.addEventListener("close", () => {
    console.log("Disconnected from Server");
});

// setTimeout(() => {
//     socket.send("hello from the browser!");
// }, 4000);

function handleSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector("input");
    // console.log(input.value);
    // socket.send(input.value);
    socket.send(makeStrMessageFromJson("new_message", input.value));    // 여러 종류의 메시지를 구분하기 위해 전송하는 메시지 타입을 지정 (Json 형식)

    const li = document.createElement("li");
    li.innerText = `You: ${input.value}`;
    messageList.append(li);

    input.value = "";
}

function handleNicknameSubmit(event){
    event.preventDefault();
    const input = nicknameForm.querySelector("input");
    socket.send(makeStrMessageFromJson("nickname", input.value));
    input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nicknameForm.addEventListener("submit", handleNicknameSubmit);
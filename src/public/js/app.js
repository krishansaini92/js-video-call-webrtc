// alert("hi");

const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

// const socket = new WebSocket("ws://localhost:3000");
const socket = new WebSocket(`ws://${window.location.host}`);   // socket (frontend) : 서버로의 연결

socket.addEventListener("open", () => {
    console.log("Connected to Server");
});

socket.addEventListener("message", (message) => {
    console.log("New message: ", message.data);
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
    socket.send(input.value);
}

messageForm.addEventListener("submit", handleSubmit);
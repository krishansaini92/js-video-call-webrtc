// [SocketIO way]
const socket = io();    // io() function 이 자동으로 socket.io를 실행하고 있는 서버를 찾음

/*// [Websocket way]
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
    console.log("Connected to Server");
});

socket.addEventListener("message", (message) => {});

socket.addEventListener("close", () => {
    console.log("Disconnected from Server");
});
*/
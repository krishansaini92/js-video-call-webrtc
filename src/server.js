import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

// console.log('Hello');
// const handleListen = () => console.log(`Listening on http://localhost:3000`);
const handleListen = () => console.log(`Listening on http&ws://localhost:3000`);
// app.listen(3000, handleListen);
// ---

// [Websocket]
const server = http.createServer(app);          // http 서버를 다루고
const wss = new WebSocket.Server({ server });   // 그 위에 ws 서버를 얹기 위해 한 작업 (http와 ws는 같은 port를 공유)

const sockets = [];         // 몇 명이 연결되었는지 체크하기 위해

// function handleConnection(socket){              // socket (backend): 연결된 브라우저
//     console.log(socket);
// }
// wss.on("connection", handleConnection);
wss.on("connection", (socket) => {              // to keep listening for events
    sockets.push(socket);   // 연결이 이루어질 때마다 추가 (여러 브라우저에서 접속할 경우)
    socket["nickname"] = "Anonymous";
    // console.log(socket);

    console.log("Connected to Browser");
    socket.on("close", () => console.log("Disconnected from Browser"));
    socket.on("message", (message) => {
        // console.log(message.toString('utf8'));
        // socket.send(message.toString('utf8'));
        // sockets.forEach((eachSocket) => eachSocket.send(message.toString('utf8')));

        const parsedMessage = JSON.parse(message.toString('utf8'));      // string 형식으로 온 메시지를 json object로 파싱 (보낼 때 json object 형식으로 묶어줬기 때문에 가능)
        switch (parsedMessage.type) {
            case "new_message":
                // sockets.forEach((eachSocket) => eachSocket.send(parsedMessage.payload));
                sockets.forEach((eachSocket) => eachSocket.send(`${socket.nickname}: ${parsedMessage.payload}`));
            case "nickname":
                // console.log(parsedMessage.payload);
                socket["nickname"] = parsedMessage.payload;
        }
    });
    // socket.send("hello!!!");
});

server.listen(3000, handleListen);
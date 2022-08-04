import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
// const { Server } = require("socket.io");
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const io = SocketIO(httpServer);

io.on("connection", socket => {
    socket.on("join_room", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    });

    // [2. Offer]
    // [2-3-2. Get Offer] - Peer A -> Server
    socket.on("offer", (offer, roomName) => {
        // [2-3-3. Send Offer] - Server -> Peer B
        socket.to(roomName).emit("offer", offer);
    });

    // [2. Answer]
    // [2-7-2. Get Answer] - Peer B -> Server
    socket.on("answer", (answer, roomName) => {
        // [2-7-3. Send Answer] - Server -> Peer A
        socket.to(roomName).emit("answer", answer);
    });

    // [3. IceCandidate]
    // [3-2-2. Get Candidates] - Peer -> Server
    socket.on("ice", (ice, roomName) =>{
        // [3-2-3. Send Candidates to Other Browsers] - Server -> Peer
        socket.to(roomName).emit("ice", ice);
    });
});

const handleListen = () => console.log(`Listening on http&io://localhost:3000`);
httpServer.listen(3000, handleListen);

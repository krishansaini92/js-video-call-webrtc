import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http&io://localhost:3000`);

const httpServer = http.createServer(app);
// [Websocket]
// const wss = new WebSocket.Server({ httpServer });
// [SocketIO]
const io = SocketIO(httpServer);

// [adapter]
// show existing rooms
function publicRooms(){
    // const sids = io.sockets.adapter.sids;
    // const rooms = io.sockets.adapter.rooms;
    const {
        sockets : {
            adapter : {sids, rooms},
        },
    } = io;

    const publicRooms = [];     // 퍼블릭 룸만 저장하기 위해
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

// count user that is in a room
function countRoom(roomName){
    return io.sockets.adapter.rooms.get(roomName)?.size;
}

// [SocketIO way]
io.on("connection", (socket) => {
    socket["nickname"] = "Anonymous";

    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
        console.log(io.sockets.adapter);
    });

    socket.on("enter_room", (roomName, nickname, done) => {
        // console.log(socket.id);
        // console.log(socket.rooms);
        socket.join(roomName);
        // console.log(socket.rooms);
        done();     // execute showRoom() from frontend
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));    // send messages to everyone on [roomName] EXCEPT myself!

        io.sockets.emit("room_change", publicRooms());
    })

    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1));
    });
    
    socket.on("disconnect", () => {
        io.sockets.emit("room_change", publicRooms());
    });

    socket.on("new_message", (msg, room, done) => {
        // socket.to(room).emit("new_message", msg);
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
    
    socket.on("nickname", (nickname, done) => {
        socket["nickname"] = nickname;
        done();
    });
});

/*// [Websocket way]
wss.on("connection", (socket) => {
    console.log("Connected to Browser");

    socket.on("close", () => console.log("Disconnected from Browser"));

    socket.on("message", (message) => {});
});
*/

httpServer.listen(3000, handleListen);

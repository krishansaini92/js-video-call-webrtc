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

// [SocketIO way]
io.on("connection", (socket) => {
    // socket.on("enter_room", (msg) => console.log(msg));
  
    // socket.on("enter_room", (msg, cbfunc) => {
    //     console.log(msg);
    //     setTimeout(() => {
    //         cbfunc();
    //     }, 500);
    // });

    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });

    socket.on("enter_room", (roomName, arg2, done) => {
        // console.log(roomName, arg2);

        // setTimeout(() => {
        //     // done();
        //     done("hello from the backend");
        // }, 5000);

        // console.log(socket.id);
        // console.log(socket.rooms);
        socket.join(roomName);
        // console.log(socket.rooms);
        done();     // execute showRoom() from frontend
        socket.to(roomName).emit("welcome");    // send messages to everyone on [roomName] EXCEPT myself!
    })

    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye"));
    });

    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", msg);
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

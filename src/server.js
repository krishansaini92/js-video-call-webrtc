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
    console.log(socket);
});

/*// [Websocket way]
wss.on("connection", (socket) => {
    console.log("Connected to Browser");

    socket.on("close", () => console.log("Disconnected from Browser"));

    socket.on("message", (message) => {});
});
*/

httpServer.listen(3000, handleListen);
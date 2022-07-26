# Zoom Clone
Zoom Clone using NodeJS, WebRTC and Websockets.

---
## How to start
> npm run dev

- setups
    1. npm init -y
    2. npm i nodemon -D
    3. npm i @babel/core @babel/cli @babel/node @babel/preset-env -D
    4. npm i express
    5. npm i pug
<br>
- basic HTML tag decoration
    - link(rel="stylesheet" href="https://unpkg.com/mvp.css")
<br><br>
## Heads Up
> See git history to look step by step processes!

---
## Part 1 - Setups
#### BackEnd
- express, babel, nodemon

#### FrontEnd
- pug

---
## Part 2 - Chat with Websockets
    > Websocket - It is a 'Protocol' for realtime service (ws) provided by the browser
1. HTTP vs WS
    - Stateless vs Stateful : Server remembers who you(=client =browser) are
    - HTTP : only request -> response
    - WS : (first) make connection (handshake way) -> send messages bidirectionally any time -> close connection

---
## Part 3 - SocketIO
    > SocketIO - It is a 'Framework' for realtime service 'using websocket' among other things
1. SocketIO vs WebSockets
    - 공통점 : real-time, bidirectional, event-based communication
    - SocketIO is NOT a 'implementation' of WebSocket 
    - SocketIO provides 'reliability' : If websocket is not available, SocketIO will use other things

2. Installing SocketIO
    > npm i socket.io
    - socketIO must be installed on both Backend and Frontend. It is not 'givin' like WebSocket. (WebSocket API is already installed in the browser)
        - Backend
            > import SocketIO from "socket.io";

            > const io = SocketIO(httpServer);
        - Frontend
            > script(src="/socket.io/socket.io.js")

3. Using SocketIO
    - WebSocket : can ONLY send "message" with "String" type
    - SocketIO : can EMIT "any event" with arguements (which can be a "Object". not only String!)
        - Frontend
            > socket.emit("[event name]", [payload1], [payload2], ... , [callback function]);
        - Backend
            > socket.on("[event name]", ([arguements]) => {});

        ※ Callback Function : Sended from Frontend -> Called from Backend -> Executed on Frontend
        - = press 'play' by backend and 'played' on frontend)
        - Arguements can be sent from backend to the (frontend) function
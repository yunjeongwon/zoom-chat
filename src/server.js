import express from "express";
import http from "http";
import WebSocket from "ws";
// import SokcetIO from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => {
  res.render("home");
});

app.get("/*", (_, res) => {
  res.redirect("/");
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
// const wsServer = SokcetIO(httpServer);

const sockets = [];
wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anonymous";
  console.log("Connected to Browser");
  socket.on("close", () => {
    console.log("Disconnected from the Browser");
  });
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    if (message.type === "nickname") {
      socket["nickname"] = message.payload;
    }
    if (message.type === "new_message") {
      sockets.forEach((aSocket) => {
        if (aSocket !== socket) {
          aSocket.send(`${socket.nickname} : ${message.payload}`);
        }
      });
    }
    // console.log(message.toString('utf8')); 
  });
});

const port = 3000;

server.listen(port, () => {
  console.log(`Listening on ws://localhost:${port}`);
});

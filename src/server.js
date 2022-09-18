import express from "express";
import http from "http";
// import WebSocket from "ws";
import { Server  } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

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

const httpServer = http.createServer(app);
// const wss = new WebSocket.Server({ httpServer });
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});

instrument(wsServer, {
  auth: false
});

function publicRooms() {
  const { sids, rooms } = wsServer.sockets.adapter;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  // 소켓 연결 되자마자 강제로 어떤 방으로 입장시키기
  // wsServer.socketsJoin("어떤");
  socket["nickname"] = "Anonymous";
  socket.onAny((event) => {
    // console.log(wsServer.sockets.adapter);
    console.log(`Socket Event : ${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    socket.emit("welcome_count", countRoom(roomName));
    // 방 입장할 때마다 방 개수를 emit
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
    });
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
    done();
  })
  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname;
  })
});

// const sockets = [];
// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "Anonymous";
//   console.log("Connected to Browser");
//   socket.on("close", () => {
//     console.log("Disconnected from the Browser");
//   });
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     if (message.type === "nickname") {
//       socket["nickname"] = message.payload;
//     }
//     if (message.type === "new_message") {
//       sockets.forEach((aSocket) => {
//         if (aSocket !== socket) {
//           aSocket.send(`${socket.nickname} : ${message.payload}`);
//         }
//       });
//     }
//     // console.log(message.toString('utf8')); 
//   });
// });

const port = 3000;

httpServer.listen(port, () => {
  console.log(`Listening on http://localhost:${port} && Admin : https://admin.socket.io`);
});

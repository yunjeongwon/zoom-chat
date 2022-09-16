// 폰에서도 접속하려고 window.location.host
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
  console.log("Connected to Server");
});

socket.addEventListener("message", (message) => {
  console.log("just got this", message.data);
});

socket.addEventListener("close", () => {
  console.log("Disconnected to Server");
});
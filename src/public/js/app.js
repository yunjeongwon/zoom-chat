const socket = io();

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");
const room = document.querySelector("#room");
room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, () => {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (1)`;
    const nameForm = document.querySelector("#name");
    const msgForm = document.querySelector("#msg");

    nameForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = nameForm.querySelector("input");
      socket.emit("nickname", input.value);
    });

    msgForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = msgForm.querySelector("input");
      const value = input.value;
      socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You : ${value}`);
      });
      input.value = "";
      input.focus();
    });
  });
  roomName = input.value;
  input.value = "";
});

socket.on("welcome", (nickname, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${nickname} 님이 입장하셨습니다!`);
});

socket.on("bye", (nickname, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${nickname} 님이 퇴장하셨습니다!`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.appendChild(li);
  });
});

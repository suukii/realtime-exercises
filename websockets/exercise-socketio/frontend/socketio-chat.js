// a global called "io" is being loaded separately

const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");
let allChat = [];

// socket.io will fallback to long polling if ws is not supported
// window.WebSocket = null;

const socket = io("ws://localhost:8080");

socket.on("connect", () => {
  console.log("connected");
  presence.innerText = "🟢";
});

socket.on("disconnect", () => {
  console.log("disconnectd");
  presence.innerText = "🔴";
});

socket.on('msg:get', data => {
  allChat = data.msg;
  render()
})

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = {
    user,
    text,
  };

  socket.emit("msg:post", data);
}

function render() {
  const html = allChat.map(({ user, text }) => template(user, text));
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");
let allChat = [];

// listen for events on the form
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

  ws.send(JSON.stringify(data));
}

const ws = new WebSocket("ws://localhost:8080", ["json"]);

ws.addEventListener("open", () => {
  console.log("connection open");
  presence.innerText = "🟢";
});

ws.addEventListener("close", () => {
  console.log("connection close");
  presence.innerText = "🔴";
});

ws.addEventListener("message", (e) => {
  const data = JSON.parse(e.data);
  allChat = data.msg;
  render();
});

function render() {
  const html = allChat.map(({ user, text }) => template(user, text));
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

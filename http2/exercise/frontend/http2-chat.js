const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");

// this will hold all the most recent messages
let allChat = [];

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

  // request options
  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };

  // send POST request
  // we're not sending any json back, but we could
  await fetch("/msgs", options);
}

async function getNewMsgs() {
  // step1: get a readable stream from response body
  let reader;
  try {
    const res = await fetch("/msgs");
    reader = res.body.getReader();
  } catch (e) {
    console.error("connection error", e);
  }

  presence.innerText = "🟢";
  let done = false;
  // constantly read from the body stream
  do {
    // step2: read data from body read stream
    let readerResponse;
    try {
      readerResponse = await reader.read();
    } catch (e) {
      console.error("reader failed", e);
      presence.innerText = "🔴";
      return;
    }
    done = readerResponse.done;

    // step3: decode the data read from the body stream
    const utf8Decoder = new TextDecoder("utf-8");
    const chunk = utf8Decoder.decode(readerResponse.value, { stream: true });
    if (chunk) {
      try {
        const json = JSON.parse(chunk);
        allChat = json.msg;
        render();
      } catch (e) {
        console.error("parse error", e);
      }
    }
  } while (!done);

  presence.innerText = "🔴";
}

function render() {
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

getNewMsgs();

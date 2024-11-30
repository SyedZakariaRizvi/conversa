function addSelectOnClickEvent() {
  const chatItems = document.querySelectorAll('.chat-item')
  chatItems.forEach(item => {
    item.addEventListener('click', function() {
      chatItems.forEach(item => item.classList.remove('selected'))
      this.classList.add('selected')

      const otherPersonName = item.querySelector("span").innerText
      document.querySelector(".receiver-name").innerText = otherPersonName

      const messageArea = document.querySelector(".display-messages")
      messageArea.innerText = "Loading..."

      fetch(`/api/get-chat/${item.dataset.chatid}`)
        .then(response => response.json())
        .then(data => {
          if (data.messages && data.messages.length > 0) {
            const messageDiv = data.messages.map(message => {
              let styleMessage;
              if(message.senderName === userName) {
                styleMessage = "background-color: #bdf8ad; margin-left: auto"
              } else {
                styleMessage = "background-color: #add0f8 margin-right: auto"
              }
              return `
                <div class="message-box" style="${styleMessage}">
                  <span>${message.senderName}</span>
                  <p>${message.content}</p>
                </div>
              `
            }).join('')
            messageArea.innerHTML = messageDiv
          } else {
            messageArea.innerText = "No messages available."
          }
        })
        .catch(error => {
          console.log('Error:', error);
          alert('Failed to get chat: ' + error.message)
        })
    })
  })
}

function createChatDiv(email, chatId, name) {
  const newChatItem = document.createElement("div")
  newChatItem.classList.add("chat-item")
  newChatItem.setAttribute("data-email", email)
  newChatItem.setAttribute("data-chatid", chatId)
  newChatItem.innerHTML = `<span>${name}</span>`
  
  const displayChats = document.querySelector(".display-chats")
  displayChats.insertBefore(newChatItem, displayChats.firstChild)

  addSelectOnClickEvent()
}

const socket = io()

const allChatIds = Array.from(document.querySelectorAll(".chat-item")).map(chatItem => {
  return chatItem.dataset.chatid
})
socket.emit("joinRoom", [userId, ...allChatIds])

socket.on("create-chat", ({ personName: name, personEmail: email, chatId }) => {
  createChatDiv(email, chatId, name)
})

socket.on("new-message", ({ messageText, senderName, chatId }) => {
  const chatItem = document.querySelector(`.chat-item[data-chatid="${chatId}"]`)
  const displayChats = document.querySelector(".display-chats")
  displayChats.removeChild(chatItem)
  displayChats.insertBefore(chatItem, displayChats.firstChild)

  if(chatItem.classList.contains("selected")) {
    document.querySelector(".display-messages")
      .insertAdjacentHTML("beforeend", 
        `
          <div class="message-box" style="background-color: #add0f8 margin-right: auto">
            <span>${senderName}</span>
            <p>${messageText}</p>
          </div>
        `
      )
  }
})

document.querySelector("#create-chat-button").addEventListener("click", () => {
  const userEmail = document.querySelector("#create-chat-input").value
  
  fetch("/api/create-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ otherPersonEmail: userEmail })
  })
  .then(response => response.json())
  .then(data => {
    if (data.chatId) {
      createChatDiv(userEmail, data.chatId, data.otherPersonName)
    } else {
        throw new Error(data.message || 'Failed to create chat')
    }
  })
  .catch(error => {
    console.log('Error:', error);
    alert('Failed to create chat: ' + error.message)
  });
})

document.querySelector("#send-message-button").addEventListener("click", () => {
  const chatItem = document.querySelector(".selected")
  if(chatItem) {
    const messageText = document.querySelector("#send-message-input").value
    const chatId = chatItem.dataset.chatid

    fetch("/api/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messageText, chatId })
    })
    .then(response => {
      if(response.ok) {
        const displayChats = document.querySelector(".display-chats")
        displayChats.removeChild(chatItem)
        displayChats.insertBefore(chatItem, displayChats.firstChild)

        document.querySelector(".display-messages")
          .insertAdjacentHTML("beforeend", 
            `
              <div class="message-box" style="background-color: #bdf8ad; margin-left: auto">
                <span>${userName}</span>
                <p>${messageText}</p>
              </div>
            `
          )
        document.querySelector("#send-message-input").value = ""

        socket.emit("send-message", {
          messageText,
          senderName: userName,
          chatId
        })
      } else {
        throw new Error("Failed to send message")
      }
    })
    .catch(error => {
      console.log('Error:', error);
      alert('Failed to create chat: ' + error.message)
    })
  } else {
    alert("No chat selected")
  }
})

addSelectOnClickEvent()
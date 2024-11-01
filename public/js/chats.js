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
            const messageDiv = data.messages.map(message => `
              <div>
                <span>${message.senderName}</span>
                <p>${message.content}</p>
              </div>
            `).join('')
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
socket.emit('joinRoom', userId)

socket.on("create-chat", ({ personName: name, personEmail: email, chatId }) => {
  createChatDiv(email, chatId, name)
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
        document.querySelector(".display-messages")
          .insertAdjacentHTML("beforeend", 
            `
              <div>
                <span>${userName}</span>
                <p>${messageText}</p>
              </div>
            `
          )
        document.querySelector("#send-message-input").value = ""
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
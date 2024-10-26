function addSelectOnClickEvent() {
  const chatItems = document.querySelectorAll('.chat-item')
  chatItems.forEach(item => {
    item.addEventListener('click', function() {
      chatItems.forEach(item => item.classList.remove('selected'))
      this.classList.add('selected')
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

addSelectOnClickEvent()
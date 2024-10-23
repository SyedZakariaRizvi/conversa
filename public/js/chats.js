const socket = io()

const chatItems = document.querySelectorAll('.chat-item');

chatItems.forEach(item => {
  item.addEventListener('click', function() {
    chatItems.forEach(item => item.classList.remove('selected'));
    this.classList.add('selected');
  });
});

document.querySelector("#create-chat-button").addEventListener("click", () => {
  const userEmail = document.querySelector("#create-chat-input").value
  
  const newChatItem = document.createElement("div");
  newChatItem.classList.add("chat-item");
  newChatItem.setAttribute("data-email", userEmail);
  
  newChatItem.innerHTML = `<span>Loading...</span>`;

  const displayChats = document.querySelector(".display-chats");
  displayChats.insertBefore(newChatItem, displayChats.firstChild);
})
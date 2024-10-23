const chatItems = document.querySelectorAll('.chat-item');

chatItems.forEach(item => {
  item.addEventListener('click', function() {
    chatItems.forEach(item => item.classList.remove('selected'));
    this.classList.add('selected');
  });
});

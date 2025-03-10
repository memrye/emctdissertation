document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const chat = document.getElementById('chat');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');

    socket.on('chat message', (data) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `<span class="user">${data.user}:</span> ${data.message}`;
        chat.appendChild(messageElement);
        chat.scrollTop = chat.scrollHeight; 
    });

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message) {
            socket.emit('chat message', message);
            messageInput.value = '';
        }
    });

});
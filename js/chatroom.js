document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const chat = document.getElementById('chat');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');

    // create profile element
    const profile = document.getElementById('profile');
    const profileImageContainer = document.getElementById('profile-imagecontainer')
    const usernameDisplay = document.getElementById('profile-username');

    socket.on('assigned user', (userData) => {
        profileImageContainer.style.backgroundImage = `url('${userData.profile_image}')`;
        usernameDisplay.textContent = userData.username;
    });

    socket.on('chat message', (data) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(data.user === 'You' ? 'user-message' : 'other-message');
        messageElement.innerHTML = `${data.message}`;
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
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const chat = document.getElementById('chat');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');

    // get profile element
    const profile = document.getElementById('profile');
    const profileImageContainer = document.getElementById('profile-imagecontainer')
    const usernameDisplay = document.getElementById('profile-username');

    socket.on('assigned user', (userData) => {
        profileImageContainer.style.backgroundImage = `url('${userData.profile_image}')`;
        usernameDisplay.textContent = userData.username;
    });

    function createTypingIndicator(username) {
        const typingElement = document.createElement('span');
        typingElement.classList.add('typing-message');
        typingElement.innerHTML = `${username} is typing...`;
        return typingElement;
    }

    socket.on('chat message', (data) => {
        if (data.user !== 'You') {
            const typingIndicator = createTypingIndicator(data.user);
            chat.appendChild(typingIndicator);
            chat.scrollTop = chat.scrollHeight;

            setTimeout(() => {
                typingIndicator.remove();
                socket.emit('messageIn', data.message)
                // create actual message
                const messageElement = document.createElement('div');
                messageElement.classList.add('message');
                messageElement.classList.add('other-message');
                messageElement.innerHTML = data.message;
                chat.appendChild(messageElement);
                chat.scrollTop = chat.scrollHeight;
            }, data.message.length * 200);
        } else {
            // users messages appear immediately
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'user-message');
            messageElement.innerHTML = data.message;
            chat.appendChild(messageElement);
            chat.scrollTop = chat.scrollHeight;
        }
    });

    document.addEventListener('keydown', (e) => {
        socket.emit('keydown', e.key);
    });

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        socket.emit('mouseover', 'messageSent')
        if (message) {
            socket.emit('chat message', message);
            messageInput.value = '';
        }
    });

    const refreshButton = document.getElementById('refresh-button');
    refreshButton.addEventListener('click', () => {
        location.reload();
        socket.emit('mouseover', 'refresh')
    })

});

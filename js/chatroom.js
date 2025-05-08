document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const chat = document.getElementById('chat');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const profile = document.getElementById('profile');
    const profileImageContainer = document.getElementById('profile-imagecontainer');
    const usernameDisplay = document.getElementById('profile-username');

    let isWaitingForResponse = false;
    let currentUser = null;
    let pendingMessages = [];

    socket.on('assigned user', (userData) => {
        currentUser = userData;
        profileImageContainer.style.backgroundImage = `url('${userData.profile_image}')`;
        usernameDisplay.textContent = userData.username;
        // clear chat when new user is assigned
        chat.innerHTML = '';
        pendingMessages = [];
        isWaitingForResponse = false;
    });

    function createTypingIndicator(username) {
        const typingElement = document.createElement('span');
        typingElement.classList.add('typing-message');
        typingElement.innerHTML = `${username} is typing...`;
        return typingElement;
    }

    socket.on('chat message', (data) => {
        if (data.status === 'sent') {
            // display user messages immediately
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'user-message');
            messageElement.setAttribute('data-message-id', data.id);
            messageElement.innerHTML = data.message;
            chat.appendChild(messageElement);
            chat.scrollTop = chat.scrollHeight;
        } else if (data.status === 'response' && data.user === currentUser.username) {
            const typingIndicator = createTypingIndicator(data.user);
            chat.appendChild(typingIndicator);
            chat.scrollTop = chat.scrollHeight;
    
            setTimeout(() => {
                typingIndicator.remove();
                const messageElement = document.createElement('div');
                messageElement.classList.add('message', 'other-message');
                messageElement.setAttribute('data-message-id', data.id);
                messageElement.innerHTML = data.message;
                chat.appendChild(messageElement);
                chat.scrollTop = chat.scrollHeight;
                socket.emit('messageIn', data.message);
                
                isWaitingForResponse = false;
    
                if (pendingMessages.length > 0) {
                    
                    const nextMessage = pendingMessages.shift();
                    socket.emit('messageIn', nextMessage);
                    isWaitingForResponse = true;
                }
            }, data.message.length * 50);
        }
    });

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        
        if (message && !isWaitingForResponse) {
            isWaitingForResponse = true;
            socket.emit('chat message', message);
            messageInput.value = '';
            socket.emit('mouseover', 'messageSent');
        } else if (message) {
            pendingMessages.push(message);
            messageInput.value = '';
        }
    });

    const refreshButton = document.getElementById('refresh-button');
    refreshButton.addEventListener('click', () => {
        socket.emit('mouseover', 'refresh');
        location.reload();
    });

    window.addEventListener('keydown', (e) => {
        socket.emit('keydown', e.key);
    });
});
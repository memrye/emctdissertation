document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const chat = document.getElementById('chat');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const userData = getUserData();

    // get profile element
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

    document.addEventListener('keydown', (e) => {
        socket.emit('keydown', e.key);
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

//GET USER DATA *****************************************
function getUserData() {
    const userDataCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('userData='));
    
    if (userDataCookie) {
        const userData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
        return userData;
    }
}
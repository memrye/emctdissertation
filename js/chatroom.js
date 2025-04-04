document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const chat = document.getElementById('chat');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');

    let currentUser = null;

    // create profile element
    const profile = document.createElement('div');
    profile.id = 'profile';
    profile.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        width: 130px;
        height: 150px;
        background: linear-gradient(rgba(230, 223, 255, 0.21),rgba(115, 127, 197, 0.21),rgba(96, 92, 158, 0.21));;
        box-shadow: inset 0px 0px 11px 0px rgba(0,0,0,0.5);
        box-shadow: 0px 0px 11px 0px rgba(0,0,0,0.5);
        backdrop-filter: blur(7px) saturate(200%) brightness(0.7);
        -webkit-backdrop-filter: blur(5.4px);
        border-radius: 50% / 10%;
        color: white;
        text-align: center;
        text-indent: .1em;
        z-index: 1000;
        border: thick rgba(255, 255, 255, 0.5);
    `;

    // profile image container
    const profileImageContainer = document.createElement('div');
    profileImageContainer.style.cssText = `
        position: relative;
        width: 104px;
        height: 104px;
        left: 8%;
        top: 8%;
        background-size: cover;
        background-position: center;
        box-shadow: inset 0px 0px 11px 0px rgba(0,0,0,0.5);
        box-shadow: 0px 0px 11px 0px rgba(0,0,0,0.5);
        border-radius: 50% / 10%;
        border: thick solid rgba(255, 255, 255, 0.4);
        border-width: 3px;
        outline: double rgba(255, 255, 255, 0.2);
        outline-width: 3px;
        outline-offset: -3px;
        overflow: hidden;
    `;
    // highlight overlay
    const highlightOverlay = document.createElement('div');
    highlightOverlay.style.cssText = `
        position: absolute;
        width: 300%;
        height: 130%;
        top: -80%;
        left: -100%;
        background: radial-gradient(circle,rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%);
    `;
    profileImageContainer.appendChild(highlightOverlay);
    profile.appendChild(profileImageContainer);

    // username
    const usernameDisplay = document.createElement('div');
    usernameDisplay.style.cssText = `
        position: absolute;
        bottom: 2px;
        left: 0;
        right: 0;
        text-align: center;
        color: white;
        text-shadow: 0px 0px 3px rgba(0,0,0,0.5);
        font-size: 14px;
        padding: 5px;
    `;
    profile.appendChild(usernameDisplay);
    document.body.appendChild(profile);

    socket.on('assigned user', (userData) => {
        currentUser = userData;
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
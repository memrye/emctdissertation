document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const avatarContainer = document.querySelector('.avatar-container');

    async function loadAvatars() {
        try {
            const response = await fetch('/api/avatars');
            const avatars = await response.json();
            
            avatars.forEach((avatar, index) => {
                const profileImage = document.createElement('div');
                profileImage.className = 'profile-image';
                
                const imageContainer = document.createElement('div');
                imageContainer.className = 'profile-imagecontainer';
                imageContainer.style.backgroundImage = `url('/images/avatars/${avatar}')`;
                
                profileImage.appendChild(imageContainer);
                avatarContainer.appendChild(profileImage);

                // Add click handler
                profileImage.addEventListener('click', () => {
                    document.querySelectorAll('.profile-image').forEach(a => 
                        a.classList.remove('selected')
                    );
                    profileImage.classList.add('selected');
                    document.getElementById('selectedAvatar').value = avatar;
                });
            });
        } catch (error) {
            console.error('Error loading avatars:', error);
        }
    }

    // load avatars when page loads
    loadAvatars();

    // scroll handling
    avatarContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        avatarContainer.scrollLeft += e.deltaY;
        
        if (Math.abs(e.deltaY) > 50) {
            const scrollAmount = Math.sign(e.deltaY) * 100;
            avatarContainer.scrollTo({
                left: avatarContainer.scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    });

    document.addEventListener('keydown', (e) => {
        socket.emit('keydown', e.key);
    });
});
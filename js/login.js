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

                profileImage.addEventListener('click', () => {
                    document.querySelectorAll('.profile-image').forEach(a => 
                        a.classList.remove('selected')
                    );
                    profileImage.classList.add('selected');
                    document.getElementById('selectedAvatar').value = avatar;
                });

                profileImage.addEventListener('mouseenter', () => {
                    socket.emit('mouseover', 'loginProfileImage')
                })

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

    const colorSlider = document.getElementById('backgroundcolorslider');
    const backgroundHueshift = document.body

    function updateBackground(){
        let tempRGB = hsl2rgb(colorSlider.value, 0.2, 0.5);
        for (let i = 0; i < 3; i++){
            tempRGB[i] = tempRGB[i]*255
        }
        let DtempRGB = hsl2rgb(colorSlider.value, 0.2, 0.3);
        for (let i = 0; i < 3; i++){
            DtempRGB[i] = DtempRGB[i]*255
        }
        let LtempRGB = hsl2rgb(colorSlider.value, 0.2, 0.7);
        for (let i = 0; i < 3; i++){
            LtempRGB[i] = LtempRGB[i]*255
        }
        backgroundHueshift.style.backgroundImage = `radial-gradient(rgb(${LtempRGB[0]}, ${LtempRGB[1]}, ${LtempRGB[2]}), rgb(${tempRGB[0]}, ${tempRGB[1]}, ${tempRGB[2]}),rgb(${DtempRGB[0]}, ${DtempRGB[1]}, ${DtempRGB[2]}))`;

        socket.emit('backgroundChanged', `${colorSlider.value}`)
    }
    requestAnimationFrame(updateBackground);

    colorSlider.addEventListener('input', () => {
        requestAnimationFrame(updateBackground);
    })

    const loginButton = document.getElementById('loginButton')
    loginButton.addEventListener('mousedown', (e) => {
        socket.emit('loggedin', 'true')
    })
    socket.emit('windowstate', 'login');

});

function hsl2rgb(h,s,l) 
{
   let a=s*Math.min(l,1-l);
   let f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);
   return [f(0),f(8),f(4)];
}   
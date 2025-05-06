document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const tabs = document.getElementsByClassName('settings-navbar-option');
    const tabContents = document.getElementsByClassName('settings-content');
    
    tabContents[0].classList.add('active');
    for (let i = 0; i < tabs.length; i++){
        tabs[i].addEventListener('change', () => {
            for (let content of tabContents) {
                content.classList.remove('active');
            };
            if (tabs[i].checked){
                const contents = tabContents[i];
                contents.classList.add('active')
            } 
            socket.emit('mouseover', 'settingsTab')
        })

    }

    const colorSlider = document.getElementById('settings-slider-bgcolor')
    const userDataCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('userData='));
    
    if (userDataCookie) {
        const userData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
        colorSlider.value = userData.color || 252;
    }

    colorSlider.addEventListener('input', (e) => {
        const newColor = e.target.value;
        const userDataCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('userData='));
        
        if (userDataCookie) {
            const userData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
            userData.color = newColor;
            document.cookie = `userData=${JSON.stringify(userData)}; path=/`;
            
            const colorChangeEvent = new CustomEvent('colorChanged', {detail: newColor});
            window.parent.dispatchEvent(colorChangeEvent);

        }
    });

    const volumeSlider = document.getElementById('settings-slider-volume')
    volumeSlider.addEventListener('input', (e) => {
        socket.emit('volumeChanged', volumeSlider.value)
    })

    document.addEventListener('keydown', (e) => {
        socket.emit('keydown', e.key);
    });
});



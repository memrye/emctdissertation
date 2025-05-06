document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const canvas = document.getElementById('spectrum-canvas');
    const seekbar = document.getElementById('seekbar-slider')
    const ctx = canvas.getContext('2d');
    const playPauseButton = document.getElementById('play-pause-button');
    let isPlaying = false;
    const interpolationSpeed = 0.08;

    playPauseButton.addEventListener('click', () => {
        isPlaying = !isPlaying;
        
        playPauseButton.innerHTML = isPlaying ? 
            `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
            </svg>` :
            `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
            </svg>`;

        requestAnimationFrame(updateSeekbar);
        socket.emit('isPlaying', isPlaying);
    });

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    

    const bands = Array(8).fill().map(() => ({
        current: 0,
        target: 0
    }));

    socket.on('rms', (values) => {
        bands.forEach((band, i) => {
            band.target = ((values[i]+1)*2)/350;
        });
    });

    function lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    function drawSpectrum() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / 13;
        const gap = (canvas.width / 12) / 2;
        const startX = gap;

        bands.forEach((band, i) => {
            band.current = lerp(band.current, band.target, interpolationSpeed);
            
            const x = startX + (barWidth + gap) * i;
            const height = band.current;
            const y = canvas.height - height;
            
            ctx.beginPath();
            ctx.rect(x, y, barWidth, height, 5);
            ctx.fillStyle = 'rgba(220, 220, 220, 0.8)';
            ctx.fill();
        });

        requestAnimationFrame(drawSpectrum);
    }

    function updateSeekbar() {
        socket.emit('isPlaying', isPlaying);
        if (!isPlaying){
            return;
        }
        let value = seekbar.value;
        if (value < 512) {
            value++;
        } else {
            value = 0;
        }
        seekbar.value = value;
        socket.emit('seekbar', value);
        window.setTimeout(() => {
            requestAnimationFrame(updateSeekbar);
        }, 100);

    }

    const prevButton = document.querySelector(`#playback-controls > button:nth-child(1)`);

    prevButton.addEventListener('mouseenter', () => {
        socket.emit('mouseover', 'prevButton')
    })

    prevButton.addEventListener('mousedown', () => {
        seekbar.value = 0;
    })

    const nextButton = document.querySelector(`#playback-controls > button:nth-child(3)`);

    nextButton.addEventListener('mouseenter', () => {
        socket.emit('mouseover', 'nextButton')
    })

    nextButton.addEventListener('mousedown', () => {
        seekbar.value = 512;
    })

    document.addEventListener('keydown', (e) => {
        socket.emit('keydown', e.key);
    });

    requestAnimationFrame(updateSeekbar);
    requestAnimationFrame(drawSpectrum);
});
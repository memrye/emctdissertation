document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const spectrumContainer = document.getElementById('spectrum-container')
    const interpolationSpeed = 0.05; 

    const bands = Array(16).fill().map(() => ({
        current: 0,
        target: 0,
        element: document.createElement('div')
    }));

    bands.forEach((band) => {
        band.element.className = 'spectrum-band';
        spectrumContainer.appendChild(band.element);
    });

    socket.on('rms', (values) => {
        bands.forEach((band, i) => {
            band.target = ((values[i]+1)*2)/200;
        });
    });

    function lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    function updateSpectrum() {
        bands.forEach((band, i) => {
            band.current = lerp(band.current, band.target, interpolationSpeed);
            band.element.style.height = `${band.current}px`;
            band.element.style.width = `5%`;
        });

        // let scale1 = bands[1].current / 100;
        // let scale2 = 1-(bands[3].current / 100);
        // noise(3,0.3,3).thresh(scale2,0.03).diff(o3,0.3).out(o1)
        // gradient(5).mask(o1).invert(1).out(o0)
        requestAnimationFrame(updateSpectrum);
    }

    // render(o0)
    requestAnimationFrame(updateSpectrum);


});
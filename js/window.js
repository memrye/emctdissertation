document.addEventListener('createNewWindow_browser', () => {
    createWindow('browser'); 
});
document.addEventListener('createNewWindow_youtube', () => {
    createWindow('youtube'); 
});

function createWindow(windowType) {
    //close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
        color: rgb(52, 52, 52);
        position: absolute;
        right: 5px;
        top: 50%;
        transform: translateY(-50%);
        background-color: transparent;
        border: inset rgb(240, 240, 240) 2px;
        font-size: 20px;
        cursor: pointer;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: background-color 0.2s;
        writing-mode: vertical-rl;
        border-radius: 5px;
    `;
    //minimize button
    const minimizeButton = document.createElement('button');
    minimizeButton.textContent = '−';
    minimizeButton.style.cssText = `
        color: rgb(52, 52, 52);
        position: absolute;
        right: 30px;
        top: 50%;
        transform: translateY(-50%);
        background-color: transparent;
        border: inset rgb(240, 240, 240) 2px;
        font-size: 20px;
        cursor: pointer;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: background-color 0.2s;
        border-radius: 5px;
    `;
    //window title
    const windowTitle = document.createElement('span');
    windowTitle.textContent = windowType;;
    windowTitle.style.cssText = `
        color: rgb(52, 52, 52);
        font-family: monospace, sans-serif;
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 14px;
    `;

    //top of window
    const windowTop = document.createElement('div');
    windowTop.id = `${windowType}WindowTop`;
    windowTop.style.cssText = `
        position: absolute;
        width: 600px;
        height: 28px;
        background-image: linear-gradient(rgb(255, 255, 255),rgb(173, 173, 173),rgb(173, 173, 173));
        cursor: default;
        user-select: none;
        border: 2px solid rgb(173, 173, 173);
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        border-bottom-width: 3px;
    `;
    //window base
    const windowBase = document.createElement('div');
    windowBase.id = `${windowType}WindowBase`;
    windowBase.style.cssText = `
        position: absolute;
        width: 600px;
        height: 400px;
        radius: 8px;
        background-color: transparent;
        user-select: none;
        transform: translate(0px, 33px); 
        border: 2px solid rgb(173, 173, 173);
        border-top-width: 0px;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
    `;
    //window content
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        background-color: transparent;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
    `;
    iframe.allowTransparency = "true";
    //resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.style.cssText = `
        position: absolute;
        right: 0;
        bottom: 0;
        width: 15px;
        height: 15px;
        cursor: nw-resize;
        background: transparent;
    `;
    
    if (windowType === 'browser') iframe.src = 'http://localhost:8000/chatroom';
    if (windowType === 'youtube') iframe.src = 'https://www.youtube.com/embed/zm0PguJ4sDg';


    windowTop.appendChild(minimizeButton);
    windowTop.appendChild(closeButton);
    windowTop.appendChild(windowTitle);

    windowBase.appendChild(resizeHandle);
    windowBase.appendChild(iframe);

    document.body.appendChild(windowBase);
    document.body.appendChild(windowTop);
    
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    let rafId = null;

    //track mouse position
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // mouse event listeners
    windowTop.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);

    // close button hover listeners
    closeButton.addEventListener('mouseover', () => {
        closeButton.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    });

    closeButton.addEventListener('mouseout', () => {
        closeButton.style.backgroundColor = 'transparent';
    });

    // close button click listener
    closeButton.addEventListener('click', () => {
        const closeWindowEvent = new CustomEvent(`closeWindow_${windowType}`);
        document.dispatchEvent(closeWindowEvent);
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDragging);
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResizing);
        windowBase.remove();
        windowTop.remove();
    });


    //drag interaction functions
    function startDragging(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        if ((e.target === windowTop || e.target === windowTitle) && !isDragging) {
            isDragging = true;
            windowTop.style.cursor = 'grabbing';
            rafId = requestAnimationFrame(updatePosition);
        }  
    }
    
    function updatePosition() {
        if (isDragging) {
            currentX = mouseX - initialX;
            currentY = mouseY - initialY;

            const maxX = window.innerWidth - windowTop.offsetWidth;
            const maxY = window.innerHeight - windowTop.offsetHeight;
            
            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));

            xOffset = currentX;
            yOffset = currentY;

            setDivPosition(currentX, currentY);
            rafId = requestAnimationFrame(updatePosition);
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
        }
    }

    function stopDragging() {
        if (isDragging) {
            windowTop.style.cursor = 'default';
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
        }
    }

    // minimize button hover listeners
    minimizeButton.addEventListener('mouseover', () => {
        minimizeButton.style.backgroundColor = 'rgba(80, 80, 80, 0.2)';
    });

    minimizeButton.addEventListener('mouseout', () => {
        minimizeButton.style.backgroundColor = 'transparent';
    });

    // minimize button click listener
    minimizeButton.addEventListener('click', minimizeWindow);

    function setDivPosition(xPos, yPos) {
        const yOff = parseInt(windowTop.style.height) + parseInt(windowTop.style.borderTopWidth) + parseInt(windowBase.style.borderBottomWidth);
        windowTop.style.transform = `translate(${xPos}px, ${yPos}px)`;
        windowBase.style.transform = `translate(${xPos}px, ${yPos + yOff}px)`;
    }

    //resize interactions functions
    let isResizing = false;
    let initialWidth;
    let initialHeight;

    resizeHandle.addEventListener('mousedown', startResizing);
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResizing);

    function startResizing(e) {
        isResizing = true;
        initialX = e.clientX;
        initialY = e.clientY;
        initialWidth = parseInt(windowBase.style.width);
        initialHeight = parseInt(windowBase.style.height);
        e.stopPropagation();
        rafId = requestAnimationFrame(updateResize);
    }

    function updateResize(e){
        if (isResizing) {
            const deltaX = mouseX - initialX;
            const deltaY = mouseY - initialY;

            const newWidth = Math.max(300, initialWidth + deltaX);
            const newHeight = Math.max(200, initialHeight + deltaY);

            const maxWidth = window.innerWidth - xOffset;
            const maxHeight = window.innerHeight - yOffset;

            const clampedWidth = Math.min(newWidth, maxWidth);
            const clampedHeight = Math.min(newHeight, maxHeight);

            windowBase.style.width = `${clampedWidth}px`;
            windowTop.style.width = `${clampedWidth}px`;
            windowBase.style.height = `${clampedHeight}px`;

            rafId = requestAnimationFrame(updateResize);
        }
    }

    function resize(e) {
        if (isResizing) {
            e.preventDefault();
        }
    }

    function stopResizing() {
        if (isResizing) {
            isResizing = false;
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
        }
    }

    //minimize window listener
    document.addEventListener(`toggleMinimize_${windowType}`, () => {
        minimizeWindow();
    });

    function minimizeWindow() {
        if (windowBase.style.display === 'none') {
            windowBase.style.display = 'block';
            windowTop.style.display = 'block';
        } else {
            windowBase.style.display = 'none';
            windowTop.style.display = 'none';
        }
    }
};
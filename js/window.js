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
        position: absolute;
        right: 5px;
        top: 50%;
        transform: translateY(-50%);
        background-color: transparent;
        border: none;
        color: white;
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
    `;
    //minimize button
    const minimizeButton = document.createElement('button');
    minimizeButton.textContent = '−';
    minimizeButton.style.cssText = `
        position: absolute;
        right: 27px;
        top: 50%;
        transform: translateY(-50%);
        background-color: transparent;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: background-color 0.2s;
    `;
    //window title
    const windowTitle = document.createElement('span');
    windowTitle.textContent = windowType;;
    windowTitle.style.cssText = `
        color: white;
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
        background-color:rgb(20, 20, 20);
        cursor: default;
        user-select: none;
        border: 10px ridge rgba(0,0,0, .9);
        border-bottom-width: 5px;
    `;
    //window base
    const windowBase = document.createElement('div');
    windowBase.id = `${windowType}WindowBase`;
    windowBase.style.cssText = `
        position: absolute;
        width: 600px;
        height: 400px;
        background-color:rgb(41, 41, 41);
        user-select: none;
        transform: translate(0px, 38px); 
        border: 10px ridge rgba(0,0,0, .9);
        border-top-width: 0px;
    `;
    //window content
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        background-color: white;
    `;
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
    if (windowType === 'youtube') iframe.src = 'https://www.youtube.com/embed/g4Hbz2jLxvQ';


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

    // mouse event listeners
    windowTop.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);

    // close button hover listeners
    closeButton.addEventListener('mouseover', () => {
        closeButton.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    });

    closeButton.addEventListener('mouseout', () => {
        closeButton.style.backgroundColor = 'transparent';
    });

    // close button click listener
    closeButton.addEventListener('click', () => {
        const closeWindowEvent = new CustomEvent(`closeWindow_${windowType}`);
        document.dispatchEvent(closeWindowEvent);
        windowBase.remove();
        windowTop.remove();
    });


    //drag interaction functions
    function startDragging(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === windowTop || e.target === windowTitle) {
            isDragging = true;
        }   
    }

    function drag(e) {
        if (isDragging) {
            windowTop.style.cursor = 'grabbing';
            e.preventDefault();
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setDivPosition(currentX, currentY);
        }
    }

    function stopDragging() {
        windowTop.style.cursor = 'default';
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    // minimize button hover listeners
    minimizeButton.addEventListener('mouseover', () => {
        minimizeButton.style.backgroundColor = 'rgba(128, 128, 128, 0.8)';
    });

    minimizeButton.addEventListener('mouseout', () => {
        minimizeButton.style.backgroundColor = 'transparent';
    });

    // minimize button click listener
    minimizeButton.addEventListener('click', minimizeWindow);

    function setDivPosition(xPos, yPos) {
        const yOff = parseInt(windowTop.style.height) + parseInt(windowTop.style.borderTopWidth);
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
    }

    function resize(e){
        if (isResizing) {
            e.preventDefault();

            const newWidth = initialWidth + (e.clientX - initialX);
            const newHeight = initialHeight + (e.clientY - initialY);

            const minWidth = 300;
            const minHeight = 200;

            if (newWidth > minWidth) {
                windowBase.style.width = `${newWidth}px`;
                windowTop.style.width = `${newWidth}px`;
            }

            if (newHeight > minHeight) {
                windowBase.style.height = `${newHeight}px`;
            }
        }
    }

    function stopResizing() {
        isResizing = false;
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
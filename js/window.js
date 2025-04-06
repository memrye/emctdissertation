import { getWindowConfigs } from './configManager.js';
const configs = await getWindowConfigs();

document.addEventListener('createNewWindow_chatroom', () => {
    createWindow('chatroom', configs.chatroom); 
});
document.addEventListener('createNewWindow_youtube', () => {
    createWindow('youtube', configs.youtube); 
});

window.zCounter = 1; 

function createWindow(windowType, config) {

    //close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
        color: rgb(255, 255, 255);
        position: absolute;
        right: 5px;
        top: 50%;
        transform: translateY(-50%);
        background-color: transparent;
        border: inset rgba(240, 240, 240, 0.2) 1px;
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
        color: rgb(255, 255, 255);
        position: absolute;
        right: 30px;
        top: 50%;
        transform: translateY(-50%);
        background-color: transparent;
        border: inset rgba(240, 240, 240, 0.2) 1px;
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
    windowTitle.textContent = config.title;
    windowTitle.style.cssText = `
        color: rgb(255, 255, 255);
        font-family: monospace, sans-serif;
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 14px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        width: calc(100% - 70px);
        padding-right: 10px;
    `;

    //top of window
    const windowTop = document.createElement('div');
    windowTop.id = `${windowType}WindowTop`;
    windowTop.style.cssText = `
        position: absolute;
        width: ${config.defaultWidth}px;
        height: 28px;
        background-image: linear-gradient(rgba(255, 255, 255, 0.5),rgba(110, 110, 110, 0.5),rgba(110, 110, 110, 0.5));
        backdrop-filter: blur(7px) saturate(200%) brightness(0.7);
        -webkit-backdrop-filter: blur(5.4px);
        cursor: default;
        user-select: none;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        border-bottom-color: rgba(17, 17, 17, 0.38);
        box-shadow: 0px 0px 11px 0px rgba(0,0,0,0.5);
        box-shadow: inset 0px 0px 11px 0px rgba(0,0,0,0.5);
    `;
    //window base
    const windowBase = document.createElement('div');
    windowBase.id = `${windowType}WindowBase`;
    windowBase.style.cssText = `
        position: absolute;
        width: ${config.defaultWidth}px;
        height: ${config.defaultHeight}px;
        radius: 8px;
        background-color: transparent;
        user-select: none;
        transform: translate(0px, 30px); 
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-top-width: 0px;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
        box-shadow: 0px 0px 11px 0px rgba(0,0,0,0.5);
    `;
    //window content
    const iframe = document.createElement('iframe');
    iframe.src = config.content;
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

        const kurwa = ++window.zCounter;
        windowTop.style.zIndex =  kurwa;  
        windowBase.style.zIndex = kurwa;
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
            const maxY = window.innerHeight - (windowTop.offsetHeight + windowBase.offsetHeight); 
            
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
        minimizeButton.style.backgroundColor = 'rgba(223, 223, 223, 0.2)';
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
            const newHeight = Math.max(300, initialHeight + deltaY);

            const maxWidth = window.innerWidth - xOffset;
            const maxHeight = window.innerHeight - yOffset;

            const clampedWidth = Math.min(newWidth, maxWidth);
            const clampedHeight = Math.min(newHeight, maxHeight);

            const kurwa = ++window.zCounter;
            windowTop.style.zIndex =  kurwa;  
            windowBase.style.zIndex = kurwa;

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
import { getWindowConfigs } from './configManager.js';
const configs = await getWindowConfigs();
const socket = io();

document.addEventListener('createNewWindow', (e) => {
    const configsArray = Object.getOwnPropertyNames(configs)
    if (configsArray.includes(e.detail)){
        createWindow(e.detail, configs[e.detail]); 
    };
});

window.zCounter = 1; 

function createWindow(windowType, config) {

    const noresize = config.attributes.includes("no-resize")

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.className = 'window-button window-close';

    const minimizeButton = document.createElement('button');
    minimizeButton.textContent = '−';
    minimizeButton.className = 'window-button window-minimize';

    const windowTitle = document.createElement('span');
    windowTitle.textContent = config.title;
    windowTitle.className = 'window-title';

    const windowTop = document.createElement('div');
    windowTop.id = `${windowType}WindowTop`;
    windowTop.className = 'window-top';
    windowTop.style.width = `${config.defaultWidth}px`;

    const windowBase = document.createElement('div');
    windowBase.id = `${windowType}WindowBase`;
    windowBase.className = 'window-base';
    windowBase.style.width = `${config.defaultWidth}px`;
    windowBase.style.height = `${config.defaultHeight}px`;
    if (noresize){windowBase.style.background = 'transparent'}

    //window content
    const iframe = document.createElement('iframe');
    iframe.src = config.content;
    iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        background-color: transparent;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: ${noresize ? "8" : "16"}px;
        pointer-events: all;
        target: '_self';
    `;
    iframe.allowTransparency = "true";

    windowTop.style.zIndex =  window.zCounter;  
    windowBase.style.zIndex = window.zCounter;
    
    windowTop.appendChild(minimizeButton);
    windowTop.appendChild(closeButton);
    windowTop.appendChild(windowTitle);

    windowBase.appendChild(iframe);

    document.body.appendChild(windowBase);
    document.body.appendChild(windowTop);
    
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset;
    let yOffset;
    let rafId = null;

    // calculate initial center position
    xOffset = Math.max(0, (window.innerWidth - config.defaultWidth) / 2);
    yOffset = Math.max(0, (window.innerHeight - config.defaultHeight) / 3);
    setDivPosition(xOffset, yOffset);
    
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

        socket.emit('windowclose', windowType);
        
        windowBase.remove();
        windowTop.remove();
    });


    //drag interaction functions
    function startDragging(e) {
        const _zindex = ++window.zCounter;
        windowTop.style.zIndex =  _zindex;  
        windowBase.style.zIndex = _zindex;
        iframe.style.pointerEvents = 'none';
        if (e.target === windowTop || e.target === windowTitle) {
            isDragging = true;
            windowTop.style.cursor = 'grabbing';
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            
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
            rafId = requestAnimationFrame(updatePosition);
        }
    }

    function stopDragging() {
        iframe.style.pointerEvents = 'all';
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

    function setDivPosition(xPos, yPos) {
        const yOff = 30;
        windowTop.style.transform = `translate(${xPos}px, ${yPos}px)`;
        windowBase.style.transform = `translate(${xPos}px, ${yPos + yOff}px)`;
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
    };

    if(!noresize){

        //resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle'
        windowBase.appendChild(resizeHandle);

        //resize interactions functions
        let isResizing = false;
        let initialWidth;
        let initialHeight;

        resizeHandle.addEventListener('mousedown', startResizing);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResizing);

        function startResizing(e) {
            iframe.style.pointerEvents = 'none';
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
            iframe.style.pointerEvents = 'all';
            if (isResizing) {
                isResizing = false;
                if (rafId) {
                    cancelAnimationFrame(rafId);
                }
            }
        }
    }

};
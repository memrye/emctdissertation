import { getWindowConfigs } from './configManager.js';
const openWindows = [];

// Load configurations
getWindowConfigs().then(configs => {
    // Create initial desktop icons
    createDesktopIcon('chatroom', 0, 0);
    createDesktopIcon('youtube', 0, 1);
}).catch(error => console.error('Error initializing desktop:', error));


document.addEventListener('DOMContentLoaded', () => {
    createTaskbar();
});

async function createDesktopIcon(buttonType, xOff, yOff) {
    const config = (await getWindowConfigs())[buttonType];
    if (!config) {
        console.error(`No config found for button type: ${buttonType}`);
        return;
    }

    //check if window is already open
    if (openWindows.includes(buttonType)) return;

    const desktopIcon = document.createElement('button');
    desktopIcon.textContent = buttonType;
    desktopIcon.style.cssText = `
        position: absolute;
        left: 10px;
        top: 10px;
        width: 80px;
        height: 80px;
        background-color: transparent;
        color: white;
        border: 0;
        cursor: pointer;
        font-family: monospace, sans-serif;
        transition: background-color 0.2s;
        background: url('${config.icon}') no-repeat;
        background-size: 50px;
        background-position: center top 5px;
        padding-top: 50px;
        transform: translate(${xOff*80}px, ${yOff*80}px);
    `;

    // hover listeners
    desktopIcon.addEventListener('mouseover', () => {
        desktopIcon.style.backgroundColor = 'rgba(70, 70, 70, 0.8)';
    });

    desktopIcon.addEventListener('mouseout', () => {
        desktopIcon.style.backgroundColor = 'transparent';
    });

    // click listener
    desktopIcon.addEventListener('click', () => {
        if (!openWindows.includes(buttonType)) {
            // add window to open window list
            openWindows.push(buttonType);
            // add taskbar button
            addTaskbarButton(buttonType);
            // create event to open a new window
            const createWindowEvent = new CustomEvent(`createNewWindow_${buttonType}`);
            document.dispatchEvent(createWindowEvent);
        }
    });

    //close listener 
    document.addEventListener(`closeWindow_${buttonType}`, () => {
        const index = openWindows.indexOf(buttonType);
        if (index > -1) {
            openWindows.splice(index, 1);
            removeTaskbarButton(buttonType);
        }
    });
    document.body.appendChild(desktopIcon);
};

//CREATE TASKBAR ************************************************

function createTaskbar() {
    const taskbar = document.createElement('div');
    taskbar.id = 'taskbar';
    taskbar.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        background: linear-gradient(rgba(230, 223, 255, 0.21),transparent,transparent,transparent);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(5.4px);
        outline: 1px solid rgba(255, 255, 255, 0.21);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    `;
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'taskbar-buttons';
    buttonContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 5px;
        flex-grow: 1;
    `;
    const datewidget = document.createElement('div');
    datewidget.id = 'datewidget';
    datewidget.style.cssText = `
        line-height: 3;
        color: white;  
        font-family: monospace, sans-serif;
        padding: 0 30px;
        white-space: nowrap;
        height: 100%;
        text-align: center;
        border-left: 1px solid rgba(255, 255, 255, 0.18);
        user-select: none
    `; 
 
    function updateTime() {
        datewidget.textContent = new Date().toLocaleString('en-GB', {
            timeZone: '+01:00',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    }
    updateTime();
    setInterval(updateTime, 1000);

    taskbar.appendChild(buttonContainer);
    taskbar.appendChild(datewidget);
    document.body.appendChild(taskbar);
}

//CREATE TASKBAR BUTTON *****************************************

async function addTaskbarButton(windowType) {
    const config = (await getWindowConfigs())[windowType];
    const buttonContainer = document.getElementById('taskbar-buttons');
    const taskbar = document.getElementById('taskbar');
    const taskButton = document.createElement('button');
    //taskButton.textContent = windowType;
    taskButton.id = `taskbar-${windowType}`;
    taskButton.style.cssText = `
        height: 50px;
        width: 80px;
        padding: 0 15px;
        background: url('${config.icon}') no-repeat;
        background-size: 45px;
        background-position: center;
        cursor: pointer;
        border-radius: 3px;
        transition: background-color 0.2s;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.05);
        box-shadow: inset 0 0.4px 1px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const taskButtonImage = document.createElement('img');
    taskButtonImage.src = config.icon;
    taskButtonImage.style.cssText = `
        width: 80%;
        height: 80%;
        vertical-align: middle;
    `;
    taskButton.appendChild(taskButtonImage);


    // Add hover effect
    taskButton.addEventListener('mouseover', () => {
        taskButton.style.backgroundColor = 'rgba(165, 165, 165, 0.2)';
    });

    taskButton.addEventListener('mouseout', () => {
        taskButton.style.backgroundColor = 'rgba(60, 60, 60, 0)';
    });

    taskButton.addEventListener('click', () => {
        const minimizeEvent = new CustomEvent(`toggleMinimize_${windowType}`);
        document.dispatchEvent(minimizeEvent);
    });

    buttonContainer.appendChild(taskButton);
}

//REMOVE TASKBAR BUTTON *****************************************

function removeTaskbarButton(windowType) {
    const taskButton = document.getElementById(`taskbar-${windowType}`);
    if (taskButton) {
        taskButton.remove();
    }
}


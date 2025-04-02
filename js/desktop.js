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
        background-image: linear-gradient(rgb(248, 248, 248), rgb(200, 200, 200),rgb(185, 185, 185));
        display: flex;
        align-items: center;
        padding: 0 10px;
        gap: 5px;
    `;
    document.body.appendChild(taskbar);
}

//CREATE TASKBAR BUTTON *****************************************

async function addTaskbarButton(windowType) {
    const config = (await getWindowConfigs())[windowType];
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
        border: inset rgb(240, 240, 240) 2px;
        color: white;
        cursor: pointer;
        border-radius: 3px;
        font-family: monospace, sans-serif;
        transition: background-color 0.2s;
    `;

    // Add hover effect
    taskButton.addEventListener('mouseover', () => {
        taskButton.style.backgroundColor = 'rgba(80, 80, 80, 0.2)';
    });

    taskButton.addEventListener('mouseout', () => {
        taskButton.style.backgroundColor = 'rgba(60, 60, 60, 0)';
    });

    taskButton.addEventListener('click', () => {
        const minimizeEvent = new CustomEvent(`toggleMinimize_${windowType}`);
        document.dispatchEvent(minimizeEvent);
    });

    taskbar.appendChild(taskButton);
}

//REMOVE TASKBAR BUTTON *****************************************

function removeTaskbarButton(windowType) {
    const taskButton = document.getElementById(`taskbar-${windowType}`);
    if (taskButton) {
        taskButton.remove();
    }
}


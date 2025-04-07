import { getWindowConfigs } from './configManager.js';
const openWindows = [];

const userDataCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('userData='));


document.addEventListener('DOMContentLoaded', () => {
    
    createTaskbar();
    getWindowConfigs().then(configs => {
        // create desktop icons
        createDesktopIcon('chatroom', 0, 0);
        createDesktopIcon('youtube', 0, 1);
    }).catch(error => console.error('Error initializing desktop:', error));
});

async function createDesktopIcon(buttonType, xOff, yOff) {
    // load window configs
    const config = (await getWindowConfigs())[buttonType];
    if (!config) {return;}
    //check if window is already open
    if (openWindows.includes(buttonType)) return;

    const desktopIcon = document.createElement('button');
    desktopIcon.textContent = buttonType;
    desktopIcon.className = 'desktop-icon';
    desktopIcon.style.backgroundImage = `url('${config.icon}')`;
    desktopIcon.style.transform = `translate(${xOff*80}px, ${yOff*80}px)`;

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

    const userData = getUserData();

    const taskbar = document.createElement('div');
    taskbar.id = 'taskbar';
    taskbar.className = 'taskbar';

    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'taskbar-buttons';
    buttonContainer.className = 'taskbar-button-container';

    const datewidget = document.createElement('div');
    datewidget.id = 'datewidget';
    datewidget.className = 'date-widget';

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

    const startMenuDock = document.createElement('div');
    startMenuDock.id = 'start-menu-dock';
    startMenuDock.className = 'start-menu-dock';


    const startButton = document.createElement('button');
    startButton.id = 'startmenu-button';
    startButton.className = 'start-menu-button';
    startButton.style.background = `url('/images/avatars/${userData.avatar}')`;
    startButton.style.backgroundSize = 'cover';
    startButton.style.backgroundPosition = 'center';

    startButton.addEventListener('click', () => {
        const yPos = parseInt(window.getComputedStyle(startMenuDock).bottom);
        if (yPos === -340){
            startMenuDock.style.bottom = `0px`
            createStartMenu();
        } else {
            startMenuDock.style.bottom = `-340px`
            const closeDelay = parseFloat(window.getComputedStyle(startMenuDock).transitionDuration)
            setTimeout(() => {
                closeStartMenu();
            }, closeDelay * 1000);
        }
        
    });

    startMenuDock.appendChild(startButton);
    taskbar.appendChild(buttonContainer);
    taskbar.appendChild(datewidget);
    document.body.appendChild(startMenuDock);
    document.body.appendChild(taskbar);
}

//CREATE START MENU *****************************************
function createStartMenu() {
    const startMenuDock = document.getElementById('start-menu-dock');

    const startMenuContent = document.createElement('div');
    startMenuContent.id = 'start-menu-content';
    startMenuContent.className = 'start-menu-content';

    const startMenuSidebar = document.createElement('div');
    startMenuSidebar.id = 'start-menu-sidebar';
    startMenuSidebar.className = 'start-menu-sidebar';

    startMenuDock.appendChild(startMenuContent);
    startMenuDock.appendChild(startMenuSidebar);

    createSidebarButton(1, 'Docs');
    createSidebarButton(2, 'Images');
    createSidebarButton(3, 'Videos');
}

function closeStartMenu() {
    const startMenuContent = document.getElementById('start-menu-content');
    startMenuContent.remove();
    const startMenuSidebar = document.getElementById('start-menu-sidebar');
    startMenuSidebar.remove();
}

//CREATE SIDEBAR BUTTONS *****************************************
function createSidebarButton(id, text) {
    const sidebarButton = document.createElement('button');
    const sidebar = document.getElementById('start-menu-sidebar');
    sidebarButton.id = `start-menu-sidebar-button${id}`;
    sidebarButton.className = 'start-menu-sidebar-button';
    sidebarButton.textContent = text;


    sidebarButton.addEventListener('mousedown', () => {

    });

    sidebar.appendChild(sidebarButton);
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

//GET USER DATA *****************************************
function getUserData() {
    const userDataCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('userData='));
    
    if (userDataCookie) {
        const userData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
        return userData;
    }
}

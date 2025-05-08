import { getWindowConfigs } from './configManager.js';
const openWindows = [];
const userData = getUserData();
const socket = io();

document.addEventListener('DOMContentLoaded', () => {

    
    setBackgroundColor(userData.color);
    createTaskbar();
    setupWindowCloseListeners();
    getWindowConfigs().then(configs => {
        // create desktop icons
        createDesktopIcon('chatroom', 0, 0);
        createDesktopIcon('notes', 0, 1);
        createDesktopIcon('mediaplayer', 0, 2);
        createDesktopIcon('browser', 0, 3);
        createDesktopIcon('settings', 1, 0);
        createDesktopIcon('domo', 1, 5);
    }).catch(error => console.error('Error initializing desktop:', error));

    socket.emit('windowstate', 'desktop');

    window.addEventListener('keydown', e => e.key === 'F8' && (window.location.href = '/logout'))

    window.addEventListener('keydown', (e) => {
        socket.emit('keydown', e.key);
    });

});

window.addEventListener('colorChanged', (e) => {
    setBackgroundColor(e.detail);
});

async function setupWindowCloseListeners() {
    const configs = await getWindowConfigs();
    
    Object.keys(configs).forEach(windowType => {
        document.addEventListener(`closeWindow_${windowType}`, () => {
            const index = openWindows.indexOf(windowType);
            if (index > -1) {
                openWindows.splice(index, 1);
                removeTaskbarButton(windowType);
            }
        });
    });
}


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
            const createWindowEvent = new CustomEvent("createNewWindow", { detail: buttonType });
            document.dispatchEvent(createWindowEvent);
        }
    });

    document.body.appendChild(desktopIcon);
};

//CREATE TASKBAR ************************************************

function createTaskbar() {

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
        } 
    });

    document.addEventListener('click', (e)=>{
        if ((!startMenuDock.contains(e.target)) && parseInt(window.getComputedStyle(startMenuDock).bottom) === 0){
            startMenuDock.style.bottom = `-340px`
            const closeDelay = parseFloat(window.getComputedStyle(startMenuDock).transitionDuration)
            setTimeout(() => {
                closeStartMenu();
            }, closeDelay * 1000);
        }
    })

    startMenuDock.appendChild(startButton);
    taskbar.appendChild(buttonContainer);
    taskbar.appendChild(datewidget);
    document.body.appendChild(startMenuDock);
    document.body.appendChild(taskbar);
}

//CREATE START MENU *****************************************
async function createStartMenu() {
    const startMenuDock = document.getElementById('start-menu-dock');

    const sideMenuUsername = document.createElement('div');
    sideMenuUsername.id = 'start-menu-username';
    sideMenuUsername.className = 'start-menu-username';
    sideMenuUsername.textContent = getUserData().username;

    const startMenuContent = document.createElement('div');
    startMenuContent.id = 'start-menu-content';
    startMenuContent.className = 'start-menu-content';

    const configs = await getWindowConfigs();
    Object.entries(configs).forEach(([windowType, config]) => {
        const menuItem = document.createElement('div');
        menuItem.className = 'start-menu-item';
        
        const iconContainer = document.createElement('div');
        iconContainer.className = 'start-menu-item-icon';
        iconContainer.style.backgroundImage = `url('${config.icon}')`;
        
        const textContainer = document.createElement('div');
        textContainer.className = 'start-menu-item-text';
        textContainer.textContent = config.title;

        menuItem.appendChild(iconContainer);
        menuItem.appendChild(textContainer);

        menuItem.addEventListener('click', () => {
            if (!openWindows.includes(windowType)) {
                openWindows.push(windowType);
                addTaskbarButton(windowType);

                const createWindowEvent = new CustomEvent("createNewWindow", { 
                    detail: windowType 
                });
                document.dispatchEvent(createWindowEvent);
                

                startMenuDock.style.bottom = `-340px`;
                const closeDelay = parseFloat(window.getComputedStyle(startMenuDock).transitionDuration);
                setTimeout(() => {
                    closeStartMenu();
                }, closeDelay * 1000);
            }
        });

        menuItem.addEventListener('mouseenter', () => {
            socket.emit('mouseover', 'startMenuContent')
        })

        startMenuContent.appendChild(menuItem);
    });

    const startMenuSidebar = document.createElement('div');
    startMenuSidebar.id = 'start-menu-sidebar';
    startMenuSidebar.className = 'start-menu-sidebar';

    startMenuDock.appendChild(sideMenuUsername);
    startMenuDock.appendChild(startMenuContent);
    startMenuDock.appendChild(startMenuSidebar);

    createSidebarButton(1, 'Docs');
    createSidebarButton(2, 'Images');
    createSidebarButton(3, 'Videos');

    const startMenuLogout = document.createElement('button');
    startMenuLogout.id = 'start-menu-sidebar-logout';
    startMenuLogout.className = 'start-menu-sidebar-logout';
    startMenuLogout.textContent = 'Logout';

    startMenuLogout.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/logout';
    });

    startMenuSidebar.appendChild(startMenuLogout);
}

function closeStartMenu() {
    const startMenuContent = document.getElementById('start-menu-content');
    startMenuContent.remove();
    const startMenuSidebar = document.getElementById('start-menu-sidebar');
    startMenuSidebar.remove();
    const sideMenuUsername = document.getElementById('start-menu-username');
    sideMenuUsername.remove();
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

    sidebarButton.addEventListener('mouseenter', () => {
        socket.emit('mouseover', 'startMenuSidebar')
    })

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

//SET BACKGROUND COLOUR **************************************
function setBackgroundColor(color){
    const backgroundHueshift = document.body;

    let tempRGB = hsl2rgb(color, 0.2, 0.5);
    for (let i = 0; i < 3; i++){
        tempRGB[i] = tempRGB[i]*255
    }
    let DtempRGB = hsl2rgb(color, 0.2, 0.3);
    for (let i = 0; i < 3; i++){
        DtempRGB[i] = DtempRGB[i]*255
    }
    let LtempRGB = hsl2rgb(color, 0.2, 0.7);
    for (let i = 0; i < 3; i++){
        LtempRGB[i] = LtempRGB[i]*255
    }
    
    backgroundHueshift.style.backgroundImage = `radial-gradient(rgb(${LtempRGB[0]}, ${LtempRGB[1]}, ${LtempRGB[2]}), rgb(${tempRGB[0]}, ${tempRGB[1]}, ${tempRGB[2]}),rgb(${DtempRGB[0]}, ${DtempRGB[1]}, ${DtempRGB[2]}))`;
    socket.emit('backgroundChanged', color);
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

//HSL TO RVB *******************************************
function hsl2rgb(h,s,l) 
{
   let a=s*Math.min(l,1-l);
   let f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);
   return [f(0),f(8),f(4)];
}   

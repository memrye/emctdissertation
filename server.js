require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const http = require('http');
const fs = require('fs').promises;
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const maxAPI = require("max-api");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 8000;

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

function requireLogin(req, res, next) {
    const userData = req.cookies.userData;
    if (!userData) {
        res.redirect('/login');
    } else {
        next();
    }
}

app.use(express.static(path.join(__dirname)));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const { chatUsers } = require('./config/chatUsers');
const { futimesSync } = require('fs');

//get chat response from llama through groq api
async function getResponse(userMessage, userPrompt) {
    const completion = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile", 
        messages: [
            { 
                role: "system", 
                content: userPrompt
            },
            {
                role: "user",
                content: userMessage,
            },
        ],
        temperature: 1.1,
        max_tokens: 2048,
        stream: false,
    });
    return completion.choices[0].message.content;
}

io.on('connection', (socket) => {
    const randomUser = chatUsers[Math.floor(Math.random() * chatUsers.length)];
    socket.emit('assigned user', randomUser);

    let isProcessing = false;
    let latestMessage = null;

    async function processMessage(msg) {
        if (isProcessing) {
            latestMessage = msg;
            return;
        }

        isProcessing = true;
        const messageId = Date.now().toString();

        try {
            socket.emit('chat message', {
                id: messageId,
                user: 'You',
                message: msg,
                status: 'sent'
            });

            const response = await getResponse(msg, randomUser.prompt);

            if (latestMessage === null) {
                socket.emit('chat message', {
                    id: messageId + '_response',
                    user: randomUser.username,
                    message: response,
                    status: 'response'
                });
            }

        } catch (error) {
            console.error('Error processing message:', error);
        } finally {
            isProcessing = false;
            
            if (latestMessage !== null) {
                const messageToProcess = latestMessage;
                latestMessage = null;
                await processMessage(messageToProcess);
            }
        }
    }

    // listen for chat messages
    socket.on('chat message', async (msg) => {
        console.log(`msg rcv ${msg}`);
        outletToMax(`user "${msg}"`);
        await processMessage(msg);
    });


    if (typeof(maxAPI) !== 'undefined') {
        //send RMS to mediaplayer
        maxAPI.addHandler("rms", (values) => {
        io.emit('rms', values.split(' '));
        });
    } else {
        
    }
    

    // handle interactions
    socket.on('keydown', (key) => {
        outletToMax(`key "${key}"`);
    });

    socket.on('windowstate', (state) => {
        outletToMax(`windowstate "${state}"`);
    });

    socket.on('loggedin', (state) => {
        outletToMax(`loggedin "${state}"`);
    });

    socket.on('mouseover', (element) => {
        outletToMax(`mouseover "${element}"`);
    });

    socket.on('backgroundChanged', (value) => {
        outletToMax(`backgroundChanged "${value}"`);
    });

    socket.on('isPlaying', (value) => {
        outletToMax(`isPlaying "${value}"`);
    });

    socket.on('seekbar', (value) => {
        outletToMax(`seekbar "${value}"`);
    });

    socket.on('notepad_text', (value) => {
        outletToMax(`notepad_text "${value}"`);
    });

    socket.on('windowclose', (value) => {
        outletToMax(`windowclose "${value}"`);
    });

    socket.on('volumeChanged', (value) => {
        outletToMax(`volumeChanged "${value}"`);
    });

    socket.on('messageIn', (response) => {
        outletToMax(`messenge_in "${response}"`);
    })

    socket.on('fishtank', (values) => {
        outletToMax(`fishtank "${values}"`);
    })

    // handle disconnects
    socket.on('disconnect', () => {

    });
});



app.get('/', requireLogin, (req, res) => {
    res.render('index');
});

app.get('/chatroom', (req, res) => {
    res.render('chatroom');
});

app.get('/mediaplayer', (req, res) => {
    res.render('mediaplayer');
});

app.get('/notepad', (req, res) => {
    res.render('notepad');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/settings', (req, res) => {
    res.render('settings');
});

app.get('/fishtank', (req, res) => {
    res.render('fishtank');
});

app.post('/login', (req, res) => {
    const userData = {
        username: req.body.username,
        avatar: req.body.selectedAvatar,
        color: req.body.backgroundcolorslider,
    };

    res.cookie('userData', JSON.stringify(userData), { maxAge: 900000, httpOnly: false });

    res.redirect('/');
});

app.get('/logout', (req, res) => {
    res.clearCookie('userData');
    res.redirect('/login');
});

app.get('/api/avatars', async (req, res) => {
    try {
        const avatarPath = path.join(__dirname, 'images', 'avatars');
        const files = await fs.readdir(avatarPath);
        const avatars = files.filter(file => 
            ['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(path.extname(file).toLowerCase())
        );
        res.json(avatars);
    } catch (error) {
        console.error('Error reading avatar directory:', error);
        res.status(500).json({ error: 'Failed to load avatars' });
    }
});

app.get('/api/user', (req, res) => {
    const userData = req.cookies.userData;
    res.json(userData ? JSON.parse(userData) : null);
});

function outletToMax(msg) {
    if (typeof(maxAPI) !== 'undefined') {
        maxAPI.outlet(msg);
    } else {
        console.log(`No max API. msg: ${msg}`);
    }
};

// start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/login`);
});
require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const http = require('http');
const fs = require('fs').promises;
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
//const maxAPI = require("max-api");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 8000;

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

app.use(express.static(path.join(__dirname)));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const { chatUsers } = require('./config/chatUsers');

//get chat response from llama through groq api
async function getResponse(userMessage, userPrompt) {
    const completion = await openai.chat.completions.create({
        model: "llama3-70b-8192", 
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
        temperature: 0.7,
        max_tokens: 100,
        stream: false,
    });
    return completion.choices[0].message.content;
}

io.on('connection', (socket) => {

    const randomUser = chatUsers[Math.floor(Math.random() * chatUsers.length)];
    socket.emit('assigned user', randomUser);

    // listen for chat messages
    socket.on('chat message', async (msg) => {
        outletToMax(`user "${msg}"`);
        io.emit('chat message', { user: 'You', message: msg });

        const response = await getResponse(msg, randomUser.prompt);
        setTimeout(() => {
            io.emit('chat message', { 
                user: randomUser.username, 
                message: response 
            });
            outletToMax(`messenge_in "${response}"`);
        }, String(response).length * 50);
    });

    socket.on('keydown', (key) => {
        outletToMax(`key "${key}"`);
    });

    // Handle disconnects
    socket.on('disconnect', () => {

    });
});



app.get('/', (req, res) => {
    res.render('index');
});

app.get('/chatroom', (req, res) => {
    res.render('chatroom');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const userData = {
        username: req.body.username,
        avatar: req.body.selectedAvatar,
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
        console.log(msg);
    }
};

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/login`);
});
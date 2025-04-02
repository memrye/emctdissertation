require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const http = require('http');
const { Server } = require('socket.io');
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
app.set('view engine', 'ejs');

const { chatUsers } = require('./config/chatUsers.js');
const { userInfo } = require('os');

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
    console.log('A user connected:', socket.id);

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
            console.log(String(response).length * 40)
        }, String(response).length * 150);
    });

    // Handle disconnects
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});



app.get('/', (req, res) => {
    res.render('index');
});

app.get('/chatroom', (req, res) => {
    res.render('chatroom');
});

function outletToMax(msg) {
    if (typeof(maxAPI) !== 'undefined') {
        maxAPI.outlet(msg);
    } else {
        return;
    }
};

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
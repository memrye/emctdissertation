require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const http = require('http');
const { Server } = require('socket.io');
const maxAPI = require("max-api");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 8000;

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
});

app.use(express.static(path.join(__dirname)));
app.set('view engine', 'ejs');

//get chat response from OpenAI
async function getResponse(userMessage) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "developer", content: "You are a 2000s internet user in a chatroom. Keep responses brief (one sentence at most) and make use of lowercase and occasional internet acronyms. Do not use emojis and intead use kaomojis or emoticons on occasion" },
            {
                role: "user",
                content: userMessage,
            },
        ],
        store: true,
    });
    return completion.choices[0].message.content;
}

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for chat messages
    socket.on('chat message', async (msg) => {
        //console.log('Message from user:', msg);
        outletToMax(`user "${msg}"`);
        io.emit('chat message', { user: 'You', message: msg });

        const fakeUserResponse = await getResponse(msg);
        setTimeout(() => {
            io.emit('chat message', { user: 'messenger', message: fakeUserResponse });
            outletToMax(`messenger "${fakeUserResponse}"`);
        }, 1000);
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
    maxAPI.outlet(msg);
};

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
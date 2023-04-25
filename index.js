const express = require("express");
const app = express();
require('dotenv').config();
const cors = require("cors");
const http = require("http").createServer(app);
const mongoose = require("mongoose");
const { readdirSync } = require('fs');
const Msg = require("./models/message");
// socket.io setup
const io = require('socket.io')(http, {
    path: "/socket.io",
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        allowHeaders: ["Content-type"]
    }
})

app.get('/api/messages', async (req, res) => {
    const data = await Msg.find();
    console.log('want messagelist -> ', data)
    res.json(data);
})

io.on("connection", (socket) => {
    console.log("connected => ", socket.id);
    // Msg.find().then((result) => {
    //     socket.emit("output", result)
    // })

    socket.on('getMessages', () => {
        Msg.find().then((result) => {
            socket.emit("getMessages", result)
        })
    })

    socket.on('chatMessage', (msg) => {
        console.log(msg);
        const message = new Msg({
            username: msg.username,
            message: msg.message
        });
        message.save()
            .then(() => {
                console.log('message saved successfully');
                // io.emit('chatMessage', msg);
                io.sockets.emit('chatMessage', msg);
                io.sockets.emit('msgSent');
            })
    });

    socket.on('typing', (username) => {
        socket.broadcast.emit('typing', username);
    })
})

// database
mongoose.connect(process.env.DATABASE)
    .then(() => {
        console.log("database connected successfully");
    })
    .catch((err) => {
        console.log("database error => ", err);
    })

// middlewares
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: false }));

// routes
// readdirSync('./routes').map(r => app.use('/api', require(`./routes/${r}`)));

// listening to port
let PORT = process.env.PORT || 4000;

http.listen(PORT, () => {
    console.log("server is running on port => ", PORT);
})
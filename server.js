import express from 'express';
import morgan from 'morgan';
const app = express();
import { readdirSync } from 'fs';
import cors from 'cors';
import mongoose from 'mongoose';
require('dotenv').config();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    path: "/socket.io",
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        allowHeaders: ["Content-type"]
    }
})

// database
mongoose.connect(process.env.DATABASE)
    .then(() => {
        console.log("successfully connected to the database");
    })
    .catch((err) => {
        console.log("database error => ", err);
    })

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: false }));

// routes
readdirSync('./routes').map((r) => app.use('/api', require(`./routes/${r}`)));

// socket.io
// io.on("connect", (socket) => {
//     socket.on("send-message", (message) => {
//         socket.broadcast.emit('receive-message', message);
//     })
// })

io.on("connect", (socket) => {
    socket.on("new-post", (newPost) => {
        console.log("socket io post => ", newPost)
        socket.broadcast.emit("newPost => ", newPost);
    })
})

let PORT = process.env.PORT || 8000;

http.listen(PORT, () => {
    console.log("server is runnning on port ", PORT);
})
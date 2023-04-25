const mongoose = require('mongoose');
const msgSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
})

const Msg = mongoose.model("Msg", msgSchema);
module.exports = Msg;
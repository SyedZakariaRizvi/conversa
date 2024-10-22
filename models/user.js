const mongoose = require("mongoose")

const individualChatsSchema = new mongoose.Schema({
    personName: {
        type: String,
        required: true
    },
    personEmail: {
        type: String,
        required: true
    }, 
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    }
})

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }, 
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    individualChats: [individualChatsSchema]
})

module.exports = mongoose.model("User", userSchema)
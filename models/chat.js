const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema({
    chatType: {
        type: String,
        enum: ['individual', 'group'],
        required: true
    },
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    ]
})

module.exports = mongoose.model("Chat", chatSchema)
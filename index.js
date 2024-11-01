require("dotenv").config()
const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const session = require("express-session")

const path = require("path")

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

const bcrypt = require("bcrypt")

const passport = require("./config/passport.js")
require("./config/passportLocal.js")

const { isLoggedIn } = require("./middlewares.js")

const mongoose = require("mongoose")
const User = require("./models/user")
const Chat = require("./models/chat.js")
const Message = require("./models/message.js")

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Database connected")
    })
    .catch((err) => {
        console.log("Error connecting to database:", err)
    })

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24,
        maxAge: Date.now() + 1000 * 60 * 60 * 24
    }
}
app.use(session(sessionConfig))

app.use(passport.initialize())
app.use(passport.session())

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/register", (req, res) => {
    res.render("auth/register")
})

app.post("/register", async (req, res) => {
    console.log(req.body)
    const { name, email, password } = req.body

    let saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const user = new User({
        name,
        email,
        password: hashedPassword
    })
    user.save()

    res.redirect("/chats")
})

app.get("/login", (req, res) => {
    res.render("auth/login")
})

app.post("/login", passport.authenticate("local"), (req, res) => {
    res.redirect("/chats")
})

app.get("/chats", isLoggedIn, (req, res) => {
    res.render("chats", { user: req.user })
})

app.post("/api/create-chat", isLoggedIn, async (req, res) => {
    try {
        const newChat = new Chat({
            chatType: "individual"
        })
        await newChat.save()
        
        const { otherPersonEmail } = req.body
        const otherPerson = await User.findOne({ email: otherPersonEmail })
        if(!otherPerson) {
            return res.status(404).json({ message: "Other person not found" });
        }
        const otherPersonName = otherPerson.name
        
        await User.updateOne(
            { _id: req.user._id }, 
            { $push: { individualChats: { otherPersonName, otherPersonEmail, chatId: newChat._id } } }
        )
    
        await User.updateOne(
            { email: otherPersonEmail },
            { $push: { individualChats: { otherPersonName: req.user.name, otherPersonEmail: req.user.email, chatId: newChat._id } } }
        )

        io.to(otherPerson._id.toString()).emit("create-chat", {
            personName: req.user.name,
            personEmail: req.user.email,
            chatId: newChat._id
        })
    
        res.status(201).json({ 
            chatId: newChat._id,
            otherPersonName 
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})

app.post("/api/send-message", isLoggedIn, async (req, res) => {
    const { messageText, chatId } = req.body
    const { name } = req.user

    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ message: "Chat not found" })
    }

    const message = new Message({
        senderName: name,
        content: messageText
    })
    await message.save()

    chat.messages.push(message);
    await chat.save();

    res.status(200).send({ message: "Message sent successfully" })
})

app.get("/api/get-chat/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params

    const isInConversation = req.user.individualChats.some(chat => chat.chatId.equals(id))
    if(!isInConversation)
        return res.status(401).send({ message: "Unauthorized" })

    const chat = await Chat.findById(id).populate("messages")
    res.status(200).json(chat)
})

io.on('connection', (socket) => {
    console.log('New client connected')

    socket.on('joinRoom', (userIds) => {
        userIds.forEach(userId => {
            socket.join(userId)
            console.log(`Client joined room: ${userId}`)
        })
    })

    socket.on('disconnect', () => {
        console.log('Client disconnected')
    })
})


server.listen(3000, () => {
    console.log("server started at port 3000")
})
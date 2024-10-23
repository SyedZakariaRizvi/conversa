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

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


server.listen(3000, () => {
    console.log("server started at port 3000")
})
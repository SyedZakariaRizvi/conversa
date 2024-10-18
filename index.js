require("dotenv").config()
const express = require("express")
const http = require("http")

const path = require("path")

const app = express()
const server = http.createServer(app)

const mongoose = require("mongoose")

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Database connected")
    })
    .catch((err) => {
        console.log("Error connecting to database:", err)
    })

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/register", (req, res) => {
    res.render("auth/register")
})

server.listen(3000, () => {
    console.log("server started at port 3000")
})
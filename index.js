const express = require("express")
const http = require("http")

const path = require("path")

const app = express()
const server = http.createServer(app)

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.get("/", (req, res) => {
    res.render("home")
})

server.listen(3000, () => {
    console.log("server started at port 3000")
})
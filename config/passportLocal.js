const passport = require("./passport.js")
const bcrypt = require("bcrypt")
const { Strategy } = require("passport-local")

const User = require("../models/user.js")

passport.use(new Strategy({ usernameField: "email" }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email })

        if(!user) {
            throw new Error("User not found")
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            throw new Error("Invalid credentials")
        }

        done(null, user)
    } catch(err) {
        done(err, null)
    }
}))
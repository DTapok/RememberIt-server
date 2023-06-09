const express = require("express")
const mongoose = require("mongoose")
const config = require("config")
const fileUpload = require("express-fileupload")
const authRouter = require("./routes/auth.routes")
const setCardsRouter = require("./routes/setCards.routes")
const categoriesRouter = require("./routes/categories.routes")
const corsMiddleware = require("./middleware/cors.middleware")
const filePathMiddleware = require("./middleware/fileparh.middleware")

const path = require('path')

const app = express()
const PORT = process.env.PORT || config.get("serverPort")

app.use(fileUpload({}))
app.use(corsMiddleware)
app.use(filePathMiddleware(path.resolve(__dirname, "setCards")))
app.use(express.json())
app.use(express.static('setCards'));
app.use("/api/auth", authRouter)
app.use("/api/setCards", setCardsRouter)
app.use("/api/categoties", categoriesRouter)

const start = async () => {
    try {
        await mongoose.connect(config.get("dbUrl"))
        app.listen(PORT, () => {
            console.log("server started on port ", PORT)
        })
    } catch (error) {
        console.log(error)
    }
}

start()
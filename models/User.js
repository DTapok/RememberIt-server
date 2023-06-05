const { Schema, model, ObjectId } = require("mongoose")

const User = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    role: { type: ObjectId, ref: "Role", default: { _id: "647e4c04864add7ed4414213" } },
    profile: { type: ObjectId, ref: "Profile" }
})

module.exports = model("User", User)
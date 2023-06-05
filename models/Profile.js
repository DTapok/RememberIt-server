const { Schema, model } = require("mongoose")

const Profile = new Schema({
    first_name: { type: String },
    last_name: { type: String },
    avatar: { type: String },
    bio: { type: String },
    contact: { type: String }
})

module.exports = model("Profile", Profile)
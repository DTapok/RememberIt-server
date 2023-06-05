const { Schema, model } = require("mongoose")

const Role = new Schema({
    role_name: { type: String, required: true, unique: true },
})

module.exports = model("Role", Role)
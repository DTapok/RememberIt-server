const { Schema, model, ObjectId } = require("mongoose")

const SetCards = new Schema({
    card: [{ type: ObjectId, ref: "Card" }],
    user: { type: ObjectId, ref: "User" },
    category: { type: ObjectId, ref: "Categories" },
    name: { type: String, required: true, unique: true },
    rating: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now() }
})

module.exports = model("SetCards", SetCards)
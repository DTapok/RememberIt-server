const { Schema, model, ObjectId } = require("mongoose")

const Card = new Schema({
    setCards: { type: ObjectId, ref: "SetCards" },
    front: { type: String, required: true },
    front_path: { type: String },
    back: { type: String, required: true }
})

module.exports = model("Card", Card)
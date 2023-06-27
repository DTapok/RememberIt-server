const { Schema, model, ObjectId } = require("mongoose")

const SavedSets = new Schema({
    user: { type: ObjectId, ref: "User" },
    setCards: [{ type: ObjectId, ref: "SetCards" }]
})

module.exports = model("SavedSets", SavedSets)
const { Schema, model, ObjectId } = require("mongoose")

const PublishedSet = new Schema({
    user: { type: ObjectId, ref: "User" },
    setCards: [{ type: ObjectId, ref: "SetCards" }]
})

module.exports = model("PublishedSet", PublishedSet)
const { Schema, model } = require("mongoose")

const Categories = new Schema({
    category_name: { type: String, required: true, unique: true },
})

module.exports = model("Categories", Categories)
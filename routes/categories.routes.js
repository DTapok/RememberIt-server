const Router = require("express")
const router = new Router()
const Categories = require("../models/Categories")

router.get("", async (req, res) => {
    try {
        const categories = await Categories.find()
        return res.json(categories)
    } catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }
})

router.post("/Add", async (req, res) => {
    try {
        const name = req.body.name
        const categ = await Categories.findOne({ category_name: name })
        if (categ) {
            return res.json({ message: "Такая категория уже существует" })
        } else {
            const category = new Categories({ category_name: name })
            await category.save()
            return res.json({ message: "Категория успешно добавлена" })
        }
    } catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }
})


module.exports = router
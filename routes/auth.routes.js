const Router = require("express")
const User = require("../models/User")
const Role = require("../models/Role")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const config = require("config")
const { check, validationResult } = require("express-validator")
const router = new Router()

router.post("/registration",
    [
        check('email', 'Не корректный email').isEmail(),
        check('username', 'Username не должен быть короче 3 и длинее 8 символов').isLength({ min: 3, max: 8 }),
        check('password', 'Пароль должен быть короче 3 и длинее 12 символов').isLength({ min: 3, max: 12 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: "Uncorrect request", errors })
            }

            const { email, password, username, role } = req.body

            let candidate = await User.findOne({ email })

            if (candidate) { // Проверка на email
                return res.status(400).json({ message: `Пользоваьель с таким email ${email} уже существует` })
            }
            candidate = await User.findOne({ username })
            if (candidate) { // Проверка на username
                return res.status(400).json({ message: `Пользоваьель с таким username ${username} уже существует` })
            }

            const hashPassword = await bcrypt.hash(password, 7)
            const user = new User({ email, password: hashPassword, username, role })
            await user.save()
            return res.json({ message: "Пользователь создан" })
        } catch (error) {
            console.log(error)
            res.send({ message: "Server error" })
        }
    })

router.post("/login",
    async (req, res) => {
        try {
            const { username, password } = req.body
            let user = await User.findOne({ username })
            if (!user) {
                user = await User.findOne({ email: username })
                if (!user) {
                    return res.status(404).json({ message: "Пользователь не найден" })
                }
            }

            const isPassValid = bcrypt.compareSync(password, user.password)
            if (!isPassValid) {
                return res.status(404).json({ message: "Пароль не корректен" })
            }

            const token = jwt.sign({ id: user.id }, config.get("secretKey"), { expiresIn: "1h" })
            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: await Role.findOne({ _id: user.role })
                }
            })

        } catch (error) {
            console.log(error)
            res.send({ message: "Server error" })
        }
    })



module.exports = router
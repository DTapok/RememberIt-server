const Router = require("express")
const User = require("../models/User")
const Profile = require("../models/Profile")
const Role = require("../models/Role")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const config = require("config")
const { check, validationResult } = require("express-validator")
const router = new Router()
const authMiddleware = require("../middleware/auth.middleware")
const setCardsService = require("../services/setCardsService")
const SetCards = require("../models/SetCards")

router.get("/users", async (req, res) => {
    try {
        const users = await User.find()
        return res.json(users)
    } catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }
})

router.get("/profile", async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.query.id })
        if (!profile) {
            return res.json({ message: "Профиль не найден" })
        }
        return res.json(profile)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Не получилось достать профиль" })
    }
})

router.put("/editProfile", authMiddleware, async (req, res) => {
    try {
        const { first_name, last_name, bio, contact } = req.body
        let file = ""

        if (req.files) {
            file = req.files.avatar
        }

        const prof2 = await Profile.findOne({ user: req.user.id })
        let img_for_db = prof2.avatar
        if (file !== "") {
            if (img_for_db !== "") {
                const path = req.filePath + "\\" + img_for_db
                setCardsService.deleteImg(path)
            }
            img_for_db = `${req.user.id}\\${file.name}`
            const img_path = `${req.filePath}\\${req.user.id}\\${file.name}`
            file.mv(img_path)
        }

        const profile = await Profile.findOneAndUpdate({ user: req.user.id }, { avatar: img_for_db, first_name, last_name, bio, contact })
        if (profile === null) {
            return res.json({ message: "Профиль не найден" })
        }

        const prof = await Profile.findOne({ user: req.user.id })
        return res.json(prof)
    } catch (error) {
        return res.status(400).json(error)
    }
})

router.get("/myProfile", authMiddleware, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })
        if (profile === null) {
            return res.json({ message: "Профиль не найден" })
        }
        return res.json(profile)
    } catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }
})

router.get("/usersRole", authMiddleware, async (req, res) => {
    try {
        const users = await User.findOne({ _id: req.user.id })
        return res.json(users.role)
    } catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }
})

router.get("/usersAvatar", authMiddleware, async (req, res) => {
    try {
        const users = await Profile.findOne({ user: req.user.id })
        return res.json(users.avatar)
    } catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }
})

router.post("/registration",
    [
        check('email', 'Не корректный email').isEmail(),
        check('username', 'Username не должен быть короче 3 и длинее 12 символов').isLength({ min: 3, max: 12 }),
        check('password', 'Пароль должен быть короче 3 и длинее 12 символов').isLength({ min: 3, max: 12 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const a = errors.array()
                return res.status(400).json({ message: a[0].msg })
            }

            const { email, password, username, role } = req.body

            let candidate = await User.findOne({ email })

            if (candidate) { // Проверка на email
                return res.status(400).json({ message: `Пользоваьель с email: ${email} уже существует` })
            }
            candidate = await User.findOne({ username })
            if (candidate) { // Проверка на username
                return res.status(400).json({ message: `Пользоваьель с username: ${username} уже существует` })
            }

            const hashPassword = await bcrypt.hash(password, 7)
            const user = new User({ email, password: hashPassword, username, role })
            await user.save()
            await setCardsService.createSet(req, new SetCards({ user: user.id, name: '' }))
            const prof = new Profile({
                user, first_name: "",
                last_name: "",
                avatar: "",
                bio: "",
                contact: email
            })
            prof.save()
            return res.json({ message: "Пользователь создан" })
        } catch (error) {
            console.log(error)
            res.send({ message: "Server error registration" })
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

            const token = jwt.sign({ id: user.id }, config.get("secretKey"), { expiresIn: "30d" })
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
            res.send({ message: "Server error login" })
        }
    })

router.get("/auth", authMiddleware,
    async (req, res) => {
        try {
            const user = await User.findOne({ _id: req.user.id })
            const token = jwt.sign({ id: user._id }, config.get("secretKey"), { expiresIn: "30d" })
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
            res.send({ message: "Server error auth" })
        }
    })


module.exports = router
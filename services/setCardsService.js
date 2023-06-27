const fs = require("fs")
const setCards = require("../models/SetCards")
const config = require("config")

class setCardsService {

    createSet(req, set) {
        let setPath
        if (set.name === "") {
            setPath = req.filePath + '\\' + set.user
        } else {
            setPath = this.getPath(req, set)
        }

        return new Promise(((resolve, reject) => {
            try {
                if (!fs.existsSync(setPath)) {
                    fs.mkdirSync(setPath)
                    return resolve({ message: "Set создан" })
                } else {
                    return reject({ message: "Set не создался" })
                }
            } catch (error) {
                console.log(error)
                return reject({ message: "Создание сета провалилось" })
            }
        }))
    }

    deleteSet(req, set) {
        const path = this.getPath(req, set)
        fs.rmdirSync(path)
    }
    deleteImg(path) {
        fs.unlinkSync(path)
    }

    getPath(req, file) {
        return req.filePath + '\\' + file.user + '\\' + file._id
    }
}



module.exports = new setCardsService()
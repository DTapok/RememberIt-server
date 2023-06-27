const SetCardsService = require("../services/setCardsService")
const SetCards = require("../models/SetCards")
const SavedSet = require("../models/SavedsSets")
const PudlishedSet = require("../models/PublishedSet")
const User = require("../models/User")
const Card = require("../models/Card")
const config = require("config")
const fs = require("fs")
const setCardsService = require("../services/setCardsService")
const express = require("express")

class SetCardsController {
    async createSet(req, res) {
        try {
            const { category, name } = req.body
            const setCards = new SetCards({ category: category, name: name, user: req.user.id })
            await SetCardsService.createSet(req, setCards)
            await setCards.save()
            return res.json(setCards)
        } catch (error) {
            console.log(error)
            return res.status(400).json(error)
        }
    }

    async createCard(req, res) {
        try {
            const { front, back, setName } = req.body
            const card = new Card({ front: front, back: back })
            const setCards = await SetCards.findOne({ name: setName })
            if (setCards) {
                setCards.card.push(card)
                card.setCards = setCards
            }
            await setCards.save()
            await card.save()
            return res.json(card)
        } catch (error) {
            console.log(error)
            return res.status(400).json(error)
        }
    }
    async createCardImg(req, res) {
        try {
            const file = req.files.file
            const { back, setName } = req.body
            const setCards = await SetCards.findOne({ name: setName })
            const img_for_db = `${setCards.user._id}\\${setCards._id}\\${file.name}`
            const img_path = `${req.filePath}\\${setCards.user._id}\\${setCards._id}\\${file.name}`
            file.mv(img_path)
            const card = new Card({ front: "image", front_path: img_for_db, back: back })

            if (setCards) {
                setCards.card.push(card)
                card.setCards = setCards
            }
            await setCards.save()
            await card.save()
            return res.json(card)
        } catch (error) {
            console.log(error)
            return res.status(400).json(error)
        }
    }

    async deletePublishedSet(req, res) {
        try {
            const setCards = await PudlishedSet.findOne({ setCards: req.query.setId })
            if (!setCards) {
                return res.status(400).json({ message: "Сет не найден" })
            }
            await PudlishedSet.deleteOne({ _id: setCards._id })
            return res.json({ message: "Сет успешно удалён из опубликованных!" })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Не получилось удалить опубликованный сет" })
        }
    }
    async deleteSavedSet(req, res) {
        try {
            const setCards = await SavedSet.findOne({ setCards: req.query.setId })
            if (!setCards) {
                return res.status(400).json({ message: "Сет не найден" })
            }
            await SavedSet.deleteOne({ _id: setCards._id })
            return res.json({ message: "Сет успешно удалён из сохранённых!" })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Не получилось удалить сохранённый сет" })
        }
    }

    async deleteSet(req, res) {
        try {
            const setCards = await SetCards.findOne({ _id: req.query.id })
            if (!setCards) {
                return res.status(400).json({ message: "Сет не найден" })
            }
            const cards = await Card.find({ setCards: req.query.id })
            for (let index = 0; index < cards.length; index++) {
                if (cards[index].front === "image") {
                    const path = req.filePath + "\\" + cards[index].front_path
                    setCardsService.deleteImg(req, path)
                    await Card.deleteOne({ _id: cards[index]._id })
                } else {
                    await Card.deleteOne({ _id: cards[index]._id })
                }
            }
            const pubset = await PudlishedSet.findOne({ setCards: setCards._id })
            if (pubset) {
                await PudlishedSet.deleteOne({ _id: pubset._id })
            }
            const savedSet = await SavedSet.find({ setCards: setCards._id })
            for (let index = 0; index < savedSet.length; index++) {
                await SavedSet.deleteOne({ _id: savedSet[index]._id })
            }
            setCardsService.deleteSet(req, setCards)
            await SetCards.deleteOne({ _id: setCards._id })
            return res.json({ message: "Сет успешно удалён!" })

        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Не получилось удалить сет" })
        }
    }

    async getSetCards(req, res) {
        try {
            const setsCard = await SetCards.find({ user: req.user.id })
            return res.json(setsCard)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Не получилось достать сет" })
        }
    }
    async getSet(req, res) {
        try {
            const setsCard = await SetCards.find({ _id: req.query.id })
            if (!setsCard) {
                return res.json({ message: "Сет не найден" })
            }
            return res.json(setsCard)
        } catch (error) {
            return res.status(500).json({ message: "Не получилось достать сет" })
        }
    }

    async getSavedSetCards(req, res) {
        try {
            const setsCard = await SavedSet.find({ user: req.user.id })
            let sets = []
            for (let index = 0; index < setsCard.length; index++) {
                const set = await SetCards.findOne({ _id: setsCard[index].setCards })
                sets.push(set)
            }
            return res.json(sets)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Не получилось достать сет" })
        }
    }
    async getPublishedSetCards(req, res) {
        try {
            const setsCard = await PudlishedSet.find({ user: req.user.id })
            let sets = []
            for (let index = 0; index < setsCard.length; index++) {
                const set = await SetCards.findOne({ _id: setsCard[index].setCards })
                sets.push(set)
            }
            return res.json(sets)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Не получилось достать сет" })
        }
    }
    async getPublishedSet(req, res) {
        try {
            const setsCard = await PudlishedSet.find({})
            let sets = []
            for (let index = 0; index < setsCard.length; index++) {
                const set = await SetCards.findOne({ _id: setsCard[index].setCards })
                sets.push(set)
            }
            return res.json(sets)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Не получилось достать сет" })
        }
    }

    async createPublishedSetCards(req, res) {
        try {
            const setId = req.query.setId
            const setsCard = await SetCards.findOne({ _id: setId })
            if (setsCard) {
                let setpub = await PudlishedSet.findOne({ setCards: setId })
                if (setpub) {
                    return res.json({ message: "Сет уже опубликован" })
                } else {
                    setpub = new PudlishedSet({ setCards: setId, user: req.user.id })
                    await setpub.save()
                    return res.json({ message: "Сет опубликован" })
                }
            } else {
                return res.json({ message: "Сет не найден" })
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Не получилось опубликовать сет" })
        }
    }

    async createSavedSetCards(req, res) {
        try {
            const setId = req.query.setId
            const setsCard = await SetCards.findOne({ _id: setId })
            if (setsCard) {
                if (setsCard.user.toString() === req.user.id) {
                    return res.json({ message: "Вы не можете сохранять свои сеты" })
                }
                let setpub = await SavedSet.findOne({ setCards: setId })
                if (setpub) {
                    return res.json({ message: "Сет уже сохранён" })
                } else {
                    const setpub = new SavedSet({ setCards: setId, user: req.user.id })
                    await setpub.save()
                    return res.json({ message: "Сет сохранён" })
                }

            } else {
                return res.json({ message: "Сет не найден" })
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Не получилось сохранить сет" })
        }
    }

    async getCards(req, res) {
        try {
            const cards = await Card.find({ setCards: req.query.id })
            return res.json(cards)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Не получилось достать сет" })
        }
    }
}


module.exports = new SetCardsController()
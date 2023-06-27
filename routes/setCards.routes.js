const Router = require("express")
const router = new Router()
const authMiddleware = require("../middleware/auth.middleware")
const SetCardsController = require("../controllers/setCardsController")

router.get('/set', SetCardsController.getSet) // Для отдельного сета

router.get('/publishedSet', SetCardsController.getPublishedSet)
router.get('/published', authMiddleware, SetCardsController.getPublishedSetCards)
router.post('/pushsaved', authMiddleware, SetCardsController.createSavedSetCards)
router.get('/saved', authMiddleware, SetCardsController.getSavedSetCards)
router.post('/pushpublished', authMiddleware, SetCardsController.createPublishedSetCards)
router.post('', authMiddleware, SetCardsController.createSet)
router.post('/uploadcard', authMiddleware, SetCardsController.createCard)
router.post('/uploadcardImg', authMiddleware, SetCardsController.createCardImg)
router.get('', authMiddleware, SetCardsController.getSetCards)
router.get('/cards', SetCardsController.getCards)
router.delete('/deleteSaved', authMiddleware, SetCardsController.deleteSavedSet)
router.delete('/delete', authMiddleware, SetCardsController.deleteSet)
router.delete('/deletePublished', authMiddleware, SetCardsController.deletePublishedSet)

module.exports = router
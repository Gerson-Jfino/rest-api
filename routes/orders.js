const express = require("express")
const ordersController = require('../controllers/orders-controller')
const auth = require("../middleware/login")
const router = express.Router()

router.get('/', auth,ordersController.index)
router.get('/:order_id', auth,ordersController.show)
router.post('/', auth, ordersController.store)
router.delete('/:order_id', auth, ordersController.destroy)

module.exports = router
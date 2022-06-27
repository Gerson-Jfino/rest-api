const express = require("express")
const ordersController = require('../controllers/orders-controller')
const router = express.Router()

router.get('/', ordersController.index)
router.get('/:order_id', ordersController.show)
router.post('/', ordersController.store)
router.delete('/:order_id', ordersController.destroy)

module.exports = router
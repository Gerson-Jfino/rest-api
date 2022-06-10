const express = require("express")
const router = express.Router()

router.get('/', (req, res, next) => {
    res.status(200).send({
        message: "returned all orders"
    })
})

router.get('/:order_id', (req, res, next) => {
    const order_id = req.params.order_id
    res.status(200).send({
        message: "return specific order",
        order_id
    })
})

router.post('/', (req, res, next) => {
    const order = {
        product_id: req.body.product_id,
        quantity: req.body.quantity
    }
    res.status(201).send({
        message: "new order",
        order: {
            order
        }
    })
})

router.delete('/:order_id', (req, res, next) => {
    const order_id = req.params.order_id
    res.status(200).send({
        message: "order deleted successfully",
        order_id
    })
})

module.exports = router
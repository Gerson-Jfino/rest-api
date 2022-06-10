const express = require("express");
const router = express.Router()

router.get('/', (req, res, next) => {
    res.status(200).send({
        message: "returned all products"
    })
})

router.get('/:product_id', (req, res, next) => {
    const product_id = req.params.product_id
    res.status(200).send({
        message: "return specific product",
        product_id
    })
})

router.post('/', (req, res, next) => {
    const produto = {
        nome_produto: req.body.nome,
        quantidade_preco: req.body.preco
    }
    res.status(201).send({
        message: "new product",
        produto: produto
    })
})

router.delete('/:product_id', (req, res, next) => {
    const product_id = req.params.product_id
    res.status(200).send({
        message: "product deleted successfully"
    })
})

module.exports = router;
const express = require("express");
const productsController = require("../controllers/products-controller")
const auth = require('../middleware/login')
const upload = require('../services/multer')
const router = express.Router()

router.get('/', productsController.index)
router.get('/:product_id', productsController.show)
router.post('/', auth, upload.single('product_image'), productsController.store)
router.delete('/:product_id', auth, productsController.destroy)
router.patch('/', auth, productsController.update)

module.exports = router;
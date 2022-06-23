const express = require("express");
const mysql = require("../services/mysql").pool
const multer = require("multer")
const router = express.Router()

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads')
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
    }
})
function fileFilter  (req, file, cb) {
    if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
})

router.get('/', (req, res, next) => {
    try {
        mysql.getConnection((error, conn) => {
            if(error) {return res.status(500).send(error)}
            conn.query('SELECT * FROM products;', (err, result, fields) => {
                if(err) {return res.status(500).send(err)}
                conn.release()
                const response = {
                    message: "products returned successfully",
                    products: result.map(res => {
                        return {
                            id: res.id,
                            name: res.name,
                            price: res.price,
                            image: res.image ? `http://localhost:3000/${res.image}` : null,
                            request: {
                                method: 'GET',
                                description: 'Get product details',
                                url: `http://localhost:3000/products/${res.id}`
                            }
                        }
                    }),
                    total: result.length,
                    description: "return all products"
                }
                res.status(200).send({
                    response
                })
            }) 
        })
        
    } catch (err) {
        res.status(500).send({
            error: error
        })
    }
})

router.get('/:product_id', (req, res, next) => {
    
    try {
        mysql.getConnection((error, conn) => {
            if(error) {return res.status(500).send(error)}
            conn.query('SELECT * FROM products WHERE id=?;',
            [req.params.product_id], (err, result, fields) => {
                if(error) {return res.status(500).send(error)}
                conn.release()
                const {id, name, price, image} = result[0]
                const response = {
                    message: "product returned successfuly",
                    product: {
                        id,
                        name,
                        price,
                        image: `http://localhost/${image}`,
                        request: {
                            method: 'GET',
                            description: 'Get all products',
                            url: 'http://localhost:3000/products/'
                        }
                    },

                }
                res.status(200).send(response)
            })
        })
    } catch (Err) {
        res.status(500).send({
            status: 500,
            error: Err
        })
    }
})

router.post('/', upload.single('product_image'),(req, res, next) => {
    console.log(req.file)
    try {
        mysql.getConnection((error, conn) => {
            if(error) {return res.status(500).send(error)}
            conn.query('INSERT INTO products (name, price, image) VALUES (?,?,?);',
                [req.body.name, req.body.price, req.file.path], (err, result, fields) => {
                    if(err) {return res.status(500).send(err)}
                    conn.release();
                    const response = {
                        message: "product created successfuly",
                        product: {
                            id: result.insertId,
                            name: req.body.name,
                            price: req.body.price,
                            image: `http://localhost:3000/${req.file.path}`,
                            request: {
                                method: 'GET',
                                description: 'Get all products',
                                url: 'http://localhost:3000/products/'
                            }
                        }
                    }
                    res.status(201).send(response)
                }
            );
        })
    } catch(err) {
        res.status(500).send({
            error: err
        })
    }
})

router.delete('/:product_id', (req, res, next) => {
    try {
        mysql.getConnection((error, conn) => {
            if(error) {return res.status(500).send(error)}
            conn.query(`DELETE FROM products
                            WHERE id = ?;`,
                [req.params.product_id], (err, result, fields) => {
                    if(err) {return res.status(500).send(err)}
                    conn.release()
                    const response = {
                        message: 'Product deleted successfully',
                        request: {
                            method: 'POST',
                            description: 'Insert new product',
                            url: 'http://localhost:3000/products/'
                        }
                    }
                    res.status(200).send(response)
                })
        })
    } catch (err) {
        res.status(500).send({
            error: 500
        })
    }
})

router.patch('/', (req, res, next) => {
    try {
        mysql.getConnection((error, conn) => {
            if(error) {return res.status(500).send(error)}
            conn.query(`UPDATE products 
                            SET name    = ?,
                                price   = ?
                            WHERE id    = ?;`,
                [req.body.name, req.body.price, req.body.id], (err, result, fields) => {
                    if(err) {return res.status(500).send(err)}
                    conn.release();
                    const {id, name, price} = req.body
                    const response = {
                        message: 'Producted updated successfully',
                        product: {
                            id, name, price,
                            request: {
                                method: 'GET',
                                description: 'Get product details',
                                url: `http://localhost:3000/products/${id}`
                            }
                        }
                    }
                    res.status(200).send(response)
                }
            );
        })
    } catch(err) {
        res.status(500).send({
            error: err
        })
    }
})

module.exports = router;
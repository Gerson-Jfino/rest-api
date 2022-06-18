const express = require("express");
const { response } = require("../app");
const mysql = require("../services/mysql").pool
const router = express.Router()

router.get('/', (req, res, next) => {
    try {
        mysql.getConnection((error, conn) => {
            conn.query('SELECT * FROM products;', (err, result, fields) => {
                conn.release()
                const response = {
                    message: "products returned successfully",
                    products: result.map(res => {
                        return {
                            id: res.id,
                            name: res.name,
                            price: res.price,
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
            conn.query('SELECT * FROM products WHERE id=?;',
            [req.params.product_id], (err, result, fields) => {
                conn.release()
                const {id, name, price} = result[0]
                const response = {
                    message: "product returned successfuly",
                    product: {
                        id,
                        name,
                        price,
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

router.post('/', (req, res, next) => {
    try {
        mysql.getConnection((error, conn) => {
            conn.query('INSERT INTO products (name, price) VALUES (?,?);',
                [req.body.name, req.body.price], (err, result, fields) => {
                    conn.release();
                    const response = {
                        message: "product created successfuly",
                        product: {
                            id: result.insertId,
                            name: req.body.name,
                            price: req.body.price,
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
            conn.query(`DELETE FROM products
                            WHERE id = ?;`,
                [req.params.product_id], (err, result, fields) => {
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
            conn.query(`UPDATE products 
                            SET name    = ?,
                                price   = ?
                            WHERE id    = ?;`,
                [req.body.name, req.body.price, req.body.id], (err, result, fields) => {
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
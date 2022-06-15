const express = require("express");
const mysql = require("../services/mysql").pool
const router = express.Router()

router.get('/', (req, res, next) => {
    try {
        mysql.getConnection((error, conn) => {
            conn.query('SELECT * FROM products;', (err, response, field) => {
                conn.release()
                res.status(200).send({
                    data: response
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
            [req.params.product_id], (err, result, field) => {
                conn.release()
                res.status(200).send({
                    data: result
                })
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
                [req.body.name, req.body.price], (err, result, field) => {
                    conn.release();
                    res.status(201).send({
                        message: 'product created successfully',
                        product_id: result.insertId
                    })
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
                [req.params.product_id], (err, result, field) => {
                    conn.release()
                    res.status(200).send({
                        message: "product deleted successefully"
                    })
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
            if(error) {return res.status(500).send({error})}
            conn.query(`UPDATE products 
                            SET name    = ?,
                                price   = ?
                            WHERE id    = ?;`,
                [req.body.name, req.body.price, req.body.product_id], (err, result, field) => {
                    if(error) {return res.status(500).send({error})}
                    conn.release();
                    res.status(200).send({
                        message: 'product updated successfully'
                    })
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
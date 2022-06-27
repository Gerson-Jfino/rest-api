const mysql = require("../services/mysql").pool

module.exports = {
    index: (req, res, next) => {
        mysql.getConnection((error, conn) => {
            if (error) {return res.status(500).send(error)}
            conn.query(`SELECT orders.id,
                               orders.quantity,
                               orders.product_id,
                               products.name,
                               products.price
                          FROM orders
                    INNER JOIN products
                            ON products.id = orders.product_id;`, (error, result, fields) => {
                if (error) {return res.status(500).send(error)}
                conn.release()
                const response = {
                    message: 'Orders returned successfully',
                    orders: result.map(ord => {
                        const {id, product_id, quantity, name, price} = ord
                        return {
                            id: id,
                            quantity: quantity,
                            product: {
                                id: product_id,
                                name: name,
                                price: price
                            },
                            request: {
                                method: 'GET',
                                description: 'Order details',
                                ur: `http://localhost/orders/${id}`
                            },
                        }
                    }),
                    total: result.length
                }
                return res.status(200).send(response)
            })
        })
    },
    show: (req, res, next) => {
        mysql.getConnection((err, conn) => {
            if (err) {return res.status(500).send(err)}
            conn.query(`SELECT orders.id,
                               orders.quantity,
                               orders.product_id,
                               products.name,
                               products.price
                          FROM orders 
                    INNER JOIN products
                            ON products.id = orders.product_id
                         WHERE orders.id = ?;`,
                [req.params.order_id], (err, result, fields) => {
                    if (err) { return res.status(500).send(err) }
                    conn.release()
                    const {id, product_id, quantity, name, price} = result[0]
                    const response = {
                        message: 'order details retrivied',
                        order: {
                            id, quantity,
                            product: {
                                id: product_id,
                                name,
                                price
                            }
                        },
                        request: {
                            method: 'GET',
                            description: 'Return all orders',
                            url: 'http://localhost:3000/orders'
                        }
                    }
                    res.status(200).send(response)
                })
        })
    },
    store: (req, res, next) => {
        try {
            mysql.getConnection((error, conn) => {
                if (error) {return res.status(500).send(error)}
                conn.query('SELECT * FROM products WHERE id=?;',
                    [req.body.product_id], (error, result, fields) => {
                        if (error) {return res.status(500).send(error)}
                        if(result.length == 0){
                            conn.release()
                            return res.status(404).send({
                                message: 'Product not founded.'
                            })
                        }
                    });
                conn.query('INSERT INTO orders (quantity, product_id) VALUES (?, ?);',
                    [req.body.quantity, req.body.product_id], (error, result, fields) => {
                        conn.release()
                        if (error) {return res.status(500).send(error)}
                        const {quantity, product_id} = req.body
                        const response = {
                            message: 'Order placed successfully',
                            order: {
                                id: result.insertId,
                                quantity,
                                product_id
                            }
                        }
                        return res.status(200).send(response)
                    })
            })
        } catch (error) {
            res.status(500).send({
                error
            })
        }
    },
    destroy: (req, res, next) => {
        mysql.getConnection((err, conn) => {
            if(err) {return res.status(500).send(err)}
            conn.query('DELETE FROM orders WHERE id = ?;',
                [req.params.order_id], (err, result, fields) => {
                    if(err) {return res.status(500).send(err)}
                    conn.release()
                    const response = {
                        message: 'Order deleted successfully',
                        request: {
                            method: 'POST',
                            description: 'Make new order',
                            url: 'http://localhost:3000/orders'
                        }
                    }
                    res.status(200).send(response)
                })
        })
    }
}
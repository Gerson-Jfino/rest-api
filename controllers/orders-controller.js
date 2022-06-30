const mysql = require("../services/mysql")

module.exports = {
    index: async (req, res, next) => {
        try {
            const result = await mysql.execute(`SELECT orders.id,
                                                       orders.quantity,
                                                       orders.product_id,
                                                       products.name,
                                                       products.price
                                                  FROM orders
                                            INNER JOIN products
                                                    ON products.id = orders.product_id;`);
            const response = {
                message: 'Orders returned successfully',
                orders: result.map(ord => {
                    const {id, product_id, quantity, name, price} = ord
                    return {
                        id,
                        quantity,
                        product: {
                            id: product_id,
                            name,
                            price
                        },
                        request: {
                            method: 'GET',
                            desc: 'Order details',
                            url: `http://localhost:3000/orders/${id}`
                        }
                    };
                }),
                total: result.length
            };
            return res.status(200).send(response);
        } catch (error) {
            return res.status(500).send({
                error: error
            })
        }
    },
    show: async (req, res, next) => {
        try {
            const result = await mysql.execute(`SELECT orders.id,
                                                       orders.quantity,
                                                       orders.product_id,
                                                       products.price
                                                       products.name
                                                  FROM orders
                                            INNER JOIN products
                                                    ON products.id = orders.product_id
                                                 WHERE orders.id = ?;`, [req.params.order_id]);
            if (result.length === 0) {return res.status(404).send({message: 'order not found'})}
                                            
            const {id, product_id, quantity, name, price} = result[0];
            const response = {
                message: 'order details retrieved successfully',
                order: {
                    id,
                    quantity,
                    product: {
                        id: product_id,
                        name,
                        price
                    }
                },
                request: {
                    method: 'GET',
                    desc: 'Return all orders',
                    url: 'http://localhost:3000/orders'
                }
            };
            return res.status(200).send(response);
        } catch (error) {
            return res.status(500).send(
                error
            );
        }
    },
    store: async (req, res, next) => {
        try {
            const result = await mysql.execute('SELECT * FROM products WHERE id=?;', [req.body.product_id]);
            if (result.length === 0) {
                return res.status(404).send({
                    message: 'Product not found'
                });
            }
            await mysql.execute('INSERT INTO orders (quantity, product_id) VALUES (?, ?);', [req.body.quantity, req.body.product_id]);
            const {quantity, product_id} = req.body;
            const response = {
                message: 'Order placed'
            };
            return res.status(200).send(response);
        } catch (error) {
            res.status(500).send({
                error
            })
        }
    },
    destroy: async (req, res, next) => {
        try {
            await mysql.execute('DELETE FROM orders WHERE id = ?;', req.params.id);
            return res.status(200).send({
                message: 'Order canceled',
                request: {
                    method: 'POST',
                    desc: 'Make new order',
                    url: 'http://localhost:3000/orders'
                }
            });            
        } catch (error) {
            return res.status(500).send(error);
        }
    }
}
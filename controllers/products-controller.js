const mysql = require('../services/mysql')
module.exports = {
    index: async (req, res, next) => {
        try {
            const result = await mysql.execute('SELECT * FROM products;')
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
            return res.status(200).send({response})
        } catch (error) {
            return res.status(500).send({message: "Server error"})
        }

    },
    show: async (req, res, next) => {
        try {
            const result = await mysql.execute('SELECT * FROM products WHERE id=?;', [req.params.product_id]);
            if (result.length === 0) {
                return res.status(404).send({
                    message: 'Product not founded'
                });
            }
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
            return res.status(200).send(response)
        } catch (error) {
            return res.status(500).send({
                error: error
            })
        }
    },
    store: async (req, res, next) => {
        try {
            const result = await mysql.execute('INSERT INTO products (name, price, image) VALUES (?,?,?);', [req.body.name, req.body.price, req.file.path]);
            const response = {
                message: 'product created successfully',
                product: {
                    id: result.insertId,
                    name: req.body.name,
                    price: req.body.price,
                    imaege: `http://localhost:3000/${req.file.path}`,
                    request: {
                        method: 'GET',
                        desc: 'Get all products',
                        url: 'http://localhost:3000/products'
                    }
                }
            };
            return res.status(200).send({response});
        } catch (error) {
            return res.status(500).send({
                error: error
            });
        }
    },
    update: async (req, res, next) => {
        try {
            await mysql.execute('UPDATE products SET name = ?, price = ? WHERE id = ?;', [req.body.name, req.body.price, req.body.id]);
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
            };
            return res.status(200).send(response);
        } catch(err) {
            return res.status(500).send({
                error: err
            });
        }
    },
    destroy: async (req, res, next) => {
        try {
            const result = await mysql.execute('DELETE FROM products WHERE id = ?;', req.params.id);
            if (result.affectedRows) {res.status(500).send({message: 'No product founded'})}
            const response = {
                message: 'Product deleted successfully',
                request: {
                    method: 'POST',
                    description: 'Insert new product',
                    url: 'http://localhost:3000/products/'
                }
            }
            return res.status(200).send(response);
        } catch (err) {
            return res.status(500).send({
                error: 500
            });
        }
    }

}
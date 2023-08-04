const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { token } = require('morgan');
const mysql = require('../services/mysql')

module.exports = {
    register: async (req, res, next) => {
        try {
            const result = await mysql.execute('SELECT * FROM users WHERE email = ?;', [req.body.email]);
            if(result.length !== 0) {
                res.status(409).send({
                    message: 'This email has been taken.'
                });
            } else {
                bcrypt.hash(req.body.password, 10, async (error, hashPassword) => {
                    if(error){return res.status(500).send(error);}
                    const result = await  mysql.execute('INSERT INTO users (name, email, password) VALUES (?,?,?);', [req.body.name, req.body.email, hashPassword]);
                    const {name, email} = req.body;
                    const response = {
                        message: "Account created successfully.",
                        user: {
                            id: result.insertId,
                            name,
                            email
                        }
                    };
                    return res.status(200).send(response);
                })
            }    
        } catch (error) {
            return res.status(500).send(error)
        }
    },
    login: async (req, res, next)  => { 
        try {
            const user = await mysql.execute('SELECT * FROM users WHERE email = ?;', [req.body.email]);
            if( user.length === 0 ) {
                const result = await  mysql.execute('INSERT INTO users (name, email, password) VALUES (?,?,?);', ["empty", req.body.email, "random"]);
                function userData () {
                    const {email} = req.body;
                    return { email };
                };
                const token = await jwt.sign(userData(), 'any,SecreteKey', {
                    expiresIn: "1h"
                });
                const response = {
                    message: 'Authenticated successfully',
                    token
                }
                res.status(200).send(response);
            }
            // const { password } = user[0];
            // if (value) {
                function userData () {
                    const {email} = user[0];
                    return { email };
                };
                const token = await jwt.sign(userData(), 'any,SecreteKey', {
                    expiresIn: "1h"
                });
                const response = {
                    message: 'Authenticated successfully',
                    token
                }
                res.status(200).send(response);
            // bcrypt.compare(req.body.password, password, async (err, value) => {
            //     if (err) { return res.status(401).send({message: 'Unauthorized'}); }
            //     } else {
            //         return res.status(401).send({message: 'Unauthorized'});
            //     }
            // })
        } catch (error) {
            return res.status(500).send(error)
        }
    }
}
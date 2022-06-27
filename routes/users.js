const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mysql = require('../services/mysql').pool
const router = express.Router()

router.post('/register', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send(error)}
        conn.query('SELECT * FROM users where email = ?;',
            [req.body.email], (err, result) => {
                if(err) {return res.status(500).send({err})}
                if(result.length !== 0){
                    conn.release()
                    return res.status(409).send({
                        message: "user already exist"
                    })
                } else {
                    bcrypt.hash(req.body.password, 10, (errBcrypt, hash) => {
                        if(errBcrypt) {return res.status(500).send({ errBcrypt })}
                        conn.query('INSERT INTO users (name, email, password) VALUES (?,?,?)',
                            [req.body.name, req.body.email, hash], 
                            (err, result, fields) => {
                                conn.release()
                                if(err) {return res.status(500).send({err})}
                                const {name, email} = req.body
                                const response = {
                                    message: 'user created successfully',
                                    user: {
                                        id: result.inserId,
                                        name,
                                        email
                                    }
                                }
                                return res.status(200).send(response)
                            })
                    })
                }
            })
    })
})

router.post('/login', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error})}
        conn.query('SELECT * FROM users WHERE email = ?;',
            [req.body.email], (err, result, field) => {
                conn.release()
                if(err) { return res.status(500).send({err})}
                if(result.length === 0) {
                    return res.status(401).send({
                        message: 'Unauthorized'
                    })
                }
                const {password} = result[0]
                bcrypt.compare(req.body.password, password, (err, value) => {
                    if (err) {return res.status(401).send({message: 'Unauthorized'})}
                    if(value) {
                        const {name, email} = result[0]
                        const user = {name, email}
                        const token = jwt.sign(user, "any,SecreteKey", {
                            expiresIn: "1h"
                        })
                        const response = {
                            message: 'Authenticated successfully',
                            token
                        }
                        return res.status(200).send(response)
                    }
                    return res.status(401).send({message: 'Unauthorized'})
                })
            })
    })
})

module.exports = router
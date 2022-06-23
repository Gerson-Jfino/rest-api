const express = require('express');
const bcrypt = require('bcrypt')
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
                                if(err) {return res.status(500).send({err})}
                                conn.release()
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

module.exports = router
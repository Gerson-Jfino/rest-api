const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.verify(token, 'any,SecreteKey')
        req.user = decode
        // console.log(req.user);
        next()
    } catch (error) {
        res.status(401).send({message: 'Unauthorized'})
    }
}
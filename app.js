const productsRoutes = require("./routes/products")
const pedidosRoutes = require("./routes/orders")
const express = require("express");
const morgan = require("morgan")
const bodyParser = require("body-parser")
const  app = express();

app.use(morgan("dev"))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use('/products', productsRoutes);
app.use('/orders', pedidosRoutes);

app.use((req, res, next) => {
    const error = new Error("undefiened route");
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    return res.send({
        message: error.message
    })
})


module.exports = app;
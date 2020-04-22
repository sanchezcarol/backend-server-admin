//Requires
var express = require('express')
var mongoose = require('mongoose');

//Inicializar variable
var app = express()

//Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: "Todo bien"
    });
})

//Conect mongoose
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err
    console.log("base de datos : \x1b[32m%s\x1b[0m", "online");
});

//Escuchando peticiones
app.listen(3000, () => {
    console.log("Servidor en el puerto 3000: \x1b[32m%s\x1b[0m", "online");

})
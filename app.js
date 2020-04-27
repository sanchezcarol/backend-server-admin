//Requires
var express = require('express')
var mongoose = require('mongoose');
var bodyParser = require('body-parser')

//Imports 
var appRoutes = require('./routes/app')
var userRoutes = require('./routes/user')
var loginRoutes = require('./routes/login')
var hospitalRoutes = require('./routes/hospital')
var medicRoutes = require('./routes/medic')
var searchRoutes = require('./routes/search')
var uploadRoutes = require('./routes/upload')
var imagesRoutes = require('./routes/images')
    //Inicializar variable
var app = express()


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())

//Rutas
app.use('/user', userRoutes)
app.use('/login', loginRoutes)
app.use('/hospital', hospitalRoutes)
app.use('/medic', medicRoutes)
app.use('/search', searchRoutes)
app.use('/upload', uploadRoutes)
app.use('/images', imagesRoutes)
app.use('/', appRoutes)

//Conect mongoose
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err
    console.log("base de datos : \x1b[32m%s\x1b[0m", "online");
});

//Escuchando peticiones
app.listen(3000, () => {
    console.log("Servidor en el puerto 3000: \x1b[32m%s\x1b[0m", "online");

})
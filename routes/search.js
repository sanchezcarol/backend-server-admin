var express = require("express")
var app = express()

var Hospital = require('../models/hospital')
var Medics = require('../models/medic')
var User = require('../models/user')




//========================================
// Busqueda por coleccion
//=========================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla

    var busqueda = req.params.busqueda
    var regex = new RegExp(busqueda, 'i')
    var promise;

    switch (tabla) {
        case 'users':
            promise = searchUsers(regex)
            break;
        case 'hospitals':
            promise = searchHospital(regex)
            break;
        case 'medics':
            promise = searchMedics(regex)
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'los tipos de busqueda solo son -users,medics,hospitals-',
                error: { mensaje: 'tabla no válida' }
            })
    }

    promise.then(resultado => {
        res.status(200).json({
            ok: true,
            mensaje: 'busqueda por coleccion',
            [tabla]: resultado

        })
    })
})

//========================================
// Busqueda general
//=========================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda
    var regex = new RegExp(busqueda, 'i')

    //funcion (all) que permite ejecutar un arreglo de promesas
    Promise.all([
            searchHospital(regex),
            searchMedics(regex),
            searchUsers(regex)
        ])
        .then(resp => {
            res.status(200).json({
                ok: true,
                mensaje: "Todo bien",
                hospitales: resp[0],
                medics: resp[1],
                users: resp[2]
            });
        })


});


function searchHospital(regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ name: regex })
            .populate('user', 'name email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error con la busqueda')
                } else {
                    resolve(hospitales)
                }
            })
    })
}

function searchMedics(regex) {

    return new Promise((resolve, reject) => {

        Medics.find({ name: regex })
            .populate('user', 'name email')
            .populate('hospital', 'name')
            .exec((err, medics) => {

                if (err) {
                    reject('Error con la busqueda')
                } else {
                    resolve(medics)
                }
            })
    })
}

function searchUsers(regex) {
    return new Promise((resolve, reject) => {
        User.find({})
            .or([{ 'name': regex }, { 'email': regex }]) //or (func de mongoose) que permite comprobar un arreglo de condiciones 
            .exec((err, users) => {
                if (err) {
                    reject('Error con la busqueda')
                } else {
                    resolve(users)
                }
            })
    })
}

module.exports = app;
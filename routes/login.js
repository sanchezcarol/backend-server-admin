var express = require('express')
var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')

var User = require('../models/user')

var app = express()


app.post('/', (req, res) => {

    var body = req.body

    User.findOne({ email: body.email }, (err, userDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "error",
                errors: err
            })
        }
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error de credenciales - email"
            })
        }
        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error de credenciales - password"
            })
        }

        userDB.password = ':)'

        //Token
        var token = jwt.sign({ usuario: userDB }, 'jwt-seed-csan', { expiresIn: 5000 })

        res.status(200).json({
            ok: true,
            mensaje: 'login post',
            userDB,
            id: userDB._id,
            token
        })
    })
})

module.exports = app
var express = require("express")
const bcrypt = require('bcrypt');

var app = express()

var User = require('../models/user')
var tokenAuth = require('../middlewares/authentication')

app.get('/', (req, res) => {

    var since = req.query.since || 0
    since = Number(since)

    User.find({}, 'name email role img google')
        .skip(since)
        .limit(5)
        .exec((err, users) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error en la Base de Datos User",
                    errors: err
                })

            }

            User.count({}, (err, count) => {
                res.status(200).json({
                    ok: true,
                    users,
                    total: count
                });
            })


        })
});

app.post('/', (req, res) => {

    var body = req.body;

    var user = new User({
        name: body.name,
        password: bcrypt.hashSync(body.password, 10),
        email: body.email,
        img: body.img,
        role: body.role
    })

    user.save((err, saveUser) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error saving user",
                errors: err
            })

        }

        res.status(201).json({
            ok: true,
            saveUser,
            userToken: req.user
        })
    })

})

app.put('/:id', [tokenAuth.Authentication, tokenAuth.AuthenticationAdmin], (req, res) => {

    var id = req.params.id
    var body = req.body


    User.findById(id, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "error",
                errors: err
            })

        }
        if (!user) {
            return res.status(400).json({
                ok: false,
                mensaje: "El usuario con el ID " + id + "no existe",

            })
        }

        user.name = body.name,
            user.email = body.email,
            user.role = body.role,

            user.save((err, saveUser) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "Error saving user",
                        errors: err
                    })

                }
                res.status(201).json({
                    ok: true,
                    saveUser

                })

            })

    })
})

app.delete('/:id', [tokenAuth.Authentication, tokenAuth.AuthenticationAdmin], (req, res) => {

    var id = req.params.id

    User.findByIdAndRemove(id, (err, userDelete) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "error borrando el usuario",
                errors: err
            })

        }
        if (!userDelete) {
            return res.status(400).json({
                ok: false,
                mensaje: "El usuario con el ID " + id + " no existe",

            })
        }

        res.status(201).json({
            ok: true,
            mensaje: "Usuario eliminado exitosamente",
        })
    })
})



module.exports = app;
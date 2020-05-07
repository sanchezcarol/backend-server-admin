var express = require('express')
var Medics = require('../models/medic')
var authToken = require('../middlewares/authentication')

var app = express()

app.get('/', (req, res) => {

    var since = req.query.since || 0
    since = Number(since)

    Medics.find({})
        .skip(since)
        .limit(5)
        .populate('user', 'name email')
        .populate('hospital', 'name id')
        .exec((err, medicsDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error en la base de datos Medicos'
                })
            }

            Medics.count({}, (err, count) => {
                res.status(200).json({
                    ok: true,
                    medicsDB,
                    total: count

                })
            })

        })

})

app.get('/:id', (req, res) => {

    var id = req.params.id

    Medics.findById(id)
        .populate('user', 'name email img')
        .populate('hospital')
        .exec((err, medic) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    errors: err
                })
            }

            if (!medic) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Médico no existe'
                })
            }

            res.status(200).json({
                medic: medic
            })


        })



})

app.post('/', authToken.Authentication, (req, res) => {

    var body = req.body

    var medic = new Medics({
        name: body.name,
        img: body.img,
        user: req.user._id,
        hospital: body.hospital
    })

    medic.save((err, saveMedic) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando medico'
            })
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Medico guardado en la BD',
            saveMedic
        })
    })
})

app.put('/:id', authToken.Authentication, (req, res) => {
    var body = req.body
    var id = req.params.id

    Medics.findById(id, (err, medic) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "error",
                errors: err
            })

        }
        if (!medic) {
            return res.status(400).json({
                ok: false,
                mensaje: "El medico con el ID " + id + "no existe",

            })
        }

        medic.name = body.name
        medic.hospital = body.hospital
        medic.user = req.user.id

        medic.save((err, saveMedic) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error saving medico",
                    errors: err
                })

            }

            res.status(201).json({
                ok: true,
                saveMedic
            })
        })
    })
})

app.delete('/:id', authToken.Authentication, (req, res) => {

    var id = req.params.id

    Medics.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { message: 'No existe un medico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            medicoBorrado
        });

    });


})

module.exports = app
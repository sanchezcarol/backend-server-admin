var express = require('express')
var Hospital = require('../models/hospital')
var tokenAuth = require('../middlewares/authentication')

var app = express()

app.get('/', (req, res) => {

    var since = req.query.since || 0
    since = Number(since)

    Hospital.find({})
        .skip(since)
        .populate('user', 'nombre email')
        .limit(5)
        .exec((err, hospitalDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'err',
                    errors: err
                })
            }
            if (!hospitalDB) {
                return res.status(501).json({
                    ok: false,
                    mensaje: 'no hay hospitales registrados en la BD'
                })
            }

            Hospital.count({}, (err, count) => {
                res.status(200).json({
                    ok: true,
                    hospitalDB,
                    total: count
                })
            })

        })


})

app.get('/:id', (req, res) => {

    let id = req.params.id

    Hospital.findById(id)
        .populate('users', 'name email img')
        .exec((err, hospital) => {


            if (err) {
                return res.status(400).json({
                    ok: false,
                    errors: err
                })
            }

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    message: 'el hospital con el id: ' + id + 'no existe'
                })
            }

            res.status(200).json({
                ok: true,
                hospital: hospital
            })


        })

})


app.post('/', tokenAuth.Authentication, (req, res) => {

    var body = req.body
    console.log(req.user);

    var hospital = new Hospital({
        name: body.name,
        user: req.user._id,
        img: body.img
    })

    hospital.save((err, hospitalSave) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'error creando hospital',
                erros: err
            })
        }
        res.status(201).json({
            ok: true,
            mensaje: 'Hospital creado exitosamente',
            hospitalSave
        })
    })

})

app.put('/:id', tokenAuth.Authentication, (req, res) => {
    var body = req.body
    var id = req.params.id

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "error",
                errors: err
            })

        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: "El hospital con el ID " + id + "no existe",

            })
        }

        hospital.name = body.name
        hospital.user = req.user.id

        hospital.save((err, saveHospital) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error saving hospital",
                    errors: err
                })

            }

            res.status(201).json({
                ok: true,
                saveHospital
            })
        })
    })
})

app.delete('/:id', tokenAuth.Authentication, (req, res) => {

    var id = req.params.id

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });


})


module.exports = app
var express = require("express")
const fileUpload = require('express-fileupload');
var fs = require('fs')

var User = require('../models/user')
var Hospital = require('../models/hospital')
var Medic = require('../models/medic')


var app = express()

app.use(fileUpload());

app.put('/:colection/:id', (req, res, next) => {

    var colection = req.params.colection
    var id = req.params.id
    var validColection = ['medics', 'hospitals', 'users']

    if (validColection.indexOf(colection) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Error. Tipo de coleccion no válida"
        });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    var file = req.files.img
    var splitName = file.name.split('.')
    var extFile = splitName[splitName.length - 1]

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg']

    if (extensionesValidas.indexOf(extFile) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Error cargando archivo. Extensión no válida",
            error: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
        });
    }

    var filename = `${id}-${new Date().getMilliseconds()}.${extFile}`


    var path = `./uploads/${colection}/${filename}`

    file.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'no se pudo mover el archivo',
                errors: err
            })
        }

        updateImage(colection, id, filename, res)

    })



});


function updateImage(colection, id, filename, res) {

    if (colection == 'users') {

        User.findById(id, (err, user) => {

            if (!user) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El Usuario con el ID ' + id + ' no existe',
                    errors: err
                })
            }

            oldPath = './uploads/users/' + user.img

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
                console.log('elimina');
            }

            user.img = filename

            user.save((err, userSave) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen',
                        errors: err
                    })
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen subida exitosamente',
                    userSave
                })
            })

        })
    }
    if (colection == 'medics') {
        Medic.findById(id, (err, medic) => {

            if (!medic) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El Usuario con el ID ' + id + ' no existe',
                    errors: err
                })
            }

            oldPath = './uploads/medics/' + medic.img

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            medic.img = filename

            medic.save((err, medicSave) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen',
                        errors: err
                    })
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen subida exitosamente',
                    medicSave
                })
            })

        })

    }
    if (colection == 'hospitals') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El Usuario con el ID ' + id + ' no existe',
                    errors: err
                })
            }

            oldPath = './uploads/hospitals/' + hospital.img

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            hospital.img = filename

            hospital.save((err, hospitalSave) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen',
                        errors: err
                    })
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen subida exitosamente',
                    hospitalSave
                })
            })

        })
    }


}

module.exports = app;
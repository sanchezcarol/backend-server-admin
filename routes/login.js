var express = require('express')
var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')
var User = require('../models/user')

var app = express()

var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


// =================================================
//  Authentication by Google
// =================================================
async function verify(token) {

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });

    const payload = ticket.getPayload()

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });

    User.findOne({ email: googleUser.email }, (err, userDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'User not found',
                errors: err
            });
        }

        if (userDB) {
            console.log('user fb ', userDB);

            if (userDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal'
                });
            } else {
                var token = jwt.sign({ user: userDB }, 'jwt-seed-csan', { expiresIn: 15000 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    user: userDB,
                    token: token,
                    id: userDB.id
                });
            }

        } else {
            // El usuario no existe... hay que crearlo

            var user = new User();

            user.name = googleUser.nombre;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            user.password = ':)';


            user.save((err, userDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        errors: err
                    })
                }

                var token = jwt.sign({ user: userDB }, 'jwt-seed-csan', { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: userDB,
                    token: token,
                    id: userDB.id
                });

            });

        }


    });

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'OK!!!',
    //     googleUser: googleUser
    // });

})



//==================================
// normal Authentication
//================================== 

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
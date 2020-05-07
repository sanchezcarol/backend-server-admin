var express = require('express')
var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')
var User = require('../models/user')

var app = express()

var CLIENT_ID = require('../config/config').CLIENT_ID;
var authToken = require('../middlewares/authentication')
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// =================================================
//  Renew token 
// =================================================

app.get('/renewToken', authToken.Authentication, (req, res) => {

    var token = jwt.sign({ user: req.user }, 'jwt-seed-csan', { expiresIn: 5000 })

    return res.status(200).json({
        ok: true,
        token: token
    })


})

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
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (userDB) {

            if (userDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal'
                });
            } else {
                var token = jwt.sign({ user: userDB }, 'jwt-seed-csan', { expiresIn: 14400 }); // 4 horas
                res.status(200).json({
                    ok: true,
                    user: userDB,
                    token: token,
                    id: userDB._id,
                    menu: getMenu(userDB.role)
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

                var token = jwt.sign({ user: userDB }, 'jwt-seed-csan', { expiresIn: 14400 }); // 4 horas
                res.status(200).json({
                    ok: true,
                    user: userDB,
                    token: token,
                    id: userDB._id,
                    menu: getMenu(userDB.role)
                });

            });

        }


    });




    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'OK!!!',
    //     googleUser: googleUser
    // });


});


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
        var token = jwt.sign({ user: userDB }, 'jwt-seed-csan', { expiresIn: 5000 })
        res.status(200).json({
            ok: true,
            mensaje: 'login post',
            userDB,
            id: userDB._id,
            token,
            menu: getMenu(userDB.role)
        })
    })
})

function getMenu(ROLE) {
    var menu = [{
            titulo: 'Principal',
            icon: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'Graphics1', url: '/graphics1' },
                { titulo: 'Rxjs', url: '/rxjs' }
            ]
        },
        {
            titulo: 'Mantenimiento',
            icon: 'mdi mdi-folder-lock-open',
            submenu: [
                { titulo: 'Medicos', url: '/medics' },
                { titulo: 'Hospitales', url: '/hospitals' },

            ]
        }
    ]

    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/users' })
    }

    return menu
}

module.exports = app
jwt = require('jsonwebtoken')


exports.Authentication = function(req, res, next) {

    token = req.query.token


    jwt.verify(token, 'jwt-seed-csan', (err, decoded) => {

        if (err) {
            return res.status(501).json({
                ok: false,
                mensaje: "Invalid token",
                errors: err
            })
        }

        req.user = decoded.usuario

        next();



    })




}
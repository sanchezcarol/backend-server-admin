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

        req.user = decoded.user
        next();

    })




}


exports.AuthenticationAdmin = function(req, res, next) {

    var user = req.user
    var id = req.params.id

    if (user.role === 'ADMIN_ROLE' || id == user._id) {
        next();
        return
    } else {
        return res.status(501).json({
            ok: false,
            mensaje: "Invalid token - Acción no válida. Debe ser un administrador.",
        })
    }

}
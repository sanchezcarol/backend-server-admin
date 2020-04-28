var mongoose = require("mongoose")
var uniqueValidator = require('mongoose-unique-validator')

var Schema = mongoose.Schema
var validRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: "rol {{VALUE}} no está permitido"
}

var userSchema = Schema({

    name: { type: String, required: [true, 'El nombre es requerido'] },
    email: { type: String, unique: true, required: [true, 'El email es requerido'] },
    password: { type: String, required: [true, 'El password es requerido'] },
    img: { type: String },
    role: { type: String, default: "USER_ROLE", required: true, enum: validRoles },
    google: { type: Boolean, required: true, default: false },


})

userSchema.plugin(uniqueValidator, { message: '{PATH} ya está en uso' })

module.exports = mongoose.model('User', userSchema)
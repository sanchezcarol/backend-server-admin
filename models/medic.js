var mongoose = require('mongoose')
var Schema = mongoose.Schema

var medicosSchema = Schema({

    name: { type: String, required: [true, 'el nombre es requerido'] },
    img: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: [true, 'El hospital es requerido'] }


})

module.exports = mongoose.model('medics', medicosSchema)
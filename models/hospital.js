var mongoose = require('mongoose')
var Schema = mongoose.Schema

var hospitalSchema = new Schema({

    name: { type: String, required: [true, 'el nombre es requerido'] },
    img: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User' },


})

module.exports = mongoose.model('Hospital', hospitalSchema)
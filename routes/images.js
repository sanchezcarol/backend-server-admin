var express = require("express")
var fs = require('fs')
var app = express()

app.get('/:type/:img', (req, res) => {

    var img = req.params.img
    var type = req.params.type

    var path = `./uploads/${ type }/${ img }`

    fs.exists(path, exists => {
        if (!exists) {

            path = './assets/noimage.png'
        }

        res.sendfile(path)

    })



});

module.exports = app;
var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')

//custom modules..
var controller = require('./backend/controller.js')

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/programs', express.static(path.join(__dirname, '/backend/programs')));
app.use(controller.main())

var port = process.env.PORT || 9000
app.listen(port, function() {
	console.log("Server Started on port "+port);
})
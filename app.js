// ACL Systems ©2019 Derechos Reservados
// Para modificar este archivo, contacte a:
// servicedesk@aclsystems.mx
// Nombre del archivo: app.js
const express 		= require('express');
const bodyParser	= require('body-parser');
const helmet 			= require('helmet');
const routes 			= require('./routes/routes');
const app 				= express();

app.use(helmet());
app.use(bodyParser.json({limit: '10mb'}));
routes(app);

app.use(function(req,res) {
	res.status(404).json({
		'message': 'No existe el API solicitada'
	});
});

module.exports = app;

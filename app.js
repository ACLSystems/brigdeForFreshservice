// ACL Systems ©2019 Derechos Reservados
// Para modificar este archivo, contacte a:
// servicedesk@aclsystems.mx
// Nombre del archivo: app.js
const express 		= require('express');
const bodyParser	= require('body-parser');
const helmet 			= require('helmet');
const routes 			= require('./routes/routes');
const app 				= express();

app.disable('x-powered-by');
/** Encabezados CORS */
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*'); // restrict it to the required domain
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key,Authorization');
	if (req.method == 'OPTIONS') {
		res.status(200).end();
	} else {
		next();
	}
});

app.use(helmet());
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({extended:true, limit: '10mb'}));
routes(app);

app.use(function(req,res) {
	res.status(404).json({
		'message': 'No existe el API solicitada'
	});
});

module.exports = app;

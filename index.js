// ACL Systems ©2019 Derechos Reservados
// Para modificar este archivo, contacte a:
// servicedesk@aclsystems.mx
// Nombre del archivo: index.js
const version = require('./version/version');
const app 		= require('./app');
const logger 	= require('./shared/winston-logger');

app.set('port', process.env.PORT || 3050);
app.set('json spaces', 2);

var server = app.listen(app.get('port'),() => {
	console.log(version.app + '@' + version.version + ' ' + version.vendor + ' \u00A9' + version.year ); // eslint-disable-line
	console.log('Servidor disponible en el puerto ' + server.address().port); // eslint-disable-line
	logger.info('Servidor disponible en el puerto ' + server.address().port);
});

// ACL Systems ©2019 Derechos Reservados
// Para modificar este archivo, contacte a:
// servicedesk@aclsystems.mx
// Nombre del archivo: routes/routes
const GetNothing 				= require('../controllers/get_nothing');
const TicketController	= require('../controllers/tickets');

module.exports = (app) => {
	app.all('/*', function(req, res, next) {
		// CORS headers
		res.header('Access-Control-Allow-Origin', '*'); // restrict it to the required domain
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		// Set custom headers for CORS
		res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
		if (req.method == 'OPTIONS') {
			res.status(200).end();
		} else {
			next();
		}
	});

	app.get('/', GetNothing.greeting);
	app.post('/api/v2/tickets', TicketController.createTicket);
};

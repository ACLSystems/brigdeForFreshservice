const {
	body,
	validationResult
} 	= require('express-validator');

module.exports = {
	createTicket: [
		body('url', 'Se requiere el url').isURL().exists(),
		body('asset','Debe ser una cadena').isString().optional(),
		body('description', 'Se requiere la descripción').exists(),
		body('assetContinue', 'Debe ser booleano').isBoolean().optional(),
		body('email', 'Debe contener el email de quien genera el ticket').isEmail().exists(),
		body('subject', 'Debe contener el asunto del ticket').isString().exists(),
		body('apikey', 'Hace falta la llave para generar tickets').isString().exists()
	],
	results(req,res,next) {
		//console.log(req.headers);
		const errors = validationResult(req);
		if(!errors.isEmpty()) {
			return res.status(404).json({
				message: 'Error: Favor de revisar los errores siguientes',
				errors: errors.array()
			});
		} else {
			next();
		}
	}
};

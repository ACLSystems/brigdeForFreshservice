// ACL Systems ©2019 Derechos Reservados
// Para modificar este archivo, contacte a:
// servicedesk@aclsystems.mx
// Nombre del archivo: ticket.js
const HTTPRequest = require('request-promise-native');
const logger 			= require('../shared/winston-logger');
const urlencode 	= require('urlencode');
const version 		= require('../version/version');

module.exports = {
	async createTicket(req,res) {
		const asset 		= req.body.asset 			|| null;
		const email 		= req.body.email 			|| process.env.EMAIL;
		const uri 			= process.env.URI 		|| req.body.uri;
		const apiKey 		= process.env.APIKEY 	|| req.body.apikey;
		const assetContinue = req.body.assetContinue || false;

		const tags 			= req.body.tags	|| ['monitoreo','PRTG'];
		const source 		= Number.parseInt(process.env.SOURCE) 	|| Number.parseInt(req.body.source) 	|| 12;
		const urgency 	= Number.parseInt(process.env.URGENCY) 	|| Number.parseInt(req.body.urgency) 	|| 3;
		const priority 	= Number.parseInt(process.env.PRIORITY) || Number.parseInt(req.body.priority) || 3;
		const status		= Number.parseInt(process.env.STATUS) 	|| Number.parseInt(req.body.status) 	|| 2;

		const assetURLEncoded = urlencode(req.body.asset) || null;
		const auth 			= new Buffer.from(apiKey + ':X');
		const now 			= new Date();

		var options = {
			method 	: 'GET',
			uri			:	uri + '/api/v2/assets?query=%22name:%27' + assetURLEncoded + '%27%22',
			headers	: {
				'Authorization': 'Basic ' + auth.toString('base64')
			},
			timeout : 2000
		};

		try {
			let assetData = JSON.parse(await HTTPRequest(options));
			options.body = {
				description			: req.body.description + '<br><br><p><small>' + version.app + '/' + version.version + ' @' + version.year + ' ' + version.contact + '</small></p>',
				email 					: email,
				subject					: req.body.subject,
				priority				: priority,
				urgency					: urgency,
				status					: status,
				source					: source,
				tags						: tags,
				cc_emails				: req.body.cc_emails,
				custom_fields 	: req.body.custom_fields,
				due_by					: req.body.due_by,
				fr_due_by				: req.body.fr_due_by,
				category				: req.body.category,
				sub_category		: req.body.sub_category,
				item_category		: req.body.item_category,
				associate_ci: {
					name: asset
				}
			};
			options.json		= true;
			options.method 	= 'POST';
			options.uri 		= uri + '/api/v2/tickets';

			if((options.body.cc_emails && options.body.cc_emails.length === 0) || !options.body.cc_emails) {
				delete options.body.cc_emails;
			}
			if(!options.body.custom_fields) {
				delete options.body.custom_fields;
			}
			if(!options.body.due_by) {
				delete options.body.due_by;
			} else {
				options.body.due_by = new Date(options.body.due_by);
				if(options.body.due_by < now) {
					res.status(409).json({
						'message': '-due_by- debe ser mayor que la hora de creación del ticket (mayor a este momento)'
					});
					return;
				}
			}
			if(!options.body.fr_due_by) {
				delete options.body.fr_due_by;
			} else {
				options.body.fr_due_by = new Date(options.body.fr_due_by);
				if(options.body.fr_due_by < now) {
					res.status(409).json({
						'message': '-fr_due_by- debe ser mayor que la hora de creación del ticket (mayor a este momento)'
					});
					return;
				}
			}
			if(!options.body.category) {
				delete options.body.category;
			}
			if(!options.body.sub_category) {
				delete options.body.sub_category;
			}
			if(!options.body.item_category) {
				delete options.body.item_category;
			}

			if(options.body.due_by && !options.body.fr_due_by) {
				res.status(409).json({
					'message': 'Si se proporciona la propiedad -due_by- se requiere que se proporcione también -fr_due_by-'
				});
				return;
			}

			if(assetData.assets.length === 1) {
				assetData = assetData.assets[0];
				options.body.department_id	= assetData.department_id;
				options.body.group_id 			= assetData.group_id;
				try {
					let ticketResponse = await HTTPRequest(options);
					ticketResponse.uri = uri;
					ticketResponse.createdBy = version.app + '/' + version.version + ' @' + version.year;
					ticketResponse.created = now.toString();
					res.status(200).json(ticketResponse);
				} catch (err) {
					res.status(err.statusCode).json(err);
					logger.info('Hubo un error. Favor de revisar: ' + err);
				}
			} else if(assetData.assets.length === 0) {
				if(assetContinue) {
					try {
						delete options.body.associate_ci;
						let ticketResponse = await HTTPRequest(options);
						res.status(200).json(ticketResponse);
					} catch (err) {
						res.status(err.statusCode).json(err);
						logger.info('Hubo un error. Favor de revisar: ' + err);
					}
				} else {
					res.status(404).json({
						message: 'No existe activo con el nombre ' + asset + '. Favor de revisar. ( assetContinue = ' + assetContinue + ' )'
					});
				}
			} else {
				res.status(404).json({
					message: 'Aparecen más de un activo con el nombre ' + asset + '. Favor de revisar.'
				});
			}
		} catch (err) {
			logger.info('Hubo un error. Favor de revisar: ' + err);
		}
	} // createTicket
};

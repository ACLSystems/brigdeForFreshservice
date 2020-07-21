// ACL Systems ©2019 Derechos Reservados
// Para modificar este archivo, contacte a:
// servicedesk@aclsystems.mx
// Nombre del archivo: ticket.js
const logger 			= require('../shared/winston-logger');
const urlencode 	= require('urlencode');
const version 		= require('../version/version');

module.exports = {
	async createTicket(req,res) {
		const asset 		= req.body.asset 			|| null;
		const email 		= req.body.email 			|| process.env.EMAIL;
		const url 			= req.body.url 				|| process.env.URL;
		const apiKey 		= req.body.apikey 		|| process.env.APIKEY;
		const assetContinue = req.body.assetContinue || false;

		var tags 			= req.body.tags	|| ['monitoreo'];
		if(!Array.isArray(tags)) {
			tags = JSON.parse(tags);
		}
		const source 		= Number.parseInt(process.env.SOURCE) 	|| Number.parseInt(req.body.source) 	|| 12;
		const urgency 	= Number.parseInt(process.env.URGENCY) 	|| Number.parseInt(req.body.urgency) 	|| 3;
		const priority 	= Number.parseInt(process.env.PRIORITY) || Number.parseInt(req.body.priority) || 3;
		const status		= Number.parseInt(process.env.STATUS) 	|| Number.parseInt(req.body.status) 	|| 2;

		const assetURLEncoded = urlencode(req.body.asset) || null;
		const auth 			= new Buffer.from(apiKey + ':X');
		const now 			= new Date();


		try {
			var options = {
				method 	: 'get',
				url			:	url + '/api/v2/assets?query=%22name:%27' + assetURLEncoded + '%27%22',
				headers	: {
					'Authorization': 'Basic ' + auth.toString('base64')
				}
			};
			var assetData = await getResponse(options);
			options.data = {
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
			options.method 	= 'post';
			options.url 		= url + '/api/v2/tickets';

			if((options.data.cc_emails && options.data.cc_emails.length === 0) || !options.data.cc_emails) {
				delete options.data.cc_emails;
			}
			if(!options.data.custom_fields) {
				delete options.data.custom_fields;
			}
			if(!options.data.due_by) {
				delete options.data.due_by;
			} else {
				options.data.due_by = new Date(options.data.due_by);
				if(options.data.due_by < now) {
					res.status(409).json({
						'message': '-due_by- debe ser mayor que la hora de creación del ticket (mayor a este momento)'
					});
					return;
				}
			}
			if(!options.data.fr_due_by) {
				delete options.data.fr_due_by;
			} else {
				options.data.fr_due_by = new Date(options.data.fr_due_by);
				if(options.data.fr_due_by < now) {
					res.status(409).json({
						'message': '-fr_due_by- debe ser mayor que la hora de creación del ticket (mayor a este momento)'
					});
					return;
				}
			}
			if(!options.data.category) {
				delete options.data.category;
			}
			if(!options.data.sub_category) {
				delete options.data.sub_category;
			}
			if(!options.data.item_category) {
				delete options.data.item_category;
			}

			if(options.data.due_by && !options.data.fr_due_by) {
				res.status(409).json({
					'message': 'Si se proporciona la propiedad -due_by- se requiere que se proporcione también -fr_due_by-'
				});
				return;
			}

			var assets = [];
			if(assetData && assetData.data && assetData.data.assets) {
				assets = [...assetData.data.assets];
			}

			if(assets.length === 1) {
				assetData = assets[0];
				options.data.department_id	= assetData.department_id;
				options.data.group_id 			= assetData.group_id;
				let response = await getResponse(options);
				let ticketResponse = response.data;
				ticketResponse.url = url;
				ticketResponse.createdBy = version.app + '/' + version.version + ' @' + version.year;
				ticketResponse.created = now.toString();
				res.status(200).json(ticketResponse);
				logger.info('Se generó un ticket: ' + ticketResponse);
			} else if(assets.length === 0) {
				if(assetContinue) {
					delete options.data.associate_ci;
					let response = await getResponse(options);
					let ticketResponse = response.data;
					ticketResponse.url = url;
					ticketResponse.createdBy = version.app + '/' + version.version + ' @' + version.year;
					ticketResponse.created = now.toString();
					res.status(200).json(ticketResponse);
					logger.info('Se generó un ticket: ' + ticketResponse);
				} else {
					res.status(404).json({
						message: 'No existe activo con el nombre ' + asset + '. Favor de revisar. ( assetContinue = ' + assetContinue + ' )'
					});
					logger.info('404: No existe activo con el nombre ' + asset + '. Favor de revisar. ( assetContinue = ' + assetContinue + ' )');
					logger.info('Se intentó generar ticket:');
					logger.info(options);
					return;
				}
			} else {
				res.status(404).json({
					message: 'Aparecen más de un activo con el nombre ' + asset + '. Favor de revisar.'
				});
				logger.info('404: Aparecen más de un activo con el nombre ' + asset + '. Favor de revisar.');
				logger.info('Se intentó generar ticket:');
				logger.info(options);
				return;
			}
		} catch (err) {
			logger.info('Hubo un error. Favor de revisar: ' + err);
			console.log('Hubo un error. Favor de revisar: ');
			console.log(err);
			res.status(500).json(err);
			return;
		}
	}, // createTicket

	async getTicket(req,res) {
		const url 			= req.body.url 		|| process.env.URL;
		const apiKey 		= req.body.apikey || process.env.APIKEY;
		const method		= req.body.method	|| 'get';
		const auth 			= new Buffer.from(apiKey + ':X');
		var options = {
			method,
			url,
			headers	: {
				'Authorization': 'Basic ' + auth.toString('base64')
			}
		};
		console.log(options);
		try {
			const response = await getResponse(options);
			console.log(response);
			res.status(response.status).json(response.data);
		} catch (e) {
			res.status(500).json(e.error);
		}

	}, // getTicket

	mirror(req,res) {
		if(typeof req.body === 'object') {
			res.status(200).json({
				'type': 'object',
				'method': req.method,
				'body': req.body
			});
		} else {
			res.status(200).send('type: string ','method: ' + req.method + ' body:' + JSON.stringify(req.body));
		}
	}
};

/* private functions */

async function getResponse(options) {
	const axios = require('axios');
	try {
		return await axios(options);
	} catch (err) {
		const sender = process.env.NODE_SENDER_EMAIL;
		const ticket_email = version.contact;
		const key = process.env.NODE_SENDER_KEY;

		const send = require('gmail-send')({
			user: sender,
			pass: key,
			to: ticket_email,
			subject: 'Error en Bridge ' + version.version,
			text: err
		});
		console.log('Error!!!');
		console.log(err);
		const result = await send();
		console.log(result);
	}
}

const version = require('../version/version');

module.exports = {
	greeting(req, res) {
		res.status(200);
		res.json({
			app: version.app,
			version: version.version,
			vendor: version.vendor,
			year: version.year,
			contact: version.contact
		});
	}
};

// ACL Systems ©2019 Derechos Reservados
// Para modificar este archivo, contacte a:
// servicedesk@aclsystems.mx
// Nombre del archivo: shared/winston-logger
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const logger = winston.createLogger();
logger.configure({
	transports: [
		new DailyRotateFile({
			filename: './logs/bridge-%DATE%.log',
			datePattern: 'YYYY-MMM-DD',
			prepend: true,
			localTime: true
		})
	]
});

module.exports = logger;

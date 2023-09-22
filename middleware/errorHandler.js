const winston = require('winston');
const config = require('config')
const db = config.get('db')
// require('winston-mongodb')

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
  ],
});

module.exports.logger = logger

module.exports.errorHandler = function(err, req, res, next) {
  // Log the exeption
  logger.log({
    level: 'error',
    message: err.message
  })

  // logger.add(new winston.transports.MongoDB({ db: db, level: 'error' }))
  // Levels:
  // error
  // warn
  // info
  // verbose
  // debug
  // silly


  res.status(500).send('Something went wrong.')
}
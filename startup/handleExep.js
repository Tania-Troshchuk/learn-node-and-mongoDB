require('express-async-errors') //need to log errors
const winston = require('winston')
const { logger } = require('../middleware/errorHandler')

module.exports = function() {
  logger.add(new winston.transports.Console())

  process.on('uncaughtException', (err) => {
    logger.log({
      level: 'error',
      message: err.message,
    })
  
    process.exit(1)
  })
  
  process.on('unhandledRejection', (err) => {
    logger.log({
      level: 'error',
      message: err.message,
    })
  
    process.exit(1)
  })
} 
const express = require('express')
const config = require('config')
const PORT = config.get('PORT')

const app = express()

require('./startup/handleExep')()
require('./startup/routes')(app)
require('./startup/db')()
require('./startup/config')()
require('./startup/validation')()

// setTimeout(() => {
//   // This will throw an unhandled exception
//   throw new Error('App test crash');
// }, 1000);

// const p = Promise.reject(new Error('Test promise rejection'))
// p.then(() => console.log(('Done')))


const server = app.listen(PORT || 3000, () => console.log(`Listening on port ${PORT || 3000}...`))

module.exports = server
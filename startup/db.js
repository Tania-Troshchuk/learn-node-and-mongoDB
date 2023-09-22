const mongoose = require('mongoose');
const config = require('config')
const db = config.get('db')

module.exports = function () {
  mongoose.connect(db)
    .then(() => console.log(`Successful connected to MongoDB: ${db}`))
    .catch((err) => console.log('Could not connect to MongoDB', err))
}

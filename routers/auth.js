const express = require('express');
const { User } = require('../models/user');
const bcrypt = require('bcrypt');
const Joi = require('joi')
const router = express.Router()
const validate = require('../middleware/validate')

router.post('/', validate(validateAuth), async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(400).send('Invalid email or password')

  const isValidPassword = await bcrypt.compare(req.body.password, user.password)
  if (!isValidPassword) return res.status(400).send('Invalid email or password')

  // in this response we need to sent token
  const token = user.generateAuthToken()
  res.send(token)
})

function validateAuth(auth) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
  };

  return Joi.validate(auth, schema);
}

module.exports = router
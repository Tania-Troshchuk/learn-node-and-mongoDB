const express = require('express');
const _ = require('lodash')
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const { User, validateUser } = require('../models/user');
const router = express.Router()
const validate = require('../middleware/validate')

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')
  res.send(user)
})

router.post('/', validate(validateUser), async (req, res) => {
  let user = await User.findOne({ email: req.body.email })
  if (user) return res.status(400).send('User with this email already exist')

  // user = new User({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password
  // })

  // we can use pick method from lodash that return new object
  user = new User(_.pick(req.body, ['name', 'email', 'password']))

  // to hash users password we can use bcrypt lib
  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(user.password, salt)

  await user.save();

  // We shouldn`t send password in response object
  // 1-st method:
  // res.send({
  //   name: user.name,
  //   email: user.email
  // });

  // 2-nd method using lodash:
  // res.send(_.pick(user, ['_id', 'name', 'email']))

  //to send token and other properties, token can send in response header:
  // for any custom headers we should use prefix - x
  const token = user.generateAuthToken()
  res.header('X-Auth-Token', token).send(_.pick(user, ['_id', 'name', 'email']))
});

module.exports = router
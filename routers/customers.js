const express = require('express');
const { Customer, validateCustomer } = require('../models/customer');
const auth = require('../middleware/auth');
const router = express.Router()
const validate = require('../middleware/validate')

router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort('name')
    res.send(customers)
  } catch (err) {
    res.status(400).send(err.message)
  }
});

router.post('/', [auth, validate(validateCustomer)], async (req, res) => {
  const customer = new Customer({ 
    name: req.body.name,
    phone: req.body.phone,
    isGold: req.body.isGold
  })
  await customer.save();

  res.send(customer);
});

router.put('/:id', [auth, validate(validateCustomer)], async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { 
      name: req.body.name,
      phone: req.body.phone,
      isGold: req.body.isGold
    },
    {new: true }
  )

  if (!customer) return res.status(404).send('The customer with the given ID was not found.');

  res.send(customer);
});

router.delete('/:id', auth, async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer) return res.status(404).send('The customer with the given ID was not found.');
  res.send(customer);
});

router.get('/:id', async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) return res.status(404).send('The customer with the given ID was not found.');
  res.send(customer);
});

module.exports = router
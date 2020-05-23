var express = require('express');
var router = express.Router();
const knex = require('knex')(require('../../knexfile'));
const RentalMapper = require('../exercises/data-mapper.final');

router.get('/', async function (req, res) {
  const client_id = req.session.user.user_id;
  const rentals = await knex('rentals')
    .select('*')
    .where('client_id', client_id);

  res.render('rentals', { rentals, title: 'Historia wypożyczeń' });
});

router.get('/:rental_id/pay-deposit', async function (req, res) {
  const { rental_id } = req.params;

  const itsRental = await RentalMapper.findById(rental_id);
  itsRental.payDeposit();
  await RentalMapper.update(itsRental);

  res.redirect('/rentals');
});

router.get('/:rental_id/return-deposit', async function (req, res) {
  const { rental_id } = req.params;

  const itsRental = await RentalMapper.findById(rental_id);

  await itsRental.returnDeposit();
  await RentalMapper.update(itsRental);

  res.redirect('/rentals');
});

router.get('/:rental_id/take-car', async function (req, res) {
  const { rental_id } = req.params;

  const itsRental = await RentalMapper.findById(rental_id);
  await itsRental.takeCar();
  await RentalMapper.update(itsRental);

  res.redirect('/rentals');
});

router.get('/:rental_id/return-car', async function (req, res) {
  const { rental_id } = req.params;

  const itsRental = await RentalMapper.findById(rental_id);
  await itsRental.returnCar();
  await RentalMapper.update(itsRental);

  res.redirect('/rentals');
});

module.exports = router;

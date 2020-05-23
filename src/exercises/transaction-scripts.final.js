const db = require('./database-gateway.final');
const { createDepositCalculator } = require('./strategy.final');

async function rentCar(carId, clientId) {
  const car = await db.findCar(carId);
  const client = await db.findClient(clientId);
  const rentalCount = await db.rentalCountFor(clientId);

  const calculator = createDepositCalculator(client, car, rentalCount);
  const deposit = calculator.deposit();

  await db.insertRental(carId, clientId, deposit);
}

module.exports = { rentCar };

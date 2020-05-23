const Rental = require('../exercises/domain-model.final');
const RentalBuilder = require('../exercises/builder.final');

describe('Rental class', () => {
  test('should change state to deposit paid', () => {
    const builder = new RentalBuilder();
    const rental = builder.selectCar(1).rentBy(1).depositAmount(6000).build();

    rental.payDeposit();

    expect(rental.getState()).toBe(Rental.DEPOSIT_PAID);
  });

  test('should change state to deposit settled', () => {
    const builder = new RentalBuilder();
    const rental = builder.buildPaid();
    rental.returnDeposit();

    expect(rental.getState()).toBe(Rental.DEPOSIT_SETTLED);
  });
});

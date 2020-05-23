const Rental = require('../exercises/domain-model.start');

describe('Rental class', () => {
  test('should change state to deposit paid', () => {
    const itsRental = new Rental(1, 1, 1, 6000);

    itsRental.payDeposit();

    expect(itsRental.getState()).toBe(Rental.DEPOSIT_PAID);
  });

  test('should change state to deposit settled', () => {
    const itsRental = new Rental(1, 1, 1, 6000, Rental.DEPOSIT_PAID);

    itsRental.returnDeposit();

    expect(itsRental.getState()).toBe(Rental.DEPOSIT_SETTLED);
  });
});

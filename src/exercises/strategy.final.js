function createDepositCalculator(aClient, aCar, aRentalCount) {
  if (aClient.isVip) {
    return new VipClientStrategy(aCar);
  } else if (aRentalCount < 1) {
    return new NewClientStrategy(aCar);
  } else if (aRentalCount >= 1) {
    return new ReturnClientStrategy(aCar);
  }
}

class DepositCalculator {
  constructor(car) {
    this.car = car;
  }

  deposit() {
    throw new Error('subclass responsibility');
  }
}

class NewClientStrategy extends DepositCalculator {
  deposit() {
    return Math.max(10000, this.car.price * 0.2);
  }
}

class ReturnClientStrategy extends DepositCalculator {
  deposit() {
    return Math.min(Math.max(10000, this.car.price * 0.15), 60000);
  }
}

class VipClientStrategy extends DepositCalculator {
  deposit() {
    return Math.min(Math.max(5000, this.car.price * 0.1), 40000);
  }
}

module.exports = { createDepositCalculator };

# warsawjs-workshop-44

## WarsawJS Workshop #44 — Design Patterns

Przed przystąpieniem do pracy uruchom konfigurację bazy danych: `npm run db`.

Aplikację uruchomisz komendą: `npm start`. Będzie ona dostępna pod adresem: http://localhost:3000/.

**Uwaga!** W czasie warsztatów pracujemy na plikach `*.start.js`. Udostępnione zostały również pliki `*.final.js` zawierające wzorcowe rozwiązania. Proszę jednak używać ich tylko w ostateczności! Ogromnie zachęcam do pracy własnej w czasie warsztatów a w razie wątpliwości w pierwszej kolejności zwracać się z pytaniami do trenerów.

Bawcie się dobrze! 🎉

## Zadania do wykonania:

### Transaction scripts

#### Opis:

System pozwala na wynajmowanie samochodów poprzez stronę internetową http://localhost:3000/cars. Klikając przycisk `wynajmij` wysyłamy komendę do sytemu, który pobiera dane, wykonuje niezbędne obliczenia i zapisuje dane o zamówieniu. Wszystko bezpośrednio w funkcji obsługującej żądanie http `router.get('/:car_id/rent', async function(req, res) { ... }`.

#### Problem:

Brak struktury w kodzie i wymieszanie logiki domenowej z aplikacyjną.

#### Zadanie:

W pliku `transaction-scripts.start.js` przygotuj funkcję, która w całości przeprowadzi proces wynajmu samochodu w izolacji od warstwy webowej aplikacji (express). Użyj jej do obsługi żądania http w pliku `cars.start.js`.

### Database gateway

#### Opis:

Pobieranie i zapisywanie danych odbywa się za pomocą biblioteki Knex, która pozwala budować zapytania sql.

#### Problem:

Zapytania sql rozsiane są po kodzie aplikacji, mogą się dublować i wymagają modyfikacji wielu plików w razie zmiany schematu bazy danych.

#### Zadanie:

W pliku `database-gateway.start.js` przygotuj zestaw funkcji odpowiedzialnych za operacje na danych w bazie. Następnie w pliku `transaction-scripts.start.js` podmień bezpośrednie zapytania do bazy na przygotowane funkcje.

Przykład:

```javascript
// aktualnie zapytania rozsiane po całej aplikacji
const car = await knex('cars').first().where('car_id', car_id);
```

```javascript
// funkcja pobierająca dane pojazdu w module database gateway
async function findCar(carId) {
  const car = await knex('cars').first().where('car_id', carId);
  return car;
}
// pobierania danych pojazdu w pozostałej części systemu
const car = await findCar(carId);
```

### Strategy

#### Opis:

Przed odebraniem samochodu należy zapłacić kaucję. Jej wysokość jest wyliczana na podstawie danych o kliencie.

#### Problem:

Duża ilość instrukcji warunkowych utrudnia zrozumienie przebiegu obliczeń wysokości depozytu.

#### Zadanie:

W pliku `strategy.start.js` przygotuj funkcję, która będzie tworzyć instancję klas (kalkulatorów) do przeprowadzania obliczeń depozytu. Każda z klas będzie posiadać metodę `deposit(car)` realizującą to zadanie według własnego algorytmu. Użyj `createDepositCalculator` w pliku `transaction-scripts.start.js`.

### Pub Sub

#### Opis:

Biznes zgłosił potrzebę wysyłania maila potwierdzających wynajęcie samochodu.

#### Problem:

Moduł wynajmowania samochodów i wysyłania maili to dwa osobne bounded contexty naszego system. Chcemy je od siebie oddzielić. Najlepsza sytuacja będzie wtedy, gdy oba podsystemy nie będą o sobie wiedziały.

#### Zadanie:

W pliku `pubsub.start.js` przygotuj implementacje szyny zdarzeń. Moduł powinien posiadać dwie funkcje `subscribe(topicName, callback)` i `publish(topicName, data)`. Pozwolą one komunikować się modułom, które nie będą bezpośrednio wywoływać swojego kodu. W pliku `cars.start.js` po wynajęciu samochodu opublikuj za pomocą `publish()` informacje o samochodzie i kliencie. Następnie w pliku `pubsub.start.js` funkcja `notify()` powinna wykonać się po pojawieniu się tego zdarzenia w systemie dzięki użyciu `subscribe()`.

Przykład:

```javascript
// kod pliku test-1.js
EventBus.subscribe('TEST_TOPIC', (data) => console.log(data)));
//kod pliku test-2.js
EventBus.publish('TEST_TOPIC', "wiadomość wysłana z pliku test-2.js"));
// na konsoli zobaczymy "wiadomość wysłana z pliku test-2.js"
```

### Decorator

#### Opis:

Nasz operator systemu mailowego udostępnił nową funkcję wysyłania maili w paczkach. Każdy wysłany maila w paczce jest o połowę tańsze niż pojedynczo. Użycie tego sposobu wysyłania powiadomień pozwoli na zredukowanie kosztów.

#### Problem:

Bez zmiany istniejącego systemu wprowadzić możliwość wysłania powiadomień w paczkach.

#### Zadanie:

W pliku `decorator.start.js` przygotuj implementacje funkcji, która będzie przechowywać wywołania `notify()`. W momencie gdy liczba oczekujących wywołań osiągnie wielkość paczki, wykona je i wyczyści listę aby zbierać kolejne wywołania.

Przykład funkcji dekorującej:

```javascript
// funkcja przyjmuje inną funkcję jako argument
const printArgs = (callback) => {
  return (...args) => {
    // loguje listę argumentów do konsoli
    console.log(args);
    // wywołuje przekazaną funkcję bez zmian
    return callback(args);
  };
};
```

### Domain Model

#### Opis:

Klient może zarządzać wypożyczeniami z poziomu panelu pod adresem: http://localhost:3000/rentals.

#### Problem:

Zmiana stanu zamówienia rozrzucona jest po kilku funkcjach obsługujących zapytania http w pliku `rentals.start.js`. Uniemożliwia to sprawdzenie poprawności zmiany stanu zamówienia testem jednostkowym.

#### Zadanie:

W pliku `domain-model.start.js` przygotuj implementacje klasy `Rental`, która będzie przechowywać informacje o wynajmie samochodu i umożliwiała zmianę stanu zamówienia przy pomocy publicznych metod. Zmodyfikuj `rentals.start.js` tak aby korzystał z nowej klasy.

Przykład:

```javascript
router.get('/:rental_id/pay-deposit', async function (req, res) {
  const { rental_id } = req.params;

  const dto = await knex('rentals').first().where('rental_id', rental_id);
  const { car_id, client_id, deposit, state } = dto;
  const itsRental = new Rental(rental_id, car_id, client_id, deposit, state);
  itsRental.payDeposit();
  await knex('rentals')
    .where('rental_id', rental.rental_id)
    .update({ state: itsRental.getState() });

  res.redirect('/rentals');
});
```

### Data Mapper

#### Opis:

Przed każdą manipulacją stanu zamówienia wymagane jest pobranie danych i utworzenie obiektu zamówienia a następnie zapis zmienionego stanu.

#### Problem:

W pliku `rentals.start.js` istnieje duplikacja kodu odpowiedzialnego za zapis i odczyt z bazy danych oraz tworzenie nowego obiektu.

#### Zadanie:

W pliku `data-mapper.start.js` przygotuj implementacje klasy `RentalMapper`, która będzie odpowiedzialna za zapis, odczyt i utworzenie instancji klasy `Rental`. Przenieś zduplikowany kod do metod statycznych `findById()` i `update()`.

Przykład:

```javascript
router.get('/:rental_id/pay-deposit', async function (req, res) {
  const { rental_id } = req.params;
  // statyczna funkcja mappera zwraca obiekt klasy Rental
  const itsRental = await RentalMapper.findById(rental_id);
  itsRental.payDeposit();
  // statyczna funkcja zapisuje zmieniony obiekt klasy Rental
  await RentalMapper.update(itsRental);

  res.redirect('/rentals');
});
```

### Builder

#### Opis:

Klasa `Rental` jest kluczowym elementem systemu. Musi być pokryta testami by uniknąć błędów.

#### Problem:

Przed każdym należy utworzyć nową instancje klasy `Rental` w różnym stanie cyklu życia zamówienia, co tworzy duplikację i utrudnia czytanie kodu testów.

#### Zadanie:

W pliku `builder.start.js` przygotuj implementacje klasy `RentalBuilder`. Ukryj szczegóły tworzenia nowego obiektu `Rental` oraz udostępnij łatwe w użyciu funkcje, które uproszczą budowanie nowych obiektów w różnych konfiguracjach. Następnie użyj klasy `RentalBuilder` w pliku z testami: `rental.start.spec.js`. Testy uruchomią się za pomocą komendy `npm t`.

```javascript
// aktualnie
const itsRental = new Rental(1, 1, 1, 6000, Rental.DEPOSIT_PAID);
// docelowo
const itsRental = builder.selectCar(1).rentBy(1).depositAmount(6000).inState(Rental.DEPOSIT_PAID).build();
});
```

### Adapter

#### Opis:

System pod adresem http://localhost:3000/reports umożliwia zatwierdzać lub odrzucanie raportów miesięcznych. Aktualnie system operuje bezpośrednio na systemie plików.

#### Problem:

Należy umożliwić zapisywanie raportów w bazie danych. Zakładamy, że nie chcemy w żaden sposób ingerować w zarządzanie raportami. Zmieniamy jedynie miejsce zapisu.

#### Zadanie:

W pliku `adapter.start.js` przygotuj implementacje modułu `fs`, w sposób umożliwiający podmianę z wbudowanym w Node.js modułem do zarządzania plikami. Nowy moduł pod tymi samymi sygnaturami funkcji powinien zamiast w systemie plików manipulować raportami zapisanymi w bazie danych.

Przykład:

```javascript
const fs = require('fs');
fs.unlink('./path/to/file.txt', (err) => {
  if (err) console.error(err);
  // plik file.txt usunięty z systemu plików
});

// adapter do pracy z bazą danych
const fs = {};
fs.unlink = (path, callback) => {
  const filename = extractFileName(path);
  knex('reports')
    .where('filename', oldFileName)
    .del()
    .then(() => {
      callback && callback(null);
    })
    .catch((error) => {
      return callback && callback(error);
    });
};
fs.unlink('./path/to/file.txt', (err) => {
  if (err) console.error(err);
  // plik file.txt usunięty z bazy danych
});
```

// source: https://davidwalsh.name/pubsub-javascript
const knex = require('knex')(require('../../knexfile'));
const debug = require('debug')('app:event-bus');

const EventBus = {};

const notify = (rental) => {
  knex('users')
    .first()
    .where('user_id', rental.client_id)
    .then((client) => {
      debug('Send confirmation mail to: ' + client.mail);
    });
};

module.exports = EventBus;

var flight = require('flightjs');

function Example() {
  this.attributes({
    param: 'defaultParam'
  });
}

module.exports = flight.component(Example);
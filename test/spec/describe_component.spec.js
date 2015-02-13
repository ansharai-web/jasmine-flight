var flight = require('flightjs');
var Example = require('../mock/example');
var jasmineFlight = require('../../lib/jasmine-flight.js');

describe('this.Component', function () {
  beforeEach(function() {
      var registry = require('flightjs/lib/registry');
      this.Component = this.component = this.$node = null;
      this.Component = require('../mock/example');
      registry.reset();
      this.component = jasmineFlight.setupComponent(this, null);
      jasmine.addMatchers(jasmineFlight.matchers);
  });
  afterEach(function () {
    this.Component = require('../mock/example');
    jasmineFlight.destroyComponent(this);
    jasmineFlight.events.cleanUp();
  });
  it('should be an Example component', function () {
    expect(this.Component).toEqual(Example);
  });
  it('should be an instance of Example, if this.setupComponent() is called', function () {
    expect(this.component instanceof Example).toBe(true);
  });
  it('provides the correct $node attribute', function () {
    expect(this.$node instanceof jQuery).toBe(true);
    expect(this.$node).toHaveClass('component-root');
  });
});

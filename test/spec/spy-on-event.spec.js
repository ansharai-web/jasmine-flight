/*global spyOnEvent*/
var flight = require('flightjs');
var Example = require('../mock/example');
var jasmineFlight = require('../../lib/jasmine-flight.js');

describe('spyOnEvent', function () {
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
  it('returns a spy', function () {
    var spy = jasmineFlight.events.spyOn(document, 'test-event');
    expect(spy).not.toBeUndefined();
    expect(spy.callCount).toBe(0);
    expect(spy.mostRecentCall).toEqual({});
  });

  it('records event when event is triggered on target element', function () {
    var spy = jasmineFlight.events.spyOn(document, 'test-event');

    $(document).trigger('test-event', {
      test: true
    });

    // callcount should be incremented
    expect(spy.callCount).toBe(1);

    // `mostRecentCall` should provide access to event data
    expect(spy.mostRecentCall.data).toEqual({
      test: true
    });

    // `mostRecentCall` should provide access to all event args
    expect(spy.mostRecentCall.args[0].type).toEqual('test-event');

    // calls should be exposed as array
    expect(spy.calls[0]).toBe(spy.mostRecentCall);
  });

  it('does not record event when event is triggered on different DOM branch', function () {
    var $node = $('<div />');
    var spy = jasmineFlight.events.spyOn($node, 'test-event');

    $(document.body).append($node);
    $(document.body).trigger('test-event');

    // spy should not have been called
    expect(spy.callCount).toBe(0);
  });

  it('clears up after each test', function () {
    var spy = jasmineFlight.events.spyOn(document, 'test-event');

    $(document).trigger('test-event');

    // callcount should be 1
    expect(spy.callCount).toBe(1);
  });
});

describe('event matchers', function () {
  beforeEach(function() {
      var registry = require('flightjs/lib/registry');
      this.Component = this.component = this.$node = null;
      this.Component = require('../mock/example');
      registry.reset();
      this.component = jasmineFlight.setupComponent(this, null);
      jasmine.addMatchers(jasmineFlight.matchers);
      this.spy = jasmineFlight.events.spyOn(document, 'test-event');
      $(document).trigger('test-event', {test: true, test2: null});
  });
  afterEach(function () {
    this.Component = require('../mock/example');
    jasmineFlight.destroyComponent(this);
    jasmineFlight.events.cleanUp();
  });
  it('matches with toHaveBeenTriggeredOn', function () {
    expect(this.spy).toHaveBeenTriggeredOn(document);
  });

  it('matches with toHaveBeenTriggeredOnAndWith', function () {
    expect(this.spy).toHaveBeenTriggeredOnAndWith(document, {test: true, test2: null});
  });

  it('matches with data subset when fuzzy flag is set', function () {
    expect(this.spy).toHaveBeenTriggeredOnAndWith(document, {test: true}, true);
    expect(this.spy).toHaveBeenTriggeredOnAndWith(document, {test2: null}, true);
  });

});
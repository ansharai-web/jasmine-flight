# DDJasmineFlight

Extensions to the Jasmine test framework for use with [Flight CJS](https://github.com/flightjs/flight). This extension is designed to work with [Karma Browserify](https://github.com/Nikku/karma-browserify) and was inspired by the original [Jasmine-Flight](https://github.com/flightjs/jasmine-flight) package.

# Installation

```bash
npm install --save-dev <To Do>
```

**N.B.** jasmine-flight depends on
[jasmine](https://github.com/pivotal/jasmine) and
[jasmine-jquery](https://github.com/velesin/jasmine-jquery)

`DDJasmineFlight` assumes you'll be loading Flight modules with Browserify.

## Components

```javascript
describe('flight component', function() {
	'use strict';
	
	jasmine.getFixtures().fixturesPath = '/base/test/spec/fixtures/';
    jasmine.getJSONFixtures().fixturesPath = '/base/test/spec/fixtures/';
    var fixture = readFixtures('/path/to/fixture');
    var jasmineFlight = require('../../node_modules/jasmine-flight/index.js');
    
    beforeEach(function() {
    	var registry = require('flightjs/lib/registry');
    	this.Component = this.component = this.$node = null;
    	this.Component = require('path/to/component');
    	registry.reset();
    	this.component = jasmineFlight.setupComponent(this, fixture);
    	jasmine.addMatchers(jasmineFlight.matchers);
    });

    afterEach(function () {
    	this.Component = require('path/to/component');
    	jasmineFlight.destroyComponent(this);
    	jasmineFlight.events.cleanUp();
    });

    it('needs to be defined', function() {
        expect(this.component).toBeDefined();
    });

});
```

## Mixins

```javascript
describe('flight mixin', function() {
	'use strict';
	
    var jasmineFlight = require('../../node_modules/jasmine-flight/index.js');
    
    beforeEach(function() {
    	var flight = require('flightjs');
    	this.Component = this.component = this.$node = null;
    	this.Component = flight.component(function () {}, require('/path/to/mixin'));
    	flight.registry.reset();
    	this.component = jasmineFlight.setupMixin(this, null);
    	jasmine.addMatchers(jasmineFlight.matchers);
    });

    afterEach(function () {
    	this.Component = require('/path/to/mixin');
    	jasmineFlight.destroyMixin(this);
    	jasmineFlight.events.cleanUp();
    });

    it('should be defined', function () {
        expect(this.component).toBeDefined();
    });

});
```

## Event spy

```javascript
describe('change skin component', function() {
	'use strict';
	
	jasmine.getFixtures().fixturesPath = '/base/test/spec/fixtures/';
    jasmine.getJSONFixtures().fixturesPath = '/base/test/spec/fixtures/';
    var fixture = readFixtures('/path/to/fixture');
    var jasmineFlight = require('../../node_modules/jasmine-flight/index.js');
    
    beforeEach(function() {
    	var registry = require('flightjs/lib/registry');
    	this.Component = this.component = this.$node = null;
    	this.Component = require('/path/to/component');
    	registry.reset();
    	this.component = jasmineFlight.setupComponent(this, fixture);
    	jasmine.addMatchers(jasmineFlight.matchers);
    });

    afterEach(function () {
    	this.Component = require('path/to/component');
    	jasmineFlight.destroyComponent(this);
    	jasmineFlight.events.cleanUp();
    });

    it('needs to be defined', function() {
        expect(this.component).toBeDefined();
    });

    it('needs to detect event when user click on link', function() {
  		var spyEvent = jasmineFlight.events.spyOn(document, 'uiChanged');
    	$(document).trigger('uiChanged', {
	        name: 'hello'
	    });
    	expect(spyEvent).toHaveBeenTriggeredOnAndWith(document, {name: 'hello'});
    });

});
```

## Contributing to this project

Anyone and everyone is welcome to contribute. 

## Contributors
`DDFilght`

## License

Licensed under the MIT License
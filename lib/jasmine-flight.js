/**
 * Copyright 2013, Twitter Inc. and other contributors
 * Licensed under the MIT License
 */

/*global flight:true */

var flight = require('flightjs');

var eventsData = {
  spiedEvents: {},
  handlers: []
};

jasmine.flight = {
  
    formatElement: function ($element) {
      'use strict';
      var limit = 200;
      var output = '';

      if ($element instanceof jQuery) {
        output = jasmine.jQuery.elementToString($element);
        if (output.length > limit) {
          output = output.slice(0, 200) + '...';
        }
      } else {
        //$element should always be a jQuery object
        output = 'element is not a jQuery object';
      }

      return output;
    },

    events: {
      spyOn: function (selector, eventName) {
        'use strict';
        eventsData.spiedEvents[[selector, eventName]] = {
          callCount: 0,
          calls: [],
          mostRecentCall: {},
          name: eventName
        };

        var handler = function (e, data) {
          var call = {
            event: e,
            args: jasmine.util.argsToArray(arguments),
            data: data
          };
          eventsData.spiedEvents[[selector, eventName]].callCount++;
          eventsData.spiedEvents[[selector, eventName]].calls.push(call);
          eventsData.spiedEvents[[selector, eventName]].mostRecentCall = call;
        };

        jQuery(selector).on(eventName, handler);
        eventsData.handlers.push([selector, eventName, handler]);
        return eventsData.spiedEvents[[selector, eventName]];
      },

      eventArgs: function (selector, eventName, expectedArg) {
        'use strict';
        var actualArgs = eventsData.spiedEvents[[selector, eventName]].mostRecentCall.args;

        if (!actualArgs) {
          throw 'No event spy found on ' + eventName + '. Try adding a call to spyOnEvent or make sure that the selector the event is triggered on and the selector being spied on are correct.';
        }

        // remove extra event metadata if it is not tested for
        if ((actualArgs.length === 2) && typeof actualArgs[1] === 'object' &&
          expectedArg && !expectedArg.scribeContext && !expectedArg.sourceEventData && !expectedArg.scribeData) {
          actualArgs[1] = $.extend({}, actualArgs[1]);
          delete actualArgs[1].sourceEventData;
          delete actualArgs[1].scribeContext;
          delete actualArgs[1].scribeData;
        }

        return actualArgs;
      },

      wasTriggered: function (selector, event) {
        'use strict';
        var spiedEvent = eventsData.spiedEvents[[selector, event]];
        return spiedEvent && spiedEvent.callCount > 0;
      },

      wasTriggeredWith: function (selector, eventName, expectedArg) {
        'use strict';
        var actualArgs = jasmine.flight.events.eventArgs(selector, eventName, expectedArg);
        return actualArgs && jasmine.matchersUtil.contains(actualArgs, expectedArg);
      },

      wasTriggeredWithData: function (selector, eventName, expectedArg) {
        'use strict';
        var actualArgs = jasmine.flight.events.eventArgs(selector, eventName, expectedArg);
        var valid;

        if (actualArgs) {
          valid = false;
          for (var i = 0; i < actualArgs.length; i++) {
            if (jasmine.flight.validateHash(expectedArg, actualArgs[i])) {
              return true;
            }
          }
          return valid;
        }

        return false;
      },

      cleanUp: function () {
        'use strict';
        eventsData.spiedEvents = {};
        // unbind all handlers
        for (var i = 0; i < eventsData.handlers.length; i++) {
          jQuery(eventsData.handlers[i][0]).off(eventsData.handlers[i][1], eventsData.handlers[i][2]);
        }
        eventsData.handlers    = [];
      }
    },

    validateHash: function (a, b, intersection) {
      'use strict';
      var validHash;
      for (var field in a) {
        if ((typeof a[field] === 'object') && (typeof b[field] === 'object')) {
          validHash = a[field] === b[field] || jasmine.flight.validateHash(a[field], b[field]);
        } else if (intersection && (typeof a[field] === 'undefined' || typeof b[field] === 'undefined')) {
          validHash = true;
        } else {
          validHash = (a[field] === b[field]);
        }
        if (!validHash) {
          break;
        }
      }
      return validHash;
    },

    assertEventTriggeredWithData: function (actual, selector, expectedArg, fuzzyMatch) {
      'use strict';
      var eventName = typeof actual === 'string' ? actual : actual.name;
      var wasTriggered = jasmine.flight.events.wasTriggered(selector, eventName);
      var wasTriggeredWithData = false;

      if (wasTriggered) {
        if (fuzzyMatch) {
          wasTriggeredWithData = jasmine.flight.events.wasTriggeredWithData(selector, eventName, expectedArg);
        } else {
          wasTriggeredWithData = jasmine.flight.events.wasTriggeredWith(selector, eventName, expectedArg);
        }
      }

      var result = {
        pass: wasTriggeredWithData
      };

      result.message = (function () {
        var $pp = function (obj) {
          var description;
          var attr;

          if (!(obj instanceof jQuery)) {
            obj = $(obj);
          }

          description = [
            obj.get(0).nodeName
          ];

          attr = obj.get(0).attributes || [];

          for (var x = 0; x < attr.length; x++) {
            description.push(attr[x].name + '="' + attr[x].value + '"');
          }

          return '<' + description.join(' ') + '>';
        };

        if (wasTriggered) {
          var actualArg = jasmine.flight.events.eventArgs(selector, eventName, expectedArg)[1];
          return [
            '<div class="value-mismatch">Expected event ' + eventName + ' to have been triggered on' + selector,
            '<div class="value-mismatch">Expected event ' + eventName + ' not to have been triggered on' + selector
          ];
        } else {
          return [
            'Expected event ' + eventName + ' to have been triggered on ' + $pp(selector),
            'Expected event ' + eventName + ' not to have been triggered on ' + $pp(selector)
          ];
        }
      }());

      return result;
    },

    setupComponent: function(self, specDefinitions, options) {
      'use strict';
      
      if (self.component) {
          self.component.teardown();
          self.$node.remove();
      }

      if (specDefinitions instanceof jQuery || typeof specDefinitions === 'string') {
          self.$node = $(specDefinitions).addClass('component-root');
      } else {
          self.$node = $('<div class="component-root" />');
          options = specDefinitions;
          specDefinitions = null;
      }

      $('body').append(self.$node);

      options = options === undefined ? {} : options;

      self.component = (new self.Component()).initialize(self.$node, options);

      return self.component;
    },

    destroyComponent: function(self) {
      'use strict';
      if (self.$node) {
          self.$node.remove();
          self.$node = null;
      }

      if (self.component) {
          self.component = null;
      }

      self.Component.teardownAll();
      self.Component = null;
    },

    setupMixin: function(self, specDefinitions, options) {
      'use strict';
      
      if (self.component) {
          self.component.teardown();
          self.$node.remove();
      }

      if (specDefinitions instanceof jQuery || typeof specDefinitions === 'string') {
          self.$node = $(specDefinitions).addClass('component-root');
      } else {
          self.$node = $('<div class="component-root" />');
          options = specDefinitions;
          specDefinitions = null;
      }

      $('body').append(self.$node);

      options = options === undefined ? {} : options;

      self.component = (new self.Component()).initialize(self.$node, options);

      return self.component;
    },

    destroyMixin: function(self) {
      'use strict';
      if (self.$node) {
          self.$node.remove();
          self.$node = null;
      }

      if (self.component) {
          self.component = null;
      }

      self.Component = null;
    },

    matchers: {
      toHaveBeenTriggeredOn: function () {
        'use strict';
        return {
          compare: function (actual, selector) {
            var eventName = typeof actual === 'string' ? actual : actual.name;
            var wasTriggered = jasmine.flight.events.wasTriggered(selector, eventName);
            var result = {
              pass: wasTriggered
            };

            result.message = (function () {
              var $pp = function (obj) {
                var description;
                var attr;

                if (!(obj instanceof jQuery)) {
                  obj = $(obj);
                }

                description = [
                  obj.get(0).nodeName
                ];

                attr = obj.get(0).attributes || [];

                for (var x = 0; x < attr.length; x++) {
                  description.push(attr[x].name + '="' + attr[x].value + '"');
                }

                return '<' + description.join(' ') + '>';
              };

              if (wasTriggered) {
                return [
                  '<div class="value-mismatch">Expected event ' + eventName + ' to have been triggered on' + selector,
                  '<div class="value-mismatch">Expected event ' + eventName + ' not to have been triggered on' + selector
                ];
              } else {
                return [
                  'Expected event ' + eventName + ' to have been triggered on ' + $pp(selector),
                  'Expected event ' + eventName + ' not to have been triggered on ' + $pp(selector)
                ];
              }
            }());

            return result;
          }
        };
      },

      toHaveBeenTriggeredOnAndWithFuzzy: function () {
        'use strict';
        return {
          compare: function (actual, selector, expectedArg, fuzzyMatch) {
            return jasmine.flight.assertEventTriggeredWithData(actual, selector, expectedArg, fuzzyMatch);
          }
        };
      },

      toHaveBeenTriggeredOnAndWith: function () {
        'use strict';
        return {
          compare: function (actual, selector, expectedArg) {
            return jasmine.flight.assertEventTriggeredWithData(actual, selector, expectedArg, true);
          }
        };
      }
    }
};

module.exports = jasmine.flight;
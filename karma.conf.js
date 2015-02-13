// Karma configuration file

module.exports = function (config) {
  'use strict';

  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    frameworks: [
      'jasmine',
      'browserify'
    ],

    preprocessors: {
      'test/**/*.js': ['browserify'],
    },

    // list of files / patterns to load in the browser
    files: [
      // jquery
      'node_modules/jquery/dist/jquery.js',
      // jasmine-jquery
      'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
      // tests
      'test/mock/**/*.js',
      'test/spec/**/*.js'
    ],

    browserify: {
      debug: true,
      watch: true,
      bundleDelay: 750
    },

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers
    // CLI --browsers Chrome, Firefox, Safari
    browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress'
    // CLI --reporters progress
    reporters: [process.env.TRAVIS ? 'dots' : 'progress'],

    singleRun: false,

    // web server port
    port: 9876
  });
};
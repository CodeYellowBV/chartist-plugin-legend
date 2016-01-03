// package metadata file for Meteor.js
'use strict';

var packageName = 'mspi:chartistlegend';  // https://atmospherejs.com/hammer/hammer
var where = 'client';  // where to install: 'client' or 'server'. For both, pass nothing.


Package.describe({
  name: packageName,
  summary: 'Adds a legend plugin for Chartist (official). Depends on package mfpierre:chartist-js',
  version: '0.2.6',
  git: 'https://github.com/mattiLeBlanc/chartist-plugin-legend.git'
});

// Package.onUse(function (api) {
//   api.versionsFrom(['METEOR@0.9.0', 'METEOR@1.0']);
//   api.export('ChartistLegend');
//   api.use('mfpierre:chartist-js', 'client');
//   api.addFiles([
//     '../chartist-plugin-legend.js',
//     'export.js'
//   ], where
//   );
// });
Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.use('mfpierre:chartist-js@1.6.1', 'client');
  api.addFiles('../chartist-plugin-legend.js', 'client' );
});


Package.onTest(function (api) {
  api.use(packageName, where);
  api.use('tinytest', where);

  api.addFiles('test.js', where);
});



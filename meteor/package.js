// package metadata file for Meteor.js
'use strict';

var packageName = 'mspi:chartistlegend';  // https://atmospherejs.com/hammer/hammer
var where = 'client';  // where to install: 'client' or 'server'. For both, pass nothing.

var packageJson = JSON.parse(Npm.require("fs").readFileSync('../package.json'));

Package.describe({
  name: packageName,
  summary: 'Adds a legend plugin for Chartist (official) with clickable features',
  version: packageJson.version,
  git: 'https://github.com/CodeYellowBV/chartist-plugin-legend.git'
});

Package.onUse(function (api) {
  api.versionsFrom(['METEOR@0.9.0', 'METEOR@1.0']);
  api.export('ChartistLegend');
  api.addFiles([
    '../chartist-plugin-legend.js',
    'export.js'
  ], where
  );
});

Package.onTest(function (api) {
  api.use(packageName, where);
  api.use('tinytest', where);

  api.addFiles('test.js', where);
});



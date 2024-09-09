import Application from 'ember-test-app/app';
import config from 'ember-test-app/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import { detectLeakingClasses } from 'memory-leak-detector';

setApplication(Application.create(config.APP));

setup(QUnit.assert);

// this checks whether there are any of `our` classes retained after all tests have passed.
globalThis.Testem?.afterTests(async (_config, _data, callback) => {
  // Give some time for Garbage collector to kick in
  await new Promise((resolve) => setTimeout(resolve, 5000));

  await detectLeakingClasses('title', document.title);
  callback();
});

start();

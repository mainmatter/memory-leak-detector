import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-test-app/tests/helpers';
import { detectMemoryLeak } from 'memory-leak-detector';

module('Acceptance | memory leak', function (hooks) {
  setupApplicationTest(hooks);

  test('MEMORY_LEAK: visiting /leaker', async function (assert) {
    await visit('leaker');

    const assertions = {
      LeakerComponent: 1,
    };

    const results = await detectMemoryLeak(
      'url',
      document.location.href,
      assertions,
    );

    assert.deepEqual(results, assertions);
    assert.strictEqual(currentURL(), 'leaker');
  });

  test('MEMORY_LEAK: asserting a class thats not in heap results in null for that assertion', async function (assert) {
    await visit('/');

    const assertions = {
      LeakerComponent: 0,
      unknownC: 0,
    };

    const results = await detectMemoryLeak(
      'url',
      document.location.href,
      assertions,
    );

    assert.equal(results.unknownC, null, "Returned 'null' when ");
    assert.strictEqual(currentURL(), '/');
  });

  test('MEMORY_LEAK: / visiting repeatedly', async function (assert) {
    for (let i = 1; i != 50; i++) {
      await visit('/');
      await visit('leaker');
    }

    const assertions = {
      LeakerComponent: 50,
    };

    const results = await detectMemoryLeak(
      'url',
      document.location.href,
      assertions,
    );

    assert.deepEqual(results, assertions);
    assert.strictEqual(currentURL(), 'leaker');
  });
});

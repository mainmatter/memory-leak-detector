import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-test-app/tests/helpers';
import { detectMemoryLeak } from 'memory-leak-detector';

module('Acceptance | Users', function (hooks) {
  setupApplicationTest(hooks);

  test('pagination', async function (assert) {
    await visit('users');

    const assertions = {
      UserListItemComponent: 30,
    };

    const results = await detectMemoryLeak(
      'url',
      document.location.href,
      assertions,
    );

    assert.deepEqual(results, assertions);
    assert.strictEqual(currentURL(), 'users');
  });

  test('paginating back and forth', async function (assert) {
    await visit('users');

    await click('[data-test-pagination-next]');
    await click('[data-test-pagination-next]');
    await click('[data-test-pagination-previous]');

    // It detects a leak correctly.
    // Initial load and each page has 30 items.
    const assertions = {
      UserListItemComponent: 120,
    };

    const results = await detectMemoryLeak(
      'url',
      document.location.href,
      assertions,
    );
    assert.deepEqual(results, assertions);
    assert.strictEqual(currentURL(), 'users');
  });
});

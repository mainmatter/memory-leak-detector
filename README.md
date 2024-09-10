# memory-leak-detector

Memory Leak Detector is a tiny node server that exposes an HTTP API for making snapshots and queries against a Google Chrome instance, typically from tests.

It requires a path to the source code so it can scan codebase for `class`.

`pnpm memory-leak-detector --path ./app`

## Example app

An example app can be found [here](https://github.com/mainmatter/memory-leak-detector/blob/main/packages/test-app).

### Running it

- `git clone git@github.com:mainmatter/memory-leak-detector.git`
- `cd memory-leak-detector`
- `pnpm install`
- `pnpm test:memory-leak-ember`

## Usage

Install the `memory-leak-detector` dependency

- `pnpm add -D memory-leak-detector`
- Edit your test runner's option to run Chrome with `--remote-debugging-port=9222` option.
  Example Configuration for Testem.

```js
// testem.js
"use strict";

module.exports = {
  test_page: "tests/index.html?hidepassed",
  disable_watching: true,
  launch_in_ci: ["Chrome"],
  launch_in_dev: ["Chrome"],
  browser_start_timeout: 120,
  browser_args: {
    Chrome: {
      ci: [
        // --no-sandbox is needed when running Chrome inside a container
        process.env.CI ? "--no-sandbox" : null,
        "--headless",
        "--disable-dev-shm-usage",
        "--disable-software-rasterizer",
        "--mute-audio",
        "--remote-debugging-port=9222",
        "--window-size=1440,900",
      ].filter(Boolean),
      dev: [
        "--disable-dev-shm-usage",
        "--disable-software-rasterizer",
        "--mute-audio",
        "--remote-debugging-port=9222",
        "--window-size=1440,900",
      ].filter(Boolean),
    },
  },
};
```

Define a script that runs a `memory-leak-detector` node server and listen, run your tests as usual, finally wait for the process results.

```sh
pnpm memory-leak-detector --path ./app & pid=$!; pnpm test; wait $pid
```

The reason for waiting for that process' pid is that e.g. Qunit doesn't have a good way to dynamically create and run a test at the end of your test suite while we must have a way to fail the CI in case something's wrong.
For that reason `detectLeakingClasses` is meant to be used at the end only, because it always exits the process with either fail or success.

That also means that if you don't intend to use `detectLeakingClasses`, your script should not wait for the `memory-leak-detector` to exit i.e.

```sh
pnpm memory-leak-detector --path  ./app & pnpm test
```

### Checking for memory leaks after test suite finishes

The following code checks for any known, dangling objects (Classes) that `memory-leak-detector` had found in the codebase.

```js
// tests/test-helper.js

// this checks whether there are any of `our` classes retained after all tests have passed.
globalThis.Testem?.afterTests(async (_config, _data, callback) => {
  // Give some time for Garbage collector to kick in
  await new Promise((resolve) => setTimeout(resolve, 5000));

  await detectLeakingClasses("title", document.title);
  callback();
});
```

![Checking for any leaking classes](https://github.com/mainmatter/memory-leak-detector/blob/main/assets/memory_leak_1.png)

This approach doesn't catch all memory-leaks as it will only detect the ones that have manipulated a window/document objects by e.g. storing references or not removed `addEventListener` calls.

### Asserting object count

The following code performs an assertion against current memory state of the browser while the test and an application is running.

```js
test("paginating back and forth", async function (assert) {
  // Initial load and each page has 30 items
  await visit("users");

  await click("[data-test-pagination-next]");
  await click("[data-test-pagination-next]");
  await click("[data-test-pagination-previous]");

  const assertions = {
    UserListItemComponent: 30,
  };

  const results = await detectMemoryLeak(
    "url",
    document.location.href,
    assertions,
  ); // { UserListItemComponent: 120 }

  assert.deepEqual(results, assertions);
  assert.strictEqual(currentURL(), "users");
});
```

![Checking for specific class in a test](https://github.com/mainmatter/memory-leak-detector/blob/main/assets/memory_leak_2.png)

## Configuration

### memory-leak-detector

- path: <required>, has no default value.
- port: <optional>, defaults to 3000.

### Chrome / Test runner

By default a Google Chrome instance is expected to be running on address `127.0.0.1:9222`.
In case it runs on a different address, you can provide the connection info when calling the HTTP API e.g.

```js
await detectLeakingClasses("title", document.title, {
  host: "localhost",
  port: 9333,
});
```

```js
const assertions = { MyClass: 10 };
const results = await detectMemoryLeak(
  "url",
  document.location.href,
  assertions,
  {
    host: "localhost",
    port: 9333,
  },
);
```

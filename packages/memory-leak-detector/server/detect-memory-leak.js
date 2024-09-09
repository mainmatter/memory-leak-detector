const CDP = require("chrome-remote-interface");
const fs = require("fs");
const { promisify } = require("util");
const writeFile = promisify(fs.writeFile);
const Heapsnapshot = require("heapsnapshot");

module.exports = {
  // Handles assertions for a specific set of classes e.g. { LeakyComponent: 50 }
  async detectMemoryLeak({
    identifier,
    assertions,
    port,
    host,
    writeSnapshot,
  }) {
    const client = await createCDPClient(identifier, port, host);
    const snapshot = await captureHeapSnapshot(client, writeSnapshot);
    const retainedClasses = findRetainedClassesByAssertions(
      assertions,
      snapshot,
    );

    return retainedClasses;
  },

  // Checks whether any of the provided classes have at least one instance.
  // If they do, this will end the process
  async detectLeakingClasses({
    identifier,
    classes,
    port,
    host,
    writeSnapshot,
  }) {
    const client = await createCDPClient(identifier, port, host);
    const snapshot = await captureHeapSnapshot(client, writeSnapshot);
    const retainedClasses = findRetainedClassesInSnapshot(classes, snapshot);

    return retainedClasses;
  },
};

async function createCDPClient(identifier, port, host) {
  try {
    const targets = await CDP.List({ port, host });
    const testTarget = targets.find((target) => {
      const found = target[identifier.by].includes(identifier.value);

      return found;
    });
    if (!testTarget) {
      throw new Error(
        `Tab titled "${JSON.stringify(identifier)}" did not match any of: ${targets
          .map((t) => `"${t.title}"`)
          .join(", ")}`,
      );
    }
    const client = await CDP({ target: testTarget, port, host });
    return client;
  } catch (e) {
    if (e.message.includes("ECONNREFUSED")) {
      e.message +=
        "\nMake sure to configure --remote-debugging-port in testem.js";
    }
    throw `Unable to connect to chrome. ${e}`;
  }
}

async function captureHeapSnapshot(client, writeSnapshot) {
  await client.HeapProfiler.collectGarbage();

  let heapSnapshotChunks = [];
  client.on("HeapProfiler.addHeapSnapshotChunk", ({ chunk }) => {
    heapSnapshotChunks.push(chunk);
  });

  await client.HeapProfiler.takeHeapSnapshot({ reportProgress: false });

  if (writeSnapshot) {
    await writeFile("Heap.heapsnapshot", heapSnapshotChunks.join(""));
  }

  const parsedHeapSnapshot = JSON.parse(heapSnapshotChunks.join(""));

  return new Heapsnapshot(parsedHeapSnapshot);
}

function findRetainedClassesByAssertions(assertions, snapshot) {
  const retainedClasses = new Map(
    Object.entries(assertions).map(([key, _value]) => [key, null]),
  );

  for (const node of snapshot) {
    if (node.type === "object" && retainedClasses.has(node.name)) {
      let retainedCount = retainedClasses.get(node.name) || 0;
      retainedClasses.set(node.name, retainedCount + 1);
    }
  }

  return retainedClasses;
}

function findRetainedClassesInSnapshot(classes, snapshot) {
  const retainedClasses = new Map(classes.map((className) => [className, 0]));

  for (const node of snapshot) {
    if (node.type === "object" && retainedClasses.has(node.name)) {
      let retainedCount = retainedClasses.get(node.name);
      retainedClasses.set(node.name, retainedCount + 1);
    }
  }

  return retainedClasses;
}

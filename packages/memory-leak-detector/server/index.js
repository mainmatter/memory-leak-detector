const {
  detectMemoryLeak,
  detectLeakingClasses,
} = require("./detect-memory-leak.js");
const inventoryClasses = require("./inventory-classes.js");
const express = require("express");
const cors = require("cors");

function main() {
  const [, , sourceDirectory] = process.argv;
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.post(
    "/detect_memory_leak",
    handleDetectMemoryLinkRequest({
      port: 9222,
      host: "127.0.0.1",
      classes: [],
      writeSnapshot: false,
    }),
  );
  app.post(
    "/detect_leaking_classes",
    checkLeakingClasses({
      port: 9222,
      host: "127.0.0.1",
      allowedToLeak: ["App"],
      classes: inventoryClasses(sourceDirectory),
      writeSnapshot: false,
    }),
  );

  app.post("/close", (_req, _res) => process.exit(0))

  app.listen(3000, () => {
    console.log("Memory Leak Detector listening on port :3000");
  });
}

function handleDetectMemoryLinkRequest(config) {
  return async function (req, res) {
    try {
      const results = await detectMemoryLeak({
        ...req.body,
        ...config,
      });

      res.json({ results: Object.fromEntries(results) });
    } catch (error) {
      console.error({ message: error });
      res.json({ error: `${error}` });
    }
  };
}

function checkLeakingClasses(config) {
  return async function (req, res) {
    try {
      const results = await detectLeakingClasses({
        ...req.body,
        ...config,
      });

      const leakingClasses = [];
      results.forEach((count, key) => {
        if (count >= 1 && !config.allowedToLeak.includes(key)) {
          leakingClasses.push(`${key}:${count}`);
        }
      });

      if (leakingClasses.length > 0) {
        res.json({ ok: false });
        console.error("Following classes are leaking:");
        console.error(leakingClasses.join(","));
        console.error("Exiting process.");
        process.exit(1);
      } else {
        res.json({ ok: true });
        console.log("No memory leaks detected.");
        process.exit(0);
      }
    } catch (error) {
      console.error({ message: error });
      res.json({ error: `${error}` });
    }
  };
}

main();

export async function detectMemoryLeak(
  by,
  value,
  assertions,
  browserAddress = { port: 9222, host: "127.0.0.1" },
) {
  let response = await fetch(`http://localhost:3000/detect_memory_leak`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier: {
        by,
        value,
      },
      ...browserAddress,
      assertions,
    }),
  });
  let json = await response.json();

  return json.results;
}

export async function detectLeakingClasses(
  by,
  value,

  browserAddress = { port: 9222, host: "127.0.0.1" },
) {
  let response = await fetch(`http://localhost:3000/detect_leaking_classes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier: {
        by,
        value,
      },
      ...browserAddress,
    }),
  });
  let json = await response.json();

  return json.results;
}

export async function close() {
  let response = await fetch(`http://localhost:3000/close`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: null,
  });
  let json = await response.json();

  return json;
}

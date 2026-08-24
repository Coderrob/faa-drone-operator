import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";

const server = spawn(process.execPath, [path.resolve("tools/serve-site.mjs")], {
  cwd: process.cwd(),
  stdio: ["ignore", "inherit", "inherit", "ipc"],
});

async function waitForServer(attempts = 60) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const ready = await new Promise((resolve) => {
      const request = http.get("http://127.0.0.1:4321/", (response) => { response.resume(); resolve(response.statusCode === 200); });
      request.on("error", () => resolve(false));
      request.setTimeout(500, () => { request.destroy(); resolve(false); });
    });
    if (ready) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("Static test server did not become ready.");
}

let exitCode = 1;
try {
  await waitForServer();
  const playwright = spawn(process.execPath, [path.resolve("node_modules/playwright/cli.js"), "test"], { cwd: process.cwd(), stdio: "inherit" });
  exitCode = await new Promise((resolve) => playwright.on("exit", (code) => resolve(code ?? 1)));
} finally {
  if (server.connected) server.send("shutdown");
  await Promise.race([
    new Promise((resolve) => server.on("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 3_000)),
  ]);
}
process.exitCode = exitCode;

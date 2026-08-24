import { spawn, type ChildProcess } from "node:child_process";
import http from "node:http";
import path from "node:path";

/**
 * Probe the local static server once.
 * @returns Whether the server returned HTTP 200.
 */
function probeServer(): Promise<boolean> {
  return new Promise((resolve) => {
    const request = http.get("http://127.0.0.1:4321/", (response) => {
      response.resume();
      resolve(response.statusCode === 200);
    });
    request.on("error", () => resolve(false));
    request.setTimeout(500, () => {
      request.destroy();
      resolve(false);
    });
  });
}

/**
 * Delay execution without blocking the event loop.
 * @param milliseconds - Duration to wait.
 * @returns A promise that resolves after the delay.
 */
function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Wait until the static server accepts requests.
 * @param attempts - Maximum number of probes.
 * @returns A promise that resolves when the server is ready.
 * @throws When the server does not become ready in time.
 */
async function waitForServer(attempts = 60): Promise<void> {
  const ready = await probeRepeatedly(attempts);
  if (!ready) throw new Error("Static test server did not become ready.");
}

/**
 * Probe the server repeatedly until it responds or attempts are exhausted.
 * @param attempts - Maximum number of probes.
 * @returns Whether the server became ready.
 */
async function probeRepeatedly(attempts: number): Promise<boolean> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await probeServer()) return true;
    await delay(200);
  }
  return false;
}

/**
 * Wait for a child process to exit.
 * @param child - Process whose exit code is required.
 * @returns The process exit code, defaulting to one.
 */
function waitForExit(child: ChildProcess): Promise<number> {
  return new Promise((resolve) => child.on("exit", (code) => resolve(code ?? 1)));
}

/**
 * Stop the static server, allowing a short graceful-shutdown window.
 * @param server - Static server child process.
 * @returns A promise that resolves when shutdown finishes or times out.
 */
async function stopServer(server: ChildProcess): Promise<void> {
  if (server.connected) server.send("shutdown");
  await Promise.race([waitForExit(server), delay(3_000)]);
}

/**
 * Run browser tests against the built static site.
 * @returns A promise that resolves after recording the test exit code.
 * @throws When the static server cannot start or a child process fails to spawn.
 */
async function main(): Promise<void> {
  const server = spawn(process.execPath, ["--import", "tsx", path.resolve("tools/serve-site.ts")], {
    cwd: process.cwd(),
    stdio: ["ignore", "inherit", "inherit", "ipc"],
  });
  let exitCode = 1;
  try {
    await waitForServer();
    const playwright = spawn(process.execPath, [path.resolve("node_modules/playwright/cli.js"), "test"], {
      cwd: process.cwd(), stdio: "inherit",
    });
    exitCode = await waitForExit(playwright);
  } finally {
    await stopServer(server);
  }
  process.exitCode = exitCode;
}

await main();

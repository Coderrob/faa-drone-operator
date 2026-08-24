import fs from "node:fs";
import http, { type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";

const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 4321);
const output = path.resolve("site-dist");
const mime: Readonly<Record<string, string>> = {
  ".css": "text/css", ".html": "text/html", ".js": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml",
};

/**
 * Send a short HTTP response.
 * @param response - Node HTTP response to complete.
 * @param status - HTTP status code.
 * @param body - Optional response body.
 * @returns Nothing.
 */
function respond(response: ServerResponse, status: number, body = ""): void {
  response.writeHead(status);
  response.end(body);
}

/**
 * Resolve a request path beneath the static output directory.
 * @param request - Incoming HTTP request.
 * @returns Absolute candidate path.
 * @throws When the request contains an invalid encoded URL.
 */
function resolveCandidate(request: IncomingMessage): string {
  const url = new URL(request.url ?? "/", `http://${host}`);
  const relative = decodeURIComponent(url.pathname).replace(/^\//, "");
  return path.resolve(output, relative || "index.html");
}

/**
 * Determine whether a candidate remains inside the output directory.
 * @param candidate - Absolute candidate path.
 * @returns Whether the path can be served safely.
 */
function isSafe(candidate: string): boolean {
  return candidate === output || candidate.startsWith(`${output}${path.sep}`);
}

/**
 * Select the file represented by a safe candidate.
 * @param candidate - Existing file or directory candidate.
 * @returns File path, including a directory index where needed.
 */
function selectFile(candidate: string): string {
  const isDirectory = fs.existsSync(candidate) && fs.statSync(candidate).isDirectory();
  return isDirectory ? path.join(candidate, "index.html") : candidate;
}

/**
 * Serve a static file or the generated not-found page.
 * @param file - Requested file path.
 * @param response - Node HTTP response.
 * @returns Nothing.
 */
function serveFile(file: string, response: ServerResponse): void {
  const exists = fs.existsSync(file);
  const finalFile = fallbackFile(file, exists);
  const contentType = mime[path.extname(finalFile)] ?? "application/octet-stream";
  response.writeHead(exists ? 200 : 404, { "Content-Type": `${contentType}; charset=utf-8` });
  fs.createReadStream(finalFile).pipe(response);
}

/**
 * Select the requested file or the generated not-found document.
 * @param file - Requested file path.
 * @param exists - Whether the requested file exists.
 * @returns File that should supply the response body.
 */
function fallbackFile(file: string, exists: boolean): string {
  return exists ? file : path.join(output, "404.html");
}

/**
 * Handle one static-site HTTP request.
 * @param request - Incoming request.
 * @param response - Outgoing response.
 * @returns Nothing.
 */
function handleRequest(request: IncomingMessage, response: ServerResponse): void {
  const candidate = resolveCandidate(request);
  if (!isSafe(candidate)) {
    respond(response, 403, "Forbidden");
    return;
  }
  serveFile(selectFile(candidate), response);
}

/**
 * Close the server and terminate successfully.
 * @returns Nothing.
 */
function shutdown(): void {
  server.close(() => process.exit(0));
}

/**
 * Handle an optional parent-process message.
 * @param message - IPC message received from the parent.
 * @returns Nothing.
 */
function handleMessage(message: unknown): void {
  if (message === "shutdown") shutdown();
}

const server = http.createServer(handleRequest);
server.listen(port, host, () => console.log(`Static test server: http://${host}:${port}/`));
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("message", handleMessage);

import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 4321);
const base = "";
const output = path.resolve("site-dist");
const mime = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml" };

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", `http://${host}`).pathname);
  if (base && pathname === "/") { response.writeHead(302, { Location: `${base}/` }); response.end(); return; }
  if (!pathname.startsWith(`${base}/`)) { response.writeHead(404); response.end("Not found"); return; }
  const relative = pathname.slice(base.length).replace(/^\//, "");
  const candidate = path.resolve(output, relative || "index.html");
  if (!candidate.startsWith(`${output}${path.sep}`) && candidate !== output) { response.writeHead(403); response.end("Forbidden"); return; }
  const file = fs.existsSync(candidate) && fs.statSync(candidate).isDirectory() ? path.join(candidate, "index.html") : candidate;
  const finalFile = fs.existsSync(file) ? file : path.join(output, "404.html");
  response.writeHead(fs.existsSync(file) ? 200 : 404, { "Content-Type": `${mime[path.extname(finalFile)] ?? "application/octet-stream"}; charset=utf-8` });
  fs.createReadStream(finalFile).pipe(response);
});

server.listen(port, host, () => console.log(`Static test server: http://${host}:${port}${base}/`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
process.on("message", (message) => { if (message === "shutdown") server.close(() => process.exit(0)); });

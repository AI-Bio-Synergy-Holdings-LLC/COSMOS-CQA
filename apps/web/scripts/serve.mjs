import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, normalize, resolve, sep } from "node:path";

const appRoot = resolve(import.meta.dirname, "..");
const repoRoot = resolve(appRoot, "..", "..");
const configuredStaticRoot = process.env.COSMOS_CQA_STATIC_ROOT ? resolve(process.cwd(), process.env.COSMOS_CQA_STATIC_ROOT) : "";
const port = Number(process.env.PORT || 4173);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const requested = url.pathname === "/" ? "/index.html" : url.pathname;
    const servesPackages = requested.startsWith("/packages/");
    const servesExamples = requested.startsWith("/examples/");
    const root = configuredStaticRoot || (servesPackages || servesExamples ? repoRoot : appRoot);
    const allowedRoot = configuredStaticRoot || (servesPackages ? resolve(repoRoot, "packages") : servesExamples ? resolve(repoRoot, "examples") : appRoot);
    const filePath = normalize(resolve(root, `.${requested}`));

    if (!filePath.startsWith(allowedRoot + sep) && filePath !== allowedRoot) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const contents = await readFile(filePath);
    response.writeHead(200, { "Content-Type": mime[extname(filePath)] || "application/octet-stream" });
    response.end(contents);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, () => {
  const rootLabel = configuredStaticRoot ? ` from ${configuredStaticRoot}` : "";
  console.log(`COSMOS-CQA web app serving at http://localhost:${port}/${rootLabel}`);
});

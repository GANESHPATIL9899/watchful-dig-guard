import "./lib/error-capture";
import fs from "node:fs";
import path from "node:path";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

const MIME_TYPES: Record<string, string> = {
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".json": "application/json; charset=utf-8",
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

import { spawn } from "node:child_process";

let apiStarted = false;
function ensureApiServer() {
  if (apiStarted) return;
  apiStarted = true;
  console.log("🚀 Spawning backend API server process...");
  const scriptPath = path.resolve(process.cwd(), "dist", "api-server.js");
  const child = spawn("node", [scriptPath], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, PORT: "4000" }
  });
  child.on("error", (err) => {
    console.error("❌ Failed to start API server child process:", err);
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    ensureApiServer();
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      if (pathname.startsWith("/api/")) {
        const targetUrl = `http://localhost:4000${pathname}${url.search}`;
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
          headers[key] = value;
        });

        try {
          const res = await fetch(targetUrl, {
            method: request.method,
            headers,
            body: request.method !== "GET" && request.method !== "HEAD" ? await request.text() : undefined,
          });
          
          const resHeaders: Record<string, string> = {};
          res.headers.forEach((value, key) => {
            resHeaders[key] = value;
          });

          return new Response(res.body, {
            status: res.status,
            headers: resHeaders,
          });
        } catch (err) {
          console.error("❌ Proxy connection to backend API failed:", err);
          return new Response(JSON.stringify({ error: "API server not reachable" }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      if (pathname.startsWith("/assets/") || pathname.startsWith("/images/")) {
        const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, "");
        const rootDir = path.resolve(__dirname, "..", "..");
        let filePath = path.join(rootDir, "dist", "client", safePath);

        // Fallback for /images/ to serve directly from public/images/ if not found in dist/client/
        if (pathname.startsWith("/images/")) {
          const fileExistsInDist = fs.existsSync(filePath) && fs.statSync(filePath).isFile();
          if (!fileExistsInDist) {
            filePath = path.join(rootDir, "public", safePath.replace(/^\/images/, "images"));
          }
        }

        try {
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const content = fs.readFileSync(filePath);
            return new Response(content, {
              status: 200,
              headers: {
                "Content-Type": getMimeType(filePath),
                "Cache-Control": "public, max-age=31536000, immutable",
              },
            });
          }
        } catch (err) {
          console.error("Error serving static file:", err);
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

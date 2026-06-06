const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const rootDir = __dirname;
const dataDir = path.join(rootDir, "data");
const inquiriesFile = path.join(dataDir, "inquiries.jsonl");
const port = Number(process.env.PORT || 3000);
const adminToken = process.env.ADMIN_TOKEN || "qiangyun-admin";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon",
};

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
};

const readBody = (request) =>
  new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("body_too_large"));
        request.destroy();
      }
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });

const normalizeText = (value, maxLength = 300) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);

const createInquiry = async (payload, request) => {
  const inquiry = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    name: normalizeText(payload.name, 80),
    contact: normalizeText(payload.contact, 120),
    sport: normalizeText(payload.sport, 80),
    event: normalizeText(payload.event, 100),
    message: normalizeText(payload.message, 500),
    source: normalizeText(payload.source, 60),
    ip: normalizeText(request.headers["x-forwarded-for"] || request.socket.remoteAddress, 120),
  };

  if (!inquiry.name || !inquiry.contact) {
    return { error: "name_and_contact_required" };
  }

  await fs.mkdir(dataDir, { recursive: true });
  await fs.appendFile(inquiriesFile, `${JSON.stringify(inquiry)}\n`, "utf8");
  return { inquiry };
};

const readInquiries = async () => {
  try {
    const content = await fs.readFile(inquiriesFile, "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .reverse();
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

const handleApi = async (request, response, url) => {
  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, { ok: true, service: "qiangyun-api" });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/inquiries") {
    try {
      const body = await readBody(request);
      const payload = JSON.parse(body || "{}");
      const result = await createInquiry(payload, request);

      if (result.error) {
        sendJson(response, 400, { ok: false, error: result.error });
        return true;
      }

      sendJson(response, 201, { ok: true, id: result.inquiry.id });
    } catch {
      sendJson(response, 400, { ok: false, error: "invalid_request" });
    }
    return true;
  }

  if (request.method === "GET" && url.pathname === "/api/inquiries") {
    const token = request.headers["x-admin-token"] || url.searchParams.get("token");
    if (token !== adminToken) {
      sendJson(response, 401, { ok: false, error: "unauthorized" });
      return true;
    }

    const inquiries = await readInquiries();
    sendJson(response, 200, { ok: true, inquiries });
    return true;
  }

  return false;
};

const serveStatic = async (request, response, url) => {
  const requestedPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(rootDir, requestedPath));

  if (!filePath.startsWith(rootDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
    });
    response.end(file);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const handled = await handleApi(request, response, url);
    if (!handled) {
      await serveStatic(request, response, url);
    }
  } catch {
    sendJson(response, 500, { ok: false, error: "server_error" });
  }
});

server.listen(port, () => {
  console.log(`Qiangyun site and API running at http://127.0.0.1:${port}`);
});

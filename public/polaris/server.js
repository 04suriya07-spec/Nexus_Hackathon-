const http = require("node:http");
const https = require("node:https");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT) || 5173;
const allowedCameras = new Set(["arrivalHeights", "boreSite", "aimsCam", "palmer"]);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function proxyWebcamFeed(camera, response) {
  const upstreamUrl = new URL("https://www.usap.gov/components/webcams.cfc");
  upstreamUrl.search = new URLSearchParams({
    method: "outputCurrentCamImage",
    cameraLocation: camera === "palmer" ? "Palmer" : "McMurdo",
    camera
  }).toString();

  const upstreamRequest = https.get(upstreamUrl, upstream => {
    let body = "";
    upstream.setEncoding("utf8");
    upstream.on("data", chunk => { body += chunk; });
    upstream.on("end", () => {
      if (upstream.statusCode !== 200 || !body.trim().split(",")[0]) {
        response.writeHead(502).end("Webcam feed unavailable");
        return;
      }
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8"
      });
      response.end(body);
    });
  });

  upstreamRequest.setTimeout(10000, () => upstreamRequest.destroy(new Error("Webcam request timed out")));
  upstreamRequest.on("error", () => {
    if (!response.headersSent) response.writeHead(502);
    response.end("Webcam feed unavailable");
  });
}

http.createServer((request, response) => {
  const requestUrl = new URL(request.url, "http://localhost");
  if (requestUrl.pathname === "/api/webcam-feed") {
    const camera = requestUrl.searchParams.get("camera");
    if (!allowedCameras.has(camera)) {
      response.writeHead(400).end("Unknown camera");
      return;
    }
    proxyWebcamFeed(camera, response);
    return;
  }

  const relativePath = decodeURIComponent(requestUrl.pathname)
    .split("/")
    .filter(Boolean)
    .join(path.sep) || "index.html";
  const filePath = path.resolve(root, relativePath);
  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream"
    });
    response.end(content);
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`Portal running at http://localhost:${port}/`);
});
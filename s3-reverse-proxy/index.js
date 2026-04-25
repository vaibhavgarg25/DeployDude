import express from "express";
import httpProxy from "http-proxy";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;
const BASE_PATH = process.env.BASE_PATH;

if (!BASE_PATH) {
  throw new Error("BASE_PATH is required");
}

const proxy = httpProxy.createProxyServer({});

function extractSubdomain(hostname) {
  const parts = hostname.split(".");

  // proxy.192.168.49.2.nip.io => proxy
  if (parts.length < 2) return null;

  return parts[0];
}

app.use((req, res) => {
  const hostname = req.hostname;
  const subdomain = extractSubdomain(hostname);

  const folder = subdomain || "default";

  const target = BASE_PATH;

  if (req.url === "/") {
    req.url = `/${folder}/index.html`;
  } else {
    req.url = `/${folder}${req.url}`;
  }

  console.log("Hostname:", hostname);
  console.log("Folder:", folder);
  console.log("Proxying to:", `${target}${req.url}`);

  proxy.web(req, res, {
    target,
    changeOrigin: true,
  });
});

proxy.on("error", (err, req, res) => {
  console.error("Proxy error:", err.message);

  if (!res.headersSent) {
    res.statusCode = 500;
    res.end("Reverse proxy error");
  }
});

app.listen(PORT, () => {
  console.log(`Reverse proxy running at ${PORT}`);
});
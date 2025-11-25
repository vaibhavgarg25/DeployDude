import express from "express";
import httpProxy from "http-proxy";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const BASE_PATH = process.env.BASE_PATH; 

const proxy = httpProxy.createProxy();

function extractSubdomain(hostname) {
    const parts = hostname.split(".");
    if (parts.length === 1) return null;
    if (parts[parts.length - 1] === "localhost") {
        return parts[0];
    }
    return parts[0];
}

app.use((req, res) => {
    const hostname = req.hostname;
    const subdomain = extractSubdomain(hostname);
    const folder = subdomain || "default";
    const resolveTo = `${BASE_PATH}/${folder}`;
    console.log("Proxying →", resolveTo);
    return proxy.web(req, res, {
        target: resolveTo,
        changeOrigin: true
    });
});
proxy.on("proxyReq", (proxyReq, req) => {
    if (req.url === "/") {
        proxyReq.path += "index.html";
    }
});

app.listen(PORT, () => {
    console.log(`Reverse proxy running at ${PORT}`);
});

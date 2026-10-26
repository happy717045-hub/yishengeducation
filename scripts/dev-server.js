/* 本機測試用：模擬 Vercel 的靜態檔案與 /api 函式，並內建一個假的 Redis（只在本機用）。
   用法：ADMIN_PASSWORD=測試密碼 node scripts/dev-server.js   然後打開 http://localhost:3000 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const mem = new Map();
const MOCK_TOKEN = "dev-token";

if (!process.env.KV_REST_API_URL) {
  process.env.KV_REST_API_URL = "http://127.0.0.1:" + PORT + "/__mock_redis";
  process.env.KV_REST_API_TOKEN = MOCK_TOKEN;
}
if (!process.env.ADMIN_PASSWORD) process.env.ADMIN_PASSWORD = "dev-password";

const handlers = {
  "/api/config": require("../api/config.js"),
  "/api/login": require("../api/login.js"),
  "/api/save": require("../api/save.js"),
};
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".ico": "image/x-icon" };

function readBody(req) {
  return new Promise((resolve) => {
    let b = "";
    req.on("data", (d) => (b += d));
    req.on("end", () => resolve(b));
  });
}
function shim(res) {
  res.status = (c) => ((res.statusCode = c), res);
  res.json = (o) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(o));
    return res;
  };
  return res;
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, "http://x");
    if (url.pathname === "/__mock_redis") {
      if (req.headers.authorization !== "Bearer " + MOCK_TOKEN) return shim(res).status(401).json({ error: "auth" });
      const cmd = JSON.parse((await readBody(req)) || "[]");
      if (cmd[0] === "GET") return shim(res).json({ result: mem.has(cmd[1]) ? mem.get(cmd[1]) : null });
      if (cmd[0] === "SET") { mem.set(cmd[1], cmd[2]); return shim(res).json({ result: "OK" }); }
      return shim(res).status(400).json({ error: "unsupported" });
    }
    const h = handlers[url.pathname];
    if (h) {
      if (req.method === "POST") {
        const raw = await readBody(req);
        try { req.body = JSON.parse(raw || "{}"); } catch (e) { req.body = {}; }
      }
      return h(req, shim(res));
    }
    let f = path.join(__dirname, "..", "public", url.pathname === "/" ? "index.html" : url.pathname);
    if (!f.startsWith(path.join(__dirname, "..", "public"))) return shim(res).status(403).json({});
    fs.readFile(f, (err, data) => {
      if (err) { res.statusCode = 404; return res.end("not found"); }
      res.setHeader("Content-Type", TYPES[path.extname(f)] || "application/octet-stream");
      res.end(data);
    });
  })
  .listen(PORT, () => console.log("http://localhost:" + PORT + "  (後台密碼：" + process.env.ADMIN_PASSWORD + ")"));

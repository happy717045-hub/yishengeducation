/* 共用工具：資料儲存（Upstash Redis REST，不需安裝套件）與後台密碼檢查。
   檔名開頭 _ 的檔案不會變成網址。 */
const crypto = require("crypto");

const KEY = "yisheng:config";
const PREV_KEY = "yisheng:config:prev";

function storeEnv() {
  return {
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
  };
}
function storeReady() {
  const e = storeEnv();
  return !!(e.url && e.token);
}
async function redis(cmd) {
  const e = storeEnv();
  if (!e.url || !e.token) throw new Error("NO_STORE");
  const r = await fetch(e.url, {
    method: "POST",
    headers: { Authorization: "Bearer " + e.token, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  if (!r.ok) throw new Error("STORE_HTTP_" + r.status);
  const j = await r.json();
  if (j.error) throw new Error("STORE_ERROR");
  return j.result;
}
async function loadConfig() {
  const v = await redis(["GET", KEY]);
  return v ? JSON.parse(v) : null;
}
async function saveConfig(cfg) {
  const old = await redis(["GET", KEY]);
  if (old) await redis(["SET", PREV_KEY, old]); // 留一份上一版，改壞了可以救回
  await redis(["SET", KEY, JSON.stringify(cfg)]);
}

function sha(s) {
  return crypto.createHash("sha256").update(String(s)).digest();
}
function passwordConfigured() {
  return !!process.env.ADMIN_PASSWORD;
}
function checkPassword(p) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  return crypto.timingSafeEqual(sha(p || ""), sha(real));
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* 基本格式檢查：只擋明顯不對的內容，細節規則由後台畫面負責 */
function validShape(c) {
  if (!c || typeof c !== "object") return false;
  if (!c.school || typeof c.school !== "object") return false;
  if (!Array.isArray(c.seasons) || !Array.isArray(c.courses) || !Array.isArray(c.discounts)) return false;
  if (c.seasons.length > 20 || c.courses.length > 100 || c.discounts.length > 100) return false;
  return true;
}

module.exports = { loadConfig, saveConfig, storeReady, checkPassword, passwordConfigured, validShape, sleep };

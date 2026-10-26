/* POST /api/login {password}：檢查後台密碼。 */
const { checkPassword, passwordConfigured, storeReady, sleep } = require("./_lib");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  if (!passwordConfigured() || !storeReady()) return res.status(503).json({ ok: false, error: "not_configured" });
  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (checkPassword(body.password)) return res.status(200).json({ ok: true });
  await sleep(700); // 輸錯密碼稍微拖慢，擋暴力猜測
  return res.status(401).json({ ok: false, error: "bad_password" });
};

/* POST /api/save {password, config}：後台「儲存並發布」。 */
const { checkPassword, passwordConfigured, storeReady, saveConfig, validShape, sleep } = require("./_lib");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  if (!passwordConfigured() || !storeReady()) return res.status(503).json({ ok: false, error: "not_configured" });
  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (!checkPassword(body.password)) {
    await sleep(700);
    return res.status(401).json({ ok: false, error: "bad_password" });
  }
  if (!validShape(body.config)) return res.status(400).json({ ok: false, error: "bad_config" });
  const text = JSON.stringify(body.config);
  if (text.length > 400000) return res.status(413).json({ ok: false, error: "too_large" });
  try {
    await saveConfig(body.config);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "store_failed" });
  }
};

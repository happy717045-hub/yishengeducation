/* GET /api/config：家長端載入最新設定。沒有存過就回 null，網頁改用內建的預設設定。 */
const { loadConfig, storeReady } = require("./_lib");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "method" });
  if (!storeReady()) return res.status(200).json({ config: null, store: false });
  try {
    return res.status(200).json({ config: await loadConfig(), store: true });
  } catch (e) {
    return res.status(200).json({ config: null, store: false });
  }
};

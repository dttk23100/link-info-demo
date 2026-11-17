const GIST_ID = process.env.GIST_ID;
const TOKEN = process.env.GH_TOKEN;

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (!GIST_ID || !TOKEN) return res.status(500).json({ error: "GIST_ID/GH_TOKEN not set" });
  try {
    const owner = process.env.GIST_OWNER || "dttk23100";
    const url = `https://gist.githubusercontent.com/${owner}/${GIST_ID}/raw/visits.json?t=${Date.now()}`;
    const r = await fetch(url, { cache: "no-store", headers: { "User-Agent": "link-info-demo" } });
    if (!r.ok) throw new Error(`gist raw: HTTP ${r.status}`);
    let visits = [];
    try { visits = await r.json(); } catch (_) { visits = []; }
    res.status(200).json({ visits, latest: visits[0] || null });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
};

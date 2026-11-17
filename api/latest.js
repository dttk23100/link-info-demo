const GIST_ID = process.env.GIST_ID;
const TOKEN = process.env.GH_TOKEN;

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (!GIST_ID || !TOKEN) return res.status(500).json({ error: "GIST_ID/GH_TOKEN not set" });
  try {
    const r = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "link-info-demo",
      },
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`gist: HTTP ${r.status}`);
    const data = await r.json();
    const raw = data.files?.["visits.json"]?.content || "[]";
    let visits = [];
    try { visits = JSON.parse(raw); } catch (_) {}
    res.status(200).json({ visits, latest: visits[0] || null });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
};

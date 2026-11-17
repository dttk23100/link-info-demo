const GIST_ID = process.env.GIST_ID;
const TOKEN = process.env.GH_TOKEN;

async function readGist() {
  const r = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "link-info-demo",
    },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`gist read: HTTP ${r.status}`);
  const data = await r.json();
  const raw = data.files?.["visits.json"]?.content || "[]";
  try { return JSON.parse(raw); } catch (_) { return []; }
}

async function writeGist(visits) {
  const r = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "link-info-demo",
    },
    body: JSON.stringify({
      files: { "visits.json": { content: JSON.stringify(visits, null, 2) } },
    }),
  });
  if (!r.ok) throw new Error(`gist write: HTTP ${r.status}`);
}

function serverInfo(req) {
  const h = req.headers || {};
  const fwd = String(h["x-forwarded-for"] || "").split(",")[0].trim();
  return {
    ip: fwd || req.socket?.remoteAddress || null,
    country: h["x-vercel-ip-country"] || null,
    region: h["x-vercel-ip-country-region"] || null,
    city: h["x-vercel-ip-city"] ? decodeURIComponent(h["x-vercel-ip-city"]) : null,
    latitude: h["x-vercel-ip-latitude"] || null,
    longitude: h["x-vercel-ip-longitude"] || null,
    timezone: h["x-vercel-ip-timezone"] || null,
    userAgent: h["user-agent"] || null,
    referer: h["referer"] || null,
    acceptLanguage: h["accept-language"] || null,
    secChUa: h["sec-ch-ua"] || null,
    secChUaMobile: h["sec-ch-ua-mobile"] || null,
    secChUaPlatform: h["sec-ch-ua-platform"] || null,
  };
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "POST only" });
  }
  if (!GIST_ID || !TOKEN) return res.status(500).json({ error: "GIST_ID/GH_TOKEN not set" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  body = body && typeof body === "object" ? body : {};

  const visit = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: new Date().toISOString(),
    server: serverInfo(req),
    client: body.client && typeof body.client === "object" ? body.client : {},
  };

  try {
    const visits = await readGist();
    const next = [visit, ...(Array.isArray(visits) ? visits : [])].slice(0, 25);
    await writeGist(next);
    res.status(200).json({ ok: true, id: visit.id, visit });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
};

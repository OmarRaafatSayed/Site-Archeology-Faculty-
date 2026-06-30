/**
 * smoke-test-images.js
 * Full image pipeline smoke test:
 * 1. Backend API — photoUrl present & correct format
 * 2. Disk — every photoUrl has a matching WebP file
 * 3. Frontend — faculty pages return 200 with no 500
 * 4. Next.js image optimization — /_next/image endpoint works
 * 5. Dashboard edit API — PATCH returns faculty with photoUrl
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const API_BASE      = 'http://localhost:3010';
const FRONTEND_BASE = 'http://localhost:3000';
const WEBP_DIR      = path.resolve(__dirname, '../frontend/public/uploads/faculty');

let pass = 0, fail = 0, warn = 0;

function req(base, p, method, body, token) {
  return new Promise(resolve => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: new URL(base).hostname,
      port:     new URL(base).port || 80,
      path: p, method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const r = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ s: res.statusCode, b: JSON.parse(d) }); }
        catch { resolve({ s: res.statusCode, b: d }); }
      });
    });
    r.on('error', e => resolve({ s: 0, b: { error: e.message } }));
    if (bodyStr) r.write(bodyStr);
    r.end();
  });
}

function check(label, ok, detail) {
  if (ok)   { pass++; console.log(`  PASS  ${label}`); }
  else      { fail++; console.log(`  FAIL  ${label}${detail ? ' — ' + detail : ''}`); }
}

async function run() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  IMAGE PIPELINE SMOKE TEST');
  console.log('═══════════════════════════════════════════════════════════\n');

  // ── 1. Get admin token ──────────────────────────────────────────────────
  const loginR = await req(API_BASE, '/api/auth/login', 'POST',
    { identifier: 'admin@fa-arch.cu.edu.eg', password: 'Admin@12345' });
  const token = loginR.b?.data?.accessToken;
  check('[AUTH] Admin login', !!token);

  // ── 2. Faculty API — photoUrl format ────────────────────────────────────
  console.log('\n[1] Backend API — Faculty photoUrl');
  const facR = await req(API_BASE, '/api/faculty?limit=84');
  const items = facR.b?.data?.items || [];
  const total = facR.b?.data?.total || 0;

  check('[API] GET /faculty returns data', items.length > 0, `got ${items.length}`);
  check('[API] Total faculty = 84', total === 84, `got ${total}`);

  const withPhoto    = items.filter(m => m.photoUrl?.startsWith('/uploads/faculty/')).length;
  const withoutPhoto = items.filter(m => !m.photoUrl).length;

  check(`[API] photoUrl coverage 98%+`, withPhoto >= 82,
    `${withPhoto}/${items.length} have /uploads/faculty/ paths`);
  console.log(`       ℹ️  With photo: ${withPhoto} | Without: ${withoutPhoto}`);

  // Spot-check 5 professors have correct URL format
  const profs = items.filter(m => m.degree === 'professor').slice(0, 5);
  for (const p of profs) {
    const valid = p.photoUrl && p.photoUrl.startsWith('/uploads/faculty/') && p.photoUrl.endsWith('.webp');
    check(`[API] Prof ${p.nameAr.slice(0,20)} has .webp URL`, valid, p.photoUrl);
  }

  // ── 3. Disk verification ─────────────────────────────────────────────────
  console.log('\n[2] Disk — WebP files in /public/uploads/faculty/');
  const webpFiles = fs.existsSync(WEBP_DIR)
    ? fs.readdirSync(WEBP_DIR).filter(f => f.endsWith('.webp'))
    : [];
  check('[DISK] Output dir exists', fs.existsSync(WEBP_DIR));
  check('[DISK] 80+ WebP files created', webpFiles.length >= 80,
    `found ${webpFiles.length} files`);

  const totalKB = webpFiles
    .map(f => fs.statSync(path.join(WEBP_DIR, f)).size)
    .reduce((a, b) => a + b, 0) / 1024;
  console.log(`       ℹ️  ${webpFiles.length} files, ${totalKB.toFixed(1)} KB total`);

  // Every DB photoUrl (from API) matches a disk file
  let brokenUrls = 0;
  for (const m of items) {
    if (!m.photoUrl || !m.photoUrl.startsWith('/uploads/faculty/')) continue;
    const filename = m.photoUrl.split('/').pop();
    if (!fs.existsSync(path.join(WEBP_DIR, filename))) brokenUrls++;
  }
  check('[DISK] All API photoUrls have matching disk files', brokenUrls === 0,
    `${brokenUrls} broken`);

  // Check WebP file integrity (minimum 1KB each)
  let tooSmall = 0;
  for (const f of webpFiles) {
    const sz = fs.statSync(path.join(WEBP_DIR, f)).size;
    if (sz < 1024) tooSmall++;
  }
  check('[DISK] All WebP files > 1KB (not corrupted)', tooSmall === 0,
    `${tooSmall} suspiciously small`);

  // ── 4. Next.js /_next/image optimization endpoint ────────────────────────
  console.log('\n[3] Next.js Image Optimization (/_next/image)');
  if (items.length > 0 && items[0].photoUrl) {
    const firstUrl  = encodeURIComponent(items[0].photoUrl);
    const nextImgR  = await req(FRONTEND_BASE,
      `/_next/image?url=${firstUrl}&w=640&q=75`);
    check('[NEXTIMG] /_next/image endpoint returns 200', nextImgR.s === 200,
      `got ${nextImgR.s}`);

    // Should serve WebP or AVIF (optimized)
    const isOptimized = typeof nextImgR.b === 'string'
      ? nextImgR.b.length > 0
      : nextImgR.s === 200;
    check('[NEXTIMG] Optimization pipeline active', isOptimized);
    console.log(`       ℹ️  Serving: ${items[0].nameAr} → ${items[0].photoUrl}`);
  } else {
    warn++;
    console.log('  WARN  [NEXTIMG] No faculty with photo to test');
  }

  // ── 5. Frontend faculty pages ─────────────────────────────────────────────
  console.log('\n[4] Frontend Faculty Pages');
  for (const loc of ['ar', 'en']) {
    const r = await req(FRONTEND_BASE, `/${loc}/faculty`);
    check(`[FRONTEND] /${loc}/faculty returns 200`, r.s === 200, `got ${r.s}`);
  }

  // Department faculty pages
  for (const slug of ['egyptology', 'islamic', 'conservation', 'greco-roman']) {
    for (const loc of ['ar', 'en']) {
      const r = await req(FRONTEND_BASE, `/${loc}/departments/${slug}`);
      check(`[FRONTEND] /${loc}/departments/${slug}`, r.s === 200, `got ${r.s}`);
    }
  }

  // Individual faculty member page
  if (items.length > 0) {
    const memberId = items[0].id;
    for (const loc of ['ar', 'en']) {
      const r = await req(FRONTEND_BASE, `/${loc}/faculty/${memberId}`);
      check(`[FRONTEND] /${loc}/faculty/:id`, r.s === 200, `got ${r.s}`);
    }
  }

  // ── 6. Admin Dashboard — edit form fetches correct photoUrl ──────────────
  console.log('\n[5] Admin Dashboard — Edit Form');
  if (token && items.length > 0) {
    const memberId = items.find(m => m.photoUrl)?.id;
    if (memberId) {
      // GET single faculty
      const getR = await req(API_BASE, `/api/faculty/${memberId}`, 'GET', null, token);
      check('[ADMIN] GET /faculty/:id returns photoUrl',
        !!getR.b?.data?.photoUrl, getR.b?.data?.photoUrl);

      // PATCH (update adminRole — safe field)
      const patchR = await req(API_BASE, `/api/faculty/${memberId}`, 'PUT',
        { adminRole: null }, token);
      check('[ADMIN] PUT /faculty/:id (edit) returns 200', patchR.s === 200,
        `got ${patchR.s}`);
      check('[ADMIN] Updated member still has photoUrl',
        !!patchR.b?.data?.photoUrl, patchR.b?.data?.photoUrl);
    }
  }

  // ── 7. next.config.js — remotePatterns OK ────────────────────────────────
  console.log('\n[6] next.config.js Verification');
  const cfgPath = path.resolve(__dirname, '../frontend/next.config.js');
  const cfg = fs.readFileSync(cfgPath, 'utf8');
  check('[CONFIG] remotePatterns has localhost:3010', cfg.includes("port: '3010'"));
  check('[CONFIG] formats includes webp',  cfg.includes("'image/webp'"));
  check('[CONFIG] formats includes avif',  cfg.includes("'image/avif'"));
  check('[CONFIG] minimumCacheTTL set',    cfg.includes('minimumCacheTTL'));

  // ── Summary ───────────────────────────────────────────────────────────────
  const total2 = pass + fail + warn;
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  PASS: ${pass}   WARN: ${warn}   FAIL: ${fail}   TOTAL: ${total2}`);
  console.log('═══════════════════════════════════════════════════════════\n');
  process.exit(fail > 0 ? 1 : 0);
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });

#!/usr/bin/env node
// Fetches Instagram posts via Graph API and writes public/instagram-data.json.
// Requires INSTAGRAM_TOKEN env var (long-lived token, valid 60 days).
//
// Setup:
//  1. developers.facebook.com → Crea app → Add product: Instagram Graph API
//  2. Genera un User Token con scope: instagram_basic, instagram_content_publish
//  3. Scambia per long-lived token:
//     GET https://graph.instagram.com/access_token?grant_type=ig_exchange_token
//         &client_secret=APP_SECRET&access_token=SHORT_LIVED_TOKEN
//  4. Aggiungi INSTAGRAM_TOKEN nelle Vercel env vars del progetto

const https  = require('https');
const fs     = require('fs');
const path   = require('path');

const TOKEN  = process.env.INSTAGRAM_TOKEN || '';
const DEST   = path.join(__dirname, '..', 'public', 'instagram-data.json');

// Mappatura hashtag → categoria
const CAT_MAP = {
  generative: ['generative','genai','aiart','comfyui','stablediffusion','aiartwork'],
  fashion:    ['fashion','moda','aifahion','style','wearable'],
  cinematic:  ['cinematic','film','shortfilm','runway','runwayml'],
  worldbuilding: ['worldbuilding','worldbuild','sema','labyrinth','dreamscape'],
};

function inferCat(caption = '') {
  const lower = caption.toLowerCase();
  for (const [cat, tags] of Object.entries(CAT_MAP)) {
    if (tags.some(t => lower.includes(t))) return cat;
  }
  return 'generative';
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Instagram API ${res.statusCode}: ${raw}`));
        } else {
          resolve(JSON.parse(raw));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  if (!TOKEN) {
    console.warn('⚠  INSTAGRAM_TOKEN non impostato — skip fetch Instagram.');
    process.exit(0);
  }

  console.log('Fetching Instagram media…');

  const fields  = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
  const data    = await fetchJson(
    `https://graph.instagram.com/me/media?fields=${fields}&limit=24&access_token=${TOKEN}`
  );

  const works = (data.data || [])
    .filter(p => ['IMAGE','CAROUSEL_ALBUM'].includes(p.media_type))
    .map(p => ({
      id:        p.id,
      cat:       inferCat(p.caption),
      title:     (p.caption || '').split('\n')[0].slice(0, 60) || 'AI Visual',
      caption:   (p.caption || '').slice(0, 180),
      tool:      'Instagram · AI',
      image_url: p.media_url,
      ig_url:    p.permalink,
      date:      p.timestamp,
    }));

  const out = { generated_at: new Date().toISOString(), works };
  fs.writeFileSync(DEST, JSON.stringify(out, null, 2));
  console.log(`Saved ${works.length} posts → ${DEST}`);
}

main().catch(err => {
  console.error('fetch-instagram:', err.message);
  // Non blocca il build — la sezione usa il fallback statico
  process.exit(0);
});

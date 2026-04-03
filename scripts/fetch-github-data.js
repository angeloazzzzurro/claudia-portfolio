#!/usr/bin/env node
// Fetches GitHub profile + repos and writes public/github-data.json.
// Run: npm run build
// Optional: set GITHUB_TOKEN env var to avoid the 60 req/hr anonymous limit.

const https = require('https');
const fs = require('fs');
const path = require('path');

const GITHUB_USER = 'angeloazzzzurro';
const TOKEN = process.env.GITHUB_TOKEN || '';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'claudia-portfolio-build',
    };
    if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

    https.get(url, { headers }, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`GitHub API ${res.statusCode} for ${url}: ${raw}`));
        } else {
          resolve(JSON.parse(raw));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log(`Fetching GitHub data for ${GITHUB_USER}…`);

  const [profile, allRepos] = await Promise.all([
    fetchJson(`https://api.github.com/users/${GITHUB_USER}`),
    fetchJson(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`),
  ]);

  const repos = allRepos.filter((r) => !r.fork);

  const output = {
    generated_at: new Date().toISOString(),
    profile,
    repos,
  };

  const dest = path.join(__dirname, '..', 'public', 'github-data.json');
  fs.writeFileSync(dest, JSON.stringify(output, null, 2));
  console.log(`Saved ${repos.length} repos → ${dest}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

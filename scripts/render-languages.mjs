// Language mix across owned public, non-fork repos, as one segmented bar.
import { writeFileSync } from "node:fs";
import { THEMES, SERIES, FONT, esc, github } from "./nord.mjs";

const USER = process.env.GH_USER || "Chetakk";
const TOP = Number(process.env.TOP_LANGS || 6);
// Markup and notebooks dwarf real code by byte count; leave them out.
const IGNORE = new Set(["Jupyter Notebook", "HTML", "CSS", "SCSS", "Dockerfile", "Jinja", "Makefile"]);
const W = 1200, PAD = 56;

const repos = (await github(`/users/${USER}/repos?type=owner&per_page=100`)).filter((r) => !r.fork && !r.archived);
const totals = {};
for (const repo of repos) {
  for (const [lang, bytes] of Object.entries(await github(`/repos/${repo.full_name}/languages`))) {
    if (!IGNORE.has(lang)) totals[lang] = (totals[lang] || 0) + bytes;
  }
}
const sum = Object.values(totals).reduce((a, b) => a + b, 0);
let langs = Object.entries(totals).sort((a, b) => b[1] - a[1]);
const rest = langs.slice(TOP).reduce((s, [, b]) => s + b, 0);
langs = langs.slice(0, TOP).map(([name, b]) => ({ name, share: b / sum }));
if (rest) langs.push({ name: "Other", share: rest / sum });

const perRow = 4, rows = Math.ceil(langs.length / perRow), H = 160 + rows * 46;

function render(t) {
  let x = PAD, segs = "", legend = "";
  const span = W - 2 * PAD, gap = 4, usable = span - gap * (langs.length - 1);
  langs.forEach((l, i) => {
    const color = l.name === "Other" ? t.muted : SERIES[i % SERIES.length];
    const w = Math.max(2, l.share * usable);
    segs += `<rect x="${x.toFixed(1)}" y="94" width="${w.toFixed(1)}" height="12" rx="4" fill="${color}"/>`;
    x += w + gap;
    const lx = PAD + (i % perRow) * (span / perRow), ly = 160 + Math.floor(i / perRow) * 46;
    legend += `<circle cx="${lx + 7}" cy="${ly - 7}" r="7" fill="${color}"/>
  <text x="${lx + 24}" y="${ly}" font-size="22" fill="${t.text}">${esc(l.name)} <tspan fill="${t.muted}" font-size="19">${(l.share * 100).toFixed(1)}%</tspan></text>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc("Languages: " + langs.map((l) => `${l.name} ${(l.share * 100).toFixed(0)}%`).join(", "))}">
<rect width="${W}" height="${H}" rx="12" fill="${t.card}"/>
<g font-family="${FONT}">
  <text x="${PAD}" y="62" font-size="19" letter-spacing="5" fill="${t.accent}">LANGUAGES</text>
  <text x="${W - PAD}" y="62" font-size="21" text-anchor="end" fill="${t.soft}">across ${repos.length} public repositories</text>
  ${segs}
  ${legend}
</g>
</svg>
`;
}

for (const [name, t] of Object.entries(THEMES)) {
  writeFileSync(new URL(`../assets/languages-${name}.svg`, import.meta.url), render(t));
}
console.log("languages:", langs.map((l) => `${l.name} ${(l.share * 100).toFixed(1)}%`).join(", "));

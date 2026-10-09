// Weekly contributions for the last 12 months (the same data as the profile graph,
// private contributions included as counts), plus a faint cumulative line.
import { writeFileSync } from "node:fs";
import { THEMES, FONT, esc, github } from "./nord.mjs";

const USER = process.env.GH_USER || "Chetakk";
const W = 1200, H = 300, PAD = 56, TOP = 100, BOTTOM = 236;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const data = await github(null, {
  query: `query($login: String!) { user(login: $login) { contributionsCollection {
    contributionCalendar { totalContributions weeks { firstDay contributionDays { contributionCount } } } } } }`,
  variables: { login: USER },
});
const cal = data.user.contributionsCollection.contributionCalendar;
const weeks = cal.weeks.map((w) => ({
  first: new Date(w.firstDay + "T00:00:00Z"),
  count: w.contributionDays.reduce((s, d) => s + d.contributionCount, 0),
}));
const max = Math.max(1, ...weeks.map((w) => w.count));
const slot = (W - 2 * PAD) / weeks.length, barW = Math.max(3, slot - 5);

function render(t) {
  let running = 0, line = "", bars = "", labels = "", lastMonth = -1;
  weeks.forEach((w, i) => {
    const x = PAD + i * slot + (slot - barW) / 2;
    const h = w.count ? Math.max(4, (w.count / max) * (BOTTOM - TOP)) : 2;
    const fill = w.count ? t.accent : t.track;
    const opacity = w.count ? (0.45 + 0.55 * (w.count / max)).toFixed(2) : "1";
    bars += `<rect x="${x.toFixed(1)}" y="${(BOTTOM - h).toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="${fill}" opacity="${opacity}"><title>week of ${w.first.toISOString().slice(0, 10)}: ${w.count}</title></rect>`;
    running += w.count;
    const ly = BOTTOM - (running / cal.totalContributions || 0) * (BOTTOM - TOP);
    line += `${i ? "L" : "M"}${(x + barW / 2).toFixed(1)} ${ly.toFixed(1)} `;
    const m = w.first.getUTCMonth();
    if (m !== lastMonth && i < weeks.length - 2) {
      if (lastMonth !== -1) labels += `<text x="${x.toFixed(1)}" y="${BOTTOM + 36}" font-size="18" fill="${t.muted}">${MONTHS[m]}</text>`;
      lastMonth = m;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(`${cal.totalContributions} contributions in the last 12 months, weekly`)}">
<rect width="${W}" height="${H}" rx="12" fill="${t.card}"/>
<g font-family="${FONT}">
  <text x="${PAD}" y="62" font-size="19" letter-spacing="5" fill="${t.accent}">ACTIVITY</text>
  <text x="${W - PAD}" y="62" font-size="21" text-anchor="end" fill="${t.soft}"><tspan font-weight="600" fill="${t.text}">${cal.totalContributions}</tspan> contributions · last 12 months</text>
  <line x1="${PAD}" x2="${W - PAD}" y1="${BOTTOM + 0.5}" y2="${BOTTOM + 0.5}" stroke="${t.track}"/>
  ${bars}
  <path d="${line.trim()}" fill="none" stroke="${t.soft}" stroke-opacity=".35" stroke-width="1.5" stroke-dasharray="3 4"/>
  ${labels}
</g>
</svg>
`;
}

for (const [name, t] of Object.entries(THEMES)) {
  writeFileSync(new URL(`../assets/activity-${name}.svg`, import.meta.url), render(t));
}
console.log(`activity: ${cal.totalContributions} contributions over ${weeks.length} weeks`);

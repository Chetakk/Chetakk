// Header (fjord + aurora + name) and a matching footer ridge. Static art: run once
// after editing NAME/TAGLINE, no token needed.
import { writeFileSync } from "node:fs";
import { THEMES, FONT, esc, rng } from "./nord.mjs";

const NAME = "CHETAK KUMAR";
const TAGLINE = "computer vision  ·  machine learning  ·  agentic ai  ·  full-stack";
const W = 1200;

function ridge(seed, base, amp, step, h) {
  const r = rng(seed);
  let pts = `M0 ${h}`;
  for (let x = 0; x <= W + step; x += step) {
    const y = base - amp * (0.55 * Math.sin(x / 210 + seed) + 0.45 * r()) ;
    pts += ` L${Math.min(x, W)} ${y.toFixed(1)}`;
  }
  return `${pts} L${W} ${h} Z`;
}

function header(t) {
  const H = 320;
  const r = rng(7);
  const stars = t.stars
    ? Array.from({ length: 46 }, (_, i) => {
        const x = (r() * W).toFixed(0), y = (r() * 170).toFixed(0);
        const o = (0.25 + r() * 0.55).toFixed(2), tw = i % 6 === 0 ? ` class="tw" style="animation-delay:${(r() * 6).toFixed(1)}s"` : "";
        return `<circle cx="${x}" cy="${y}" r="${r() < 0.85 ? 0.9 : 1.4}" fill="#ECEFF4" opacity="${o}"${tw}/>`;
      }).join("")
    : "";
  // Aurora: two blurred ribbons drifting slowly, kept right of the name for legibility.
  const ribbon = (y, amp, phase) => {
    let d = `M380 ${y}`;
    for (let x = 380; x <= W + 40; x += 20) d += ` L${x} ${(y + amp * Math.sin(x / 150 + phase)).toFixed(1)}`;
    for (let x = W + 40; x >= 380; x -= 20) d += ` L${x} ${(y + 34 + amp * 0.8 * Math.sin(x / 150 + phase + 0.6)).toFixed(1)}`;
    return d + " Z";
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(NAME)}: ${esc(TAGLINE)}">
<style>
  .a1{animation:drift 26s ease-in-out infinite alternate}
  .a2{animation:drift 34s ease-in-out infinite alternate-reverse}
  .tw{animation:tw 5s ease-in-out infinite}
  @keyframes drift{from{transform:translate(-30px,0)}to{transform:translate(30px,6px)}}
  @keyframes tw{0%,100%{opacity:.2}50%{opacity:.9}}
  @media (prefers-reduced-motion:reduce){.a1,.a2,.tw{animation:none}}
</style>
<defs>
  <clipPath id="c"><rect width="${W}" height="${H}" rx="12"/></clipPath>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.sky0}"/><stop offset="1" stop-color="${t.sky1}"/></linearGradient>
  <linearGradient id="au" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#8FBCBB" stop-opacity="0"/><stop offset=".3" stop-color="#8FBCBB"/>
    <stop offset=".55" stop-color="#88C0D0"/><stop offset=".8" stop-color="#A3BE8C"/>
    <stop offset="1" stop-color="#B48EAD" stop-opacity=".6"/>
  </linearGradient>
  <filter id="blur" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="16"/></filter>
</defs>
<g clip-path="url(#c)">
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${stars}
  <g filter="url(#blur)" opacity="${t.aurora}">
    <path class="a1" d="${ribbon(70, 22, 0)}" fill="url(#au)"/>
    <path class="a2" d="${ribbon(112, 16, 2.1)}" fill="url(#au)" opacity=".6"/>
  </g>
  <path d="${ridge(3, 250, 70, 60, H)}" fill="${t.ridges[0]}"/>
  <path d="${ridge(11, 282, 48, 45, H)}" fill="${t.ridges[1]}"/>
  <path d="${ridge(23, 306, 26, 35, H)}" fill="${t.ridges[2]}"/>
  <text x="72" y="122" font-family="${FONT}" font-size="44" font-weight="300" letter-spacing="10" fill="${t.text}">${esc(NAME)}</text>
  <rect x="74" y="142" width="36" height="2" rx="1" fill="${t.accent}"/>
  <text x="72" y="182" font-family="${FONT}" font-size="20" letter-spacing="3" fill="${t.soft}">${esc(TAGLINE)}</text>
</g>
</svg>
`;
}

function footer(t) {
  const H = 64;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="">
<path d="${ridge(3, 44, 26, 60, H).replace(/ L1200 64 Z$/, "").replace(/^M0 64 L/, "M")}" fill="none" stroke="${t.ridges[2]}" stroke-width="1.5" stroke-linejoin="round"/>
</svg>
`;
}

for (const [name, t] of Object.entries(THEMES)) {
  writeFileSync(new URL(`../assets/header-${name}.svg`, import.meta.url), header(t));
  writeFileSync(new URL(`../assets/footer-${name}.svg`, import.meta.url), footer(t));
}
console.log("header + footer written");

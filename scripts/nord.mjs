// Nord palette (https://www.nordtheme.com) mapped to the two GitHub themes.
// Every renderer writes a -dark.svg and a -light.svg; README.md picks one with <picture>.

export const FONT = "Inter, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";

export const THEMES = {
  dark: {
    sky0: "#242933", sky1: "#2E3440",
    card: "#2E3440", text: "#ECEFF4", soft: "#D8DEE9", muted: "#616E88",
    accent: "#88C0D0", track: "#3B4252",
    ridges: ["#3B4252", "#333A47", "#2B303B"],
    aurora: 0.55, stars: true,
  },
  light: {
    sky0: "#E5E9F0", sky1: "#ECEFF4",
    card: "#ECEFF4", text: "#2E3440", soft: "#4C566A", muted: "#8A93A6",
    accent: "#5E81AC", track: "#D8DEE9",
    ridges: ["#D8DEE9", "#BCC5D4", "#97A3B8"],
    aurora: 0.35, stars: false,
  },
};

// Frost first, then Aurora: used for language segments, in order.
export const SERIES = ["#88C0D0", "#81A1C1", "#5E81AC", "#8FBCBB", "#A3BE8C", "#EBCB8B", "#D08770", "#B48EAD"];

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Small deterministic PRNG so regenerated art doesn't churn in git.
export function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function github(path, { query, variables } = {}) {
  const token = process.env.GH_TOKEN;
  if (!token) throw new Error("GH_TOKEN is not set");
  const res = await fetch(`https://api.github.com${query ? "/graphql" : path}`, {
    method: query ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, "User-Agent": "profile-readme" },
    body: query ? JSON.stringify({ query, variables }) : undefined,
  });
  if (!res.ok) throw new Error(`${path ?? "graphql"}: ${res.status} ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return query ? json.data : json;
}

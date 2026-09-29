// Lapisan komunikasi frontend -> backend (SDP 5.3.1: frontend/services).
async function getJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  health: () => getJson("/api/health"),
  meta: () => getJson("/api/meta"),
};

export async function claude(prompt) {
  const r = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const d = await r.json();
  return d.content?.map(b => b.text || "").join("") || "";
}

export async function gumroadGet(endpoint) {
  const r = await fetch(`/api/gumroad/${endpoint}`);
  return r.json();
}

export async function gumroadPost(endpoint, params) {
  const r = await fetch(`/api/gumroad/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });
  return r.json();
}

/* Smoke test for the rule-based chat endpoint (USE_LLM=0). */
const BASE = "http://localhost:3000/api/trpc";

async function chat(scenario, messages, lang = "ru") {
  const url = `${BASE}/ai.chat?batch=1`;
  const body = JSON.stringify({ "0": { json: { messages, lang } } });
  const resp = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
  const data = await resp.json();
  const item = Array.isArray(data) ? data[0] : data;
  if (!item.result?.ok && item.error) { console.log("  ERROR:", item.error?.json?.message); return; }
  const ok = item.result?.ok;
  const result = item.result?.data?.json ?? item.result?.error?.json ?? item;
  console.log(`── ${scenario} ──`);
  console.log("  ok:", ok === undefined ? "n/a" : Boolean(ok));
  console.log("  text:", (result.text ?? "").slice(0, 220));
  console.log("  meta:", JSON.stringify(result.meta ?? {}));
  return result;
}

const R = (c) => ({ role: "user", content: c });

await chat("greeting RU", [R("Привет!")]);
await chat("kitchen price without size", [R("Сколько стоит кухня?")]);
await chat("kitchen 3 meters", [R("Хочу кухню 3 метра")]);
await chat("kitchen 3m + budget + phone (lead auto-create)", [
  R("Мне нужна кухня 3.5 метра, бюджет 900000 тг"),
  R("Мой телефон +7 701 555 44 33"),
]);
await chat("wardrobe size", [R("Шкаф-купе, ширина 2 метра")]);
await chat("materials FAQ", [R("Из каких материалов делаете?")]);
await chat("handoff complaint", [R("Вы меня обманули! Позовите менеджера")]);
await chat("greeting KK", [R("Сәлем, ас үй керек")], "kk");
console.log("\nDONE — all rule-chat scenarios executed with ZERO external API calls.");

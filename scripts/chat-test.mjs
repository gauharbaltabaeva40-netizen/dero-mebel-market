// Quick smoke test for the AI chat endpoint (tool calling, scoring, handoff).
import { createConnection } from "mysql2/promise";

const scenarios = [
  {
    name: "FAQ answer + handoff request",
    lang: "ru",
    messages: [
      { role: "user", content: "Какая гарантия на мебель?" },
      { role: "assistant", content: "На всю мебель действует гарантия 12 месяцев. Чем ещё могу помочь?" },
      { role: "user", content: "Я недоволен, хочу позвонить менеджеру!" },
    ],
  },
  {
    name: "Lead creation flow (size + budget + phone)",
    lang: "kk",
    messages: [
      { role: "user", content: "Шкаф 3 метр ені, 2.7 метр биіктік керек. Бюджетім 2 миллион." },
      { role: "assistant", content: "Түсіндім! Телефон нөміріңізді қалдырсаңыз, менеджер өлшеуге келеді." },
      { role: "user", content: "Менің атым Айдос, телефон +7 701 123 45 67." },
    ],
  },
  {
    name: "Lead form protocol (UI submitLead)",
    lang: "ru",
    messages: [
      { role: "user", content: "Мне нужна кухня 4 метра, бюджет 700000." },
      { role: "assistant", content: "Хорошо, смета готова — около 607000 тенге. Оставьте телефон, и мы запишем вас на бесплатный замер." },
      { role: "user", content: "__LEAD_FORM__|Жанар|+7 777 555 44 33|" },
    ],
  },
];

const base = "http://localhost:3000/api/trpc/ai.chat";

for (const s of scenarios) {
  console.log(`\n=== ${s.name} (${s.lang}) ===`);
  const res = await fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ json: { messages: s.messages, lang: s.lang } }),
  });
  const data = await res.json();
  if (data.error) {
    console.log("ERROR:", JSON.stringify(data.error.json).slice(0, 300));
    continue;
  }
  const out = data.result.data.json;
  console.log("TEXT:", out.text.slice(0, 400));
  console.log("META:", JSON.stringify(out.meta));
}

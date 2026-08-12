import { describe, expect, it } from "vitest";
import { extractState } from "./routers/rule-chat";

describe("extractState — bilingual parameter detection", () => {
  it("detects a Kazakh phone", () => {
    const s = extractState([{ role: "user", content: "Сәлем! Менің нөмірім +7 701 234 5678" }]);
    expect(s.phone?.replace(/\D/g, "")).toContain("7012345678");
  });

  it("detects an 8-formatted CIS phone", () => {
    const s = extractState([{ role: "user", content: "Позвоните мне: 8 707 111 22 33" }]);
    expect(s.phone?.replace(/\D/g, "")).toContain("7071112233");
  });

  it("extracts name from «Меня зовут» and «Менің атым»", () => {
    const s1 = extractState([{ role: "user", content: "Менің атым Арман" }]);
    expect(s1.name).toBe("Арман");
    const s2 = extractState([{ role: "user", content: "Меня зовут Айгерим" }]);
    expect(s2.name).toBe("Айгерим");
  });

  it("extracts size in meters", () => {
    const s = extractState([{ role: "user", content: "Ас үй 3 метр керек" }]);
    expect(s.sizeMeters).toBe(3);
    const s2 = extractState([{ role: "user", content: "Шкаф 2.5м" }]);
    expect(s2.sizeMeters).toBe(2.5);
  });

  it("extracts budget in tenge variants", () => {
    const s1 = extractState([{ role: "user", content: "Бюджет 500000 тг" }]);
    expect(s1.budgetKzt).toBe(500000);
    const s2 = extractState([{ role: "user", content: "Бюджет 1 млн ₸" }]);
    expect(s2.budgetKzt).toBe(1000000);
    const s3 = extractState([{ role: "user", content: "100 мың теңгеге дейін" }]);
    expect(s3.budgetKzt).toBe(100000);
  });

  it("extracts deadline signals", () => {
    expect(extractState([{ role: "user", content: "Срочно, на этой неделе" }]).deadline).toBe("fast");
    expect(extractState([{ role: "user", content: "Через два месяца" }]).deadline).toBe("far");
    expect(extractState([{ role: "user", content: "В этом году" }]).deadline).toBe("normal");
  });

  it("detects category and style", () => {
    const s = extractState([{ role: "user", content: "Хочу кухню в стиле лофт" }]);
    expect(s.category).toBe("kitchen");
    expect(s.style).toBe("лофт");
    const s2 = extractState([{ role: "user", content: "Шкаф купе раздвижной" }]);
    expect(s2.category).toBe("wardrobe");
    expect(s2.slidingDoors).toBe(true);
  });

  it("accumulates state across multiple messages", () => {
    const msgs = [
      { role: "user" as const, content: "Мен ас үй аламын, 4 метр" },
      { role: "assistant" as const, content: "Рахмет!" },
      { role: "user" as const, content: "Бюджет 800 000 тг, +77059998877" },
    ];
    const s = extractState(msgs);
    expect(s.category).toBe("kitchen");
    expect(s.sizeMeters).toBe(4);
    expect(s.budgetKzt).toBe(800000);
    expect(s.phone).toContain("7059998877");
  });
});

describe("rule engine lead scoring stays consistent with ai.ts", () => {
  // Imported via scoreLead re-export test already covered in ai-engine.test.ts;
  // here we verify the engine path via the pricing formulas directly.
  it("kitchen formula minimum order enforced", async () => {
    const { calculateKitchenPrice } = await import("./routers/ai");
    const r = calculateKitchenPrice([], 1, { delivery: true });
    expect(r.total).toBeGreaterThanOrEqual(300000);
  });

  it("wardrobe formula computes area-based total", async () => {
    const { calculateWardrobePrice } = await import("./routers/ai");
    const r = calculateWardrobePrice([], 2, 2.4, { slidingDoors: true, delivery: true });
    expect(r.total).toBeGreaterThan(0);
    expect(r.breakdown.area).toBeCloseTo(4.8);
  });
});

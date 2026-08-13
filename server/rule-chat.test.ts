import { describe, expect, it } from "vitest";
import { detectIntent, extractState, getGuidedPreferenceStep, getPaymentProductAction, hasSpecificProductRequest, matchesBudget, type RecommendedProduct } from "./routers/rule-chat";

describe("extractState — bilingual parameter detection", () => {
  it("does not collect phone or name fields", () => {
    const s = extractState([{ role: "user", content: "Менің атым Арман, нөмірім +7 701 234 5678, шкаф 2 метр" }]);
    expect(s).not.toHaveProperty("phone");
    expect(s).not.toHaveProperty("name");
    expect(s.sizeMeters).toBe(2);
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

  it("extracts ready-made budget ranges in Kazakh and Russian", () => {
    const kk = extractState([{ role: "user", content: "200 000–500 000 ₸" }]);
    expect(kk.budgetMinKzt).toBe(200000);
    expect(kk.budgetMaxKzt).toBe(500000);
    const ru = extractState([{ role: "user", content: "до 200 000 ₸" }]);
    expect(ru.budgetMaxKzt).toBe(200000);
    expect(detectIntent("Выбрать бюджет")).toBe("budget");
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

  it("extracts a Russian exact wardrobe request with dimensions, colour, and антресоль type", () => {
    const state = extractState([{ role: "user", content: "маған Шкаф антресольный, 180x280x55 см, бежевый керек" }]);
    expect(state.category).toBe("wardrobe");
    expect(state.requestedProductType).toBe("mezzanine");
    expect(state.requestedColor).toBe("beige");
    expect(state.requestedWidthMm).toBe(1800);
    expect(state.requestedHeightMm).toBe(2800);
    expect(state.requestedDepthMm).toBe(550);
    expect(hasSpecificProductRequest(state)).toBe(true);
  });

  it("preserves the newest bilingual color and material choices across the discovery journey", () => {
    const kk = extractState([
      { role: "user", content: "Ас үй керек" },
      { role: "assistant", content: "Түсті таңдаңыз" },
      { role: "user", content: "Беж түс" },
      { role: "assistant", content: "Материалды таңдаңыз" },
      { role: "user", content: "МДФ" },
      { role: "assistant", content: "Бюджетті таңдаңыз" },
      { role: "user", content: "200 000–500 000 ₸" },
    ]);
    expect(kk.category).toBe("kitchen");
    expect(kk.requestedColor).toBe("beige");
    expect(kk.requestedMaterial).toBe("mdf");
    expect(kk.budgetMinKzt).toBe(200000);
    expect(kk.budgetMaxKzt).toBe(500000);
    expect(hasSpecificProductRequest(kk)).toBe(true);

    expect(extractState([{ role: "user", content: "Ақ түс" }]).requestedColor).toBe("white");
    const ru = extractState([{ role: "user", content: "Белый цвет, массив дерева" }]);
    expect(ru.requestedColor).toBe("white");
    expect(ru.requestedMaterial).toBe("wood");
  });

  it("allows an all-colors or all-materials selection to clear an earlier chat filter", () => {
    const state = extractState([
      { role: "user", content: "Беж түс" },
      { role: "user", content: "ЛДСП" },
      { role: "user", content: "Барлық түстер" },
      { role: "user", content: "Барлық материалдар" },
    ]);
    expect(state.requestedColor).toBeUndefined();
    expect(state.requestedMaterial).toBeUndefined();
  });

  it("captures explicit skipped preferences so the guided journey can continue without a forced filter", () => {
    const state = extractState([
      { role: "user", content: "Шкаф" },
      { role: "user", content: "Размер не важен" },
      { role: "user", content: "Все цвета" },
      { role: "user", content: "Все материалы" },
      { role: "user", content: "Бюджет не важен" },
    ]);
    expect(state.sizePreferenceCaptured).toBe(true);
    expect(state.colorPreferenceCaptured).toBe(true);
    expect(state.materialPreferenceCaptured).toBe(true);
    expect(state.budgetPreferenceCaptured).toBe(true);
    expect(getGuidedPreferenceStep(state)).toBeNull();
  });

  it("accumulates state across multiple messages", () => {
    const msgs = [
      { role: "user" as const, content: "Мен ас үй аламын, 4 метр" },
      { role: "assistant" as const, content: "Рахмет!" },
      { role: "user" as const, content: "Бюджет 800 000 тг" },
    ];
    const s = extractState(msgs);
    expect(s.category).toBe("kitchen");
    expect(s.sizeMeters).toBe(4);
    expect(s.budgetKzt).toBe(800000);
    expect(s).not.toHaveProperty("phone");
  });
});

describe("autonomous sales intent routing", () => {
  it("routes manager and complaint requests to self-service support, not handoff", () => {
    expect(detectIntent("Менеджерді шақырыңдар")).toBe("support");
    expect(detectIntent("Хочу поговорить с менеджером")).toBe("support");
    expect(detectIntent("Верните деньги, жалоба")).toBe("support");
  });

  it("recognizes direct Kaspi purchase intent in both languages", () => {
    expect(detectIntent("Kaspi арқылы сатып алу")).toBe("payment");
    expect(detectIntent("Купить на Kaspi")).toBe("payment");
  });

  it("routes bilingual color and material filter entry points", () => {
    expect(detectIntent("Түсті таңдау")).toBe("choose_color");
    expect(detectIntent("Выбрать материал")).toBe("choose_material");
  });

  it("requires category, size, color, material, and budget before recommendations", () => {
    expect(getGuidedPreferenceStep(extractState([]))).toBe("category");
    expect(getGuidedPreferenceStep(extractState([{ role: "user", content: "Ас үй" }]))).toBe("size");
    expect(getGuidedPreferenceStep(extractState([{ role: "user", content: "Ас үй 180×240×55" }]))).toBe("color");
    expect(getGuidedPreferenceStep(extractState([{ role: "user", content: "Ас үй 180×240×55, Ақ түс" }]))).toBe("material");
    expect(getGuidedPreferenceStep(extractState([{ role: "user", content: "Ас үй 180×240×55, Ақ түс, МДФ" }]))).toBe("budget");
  });

  it("keeps every product-selection route inside DERO AI and the storefront", () => {
    const active: RecommendedProduct = {
      id: 30012,
      nameKk: "Шкаф 777",
      nameRu: "Шкаф 777",
      descriptionKk: "Екі есікті шкаф",
      descriptionRu: "Двухдверный шкаф",
      photoUrl: null,
      basePriceKzt: 199999,
      priceUnit: "fixed",
      kaspiUrl: "https://kaspi.kz/shop/p/raspashnoi-shkaf-777-320x240h55-sm-belyi-113369956/",
      kaspiVerified: true,
    };
    expect(getPaymentProductAction(30012, [active])).toBe("select");
    expect(getPaymentProductAction(undefined, [active])).toBe("select");
    expect(getPaymentProductAction(30012, [active, { ...active, id: 30013 }])).toBe("select");
    expect(getPaymentProductAction(30012, [{ ...active, kaspiVerified: false }])).toBe("select");
  });

  it("keeps carousel recommendations inside the selected budget when a price is known", () => {
    expect(matchesBudget(199000, { budgetMaxKzt: 200000 })).toBe(true);
    expect(matchesBudget(500000, { budgetMaxKzt: 200000 })).toBe(false);
    expect(matchesBudget(550000, { budgetMinKzt: 500000, budgetMaxKzt: 1000000 })).toBe(true);
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

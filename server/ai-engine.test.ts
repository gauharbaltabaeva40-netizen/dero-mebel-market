import { describe, expect, it } from "vitest";
import {
  calculateKitchenPrice,
  calculateWardrobePrice,
  needsHumanHandoff,
  scoreLead,
} from "./routers/ai";

/* Rules structure mirrors pricingRules table rows seeded in scripts/seed-db.mjs */
type RuleRow = { ruleKey: string; value: number; productType: "kitchen" | "wardrobe"; description: string | null };

function rules(rows: RuleRow[]): RuleRow[] {
  return rows;
}

const kitchenRules = rules([
  { ruleKey: "base_rate_per_meter", value: 140000, productType: "kitchen", description: null },
  { ruleKey: "install_rate_per_meter", value: 8000, productType: "kitchen", description: null },
  { ruleKey: "delivery_astana", value: 15000, productType: "kitchen", description: null },
  { ruleKey: "minimum_order", value: 300000, productType: "kitchen", description: null },
]);

const wardrobeRules = rules([
  { ruleKey: "base_rate_per_m2", value: 95000, productType: "wardrobe", description: null },
  { ruleKey: "sliding_surcharge_per_m2", value: 12000, productType: "wardrobe", description: null },
  { ruleKey: "install_fixed", value: 20000, productType: "wardrobe", description: null },
  { ruleKey: "delivery_astana", value: 10000, productType: "wardrobe", description: null },
  { ruleKey: "minimum_order", value: 150000, productType: "wardrobe", description: null },
]);

describe("kitchen pricing", () => {
  it("computes 3m kitchen with delivery and respects minimum order", () => {
    const r = calculateKitchenPrice(kitchenRules, 3, { delivery: true });
    // 3m * 140000 = 420000 furniture; install 3m * 8000 = 24000; delivery 15000 => 459000 >= min 300000
    expect(r.total).toBe(459000);
    expect(r.breakdown.furnitureCost).toBe(420000);
    expect(r.breakdown.installCost).toBe(24000);
    expect(r.breakdown.deliveryFee).toBe(15000);
  });

  it("applies minimum order for a tiny kitchen", () => {
    const r = calculateKitchenPrice(kitchenRules, 1.5, { delivery: true });
    // 210000 + 12000 + 15000 = 237000 < minimum 300000 => total 300000
    expect(r.total).toBe(300000);
  });

  it("excludes delivery fee when delivery=false", () => {
    const r = calculateKitchenPrice(kitchenRules, 4, { delivery: false });
    expect(r.breakdown.deliveryFee).toBe(0);
    expect(r.total).toBe(560000 + 32000);
  });
});

describe("wardrobe pricing", () => {
  it("computes 2x2.5m wardrobe with sliding doors", () => {
    const r = calculateWardrobePrice(wardrobeRules, 2, 2.5, { slidingDoors: true, delivery: true });
    // area 5 m2 => 475000 furniture; sliding 5 * 12000 = 60000; install 20000; delivery 10000 => 565000
    expect(r.total).toBe(565000);
    expect(r.breakdown.area).toBe(5);
    expect(r.breakdown.slidingCost).toBe(60000);
    expect(r.breakdown.installFixed).toBe(20000);
  });

  it("computes without sliding doors", () => {
    const r = calculateWardrobePrice(wardrobeRules, 1.6, 2.4, { slidingDoors: false, delivery: true });
    const area = 1.6 * 2.4; // 3.84
    expect(r.total).toBe(Math.round(3.84 * 95000) + 20000 + 10000);
    expect(r.breakdown.slidingCost).toBe(0);
  });
});

describe("lead scoring", () => {
  it("scores hot lead: phone + budget + size + reasonable deadline", () => {
    const s = scoreLead({ phone: "+77001234567", budgetKzt: 3000000, sizeMeters: 6, deadline: "fast" });
    expect(s.score).toBe("hot");
  });

  it("scores size + budget but far deadline as warm", () => {
    const s = scoreLead({ phone: "+77001234567", budgetKzt: 3000000, sizeMeters: 6, deadline: "far" });
    expect(s.score).toBe("warm");
  });

  it("scores warm lead: phone + moderate budget", () => {
    const s = scoreLead({ phone: "+77001234567", budgetKzt: 1200000 });
    expect(s.score).toBe("warm");
  });

  it("scores cold lead: phone but no size/budget", () => {
    const s = scoreLead({ phone: "+77001234567" });
    expect(s.score).toBe("cold");
  });

  it("scores unqualified when nothing is provided", () => {
    const s = scoreLead({});
    expect(s.score).toBe("unqualified");
  });

  it("scores cold when only budget without phone", () => {
    const s = scoreLead({ budgetKzt: 5000000 });
    expect(s.score).toBe("cold");
  });
});

describe("autonomous public chat never hands customers off", () => {
  it("keeps manager and complaint messages in self-service flow", () => {
    expect(needsHumanHandoff("Менеджерді шақырыңдар")).toBe(false);
    expect(needsHumanHandoff("Позовите живого менеджера")).toBe(false);
    expect(needsHumanHandoff("Верните деньги, жалоба")).toBe(false);
    expect(needsHumanHandoff("Кухня неше күнде жасалады?")).toBe(false);
    expect(needsHumanHandoff("Сколько стоит шкаф 2 метра?")).toBe(false);
  });
});

/* ── Regression: chat never returns empty text ─────────────────────────── */

import { afterEach, beforeAll, vi } from "vitest";

describe("ai.chat never returns empty text", () => {
  let chatModule: typeof import("./routers/ai");
  let dbModule: typeof import("./db");
  let llmModule: typeof import("./_core/llm");

  beforeAll(async () => {
    dbModule = await import("./db");
    llmModule = await import("./_core/llm");
    chatModule = await import("./routers/ai");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a visible fallback when the model keeps tool-calling past the cap", async () => {
    // Mock invokeLLM to always return tool_calls (runaway tool loop)
    vi.spyOn(dbModule, "getDb").mockResolvedValue({
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([]),
          }),
        }),
      }),
    } as never);
    vi.spyOn(llmModule, "invokeLLM").mockResolvedValue({
      choices: [
        {
          message: {
            role: "assistant",
            content: "",
            tool_calls: [
              {
                id: "call_1",
                function: { name: "search_faq", arguments: JSON.stringify({ query: "гарантия" }) },
              },
            ],
          },
        },
      ],
    } as never);

    const caller = chatModule.aiRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} },
      res: {},
    } as never);

    const result = await caller.chat({
      messages: [{ role: "user", content: "Какая гарантия на мебель?" }],
      lang: "ru",
    });

    expect(result.text.trim().length).toBeGreaterThan(0);
  });
});

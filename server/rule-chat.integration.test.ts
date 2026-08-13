import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as dbModule from "./db";
import { ruleChat } from "./routers/rule-chat";

const activeProduct = {
  id: 30012,
  nameKk: "Шкаф 777",
  nameRu: "Шкаф 777",
  descriptionKk: "Ақ түсті шкаф",
  descriptionRu: "Белый шкаф",
  photoUrl: null,
  basePriceKzt: 199999,
  priceUnit: "fixed",
  kaspiUrl:
    "https://kaspi.kz/shop/p/raspashnoi-shkaf-777-320x240h55-sm-belyi-113369956",
  kaspiVerified: true,
};

const rankingProducts = [
  {
    ...activeProduct,
    id: 30001,
    nameKk: "Антресольді шкаф 180x280x55 см, беж",
    nameRu: "Шкаф антресольный 180x280x55 см, бежевый",
    widthMm: 1800,
    heightMm: 2800,
    depthMm: 550,
    material: "ЛДСП",
    colors: "бежевый",
  },
  {
    ...activeProduct,
    id: 90274,
    nameKk: "Антресольді шкаф 180x280x55 см, беж",
    nameRu: "Шкаф антресольный 180x280x55 см, бежевый",
    widthMm: 1800,
    heightMm: 2800,
    depthMm: 550,
    material: "ЛДСП",
    colors: "бежевый",
  },
  {
    ...activeProduct,
    id: 90180,
    nameKk: "Ақ түсті МДФ ас үй",
    nameRu: "Белая кухня МДФ",
    descriptionKk: "Ақ фасадты МДФ ас үй",
    descriptionRu: "Кухня с белым фасадом из МДФ",
    material: "МДФ",
    colors: "ақ",
  },
];

const testDb = {
  select: () => ({
    from: () => ({
      where: () => ({
        limit: (limit: number) =>
          Promise.resolve(limit === 1 ? [activeProduct] : rankingProducts),
      }),
    }),
  }),
};

beforeEach(() => {
  vi.spyOn(dbModule, "getDb").mockResolvedValue(testDb as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ruleChat product-context routing", () => {
  it("returns the active product for in-site selection without a direct marketplace action", async () => {
    const result = await ruleChat(
      [{ role: "user", content: "Kaspi арқылы сатып алу" }],
      "kk",
      30012
    );

    expect(result.meta.productAction).toBe("select");
    expect(result.meta.recommendedProducts).toHaveLength(1);
    expect(result.meta.recommendedProducts?.[0]).toMatchObject({
      id: 30012,
      kaspiUrl:
        "https://kaspi.kz/shop/p/raspashnoi-shkaf-777-320x240h55-sm-belyi-113369956",
    });
  });

  it("puts only exact beige 180x280x55 антресоль wardrobes ahead of generic wardrobe cards", async () => {
    const result = await ruleChat(
      [
        {
          role: "user",
          content: "маған Шкаф антресольный, 180x280x55 см, бежевый керек",
        },
        { role: "user", content: "Стиль маңызды емес" },
        { role: "user", content: "Барлық материалдар" },
        { role: "user", content: "Бюджет маңызды емес" },
      ],
      "kk"
    );

    expect(result.meta.productAction).toBe("select");
    expect(result.meta.recommendedProducts?.map(product => product.id)).toEqual(
      expect.arrayContaining([30001, 90274])
    );
    expect(
      result.meta.recommendedProducts?.every(
        product =>
          /180x280/i.test(`${product.nameKk} ${product.nameRu}`) &&
          /беж/i.test(`${product.nameKk} ${product.nameRu}`)
      )
    ).toBe(true);
  });

  it("combines KK color and material quick replies when ranking kitchen recommendations", async () => {
    const result = await ruleChat(
      [
        { role: "user", content: "Ас үй" },
        { role: "assistant", content: "Стильді таңдаңыз" },
        { role: "user", content: "Стиль маңызды емес" },
        { role: "assistant", content: "Өлшемді жазыңыз" },
        { role: "user", content: "Өлшем маңызды емес" },
        { role: "assistant", content: "Түсті таңдаңыз" },
        { role: "user", content: "Ақ түс" },
        { role: "assistant", content: "Материалды таңдаңыз" },
        { role: "user", content: "МДФ" },
        { role: "assistant", content: "Бюджетті таңдаңыз" },
        { role: "user", content: "Бюджет маңызды емес" },
      ],
      "kk"
    );

    const ids =
      result.meta.recommendedProducts?.map(product => product.id) ?? [];
    expect(result.meta.productAction).toBe("select");
    expect(ids).toEqual([90180]);
    expect(result.text).toContain("ақ");
    expect(result.text).toContain("МДФ");
  });
});

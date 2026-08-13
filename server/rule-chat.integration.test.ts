import { describe, expect, it } from "vitest";
import { ruleChat } from "./routers/rule-chat";

describe("ruleChat product-context payment routing", () => {
  it("returns one exact Kaspi product and a buy action for the active product page", async () => {
    const result = await ruleChat(
      [{ role: "user", content: "Kaspi арқылы сатып алу" }],
      "kk",
      30012,
    );

    expect(result.meta.productAction).toBe("buy");
    expect(result.meta.recommendedProducts).toHaveLength(1);
    expect(result.meta.recommendedProducts?.[0]).toMatchObject({
      id: 30012,
      kaspiUrl: "https://kaspi.kz/shop/p/raspashnoi-shkaf-777-320x240h55-sm-belyi-113369956",
    });
  });

  it("puts only exact beige 180x280x55 антресоль wardrobes ahead of generic wardrobe cards", async () => {
    const result = await ruleChat(
      [{ role: "user", content: "маған Шкаф антресольный, 180x280x55 см, бежевый керек" }],
      "kk",
    );

    expect(result.meta.productAction).toBe("select");
    expect(result.meta.recommendedProducts?.map((product) => product.id)).toEqual(expect.arrayContaining([30001, 90274]));
    expect(result.meta.recommendedProducts?.every((product) => /180x280/i.test(`${product.nameKk} ${product.nameRu}`) && /беж/i.test(`${product.nameKk} ${product.nameRu}`))).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { resolveChatProductAction } from "./chatProductActions";

describe("chat product actions", () => {
  const active = {
    id: 30012,
    kaspiUrl: "https://kaspi.kz/shop/p/raspashnoi-shkaf-777-320x240h55-sm-belyi-113369956/",
  };

  it("uses the exact active Kaspi URL only for confirmed payment", () => {
    expect(resolveChatProductAction(active, "buy")).toEqual({
      isPurchase: true,
      href: active.kaspiUrl,
      target: "_blank",
    });
  });

  it("keeps recommendation cards as product-selection links before payment confirmation", () => {
    expect(resolveChatProductAction(active, "select")).toEqual({
      isPurchase: false,
      href: "/products/30012",
      target: undefined,
    });
  });
});

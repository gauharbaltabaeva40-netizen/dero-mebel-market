import { describe, expect, it } from "vitest";
import { isBudgetQuickReply, resolveChatProductAction } from "./chatProductActions";

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

  it("keeps preview-carousel recommendation cards as product-selection links before payment confirmation", () => {
    expect(resolveChatProductAction(active, "select")).toEqual({
      isPurchase: false,
      href: "/products/30012",
      target: undefined,
    });
  });

  it("never creates an external tab action when a recommended preview has no Kaspi URL", () => {
    expect(resolveChatProductAction({ id: 77, kaspiUrl: null }, "buy")).toEqual({
      isPurchase: false,
      href: "/products/77",
      target: undefined,
    });
  });

  it("recognizes every KK/RU budget quick-reply label used by the carousel journey", () => {
    const kkReplies = ["200 000 ₸ дейін", "200 000–500 000 ₸", "500 000–1 000 000 ₸", "1 000 000 ₸+"];
    const ruReplies = ["до 200 000 ₸", "200 000–500 000 ₸", "500 000–1 000 000 ₸", "1 000 000 ₸+"];
    [...kkReplies, ...ruReplies].forEach((reply) => expect(isBudgetQuickReply(reply)).toBe(true));
    expect(isBudgetQuickReply("Каталогты көрсету")).toBe(false);
  });
});

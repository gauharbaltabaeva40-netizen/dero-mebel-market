import { describe, expect, it } from "vitest";
import { isBudgetQuickReply, isColorQuickReply, isMaterialQuickReply, resolveChatProductAction } from "./chatProductActions";

describe("chat product actions", () => {
  const active = {
    id: 30012,
    kaspiUrl: "https://kaspi.kz/shop/p/raspashnoi-shkaf-777-320x240h55-sm-belyi-113369956/",
    kaspiVerified: true,
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

  it("keeps an unverified Kaspi URL inside the storefront instead of opening an error page", () => {
    expect(resolveChatProductAction({ id: 90180, kaspiUrl: "https://kaspi.kz/shop/errorpage", kaspiVerified: false }, "buy")).toEqual({
      isPurchase: false,
      href: "/products/90180",
      target: undefined,
    });
  });

  it("recognizes every KK/RU budget quick-reply label used by the carousel journey", () => {
    const kkReplies = ["200 000 ₸ дейін", "200 000–500 000 ₸", "500 000–1 000 000 ₸", "1 000 000 ₸+"];
    const ruReplies = ["до 200 000 ₸", "200 000–500 000 ₸", "500 000–1 000 000 ₸", "1 000 000 ₸+"];
    [...kkReplies, ...ruReplies].forEach((reply) => expect(isBudgetQuickReply(reply)).toBe(true));
    expect(isBudgetQuickReply("Каталогты көрсету")).toBe(false);
  });

  it("recognizes every KK/RU color and material quick-reply label used by the filter journey", () => {
    ["Ақ түс", "Беж түс", "Сұр түс", "Қоңыр/Венге", "Барлық түстер", "Белый цвет", "Бежевый цвет", "Серый цвет", "Коричневый/Венге", "Все цвета"].forEach((reply) => expect(isColorQuickReply(reply)).toBe(true));
    ["ЛДСП", "МДФ", "Массив ағаш", "Барлық материалдар", "Массив дерева", "Все материалы"].forEach((reply) => expect(isMaterialQuickReply(reply)).toBe(true));
    expect(isColorQuickReply("МДФ")).toBe(false);
    expect(isMaterialQuickReply("Каталогты көрсету")).toBe(false);
  });
});

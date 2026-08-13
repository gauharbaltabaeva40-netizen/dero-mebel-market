export type ChatProductAction = "buy" | "select" | undefined;

const BUDGET_QUICK_REPLIES = {
  kk: ["200 000 ₸ дейін", "200 000–500 000 ₸", "500 000–1 000 000 ₸", "1 000 000 ₸+"],
  ru: ["до 200 000 ₸", "200 000–500 000 ₸", "500 000–1 000 000 ₸", "1 000 000 ₸+"],
} as const;

const BUDGET_QUICK_REPLY_LABELS = new Set<string>(Object.values(BUDGET_QUICK_REPLIES).flat());

const COLOR_QUICK_REPLIES = {
  kk: ["Ақ түс", "Беж түс", "Сұр түс", "Қоңыр/Венге", "Барлық түстер"],
  ru: ["Белый цвет", "Бежевый цвет", "Серый цвет", "Коричневый/Венге", "Все цвета"],
} as const;

const MATERIAL_QUICK_REPLIES = {
  kk: ["ЛДСП", "МДФ", "Массив ағаш", "Барлық материалдар"],
  ru: ["ЛДСП", "МДФ", "Массив дерева", "Все материалы"],
} as const;

const COLOR_QUICK_REPLY_LABELS = new Set<string>(Object.values(COLOR_QUICK_REPLIES).flat());
const MATERIAL_QUICK_REPLY_LABELS = new Set<string>(Object.values(MATERIAL_QUICK_REPLIES).flat());

export type ChatProductLink = {
  id: number;
  kaspiUrl?: string | null;
};

export function resolveChatProductAction(product: ChatProductLink, action: ChatProductAction) {
  const isPurchase = action !== "select" && Boolean(product.kaspiUrl);
  return {
    isPurchase,
    href: isPurchase ? product.kaspiUrl! : `/products/${product.id}`,
    target: isPurchase ? "_blank" : undefined,
  };
}

export function isBudgetQuickReply(reply: string): boolean {
  return BUDGET_QUICK_REPLY_LABELS.has(reply);
}

export function isColorQuickReply(reply: string): boolean {
  return COLOR_QUICK_REPLY_LABELS.has(reply);
}

export function isMaterialQuickReply(reply: string): boolean {
  return MATERIAL_QUICK_REPLY_LABELS.has(reply);
}

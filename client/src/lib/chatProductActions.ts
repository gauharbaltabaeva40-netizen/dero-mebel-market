export type ChatProductAction = "buy" | "select" | undefined;

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

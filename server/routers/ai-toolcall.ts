import { and, eq, like, or } from "drizzle-orm";
import { faqs, pricingRules, products } from "../../drizzle/schema";
import { calculateKitchenPrice, calculateWardrobePrice, scoreLead, type LeadScore } from "./ai";
import { createLeadRow, notifyManagerRow } from "../db";
import type { ToolContext } from "./ai-tools";

interface ToolResult {
  content: string;
  meta: Record<string, unknown>;
}

/** Execute a named tool with parsed JSON arguments. */
export async function handleToolCall(
  ctx: ToolContext,
  toolName: string,
  args: Record<string, unknown>,
): Promise<ToolResult> {
  const t = ctx.lang;

  /* ── search_products ─────────────────────────────── */
  if (toolName === "search_products") {
    const q = args.query as string | undefined;
    const cat = (args.category === "kitchen" || args.category === "wardrobe" ? args.category : undefined) as
      | "kitchen"
      | "wardrobe"
      | undefined;
    const conditions = [eq(products.isPublished, true)];
    if (cat) conditions.push(eq(products.category, cat));
    if (q) {
      const likeQ = `%${q}%`;
      conditions.push(
        or(
          like(products.nameKk, likeQ),
          like(products.nameRu, likeQ),
          like(products.material, likeQ),
          like(products.facade, likeQ),
        )!,
      );
    }
    const rows = await ctx.db.select().from(products).where(and(...conditions)).limit(8);
    if (rows.length === 0) {
      return {
        content: "Ничего не найдено по запросу: " + (q ?? cat ?? "каталог"),
        meta: {},
      };
    }
    const lines = rows.map(
      (p) =>
        `#${p.id} | ${t === "kk" ? p.nameKk : p.nameRu} | ${p.category} | стиль: ${p.style} | ${p.material}${p.facade ? `, фасад: ${p.facade}` : ""} | цвета: ${(p.colors as string[])?.join(", ")} | от ${p.basePriceKzt}₸ за ${p.priceUnit === "per_meter" ? "погонный метр" : "м²"} | габариты (мм): ${p.widthMm}×${p.heightMm}×${p.depthMm}`,
    );
    return { content: lines.join("\n"), meta: {} };
  }

  /* ── search_faq ───────────────────────────────────── */
  if (toolName === "search_faq") {
    const q = String(args.query ?? "");
    const likeQ = `%${q}%`;
    const rows = await ctx.db
      .select()
      .from(faqs)
      .where(
        and(
          eq(faqs.isActive, true),
          or(like(faqs.questionKk, likeQ), like(faqs.questionRu, likeQ), like(faqs.keywords, likeQ))!,
        ),
      )
      .limit(4);
    if (rows.length === 0) {
      return {
        content:
          "В базе знаний нет точного ответа на этот вопрос. Честно скажите клиенту: «уточню у менеджера».",
        meta: {},
      };
    }
    const lines = rows.map(
      (f) =>
        `Вопрос: ${t === "kk" ? f.questionKk : f.questionRu}\nОтвет: ${t === "kk" ? f.answerKk : f.answerRu}`,
    );
    return { content: lines.join("\n\n"), meta: {} };
  }

  /* ── calculate_price ──────────────────────────────── */
  if (toolName === "calculate_price") {
    const productType = args.productType as "kitchen" | "wardrobe";
    const rules = await ctx.db
      .select()
      .from(pricingRules)
      .where(eq(pricingRules.productType, productType));
    if (productType === "kitchen") {
      if (!args.lengthMeters) {
        return {
          content: "ERROR: для кухни нужен параметр lengthMeters (погонные метры). Не вычисляйте цену без него.",
          meta: {},
        };
      }
      const r = calculateKitchenPrice(rules, Number(args.lengthMeters), {
        delivery: (args.delivery as boolean) ?? true,
      });
      return {
        content: `Смета (кухня, ${args.lengthMeters} м): мебель ${r.breakdown.furnitureCost.toLocaleString()}₸ + монтаж ${r.breakdown.installCost.toLocaleString()}₸ + доставка ${r.breakdown.deliveryFee.toLocaleString()}₸. ИТОГО (ориентировочно): ${r.total.toLocaleString()}₸. Точная цена — после бесплатного замера.`,
        meta: { estimatedTotalKzt: r.total },
      };
    }
    if (!args.widthMeters || !args.heightMeters) {
      return {
        content: "ERROR: для шкафа нужны widthMeters и heightMeters. Спросите ширину и высоту у клиента перед расчётом.",
        meta: {},
      };
    }
    const r = calculateWardrobePrice(rules, Number(args.widthMeters), Number(args.heightMeters), {
      slidingDoors: (args.slidingDoors as boolean) ?? true,
      delivery: (args.delivery as boolean) ?? true,
    });
    return {
      content: `Смета (шкаф, ${args.widthMeters}×${args.heightMeters} м, площадь ${r.breakdown.area} м²): мебель ${r.breakdown.furnitureCost.toLocaleString()}₸${r.breakdown.slidingCost ? ` + раздвижные двери ${r.breakdown.slidingCost.toLocaleString()}₸` : ""} + монтаж ${r.breakdown.installFixed.toLocaleString()}₸ + доставка ${r.breakdown.deliveryFee.toLocaleString()}₸. ИТОГО (ориентировочно): ${r.total.toLocaleString()}₸. Точная цена — после бесплатного замера.`,
      meta: { estimatedTotalKzt: r.total },
    };
  }

  /* ── create_lead ──────────────────────────────────── */
  if (toolName === "create_lead") {
    // Accept either budgetKzt or estimatedTotalKzt (LLM may use either name).
    const budget = (args.budgetKzt as number | undefined) ?? (args.estimatedTotalKzt as number | undefined);
    const scoring = scoreLead({
      sizeMeters: args.sizeMeters as number | undefined,
      budgetKzt: budget,
      phone: args.phone as string,
    });
    const id = await createLeadRow({
      name: (args.name as string) ?? null,
      phone: (args.phone as string) ?? null,
      product: (args.product as "kitchen" | "wardrobe" | "unknown") ?? "unknown",
      sizeMeters: (args.sizeMeters as number) ?? null,
      style: (args.style as string) ?? null,
      material: (args.material as string) ?? null,
      budgetKzt: budget ?? null,
      deadline: (args.deadline as string) ?? null,
      location: (args.location as string) ?? null,
      estimatedTotalKzt: budget ?? null,
      notes: (args.notes as string) ?? null,
      score: scoring.score,
      scoreReason: scoring.reason,
    });
    return {
      content: `Лид сохранён, id=${id}, приоритет: ${scoring.score}. ${scoring.reason}`,
      meta: { leadCreated: true, leadId: id, score: scoring.score as LeadScore, scoreReason: scoring.reason },
    };
  }

  /* ── notify_manager ───────────────────────────────── */
  if (toolName === "notify_manager") {
    const id = await notifyManagerRow({
      leadId: args.leadId as number | undefined,
      name: args.name as string | undefined,
      phone: args.phone as string | undefined,
      reason: String(args.reason ?? "Эскалация от AI-ассистента"),
    });
    return {
      content: `Менеджер уведомлён (запись id=${id}). Сообщите клиенту, что менеджер свяжется.`,
      meta: { handoff: true, notifyId: id },
    };
  }

  return { content: "ERROR: неизвестный инструмент " + toolName, meta: {} };
}

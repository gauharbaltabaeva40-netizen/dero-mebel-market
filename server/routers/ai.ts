import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, like, or } from "drizzle-orm";
import { publicProcedure, router } from "../_core/trpc";
import { faqs, leads, pricingRules, products } from "../../drizzle/schema";
import { createLeadRow, getDb, notifyManagerRow } from "../db";
import { invokeLLM } from "../_core/llm";
import { SYSTEM_PROMPT, buildToolDefs, buildProductContext, type ToolContext } from "./ai-tools";
import { handleToolCall } from "./ai-toolcall";
import { ruleChat } from "./rule-chat";

/* ─────────────────────────────── PRICING ENGINE ─────────────────────────── */

type RuleMap = { ruleKey: string; value: number; productType: "kitchen" | "wardrobe"; description: string | null };

function rule(rules: RuleMap[], productType: string, key: string): number | null {
  const r = rules.find((x) => x.productType === productType && x.ruleKey === key);
  return r ? r.value : null;
}

/**
 * Kitchen:   total = length_m * base_rate + length_m * install_rate + delivery (+ addons)
 * Wardrobe:  total = area_m2 * base_rate + (sliding ? area_m2 * surcharge : 0) + install_fixed + delivery
 * The LLM must NEVER compute prices — it calls this procedure only.
 */
export function calculateKitchenPrice(
  rules: RuleMap[],
  lengthM: number,
  opts: { delivery: boolean; ledMeters?: number },
): { breakdown: Record<string, number>; total: number } {
  const baseRate = rule(rules, "kitchen", "base_rate_per_meter") ?? 140000;
  const installRate = rule(rules, "kitchen", "install_rate_per_meter") ?? 8000;
  const deliveryFee = opts.delivery ? (rule(rules, "kitchen", "delivery_astana") ?? 15000) : 0;
  const led = (opts.ledMeters ?? 0) * (rule(rules, "kitchen", "addon_led_per_meter") ?? 4000);
  const furnitureCost = lengthM * baseRate;
  const installCost = lengthM * installRate;
  const subtotal = furnitureCost + installCost + deliveryFee + led;
  const minimum = rule(rules, "kitchen", "minimum_order") ?? 300000;
  const total = Math.max(subtotal, minimum);
  return { breakdown: { furnitureCost, installCost, deliveryFee, led, minimum }, total: Math.round(total) };
}

export function calculateWardrobePrice(
  rules: RuleMap[],
  widthM: number,
  heightM: number,
  opts: { slidingDoors: boolean; delivery: boolean },
): { breakdown: Record<string, number>; total: number } {
  const baseRate = rule(rules, "wardrobe", "base_rate_per_m2") ?? 95000;
  const surcharge = rule(rules, "wardrobe", "sliding_surcharge_per_m2") ?? 12000;
  const installFixed = rule(rules, "wardrobe", "install_fixed") ?? 20000;
  const deliveryFee = opts.delivery ? (rule(rules, "wardrobe", "delivery_astana") ?? 10000) : 0;
  const area = widthM * heightM;
  const furnitureCost = area * baseRate;
  const slidingCost = opts.slidingDoors ? area * surcharge : 0;
  const subtotal = furnitureCost + slidingCost + installFixed + deliveryFee;
  const minimum = rule(rules, "wardrobe", "minimum_order") ?? 150000;
  const total = Math.max(subtotal, minimum);
  return {
    breakdown: { area: Math.round(area * 100) / 100, furnitureCost, slidingCost, installFixed, deliveryFee, minimum },
    total: Math.round(total),
  };
}

/* ─────────────────────────────── LEAD SCORING ───────────────────────────── */

export type LeadScore = "hot" | "warm" | "cold" | "unqualified";

export interface LeadInput {
  sizeMeters?: number;
  budgetKzt?: number;
  deadline?: "fast" | "normal" | "far";
  phone?: string;
}

/**
 * Hot: phone + budget + reasonable deadline.
 * Warm: phone + (size OR budget).
 * Cold: phone only.
 * Unqualified: nothing useful.
 */
export function scoreLead(input: LeadInput): { score: LeadScore; reason: string } {
  const { sizeMeters, budgetKzt, deadline, phone } = input;
  const hasPhone = Boolean(phone && phone.replace(/\D/g, "").length >= 10);
  const hasSize = sizeMeters != null && sizeMeters > 0;
  const hasBudget = budgetKzt != null && budgetKzt >= 50000;

  if (!hasPhone && !hasSize && !hasBudget) {
    return { score: "unqualified", reason: "Контакт немесе параметрлер жоқ / Нет контакта или параметров" };
  }
  if (!hasPhone) {
    return { score: "cold", reason: "Телефон нөмірі жоқ / Без телефона" };
  }
  if (hasSize && hasBudget) {
    const fast = deadline === "fast" || deadline === "normal";
    return {
      score: fast ? "hot" : "warm",
      reason: fast
        ? `Өлшем ${sizeMeters} м + бюджет ${budgetKzt} ₸ + жақын мерзім / Размер + бюджет + близкий срок`
        : `Өлшем ${sizeMeters} м + бюджет ${budgetKzt} ₸, мерзім алыс / Размер + бюджет, срок далёкий`,
    };
  }
  if (hasSize || hasBudget) {
    return { score: "warm", reason: hasSize ? `Өлшем белгілі: ${sizeMeters} м / Известен размер` : `Бюджет белгілі: ${budgetKzt} ₸ / Известен бюджет` };
  }
  return { score: "cold", reason: "Тек телефон ғана / Только телефон" };
}

/* ─────────────────────────────── ESCALATION DETECTION ───────────────────── */

const COMPLAINT_PATTERNS = [
  /жалған/i, /обман|мошенн|мошенник/i, /шағым|шағымдан/i, /жалоба|недоволен|разочарован/i,
  /төлемді қайтар|верните деньги|вернуть деньги/i, /сот|прокуратур|судить/i,
  /менеджерді шақыр|менеджермен сөйлес|позовите менеджер|позови менеджер|к менеджеру|менеджер|оператор|живой|человек/i,
];

/** True if the message indicates a complaint or explicit request for a human manager. */
export function needsHumanHandoff(message: string): boolean {
  return COMPLAINT_PATTERNS.some((re) => re.test(message));
}

/* ─────────────────────────────── tRPC ROUTER ────────────────────────────── */

export const aiRouter = router({
  /** Tool: search_products — search catalog by text/category/style. */
  searchProducts: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        category: z.enum(["kitchen", "wardrobe"]).optional(),
        style: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const conditions = [eq(products.isPublished, true)];
      if (input.category) conditions.push(eq(products.category, input.category));
      if (input.style) conditions.push(eq(products.style, input.style as never));
      if (input.query) {
        const q = `%${input.query}%`;
        conditions.push(
          or(
            like(products.nameKk, q),
            like(products.nameRu, q),
            like(products.material, q),
            like(products.facade, q),
          )!,
        );
      }
      const rows = await db.select().from(products).where(and(...conditions)).limit(10);
      return rows.map((p) => ({
        id: p.id,
        category: p.category,
        nameKk: p.nameKk,
        nameRu: p.nameRu,
        style: p.style,
        material: p.material,
        facade: p.facade,
        colors: p.colors as string[],
        basePriceKzt: p.basePriceKzt,
        priceUnit: p.priceUnit,
        dimensions: { widthMm: p.widthMm, heightMm: p.heightMm, depthMm: p.depthMm },
        leadTimeDays: p.leadTimeDays,
      }));
    }),

  /** Tool: search_faq — keyword search over verified FAQ base. */
  searchFaq: publicProcedure
    .input(z.object({ query: z.string().min(2).max(200) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const q = `%${input.query}%`;
      const rows = await db
        .select()
        .from(faqs)
        .where(
          and(
            eq(faqs.isActive, true),
            or(like(faqs.questionKk, q), like(faqs.questionRu, q), like(faqs.keywords, q))!,
          ),
        )
        .limit(5);
      return rows;
    }),

  /** Tool: calculate_price — authoritative backend price estimate. LLM must not guess. */
  calculatePrice: publicProcedure
    .input(
      z.object({
        productType: z.enum(["kitchen", "wardrobe"]),
        lengthMeters: z.number().positive().optional(),
        widthMeters: z.number().positive().optional(),
        heightMeters: z.number().positive().optional(),
        slidingDoors: z.boolean().optional(),
        delivery: z.boolean().optional(),
        ledMeters: z.number().nonnegative().optional(),
      }),
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const rules: RuleMap[] = await db
        .select()
        .from(pricingRules)
        .where(eq(pricingRules.productType, input.productType));
      if (input.productType === "kitchen") {
        if (!input.lengthMeters) return { error: "Кухня үшін ұзындығы (метр) керек / Для кухни нужна длина в метрах" } as const;
        const r = calculateKitchenPrice(rules, input.lengthMeters, {
          delivery: input.delivery ?? true,
          ledMeters: input.ledMeters,
        });
        return { productType: "kitchen" as const, ...r };
      }
      if (!input.widthMeters || !input.heightMeters) {
        return { error: "Шкаф үшін ені мен биіктігі (метр) керек / Для шкафа нужны ширина и высота в метрах" } as const;
      }
      const r = calculateWardrobePrice(rules, input.widthMeters, input.heightMeters, {
        slidingDoors: input.slidingDoors ?? true,
        delivery: input.delivery ?? true,
      });
      return { productType: "wardrobe" as const, ...r };
    }),

  /** Tool: create_lead — save qualified lead with score. */
  createLead: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        product: z.enum(["kitchen", "wardrobe", "unknown"]),
        sizeMeters: z.number().positive().optional(),
        style: z.string().optional(),
        material: z.string().optional(),
        budgetKzt: z.number().positive().optional(),
        deadline: z.string().optional(),
        location: z.string().optional(),
        estimatedTotalKzt: z.number().positive().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const scoring = scoreLead({
        sizeMeters: input.sizeMeters,
        budgetKzt: input.budgetKzt,
        phone: input.phone,
      });
      const id = await createLeadRow({
        ...input,
        deadline: input.deadline,
        score: scoring.score,
        scoreReason: scoring.reason,
      });
      return { id, score: scoring.score, scoreReason: scoring.reason };
    }),

  /** Tool: notify_manager — escalation, human handoff requested. */
  notifyManager: publicProcedure
    .input(
      z.object({
        leadId: z.number().optional(),
        name: z.string().optional(),
        phone: z.string().optional(),
        reason: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const id = await notifyManagerRow({
        leadId: input.leadId,
        name: input.name,
        phone: input.phone,
        reason: input.reason,
      });
      return { id, notified: true };
    }),

  /** LLM-powered assistant turn with real tool calling. */
  chat: publicProcedure
    .input(
      z.object({
        messages: z.array(z.object({ role: z.enum(["user", "assistant", "system"]), content: z.string() })),
        lang: z.enum(["kk", "ru"]),
        productId: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // USE_LLM=1 → real LLM (Gemini etc. via API). USE_LLM=0 → hand-built
      // rule engine: zero external API calls, zero cost.
      const useLLM = process.env.USE_LLM === "1";
      if (!useLLM) {
        const r = await ruleChat(input.messages, input.lang, input.productId);
        // Lead form is triggered by the client on meta.askContact; scoring and
        // handoff are surfaced the same way as the LLM path.
        return { text: r.text, meta: r.meta } as const;
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const ctx: ToolContext = {
        lang: input.lang,
        productId: input.productId,
        db,
      };

      const productCtx = await buildProductContext(ctx);

      const sys: import("../_core/llm").Message[] = [
        { role: "system", content: SYSTEM_PROMPT(input.lang) + (productCtx ? `\n\n[ТЕКУЩИЙ ПРОСМОТР / ҚАЗІРГІ ӨНІМ]\n${productCtx}` : "") },
      ];

      const history: import("../_core/llm").Message[] = input.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const tools = buildToolDefs();
      const conversation: import("../_core/llm").Message[] = [...sys, ...history];

      // Canned terminal texts so the client always receives a visible message
      // even when the model exhausts the tool-calling loop.
      const canned = {
        handoff: {
          kk: "Сіздің өтінішіңіз менеджерге берілді — ол жақын арада сізбен байланысады. Келтірген қолайсыздығыңызға кешірім сұраймын.",
          ru: "Я передал ваш запрос менеджеру — он свяжется с вами в ближайшее время. Приношу извинения за доставленные неудобства.",
        },
        leadCreated: {
          kk: "Заявкаңыз қабылданды! Менеджер жақын арада сізбен хабарласады.",
          ru: "Заявка принята! Менеджер свяжется с вами в ближайшее время.",
        },
        fallback: {
          kk: "Кешіріңіз, жауапты толық дайындай алмадым. Сұрағыңызды қайта қойыңыз немесе заявка қалдырыңыз.",
          ru: "Извините, не смог подготовить полный ответ. Попробуйте задать вопрос ещё раз или оставьте заявку.",
        },
      };

      // Tool-calling loop: max 4 iterations to prevent runaway calls
      let meta: Record<string, unknown> = {};
      for (let iter = 0; iter < 4; iter++) {
        const res = await invokeLLM({
          messages: conversation,
          tools,
          tool_choice: "auto",
        });
        const choice = res.choices?.[0];
        const message = choice?.message;
        if (!message) break;

        const toolCalls = message.tool_calls ?? [];
        if (toolCalls.length === 0) {
          // Final text response
          const text = (typeof message.content === "string" ? message.content : "") || "";
          if (text.trim()) return { text, meta };
          break;
        }

        // Record the assistant message exactly as the model returned it (content may be
        // empty when tool_calls are present — keep a placeholder space so content stays valid).
        conversation.push({
          role: message.role as import("../_core/llm").Message["role"],
          content: (typeof message.content === "string" && message.content) || " ",
          tool_calls: message.tool_calls,
        } as unknown as import("../_core/llm").Message);

        let executedTerminal = false;
        for (const tc of toolCalls) {
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(typeof tc.function.arguments === "string" ? tc.function.arguments : "{}");
          } catch {
            args = {};
          }
          const toolResult = await handleToolCall(ctx, tc.function.name, args);
          meta = { ...meta, ...toolResult.meta };
          // Feed the result back as a proper tool message tied to the call id —
          // this is the format the LLM expects, otherwise it may keep tool-calling.
          conversation.push({
            role: "tool",
            name: tc.function.name,
            tool_call_id: tc.id,
            content: toolResult.content,
          } as unknown as import("../_core/llm").Message);
          if (tc.function.name === "notify_manager" || tc.function.name === "create_lead") {
            executedTerminal = true;
          }
        }

        // After a terminal action the LLM sometimes emits more tool calls in the
        // next turn; short-circuit to guarantee a deterministic visible response.
        if (executedTerminal) break;
      }

      // Guarantee a non-empty visible response using meta cues, never empty text.
      if (meta.handoff) return { text: canned.handoff[input.lang], meta };
      if (meta.leadCreated) return { text: canned.leadCreated[input.lang], meta };
      return { text: canned.fallback[input.lang], meta };
    }),

  /** Latest leads (for owner review). */
  leadList: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(50);
  }),
});

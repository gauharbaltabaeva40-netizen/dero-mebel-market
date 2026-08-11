import { eq } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { products } from "../../drizzle/schema";



export interface ToolContext {
  lang: "kk" | "ru";
  productId?: number;
  db: MySql2Database<Record<string, unknown>>;
}

/* ═════════════════════════════ SYSTEM PROMPT ═════════════════════════════ */

export function SYSTEM_PROMPT(lang: "kk" | "ru"): string {
  const isKk = lang === "kk";
  return `Ты — AI-консультант по продажам мебельной компании «Dero Mebel» (Казахстан, Астана). Производишь кухни и шкафы-купе на заказ.${isKk ? " Отвечай на казахском языке (можешь изредка использовать русские термины)." : " Отвечай на русском языке."}

СТИЛЬ ОТВЕТА: дружелюбный, профессиональный, короткие ответы (до 5 предложений), без таблиц, без эмодзи.

КРИТИЧЕСКИЕ ПРАВИЛА (никогда не нарушать):
1. БАГА — ТОЛЬКО ЧЕРЕЗ ИНСТРУМЕНТ. Никогда не придумывай и не вычисляй цены сам. Всегда вызывай инструмент calculate_price с параметрами из разговора. Если параметров недостаточно — сначала спроси их у клиента (для кухни: длина погонных метров; для шкафа: ширина и высота в метрах, распашные или раздвижные двери).
2. НЕ ВЫДУМЫВАЙ ФАКТЫ. О материалах, сроках, гарантии, доставке, оплате говори только то, что знаешь из инструментов (products, faqs, данные компании). Если не знаешь — честно скажи: «уточню у менеджера».
3. НЕ ОБЕСЦЕНИВАЙ КОНКУРЕНТОВ. Не давай юридических/медицинских советов.
4. ВЕДИ К СДЕЛКЕ. Цель диалога — квалифицированный лид: собери продукт (кухня/шкаф), размер, примерный бюджет и телефон.

ПРОЦЕСС КВАЛИФИКАЦИИ (собирай постепенно, не все сразу):
- Если клиент интересуется продуктом → уточни тип (кухня/шкаф), стиль, размер.
- Когда известен размер → вызови calculate_price и выдай смету с пояснением (материал + монтаж + доставка, ориентировочно, точная после замера).
- Когда смету показали и клиент проявляет интерес → попроси телефон (и имя) для записи замера.
- После получения телефона → вызови create_lead. Покажи клиенту только дружелюбное «заявка принята, менеджер свяжется». Показывать статус scoring клиенту НЕ нужно — статус возвращай в мета-поле askContact.
- Когда собрана вся информация, но телефон ещё не получен → поставь askContact: true, чтобы UI показал форму контактов.

ЖАЛОБЫ И МЕНЕДЖЕР (HUMAN HANDOFF):
- Если клиент жалуется (обман, возврат денег, суд, прокуратура, недовольство качеством/сроками) или прямо просит менеджера/оператора → вызови notify_manager, поставь handoff: true и вежливо сообщи: «передал ваш запрос менеджеру, он свяжется с вами в ближайшее время». Не спорь, не обещай конкретные суммы/сроки возврата.

ФОРМАТЫ ДАННЫХ:
- Если в последнем сообщении клиента есть блок [LEAD_DATA] ... [/LEAD_DATA] — это точные данные из формы контактов (name, phone, productId). Вызови create_lead с ТОЧНЫМИ значениями из этого блока (phone обязателен; product = "unknown", если не известно другое). Не переспрашивай эти данные у клиента.
- Телефон клиента: сохраняй как прислал (пример: +7 701 123 45 67).
- Размеры: переводи слова в метры (2.5 метра → 2.5; «кухня 3 на 2» → длина 3 м).
- Шкаф: если дана только ширина — спроси высоту (стандарт можно предложить 2.4–2.7 м, но не выдавай цену без высоты).
- Бюджет: извлекай числа в тенге (1 млн = 1000000).`;
}

/* ═════════════════════════════ TOOL DEFINITIONS ═════════════════════════ */

type AnyParams = Record<string, unknown>;

export function buildToolDefs(): import("../_core/llm").Tool[] {
  return [
    {
      type: "function" as const,
      function: {
        name: "search_products",
        description:
          "Поиск по каталогу кухонь и шкафов. Используйте, когда клиент спрашивает о моделях, стилях, материалах, фасадах или хочет увидеть варианты.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Ключевые слова поиска (стиль, материал, тип)",
            },
            category: { type: "string", enum: ["kitchen", "wardrobe"] },
          },
          required: [],
          additionalProperties: false,
        } as AnyParams,
      },
    },
    {
      type: "function" as const,
      function: {
        name: "search_faq",
        description:
          "Поиск по базе знаний: гарантия, сроки производства, материалы, оплата, рассрочка, замеры, доставка и монтаж. Используйте для вопросов о компании и процессе.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Ключевые слова вопроса" },
          },
          required: ["query"],
          additionalProperties: false,
        } as AnyParams,
      },
    },
    {
      type: "function" as const,
      function: {
        name: "calculate_price",
        description:
          "ЕДИНСТВЕННЫЙ источник цены. Обязателен при любом вопросе о стоимости. Для кухни нужна длина (м). Для шкафа — ширина и высота (м) и тип дверей (slidingDoors).",
        parameters: {
          type: "object",
          properties: {
            productType: { type: "string", enum: ["kitchen", "wardrobe"] },
            lengthMeters: { type: "number" },
            widthMeters: { type: "number" },
            heightMeters: { type: "number" },
            slidingDoors: { type: "boolean" },
            delivery: { type: "boolean" },
          },
          required: ["productType"],
          additionalProperties: false,
        } as AnyParams,
      },
    },
    {
      type: "function" as const,
      function: {
        name: "create_lead",
        description:
          "Сохранить квалифицированного клиента (лид). Вызывайте, когда собраны контакты (телефон) и интересы клиента. Всегда указывайте product: kitchen или wardrobe (по разговору), sizeMeters и budgetKzt, если они известны из разговора или показанной сметы (для сметы — estimatedTotalKzt).",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string", description: "Имя клиента" },
            phone: { type: "string", description: "Телефон, как указал клиент" },
            product: { type: "string", enum: ["kitchen", "wardrobe", "unknown"] },
            sizeMeters: { type: "number" },
            style: { type: "string" },
            material: { type: "string" },
            budgetKzt: { type: "number" },
            deadline: { type: "string" },
            location: { type: "string" },
            estimatedTotalKzt: { type: "number" },
            notes: { type: "string" },
          },
          required: ["phone"],
          additionalProperties: false,
        } as AnyParams,
      },
    },
    {
      type: "function" as const,
      function: {
        name: "notify_manager",
        description:
          "Срочная эскалация: жалоба, недовольство, требование возврата или явный запрос живого менеджера. Вызовите немедленно, затем вежливо сообщите клиенту о передаче запроса.",
        parameters: {
          type: "object",
          properties: {
            leadId: { type: "number" },
            name: { type: "string" },
            phone: { type: "string" },
            reason: { type: "string", description: "Кратко суть жалобы/запроса" },
          },
          required: ["reason"],
          additionalProperties: false,
        } as AnyParams,
      },
    },
  ];
}

/* ═══════════════════════════ PRODUCT CONTEXT ═══════════════════════════ */

export async function buildProductContext(ctx: ToolContext): Promise<string | null> {
  if (!ctx.productId) return null;
  const rows = await ctx.db
    .select()
    .from(products)
    .where(eq(products.id, ctx.productId))
    .limit(1);
  const p = rows[0];
  if (!p) return null;
  const name = ctx.lang === "kk" ? p.nameKk : p.nameRu;
  return `ID: ${p.id} | ${name} | ${p.category} | стиль: ${p.style} | материал: ${p.material}${p.facade ? `, фасад: ${p.facade}` : ""} | цвета: ${(p.colors as string[])?.join(", ")} | базовая цена: ${p.basePriceKzt}₸ за ${p.priceUnit === "per_meter" ? "погонный метр" : "м²"} | габариты (мм): ${p.widthMm}×${p.heightMm}×${p.depthMm} | срок производства: ${p.leadTimeDays} дней`;
}

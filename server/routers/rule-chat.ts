import { and, eq } from "drizzle-orm";
import { faqs, leads, pricingRules, products } from "../../drizzle/schema";
import { createLeadRow, getDb, notifyManagerRow } from "../db";
import { calculateKitchenPrice, calculateWardrobePrice, scoreLead } from "./ai";

/* ─────────────────────────── PUBLIC CHAT CONTRACT ───────────────────────── */

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export interface ChatResult {
  text: string;
  meta: Record<string, unknown>;
}

/* ─────────────────────────── PARAMETER EXTRACTION ──────────────────────── */

/** Extracts collected conversation state from the whole message history (stateless dialog). */
export function extractState(messages: ChatMessage[]): CollectedState {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n");
  const text = userText + "\n";
  const s: CollectedState = {};

  // Phone: Kazakhstan / CIS formats
  const phoneMatch = text.match(/(?:\+?7|8)\s*\(?\d{3}\)?[\s\-]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}/);
  if (phoneMatch) s.phone = phoneMatch[0].replace(/\s+/g, " ").trim();
  const digitsOnly = text.replace(/\D/g, "");
  const tenDigit = digitsOnly.match(/(?:7|8)(\d{10})/);
  if (!s.phone && tenDigit) s.phone = "+7" + tenDigit[1];

  // Name: "Менің атым X" / "Меня зовут X" / "Моё имя X"
  const nameMatch = text.match(/(?:мен[іи]ң атым|меня зовут|мо[её] имя)\s+([A-Za-zА-Яа-яӘәІіҒғҚқҢңӨөҰұҮүҺһ]+(?:\s+[A-Za-zА-Яа-яӘәІіҒғҚқҢңӨөҰұҮүҺһ]+)?)/i);
  if (nameMatch) s.name = nameMatch[1];

  // Size meters: "3 метр", "3м", "4.5 метр"
  const sizeMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:метр|м(?!\w))/i);
  if (sizeMatch) s.sizeMeters = parseFloat(sizeMatch[1].replace(",", "."));

  // Budget tenge: "500 000 тг", "1 млн", "300000 ₸"
  const budgetMatch = text.match(/(\d[\d\s]*)\s*(?:мың|тыс|млн|тг|₸|тенге|теңге)/i);
  if (budgetMatch) {
    let v = parseFloat(budgetMatch[1].replace(/\s/g, ""));
    if (/тыс|мың/i.test(budgetMatch[0])) v *= 1000;
    if (/млн/i.test(budgetMatch[0])) v *= 1_000_000;
    s.budgetKzt = v;
  }

  // Deadline
  if (/жақын арада|тез|асқап тұр|быстро|срочно|на этой неделе|на следующей неделе|в ближайшее время/i.test(text)) s.deadline = "fast";
  else if (/кейін|кейінірек|месяца|месяцев|позже|потом|не срочно/i.test(text)) s.deadline = "far";
  else if (/жыл|осы жылы|в этом году|до конца года|осы айда|в этом месяце/i.test(text)) s.deadline = "normal";

  // Category interest
  if (/ас үй|кухн/i.test(text)) s.category = "kitchen";
  else if (/шкаф|гардероб|киім/i.test(text)) s.category = "wardrobe";

  // Style
  const styleMatch = text.match(/(классик|модерн|минимал|скандинав|лофт|неоклассик)/i);
  if (styleMatch) s.style = styleMatch[1].toLowerCase();

  // Sliding doors (wardrobes)
  if (/раздвижн|слайдер|сдвиг/i.test(text)) s.slidingDoors = true;

  // Delivery
  if (/жеткізу|доставк/i.test(text)) s.delivery = true;
  if (/жеткізусіз|без доставки/i.test(text)) s.delivery = false;

  // LED lighting (kitchens)
  const ledMatch = text.match(/(\d+(?:[.,]\d+)?)\s*метр?.*(?:led|лед|жарықдиод|подсветк)/i);
  if (ledMatch) s.ledMeters = parseFloat(ledMatch[1].replace(",", "."));
  else if (/led|лед|подсветк|жарықдиод/i.test(text)) s.ledMeters = 3;

  return s;
}

export interface CollectedState {
  name?: string;
  phone?: string;
  sizeMeters?: number;
  budgetKzt?: number;
  deadline?: "fast" | "normal" | "far";
  category?: "kitchen" | "wardrobe";
  style?: string;
  slidingDoors?: boolean;
  delivery?: boolean;
  ledMeters?: number;
}

/* ──────────────────────────── INTENT DETECTION ──────────────────────────── */

type Intent =
  | "faq_price_general"
  | "faq_price_custom"
  | "faq_material"
  | "faq_delivery"
  | "faq_install"
  | "faq_warranty"
  | "faq_payment"
  | "faq_leadtime"
  | "faq_contact"
  | "search_products"
  | "calculate"
  | "handoff"
  | "greeting";

const INTENT_RULES: Array<{ intent: Intent; patterns: RegExp[] }> = [
  { intent: "handoff", patterns: [/жалған/i, /обман|мошенн|мошенник/i, /шағым|шағымдан/i, /жалоба|недоволен|разочарован/i, /төлемді қайтар|верните деньги|вернуть деньги/i, /сот|прокуратур|судить/i, /менеджерді шақыр|менеджермен сөйлес|позовите менеджер|позови менеджер|к менеджеру|менеджер|оператор|живой человек|живого/i] },
  { intent: "faq_price_custom", patterns: [/баға|цена|стоимост|қанша тұрады|сколько стоит|сколько будет|құны|тұрады/i] },
  { intent: "faq_material", patterns: [/материал|фасад|мдф|лдам|lam|древес|массив|материалы/i] },
  { intent: "faq_delivery", patterns: [/жеткізу|доставк|ашып әкелу/i] },
  { intent: "faq_install", patterns: [/орнату|монтаж|жинау|сборк|установка/i] },
  { intent: "faq_warranty", patterns: [/кепілдік|гаранти/i] },
  { intent: "faq_payment", patterns: [/төлем|оплат|рассрочк|бөліп төлеу|наличн|қолма-қол/i] },
  { intent: "faq_leadtime", patterns: [/қанша уақыт|сколько дней|срок изготовл|дайындалады|жасалу|мерзім/i] },
  { intent: "faq_contact", patterns: [/байланыс|контакт|телефон|мекенжай|адрес|қайда орналасқан|где находится/i] },
  { intent: "faq_price_general", patterns: [/қымбат ба|дешевле|арзан/i] },
  { intent: "search_products", patterns: [/каталог|үлгі|модель|өнім|продукци/i] },
  { intent: "calculate", patterns: [/есепте|рассчитай|посчитай|шамалап|примерн|ориентир/i] },
  { intent: "greeting", patterns: [/сәлем|салем|привет|здравствуй|добрый|доброго/i] },
];

function detectIntent(text: string): Intent | null {
  for (const r of INTENT_RULES) {
    if (r.patterns.some((re) => re.test(text))) return r.intent;
  }
  return null;
}

function userText(messages: ChatMessage[]): string {
  return messages.filter((m) => m.role === "user").map((m) => m.content).join("\n");
}

/* ────────────────────────── LLM-LIKE RESPONSES ──────────────────────────── */

const R = (kk: string, ru: string) => ({ kk, ru });

const FAQ_TEXTS: Record<string, ReturnType<typeof R>> = {
  material: R(
    "Біздің жиһаздарды МДФ/ЛДСМ панельдерден жасаймыз — олар ылғалға төзімді, ұзақ қызмет етеді. Фасадтар жылтыр, матовый немесе фактуралық нұсқаларда қол жетімді, түс палитрасы кең.",
    "Мы изготавливаем мебель из влагостойких МДФ/ЛДСМ плит — они долговечны и практичны. Фасады доступны в глянцевых, матовых и фактурных вариантах, палитра цветов широкая.",
  ),
  delivery: R(
    "Астана қаласы бойынша жеткізу қызметі бар. Жеткізу құны тапсырысқа қосылады — өлшемдеріңізді айтсаңыз, нақты соманы есептейміз.",
    "Доставка по Астане предусмотрена. Стоимость доставки добавляется к заказу — назовите размеры, и мы рассчитаем точную сумму.",
  ),
  install: R(
    "Кәсіби орнату бригадасы жиһазды үйіңізде құрастырып, реттейді. Ас үй үшін орнату ұзындық метріне, шкаф үшін бекітілген сома алынады — бәрі баға есебіне кіреді.",
    "Профессиональная бригада соберёт и отрегулирует мебель у вас дома. Для кухни монтаж считается за погонный метр, для шкафа — фиксированная сумма; всё входит в расчёт.",
  ),
  warranty: R(
    "Жасалған жұмысқа кепілдік береміз: жиһаз конструкциясына және орнату сапасына жауаптымыз. Нақты шарттарын менеджер растайды.",
    "Даём гарантию на выполненные работы: отвечаем за конструкцию мебели и качество монтажа. Точные условия подтвердит менеджер.",
  ),
  payment: R(
    "Төлемді қолма-қол, банк аударымы немесе менеджер ұсынатын басқа тәсілмен жасауға болады. Тапсырыс беру үшін алдын ала төлем алынады.",
    "Оплата возможна наличными, банковским переводом или другим способом от менеджера. Для заказа берётся предоплата.",
  ),
  leadtime: R(
    "Өндіріс мерзімі өнімнің күрделілігіне байланысты — шамамен бірнеше апта. Өлшемдеріңізді алған соң менеджер нақты мерзімді растайды.",
    "Срок производства зависит от сложности изделия — ориентировочно несколько недель. После получения размеров менеджер подтвердит точный срок.",
  ),
  contact: R(
    "Бізбен байланысу үшін чатта заявка қалдырыңыз — менеджер сізге өзі хабарласады. Телефон нөміріңізді жазсаңыз жеткілікті.",
    "Оставьте заявку в чате — менеджер сам свяжется с вами. Достаточно написать номер телефона.",
  ),
};

const FALLBACK = R(
  "Кешіріңіз, бұл сұраққа қазір толық жауап бере алмаймын. «Баға», «материалдар», «жеткізу», «кепілдік» немесе «каталог» туралы сұраңыз, немесе заявка қалдырыңыз.",
  "Извините, на этот вопрос я пока не могу ответить подробно. Спросите о «цене», «материалах», «доставке», «гарантии» или «каталоге», либо оставьте заявку.",
);

/* ─────────────────────────── RULE ENGINE MAIN LOOP ──────────────────────── */

export async function ruleChat(messages: ChatMessage[], lang: "kk" | "ru", productId?: number): Promise<ChatResult> {
  const text = userText(messages);
  const state = extractState(messages);
  const meta: Record<string, unknown> = {};
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const rules = await db.select().from(pricingRules);

  // ── 1. Handoff check (highest priority) ──
  if (detectIntent(text) === "handoff") {
    let leadId: number | undefined;
    if (state.phone || state.name) {
      leadId = await createLeadFromState(db, state, productId, "Human handoff requested");
    }
    await notifyManagerRow({
      leadId,
      name: state.name,
      phone: state.phone,
      reason: text.slice(0, 500),
    });
    meta.handoff = true;
    meta.score = state.phone ? "warm" : "cold";
    if (leadId) meta.leadId = leadId;
    return {
      text: lang === "kk"
        ? "Сіздің өтінішіңіз менеджерге берілді — ол жақын арада сізбен байланысады. Келтірген қолайсыздығыңызға кешірім сұраймын."
        : "Я передал ваш запрос менеджеру — он свяжется с вами в ближайшее время. Приношу извинения за доставленные неудобства.",
      meta,
    };
  }

  const intent = detectIntent(text);
  const hasInterest = Boolean(state.sizeMeters || state.budgetKzt || state.category);

  // ── 2. Auto-ask contact when enough info is collected ──
  if (hasInterest && !state.phone && intent !== "greeting") {
    meta.askContact = true;
  }

  // ── 3. Lead auto-creation when phone arrives with interest ──
  if (state.phone && hasInterest) {
    const leadId = await createLeadFromState(db, state, productId, "Auto-collected in chat");
    meta.leadCreated = true;
    meta.leadId = leadId;
    const scoring = scoreLead({ sizeMeters: state.sizeMeters, budgetKzt: state.budgetKzt, phone: state.phone });
    meta.score = scoring.score;
    meta.scoreReason = scoring.reason;
    // Confirm lead creation right away instead of falling through to a
    // generic default answer.
    if (intent !== "faq_price_custom" && intent !== "calculate") {
      return {
        text: lang === "kk"
          ? "Заявкаңыз қабылданды! Мәліметтеріңізді сақтадық — менеджер жақын арада сізбен хабарласады."
          : "Заявка принята! Мы сохранили ваши данные — менеджер свяжется с вами в ближайшее время.",
        meta,
      };
    }
  }

  // ── 4. Price calculation ──
  if (intent === "faq_price_custom" || intent === "calculate") {
    const isWardrobeContext = state.category === "wardrobe" || /шкаф|гардероб|киім/i.test(text);
    if (!isWardrobeContext) {
      // kitchen
      if (state.sizeMeters) {
        const r = calculateKitchenPrice(rules, state.sizeMeters, {
          delivery: state.delivery ?? true,
          ledMeters: state.ledMeters,
        });
        return {
          text: lang === "kk"
            ? `Сіздің ас үйіңіз үшін шамамен баға: **${r.total.toLocaleString("kk-KZ")} ₸**.\n\nЕсептеу: жиһаз ${Math.round(r.breakdown.furnitureCost).toLocaleString("kk-KZ")} ₸ + орнату ${Math.round(r.breakdown.installCost).toLocaleString("kk-KZ")} ₸${r.breakdown.deliveryFee > 0 ? ` + жеткізу ${Math.round(r.breakdown.deliveryFee).toLocaleString("kk-KZ")} ₸` : ""}.\n\nТолық заявка қалдырсаңыз — менеджер нақты соманы растайды.`
            : `Ориентировочная цена для вашей кухни: **${r.total.toLocaleString("ru-RU")} ₸**.\n\nРасчёт: мебель ${Math.round(r.breakdown.furnitureCost).toLocaleString("ru-RU")} ₸ + монтаж ${Math.round(r.breakdown.installCost).toLocaleString("ru-RU")} ₸${r.breakdown.deliveryFee > 0 ? ` + доставка ${Math.round(r.breakdown.deliveryFee).toLocaleString("ru-RU")} ₸` : ""}.\n\nОставьте заявку — менеджер подтвердит точную сумму.`,
          meta,
        };
      }
      return {
        text: lang === "kk"
          ? "Ас үйдің бағасын есептеу үшін ұзындығын (метрмен) айтсаңыз болғаны — мысалы, «3 метр ас үй». Жеткізу мен LED жарықтандыруды да қоса аламын."
          : "Чтобы рассчитать кухню, назовите длину в метрах — например, «кухня 3 метра». Могу добавить доставку и LED-подсветку.",
        meta,
      };
    }
    // wardrobe
    if (state.sizeMeters) {
      const r = calculateWardrobePrice(rules, state.sizeMeters, 2.4, {
        slidingDoors: state.slidingDoors ?? true,
        delivery: state.delivery ?? true,
      });
      return {
        text: lang === "kk"
          ? `Шкаф үшін шамамен баға (ені ${state.sizeMeters} м, биіктігі 2.4 м): **${r.total.toLocaleString("kk-KZ")} ₸**.\n\nЕгер биіктігіңіз басқаша болса — айтсаңыз, қайта есептеймін.`
          : `Ориентировочная цена шкафа (ширина ${state.sizeMeters} м, высота 2.4 м): **${r.total.toLocaleString("ru-RU")} ₸**.\n\nЕсли высота другая — назовите её, пересчитаю.`,
        meta,
      };
    }
    return {
      text: lang === "kk"
        ? "Шкафтың бағасын есептеу үшін өлшемдерін айтсаңыз болғаны — мысалы, «ені 2 метр, биіктігі 2.4 метр». Раздвижной есіктерді де есепке аламын."
        : "Чтобы рассчитать шкаф, назовите размеры — например, «ширина 2 метра, высота 2.4 метра». Учту и раздвижные двери.",
      meta,
    };
  }

  // ── 5. FAQ answers ──
  if (intent && intent.startsWith("faq")) {
    const key = intent === "faq_price_general" ? "payment" : intent.slice(4);
    const faq = FAQ_TEXTS[key];
    if (faq) return { text: faq[lang], meta };
    const rows = await db.select().from(faqs).where(eq(faqs.isActive, true)).limit(3);
    const row = rows[0];
    if (row) {
      const answer = lang === "kk" ? row.answerKk ?? row.answerRu : row.answerRu;
      return { text: answer ?? FALLBACK[lang], meta };
    }
    return { text: FALLBACK[lang], meta };
  }

  // ── 6. Product search ──
  if (intent === "search_products") {
    const rows = await db.select().from(products).where(eq(products.isPublished, true)).limit(5);
    if (rows.length === 0) return { text: FALLBACK[lang], meta };
    const list = rows
      .map((p) => `- ${lang === "kk" ? p.nameKk : p.nameRu} (${p.style}) — ${p.basePriceKzt ? p.basePriceKzt.toLocaleString("kk-KZ") : "?"} ₸${p.priceUnit || ""}`)
      .join("\n");
    return {
      text: lang === "kk"
        ? `Каталогтан таңдамалы үлгілер:\n\n${list}\n\nҚалаған өнім туралы толығырақ сұрасаңыз болады немесе сайттағы «Каталог» бөлімінен қараңыз.`
        : `Примеры из каталога:\n\n${list}\n\nСпросите подробнее о любой модели или посмотрите раздел «Каталог» на сайте.`,
      meta,
    };
  }

  // ── 7. Greeting ──
  if (intent === "greeting") {
    return {
      text: lang === "kk"
        ? "Сәлем! Dero Mebel AI-ассистенті. Ас үй немесе шкаф жасағыңыз келе ме? Өлшемдеріңізді айтсаңыз — бағасын есептеймін."
        : "Здравствуйте! Я AI-ассистент Dero Mebel. Хотите кухню или шкаф? Назовите размеры — рассчитаю цену.",
      meta,
    };
  }

  // ── 8. Default: guided prompt based on collected state ──
  if (state.category === "kitchen") {
    return {
      text: lang === "kk"
        ? "Ас үй жасау қызықтыра ма? Ұзындығын (метрмен) және қалаған стиліңізді жазсаңыз — бағасын шығарамын."
        : "Интересует кухня? Напишите длину в метрах и желаемый стиль — рассчитаю цену.",
      meta,
    };
  }
  if (state.category === "wardrobe") {
    return {
      text: lang === "kk"
        ? "Шкаф жасау қызықтыра ма? Ені мен биіктігін (метрмен) жазсаңыз — бағасын шығарамын."
        : "Интересует шкаф? Напишите ширину и высоту в метрах — рассчитаю цену.",
      meta,
    };
  }
  return {
    text: lang === "kk"
      ? "Сәлем! Мен Dero Mebel-дің AI-ассистентімін. Ас үй немесе шкаф жасаймыз. Не қызықтырады — баға, материалдар, жеткізу, кепілдік немесе каталог? Сұрағыңызды қойыңыз."
      : "Здравствуйте! Я AI-ассистент Dero Mebel. Делаем кухни и шкафы. Что интересует — цена, материалы, доставка, гарантия или каталог? Задайте вопрос.",
    meta,
  };
}

/* ─────────────────────────── LEAD CREATION HELPER ───────────────────────── */

async function createLeadFromState(
  db: Awaited<ReturnType<typeof getDb>>,
  state: CollectedState,
  productId: number | undefined,
  notes: string,
): Promise<number> {
  const scoring = scoreLead({ sizeMeters: state.sizeMeters, budgetKzt: state.budgetKzt, phone: state.phone });
  const result = await db!.insert(leads).values({
    name: state.name ?? null,
    phone: state.phone ?? null,
    product: state.category ?? "unknown",
    sizeMeters: state.sizeMeters ?? null,
    style: state.style ?? null,
    budgetKzt: state.budgetKzt ?? null,
    deadline: state.deadline ?? null,
    notes: `${notes} (state: ${JSON.stringify({ sizeMeters: state.sizeMeters, budgetKzt: state.budgetKzt, deadline: state.deadline, category: state.category, style: state.style })})`,
    score: scoring.score,
    scoreReason: scoring.reason,
  }).execute();
  void productId;
  return ((result as unknown[])[0] as { insertId: number }).insertId;
}

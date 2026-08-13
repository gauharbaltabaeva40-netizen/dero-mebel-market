import { and, eq } from "drizzle-orm";
import { faqs, pricingRules, products } from "../../drizzle/schema";
import { getDb } from "../db";
import { calculateKitchenPrice, calculateWardrobePrice } from "./ai";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export type RecommendedProduct = {
  id: number;
  nameKk: string;
  nameRu: string;
  descriptionKk: string;
  descriptionRu: string;
  photoUrl: string | null;
  basePriceKzt: number | null;
  priceUnit: string | null;
  kaspiUrl: string | null;
  kaspiVerified: boolean;
};

export interface ChatMeta {
  recommendedProducts?: RecommendedProduct[];
  productAction?: "buy" | "select";
  quickReplies?: string[];
}

export interface ChatResult {
  text: string;
  meta: ChatMeta;
}

export interface CollectedState {
  sizeMeters?: number;
  budgetKzt?: number;
  budgetMinKzt?: number;
  budgetMaxKzt?: number;
  category?: "kitchen" | "wardrobe";
  style?: string;
  requestedWidthMm?: number;
  requestedHeightMm?: number;
  requestedDepthMm?: number;
  requestedColor?: "beige" | "white" | "black" | "brown" | "grey";
  requestedMaterial?: "ldsp" | "mdf" | "wood";
  requestedProductType?: "mezzanine";
  sizePreferenceCaptured?: boolean;
  colorPreferenceCaptured?: boolean;
  materialPreferenceCaptured?: boolean;
  budgetPreferenceCaptured?: boolean;
  deadline?: "fast" | "normal" | "far";
  slidingDoors?: boolean;
  delivery?: boolean;
  ledMeters?: number;
}

const R = (kk: string, ru: string) => ({ kk, ru });

const QUICK = {
  choose: R("Ас үй", "Кухня"),
  wardrobe: R("Шкаф", "Шкаф"),
  catalog: R("Каталогты көрсету", "Показать каталог"),
  price: R("Бағаны есептеу", "Рассчитать цену"),
  payment: R("Тапсырыс туралы", "Об оформлении"),
  delivery: R("Жеткізу туралы", "О доставке"),
  budget: R("Бюджетті таңдау", "Выбрать бюджет"),
  color: R("Түсті таңдау", "Выбрать цвет"),
  material: R("Материалды таңдау", "Выбрать материал"),
};

const BUDGET_QUICK_REPLIES = {
  kk: ["200 000 ₸ дейін", "200 000–500 000 ₸", "500 000–1 000 000 ₸", "1 000 000 ₸+", "Бюджет маңызды емес"],
  ru: ["до 200 000 ₸", "200 000–500 000 ₸", "500 000–1 000 000 ₸", "Бюджет не важен"],
} as const;

const SIZE_QUICK_REPLIES = {
  kk: ["Өлшем маңызды емес"],
  ru: ["Размер не важен"],
} as const;

const COLOR_QUICK_REPLIES = {
  kk: ["Ақ түс", "Беж түс", "Сұр түс", "Қоңыр/Венге", "Барлық түстер"],
  ru: ["Белый цвет", "Бежевый цвет", "Серый цвет", "Коричневый/Венге", "Все цвета"],
} as const;

const MATERIAL_QUICK_REPLIES = {
  kk: ["ЛДСП", "МДФ", "Массив ағаш", "Барлық материалдар"],
  ru: ["ЛДСП", "МДФ", "Массив дерева", "Все материалы"],
} as const;

const FAQ_TEXTS: Record<string, ReturnType<typeof R>> = {
  material: R(
    "Жиһаз МДФ/ЛДСП материалдарынан жасалады. Әр тауардың нақты материалын оның карточкасынан көре аласыз. Қалаған үлгіні таңдасаңыз, DERO AI параметрлерін нақтылауға көмектеседі.",
    "Мебель изготавливается из МДФ/ЛДСП. Точный материал указан в карточке каждого товара. Выберите подходящую модель, а DERO AI поможет уточнить параметры.",
  ),
  delivery: R(
    "Астана бойынша жеткізу шарттары тауарға және жоба параметрлеріне байланысты. Алдымен лайықты үлгіні таңдаңыз, содан кейін жеткізу мерзімін нақтылауға болады.",
    "Условия доставки по Астане зависят от товара и параметров проекта. Сначала выберите подходящую модель, затем можно уточнить сроки доставки.",
  ),
  install: R(
    "Жинау және орнату шарттары тауар мен жобаға байланысты. Жеке өлшеммен жасалатын жиһаз үшін DERO AI алдымен шамамен бағаны есептейді.",
    "Условия сборки и установки зависят от товара и проекта. Для мебели по индивидуальным размерам DERO AI сначала рассчитает ориентировочную стоимость.",
  ),
  warranty: R(
    "Кепілдік шарттары нақты тауар мен жобаға байланысты. Үлгіні таңдаңыз — DERO AI оның параметрлерін түсіндіруге көмектеседі.",
    "Условия гарантии зависят от конкретного товара и проекта. Выберите модель — DERO AI поможет разобраться в её параметрах.",
  ),
  payment: R(
    "Тапсырыс шарттарын нақтылау үшін алдымен үлгіні таңдаңыз. DERO AI өлшем, түс, материал және бюджет бойынша іріктеуге көмектеседі.",
    "Чтобы уточнить условия оформления, сначала выберите модель. DERO AI поможет подобрать её по размеру, цвету, материалу и бюджету.",
  ),
  leadtime: R(
    "Тауар карточкасында қолжетімділік мәртебесі көрсетіледі. Қалаған үлгіні таңдаңыз, DERO AI жеткізу мерзімі мен параметрлерін нақтылауға бағыттайды.",
    "В карточке товара показан статус доступности. Выберите нужную модель, а DERO AI поможет уточнить срок доставки и параметры.",
  ),
  support: R(
    "Мен сізге тауарды тауып, сипаттамасын және параметрлерін түсіндіруге көмектесе аламын. Бұрынғы тапсырыс бойынша мәселе болса, компанияның байланыс арналарына хабарласыңыз.",
    "Я могу подобрать товар и объяснить его характеристики и параметры. По вопросу о ранее оформленном заказе обратитесь по каналам связи компании.",
  ),
};

const FALLBACK = R(
  "Мен DERO AI — жиһазды таңдауға көмектесемін. «Ас үй», «шкаф», «каталог», «бағаны есептеу» деп жазыңыз немесе төмендегі батырмалардың бірін таңдаңыз.",
  "Я DERO AI — помогу подобрать мебель. Напишите «кухня», «шкаф», «каталог», «рассчитать цену» или выберите одну из кнопок ниже.",
);

type Intent =
  | "support"
  | "payment"
  | "faq_price"
  | "faq_material"
  | "faq_delivery"
  | "faq_install"
  | "faq_warranty"
  | "faq_leadtime"
  | "search_products"
  | "calculate"
  | "choose_kitchen"
  | "choose_wardrobe"
  | "budget"
  | "choose_color"
  | "choose_material"
  | "greeting";

const INTENT_RULES: Array<{ intent: Intent; patterns: RegExp[] }> = [
  { intent: "support", patterns: [/жалған/i, /обман|мошенн|мошенник/i, /шағым|шағымдан/i, /жалоба|недоволен|разочарован/i, /төлемді қайтар|верните деньги|вернуть деньги/i, /сот|прокуратур|судить/i, /менеджер|оператор|живой человек|живого/i] },
  { intent: "payment", patterns: [/kaspi.*(сатып|куп|төле|оплат)/i, /(сатып ал|купить|оплатить|төлеу|checkout)/i] },
  { intent: "calculate", patterns: [/есепте|рассчитай|посчитай|шамалап|примерн|ориентир/i] },
  { intent: "faq_price", patterns: [/баға|цена|стоимост|қанша тұрады|сколько стоит|сколько будет|құны|тұрады/i] },
  { intent: "choose_color", patterns: [/түсті таңдау|түсін таңдау|выбрать цвет/i, /ақ түс|беж түс|сұр түс|қоңыр\/венге|барлық түстер/i, /белый цвет|бежевый цвет|серый цвет|коричневый\/венге|все цвета/i] },
  { intent: "choose_material", patterns: [/материалды таңдау|выбрать материал/i, /^лдсп$/i, /^мдф$/i, /массив ағаш|массив дерева|барлық материалдар|все материалы/i] },
  { intent: "faq_material", patterns: [/материал|фасад|мдф|лдсп|дсп|ламина|древес|массив/i] },
  { intent: "faq_delivery", patterns: [/жеткізу|доставк|әкелу/i] },
  { intent: "faq_install", patterns: [/орнату|монтаж|жинау|сборк|установка/i] },
  { intent: "faq_warranty", patterns: [/кепілдік|гаранти/i] },
  { intent: "faq_leadtime", patterns: [/қанша уақыт|сколько дней|срок изготовл|дайындалады|жасалу|мерзім/i] },
  { intent: "search_products", patterns: [/каталог|үлгі|модель|өнім|продукци|товар/i] },
  { intent: "choose_kitchen", patterns: [/ас үй|кухн/i] },
  { intent: "choose_wardrobe", patterns: [/шкаф|гардероб|киім/i] },
  { intent: "budget", patterns: [/бюджет|баға диапазон|ценов.*диапазон|выбрать бюджет/i] },
  { intent: "greeting", patterns: [/сәлем|салем|привет|здравствуй|добрый|доброго/i] },
];

export function detectIntent(text: string): Intent | null {
  for (const rule of INTENT_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) return rule.intent;
  }
  return null;
}

function latestUserMessage(messages: ChatMessage[]): string {
  return [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
}

const COLOR_MATCHERS = {
  beige: /беж|құм түст|песочн/i,
  white: /бел(ый|ая)|ақ(?:\s|$)/i,
  black: /черн|қара(?:\s|$)/i,
  brown: /коричн|қоңыр/i,
  grey: /сер(ый|ая)|сұр/i,
} as const;

const MATERIAL_MATCHERS = {
  ldsp: /лдсп|ldsp|ldfp/i,
  mdf: /мдф|mdf/i,
  wood: /массив|wood|дерев/i,
} as const;

const COLOR_RESET_MATCHER = /барлық түстер|все цвета/i;
const MATERIAL_RESET_MATCHER = /барлық материалдар|все материалы/i;
const SIZE_SKIP_MATCHER = /өлшем маңызды емес|размер не важен|кез келген өлшем|любой размер/i;
const BUDGET_SKIP_MATCHER = /бюджет маңызды емес|бюджет не важен/i;

function dimensionToMm(value: string): number {
  const numeric = Number.parseInt(value, 10);
  return numeric > 0 && numeric < 1_000 ? numeric * 10 : numeric;
}

/** Identifies model-level criteria beyond a broad kitchen or wardrobe category. */
export function hasSpecificProductRequest(state: CollectedState): boolean {
  return Boolean(
    state.requestedWidthMm ||
      state.requestedHeightMm ||
      state.requestedDepthMm ||
      state.requestedColor ||
      state.requestedMaterial ||
      state.requestedProductType,
  );
}

/** Extracts product preferences from user messages only; it never requests or stores contact details. */
export function extractState(messages: ChatMessage[]): CollectedState {
  const userMessages = messages.filter((message) => message.role === "user");
  const text = userMessages.map((message) => message.content).join("\n");
  const state: CollectedState = {};

  const sizeMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:метр|м(?!\w))/i);
  if (sizeMatch) state.sizeMeters = Number.parseFloat(sizeMatch[1].replace(",", "."));

  const compactBudgetText = text.replace(/\s/g, "").replace(/[—–]/g, "-");
  const rangeMatch = compactBudgetText.match(/(\d+)-(\d+)₸/i);
  const underMatch = compactBudgetText.match(/(?:до(\d+)₸|(\d+)₸дейін)/i);
  const fromMatch = compactBudgetText.match(/(\d+)₸\+/i);
  if (rangeMatch) {
    state.budgetMinKzt = Number.parseInt(rangeMatch[1], 10);
    state.budgetMaxKzt = Number.parseInt(rangeMatch[2], 10);
    state.budgetKzt = Math.round((state.budgetMinKzt + state.budgetMaxKzt) / 2);
  } else if (underMatch) {
    state.budgetMaxKzt = Number.parseInt(underMatch[1] ?? underMatch[2], 10);
    state.budgetKzt = state.budgetMaxKzt;
  } else if (fromMatch) {
    state.budgetMinKzt = Number.parseInt(fromMatch[1], 10);
    state.budgetKzt = state.budgetMinKzt;
  }

  const budgetMatch = text.match(/(\d[\d\s]*)\s*(?:мың|тыс|млн|тг|₸|тенге|теңге)/i);
  if (budgetMatch && !state.budgetKzt) {
    let amount = Number.parseFloat(budgetMatch[1].replace(/\s/g, ""));
    if (/тыс|мың/i.test(budgetMatch[0])) amount *= 1_000;
    if (/млн/i.test(budgetMatch[0])) amount *= 1_000_000;
    state.budgetKzt = amount;
  }

  const latest = latestUserMessage(messages);
  if (/ас үй|кухн/i.test(latest)) state.category = "kitchen";
  else if (/шкаф|гардероб|киім/i.test(latest)) state.category = "wardrobe";
  else if (/ас үй|кухн/i.test(text)) state.category = "kitchen";
  else if (/шкаф|гардероб|киім/i.test(text)) state.category = "wardrobe";

  const styleMatch = text.match(/(классик|модерн|минимал|скандинав|лофт|неоклассик)/i);
  if (styleMatch) state.style = styleMatch[1].toLowerCase();
  const dimensions = text.match(/(\d{2,4})\s*[xх×]\s*(\d{2,4})\s*[xх×]\s*(\d{2,4})/i);
  if (dimensions) {
    state.requestedWidthMm = dimensionToMm(dimensions[1]);
    state.requestedHeightMm = dimensionToMm(dimensions[2]);
    state.requestedDepthMm = dimensionToMm(dimensions[3]);
  }
  const sizeSelection = [...userMessages].reverse().find((message) => (
    SIZE_SKIP_MATCHER.test(message.content) || /(\d{2,4})\s*[xх×]\s*(\d{2,4})\s*[xх×]\s*(\d{2,4})/i.test(message.content) || /(\d+(?:[.,]\d+)?)\s*(?:метр|м(?!\w))/i.test(message.content)
  ));
  if (sizeSelection) {
    state.sizePreferenceCaptured = true;
    if (SIZE_SKIP_MATCHER.test(sizeSelection.content)) {
      state.sizeMeters = undefined;
      state.requestedWidthMm = undefined;
      state.requestedHeightMm = undefined;
      state.requestedDepthMm = undefined;
    }
  }
  const colorSelection = [...userMessages].reverse().find((message) => (
    COLOR_RESET_MATCHER.test(message.content) || Object.values(COLOR_MATCHERS).some((matcher) => matcher.test(message.content))
  ));
  if (colorSelection && !COLOR_RESET_MATCHER.test(colorSelection.content)) {
    for (const [color, matcher] of Object.entries(COLOR_MATCHERS) as Array<[NonNullable<CollectedState["requestedColor"]>, RegExp]>) {
      if (matcher.test(colorSelection.content)) {
        state.requestedColor = color;
        break;
      }
    }
  }
  if (colorSelection) state.colorPreferenceCaptured = true;
  const materialSelection = [...userMessages].reverse().find((message) => (
    MATERIAL_RESET_MATCHER.test(message.content) || Object.values(MATERIAL_MATCHERS).some((matcher) => matcher.test(message.content))
  ));
  if (materialSelection && !MATERIAL_RESET_MATCHER.test(materialSelection.content)) {
    for (const [material, matcher] of Object.entries(MATERIAL_MATCHERS) as Array<[NonNullable<CollectedState["requestedMaterial"]>, RegExp]>) {
      if (matcher.test(materialSelection.content)) {
        state.requestedMaterial = material;
        break;
      }
    }
  }
  if (materialSelection) state.materialPreferenceCaptured = true;
  const budgetSkipSelection = [...userMessages].reverse().find((message) => BUDGET_SKIP_MATCHER.test(message.content));
  if (budgetSkipSelection) {
    state.budgetKzt = undefined;
    state.budgetMinKzt = undefined;
    state.budgetMaxKzt = undefined;
    state.budgetPreferenceCaptured = true;
  } else if (state.budgetKzt !== undefined || state.budgetMinKzt !== undefined || state.budgetMaxKzt !== undefined) {
    state.budgetPreferenceCaptured = true;
  }
  if (/антресол/i.test(text)) state.requestedProductType = "mezzanine";
  if (/срочно|жедел|осы апта|на этой неделе/i.test(text)) state.deadline = "fast";
  else if (/екі айдан|через два месяца|через 2 месяца/i.test(text)) state.deadline = "far";
  else if (/осы жыл|в этом году/i.test(text)) state.deadline = "normal";
  if (/раздвижн|слайдер|сдвиг/i.test(text)) state.slidingDoors = true;
  if (/жеткізусіз|без доставки/i.test(text)) state.delivery = false;
  else if (/жеткізу|доставк/i.test(text)) state.delivery = true;

  const ledMatch = text.match(/(\d+(?:[.,]\d+)?)\s*метр?.*(?:led|лед|жарықдиод|подсветк)/i);
  if (ledMatch) state.ledMeters = Number.parseFloat(ledMatch[1].replace(",", "."));
  else if (/led|лед|подсветк|жарықдиод/i.test(text)) state.ledMeters = 3;

  return state;
}

function quickReplies(lang: "kk" | "ru", entries: Array<keyof typeof QUICK>): string[] {
  return entries.map((entry) => QUICK[entry][lang]);
}

function budgetQuickReplies(lang: "kk" | "ru"): string[] {
  return [...BUDGET_QUICK_REPLIES[lang]];
}

function colorQuickReplies(lang: "kk" | "ru"): string[] {
  return [...COLOR_QUICK_REPLIES[lang]];
}

function materialQuickReplies(lang: "kk" | "ru"): string[] {
  return [...MATERIAL_QUICK_REPLIES[lang]];
}

function sizeQuickReplies(lang: "kk" | "ru"): string[] {
  return [...SIZE_QUICK_REPLIES[lang]];
}

type GuidedPreferenceStep = "category" | "size" | "color" | "material" | "budget";

/** Returns the next explicit filtering choice required before a product carousel is displayed. */
export function getGuidedPreferenceStep(state: CollectedState): GuidedPreferenceStep | null {
  if (!state.category) return "category";
  if (!state.sizePreferenceCaptured) return "size";
  if (!state.colorPreferenceCaptured) return "color";
  if (!state.materialPreferenceCaptured) return "material";
  if (!state.budgetPreferenceCaptured) return "budget";
  return null;
}

function guidedPreferenceReply(lang: "kk" | "ru", step: GuidedPreferenceStep): ChatResult {
  if (step === "category") {
    return {
      text: lang === "kk" ? "Дұрыс үлгі табу үшін алдымен жиһаз түрін таңдаңыз." : "Чтобы подобрать подходящую модель, сначала выберите тип мебели.",
      meta: { quickReplies: quickReplies(lang, ["choose", "wardrobe"]) },
    };
  }
  if (step === "size") {
    return {
      text: lang === "kk" ? "Ен × биіктік × тереңдік өлшемін мм-мен жазыңыз. Мысалы: **180×240×55**. Өлшем шешуші болмаса, төменнен өткізіп жіберуге болады." : "Укажите размер в мм: ширина × высота × глубина. Например: **180×240×55**. Если размер не принципиален, пропустите этот шаг кнопкой ниже.",
      meta: { quickReplies: sizeQuickReplies(lang) },
    };
  }
  if (step === "color") {
    return {
      text: lang === "kk" ? "Енді қалаған түсті таңдаңыз." : "Теперь выберите предпочтительный цвет.",
      meta: { quickReplies: colorQuickReplies(lang) },
    };
  }
  if (step === "material") {
    return {
      text: lang === "kk" ? "Материалды таңдаңыз." : "Выберите материал.",
      meta: { quickReplies: materialQuickReplies(lang) },
    };
  }
  return {
    text: lang === "kk" ? "Соңғы қадам: бюджет диапазонын таңдаңыз немесе оны өткізіп жіберіңіз. Осыдан кейін мен тек сәйкес үлгілерді көрсетемін." : "Последний шаг: выберите диапазон бюджета или пропустите его. После этого я покажу только подходящие модели.",
    meta: { quickReplies: budgetQuickReplies(lang) },
  };
}

function activeFilterLabels(lang: "kk" | "ru", state: CollectedState): string[] {
  const colors = {
    kk: { beige: "беж", white: "ақ", black: "қара", brown: "қоңыр/венге", grey: "сұр" },
    ru: { beige: "бежевый", white: "белый", black: "чёрный", brown: "коричневый/венге", grey: "серый" },
  } as const;
  const materials = {
    kk: { ldsp: "ЛДСП", mdf: "МДФ", wood: "массив ағаш" },
    ru: { ldsp: "ЛДСП", mdf: "МДФ", wood: "массив дерева" },
  } as const;
  const labels: Array<string | undefined> = [
    state.requestedColor ? colors[lang][state.requestedColor] : undefined,
    state.requestedMaterial ? materials[lang][state.requestedMaterial] : undefined,
  ];
  return labels.filter((value): value is string => value !== undefined);
}

function productMeta(rows: Array<typeof products.$inferSelect>): RecommendedProduct[] {
  return rows.map((product) => ({
    id: product.id,
    nameKk: product.nameKk,
    nameRu: product.nameRu,
    descriptionKk: product.descriptionKk ?? "",
    descriptionRu: product.descriptionRu ?? "",
    photoUrl: product.photoUrl,
    basePriceKzt: product.basePriceKzt,
    priceUnit: product.priceUnit,
    kaspiUrl: product.kaspiUrl,
    kaspiVerified: product.kaspiVerified,
  }));
}

function productSearchText(product: typeof products.$inferSelect): string {
  const textValue = (value: unknown) => typeof value === "string" ? value : JSON.stringify(value ?? "");
  return [
    product.nameKk,
    product.nameRu,
    product.descriptionKk,
    product.descriptionRu,
    product.material,
    product.materialKk,
    product.materialRu,
    product.facade,
    product.facadeKk,
    product.facadeRu,
    product.colors,
    product.colorsKk,
    product.colorsRu,
    product.features,
    product.featuresKk,
    product.featuresRu,
  ].map(textValue).join(" ").toLowerCase();
}

function productMatchScore(product: typeof products.$inferSelect, state: CollectedState): number {
  const text = productSearchText(product);
  let score = 0;
  if (state.requestedProductType === "mezzanine") score += /антресол/i.test(text) ? 60 : -80;
  if (state.requestedColor) score += COLOR_MATCHERS[state.requestedColor].test(text) ? 34 : -18;
  if (state.requestedMaterial) score += MATERIAL_MATCHERS[state.requestedMaterial].test(text) ? 34 : -18;

  const dimensions: Array<[number | undefined, unknown]> = [
    [state.requestedWidthMm, product.widthMm],
    [state.requestedHeightMm, product.heightMm],
    [state.requestedDepthMm, product.depthMm],
  ];
  for (const [requested, actual] of dimensions) {
    if (!requested) continue;
    score += Number(actual) === requested ? 28 : -10;
  }
  return score;
}

/** DERO AI keeps every selected model inside the storefront; external marketplace checkout is disabled. */
export function getPaymentProductAction(_productId: number | undefined, _items: RecommendedProduct[]): "select" {
  return "select";
}

export function matchesBudget(priceKzt: number | null, state: Pick<CollectedState, "budgetMinKzt" | "budgetMaxKzt">): boolean {
  if (priceKzt == null) return false;
  return (!state.budgetMinKzt || priceKzt >= state.budgetMinKzt)
    && (!state.budgetMaxKzt || priceKzt <= state.budgetMaxKzt);
}

async function findProducts(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  state: CollectedState,
  productId?: number,
): Promise<RecommendedProduct[]> {
  if (productId) {
    const current = await db.select().from(products).where(and(eq(products.id, productId), eq(products.isPublished, true))).limit(1);
    if (current[0]) return productMeta(current);
  }

  const needsExactRanking = hasSpecificProductRequest(state);
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.isPublished, true), state.category ? eq(products.category, state.category) : undefined))
    .limit(needsExactRanking ? 500 : 12);

  const scored = rows
    .filter((product) => Boolean(product.kaspiUrl))
    .map((product) => ({ product, exactScore: productMatchScore(product, state) }));
  const ranked = scored
    .sort((a, b) => {
      if (a.exactScore !== b.exactScore) return b.exactScore - a.exactScore;
      const styleA = state.style && a.product.style.toLowerCase().includes(state.style) ? 1 : 0;
      const styleB = state.style && b.product.style.toLowerCase().includes(state.style) ? 1 : 0;
      if (styleA !== styleB) return styleB - styleA;
      if (state.budgetKzt && a.product.basePriceKzt != null && b.product.basePriceKzt != null) {
        return Math.abs(a.product.basePriceKzt - state.budgetKzt) - Math.abs(b.product.basePriceKzt - state.budgetKzt);
      }
      return (a.product.basePriceKzt ?? Number.MAX_SAFE_INTEGER) - (b.product.basePriceKzt ?? Number.MAX_SAFE_INTEGER);
    });

  const highestScore = ranked[0]?.exactScore ?? 0;
  const withinBudget = ranked.filter(({ product }) => matchesBudget(product.basePriceKzt, state));
  const budgetRanked = withinBudget.length > 0 ? withinBudget : ranked;
  const exactRows = needsExactRanking && highestScore > 0
    ? budgetRanked.filter((candidate) => candidate.exactScore >= highestScore - 10).slice(0, 3)
    : budgetRanked.slice(0, 3);

  return productMeta(exactRows.map((candidate) => candidate.product));
}

async function getFaqAnswer(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, lang: "kk" | "ru"): Promise<string> {
  const rows = await db.select().from(faqs).where(eq(faqs.isActive, true)).limit(1);
  const row = rows[0];
  return lang === "kk" ? row?.answerKk ?? row?.answerRu ?? FALLBACK.kk : row?.answerRu ?? FALLBACK.ru;
}

export async function ruleChat(messages: ChatMessage[], lang: "kk" | "ru", productId?: number): Promise<ChatResult> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const latest = latestUserMessage(messages);
  const state = extractState(messages);
  const intent = detectIntent(latest);
  const meta: ChatMeta = {};

  if (intent === "support") {
    return { text: FAQ_TEXTS.support[lang], meta: { quickReplies: quickReplies(lang, ["catalog", "color", "material"]) } };
  }

  if (intent === "payment") {
    const choices = await findProducts(db, state, productId);
    return {
      text: lang === "kk" ? "Алдымен бір үлгіні таңдаңыз. Содан кейін DERO AI арқылы оның өлшемін, түсін, материалын және тапсырыс параметрлерін нақтылай аласыз." : "Сначала выберите одну модель. Затем через DERO AI можно уточнить её размер, цвет, материал и параметры оформления.",
      meta: { recommendedProducts: choices, productAction: "select", quickReplies: quickReplies(lang, ["choose", "wardrobe", "catalog"]) },
    };
  }

  if (intent === "budget" && !BUDGET_SKIP_MATCHER.test(latest)) {
    return {
      text: lang === "kk"
        ? "Бюджетіңізге сай дайын үлгілерді көрсету үшін диапазонды таңдаңыз. Кейін модельдің карточкасын қарап, параметрлерін нақтылай аласыз."
        : "Выберите диапазон бюджета, и я покажу готовые модели в этой сумме. Затем сможете посмотреть карточку модели и уточнить её параметры.",
      meta: { quickReplies: budgetQuickReplies(lang) },
    };
  }

  const colorReset = COLOR_RESET_MATCHER.test(latest);
  const materialReset = MATERIAL_RESET_MATCHER.test(latest);
  if (intent === "choose_color" && !state.requestedColor && !colorReset) {
    return {
      text: lang === "kk"
        ? "Алдымен қалаған түсті таңдаңыз. Мен осы түстегі тауарларды көрсетіп, кейін материал мен бюджетті де нақтылауға мүмкіндік беремін."
        : "Сначала выберите желаемый цвет. Я покажу товары в этом цвете, а затем можно будет уточнить материал и бюджет.",
      meta: { quickReplies: colorQuickReplies(lang) },
    };
  }

  if (intent === "choose_material" && !state.requestedMaterial && !materialReset) {
    return {
      text: lang === "kk"
        ? "Материалды таңдаңыз. Таңдауыңыз чаттағы түс пен бюджет параметрлерімен бірге сақталады."
        : "Выберите материал. Он сохранится вместе с выбранными в чате цветом и бюджетом.",
      meta: { quickReplies: materialQuickReplies(lang) },
    };
  }

  const guidedStep = getGuidedPreferenceStep(state);
  const informationalIntent = intent === "calculate" || intent === "faq_price" || intent === "faq_material" || intent === "faq_delivery" || intent === "faq_install" || intent === "faq_warranty" || intent === "faq_leadtime";
  if (guidedStep && !informationalIntent) {
    return guidedPreferenceReply(lang, guidedStep);
  }

  if (state.requestedColor || state.requestedMaterial || colorReset || materialReset) {
    const matched = await findProducts(db, state, productId);
    const filters = activeFilterLabels(lang, state);
    return {
      text: lang === "kk"
        ? filters.length > 0
          ? `Таңдаған ${filters.join(" және ")} параметрлеріне сай дайын үлгілерді көрсетіп тұрмын. Фото мен қысқаша сипаттаманы қарап, бір үлгіні таңдаңыз.`
          : "Түс немесе материал шектеуін алып тастадым. Қолжетімді дайын үлгілерді көрсетіп тұрмын."
        : filters.length > 0
          ? `Показываю готовые модели по выбранным параметрам: ${filters.join(" и ")}. Посмотрите фото и краткие описания, затем выберите модель.`
          : "Ограничение по цвету или материалу снято. Показываю доступные готовые модели.",
      meta: { recommendedProducts: matched, productAction: "select", quickReplies: quickReplies(lang, ["color", "material", "budget", "catalog"]) },
    };
  }

  if (state.budgetMinKzt || state.budgetMaxKzt) {
    const matched = await findProducts(db, state, productId);
    return {
      text: lang === "kk"
        ? "Осы бюджетке сай дайын үлгілерді көрсетіп тұрмын. Фото мен қысқаша сипаттаманы сырғытып қарап, бір үлгіні таңдаңыз."
        : "Показываю готовые модели в этом бюджете. Листайте фото и краткие описания, затем выберите одну модель.",
      meta: { recommendedProducts: matched, productAction: "select", quickReplies: quickReplies(lang, ["color", "material", "budget", "catalog"]) },
    };
  }

  if (intent === "calculate" || intent === "faq_price") {
    const category = state.category ?? (productId ? undefined : "kitchen");
    const rules = await db.select().from(pricingRules);
    if (category === "wardrobe") {
      if (!state.sizeMeters) {
        return { text: lang === "kk" ? "Шкафтың шамамен бағасын есептеу үшін енін метрмен жазыңыз. Мысалы: «шкаф 2 метр»." : "Чтобы рассчитать ориентировочную цену шкафа, укажите ширину в метрах. Например: «шкаф 2 метра».", meta: { quickReplies: quickReplies(lang, ["wardrobe", "catalog"]) } };
      }
      const calculation = calculateWardrobePrice(rules, state.sizeMeters, 2.4, { slidingDoors: state.slidingDoors ?? true, delivery: state.delivery ?? true });
      const matched = await findProducts(db, state, productId);
      return {
        text: lang === "kk"
          ? `Шкаф үшін шамамен есеп: **${calculation.total.toLocaleString("kk-KZ")} ₸** (ені ${state.sizeMeters} м, биіктігі 2.4 м). Төменде ұқсас дайын үлгілер бар.`
          : `Ориентировочный расчёт шкафа: **${calculation.total.toLocaleString("ru-RU")} ₸** (ширина ${state.sizeMeters} м, высота 2.4 м). Ниже — похожие готовые модели.`,
        meta: { recommendedProducts: matched, productAction: "select", quickReplies: quickReplies(lang, ["catalog", "color", "material"]) },
      };
    }
    if (!state.sizeMeters) {
      return { text: lang === "kk" ? "Ас үйдің шамамен бағасын есептеу үшін ұзындығын метрмен жазыңыз. Мысалы: «ас үй 3 метр»." : "Чтобы рассчитать ориентировочную цену кухни, укажите длину в метрах. Например: «кухня 3 метра».", meta: { quickReplies: quickReplies(lang, ["choose", "catalog"]) } };
    }
    const calculation = calculateKitchenPrice(rules, state.sizeMeters, { delivery: state.delivery ?? true, ledMeters: state.ledMeters });
    const matched = await findProducts(db, state, productId);
    return {
      text: lang === "kk"
        ? `Ас үй үшін шамамен есеп: **${calculation.total.toLocaleString("kk-KZ")} ₸** (ұзындығы ${state.sizeMeters} м). Төменде ұқсас дайын үлгілер бар.`
        : `Ориентировочный расчёт кухни: **${calculation.total.toLocaleString("ru-RU")} ₸** (длина ${state.sizeMeters} м). Ниже — похожие готовые модели.`,
      meta: { recommendedProducts: matched, productAction: "select", quickReplies: quickReplies(lang, ["catalog", "color", "material"]) },
    };
  }

  if (intent === "faq_material") return { text: FAQ_TEXTS.material[lang], meta: { quickReplies: quickReplies(lang, ["material", "catalog"]) } };
  if (intent === "faq_delivery") return { text: FAQ_TEXTS.delivery[lang], meta: { quickReplies: quickReplies(lang, ["catalog", "color", "material"]) } };
  if (intent === "faq_install") return { text: FAQ_TEXTS.install[lang], meta: { quickReplies: quickReplies(lang, ["catalog"]) } };
  if (intent === "faq_warranty") return { text: FAQ_TEXTS.warranty[lang], meta: { quickReplies: quickReplies(lang, ["catalog"]) } };
  if (intent === "faq_leadtime") return { text: FAQ_TEXTS.leadtime[lang], meta: { quickReplies: quickReplies(lang, ["catalog"]) } };

  if (intent === "search_products" || intent === "choose_kitchen" || intent === "choose_wardrobe") {
    const category = intent === "choose_kitchen" ? "kitchen" : intent === "choose_wardrobe" ? "wardrobe" : state.category;
    const matched = await findProducts(db, { ...state, category }, productId);
    if (matched.length > 0) {
      const exactRequest = hasSpecificProductRequest(state);
      return {
        text: lang === "kk"
          ? exactRequest
            ? `Сұрауыңызға сай ${matched.length} нақты үлгі таптым. Бір үлгіні таңдаңыз — оның карточкасынан толық параметрлерін қарай аласыз.`
            : "Мына дайын үлгілерді қарап шығыңыз. Бір үлгіні таңдасаңыз, оның толық параметрлері ашылады."
          : exactRequest
            ? `По вашему точному запросу найдено ${matched.length} подходящих варианта. Выберите модель — в её карточке есть полные параметры.`
            : "Посмотрите эти готовые модели. После выбора откроется карточка с полными параметрами.",
        meta: { recommendedProducts: matched, productAction: "select", quickReplies: quickReplies(lang, ["color", "material", "price", "budget", "catalog"]) },
      };
    }
  }

  if (intent === "greeting") {
    return {
      text: lang === "kk" ? "Сәлем! Мен DERO AI — Dero Mebel цифрлық консультанттымын. Жиһаз түрін таңдаңыз, содан кейін өлшем, түс, материал және бюджет бойынша нақтылаймыз." : "Здравствуйте! Я DERO AI — цифровой консультант Dero Mebel. Выберите тип мебели, затем уточним размер, цвет, материал и бюджет.",
      meta: { quickReplies: quickReplies(lang, ["choose", "wardrobe"]) },
    };
  }

  const fallback = state.category
    ? lang === "kk"
      ? "Параметрлеріңізге сай үлгілерді көрсетемін. Каталогты ашайын ба, әлде алдымен шамамен бағаны есептейік пе?"
      : "Я покажу модели по вашим параметрам. Открыть каталог или сначала рассчитать ориентировочную цену?"
    : FALLBACK[lang];
  return { text: fallback, meta: { quickReplies: quickReplies(lang, state.category ? ["color", "material", "catalog", "price"] : ["choose", "wardrobe", "color", "material", "catalog"]) } };
}

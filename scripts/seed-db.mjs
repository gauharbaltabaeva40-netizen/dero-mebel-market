// Seed script: fills products, faqs, pricingRules, companySettings with clearly-marked mock data.
// IMPORTANT: All values below are PLACEHOLDERS (see docs/01 — everything is UNKNOWN until the
// business owner provides real data). They exist only so the MVP UI and AI tools work end-to-end.
import mysql from "mysql2/promise";
import "dotenv/config";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

await conn.query("DELETE FROM products");
await conn.query("DELETE FROM faqs");
await conn.query("DELETE FROM pricingRules");
await conn.query("DELETE FROM companySettings");

// ------------------------------------------------------------
// PRODUCTS — placeholder mock catalog (owner must replace)
// ------------------------------------------------------------
const products = [
  {
    sku: "KM-001", category: "kitchen", style: "modern",
    nameKk: "Астана — Заманауи ас үй",
    nameRu: "Астана — Современная кухня",
    descriptionKk: "Заманауи үлгідегі ас үй жиһазы. ЛДСП корпус, МДФ фасад, жұмсақ жабылатын фурнитура. Тапсырыс бойынша кез келген өлшемде жасалады. (MOCK дерек — нақты өнім ағамыздан расталады)",
    descriptionRu: "Современная кухня на заказ. Корпус из ЛДСП, фасады МДФ, фурнитура с мягким закрыванием. Изготавливаем в любых размерах по вашему замеру. (MOCK — точные характеристики подтверждаем у владельца бизнеса)",
    material: "ЛДСП / МДФ", facade: "МДФ, матовый", colors: ["Ақ / Белый", "Сұр / Серый", "Бежевый"],
    photoUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
    widthMm: 3000, heightMm: 2400, depthMm: 600, basePriceKzt: 140000, priceUnit: "per_meter",
    features: ["Soft-close фурнитура", "LED жарықтандыру опциясы", "Тапсырыс бойынша өлшем", "12 ай кепілдік"],
    leadTimeDays: 25,
  },
  {
    sku: "KM-002", category: "kitchen", style: "classic",
    nameKk: "Классика — Классикалық ас үй",
    nameRu: "Классика — Классическая кухня",
    descriptionKk: "Классикалық стильдегі ас үй. Массив ағаш фасад, патиналы өңдеу. Үлкен отбасына арналған кеңістік. (MOCK дерек)",
    descriptionRu: "Кухня в классическом стиле. Фасады из массива дерева, патинированная отделка. Просторное решение для большой семьи. (MOCK)",
    material: "Массив / МДФ", facade: "Массив, патина", colors: ["Жіңішке қоңыр / Венге", "Бежевый", "Жасыл / Оливковый"],
    photoUrl: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=1200&q=80",
    widthMm: 3600, heightMm: 2400, depthMm: 600, basePriceKzt: 190000, priceUnit: "per_meter",
    features: ["Массив фасад", "Декоративті карниз", "Blum фурнитура", "12 ай кепілдік"],
    leadTimeDays: 35,
  },
  {
    sku: "KM-003", category: "kitchen", style: "minimalist",
    nameKk: "Минимал — Минималистік ас үй",
    nameRu: "Минимал — Кухня в стиле минимализм",
    descriptionKk: "Минимализм стиліндегі таза сызықты ас үй. Gola профилі, тұтқасыз фасад. (MOCK дерек)",
    descriptionRu: "Лаконичная кухня в стиле минимализм. Профиль Gola, фасады без ручек. (MOCK)",
    material: "МДФ", facade: "МДФ, без ручек", colors: ["Ақ / Белый", "Қара / Черный", "Сұр / Серый"],
    photoUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=80",
    widthMm: 2800, heightMm: 2400, depthMm: 600, basePriceKzt: 160000, priceUnit: "per_meter",
    features: ["Тұтқасыз фасад", "Gola профиль", "Интеграцияланған техника", "12 ай кепілдік"],
    leadTimeDays: 25,
  },
  {
    sku: "KM-004", category: "kitchen", style: "loft",
    nameKk: "Лофт — Индустриялық ас үй",
    nameRu: "Лофт — Кухня в стиле лофт",
    descriptionKk: "Лофт стиліндегі ас үй. Металл + ағаш текстурасы, қара металл элементтер. (MOCK дерек)",
    descriptionRu: "Кухня в стиле лофт. Текстура металл + дерево, чёрные металлические акценты. (MOCK)",
    material: "ЛДСП / металл", facade: "ЛДСП под бетон", colors: ["Бетон", "Қара / Черный", "Жылы ағаш"],
    photoUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    widthMm: 3200, heightMm: 2400, depthMm: 600, basePriceKzt: 170000, priceUnit: "per_meter",
    features: ["Металл акценттер", "Ашық сөрелер", "Барлық өлшемде жасалады", "12 ай кепілдік"],
    leadTimeDays: 28,
  },
  {
    sku: "SH-001", category: "wardrobe", style: "modern",
    nameKk: "Слайд — Сырғымалы есікті гардероб",
    nameRu: "Слайд — Гардероб с раздвижными дверями",
    descriptionKk: "Сырғымалы есікті кең гардероб. Екі бөлім, ішкі сөрелер мен киім ілгіштер. (MOCK дерек)",
    descriptionRu: "Просторный гардероб с раздвижными дверями. Две секции, внутренние полки и штанги. (MOCK)",
    material: "ЛДСП", facade: "ЛДСП / зеркало", colors: ["Сонма-ағаш / Дуб сонома", "Ақ", "Сұр"],
    photoUrl: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=1200&q=80",
    widthMm: 2400, heightMm: 2400, depthMm: 600, basePriceKzt: 95000, priceUnit: "per_m2",
    features: ["Сырғымалы есік", "Зеркало опциясы", "Ішкі конфигурация таңдау", "12 ай кепілдік"],
    leadTimeDays: 20,
  },
  {
    sku: "SH-002", category: "wardrobe", style: "minimalist",
    nameKk: "Лайн — Сызықты гардероб",
    nameRu: "Лайн — Линейный шкаф-купе",
    descriptionKk: "Минималистік сызықты шкаф-купе. Үш бөлім, толық жабдықталған іші. (MOCK дерек)",
    descriptionRu: "Минималистичный линейный шкаф-купе. Три секции, полная внутренняя комплектация. (MOCK)",
    material: "МДФ / ЛДСП", facade: "МДФ матовый", colors: ["Ақ", "Графит", "Бежевый"],
    photoUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80",
    widthMm: 3000, heightMm: 2400, depthMm: 600, basePriceKzt: 90000, priceUnit: "per_m2",
    features: ["3 секция", "Пантограф опциясы", "LED ішкі жарық", "12 ай кепілдік"],
    leadTimeDays: 20,
  },
  {
    sku: "SH-003", category: "wardrobe", style: "classicModern",
    nameKk: "Премиум — Классикалық гардероб",
    nameRu: "Премиум — Классический гардероб",
    descriptionKk: "Классикалық үлгідегі гардероб, распашной есікпен. Премиум фурнитура. (MOCK дерек)",
    descriptionRu: "Гардероб в классическом стиле с распашными дверями. Премиальная фурнитура. (MOCK)",
    material: "Массив / МДФ", facade: "МДФ, филёнка", colors: ["Жіңішке қоңыр", "Ақ + алтын", "Крем"],
    photoUrl: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=1200&q=80",
    widthMm: 2800, heightMm: 2400, depthMm: 600, basePriceKzt: 120000, priceUnit: "per_m2",
    features: ["Распашной есік", "Премиум фурнитура", "Ішкі шам", "12 ай кепілдік"],
    leadTimeDays: 30,
  },
];

for (const p of products) {
  await conn.query(
    `INSERT INTO products (sku, category, style, nameKk, nameRu, descriptionKk, descriptionRu,
     material, facade, colors, photoUrl, widthMm, heightMm, depthMm, basePriceKzt, priceUnit,
     features, leadTimeDays) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [p.sku, p.category, p.style, p.nameKk, p.nameRu, p.descriptionKk, p.descriptionRu,
     p.material, p.facade, JSON.stringify(p.colors), p.photoUrl, p.widthMm, p.heightMm, p.depthMm,
     p.basePriceKzt, p.priceUnit, JSON.stringify(p.features), p.leadTimeDays],
  );
}

// ------------------------------------------------------------
// FAQ — verified-style placeholder answers (owner must confirm)
// ------------------------------------------------------------
const faqs = [
  ["company", "Сіздер кімсіз? Компания туралы", "Кто вы? О компании",
   "Біз — Dero Mebel. Астанада ас үй жиһаздары мен шкафтарды өз өндірісімізде жасаймыз және орнатамыз. (MOCK: нақты ақпарат ағамыздан расталады)",
   "Мы — Dero Mebel. Изготавливаем и устанавливаем кухни и шкафы в собственном производстве в Астане. (MOCK)"],
  ["products", "Тапсырыс бойынша жасайсыздар ма?", "Делаете на заказ?",
   "Иә, барлық жиһаз тапсырыс берушінің өлшемдері бойынша жасалады. Дайын үлгілер каталогта — өлшем, түс, материал өзгереді. (MOCK)",
   "Да, вся мебель изготавливается по размерам заказчика. Примеры в каталоге — размер, цвет и материал меняются под вас. (MOCK)"],
  ["materials", "Қандай материалдар қолданасыздар?", "Какие материалы используете?",
   "Негізгі материалдар: ЛДСП (корпус), МДФ (фасад), массив ағаш (премиум). Фурнитура: Blum және аналогтары. Нақты тізім менеджерден. (MOCK)",
   "Основные материалы: ЛДСП (корпус), МДФ (фасады), массив (премиум). Фурнитура: Blum и аналоги. Точный список у менеджера. (MOCK)"],
  ["price", "Баға қалай есептеледі?", "Как считается цена?",
   "Ас үй: ұзындық (метр) × баға, + орнату + жеткізу. Шкаф: ауданы (м²) × баға. Нақты формула — AI калькулятор немесе менеджер. (MOCK ережелер)",
   "Кухня: длина (метры) × ставка + установка + доставка. Шкаф: площадь (м²) × ставка. Точная формула — в AI-калькуляторе или у менеджера. (MOCK)"],
  ["ordering", "Қалай тапсырыс беруге болады?", "Как сделать заказ?",
   "4 қадам: 1) AI-дан немесе форма арқылы заявка; 2) өлшем алу; 3) дизайн/эскиз; 4) өндіріс және монтаж. (MOCK процесс)",
   "4 шага: 1) заявка через AI или форму; 2) замер; 3) дизайн/эскиз; 4) производство и монтаж. (MOCK процесс)"],
  ["payment", "Қалай төлеуге болады?", "Как можно оплатить?",
   "Нақты төлем түрлері (Kaspi, банк, бөліп төлеу) ағамыздан расталатын болады. Қазіргі кезде: белгісіз — менеджерден сұраңыз. (МОЙ/UNKNOWN)",
   "Точные способы оплаты (Kaspi, банк, рассрочка) подтвердим у владельца бизнеса. Пока: неизвестно — уточните у менеджера. (МОЙ/UNKNOWN)"],
  ["delivery", "Жеткізу қанша тұрады?", "Сколько стоит доставка?",
   "Астана қаласы ішінде жеткізу — нақты тариф ағамыздан расталады (MOCK ереже: базалық тариф pricing rules-те). Қала сыртында — қашықтық бойынша.",
   "По Астане — точный тариф подтвердим у владельца (MOCK: базовая ставка в pricing rules). За город — по расстоянию."],
  ["installation", "Орнату (монтаж) бар ма?", "Есть ли установка?",
   "Иә, біздің монтаж бригадасы орнатады. Орнату бағасы баға формуласына кіреді. (MOCK ереже)",
   "Да, устанавливает наша монтажная бригада. Стоимость установки входит в формулу цены. (MOCK)"],
  ["warranty", "Кепілдік бар ма?", "Есть ли гарантия?",
   "Кепілдік мерзімі ағамыздан расталатын болады (моделде 12 ай деп көрсетілген — MOCK). Нақты шарттар менеджерден.",
   "Срок гарантии подтвердим у владельца (в модели указано 12 мес. — MOCK). Точные условия у менеджера."],
  ["custom", "Өлшем алу тегін бе?", "Замер бесплатный?",
   "Өлшем алу қызметінің бағасы ағамыздан расталатын болады (UNKNOWN). Менеджерден сұраңыз.",
   "Стоимость замера подтвердим у владельца (UNKNOWN). Уточните у менеджера."],
];

for (const [category, qKk, qRu, aKk, aRu] of faqs) {
  await conn.query(
    `INSERT INTO faqs (questionKk, questionRu, answerKk, answerRu, category, keywords)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [qKk, qRu, aKk, aRu, category, qKk.toLowerCase() + " " + qRu.toLowerCase()],
  );
}

// ------------------------------------------------------------
// PRICING RULES — placeholder formula values (owner must provide real ones)
// KITCHEN: total = length_m * base_rate + length_m * install_rate + delivery (+ addons)
// WARDROBE: total = (w * h) * base_rate + sliding surcharge + install_fixed + delivery
// ------------------------------------------------------------
const rules = [
  ["kitchen", "base_rate_per_meter", 140000, "Базалық баға: 1 метр кухня (MOCK — нақты ағаңыздан)"],
  ["kitchen", "install_rate_per_meter", 8000, "Орнату: 1 метрге (MOCK)"],
  ["kitchen", "delivery_astana", 15000, "Астана ішінде жеткізу (MOCK)"],
  ["kitchen", "delivery_out_of_city_per_km", 300, "Қала сыртында: ₸/км (MOCK)"],
  ["kitchen", "addon_led_per_meter", 4000, "LED жарықтандыру: ₸/метр (MOCK)"],
  ["kitchen", "minimum_order", 300000, "Минималды тапсырыс (MOCK)"],
  ["wardrobe", "base_rate_per_m2", 95000, "Базалық баға: 1 м² шкаф (MOCK)"],
  ["wardrobe", "sliding_surcharge_per_m2", 12000, "Сырғымалы есік үстемесі: ₸/м² (MOCK)"],
  ["wardrobe", "install_fixed", 20000, "Шкаф орнату: тұрақты (MOCK)"],
  ["wardrobe", "delivery_astana", 10000, "Астана ішінде жеткізу (MOCK)"],
  ["wardrobe", "delivery_out_of_city_per_km", 300, "Қала сыртында: ₸/км (MOCK)"],
  ["wardrobe", "minimum_order", 150000, "Минималды тапсырыс (MOCK)"],
];

for (const [type, key, value, desc] of rules) {
  await conn.query(
    `INSERT INTO pricingRules (productType, ruleKey, value, description) VALUES (?, ?, ?, ?)`,
    [type, key, value, desc],
  );
}

// ------------------------------------------------------------
// COMPANY SETTINGS — placeholders (owner must fill)
// ------------------------------------------------------------
const settings = [
  ["company_name", "Dero Mebel", "Компания атауы"],
  ["city", "Астана, Қазақстан", "Қала"],
  ["phone", "UNKNOWN", "Телефон (ағамыздан алу керек)"],
  ["whatsapp", "UNKNOWN", "WhatsApp"],
  ["instagram", "UNKNOWN", "Instagram"],
  ["kaspi", "UNKNOWN", "Kaspi сілтемесі"],
  ["address", "UNKNOWN", "Шоурум мекенжайы"],
  ["working_hours", "UNKNOWN", "Жұмыс уақыты"],
  ["manager_contact", "UNKNOWN", "Менеджер байланысы"],
  ["pricing_note", "Барлық бағалар — MOCK. Нақты баға формуласын бизнес иесі растағанша AI 'шамамен' деп қана айтады.", "Pricing disclaimer"],
];

for (const [key, value, desc] of settings) {
  await conn.query(
    `INSERT INTO companySettings (\`key\`, value, description) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE value = VALUES(value)`,
    [key, value, desc],
  );
}

console.log("Seed complete: products, faqs, pricingRules, companySettings inserted.");
process.exit(0);
